package com.realestate.app.domain.notification.dto;

import com.realestate.app.domain.notification.Notification;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class NotificationResponse {
    private Long id;
    private String type;
    private String typeDisplayName;
    private String title;
    private String message;
    private Long relatedId;
    private Boolean isRead;
    private LocalDateTime createdAt;
    private LocalDateTime readAt;
    private String timeAgo; // "5분 전", "1시간 전" 등

    public static NotificationResponse from(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .type(notification.getType().name())
                .typeDisplayName(notification.getType().getDisplayName())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .relatedId(notification.getRelatedId())
                .isRead(notification.getIsRead())
                .createdAt(notification.getCreatedAt())
                .readAt(notification.getReadAt())
                .timeAgo(calculateTimeAgo(notification.getCreatedAt()))
                .build();
    }

    private static String calculateTimeAgo(LocalDateTime createdAt) {
        LocalDateTime now = LocalDateTime.now();
        long minutes = java.time.Duration.between(createdAt, now).toMinutes();
        
        if (minutes < 1) {
            return "방금 전";
        } else if (minutes < 60) {
            return minutes + "분 전";
        } else if (minutes < 1440) { // 24시간
            return (minutes / 60) + "시간 전";
        } else {
            return (minutes / 1440) + "일 전";
        }
    }
}