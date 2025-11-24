import { apiGet, apiPost } from '../utils/api.js';

/**
 * 채팅 관련 API 서비스
 */
export const ChatService = {
    /**
     * 채팅방 생성 또는 기존 방 조회
     * POST /api/chat/rooms
     * @param {number} propertyId - 매물 ID
     * @param {number} opponentUserId - 상대방 사용자 ID
     */
    async createRoom(propertyId, opponentUserId) {
        return apiPost('/api/chat/rooms', {
            json: { propertyId, opponentUserId }
        });
    },

    /**
     * 내 채팅방 목록 조회
     * GET /api/chat/rooms
     * @param {number} page - 페이지 번호 (0부터 시작)
     * @param {number} size - 페이지 크기
     */
    async getMyRooms(page = 0, size = 20) {
        return apiGet('/api/chat/rooms', {
            params: { page, size }
        });
    },

    /**
     * 채팅 메시지 목록 조회
     * GET /api/chat/rooms/{roomId}/messages
     * @param {number} roomId - 채팅방 ID
     * @param {number|null} cursorId - 커서 ID (이전 메시지 로드 시 사용)
     * @param {number} size - 가져올 메시지 개수
     */
    async getMessages(roomId, cursorId = null, size = 50) {
        const params = { size };
        if (cursorId) params.cursorId = cursorId;
        return apiGet(`/api/chat/rooms/${roomId}/messages`, { params });
    },

    /**
     * 메시지 전송
     * POST /api/chat/rooms/{roomId}/messages
     * @param {number} roomId - 채팅방 ID
     * @param {string} content - 메시지 내용
     */
    async sendMessage(roomId, content) {
        return apiPost(`/api/chat/rooms/${roomId}/messages`, {
            json: { content }
        });
    },

    /**
     * 메시지 읽음 처리
     * POST /api/chat/rooms/{roomId}/read
     * @param {number} roomId - 채팅방 ID
     * @param {number} lastReadMessageId - 마지막으로 읽은 메시지 ID
     */
    async markRead(roomId, lastReadMessageId) {
        return apiPost(`/api/chat/rooms/${roomId}/read`, {
            json: { lastReadMessageId }
        });
    },

    /**
     * 상대방 메시지 모두 읽음 처리
     * POST /api/chat/rooms/{roomId}/read-all
     * @param {number} roomId - 채팅방 ID
     */
    async markReadAll(roomId) {
        return apiPost(`/api/chat/rooms/${roomId}/read-all`, {});
    }
};
