package com.realestate.app.domain.alert;

import com.realestate.app.domain.user.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "score_alerts")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class ScoreAlert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // 알림 ID

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user; // 조건 설정한 사용자

    @Enumerated(EnumType.STRING)
    @Column(name = "condition_type", length = 32, nullable = false)
    private ConditionType conditionType; // total, traffic, amenities, price...

    @Column(name = "target_score", nullable = false)
    private Integer targetScore; // 최소 점수

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public enum ConditionType {
        TOTAL, TRAFFIC, AMENITIES, PRICE, CONDITION, DESCRIPTION
    }
}
