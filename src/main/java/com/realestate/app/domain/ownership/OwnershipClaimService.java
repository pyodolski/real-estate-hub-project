package com.realestate.app.domain.ownership;

import com.realestate.app.domain.ownership.dto.OwnershipClaimCreateRequest;
import com.realestate.app.domain.ownership.dto.OwnershipClaimResponse;
import com.realestate.app.domain.ownership.dto.OwnershipClaimRequest;
import com.realestate.app.domain.property.table.Property;
import com.realestate.app.domain.property.repository.PropertyRepository;
import com.realestate.app.domain.user.User;
import com.realestate.app.domain.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
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

    // 파일과 함께 자산 증명 신청
    public OwnershipClaimResponse createOwnershipClaim(OwnershipClaimCreateRequest request) {
        // 중복 신청 체크
        if (claimRepository.existsByApplicant_IdAndProperty_Id(request.getUserId(), request.getPropertyId())) {
            throw new IllegalStateException("이미 해당 매물에 신청이 존재합니다.");
        }

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("사용자가 존재하지 않습니다."));
        Property property = propertyRepository.findById(request.getPropertyId())
                .orElseThrow(() -> new IllegalArgumentException("매물이 존재하지 않습니다."));

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
                .toList();
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
                .toList();
    }

    // 관리자용: 특정 신청 상세 조회 (권한 체크 없음)
    @Transactional(readOnly = true)
    public OwnershipClaimResponse getClaimDetailForAdmin(Long claimId) {
        OwnershipClaim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new IllegalArgumentException("신청을 찾을 수 없습니다."));
        
        return convertToResponse(claim);
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

        return convertToResponse(claimRepository.save(claim));
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

        return convertToResponse(claimRepository.save(claim));
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
                .toList();
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
                .toList();

        return OwnershipClaimResponse.builder()
                .claimId(claim.getId())
                .propertyId(claim.getProperty().getId())
                .title(claim.getProperty().getTitle())
                .address(claim.getProperty().getAddress())
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