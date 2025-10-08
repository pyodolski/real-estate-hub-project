/**
 * 판매 매물 지도 연동 모듈
 * property-management-2.js에 추가될 메서드들
 */

(function () {
  if (typeof window.PropertyManagement === "undefined") {
    console.error("[SalesMapIntegration] PropertyManagement class not found");
    return;
  }

  // 판매 매물을 지도에 마커로 표시
  PropertyManagement.prototype.showSalesPropertiesOnMap = function () {
    console.log("[PropertyManagement] Showing sales properties on map");

    try {
      // 지도 객체 확인
      if (!window.appState || !window.appState.map) {
        console.warn("[PropertyManagement] Map not available");
        return;
      }

      const map = window.appState.map;

      // 기존 판매 매물 마커 제거
      this.clearSalesMarkersFromMap();

      // 필터링된 판매 매물 가져오기
      const salesProperties = this.filteredSalesProperties || [];
      console.log(`[PropertyManagement] Displaying ${salesProperties.length} sales properties on map`);

      if (salesProperties.length === 0) {
        console.log("[PropertyManagement] No sales properties to display");
        return;
      }

      // 각 판매 매물에 대해 마커 생성
      salesProperties.forEach((property) => {
        // 좌표 확인
        const lat = property.locationY || property.location_y;
        const lng = property.locationX || property.location_x;

        if (!lat || !lng) {
          console.warn("[PropertyManagement] Property without coordinates:", property);
          return;
        }

        // 마커 생성
        const marker = new naver.maps.Marker({
          position: new naver.maps.LatLng(lat, lng),
          map: map,
          title: property.propertyTitle || property.title || '',
          icon: {
            content: this.createSalesMarkerIcon(property),
            anchor: new naver.maps.Point(15, 40),
          }
        });

        // 마커 클릭 이벤트
        naver.maps.Event.addListener(marker, 'click', () => {
          this.showSalesPropertyPopup(property, marker);
        });

        // 마커 저장
        if (!window.appState.salesMarkers) {
          window.appState.salesMarkers = new Map();
        }
        window.appState.salesMarkers.set(property.id || property.delegationId, marker);
      });

      // 마커만 표시하고 지도는 이동하지 않음 (매물 클릭 시 이동)
      console.log("[PropertyManagement] Sales markers displayed successfully");
    } catch (error) {
      console.error("[PropertyManagement] Error showing sales properties on map:", error);
    }
  };

  // 판매 매물 마커 제거
  PropertyManagement.prototype.clearSalesMarkersFromMap = function () {
    console.log("[PropertyManagement] Clearing sales markers from map");

    if (window.appState && window.appState.salesMarkers) {
      window.appState.salesMarkers.forEach((marker) => {
        marker.setMap(null);
      });
      window.appState.salesMarkers.clear();
    }
  };

  // 판매 매물 마커 아이콘 생성
  PropertyManagement.prototype.createSalesMarkerIcon = function (property) {
    const offer = property.offer || {};
    const isActive = offer.isActive !== false;
    const status = property.status || 'PENDING';
    
    // 상태별 색상
    let color = '#3B82F6'; // 기본 파란색
    if (status === 'REJECTED') {
      color = '#EF4444'; // 빨간색
    } else if (status === 'APPROVED' && isActive) {
      color = '#10B981'; // 초록색
    } else if (!isActive) {
      color = '#6B7280'; // 회색
    }

    return `
      <div style="
        background-color: ${color};
        color: white;
        padding: 8px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: bold;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        white-space: nowrap;
        cursor: pointer;
        transition: transform 0.2s;
      " onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
        ${this.formatPriceForMarker(offer)}
      </div>
    `;
  };

  // 마커용 가격 포맷 (DB에 만원 단위로 저장되어 있음)
  PropertyManagement.prototype.formatPriceForMarker = function (offer) {
    if (!offer || !offer.type) return '정보없음';

    if (offer.type === 'SALE' && offer.totalPrice) {
      const price = Number(offer.totalPrice);
      if (price >= 10000) {
        return `매매 ${(price / 10000).toFixed(1)}억`;
      }
      return `매매 ${price.toLocaleString()}만원`;
    } else if (offer.type === 'JEONSE' && offer.deposit) {
      const deposit = Number(offer.deposit);
      if (deposit >= 10000) {
        return `전세 ${(deposit / 10000).toFixed(1)}억`;
      }
      return `전세 ${deposit.toLocaleString()}만원`;
    } else if (offer.type === 'WOLSE' && offer.deposit && offer.monthlyRent) {
      const deposit = Number(offer.deposit);
      const rent = Number(offer.monthlyRent);
      return `${deposit.toLocaleString()}/${rent}`;
    }
    return '정보없음';
  };

  // 지도 범위를 판매 매물에 맞게 조정
  PropertyManagement.prototype.fitMapToSalesProperties = function (properties) {
    if (!window.appState || !window.appState.map) return;
    if (!properties || properties.length === 0) return;

    const bounds = new naver.maps.LatLngBounds();

    properties.forEach((property) => {
      const lat = property.locationY || property.location_y;
      const lng = property.locationX || property.location_x;

      if (lat && lng) {
        bounds.extend(new naver.maps.LatLng(lat, lng));
      }
    });

    window.appState.map.fitBounds(bounds, { padding: 50 });
  };

  // 판매 매물 팝업 표시
  PropertyManagement.prototype.showSalesPropertyPopup = function (property, marker) {
    console.log("[PropertyManagement] Showing sales property popup:", property);

    const offer = property.offer || {};
    
    const content = `
      <div style="padding: 15px; min-width: 250px;">
        <div style="margin-bottom: 10px;">
          <h3 style="font-weight: bold; font-size: 16px; color: #1F2937; margin-bottom: 5px;">
            ${property.propertyTitle || property.title || '매물'}
          </h3>
          <p style="font-size: 12px; color: #6B7280;">
            ${property.propertyAddress || property.address || '주소 정보 없음'}
          </p>
        </div>
        
        ${offer && Object.keys(offer).length > 0 ? `
          <div style="margin-bottom: 10px; padding: 10px; background-color: #F3F4F6; border-radius: 8px;">
            <div style="font-size: 14px; color: #374151; margin-bottom: 5px;">
              <strong>${this.getTransactionTypeLabel(offer.type)}</strong> | ${this.getHouseTypeLabel(offer.housetype)} | ${offer.floor}층
            </div>
            <div style="font-size: 16px; font-weight: bold; color: #2563EB;">
              ${this.formatDetailedPrice(offer)}
            </div>
            ${offer.maintenanceFee ? `<div style="font-size: 12px; color: #6B7280;">관리비: ${offer.maintenanceFee}만원</div>` : ''}
            ${offer.availableFrom ? `<div style="font-size: 12px; color: #6B7280;">입주: ${offer.availableFrom}</div>` : ''}
            ${offer.negotiable ? '<div style="font-size: 12px; color: #10B981;">💬 협상 가능</div>' : ''}
          </div>
        ` : ''}
        
        <button onclick="propertyManagement.viewSalesPropertyDetail(${property.id || property.delegationId})" 
                style="width: 100%; padding: 8px; background-color: #3B82F6; color: white; border: none; border-radius: 6px; font-weight: 500; cursor: pointer;">
          상세보기
        </button>
      </div>
    `;

    const infoWindow = new naver.maps.InfoWindow({
      content: content,
      borderWidth: 0,
      backgroundColor: 'white',
      borderColor: '#E5E7EB',
      anchorSize: new naver.maps.Size(10, 10),
      pixelOffset: new naver.maps.Point(0, -10)
    });

    // 기존 InfoWindow 닫기
    if (this.currentSalesInfoWindow) {
      this.currentSalesInfoWindow.close();
    }

    infoWindow.open(window.appState.map, marker);
    this.currentSalesInfoWindow = infoWindow;
  };

  // 거래 유형 라벨
  PropertyManagement.prototype.getTransactionTypeLabel = function (type) {
    switch (type) {
      case "SALE": return "매매";
      case "JEONSE": return "전세";
      case "WOLSE": return "월세";
      default: return "정보 없음";
    }
  };

  // 주거 형태 라벨
  PropertyManagement.prototype.getHouseTypeLabel = function (type) {
    switch (type) {
      case "APART": return "아파트";
      case "BILLA": return "빌라";
      case "ONE": return "원룸";
      default: return "정보 없음";
    }
  };

  // 상세 가격 포맷
  PropertyManagement.prototype.formatDetailedPrice = function (offer) {
    if (!offer) return "정보 없음";

    if (offer.type === "SALE" && offer.totalPrice) {
      return `${offer.totalPrice.toLocaleString()}만원`;
    } else if (offer.type === "JEONSE" && offer.deposit) {
      return `전세 ${offer.deposit.toLocaleString()}만원`;
    } else if (offer.type === "WOLSE" && offer.deposit && offer.monthlyRent) {
      return `보증금 ${offer.deposit.toLocaleString()}만원 / 월세 ${offer.monthlyRent.toLocaleString()}만원`;
    }
    return "정보 없음";
  };

  console.log("[SalesMapIntegration] Sales map integration methods loaded");
})();

