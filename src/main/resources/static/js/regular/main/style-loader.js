/**
 * 동적 스타일 로더
 * loginO.html에 필요한 커스텀 CSS를 동적으로 로드
 */

const StyleLoader = {
  /**
   * CSS 파일을 동적으로 로드
   */
  loadCSS(href) {
    // 이미 로드된 스타일시트인지 확인
    const existingLink = document.querySelector(`link[href="${href}"]`);
    if (existingLink) {
      console.log(`[StyleLoader] 이미 로드됨: ${href}`);
      return;
    }

    // 새로운 link 요소 생성
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = href;

    // head에 추가
    document.head.appendChild(link);
    console.log(`[StyleLoader] CSS 로드 완료: ${href}`);
  },

  /**
   * 초기화 - loginO 전용 스타일 로드
   */
  init() {
    this.loadCSS('css/loginO-custom.css');
  }
};

// 즉시 실행
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    StyleLoader.init();
  });
} else {
  StyleLoader.init();
}
