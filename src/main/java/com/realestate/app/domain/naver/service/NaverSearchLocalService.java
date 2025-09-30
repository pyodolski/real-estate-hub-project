package com.realestate.app.domain.naver.service;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.Map;

import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import com.realestate.app.domain.naver.NaverOpenApiProps;
import org.springframework.web.client.RestClientResponseException;

@Service
public class NaverSearchLocalService {
    private final RestClient restClient;

    public NaverSearchLocalService(NaverOpenApiProps props) {
        this.restClient = RestClient.builder()
                .defaultHeader("X-Naver-Client-Id", props.getClientId())
                .defaultHeader("X-Naver-Client-Secret", props.getClientSecret())
                .defaultHeader(HttpHeaders.ACCEPT, "application/json")
                .build();
    }

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
            return restClient.get()
                    .uri(uri)
                    .retrieve()
                    .body(Map.class);
        } catch (RestClientResponseException ex) {
            System.err.println("[NAVER LOCAL ERROR] status=" + ex.getStatusCode()
                    + " body=" + ex.getResponseBodyAsString());
            throw ex;
        }
    }
}