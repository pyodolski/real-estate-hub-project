// 관리자용 매물 등록 요청 관리 JavaScript 모듈

class AdminPropertyManagement {
  constructor() {
    this.apiBaseUrl = "/api/ownership";
    this.accessToken = localStorage.getItem("accessToken");
    this.claims = [];
    this.filteredClaims = [];
    this.currentUser = null;
    this.currentRejectClaimId = null;

    this.init();
  }

  async init() {
    await this.loadCurrentUser();
    await this.loadAllClaims();
    this.setupEventListeners();
    this.updateStatistics();
  }

  // 현재 사용자 정보 로드 (관리자 권한 확인)
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
        if (this.currentUser.roleId !== "admin") {
          alert("관리자 권한이 필요합니다.");
          window.location.href = "/";
          return;
        }
        // 관리자 이름 표시
        const adminNameElement = document.getElementById("admin-name");
        if (adminNameElement) {
          adminNameElement.textContent = `${this.currentUser.name} (관리자)`;
        }
      } else {
        throw new Error("사용자 정보를 불러올 수 없습니다.");
      }
    } catch (error) {
      console.error("사용자 정보 로드 실패:", error);
      alert("로그인이 필요합니다.");
      window.location.href = "/";
    }
  }

  // 모든 매물 등록 요청 로드
  async loadAllClaims() {
    try {
      this.showLoading(true);
      const response = await fetch(`${this.apiBaseUrl}/admin/claims`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        this.claims = await response.json();
        this.filteredClaims = [...this.claims];
        this.renderClaimsList();
        this.updateStatistics();
      } else {
        throw new Error("매물 등록 요청 목록을 불러올 수 없습니다.");
      }
    } catch (error) {
      console.error("매물 등록 요청 로드 실패:", error);
      this.showError("매물 등록 요청 목록을 불러올 수 없습니다.");
    } finally {
      this.showLoading(false);
    }
  }

  // 매물 등록 요청 목록 렌더링
  renderClaimsList() {
    const container = document.getElementById("request-list-container");
    if (!container) return;

    if (this.filteredClaims.length === 0) {
      container.innerHTML = `
                <div class="text-center py-8">
                    <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 class="mt-2 text-sm font-medium text-gray-900">매물 등록 요청이 없습니다</h3>
                    <p class="mt-1 text-sm text-gray-500">조건에 맞는 매물 등록 요청이 없습니다.</p>
                </div>
            `;
      return;
    }

    container.innerHTML = this.filteredClaims
      .map((claim, index) => this.createClaimItem(claim, index))
      .join("");
  }

  // 매물 등록 요청 항목 생성
  createClaimItem(claim, index) {
    const detailsId = `details-${claim.claimId}`;
    const statusInfo = this.getStatusInfo(claim.status);

    return `
            <div class="border border-gray-200 rounded-lg transition-shadow hover:shadow-md">
                <div class="p-6">
                    <div class="flex items-start justify-between">
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center space-x-3">
                                <div class="flex-shrink-0">
                                    <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                        <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                        </svg>
                                    </div>
                                </div>
                                <div class="flex-1 min-w-0">
                                    <p class="text-lg font-semibold text-gray-900 truncate">${
                                      claim.applicantName
                                    }</p>
                                    <p class="text-sm text-gray-500">${
                                      claim.applicantPhone
                                    } • ${claim.relationshipToProperty}</p>
                                </div>
                                <div class="flex-shrink-0">
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      statusInfo.bgColor
                                    } ${statusInfo.textColor}">
                                        ${statusInfo.label}
                                    </span>
                                </div>
                            </div>
                            
                            <div class="mt-4">
                                <h3 class="text-base font-medium text-gray-900">${
                                  claim.title || "새 매물 등록 요청"
                                }</h3>
                                <p class="text-sm text-gray-600 mt-1">${
                                  claim.propertyAddress ||
                                  claim.address ||
                                  "주소 정보 없음"
                                }</p>
                                ${
                                  claim.buildingName
                                    ? `<p class="text-sm text-gray-500">${claim.buildingName}</p>`
                                    : ""
                                }
                            </div>
                            
                            <div class="mt-4 flex items-center text-sm text-gray-500">
                                <svg class="flex-shrink-0 mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a2 2 0 012 2v1a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2h2z"></path>
                                </svg>
                                신청일: ${new Date(
                                  claim.createdAt
                                ).toLocaleDateString("ko-KR")}
                                ${
                                  claim.reviewedAt
                                    ? ` • 심사일: ${new Date(
                                        claim.reviewedAt
                                      ).toLocaleDateString("ko-KR")}`
                                    : ""
                                }
                            </div>
                        </div>
                    </div>
                    
                    <div class="mt-6 flex items-center justify-between">
                        <button class="toggle-details-btn inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500" data-target="${detailsId}">
                            <svg class="mr-2 h-4 w-4 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                            </svg>
                            상세 정보
                        </button>
                        
                        <div class="flex space-x-3">
                            ${
                              claim.status === "PENDING"
                                ? `
                                <button onclick="adminPropertyManagement.approveClaim(${claim.claimId})" 
                                        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                                    <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                    승인
                                </button>
                                <button onclick="adminPropertyManagement.showRejectModal(${claim.claimId})" 
                                        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                                    <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                    거절
                                </button>
                            `
                                : `
                                <span class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500">
                                    ${statusInfo.label} 완료
                                </span>
                            `
                            }
                        </div>
                    </div>
                </div>
                
                <!-- 상세 정보 (숨김 영역) -->
                <div id="${detailsId}" class="hidden border-t border-gray-200 bg-gray-50 px-6 py-4">
                    ${this.createClaimDetails(claim)}
                </div>
            </div>
        `;
  }

  // 매물 등록 요청 상세 정보 생성
  createClaimDetails(claim) {
    return `
            <div class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- 기본 정보 -->
                    <div class="bg-white p-4 rounded-lg border">
                        <h4 class="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                            <svg class="mr-2 h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                            </svg>
                            신청자 정보
                        </h4>
                        <dl class="space-y-2 text-sm">
                            <div class="flex justify-between">
                                <dt class="text-gray-500">이름:</dt>
                                <dd class="text-gray-900 font-medium">${
                                  claim.applicantName
                                }</dd>
                            </div>
                            <div class="flex justify-between">
                                <dt class="text-gray-500">연락처:</dt>
                                <dd class="text-gray-900">${
                                  claim.applicantPhone
                                }</dd>
                            </div>
                            <div class="flex justify-between">
                                <dt class="text-gray-500">관계:</dt>
                                <dd class="text-gray-900">${
                                  claim.relationshipToProperty
                                }</dd>
                            </div>
                            <div class="flex justify-between">
                                <dt class="text-gray-500">신청일:</dt>
                                <dd class="text-gray-900">${new Date(
                                  claim.createdAt
                                ).toLocaleString("ko-KR")}</dd>
                            </div>
                            ${
                              claim.reviewedAt
                                ? `
                                <div class="flex justify-between">
                                    <dt class="text-gray-500">심사일:</dt>
                                    <dd class="text-gray-900">${new Date(
                                      claim.reviewedAt
                                    ).toLocaleString("ko-KR")}</dd>
                                </div>
                            `
                                : ""
                            }
                        </dl>
                    </div>

                    <!-- 위치 정보 -->
                    <div class="bg-white p-4 rounded-lg border">
                        <h4 class="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                            <svg class="mr-2 h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            </svg>
                            위치 정보
                        </h4>
                        <dl class="space-y-2 text-sm">
                            <div>
                                <dt class="text-gray-500 mb-1">주소:</dt>
                                <dd class="text-gray-900">${
                                  claim.propertyAddress ||
                                  claim.address ||
                                  "정보 없음"
                                }</dd>
                            </div>
                            ${
                              claim.buildingName
                                ? `
                                <div>
                                    <dt class="text-gray-500 mb-1">건물명:</dt>
                                    <dd class="text-gray-900">${claim.buildingName}</dd>
                                </div>
                            `
                                : ""
                            }
                            ${
                              claim.detailedAddress
                                ? `
                                <div>
                                    <dt class="text-gray-500 mb-1">상세주소:</dt>
                                    <dd class="text-gray-900">${claim.detailedAddress}</dd>
                                </div>
                            `
                                : ""
                            }
                            ${
                              claim.postalCode
                                ? `
                                <div>
                                    <dt class="text-gray-500 mb-1">우편번호:</dt>
                                    <dd class="text-gray-900">${claim.postalCode}</dd>
                                </div>
                            `
                                : ""
                            }
                            ${
                              claim.locationX && claim.locationY
                                ? `
                                <div>
                                    <dt class="text-gray-500 mb-1">좌표:</dt>
                                    <dd class="text-gray-900 text-xs">${claim.locationY}, ${claim.locationX}</dd>
                                </div>
                            `
                                : ""
                            }
                        </dl>
                    </div>
                </div>

                <!-- 추가 정보 -->
                ${
                  claim.additionalInfo
                    ? `
                    <div class="bg-white p-4 rounded-lg border">
                        <h4 class="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                            <svg class="mr-2 h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                            추가 설명
                        </h4>
                        <p class="text-sm text-gray-700 leading-relaxed">${claim.additionalInfo}</p>
                    </div>
                `
                    : ""
                }

                <!-- 거절 사유 -->
                ${
                  claim.rejectionReason
                    ? `
                    <div class="bg-red-50 p-4 rounded-lg border border-red-200">
                        <h4 class="text-sm font-semibold text-red-800 mb-3 flex items-center">
                            <svg class="mr-2 h-4 w-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            거절 사유
                        </h4>
                        <p class="text-sm text-red-700 leading-relaxed">${claim.rejectionReason}</p>
                    </div>
                `
                    : ""
                }

                <!-- 첨부 서류 -->
                ${
                  claim.documents && claim.documents.length > 0
                    ? `
                    <div class="bg-white p-4 rounded-lg border">
                        <h4 class="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                            <svg class="mr-2 h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                            첨부 서류 (${claim.documents.length}개)
                        </h4>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            ${claim.documents
                              .map(
                                (doc) => `
                                <div class="flex items-center p-3 bg-gray-50 rounded-lg border">
                                    <div class="flex-shrink-0">
                                        <svg class="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                        </svg>
                                    </div>
                                    <div class="ml-3 flex-1 min-w-0">
                                        <p class="text-sm font-medium text-gray-900 truncate">${doc.documentType}</p>
                                        <p class="text-xs text-gray-500 truncate">${doc.originalFilename}</p>
                                    </div>
                                    <div class="ml-3 flex-shrink-0">
                                        <a href="${doc.downloadUrl}" target="_blank" 
                                           class="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                            다운로드
                                        </a>
                                    </div>
                                </div>
                            `
                              )
                              .join("")}
                        </div>
                    </div>
                `
                    : ""
                }
            </div>
        `;
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

  // 매물 등록 요청 승인
  async approveClaim(claimId) {
    if (!confirm("이 매물 등록 요청을 승인하시겠습니까?")) {
      return;
    }

    try {
      const response = await fetch(
        `${this.apiBaseUrl}/admin/claims/${claimId}/approve`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        this.showSuccess("매물 등록 요청이 승인되었습니다.");
        await this.loadAllClaims(); // 목록 새로고침
      } else {
        const error = await response.text();
        throw new Error(error || "승인에 실패했습니다.");
      }
    } catch (error) {
      console.error("승인 실패:", error);
      this.showError("승인에 실패했습니다: " + error.message);
    }
  }

  // 거절 모달 표시
  showRejectModal(claimId) {
    this.currentRejectClaimId = claimId;
    const modal = document.getElementById("reject-modal");
    const rejectionReason = document.getElementById("rejection-reason");

    if (modal && rejectionReason) {
      rejectionReason.value = "";
      modal.classList.remove("hidden");
    }
  }

  // 거절 모달 숨기기
  hideRejectModal() {
    const modal = document.getElementById("reject-modal");
    if (modal) {
      modal.classList.add("hidden");
    }
    this.currentRejectClaimId = null;
  }

  // 매물 등록 요청 거절
  async rejectClaim() {
    const rejectionReason = document
      .getElementById("rejection-reason")
      .value.trim();

    if (!rejectionReason) {
      alert("거절 사유를 입력해주세요.");
      return;
    }

    if (!this.currentRejectClaimId) {
      alert("오류가 발생했습니다. 다시 시도해주세요.");
      return;
    }

    try {
      const response = await fetch(
        `${this.apiBaseUrl}/admin/claims/${this.currentRejectClaimId}/reject`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ rejectionReason }),
        }
      );

      if (response.ok) {
        this.showSuccess("매물 등록 요청이 거절되었습니다.");
        this.hideRejectModal();
        await this.loadAllClaims(); // 목록 새로고침
      } else {
        const error = await response.text();
        throw new Error(error || "거절에 실패했습니다.");
      }
    } catch (error) {
      console.error("거절 실패:", error);
      this.showError("거절에 실패했습니다: " + error.message);
    }
  }

  // 이벤트 리스너 설정
  setupEventListeners() {
    // 상세 정보 토글
    document.addEventListener("click", (event) => {
      const toggleButton = event.target.closest(".toggle-details-btn");
      if (toggleButton) {
        const targetId = toggleButton.dataset.target;
        const detailsPanel = document.getElementById(targetId);
        const icon = toggleButton.querySelector("svg");

        if (detailsPanel) {
          detailsPanel.classList.toggle("hidden");
          icon.classList.toggle("rotate-180");
        }
      }
    });

    // 로그아웃 버튼
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/";
      });
    }

    // 필터 적용 버튼
    const applyFiltersBtn = document.getElementById("apply-filters");
    if (applyFiltersBtn) {
      applyFiltersBtn.addEventListener("click", () => {
        this.applyFilters();
      });
    }

    // 필터 초기화 버튼
    const clearFiltersBtn = document.getElementById("clear-filters");
    if (clearFiltersBtn) {
      clearFiltersBtn.addEventListener("click", () => {
        this.clearFilters();
      });
    }

    // 거절 모달 관련
    const cancelRejectBtn = document.getElementById("cancel-reject");
    if (cancelRejectBtn) {
      cancelRejectBtn.addEventListener("click", () => {
        this.hideRejectModal();
      });
    }

    const confirmRejectBtn = document.getElementById("confirm-reject");
    if (confirmRejectBtn) {
      confirmRejectBtn.addEventListener("click", () => {
        this.rejectClaim();
      });
    }

    // 검색 입력 실시간 필터링
    const searchInput = document.getElementById("search-input");
    if (searchInput) {
      searchInput.addEventListener("input", () => {
        this.applyFilters();
      });
    }

    // 상태 필터 변경 시 실시간 필터링
    const statusFilter = document.getElementById("status-filter");
    if (statusFilter) {
      statusFilter.addEventListener("change", () => {
        this.applyFilters();
      });
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

  // 로딩 상태 표시/숨김
  showLoading(show) {
    const loading = document.getElementById("loading");
    if (loading) {
      loading.style.display = show ? "block" : "none";
    }
  }

  // 통계 업데이트
  updateStatistics() {
    const pendingCount = this.claims.filter(
      (claim) => claim.status === "PENDING"
    ).length;
    const approvedCount = this.claims.filter(
      (claim) => claim.status === "APPROVED"
    ).length;
    const rejectedCount = this.claims.filter(
      (claim) => claim.status === "REJECTED"
    ).length;
    const totalCount = this.claims.length;

    document.getElementById("pending-count").textContent = pendingCount;
    document.getElementById("approved-count").textContent = approvedCount;
    document.getElementById("rejected-count").textContent = rejectedCount;
    document.getElementById("total-count").textContent = totalCount;
  }

  // 필터 적용
  applyFilters() {
    const statusFilter = document.getElementById("status-filter").value;
    const searchInput = document
      .getElementById("search-input")
      .value.toLowerCase();
    const startDate = document.getElementById("start-date").value;
    const endDate = document.getElementById("end-date").value;

    this.filteredClaims = this.claims.filter((claim) => {
      // 상태 필터
      if (statusFilter && claim.status !== statusFilter) {
        return false;
      }

      // 검색 필터 (신청자명, 주소)
      if (searchInput) {
        const searchText = `${claim.applicantName} ${
          claim.propertyAddress || claim.address || ""
        }`.toLowerCase();
        if (!searchText.includes(searchInput)) {
          return false;
        }
      }

      // 날짜 필터
      if (startDate || endDate) {
        const claimDate = new Date(claim.createdAt).toISOString().split("T")[0];
        if (startDate && claimDate < startDate) {
          return false;
        }
        if (endDate && claimDate > endDate) {
          return false;
        }
      }

      return true;
    });

    this.renderClaimsList();
  }

  // 필터 초기화
  clearFilters() {
    document.getElementById("status-filter").value = "";
    document.getElementById("search-input").value = "";
    document.getElementById("start-date").value = "";
    document.getElementById("end-date").value = "";

    this.filteredClaims = [...this.claims];
    this.renderClaimsList();
  }
}

// 전역 인스턴스 생성
let adminPropertyManagement;

// DOM 로드 완료 후 초기화
document.addEventListener("DOMContentLoaded", () => {
  adminPropertyManagement = new AdminPropertyManagement();
});
