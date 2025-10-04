package com.realestate.app.domain.notification;

import com.realestate.app.domain.auth.security.AuthUser;
import com.realestate.app.domain.notification.dto.NotificationResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * 사용자의 알림 목록 조회
     */
    @GetMapping
    public ResponseEntity<Page<NotificationResponse>> getNotifications(
            @AuthenticationPrincipal AuthUser currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Page<NotificationResponse> notifications = notificationService.getUserNotifications(
                currentUser.getId(), page, size);
        return ResponseEntity.ok(notifications);
    }

    /**
     * 읽지 않은 알림 개수 조회
     */
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@AuthenticationPrincipal AuthUser currentUser) {
        long count = notificationService.getUnreadCount(currentUser.getId());
        return ResponseEntity.ok(Map.of("count", count));
    }

    /**
     * 읽지 않은 알림 목록 조회
     */
    @GetMapping("/unread")
    public ResponseEntity<List<NotificationResponse>> getUnreadNotifications(
            @AuthenticationPrincipal AuthUser currentUser) {
        
        List<NotificationResponse> notifications = notificationService.getUnreadNotifications(currentUser.getId());
        return ResponseEntity.ok(notifications);
    }

    /**
     * 알림 읽음 처리
     */
    @PutMapping("/{notificationId}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Long notificationId,
            @AuthenticationPrincipal AuthUser currentUser) {
        
        notificationService.markAsRead(notificationId, currentUser.getId());
        return ResponseEntity.ok().build();
    }

    /**
     * 모든 알림 읽음 처리
     */
    @PutMapping("/read-all")
    public ResponseEntity<Map<String, Integer>> markAllAsRead(@AuthenticationPrincipal AuthUser currentUser) {
        int count = notificationService.markAllAsRead(currentUser.getId());
        return ResponseEntity.ok(Map.of("updatedCount", count));
    }

    /**
     * 알림 삭제
     */
    @DeleteMapping("/{notificationId}")
    public ResponseEntity<Void> deleteNotification(
            @PathVariable Long notificationId,
            @AuthenticationPrincipal AuthUser currentUser) {
        
        notificationService.deleteNotification(notificationId, currentUser.getId());
        return ResponseEntity.ok().build();
    }

    /**
     * 읽은 알림들 일괄 삭제
     */
    @DeleteMapping("/read")
    public ResponseEntity<Map<String, Integer>> deleteReadNotifications(
            @AuthenticationPrincipal AuthUser currentUser) {
        
        int count = notificationService.deleteReadNotifications(currentUser.getId());
        return ResponseEntity.ok(Map.of("deletedCount", count));
    }
}