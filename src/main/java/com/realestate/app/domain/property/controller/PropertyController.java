package com.realestate.app.domain.property.controller;


import com.realestate.app.domain.auth.security.AuthUser;
import com.realestate.app.domain.property.dto.CompleteDealRequest;
import com.realestate.app.domain.property.dto.JeonseRatioResponse;
import com.realestate.app.domain.property.dto.PropertyFullResponse;
import com.realestate.app.domain.property.repository.PropertyFullRepository;
import com.realestate.app.domain.property.repository.PropertySearchRepository;
import com.realestate.app.domain.property.service.JeonseRatioService;
import com.realestate.app.domain.property.service.PropertyFavoriteService;
import com.realestate.app.domain.property.table.Property;
import com.realestate.app.domain.property.dto.PropertyFilterDto;
import com.realestate.app.domain.property.service.propertyservice;
import com.realestate.app.recproperty.service.PropertySearchService;
import com.realestate.app.recproperty.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import com.realestate.app.domain.property.dto.request.SearchRequest;
import java.math.BigDecimal;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/properties")
@RequiredArgsConstructor
public class PropertyController {

    private final propertyservice service;
    private final JeonseRatioService jeonseRatioService;
    private final PropertyFullRepository propertyFullRepository;
    private final PropertySearchService propertySearchService;
    private final RecommendationService recommendationService;
    private final PropertySearchRepository propertySearchRepository;
    private final PropertyFavoriteService favoriteService; // ⭐ 주입
    // GET /api/properties?swLat=&swLng=&neLat=&neLng=&status=AVAILABLE&minPrice=&maxPrice=
    @GetMapping
    public List<PropertyFullResponse> getInBounds(
            @RequestParam double swLat,
            @RequestParam double swLng,
            @RequestParam double neLat,
            @RequestParam double neLng,
            @RequestParam(required = false) String status
    ) {
        // status 파라미터는 일단 무시하고, AVAILABLE + isActive = true 조건만 사용
        List<Property> props =
                propertyFullRepository.findAllAvailableInBoundsWithOffersAndImages(
                        swLat, swLng, neLat, neLng
                );

        return props.stream()
                .map(PropertyFullResponse::from)
                .toList();
    }



    @GetMapping("/{id}/full")
    public PropertyFullResponse getOne(
            @AuthenticationPrincipal AuthUser me,
            @PathVariable Long id
    ) {
        Property p = propertyFullRepository.findByIdWithActiveOffersAndImages(id)
                .orElseThrow();

        boolean isFav = me != null && favoriteService.isFavored(me.getId(), id);
        long favCount = favoriteService.favoriteCount(id);

        return PropertyFullResponse.from(p, isFav, favCount);
    }


    // ✅ 최종 경로: POST /api/properties/{id}/complete
    @PostMapping("/{id}/complete")
    @PreAuthorize("hasRole('BROKER')")
    public ResponseEntity<Void> completeDeal(
            @PathVariable Long id,
            @AuthenticationPrincipal(expression = "id") Long brokerUserId,
            @RequestBody(required = false) CompleteDealRequest body
    ) {
        if (brokerUserId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
        }
        Long newOwnerId = (body == null ? null : body.newOwnerId());
        service.completeDealByBroker(id, brokerUserId, newOwnerId);
        return ResponseEntity.noContent().build(); // 204
    }

    @GetMapping("/{propertyId}/jeonse-ratio")
    public ResponseEntity<?> jeonseRatioByProperty(
            @PathVariable Long propertyId,
            @RequestParam(value = "salePriceFallback", required = false) BigDecimal salePriceFallback
    ) {
        try {
            // 정상 계산
            JeonseRatioResponse resp =
                    jeonseRatioService.computeByProperty(propertyId, salePriceFallback);
            return ResponseEntity.ok(resp);

        } catch (ResponseStatusException e) {
            // 예상된 비즈니스 에러 1: 전세 오퍼 없음 (404)
            if (e.getStatusCode().equals(HttpStatus.NOT_FOUND)
                    && "전세 오퍼가 없습니다.".equals(e.getReason())) {

                // 바디는 그냥 문자열이나 json 둘 다 가능
                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body("전세 오퍼가 없습니다.");
                // 또는 body(Map.of("message", e.getReason())) 이런식으로
            }

            // 예상된 비즈니스 에러 2: 매매가(예측가) 없음 (503)
            if (e.getStatusCode().equals(HttpStatus.SERVICE_UNAVAILABLE)
                    && e.getReason() != null
                    && e.getReason().contains("매매가(예측가)를 아직 구할 수 없습니다")) {

                return ResponseEntity
                        .status(HttpStatus.SERVICE_UNAVAILABLE)
                        .body(e.getReason());
            }

            throw e;
        }
    }

    @PostMapping("/{id}/view")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> onView(
            @PathVariable Long id,
            @AuthenticationPrincipal AuthUser authUser
    ) {
        if (authUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Long uid = authUser.getId();

        // 🔵 id = propertyId 기준으로 본다고 가정
        PropertyFilterDto dto = propertySearchRepository.findOneForRecommend(id);
        if (dto != null) {
            recommendationService.updatePreferenceOnView(uid, dto);
        }

        return ResponseEntity.ok().build();
    }
    @GetMapping("/search-in-bounds")
    public List<PropertyFilterDto> searchInBounds(
            @RequestParam double swLat,
            @RequestParam double swLng,
            @RequestParam double neLat,
            @RequestParam double neLng,

            @RequestParam(required = false) List<String> houseTypes,
            @RequestParam(required = false) List<String> offerTypes,
            @RequestParam(required = false) Integer areaMin,
            @RequestParam(required = false) Integer areaMax,
            @RequestParam(required = false) Integer floorMin,
            @RequestParam(required = false) Integer floorMax,
            @RequestParam(required = false) String optionMask,
            @RequestParam(required = false, defaultValue = "ALL") String optionMatchMode,

            @RequestParam(required = false) BigDecimal buyMin,
            @RequestParam(required = false) BigDecimal buyMax,
            @RequestParam(required = false) BigDecimal jeonseMin,
            @RequestParam(required = false) BigDecimal jeonseMax,
            @RequestParam(required = false) BigDecimal monthlyDepositMin,
            @RequestParam(required = false) BigDecimal monthlyDepositMax,
            @RequestParam(required = false) BigDecimal monthlyRentMin,
            @RequestParam(required = false) BigDecimal monthlyRentMax,

            @RequestParam(required = false) Integer buildYearMin,
            @RequestParam(required = false) Integer buildYearMax,
            @RequestParam(required = false, defaultValue = "0") Integer page,
            @RequestParam(required = false, defaultValue = "50") Integer size,

            // 네가 쓰는 Principal 타입에 맞게 조정하면 됨
            @AuthenticationPrincipal(expression = "id") Long userId
    ) {
        // ⚠️ 여기서 Builder 쓰면 안 됨! record라서 생성자는 new SearchRequest(...)
        SearchRequest req = new SearchRequest(
                houseTypes,
                offerTypes,
                areaMin, areaMax,
                floorMin, floorMax,
                optionMask,
                optionMatchMode,
                buyMin, buyMax,
                jeonseMin, jeonseMax,
                monthlyDepositMin, monthlyDepositMax,
                monthlyRentMin, monthlyRentMax,
                buildYearMin, buildYearMax,
                page, size
        );

        return propertySearchService.search(req, userId);
    }
}