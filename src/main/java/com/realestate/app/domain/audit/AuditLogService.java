package com.realestate.app.domain.audit;

import com.realestate.app.domain.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    /**
     * 감사 로그 생성
     */
    public void createAuditLog(User user, String action, String entityType, Long entityId, 
                              String details, HttpServletRequest request) {
        AuditLog auditLog = AuditLog.builder()
                .user(user)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .details(details)
                .ipAddress(getClientIpAddress(request))
                .userAgent(request != null ? request.getHeader("User-Agent") : null)
                .build();

        auditLogRepository.save(auditLog);
    }

    /**
     * 감사 로그 생성 (간단 버전)
     */
    public void createAuditLog(User user, String action, String entityType, Long entityId, String details) {
        createAuditLog(user, action, entityType, entityId, details, null);
    }

    /**
     * 특정 사용자의 감사 로그 조회
     */
    @Transactional(readOnly = true)
    public List<AuditLog> getUserAuditLogs(Long userId) {
        return auditLogRepository.findByUser_IdOrderByCreatedAtDesc(userId);
    }

    /**
     * 특정 엔티티의 감사 로그 조회
     */
    @Transactional(readOnly = true)
    public List<AuditLog> getEntityAuditLogs(String entityType, Long entityId) {
        return auditLogRepository.findByEntityTypeAndEntityIdOrderByCreatedAtDesc(entityType, entityId);
    }

    /**
     * 날짜 범위로 감사 로그 조회
     */
    @Transactional(readOnly = true)
    public List<AuditLog> getAuditLogsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return auditLogRepository.findByCreatedAtBetweenOrderByCreatedAtDesc(startDate, endDate);
    }

    /**
     * 클라이언트 IP 주소 추출
     */
    private String getClientIpAddress(HttpServletRequest request) {
        if (request == null) {
            return null;
        }

        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty() && !"unknown".equalsIgnoreCase(xForwardedFor)) {
            return xForwardedFor.split(",")[0].trim();
        }

        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty() && !"unknown".equalsIgnoreCase(xRealIp)) {
            return xRealIp;
        }

        return request.getRemoteAddr();
    }
}