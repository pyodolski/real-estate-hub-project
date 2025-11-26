// js/app-init.js
// oftion 비트를 옵션 배열로 변환
function parseOptions(oftionBit) {
  if (oftionBit == null) return [];

  const optionNames = [
    '에어컨', '냉장고', '세탁기', '가스레인지', '인덕션레인지',
    '침대', '전자레인지', 'TV', '책상', 'CCTV'
  ];

  const bits = oftionBit.split(""); // 문자열 -> ['1','0','0','1',...]
  const options = [];

  // oftionBit 의 길이가 optionNames 와 같은 순서라고 가정
  // 왼쪽부터 순서 그대로 읽음 (ex: "101" → [첫번째 옵션, 세번째 옵션])
  for (let i = 0; i < optionNames.length; i++) {
    if (bits[i] === "1") {
      options.push(optionNames[i]);
    }
  }

  return options;
}
// offers 배열 기반 가격 포맷
function formatPriceFromOffers(property) {
  const offers = property.property_offers || property.propertyOffers || property.offers || [];
  const offer = offers[0]; // 일단 대표 1개만
  console.log("offer", offer);
  // 오퍼가 없으면 fallback
  if (!offer) {
    console.log("offer 없음", offer);
    return property.price != null ? Number(property.price).toLocaleString() : '가격 정보 없음';
  }

  const type = offer.type; // "SALE" | "JEONSE" | "WOLSE"
  const total = offer.total_price != null ? Number(offer.total_price) : null;
  const deposit = offer.deposit != null ? Number(offer.deposit) : null;
  const monthly = offer.monthly_rent != null ? Number(offer.monthly_rent) : null;

  if (type === 'SALE') {
    if (total == null) return '매매가 협의';
    const eok = Math.floor(total / 100000000);    // 1억
    const man = Math.round((total % 100000000) / 10000);
    return eok > 0 ? `매매 ${eok}억${man ? ' ' + man + '만' : ''}` : `매매 ${man}만`;
  }

  if (type === 'JEONSE') {
    if (total == null) return '전세가 협의';
    const eok = Math.floor(total / 100000000);
    const man = Math.round((total % 100000000) / 10000);
    return eok > 0 ? `전세 ${eok}억${man ? ' ' + man + '만' : ''}` : `전세 ${man}만`;
  }

  if (type === 'WOLSE') {
    if (deposit == null || monthly == null) return '월세 협의';
    const man = Math.floor(deposit / 10000);
    const wol = Math.floor(monthly / 10000);
    // 예: 월세 1,000/50 ➜ "월세 1000만 / 50만"
    return `월세 ${man ? man + '만 / ' : ''}${wol}만`;
  }

  return property.price != null ? Number(property.price).toLocaleString() : '가격 정보 없음';
}

/**
 * Search API(PropertyFilterDto) 용 가격 포맷
 *  - offerType / totalPrice / deposit / monthlyRent 사용
 */
function formatPriceFromSearchDto(prop) {
  const type = prop.offerType; // "SALE" | "JEONSE" | "WOLSE"
  const total = prop.totalPrice != null ? Number(prop.totalPrice) : null;
  const deposit = prop.deposit != null ? Number(prop.deposit) : null;
  const monthly = prop.monthlyRent != null ? Number(prop.monthlyRent) : null;

  if (type === 'SALE') {
    if (total == null) return '매매가 협의';
    const eok = Math.floor(total / 100000000);
    const man = Math.round((total % 100000000) / 10000);
    return eok > 0 ? `매매 ${eok}억${man ? ' ' + man + '만' : ''}` : `매매 ${man}만`;
  }

  if (type === 'JEONSE') {
    const base = total != null ? total : deposit;
    if (base == null) return '전세가 협의';
    const eok = Math.floor(base / 100000000);
    const man = Math.round((base % 100000000) / 10000);
    return eok > 0 ? `전세 ${eok}억${man ? ' ' + man + '만' : ''}` : `전세 ${man}만`;
  }

  if (type === 'WOLSE') {
    if (deposit == null || monthly == null) return '월세 협의';
    const man = Math.floor(deposit / 10000);
    const wol = Math.floor(monthly / 10000);
    return `월세 ${man ? man + '만 / ' : ''}${wol}만`;
  }

  return '가격 정보 없음';
}





document.addEventListener("DOMContentLoaded", () => {

  let profileImageFile = null;
  // --- DOM 요소 ---
  const propertyList = document.getElementById("property-list");
  const recommendedList = document.getElementById("recommended-list");
  const favoriteList = document.getElementById("favorite-list");
  const compareList = document.getElementById("compare-list");
  const notificationList = document.getElementById("notification-list");
  const chatListContainer = document.getElementById("chat-list");
  const profilePanel = document.getElementById("profile-panel");

  // --- 내 매물 관리 스크립트는 이미 loginO.html에서 로드됨 ---
  // property-management.js는 loginO.html의 <script src="js/regular/main/property-management.js"></script>에서 이미 로드됨

  // --- 데이터 렌더링 함수 ---

  // 알림 렌더링 - notification-management.js에서 처리
  function renderNotifications() {
    if (window.notificationManagement) {
      window.notificationManagement.loadNotifications();
    }
  }
  // 다른 스크립트(panel-manager.js)에서 호출할 수 있도록 window 객체에 할당
  window.renderNotifications = renderNotifications;

  // 즐겨찾기 매물 렌더링 (favorites.js의 loadFavorites 사용 권장)
  // panel-manager.js에서 renderFavoriteProperties를 호출하므로, 
  // favorites.js의 loadFavorites를 연결해줍니다.
  window.renderFavoriteProperties = function() {
      if (typeof window.loadFavorites === 'function') {
          window.loadFavorites();
      }
  };

  // 비교 그룹 렌더링
  function renderCompareGroups() {
    if (
      !compareList ||
      typeof compareGroups === "undefined" ||
      typeof createCompareCard !== "function"
    )
      return;
    compareList.innerHTML = "";
    compareGroups.forEach((group) => {
      const itemsHTML = group.items.map(createCompareCard).join("");
      const groupHTML = `
                <div class="bg-gray-50 border rounded-lg p-3">
                    <div class="flex items-center justify-between mb-2">
                        <p class="text-sm font-semibold text-gray-700">그룹 #${group.groupId}</p>
                        <div class="text-[11px] text-gray-500">매물 ${group.items.length}개</div>
                    </div>
                    <div class="flex flex-col gap-3">
                        ${itemsHTML}
                    </div>
                </div>
            `;
      compareList.innerHTML += groupHTML;
    });
  }
  window.renderCompareGroups = renderCompareGroups;

  // 채팅 목록 렌더링
  function renderChatList(data) {
    if (
      !chatListContainer ||
      typeof chatData === "undefined" ||
      typeof createChatCard !== "function"
    )
      return;
    const chatsToRender = data || chatData;
    chatListContainer.innerHTML = "";
    chatsToRender.forEach((chat) => {
      chatListContainer.innerHTML += createChatCard(chat);
    });
  }
  window.renderChatList = renderChatList;

  // 채팅 검색 초기화
  function initializeChatSearch() {
    const searchInput = document.querySelector(
      '#chat-panel input[placeholder="채팅방 검색"]'
    );
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        const searchTerm = e.target.value.toLowerCase();
        if (typeof chatData !== "undefined") {
          const filteredChats = chatData.filter(
            (chat) =>
              chat.name.toLowerCase().includes(searchTerm) ||
              chat.lastMessage.toLowerCase().includes(searchTerm) ||
              chat.property.toLowerCase().includes(searchTerm)
          );
          renderChatList(filteredChats);
        }
      });
    }
  }
  window.initializeChatSearch = initializeChatSearch;

  // --- 패널 내부 기능 및 이벤트 리스너 ---

  // 알림: 모든 알림 읽음 처리
  document
    .getElementById("mark-all-read-button")
    ?.addEventListener("click", () => {
      if (window.notificationManagement) {
        window.notificationManagement.markAllAsRead();
      }
    });

  // 비교: 새 그룹 추가
  document
    .getElementById("add-compare-group-button")
    ?.addEventListener("click", () => {
      if (typeof compareGroups !== "undefined") {
        const newGroupId =
          compareGroups.length > 0
            ? Math.max(...compareGroups.map((g) => g.groupId)) + 1
            : 1;
        compareGroups.push({ groupId: newGroupId, items: [] });
        renderCompareGroups();
      }
    });

  // 내 매물: 새 매물 등록
    document
      .getElementById("add-new-property-button")
      ?.addEventListener("click", () => {
        alert("새 매물 등록 페이지로 이동합니다.");
      });

    // 🔹 프로필 패널 기능
    if (profilePanel) {
      const profileForm     = document.getElementById("profile-form");
      const profileImageEl  = document.getElementById("profile-image");
      const profileImageBtn = document.getElementById("profile-image-edit-btn");
      const profileImageInp = document.getElementById("profile-image-input");

      const emailInput      = document.getElementById("email");
      const phoneInput      = document.getElementById("phone");
      const introTextarea   = document.getElementById("intro");
      const currentPwInput  = document.getElementById("currentPassword");
      const newPwInput      = document.getElementById("newPassword");
      const pwChangeBtn     = document.getElementById("pw-change-btn");

      // 1) /api/users/me 에서 내 프로필 가져오기
      async function loadMyProfile() {
        try {
          const token = localStorage.getItem("accessToken") || "";

          const res = await fetch("/api/users/me", {
            headers: {
              "Authorization": token ? `Bearer ${token}` : undefined,
            },
          });

          if (!res.ok) {
            console.error("프로필 조회 실패", await res.text());
            return;
          }

          const data = await res.json();
          console.log("[PROFILE] /api/users/me =", data);

          if (emailInput)    emailInput.value    = data.email ?? "";
          if (phoneInput)    phoneInput.value    = data.phoneNumber ?? "";
          if (introTextarea) introTextarea.value = data.intro ?? "";
          if (profileImageEl) {
            profileImageEl.src = data.profileImageUrl
              || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face";
          }
        } catch (e) {
          console.error("프로필 조회 에러", e);
        }
      }

      // 처음 한 번 로딩
      loadMyProfile();
      window.loadMyProfile = loadMyProfile;

      // 프로필 사진 선택 & 미리보기
      if (profileImageBtn && profileImageInp) {
        // 연필 버튼 눌렀을 때 파일 선택창 열기
        profileImageBtn.addEventListener("click", () => {
          profileImageInp.click();
        });

        // 파일 선택 시 미리보기 + 업로드용 파일 저장
        profileImageInp.addEventListener("change", (e) => {
          const file = e.target.files && e.target.files[0];
          if (!file) return;

          // 전역 변수에 파일 저장 (위에서 let profileImageFile = null; 선언한 거)
          profileImageFile = file;

          // 로컬 미리보기
          const reader = new FileReader();
          reader.onload = (event) => {
            if (profileImageEl) {
              profileImageEl.src = event.target.result;
            }
          };
          reader.readAsDataURL(file);
        });
      }

      // 프로필 저장 → PUT /api/users/me
      profileForm?.addEventListener("submit", async (e) => {
        e.preventDefault();

        const token = localStorage.getItem("accessToken") || "";

        try {
          // 1) 이미지 파일이 선택돼 있으면 먼저 업로드해서 URL 받기
          let imageUrl = profileImageEl?.src ?? null;

          if (profileImageFile) {
            const formData = new FormData();
            formData.append("file", profileImageFile);

            const uploadRes = await fetch("/api/users/me/profile-image", {
              method: "POST",
              headers: {
                // ⚠️ Content-Type 넣지 말고 Authorization 만
                "Authorization": token ? `Bearer ${token}` : undefined,
              },
              body: formData,
            });

            if (!uploadRes.ok) {
              const txt = await uploadRes.text();
              console.error("프로필 이미지 업로드 실패", txt);
              alert("프로필 이미지 업로드에 실패했습니다.\n" + txt);
              return;
            }

            const uploadJson = await uploadRes.json(); // { imageUrl: "..." }
                  console.log("[PROFILE] uploadJson =", uploadJson);
                  imageUrl = uploadJson.imageUrl;
          }

          // 2) 프로필 정보 업데이트
          const payload = {
            currentPassword:  currentPwInput?.value || "",
            intro:            introTextarea?.value ?? null,
            phoneNumber:      phoneInput?.value ?? null,   // ← 전화번호도 같이 보낼거면
            profileImageUrl:  imageUrl,
            // tags 는 건드리지 않을거면 생략
          };

          const res = await fetch("/api/users/me", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "Authorization": token ? `Bearer ${token}` : undefined,
            },
            body: JSON.stringify(payload),
          });

          if (!res.ok) {
            const text = await res.text();
            console.error("프로필 수정 실패", text);
            alert("프로필 수정에 실패했습니다.\n" + text);
            return;
          }

          const updated = await res.json();
          console.log("[PROFILE] 업데이트 결과 =", updated);

          if (introTextarea)  introTextarea.value  = updated.intro ?? "";
          if (phoneInput)     phoneInput.value     = updated.phoneNumber ?? "";
          if (profileImageEl && updated.profileImageUrl) {
            profileImageEl.src = updated.profileImageUrl;
          }

          // 사용한 비밀번호는 다시 비우기
          if (currentPwInput) currentPwInput.value = "";
          profileImageFile = null;

          alert("프로필이 성공적으로 업데이트되었습니다.");
        } catch (err) {
          console.error("프로필 수정 에러", err);
          alert("프로필 수정 중 오류가 발생했습니다.");
        }
      });

      // 2) 비밀번호 변경 → POST /api/users/me/change-password
      pwChangeBtn?.addEventListener("click", async () => {
        const token   = localStorage.getItem("accessToken") || "";
        const current = currentPwInput?.value || "";
        const nextPw  = newPwInput?.value || "";

        if (!current || !nextPw) {
          alert("현재 비밀번호와 새 비밀번호를 모두 입력하세요.");
          return;
        }

        try {
          const res = await fetch("/api/users/me/change-password", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": token ? `Bearer ${token}` : undefined,
            },
            body: JSON.stringify({
              currentPassword: current,
              newPassword: nextPw,
            }),
          });

          if (!res.ok) {
            const txt = await res.text();
            alert("비밀번호 변경 실패:\n" + txt);
            return;
          }

          alert("비밀번호가 변경되었습니다.");
          if (currentPwInput) currentPwInput.value = "";
          if (newPwInput)     newPwInput.value = "";
        } catch (err) {
          console.error("비밀번호 변경 에러", err);
          alert("비밀번호 변경 중 오류가 발생했습니다.");
        }
      });
    }

  // --- 기타 이벤트 리스너 ---

  // 로그아웃 버튼
  const logoutButton = document.getElementById("logout-button");
  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      if (confirm("로그아웃 하시겠습니까?")) {
        // AuthUtils를 사용하여 모든 토큰 관련 데이터 제거
        if (typeof AuthUtils !== "undefined" && AuthUtils.removeToken) {
          AuthUtils.removeToken();
        } else {
          // Fallback: AuthUtils가 로드되지 않은 경우
          localStorage.removeItem("accessToken");
          localStorage.removeItem("access_token");
          sessionStorage.removeItem("accessToken");
          sessionStorage.removeItem("access_token");
        }
        // refreshToken도 제거
        localStorage.removeItem("refreshToken");
        sessionStorage.removeItem("refreshToken");

        // 로그인 페이지로 리다이렉트
        window.location.href = "/loginX.html";
      }
    });
  }

  // --- 초기 렌더링 ---
    async function initialRender() {
      // 0. 즐겨찾기 목록 먼저 로드 (하트 표시 위해)
      if (typeof window.loadFavorites === 'function') {
          await window.loadFavorites();
      }

      // 지도가 준비될 때까지 대기 (initmap.js에서 설정한 플래그 확인)
      if (!window.__MAP_IS_READY__) {
        console.log("[app-init] Waiting for map to be ready...");
        await new Promise(resolve => {
          window.addEventListener('map:ready', resolve, { once: true });
        });
      }
      console.log("[app-init] Map is ready, fetching properties...");

      try {
        const map = window.__naverMap;
        const bounds = map.getBounds();
        const sw = bounds.getSW();
        const ne = bounds.getNE();

        // 🔵 추천 적용 Search API 호출
        const response = await fetch('/api/properties/search-in-bounds?' + new URLSearchParams({
          swLat: sw.y,
          swLng: sw.x,
          neLat: ne.y,
          neLng: ne.x,
          page: 0,
          size: 100
          // houseTypes, offerTypes 같은 필터 쓰고 싶으면 여기 파라미터 더 추가
        }), {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken') || ''}`
          }
        });

        if (!response.ok) throw new Error('Failed to fetch properties(search-in-bounds)');

        const raw = await response.json();
        console.log("🟡 /api/properties/search-in-bounds 응답 =", raw);

        const apiProperties = Array.isArray(raw)
          ? raw
          : Array.isArray(raw.content)
            ? raw.content
            : Array.isArray(raw.items)
              ? raw.items
              : [];

        if (!Array.isArray(apiProperties)) {
          throw new Error('API 응답 형식이 배열이 아닙니다.');
        }

        // 🔵 PropertyFilterDto → 카드용 오브젝트로 변환
        const loadedProperties = apiProperties.map(prop => {
          const priceText = formatPriceFromSearchDto(prop);
          const options = prop.oftion ? parseOptions(prop.oftion) : [];

          const tags = [
            ...(prop.recommended ? ['추천매물'] : []),
            ...(prop.offerType === 'SALE'
              ? ['매매']
              : prop.offerType === 'JEONSE'
              ? ['전세']
              : prop.offerType === 'WOLSE'
              ? ['월세']
              : []),
          ];

          let imageUrl =
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=400';

          return {
            id: prop.propertyId || prop.id,
            image: imageUrl,
            price: priceText,
            priceText,
            location: prop.address || '위치 정보 없음',
            address: prop.address,
            title: prop.title || prop.address,
            details: prop.title || '상세 정보 없음',
            tags,
            options,
            isRecommended: !!prop.recommended,       // 🔵 추천 여부 여기!
            status: 'AVAILABLE',                     // 필요하면 DTO에 status 추가 후 사용
            areaM2: prop.area,
            buildingYear: prop.buildingYear ?? prop.building_year,
            description: prop.recommendReason || prop.title || '상세 정보 없음',
            brokerName: '',
            brokerPhone: '',
            offers: [],
            images: [],
            maintenanceFee: null,
            _raw: prop
          };
        });

        // 전역 properties 배열 업데이트
        if (typeof properties !== 'undefined') {
          properties.length = 0;
          properties.push(...loadedProperties);
        } else {
          window.properties = loadedProperties;
        }

        // 매물 목록 렌더링
        if (propertyList && recommendedList && typeof createPropertyCard === "function") {
          propertyList.innerHTML = '';
          recommendedList.innerHTML = '';

          loadedProperties.forEach((prop, index) => {
            const cardHTML = createPropertyCard(prop, index);
            if (prop.isRecommended) {
              recommendedList.innerHTML += cardHTML;  // 추천 리스트
            } else {
              propertyList.innerHTML += cardHTML;     // 일반 리스트
            }
          });

          console.log(`✅ ${loadedProperties.length}개의 매물을 표시했습니다.`);
          console.log('추천 매물 수:', loadedProperties.filter(p => p.isRecommended).length);
        }
      } catch (error) {
        console.error('매물 목록 로드 실패:', error);
      }
    }

    initialRender();
  });
