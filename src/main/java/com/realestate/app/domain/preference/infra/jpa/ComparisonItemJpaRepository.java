package com.realestate.app.domain.preference.infra.jpa;

import com.realestate.app.domain.preference.ComparisonItem;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ComparisonItemJpaRepository extends JpaRepository<ComparisonItem, Long> {

    @Query("""
      select i from ComparisonItem i
      join fetch i.property p
      where i.group.id = :groupId
      order by i.id asc
    """)
    List<ComparisonItem> findByGroupIdWithProperty(@Param("groupId") Long groupId);

    @Query("""
      select count(i) from ComparisonItem i
      where i.group.id = :groupId
    """)
    long countByGroupId(@Param("groupId") Long groupId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
      delete from ComparisonItem i
      where i.group.id = :groupId and i.property.id = :propertyId
    """)
    int deleteByGroupIdAndPropertyId(@Param("groupId") Long groupId, @Param("propertyId") Long propertyId);
}
