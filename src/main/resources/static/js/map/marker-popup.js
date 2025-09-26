// 작은 카드 팝업 렌더링 (recommend-list 카드 재사용)
// 전역 createPropertyCard가 있으면 그대로 활용하고, 없으면 간단 텍스트로 대체

export function renderMarkerPopup(property) {
	// 단일 팝업 컨테이너(#marker-popup)를 body에 부착해 카드+버튼을 하나의 팝업으로 표시
	let container2 = document.getElementById('marker-popup');
	if (!container2) {
		container2 = document.createElement('div');
		container2.id = 'marker-popup';
		container2.style.position = 'fixed';
		container2.style.width = '20rem';
		container2.style.maxHeight = '70vh';
		container2.style.overflowY = 'auto';
		container2.style.overflowX = 'hidden';
		container2.style.background = 'white';
		container2.style.borderRadius = '0.5rem';
		container2.style.boxShadow = '0 10px 25px rgba(0,0,0,0.12)';
		container2.style.zIndex = '5'; // 상세 오버레이(z>=10)에 가려지도록 낮게
		container2.style.display = 'none';
		document.body.appendChild(container2);
	}

    // 포지셔닝 헬퍼 (콘텐츠가 렌더된 뒤에 정확한 높이로 계산)
    function positionPopup() {
        const btn = document.getElementById('btn-test-marker-popup');
        if (btn) {
            const r = btn.getBoundingClientRect();
            const halfWidth = 160; // 20rem / 2
            const h = container2.offsetHeight || 0;
            container2.style.left = `${Math.max(16, r.left + r.width / 2 - halfWidth)}px`;
            container2.style.top = `${Math.max(16, r.top - 16 - h)}px`;
        } else {
            container2.style.right = '16px';
            container2.style.top = '96px';
        }
    }


	if (typeof window.createPropertyCard === 'function' || typeof createPropertyCard === 'function') {
		// 전역에 존재하는 createPropertyCard 사용 (둘 중 하나가 로드되어 있을 수 있음)
		// eslint-disable-next-line no-undef
		const cardHTML = (typeof createPropertyCard === 'function' ? createPropertyCard(property) : window.createPropertyCard(property));
		container2.innerHTML = `
		  <div class="p-3">
		    ${cardHTML}
		    <div class="mt-4 space-y-2">
		      <button id="btn-detail-view-${property.id}" class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">상세보기</button>
		      <div class="flex space-x-2">
		        <button id="btn-favorite-${property.id}" class="flex-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium flex items-center justify-center gap-1">관심매물</button>
		        <button id="btn-compare-${property.id}" class="flex-1 px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium flex items-center justify-center gap-1">비교추가</button>
		      </div>
		    </div>
		  </div>
		`;
	} else {
		// 폴백: 간단 텍스트
		const lat = Number(property.lat ?? property.latitude ?? property.y ?? property.location_y);
		const lng = Number(property.lng ?? property.longitude ?? property.x ?? property.location_x);
		container2.innerHTML = `
		  <div class="bg-white rounded-lg shadow p-3">
		    <div><b>${property.title ?? ''}</b></div>
		    <div>${property.address ?? property.location ?? ''}</div>
		    <div>Status: ${property.status ?? ''} / Price: ${property.price ?? '-'}</div>
		    <div>(${Number.isFinite(lat) ? lat.toFixed(5) : '-'}, ${Number.isFinite(lng) ? lng.toFixed(5) : '-'})</div>
		  </div>
		`;
	}

    // 표시 후 다음 프레임에 정확한 위치로 보정 (첫 클릭 시 높이 0 문제 방지)
    container2.dataset.pid = String(property.id ?? '');
    container2.style.display = 'block';
    requestAnimationFrame(positionPopup);

    // 상세 오픈 시 팝업을 가려지게만 처리: z-index 낮추고 상호작용 비활성화
    if (!container2.__detailWatcher) {
        container2.__detailWatcher = setInterval(() => {
            const open = !!window.isDetailOpen;
            container2.style.zIndex = open ? '0' : '5';
            container2.style.pointerEvents = open ? 'none' : 'auto';
        }, 150);
    }

    // 리사이즈/스크롤 시 위치 재보정
    if (!container2.__repositionBound) {
        container2.__repositionBound = true;
        window.addEventListener('resize', () => {
            if (container2.style.display !== 'none') positionPopup();
        });
        window.addEventListener('scroll', () => {
            if (container2.style.display !== 'none') positionPopup();
        }, true);
    }

	setupPopupButtons(property);
}

function setupPopupButtons(property) {
	const detailBtn = document.getElementById(`btn-detail-view-${property.id}`);
	const favoriteBtn = document.getElementById(`btn-favorite-${property.id}`);
	const compareBtn = document.getElementById(`btn-compare-${property.id}`);

	if (detailBtn) {
		detailBtn.addEventListener('click', () => {
			if (typeof window.openPropertyDetail === 'function') {
				window.openPropertyDetail(property.id, property);
			} else {
				alert('상세보기 기능을 준비 중입니다.');
			}
		});
	}

	if (favoriteBtn) {
		favoriteBtn.addEventListener('click', async () => {
			try {
				if (typeof window.addFavorite === 'function') {
					await window.addFavorite(property.id);
				}
				alert('관심매물에 추가되었습니다.');
			} catch (e) {
				console.error('관심매물 추가 실패:', e);
				alert('관심매물 추가에 실패했습니다.');
			}
		});
	}

	if (compareBtn) {
		compareBtn.addEventListener('click', async () => {
			try {
				// TODO: 비교그룹 API 연동 시 여기서 호출
				alert('비교그룹에 추가되었습니다.');
			} catch (e) {
				console.error('비교그룹 추가 실패:', e);
				alert('비교그룹 추가에 실패했습니다.');
			}
		});
	}
}

// data.js의 const properties를 모듈 스코프에서 안전하게 참조하기 위한 헬퍼
function resolvePropertiesArray() {
	try {
		// 전역 식별자(properties)가 존재하면 참조 (let/const는 window에 안 붙기 때문)
		// eslint-disable-next-line no-eval
		const viaIdentifier = (0, eval)('typeof properties !== "undefined" ? properties : undefined');
		if (Array.isArray(viaIdentifier)) return viaIdentifier;
	} catch(_e) {}
	// window에 붙어 있는 경우 처리
	if (Array.isArray(window.properties)) return window.properties;
	return undefined;
}

// (테스트용 임시) 중앙 버튼과 팝업 연결: DOMContentLoaded 이후 바인딩
window.addEventListener('DOMContentLoaded', () => {
	const testBtn = document.getElementById('btn-test-marker-popup');
	if (!testBtn) return;

	testBtn.addEventListener('click', () => {
        // 토글: 열려 있으면 닫기, 닫혀 있으면 열기
        const existing = document.getElementById('marker-popup');
        if (existing && existing.style.display !== 'none') {
            existing.style.display = 'none';
            return;
        }

		// 샘플 주입 제거: data.js의 실제 id 102를 사용 (const properties 지원)
		const list = resolvePropertiesArray();
		if (Array.isArray(list)) {
			const p = list.find(x => x.id === 102);
			if (p) return renderMarkerPopup(p);
		}
		console.warn('[marker-popup] id 102 매물을 찾을 수 없습니다. data.js 로드/ID 확인 필요');
	});
});


