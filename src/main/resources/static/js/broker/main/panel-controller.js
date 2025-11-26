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

    this.panels = {
      'broker-dashboard': {
        panel: null,
        button: null,
        closeButton: null,
        isOpen: false,
        width: 450,
        title: '중개 대시보드'
      },
      'chat': {
        panel: null,
        button: null,
        closeButton: null,
        isOpen: false,
        width: 450,
        title: '채팅 목록'
      },
      /*
      'settings': {
        panel: null,
        button: null,
        closeButton: null,
        isOpen: false,
        width: 450,
        title: '설정'
      },
      */
      'delegation-request': {
        panel: null,
        button: null,
        closeButton: null,
        isOpen: false,
        width: 450,
        title: '등록 요청'
      },
      /*
      'notifications': {
        panel: null,
        button: null,
        closeButton: null,
        isOpen: false,
        width: 450,
        title: '알림'
      }
      */
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
    // 우측 패널 아이콘 버튼들 가져오기 (로그아웃 버튼 제외)
    const allButtons = this.rightPanel.querySelectorAll('button');
    const iconButtons = Array.from(allButtons).filter(btn =>
      btn.id !== 'logout-button'
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
          this.togglePanel(panelKey);
        });
      }
    });
  }

  /**
   * 패널 DOM 생성
   * @private
   */
  _createPanel(panelKey, panelInfo) {
    // 이미 존재하는 패널이 있는지 확인 (예: HTML에 하드코딩된 경우)
    // delegation-request의 경우 ID가 delegation-request-panel임 (규칙 일치)
    let panel = document.getElementById(`${panelKey}-panel`);
    const isExisting = !!panel;

    if (!panel) {
      panel = document.createElement('aside');
      panel.id = `${panelKey}-panel`;
      panel.className = 'fixed top-0 right-[75px] w-[450px] h-full bg-white shadow-2xl z-50 transform translate-x-full transition-transform duration-300 ease-in-out overflow-hidden flex flex-col';
      panel.style.display = 'none'; // 초기에 숨김
      document.body.appendChild(panel);
    } else {
      // 기존 패널이 있으면 클래스 보정 (필요 시)
      // z-index 등 스타일 동기화
      panel.classList.add('z-50');
      panel.classList.remove('z-20'); // 기존 z-20 제거
    }

    // 패널 헤더 및 콘텐츠 생성 (기존 패널이 없거나 비어있는 경우에만)
    // 단, chat 패널은 ChatController가 관리하므로 제외
    // delegation-request 패널은 HTML에 이미 구조가 있으므로 제외
    if (!isExisting && panelKey !== 'chat') {
      const header = document.createElement('div');
      header.className = 'flex justify-between items-center mb-4 pb-4 border-b flex-shrink-0 px-6 pt-6';
      header.innerHTML = `
        <h2 class="text-xl font-bold text-gray-800">${panelInfo.title}</h2>
        <button id="close-${panelKey}-panel" class="p-2 rounded-full hover:bg-gray-200 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      `;
      panel.appendChild(header);

      const content = document.createElement('div');
      content.className = 'flex-grow overflow-y-auto px-6 pb-6 custom-scrollbar';
      content.id = `${panelKey}-content`;
      content.innerHTML = this._getPanelContent(panelKey);
      panel.appendChild(content);
    } else if (panelKey === 'chat' && !isExisting) {
       // 채팅 패널 신규 생성 시
       const content = document.createElement('div');
       content.className = 'flex-grow flex flex-col h-full overflow-hidden';
       content.id = `${panelKey}-content`;
       content.innerHTML = this._getPanelContent(panelKey);
       panel.appendChild(content);
    }

    // 닫기 버튼 이벤트 연결
    // 기존 패널의 경우 닫기 버튼 ID가 다를 수 있음 (예: close-delegation-panel)
    let closeBtnId = `close-${panelKey}-panel`;
    if (panelKey === 'delegation-request') {
      closeBtnId = 'close-delegation-panel'; // 하드코딩된 ID
    }

    const closeButton = panel.querySelector(`#${closeBtnId}`);
    if (closeButton) {
      panelInfo.closeButton = closeButton;
      // 기존 리스너가 있을 수 있으므로 cloneNode로 초기화하거나, 
      // BrokerDelegationManagement에서 리스너를 제거했으므로 그냥 추가
      closeButton.addEventListener('click', () => {
        this.hidePanel(panelKey);
      });
    }

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

      case 'delegation-request':
        return `
          <!-- 필터 탭 -->
          <div class="mb-4 flex-shrink-0 p-4 pb-0">
            <div class="flex border-b border-gray-200">
              <button
                id="pending-tab"
                class="flex-1 px-4 py-2 text-center border-b-2 border-blue-500 text-blue-600 font-medium"
                onclick="brokerDelegation.filterByStatus('PENDING')"
              >
                대기 중
              </button>
              <button
                id="approved-tab"
                class="flex-1 px-4 py-2 text-center border-b-2 border-transparent text-gray-500 hover:text-gray-700"
                onclick="brokerDelegation.filterByStatus('APPROVED')"
              >
                승인됨
              </button>
              <button
                id="rejected-tab"
                class="flex-1 px-4 py-2 text-center border-b-2 border-transparent text-gray-500 hover:text-gray-700"
                onclick="brokerDelegation.filterByStatus('REJECTED')"
              >
                거절됨
              </button>
              <button
                id="all-tab"
                class="flex-1 px-4 py-2 text-center border-b-2 border-transparent text-gray-500 hover:text-gray-700"
                onclick="brokerDelegation.filterByStatus('ALL')"
              >
                전체
              </button>
            </div>
          </div>

          <!-- 요청 통계 -->
          <div class="mb-4 flex-shrink-0 px-4">
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div class="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div id="pending-count" class="text-lg font-bold text-orange-600">
                    0
                  </div>
                  <div class="text-xs text-gray-600">대기 중</div>
                </div>
                <div>
                  <div id="approved-count" class="text-lg font-bold text-green-600">
                    0
                  </div>
                  <div class="text-xs text-gray-600">승인됨</div>
                </div>
                <div>
                  <div id="rejected-count" class="text-lg font-bold text-red-600">
                    0
                  </div>
                  <div class="text-xs text-gray-600">거절됨</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 스크롤 가능한 요청 목록 영역 -->
          <div class="flex-grow overflow-y-auto custom-scrollbar px-4 pb-4">
            <div id="delegation-request-list" class="space-y-4">
              <!-- JavaScript로 위임 요청 목록이 여기에 추가됩니다 -->
              <div class="text-center text-gray-500 mt-10">데이터를 불러오는 중...</div>
            </div>
          </div>
        `;

      case 'chat':
        return `
          <div id="chat-panel-container" class="h-full flex flex-col">
            <!-- 채팅 패널 콘텐츠는 chat-controller.js에서 렌더링됩니다 -->
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

    // 채팅 패널인 경우 채팅 목록 렌더링
    if (panelKey === 'chat' && window.ChatController) {
      setTimeout(() => {
        window.ChatController.renderChatList();
      }, 100);
    }
    
    // 위임 요청 패널인 경우 데이터 로드
    if (panelKey === 'delegation-request' && window.brokerDelegation) {
      setTimeout(() => {
        window.brokerDelegation.loadDelegationRequests();
      }, 100);
    }

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
