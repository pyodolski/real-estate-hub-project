package com.realestate.app.domain.property.controller;


import com.realestate.app.domain.auth.security.AuthUser;
import com.realestate.app.domain.property.dto.CompleteDealRequest;
import com.realestate.app.domain.property.dto.JeonseRatioResponse;
import com.realestate.app.domain.property.dto.PropertyFullResponse;
import com.realestate.app.domain.property.repository.PropertyFullRepository;
import com.realestate.app.domain.property.service.JeonseRatioService;
import com.realestate.app.domain.property.table.Property;
import com.realestate.app.domain.property.dto.PropertyMarkerDto;
import com.realestate.app.domain.property.service.propertyservice;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/properties")
@RequiredArgsConstructor
public class PropertyController {

    private final propertyservice service;
    private final JeonseRatioService jeonseRatioService;
    private final PropertyFullRepository propertyFullRepository;
    // GET /api/properties?swLat=&swLng=&neLat=&neLng=&status=AVAILABLE&minPrice=&maxPrice=
    @GetMapping
    public List<PropertyFullResponse> getInBounds(
            @RequestParam double swLat,
            @RequestParam double swLng,
            @RequestParam double neLat,
            @RequestParam double neLng,
            @RequestParam(required = false) String status
    ) {
        // status 파라미터는 일단 무시하고, AVAILABLE + isActive = true 조건만 사용
        List<Property> props =
                propertyFullRepository.findAllAvailableInBoundsWithOffersAndImages(
                        swLat, swLng, neLat, neLng
                );

        return props.stream()
                .map(PropertyFullResponse::from)
                .toList();
    }



    @GetMapping("/{id}/full")
    public PropertyFullResponse getOne(@PathVariable Long id) {
        Property p = propertyFullRepository.findByIdWithActiveOffersAndImages(id)
                .orElseThrow();
        return PropertyFullResponse.from(p);
    }


    // ✅ 최종 경로: POST /api/properties/{id}/complete
    @PostMapping("/{id}/complete")
    @PreAuthorize("hasRole('BROKER')")
    public ResponseEntity<Void> completeDeal(
            @PathVariable Long id,
            @AuthenticationPrincipal(expression = "id") Long brokerUserId,
            @RequestBody(required = false) CompleteDealRequest body
    ) {
        if (brokerUserId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
        }
        Long newOwnerId = (body == null ? null : body.newOwnerId());
        service.completeDealByBroker(id, brokerUserId, newOwnerId);
        return ResponseEntity.noContent().build(); // 204
    }

    @GetMapping("/{propertyId}/jeonse-ratio")
    public JeonseRatioResponse jeonseRatioByProperty(
            @PathVariable Long propertyId,
            @RequestParam(value = "salePriceFallback", required = false) BigDecimal salePriceFallback
    ) {
        return jeonseRatioService.computeByProperty(propertyId, salePriceFallback);
    }
}