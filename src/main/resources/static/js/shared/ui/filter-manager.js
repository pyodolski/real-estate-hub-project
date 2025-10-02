/**
 * FilterManager - 필터링 공통 모듈
 * 매물 필터링 로직 및 UI 상태 관리
 */

export class FilterManager {
  /**
   * @param {string} containerId - 필터 컨테이너 ID (선택사항)
   */
  constructor(containerId = null) {
    this.containerId = containerId;
    this.filters = {
      houseTypes: new Set(),
      offerTypes: new Set(),
      options: new Set(),
      areaMin: null,
      areaMax: null,
      floorMin: null,
      floorMax: null,
      buyMin: null,
      buyMax: null,
      jeonseMin: null,
      jeonseMax: null,
      monthlyDepositMin: null,
      monthlyDepositMax: null,
      monthlyRentMin: null,
      monthlyRentMax: null,
      buildYearMin: null,
      buildYearMax: null
    };

    this.callbacks = {
      onChange: [],
      onApply: [],
      onReset: []
    };

    // 옵션 비트마스크 순서
    this.OPTION_ORDER = [
      "에어컨", "냉장고", "세탁기", "가스레인지",
      "인덕션레인지", "침대", "전자레인지", "TV", "책상", "CCTV"
    ];

    // 풀옵션 구성요소
    this.FULL_OPTION_ITEMS = [
      "에어컨", "냉장고", "세탁기", "가스레인지",
      "인덕션레인지", "침대", "전자레인지"
    ];
  }

  /**
   * 필터 추가
   * @param {string} type - 필터 타입 ('houseType' | 'offerType' | 'option' | 'area' | 'floor' | 'price')
   * @param {*} value - 필터 값
   */
  addFilter(type, value) {
    switch (type) {
      case 'houseType':
        this.filters.houseTypes.add(value);
        break;
      case 'offerType':
        this.filters.offerTypes.add(value);
        break;
      case 'option':
        if (value === '풀옵션') {
          this.FULL_OPTION_ITEMS.forEach(item => this.filters.options.add(item));
        } else {
          this.filters.options.add(value);
        }
        break;
      case 'area':
        if (value.min !== undefined) this.filters.areaMin = value.min;
        if (value.max !== undefined) this.filters.areaMax = value.max;
        break;
      case 'floor':
        if (value.min !== undefined) this.filters.floorMin = value.min;
        if (value.max !== undefined) this.filters.floorMax = value.max;
        break;
      case 'price':
        if (value.buyMin !== undefined) this.filters.buyMin = value.buyMin;
        if (value.buyMax !== undefined) this.filters.buyMax = value.buyMax;
        if (value.jeonseMin !== undefined) this.filters.jeonseMin = value.jeonseMin;
        if (value.jeonseMax !== undefined) this.filters.jeonseMax = value.jeonseMax;
        if (value.monthlyDepositMin !== undefined) this.filters.monthlyDepositMin = value.monthlyDepositMin;
        if (value.monthlyDepositMax !== undefined) this.filters.monthlyDepositMax = value.monthlyDepositMax;
        if (value.monthlyRentMin !== undefined) this.filters.monthlyRentMin = value.monthlyRentMin;
        if (value.monthlyRentMax !== undefined) this.filters.monthlyRentMax = value.monthlyRentMax;
        break;
      case 'buildYear':
        if (value.min !== undefined) this.filters.buildYearMin = value.min;
        if (value.max !== undefined) this.filters.buildYearMax = value.max;
        break;
    }

    this._triggerCallbacks('onChange');
  }

  /**
   * 필터 제거
   * @param {string} type - 필터 타입
   * @param {*} value - 제거할 값 (Set 타입의 경우)
   */
  removeFilter(type, value) {
    switch (type) {
      case 'houseType':
        this.filters.houseTypes.delete(value);
        break;
      case 'offerType':
        this.filters.offerTypes.delete(value);
        break;
      case 'option':
        if (value === '풀옵션') {
          this.FULL_OPTION_ITEMS.forEach(item => this.filters.options.delete(item));
        } else {
          this.filters.options.delete(value);
        }
        break;
      case 'area':
        this.filters.areaMin = null;
        this.filters.areaMax = null;
        break;
      case 'floor':
        this.filters.floorMin = null;
        this.filters.floorMax = null;
        break;
      case 'price':
        this.filters.buyMin = null;
        this.filters.buyMax = null;
        this.filters.jeonseMin = null;
        this.filters.jeonseMax = null;
        this.filters.monthlyDepositMin = null;
        this.filters.monthlyDepositMax = null;
        this.filters.monthlyRentMin = null;
        this.filters.monthlyRentMax = null;
        break;
      case 'buildYear':
        this.filters.buildYearMin = null;
        this.filters.buildYearMax = null;
        break;
    }

    this._triggerCallbacks('onChange');
  }

  /**
   * 활성 필터 가져오기
   * @returns {Object}
   */
  getActiveFilters() {
    return {
      houseTypes: Array.from(this.filters.houseTypes),
      offerTypes: Array.from(this.filters.offerTypes),
      options: Array.from(this.filters.options),
      areaMin: this.filters.areaMin,
      areaMax: this.filters.areaMax,
      floorMin: this.filters.floorMin,
      floorMax: this.filters.floorMax,
      buyMin: this.filters.buyMin,
      buyMax: this.filters.buyMax,
      jeonseMin: this.filters.jeonseMin,
      jeonseMax: this.filters.jeonseMax,
      monthlyDepositMin: this.filters.monthlyDepositMin,
      monthlyDepositMax: this.filters.monthlyDepositMax,
      monthlyRentMin: this.filters.monthlyRentMin,
      monthlyRentMax: this.filters.monthlyRentMax,
      buildYearMin: this.filters.buildYearMin,
      buildYearMax: this.filters.buildYearMax
    };
  }

  /**
   * 필터를 쿼리 파라미터로 변환
   * @returns {Object}
   */
  toQueryParams() {
    const params = {};

    // 주거형태 코드 변환
    if (this.filters.houseTypes.size > 0) {
      params.houseTypes = Array.from(this.filters.houseTypes)
        .map(this._mapHouseTypeToCode.bind(this))
        .filter(Boolean);
    }

    // 거래방식 코드 변환
    if (this.filters.offerTypes.size > 0) {
      params.offerTypes = Array.from(this.filters.offerTypes)
        .map(this._mapOfferTypeToCode.bind(this))
        .filter(Boolean);
    }

    // 옵션 비트마스크
    if (this.filters.options.size > 0) {
      params.optionMask = this._buildOptionBitString();
      params.optionMatchMode = 'ALL';
    }

    // 면적, 층수, 가격, 준공년도
    if (this.filters.areaMin !== null) params.areaMin = this.filters.areaMin;
    if (this.filters.areaMax !== null) params.areaMax = this.filters.areaMax;
    if (this.filters.floorMin !== null) params.floorMin = this.filters.floorMin;
    if (this.filters.floorMax !== null) params.floorMax = this.filters.floorMax;

    if (this.filters.buyMin !== null) params.buyMin = this.filters.buyMin;
    if (this.filters.buyMax !== null) params.buyMax = this.filters.buyMax;
    if (this.filters.jeonseMin !== null) params.jeonseMin = this.filters.jeonseMin;
    if (this.filters.jeonseMax !== null) params.jeonseMax = this.filters.jeonseMax;
    if (this.filters.monthlyDepositMin !== null) params.monthlyDepositMin = this.filters.monthlyDepositMin;
    if (this.filters.monthlyDepositMax !== null) params.monthlyDepositMax = this.filters.monthlyDepositMax;
    if (this.filters.monthlyRentMin !== null) params.monthlyRentMin = this.filters.monthlyRentMin;
    if (this.filters.monthlyRentMax !== null) params.monthlyRentMax = this.filters.monthlyRentMax;

    if (this.filters.buildYearMin !== null) params.buildYearMin = this.filters.buildYearMin;
    if (this.filters.buildYearMax !== null) params.buildYearMax = this.filters.buildYearMax;

    return params;
  }

  /**
   * 필터 적용 (매물 목록 필터링)
   * @param {Array} properties - 매물 목록
   * @returns {Array} 필터링된 매물 목록
   */
  applyFilters(properties) {
    if (!Array.isArray(properties)) {
      return [];
    }

    let filtered = [...properties];

    // 주거형태 필터
    if (this.filters.houseTypes.size > 0) {
      const houseTypeCodes = Array.from(this.filters.houseTypes)
        .map(this._mapHouseTypeToCode.bind(this));
      filtered = filtered.filter(p => houseTypeCodes.includes(p.houseType));
    }

    // 거래방식 필터
    if (this.filters.offerTypes.size > 0) {
      const offerTypeCodes = Array.from(this.filters.offerTypes)
        .map(this._mapOfferTypeToCode.bind(this));
      filtered = filtered.filter(p => offerTypeCodes.includes(p.offerType));
    }

    // 면적 필터
    if (this.filters.areaMin !== null || this.filters.areaMax !== null) {
      filtered = filtered.filter(p => {
        const area = Number(p.area);
        if (!Number.isFinite(area)) return false;
        if (this.filters.areaMin !== null && area < this.filters.areaMin) return false;
        if (this.filters.areaMax !== null && area > this.filters.areaMax) return false;
        return true;
      });
    }

    // 층수 필터
    if (this.filters.floorMin !== null || this.filters.floorMax !== null) {
      filtered = filtered.filter(p => {
        const floor = Number(p.floor);
        if (!Number.isFinite(floor)) return false;
        if (this.filters.floorMin !== null && floor < this.filters.floorMin) return false;
        if (this.filters.floorMax !== null && floor > this.filters.floorMax) return false;
        return true;
      });
    }

    // 옵션 필터 (간단한 구현 - 실제로는 비트마스크 비교 필요)
    if (this.filters.options.size > 0) {
      filtered = filtered.filter(p => {
        // 매물의 옵션 정보가 있다고 가정
        if (!p.options || !Array.isArray(p.options)) return false;

        // 선택된 모든 옵션이 매물에 있는지 확인
        return Array.from(this.filters.options).every(option =>
          p.options.includes(option)
        );
      });
    }

    this._triggerCallbacks('onApply');
    return filtered;
  }

  /**
   * 필터 초기화
   */
  resetFilters() {
    this.filters.houseTypes.clear();
    this.filters.offerTypes.clear();
    this.filters.options.clear();
    this.filters.areaMin = null;
    this.filters.areaMax = null;
    this.filters.floorMin = null;
    this.filters.floorMax = null;
    this.filters.buyMin = null;
    this.filters.buyMax = null;
    this.filters.jeonseMin = null;
    this.filters.jeonseMax = null;
    this.filters.monthlyDepositMin = null;
    this.filters.monthlyDepositMax = null;
    this.filters.monthlyRentMin = null;
    this.filters.monthlyRentMax = null;
    this.filters.buildYearMin = null;
    this.filters.buildYearMax = null;

    this._triggerCallbacks('onReset');
    this._triggerCallbacks('onChange');
  }

  /**
   * 이벤트 리스너 추가
   * @param {string} event - 이벤트 이름 ('change' | 'apply' | 'reset')
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
   * 필터 개수 반환
   * @returns {number}
   */
  getFilterCount() {
    let count = 0;
    count += this.filters.houseTypes.size;
    count += this.filters.offerTypes.size;
    count += this.filters.options.size;
    if (this.filters.areaMin !== null || this.filters.areaMax !== null) count++;
    if (this.filters.floorMin !== null || this.filters.floorMax !== null) count++;
    if (this.filters.buildYearMin !== null || this.filters.buildYearMax !== null) count++;
    return count;
  }

  /**
   * 필터가 비어있는지 확인
   * @returns {boolean}
   */
  isEmpty() {
    return this.getFilterCount() === 0;
  }

  /**
   * 주거형태 라벨을 코드로 변환
   * @private
   */
  _mapHouseTypeToCode(label) {
    const map = {
      '아파트': 'APART',
      '빌라': 'BILLA',
      '원/투룸': 'ONE'
    };
    return map[label] || null;
  }

  /**
   * 거래방식 라벨을 코드로 변환
   * @private
   */
  _mapOfferTypeToCode(label) {
    const map = {
      '매매': 'SALE',
      '전세': 'JEONSE',
      '월세': 'WOLSE'
    };
    return map[label] || null;
  }

  /**
   * 옵션 비트마스크 생성
   * @private
   */
  _buildOptionBitString() {
    const bits = Array(this.OPTION_ORDER.length).fill('0');
    for (const option of this.filters.options) {
      const index = this.OPTION_ORDER.indexOf(option);
      if (index >= 0) {
        bits[index] = '1';
      }
    }
    return bits.join('');
  }

  /**
   * 콜백 실행
   * @private
   */
  _triggerCallbacks(eventName) {
    const callbacks = this.callbacks[eventName] || [];
    const filters = this.getActiveFilters();

    for (const callback of callbacks) {
      if (typeof callback === 'function') {
        callback(filters);
      }
    }
  }
}
