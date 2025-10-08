/**
 * 판매 매물 지도 네비게이션 모듈
 * 카드 클릭 시 지도 이동 기능
 */

(function () {
  if (typeof window.PropertyManagement === "undefined") {
    console.error("[SalesMapNavigation] PropertyManagement class not found");
    return;
  }

  // 판매 매물 카드 클릭 시 지도 이동
  PropertyManagement.prototype.moveMapToSalesProperty = function (property) {
    console.log("[PropertyManagement] Moving map to sales property:", property);

    try {
      // 좌표 확인
      const lat = property.locationY || property.location_y;
      const lng = property.locationX || property.location_x;

      if (!lat || !lng) {
        console.warn("[PropertyManagement] Property without coordinates:", property);
        this.showError("매물의 위치 정보가 없습니다.");
        return;
      }

      // 지도 객체 확인
      if (!window.appState || !window.appState.map) {
        console.warn("[PropertyManagement] Map not available");
        return;
      }

      const map = window.appState.map;

      // 기존 팝업 먼저 닫기
      if (this.currentSalesInfoWindow) {
        this.currentSalesInfoWindow.close();
        this.currentSalesInfoWindow = null;
      }

      // 지도 이동 완료 후 팝업 표시 (이벤트 리스너 사용)
      const targetPosition = new naver.maps.LatLng(lat, lng);
      
      // 줌 레벨이 너무 낮으면 먼저 조정
      if (map.getZoom() < 15) {
        map.setZoom(15);
      }

      // 지도 이동
      map.panTo(targetPosition);

      // 지도 이동 완료 후 팝업 표시 (충분한 시간 대기)
      setTimeout(() => {
        const markerId = property.id || property.delegationId;
        const marker = window.appState.salesMarkers?.get(markerId);
        
        if (marker) {
          // 팝업 표시 전에 한번 더 확인
          setTimeout(() => {
            this.showSalesPropertyPopup(property, marker);
          }, 100);
        }
      }, 800);

      console.log(`[PropertyManagement] Map moved to: ${lat}, ${lng}`);
    } catch (error) {
      console.error("[PropertyManagement] Error moving map:", error);
    }
  };

  console.log("[SalesMapNavigation] Sales map navigation methods loaded");
})();

