package com.realestate.app.domain.property.controller;

import com.realestate.app.domain.property.dto.PropertyWithOffersDto;
import com.realestate.app.domain.property.service.PropertyQueryService;
import com.realestate.app.domain.auth.jwt.AuthUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/properties")
@PreAuthorize("isAuthenticated()")
public class PropertyQueryController {

    private final PropertyQueryService service;

    /* 전체 목록(내 것 + 타인 것)  */
    @GetMapping(params = {"!swLat","!swLng","!neLat","!neLng"})
    public Page<PropertyWithOffersDto> list(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) String sort,         // "createdAt,desc" 또는 "price,asc;createdAt,desc"
            @RequestParam(required = false) String status,       // AVAILABLE | PENDING | SOLD
            @RequestParam(required = false) String listingType   // OWNER | BROKER
    ) {
        // 로그인 보장 (컨트롤러 레벨 @PreAuthorize), 필요 시 userId 사용 가능
        AuthUtils.currentUserId().orElseThrow(() ->
                new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다."));
        return service.list(page, size, sort, status, listingType);
    }

    /* 내 매물 목록 */
    @GetMapping("/my")
    public Page<PropertyWithOffersDto> myList(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) String sort,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String listingType
    ) {
        Long userId = AuthUtils.currentUserId()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다."));
        return service.listMyProperties(userId, page, size, sort, status, listingType);
    }

    /* 타인 매물 목록(내 것 제외) */
    @GetMapping("/others")
    public Page<PropertyWithOffersDto> others(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) String sort,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String listingType
    ) {
        Long viewerId = AuthUtils.currentUserId()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다."));
        return service.listOthers(viewerId, page, size, sort, status, listingType);
    }

    /* 상세(타인 포함) */
    @GetMapping("/{id}")
    public PropertyWithOffersDto detail(@PathVariable Long id) {
        AuthUtils.currentUserId().orElseThrow(() ->
                new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다."));
        return service.detail(id);
    }
}
