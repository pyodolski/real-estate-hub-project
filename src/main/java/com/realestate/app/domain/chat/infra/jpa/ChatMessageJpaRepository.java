package com.realestate.app.domain.chat.infra.jpa;

import com.realestate.app.domain.chat.ChatMessage;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ChatMessageJpaRepository extends JpaRepository<ChatMessage, Long> {

    @Query("""
      select m from ChatMessage m
      where m.room.id = :roomId
        and (:cursorId is null or (:dir='backward' and m.id < :cursorId) or (:dir='forward' and m.id > :cursorId))
      order by m.id asc
    """)
    List<ChatMessage> pageByCursor(@Param("roomId") Long roomId,
                                   @Param("cursorId") Long cursorId,
                                   @Param("dir") String dir,
                                   Pageable pageable);

    @Query("""
      select count(m) from ChatMessage m
      where m.room.id = :roomId and m.sender.id <> :me and m.isRead = false
    """)
    int countUnread(@Param("roomId") Long roomId, @Param("me") Long me);

    @Modifying
    @Query("""
      update ChatMessage m set m.isRead = true
      where m.room.id = :roomId and m.sender.id <> :me and m.id <= :lastReadId
    """)
    int markReadUpTo(@Param("roomId") Long roomId,
                     @Param("me") Long me,
                     @Param("lastReadId") Long lastReadId);

    @Query("""
      select m from ChatMessage m
      where m.room.id = :roomId
      order by m.id desc
    """)
    List<ChatMessage> findTopByRoomOrderByIdDesc(@Param("roomId") Long roomId, Pageable pageable);
}
