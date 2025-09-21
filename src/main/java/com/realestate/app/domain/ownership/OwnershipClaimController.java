package com.realestate.app.domain.ownership;

import com.realestate.app.domain.auth.security.AuthUser;
import com.realestate.app.domain.ownership.dto.OwnershipClaimCreateRequest;
import com.realestate.app.domain.ownership.dto.OwnershipClaimRequest;
import com.realestate.app.domain.ownership.dto.OwnershipClaimResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/ownership")
@RequiredArgsConstructor
public class OwnershipClaimController {

    private final OwnershipClaimService claimService;
    private final OwnershipDocumentRepository documentRepository;
    private final MapApiService mapApiService;

    // 파일과 함께 자산 증명 신청 (지도 API 연동 지원)
    @PostMapping(value = "/claims", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public OwnershipClaimResponse createClaim(
            @AuthenticationPrincipal AuthUser currentUser,
            @RequestParam(value = "propertyId", required = false) Long propertyId,
            @RequestParam("applicantName") String applicantName,
            @RequestParam("applicantPhone") String applicantPhone,
            @RequestParam("relationshipToProperty") String relationshipToProperty,
            @RequestParam(value = "additionalInfo", required = false) String additionalInfo,
            // === 지도 API 연동 파라미터 ===
            @RequestParam(value = "propertyAddress", required = false) String propertyAddress,
            @RequestParam(value = "locationX", required = false) Double locationX,
            @RequestParam(value = "locationY", required = false) Double locationY,
            @RequestParam(value = "buildingName", required = false) String buildingName,
            @RequestParam(value = "detailedAddress", required = false) String detailedAddress,
            @RequestParam(value = "postalCode", required = false) String postalCode,
            // === 파일 업로드 파라미터 ===
            @RequestParam(value = "documents", required = false) List<MultipartFile> documents,
            @RequestParam(value = "documentTypes", required = false) List<String> documentTypes) {
        
        try {
            OwnershipClaimCreateRequest request = new OwnershipClaimCreateRequest();
            request.setUserId(currentUser.getId());
            request.setPropertyId(propertyId);
        request.setApplicantName(applicantName);
        request.setApplicantPhone(applicantPhone);
        request.setRelationshipToProperty(relationshipToProperty);
        request.setAdditionalInfo(additionalInfo);
        
        // 지도 API 위치 정보 설정
        request.setPropertyAddress(propertyAddress);
        request.setLocationX(locationX);
        request.setLocationY(locationY);
        request.setBuildingName(buildingName);
        request.setDetailedAddress(detailedAddress);
        request.setPostalCode(postalCode);
        
            // 파일 정보 설정
            request.setDocuments(documents);
            request.setDocumentTypes(documentTypes);
            
            return claimService.createOwnershipClaim(request);
        } catch (IllegalArgumentException | IllegalStateException e) {
            throw new IllegalArgumentException(e.getMessage());
        } catch (Exception e) {
            throw new RuntimeException("매물 등록 처리 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    // 기존 방식 (하위 호환성, JSON 요청)
    @PostMapping("/apply")
    public OwnershipClaimResponse apply(@Valid @RequestBody OwnershipClaimRequest request) {
        return claimService.applyOwnershipClaim(request);
    }

    // 내 보유 자산/신청 내역 조회
    @GetMapping("/my-claims")
    public List<OwnershipClaimResponse> getMyClaims(@AuthenticationPrincipal AuthUser currentUser) {
        return claimService.getUserClaims(currentUser.getId());
    }

    // 특정 신청 상세 조회
    @GetMapping("/claims/{claimId}")
    public OwnershipClaimResponse getClaimDetail(
            @PathVariable Long claimId,
            @AuthenticationPrincipal AuthUser currentUser) {
        return claimService.getClaimDetail(claimId, currentUser.getId());
    }

    // 문서 다운로드
    @GetMapping("/documents/{documentId}/download")
    public ResponseEntity<Resource> downloadDocument(@PathVariable Long documentId) {
        try {
            OwnershipDocument document = documentRepository.findById(documentId)
                    .orElseThrow(() -> new IllegalArgumentException("문서를 찾을 수 없습니다."));

            Path filePath = Paths.get(document.getFilePath());
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(document.getContentType()))
                        .header(HttpHeaders.CONTENT_DISPOSITION, 
                                "attachment; filename=\"" + document.getOriginalFilename() + "\"")
                        .body(resource);
            } else {
                throw new RuntimeException("파일을 읽을 수 없습니다.");
            }
        } catch (MalformedURLException e) {
            throw new RuntimeException("파일 경로가 잘못되었습니다.", e);
        }
    }

    // === 관리자용 API ===

    // 모든 신청 조회 (관리자용)
    @GetMapping("/admin/claims")
    public List<OwnershipClaimResponse> getAllClaims(@AuthenticationPrincipal AuthUser admin) {
        if (!"admin".equals(admin.getRole())) {
            throw new IllegalArgumentException("관리자 권한이 필요합니다.");
        }
        return claimService.getAllClaims();
    }

    // 특정 신청 상세 조회 (관리자용)
    @GetMapping("/admin/claims/{claimId}")
    public OwnershipClaimResponse getClaimDetailForAdmin(
            @PathVariable Long claimId,
            @AuthenticationPrincipal AuthUser admin) {
        if (!"admin".equals(admin.getRole())) {
            throw new IllegalArgumentException("관리자 권한이 필요합니다.");
        }
        return claimService.getClaimDetailForAdmin(claimId);
    }

    // 신청 승인 (관리자용)
    @PostMapping("/admin/claims/{claimId}/approve")
    public OwnershipClaimResponse approveClaim(
            @PathVariable Long claimId,
            @AuthenticationPrincipal AuthUser admin) {
        if (!"admin".equals(admin.getRole())) {
            throw new IllegalArgumentException("관리자 권한이 필요합니다.");
        }
        return claimService.approveClaim(claimId, admin.getId());
    }

    // 신청 거절 (관리자용)
    @PostMapping("/admin/claims/{claimId}/reject")
    public OwnershipClaimResponse rejectClaim(
            @PathVariable Long claimId,
            @AuthenticationPrincipal AuthUser admin,
            @RequestBody Map<String, String> request) {
        if (!"admin".equals(admin.getRole())) {
            throw new IllegalArgumentException("관리자 권한이 필요합니다.");
        }
        String rejectionReason = request.get("rejectionReason");
        return claimService.rejectClaim(claimId, admin.getId(), rejectionReason);
    }

    // 문서 타입 목록 조회
    @GetMapping("/document-types")
    public List<Map<String, String>> getDocumentTypes() {
        return List.of(
                Map.of("value", "PROPERTY_DEED", "label", "등기부등본"),
                Map.of("value", "IDENTITY_CARD", "label", "신분증"),
                Map.of("value", "RESIDENCE_CERTIFICATE", "label", "주민등록등본"),
                Map.of("value", "TAX_CERTIFICATE", "label", "납세증명서"),
                Map.of("value", "OTHER", "label", "기타")
        );
    }

    // === 지도 API 연동 엔드포인트 ===

    // 좌표로 주소 검색 (Reverse Geocoding)
    @GetMapping("/map/address")
    public Map<String, Object> getAddressFromCoordinates(
            @RequestParam double latitude,
            @RequestParam double longitude) {
        MapApiService.AddressInfo addressInfo = mapApiService.getAddressFromCoordinates(latitude, longitude);
        
        return Map.of(
                "roadAddress", addressInfo.getRoadAddress() != null ? addressInfo.getRoadAddress() : "",
                "jibunAddress", addressInfo.getJibunAddress() != null ? addressInfo.getJibunAddress() : "",
                "buildingName", addressInfo.getBuildingName() != null ? addressInfo.getBuildingName() : "",
                "postalCode", addressInfo.getPostalCode() != null ? addressInfo.getPostalCode() : "",
                "regionCode", addressInfo.getRegionCode() != null ? addressInfo.getRegionCode() : ""
        );
    }

    // 주소로 좌표 검색 (Geocoding)
    @GetMapping("/map/coordinates")
    public Map<String, Object> getCoordinatesFromAddress(@RequestParam String address) {
        MapApiService.CoordinateInfo coordinateInfo = mapApiService.getCoordinatesFromAddress(address);
        
        return Map.of(
                "latitude", coordinateInfo.getLatitude(),
                "longitude", coordinateInfo.getLongitude(),
                "accuracy", coordinateInfo.getAccuracy()
        );
    }

    // 주변 건물 검색
    @GetMapping("/map/nearby-buildings")
    public List<Map<String, Object>> searchNearbyBuildings(
            @RequestParam double latitude,
            @RequestParam double longitude,
            @RequestParam(defaultValue = "500") int radius) {
        List<MapApiService.BuildingInfo> buildings = mapApiService.searchNearbyBuildings(latitude, longitude, radius);
        
        return buildings.stream()
                .map(building -> Map.<String, Object>of(
                        "name", building.getName(),
                        "category", building.getCategory(),
                        "address", building.getAddress(),
                        "distance", building.getDistance()
                ))
                .collect(java.util.stream.Collectors.toList());
    }
}