package com.realestate.app.recproperty.service;

import com.realestate.app.domain.property.dto.PropertyFilterDto;
import com.realestate.app.recproperty.entity.UserPropertyPreference;
import com.realestate.app.recproperty.repository.RecommenderFeatureWeightsRepository;
import com.realestate.app.recproperty.repository.UserPropertyPreferenceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final UserPropertyPreferenceRepository prefRepo;
    private final RecommenderFeatureWeightsRepository weightRepo;

    // 1) 기본 유저 벡터
    public double[] defaultUserVector() {
        return new double[] {
                0.4,         // price
                0.3, 0.4, 0.3, // sale / jeonse / wolse
                0.5, 0.3, 0.2, // apart / villa / one
                0.4,         // area
                0.6          // option
                // subway/POI는 나중에 추가
        };
    }

    // 2) 가중치 로드
    private double[] loadWeights() {
        return weightRepo.findTopByNameOrderByUpdatedAtDesc("default")
                .getWeights(); // weights 길이는 buildRawVector 결과와 동일하게(지금은 9)
    }

    // 3) 매물 raw vector 생성
    public double[] buildRawVector(PropertyFilterDto p) {

        double price = p.reprPrice();                     // DTO 유틸 메서드
        double priceNorm = Math.tanh(price / 100_000_000.0);

        double area = p.area() == null ? 0.0 : p.area();
        double areaNorm = Math.tanh(area / 50.0);

        int optCnt = p.optionCount();
        double optionNorm = Math.min(optCnt / 5.0, 1.0);

        String ot = p.offerType();
        double sale   = "SALE".equals(ot)   ? 1.0 : 0.0;
        double jeonse = "JEONSE".equals(ot) ? 1.0 : 0.0;
        double wolse  = "WOLSE".equals(ot)  ? 1.0 : 0.0;

        String ht = p.houseType();
        double apart = "APART".equals(ht) ? 1.0 : 0.0;
        double villa = "VILLA".equals(ht) ? 1.0 : 0.0;
        double one   = "ONE".equals(ht)   ? 1.0 : 0.0;

        // 지금은 POI(지하철/버스/편의점) 안 넣고 9차원으로 사용
        return new double[] {
                priceNorm,
                sale, jeonse, wolse,
                apart, villa, one,
                areaNorm,
                optionNorm
        };
    }

    // 4) raw * weight
    private double[] applyWeights(double[] raw, double[] w) {
        double[] out = new double[raw.length];
        for (int i = 0; i < raw.length; i++) {
            out[i] = raw[i] * w[i];
        }
        return out;
    }

    // 5) 코사인 유사도
    public double cosine(double[] u, double[] v) {
        double dot = 0, nu = 0, nv = 0;
        for (int i = 0; i < u.length; i++) {
            dot += u[i] * v[i];
            nu  += u[i] * u[i];
            nv  += v[i] * v[i];
        }
        if (nu == 0 || nv == 0) return 0;
        return dot / (Math.sqrt(nu) * Math.sqrt(nv));
    }

    // 6) 상세 보기 때 유저 취향 업데이트
    @Transactional
    public void updatePreferenceOnView(Long userId, PropertyFilterDto p) {

        UserPropertyPreference pref =
                prefRepo.findById(userId)
                        .orElse(
                                UserPropertyPreference.builder()
                                        .userId(userId)
                                        .prefVector(defaultUserVector())
                                        .build()
                        );

        double[] old = pref.getPrefVector();
        double[] w   = loadWeights();

        double[] itemRaw = buildRawVector(p);
        double[] item    = applyWeights(itemRaw, w);

        double alpha = 0.2;
        double[] updated = new double[item.length];

        for (int i = 0; i < item.length; i++) {
            updated[i] = old[i] * (1 - alpha) + item[i] * alpha;
        }

        pref.setPrefVector(updated);
        pref.setUpdatedAt(OffsetDateTime.now());
        prefRepo.save(pref);
    }

    // 7) 검색 결과에 점수/추천 태그/설명 부여
    public void applyRecommendation(Long userId,
                                    List<PropertyFilterDto> list,
                                    int topN) {

        UserPropertyPreference pref =
                prefRepo.findById(userId).orElse(null);

        double[] userVec = (pref != null && pref.getPrefVector() != null)
                ? pref.getPrefVector()
                : defaultUserVector();

        double[] w = loadWeights();

        for (PropertyFilterDto p : list) {
            double[] raw = buildRawVector(p);
            double[] vec = applyWeights(raw, w);

            double score = cosine(userVec, vec);
            p.setScore(score);
            p.setRecommended(false);
            p.setRecommendReason(buildReason(p));
        }

        list.stream()
                .sorted(Comparator.comparing(PropertyFilterDto::getScore).reversed())
                .limit(topN)
                .forEach(p -> p.setRecommended(true));
    }

    // 추천 이유 텍스트
    private String buildReason(PropertyFilterDto p) {
        List<String> R = new ArrayList<>();
        if (p.optionCount() >= 3) R.add("생활 옵션이 풍부합니다");
        if (p.area() != null && p.area() > 40) R.add("넓은 실사용 면적입니다");
        if (R.isEmpty()) return "사용자 취향과 전반적으로 유사한 매물입니다";
        return String.join(" · ", R);
    }
}
