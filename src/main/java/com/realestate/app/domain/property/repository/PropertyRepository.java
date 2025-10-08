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
        where p.locationY between :swLat and :neLat
          and p.locationX between :swLng and :neLng
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
}
