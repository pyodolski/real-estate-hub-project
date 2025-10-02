/**
 * PropertyDetail - 중개인용 매물 상세 정보 표시 모듈
 * 매물 클릭 시 상세 정보를 패널에 표시
 */

import { PropertyService } from '../../shared/services/property-service.js';

export class PropertyDetail {
  /**
   * @param {PanelController} panelController - 패널 컨트롤러
   */
  constructor(panelController) {
    this.panelController = panelController;
    this.propertyService = new PropertyService();

    this.currentPropertyId = null;
    this.currentProperty = null;

    this.callbacks = {
      onPropertyLoad: [],
      onPropertyClose: []
    };
  }

  /**
   * 매물 상세 정보 표시
   * @param {string|number} propertyId - 매물 ID
   */
  async showPropertyDetail(propertyId) {
    try {
      console.log('매물 상세 정보 조회:', propertyId);

      // 같은 매물을 다시 클릭하면 닫기
      if (this.currentPropertyId === propertyId) {
        this.hidePropertyDetail();
        return;
      }

      // 매물 상세 정보 조회
      const property = await this.propertyService.fetchPropertyDetail(propertyId);

      this.currentPropertyId = propertyId;
      this.currentProperty = property;

      // 패널에 상세 정보 렌더링
      this._renderPropertyDetail(property);

      // 콜백 실행
      this._triggerCallbacks('onPropertyLoad', property);

      console.log('매물 상세 정보 표시 완료:', property);
    } catch (error) {
      console.error('매물 상세 정보 조회 실패:', error);

      if (error.message === 'Unauthorized') {
        alert('로그인이 필요합니다. 다시 로그인해주세요.');
        window.location.href = '/loginX.html';
      } else {
        alert('매물 정보를 불러오는데 실패했습니다.');
      }

      this.currentPropertyId = null;
      this.currentProperty = null;
    }
  }

  /**
   * 매물 상세 정보 숨기기
   */
  hidePropertyDetail() {
    this.currentPropertyId = null;
    this.currentProperty = null;

    // 패널 닫기 또는 초기 콘텐츠로 복원
    // 여기서는 브로커 대시보드로 전환
    if (this.panelController) {
      this.panelController.closeAllPanels();
    }

    // 콜백 실행
    this._triggerCallbacks('onPropertyClose', null);

    console.log('매물 상세 정보 닫힘');
  }

  /**
   * 매물 상세 정보 렌더링
   * @private
   */
  _renderPropertyDetail(property) {
    if (!this.panelController) {
      console.warn('패널 컨트롤러가 없어 매물 상세 정보를 표시할 수 없습니다.');
      return;
    }

    // 브로커 대시보드 패널에 상세 정보 표시
    const detailHTML = this._buildPropertyDetailHTML(property);
    this.panelController.updatePanelContent('broker-dashboard', detailHTML);
    this.panelController.showPanel('broker-dashboard');
  }

  /**
   * 매물 상세 정보 HTML 생성
   * @private
   */
  _buildPropertyDetailHTML(property) {
    const images = property.images && property.images.length > 0
      ? property.images
      : ['/images/placeholder.jpg'];

    const mainImage = images[0];

    return `
      <div class="property-detail-container">
        <!-- 매물 이미지 -->
        <div class="mb-4">
          <img
            src="${mainImage}"
            alt="${property.title || '매물 이미지'}"
            class="w-full h-48 object-cover rounded-lg shadow"
            onerror="this.src='/images/placeholder.jpg'"
          />
        </div>

        <!-- 매물 기본 정보 -->
        <div class="mb-4">
          <h3 class="text-lg font-bold text-gray-800 mb-2">${property.title || '제목 없음'}</h3>
          <p class="text-sm text-gray-600 mb-1">
            <svg class="inline w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            ${property.address || '주소 정보 없음'}
          </p>
        </div>

        <!-- 가격 정보 -->
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600">거래 방식</span>
            <span class="font-semibold text-gray-800">${this._formatOfferType(property.offerType)}</span>
          </div>
          <div class="flex justify-between items-center mt-2">
            <span class="text-sm text-gray-600">가격</span>
            <span class="text-lg font-bold text-blue-600">${this._formatPrice(property)}</span>
          </div>
        </div>

        <!-- 매물 상세 -->
        <div class="grid grid-cols-2 gap-3 mb-4">
          <div class="bg-gray-50 rounded p-2">
            <p class="text-xs text-gray-600">면적</p>
            <p class="text-sm font-semibold">${property.area || '-'}m²</p>
          </div>
          <div class="bg-gray-50 rounded p-2">
            <p class="text-xs text-gray-600">층수</p>
            <p class="text-sm font-semibold">${property.floor || '-'}층</p>
          </div>
          <div class="bg-gray-50 rounded p-2">
            <p class="text-xs text-gray-600">주거 형태</p>
            <p class="text-sm font-semibold">${this._formatHouseType(property.houseType)}</p>
          </div>
          <div class="bg-gray-50 rounded p-2">
            <p class="text-xs text-gray-600">방향</p>
            <p class="text-sm font-semibold">${property.direction || '-'}</p>
          </div>
        </div>

        <!-- 설명 -->
        ${property.description ? `
        <div class="mb-4">
          <h4 class="text-sm font-semibold text-gray-800 mb-2">매물 설명</h4>
          <p class="text-sm text-gray-600 leading-relaxed">${property.description}</p>
        </div>
        ` : ''}

        <!-- 중개인 액션 버튼 -->
        <div class="flex gap-2 mt-4">
          <button
            onclick="window.intermediaryController?.handleEditProperty(${property.id})"
            class="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded transition-colors"
          >
            수정
          </button>
          <button
            onclick="window.intermediaryController?.handleContactOwner(${property.id})"
            class="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-4 rounded transition-colors"
          >
            소유주 연락
          </button>
        </div>

        <!-- 닫기 버튼 -->
        <button
          onclick="window.intermediaryController?.propertyDetail?.hidePropertyDetail()"
          class="w-full mt-3 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium py-2 px-4 rounded transition-colors"
        >
          닫기
        </button>
      </div>
    `;
  }

  /**
   * 거래 방식 포맷
   * @private
   */
  _formatOfferType(offerType) {
    const offerTypeMap = {
      'SALE': '매매',
      'JEONSE': '전세',
      'WOLSE': '월세'
    };
    return offerTypeMap[offerType] || offerType || '-';
  }

  /**
   * 주거 형태 포맷
   * @private
   */
  _formatHouseType(houseType) {
    const houseTypeMap = {
      'APART': '아파트',
      'BILLA': '빌라',
      'ONE': '원/투룸'
    };
    return houseTypeMap[houseType] || houseType || '-';
  }

  /**
   * 가격 포맷
   * @private
   */
  _formatPrice(property) {
    const offerType = property.offerType;

    if (offerType === 'SALE') {
      const price = property.salePrice || property.price || 0;
      return `${(price / 10000).toFixed(0)}억원`;
    } else if (offerType === 'JEONSE') {
      const deposit = property.jeonseDeposit || property.deposit || 0;
      return `${(deposit / 10000).toFixed(0)}억원`;
    } else if (offerType === 'WOLSE') {
      const deposit = property.wolseDeposit || property.deposit || 0;
      const monthlyRent = property.monthlyRent || 0;
      return `${(deposit / 10000).toFixed(0)}억 / ${monthlyRent}만원`;
    }

    return '-';
  }

  /**
   * 현재 표시 중인 매물 ID 가져오기
   * @returns {string|number|null}
   */
  getCurrentPropertyId() {
    return this.currentPropertyId;
  }

  /**
   * 현재 표시 중인 매물 정보 가져오기
   * @returns {Object|null}
   */
  getCurrentProperty() {
    return this.currentProperty;
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
   * 리소스 정리
   */
  destroy() {
    this.currentPropertyId = null;
    this.currentProperty = null;
    this.callbacks = {
      onPropertyLoad: [],
      onPropertyClose: []
    };
  }
}
