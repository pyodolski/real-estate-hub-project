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
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

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

    /**
     * 오너가 새 경매 생성
     */
    @Transactional
    public PropertyAuction createAuction(
            Long ownerUserId,
            Long propertyId,
            AuctionController.CreateAuctionRequest body
    ) {
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
        boolean hasActiveAuction =
                auctionRepo.existsByPropertyAndStatusAndCreatedAtAfter(
                        property,
                        AuctionStatus.ONGOING,
                        cutoff
                );
        if (hasActiveAuction) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "property already has an active auction within last 30 days"
            );
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

        return offerRepo.save(offer);
    }

    /**
     * 오너가 특정 오퍼 수락
     * - 오퍼 accepted = true
     * - 경매 COMPLETED
     * - 위임 APPROVED 생성
     * - 매물 broker / listingType 갱신
     * - property_offers 에 최종 조건 저장
     *
     * offerType     SALE / JEONSE / WOLSE
     * housetype     APART / BILLA / ONE
     * availableFrom 입주 가능일 (없으면 null)
     * deposit       월세일 때 보증금 (JEONSE/WOLSE 용)
     * monthlyRent   월세 (WOLSE 용)
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

        // 5) 최종 property_offers 한 건 생성
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
            case SALE -> {
                po.setTotalPrice(offer.getAmount());
            }
            case JEONSE -> {
                po.setDeposit(offer.getAmount());
            }
            case WOLSE -> {
                // 일단 amount 를 월세로 본다고 가정 (원하면 deposit/monthlyRent 분리 필드 추가 가능)
                po.setMonthlyRent(offer.getAmount());
                // 보증금을 경매 입력으로 할지, 등록폼 값으로 할지 설계에 따라 추가
            }
        }

        propertyOfferRepo.save(po);
    }
}