package com.realestate.app.domain.delegation.api;

import com.realestate.app.domain.delegation.BrokerDelegationRequest.Status;
import com.realestate.app.domain.delegation.app.DelegationService;
import com.realestate.app.domain.delegation.dto.CreateDelegationRequest;
import com.realestate.app.domain.delegation.dto.DecisionRequest;
import com.realestate.app.domain.delegation.dto.DelegationResponse;
import com.realestate.app.global.security.CurrentUserIdResolver;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.ResponseStatus;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class DelegationController {

    private final DelegationService service;
    private final CurrentUserIdResolver currentUserIdResolver;

    /** 소유자: 위임요청 생성 */
    @PostMapping("/properties/{propertyId}/delegations")
    public DelegationResponse create(Authentication auth,
                                     @PathVariable Long propertyId,
                                     @RequestBody CreateDelegationRequest body) {
        Long ownerUserId = currentUserIdResolver.requireUserId(auth);
        return service.create(ownerUserId, propertyId, body.brokerUserId());
    }

    /** 브로커: 받은 요청 목록 */
    @GetMapping("/delegations/incoming")
    public List<DelegationResponse> incoming(Authentication auth,
                                             @RequestParam(defaultValue = "PENDING") Status status) {
        Long brokerUserId = currentUserIdResolver.requireUserId(auth);
        return service.incomingForBroker(brokerUserId, status);
    }

    /** 소유자: 내가 만든 요청 목록 */
    @GetMapping("/delegations/mine")
    public List<DelegationResponse> mine(Authentication auth) {
        Long ownerUserId = currentUserIdResolver.requireUserId(auth);
        return service.mineForOwner(ownerUserId);
    }

    /** 브로커: 승인 */
    @PostMapping("/delegations/{id}/approve")
    public DelegationResponse approve(Authentication auth, @PathVariable Long id) {
        Long brokerUserId = currentUserIdResolver.requireUserId(auth);
        return service.approve(brokerUserId, id);
    }

    /** 브로커: 거절 */
    @PostMapping("/delegations/{id}/reject")
    public DelegationResponse reject(Authentication auth, @PathVariable Long id,
                                     @RequestBody(required = false) DecisionRequest body) {
        Long brokerUserId = currentUserIdResolver.requireUserId(auth);
        String reason = body == null ? null : body.reason();
        return service.reject(brokerUserId, id, reason);
    }

    /** 소유자: 취소 */
    @PostMapping("/delegations/{id}/cancel")
    public DelegationResponse cancel(Authentication auth, @PathVariable Long id) {
        Long ownerUserId = currentUserIdResolver.requireUserId(auth);
        return service.cancel(ownerUserId, id);
    }

    /** 소유자: 목록에서 요청 제거 */
    @DeleteMapping("/delegations/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(Authentication auth, @PathVariable Long id) {
        Long ownerUserId = currentUserIdResolver.requireUserId(auth);
        service.deleteOwn(ownerUserId, id);
    }
}
