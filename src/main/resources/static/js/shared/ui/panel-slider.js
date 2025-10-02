/**
 * PanelSlider - 패널 슬라이딩 애니메이션 공통 모듈
 * 우->좌, 좌->우 슬라이딩 애니메이션 및 패널 상태 관리
 */

export class PanelSlider {
  /**
   * @param {string} panelId - 패널 DOM 요소 ID
   * @param {Object} options - 패널 옵션
   * @param {string} options.position - 패널 위치 ('left' | 'right')
   * @param {number} options.width - 패널 너비 (px)
   * @param {number} options.animationDuration - 애니메이션 시간 (ms)
   * @param {string} options.slideDirection - 슬라이딩 방향 ('horizontal' | 'vertical')
   * @param {boolean} options.autoHide - 외부 클릭 시 자동 숨김
   * @param {boolean} options.overlay - 오버레이 표시 여부
   */
  constructor(panelId, options = {}) {
    this.panelId = panelId;
    this.panel = document.getElementById(panelId);

    if (!this.panel) {
      console.error(`패널을 찾을 수 없습니다: ${panelId}`);
      return;
    }

    this.options = {
      position: options.position ?? 'right',
      width: options.width ?? 400,
      animationDuration: options.animationDuration ?? 300,
      slideDirection: options.slideDirection ?? 'horizontal',
      autoHide: options.autoHide ?? false,
      overlay: options.overlay ?? false,
      ...options
    };

    this.isVisible = false;
    this.overlay = null;
    this.callbacks = {
      onOpen: [],
      onClose: [],
      onToggle: []
    };

    this._initialize();
  }

  /**
   * 패널 초기화
   * @private
   */
  _initialize() {
    // 패널 기본 스타일 설정
    this.panel.style.position = 'fixed';
    this.panel.style.top = '0';
    this.panel.style.height = '100%';
    this.panel.style.width = `${this.options.width}px`;
    this.panel.style.transition = `transform ${this.options.animationDuration}ms ease-in-out`;
    this.panel.style.zIndex = '1000';

    // 위치에 따른 초기 스타일
    if (this.options.position === 'right') {
      this.panel.style.right = '0';
      this.panel.style.transform = 'translateX(100%)';
    } else {
      this.panel.style.left = '0';
      this.panel.style.transform = 'translateX(-100%)';
    }

    // 오버레이 생성
    if (this.options.overlay) {
      this._createOverlay();
    }

    // 자동 숨김 설정
    if (this.options.autoHide) {
      this._setupAutoHide();
    }
  }

  /**
   * 오버레이 생성
   * @private
   */
  _createOverlay() {
    this.overlay = document.createElement('div');
    this.overlay.id = `${this.panelId}-overlay`;
    this.overlay.style.position = 'fixed';
    this.overlay.style.top = '0';
    this.overlay.style.left = '0';
    this.overlay.style.width = '100%';
    this.overlay.style.height = '100%';
    this.overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    this.overlay.style.zIndex = '999';
    this.overlay.style.display = 'none';
    this.overlay.style.transition = `opacity ${this.options.animationDuration}ms ease-in-out`;

    document.body.appendChild(this.overlay);

    // 오버레이 클릭 시 패널 닫기
    this.overlay.addEventListener('click', () => {
      this.slideOut();
    });
  }

  /**
   * 자동 숨김 설정
   * @private
   */
  _setupAutoHide() {
    document.addEventListener('click', (e) => {
      if (this.isVisible && !this.panel.contains(e.target)) {
        // 패널 외부 클릭 시 닫기
        this.slideOut();
      }
    });
  }

  /**
   * 패널 슬라이드 인 (표시)
   * @param {string} direction - 슬라이딩 방향 ('right-to-left' | 'left-to-right')
   * @returns {Promise<void>}
   */
  async slideIn(direction = 'right-to-left') {
    if (this.isVisible) {
      return;
    }

    this.isVisible = true;

    // 오버레이 표시
    if (this.overlay) {
      this.overlay.style.display = 'block';
      setTimeout(() => {
        this.overlay.style.opacity = '1';
      }, 10);
    }

    // 패널 슬라이드 인
    this.panel.style.transform = 'translateX(0)';

    // 콜백 실행
    await this._executeCallbacks('onOpen');

    return new Promise((resolve) => {
      setTimeout(() => {
        this._executeCallbacks('onToggle');
        resolve();
      }, this.options.animationDuration);
    });
  }

  /**
   * 패널 슬라이드 아웃 (숨김)
   * @param {string} direction - 슬라이딩 방향
   * @returns {Promise<void>}
   */
  async slideOut(direction = 'left-to-right') {
    if (!this.isVisible) {
      return;
    }

    this.isVisible = false;

    // 오버레이 숨김
    if (this.overlay) {
      this.overlay.style.opacity = '0';
      setTimeout(() => {
        this.overlay.style.display = 'none';
      }, this.options.animationDuration);
    }

    // 패널 슬라이드 아웃
    if (this.options.position === 'right') {
      this.panel.style.transform = 'translateX(100%)';
    } else {
      this.panel.style.transform = 'translateX(-100%)';
    }

    // 콜백 실행
    await this._executeCallbacks('onClose');

    return new Promise((resolve) => {
      setTimeout(() => {
        this._executeCallbacks('onToggle');
        resolve();
      }, this.options.animationDuration);
    });
  }

  /**
   * 패널 토글
   * @returns {Promise<void>}
   */
  async toggle() {
    if (this.isVisible) {
      return this.slideOut();
    } else {
      return this.slideIn();
    }
  }

  /**
   * 패널 표시 여부 반환
   * @returns {boolean}
   */
  getVisibility() {
    return this.isVisible;
  }

  /**
   * 패널 컨텐츠 설정
   * @param {string|HTMLElement} content - 패널 내용
   */
  setContent(content) {
    if (typeof content === 'string') {
      this.panel.innerHTML = content;
    } else if (content instanceof HTMLElement) {
      this.panel.innerHTML = '';
      this.panel.appendChild(content);
    }
  }

  /**
   * 패널 너비 변경
   * @param {number} width - 새로운 너비 (px)
   */
  setWidth(width) {
    this.options.width = width;
    this.panel.style.width = `${width}px`;
  }

  /**
   * 이벤트 리스너 추가
   * @param {string} event - 이벤트 이름 ('open' | 'close' | 'toggle')
   * @param {Function} callback - 콜백 함수
   */
  addEventListener(event, callback) {
    const eventName = `on${event.charAt(0).toUpperCase()}${event.slice(1)}`;
    if (this.callbacks[eventName]) {
      this.callbacks[eventName].push(callback);
    }
  }

  /**
   * 이벤트 리스너 제거
   * @param {string} event - 이벤트 이름
   * @param {Function} callback - 제거할 콜백 함수
   */
  removeEventListener(event, callback) {
    const eventName = `on${event.charAt(0).toUpperCase()}${event.slice(1)}`;
    if (this.callbacks[eventName]) {
      this.callbacks[eventName] = this.callbacks[eventName].filter(cb => cb !== callback);
    }
  }

  /**
   * 콜백 실행
   * @private
   * @param {string} eventName - 이벤트 이름
   */
  async _executeCallbacks(eventName) {
    const callbacks = this.callbacks[eventName] || [];
    for (const callback of callbacks) {
      if (typeof callback === 'function') {
        await callback(this);
      }
    }
  }

  /**
   * 패널 보이기 (애니메이션 없이)
   */
  show() {
    this.panel.style.transition = 'none';
    this.panel.style.transform = 'translateX(0)';
    this.isVisible = true;

    if (this.overlay) {
      this.overlay.style.display = 'block';
      this.overlay.style.opacity = '1';
    }

    setTimeout(() => {
      this.panel.style.transition = `transform ${this.options.animationDuration}ms ease-in-out`;
    }, 10);
  }

  /**
   * 패널 숨기기 (애니메이션 없이)
   */
  hide() {
    this.panel.style.transition = 'none';

    if (this.options.position === 'right') {
      this.panel.style.transform = 'translateX(100%)';
    } else {
      this.panel.style.transform = 'translateX(-100%)';
    }

    this.isVisible = false;

    if (this.overlay) {
      this.overlay.style.display = 'none';
      this.overlay.style.opacity = '0';
    }

    setTimeout(() => {
      this.panel.style.transition = `transform ${this.options.animationDuration}ms ease-in-out`;
    }, 10);
  }

  /**
   * 리소스 정리
   */
  destroy() {
    // 오버레이 제거
    if (this.overlay && this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }

    // 콜백 초기화
    this.callbacks = {
      onOpen: [],
      onClose: [],
      onToggle: []
    };

    // 스타일 초기화
    if (this.panel) {
      this.panel.style.transform = '';
      this.panel.style.transition = '';
    }
  }
}
