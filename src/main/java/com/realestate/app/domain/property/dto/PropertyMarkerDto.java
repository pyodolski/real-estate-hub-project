package com.realestate.app.domain.property.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PropertyMarkerDto(
        Long id, String title, String address, BigDecimal price,
        String status, Double lat, Double lng
) {}