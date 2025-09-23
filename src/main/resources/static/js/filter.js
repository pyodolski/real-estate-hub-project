// js/filter.js

document.addEventListener('DOMContentLoaded', () => {
    // ======================
    // DOM 요소 및 상태 변수
    // ======================
    
    // --- 공통 ---
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
    const fullOptionItems = ["에어컨", "냉장고", "세탁기", "가스레인지", "인덕션레인지", "침대", "전자레인지"];

    // --- 전체필터 ---
    const allFilterButton = document.getElementById("all-filter-button");
    const allFilterSelectedLabel = document.getElementById("all-filter-selected-label");
    const applyFilter = document.getElementById("apply-filter");
    const resetFilter = document.getElementById("reset-filter");
    
    
    // ======================
    // 함수 정의
    // ======================

    function closeAllDropdowns() {
        if(houseTypeDropdown) houseTypeDropdown.classList.add("hidden");
        if(offerTypeDropdown) offerTypeDropdown.classList.add("hidden");
        if(areaDropdown) areaDropdown.classList.add("hidden");
        if(floorDropdown) floorDropdown.classList.add("hidden");
        if(optionDropdown) optionDropdown.classList.add("hidden");
        if(allFilterDropdown) allFilterDropdown.classList.add("hidden");
    }

    // --- 주거형태 UI 업데이트 ---
    function updateHouseTypeUI() {
        document.querySelectorAll(".house-type-option").forEach((b) => {
            const v = b.getAttribute("data-type");
            const isActive = selectedHouseTypes.has(v);
            b.classList.toggle("bg-blue-600", isActive);
            b.classList.toggle("text-white", isActive);
            b.classList.toggle("bg-gray-100", !isActive);
            b.classList.toggle("text-gray-700", !isActive);
        });
        if (selectedHouseTypes.size > 0) {
            houseTypeSelectedLabel.textContent = Array.from(selectedHouseTypes).join(", ");
            houseTypeSelectedLabel.classList.remove("hidden");
        } else {
            houseTypeSelectedLabel.textContent = "";
            houseTypeSelectedLabel.classList.add("hidden");
        }
    }

    // --- 거래방식 UI 업데이트 ---
    function updateOfferTypeUI() {
        document.querySelectorAll(".offer-type-option").forEach((b) => {
            const v = b.getAttribute("data-type");
            const isActive = selectedOfferTypes.has(v);
            b.classList.toggle("bg-blue-600", isActive);
            b.classList.toggle("text-white", isActive);
            b.classList.toggle("bg-gray-100", !isActive);
            b.classList.toggle("text-gray-700", !isActive);
        });
        if (selectedOfferTypes.size > 0) {
            offerTypeSelectedLabel.textContent = Array.from(selectedOfferTypes).join(", ");
            offerTypeSelectedLabel.classList.remove("hidden");
        } else {
            offerTypeSelectedLabel.textContent = "";
            offerTypeSelectedLabel.classList.add("hidden");
        }
    }

    // --- 전용면적 UI 업데이트 ---
    function syncAreaLabel() {
        const minVal = parseInt(areaMinInput.value, 10) || AREA_MIN_DEFAULT;
        const maxVal = parseInt(areaMaxInput.value, 10) || AREA_MAX;
        if ((areaMinInput.value && minVal !== AREA_MIN_DEFAULT) || (areaMaxInput.value && maxVal !== AREA_MAX)) {
            areaSelectedLabel.textContent = `${minVal}~${maxVal} m²`;
            areaSelectedLabel.classList.remove("hidden");
        } else {
            areaSelectedLabel.textContent = "";
            areaSelectedLabel.classList.add("hidden");
        }
    }

    // --- 층수 UI 업데이트 ---
    function syncFloorLabel() {
        const minVal = parseInt(floorMinInput.value, 10) || FLOOR_MIN;
        const maxVal = parseInt(floorMaxInput.value, 10) || FLOOR_MAX;
        if ((floorMinInput.value && minVal !== FLOOR_MIN) || (floorMaxInput.value && maxVal !== FLOOR_MAX)) {
            floorSelectedLabel.textContent = `${minVal}~${maxVal} 층`;
            floorSelectedLabel.classList.remove("hidden");
        } else {
            floorSelectedLabel.textContent = "";
            floorSelectedLabel.classList.add("hidden");
        }
    }

    // --- 옵션 UI 업데이트 ---
    function updateOptionUI() {
        document.querySelectorAll(".option-item").forEach((b) => {
            const v = b.getAttribute("data-type");
            if (v === "풀옵션") {
                const isFullOptionActive = fullOptionItems.every((item) => selectedOptions.has(item));
                b.classList.toggle("bg-blue-600", isFullOptionActive);
                b.classList.toggle("text-white", isFullOptionActive);
            } else {
                const isActive = selectedOptions.has(v);
                b.classList.toggle("bg-blue-600", isActive);
                b.classList.toggle("text-white", isActive);
            }
        });

        if (selectedOptions.size > 0) {
            const optionArray = Array.from(selectedOptions);
            optionSelectedLabel.textContent = optionArray.length > 3
                ? `${optionArray.slice(0, 3).join(", ")} 외 ${optionArray.length - 3}개`
                : optionArray.join(", ");
            optionSelectedLabel.classList.remove("hidden");
        } else {
            optionSelectedLabel.textContent = "";
            optionSelectedLabel.classList.add("hidden");
        }
    }
    
    // --- 전체필터 관련 함수 ---
    function adjustAllFilterDropdownPosition() {
        const sidePanel = document.getElementById("side-panel");
        const rightSidePanel = document.getElementById("right-side-panel");
        
        // DOM 상태를 직접 읽어와서 panel-manager의 상태 변수에 의존하지 않도록 함
        const isPanelOpen = sidePanel && !sidePanel.classList.contains("-translate-x-full");
        const isPanelExpanded = sidePanel && sidePanel.classList.contains("w-full");
        const isRightPanelOpen = rightSidePanel && !rightSidePanel.classList.contains("translate-x-full");
        const hasOpenRightCardPanel = document.querySelector('#chat-panel:not(.translate-x-full), #profile-panel:not(.translate-x-full), #notification-panel:not(.translate-x-full), #favorite-panel:not(.translate-x-full), #compare-panel:not(.translate-x-full), #my-property-panel:not(.translate-x-full)') !== null;

        const leftPanelWidth = isPanelOpen ? (isPanelExpanded ? window.innerWidth : 450) : 0;
        let rightPanelWidth = 0;
        if (isRightPanelOpen) {
            rightPanelWidth = 75; // Icon panel
            if (hasOpenRightCardPanel) {
                rightPanelWidth += 450; // Card panel
            }
        }
        
        const availableWidth = window.innerWidth - leftPanelWidth - rightPanelWidth;
        let dropdownWidth = Math.min(450, Math.max(350, availableWidth - 40));
        
        const buttonRect = allFilterButton.getBoundingClientRect();
        const rightEdge = buttonRect.left + dropdownWidth;
        const screenRightEdge = window.innerWidth - rightPanelWidth - 20;
        
        let dropdownLeft = 0;
        if (rightEdge > screenRightEdge) {
            dropdownLeft = -(rightEdge - screenRightEdge);
        }

        allFilterDropdown.style.width = `${dropdownWidth}px`;
        allFilterDropdown.style.left = `${dropdownLeft}px`;
    }
    // panel-manager.js에서 호출할 수 있도록 window 객체에 할당
    window.adjustAllFilterDropdownPosition = adjustAllFilterDropdownPosition;


    function updateAllFilterLabel() {
        const totalFilters = selectedHouseTypes.size + selectedOfferTypes.size + selectedOptions.size;
        const hasAreaFilter = (areaMinInput.value && parseInt(areaMinInput.value) !== AREA_MIN_DEFAULT) || (areaMaxInput.value && parseInt(areaMaxInput.value) !== AREA_MAX);
        const hasFloorFilter = (floorMinInput.value && parseInt(floorMinInput.value) !== FLOOR_MIN) || (floorMaxInput.value && parseInt(floorMaxInput.value) !== FLOOR_MAX);
        const hasBuildYearFilter = document.getElementById("filter-build-year").value !== "";
        const additionalFilters = (hasAreaFilter ? 1 : 0) + (hasFloorFilter ? 1 : 0) + (hasBuildYearFilter ? 1 : 0);
        const totalCount = totalFilters + additionalFilters;

        if (totalCount > 0) {
            allFilterSelectedLabel.textContent = `${totalCount}개 필터 적용`;
            allFilterSelectedLabel.classList.remove("hidden");
        } else {
            allFilterSelectedLabel.textContent = "";
            allFilterSelectedLabel.classList.add("hidden");
        }
    }

    function updatePriceFields() {
        const priceBuy = document.getElementById("price-buy");
        const priceJeonse = document.getElementById("price-jeonse");
        const priceMonthly = document.getElementById("price-monthly");
        if(!priceBuy || !priceJeonse || !priceMonthly) return;

        priceBuy.classList.add("hidden");
        priceJeonse.classList.add("hidden");
        priceMonthly.classList.add("hidden");

        if (selectedOfferTypes.has("매매")) priceBuy.classList.remove("hidden");
        if (selectedOfferTypes.has("전세")) priceJeonse.classList.remove("hidden");
        if (selectedOfferTypes.has("월세")) priceMonthly.classList.remove("hidden");
    }

    function loadCurrentFiltersToDropdown() {
        document.getElementById("filter-area-min").value = areaMinInput.value;
        document.getElementById("filter-area-max").value = areaMaxInput.value;
        document.getElementById("filter-floor-min").value = floorMinInput.value;
        document.getElementById("filter-floor-max").value = floorMaxInput.value;
        updateFilterDropdownUI();
        updatePriceFields();
        updateAllFilterLabel();
    }

    function updateFilterDropdownUI() {
        document.querySelectorAll(".filter-house-type").forEach(b => b.classList.toggle("bg-blue-600", selectedHouseTypes.has(b.dataset.type)).classList.toggle("text-white", selectedHouseTypes.has(b.dataset.type)));
        document.querySelectorAll(".filter-offer-type").forEach(b => b.classList.toggle("bg-blue-600", selectedOfferTypes.has(b.dataset.type)).classList.toggle("text-white", selectedOfferTypes.has(b.dataset.type)));
        document.querySelectorAll(".filter-option").forEach(b => {
             if (b.dataset.type === "풀옵션") {
                const isFull = fullOptionItems.every(item => selectedOptions.has(item));
                b.classList.toggle("bg-blue-600", isFull).classList.toggle("text-white", isFull);
             } else {
                b.classList.toggle("bg-blue-600", selectedOptions.has(b.dataset.type)).classList.toggle("text-white", selectedOptions.has(b.dataset.type));
             }
        });
    }

    // ======================
    // 이벤트 리스너
    // ======================

    // --- 개별 필터 버튼 ---
    houseTypeButton?.addEventListener("click", e => { e.stopPropagation(); const isOpen = !houseTypeDropdown.classList.contains("hidden"); closeAllDropdowns(); if (!isOpen) houseTypeDropdown.classList.remove("hidden"); });
    offerTypeButton?.addEventListener("click", e => { e.stopPropagation(); const isOpen = !offerTypeDropdown.classList.contains("hidden"); closeAllDropdowns(); if (!isOpen) offerTypeDropdown.classList.remove("hidden"); });
    areaButton?.addEventListener("click", e => { e.stopPropagation(); const isOpen = !areaDropdown.classList.contains("hidden"); closeAllDropdowns(); if (!isOpen) areaDropdown.classList.remove("hidden"); });
    floorButton?.addEventListener("click", e => { e.stopPropagation(); const isOpen = !floorDropdown.classList.contains("hidden"); closeAllDropdowns(); if (!isOpen) floorDropdown.classList.remove("hidden"); });
    optionButton?.addEventListener("click", e => { e.stopPropagation(); const isOpen = !optionDropdown.classList.contains("hidden"); closeAllDropdowns(); if (!isOpen) optionDropdown.classList.remove("hidden"); });
    
    // --- 필터 옵션 선택 ---
    document.querySelectorAll(".house-type-option").forEach(btn => btn.addEventListener("click", e => { e.stopPropagation(); if (selectedHouseTypes.has(btn.dataset.type)) selectedHouseTypes.delete(btn.dataset.type); else selectedHouseTypes.add(btn.dataset.type); updateHouseTypeUI(); }));
    document.querySelectorAll(".offer-type-option").forEach(btn => btn.addEventListener("click", e => { e.stopPropagation(); if (selectedOfferTypes.has(btn.dataset.type)) selectedOfferTypes.delete(btn.dataset.type); else selectedOfferTypes.add(btn.dataset.type); updateOfferTypeUI(); }));
    document.querySelectorAll(".option-item").forEach(btn => btn.addEventListener("click", e => { e.stopPropagation(); const value = btn.dataset.type; if (value === "풀옵션") { const isFull = fullOptionItems.every(item => selectedOptions.has(item)); if (isFull) { fullOptionItems.forEach(item => selectedOptions.delete(item)); } else { fullOptionItems.forEach(item => selectedOptions.add(item)); } } else { if (selectedOptions.has(value)) selectedOptions.delete(value); else selectedOptions.add(value); } updateOptionUI(); }));
    
    // --- 숫자 입력 필터 ---
    [areaMinInput, areaMaxInput, floorMinInput, floorMaxInput].forEach(input => {
        input?.addEventListener("input", e => { e.target.value = e.target.value.replace(/[^0-9]/g, ""); syncAreaLabel(); syncFloorLabel(); });
    });

    // --- 전체필터 ---
    allFilterButton?.addEventListener("click", e => {
        e.stopPropagation();
        const isOpen = !allFilterDropdown.classList.contains("hidden");
        closeAllDropdowns();
        if (!isOpen) {
            allFilterDropdown.classList.remove("hidden");
            loadCurrentFiltersToDropdown();
            setTimeout(() => adjustAllFilterDropdownPosition(), 10);
        }
    });

    // --- 전체필터 내부 버튼 ---
    document.querySelectorAll(".filter-house-type").forEach(btn => btn.addEventListener("click", e => { e.stopPropagation(); if (selectedHouseTypes.has(btn.dataset.type)) selectedHouseTypes.delete(btn.dataset.type); else selectedHouseTypes.add(btn.dataset.type); updateHouseTypeUI(); updateFilterDropdownUI(); updateAllFilterLabel(); }));
    document.querySelectorAll(".filter-offer-type").forEach(btn => btn.addEventListener("click", e => { e.stopPropagation(); if (selectedOfferTypes.has(btn.dataset.type)) selectedOfferTypes.delete(btn.dataset.type); else selectedOfferTypes.add(btn.dataset.type); updateOfferTypeUI(); updateFilterDropdownUI(); updatePriceFields(); updateAllFilterLabel(); }));
    document.querySelectorAll(".filter-option").forEach(btn => btn.addEventListener("click", e => { e.stopPropagation(); const value = btn.dataset.type; if (value === "풀옵션") { const isFull = fullOptionItems.every(item => selectedOptions.has(item)); if (isFull) { fullOptionItems.forEach(item => selectedOptions.delete(item)); } else { fullOptionItems.forEach(item => selectedOptions.add(item)); } } else { if (selectedOptions.has(value)) selectedOptions.delete(value); else selectedOptions.add(value); } updateOptionUI(); updateFilterDropdownUI(); updateAllFilterLabel(); }));
    
    // --- 전체필터 내부 숫자 입력 ---
    document.getElementById("filter-area-min")?.addEventListener("input", e => { areaMinInput.value = e.target.value.replace(/[^0-9]/g, ""); syncAreaLabel(); updateAllFilterLabel(); });
    document.getElementById("filter-area-max")?.addEventListener("input", e => { areaMaxInput.value = e.target.value.replace(/[^0-9]/g, ""); syncAreaLabel(); updateAllFilterLabel(); });
    document.getElementById("filter-floor-min")?.addEventListener("input", e => { floorMinInput.value = e.target.value.replace(/[^0-9]/g, ""); syncFloorLabel(); updateAllFilterLabel(); });
    document.getElementById("filter-floor-max")?.addEventListener("input", e => { floorMaxInput.value = e.target.value.replace(/[^0-9]/g, ""); syncFloorLabel(); updateAllFilterLabel(); });

    // --- 전체필터 적용/초기화 ---
    resetFilter?.addEventListener("click", () => {
        selectedHouseTypes.clear();
        selectedOfferTypes.clear();
        selectedOptions.clear();
        [areaMinInput, areaMaxInput, floorMinInput, floorMaxInput].forEach(i => i.value = "");
        document.getElementById("filter-build-year").value = "";
        loadCurrentFiltersToDropdown();
        updateHouseTypeUI();
        updateOfferTypeUI();
        updateOptionUI();
        syncAreaLabel();
        syncFloorLabel();
    });
    applyFilter?.addEventListener("click", () => closeAllDropdowns());

    // --- 외부 클릭 시 드롭다운 닫기 ---
    document.addEventListener("click", (e) => {
        if (!e.target.closest('.filter-wrapper')) {
            closeAllDropdowns();
        }
    });
    
    // --- 창 크기 변경 시 위치 재조정 ---
    window.addEventListener("resize", () => {
        if (allFilterDropdown && !allFilterDropdown.classList.contains("hidden")) {
            adjustAllFilterDropdownPosition();
        }
    });
});
