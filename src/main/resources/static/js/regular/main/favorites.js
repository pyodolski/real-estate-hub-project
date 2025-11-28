// /js/regular/main/favorites.js
import { api } from '../../shared/utils/api.js';

const BOX_ID = 'favorite-list';
let bound = false;
const inflight = new Set();

// 전역 즐겨찾기 상태 (Set<number>)
export const favoritePropertyIds = new Set();
window.favoritePropertyIds = favoritePropertyIds; // 디버깅용

const esc = (s='') => String(s)
  .replaceAll('&','&amp;').replaceAll('<','&lt;')
  .replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');

function cardFromFavoriteDto(it){
  const when = (it.createdAt || '').replace('T',' ').slice(0,16);
  // 카드 전체에 커서 포인터 및 클릭 이벤트용 데이터 속성 추가
  return `
  <div class="favorite-card bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow" data-open-id="${it.propertyId}">
    <div class="relative">
      ${it.thumbnailUrl
        ? `<img src="${esc(it.thumbnailUrl)}" class="w-full h-40 object-cover">`
        : `<div class="w-full h-40 bg-gray-100 flex items-center justify-center text-gray-400 text-xs">NO IMG</div>`}
      <button type="button" class="absolute top-2 right-2 bg-white/70 p-1.5 rounded-full hover:bg-white z-10"
              title="즐겨찾기 해제" data-remove-fav="${it.propertyId}">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-red-500"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></svg>
      </button>
    </div>
    <div class="p-4">
      <h3 class="font-bold text-lg">${esc(it.title ?? '')}</h3>
      <p class="text-sm text-gray-600">${esc(it.address ?? '')}</p>
      <div class="mt-2 text-xs text-gray-500">담김: ${when}</div>
      <!-- 상세보기 버튼 제거됨 -->
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

// 즐겨찾기 여부 확인 (전역)
window.isFavored = function(id) {
  return favoritePropertyIds.has(Number(id));
};

// 즐겨찾기 토글 (전역)
window.toggleFavorite = async function(id, btnElement) {
  const pid = Number(id);
  if (inflight.has(pid)) return;
  inflight.add(pid);

  // 낙관적 업데이트 (UI 먼저 변경)
  const wasFavored = favoritePropertyIds.has(pid);
  if (wasFavored) {
    favoritePropertyIds.delete(pid);
  } else {
    favoritePropertyIds.add(pid);
  }
  updateAllHeartIcons(pid, !wasFavored); // 모든 하트 아이콘 동기화

  try {
    // API 호출
    const res = await api(`/api/properties/${pid}/favorite`, { method: 'POST' });
    // res: { favored: true/false }
    
    // 서버 응답으로 최종 동기화 (혹시 다르면 보정)
    if (res.favored !== !wasFavored) {
        if (res.favored) favoritePropertyIds.add(pid);
        else favoritePropertyIds.delete(pid);
        updateAllHeartIcons(pid, res.favored);
    }

    if (typeof window.showToast === 'function') {
        window.showToast(
           res.favored ? '관심매물에 등록되었습니다.' : '관심매물에서 해제되었습니다.'
        );
    }

    // 즐겨찾기 패널 목록 갱신
    loadFavorites();

  } catch (err) {
    console.error('즐겨찾기 토글 실패:', err);
    alert('작업을 처리하지 못했습니다.');
    // 롤백
    if (wasFavored) favoritePropertyIds.add(pid);
    else favoritePropertyIds.delete(pid);
    updateAllHeartIcons(pid, wasFavored);
  } finally {
    inflight.delete(pid);
  }
};

// 화면 내 모든 해당 매물의 하트 아이콘 상태 업데이트
function updateAllHeartIcons(id, isFavored) {
  // 1. 메인 리스트 / 추천 리스트의 하트 버튼들
  const buttons = document.querySelectorAll(
    `button[data-property-id="${id}"].favorite-btn`
  );
  buttons.forEach(btn => {
    const svg = btn.querySelector('svg');
    if (isFavored) {
      svg.setAttribute('fill', 'currentColor');
      svg.classList.add('text-red-500');
      svg.classList.remove('text-gray-600');
    } else {
      svg.setAttribute('fill', 'none');
      svg.classList.add('text-gray-600');
      svg.classList.remove('text-red-500');
    }
  });

  // 2. 상세 패널 A
  const detailBtnA  = document.getElementById('favorite-button-a');
  const detailIconA = document.getElementById('favorite-icon-a');
  const overlayA    = document.getElementById('property-detail-overlay-a');
  const detailRegA  = document.getElementById('favorite-register-button-a');

  if (overlayA && Number(overlayA.dataset.propertyId) === id) {
    if (detailIconA) {
      detailIconA.setAttribute('fill', isFavored ? 'currentColor' : 'none');
      detailIconA.classList.toggle('text-red-500', isFavored);
      detailIconA.classList.toggle('text-gray-600', !isFavored);
    }
    if (detailBtnA) {
      detailBtnA.setAttribute('aria-pressed', isFavored.toString());
    }
    if (detailRegA) {
      detailRegA.textContent = isFavored ? '관심매물 해제' : '관심매물 등록';
    }
  }

  // 3. 상세 패널 B
  const detailBtnB  = document.getElementById('favorite-button-b');
  const detailIconB = document.getElementById('favorite-icon-b');
  const overlayB    = document.getElementById('property-detail-overlay-b');
  const detailRegB  = document.getElementById('favorite-register-button-b');

  if (overlayB && Number(overlayB.dataset.propertyId) === id) {
    if (detailIconB) {
      detailIconB.setAttribute('fill', isFavored ? 'currentColor' : 'none');
      detailIconB.classList.toggle('text-red-500', isFavored);
      detailIconB.classList.toggle('text-gray-600', !isFavored);
    }
    if (detailBtnB) {
      detailBtnB.setAttribute('aria-pressed', isFavored.toString());
    }
    if (detailRegB) {
      detailRegB.textContent = isFavored ? '관심매물 해제' : '관심매물 등록';
    }
  }
}
export async function loadFavorites() {
  const box = document.getElementById(BOX_ID);
  // box가 없어도 초기 로딩 시 favoritePropertyIds 채우기 위해 API 호출은 필요할 수 있음
  // 하지만 여기선 box가 있을 때만 렌더링하도록 함.
  
  try {
    const list = await api('/api/properties/favorites', { params: { limit: 100 } });
    
    // 전역 상태 업데이트
    favoritePropertyIds.clear();
    list.forEach(item => favoritePropertyIds.add(item.propertyId));

    if (box) {
        renderList(box, list);
    }
  } catch (e) {
    console.error(e);
    if (box) box.innerHTML = `<div class="p-4 text-sm text-red-500">목록을 불러오지 못했습니다.</div>`;
  }
}

export function initFavorites() {
  if (bound) return;
  bound = true;

  // 1. 즐겨찾기 패널 내부 클릭 이벤트 (해제/상세보기)
  const box = document.getElementById(BOX_ID);
  if (box) {
    box.addEventListener('click', async (e) => {
      const removeBtn = e.target.closest('[data-remove-fav]');
      // 카드 전체 클릭 감지
      const card = e.target.closest('[data-open-id]');

      if (removeBtn) {
        e.stopPropagation(); // 카드 클릭 방지
        const pid  = Number(removeBtn.dataset.removeFav);
        // 전역 토글 함수 재사용
        window.toggleFavorite(pid); 
        return;
      }

      if (card) {
        const pid = Number(card.dataset.openId);
        if (typeof window.openPropertyDetail === 'function') {
          window.openPropertyDetail(pid);
        } else {
          console.warn("openPropertyDetail function not found, falling back to URL navigation");
          location.href = `/property/${pid}`;
        }
      }
    });
  }

  // 2. 메인 리스트 하트 버튼 클릭 위임 (동적 생성되므로 document 레벨에서 처리)
  document.addEventListener('click', (e) => {
    const favBtn = e.target.closest('.favorite-btn');
    if (favBtn) {
      e.stopPropagation(); // 카드 클릭 이벤트 전파 방지
      const id = favBtn.dataset.propertyId;
      if (id) {
        window.toggleFavorite(id, favBtn);
      }
    }
  });
}

// ====== 공통 토스트 메시지 함수 ======
function showToast(message) {
  let box = document.getElementById('global-toast');
  if (!box) {
    box = document.createElement('div');
    box.id = 'global-toast';
    box.className =
      'fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center space-y-2';
    document.body.appendChild(box);
  }

  const item = document.createElement('div');
  item.className =
    'px-4 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg opacity-100 transition-opacity duration-300';
  item.textContent = message;

  box.appendChild(item);

  // 1.5초 뒤 서서히 사라지고 삭제
  setTimeout(() => {
    item.style.opacity = '0';
    setTimeout(() => item.remove(), 300);
  }, 1500);
}

window.showToast = showToast;