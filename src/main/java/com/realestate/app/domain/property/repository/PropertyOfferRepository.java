package com.realestate.app.domain.property.repository;

import com.realestate.app.domain.property.table.PropertyOffer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface PropertyOfferRepository extends JpaRepository<PropertyOffer, Long> {
    List<PropertyOffer> findByPropertyIdIn(Collection<Long> propertyIds);
    List<PropertyOffer> findByPropertyId(Long propertyId);
}
