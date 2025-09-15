package com.realestate.app.domain.property;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "price_anomalies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PriceAnomaly {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // 이상치 기록 ID

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property; // 매물 (FK → properties.id)

    // 백엔드에서 계산한 공식 결과 기록
    @Column(name = "score", nullable = false)
    private Double score; // 이상치 점수 (예: z-score, IQR 등)

    @Column(name = "reason", columnDefinition = "TEXT")
    private String reason; // 이상치 판정 사유 (선택사항, 로깅용)
}
