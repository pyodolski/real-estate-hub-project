package com.realestate.app.domain.auth.security;

import com.realestate.app.domain.auth.jwt.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class JwtStompChannelInterceptor implements ChannelInterceptor {
    private final JwtTokenProvider jwt;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor acc = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (acc == null) return message;

        if (StompCommand.CONNECT.equals(acc.getCommand())) {
            String authHeader = acc.getFirstNativeHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                var authentication = jwt.getAuthentication(authHeader.substring(7));
                acc.setUser(authentication); // STOMP 세션에 Principal 세팅

                // Spring SecurityContext 도 채워줌
                var ctx = SecurityContextHolder.createEmptyContext();
                ctx.setAuthentication(authentication);
                SecurityContextHolder.setContext(ctx);
            }
        }

        // 이후 SEND / SUBSCRIBE 에서도 계속 SecurityContext 채워넣음
        if (acc.getUser() instanceof Authentication auth) {
            var ctx = SecurityContextHolder.createEmptyContext();
            ctx.setAuthentication(auth);
            SecurityContextHolder.setContext(ctx);
        }

        return message;
    }

}


