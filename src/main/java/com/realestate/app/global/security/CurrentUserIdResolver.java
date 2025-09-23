package com.realestate.app.global.security;

import com.realestate.app.domain.user.entity.User;
import com.realestate.app.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

@Component
@RequiredArgsConstructor
public class CurrentUserIdResolver {

    private final UserRepository userRepository;

    public Long requireUserId(Authentication auth) {
        if (auth == null || auth.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "no authentication");
        }
        String name = auth.getName();

        // name이 숫자면 그대로 사용
        if (isNumeric(name)) {
            try { return Long.parseLong(name); }
            catch (NumberFormatException ignored) { /* fallthrough to email lookup */ }
        }
        // 숫자가 아니면 이메일로 유저 조회해서 id 반환
        User u = userRepository.findByEmail(name)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "user not found by email"));
        return u.getId();
    }

    private boolean isNumeric(String s) {
        for (int i = 0; i < s.length(); i++) {
            if (!Character.isDigit(s.charAt(i))) return false;
        }
        return !s.isEmpty();
    }
}