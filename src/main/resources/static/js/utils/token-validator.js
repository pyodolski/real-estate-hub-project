/**
 * Token Validator
 * 페이지 로드 시 토큰 유효성을 검증하고 만료된 경우 로그인 페이지로 리다이렉트합니다.
 *
 * 이 스크립트는 인증이 필요한 페이지에서 가장 먼저 로드되어야 합니다.
 */

(function () {
  "use strict";

  /**
   * 현재 페이지가 인증이 필요한 페이지인지 확인
   * @returns {boolean}
   */
  function isAuthRequiredPage() {
    const currentPath = window.location.pathname;
    const authRequiredPages = [
      "/loginO.html",
      "/intermediary.html",
      // 필요한 경우 다른 인증 필요 페이지 추가
    ];

    return authRequiredPages.some((page) => currentPath.endsWith(page));
  }

  /**
   * 로그인 페이지로 리다이렉트
   * @param {string} reason - 리다이렉트 사유
   */
  function redirectToLogin(reason) {
    console.warn(`Token Validator: ${reason}`);

    // 토큰 제거
    if (typeof AuthUtils !== "undefined" && AuthUtils.removeToken) {
      AuthUtils.removeToken();
    } else {
      // Fallback: AuthUtils가 아직 로드되지 않은 경우
      localStorage.removeItem("accessToken");
      localStorage.removeItem("access_token");
      sessionStorage.removeItem("accessToken");
      sessionStorage.removeItem("access_token");
    }

    // 현재 페이지 URL을 저장하여 로그인 후 돌아올 수 있도록 함
    const currentPath = window.location.pathname + window.location.search;
    const loginPage = "/loginX.html";
    const redirectUrl = `${loginPage}?redirect=${encodeURIComponent(
      currentPath
    )}`;

    // 사용자에게 알림 (선택사항)
    // alert('로그인이 필요합니다. 로그인 페이지로 이동합니다.');

    // 리다이렉트
    window.location.href = redirectUrl;
  }

  /**
   * 토큰 유효성 검증
   */
  function validateToken() {
    // 인증이 필요하지 않은 페이지는 검증 건너뛰기
    if (!isAuthRequiredPage()) {
      console.log("Token Validator: 인증이 필요하지 않은 페이지입니다.");
      return;
    }

    console.log("Token Validator: 토큰 유효성 검증 시작...");

    // 토큰 가져오기
    const token =
      localStorage.getItem("accessToken") ||
      localStorage.getItem("access_token") ||
      sessionStorage.getItem("accessToken") ||
      sessionStorage.getItem("access_token");

    // 토큰이 없는 경우
    if (!token) {
      redirectToLogin("토큰이 없습니다.");
      return;
    }

    // 토큰 유효성 검증
    try {
      // JWT는 세 부분으로 구성: header.payload.signature
      const parts = token.split(".");
      if (parts.length !== 3) {
        redirectToLogin("유효하지 않은 JWT 형식입니다.");
        return;
      }

      // payload 부분을 Base64 디코딩
      const payload = JSON.parse(atob(parts[1]));

      // exp 필드가 없으면 유효하지 않은 토큰으로 간주
      if (!payload.exp) {
        redirectToLogin("토큰에 만료 시간(exp)이 없습니다.");
        return;
      }

      // exp는 초 단위이므로 밀리초로 변환하여 현재 시간과 비교
      const expirationTime = payload.exp * 1000;
      const currentTime = Date.now();

      if (expirationTime <= currentTime) {
        redirectToLogin("토큰이 만료되었습니다.");
        return;
      }

      // 토큰이 유효함
      console.log("Token Validator: 토큰이 유효합니다.");

      // 만료까지 남은 시간 로깅 (디버깅용)
      const timeUntilExpiration = expirationTime - currentTime;
      const minutesUntilExpiration = Math.floor(
        timeUntilExpiration / 1000 / 60
      );
      console.log(
        `Token Validator: 토큰 만료까지 ${minutesUntilExpiration}분 남았습니다.`
      );
    } catch (error) {
      console.error("Token Validator: 토큰 검증 중 오류 발생:", error);
      redirectToLogin("토큰 검증 중 오류가 발생했습니다.");
    }
  }

  // 페이지 로드 시 즉시 실행
  validateToken();

  // AuthUtils가 로드된 후 다시 한 번 검증 (선택사항)
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      // AuthUtils를 사용하여 재검증
      if (typeof AuthUtils !== "undefined" && AuthUtils.isTokenValid) {
        if (!AuthUtils.isTokenValid()) {
          redirectToLogin("토큰이 유효하지 않습니다 (AuthUtils 검증).");
        }
      }
    });
  }
})();
