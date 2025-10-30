package com.realestate.app.recproperty.model;

public class RecProperty {
    private String id;
    private String area;        // 지역
    private String type;        // apartment/villa/studio
    private String tradeType;   // sale/jeonse/rent
    private int floor;
    private int floorsTotal;
    private boolean southFacing;
    private int distSubwayM;
    private int distBusM;
    private int distParkM;
    private double schoolDensity;    // 0~1
    private double nightlifeDensity; // 0~1
    private double trafficVolume;    // 0~1
    private int priceMillion;        // 백만원

    // getters/setters/constructors
    public RecProperty() {}
    // 편의 생성자

    //추천 매물
    public RecProperty(String id, String area, String type, String tradeType, int floor, int floorsTotal,
                    boolean southFacing, int distSubwayM, int distBusM, int distParkM,
                    double schoolDensity, double nightlifeDensity, double trafficVolume, int priceMillion) {
        this.id=id; this.area=area; this.type=type; this.tradeType=tradeType;
        this.floor=floor; this.floorsTotal=floorsTotal; this.southFacing=southFacing;
        this.distSubwayM=distSubwayM; this.distBusM=distBusM; this.distParkM=distParkM;
        this.schoolDensity=schoolDensity; this.nightlifeDensity=nightlifeDensity;
        this.trafficVolume=trafficVolume; this.priceMillion=priceMillion;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getArea() {
        return area;
    }

    public void setArea(String area) {
        this.area = area;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getTradeType() {
        return tradeType;
    }

    public void setTradeType(String tradeType) {
        this.tradeType = tradeType;
    }

    public int getFloor() {
        return floor;
    }

    public void setFloor(int floor) {
        this.floor = floor;
    }

    public int getFloorsTotal() {
        return floorsTotal;
    }

    public void setFloorsTotal(int floorsTotal) {
        this.floorsTotal = floorsTotal;
    }

    public boolean isSouthFacing() {
        return southFacing;
    }

    public void setSouthFacing(boolean southFacing) {
        this.southFacing = southFacing;
    }

    public int getDistSubwayM() {
        return distSubwayM;
    }

    public void setDistSubwayM(int distSubwayM) {
        this.distSubwayM = distSubwayM;
    }

    public int getDistBusM() {
        return distBusM;
    }

    public void setDistBusM(int distBusM) {
        this.distBusM = distBusM;
    }

    public int getDistParkM() {
        return distParkM;
    }

    public void setDistParkM(int distParkM) {
        this.distParkM = distParkM;
    }

    public double getSchoolDensity() {
        return schoolDensity;
    }

    public void setSchoolDensity(double schoolDensity) {
        this.schoolDensity = schoolDensity;
    }

    public double getNightlifeDensity() {
        return nightlifeDensity;
    }

    public void setNightlifeDensity(double nightlifeDensity) {
        this.nightlifeDensity = nightlifeDensity;
    }

    public double getTrafficVolume() {
        return trafficVolume;
    }

    public void setTrafficVolume(double trafficVolume) {
        this.trafficVolume = trafficVolume;
    }

    public int getPriceMillion() {
        return priceMillion;
    }

    public void setPriceMillion(int priceMillion) {
        this.priceMillion = priceMillion;
    }
    // getters & setters 생략 가능(IDE로 생성)
    // ... (필요한 필드만 써도 OK)
}