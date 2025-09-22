package com.realestate.app.domain.property.repository;

import com.realestate.app.domain.property.dto.PropertyFavoriteDto;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class PropertyFavoriteRepository {

    private final EntityManager em;

    public List<PropertyFavoriteDto> findByUserId(Long userId, int limit, int offset) {
        // ⚠️ 실제 테이블명이 plural이면 아래 favorite/property를 favorites/properties로 바꾸세요.
        String sql = """
            select
              f.id         as favorite_id,
              p.id         as property_id,
              p.title      as title,
              p.address    as address,
              p.price      as price,
              (
                select pi.image_url
                from property_images pi
                where pi.property_id = p.id
                order by pi.id           -- 가장 먼저 들어간 이미지 1장 (최신이 필요하면 desc)
                limit 1
              )              as thumbnail_url,
              f.created_at  as created_at
            from favorites f
            join properties p on p.id = f.property_id
            where f.user_id = :uid
            order by f.created_at desc
            limit :limit offset :offset
            """;

        Query q = em.createNativeQuery(sql);
        q.setParameter("uid", userId);
        q.setParameter("limit", limit);
        q.setParameter("offset", offset);

        @SuppressWarnings("unchecked")
        List<Object[]> rows = q.getResultList();

        List<PropertyFavoriteDto> result = new ArrayList<>(rows.size());
        for (Object[] r : rows) {
            result.add(new PropertyFavoriteDto(
                    toLong(r[0]),             // favoriteId
                    toLong(r[1]),             // propertyId
                    (String) r[2],            // title
                    (String) r[3],            // address
                    (BigDecimal) r[4],             // price (numeric이면 Long 변환; 필요시 BigDecimal 그대로 쓰세요)
                    (String) r[5],            // thumbnailUrl
                    toLocalDateTime(r[6])     // createdAt
            ));
        }
        return result;
    }

    private static Long toLong(Object o) {
        if (o == null) return null;
        if (o instanceof Number n) return n.longValue(); // BigDecimal 포함
        if (o instanceof String s) return Long.parseLong(s);
        throw new IllegalArgumentException("Cannot cast to Long: " + o);
    }

    private static LocalDateTime toLocalDateTime(Object o) {
        if (o == null) return null;
        if (o instanceof Timestamp ts) return ts.toLocalDateTime();
        if (o instanceof LocalDateTime t) return t;
        if (o instanceof java.util.Date d) {
            return d.toInstant().atZone(java.time.ZoneId.systemDefault()).toLocalDateTime();
        }
        throw new IllegalArgumentException("Cannot cast to LocalDateTime: " + o);
    }
}