package com.realestate.app.recproperty.service;

import com.realestate.app.recproperty.model.RecProperty;
import com.realestate.app.recproperty.util.MathUtils;
import org.springframework.stereotype.Service;


//
@Service
public class PropertyVectorService {
    // LATENT_KEYS: traffic_access, green_park, school_quality, nightlife, quietness,
    //              sunshine, elevator_needed, high_floor_view, budget_fit
    public double[] toLatent(RecProperty p) {
        double[] v = new double[9];

        v[0] = MathUtils.clamp(1.2 - p.getDistSubwayM()/1000.0 - p.getDistBusM()/800.0, -1, 1); // traffic_access
        v[1] = MathUtils.clamp(1.0 - p.getDistParkM()/1000.0, -1, 1);                            // green_park
        v[2] = MathUtils.clamp((p.getSchoolDensity()-0.5)*2, -1, 1);                             // school_quality
        v[3] = MathUtils.clamp((p.getNightlifeDensity()-0.3)*2, -1, 1);                          // nightlife
        v[4] = MathUtils.clamp(0.6*v[1] - 0.7*(p.getTrafficVolume()-0.5) - 0.8*v[3], -1, 1);     // quietness
        v[5] = MathUtils.clamp(0.5*(p.isSouthFacing()?1:0) + 0.05*p.getFloor(), -1, 1);          // sunshine
        v[6] = MathUtils.clamp((p.getFloorsTotal()-5)/15.0, -1, 1);                               // elevator_needed
        v[7] = MathUtils.clamp((p.getFloor()-7)/10.0, -1, 1);                                     // high_floor_view
        v[8] = MathUtils.clamp(0.8 - p.getPriceMillion()/1500.0, -1, 1);                          // budget_fit

        return MathUtils.l2norm(v);
    }
}
