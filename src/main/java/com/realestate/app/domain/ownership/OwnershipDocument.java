package com.realestate.app.domain.ownership;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ownership_documents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OwnershipDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "claim_id", nullable = false)
    private OwnershipClaim claim;

    @Enumerated(EnumType.STRING)
    @Column(name = "document_type", nullable = false)
    private DocumentType documentType;

    @Column(name = "original_filename", nullable = false)
    private String originalFilename;

    @Column(name = "stored_filename", nullable = false)
    private String storedFilename;

    @Column(name = "file_path", nullable = false)
    private String filePath;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "content_type")
    private String contentType;

    @Column(name = "uploaded_at", nullable = false)
    private LocalDateTime uploadedAt;

    @PrePersist
    public void prePersist() {
        this.uploadedAt = LocalDateTime.now();
    }

    public enum DocumentType {
        PROPERTY_DEED("등기부등본"),           // 부동산 등기부등본
        IDENTITY_CARD("신분증"),              // 신분증
        RESIDENCE_CERTIFICATE("주민등록등본"), // 주민등록등본
        TAX_CERTIFICATE("납세증명서"),         // 납세증명서
        OTHER("기타");                       // 기타 서류

        private final String description;

        DocumentType(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }
}