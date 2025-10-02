/**
 * MarkerManager - 마커 관리 전용 모듈
 * 마커 생성, 업데이트, 하이라이트, 아이콘 변경 등 마커 관련 모든 기능 담당
 */

import { iconByStatus } from './iconFactory.js';

export class MarkerManager {
  /**
   * @param {naver.maps.Map} map - 네이버 지도 객체
   */
  constructor(map) {
    this.map = map;
    this.markers = new Map(); // markerId -> naver.maps.Marker
    this.markerStatus = new Map(); // markerId -> status
    this.currentHighlightId = null;
  }

  /**
   * 마커 생성 및 추가
   * @param {Object} property - 매물 정보
   * @param {Function} onClick - 클릭 콜백
   * @returns {naver.maps.Marker|null}
   */
  createMarker(property, onClick) {
    // 좌표 추출 (다양한 필드명 지원)
    const lat = Number(property.lat ?? property.latitude ?? property.y ?? property.location_y);
    const lng = Number(property.lng ?? property.longitude ?? property.x ?? property.location_x);

    // 좌표 유효성 검사
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      console.warn('유효하지 않은 좌표:', property);
      return null;
    }

    const status = property.status ?? 'AVAILABLE';
    const isActive = property.id === this.currentHighlightId;

    const marker = new naver.maps.Marker({
      position: new naver.maps.LatLng(lat, lng),
      map: this.map,
      icon: {
        content: iconByStatus(status, isActive),
        anchor: new naver.maps.Point(7, 7),
      },
      title: property.title || property.address || '',
    });

    // 클릭 이벤트 바인딩
    if (onClick && typeof onClick === 'function') {
      naver.maps.Event.addListener(marker, 'click', () => onClick(property.id, property));
    }

    // 마커 저장
    this.markers.set(property.id, marker);
    this.markerStatus.set(property.id, status);

    return marker;
  }

  /**
   * 여러 마커를 한 번에 렌더링
   * @param {Array} properties - 매물 목록
   * @param {Function} onClick - 클릭 콜백
   */
  renderMarkers(properties, onClick) {
    // 기존 마커 제거
    this.clearMarkers();

    // 배열 유효성 검사
    if (!Array.isArray(properties) || properties.length === 0) {
      return;
    }

    // 새 마커 생성
    for (const property of properties) {
      this.createMarker(property, onClick);
    }
  }

  /**
   * 마커 제거
   * @param {string|number} markerId
   */
  removeMarker(markerId) {
    const marker = this.markers.get(markerId);
    if (marker) {
      marker.setMap(null);
      this.markers.delete(markerId);
      this.markerStatus.delete(markerId);
    }
  }

  /**
   * 모든 마커 제거
   */
  clearMarkers() {
    for (const marker of this.markers.values()) {
      marker.setMap(null);
    }
    this.markers.clear();
    this.markerStatus.clear();
  }

  /**
   * 특정 마커 하이라이트
   * @param {string|number|null} markerId - null이면 하이라이트 해제
   */
  highlightMarker(markerId) {
    this.currentHighlightId = markerId;

    // 모든 마커의 아이콘 업데이트
    for (const [id, marker] of this.markers.entries()) {
      const status = this.markerStatus.get(id) || 'AVAILABLE';
      const isActive = id === markerId;

      marker.setIcon({
        content: iconByStatus(status, isActive),
        anchor: new naver.maps.Point(7, 7),
      });
    }
  }

  /**
   * 마커 아이콘 업데이트
   * @param {string|number} markerId
   * @param {string} status - 매물 상태
   * @param {boolean} isActive - 활성화 여부
   */
  updateMarkerIcon(markerId, status, isActive = false) {
    const marker = this.markers.get(markerId);
    if (!marker) {
      console.warn(`마커를 찾을 수 없습니다: ${markerId}`);
      return;
    }

    this.markerStatus.set(markerId, status);

    marker.setIcon({
      content: iconByStatus(status, isActive),
      anchor: new naver.maps.Point(7, 7),
    });
  }

  /**
   * 특정 마커로 지도 중심 이동
   * @param {string|number} markerId
   * @param {number} zoom - 줌 레벨 (선택)
   */
  focusMarker(markerId, zoom) {
    const marker = this.markers.get(markerId);
    if (!marker) {
      console.warn(`마커를 찾을 수 없습니다: ${markerId}`);
      return;
    }

    const position = marker.getPosition();
    this.map.setCenter(position);

    if (zoom !== undefined) {
      this.map.setZoom(zoom);
    }
  }

  /**
   * 모든 마커가 보이도록 지도 영역 조정
   */
  fitBounds() {
    if (this.markers.size === 0) {
      return;
    }

    const bounds = new naver.maps.LatLngBounds();

    for (const marker of this.markers.values()) {
      bounds.extend(marker.getPosition());
    }

    this.map.fitBounds(bounds);
  }

  /**
   * 특정 마커 반환
   * @param {string|number} markerId
   * @returns {naver.maps.Marker|undefined}
   */
  getMarker(markerId) {
    return this.markers.get(markerId);
  }

  /**
   * 모든 마커 반환
   * @returns {Map}
   */
  getAllMarkers() {
    return this.markers;
  }

  /**
   * 마커 개수 반환
   * @returns {number}
   */
  getMarkerCount() {
    return this.markers.size;
  }

  /**
   * 마커가 존재하는지 확인
   * @param {string|number} markerId
   * @returns {boolean}
   */
  hasMarker(markerId) {
    return this.markers.has(markerId);
  }

  /**
   * 리소스 정리
   */
  destroy() {
    this.clearMarkers();
    this.currentHighlightId = null;
  }
}
