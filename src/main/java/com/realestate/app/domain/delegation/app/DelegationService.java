package com.realestate.app.domain.delegation.app;

import com.realestate.app.domain.broker_profile.BrokerProfile;
import com.realestate.app.domain.broker_profile.BrokerProfileRepository;
import com.realestate.app.domain.delegation.BrokerDelegationRequest;
import com.realestate.app.domain.delegation.BrokerDelegationRequest.Status;
import com.realestate.app.domain.delegation.dto.CreateDelegationRequest;
import com.realestate.app.domain.delegation.dto.DelegationResponse;
import com.realestate.app.domain.delegation.repository.BrokerDelegationRequestRepository;
import com.realestate.app.domain.property.repository.PropertyOfferRepository;
import com.realestate.app.domain.property.repository.PropertyRepository;
import com.realestate.app.domain.property.table.Property;
import com.realestate.app.domain.property.table.Property.ListingType;
import com.realestate.app.domain.property.table.PropertyOffer;
import com.realestate.app.domain.property.dto.PropertyOfferCreateRequest;
import com.realestate.app.domain.user.entity.User;
import com.realestate.app.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DelegationService {

    private final BrokerDelegationRequestRepository reqRepo;
    private final PropertyRepository propertyRepo;
    private final UserRepository userRepo;
    private final BrokerProfileRepository brokerProfileRepo;
    private final PropertyOfferRepository propertyOfferRepo;

    private final com.realestate.app.recproperty.service.RecommendationService recommendationService;

    /** 위임요청 생성 (+ 옵션: PropertyOffer 저장). 응답은 기존 6필드(offerId 미포함) */
    @Transactional
    public DelegationResponse create(Long ownerUserId, Long propertyId, CreateDelegationRequest body) {
        Property property = propertyRepo.findById(propertyId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "property not found"));
        User owner = userRepo.findById(ownerUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "owner not found"));

        if (property.getOwner() == null || !property.getOwner().getId().equals(owner.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "you are not the owner of this property");
        }

        if (reqRepo.existsByProperty_IdAndStatus(propertyId, Status.PENDING)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "already has a pending delegation");
        }

        Long brokerUserId = body.brokerUserId();
        BrokerProfile broker = brokerProfileRepo.findByUserId(brokerUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "broker profile not found"));

        // 1) 위임요청 생성
        BrokerDelegationRequest req = BrokerDelegationRequest.builder()
                .owner(owner)
                .property(property)
                .broker(broker)
                .status(Status.PENDING)
                .build();
        reqRepo.save(req);

        // 2) (옵션) 오퍼 저장
        PropertyOfferCreateRequest offer = body.offer();
        if (offer != null) {
            validateOffer(offer);
            PropertyOffer po = PropertyOffer.builder()
                    .property(property)
                    .housetype(offer.housetype())
                    .type(offer.type())
                    .floor(offer.floor())
                    .oftion(offer.oftion())
                    .totalPrice(offer.totalPrice())
                    .deposit(offer.deposit())
                    .monthlyRent(offer.monthlyRent())
                    .maintenanceFee(offer.maintenanceFee())
                    .negotiable(offer.negotiable())
                    .availableFrom(offer.availableFrom())
                    .isActive(offer.isActive() == null ? true : offer.isActive())
                    .build();
            propertyOfferRepo.save(po);

            // 오퍼가 활성 상태라면 추천 매물 알림 보내기
            if (po.getIsActive() == null || po.getIsActive()) {
                try {
                    recommendationService.notifyRecommendedUsersForNewOffer(
                            property,
                            po,
                            0.7 // threshold
                    );
                } catch (Exception e) {
                    // 위임 자체는 롤백하지 않도록 방어
                    // 필요하면 logger 사용
                    System.err.println("[RECOMMEND] failed to send recommended notifications on delegation create: " + e.getMessage());
                }
            }
        }

        return toDto(req);
    }

    @Transactional(readOnly = true)
    public List<DelegationResponse> incomingForBroker(Long brokerUserId, Status status) {
        List<BrokerDelegationRequest> requests = reqRepo.findAllByBroker_UserIdAndStatus(brokerUserId, status);
        
        // Get all property IDs
        List<Long> propertyIds = requests.stream()
                .map(r -> r.getProperty().getId())
                .toList();
        
        // Fetch all offers for these properties
        List<PropertyOffer> offers = propertyOfferRepo.findByPropertyIdIn(propertyIds);
        
        // Create a map for quick lookup
        var offerMap = offers.stream()
                .collect(java.util.stream.Collectors.groupingBy(
                        o -> o.getProperty().getId(),
                        java.util.stream.Collectors.collectingAndThen(
                                java.util.stream.Collectors.toList(),
                                list -> list.isEmpty() ? null : list.get(0)
                        )
                ));
        
        return requests.stream()
                .map(r -> toDtoWithOffer(r, offerMap.get(r.getProperty().getId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<DelegationResponse> mineForOwner(Long ownerUserId) {
        List<BrokerDelegationRequest> requests = reqRepo.findAllByOwner_Id(ownerUserId);
        
        // Get all property IDs
        List<Long> propertyIds = requests.stream()
                .map(r -> r.getProperty().getId())
                .toList();
        
        // Fetch all offers for these properties
        List<PropertyOffer> offers = propertyOfferRepo.findByPropertyIdIn(propertyIds);
        
        // Create a map for quick lookup
        var offerMap = offers.stream()
                .collect(java.util.stream.Collectors.groupingBy(
                        o -> o.getProperty().getId(),
                        java.util.stream.Collectors.collectingAndThen(
                                java.util.stream.Collectors.toList(),
                                list -> list.isEmpty() ? null : list.get(0)
                        )
                ));
        
        return requests.stream()
                .map(r -> toDtoWithOffer(r, offerMap.get(r.getProperty().getId())))
                .toList();
    }

    @Transactional
    public DelegationResponse approve(Long brokerUserId, Long requestId) {
        BrokerDelegationRequest req = reqRepo.findByIdAndBroker_UserId(requestId, brokerUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "request not found"));
        if (req.getStatus() != Status.PENDING) throw new ResponseStatusException(HttpStatus.CONFLICT, "not pending");

        Property p = req.getProperty();
        p.setBroker(req.getBroker());
        p.setListingType(ListingType.BROKER);

        req.setStatus(Status.APPROVED);
        return toDto(req);
    }

    @Transactional
    public DelegationResponse reject(Long brokerUserId, Long requestId, String reason) {
        BrokerDelegationRequest req = reqRepo.findByIdAndBroker_UserId(requestId, brokerUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "request not found"));
        if (req.getStatus() != Status.PENDING) throw new ResponseStatusException(HttpStatus.CONFLICT, "not pending");

        req.setStatus(Status.REJECTED);
        req.setRejectReason(reason);
        return toDto(req);
    }

    @Transactional
    public DelegationResponse cancel(Long ownerUserId, Long requestId) {
        BrokerDelegationRequest req = reqRepo.findByIdAndOwner_Id(requestId, ownerUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "request not found"));
        if (req.getStatus() != Status.PENDING) throw new ResponseStatusException(HttpStatus.CONFLICT, "not pending");

        req.setStatus(Status.CANCELED);
        return toDto(req);
    }

    @Transactional
    public void deleteOwn(Long ownerUserId, Long requestId) {
        var req = reqRepo.findByIdAndOwner_Id(requestId, ownerUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "request not found"));

        if (req.getStatus() == BrokerDelegationRequest.Status.APPROVED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "approved request cannot be deleted");
        }
        reqRepo.delete(req);
    }

    private DelegationResponse toDto(BrokerDelegationRequest r) {
        return new DelegationResponse(
                r.getId(),
                r.getProperty().getId(),
                r.getProperty().getTitle(),
                r.getProperty().getAddress(),
                r.getOwner().getId(),
                r.getOwner().getUsername(),
                r.getBroker().getUserId(),
                r.getBroker().getUser().getUsername(),
                r.getStatus(),
                r.getRejectReason(),
                null,
                r.getProperty().getLocationX(),
                r.getProperty().getLocationY()
        );
    }

    private DelegationResponse toDtoWithOffer(BrokerDelegationRequest r, PropertyOffer offer) {
        return new DelegationResponse(
                r.getId(),
                r.getProperty().getId(),
                r.getProperty().getTitle(),
                r.getProperty().getAddress(),
                r.getOwner().getId(),
                r.getOwner().getUsername(),
                r.getBroker().getUserId(),
                r.getBroker().getUser().getUsername(),
                r.getStatus(),
                r.getRejectReason(),
                com.realestate.app.domain.property.dto.PropertyOfferDto.from(offer),
                r.getProperty().getLocationX(),
                r.getProperty().getLocationY()
        );
    }

    private void validateOffer(PropertyOfferCreateRequest o) {
        if (o.type() == null)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "offer.type is required");

        switch (o.type()) {
            case SALE -> {
                if (o.totalPrice() == null)
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "totalPrice is required for SALE");
            }
            case JEONSE -> {
                if (o.deposit() == null)
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "deposit is required for JEONSE");
                if (o.monthlyRent() != null)
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "monthlyRent must be null for JEONSE");
            }
            case WOLSE -> {
                if (o.deposit() == null || o.monthlyRent() == null)
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "deposit and monthlyRent are required for WOLSE");
                if (o.totalPrice() != null)
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "totalPrice must be null for WOLSE");
            }
        }
    }
}