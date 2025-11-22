// 상세 패널 더블버퍼 A/B 관리 및 애니메이션 전환
// 공개 API: initPropertyDetailPanel, openPropertyDetail(id, data?), closePropertyDetail()

(function () {
  let currentBuffer = "a"; // 현재 표시 중인 버퍼 id: 'a' | 'b'
  let isOpen = false;
  let currentId = null;

  // 상수 정의
  const LIST_RIGHT = 450; // 매물 리스트 패널 오른쪽 끝 위치
  const DETAIL_RIGHT = 900; // 상세 패널 오른쪽 끝 위치 (450px + 450px)

  const qs = (sel) => document.querySelector(sel);

  // 전역 properties 접근: data.js / app-init.js의 properties 사용
  function getProperties() {
    try {
      if (typeof properties !== "undefined" && Array.isArray(properties))
        return properties;
    } catch (_e) {}
    return undefined;
  }

  // 다양한 스키마의 매물 객체를 상세 패널이 기대하는 형태로 변환하는 어댑터
  function normalizeProperty(p) {
    console.log("🟢 [NORMALIZE INPUT] =", p);
    if (!p || typeof p !== "object") return {};

    // 1) app-init 에서 전처리된 카드 객체면 그대로 써주기
    //    (offers / _raw / priceText 등이 있는 경우)
    if ("_raw" in p || "offers" in p || "priceText" in p) {
      const status = p.status || "AVAILABLE";

      const statusText =
        status === "SOLD"
          ? "거래완료"
          : status === "CONTRACTED"
          ? "계약중"
          : "거래가능";

      const areaM2 = p.areaM2 ?? p.area_m2;
      const areaText = areaM2 ? `${areaM2}m²` : "";

      return {
        id: p.id,
        image: p.image,
        title: p.title || p.location || "",
        location: p.location || p.address || "",
        address: p.address,
        price: p.priceText || p.price || "",
        priceText: p.priceText || p.price || "",
        details: p.details || "",
        options: p.options || p.tags || [],
        tags: p.tags || p.options || [],
        description: p.description || "",
        status,
        statusText,
        buildingYear: p.buildingYear ?? p.building_year,
        direction: p.direction,
        areaM2,
        areaText,
        roomBathText: p.roomBathText || "",
        parkingText: p.parkingText,
        moveInDate: p.moveInDate,
        brokerName: p.brokerName || "",
        brokerPhone: p.brokerPhone || "",
        isApartment: p.isApartment,
        floorPlan: p.floorPlan || `/images/floorplan${(Number(p.id) % 5) + 1}.jpg`,
        maintenanceFee: p.maintenanceFee ?? p.maintenance_fee,
        _raw: p._raw || p,
      };
    }

    // 2) 옛날 더미 데이터 / 다른 스키마용 기존 추론 로직
    // 위치 정보 처리
    const city = p.city ?? p.si ?? "";
    const district = p.district ?? p.gu ?? p.gun ?? "";
    const dong = p.dong ?? p.town ?? "";
    const locationText =
      p.location ??
      (city || district || dong ? `${city} ${district} ${dong}`.trim() : "");

    // 면적 정보
    let areaM2 = p.areaM2 ?? p.area ?? p.sizeM2 ?? "";

    // 방 개수
    let rooms = p.rooms ?? p.roomCount ?? p.bedrooms ?? "";

    // 매물 타입
    let type = p.type ?? p.houseType ?? p.category ?? "";

    // details 텍스트 생성 또는 사용
    let detailsText = p.details;
    if (!detailsText) {
      const parts = [];
      if (type) parts.push(type);
      if (rooms) parts.push(`방 ${rooms}개`);
      if (areaM2) parts.push(`${areaM2}m²`);
      detailsText = parts.join(" ∙ ");
    }

    // details에서 보조 파싱
    if (!areaM2 && typeof detailsText === "string") {
      const m = detailsText.match(/([0-9]+(?:\.[0-9]+)?)\s*m²/);
      if (m) areaM2 = m[1];
    }
    if (!rooms && typeof detailsText === "string") {
      const m = detailsText.match(/방\s*(\d+)/);
      if (m) rooms = m[1];
    }
    if (!type && typeof detailsText === "string") {
      if (detailsText.includes("아파트")) type = "아파트";
      else if (detailsText.includes("오피스텔")) type = "오피스텔";
      else if (detailsText.includes("빌라")) type = "빌라";
      else if (detailsText.includes("원룸")) type = "원룸";
      else if (detailsText.includes("투룸")) type = "투룸";
    }

    // 상태 정보
    const status =
      p.status ?? (p.isSold ? "SOLD" : p.isReserved ? "CONTRACTED" : "AVAILABLE");
    const statusText =
      p.statusText ??
      (status === "SOLD"
        ? "거래완료"
        : status === "CONTRACTED"
        ? "계약중"
        : "거래가능");

    // 이미지
    const images = Array.isArray(p.images)
      ? p.images
      : Array.isArray(p.photos)
      ? p.photos
      : [];
    const image = p.image ?? images[0] ?? "";

    // 옵션/태그
    const optionsArr = p.options ?? p.tags ?? [];

    // 기본 정보
    const title = p.title ?? p.name ?? locationText;
    const price = p.priceText ?? p.price ?? "";
    const description = p.description ?? p.memo ?? "";
    const id = p.id ?? p.propertyId ?? p.pid ?? undefined;

    // 상세 정보
    const buildingYear = p.buildingYear ?? p.buildYear ?? undefined;
    const bath = p.bathrooms ?? p.baths ?? p.bath ?? "";
    const direction = p.direction ?? "";
    const parkingText =
      p.parkingText ?? (p.parking != null ? String(p.parking) : "");
    const moveInDate = p.moveInDate ?? p.availableDate ?? "";

    // 계산된 텍스트
    const areaText = areaM2 ? `${areaM2}m²` : "";
    const roomBathText =
      rooms || bath ? `방 ${rooms || "-"}개 / 욕실 ${bath || "-"}개` : "";

    // 중개사 정보
    const brokerName = p.brokerName ?? "";
    const brokerPhone = p.brokerPhone ?? "";

    // 아파트 여부
    const isApartment =
      type === "아파트" ||
      (typeof detailsText === "string" && detailsText.includes("아파트"));

    return {
      id,
      image,
      title,
      location: locationText,
      price,
      priceText: price,
      details: detailsText,
      options: optionsArr,
      description,
      status,
      statusText,
      buildingYear,
      direction,
      areaM2,
      areaText,
      roomBathText,
      parkingText,
      moveInDate,
      brokerName,
      brokerPhone,
      isApartment,
      floorPlan: `/images/floorplan${(id % 5) + 1}.jpg`,
      _raw: p,
    };
  }

  function getElems(buf) {
    const suffix = buf === "a" ? "a" : "b";
    return {
      overlay: qs(`#property-detail-overlay-${suffix}`),
      closeBtn: qs(`#close-property-detail-${suffix}`),
      img: qs(`#detail-property-image-${suffix}`),
      status: qs(`#detail-property-status-${suffix}`),
      title: qs(`#detail-property-title-${suffix}`),
      location: qs(`#detail-property-location-${suffix}`),
      price: qs(`#detail-property-price-${suffix}`),
      details: qs(`#detail-property-details-${suffix}`),
      options: qs(`#detail-property-options-${suffix}`),
      desc: qs(`#detail-property-description-${suffix}`),
      favBtn: qs(`#favorite-button-${suffix}`),
      favIcon: qs(`#favorite-icon-${suffix}`),
    };
  }

  function setOverlayVisible(el, visible) {
    if (!el) return;
    if (visible) {
      el.style.opacity = "1";
      el.style.pointerEvents = "auto";
      el.classList.remove("-translate-x-full");
    } else {
      el.style.opacity = "0";
      el.style.pointerEvents = "none";
      el.classList.add("-translate-x-full");
    }
  }

  // 전체화면 상태에 따라 X 버튼을 << 버튼으로 변경하고 기능 수정
  function updateCloseButtonForFullscreen(buf, isFullscreen) {
    const el = getElems(buf);
    if (!el.closeBtn) return;

    if (isFullscreen) {
      // X 아이콘을 << 아이콘으로 변경
      el.closeBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M11 17l-5-5 5-5M18 17l-5-5 5-5"/>
        </svg>
      `;
      el.closeBtn.title = "전체화면 해제";
      el.closeBtn.onclick = () => collapsePropertyDetailFromFullscreen();
    } else {
      // 원래 X 아이콘으로 복원
      el.closeBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      `;
      el.closeBtn.title = "닫기";
      el.closeBtn.onclick = () => closePropertyDetail();
    }
  }

  function renderInto(buf, data) {
    const el = getElems(buf);
    if (!el.overlay) return;

    const d = data || {};
    const suffix = buf;

    // propertyId를 데이터 속성으로 저장 (시세예측 등에서 사용)
    if (el.overlay) {
      const propertyId = d._raw?.propertyId || d.id;
      if (propertyId) {
        el.overlay.dataset.propertyId = propertyId;
      }
    }

    // 이미지
    if (el.img) el.img.src = d.image || "";

    // 제목과 위치
    if (el.title) el.title.textContent = d.title || d.location || "";
    if (el.location) {
      el.location.textContent = d.location || "";
      el.location.style.display = d.location ? "block" : "none";
    }

    // 가격 / 요약
    if (el.price) el.price.textContent = d.price || d.priceText || "";
    if (el.details) el.details.textContent = d.details || "";

    // 건축년도
    const buildYearEl = qs(`#detail-building-year-${suffix}`);
    if (buildYearEl)
      buildYearEl.textContent = d.buildingYear ? `${d.buildingYear}년` : "-";

    // 면적
    const areaEl = qs(`#detail-property-area-${suffix}`);
    if (areaEl) {
      let areaText = "";
      if (d.areaM2) {
        areaText = `${d.areaM2}m²`;
      } else if (d.details) {
        const detailsParts = d.details.split(" ∙ ");
        areaText = detailsParts.find((part) => part.includes("m²")) || "";
      }
      areaEl.textContent = areaText || "-";
    }

    // 방/욕실
    const roomBathEl = qs(`#detail-room-bath-${suffix}`);
    if (roomBathEl) {
      let roomBathText = "";
      if (d.roomBathText) {
        roomBathText = d.roomBathText;
      } else if (d.details) {
        const detailsParts = d.details.split(" ∙ ");
        const roomPart = detailsParts.find((part) => part.includes("방"));
        roomBathText = roomPart || "-";
      }
      roomBathEl.textContent = roomBathText;
    }

    // 설명
    if (el.desc) el.desc.textContent = d.description || "";

    // 중개사 정보
    const brokerName = qs(`#detail-broker-name-${suffix}`);
    const brokerPhone = qs(`#detail-broker-phone-${suffix}`);
    if (brokerName) brokerName.textContent = d.brokerName || "중개사 정보 없음";
    if (brokerPhone) brokerPhone.textContent = d.brokerPhone || "";

    // 지도
    if (window.MapInDetail && window.MapInDetail.init) {
      setTimeout(() => {
        const mapPlaceholderId = `detail-map-placeholder-${suffix}`;
        const address = d.address || d.location;
        if (address) {
          window.MapInDetail.init(mapPlaceholderId, address);
        }
      }, 100);
    }

    // 평면도
    const floorPlan = d.floorPlan;
    const floorplanWrapper = qs(`#detail-floorplan-wrapper-${suffix}`);
    if (floorplanWrapper) {
      floorplanWrapper.style.display = "block";
      const placeholder = qs(`#detail-floorplan-placeholder-${suffix}`);
      if (placeholder && floorPlan) {
        placeholder.innerHTML = `<img src="${floorPlan}" alt="평면도" class="w-full h-full object-contain rounded-lg">`;
        placeholder.classList.remove("bg-gray-50", "border", "border-gray-200");
        placeholder.classList.add("bg-white");
      }
    }

    // 방향 / 주차 / 입주일
    const directionEl = qs(`#detail-direction-${suffix}`);
    if (directionEl) directionEl.textContent = d.direction || "-";

    const parkingEl = qs(`#detail-parking-${suffix}`);
    if (parkingEl) parkingEl.textContent = d.parkingText || d.parking || "-";

    const moveInDateEl = qs(`#detail-move-in-date-${suffix}`);
    if (moveInDateEl)
      moveInDateEl.textContent = d.moveInDate || "즉시 입주 가능";

    // 관리비
    const maintenanceEl = qs(`#detail-maintenance-fee-${suffix}`);
    if (maintenanceEl) {
      const fee = d.maintenanceFee ?? d.maintenance_fee ?? null;
      if (fee != null) {
        const num = Number(fee);
        maintenanceEl.textContent = Number.isNaN(num)
          ? "-"
          : `${num.toLocaleString()}원`;
      } else {
        maintenanceEl.textContent = "-";
      }
    }

    // 비워둘 항목들
    const emptyFields = [
      `detail-room-structure-${suffix}`,
      `detail-duplex-${suffix}`,
      `detail-household-count-${suffix}`,
    ];
    emptyFields.forEach((id) => {
      const f = qs(`#${id}`);
      if (f) f.textContent = "-";
    });

    // 상태 표시
    if (el.status) {
      const statusMap = {
        AVAILABLE: { text: "거래가능", class: "bg-green-100 text-green-800" },
        CONTRACTED: { text: "계약중", class: "bg-yellow-100 text-yellow-800" },
        SOLD: { text: "거래완료", class: "bg-gray-100 text-gray-800" },
      };
      const statusInfo = statusMap[d.status] || statusMap["AVAILABLE"];
      el.status.textContent = statusInfo.text;
      el.status.className = `px-3 py-1 rounded-full text-sm font-semibold ${statusInfo.class}`;
    }

    // 옵션 표시
    if (el.options) {
      el.options.innerHTML = "";
      const optionsArray = d.options || d.tags || [];
      optionsArray.forEach((option) => {
        const optionElement = document.createElement("span");
        optionElement.className =
          "bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full";
        optionElement.textContent = option;
        el.options.appendChild(optionElement);
      });
    }

    // 즐겨찾기 버튼
    if (el.favBtn) {
      el.favBtn.onclick = () => {
        const pressed = el.favBtn.getAttribute("aria-pressed") === "true";
        el.favBtn.setAttribute("aria-pressed", (!pressed).toString());
        el.favIcon && el.favIcon.classList.toggle("text-red-500", !pressed);
      };
    }

    // closeBtn 기본 이벤트는 여기서 한 번만
    if (el.closeBtn && !el.closeBtn.__eventSet) {
      updateCloseButtonForFullscreen(buf, false);
      el.closeBtn.__eventSet = true;
    }
  }

  // 상세용 매물 찾기: 우선 /full API → 실패 시 로컬 properties
  async function findPropertyById(id) {
    // 1) full API에서 offers/oftion 포함 데이터 가져오기
    try {
      console.log("🟡 [DETAIL FETCH] /api/properties/" + id + "/full 호출");
      const response = await fetch(`/api/properties/${id}/full`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("🟡 [DETAIL FETCH OK] =", data);

        const offers =
          data.property_offers || data.propertyOffers || data.offers || [];
        const activeOffers = offers.filter((o) =>
          o.is_active !== undefined ? o.is_active : o.isActive
        );
        const mainOffer = activeOffers[0] || offers[0] || null;

        let priceText;
        if (typeof formatPriceFromOffers === "function") {
          priceText = formatPriceFromOffers({
            property_offers: offers,
            price: data.price,
          });
        } else {
          priceText =
            data.price != null
              ? Number(data.price).toLocaleString()
              : "가격 정보 없음";
        }

        let options = [];
        if (
          mainOffer &&
          mainOffer.oftion != null &&
          typeof parseOptions === "function"
        ) {
          options = parseOptions(mainOffer.oftion);
        }

        const status = data.status || "AVAILABLE";
        const tags = [
          ...(status === "AVAILABLE" ? ["거래가능"] : []),
          "판매등록완료",
        ];

        let imageUrl =
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800";
        const images =
          data.images ||
          data.property_images ||
          data.photos ||
          data.propertyImages;
        if (Array.isArray(images) && images.length > 0) {
          const img0 = images[0];
          imageUrl =
            img0.url || img0.imgUrl || img0.imageUrl || img0.image_url || imageUrl;
        }

        const maintenanceFee =
          mainOffer?.maintenance_fee ?? mainOffer?.maintenanceFee ?? null;

        // app-init 카드와 유사한 형태로 맞춰줌
        return {
          id: data.id,
          image: imageUrl,
          price: priceText,
          priceText,
          location: data.address || "위치 정보 없음",
          address: data.address,
          title: data.title || data.address,
          details: data.title || "상세 정보 없음",
          tags,
          options,
          isRecommended: false,
          status,
          areaM2: data.areaM2 ?? data.area_m2,
          buildingYear: data.buildingYear ?? data.building_year,
          description: data.title || "상세 정보 없음",
          brokerName: data.brokerName || data.ownerName || "",
          brokerPhone: "",
          offers, // 진짜 offers
          images: images || [],
          maintenanceFee,
          _raw: data,
        };
      } else {
        console.warn("🟡 [DETAIL FETCH FAIL]", response.status);
      }
    } catch (e) {
      console.error("🟡 [DETAIL FETCH ERROR]", e);
    }

    // 2) 실패하면 로컬 fallback
    const list = getProperties();
    if (Array.isArray(list)) {
      const localProperty = list.find(
        (p) => p && (p.id === id || p.id === parseInt(id))
      );
      if (localProperty) {
        console.log(`✅ 로컬 데이터 fallback: ${id}`, localProperty);
        return localProperty;
      }
    }

    return null;
  }

  // 좌측 패널 버튼 위치/투명도 제어 및 검색바 위치 조정
  function updatePanelButtonsForDetail(isDetailOpen) {
    const closeBtn = document.getElementById("close-panel-button");
    const expandBtn = document.getElementById("expand-panel-button");
    const searchBarContainer = document.getElementById("search-bar-container");

    if (!closeBtn || !expandBtn) return;

    if (isDetailOpen) {
      // 원래 값 보존
      if (!closeBtn.dataset.origLeft)
        closeBtn.dataset.origLeft = closeBtn.style.left || `${LIST_RIGHT}px`;
      if (!expandBtn.dataset.origLeft)
        expandBtn.dataset.origLeft = expandBtn.style.left || `${LIST_RIGHT}px`;

      // 토글 버튼을 상세 패널 오른쪽 끝으로 이동
      expandBtn.style.left = `${DETAIL_RIGHT}px`;
      expandBtn.style.zIndex = "15";
      expandBtn.style.opacity = "1";
      expandBtn.style.pointerEvents = "auto";

      // 닫기 버튼도 상세 패널 오른쪽 끝 근처로 이동
      closeBtn.style.left = `${DETAIL_RIGHT}px`;
      closeBtn.style.zIndex = "15";
      closeBtn.title = "상세 정보 닫기";
      closeBtn.style.opacity = "1";
      closeBtn.style.pointerEvents = "auto";

      // 검색 바 오른쪽으로 밀기
      if (searchBarContainer) {
        if (!searchBarContainer.dataset.origLeft) {
          searchBarContainer.dataset.origLeft =
            searchBarContainer.style.left || "474px";
        }
        searchBarContainer.style.left = `${DETAIL_RIGHT + 24}px`;
      }

      // 확장 버튼 기능: 전체화면
      expandBtn.title = "상세 정보 전체화면";

      if (!expandBtn.__originalClickHandler) {
        const originalHandler = expandBtn.onclick || (() => {});
        expandBtn.__originalClickHandler = originalHandler;
      }

      if (!closeBtn.__detailEventAdded) {
        closeBtn.__detailClickHandler = (e) => {
          e.stopPropagation();
          const currentOverlay = getElems(currentBuffer).overlay;
          if (currentOverlay && currentOverlay.__isFullscreen) {
            collapsePropertyDetailFromFullscreen();
          } else {
            closePropertyDetail();
          }
        };
        closeBtn.addEventListener("click", closeBtn.__detailClickHandler);
        closeBtn.__detailEventAdded = true;
      }

      expandBtn.onclick = () => {
        expandPropertyDetailToFullscreen();
      };
    } else {
      // 원복
      if (closeBtn.dataset.origLeft) {
        closeBtn.style.left = closeBtn.dataset.origLeft;
      }
      closeBtn.style.zIndex = "";
      closeBtn.title = "패널 닫기";
      if (expandBtn.dataset.origLeft) {
        expandBtn.style.left = expandBtn.dataset.origLeft;
      }
      expandBtn.style.zIndex = "";
      expandBtn.title = "패널 확장";

      if (searchBarContainer && searchBarContainer.dataset.origLeft) {
        searchBarContainer.style.left = searchBarContainer.dataset.origLeft;
      }

      if (expandBtn.__originalClickHandler) {
        expandBtn.onclick = expandBtn.__originalClickHandler;
      }

      if (closeBtn.__detailEventAdded && closeBtn.__detailClickHandler) {
        closeBtn.removeEventListener("click", closeBtn.__detailClickHandler);
        closeBtn.__detailEventAdded = false;
        closeBtn.__detailClickHandler = null;
      }
    }

    if (typeof window.adjustAllFilterDropdownPosition === "function") {
      setTimeout(() => window.adjustAllFilterDropdownPosition(), 100);
    }
  }

  // 상세 패널을 전체화면으로 확장
  function expandPropertyDetailToFullscreen() {
    if (!isOpen) return;

    const currentOverlay = getElems(currentBuffer).overlay;
    if (!currentOverlay) return;

    currentOverlay.style.transition = "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";

    const sidePanel = document.getElementById("side-panel");
    const rightSidePanel = document.getElementById("right-side-panel");
    const rightToggleButton = document.getElementById(
      "right-panel-toggle-button"
    );
    const mainContent = document.querySelector("main");
    const collapseFullscreenButton = document.getElementById(
      "collapse-fullscreen-button"
    );

    const rightInstantHide = [rightSidePanel, rightToggleButton];
    const rightCardPanelIds = [
      "chat-panel",
      "profile-panel",
      "notification-panel",
      "favorite-panel",
      "compare-panel",
      "my-property-panel",
      "broker-list-panel",
    ];
    rightInstantHide.forEach((el) => {
      if (el) {
        el.__prevVisibility = el.style.visibility || "";
        el.style.visibility = "hidden";
      }
    });
    rightCardPanelIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.__prevVisibility = el.style.visibility || "";
        el.style.visibility = "hidden";
      }
    });

    const elementsToHide = [
      sidePanel,
      rightSidePanel,
      rightToggleButton,
      mainContent,
    ];
    elementsToHide.forEach((el) => {
      if (el) {
        el.style.transition = "opacity 0.2s ease-out";
        el.style.opacity = "0";
      }
    });

    setTimeout(() => {
      elementsToHide.forEach((el) => {
        if (el) {
          el.classList.add("hidden");
          el.style.transition = "";
          el.style.opacity = "";
        }
      });

      currentOverlay.classList.remove(
        `w-[${LIST_RIGHT}px]`,
        `left-[${LIST_RIGHT}px]`
      );
      currentOverlay.classList.add("w-full", "left-0", "z-50");
      currentOverlay.style.transform = "translateX(0)";

      if (collapseFullscreenButton) {
        collapseFullscreenButton.classList.remove("hidden");
        collapseFullscreenButton.onclick = () => {
          collapsePropertyDetailFromFullscreen();
        };
      }

      const expandBtn = document.getElementById("expand-panel-button");
      const closeBtn = document.getElementById("close-panel-button");
      if (expandBtn) {
        expandBtn.style.opacity = "0";
        expandBtn.style.pointerEvents = "none";
      }
      if (closeBtn) {
        closeBtn.style.opacity = "0";
        closeBtn.style.pointerEvents = "none";
      }

      updateCloseButtonForFullscreen(currentBuffer, true);

      setTimeout(() => {
        currentOverlay.style.transition = "";
      }, 300);
    }, 200);

    currentOverlay.__isFullscreen = true;
  }

  // 상세 패널 전체화면에서 원래 크기로 축소
  function collapsePropertyDetailFromFullscreen() {
    if (!isOpen) return;

    const currentOverlay = getElems(currentBuffer).overlay;
    if (!currentOverlay || !currentOverlay.__isFullscreen) return;

    currentOverlay.style.transition = "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";

    const collapseFullscreenButton = document.getElementById(
      "collapse-fullscreen-button"
    );
    if (collapseFullscreenButton) {
      collapseFullscreenButton.classList.add("hidden");
      collapseFullscreenButton.onclick = null;
    }

    updateCloseButtonForFullscreen(currentBuffer, false);

    currentOverlay.classList.add(
      `w-[${LIST_RIGHT}px]`,
      `left-[${LIST_RIGHT}px]`
    );
    currentOverlay.classList.remove("w-full", "left-0", "z-50");
    currentOverlay.style.transform = "translateX(0)";

    setTimeout(() => {
      const sidePanel = document.getElementById("side-panel");
      const rightSidePanel = document.getElementById("right-side-panel");
      const rightToggleButton = document.getElementById(
        "right-panel-toggle-button"
      );
      const mainContent = document.querySelector("main");

      const elementsToShow = [
        sidePanel,
        rightSidePanel,
        rightToggleButton,
        mainContent,
      ];
      const rightInstantHide = [rightSidePanel, rightToggleButton];
      const rightCardPanelIds = [
        "chat-panel",
        "profile-panel",
        "notification-panel",
        "favorite-panel",
        "compare-panel",
        "my-property-panel",
        "broker-list-panel",
      ];

      elementsToShow.forEach((el) => {
        if (el) {
          el.classList.remove("hidden");
          el.style.display = "";
          el.style.visibility = "visible";
          el.style.opacity = "0";
          el.style.transition = "opacity 0.3s ease-in";
        }
      });

      setTimeout(() => {
        rightCardPanelIds.forEach((id) => {
          const el = document.getElementById(id);
          if (el && el.__prevVisibility !== undefined) {
            el.style.visibility = el.__prevVisibility;
            delete el.__prevVisibility;
          } else if (el) {
            el.style.visibility = "visible";
          }
        });
      }, 300);

      const closeBtn = document.getElementById("close-panel-button");
      const expandBtn = document.getElementById("expand-panel-button");

      if (closeBtn) {
        const detailRightEdge = DETAIL_RIGHT;
        closeBtn.style.transition =
          "left 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease-in";
        closeBtn.style.left = `${detailRightEdge}px`;
        closeBtn.style.zIndex = "15";
        closeBtn.style.opacity = "1";
        closeBtn.style.pointerEvents = "auto";
      }

      if (expandBtn) {
        expandBtn.style.opacity = "1";
        expandBtn.style.pointerEvents = "auto";
      }

      requestAnimationFrame(() => {
        elementsToShow.forEach((el) => {
          if (el) {
            el.style.opacity = "1";
            el.offsetHeight;
          }
        });
      });

      setTimeout(() => {
        elementsToShow.forEach((el) => {
          if (el) {
            el.style.transition = "";
            el.style.opacity = "";
          }
        });
        if (closeBtn) {
          closeBtn.style.transition = "";
        }

        currentOverlay.style.transition = "";
        currentOverlay.style.transform = "";
        document.body.offsetHeight;

        rightInstantHide.forEach((el) => {
          if (el) {
            el.style.visibility = el.__prevVisibility || "";
            delete el.__prevVisibility;
          }
        });
        rightCardPanelIds.forEach((id) => {
          const el = document.getElementById(id);
          if (
            el &&
            Object.prototype.hasOwnProperty.call(el, "__prevVisibility")
          ) {
            el.style.visibility = el.__prevVisibility || "";
            delete el.__prevVisibility;
          }
        });
      }, 300);
    }, 150);

    currentOverlay.__isFullscreen = false;
    updatePanelButtonsForDetail(true);
  }

  async function openPropertyDetail(id, data) {
    // 같은 매물을 다시 클릭하면 토글
    const compareId = data?.id ?? id;
    if (currentId === compareId && isOpen) {
      closePropertyDetail();
      return;
    }

    const raw = data || (await findPropertyById(id)) || {};
    console.log("🟣 [OPEN] raw incoming =", raw);
    const incoming = normalizeProperty(raw);

    const nextBuf = currentBuffer === "a" ? "b" : "a";
    const curElems = getElems(currentBuffer);
    const nextElems = getElems(nextBuf);

    renderInto(nextBuf, incoming);

    if (typeof window.switchDetailTab === "function") {
      window.switchDetailTab(nextBuf, "detail");
    }

    if (nextElems.overlay) {
      nextElems.overlay.classList.add("-translate-x-full");
      nextElems.overlay.style.transform = "";
      nextElems.overlay.style.transition = "";
      nextElems.overlay.style.opacity = "0";
      nextElems.overlay.style.pointerEvents = "none";
    }

    setOverlayVisible(nextElems.overlay, true);
    if (isOpen && curElems.overlay) {
      curElems.overlay.classList.add("-translate-x-full");
      setTimeout(() => setOverlayVisible(curElems.overlay, false), 300);
    }

    if (isOpen) {
      const closeBtn = document.getElementById("close-panel-button");
      const expandBtn = document.getElementById("expand-panel-button");
      if (closeBtn && expandBtn) {
        closeBtn.style.opacity = "0";
        expandBtn.style.opacity = "0";
        closeBtn.style.pointerEvents = "none";
        expandBtn.style.pointerEvents = "none";
      }
      setTimeout(() => {
        updatePanelButtonsForDetail(true);
      }, 300);
    } else {
      updatePanelButtonsForDetail(true);
    }

    const onResize = () => {
      if (isOpen) updatePanelButtonsForDetail(true);
    };
    window.addEventListener("resize", onResize);
    if (nextElems.overlay) {
      nextElems.overlay.__detailOnResize = onResize;
    }

    isOpen = true;
    window.isDetailOpen = true;
    currentId = compareId;
    currentBuffer = nextBuf;

    if (typeof window.adjustAllFilterDropdownPosition === "function") {
      setTimeout(() => window.adjustAllFilterDropdownPosition(), 300);
    }
  }

  function closePropertyDetail() {
    const curElems = getElems(currentBuffer);
    if (curElems.overlay) {
      if (curElems.overlay.__isFullscreen) {
        collapsePropertyDetailFromFullscreen();
      }
      curElems.overlay.classList.add("-translate-x-full");
      setTimeout(() => setOverlayVisible(curElems.overlay, false), 300);

      const onResize = curElems.overlay.__detailOnResize;
      if (onResize) {
        window.removeEventListener("resize", onResize);
        curElems.overlay.__detailOnResize = null;
      }
    }
    updatePanelButtonsForDetail(false);
    isOpen = false;
    window.isDetailOpen = false;
    currentId = null;
  }

  // 탭 전환 함수 (전역 노출)
  window.switchDetailTab = function (suffix, tabName) {
    const tabs = ["detail", "prediction", "calculator"];

    tabs.forEach((t) => {
      const tabBtn = document.getElementById(`tab-${t}-${suffix}`);
      const contentDiv = document.getElementById(`content-${t}-${suffix}`);

      if (tabBtn && contentDiv) {
        if (t === tabName) {
          tabBtn.classList.remove(
            "text-gray-500",
            "hover:text-gray-700",
            "border-transparent"
          );
          tabBtn.classList.add("text-blue-600", "border-b-2", "border-blue-600");

          contentDiv.classList.remove("hidden");

          if (t === "prediction") {
            const overlay = document.getElementById(
              `property-detail-overlay-${suffix}`
            );
            const propertyId = overlay?.dataset?.propertyId;

            if (
              propertyId &&
              typeof window.loadPriceEstimation === "function"
            ) {
              window.loadPriceEstimation(propertyId, suffix);
            } else if (
              typeof PredictionPanel !== "undefined" &&
              contentDiv.children.length === 0
            ) {
              contentDiv.appendChild(PredictionPanel.getElement());
            }
          } else if (t === "calculator") {
            if (
              typeof CalculatorPanel !== "undefined" &&
              contentDiv.children.length === 0
            ) {
              contentDiv.appendChild(CalculatorPanel.getElement());
            }
          }
        } else {
          tabBtn.classList.remove(
            "text-blue-600",
            "border-b-2",
            "border-blue-600"
          );
          tabBtn.classList.add(
            "text-gray-500",
            "hover:text-gray-700",
            "border-transparent"
          );
          contentDiv.classList.add("hidden");
        }
      }
    });
  };

  // 모든 매물 상세 페이지 닫기
  function closeAllPropertyDetails() {
    const overlayA = qs("#property-detail-overlay-a");
    const overlayB = qs("#property-detail-overlay-b");

    if (overlayA && overlayA.__isFullscreen) {
      collapsePropertyDetailFromFullscreen();
    }
    if (overlayB && overlayB.__isFullscreen) {
      collapsePropertyDetailFromFullscreen();
    }

    if (overlayA) {
      overlayA.classList.add(
        "-translate-x-full",
        `w-[${LIST_RIGHT}px]`,
        `left-[${LIST_RIGHT}px]`
      );
      overlayA.classList.remove("w-full", "left-0", "z-50");
      overlayA.style.opacity = "0";
      overlayA.style.pointerEvents = "none";
      overlayA.style.zIndex = "";
      overlayA.__isFullscreen = false;
      updateCloseButtonForFullscreen("a", false);
    }
    if (overlayB) {
      overlayB.classList.add(
        "-translate-x-full",
        `w-[${LIST_RIGHT}px]`,
        `left-[${LIST_RIGHT}px]`
      );
      overlayB.classList.remove("w-full", "left-0", "z-50");
      overlayB.style.opacity = "0";
      overlayB.style.pointerEvents = "none";
      overlayB.style.zIndex = "";
      overlayB.__isFullscreen = false;
      updateCloseButtonForFullscreen("b", false);
    }

    isOpen = false;
    window.isDetailOpen = false;
    currentId = null;

    updatePanelButtonsForDetail(false);
  }

  function initPropertyDetailPanel() {
    ["a", "b"].forEach((buf) => {
      const el = getElems(buf).overlay;
      if (el) {
        el.classList.add("-translate-x-full");
        el.style.opacity = "0";
        el.style.pointerEvents = "none";
      }
    });
    window.isDetailOpen = false;
  }

  // 기존 렌더 코드를 유지한 채, 이벤트 위임으로 카드 클릭을 감지하여 상세 열기
  function getOriginalIndexFromContainer(containerId, childIndex) {
    const list = getProperties();
    if (!Array.isArray(list)) return childIndex;

    if (containerId === "recommended-list") {
      let count = -1;
      for (let i = 0; i < list.length; i++) {
        if (list[i]?.isRecommended) {
          count++;
          if (count === childIndex) return i;
        }
      }
    } else if (containerId === "property-list") {
      let count = -1;
      for (let i = 0; i < list.length; i++) {
        if (!list[i]?.isRecommended) {
          count++;
          if (count === childIndex) return i;
        }
      }
    }
    return childIndex;
  }

  function attachDelegatedClick(container) {
    if (!container) return;
    container.addEventListener("click", (e) => {
      let propertyCard;
      if (container.id === "compare-list") {
        propertyCard = e.target.closest(
          ".bg-white.rounded-lg.shadow-md.overflow-hidden.flex-1.min-w-0"
        );
      } else {
        propertyCard = e.target.closest(
          "[data-property-id], .bg-white.rounded-lg.shadow-md"
        );
      }
      if (!propertyCard) return;

      e.stopPropagation();

      let data;
      let propertyId;

      if (propertyCard.hasAttribute("data-property-id")) {
        propertyId = propertyCard.getAttribute("data-property-id");
        const list = getProperties();

        if (Array.isArray(list)) {
          data = list.find(
            (p) => p && (p.id == propertyId || p.id === parseInt(propertyId))
          );
        }

        if (!data && !isNaN(propertyId)) {
          const index = parseInt(propertyId);
          const list = getProperties();
          data = Array.isArray(list) ? list[index] : undefined;
        }
      } else {
        if (container.id === "compare-list") {
          const groupContainer = propertyCard.closest(
            ".bg-gray-50.border.rounded-lg"
          );
          if (!groupContainer) return;

          const groupIndex = Array.from(container.children).indexOf(
            groupContainer
          );
          const propertyCards = groupContainer.querySelectorAll(
            ".bg-white.rounded-lg.shadow-md.overflow-hidden.flex-1.min-w-0"
          );
          const cardIndex = Array.from(propertyCards).indexOf(propertyCard);

          const groupData =
            typeof compareGroups !== "undefined" && Array.isArray(compareGroups)
              ? compareGroups[groupIndex]
              : undefined;
          data =
            groupData && Array.isArray(groupData.items)
              ? groupData.items[cardIndex]
              : undefined;

          if (data) {
            data.id = `compare_${groupData.groupId}_${cardIndex}`;
          }
        } else {
          const idx = Array.from(container.children).indexOf(propertyCard);
          const originalIndex = getOriginalIndexFromContainer(
            container.id,
            idx
          );
          const list = getProperties();
          data = Array.isArray(list) ? list[originalIndex] : undefined;
        }
      }

      if (!data) {
        console.warn("매물 데이터를 찾을 수 없습니다:", propertyId);
        return;
      }

      console.log("매물 클릭:", data);

      if (
        typeof window.isPanelExpanded !== "undefined" &&
        window.isPanelExpanded
      ) {
        const collapseFullscreenButton = document.getElementById(
          "collapse-fullscreen-button"
        );
        if (collapseFullscreenButton) {
          collapseFullscreenButton.click();
        } else {
          window.isPanelExpanded = false;
          if (typeof window.updateUIVisibility === "function")
            window.updateUIVisibility();
        }
        setTimeout(() => {
          if (typeof window.openPropertyDetail === "function") {
            window.openPropertyDetail(data?.id || 0, data);
          }
        }, 320);
      } else {
        if (typeof window.openPropertyDetail === "function") {
          window.openPropertyDetail(data?.id || 0, data);
        }
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initPropertyDetailPanel();
    attachDelegatedClick(qs("#recommended-list"));
    attachDelegatedClick(qs("#property-list"));
    attachDelegatedClick(qs("#compare-list"));
  });

  // 공개 API
  window.initPropertyDetailPanel = initPropertyDetailPanel;
  window.openPropertyDetail = openPropertyDetail;
  window.closePropertyDetail = closePropertyDetail;
  window.closeAllPropertyDetails = closeAllPropertyDetails;
  window.updatePanelButtonsForDetail = updatePanelButtonsForDetail;
})();
