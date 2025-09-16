package com.realestate.app.domain.auth.dto;

public record TokenResponse(
        String accessToken,
        String refreshToken,
        long   expiresInSeconds
) {}
