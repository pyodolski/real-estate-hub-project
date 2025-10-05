package com.realestate.app.domain.property.service;

import com.realestate.app.domain.property.table.Property;
import com.realestate.app.domain.property.dto.PropertyDetailDto;
import com.realestate.app.domain.property.dto.PropertyMarkerDto;
import com.realestate.app.domain.property.repository.PropertyRepository;
import com.realestate.app.domain.user.entity.User;
import com.realestate.app.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class propertyservice {

    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;

    /** 지도 마커 목록 */
    public List<PropertyMarkerDto> findInBounds(
            double swLat, double swLng, double neLat, double neLng,
            com.realestate.app.domain.property.table.Property.Status status,
            BigDecimal minPrice, BigDecimal maxPrice
    ) {
        List<Property> items = propertyRepository.findInBounds(
                swLat, swLng, neLat, neLng, status, minPrice, maxPrice
        );

        // ✅ lat = locationY, lng = locationX
        return items.stream()
                .map(p -> new PropertyMarkerDto(
                        p.getId(),
                        p.getTitle(),
                        p.getAddress(),
                        p.getPrice(),
                        p.getStatus().name(),
                        p.getLocationY(), // lat ✅
                        p.getLocationX()  // lng ✅
                ))
                .toList();
    }

    /** 상세 */
    public PropertyDetailDto findOne(Long id) {
        Property p = propertyRepository.findById(id).orElseThrow();

        // ✅ lat = Y, lng = X
        return new PropertyDetailDto(
                p.getId(),
                p.getTitle(),
                p.getAddress(),
                p.getPrice(),
                p.getStatus().name(),
                p.getLocationY(),  // lat ✅
                p.getLocationX(),  // lng ✅
                p.getListingType().name(),
                p.getCreatedAt(),
                p.getUpdatedAt()
        );
    }

    @Transactional
    public void completeDealByBroker(Long propertyId, Long brokerUserId, Long newOwnerIdOrNull) {
        Property p = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new NoSuchElementException("property not found"));

        // 1) 권한/전이 가능 상태 검증
        if (p.getListingType() != Property.ListingType.BROKER) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "not a BROKER listing");
        }
        if (p.getBroker() == null || p.getBroker().getUserId() == null ||
                !p.getBroker().getUserId().equals(brokerUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "not the broker of this property");
        }
        if (p.getStatus() == Property.Status.SOLD || p.getStatus() == Property.Status.HIDDEN) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "invalid status transition from " + p.getStatus());
        }

        // 2) 소유자 변경
        if (newOwnerIdOrNull != null) {
            User newOwner = userRepository.findById(newOwnerIdOrNull)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "new owner not found"));

            if (p.getOwner() != null && p.getOwner().getId().equals(newOwner.getId())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "new owner is same as current owner");
            }

            p.setOwner(newOwner);

        }

        p.setStatus(Property.Status.SOLD);
        p.setUpdatedAt(OffsetDateTime.now().toLocalDateTime());
    }

}
