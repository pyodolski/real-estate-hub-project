package com.realestate.app.domain.ownership;

import com.realestate.app.domain.property.Property;
import com.realestate.app.domain.user.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ownership_claims")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OwnershipClaim {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;   // 신청 고유 ID

    // 신청자 (users.id)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User applicant;

    // 매물 (properties.id)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    @Enumerated(EnumType.STRING)
    @Column(length = 16, nullable = false)
    private Status status; // 심사 상태

    // 심사 관리자 (users.id)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id")
    private User admin;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt; // 심사 완료 시각

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt; // 신청일

    @Column(name = "updated_at")
    private LocalDateTime updatedAt; // 수정일

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.status = Status.PENDING; // 기본값: 대기중
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // 신청 마감일 계산 (updated_at + 7일)
    @Transient
    public LocalDateTime getDeadline() {
        return this.updatedAt != null ? this.updatedAt.plusDays(7) : null;
    }

    // 심사 상태 Enum
    public enum Status {
        PENDING,   // 심사 대기
        APPROVED,  // 승인됨
        REJECTED   // 거절됨
    }
}

