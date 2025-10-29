package com.realestate.app.domain.property.event;
import java.time.LocalDateTime;

public record PropertySoldEvent(
        Long propertyId, String propertyTitle, LocalDateTime soldAt
) {}