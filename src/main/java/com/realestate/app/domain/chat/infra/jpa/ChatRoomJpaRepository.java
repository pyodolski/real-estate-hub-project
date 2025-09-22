package com.realestate.app.domain.chat.infra.jpa;

import com.realestate.app.domain.chat.ChatRoom;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ChatRoomJpaRepository extends JpaRepository<ChatRoom, Long> {

    @Query("""
      select r from ChatRoom r
      where r.property.id = :propertyId
        and r.user1.id = :u1
        and r.user2.id = :u2
        and (
              (:u3 is null and r.user3.id is null)
              or (:u3 is not null and r.user3.id = :u3)
            )
    """)
    Optional<ChatRoom> findByPropertyAndUsers(
            @Param("propertyId") Long propertyId,
            @Param("u1") Long u1,
            @Param("u2") Long u2,
            @Param("u3") Long u3
    );

    @Query("""
      select r from ChatRoom r
      where r.user1.id = :userId or r.user2.id = :userId or (r.user3.id is not null and r.user3.id = :userId)
      order by r.createdAt desc
    """)
    Page<ChatRoom> findMyRooms(@Param("userId") Long userId, Pageable pageable);
}
