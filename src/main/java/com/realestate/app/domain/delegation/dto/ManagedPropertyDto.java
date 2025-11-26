package com.realestate.app.domain.delegation.dto;


import com.realestate.app.domain.property.table.Property;

import java.math.BigDecimal;

public record ManagedPropertyDto(
        Long id,
        String title,
        String address,
        BigDecimal areaM2,
        Integer buildingYear,
        Property.Status status,
        Property.ListingType listingType
) {
    public static ManagedPropertyDto from(Property p) {
        return new ManagedPropertyDto(
                p.getId(),
                p.getTitle(),
                p.getAddress(),
                p.getAreaM2(),
                p.getBuildingYear(),
                p.getStatus(),
                p.getListingType()
        );
    }
}