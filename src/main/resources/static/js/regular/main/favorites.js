// /js/regular/main/favorites.js
import { api } from '../../shared/utils/api.js';

const BOX_ID = 'favorite-list';
let bound = false;
const inflight = new Set();

const esc = (s='') => String(s)
  .replaceAll('&','&amp;').replaceAll('<','&lt;')
  .replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');

function cardFromFavoriteDto(it){
  const when = (it.createdAt || '').replace('T',' ').slice(0,16);
  return `
  <div class="favorite-card bg-white rounded-lg shadow-md overflow-hidden">
    <div class="relative">
      ${it.thumbnailUrl
        ? `<img src="${esc(it.thumbnailUrl)}" class="w-full h-40 object-cover">`
        : `<div class="w-full h-40 bg-gray-100 flex items-center justify-center text-gray-400 text-xs">NO IMG</div>`}
      <button type="button" class="absolute top-2 right-2 bg-white/70 p-1.5 rounded-full hover:bg-white"
              title="즐겨찾기 해제" data-remove-fav="${it.propertyId}">
        ❤️
      </button>
    </div>
    <div class="p-4">
      <h3 class="font-bold text-lg">${esc(it.title ?? '')}</h3>
      <p class="text-sm text-gray-600">${esc(it.address ?? '')}</p>
      <div class="mt-2 text-xs text-gray-500">담김: ${when}</div>
      <button type="button" class="mt-2 px-2 py-1 text-xs border rounded" data-open-id="${it.propertyId}">상세보기</button>
    </div>
  </div>`;
}

function ensureEmptyPlaceholder(box) {
  if (!box.querySelector('[data-empty-placeholder]')) {
    const ph = document.createElement('div');
    ph.setAttribute('data-empty-placeholder','true');
    ph.className = 'p-6 text-center text-gray-500 border border-dashed rounded-lg w-full';
    ph.textContent = '아직 즐겨찾기한 매물이 없습니다.';
    box.appendChild(ph);
  }
}

function renderList(box, list) {
  box.innerHTML = '';
  if (!list?.length) return ensureEmptyPlaceholder(box);
  for (const it of list) box.insertAdjacentHTML('beforeend', cardFromFavoriteDto(it));
}

export async function loadFavorites() {
  const box = document.getElementById(BOX_ID);
  if (!box) return;
  box.innerHTML = `<div class="p-4 text-sm text-gray-500">불러오는 중...</div>`;
  try {
    // ✅ 올바른 경로
    const list = await api('/api/properties/favorites', { params: { limit: 100 } });
    renderList(box, list);
  } catch (e) {
    console.error(e);
    box.innerHTML = `<div class="p-4 text-sm text-red-500">목록을 불러오지 못했습니다.</div>`;
  }
}

export function initFavorites() {
  if (bound) return;           // 중복 바인딩 방지
  bound = true;

  const box = document.getElementById(BOX_ID);
  if (!box) return;

  box.addEventListener('click', async (e) => {
    const removeBtn = e.target.closest('[data-remove-fav]');
    const openBtn   = e.target.closest('[data-open-id]');

    if (removeBtn) {
      const pid  = Number(removeBtn.dataset.removeFav);
      if (inflight.has(pid)) return;   // 중복 요청 차단
      inflight.add(pid);

      const card = removeBtn.closest('.favorite-card');
      removeBtn.disabled = true;
      card?.classList.add('opacity-50');

      try {
        await api(`/api/properties/${pid}/favorite`, { method: 'POST' });

        // 성공 UI
        card?.remove();
        const remaining = [...box.children].filter(el => !el.matches('[data-empty-placeholder]'));
        if (remaining.length === 0) ensureEmptyPlaceholder(box);
      } catch (err) {
        console.error(err);
        alert('즐겨찾기 해제 실패');
        removeBtn.disabled = false;
        card?.classList.remove('opacity-50');
      } finally {
        inflight.delete(pid);
      }
      return;
    }

    if (openBtn) {
      const pid = Number(openBtn.dataset.openId);
      if (window.loadPropertyDetail && window.app) {
        window.loadPropertyDetail(window.app, pid);
      } else {
        location.href = `/property/${pid}`;
      }
    }
  });
}
