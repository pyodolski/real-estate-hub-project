package com.realestate.app.domain.delegation;

import com.realestate.app.domain.broker_profile.BrokerProfile;
import com.realestate.app.domain.property.table.Property;
import com.realestate.app.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "broker_delegation_requests")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class BrokerDelegationRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 요청자(소유자) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    /** 대상 매물 */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    /** 대상 중개인 (broker_profiles.user_id FK) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "broker_user_id", referencedColumnName = "user_id", nullable = false)
    private BrokerProfile broker;

    @Enumerated(EnumType.STRING)
    @Column(length = 16, nullable = false)
    private Status status; // PENDING/APPROVED/REJECTED/CANCELED

    @Column(name = "reject_reason", columnDefinition = "TEXT")
    private String rejectReason;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (this.status == null) this.status = Status.PENDING;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public enum Status { PENDING, APPROVED, REJECTED, CANCELED }
}