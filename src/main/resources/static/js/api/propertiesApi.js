// src/main/resources/static/js/api/propertiesApi.js
export async function fetchPropertiesInBounds({ swLat, swLng, neLat, neLng, filters }) {
  const sample = [
    { id: 101, status: 'AVAILABLE',  lat: 37.5668, lng: 126.9783, title:'을지로 2룸', address:'서울 중구',price:125000000,method },
    { id: 102, status: 'CONTRACTED', lat: 37.5655, lng: 126.9760, title:'시청역 오피스텔', address:'서울 중구',price:225000000 },
    { id: 103, status: 'SOLD',       lat: 37.5682, lng: 126.9801, title:'종로 신축', address:'서울 종로구',price:325000000 },
    { id: 104, status: 'SOLD',       lat: 37.5672, lng: 126.9851, title:'종로 신축', address:'서울 종로구',price:425000000 },
  ];
  const within = (p) => p.lat >= swLat && p.lat <= neLat && p.lng >= swLng && p.lng <= neLng;
  let list = sample.filter(within);

  // 🔸 상태 필터 적용 (드롭다운이 빈 값이면 건너뜀)
  if (filters?.status) list = list.filter(p => p.status === filters.status);

  return list;
}
/*
export async function fetchPropertiesInBounds({ swLat, swLng, neLat, neLng, filters }) {
  const q = new URLSearchParams({ swLat, swLng, neLat, neLng });
  if (filters?.status) q.set('status', filters.status);  // 🔸 상태 쿼리 추가
  const res = await fetch('/api/properties?' + q.toString());
  if (!res.ok) throw new Error('properties fetch error');
  return res.json();
}
*/

export async function fetchPropertyDetail(id) {
  // --- 실제 API
  // const res = await fetch(`/api/properties/${id}`);
  // if (!res.ok) throw new Error('detail error');
  // return res.json();

  // --- 임시 상세
  return {
    id, title: `임시 매물 #${id}`,
    status: 'AVAILABLE', price: 500000000,
    address: '서울 중구 어디',
    lat: 37.5665, lng: 126.9780
  };
}
