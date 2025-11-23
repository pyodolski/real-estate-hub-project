package com.realestate.app.domain.property.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PropertyFilterDto {

    // --- DB에서 가져오는 기본 필드 ---
    private Long id;
    private Long propertyId;
    private String houseType;
    private String offerType;
    private Integer floor;
    private String oftion;       // "1010..." 문자열
    private Double totalPrice;
    private Double deposit;
    private Double monthlyRent;
    private String title;
    private String address;
    private Integer area;
    private Double lat;
    private Double lng;

    // --- 추천 시스템에서 쓰는 추가 필드 ---
    private Double score;            // 코사인 유사도 점수
    private boolean recommended;     // 추천 매물 여부
    private String recommendReason;  // 추천 이유 텍스트

    // ---------- 유틸 메서드들 ----------

    /** 추천용 대표 가격: 매매/전세/월세를 하나의 숫자로 통합 */
    public double reprPrice() {
        if (totalPrice != null) return totalPrice;
        if (deposit != null && monthlyRent == null) return deposit; // 전세
        if (deposit != null && monthlyRent != null) {
            // 월세를 대충 50개월치로 환산 (원하면 계수 조정 가능)
            return deposit + monthlyRent * 50;
        }
        return 0.0;
    }

    /** 옵션 비트 문자열에서 1의 개수 세기 */
    public int optionCount() {
        if (oftion == null) return 0;
        int cnt = 0;
        for (char c : oftion.toCharArray()) {
            if (c == '1') cnt++;
        }
        return cnt;
    }

    // 예전 record 스타일 p.area(), p.offerType() 쓰는 코드 호환용 헬퍼
    public Integer area() { return area; }
    public String offerType() { return offerType; }
    public String houseType() { return houseType; }
}
