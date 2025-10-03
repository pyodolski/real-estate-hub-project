// 내 매물 관리 JavaScript 모듈 - Part 2
// 모달 관리 메서드들을 PropertyManagement 클래스에 확장

(function () {
  // PropertyManagement 클래스가 이미 정의되어 있는지 확인
  if (typeof window.PropertyManagement === "undefined") {
    console.error(
      "[Part 2] PropertyManagement class not found. Load part-1.js first."
    );
    return;
  }

  // 모달 상태 관리를 위한 정적 속성 초기화
  if (!PropertyManagement.modalState) {
    PropertyManagement.modalState = {
      activeModals: new Set(),
      modalStack: [],
      eventListeners: new Map(),
    };
  }

  // 모달 닫기 메서드
  PropertyManagement.prototype.closeModal = function (modalId) {
    console.log(`[PropertyManagement] Closing modal: ${modalId}`);

    try {
      const modal = document.getElementById(modalId);
      if (!modal) {
        console.warn(`[PropertyManagement] Modal not found: ${modalId}`);
        return false;
      }

      // 모달 상태에서 제거
      PropertyManagement.modalState.activeModals.delete(modalId);

      // 모달 스택에서 제거
      const stackIndex =
        PropertyManagement.modalState.modalStack.indexOf(modalId);
      if (stackIndex > -1) {
        PropertyManagement.modalState.modalStack.splice(stackIndex, 1);
      }

      // 이벤트 리스너 정리
      this.cleanupModalEventListeners(modalId);

      // 모달 요소 제거
      modal.remove();

      // body 스크롤 복원 (다른 모달이 없는 경우)
      if (PropertyManagement.modalState.activeModals.size === 0) {
        document.body.style.overflow = "";
      }

      console.log(`[PropertyManagement] Modal closed successfully: ${modalId}`);
      return true;
    } catch (error) {
      console.error(
        `[PropertyManagement] Error closing modal ${modalId}:`,
        error
      );
      this.showError("모달을 닫는 중 오류가 발생했습니다.");
      return false;
    }
  };

  // 모달 표시 메서드
  PropertyManagement.prototype.showModal = function (
    modalId,
    modalElement = null
  ) {
    console.log(`[PropertyManagement] Showing modal: ${modalId}`);

    try {
      let modal = modalElement;

      // modalElement가 제공되지 않은 경우 DOM에서 찾기
      if (!modal) {
        modal = document.getElementById(modalId);
        if (!modal) {
          console.error(
            `[PropertyManagement] Modal element not found: ${modalId}`
          );
          this.showError("모달을 찾을 수 없습니다.");
          return false;
        }
      }

      // 이미 표시된 모달인지 확인
      if (PropertyManagement.modalState.activeModals.has(modalId)) {
        console.warn(`[PropertyManagement] Modal already active: ${modalId}`);
        return true;
      }

      // 모달 상태에 추가
      PropertyManagement.modalState.activeModals.add(modalId);
      PropertyManagement.modalState.modalStack.push(modalId);

      // body 스크롤 방지
      document.body.style.overflow = "hidden";

      // 모달이 DOM에 없는 경우 추가
      if (!modal.parentNode) {
        document.body.appendChild(modal);
      }

      // 모달 표시
      modal.style.display = "flex";
      modal.classList.remove("hidden");

      // ESC 키 이벤트 리스너 등록
      this.registerModalEventListeners(modalId);

      // 포커스 트랩 설정
      this.setupFocusTrap(modal);

      console.log(`[PropertyManagement] Modal shown successfully: ${modalId}`);
      return true;
    } catch (error) {
      console.error(
        `[PropertyManagement] Error showing modal ${modalId}:`,
        error
      );
      this.showError("모달을 표시하는 중 오류가 발생했습니다.");
      return false;
    }
  };

  // 모달 이벤트 리스너 등록
  PropertyManagement.prototype.registerModalEventListeners = function (
    modalId
  ) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    // ESC 키 이벤트 핸들러
    const escKeyHandler = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        this.closeModal(modalId);
      }
    };

    // 백드롭 클릭 이벤트 핸들러
    const backdropClickHandler = (event) => {
      if (event.target === modal) {
        this.closeModal(modalId);
      }
    };

    // 이벤트 리스너 등록
    document.addEventListener("keydown", escKeyHandler);
    modal.addEventListener("click", backdropClickHandler);

    // 이벤트 리스너 저장 (나중에 정리하기 위해)
    if (!PropertyManagement.modalState.eventListeners.has(modalId)) {
      PropertyManagement.modalState.eventListeners.set(modalId, []);
    }

    PropertyManagement.modalState.eventListeners
      .get(modalId)
      .push(
        { type: "keydown", element: document, handler: escKeyHandler },
        { type: "click", element: modal, handler: backdropClickHandler }
      );
  };

  // 모달 이벤트 리스너 정리
  PropertyManagement.prototype.cleanupModalEventListeners = function (modalId) {
    const listeners = PropertyManagement.modalState.eventListeners.get(modalId);
    if (!listeners) return;

    // 등록된 이벤트 리스너들 제거
    listeners.forEach(({ type, element, handler }) => {
      try {
        element.removeEventListener(type, handler);
      } catch (error) {
        console.warn(
          `[PropertyManagement] Failed to remove event listener:`,
          error
        );
      }
    });

    // 이벤트 리스너 맵에서 제거
    PropertyManagement.modalState.eventListeners.delete(modalId);
  };

  // 포커스 트랩 설정
  PropertyManagement.prototype.setupFocusTrap = function (modal) {
    try {
      // 포커스 가능한 요소들 찾기
      const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      // 첫 번째 요소에 포커스
      firstElement.focus();

      // Tab 키 트랩 이벤트 핸들러
      const trapFocus = (event) => {
        if (event.key === "Tab") {
          if (event.shiftKey) {
            // Shift + Tab
            if (document.activeElement === firstElement) {
              event.preventDefault();
              lastElement.focus();
            }
          } else {
            // Tab
            if (document.activeElement === lastElement) {
              event.preventDefault();
              firstElement.focus();
            }
          }
        }
      };

      modal.addEventListener("keydown", trapFocus);
    } catch (error) {
      console.warn("[PropertyManagement] Failed to setup focus trap:", error);
    }
  };

  // 모든 모달 닫기
  PropertyManagement.prototype.closeAllModals = function () {
    console.log("[PropertyManagement] Closing all modals");

    const activeModals = Array.from(PropertyManagement.modalState.activeModals);
    let closedCount = 0;

    activeModals.forEach((modalId) => {
      if (this.closeModal(modalId)) {
        closedCount++;
      }
    });

    console.log(`[PropertyManagement] Closed ${closedCount} modals`);
    return closedCount;
  };

  // 활성 모달 확인
  PropertyManagement.prototype.isModalActive = function (modalId) {
    return PropertyManagement.modalState.activeModals.has(modalId);
  };

  // 활성 모달 목록 반환
  PropertyManagement.prototype.getActiveModals = function () {
    return Array.from(PropertyManagement.modalState.activeModals);
  };

  // 최상위 모달 반환
  PropertyManagement.prototype.getTopModal = function () {
    const stack = PropertyManagement.modalState.modalStack;
    return stack.length > 0 ? stack[stack.length - 1] : null;
  };

  // 모달 상태 초기화 (디버깅용)
  PropertyManagement.prototype.resetModalState = function () {
    console.log("[PropertyManagement] Resetting modal state");

    // 모든 모달 닫기
    this.closeAllModals();

    // 상태 초기화
    PropertyManagement.modalState.activeModals.clear();
    PropertyManagement.modalState.modalStack = [];
    PropertyManagement.modalState.eventListeners.clear();

    // body 스크롤 복원
    document.body.style.overflow = "";

    console.log("[PropertyManagement] Modal state reset complete");
  };

  // 탭 전환 메서드
  PropertyManagement.prototype.switchTab = async function (tabName) {
    console.log(`[PropertyManagement] Switching to tab: ${tabName}`);

    try {
      // 유효한 탭 이름인지 확인
      const validTabs = ["ownership", "sales"];
      if (!validTabs.includes(tabName)) {
        console.error("[PropertyManagement] Invalid tab name:", tabName);
        return false;
      }

      // 현재 탭 업데이트
      this.currentTab = tabName;

      // 탭 버튼 스타일 업데이트
      this.updateTabStyles(tabName);

      // 콘텐츠 표시/숨김
      this.updateTabContent(tabName);

      // 탭에 따라 데이터 로드
      if (tabName === "sales") {
        if (this.mySalesProperties.length === 0) {
          // 판매 매물 데이터가 없으면 로드
          console.log("[PropertyManagement] Loading sales properties");
          await this.loadMySalesProperties();
        } else {
          // 이미 데이터가 있으면 필터 탭 스타일만 업데이트
          this.updateSalesFilterTabs();
        }
      }

      console.log("[PropertyManagement] Tab switched successfully");
      return true;
    } catch (error) {
      console.error("[PropertyManagement] Error switching tab:", error);
      this.showError("탭 전환 중 오류가 발생했습니다.");
      return false;
    }
  };

  // 탭 스타일 업데이트 메서드
  PropertyManagement.prototype.updateTabStyles = function (activeTab) {
    try {
      const ownershipTab = document.getElementById("ownership-tab");
      const salesTab = document.getElementById("sales-tab");

      if (!ownershipTab || !salesTab) {
        console.warn("[PropertyManagement] Tab buttons not found");
        return;
      }

      // 기본 스타일 (비활성)
      const inactiveClass =
        "flex-1 px-4 py-2 text-center border-b-2 border-transparent text-gray-500 hover:text-gray-700";
      // 활성 스타일
      const activeClass =
        "flex-1 px-4 py-2 text-center border-b-2 border-blue-500 text-blue-600 font-medium";

      if (activeTab === "ownership") {
        ownershipTab.className = activeClass;
        salesTab.className = inactiveClass;
      } else {
        ownershipTab.className = inactiveClass;
        salesTab.className = activeClass;
      }

      console.log("[PropertyManagement] Tab styles updated");
    } catch (error) {
      console.error("[PropertyManagement] Error updating tab styles:", error);
    }
  };

  // 탭 콘텐츠 업데이트 메서드
  PropertyManagement.prototype.updateTabContent = function (activeTab) {
    try {
      const ownershipContent = document.getElementById("ownership-content");
      const salesContent = document.getElementById("sales-content");

      if (!ownershipContent || !salesContent) {
        console.warn("[PropertyManagement] Tab content containers not found");
        return;
      }

      if (activeTab === "ownership") {
        ownershipContent.style.display = "block";
        salesContent.style.display = "none";
      } else {
        ownershipContent.style.display = "none";
        salesContent.style.display = "block";
      }

      console.log("[PropertyManagement] Tab content updated");
    } catch (error) {
      console.error("[PropertyManagement] Error updating tab content:", error);
    }
  };

  console.log("[PropertyManagement Part 2] Modal management methods loaded");
})();
