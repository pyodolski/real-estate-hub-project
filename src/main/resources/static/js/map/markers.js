// markers.js
import { iconByStatus } from './iconFactory.js';

export function renderMarkers(app, list, onClick) {
  // 기존 마커 제거
  for (const m of app.markers.values()) m.setMap(null);
  app.markers.clear();

  // 상태 저장용 맵 준비
  if (!app.markerStatus) app.markerStatus = new Map(); // id -> status
  app.markerStatus.clear();

  for (const item of list) {
    const marker = new naver.maps.Marker({
      position: new naver.maps.LatLng(item.lat, item.lng),
      map: app.map,
      icon: {
        content: iconByStatus(item.status, item.id === app.currentId),
        anchor: new naver.maps.Point(7, 7),
      }
    });

    // 🔸 이 매물의 상태 저장
    app.markerStatus.set(item.id, item.status);

    naver.maps.Event.addListener(marker, 'click', () => onClick?.(item.id));
    app.markers.set(item.id, marker);
  }
}

export function highlightMarker(app, id) {
  for (const [pid, mk] of app.markers.entries()) {
    const st = app.markerStatus?.get(pid) || 'AVAILABLE'; // 🔸 각 마커 자신의 상태
    const active = pid === id;
    mk.setIcon({
      content: iconByStatus(st, active),
      anchor: new naver.maps.Point(7, 7),
    });
  }
}