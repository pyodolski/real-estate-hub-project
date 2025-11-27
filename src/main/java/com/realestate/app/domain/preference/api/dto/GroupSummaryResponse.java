package com.realestate.app.domain.preference.api.dto;

import com.realestate.app.domain.preference.ComparisonGroup;

import java.util.List;

public record GroupSummaryResponse(
        Long id,
        String name,
        String createdAt,
        List<ComparisonItemSummary> items
) {
    public static GroupSummaryResponse from(ComparisonGroup g) {
        return new GroupSummaryResponse(
                g.getId(),
                g.getGroupName(),
                g.getCreatedAt().toString(),
                g.getItems().stream().map(ComparisonItemSummary::from).toList()
        );
    }
}
