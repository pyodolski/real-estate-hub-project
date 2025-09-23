package com.realestate.app.domain.delegation.dto;

import com.realestate.app.domain.delegation.BrokerDelegationRequest.Status;

public record DelegationResponse(
        Long id,
        Long propertyId,
        Long ownerId,
        Long brokerUserId,
        Status status,
        String rejectReason
) {}
