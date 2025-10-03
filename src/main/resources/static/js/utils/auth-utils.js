/**
 * Authentication Utilities
 * 인증 토큰 관리를 위한 유틸리티 함수들
 */
const AuthUtils = {
  /**
   * 토큰 가져오기 (여러 키 이름 지원)
   * localStorage와 sessionStorage에서 accessToken 또는 access_token 키로 저장된 토큰을 찾습니다.
   * @returns {string|null} 토큰 문자열 또는 null
   */
  getToken() {
    return (
      localStorage.getItem("accessToken") ||
      localStorage.getItem("access_token") ||
      sessionStorage.getItem("accessToken") ||
      sessionStorage.getItem("access_token")
    );
  },

  /**
   * 토큰 저장 (표준 키 사용)
   * accessToken을 표준 키로 사용하고, 호환성을 위해 access_token도 함께 저장합니다.
   * @param {string} token - 저장할 JWT 토큰
   */
  setToken(token) {
    if (!token) {
      console.warn("AuthUtils.setToken: 토큰이 비어있습니다.");
      return;
    }
    localStorage.setItem("accessToken", token);
    // 호환성을 위해 구 키도 저장
    localStorage.setItem("access_token", token);
  },

  /**
   * 토큰 제거
   * localStorage와 sessionStorage에서 모든 토큰 관련 데이터를 제거합니다.
   */
  removeToken() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("access_token");
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("access_token");
  },

  /**
   * 토큰 유효성 검증
   * JWT 토큰의 만료 시간을 확인하여 유효성을 검증합니다.
   * @param {string} token - 검증할 JWT 토큰 (선택사항, 없으면 저장된 토큰 사용)
   * @returns {boolean} 토큰이 유효하면 true, 그렇지 않으면 false
   */
  isTokenValid(token) {
    // 토큰이 제공되지 않으면 저장된 토큰 사용
    const tokenToValidate = token || this.getToken();

    if (!tokenToValidate) {
      return false;
    }

    try {
      // JWT는 세 부분으로 구성: header.payload.signature
      const parts = tokenToValidate.split(".");
      if (parts.length !== 3) {
        console.warn("AuthUtils.isTokenValid: 유효하지 않은 JWT 형식입니다.");
        return false;
      }

      // payload 부분을 Base64 디코딩
      const payload = JSON.parse(atob(parts[1]));

      // exp 필드가 없으면 유효하지 않은 토큰으로 간주
      if (!payload.exp) {
        console.warn(
          "AuthUtils.isTokenValid: 토큰에 만료 시간(exp)이 없습니다."
        );
        return false;
      }

      // exp는 초 단위이므로 밀리초로 변환하여 현재 시간과 비교
      const expirationTime = payload.exp * 1000;
      const currentTime = Date.now();

      return expirationTime > currentTime;
    } catch (e) {
      console.error("AuthUtils.isTokenValid: 토큰 검증 중 오류 발생:", e);
      return false;
    }
  },

  /**
   * Authorization 헤더 생성
   * Bearer 토큰 형식의 Authorization 헤더를 생성합니다.
   * @returns {Object} Authorization 헤더 객체 또는 빈 객체
   */
  getAuthHeader() {
    const token = this.getToken();

    if (!token) {
      console.warn("AuthUtils.getAuthHeader: 토큰이 없습니다.");
      return {};
    }

    // 토큰 유효성 검증
    if (!this.isTokenValid(token)) {
      console.warn(
        "AuthUtils.getAuthHeader: 토큰이 만료되었거나 유효하지 않습니다."
      );
      return {};
    }

    return {
      Authorization: `Bearer ${token}`,
    };
  },

  /**
   * 401 인증 오류 처리
   * 인증 오류 발생 시 토큰을 제거하고 로그인 페이지로 리다이렉트합니다.
   * @param {Response} response - Fetch API Response 객체
   * @returns {boolean} 401 오류가 처리되었으면 true, 그렇지 않으면 false
   */
  handleAuthError(response) {
    if (response && response.status === 401) {
      console.warn("AuthUtils.handleAuthError: 인증 오류 발생 (401)");

      // 토큰 제거
      this.removeToken();

      // 사용자 친화적 메시지 표시
      alert("로그인이 필요합니다. 로그인 페이지로 이동합니다.");

      // 로그인 페이지로 리다이렉트
      // 현재 페이지 URL을 저장하여 로그인 후 돌아올 수 있도록 함
      const currentPath = window.location.pathname + window.location.search;
      window.location.href = `/loginO.html?redirect=${encodeURIComponent(
        currentPath
      )}`;

      return true;
    }
    return false;
  },

  /**
   * 인증이 필요한 API 호출 래퍼 함수
   * 자동으로 인증 헤더를 추가하고 401 오류를 처리합니다.
   * @param {string} url - API 엔드포인트 URL
   * @param {Object} options - fetch 옵션 객체
   * @returns {Promise<Response>} Fetch API Response 객체
   * @throws {Error} 인증 토큰이 없거나 API 호출 실패 시
   */
  async fetchWithAuth(url, options = {}) {
    const token = this.getToken();

    if (!token) {
      console.error("AuthUtils.fetchWithAuth: 인증 토큰이 없습니다.");
      throw new Error("인증 토큰이 없습니다. 로그인이 필요합니다.");
    }

    // 토큰 유효성 검증
    if (!this.isTokenValid(token)) {
      console.warn("AuthUtils.fetchWithAuth: 토큰이 만료되었습니다.");
      this.removeToken();
      throw new Error("토큰이 만료되었습니다. 다시 로그인해주세요.");
    }

    // 기본 헤더와 인증 헤더 병합
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
      ...this.getAuthHeader(),
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // 401 오류 자동 처리
      if (response.status === 401) {
        this.handleAuthError(response);
        throw new Error("인증 실패: 로그인이 필요합니다.");
      }

      // 기타 HTTP 오류 처리
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorText = await response.text();
          if (errorText) {
            errorMessage = errorText;
          }
        } catch (e) {
          console.warn("AuthUtils.fetchWithAuth: 오류 메시지 파싱 실패", e);
        }
        throw new Error(errorMessage);
      }

      return response;
    } catch (error) {
      console.error("AuthUtils.fetchWithAuth: API 호출 실패", error);
      throw error;
    }
  },
};

/**
 * 에러 메시지 표시 유틸리티
 * Toast 스타일의 알림 메시지를 화면에 표시합니다.
 */
const ErrorMessageUtils = {
  /**
   * 에러 메시지 표시
   * Toast 스타일의 알림을 화면 우측 상단에 표시하고 자동으로 사라집니다.
   * @param {string} message - 표시할 메시지
   * @param {number} duration - 메시지 표시 시간 (밀리초, 기본값: 5000)
   * @param {string} type - 메시지 타입 ('error', 'success', 'warning', 'info', 기본값: 'error')
   */
  showErrorMessage(message, duration = 5000, type = "error") {
    // 메시지 타입에 따른 스타일 설정
    const styles = {
      error: {
        bg: "bg-red-100",
        border: "border-red-400",
        text: "text-red-700",
        icon: "❌",
      },
      success: {
        bg: "bg-green-100",
        border: "border-green-400",
        text: "text-green-700",
        icon: "✅",
      },
      warning: {
        bg: "bg-yellow-100",
        border: "border-yellow-400",
        text: "text-yellow-700",
        icon: "⚠️",
      },
      info: {
        bg: "bg-blue-100",
        border: "border-blue-400",
        text: "text-blue-700",
        icon: "ℹ️",
      },
    };

    const style = styles[type] || styles.error;

    // Toast 컨테이너 생성 또는 가져오기
    let toastContainer = document.getElementById("toast-container");
    if (!toastContainer) {
      toastContainer = document.createElement("div");
      toastContainer.id = "toast-container";
      toastContainer.className = "fixed top-4 right-4 z-50 space-y-2";
      toastContainer.style.maxWidth = "400px";
      document.body.appendChild(toastContainer);
    }

    // Toast 메시지 요소 생성
    const toastDiv = document.createElement("div");
    toastDiv.className = `${style.bg} ${style.border} ${style.text} border rounded-lg p-4 shadow-lg flex items-start gap-3 animate-slide-in`;
    toastDiv.style.animation = "slideIn 0.3s ease-out";

    // 아이콘
    const iconSpan = document.createElement("span");
    iconSpan.className = "text-xl flex-shrink-0";
    iconSpan.textContent = style.icon;

    // 메시지 텍스트
    const messageDiv = document.createElement("div");
    messageDiv.className = "flex-1 text-sm";
    messageDiv.textContent = message;

    // 닫기 버튼
    const closeButton = document.createElement("button");
    closeButton.className = `${style.text} hover:opacity-70 flex-shrink-0 font-bold text-lg leading-none`;
    closeButton.textContent = "×";
    closeButton.onclick = () => {
      removeToast(toastDiv);
    };

    // 요소 조립
    toastDiv.appendChild(iconSpan);
    toastDiv.appendChild(messageDiv);
    toastDiv.appendChild(closeButton);
    toastContainer.appendChild(toastDiv);

    // Toast 제거 함수
    function removeToast(element) {
      element.style.animation = "slideOut 0.3s ease-in";
      setTimeout(() => {
        if (element.parentNode) {
          element.parentNode.removeChild(element);
        }
        // 컨테이너가 비어있으면 제거
        if (
          toastContainer &&
          toastContainer.children.length === 0 &&
          toastContainer.parentNode
        ) {
          toastContainer.parentNode.removeChild(toastContainer);
        }
      }, 300);
    }

    // 자동으로 사라지도록 타이머 설정
    if (duration > 0) {
      setTimeout(() => {
        removeToast(toastDiv);
      }, duration);
    }

    // CSS 애니메이션 추가 (한 번만)
    if (!document.getElementById("toast-animations")) {
      const styleElement = document.createElement("style");
      styleElement.id = "toast-animations";
      styleElement.textContent = `
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes slideOut {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(styleElement);
    }
  },

  /**
   * 성공 메시지 표시 (편의 메서드)
   * @param {string} message - 표시할 메시지
   * @param {number} duration - 메시지 표시 시간 (밀리초, 기본값: 3000)
   */
  showSuccessMessage(message, duration = 3000) {
    this.showErrorMessage(message, duration, "success");
  },

  /**
   * 경고 메시지 표시 (편의 메서드)
   * @param {string} message - 표시할 메시지
   * @param {number} duration - 메시지 표시 시간 (밀리초, 기본값: 4000)
   */
  showWarningMessage(message, duration = 4000) {
    this.showErrorMessage(message, duration, "warning");
  },

  /**
   * 정보 메시지 표시 (편의 메서드)
   * @param {string} message - 표시할 메시지
   * @param {number} duration - 메시지 표시 시간 (밀리초, 기본값: 3000)
   */
  showInfoMessage(message, duration = 3000) {
    this.showErrorMessage(message, duration, "info");
  },
};

// ES6 모듈로 내보내기 (필요한 경우)
if (typeof module !== "undefined" && module.exports) {
  module.exports = { AuthUtils, ErrorMessageUtils };
}
