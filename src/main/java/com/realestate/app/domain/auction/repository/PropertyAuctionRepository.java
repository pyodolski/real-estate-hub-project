package com.realestate.app.domain.auction.repository;

import com.realestate.app.domain.auction.entity.AuctionStatus;
import com.realestate.app.domain.auction.entity.PropertyAuction;
import com.realestate.app.domain.property.table.Property;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface PropertyAuctionRepository extends JpaRepository<PropertyAuction, Long> {

    List<PropertyAuction> findByProperty(Property property);

    List<PropertyAuction> findByStatus(AuctionStatus status);

    List<PropertyAuction> findByStatusAndCreatedAtAfter(
            AuctionStatus status, LocalDateTime createdAfter);

    List<PropertyAuction> findByStatusAndCreatedAtBefore(
            AuctionStatus status, LocalDateTime createdBefore);

    boolean existsByPropertyAndStatusAndCreatedAtAfter(
            Property property,
            AuctionStatus status,
            LocalDateTime createdAfter
    );
}