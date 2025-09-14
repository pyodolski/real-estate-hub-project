package com.realestate.app.domain.ownership;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OwnershipClaimRepository extends JpaRepository<OwnershipClaim, Long> {

    // 특정 유저의 모든 신청 조회
    List<OwnershipClaim> findAllByApplicant_Id(Long userId);

    // 특정 매물에 대해 이미 신청했는지 여부 확인
    boolean existsByApplicant_IdAndProperty_Id(Long userId, Long propertyId);
}

