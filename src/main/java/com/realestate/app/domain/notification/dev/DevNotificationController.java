package com.realestate.app.domain.notification.dev;

import com.realestate.app.domain.notification.Notification.NotificationType;
import com.realestate.app.domain.notification.NotificationService;
import com.realestate.app.global.security.CurrentUserIdResolver;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@Profile({"local", "dev"}) // 필요 없으면 이거 빼도 됨
@RestController
@RequestMapping("/api/dev/notifications")
@RequiredArgsConstructor
public class DevNotificationController {

    private final NotificationService notifications;
    private final CurrentUserIdResolver currentUserIdResolver;

    /**
     * 현재 로그인한 사용자에게 알림 전부 테스트 발송
     */
    @PostMapping("/dummy-all")
    public ResponseEntity<Void> sendAllDummy(Authentication auth) {
        Long userId = currentUserIdResolver.requireUserId(auth);

        // 1. 매물 승인 완료
        notifications.createPropertyApprovedNotification(
                userId,
                100L,
                "테스트 매물 주소(승인)"
        );

        // 2. 매물 신청 거절
        notifications.createPropertyRejectedNotification(
                userId,
                101L,
                "테스트 매물 주소(거절)",
                "테스트 거절 사유입니다."
        );

        // 3. 새 채팅 메시지
        notifications.createNotification(
                userId,
                NotificationType.CHAT_MESSAGE,
                "새 채팅 메시지 (테스트)",
                "테스트 채팅 메시지 내용입니다.",
                200L // 관련 roomId 가정
        );

        // 4. 구매 완료
        notifications.createNotification(
                userId,
                NotificationType.PURCHASE_COMPLETED,
                "구매 완료 (테스트)",
                "테스트용 매물 구매가 완료되었습니다.",
                300L // transactionId 가정
        );

        // 5. 시스템 업데이트
        notifications.createNotification(
                userId,
                NotificationType.SYSTEM_UPDATE,
                "시스템 업데이트 (테스트)",
                "테스트용 시스템 점검 안내입니다.",
                null
        );

        // 6. 새로운 추천 매물
        notifications.createRecommendedPropertyNotification(
                userId,
                400L,
                "테스트 추천 매물"
        );

        // 7. 경매 새 입찰 도착
        notifications.createAuctionNewBidNotificationToOwner(
                userId,
                500L, // auctionId
                BigDecimal.valueOf(500_000_000L),
                "테스트 브로커"
        );

        // 8. 내 입찰 상회
        notifications.createAuctionOutbidNotification(
                userId,
                500L,
                BigDecimal.valueOf(550_000_000L)
        );

        // 9. 참여한 경매 종료(낙찰자 버전)
        notifications.createAuctionCompletedNotification(
                userId,
                500L,
                true   // winner=true
        );

        return ResponseEntity.ok().build();
    }
}
