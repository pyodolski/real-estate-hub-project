package com.realestate.app.recproperty.entity;


import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "user_property_preferences")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserPropertyPreference {

    @Id
    @Column(name = "user_id")
    private Long userId;

    @Column(name = "pref_vector", columnDefinition = "double precision[]")
    private double[] prefVector;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
