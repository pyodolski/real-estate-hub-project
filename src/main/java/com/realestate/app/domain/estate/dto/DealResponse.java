package com.realestate.app.domain.estate.dto;

public record DealResponse(
        String address,
        String complexName,
        Double areaM2,
        Double price10k,
        String dong,
        Integer floor,
        Integer contractDateInt
) {}
