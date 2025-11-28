
const RightSidePanels = {
  /**
   * 채팅 패널 HTML 생성
   */
  async loadFavoriteList() {
    const listEl = document.getElementById("favorite-list");
    const totalSpan = document.getElementById("favorite-total-count");
    if (!listEl || !totalSpan) return;

    const token = localStorage.getItem("accessToken") || "";

    try {
      const res = await fetch("/api/properties/favorites?limit=100&offset=0", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error("즐겨찾기 불러오기 실패");

      const favorites = await res.json();

      // 썸네일 이미지 병렬 로드
      const favoritesWithImages = await Promise.all(favorites.map(async (f) => {
          let img = f.thumbnailUrl || "https://via.placeholder.com/150?text=No+Image";
          try {
              const imgRes = await fetch(`/api/properties/${f.propertyId}/images`, {
                  headers: { 'Authorization': `Bearer ${token}` }
              });
              if (imgRes.ok) {
                  const images = await imgRes.json();
                  if (images && images.length > 0) {
                      img = images[0].imageUrl || images[0].url;
                  }
              }
          } catch (e) { /* ignore */ }
          return { ...f, thumbnail: img };
      }));

      totalSpan.textContent = `총 ${favorites.length}개 매물`;
      listEl.innerHTML = "";

      favoritesWithImages.forEach((f) => {
        const img = f.thumbnail;

        const card = `
           <div class="bg-white rounded-lg shadow p-3 flex gap-3 cursor-pointer property-card-btn"
                data-property-id="${f.propertyId}">
             <img src="${img}" class="w-24 h-20 rounded object-cover" />

             <div class="flex-1 flex flex-col justify-between">
               <div>
                 <p class="font-semibold text-sm">${f.title}</p>
                 <p class="text-xs text-gray-500">${f.address}</p>
               </div>

               <div class="flex justify-between items-center mt-2">
                 <span class="text-blue-600 font-bold text-sm">
                   ${Number(f.price).toLocaleString()}원
                 </span>

                 <button class="text-xs text-red-500 favorite-remove-btn"
                         data-property-id="${f.propertyId}">
                   해제
                 </button>
               </div>
             </div>
           </div>
         `;

        listEl.insertAdjacentHTML("beforeend", card);
      });

      // 삭제(토글) 처리
      listEl.addEventListener("click", async (e) => {
        const btn = e.target.closest(".favorite-remove-btn");
        if (!btn) return;

        const pid = btn.getAttribute("data-property-id");

        const toggleRes = await fetch(`/api/properties/${pid}/favorite`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!toggleRes.ok) return alert("해제 실패");

        this.loadFavoriteList();
      });
    } catch (e) {
      console.error(e);
      totalSpan.textContent = "불러오기 실패";
      listEl.innerHTML = "<p>목록을 불러올 수 없습니다.</p>";
    }
  },
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
          id="chat-header"
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
        <div id="chat-search-area" class="mb-4 flex-shrink-0">
          <div class="relative">
            <input
              type="text"
              id="chat-search-input"
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
        <div id="chat-content-area" class="flex-grow overflow-y-auto custom-scrollbar pr-2 -mr-2">
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
                    id="profile-image-edit-btn"
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

                <!-- 프로필 수정용 현재 비밀번호 -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    현재 비밀번호
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    placeholder="프로필 수정을 위해 현재 비밀번호를 입력하세요"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p class="text-xs text-gray-500 mt-1">
                    비밀번호가 일치하면 프로필 수정이 가능합니다.
                  </p>
                </div>

                <!-- 비밀번호 변경 영역 (회색 박스X) -->
                <div class="border-t pt-4 space-y-3">
                  <h3 class="text-sm font-semibold text-gray-700">비밀번호 변경</h3>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      새 비밀번호
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      placeholder="변경할 새 비밀번호를 입력하세요"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <button
                    type="button"
                    id="pw-change-btn"
                    class="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                  >
                    비밀번호 변경
                  </button>
                </div>

                <!-- 소개글 (회색 박스 밖) -->
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
                  ></textarea>
                  <p class="text-xs text-gray-500 mt-1">
                    최대 200자까지 입력할 수 있습니다.
                  </p>
                </div>
              </div>

              <!-- 계정 통계 (회색 박스) -->
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
          <div class="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
            <span class="text-sm text-gray-700">알림 관리</span>
            <div class="flex space-x-2">
              <button
                id="mark-all-read-btn"
                class="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded"
              >
                모두 읽음
              </button>
              <button
                id="delete-read-btn"
                class="text-xs text-red-600 hover:text-red-800 font-medium px-2 py-1 rounded"
              >
                읽은 알림 삭제
              </button>
            </div>
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
            <span id="favorite-total-count" class="text-sm text-gray-700">
              총 0개 매물
            </span>
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

  // 비교 그룹 추가 모드 상태
  targetPropertyId: null,

  setTargetProperty(propertyId) {
    this.targetPropertyId = propertyId;
    this.loadCompareGroups();
  },

  /**
   * 비교 그룹 목록 로드
   */
  async loadCompareGroups() {
    const listEl = document.getElementById("compare-list");
    const countSpan = document.getElementById("compare-group-count");
    if (!listEl || !countSpan) return;

    const token = localStorage.getItem("accessToken") || "";

    try {
      const res = await fetch("/api/comparisons/groups?page=0&size=100", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error("비교 그룹 불러오기 실패");

      const data = await res.json();
      const groups = data.content; // Page<GroupSummaryResponse>

      // 그룹 내 아이템 이미지 로드
      const groupsWithImages = await Promise.all(groups.map(async (g) => {
          if (!g.items || g.items.length === 0) return g;
          
          const itemsWithImages = await Promise.all(g.items.map(async (item) => {
              let imgUrl = item.thumbnailUrl || "https://via.placeholder.com/150?text=No+Image";
              try {
                  const imgRes = await fetch(`/api/properties/${item.propertyId}/images`, {
                      headers: { 'Authorization': `Bearer ${token}` }
                  });
                  if (imgRes.ok) {
                      const images = await imgRes.json();
                      if (images && images.length > 0) {
                          imgUrl = images[0].imageUrl || images[0].url;
                      }
                  }
              } catch (e) { /* ignore */ }
              return { ...item, thumbnailUrl: imgUrl };
          }));
          return { ...g, items: itemsWithImages };
      }));

      countSpan.textContent = `비교 그룹 ${groupsWithImages.length}개`;
      listEl.innerHTML = "";

      groupsWithImages.forEach((g) => {
        // 아이템 미리보기 이미지 (최대 3개)
        let imagesHtml = "";
        if (g.items && g.items.length > 0) {
          imagesHtml = g.items.slice(0, 3).map(item => {
             const imgUrl = item.thumbnailUrl;
             return `<img src="${imgUrl}" class="w-8 h-8 rounded-full border-2 border-white -ml-2 first:ml-0 object-cover">`;
          }).join("");
        } else {
          imagesHtml = `<span class="text-xs text-gray-400">매물 없음</span>`;
        }

        const isAddMode = !!this.targetPropertyId;
        let actionBtn = "";
        const isFull = g.items && g.items.length >= 3;

        if (isAddMode) {
            if (isFull) {
                 actionBtn = `
                  <span class="text-xs text-red-500 font-medium px-3 py-1">
                    가득 참 (3/3)
                  </span>
                `;
            } else {
                actionBtn = `
                  <button class="text-xs bg-blue-600 text-white px-3 py-1 rounded-full font-medium hover:bg-blue-700 transition-colors add-to-group-btn" data-group-id="${g.id}">
                    이 그룹에 추가
                  </button>
                `;
            }
        } else {
            // 일반 모드에서는 확장/축소 아이콘 (클릭 시 토글됨)
            actionBtn = `
               <div class="transform transition-transform duration-200 group-expanded-icon-${g.id}">
                 <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                 </svg>
               </div>
            `;
        }

        // 매물 목록 HTML 생성
        let itemsListHtml = "";
        if (g.items && g.items.length > 0) {
            itemsListHtml = `<div id="group-items-${g.id}" class="hidden mt-3 pt-3 border-t border-gray-100 space-y-2">`;
            g.items.forEach(item => {
                const priceStr = item.priceText || this.formatPrice(item.price);
                // recommended-list 스타일 적용
                // 썸네일, 상태 뱃지, 가격, 주소/이름
                const statusBadge = item.status === 'AVAILABLE' 
                    ? `<span class="bg-green-100 text-green-800 text-[10px] px-1.5 py-0.5 rounded">거래가능</span>`
                    : `<span class="bg-gray-100 text-gray-800 text-[10px] px-1.5 py-0.5 rounded">거래완료</span>`;

                itemsListHtml += `
                    <div class="flex gap-3 p-3 bg-white border border-gray-100 rounded-lg hover:shadow-md transition-shadow cursor-pointer property-card-btn group relative" data-property-id="${item.propertyId}">
                        <div class="relative w-20 h-20 flex-shrink-0">
                            <img src="${item.thumbnailUrl || 'https://via.placeholder.com/150'}" class="w-full h-full object-cover rounded-md">
                            <div class="absolute top-1 left-1">${statusBadge}</div>
                        </div>
                        <div class="flex-grow min-w-0 flex flex-col justify-between py-0.5">
                            <div>
                                <div class="text-sm font-bold text-gray-900 truncate">${item.propertyName || item.address}</div>
                                <div class="text-xs text-gray-500 truncate mt-0.5">${item.address}</div>
                            </div>
                            <div class="flex justify-between items-end">
                                <div class="text-sm font-bold text-blue-600">${priceStr}</div>
                            </div>
                        </div>
                        <button class="absolute top-2 right-2 text-gray-300 hover:text-red-500 p-1 delete-item-btn opacity-0 group-hover:opacity-100 transition-opacity" data-group-id="${g.id}" data-property-id="${item.propertyId}" title="삭제">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                `;
            });
            itemsListHtml += `</div>`;
        } else {
             itemsListHtml = `<div id="group-items-${g.id}" class="hidden mt-3 pt-3 border-t border-gray-100 text-center text-xs text-gray-400 py-2">매물이 없습니다.</div>`;
        }

        const card = `
          <div class="bg-white rounded-lg shadow p-4 border border-gray-100 ${isAddMode ? 'border-blue-200 ring-2 ring-blue-100' : 'cursor-pointer group-card-toggle'}" data-group-id="${g.id}">
            <div class="flex justify-between items-start mb-3">
              <div>
                <h3 class="font-bold text-gray-800">${g.name}</h3>
                <p class="text-xs text-gray-500">${new Date(g.createdAt).toLocaleDateString()} 생성 <span class="ml-1 text-blue-600 font-medium">(${g.items ? g.items.length : 0}/3)</span></p>
              </div>
              <button class="text-gray-400 hover:text-red-500 delete-group-btn" data-group-id="${g.id}">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div class="flex items-center justify-between">
              <div class="flex items-center pl-2">
                ${imagesHtml}
              </div>
              ${actionBtn}
            </div>
            
            ${itemsListHtml}
          </div>
        `;
        listEl.insertAdjacentHTML("beforeend", card);
      });

      // 안내 메시지 (추가 모드일 때)
      if (this.targetPropertyId) {
          const msg = `<div class="bg-blue-50 text-blue-800 p-3 rounded-lg mb-4 text-sm font-medium flex justify-between items-center">
            <span>매물을 추가할 그룹을 선택하세요.</span>
            <button class="text-xs underline text-blue-600 hover:text-blue-800 cancel-add-mode-btn">취소</button>
          </div>`;
          listEl.insertAdjacentHTML("afterbegin", msg);
          
          const cancelBtn = listEl.querySelector(".cancel-add-mode-btn");
          if(cancelBtn) {
              cancelBtn.addEventListener("click", () => {
                  this.targetPropertyId = null;
                  this.loadCompareGroups();
              });
          }
      }

      // 이벤트 리스너 추가 (그룹 삭제, 상세보기)
      // 기존 리스너가 중복되지 않도록 주의해야 하지만, innerHTML로 덮어쓰므로 새로 달아야 함.
      // 하지만 listEl 자체에 위임하는 것이 좋음. (init에서 처리하거나 여기서 처리)
      // 여기서는 매번 새로 생성되므로 여기서 처리하는게 간편함.
      
      // 삭제 버튼 이벤트
      listEl.querySelectorAll(".delete-group-btn").forEach(btn => {
        btn.addEventListener("click", async (e) => {
          e.stopPropagation();
          const groupId = btn.getAttribute("data-group-id");
          // if (!confirm("정말 이 비교 그룹을 삭제하시겠습니까?")) return; // 즉시 삭제로 변경
          
          try {
            const delRes = await fetch(`/api/comparisons/groups/${groupId}`, {
              method: "DELETE",
              headers: {
                "Authorization": `Bearer ${token}`,
              },
            });
            if (delRes.ok) {
              this.loadCompareGroups();
            } else {
              alert("삭제 실패");
            }
          } catch (err) {
            console.error(err);
            alert("삭제 중 오류 발생");
          }
        });
      });

      // 그룹에 추가 버튼 이벤트
      listEl.querySelectorAll(".add-to-group-btn").forEach(btn => {
        btn.addEventListener("click", async (e) => {
           e.stopPropagation();
           const groupId = btn.getAttribute("data-group-id");
           const propertyId = this.targetPropertyId;
           
           if (!propertyId) return;

           try {
             const res = await fetch(`/api/comparisons/groups/${groupId}/items`, {
               method: "POST",
               headers: {
                 "Authorization": `Bearer ${token}`,
                 "Content-Type": "application/json",
               },
               body: JSON.stringify({ propertyId: parseInt(propertyId) }),
             });

             if (res.ok) {
               alert("비교 그룹에 추가되었습니다.");
               this.targetPropertyId = null; // 모드 해제
               this.loadCompareGroups();
             } else {
               alert("추가 실패 (이미 존재하는 매물일 수 있습니다)");
             }
           } catch (err) {
             console.error(err);
             alert("오류가 발생했습니다.");
           }
        });
      });
      
      // 매물 카드 클릭 이벤트 (상세보기) - sideBySide 지원
      listEl.querySelectorAll(".property-card-btn").forEach(btn => {
          btn.addEventListener("click", (e) => {
              // 삭제 버튼 클릭 시 이벤트 전파 중단은 이미 삭제 버튼 핸들러에서 처리됨(e.stopPropagation)
              // 하지만 안전을 위해 여기서도 체크
              if (e.target.closest(".delete-item-btn")) return;
              
              const propertyId = btn.getAttribute("data-property-id");
              if (propertyId) {
                  if (typeof window.openPropertyDetail === 'function') {
                      window.openPropertyDetail(propertyId, null, { sideBySide: true });
                  } else {
                      alert("상세보기 기능을 사용할 수 없습니다.");
                  }
              }
          });
      });

      // 매물 삭제 버튼 이벤트
      listEl.querySelectorAll(".delete-item-btn").forEach(btn => {
          btn.addEventListener("click", async (e) => {
              e.stopPropagation();
              const groupId = btn.getAttribute("data-group-id");
              const propertyId = btn.getAttribute("data-property-id");
              
              if (!confirm("이 매물을 그룹에서 삭제하시겠습니까?")) return;

              try {
                  const res = await fetch(`/api/comparisons/groups/${groupId}/items/${propertyId}`, {
                      method: "DELETE",
                      headers: {
                          "Authorization": `Bearer ${token}`
                      }
                  });
                  
                  if (res.ok) {
                      this.loadCompareGroups();
                  } else {
                      alert("삭제 실패");
                  }
              } catch (err) {
                  console.error(err);
                  alert("오류 발생");
              }
          });
      });
      
      // 그룹 카드 클릭 이벤트 (확장/축소)
      listEl.querySelectorAll(".group-card-toggle").forEach(card => {
          card.addEventListener("click", (e) => {
              // 버튼 클릭 등은 제외
              if (e.target.closest("button") || e.target.closest(".property-card-btn")) return;
              
              const groupId = card.getAttribute("data-group-id");
              const itemsDiv = document.getElementById(`group-items-${groupId}`);
              const iconDiv = card.querySelector(`.group-expanded-icon-${groupId}`);
              
              if (itemsDiv) {
                  if (itemsDiv.classList.contains("hidden")) {
                      itemsDiv.classList.remove("hidden");
                      if (iconDiv) iconDiv.classList.add("rotate-180");
                  } else {
                      itemsDiv.classList.add("hidden");
                      if (iconDiv) iconDiv.classList.remove("rotate-180");
                  }
              }
          });
      });

    } catch (err) {
      console.error(err);
      listEl.innerHTML = "<p class='text-center text-gray-500 py-4'>목록을 불러올 수 없습니다.</p>";
    }
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
            <span id="compare-group-count" class="text-sm text-gray-700">비교 그룹 로딩 중...</span>
            <button
              id="create-compare-group-btn"
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

      <!-- 새 그룹 생성 모달 -->
      <div id="create-group-modal" class="hidden absolute top-0 right-[525px] w-[300px] bg-white rounded-lg shadow-xl border border-gray-200 z-30 p-4 transform transition-all duration-200 ease-in-out scale-95 opacity-0">
        <h3 class="text-lg font-bold text-gray-800 mb-3">새 비교 그룹 만들기</h3>
        <input 
          type="text" 
          id="new-group-name-input" 
          placeholder="그룹 이름 (예: 강남 아파트)" 
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3 text-sm"
        >
        <div class="flex justify-end gap-2">
          <button id="cancel-create-group-btn" class="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors">취소</button>
          <button id="confirm-create-group-btn" class="px-3 py-1.5 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors font-medium">생성</button>
        </div>
      </div>
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

        <!-- 광고 이미지 -->
        <div class="mb-4 flex-shrink-0">
          <img src="/images/forsale.png" alt="광고" class="w-full rounded-xl shadow-md object-cover">
        </div>

        <!-- 탭 네비게이션 -->
        <div class="mb-4 flex-shrink-0">
          <div class="flex border-b border-gray-200">
            <button
              id="ownership-tab"
              class="flex-1 px-4 py-2 text-center border-b-2 border-blue-500 text-blue-600 font-medium"
              onclick="propertyManagement.switchTab('ownership')"
            >
              내 매물 현황
            </button>
            <button
              id="sales-tab"
              class="flex-1 px-4 py-2 text-center border-b-2 border-transparent text-gray-500 hover:text-gray-700"
              onclick="propertyManagement.switchTab('sales')"
            >
              내 판매 매물 현황
            </button>
          </div>
        </div>

        <!-- 내 매물 현황 탭 콘텐츠 -->
        <div id="ownership-content" class="flex-col flex-grow overflow-hidden" style="display: flex;">
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

          <!-- 필터 영역 -->
          <div class="mb-4 flex-shrink-0">
            <div class="flex items-center justify-between gap-3">

              <!-- 상태 세그먼트 -->
              <div class="inline-flex bg-gray-100 rounded-full p-0.5 flex-1">
                <button
                  id="property-all-tab"
                  class="flex-1 px-3 py-1.5 text-[11px] rounded-full bg-white text-gray-900 font-medium shadow-sm"
                  onclick="propertyManagement.filterProperties('ALL', propertyManagement.currentTypeFilter || 'ALL')"
                >
                  전체
                </button>
                <button
                  id="property-pending-tab"
                  class="flex-1 px-3 py-1.5 text-[11px] rounded-full text-gray-600 hover:bg-gray-200"
                  onclick="propertyManagement.filterProperties('PENDING', propertyManagement.currentTypeFilter || 'ALL')"
                >
                  심사 중
                </button>
                <button
                  id="property-approved-tab"
                  class="flex-1 px-3 py-1.5 text-[11px] rounded-full text-gray-600 hover:bg-gray-200"
                  onclick="propertyManagement.filterProperties('APPROVED', propertyManagement.currentTypeFilter || 'ALL')"
                >
                  승인됨
                </button>
                <button
                  id="property-rejected-tab"
                  class="flex-1 px-3 py-1.5 text-[11px] rounded-full text-gray-600 hover:bg-gray-200"
                  onclick="propertyManagement.filterProperties('REJECTED', propertyManagement.currentTypeFilter || 'ALL')"
                >
                  거절됨
                </button>
              </div>

              <!-- 유형 드롭다운 (라벨 없음) -->
              <select
                id="type-filter-select"
                class="text-[11px] border border-gray-300 rounded-full px-3 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                onchange="propertyManagement.filterProperties(propertyManagement.currentStatusFilter || 'ALL', this.value)"
              >
                <option value="ALL">전체</option>
                <option value="SIMPLE">단순</option>
                <option value="SALE">판매</option>
              </select>
            </div>
          </div>

          <!-- 스크롤 가능한 내 매물 목록 영역 -->
          <div class="flex-grow overflow-y-auto custom-scrollbar pr-2 -mr-2">
            <div id="my-property-list" class="space-y-4">
              <!-- JavaScript로 내 매물 목록이 여기에 추가됩니다. -->
            </div>
          </div>
        </div>

        <!-- 내 판매 매물 현황 탭 콘텐츠 -->
        <div id="sales-content" class="flex-col flex-grow overflow-hidden" style="display: none;">
          <!-- 판매 매물 필터 (상태 세그먼트 + 상태 드롭다운) -->
          <div class="mb-4 flex-shrink-0">
            <div class="flex items-center justify-between gap-3">

              <!-- 거래 유형 세그먼트 -->
              <div class="inline-flex bg-gray-100 rounded-full p-0.5 flex-1">
                <button
                  id="sales-all-tab"
                  class="flex-1 px-3 py-1.5 text-[11px] rounded-full bg-white text-gray-900 font-medium shadow-sm"
                  onclick="propertyManagement.filterSalesProperties('ALL', propertyManagement.currentSalesActiveFilter || 'ALL')"
                >
                  전체
                </button>
                <button
                  id="sales-sale-tab"
                  class="flex-1 px-3 py-1.5 text-[11px] rounded-full text-gray-600 hover:bg-gray-200"
                  onclick="propertyManagement.filterSalesProperties('SALE', propertyManagement.currentSalesActiveFilter || 'ALL')"
                >
                  매매
                </button>
                <button
                  id="sales-jeonse-tab"
                  class="flex-1 px-3 py-1.5 text-[11px] rounded-full text-gray-600 hover:bg-gray-200"
                  onclick="propertyManagement.filterSalesProperties('JEONSE', propertyManagement.currentSalesActiveFilter || 'ALL')"
                >
                  전세
                </button>
                <button
                  id="sales-wolse-tab"
                  class="flex-1 px-3 py-1.5 text-[11px] rounded-full text-gray-600 hover:bg-gray-200"
                  onclick="propertyManagement.filterSalesProperties('WOLSE', propertyManagement.currentSalesActiveFilter || 'ALL')"
                >
                  월세
                </button>
              </div>

              <!-- 활성 여부 드롭다운 (라벨 없음) -->
              <select
                id="sales-active-select"
                class="text-[11px] border border-gray-300 rounded-full px-3 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                onchange="propertyManagement.filterSalesProperties(propertyManagement.currentSalesTransactionFilter || 'ALL', this.value)"
              >
                <option value="ALL">전체</option>
                <option value="ACTIVE">활성</option>
                <option value="INACTIVE">비활성</option>
              </select>
            </div>
          </div>

          <!-- 스크롤 가능한 판매 매물 목록 영역 -->
          <div class="flex-grow overflow-y-auto custom-scrollbar pr-2 -mr-2">
            <div id="sales-property-list" class="space-y-4">
              <!-- JavaScript로 판매 매물 목록이 여기에 추가됩니다. -->
            </div>
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
   * 커뮤니티 패널 HTML 생성 (인스타그램 피드 스타일)
   */
  renderCommunityPanel() {
    const dummyPosts = [
      {
        id: 1,
        author: '김철수',
        avatar: 'https://i.pravatar.cc/40?img=1',
        location: '강남구 역삼동',
        image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=400&fit=crop',
        likes: 128,
        comments: 24,
        content: '드디어 새 아파트로 이사했어요! 전망이 정말 좋네요 🏠',
        time: '2시간 전'
      },
      {
        id: 2,
        author: '이영희',
        avatar: 'https://i.pravatar.cc/40?img=2',
        location: '서초구 반포동',
        image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=400&fit=crop',
        likes: 256,
        comments: 42,
        content: '인테리어 리모델링 완료! 거실이 완전 달라졌어요 ✨',
        time: '5시간 전'
      },
      {
        id: 3,
        author: '박민수',
        avatar: 'https://i.pravatar.cc/40?img=3',
        location: '마포구 연남동',
        image: 'https://images.unsplash.com/photo-1484154218962-a197022b25ba?w=400&h=400&fit=crop',
        likes: 89,
        comments: 15,
        content: '연남동 숨은 루프탑 카페 발견! 동네 분위기 최고예요 ☕',
        time: '1일 전'
      },
      {
        id: 4,
        author: '최수진',
        avatar: 'https://i.pravatar.cc/40?img=4',
        location: '용산구 한남동',
        image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=400&fit=crop',
        likes: 342,
        comments: 67,
        content: '한남동 신축 빌라 구경 왔어요. 테라스가 넓어서 좋네요!',
        time: '2일 전'
      },
      {
        id: 5,
        author: '정우성',
        avatar: 'https://i.pravatar.cc/40?img=5',
        location: '송파구 잠실동',
        image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=400&fit=crop',
        likes: 512,
        comments: 89,
        content: '잠실 한강뷰 아파트에서 바라본 야경입니다 🌃',
        time: '3일 전'
      }
    ];

    const postsHTML = dummyPosts.map(post => `
      <div class="bg-white border border-gray-200 rounded-lg mb-4">
        <!-- 포스트 헤더 -->
        <div class="flex items-center p-3">
          <img src="${post.avatar}" alt="${post.author}" class="w-10 h-10 rounded-full object-cover" />
          <div class="ml-3 flex-1">
            <p class="font-semibold text-sm text-gray-800">${post.author}</p>
            <p class="text-xs text-gray-500">${post.location}</p>
          </div>
          <button class="p-1 hover:bg-gray-100 rounded-full">
            <svg class="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
              <circle cx="4" cy="10" r="2" />
              <circle cx="10" cy="10" r="2" />
              <circle cx="16" cy="10" r="2" />
            </svg>
          </button>
        </div>
        
        <!-- 포스트 이미지 -->
        <img src="${post.image}" alt="Post" class="w-full aspect-square object-cover" />
        
        <!-- 액션 버튼 -->
        <div class="flex items-center justify-between p-3">
          <div class="flex items-center space-x-4">
            <button class="hover:text-red-500 transition-colors">
              <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
            <button class="hover:text-blue-500 transition-colors">
              <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </button>
            <button class="hover:text-blue-500 transition-colors">
              <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
          </div>
          <button class="hover:text-yellow-500 transition-colors">
            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
        </div>
        
        <!-- 좋아요 수 -->
        <div class="px-3 pb-1">
          <p class="font-semibold text-sm">좋아요 ${post.likes.toLocaleString()}개</p>
        </div>
        
        <!-- 콘텐츠 -->
        <div class="px-3 pb-2">
          <p class="text-sm"><span class="font-semibold">${post.author}</span> ${post.content}</p>
        </div>
        
        <!-- 댓글 보기 -->
        <div class="px-3 pb-2">
          <button class="text-sm text-gray-500 hover:text-gray-700">댓글 ${post.comments}개 모두 보기</button>
        </div>
        
        <!-- 시간 -->
        <div class="px-3 pb-3">
          <p class="text-xs text-gray-400">${post.time}</p>
        </div>
      </div>
    `).join('');

    return `
      <!-- =================================================================== -->
      <!-- 커뮤니티 패널 (인스타그램 피드 스타일)                                  -->
      <!-- =================================================================== -->
      <aside
        id="community-panel"
        class="absolute top-0 w-[450px] bg-gray-50 p-0 flex flex-col h-full shadow-lg z-20 transform translate-x-full transition-transform duration-300 ease-in-out"
        style="right: 75px"
      >
        <!-- 커뮤니티 패널 헤더 -->
        <div
          class="flex justify-between items-center p-4 bg-white border-b flex-shrink-0 sticky top-0 z-10"
        >
          <h2 class="text-xl font-bold text-gray-800">커뮤니티</h2>
          <button
            id="close-community-panel"
            class="p-2 rounded-full hover:bg-gray-200 transition-colors"
            title="커뮤니티 패널 닫기"
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

        <!-- 스토리 영역 -->
        <div class="bg-white border-b p-4 flex-shrink-0">
          <div class="flex space-x-4 overflow-x-auto pb-2">
            <div class="flex flex-col items-center space-y-1 flex-shrink-0">
              <div class="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 p-0.5">
                <div class="w-full h-full rounded-full bg-white p-0.5">
                  <img src="https://i.pravatar.cc/60?img=10" class="w-full h-full rounded-full object-cover" />
                </div>
              </div>
              <span class="text-xs">내 스토리</span>
            </div>
            <div class="flex flex-col items-center space-y-1 flex-shrink-0">
              <div class="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 p-0.5">
                <div class="w-full h-full rounded-full bg-white p-0.5">
                  <img src="https://i.pravatar.cc/60?img=11" class="w-full h-full rounded-full object-cover" />
                </div>
              </div>
              <span class="text-xs">강남맘</span>
            </div>
            <div class="flex flex-col items-center space-y-1 flex-shrink-0">
              <div class="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 p-0.5">
                <div class="w-full h-full rounded-full bg-white p-0.5">
                  <img src="https://i.pravatar.cc/60?img=12" class="w-full h-full rounded-full object-cover" />
                </div>
              </div>
              <span class="text-xs">부동산팁</span>
            </div>
            <div class="flex flex-col items-center space-y-1 flex-shrink-0">
              <div class="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 p-0.5">
                <div class="w-full h-full rounded-full bg-white p-0.5">
                  <img src="https://i.pravatar.cc/60?img=13" class="w-full h-full rounded-full object-cover" />
                </div>
              </div>
              <span class="text-xs">인테리어</span>
            </div>
            <div class="flex flex-col items-center space-y-1 flex-shrink-0">
              <div class="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 p-0.5">
                <div class="w-full h-full rounded-full bg-white p-0.5">
                  <img src="https://i.pravatar.cc/60?img=14" class="w-full h-full rounded-full object-cover" />
                </div>
              </div>
              <span class="text-xs">이사후기</span>
            </div>
          </div>
        </div>

        <!-- 스크롤 가능한 피드 영역 -->
        <div class="flex-grow overflow-y-auto custom-scrollbar p-4">
          <div id="community-feed">
            ${postsHTML}
          </div>
        </div>
      </aside>
    `;
  },

  /**
   * 경매 패널 HTML 생성
   */
  renderAuctionPanel() {
    const dummyAuctions = [
      {
        id: 1,
        title: '강남구 역삼동 아파트 경매',
        image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop',
        currentBid: '12억 5,000만원',
        timeLeft: '2시간 30분',
        bidders: 15,
        status: '진행중'
      },
      {
        id: 2,
        title: '서초구 반포동 빌라 경매',
        image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop',
        currentBid: '8억 2,000만원',
        timeLeft: '5시간 10분',
        bidders: 8,
        status: '진행중'
      },
      {
        id: 3,
        title: '마포구 연남동 상가 경매',
        image: 'https://images.unsplash.com/photo-1484154218962-a197022b25ba?w=400&h=300&fit=crop',
        currentBid: '25억 1,000만원',
        timeLeft: '1일 4시간',
        bidders: 24,
        status: '진행중'
      }
    ];

    const auctionsHTML = dummyAuctions.map(auction => `
      <div class="bg-white border border-gray-200 rounded-lg mb-4 overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
        <div class="relative h-40">
          <img src="${auction.image}" alt="${auction.title}" class="w-full h-full object-cover" />
          <div class="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
            ${auction.timeLeft} 남음
          </div>
        </div>
        <div class="p-4">
          <h3 class="font-bold text-gray-800 mb-1 truncate">${auction.title}</h3>
          <div class="flex justify-between items-end mt-2">
            <div>
              <p class="text-xs text-gray-500">현재 최고가</p>
              <p class="text-lg font-bold text-blue-600">${auction.currentBid}</p>
            </div>
            <div class="text-right">
              <p class="text-xs text-gray-500">입찰자</p>
              <p class="text-sm font-medium text-gray-700">${auction.bidders}명</p>
            </div>
          </div>
          <button class="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors text-sm">
            입찰하기
          </button>
        </div>
      </div>
    `).join('');

    return `
      <!-- =================================================================== -->
      <!-- 경매 패널                                                          -->
      <!-- =================================================================== -->
      <aside
        id="auction-panel"
        class="absolute top-0 w-[450px] bg-gray-50 p-0 flex flex-col h-full shadow-lg z-20 transform translate-x-full transition-transform duration-300 ease-in-out"
        style="right: 75px"
      >
        <!-- 경매 패널 헤더 -->
        <div
          class="flex justify-between items-center p-4 bg-white border-b flex-shrink-0 sticky top-0 z-10"
        >
          <div class="flex items-center gap-2">
            <h2 class="text-xl font-bold text-gray-800">실시간 경매</h2>
            <span class="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">LIVE</span>
          </div>
          <button
            id="close-auction-panel"
            class="p-2 rounded-full hover:bg-gray-200 transition-colors"
            title="경매 패널 닫기"
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

        <!-- 필터 영역 -->
        <div class="bg-white border-b p-3 flex-shrink-0 flex gap-2 overflow-x-auto">
          <button class="px-3 py-1 bg-gray-800 text-white text-sm rounded-full whitespace-nowrap">전체</button>
          <button class="px-3 py-1 bg-gray-100 text-gray-600 hover:bg-gray-200 text-sm rounded-full whitespace-nowrap">아파트</button>
          <button class="px-3 py-1 bg-gray-100 text-gray-600 hover:bg-gray-200 text-sm rounded-full whitespace-nowrap">빌라</button>
          <button class="px-3 py-1 bg-gray-100 text-gray-600 hover:bg-gray-200 text-sm rounded-full whitespace-nowrap">상가</button>
          <button class="px-3 py-1 bg-gray-100 text-gray-600 hover:bg-gray-200 text-sm rounded-full whitespace-nowrap">토지</button>
        </div>

        <!-- 스크롤 가능한 경매 목록 영역 -->
        <div class="flex-grow overflow-y-auto custom-scrollbar p-4">
          <div id="auction-list">
            ${auctionsHTML}
          </div>
        </div>
      </aside>
    `;
  },

  formatPrice(price) {
      if (!price) return "가격 정보 없음";
      const 억 = Math.floor(price / 100000000);
      const 만 = Math.floor((price % 100000000) / 10000);
      if (억 > 0 && 만 > 0) return `${억}억 ${만}만원`;
      if (억 > 0) return `${억}억원`;
      return `${만}만원`;
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
      ${this.renderCommunityPanel()}
      ${this.renderAuctionPanel()}
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
      "chat-panel",
      "profile-panel",
      "notification-panel",
      "favorite-panel",
      "compare-panel",
      "community-panel",
      "auction-panel",
      "my-property-panel",
      "broker-list-panel",
    ];

    panelIds.forEach((id) => {
      const existing = document.getElementById(id);
      if (existing) {
        existing.remove();
      }
    });

    // right-side-panel 앞에 삽입
    const rightSidePanel = document.getElementById("right-side-panel");
    if (rightSidePanel) {
      rightSidePanel.insertAdjacentHTML("beforebegin", panelsHTML);
    } else {
      // right-side-panel이 없으면 body에 추가
      document.body.insertAdjacentHTML("beforeend", panelsHTML);
    }
    this.loadFavoriteList();

    // 비교 그룹 생성 버튼 이벤트 (모달 열기)
    const createGroupBtn = document.getElementById("create-compare-group-btn");
    const modal = document.getElementById("create-group-modal");
    const nameInput = document.getElementById("new-group-name-input");
    const cancelBtn = document.getElementById("cancel-create-group-btn");
    const confirmBtn = document.getElementById("confirm-create-group-btn");

    if (createGroupBtn && modal) {
      createGroupBtn.addEventListener("click", () => {
        modal.classList.remove("hidden");
        // 약간의 지연 후 애니메이션 적용
        setTimeout(() => {
            modal.classList.remove("scale-95", "opacity-0");
            modal.classList.add("scale-100", "opacity-100");
        }, 10);
        nameInput.focus();
      });

      const closeModal = () => {
          modal.classList.remove("scale-100", "opacity-100");
          modal.classList.add("scale-95", "opacity-0");
          setTimeout(() => {
              modal.classList.add("hidden");
              nameInput.value = "";
          }, 200);
      };

      cancelBtn.addEventListener("click", closeModal);

      confirmBtn.addEventListener("click", async () => {
        const token = localStorage.getItem("accessToken") || "";
        const name = nameInput.value.trim();
        
        if (!name) {
            alert("그룹 이름을 입력해주세요.");
            return;
        }

        try {
          const res = await fetch("/api/comparisons/groups", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ name: name }),
          });

          if (res.ok) {
            this.loadCompareGroups();
            closeModal();
          } else {
            alert("그룹 생성 실패");
          }
        } catch (e) {
          console.error(e);
          alert("그룹 생성 중 오류 발생");
        }
      });
      
      // 엔터키 입력 시 생성
      nameInput.addEventListener("keypress", (e) => {
          if (e.key === "Enter") confirmBtn.click();
      });
    }

    // 전역 함수로 노출 (panel-manager.js에서 호출)
    window.renderCompareGroups = () => this.loadCompareGroups();

    // 초기 로드
    this.loadCompareGroups();

    console.log("[RightSidePanels] 우측 패널들 초기화 완료");
  },
};

// 전역으로 노출
window.RightSidePanels = RightSidePanels;

// DOM 로드 완료 후 패널 초기화
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    RightSidePanels.init();
  });
} else {
  RightSidePanels.init();
}
