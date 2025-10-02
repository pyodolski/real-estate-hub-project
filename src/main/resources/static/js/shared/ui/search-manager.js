/**
 * SearchManager - 검색 공통 모듈
 * 장소 검색, 자동완성, 검색 결과 처리
 */

import { debounce } from '../utils/debounce.js';

export class SearchManager {
  /**
   * @param {Object} options - 검색 옵션
   * @param {string} options.inputId - 검색 입력 필드 ID
   * @param {string} options.suggestId - 자동완성 컨테이너 ID
   * @param {number} options.debounceDelay - 디바운스 지연 시간 (ms)
   * @param {number} options.minQueryLength - 최소 검색어 길이
   * @param {number} options.maxResults - 최대 결과 개수
   */
  constructor(options = {}) {
    this.options = {
      inputId: options.inputId || 'global-search-input',
      suggestId: options.suggestId || 'global-search-suggest',
      debounceDelay: options.debounceDelay || 250,
      minQueryLength: options.minQueryLength || 2,
      maxResults: options.maxResults || 10,
      apiEndpoint: options.apiEndpoint || '/api/search/places',
      ...options
    };

    this.inputElement = document.getElementById(this.options.inputId);
    this.suggestElement = document.getElementById(this.options.suggestId);

    this.currentQuery = '';
    this.searchResults = [];
    this.selectedIndex = -1;

    this.callbacks = {
      onSearch: [],
      onSelect: [],
      onClear: []
    };

    if (this.inputElement && this.suggestElement) {
      this._initialize();
    } else {
      console.error('검색 요소를 찾을 수 없습니다.');
    }
  }

  /**
   * 초기화
   * @private
   */
  _initialize() {
    // 입력 이벤트 (디바운스 적용)
    this.inputElement.addEventListener('input', debounce(async (e) => {
      await this._handleInput(e);
    }, this.options.debounceDelay));

    // 키보드 이벤트
    this.inputElement.addEventListener('keydown', (e) => {
      this._handleKeydown(e);
    });

    // 자동완성 클릭 이벤트
    this.suggestElement.addEventListener('click', (e) => {
      this._handleSuggestClick(e);
    });

    // 외부 클릭 시 자동완성 닫기
    document.addEventListener('click', (e) => {
      if (e.target !== this.inputElement && !this.suggestElement.contains(e.target)) {
        this.closeSuggest();
      }
    });
  }

  /**
   * 입력 처리
   * @private
   */
  async _handleInput(e) {
    const query = e.target.value.trim();
    this.currentQuery = query;

    if (query.length < this.options.minQueryLength) {
      this.closeSuggest();
      this._triggerCallbacks('onClear');
      return;
    }

    try {
      const results = await this.search(query);
      this.searchResults = results;
      this.renderSuggest(results);
      this._triggerCallbacks('onSearch', { query, results });
    } catch (error) {
      console.error('검색 실패:', error);
      this.closeSuggest();
    }
  }

  /**
   * 키보드 이벤트 처리
   * @private
   */
  _handleKeydown(e) {
    const isOpen = !this.suggestElement.classList.contains('hidden');

    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this._navigateSuggest(1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        this._navigateSuggest(-1);
        break;
      case 'Enter':
        e.preventDefault();
        this._selectCurrent();
        break;
      case 'Escape':
        this.closeSuggest();
        break;
    }
  }

  /**
   * 자동완성 항목 탐색
   * @private
   */
  _navigateSuggest(direction) {
    const buttons = this.suggestElement.querySelectorAll('button');
    if (buttons.length === 0) return;

    this.selectedIndex += direction;

    if (this.selectedIndex < 0) {
      this.selectedIndex = buttons.length - 1;
    } else if (this.selectedIndex >= buttons.length) {
      this.selectedIndex = 0;
    }

    // 하이라이트 업데이트
    buttons.forEach((btn, idx) => {
      if (idx === this.selectedIndex) {
        btn.classList.add('bg-gray-100');
        btn.scrollIntoView({ block: 'nearest' });
      } else {
        btn.classList.remove('bg-gray-100');
      }
    });
  }

  /**
   * 현재 선택된 항목 선택
   * @private
   */
  _selectCurrent() {
    const buttons = this.suggestElement.querySelectorAll('button');
    if (this.selectedIndex >= 0 && this.selectedIndex < buttons.length) {
      buttons[this.selectedIndex].click();
    } else if (buttons.length > 0) {
      buttons[0].click();
    }
  }

  /**
   * 자동완성 클릭 처리
   * @private
   */
  _handleSuggestClick(e) {
    e.preventDefault();
    const button = e.target.closest('button[data-mapx][data-mapy]');
    if (!button) return;

    const item = {
      name: button.dataset.name || '',
      mapx: button.dataset.mapx,
      mapy: button.dataset.mapy,
      address: button.dataset.address || '',
      category: button.dataset.category || ''
    };

    this.selectItem(item);
  }

  /**
   * 장소 검색
   * @param {string} query - 검색어
   * @returns {Promise<Array>}
   */
  async search(query) {
    if (!query || query.length < this.options.minQueryLength) {
      return [];
    }

    try {
      const url = `${this.options.apiEndpoint}?q=${encodeURIComponent(query)}&limit=${this.options.maxResults}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('검색 요청 실패');
      }

      const data = await response.json();
      const items = data.items || [];

      // 필터링 적용 (선택적)
      return this._filterResults(items, query);
    } catch (error) {
      console.error('검색 오류:', error);
      return [];
    }
  }

  /**
   * 검색 결과 필터링
   * @private
   */
  _filterResults(items, query) {
    const keyword = query.replace(/\s+/g, '').toLowerCase();
    const isStationQuery = /역|station/i.test(query);

    return items.filter(item => {
      const name = (item.title || '').replace(/<[^>]+>/g, '');
      const category = item.category || '';

      const isStation = /역|train|subway|철도/i.test(name + category);
      const isBuilding = /건물|빌딩|타워|센터|관|몰|프라자|아파트|오피스|대학|학교|병원|백화점|마트/i.test(name + category);

      if (isStationQuery) {
        return isStation;
      }

      return isStation || isBuilding || name.replace(/\s+/g, '').toLowerCase().includes(keyword);
    });
  }

  /**
   * 자동완성 렌더링
   * @param {Array} items - 검색 결과
   */
  renderSuggest(items) {
    if (!items || items.length === 0) {
      this.closeSuggest();
      return;
    }

    const html = items.slice(0, this.options.maxResults).map(item => {
      const name = (item.title || '').replace(/<[^>]+>/g, '');
      const address = item.roadAddress || item.address || '';
      const category = item.category || '';

      return `
        <button type="button"
                class="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 block"
                data-mapx="${item.mapx}"
                data-mapy="${item.mapy}"
                data-name="${name}"
                data-address="${address}"
                data-category="${category}">
          <div class="font-semibold text-gray-800">${name}</div>
          ${category ? `<div class="text-xs text-gray-500">${category}</div>` : ''}
          ${address ? `<div class="text-xs text-gray-600">${address}</div>` : ''}
        </button>
      `;
    }).join('');

    this.suggestElement.innerHTML = html;
    this.suggestElement.classList.remove('hidden');
    this.selectedIndex = -1;
  }

  /**
   * 자동완성 닫기
   */
  closeSuggest() {
    this.suggestElement.classList.add('hidden');
    this.suggestElement.innerHTML = '';
    this.selectedIndex = -1;
  }

  /**
   * 항목 선택
   * @param {Object} item - 선택된 항목
   */
  selectItem(item) {
    this.inputElement.value = item.name;
    this.closeSuggest();

    this._triggerCallbacks('onSelect', item);
  }

  /**
   * 검색어 설정
   * @param {string} query - 검색어
   */
  setQuery(query) {
    this.inputElement.value = query;
    this.currentQuery = query;
  }

  /**
   * 검색어 가져오기
   * @returns {string}
   */
  getQuery() {
    return this.currentQuery;
  }

  /**
   * 검색 초기화
   */
  clear() {
    this.inputElement.value = '';
    this.currentQuery = '';
    this.searchResults = [];
    this.closeSuggest();
    this._triggerCallbacks('onClear');
  }

  /**
   * 이벤트 리스너 추가
   * @param {string} event - 이벤트 이름 ('search' | 'select' | 'clear')
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
   * TM128 좌표를 위경도로 변환
   * @param {number} mapx - X 좌표
   * @param {number} mapy - Y 좌표
   * @returns {Object|null} {lat, lng}
   */
  tm128ToLatLng(mapx, mapy) {
    if (!window.naver?.maps?.TransCoord) {
      console.error('네이버 지도 API가 로드되지 않았습니다.');
      return null;
    }

    const tm = new naver.maps.Point(Number(mapx), Number(mapy));
    const latlng = naver.maps.TransCoord.fromTM128ToLatLng(tm);

    return {
      lat: latlng.y,
      lng: latlng.x
    };
  }

  /**
   * 리소스 정리
   */
  destroy() {
    this.closeSuggest();
    this.callbacks = {
      onSearch: [],
      onSelect: [],
      onClear: []
    };
  }
}
