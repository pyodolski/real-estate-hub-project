package com.realestate.app.recproperty.service;

import com.realestate.app.recproperty.model.RecProperty;
import com.realestate.app.recproperty.model.RecUser;
import com.realestate.app.recproperty.util.MathUtils;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class RecommendService {
    private final PropertyVectorService pvs;
    private final UserVectorService uvs;

    public RecommendService(PropertyVectorService pvs, UserVectorService uvs) {
        this.pvs = pvs; this.uvs = uvs;
    }

    public List<Map<String,Object>> recommend(RecUser user, List<RecProperty> props, int topN) {
        double[] u = uvs.toLatent(user);
        List<Map<String,Object>> scored = new ArrayList<>();
        for (RecProperty p : props) {
            double s = MathUtils.cosine(pvs.toLatent(p), u);
            Map<String,Object> row = new LinkedHashMap<>();
            row.put("propertyId", p.getId());
            row.put("score", s);
            row.put("area", p.getArea());
            row.put("type", p.getType());
            row.put("tradeType", p.getTradeType());
            row.put("priceMillion", p.getPriceMillion());
            row.put("floor", p.getFloor());
            row.put("distSubwayM", p.getDistSubwayM());
            row.put("distParkM", p.getDistParkM());
            scored.add(row);
        }
        // 유사도 내림차순 정렬
        scored.sort((a,b)-> Double.compare((double)b.get("score"), (double)a.get("score")));

        // (선택) 간단 MMR 다양화 대신 상위 topN 단순 선택
        return scored.stream().limit(topN).collect(Collectors.toList());
    }
}
