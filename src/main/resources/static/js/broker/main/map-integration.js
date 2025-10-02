/**
 * MapIntegration - 지도 통합 모듈 (Intermediary용)
 * 공통 MapManager를 활용한 지도 초기화 및 매물 마커 표시
 */

import { debounce } from '../../shared/utils/debounce.js';

export class MapIntegration {
  /**
   * @param {MapManager} mapManager - 지도 관리자
   * @param {MarkerManager} markerManager - 마커 관리자
   * @param {PropertyService} propertyService - 매물 서비스
   */
  constructor(mapManager, markerManager, propertyService) {
    this.mapManager = mapManager;
    this.markerManager = markerManager;
    this.propertyService = propertyService;

    this.currentPropertyId = null;
    this.currentFilters = {};

    this.callbacks = {
      onPropertyClick: [],
      onPropertiesLoad: []
    };
  }

  /**
   * 초기화
   */
  async initialize() {
    try {
      // 지도 idle 이벤트 리스너 (디바운싱 적용)
      const debouncedLoadProperties = debounce(async () => {
        await this.loadPropertiesInBounds();
      }, 300);

      this.mapManager.addEventListener('idle', debouncedLoadProperties);

      // 초기 매물 로드
      await this.loadPropertiesInBounds();

      console.log('지도 통합 모듈 초기화 완료');
    } catch (error) {
      console.error('지도 통합 모듈 초기화 실패:', error);
      throw error;
    }
  }

  /**
   * 지도 영역 내 매물 조회 및 마커 표시
   */
  async loadPropertiesInBounds() {
    try {
      const bounds = this.mapManager.getBounds();
      if (!bounds) {
        console.warn('지도 경계를 가져올 수 없습니다.');
        return [];
      }

      // 매물 조회
      const properties = await this.propertyService.fetchPropertiesInBounds({
        swLat: bounds.swLat,
        swLng: bounds.swLng,
        neLat: bounds.neLat,
        neLng: bounds.neLng,
        filters: this.currentFilters
      });

      // 마커 렌더링
      this.displayProperties(properties);

      // 콜백 실행
      this._triggerCallbacks('onPropertiesLoad', properties);

      console.log(`매물 ${properties.length}개 로드됨 (Intermediary)`);
      return properties;
    } catch (error) {
      console.error('매물 조회 실패:', error);

      if (error.message === 'Unauthorized') {
        alert('로그인이 필요합니다. 다시 로그인해주세요.');
        window.location.href = '/loginX.html';
      }

      return [];
    }
  }

  /**
   * 매물 마커 표시
   * @param {Array} properties - 매물 목록
   */
  displayProperties(properties) {
    if (!Array.isArray(properties) || properties.length === 0) {
      this.markerManager.clearMarkers();
      return;
    }

    // 마커 렌더링 (클릭 콜백 포함)
    this.markerManager.renderMarkers(properties, (propertyId, property) => {
      this.handlePropertyClick(propertyId, property);
    });
  }

  /**
   * 매물 마커 클릭 처리
   * @param {string|number} propertyId - 매물 ID
   * @param {Object} property - 매물 정보
   */
  async handlePropertyClick(propertyId, property) {
    // 같은 마커를 다시 클릭하면 토글
    if (this.currentPropertyId === propertyId) {
      this.currentPropertyId = null;
      this.markerManager.highlightMarker(null);
      this._triggerCallbacks('onPropertyClick', null);
      return;
    }

    try {
      this.currentPropertyId = propertyId;

      // 마커 하이라이트
      this.markerManager.highlightMarker(propertyId);

      // 매물 상세 정보 조회 (필요시)
      let detailedProperty = property;
      if (!property || !property.title) {
        detailedProperty = await this.propertyService.fetchPropertyDetail(propertyId);
      }

      // 콜백 실행
      this._triggerCallbacks('onPropertyClick', {
        id: propertyId,
        property: detailedProperty
      });

      console.log('매물 클릭:', detailedProperty);
    } catch (error) {
      console.error('매물 상세 정보 조회 실패:', error);
      this.currentPropertyId = null;
      this.markerManager.highlightMarker(null);
    }
  }

  /**
   * 필터 적용
   * @param {Object} filters - 필터 옵션
   */
  async applyFilters(filters) {
    this.currentFilters = filters || {};
    await this.loadPropertiesInBounds();
  }

  /**
   * 필터 초기화
   */
  async resetFilters() {
    this.currentFilters = {};
    await this.loadPropertiesInBounds();
  }

  /**
   * 특정 위치로 지도 이동
   * @param {number} lat - 위도
   * @param {number} lng - 경도
   * @param {number} zoom - 줌 레벨 (선택)
   */
  moveToLocation(lat, lng, zoom) {
    this.mapManager.setCenter(lat, lng);
    if (zoom !== undefined) {
      this.mapManager.setZoom(zoom);
    }
  }

  /**
   * 특정 매물로 지도 이동 및 하이라이트
   * @param {string|number} propertyId - 매물 ID
   */
  focusOnProperty(propertyId) {
    this.markerManager.focusMarker(propertyId, 16);
    this.currentPropertyId = propertyId;
    this.markerManager.highlightMarker(propertyId);
  }

  /**
   * 모든 마커가 보이도록 지도 영역 조정
   */
  fitAllMarkers() {
    this.markerManager.fitBounds();
  }

  /**
   * 이벤트 리스너 추가
   * @param {string} event - 이벤트 이름
   * @param {Function} callback - 콜백 함수
   */
  addEventListener(event, callback) {
    const eventName = `on${event.charAt(0).toUpperCase()}${event.slice(1)}`;
    if (this.callbacks[eventName]) {
      this.callbacks[eventName].push(callback);
    }
  }

  /**
   * 이벤트 리스너 제거
   * @param {string} event - 이벤트 이름
   * @param {Function} callback - 제거할 콜백
   */
  removeEventListener(event, callback) {
    const eventName = `on${event.charAt(0).toUpperCase()}${event.slice(1)}`;
    if (this.callbacks[eventName]) {
      this.callbacks[eventName] = this.callbacks[eventName].filter(cb => cb !== callback);
    }
  }

  /**
   * 콜백 실행
   * @private
   */
  _triggerCallbacks(eventName, data) {
    const callbacks = this.callbacks[eventName] || [];
    for (const callback of callbacks) {
      if (typeof callback === 'function') {
        callback(data);
      }
    }
  }

  /**
   * 현재 선택된 매물 ID 가져오기
   * @returns {string|number|null}
   */
  getCurrentPropertyId() {
    return this.currentPropertyId;
  }

  /**
   * 현재 필터 가져오기
   * @returns {Object}
   */
  getCurrentFilters() {
    return { ...this.currentFilters };
  }

  /**
   * 지도 매니저 가져오기
   * @returns {MapManager}
   */
  getMapManager() {
    return this.mapManager;
  }

  /**
   * 마커 매니저 가져오기
   * @returns {MarkerManager}
   */
  getMarkerManager() {
    return this.markerManager;
  }

  /**
   * 리소스 정리
   */
  destroy() {
    this.currentPropertyId = null;
    this.currentFilters = {};
    this.callbacks = {
      onPropertyClick: [],
      onPropertiesLoad: []
    };
  }
}
