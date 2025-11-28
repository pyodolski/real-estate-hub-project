package com.realestate.app.domain.auction.api;

import com.realestate.app.domain.auction.service.AuctionService;
import com.realestate.app.domain.auction.entity.AuctionOffer;
import com.realestate.app.domain.auction.entity.PropertyAuction;
import com.realestate.app.domain.property.table.Property;
import com.realestate.app.domain.property.table.PropertyOffer.OfferType;
import com.realestate.app.domain.property.table.PropertyOffer.OfferType2;
import com.realestate.app.global.security.CurrentUserIdResolver;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

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

    /** 브로커: 진행중인 경매 목록 조회 */
    @GetMapping
    public ResponseEntity<List<AuctionResponse>> getOngoingAuctions() {
        var auctions = auctionService.getOngoingAuctions();
        var response = auctions.stream()
                .map(this::toAuctionResponse)
                .toList();
        return ResponseEntity.ok(response);
    }

    /** 경매 상세 조회 */
    @GetMapping("/{auctionId}")
    public ResponseEntity<AuctionResponse> getAuction(@PathVariable Long auctionId) {
        var auction = auctionService.getAuction(auctionId);
        return ResponseEntity.ok(toAuctionResponse(auction));
    }

    /** 오너: 특정 경매의 입찰 목록 조회 */
    @GetMapping("/{auctionId}/offers")
    public ResponseEntity<List<OfferResponse>> getOffers(
            Authentication auth,
            @PathVariable Long auctionId
    ) {
        Long ownerUserId = currentUserIdResolver.requireUserId(auth);
        var offers = auctionService.getOffersByAuction(auctionId, ownerUserId);
        var response = offers.stream()
                .map(this::toOfferResponse)
                .toList();
        return ResponseEntity.ok(response);
    }

    /** 오너: 본인 경매 목록 조회 */
    @GetMapping("/my")
    public ResponseEntity<List<AuctionResponse>> getMyAuctions(Authentication auth) {
        Long ownerUserId = currentUserIdResolver.requireUserId(auth);
        var auctions = auctionService.getMyAuctions(ownerUserId);
        var response = auctions.stream()
                .map(this::toAuctionResponse)
                .toList();
        return ResponseEntity.ok(response);
    }

    /** 오너: 경매 등록 가능한 매물 목록 조회 */
    @GetMapping("/available-properties")
    public ResponseEntity<List<AvailablePropertyResponse>> getAvailableProperties(Authentication auth) {
        Long ownerUserId = currentUserIdResolver.requireUserId(auth);
        var properties = auctionService.getAvailablePropertiesForAuction(ownerUserId);
        var response = properties.stream()
                .map(this::toAvailablePropertyResponse)
                .toList();
        return ResponseEntity.ok(response);
    }

    /** 브로커: 내가 입찰한 경매 목록 조회 */
    @GetMapping("/my-bids")
    public ResponseEntity<List<MyBidResponse>> getMyBids(Authentication auth) {
        Long brokerUserId = currentUserIdResolver.requireUserId(auth);
        var bids = auctionService.getMyBids(brokerUserId);
        var response = bids.stream()
                .map(this::toMyBidResponse)
                .toList();
        return ResponseEntity.ok(response);
    }

    /** 오너: 경매 취소 (입찰이 없을 때만 가능) */
    @DeleteMapping("/{auctionId}")
    public ResponseEntity<Void> cancelAuction(
            Authentication auth,
            @PathVariable Long auctionId
    ) {
        Long ownerUserId = currentUserIdResolver.requireUserId(auth);
        auctionService.cancelAuction(ownerUserId, auctionId);
        return ResponseEntity.ok().build();
    }

    private AvailablePropertyResponse toAvailablePropertyResponse(Property property) {
        return AvailablePropertyResponse.builder()
                .id(property.getId())
                .title(property.getTitle())
                .address(property.getAddress())
                .areaM2(property.getAreaM2())
                .buildingYear(property.getBuildingYear())
                .createdAt(property.getCreatedAt())
                .build();
    }

    private AuctionResponse toAuctionResponse(PropertyAuction auction) {
        var property = auction.getProperty();
        return AuctionResponse.builder()
                .id(auction.getId())
                .propertyId(property.getId())
                .propertyAddress(property.getAddress())
                .status(auction.getStatus().name())
                .dealType(auction.getDealType().name())
                .housetype(auction.getHousetype().name())
                .floor(auction.getFloor())
                .availableFrom(auction.getAvailableFrom())
                .maintenanceFee(auction.getMaintenanceFee())
                .negotiable(auction.getNegotiable())
                .oftion(auction.getOftion())
                .createdAt(auction.getCreatedAt())
                .build();
    }

    private OfferResponse toOfferResponse(AuctionOffer offer) {
        var broker = offer.getBroker();
        return OfferResponse.builder()
                .id(offer.getId())
                .brokerId(broker.getUserId())
                .brokerName(broker.getUser() != null ? broker.getUser().getUsername() : null)
                .amount(offer.getAmount())
                .accepted(offer.getAccepted())
                .createdAt(offer.getCreatedAt())
                .build();
    }

    private MyBidResponse toMyBidResponse(AuctionOffer offer) {
        var auction = offer.getAuction();
        var property = auction.getProperty();
        return MyBidResponse.builder()
                .offerId(offer.getId())
                .auctionId(auction.getId())
                .propertyId(property.getId())
                .propertyAddress(property.getAddress())
                .auctionStatus(auction.getStatus().name())
                .dealType(auction.getDealType().name())
                .housetype(auction.getHousetype().name())
                .myBidAmount(offer.getAmount())
                .isAccepted(offer.getAccepted())
                .bidCreatedAt(offer.getCreatedAt())
                .auctionCreatedAt(auction.getCreatedAt())
                .build();
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

    @Data
    @Builder
    public static class AuctionResponse {
        private Long id;
        private Long propertyId;
        private String propertyAddress;
        private String status;
        private String dealType;
        private String housetype;
        private BigDecimal floor;
        private LocalDate availableFrom;
        private BigDecimal maintenanceFee;
        private Boolean negotiable;
        private String oftion;
        private LocalDateTime createdAt;
    }

    @Data
    @Builder
    public static class OfferResponse {
        private Long id;
        private Long brokerId;
        private String brokerName;
        private BigDecimal amount;
        private Boolean accepted;
        private LocalDateTime createdAt;
    }

    @Data
    @Builder
    public static class AvailablePropertyResponse {
        private Long id;
        private String title;
        private String address;
        private BigDecimal areaM2;
        private Integer buildingYear;
        private LocalDateTime createdAt;
    }

    @Data
    @Builder
    public static class MyBidResponse {
        private Long offerId;
        private Long auctionId;
        private Long propertyId;
        private String propertyAddress;
        private String auctionStatus;
        private String dealType;
        private String housetype;
        private BigDecimal myBidAmount;
        private Boolean isAccepted;
        private LocalDateTime bidCreatedAt;
        private LocalDateTime auctionCreatedAt;
    }
}