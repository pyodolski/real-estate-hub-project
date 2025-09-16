package com.realestate.app.domain.auth;

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
    public TokenResponse login(@Valid @RequestBody LoginRequest req) { return auth.login(req); }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(@AuthenticationPrincipal AuthUser me,
                       @Valid @RequestBody LogoutRequest req) {
        auth.logout(me.getId(), req.refreshToken());
    }

    @PostMapping("/refresh")
    public TokenResponse refresh(@RequestParam String refreshToken) { return auth.refresh(refreshToken); }
}
