package com.realestate.app.domain.property.dto;

import com.realestate.app.domain.property.table.PropertyOffer;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDate;

@Builder
public record PropertyOfferResponse(
        Long id,
        Long propertyId,
        PropertyOffer.OfferType2 housetype,
        PropertyOffer.OfferType type,
        BigDecimal floor,
        String oftion,
        BigDecimal totalPrice,
        BigDecimal deposit,
        BigDecimal monthlyRent,
        BigDecimal maintenanceFee,
        Boolean negotiable,
        LocalDate availableFrom,
        Boolean isActive
) {
    public static PropertyOfferResponse from(PropertyOffer offer) {
        return PropertyOfferResponse.builder()
                .id(offer.getId())
                .propertyId(offer.getProperty().getId())
                .housetype(offer.getHousetype())
                .type(offer.getType())
                .floor(offer.getFloor())
                .oftion(offer.getOftion())
                .totalPrice(offer.getTotalPrice())
                .deposit(offer.getDeposit())
                .monthlyRent(offer.getMonthlyRent())
                .maintenanceFee(offer.getMaintenanceFee())
                .negotiable(offer.getNegotiable())
                .availableFrom(offer.getAvailableFrom())
                .isActive(offer.getIsActive())
                .build();
    }
}
