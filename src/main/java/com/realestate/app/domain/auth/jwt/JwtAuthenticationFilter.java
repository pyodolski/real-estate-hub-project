package com.realestate.app.domain.auth.jwt;

import com.realestate.app.domain.auth.security.AuthUser;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwt;

    @Override
    protected void doFilterInternal(HttpServletRequest req,
                                    HttpServletResponse res,
                                    FilterChain chain) throws IOException, ServletException {

        // 1) CORS 프리플라이트는 무조건 통과
        if ("OPTIONS".equalsIgnoreCase(req.getMethod())) {
            chain.doFilter(req, res);
            return;
        }

        // 2) 로그인/회원가입/리프레시는 토큰 없이 통과
        String uri = req.getRequestURI();
        if (uri.startsWith("/api/auth/")) {
            chain.doFilter(req, res);
            return;
        }

        // 3) 그 외 요청만 Bearer 토큰 파싱 시도
        String auth = req.getHeader("Authorization");
        if (auth != null && auth.startsWith("Bearer ")) {
            String token = auth.substring(7);
            try {
                var parsed = jwt.parse(token);
                var c = parsed.getBody();

                Long id = Long.valueOf(c.getSubject());
                String email = c.get("email", String.class);
                String role  = c.get("role", String.class);

                var principal = new AuthUser(id, email, role);
                var authToken = new UsernamePasswordAuthenticationToken(
                        principal, null, principal.getAuthorities());
                SecurityContextHolder.getContext().setAuthentication(authToken);
            } catch (Exception ignored) {
                // 토큰이 잘못됐으면 인증 없이 진행 -> SecurityConfig에서 401 처리
            }
        }

        chain.doFilter(req, res);
    }
}

