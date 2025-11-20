package com.realestate.app.domain.price;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PriceEstimationResponse {
    
    /**
     * 매물 ID
     */
    private Long propertyId;
    
    /**
     * 매물 제목
     */
    private String propertyTitle;
    
    /**
     * 매물 주소
     */
    private String propertyAddress;
    
    /**
     * 예측 시세 (원 단위)
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
     * 가격 범위 (포맷팅된 문자열)
     */
    private String priceRange;
    
    /**
     * 신뢰도 (0-100)
     */
    private Double confidence;
    
    /**
     * 신뢰도 레벨
     */
    private String confidenceLevel;
    
    /**
     * 참고 샘플 수
     */
    private Long sampleCount;
    
    /**
     * 안내 메시지
     */
    private String message;
}
