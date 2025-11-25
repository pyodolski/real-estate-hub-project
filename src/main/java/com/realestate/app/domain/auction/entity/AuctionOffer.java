package com.realestate.app.domain.auction.entity;

import com.realestate.app.domain.broker_profile.BrokerProfile;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Builder
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Entity
@Table(name = "auction_offers")
public class AuctionOffer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "auction_id", nullable = false)
    private PropertyAuction auction;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "broker_user_id", referencedColumnName = "user_id", nullable = false)
    private BrokerProfile broker;

    @Column(name = "amount", nullable = false, precision = 14, scale = 2)
    private BigDecimal amount;

    @Builder.Default
    @Column(name = "is_accepted", nullable = false)
    private Boolean accepted = false;

    @Builder.Default
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @PrePersist
    public void prePersist() {
        if (accepted == null) {
            accepted = false;
        }
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
