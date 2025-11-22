// src/main/resources/static/js/shared/map/poi/poi-layer.js
import { searchConvenienceStores, searchSubwayStations, searchBusStations } from './poi-naver-local.js';
// import { tm128ToLatLng } from '../utils/coord.js'; // 🔥 일단 주석

export function initPoiLayers(app) {
  const convToggle = document.getElementById('toggleConvenience');
  if (convToggle) {
    convToggle.addEventListener('change', (e) => {
      app.poiState.visibleLayers.convenience = e.target.checked;
      updatePoiVisibility(app);
    });
  }
  // subway / bus 도 나중에 추가
}

export async function refreshPoiOnBoundsChange(app, { sw, ne }) {
  console.log('🌀 POI refresh 호출');
  const map = app.map;
  if (!map) return;

  const center = map.getCenter();
  const cx = center.lat();
  const cy = center.lng();

  try {
    if (app.poiState.visibleLayers.convenience) {
      const convList = await searchConvenienceStores({ lat: cx, lng: cy });
      syncPoiMarkers(app, 'convenience', convList);
    }

    if (app.poiState.visibleLayers.subway) {
      const subwayList = await searchSubwayStations({ lat: cx, lng: cy });
      syncPoiMarkers(app, 'subway', subwayList);
    }
    if (app.poiState.visibleLayers.subway) {
          const busList = await searchBusStations({ lat: cx, lng: cy });
          syncPoiMarkers(app, 'bus', busList);
        }
  } catch (e) {
    console.error('POI 조회 실패:', e);
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
    console.log('⚠ POI 없음:', type);
    return;
  }

  poiList.forEach((poi, idx) => {
    // ✅ mapx / mapy 는 위경도 * 1e7 로 들어옴
    const lng = poi.mapx / 1e7;
    const lat = poi.mapy / 1e7;

    const latlng = new naver.maps.LatLng(lat, lng);
    console.log('🧷 POI 마커 생성(수정):', type, poi.name, '→', lat, lng);

    const marker = new naver.maps.Marker({
      position: latlng,
      map: app.map,
      title: poi.name,
    });


    store.set(poi.id, marker);
  });

  updatePoiVisibility(app);
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
