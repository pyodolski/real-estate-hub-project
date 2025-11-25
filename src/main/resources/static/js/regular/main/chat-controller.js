import { ChatService } from '../../shared/services/chat-service.js';
import { authService } from '../../shared/services/auth-service.js';

/**
 * 채팅 기능 제어 컨트롤러
 */
export const ChatController = {
    currentRoomId: null,
    pollingInterval: null,
    currentUser: null,
    allRooms: [], // 전체 채팅방 목록 저장용
    lastMessageSignature: null, // 메시지 변경 감지용 (ID 또는 타임스탬프 조합)

    async init() {
        this.bindGlobalEvents();
        // 현재 사용자 정보 미리 로드
        if (authService.isAuthenticated()) {
            try {
                this.currentUser = await authService.getCurrentUser();
            } catch (e) {
                console.warn('Failed to load current user', e);
            }
        }
    },

    bindGlobalEvents() {
        document.addEventListener('click', (e) => {
            // 채팅 패널 닫기 버튼
            if (e.target.closest('#close-chat-panel')) {
                this.stopPolling();
                this.currentRoomId = null;
                // 패널 닫기 UI 처리는 panel-manager.js 등에서 처리되거나 여기서 클래스 조작 필요
                // 여기서는 이벤트 버블링을 통해 상위에서 처리되도록 두거나, 직접 닫기 로직 추가
                const panel = document.getElementById('chat-panel');
                if (panel) {
                    panel.classList.add('translate-x-full');
                }
            }
            // 목록으로 돌아가기 버튼
            if (e.target.closest('#back-to-chat-list')) {
                this.renderChatList();
            }
            // 채팅방 목록 아이템 클릭
            const roomItem = e.target.closest('.chat-room-item');
            if (roomItem) {
                const roomId = roomItem.dataset.roomId;
                // 데이터 속성에서 상대방 이름 가져오기 (렌더링 시 넣어둠)
                const opponentName = roomItem.dataset.opponentName || '채팅방';
                if (roomId) this.openChatRoom(roomId, opponentName);
            }
        });

        // 메시지 전송 폼 제출
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'chat-send-form') {
                e.preventDefault();
                const input = document.getElementById('chat-input');
                if (!input) return;

                const content = input.value.trim();
                if (content && this.currentRoomId) {
                    this.sendMessage(this.currentRoomId, content);
                    input.value = ''; // 즉시 비우기
                    input.focus();
                }
            }
        });

        // 채팅방 검색 입력
        document.addEventListener('input', (e) => {
            if (e.target.id === 'chat-search-input') {
                const keyword = e.target.value.trim().toLowerCase();
                this.filterChatList(keyword);
            }
        });
    },

    /**
     * 채팅방 목록 필터링
     */
    filterChatList(keyword) {
        const listContainer = document.getElementById('chat-list');
        if (!listContainer || !window.ChatPanel || !this.currentUser) return;

        if (!keyword) {
            // 검색어 없으면 전체 목록 표시
            listContainer.innerHTML = window.ChatPanel.renderChatListItems(this.allRooms, this.currentUser.id);
            return;
        }

        // 검색어로 필터링 (상대방 이름 기준)
        const filteredRooms = this.allRooms.filter(room => {
            let opponentName = '';
            if (room.opponentNames && room.opponentNames.length > 0) {
                opponentName = room.opponentNames.join(', ');
            } else if (room.opponentUserIds && room.opponentUserIds.length > 0) {
                opponentName = `사용자 ${room.opponentUserIds.join(', ')}`;
            }
            return opponentName.toLowerCase().includes(keyword);
        });

        listContainer.innerHTML = window.ChatPanel.renderChatListItems(filteredRooms, this.currentUser.id);
    },

    /**
     * 채팅 목록 렌더링 (panel-manager.js에서 호출됨)
     */
    async renderChatList() {
        this.stopPolling();
        this.currentRoomId = null;

        // loginO.html의 chat-list 또는 intermediary.html의 chat-panel-container 찾기
        let listContainer = document.getElementById('chat-list');
        const isIntermediaryPage = !listContainer;
        
        if (isIntermediaryPage) {
            const container = document.getElementById('chat-panel-container');
            if (!container) return;
            
            // intermediary.html용 채팅 UI 구조 생성
            container.innerHTML = `
                <div id="chat-header" class="flex justify-between items-center mb-4 pb-4 border-b flex-shrink-0 px-6 pt-6"></div>
                <div id="chat-search-area" class="mb-4 flex-shrink-0">
                  <div class="relative">
                    <input
                      type="text"
                      id="chat-search-input"
                      placeholder="채팅방 검색"
                      class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>
                <div id="chat-content-area" class="flex-grow overflow-y-auto custom-scrollbar">
                    <div id="chat-list" class="space-y-3"></div>
                </div>
            `;
            listContainer = document.getElementById('chat-list');
        }
        
        if (!listContainer) return;

        // 헤더 및 검색 영역 복원
        // 헤더 및 검색 영역 복원
        const header = document.getElementById('chat-header');
        if (header) {
            // Intermediary 페이지용 흰색 헤더 (클래스 체크 대신 항상 흰색 스타일 적용)
            if (!header.classList.contains('bg-gradient-to-r')) {
                header.innerHTML = `
                    <h2 class="text-xl font-bold text-gray-800">채팅 목록</h2>
                    <button id="close-chat-panel" class="p-2 rounded-full hover:bg-gray-200 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                `;
            } else if (window.ChatPanel) {
                // 일반 페이지용 (혹은 그라디언트가 남아있는 경우)
                header.innerHTML = window.ChatPanel.renderListHeader();
            }
        }
        const searchArea = document.getElementById('chat-search-area');
        if (searchArea) searchArea.classList.remove('hidden');

        // 레이아웃 복원 (목록 모드)
        const contentArea = document.getElementById('chat-content-area');
        if (contentArea) {
            contentArea.classList.add('overflow-y-auto', 'custom-scrollbar');
            contentArea.classList.remove('flex', 'flex-col', 'overflow-hidden');
        }
        if (listContainer) {
            listContainer.classList.remove('h-full', 'flex', 'flex-col');
            listContainer.classList.add('space-y-3');
        }

        // 로딩 표시
        listContainer.innerHTML = '<div class="text-center text-gray-500 mt-10">채팅방을 불러오는 중...</div>';

        try {
            if (!authService.isAuthenticated()) {
                listContainer.innerHTML = '<div class="text-center text-gray-500 mt-10">로그인이 필요합니다.</div>';
                return;
            }

            if (!this.currentUser) {
                this.currentUser = await authService.getCurrentUser();
            }

            const rooms = await ChatService.getMyRooms();
            const roomList = rooms.content || rooms;
            this.allRooms = roomList; // 전체 목록 저장

            if (window.ChatPanel) {
                listContainer.innerHTML = window.ChatPanel.renderChatListItems(roomList, this.currentUser.id);
            }
        } catch (e) {
            console.error('채팅 목록 로드 실패:', e);
            listContainer.innerHTML = '<div class="text-center text-red-500 mt-10">목록을 불러오지 못했습니다.</div>';
        }
    },

    /**
     * 채팅방 입장 및 메시지 로드
     * @param {string|number} roomId 
     * @param {string} roomTitle 
     */
    async openChatRoom(roomId, roomTitle = '채팅방') {
        this.currentRoomId = roomId;
        this.lastMessageSignature = null; // 방 변경 시 초기화
        const listContainer = document.getElementById('chat-list');

        // 헤더 변경
        const header = document.getElementById('chat-header');
        if (header) {
            // Intermediary 페이지용 흰색 헤더
            if (!header.classList.contains('bg-gradient-to-r')) {
                header.innerHTML = `
                    <div class="flex items-center">
                        <button id="back-to-chat-list" class="mr-2 p-2 rounded-full hover:bg-gray-200 transition-colors" title="목록으로">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <h2 class="text-xl font-bold text-gray-800 truncate">${roomTitle}</h2>
                    </div>
                    <button id="close-chat-panel" class="p-2 rounded-full hover:bg-gray-200 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                `;
            } else if (window.ChatPanel) {
                header.innerHTML = window.ChatPanel.renderRoomHeader(roomTitle);
            }
        }

        // 검색 영역 숨기기
        const searchArea = document.getElementById('chat-search-area');
        if (searchArea) searchArea.classList.add('hidden');

        // 레이아웃 변경 (채팅방 모드: 입력창 고정)
        const contentArea = document.getElementById('chat-content-area');
        if (contentArea) {
            contentArea.classList.remove('overflow-y-auto', 'custom-scrollbar');
            contentArea.classList.add('flex', 'flex-col', 'overflow-hidden');
        }
        if (listContainer) {
            listContainer.classList.remove('space-y-3');
            listContainer.classList.add('h-full', 'flex', 'flex-col');
        }

        if (listContainer) {
            listContainer.innerHTML = '<div class="text-center mt-10">대화를 불러오는 중...</div>';

            try {
                await this.loadMessages(roomId, true); // 최초 로드
                this.startPolling(roomId);

                // 읽음 처리 (가장 최근 메시지 기준 등 로직 필요하지만, 일단 전체 읽음 처리 호출)
                // 백엔드에 markReadAll 같은 편의 기능이 있다면 좋겠지만, 현재는 markRead(lastMessageId) 형태임.
                // 메시지 로드 후 마지막 메시지 ID로 읽음 처리 시도
                this.markAsRead(roomId);

            } catch (e) {
                console.error('메시지 로드 실패:', e);
                listContainer.innerHTML = '<div class="text-center text-red-500 mt-10">대화를 불러오지 못했습니다.</div>';
            }
        }
    },

    /**
     * 메시지 로드 및 렌더링
     * @param {boolean} isInitial - 최초 로드 여부 (스크롤 처리 등 다름)
     */
    async loadMessages(roomId, isInitial = false) {
        if (this.currentRoomId != roomId) return;

        try {
            const messages = await ChatService.getMessages(roomId);
            const msgList = Array.isArray(messages) ? messages : (messages.content || []);

            // 변경 사항 확인 (팅김 방지)
            // 간단하게 마지막 메시지 ID와 전체 길이를 조합하여 서명 생성
            const lastMsg = msgList.length > 0 ? msgList[msgList.length - 1] : null;
            const currentSignature = lastMsg ? `${msgList.length}-${lastMsg.id}-${lastMsg.sentAt}` : '0';

            if (!isInitial && this.lastMessageSignature === currentSignature) {
                return; // 변경 없음
            }
            this.lastMessageSignature = currentSignature;

            if (!this.currentUser) {
                this.currentUser = await authService.getCurrentUser();
            }

            const listContainer = document.getElementById('chat-list');
            if (listContainer && window.ChatPanel) {
                // 입력창 값 보존
                const currentInput = document.getElementById('chat-input');
                const currentVal = currentInput ? currentInput.value : '';
                const isFocused = currentInput ? (document.activeElement === currentInput) : false;

                // 스크롤 위치 저장 (폴링 시)
                const msgListDiv = document.getElementById('message-list');
                // 여유값 50px: 사용자가 거의 바닥에 있으면 바닥으로 간주
                const wasAtBottom = msgListDiv ? (msgListDiv.scrollHeight - msgListDiv.scrollTop <= msgListDiv.clientHeight + 50) : true;
                
                let partialUpdateSuccess = false;

                if (msgListDiv && !isInitial && this.currentRoomId === roomId) {
                    // 현재 렌더링된 마지막 메시지 ID 찾기
                    const lastRenderedMsg = msgListDiv.querySelector('.message-item:last-child');
                    const lastRenderedId = lastRenderedMsg ? parseInt(lastRenderedMsg.dataset.messageId) : -1;

                    // 새 메시지 필터링
                    const newMessages = msgList.filter(msg => msg.id > lastRenderedId);

                    if (newMessages.length > 0) {
                        // 새 메시지만 추가
                        const newHtml = newMessages.map(msg => window.ChatPanel.renderMessageItem(msg, this.currentUser.id)).join('');
                        msgListDiv.insertAdjacentHTML('beforeend', newHtml);
                        partialUpdateSuccess = true;
                    } else if (msgList.length === msgListDiv.querySelectorAll('.message-item').length) {
                        // 메시지 개수가 같으면 업데이트 불필요 (이미 최신)
                        partialUpdateSuccess = true;
                    }
                }

                if (!partialUpdateSuccess) {
                    // 전체 렌더링 (최초 로드, 방 변경, 또는 부분 업데이트 실패 시)
                    listContainer.innerHTML = window.ChatPanel.renderChatRoomContent(msgList, this.currentUser.id);
                    
                    const newInput = document.getElementById('chat-input');
                    if (newInput) {
                        newInput.value = currentVal;
                        if (isFocused) newInput.focus();
                        if (isFocused) {
                            newInput.selectionStart = newInput.selectionEnd = newInput.value.length;
                        }
                    }
                }

                // 스마트 스크롤: 최초 로드거나 사용자가 바닥에 있었을 때만 스크롤 이동
                // 부분 업데이트 시에는 무조건 스크롤 내리는 게 자연스러울 수 있음 (새 메시지 왔으니까)
                // 하지만 사용자 요청대로 스마트 스크롤 유지
                const newMsgListDiv = document.getElementById('message-list');
                if (newMsgListDiv) {
                    // 부분 업데이트 성공했고 새 메시지가 추가된 경우, 
                    // 사용자가 바닥에 있었으면 스크롤 내림
                    if (isInitial || wasAtBottom) {
                        newMsgListDiv.scrollTop = newMsgListDiv.scrollHeight;
                    }
                }
            }
        } catch (e) {
            console.error('메시지 로드 중 오류:', e);
        }
    },

    /**
     * 메시지 전송
     */
    async sendMessage(roomId, content) {
        try {
            await ChatService.sendMessage(roomId, content);
            await this.loadMessages(roomId); // 즉시 갱신
        } catch (e) {
            console.error('메시지 전송 실패:', e);
            alert('메시지 전송에 실패했습니다.');
        }
    },

    /**
     * 읽음 처리
     */
    async markAsRead(roomId) {
        try {
            // 마지막 메시지를 알기 위해 메시지 목록을 가져오거나, 
            // loadMessages에서 가져온 리스트의 마지막 ID를 사용해야 함.
            // 여기서는 편의상 loadMessages가 호출된 직후라고 가정하고, 
            // 별도로 마지막 메시지 ID를 조회하지 않고, 백엔드에 '모두 읽음' 기능이 있다면 좋음.
            // 현재 API: POST /api/chat/rooms/{roomId}/read-all (ChatRestController에 추가되어 있는지 확인 필요)
            // 확인 결과: ChatRestController에 markReadAll 있음!

            await ChatService.markReadAll(roomId);
        } catch (e) {
            console.warn('읽음 처리 실패:', e);
        }
    },

    /**
     * 폴링 시작
     */
    startPolling(roomId) {
        this.stopPolling();
        this.pollingInterval = setInterval(() => {
            if (this.currentRoomId == roomId) {
                this.loadMessages(roomId);
            }
        }, 3000); // 3초 간격
    },

    /**
     * 폴링 중지
     */
    stopPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
    },

    /**
     * 매물 상세에서 연락하기 버튼 클릭 시 호출
     */
    async openChatWithBroker(propertyId, brokerId) {
        if (!authService.isAuthenticated()) {
            alert('로그인이 필요한 서비스입니다.');
            return;
        }
        try {
            const room = await ChatService.createRoom(propertyId, brokerId);

            // 채팅 패널 열기
            const chatBtn = document.getElementById('chat-button');
            const panel = document.getElementById('chat-panel');

            if (panel && panel.classList.contains('translate-x-full')) {
                if (chatBtn) chatBtn.click();
                else panel.classList.remove('translate-x-full'); // 버튼 없으면 강제 열기
            }

            // 잠시 대기 후 채팅방 열기
            setTimeout(() => {
                // 상대방 이름은 알 수 없으므로 기본값 또는 '중개사' 등으로 표시
                // room 응답에 상대방 정보가 있다면 좋음. RoomResponse에는 user1, user2 ID만 있음.
                this.openChatRoom(room.id, '중개사와의 대화');
            }, 100);

        } catch (e) {
            console.error('채팅방 생성 실패:', e);
            alert('채팅방을 열 수 없습니다.');
        }
    }
};

window.ChatController = ChatController;
ChatController.init();
