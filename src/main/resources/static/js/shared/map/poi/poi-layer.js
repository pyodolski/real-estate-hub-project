// src/main/resources/static/js/shared/map/poi/poi-layer.js
import {
  searchConvenienceStores,
  searchSubwayStations,
  searchBusStations,
} from "./poi-naver-local.js";
// import { tm128ToLatLng } from '../utils/coord.js'; // 뭐 하는 건지 모름

export function initPoiLayers(app) {
  const convToggle = document.getElementById("toggleConvenience");
  if (convToggle) {
    convToggle.addEventListener("change", (e) => {
      app.poiState.visibleLayers.convenience = e.target.checked;
      updatePoiVisibility(app);
    });
  }
  // subway / bus 도 나중에 추가
}

export async function refreshPoiOnBoundsChange(app, { sw, ne }) {
  console.log("🌀 POI refresh 호출");
  const map = app.map;
  if (!map) return;

  const center = map.getCenter();
  const cx = center.lat();
  const cy = center.lng();

  try {
    if (app.poiState.visibleLayers.convenience) {
      const convList = await searchConvenienceStores({ lat: cx, lng: cy });
      syncPoiMarkers(app, "convenience", convList);
    }

    if (app.poiState.visibleLayers.subway) {
      const subwayList = await searchSubwayStations({ lat: cx, lng: cy });
      syncPoiMarkers(app, "subway", subwayList);
    }
    if (app.poiState.visibleLayers.subway) {
      const busList = await searchBusStations({ lat: cx, lng: cy });
      syncPoiMarkers(app, "bus", busList);
    }
  } catch (e) {
    console.error("POI 조회 실패:", e);
  }
}

function syncPoiMarkers(app, type, poiList) {
  const map = app.map;
  const store = app.poiState[type];

  console.log("📌 POI 리스트:", type, poiList);

  // 기존 마커 제거
  for (const m of store.values()) {
    m.setMap(null);
  }
  store.clear();

  if (!poiList || poiList.length === 0) {
    console.log("⚠ POI 없음:", type);
    return;
  }

  poiList.forEach((poi, idx) => {
    //
    const lng = poi.mapx / 1e7;
    const lat = poi.mapy / 1e7;

    const latlng = new naver.maps.LatLng(lat, lng);
    console.log("🧷 POI 마커 생성(수정):", type, poi.name, "→", lat, lng);

    // POI 타입별 커스텀 아이콘 생성
    const iconConfig = getPoiIconConfig(type);

    const marker = new naver.maps.Marker({
      position: latlng,
      map: app.map,
      title: poi.name,
      icon: {
        content: `
          <div style="
            background: ${iconConfig.bgColor};
            color: white;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            font-size: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            border: 2px solid white;
          ">
            ${iconConfig.emoji}
          </div>
        `,
        anchor: new naver.maps.Point(16, 16),
      },
    });

    store.set(poi.id, marker);
  });

  updatePoiVisibility(app);
}

// POI 타입별 아이콘 설정
function getPoiIconConfig(type) {
  // 이걸로 수정 바람
  switch (type) {
    case "convenience":
      return {
        emoji: "🏪",
        bgColor: "#10B981", // 초록색
        label: "편의점",
      };
    case "subway":
      return {
        emoji: "🚇",
        bgColor: "#3B82F6", // 파란색
        label: "지하철",
      };
    case "bus":
      return {
        emoji: "🚌",
        bgColor: "#F59E0B", // 주황색
        label: "버스",
      };
    default:
      return {
        emoji: "📍",
        bgColor: "#6B7280", // 회색
        label: "POI",
      };
  }
}

function updatePoiVisibility(app) {
  const { convenience, subway, bus, visibleLayers } = app.poiState;

  for (const m of convenience.values()) {
    m.setMap(visibleLayers.convenience ? app.map : null);
  }
  for (const m of subway.values()) {
    m.setMap(visibleLayers.subway ? app.map : null);
  }
  for (const m of bus.values()) {
    m.setMap(visibleLayers.bus ? app.map : null);
  }
}
