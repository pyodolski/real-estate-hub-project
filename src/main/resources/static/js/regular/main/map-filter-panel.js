/**
 * 지도 및 필터 패널 렌더링 및 관리
 */

const MapFilterPanel = {
  /**
   * 지도 및 필터 패널 HTML 생성
   */
  render() {
    return `
      <!-- =================================================================== -->
      <!-- 지도 및 필터 패널                                                     -->
      <!-- =================================================================== -->
      <main class="w-full h-full">
        <main id="container">
          <!-- 지도 영역 (실제 지도 API로 대체될 부분)
              <div class="absolute inset-0 bg-gray-300 flex items-center justify-center">
                  <p class="text-gray-500 text-2xl">[ 지도 영역 ]</p>
              </div>-->
          <div id="map"></div>
        </main>

        <!-- 상단 검색 및 필터 바 -->
        <div
          id="search-bar-container"
          class="absolute top-6 flex flex-row flex-wrap items-center gap-3 z-10 transition-all duration-300 ease-in-out"
          style="left: 474px; right: 99px"
        >
          <!-- Search Bar -->
          <div
            class="flex items-center bg-white rounded-full shadow-lg px-4 py-2 flex-shrink-0"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="text-gray-400 mr-3 flex-shrink-0"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              id="global-search-input"
              type="text"
              placeholder="동, 지하철역, 대학교, 매물번호"
              class="w-56 focus:outline-none bg-transparent text-sm"
            />
            <div id="global-search-suggest"
                 class="absolute top-full left-0 mt-2 w-[360px] max-h-[60vh] overflow-auto bg-white rounded-xl shadow-lg p-2 hidden z-50">
            </div>
          </div>

          <!-- Filter Buttons -->
          <div
            id="house-type-wrapper"
            class="relative inline-block bg-white rounded-full shadow-lg"
          >
            <button
              id="house-type-button"
              class="px-4 py-3 text-gray-700 text-sm font-medium bg-white hover:bg-gray-100 rounded-full leading-tight focus:outline-none"
            >
              <span class="block">주거형태</span>
              <span
                id="house-type-selected-label"
                class="block text-[11px] text-blue-600 font-semibold mt-0.5 hidden"
              ></span>
            </button>
            <!-- 주거형태 드롭다운: 버튼 바로 아래 정렬 -->
            <div
              id="house-type-dropdown"
              class="absolute left-0 top-full mt-2 bg-white rounded-xl shadow-lg p-2 flex flex-row flex-nowrap items-center gap-2 z-20 hidden"
            >
              <button
                data-type="아파트"
                class="house-type-option whitespace-nowrap min-w-[64px] px-4 py-1.5 rounded-full text-sm text-gray-700 bg-gray-100 hover:bg-gray-200"
              >
                아파트
              </button>
              <button
                data-type="빌라"
                class="house-type-option whitespace-nowrap min-w-[64px] px-4 py-1.5 rounded-full text-sm text-gray-700 bg-gray-100 hover:bg-gray-200"
              >
                빌라
              </button>
              <button
                data-type="원/투룸"
                class="house-type-option whitespace-nowrap min-w-[64px] px-4 py-1.5 rounded-full text-sm text-gray-700 bg-gray-100 hover:bg-gray-200"
              >
                원/투룸
              </button>
            </div>
          </div>

          <div
            id="offer-type-wrapper"
            class="relative inline-block bg-white rounded-full shadow-lg"
          >
            <button
              id="offer-type-button"
              class="px-4 py-3 text-gray-700 text-sm font-medium bg-white hover:bg-gray-100 rounded-full leading-tight focus:outline-none"
            >
              <span class="block">거래방식</span>
              <span
                id="offer-type-selected-label"
                class="block text-[11px] text-blue-600 font-semibold mt-0.5 hidden"
              ></span>
            </button>
            <div
              id="offer-type-dropdown"
              class="absolute left-0 top-full mt-2 bg-white rounded-xl shadow-lg p-2 flex flex-row flex-nowrap items-center gap-2 z-20 hidden"
            >
              <button
                data-type="매매"
                class="offer-type-option whitespace-nowrap min-w-[64px] px-4 py-1.5 rounded-full text-sm text-gray-700 bg-gray-100 hover:bg-gray-200"
              >
                매매
              </button>
              <button
                data-type="전세"
                class="offer-type-option whitespace-nowrap min-w-[64px] px-4 py-1.5 rounded-full text-sm text-gray-700 bg-gray-100 hover:bg-gray-200"
              >
                전세
              </button>
              <button
                data-type="월세"
                class="offer-type-option whitespace-nowrap min-w-[64px] px-4 py-1.5 rounded-full text-sm text-gray-700 bg-gray-100 hover:bg-gray-200"
              >
                월세
              </button>
            </div>
          </div>
          <div
            id="area-wrapper"
            class="relative inline-block bg-white rounded-full shadow-lg"
          >
            <button
              id="area-button"
              class="px-4 py-3 text-gray-700 text-sm font-medium bg-white hover:bg-gray-100 rounded-full leading-tight focus:outline-none"
            >
              <span class="block">전용면적</span>
              <span
                id="area-selected-label"
                class="block text-[11px] text-blue-600 font-semibold mt-0.5 hidden"
              ></span>
            </button>
            <div
              id="area-dropdown"
              class="absolute left-0 top-full mt-2 bg-white rounded-xl shadow-lg p-4 flex flex-col gap-3 z-20 w-[340px] hidden"
            >
              <div class="flex items-center justify-between gap-3">
                <div class="flex-1">
                  <label class="text-xs text-gray-500">최소</label>
                  <div class="relative mt-1">
                    <input
                      id="area-min-input"
                      type="text"
                      inputmode="numeric"
                      pattern="[0-9]*"
                      class="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="m²"
                    />
                    <span
                      class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"
                      >m²</span
                    >
                  </div>
                </div>
                <span class="text-gray-400">~</span>
                <div class="flex-1">
                  <label class="text-xs text-gray-500">최대</label>
                  <div class="relative mt-1">
                    <input
                      id="area-max-input"
                      type="text"
                      inputmode="numeric"
                      pattern="[0-9]*"
                      class="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="m²"
                    />
                    <span
                      class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"
                      >m²</span
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            id="floor-wrapper"
            class="relative inline-block bg-white rounded-full shadow-lg"
          >
            <button
              id="floor-button"
              class="px-4 py-3 text-gray-700 text-sm font-medium bg-white hover:bg-gray-100 rounded-full leading-tight focus:outline-none"
            >
              <span class="block">층수</span>
              <span
                id="floor-selected-label"
                class="block text-[11px] text-blue-600 font-semibold mt-0.5 hidden"
              ></span>
            </button>
            <div
              id="floor-dropdown"
              class="absolute left-0 top-full mt-2 bg-white rounded-xl shadow-lg p-4 flex flex-col gap-3 z-20 w-[340px] hidden"
            >
              <div class="flex items-center justify-between gap-3">
                <div class="flex-1">
                  <label class="text-xs text-gray-500">최소</label>
                  <div class="relative mt-1">
                    <input
                      id="floor-min-input"
                      type="text"
                      inputmode="numeric"
                      pattern="[0-9]*"
                      class="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="층"
                    />
                    <span
                      class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"
                      >층</span
                    >
                  </div>
                </div>
                <span class="text-gray-400">~</span>
                <div class="flex-1">
                  <label class="text-xs text-gray-500">최대</label>
                  <div class="relative mt-1">
                    <input
                      id="floor-max-input"
                      type="text"
                      inputmode="numeric"
                      pattern="[0-9]*"
                      class="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="층"
                    />
                    <span
                      class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"
                      >층</span
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            id="option-wrapper"
            class="relative inline-block bg-white rounded-full shadow-lg"
          >
            <button
              id="option-button"
              class="px-4 py-3 text-gray-700 text-sm font-medium bg-white hover:bg-gray-100 rounded-full leading-tight focus:outline-none"
            >
              <span class="block">옵션</span>
              <span
                id="option-selected-label"
                class="block text-[11px] text-blue-600 font-semibold mt-0.5 hidden"
              ></span>
            </button>
            <div
              id="option-dropdown"
              class="absolute left-0 top-full mt-2 bg-white rounded-xl shadow-lg p-2 flex flex-row flex-wrap items-center gap-2 z-20 w-[480px] hidden"
            >
              <button
                data-type="풀옵션"
                class="option-item whitespace-nowrap min-w-[64px] px-4 py-1.5 rounded-full text-sm text-gray-700 bg-gray-100 hover:bg-gray-200"
              >
                풀옵션
              </button>
              <button
                data-type="에어컨"
                class="option-item whitespace-nowrap min-w-[64px] px-4 py-1.5 rounded-full text-sm text-gray-700 bg-gray-100 hover:bg-gray-200"
              >
                에어컨
              </button>
              <button
                data-type="냉장고"
                class="option-item whitespace-nowrap min-w-[64px] px-4 py-1.5 rounded-full text-sm text-gray-700 bg-gray-100 hover:bg-gray-200"
              >
                냉장고
              </button>
              <button
                data-type="세탁기"
                class="option-item whitespace-nowrap min-w-[64px] px-4 py-1.5 rounded-full text-sm text-gray-700 bg-gray-100 hover:bg-gray-200"
              >
                세탁기
              </button>
              <button
                data-type="가스레인지"
                class="option-item whitespace-nowrap min-w-[64px] px-4 py-1.5 rounded-full text-sm text-gray-700 bg-gray-100 hover:bg-gray-200"
              >
                가스레인지
              </button>
              <button
                data-type="인덕션레인지"
                class="option-item whitespace-nowrap min-w-[64px] px-4 py-1.5 rounded-full text-sm text-gray-700 bg-gray-100 hover:bg-gray-200"
              >
                인덕션레인지
              </button>
              <button
                data-type="침대"
                class="option-item whitespace-nowrap min-w-[64px] px-4 py-1.5 rounded-full text-sm text-gray-700 bg-gray-100 hover:bg-gray-200"
              >
                침대
              </button>
              <button
                data-type="전자레인지"
                class="option-item whitespace-nowrap min-w-[64px] px-4 py-1.5 rounded-full text-sm text-gray-700 bg-gray-100 hover:bg-gray-200"
              >
                전자레인지
              </button>
              <button
                data-type="TV"
                class="option-item whitespace-nowrap min-w-[64px] px-4 py-1.5 rounded-full text-sm text-gray-700 bg-gray-100 hover:bg-gray-200"
              >
                TV
              </button>
              <button
                data-type="책상"
                class="option-item whitespace-nowrap min-w-[64px] px-4 py-1.5 rounded-full text-sm text-gray-700 bg-gray-100 hover:bg-gray-200"
              >
                책상
              </button>
              <button
                data-type="CCTV"
                class="option-item whitespace-nowrap min-w-[64px] px-4 py-1.5 rounded-full text-sm text-gray-700 bg-gray-100 hover:bg-gray-200"
              >
                CCTV
              </button>
            </div>
          </div>
          <div
            id="all-filter-wrapper"
            class="relative inline-block bg-white rounded-full shadow-lg"
          >
            <button
              id="all-filter-button"
              class="px-5 py-3 text-gray-700 font-semibold text-sm flex items-center gap-2 bg-white hover:bg-gray-100 rounded-full leading-tight focus:outline-none"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              <span class="block">전체필터</span>
              <span
                id="all-filter-selected-label"
                class="block text-[11px] text-blue-600 font-semibold mt-0.5 hidden"
              ></span>
            </button>
            <div
              id="all-filter-dropdown"
              class="absolute left-0 top-full mt-2 bg-white rounded-xl shadow-lg p-6 z-20 w-[450px] max-h-[80vh] overflow-y-auto hidden"
            >
              <div class="space-y-6">
                <!-- 주거형태 -->
                <div>
                  <h3 class="text-sm font-semibold text-gray-700 mb-3">
                    주거형태
                  </h3>
                  <div class="flex flex-wrap gap-2">
                    <button
                      data-type="아파트"
                      class="filter-house-type whitespace-nowrap px-4 py-2 rounded-full text-sm text-gray-700 bg-gray-100 hover:bg-gray-200"
                    >
                      아파트
                    </button>
                    <button
                      data-type="빌라"
                      class="filter-house-type whitespace-nowrap px-4 py-2 rounded-full text-sm text-gray-700 bg-gray-100 hover:bg-gray-200"
                    >
                      빌라
                    </button>
                    <button
                      data-type="원/투룸"
                      class="filter-house-type whitespace-nowrap px-4 py-2 rounded-full text-sm text-gray-700 bg-gray-100 hover:bg-gray-200"
                    >
                      원/투룸
                    </button>
                  </div>
                </div>

                <!-- 거래방식 -->
                <div>
                  <h3 class="text-sm font-semibold text-gray-700 mb-3">
                    거래방식
                  </h3>
                  <div class="flex flex-wrap gap-2">
                    <button
                      data-type="매매"
                      class="filter-offer-type whitespace-nowrap px-4 py-2 rounded-full text-sm text-gray-700 bg-gray-100 hover:bg-gray-200"
                    >
                      매매
                    </button>
                    <button
                      data-type="전세"
                      class="filter-offer-type whitespace-nowrap px-4 py-2 rounded-full text-sm text-gray-700 bg-gray-100 hover:bg-gray-200"
                    >
                      전세
                    </button>
                    <button
                      data-type="월세"
                      class="filter-offer-type whitespace-nowrap px-4 py-2 rounded-full text-sm text-gray-700 bg-gray-100 hover:bg-gray-200"
                    >
                      월세
                    </button>
                  </div>
                </div>

                <!-- 전용면적 -->
                <div>
                  <h3 class="text-sm font-semibold text-gray-700 mb-3">
                    전용면적
                  </h3>
                  <div class="flex items-center gap-3">
                    <div class="flex-1">
                      <input
                        id="filter-area-min"
                        type="text"
                        inputmode="numeric"
                        pattern="[0-9]*"
                        class="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="최소 m²"
                      />
                    </div>
                    <span class="text-gray-400">~</span>
                    <div class="flex-1">
                      <input
                        id="filter-area-max"
                        type="text"
                        inputmode="numeric"
                        pattern="[0-9]*"
                        class="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="최대 m²"
                      />
                    </div>
                  </div>
                </div>

                <!-- 층수 -->
                <div>
                  <h3 class="text-sm font-semibold text-gray-700 mb-3">층수</h3>
                  <div class="flex items-center gap-3">
                    <div class="flex-1">
                      <input
                        id="filter-floor-min"
                        type="text"
                        inputmode="numeric"
                        pattern="[0-9]*"
                        class="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="최소 층"
                      />
                    </div>
                    <span class="text-gray-400">~</span>
                    <div class="flex-1">
                      <input
                        id="filter-floor-max"
                        type="text"
                        inputmode="numeric"
                        pattern="[0-9]*"
                        class="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="최대 층"
                      />
                    </div>
                  </div>
                </div>

                <!-- 준공년도 -->
                <div>
                  <h3 class="text-sm font-semibold text-gray-700 mb-3">
                    준공년도
                  </h3>
                  <div class="flex items-center gap-3">
                    <input
                      id="filter-build-year"
                      type="text"
                      inputmode="numeric"
                      pattern="[0-9]*"
                      class="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="예: 2020"
                    />
                  </div>
                </div>

                <!-- 가격 (거래방식에 따라 동적 변경) -->
                <div id="price-section">
                  <h3 class="text-sm font-semibold text-gray-700 mb-3">가격</h3>

                  <!-- 매매가 -->
                  <div id="price-buy" class="hidden">
                    <label class="text-xs text-gray-500 mb-2 block"
                      >매매가</label
                    >
                    <div class="flex items-center gap-3">
                      <div class="flex-1">
                        <input
                          id="filter-buy-min"
                          type="text"
                          inputmode="numeric"
                          pattern="[0-9]*"
                          class="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="최소 (만원)"
                        />
                      </div>
                      <span class="text-gray-400">~</span>
                      <div class="flex-1">
                        <input
                          id="filter-buy-max"
                          type="text"
                          inputmode="numeric"
                          pattern="[0-9]*"
                          class="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="최대 (만원)"
                        />
                      </div>
                    </div>
                  </div>

                  <!-- 전세가 -->
                  <div id="price-jeonse" class="hidden">
                    <label class="text-xs text-gray-500 mb-2 block"
                      >전세가</label
                    >
                    <div class="flex items-center gap-3">
                      <div class="flex-1">
                        <input
                          id="filter-jeonse-min"
                          type="text"
                          inputmode="numeric"
                          pattern="[0-9]*"
                          class="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="최소 (만원)"
                        />
                      </div>
                      <span class="text-gray-400">~</span>
                      <div class="flex-1">
                        <input
                          id="filter-jeonse-max"
                          type="text"
                          inputmode="numeric"
                          pattern="[0-9]*"
                          class="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="최대 (만원)"
                        />
                      </div>
                    </div>
                  </div>

                  <!-- 월세 -->
                  <div id="price-monthly" class="hidden">
                    <div class="space-y-3">
                      <div>
                        <label class="text-xs text-gray-500 mb-2 block"
                          >보증금</label
                        >
                        <div class="flex items-center gap-3">
                          <div class="flex-1">
                            <input
                              id="filter-deposit-min"
                              type="text"
                              inputmode="numeric"
                              pattern="[0-9]*"
                              class="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="최소 (만원)"
                            />
                          </div>
                          <span class="text-gray-400">~</span>
                          <div class="flex-1">
                            <input
                              id="filter-deposit-max"
                              type="text"
                              inputmode="numeric"
                              pattern="[0-9]*"
                              class="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="최대 (만원)"
                            />
                          </div>
                        </div>
                      </div>
                      <div>
                        <label class="text-xs text-gray-500 mb-2 block"
                          >월세</label
                        >
                        <div class="flex items-center gap-3">
                          <div class="flex-1">
                            <input
                              id="filter-monthly-min"
                              type="text"
                              inputmode="numeric"
                              pattern="[0-9]*"
                              class="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="최소 (만원)"
                            />
                          </div>
                          <span class="text-gray-400">~</span>
                          <div class="flex-1">
                            <input
                              id="filter-monthly-max"
                              type="text"
                              inputmode="numeric"
                              pattern="[0-9]*"
                              class="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="최대 (만원)"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 옵션 -->
                <div>
                  <h3 class="text-sm font-semibold text-gray-700 mb-3">옵션</h3>
                  <div class="flex flex-wrap gap-2">
                    <button
                      data-type="풀옵션"
                      class="filter-option whitespace-nowrap px-4 py-2 rounded-full text-sm text-gray-700 bg-gray-100 hover:bg-gray-200"
                    >
                      풀옵션
                    </button>
                    <button
                      data-type="에어컨"
                      class="filter-option whitespace-nowrap px-4 py-2 rounded-full text-sm text-gray-700 bg-gray-100 hover:bg-gray-200"
                    >
                      에어컨
                    </button>
                    <button
                      data-type="냉장고"
                      class="filter-option whitespace-nowrap px-4 py-2 rounded-full text-sm text-gray-700 bg-gray-100 hover:bg-gray-200"
                    >
                      냉장고
                    </button>
                    <button
                      data-type="세탁기"
                      class="filter-option whitespace-nowrap px-4 py-2 rounded-full text-sm text-gray-700 bg-gray-100 hover:bg-gray-200"
                    >
                      세탁기
                    </button>
                    <button
                      data-type="가스레인지"
                      class="filter-option whitespace-nowrap px-4 py-2 rounded-full text-sm text-gray-700 bg-gray-100 hover:bg-gray-200"
                    >
                      가스레인지
                    </button>
                    <button
                      data-type="인덕션레인지"
                      class="filter-option whitespace-nowrap px-4 py-2 rounded-full text-sm text-gray-700 bg-gray-100 hover:bg-gray-200"
                    >
                      인덕션레인지
                    </button>
                    <button
                      data-type="침대"
                      class="filter-option whitespace-nowrap px-4 py-2 rounded-full text-sm text-gray-700 bg-gray-100 hover:bg-gray-200"
                    >
                      침대
                    </button>
                    <button
                      data-type="전자레인지"
                      class="filter-option whitespace-nowrap px-4 py-2 rounded-full text-sm text-gray-700 bg-gray-100 hover:bg-gray-200"
                    >
                      전자레인지
                    </button>
                    <button
                      data-type="TV"
                      class="filter-option whitespace-nowrap px-4 py-2 rounded-full text-sm text-gray-700 bg-gray-100 hover:bg-gray-200"
                    >
                      TV
                    </button>
                    <button
                      data-type="책상"
                      class="filter-option whitespace-nowrap px-4 py-2 rounded-full text-sm text-gray-700 bg-gray-100 hover:bg-gray-200"
                    >
                      책상
                    </button>
                    <button
                      data-type="CCTV"
                      class="filter-option whitespace-nowrap px-4 py-2 rounded-full text-sm text-gray-700 bg-gray-100 hover:bg-gray-200"
                    >
                      CCTV
                    </button>
                  </div>
                </div>

                <!-- 적용/초기화 버튼 -->
                <div class="flex justify-between items-center pt-4 border-t">
                  <button
                    id="reset-filter"
                    class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    초기화
                  </button>
                  <button
                    id="apply-filter"
                    class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    적용
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    `;
  },

  /**
   * 패널을 DOM에 삽입
   */
  init() {
    const panelHTML = this.render();

    // 기존 패널이 있으면 제거
    const existingContainer = document.querySelector('main.w-full.h-full');
    if (existingContainer) {
      existingContainer.remove();
    }

    // body의 첫 번째 div (relative wrapper) 안에 삽입
    const relativeWrapper = document.querySelector('.relative.w-full.h-full');
    if (relativeWrapper) {
      relativeWrapper.insertAdjacentHTML('afterbegin', panelHTML);
    } else {
      // wrapper가 없으면 body에 직접 추가
      document.body.insertAdjacentHTML('afterbegin', panelHTML);
    }

    // 초기화 완료 이벤트 발생
    console.log('[MapFilterPanel] 초기화 완료');
    window.dispatchEvent(new CustomEvent('mapFilterPanelReady'));
  }
};

// DOM 로드 완료 후 패널 초기화
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    MapFilterPanel.init();
  });
} else {
  MapFilterPanel.init();
}
