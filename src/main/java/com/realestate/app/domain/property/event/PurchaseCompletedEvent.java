package com.realestate.app.domain.property.event;
import java.time.LocalDateTime;

public record PurchaseCompletedEvent(
        Long propertyId, Long buyerUserId, Long transactionId, LocalDateTime completedAt
) {}