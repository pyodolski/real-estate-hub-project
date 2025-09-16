package com.realestate.app.domain.auth.dto;

import jakarta.validation.constraints.*;

public record SignupRequest(
        @NotBlank @Email String email,
        @NotBlank String username,
        @NotBlank @Size(min=8, max=64) String password,
        @NotBlank String role,              // "regular" | "broker" | "admin"
        String phoneNumber,
        String intro,
        String profileImageUrl,
        // broker 전용
        String licenseNumber,
        String agencyName
) {}
