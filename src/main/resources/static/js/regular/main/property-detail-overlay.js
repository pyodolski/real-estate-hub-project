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
        <div class="flex-1 overflow-y-scroll custom-scrollbar">
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
            <!-- 고정 헤더 영역 -->
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

            <!-- 탭 네비게이션 -->
            <div class="flex border-b border-gray-200 mb-4">
                <button id="tab-detail-${suffix}" class="flex-1 py-2 text-blue-600 border-b-2 border-blue-600 font-medium transition-colors" onclick="window.switchDetailTab('${suffix}', 'detail')">상세정보</button>
                <button id="tab-prediction-${suffix}" class="flex-1 py-2 text-gray-500 hover:text-gray-700 font-medium transition-colors" onclick="window.switchDetailTab('${suffix}', 'prediction')">시세예측</button>
                <button id="tab-calculator-${suffix}" class="flex-1 py-2 text-gray-500 hover:text-gray-700 font-medium transition-colors" onclick="window.switchDetailTab('${suffix}', 'calculator')">계산기</button>
            </div>

            <!-- 동적 컨텐츠 영역 -->
            <div id="panel-content-area-${suffix}">
                <!-- 상세정보 컨텐츠 (기본) -->
                <div id="content-detail-${suffix}" class="space-y-6">
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
                    <div class="mb-6">
                      <div
                        id="detail-map-placeholder-${suffix}"
                        class="w-full h-72 rounded-lg border border-gray-200 bg-gray-100 overflow-hidden"
                      >
                      </div>
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
                        id="contact-broker-button-${suffix}"
                        class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        연락하기
                      </button>
                    </div>
                    <div class="flex gap-4 pt-2">
                      <button
                        id="favorite-register-button-${suffix}"
                        class="flex-1 h-11 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700"
                      >
                        관심매물 등록
                      </button>
                      <button
                        id="add-to-compare-button-${suffix}"
                        class="flex-1 h-11 rounded-md bg-gray-100 text-gray-700 font-medium hover:bg-gray-200"
                        onclick="window.addToCompareGroup('${suffix}')"
                      >
                        매물 비교
                      </button>
                    </div>
                </div>
                <!-- 예측 컨텐츠 (동적 로드) -->
                <div id="content-prediction-${suffix}" class="hidden h-full"></div>
                <!-- 계산기 컨텐츠 (동적 로드) -->
                <div id="content-calculator-${suffix}" class="hidden h-full"></div>
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
      ${this.renderSingleOverlay("a")}

      ${this.renderSingleOverlay("b")}
    `;
  },

  /**
   * 패널을 DOM에 삽입
   */
  init() {
    const overlaysHTML = this.render();

    // 기존 오버레이가 있으면 제거
    const existingOverlayA = document.getElementById(
      "property-detail-overlay-a"
    );
    const existingOverlayB = document.getElementById(
      "property-detail-overlay-b"
    );

    if (existingOverlayA) {
      existingOverlayA.remove();
    }
    if (existingOverlayB) {
      existingOverlayB.remove();
    }

    // 왼쪽 매물 정보 패널 다음에 삽입
    const sidePanel = document.getElementById("side-panel");
    if (sidePanel) {
      sidePanel.insertAdjacentHTML("afterend", overlaysHTML);
    } else {
      // side-panel이 없으면 body에 추가
      document.body.insertAdjacentHTML("beforeend", overlaysHTML);
    }
  },
};

// DOM 로드 완료 후 패널 초기화
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    PropertyDetailOverlay.init();
  });
} else {
  PropertyDetailOverlay.init();
}

// 시세 예측 로드 함수 (전역으로 노출)
window.loadPriceEstimation = async function (propertyId, suffix) {
  console.log(
    `[PropertyDetail] Loading price estimation for property: ${propertyId}`
  );

  const contentEl = document.getElementById(`content-prediction-${suffix}`);
  if (!contentEl) return;

  // 로딩 상태 표시
  contentEl.innerHTML = `
        <div class="flex flex-col items-center justify-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <div class="text-gray-500">시세 예측 중...</div>
        </div>
    `;

  try {
    const response = await fetch(
      `/api/properties/${propertyId}/price-estimation`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("시세 예측 API 호출 실패");
    }

    const data = await response.json();

    // API 응답 로그 출력
    console.log("[시세예측] API 응답:", data);

    // 시세 예측 결과 표시
    window.displayPriceEstimation(data, suffix);
  } catch (error) {
    console.error("시세 예측 오류:", error);
    contentEl.innerHTML = `
            <div class="flex flex-col items-center justify-center py-12">
                <div class="text-red-500 mb-4 text-4xl">⚠️</div>
                <div class="text-red-500 mb-2 font-medium">시세 예측 실패</div>
                <div class="text-gray-500 text-sm mb-4">데이터가 부족하거나 오류가 발생했습니다.</div>
                <button onclick="window.loadPriceEstimation(${propertyId}, '${suffix}')" 
                        class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                    다시 시도
                </button>
            </div>
        `;
  }
};

// 시세 예측 결과 표시 함수 (전역으로 노출)
window.displayPriceEstimation = function (data, suffix) {
  const contentEl = document.getElementById(`content-prediction-${suffix}`);
  if (!contentEl) return;

  const confidenceColor = window.getConfidenceColor(data.confidenceLevel);
  const confidenceBadge = window.getConfidenceBadge(data.confidenceLevel);

  contentEl.innerHTML = `
        <div class="space-y-4">
            <!-- 예측 시세 -->
            <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
                <div class="text-center">
                    <div class="text-sm text-gray-600 mb-2">예측 시세</div>
                    <div class="text-3xl font-bold text-blue-600 mb-2">
                        ${window.formatPrice(data.estimatedPrice)}
                    </div>
                    <div class="text-sm text-gray-600">
                        ${data.priceRange || ""}
                    </div>
                </div>
            </div>
            
            <!-- 신뢰도 및 참고 데이터 -->
            <div class="grid grid-cols-2 gap-4">
                <div class="bg-white border border-gray-200 rounded-lg p-4">
                    <div class="text-sm text-gray-500 mb-2">신뢰도</div>
                    <div class="flex items-center space-x-2">
                        <span class="${confidenceColor} px-2 py-1 rounded text-xs font-medium">
                            ${confidenceBadge}
                        </span>
                        <span class="text-lg font-semibold text-gray-700">
                            ${data.confidence.toFixed(1)}%
                        </span>
                    </div>
                </div>
                
                <div class="bg-white border border-gray-200 rounded-lg p-4">
                    <div class="text-sm text-gray-500 mb-2">참고 거래</div>
                    <div class="text-lg font-semibold text-gray-700">
                        ${data.sampleCount}건
                    </div>
                </div>
            </div>
            
            <!-- 주의사항 -->
            <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div class="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <span class="mr-2">📋</span>
                    주의사항
                </div>
                <ul class="space-y-1 text-xs text-gray-600">
                    <li class="flex items-start">
                        <span class="mr-2">•</span>
                        <span>실제 거래가는 시장 상황에 따라 달라질 수 있습니다.</span>
                    </li>
                    <li class="flex items-start">
                        <span class="mr-2">•</span>
                        <span>참고용 정보로만 활용하시기 바랍니다.</span>
                    </li>
                    <li class="flex items-start">
                        <span class="mr-2">•</span>
                        <span>정확한 시세는 전문가와 상담하시기 바랍니다.</span>
                    </li>
                </ul>
            </div>
        </div>
    `;
};

// 신뢰도에 따른 색상 반환 (전역으로 노출)
window.getConfidenceColor = function (level) {
  switch (level) {
    case "HIGH":
      return "bg-green-100 text-green-800";
    case "MEDIUM":
      return "bg-yellow-100 text-yellow-800";
    case "LOW":
      return "bg-orange-100 text-orange-800";
    case "VERY_LOW":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// 신뢰도 레벨 텍스트 반환 (전역으로 노출)
window.getConfidenceBadge = function (level) {
  switch (level) {
    case "HIGH":
      return "높음";
    case "MEDIUM":
      return "보통";
    case "LOW":
      return "낮음";
    case "VERY_LOW":
      return "매우 낮음";
    default:
      return "정보 없음";
  }
};

// 가격 포맷팅 함수 (전역으로 노출)
window.formatPrice = function (price) {
  if (!price || price === 0) return "정보 없음";

  const 억 = Math.floor(price / 100000000);
  const 만 = Math.floor((price % 100000000) / 10000);

  if (억 > 0 && 만 > 0) {
    return `${억.toLocaleString()}억 ${만.toLocaleString()}만원`;
  } else if (억 > 0) {
    return `${억.toLocaleString()}억원`;
  } else if (만 > 0) {
    return `${만.toLocaleString()}만원`;
  } else {
    return "정보 없음";
  }
};

// 탭 전환 함수 (전역으로 노출)
window.switchDetailTab = function (suffix, tabName) {
  console.log(
    `[PropertyDetail] Switching to tab: ${tabName} (suffix: ${suffix})`
  );

  // 모든 탭 버튼 스타일 초기화
  const tabs = ["detail", "prediction", "calculator"];
  tabs.forEach((tab) => {
    const tabBtn = document.getElementById(`tab-${tab}-${suffix}`);
    const contentEl = document.getElementById(`content-${tab}-${suffix}`);

    if (tabBtn) {
      if (tab === tabName) {
        // 활성 탭
        tabBtn.className =
          "flex-1 py-2 text-blue-600 border-b-2 border-blue-600 font-medium transition-colors";
      } else {
        // 비활성 탭
        tabBtn.className =
          "flex-1 py-2 text-gray-500 hover:text-gray-700 font-medium transition-colors";
      }
    }

    if (contentEl) {
      if (tab === tabName) {
        contentEl.classList.remove("hidden");
      } else {
        contentEl.classList.add("hidden");
      }
    }
  });

  // 시세예측 탭이면 데이터 로드
  if (tabName === "prediction") {
    const overlay = document.getElementById(
      `property-detail-overlay-${suffix}`
    );
    const propertyId = overlay?.dataset?.propertyId;

    console.log(
      `[PropertyDetail] Loading price estimation for propertyId: ${propertyId}`
    );

    if (propertyId) {
      window.loadPriceEstimation(propertyId, suffix);
    } else {
      console.error("[PropertyDetail] propertyId not found in overlay dataset");
    }
  }

  // 계산기 탭이면 계산기 패널 로드
  if (tabName === "calculator") {
    const contentEl = document.getElementById(`content-calculator-${suffix}`);
    if (contentEl && typeof CalculatorPanel !== "undefined") {
      contentEl.innerHTML = "";
      contentEl.appendChild(CalculatorPanel.getElement());
    }
  }
};

// 매물 비교 그룹 추가 함수 (전역으로 노출)
window.addToCompareGroup = function(suffix) {
    const overlay = document.getElementById(`property-detail-overlay-${suffix}`);
    if (!overlay) return;
    
    const propertyId = overlay.dataset.propertyId;
    if (propertyId) {
        // RightSidePanels에 타겟 매물 설정
        if (window.RightSidePanels && typeof window.RightSidePanels.setTargetProperty === 'function') {
            window.RightSidePanels.setTargetProperty(propertyId);
        }
        
        // 비교 패널 열기
        if (typeof window.openRightPanel === 'function') {
            window.openRightPanel('compare');
        } else {
            // fallback
            const btn = document.getElementById("compare-panel-button");
            if (btn) btn.click();
        }
    } else {
        alert("매물 정보를 찾을 수 없습니다.");
    }
};
