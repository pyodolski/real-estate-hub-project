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

    /**
     * 좌표를 주소로 변환 (Reverse Geocoding)
     */
    public AddressInfo getAddressFromCoordinates(double latitude, double longitude) {
        // 실제 구현시 사용할 API에 따라 구현
        // 예시: 카카오맵 API
        /*
        String url = String.format(
            "https://dapi.kakao.com/v2/local/geo/coord2address.json?x=%f&y=%f",
            longitude, latitude
        );
        
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "KakaoAK " + kakaoApiKey);
        
        HttpEntity<?> entity = new HttpEntity<>(headers);
        ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, entity, Map.class);
        
        // 응답 파싱하여 AddressInfo 객체 생성
        */
        
        // 데모용 더미 데이터
        return AddressInfo.builder()
                .roadAddress("서울 강남구 강남대로 396")
                .jibunAddress("서울 강남구 역삼동 825")
                .buildingName("강남역")
                .postalCode("06292")
                .regionCode("1168010100")
                .build();
    }

    /**
     * 주소를 좌표로 변환 (Geocoding)
     */
    public CoordinateInfo getCoordinatesFromAddress(String address) {
        // 실제 구현시 사용할 API에 따라 구현
        // 예시: 카카오맵 API
        /*
        String url = "https://dapi.kakao.com/v2/local/search/address.json?query=" + 
                     URLEncoder.encode(address, StandardCharsets.UTF_8);
        
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "KakaoAK " + kakaoApiKey);
        
        HttpEntity<?> entity = new HttpEntity<>(headers);
        ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, entity, Map.class);
        
        // 응답 파싱하여 CoordinateInfo 객체 생성
        */
        
        // 데모용 더미 데이터
        return CoordinateInfo.builder()
                .latitude(37.4979)
                .longitude(127.0276)
                .accuracy("EXACT")
                .build();
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