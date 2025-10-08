// /js/main.js
import { initMap } from './shared/map/initmap.js';
import { initFavorites, loadFavorites } from './regular/main/favorites.js';

const appState = {
  map: null,
  markers: new Map(),   // id -> Marker
  currentId: null,
  salesMarkers: new Map()  // 판매 매물 마커 저장용
};

// 전역으로 노출 (PropertyManagement에서 접근 가능하도록)
window.appState = appState;

window.addEventListener('DOMContentLoaded', () => {
  // 즐겨찾기: 리스너 1회 바인딩 + 초기 로드(원치 않으면 이 줄 주석)
  initFavorites();
  loadFavorites();

  // 패널 열 때 새로고침하고 싶으면:
  document.getElementById('favorite-panel-button')
    ?.addEventListener('click', () => loadFavorites());

  // 지도 초기화 (DOM 준비된 뒤)
  initMap(appState);
});

// 다른 곳에서 쓰게 하려면(선택):
// window.appState = appState;
