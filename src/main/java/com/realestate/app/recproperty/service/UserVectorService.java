package com.realestate.app.recproperty.service;

import com.realestate.app.recproperty.model.RecUser;
import com.realestate.app.recproperty.util.MathUtils;
import org.springframework.stereotype.Service;

@Service
public class UserVectorService {
    public double[] toLatent(RecUser u) {
        double[] v = new double[9];
        v[0] += u.getPrefTraffic() * 0.8;       // traffic_access
        v[1] += u.getPrefPark() * 0.8;          // green_park
        v[2] += u.getPrefSchool() * 0.7;        // school_quality
        v[5] += u.getPrefSunshine() * 0.6;      // sunshine
        v[3] -= u.getDislikeNightlife() * 0.8;  // nightlife(기피)

        v[7] += u.getPrefHighFloor() * 0.6;     // high_floor_view
        v[6] += u.getPrefElevator() * 0.5;      // elevator_needed

        double diff = (u.getTargetPriceMillion() - u.getBudgetMillion()) / Math.max(1.0, u.getBudgetMillion());
        v[8] += MathUtils.clamp(-diff, -1, 1) * 0.7;  // budget_fit

        // 대립속성 간단 감쇠 예: quietness vs nightlife
        if (v[4] > 0 && v[3] > 0) { v[4] *= 0.7; v[3] *= 0.5; }

        return MathUtils.l2norm(v);
    }
}
