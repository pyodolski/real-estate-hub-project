package com.realestate.app.domain.user.service;

import com.realestate.app.domain.user.entity.Tag;
import com.realestate.app.domain.user.entity.User;
import com.realestate.app.domain.user.entity.UserTag;
import com.realestate.app.domain.user.repository.TagRepository;
import com.realestate.app.domain.user.repository.UserRepository;
import com.realestate.app.domain.user.repository.UserTagRepository;


import com.realestate.app.domain.auth.dto.UserResponse;
import com.realestate.app.domain.auth.dto.TagSelection;
import com.realestate.app.domain.user.dto.ChangePasswordRequest;
import com.realestate.app.domain.broker_profile.BrokerProfile;
import com.realestate.app.domain.broker_profile.BrokerProfileRepository;
import com.realestate.app.domain.user.dto.UpdateProfileRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepo;
    private final BrokerProfileRepository brokerRepo;
    private final PasswordEncoder encoder;
    private final TagRepository tagRepository;
    private final UserTagRepository userTagRepository;

    private static final int MAX_TAGS_PER_USER = 30;
    private static final int MAX_GROUP_LEN = 64;
    private static final int MAX_KEY_LEN   = 64;
    private static final int MAX_LABEL_LEN = 128;

    @Transactional(readOnly = true)
    public com.realestate.app.domain.auth.dto.UserResponse getMyProfileDto(Long userId) {
        User u = userRepo.findByIdWithTags(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        var simpleTags = (u.getUserTags()==null? java.util.List.<UserTag>of() : u.getUserTags())
                .stream()
                .map(ut -> new com.realestate.app.domain.auth.dto.UserResponse.SimpleTag(
                        ut.getTag().getGroupCode(),
                        ut.getTag().getKeyCode(),
                        ut.getTag().getLabel()))
                .toList();

        return new com.realestate.app.domain.auth.dto.UserResponse(
                u.getId(), u.getEmail(), u.getUsername(), u.getRoleId(),
                u.getPhoneNumber(), u.getIntro(), u.getProfileImageUrl(),
                simpleTags
        );
    }

    @Transactional(readOnly = true)
    public User getMyProfile(Long userId) {
        return userRepo.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
    }

    public void verifyPassword(Long userId, String currentPassword) {
        User user = getMyProfile(userId);
        if (!encoder.matches(currentPassword, user.getPasswordHash())) {
            throw new IllegalArgumentException("현재 비밀번호가 일치하지 않습니다.");
        }
    }

    public UserResponse updateProfile(Long userId, UpdateProfileRequest req) {
        User user = getMyProfile(userId);

        // 비번 확인(지금 로직 유지)
        if (!encoder.matches(req.currentPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("현재 비밀번호가 일치하지 않습니다.");
        }

        // 전화번호 업데이트
        if (req.phoneNumber() != null && !req.phoneNumber().isBlank()) {
            user.setPhoneNumber(req.phoneNumber().trim());
        }

        // 사진/소개
        if (StringUtils.hasText(req.profileImageUrl())) {
            user.setProfileImageUrl(req.profileImageUrl());
        }
        if (req.intro() != null) {
            user.setIntro(req.intro());
        }

        // ===== 태그 교체 =====
        if (req.tags() != null) {
            // 1) DB에서 먼저 깨끗하게 삭제 (유니크 충돌 방지)
            userTagRepository.deleteAllByUserId(userId);

            // 2) 메모리 컬렉션도 초기화
            if (user.getUserTags() == null) user.setUserTags(new java.util.HashSet<>());
            else user.getUserTags().clear();

            // 3) 요청 중복 제거 (groupCode|keyCode 기준)
            java.util.Map<String, TagSelection> uniq = new java.util.LinkedHashMap<>();
            for (var ts : req.tags()) {
                if (ts == null) continue;
                String g = safe(ts.groupCode(), 64);
                String k = safe(ts.keyCode(),   64);
                String l = safe(ts.label(),    128);
                if (g.isBlank() || k.isBlank()) continue;
                uniq.putIfAbsent(g + "|" + k, new TagSelection(g, k, l));
            }

            // 4) 태그 확보(없으면 생성) 후 연결
            for (var sel : uniq.values()) {
                Tag tag = tagRepository.findByGroupCodeAndKeyCode(sel.groupCode(), sel.keyCode())
                        .orElseGet(() -> tagRepository.save(
                                Tag.builder()
                                        .groupCode(sel.groupCode())
                                        .keyCode(sel.keyCode())
                                        .label( (sel.label()==null || sel.label().isBlank()) ? sel.keyCode() : sel.label())
                                        .isActive(true)
                                        .build()
                        ));
                user.getUserTags().add(UserTag.builder().user(user).tag(tag).build());
            }
        }

        // 응답 DTO 빌드 (그대로)
        var simpleTags = (user.getUserTags()==null? java.util.List.<UserTag>of() : user.getUserTags())
                .stream()
                .map(ut -> new com.realestate.app.domain.auth.dto.UserResponse.SimpleTag(
                        ut.getTag().getGroupCode(),
                        ut.getTag().getKeyCode(),
                        ut.getTag().getLabel()))
                .toList();

        return new com.realestate.app.domain.auth.dto.UserResponse(
                user.getId(),
                user.getEmail(),
                user.getUsername(),
                user.getRoleId(),
                user.getPhoneNumber(),
                user.getIntro(),
                user.getProfileImageUrl(),
                simpleTags
        );
    }

    // ✅ 비밀번호 변경은 별도 메서드
    public void changePassword(Long userId, ChangePasswordRequest req) {
        User user = getMyProfile(userId);
        if (!encoder.matches(req.currentPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("현재 비밀번호가 올바르지 않습니다.");
        }
        if (encoder.matches(req.newPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("이전과 동일한 비밀번호는 사용할 수 없습니다.");
        }
        user.setPasswordHash(encoder.encode(req.newPassword()));

        // (선택) 리프레시 토큰 무효화하고 재로그인 요구하려면 여기서 처리
        // refreshTokenRepository.deleteByUserId(userId);
    }

    private static String safe(String s, int max) {
        if (s == null) return "";
        String t = s.trim();
        return t.length() > max ? t.substring(0, max) : t;
    }

    @Value("${app.profile-image-dir:uploads/profile-images}")
    private String profileImageDir;

    /**
     * 프로필 이미지 업로드 후 접근 가능한 URL 반환
     */
    public String uploadProfileImage(Long userId, MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("업로드할 파일이 없습니다.");
        }

        // 확장자
        String original = file.getOriginalFilename();
        String ext = "";
        if (original != null && original.contains(".")) {
            ext = original.substring(original.lastIndexOf("."));
        }

        // 파일명: user-<id>-<uuid>.<ext>
        String filename = "user-" + userId + "-" + UUID.randomUUID() + ext;

        Path dirPath = Paths.get(profileImageDir).toAbsolutePath().normalize();
        Files.createDirectories(dirPath);

        Path target = dirPath.resolve(filename);

        file.transferTo(target.toFile());

        // 브라우저가 접근할 URL (WebConfig랑 세트)
        return "/files/profile-images/" + filename;
    }
}