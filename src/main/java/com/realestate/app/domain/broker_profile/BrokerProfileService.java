package com.realestate.app.domain.broker_profile;

import com.realestate.app.domain.broker_profile.dto.BrokerDetailResponse;
import com.realestate.app.domain.broker_profile.dto.BrokerListItemResponse;
import com.realestate.app.domain.broker_profile.dto.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BrokerProfileService {

    private final BrokerProfileRepository brokerProfileRepository;

    /**
     * 브로커 검색 (페이징)
     */
    public PageResponse<BrokerListItemResponse> searchBrokers(String q, int page, int size, Sort sort) {
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<BrokerProfile> p = brokerProfileRepository.searchBrokers(q, pageable);
        
        var list = p.map(bp -> new BrokerListItemResponse(
                bp.getUserId(),
                bp.getUser().getUsername(),
                bp.getAgencyName(),
                bp.getLicenseNumber(),
                bp.getProfileImageUrl(),
                bp.getTotalDeals(),
                bp.getPendingDeals()
        )).getContent();
        
        return new PageResponse<>(list, p.getNumber(), p.getSize(), p.getTotalElements(), p.getTotalPages());
    }

    /**
     * 모든 브로커 프로필 조회 (리스트)
     */
    public List<BrokerListItemResponse> getAllBrokersList(String search) {
        Pageable pageable = PageRequest.of(0, 100, Sort.by("totalDeals").descending());
        Page<BrokerProfile> brokerProfiles = brokerProfileRepository.searchBrokers(search, pageable);
        
        return brokerProfiles.getContent()
                .stream()
                .map(bp -> new BrokerListItemResponse(
                        bp.getUserId(),
                        bp.getUser().getUsername(),
                        bp.getAgencyName(),
                        bp.getLicenseNumber(),
                        bp.getProfileImageUrl(),
                        bp.getTotalDeals(),
                        bp.getPendingDeals()
                ))
                .collect(Collectors.toList());
    }

    /**
     * 특정 브로커 프로필 조회
     */
    public BrokerDetailResponse getBrokerDetail(Long userId) {
        BrokerProfile bp = brokerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "broker not found"));

        var u = bp.getUser();
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