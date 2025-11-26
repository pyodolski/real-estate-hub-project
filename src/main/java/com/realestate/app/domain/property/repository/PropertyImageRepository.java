package com.realestate.app.domain.property.repository;

import com.realestate.app.domain.property.table.PropertyImage;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PropertyImageRepository extends JpaRepository<PropertyImage, Long> {
}
