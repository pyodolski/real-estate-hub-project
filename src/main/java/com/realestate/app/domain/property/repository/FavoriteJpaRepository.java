package com.realestate.app.domain.property.repository;

import com.realestate.app.domain.property.table.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FavoriteJpaRepository extends JpaRepository<Favorite, Long> {

    // ✅ user.id, property.id 기반
    boolean existsByUser_IdAndProperty_Id(Long userId, Long propertyId);

    // deleteBy 도 마찬가지로 _Id 써야 함
    @Modifying
    long deleteByUser_IdAndProperty_Id(Long userId, Long propertyId);

    long countByProperty_Id(Long propertyId);

    @Query("select f.user.id from Favorite f where f.property.id = :pid")
    List<Long> findUserIdsByPropertyId(@Param("pid") Long propertyId);

    /*
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = """
        INSERT INTO favorites(user_id, property_id, created_at)
        VALUES (:userId, :propertyId, now())
        ON CONFLICT (user_id, property_id) DO NOTHING
        """, nativeQuery = true)
    int insertIgnore(@Param("userId") Long userId, @Param("propertyId") Long propertyId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = "DELETE FROM favorites WHERE user_id = :userId AND property_id = :propertyId", nativeQuery = true)
    int deleteByUserIdAndPropertyIdNative(@Param("userId") Long userId, @Param("propertyId") Long propertyId);
    */
}
