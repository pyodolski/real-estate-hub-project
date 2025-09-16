package com.realestate.app.domain.auth.jwt;

import com.realestate.app.domain.user.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
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
}
