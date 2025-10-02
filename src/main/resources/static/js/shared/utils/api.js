// /js/core/api.js
// ES Module로 사용하는 공용 API 유틸

// 서버 베이스 URL (window.BASE가 있으면 우선)
export const BASE = (typeof window !== 'undefined' && window.BASE) || 'http://localhost:8080';

// 토큰 유틸
export function getToken() {
  return (typeof localStorage !== 'undefined' && localStorage.getItem('auth_token')) || null;
}
export function setToken(raw) {
  const bearer = raw?.startsWith('Bearer ') ? raw : `Bearer ${raw}`;
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('auth_token', bearer);
  }
}
export function clearToken() {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('auth_token');
  }
}
export function authHeaders() {
  const t = getToken();
  return t ? { Authorization: t } : {};
}

// 쿼리스트링 빌더
export function buildQuery(params) {
  if (!params) return '';
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => (v != null) && q.append(k, v));
  const s = q.toString();
  return s ? `?${s}` : '';
}

// 핵심 fetch 래퍼
export async function api(path, { method = 'GET', params, json, headers = {}, ...rest } = {}) {
  // 절대 URL(https?://...)이 들어오면 그대로 쓰고, 아니면 BASE를 붙입니다.
  const isAbsolute = /^https?:\/\//i.test(path);
  const url = `${isAbsolute ? '' : BASE}${path}${buildQuery(params)}`;

  const base = authHeaders();
  // JSON 바디일 때만 Content-Type 자동 지정 (이미 있으면 유지)
  if (json !== undefined && !('Content-Type' in headers)) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(url, {
    method,
    headers: { ...base, ...headers },
    body: json !== undefined ? JSON.stringify(json) : undefined,
    // 필요시 credentials, signal 등 추가 가능
    ...rest,
  });

  // 바디가 없는 정상 응답
  if (res.status === 204) return null;

  // JSON/텍스트 자동 파싱
  const ct = res.headers.get('content-type') || '';
  const text = await res.text();
  const data = ct.includes('application/json') && text ? JSON.parse(text) : text;

  // 에러면 throw (호출부에서 try/catch)
  if (!res.ok) {
    const msg = typeof data === 'string' && data ? data : (data?.message || res.statusText);
    const err = new Error(`HTTP ${res.status} ${msg}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

// 편의 메서드 (원하면 사용)
export const apiGet  = (p, opt = {}) => api(p, { ...opt, method: 'GET' });
export const apiPost = (p, opt = {}) => api(p, { ...opt, method: 'POST' });
export const apiDel  = (p, opt = {}) => api(p, { ...opt, method: 'DELETE' });

/*
  전역(window.api)으로도 써야 한다면 아래 주석을 해제하세요.
  (가능하면 ES 모듈 import 사용을 권장)

if (typeof window !== 'undefined') {
  window.api = api;
}
*/
