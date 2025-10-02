/**
 * PanelController - 우측 패널 컨트롤러 (Intermediary용)
 * 우측 패널 슬라이딩 애니메이션 및 아이콘별 기능 패널 관리
 */

export class PanelController {
  constructor(options = {}) {
    this.options = {
      rightPanelId: options.rightPanelId || 'right-side-panel',
      ...options
    };

    this.rightPanel = document.getElementById(this.options.rightPanelId);
    this.isRightPanelOpen = true;

    // 우측 기능 패널 정보 (Intermediary 전용)
    this.panels = {
      'broker-dashboard': {
        panel: null, // 동적 생성
        button: null,
        closeButton: null,
        isOpen: false,
        width: 450,
        title: '중개 대시보드'
      },
      'property-requests': {
        panel: null,
        button: null,
        closeButton: null,
        isOpen: false,
        width: 450,
        title: '등록 요청'
      },
      'chat': {
        panel: null,
        button: null,
        closeButton: null,
        isOpen: false,
        width: 450,
        title: '채팅'
      },
      'notifications': {
        panel: null,
        button: null,
        closeButton: null,
        isOpen: false,
        width: 450,
        title: '알림'
      },
      'settings': {
        panel: null,
        button: null,
        closeButton: null,
        isOpen: false,
        width: 450,
        title: '설정'
      }
    };

    this._initialize();
  }

  /**
   * 초기화
   * @private
   */
  _initialize() {
    if (!this.rightPanel) {
      console.error('우측 패널을 찾을 수 없습니다.');
      return;
    }

    // 우측 패널 토글 버튼 설정
    this._setupRightPanelToggle();

    // 기능 패널들 동적 생성
    this._createFunctionalPanels();

    console.log('패널 컨트롤러 초기화 완료');
  }

  /**
   * 우측 패널 토글 버튼 설정
   * @private
   */
  _setupRightPanelToggle() {
    const toggleButton = document.getElementById('right-panel-toggle-button');
    const openIcon = document.getElementById('right-open-icon');
    const closeIcon = document.getElementById('right-close-icon');
    const searchBar = document.getElementById('search-bar-container');

    if (toggleButton) {
      toggleButton.addEventListener('click', () => {
        this.isRightPanelOpen = !this.isRightPanelOpen;

        if (this.isRightPanelOpen) {
          this.rightPanel.classList.remove('translate-x-full');
          toggleButton.style.right = '75px';
          if (searchBar) searchBar.style.right = '99px';
          openIcon?.classList.add('hidden');
          closeIcon?.classList.remove('hidden');
        } else {
          // 모든 기능 패널 닫기
          this.closeAllPanels();

          this.rightPanel.classList.add('translate-x-full');
          toggleButton.style.right = '0px';
          if (searchBar) searchBar.style.right = '24px';
          openIcon?.classList.remove('hidden');
          closeIcon?.classList.add('hidden');
        }
      });
    }
  }

  /**
   * 기능 패널들 동적 생성
   * @private
   */
  _createFunctionalPanels() {
    // 우측 패널 아이콘 버튼들 가져오기 (로그아웃 버튼, 위임요청 버튼 제외)
    const allButtons = this.rightPanel.querySelectorAll('button');
    const iconButtons = Array.from(allButtons).filter(btn =>
      btn.id !== 'logout-button' && btn.id !== 'delegation-request-button'
    );

    // 각 아이콘에 ID 부여 및 기능 패널 생성
    iconButtons.forEach((button, index) => {
      const panelKeys = Object.keys(this.panels);
      if (index < panelKeys.length) {
        const panelKey = panelKeys[index];
        const panelInfo = this.panels[panelKey];

        // 버튼에 ID 부여
        button.id = `${panelKey}-button`;
        panelInfo.button = button;

        // 기능 패널 생성
        const panel = this._createPanel(panelKey, panelInfo);
        panelInfo.panel = panel;

        // 버튼 클릭 이벤트
        button.addEventListener('click', () => {
          this.showPanel(panelKey);
        });
      }
    });
  }

  /**
   * 패널 DOM 생성
   * @private
   */
  _createPanel(panelKey, panelInfo) {
    const panel = document.createElement('aside');
    panel.id = `${panelKey}-panel`;
    panel.className = 'fixed top-0 right-[75px] w-[450px] h-full bg-white shadow-2xl z-35 transform translate-x-full transition-transform duration-300 ease-in-out overflow-hidden flex flex-col';
    panel.style.display = 'none'; // 초기에 숨김

    // 패널 헤더
    const header = document.createElement('div');
    header.className = 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 flex justify-between items-center shadow-md';
    header.innerHTML = `
      <h2 class="text-xl font-bold">${panelInfo.title}</h2>
      <button id="close-${panelKey}-panel" class="hover:bg-white/20 rounded-full p-2 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    `;

    // 패널 콘텐츠
    const content = document.createElement('div');
    content.className = 'flex-grow overflow-y-auto p-4 custom-scrollbar';
    content.id = `${panelKey}-content`;
    content.innerHTML = this._getPanelContent(panelKey);

    panel.appendChild(header);
    panel.appendChild(content);

    // 닫기 버튼 이벤트
    const closeButton = header.querySelector(`#close-${panelKey}-panel`);
    panelInfo.closeButton = closeButton;
    closeButton.addEventListener('click', () => {
      this.hidePanel(panelKey);
    });

    // DOM에 추가
    document.body.appendChild(panel);

    return panel;
  }

  /**
   * 패널별 초기 콘텐츠 생성
   * @private
   */
  _getPanelContent(panelKey) {
    switch (panelKey) {
      case 'broker-dashboard':
        return `
          <div class="space-y-4">
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 class="font-semibold text-gray-800 mb-2">오늘의 통계</h3>
              <div class="grid grid-cols-2 gap-3">
                <div class="bg-white rounded p-3 text-center">
                  <p class="text-sm text-gray-600">신규 요청</p>
                  <p class="text-2xl font-bold text-blue-600">3</p>
                </div>
                <div class="bg-white rounded p-3 text-center">
                  <p class="text-sm text-gray-600">진행 중</p>
                  <p class="text-2xl font-bold text-yellow-600">5</p>
                </div>
                <div class="bg-white rounded p-3 text-center">
                  <p class="text-sm text-gray-600">완료</p>
                  <p class="text-2xl font-bold text-green-600">12</p>
                </div>
                <div class="bg-white rounded p-3 text-center">
                  <p class="text-sm text-gray-600">총 매물</p>
                  <p class="text-2xl font-bold text-gray-700">28</p>
                </div>
              </div>
            </div>
            <div class="bg-gray-50 rounded-lg p-4">
              <h3 class="font-semibold text-gray-800 mb-2">최근 활동</h3>
              <p class="text-sm text-gray-600">최근 활동 내역이 여기에 표시됩니다.</p>
            </div>
          </div>
        `;

      case 'property-requests':
        return `
          <div class="space-y-3">
            <h3 class="font-semibold text-gray-800">새로운 등록 요청</h3>
            <p class="text-sm text-gray-600">매물 등록 요청 목록이 여기에 표시됩니다.</p>
            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p class="text-sm text-yellow-800">처리 대기 중인 요청이 3건 있습니다.</p>
            </div>
          </div>
        `;

      case 'chat':
        return `
          <div class="space-y-3">
            <h3 class="font-semibold text-gray-800">채팅</h3>
            <p class="text-sm text-gray-600">고객과의 채팅 내역이 여기에 표시됩니다.</p>
          </div>
        `;

      case 'notifications':
        return `
          <div class="space-y-3">
            <h3 class="font-semibold text-gray-800">알림</h3>
            <p class="text-sm text-gray-600">새로운 알림이 여기에 표시됩니다.</p>
          </div>
        `;

      case 'settings':
        return `
          <div class="space-y-4">
            <h3 class="font-semibold text-gray-800">설정</h3>
            <div class="space-y-3">
              <div class="border-b pb-3">
                <label class="flex items-center justify-between">
                  <span class="text-sm text-gray-700">알림 받기</span>
                  <input type="checkbox" checked class="toggle-checkbox">
                </label>
              </div>
              <div class="border-b pb-3">
                <label class="flex items-center justify-between">
                  <span class="text-sm text-gray-700">자동 응답</span>
                  <input type="checkbox" class="toggle-checkbox">
                </label>
              </div>
            </div>
          </div>
        `;

      default:
        return '<p class="text-gray-600">콘텐츠를 로드 중입니다...</p>';
    }
  }

  /**
   * 패널 표시 (우->좌 슬라이딩)
   * @param {string} panelKey - 패널 키
   */
  showPanel(panelKey) {
    const panelInfo = this.panels[panelKey];
    if (!panelInfo || !panelInfo.panel) {
      console.warn(`패널을 찾을 수 없습니다: ${panelKey}`);
      return;
    }

    // 다른 모든 패널 닫기
    Object.keys(this.panels).forEach(key => {
      if (key !== panelKey && this.panels[key].isOpen) {
        this.hidePanel(key);
      }
    });

    // 패널 표시 및 슬라이드 인
    panelInfo.panel.style.display = 'flex';
    // display 변경 후 약간의 지연을 두고 애니메이션 시작
    setTimeout(() => {
      panelInfo.panel.classList.remove('translate-x-full');
    }, 10);
    panelInfo.isOpen = true;

    console.log(`패널 열림: ${panelKey}`);
  }

  /**
   * 패널 숨기기 (좌->우 슬라이딩)
   * @param {string} panelKey - 패널 키
   */
  hidePanel(panelKey) {
    const panelInfo = this.panels[panelKey];
    if (!panelInfo || !panelInfo.panel) {
      console.warn(`패널을 찾을 수 없습니다: ${panelKey}`);
      return;
    }

    // 패널 슬라이드 아웃
    panelInfo.panel.classList.add('translate-x-full');
    panelInfo.isOpen = false;

    // 애니메이션 완료 후 display none
    setTimeout(() => {
      if (!panelInfo.isOpen) {
        panelInfo.panel.style.display = 'none';
      }
    }, 300); // transition duration과 동일

    console.log(`패널 닫힘: ${panelKey}`);
  }

  /**
   * 패널 토글
   * @param {string} panelKey - 패널 키
   */
  togglePanel(panelKey) {
    const panelInfo = this.panels[panelKey];
    if (!panelInfo) return;

    if (panelInfo.isOpen) {
      this.hidePanel(panelKey);
    } else {
      this.showPanel(panelKey);
    }
  }

  /**
   * 모든 패널 닫기
   */
  closeAllPanels() {
    Object.keys(this.panels).forEach(key => {
      if (this.panels[key].isOpen) {
        this.hidePanel(key);
      }
    });
  }

  /**
   * 패널 콘텐츠 업데이트
   * @param {string} panelKey - 패널 키
   * @param {string|HTMLElement} content - 새 콘텐츠
   */
  updatePanelContent(panelKey, content) {
    const panelInfo = this.panels[panelKey];
    if (!panelInfo || !panelInfo.panel) {
      console.warn(`패널을 찾을 수 없습니다: ${panelKey}`);
      return;
    }

    const contentElement = panelInfo.panel.querySelector(`#${panelKey}-content`);
    if (contentElement) {
      if (typeof content === 'string') {
        contentElement.innerHTML = content;
      } else if (content instanceof HTMLElement) {
        contentElement.innerHTML = '';
        contentElement.appendChild(content);
      }
    }
  }

  /**
   * 패널 상태 가져오기
   * @returns {Object}
   */
  getState() {
    const panelStates = {};
    Object.keys(this.panels).forEach(key => {
      panelStates[key] = this.panels[key].isOpen;
    });

    return {
      isRightPanelOpen: this.isRightPanelOpen,
      panels: panelStates
    };
  }

  /**
   * 리소스 정리
   */
  destroy() {
    this.closeAllPanels();

    // 생성된 패널 DOM 제거
    Object.keys(this.panels).forEach(key => {
      const panelInfo = this.panels[key];
      if (panelInfo.panel && panelInfo.panel.parentNode) {
        panelInfo.panel.parentNode.removeChild(panelInfo.panel);
      }
    });

    this.isRightPanelOpen = false;
  }
}
