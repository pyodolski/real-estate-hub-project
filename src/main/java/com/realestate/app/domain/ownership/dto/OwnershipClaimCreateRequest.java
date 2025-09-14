package com.realestate.app.domain.ownership.dto;

import com.realestate.app.domain.ownership.OwnershipDocument;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@Getter 
@Setter
public class OwnershipClaimCreateRequest {
    
    @NotNull(message = "사용자 ID는 필수입니다")
    private Long userId;
    
    @NotNull(message = "매물 ID는 필수입니다")
    private Long propertyId;
    
    @NotBlank(message = "신청자 실명은 필수입니다")
    private String applicantName;
    
    @NotBlank(message = "연락처는 필수입니다")
    private String applicantPhone;
    
    @NotBlank(message = "매물과의 관계는 필수입니다")
    private String relationshipToProperty;
    
    private String additionalInfo;
    
    // === 지도 API 연동을 위한 위치 정보 ===
    private String propertyAddress;    // 지도에서 선택한 주소
    private Double locationX;          // 경도 (longitude)
    private Double locationY;          // 위도 (latitude)
    private String buildingName;       // 건물명
    private String detailedAddress;    // 상세 주소 (동/호수 등)
    private String postalCode;         // 우편번호
    
    // 파일 업로드를 위한 필드들
    private List<MultipartFile> documents; // 첨부 파일들
    private List<String> documentTypes;    // 각 파일의 문서 타입 (PROPERTY_DEED, IDENTITY_CARD 등)
}