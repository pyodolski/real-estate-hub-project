/**
 * 우측 사이드 패널들 렌더링 및 관리
 * 채팅, 프로필, 알림, 즐겨찾기, 비교, 내 매물 관리, 중개인 목록 패널
 */

const RightSidePanels = {
  /**
   * 채팅 패널 HTML 생성
   */
  renderChatPanel() {
    return `
      <!-- =================================================================== -->
      <!-- 채팅 패널                                                          -->
      <!-- =================================================================== -->
      <aside
        id="chat-panel"
        class="absolute top-0 w-[450px] bg-white p-6 flex flex-col h-full shadow-lg z-20 transform translate-x-full transition-transform duration-300 ease-in-out"
        style="right: 75px"
      >
        <!-- 채팅 패널 헤더 -->
        <div
          class="flex justify-between items-center mb-4 pb-4 border-b flex-shrink-0"
        >
          <h2 class="text-xl font-bold text-gray-800">채팅 목록</h2>
          <button
            id="close-chat-panel"
            class="p-2 rounded-full hover:bg-gray-200 transition-colors"
            title="채팅 패널 닫기"
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

        <!-- 채팅 검색 -->
        <div class="mb-4 flex-shrink-0">
          <div class="relative">
            <input
              type="text"
              placeholder="채팅방 검색"
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        <!-- 스크롤 가능한 채팅 목록 영역 -->
        <div class="flex-grow overflow-y-auto custom-scrollbar pr-2 -mr-2">
          <div id="chat-list" class="space-y-3">
            <!-- JavaScript로 채팅 목록이 여기에 추가됩니다. -->
          </div>
        </div>
      </aside>
    `;
  },

  /**
   * 프로필 패널 HTML 생성
   */
  renderProfilePanel() {
    return `
      <!-- =================================================================== -->
      <!-- 프로필 패널                                                        -->
      <!-- =================================================================== -->
      <aside
        id="profile-panel"
        class="absolute top-0 w-[450px] bg-white p-6 flex flex-col h-full shadow-lg z-20 transform translate-x-full transition-transform duration-300 ease-in-out"
        style="right: 75px"
      >
        <!-- 프로필 패널 헤더 -->
        <div
          class="flex justify-between items-center mb-4 pb-4 border-b flex-shrink-0"
        >
          <h2 class="text-xl font-bold text-gray-800">프로필 수정</h2>
          <button
            id="close-profile-panel"
            class="p-2 rounded-full hover:bg-gray-200 transition-colors"
            title="프로필 패널 닫기"
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

        <!-- 스크롤 가능한 프로필 수정 영역 -->
        <div class="flex-grow overflow-y-auto custom-scrollbar pr-2 -mr-2">
          <form id="profile-form" class="space-y-6">
            <!-- 프로필 사진 -->
            <div class="flex flex-col items-center space-y-4">
              <div class="relative">
                <div
                  class="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden"
                >
                  <img
                    id="profile-image"
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
                    alt="프로필 사진"
                    class="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  class="absolute bottom-0 right-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                </button>
              </div>
              <input
                type="file"
                id="profile-image-input"
                accept="image/*"
                class="hidden"
              />
            </div>

            <!-- 기본 정보 -->
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2"
                  >이름/닉네임</label
                >
                <input
                  type="text"
                  id="username"
                  name="username"
                  value="홍길동"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2"
                  >이메일</label
                >
                <input
                  type="email"
                  id="email"
                  name="email"
                  value="user@example.com"
                  readonly
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                />
                <p class="text-xs text-gray-500 mt-1">
                  이메일은 변경할 수 없습니다.
                </p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2"
                  >전화번호</label
                >
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value="010-1234-5678"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2"
                  >소개글</label
                >
                <textarea
                  id="intro"
                  name="intro"
                  rows="4"
                  placeholder="자신을 소개하는 글을 작성해주세요..."
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                >부동산에 관심이 많은 일반 사용자입니다.</textarea
                >
                <p class="text-xs text-gray-500 mt-1">
                  최대 200자까지 입력할 수 있습니다.
                </p>
              </div>
            </div>

            <!-- 계정 통계 -->
            <div class="bg-gray-50 rounded-lg p-4 space-y-3">
              <h3 class="text-sm font-semibold text-gray-700">활동 통계</h3>
              <div class="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p class="text-2xl font-bold text-blue-600">12</p>
                  <p class="text-xs text-gray-500">찜한 매물</p>
                </div>
                <div>
                  <p class="text-2xl font-bold text-green-600">3</p>
                  <p class="text-xs text-gray-500">작성한 리뷰</p>
                </div>
              </div>
            </div>

            <!-- 저장/취소 버튼 -->
            <div class="flex space-x-3 pt-4">
              <button
                type="button"
                id="cancel-profile-edit"
                class="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                type="submit"
                class="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                저장
              </button>
            </div>
          </form>
        </div>
      </aside>
    `;
  },

  /**
   * 알림 패널 HTML 생성
   */
  renderNotificationPanel() {
    return `
      <!-- =================================================================== -->
      <!-- 알림 패널                                                          -->
      <!-- =================================================================== -->
      <aside
        id="notification-panel"
        class="absolute top-0 w-[450px] bg-white p-6 flex flex-col h-full shadow-lg z-20 transform translate-x-full transition-transform duration-300 ease-in-out"
        style="right: 75px"
      >
        <!-- 알림 패널 헤더 -->
        <div
          class="flex justify-between items-center mb-4 pb-4 border-b flex-shrink-0"
        >
          <h2 class="text-xl font-bold text-gray-800">알림</h2>
          <button
            id="close-notification-panel"
            class="p-2 rounded-full hover:bg-gray-200 transition-colors"
            title="알림 패널 닫기"
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

        <!-- 알림 설정 -->
        <div class="mb-4 flex-shrink-0">
          <div
            class="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
          >
            <span class="text-sm text-gray-700">모든 알림 읽음 처리</span>
            <button
              class="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              모두 읽음
            </button>
          </div>
        </div>

        <!-- 스크롤 가능한 알림 목록 영역 -->
        <div class="flex-grow overflow-y-auto custom-scrollbar pr-2 -mr-2">
          <div id="notification-list" class="space-y-3">
            <!-- JavaScript로 알림 목록이 여기에 추가됩니다. -->
          </div>
        </div>
      </aside>
    `;
  },

  /**
   * 즐겨찾기 패널 HTML 생성
   */
  renderFavoritePanel() {
    return `
      <!-- =================================================================== -->
      <!-- 즐겨찾기 패널                                                      -->
      <!-- =================================================================== -->
      <aside
        id="favorite-panel"
        class="absolute top-0 w-[450px] bg-white p-6 flex flex-col h-full shadow-lg z-20 transform translate-x-full transition-transform duration-300 ease-in-out"
        style="right: 75px"
      >
        <!-- 즐겨찾기 패널 헤더 -->
        <div
          class="flex justify-between items-center mb-4 pb-4 border-b flex-shrink-0"
        >
          <h2 class="text-xl font-bold text-gray-800">즐겨찾기</h2>
          <button
            id="close-favorite-panel"
            class="p-2 rounded-full hover:bg-gray-200 transition-colors"
            title="즐겨찾기 패널 닫기"
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

        <!-- 즐겨찾기 필터링 -->
        <div class="mb-4 flex-shrink-0">
          <div
            class="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
          >
            <span class="text-sm text-gray-700">총 12개 매물</span>
            <select class="text-sm border border-gray-300 rounded px-2 py-1">
              <option>최근 순</option>
              <option>가격 낮은 순</option>
              <option>가격 높은 순</option>
            </select>
          </div>
        </div>

        <!-- 스크롤 가능한 즐겨찾기 목록 영역 -->
        <div class="flex-grow overflow-y-auto custom-scrollbar pr-2 -mr-2">
          <div id="favorite-list" class="grid grid-cols-1 gap-4">
            <!-- JavaScript로 즐겨찾기 목록이 여기에 추가됩니다. -->
          </div>
        </div>
      </aside>
    `;
  },

  /**
   * 비교 패널 HTML 생성
   */
  renderComparePanel() {
    return `
      <!-- =================================================================== -->
      <!-- 비교 패널                                                          -->
      <!-- =================================================================== -->
      <aside
        id="compare-panel"
        class="absolute top-0 w-[450px] bg-white p-6 flex flex-col h-full shadow-lg z-20 transform translate-x-full transition-transform duration-300 ease-in-out"
        style="right: 75px"
      >
        <!-- 비교 패널 헤더 -->
        <div
          class="flex justify-between items-center mb-4 pb-4 border-b flex-shrink-0"
        >
          <h2 class="text-xl font-bold text-gray-800">매물 비교</h2>
          <button
            id="close-compare-panel"
            class="p-2 rounded-full hover:bg-gray-200 transition-colors"
            title="비교 패널 닫기"
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

        <!-- 비교 그룹 관리 -->
        <div class="mb-4 flex-shrink-0">
          <div
            class="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
          >
            <span class="text-sm text-gray-700">비교 그룹 2개</span>
            <button
              class="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              새 그룹 추가
            </button>
          </div>
        </div>

        <!-- 스크롤 가능한 비교 목록 영역 -->
        <div class="flex-grow overflow-y-auto custom-scrollbar pr-2 -mr-2">
          <div id="compare-list" class="flex flex-col gap-4">
            <!-- JavaScript로 비교 그룹이 여기에 추가됩니다. -->
          </div>
        </div>
      </aside>
    `;
  },

  /**
   * 내 매물 관리 패널 HTML 생성
   */
  renderMyPropertyPanel() {
    return `
      <!-- =================================================================== -->
      <!-- 내 매물 관리 패널                                                   -->
      <!-- =================================================================== -->
      <aside
        id="my-property-panel"
        class="absolute top-0 w-[450px] bg-white p-6 flex flex-col h-full shadow-lg z-20 transform translate-x-full transition-transform duration-300 ease-in-out overflow-hidden"
        style="right: 75px"
      >
        <!-- 내 매물 관리 패널 헤더 -->
        <div
          class="flex justify-between items-center mb-4 pb-4 border-b flex-shrink-0"
        >
          <h2 class="text-xl font-bold text-gray-800">내 매물 관리</h2>
          <button
            id="close-my-property-panel"
            class="p-2 rounded-full hover:bg-gray-200 transition-colors"
            title="내 매물 관리 패널 닫기"
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

        <!-- 내 매물 요약 및 새 등록 -->
        <div class="mb-4 flex-shrink-0">
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-3">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-semibold text-gray-800">총 매물</h3>
                <p class="text-2xl font-bold text-blue-600">3개</p>
              </div>
              <div class="text-right">
                <p class="text-sm text-gray-600">이번 달 조회수</p>
                <p class="text-lg font-semibold text-gray-800">1,247회</p>
              </div>
            </div>
          </div>

          <button
            id="add-property-btn"
            class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clip-rule="evenodd"
              />
            </svg>
            내 매물 등록
          </button>
        </div>

        <!-- 필터 탭 -->
        <div class="mb-4 flex-shrink-0">
          <div class="flex border-b border-gray-200">
            <button
              id="property-all-tab"
              class="flex-1 px-3 py-2 text-xs border-b-2 border-blue-500 text-blue-600 font-medium text-center"
              onclick="propertyManagement.filterProperties('ALL', 'ALL')"
            >
              전체
            </button>
            <button
              id="property-pending-tab"
              class="flex-1 px-3 py-2 text-xs border-b-2 border-transparent text-gray-500 hover:text-gray-700 text-center"
              onclick="propertyManagement.filterProperties('PENDING', 'ALL')"
            >
              심사 중
            </button>
            <button
              id="property-approved-tab"
              class="flex-1 px-3 py-2 text-xs border-b-2 border-transparent text-gray-500 hover:text-gray-700 text-center"
              onclick="propertyManagement.filterProperties('APPROVED', 'ALL')"
            >
              승인됨
            </button>
            <button
              id="property-rejected-tab"
              class="flex-1 px-3 py-2 text-xs border-b-2 border-transparent text-gray-500 hover:text-gray-700 text-center"
              onclick="propertyManagement.filterProperties('REJECTED', 'ALL')"
            >
              거절됨
            </button>
          </div>
          <div class="flex border-b border-gray-100 mt-1">
            <button
              id="type-all-tab"
              class="flex-1 px-3 py-1 text-xs bg-gray-100 text-gray-600 hover:bg-gray-200 text-center"
              onclick="propertyManagement.filterProperties(propertyManagement.currentStatusFilter, 'ALL')"
            >
              전체 유형
            </button>
            <button
              id="type-simple-tab"
              class="flex-1 px-3 py-1 text-xs bg-white text-gray-500 hover:bg-gray-50 text-center"
              onclick="propertyManagement.filterProperties(propertyManagement.currentStatusFilter, 'SIMPLE')"
            >
              단순 등록
            </button>
            <button
              id="type-sale-tab"
              class="flex-1 px-3 py-1 text-xs bg-white text-gray-500 hover:bg-gray-50 text-center"
              onclick="propertyManagement.filterProperties(propertyManagement.currentStatusFilter, 'SALE')"
            >
              판매 등록
            </button>
          </div>
        </div>

        <!-- 스크롤 가능한 내 매물 목록 영역 -->
        <div class="flex-grow overflow-y-auto custom-scrollbar pr-2 -mr-2">
          <div id="my-property-list" class="space-y-4">
            <!-- JavaScript로 내 매물 목록이 여기에 추가됩니다. -->
          </div>
        </div>
      </aside>
    `;
  },

  /**
   * 중개인 목록 패널 HTML 생성
   */
  renderBrokerListPanel() {
    return `
      <!-- =================================================================== -->
      <!-- 중개인 프로필 목록 패널                                                -->
      <!-- =================================================================== -->
      <aside
        id="broker-list-panel"
        class="absolute top-0 w-[450px] bg-white p-6 flex flex-col h-full shadow-lg z-20 transform translate-x-full transition-transform duration-300 ease-in-out"
        style="right: 75px"
      >
        <!-- 중개인 프로필 목록 패널 헤더 -->
        <div
          class="flex justify-between items-center mb-4 pb-4 border-b flex-shrink-0"
        >
          <h2 class="text-xl font-bold text-gray-800">중개인 프로필 목록</h2>
          <button
            id="close-broker-list-panel"
            class="p-2 rounded-full hover:bg-gray-200 transition-colors"
            title="중개인 프로필 목록 패널 닫기"
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

        <!-- 검색 영역 -->
        <div class="mb-4 flex-shrink-0">
          <div class="relative">
            <input
              type="text"
              id="broker-search-input"
              placeholder="중개인 이름 또는 지역 검색..."
              class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg
              class="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        <!-- 스크롤 가능한 중개인 목록 영역 -->
        <div class="flex-grow overflow-y-auto custom-scrollbar pr-2 -mr-2">
          <div id="broker-list" class="space-y-4">
            <!-- JavaScript로 브로커 목록이 여기에 추가됩니다. -->
          </div>
        </div>
      </aside>
    `;
  },

  /**
   * 전체 패널 HTML 생성
   */
  render() {
    return `
      ${this.renderChatPanel()}
      ${this.renderProfilePanel()}
      ${this.renderNotificationPanel()}
      ${this.renderFavoritePanel()}
      ${this.renderComparePanel()}
      ${this.renderMyPropertyPanel()}
      ${this.renderBrokerListPanel()}
    `;
  },

  /**
   * 패널들을 DOM에 삽입
   */
  init() {
    const panelsHTML = this.render();

    // 기존 패널들이 있으면 제거
    const panelIds = [
      'chat-panel',
      'profile-panel',
      'notification-panel',
      'favorite-panel',
      'compare-panel',
      'my-property-panel',
      'broker-list-panel'
    ];

    panelIds.forEach(id => {
      const existing = document.getElementById(id);
      if (existing) {
        existing.remove();
      }
    });

    // right-side-panel 앞에 삽입
    const rightSidePanel = document.getElementById('right-side-panel');
    if (rightSidePanel) {
      rightSidePanel.insertAdjacentHTML('beforebegin', panelsHTML);
    } else {
      // right-side-panel이 없으면 body에 추가
      document.body.insertAdjacentHTML('beforeend', panelsHTML);
    }

    console.log('[RightSidePanels] 우측 패널들 초기화 완료');
  }
};

// DOM 로드 완료 후 패널 초기화
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    RightSidePanels.init();
  });
} else {
  RightSidePanels.init();
}
