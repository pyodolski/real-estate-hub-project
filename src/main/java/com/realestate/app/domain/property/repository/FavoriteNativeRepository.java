// src/main/java/.../property/repository/FavoriteNativeRepository.java
package com.realestate.app.domain.property.repository;

import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

public interface FavoriteNativeRepository {
    /**
     * 존재하지 않으면 삽입하고 true, 이미 있으면 false
     */
    @Transactional
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(
            value = """
      with ins as (
        insert into favorites(user_id, property_id, created_at)
        values (:userId, :propertyId, now())
        on conflict (user_id, property_id) do nothing
        returning 1
      )
      select exists(select 1 from ins)
      """,
            nativeQuery = true
    )
    boolean insertIfAbsent(@Param("userId") Long userId, @Param("propertyId") Long propertyId);

    @Transactional
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(
            value = "delete from favorites where user_id = :userId and property_id = :propertyId",
            nativeQuery = true
    )
    int deleteByUserIdAndPropertyIdNative(@Param("userId") Long userId, @Param("propertyId") Long propertyId);
}