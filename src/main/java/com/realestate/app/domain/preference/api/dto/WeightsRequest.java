package com.realestate.app.domain.preference.api.dto;

public record WeightsRequest(
        double priceWeight,
        double unitPriceWeight,
        double buildYearWeight
) {}
