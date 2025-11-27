// 알림 관리 JavaScript 모듈

class NotificationManagement {
  constructor() {
    this.apiBaseUrl = "/api/notifications";
    this.accessToken = localStorage.getItem("accessToken");
    this.notifications = [];
    this.unreadCount = 0;

    this.init();
  }

  async init() {
    await this.loadNotifications();
    await this.updateUnreadCount();
    this.setupEventListeners();
    this.startPeriodicUpdate();
  }

  // 알림 목록 로드
  async loadNotifications(page = 0, size = 20) {
    try {
      const response = await fetch(
        `${this.apiBaseUrl}?page=${page}&size=${size}`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        this.notifications = data.content;
        this.renderNotifications();
      } else {
        throw new Error("알림 목록을 불러올 수 없습니다.");
      }
    } catch (error) {
      console.error("알림 목록 로드 실패:", error);
      this.showError("알림 목록을 불러올 수 없습니다: " + error.message);
    }
  }

  // 읽지 않은 알림 개수 업데이트
  async updateUnreadCount() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/unread-count`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        this.unreadCount = data.count;
        this.updateUnreadBadge();
      }
    } catch (error) {
      console.error("읽지 않은 알림 개수 로드 실패:", error);
    }
  }

  // 읽지 않은 알림 배지 업데이트
  updateUnreadBadge() {
    const notificationButton = document.getElementById("notification-button");
    if (!notificationButton) return;

    // 기존 배지 제거
    const existingBadge = notificationButton.querySelector(
      ".notification-badge"
    );
    if (existingBadge) {
      existingBadge.remove();
    }

    // 읽지 않은 알림이 있으면 배지 추가
    if (this.unreadCount > 0) {
      const badge = document.createElement("div");
      badge.className =
        "notification-badge absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center";
      badge.textContent =
        this.unreadCount > 99 ? "99+" : this.unreadCount.toString();
      notificationButton.appendChild(badge);
    }
  }

  // 알림 목록 렌더링
  renderNotifications() {
    const notificationList = document.getElementById("notification-list");
    if (!notificationList) return;

    notificationList.innerHTML = "";

    if (this.notifications.length === 0) {
      notificationList.innerHTML = `
        <div class="text-center py-8 text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5-5-5h5v-12h5v12z"/>
          </svg>
          <p class="text-sm">알림이 없습니다.</p>
        </div>
      `;
      return;
    }

    this.notifications.forEach((notification) => {
      const notificationCard = this.createNotificationCard(notification);
      notificationList.appendChild(notificationCard);
    });
  }

  // 알림 카드 생성
  createNotificationCard(notification) {
    const card = document.createElement("div");
    card.className = `border-b border-gray-200 p-4 hover:bg-gray-50 transition-colors ${
      !notification.isRead ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
    }`;

    const iconHtml = this.getNotificationIcon(notification.type);
    const timeColor = !notification.isRead
      ? "text-blue-600 font-medium"
      : "text-gray-500";

    card.innerHTML = `
      <div class="flex items-start space-x-3">
        <div class="flex-shrink-0 mt-1">
          ${iconHtml}
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between mb-1">
            <h4 class="text-sm font-medium text-gray-900 truncate">
              ${notification.title}
            </h4>
            <span class="text-xs ${timeColor}">
              ${notification.timeAgo}
            </span>
          </div>
          <p class="text-sm text-gray-600 mb-2">
            ${notification.message}
          </p>
          <div class="flex items-center space-x-2">
            ${
              !notification.isRead
                ? `
              <button onclick="notificationManagement.markAsRead(${notification.id})" 
                      class="text-xs text-blue-600 hover:text-blue-800 font-medium">
                읽음 처리
              </button>
            `
                : ""
            }
            <button onclick="notificationManagement.deleteNotification(${
              notification.id
            })" 
                    class="text-xs text-red-600 hover:text-red-800">
              삭제
            </button>
          </div>
        </div>
      </div>
    `;

    return card;
  }

  // 알림 타입별 아이콘 반환
  getNotificationIcon(type) {
    const iconClass = "w-6 h-6";

    switch (type) {
      case "PROPERTY_APPROVED":
        return `<div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg class="${iconClass} text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>`;
      case "PROPERTY_REJECTED":
        return `<div class="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <svg class="${iconClass} text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </div>`;
      case "PROPERTY_SUBMITTED":
        return `<div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg class="${iconClass} text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                  </svg>
                </div>`;
      case "CHAT_MESSAGE":
        return `<div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg class="${iconClass} text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                  </svg>
                </div>`;
      case "PRICE_ALERT":
        return `<div class="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg class="${iconClass} text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5-5-5h5v-12h5v12z"/>
                  </svg>
                </div>`;
      case "SYSTEM_UPDATE":
        return `<div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg class="${iconClass} text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                </div>`;
      case "PURCHASE_COMPLETED":
        return `<div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg class="${iconClass} text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>`;
      case "RECOMMENDED_PROPERTY":
        return `<div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg class="${iconClass} text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
                  </svg>
                </div>`;
      case "AUCTION_NEW_BID":
        return `<div class="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg class="${iconClass} text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                  </svg>
                </div>`;
      case "AUCTION_OUTBID":
        return `<div class="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <svg class="${iconClass} text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                  </svg>
                </div>`;
      case "AUCTION_COMPLETED":
        return `<div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg class="${iconClass} text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                  </svg>
                </div>`;
      default:
        return `<div class="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg class="${iconClass} text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>`;
    }
  }

  // 알림 읽음 처리
  async markAsRead(notificationId) {
    try {
      const response = await fetch(
        `${this.apiBaseUrl}/${notificationId}/read`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        await this.loadNotifications();
        await this.updateUnreadCount();
        this.showSuccess("알림을 읽음 처리했습니다.");
      } else {
        throw new Error("알림 읽음 처리에 실패했습니다.");
      }
    } catch (error) {
      console.error("알림 읽음 처리 실패:", error);
      this.showError("알림 읽음 처리에 실패했습니다: " + error.message);
    }
  }

  // 모든 알림 읽음 처리
  async markAllAsRead() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/read-all`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        await this.loadNotifications();
        await this.updateUnreadCount();
        this.showSuccess(`${data.updatedCount}개의 알림을 읽음 처리했습니다.`);
      } else {
        throw new Error("모든 알림 읽음 처리에 실패했습니다.");
      }
    } catch (error) {
      console.error("모든 알림 읽음 처리 실패:", error);
      this.showError("모든 알림 읽음 처리에 실패했습니다: " + error.message);
    }
  }

  // 알림 삭제
  async deleteNotification(notificationId) {
    if (!confirm("이 알림을 삭제하시겠습니까?")) {
      return;
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/${notificationId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        await this.loadNotifications();
        await this.updateUnreadCount();
        this.showSuccess("알림을 삭제했습니다.");
      } else {
        throw new Error("알림 삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("알림 삭제 실패:", error);
      this.showError("알림 삭제에 실패했습니다: " + error.message);
    }
  }

  // 읽은 알림들 일괄 삭제
  async deleteReadNotifications() {
    if (!confirm("읽은 알림들을 모두 삭제하시겠습니까?")) {
      return;
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/read`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        await this.loadNotifications();
        await this.updateUnreadCount();
        this.showSuccess(`${data.deletedCount}개의 읽은 알림을 삭제했습니다.`);
      } else {
        throw new Error("읽은 알림 삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("읽은 알림 삭제 실패:", error);
      this.showError("읽은 알림 삭제에 실패했습니다: " + error.message);
    }
  }

  // 이벤트 리스너 설정
  setupEventListeners() {
    // 모든 읽음 처리 버튼
    const markAllReadBtn = document.getElementById("mark-all-read-btn");
    if (markAllReadBtn) {
      markAllReadBtn.addEventListener("click", () => this.markAllAsRead());
    }

    // 읽은 알림 삭제 버튼
    const deleteReadBtn = document.getElementById("delete-read-btn");
    if (deleteReadBtn) {
      deleteReadBtn.addEventListener("click", () =>
        this.deleteReadNotifications()
      );
    }
  }

  // 주기적 업데이트 (30초마다)
  startPeriodicUpdate() {
    setInterval(() => {
      this.updateUnreadCount();
    }, 30000);
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
let notificationManagement;

// DOM 로드 완료 후 초기화
document.addEventListener("DOMContentLoaded", () => {
  notificationManagement = new NotificationManagement();
  window.notificationManagement = notificationManagement;
});
