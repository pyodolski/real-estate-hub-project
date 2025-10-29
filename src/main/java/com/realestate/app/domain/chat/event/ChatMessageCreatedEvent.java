package com.realestate.app.domain.chat.event;
import java.time.LocalDateTime;

public record ChatMessageCreatedEvent(
        Long roomId, Long messageId, Long senderId,
        String content, LocalDateTime sentAt
) {}