package com.realestate.app.domain.broker_profile;

import com.realestate.app.domain.broker_profile.dto.BrokerDetailResponse;
import com.realestate.app.domain.broker_profile.dto.BrokerListItemResponse;
import com.realestate.app.domain.broker_profile.dto.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/brokers")
@RequiredArgsConstructor
public class BrokerProfileController {

    private final BrokerProfileService brokerProfileService;

    /**
     * 브로커 목록 조회 (페이징)
     */
    @GetMapping
    public ResponseEntity<PageResponse<BrokerListItemResponse>> getBrokers(
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false, defaultValue = "totalDeals,desc") String sort) {
        
        Sort s = parseSort(sort);
        PageResponse<BrokerListItemResponse> brokers = brokerProfileService.searchBrokers(q, page, size, s);
        return ResponseEntity.ok(brokers);
    }

    /**
     * 브로커 목록 조회 (전체 리스트)
     */
    @GetMapping("/list")
    public ResponseEntity<List<BrokerListItemResponse>> getBrokersList(
            @RequestParam(required = false) String search) {
        
        List<BrokerListItemResponse> brokers = brokerProfileService.getAllBrokersList(search);
        return ResponseEntity.ok(brokers);
    }

    /**
     * 특정 브로커 상세 정보 조회
     */
    @GetMapping("/{userId}")
    public ResponseEntity<BrokerDetailResponse> getBrokerDetail(@PathVariable Long userId) {
        BrokerDetailResponse broker = brokerProfileService.getBrokerDetail(userId);
        return ResponseEntity.ok(broker);
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