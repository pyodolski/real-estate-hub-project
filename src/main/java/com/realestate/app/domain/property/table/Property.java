package com.realestate.app.domain.property.table;

import com.realestate.app.domain.broker_profile.BrokerProfile;
import com.realestate.app.domain.ownership.OwnershipClaim;
import com.realestate.app.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;


@Entity
@Table(name = "properties")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Property {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;   // 매물 고유 ID

    @Column(nullable = false, columnDefinition = "TEXT")
    private String title;   // 매물 제목

    @Column(nullable = false, columnDefinition = "TEXT")
    private String address; // 매물 주소 (지번/도로명)

    @Column(precision = 14, scale = 2)
    private BigDecimal price; // 매물 가격

    @Column(name = "area_m2", precision = 8, scale = 2)
    private BigDecimal areaM2; // 면적 (㎡)

    @Enumerated(EnumType.STRING)
    @Column(length = 16, nullable = false)
    private Status status; // 거래 상태

    @Enumerated(EnumType.STRING)
    @Column(name = "listing_type", length = 16, nullable = false)
    private ListingType listingType; // 등록 유형 (소유자/중개인)

    // 소유자 (users.id 참조)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id")
    private User owner;

    // 중개인 (broker_profiles.user_id 참조)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "broker_id")
    private BrokerProfile broker;

    // 소유권 증명 (ownership_claims.id 참조)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "claim_id")
    private OwnershipClaim claim;

    @Column(name = "region_code", length = 20)
    private String regionCode; // 행정구역 코드

    @Column(name = "location_x")
    private Double locationX;  // 위도

    @Column(name = "location_y")
    private Double locationY;  // 경도

    @Column(name = "building_year")
    private Integer buildingYear; // 준공년도

    @Column(name = "anomaly_alert")
    private Boolean anomalyAlert; // 이상치 여부 (0/1)

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt; // 등록일

    @Column(name = "updated_at")
    private LocalDateTime updatedAt; // 수정일

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // 🔹 여기 추가해야 DTO에서 p.getOffers(), p.getImages()가 동작함
    @OneToMany(mappedBy = "property", fetch = FetchType.LAZY)
    private Set<PropertyOffer> offers = new LinkedHashSet<>();

    @OneToMany(mappedBy = "property", fetch = FetchType.LAZY)
    private Set<PropertyImage> images = new LinkedHashSet<>();

    // 거래 상태 Enum
    public enum Status {
        AVAILABLE,   // 거래 가능
        PENDING,     // 거래 진행 중
        SOLD,        // 판매 완료
        HIDDEN       // 숨김
    }

    // 등록 유형 Enum
    public enum ListingType {
        OWNER,   // 소유자 직접 등록
        BROKER   // 중개인 등록
    }
}
