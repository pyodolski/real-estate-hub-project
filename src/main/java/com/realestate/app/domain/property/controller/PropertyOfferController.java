package com.realestate.app.domain.property.controller;

import com.realestate.app.domain.property.dto.PropertyOfferResponse;
import com.realestate.app.domain.property.dto.UpdateOfferRequest;
import com.realestate.app.domain.property.service.PropertyOfferService;
import com.realestate.app.global.security.CurrentUserIdResolver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/offers")
@RequiredArgsConstructor
public class PropertyOfferController {

    private final PropertyOfferService offerService;
    private final CurrentUserIdResolver currentUserIdResolver;

    /**
     * 판매 매물(Offer) 활성화/비활성화 토글
     */
    @PatchMapping("/{offerId}/toggle-active")
    public PropertyOfferResponse toggleActive(Authentication auth, @PathVariable Long offerId) {
        Long userId = currentUserIdResolver.requireUserId(auth);
        log.info("[OFFER] Toggle active - userId: {}, offerId: {}", userId, offerId);
        return offerService.toggleActive(userId, offerId);
    }

    /**
     * 판매 매물(Offer) 수정
     */
    @PutMapping("/{offerId}")
    public PropertyOfferResponse updateOffer(
            Authentication auth,
            @PathVariable Long offerId,
            @RequestBody UpdateOfferRequest request) {
        Long userId = currentUserIdResolver.requireUserId(auth);
        log.info("[OFFER] Update offer - userId: {}, offerId: {}", userId, offerId);
        return offerService.updateOffer(userId, offerId, request);
    }

    /**
     * 판매 매물(Offer) 삭제
     */
    @DeleteMapping("/{offerId}")
    public void deleteOffer(Authentication auth, @PathVariable Long offerId) {
        Long userId = currentUserIdResolver.requireUserId(auth);
        log.info("[OFFER] Delete offer - userId: {}, offerId: {}", userId, offerId);
        offerService.deleteOffer(userId, offerId);
    }
}
