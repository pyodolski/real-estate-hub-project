// 내 매물 관리 JavaScript 모듈 - Part 3
// 판매 등록 관련 메서드들을 PropertyManagement 클래스에 확장

(function () {
  // PropertyManagement 클래스가 이미 정의되어 있는지 확인
  if (typeof window.PropertyManagement === "undefined") {
    console.error(
      "[Part 3] PropertyManagement class not found. Load part-1.js first."
    );
    return;
  }

  // 판매 등록 상태 관리를 위한 정적 속성 초기화
  if (!PropertyManagement.saleRegistrationState) {
    PropertyManagement.saleRegistrationState = {
      currentClaimId: null,
      currentTransactionType: "SALE",
      isVisible: false,
      brokerList: [],
      isEditMode: false,
      editingOfferId: null,
    };
  }

  // 판매 등록 시작 메서드
  PropertyManagement.prototype.registerForSale = async function (claimId) {
    console.log(
      `[PropertyManagement] Starting sale registration for claim: ${claimId}`
    );

    try {
      // 함수 존재 확인
      if (typeof this.showSaleRegistrationPanel !== "function") {
        console.error(
          "[PropertyManagement] showSaleRegistrationPanel method not found"
        );
        this.showError(
          "판매 등록 기능을 사용할 수 없습니다. 페이지를 새로고침해주세요."
        );
        return false;
      }

      // claimId 유효성 검사
      if (!claimId || isNaN(claimId)) {
        console.error("[PropertyManagement] Invalid claimId:", claimId);
        this.showError("잘못된 매물 정보입니다.");
        return false;
      }

      // 해당 매물 정보 찾기
      const property = this.myProperties.find((p) => p.claimId === claimId);
      if (!property) {
        console.error(
          "[PropertyManagement] Property not found for claimId:",
          claimId
        );
        this.showError("매물 정보를 찾을 수 없습니다.");
        return false;
      }

      // 승인된 매물인지 확인
      if (property.status !== "APPROVED") {
        console.warn(
          "[PropertyManagement] Property not approved for sale:",
          property.status
        );
        this.showError("승인된 매물만 판매 등록할 수 있습니다.");
        return false;
      }

      // 판매 등록 패널 표시 (비동기)
      return await this.showSaleRegistrationPanel(claimId);
    } catch (error) {
      console.error("[PropertyManagement] Error in registerForSale:", error);
      this.showError("판매 등록 중 오류가 발생했습니다.");
      return false;
    }
  };

  // 판매 등록 패널 표시 메서드
  PropertyManagement.prototype.showSaleRegistrationPanel = async function (
    claimId
  ) {
    console.log(
      `[PropertyManagement] Showing sale registration panel for claim: ${claimId}`
    );

    try {
      // DOM 요소 존재 확인
      const myPropertyPanel = document.getElementById("my-property-panel");
      if (!myPropertyPanel) {
        console.error(
          "[PropertyManagement] my-property-panel element not found"
        );
        this.showError(
          "매물 관리 패널을 찾을 수 없습니다. 페이지를 새로고침해주세요."
        );
        return false;
      }

      let salePanel = document.getElementById("sale-registration-panel");

      // 패널이 없으면 SaleRegistrationPanel을 통해 생성
      if (!salePanel) {
        console.log(
          "[PropertyManagement] Sale panel not found, attempting to initialize"
        );

        if (typeof window.SaleRegistrationPanel === "undefined") {
          console.error(
            "[PropertyManagement] SaleRegistrationPanel not loaded"
          );
          this.showError(
            "판매 등록 기능을 불러올 수 없습니다. 페이지를 새로고침해주세요."
          );
          return false;
        }

        // 재시도 메커니즘을 사용하여 초기화
        if (typeof window.SaleRegistrationPanel.initWithRetry === "function") {
          console.log(
            "[PropertyManagement] Initializing SaleRegistrationPanel with retry"
          );
          const initSuccess = await window.SaleRegistrationPanel.initWithRetry(
            3,
            500
          );

          if (!initSuccess) {
            console.error(
              "[PropertyManagement] Failed to initialize SaleRegistrationPanel"
            );
            this.showError(
              "판매 등록 패널을 초기화할 수 없습니다. 페이지를 새로고침해주세요."
            );
            return false;
          }
        } else if (typeof window.SaleRegistrationPanel.init === "function") {
          // 구버전 호환성: 일반 init 메서드 사용
          console.log(
            "[PropertyManagement] Initializing SaleRegistrationPanel (legacy)"
          );
          const initSuccess = window.SaleRegistrationPanel.init();

          if (!initSuccess) {
            console.error(
              "[PropertyManagement] Failed to initialize SaleRegistrationPanel"
            );
            this.showError("판매 등록 패널을 초기화할 수 없습니다.");
            return false;
          }
        }

        // 초기화 후 패널 다시 확인
        salePanel = document.getElementById("sale-registration-panel");

        if (!salePanel) {
          console.error(
            "[PropertyManagement] Failed to create sale registration panel after initialization"
          );
          this.showError("판매 등록 패널을 생성할 수 없습니다.");
          return false;
        }
      }

      // 상태 업데이트
      PropertyManagement.saleRegistrationState.currentClaimId = claimId;
      PropertyManagement.saleRegistrationState.isVisible = true;

      // 패널 표시 - 자연스러운 애니메이션
      salePanel.style.display = "block";

      // 약간의 지연을 주어 display: block이 적용된 후 애니메이션 시작
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          salePanel.classList.remove("translate-x-full");
          salePanel.classList.add("translate-x-0");
        });
      });

      // 매물 정보로 폼 초기화
      this.initializeSaleForm(claimId);

      // 중개인 목록 로드
      this.loadBrokerList();

      console.log(
        "[PropertyManagement] Sale registration panel shown successfully"
      );
      return true;
    } catch (error) {
      console.error(
        "[PropertyManagement] Error showing sale registration panel:",
        error
      );
      this.showError("판매 등록 패널을 표시하는 중 오류가 발생했습니다.");
      return false;
    }
  };

  // 판매 등록 패널 숨기기 메서드
  PropertyManagement.prototype.hideSaleRegistrationPanel = function () {
    console.log("[PropertyManagement] Hiding sale registration panel");

    try {
      const salePanel = document.getElementById("sale-registration-panel");
      if (!salePanel) {
        console.warn("[PropertyManagement] Sale registration panel not found");
        return false;
      }

      // 패널 숨기기 애니메이션 - 자연스럽게
      salePanel.classList.remove("translate-x-0");
      salePanel.classList.add("translate-x-full");

      // 애니메이션 완료 후 display none (transition duration과 일치)
      setTimeout(() => {
        salePanel.style.display = "none";

        // 상태 초기화
        PropertyManagement.saleRegistrationState.currentClaimId = null;
        PropertyManagement.saleRegistrationState.isVisible = false;
        PropertyManagement.saleRegistrationState.isEditMode = false;
        PropertyManagement.saleRegistrationState.editingOfferId = null;

        // 폼 초기화
        this.resetSaleForm();

        // 중개인 선택 다시 활성화
        const brokerSelect = document.getElementById("brokerSelect");
        if (brokerSelect) {
          brokerSelect.disabled = false;
        }

        // 제출 버튼 텍스트 복원
        const submitButton = document.querySelector(
          "#sale-registration-form button[type='submit']"
        );
        if (submitButton) {
          submitButton.textContent = "등록 요청";
        }
      }, 300); // CSS transition-duration과 일치

      console.log(
        "[PropertyManagement] Sale registration panel hidden successfully"
      );
      return true;
    } catch (error) {
      console.error(
        "[PropertyManagement] Error hiding sale registration panel:",
        error
      );
      return false;
    }
  };

  // 거래 유형 전환 메서드
  PropertyManagement.prototype.switchTransactionType = function (type) {
    console.log(`[PropertyManagement] Switching transaction type to: ${type}`);

    try {
      // 유효한 거래 유형인지 확인
      const validTypes = ["SALE", "JEONSE", "WOLSE"];
      if (!validTypes.includes(type)) {
        console.error("[PropertyManagement] Invalid transaction type:", type);
        return false;
      }

      // 상태 업데이트
      PropertyManagement.saleRegistrationState.currentTransactionType = type;

      // 탭 스타일 업데이트
      this.updateTransactionTypeTabs(type);

      // 가격 입력 필드 표시/숨기기
      this.updatePriceFields(type);

      console.log(
        "[PropertyManagement] Transaction type switched successfully"
      );
      return true;
    } catch (error) {
      console.error(
        "[PropertyManagement] Error switching transaction type:",
        error
      );
      return false;
    }
  };

  // 판매 요청 제출 메서드
  PropertyManagement.prototype.submitSaleRequest = async function () {
    console.log("[PropertyManagement] Submitting sale request");

    try {
      // 수정 모드인지 확인
      const isEditMode =
        PropertyManagement.saleRegistrationState.isEditMode || false;
      const editingOfferId =
        PropertyManagement.saleRegistrationState.editingOfferId;

      if (isEditMode && !editingOfferId) {
        this.showError("수정할 매물 정보가 없습니다.");
        return false;
      }

      if (!isEditMode) {
        const claimId = PropertyManagement.saleRegistrationState.currentClaimId;
        if (!claimId) {
          this.showError("매물 정보가 없습니다.");
          return false;
        }
      }

      // 폼 데이터 수집 및 검증
      const formData = this.collectSaleFormData();
      if (!formData) {
        return false; // 오류는 collectSaleFormData에서 처리
      }

      // 수정 모드면 업데이트, 아니면 신규 등록
      if (isEditMode) {
        await this.updateSaleOffer(editingOfferId, formData);
      } else {
        const claimId = PropertyManagement.saleRegistrationState.currentClaimId;
        await this.sendSaleRegistrationRequest(claimId, formData);
      }
    } catch (error) {
      console.error(
        "[PropertyManagement] Error submitting sale request:",
        error
      );
      this.showError("판매 등록 요청 중 오류가 발생했습니다.");
      return false;
    }
  };

  // 판매 폼 초기화 메서드
  PropertyManagement.prototype.initializeSaleForm = function (claimId) {
    try {
      const property = this.myProperties.find((p) => p.claimId === claimId);
      if (!property) {
        console.warn(
          "[PropertyManagement] Property not found for form initialization"
        );
        return;
      }

      // 기본값 설정
      const today = new Date().toISOString().split("T")[0];
      const availableFromInput = document.getElementById("availableFrom");
      if (availableFromInput) {
        availableFromInput.value = today;
      }

      // 거래 유형 초기화
      this.switchTransactionType("SALE");

      console.log("[PropertyManagement] Sale form initialized");
    } catch (error) {
      console.error(
        "[PropertyManagement] Error initializing sale form:",
        error
      );
    }
  };

  // 판매 폼 리셋 메서드
  PropertyManagement.prototype.resetSaleForm = function () {
    try {
      const form = document.getElementById("sale-registration-form");
      if (form) {
        form.reset();
      }

      // 체크박스 초기화
      const checkboxes = document.querySelectorAll(".option-checkbox");
      checkboxes.forEach((checkbox) => {
        checkbox.checked = false;
      });

      // 기본 상태로 복원
      this.switchTransactionType("SALE");

      console.log("[PropertyManagement] Sale form reset");
    } catch (error) {
      console.error("[PropertyManagement] Error resetting sale form:", error);
    }
  };

  // 거래 유형 탭 업데이트 메서드
  PropertyManagement.prototype.updateTransactionTypeTabs = function (
    activeType
  ) {
    try {
      const tabs = ["sale-tab", "jeonse-tab", "wolse-tab"];
      const types = ["SALE", "JEONSE", "WOLSE"];

      tabs.forEach((tabId, index) => {
        const tab = document.getElementById(tabId);
        if (tab) {
          if (types[index] === activeType) {
            tab.className =
              "flex-1 px-4 py-2 text-center border-b-2 border-blue-500 text-blue-600 font-medium";
          } else {
            tab.className =
              "flex-1 px-4 py-2 text-center border-b-2 border-transparent text-gray-500 hover:text-gray-700";
          }
        }
      });
    } catch (error) {
      console.error(
        "[PropertyManagement] Error updating transaction type tabs:",
        error
      );
    }
  };

  // 가격 필드 업데이트 메서드
  PropertyManagement.prototype.updatePriceFields = function (type) {
    try {
      const salePrice = document.getElementById("sale-price");
      const jeonseWolsePrice = document.getElementById("jeonse-wolse-price");
      const monthlyRentSection = document.getElementById(
        "monthly-rent-section"
      );

      if (type === "SALE") {
        if (salePrice) salePrice.style.display = "block";
        if (jeonseWolsePrice) jeonseWolsePrice.style.display = "none";
      } else {
        if (salePrice) salePrice.style.display = "none";
        if (jeonseWolsePrice) jeonseWolsePrice.style.display = "block";

        if (monthlyRentSection) {
          monthlyRentSection.style.display =
            type === "WOLSE" ? "block" : "none";
        }
      }
    } catch (error) {
      console.error("[PropertyManagement] Error updating price fields:", error);
    }
  };

  // 폼 데이터 수집 메서드
  PropertyManagement.prototype.collectSaleFormData = function () {
    try {
      const transactionType =
        PropertyManagement.saleRegistrationState.currentTransactionType;

      // 기본 필드 수집
      const housetype = document.getElementById("housetype")?.value;
      const floor = document.getElementById("floor")?.value;
      const maintenanceFee =
        document.getElementById("maintenanceFee")?.value || "0";
      const availableFrom = document.getElementById("availableFrom")?.value;
      const negotiable =
        document.getElementById("negotiable")?.checked || false;
      const isActive = document.getElementById("isActive")?.checked || false;
      const brokerId = document.getElementById("brokerSelect")?.value;

      // 필수 필드 검증
      if (!housetype || !floor || !availableFrom || !brokerId) {
        this.showError("모든 필수 항목을 입력해주세요.");
        return null;
      }

      // 가격 정보 수집
      let prices = {};
      if (transactionType === "SALE") {
        const totalPrice = document.getElementById("totalPrice")?.value;
        if (!totalPrice) {
          this.showError("총 가격을 입력해주세요.");
          return null;
        }
        prices.totalPrice = parseInt(totalPrice);
      } else {
        const deposit = document.getElementById("deposit")?.value;
        if (!deposit) {
          this.showError("보증금을 입력해주세요.");
          return null;
        }
        prices.deposit = parseInt(deposit);

        if (transactionType === "WOLSE") {
          const monthlyRent = document.getElementById("monthlyRent")?.value;
          if (!monthlyRent) {
            this.showError("월세를 입력해주세요.");
            return null;
          }
          prices.monthlyRent = parseInt(monthlyRent);
        }
      }

      // 옵션 수집
      const options = [];
      const checkboxes = document.querySelectorAll(".option-checkbox");
      checkboxes.forEach((checkbox) => {
        options.push(checkbox.checked);
      });

      return {
        transactionType,
        housetype,
        floor: parseInt(floor),
        prices,
        maintenanceFee: parseFloat(maintenanceFee),
        options,
        availableFrom,
        negotiable,
        isActive,
        brokerId: parseInt(brokerId),
      };
    } catch (error) {
      console.error("[PropertyManagement] Error collecting form data:", error);
      this.showError("폼 데이터 수집 중 오류가 발생했습니다.");
      return null;
    }
  };

  // 중개인 목록 로드 메서드
  PropertyManagement.prototype.loadBrokerList = async function () {
    console.log("[PropertyManagement] Loading broker list");

    try {
      const response = await fetch("/api/brokers/list", {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const brokers = await response.json();
        console.log("[PropertyManagement] Loaded brokers:", brokers);

        const brokerSelect = document.getElementById("brokerSelect");
        if (brokerSelect) {
          // 기본 옵션
          brokerSelect.innerHTML =
            '<option value="">중개인을 선택하세요</option>';

          // 중개인 목록 추가
          brokers.forEach((broker) => {
            const option = document.createElement("option");
            option.value = broker.userId;
            option.textContent = `${broker.username} - ${
              broker.agencyName || "중개사무소"
            }`;
            brokerSelect.appendChild(option);
          });

          console.log(`[PropertyManagement] Loaded ${brokers.length} brokers`);
        }
      } else {
        console.error(
          "[PropertyManagement] Failed to load brokers:",
          response.status
        );
        // 에러가 나도 기본 옵션은 표시
        const brokerSelect = document.getElementById("brokerSelect");
        if (brokerSelect) {
          brokerSelect.innerHTML =
            '<option value="">중개인을 선택하세요</option>';
        }
      }
    } catch (error) {
      console.error("[PropertyManagement] Error loading broker list:", error);
      // 에러가 나도 기본 옵션은 표시
      const brokerSelect = document.getElementById("brokerSelect");
      if (brokerSelect) {
        brokerSelect.innerHTML =
          '<option value="">중개인을 선택하세요</option>';
      }
    }
  };

  // 판매 매물 업데이트 메서드
  PropertyManagement.prototype.updateSaleOffer = async function (
    offerId,
    formData
  ) {
    console.log("[PropertyManagement] Updating sale offer", {
      offerId,
      formData,
    });

    try {
      // 업데이트 요청 데이터 구성
      const updateRequest = {
        housetype: formData.housetype,
        type: formData.transactionType,
        floor: formData.floor,
        oftion: this.convertOptionsToString(formData.options),
        totalPrice: formData.prices.totalPrice || null,
        deposit: formData.prices.deposit || null,
        monthlyRent: formData.prices.monthlyRent || null,
        maintenanceFee: formData.maintenanceFee,
        negotiable: formData.negotiable,
        availableFrom: formData.availableFrom,
        isActive: formData.isActive,
      };

      const response = await fetch(`/api/offers/${offerId}`, {
        method: "PUT",
        headers: {
          ...AuthUtils.getAuthHeader(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateRequest),
      });

      if (response.ok) {
        const updatedOffer = await response.json();
        console.log(
          "[PropertyManagement] Offer updated successfully:",
          updatedOffer
        );

        this.showSuccess("판매 매물이 수정되었습니다.");
        this.hideSaleRegistrationPanel();

        // 판매 매물 목록 새로고침
        await this.loadMySalesProperties();
      } else if (response.status === 401) {
        this.handleAuthError();
      } else {
        const errorText = await response.text();
        console.error(
          "[PropertyManagement] Failed to update offer:",
          errorText
        );
        throw new Error("판매 매물 수정에 실패했습니다.");
      }
    } catch (error) {
      console.error("[PropertyManagement] Error updating offer:", error);
      this.showError(`판매 매물 수정에 실패했습니다: ${error.message}`);
    }
  };

  // 판매 등록 요청 전송 메서드
  PropertyManagement.prototype.sendSaleRegistrationRequest = async function (
    claimId,
    formData
  ) {
    console.log("[PropertyManagement] Sending sale registration request", {
      claimId,
      formData,
    });

    try {
      // claimId로부터 property 정보 찾기
      const property = this.myProperties.find((p) => p.claimId === claimId);
      if (!property || !property.propertyId) {
        this.showError("매물 정보를 찾을 수 없습니다.");
        return false;
      }

      const propertyId = property.propertyId;

      // API 요청 데이터 구성
      const requestBody = {
        brokerUserId: formData.brokerId,
        offer: {
          housetype: formData.housetype,
          type: formData.transactionType,
          floor: formData.floor,
          option: this.convertOptionsToString(formData.options),
          totalPrice: formData.prices.totalPrice || null,
          deposit: formData.prices.deposit || null,
          monthlyRent: formData.prices.monthlyRent || null,
          maintenanceFee: formData.maintenanceFee,
          negotiable: formData.negotiable,
          availableFrom: formData.availableFrom,
          isActive: formData.isActive,
        },
      };

      console.log("[PropertyManagement] Request body:", requestBody);

      // API 호출
      const response = await fetch(
        `/api/properties/${propertyId}/delegations`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log("[PropertyManagement] Sale registration success:", result);
        this.showSuccess(
          "판매 매물 등록 요청이 완료되었습니다. 중개인 승인 후 매물이 공개됩니다."
        );
        this.hideSaleRegistrationPanel();

        // 목록 새로고침
        await this.loadMyProperties();
        return true;
      } else {
        const errorText = await response.text();
        console.error(
          "[PropertyManagement] Sale registration failed:",
          errorText
        );

        let errorMessage = "등록에 실패했습니다.";
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorMessage;
        } catch (e) {
          errorMessage = errorText || errorMessage;
        }

        this.showError(`판매 등록 요청 실패: ${errorMessage}`);
        return false;
      }
    } catch (error) {
      console.error("[PropertyManagement] Error sending sale request:", error);
      this.showError("판매 등록 요청 중 오류가 발생했습니다: " + error.message);
      return false;
    }
  };

  // 옵션 배열을 문자열로 변환 (bit string)
  PropertyManagement.prototype.convertOptionsToString = function (options) {
    if (!Array.isArray(options)) return "0000000000";
    return options.map((opt) => (opt ? "1" : "0")).join("");
  };

  // DOM 요소 존재 확인 유틸리티 메서드
  PropertyManagement.prototype.checkElementExists = function (elementId) {
    const element = document.getElementById(elementId);
    const exists = element !== null;

    if (!exists) {
      console.warn(`[PropertyManagement] Element not found: ${elementId}`);
    }

    return exists;
  };

  // 필수 의존성 확인 메서드
  PropertyManagement.prototype.checkDependencies = function () {
    const dependencies = {
      myPropertyPanel: this.checkElementExists("my-property-panel"),
      saleRegistrationPanel:
        typeof window.SaleRegistrationPanel !== "undefined",
    };

    const allPresent = Object.values(dependencies).every((dep) => dep === true);

    if (!allPresent) {
      console.warn("[PropertyManagement] Missing dependencies:", dependencies);
    }

    return dependencies;
  };

  // 사용자 친화적 오류 메시지 표시 메서드 (향상된 버전)
  PropertyManagement.prototype.showUserFriendlyError = function (
    errorType,
    technicalDetails = null
  ) {
    const ERROR_MESSAGES = {
      FUNCTION_NOT_FOUND:
        "기능을 실행할 수 없습니다. 페이지를 새로고침해주세요.",
      ELEMENT_NOT_FOUND:
        "화면 요소를 찾을 수 없습니다. 잠시 후 다시 시도해주세요.",
      NETWORK_ERROR: "서버와의 연결에 문제가 있습니다.",
      VALIDATION_ERROR: "입력 정보를 확인해주세요.",
      INITIALIZATION_ERROR:
        "초기화 중 문제가 발생했습니다. 페이지를 새로고침해주세요.",
      PANEL_NOT_READY: "패널이 준비되지 않았습니다. 잠시 후 다시 시도해주세요.",
    };

    const message =
      ERROR_MESSAGES[errorType] || "알 수 없는 오류가 발생했습니다.";

    // 기술적 세부사항은 콘솔에만 로깅
    if (technicalDetails) {
      console.error(`[PropertyManagement] ${errorType}:`, technicalDetails);
    }

    // 사용자에게는 친화적인 메시지만 표시
    this.showError(message);
  };

  // 디버깅 정보 출력 메서드
  PropertyManagement.prototype.debugInfo = function () {
    console.group("[PropertyManagement] Debug Information");
    console.log("Modal State:", PropertyManagement.modalState);
    console.log(
      "Sale Registration State:",
      PropertyManagement.saleRegistrationState
    );
    console.log("Dependencies:", this.checkDependencies());
    console.log("My Properties Count:", this.myProperties?.length || 0);
    console.log(
      "Filtered Properties Count:",
      this.filteredProperties?.length || 0
    );
    console.groupEnd();
  };

  console.log("[PropertyManagement Part 3] Sale registration methods loaded");
})();
