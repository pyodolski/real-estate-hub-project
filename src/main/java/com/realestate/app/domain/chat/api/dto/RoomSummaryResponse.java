package com.realestate.app.domain.chat.api.dto;

public record RoomSummaryResponse(
        Long id, Long propertyId,
        Long opponentUserId, String opponentName,
        String lastMessage, String lastMessageAt,
        int unreadCount
) {}
