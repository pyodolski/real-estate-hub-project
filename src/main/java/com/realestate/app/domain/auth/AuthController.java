package com.realestate.app.domain.auth;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseCookie;
import com.realestate.app.domain.auth.dto.*;
import com.realestate.app.domain.auth.security.AuthUser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService auth;

    @PostMapping("/signup")
    @ResponseStatus(HttpStatus.CREATED)
    public void signup(@Valid @RequestBody SignupRequest req) { 
        try {
            auth.signup(req);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(e.getMessage());
        }
    }

    @PostMapping("/login")
    public TokenResponse login(@Valid @RequestBody LoginRequest req,
                               HttpServletResponse res) {
        TokenResponse tokens = auth.login(req);

        // ✅ 리프레시 토큰을 HttpOnly 쿠키로 심기
        boolean remember = Boolean.TRUE.equals(req.rememberMe());
        long maxAgeSec = (remember ? 30 : 14) * 24L * 3600L;

        ResponseCookie cookie = ResponseCookie.from("rt", tokens.refreshToken())
                .httpOnly(true)
                .secure(true)     // 로컬 http 테스트면 false로 두고, 운영은 true (HTTPS)
                .sameSite("Lax")  // SPA라면 "None" + secure true 고려
                .path("/")
                .maxAge(maxAgeSec)
                .build();
        res.addHeader("Set-Cookie", cookie.toString());

        // 응답 바디엔 accessToken만 쓰고, refreshToken은 굳이 안 내려줘도 됨
        return new TokenResponse(tokens.accessToken(), null, tokens.expiresInSeconds());
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(@AuthenticationPrincipal AuthUser me,
                       @Valid @RequestBody LogoutRequest req,
                       HttpServletResponse res) {
        auth.logout(me.getId(), req.refreshToken());

        // ✅ 쿠키 제거
        ResponseCookie clear = ResponseCookie.from("rt", "")
                .httpOnly(true).secure(true).sameSite("Lax")
                .path("/").maxAge(0).build();
        res.addHeader("Set-Cookie", clear.toString());
    }

    @PostMapping("/refresh")
    public TokenResponse refresh(@CookieValue(value = "rt", required = false) String rtCookie,
                                 @RequestParam(required = false) String refreshToken) {
        String rt = (rtCookie != null) ? rtCookie : refreshToken;
        if (rt == null || rt.isBlank()) {
            throw new IllegalArgumentException("리프레시 토큰이 없습니다.");
        }
        return auth.refresh(rt); // 기존 서비스 재사용
    }

    @PostMapping("/forgot-password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest req,
            @RequestHeader(value = "X-App-Base-Url", required = false) String baseUrl // 없으면 기본값
    ) {
        String appBaseUrl = (baseUrl != null && !baseUrl.isBlank())
                ? baseUrl
                : "http://localhost:8080"; // 필요 시 환경변수/설정으로 분리
        auth.requestPasswordReset(req, appBaseUrl);
    }

    @PostMapping("/reset-password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void resetPassword(@Valid @RequestBody ResetPasswordRequest req) {
        auth.resetPassword(req);
    }
}
