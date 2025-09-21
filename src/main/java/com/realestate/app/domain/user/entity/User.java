package com.realestate.app.domain.user.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;   // 사용자 고유 ID

    @Column(nullable = false, unique = true, length = 255)
    private String email;   // 이메일 (로그인용, 고유)

    @Column(nullable = false, length = 255)
    private String username;   // 사용자명 (닉네임)

    @Column(name = "password_hash", nullable = false, columnDefinition = "TEXT")
    private String passwordHash;   // 비밀번호 해시

    @Column(name = "role_id", nullable = false, length = 16)
    private String roleId;   // 사용자 역할 (regular | broker | admin)

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;   // 계정 활성 상태 (기본 true)

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;   // 계정 생성일

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;   // 최근 수정일

    @Column(name = "property_cnt")
    private Integer propertyCnt;   // 매물 등록 수

    @Column(columnDefinition = "TEXT")
    private String intro;   // 프로필 소개문

    @Column(name = "profile_image_url")
    private String profileImageUrl;   // 프로필 사진 URL

    @Column(name = "phone_number", length = 20)
    private String phoneNumber;   // 전화번호

    @Builder.Default
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<UserTag> userTags = new HashSet<>();

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
