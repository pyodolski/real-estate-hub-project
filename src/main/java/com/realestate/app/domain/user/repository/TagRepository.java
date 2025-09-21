package com.realestate.app.domain.user.repository;

import com.realestate.app.domain.user.entity.Tag;


import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface TagRepository extends JpaRepository<Tag, Long> {
    Optional<Tag> findByGroupCodeAndKeyCode(String groupCode, String keyCode);
    List<Tag> findByGroupCodeIn(Collection<String> groupCodes);
}