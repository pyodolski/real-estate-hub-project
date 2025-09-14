package com.realestate.app.domain.property;

import com.realestate.app.domain.property.Property;
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
