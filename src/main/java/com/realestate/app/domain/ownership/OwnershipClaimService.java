package com.realestate.app.domain.ownership;

import com.realestate.app.domain.audit.AuditLog;
import com.realestate.app.domain.audit.AuditLogService;
import com.realestate.app.domain.ownership.dto.OwnershipClaimCreateRequest;
import com.realestate.app.domain.ownership.dto.OwnershipClaimResponse;
import com.realestate.app.domain.ownership.dto.OwnershipClaimRequest;
import com.realestate.app.domain.property.table.Property;
import com.realestate.app.domain.property.repository.PropertyRepository;
import com.realestate.app.domain.user.entity.User;
import com.realestate.app.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
@Transactional
public class OwnershipClaimService {

    private final OwnershipClaimRepository claimRepository;
    private final OwnershipDocumentRepository documentRepository;
    private final UserRepository userRepository;
    private final PropertyRepository propertyRepository;
    private final FileStorageService fileStorageService;
    private final AuditLogService auditLogService;

    // 파일과 함께 자산 증명 신청
    public OwnershipClaimResponse createOwnershipClaim(OwnershipClaimCreateRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("사용자가 존재하지 않습니다."));
        
        Property property = null;
        if (request.getPropertyId() != null) {
            // 기존 매물에 대한 신청인 경우
            property = propertyRepository.findById(request.getPropertyId())
                    .orElseThrow(() -> new IllegalArgumentException("매물이 존재하지 않습니다."));
            
            // 중복 신청 체크
            if (claimRepository.existsByApplicant_IdAndProperty_Id(request.getUserId(), request.getPropertyId())) {
                throw new IllegalStateException("이미 해당 매물에 신청이 존재합니다.");
            }
        } else {
            // 새로운 매물 등록을 위한 신청인 경우
            // 같은 주소로 이미 신청한 내역이 있는지 체크
            if (request.getPropertyAddress() != null) {
                boolean existingSimilarClaim = claimRepository.findAllByApplicant_Id(request.getUserId())
                        .stream()
                        .anyMatch(claim -> 
                            claim.getPropertyAddress() != null && 
                            claim.getPropertyAddress().equals(request.getPropertyAddress()) &&
                            claim.getStatus() == OwnershipClaim.Status.PENDING
                        );
                if (existingSimilarClaim) {
                    throw new IllegalStateException("같은 주소로 심사 중인 신청이 이미 존재합니다.");
                }
            }
        }

        // 신청 정보 저장
        OwnershipClaim claim = OwnershipClaim.builder()
                .applicant(user)
                .property(property)
                .applicantName(request.getApplicantName())
                .applicantPhone(request.getApplicantPhone())
                .relationshipToProperty(request.getRelationshipToProperty())
                .additionalInfo(request.getAdditionalInfo())
                // 지도 API 위치 정보
                .propertyAddress(request.getPropertyAddress())
                .locationX(request.getLocationX())
                .locationY(request.getLocationY())
                .buildingName(request.getBuildingName())
                .detailedAddress(request.getDetailedAddress())
                .postalCode(request.getPostalCode())
                .status(OwnershipClaim.Status.PENDING)
                .documents(new ArrayList<>())
                .build();

        OwnershipClaim savedClaim = claimRepository.save(claim);

        // 파일 업로드 및 문서 정보 저장
        if (request.getDocuments() != null && !request.getDocuments().isEmpty()) {
            List<OwnershipDocument> documents = uploadDocuments(savedClaim, request.getDocuments(), request.getDocumentTypes());
            savedClaim.getDocuments().addAll(documents);
        }

        return convertToResponse(savedClaim);
    }

    // 기존 간단한 신청 (하위 호환성)
    public OwnershipClaimResponse applyOwnershipClaim(OwnershipClaimRequest request) {
        if (claimRepository.existsByApplicant_IdAndProperty_Id(request.getUserId(), request.getPropertyId())) {
            throw new IllegalStateException("이미 해당 매물에 신청이 존재합니다.");
        }

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("사용자가 존재하지 않습니다."));
        Property property = propertyRepository.findById(request.getPropertyId())
                .orElseThrow(() -> new IllegalArgumentException("매물이 존재하지 않습니다."));

        OwnershipClaim claim = OwnershipClaim.builder()
                .applicant(user)
                .property(property)
                .applicantName(request.getApplicantName())
                .applicantPhone(request.getApplicantPhone())
                .relationshipToProperty(request.getRelationshipToProperty())
                .additionalInfo(request.getAdditionalInfo())
                .status(OwnershipClaim.Status.PENDING)
                .documents(new ArrayList<>())
                .build();

        OwnershipClaim saved = claimRepository.save(claim);
        return convertToResponse(saved);
    }

    // 내 보유 자산/신청 내역 조회
    @Transactional(readOnly = true)
    public List<OwnershipClaimResponse> getUserClaims(Long userId) {
        return claimRepository.findAllByApplicant_Id(userId).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // 특정 신청 상세 조회
    @Transactional(readOnly = true)
    public OwnershipClaimResponse getClaimDetail(Long claimId, Long userId) {
        OwnershipClaim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new IllegalArgumentException("신청을 찾을 수 없습니다."));
        
        if (!claim.getApplicant().getId().equals(userId)) {
            throw new IllegalArgumentException("접근 권한이 없습니다.");
        }

        return convertToResponse(claim);
    }

    // 관리자용: 모든 신청 조회
    @Transactional(readOnly = true)
    public List<OwnershipClaimResponse> getAllClaims() {
        return claimRepository.findAll().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // 관리자용: 특정 신청 상세 조회 (권한 체크 없음)
    @Transactional(readOnly = true)
    public OwnershipClaimResponse getClaimDetailForAdmin(Long claimId) {
        OwnershipClaim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new IllegalArgumentException("신청을 찾을 수 없습니다."));
        
        return convertToResponse(claim);
    }

    // 매물 신청 수정
    public OwnershipClaimResponse updateOwnershipClaim(Long claimId, OwnershipClaimCreateRequest request) {
        OwnershipClaim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new IllegalArgumentException("신청을 찾을 수 없습니다."));
        
        // 권한 체크
        if (!claim.getApplicant().getId().equals(request.getUserId())) {
            throw new IllegalArgumentException("수정 권한이 없습니다.");
        }
        
        // 상태 체크 - 심사중인 경우만 수정 가능
        if (claim.getStatus() != OwnershipClaim.Status.PENDING) {
            throw new IllegalStateException("심사중인 신청만 수정할 수 있습니다.");
        }
        
        // 기본 정보 업데이트
        claim.setApplicantName(request.getApplicantName());
        claim.setApplicantPhone(request.getApplicantPhone());
        claim.setRelationshipToProperty(request.getRelationshipToProperty());
        claim.setAdditionalInfo(request.getAdditionalInfo());
        
        // 지도 API 위치 정보 업데이트
        claim.setPropertyAddress(request.getPropertyAddress());
        claim.setLocationX(request.getLocationX());
        claim.setLocationY(request.getLocationY());
        claim.setBuildingName(request.getBuildingName());
        claim.setDetailedAddress(request.getDetailedAddress());
        claim.setPostalCode(request.getPostalCode());
        
        // 새로운 파일이 있는 경우 기존 파일 삭제 후 새 파일 업로드
        if (request.getDocuments() != null && !request.getDocuments().isEmpty()) {
            // 기존 문서들 삭제
            claim.getDocuments().clear();
            
            // 새 문서들 업로드
            List<OwnershipDocument> newDocuments = uploadDocuments(claim, request.getDocuments(), request.getDocumentTypes());
            claim.getDocuments().addAll(newDocuments);
        }
        
        OwnershipClaim updatedClaim = claimRepository.save(claim);

        // 감사 로그 생성
        auditLogService.createAuditLog(
            claim.getApplicant(),
            AuditLog.Actions.UPDATE_CLAIM,
            AuditLog.EntityTypes.OWNERSHIP_CLAIM,
            claimId,
            String.format("매물 소유권 신청 수정 - 신청자: %s, 주소: %s", 
                claim.getApplicantName(), 
                claim.getPropertyAddress())
        );

        return convertToResponse(updatedClaim);
    }

    // 관리자용: 신청 승인
    public OwnershipClaimResponse approveClaim(Long claimId, Long adminId) {
        OwnershipClaim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new IllegalArgumentException("신청을 찾을 수 없습니다."));

        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new IllegalArgumentException("관리자를 찾을 수 없습니다."));

        claim.setStatus(OwnershipClaim.Status.APPROVED);
        claim.setAdmin(admin);
        claim.setReviewedAt(LocalDateTime.now());

        OwnershipClaim savedClaim = claimRepository.save(claim);

        // 승인 시 Property 자동 생성
        createPropertyFromClaim(savedClaim);

        // 감사 로그 생성
        auditLogService.createAuditLog(
            admin,
            AuditLog.Actions.APPROVE_CLAIM,
            AuditLog.EntityTypes.OWNERSHIP_CLAIM,
            claimId,
            String.format("매물 소유권 신청 승인 - 신청자: %s, 주소: %s", 
                claim.getApplicantName(), 
                claim.getPropertyAddress())
        );

        return convertToResponse(savedClaim);
    }

    // 승인된 신청으로부터 Property 생성
    private void createPropertyFromClaim(OwnershipClaim claim) {
        // 이미 Property가 연결되어 있으면 생성하지 않음
        if (claim.getProperty() != null) {
            return;
        }

        // 기본 매물 제목 생성
        String title = generatePropertyTitle(claim);

        Property property = Property.builder()
                .title(title)
                .address(claim.getPropertyAddress() != null ? claim.getPropertyAddress() : "주소 정보 없음")
                .status(Property.Status.AVAILABLE)
                .listingType(Property.ListingType.OWNER)
                .owner(claim.getApplicant())
                .claim(claim)
                .locationX(claim.getLocationX())
                .locationY(claim.getLocationY())
                .anomalyAlert(false)
                .build();

        Property savedProperty = propertyRepository.save(property);
        
        // 역참조 설정
        claim.setProperty(savedProperty);
        claimRepository.save(claim);
    }

    // 매물 제목 자동 생성 (중복 방지)
    private String generatePropertyTitle(OwnershipClaim claim) {
        StringBuilder baseTitle = new StringBuilder();
        
        if (claim.getBuildingName() != null && !claim.getBuildingName().trim().isEmpty()) {
            baseTitle.append(claim.getBuildingName());
        } else if (claim.getPropertyAddress() != null) {
            // 주소에서 동/구 정보 추출하여 제목 생성
            String[] addressParts = claim.getPropertyAddress().split(" ");
            if (addressParts.length >= 2) {
                baseTitle.append(addressParts[addressParts.length - 2]).append(" ");
                baseTitle.append(addressParts[addressParts.length - 1]);
            } else {
                baseTitle.append("매물");
            }
        } else {
            baseTitle.append("매물");
        }
        
        if (claim.getDetailedAddress() != null && !claim.getDetailedAddress().trim().isEmpty()) {
            baseTitle.append(" ").append(claim.getDetailedAddress());
        }
        
        // 중복 방지 로직
        String finalTitle = baseTitle.toString();
        int counter = 1;
        
        while (propertyRepository.existsByTitle(finalTitle)) {
            finalTitle = baseTitle.toString() + " (" + counter + ")";
            counter++;
        }
        
        return finalTitle;
    }

    // 관리자용: 신청 거절
    public OwnershipClaimResponse rejectClaim(Long claimId, Long adminId, String rejectionReason) {
        OwnershipClaim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new IllegalArgumentException("신청을 찾을 수 없습니다."));

        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new IllegalArgumentException("관리자를 찾을 수 없습니다."));

        claim.setStatus(OwnershipClaim.Status.REJECTED);
        claim.setAdmin(admin);
        claim.setRejectionReason(rejectionReason);
        claim.setReviewedAt(LocalDateTime.now());

        OwnershipClaim savedClaim = claimRepository.save(claim);

        // 감사 로그 생성
        auditLogService.createAuditLog(
            admin,
            AuditLog.Actions.REJECT_CLAIM,
            AuditLog.EntityTypes.OWNERSHIP_CLAIM,
            claimId,
            String.format("매물 소유권 신청 거절 - 신청자: %s, 주소: %s, 거절사유: %s", 
                claim.getApplicantName(), 
                claim.getPropertyAddress(),
                rejectionReason)
        );

        return convertToResponse(savedClaim);
    }

    private List<OwnershipDocument> uploadDocuments(OwnershipClaim claim, List<MultipartFile> files, List<String> documentTypes) {
        if (files.size() != documentTypes.size()) {
            throw new IllegalArgumentException("파일 개수와 문서 타입 개수가 일치하지 않습니다.");
        }

        return IntStream.range(0, files.size())
                .mapToObj(i -> {
                    MultipartFile file = files.get(i);
                    String documentTypeStr = documentTypes.get(i);
                    
                    // 파일 저장
                    FileStorageService.FileUploadResult uploadResult = fileStorageService.storeFile(file);
                    
                    // 문서 정보 저장
                    return OwnershipDocument.builder()
                            .claim(claim)
                            .documentType(OwnershipDocument.DocumentType.valueOf(documentTypeStr))
                            .originalFilename(uploadResult.getOriginalFilename())
                            .storedFilename(uploadResult.getStoredFilename())
                            .filePath(uploadResult.getFilePath())
                            .fileSize(uploadResult.getFileSize())
                            .contentType(uploadResult.getContentType())
                            .build();
                })
                .map(documentRepository::save)
                .collect(Collectors.toList());
    }

    // 매물 신청 삭제 (취소)
    public void deleteClaim(Long claimId, Long userId) {
        OwnershipClaim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new IllegalArgumentException("신청 내역을 찾을 수 없습니다."));
        
        // 본인의 신청인지 확인
        if (!claim.getApplicant().getId().equals(userId)) {
            throw new IllegalArgumentException("본인의 신청만 취소할 수 있습니다.");
        }
        
        // PENDING 상태만 취소 가능
        if (claim.getStatus() != OwnershipClaim.Status.PENDING) {
            throw new IllegalStateException("심사 중인 신청만 취소할 수 있습니다.");
        }
        
        // 관련 문서 파일 삭제
        List<OwnershipDocument> documents = claim.getDocuments();
        for (OwnershipDocument document : documents) {
            try {
                fileStorageService.deleteFile(document.getFilePath());
            } catch (Exception e) {
                // 파일 삭제 실패는 로그만 남기고 계속 진행
                System.err.println("파일 삭제 실패: " + document.getFilePath() + " - " + e.getMessage());
            }
        }
        
        // 문서 레코드 삭제
        documentRepository.deleteAll(documents);
        
        // 신청 삭제
        claimRepository.delete(claim);
        
        // 감사 로그 기록
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        
        auditLogService.createAuditLog(
                user,
                "DELETE_OWNERSHIP_CLAIM",
                "OwnershipClaim",
                claimId,
                "매물 신청 취소: " + claim.getApplicantName()
        );
    }

    private OwnershipClaimResponse convertToResponse(OwnershipClaim claim) {
        List<OwnershipClaimResponse.DocumentInfo> documentInfos = claim.getDocuments().stream()
                .map(doc -> OwnershipClaimResponse.DocumentInfo.builder()
                        .documentId(doc.getId())
                        .documentType(doc.getDocumentType().getDescription())
                        .originalFilename(doc.getOriginalFilename())
                        .downloadUrl("/api/ownership/documents/" + doc.getId() + "/download")
                        .fileSize(doc.getFileSize())
                        .uploadedAt(doc.getUploadedAt())
                        .build())
                .collect(Collectors.toList());

        return OwnershipClaimResponse.builder()
                .claimId(claim.getId())
                .propertyId(claim.getProperty() != null ? claim.getProperty().getId() : null)
                .title(claim.getProperty() != null ? claim.getProperty().getTitle() : null)
                .address(claim.getProperty() != null ? claim.getProperty().getAddress() : claim.getPropertyAddress())
                .status(claim.getStatus().name())
                .applicantName(claim.getApplicantName())
                .applicantPhone(claim.getApplicantPhone())
                .relationshipToProperty(claim.getRelationshipToProperty())
                .additionalInfo(claim.getAdditionalInfo())
                .rejectionReason(claim.getRejectionReason())
                // 지도 API 위치 정보
                .propertyAddress(claim.getPropertyAddress())
                .locationX(claim.getLocationX())
                .locationY(claim.getLocationY())
                .buildingName(claim.getBuildingName())
                .detailedAddress(claim.getDetailedAddress())
                .postalCode(claim.getPostalCode())
                .createdAt(claim.getCreatedAt())
                .reviewedAt(claim.getReviewedAt())
                .deadline(claim.getDeadline())
                .documents(documentInfos)
                .build();
    }
}