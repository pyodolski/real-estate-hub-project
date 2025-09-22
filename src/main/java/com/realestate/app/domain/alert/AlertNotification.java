package com.realestate.app.domain.alert;

import com.realestate.app.domain.property.table.Property;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import com.realestate.app.domain.user.entity.User;

@Entity
@Table(name = "alert_notifications")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class AlertNotification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // 알림 고유 ID

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id")
    private Property property; // nullable

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "price_alert_id")
    private PriceAlert priceAlert; // nullable

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "score_alert_id")
    private ScoreAlert scoreAlert; // nullable

    @Enumerated(EnumType.STRING)
    @Column(name = "alert_type", length = 16, nullable = false)
    private AlertType alertType; // budget, score

    @Column(columnDefinition = "TEXT")
    private String message;

    @Column(name = "sent_at")
    private LocalDateTime sentAt;

    @Column(name = "is_read", nullable = false)
    private Boolean isRead = false;

    public enum AlertType {
        BUDGET, SCORE
    }
}

