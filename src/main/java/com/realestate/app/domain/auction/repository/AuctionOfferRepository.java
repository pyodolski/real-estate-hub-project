package com.realestate.app.domain.auction.repository;

import com.realestate.app.domain.auction.entity.AuctionOffer;
import com.realestate.app.domain.auction.entity.PropertyAuction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface AuctionOfferRepository extends JpaRepository<AuctionOffer, Long> {

    List<AuctionOffer> findByAuction(PropertyAuction auction);

    Optional<AuctionOffer> findByAuctionAndAcceptedIsTrue(PropertyAuction auction);

    @Query("""
        select max(o.amount)
        from AuctionOffer o
        where o.auction = :auction
        """)
    BigDecimal findMaxAmountByAuction(PropertyAuction auction);
}