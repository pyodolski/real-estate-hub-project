package com.realestate.app.domain.audit;

import com.realestate.app.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "action", nullable = false)
    private String action; // 수행한 작업 (APPROVE_CLAIM, REJECT_CLAIM, etc.)

    @Column(name = "entity_type", nullable = false)
    private String entityType; // 대상 엔티티 타입 (OwnershipClaim, Property, etc.)

    @Column(name = "entity_id")
    private Long entityId; // 대상 엔티티 ID

    @Column(name = "details", columnDefinition = "TEXT")
    private String details; // 상세 내용

    @Column(name = "ip_address")
    private String ipAddress; // 사용자 IP 주소

    @Column(name = "user_agent")
    private String userAgent; // 사용자 브라우저 정보

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

    // 감사 로그 액션 상수
    public static class Actions {
        public static final String APPROVE_CLAIM = "APPROVE_CLAIM";
        public static final String REJECT_CLAIM = "REJECT_CLAIM";
        public static final String CREATE_PROPERTY = "CREATE_PROPERTY";
        public static final String UPDATE_CLAIM = "UPDATE_CLAIM";
        public static final String DELETE_CLAIM = "DELETE_CLAIM";
    }

    // 엔티티 타입 상수
    public static class EntityTypes {
        public static final String OWNERSHIP_CLAIM = "OwnershipClaim";
        public static final String PROPERTY = "Property";
        public static final String USER = "User";
    }
}