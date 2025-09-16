/*
package com.realestate.app.controller;

import com.realestate.app.dto.PropertySummaryDto;
import com.realestate.app.service.PropertyService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// GET /api/properties?swLat&swLng&neLat&neLng&status=AVAILABLE
@RestController
public class PropertyController {

    private final PropertyService service;
    public PropertyController(PropertyService service) { this.service = service; }

    @GetMapping("/api/properties")
    public List<PropertySummaryDto> inBounds(
            @RequestParam double swLat, @RequestParam double swLng,
            @RequestParam double neLat, @RequestParam double neLng,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long minPrice,
            @RequestParam(required = false) Long maxPrice
    ) {
        return service.findInBounds(swLat, swLng, neLat, neLng, status, minPrice, maxPrice);
    }
}
*/