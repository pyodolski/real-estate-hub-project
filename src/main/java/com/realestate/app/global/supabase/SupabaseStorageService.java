package com.realestate.app.global.supabase;

import lombok.extern.slf4j.Slf4j;
import okhttp3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Service
@Slf4j
public class SupabaseStorageService {

    @Value("${supabase.project-url}")
    private String projectUrl;

    @Value("${supabase.service-key}")   // service_role 키!!
    private String serviceKey;

    @Value("${supabase.storage.bucket}")
    private String bucket;              // property_image

    @Value("${supabase.storage.base-folder}")
    private String baseFolder;          // property

    private final OkHttpClient client = new OkHttpClient();

    public String uploadPropertyImage(Long propertyId, MultipartFile file) {
        String originalName = file.getOriginalFilename();
        if (originalName == null || originalName.isBlank()) {
            originalName = "image.jpg";
        }

        String filename = UUID.randomUUID() + "-" + originalName;
        // property/{propertyId}/{filename}
        String path = baseFolder + "/" + propertyId + "/" + filename;

        // ✅ 여기가 '업로드' 엔드포인트 (list 아님!)
        String uploadUrl = projectUrl + "/storage/v1/object/" + bucket + "/" + path;

        try {
            String contentType = file.getContentType();
            if (contentType == null || contentType.isBlank()) {
                contentType = "application/octet-stream";
            }

            RequestBody body = RequestBody.create(
                    file.getBytes(),
                    MediaType.parse(contentType)
            );

            Request request = new Request.Builder()
                    .url(uploadUrl)
                    .post(body)
                    // ✅ 반드시 service_role 기반 키 사용
                    .addHeader("apikey", serviceKey)
                    .addHeader("Authorization", "Bearer " + serviceKey)
                    .build();

            Response response = client.newCall(request).execute();

            String resBody = response.body() != null ? response.body().string() : "";
            log.info("[SUPABASE UPLOAD] status={} body={}", response.code(), resBody);

            if (!response.isSuccessful()) {
                throw new IllegalStateException("Supabase upload failed: " +
                        response.code() + " - " + resBody);
            }

            // public URL
            return projectUrl + "/storage/v1/object/public/" + bucket + "/" + path;

        } catch (IOException e) {
            log.error("Supabase upload error", e);
            throw new RuntimeException("Supabase upload error: " + e.getMessage(), e);
        }
    }
}
