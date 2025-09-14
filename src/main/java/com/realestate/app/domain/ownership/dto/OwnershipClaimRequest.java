package com.realestate.app.domain.ownership.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter 
@Setter
public class OwnershipClaimRequest {
    
    @NotNull(message = "사용자 ID는 필수입니다")
    private Long userId;
    
    @NotNull(message = "매물 ID는 필수입니다")
    private Long propertyId;
    
    @NotBlank(message = "신청자 실명은 필수입니다")
    private String applicantName;
    
    @NotBlank(message = "연락처는 필수입니다")
    private String applicantPhone;
    
    @NotBlank(message = "매물과의 관계는 필수입니다")
    private String relationshipToProperty; // 예: "소유자", "임차인", "상속인" 등
    
    private String additionalInfo; // 추가 설명 (선택사항)
}
