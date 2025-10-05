package com.realestate.app.domain.property.service;

import com.realestate.app.domain.delegation.BrokerDelegationRequest;
import com.realestate.app.domain.delegation.repository.BrokerDelegationRequestRepository;
import com.realestate.app.domain.property.dto.PropertyOfferResponse;
import com.realestate.app.domain.property.dto.UpdateOfferRequest;
import com.realestate.app.domain.property.repository.PropertyOfferRepository;
import com.realestate.app.domain.property.table.PropertyOffer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Slf4j
@Service
@RequiredArgsConstructor
public class PropertyOfferService {

    private final PropertyOfferRepository offerRepository;
    private final BrokerDelegationRequestRepository delegationRepository;

    /**
     * 판매 매물 활성화/비활성화 토글
     */
    @Transactional
    public PropertyOfferResponse toggleActive(Long userId, Long offerId) {
        PropertyOffer offer = offerRepository.findById(offerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Offer not found"));

        // 소유자 권한 확인
        validateOwnership(userId, offer);

        // 활성 상태 토글
        offer.setIsActive(!offer.getIsActive());
        offerRepository.save(offer);

        log.info("[OFFER] Toggled active status - offerId: {}, newStatus: {}", offerId, offer.getIsActive());
        return PropertyOfferResponse.from(offer);
    }

    /**
     * 판매 매물 수정
     */
    @Transactional
    public PropertyOfferResponse updateOffer(Long userId, Long offerId, UpdateOfferRequest request) {
        PropertyOffer offer = offerRepository.findById(offerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Offer not found"));

        // 소유자 권한 확인
        validateOwnership(userId, offer);

        // 필드 업데이트
        if (request.housetype() != null) {
            offer.setHousetype(request.housetype());
        }
        if (request.type() != null) {
            offer.setType(request.type());
        }
        if (request.floor() != null) {
            offer.setFloor(request.floor());
        }
        if (request.oftion() != null) {
            offer.setOftion(request.oftion());
        }
        if (request.totalPrice() != null) {
            offer.setTotalPrice(request.totalPrice());
        }
        if (request.deposit() != null) {
            offer.setDeposit(request.deposit());
        }
        if (request.monthlyRent() != null) {
            offer.setMonthlyRent(request.monthlyRent());
        }
        if (request.maintenanceFee() != null) {
            offer.setMaintenanceFee(request.maintenanceFee());
        }
        if (request.negotiable() != null) {
            offer.setNegotiable(request.negotiable());
        }
        if (request.availableFrom() != null) {
            offer.setAvailableFrom(request.availableFrom());
        }
        if (request.isActive() != null) {
            offer.setIsActive(request.isActive());
        }

        offerRepository.save(offer);

        log.info("[OFFER] Updated offer - offerId: {}", offerId);
        return PropertyOfferResponse.from(offer);
    }

    /**
     * 판매 매물 삭제
     */
    @Transactional
    public void deleteOffer(Long userId, Long offerId) {
        PropertyOffer offer = offerRepository.findById(offerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Offer not found"));

        // 소유자 권한 확인
        validateOwnership(userId, offer);

        // 거래 진행 중인지 확인 (APPROVED 상태의 delegation이 있는지)
        boolean hasApprovedDelegation = delegationRepository.existsByProperty_IdAndStatus(
                offer.getProperty().getId(),
                BrokerDelegationRequest.Status.APPROVED
        );

        if (hasApprovedDelegation) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Cannot delete offer with approved delegation"
            );
        }

        offerRepository.delete(offer);
        log.info("[OFFER] Deleted offer - offerId: {}", offerId);
    }

    /**
     * 소유자 권한 확인
     */
    private void validateOwnership(Long userId, PropertyOffer offer) {
        if (offer.getProperty().getOwner() == null ||
                !offer.getProperty().getOwner().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not the owner of this property");
        }
    }
}
