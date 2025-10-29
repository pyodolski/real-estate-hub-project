package com.realestate.app.domain.notification;

import com.realestate.app.domain.notification.dto.NotificationResponse;
import com.realestate.app.domain.user.entity.User;
import com.realestate.app.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    /**
     * 사용자의 알림 목록 조회
     */
    public Page<NotificationResponse> getUserNotifications(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        
        return notifications.map(NotificationResponse::from);
    }

    /**
     * 사용자의 읽지 않은 알림 개수
     */
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    /**
     * 사용자의 읽지 않은 알림 목록
     */
    public List<NotificationResponse> getUnreadNotifications(Long userId) {
        List<Notification> notifications = notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
        return notifications.stream()
                .map(NotificationResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * 알림 읽음 처리
     */
    @Transactional
    public void markAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("알림을 찾을 수 없습니다."));
        
        if (!notification.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("권한이 없습니다.");
        }
        
        notification.markAsRead();
        notificationRepository.save(notification);
    }

    @Transactional
    public int markChatMessageNotificationsRead(Long userId, Long roomId) {
        return notificationRepository.markChatMessageNotificationsRead(userId, roomId);
    }

    /**
     * 모든 알림 읽음 처리
     */
    @Transactional
    public int markAllAsRead(Long userId) {
        return notificationRepository.markAllAsReadByUserId(userId);
    }

    /**
     * 알림 삭제
     */
    @Transactional
    public void deleteNotification(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("알림을 찾을 수 없습니다."));
        
        if (!notification.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("권한이 없습니다.");
        }
        
        notificationRepository.delete(notification);
    }

    /**
     * 읽은 알림들 일괄 삭제
     */
    @Transactional
    public int deleteReadNotifications(Long userId) {
        return notificationRepository.deleteReadNotificationsByUserId(userId);
    }

    /**
     * 알림 생성 (내부 사용)
     */
    @Transactional
    public void createNotification(Long userId, Notification.NotificationType type, 
                                 String title, String message, Long relatedId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        
        Notification notification = Notification.builder()
                .user(user)
                .type(type)
                .title(title)
                .message(message)
                .relatedId(relatedId)
                .build();
        
        notificationRepository.save(notification);
    }

    /**
     * 매물 승인 알림 생성
     */
    @Transactional
    public void createPropertyApprovedNotification(Long userId, Long claimId, String propertyAddress) {
        String title = "매물 승인 완료";
        String message = String.format("신청하신 매물(%s)이 승인되었습니다. 이제 매물 관리가 가능합니다.", 
                                     propertyAddress != null ? propertyAddress : "매물");
        
        createNotification(userId, Notification.NotificationType.PROPERTY_APPROVED, title, message, claimId);
    }

    /**
     * 매물 거절 알림 생성
     */
    @Transactional
    public void createPropertyRejectedNotification(Long userId, Long claimId, String propertyAddress, String reason) {
        String title = "매물 신청 거절";
        String message = String.format("신청하신 매물(%s)이 거절되었습니다. 사유: %s", 
                                     propertyAddress != null ? propertyAddress : "매물",
                                     reason != null ? reason : "관리자 검토 결과");
        
        createNotification(userId, Notification.NotificationType.PROPERTY_REJECTED, title, message, claimId);
    }
}