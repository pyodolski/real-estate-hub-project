// /js/main.js
import { initMap } from './map/initMap.js';
import { initFavorites, loadFavorites } from './favorites.js';


const appState = {
  map: null,
  markers: new Map(),   // id -> Marker
  currentId: null
};

window.addEventListener('DOMContentLoaded', () => {
  // 즐겨찾기: 리스너 1회 바인딩 + 초기 로드(원치 않으면 이 줄 주석)
  initFavorites();
  loadFavorites();

  // 패널 열 때 새로고침하고 싶으면:
  document.getElementById('favorite-panel-button')
    ?.addEventListener('click', () => loadFavorites());

  // 지도 초기화 (DOM 준비된 뒤)
  appState.map = initMap(appState);
});

// 다른 곳에서 쓰게 하려면(선택):
// window.appState = appState;
