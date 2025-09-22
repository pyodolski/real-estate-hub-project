package com.realestate.app.domain.property.table;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "property_images")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PropertyImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;   // 이미지 고유 ID

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;   // 매물 (properties.id 참조)

    @Column(name = "image_url", nullable = false, columnDefinition = "TEXT")
    private String imageUrl;     // 이미지 URL
}

// 해야할거
// 지도연결 적용 : 완
// 필터 적용 : 미완
// 매물 디비적용 : 미완
// 매물 즐겨찾기 : 미완
// 매물 상세정보 : 미완
