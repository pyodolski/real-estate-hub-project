package com.realestate.app.domain.property.dto;

import com.realestate.app.domain.property.table.Property;

public record BrokerMapPropertyDto(
        Long id,
        String title,
        String address,
        Double locationX,
        Double locationY,
        Property.Status status
) {
    public static BrokerMapPropertyDto from(Property p) {
        return new BrokerMapPropertyDto(
                p.getId(),
                p.getTitle(),
                p.getAddress(),
                p.getLocationX(),
                p.getLocationY(),
                p.getStatus()
        );
    }
}
