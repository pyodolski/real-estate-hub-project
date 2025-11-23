package com.realestate.app.recproperty.service;


import com.realestate.app.domain.property.dto.request.SearchRequest;
import com.realestate.app.domain.property.repository.PropertySearchRepository;
import com.realestate.app.domain.property.dto.PropertyFilterDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
@RequiredArgsConstructor
public class PropertySearchService {

    private final PropertySearchRepository repo;
    private final RecommendationService rec;

    public List<PropertyFilterDto> search(SearchRequest req, Long userId){
        List<PropertyFilterDto> list = repo.search(req);
        rec.applyRecommendation(userId, list, 4); // 상위 5개 추천
        return list;
    }
}
