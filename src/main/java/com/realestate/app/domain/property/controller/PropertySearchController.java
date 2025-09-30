package com.realestate.app.domain.property.controller;

import com.realestate.app.domain.property.dto.request.SearchRequest;
import com.realestate.app.domain.property.dto.PropertyFilterDto;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import com.realestate.app.domain.property.repository.PropertySearchRepository;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/properties")
public class PropertySearchController {

    private final PropertySearchRepository repository;

    @PostMapping("/search")
    public List<PropertyFilterDto> search(@RequestBody SearchRequest req) {
        return repository.search(req);
    }
}