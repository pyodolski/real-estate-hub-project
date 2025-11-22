// src/main/resources/static/js/shared/map/poi/poi-naver-local.js

// ✅ 이미 있는 컨트롤러 URL 사용
const LOCAL_API_BASE = '/api/search/places';

function mapNaverItemsToPoi(list, prefix) {
  if (!list || !Array.isArray(list)) return [];
  return list.map((item, idx) => ({
    id: `${prefix}-${idx}`,
    // 네이버 응답에는 <b>태그 들어오니까 제거
    name: (item.title || '').replace(/<[^>]*>/g, ''),
    mapx: Number(item.mapx), // TM128 x
    mapy: Number(item.mapy), // TM128 y
  }));
}

// 편의점
export async function searchConvenienceStores({ lat, lng }) {
  const res = await fetch(
    `${LOCAL_API_BASE}?q=${encodeURIComponent('편의점')}&limit=10&lat=${lat}&lng=${lng}`
  );
  if (!res.ok) throw new Error('편의점 검색 실패');
  const json = await res.json();
  return mapNaverItemsToPoi(json.items, 'conv');
}

// 지하철역
export async function searchSubwayStations({ lat, lng }) {
  const res = await fetch(
    `${LOCAL_API_BASE}?q=${encodeURIComponent('지하철역')}&limit=10&lat=${lat}&lng=${lng}`
  );
  if (!res.ok) throw new Error('지하철역 검색 실패');
  const json = await res.json();
  return mapNaverItemsToPoi(json.items, 'subway');
}

// 버스정류장
export async function searchBusStations({ lat, lng }) {
  const res = await fetch(
    `${LOCAL_API_BASE}?q=${encodeURIComponent('버스정류장')}&limit=10&lat=${lat}&lng=${lng}`
  );
  if (!res.ok) throw new Error('버스정류장 검색 실패');
  const json = await res.json();
  return mapNaverItemsToPoi(json.items, 'bus');
}