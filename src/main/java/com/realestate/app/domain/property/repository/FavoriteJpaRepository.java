package com.realestate.app.domain.property.repository;

import com.realestate.app.domain.property.table.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;

@Repository
public interface FavoriteJpaRepository extends JpaRepository<Favorite, Long> {

    boolean existsByUserIdAndPropertyId(Long userId, Long propertyId);

    // 파생 delete 쿼리 — @Modifying 없어도 동작하는 버전도 있지만, 붙여두면 명시적이라 좋습니다.
    @Modifying
    void deleteByUserIdAndPropertyId(Long userId, Long propertyId);

    long countByPropertyId(Long propertyId);
}