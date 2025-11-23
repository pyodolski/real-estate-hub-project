package com.realestate.app.recproperty.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;
@Entity
@Table(name = "recommender_feature_weights")
@Getter @Setter
public class RecommenderFeatureWeights {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(columnDefinition = "double precision[]")
    private double[] weights;

    private OffsetDateTime updatedAt;
}