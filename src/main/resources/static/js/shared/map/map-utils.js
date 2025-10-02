/**
 * MapUtils - 지도 관련 유틸리티 함수 모음
 * 좌표 변환, 거리 계산, 경계 검사 등 지도 관련 헬퍼 함수 제공
 */

/**
 * 두 지점 간의 거리 계산 (미터 단위)
 * Haversine 공식 사용
 * @param {number} lat1 - 지점1 위도
 * @param {number} lng1 - 지점1 경도
 * @param {number} lat2 - 지점2 위도
 * @param {number} lng2 - 지점2 경도
 * @returns {number} 거리 (미터)
 */
export function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371e3; // 지구 반지름 (미터)
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * 거리를 읽기 쉬운 형식으로 변환
 * @param {number} meters - 미터 단위 거리
 * @returns {string} 변환된 거리 문자열 (예: "1.2km", "350m")
 */
export function formatDistance(meters) {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)}km`;
  }
  return `${Math.round(meters)}m`;
}

/**
 * 좌표가 유효한지 검사
 * @param {number} lat - 위도
 * @param {number} lng - 경도
 * @returns {boolean}
 */
export function isValidCoordinate(lat, lng) {
  const latNum = Number(lat);
  const lngNum = Number(lng);

  return (
    Number.isFinite(latNum) &&
    Number.isFinite(lngNum) &&
    latNum >= -90 &&
    latNum <= 90 &&
    lngNum >= -180 &&
    lngNum <= 180
  );
}

/**
 * 매물 객체에서 좌표 추출
 * 다양한 필드명 지원
 * @param {Object} property - 매물 객체
 * @returns {{lat: number, lng: number}|null}
 */
export function extractCoordinates(property) {
  const lat = Number(property.lat ?? property.latitude ?? property.y ?? property.location_y);
  const lng = Number(property.lng ?? property.longitude ?? property.x ?? property.location_x);

  if (isValidCoordinate(lat, lng)) {
    return { lat, lng };
  }

  return null;
}

/**
 * 지도 경계 내에 좌표가 포함되는지 확인
 * @param {number} lat - 확인할 위도
 * @param {number} lng - 확인할 경도
 * @param {Object} bounds - 경계 {swLat, swLng, neLat, neLng}
 * @returns {boolean}
 */
export function isWithinBounds(lat, lng, bounds) {
  return (
    lat >= bounds.swLat &&
    lat <= bounds.neLat &&
    lng >= bounds.swLng &&
    lng <= bounds.neLng
  );
}

/**
 * 여러 좌표의 중심점 계산
 * @param {Array<{lat: number, lng: number}>} coordinates - 좌표 배열
 * @returns {{lat: number, lng: number}|null}
 */
export function getCenterPoint(coordinates) {
  if (!Array.isArray(coordinates) || coordinates.length === 0) {
    return null;
  }

  let totalLat = 0;
  let totalLng = 0;

  for (const coord of coordinates) {
    totalLat += coord.lat;
    totalLng += coord.lng;
  }

  return {
    lat: totalLat / coordinates.length,
    lng: totalLng / coordinates.length
  };
}

/**
 * 줌 레벨에 따른 적절한 검색 반경 계산 (미터)
 * @param {number} zoom - 줌 레벨
 * @returns {number} 검색 반경 (미터)
 */
export function getSearchRadiusByZoom(zoom) {
  // 줌 레벨이 높을수록 더 좁은 범위
  const baseRadius = 10000; // 10km
  return baseRadius / Math.pow(2, zoom - 10);
}

/**
 * 지도 경계를 쿼리 파라미터 객체로 변환
 * @param {Object} bounds - 경계 {swLat, swLng, neLat, neLng}
 * @returns {Object}
 */
export function boundsToQueryParams(bounds) {
  return {
    swLat: bounds.swLat,
    swLng: bounds.swLng,
    neLat: bounds.neLat,
    neLng: bounds.neLng
  };
}

/**
 * 주소를 좌표로 변환 (네이버 지오코딩 API 사용)
 * @param {string} address - 주소
 * @returns {Promise<{lat: number, lng: number}|null>}
 */
export async function geocodeAddress(address) {
  if (!address || typeof address !== 'string') {
    return null;
  }

  try {
    // 네이버 지오코딩 API 호출
    // 실제 구현은 서버 사이드에서 처리하거나 프록시를 통해 호출
    const response = await fetch(`/api/geocode?address=${encodeURIComponent(address)}`);
    if (!response.ok) {
      throw new Error('지오코딩 실패');
    }

    const data = await response.json();
    if (data.lat && data.lng) {
      return { lat: data.lat, lng: data.lng };
    }

    return null;
  } catch (error) {
    console.error('주소 변환 실패:', error);
    return null;
  }
}

/**
 * 좌표를 주소로 변환 (네이버 리버스 지오코딩 API 사용)
 * @param {number} lat - 위도
 * @param {number} lng - 경도
 * @returns {Promise<string|null>}
 */
export async function reverseGeocode(lat, lng) {
  if (!isValidCoordinate(lat, lng)) {
    return null;
  }

  try {
    // 네이버 리버스 지오코딩 API 호출
    const response = await fetch(`/api/reverse-geocode?lat=${lat}&lng=${lng}`);
    if (!response.ok) {
      throw new Error('리버스 지오코딩 실패');
    }

    const data = await response.json();
    return data.address || null;
  } catch (error) {
    console.error('좌표 변환 실패:', error);
    return null;
  }
}

/**
 * 지도 경계 확장
 * @param {Object} bounds - 원본 경계
 * @param {number} ratio - 확장 비율 (예: 0.1 = 10% 확장)
 * @returns {Object} 확장된 경계
 */
export function expandBounds(bounds, ratio = 0.1) {
  const latDiff = (bounds.neLat - bounds.swLat) * ratio;
  const lngDiff = (bounds.neLng - bounds.swLng) * ratio;

  return {
    swLat: bounds.swLat - latDiff,
    swLng: bounds.swLng - lngDiff,
    neLat: bounds.neLat + latDiff,
    neLng: bounds.neLng + lngDiff
  };
}

/**
 * 지도 줌 레벨 계산 (경계에 맞춤)
 * @param {Object} bounds - 경계
 * @param {number} mapWidth - 지도 너비 (픽셀)
 * @param {number} mapHeight - 지도 높이 (픽셀)
 * @returns {number} 적절한 줌 레벨
 */
export function calculateZoomLevel(bounds, mapWidth, mapHeight) {
  const latDiff = bounds.neLat - bounds.swLat;
  const lngDiff = bounds.neLng - bounds.swLng;

  // 간단한 줌 레벨 계산 (실제로는 더 복잡한 계산 필요)
  const latZoom = Math.log2(360 / latDiff);
  const lngZoom = Math.log2(360 / lngDiff);

  return Math.floor(Math.min(latZoom, lngZoom));
}

/**
 * 한국 범위 내 좌표인지 확인
 * @param {number} lat - 위도
 * @param {number} lng - 경도
 * @returns {boolean}
 */
export function isKoreaCoordinate(lat, lng) {
  // 대한민국 대략적인 경계
  const KOREA_BOUNDS = {
    swLat: 33.0,
    swLng: 124.5,
    neLat: 38.9,
    neLng: 132.0
  };

  return isWithinBounds(lat, lng, KOREA_BOUNDS);
}

/**
 * 지도 옵션 기본값 생성
 * @param {Object} customOptions - 사용자 정의 옵션
 * @returns {Object} 병합된 옵션
 */
export function createMapOptions(customOptions = {}) {
  const defaultOptions = {
    lat: 37.5665,
    lng: 126.9780,
    zoom: 13,
    zoomControl: false,
    mapTypeControl: false,
    scaleControl: false,
    logoControl: false,
    mapDataControl: false
  };

  return { ...defaultOptions, ...customOptions };
}
