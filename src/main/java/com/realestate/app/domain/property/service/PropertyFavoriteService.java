package com.realestate.app.domain.property.service;

import com.realestate.app.domain.property.dto.PropertyFavoriteDto;
import com.realestate.app.domain.property.repository.PropertyFavoriteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.realestate.app.domain.property.repository.FavoriteJpaRepository;       // 엔티티 JPA용
import com.realestate.app.domain.user.repository.UserRepository;                           // 실제 패키지에 맞추세요
import com.realestate.app.domain.property.repository.PropertyRepository;        // 실제 패키지에 맞추세요
import com.realestate.app.domain.property.table.Favorite;

import java.time.LocalDateTime;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PropertyFavoriteService {

    private static final Logger log = LoggerFactory.getLogger(PropertyFavoriteService.class); // ✅ 직접 선언

    private final PropertyFavoriteRepository repo;
    private final FavoriteJpaRepository favoriteRepo;              // 존재여부/삭제/추가 (JPA)
    private final UserRepository userRepo;                      // 즐겨찾기 추가 시 참조
    private final PropertyRepository propertyRepo;

    public List<PropertyFavoriteDto> myFavorites(Long userId, int limit, int offset) {
        int safeLimit = Math.max(1, Math.min(200, limit));
        int safeOffset = Math.max(0, offset);
        return repo.findByUserId(userId, safeLimit, safeOffset);
    }

    public boolean isFavored(Long userId, Long propertyId) {
        return favoriteRepo.existsByUser_IdAndProperty_Id(userId, propertyId);
    }

    public long favoriteCount(Long propertyId) {
        return favoriteRepo.countByProperty_Id(propertyId);
    }

    @Transactional
    public boolean toggleFavorite(Long userId, Long propertyId) {

        boolean exists = favoriteRepo.existsByUser_IdAndProperty_Id(userId, propertyId);
        if (exists) {
            long n = favoriteRepo.deleteByUser_IdAndProperty_Id(userId, propertyId);
            log.debug("favorite delete affectedRows={} (userId={}, propertyId={})", n, userId, propertyId);
            return false; // 해제됨
        }

        Favorite f = new Favorite();
        f.setUser(userRepo.getReferenceById(userId));
        f.setProperty(propertyRepo.getReferenceById(propertyId));
        favoriteRepo.save(f);
        return true; // 추가됨
    }

    @Transactional
    public void removeFavorite(Long userId, Long propertyId) {
        long n = favoriteRepo.deleteByUser_IdAndProperty_Id(userId, propertyId);
        log.debug("favorite delete affectedRows={} (userId={}, propertyId={})", n, userId, propertyId);
    }

}
