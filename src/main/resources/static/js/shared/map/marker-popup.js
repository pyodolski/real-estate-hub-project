// 작은 카드 팝업 렌더링 (recommend-list 카드 재사용)

// ==============================
// 1. oftion 비트를 옵션 배열로 변환
// ==============================
function parseOptions(oftionBit) {
  if (oftionBit == null) return [];

  const optionNames = [
    "에어컨", "냉장고", "세탁기", "가스레인지", "인덕션레인지",
    "침대", "전자레인지", "TV", "책상", "CCTV",
  ];

  const bitStr = String(oftionBit).padStart(optionNames.length, "0");

  const options = [];
  for (let i = 0; i < optionNames.length; i++) {
    if (bitStr[i] === "1") {
      options.push(optionNames[i]);
    }
  }
  return options;
}

// ==============================
// 2. 가격 포맷팅
//    - 1순위: 마커 DTO (offerType / totalPrice / deposit / monthlyRent)
//    - 2순위: property_offers 배열
// ==============================
function formatPrice(src) {
  const base = src._raw || src;

  // 🔵 마커 DTO 스타일 먼저 확인
  const markerOfferType = base.offerType || base.offer_type;
  const markerTotal = base.totalPrice ?? base.total_price ?? null;
  const markerDeposit = base.deposit ?? null;
  const markerMonthly = base.monthlyRent ?? base.monthly_rent ?? null;

  if (markerOfferType) {
    if (markerOfferType === "SALE") {
      if (markerTotal == null) return "매매가 협의";
      const total = Number(markerTotal);
      const eok = Math.floor(total / 100000000);
      const man = Math.round((total % 100000000) / 10000);
      return eok > 0
        ? `매매 ${eok}억${man ? " " + man + "만" : ""}`
        : `매매 ${man}만`;
    }

    if (markerOfferType === "JEONSE") {
      if (markerTotal == null) return "전세가 협의";
      const total = Number(markerTotal);
      const eok = Math.floor(total / 100000000);
      const man = Math.round((total % 100000000) / 10000);
      return eok > 0
        ? `전세 ${eok}억${man ? " " + man + "만" : ""}`
        : `전세 ${man}만`;
    }

    if (markerOfferType === "WOLSE") {
      if (markerDeposit == null || markerMonthly == null) return "월세 협의";
      const man = Math.floor(Number(markerDeposit) / 10000);
      const wol = Number(markerMonthly) / 10000;
      return `월세 ${man ? man + "만" : ""} / ${wol.toLocaleString() + "만"}`;
    }
  }

  // 🔹 그 다음: property_offers 배열 기반
  const offersSource =
    base.property_offers ||
    base.propertyOffers ||
    base.offers ||
    src.property_offers ||
    src.propertyOffers ||
    src.offers ||
    [];

  const offers = Array.isArray(offersSource) ? offersSource : [];
  const offer = offers[0];

  if (!offer) {
    return base.price != null ? Number(base.price).toLocaleString() : "-";
  }

  const type = offer.type;
  const total = offer.total_price != null ? Number(offer.total_price) : null;
  const deposit = offer.deposit != null ? Number(offer.deposit) : null;
  const monthly =
    offer.monthly_rent != null ? Number(offer.monthly_rent) : null;

  if (type === "SALE") {
    if (total == null) return "매매가 협의";
    const eok = Math.floor(total / 100000000);
    const man = Math.round((total % 100000000) / 10000);
    return eok > 0
      ? `매매 ${eok}억${man ? " " + man + "만" : ""}`
      : `매매 ${man}만`;
  }

  if (type === "JEONSE") {
    if (total == null) return "전세가 협의";
    const eok = Math.floor(total / 100000000);
    const man = Math.round((total % 100000000) / 10000);
    return eok > 0
      ? `전세 ${eok}억${man ? " " + man + "만" : ""}`
      : `전세 ${man}만`;
  }

  if (type === "WOLSE") {
    if (deposit == null || monthly == null) return "월세 협의";
    const man = Math.floor(deposit / 10000);
    const wol = monthly / 10000;
    return `월세 ${man ? man + "만" : ""} / ${wol.toLocaleString() + "만"}`;
  }

  return base.price != null ? Number(base.price).toLocaleString() : "-";
}

// ==============================
// 3. 백엔드 응답 → 카드용 변환
//    (마커 DTO + 일반 Property DTO 둘 다 처리)
// ==============================
function transformPropertyForCard(apiResponse) {
  if (!apiResponse || typeof apiResponse !== "object") {
    console.warn("[transformPropertyForCard] 잘못된 apiResponse:", apiResponse);
    return {
      id: null,
      image:
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=400",
      price: "-",
      location: "-",
      details: "-",
      tags: [],
      buildingYear: "-",
      options: [],
      _raw: apiResponse || {},
    };
  }

  console.log("card src raw", apiResponse);

  // 🔵 offers: 마커 DTO에는 없음
  const offersSource =
    apiResponse.property_offers ||
    apiResponse.propertyOffers ||
    apiResponse.offers ||
    [];
  const offers = Array.isArray(offersSource) ? offersSource : [];
  const mainOffer = offers[0] || {};

  // 🔵 이미지: 마커 DTO에도 없으니까 항상 fallback 사용
  const imagesSource =
    apiResponse.property_images ||
    apiResponse.propertyImages ||
    apiResponse.images ||
    [];
  const images = Array.isArray(imagesSource) ? imagesSource : [];

  const priceText = formatPrice(apiResponse);
  const areaM2 =
    apiResponse.area_m2 ??
    apiResponse.areaM2 ??
    apiResponse.area ??
    "-";

  // houseType / housetype 통합
  const housetype =
    mainOffer.housetype ||
    apiResponse.housetype ||
    apiResponse.houseType ||
    "-";

  // 층
  const floor =
    mainOffer.floor ??
    apiResponse.floor ??
    "-";

  // 🔥 여기서 중요한 포인트:
  // - id: 실제 매물 id 사용 (마커 DTO에서 propertyId)
  //   → 상세보기 눌렀을 때 /api/properties/{id}/full 호출
  const realPropertyId = apiResponse.propertyId || apiResponse.id;

  return {
    id: realPropertyId,
    markerOfferId: apiResponse.id, // 필요하면 나중에 사용
    image:
      images[0]?.image_url ||
      images[0]?.imageUrl ||
      images[0]?.url ||
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=400",
    price: priceText,
    location: apiResponse.address || "-",
    details: `${housetype} ∙ ${floor}층 ∙ ${areaM2}m²`,
    tags: [],
    buildingYear: apiResponse.building_year || apiResponse.buildingYear,
    options: parseOptions(
      mainOffer.oftion ??
        apiResponse.oftion ??
        0
    ),
    _raw: apiResponse,
  };
}

// ==============================
// 4. 전역 InfoWindow (재사용)
// ==============================
let globalInfoWindow = null;

// ==============================
// 5. 팝업 렌더링
// ==============================
export function renderMarkerPopup(apiResponse, map, marker) {
  if (!map || !marker) return;

  if (!apiResponse) {
    console.warn("[renderMarkerPopup] apiResponse 없음");
    return;
  }

  const property = transformPropertyForCard(apiResponse);

  // 기존 InfoWindow 닫기
  if (globalInfoWindow) {
    globalInfoWindow.close();
  }

  // HTML 콘텐츠 생성
  let contentHTML;
  if (
    typeof window.createPropertyCard === "function" ||
    typeof createPropertyCard === "function"
  ) {
    // eslint-disable-next-line no-undef
    const cardHTML =
      typeof createPropertyCard === "function"
        ? createPropertyCard(property)
        : window.createPropertyCard(property);

    contentHTML = `
      <div class="bg-white rounded-lg shadow-lg" style="width: 20rem; max-height: 70vh; overflow-y: auto; overflow-x: hidden;">
        <div class="flex items-center justify-between px-4 py-2 border-b border-gray-200">
          <span class="text-sm font-medium text-gray-700">매물 정보</span>
          <button id="btn-close-popup" class="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="p-3">
          ${cardHTML}
          <div class="mt-4 space-y-2">
            <button id="btn-detail-view-${property.id}" class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">상세보기</button>
            <div class="flex space-x-2">
              <button id="btn-favorite-${property.id}" class="flex-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium flex items-center justify-center gap-1">관심매물</button>
              <button id="btn-compare-${property.id}" class="flex-1 px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium flex items-center justify-center gap-1">비교추가</button>
            </div>
          </div>
        </div>
      </div>
    `;
  } else {
    // 폴백
    contentHTML = `
      <div class="bg-white rounded-lg shadow-lg" style="width: 20rem;">
        <div class="flex items-center justify-between px-4 py-2 border-b border-gray-200">
          <span class="text-sm font-medium text-gray-700">매물 정보</span>
          <button id="btn-close-popup" class="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="p-3">
          <div><b>${property.title || property.location || "매물 정보"}</b></div>
          <div>${property.location || "-"}</div>
          <div>${property.price || "-"}</div>
        </div>
      </div>
    `;
  }

  globalInfoWindow = new naver.maps.InfoWindow({
    content: contentHTML,
    borderWidth: 0,
    backgroundColor: "transparent",
    anchorSize: new naver.maps.Size(0, 0),
    pixelOffset: new naver.maps.Point(0, -20),
  });

  globalInfoWindow.open(map, marker);

  setTimeout(() => setupPopupButtons(property), 0);
}

// ==============================
// 6. 팝업 닫기
// ==============================
export function closeMarkerPopup() {
  if (globalInfoWindow) {
    globalInfoWindow.close();
    globalInfoWindow = null;
  }
}

// ==============================
// 7. 버튼 이벤트
// ==============================
function setupPopupButtons(property) {
  const closeBtn = document.getElementById("btn-close-popup");
  const detailBtn = document.getElementById(`btn-detail-view-${property.id}`);
  const favoriteBtn = document.getElementById(`btn-favorite-${property.id}`);
  const compareBtn = document.getElementById(`btn-compare-${property.id}`);

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      closeMarkerPopup();
    });
  }

  if (detailBtn) {
    detailBtn.addEventListener("click", () => {
      // 🔥 여기서 진짜 매물 id로 상세 열기
      const targetId = property._raw?.propertyId || property.id;
      if (typeof window.openPropertyDetail === "function") {
        // 두 번째 인자 null → 패널 쪽에서 findPropertyById 사용해서 /api/properties/{id}/full 호출
        window.openPropertyDetail(targetId, null);
      } else {
        alert("상세보기 기능을 준비 중입니다.");
      }
    });
  }

  if (favoriteBtn) {
    favoriteBtn.addEventListener("click", async () => {
      try {
        if (typeof window.addFavorite === "function") {
          await window.addFavorite(property.id);
        }
        alert("관심매물에 추가되었습니다.");
      } catch (e) {
        console.error("관심매물 추가 실패:", e);
        alert("관심매물 추가에 실패했습니다.");
      }
    });
  }

  if (compareBtn) {
    compareBtn.addEventListener("click", async () => {
      try {
        alert("비교그룹에 추가되었습니다.");
      } catch (e) {
        console.error("비교그룹 추가 실패:", e);
        alert("비교그룹 추가에 실패했습니다.");
      }
    });
  }
}
