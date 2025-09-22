package com.realestate.app.domain.user.repository;

import com.realestate.app.domain.user.entity.User;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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
}

