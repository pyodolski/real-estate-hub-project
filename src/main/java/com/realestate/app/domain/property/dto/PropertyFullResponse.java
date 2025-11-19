package com.realestate.app.domain.property.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.realestate.app.domain.property.table.Property;
import com.realestate.app.domain.property.table.PropertyImage;
import com.realestate.app.domain.property.table.PropertyOffer;

import java.math.BigDecimal;
import java.util.List;

public record PropertyFullResponse(
        Long id,
        String title,
        String address,
        BigDecimal price,

        @JsonProperty("area_m2")
        BigDecimal areaM2,

        @JsonProperty("location_x")
        Double locationX,

        @JsonProperty("location_y")
        Double locationY,

        @JsonProperty("building_year")
        Integer buildingYear,

        String status,

        @JsonProperty("listing_type")
        String listingType,

        @JsonProperty("property_offers")
        List<OfferResponse> propertyOffers,

        @JsonProperty("property_images")
        List<ImageResponse> propertyImages
) {
    public static PropertyFullResponse from(Property p) {
        return new PropertyFullResponse(
                p.getId(),
                p.getTitle(),
                p.getAddress(),
                p.getPrice(),
                p.getAreaM2(),
                p.getLocationX(),
                p.getLocationY(),
                p.getBuildingYear(),
                p.getStatus().name(),
                p.getListingType().name(),
                p.getOffers().stream()

                        .filter(o -> Boolean.TRUE.equals(o.getIsActive()))
                        .map(OfferResponse::from)
                        .toList(),
                p.getImages().stream()
                        .map(ImageResponse::from)
                        .toList()
        );
    }

    public record OfferResponse(
            Long id,
            String housetype,             // APART / BILLA / ONE
            String type,                  // SALE / JEONSE / WOLSE
            BigDecimal floor,
            String oftion,
            @JsonProperty("total_price")
            BigDecimal totalPrice,
            BigDecimal deposit,
            @JsonProperty("monthly_rent")
            BigDecimal monthlyRent,
            @JsonProperty("maintenance_fee")
            BigDecimal maintenanceFee,
            @JsonProperty("is_active")
            Boolean isActive
    ) {
        public static OfferResponse from(PropertyOffer o) {
            return new OfferResponse(
                    o.getId(),
                    o.getHousetype().name(),
                    o.getType().name(),
                    o.getFloor(),
                    o.getOftion(),
                    o.getTotalPrice(),
                    o.getDeposit(),
                    o.getMonthlyRent(),
                    o.getMaintenanceFee(),
                    o.getIsActive()
            );
        }
    }

    public record ImageResponse(
            Long id,
            @JsonProperty("image_url")
            String imageUrl
    ) {
        public static ImageResponse from(PropertyImage i) {
            return new ImageResponse(
                    i.getId(),
                    i.getImageUrl()
            );
        }
    }
}