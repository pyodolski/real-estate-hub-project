package com.realestate.app.domain.user;

import com.realestate.app.domain.broker_profile.BrokerProfile;
import com.realestate.app.domain.broker_profile.BrokerProfileRepository;
import com.realestate.app.domain.user.dto.UpdateProfileRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepo;
    private final BrokerProfileRepository brokerRepo;
    private final PasswordEncoder encoder;

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

    public void updateProfile(Long userId, UpdateProfileRequest req) {
        User user = getMyProfile(userId);

        if (!encoder.matches(req.currentPassword(), user.getPasswordHash()))
            throw new IllegalArgumentException("현재 비밀번호가 일치하지 않습니다.");

        if (StringUtils.hasText(req.username())) user.setUsername(req.username());
        if (StringUtils.hasText(req.phoneNumber())) user.setPhoneNumber(req.phoneNumber());
        if (req.intro() != null) user.setIntro(req.intro());
        if (req.profileImageUrl() != null) user.setProfileImageUrl(req.profileImageUrl());

        if ("broker".equalsIgnoreCase(user.getRoleId())) {
            BrokerProfile bp = brokerRepo.findByUserId(userId).orElseGet(() -> {
                BrokerProfile n = new BrokerProfile();
                n.setUser(user);
                return n;
            });
            if (StringUtils.hasText(req.licenseNumber())) bp.setLicenseNumber(req.licenseNumber());
            if (StringUtils.hasText(req.agencyName())) bp.setAgencyName(req.agencyName());
            brokerRepo.save(bp);
        }
    }
}
