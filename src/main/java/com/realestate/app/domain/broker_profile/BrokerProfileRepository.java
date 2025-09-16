package com.realestate.app.domain.broker_profile;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BrokerProfileRepository extends JpaRepository<BrokerProfile, Long> {
    Optional<BrokerProfile> findByUserId(Long userId);
    boolean existsByLicenseNumber(String licenseNumber);
}
