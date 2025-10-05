// js/search.js
(() => {
  // MapFilterPanel이 준비될 때까지 대기
  const initSearch = () => {
    const $input   = document.getElementById('global-search-input');
    const $suggest = document.getElementById('global-search-suggest');

    if (!$input || !$suggest) {
      console.warn('[Search] 검색 요소를 찾을 수 없습니다. MapFilterPanel 초기화를 대기합니다.');
      return false;
    }

    console.log('[Search] 검색 기능 초기화 시작');
    return true;
  };

  // 검색 핸들러 설정
  const setupSearchHandlers = () => {
    const $input   = document.getElementById('global-search-input');
    const $suggest = document.getElementById('global-search-suggest');

    // ===============================
    // 0) 네이버 로드 가드 + 안전 변환
    // ===============================
    function whenNaverReady(cb) {
      if (window.naver?.maps?.Map && window.naver?.maps?.TransCoord) return cb();
      const i = setInterval(() => {
        if (window.naver?.maps?.Map && window.naver?.maps?.TransCoord) {
          clearInterval(i);
          cb();
        }
      }, 50);
    }

    function tm128ToLatLng(mapx, mapy) {
      if (!window.naver?.maps?.TransCoord) return null; // 아직 준비 안 됨
      const tm = new naver.maps.Point(Number(mapx), Number(mapy));
      return naver.maps.TransCoord.fromTM128ToLatLng(tm); // {x:lng, y:lat}
    }

    // ===============================
    // 1) 지도/마커 관리
    // ===============================
    let map;
    const markers = [];
    const clearMarkers = () => { markers.forEach(m => m.setMap(null)); markers.length = 0; };
    const addMarker = (latlng, title) => {
      const m = new naver.maps.Marker({ position: latlng, map, title });
      markers.push(m);
      return m;
    };

    whenNaverReady(() => {
      if (!window.__naverMap) {
        window.__naverMap = new naver.maps.Map('map', {
          center: new naver.maps.LatLng(37.5665, 126.9780),
          zoom: 14,
          minZoom: 6,
          maxZoom: 18
        });
      }
      map = window.__naverMap;
    });

    // ===============================
    // 2) 디바운스
    // ===============================
    const debounce = (fn, d=250) => { let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a), d);} };

    // ===============================
    // 3) 제안 렌더링
    // ===============================
    const renderSuggest = (items) => {
      if (!items?.length) { $suggest.classList.add('hidden'); $suggest.innerHTML=''; return; }
      $suggest.innerHTML = items.slice(0, 10).map(it => {
        const name = it.title?.replace(/<[^>]+>/g,'') ?? '';
        const addr = it.roadAddress || it.address || '';
        const cat  = it.category || '';
        return `
          <button type="button" class="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 block"
                  data-mapx="${it.mapx}" data-mapy="${it.mapy}"
                  data-name="${name}">
            <div class="font-semibold text-gray-800">${name}</div>
            ${cat ? `<div class="text-xs text-gray-500">${cat}</div>` : ''}
            ${addr ? `<div class="text-xs text-gray-600">${addr}</div>` : ''}
          </button>
        `;
      }).join('');
      $suggest.classList.remove('hidden');
    };

    // ===============================
    // 4) 선택적 필터
    // ===============================
    const filterPOI = (items, q) => {
      const kw = q.replace(/\s+/g,'').toLowerCase();
      const isStationWord = /역|station/i.test(q);
      return items.filter(it => {
        const name = (it.title||'').replace(/<[^>]+>/g,'');
        const cat  = it.category||'';
        const hitStation = /역|[Tt]rain|[Ss]ubway|철도/.test(name+cat);
        const hitBuilding= /건물|빌딩|타워|센터|관|몰|프라자|아파트|오피스|대학|학교|병원|백화점|마트|롯데|현대|삼성|타워/i.test(name+cat);
        if (isStationWord) return hitStation;
        return hitStation || hitBuilding || name.replace(/\s+/g,'').toLowerCase().includes(kw);
      });
    };

    // ===============================
    // 5) 서버 호출
    // ===============================
    const fetchPlaces = async (q) => {
      const url = `/api/search/places?q=${encodeURIComponent(q)}&limit=5`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(await res.text() || '네이버 장소검색 실패');
      return res.json();
    };

    // ===============================
    // 6) 입력 이벤트
    // ===============================
    $input.addEventListener('input', debounce(async (e) => {
      const q = e.target.value.trim();
      if (q.length < 2) { renderSuggest([]); return; }
      try {
        const data = await fetchPlaces(q);
        const items = filterPOI(data.items || [], q);
        renderSuggest(items);
      } catch (err) {
        console.error(err);
        renderSuggest([]);
      }
    }, 250));

    // ===============================
    // 7) Enter/Escape
    // ===============================
    $input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const first = $suggest.querySelector('button[data-mapx][data-mapy]');
        if (first) first.click();
      } else if (e.key === 'Escape') {
        $suggest.classList.add('hidden');
      }
    });

    // ===============================
    // 8) 제안 클릭 → 지도 이동
    // ===============================
    $suggest.addEventListener('click', (e) => {
      e.preventDefault();
      const btn = e.target.closest('button[data-mapx][data-mapy]');
      if (!btn) return;

      const mapx = btn.dataset.mapx, mapy = btn.dataset.mapy;
      const name = btn.dataset.name || '';

      console.log("[CLICK] 버튼 클릭됨:", { name, mapx, mapy });

      whenNaverReady(() => {
        const latlng = tm128ToLatLng(mapx, mapy);
        console.log("[CONVERT] tm128ToLatLng 결과:", latlng);

        if (!latlng) {
          console.warn('Naver Maps TransCoord not ready');
          return;
        }

        $input.value = name;
        $suggest.classList.add('hidden');

        clearMarkers();
        const marker = addMarker(latlng, name);
        console.log("[MARKER] 추가됨:", marker);

        map.setCenter(latlng);
        console.log("[MAP] setCenter 호출:", latlng);

        map.setZoom(16, true);
        console.log("[MAP] setZoom 호출");
      });
    });

    // ===============================
    // 9) 바깥 클릭시 제안 닫기
    // ===============================
    document.addEventListener('click', (e) => {
      if (e.target === $input || $suggest.contains(e.target)) return;
      $suggest.classList.add('hidden');
    });

    console.log('[Search] 검색 핸들러 설정 완료');
  };

  // 즉시 초기화 시도
  if (!initSearch()) {
    // 실패하면 이벤트 대기
    console.log('[Search] MapFilterPanel 준비 대기 중...');
    window.addEventListener('mapFilterPanelReady', () => {
      console.log('[Search] MapFilterPanel 준비 완료, 재시도');
      if (!initSearch()) {
        console.error('[Search] MapFilterPanel이 준비되었지만 검색 요소를 찾을 수 없습니다.');
        return;
      }
      setupSearchHandlers();
    });
    return;
  }

  // 초기화가 성공했으면 바로 핸들러 설정
  setupSearchHandlers();
})();
