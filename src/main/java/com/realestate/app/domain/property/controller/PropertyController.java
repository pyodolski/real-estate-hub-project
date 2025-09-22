package com.realestate.app.domain.property.controller;

import com.realestate.app.domain.property.table.Property;
import com.realestate.app.domain.property.dto.PropertyMarkerDto;
import com.realestate.app.domain.property.service.propertyservice;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

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
            @RequestParam(required = false) Property.Status status,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice
    ) {
        // 범위가 뒤집혀 들어오는 경우 보정 (선택)
        if (neLat < swLat) { double t = swLat; swLat = neLat; neLat = t; }
        if (neLng < swLng) { double t = swLng; swLng = neLng; neLng = t; }

        return service.findInBounds(swLat, swLng, neLat, neLng, status, minPrice, maxPrice);
    }
}
