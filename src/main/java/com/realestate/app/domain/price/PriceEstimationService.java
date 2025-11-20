package com.realestate.app.domain.price;

import com.realestate.app.domain.property.table.Property;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class PriceEstimationService {

    private final JdbcTemplate jdbcTemplate;

    /**
     * 유사 매물 기반 시세 예측
     */
    public PriceEstimation estimatePrice(Property property) {
        try {
            // 주소에서 시군구, 동 추출
            String sigungu = extractSigungu(property.getAddress());
            String dong = extractDong(property.getAddress());
            
            // 도로명 주소인 경우 좌표로 법정동 조회 시도
            if (dong.isEmpty() && property.getLocationX() != null && property.getLocationY() != null) {
                dong = getDongFromCoordinates(property.getLocationX(), property.getLocationY());
                log.info("좌표로 법정동 조회: {}", dong);
            }
            
            log.info("시세 예측 시작 - 매물ID: {}, 시군구: {}, 동: {}, 면적: {}㎡, 건축년도: {}", 
                property.getId(), sigungu, dong, property.getAreaM2(), property.getBuildingYear());

            // 유사 매물 조회 및 통계 계산
            // sigungu 컬럼에 "시도 시군구 동" 형식으로 저장되어 있음
            String sql = """
                SELECT 
                    AVG(price_10k) as avg_price,
                    MIN(price_10k) as min_price,
                    MAX(price_10k) as max_price,
                    COUNT(*) as sample_count,
                    STDDEV(price_10k) as std_dev
                FROM realestate_deals
                WHERE sigungu LIKE ?
                  AND area_m2 BETWEEN ? AND ?
                  AND price_10k > 0
                """;

            double targetArea = property.getAreaM2() != null ? property.getAreaM2().doubleValue() : 85.0;
            
            // "대구광역시 남구 대명동" 형식으로 검색
            String fullAddress = sigungu + (dong.isEmpty() ? "%" : " " + dong + "동%");
            
            Map<String, Object> result = jdbcTemplate.queryForMap(sql,
                fullAddress,
                targetArea * 0.8,  // -20%
                targetArea * 1.2   // +20%
            );

            Long sampleCount = ((Number) result.get("sample_count")).longValue();
            
            if (sampleCount == 0) {
                log.warn("유사 매물 없음 - 시군구 전체 평균으로 폴백");
                return estimateBySigungu(property, sigungu);
            }

            Double avgPrice = result.get("avg_price") != null ? 
                ((Number) result.get("avg_price")).doubleValue() : 0.0;
            Double minPrice = result.get("min_price") != null ? 
                ((Number) result.get("min_price")).doubleValue() : 0.0;
            Double maxPrice = result.get("max_price") != null ? 
                ((Number) result.get("max_price")).doubleValue() : 0.0;
            Double stdDev = result.get("std_dev") != null ? 
                ((Number) result.get("std_dev")).doubleValue() : 0.0;

            // 신뢰도 계산
            double confidence = calculateConfidence(sampleCount, stdDev, avgPrice);
            String confidenceLevel = getConfidenceLevel(sampleCount, confidence);

            log.info("시세 예측 완료 - 평균: {}만원, 샘플: {}개, 신뢰도: {}%", 
                avgPrice, sampleCount, String.format("%.1f", confidence));

            return PriceEstimation.builder()
                .estimatedPrice(avgPrice * 10000) // 만원 -> 원
                .minPrice(minPrice * 10000)
                .maxPrice(maxPrice * 10000)
                .confidence(confidence)
                .confidenceLevel(confidenceLevel)
                .sampleCount(sampleCount)
                .message(generateMessage(confidenceLevel, sampleCount))
                .build();

        } catch (Exception e) {
            log.error("시세 예측 실패: {}", e.getMessage(), e);
            return PriceEstimation.builder()
                .estimatedPrice(0.0)
                .confidence(0.0)
                .confidenceLevel("UNAVAILABLE")
                .sampleCount(0L)
                .message("시세 예측 데이터가 부족합니다.")
                .build();
        }
    }

    /**
     * 시군구 전체 평균으로 폴백
     */
    private PriceEstimation estimateBySigungu(Property property, String sigungu) {
        try {
            // 시군구 전체 평균
            String sql = """
                SELECT 
                    AVG(price_10k) as avg_price,
                    MIN(price_10k) as min_price,
                    MAX(price_10k) as max_price,
                    COUNT(*) as sample_count
                FROM realestate_deals
                WHERE sigungu LIKE ?
                  AND price_10k > 0
                """;

            // LIKE 검색으로 유연하게 매칭 (예: "남구" -> "%남구%")
            Map<String, Object> result = jdbcTemplate.queryForMap(sql, "%" + sigungu + "%");
            
            Long sampleCount = ((Number) result.get("sample_count")).longValue();
            
            // 여전히 데이터가 없으면 전국 평균 사용
            if (sampleCount == 0) {
                log.warn("시군구 데이터 없음 - 전국 평균 사용");
                return estimateByNational(property);
            }
            
            Double avgPrice = result.get("avg_price") != null ? 
                ((Number) result.get("avg_price")).doubleValue() : 0.0;
            Double minPrice = result.get("min_price") != null ? 
                ((Number) result.get("min_price")).doubleValue() : 0.0;
            Double maxPrice = result.get("max_price") != null ? 
                ((Number) result.get("max_price")).doubleValue() : 0.0;

            return PriceEstimation.builder()
                .estimatedPrice(avgPrice * 10000)
                .minPrice(minPrice * 10000)
                .maxPrice(maxPrice * 10000)
                .confidence(30.0) // 낮은 신뢰도
                .confidenceLevel("LOW")
                .sampleCount(sampleCount)
                .message("해당 동의 거래 데이터가 부족하여 " + sigungu + " 전체 평균으로 예측되었습니다. (참고용)")
                .build();
                
        } catch (Exception e) {
            log.error("시군구 평균 조회 실패: {}", e.getMessage());
            return estimateByNational(property);
        }
    }

    /**
     * 전국 평균으로 폴백
     */
    private PriceEstimation estimateByNational(Property property) {
        try {
            // 전국 평균
            String sql = """
                SELECT 
                    AVG(price_10k) as avg_price,
                    MIN(price_10k) as min_price,
                    MAX(price_10k) as max_price,
                    COUNT(*) as sample_count
                FROM realestate_deals
                WHERE area_m2 BETWEEN ? AND ?
                  AND price_10k > 0
                """;

            double targetArea = property.getAreaM2() != null ? property.getAreaM2().doubleValue() : 85.0;
            
            Map<String, Object> result = jdbcTemplate.queryForMap(sql,
                targetArea * 0.8,
                targetArea * 1.2
            );
            
            Long sampleCount = ((Number) result.get("sample_count")).longValue();
            Double avgPrice = result.get("avg_price") != null ? 
                ((Number) result.get("avg_price")).doubleValue() : 0.0;
            Double minPrice = result.get("min_price") != null ? 
                ((Number) result.get("min_price")).doubleValue() : 0.0;
            Double maxPrice = result.get("max_price") != null ? 
                ((Number) result.get("max_price")).doubleValue() : 0.0;

            return PriceEstimation.builder()
                .estimatedPrice(avgPrice * 10000)
                .minPrice(minPrice * 10000)
                .maxPrice(maxPrice * 10000)
                .confidence(20.0) // 매우 낮은 신뢰도
                .confidenceLevel("VERY_LOW")
                .sampleCount(sampleCount)
                .message(String.format("해당 지역 거래 데이터가 부족하여 전국 평균(%.0f㎡ 기준)으로 예측되었습니다. (참고용)", targetArea))
                .build();
                
        } catch (Exception e) {
            log.error("전국 평균 조회 실패: {}", e.getMessage());
            return PriceEstimation.builder()
                .estimatedPrice(0.0)
                .confidence(0.0)
                .confidenceLevel("UNAVAILABLE")
                .sampleCount(0L)
                .message("시세 예측 데이터가 부족합니다.")
                .build();
        }
    }

    /**
     * 좌표 기반으로 가장 가까운 거래의 법정동 조회
     * (도로명 주소인 경우 사용)
     */
    private String getDongFromCoordinates(Double longitude, Double latitude) {
        try {
            // 반경 500m 이내의 거래에서 가장 많이 나타나는 동 찾기
            String sql = """
                SELECT dong, COUNT(*) as cnt
                FROM realestate_deals
                WHERE dong IS NOT NULL 
                  AND dong != ''
                  AND SQRT(POW(111 * (? - CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(address, ' ', -1), '-', 1) AS DECIMAL)), 2)) < 0.5
                GROUP BY dong
                ORDER BY cnt DESC
                LIMIT 1
                """;
            
            // 좌표 기반 검색이 복잡하므로, 시군구 내에서 가장 흔한 동 사용
            // 더 간단한 방법: 주소 문자열에서 동 추출 시도
            return "";
            
        } catch (Exception e) {
            log.debug("좌표로 법정동 조회 실패: {}", e.getMessage());
            return "";
        }
    }

    /**
     * 주소에서 시군구 추출
     * realestate_deals 테이블의 sigungu는 "시도 시군구 동" 형식
     */
    private String extractSigungu(String address) {
        if (address == null) return "";
        
        // "서울 강남구 역삼동 ..." -> "서울특별시 강남구"
        // "대구 남구 대명동 ..." -> "대구광역시 남구"
        String[] parts = address.split(" ");
        if (parts.length >= 2) {
            String sido = parts[0];
            String sigungu = parts[1];
            
            // 시도 정규화
            if (sido.equals("서울")) sido = "서울특별시";
            else if (sido.equals("부산")) sido = "부산광역시";
            else if (sido.equals("대구")) sido = "대구광역시";
            else if (sido.equals("인천")) sido = "인천광역시";
            else if (sido.equals("광주")) sido = "광주광역시";
            else if (sido.equals("대전")) sido = "대전광역시";
            else if (sido.equals("울산")) sido = "울산광역시";
            else if (sido.equals("세종")) sido = "세종특별자치시";
            else if (sido.equals("경기")) sido = "경기도";
            else if (sido.equals("강원")) sido = "강원도";
            else if (sido.equals("충북")) sido = "충청북도";
            else if (sido.equals("충남")) sido = "충청남도";
            else if (sido.equals("전북")) sido = "전라북도";
            else if (sido.equals("전남")) sido = "전라남도";
            else if (sido.equals("경북")) sido = "경상북도";
            else if (sido.equals("경남")) sido = "경상남도";
            else if (sido.equals("제주")) sido = "제주특별자치도";
            
            return sido + " " + sigungu;
        }
        return "";
    }

    /**
     * 주소에서 동 추출
     */
    private String extractDong(String address) {
        if (address == null) return "";
        
        // 도로명 주소인 경우 (예: "대구 남구 효서길 53")
        // 법정동 정보가 없으므로 빈 문자열 반환하여 시군구 전체 평균 사용
        String[] parts = address.split(" ");
        if (parts.length >= 3) {
            String thirdPart = parts[2];
            
            // "길", "로", "대로" 등으로 끝나면 도로명 주소
            if (thirdPart.endsWith("길") || thirdPart.endsWith("로") || 
                thirdPart.endsWith("대로") || thirdPart.matches(".*\\d+.*")) {
                // 도로명 주소는 동 정보 없음
                log.debug("도로명 주소 감지: {} - 시군구 전체 평균 사용", address);
                return "";
            }
            
            // 지번 주소인 경우 (예: "서울 강남구 역삼동 123-45")
            // "역삼동"에서 "동" 제거 -> "역삼"
            if (thirdPart.endsWith("동")) {
                return thirdPart.substring(0, thirdPart.length() - 1);
            }
            
            return thirdPart;
        }
        return "";
    }

    /**
     * 신뢰도 계산
     * @param sampleCount 샘플 수
     * @param stdDev 표준편차
     * @param avgPrice 평균 가격
     * @return 신뢰도 (0-100)
     */
    private double calculateConfidence(Long sampleCount, Double stdDev, Double avgPrice) {
        if (avgPrice == 0) return 0.0;
        
        // 샘플 수 점수 (10개 이상이면 만점)
        double sampleScore = Math.min(sampleCount / 10.0, 1.0);
        
        // 변동성 점수 (표준편차가 평균의 50% 이상이면 0점)
        double variabilityScore = stdDev != null && avgPrice > 0 ? 
            1.0 - Math.min(stdDev / avgPrice, 0.5) * 2 : 0.5;
        
        return sampleScore * variabilityScore * 100;
    }

    /**
     * 신뢰도 레벨 결정
     */
    private String getConfidenceLevel(Long sampleCount, double confidence) {
        if (sampleCount < 3) return "VERY_LOW";
        if (confidence >= 70) return "HIGH";
        if (confidence >= 50) return "MEDIUM";
        return "LOW";
    }

    /**
     * 사용자에게 표시할 메시지 생성
     */
    private String generateMessage(String confidenceLevel, Long sampleCount) {
        return switch (confidenceLevel) {
            case "HIGH" -> String.format("신뢰도 높음 - %d건의 유사 거래 데이터 기반", sampleCount);
            case "MEDIUM" -> String.format("신뢰도 보통 - %d건의 유사 거래 데이터 기반 (참고용)", sampleCount);
            case "LOW" -> String.format("신뢰도 낮음 - %d건의 거래 데이터 기반 (참고용)", sampleCount);
            case "VERY_LOW" -> "거래 데이터 부족 - 참고용으로만 활용하세요";
            default -> "시세 예측 불가";
        };
    }
}
