package com.realestate.app.domain.auction.entity;

import com.realestate.app.domain.property.table.PropertyOffer.OfferType;
import com.realestate.app.domain.property.table.PropertyOffer.OfferType2;
import com.realestate.app.domain.property.table.Property;
import com.realestate.app.domain.property.table.PropertyOffer;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Builder
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Entity
@Table(name = "property_auctions")
public class PropertyAuction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 16, nullable = false)
    private AuctionStatus status = AuctionStatus.ONGOING;

    @Builder.Default
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    @Column(name = "deal_type", length = 16, nullable = false)
    private OfferType dealType;

    @Enumerated(EnumType.STRING)
    @Column(name = "housetype", length = 16, nullable = false)
    private OfferType2 housetype;  // APART / BILLA / ONE

    @Column(name = "floor", nullable = false, precision = 38, scale = 2)
    private BigDecimal floor;

    @Column(name = "available_from")
    private LocalDate availableFrom;

    @Column(name = "maintenance_fee", precision = 14, scale = 2)
    private BigDecimal maintenanceFee;

    @Column(name = "negotiable")
    private Boolean negotiable;

    @Column(name = "oftion", columnDefinition = "TEXT")
    private String oftion;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}