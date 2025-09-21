package com.realestate.app.domain.auth.dto;

import jakarta.validation.constraints.*;

public record TagSelection(
        @NotBlank String groupCode,    // 예: "PRICE_RANGE"
        @NotBlank String keyCode,      // 예: "P0_100M"
        String label                   // 라벨은 선택. 없으면 keyCode로 대체
) {}