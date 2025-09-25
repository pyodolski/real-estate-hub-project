package com.realestate.app.domain.property.repository;

import com.realestate.app.domain.property.table.Property;
import com.realestate.app.domain.property.table.Property.ListingType;
import com.realestate.app.domain.property.table.Property.Status;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PropertywoRepository extends JpaRepository<Property, Long> {

    // 전체 조회(필터)
    Page<Property> findAllByStatusAndListingType(Status status, ListingType listingType, Pageable pageable);
    Page<Property> findAllByStatus(Status status, Pageable pageable);
    Page<Property> findAllByListingType(ListingType listingType, Pageable pageable);

    // 내 것 전용
    Page<Property> findAllByOwner_Id(Long ownerId, Pageable pageable);
    Page<Property> findAllByOwner_IdAndStatus(Long ownerId, Status status, Pageable pageable);
    Page<Property> findAllByOwner_IdAndListingType(Long ownerId, ListingType type, Pageable pageable);
    Page<Property> findAllByOwner_IdAndStatusAndListingType(Long ownerId, Status status, ListingType type, Pageable pageable);

    // 타인 것 전용(내 것 제외)
    Page<Property> findAllByOwner_IdNot(Long ownerId, Pageable pageable);
    Page<Property> findAllByOwner_IdNotAndStatus(Long ownerId, Status status, Pageable pageable);
    Page<Property> findAllByOwner_IdNotAndListingType(Long ownerId, ListingType type, Pageable pageable);
    Page<Property> findAllByOwner_IdNotAndStatusAndListingType(Long ownerId, Status status, ListingType type, Pageable pageable);
}
