/**
 * MapIntegration - 지도 통합 모듈 (Intermediary용)
 * 공통 MapManager를 활용한 지도 초기화 및 매물 마커 표시
 */

// ⛔️ 이제 bounds 기반 디바운스 로직 안 쓸 거면 import 필요 없음
// import { debounce } from '../../shared/utils/debounce.js';

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

    // 브로커 전용 매물 캐시
    this.properties = [];
  }

  /**
   * 초기화
   * ✅ 이제는 bounds 기준이 아니라,
   *   "현재 브로커가 관리중인 매물"만 로드
   */
  async initialize() {
    try {
      // 예전: idle 이벤트 + loadPropertiesInBounds()
      // 지금: 한 번 브로커 매물 로드해서 마커 뿌리기
      await this.loadBrokerProperties();

      console.log('지도 통합 모듈 초기화 완료 (브로커 전용)');
    } catch (error) {
      console.error('지도 통합 모듈 초기화 실패:', error);
      throw error;
    }
  }

  /**
   * ✅ 브로커 전용 매물 로드
   *  - /api/broker/dashboard/map-properties (백엔드에서 구현)
   *  - PropertyService.getBrokerMapProperties()에서 호출
   */
  async loadBrokerProperties() {
    try {
      // PropertyService 안에서 AuthUtils 써서 토큰 처리하도록 구현했다고 가정
      const properties = await this.propertyService.getBrokerMapProperties();
      this.properties = properties || [];

      // 마커 렌더링
      this.displayProperties(this.properties);

      // 콜백 실행
      this._triggerCallbacks('onPropertiesLoad', this.properties);

      console.log(`브로커 매물 ${this.properties.length}개 로드됨`);
      return this.properties;
    } catch (error) {
      console.error('브로커 매물 조회 실패:', error);

      if (error.message === 'Unauthorized') {
        alert('로그인이 필요합니다. 다시 로그인해주세요.');
        window.location.href = '/loginX.html';
      }

      return [];
    }
  }

  /**
   * ❌ (예전 방식) 지도 영역 내 매물 조회 및 마커 표시
   *   - 지금은 안 쓸 거면 남겨두고 안 쓰거나, 필요 없으면 통째로 삭제해도 됨
   */
  async loadPropertiesInBounds() {
    console.warn('[MapIntegration] loadPropertiesInBounds는 브로커 화면에서는 사용하지 않습니다.');
    return [];
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

    // ⚠️ 백엔드 DTO가 locationX/locationY면,
    // MarkerManager가 lat/lng를 기대한다면 여기서 변환
    const normalized = properties.map(p => ({
      ...p,
      lat: p.lat ?? p.locationY,   // 위도
      lng: p.lng ?? p.locationX    // 경도
    }));

    // 마커 렌더링 (클릭 콜백 포함)
    this.markerManager.renderMarkers(normalized, (propertyId, property) => {
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

    // 지금은 서버 필터까지는 안 걸고,
    // 필요하면 여기서 this.properties 필터링 후 displayProperties 호출하는 식으로 확장 가능
    // 일단은 브로커 매물 전체 다시 로드
    await this.loadBrokerProperties();
  }

  /**
   * 필터 초기화
   */
  async resetFilters() {
    this.currentFilters = {};
    await this.loadBrokerProperties();
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
    this.properties = [];
    this.callbacks = {
      onPropertyClick: [],
      onPropertiesLoad: []
    };
  }
}
