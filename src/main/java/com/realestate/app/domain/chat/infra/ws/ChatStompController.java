package com.realestate.app.domain.chat.infra.ws;

import com.realestate.app.domain.chat.ChatMessage;
import com.realestate.app.domain.chat.api.dto.MessageResponse;
import com.realestate.app.domain.chat.app.ChatService;
import com.realestate.app.domain.chat.support.AuthFacade;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class ChatStompController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatService chatService;
    private final AuthFacade auth; // STOMP 기준 구현도 가능(헤더/세션에서 추출)

    public record ChatSendCommand(Long roomId, String content, String clientMessageId) {}
    public record ReadCommand(Long roomId, Long lastReadMessageId) {}

    @MessageMapping("/chat/message")
    public void onMessage(ChatSendCommand cmd) {
        Long me = auth.currentUserId(); // 웹소켓 인증을 별도 구현했다면 해당 방식 사용
        ChatMessage saved = chatService.saveMessage(cmd.roomId(), me, cmd.content());
        var event = new MessageResponse(saved.getId(), cmd.roomId(), me,
                saved.getContent(), saved.getSentAt().toString(), saved.getIsRead());
        messagingTemplate.convertAndSend("/sub/chat/room/" + cmd.roomId(), event);
    }

    @MessageMapping("/chat/read")
    public void onRead(ReadCommand cmd) {
        Long me = auth.currentUserId();
        chatService.markRead(cmd.roomId(), me, cmd.lastReadMessageId());
        // 필요 시 읽음 이벤트 타입 따로 만들어서 push
    }
}
