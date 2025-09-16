package com.realestate.app.domain.user;

import com.realestate.app.domain.auth.security.AuthUser;
import com.realestate.app.domain.user.dto.UpdateProfileRequest;
import com.realestate.app.domain.user.dto.VerifyPasswordRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping("/me")
    public User me(@AuthenticationPrincipal AuthUser me) {
        return userService.getMyProfile(me.getId());
    }

    @PostMapping("/verify-password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void verifyPassword(@AuthenticationPrincipal AuthUser me,
                               @Valid @RequestBody VerifyPasswordRequest req) {
        userService.verifyPassword(me.getId(), req.currentPassword());
    }

    @PutMapping("/me")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void updateMe(@AuthenticationPrincipal AuthUser me,
                         @Valid @RequestBody UpdateProfileRequest req) {
        userService.updateProfile(me.getId(), req);
    }
}
