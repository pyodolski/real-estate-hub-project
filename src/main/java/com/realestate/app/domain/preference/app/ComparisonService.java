package com.realestate.app.domain.preference.app;

import com.realestate.app.domain.preference.infra.jpa.*;
import com.realestate.app.domain.preference.*;
import com.realestate.app.domain.preference.api.dto.GroupSummaryResponse;
import com.realestate.app.domain.property.table.Property;
import com.realestate.app.domain.user.entity.User;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ComparisonService {

    public static final int MAX_GROUPS_PER_USER = 10;
    public static final int MAX_ITEMS_PER_GROUP = 3;

    private final ComparisonGroupJpaRepository groupRepo;
    private final ComparisonItemJpaRepository itemRepo;
    private final EntityManager em;

    // ============ 그룹 ============

    @Transactional
    public ComparisonGroup createGroup(Long userId, String nameOrNull) {
        if (groupRepo.countByUser(userId) >= MAX_GROUPS_PER_USER) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "비교 그룹은 최대 " + MAX_GROUPS_PER_USER + "개까지 생성 가능합니다.");
        }
        ComparisonGroup g = ComparisonGroup.builder()
                .user(em.getReference(User.class, userId))
                .groupName((nameOrNull == null || nameOrNull.isBlank()) ? "비교그룹 " + java.time.LocalDateTime.now() : nameOrNull)
                .build();
        return groupRepo.save(g);
    }

    @Transactional(readOnly = true)
    public Page<ComparisonGroup> myGroups(Long userId, Pageable pageable) {
        return groupRepo.findMyGroups(userId, pageable);
    }

    @Transactional(readOnly = true)
    public Page<GroupSummaryResponse> myGroupSummaries(Long userId, Pageable pageable) {
        return groupRepo.findMyGroups(userId, pageable)
                .map(GroupSummaryResponse::from);
    }

    @Transactional
    public ComparisonGroup renameGroup(Long groupId, Long userId, String newName) {
        ComparisonGroup g = getOwnedGroup(groupId, userId);
        if (newName != null && !newName.isBlank()) g.setGroupName(newName);
        return g; // JPA dirty checking
    }

    @Transactional
    public void deleteGroup(Long groupId, Long userId) {
        ComparisonGroup g = getOwnedGroup(groupId, userId);
        groupRepo.delete(g);
    }

    private ComparisonGroup getOwnedGroup(Long groupId, Long userId) {
        ComparisonGroup g = groupRepo.findById(groupId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "그룹 없음"));
        if (!Objects.equals(g.getUser().getId(), userId))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "소유자가 아닙니다");
        return g;
    }

    // ============ 아이템 ============

    @Transactional
    public void addItem(Long groupId, Long userId, Long propertyId) {
        ComparisonGroup g = getOwnedGroup(groupId, userId);
        // 이미 3개 이상이면 추가 불가 (서비스 레벨 체크)
        // itemRepo.countByGroupId(groupId)는 DB 쿼리이므로, g.getItems().size()로 체크해도 됨 (단, lazy loading 주의)
        // 여기서는 안전하게 count 쿼리 사용
        long currentCount = itemRepo.countByGroupId(groupId);
        if (currentCount >= MAX_ITEMS_PER_GROUP) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "한 그룹에는 최대 " + MAX_ITEMS_PER_GROUP + "개까지만 추가할 수 있습니다.");
        }
        ComparisonItem item = ComparisonItem.builder()
                .group(g)
                .property(em.getReference(Property.class, propertyId))
                .build();
        try {
            itemRepo.save(item);
        } catch (Exception e) {
            // uk uniq_group_prop 위반 등
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "이미 추가된 아파트이거나 유효하지 않은 요청입니다.");
        }
    }

    @Transactional
    public void removeItem(Long groupId, Long userId, Long propertyId) {
        getOwnedGroup(groupId, userId);
        itemRepo.deleteByGroupIdAndPropertyId(groupId, propertyId);
    }

    @Transactional(readOnly = true)
    public List<ComparisonItem> items(Long groupId, Long userId) {
        getOwnedGroup(groupId, userId);
        return itemRepo.findByGroupIdWithProperty(groupId);
    }

    // ============ 랭킹/비교 ============

    public record Weights(
            double priceWeight,       // 가격(낮을수록 좋음)
            double unitPriceWeight,   // 평단가(낮을수록 좋음)
            double buildYearWeight    // 준공연도(높을수록 좋음)
    ) {
        public static Weights defaults() {
            return new Weights(0.5, 0.3, 0.2);
        }
        public double sum() { return priceWeight + unitPriceWeight + buildYearWeight; }
    }

    public record RankingRow(Long propertyId, String label, double score) {}

    public record CompareResult(
            List<RankingRow> ranking,                // 정렬된 랭킹
            List<String> categories,                // 차트 X축(라벨)
            Map<String, List<Number>> series        // 차트 시리즈(가격/평단가/준공연도)
    ) {}

    @Transactional(readOnly = true)
    public CompareResult compute(Long groupId, Long userId, Weights weightsOrNull) {
        Weights w = (weightsOrNull == null) ? Weights.defaults() : weightsOrNull;
        if (w.sum() <= 0) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "가중치 합이 0보다 커야 합니다.");

        List<ComparisonItem> list = items(groupId, userId);
        if (list.isEmpty()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "비교할 아파트가 없습니다.");

        // 원시값 수집
        class R {
            Long id; String label;
            Double price; Double unitPrice; Double buildYear;
            double nPrice, nUnit, nYear; double score;
        }
        List<R> rows = new ArrayList<>();
        for (var it : list) {
            Property p = it.getProperty();
            R r = new R();
            r.id = p.getId();
            r.label = (p.getTitle() != null && !p.getTitle().isBlank()) ? p.getTitle() : p.getAddress();
            r.price = toD(p.getPrice());
            r.unitPrice = (p.getPrice() != null && p.getAreaM2() != null && p.getAreaM2().doubleValue() > 0)
                    ? p.getPrice().doubleValue() / p.getAreaM2().doubleValue()
                    : null;
            r.buildYear = (p.getBuildingYear() != null) ? p.getBuildingYear().doubleValue() : null;
            rows.add(r);
        }

        // 정규화 (min-max). 방향: price/unitPrice는 낮을수록 좋음, buildYear는 높을수록 좋음
        minMaxNormalize(rows, v -> v.price,     true,  (r, v) -> r.nPrice = v);
        minMaxNormalize(rows, v -> v.unitPrice, true,  (r, v) -> r.nUnit  = v);
        minMaxNormalize(rows, v -> v.buildYear, false, (r, v) -> r.nYear  = v);

        // 점수 계산
        for (var r : rows) {
            r.score = r.nPrice * w.priceWeight + r.nUnit * w.unitPriceWeight + r.nYear * w.buildYearWeight;
        }

        // 랭킹 정렬 (desc)
        rows.sort(Comparator.comparingDouble((R x) -> x.score).reversed());

        // 차트 시리즈 (원시값)
        List<String> categories = rows.stream().map(rr -> rr.label).toList();
        Map<String, List<Number>> series = new LinkedHashMap<>();
        series.put("가격(원)", rows.stream().map(rr -> safe(rr.price)).toList());
        series.put("평단가(원/㎡)", rows.stream().map(rr -> safe(rr.unitPrice)).toList());
        series.put("준공연도", rows.stream().map(rr -> safe(rr.buildYear)).toList());

        // 응답 모델
        List<RankingRow> ranking = rows.stream()
                .map(rr -> new RankingRow(rr.id, rr.label, round(rr.score, 4)))
                .toList();

        return new CompareResult(ranking, categories, series);
    }

    private static Double toD(BigDecimal b) { return b == null ? null : b.doubleValue(); }
    private static Number safe(Number n) { return n == null ? 0 : n; }
    private static double round(double v, int scale) {
        double k = Math.pow(10, scale); return Math.round(v * k) / k;
    }

    private interface Getter<T> { Double get(T t); }
    private interface Setter<T> { void set(T t, double v); }

    private static <T> void minMaxNormalize(List<T> rows, Getter<T> getter, boolean lowerIsBetter, Setter<T> setter) {
        double min = Double.POSITIVE_INFINITY, max = Double.NEGATIVE_INFINITY;
        for (var r : rows) {
            Double v = getter.get(r);
            if (v == null) continue;
            min = Math.min(min, v); max = Math.max(max, v);
        }
        double span = max - min;
        for (var r : rows) {
            Double v = getter.get(r);
            double norm;
            if (v == null || span == 0) norm = 0.5;
            else {
                double x = (v - min) / span;          // 0~1
                norm = lowerIsBetter ? (1.0 - x) : x; // 방향 반전
            }
            setter.set(r, norm);
        }
    }
}
