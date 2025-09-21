package com.realestate.app.domain.auth;

import com.realestate.app.domain.auth.dto.LoginRequest;
import com.realestate.app.domain.auth.dto.SignupRequest;
import com.realestate.app.domain.auth.dto.TokenResponse;
import com.realestate.app.domain.auth.jwt.JwtTokenProvider;
import com.realestate.app.domain.broker_profile.BrokerProfileRepository;
import com.realestate.app.domain.user.User;
import com.realestate.app.domain.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private BrokerProfileRepository brokerProfileRepository;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @InjectMocks
    private AuthService authService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .email("test@example.com")
                .username("testuser")
                .passwordHash("encodedPassword")
                .roleId("regular")
                .isActive(true)
                .propertyCnt(0)
                .build();
    }

    @Test
    @DisplayName("올바른 로그인 정보로 로그인 성공")
    void loginSuccess() {
        // Given
        LoginRequest loginRequest = new LoginRequest("test@example.com", "password123");
        
        when(userRepository.findByEmailAndIsActive("test@example.com", true))
                .thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("password123", "encodedPassword"))
                .thenReturn(true);
        when(jwtTokenProvider.createAccessToken(testUser))
                .thenReturn("access-token");
        when(refreshTokenRepository.save(any(RefreshToken.class)))
                .thenReturn(RefreshToken.builder().build());

        // When
        TokenResponse response = authService.login(loginRequest);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.accessToken()).isEqualTo("access-token");
        assertThat(response.refreshToken()).isNotNull();
        assertThat(response.expiresInSeconds()).isEqualTo(3600);

        verify(userRepository).findByEmailAndIsActive("test@example.com", true);
        verify(passwordEncoder).matches("password123", "encodedPassword");
        verify(jwtTokenProvider).createAccessToken(testUser);
        verify(refreshTokenRepository).save(any(RefreshToken.class));
    }

    @Test
    @DisplayName("존재하지 않는 이메일로 로그인 실패")
    void loginFailWithNonExistentEmail() {
        // Given
        LoginRequest loginRequest = new LoginRequest("nonexistent@example.com", "password123");
        
        when(userRepository.findByEmailAndIsActive("nonexistent@example.com", true))
                .thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> authService.login(loginRequest))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("이메일 또는 비밀번호가 올바르지 않습니다.");

        verify(userRepository).findByEmailAndIsActive("nonexistent@example.com", true);
        verify(passwordEncoder, never()).matches(anyString(), anyString());
    }

    @Test
    @DisplayName("잘못된 비밀번호로 로그인 실패")
    void loginFailWithWrongPassword() {
        // Given
        LoginRequest loginRequest = new LoginRequest("test@example.com", "wrongpassword");
        
        when(userRepository.findByEmailAndIsActive("test@example.com", true))
                .thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("wrongpassword", "encodedPassword"))
                .thenReturn(false);

        // When & Then
        assertThatThrownBy(() -> authService.login(loginRequest))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("이메일 또는 비밀번호가 올바르지 않습니다.");

        verify(userRepository).findByEmailAndIsActive("test@example.com", true);
        verify(passwordEncoder).matches("wrongpassword", "encodedPassword");
        verify(jwtTokenProvider, never()).createAccessToken(any());
    }

    @Test
    @DisplayName("일반 사용자 회원가입 성공")
    void signupRegularUserSuccess() {
        // Given
        SignupRequest signupRequest = new SignupRequest(
                "newuser@example.com",
                "newuser",
                "password123",
                "regular",
                "010-1234-5678",
                "안녕하세요",
                null,
                null,
                null
        );

        when(userRepository.existsByEmail("newuser@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // When
        assertThatCode(() -> authService.signup(signupRequest))
                .doesNotThrowAnyException();

        // Then
        verify(userRepository).existsByEmail("newuser@example.com");
        verify(passwordEncoder).encode("password123");
        verify(userRepository).save(any(User.class));
        verify(brokerProfileRepository, never()).save(any());
    }

    @Test
    @DisplayName("중개사 회원가입 성공")
    void signupBrokerSuccess() {
        // Given
        SignupRequest signupRequest = new SignupRequest(
                "broker@example.com",
                "broker",
                "password123",
                "broker",
                "010-1234-5678",
                "안녕하세요",
                null,
                "12345",
                "부동산중개사무소"
        );

        User brokerUser = testUser.toBuilder().roleId("broker").build();

        when(userRepository.existsByEmail("broker@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(brokerUser);

        // When
        assertThatCode(() -> authService.signup(signupRequest))
                .doesNotThrowAnyException();

        // Then
        verify(userRepository).existsByEmail("broker@example.com");
        verify(passwordEncoder).encode("password123");
        verify(userRepository).save(any(User.class));
        verify(brokerProfileRepository).save(any());
    }

    @Test
    @DisplayName("이미 존재하는 이메일로 회원가입 실패")
    void signupFailWithDuplicateEmail() {
        // Given
        SignupRequest signupRequest = new SignupRequest(
                "existing@example.com",
                "newuser",
                "password123",
                "regular",
                "010-1234-5678",
                "안녕하세요",
                null,
                null,
                null
        );

        when(userRepository.existsByEmail("existing@example.com")).thenReturn(true);

        // When & Then
        assertThatThrownBy(() -> authService.signup(signupRequest))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("이미 사용 중인 이메일입니다.");

        verify(userRepository).existsByEmail("existing@example.com");
        verify(userRepository, never()).save(any());
    }
}