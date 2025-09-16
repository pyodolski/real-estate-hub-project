/*
package com.realestate.app.repository;

import com.realestate.app.domain.Property;
import com.realestate.app.dto.PropertySummaryDto;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PropertyRepository extends Repository<Property, Long> {

    @Query("""
        select new com.realestate.app.dto.PropertySummaryDto(p.id, p.status, p.lat, p.lng, p.price)
        from Property p
        where p.lat between :swLat and :neLat
          and p.lng between :swLng and :neLng
          and (:status   is null or p.status = :status)
          and (:minPrice is null or p.price >= :minPrice)
          and (:maxPrice is null or p.price <= :maxPrice)
        """)
    List<PropertySummaryDto> findInBounds(
            @Param("swLat") double swLat,
            @Param("swLng") double swLng,
            @Param("neLat") double neLat,
            @Param("neLng") double neLng,
            @Param("status") String status,
            @Param("minPrice") Long minPrice,
            @Param("maxPrice") Long maxPrice
    );
}
*/