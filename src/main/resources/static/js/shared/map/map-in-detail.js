/**
 * 매물 상세 페이지 내 지도 표시 모듈
 * 주소를 좌표로 변환하여 지도를 띄우고 마커를 표시합니다.
 */
window.MapInDetail = {
    /**
     * 지도 초기화
     * @param {string} elementId - 지도를 표시할 DOM 요소 ID
     * @param {string} address - 매물 주소
     */
    init: function (elementId, address) {
        const mapElement = document.getElementById(elementId);
        if (!mapElement) return;

        // 네이버 지도 API 로드 확인
        if (typeof naver === 'undefined' || !naver.maps) {
            console.error('네이버 지도 API가 로드되지 않았습니다.');
            mapElement.innerHTML = '<div class="flex items-center justify-center h-full text-gray-500">지도 로드 실패</div>';
            return;
        }

        if (!address) {
            mapElement.innerHTML = '<div class="flex items-center justify-center h-full text-gray-500">주소 정보가 없습니다.</div>';
            return;
        }

        // 주소 -> 좌표 변환 (Geocoding)
        naver.maps.Service.geocode({
            query: address
        }, function (status, response) {
            if (status !== naver.maps.Service.Status.OK) {
                console.warn('주소 검색 실패:', address);
                // 실패 시 기본 위치(서울시청) 또는 에러 메시지 표시
                // 여기서는 에러 메시지 대신 기본 지도를 보여주거나 안내 문구 표시
                mapElement.innerHTML = '<div class="flex items-center justify-center h-full text-gray-500">위치를 찾을 수 없습니다.</div>';
                return;
            }

            const result = response.v2.addresses[0];
            if (!result) {
                mapElement.innerHTML = '<div class="flex items-center justify-center h-full text-gray-500">위치 정보 없음</div>';
                return;
            }

            const coords = new naver.maps.LatLng(result.y, result.x);

            // 지도 생성
            const map = new naver.maps.Map(elementId, {
                center: coords,
                zoom: 16,
                zoomControl: true,
                zoomControlOptions: {
                    position: naver.maps.Position.TOP_RIGHT
                }
            });

            // 마커 생성
            new naver.maps.Marker({
                position: coords,
                map: map
            });

            // 맵 인스턴스를 요소에 저장해두어 나중에 참조 가능하게 함 (선택 사항)
            mapElement._naverMap = map;
        });
    }
};
