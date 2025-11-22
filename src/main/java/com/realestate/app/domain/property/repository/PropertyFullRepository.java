package com.realestate.app.domain.property.repository;

import com.realestate.app.domain.property.table.Property;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface PropertyFullRepository extends JpaRepository<Property, Long> {

    // 상태가 AVAILABLE 인 매물만 + offers/images 를 한 번에 로딩
    @Query("""
        select distinct p from Property p
        left join fetch p.offers o
        left join fetch p.images i
        where p.status = 'AVAILABLE'
        """)
    List<Property> findAllAvailableWithOffersAndImages();
}