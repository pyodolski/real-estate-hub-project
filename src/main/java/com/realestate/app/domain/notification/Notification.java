package com.realestate.app.domain.notification;

import com.realestate.app.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user; // 알림을 받을 사용자

    @Column(nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private NotificationType type; // 알림 타입

    @Column(nullable = false, length = 200)
    private String title; // 알림 제목

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message; // 알림 내용

    @Column(name = "related_id")
    private Long relatedId; // 관련 엔티티 ID (예: 매물 신청 ID)

    @Column(name = "is_read", nullable = false)
    @Builder.Default
    private Boolean isRead = false; // 읽음 여부

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "read_at")
    private LocalDateTime readAt; // 읽은 시간

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // 읽음 처리
    public void markAsRead() {
        this.isRead = true;
        this.readAt = LocalDateTime.now();
    }

    public enum NotificationType {
        PROPERTY_APPROVED("매물 승인"),
        PROPERTY_REJECTED("매물 거절"),
        PROPERTY_SUBMITTED("매물 신청"),
        SYSTEM_UPDATE("시스템 업데이트"),
        CHAT_MESSAGE("새 메시지"),
        PRICE_ALERT("가격 알림");

        private final String displayName;

        NotificationType(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }
}