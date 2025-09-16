package com.realestate.app.domain.user.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateProfileRequest(
        String username,
        String phoneNumber,
        String intro,
        String profileImageUrl,
        // broker 전용
        String licenseNumber,
        String agencyName,
        @NotBlank String currentPassword
) {}
