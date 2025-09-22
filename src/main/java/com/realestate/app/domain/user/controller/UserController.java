package com.realestate.app.domain.user.controller;

import com.realestate.app.domain.user.service.UserService;


import com.realestate.app.domain.auth.dto.UserResponse;
import com.realestate.app.domain.user.dto.ChangePasswordRequest;
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
    public com.realestate.app.domain.auth.dto.UserResponse me(@AuthenticationPrincipal AuthUser me) {
        return userService.getMyProfileDto(me.getId());
    }
    @PostMapping("/verify-password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void verifyPassword(@AuthenticationPrincipal AuthUser me,
                               @Valid @RequestBody VerifyPasswordRequest req) {
        userService.verifyPassword(me.getId(), req.currentPassword());
    }

    @PutMapping("/me")
    public UserResponse updateMe(@AuthenticationPrincipal AuthUser me,
                                 @Valid @RequestBody UpdateProfileRequest req) {
        return userService.updateProfile(me.getId(), req);
    }

    @PostMapping("/me/change-password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void changePassword(@AuthenticationPrincipal AuthUser me,
                               @Valid @RequestBody ChangePasswordRequest req) {
        userService.changePassword(me.getId(), req);
    }

}
