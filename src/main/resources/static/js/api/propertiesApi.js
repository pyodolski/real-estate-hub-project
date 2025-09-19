const API = 'http://localhost:8080';

function authHeaders() {
  const token = localStorage.getItem('accessToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// 지도 범위 조회
export async function fetchPropertiesInBounds({ swLat, swLng, neLat, neLng, filters = {} }) {
  const params = new URLSearchParams({
    swLat, swLng, neLat, neLng,
    ...(filters.status ? { status: filters.status } : {})
  });

  const res = await fetch(`${API}/api/properties?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    }
  });

  if (res.status === 401) throw new Error('Unauthorized');
  if (!res.ok) throw new Error('properties fetch error');
  return res.json();
}

// 단건 상세
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
