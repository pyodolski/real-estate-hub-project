package com.realestate.app.domain.delegation.dto;

import com.realestate.app.domain.property.dto.PropertyOfferCreateRequest;

public record CreateDelegationRequest(
        Long brokerUserId,
        PropertyOfferCreateRequest offer
) {}