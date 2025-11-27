// com/realestate/app/domain/comparison/api/ComparisonRestController.java
package com.realestate.app.domain.preference.api;

import com.realestate.app.domain.chat.support.AuthFacade;
import com.realestate.app.domain.preference.app.ComparisonService;
import com.realestate.app.domain.preference.ComparisonItem;
import com.realestate.app.domain.preference.ComparisonGroup;
import com.realestate.app.domain.preference.api.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comparisons")
@RequiredArgsConstructor
public class ComparisonRestController {

    private final ComparisonService service;
    private final AuthFacade auth;

    // 그룹 생성 (기본 이름 자동)
    @PostMapping("/groups")
    public GroupResponse create(@RequestBody(required = false) CreateGroupRequest req) {
        Long me = auth.currentUserId();
        ComparisonGroup g = service.createGroup(me, req == null ? null : req.name());
        return GroupResponse.from(g);
    }

    // 내 그룹 목록
    @GetMapping("/groups")
    public Page<GroupSummaryResponse> myGroups(@RequestParam(defaultValue = "0") int page,
                                               @RequestParam(defaultValue = "20") int size) {
        Long me = auth.currentUserId();
        return service.myGroupSummaries(me, PageRequest.of(page, size));
    }

    // 그룹 이름 변경
    @PatchMapping("/groups/{groupId}/name")
    public GroupResponse rename(@PathVariable Long groupId, @RequestBody RenameGroupRequest req) {
        Long me = auth.currentUserId();
        return GroupResponse.from(service.renameGroup(groupId, me, req.name()));
    }

    // 그룹 삭제
    @DeleteMapping("/groups/{groupId}")
    public void delete(@PathVariable Long groupId) {
        Long me = auth.currentUserId();
        service.deleteGroup(groupId, me);
    }

    // 아이템 추가/삭제/조회
    @PostMapping("/groups/{groupId}/items")
    public void addItem(@PathVariable Long groupId, @RequestBody AddItemRequest req) {
        Long me = auth.currentUserId();
        service.addItem(groupId, me, req.propertyId());
    }

    @DeleteMapping("/groups/{groupId}/items/{propertyId}")
    public void removeItem(@PathVariable Long groupId, @PathVariable Long propertyId) {
        Long me = auth.currentUserId();
        service.removeItem(groupId, me, propertyId);
    }

    @GetMapping("/groups/{groupId}")
    public GroupDetailResponse detail(@PathVariable Long groupId) {
        Long me = auth.currentUserId();
        List<ComparisonItem> items = service.items(groupId, me);
        return GroupDetailResponse.from(groupId, items);
    }

    // 가중치 기반 비교(표/그래프용)
    @PostMapping("/groups/{groupId}/rankings")
    public CompareResultResponse ranking(@PathVariable Long groupId, @RequestBody(required = false) WeightsRequest req) {
        Long me = auth.currentUserId();
        var weights = (req == null)
                ? ComparisonService.Weights.defaults()
                : new ComparisonService.Weights(req.priceWeight(), req.unitPriceWeight(), req.buildYearWeight());
        var result = service.compute(groupId, me, weights);
        return CompareResultResponse.from(result);
    }
}
