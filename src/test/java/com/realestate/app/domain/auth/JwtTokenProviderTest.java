package com.realestate.app.domain.auth;

import com.realestate.app.domain.auth.jwt.JwtTokenProvider;
import com.realestate.app.domain.user.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
class JwtTokenProviderTest {

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .email("test@example.com")
                .username("testuser")
                .roleId("regular")
                .isActive(true)
                .build();
    }

    @Test
    @DisplayName("JWT 토큰 생성 성공")
    void createAccessTokenSuccess() {
        // When
        String token = jwtTokenProvider.createAccessToken(testUser);

        // Then
        assertThat(token).isNotNull();
        assertThat(token).isNotEmpty();
    }

    @Test
    @DisplayName("JWT 토큰 검증 성공")
    void validateTokenSuccess() {
        // Given
        String token = jwtTokenProvider.createAccessToken(testUser);

        // When
        boolean isValid = jwtTokenProvider.validateToken(token);

        // Then
        assertThat(isValid).isTrue();
    }

    @Test
    @DisplayName("JWT 토큰에서 사용자 ID 추출")
    void getUserIdFromTokenSuccess() {
        // Given
        String token = jwtTokenProvider.createAccessToken(testUser);

        // When
        Long userId = jwtTokenProvider.getUserIdFromToken(token);

        // Then
        assertThat(userId).isEqualTo(1L);
    }

    @Test
    @DisplayName("잘못된 JWT 토큰 검증 실패")
    void validateInvalidTokenFail() {
        // Given
        String invalidToken = "invalid.jwt.token";

        // When
        boolean isValid = jwtTokenProvider.validateToken(invalidToken);

        // Then
        assertThat(isValid).isFalse();
    }
}