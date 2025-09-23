package com.realestate.app.domain.preference.infra.jpa;

import com.realestate.app.domain.preference.ComparisonGroup;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

public interface ComparisonGroupJpaRepository extends JpaRepository<ComparisonGroup, Long> {

    @Query("""
      select g from ComparisonGroup g
      where g.user.id = :userId
      order by g.createdAt desc
    """)
    Page<ComparisonGroup> findMyGroups(@Param("userId") Long userId, Pageable pageable);

    @Query("""
      select count(g) from ComparisonGroup g
      where g.user.id = :userId
    """)
    long countByUser(@Param("userId") Long userId);
}
