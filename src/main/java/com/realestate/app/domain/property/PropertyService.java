/*
package com.realestate.app.service;

import com.realestate.app.dto.PropertySummaryDto;
import com.realestate.app.repository.PropertyRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PropertyService {
    private final PropertyRepository repo;
    public PropertyService(PropertyRepository repo) { this.repo = repo; }

    public List<PropertySummaryDto> findInBounds(double swLat, double swLng,
                                                 double neLat, double neLng,
                                                 String status, Long minPrice, Long maxPrice) {
        return repo.findInBounds(swLat, swLng, neLat, neLng, status, minPrice, maxPrice);
    }
}
*/