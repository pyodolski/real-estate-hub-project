package com.realestate.app.domain.audit;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    
    // 특정 사용자의 감사 로그 조회
    List<AuditLog> findByUser_IdOrderByCreatedAtDesc(Long userId);
    
    // 특정 엔티티의 감사 로그 조회
    List<AuditLog> findByEntityTypeAndEntityIdOrderByCreatedAtDesc(String entityType, Long entityId);
    
    // 특정 액션의 감사 로그 조회
    List<AuditLog> findByActionOrderByCreatedAtDesc(String action);
    
    // 날짜 범위로 감사 로그 조회
    List<AuditLog> findByCreatedAtBetweenOrderByCreatedAtDesc(LocalDateTime startDate, LocalDateTime endDate);
}