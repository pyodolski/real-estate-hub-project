// src/main/resources/static/js/map/initMap.js
import { debounce } from '../utils/debounce.js';
import { renderMarkers, highlightMarker } from './markers.js';
import { fetchPropertiesInBounds, fetchPropertyDetail } from '../api/propertiesApi.js';
import { clearDetail } from '../ui/sidebar.js';
//import { clearDetail, renderDetail } from '../ui/sidebar.js'; // (원래 코드)
import { renderMarkerPopup } from './marker-popup.js';

export function initMap(app) {
  const center = new naver.maps.LatLng(37.5665, 126.9780);
  app.map = new naver.maps.Map('map', { center, zoom: 13, zoomControl: false });

  // (선택) 상단 상태 필터가 따로 있다면 사용
  const statusFilterEl = document.getElementById('statusFilter');

  // 현재 활성 필터 합성: filter.js가 세팅한 window.currentFilters + status 필터
  function getActiveFilters() {
    const base = (window.currentFilters && typeof window.currentFilters === 'object')
      ? { ...window.currentFilters }
      : {};

    const v = statusFilterEl?.value || '';
    if (v) base.status = v; // 백엔드가 status를 받도록 구현되어 있다면
    return base;
  }

  // 지도 영역 + 필터로 목록 재요청하고 마커만 갱신
  const onIdle = debounce(async () => {
    const b = app.map.getBounds();
    if (!b) return;

    const sw = b.getSW();
    const ne = b.getNE();

    const filters = getActiveFilters();

    try {
      const list = await fetchPropertiesInBounds({
        swLat: sw.y,
        swLng: sw.x,
        neLat: ne.y,
        neLng: ne.x,
        filters,         // ← 필터 전체 전달 (propertiesApi.js에서 적절히 직렬화)
      });

      // 마커만 갱신
      renderMarkers(app, Array.isArray(list) ? list : [], onMarkerClick);
      clearDetail();
    } catch (e) {
      console.error('목록 조회 실패:', e);
      if (String(e?.message).includes('Unauthorized')) {
        alert('로그인이 필요합니다. 다시 로그인해주세요.');
        location.href = '/loginX.html';
      }
    }
  }, 200);

  // 지도 이동/줌 후 재조회
  naver.maps.Event.addListener(app.map, 'idle', onIdle);

  // 상태 필터 변경 시 재조회 (선택)
  if (statusFilterEl) {
    statusFilterEl.addEventListener('change', () => {
      app.currentId = null;
      clearDetail();
      onIdle();
    });
  }

  // 🔑 filter.js에서 보내는 커스텀 이벤트 수신 → 마커만 리프레시
  window.addEventListener('filters:changed', () => {
    app.currentId = null;
    clearDetail();
    onIdle();
  });

  // 초기 1회 조회
  onIdle();

  // 마커 클릭 시 상세
  async function onMarkerClick(id) {
    app.currentId = id;
    const d = await fetchPropertyDetail(id);
    renderDetail(d);
    highlightMarker(app, id);
  }
}
