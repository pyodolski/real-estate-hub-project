package com.realestate.app.domain.ownership;

import com.realestate.app.domain.property.Property;
import com.realestate.app.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

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

    // 신청자 정보
    @Column(name = "applicant_name", nullable = false)
    private String applicantName; // 신청자 실명

    @Column(name = "applicant_phone", nullable = false)
    private String applicantPhone; // 신청자 연락처

    @Column(name = "relationship_to_property", nullable = false)
    private String relationshipToProperty; // 매물과의 관계 (소유자, 임차인 등)

    @Column(name = "additional_info", columnDefinition = "TEXT")
    private String additionalInfo; // 추가 설명

    // === 지도 API 연동을 위한 위치 정보 ===
    @Column(name = "property_address")
    private String propertyAddress; // 지도에서 선택한 주소

    @Column(name = "location_x")
    private Double locationX; // 경도 (longitude)

    @Column(name = "location_y")
    private Double locationY; // 위도 (latitude)

    @Column(name = "building_name")
    private String buildingName; // 건물명

    @Column(name = "detailed_address")
    private String detailedAddress; // 상세 주소 (동/호수 등)

    @Column(name = "postal_code")
    private String postalCode; // 우편번호

    // 첨부 문서들
    @OneToMany(mappedBy = "claim", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<OwnershipDocument> documents = new ArrayList<>();

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason; // 거절 사유

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

