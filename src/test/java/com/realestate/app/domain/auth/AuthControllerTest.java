package com.realestate.app.domain.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.realestate.app.domain.auth.dto.LoginRequest;
import com.realestate.app.domain.auth.dto.SignupRequest;
import com.realestate.app.domain.user.User;
import com.realestate.app.domain.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureWebMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureWebMvc
@ActiveProfiles("test")
@Transactional
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User testUser;

    @BeforeEach
    void setUp() {
        // 테스트용 사용자 생성
        testUser = User.builder()
                .email("test@example.com")
                .username("testuser")
                .passwordHash(passwordEncoder.encode("password123"))
                .roleId("regular")
                .isActive(true)
                .propertyCnt(0)
                .build();
        userRepository.save(testUser);
    }

    @Test
    @DisplayName("올바른 이메일과 비밀번호로 로그인 성공")
    void loginSuccess() throws Exception {
        // Given
        LoginRequest loginRequest = new LoginRequest("test@example.com", "password123");

        // When & Then
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").exists())
                .andExpect(jsonPath("$.refreshToken").exists())
                .andExpect(jsonPath("$.expiresInSeconds").value(3600));
    }

    @Test
    @DisplayName("잘못된 이메일로 로그인 실패")
    void loginFailWithWrongEmail() throws Exception {
        // Given
        LoginRequest loginRequest = new LoginRequest("wrong@example.com", "password123");

        // When & Then
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("잘못된 비밀번호로 로그인 실패")
    void loginFailWithWrongPassword() throws Exception {
        // Given
        LoginRequest loginRequest = new LoginRequest("test@example.com", "wrongpassword");

        // When & Then
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("이메일 형식이 잘못된 경우 로그인 실패")
    void loginFailWithInvalidEmailFormat() throws Exception {
        // Given
        LoginRequest loginRequest = new LoginRequest("invalid-email", "password123");

        // When & Then
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("빈 이메일로 로그인 실패")
    void loginFailWithEmptyEmail() throws Exception {
        // Given
        LoginRequest loginRequest = new LoginRequest("", "password123");

        // When & Then
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("빈 비밀번호로 로그인 실패")
    void loginFailWithEmptyPassword() throws Exception {
        // Given
        LoginRequest loginRequest = new LoginRequest("test@example.com", "");

        // When & Then
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("회원가입 성공")
    void signupSuccess() throws Exception {
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

        // When & Then
        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signupRequest)))
                .andExpect(status().isCreated());
    }

    @Test
    @DisplayName("이미 존재하는 이메일로 회원가입 실패")
    void signupFailWithDuplicateEmail() throws Exception {
        // Given
        SignupRequest signupRequest = new SignupRequest(
                "test@example.com", // 이미 존재하는 이메일
                "newuser",
                "password123",
                "regular",
                "010-1234-5678",
                "안녕하세요",
                null,
                null,
                null
        );

        // When & Then
        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signupRequest)))
                .andExpect(status().isBadRequest());
    }
}