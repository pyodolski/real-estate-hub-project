const KEY = 'last-map-setting';

export async function getLastMap() {
  // --- 실제 API
  // const r = await fetch('/api/users/me/map'); if (r.ok) return r.json();
  // throw new Error('no last map');

  // --- 임시: localStorage
  const s = localStorage.getItem(KEY);
  return s ? JSON.parse(s) : null;
}

export async function saveLastMap({ lat, lng, zoom }) {
  // --- 실제 API
  // await fetch('/api/users/me/map', { method:'PUT', headers:{'Content-Type':'application/json'},
  //   body: JSON.stringify({ lat, lng, zoom }) });

  // --- 임시: localStorage
  localStorage.setItem(KEY, JSON.stringify({ lat, lng, zoom }));
}