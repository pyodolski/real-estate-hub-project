// src/main/resources/static/js/shared/map/initmap.js
import { debounce } from '../utils/debounce.js';
import { renderMarkers, highlightMarker } from './markers.js';
import { fetchPropertiesInBounds } from '../components/propertiesApi.js'; // ✅ fetchPropertyDetail 삭제
import { renderMarkerPopup, closeMarkerPopup } from './marker-popup.js';

export function initMap(app) {
  const center = new naver.maps.LatLng(37.5665, 126.9780);
  app.map = new naver.maps.Map('map', { center, zoom: 13, zoomControl: false });
  window.__naverMap = app.map;
  const el = document.getElementById('map');
  if (el) el.__MAP_CREATED__ = true;

  // ✅ 캐시용 Map 보장 (id -> 매물 전체 데이터)
  if (!app.propertiesById) {
    app.propertiesById = new Map();
  }

  // 지도 렌더 후(첫 idle) map:ready 발행
  naver.maps.Event.once(app.map, 'idle', () => {
    window.dispatchEvent(new Event('map:ready'));
  });

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

  // 지도 영역 + 필터로 목록 재요청하고 마커/캐시 갱신
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
        filters, // ← 필터 전체 전달 (propertiesApi.js에서 적절히 직렬화)
      });

      const arr = Array.isArray(list) ? list : [];

      // ✅ 1) id -> 전체 데이터 캐싱
      app.propertiesById.clear();
      for (const p of arr) {
        // 여기서 p는 PropertyFullResponse 한 건
        app.propertiesById.set(p.id, p);
      }

      // ✅ 2) 마커만 갱신
      renderMarkers(app, arr, onMarkerClick);

      // ✅ 3) 목록 갱신을 위한 이벤트 발행
      window.dispatchEvent(new CustomEvent('properties:loaded', { detail: arr }));
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
      onIdle();
    });
  }

  // 🔑 filter.js에서 보내는 커스텀 이벤트 수신 → 마커만 리프레시
  window.addEventListener('filters:changed', () => {
    app.currentId = null;
    onIdle();
  });

  // 초기 1회 조회
  onIdle();

  // 마커 클릭 시 작은 팝업 표시 (토글)
  async function onMarkerClick(id) {
    console.log('propertiesById', id);
    // 같은 마커 다시 클릭 → 팝업 닫기
    if (app.currentId === id) {
      closeMarkerPopup();
      app.currentId = null;
      highlightMarker(app, null);
      return;
    }

    app.currentId = id;

    // ✅ 서버 재호출 대신, 방금 캐싱해둔 데이터에서 꺼내쓰기
    const d = app.propertiesById.get(id);
    if (!d) {
      console.warn('propertiesById에 데이터가 없음:', id);
      return;
    }

    const marker = app.markers.get(id);
    if (!marker) {
      console.warn('markers에 마커가 없음:', id);
      return;
    }

    renderMarkerPopup(d, app.map, marker);
    highlightMarker(app, id);
  }
}
