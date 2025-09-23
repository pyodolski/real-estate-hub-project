package com.realestate.app.domain.preference.api.dto;

import com.realestate.app.domain.preference.ComparisonItem;
import com.realestate.app.domain.property.table.Property;

import java.math.BigDecimal;

public record ItemResponse(
        Long propertyId,
        String title,
        String address,
        BigDecimal price,
        BigDecimal areaM2,
        BigDecimal unitPrice,   // 계산값: price / areaM2
        Integer buildingYear
) {
    public static ItemResponse from(ComparisonItem i) {
        Property p = i.getProperty();
        BigDecimal unit = null;
        if (p.getPrice() != null && p.getAreaM2() != null && p.getAreaM2().doubleValue() > 0) {
            unit = p.getPrice().divide(p.getAreaM2(), java.math.MathContext.DECIMAL64);
        }
        return new ItemResponse(
                p.getId(),
                p.getTitle(),
                p.getAddress(),
                p.getPrice(),
                p.getAreaM2(),
                unit,
                p.getBuildingYear()
        );
    }
}
