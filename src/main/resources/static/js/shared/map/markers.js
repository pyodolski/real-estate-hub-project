// markers.js
import { iconByStatus } from './iconFactory.js';

export function renderMarkers(app, list, onClick) {
  // 🔹 markers Map 보장
  if (!app.markers) app.markers = new Map();

  // 기존 마커 제거
  for (const m of app.markers.values()) m.setMap(null);
  app.markers.clear();

  // 상태 저장용 맵 보장
  if (!app.markerStatus) app.markerStatus = new Map();
  app.markerStatus.clear();

  if (!Array.isArray(list) || list.length === 0) return;

  for (const item of list) {
    // 🔹 백엔드 필드명 다양성 대응 (lat/lng, latitude/longitude, y/x, location_y/location_x)
    const lat = (
      item.lat ?? item.latitude ?? item.y ?? item.location_y
    );
    const lng = (
      item.lng ?? item.longitude ?? item.x ?? item.location_x
    );

    // 숫자 변환 & 유효성 검사
    const latNum = Number(lat);
    const lngNum = Number(lng);
    if (!Number.isFinite(latNum) || !Number.isFinite(lngNum)) {
      // 좌표가 유효하지 않으면 스킵 (로그로 확인)
      console.warn('invalid coords:', item);
      continue;
    }

    const marker = new naver.maps.Marker({
      position: new naver.maps.LatLng(latNum, lngNum), // ✅ 위도, 경도 순서
      map: app.map,
      icon: {
        content: iconByStatus(item.status, item.id === app.currentId),
        anchor: new naver.maps.Point(7, 7),
      }
    });

    // 상태 저장
    app.markerStatus.set(item.id, item.status ?? 'AVAILABLE');

    naver.maps.Event.addListener(marker, 'click', () => onClick?.(item.id));
    app.markers.set(item.id, marker);
  }
}

export function highlightMarker(app, id) {
  if (!app.markers) return;
  for (const [pid, mk] of app.markers.entries()) {
    const st = app.markerStatus?.get(pid) || 'AVAILABLE';
    const active = pid === id;
    mk.setIcon({
      content: iconByStatus(st, active),
      anchor: new naver.maps.Point(7, 7),
    });
  }
}
