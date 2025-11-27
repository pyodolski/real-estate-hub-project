package com.realestate.app.domain.preference.api.dto;

import com.realestate.app.domain.preference.ComparisonItem;
import com.realestate.app.domain.property.table.Property;
import com.realestate.app.domain.property.table.PropertyImage;

import java.util.Comparator;

public record ComparisonItemSummary(
        Long propertyId,
        String propertyName, // 매물 이름 (예: 아파트 이름)
        Long price,
        String priceText,    // 포맷팅된 가격 (예: 매매 3억 5,000만)
        String address,
        String thumbnailUrl,
        String status
) {
    public static ComparisonItemSummary from(ComparisonItem item) {
        Property property = item.getProperty();
        
        String thumbnailUrl = property.getImages().stream()
                .sorted(Comparator.comparing(PropertyImage::getId))
                .map(PropertyImage::getImageUrl)
                .findFirst()
                .orElse(null);

        String priceText = formatPrice(property);

        return new ComparisonItemSummary(
                property.getId(),
                property.getAddress(), // title 대신 address 사용
                property.getPrice() != null ? property.getPrice().longValue() : 0L,
                priceText, // 포맷팅된 가격 문자열
                property.getAddress(),
                thumbnailUrl,
                property.getStatus().name()
        );
    }

    private static String formatPrice(Property property) {
        var offers = property.getOffers();
        if (offers == null || offers.isEmpty()) {
            return property.getPrice() != null ? formatAmount(property.getPrice().longValue()) : "가격 정보 없음";
        }

        // 활성화된 오퍼 우선, 없으면 첫 번째
        var offer = offers.stream()
                .filter(o -> Boolean.TRUE.equals(o.getIsActive()))
                .findFirst()
                .orElse(offers.iterator().next());

        if (offer.getType() == com.realestate.app.domain.property.table.PropertyOffer.OfferType.SALE) {
            if (offer.getTotalPrice() == null) return "매매가 협의";
            return "매매 " + formatAmount(offer.getTotalPrice().longValue());
        } else if (offer.getType() == com.realestate.app.domain.property.table.PropertyOffer.OfferType.JEONSE) {
            if (offer.getTotalPrice() == null) return "전세가 협의";
            return "전세 " + formatAmount(offer.getTotalPrice().longValue());
        } else if (offer.getType() == com.realestate.app.domain.property.table.PropertyOffer.OfferType.WOLSE) {
            if (offer.getDeposit() == null || offer.getMonthlyRent() == null) return "월세 협의";
            long deposit = offer.getDeposit().longValue();
            long monthly = offer.getMonthlyRent().longValue();
            return "월세 " + formatAmount(deposit) + " / " + formatAmount(monthly);
        }

        return "가격 정보 없음";
    }

    private static String formatAmount(long amount) {
        if (amount == 0) return "0";
        long eok = amount / 100000000;
        long man = (amount % 100000000) / 10000;

        StringBuilder sb = new StringBuilder();
        if (eok > 0) sb.append(eok).append("억");
        if (man > 0) {
            if (eok > 0) sb.append(" ");
            sb.append(man).append("만");
        }
        return sb.toString();
    }
}
