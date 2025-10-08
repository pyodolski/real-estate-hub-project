package com.realestate.app.domain.property.service;

import com.realestate.app.domain.property.dto.JeonseRatioResponse;
import com.realestate.app.domain.property.repository.PropertyOfferRepository;
import com.realestate.app.domain.property.repository.PropertyRepository;
import com.realestate.app.domain.property.table.Property;
import com.realestate.app.domain.property.table.PropertyOffer;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class JeonseRatioService {

    private final PropertyRepository propertyRepository;
    private final PropertyOfferRepository offerRepository;

    /**
     * 매물 ID 기준(활성 JEONSE 최신 1건)으로 계산
     * @param propertyId 매물ID
     * @param salePriceFallback 클라이언트 임시 매매가(선택)
     */
    public JeonseRatioResponse computeByProperty(Long propertyId, BigDecimal salePriceFallback) {
        Property p = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "매물을 찾을 수 없습니다."));

        // 활성 JEONSE 오퍼 1건
        PropertyOffer jeonse = offerRepository
                .findTopByProperty_IdAndTypeAndIsActiveOrderByUpdatedAtDesc(
                        propertyId, PropertyOffer.OfferType.JEONSE, true)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "전세 오퍼가 없습니다."));

        return computeInternal(p, jeonse, salePriceFallback);
    }

    /**
     * 오퍼 ID 기준으로 계산
     */
    public JeonseRatioResponse computeByOffer(Long offerId, BigDecimal salePriceFallback) {
        PropertyOffer offer = offerRepository.findOneForCheck(offerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "오퍼를 찾을 수 없습니다."));
        if (offer.getType() != PropertyOffer.OfferType.JEONSE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "전세 오퍼가 아닙니다.");
        }
        return computeInternal(offer.getProperty(), offer, salePriceFallback);
    }

    // ---- 내부 공통 ----
    private JeonseRatioResponse computeInternal(Property p, PropertyOffer jeonse, BigDecimal salePriceFallback) {
        // 보증금 체크
        BigDecimal deposit = jeonse.getDeposit();
        if (deposit == null || deposit.signum() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "보증금(deposit)이 없습니다.");
        }

        // 매매가(예측가) 소스 우선순위: client-fallback -> property.price -> (없으면 에러)
        BigDecimal salePriceUsed;
        String source;

        if (salePriceFallback != null) {
            if (salePriceFallback.signum() <= 0)
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "임시 매매가는 0보다 커야 합니다.");
            salePriceUsed = salePriceFallback;
            source = "CLIENT_FALLBACK";
        } else if (p.getPrice() != null && p.getPrice().signum() > 0) {
            // 지금은 Property.price를 임시 '매매가'로 사용
            salePriceUsed = p.getPrice();
            source = "PROPERTY_PRICE";
        } else {
            // 나중에 예측가 제공자(PREDICTED) 붙이면 여기서 호출 → 없으면 503
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "매매가(예측가)를 아직 구할 수 없습니다. salePriceFallback을 제공해 주세요.");
        }

        // 계산
        BigDecimal ratio = deposit
                .divide(salePriceUsed, 6, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .setScale(2, RoundingMode.HALF_UP);

        String comment = commentFor(ratio);

        return new JeonseRatioResponse(
                jeonse.getId(),
                p.getId(),
                deposit.setScale(0, RoundingMode.DOWN),
                salePriceUsed.setScale(0, RoundingMode.DOWN),
                ratio,
                comment,
                source
        );
    }

    private String commentFor(BigDecimal percent) {
        int c70 = percent.compareTo(BigDecimal.valueOf(70));
        int c80 = percent.compareTo(BigDecimal.valueOf(80));
        if (c70 >= 0 && c80 <= 0) return "적정 수준입니다.";
        if (c80 > 0) return "전세가율이 높습니다. 갭이 작아 위험도가 높을 수 있어요.";
        return "전세가율이 낮습니다. 보증금 대비 매매가가 높은 편일 수 있습니다.";
    }
}
