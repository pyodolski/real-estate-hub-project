package com.realestate.app.domain.chat.api;

import com.realestate.app.domain.chat.ChatMessage;
import com.realestate.app.domain.chat.ChatRoom;
import com.realestate.app.domain.chat.api.dto.*;
import com.realestate.app.domain.chat.app.ChatService;
import com.realestate.app.domain.chat.support.AuthFacade;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatRestController {
    private final ChatService chatService;
    private final AuthFacade auth;

    @PostMapping("/rooms")
    public RoomResponse createRoom(@RequestBody CreateRoomRequest req) {
        Long me = auth.currentUserId();
        ChatRoom room = chatService.findOrCreateRoom(req.propertyId(), me, req.opponentUserId());
        return new RoomResponse(room.getId(), room.getProperty().getId(),
                room.getUser1().getId(), room.getUser2().getId(),
                room.getCreatedAt().toString());
    }

    @GetMapping("/rooms")
    public Page<RoomSummaryResponse> myRooms(@RequestParam(defaultValue = "0") int page,
                                             @RequestParam(defaultValue = "20") int size) {
        Long me = auth.currentUserId();
        return chatService.myRooms(me, PageRequest.of(page, size))
                .map(r -> {
                    Long opp = r.getUser1().getId().equals(me) ? r.getUser2().getId() : r.getUser1().getId();
                    var last = chatService.findLastMessage(r.getId());
                    int unread = chatService.countUnread(r.getId(), me);
                    return new RoomSummaryResponse(
                            r.getId(), r.getProperty().getId(),
                            opp, null,
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
        return chatService.pageMessages(roomId, cursorId, dir, size).stream()
                .map(m -> new MessageResponse(
                        m.getId(), roomId, m.getSender().getId(),
                        m.getContent(), m.getSentAt().toString(), m.getIsRead()
                )).toList();
    }

    @PostMapping("/rooms/{roomId}/read")
    public void markRead(@PathVariable Long roomId, @RequestBody ReadRequest req) {
        chatService.markRead(roomId, auth.currentUserId(), req.lastReadMessageId());
    }
}
