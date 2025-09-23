package com.realestate.app.domain.preference.api.dto;

import com.realestate.app.domain.preference.ComparisonGroup;

public record GroupResponse(
        Long id,
        String name,
        String createdAt
) {
    public static GroupResponse from(ComparisonGroup g) {
        return new GroupResponse(g.getId(), g.getGroupName(), g.getCreatedAt().toString());
    }
}
