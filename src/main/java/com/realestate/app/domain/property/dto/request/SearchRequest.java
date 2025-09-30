package com.realestate.app.domain.property.dto.request;

import java.math.BigDecimal;
import java.util.List;

public record SearchRequest(
        List<String> houseTypes,   // ["APART","BILLA","ONE"]
        List<String> offerTypes,   // ["SALE","JEONSE","WOLSE"]
        Integer areaMin, Integer areaMax,
        Integer floorMin, Integer floorMax,
        String optionMask,         // "1100000000" (10비트)
        String optionMatchMode,    // "ALL" or "ANY"

        BigDecimal buyMin, BigDecimal buyMax,
        BigDecimal jeonseMin, BigDecimal jeonseMax,
        BigDecimal monthlyDepositMin, BigDecimal monthlyDepositMax,
        BigDecimal monthlyRentMin,    BigDecimal monthlyRentMax,

        Integer buildYearMin, Integer buildYearMax,
        Integer page, Integer size
) {}
