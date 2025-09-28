package com.realestate.app.domain.broker_profile.dto;

public record BrokerListItemResponse(
        Long userId,
        String username,
        String agencyName,
        String licenseNumber,
        String profileImageUrl,
        Integer totalDeals,
        Integer pendingDeals
) {}
