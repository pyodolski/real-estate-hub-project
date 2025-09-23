package com.realestate.app.domain.preference.api.dto;

import com.realestate.app.domain.preference.ComparisonItem;

import java.util.List;

public record GroupDetailResponse(
        Long groupId,
        List<ItemResponse> items
) {
    public static GroupDetailResponse from(Long groupId, List<ComparisonItem> list) {
        return new GroupDetailResponse(groupId, list.stream().map(ItemResponse::from).toList());
    }
}
