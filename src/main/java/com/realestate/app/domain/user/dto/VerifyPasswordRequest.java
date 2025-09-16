package com.realestate.app.domain.user.dto;

import jakarta.validation.constraints.NotBlank;

public record VerifyPasswordRequest(@NotBlank String currentPassword) {}
