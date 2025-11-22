package com.realestate.app.domain.property.repository;

import com.realestate.app.domain.property.table.Property;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PropertyFullRepository extends JpaRepository<Property, Long> {

    // 상태가 AVAILABLE 인 매물만 + offers/images 를 한 번에 로딩
    @Query("""
    select distinct p
    from PropertyOffer o
    join o.property p
    left join fetch p.offers po
    left join fetch p.images i
    where o.isActive = true
    and p.status = 'AVAILABLE'
    """)
    List<Property> findAllAvailableWithOffersAndImages();

    @Query("""
    select distinct p
    from PropertyOffer o
    join o.property p
    left join fetch p.offers po
    left join fetch p.images i
    where p.id = :id
      and o.isActive = true
    """)
    Optional<Property> findByIdWithActiveOffersAndImages(@Param("id") Long id);

    @Query("""
select distinct p
from PropertyOffer o
join o.property p
left join fetch p.offers po
left join fetch p.images i
where o.isActive = true
  and p.status = 'AVAILABLE'
  and p.locationY between :swLat and :neLat
  and p.locationX between :swLng and :neLng
""")
    List<Property> findAllAvailableInBoundsWithOffersAndImages(
            @Param("swLat") double swLat,
            @Param("swLng") double swLng,
            @Param("neLat") double neLat,
            @Param("neLng") double neLng
    );

}