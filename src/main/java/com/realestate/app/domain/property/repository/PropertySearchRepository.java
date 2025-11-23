package com.realestate.app.domain.property.repository;

import com.realestate.app.domain.property.dto.request.SearchRequest;
import com.realestate.app.domain.property.dto.PropertyFilterDto;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.*;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.*;

@Repository
@RequiredArgsConstructor
public class PropertySearchRepository {

    private final NamedParameterJdbcTemplate jdbc;

    public List<PropertyFilterDto> search(SearchRequest req) {
        StringBuilder sql = new StringBuilder();
        sql.append("""
            SELECT
              po.id,
              po.property_id AS propertyId,
              po.housetype   AS houseType,
              po.type        AS offerType,
              CAST(po.floor AS integer)                 AS floor,
              CAST(po.oftion AS varchar)                AS oftion,   -- ★ 결과는 문자열로 받기

              po.total_price   AS totalPrice,
              po.deposit       AS deposit,
              po.monthly_rent  AS monthlyRent,

              p.title,
              p.address,
              CAST(p.area_m2 AS integer)                AS area,
              -- 좌표계가 X=lng, Y=lat 라면 아래처럼 매핑하세요
              CAST(p.location_y AS double precision)    AS lat,
              CAST(p.location_x AS double precision)    AS lng
            FROM property_offers po
            JOIN properties p ON p.id = po.property_id
            WHERE po.is_active = true
              AND p.status = 'AVAILABLE'
        """);

        MapSqlParameterSource p = new MapSqlParameterSource();

        // 다중 선택
        if (req.houseTypes()!=null && !req.houseTypes().isEmpty()) {
            sql.append(" AND po.housetype IN (:houseTypes) ");
            p.addValue("houseTypes", req.houseTypes());
        }
        if (req.offerTypes()!=null && !req.offerTypes().isEmpty()) {
            sql.append(" AND po.type IN (:offerTypes) ");
            p.addValue("offerTypes", req.offerTypes());
        }

        // 면적/층
        if (req.areaMin()!=null)  { sql.append(" AND p.area_m2 >= :areaMin ");   p.addValue("areaMin", req.areaMin()); }
        if (req.areaMax()!=null)  { sql.append(" AND p.area_m2 <= :areaMax ");   p.addValue("areaMax", req.areaMax()); }
        if (req.floorMin()!=null) { sql.append(" AND po.floor   >= :floorMin "); p.addValue("floorMin", req.floorMin()); }
        if (req.floorMax()!=null) { sql.append(" AND po.floor   <= :floorMax "); p.addValue("floorMax", req.floorMax()); }

        // 준공년도
        if (req.buildYearMin()!=null) { sql.append(" AND p.building_year >= :byMin "); p.addValue("byMin", req.buildYearMin()); }
        if (req.buildYearMax()!=null) { sql.append(" AND p.building_year <= :byMax "); p.addValue("byMax", req.buildYearMax()); }

        // 옵션 비트마스크 (WHERE에서는 bit로 비교)
        // 옵션 비트마스크 (WHERE에서는 bit로 비교)
        if (req.optionMask()!=null && !req.optionMask().isBlank()) {
            if ("ANY".equalsIgnoreCase(req.optionMatchMode())) {
                sql.append("""
            AND (CAST(po.oftion AS bit(10)) & CAST(:opt AS bit(10))) <> B'0000000000'
        """);
            } else {
                sql.append("""
            AND (CAST(po.oftion AS bit(10)) & CAST(:opt AS bit(10))) = CAST(:opt AS bit(10))
        """);
            }
            // opt 값은 그냥 "1010000000" 이런 문자열이면 됨 (앞뒤에 B'' 붙이면 안 됨)
            p.addValue("opt", req.optionMask());
        }

        // 가격
        List<String> priceGroups = new ArrayList<>();
        if (req.offerTypes()!=null && req.offerTypes().contains("SALE")) {
            priceGroups.add("""
                (po.type='SALE'
                  AND (:buyMin IS NULL OR po.total_price >= :buyMin)
                  AND (:buyMax IS NULL OR po.total_price <= :buyMax))
            """);
            p.addValue("buyMin", req.buyMin());
            p.addValue("buyMax", req.buyMax());
        }
        if (req.offerTypes()!=null && req.offerTypes().contains("JEONSE")) {
            priceGroups.add("""
                (po.type='JEONSE'
                  AND (:jeonseMin IS NULL OR po.deposit >= :jeonseMin)
                  AND (:jeonseMax IS NULL OR po.deposit <= :jeonseMax))
            """);
            p.addValue("jeonseMin", req.jeonseMin());
            p.addValue("jeonseMax", req.jeonseMax());
        }
        if (req.offerTypes()!=null && req.offerTypes().contains("WOLSE")) {
            priceGroups.add("""
                (po.type='WOLSE'
                  AND (:mdMin IS NULL OR po.deposit      >= :mdMin)
                  AND (:mdMax IS NULL OR po.deposit      <= :mdMax)
                  AND (:mrMin IS NULL OR po.monthly_rent >= :mrMin)
                  AND (:mrMax IS NULL OR po.monthly_rent <= :mrMax))
            """);
            p.addValue("mdMin", req.monthlyDepositMin());
            p.addValue("mdMax", req.monthlyDepositMax());
            p.addValue("mrMin", req.monthlyRentMin());
            p.addValue("mrMax", req.monthlyRentMax());
        }
        if (!priceGroups.isEmpty()) {
            sql.append(" AND (").append(String.join(" OR ", priceGroups)).append(") ");
        }

        // 정렬/페이징
        int page = Optional.ofNullable(req.page()).orElse(0);
        int size = Optional.ofNullable(req.size()).orElse(20);
        sql.append(" ORDER BY p.created_at DESC ");
        sql.append(" OFFSET :off LIMIT :lim ");
        p.addValue("off", page * size);
        p.addValue("lim", size);

        // ★ BeanPropertyRowMapper 제거, 커스텀 RowMapper 사용
        return jdbc.query(sql.toString(), p, ROW_MAPPER);
    }

    // ★ SELECT의 alias(카멜케이스)로 읽어오는 수동 매퍼
    private static final RowMapper<PropertyFilterDto> ROW_MAPPER = (rs, rowNum) ->
            PropertyFilterDto.builder()
                    .id(rs.getLong("id"))
                    .propertyId(rs.getLong("propertyId"))
                    .houseType(rs.getString("houseType"))
                    .offerType(rs.getString("offerType"))
                    .floor(rs.getObject("floor") == null ? null : rs.getInt("floor"))
                    .oftion(rs.getString("oftion"))
                    // numeric(14,2) → Double로 안전하게 변환
                    .totalPrice(rs.getObject("totalPrice") == null ? null : rs.getDouble("totalPrice"))
                    .deposit(rs.getObject("deposit") == null ? null : rs.getDouble("deposit"))
                    .monthlyRent(rs.getObject("monthlyRent") == null ? null : rs.getDouble("monthlyRent"))
                    .title(rs.getString("title"))
                    .address(rs.getString("address"))
                    .area(rs.getObject("area") == null ? null : rs.getInt("area"))
                    .lat(rs.getObject("lat") == null ? null : rs.getDouble("lat"))
                    .lng(rs.getObject("lng") == null ? null : rs.getDouble("lng"))
                    // 추천용 필드는 초기값 세팅
                    .score(null)
                    .recommended(false)
                    .recommendReason(null)
                    .build();


    public PropertyFilterDto findOneForRecommend(Long propertyId) {
        String sql = """
        SELECT
          po.id,
          po.property_id AS propertyId,
          po.housetype   AS houseType,
          po.type        AS offerType,
          CAST(po.floor AS integer)                 AS floor,
          CAST(po.oftion AS varchar)                AS oftion,
          po.total_price   AS totalPrice,
          po.deposit       AS deposit,
          po.monthly_rent  AS monthlyRent,
          p.title,
          p.address,
          CAST(p.area_m2 AS integer)                AS area,
          CAST(p.location_y AS double precision)    AS lat,
          CAST(p.location_x AS double precision)    AS lng
        FROM property_offers po
        JOIN properties p ON p.id = po.property_id
        WHERE po.is_active = true
          AND p.status = 'AVAILABLE'
          AND po.property_id = :propertyId
        ORDER BY po.created_at DESC
        LIMIT 1
        """;

        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("propertyId", propertyId);

        List<PropertyFilterDto> list = jdbc.query(sql, params, ROW_MAPPER);
        return list.isEmpty() ? null : list.get(0);
    }


}
