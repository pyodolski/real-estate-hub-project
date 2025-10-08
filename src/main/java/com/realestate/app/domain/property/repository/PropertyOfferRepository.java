package com.realestate.app.domain.property.repository;

import com.realestate.app.domain.property.table.PropertyOffer;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Collection;
import java.util.List;

public interface PropertyOfferRepository extends JpaRepository<PropertyOffer, Long> {
    List<PropertyOffer> findByPropertyIdIn(Collection<Long> propertyIds);
    List<PropertyOffer> findByPropertyId(Long propertyId);

    Optional<PropertyOffer> findTopByProperty_IdAndTypeAndIsActiveOrderByUpdatedAtDesc(
            Long propertyId,
            PropertyOffer.OfferType type,
            Boolean isActive
    );

    @Query("""
    select o from PropertyOffer o
    where o.id = :offerId
    """)
    Optional<PropertyOffer> findOneForCheck(@Param("offerId") Long offerId);
}
