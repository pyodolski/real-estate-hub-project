package com.realestate.app.domain.chat.app;

import com.realestate.app.domain.chat.ChatMessage;
import com.realestate.app.domain.chat.ChatRoom;
import com.realestate.app.domain.chat.infra.jpa.ChatMessageJpaRepository;
import com.realestate.app.domain.chat.infra.jpa.ChatRoomJpaRepository;
import com.realestate.app.domain.user.User;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {
    private final ChatRoomJpaRepository roomRepo;
    private final ChatMessageJpaRepository msgRepo;
    private final EntityManager em;

    private record Trio(Long u1, Long u2, Long u3) {}

    /** me와 opponents(1~2명)를 합쳐 정규화(user1<=user2<=user3). 두 명이면 u3=null */
    private Trio normalizeMembers(Long me, Long opp1, Long opp2) {
        if (Objects.equals(me, opp1) || Objects.equals(me, opp2))
            throw new IllegalArgumentException("본인과 대화 상대가 같을 수 없음");
        if (opp1 != null && Objects.equals(opp1, opp2))
            throw new IllegalArgumentException("상대가 중복됨");

        List<Long> ids = new ArrayList<>();
        ids.add(me);
        if (opp1 != null) ids.add(opp1);
        if (opp2 != null) ids.add(opp2);

        // 2명 또는 3명만 허용
        if (ids.size() < 2 || ids.size() > 3)
            throw new IllegalArgumentException("참여자 수는 2명 또는 3명이어야 함");

        Collections.sort(ids);

        Long u1 = ids.get(0);
        Long u2 = ids.get(1);
        Long u3 = (ids.size() == 3) ? ids.get(2) : null;

        return new Trio(u1, u2, u3);
    }

    @Transactional
    public ChatRoom findOrCreateRoom(Long propertyId, Long me, Long opponent1, Long opponent2 /*nullable*/) {
        Trio t = normalizeMembers(me, opponent1, opponent2);

        return roomRepo.findByPropertyAndUsers(propertyId, t.u1, t.u2, t.u3)
                .orElseGet(() -> {
                    var room = ChatRoom.builder()
                            .property(em.getReference(com.realestate.app.domain.property.Property.class, propertyId))
                            .user1(em.getReference(com.realestate.app.domain.user.entity.User.class, t.u1))
                            .user2(em.getReference(com.realestate.app.domain.user.entity.User.class, t.u2))
                            .user3(t.u3 == null ? null : em.getReference(com.realestate.app.domain.user.User.class, t.u3))
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
        if (content == null || content.isBlank())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "빈 메시지");

        ChatRoom room = em.find(ChatRoom.class, roomId);
        if (room == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "채팅방 없음: " + roomId);

        // 멤버 검증 (3인 방 대응)
        if (!isMember(room, senderId))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "방 참여자가 아님");

        User sender = em.find(com.realestate.app.domain.user.entity.User.class, senderId);
        if (sender == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "보낸 유저 없음: " + senderId);

        ChatMessage msg = ChatMessage.builder()
                .room(room)
                .sender(sender)
                .content(content)
                .isRead(false)
                .build();
        return msgRepo.save(msg);
    }

    private boolean isMember(ChatRoom r, Long uid) {
        Long u1 = r.getUser1().getId();
        Long u2 = r.getUser2().getId();
        Long u3 = (r.getUser3() == null ? null : r.getUser3().getId());
        return Objects.equals(uid, u1) || Objects.equals(uid, u2) || (u3 != null && Objects.equals(uid, u3));
    }

    @Transactional
    public void markRead(Long roomId, Long me, Long lastReadId) {
        msgRepo.markReadUpTo(roomId, me, lastReadId);
    }

    @Transactional
    public void markAllOpponentRead(Long roomId, Long me) {
        msgRepo.markAllOpponentRead(roomId, me);
    }

    @Transactional(readOnly = true)
    public int countUnread(Long roomId, Long me) {
        return msgRepo.countUnread(roomId, me);
    }

    @Transactional(readOnly = true)
    public ChatMessage findLastMessage(Long roomId) {
        return msgRepo.findTopByRoomOrderByIdDesc(roomId, PageRequest.of(0, 1))
                .stream().findFirst().orElse(null);
    }

    @Transactional(readOnly = true)
    public void assertRoomMember(Long roomId, Long userId) {
        ChatRoom room = em.find(ChatRoom.class, roomId);
        if (room == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "채팅방 없음: " + roomId);
        if (!isMember(room, userId))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "방 참여자가 아님");
    }
}
