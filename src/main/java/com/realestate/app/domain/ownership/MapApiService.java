package com.realestate.app.domain.ownership;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.Map;

/**
 * 지도 API 연동 서비스
 * 카카오맵, 네이버맵, 구글맵 등의 API를 통합 관리
 */
@Service
@RequiredArgsConstructor
public class MapApiService {

    private final RestTemplate restTemplate = new RestTemplate();
    
    // 로깅을 위한 Logger 추가
    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(MapApiService.class);
    
    // 네이버 API 설정값 주입
    @org.springframework.beans.factory.annotation.Value("${naver.map.client-id}")
    private String naverClientId;
    
    @org.springframework.beans.factory.annotation.Value("${naver.map.client-secret}")
    private String naverClientSecret;

    /**
     * 좌표를 주소로 변환 (Reverse Geocoding)
     */
    public AddressInfo getAddressFromCoordinates(double latitude, double longitude) {
        logger.info("Reverse geocoding request for coordinates: {}, {}", latitude, longitude);
        
        // 네이버 API 구독이 필요하므로 더미 데이터 사용
        logger.info("Using dummy data for coordinates: {}, {}", latitude, longitude);
        
        // 좌표에 따른 간단한 매칭
        if (latitude >= 35.8 && latitude <= 35.9 && longitude >= 128.5 && longitude <= 128.6) {
            // 대구 남구 지역
            logger.info("Matched Daegu Nam-gu area");
            return AddressInfo.builder()
                    .roadAddress("대구 남구 효서길 53")
                    .jibunAddress("대구 남구 효목동 123-45")
                    .buildingName("")
                    .postalCode("42403")
                    .regionCode("2720010100")
                    .build();
        } else if (latitude >= 35.1 && latitude <= 35.2 && longitude >= 129.0 && longitude <= 129.1) {
            // 부산 지역
            logger.info("Matched Busan area");
            return AddressInfo.builder()
                    .roadAddress("부산 중구 중앙대로 26")
                    .jibunAddress("부산 중구 중앙동4가 31")
                    .buildingName("부산시청")
                    .postalCode("48938")
                    .regionCode("2611010400")
                    .build();
        } else if (latitude >= 37.4 && latitude <= 37.6 && longitude >= 127.0 && longitude <= 127.1) {
            // 서울 강남 지역
            logger.info("Matched Seoul Gangnam area");
            return AddressInfo.builder()
                    .roadAddress("서울 강남구 강남대로 396")
                    .jibunAddress("서울 강남구 역삼동 825")
                    .buildingName("강남역")
                    .postalCode("06292")
                    .regionCode("1168010100")
                    .build();
        } else {
            // 기본값 (서울 시청)
            logger.info("Using default Seoul City Hall address");
            return AddressInfo.builder()
                    .roadAddress("서울 중구 세종대로 110")
                    .jibunAddress("서울 중구 태평로1가 31")
                    .buildingName("서울시청")
                    .postalCode("04524")
                    .regionCode("1114010100")
                    .build();
        }
    }

    /**
     * 주소를 좌표로 변환 (Geocoding)
     */
    public CoordinateInfo getCoordinatesFromAddress(String address) {
        logger.info("Geocoding request for address: {}", address);
        
        // 네이버 API 구독이 필요하므로 더미 데이터 사용
        logger.info("Using dummy data for address: {}", address);
        
        // 주소에 따른 간단한 매칭
        String lowerAddress = address.toLowerCase();
        
        if (lowerAddress.contains("대구") || lowerAddress.contains("남구")) {
            logger.info("Matched 대구/남구 - returning Daegu coordinates");
            return CoordinateInfo.builder()
                    .latitude(35.8242)  // 대구 남구
                    .longitude(128.5782)
                    .accuracy("EXACT")
                    .build();
        } else if (lowerAddress.contains("부산")) {
            logger.info("Matched 부산 - returning Busan coordinates");
            return CoordinateInfo.builder()
                    .latitude(35.1796)
                    .longitude(129.0756)
                    .accuracy("EXACT")
                    .build();
        } else if (lowerAddress.contains("서울") || lowerAddress.contains("강남")) {
            logger.info("Matched 서울/강남 - returning Seoul coordinates");
            return CoordinateInfo.builder()
                    .latitude(37.4979)
                    .longitude(127.0276)
                    .accuracy("EXACT")
                    .build();
        } else {
            // 기본값 (서울 시청)
            logger.info("Using default Seoul coordinates for: {}", address);
            return CoordinateInfo.builder()
                    .latitude(37.5666805)
                    .longitude(126.9784147)
                    .accuracy("APPROXIMATE")
                    .build();
        }
    }

    /**
     * 주변 건물 정보 검색
     */
    public java.util.List<BuildingInfo> searchNearbyBuildings(double latitude, double longitude, int radius) {
        // 실제 구현시 POI 검색 API 사용
        return java.util.List.of(
                BuildingInfo.builder()
                        .name("강남역")
                        .category("지하철역")
                        .address("서울 강남구 강남대로 396")
                        .distance(0)
                        .build(),
                BuildingInfo.builder()
                        .name("강남파이낸스센터")
                        .category("오피스빌딩")
                        .address("서울 강남구 테헤란로 152")
                        .distance(200)
                        .build()
        );
    }

    // DTO 클래스들
    @lombok.Builder
    @lombok.Getter
    public static class AddressInfo {
        private String roadAddress;      // 도로명주소
        private String jibunAddress;     // 지번주소
        private String buildingName;     // 건물명
        private String postalCode;       // 우편번호
        private String regionCode;       // 행정구역코드
    }

    @lombok.Builder
    @lombok.Getter
    public static class CoordinateInfo {
        private double latitude;         // 위도
        private double longitude;        // 경도
        private String accuracy;         // 정확도 (EXACT, INTERPOLATION, APPROXIMATE)
    }

    @lombok.Builder
    @lombok.Getter
    public static class BuildingInfo {
        private String name;            // 건물명
        private String category;        // 카테고리
        private String address;         // 주소
        private int distance;           // 거리(미터)
    }
}