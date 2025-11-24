// js/panel-manager.js

document.addEventListener("DOMContentLoaded", () => {
  // --- 상태 변수 ---
  let isPanelOpen = true;
  let isPanelExpanded = false;
  // 패널 확장을 상세페이지와 연동 위해 전역 할당.
  window.isPanelExpanded = false;
  let isRightPanelOpen = true;

  // --- DOM 요소 ---
  const sidePanel = document.getElementById("side-panel");
  const searchBarContainer = document.getElementById("search-bar-container");
  const mainContent = document.querySelector("main");
  const rightSidePanel = document.getElementById("right-side-panel");
  const rightToggleButton = document.getElementById(
    "right-panel-toggle-button"
  );
  const rightOpenIcon = document.getElementById("right-open-icon");
  const rightCloseIcon = document.getElementById("right-close-icon");

  // 왼쪽 패널 컨트롤 버튼
  const openPanelButton = document.getElementById("open-panel-button");
  const closePanelButton = document.getElementById("close-panel-button");
  const expandPanelButton = document.getElementById("expand-panel-button");
  const collapseFullscreenButton = document.getElementById(
    "collapse-fullscreen-button"
  );
  const addListingContainer = document.getElementById("add-listing-container");
  const advertisementContainer = document.getElementById("advertisement-container");

  // 매물 목록 컨테이너
  const recommendedListContainer = document.getElementById("recommended-list");
  const propertyListContainer = document.getElementById("property-list");

  // 전체필터 드롭다운 (위치 계산에 필요)
  const allFilterDropdown = document.getElementById("all-filter-dropdown");

  // --- 통합 패널 관리 시스템 ---
  const allPanels = {
    chat: {
      panel: document.getElementById("chat-panel"),
      button: document.getElementById("chat-button"),
      closeButton: document.getElementById("close-chat-panel"),
      isOpen: false,
      width: 450,
    },
    profile: {
      panel: document.getElementById("profile-panel"),
      button: document.getElementById("profile-button"),
      closeButton: document.getElementById("close-profile-panel"),
      isOpen: false,
      width: 450,
    },
    notification: {
      panel: document.getElementById("notification-panel"),
      button: document.getElementById("notification-button"),
      closeButton: document.getElementById("close-notification-panel"),
      isOpen: false,
      width: 450,
    },
    favorite: {
      panel: document.getElementById("favorite-panel"),
      button: document.getElementById("favorite-panel-button"),
      closeButton: document.getElementById("close-favorite-panel"),
      isOpen: false,
      width: 450,
    },
    compare: {
      panel: document.getElementById("compare-panel"),
      button: document.getElementById("compare-panel-button"),
      closeButton: document.getElementById("close-compare-panel"),
      isOpen: false,
      width: 450,
    },
    "my-property": {
      panel: document.getElementById("my-property-panel"),
      button: document.getElementById("my-property-button"),
      closeButton: document.getElementById("close-my-property-panel"),
      isOpen: false,
      width: 450,
    },
    "broker-list": {
      panel: document.getElementById("broker-list-panel"),
      button: document.getElementById("broker-list-button"),
      closeButton: document.getElementById("close-broker-list-panel"),
      isOpen: false,
      width: 450,
    },
  };

  const RIGHT_SIDE_PANEL_WIDTH = 75;
  const MARGIN = 24;

  // --- 왼쪽 패널 UI 업데이트 로직 ---
  function updateUIVisibility() {
    if (isPanelExpanded) {
      sidePanel.classList.remove("w-[450px]");
      sidePanel.classList.add("w-full", "z-50");
      if (addListingContainer) addListingContainer.classList.add("mr-16");
      if (advertisementContainer) advertisementContainer.classList.add("hidden");

      const gridClasses = [
        "md:grid-cols-3",
        "lg:grid-cols-4",
        "xl:grid-cols-5",
      ];
      const singleColGridClasses = ["sm:grid-cols-2", ...gridClasses];
      recommendedListContainer.classList.add(...gridClasses);
      propertyListContainer.classList.remove("flex", "flex-col", "space-y-4");
      propertyListContainer.classList.add(
        "grid",
        "gap-4",
        ...singleColGridClasses
      );

      mainContent.classList.add("hidden");
      rightSidePanel.classList.add("hidden");
      rightToggleButton.classList.add("hidden");
      openPanelButton.classList.add("opacity-0", "pointer-events-none");
      closePanelButton.classList.add("opacity-0", "pointer-events-none");
      expandPanelButton.classList.add("opacity-0", "pointer-events-none");
      collapseFullscreenButton.classList.remove("hidden");
    } else {
      sidePanel.classList.add("w-[450px]");
      sidePanel.classList.remove("w-full", "z-50");
      if (addListingContainer) addListingContainer.classList.remove("mr-16");
      if (advertisementContainer) advertisementContainer.classList.remove("hidden");

      const gridClasses = [
        "md:grid-cols-3",
        "lg:grid-cols-4",
        "xl:grid-cols-5",
      ];
      const singleColGridClasses = ["sm:grid-cols-2", ...gridClasses];
      recommendedListContainer.classList.remove(...gridClasses);
      propertyListContainer.classList.add("flex", "flex-col", "space-y-4");
      propertyListContainer.classList.remove(
        "grid",
        "gap-4",
        ...singleColGridClasses
      );

      mainContent.classList.remove("hidden");
      rightSidePanel.classList.remove("hidden");
      rightToggleButton.classList.remove("hidden");
      collapseFullscreenButton.classList.add("hidden");

      if (isPanelOpen) {
        sidePanel.classList.remove("-translate-x-full");
        if (searchBarContainer) searchBarContainer.style.left = "474px";
        closePanelButton.style.left = "450px";
        expandPanelButton.style.left = "450px";
        closePanelButton.style.opacity = "1";
        closePanelButton.style.pointerEvents = "auto";
        expandPanelButton.style.opacity = "1";
        expandPanelButton.style.pointerEvents = "auto";
        openPanelButton.classList.add("opacity-0", "pointer-events-none");
      } else {
        sidePanel.classList.add("-translate-x-full");
        if (searchBarContainer) searchBarContainer.style.left = "24px";
        closePanelButton.style.left = "0px";
        expandPanelButton.style.left = "0px";
        closePanelButton.style.opacity = "0";
        closePanelButton.style.pointerEvents = "none";
        expandPanelButton.style.opacity = "0";
        expandPanelButton.style.pointerEvents = "none";
        openPanelButton.classList.remove("opacity-0", "pointer-events-none");
      }
    }
  }

  // --- 오른쪽 패널 관리 함수 ---
  function closeAllRightPanels() {
    Object.values(allPanels).forEach((p) => {
      p.panel.classList.add("translate-x-full");
      p.isOpen = false;
      p.panel.style.right = isRightPanelOpen
        ? `${RIGHT_SIDE_PANEL_WIDTH}px`
        : `-${p.width}px`;
    });

    // 판매 매물 등록 패널도 닫기
    const salePanel = document.getElementById('sale-registration-panel');
    if (salePanel && window.propertyManagement && typeof window.propertyManagement.hideSaleRegistrationPanel === 'function') {
      window.propertyManagement.hideSaleRegistrationPanel();
    }

    if (isRightPanelOpen) {
      rightToggleButton.style.right = `${RIGHT_SIDE_PANEL_WIDTH}px`;
      if (searchBarContainer) searchBarContainer.style.right = `${RIGHT_SIDE_PANEL_WIDTH + MARGIN}px`;
    } else {
      rightToggleButton.style.right = "0px";
      if (searchBarContainer) searchBarContainer.style.right = `${MARGIN}px`;
    }

    if (allFilterDropdown && !allFilterDropdown.classList.contains("hidden")) {
      setTimeout(() => adjustAllFilterDropdownPosition(), 300);
    }


  }

  function openRightPanel(panelName) {
    const panel = allPanels[panelName];
    if (!panel) return;

    closeAllRightPanels();
    panel.panel.classList.remove("translate-x-full");
    panel.isOpen = true;
    panel.panel.style.right = `${RIGHT_SIDE_PANEL_WIDTH}px`;
    panel.panel.style.right = `${RIGHT_SIDE_PANEL_WIDTH}px`;
    rightToggleButton.style.right = `${panel.width + RIGHT_SIDE_PANEL_WIDTH}px`;
    if (searchBarContainer) {
      searchBarContainer.style.right = `${panel.width + RIGHT_SIDE_PANEL_WIDTH + MARGIN
        }px`;
    }

    // panel-specific rendering logic should be called from the main script
    // For example: if (typeof renderNotifications === 'function') renderNotifications();
    if (
      panelName === "notification" &&
      typeof renderNotifications === "function"
    )
      renderNotifications();
    if (
      panelName === "favorite" &&
      typeof renderFavoriteProperties === "function"
    )
      renderFavoriteProperties();
    if (panelName === "compare" && typeof renderCompareGroups === "function")
      renderCompareGroups();
    if (panelName === "chat") {
      if (window.ChatController) {
        window.ChatController.renderChatList();
      } else if (typeof renderChatList === "function") {
        renderChatList();
        initializeChatSearch();
      }
    }
    if (panelName === "my-property" && window.propertyManagement) {
      window.propertyManagement.loadMyProperties();
    }
    if (panelName === "broker-list" && window.brokerManagement) {
      window.brokerManagement.loadBrokers();
    }

    if (allFilterDropdown && !allFilterDropdown.classList.contains("hidden")) {
      setTimeout(() => adjustAllFilterDropdownPosition(), 300);
    }
  }

  function toggleRightPanel(panelName) {
    const panel = allPanels[panelName];
    if (!panel) return;
    if (panel.isOpen) {
      closeAllRightPanels();
    } else {
      openRightPanel(panelName);
    }
  }

  // --- 왼쪽 패널 이벤트 리스너 ---
  closePanelButton.addEventListener("click", () => {
    // 상세가 열려 있으면 상세만 닫기
    if (window.isDetailOpen && typeof window.closePropertyDetail === 'function') {
      window.closePropertyDetail();
      return;
    }
    // 상세가 열려있지 않으면 패널 자체를 닫기
    isPanelOpen = false;
    // 상세페이지용 버튼 상태를 원래 상태로 복원
    if (typeof window.updatePanelButtonsForDetail === 'function') {
      window.updatePanelButtonsForDetail(false);
    }
    updateUIVisibility();
    if (typeof adjustAllFilterDropdownPosition === 'function') setTimeout(() => adjustAllFilterDropdownPosition(), 300);
  });

  openPanelButton.addEventListener("click", () => {
    isPanelOpen = true;
    updateUIVisibility();
    if (typeof adjustAllFilterDropdownPosition === "function")
      setTimeout(() => adjustAllFilterDropdownPosition(), 300);
  });

  expandPanelButton.addEventListener("click", () => {
    // 상세 패널이 열린 상태인지 확인
    const isDetailOpen =
      typeof window.openPropertyDetail !== "undefined" &&
      document.querySelector(
        '#property-detail-overlay-a[style*="opacity: 1"], #property-detail-overlay-b[style*="opacity: 1"]'
      );

    if (isDetailOpen) {
      // 상세 패널이 열린 상태에서는 상세 패널 전체화면 기능이 작동하도록 함
      // property-detail-panel.js에서 이미 처리되므로 여기서는 아무것도 하지 않음
      return;
    }

    // 기본 패널 전체화면 확장 기능
    isPanelExpanded = true;
    window.isPanelExpanded = true; // 전역 변수도 업데이트
    updateUIVisibility();
    if (typeof adjustAllFilterDropdownPosition === "function")
      setTimeout(() => adjustAllFilterDropdownPosition(), 300);
  });

  collapseFullscreenButton.addEventListener("click", () => {
    isPanelExpanded = false;
    window.isPanelExpanded = false; // 전역 변수도 업데이트
    updateUIVisibility();
    if (typeof adjustAllFilterDropdownPosition === "function")
      setTimeout(() => adjustAllFilterDropdownPosition(), 300);
  });

  // --- 오른쪽 패널 이벤트 리스너 ---
  rightToggleButton.addEventListener("click", (e) => {
    e.stopPropagation();
    const hasOpenPanel = Object.values(allPanels).some((p) => p.isOpen);
    if (hasOpenPanel) {
      closeAllRightPanels();
      return;
    }

    isRightPanelOpen = !isRightPanelOpen;
    if (isRightPanelOpen) {
      rightSidePanel.classList.remove("translate-x-full");
      if (searchBarContainer) searchBarContainer.style.right = `${RIGHT_SIDE_PANEL_WIDTH + MARGIN}px`;
      rightOpenIcon.classList.add("hidden");
      rightCloseIcon.classList.remove("hidden");
      rightToggleButton.style.right = `${RIGHT_SIDE_PANEL_WIDTH}px`;
    } else {
      rightSidePanel.classList.add("translate-x-full");
      if (searchBarContainer) searchBarContainer.style.right = `${MARGIN}px`;
      rightOpenIcon.classList.remove("hidden");
      rightCloseIcon.classList.add("hidden");
      rightToggleButton.style.right = "0px";
      closeAllRightPanels();
    }
    if (typeof adjustAllFilterDropdownPosition === "function")
      setTimeout(() => adjustAllFilterDropdownPosition(), 300);
  });

  // 홈 버튼 이벤트 리스너
  const homeButton = document.getElementById("home-button");
  if (homeButton) {
    homeButton.addEventListener("click", () => {
      closeAllRightPanels();
    });
  }

  // 각 패널 버튼/닫기 버튼 이벤트 리스너 등록
  Object.entries(allPanels).forEach(([name, panel]) => {
    if (panel.button) {
      panel.button.addEventListener("click", () => toggleRightPanel(name));
    }
    if (panel.closeButton) {
      panel.closeButton.addEventListener("click", () => closeAllRightPanels());
    }
  });

  // --- 초기 UI 상태 설정 ---
  updateUIVisibility();
  closeAllRightPanels();
});
