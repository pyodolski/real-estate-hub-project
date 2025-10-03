package com.realestate.app.domain.property.dto;

import com.realestate.app.domain.property.table.PropertyOffer;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDate;

@Builder
public record PropertyOfferDto(
        Long id,
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
    public static PropertyOfferDto from(PropertyOffer offer) {
        if (offer == null) {
            return null;
        }
        return PropertyOfferDto.builder()
                .id(offer.getId())
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
