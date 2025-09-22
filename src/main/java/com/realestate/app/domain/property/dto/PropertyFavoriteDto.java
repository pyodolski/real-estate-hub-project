package com.realestate.app.domain.property.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class PropertyFavoriteDto {
    private Long favoriteId;
    private Long propertyId;
    private String title;
    private String address;
    private BigDecimal price;           // price가 numeric(DECIMAL)이라면 BigDecimal로 바꿔도 됨
    private String thumbnailUrl;  // 첫 번째 이미지 (없으면 null)
    private LocalDateTime createdAt;
}
