package com.realestate.app.domain.property.controller;

import com.realestate.app.domain.property.table.Property;
import com.realestate.app.domain.property.dto.PropertyMarkerDto;
import com.realestate.app.domain.property.service.propertyservice;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/properties")
@RequiredArgsConstructor
public class PropertyController {

    private final propertyservice service;

    // GET /api/properties?swLat=&swLng=&neLat=&neLng=&status=AVAILABLE&minPrice=&maxPrice=
    @GetMapping
    public List<PropertyMarkerDto> inBounds(
            @RequestParam double swLat,
            @RequestParam double swLng,
            @RequestParam double neLat,
            @RequestParam double neLng,
            @RequestParam(required = false) String status,      // ← String으로 받고
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice
    ) {
        // 1) 들어온 값 로깅
        log.info("[REQ] /api/properties sw=({},{}), ne=({},{}), status={}, minPrice={}, maxPrice={}",
                swLat, swLng, neLat, neLng, status, minPrice, maxPrice);

        // 2) 경계 뒤집힘 보정
        if (neLat < swLat) { double t = swLat; swLat = neLat; neLat = t; }
        if (neLng < swLng) { double t = swLng; swLng = neLng; neLng = t; }

        // 3) status 대소문자 무시 + 잘못된 값 방어
        Property.Status statusEnum = null;
        if (status != null && !status.isBlank()) {
            try {
                statusEnum = Property.Status.valueOf(status.trim().toUpperCase());
            } catch (IllegalArgumentException ex) {
                // 잘못된 값이면 필터 미적용(또는 400을 내고 싶으면 여기서 예외 던지기)
                log.warn("invalid status '{}', ignoring status filter", status);
            }
        }

        List<PropertyMarkerDto> out =
                service.findInBounds(swLat, swLng, neLat, neLng, statusEnum, minPrice, maxPrice);

        log.info("[RES] count={}", out.size());
        return out;
    }
}
