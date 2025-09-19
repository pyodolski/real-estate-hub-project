package com.realestate.app.domain.chat.support;

import com.realestate.app.domain.auth.security.AuthUser;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class AuthFacade {
    public Long currentUserId() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof AuthUser me)) {
            throw new IllegalStateException("인증된 사용자 없음");
        }
        return me.getId();
    }
}
