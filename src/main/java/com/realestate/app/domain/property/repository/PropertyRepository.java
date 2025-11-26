package com.realestate.app.domain.property.repository;

import com.realestate.app.domain.property.table.Property;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface PropertyRepository extends JpaRepository<Property, Long> {

    @Query("""
        select p from Property p
        inner join p.claim oc
        where p.locationY between :swLat and :neLat
          and p.locationX between :swLng and :neLng
          and oc.status = com.realestate.app.domain.ownership.OwnershipClaim$Status.APPROVED
          and exists (
            select 1 from PropertyOffer po
            where po.property.id = p.id
            and po.isActive = true
          )
          and (:status   is null or p.status = :status)
          and (:minPrice is null or p.price >= :minPrice)
          and (:maxPrice is null or p.price <= :maxPrice)
        """)
    List<Property> findInBounds(
            double swLat,
            double swLng,
            double neLat,
            double neLng,
            Property.Status status,
            BigDecimal minPrice,
            BigDecimal maxPrice
    );

    boolean existsByTitle(String title);


    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
        update Property p
           set p.status = com.realestate.app.domain.property.table.Property$Status.SOLD,
               p.updatedAt = CURRENT_TIMESTAMP
         where p.id = :propertyId
           and p.listingType = com.realestate.app.domain.property.table.Property$ListingType.BROKER
           and p.broker.id   = :brokerUserId
           and p.status in (com.realestate.app.domain.property.table.Property$Status.AVAILABLE,
                            com.realestate.app.domain.property.table.Property$Status.PENDING)
        """)
    int markSoldIfBrokerAndValid(
            @Param("propertyId") Long propertyId,
            @Param("brokerUserId") Long brokerUserId
    );

    // [1126school 브랜치 내용 반영] 집주인용 경매 가능 매물 조회
    @Query("""
        select p from Property p
        inner join p.claim oc
        where p.owner.id = :ownerUserId
          and oc.status = com.realestate.app.domain.ownership.OwnershipClaim$Status.APPROVED
          and p.broker is null
          and not exists (
            select 1 from PropertyOffer po
            where po.property.id = p.id
            and po.isActive = true
          )
        """)
    List<Property> findAuctionAvailableProperties(@Param("ownerUserId") Long ownerUserId);

    // [main 브랜치 내용 반영] 중개인용 관리 매물 조회 (정렬 포함된 버전 선택)
    @Query("""
        select p
        from Property p
        where p.listingType = com.realestate.app.domain.property.table.Property$ListingType.BROKER
          and p.broker.userId = :brokerUserId
          and p.status in (
            com.realestate.app.domain.property.table.Property$Status.AVAILABLE,
            com.realestate.app.domain.property.table.Property$Status.PENDING
          )
        order by p.updatedAt desc nulls last, p.createdAt desc
        """)
    List<Property> findManagedByBroker(@Param("brokerUserId") Long brokerUserId);
}