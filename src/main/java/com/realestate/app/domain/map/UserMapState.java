package com.realestate.app.domain.map;

import com.realestate.app.domain.user.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_map_state")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class UserMapState {

    @Id
    @Column(name = "user_id")
    private Long userId; // PK = 사용자 ID

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "location_x")
    private Double locationX;

    @Column(name = "location_y")
    private Double locationY;

    @Column(name = "zoom_level")
    private Integer zoomLevel;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    public void updateTime() {
        this.updatedAt = LocalDateTime.now();
    }
}
