// src/main/resources/static/js/api/propertiesApi.js
const API = 'http://localhost:8080';

function authHeaders() {
  const token = localStorage.getItem('accessToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * 지도 보이는 영역 + 현재 필터로 매물 조회
 * 백엔드: POST /api/properties/search  (SearchRequest 에 swLat/swLng/neLat/neLng 필드 추가 필요)
 * 응답: List 또는 Page 형식 모두 지원
 */
export async function fetchPropertiesInBounds({ swLat, swLng, neLat, neLng, filters = {} }) {
  // filter.js에서 window.currentFilters 로 보관한 payload를 그대로 받는다는 가정
  const payload = {
    ...filters,          // houseTypes, offerTypes, areaMin/Max, floorMin/Max, optionMask 등
    swLat, swLng, neLat, neLng,
    page: 0,
    size: 500           // 지도용은 넉넉히
  };

  const res = await fetch(`${API}/api/properties/full`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
  });

  if (res.status === 401) throw new Error('Unauthorized');
  if (!res.ok) throw new Error(await res.text());

  const data = await res.json();
  // Page 또는 List 모두 대응
  return Array.isArray(data) ? data : (data?.content ?? []);
}

/** 단건 상세 */
export async function fetchPropertyDetail(id) {
  const res = await fetch(`${API}/api/properties/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    }
  });

  if (res.status === 401) throw new Error('Unauthorized');
  if (res.status === 404) throw new Error('Not Found');
  if (!res.ok) throw new Error('property detail fetch error');

  return res.json();
}
