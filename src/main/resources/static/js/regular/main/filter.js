// js/filter.js
document.addEventListener('DOMContentLoaded', () => {
  // ======================
  // DOM 요소 및 상태 변수
  // ======================
  const allFilterDropdown = document.getElementById("all-filter-dropdown");

  // --- 주거형태 ---
  const houseTypeButton = document.getElementById("house-type-button");
  const houseTypeDropdown = document.getElementById("house-type-dropdown");
  const houseTypeSelectedLabel = document.getElementById("house-type-selected-label");
  let selectedHouseTypes = new Set();

  // --- 거래방식 ---
  const offerTypeButton = document.getElementById("offer-type-button");
  const offerTypeDropdown = document.getElementById("offer-type-dropdown");
  const offerTypeSelectedLabel = document.getElementById("offer-type-selected-label");
  let selectedOfferTypes = new Set();

  // --- 전용면적 ---
  const areaButton = document.getElementById("area-button");
  const areaDropdown = document.getElementById("area-dropdown");
  const areaSelectedLabel = document.getElementById("area-selected-label");
  const areaMinInput = document.getElementById("area-min-input");
  const areaMaxInput = document.getElementById("area-max-input");
  const AREA_MIN_DEFAULT = 0;
  let AREA_MAX = 200;

  // --- 층수 ---
  const floorButton = document.getElementById("floor-button");
  const floorDropdown = document.getElementById("floor-dropdown");
  const floorSelectedLabel = document.getElementById("floor-selected-label");
  const floorMinInput = document.getElementById("floor-min-input");
  const floorMaxInput = document.getElementById("floor-max-input");
  const FLOOR_MIN = 1;
  let FLOOR_MAX = 20;

  // --- 옵션 ---
  const optionButton = document.getElementById("option-button");
  const optionDropdown = document.getElementById("option-dropdown");
  const optionSelectedLabel = document.getElementById("option-selected-label");
  let selectedOptions = new Set();
  const fullOptionItems = ["에어컨","냉장고","세탁기","가스레인지","인덕션레인지","침대","전자레인지"]; // 풀옵션 구성요소

  // --- 전체필터 ---
  const allFilterButton = document.getElementById("all-filter-button");
  const allFilterSelectedLabel = document.getElementById("all-filter-selected-label");
  const applyFilter = document.getElementById("apply-filter");
  const resetFilter = document.getElementById("reset-filter");

  // ======================
  // 유틸/헬퍼
  // ======================
  function closeAllDropdowns() {
    if (houseTypeDropdown) houseTypeDropdown.classList.add("hidden");
    if (offerTypeDropdown)  offerTypeDropdown.classList.add("hidden");
    if (areaDropdown)       areaDropdown.classList.add("hidden");
    if (floorDropdown)      floorDropdown.classList.add("hidden");
    if (optionDropdown)     optionDropdown.classList.add("hidden");
    if (allFilterDropdown)  allFilterDropdown.classList.add("hidden");
  }

  // null-safe 공통 토글
  function toggleDropdown(dd) {
    if (!dd) return;
    const isOpen = !dd.classList.contains("hidden");
    closeAllDropdowns();
    if (!isOpen) dd.classList.remove("hidden");
  }

  const intOrNull = v => {
    const n = parseInt(String(v ?? "").replace(/[^0-9]/g, ""), 10);
    return Number.isFinite(n) ? n : null;
  };
  const decOrNull = v => {
    const n = Number(String(v ?? "").replace(/[^0-9]/g, ""));
    return Number.isFinite(n) ? n : null;
  };

  // 코드 <-> 라벨
  const mapHouseTypeToCode = k => (k === "아파트" ? "APART" : k === "빌라" ? "BILLA" : k === "원/투룸" ? "ONE" : null);
  const mapOfferTypeToCode = k => (k === "매매" ? "SALE" : k === "전세" ? "JEONSE" : k === "월세" ? "WOLSE" : null);
  const houseLabelOf = code => (code === "APART" ? "아파트" : code === "BILLA" ? "빌라" : code === "ONE" ? "원/투룸" : (code ?? ""));
  const offerLabelOf = code => (code === "SALE" ? "매매" : code === "JEONSE" ? "전세" : code === "WOLSE" ? "월세" : (code ?? ""));
  const fmt = v => (v == null ? "-" : Number(v).toLocaleString());

  // ======================
  // UI 업데이트
  // ======================
  function updateHouseTypeUI() {
    document.querySelectorAll(".house-type-option").forEach(b => {
      const v = b.getAttribute("data-type");
      const isActive = selectedHouseTypes.has(v);
      b.classList.toggle("bg-blue-600", isActive);
      b.classList.toggle("text-white", isActive);
      b.classList.toggle("bg-gray-100", !isActive);
      b.classList.toggle("text-gray-700", !isActive);
    });
    if (selectedHouseTypes.size > 0) {
      houseTypeSelectedLabel?.classList.remove("hidden");
      if (houseTypeSelectedLabel) houseTypeSelectedLabel.textContent = Array.from(selectedHouseTypes).join(", ");
    } else {
      houseTypeSelectedLabel?.classList.add("hidden");
      if (houseTypeSelectedLabel) houseTypeSelectedLabel.textContent = "";
    }
  }

  function updateOfferTypeUI() {
    document.querySelectorAll(".offer-type-option").forEach(b => {
      const v = b.getAttribute("data-type");
      const isActive = selectedOfferTypes.has(v);
      b.classList.toggle("bg-blue-600", isActive);
      b.classList.toggle("text-white", isActive);
      b.classList.toggle("bg-gray-100", !isActive);
      b.classList.toggle("text-gray-700", !isActive);
    });
    if (offerTypeSelectedLabel) {
      if (selectedOfferTypes.size > 0) {
        offerTypeSelectedLabel.textContent = Array.from(selectedOfferTypes).join(", ");
        offerTypeSelectedLabel.classList.remove("hidden");
      } else {
        offerTypeSelectedLabel.textContent = "";
        offerTypeSelectedLabel.classList.add("hidden");
      }
    }
  }

  function syncAreaLabel() {
    const minVal = parseInt(areaMinInput?.value || "", 10) || AREA_MIN_DEFAULT;
    const maxVal = parseInt(areaMaxInput?.value || "", 10) || AREA_MAX;
    if ((areaMinInput?.value && minVal !== AREA_MIN_DEFAULT) || (areaMaxInput?.value && maxVal !== AREA_MAX)) {
      areaSelectedLabel?.classList.remove("hidden");
      if (areaSelectedLabel) areaSelectedLabel.textContent = `${minVal}~${maxVal} m²`;
    } else {
      areaSelectedLabel?.classList.add("hidden");
      if (areaSelectedLabel) areaSelectedLabel.textContent = "";
    }
  }

  function syncFloorLabel() {
    const minVal = parseInt(floorMinInput?.value || "", 10) || FLOOR_MIN;
    const maxVal = parseInt(floorMaxInput?.value || "", 10) || FLOOR_MAX;
    if ((floorMinInput?.value && minVal !== FLOOR_MIN) || (floorMaxInput?.value && maxVal !== FLOOR_MAX)) {
      floorSelectedLabel?.classList.remove("hidden");
      if (floorSelectedLabel) floorSelectedLabel.textContent = `${minVal}~${maxVal} 층`;
    } else {
      floorSelectedLabel?.classList.add("hidden");
      if (floorSelectedLabel) floorSelectedLabel.textContent = "";
    }
  }

  function updateOptionUI() {
    document.querySelectorAll(".option-item").forEach(b => {
      const v = b.getAttribute("data-type");
      if (v === "풀옵션") {
        const on = fullOptionItems.every(item => selectedOptions.has(item));
        b.classList.toggle("bg-blue-600", on);
        b.classList.toggle("text-white", on);
        b.classList.toggle("bg-gray-100", !on);
        b.classList.toggle("text-gray-700", !on);
      } else {
        const on = selectedOptions.has(v);
        b.classList.toggle("bg-blue-600", on);
        b.classList.toggle("text-white", on);
        b.classList.toggle("bg-gray-100", !on);
        b.classList.toggle("text-gray-700", !on);
      }
    });

    if (optionSelectedLabel) {
      if (selectedOptions.size > 0) {
        const arr = Array.from(selectedOptions);
        optionSelectedLabel.textContent = arr.length > 3 ? `${arr.slice(0,3).join(", ")} 외 ${arr.length-3}개` : arr.join(", ");
        optionSelectedLabel.classList.remove("hidden");
      } else {
        optionSelectedLabel.textContent = "";
        optionSelectedLabel.classList.add("hidden");
      }
    }
  }

  function adjustAllFilterDropdownPosition() {
    const sidePanel = document.getElementById("side-panel");
    const rightSidePanel = document.getElementById("right-side-panel");

    const isPanelOpen = sidePanel && !sidePanel.classList.contains("-translate-x-full");
    const isPanelExpanded = sidePanel && sidePanel.classList.contains("w-full");
    const isRightPanelOpen = rightSidePanel && !rightSidePanel.classList.contains("translate-x-full");
    const hasOpenRightCardPanel = document.querySelector('#chat-panel:not(.translate-x-full), #profile-panel:not(.translate-x-full), #notification-panel:not(.translate-x-full), #favorite-panel:not(.translate-x-full), #compare-panel:not(.translate-x-full), #my-property-panel:not(.translate-x-full)') !== null;

    const leftPanelWidth = isPanelOpen ? (isPanelExpanded ? window.innerWidth : 450) : 0;
    let rightPanelWidth = 0;
    if (isRightPanelOpen) {
      rightPanelWidth = 75;
      if (hasOpenRightCardPanel) rightPanelWidth += 450;
    }

    const availableWidth = window.innerWidth - leftPanelWidth - rightPanelWidth;
    let dropdownWidth = Math.min(450, Math.max(350, availableWidth - 40));

    const buttonRect = allFilterButton?.getBoundingClientRect?.() || {left:0};
    const rightEdge = buttonRect.left + dropdownWidth;
    const screenRightEdge = window.innerWidth - rightPanelWidth - 20;

    let dropdownLeft = 0;
    if (rightEdge > screenRightEdge) dropdownLeft = -(rightEdge - screenRightEdge);

    if (allFilterDropdown) {
      allFilterDropdown.style.width = `${dropdownWidth}px`;
      allFilterDropdown.style.left = `${dropdownLeft}px`;
    }
  }
  window.adjustAllFilterDropdownPosition = adjustAllFilterDropdownPosition;

  function updatePriceFields() {
    const priceBuy = document.getElementById("price-buy");
    const priceJeonse = document.getElementById("price-jeonse");
    const priceMonthly = document.getElementById("price-monthly");
    if (!priceBuy || !priceJeonse || !priceMonthly) return;

    priceBuy.classList.add("hidden");
    priceJeonse.classList.add("hidden");
    priceMonthly.classList.add("hidden");

    if (selectedOfferTypes.has("매매")) priceBuy.classList.remove("hidden");
    if (selectedOfferTypes.has("전세")) priceJeonse.classList.remove("hidden");
    if (selectedOfferTypes.has("월세")) priceMonthly.classList.remove("hidden");
  }

  function updateAllFilterLabel() {
    const totalFilters = selectedHouseTypes.size + selectedOfferTypes.size + selectedOptions.size;
    const hasAreaFilter = (areaMinInput?.value && parseInt(areaMinInput.value) !== AREA_MIN_DEFAULT) ||
                          (areaMaxInput?.value && parseInt(areaMaxInput.value) !== AREA_MAX);
    const hasFloorFilter = (floorMinInput?.value && parseInt(floorMinInput.value) !== FLOOR_MIN) ||
                           (floorMaxInput?.value && parseInt(floorMaxInput.value) !== FLOOR_MAX);
    const hasBuildYearFilter = (document.getElementById("filter-build-year")?.value ?? "") !== "";
    const additional = (hasAreaFilter ? 1 : 0) + (hasFloorFilter ? 1 : 0) + (hasBuildYearFilter ? 1 : 0);
    const totalCount = totalFilters + additional;

    if (allFilterSelectedLabel) {
      if (totalCount > 0) {
        allFilterSelectedLabel.textContent = `${totalCount}개 필터 적용`;
        allFilterSelectedLabel.classList.remove("hidden");
      } else {
        allFilterSelectedLabel.textContent = "";
        allFilterSelectedLabel.classList.add("hidden");
      }
    }
  }

  function loadCurrentFiltersToDropdown() {
    const aMin = document.getElementById("filter-area-min");
    const aMax = document.getElementById("filter-area-max");
    const fMin = document.getElementById("filter-floor-min");
    const fMax = document.getElementById("filter-floor-max");

    if (aMin) aMin.value = areaMinInput?.value || "";
    if (aMax) aMax.value = areaMaxInput?.value || "";
    if (fMin) fMin.value = floorMinInput?.value || "";
    if (fMax) fMax.value = floorMaxInput?.value || "";

    updateFilterDropdownUI();
    updatePriceFields();
    updateAllFilterLabel();
  }

  function updateFilterDropdownUI() {
    document.querySelectorAll(".filter-house-type").forEach(b => {
      const on = selectedHouseTypes.has(b.dataset.type);
      b.classList.toggle("bg-blue-600", on);
      b.classList.toggle("text-white", on);
      b.classList.toggle("bg-gray-100", !on);
      b.classList.toggle("text-gray-700", !on);
    });

    document.querySelectorAll(".filter-offer-type").forEach(b => {
      const on = selectedOfferTypes.has(b.dataset.type);
      b.classList.toggle("bg-blue-600", on);
      b.classList.toggle("text-white", on);
      b.classList.toggle("bg-gray-100", !on);
      b.classList.toggle("text-gray-700", !on);
    });

    document.querySelectorAll(".filter-option").forEach(b => {
      const v = b.dataset.type;
      const on = v === "풀옵션" ? fullOptionItems.every(item => selectedOptions.has(item)) : selectedOptions.has(v);
      b.classList.toggle("bg-blue-600", on);
      b.classList.toggle("text-white", on);
      b.classList.toggle("bg-gray-100", !on);
      b.classList.toggle("text-gray-700", !on);
    });
  }

  // ======================
  // 결과 렌더러(전역) - 리스트는 여기서 건드리지 않지만, 필요하면 다른 곳에서 쓸 수 있게 유지
  // ======================
  window.renderPropertyList = window.renderPropertyList || function(items) {
    const box = document.getElementById("property-list");
    if (!box) return;

    box.innerHTML = (items ?? []).map(it => {
      const house = houseLabelOf(it.houseType);
      const offer = offerLabelOf(it.offerType);
      const priceText =
        it.offerType === "SALE"   ? `매매 ${fmt(it.totalPrice)}` :
        it.offerType === "JEONSE" ? `전세 ${fmt(it.deposit)}` :
        it.offerType === "WOLSE"  ? `월세 ${fmt(it.deposit)}/${fmt(it.monthlyRent)}` : "";

      return `
        <div class="p-3 border rounded-lg hover:shadow-sm cursor-pointer">
          <div class="text-sm text-gray-500">${it.address ?? ""}</div>
          <div class="font-semibold">${it.title ?? ""}</div>
          <div class="text-sm text-gray-700">
            ${house} · ${offer} · ${it.area ?? "-"}m² · ${it.floor ?? "-"}층
          </div>
          <div class="text-sm mt-1">${priceText}</div>
        </div>
      `;
    }).join("");
  };

  // ======================
  // 이벤트 리스너
  // ======================
  // 개별 필터 버튼
  houseTypeButton?.addEventListener("click", e => { e.stopPropagation(); toggleDropdown(houseTypeDropdown); });
  offerTypeButton?.addEventListener("click",  e => { e.stopPropagation(); toggleDropdown(offerTypeDropdown); });
  areaButton?.addEventListener("click",       e => { e.stopPropagation(); toggleDropdown(areaDropdown); });
  floorButton?.addEventListener("click",      e => { e.stopPropagation(); toggleDropdown(floorDropdown); });
  optionButton?.addEventListener("click",     e => { e.stopPropagation(); toggleDropdown(optionDropdown); });

  // 토글 선택
  document.querySelectorAll(".house-type-option").forEach(btn =>
    btn.addEventListener("click", e => {
      e.stopPropagation();
      const t = btn.dataset.type;
      selectedHouseTypes.has(t) ? selectedHouseTypes.delete(t) : selectedHouseTypes.add(t);
      updateHouseTypeUI();
      updateAllFilterLabel();
    })
  );
  document.querySelectorAll(".offer-type-option").forEach(btn =>
    btn.addEventListener("click", e => {
      e.stopPropagation();
      const t = btn.dataset.type;
      selectedOfferTypes.has(t) ? selectedOfferTypes.delete(t) : selectedOfferTypes.add(t);
      updateOfferTypeUI();
      updateAllFilterLabel();
      updatePriceFields();
    })
  );
  document.querySelectorAll(".option-item").forEach(btn =>
    btn.addEventListener("click", e => {
      e.stopPropagation();
      const value = btn.dataset.type;
      if (value === "풀옵션") {
        const isFull = fullOptionItems.every(item => selectedOptions.has(item));
        if (isFull) fullOptionItems.forEach(item => selectedOptions.delete(item));
        else fullOptionItems.forEach(item => selectedOptions.add(item));
      } else {
        selectedOptions.has(value) ? selectedOptions.delete(value) : selectedOptions.add(value);
      }
      updateOptionUI();
      updateAllFilterLabel();
    })
  );

  // 숫자 입력 필터
  [areaMinInput, areaMaxInput, floorMinInput, floorMaxInput].forEach(input => {
    input?.addEventListener("input", e => {
      e.target.value = e.target.value.replace(/[^0-9]/g, "");
      syncAreaLabel();
      syncFloorLabel();
      updateAllFilterLabel();
    });
  });

  // 전체필터 열기
  allFilterButton?.addEventListener("click", e => {
    e.stopPropagation();
    const isOpen = !allFilterDropdown?.classList.contains("hidden");
    closeAllDropdowns();
    if (!isOpen && allFilterDropdown) {
      allFilterDropdown.classList.remove("hidden");
      loadCurrentFiltersToDropdown();
      setTimeout(() => adjustAllFilterDropdownPosition(), 10);
    }
  });

  // 전체필터 내부 버튼
  document.querySelectorAll(".filter-house-type").forEach(btn =>
    btn.addEventListener("click", e => {
      e.stopPropagation();
      const t = btn.dataset.type;
      selectedHouseTypes.has(t) ? selectedHouseTypes.delete(t) : selectedHouseTypes.add(t);
      updateHouseTypeUI();
      updateFilterDropdownUI();
      updateAllFilterLabel();
    })
  );
  document.querySelectorAll(".filter-offer-type").forEach(btn =>
    btn.addEventListener("click", e => {
      e.stopPropagation();
      const t = btn.dataset.type;
      selectedOfferTypes.has(t) ? selectedOfferTypes.delete(t) : selectedOfferTypes.add(t);
      updateOfferTypeUI();
      updateFilterDropdownUI();
      updatePriceFields();
      updateAllFilterLabel();
    })
  );
  document.querySelectorAll(".filter-option").forEach(btn =>
    btn.addEventListener("click", e => {
      e.stopPropagation();
      const value = btn.dataset.type;
      if (value === "풀옵션") {
        const isFull = fullOptionItems.every(item => selectedOptions.has(item));
        if (isFull) fullOptionItems.forEach(item => selectedOptions.delete(item));
        else fullOptionItems.forEach(item => selectedOptions.add(item));
      } else {
        selectedOptions.has(value) ? selectedOptions.delete(value) : selectedOptions.add(value);
      }
      updateOptionUI();
      updateFilterDropdownUI();
      updateAllFilterLabel();
    })
  );

  // 전체필터 내부 숫자 입력
  document.getElementById("filter-area-min")?.addEventListener("input", e => {
    if (areaMinInput) areaMinInput.value = e.target.value.replace(/[^0-9]/g, "");
    syncAreaLabel(); updateAllFilterLabel();
  });
  document.getElementById("filter-area-max")?.addEventListener("input", e => {
    if (areaMaxInput) areaMaxInput.value = e.target.value.replace(/[^0-9]/g, "");
    syncAreaLabel(); updateAllFilterLabel();
  });
  document.getElementById("filter-floor-min")?.addEventListener("input", e => {
    if (floorMinInput) floorMinInput.value = e.target.value.replace(/[^0-9]/g, "");
    syncFloorLabel(); updateAllFilterLabel();
  });
  document.getElementById("filter-floor-max")?.addEventListener("input", e => {
    if (floorMaxInput) floorMaxInput.value = e.target.value.replace(/[^0-9]/g, "");
    syncFloorLabel(); updateAllFilterLabel();
  });

  // 준공년도 숫자만
  document.getElementById("filter-build-year")?.addEventListener("input", () => {
    const el = document.getElementById("filter-build-year");
    if (el) el.value = el.value.replace(/[^0-9]/g, "");
    updateAllFilterLabel();
  });

  // 초기화
  resetFilter?.addEventListener("click", () => {
    selectedHouseTypes.clear();
    selectedOfferTypes.clear();
    selectedOptions.clear();
    [areaMinInput, areaMaxInput, floorMinInput, floorMaxInput].forEach(i => i && (i.value = ""));
    const by = document.getElementById("filter-build-year");
    if (by) by.value = "";
    loadCurrentFiltersToDropdown();
    updateHouseTypeUI();
    updateOfferTypeUI();
    updateOptionUI();
    syncAreaLabel();
    syncFloorLabel();
    // 필터 초기화 알림(선택): 지도도 초기화하고 싶으면 아래 주석 해제
    // const payload = buildSearchPayloadFromUI();
    // window.currentFilters = payload;
    // window.dispatchEvent(new CustomEvent("filters:changed", { detail: payload }));
  });

  // 바깥 클릭 시 닫기
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".filter-wrapper")) closeAllDropdowns();
  });

  // 창 크기 변경 시 위치 재조정
  window.addEventListener("resize", () => {
    if (allFilterDropdown && !allFilterDropdown.classList.contains("hidden")) {
      adjustAllFilterDropdownPosition();
    }
  });

  // ======================
  // 페이로드 생성 함수
  // ======================
  function buildSearchPayloadFromUI() {
    // 옵션 비트마스크 (HTML 버튼 순서와 맞추기)
    const OPTION_ORDER = ["에어컨","냉장고","세탁기","가스레인지","인덕션레인지","침대","전자레인지","TV","책상","CCTV"];
    const buildOptionBitString = () => {
      const bits = Array(OPTION_ORDER.length).fill("0");
      for (const name of selectedOptions) {
        const idx = OPTION_ORDER.indexOf(name);
        if (idx >= 0) bits[idx] = "1";
      }
      return bits.join("");
    };

    // 가격 입력값
    const buyMin    = decOrNull(document.getElementById("filter-buy-min")?.value);
    const buyMax    = decOrNull(document.getElementById("filter-buy-max")?.value);
    const jeonseMin = decOrNull(document.getElementById("filter-jeonse-min")?.value);
    const jeonseMax = decOrNull(document.getElementById("filter-jeonse-max")?.value);
    const depMin    = decOrNull(document.getElementById("filter-deposit-min")?.value);
    const depMax    = decOrNull(document.getElementById("filter-deposit-max")?.value);
    const rentMin   = decOrNull(document.getElementById("filter-monthly-min")?.value);
    const rentMax   = decOrNull(document.getElementById("filter-monthly-max")?.value);

    // 준공년도(단일 입력)
    const buildYear = intOrNull(document.getElementById("filter-build-year")?.value?.trim());

    return {
      houseTypes: Array.from(selectedHouseTypes).map(mapHouseTypeToCode).filter(Boolean),
      offerTypes: Array.from(selectedOfferTypes).map(mapOfferTypeToCode).filter(Boolean),

      areaMin: intOrNull(areaMinInput?.value),
      areaMax: intOrNull(areaMaxInput?.value),
      floorMin: intOrNull(floorMinInput?.value),
      floorMax: intOrNull(floorMaxInput?.value),

      optionMask: buildOptionBitString(), // 예: "1100000000"
      optionMatchMode: "ALL",             // 필요시 "ANY"

      buyMin, buyMax,
      jeonseMin, jeonseMax,
      monthlyDepositMin: depMin,
      monthlyDepositMax: depMax,
      monthlyRentMin: rentMin,
      monthlyRentMax: rentMax,

      buildYearMin: buildYear,
      buildYearMax: buildYear,

      page: 0, size: 20
    };
  }

  // ======================
  // 검색 적용: 리스트는 건드리지 않고, 지도만 반응
  // ======================
  applyFilter?.addEventListener("click", (e) => {
    e.preventDefault();
    closeAllDropdowns();

    const payload = buildSearchPayloadFromUI();

    // ✅ 전역에 저장 + 지도에게 알림
    window.currentFilters = payload;
    window.dispatchEvent(new CustomEvent("filters:changed", { detail: payload }));

    updateAllFilterLabel();
  });

  // (선택) 다른 스크립트에서 필요하면 노출
  window.buildSearchPayloadFromUI = buildSearchPayloadFromUI;
});
