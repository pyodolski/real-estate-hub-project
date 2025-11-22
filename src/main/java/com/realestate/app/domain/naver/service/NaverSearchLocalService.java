package com.realestate.app.domain.naver.service;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.List;

import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import com.realestate.app.domain.naver.NaverOpenApiProps;
import org.springframework.web.client.RestClientResponseException;

@Service
public class NaverSearchLocalService {

    private final RestClient searchClient;   // 검색(local.json)
    private final RestClient geoClient;      // 역지오코딩(map-reversegeocode)

    public NaverSearchLocalService(
            NaverOpenApiProps props
    ) {
        // 🔹 네이버 Local 검색용 (기존 그대로)
        this.searchClient = RestClient.builder()
                .defaultHeader("X-Naver-Client-Id", props.getClientId())
                .defaultHeader("X-Naver-Client-Secret", props.getClientSecret())
                .defaultHeader(HttpHeaders.ACCEPT, "application/json")
                .build();

        // 🔹 네이버 Reverse Geocode용 (NCP API Gateway)
        this.geoClient = RestClient.builder()
                .baseUrl("https://maps.apigw.ntruss.com")
                .defaultHeader("X-NCP-APIGW-API-KEY-ID", "madicr2e0g")
                .defaultHeader("X-NCP-APIGW-API-KEY", "RqPrWT4gO7UvNqdvcHTZC61Ch0XNc9Ek0ZDK1u12")
                .defaultHeader(HttpHeaders.ACCEPT, "application/json")
                .build();
    }

    // ─────────────────────────────────────────────────────────────
    // 1) 기존: 단순 검색 (필요하면 계속 사용)
    // ─────────────────────────────────────────────────────────────
    @SuppressWarnings("unchecked")
    public Map<String, Object> searchPlaces(String query, int display) {
        int safeDisplay = Math.min(Math.max(display, 1), 5);

        URI uri = UriComponentsBuilder
                .fromUriString("https://openapi.naver.com/v1/search/local.json")
                .queryParam("query", query)
                .queryParam("display", safeDisplay)
                .queryParam("start", 1)
                .queryParam("sort", "sim")
                .encode(StandardCharsets.UTF_8)
                .build()
                .toUri();

        try {
            return searchClient.get()
                    .uri(uri)
                    .retrieve()
                    .body(Map.class);
        } catch (RestClientResponseException ex) {
            System.err.println("[NAVER LOCAL ERROR] status=" + ex.getStatusCode()
                    + " body=" + ex.getResponseBodyAsString());
            throw ex;
        }
    }

    // ─────────────────────────────────────────────────────────────
    // 2) 근처 검색 (가짜 근사 ver. – lat/lng → 동 이름 → "역삼동 편의점")
    // ─────────────────────────────────────────────────────────────
    @SuppressWarnings("unchecked")
    public Map<String, Object> searchPlacesNear(String query, int display,
                                                Double lat, Double lng) {

        String finalQuery = query;

        if (lat != null && lng != null) {
            // 위도/경도를 "역삼동" 같은 동 이름으로 바꾸기
            String dongName = reverseGeocodeToDong(lat, lng);
            if (dongName != null && !dongName.isBlank()) {
                finalQuery = dongName + " " + query;  // 예: "역삼동 편의점"
               //System.out.println("[NAVER LOCAL] using query = " + finalQuery);
            }
        }

        int safeDisplay = Math.min(Math.max(display, 1), 5);

        URI uri = UriComponentsBuilder
                .fromUriString("https://openapi.naver.com/v1/search/local.json")
                .queryParam("query", finalQuery)
                .queryParam("display", safeDisplay)
                .queryParam("start", 1)
                .queryParam("sort", "sim")
                .encode(StandardCharsets.UTF_8)
                .build()
                .toUri();

        try {
            return searchClient.get()
                    .uri(uri)
                    .retrieve()
                    .body(Map.class);
        } catch (RestClientResponseException ex) {
            System.err.println("[NAVER LOCAL ERROR] status=" + ex.getStatusCode()
                    + " body=" + ex.getResponseBodyAsString());
            throw ex;
        }
    }

    // ─────────────────────────────────────────────────────────────
    // 3) 실제 Reverse Geocode → 동 이름 뽑기
    // ─────────────────────────────────────────────────────────────
    @SuppressWarnings("unchecked")
    private String reverseGeocodeToDong(double lat, double lng) {
        try {
            // coords = "경도,위도"
            String coords = lng + "," + lat;

            Map<String, Object> resp = geoClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/map-reversegeocode/v2/gc")
                            .queryParam("coords", coords)
                            .queryParam("sourcecrs", "epsg:4326")
                            .queryParam("orders", "legalcode")  // 법정동 기준
                            .queryParam("output", "json")
                            .build())
                    .retrieve()
                    .body(Map.class);

            if (resp == null) {
                return null;
            }

            Object resultsObj = resp.get("results");
            if (!(resultsObj instanceof List)) {
                return null;
            }

            List<Map<String, Object>> results = (List<Map<String, Object>>) resultsObj;
            if (results.isEmpty()) {
                return null;
            }

            // 보통 name=legalcode 인 항목 하나가 들어옴
            Map<String, Object> first = results.get(0);
            Object regionObj = first.get("region");
            if (!(regionObj instanceof Map)) {
                return null;
            }
            Map<String, Object> region = (Map<String, Object>) regionObj;

            // area3.name 이 "역삼동" / "서소문동" 이런 애
            Object area3Obj = region.get("area3");
            if (!(area3Obj instanceof Map)) {
                return null;
            }
            Map<String, Object> area3 = (Map<String, Object>) area3Obj;

            Object dongNameObj = area3.get("name");
            if (dongNameObj instanceof String dongName && !dongName.isBlank()) {
                return dongName;
            }

            return null;
        } catch (RestClientResponseException ex) {
            System.err.println("[NAVER REVERSE GEO ERROR] status=" + ex.getStatusCode()
                    + " body=" + ex.getResponseBodyAsString());
            return null; // 실패하면 그냥 동 이름 없이 원래 query 사용
        } catch (Exception e) {
            System.err.println("[NAVER REVERSE GEO ERROR] " + e.getMessage());
            return null;
        }
    }
}
