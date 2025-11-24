/**
 * 판매 매물 등록 지도 연동 모듈
 * sale-registration-panel.js에서 사용됨
 * 
 * 이 파일은 NoResourceFoundException을 해결하기 위해 재생성되었습니다.
 * 실제 지도 연동 로직이 필요한 경우 이 파일을 확장해야 합니다.
 */

const SaleRegistrationMapIntegration = {
  /**
   * 초기화
   */
  init() {
    console.log("[SaleRegistrationMapIntegration] Initialized");
  },

  /**
   * 폼 및 지도 상태 초기화
   * 패널이 닫힐 때 호출됨
   */
  clearForm() {
    console.log("[SaleRegistrationMapIntegration] Clearing form and map state");
    // 필요한 경우 여기에 지도 마커 제거 등의 로직 추가
  }
};

// 전역 객체에 등록
window.SaleRegistrationMapIntegration = SaleRegistrationMapIntegration;

// 초기화 실행
SaleRegistrationMapIntegration.init();
