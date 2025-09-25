package com.realestate.app.domain.delegation.repository;

import com.realestate.app.domain.delegation.BrokerDelegationRequest;
import com.realestate.app.domain.delegation.BrokerDelegationRequest.Status;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BrokerDelegationRequestRepository extends JpaRepository<BrokerDelegationRequest, Long> {

    boolean existsByProperty_IdAndStatus(Long propertyId, Status status);
    Optional<BrokerDelegationRequest> findFirstByProperty_IdAndStatus(Long propertyId, Status status);

    Optional<BrokerDelegationRequest> findByIdAndBroker_UserId(Long id, Long brokerUserId);
    Optional<BrokerDelegationRequest> findByIdAndOwner_Id(Long id, Long ownerUserId);

    List<BrokerDelegationRequest> findAllByBroker_UserIdAndStatus(Long brokerUserId, Status status);
    List<BrokerDelegationRequest> findAllByOwner_Id(Long ownerUserId);
}

