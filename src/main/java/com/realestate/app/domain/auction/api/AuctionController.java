package com.realestate.app.domain.auction.api;

import com.realestate.app.domain.auction.service.AuctionService;
import com.realestate.app.domain.auction.entity.AuctionOffer;
import com.realestate.app.domain.auction.entity.PropertyAuction;
import com.realestate.app.domain.property.table.PropertyOffer.OfferType;
import com.realestate.app.domain.property.table.PropertyOffer.OfferType2;
import com.realestate.app.global.security.CurrentUserIdResolver;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/auctions")
@RequiredArgsConstructor
public class AuctionController {

    private final AuctionService auctionService;
    private final CurrentUserIdResolver currentUserIdResolver;

    /** 오너: 판매폼 기반 경매 등록 */
    @PostMapping("/properties/{propertyId}")
    public ResponseEntity<Long> createAuction(
            Authentication auth,
            @PathVariable Long propertyId,
            @RequestBody CreateAuctionRequest body
    ) {
        Long ownerUserId = currentUserIdResolver.requireUserId(auth);
        var auction = auctionService.createAuction(ownerUserId, propertyId, body);
        return ResponseEntity.ok(auction.getId());
    }

    /** 브로커: 오퍼(입찰) 생성 (기존 그대로) */
    @PostMapping("/{auctionId}/offers")
    public ResponseEntity<Long> createOffer(
            Authentication auth,
            @PathVariable Long auctionId,
            @RequestBody CreateOfferRequest body
    ) {
        Long brokerUserId = currentUserIdResolver.requireUserId(auth);
        var offer = auctionService.createOffer(auctionId, brokerUserId, body.getAmount());
        return ResponseEntity.ok(offer.getId());
    }

    /** 오너: 특정 오퍼 수락 – 이제 금액만 보고 수락 (추가 정보 안 받음) */
    @PostMapping("/offers/{offerId}/accept")
    public ResponseEntity<Void> acceptOffer(
            Authentication auth,
            @PathVariable Long offerId
    ) {
        Long ownerUserId = currentUserIdResolver.requireUserId(auth);
        auctionService.acceptOffer(ownerUserId, offerId);
        return ResponseEntity.ok().build();
    }

    // ===== DTO =====

    @Data
    public static class CreateAuctionRequest {
        // 탭에서 선택되는 타입
        private OfferType dealType;      // SALE / JEONSE / WOLSE

        // 폼 값들
        private OfferType2 housetype;    // APART / BILLA / ONE
        private BigDecimal floor;
        private BigDecimal maintenanceFee;
        private Boolean negotiable;
        private String oftion;           // 체크박스 옵션 직렬화
        private LocalDate availableFrom;
    }

    @Data
    public static class CreateOfferRequest {
        private BigDecimal amount;       // 브로커가 입찰한 금액 (매매가/전세금/월세기준 등)
    }
}