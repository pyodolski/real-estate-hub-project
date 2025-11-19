package com.realestate.app.domain.property.controller;

import com.realestate.app.domain.property.dto.PropertyFullResponse;
import com.realestate.app.domain.property.service.PropertyFullQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class PropertyFullController {

    private final PropertyFullQueryService propertyFullQueryService;

    @GetMapping("/api/properties/full")
    public List<PropertyFullResponse> getFullProperties() {
        return propertyFullQueryService.getFullPropertiesForMap();
    }
}