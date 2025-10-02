/**
 * MapManager - 지도 관리 공통 모듈
 * 네이버 지도 API를 래핑하여 지도 생성, 마커 관리, 이벤트 처리를 담당
 */

export class MapManager {
  /**
   * @param {string} containerId - 지도를 표시할 컨테이너 ID
   * @param {Object} options - 지도 옵션
   * @param {number} options.lat - 초기 중심 위도
   * @param {number} options.lng - 초기 중심 경도
   * @param {number} options.zoom - 초기 줌 레벨
   * @param {boolean} options.zoomControl - 줌 컨트롤 표시 여부
   */
  constructor(containerId, options = {}) {
    this.containerId = containerId;
    this.options = {
      lat: options.lat ?? 37.5665,
      lng: options.lng ?? 126.9780,
      zoom: options.zoom ?? 13,
      zoomControl: options.zoomControl ?? false,
      ...options
    };
    this.map = null;
    this.markers = new Map();
    this.eventListeners = new Map();
  }

  /**
   * 지도 초기화
   * @returns {Promise<naver.maps.Map>}
   */
  async initializeMap() {
    try {
      // 네이버 지도 API가 로드되었는지 확인
      if (typeof naver === 'undefined' || !naver.maps) {
        throw new Error('네이버 지도 API가 로드되지 않았습니다.');
      }

      const container = document.getElementById(this.containerId);
      if (!container) {
        throw new Error(`지도 컨테이너를 찾을 수 없습니다: ${this.containerId}`);
      }

      const center = new naver.maps.LatLng(this.options.lat, this.options.lng);
      this.map = new naver.maps.Map(this.containerId, {
        center,
        zoom: this.options.zoom,
        zoomControl: this.options.zoomControl,
        ...this.options
      });

      console.log('지도 초기화 완료');
      return this.map;
    } catch (error) {
      console.error('지도 초기화 실패:', error);
      throw error;
    }
  }

  /**
   * 마커 추가
   * @param {Object} property - 매물 정보
   * @param {Function} onClick - 마커 클릭 콜백
   * @returns {naver.maps.Marker}
   */
  addMarker(property, onClick) {
    if (!this.map) {
      console.error('지도가 초기화되지 않았습니다.');
      return null;
    }

    // 좌표 추출 (다양한 필드명 지원)
    const lat = Number(property.lat ?? property.latitude ?? property.y ?? property.location_y);
    const lng = Number(property.lng ?? property.longitude ?? property.x ?? property.location_x);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      console.warn('유효하지 않은 좌표:', property);
      return null;
    }

    const marker = new naver.maps.Marker({
      position: new naver.maps.LatLng(lat, lng),
      map: this.map,
      title: property.title || property.address || '',
    });

    if (onClick && typeof onClick === 'function') {
      naver.maps.Event.addListener(marker, 'click', () => onClick(property));
    }

    this.markers.set(property.id, marker);
    return marker;
  }

  /**
   * 마커 제거
   * @param {string|number} markerId - 마커 ID
   */
  removeMarker(markerId) {
    const marker = this.markers.get(markerId);
    if (marker) {
      marker.setMap(null);
      this.markers.delete(markerId);
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
  }

  /**
   * 마커 일괄 업데이트
   * @param {Array} properties - 매물 목록
   * @param {Function} onClick - 마커 클릭 콜백
   */
  updateMarkers(properties, onClick) {
    // 기존 마커 제거
    this.clearMarkers();

    // 새 마커 추가
    if (Array.isArray(properties)) {
      properties.forEach(property => {
        this.addMarker(property, onClick);
      });
    }
  }

  /**
   * 지도 중심 변경
   * @param {number} lat - 위도
   * @param {number} lng - 경도
   */
  setCenter(lat, lng) {
    if (!this.map) {
      console.error('지도가 초기화되지 않았습니다.');
      return;
    }
    const center = new naver.maps.LatLng(lat, lng);
    this.map.setCenter(center);
  }

  /**
   * 줌 레벨 변경
   * @param {number} level - 줌 레벨
   */
  setZoom(level) {
    if (!this.map) {
      console.error('지도가 초기화되지 않았습니다.');
      return;
    }
    this.map.setZoom(level);
  }

  /**
   * 지도 이벤트 리스너 추가
   * @param {string} event - 이벤트 이름 (idle, click, zoom_changed 등)
   * @param {Function} callback - 콜백 함수
   * @returns {naver.maps.MapEventListener}
   */
  addEventListener(event, callback) {
    if (!this.map) {
      console.error('지도가 초기화되지 않았습니다.');
      return null;
    }

    const listener = naver.maps.Event.addListener(this.map, event, callback);

    // 이벤트 리스너 저장 (추후 제거 가능하도록)
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(listener);

    return listener;
  }

  /**
   * 이벤트 리스너 제거
   * @param {string} event - 이벤트 이름
   */
  removeEventListener(event) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        naver.maps.Event.removeListener(listener);
      });
      this.eventListeners.delete(event);
    }
  }

  /**
   * 현재 지도 경계 가져오기
   * @returns {Object} { swLat, swLng, neLat, neLng }
   */
  getBounds() {
    if (!this.map) {
      console.error('지도가 초기화되지 않았습니다.');
      return null;
    }

    const bounds = this.map.getBounds();
    if (!bounds) return null;

    const sw = bounds.getSW();
    const ne = bounds.getNE();

    return {
      swLat: sw.y,
      swLng: sw.x,
      neLat: ne.y,
      neLng: ne.x
    };
  }

  /**
   * 지도 객체 반환
   * @returns {naver.maps.Map}
   */
  getMap() {
    return this.map;
  }

  /**
   * 모든 마커 반환
   * @returns {Map}
   */
  getMarkers() {
    return this.markers;
  }

  /**
   * 특정 마커 반환
   * @param {string|number} markerId
   * @returns {naver.maps.Marker}
   */
  getMarker(markerId) {
    return this.markers.get(markerId);
  }

  /**
   * 리소스 정리
   */
  destroy() {
    // 모든 이벤트 리스너 제거
    for (const event of this.eventListeners.keys()) {
      this.removeEventListener(event);
    }

    // 모든 마커 제거
    this.clearMarkers();

    // 지도 객체 정리
    if (this.map) {
      this.map = null;
    }
  }
}
