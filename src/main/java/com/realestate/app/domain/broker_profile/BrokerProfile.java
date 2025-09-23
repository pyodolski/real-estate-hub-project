package com.realestate.app.domain.broker_profile;

import com.realestate.app.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "broker_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BrokerProfile {

    @Id
    @Column(name = "user_id")
    private Long userId;  // users.id와 1:1 매핑되는 PK

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId // user_id를 PK + FK로 함께 사용
    @JoinColumn(name = "user_id")
    private User user; // User 엔티티와 1:1 관계

    @Column(name = "license_number", nullable = false, unique = true, length = 255)
    private String licenseNumber;  // 중개사 면허 번호

    @Column(name = "agency_name", length = 255)
    private String agencyName;     // 소속 중개사무소 이름

    @Column(name = "intro", columnDefinition = "TEXT")
    private String intro;          // 프로필 소개문

    @Column(name = "profile_image_url", length = 500)
    private String profileImageUrl; // 프로필 사진 URL

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt; // 생성일

    @Column(name = "updated_at")
    private LocalDateTime updatedAt; // 수정일

    @Column(name = "total_deals", nullable = false)
    @Builder.Default
    private Integer totalDeals = 0;

    @Column(name = "pending_deals", nullable = false)
    @Builder.Default
    private Integer pendingDeals = 0;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}

