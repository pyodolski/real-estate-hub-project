package com.realestate.app.domain.property.dto;

import com.realestate.app.domain.property.table.PropertyOffer;

import java.math.BigDecimal;
import java.time.LocalDate;

public record UpdateOfferRequest(
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
) {}
