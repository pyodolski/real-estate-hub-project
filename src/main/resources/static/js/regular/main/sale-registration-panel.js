/**
 * 판매 매물 등록 패널 렌더링 및 관리
 */

const SaleRegistrationPanel = {
  /**
   * 판매 매물 등록 패널 HTML을 생성하여 반환
   */
  render() {
    const panelHTML = `
      <!-- =================================================================== -->
      <!-- 판매 매물 등록 패널                                                   -->
      <!-- =================================================================== -->
      <div
        id="sale-registration-panel"
        class="absolute inset-0 bg-white flex flex-col h-full z-10 transform translate-x-full transition-transform duration-300 ease-in-out overflow-hidden p-6"
        style="display: none;"
      >
        <!-- 판매 매물 등록 패널 헤더 -->
        <div class="flex justify-between items-center mb-4 pb-4 border-b flex-shrink-0">
          <h2 class="text-xl font-bold text-gray-800">판매 매물 등록</h2>
          <button
            onclick="propertyManagement.hideSaleRegistrationPanel()"
            class="p-2 rounded-full hover:bg-gray-200 transition-colors"
            title="판매 매물 등록 패널 닫기"
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

        <!-- 거래 방식 선택 탭 -->
        <div class="mb-6 flex-shrink-0">
          <div class="flex border-b border-gray-200">
            <button
              id="sale-tab"
              class="flex-1 px-4 py-2 text-center border-b-2 border-blue-500 text-blue-600 font-medium"
              onclick="propertyManagement.switchTransactionType('SALE')"
            >
              매매
            </button>
            <button
              id="jeonse-tab"
              class="flex-1 px-4 py-2 text-center border-b-2 border-transparent text-gray-500 hover:text-gray-700"
              onclick="propertyManagement.switchTransactionType('JEONSE')"
            >
              전세
            </button>
            <button
              id="wolse-tab"
              class="flex-1 px-4 py-2 text-center border-b-2 border-transparent text-gray-500 hover:text-gray-700"
              onclick="propertyManagement.switchTransactionType('WOLSE')"
            >
              월세
            </button>
          </div>
        </div>

        <!-- 스크롤 가능한 폼 영역 -->
        <div class="flex-grow overflow-y-auto custom-scrollbar pr-2 -mr-2" style="max-height: calc(100% - 200px);">
          <form id="sale-registration-form" class="space-y-4 pb-4">
            <!-- 주거형태 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">주거형태</label>
              <select
                id="housetype"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="APART">아파트</option>
                <option value="BILLA">빌라</option>
                <option value="ONE">원룸</option>
              </select>
            </div>

            <!-- 층수 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">층수</label>
              <input
                type="number"
                id="floor"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
                step="1"
                required
              />
            </div>

            <!-- 가격 입력 (거래 방식별 동적) -->
            <div id="price-section">
              <!-- 매매 -->
              <div id="sale-price" class="price-input">
                <label class="block text-sm font-medium text-gray-700 mb-2">총 가격 (만원)</label>
                <input
                  type="number"
                  id="totalPrice"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  step="1"
                />
              </div>

              <!-- 전세/월세 -->
              <div id="jeonse-wolse-price" class="price-input" style="display: none;">
                <div class="mb-4">
                  <label class="block text-sm font-medium text-gray-700 mb-2">보증금 (만원)</label>
                  <input
                    type="number"
                    id="deposit"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="1"
                  />
                </div>

                <div id="monthly-rent-section" style="display: none;">
                  <label class="block text-sm font-medium text-gray-700 mb-2">월세 (만원)</label>
                  <input
                    type="number"
                    id="monthlyRent"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="1"
                  />
                </div>
              </div>
            </div>

            <!-- 관리비 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">관리비 (만원)</label>
              <input
                type="number"
                id="maintenanceFee"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                step="0.1"
                value="0"
              />
            </div>

            <!-- 옵션 선택 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">옵션</label>
              <div class="grid grid-cols-2 gap-2">
                <label class="flex items-center">
                  <input type="checkbox" class="option-checkbox mr-2" data-index="0" />
                  <span class="text-sm">에어컨</span>
                </label>
                <label class="flex items-center">
                  <input type="checkbox" class="option-checkbox mr-2" data-index="1" />
                  <span class="text-sm">냉장고</span>
                </label>
                <label class="flex items-center">
                  <input type="checkbox" class="option-checkbox mr-2" data-index="2" />
                  <span class="text-sm">세탁기</span>
                </label>
                <label class="flex items-center">
                  <input type="checkbox" class="option-checkbox mr-2" data-index="3" />
                  <span class="text-sm">TV</span>
                </label>
                <label class="flex items-center">
                  <input type="checkbox" class="option-checkbox mr-2" data-index="4" />
                  <span class="text-sm">인터넷</span>
                </label>
                <label class="flex items-center">
                  <input type="checkbox" class="option-checkbox mr-2" data-index="5" />
                  <span class="text-sm">침대</span>
                </label>
                <label class="flex items-center">
                  <input type="checkbox" class="option-checkbox mr-2" data-index="6" />
                  <span class="text-sm">책상</span>
                </label>
                <label class="flex items-center">
                  <input type="checkbox" class="option-checkbox mr-2" data-index="7" />
                  <span class="text-sm">옷장</span>
                </label>
                <label class="flex items-center">
                  <input type="checkbox" class="option-checkbox mr-2" data-index="8" />
                  <span class="text-sm">신발장</span>
                </label>
                <label class="flex items-center">
                  <input type="checkbox" class="option-checkbox mr-2" data-index="9" />
                  <span class="text-sm">전자레인지</span>
                </label>
              </div>
            </div>

            <!-- 입주 가능일 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">입주 가능일</label>
              <input
                type="date"
                id="availableFrom"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <!-- 체크박스 옵션들 -->
            <div class="space-y-2">
              <label class="flex items-center">
                <input type="checkbox" id="negotiable" class="mr-2" />
                <span class="text-sm">협상 가능</span>
              </label>
              <label class="flex items-center">
                <input type="checkbox" id="isActive" class="mr-2" checked />
                <span class="text-sm">즉시 활성화</span>
              </label>
            </div>

            <!-- 매물 이미지 업로드 -->
            <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">매물 이미지 업로드</label>
                <input type="file" id="sale-property-images" multiple accept="image/*"
                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                       onchange="propertyManagement.handleSaleImageSelect(this)">
                <p class="mt-1 text-xs text-gray-500">jpg, png, jpeg 형식의 이미지를 선택해주세요.</p>
                <div id="sale-image-preview-area" class="grid grid-cols-4 gap-2 mt-2">
                    <!-- 이미지 미리보기 영역 -->
                </div>
            </div>

            <!-- 중개인 선택 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">중개인 선택</label>
              <select
                id="brokerSelect"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">중개인을 선택하세요</option>
                <!-- JavaScript로 중개인 목록이 여기에 추가됩니다 -->
              </select>
            </div>

            <!-- 선택된 중개인 정보 미리보기 -->
            <div id="broker-preview" class="hidden">
              <div class="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <h4 class="font-medium text-gray-800 mb-2">선택된 중개인</h4>
                <div id="broker-info" class="text-sm text-gray-600">
                  <!-- JavaScript로 중개인 정보가 여기에 표시됩니다 -->
                </div>
              </div>
            </div>
          </form>
        </div>

        <!-- 하단 버튼 영역 -->
        <div class="flex gap-3 pt-4 mt-4 border-t flex-shrink-0">
          <button
            type="button"
            onclick="propertyManagement.hideSaleRegistrationPanel()"
            class="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            취소
          </button>
          <button
            type="button"
            onclick="propertyManagement.submitSaleRequest()"
            class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            등록 요청
          </button>
        </div>
      </div>
    `;

    return panelHTML;
  },

  /**
   * 패널을 DOM에 삽입
   */
  init() {
    const panelHTML = this.render();

    // 기존 패널이 있으면 제거
    const existingPanel = document.getElementById("sale-registration-panel");
    if (existingPanel) {
      existingPanel.remove();
    }

    // 내 매물 관리 패널 내부에 추가
    const myPropertyPanel = document.getElementById("my-property-panel");
    if (myPropertyPanel) {
      myPropertyPanel.insertAdjacentHTML("beforeend", panelHTML);
      console.log("[SaleRegistrationPanel] Panel initialized successfully");
      return true;
    } else {
      console.warn(
        "[SaleRegistrationPanel] my-property-panel을 찾을 수 없습니다."
      );
      return false;
    }
  },

  /**
   * DOM 요소 존재 확인 및 대기
   * @param {string} elementId - 확인할 요소의 ID
   * @param {number} timeout - 최대 대기 시간 (밀리초)
   * @param {number} interval - 확인 간격 (밀리초)
   * @returns {Promise<HTMLElement|null>} 요소를 찾으면 반환, 타임아웃 시 null
   */
  waitForElement(elementId, timeout = 5000, interval = 100) {
    return new Promise((resolve) => {
      const startTime = Date.now();

      const checkElement = () => {
        const element = document.getElementById(elementId);

        if (element) {
          console.log(`[SaleRegistrationPanel] Element found: ${elementId}`);
          resolve(element);
          return;
        }

        const elapsedTime = Date.now() - startTime;
        if (elapsedTime >= timeout) {
          console.warn(
            `[SaleRegistrationPanel] Timeout waiting for element: ${elementId}`
          );
          resolve(null);
          return;
        }

        setTimeout(checkElement, interval);
      };

      checkElement();
    });
  },

  /**
   * 재시도 메커니즘을 포함한 초기화
   * @param {number} maxRetries - 최대 재시도 횟수
   * @param {number} retryDelay - 재시도 간격 (밀리초)
   * @returns {Promise<boolean>} 초기화 성공 여부
   */
  async initWithRetry(maxRetries = 3, retryDelay = 1000) {
    console.log(
      "[SaleRegistrationPanel] Starting initialization with retry mechanism"
    );

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      console.log(
        `[SaleRegistrationPanel] Initialization attempt ${attempt}/${maxRetries}`
      );

      // my-property-panel 요소가 생성될 때까지 대기
      const myPropertyPanel = await this.waitForElement(
        "my-property-panel",
        2000
      );

      if (myPropertyPanel) {
        // 요소를 찾았으면 초기화 시도
        const success = this.init();
        if (success) {
          console.log("[SaleRegistrationPanel] Initialization successful");
          return true;
        }
      }

      // 마지막 시도가 아니면 대기 후 재시도
      if (attempt < maxRetries) {
        console.log(`[SaleRegistrationPanel] Retrying in ${retryDelay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      }
    }

    console.error(
      "[SaleRegistrationPanel] Initialization failed after all retries"
    );
    return false;
  },

  /**
   * 강제 초기화 (디버깅 및 수동 호출용)
   * my-property-panel이 없어도 경고만 표시하고 계속 진행
   */
  forceInit() {
    console.log("[SaleRegistrationPanel] Force initialization");

    const panelHTML = this.render();

    // 기존 패널이 있으면 제거
    const existingPanel = document.getElementById("sale-registration-panel");
    if (existingPanel) {
      existingPanel.remove();
    }

    // 내 매물 관리 패널 내부에 추가 시도
    const myPropertyPanel = document.getElementById("my-property-panel");
    if (myPropertyPanel) {
      myPropertyPanel.insertAdjacentHTML("beforeend", panelHTML);
      console.log("[SaleRegistrationPanel] Force init successful");
      return true;
    } else {
      console.error(
        "[SaleRegistrationPanel] Cannot force init - my-property-panel not found"
      );
      console.error(
        "[SaleRegistrationPanel] Please ensure the my-property-panel element exists in the DOM"
      );
      return false;
    }
  },

  /**
   * 패널 표시
   */
  show() {
    const panel = document.getElementById("sale-registration-panel");
    if (panel) {
      panel.style.display = "flex";
      panel.classList.remove("translate-x-full");
      console.log("[SaleRegistrationPanel] Panel shown");
    }
  },

  /**
   * 패널 숨김
   */
  hide() {
    const panel = document.getElementById("sale-registration-panel");
    if (panel) {
      panel.classList.add("translate-x-full");
      setTimeout(() => {
        panel.style.display = "none";
      }, 300); // 애니메이션 시간

      // 폼 및 마커 초기화


      console.log("[SaleRegistrationPanel] Panel hidden");
    }
  },
};

// DOM 로드 완료 후 패널 초기화 (재시도 메커니즘 포함)
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    SaleRegistrationPanel.initWithRetry();
  });
} else {
  // 이미 DOM이 로드된 경우
  SaleRegistrationPanel.initWithRetry();
}

// 전역 접근을 위해 window 객체에 등록
window.SaleRegistrationPanel = SaleRegistrationPanel;
