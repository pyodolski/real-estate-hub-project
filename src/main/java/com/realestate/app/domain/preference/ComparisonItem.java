package com.realestate.app.domain.preference;

import com.realestate.app.domain.property.Property;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "comparison_items",
        uniqueConstraints = {
                @UniqueConstraint(name = "uniq_group_prop", columnNames = {"group_id", "property_id"})
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComparisonItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // 비교 아이템 ID

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    private ComparisonGroup group;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;
}
