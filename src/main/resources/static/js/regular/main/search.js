// js/search.js
(() => {
  // 중복 실행 방지
  if (window.__SEARCH_INITED__) return;
  window.__SEARCH_INITED__ = true;

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
    // 0) 네이버 로드 가드
    // ===============================
    function whenNaverReady(cb, timeoutMs = 8000) {
      console.log("[CLICK] 버튼 클릭됨:");
      const ready = () => !!(window.naver?.maps?.Map);
      if (ready()) return cb();
      const start = Date.now();
      const i = setInterval(() => {
        if (ready()) {
          clearInterval(i);
          cb();
        } else if (Date.now() - start > timeoutMs) {
          clearInterval(i);
          console.error("[NAVER] Map 로드 타임아웃");
        }
      }, 50);
    }

    // ===============================
    // 좌표 스마트 변환 (WGS84, 스케일된 WGS84(×1e7), TM128 모두 처리)
    // ===============================
    function toLatLngSmart(mapx, mapy) {
      let x = Number(mapx), y = Number(mapy);
      if (!Number.isFinite(x) || !Number.isFinite(y)) return null;

      // Case A) 이미 경위도 범위 (x=lng, y=lat)
      if (Math.abs(y) <= 90 && Math.abs(x) <= 180) {
        return new naver.maps.LatLng(y, x);
      }

      // Case B) 스케일된 경위도(WGS84 × 1e7) — 네이버 로컬검색 형식
      // 예: mapx "1286017630" -> 128.6017630 (lng), mapy "358713898" -> 35.8713898 (lat)
      if (Math.abs(x) > 180 && Math.abs(y) > 90) {
        const sx = x / 1e7, sy = y / 1e7; // sx=lng, sy=lat
        if (Math.abs(sx) <= 180 && Math.abs(sy) <= 90) {
          return new naver.maps.LatLng(sy, sx);
        }
      }

      // Case C) TM128처럼 보이면 변환 (geocoder 서브모듈 필요)
      if (!window.naver?.maps?.TransCoord) {
        console.warn("[NAVER] TransCoord 미로드: TM128 → WGS84 변환 불가 (스크립트에 &submodules=coord,geocoder 권장)");
        return null;
      }
      const tm = new naver.maps.Point(x, y);
      const p  = naver.maps.TransCoord.fromTM128ToLatLng(tm);
      if (p instanceof naver.maps.LatLng) return p;
      if (p && typeof p.x === 'number' && typeof p.y === 'number') {
        return new naver.maps.LatLng(p.y, p.x);
      }
      return null;
    }

    // ===============================
    // 1) 지도/마커 관리
    // ===============================
    // ✅ initmap.js가 만든 지도만 쓴다
    let map = null;
    function getMapOrWait(cb) {
      if (window.__naverMap) { cb(window.__naverMap); return; }
      const onReady = () => { window.removeEventListener('map:ready', onReady); cb(window.__naverMap); };
      window.addEventListener('map:ready', onReady);
    }
    // ✅ 검색 포커스 마커 1개만 (property 마커와 충돌 방지)
    let searchMarker = null;
    function setSearchMarker(latlng, title) {
      if (!map) return;
      if (!searchMarker) {
        searchMarker = new naver.maps.Marker({ position: latlng, map, title });
      } else {
        searchMarker.setPosition(latlng);
        searchMarker.setTitle?.(title);
        searchMarker.setMap(map);
      }
    }

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
        // 좌표 숫자 유효성만 1차 필터
        const raw = (data.items || []).filter(it =>
          it.mapx && it.mapy && Number.isFinite(Number(it.mapx)) && Number.isFinite(Number(it.mapy))
        );
        const items = filterPOI(raw, q);
        renderSuggest(items.length ? items : raw.slice(0, 5));
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

      getMapOrWait((m) => {
        map = m;
        const latlng = toLatLngSmart(mapx, mapy);
        if (!latlng) { console.warn('좌표 변환 실패'); return; }
        $input.value = name;
        $suggest.classList.add('hidden');

        setSearchMarker(latlng, name);      // ✅ 검색 포커스 마커만
        naver.maps.Event.trigger(map, 'resize');
        map.panTo(latlng);
        map.setZoom(16, true);
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
    const boot = () => {
      console.log('[Search] 재시도');
      if (!initSearch()) {
        console.error('[Search] MapFilterPanel이 준비되었지만 검색 요소를 찾을 수 없습니다.');
        return;
      }
      setupSearchHandlers();
    };
    window.addEventListener('mapFilterPanelReady', boot, { once: true });
    document.addEventListener('DOMContentLoaded', boot, { once: true });
    return;
  }

  // 초기화가 성공했으면 바로 핸들러 설정
  setupSearchHandlers();
})();
