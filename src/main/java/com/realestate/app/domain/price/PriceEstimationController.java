package com.realestate.app.domain.price;

import com.realestate.app.domain.property.repository.PropertyRepository;
import com.realestate.app.domain.property.table.Property;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/properties")
@RequiredArgsConstructor
public class PriceEstimationController {

    private final PriceEstimationService priceEstimationService;
    private final PropertyRepository propertyRepository;

    /**
     * 매물 시세 예측 조회
     * GET /api/properties/{propertyId}/price-estimation
     */
    @GetMapping("/{propertyId}/price-estimation")
    public ResponseEntity<PriceEstimationResponse> getEstimatedPrice(
            @PathVariable Long propertyId) {
        
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new IllegalArgumentException("매물을 찾을 수 없습니다."));
        
        PriceEstimation estimation = priceEstimationService.estimatePrice(property);
        
        PriceEstimationResponse response = PriceEstimationResponse.builder()
                .propertyId(propertyId)
                .propertyTitle(property.getTitle())
                .propertyAddress(property.getAddress())
                .estimatedPrice(estimation.getEstimatedPrice())
                .minPrice(estimation.getMinPrice())
                .maxPrice(estimation.getMaxPrice())
                .priceRange(formatPriceRange(estimation.getMinPrice(), estimation.getMaxPrice()))
                .confidence(estimation.getConfidence())
                .confidenceLevel(estimation.getConfidenceLevel())
                .sampleCount(estimation.getSampleCount())
                .message(estimation.getMessage())
                .build();
        
        return ResponseEntity.ok(response);
    }

    /**
     * 가격 범위 포맷팅 (억/만원 단위)
     */
    private String formatPriceRange(Double minPrice, Double maxPrice) {
        if (minPrice == null || maxPrice == null || minPrice == 0 || maxPrice == 0) {
            return "정보 없음";
        }
        return formatPrice(minPrice) + " ~ " + formatPrice(maxPrice);
    }
    
    /**
     * 가격 포맷팅 (억/만원 단위)
     */
    private String formatPrice(Double price) {
        if (price == null || price == 0) {
            return "0원";
        }
        
        long priceInWon = price.longValue();
        long eok = priceInWon / 100000000;  // 억
        long man = (priceInWon % 100000000) / 10000;  // 만
        
        if (eok > 0 && man > 0) {
            return String.format("%,d억 %,d만원", eok, man);
        } else if (eok > 0) {
            return String.format("%,d억원", eok);
        } else if (man > 0) {
            return String.format("%,d만원", man);
        } else {
            return String.format("%,d원", priceInWon);
        }
    }
}
