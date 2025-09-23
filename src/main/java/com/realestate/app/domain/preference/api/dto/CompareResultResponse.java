package com.realestate.app.domain.preference.api.dto;

import com.realestate.app.domain.preference.app.ComparisonService;

import java.util.List;
import java.util.Map;

public record CompareResultResponse(
        List<ComparisonService.RankingRow> ranking,
        List<String> categories,
        Map<String, List<Number>> series
) {
    public static CompareResultResponse from(ComparisonService.CompareResult r) {
        return new CompareResultResponse(r.ranking(), r.categories(), r.series());
    }
}
