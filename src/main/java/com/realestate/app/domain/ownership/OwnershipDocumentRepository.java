package com.realestate.app.domain.ownership;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OwnershipDocumentRepository extends JpaRepository<OwnershipDocument, Long> {
    
    List<OwnershipDocument> findByClaimId(Long claimId);
    
    void deleteByClaimId(Long claimId);
}