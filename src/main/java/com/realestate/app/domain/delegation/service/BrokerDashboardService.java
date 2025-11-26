package com.realestate.app.domain.delegation.service;

import com.realestate.app.domain.delegation.dto.ManagedPropertyDto;
import com.realestate.app.domain.property.repository.PropertyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BrokerDashboardService {

    private final PropertyRepository propertyRepo;

    public List<ManagedPropertyDto> getManagedProperties(Long brokerUserId) {
        return propertyRepo.findManagedByBroker(brokerUserId).stream()
                .map(ManagedPropertyDto::from)
                .toList();
    }
}
