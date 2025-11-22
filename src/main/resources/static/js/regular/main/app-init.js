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






document.addEventListener("DOMContentLoaded", () => {
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

  // 즐겨찾기 매물 렌더링
  function renderFavoriteProperties() {
    if (
      !favoriteList ||
      typeof favoriteProperties === "undefined" ||
      typeof createFavoritePropertyCard !== "function"
    )
      return;
    favoriteList.innerHTML = "";
    favoriteProperties.forEach((property) => {
      favoriteList.innerHTML += createFavoritePropertyCard(property);
    });
  }
  window.renderFavoriteProperties = renderFavoriteProperties;

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

  // 프로필 패널 기능
  if (profilePanel) {
    profilePanel
      .querySelector('button[type="button"]')
      ?.addEventListener("click", () => {
        document.getElementById("profile-image-input")?.click();
      });

    document
      .getElementById("profile-image-input")
      ?.addEventListener("change", function (e) {
        if (e.target.files && e.target.files[0]) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const profileImage = document.getElementById("profile-image");
            if (profileImage) profileImage.src = event.target.result;
          };
          reader.readAsDataURL(e.target.files[0]);
        }
      });

    document
      .getElementById("profile-form")
      ?.addEventListener("submit", function (e) {
        e.preventDefault();
        const formData = new FormData(this);
        const profileData = Object.fromEntries(formData.entries());
        console.log("프로필 업데이트:", profileData);
        alert("프로필이 성공적으로 업데이트되었습니다.");
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
    // 지도가 준비될 때까지 대기
    if (!window.__naverMap) {
      await new Promise(resolve => {
        window.addEventListener('map:ready', resolve, { once: true });
      });
    }

    // 실제 API에서 매물 목록 가져오기
    try {
      const map = window.__naverMap;
      const bounds = map.getBounds();
      const sw = bounds.getSW();
      const ne = bounds.getNE();

      // propertiesApi.js의 fetchPropertiesInBounds 사용
      const response = await fetch('/api/properties?' + new URLSearchParams({
        swLat: sw.y,
        swLng: sw.x,
        neLat: ne.y,
        neLng: ne.x,
        status: 'AVAILABLE'
      }), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken') || ''}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch properties');

      const raw = await response.json();
      console.log("🟡 /api/properties 응답 =", raw);

      // 응답이 배열이 아니면 content/items 속성도 시도
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

      // API 데이터를 UI 컴포넌트가 기대하는 형식으로 변환
      const loadedProperties = apiProperties.map(prop => {
        const offers = prop.property_offers || prop.propertyOffers || [];
        const activeOffers =
          offers.filter(o => (o.is_active !== undefined ? o.is_active : o.isActive));
        const mainOffer = activeOffers[0] || offers[0] || null;

        const priceText = formatPriceFromOffers({
          ...prop,
          property_offers: offers
        });

        let options = [];
        if (mainOffer && mainOffer.oftion != null) {
          options = parseOptions(mainOffer.oftion);
        }

        const tags = [
          ...(prop.status === 'AVAILABLE' ? ['거래가능'] : []),
          '판매등록완료'
        ];

          // 🔵 이미지: property_images(image_url)도 같이 본다
          let imageUrl =
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=400';

          const imgArr = prop.images || prop.property_images || prop.propertyImages;
          if (Array.isArray(imgArr) && imgArr.length > 0) {
            const img0 = imgArr[0];
            imageUrl = img0.url || img0.imgUrl || img0.imageUrl || img0.image_url || imageUrl;
          }


        return {
          id: prop.id,
          image: imageUrl,
          price: priceText,
          priceText,
          location: prop.address || '위치 정보 없음',
          address: prop.address,
          title: prop.title || prop.address,
          details: prop.title || '상세 정보 없음',
          tags,
          options,
          isRecommended: false,
          status: prop.status || 'AVAILABLE',
          areaM2: prop.areaM2 ?? prop.area_m2,
          buildingYear: prop.buildingYear ?? prop.building_year,
          description: prop.title || '상세 정보 없음',
          brokerName: prop.brokerName || prop.ownerName || '',
          brokerPhone: '',
          offers,
          images: imgArr || [],
          maintenanceFee: mainOffer.maintenance_fee ?? null,
          _raw: prop
        };
      });


    // 전역 properties 배열 업데이트 (property-detail-panel.js에서 사용)
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
          recommendedList.innerHTML += cardHTML;
        } else {
          propertyList.innerHTML += cardHTML;
        }
      });

        console.log(`✅ ${loadedProperties.length}개의 판매 등록 완료 매물을 표시했습니다.`);
        console.log('조건: 소유권 승인(APPROVED) + 판매 매물 등록(isActive=true)');
      }
    } catch (error) {
      console.error('매물 목록 로드 실패:', error);
      // 에러 시 더미 데이터 폴백
      /*
      if (
        propertyList &&
        recommendedList &&
        typeof properties !== "undefined" &&
        typeof createPropertyCard === "function"
      ) {
        properties.forEach((prop, index) => {
          const cardHTML = createPropertyCard(prop, index);
          if (prop.isRecommended) {
            recommendedList.innerHTML += cardHTML;
          } else {
            propertyList.innerHTML += cardHTML;
          }
        });
      }
      */
    }
  }

  initialRender();
});
