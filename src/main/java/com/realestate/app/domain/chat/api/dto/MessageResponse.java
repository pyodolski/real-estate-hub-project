package com.realestate.app.domain.chat.api.dto;

public record MessageResponse(
        Long id, Long roomId, Long senderId,
        String content, String sentAt, boolean isRead
) {}
