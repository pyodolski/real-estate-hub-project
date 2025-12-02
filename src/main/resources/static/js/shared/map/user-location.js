// src/main/resources/static/js/shared/map/user-location.js
// 사용자의 현재 위치를 가져오고 지도에 표시하는 기능

/**
 * 사용자의 현재 위치 마커
 */
let userLocationMarker = null;

/**
 * 사용자의 현재 위치를 가져와서 지도에 표시하는 함수
 * @param {naver.maps.Map} map - 네이버 지도 객체
 * @param {boolean} moveToLocation - 현재 위치로 지도를 이동할지 여부 (기본: true)
 * @param {number} zoom - 이동 시 적용할 줌 레벨 (기본: 15)
 */
export function getUserLocation(map, moveToLocation = true, zoom = 15) {
  if (!map) {
    console.error('[user-location] 지도 객체가 없습니다.');
    return;
  }

  if (!navigator.geolocation) {
    alert('이 브라우저는 위치 서비스를 지원하지 않습니다.');
    console.error('[user-location] Geolocation API를 지원하지 않는 브라우저입니다.');
    return;
  }

  console.log('[user-location] 현재 위치 요청 중...');

  navigator.geolocation.getCurrentPosition(
    // 성공 콜백
    (position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      const accuracy = position.coords.accuracy; // 정확도 (미터)

      console.log(`[user-location] 현재 위치: ${latitude}, ${longitude} (정확도: ${accuracy}m)`);

      const userLocation = new naver.maps.LatLng(latitude, longitude);

      // 지도 중심을 현재 위치로 이동
      if (moveToLocation) {
        map.setCenter(userLocation);
        map.setZoom(zoom);
      }

      // 기존 마커 제거
      if (userLocationMarker) {
        userLocationMarker.setMap(null);
      }

      // 현재 위치에 커스텀 마커 표시
      userLocationMarker = new naver.maps.Marker({
        position: userLocation,
        map: map,
        title: '현재 위치',
        icon: {
          content: `
            <div style="position: relative; width: 24px; height: 24px;">
              <!-- 외부 펄스 효과 -->
              <div style="
                position: absolute;
                top: 0;
                left: 0;
                width: 24px;
                height: 24px;
                background-color: rgba(66, 133, 244, 0.3);
                border-radius: 50%;
                animation: pulse 2s infinite;
              "></div>
              <!-- 내부 점 -->
              <div style="
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 14px;
                height: 14px;
                background-color: #4285F4;
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 2px 6px rgba(0,0,0,0.3);
              "></div>
            </div>
            <style>
              @keyframes pulse {
                0% {
                  transform: scale(1);
                  opacity: 1;
                }
                100% {
                  transform: scale(2.5);
                  opacity: 0;
                }
              }
            </style>
          `,
          anchor: new naver.maps.Point(12, 12)
        },
        zIndex: 1000
      });

      console.log('[user-location] 현재 위치 마커가 지도에 표시되었습니다.');
    },
    // 실패 콜백
    (error) => {
      let errorMessage = '';
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = '위치 정보 접근이 거부되었습니다.\n브라우저 설정에서 위치 권한을 허용해주세요.';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = '위치 정보를 사용할 수 없습니다.';
          break;
        case error.TIMEOUT:
          errorMessage = '위치 정보 요청 시간이 초과되었습니다.';
          break;
        default:
          errorMessage = '알 수 없는 오류가 발생했습니다.';
      }
      console.error(`[user-location] ${errorMessage}`, error);
      alert(errorMessage);
    },
    // 옵션
    {
      enableHighAccuracy: true, // 고정밀도 사용 (GPS 우선)
      timeout: 10000,           // 10초 타임아웃
      maximumAge: 0             // 캐시된 위치 사용 안 함 (항상 최신 위치)
    }
  );
}

/**
 * 실시간으로 사용자의 위치를 추적하는 함수
 * @param {naver.maps.Map} map - 네이버 지도 객체
 * @param {boolean} followUser - 사용자 위치를 따라 지도를 이동할지 여부 (기본: false)
 * @returns {number} watchId - 위치 추적을 중지할 때 사용할 ID
 */
export function watchUserLocation(map, followUser = false) {
  if (!map) {
    console.error('[user-location] 지도 객체가 없습니다.');
    return null;
  }

  if (!navigator.geolocation) {
    alert('이 브라우저는 위치 서비스를 지원하지 않습니다.');
    return null;
  }

  console.log('[user-location] 실시간 위치 추적 시작...');

  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      console.log(`[user-location] 위치 업데이트: ${latitude}, ${longitude}`);

      const userLocation = new naver.maps.LatLng(latitude, longitude);

      // 지도를 계속 따라가도록 설정한 경우
      if (followUser) {
        map.panTo(userLocation);
      }

      // 마커 위치 업데이트
      if (userLocationMarker) {
        userLocationMarker.setPosition(userLocation);
      } else {
        // 마커가 없으면 새로 생성
        userLocationMarker = new naver.maps.Marker({
          position: userLocation,
          map: map,
          title: '현재 위치',
          icon: {
            content: `
              <div style="position: relative; width: 24px; height: 24px;">
                <div style="
                  position: absolute;
                  top: 0;
                  left: 0;
                  width: 24px;
                  height: 24px;
                  background-color: rgba(66, 133, 244, 0.3);
                  border-radius: 50%;
                  animation: pulse 2s infinite;
                "></div>
                <div style="
                  position: absolute;
                  top: 50%;
                  left: 50%;
                  transform: translate(-50%, -50%);
                  width: 14px;
                  height: 14px;
                  background-color: #4285F4;
                  border-radius: 50%;
                  border: 3px solid white;
                  box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                "></div>
              </div>
            `,
            anchor: new naver.maps.Point(12, 12)
          },
          zIndex: 1000
        });
      }
    },
    (error) => {
      console.error('[user-location] 위치 추적 오류:', error.message);
    },
    {
      enableHighAccuracy: true,
      maximumAge: 30000, // 30초마다 업데이트
      timeout: 27000
    }
  );

  return watchId;
}

/**
 * 위치 추적을 중지하는 함수
 * @param {number} watchId - watchUserLocation에서 반환된 ID
 */
export function stopWatchingLocation(watchId) {
  if (watchId !== null && watchId !== undefined) {
    navigator.geolocation.clearWatch(watchId);
    console.log('[user-location] 위치 추적이 중지되었습니다.');
  }
}

/**
 * 현재 위치 마커를 제거하는 함수
 */
export function removeUserLocationMarker() {
  if (userLocationMarker) {
    userLocationMarker.setMap(null);
    userLocationMarker = null;
    console.log('[user-location] 현재 위치 마커가 제거되었습니다.');
  }
}