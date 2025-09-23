package com.realestate.app.domain.broker_profile.dto;

public record BrokerDetailResponse(
        Long userId,
        String username,
        String agencyName,
        String licenseNumber,
        String profileImageUrl,
        String intro,
        String phoneNumber,
        Integer totalDeals,
        Integer pendingDeals
) {}
