package com.realestate.app.domain.property.controller;


import com.realestate.app.domain.property.service.PropertyImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/properties")
public class PropertyImageController {

    private final PropertyImageService propertyImageService;

    @PostMapping("/{propertyId}/images")
    public ResponseEntity<?> uploadImage(
            @PathVariable Long propertyId,
            @RequestParam("file") MultipartFile file
    ) {
        String imageUrl = propertyImageService.uploadImage(propertyId, file);
        return ResponseEntity.ok(Map.of("imageUrl", imageUrl));
    }

}
