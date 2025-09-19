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

    // ✅ 핵심: null 허용 + 이미 읽은 건 제외 + 벌크업데이트 후 캐시 동기화
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
      update ChatMessage m
         set m.isRead = true
       where m.room.id = :roomId
         and m.sender.id <> :me
         and m.isRead = false
         and (:lastReadId is null or m.id <= :lastReadId)
    """)
    int markReadUpTo(@Param("roomId") Long roomId,
                     @Param("me") Long me,
                     @Param("lastReadId") Long lastReadId);

    // (옵션) 상대가 보낸 미읽음 전체 읽음 처리
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
      update ChatMessage m
         set m.isRead = true
       where m.room.id = :roomId
         and m.sender.id <> :me
         and m.isRead = false
    """)
    int markAllOpponentRead(@Param("roomId") Long roomId, @Param("me") Long me);

    @Query("""
      select m from ChatMessage m
      where m.room.id = :roomId
      order by m.id desc
    """)
    List<ChatMessage> findTopByRoomOrderByIdDesc(@Param("roomId") Long roomId, Pageable pageable);
}
