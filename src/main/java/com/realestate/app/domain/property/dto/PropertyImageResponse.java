package com.realestate.app.domain.property.dto;

public record PropertyImageResponse(
        Long id,
        String imageUrl
) {
    public static PropertyImageResponse from(com.realestate.app.domain.property.table.PropertyImage img) {
        return new PropertyImageResponse(
                img.getId(),
                img.getImageUrl()
        );
    }
}
