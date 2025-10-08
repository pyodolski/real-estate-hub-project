package com.realestate.app.domain.property.dto;

import java.math.BigDecimal;

public record JeonseRatioResponse(
        Long offerId,
        Long propertyId,
        BigDecimal deposit,           // 전세보증금
        BigDecimal salePriceUsed,     // 계산에 사용된 매매가(예측/임시/Property.price)
        BigDecimal ratioPercent,      // XX.XX (%)
        String comment,               // 코멘트
        String salePriceSource        // PREDICTED | CLIENT_FALLBACK | PROPERTY_PRICE
) {}
