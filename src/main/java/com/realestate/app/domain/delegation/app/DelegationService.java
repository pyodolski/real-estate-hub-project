package com.realestate.app.domain.delegation.app;

import com.realestate.app.domain.broker_profile.BrokerProfile;
import com.realestate.app.domain.broker_profile.BrokerProfileRepository;
import com.realestate.app.domain.delegation.BrokerDelegationRequest;
import com.realestate.app.domain.delegation.BrokerDelegationRequest.Status;
import com.realestate.app.domain.delegation.dto.DelegationResponse;
import com.realestate.app.domain.delegation.repository.BrokerDelegationRequestRepository;
import com.realestate.app.domain.property.table.Property;
import com.realestate.app.domain.property.table.Property.ListingType;
import com.realestate.app.domain.property.repository.PropertyRepository;
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

    @Transactional
    public DelegationResponse create(Long ownerUserId, Long propertyId, Long brokerUserId) {
        Property property = propertyRepo.findById(propertyId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "property not found"));
        User owner = userRepo.findById(ownerUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "owner not found"));

        if (property.getOwner() == null || !property.getOwner().getId().equals(owner.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "you are not the owner of this property");
        }

        // 단일 PENDING 보장
        if (reqRepo.existsByProperty_IdAndStatus(propertyId, Status.PENDING)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "already has a pending delegation");
        }

        BrokerProfile broker = brokerProfileRepo.findByUserId(brokerUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "broker profile not found"));

        BrokerDelegationRequest req = BrokerDelegationRequest.builder()
                .owner(owner)
                .property(property)
                .broker(broker)
                .status(Status.PENDING)
                .build();

        reqRepo.save(req);
        return toDto(req);
    }

    @Transactional(readOnly = true)
    public List<DelegationResponse> incomingForBroker(Long brokerUserId, Status status) {
        return reqRepo.findAllByBroker_UserIdAndStatus(brokerUserId, status).stream()
                .map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public List<DelegationResponse> mineForOwner(Long ownerUserId) {
        return reqRepo.findAllByOwner_Id(ownerUserId).stream()
                .map(this::toDto).toList();
    }

    @Transactional
    public DelegationResponse approve(Long brokerUserId, Long requestId) {
        BrokerDelegationRequest req = reqRepo.findByIdAndBroker_UserId(requestId, brokerUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "request not found"));
        if (req.getStatus() != Status.PENDING) throw new ResponseStatusException(HttpStatus.CONFLICT, "not pending");

        // 승인: 매물에 중개인 지정 + listingType=BROKER
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

        // 트리거가 PENDING 삭제 시 pending_deals를 알아서 -1 해줌
        reqRepo.delete(req);
    }

    private DelegationResponse toDto(BrokerDelegationRequest r) {
        return new DelegationResponse(
                r.getId(),
                r.getProperty().getId(),
                r.getOwner().getId(),
                r.getBroker().getUserId(),
                r.getStatus(),
                r.getRejectReason()
        );
    }
}