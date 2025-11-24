/**
 * 채팅 패널 UI 렌더링 담당
 */
const ChatPanel = {
  /**
   * 채팅 패널 전체 기본 HTML 구조 반환
   */
  render() {
    return `
      <aside
        id="chat-panel"
        class="absolute top-0 w-[450px] bg-white p-6 flex flex-col h-full shadow-lg z-20 transform translate-x-full transition-transform duration-300 ease-in-out"
        style="right: 75px"
      >
        <!-- 헤더 영역 (동적으로 변경됨) -->
        <div id="chat-header" class="flex justify-between items-center mb-4 pb-4 border-b flex-shrink-0">
          ${this.renderListHeader()}
        </div>

        <!-- 검색 영역 (목록 화면에서만 표시) -->
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

        <!-- 콘텐츠 영역 (목록 또는 대화방) -->
        <div id="chat-content" class="flex-grow overflow-y-auto custom-scrollbar pr-2 -mr-2 flex flex-col">
          <div id="chat-list" class="space-y-3">
            <!-- 채팅 목록이 여기에 로드됨 -->
            <div class="text-center text-gray-500 mt-10">채팅방을 불러오는 중...</div>
          </div>
        </div>
      </aside>
    `;
  },

  /**
   * 채팅 목록 헤더 HTML
   */
  renderListHeader() {
    return `
      <h2 class="text-xl font-bold text-gray-800">채팅 목록</h2>
      <button
        id="close-chat-panel"
        class="p-2 rounded-full hover:bg-gray-200 transition-colors"
        title="채팅 패널 닫기"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6 text-gray-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    `;
  },

  /**
   * 채팅방 헤더 HTML (뒤로가기 포함)
   * @param {string} title - 채팅방 제목 (상대방 이름 등)
   */
  renderRoomHeader(title) {
    return `
      <div class="flex items-center">
        <button
          id="back-to-chat-list"
          class="mr-2 p-2 rounded-full hover:bg-gray-100 transition-colors"
          title="목록으로"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 class="text-xl font-bold text-gray-800 truncate">${title}</h2>
      </div>
      <button
        id="close-chat-panel"
        class="p-2 rounded-full hover:bg-gray-200 transition-colors"
        title="채팅 패널 닫기"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6 text-gray-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    `;
  },
  /**
   * 채팅방 목록 아이템 HTML 생성
   * @param {Array} rooms - 채팅방 목록 데이터
   * @param {number} currentUserId - 현재 사용자 ID
   */
  renderChatListItems(rooms, currentUserId) {
    if (!rooms || rooms.length === 0) {
      return `<div class="text-center text-gray-500 mt-10">채팅 목록 없음</div>`;
    }

    return rooms.map(room => {
      // 상대방 이름 찾기
      // RoomSummaryResponse: { id, propertyId, opponentUserIds, opponentNames, lastMessage, lastMessageAt, unreadCount }
      // opponentNames가 null이면 ID로 대체
      let opponentName = '알 수 없는 사용자';
      if (room.opponentNames && room.opponentNames.length > 0) {
        opponentName = room.opponentNames.join(', ');
      } else if (room.opponentUserIds && room.opponentUserIds.length > 0) {
        opponentName = `사용자 ${room.opponentUserIds.join(', ')}`;
      }

      const lastMsg = room.lastMessage || '대화가 없습니다.';
      const time = room.lastMessageAt ? new Date(room.lastMessageAt).toLocaleDateString() : '';
      const unreadBadge = room.unreadCount > 0
        ? `<span class="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">${room.unreadCount}</span>`
        : '';

      return `
        <div class="chat-room-item p-3 hover:bg-gray-50 rounded-lg cursor-pointer flex items-center space-x-3 border-b border-gray-100 last:border-0" 
             data-room-id="${room.id}" 
             data-opponent-name="${opponentName}">
          <div class="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex justify-between items-baseline mb-1">
              <h3 class="text-sm font-semibold text-gray-900 truncate">${opponentName}</h3>
              <span class="text-xs text-gray-500 flex-shrink-0">${time}</span>
            </div>
            <p class="text-sm text-gray-600 truncate">${lastMsg}</p>
          </div>
          ${unreadBadge}
        </div>
      `;
    }).join('');
  },

  /**
   * 채팅방(대화 화면) HTML 생성
   * @param {Array} messages - 메시지 목록
   * @param {number} currentUserId - 현재 사용자 ID
   */
  renderChatRoomContent(messages, currentUserId) {
    let html = `<div id="message-list" class="flex-grow space-y-4 p-2 overflow-y-auto custom-scrollbar">`;

    if (!messages || messages.length === 0) {
      html += `<div class="text-center text-gray-400 mt-10">대화를 시작해보세요!</div>`;
    } else {
      // 메시지 렌더링 (역순으로 올 수 있으므로 주의, 여기서는 시간순 정렬 가정)
      messages.forEach(msg => {
        const isMe = msg.senderId === currentUserId;
        const alignClass = isMe ? 'justify-end' : 'justify-start';
        const bubbleClass = isMe ? 'bg-blue-500 text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none';
        const time = new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        html += `
          <div class="flex ${alignClass}">
            <div class="max-w-[70%] ${bubbleClass} px-4 py-2 rounded-2xl shadow-sm relative group">
              <p class="text-sm break-words">${msg.content}</p>
              <span class="text-[10px] opacity-70 absolute bottom-1 ${isMe ? 'left-[-45px] text-gray-500' : 'right-[-45px] text-gray-500'} w-10 text-center">${time}</span>
            </div>
          </div>
        `;
      });
    }

    html += `</div>`;

    // 입력창 영역
    html += `
      <div class="mt-4 pt-4 border-t border-gray-200 flex-shrink-0">
        <form id="chat-send-form" class="flex items-center space-x-2">
          <input
            type="text"
            id="chat-input"
            class="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="메시지를 입력하세요..."
            autocomplete="off"
          />
          <button
            type="submit"
            class="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors flex-shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </form>
      </div>
    `;

    return html;
  }
};

window.ChatPanel = ChatPanel;
