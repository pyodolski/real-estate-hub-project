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
    public Map<String, Object> places(@RequestParam("q") String q,
                                      @RequestParam(value = "limit", defaultValue = "5") int limit) {
        String query = q == null ? "" : q.trim();
        if (query.codePointCount(0, query.length()) < 2) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "query must be at least 2 chars");
        }
        if (limit < 1 || limit > 10) { // 필요시 상한 지정
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "limit must be between 1 and 10");
        }

        try {
            return service.searchPlaces(query, limit);
        } catch (ResponseStatusException e) {
            // 서비스에서 의미 있게 던진 상태/메시지를 그대로 전달
            throw e;
        } catch (WebClientResponseException e) {
            // 네이버 응답을 구분해 전달
            HttpStatusCode status = e.getStatusCode();
            if (status.isSameCodeAs(HttpStatus.UNAUTHORIZED)) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "invalid naver api credentials", e);
            } else if (status.isSameCodeAs(HttpStatus.FORBIDDEN)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "forbidden by naver api", e);
            } else if (status.isSameCodeAs(HttpStatus.TOO_MANY_REQUESTS)) {
                throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "rate limited by naver", e);
            } else if (status.is4xxClientError()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "bad request to naver", e);
            } else {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "naver upstream error", e);
            }
        } catch (Exception e) {
            // 알 수 없는 내부/업스트림 오류
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "naver local api call failed", e);
        }
    }
}
