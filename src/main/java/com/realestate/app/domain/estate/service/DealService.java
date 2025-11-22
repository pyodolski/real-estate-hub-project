package com.realestate.app.domain.estate.service;

import com.realestate.app.domain.estate.dto.DealResponse;
import com.realestate.app.domain.estate.repository.DealRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DealService {

    private final DealRepository dealRepository;

    public List<DealResponse> getDeals(Long propertyId) {
        return dealRepository.findDeals(propertyId);
    }
}
