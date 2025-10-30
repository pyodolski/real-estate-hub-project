package com.realestate.app.recproperty.model;

//user 선호도 저장
public class RecUser {
    private String id;
    // 문진/선호 (0~1 권장)
    private double prefTraffic;
    private double prefPark;
    private double prefSchool;
    private double prefSunshine;
    private double dislikeNightlife;
    private double prefHighFloor;
    private double prefElevator;
    private int budgetMillion;
    private int targetPriceMillion;

    public RecUser() {}

    public RecUser(String id, double prefTraffic, double prefPark, double prefSchool, double prefSunshine,
                double dislikeNightlife, double prefHighFloor, double prefElevator,
                int budgetMillion, int targetPriceMillion) {
        this.id=id; this.prefTraffic=prefTraffic; this.prefPark=prefPark; this.prefSchool=prefSchool;
        this.prefSunshine=prefSunshine; this.dislikeNightlife=dislikeNightlife;
        this.prefHighFloor=prefHighFloor; this.prefElevator=prefElevator;
        this.budgetMillion=budgetMillion; this.targetPriceMillion=targetPriceMillion;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public double getPrefTraffic() {
        return prefTraffic;
    }

    public void setPrefTraffic(double prefTraffic) {
        this.prefTraffic = prefTraffic;
    }

    public double getPrefPark() {
        return prefPark;
    }

    public void setPrefPark(double prefPark) {
        this.prefPark = prefPark;
    }

    public double getPrefSchool() {
        return prefSchool;
    }

    public void setPrefSchool(double prefSchool) {
        this.prefSchool = prefSchool;
    }

    public double getPrefSunshine() {
        return prefSunshine;
    }

    public void setPrefSunshine(double prefSunshine) {
        this.prefSunshine = prefSunshine;
    }

    public double getDislikeNightlife() {
        return dislikeNightlife;
    }

    public void setDislikeNightlife(double dislikeNightlife) {
        this.dislikeNightlife = dislikeNightlife;
    }

    public double getPrefHighFloor() {
        return prefHighFloor;
    }

    public void setPrefHighFloor(double prefHighFloor) {
        this.prefHighFloor = prefHighFloor;
    }

    public double getPrefElevator() {
        return prefElevator;
    }

    public void setPrefElevator(double prefElevator) {
        this.prefElevator = prefElevator;
    }

    public int getBudgetMillion() {
        return budgetMillion;
    }

    public void setBudgetMillion(int budgetMillion) {
        this.budgetMillion = budgetMillion;
    }

    public int getTargetPriceMillion() {
        return targetPriceMillion;
    }

    public void setTargetPriceMillion(int targetPriceMillion) {
        this.targetPriceMillion = targetPriceMillion;
    }
    // getters/setters
    // ...
}