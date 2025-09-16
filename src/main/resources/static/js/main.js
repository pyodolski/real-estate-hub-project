import { initMap } from './map/initMap.js';

const appState = {
  map: null,
  markers: new Map(),   // id -> Marker
  currentId: null
};

initMap(appState);