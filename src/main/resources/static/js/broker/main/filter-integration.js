/**
 * FilterIntegration - 중개인 매물 필터링 통합 모듈
 * FilterManager를 활용하여 매물 필터링 및 결과 표시
 */

import { FilterManager } from '../../shared/ui/filter-manager.js';

export class FilterIntegration {
  /**
   * @param {MapIntegration} mapIntegration - 지도 통합 모듈
   */
  constructor(mapIntegration) {
    this.mapIntegration = mapIntegration;
    this.filterManager = new FilterManager();

    this.callbacks = {
      onFilterChange: [],
      onFilterApply: []
    };

    this._initialize();
  }

  /**
   * 초기화
   * @private
   */
  _initialize() {
    // FilterManager 이벤트 리스너
    this.filterManager.addEventListener('change', (filters) => {
      this._triggerCallbacks('onFilterChange', filters);
    });

    this.filterManager.addEventListener('apply', async (filters) => {
      await this.applyFilters(filters);
      this._triggerCallbacks('onFilterApply', filters);
    });

    this.filterManager.addEventListener('reset', async () => {
      await this.resetFilters();
    });

    // 중개인 전용 필터 UI 초기화 (필요시)
    this._setupFilterUI();

    console.log('필터 통합 모듈 초기화 완료 (Intermediary)');
  }

  /**
   * 필터 UI 설정
   * @private
   */
  _setupFilterUI() {
    // 중개인 페이지에 필터 UI가 있다면 여기서 연결
    // 예: 좌측 패널에 필터 버튼 추가 등

    // 필터 적용 버튼 이벤트
    const filterApplyButton = document.getElementById('apply-filters-button');
    if (filterApplyButton) {
      filterApplyButton.addEventListener('click', async () => {
        const filters = this.filterManager.getActiveFilters();
        await this.applyFilters(filters);
      });
    }

    // 필터 초기화 버튼 이벤트
    const filterResetButton = document.getElementById('reset-filters-button');
    if (filterResetButton) {
      filterResetButton.addEventListener('click', async () => {
        await this.resetFilters();
      });
    }
  }

  /**
   * 필터 적용
   * @param {Object} filters - 필터 옵션
   */
  async applyFilters(filters) {
    try {
      console.log('필터 적용:', filters);

      // 지도 통합에 필터 전달
      if (this.mapIntegration) {
        await this.mapIntegration.applyFilters(filters);
      }

      // 필터 개수 UI 업데이트 (필요시)
      this._updateFilterCountBadge();

      console.log('필터 적용 완료');
    } catch (error) {
      console.error('필터 적용 실패:', error);
      throw error;
    }
  }

  /**
   * 필터 초기화
   */
  async resetFilters() {
    try {
      console.log('필터 초기화');

      this.filterManager.resetFilters();

      // 지도 통합에 필터 초기화 전달
      if (this.mapIntegration) {
        await this.mapIntegration.resetFilters();
      }

      // 필터 개수 UI 업데이트
      this._updateFilterCountBadge();

      console.log('필터 초기화 완료');
    } catch (error) {
      console.error('필터 초기화 실패:', error);
      throw error;
    }
  }

  /**
   * 필터 추가
   * @param {string} type - 필터 타입
   * @param {*} value - 필터 값
   */
  addFilter(type, value) {
    this.filterManager.addFilter(type, value);
    this._updateFilterCountBadge();
  }

  /**
   * 필터 제거
   * @param {string} type - 필터 타입
   * @param {*} value - 제거할 값
   */
  removeFilter(type, value) {
    this.filterManager.removeFilter(type, value);
    this._updateFilterCountBadge();
  }

  /**
   * 활성 필터 가져오기
   * @returns {Object}
   */
  getActiveFilters() {
    return this.filterManager.getActiveFilters();
  }

  /**
   * 필터를 쿼리 파라미터로 변환
   * @returns {Object}
   */
  toQueryParams() {
    return this.filterManager.toQueryParams();
  }

  /**
   * 필터 개수 배지 업데이트
   * @private
   */
  _updateFilterCountBadge() {
    const filterCount = this.filterManager.getFilterCount();
    const filterBadge = document.getElementById('filter-count-badge');

    if (filterBadge) {
      if (filterCount > 0) {
        filterBadge.textContent = filterCount;
        filterBadge.classList.remove('hidden');
      } else {
        filterBadge.classList.add('hidden');
      }
    }
  }

  /**
   * 필터 개수 반환
   * @returns {number}
   */
  getFilterCount() {
    return this.filterManager.getFilterCount();
  }

  /**
   * 필터가 비어있는지 확인
   * @returns {boolean}
   */
  isEmpty() {
    return this.filterManager.isEmpty();
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
   * FilterManager 가져오기
   * @returns {FilterManager}
   */
  getFilterManager() {
    return this.filterManager;
  }

  /**
   * 리소스 정리
   */
  destroy() {
    this.callbacks = {
      onFilterChange: [],
      onFilterApply: []
    };
  }
}
