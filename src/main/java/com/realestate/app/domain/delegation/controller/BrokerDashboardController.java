package com.realestate.app.domain.property.controller;

import com.realestate.app.domain.delegation.dto.ManagedPropertyDto;
import com.realestate.app.domain.delegation.service.BrokerDashboardService;
import com.realestate.app.domain.property.dto.BrokerMapPropertyDto;
import com.realestate.app.domain.property.repository.PropertyRepository;
import com.realestate.app.global.security.CurrentUserIdResolver;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/broker/dashboard")
public class BrokerDashboardController {

    private final PropertyRepository propertyRepository;
    private final BrokerDashboardService brokerDashboardService;
    private final CurrentUserIdResolver currentUserIdResolver;

    /** ✅ 지도용 - 현재 브로커가 관리중인 매물만 */
    @GetMapping("/map-properties")
    public List<BrokerMapPropertyDto> mapProperties(Authentication auth) {
        Long brokerUserId = currentUserIdResolver.requireUserId(auth);
        return propertyRepository.findManagedForBroker(brokerUserId)
                .stream()
                .map(BrokerMapPropertyDto::from)
                .toList();
    }

    /** ✅ 왼쪽 패널 "관리중인 매물 목록" */
    @GetMapping("/managed-properties")
    public List<ManagedPropertyDto> managed(Authentication auth) {
        Long brokerUserId = currentUserIdResolver.requireUserId(auth);
        return brokerDashboardService.getManagedProperties(brokerUserId);
    }
}
