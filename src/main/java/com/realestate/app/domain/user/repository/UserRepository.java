package com.realestate.app.domain.user.repository;

import com.realestate.app.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    Optional<User> findByEmailAndIsActive(String email, Boolean isActive);

    @Query("""
        select distinct u
        from User u
        left join fetch u.userTags ut
        left join fetch ut.tag t
        where u.id = :id
    """)
    Optional<User> findByIdWithTags(@Param("id") Long id);

    // ✅ 추가: 찜한 매물의 모든 사용자 조회
    @Query("""
        select f.user
        from Favorite f
        where f.property.id = :propertyId
    """)
    List<User> findAllByFavoritePropertyId(@Param("propertyId") Long propertyId);

    @Query("select u.id from User u")
    List<Long> findAllIds();
}
