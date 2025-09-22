package com.realestate.app.domain.property.dto;

import com.realestate.app.domain.property.table.Property;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PropertyResponse {
    private Long id;
    private String title;
    private String address;
    private BigDecimal price;
    private BigDecimal areaM2;
    private String status;
    private String listingType;
    private Long ownerId;
    private String ownerName;
    private Long brokerId;
    private String brokerName;
    private Long claimId;
    private String regionCode;
    private Double locationX;
    private Double locationY;
    private Integer buildingYear;
    private Boolean anomalyAlert;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static PropertyResponse from(Property property) {
        return PropertyResponse.builder()
                .id(property.getId())
                .title(property.getTitle())
                .address(property.getAddress())
                .price(property.getPrice())
                .areaM2(property.getAreaM2())
                .status(property.getStatus() != null ? property.getStatus().name() : null)
                .listingType(property.getListingType() != null ? property.getListingType().name() : null)
                .ownerId(property.getOwner() != null ? property.getOwner().getId() : null)
                .ownerName(property.getOwner() != null ? property.getOwner().getUsername() : null)
                .brokerId(property.getBroker() != null ? property.getBroker().getUser().getId() : null)
                .brokerName(property.getBroker() != null ? property.getBroker().getUser().getUsername() : null)
                .claimId(property.getClaim() != null ? property.getClaim().getId() : null)
                .regionCode(property.getRegionCode())
                .locationX(property.getLocationX())
                .locationY(property.getLocationY())
                .buildingYear(property.getBuildingYear())
                .anomalyAlert(property.getAnomalyAlert())
                .createdAt(property.getCreatedAt())
                .updatedAt(property.getUpdatedAt())
                .build();
    }
}