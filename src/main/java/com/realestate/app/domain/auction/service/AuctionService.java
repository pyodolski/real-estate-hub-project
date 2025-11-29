package com.realestate.app.domain.auction.service;

import com.realestate.app.domain.auction.api.AuctionController;
import com.realestate.app.domain.auction.entity.AuctionOffer;
import com.realestate.app.domain.auction.entity.AuctionStatus;
import com.realestate.app.domain.auction.entity.PropertyAuction;
import com.realestate.app.domain.auction.repository.AuctionOfferRepository;
import com.realestate.app.domain.auction.repository.PropertyAuctionRepository;
import com.realestate.app.domain.broker_profile.BrokerProfile;
import com.realestate.app.domain.broker_profile.BrokerProfileRepository;
import com.realestate.app.domain.delegation.BrokerDelegationRequest;
import com.realestate.app.domain.delegation.BrokerDelegationRequest.Status;
import com.realestate.app.domain.delegation.repository.BrokerDelegationRequestRepository;
import com.realestate.app.domain.property.repository.PropertyOfferRepository;
import com.realestate.app.domain.property.repository.PropertyRepository;
import com.realestate.app.domain.property.table.Property;
import com.realestate.app.domain.property.table.Property.ListingType;
import com.realestate.app.domain.property.table.PropertyOffer;
import com.realestate.app.domain.property.table.PropertyOffer.OfferType;
import com.realestate.app.domain.property.table.PropertyOffer.OfferType2;
import com.realestate.app.domain.user.entity.User;
import com.realestate.app.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuctionService {

    private final PropertyAuctionRepository auctionRepo;
    private final AuctionOfferRepository offerRepo;
    private final PropertyRepository propertyRepo;
    private final BrokerProfileRepository brokerProfileRepo;
    private final BrokerDelegationRequestRepository delegationRepo;
    private final PropertyOfferRepository propertyOfferRepo;
    private final UserRepository userRepo;

    private final com.realestate.app.domain.notification.NotificationService notificationService;
    private final com.realestate.app.recproperty.service.RecommendationService recommendationService;

    /**
     * 오너가 새 경매 생성
     */
    @Transactional
    public PropertyAuction createAuction(
            Long ownerUserId,
            Long propertyId,
            AuctionController.CreateAuctionRequest body) {
        if (body == null || body.getDealType() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "dealType is required");
        }
        if (body.getHousetype() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "housetype is required");
        }
        if (body.getFloor() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "floor is required");
        }

        Property property = propertyRepo.findById(propertyId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "property not found"));

        User owner = userRepo.findById(ownerUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "owner not found"));

        // 오너 체크
        if (property.getOwner() == null || !property.getOwner().getId().equals(ownerUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "you are not the owner of this property");
        }

        // 이미 브로커에게 위임된 매물이면 경매 불가
        if (property.getBroker() != null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "property is already delegated to a broker");
        }

        // 최근 30일 이내 ONGOING 경매 존재 여부 체크
        LocalDateTime cutoff = LocalDateTime.now().minusDays(30);
        boolean hasActiveAuction = auctionRepo.existsByPropertyAndStatusAndCreatedAtAfter(
                property,
                AuctionStatus.ONGOING,
                cutoff);
        if (hasActiveAuction) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "property already has an active auction within last 30 days");
        }

        PropertyAuction auction = PropertyAuction.builder()
                .property(property)
                .status(AuctionStatus.ONGOING)
                .createdAt(LocalDateTime.now())
                .dealType(body.getDealType())
                .housetype(body.getHousetype())
                .floor(body.getFloor())
                .availableFrom(body.getAvailableFrom())
                .maintenanceFee(body.getMaintenanceFee())
                .negotiable(body.getNegotiable())
                .oftion(body.getOftion())
                .build();

        return auctionRepo.save(auction);
    }

    /**
     * 브로커가 경매에 오퍼(입찰) 생성
     * - 항상 기존 최고가보다 커야 함
     */
    @Transactional
    public AuctionOffer createOffer(Long auctionId, Long brokerUserId, BigDecimal amount) {
        PropertyAuction auction = auctionRepo.findById(auctionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "auction not found"));

        if (auction.getStatus() != AuctionStatus.ONGOING) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "auction is not ongoing");
        }

        BrokerProfile broker = brokerProfileRepo.findByUserId(brokerUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "broker profile not found"));

        // 중복 입찰 방지
        if (offerRepo.existsByAuctionAndBroker(auction, broker)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 해당 경매에 입찰하셨습니다");
        }

        // 🔹 새 입찰 이전 최고 입찰자 (outbid 알림용)
        AuctionOffer prevTopOffer = offerRepo.findTopByAuctionOrderByAmountDesc(auction)
                .orElse(null);

        BigDecimal max = offerRepo.findMaxAmountByAuction(auction);
        if (max != null && amount.compareTo(max) <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "offer must be higher than current max " + max);
        }

        AuctionOffer offer = AuctionOffer.builder()
                .auction(auction)
                .broker(broker)
                .amount(amount)
                .accepted(false)
                .createdAt(LocalDateTime.now())
                .build();

        AuctionOffer saved = offerRepo.save(offer);

        // 1) 경매 소유자에게 "입찰 들어옴" 알림
        Property property = auction.getProperty();
        if (property != null && property.getOwner() != null) {
            Long ownerUserId = property.getOwner().getId();

            String brokerName = null;
            if (broker.getUser() != null) {
                brokerName = broker.getUser().getUsername();
            }

            notificationService.createAuctionNewBidNotificationToOwner(
                    ownerUserId,
                    auction.getId(),
                    amount,
                    brokerName);
        }

        // 2) 직전 최고 입찰자에게 "내 입찰 상회됨" 알림
        if (prevTopOffer != null
                && prevTopOffer.getBroker() != null
                && prevTopOffer.getBroker().getUser() != null) {

            Long prevBrokerUserId = prevTopOffer.getBroker().getUser().getId();

            if (!prevBrokerUserId.equals(brokerUserId)) {
                notificationService.createAuctionOutbidNotification(
                        prevBrokerUserId,
                        auction.getId(),
                        amount);
            }
        }

        return saved;
    }

    /**
     * 오너가 특정 오퍼 수락
     * - 오퍼 accepted = true
     * - 경매 COMPLETED
     * - 위임 APPROVED 생성
     * - 매물 broker / listingType 갱신
     * - property_offers 에 최종 조건 저장
     *
     * offerType SALE / JEONSE / WOLSE
     * housetype APART / BILLA / ONE
     * availableFrom 입주 가능일 (없으면 null)
     * deposit 월세일 때 보증금 (JEONSE/WOLSE 용)
     * monthlyRent 월세 (WOLSE 용)
     */
    @Transactional
    public void acceptOffer(Long ownerUserId, Long offerId) {
        AuctionOffer offer = offerRepo.findById(offerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "offer not found"));

        PropertyAuction auction = offer.getAuction();
        Property property = auction.getProperty();

        // 오너 권한
        if (property.getOwner() == null || !property.getOwner().getId().equals(ownerUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "you are not the owner of this property");
        }

        if (auction.getStatus() != AuctionStatus.ONGOING) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "auction is not ongoing");
        }

        // 이미 다른 오퍼가 수락됐는지 확인
        offerRepo.findByAuctionAndAcceptedIsTrue(auction)
                .ifPresent(a -> {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "auction already has accepted offer");
                });

        // 1) 오퍼 accepted
        offer.setAccepted(true);

        // 2) 경매 상태 COMPLETED
        auction.setStatus(AuctionStatus.COMPLETED);

        // 3) 위임 APPROVED 생성
        BrokerDelegationRequest delegation = BrokerDelegationRequest.builder()
                .owner(property.getOwner())
                .property(property)
                .broker(offer.getBroker())
                .status(Status.APPROVED)
                .build();
        delegationRepo.save(delegation);

        // 4) 매물에 브로커 붙이고 listingType 변경
        property.setBroker(offer.getBroker());
        property.setListingType(ListingType.BROKER);

        // 5) 최종 property_offers 한 건 생성 (기존 로직 그대로)
        var dealType = auction.getDealType();
        PropertyOffer po = PropertyOffer.builder()
                .property(property)
                .housetype(auction.getHousetype())
                .type(dealType)
                .floor(auction.getFloor())
                .availableFrom(auction.getAvailableFrom())
                .maintenanceFee(auction.getMaintenanceFee())
                .negotiable(auction.getNegotiable())
                .oftion(auction.getOftion())
                .isActive(true)
                .build();

        switch (dealType) {
            case SALE -> po.setTotalPrice(offer.getAmount());
            case JEONSE -> po.setDeposit(offer.getAmount());
            case WOLSE -> po.setMonthlyRent(offer.getAmount());
        }

        propertyOfferRepo.save(po);

        try {
            recommendationService.notifyRecommendedUsersForNewOffer(
                    property,
                    po,
                    0.7 // 코사인 유사도 임계값 (튜닝 가능)
            );
        } catch (Exception e) {
            // 추천/알림 실패해도 경매 수락 자체는 롤백하지 않도록 방어
            log.warn("[RECOMMEND] failed to send recommended notifications for auction offer: {} - {}",
                    offerId, e.getMessage());
        }

        // 6) 참여한 모든 브로커에게 "경매 종료" 알림 보내기
        // - winner: true / loser: false 로 구분
        var allOffers = offerRepo.findByAuction(auction);
        Long winnerBrokerUserId = (offer.getBroker() != null && offer.getBroker().getUser() != null)
                ? offer.getBroker().getUser().getId()
                : null;

        // 중복 브로커 제거 (한 브로커가 여러 번 입찰했을 수 있으므로)
        java.util.Set<Long> notified = new java.util.HashSet<>();

        for (AuctionOffer ao : allOffers) {
            if (ao.getBroker() == null || ao.getBroker().getUser() == null)
                continue;
            Long brokerUserId = ao.getBroker().getUser().getId();
            if (!notified.add(brokerUserId))
                continue; // 이미 알림 보낸 브로커는 스킵

            boolean isWinner = (winnerBrokerUserId != null && winnerBrokerUserId.equals(brokerUserId));
            notificationService.createAuctionCompletedNotification(
                    brokerUserId,
                    auction.getId(),
                    isWinner);
        }
    }

    /**
     * 브로커: 진행중인 경매 목록 조회
     */
    @Transactional(readOnly = true)
    public List<PropertyAuction> getOngoingAuctions() {
        return auctionRepo.findByStatus(AuctionStatus.ONGOING);
    }

    /**
     * 경매 상세 조회
     */
    @Transactional(readOnly = true)
    public PropertyAuction getAuction(Long auctionId) {
        return auctionRepo.findById(auctionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "auction not found"));
    }

    /**
     * 오너: 특정 경매의 입찰 목록 조회
     */
    @Transactional(readOnly = true)
    public List<AuctionOffer> getOffersByAuction(Long auctionId, Long ownerUserId) {
        PropertyAuction auction = auctionRepo.findById(auctionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "auction not found"));

        Property property = auction.getProperty();

        // 오너 권한 체크
        if (property.getOwner() == null || !property.getOwner().getId().equals(ownerUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "you are not the owner of this auction");
        }

        return offerRepo.findByAuction(auction);
    }

    /**
     * 오너: 본인 경매 목록 조회
     */
    @Transactional(readOnly = true)
    public List<PropertyAuction> getMyAuctions(Long ownerUserId) {
        return auctionRepo.findByProperty_Owner_IdOrderByCreatedAtDesc(ownerUserId);
    }

    /**
     * 오너: 경매 등록 가능한 매물 목록 조회
     */
    @Transactional(readOnly = true)
    public List<Property> getAvailablePropertiesForAuction(Long ownerUserId) {
        return propertyRepo.findAuctionAvailableProperties(ownerUserId);
    }

    /**
     * 브로커: 내가 입찰한 경매 목록 조회
     */
    @Transactional(readOnly = true)
    public List<AuctionOffer> getMyBids(Long brokerUserId) {
        return offerRepo.findByBroker_UserIdOrderByCreatedAtDesc(brokerUserId);
    }

    /**
     * 오너: 경매 취소
     * - 입찰이 없을 때만 가능
     */
    @Transactional
    public void cancelAuction(Long ownerUserId, Long auctionId) {
        PropertyAuction auction = auctionRepo.findById(auctionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "auction not found"));

        Property property = auction.getProperty();

        // 오너 권한 체크
        if (property.getOwner() == null || !property.getOwner().getId().equals(ownerUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "you are not the owner of this auction");
        }

        // 이미 완료된 경매는 취소 불가
        if (auction.getStatus() == AuctionStatus.COMPLETED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "completed auction cannot be cancelled");
        }

        // 입찰이 있으면 취소 불가 (브로커 보호)
        long offerCount = offerRepo.countByAuction(auction);
        if (offerCount > 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "입찰이 존재하는 경매는 취소할 수 없습니다. 입찰 수: " + offerCount);
        }

        // 경매 삭제
        auctionRepo.delete(auction);

        log.info("Auction cancelled - auctionId: {}, ownerId: {}", auctionId, ownerUserId);
    }
}