package com.realestate.app.domain.property.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record PropertyWithOffersDto(
        Long id,
        String title,
        String address,
        BigDecimal price,
        BigDecimal areaM2,
        String status,        // Property.Status
        String listingType,   // Property.ListingType
        Long ownerId,
        Long brokerUserId,
        Long claimId,
        String regionCode,
        Double locationX,
        Double locationY,
        Integer buildingYear,
        Boolean anomalyAlert,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,

        List<OfferDto> offers
) {
    public record OfferDto(
            Long id,
            String housetype,      // PropertyOffer.OfferType2
            String type,           // PropertyOffer.OfferType
            BigDecimal floor,
            String oftion,
            BigDecimal totalPrice,
            BigDecimal deposit,
            BigDecimal monthlyRent,
            BigDecimal maintenanceFee,
            Boolean negotiable,
            LocalDate availableFrom,
            Boolean isActive,
            LocalDateTime createdAt,
            LocalDateTime updatedAt
    ) {}
}