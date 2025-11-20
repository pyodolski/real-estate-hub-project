package com.realestate.app.domain.price;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PriceEstimation {
    
    /**
     * 예측 가격 (원 단위)
     */
    private Double estimatedPrice;
    
    /**
     * 최소 가격 (원 단위)
     */
    private Double minPrice;
    
    /**
     * 최대 가격 (원 단위)
     */
    private Double maxPrice;
    
    /**
     * 신뢰도 (0-100)
     */
    private Double confidence;
    
    /**
     * 신뢰도 레벨 (HIGH, MEDIUM, LOW, VERY_LOW, UNAVAILABLE)
     */
    private String confidenceLevel;
    
    /**
     * 참고한 거래 샘플 수
     */
    private Long sampleCount;
    
    /**
     * 사용자에게 표시할 메시지
     */
    private String message;
}
