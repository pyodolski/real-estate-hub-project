// 내 매물 관리 JavaScript 모듈

class PropertyManagement {
  constructor() {
    this.apiBaseUrl = "/api/ownership";
    this.mapApiBaseUrl = "/api/ownership/map";
    this.accessToken = localStorage.getItem("accessToken");
    this.myProperties = [];
    this.currentUser = null;

    this.init();
  }

  async init() {
    await this.loadCurrentUser();
    await this.loadMyProperties();
    this.setupEventListeners();
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
        this.renderMyProperties();
        this.updatePropertySummary();
      } else {
        throw new Error("매물 목록을 불러올 수 없습니다.");
      }
    } catch (error) {
      console.error("매물 목록 로드 실패:", error);
      this.showError("매물 목록을 불러올 수 없습니다.");
    }
  }

  // 매물 목록 렌더링
  renderMyProperties() {
    const myPropertyList = document.getElementById("my-property-list");
    if (!myPropertyList) return;

    myPropertyList.innerHTML = "";

    if (this.myProperties.length === 0) {
      myPropertyList.innerHTML = `
        <div class="text-center py-8 text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
          </svg>
          <p class="text-sm">등록된 매물이 없습니다.</p>
          <p class="text-xs mt-1">내 매물을 등록해보세요!</p>
        </div>
      `;
      return;
    }

    this.myProperties.forEach((property) => {
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
            property.title || property.buildingName || "매물 정보 없음"
          }</h3>
          <p class="text-xs text-gray-600 mb-2">${
            property.address || property.propertyAddress || "주소 정보 없음"
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
          <span class="text-gray-500">신청자:</span>
          <span class="text-gray-800">${property.applicantName}</span>
        </div>
        <div class="flex justify-between text-xs">
          <span class="text-gray-500">관계:</span>
          <span class="text-gray-800">${property.relationshipToProperty}</span>
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

      <div class="flex gap-2">
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
    `;

    return card;
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

            <div class="flex gap-2">
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
    const modal = this.createNewPropertyModal();
    document.body.appendChild(modal);

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
      "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";

    modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-xl font-bold text-gray-800">내 매물 등록</h2>
                    <button onclick="propertyManagement.closeModal('new-property-modal')" 
                            class="p-2 rounded-full hover:bg-gray-200 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>

                <form id="new-property-form" class="space-y-6">
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

                    <!-- 버튼 -->
                    <div class="flex justify-end gap-3 pt-6 border-t">
                        <button type="button" onclick="propertyManagement.closeModal('new-property-modal')" 
                                class="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors">
                            취소
                        </button>
                        <button type="submit" 
                                class="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
                            등록하기
                        </button>
                    </div>
                </form>
            </div>
        `;

    // 폼 제출 이벤트 리스너
    modal
      .querySelector("#new-property-form")
      .addEventListener("submit", (e) => {
        e.preventDefault();
        this.submitNewProperty();
      });

    // 초기 서류 필드 추가
    setTimeout(() => {
      this.addDocumentField();
    }, 100);

    return modal;
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
          const location = new naver.maps.LatLng(data.latitude, data.longitude);
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
          selectedAddressEl.value = data.roadAddress || data.jibunAddress || "";
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
    formData.append("postalCode", document.getElementById("postal-code").value);

    // 서류 파일들
    const documentTypes = [];
    const documentFiles = [];

    document.querySelectorAll("#document-upload-area > div").forEach((div) => {
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

  // 매물 상세보기
  async viewPropertyDetail(claimId) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/claims/${claimId}`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const property = await response.json();
        this.showPropertyDetailModal(property);
      } else {
        throw new Error("매물 정보를 불러올 수 없습니다.");
      }
    } catch (error) {
      console.error("매물 상세 조회 실패:", error);
      this.showError("매물 정보를 불러올 수 없습니다.");
    }
  }

  // 매물 상세 모달 표시
  showPropertyDetailModal(property) {
    const modal = document.createElement("div");
    modal.id = "property-detail-modal";
    modal.className =
      "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";

    const statusInfo = this.getStatusInfo(property.status);

    modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-xl font-bold text-gray-800">매물 상세 정보</h2>
                    <button onclick="propertyManagement.closeModal('property-detail-modal')" 
                            class="p-2 rounded-full hover:bg-gray-200 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>

                <div class="space-y-6">
                    <!-- 상태 -->
                    <div class="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                        <span class="font-medium text-gray-700">신청 상태</span>
                        <span class="px-3 py-1 rounded-full ${
                          statusInfo.bgColor
                        } ${statusInfo.textColor}">
                            ${statusInfo.label}
                        </span>
                    </div>

                    <!-- 기본 정보 -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">매물 제목</label>
                            <p class="text-gray-900">${
                              property.title || "제목 없음"
                            }</p>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">신청자</label>
                            <p class="text-gray-900">${
                              property.applicantName
                            }</p>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">연락처</label>
                            <p class="text-gray-900">${
                              property.applicantPhone
                            }</p>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">매물과의 관계</label>
                            <p class="text-gray-900">${
                              property.relationshipToProperty
                            }</p>
                        </div>
                    </div>

                    <!-- 위치 정보 -->
                    <div>
                        <h3 class="text-lg font-semibold text-gray-800 mb-3">위치 정보</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">주소</label>
                                <p class="text-gray-900">${
                                  property.propertyAddress ||
                                  property.address ||
                                  "주소 없음"
                                }</p>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">건물명</label>
                                <p class="text-gray-900">${
                                  property.buildingName || "-"
                                }</p>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">상세 주소</label>
                                <p class="text-gray-900">${
                                  property.detailedAddress || "-"
                                }</p>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">우편번호</label>
                                <p class="text-gray-900">${
                                  property.postalCode || "-"
                                }</p>
                            </div>
                        </div>
                    </div>

                    <!-- 추가 정보 -->
                    ${
                      property.additionalInfo
                        ? `
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">추가 설명</label>
                            <p class="text-gray-900 bg-gray-50 p-3 rounded-md">${property.additionalInfo}</p>
                        </div>
                    `
                        : ""
                    }

                    <!-- 거절 사유 -->
                    ${
                      property.rejectionReason
                        ? `
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">거절 사유</label>
                            <p class="text-red-600 bg-red-50 p-3 rounded-md">${property.rejectionReason}</p>
                        </div>
                    `
                        : ""
                    }

                    <!-- 서류 목록 -->
                    ${
                      property.documents && property.documents.length > 0
                        ? `
                        <div>
                            <h3 class="text-lg font-semibold text-gray-800 mb-3">첨부 서류</h3>
                            <div class="space-y-2">
                                ${property.documents
                                  .map(
                                    (doc) => `
                                    <div class="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                                        <div>
                                            <p class="font-medium text-gray-900">${doc.documentType}</p>
                                            <p class="text-sm text-gray-600">${doc.originalFilename}</p>
                                        </div>
                                        <a href="${doc.downloadUrl}" target="_blank" 
                                           class="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
                                            다운로드
                                        </a>
                                    </div>
                                `
                                  )
                                  .join("")}
                            </div>
                        </div>
                    `
                        : ""
                    }

                    <!-- 일정 정보 -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                            <label class="block font-medium mb-1">신청일</label>
                            <p>${new Date(
                              property.createdAt
                            ).toLocaleDateString("ko-KR")}</p>
                        </div>
                        ${
                          property.reviewedAt
                            ? `
                            <div>
                                <label class="block font-medium mb-1">심사 완료일</label>
                                <p>${new Date(
                                  property.reviewedAt
                                ).toLocaleDateString("ko-KR")}</p>
                            </div>
                        `
                            : ""
                        }
                    </div>
                </div>

                <div class="flex justify-end mt-6 pt-6 border-t">
                    <button onclick="propertyManagement.closeModal('property-detail-modal')" 
                            class="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors">
                        닫기
                    </button>
                </div>
            </div>
        `;

    document.body.appendChild(modal);
  }

  // 서류 보기
  viewDocuments(claimId) {
    const property = this.myProperties.find((p) => p.claimId === claimId);
    if (property && property.documents) {
      this.showDocumentsModal(property.documents);
    }
  }

  // 서류 모달 표시
  showDocumentsModal(documents) {
    const modal = document.createElement("div");
    modal.id = "documents-modal";
    modal.className =
      "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";

    modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-xl font-bold text-gray-800">첨부 서류</h2>
                    <button onclick="propertyManagement.closeModal('documents-modal')" 
                            class="p-2 rounded-full hover:bg-gray-200 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>

                <div class="space-y-3">
                    ${documents
                      .map(
                        (doc) => `
                        <div class="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
                            <div class="flex-1">
                                <h3 class="font-medium text-gray-900">${
                                  doc.documentType
                                }</h3>
                                <p class="text-sm text-gray-600">${
                                  doc.originalFilename
                                }</p>
                                <p class="text-xs text-gray-500">
                                    ${(doc.fileSize / 1024 / 1024).toFixed(
                                      2
                                    )} MB • 
                                    ${new Date(
                                      doc.uploadedAt
                                    ).toLocaleDateString("ko-KR")}
                                </p>
                            </div>
                            <a href="${doc.downloadUrl}" target="_blank" 
                               class="ml-4 px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
                                다운로드
                            </a>
                        </div>
                    `
                      )
                      .join("")}
                </div>

                <div class="flex justify-end mt-6 pt-6 border-t">
                    <button onclick="propertyManagement.closeModal('documents-modal')" 
                            class="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors">
                        닫기
                    </button>
                </div>
            </div>
        `;

    document.body.appendChild(modal);
  }

  // 매물 수정
  editProperty(claimId) {
    // 수정 기능은 PENDING 상태일 때만 가능
    const property = this.myProperties.find((p) => p.claimId === claimId);
    if (property && property.status === "PENDING") {
      this.showEditPropertyModal(property);
    } else {
      this.showError("심사 중인 매물만 수정할 수 있습니다.");
    }
  }

  // 매물 수정 모달 (새 등록 모달과 유사하지만 기존 데이터로 채워짐)
  showEditPropertyModal(property) {
    // 구현 생략 (새 등록 모달과 유사한 구조)
    this.showInfo("수정 기능은 추후 구현 예정입니다.");
  }

  // 모달 닫기
  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.remove();
    }
  }

  // 성공 메시지 표시
  showSuccess(message) {
    this.showToast(message, "success");
  }

  // 에러 메시지 표시
  showError(message) {
    this.showToast(message, "error");
  }

  // 정보 메시지 표시
  showInfo(message) {
    this.showToast(message, "info");
  }

  // 토스트 메시지 표시
  showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white max-w-sm ${
      type === "success"
        ? "bg-green-500"
        : type === "error"
        ? "bg-red-500"
        : "bg-blue-500"
    }`;
    toast.textContent = message;

    document.body.appendChild(toast);

    // 3초 후 자동 제거
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  // 새 매물 등록 모달 표시
  showNewPropertyModal() {
    console.log("showNewPropertyModal 호출됨");
    const modal = this.createNewPropertyModal();
    document.body.appendChild(modal);

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
      "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";

    modal.innerHTML = `
      <div class="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold text-gray-800">내 매물 등록 신청</h2>
          <button onclick="propertyManagement.closeModal('new-property-modal')" 
                  class="p-2 rounded-full hover:bg-gray-200 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <form id="new-property-form" class="space-y-6">
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
                     value="${this.currentUser?.phoneNumber || ""}"
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

          <!-- 버튼 -->
          <div class="flex justify-end gap-3 pt-6 border-t">
            <button type="button" onclick="propertyManagement.closeModal('new-property-modal')" 
                    class="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors">
              취소
            </button>
            <button type="submit" 
                    class="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
              등록 신청
            </button>
          </div>
        </form>
      </div>
    `;

    // 폼 제출 이벤트 리스너
    modal
      .querySelector("#new-property-form")
      .addEventListener("submit", (e) => {
        e.preventDefault();
        this.submitNewProperty();
      });

    // 초기 서류 필드 추가
    setTimeout(() => {
      this.addDocumentField();
      // 연락처 검증 설정
      const phoneInput = modal.querySelector("#applicant-phone");
      if (phoneInput) {
        this.setupPhoneValidation(phoneInput);
      }
    }, 100);

    return modal;
  }

  // 서류 업로드 필드 추가
  addDocumentField() {
    const uploadArea = document.getElementById("document-upload-area");
    if (!uploadArea) return;

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
    if (typeof naver === "undefined" || !naver.maps) {
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

        if (
          typeof naver !== "undefined" &&
          this.propertyMap &&
          this.propertyMarker
        ) {
          const location = new naver.maps.LatLng(data.latitude, data.longitude);
          this.propertyMap.setCenter(location);
          this.propertyMarker.setPosition(location);
        }

        this.reverseGeocode(data.latitude, data.longitude);
      } else {
        throw new Error("주소를 찾을 수 없습니다.");
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

        const selectedAddressEl = document.getElementById("selected-address");
        const buildingNameEl = document.getElementById("building-name");
        const postalCodeEl = document.getElementById("postal-code");
        const locationXEl = document.getElementById("location-x");
        const locationYEl = document.getElementById("location-y");

        if (selectedAddressEl)
          selectedAddressEl.value = data.roadAddress || data.jibunAddress || "";
        if (buildingNameEl && !buildingNameEl.value)
          buildingNameEl.value = data.buildingName || "";
        if (postalCodeEl) postalCodeEl.value = data.postalCode || "";
        if (locationXEl) locationXEl.value = lng;
        if (locationYEl) locationYEl.value = lat;
      }
    } catch (error) {
      console.error("역지오코딩 실패:", error);
    }
  }

  // 새 매물 등록 제출
  async submitNewProperty() {
    const formData = new FormData();

    // 기본 정보
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
    formData.append("postalCode", document.getElementById("postal-code").value);

    // 서류 파일들
    const documentTypes = [];
    const documentFiles = [];

    document.querySelectorAll("#document-upload-area > div").forEach((div) => {
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

    // 연락처 형식 검증
    const phoneNumber = document.getElementById("applicant-phone").value;
    if (!this.validatePhoneNumber(phoneNumber)) {
      this.showError("올바른 연락처 형식을 입력해주세요.");
      return;
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
        this.showSuccess(
          "매물 소유권 신청이 완료되었습니다. 관리자 승인 후 매물이 등록됩니다."
        );
        this.closeModal("new-property-modal");
        await this.loadMyProperties();
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

  // 모달 닫기
  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.remove();
    }
  }

  // 연락처 형식 검증
  validatePhoneNumber(phoneNumber) {
    // 한국 휴대폰 번호 형식: 010-1234-5678, 01012345678, 010 1234 5678
    const phoneRegex = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/;
    return phoneRegex.test(phoneNumber.replace(/\s/g, ""));
  }

  // 실시간 연락처 검증 및 포맷팅
  setupPhoneValidation(inputElement) {
    if (!inputElement) return;

    inputElement.addEventListener("input", (e) => {
      let value = e.target.value.replace(/[^0-9]/g, "");

      // 자동 하이픈 추가
      if (value.length >= 3) {
        if (value.length <= 7) {
          value = value.replace(/(\d{3})(\d{1,4})/, "$1-$2");
        } else {
          value = value.replace(/(\d{3})(\d{4})(\d{1,4})/, "$1-$2-$3");
        }
      }

      e.target.value = value;

      // 검증 결과 표시
      const isValid = this.validatePhoneNumber(value);
      const errorElement = e.target.parentElement.querySelector(".phone-error");

      if (value.length > 0 && !isValid) {
        if (!errorElement) {
          const error = document.createElement("div");
          error.className = "phone-error text-xs text-red-500 mt-1";
          error.textContent =
            "올바른 휴대폰 번호 형식이 아닙니다. (예: 010-1234-5678)";
          e.target.parentElement.appendChild(error);
        }
        e.target.classList.add("border-red-500");
      } else {
        if (errorElement) {
          errorElement.remove();
        }
        e.target.classList.remove("border-red-500");
      }
    });
  }

  // 매물 상세보기
  async viewPropertyDetail(claimId) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/claims/${claimId}`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const property = await response.json();
        this.showPropertyDetailModal(property);
      } else {
        throw new Error("매물 정보를 불러올 수 없습니다.");
      }
    } catch (error) {
      console.error("매물 상세 조회 실패:", error);
      this.showError("매물 정보를 불러올 수 없습니다.");
    }
  }

  // 매물 수정
  async editProperty(claimId) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/claims/${claimId}`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const property = await response.json();
        this.showEditPropertyModal(property);
      } else {
        throw new Error("매물 정보를 불러올 수 없습니다.");
      }
    } catch (error) {
      console.error("매물 정보 조회 실패:", error);
      this.showError("매물 정보를 불러올 수 없습니다.");
    }
  }

  // 서류 보기
  async viewDocuments(claimId) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/claims/${claimId}`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const property = await response.json();
        this.showDocumentsModal(property);
      } else {
        throw new Error("서류 정보를 불러올 수 없습니다.");
      }
    } catch (error) {
      console.error("서류 조회 실패:", error);
      this.showError("서류 정보를 불러올 수 없습니다.");
    }
  }

  // 매물 상세보기 모달
  showPropertyDetailModal(property) {
    const modal = document.createElement("div");
    modal.id = "property-detail-modal";
    modal.className =
      "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";

    const statusInfo = this.getStatusInfo(property.status);
    const daysLeft = this.calculateDaysLeft(
      property.createdAt,
      property.deadline
    );

    modal.innerHTML = `
      <div class="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold text-gray-800">매물 상세 정보</h2>
          <button onclick="propertyManagement.closeModal('property-detail-modal')" 
                  class="p-2 rounded-full hover:bg-gray-200 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div class="space-y-6">
          <!-- 상태 정보 -->
          <div class="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 class="font-semibold text-gray-800">${
                property.title || property.buildingName || "매물 정보 없음"
              }</h3>
              <p class="text-sm text-gray-600">${
                property.address || property.propertyAddress || "주소 정보 없음"
              }</p>
            </div>
            <span class="px-3 py-1 text-sm rounded-full ${statusInfo.bgColor} ${
      statusInfo.textColor
    }">
              ${statusInfo.label}
            </span>
          </div>

          <!-- 신청자 정보 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">신청자 이름</label>
              <p class="text-gray-800">${property.applicantName}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">연락처</label>
              <p class="text-gray-800">${property.applicantPhone}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">매물과의 관계</label>
              <p class="text-gray-800">${property.relationshipToProperty}</p>
            </div>
            ${
              property.status === "PENDING"
                ? `
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">심사 마감</label>
              <p class="text-red-600 font-medium">${daysLeft}</p>
            </div>
            `
                : ""
            }
          </div>

          <!-- 첨부 서류 -->
          ${
            property.documents && property.documents.length > 0
              ? `
          <div class="border-t pt-4">
            <h4 class="font-semibold text-gray-800 mb-3">첨부 서류</h4>
            <div class="space-y-2">
              ${property.documents
                .map(
                  (doc) => `
                <div class="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                  <div>
                    <p class="font-medium text-gray-800">${doc.documentType}</p>
                    <p class="text-sm text-gray-600">${doc.originalFilename}</p>
                    <p class="text-xs text-gray-500">${this.formatFileSize(
                      doc.fileSize
                    )} • ${this.formatDate(doc.uploadedAt)}</p>
                  </div>
                  <a href="${doc.downloadUrl}" target="_blank" 
                     class="px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors">
                    다운로드
                  </a>
                </div>
              `
                )
                .join("")}
            </div>
          </div>
          `
              : ""
          }

          ${
            property.rejectionReason
              ? `
          <div class="border-t pt-4">
            <h4 class="font-semibold text-red-600 mb-3">거절 사유</h4>
            <p class="text-red-700 bg-red-50 p-3 rounded-md">${property.rejectionReason}</p>
          </div>
          `
              : ""
          }
        </div>

        <!-- 버튼 -->
        <div class="flex justify-end gap-3 pt-6 border-t mt-6">
          <button onclick="propertyManagement.closeModal('property-detail-modal')" 
                  class="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors">
            닫기
          </button>
          ${
            property.status === "PENDING"
              ? `
          <button onclick="propertyManagement.closeModal('property-detail-modal'); propertyManagement.editProperty(${property.claimId})" 
                  class="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
            수정하기
          </button>
          `
              : ""
          }
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  }

  // 서류 보기 모달
  showDocumentsModal(property) {
    const modal = document.createElement("div");
    modal.id = "documents-modal";
    modal.className =
      "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";

    modal.innerHTML = `
      <div class="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold text-gray-800">첨부 서류</h2>
          <button onclick="propertyManagement.closeModal('documents-modal')" 
                  class="p-2 rounded-full hover:bg-gray-200 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div class="space-y-4">
          ${
            property.documents && property.documents.length > 0
              ? property.documents
                  .map(
                    (doc) => `
              <div class="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
                <div class="flex-1">
                  <h3 class="font-semibold text-gray-800">${
                    doc.documentType
                  }</h3>
                  <p class="text-sm text-gray-600 mt-1">${
                    doc.originalFilename
                  }</p>
                  <div class="flex gap-4 text-xs text-gray-500 mt-2">
                    <span>크기: ${this.formatFileSize(doc.fileSize)}</span>
                    <span>업로드: ${this.formatDate(doc.uploadedAt)}</span>
                  </div>
                </div>
                <a href="${doc.downloadUrl}" target="_blank" 
                   class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
                  다운로드
                </a>
              </div>
            `
                  )
                  .join("")
              : `<div class="text-center py-8 text-gray-500">
              <p>첨부된 서류가 없습니다.</p>
            </div>`
          }
        </div>

        <div class="flex justify-end pt-6 border-t mt-6">
          <button onclick="propertyManagement.closeModal('documents-modal')" 
                  class="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors">
            닫기
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  }

  // 매물 수정 모달
  showEditPropertyModal(property) {
    const modal = document.createElement("div");
    modal.id = "edit-property-modal";
    modal.className =
      "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";

    modal.innerHTML = `
      <div class="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold text-gray-800">매물 정보 수정</h2>
          <button onclick="propertyManagement.closeModal('edit-property-modal')" 
                  class="p-2 rounded-full hover:bg-gray-200 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <form id="edit-property-form" class="space-y-6">
          <input type="hidden" id="edit-claim-id" value="${property.claimId}">
          
          <!-- 기본 정보 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">신청자 이름 *</label>
              <input type="text" id="edit-applicant-name" required value="${
                property.applicantName || ""
              }"
                     class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">연락처 *</label>
              <input type="tel" id="edit-applicant-phone" required value="${
                property.applicantPhone || ""
              }"
                     class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">매물과의 관계 *</label>
            <select id="edit-relationship-to-property" required 
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">선택해주세요</option>
              <option value="소유자" ${
                property.relationshipToProperty === "소유자" ? "selected" : ""
              }>소유자</option>
              <option value="임차인" ${
                property.relationshipToProperty === "임차인" ? "selected" : ""
              }>임차인</option>
              <option value="상속인" ${
                property.relationshipToProperty === "상속인" ? "selected" : ""
              }>상속인</option>
              <option value="공동소유자" ${
                property.relationshipToProperty === "공동소유자"
                  ? "selected"
                  : ""
              }>공동소유자</option>
              <option value="기타" ${
                property.relationshipToProperty === "기타" ? "selected" : ""
              }>기타</option>
            </select>
          </div>

          <!-- 위치 정보 -->
          <div class="border-t pt-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">위치 정보</h3>
            
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">주소 검색</label>
              <div class="flex gap-2">
                <input type="text" id="edit-address-search" placeholder="예: 강남역, 홍대, 대구 남구, 부산 해운대"
                       class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <button type="button" onclick="propertyManagement.searchAddressForEdit()" 
                        class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
                  검색
                </button>
              </div>
            </div>

            <!-- 지도 -->
            <div class="mb-4">
              <div id="edit-property-map" class="w-full h-64 border border-gray-300 rounded-md"></div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">선택된 주소</label>
                <input type="text" id="edit-selected-address" readonly value="${
                  property.propertyAddress || ""
                }"
                       class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">건물명</label>
                <input type="text" id="edit-building-name" value="${
                  property.buildingName || ""
                }"
                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">상세 주소</label>
                <input type="text" id="edit-detailed-address" placeholder="동, 호수 등" value="${
                  property.detailedAddress || ""
                }"
                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">우편번호</label>
                <input type="text" id="edit-postal-code" readonly value="${
                  property.postalCode || ""
                }"
                       class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
              </div>
            </div>

            <!-- 숨겨진 좌표 필드 -->
            <input type="hidden" id="edit-location-x" value="${
              property.locationX || ""
            }">
            <input type="hidden" id="edit-location-y" value="${
              property.locationY || ""
            }">
          </div>

          <!-- 서류 업로드 -->
          <div class="border-t pt-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">서류 업로드 (새로 업로드시 기존 서류 대체)</h3>
            <div id="edit-document-upload-area" class="space-y-4">
              <!-- JavaScript로 동적 생성 -->
            </div>
            <button type="button" onclick="propertyManagement.addEditDocumentField()" 
                    class="mt-4 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors">
              + 서류 추가
            </button>
          </div>

          <!-- 추가 정보 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">추가 설명</label>
            <textarea id="edit-additional-info" rows="3" 
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="매물에 대한 추가 설명이나 특이사항을 입력해주세요">${
                        property.additionalInfo || ""
                      }</textarea>
          </div>

          <!-- 버튼 -->
          <div class="flex justify-end gap-3 pt-6 border-t">
            <button type="button" onclick="propertyManagement.closeModal('edit-property-modal')" 
                    class="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors">
              취소
            </button>
            <button type="submit" 
                    class="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
              수정하기
            </button>
          </div>
        </form>
      </div>
    `;

    // 폼 제출 이벤트 리스너
    modal
      .querySelector("#edit-property-form")
      .addEventListener("submit", (e) => {
        e.preventDefault();
        this.submitEditProperty();
      });

    document.body.appendChild(modal);

    // 지도 초기화
    setTimeout(() => {
      this.initializeEditMap(property);
      // 연락처 검증 설정
      const phoneInput = modal.querySelector("#edit-applicant-phone");
      if (phoneInput) {
        this.setupPhoneValidation(phoneInput);
      }
    }, 100);
  }

  // 수정용 서류 필드 추가
  addEditDocumentField() {
    const uploadArea = document.getElementById("edit-document-upload-area");
    if (!uploadArea) return;

    const fieldDiv = document.createElement("div");
    fieldDiv.className = "flex gap-4 items-end";

    fieldDiv.innerHTML = `
      <div class="flex-1">
        <label class="block text-sm font-medium text-gray-700 mb-2">서류 종류</label>
        <select class="edit-document-type w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
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
        <input type="file" class="edit-document-file w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
               accept=".pdf,.jpg,.jpeg,.png,.doc,.docx">
      </div>
      <button type="button" onclick="this.parentElement.remove()" 
              class="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors">
        삭제
      </button>
    `;

    uploadArea.appendChild(fieldDiv);
  }

  // 수정용 지도 초기화
  initializeEditMap(property) {
    if (typeof naver === "undefined" || !naver.maps) {
      console.error("네이버 지도 API가 로드되지 않았습니다.");
      return;
    }

    const mapContainer = document.getElementById("edit-property-map");
    if (!mapContainer) return;

    try {
      // 기존 위치가 있으면 사용, 없으면 기본 위치
      let defaultLocation;
      if (property.locationY && property.locationX) {
        defaultLocation = new naver.maps.LatLng(
          property.locationY,
          property.locationX
        );
      } else {
        defaultLocation = new naver.maps.LatLng(35.8242, 128.5782);
      }

      this.editPropertyMap = new naver.maps.Map(mapContainer, {
        center: defaultLocation,
        zoom: 15,
        mapTypeControl: true,
      });

      this.editPropertyMarker = new naver.maps.Marker({
        position: defaultLocation,
        map: this.editPropertyMap,
        draggable: true,
      });

      // 지도 클릭 이벤트
      naver.maps.Event.addListener(this.editPropertyMap, "click", (e) => {
        this.editPropertyMarker.setPosition(e.coord);
        this.reverseGeocodeForEdit(e.coord.lat(), e.coord.lng());
      });

      // 마커 드래그 이벤트
      naver.maps.Event.addListener(this.editPropertyMarker, "dragend", (e) => {
        this.reverseGeocodeForEdit(e.coord.lat(), e.coord.lng());
      });
    } catch (error) {
      console.error("수정용 지도 초기화 실패:", error);
    }
  }

  // 수정용 주소 검색
  async searchAddressForEdit() {
    const addressInput = document.getElementById("edit-address-search");
    const address = addressInput.value.trim();

    if (!address) {
      this.showError("주소를 입력해주세요.");
      return;
    }

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

        if (
          typeof naver !== "undefined" &&
          this.editPropertyMap &&
          this.editPropertyMarker
        ) {
          const location = new naver.maps.LatLng(data.latitude, data.longitude);
          this.editPropertyMap.setCenter(location);
          this.editPropertyMarker.setPosition(location);
        }

        this.reverseGeocodeForEdit(data.latitude, data.longitude);
      } else {
        throw new Error("주소를 찾을 수 없습니다.");
      }
    } catch (error) {
      console.error("주소 검색 실패:", error);
      this.showError("주소 검색에 실패했습니다: " + error.message);
    }
  }

  // 수정용 역지오코딩
  async reverseGeocodeForEdit(lat, lng) {
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

        const selectedAddressEl = document.getElementById(
          "edit-selected-address"
        );
        const buildingNameEl = document.getElementById("edit-building-name");
        const postalCodeEl = document.getElementById("edit-postal-code");
        const locationXEl = document.getElementById("edit-location-x");
        const locationYEl = document.getElementById("edit-location-y");

        if (selectedAddressEl)
          selectedAddressEl.value = data.roadAddress || data.jibunAddress || "";
        if (buildingNameEl && !buildingNameEl.value)
          buildingNameEl.value = data.buildingName || "";
        if (postalCodeEl) postalCodeEl.value = data.postalCode || "";
        if (locationXEl) locationXEl.value = lng;
        if (locationYEl) locationYEl.value = lat;
      }
    } catch (error) {
      console.error("역지오코딩 실패:", error);
    }
  }

  // 매물 수정 제출
  async submitEditProperty() {
    const claimId = document.getElementById("edit-claim-id").value;
    const formData = new FormData();

    // 기본 정보
    formData.append(
      "applicantName",
      document.getElementById("edit-applicant-name").value
    );
    formData.append(
      "applicantPhone",
      document.getElementById("edit-applicant-phone").value
    );
    formData.append(
      "relationshipToProperty",
      document.getElementById("edit-relationship-to-property").value
    );
    formData.append(
      "additionalInfo",
      document.getElementById("edit-additional-info").value
    );

    // 위치 정보
    formData.append(
      "propertyAddress",
      document.getElementById("edit-selected-address").value
    );
    formData.append(
      "locationX",
      document.getElementById("edit-location-x").value
    );
    formData.append(
      "locationY",
      document.getElementById("edit-location-y").value
    );
    formData.append(
      "buildingName",
      document.getElementById("edit-building-name").value
    );
    formData.append(
      "detailedAddress",
      document.getElementById("edit-detailed-address").value
    );
    formData.append(
      "postalCode",
      document.getElementById("edit-postal-code").value
    );

    // 서류 파일들 (새로 업로드된 것만)
    const documentTypes = [];
    const documentFiles = [];

    document
      .querySelectorAll("#edit-document-upload-area > div")
      .forEach((div) => {
        const typeSelect = div.querySelector(".edit-document-type");
        const fileInput = div.querySelector(".edit-document-file");

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
      { id: "edit-applicant-name", name: "신청자 이름" },
      { id: "edit-applicant-phone", name: "연락처" },
      { id: "edit-relationship-to-property", name: "매물과의 관계" },
    ];

    for (const field of requiredFields) {
      const element = document.getElementById(field.id);
      if (!element || !element.value.trim()) {
        this.showError(`${field.name}을(를) 입력해주세요.`);
        return;
      }
    }

    // 연락처 형식 검증
    const phoneNumber = document.getElementById("edit-applicant-phone").value;
    if (!this.validatePhoneNumber(phoneNumber)) {
      this.showError("올바른 연락처 형식을 입력해주세요.");
      return;
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/claims/${claimId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
        body: formData,
      });

      if (response.ok) {
        this.showSuccess("매물 정보가 성공적으로 수정되었습니다.");
        this.closeModal("edit-property-modal");
        await this.loadMyProperties();
      } else {
        const errorText = await response.text();
        let errorMessage = "수정에 실패했습니다.";

        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorMessage;
        } catch (e) {
          errorMessage = errorText || errorMessage;
        }

        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("매물 수정 실패:", error);
      this.showError("매물 수정에 실패했습니다: " + error.message);
    }
  }

  // 유틸리티 메서드들
  formatFileSize(bytes) {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  formatDate(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
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

  // 서류 보기 모달 표시
  async viewDocuments(claimId) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/claims/${claimId}`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const claim = await response.json();
        this.showDocumentsModal(claim);
      } else {
        throw new Error("서류 정보를 불러올 수 없습니다.");
      }
    } catch (error) {
      console.error("서류 조회 실패:", error);
      this.showError("서류 정보를 불러올 수 없습니다: " + error.message);
    }
  }

  // 서류 모달 생성
  showDocumentsModal(claim) {
    const modal = document.createElement("div");
    modal.id = "documents-modal";
    modal.className =
      "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";

    const documentsHtml =
      claim.documents && claim.documents.length > 0
        ? claim.documents
            .map(
              (doc) => `
          <div class="flex items-center justify-between p-3 border border-gray-200 rounded-md">
            <div class="flex-1">
              <div class="font-medium text-gray-800">${
                doc.originalFilename
              }</div>
              <div class="text-sm text-gray-500">
                ${this.formatFileSize(doc.fileSize)} • ${this.formatDate(
                doc.uploadedAt
              )}
              </div>
            </div>
            <button onclick="propertyManagement.downloadDocument(${
              doc.documentId
            })" 
                    class="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm">
              다운로드
            </button>
          </div>
        `
            )
            .join("")
        : '<div class="text-center py-8 text-gray-500">업로드된 서류가 없습니다.</div>';

    modal.innerHTML = `
      <div class="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold text-gray-800">업로드된 서류</h2>
          <button onclick="propertyManagement.closeModal('documents-modal')" 
                  class="p-2 rounded-full hover:bg-gray-200 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div class="mb-4">
          <div class="text-sm text-gray-600 mb-2">
            <strong>매물:</strong> ${
              claim.buildingName || claim.propertyAddress || "정보 없음"
            }
          </div>
          <div class="text-sm text-gray-600 mb-4">
            <strong>신청자:</strong> ${claim.applicantName}
          </div>
        </div>

        <div class="space-y-3">
          ${documentsHtml}
        </div>

        <div class="flex justify-end mt-6">
          <button onclick="propertyManagement.closeModal('documents-modal')" 
                  class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors">
            닫기
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  }

  // 파일 다운로드
  async downloadDocument(documentId) {
    try {
      const response = await fetch(
        `${this.apiBaseUrl}/documents/${documentId}/download`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const contentDisposition = response.headers.get("Content-Disposition");
        let filename = "document";

        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(
            /filename\*=UTF-8''(.+)/
          );
          if (filenameMatch) {
            filename = decodeURIComponent(filenameMatch[1]);
          }
        }

        // 파일 다운로드
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        this.showSuccess("파일 다운로드가 완료되었습니다.");
      } else {
        const errorText = await response.text();
        throw new Error(errorText || "파일 다운로드에 실패했습니다.");
      }
    } catch (error) {
      console.error("파일 다운로드 실패:", error);
      this.showError("파일 다운로드에 실패했습니다: " + error.message);
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
let propertyManagement;

// DOM 로드 완료 후 초기화
document.addEventListener("DOMContentLoaded", () => {
  propertyManagement = new PropertyManagement();
});
