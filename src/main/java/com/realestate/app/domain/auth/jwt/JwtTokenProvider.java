package com.realestate.app.domain.auth.jwt;

import com.realestate.app.domain.auth.security.AuthUser;
import com.realestate.app.domain.user.entity.User;
import io.jsonwebtoken.*;

import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;

@Component
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.access-exp-seconds:3600}")
    private long accessExp;

    private SecretKey getKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String createAccessToken(User user) {
        Instant now = Instant.now();
        return Jwts.builder()
                .setSubject(String.valueOf(user.getId()))   // <- setSubject
                .claim("email", user.getEmail())
                .claim("role", user.getRoleId())
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(now.plusSeconds(accessExp)))
                .signWith(getKey(), SignatureAlgorithm.HS256) // <- SignatureAlgorithm
                .compact();
    }

    public Jws<Claims> parse(String token) {
        return Jwts.parserBuilder()               // <- parserBuilder
                .setSigningKey(getKey())
                .build()
                .parseClaimsJws(token);
    }

    /* ================= 여기부터 추가 ================= */

    /** 토큰 유효성 검증 (서명/만료) */
    public boolean validate(String token) {
        try {
            parse(token); // parse에 성공하면 서명/만료 통과
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public Authentication getAuthentication(String token) {
        Jws<Claims> jws = parse(token);
        Claims claims = jws.getBody();

        Long id = parseUserId(claims.getSubject()); // subject = userId (문자열)
        String email = claims.get("email", String.class);
        String role  = claims.get("role", String.class);

        AuthUser principal = new AuthUser(id, email, role);
        return new UsernamePasswordAuthenticationToken(
                principal,
                token,
                principal.getAuthorities()
        );
    }

    private Long parseUserId(String sub) {
        try {
            return Long.parseLong(sub);
        } catch (NumberFormatException e) {
            throw new  JwtException("Invalid subject (user id) in JWT");
        }
    }

    public Long getUserId(String token) {
        return parseUserId(parse(token).getBody().getSubject());
    }
}
