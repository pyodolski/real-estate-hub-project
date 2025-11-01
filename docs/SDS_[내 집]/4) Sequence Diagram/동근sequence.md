# 시스템 시퀀스 다이어그램 통합 보고서 (26, 27, 28+29, 30, 34번)

## 26번: 지도 기반 매물 조회 및 상세 정보 확인

```mermaid
sequenceDiagram
    actor User as 사용자
    participant UI as 클라이언트
    participant Controller as MapController
    participant Service as PropertyMapService
    participant Repository as PropertyRepository
    participant MapAPI as Naver Map API
    participant DB as Database

    User->>UI: 지도 화면 진입
    UI->>Controller: GET /api/properties/map?bbox=...&filters=...
    
    Controller->>Controller: 로그인 토큰 검증
    alt 토큰 없음
        Controller-->>UI: 401 Unauthorized
        UI-->>User: 로그인 화면으로 이동
    else 토큰 유효
        Controller->>Service: getPropertiesInBbox(bbox, filters)
        
        Service->>Service: 뷰포트 좌표 분석 (BBOX: south, west, north, east)
        Service->>Service: 필터 조건 생성 (상태, 가격 범위 등)
        
        Service->>Repository: findByBboxAndFilters(bbox, filters)
        Repository->>DB: SELECT * FROM properties WHERE locationX BETWEEN ? AND ? AND locationY BETWEEN ? AND ? AND status = ? AND price BETWEEN ? AND ?
        DB-->>Repository: 매물 목록
        Repository-->>Service: List<Property>
        
        alt 매물 조회 성공
            Service->>Service: 매물 상태별 색상 지정 (AVAILABLE:파랑, PENDING:주황, SOLD:회색)
            Service->>Service: 매물 수에 따라 마커/클러스터 결정
            Service->>Service: 엔티티를 PropertyMapDto로 변환
            Service-->>Controller: 200 OK + 매물 목록
            
            Controller-->>UI: 200 OK
            UI->>MapAPI: initMap(locationX, locationY)
            MapAPI-->>UI: 지도 초기화 완료
            
            UI->>UI: 마커 추가 반복
            UI->>UI: 상태별 색상으로 마커 표시
            alt 매물 많음 (100개 이상)
                UI->>UI: 클러스터링 적용
            end
            UI-->>User: 지도에 매물 마커 표시
            
        else 매물 조회 실패
            Service->>Service: 캐시 사용 (폴백)
            Service-->>Controller: 200 OK + 캐시 매물
            UI-->>User: "동기화 실패" 메시지 + 캐시 데이터
        end
    end

    User->>UI: 지도 줌/팬 이벤트
    UI->>Controller: GET /api/properties/map?bbox=...&zoom=...
    
    Controller->>Service: getPropertiesInBbox(newBbox)
    
    alt 새로운 뷰포트 데이터 조회
        Service->>Repository: findByBboxAndFilters(newBbox)
        Repository->>DB: SELECT * FROM properties WHERE ... (새 범위)
        DB-->>Repository: 매물 목록 (새 범위)
        Repository-->>Service: List<Property>
        
        Service-->>Controller: 200 OK
        Controller-->>UI: 200 OK
        UI->>UI: 기존 마커 제거
        UI->>UI: 새로운 마커 추가
        UI-->>User: 지도 업데이트 (줌/팬 반영)
    end

    User->>UI: 지도 마커 클릭
    UI->>Controller: GET /api/properties/{propertyId}/details
    
    Controller->>Service: getPropertyDetail(propertyId)
    
    Service->>Repository: findById(propertyId)
    Repository->>DB: SELECT * FROM properties WHERE id = ?
    DB-->>Repository: 매물 정보
    Repository-->>Service: Property Entity
    
    alt 상세 조회 성공
        Service->>Service: 이미지, 오퍼 정보 포함
        Service->>Service: 엔티티를 PropertyDetailDto로 변환
        Service-->>Controller: 200 OK + PropertyDetailDto
        
        Controller-->>UI: 200 OK
        UI->>UI: 하단 시트/카드 열기
        UI->>UI: 매물 이미지, 제목, 주소, 가격, 면적 표시
        UI-->>User: 매물 상세 정보 표시
        
    else 조회 실패
        Service-->>Controller: 404 Not Found
        UI-->>User: "매물을 찾을 수 없습니다" 오류
    end

    User->>UI: 필터 적용 (상태, 가격, 구조 등)
    UI->>Controller: GET /api/properties/map?bbox=...&status=AVAILABLE&priceMin=...&priceMax=...
    
    Controller->>Service: getPropertiesInBbox(bbox, newFilters)
    
    Service->>Repository: findByBboxAndFilters(bbox, newFilters)
    Repository->>DB: SELECT * FROM properties WHERE ... (필터 조건)
    DB-->>Repository: 필터된 매물 목록
    Repository-->>Service: List<Property>
    
    Service-->>Controller: 200 OK
    Controller-->>UI: 200 OK
    UI->>UI: 기존 마커 제거
    UI->>UI: 필터된 마커 표시
    UI-->>User: "필터 적용됨" + 필터된 매물 표시

    alt 필터 적용 실패
        Service-->>Controller: 400 Bad Request
        UI-->>User: "필터 적용 실패, 재시도" 메시지
    end

    alt DB 또는 네트워크 오류
        DB-->>Repository: Exception
        Repository-->>Service: Exception
        Service-->>Controller: 500 Internal Server Error
        Controller-->>UI: 500
        UI-->>User: "오류 발생, 재시도 버튼"
    end
```

26번 기능 설명: 지도 기반 매물 조회 및 상세 정보 확인<br>
  * 이 다이어그램은 사용자가 지도 화면에 진입하여 특정 영역(BBOX) 내의 매물 목록을 조회하고, 지도 조작(줌/팬) 및 필터 적용을 통해 매물을 갱신하며, 특정 매물의 상세 정보를 확인하는 과정을 보여줍니다.

지도 화면 진입 및 초기 조회 

  * 요청: 클라이언트(UI)는 현재 지도의 영역(BBOX)과 필터 조건을 포함하여 GET /api/properties/map 요청을 MapController에 전송합니다.

  * 인증 및 위임: MapController는 로그인 토큰을 검증한 후, PropertyMapService에 매물 조회를 위임합니다.

  * DB 조회: Service는 BBOX와 필터 조건으로 **Database(DB)**에서 매물 목록을 조회합니다.

  * 표시 준비: 조회된 매물은 상태별 색상 지정을 거치며, 매물 수에 따라 마커/클러스터링 결정 과정을 거쳐 최종적으로 지도에 표시됩니다.

  * 폴백(Fallback): 초기 조회에 실패할 경우, 캐시 데이터가 대체 정보(폴백)로 사용되어 사용자에게 표시됩니다.

지도 조작 및 갱신 
  * 갱신 요청: 사용자가 지도를 줌(Zoom) 하거나 팬(Pan) 하여 새로운 BBOX가 생성되거나 필터 조건을 변경하면, UI는 새로운 조건을 포함한 GET 요청을 다시 전송합니다.

  * 재조회: DB는 새로운 범위/조건에 맞는 매물 목록을 재조회하여 UI에 반환합니다.

  * 마커 업데이트: UI는 기존 마커를 제거하고 새로운 마커를 추가하여 지도 화면을 갱신합니다.

매물 상세 확인 
  * 상세 요청: 사용자가 지도상의 특정 매물 마커를 클릭하면, UI는 GET /api/properties/{propertyId}/details 요청을 전송합니다.

  * 상세 조회: Service는 DB에서 해당 매물의 상세 정보(예: 이미지, 오퍼 정보 포함)를 조회합니다.

  * 표시: UI는 반환된 상세 정보를 하단 시트 또는 카드 형태로 열어 사용자에게 표시합니다.
    
* * *
* * *

## 27번: 사용자 지도 상태(위치/줌 레벨) 관리

```mermaid
sequenceDiagram
    actor User as 사용자
    participant UI as Frontend
    participant LocationManager as LocationManager
    participant Controller as PreferenceController
    participant Service as UserMapStateService
    participant UserRepo as UserRepository
    participant MapStateRepo as UserMapStateRepository
    participant DB as Database

    User->>UI: 지도 화면 진입
    
    alt 위치 권한이 미허용
        UI->>LocationManager: 위치 권한 요청 팝업 표시
        LocationManager-->>UI: 권한 요청 결과
        
        alt 사용자 승인
            UI->>LocationManager: 현재 위치 획득 요청
        else 사용자 거부
            UI->>UI: 기본 위치(시청)로 설정<br/>(lat: 37.5665, lng: 126.9780)
            UI->>UI: 지도 중심 이동
        end
    else 위치 권한이 허용
        UI->>LocationManager: 현재 GPS 좌표 획득
        LocationManager-->>UI: 현재 위치 반환<br/>(latitude, longitude)
    end
    
    alt GPS 신호 수신 성공
        UI->>UI: 사용자 위치 마커 표시
        UI->>UI: 지도 중심을 현재 위치로 이동
        UI->>UI: 확인 후 지도에 파란색 점 표시
    else GPS 신호 수신 실패
        UI->>Controller: GET /api/user/map-state
        
        Controller->>Controller: JWT 토큰 검증
        Controller->>Controller: 현재 userId 추출
        
        Controller->>Service: getMapState(userId)
        
        Service->>MapStateRepo: findById(userId)
        MapStateRepo->>DB: SELECT user_map_state WHERE user_id = ?
        DB-->>MapStateRepo: UserMapState
        MapStateRepo-->>Service: UserMapState
        
        alt 저장된 위치 정보 있음
            Service->>Service: 마지막 저장된 위치 추출<br/>(locationX, locationY)
            Service-->>Controller: 위치 데이터 반환
        else 저장된 위치 정보 없음
            Service->>Service: 기본 위치(시청) 설정<br/>(lat: 37.5665, lng: 126.9780)
            Service-->>Controller: 기본 위치 반환
        end
        
        Controller-->>UI: 200 OK<br/>{latitude, longitude}
        
        UI->>UI: 지도 중심을 반환된 위치로 이동
        UI->>UI: 마커 표시
    end
    
    User->>UI: "현재 위치" 버튼 클릭<br/>(선택 사항)
    
    UI->>LocationManager: 현재 GPS 좌표 재획득
    LocationManager-->>UI: 현재 위치
    
    UI->>UI: 지도 중심 다시 이동
    UI->>UI: 마커 업데이트
    
    UI->>UI: 지도 보기 상태 변경<br/>(팬, 줌 레벨 조정 등)
    
    UI->>Controller: PUT /api/user/map-state<br/>{locationX, locationY, zoomLevel}
    
    Controller->>Controller: JWT 토큰 검증
    Controller->>Controller: 현재 userId 추출
    
    Controller->>Service: updateMapState(userId, request)
    
    Service->>MapStateRepo: findById(userId)
    MapStateRepo->>DB: SELECT user_map_state WHERE user_id = ?
    DB-->>MapStateRepo: UserMapState
    MapStateRepo-->>Service: UserMapState
    
    alt UserMapState 존재
        Service->>Service: 위치 정보 업데이트<br/>(locationX, locationY, zoomLevel)
        Service->>Service: updatedAt 갱신<br/>(PreUpdate)
    else UserMapState 없음
        Service->>Service: 새로운 UserMapState 생성<br/>(userId, locationX, locationY, zoomLevel)
    end
    
    Service->>MapStateRepo: save(UserMapState)
    MapStateRepo->>DB: INSERT/UPDATE user_map_state
    DB-->>MapStateRepo: 저장 완료
    MapStateRepo-->>Service: UserMapState
    
    Service-->>Controller: 저장 완료 응답
    
    Controller-->>UI: 200 OK<br/>{locationX, locationY, zoomLevel, updatedAt}
    
    UI->>UI: 지도 상태 업데이트 완료
```

27번 기능 설명: 사용자 지도 상태(위치/줌 레벨) 관리<br>
  * 이 다이어그램은 사용자가 지도 화면에 진입할 때 현재 위치를 획득하거나 마지막으로 저장된 지도 상태를 불러와 화면을 초기화하고, 이후 지도 조작 시 변경된 상태를 저장하는 과정을 보여줍니다.

1. 초기 위치 설정 및 폴백
  * GPS 획득 시: 클라이언트(UI)는 먼저 위치 권한을 확인하고, 허용되면 LocationManager를 통해 현재 GPS 좌표를 획득하여 지도 중심을 해당 위치로 이동합니다.

  * 저장 상태 조회 (폴백): GPS 획득에 실패하거나 위치 권한이 거부된 경우, UI는 PreferenceController를 통해 UserMapStateService에 마지막으로 저장된 지도 위치를 요청합니다 (GET /api/user/map-state).

  * 기본값 설정: 저장된 정보가 없으면, Service는 **기본 위치(예: 시청)**를 설정하여 UI에 반환하고 지도를 초기화합니다.

2. 지도 상태 변경 및 저장
  * 상태 변경: 사용자가 지도를 팬(Pan) 하거나 줌 레벨을 조정하여 보기 상태를 변경합니다.

  * 상태 저장 요청: UI는 변경된 위치 좌표와 줌 레벨을 포함하여 PUT /api/user/map-state 요청을 Controller에 전송합니다.

  * DB 업데이트: Service는 UserMapStateRepository를 통해 DB에서 해당 사용자의 기존 상태를 찾아 업데이트하거나, 정보가 없을 경우 새로운 상태를 생성하여 저장합니다.

* * *
* * *
## 28번+29번: 매물 정보 표시/즐겨찾기(찜) 기능
```mermaid
sequenceDiagram
    actor User as 사용자
    participant UI as 클라이언트
    participant Controller as FavoriteController
    participant Service as FavoriteService
    participant FavoriteRepo as FavoriteRepository
    participant PropertyRepo as PropertyRepository
    participant DB as Database

    User->>UI: 즐겨찾기 탭 클릭
    UI->>Controller: GET /api/favorites
    
    Controller->>Controller: 로그인 토큰 검증
    alt 토큰 없음
        Controller-->>UI: 401 Unauthorized
        UI-->>User: 로그인 화면으로 이동
    else 토큰 유효
        Controller->>Service: getFavoritesByUserId(userId)
        
        Service->>FavoriteRepo: findByUserId(userId)
        FavoriteRepo->>DB: SELECT * FROM favorites WHERE user_id = ?
        DB-->>FavoriteRepo: 즐겨찾기 목록
        FavoriteRepo-->>Service: List<Favorite>
        
        alt 즐겨찾기 있음
            Service->>Service: 매물 좌표 추출
            Service->>Service: 엔티티를 FavoriteDto로 변환
            Service-->>Controller: 200 OK + 즐겨찾기 목록
            
            Controller-->>UI: 200 OK
            UI->>UI: 지도에 즐겨찾기 매물 표시 (하트 마크)
            UI-->>User: 즐겨찾기 매물 표시
            
        else 즐겨찾기 없음
            Service->>Service: 빈 목록 반환
            Service-->>Controller: 200 OK + 빈 목록
            UI-->>User: "즐겨찾기한 매물이 없습니다" 메시지
        end
    end

    User->>UI: 매물 카드의 하트 버튼 클릭 (즐겨찾기 추가)
    UI->>Controller: POST /api/favorites (propertyId)
    
    Controller->>Service: addFavorite(userId, propertyId)
    
    Service->>PropertyRepo: findById(propertyId)
    PropertyRepo->>DB: SELECT * FROM properties WHERE id = ?
    DB-->>PropertyRepo: 매물 정보
    PropertyRepo-->>Service: Property Entity
    
    alt 매물 없음
        Service-->>Controller: 404 Not Found
        UI-->>User: "매물을 찾을 수 없습니다" 오류
    else 매물 있음
        Service->>FavoriteRepo: checkIfExists(userId, propertyId)
        FavoriteRepo->>DB: SELECT * FROM favorites WHERE user_id = ? AND property_id = ?
        DB-->>FavoriteRepo: 중복 확인
        
        alt 이미 즐겨찾기됨
            Service-->>Controller: ConflictException
            UI-->>User: "이미 즐겨찾기된 매물입니다" 메시지
        else 미등록
            Service->>Service: Favorite 엔티티 생성
            Service->>FavoriteRepo: saveFavorite(favorite)
            FavoriteRepo->>DB: INSERT INTO favorites
            DB-->>FavoriteRepo: 저장 완료
            
            Service-->>Controller: 201 Created
            Controller-->>UI: 201 Created
            UI->>UI: 하트 버튼 색상 변경 (회색 → 빨강)
            UI-->>User: "즐겨찾기 추가됨" 메시지
        end
    end

    User->>UI: 빨간 하트 버튼 클릭 (즐겨찾기 제거)
    UI->>Controller: DELETE /api/favorites/{propertyId}
    
    Controller->>Service: removeFavorite(userId, propertyId)
    
    Service->>FavoriteRepo: deleteByUserIdAndPropertyId(userId, propertyId)
    FavoriteRepo->>DB: DELETE FROM favorites WHERE user_id = ? AND property_id = ?
    DB-->>FavoriteRepo: 삭제 완료
    
    alt 삭제 성공
        Service-->>Controller: 204 No Content
        Controller-->>UI: 204
        UI->>UI: 하트 버튼 색상 변경 (빨강 → 회색)
        UI-->>User: "즐겨찾기 제거됨" 메시지
    else 삭제 실패
        Service-->>Controller: 404 Not Found
        UI-->>User: "즐겨찾기를 찾을 수 없습니다" 오류
    end

    User->>UI: 즐겨찾기 매물 마커 클릭
    UI->>Controller: GET /api/properties/{propertyId}/details
    
    Controller->>Service: getPropertyDetail(propertyId)
    
    Service->>PropertyRepo: findById(propertyId)
    PropertyRepo->>DB: SELECT * FROM properties WHERE id = ?
    DB-->>PropertyRepo: 매물 상세정보
    PropertyRepo-->>Service: Property Entity
    
    Service->>Service: 즐겨찾기 상태 확인 (이미 좋아함)
    Service-->>Controller: 200 OK + PropertyDetailDto
    
    Controller-->>UI: 200 OK
    UI->>UI: 지도 중심을 해당 매물로 이동
    UI->>UI: 하단 패널/시트 열기
    UI->>UI: 매물 상세 정보 표시 (빨간 하트 표시)
    UI-->>User: 매물 상세 페이지 표시

    alt DB 또는 네트워크 오류
        DB-->>Service: Exception
        Service-->>Controller: 500 Internal Server Error
        Controller-->>UI: 500
        UI-->>User: "오류 발생, 재시도 버튼"
    end
```
28번+29번: 기능 설명: 매물 즐겨찾기(찜) 기능
  * 이 다이어그램은 사용자가 즐겨찾기 목록을 조회하고, 특정 매물을 즐겨찾기에 추가하거나 제거하는 핵심 과정을 보여줍니다.

1. 즐겨찾기 목록 조회 및 표시
  * 조회 요청: 로그인된 사용자가 즐겨찾기 탭 접근 시, UI는 GET /api/favorites 요청을 FavoriteController로 보냅니다.

  * DB 조회: FavoriteService는 FavoriteRepository를 통해 DB에서 해당 사용자의 즐겨찾기 목록을 조회합니다.

  * 결과 표시: 즐겨찾기 목록이 있으면 UI는 지도상에 해당 매물을 하트 마크 마커로 표시합니다. 목록이 없으면 "즐겨찾기한 매물이 없습니다" 메시지를 표시합니다.

2. 즐겨찾기 추가 및 제거
  * 추가 (POST): 사용자가 매물 카드에서 하트 버튼을 클릭하면 POST /api/favorites 요청이 발생합니다.

  * Service는 매물 존재 여부와 중복 등록 여부를 검사합니다.

  * 중복이 아니면 Favorite 엔티티를 생성하고 DB에 저장(201 Created)하며, UI는 하트 버튼 색상을 변경합니다.

  * 제거 (DELETE): 사용자가 이미 즐겨찾기된 하트 버튼을 다시 클릭하면 DELETE /api/favorites/{propertyId} 요청이 발생합니다.

  * Service는 DB에서 해당 레코드를 삭제하고(204 No Content), UI는 하트 버튼 색상을 원래대로 복원합니다.

3. 즐겨찾기 매물 상세 확인
  * 상세 확인: 즐겨찾기 매물 마커 클릭 시 일반 매물과 동일하게 상세 정보 조회가 이루어집니다.

  * 상태 반영: 이 과정에서 Service는 해당 매물의 즐겨찾기 상태를 확인하여, UI가 상세 페이지에 빨간 하트를 표시하도록 데이터를 전달합니다.

* * *
* * *
## 30번 : 상세 필터링 및 매물 마커 표시

```mermaid
sequenceDiagram
    actor User as 사용자
    participant UI as Frontend
    participant MapComponent as Map UI
    participant Controller as PropertyController
    participant Service as PropertyService
    participant PropertyRepo as PropertyRepository
    participant PropertyOfferRepo as PropertyOfferRepository
    participant DB as Database

    User->>UI: 지도 화면에서 필터 버튼 클릭
    
    UI->>MapComponent: 필터 패널 열기
    MapComponent->>User: 필터 옵션 표시<br/>(상태, 가격 범위, 위치 등)
    
    alt 위치 검색 필터 사용
        User->>UI: 위치 검색창에 주소 입력
        
        UI->>UI: 관련 위치 목록 표시<br/>(자동 완성)
        
        User->>UI: 특정 위치 클릭
        
        UI->>UI: 해당 위치 좌표로<br/>지도 중심 이동 (BBOX 생성)
    end
    
    User->>UI: 매물 상태 선택<br/>(AVAILABLE/PENDING/SOLD 등)
    
    User->>UI: 가격 범위 입력<br/>(최소가격, 최대가격)
    
    alt 추가 필터 조건 설정
        User->>UI: 다른 필터 옵션 선택<br/>(예: 건축년도, 면적 등)
    end
    
    User->>UI: "적용" 버튼 클릭
    
    UI->>UI: 필터 유효성 검증<br/>(가격 범위, 좌표 등)
    
    alt 필터 검증 실패
        UI->>User: 오류 메시지 표시
    else 필터 검증 성공
        UI->>MapComponent: 지도 BBOX 계산<br/>(minX, maxX, minY, maxY)
        
        UI->>Controller: GET /api/properties/in-bounds<br/>?minX={minX}&maxX={maxX}&minY={minY}&maxY={maxY}&status={status}&minPrice={minPrice}&maxPrice={maxPrice}
        
        Controller->>Controller: 요청 검증
        
        Controller->>Service: getPropertiesInBounds(filterDto)
        
        Service->>Service: 필터 정규화<br/>(normalize)
        
        Service->>PropertyRepo: 필터 조건으로 조회<br/>WHERE locationX BETWEEN ? AND ?<br/>AND locationY BETWEEN ? AND ?<br/>AND status = ?<br/>AND price BETWEEN ? AND ?
        
        PropertyRepo->>PropertyOfferRepo: 각 매물의 가격 정보 조회<br/>(PropertyOffer 활성 여부 확인)
        PropertyOfferRepo->>DB: SELECT offers WHERE property_id=?<br/>AND is_active=true
        DB-->>PropertyOfferRepo: 활성 오퍼 목록
        PropertyOfferRepo-->>PropertyRepo: 가격 정보 반환
        
        PropertyRepo->>DB: SELECT properties WHERE<br/>location_x IN [...], location_y IN [...],<br/>status = ?, price BETWEEN ?
        DB-->>PropertyRepo: 필터링된 매물 목록
        PropertyRepo-->>Service: List<Property>
        
        Service->>Service: PropertyMarkerDto 변환<br/>(propertyId, lat, lng, price, status)
        
        Service-->>Controller: List<PropertyMarkerDto>
        
        Controller-->>UI: 200 OK<br/>[마커 데이터 목록]
        
        UI->>MapComponent: 필터링된 매물<br/>마커로 표시
        
        UI->>MapComponent: 상태별 컬러 적용<br/>(AVAILABLE→초록, PENDING→노랑,<br/>SOLD→회색 등)
        
        UI->>MapComponent: 필터 적용 표시<br/>(필터 버튼 파란색 변경)
        
        alt 필터 적용 후 마커 클릭
            User->>MapComponent: 마커 클릭
            
            MapComponent->>Controller: GET /api/properties/{propertyId}
            
            Controller->>Service: getPropertyDetail(propertyId)
            Service-->>Controller: 매물 상세 정보
            Controller-->>UI: 200 OK<br/>{매물정보, 이미지, 오퍼 목록}
            
            UI->>User: 상세정보 패널 표시
        end
    end
    
    alt 필터 해제
        User->>UI: "필터 해제" 버튼 클릭<br/>(또는 "모두 보기")
        
        UI->>UI: 필터 조건 초기화
        
        UI->>Controller: GET /api/properties/in-bounds<br/>?minX={minX}&maxX={maxX}&minY={minY}&maxY={maxY}
        
        Controller->>Service: getPropertiesInBounds(noFilter)
        Service-->>Controller: 모든 매물 목록
        Controller-->>UI: 200 OK
        
        UI->>MapComponent: 필터링 없이 모든 매물 표시
        
        UI->>MapComponent: 필터 버튼 기본 색상으로 복원
    end
```
30번 기능 설명: 상세 필터링 및 매물 마커 표시
  * 이 다이어그램은 사용자가 상세 필터 패널을 통해 위치, 상태, 가격 범위 등 다양한 조건을 설정하고, 이 조건에 맞는 매물을 지도에 마커로 표시하며 갱신하는 과정을 보여줍니다.

1. 필터 설정 및 요청 준비
  * 필터 입력: 사용자가 필터 패널에서 위치 검색, 매물 상태, 가격 범위, 추가 조건 등을 설정합니다.

  * 유효성 검증: UI는 입력된 필터 조건의 유효성을 검증합니다.

  * 요청 전송: 필터 검증이 성공하면, UI는 현재 지도의 BBOX와 모든 상세 필터 조건을 포함한 GET /api/properties/in-bounds 요청을 PropertyController로 전송합니다.

2. 백엔드 필터링 및 데이터 처리
  * 필터 정규화: PropertyService는 전달된 필터 조건을 DB 쿼리에 맞게 정규화합니다.

  * DB 조회: PropertyRepository는 위치 좌표와 상태, 가격 범위 등 모든 필터 조건으로 DB에서 매물을 조회합니다.

  * 이때 PropertyOfferRepository를 통해 활성 오퍼 가격 정보가 필터링 조건에 사용될 수 있습니다.

  * 데이터 변환: Service는 필터링된 매물 목록을 지도 마커 표시에 필요한 최소 정보(PropertyMarkerDto)로 변환하여 Controller에 반환합니다.

3. 마커 표시 및 갱신
  * 마커 표시: UI는 반환된 마커 데이터를 지도 컴포넌트(MapComponent)에 전달합니다.

  * 컬러 적용: MapComponent는 매물 상태별(AVAILABLE, PENDING, SOLD 등)로 색상을 다르게 적용하여 마커를 표시합니다.

  * 필터 해제: 사용자가 "필터 해제" 버튼을 누르면, UI는 필터 조건을 초기화하고 현재 BBOX 내의 모든 매물 목록을 다시 조회하여 지도에 표시합니다.

* * *
* * *

## 34번: 인공지능 기반 매물 추천 기능

```mermaid
sequenceDiagram
    actor User as 사용자
    participant UI as 클라이언트
    participant Controller as RecommendationController
    participant Service as RecommendationService
    participant ViewRepository as PropertyViewRepository
    participant PreferenceRepository as PreferenceRepository
    participant PropertyRepository as PropertyRepository
    participant AIEngine as AIRecommendationEngine
    participant DB as Database

    User->>UI: 사이트 로그인/추천 매물 섹션 접근
    UI->>Controller: GET /api/recommendations
    
    Controller->>Controller: 로그인 토큰 검증
    alt 토큰 없음
        Controller-->>UI: 401 Unauthorized
        UI-->>User: 로그인 화면으로 이동
    else 토큰 유효
        Controller->>Service: getRecommendations(userId)
        
        Service->>ViewRepository: findViewsByUserId(userId, limit=20)
        ViewRepository->>DB: SELECT * FROM property_views WHERE user_id = ? ORDER BY viewed_at DESC LIMIT 20
        DB-->>ViewRepository: 열람 매물 목록
        ViewRepository-->>Service: List<PropertyView>
        
        alt 열람 매물 < 최소 기준 (5개)
            Service->>PreferenceRepository: findByUserId(userId)
            PreferenceRepository->>DB: SELECT * FROM user_preferences WHERE user_id = ?
            DB-->>PreferenceRepository: 사용자 선호도
            PreferenceRepository-->>Service: UserPreference
            
            alt 선호도 없음
                Service->>Service: "데이터 부족" 상태
                Service-->>Controller: 200 OK + emptyRecommendation
                UI-->>User: "추천 매물이 없습니다" 메시지
            else 선호도 있음
                Service->>Service: 선호도 기반 추천 계산
            end
        else 열람 매물 >= 5개
            Service->>Service: 열람 데이터 유효성 검증
            Service->>Service: 원-핫 인코딩/정규화 처리
            Service->>Service: 사용자 벡터 생성
            
            Service->>AIEngine: recommendProperties(userVector)
            
            AIEngine->>PropertyRepository: findAll()
            PropertyRepository->>DB: SELECT * FROM properties WHERE status = AVAILABLE
            DB-->>PropertyRepository: 전체 공개 매물
            PropertyRepository-->>AIEngine: List<Property>
            
            AIEngine->>AIEngine: 각 매물 벡터화
            AIEngine->>AIEngine: 유사도 계산 (코사인 유사도)
            AIEngine->>AIEngine: 유사도 순 정렬
            AIEngine->>AIEngine: 상위 10개 선택
            AIEngine-->>Service: List<RecommendedProperty> (유사도 포함)
            
            alt 추천 결과 있음
                Service->>Service: 엔티티를 RecommendationDto로 변환
                Service-->>Controller: 200 OK + RecommendationDto (10개)
                
                Controller-->>UI: 200 OK
                UI->>UI: 추천 매물 섹션 렌더링
                UI-->>User: 추천 매물 카드 표시 (유사도 바 포함)
            else 추천 결과 없음
                Service->>Service: 기본 인기 매물 반환 (폴백)
                Service-->>Controller: 200 OK + 인기 매물
                UI-->>User: 인기 매물 표시
            end
        end
    end

    User->>UI: 추천 매물 카드 클릭
    UI->>Controller: GET /api/properties/{propertyId}
    
    Controller->>Service: getPropertyDetail(propertyId)
    Service->>PropertyRepository: findById(propertyId)
    PropertyRepository->>DB: SELECT * FROM properties WHERE id = ?
    DB-->>PropertyRepository: 매물 정보
    PropertyRepository-->>Service: Property Entity
    
    alt 매물 있음
        Service->>ViewRepository: savePropertyView(userId, propertyId)
        ViewRepository->>DB: INSERT INTO property_views (user_id, property_id, viewed_at)
        DB-->>ViewRepository: 저장 완료
        
        Service-->>Controller: 200 OK + PropertyDetailDto
        Controller-->>UI: 200 OK
        UI->>UI: 매물 상세 페이지 이동
        UI-->>User: 매물 상세 표시
        
        par 백그라운드
            Service->>AIEngine: triggerRecommendationRecalc(userId)
            Note over AIEngine: 비동기로 추천 재계산<br/>(새로운 열람 데이터 반영)
        end
    else 매물 없음
        Service-->>Controller: 404 Not Found
        UI-->>User: "매물을 찾을 수 없습니다" 오류
    end

    alt DB 또는 네트워크 오류
        DB-->>Service: Exception
        Service->>Service: 폴백: 캐시된 추천 반환
        Service-->>Controller: 200 OK + 캐시 추천
        UI-->>User: "동기화 실패" 메시지 + 캐시 데이터
    end
```
34번 기능 설명: 인공지능 기반 매물 추천 기능
  * 이 다이어그램은 사용자의 과거 열람 이력을 바탕으로 AI 엔진을 사용하여 맞춤형 매물을 추천하고, 사용자가 추천 매물을 클릭하면 열람 이력을 저장하여 다음 추천에 반영하는 과정을 보여줍니다.

1. 추천 요청 및 데이터 수집
  * 추천 요청: 로그인 후 UI가 추천 매물 섹션에 접근하면 GET /api/recommendations 요청이 RecommendationController로 전송됩니다.

  * 열람 이력 조회: RecommendationService는 PropertyViewRepository를 통해 사용자의 최근 열람 매물(최대 20개) 이력을 조회합니다.

2. AI 추천 알고리즘 적용
  * 데이터 부족 처리: 열람 매물이 최소 기준(5개) 미만일 경우, PreferenceRepository를 통해 사용자 선호도 정보를 조회하여 추천하거나, 데이터 부족 메시지(폴백)를 반환합니다.

  * AI 기반 추천: 열람 매물이 충분하면, Service는 데이터를 바탕으로 사용자 벡터를 생성하여 AIRecommendationEngine에 전달합니다.

  * AI Engine은 전체 공개 매물 목록을 가져와 사용자 벡터와 **각 매물 벡터 간의 유사도(코사인 유사도)**를 계산합니다.

  * 유사도 순으로 정렬하여 상위 10개 매물을 추천 목록으로 반환합니다.

  * 결과 표시: UI는 반환된 추천 매물 목록을 유사도 바와 함께 표시합니다.

3. 열람 이력 저장 및 피드백 루프
  * 상세 페이지 진입: 사용자가 추천 매물을 클릭하여 상세 정보 요청(GET /api/properties/{propertyId})을 합니다.

  * 이력 저장: Service는 매물 상세 정보를 반환하기 직전, ViewRepository를 통해 해당 매물에 대한 새로운 열람 이력을 DB에 저장합니다.

  * 비동기 재계산: 열람 이력 저장 후, 백그라운드에서 AI Engine에 추천 재계산을 비동기로 트리거하여, 다음번 추천 요청 시 최신 열람 데이터를 반영하도록 합니다.
