package com.realestate.app.global.supabase;

import lombok.RequiredArgsConstructor;
import okhttp3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class SupabaseStorageService {

    @Value("${supabase.project-url}")
    private String projectUrl;

    @Value("${supabase.api-key}")
    private String apiKey;

    private final OkHttpClient client = new OkHttpClient();

    private static final String BUCKET = "property_image";

    public String uploadPropertyImage(Long propertyId, MultipartFile file) {

        try {
            String filename = UUID.randomUUID() + "-" + file.getOriginalFilename();

            String path = "property/" + propertyId + "/" + filename;

            String uploadUrl =
                    projectUrl + "/storage/v1/object/" + BUCKET + "/" + path;

            RequestBody fileBody = RequestBody.create(
                    file.getBytes(),
                    MediaType.parse(file.getContentType())
            );

            Request request = new Request.Builder()
                    .url(uploadUrl)
                    .header("apikey", apiKey)
                    .header("Authorization", "Bearer " + apiKey)
                    .post(fileBody)
                    .build();

            Response response = client.newCall(request).execute();

            if (!response.isSuccessful()) {
                throw new RuntimeException("Supabase upload failed: " + response);
            }

            return projectUrl + "/storage/v1/object/public/" + BUCKET + "/" + path;

        } catch (IOException e) {
            throw new RuntimeException("Upload error", e);
        }
    }
}
