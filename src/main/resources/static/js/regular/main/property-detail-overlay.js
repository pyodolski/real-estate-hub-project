/**
 * 매물 상세정보 오버레이 패널 렌더링 및 관리
 * A/B 더블버퍼 방식으로 구성
 */

const PropertyDetailOverlay = {
  /**
   * 단일 오버레이 패널 HTML 생성
   * @param {string} suffix - 패널 구분자 ('a' 또는 'b')
   */
  renderSingleOverlay(suffix) {
    return `
      <div
        id="property-detail-overlay-${suffix}"
        class="absolute top-0 left-[450px] w-[450px] h-full bg-white shadow-2xl z-10 transform -translate-x-full transition-transform duration-300 ease-in-out flex flex-col"
        style="opacity: 0; pointer-events: none"
      >
        <div
          class="flex items-center justify-between p-6 border-b border-gray-200 bg-white"
        >
          <h2 class="text-2xl font-bold text-gray-800">매물 상세 정보</h2>
          <button
            id="close-property-detail-${suffix}"
            class="p-2 rounded-full hover:bg-gray-200 transition-colors"
            title="닫기"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div class="flex-1 overflow-y-auto custom-scrollbar">
          <div class="relative">
            <img
              id="detail-property-image-${suffix}"
              src=""
              alt="매물 이미지"
              class="w-full h-64 object-cover"
            />
            <div class="absolute top-4 right-4">
              <span
                id="detail-property-status-${suffix}"
                class="px-3 py-1 rounded-full text-sm font-semibold"
              ></span>
            </div>
          </div>
          <div class="p-6 space-y-6">
            <div>
              <div class="flex items-center justify-between mb-2">
                <h3
                  id="detail-property-title-${suffix}"
                  class="text-2xl font-bold text-gray-800"
                ></h3>
                <button
                  id="favorite-button-${suffix}"
                  class="bg-white/70 p-1.5 rounded-full hover:bg-white"
                  aria-label="관심 매물"
                  aria-pressed="false"
                >
                  <svg
                    id="favorite-icon-${suffix}"
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="text-gray-600"
                  >
                    <path
                      d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
                    ></path>
                  </svg>
                </button>
              </div>
              <p id="detail-property-location-${suffix}" class="text-gray-600 mb-4"></p>
              <p
                id="detail-property-price-${suffix}"
                class="text-3xl font-bold text-blue-600 mb-4"
              ></p>
              <p id="detail-property-details-${suffix}" class="text-gray-700"></p>
            </div>
            <!-- 추가 정보 그리드 -->
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-gray-50 p-4 rounded-lg">
                <h4 class="font-semibold text-gray-800 mb-2">준공년도</h4>
                <p id="detail-building-year-${suffix}" class="text-gray-600"></p>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg">
                <h4 class="font-semibold text-gray-800 mb-2">면적</h4>
                <p id="detail-property-area-${suffix}" class="text-gray-600"></p>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg">
                <h4 class="font-semibold text-gray-800 mb-2">방수/욕실수</h4>
                <p id="detail-room-bath-${suffix}" class="text-gray-600"></p>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg">
                <h4 class="font-semibold text-gray-800 mb-2">방향</h4>
                <p id="detail-direction-${suffix}" class="text-gray-600"></p>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg">
                <h4 class="font-semibold text-gray-800 mb-2">방구조</h4>
                <p id="detail-room-structure-${suffix}" class="text-gray-600"></p>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg">
                <h4 class="font-semibold text-gray-800 mb-2">복층</h4>
                <p id="detail-duplex-${suffix}" class="text-gray-600"></p>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg">
                <h4 class="font-semibold text-gray-800 mb-2">주차대수</h4>
                <p id="detail-parking-${suffix}" class="text-gray-600"></p>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg">
                <h4 class="font-semibold text-gray-800 mb-2">입주가능일</h4>
                <p id="detail-move-in-date-${suffix}" class="text-gray-600"></p>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg col-span-2">
                <h4 class="font-semibold text-gray-800 mb-2">관리비</h4>
                <p id="detail-maintenance-fee-${suffix}" class="text-gray-600"></p>
              </div>
            </div>
            <div>
              <h4 class="font-semibold text-gray-800 mb-3">옵션</h4>
              <div
                id="detail-property-options-${suffix}"
                class="flex flex-wrap gap-2"
              ></div>
            </div>
            <div>
              <h4 class="font-semibold text-gray-800 mb-3">매물 설명</h4>
              <p
                id="detail-property-description-${suffix}"
                class="text-gray-700 leading-relaxed"
              ></p>
            </div>
            <!-- 평면도/지도/중개사 -->
            <div
              id="detail-floorplan-wrapper-${suffix}"
              class="mb-6"
              style="display: none"
            >
              <div
                id="detail-floorplan-placeholder-${suffix}"
                class="w-full h-64 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-500"
              >
                평면도 영역 (임시)
              </div>
            </div>
            <div class="mb-6">
              <div
                id="detail-map-placeholder-${suffix}"
                class="w-full h-72 rounded-lg border border-gray-200 bg-gray-100 overflow-hidden"
              >
              </div>
            </div>
            <div
              class="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-center justify-between"
            >
              <div>
                <p
                  id="detail-broker-name-${suffix}"
                  class="font-medium text-gray-800"
                ></p>
                <p id="detail-broker-phone-${suffix}" class="text-gray-600 text-sm"></p>
              </div>
              <button
                class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                연락하기
              </button>
            </div>
            <div class="flex gap-4 pt-2">
              <button
                class="flex-1 h-11 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700"
              >
                관심매물 등록
              </button>
              <button
                class="flex-1 h-11 rounded-md bg-gray-100 text-gray-700 font-medium hover:bg-gray-200"
              >
                매물 비교
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * 전체 오버레이 패널 HTML 생성 (A/B 더블버퍼)
   */
  render() {
    return `
      <!-- =================================================================== -->
      <!-- 매물 상세 오버레이 패널 (A/B 더블버퍼)                                 -->
      <!-- =================================================================== -->
      ${this.renderSingleOverlay('a')}

      ${this.renderSingleOverlay('b')}
    `;
  },

  /**
   * 패널을 DOM에 삽입
   */
  init() {
    const overlaysHTML = this.render();

    // 기존 오버레이가 있으면 제거
    const existingOverlayA = document.getElementById('property-detail-overlay-a');
    const existingOverlayB = document.getElementById('property-detail-overlay-b');

    if (existingOverlayA) {
      existingOverlayA.remove();
    }
    if (existingOverlayB) {
      existingOverlayB.remove();
    }

    // 왼쪽 매물 정보 패널 다음에 삽입
    const sidePanel = document.getElementById('side-panel');
    if (sidePanel) {
      sidePanel.insertAdjacentHTML('afterend', overlaysHTML);
    } else {
      // side-panel이 없으면 body에 추가
      document.body.insertAdjacentHTML('beforeend', overlaysHTML);
    }
  }
};

// DOM 로드 완료 후 패널 초기화
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    PropertyDetailOverlay.init();
  });
} else {
  PropertyDetailOverlay.init();
}
