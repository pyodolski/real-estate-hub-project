package com.realestate.app.domain.user.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "tags",
        uniqueConstraints = @UniqueConstraint(name="uk_tag_group_key", columnNames = {"group_code","key_code"})
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Tag {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="group_code", nullable=false, length=64)
    private String groupCode;

    @Column(name="key_code", nullable=false, length=64)
    private String keyCode;

    @Column(nullable=false, length=128)
    private String label;

    @Column(name="is_active", nullable=false)
    private Boolean isActive = true;

    @Column(name="sort_order")
    private Integer sortOrder;

    @Column(name="created_at", updatable=false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() { this.createdAt = LocalDateTime.now(); }
}
