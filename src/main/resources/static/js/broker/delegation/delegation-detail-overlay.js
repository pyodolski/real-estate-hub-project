/**
 * 위임 요청 상세정보 오버레이 패널 렌더링 및 관리
 * A/B 더블버퍼 방식으로 구성
 */

const DelegationDetailOverlay = {
  /**
   * 단일 오버레이 패널 HTML 생성
   * @param {string} suffix - 패널 구분자 ('a' 또는 'b')
   */
  renderSingleOverlay(suffix) {
    return `
      <div
        id="delegation-detail-overlay-${suffix}"
        class="absolute top-0 left-[450px] w-[450px] h-full bg-white shadow-2xl z-10 transform -translate-x-full transition-transform duration-300 ease-in-out flex flex-col"
        style="opacity: 0; pointer-events: none"
      >
        <div
          class="flex items-center justify-between p-6 border-b border-gray-200 bg-white"
        >
          <h2 class="text-2xl font-bold text-gray-800">위임 요청 상세</h2>
          <button
            id="close-delegation-detail-${suffix}"
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
          <div class="p-6 space-y-6">
            <!-- 상태 배지 -->
            <div class="flex items-center justify-between">
              <span
                id="delegation-status-badge-${suffix}"
                class="px-3 py-1 rounded-full text-sm font-semibold"
              ></span>
            </div>

            <!-- 매물 정보 섹션 -->
            <div class="bg-gray-50 p-4 rounded-lg">
              <h3 class="font-semibold text-gray-800 mb-3 flex items-center">
                <svg class="mr-2 h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                </svg>
                매물 정보
              </h3>
              <div class="space-y-2 text-sm">
                <div>
                  <span class="text-gray-600 block mb-1">매물명:</span>
                  <span id="delegation-property-title-${suffix}" class="text-gray-900 font-medium block"></span>
                </div>
                <div>
                  <span class="text-gray-600 block mb-1">주소:</span>
                  <span id="delegation-property-address-${suffix}" class="text-gray-900 block"></span>
                </div>
              </div>
            </div>

            <!-- 의뢰인 정보 섹션 -->
            <div class="bg-gray-50 p-4 rounded-lg">
              <h3 class="font-semibold text-gray-800 mb-3 flex items-center">
                <svg class="mr-2 h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
                의뢰인 정보
              </h3>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600">이름:</span>
                  <span id="delegation-owner-name-${suffix}" class="text-gray-900 font-medium"></span>
                </div>
              </div>
            </div>

            <!-- 매물 상세 정보 섹션 -->
            <div id="delegation-offer-container-${suffix}" class="bg-gray-50 p-4 rounded-lg">
              <h3 class="font-semibold text-gray-800 mb-3 flex items-center">
                <svg class="mr-2 h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                매물 상세
              </h3>
              <div class="space-y-3 text-sm">
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <span class="text-gray-600 block mb-1">거래 유형:</span>
                    <span id="delegation-offer-type-${suffix}" class="text-gray-900 font-medium"></span>
                  </div>
                  <div>
                    <span class="text-gray-600 block mb-1">주거 형태:</span>
                    <span id="delegation-offer-housetype-${suffix}" class="text-gray-900 font-medium"></span>
                  </div>
                </div>
                
                <div>
                  <span class="text-gray-600 block mb-1">층수:</span>
                  <span id="delegation-offer-floor-${suffix}" class="text-gray-900"></span>
                </div>

                <!-- 가격 정보 (동적 표시) -->
                <div id="delegation-price-sale-${suffix}" style="display: none;">
                  <span class="text-gray-600 block mb-1">매매가:</span>
                  <span id="delegation-total-price-${suffix}" class="text-gray-900 font-bold text-lg"></span>
                </div>

                <div id="delegation-price-jeonse-${suffix}" style="display: none;">
                  <span class="text-gray-600 block mb-1">전세 보증금:</span>
                  <span id="delegation-deposit-jeonse-${suffix}" class="text-gray-900 font-bold text-lg"></span>
                </div>

                <div id="delegation-price-wolse-${suffix}" style="display: none;">
                  <div class="mb-2">
                    <span class="text-gray-600 block mb-1">보증금:</span>
                    <span id="delegation-deposit-wolse-${suffix}" class="text-gray-900 font-medium"></span>
                  </div>
                  <div>
                    <span class="text-gray-600 block mb-1">월세:</span>
                    <span id="delegation-monthly-rent-${suffix}" class="text-gray-900 font-bold text-lg"></span>
                  </div>
                </div>

                <div>
                  <span class="text-gray-600 block mb-1">관리비:</span>
                  <span id="delegation-maintenance-fee-${suffix}" class="text-gray-900"></span>
                </div>

                <div id="delegation-negotiable-container-${suffix}">
                  <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    협상 가능
                  </span>
                </div>

                <div id="delegation-available-from-container-${suffix}">
                  <span class="text-gray-600 block mb-1">입주 가능일:</span>
                  <span id="delegation-available-from-${suffix}" class="text-gray-900"></span>
                </div>

                <div id="delegation-options-container-${suffix}">
                  <span class="text-gray-600 block mb-2">옵션:</span>
                  <div id="delegation-options-list-${suffix}" class="flex flex-wrap gap-1"></div>
                </div>
              </div>
            </div>

            <!-- 거절 사유 섹션 -->
            <div id="delegation-reject-reason-container-${suffix}" class="bg-red-50 p-4 rounded-lg border border-red-200" style="display: none;">
              <h3 class="font-semibold text-red-800 mb-3 flex items-center">
                <svg class="mr-2 h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                거절 사유
              </h3>
              <p id="delegation-reject-reason-${suffix}" class="text-sm text-red-700 leading-relaxed"></p>
            </div>
          </div>
        </div>

        <!-- 하단 버튼 영역 -->
        <div id="delegation-actions-${suffix}" class="border-t border-gray-200 p-4 bg-white">
          <div class="flex gap-3">
            <button
              id="reject-delegation-btn-${suffix}"
              class="flex-1 px-4 py-3 text-sm font-medium bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
              거절
            </button>
            <button
              id="approve-delegation-btn-${suffix}"
              class="flex-1 px-4 py-3 text-sm font-medium bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              승인
            </button>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * 양쪽 오버레이 패널 HTML 생성
   */
  render() {
    return this.renderSingleOverlay("a") + this.renderSingleOverlay("b");
  },
};

