package com.realestate.app.domain.chat.api;

import com.realestate.app.domain.chat.ChatRoom;
import com.realestate.app.domain.chat.api.dto.*;
import com.realestate.app.domain.chat.app.ChatService;
import com.realestate.app.domain.chat.support.AuthFacade;
import com.realestate.app.domain.notification.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatRestController {
    private final ChatService chatService;
    private final AuthFacade auth;
    private final NotificationService notificationService;

    @PostMapping("/rooms")
    public RoomResponse createRoom(@RequestBody CreateRoomRequest req) {
        Long me = auth.currentUserId();
        ChatRoom room = chatService.findOrCreateRoom(
                req.propertyId(), me, req.opponentUserId(), req.opponentUserId2()
        );
        return new RoomResponse(
                room.getId(),
                room.getProperty().getId(),
                room.getUser1().getId(),
                room.getUser2().getId(),
                room.getUser3() != null ? room.getUser3().getId() : null,
                room.getCreatedAt().toString()
        );
    }

    @GetMapping("/rooms")
    public Page<RoomSummaryResponse> myRooms(@RequestParam(defaultValue = "0") int page,
                                             @RequestParam(defaultValue = "20") int size) {
        Long me = auth.currentUserId();
        return chatService.myRooms(me, PageRequest.of(page, size))
                .map(r -> {
                    List<Long> oppIds = new ArrayList<>();
                    Long u1 = r.getUser1().getId();
                    Long u2 = r.getUser2().getId();
                    Long u3 = r.getUser3() != null ? r.getUser3().getId() : null;

                    if (!u1.equals(me)) oppIds.add(u1);
                    if (!u2.equals(me)) oppIds.add(u2);
                    if (u3 != null && !u3.equals(me)) oppIds.add(u3);

                    var last = chatService.findLastMessage(r.getId());
                    int unread = chatService.countUnread(r.getId(), me);

                    return new RoomSummaryResponse(
                            r.getId(),
                            r.getProperty().getId(),
                            oppIds,
                            null, // opponentNames: 필요 시 UserRepo 통해 매핑해서 채워도 됨
                            last != null ? last.getContent() : null,
                            last != null ? last.getSentAt().toString() : null,
                            unread
                    );
                });
    }

    @GetMapping("/rooms/{roomId}/messages")
    public List<MessageResponse> messages(@PathVariable Long roomId,
                                          @RequestParam(required = false) Long cursorId,
                                          @RequestParam(defaultValue = "backward") String dir,
                                          @RequestParam(defaultValue = "50") int size) {
        Long me = auth.currentUserId();
        chatService.assertRoomMember(roomId, me);
        return chatService.pageMessages(roomId, cursorId, dir, size).stream()
                .map(m -> new MessageResponse(
                        m.getId(), roomId, m.getSender().getId(),
                        m.getContent(), m.getSentAt().toString(), Boolean.TRUE.equals(m.getIsRead())
                )).toList();
    }

    @PostMapping("/rooms/{roomId}/messages")
    public MessageResponse sendMessage(@PathVariable Long roomId,
                                       @RequestBody SendMessageRequest req) {
        Long me = auth.currentUserId();
        var saved = chatService.saveMessage(roomId, me, req.content());
        return new MessageResponse(
                saved.getId(), roomId, me,
                saved.getContent(), saved.getSentAt().toString(),
                Boolean.TRUE.equals(saved.getIsRead())
        );
    }

    @PostMapping("/rooms/{roomId}/read")
    public void markRead(@PathVariable Long roomId, @RequestBody ReadRequest req) {
        Long me = auth.currentUserId();
        chatService.assertRoomMember(roomId, me);
        chatService.markRead(roomId, me, req.lastReadMessageId());
        notificationService.markChatMessageNotificationsRead(me, roomId);
    }

    @PostMapping("/rooms/{roomId}/read-all")
    public void markReadAll(@PathVariable Long roomId) {
        Long me = auth.currentUserId();
        chatService.assertRoomMember(roomId, me);
        chatService.markAllOpponentRead(roomId, me);
        notificationService.markChatMessageNotificationsRead(me, roomId);
    }


}
