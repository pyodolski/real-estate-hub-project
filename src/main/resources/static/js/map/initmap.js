// src/main/resources/static/js/map/initMap.js
import { debounce } from '../utils/debounce.js';
import { renderMarkers, highlightMarker } from './markers.js';
import { fetchPropertiesInBounds, fetchPropertyDetail } from '../api/propertiesApi.js';
import { clearDetail } from '../ui/sidebar.js';
//import { clearDetail, renderDetail } from '../ui/sidebar.js'; // (원래 코드)
import { renderMarkerPopup } from './marker-popup.js';

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

    try {
      const list = await fetchPropertiesInBounds({
        swLat: sw.y, swLng: sw.x, neLat: ne.y, neLng: ne.x, filters
      });
      console.log('properties list:', list, 'length=', Array.isArray(list) ? list.length : 'N/A');
      new naver.maps.Marker({
        position: new naver.maps.LatLng(37.5665, 126.9780),
        map: app.map,
      });
      renderMarkers(app, list, onMarkerClick);
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
    // 작은 팝업(추천 카드 재사용)
    renderMarkerPopup(d);
    // 필요 시 상세로 확장하는 버튼은 popup 내부에서 처리
    //renderDetail(d); // (원본 코드)
    highlightMarker(app, id);
  }
}
