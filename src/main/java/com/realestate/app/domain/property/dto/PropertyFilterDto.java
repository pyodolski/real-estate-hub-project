package com.realestate.app.domain.property.dto;

import java.math.BigDecimal;


public record PropertyFilterDto(
        Long id,
        Long propertyId,
        String houseType,
        String offerType,
        Integer floor,
        String oftion,           // bit(10) -> 드라이버가 "1010..." 문자열로 줄 수 있음
        BigDecimal totalPrice,
        BigDecimal deposit,
        BigDecimal monthlyRent,
        String title,
        String address,
        Integer area,
        Double lat,
        Double lng
) {}
