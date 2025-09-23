package com.realestate.app.domain.broker_profile;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface BrokerProfileRepository extends JpaRepository<BrokerProfile, Long> {

    @EntityGraph(attributePaths = "user") // ← user까지 한 번에 로딩
    Optional<BrokerProfile> findByUserId(Long userId);

    /** 브로커 검색 (username/agencyName/licenseNumber) + 활성 유저 + broker 역할 */
    @EntityGraph(attributePaths = "user") // ← 페이지 조회 시에도 user 미리 로딩
    @Query(
            value = """
            select bp
            from BrokerProfile bp
            join bp.user u
            where u.isActive = true
              and u.roleId = 'broker'
              and (
                    :q is null or :q = '' or
                    lower(u.username) like lower(concat('%', :q, '%')) or
                    lower(bp.agencyName) like lower(concat('%', :q, '%')) or
                    lower(bp.licenseNumber) like lower(concat('%', :q, '%'))
                  )
            """,
            countQuery = """
            select count(bp)
            from BrokerProfile bp
            join bp.user u
            where u.isActive = true
              and u.roleId = 'broker'
              and (
                    :q is null or :q = '' or
                    lower(u.username) like lower(concat('%', :q, '%')) or
                    lower(bp.agencyName) like lower(concat('%', :q, '%')) or
                    lower(bp.licenseNumber) like lower(concat('%', :q, '%'))
                  )
            """
    )
    Page<BrokerProfile> searchBrokers(@Param("q") String q, Pageable pageable);
}