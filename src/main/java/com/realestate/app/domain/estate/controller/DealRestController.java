package com.realestate.app.domain.estate.controller;

import com.realestate.app.domain.estate.dto.DealResponse;
import com.realestate.app.domain.estate.dto.GetDealsRequest;
import com.realestate.app.domain.estate.service.DealService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/deals")
@RequiredArgsConstructor
public class DealRestController {

    private final DealService dealService;

    @PostMapping("/by-property")
    public List<DealResponse> getDealsByProperty(@RequestBody GetDealsRequest request) {
        return dealService.getDeals(request.propertyId());
    }
}
