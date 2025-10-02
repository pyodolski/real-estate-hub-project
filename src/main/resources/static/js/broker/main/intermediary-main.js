/**
 * IntermediaryController - Intermediary.html 메인 컨트롤러
 * 중개인 페이지 초기화 및 관리 (지도 기능 통합)
 */

import { MapManager } from '../../shared/map/map-manager.js';
import { MarkerManager } from '../../shared/map/marker-manager.js';
import { PropertyService } from '../../shared/services/property-service.js';
import { AuthService } from '../../shared/services/auth-service.js';
import { MapIntegration } from './map-integration.js';
import { PanelController } from './panel-controller.js';
import { FilterIntegration } from './filter-integration.js';
import { PropertyDetail } from './property-detail.js';

export class IntermediaryController {
  constructor() {
    this.mapManager = null;
    this.markerManager = null;
    this.mapIntegration = null;
    this.panelController = null;
    this.filterIntegration = null;
    this.propertyDetail = null;
    this.propertyService = new PropertyService();
    this.authService = new AuthService();

    this.isInitialized = false;

    // 기존 intermediary.js의 상태 유지
    this.isPanelOpen = true;
    this.isPanelExpanded = false;
    this.isRightPanelOpen = true;

    // 샘플 데이터
    this.registrationRequests = [
      {
        id: 101,
        image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=800&auto=format&fit=crop",
        price: "월세 500/95",
        location: "성동구 성수동1가",
        details: "오피스텔 ∙ 5층 ∙ 25.5m²",
        requester: { name: "박선호", contact: "010-1111-2222" }
      },
      {
        id: 102,
        image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=800&auto=format&fit=crop",
        price: "매매 12억",
        location: "용산구 이촌동",
        details: "아파트 ∙ 11층 ∙ 110.2m²",
        requester: { name: "이하나", contact: "010-3333-4444" }
      },
      {
        id: 103,
        image: "https://images.unsplash.com/photo-1598228723793-52759bba239c?q=80&w=800&auto=format&fit=crop",
        price: "전세 4억 5,000",
        location: "송파구 잠실동",
        details: "빌라 ∙ 3층 ∙ 68.0m²",
        requester: { name: "최민준", contact: "010-5555-6666" }
      }
    ];

    this.agentProperties = [
      {
        id: 1,
        image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=800&auto=format&fit=crop",
        price: "전세 1억 3,500",
        location: "관악구 봉천동",
        details: "원룸 ∙ 2층 ∙ 33.06m²",
        status: "active"
      },
      {
        id: 2,
        image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=800&auto=format&fit=crop",
        price: "전세 1억 9,800",
        location: "관악구 신림동",
        details: "기타 ∙ 고층 ∙ 13.74m²",
        status: "active"
      },
      {
        id: 3,
        image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=800&auto=format&fit=crop",
        price: "월세 3000/80",
        location: "동작구 상도동",
        details: "투룸 ∙ 3층 ∙ 45.12m²",
        status: "pending"
      },
      {
        id: 4,
        image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop",
        price: "매매 5억 2,000",
        location: "강남구 역삼동",
        details: "아파트 ∙ 15층 ∙ 84.9m²",
        status: "done"
      },
      {
        id: 5,
        image: "https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=800&auto=format&fit=crop",
        price: "전세 2억 5,000",
        location: "마포구 서교동",
        details: "오피스텔 ∙ 10층 ∙ 28.5m²",
        status: "active"
      }
    ];
  }

  /**
   * 전체 초기화
   */
  async initialize() {
    if (this.isInitialized) {
      console.warn('IntermediaryController가 이미 초기화되었습니다.');
      return;
    }

    try {
      console.log('Intermediary 페이지 초기화 시작...');

      // 인증 확인
      await this._checkAuthentication();

      // 지도 초기화
      await this.initializeMap();

      // 기존 패널 관리 기능 유지
      this._initializePanels();

      // 우측 패널 컨트롤러 초기화
      this.initializeRightPanels();

      // 필터 통합 초기화
      this.initializeFilterIntegration();

      // 매물 상세 정보 초기화
      this.initializePropertyDetail();

      // 로그아웃 버튼 초기화
      this._initializeLogout();

      this.isInitialized = true;
      console.log('Intermediary 페이지 초기화 완료');
    } catch (error) {
      console.error('Intermediary 페이지 초기화 실패:', error);
      throw error;
    }
  }

  /**
   * 인증 확인
   * @private
   */
  async _checkAuthentication() {
    if (!this.authService.isAuthenticated()) {
      alert('로그인이 필요합니다.');
      window.location.href = '/loginX.html';
      throw new Error('Unauthorized');
    }

    try {
      const user = await this.authService.getCurrentUser();
      console.log('현재 사용자:', user);

      // 중개인 권한 확인 (선택사항)
      if (user.role !== 'BROKER' && user.role !== 'ADMIN') {
        console.warn('중개인 권한이 없는 사용자입니다.');
        // alert('중개인 전용 페이지입니다.');
        // window.location.href = '/loginO.html';
      }
    } catch (error) {
      if (error.message === 'Unauthorized') {
        alert('세션이 만료되었습니다. 다시 로그인해주세요.');
        window.location.href = '/loginX.html';
        throw error;
      }
    }
  }

  /**
   * 지도 초기화
   */
  async initializeMap() {
    try {
      // 지도 컨테이너가 있는지 확인 (없으면 생성)
      let mapContainer = document.getElementById('map');
      if (!mapContainer) {
        // 기존 placeholder를 지도 컨테이너로 변경
        const placeholder = document.querySelector('main > div');
        if (placeholder) {
          placeholder.id = 'map';
          placeholder.className = 'absolute inset-0';
          placeholder.innerHTML = ''; // placeholder 텍스트 제거
          mapContainer = placeholder;
        } else {
          console.error('지도 컨테이너를 찾을 수 없습니다.');
          return;
        }
      }

      // MapManager 생성
      this.mapManager = new MapManager('map', {
        lat: 37.5665,
        lng: 126.9780,
        zoom: 13,
        zoomControl: false
      });

      // 지도 초기화
      const map = await this.mapManager.initializeMap();

      // MarkerManager 생성
      this.markerManager = new MarkerManager(map);

      // MapIntegration 생성
      this.mapIntegration = new MapIntegration(
        this.mapManager,
        this.markerManager,
        this.propertyService
      );

      // 지도 초기 로드
      await this.mapIntegration.initialize();

      console.log('지도 초기화 완료');
    } catch (error) {
      console.error('지도 초기화 실패:', error);
      // 지도 초기화 실패해도 페이지는 계속 동작
    }
  }

  /**
   * 패널 초기화 (기존 intermediary.js 로직 유지)
   * @private
   */
  _initializePanels() {
    const sidePanel = document.getElementById('side-panel');
    const searchBarContainer = document.getElementById('search-bar-container');
    const mainContent = document.querySelector('main');
    const rightSidePanel = document.getElementById('right-side-panel');
    const rightToggleButton = document.getElementById('right-panel-toggle-button');
    const rightOpenIcon = document.getElementById('right-open-icon');
    const rightCloseIcon = document.getElementById('right-close-icon');

    const openPanelButton = document.getElementById('open-panel-button');
    const closePanelButton = document.getElementById('close-panel-button');
    const expandPanelButton = document.getElementById('expand-panel-button');
    const collapseFullscreenButton = document.getElementById('collapse-fullscreen-button');
    const addListingContainer = document.getElementById('add-listing-container');

    const requestListContainer = document.getElementById('registration-requests');
    const propertyListContainer = document.getElementById('agent-property-list');

    // 샘플 데이터 렌더링
    this._renderSampleData();

    // UI 업데이트 함수
    const updateUIVisibility = () => {
      if (this.isPanelExpanded) {
        sidePanel?.classList.remove('w-[450px]');
        sidePanel?.classList.add('w-full', 'z-50');
        addListingContainer?.classList.add('mr-16');

        requestListContainer?.classList.remove('flex', 'flex-col', 'space-y-4');
        propertyListContainer?.classList.remove('flex', 'flex-col', 'space-y-4');
        requestListContainer?.classList.add('grid', 'grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3', 'xl:grid-cols-4', 'gap-4');
        propertyListContainer?.classList.add('grid', 'grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3', 'xl:grid-cols-4', 'gap-4');

        mainContent?.classList.add('hidden');
        rightSidePanel?.classList.add('hidden');
        rightToggleButton?.classList.add('hidden');

        openPanelButton?.classList.add('opacity-0', 'pointer-events-none');
        closePanelButton?.classList.add('opacity-0', 'pointer-events-none');
        expandPanelButton?.classList.add('opacity-0', 'pointer-events-none');
        collapseFullscreenButton?.classList.remove('hidden');
      } else {
        sidePanel?.classList.add('w-[450px]');
        sidePanel?.classList.remove('w-full', 'z-50');
        addListingContainer?.classList.remove('mr-16');

        requestListContainer?.classList.add('flex', 'flex-col', 'space-y-4');
        propertyListContainer?.classList.add('flex', 'flex-col', 'space-y-4');
        requestListContainer?.classList.remove('grid', 'grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3', 'xl:grid-cols-4', 'gap-4');
        propertyListContainer?.classList.remove('grid', 'grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3', 'xl:grid-cols-4', 'gap-4');

        mainContent?.classList.remove('hidden');
        rightSidePanel?.classList.remove('hidden');
        rightToggleButton?.classList.remove('hidden');
        collapseFullscreenButton?.classList.add('hidden');

        if (this.isPanelOpen) {
          sidePanel?.classList.remove('-translate-x-full');
          if (searchBarContainer) searchBarContainer.style.left = '474px';
          if (closePanelButton) closePanelButton.style.left = '450px';
          if (expandPanelButton) expandPanelButton.style.left = '450px';

          closePanelButton?.classList.remove('opacity-0', 'pointer-events-none');
          expandPanelButton?.classList.remove('opacity-0', 'pointer-events-none');
          openPanelButton?.classList.add('opacity-0', 'pointer-events-none');
        } else {
          sidePanel?.classList.add('-translate-x-full');
          if (searchBarContainer) searchBarContainer.style.left = '24px';
          if (closePanelButton) closePanelButton.style.left = '0px';
          if (expandPanelButton) expandPanelButton.style.left = '0px';

          closePanelButton?.classList.add('opacity-0', 'pointer-events-none');
          expandPanelButton?.classList.add('opacity-0', 'pointer-events-none');
          openPanelButton?.classList.remove('opacity-0', 'pointer-events-none');
        }
      }
    };

    // 이벤트 리스너
    closePanelButton?.addEventListener('click', () => {
      this.isPanelOpen = false;
      updateUIVisibility();
    });

    openPanelButton?.addEventListener('click', () => {
      this.isPanelOpen = true;
      updateUIVisibility();
    });

    expandPanelButton?.addEventListener('click', () => {
      this.isPanelExpanded = true;
      updateUIVisibility();
    });

    collapseFullscreenButton?.addEventListener('click', () => {
      this.isPanelExpanded = false;
      updateUIVisibility();
    });

    // 우측 패널 토글
    rightToggleButton?.addEventListener('click', () => {
      this.isRightPanelOpen = !this.isRightPanelOpen;
      if (this.isRightPanelOpen) {
        rightSidePanel?.classList.remove('translate-x-full');
        if (rightToggleButton) rightToggleButton.style.right = '75px';
        if (searchBarContainer) searchBarContainer.style.right = '99px';
        rightOpenIcon?.classList.add('hidden');
        rightCloseIcon?.classList.remove('hidden');
      } else {
        rightSidePanel?.classList.add('translate-x-full');
        if (rightToggleButton) rightToggleButton.style.right = '0px';
        if (searchBarContainer) searchBarContainer.style.right = '24px';
        rightOpenIcon?.classList.remove('hidden');
        rightCloseIcon?.classList.add('hidden');
      }
    });

    // 필터 버튼 이벤트 초기화
    this._initializeFilterButtons();

    // 초기 UI 상태 설정
    updateUIVisibility();
  }

  /**
   * 필터 버튼 이벤트 초기화
   * @private
   */
  _initializeFilterButtons() {
    const searchBar = document.getElementById('search-bar-container');
    if (!searchBar) return;

    // 모든 필터 버튼 가져오기
    const filterButtons = searchBar.querySelectorAll('button');

    filterButtons.forEach((button, index) => {
      const buttonText = button.textContent.trim();

      button.addEventListener('click', () => {
        console.log(`필터 버튼 클릭: ${buttonText}`);

        // 버튼에 active 상태 토글 (시각적 피드백)
        button.classList.toggle('bg-blue-100');
        button.classList.toggle('text-blue-700');

        // 실제 필터 로직은 FilterIntegration에서 처리
        if (this.filterIntegration) {
          // 간단한 필터 적용 예시
          console.log('필터 적용 예정:', buttonText);
        }
      });
    });

    console.log(`필터 버튼 ${filterButtons.length}개 초기화 완료`);
  }

  /**
   * 우측 패널 초기화
   */
  initializeRightPanels() {
    try {
      this.panelController = new PanelController({
        rightPanelId: 'right-side-panel'
      });

      console.log('우측 패널 컨트롤러 초기화 완료');
    } catch (error) {
      console.error('우측 패널 컨트롤러 초기화 실패:', error);
    }
  }

  /**
   * 필터 통합 초기화
   */
  initializeFilterIntegration() {
    try {
      if (!this.mapIntegration) {
        console.warn('지도 통합이 초기화되지 않아 필터 통합을 건너뜁니다.');
        return;
      }

      this.filterIntegration = new FilterIntegration(this.mapIntegration);

      // 필터 적용 이벤트 리스너
      this.filterIntegration.addEventListener('filterApply', (filters) => {
        console.log('필터 적용됨:', filters);
      });

      console.log('필터 통합 초기화 완료');
    } catch (error) {
      console.error('필터 통합 초기화 실패:', error);
    }
  }

  /**
   * 매물 상세 정보 초기화
   */
  initializePropertyDetail() {
    try {
      if (!this.panelController) {
        console.warn('패널 컨트롤러가 초기화되지 않아 매물 상세 정보를 건너뜁니다.');
        return;
      }

      this.propertyDetail = new PropertyDetail(this.panelController);

      // 지도 통합과 연결 - 매물 클릭 시 상세 정보 표시
      if (this.mapIntegration) {
        this.mapIntegration.addEventListener('propertyClick', (data) => {
          if (data && data.id) {
            this.propertyDetail.showPropertyDetail(data.id);
          } else {
            this.propertyDetail.hidePropertyDetail();
          }
        });
      }

      console.log('매물 상세 정보 초기화 완료');
    } catch (error) {
      console.error('매물 상세 정보 초기화 실패:', error);
    }
  }

  /**
   * 로그아웃 처리
   */
  async handleLogout() {
    if (confirm('로그아웃 하시겠습니까?')) {
      try {
        await this.authService.logout();
        window.location.href = '/loginX.html';
      } catch (error) {
        console.error('로그아웃 실패:', error);
        this.authService.clearTokens();
        window.location.href = '/loginX.html';
      }
    }
  }

  /**
   * 로그아웃 버튼 초기화
   * @private
   */
  _initializeLogout() {
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
      logoutButton.addEventListener('click', () => {
        this.handleLogout();
      });
    }
  }

  /**
   * 매물 수정 처리 (중개인 전용)
   * @param {string|number} propertyId - 매물 ID
   */
  handleEditProperty(propertyId) {
    console.log('매물 수정:', propertyId);
    // TODO: 매물 수정 모달 또는 페이지로 이동
    alert(`매물 ${propertyId} 수정 기능은 구현 예정입니다.`);
  }

  /**
   * 소유주 연락 처리 (중개인 전용)
   * @param {string|number} propertyId - 매물 ID
   */
  handleContactOwner(propertyId) {
    console.log('소유주 연락:', propertyId);
    // TODO: 채팅 또는 연락처 표시
    alert(`매물 ${propertyId} 소유주 연락 기능은 구현 예정입니다.`);
  }

  /**
   * 샘플 데이터 렌더링
   * @private
   */
  _renderSampleData() {
    const requestListContainer = document.getElementById('registration-requests');
    const propertyListContainer = document.getElementById('agent-property-list');

    if (requestListContainer) {
      requestListContainer.innerHTML = this.registrationRequests.map(req => this._createRequestCard(req)).join('');
    }

    if (propertyListContainer) {
      propertyListContainer.innerHTML = this.agentProperties.map(prop => this._createAgentPropertyCard(prop)).join('');
    }
  }

  /**
   * 등록 요청 카드 생성
   * @private
   */
  _createRequestCard(request) {
    return `
      <div class="bg-white rounded-lg shadow-md overflow-hidden transition-shadow hover:shadow-xl border-l-4 border-indigo-500">
        <img src="${request.image}" alt="매물 사진" class="w-full h-48 object-cover">
        <div class="p-4">
          <div>
            <h3 class="font-bold text-lg text-gray-900">${request.price}</h3>
            <p class="text-gray-600 text-sm mt-1">${request.location}</p>
            <p class="text-gray-500 text-xs my-2">${request.details}</p>
          </div>
          <div class="flex justify-between items-center mt-3 pt-3 border-t">
            <p class="text-xs text-gray-600 font-medium">요청자: ${request.requester.name} (${request.requester.contact})</p>
            <div class="flex items-center gap-2">
              <button class="text-sm bg-green-100 text-green-700 px-4 py-1.5 rounded-md hover:bg-green-200">승인</button>
              <button class="text-sm bg-gray-200 text-gray-800 px-4 py-1.5 rounded-md hover:bg-gray-300">거절</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 관리 매물 카드 생성
   * @private
   */
  _createAgentPropertyCard(property) {
    return `
      <div class="bg-white rounded-lg shadow-md overflow-hidden transition-shadow hover:shadow-xl">
        <img src="${property.image}" alt="매물 사진" class="w-full h-48 object-cover">
        <div class="p-4">
          <div>
            <div class="flex justify-between items-start">
              <h3 class="font-bold text-lg text-gray-900">${property.price}</h3>
              ${this._getStatusBadge(property.status)}
            </div>
            <p class="text-gray-600 text-sm mt-1">${property.location}</p>
            <p class="text-gray-500 text-xs my-2">${property.details}</p>
          </div>
          <div class="flex justify-end items-center gap-2 mt-3 pt-3 border-t">
            <button class="text-sm bg-gray-200 text-gray-800 px-4 py-1.5 rounded-md hover:bg-gray-300">수정</button>
            <button class="text-sm bg-red-100 text-red-700 px-4 py-1.5 rounded-md hover:bg-red-200">삭제</button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 상태 뱃지 생성
   * @private
   */
  _getStatusBadge(status) {
    switch (status) {
      case 'active':
        return '<span class="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">광고중</span>';
      case 'pending':
        return '<span class="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">거래진행</span>';
      case 'done':
        return '<span class="bg-gray-200 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">거래완료</span>';
      default:
        return '';
    }
  }

  /**
   * 리소스 정리
   */
  destroy() {
    if (this.mapManager) {
      this.mapManager.destroy();
    }

    if (this.markerManager) {
      this.markerManager.destroy();
    }

    if (this.mapIntegration) {
      this.mapIntegration.destroy();
    }

    if (this.panelController) {
      this.panelController.destroy();
    }

    if (this.filterIntegration) {
      this.filterIntegration.destroy();
    }

    if (this.propertyDetail) {
      this.propertyDetail.destroy();
    }

    this.isInitialized = false;
  }
}

// 전역 인스턴스 생성 및 초기화
let intermediaryController;

document.addEventListener('DOMContentLoaded', async () => {
  try {
    intermediaryController = new IntermediaryController();
    await intermediaryController.initialize();

    // 전역에서 접근 가능하도록 설정 (디버깅용)
    window.intermediaryController = intermediaryController;
  } catch (error) {
    console.error('Intermediary 컨트롤러 초기화 실패:', error);
  }
});

// 페이지 언로드 시 리소스 정리
window.addEventListener('beforeunload', () => {
  if (intermediaryController) {
    intermediaryController.destroy();
  }
});
