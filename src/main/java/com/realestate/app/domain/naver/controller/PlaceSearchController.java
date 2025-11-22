package com.realestate.app.domain.naver.controller;

import com.realestate.app.domain.naver.service.NaverSearchLocalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.Map;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
@Validated
public class PlaceSearchController {

    private final NaverSearchLocalService service;

    @GetMapping("/places")
    public Map<String, Object> places(
            @RequestParam("q") String q,
            @RequestParam(value = "limit", defaultValue = "5") int limit,
            @RequestParam(value = "lat", required = false) Double lat,
            @RequestParam(value = "lng", required = false) Double lng
    ) {
        String query = q == null ? "" : q.trim();
        if (query.codePointCount(0, query.length()) < 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "query must be at least 1 char");
        }
        if (limit < 1 || limit > 10) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "limit must be between 1 and 10");
        }

        try {
            return service.searchPlacesNear(query, limit, lat, lng);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "naver local api call failed", e);
        }
    }

}
