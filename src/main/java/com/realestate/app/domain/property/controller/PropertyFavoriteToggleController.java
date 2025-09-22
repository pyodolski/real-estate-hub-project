// src/main/java/com/realestate/app/domain/property/controller/PropertyFavoriteToggleController.java
package com.realestate.app.domain.property.controller;

import com.realestate.app.domain.auth.security.AuthUser;
import com.realestate.app.domain.property.dto.PropertyFavoriteDto;
import com.realestate.app.domain.property.service.PropertyFavoriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/properties")
@RequiredArgsConstructor
public class PropertyFavoriteToggleController {

    private final PropertyFavoriteService service;

    // 토글 (있으면 삭제, 없으면 추가)
    @PostMapping("/{propertyId}/favorite")
    public Map<String, Object> toggle(@AuthenticationPrincipal AuthUser me,
                                      @PathVariable Long propertyId) {
        boolean favored = service.toggleFavorite(me.getId(), propertyId);
        return Map.of("favored", favored);
    }

    // 명시적 삭제(원하면 프론트에서 method: DELETE로 호출)
    @DeleteMapping("/{propertyId}/favorite")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void remove(@AuthenticationPrincipal AuthUser me,
                       @PathVariable Long propertyId) {
        service.removeFavorite(me.getId(), propertyId);
    }

    // GET /api/properties/favorites?limit=20&offset=0
    @GetMapping("/favorites")
    public List<PropertyFavoriteDto> myFavorites(@AuthenticationPrincipal AuthUser me,
                                                 @RequestParam(defaultValue = "20") int limit,
                                                 @RequestParam(defaultValue = "0") int offset) {
        return service.myFavorites(me.getId(), limit, offset);
    }

    // GET /api/properties/{propertyId}/favorite
    @GetMapping("/{propertyId}/favorite")
    public Map<String, Object> favored(@AuthenticationPrincipal AuthUser me,
                                       @PathVariable Long propertyId) {
        return Map.of("favored", service.isFavored(me.getId(), propertyId));
    }

    // GET /api/properties/{propertyId}/favorite/count
    @GetMapping("/{propertyId}/favorite/count")
    public Map<String, Object> favoriteCount(@PathVariable Long propertyId) {
        return Map.of("count", service.favoriteCount(propertyId));
    }


}
