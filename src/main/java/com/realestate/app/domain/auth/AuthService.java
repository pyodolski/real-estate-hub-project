package com.realestate.app.domain.auth;

import com.realestate.app.domain.auth.dto.*;
import com.realestate.app.domain.auth.jwt.JwtTokenProvider;
import com.realestate.app.domain.broker_profile.BrokerProfile;
import com.realestate.app.domain.broker_profile.BrokerProfileRepository;
import com.realestate.app.domain.user.User;
import com.realestate.app.domain.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final UserRepository userRepo;
    private final BrokerProfileRepository brokerRepo;
    private final RefreshTokenRepository rtRepo;
    private final PasswordEncoder encoder;
    private final JwtTokenProvider jwt;
    private final PasswordResetTokenRepository prtRepo;
    private final PasswordResetMailer resetMailer;

    public void signup(SignupRequest req) {
        if (userRepo.existsByEmail(req.email()))
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");

        User user = User.builder()
                .email(req.email())
                .username(req.username())
                .passwordHash(encoder.encode(req.password()))
                .roleId(req.role()) // "regular" | "broker" | "admin"
                .isActive(true)
                .intro(req.intro())
                .profileImageUrl(req.profileImageUrl())
                .phoneNumber(req.phoneNumber())
                .propertyCnt(0)
                .build();

        user = userRepo.save(user);

        if ("broker".equalsIgnoreCase(user.getRoleId())) {
            BrokerProfile bp = BrokerProfile.builder()
                    .user(user)
                    .licenseNumber(req.licenseNumber())
                    .agencyName(req.agencyName())
                    .intro(req.intro())
                    .profileImageUrl(req.profileImageUrl())
                    .build();
            brokerRepo.save(bp);
        }
    }

    public TokenResponse login(LoginRequest req) {
        User user = userRepo.findByEmailAndIsActive(req.email(), true)
                .orElseThrow(() -> new IllegalArgumentException("이메일 또는 비밀번호가 올바르지 않습니다."));
        if (!encoder.matches(req.password(), user.getPasswordHash()))
            throw new IllegalArgumentException("이메일 또는 비밀번호가 올바르지 않습니다.");

        String access = jwt.createAccessToken(user);

        boolean remember = Boolean.TRUE.equals(req.rememberMe());
        long days = remember ? 30 : 14;
        String refresh = UUID.randomUUID().toString();

        RefreshToken rt = RefreshToken.builder()
                .user(user)
                .token(refresh)
                .expiresAt(LocalDateTime.now().plusDays(days))
                .revoked(false)
                .build();
        rtRepo.save(rt);

        return new TokenResponse(access, refresh, 3600L);
    }

    public void logout(Long userId, String refreshToken) {
        rtRepo.findByToken(refreshToken)
                .filter(rt -> rt.getUser().getId().equals(userId))
                .ifPresent(rt -> rt.setRevoked(true));
    }

    public TokenResponse refresh(String refreshToken) {
        RefreshToken rt = rtRepo.findByToken(refreshToken)
                .filter(r -> !r.isRevoked() && r.getExpiresAt().isAfter(LocalDateTime.now()))
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 리프레시 토큰"));

        String newAccess = jwt.createAccessToken(rt.getUser());
        return new TokenResponse(newAccess, refreshToken, 3600);
    }

    // 비밀번호 찾기 시작: 토큰 발급 + 링크 로그 출력
    public void requestPasswordReset(ForgotPasswordRequest req, String appBaseUrl) {
        var userOpt = userRepo.findByEmail(req.email());
        // 보안상 존재/부재를 응답으로 노출하지 않는 것이 일반적
        if (userOpt.isEmpty()) return;

        var user = userOpt.get();

        // 기존 토큰 정리(선택)
        prtRepo.deleteByUserId(user.getId());

        String token = java.util.UUID.randomUUID().toString();
        var prt = PasswordResetToken.builder()
                .user(user)
                .token(token)
                .expiresAt(LocalDateTime.now().plusHours(1)) // 유효시간 1시간
                .used(false)
                .build();
        prtRepo.save(prt);

        String resetUrl = appBaseUrl + "/reset-password?token=" + token; // 프론트 URL or API용 URL
        resetMailer.sendResetLink(user.getEmail(), resetUrl);
    }

    // 토큰 검증 후 비밀번호 변경
    public void resetPassword(ResetPasswordRequest req) {
        var prt = prtRepo.findByToken(req.token())
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 토큰입니다."));

        if (prt.isExpired() || prt.isUsed()) {
            throw new IllegalArgumentException("토큰이 만료되었거나 이미 사용되었습니다.");
        }

        var user = prt.getUser();
        user.setPasswordHash(encoder.encode(req.newPassword()));
        // 토큰 1회성 처리
        prt.markUsed();
    }
}
