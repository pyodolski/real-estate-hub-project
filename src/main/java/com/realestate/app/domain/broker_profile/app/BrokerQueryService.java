package com.realestate.app.domain.broker_profile.app;

import com.realestate.app.domain.broker_profile.BrokerProfile;
import com.realestate.app.domain.broker_profile.BrokerProfileRepository;
import com.realestate.app.domain.broker_profile.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class BrokerQueryService {

    private final BrokerProfileRepository repo;

    @Transactional(readOnly = true)
    public PageResponse<BrokerListItemResponse> search(String q, int page, int size, Sort sort) {
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<BrokerProfile> p = repo.searchBrokers(q, pageable);
        var list = p.map(bp -> new BrokerListItemResponse(
                bp.getUserId(),
                bp.getUser().getUsername(),    // 트랜잭션 + EntityGraph로 안전
                bp.getAgencyName(),
                bp.getLicenseNumber(),
                bp.getProfileImageUrl(),
                bp.getTotalDeals(),
                bp.getPendingDeals()
        )).getContent();
        return new PageResponse<>(list, p.getNumber(), p.getSize(), p.getTotalElements(), p.getTotalPages());
    }

    @Transactional(readOnly = true)
    public BrokerDetailResponse get(Long userId) {
        BrokerProfile bp = repo.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "broker not found"));

        var u = bp.getUser(); // 트랜잭션 + EntityGraph로 안전
        if (u.getIsActive() == null || !u.getIsActive() || !"broker".equals(u.getRoleId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "broker not found");
        }
        return new BrokerDetailResponse(
                bp.getUserId(),
                u.getUsername(),
                bp.getAgencyName(),
                bp.getLicenseNumber(),
                bp.getProfileImageUrl(),
                bp.getIntro(),
                u.getPhoneNumber(),
                bp.getTotalDeals(),
                bp.getPendingDeals()
        );
    }
}