// 작은 카드 팝업 렌더링 (recommend-list 카드 재사용)
// 전역 createPropertyCard가 있으면 그대로 활용하고, 없으면 간단 텍스트로 대체

// oftion 비트를 옵션 배열로 변환
function parseOptions(oftionBit) {
  const optionNames = [
    '에어컨', '냉장고', '세탁기', '가스레인지', '인덕션레인지',
    '침대', '전자레인지', 'TV', '책상', 'CCTV'
  ];

  // 혹시 "1111" 이런 식으로 짧게 올 수도 있으니까 왼쪽 0패딩
  const bitStr = String(oftionBit).padStart(optionNames.length, '0');

  const options = [];
  for (let i = 0; i < optionNames.length; i++) {
    // bitStr[0] → 에어컨, bitStr[1] → 냉장고 ... 이런 식으로 대응
    if (bitStr[i] === '1') {
      options.push(optionNames[i]);
    }
  }
  return options;
  }

// 가격 포맷팅
function formatPrice(property) {
  const offers = property.property_offers || property.propertyOffers || [];
  const offer = offers[0]; // 일단 대표 1개만 사용

  // 오퍼가 아예 없으면, fallback으로 property.price 사용
  if (!offer) {
    return property.price != null ? Number(property.price).toLocaleString() : '-';
  }

  const type = offer.type; // "SALE" | "JEONSE" | "WOLSE"
  const total = offer.total_price != null ? Number(offer.total_price) : null;
  const deposit = offer.deposit != null ? Number(offer.deposit) : null;
  const monthly = offer.monthly_rent != null ? Number(offer.monthly_rent) : null;

  if (type === 'SALE') {
    if (total == null) return '매매가 협의';
    const eok = Math.floor(total / 100000000); // 1억 = 100,000,000
    const man = Math.round((total % 100000000) / 10000);
    return eok > 0 ? `매매 ${eok}억${man ? ' ' + man + '만' : ''}` : `매매 ${man}만`;
  }

  if (type === 'JEONSE') {
    if (total == null) return '전세가 협의';
    const eok = Math.floor(total / 100000000);
    const man = Math.round((total % 100000000) / 10000);
    return eok > 0 ? `전세 ${eok}억${man ? ' ' + man + '만' : ''}` : `전세 ${man}만`;
  }

  if (type === 'WOLSE') {
    if (deposit == null || monthly == null) return '월세 협의';
    const man = Math.floor(deposit / 10000);
    const wol = monthly/10000
    return `월세 ${man ? man + '만' : ''} / ${wol.toLocaleString() + '만'}`;
  }

  return property.price != null ? Number(property.price).toLocaleString() : '-';
}
// 백엔드 API 응답을 카드용 데이터로 변환
function transformPropertyForCard(apiResponse) {
	const offers = apiResponse.property_offers[0] || apiResponse.propertyOffers || {};
	const images = apiResponse.property_images || apiResponse.propertyImages || [];
    console.log('card src raw', apiResponse);

	return {
		id: apiResponse.id,
		image: images[0]?.image_url || images[0]?.imageUrl || 'https://via.placeholder.com/400x300?text=No+Image',
		price: formatPrice(apiResponse),
		location: apiResponse.address || '-',
		details: `${offers.housetype || '-'} ∙ ${offers.floor || '-'}층 ∙ ${apiResponse.area_m2 || apiResponse.areaM2 || '-'}m²`,
		tags: [], // 현재 백엔드에 없음
		buildingYear: apiResponse.building_year || apiResponse.buildingYear,
		options: parseOptions(offers.oftion || 0)
	};
}

// 전역 InfoWindow 객체 (재사용)
let globalInfoWindow = null;

export function renderMarkerPopup(apiResponse, map, marker) {
	if (!map || !marker) return;
	
	// 백엔드 데이터를 카드용으로 변환
	const property = transformPropertyForCard(apiResponse);
	
	// 기존 InfoWindow 닫기
	if (globalInfoWindow) {
		globalInfoWindow.close();
	}

	// HTML 콘텐츠 생성
	let contentHTML;
	if (typeof window.createPropertyCard === 'function' || typeof createPropertyCard === 'function') {
		// 전역에 존재하는 createPropertyCard 사용
		// eslint-disable-next-line no-undef
		const cardHTML = (typeof createPropertyCard === 'function' ? createPropertyCard(property) : window.createPropertyCard(property));
		contentHTML = `
		  <div class="bg-white rounded-lg shadow-lg" style="width: 20rem; max-height: 70vh; overflow-y: auto; overflow-x: hidden;">
		    <div class="flex items-center justify-between px-4 py-2 border-b border-gray-200">
		      <span class="text-sm font-medium text-gray-700">매물 정보</span>
		      <button id="btn-close-popup" class="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors">
		        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
		          <line x1="18" y1="6" x2="6" y2="18"></line>
		          <line x1="6" y1="6" x2="18" y2="18"></line>
		        </svg>
		      </button>
		    </div>
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
		  </div>
		`;
	} else {
		// 폴백: 간단 텍스트
		contentHTML = `
		  <div class="bg-white rounded-lg shadow-lg" style="width: 20rem;">
		    <div class="flex items-center justify-between px-4 py-2 border-b border-gray-200">
		      <span class="text-sm font-medium text-gray-700">매물 정보</span>
		      <button id="btn-close-popup" class="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors">
		        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
		          <line x1="18" y1="6" x2="6" y2="18"></line>
		          <line x1="6" y1="6" x2="18" y2="18"></line>
		        </svg>
		      </button>
		    </div>
		    <div class="p-3">
		      <div><b>${property.title || property.location || '매물 정보'}</b></div>
		      <div>${property.location || '-'}</div>
		      <div>${property.price || '-'}</div>
		    </div>
		  </div>
		`;
	}

	// InfoWindow 생성 (마커 위치 기준)
	globalInfoWindow = new naver.maps.InfoWindow({
		content: contentHTML,
		borderWidth: 0,                           // 테두리 제거
		backgroundColor: 'transparent',           // 배경 투명
		anchorSize: new naver.maps.Size(0, 0),   // 화살표 제거
		pixelOffset: new naver.maps.Point(0, -20) // 마커 위 20px
	});

	// 마커에 InfoWindow 열기
	globalInfoWindow.open(map, marker);

	// 버튼 이벤트 바인딩 (DOM이 생성된 후)
	setTimeout(() => setupPopupButtons(property), 0);
}

// 팝업 닫기 함수 (토글용)
export function closeMarkerPopup() {
	if (globalInfoWindow) {
		globalInfoWindow.close();
		globalInfoWindow = null;
	}
}

function setupPopupButtons(property) {
	const closeBtn = document.getElementById('btn-close-popup');
	const detailBtn = document.getElementById(`btn-detail-view-${property.id}`);
	const favoriteBtn = document.getElementById(`btn-favorite-${property.id}`);
	const compareBtn = document.getElementById(`btn-compare-${property.id}`);

	// 닫기 버튼
	if (closeBtn) {
		closeBtn.addEventListener('click', () => {
			closeMarkerPopup();
		});
	}

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