const API = 'http://localhost:8080';

export async function login({ email, password }) {
  const r = await fetch(`${API}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!r.ok) throw new Error('login failed');

  const data = await r.json(); // { accessToken, refreshToken? }
  localStorage.setItem('accessToken', data.accessToken);
  if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
}