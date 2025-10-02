/**
 * PropertyService - 매물 데이터 서비스
 * 매물 조회, 검색, 상세 정보 가져오기 등 매물 관련 API 호출
 */

const API_BASE_URL = 'http://localhost:8080';

export class PropertyService {
  constructor(apiBaseUrl = API_BASE_URL) {
    this.apiBaseUrl = apiBaseUrl;
  }

  /**
   * 인증 헤더 생성
   * @private
   * @returns {Object}
   */
  _authHeaders() {
    const token = localStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  /**
   * 지도 영역 내 매물 조회
   * @param {Object} params - 조회 파라미터
   * @param {number} params.swLat - 남서쪽 위도
   * @param {number} params.swLng - 남서쪽 경도
   * @param {number} params.neLat - 북동쪽 위도
   * @param {number} params.neLng - 북동쪽 경도
   * @param {Object} params.filters - 필터 옵션
   * @returns {Promise<Array>}
   */
  async fetchPropertiesInBounds({ swLat, swLng, neLat, neLng, filters = {} }) {
    const payload = {
      ...filters,
      swLat,
      swLng,
      neLat,
      neLng,
      page: filters.page ?? 0,
      size: filters.size ?? 500
    };

    try {
      const response = await fetch(`${this.apiBaseUrl}/api/properties/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this._authHeaders()
        },
        body: JSON.stringify(payload)
      });

      if (response.status === 401) {
        throw new Error('Unauthorized');
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || '매물 조회 실패');
      }

      const data = await response.json();

      // Page 형식 또는 배열 형식 모두 지원
      return Array.isArray(data) ? data : (data?.content ?? []);
    } catch (error) {
      console.error('매물 조회 오류:', error);
      throw error;
    }
  }

  /**
   * 매물 상세 정보 조회
   * @param {string|number} id - 매물 ID
   * @returns {Promise<Object>}
   */
  async fetchPropertyDetail(id) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/properties/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...this._authHeaders()
        }
      });

      if (response.status === 401) {
        throw new Error('Unauthorized');
      }

      if (response.status === 404) {
        throw new Error('Not Found');
      }

      if (!response.ok) {
        throw new Error('매물 상세 조회 실패');
      }

      return await response.json();
    } catch (error) {
      console.error('매물 상세 조회 오류:', error);
      throw error;
    }
  }

  /**
   * 매물 검색
   * @param {Object} searchParams - 검색 파라미터
   * @returns {Promise<Array>}
   */
  async searchProperties(searchParams) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/properties/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this._authHeaders()
        },
        body: JSON.stringify(searchParams)
      });

      if (response.status === 401) {
        throw new Error('Unauthorized');
      }

      if (!response.ok) {
        throw new Error('매물 검색 실패');
      }

      const data = await response.json();
      return Array.isArray(data) ? data : (data?.content ?? []);
    } catch (error) {
      console.error('매물 검색 오류:', error);
      throw error;
    }
  }

  /**
   * 즐겨찾기 목록 조회
   * @returns {Promise<Array>}
   */
  async fetchFavorites() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/favorites`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...this._authHeaders()
        }
      });

      if (response.status === 401) {
        throw new Error('Unauthorized');
      }

      if (!response.ok) {
        throw new Error('즐겨찾기 조회 실패');
      }

      return await response.json();
    } catch (error) {
      console.error('즐겨찾기 조회 오류:', error);
      throw error;
    }
  }

  /**
   * 즐겨찾기 추가
   * @param {string|number} propertyId - 매물 ID
   * @returns {Promise<Object>}
   */
  async addFavorite(propertyId) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/favorites/${propertyId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this._authHeaders()
        }
      });

      if (response.status === 401) {
        throw new Error('Unauthorized');
      }

      if (!response.ok) {
        throw new Error('즐겨찾기 추가 실패');
      }

      return await response.json();
    } catch (error) {
      console.error('즐겨찾기 추가 오류:', error);
      throw error;
    }
  }

  /**
   * 즐겨찾기 제거
   * @param {string|number} propertyId - 매물 ID
   * @returns {Promise<void>}
   */
  async removeFavorite(propertyId) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/favorites/${propertyId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...this._authHeaders()
        }
      });

      if (response.status === 401) {
        throw new Error('Unauthorized');
      }

      if (!response.ok) {
        throw new Error('즐겨찾기 제거 실패');
      }
    } catch (error) {
      console.error('즐겨찾기 제거 오류:', error);
      throw error;
    }
  }

  /**
   * 매물 상태 확인
   * @param {string|number} propertyId - 매물 ID
   * @returns {Promise<Object>}
   */
  async checkPropertyStatus(propertyId) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/properties/${propertyId}/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...this._authHeaders()
        }
      });

      if (!response.ok) {
        throw new Error('매물 상태 확인 실패');
      }

      return await response.json();
    } catch (error) {
      console.error('매물 상태 확인 오류:', error);
      throw error;
    }
  }
}

// 전역 싱글톤 인스턴스 생성 (선택사항)
export const propertyService = new PropertyService();

// 기존 API와의 호환성을 위한 함수 export
export async function fetchPropertiesInBounds(params) {
  return propertyService.fetchPropertiesInBounds(params);
}

export async function fetchPropertyDetail(id) {
  return propertyService.fetchPropertyDetail(id);
}
