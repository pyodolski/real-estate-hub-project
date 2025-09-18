// src/main/resources/static/js/map/initMap.js
import { debounce } from '../utils/debounce.js';
import { renderMarkers, highlightMarker } from './markers.js';
import { fetchPropertiesInBounds, fetchPropertyDetail } from '../api/propertiesApi.js';
import { clearDetail } from '../ui/sidebar.js';

export async function initMap(app) {
  const center = new naver.maps.LatLng(37.5665, 126.9780);
  app.map = new naver.maps.Map('map', { center, zoom: 13, zoomControl: false });

  const statusFilterEl = document.getElementById('statusFilter');

  const onIdle = debounce(async () => {
    const b = app.map.getBounds();
    if (!b) return;
    const sw = b.getSW(), ne = b.getNE();

    const v = statusFilterEl?.value || '';
    const filters = v ? { status: v } : {};

    const list = await fetchPropertiesInBounds({
      swLat: sw.y, swLng: sw.x, neLat: ne.y, neLng: ne.x, filters
    });

    renderMarkers(app, list, onMarkerClick);
    clearDetail();
  }, 200);

  // 지도 이동/줌 후 재조회
  naver.maps.Event.addListener(app.map, 'idle', onIdle);

  // ✅ 필터 변경 시에만 선택 해제 + 재조회
  if (statusFilterEl) {
    statusFilterEl.addEventListener('change', () => {
      app.currentId = null;
      clearDetail();
      onIdle();
    });
  }

  // 초기 1회 조회
  onIdle();

  async function onMarkerClick(id) {
    app.currentId = id;
    const d = await fetchPropertyDetail(id);
    renderDetail(d);
    // markers.js가 각 마커의 상태를 기억하도록 되어 있다면, 상태 전달 불필요
    highlightMarker(app, id);
  }
}
