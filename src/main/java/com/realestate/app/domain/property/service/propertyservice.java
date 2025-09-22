package com.realestate.app.domain.property.service;

import com.realestate.app.domain.property.table.Property;
import com.realestate.app.domain.property.dto.PropertyDetailDto;
import com.realestate.app.domain.property.dto.PropertyMarkerDto;
import com.realestate.app.domain.property.repository.PropertyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class propertyservice {  // ← 클래스명 대문자 시작

    private final PropertyRepository propertyRepository;

    // 지도 마커 목록
    public List<PropertyMarkerDto> findInBounds(
            double swLat, double swLng, double neLat, double neLng,
            Property.Status status, BigDecimal minPrice, BigDecimal maxPrice
    ) {
        List<Property> items = propertyRepository.findInBounds(
                swLat, swLng, neLat, neLng, status, minPrice, maxPrice
        );

        return items.stream()
                .map(p -> new PropertyMarkerDto(
                        p.getId(),
                        p.getTitle(),
                        p.getAddress(),
                        p.getPrice(),
                        p.getStatus().name(),
                        p.getLocationX(), // lat
                        p.getLocationY()  // lng
                ))
                .toList();
    }

    // 상세
    public PropertyDetailDto findOne(Long id) {
        Property p = propertyRepository.findById(id).orElseThrow();
        return new PropertyDetailDto(
                p.getId(), p.getTitle(), p.getAddress(),
                p.getPrice(), p.getStatus().name(),
                p.getLocationX(), p.getLocationY(),
                p.getListingType().name(),
                p.getCreatedAt(), p.getUpdatedAt()
        );
    }
}
