package com.realestate.app.domain.property.service;

import com.realestate.app.domain.property.repository.PropertyImageRepository;
import com.realestate.app.domain.property.repository.PropertyRepository;
import com.realestate.app.domain.property.table.Property;
import com.realestate.app.domain.property.table.PropertyImage;
import com.realestate.app.global.supabase.SupabaseStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class PropertyImageService {

    private final PropertyImageRepository imageRepo;
    private final PropertyRepository propertyRepo;
    private final SupabaseStorageService storageService;


    public PropertyImage saveImage(Long propertyId, String imageUrl) {

        PropertyImage img = new PropertyImage();
        img.setImageUrl(imageUrl);

        Property property = propertyRepo.getReferenceById(propertyId);
        img.setProperty(property);

        return imageRepo.save(img);
    }

    public String uploadImage(Long propertyId, MultipartFile file) {
        String imageUrl = storageService.uploadPropertyImage(propertyId, file);

        Property property = propertyRepo.getReferenceById(propertyId);

        PropertyImage img = new PropertyImage();
        img.setImageUrl(imageUrl);
        img.setProperty(property);

        imageRepo.save(img);

        return imageUrl;
    }
}
