package com.realestate.app.domain.auth.jwt;

import com.realestate.app.domain.auth.security.AuthUser;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Map;
import java.util.Optional;

public final class AuthUtils {
    private AuthUtils() {}

    public static Optional<Long> currentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return Optional.empty();

        Object principal = auth.getPrincipal();

        if (principal instanceof AuthUser au && au.getId() != null) {
            return Optional.of(au.getId());
        }

        if (principal instanceof UserDetails ud) {
            Long parsed = tryParseLong(ud.getUsername());
            if (parsed != null) return Optional.of(parsed);
        }

        if (principal instanceof Number n) return Optional.of(n.longValue());
        if (principal instanceof String s) {
            Long parsed = tryParseLong(s);
            if (parsed != null) return Optional.of(parsed);
        }

        Object details = auth.getDetails();
        if (details instanceof Map<?, ?> map) {
            Object v = map.get("userId");
            if (v instanceof Number n) return Optional.of(n.longValue());
            if (v instanceof String s) {
                Long parsed = tryParseLong(s);
                if (parsed != null) return Optional.of(parsed);
            }
            Object sub = map.get("sub");
            if (sub instanceof String s2) {
                Long parsed = tryParseLong(s2);
                if (parsed != null) return Optional.of(parsed);
            }
        }

        Long parsed = tryParseLong(auth.getName());
        if (parsed != null) return Optional.of(parsed);

        return Optional.empty();
    }

    private static Long tryParseLong(String s) {
        if (s == null) return null;
        try { return Long.parseLong(s); } catch (NumberFormatException ignore) { return null; }
    }
}
