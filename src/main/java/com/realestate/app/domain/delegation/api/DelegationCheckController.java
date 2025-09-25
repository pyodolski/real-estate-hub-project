package com.realestate.app.domain.delegation.api;

import com.realestate.app.domain.delegation.dto.BrokerDelegationRequest.Status;
import com.realestate.app.domain.delegation.repository.BrokerDelegationRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/properties")
public class DelegationCheckController {

    private final BrokerDelegationRequestRepository repo;

    /** 특정 매물에 PENDING 위임요청 존재 여부 */
    @GetMapping("/{propertyId}/delegations/pending")
    public Map<String, Object> hasPending(@PathVariable Long propertyId) {
        return repo.findFirstByProperty_IdAndStatus(propertyId, Status.PENDING)
                .map(r -> Map.<String, Object>of(
                        "hasPending", true,
                        "requestId", r.getId(),
                        "brokerUserId", r.getBroker().getUserId(),
                        "createdAt", r.getCreatedAt()
                ))
                .orElseGet(() -> Map.<String, Object>of("hasPending", false));
    }

    /** (옵션) 특정 상태로 존재 여부 확인: /api/properties/{id}/delegations/check?status=PENDING */
    @GetMapping("/{propertyId}/delegations/check")
    public Map<String, Object> hasByStatus(@PathVariable Long propertyId,
                                           @RequestParam(defaultValue = "PENDING") Status status) {
        return repo.findFirstByProperty_IdAndStatus(propertyId, status)
                .map(r -> Map.<String, Object>of(
                        "exists", true,
                        "status", r.getStatus().name(),
                        "requestId", r.getId(),
                        "brokerUserId", r.getBroker().getUserId(),
                        "createdAt", r.getCreatedAt()
                ))
                .orElseGet(() -> Map.<String, Object>of(
                        "exists", false,
                        "status", status.name()
                ));
    }
}
