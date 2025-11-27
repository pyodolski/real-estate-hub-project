package com.realestate.app.domain.property.controller;

import com.realestate.app.domain.property.dto.PropertyImageResponse;
import com.realestate.app.domain.property.service.PropertyImageQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/properties")
public class PropertyImageQueryController {

    private final PropertyImageQueryService propertyImageQueryService;

    // GET /api/properties/{propertyId}/images
    @GetMapping("/{propertyId}/images")
    public ResponseEntity<List<PropertyImageResponse>> getImages(
            @PathVariable Long propertyId
    ) {
        List<PropertyImageResponse> images = propertyImageQueryService.getImagesByPropertyId(propertyId);
        return ResponseEntity.ok(images);
    }
}
