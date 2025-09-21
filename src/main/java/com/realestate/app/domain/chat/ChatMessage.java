package com.realestate.app.domain.chat;

import com.realestate.app.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "chat_messages",
        indexes = {
                @Index(name = "idx_msg_room_id_id_asc", columnList = "room_id, id"),
                @Index(name = "idx_msg_room_sender_unread", columnList = "room_id, sender_id, is_read")
        }
)
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private ChatRoom room;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(name = "sent_at", nullable = false)
    private LocalDateTime sentAt;

    @Column(name = "is_read", nullable = false)
    private Boolean isRead = false;

    @PrePersist
    public void prePersist() {
        this.sentAt = LocalDateTime.now();
    }
}
