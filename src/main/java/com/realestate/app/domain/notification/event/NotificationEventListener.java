package com.realestate.app.domain.notification.event;

import com.realestate.app.domain.notification.Notification.NotificationType;
import com.realestate.app.domain.notification.NotificationService;
import com.realestate.app.domain.chat.ChatRoom;
import com.realestate.app.domain.chat.event.ChatMessageCreatedEvent;
import com.realestate.app.domain.property.event.PropertySoldEvent;
import com.realestate.app.domain.property.event.PurchaseCompletedEvent;
import com.realestate.app.domain.systemupdate.event.SystemUpdateEvent;
import com.realestate.app.domain.property.table.Favorite;
import com.realestate.app.domain.property.repository.FavoriteJpaRepository;
import com.realestate.app.domain.user.repository.UserRepository;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.transaction.event.TransactionPhase;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Component
@RequiredArgsConstructor
public class NotificationEventListener {

    private final NotificationService notifications;
    private final FavoriteJpaRepository favoriteRepo;
    private final UserRepository userRepo;
    private final EntityManager em;

    /** 1) 새 채팅 메시지 → 방의 다른 참여자에게 알림 */
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onChatMessageCreated(ChatMessageCreatedEvent e) {
        ChatRoom room = em.find(ChatRoom.class, e.roomId());
        if (room == null) return;

        // 참여자 수집
        List<Long> recipients = new ArrayList<>();
        Long u1 = room.getUser1().getId();
        Long u2 = room.getUser2().getId();
        Long u3 = room.getUser3() != null ? room.getUser3().getId() : null;

        if (!Objects.equals(u1, e.senderId())) recipients.add(u1);
        if (!Objects.equals(u2, e.senderId())) recipients.add(u2);
        if (u3 != null && !Objects.equals(u3, e.senderId())) recipients.add(u3);

        String title = "새 채팅 메시지";
        String body  = e.content().length() > 60 ? e.content().substring(0, 60) + "…" : e.content();

        for (Long uid : recipients) {
            notifications.createNotification(uid, NotificationType.CHAT_MESSAGE,
                    title, body, e.roomId());
        }
    }


    /** 3) 구매 완료 → 구매자 1명에게 알림 */
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onPurchaseCompleted(PurchaseCompletedEvent e) {
        String title = "구매 완료";
        String body  = "매물 구매가 완료되었습니다. 소유권 이전 및 후속 절차를 확인하세요.";
        notifications.createNotification(e.buyerUserId(), NotificationType.PURCHASE_COMPLETED,
                title, body, e.transactionId());
    }

    /** 4) 시스템 업데이트 → 전체 사용자에게 알림 (대상 세그먼트화 가능) */
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onSystemUpdate(SystemUpdateEvent e) {
        List<Long> allUserIds = userRepo.findAllIds();
        for (Long uid : allUserIds) {
            notifications.createNotification(uid, NotificationType.SYSTEM_UPDATE,
                    e.title(), e.body(), null);
        }
    }
}