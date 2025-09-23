package com.realestate.app.domain.preference.api.dto;

import com.realestate.app.domain.preference.ComparisonGroup;

public record GroupSummaryResponse(
        Long id,
        String name,
        String createdAt
) {
    public static GroupSummaryResponse from(ComparisonGroup g) {
        return new GroupSummaryResponse(g.getId(), g.getGroupName(), g.getCreatedAt().toString());
    }
}
