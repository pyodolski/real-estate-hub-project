// 브로커 관리 JavaScript 모듈

class BrokerManagement {
  constructor() {
    this.apiBaseUrl = "/api/brokers";
    this.brokers = [];
    this.currentSearch = "";

    this.init();
  }

  async init() {
    await this.loadBrokers();
    this.setupEventListeners();
  }

  // 브로커 목록 로드
  async loadBrokers(search = "") {
    try {
      const url = search
        ? `${this.apiBaseUrl}/list?search=${encodeURIComponent(search)}`
        : `${this.apiBaseUrl}/list`;

      const response = await fetch(url);

      if (response.ok) {
        this.brokers = await response.json();
        this.renderBrokerList();
      } else {
        throw new Error("브로커 목록을 불러올 수 없습니다.");
      }
    } catch (error) {
      console.error("브로커 목록 로드 실패:", error);
      this.showError("브로커 목록을 불러올 수 없습니다: " + error.message);
    }
  }

  // 브로커 목록 렌더링
  renderBrokerList() {
    const brokerList = document.getElementById("broker-list");
    if (!brokerList) return;

    brokerList.innerHTML = "";

    if (this.brokers.length === 0) {
      brokerList.innerHTML = `
        <div class="text-center py-8 text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
          </svg>
          <p class="text-sm">등록된 브로커가 없습니다.</p>
        </div>
      `;
      return;
    }

    this.brokers.forEach((broker) => {
      const brokerCard = this.createBrokerCard(broker);
      brokerList.appendChild(brokerCard);
    });
  }

  // 브로커 카드 생성
  createBrokerCard(broker) {
    const card = document.createElement("div");
    card.className =
      "bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer";

    // 프로필 이미지 또는 이니셜
    const profileImage = broker.profileImageUrl
      ? `<img src="${broker.profileImageUrl}" alt="${broker.username}" class="w-12 h-12 rounded-full object-cover">`
      : `<div class="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
           ${broker.username.charAt(0)}
         </div>`;

    // 평점 (임시로 4.0-5.0 사이 랜덤값 사용)
    const rating = (4.0 + Math.random()).toFixed(1);

    card.innerHTML = `
      <div class="flex items-start space-x-4">
        ${profileImage}
        <div class="flex-1">
          <div class="flex items-center justify-between mb-2">
            <h3 class="font-semibold text-gray-800">${broker.username}</h3>
            <div class="flex items-center text-yellow-400">
              <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z"/>
              </svg>
              <span class="ml-1 text-sm font-medium text-gray-600">${rating}</span>
            </div>
          </div>
          
          <p class="text-sm text-gray-600 mb-2">
            ${broker.agencyName || "개인 중개사"} • 면허번호: ${
      broker.licenseNumber
    }
          </p>
          
          ${
            broker.intro
              ? `<p class="text-sm text-gray-500 mb-3 line-clamp-2">${broker.intro}</p>`
              : ""
          }
          
          <div class="flex gap-4 text-xs mt-2 mb-3">
            <div>
              <span class="text-gray-500">거래 중:</span>
              <span class="font-semibold text-orange-600">${broker.pendingDeals || 0}건</span>
            </div>
            <div>
              <span class="text-gray-500">거래 완료:</span>
              <span class="font-semibold text-green-600">${broker.totalDeals || 0}건</span>
            </div>
          </div>
          

          
          <div class="flex space-x-2">
            <button onclick="brokerManagement.viewBrokerDetail(${
              broker.userId
            })" 
                    class="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-3 rounded-md transition-colors">
              프로필 보기
            </button>
            <button onclick="brokerManagement.contactBroker(${broker.userId})" 
                    class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm py-2 px-3 rounded-md transition-colors">
              연락하기
            </button>
          </div>
        </div>
      </div>
    `;

    return card;
  }

  // 브로커 상세 정보 보기
  async viewBrokerDetail(userId) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/${userId}`);

      if (response.ok) {
        const broker = await response.json();
        this.showBrokerDetailModal(broker);
      } else {
        throw new Error("브로커 정보를 불러올 수 없습니다.");
      }
    } catch (error) {
      console.error("브로커 상세 정보 로드 실패:", error);
      this.showError("브로커 정보를 불러올 수 없습니다: " + error.message);
    }
  }

  // 브로커 상세 정보 모달
  showBrokerDetailModal(broker) {
    const modal = document.createElement("div");
    modal.id = "broker-detail-modal";
    modal.className =
      "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";

    const profileImage = broker.profileImageUrl
      ? `<img src="${broker.profileImageUrl}" alt="${broker.username}" class="w-24 h-24 rounded-full object-cover mx-auto">`
      : `<div class="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-3xl mx-auto">
           ${broker.username.charAt(0)}
         </div>`;

    const rating = (4.0 + Math.random()).toFixed(1);

    modal.innerHTML = `
      <div class="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold text-gray-800">브로커 프로필</h2>
          <button onclick="brokerManagement.closeModal('broker-detail-modal')" 
                  class="p-2 rounded-full hover:bg-gray-200 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div class="text-center mb-6">
          ${profileImage}
          <h3 class="text-2xl font-bold text-gray-800 mt-4">${
            broker.username
          }</h3>
          <p class="text-gray-600">${broker.agencyName || "개인 중개사"}</p>
          
          <div class="flex items-center justify-center mt-2 text-yellow-400">
            <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z"/>
            </svg>
            <span class="ml-1 text-lg font-medium text-gray-700">${rating}</span>
            <span class="ml-1 text-gray-500">(127개 리뷰)</span>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div class="space-y-4">
            <div>
              <h4 class="font-semibold text-gray-700 mb-2">연락처 정보</h4>
              <div class="space-y-2 text-sm">

                <div class="flex items-center">
                  <svg class="w-4 h-4 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                  </svg>
                  <span>${broker.phoneNumber || "연락처 미등록"}</span>
                </div>
                <div class="flex items-center">
                  <svg class="w-4 h-4 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clip-rule="evenodd"/>
                  </svg>
                  <span>면허번호: ${broker.licenseNumber}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 class="font-semibold text-gray-700 mb-2">거래 실적</h4>
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div class="bg-blue-50 p-3 rounded-lg text-center">
                  <div class="text-2xl font-bold text-blue-600">${
                    broker.totalDeals
                  }</div>
                  <div class="text-gray-600">총 거래</div>
                </div>
                <div class="bg-orange-50 p-3 rounded-lg text-center">
                  <div class="text-2xl font-bold text-orange-600">${
                    broker.pendingDeals
                  }</div>
                  <div class="text-gray-600">진행중</div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 class="font-semibold text-gray-700 mb-2">소개</h4>
            <div class="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
              ${broker.intro || "소개글이 등록되지 않았습니다."}
            </div>
          </div>
        </div>

        <div class="flex gap-3">
          <button onclick="brokerManagement.contactBroker(${broker.userId})" 
                  class="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            연락하기
          </button>
          <button onclick="brokerManagement.closeModal('broker-detail-modal')" 
                  class="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
            닫기
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  }

  // 브로커 연락하기
  contactBroker(userId) {
    // 여기에 연락하기 기능 구현 (채팅, 전화 등)
    this.showSuccess(`브로커에게 연락 요청을 보냈습니다.`);
  }

  // 이벤트 리스너 설정
  setupEventListeners() {
    // 검색 입력 이벤트
    const searchInput = document.getElementById("broker-search-input");
    if (searchInput) {
      let searchTimeout;
      searchInput.addEventListener("input", (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          this.currentSearch = e.target.value.trim();
          this.loadBrokers(this.currentSearch);
        }, 300);
      });
    }
  }

  // 모달 닫기
  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.remove();
    }
  }

  // 메시지 표시
  showSuccess(message) {
    this.showMessage(message, "success");
  }

  showError(message) {
    this.showMessage(message, "error");
  }

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
let brokerManagement;

// DOM 로드 완료 후 초기화
document.addEventListener("DOMContentLoaded", () => {
  brokerManagement = new BrokerManagement();
  window.brokerManagement = brokerManagement; // 전역 접근 가능하도록 설정
});
