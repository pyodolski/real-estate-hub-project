package com.realestate.app.domain.chat.support;

import org.springframework.stereotype.Component;

// 현재 로그인 사용자의 ID를 반환하는 얇은 어댑터.
@Component
public class AuthFacade {
    public Long currentUserId() {
        // TODO: SecurityContextHolder에서 꺼내거나, STOMP 세션/헤더에서 꺼내도록 구현
        // 예시) return ((CustomUser) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getId();
        return 1L; // 임시
    }
}
