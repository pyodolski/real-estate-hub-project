package com.realestate.app.domain.chat.app;

import com.realestate.app.domain.chat.ChatMessage;
import com.realestate.app.domain.chat.ChatRoom;
import com.realestate.app.domain.chat.infra.jpa.ChatMessageJpaRepository;
import com.realestate.app.domain.chat.infra.jpa.ChatRoomJpaRepository;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class  ChatService {
    private final ChatRoomJpaRepository roomRepo;
    private final ChatMessageJpaRepository msgRepo;
    private final EntityManager em;

    @Transactional
    public ChatRoom findOrCreateRoom(Long propertyId, Long me, Long opponent) {
        if (me.equals(opponent)) throw new IllegalArgumentException("본인과 대화 불가");
        Long u1 = Math.min(me, opponent);
        Long u2 = Math.max(me, opponent);

        return roomRepo.findByPropertyAndUsers(propertyId, u1, u2)
                .orElseGet(() -> {
                    var room = ChatRoom.builder()
                            .property(em.getReference(com.realestate.app.domain.property.Property.class, propertyId))
                            .user1(em.getReference(com.realestate.app.domain.user.entity.User.class, u1))
                            .user2(em.getReference(com.realestate.app.domain.user.entity.User.class, u2))
                            .build();
                    return roomRepo.save(room);
                });
    }

    @Transactional(readOnly = true)
    public Page<ChatRoom> myRooms(Long me, Pageable pageable) {
        return roomRepo.findMyRooms(me, pageable);
    }

    @Transactional(readOnly = true)
    public List<ChatMessage> pageMessages(Long roomId, Long cursorId, String dir, int size) {
        return msgRepo.pageByCursor(roomId, cursorId, dir, PageRequest.of(0, size));
    }

    @Transactional
    public ChatMessage saveMessage(Long roomId, Long senderId, String content) {
        if (content == null || content.isBlank()) throw new IllegalArgumentException("빈 메시지");
        var msg = ChatMessage.builder()
                .room(em.getReference(ChatRoom.class, roomId))
                .sender(em.getReference(com.realestate.app.domain.user.entity.User.class, senderId))
                .content(content)
                .isRead(false)
                .build();
        return msgRepo.save(msg);
    }

    @Transactional
    public void markRead(Long roomId, Long me, Long lastReadId) {
        msgRepo.markReadUpTo(roomId, me, lastReadId);
    }

    @Transactional(readOnly = true)
    public int countUnread(Long roomId, Long me) {
        return msgRepo.countUnread(roomId, me);
    }

    @Transactional(readOnly = true)
    public ChatMessage findLastMessage(Long roomId) {
        return msgRepo.findTopByRoomOrderByIdDesc(roomId, PageRequest.of(0,1))
                .stream().findFirst().orElse(null);
    }
}
