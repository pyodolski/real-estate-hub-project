package com.realestate.app.recproperty.controller;

import com.realestate.app.recproperty.data.SampleData;
import com.realestate.app.recproperty.model.RecProperty;
import com.realestate.app.recproperty.model.RecUser;
import com.realestate.app.recproperty.service.RecommendService;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/")
public class RecommendController {
    private final RecommendService recommendService;

    // 인메모리 저장소 (과제용: 실패 포인트 최소화)
    private final List<RecProperty> PROPS = SampleData.properties();
    private final Map<String, RecUser> USERS = SampleData.users();

    public RecommendController(RecommendService recommendService) {
        this.recommendService = recommendService;
    }

    @GetMapping("health")
    public Map<String,Object> health() {
        return Map.of("status","ok","properties",PROPS.size(),"users",USERS.size());
    }

    @GetMapping("latent-keys")
    public List<String> latentKeys() {
        return List.of(
                "traffic_access","green_park","school_quality",
                "nightlife","quietness","sunshine",
                "elevator_needed","high_floor_view","budget_fit"
        );
    }

    @GetMapping("users")
    public List<Map<String,String>> users() {
        List<Map<String,String>> out=new ArrayList<>();
        for (String id: USERS.keySet()) out.add(Map.of("id", id));
        return out;
    }

    @GetMapping("recommend")
    public Map<String,Object> recommend(@RequestParam String userId,
                                        @RequestParam(defaultValue="15") int topN) {
        RecUser u = USERS.get(userId);
        if (u==null) throw new RuntimeException("user not found");
        var results = recommendService.recommend(u, PROPS, topN);
        return Map.of("user", userId, "results", results);
    }
}
