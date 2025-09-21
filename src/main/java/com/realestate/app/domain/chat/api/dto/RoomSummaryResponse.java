package com.realestate.app.domain.chat.api.dto;

import java.util.List;

public record RoomSummaryResponse(
        Long id,
        Long propertyId,
        List<Long> opponentUserIds,
        List<String> opponentNames, // 이름 조회 안 하면 null/빈리스트 가능
        String lastMessage,
        String lastMessageAt,
        int unreadCount
) {}
