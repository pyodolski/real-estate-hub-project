class BrokerDelegationManagement {
  constructor() {
    this.currentFilter = "PENDING";
    this.delegationRequests = [];
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadDelegationRequests();
  }

  setupEventListeners() {
    // 위임 요청 버튼 클릭
    const delegationButton = document.getElementById("delegation-request-button");
    if (delegationButton) {
      delegationButton.addEventListener("click", () => {
        this.showDelegationPanel();
      });
    }

    // 패널 닫기 버튼
    const closeButton = document.getElementById("close-delegation-panel");
    if (closeButton) {
      closeButton.addEventListener("click", () => {
        this.hideDelegationPanel();
      });
    }
  }

  // 위임 요청 패널 표시
  showDelegationPanel() {
    const panel = document.getElementById("delegation-request-panel");
    if (panel) {
      panel.style.display = "block";
      panel.classList.remove("translate-x-full");
      this.loadDelegationRequests();
    }
  }

  // 위임 요청 패널 숨기기
  hideDelegationPanel() {
    const panel = document.getElementById("delegation-request-panel");
    if (panel) {
      panel.classList.add("translate-x-full");
      setTimeout(() => {
        panel.style.display = "none";
      }, 300);
    }
  }

  // 상태별 필터링
  filterByStatus(status) {
    this.currentFilter = status;

    // 탭 스타일 업데이트
    document.querySelectorAll('[id$="-tab"]').forEach(tab => {
      tab.className = "flex-1 px-4 py-2 text-center border-b-2 border-transparent text-gray-500 hover:text-gray-700";
    });

    const activeTab = status === "ALL" ? "all-tab" :
                     status === "PENDING" ? "pending-tab" :
                     status === "APPROVED" ? "approved-tab" : "rejected-tab";

    const activeTabElement = document.getElementById(activeTab);
    if (activeTabElement) {
      activeTabElement.className = "flex-1 px-4 py-2 text-center border-b-2 border-blue-500 text-blue-600 font-medium";
    }

    this.renderDelegationRequests();
  }

  // 위임 요청 목록 로드
  async loadDelegationRequests() {
    try {
      const response = await fetch("/api/delegations/incoming", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${this.getToken()}`
        }
      });

      if (response.ok) {
        this.delegationRequests = await response.json();
        this.updateStatistics();
        this.renderDelegationRequests();
      } else {
        throw new Error("위임 요청 목록을 불러올 수 없습니다.");
      }
    } catch (error) {
      console.error("위임 요청 로드 오류:", error);
      this.showError("위임 요청 목록을 불러오는 중 오류가 발생했습니다.");
    }
  }

  // 통계 업데이트
  updateStatistics() {
    const pendingCount = this.delegationRequests.filter(req => req.status === "PENDING").length;
    const approvedCount = this.delegationRequests.filter(req => req.status === "APPROVED").length;
    const rejectedCount = this.delegationRequests.filter(req => req.status === "REJECTED").length;

    document.getElementById("pending-count").textContent = pendingCount;
    document.getElementById("approved-count").textContent = approvedCount;
    document.getElementById("rejected-count").textContent = rejectedCount;
  }

  // 위임 요청 목록 렌더링
  renderDelegationRequests() {
    const container = document.getElementById("delegation-request-list");
    if (!container) return;

    // 필터링
    let filteredRequests = this.delegationRequests;
    if (this.currentFilter !== "ALL") {
      filteredRequests = this.delegationRequests.filter(req => req.status === this.currentFilter);
    }

    if (filteredRequests.length === 0) {
      container.innerHTML = `
        <div class="text-center py-8 text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
          </svg>
          <p class="text-sm">위임 요청이 없습니다.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = "";
    filteredRequests.forEach(request => {
      const requestCard = this.createRequestCard(request);
      container.appendChild(requestCard);
    });
  }

  // 요청 카드 생성
  createRequestCard(request) {
    const card = document.createElement("div");
    card.className = "bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow";

    const statusInfo = this.getStatusInfo(request.status);
    const offer = request.offer || {};

    card.innerHTML = `
      <div class="flex justify-between items-start mb-3">
        <div class="flex-1">
          <h3 class="font-semibold text-gray-800 text-sm mb-1">
            ${request.propertyTitle || "매물 정보"}
          </h3>
          <p class="text-xs text-gray-600 mb-2">
            ${request.propertyAddress || "주소 정보 없음"}
          </p>
        </div>
        <span class="px-2 py-1 text-xs rounded-full ${statusInfo.bgColor} ${statusInfo.textColor}">
          ${statusInfo.label}
        </span>
      </div>

      <div class="space-y-2 mb-3">
        <div class="flex justify-between text-xs">
          <span class="text-gray-500">신청자:</span>
          <span class="text-gray-800">${request.ownerName || "정보 없음"}</span>
        </div>
        <div class="flex justify-between text-xs">
          <span class="text-gray-500">거래 유형:</span>
          <span class="text-gray-800">${this.getTransactionTypeLabel(offer.type)}</span>
        </div>
        <div class="flex justify-between text-xs">
          <span class="text-gray-500">주거 형태:</span>
          <span class="text-gray-800">${this.getHouseTypeLabel(offer.housetype)}</span>
        </div>
        <div class="flex justify-between text-xs">
          <span class="text-gray-500">가격:</span>
          <span class="text-gray-800">${this.formatPrice(offer)}</span>
        </div>
        ${request.status === "REJECTED" && request.rejectionReason ? `
          <div class="text-xs">
            <span class="text-gray-500">거절 사유:</span>
            <p class="text-red-600 mt-1">${request.rejectionReason}</p>
          </div>
        ` : ""}
      </div>

      ${request.status === "PENDING" ? `
        <div class="flex gap-2">
          <button
            onclick="brokerDelegation.rejectRequest(${request.id})"
            class="flex-1 px-3 py-2 text-xs bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors">
            거절
          </button>
          <button
            onclick="brokerDelegation.approveRequest(${request.id})"
            class="flex-1 px-3 py-2 text-xs bg-green-50 text-green-600 rounded-md hover:bg-green-100 transition-colors">
            승인
          </button>
        </div>
      ` : ""}

      <div class="mt-2 pt-2 border-t">
        <button
          onclick="brokerDelegation.viewRequestDetail(${request.id})"
          class="w-full px-3 py-2 text-xs bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors">
          상세보기
        </button>
      </div>
    `;

    return card;
  }

  // 상태 정보 가져오기
  getStatusInfo(status) {
    switch (status) {
      case "PENDING":
        return {
          label: "대기 중",
          bgColor: "bg-orange-100",
          textColor: "text-orange-700"
        };
      case "APPROVED":
        return {
          label: "승인됨",
          bgColor: "bg-green-100",
          textColor: "text-green-700"
        };
      case "REJECTED":
        return {
          label: "거절됨",
          bgColor: "bg-red-100",
          textColor: "text-red-700"
        };
      default:
        return {
          label: "알 수 없음",
          bgColor: "bg-gray-100",
          textColor: "text-gray-700"
        };
    }
  }

  // 거래 유형 라벨
  getTransactionTypeLabel(type) {
    switch (type) {
      case "SALE": return "매매";
      case "JEONSE": return "전세";
      case "WOLSE": return "월세";
      default: return "정보 없음";
    }
  }

  // 주거 형태 라벨
  getHouseTypeLabel(type) {
    switch (type) {
      case "APART": return "아파트";
      case "BILLA": return "빌라";
      case "ONE": return "원룸";
      default: return "정보 없음";
    }
  }

  // 가격 포맷
  formatPrice(offer) {
    if (!offer) return "정보 없음";

    if (offer.type === "SALE" && offer.totalPrice) {
      return `${offer.totalPrice.toLocaleString()}만원`;
    } else if (offer.type === "JEONSE" && offer.deposit) {
      return `전세 ${offer.deposit.toLocaleString()}만원`;
    } else if (offer.type === "WOLSE" && offer.deposit && offer.monthlyRent) {
      return `보증금 ${offer.deposit.toLocaleString()}만원 / 월세 ${offer.monthlyRent.toLocaleString()}만원`;
    }
    return "정보 없음";
  }

  // 요청 승인
  async approveRequest(requestId) {
    if (!confirm("이 요청을 승인하시겠습니까?")) {
      return;
    }

    try {
      const response = await fetch(`/api/delegations/${requestId}/approve`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.getToken()}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        this.showSuccess("요청이 성공적으로 승인되었습니다.");
        this.loadDelegationRequests();
      } else {
        throw new Error("요청 승인에 실패했습니다.");
      }
    } catch (error) {
      console.error("요청 승인 오류:", error);
      this.showError("요청 승인 중 오류가 발생했습니다.");
    }
  }

  // 요청 거절
  async rejectRequest(requestId) {
    const reason = prompt("거절 사유를 입력해주세요:");
    if (!reason) {
      return;
    }

    try {
      const response = await fetch(`/api/delegations/${requestId}/reject`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.getToken()}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ reason })
      });

      if (response.ok) {
        this.showSuccess("요청이 거절되었습니다.");
        this.loadDelegationRequests();
      } else {
        throw new Error("요청 거절에 실패했습니다.");
      }
    } catch (error) {
      console.error("요청 거절 오류:", error);
      this.showError("요청 거절 중 오류가 발생했습니다.");
    }
  }

  // 요청 상세보기
  viewRequestDetail(requestId) {
    const request = this.delegationRequests.find(req => req.id === requestId);
    if (!request) return;

    // 상세 정보 모달 표시 (간단한 alert로 대체)
    alert(`요청 상세 정보:

매물: ${request.propertyTitle || "정보 없음"}
주소: ${request.propertyAddress || "정보 없음"}
신청자: ${request.ownerName || "정보 없음"}
거래 유형: ${this.getTransactionTypeLabel(request.offer?.type)}
상태: ${this.getStatusInfo(request.status).label}
신청일: ${new Date(request.createdAt).toLocaleDateString()}
    `);
  }

  // 토큰 가져오기
  getToken() {
    return localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
  }

  // 성공 메시지 표시
  showSuccess(message) {
    this.showMessage(message, "success");
  }

  // 에러 메시지 표시
  showError(message) {
    this.showMessage(message, "error");
  }

  // 메시지 표시
  showMessage(message, type) {
    const messageDiv = document.createElement("div");
    messageDiv.className = `fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg ${
      type === "success"
        ? "bg-green-100 border border-green-400 text-green-700"
        : "bg-red-100 border border-red-400 text-red-700"
    }`;
    messageDiv.textContent = message;

    document.body.appendChild(messageDiv);

    setTimeout(() => {
      messageDiv.remove();
    }, 5000);
  }
}

// 전역 인스턴스 생성
let brokerDelegation;

// DOM 로드 완료 후 초기화
document.addEventListener("DOMContentLoaded", () => {
  brokerDelegation = new BrokerDelegationManagement();
});