package com.realestate.app.domain.ownership;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${app.file.upload-dir:uploads/ownership}")
    private String uploadDir;

    public FileUploadResult storeFile(MultipartFile file) {
        try {
            // 파일 검증
            if (file.isEmpty()) {
                throw new IllegalArgumentException("빈 파일은 업로드할 수 없습니다.");
            }

            // 파일 크기 검증 (10MB 제한)
            if (file.getSize() > 10 * 1024 * 1024) {
                throw new IllegalArgumentException("파일 크기는 10MB를 초과할 수 없습니다.");
            }

            // 파일 형식 검증
            String contentType = file.getContentType();
            if (contentType == null || !isAllowedContentType(contentType)) {
                throw new IllegalArgumentException("지원하지 않는 파일 형식입니다. PDF, JPG, PNG, DOCX만 업로드 가능합니다.");
            }

            // 업로드 디렉토리 생성
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
                System.out.println("업로드 디렉토리 생성: " + uploadPath.toAbsolutePath());
            }

            // 파일명 생성 (UUID + 타임스탬프)
            String originalFilename = file.getOriginalFilename();
            String fileExtension = getFileExtension(originalFilename);
            String storedFilename = generateStoredFilename(fileExtension);
            
            // 파일 저장
            Path targetLocation = uploadPath.resolve(storedFilename);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            System.out.println("파일 저장 완료: " + targetLocation.toAbsolutePath());

            return FileUploadResult.builder()
                    .originalFilename(originalFilename)
                    .storedFilename(storedFilename)
                    .filePath(targetLocation.toAbsolutePath().toString())
                    .fileSize(file.getSize())
                    .contentType(file.getContentType())
                    .build();

        } catch (IOException e) {
            throw new RuntimeException("파일 저장에 실패했습니다: " + file.getOriginalFilename(), e);
        }
    }

    public void deleteFile(String filePath) {
        try {
            Path path = Paths.get(filePath);
            Files.deleteIfExists(path);
        } catch (IOException e) {
            throw new RuntimeException("파일 삭제에 실패했습니다: " + filePath, e);
        }
    }

    private String getFileExtension(String filename) {
        if (filename == null || filename.lastIndexOf('.') == -1) {
            return "";
        }
        return filename.substring(filename.lastIndexOf('.'));
    }

    private String generateStoredFilename(String extension) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String uuid = UUID.randomUUID().toString().substring(0, 8);
        return timestamp + "_" + uuid + extension;
    }

    private boolean isAllowedContentType(String contentType) {
        return contentType.equals("application/pdf") ||
               contentType.equals("image/jpeg") ||
               contentType.equals("image/jpg") ||
               contentType.equals("image/png") ||
               contentType.equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document") ||
               contentType.equals("application/msword");
    }

    public static class FileUploadResult {
        private String originalFilename;
        private String storedFilename;
        private String filePath;
        private Long fileSize;
        private String contentType;

        public static FileUploadResultBuilder builder() {
            return new FileUploadResultBuilder();
        }

        public String getOriginalFilename() { return originalFilename; }
        public String getStoredFilename() { return storedFilename; }
        public String getFilePath() { return filePath; }
        public Long getFileSize() { return fileSize; }
        public String getContentType() { return contentType; }

        public static class FileUploadResultBuilder {
            private String originalFilename;
            private String storedFilename;
            private String filePath;
            private Long fileSize;
            private String contentType;

            public FileUploadResultBuilder originalFilename(String originalFilename) {
                this.originalFilename = originalFilename;
                return this;
            }

            public FileUploadResultBuilder storedFilename(String storedFilename) {
                this.storedFilename = storedFilename;
                return this;
            }

            public FileUploadResultBuilder filePath(String filePath) {
                this.filePath = filePath;
                return this;
            }

            public FileUploadResultBuilder fileSize(Long fileSize) {
                this.fileSize = fileSize;
                return this;
            }

            public FileUploadResultBuilder contentType(String contentType) {
                this.contentType = contentType;
                return this;
            }

            public FileUploadResult build() {
                FileUploadResult result = new FileUploadResult();
                result.originalFilename = this.originalFilename;
                result.storedFilename = this.storedFilename;
                result.filePath = this.filePath;
                result.fileSize = this.fileSize;
                result.contentType = this.contentType;
                return result;
            }
        }
    }
}