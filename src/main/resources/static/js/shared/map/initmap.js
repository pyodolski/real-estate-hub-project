// src/main/resources/static/js/shared/map/initmap.js
import { initPoiLayers, refreshPoiOnBoundsChange } from './poi/poi-layer.js';
import { debounce } from '../utils/debounce.js';
import { renderMarkers, highlightMarker } from './markers.js';
import { fetchPropertiesInBounds } from '../components/propertiesApi.js';
import { renderMarkerPopup, closeMarkerPopup } from './marker-popup.js';
import { getUserLocation } from './user-location.js';

export function initMap(app) {
  const center = new naver.maps.LatLng(37.5665, 126.9780);

  app.map = new naver.maps.Map('map', {
    center,
    zoom: 13,
    zoomControl: false,
  });

  window.__naverMap = app.map;

  const el = document.getElementById('map');
  if (el) el.__MAP_CREATED__ = true;

  // ✅ 매물 캐시 (id -> 매물 전체 데이터)
  if (!app.propertiesById) {
    app.propertiesById = new Map();
  }

  // ✅ POI(편의점/버스/지하철) 상태
  if (!app.poiState) {
    app.poiState = {
      convenience: new Map(), // id -> marker
      subway: new Map(),
      bus: new Map(),
      visibleLayers: {
        convenience: true,
        subway: true,
        bus: true,
      },
    };
  }

  // 최초 한 번 POI 레이어 초기화 (체크박스/토글 이벤트 등)
  initPoiLayers(app);

  // 지도 렌더 후(첫 idle) map:ready 발행 + 사용자 위치 가져오기
  naver.maps.Event.once(app.map, 'idle', () => {
    window.__MAP_IS_READY__ = true; // ✅ 지도 준비 완료 플래그
    window.dispatchEvent(new Event('map:ready'));
    
    // ✅ 사용자 현재 위치 가져오기 (지도 이동: false로 설정하여 기본 중심 유지)
    // 페이지 로드 시 자동으로 현재 위치를 표시하려면 moveToLocation을 true로 변경
    getUserLocation(app.map, false, 15);
  });

  // ✅ 다른 스크립트에서 사용자 위치 기능을 호출할 수 있도록 전역으로 노출
  window.getUserCurrentLocation = () => getUserLocation(app.map, true, 15);

  // (선택) 상단 상태 필터
  const statusFilterEl = document.getElementById('statusFilter');

  // 현재 활성 필터 합성: filter.js가 세팅한 window.currentFilters + status 필터
  function getActiveFilters() {
    const base =
      window.currentFilters && typeof window.currentFilters === 'object'
        ? { ...window.currentFilters }
        : {};

    const v = statusFilterEl?.value || '';
    if (v) base.status = v; // 백엔드가 status를 받도록 구현된 경우
    return base;
  }

  // ✅ 지도 영역 + 필터로 매물/POI 모두 갱신
  const onIdle = debounce(async () => {
    const b = app.map.getBounds();
    if (!b) return;

    const sw = b.getSW();
    const ne = b.getNE();

    const filters = getActiveFilters();

    try {
      // 1) 매물 목록 조회
      const list = await fetchPropertiesInBounds({
        swLat: sw.y,
        swLng: sw.x,
        neLat: ne.y,
        neLng: ne.x,
        filters, // ← 필터 전체 전달 (propertiesApi.js에서 직렬화)
      });

      const arr = Array.isArray(list) ? list : [];

      // 2) 매물 캐시 갱신
      app.propertiesById.clear();
      for (const p of arr) {
        // 여기서 p는 PropertyFullResponse 한 건
        app.propertiesById.set(p.id, p);
      }

      // 3) 매물 마커 갱신
      renderMarkers(app, arr, onMarkerClick);

      // 4) POI(편의점/지하철/버스)도 bounds 기준으로 새로고침
      await refreshPoiOnBoundsChange(app, { sw, ne });
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

  // 🔑 filter.js에서 보내는 커스텀 이벤트 수신 → 목록/마커/POI 리프레시
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

    // ✅ 서버 재호출 대신, 캐싱 데이터 사용
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
