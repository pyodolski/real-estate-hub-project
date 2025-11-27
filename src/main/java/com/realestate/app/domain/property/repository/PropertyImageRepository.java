package com.realestate.app.domain.property.repository;

import com.realestate.app.domain.property.table.PropertyImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PropertyImageRepository extends JpaRepository<PropertyImage, Long> {

    // property_id 로 이미지 리스트 조회
    List<PropertyImage> findByProperty_Id(Long propertyId);
}
