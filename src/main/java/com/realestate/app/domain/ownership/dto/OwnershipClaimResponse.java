package com.realestate.app.domain.ownership.dto;

import lombok.Builder;
import lombok.Getter;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class OwnershipClaimResponse {
    private Long claimId;          // 신청 ID
    private Long propertyId;       // 매물 ID
    private String title;          // 매물 제목
    private String address;        // 매물 주소
    private String status;         // 신청 상태 (PENDING / APPROVED / REJECTED)
    private String applicantName;  // 신청자 실명
    private String applicantPhone; // 신청자 연락처
    private String relationshipToProperty; // 매물과의 관계
    private String additionalInfo; // 추가 설명
    private String rejectionReason; // 거절 사유 (거절된 경우)
    
    // === 지도 API 위치 정보 ===
    private String propertyAddress;    // 지도에서 선택한 주소
    private Double locationX;          // 경도 (longitude)
    private Double locationY;          // 위도 (latitude)
    private String buildingName;       // 건물명
    private String detailedAddress;    // 상세 주소 (동/호수 등)
    private String postalCode;         // 우편번호
    
    private LocalDateTime createdAt; // 신청일
    private LocalDateTime reviewedAt; // 심사 완료일
    private LocalDateTime deadline;  // 마감일 (updatedAt + 7일)
    private List<DocumentInfo> documents; // 첨부 문서 목록
    
    @Getter
    @Builder
    public static class DocumentInfo {
        private Long documentId;
        private String documentType;
        private String originalFilename;
        private String downloadUrl;
        private Long fileSize;
        private LocalDateTime uploadedAt;
    }
}

/*
1. 자산 증명 신청
POST /api/ownership/apply
Request Body (JSON)
{
  "userId": 1,
  "propertyId": 101
}
Response (성공 예시)
{
  "claimId": 5,
  "propertyId": 101,
  "title": "강남 오피스텔",
  "address": "서울 강남구 역삼동 123-45",
  "status": "PENDING",
  "createdAt": "2025-09-14T14:30:00",
  "deadline": "2025-09-21T14:30:00"
}

2. 내 보유 자산/신청 내역 조회
GET /api/ownership/my-claims/{userId}
Response (성공 예시)
[
  {
    "claimId": 5,
    "propertyId": 101,
    "title": "강남 오피스텔",
    "address": "서울 강남구 역삼동 123-45",
    "status": "PENDING",
    "createdAt": "2025-09-14T14:30:00",
    "deadline": "2025-09-21T14:30:00"
  },
  {
    "claimId": 6,
    "propertyId": 102,
    "title": "송파 아파트",
    "address": "서울 송파구 잠실동 222-11",
    "status": "APPROVED",
    "createdAt": "2025-08-20T10:15:00",
    "deadline": "2025-08-27T10:15:00"
  }
]
 */