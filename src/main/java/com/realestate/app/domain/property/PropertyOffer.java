package com.realestate.app.domain.property;
import com.realestate.app.domain.broker_profile.BrokerProfile;
import com.realestate.app.domain.ownership.OwnershipClaim;
import com.realestate.app.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
@Entity
@Table(name = "property_offers")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PropertyOffer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    @Enumerated(EnumType.STRING)
    @Column(length = 16, nullable = false)
    private OfferType2 housetype; // APART / BILLA / ONE

    @Enumerated(EnumType.STRING)
    @Column(length = 16, nullable = false)
    private OfferType type; // SALE / JEONSE / WOLSE

    @Column(length = 16, nullable = false)
    private BigDecimal floor;

    @Column(length = 16, nullable = true)
    private String oftion;

    @Column(name = "total_price", precision = 14, scale = 2)
    private BigDecimal totalPrice; // 매매가

    @Column(precision = 14, scale = 2)
    private BigDecimal deposit; // 보증금

    @Column(name = "monthly_rent", precision = 14, scale = 2)
    private BigDecimal monthlyRent; // 월세액

    @Column(name = "maintenance_fee", precision = 14, scale = 2)
    private BigDecimal maintenanceFee; // 관리비

    private Boolean negotiable;

    @Column(name = "available_from")
    private LocalDate availableFrom;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public enum OfferType {
        SALE, JEONSE, WOLSE
    }

    public enum  OfferType2 {
        APART, BILLA, ONE
    }
}
