package com.realestate.app.domain.property.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.realestate.app.domain.property.table.PropertyOffer.OfferType;
import com.realestate.app.domain.property.table.PropertyOffer.OfferType2;

import java.math.BigDecimal;
import java.time.LocalDate;

public record PropertyOfferCreateRequest(
        OfferType2 housetype,
        OfferType  type,
        BigDecimal floor,
        @JsonProperty("option") String oftion, // JSON "option" → 엔티티 "oftion"
        BigDecimal totalPrice,
        BigDecimal deposit,
        BigDecimal monthlyRent,
        BigDecimal maintenanceFee,
        Boolean negotiable,
        LocalDate availableFrom,
        Boolean isActive
) {}