package com.realestate.app.domain.user.file;

import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Base64;
import java.util.UUID;

@Service
public class UserFileStorage {

    // data:image/png;base64,xxxxxx 이런 문자열 받는다고 가정
    public String saveBase64Image(String dataUrl, Long userId) {
        try {
            int commaIdx = dataUrl.indexOf(',');
            if (commaIdx < 0) {
                throw new IllegalArgumentException("잘못된 data URL 형식입니다.");
            }

            String meta = dataUrl.substring(0, commaIdx);      // "data:image/png;base64"
            String base64 = dataUrl.substring(commaIdx + 1);   // 실제 Base64 본문

            String ext = "png";
            if (meta.contains("image/jpeg") || meta.contains("image/jpg")) {
                ext = "jpg";
            } else if (meta.contains("image/webp")) {
                ext = "webp";
            }

            byte[] bytes = Base64.getDecoder().decode(base64);

            String filename = "user-" + (userId != null ? userId : "new") + "-" +
                    UUID.randomUUID() + "." + ext;

            Path uploadDir = Paths.get("uploads/profile-images");
            Files.createDirectories(uploadDir);

            Path target = uploadDir.resolve(filename);
            Files.write(target, bytes);

            // 🔹 브라우저에서 접근 가능한 URL 형식으로 리턴
            return "/files/profile-images/" + filename;
        } catch (IOException e) {
            throw new RuntimeException("프로필 이미지 저장 실패", e);
        }
    }
}
