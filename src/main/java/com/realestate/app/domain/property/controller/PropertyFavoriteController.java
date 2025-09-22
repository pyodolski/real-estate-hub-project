package com.realestate.app.domain.property.controller;

import com.realestate.app.domain.auth.security.AuthUser;
import com.realestate.app.domain.property.dto.PropertyFavoriteDto;
import com.realestate.app.domain.property.service.PropertyFavoriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/me")
@RequiredArgsConstructor
public class PropertyFavoriteController {

    private final PropertyFavoriteService service;

    @GetMapping("/favorites")
    public List<PropertyFavoriteDto> myFavorites(
            @AuthenticationPrincipal AuthUser me,
            @RequestParam(defaultValue = "50") int limit,
            @RequestParam(defaultValue = "0") int offset
    ) {
        // 🔐 me가 null이면(=Authorization 헤더 없거나 토큰 파싱 실패) 401로 처리
        if (me == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
        }
        return service.myFavorites(me.getId(), limit, offset);
    }
}