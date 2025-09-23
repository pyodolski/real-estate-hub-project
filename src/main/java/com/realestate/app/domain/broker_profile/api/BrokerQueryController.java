package com.realestate.app.domain.broker_profile.api;

import com.realestate.app.domain.broker_profile.app.BrokerQueryService;
import com.realestate.app.domain.broker_profile.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/brokers")
public class BrokerQueryController {

    private final BrokerQueryService service;

    /** 브로커 목록(검색/페이지/정렬) */
    @GetMapping
    public PageResponse<BrokerListItemResponse> list(
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false, defaultValue = "totalDeals,desc") String sort
    ) {
        // sort 파싱: "field,dir"
        Sort s = parseSort(sort);
        return service.search(q, page, size, s);
    }

    /** 브로커 상세 (userId = broker_profiles.user_id) */
    @GetMapping("/{userId}")
    public BrokerDetailResponse detail(@PathVariable Long userId) {
        return service.get(userId);
    }

    private Sort parseSort(String sort) {
        try {
            if (sort == null || sort.isBlank()) return Sort.by(Sort.Order.desc("totalDeals"));
            String[] parts = sort.split(",");
            String prop = parts[0].trim();
            String dir  = parts.length > 1 ? parts[1].trim().toLowerCase() : "asc";
            return "desc".equals(dir) ? Sort.by(Sort.Order.desc(prop)) : Sort.by(Sort.Order.asc(prop));
        } catch (Exception e) {
            return Sort.by(Sort.Order.desc("totalDeals"));
        }
    }
}