package com.realestate.app.domain.property.repository;

import com.realestate.app.domain.property.Property;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.List;

public interface PropertyRepository extends JpaRepository<Property, Long> {

    @Query("""
        select p from Property p
        where p.locationX between :swLat and :neLat
          and p.locationY between :swLng and :neLng
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

    // 제목 중복 확인
    boolean existsByTitle(String title);
}
