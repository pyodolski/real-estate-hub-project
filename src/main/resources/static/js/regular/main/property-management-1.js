// 내 매물 관리 JavaScript 모듈 - Part 1
// 클래스 정의, 기본 CRUD, 필터링, 렌더링, 신규 등록 모달

(function () {
  // 중복 선언 방지
  if (typeof window.PropertyManagement !== "undefined") {
    console.warn(
      "PropertyManagement class already exists. Skipping redefinition."
    );
    return;
  }

  class PropertyManagement {
    constructor() {
      this.apiBaseUrl = "/api/ownership";
      this.mapApiBaseUrl = "/api/ownership/map";
      this.accessToken = localStorage.getItem("accessToken");
      this.myProperties = [];
      this.filteredProperties = [];
      this.currentStatusFilter = "ALL";
      this.currentTypeFilter = "ALL";
      this.currentUser = null;

      // 탭 관리 속성
      this.currentTab = "ownership"; // "ownership" | "sales"
      this.mySalesProperties = [];
      this.filteredSalesProperties = [];
      this.currentSalesTransactionFilter = "ALL"; // "ALL" | "SALE" | "JEONSE" | "WOLSE"
      this.currentSalesActiveFilter = "ALL"; // "ALL" | "ACTIVE" | "INACTIVE"

      this.init();
    }

    async init() {
      await this.loadCurrentUser();
      await this.loadMyProperties();
      this.setupEventListeners();
    }

    // 판매 매물 목록 로드
    async loadMySalesProperties() {
      console.log("[PropertyManagement] Loading my sales properties");

      try {
        // 로딩 상태 표시
        this.showSalesLoadingState();

        const response = await fetch("/api/delegations/mine", {
          headers: {
            ...AuthUtils.getAuthHeader(),
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const salesData = await response.json();
          console.log(
            `[PropertyManagement] Loaded ${salesData.length} sales properties`
          );

          // DelegationResponse 데이터 파싱 및 저장
          this.mySalesProperties = this.parseSalesPropertiesData(salesData);
          this.filteredSalesProperties = [...this.mySalesProperties];

          console.log(
            `[PropertyManagement] Parsed ${this.mySalesProperties.length} sales properties`
          );

          // 필터 탭 스타일 업데이트
          this.updateSalesFilterTabs();

          // 렌더링
          this.renderSalesProperties();
        } else if (response.status === 401) {
          // 인증 오류 처리
          console.error(
            "[PropertyManagement] Authentication error loading sales properties"
          );
          this.handleAuthError();
        } else {
          const errorText = await response.text();
          console.error(
            "[PropertyManagement] Failed to load sales properties:",
            errorText
          );
          throw new Error(
            `판매 매물 목록을 불러올 수 없습니다. (${response.status})`
          );
        }
      } catch (error) {
        console.error("판매 매물 목록 로드 실패:", error);
        this.showError(`판매 매물 목록을 불러올 수 없습니다: ${error.message}`);
        this.showSalesEmptyState("오류가 발생했습니다. 다시 시도해주세요.");
      }
    }

    // 판매 매물 데이터 파싱
    parseSalesPropertiesData(salesData) {
      if (!Array.isArray(salesData)) {
        console.warn(
          "[PropertyManagement] Sales data is not an array:",
          salesData
        );
        return [];
      }

      return salesData.map((delegation) => {
        try {
          // 기본 delegation 정보
          const parsed = {
            id: delegation.id,
            propertyId: delegation.propertyId,
            propertyTitle: delegation.propertyTitle || "제목 없음",
            propertyAddress: delegation.propertyAddress || "주소 정보 없음",
            ownerUserId: delegation.ownerUserId,
            ownerName: delegation.ownerName || "소유자",
            brokerUserId: delegation.brokerUserId,
            brokerName: delegation.brokerName || "중개인",
            status: delegation.status || "PENDING",
            rejectionReason: delegation.rejectionReason || null,
            createdAt: delegation.createdAt,
            updatedAt: delegation.updatedAt,
            locationX: delegation.locationX,
            locationY: delegation.locationY,
          };

          // Offer 정보 추출 및 가공
          if (delegation.offer) {
            const offer = delegation.offer;

            parsed.offer = {
              id: offer.id,
              type: offer.type || "SALE",
              housetype: offer.housetype || "APART",
              floor: offer.floor || 0,
              totalPrice: offer.totalPrice || null,
              deposit: offer.deposit || null,
              monthlyRent: offer.monthlyRent || null,
              maintenanceFee: offer.maintenanceFee || 0,
              options: Array.isArray(offer.options)
                ? offer.options
                : new Array(10).fill(false),
              availableFrom: offer.availableFrom || "",
              negotiable: offer.negotiable || false,
              isActive: offer.isActive !== undefined ? offer.isActive : true,
            };

            // 가격 정보를 읽기 쉬운 형식으로 변환
            parsed.priceDisplay = this.formatSalesPrice(parsed.offer);
          } else {
            // offer가 없는 경우 기본값
            parsed.offer = null;
            parsed.priceDisplay = "가격 정보 없음";
          }

          return parsed;
        } catch (error) {
          console.error(
            "[PropertyManagement] Error parsing delegation:",
            delegation,
            error
          );
          // 파싱 실패 시에도 기본 정보는 반환
          return {
            id: delegation.id || 0,
            propertyTitle: "파싱 오류",
            propertyAddress: "주소 정보 없음",
            status: "UNKNOWN",
            offer: null,
            priceDisplay: "정보 없음",
          };
        }
      });
    }

    // 판매 가격 포맷팅
    formatSalesPrice(offer) {
      if (!offer) return "가격 정보 없음";

      try {
        const formatPrice = (price) => {
          if (!price) return "0";
          const eok = Math.floor(price / 10000);
          const man = price % 10000;
          if (eok > 0 && man > 0) {
            return `${eok}억 ${man}만원`;
          } else if (eok > 0) {
            return `${eok}억원`;
          } else {
            return `${man}만원`;
          }
        };

        switch (offer.type) {
          case "SALE":
            return `매매 ${formatPrice(offer.totalPrice)}`;
          case "JEONSE":
            return `전세 ${formatPrice(offer.deposit)}`;
          case "WOLSE":
            return `월세 ${formatPrice(offer.deposit)}/${
              offer.monthlyRent || 0
            }만원`;
          default:
            return "가격 정보 없음";
        }
      } catch (error) {
        console.error("[PropertyManagement] Error formatting price:", error);
        return "가격 정보 없음";
      }
    }

    // 판매 매물 로딩 상태 표시
    showSalesLoadingState() {
      const salesList = document.getElementById("sales-property-list");
      if (!salesList) {
        console.warn(
          "[PropertyManagement] sales-property-list element not found"
        );
        return;
      }

      salesList.innerHTML = `
        <div class="flex items-center justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span class="ml-3 text-gray-600">판매 매물 목록을 불러오는 중...</span>
        </div>
      `;
    }

    // 판매 매물 빈 상태 표시
    showSalesEmptyState(message = "등록된 판매 매물이 없습니다.") {
      const salesList = document.getElementById("sales-property-list");
      if (!salesList) {
        console.warn(
          "[PropertyManagement] sales-property-list element not found"
        );
        return;
      }

      salesList.innerHTML = `
        <div class="text-center py-8 text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
          </svg>
          <p class="text-sm">${message}</p>
          <p class="text-xs mt-1">승인된 매물을 판매 등록해보세요!</p>
        </div>
      `;
    }

    // 인증 오류 처리
    handleAuthError() {
      AuthUtils.removeToken();
      alert("로그인이 필요합니다. 로그인 페이지로 이동합니다.");
      window.location.href = "/loginO.html";
    }

    // 판매 매물 렌더링
    renderSalesProperties() {
      console.log(
        `[PropertyManagement] Rendering ${this.filteredSalesProperties.length} sales properties`
      );

      const salesList = document.getElementById("sales-property-list");
      if (!salesList) {
        console.warn(
          "[PropertyManagement] sales-property-list element not found"
        );
        return;
      }

      // 빈 상태 처리
      if (this.filteredSalesProperties.length === 0) {
        const hasFilters =
          this.currentSalesTransactionFilter !== "ALL" ||
          this.currentSalesActiveFilter !== "ALL";

        if (hasFilters) {
          this.showSalesEmptyState("필터 조건에 맞는 판매 매물이 없습니다.");
        } else if (this.mySalesProperties.length === 0) {
          this.showSalesEmptyState("등록된 판매 매물이 없습니다.");
        } else {
          this.showSalesEmptyState("필터 조건에 맞는 판매 매물이 없습니다.");
        }
        return;
      }

      // 판매 매물 목록 렌더링
      salesList.innerHTML = "";

      // DocumentFragment를 사용하여 성능 최적화
      const fragment = document.createDocumentFragment();

      this.filteredSalesProperties.forEach((property) => {
        const card = this.createSalesPropertyCard(property);
        fragment.appendChild(card);
      });

      salesList.appendChild(fragment);

      console.log(
        `[PropertyManagement] Rendered ${this.filteredSalesProperties.length} sales property cards`
      );
    }

    // 판매 매물 카드 생성
    createSalesPropertyCard(property) {
      const card = document.createElement("div");
      card.className =
        "bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer";
      
      // 카드 클릭 시 지도 이동
      card.addEventListener('click', (e) => {
        // 버튼 클릭은 제외 (이벤트 버블링 방지)
        if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
          return;
        }
        this.moveMapToSalesProperty(property);
      });

      // 활성 상태 정보
      const isActive = property.offer?.isActive !== false;
      const statusInfo = isActive
        ? {
            label: "활성",
            bgColor: "bg-green-100",
            textColor: "text-green-800",
          }
        : {
            label: "비활성",
            bgColor: "bg-gray-100",
            textColor: "text-gray-800",
          };

      // 거래 유형 표시
      const transactionTypeLabel =
        property.offer?.type === "SALE"
          ? "매매"
          : property.offer?.type === "JEONSE"
          ? "전세"
          : property.offer?.type === "WOLSE"
          ? "월세"
          : "알 수 없음";

      // 옵션 개수 계산
      const optionCount = property.offer?.options
        ? property.offer.options.filter((opt) => opt === true).length
        : 0;

      // 주택 유형 표시
      const housetypeLabel =
        property.offer?.housetype === "APART"
          ? "아파트"
          : property.offer?.housetype === "BILLA"
          ? "빌라"
          : property.offer?.housetype === "ONE"
          ? "원룸"
          : "기타";

      card.innerHTML = `
        <div class="flex justify-between items-start mb-3">
          <div class="flex-1">
            <h3 class="font-semibold text-gray-800 text-sm mb-1">${
              property.propertyTitle || "제목 없음"
            }</h3>
            <p class="text-xs text-gray-600 mb-2">${
              property.propertyAddress || "주소 정보 없음"
            }</p>
          </div>
          <span class="px-2 py-1 text-xs rounded-full ${statusInfo.bgColor} ${
        statusInfo.textColor
      }">
            ${statusInfo.label}
          </span>
        </div>

        <div class="space-y-2 mb-3">
          <div class="flex justify-between text-xs">
            <span class="text-gray-500">거래 유형:</span>
            <span class="text-gray-800 font-medium">${transactionTypeLabel}</span>
          </div>
          <div class="flex justify-between text-xs">
            <span class="text-gray-500">가격:</span>
            <span class="text-gray-800 font-medium">${
              property.priceDisplay || "가격 정보 없음"
            }</span>
          </div>
          <div class="flex justify-between text-xs">
            <span class="text-gray-500">주택 유형:</span>
            <span class="text-gray-800">${housetypeLabel} ${
        property.offer?.floor ? property.offer.floor + "층" : ""
      }</span>
          </div>
          <div class="flex justify-between text-xs">
            <span class="text-gray-500">중개인:</span>
            <span class="text-gray-800">${
              property.brokerName || "중개인 정보 없음"
            }</span>
          </div>
          <div class="flex justify-between text-xs">
            <span class="text-gray-500">옵션:</span>
            <span class="text-gray-800">${optionCount}개 포함</span>
          </div>
          ${
            property.offer?.negotiable
              ? `
          <div class="text-xs">
            <span class="px-2 py-1 bg-blue-50 text-blue-600 rounded">협상 가능</span>
          </div>
          `
              : ""
          }
        </div>

        <div class="flex gap-2 mb-2">
          <button onclick="propertyManagement.viewSalesPropertyDetail(${
            property.id
          })"
                  class="flex-1 px-3 py-2 text-xs bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors">
            상세보기
          </button>
          <button onclick="propertyManagement.editSalesProperty(${property.id})"
                  class="flex-1 px-3 py-2 text-xs bg-gray-50 text-gray-600 rounded-md hover:bg-gray-100 transition-colors">
            수정
          </button>
          <button onclick="propertyManagement.toggleSalesPropertyActive(${
            property.id
          })"
                  class="px-3 py-2 text-xs ${
                    isActive
                      ? "bg-yellow-50 text-yellow-600 hover:bg-yellow-100"
                      : "bg-green-50 text-green-600 hover:bg-green-100"
                  } rounded-md transition-colors">
            ${isActive ? "비활성화" : "활성화"}
          </button>
        </div>
        <div class="flex gap-2">
          <button onclick="propertyManagement.deleteSalesProperty(${
            property.id
          })"
                  class="flex-1 px-3 py-2 text-xs bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors">
            삭제
          </button>
        </div>
      `;

      return card;
    }

    // 판매 매물 삭제
    async deleteSalesProperty(delegationId) {
      console.log(
        `[PropertyManagement] deleteSalesProperty called for delegation: ${delegationId}`
      );

      try {
        // 해당 판매 매물 찾기
        const salesProperty = this.mySalesProperties.find(
          (p) => p.id === delegationId
        );

        if (!salesProperty || !salesProperty.offer) {
          this.showError("판매 매물 정보를 찾을 수 없습니다.");
          return;
        }

        const offerId = salesProperty.offer.id;

        // 거래 진행 중인지 확인
        if (salesProperty.status === "APPROVED") {
          this.showError(
            "승인된 판매 매물은 삭제할 수 없습니다. 먼저 위임을 취소해주세요."
          );
          return;
        }

        // 삭제 확인
        if (
          !confirm(
            "정말로 이 판매 매물을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다."
          )
        ) {
          return;
        }

        // API 호출
        const response = await fetch(`/api/offers/${offerId}`, {
          method: "DELETE",
          headers: {
            ...AuthUtils.getAuthHeader(),
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          console.log(`[PropertyManagement] Offer deleted successfully`);

          // 로컬 데이터에서 제거
          this.mySalesProperties = this.mySalesProperties.filter(
            (p) => p.id !== delegationId
          );
          this.filteredSalesProperties = this.filteredSalesProperties.filter(
            (p) => p.id !== delegationId
          );

          // UI 갱신
          this.renderSalesProperties();

          this.showSuccess("판매 매물이 삭제되었습니다.");
        } else if (response.status === 401) {
          this.handleAuthError();
        } else if (response.status === 409) {
          this.showError("거래 진행 중인 판매 매물은 삭제할 수 없습니다.");
        } else {
          const errorText = await response.text();
          console.error(
            `[PropertyManagement] Failed to delete offer:`,
            errorText
          );
          throw new Error("판매 매물 삭제에 실패했습니다.");
        }
      } catch (error) {
        console.error("판매 매물 삭제 실패:", error);
        this.showError(`판매 매물 삭제에 실패했습니다: ${error.message}`);
      }
    }

    // 판매 매물 상세보기
    viewSalesPropertyDetail(delegationId) {
      console.log(
        `[PropertyManagement] viewSalesPropertyDetail called for delegation: ${delegationId}`
      );

      try {
        // 해당 판매 매물 찾기
        const salesProperty = this.mySalesProperties.find(
          (p) => p.id === delegationId
        );

        if (!salesProperty) {
          this.showError("판매 매물 정보를 찾을 수 없습니다.");
          return;
        }

        // 상세보기 모달 생성 및 표시
        this.createAndShowDetailModal(salesProperty);
      } catch (error) {
        console.error("판매 매물 상세보기 실패:", error);
        this.showError(
          `판매 매물 상세보기 중 오류가 발생했습니다: ${error.message}`
        );
      }
    }

    // 상세보기 모달 생성
    createAndShowDetailModal(property) {
      console.log(
        "[PropertyManagement] Creating detail modal for property:",
        property
      );

      // 기존 모달이 있으면 제거
      const existingModal = document.getElementById("sales-detail-modal");
      if (existingModal) {
        existingModal.remove();
      }

      // 모달 생성
      const modal = document.createElement("div");
      modal.id = "sales-detail-modal";
      modal.className =
        "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";
      modal.style.display = "flex";

      // 모달 콘텐츠 생성
      modal.innerHTML = this.createDetailModalContent(property);

      // body에 추가
      document.body.appendChild(modal);

      // body 스크롤 방지
      document.body.style.overflow = "hidden";

      // 이벤트 리스너 등록
      this.setupDetailModalEventListeners(modal);

      console.log("[PropertyManagement] Detail modal created and shown");
    }

    // 상세보기 모달 콘텐츠 생성
    createDetailModalContent(property) {
      const offer = property.offer;

      // 활성 상태
      const isActive = offer?.isActive !== false;
      const statusBadge = isActive
        ? '<span class="px-3 py-1 text-sm rounded-full bg-green-100 text-green-800">활성</span>'
        : '<span class="px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-800">비활성</span>';

      // 거래 유형
      const transactionTypeLabel =
        offer?.type === "SALE"
          ? "매매"
          : offer?.type === "JEONSE"
          ? "전세"
          : offer?.type === "WOLSE"
          ? "월세"
          : "알 수 없음";

      // 주택 유형
      const housetypeLabel =
        offer?.housetype === "APART"
          ? "아파트"
          : offer?.housetype === "BILLA"
          ? "빌라"
          : offer?.housetype === "ONE"
          ? "원룸"
          : "기타";

      // 옵션 정보
      const optionLabels = [
        "에어컨",
        "냉장고",
        "세탁기",
        "가스레인지",
        "인덕션",
        "전자레인지",
        "책상",
        "침대",
        "옷장",
        "신발장",
      ];

      const optionsList = offer?.options
        ? offer.options
            .map((opt, index) => (opt ? optionLabels[index] : null))
            .filter((opt) => opt !== null)
        : [];

      // 위임 상태
      const delegationStatusLabel =
        property.status === "PENDING"
          ? "대기 중"
          : property.status === "APPROVED"
          ? "승인됨"
          : property.status === "REJECTED"
          ? "거절됨"
          : property.status === "CANCELLED"
          ? "취소됨"
          : "알 수 없음";

      const delegationStatusColor =
        property.status === "APPROVED"
          ? "text-green-600"
          : property.status === "REJECTED"
          ? "text-red-600"
          : property.status === "CANCELLED"
          ? "text-gray-600"
          : "text-yellow-600";

      return `
        <div class="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto m-4">
          <!-- 헤더 -->
          <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
            <h2 class="text-2xl font-bold text-gray-800">판매 매물 상세 정보</h2>
            <button onclick="propertyManagement.closeDetailModal()" 
                    class="text-gray-400 hover:text-gray-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- 콘텐츠 -->
          <div class="px-6 py-6 space-y-6">
            <!-- 기본 정보 섹션 -->
            <div class="bg-gray-50 rounded-lg p-4">
              <div class="flex justify-between items-start mb-4">
                <div class="flex-1">
                  <h3 class="text-xl font-semibold text-gray-800 mb-2">${
                    property.propertyTitle || "제목 없음"
                  }</h3>
                  <p class="text-gray-600 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    ${property.propertyAddress || "주소 정보 없음"}
                  </p>
                </div>
                ${statusBadge}
              </div>
            </div>

            <!-- 거래 정보 섹션 -->
            <div>
              <h4 class="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                거래 정보
              </h4>
              <div class="grid grid-cols-2 gap-4">
                <div class="bg-white border border-gray-200 rounded-lg p-4">
                  <p class="text-sm text-gray-500 mb-1">거래 유형</p>
                  <p class="text-lg font-semibold text-gray-800">${transactionTypeLabel}</p>
                </div>
                <div class="bg-white border border-gray-200 rounded-lg p-4">
                  <p class="text-sm text-gray-500 mb-1">가격</p>
                  <p class="text-lg font-semibold text-gray-800">${
                    property.priceDisplay || "가격 정보 없음"
                  }</p>
                </div>
                <div class="bg-white border border-gray-200 rounded-lg p-4">
                  <p class="text-sm text-gray-500 mb-1">관리비</p>
                  <p class="text-lg font-semibold text-gray-800">${
                    offer?.maintenanceFee || 0
                  }만원</p>
                </div>
                <div class="bg-white border border-gray-200 rounded-lg p-4">
                  <p class="text-sm text-gray-500 mb-1">협상 가능 여부</p>
                  <p class="text-lg font-semibold text-gray-800">${
                    offer?.negotiable ? "협상 가능" : "협상 불가"
                  }</p>
                </div>
              </div>
            </div>

            <!-- 매물 정보 섹션 -->
            <div>
              <h4 class="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                매물 정보
              </h4>
              <div class="grid grid-cols-2 gap-4">
                <div class="bg-white border border-gray-200 rounded-lg p-4">
                  <p class="text-sm text-gray-500 mb-1">주택 유형</p>
                  <p class="text-lg font-semibold text-gray-800">${housetypeLabel}</p>
                </div>
                <div class="bg-white border border-gray-200 rounded-lg p-4">
                  <p class="text-sm text-gray-500 mb-1">층수</p>
                  <p class="text-lg font-semibold text-gray-800">${
                    offer?.floor || 0
                  }층</p>
                </div>
                <div class="bg-white border border-gray-200 rounded-lg p-4 col-span-2">
                  <p class="text-sm text-gray-500 mb-1">입주 가능일</p>
                  <p class="text-lg font-semibold text-gray-800">${
                    offer?.availableFrom || "정보 없음"
                  }</p>
                </div>
              </div>
            </div>

            <!-- 옵션 정보 섹션 -->
            <div>
              <h4 class="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                포함 옵션 (${optionsList.length}개)
              </h4>
              <div class="bg-white border border-gray-200 rounded-lg p-4">
                ${
                  optionsList.length > 0
                    ? `<div class="flex flex-wrap gap-2">
                      ${optionsList
                        .map(
                          (opt) => `
                        <span class="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">${opt}</span>
                      `
                        )
                        .join("")}
                    </div>`
                    : '<p class="text-gray-500 text-center py-2">포함된 옵션이 없습니다</p>'
                }
              </div>
            </div>

            <!-- 중개인 정보 섹션 -->
            <div>
              <h4 class="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                중개인 정보
              </h4>
              <div class="bg-white border border-gray-200 rounded-lg p-4">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <p class="font-semibold text-gray-800">${
                      property.brokerName || "중개인 정보 없음"
                    }</p>
                    <p class="text-sm text-gray-500">담당 중개인</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- 위임 상태 섹션 -->
            <div>
              <h4 class="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                위임 상태
              </h4>
              <div class="bg-white border border-gray-200 rounded-lg p-4">
                <div class="flex items-center justify-between">
                  <span class="text-gray-600">현재 상태</span>
                  <span class="font-semibold ${delegationStatusColor}">${delegationStatusLabel}</span>
                </div>
                ${
                  property.rejectionReason
                    ? `<div class="mt-3 pt-3 border-t border-gray-200">
                      <p class="text-sm text-gray-500 mb-1">거절 사유</p>
                      <p class="text-gray-700">${property.rejectionReason}</p>
                    </div>`
                    : ""
                }
                <div class="mt-3 pt-3 border-t border-gray-200 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p class="text-gray-500 mb-1">등록일</p>
                    <p class="text-gray-700">${
                      property.createdAt
                        ? new Date(property.createdAt).toLocaleDateString(
                            "ko-KR"
                          )
                        : "정보 없음"
                    }</p>
                  </div>
                  <div>
                    <p class="text-gray-500 mb-1">수정일</p>
                    <p class="text-gray-700">${
                      property.updatedAt
                        ? new Date(property.updatedAt).toLocaleDateString(
                            "ko-KR"
                          )
                        : "정보 없음"
                    }</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 푸터 -->
          <div class="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
            <button onclick="propertyManagement.closeDetailModal()" 
                    class="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors">
              닫기
            </button>
            <button onclick="propertyManagement.closeDetailModal(); propertyManagement.editSalesProperty(${
              property.id
            })" 
                    class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              수정하기
            </button>
          </div>
        </div>
      `;
    }

    // 상세보기 모달 이벤트 리스너 설정
    setupDetailModalEventListeners(modal) {
      // ESC 키로 닫기
      const escHandler = (e) => {
        if (e.key === "Escape") {
          this.closeDetailModal();
        }
      };
      document.addEventListener("keydown", escHandler);

      // 백드롭 클릭으로 닫기
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          this.closeDetailModal();
        }
      });

      // 이벤트 핸들러 저장 (나중에 제거하기 위해)
      modal._escHandler = escHandler;
    }

    // 상세보기 모달 닫기
    closeDetailModal() {
      console.log("[PropertyManagement] Closing detail modal");

      const modal = document.getElementById("sales-detail-modal");
      if (modal) {
        // 이벤트 리스너 제거
        if (modal._escHandler) {
          document.removeEventListener("keydown", modal._escHandler);
        }

        // 모달 제거
        modal.remove();

        // body 스크롤 복원
        document.body.style.overflow = "";

        console.log("[PropertyManagement] Detail modal closed");
      }
    }

    // 판매 매물 수정
    async editSalesProperty(delegationId) {
      console.log(
        `[PropertyManagement] editSalesProperty called for delegation: ${delegationId}`
      );

      try {
        // 해당 판매 매물 찾기
        const salesProperty = this.mySalesProperties.find(
          (p) => p.id === delegationId
        );

        if (!salesProperty || !salesProperty.offer) {
          this.showError("판매 매물 정보를 찾을 수 없습니다.");
          return;
        }

        // 판매 등록 패널이 있는지 확인
        if (typeof window.SaleRegistrationPanel === "undefined") {
          console.error(
            "[PropertyManagement] SaleRegistrationPanel not loaded"
          );
          this.showError(
            "판매 등록 기능을 불러올 수 없습니다. 페이지를 새로고침해주세요."
          );
          return;
        }

        // 판매 등록 패널을 수정 모드로 열기
        const salePanel = document.getElementById("sale-registration-panel");
        if (!salePanel) {
          // 패널이 없으면 초기화
          if (
            typeof window.SaleRegistrationPanel.initWithRetry === "function"
          ) {
            const initSuccess =
              await window.SaleRegistrationPanel.initWithRetry(3, 500);
            if (!initSuccess) {
              this.showError("판매 등록 패널을 초기화할 수 없습니다.");
              return;
            }
          }
        }

        // 판매 등록 패널 표시
        const panel = document.getElementById("sale-registration-panel");
        if (panel) {
          panel.style.display = "block";
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              panel.classList.remove("translate-x-full");
              panel.classList.add("translate-x-0");
            });
          });

          // 폼을 기존 데이터로 초기화
          this.populateSaleFormForEdit(salesProperty);

          // 수정 모드 플래그 설정
          PropertyManagement.saleRegistrationState.isEditMode = true;
          PropertyManagement.saleRegistrationState.editingOfferId =
            salesProperty.offer.id;
          PropertyManagement.saleRegistrationState.currentClaimId = null; // 수정 모드에서는 claimId 불필요
        } else {
          this.showError("판매 등록 패널을 찾을 수 없습니다.");
        }
      } catch (error) {
        console.error("판매 매물 수정 실패:", error);
        this.showError(
          `판매 매물 수정 중 오류가 발생했습니다: ${error.message}`
        );
      }
    }

    // 판매 폼을 수정 모드로 채우기
    populateSaleFormForEdit(salesProperty) {
      try {
        const offer = salesProperty.offer;
        if (!offer) return;

        // 거래 유형 설정
        this.switchTransactionType(offer.type);

        // 기본 정보 입력
        const housetypeSelect = document.getElementById("housetype");
        if (housetypeSelect) housetypeSelect.value = offer.housetype || "APART";

        const floorInput = document.getElementById("floor");
        if (floorInput) floorInput.value = offer.floor || "";

        const maintenanceFeeInput = document.getElementById("maintenanceFee");
        if (maintenanceFeeInput)
          maintenanceFeeInput.value = offer.maintenanceFee || "0";

        const availableFromInput = document.getElementById("availableFrom");
        if (availableFromInput)
          availableFromInput.value = offer.availableFrom || "";

        const negotiableCheckbox = document.getElementById("negotiable");
        if (negotiableCheckbox)
          negotiableCheckbox.checked = offer.negotiable || false;

        const isActiveCheckbox = document.getElementById("isActive");
        if (isActiveCheckbox)
          isActiveCheckbox.checked = offer.isActive !== false;

        // 가격 정보 입력
        if (offer.type === "SALE") {
          const totalPriceInput = document.getElementById("totalPrice");
          if (totalPriceInput) totalPriceInput.value = offer.totalPrice || "";
        } else {
          const depositInput = document.getElementById("deposit");
          if (depositInput) depositInput.value = offer.deposit || "";

          if (offer.type === "WOLSE") {
            const monthlyRentInput = document.getElementById("monthlyRent");
            if (monthlyRentInput)
              monthlyRentInput.value = offer.monthlyRent || "";
          }
        }

        // 옵션 체크박스 설정
        if (Array.isArray(offer.options)) {
          const checkboxes = document.querySelectorAll(".option-checkbox");
          checkboxes.forEach((checkbox, index) => {
            if (index < offer.options.length) {
              checkbox.checked = offer.options[index] === true;
            }
          });
        }

        // 중개인 선택은 수정 불가 (비활성화)
        const brokerSelect = document.getElementById("brokerSelect");
        if (brokerSelect) {
          brokerSelect.value = salesProperty.brokerUserId || "";
          brokerSelect.disabled = true; // 수정 모드에서는 중개인 변경 불가
        }

        // 제출 버튼 텍스트 변경
        const submitButton = document.querySelector(
          "#sale-registration-form button[type='submit']"
        );
        if (submitButton) {
          submitButton.textContent = "수정 완료";
        }

        console.log("[PropertyManagement] Sale form populated for edit");
      } catch (error) {
        console.error(
          "[PropertyManagement] Error populating sale form:",
          error
        );
      }
    }

    // 판매 매물 활성화/비활성화
    async toggleSalesPropertyActive(delegationId) {
      console.log(
        `[PropertyManagement] toggleSalesPropertyActive called for delegation: ${delegationId}`
      );

      try {
        // 해당 판매 매물 찾기
        const salesProperty = this.mySalesProperties.find(
          (p) => p.id === delegationId
        );

        if (!salesProperty || !salesProperty.offer) {
          this.showError("판매 매물 정보를 찾을 수 없습니다.");
          return;
        }

        const offerId = salesProperty.offer.id;
        const currentStatus = salesProperty.offer.isActive;
        const action = currentStatus ? "비활성화" : "활성화";

        // 확인 메시지
        if (!confirm(`이 판매 매물을 ${action}하시겠습니까?`)) {
          return;
        }

        // API 호출
        const response = await fetch(`/api/offers/${offerId}/toggle-active`, {
          method: "PATCH",
          headers: {
            ...AuthUtils.getAuthHeader(),
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const updatedOffer = await response.json();
          console.log(
            `[PropertyManagement] Offer ${action} successful:`,
            updatedOffer
          );

          // 로컬 데이터 업데이트
          salesProperty.offer.isActive = updatedOffer.isActive;

          // UI 갱신
          this.renderSalesProperties();

          this.showSuccess(`판매 매물이 ${action}되었습니다.`);
        } else if (response.status === 401) {
          this.handleAuthError();
        } else {
          const errorText = await response.text();
          console.error(
            `[PropertyManagement] Failed to toggle offer active:`,
            errorText
          );
          throw new Error(`판매 매물 ${action}에 실패했습니다.`);
        }
      } catch (error) {
        console.error("판매 매물 활성화/비활성화 실패:", error);
        this.showError(`판매 매물 상태 변경에 실패했습니다: ${error.message}`);
      }
    }

    // 판매 매물 필터링
    filterSalesProperties(transactionFilter, activeFilter) {
      console.log(
        `[PropertyManagement] Filtering sales properties - Transaction: ${transactionFilter}, Active: ${activeFilter}`
      );

      try {
        // 필터 값 업데이트
        this.currentSalesTransactionFilter = transactionFilter;
        this.currentSalesActiveFilter = activeFilter;

        // 필터링 로직 적용
        let filtered = [...this.mySalesProperties];

        // 거래 유형별 필터
        if (transactionFilter !== "ALL") {
          filtered = filtered.filter(
            (property) => property.offer?.type === transactionFilter
          );
        }

        // 활성 상태별 필터
        if (activeFilter === "ACTIVE") {
          filtered = filtered.filter(
            (property) => property.offer?.isActive === true
          );
        } else if (activeFilter === "INACTIVE") {
          filtered = filtered.filter(
            (property) => property.offer?.isActive === false
          );
        }

        // 필터링된 결과 저장
        this.filteredSalesProperties = filtered;

        console.log(
          `[PropertyManagement] Filtered ${this.filteredSalesProperties.length} sales properties`
        );

        // 필터 탭 스타일 업데이트
        this.updateSalesFilterTabs();

        // 필터링된 결과 렌더링
        this.renderSalesProperties();

        return true;
      } catch (error) {
        console.error(
          "[PropertyManagement] Error filtering sales properties:",
          error
        );
        this.showError("판매 매물 필터링 중 오류가 발생했습니다.");
        return false;
      }
    }

    // 판매 매물 필터 탭 스타일 업데이트
    updateSalesFilterTabs() {
      try {
        // 거래 유형 필터 탭 업데이트
        const transactionTabs = [
          { id: "sales-all-tab", filter: "ALL" },
          { id: "sales-sale-tab", filter: "SALE" },
          { id: "sales-jeonse-tab", filter: "JEONSE" },
          { id: "sales-wolse-tab", filter: "WOLSE" },
        ];

        transactionTabs.forEach(({ id, filter }) => {
          const tab = document.getElementById(id);
          if (tab) {
            if (filter === this.currentSalesTransactionFilter) {
              tab.className =
                "flex-1 px-3 py-2 text-xs border-b-2 border-blue-500 text-blue-600 font-medium text-center";
            } else {
              tab.className =
                "flex-1 px-3 py-2 text-xs border-b-2 border-transparent text-gray-500 hover:text-gray-700 text-center";
            }
          }
        });

        // 활성 상태 필터 탭 업데이트
        const activeTabs = [
          { id: "active-all-tab", filter: "ALL" },
          { id: "active-active-tab", filter: "ACTIVE" },
          { id: "active-inactive-tab", filter: "INACTIVE" },
        ];

        activeTabs.forEach(({ id, filter }) => {
          const tab = document.getElementById(id);
          if (tab) {
            if (filter === this.currentSalesActiveFilter) {
              tab.className =
                "flex-1 px-3 py-1 text-xs bg-gray-100 text-gray-600 hover:bg-gray-200 text-center";
            } else {
              tab.className =
                "flex-1 px-3 py-1 text-xs bg-white text-gray-500 hover:bg-gray-50 text-center";
            }
          }
        });

        console.log("[PropertyManagement] Sales filter tabs updated");
      } catch (error) {
        console.error(
          "[PropertyManagement] Error updating sales filter tabs:",
          error
        );
      }
    }

    // 현재 사용자 정보 로드
    async loadCurrentUser() {
      try {
        const response = await fetch("/api/users/me", {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          this.currentUser = await response.json();
        } else {
          throw new Error("사용자 정보를 불러올 수 없습니다.");
        }
      } catch (error) {
        console.error("사용자 정보 로드 실패:", error);
        this.showError("사용자 정보를 불러올 수 없습니다.");
      }
    }

    // 내 매물 목록 로드
    async loadMyProperties() {
      try {
        const response = await fetch(`${this.apiBaseUrl}/my-claims`, {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          this.myProperties = await response.json();
          this.applyCurrentFilters();
          this.updatePropertySummary();
        } else {
          throw new Error("매물 목록을 불러올 수 없습니다.");
        }
      } catch (error) {
        console.error("매물 목록 로드 실패:", error);
        this.showError("매물 목록을 불러올 수 없습니다.");
      }
    }

    // 에러 메시지 표시
    showError(message) {
      console.error("[PropertyManagement]", message);
      alert("❌ " + message);
    }

    // 성공 메시지 표시
    showSuccess(message) {
      console.log("[PropertyManagement]", message);
      alert("✅ " + message);
    }

    // 매물 삭제 (취소)
    async deleteProperty(claimId) {
      console.log(`[PropertyManagement] Canceling property claim: ${claimId}`);

      // 매물 정보 확인
      const property = this.myProperties.find((p) => p.claimId === claimId);

      if (!property) {
        this.showError("매물 정보를 찾을 수 없습니다.");
        return;
      }

      // PENDING 상태만 취소 가능
      if (property.status !== "PENDING") {
        this.showError("심사 중인 매물만 취소할 수 있습니다.");
        return;
      }

      // 삭제 확인
      if (!confirm("정말로 이 매물 신청을 취소하시겠습니까?")) {
        return;
      }

      try {
        const response = await fetch(`${this.apiBaseUrl}/claims/${claimId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          this.showSuccess("매물 신청이 성공적으로 취소되었습니다.");
          await this.loadMyProperties();
        } else {
          const errorText = await response.text();
          let errorMessage = "매물 취소에 실패했습니다.";
          try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.message || errorMessage;
          } catch (e) {
            errorMessage = errorText || errorMessage;
          }
          throw new Error(errorMessage);
        }
      } catch (error) {
        console.error("매물 취소 실패:", error);
        this.showError("매물 취소에 실패했습니다: " + error.message);
      }
    }

    // 필터 적용
    filterProperties(statusFilter, typeFilter) {
      this.currentStatusFilter = statusFilter;
      this.currentTypeFilter = typeFilter;
      this.applyCurrentFilters();
      this.updateFilterTabs();
    }

    // 현재 필터 적용
    applyCurrentFilters() {
      let filtered = [...this.myProperties];

      // 상태 필터 적용
      if (this.currentStatusFilter !== "ALL") {
        filtered = filtered.filter(
          (property) => property.status === this.currentStatusFilter
        );
      }

      // 유형 필터 적용
      if (this.currentTypeFilter === "SIMPLE") {
        // 단순 등록: delegation이 없는 매물
        filtered = filtered.filter((property) => !property.hasDelegation);
      } else if (this.currentTypeFilter === "SALE") {
        // 판매 등록: delegation이 있는 매물
        filtered = filtered.filter((property) => property.hasDelegation);
      }

      this.filteredProperties = filtered;
      this.renderMyProperties();
    }

    // 필터 탭 스타일 업데이트
    updateFilterTabs() {
      // 상태 필터 탭 업데이트
      document
        .querySelectorAll('[id^="property-"][id$="-tab"]')
        .forEach((tab) => {
          tab.className =
            "flex-1 px-3 py-2 text-xs border-b-2 border-transparent text-gray-500 hover:text-gray-700 text-center";
        });

      const statusTabId =
        this.currentStatusFilter === "ALL"
          ? "property-all-tab"
          : this.currentStatusFilter === "PENDING"
          ? "property-pending-tab"
          : this.currentStatusFilter === "APPROVED"
          ? "property-approved-tab"
          : "property-rejected-tab";

      const statusTab = document.getElementById(statusTabId);
      if (statusTab) {
        statusTab.className =
          "flex-1 px-3 py-2 text-xs border-b-2 border-blue-500 text-blue-600 font-medium text-center";
      }

      // 유형 필터 탭 업데이트
      document.querySelectorAll('[id^="type-"][id$="-tab"]').forEach((tab) => {
        tab.className =
          "flex-1 px-3 py-1 text-xs bg-white text-gray-500 hover:bg-gray-50 text-center";
      });

      const typeTabId =
        this.currentTypeFilter === "ALL"
          ? "type-all-tab"
          : this.currentTypeFilter === "SIMPLE"
          ? "type-simple-tab"
          : "type-sale-tab";

      const typeTab = document.getElementById(typeTabId);
      if (typeTab) {
        typeTab.className =
          "flex-1 px-3 py-1 text-xs bg-gray-100 text-gray-600 hover:bg-gray-200 text-center";
      }
    }

    // 매물 목록 렌더링
    renderMyProperties() {
      const myPropertyList = document.getElementById("my-property-list");
      if (!myPropertyList) return;

      myPropertyList.innerHTML = "";

      const propertiesToShow =
        this.filteredProperties.length > 0
          ? this.filteredProperties
          : this.myProperties;

      if (propertiesToShow.length === 0) {
        myPropertyList.innerHTML = `
        <div class="text-center py-8 text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
          </svg>
          <p class="text-sm">
            ${
              this.currentStatusFilter === "ALL" &&
              this.currentTypeFilter === "ALL"
                ? "등록된 매물이 없습니다."
                : "필터 조건에 맞는 매물이 없습니다."
            }
          </p>
          <p class="text-xs mt-1">
            ${
              this.currentStatusFilter === "ALL" &&
              this.currentTypeFilter === "ALL"
                ? "내 매물을 등록해보세요!"
                : "다른 필터를 선택해보세요."
            }
          </p>
        </div>
      `;
        return;
      }

      propertiesToShow.forEach((property) => {
        const propertyCard = this.createPropertyCard(property);
        myPropertyList.appendChild(propertyCard);
      });
    }

    // 매물 카드 생성
    createPropertyCard(property) {
      const card = document.createElement("div");
      card.className =
        "bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow";

      const statusInfo = this.getStatusInfo(property.status);
      const daysLeft = this.calculateDaysLeft(
        property.createdAt,
        property.deadline
      );

      card.innerHTML = `
            <div class="flex justify-between items-start mb-3">
                <div class="flex-1">
                    <h3 class="font-semibold text-gray-800 text-sm mb-1">${
                      property.title ||
                      property.buildingName ||
                      "매물 정보 없음"
                    }</h3>
                    <p class="text-xs text-gray-600 mb-2">${
                      property.address ||
                      property.propertyAddress ||
                      "주소 정보 없음"
                    }</p>
                </div>
                <span class="px-2 py-1 text-xs rounded-full ${
                  statusInfo.bgColor
                } ${statusInfo.textColor}">
                    ${statusInfo.label}
                </span>
            </div>

            <div class="space-y-2 mb-3">
                <div class="flex justify-between text-xs">
                    <span class="text-gray-500">신청자:</span>
                    <span class="text-gray-800">${property.applicantName}</span>
                </div>
                <div class="flex justify-between text-xs">
                    <span class="text-gray-500">관계:</span>
                    <span class="text-gray-800">${
                      property.relationshipToProperty
                    }</span>
                </div>
                ${
                  property.status === "PENDING"
                    ? `
                    <div class="flex justify-between text-xs">
                        <span class="text-gray-500">심사 마감:</span>
                        <span class="text-red-600 font-medium">${daysLeft}</span>
                    </div>
                `
                    : ""
                }
                ${
                  property.rejectionReason
                    ? `
                    <div class="text-xs">
                        <span class="text-gray-500">거절 사유:</span>
                        <p class="text-red-600 mt-1">${property.rejectionReason}</p>
                    </div>
                `
                    : ""
                }
            </div>

            <div class="flex gap-2 mb-2">
                <button onclick="propertyManagement.viewPropertyDetail(${
                  property.claimId
                })"
                        class="flex-1 px-3 py-2 text-xs bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors">
                    상세보기
                </button>
                ${
                  property.status === "PENDING"
                    ? `
                    <button onclick="propertyManagement.editProperty(${property.claimId})"
                            class="flex-1 px-3 py-2 text-xs bg-gray-50 text-gray-600 rounded-md hover:bg-gray-100 transition-colors">
                        수정하기
                    </button>
                `
                    : ""
                }
                ${
                  property.documents && property.documents.length > 0
                    ? `
                    <button onclick="propertyManagement.viewDocuments(${property.claimId})"
                            class="px-3 py-2 text-xs bg-green-50 text-green-600 rounded-md hover:bg-green-100 transition-colors">
                        서류보기
                    </button>
                `
                    : ""
                }
            </div>
            <div class="flex gap-2">
                ${
                  property.status === "APPROVED"
                    ? `
                    <button onclick="propertyManagement.registerForSale(${property.claimId})"
                            class="flex-1 px-3 py-2 text-xs bg-purple-50 text-purple-600 rounded-md hover:bg-purple-100 transition-colors">
                        판매 매물 등록
                    </button>
                `
                    : ""
                }
                <button onclick="propertyManagement.deleteProperty(${
                  property.claimId
                })"
                        class="px-3 py-2 text-xs bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors">
                    삭제하기
                </button>
            </div>
        `;

      return card;
    }

    // 상태 정보 반환
    getStatusInfo(status) {
      switch (status) {
        case "PENDING":
          return {
            label: "심사중",
            bgColor: "bg-yellow-100",
            textColor: "text-yellow-800",
          };
        case "APPROVED":
          return {
            label: "승인됨",
            bgColor: "bg-green-100",
            textColor: "text-green-800",
          };
        case "REJECTED":
          return {
            label: "거절됨",
            bgColor: "bg-red-100",
            textColor: "text-red-800",
          };
        default:
          return {
            label: "알 수 없음",
            bgColor: "bg-gray-100",
            textColor: "text-gray-800",
          };
      }
    }

    // 남은 일수 계산
    calculateDaysLeft(createdAt, deadline) {
      if (!deadline) {
        // deadline이 없으면 생성일로부터 7일 후로 계산
        const created = new Date(createdAt);
        const deadlineDate = new Date(
          created.getTime() + 7 * 24 * 60 * 60 * 1000
        );
        const now = new Date();
        const diffTime = deadlineDate - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 0) {
          return `${diffDays}일 남음`;
        } else {
          return "마감됨";
        }
      }

      const deadlineDate = new Date(deadline);
      const now = new Date();
      const diffTime = deadlineDate - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 0) {
        return `${diffDays}일 남음`;
      } else {
        return "마감됨";
      }
    }

    // 매물 요약 정보 업데이트
    updatePropertySummary() {
      const totalCount = this.myProperties.length;
      const pendingCount = this.myProperties.filter(
        (p) => p.status === "PENDING"
      ).length;
      const approvedCount = this.myProperties.filter(
        (p) => p.status === "APPROVED"
      ).length;
      const rejectedCount = this.myProperties.filter(
        (p) => p.status === "REJECTED"
      ).length;

      // 요약 정보 업데이트
      const summaryElement = document.querySelector(
        "#my-property-panel .bg-blue-50"
      );
      if (summaryElement) {
        summaryElement.innerHTML = `
                <div class="flex justify-between items-center mb-2">
                    <h3 class="font-semibold text-blue-800">내 매물 현황</h3>
                    <span class="text-blue-600 font-bold">${totalCount}건</span>
                </div>
                <div class="grid grid-cols-3 gap-2 text-xs">
                    <div class="text-center">
                        <div class="text-yellow-600 font-semibold">${pendingCount}</div>
                        <div class="text-gray-600">심사중</div>
                    </div>
                    <div class="text-center">
                        <div class="text-green-600 font-semibold">${approvedCount}</div>
                        <div class="text-gray-600">승인됨</div>
                    </div>
                    <div class="text-center">
                        <div class="text-red-600 font-semibold">${rejectedCount}</div>
                        <div class="text-gray-600">거절됨</div>
                    </div>
                </div>
            `;
      }
    }

    // 이벤트 리스너 설정
    setupEventListeners() {
      // 내 매물 등록 버튼 (ID로 찾기)
      const myPropertyBtn = document.getElementById("add-property-btn");
      if (myPropertyBtn) {
        myPropertyBtn.addEventListener("click", () => {
          console.log("내 매물 등록 버튼 클릭됨");
          this.showNewPropertyModal();
        });
      }

      // 백업: 클래스로도 찾기
      const myPropertyBtnFallback = document.querySelector(
        "#my-property-panel .bg-blue-600"
      );
      if (myPropertyBtnFallback && myPropertyBtnFallback !== myPropertyBtn) {
        myPropertyBtnFallback.addEventListener("click", () => {
          console.log("내 매물 등록 버튼 클릭됨 (fallback)");
          this.showNewPropertyModal();
        });
      }
    }

    // 새 매물 등록 모달 표시
    showNewPropertyModal() {
      const myPropertyPanel = document.getElementById("my-property-panel");
      if (!myPropertyPanel) {
        console.error("[PropertyManagement] my-property-panel not found");
        this.showError("매물 관리 패널을 찾을 수 없습니다.");
        return;
      }

      const modal = this.createNewPropertyModal();
      myPropertyPanel.appendChild(modal);

      // 모달 표시 애니메이션
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          modal.classList.remove("translate-x-full");
          modal.classList.add("translate-x-0");
        });
      });

      // 지도 초기화
      setTimeout(() => {
        this.initializeMap();
      }, 100);
    }

    // 새 매물 등록 모달 생성
    createNewPropertyModal() {
      const modal = document.createElement("div");
      modal.id = "new-property-modal";
      modal.className =
        "absolute inset-0 bg-white flex flex-col h-full z-10 transform translate-x-full transition-transform duration-300 ease-in-out overflow-hidden p-6";

      modal.innerHTML = `
                <!-- 헤더 -->
                <div class="flex justify-between items-center mb-4 pb-4 border-b flex-shrink-0">
                    <h2 class="text-xl font-bold text-gray-800">내 매물 등록</h2>
                    <button onclick="propertyManagement.closeNewPropertyModal()"
                            class="p-2 rounded-full hover:bg-gray-200 transition-colors"
                            title="내 매물 등록 패널 닫기">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>

                <!-- 스크롤 가능한 폼 영역 -->
                <div class="flex-grow overflow-y-auto custom-scrollbar pr-2 -mr-2" style="max-height: calc(100% - 200px);">
                <form id="new-property-form" class="space-y-6 pb-4">
                    <!-- 기본 정보 -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">신청자 이름 *</label>
                            <input type="text" id="applicant-name" required
                                   value="${this.currentUser?.username || ""}"
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">연락처 *</label>
                            <input type="tel" id="applicant-phone" required
                                   value="${
                                     this.currentUser?.phoneNumber || ""
                                   }"
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">매물과의 관계 *</label>
                        <select id="relationship-to-property" required
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="">선택해주세요</option>
                            <option value="소유자">소유자</option>
                            <option value="임차인">임차인</option>
                            <option value="상속인">상속인</option>
                            <option value="공동소유자">공동소유자</option>
                            <option value="기타">기타</option>
                        </select>
                    </div>

                    <!-- 위치 정보 -->
                    <div class="border-t pt-6">
                        <h3 class="text-lg font-semibold text-gray-800 mb-4">위치 정보</h3>

                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-2">주소 검색</label>
                            <div class="flex gap-2">
                                <input type="text" id="address-search" placeholder="예: 강남역, 홍대, 대구 남구, 부산 해운대"
                                       class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <button type="button" onclick="propertyManagement.searchAddress()"
                                        class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
                                    검색
                                </button>
                            </div>
                            <div class="mt-2 text-xs text-gray-500">
                                💡 검색 예시: "강남역", "홍대입구", "대구 남구", "부산 해운대", "제주시", "서울대" 등
                            </div>
                        </div>

                        <!-- 지도 -->
                        <div class="mb-4">
                            <div id="property-map" class="w-full h-64 border border-gray-300 rounded-md"></div>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">선택된 주소</label>
                                <input type="text" id="selected-address" readonly
                                       class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">건물명</label>
                                <input type="text" id="building-name"
                                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                            </div>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">상세 주소</label>
                                <input type="text" id="detailed-address" placeholder="동, 호수 등"
                                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">우편번호</label>
                                <input type="text" id="postal-code" readonly
                                       class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                            </div>
                        </div>

                        <!-- 숨겨진 좌표 필드 -->
                        <input type="hidden" id="location-x">
                        <input type="hidden" id="location-y">
                    </div>

                    <!-- 서류 업로드 -->
                    <div class="border-t pt-6">
                        <h3 class="text-lg font-semibold text-gray-800 mb-4">필수 서류 업로드</h3>
                        <div id="document-upload-area" class="space-y-4">
                            <!-- JavaScript로 동적 생성 -->
                        </div>
                        <button type="button" onclick="propertyManagement.addDocumentField()"
                                class="mt-4 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors">
                            + 서류 추가
                        </button>
                    </div>

                    <!-- 추가 정보 -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">추가 설명</label>
                        <textarea id="additional-info" rows="3"
                                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="매물에 대한 추가 설명이나 특이사항을 입력해주세요"></textarea>
                    </div>
                </form>
                </div>

                <!-- 하단 버튼 영역 -->
                <div class="flex gap-3 pt-4 mt-4 border-t flex-shrink-0">
                    <button type="button" onclick="propertyManagement.closeNewPropertyModal()"
                            class="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
                        취소
                    </button>
                    <button type="button" onclick="propertyManagement.submitNewProperty()"
                            class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                        등록하기
                    </button>
                </div>
        `;

      // 초기 서류 필드 추가
      setTimeout(() => {
        this.addDocumentField();
      }, 100);

      return modal;
    }

    // 새 매물 등록 모달 닫기
    closeNewPropertyModal() {
      console.log("[PropertyManagement] Closing new property modal");

      try {
        const modal = document.getElementById("new-property-modal");
        if (!modal) {
          console.warn("[PropertyManagement] New property modal not found");
          return false;
        }

        // 모달 닫기 애니메이션
        modal.classList.remove("translate-x-0");
        modal.classList.add("translate-x-full");

        // 애니메이션 완료 후 제거
        setTimeout(() => {
          modal.remove();
        }, 300);

        console.log(
          "[PropertyManagement] New property modal closed successfully"
        );
        return true;
      } catch (error) {
        console.error(
          "[PropertyManagement] Error closing new property modal:",
          error
        );
        return false;
      }
    }

    // 서류 업로드 필드 추가
    addDocumentField() {
      const uploadArea = document.getElementById("document-upload-area");
      if (!uploadArea) return;

      const fieldIndex = uploadArea.children.length;
      const fieldDiv = document.createElement("div");
      fieldDiv.className = "flex gap-4 items-end";

      fieldDiv.innerHTML = `
            <div class="flex-1">
                <label class="block text-sm font-medium text-gray-700 mb-2">서류 종류</label>
                <select class="document-type w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">선택해주세요</option>
                    <option value="PROPERTY_DEED">등기부등본</option>
                    <option value="IDENTITY_CARD">신분증</option>
                    <option value="RESIDENCE_CERTIFICATE">주민등록등본</option>
                    <option value="TAX_CERTIFICATE">납세증명서</option>
                    <option value="OTHER">기타</option>
                </select>
            </div>
            <div class="flex-1">
                <label class="block text-sm font-medium text-gray-700 mb-2">파일 선택</label>
                <input type="file" class="document-file w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                       accept=".pdf,.jpg,.jpeg,.png,.doc,.docx">
            </div>
            <button type="button" onclick="this.parentElement.remove()"
                    class="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors">
                삭제
            </button>
        `;

      uploadArea.appendChild(fieldDiv);
    }

    // 지도 초기화
    initializeMap() {
      if (typeof naver === "undefined") {
        console.error("네이버 지도 API가 로드되지 않았습니다.");
        this.showError(
          "지도 API를 불러올 수 없습니다. 페이지를 새로고침해주세요."
        );
        return;
      }

      const mapContainer = document.getElementById("property-map");
      if (!mapContainer) {
        console.error("지도 컨테이너를 찾을 수 없습니다.");
        return;
      }

      try {
        // 기본 위치 (대구 남구)
        const defaultLocation = new naver.maps.LatLng(35.8242, 128.5782);

        this.propertyMap = new naver.maps.Map(mapContainer, {
          center: defaultLocation,
          zoom: 15,
          mapTypeControl: true,
        });

        // 마커 생성
        this.propertyMarker = new naver.maps.Marker({
          position: defaultLocation,
          map: this.propertyMap,
          draggable: true,
        });

        // 지도 클릭 이벤트
        naver.maps.Event.addListener(this.propertyMap, "click", (e) => {
          this.propertyMarker.setPosition(e.coord);
          this.reverseGeocode(e.coord.lat(), e.coord.lng());
        });

        // 마커 드래그 이벤트
        naver.maps.Event.addListener(this.propertyMarker, "dragend", (e) => {
          this.reverseGeocode(e.coord.lat(), e.coord.lng());
        });

        // 초기 위치 정보 설정
        this.reverseGeocode(defaultLocation.lat(), defaultLocation.lng());
      } catch (error) {
        console.error("지도 초기화 실패:", error);
        this.showError("지도를 초기화할 수 없습니다.");
      }
    }

    // 주소 검색
    async searchAddress() {
      const addressInput = document.getElementById("address-search");
      const address = addressInput.value.trim();

      if (!address) {
        this.showError("주소를 입력해주세요.");
        return;
      }

      console.log("Searching for address:", address);

      try {
        const response = await fetch(
          `${this.mapApiBaseUrl}/coordinates?address=${encodeURIComponent(
            address
          )}`,
          {
            headers: {
              Authorization: `Bearer ${this.accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log("Geocoding response:", data);

          if (
            typeof naver !== "undefined" &&
            this.propertyMap &&
            this.propertyMarker
          ) {
            const location = new naver.maps.LatLng(
              data.latitude,
              data.longitude
            );
            this.propertyMap.setCenter(location);
            this.propertyMarker.setPosition(location);
            console.log("Map updated to:", data.latitude, data.longitude);
          }

          // 주소 정보 업데이트
          this.reverseGeocode(data.latitude, data.longitude);
        } else {
          const errorText = await response.text();
          console.error("Geocoding failed:", errorText);
          throw new Error(errorText || "주소를 찾을 수 없습니다.");
        }
      } catch (error) {
        console.error("주소 검색 실패:", error);
        this.showError("주소 검색에 실패했습니다: " + error.message);
      }
    }

    // 역지오코딩 (좌표 -> 주소)
    async reverseGeocode(lat, lng) {
      try {
        const response = await fetch(
          `${this.mapApiBaseUrl}/address?latitude=${lat}&longitude=${lng}`,
          {
            headers: {
              Authorization: `Bearer ${this.accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log("Reverse geocoding response:", data);

          // 폼 필드 업데이트
          const selectedAddressEl = document.getElementById("selected-address");
          const buildingNameEl = document.getElementById("building-name");
          const postalCodeEl = document.getElementById("postal-code");
          const locationXEl = document.getElementById("location-x");
          const locationYEl = document.getElementById("location-y");

          if (selectedAddressEl)
            selectedAddressEl.value =
              data.roadAddress || data.jibunAddress || "";
          if (buildingNameEl) buildingNameEl.value = data.buildingName || "";
          if (postalCodeEl) postalCodeEl.value = data.postalCode || "";
          if (locationXEl) locationXEl.value = lng;
          if (locationYEl) locationYEl.value = lat;

          console.log(
            "Form fields updated with address:",
            data.roadAddress || data.jibunAddress
          );
        } else {
          console.warn("역지오코딩 응답 오류:", response.status);
        }
      } catch (error) {
        console.error("역지오코딩 실패:", error);
      }
    }

    // 새 매물 등록 제출
    async submitNewProperty() {
      const formData = new FormData();

      // 기본 정보 (propertyId는 새 매물 등록시에는 필요없음)
      formData.append(
        "applicantName",
        document.getElementById("applicant-name").value
      );
      formData.append(
        "applicantPhone",
        document.getElementById("applicant-phone").value
      );
      formData.append(
        "relationshipToProperty",
        document.getElementById("relationship-to-property").value
      );
      formData.append(
        "additionalInfo",
        document.getElementById("additional-info").value
      );

      // 위치 정보
      formData.append(
        "propertyAddress",
        document.getElementById("selected-address").value
      );
      formData.append("locationX", document.getElementById("location-x").value);
      formData.append("locationY", document.getElementById("location-y").value);
      formData.append(
        "buildingName",
        document.getElementById("building-name").value
      );
      formData.append(
        "detailedAddress",
        document.getElementById("detailed-address").value
      );
      formData.append(
        "postalCode",
        document.getElementById("postal-code").value
      );

      // 서류 파일들
      const documentTypes = [];
      const documentFiles = [];

      document
        .querySelectorAll("#document-upload-area > div")
        .forEach((div) => {
          const typeSelect = div.querySelector(".document-type");
          const fileInput = div.querySelector(".document-file");

          if (typeSelect.value && fileInput.files[0]) {
            documentTypes.push(typeSelect.value);
            documentFiles.push(fileInput.files[0]);
          }
        });

      // 서류 타입들 추가
      documentTypes.forEach((type) => {
        formData.append("documentTypes", type);
      });

      // 서류 파일들 추가
      documentFiles.forEach((file) => {
        formData.append("documents", file);
      });

      // 필수 필드 검증
      const requiredFields = [
        { id: "applicant-name", name: "신청자 이름" },
        { id: "applicant-phone", name: "연락처" },
        { id: "relationship-to-property", name: "매물과의 관계" },
      ];

      for (const field of requiredFields) {
        const element = document.getElementById(field.id);
        if (!element || !element.value.trim()) {
          this.showError(`${field.name}을(를) 입력해주세요.`);
          return;
        }
      }

      // 위치 정보 검증
      const locationX = document.getElementById("location-x").value;
      const locationY = document.getElementById("location-y").value;
      if (!locationX || !locationY) {
        this.showError("지도에서 위치를 선택해주세요.");
        return;
      }

      try {
        const response = await fetch(`${this.apiBaseUrl}/claims`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          this.showSuccess(
            "내 매물 등록 신청이 완료되었습니다. 관리자 승인 후 매물이 등록됩니다."
          );
          this.closeModal("new-property-modal");
          await this.loadMyProperties(); // 목록 새로고침
        } else {
          const errorText = await response.text();
          let errorMessage = "등록에 실패했습니다.";

          try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.message || errorMessage;
          } catch (e) {
            errorMessage = errorText || errorMessage;
          }

          throw new Error(errorMessage);
        }
      } catch (error) {
        console.error("매물 등록 실패:", error);
        this.showError("매물 등록에 실패했습니다: " + error.message);
      }
    }
  }

  // 클래스를 전역에 노출 (다른 파트에서 메서드 추가 가능)
  window.PropertyManagement = PropertyManagement;
})(); // IIFE 닫기
