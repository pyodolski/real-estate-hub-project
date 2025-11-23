package com.realestate.app.recproperty.repository;

import com.realestate.app.recproperty.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RecommenderFeatureWeightsRepository
        extends JpaRepository<RecommenderFeatureWeights, Long> {
    RecommenderFeatureWeights findTopByNameOrderByUpdatedAtDesc(String name);
}