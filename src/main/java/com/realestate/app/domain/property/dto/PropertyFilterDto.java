package com.realestate.app.domain.property.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record PropertyFilterDto(
        Long id,Long propertyid, String housetype, String type, BigDecimal floor, String oftion, BigDecimal totalPrice,
        BigDecimal deposit, BigDecimal monthlyRent, BigDecimal maintenanceFee, Boolean negotiable, LocalDate availableFrom,
        Boolean isActive, LocalDateTime createdAt, LocalDateTime updatedAt
) {}

