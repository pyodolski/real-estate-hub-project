package com.realestate.app.domain.property.service;

import com.realestate.app.domain.property.dto.PropertyFullResponse;
import com.realestate.app.domain.property.repository.PropertyFullRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PropertyFullQueryService {

    private final PropertyFullRepository propertyFullRepository;

    @Transactional(readOnly = true)
    public List<PropertyFullResponse> getFullPropertiesForMap() {
        return propertyFullRepository.findAllAvailableWithOffersAndImages()
                .stream()
                .map(PropertyFullResponse::from)
                .toList();
    }
}