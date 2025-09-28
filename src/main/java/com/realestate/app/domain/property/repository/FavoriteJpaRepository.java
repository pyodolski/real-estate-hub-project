package com.realestate.app.domain.property.repository;

import com.realestate.app.domain.property.table.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface FavoriteJpaRepository extends JpaRepository<Favorite, Long> {

    boolean existsByUserIdAndPropertyId(Long userId, Long propertyId);

    // 파생 delete 쿼리 — @Modifying 없어도 동작하는 버전도 있지만, 붙여두면 명시적이라 좋습니다.
    @Modifying
    long deleteByUserIdAndPropertyId(Long userId, Long propertyId);

    long countByPropertyId(Long propertyId);
/*
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = """
        INSERT INTO favorites(user_id, property_id, created_at)
        VALUES (:userId, :propertyId, now())
        ON CONFLICT (user_id, property_id) DO NOTHING
        """, nativeQuery = true)
    int insertIgnore(@Param("userId") Long userId, @Param("propertyId") Long propertyId);

    // 원자 토글의 삭제 단계
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = "DELETE FROM favorites WHERE user_id = :userId AND property_id = :propertyId", nativeQuery = true)
    int deleteByUserIdAndPropertyIdNative(@Param("userId") Long userId, @Param("propertyId") Long propertyId);
    */

}