package com.realestate.app.domain.user.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "user_tags",
        uniqueConstraints = @UniqueConstraint(name="uk_user_tag", columnNames = {"user_id","tag_id"})
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserTag {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional=false, fetch = FetchType.LAZY)
    @JoinColumn(name="user_id", nullable=false, foreignKey=@ForeignKey(name="fk_user_tag_user"))
    private User user;

    @ManyToOne(optional=false, fetch = FetchType.LAZY)
    @JoinColumn(name="tag_id", nullable=false, foreignKey=@ForeignKey(name="fk_user_tag_tag"))
    private Tag tag;

    @Column(name="created_at", updatable=false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() { this.createdAt = LocalDateTime.now(); }
}
