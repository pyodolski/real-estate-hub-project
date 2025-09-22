package com.realestate.app.domain.chat.api.dto;

public record RoomResponse(
        Long id, Long propertyId,
        Long user1Id, Long user2Id, Long user3Id,
        String createdAt
) {}
