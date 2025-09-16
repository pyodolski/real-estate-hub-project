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
        and ((r.user1.id = :u1 and r.user2.id = :u2) or (r.user1.id = :u2 and r.user2.id = :u1))
    """)
    Optional<ChatRoom> findByPropertyAndUsers(@Param("propertyId") Long propertyId,
                                              @Param("u1") Long u1,
                                              @Param("u2") Long u2);

    @Query("""
      select r from ChatRoom r
      where r.user1.id = :userId or r.user2.id = :userId
      order by r.createdAt desc
    """)
    Page<ChatRoom> findMyRooms(@Param("userId") Long userId, Pageable pageable);
}
