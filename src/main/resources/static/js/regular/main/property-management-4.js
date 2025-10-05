// 내 매물 관리 JavaScript 모듈 - Part 4
// 인스턴스 생성 및 초기화

(function() {
  // PropertyManagement 클래스가 이미 정의되어 있는지 확인
  if (typeof window.PropertyManagement === 'undefined') {
    console.error('[Part 4] PropertyManagement class not found. Load part-1.js first.');
    return;
  }

  // 여기에 추가 메서드들을 prototype에 추가할 수 있습니다
  // 예: PropertyManagement.prototype.finalMethod = function() { ... };

  console.log('[PropertyManagement Part 4] Loaded');

  // 전역 인스턴스 생성
  if (!window.propertyManagement) {
    // DOM 로드 완료 후 초기화
    if (document.readyState === 'loading') {
      document.addEventListener("DOMContentLoaded", () => {
        if (!window.propertyManagement) {
          const instance = new PropertyManagement();
          window.propertyManagement = instance;
          console.log('[PropertyManagement] Instance created');
        }
      });
    } else {
      // 이미 DOM이 로드된 경우 즉시 초기화
      const instance = new PropertyManagement();
      window.propertyManagement = instance;
      console.log('[PropertyManagement] Instance created (immediate)');
    }
  }
})();
