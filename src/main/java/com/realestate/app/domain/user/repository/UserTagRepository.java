package com.realestate.app.domain.user.repository;

import com.realestate.app.domain.user.entity.UserTag;


import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

public interface UserTagRepository extends JpaRepository<UserTag, Long> {
    @Modifying
    @Query("delete from UserTag ut where ut.user.id = :userId")
    void deleteAllByUserId(@Param("userId") Long userId);
}