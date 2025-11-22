package com.realestate.app.domain.estate.repository;

import com.realestate.app.domain.estate.dto.DealResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class DealRepository {

    private final JdbcTemplate jdbcTemplate;

    public List<DealResponse> findDeals(Long propertyId) {
        String sql = """
            select
              address,
              complex_name,
              area_m2,
              price_10k,
              dong,
              floor,
              contract_date_int
            from find_realestate_deals_by_property(?)
            """;

        return jdbcTemplate.query(
                sql,
                (rs, rowNum) -> new DealResponse(
                        rs.getString("address"),
                        rs.getString("complex_name"),
                        getNullableDouble(rs, "area_m2"),
                        getNullableDouble(rs, "price_10k"),
                        rs.getString("dong"),
                        getNullableInt(rs, "floor"),
                        getNullableInt(rs, "contract_date_int")
                ),
                propertyId
        );
    }

    private Double getNullableDouble(ResultSet rs, String column) throws SQLException {
        double v = rs.getDouble(column);   // primitive
        return rs.wasNull() ? null : v;    // null이면 null로
    }

    private Integer getNullableInt(ResultSet rs, String column) throws SQLException {
        int v = rs.getInt(column);
        return rs.wasNull() ? null : v;
    }
}
