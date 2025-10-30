package com.realestate.app.recproperty.data;

import com.realestate.app.recproperty.model.RecProperty;
import com.realestate.app.recproperty.model.RecUser;

import java.util.*;

public class SampleData {
    public static List<RecProperty> properties() {
        //
        Random r = new Random(7);
        String[] areas = {"Gangnam","Songpa","Mapo","Seongdong","Nowon","Yongsan","Gwanak"};
        String[] types = {"apartment","villa","studio"};
        String[] trades= {"sale","jeonse","rent"};

        List<RecProperty> list = new ArrayList<>();
        for (int i=0;i<400;i++){
            String id = String.format("P%04d", i);
            String area = areas[r.nextInt(areas.length)];
            String type = types[r.nextInt(types.length)];
            String trade = trades[r.nextInt(trades.length)];
            int floor = 1 + r.nextInt(25);
            int total = new int[]{5,10,15,25}[r.nextInt(4)];
            boolean south = r.nextDouble()<0.6;
            int distSub = 80 + r.nextInt(1121);
            int distBus = 50 + r.nextInt(751);
            int distPark= 60 + r.nextInt(1441);
            double school = Math.round((0.2 + r.nextDouble()*0.7)*100)/100.0;
            double night  = Math.round((0.05 + r.nextDouble()*0.65)*100)/100.0;
            double traffic= Math.round((0.2 + r.nextDouble()*0.7)*100)/100.0;
            int price = new int[]{300,450,600,800,1200,1600}[r.nextInt(6)];

            list.add(new RecProperty(id, area, type, trade, floor, total, south,
                    distSub, distBus, distPark, school, night, traffic, price));
        }
        return list;
    }
    // 유저 선호도 받기
    public static Map<String, RecUser> users() {
        Map<String,RecUser> m = new LinkedHashMap<>();
        m.put("U001", new RecUser("U001", 0.9,0.6,0.7,0.8,0.8,0.6,0.7, 800,800));
        m.put("U002", new RecUser("U002", 0.6,0.9,0.4,0.5,0.4,0.3,0.3, 450,450));
        m.put("U003", new RecUser("U003", 0.7,0.4,0.9,0.6,0.7,0.8,0.9,1200,1200));
        return m;
    }
}
