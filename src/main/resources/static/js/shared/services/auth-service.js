/**
 * AuthService - 인증 서비스
 * 로그인, 로그아웃, 토큰 관리 등 인증 관련 기능
 */

const API_BASE_URL = 'http://localhost:8080';

export class AuthService {
  constructor(apiBaseUrl = API_BASE_URL) {
    this.apiBaseUrl = apiBaseUrl;
  }

  /**
   * 로그인
   * @param {Object} credentials - 로그인 정보
   * @param {string} credentials.email - 이메일
   * @param {string} credentials.password - 비밀번호
   * @returns {Promise<Object>}
   */
  async login({ email, password }) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        throw new Error('로그인 실패');
      }

      const data = await response.json();

      // 토큰 저장
      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
      }
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }

      return data;
    } catch (error) {
      console.error('로그인 오류:', error);
      throw error;
    }
  }

  /**
   * 로그아웃
   * @returns {Promise<void>}
   */
  async logout() {
    try {
      const token = localStorage.getItem('accessToken');

      if (token) {
        // 서버에 로그아웃 요청 (선택사항)
        await fetch(`${this.apiBaseUrl}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.error('로그아웃 요청 오류:', error);
    } finally {
      // 로컬 스토리지에서 토큰 제거
      this.clearTokens();
    }
  }

  /**
   * 토큰 초기화
   */
  clearTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  /**
   * 액세스 토큰 가져오기
   * @returns {string|null}
   */
  getAccessToken() {
    return localStorage.getItem('accessToken');
  }

  /**
   * 리프레시 토큰 가져오기
   * @returns {string|null}
   */
  getRefreshToken() {
    return localStorage.getItem('refreshToken');
  }

  /**
   * 로그인 상태 확인
   * @returns {boolean}
   */
  isAuthenticated() {
    return !!this.getAccessToken();
  }

  /**
   * 토큰 갱신
   * @returns {Promise<Object>}
   */
  async refreshToken() {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      throw new Error('리프레시 토큰이 없습니다.');
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken })
      });

      if (!response.ok) {
        throw new Error('토큰 갱신 실패');
      }

      const data = await response.json();

      // 새 토큰 저장
      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
      }
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }

      return data;
    } catch (error) {
      console.error('토큰 갱신 오류:', error);
      this.clearTokens();
      throw error;
    }
  }

  /**
   * 인증 헤더 생성
   * @returns {Object}
   */
  getAuthHeaders() {
    const token = this.getAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  /**
   * 사용자 정보 가져오기
   * @returns {Promise<Object>}
   */
  async getCurrentUser() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/users/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        }
      });

      if (response.status === 401) {
        throw new Error('Unauthorized');
      }

      if (!response.ok) {
        throw new Error('사용자 정보 조회 실패');
      }

      return await response.json();
    } catch (error) {
      console.error('사용자 정보 조회 오류:', error);
      throw error;
    }
  }

  /**
   * 회원가입
   * @param {Object} userData - 회원가입 정보
   * @returns {Promise<Object>}
   */
  async signup(userData) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || '회원가입 실패');
      }

      return await response.json();
    } catch (error) {
      console.error('회원가입 오류:', error);
      throw error;
    }
  }

  /**
   * 비밀번호 재설정 요청
   * @param {string} email - 이메일
   * @returns {Promise<void>}
   */
  async requestPasswordReset(email) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        throw new Error('비밀번호 재설정 요청 실패');
      }
    } catch (error) {
      console.error('비밀번호 재설정 요청 오류:', error);
      throw error;
    }
  }

  /**
   * 비밀번호 재설정
   * @param {string} token - 재설정 토큰
   * @param {string} newPassword - 새 비밀번호
   * @returns {Promise<void>}
   */
  async resetPassword(token, newPassword) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword })
      });

      if (!response.ok) {
        throw new Error('비밀번호 재설정 실패');
      }
    } catch (error) {
      console.error('비밀번호 재설정 오류:', error);
      throw error;
    }
  }
}

// 전역 싱글톤 인스턴스
export const authService = new AuthService();

// 기존 API와의 호환성을 위한 함수 export
export async function login(credentials) {
  return authService.login(credentials);
}

export async function logout() {
  return authService.logout();
}
