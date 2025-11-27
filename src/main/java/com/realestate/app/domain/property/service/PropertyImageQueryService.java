package com.realestate.app.domain.property.service;

import com.realestate.app.domain.property.dto.PropertyImageResponse;
import com.realestate.app.domain.property.repository.PropertyImageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PropertyImageQueryService {

    private final PropertyImageRepository imageRepo;

    @Transactional(readOnly = true)
    public List<PropertyImageResponse> getImagesByPropertyId(Long propertyId) {
        return imageRepo.findByProperty_Id(propertyId).stream()
                .map(PropertyImageResponse::from)
                .toList();
    }
}
