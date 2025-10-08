package com.realestate.app.domain.delegation.dto;

import com.realestate.app.domain.delegation.BrokerDelegationRequest.Status;
import com.realestate.app.domain.property.dto.PropertyOfferDto;

public record DelegationResponse(
        Long id,
        Long propertyId,
        String propertyTitle,
        String propertyAddress,
        Long ownerId,
        String ownerName,
        Long brokerUserId,
        String brokerName,
        Status status,
        String rejectReason,
        PropertyOfferDto offer,
        Double locationX,
        Double locationY
) {}