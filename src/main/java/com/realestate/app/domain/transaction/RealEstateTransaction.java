package com.realestate.app.domain.transaction;

import com.realestate.app.domain.property.Property;
import com.realestate.app.domain.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "real_estate_transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor @Builder
public class RealEstateTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id")
    private Property property; // optional FK

    @Column(columnDefinition = "TEXT", nullable = false)
    private String address;

    @Column(name = "transaction_date", nullable = false)
    private LocalDate transactionDate;

    @Column(precision = 14, scale = 2, nullable = false)
    private BigDecimal price;

    @Column(name = "size_sqm", precision = 8, scale = 2, nullable = false)
    private BigDecimal sizeSqm;
}
