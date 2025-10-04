package com.realestate.app.domain.notification;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    /**
     * 사용자의 알림 목록 조회 (최신순)
     */
    Page<Notification> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    /**
     * 사용자의 읽지 않은 알림 개수
     */
    long countByUserIdAndIsReadFalse(Long userId);

    /**
     * 사용자의 읽지 않은 알림 목록
     */
    List<Notification> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(Long userId);

    /**
     * 사용자의 모든 알림을 읽음 처리
     */
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true, n.readAt = CURRENT_TIMESTAMP WHERE n.user.id = :userId AND n.isRead = false")
    int markAllAsReadByUserId(@Param("userId") Long userId);

    /**
     * 사용자의 읽은 알림들 삭제
     */
    @Modifying
    @Query("DELETE FROM Notification n WHERE n.user.id = :userId AND n.isRead = true")
    int deleteReadNotificationsByUserId(@Param("userId") Long userId);
}