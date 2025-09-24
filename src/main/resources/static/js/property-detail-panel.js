// 상세 패널 더블버퍼 A/B 관리 및 애니메이션 전환
// 공개 API: initPropertyDetailPanel, openPropertyDetail(id, data?), closePropertyDetail()

(function(){
    let currentBuffer = 'a'; // 현재 표시 중인 버퍼 id: 'a' | 'b'
    let isOpen = false;
    let currentId = null;

    const qs = (sel) => document.querySelector(sel);

    // 전역 properties 접근: data.js의 const properties 직접 사용
    function getProperties(){
        try { 
            if (typeof properties !== 'undefined' && Array.isArray(properties)) return properties; 
        } catch(_e){}
        return undefined;
    }

    // 다양한 스키마의 매물 객체를 상세 패널이 기대하는 형태로 변환하는 어댑터
    function normalizeProperty(p){
        if(!p || typeof p !== 'object') return {};
        const city = p.city ?? p.si ?? '';
        const district = p.district ?? p.gu ?? p.gun ?? '';
        const dong = p.dong ?? p.town ?? '';
        const locationText = (p.location ?? `${city} ${district} ${dong}`).trim();
        let areaM2 = p.areaM2 ?? p.area ?? p.sizeM2 ?? '';
        let rooms = p.rooms ?? p.roomCount ?? p.bedrooms ?? '';
        let type = p.type ?? p.houseType ?? p.category ?? '';
        const detailsText = p.details ?? [type, rooms ? `방 ${rooms}개` : '', areaM2 ? `${areaM2}m²` : ''].filter(Boolean).join(' ∙ ');
        // details에서 보조 파싱
        if(!areaM2 && typeof detailsText === 'string'){
            const m = detailsText.match(/([0-9]+(?:\.[0-9]+)?)\s*m²/);
            if(m) areaM2 = m[1];
        }
        if(!rooms && typeof detailsText === 'string'){
            const m = detailsText.match(/방\s*(\d+)/);
            if(m) rooms = m[1];
        }
        if(!type && typeof detailsText === 'string'){
            if(detailsText.includes('아파트')) type = '아파트';
            else if(detailsText.includes('오피스텔')) type = '오피스텔';
            else if(detailsText.includes('빌라')) type = '빌라';
        }
        const status = p.status ?? (p.isSold ? 'sold' : (p.isReserved ? 'reserved' : 'active'));
        const statusText = p.statusText ?? (status === 'sold' ? '거래완료' : status === 'reserved' ? '예약중' : '판매중');
        const images = Array.isArray(p.images) ? p.images : (Array.isArray(p.photos) ? p.photos : []);
        const image = p.image ?? images[0] ?? '';
        const optionsArr = p.options ?? p.tags ?? [];
        const title = p.title ?? p.name ?? '';
        const price = p.priceText ?? p.price ?? '';
        const description = p.description ?? p.memo ?? '';
        const id = p.id ?? p.propertyId ?? p.pid ?? undefined;
        const buildingYear = p.buildingYear ?? p.buildYear ?? undefined;
        const bath = p.bathrooms ?? p.baths ?? p.bath ?? '';
        const direction = p.direction ?? '';
        const parkingText = p.parkingText ?? (p.parking != null ? String(p.parking) : '');
        const moveInDate = p.moveInDate ?? p.availableDate ?? '';
        const areaText = areaM2 ? `${areaM2} m²` : '';
        const roomBathText = rooms || bath ? `방 ${rooms || '-'}개 / 욕실 ${bath || '-'}` : '';
        const brokerName = p.brokerName ?? '';
        const brokerPhone = p.brokerPhone ?? '';
        const isApartment = (type === '아파트') || (typeof detailsText === 'string' && detailsText.includes('아파트'));
        return { id, image, title, location: locationText, price, details: detailsText, options: optionsArr, description, status, statusText, buildingYear, direction, areaText, roomBathText, parkingText, moveInDate, brokerName, brokerPhone, isApartment };
    }

    function getElems(buf){
        const suffix = buf === 'a' ? 'a' : 'b';
        return {
            overlay: qs(`#property-detail-overlay-${suffix}`),
            closeBtn: qs(`#close-property-detail-${suffix}`),
            img: qs(`#detail-property-image-${suffix}`),
            status: qs(`#detail-property-status-${suffix}`),
            title: qs(`#detail-property-title-${suffix}`),
            location: qs(`#detail-property-location-${suffix}`),
            price: qs(`#detail-property-price-${suffix}`),
            details: qs(`#detail-property-details-${suffix}`),
            options: qs(`#detail-property-options-${suffix}`),
            desc: qs(`#detail-property-description-${suffix}`),
            favBtn: qs(`#favorite-button-${suffix}`),
            favIcon: qs(`#favorite-icon-${suffix}`)
        };
    }

    function setOverlayVisible(el, visible){
        if(!el) return;
        if(visible){
            el.style.opacity = '1';
            el.style.pointerEvents = 'auto';
            el.classList.remove('-translate-x-full');
        }else{
            el.style.opacity = '0';
            el.style.pointerEvents = 'none';
            el.classList.add('-translate-x-full');
        }
    }

    function renderInto(buf, data){
        const el = getElems(buf);
        if(!el.overlay) return;

        const d = data || {};
        const suffix = buf;
        
        // 매물 정보 채우기 - f311d46과 동일한 순서
        el.img && (el.img.src = d.image || '');
        if (el.title) el.title.textContent = d.location || '';
        if (el.location) { el.location.style.display = 'none'; }
        if (el.price) el.price.textContent = d.price || '';
        if (el.details) el.details.textContent = d.details || '';
        
        // buildingYear - f311d46 방식
        const buildYearEl = qs(`#detail-building-year-${suffix}`);
        if(buildYearEl) buildYearEl.textContent = (d.buildingYear || '') + '년';
        
        // area - f311d46 방식: details.split(' ∙ ')[3]
        const areaEl = qs(`#detail-property-area-${suffix}`);
        if(areaEl) {
            const areaText = (d.details || '').split(' ∙ ')[3] || '';
            areaEl.textContent = areaText;
        }
        
        if(el.desc) el.desc.textContent = d.description || '';
        
        const brokerName = qs(`#detail-broker-name-${suffix}`);
        const brokerPhone = qs(`#detail-broker-phone-${suffix}`);
        if(brokerName) brokerName.textContent = d.brokerName || '';
        if(brokerPhone) brokerPhone.textContent = d.brokerPhone || '';

        // 평면도(임시) 노출: details의 첫 항목이 '아파트'인 경우만 보이기 - f311d46 방식
        const isApartment = (d.details || '').split(' ∙ ')[0] === '아파트';
        const floorplanWrapper = qs(`#detail-floorplan-wrapper-${suffix}`);
        if (floorplanWrapper) {
            floorplanWrapper.style.display = isApartment ? 'block' : 'none';
        }

        // 임시 상세 항목들: 비워둠 - f311d46 방식
        const emptyFields = [
            `detail-room-bath-${suffix}`,
            `detail-direction-${suffix}`,
            `detail-room-structure-${suffix}`,
            `detail-duplex-${suffix}`,
            `detail-parking-${suffix}`,
            `detail-move-in-date-${suffix}`,
            `detail-maintenance-fee-${suffix}`,
            `detail-household-count-${suffix}`
        ];
        emptyFields.forEach(id => {
            const el = qs(`#${id}`);
            if (el) el.textContent = '';
        });
        
        // 상태 표시 - f311d46 방식
        if(el.status){
            const statusMap = {
                'AVAILABLE': { text: '거래가능', class: 'bg-green-100 text-green-800' },
                'CONTRACTED': { text: '계약중', class: 'bg-yellow-100 text-yellow-800' },
                'SOLD': { text: '거래완료', class: 'bg-gray-100 text-gray-800' }
            };
            const status = statusMap[d.status] || statusMap['AVAILABLE'];
            el.status.textContent = status.text;
            el.status.className = `px-3 py-1 rounded-full text-sm font-semibold ${status.class}`;
        }
        
        // 옵션 표시 - f311d46 방식
        if(el.options){
            el.options.innerHTML = '';
            (d.options || []).forEach(option => {
                const optionElement = document.createElement('span');
                optionElement.className = 'bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full';
                optionElement.textContent = option;
                el.options.appendChild(optionElement);
            });
        }

        if(el.favBtn){
            el.favBtn.onclick = () => {
                const pressed = el.favBtn.getAttribute('aria-pressed') === 'true';
                el.favBtn.setAttribute('aria-pressed', (!pressed).toString());
                el.favIcon && (el.favIcon.classList.toggle('text-red-500', !pressed));
            };
        }
        if(el.closeBtn){
            el.closeBtn.onclick = () => closePropertyDetail();
        }
    }

    function findPropertyById(id){
        try{
            const list = getProperties();
            if(Array.isArray(list)){
                const idx = Number(id);
                // properties에 id 필드가 없을 수 있어 index 기준으로도 대응
                return list[idx] || list.find(p => p.id === id || p.id === idx) || null;
            }
        }catch(_e){}
        return null;
    }

    // 좌측 패널 버튼 위치/투명도 제어
    function updatePanelButtonsForDetail(isDetailOpen){
        const closeBtn = document.getElementById('close-panel-button');
        const expandBtn = document.getElementById('expand-panel-button');
        if(!closeBtn || !expandBtn) return;

        if(isDetailOpen){
            // 원래 값 보존
            if(!closeBtn.dataset.origLeft) closeBtn.dataset.origLeft = closeBtn.style.left || '450px';
            if(!expandBtn.dataset.origLeft) expandBtn.dataset.origLeft = expandBtn.style.left || '450px';

            const detailRightEdge = 450 + Math.floor(window.innerWidth * 0.5);
            closeBtn.style.left = `${detailRightEdge}px`;
            closeBtn.style.zIndex = '10'; // 상세페이지와 같은 z-index
            expandBtn.style.left = `${expandBtn.dataset.origLeft}`; // 확장 버튼은 제자리에 두되 반투명화

            // 반투명 + 호버 시 복원
            expandBtn.classList.add('opacity-50');
            const onEnter = () => expandBtn.classList.remove('opacity-50');
            const onLeave = () => expandBtn.classList.add('opacity-50');
            expandBtn.__detailHoverEnter = onEnter;
            expandBtn.__detailHoverLeave = onLeave;
            expandBtn.addEventListener('mouseenter', onEnter);
            expandBtn.addEventListener('mouseleave', onLeave);
        } else {
            // 원복
            if(closeBtn.dataset.origLeft){ closeBtn.style.left = closeBtn.dataset.origLeft; }
            closeBtn.style.zIndex = ''; // z-index 원복
            if(expandBtn.dataset.origLeft){ expandBtn.style.left = expandBtn.dataset.origLeft; }
            if(expandBtn.__detailHoverEnter){ expandBtn.removeEventListener('mouseenter', expandBtn.__detailHoverEnter); }
            if(expandBtn.__detailHoverLeave){ expandBtn.removeEventListener('mouseleave', expandBtn.__detailHoverLeave); }
            expandBtn.classList.remove('opacity-50');
        }
    }

    function openPropertyDetail(id, data){
        // 같은 매물을 다시 클릭한 경우 (토글 동작) - f311d46 로직
        // data가 있으면 data.id로 비교, 없으면 id로 비교
        const compareId = data?.id ?? id;
        if (currentId === compareId && isOpen) {
            closePropertyDetail();
            return;
        }

        const raw = data || findPropertyById(id) || {};
        const incoming = normalizeProperty(raw);
        const nextBuf = currentBuffer === 'a' ? 'b' : 'a';
        const curElems = getElems(currentBuffer);
        const nextElems = getElems(nextBuf);

        renderInto(nextBuf, incoming);

        // 겹치기: 현재 닫히는 애니메이션 + 다음 열림 애니메이션 동시
        setOverlayVisible(nextElems.overlay, true);
        if(isOpen && curElems.overlay){
            // 현재를 닫는 모션을 위해 잠시 visible 유지 후 비활성
            curElems.overlay.classList.add('-translate-x-full');
            setTimeout(() => setOverlayVisible(curElems.overlay, false), 300);
        }

        updatePanelButtonsForDetail(true);
        // 리사이즈 시 위치 재계산
        const onResize = () => { if(isOpen) updatePanelButtonsForDetail(true); };
        window.addEventListener('resize', onResize);
        nextElems.overlay.__detailOnResize = onResize;

        isOpen = true;
        currentId = compareId; // data.id 또는 id 사용
        currentBuffer = nextBuf;

        // 우측 패널/필터 위치 조정 필요 시 호출
        if(typeof window.adjustAllFilterDropdownPosition === 'function'){
            setTimeout(() => window.adjustAllFilterDropdownPosition(), 300);
        }
    }

    function closePropertyDetail(){
        const curElems = getElems(currentBuffer);
        if(curElems.overlay){
            curElems.overlay.classList.add('-translate-x-full');
            setTimeout(() => setOverlayVisible(curElems.overlay, false), 300);
        }
        updatePanelButtonsForDetail(false);
        // 리사이즈 핸들러 해제
        const onResize = curElems.overlay && curElems.overlay.__detailOnResize;
        if(onResize){ window.removeEventListener('resize', onResize); curElems.overlay.__detailOnResize = null; }
        isOpen = false;
        currentId = null;
        if(typeof window.adjustAllFilterDropdownPosition === 'function'){
            setTimeout(() => window.adjustAllFilterDropdownPosition(), 300);
        }
    }

    // 모든 매물 상세 페이지 닫기 - f311d46 로직
    function closeAllPropertyDetails(){
        // 두 패널 모두 완전히 숨기기
        const overlayA = qs('#property-detail-overlay-a');
        const overlayB = qs('#property-detail-overlay-b');
        
        if(overlayA){
            overlayA.classList.add('-translate-x-full');
            overlayA.style.opacity = '0';
            overlayA.style.pointerEvents = 'none';
            overlayA.style.zIndex = '';
        }
        if(overlayB){
            overlayB.classList.add('-translate-x-full');
            overlayB.style.opacity = '0';
            overlayB.style.pointerEvents = 'none';
            overlayB.style.zIndex = '';
        }
        
        // 상태 초기화
        isOpen = false;
        currentId = null;
        currentBuffer = 'a';

        // 상세 페이지가 닫힐 때: 좌측 패널 버튼 UI 원복
        updatePanelButtonsForDetail(false);
    }

    function initPropertyDetailPanel(){
        // 초기 상태를 명시적으로 감춤
        ['a','b'].forEach(buf => {
            const el = getElems(buf).overlay;
            if(el){
                el.classList.add('-translate-x-full');
                el.style.opacity = '0';
                el.style.pointerEvents = 'none';
            }
        });
    }

    // 기존 렌더 코드를 유지한 채, 이벤트 위임으로 카드 클릭을 감지하여 상세 열기
    function getOriginalIndexFromContainer(containerId, childIndex){
        const list = getProperties();
        if(!Array.isArray(list)) return childIndex;
        
        if(containerId === 'recommended-list'){
            let count = -1;
            for(let i=0;i<list.length;i++){
                if(list[i]?.isRecommended){
                    count++;
                    if(count === childIndex) return i;
                }
            }
        } else if(containerId === 'property-list'){
            let count = -1;
            for(let i=0;i<list.length;i++){
                if(!list[i]?.isRecommended){
                    count++;
                    if(count === childIndex) return i;
                }
            }
        }
        return childIndex;
    }

    function attachDelegatedClick(container){
        if(!container) return;
        container.addEventListener('click', (e) => {
            // 매물 카드 찾기 (data-property-id 속성 또는 클래스 기반)
            let propertyCard;
            if(container.id === 'compare-list'){
                // 비교 그룹의 경우 더 구체적인 선택자 사용
                propertyCard = e.target.closest('.bg-white.rounded-lg.shadow-md.overflow-hidden.flex-1.min-w-0');
            } else {
                propertyCard = e.target.closest('[data-property-id], .bg-white.rounded-lg.shadow-md');
            }
            if(!propertyCard) return;
            
            // 이벤트 버블링 방지
            e.stopPropagation();
            
            let data;
            let originalIndex = 0;
            
            // data-property-id가 있으면 직접 사용
            if(propertyCard.hasAttribute('data-property-id')){
                const propertyId = parseInt(propertyCard.getAttribute('data-property-id'));
                const list = getProperties();
                data = Array.isArray(list) ? list[propertyId] : undefined;
            } else {
                // 클래스 기반으로 찾기 (비교 그룹 등)
                if(container.id === 'compare-list'){
                    // 비교 그룹: 그룹 내에서 매물 찾기
                    const groupContainer = propertyCard.closest('.bg-gray-50.border.rounded-lg');
                    if(!groupContainer) {
                        console.log('비교 그룹 컨테이너를 찾을 수 없음');
                        return;
                    }
                    const groupIndex = Array.from(container.children).indexOf(groupContainer);
                    // 비교 그룹 내에서 매물 카드들의 인덱스 찾기 (제목과 버튼 제외)
                    const propertyCards = groupContainer.querySelectorAll('.bg-white.rounded-lg.shadow-md.overflow-hidden.flex-1.min-w-0');
                    const cardIndex = Array.from(propertyCards).indexOf(propertyCard);
                    console.log('비교 그룹 인덱스:', groupIndex, '카드 인덱스:', cardIndex, '총 카드 수:', propertyCards.length);
                    
                    const groupData = typeof compareGroups !== 'undefined' && Array.isArray(compareGroups) ? compareGroups[groupIndex] : undefined;
                    // compareGroups의 데이터 구조: {groupId: 1, items: Array(2)} - 소문자 items 사용
                    data = groupData && Array.isArray(groupData.items) ? groupData.items[cardIndex] : undefined;
                    
                    // 비교 그룹 매물에 고유 ID 생성 (groupId + cardIndex)
                    if(data) {
                        data.id = `compare_${groupData.groupId}_${cardIndex}`;
                    }
                    
                    console.log('비교 그룹 데이터:', groupData, '매물 데이터:', data);
                } else {
                    // 일반 목록
                    const idx = Array.from(container.children).indexOf(propertyCard);
                    originalIndex = getOriginalIndexFromContainer(container.id, idx);
                    const list = getProperties();
                    data = Array.isArray(list) ? list[originalIndex] : undefined;
                }
            }
            
            if(!data) return;
            
            // 패널 확장 상태 확인
            if(typeof window.isPanelExpanded !== 'undefined' && window.isPanelExpanded) {
                const collapseFullscreenButton = document.getElementById('collapse-fullscreen-button');
                if (collapseFullscreenButton) {
                    collapseFullscreenButton.click();
                } else {
                    window.isPanelExpanded = false;
                    if(typeof window.updateUIVisibility === 'function') window.updateUIVisibility();
                }
                setTimeout(() => {
                    if(typeof window.openPropertyDetail === 'function'){
                        window.openPropertyDetail(data?.id || 0, data);
                    }
                }, 320);
            } else {
                if(typeof window.openPropertyDetail === 'function'){
                    window.openPropertyDetail(data?.id || 0, data);
                }
            }
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        // 상세 패널 초기화 및 클릭 바인딩(위임)
        initPropertyDetailPanel();
        attachDelegatedClick(qs('#recommended-list'));
        attachDelegatedClick(qs('#property-list'));
        // favorite-list는 백엔드 DB 연동 예정이므로 제외
        attachDelegatedClick(qs('#compare-list'));
    });

    // 공개
    window.initPropertyDetailPanel = initPropertyDetailPanel;
    window.openPropertyDetail = openPropertyDetail;
    window.closePropertyDetail = closePropertyDetail;
    window.closeAllPropertyDetails = closeAllPropertyDetails;
})();


