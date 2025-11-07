<img width="546" height="2493" alt="image" src="https://github.com/user*attachments/assets/afaccc34*d6ee*4232*964a*b603a9254d75" />

 이 Use Case Diagram은 부동산 통합 플랫폼(Real Estate Hub System)의 주요 기능과 외부 액터 간 상호작용을 시각화한 것이다.
본 시스템은 일반 사용자(User), 매물 소유자(Owner), 브로커(Broker), 관리자(Admin), 시스템/엔진(System), 지도 서비스(Map Service)의 여섯 주체가 상호 연계되어 작동한다.
전체 기능은 회원 인증, 매물 등록 및 검증, 지도 기반 매물 탐색, 대리중개(위임), 채팅/알림, 가격 분석 및 추천 등으로 구성된다.

주요 액터 설명 <br>
User (사용자)	일반 이용자. 매물 검색, 필터 적용, 지도 탐색, 즐겨찾기, 채팅, 평점 등록 등의 기능을 수행한다. <br>
Owner (소유자)	자신의 부동산을 시스템에 등록하고, 서류 업로드 및 중개 위임 요청 등을 수행한다. <br>
Broker (브로커)	소유자로부터 받은 위임을 관리하고, 매물 거래를 중개하며 평가를 받는다. <br>
Admin (관리자)	시스템 전반의 데이터 검수, 매물 신청 검토, 승인·거절 처리 등을 담당한다. <br>
System / Engine (시스템/엔진)	자동 추천, 가격 예측, 이상거래 탐지 등 백엔드 AI 및 데이터 분석 모듈을 의미한다. <br>
Map Service (지도 서비스)	외부 지도 API (예: Naver Map, Kakao Map)로부터 위치, POI, 인구 통계 데이터를 제공한다. <br>


# Use case 1. 매물 등록 신청
**GENERAL CHARACTERISTICS**
* * *
**Summary**
* 사용자가 매물 소유권 증명을 위한 신청서를 상세정보와 필수 서류와 함께 제출하는 기능

**Scope**<br>
**Level**
* user level

**Author**<br>
**Last Update**<br>
**Status**
* Implemented

**Primary Actor**
* 로그인한 사용자 (일반 사용자)

**Preconditions**
* 사용자가 로그인되어 있어야 함 (JWT 토큰 보유)
* `/api/ownership/**` 엔드포인트는 인증된 사용자만 접근 가능

**Trigger**
* 사용자가 매물 소유권 신청 폼에서 "신청하기" 버튼을 클릭했을 때.

**Success Post Conditions**
* 매물 소유권 신청이 데이터베이스에 저장됨 (Status: PENDING)
* 업로드된 서류 파일들이 서버 저장소(`uploads/ownership/`)에 저장됨
* 고유한 파일명(타임스탬프 + UUID)으로 파일 저장
* 신청 ID가 포함된 응답 반환
* 관리자에게 검토 대기 상태로 전달됨

**Failure Post Conditions**
* 신청 데이터가 저장되지 않음
* 업로드된 파일들이 저장되지 않음
* 사용자에게 오류 메시지 반환

* * *
**MAIN SUCCESS SCENARIO**<br>
**Step** | **Action**<br>
**S** | 사용자가 매물 등록 신청 폼을 연다.<br>
**1** | 사용자가 신청자 정보를 입력한다 (이름, 연락처, 매물과의 관계).<br>
**2** | 사용자가 지도에서 주소를 검색하거나 좌표를 선택한다.<br>
**3** | 시스템이 지도 API를 통해 주소 정보를 조회한다 (`GET /api/ownership/map/address` 또는 `/api/ownership/map/coordinates`).<br>
**4** | 사용자가 건물명, 상세주소, 우편번호를 입력한다.<br>
**5** | 사용자가 소유권 증명 서류 파일을 업로드한다.<br>
**6** | 시스템이 파일 검증을 수행한다 (크기, 형식).<br>
**7** | 사용자가 "신청하기" 버튼을 클릭한다.<br>
**8** | 시스템이 JWT 토큰을 검증한다.<br>
**9** | 시스템이 중복 신청 여부를 체크한다.<br>
**10** | 시스템이 업로드 디렉토리를 생성한다 (존재하지 않는 경우).<br>
**11** | 시스템이 파일들을 서버 저장소에 저장한다 (고유 파일명: `yyyyMMdd_HHmmss_UUID.확장자`).<br>
**12** | 시스템이 문서 정보를 데이터베이스에 저장한다.<br>
**13** | 시스템이 신청 정보를 데이터베이스에 저장한다 (Status: PENDING).<br>
**14** | 시스템이 신청 ID를 포함한 응답을 반환한다.<br>
* * *
**EXTENSION SCENARIOS**<br>
**Step** | branching action<br>
**6**
* 6a. 파일이 비어있는 경우
    * 6a1. "빈 파일은 업로드할 수 없습니다" 오류 메시지를 출력한다.
* 6b. 파일 크기가 10MB를 초과하는 경우
    * 6b1. "파일 크기는 10MB를 초과할 수 없습니다" 오류 메시지를 출력한다.
* 6c. 지원하지 않는 파일 형식인 경우
    * 6c1. "지원하지 않는 파일 형식입니다. PDF, JPG, PNG, DOCX만 업로드 가능합니다" 오류 메시지를 출력한다.

**8**
* 8a. JWT 토큰이 유효하지 않은 경우
    * 8a1. 401 Unauthorized 응답을 반환한다.

**9**
* 9a. 같은 주소로 PENDING 상태 신청이 이미 존재하는 경우
    * 9a1. "같은 주소로 심사 중인 신청이 이미 존재합니다" 오류 메시지를 출력한다.
* 9b. 기존 매물에 대해 이미 신청한 경우
    * 9b1. "이미 해당 매물에 신청이 존재합니다" 오류 메시지를 출력한다.

**11**
* 11a. 파일 저장 실패 시
    * 11a1. "파일 저장에 실패했습니다" 오류 메시지를 출력한다.
* 11b. 파일 개수와 문서 타입 개수가 일치하지 않는 경우
    * 11b1. "파일 개수와 문서 타입 개수가 일치하지 않습니다" 오류 메시지를 출력한다.

**13**
* 13a. 사용자가 존재하지 않는 경우
    * 13a1. "사용자가 존재하지 않습니다" 오류 메시지를 출력한다.

**\***
* \*a. 기타 예외 발생 시
    * \*a1. "매물 등록 처리 중 오류가 발생했습니다" 오류 메시지를 출력한다.
****
* * *
**RELATED IMFORMATION**<br>
**Performance**
* ≤ 1 second (파일 업로드 제외)
* 파일 업로드 최대 크기: 10MB per file
* 파일 저장 위치: `uploads/ownership/` 디렉토리
* 파일명 생성 방식: `yyyyMMdd_HHmmss_UUID(8자).확장자`
* 허용 파일 형식: PDF, JPG, JPEG, PNG, DOCX, DOC

**Frequency**
* 사용자당 신청 빈도 제한 없음
* 중복 신청 방지 로직 존재

**Concurrency**
* 제한없음

**Due Date**<br>
* * *

# Use case 2. 매물 신청 현황 조회
**GENERAL CHARACTERISTICS**
* * *
**Summary**
* 사용자가 신청한 매물들의 상태를 확인한다.

**Scope**<br>
**Level**
* user level

**Author**<br>
**Last Update**<br>
**Status**
* Implemented

**Primary Actor**
* 로그인한 사용자 (일반 사용자)

**Preconditions**
* 사용자가 로그인되어 있어야 함 (JWT 토큰 보유)
* `/api/ownership/**` 엔드포인트는 인증된 사용자만 접근 가능

**Trigger**
* 사용자가 내 신청 내역 페이지에 접근하거나 특정 신청 상세를 조회할 때.

**Success Post Conditions**
* 사용자의 모든 신청 내역이 목록으로 표시됨
* 각 신청의 상태(심사중/승인됨/거절됨)가 표시됨
* 심사중인 경우 남은 일수가 표시됨 (마감일: 수정일 + 7일)
* 거절된 경우 거절 사유가 표시됨
* 첨부된 서류를 원본 파일명으로 다운로드 가능

**Failure Post Conditions**
* 신청 내역 조회 실패 시 오류 메시지 출력
* 권한이 없는 신청 접근 시 오류 메시지 출력

* * *
**MAIN SUCCESS SCENARIO**<br>
**Step** | **Action**<br>
**S** | 사용자가 내 신청 내역 페이지에 접근한다.<br>
**1** | 시스템이 JWT 토큰을 검증한다.<br>
**2** | 시스템이 현재 사용자 ID로 ownership_claims 테이블을 조회한다 (`GET /api/ownership/my*claims`).<br>
**3** | 시스템이 각 신청의 상태를 확인한다 (PENDING/APPROVED/REJECTED).<br>
**4** | 시스템이 신청 목록을 반환한다 (신청 ID, 주소, 상태, 신청일, 마감일 등).<br>
**5** | 사용자가 특정 신청을 클릭하여 상세 정보를 조회한다.<br>
**6** | 시스템이 해당 신청의 상세 정보를 조회한다 (`GET /api/ownership/claims/{claimId}`).<br>
**7** | 시스템이 신청자 정보, 매물 정보, 첨부 서류 목록을 반환한다.<br>
**8** | 상태가 'APPROVED'인 경우 '승인됨'으로 표시한다.<br>
**9** | 상태가 'PENDING'인 경우 '심사중'으로 표시하고 남은 일수를 계산하여 표시한다 (마감일 * 현재일).<br>
**10** | 상태가 'REJECTED'인 경우 '거절됨'으로 표시하고 거절 사유를 함께 표시한다.<br>
**11** | 사용자가 첨부 서류의 다운로드 버튼을 클릭한다.<br>
**12** | 시스템이 문서 정보를 조회한다 (`GET /api/ownership/documents/{documentId}/download`).<br>
**13** | 시스템이 파일 존재 여부와 읽기 가능 여부를 확인한다.<br>
**14** | 시스템이 원본 파일명으로 인코딩하여 파일을 다운로드한다.<br>
* * *
**EXTENSION SCENARIOS**<br>
**Step** | branching action<br>
**1**
* 1a. JWT 토큰이 유효하지 않은 경우
    * 1a1. 401 Unauthorized 응답을 반환한다.

**2**
* 2a. 신청 내역이 없는 경우
    * 2a1. 빈 목록을 반환한다.

**6**
* 6a. 신청을 찾을 수 없는 경우
    * 6a1. "신청을 찾을 수 없습니다" 오류 메시지를 출력한다.
* 6b. 다른 사용자의 신청에 접근하려는 경우
    * 6b1. "접근 권한이 없습니다" 오류 메시지를 출력한다.

**12**
* 12a. 문서를 찾을 수 없는 경우
    * 12a1. "문서를 찾을 수 없습니다" 오류 메시지를 출력한다.

**13**
* 13a. 파일이 존재하지 않거나 읽을 수 없는 경우
    * 13a1. "파일을 읽을 수 없습니다" 오류 메시지를 출력한다.

**14**
* 14a. 파일 경로가 잘못된 경우
    * 14a1. "파일 경로가 잘못되었습니다" 오류 메시지를 출력한다.
* 14b. 파일 다운로드 중 오류 발생
    * 14b1. "파일 다운로드 중 오류가 발생했습니다" 오류 메시지를 출력한다.
****
* * *
**RELATED IMFORMATION**<br>
**Performance**
* ≤ 1 second (목록 조회)
* ≤ 1 second (상세 조회)
* 파일 다운로드 시간은 파일 크기에 따라 다름
* 마감일 계산: 수정일(updated_at) + 7일
* 한글 파일명 인코딩 처리 (UTF*8)

**Frequency**
* 사용자가 내 신청 내역 페이지 접근 시마다
* 특정 신청 상세 조회 시마다
* 서류 다운로드 시마다

**Concurrency**
* 제한없음

**Due Date**<br>
* * *

# Use case 3. 매물 관리 현황 요약
**GENERAL CHARACTERISTICS**
* * *
**Summary**
* 전체 매물 관리 상황을 한눈에 파악할 수 있도록 요약 정보를 제공한다.

**Scope**<br>
**Level**
* user level

**Author**<br>
**Last Update**<br>
**Status**
* Implemented

**Primary Actor**
* 로그인한 사용자 (일반 사용자)

**Preconditions**
* 사용자가 로그인되어 있어야 함 (JWT 토큰 보유)
* `/api/ownership/**` 엔드포인트는 인증된 사용자만 접근 가능

**Trigger**
* 사용자가 매물 관리 대시보드 또는 내 신청 내역 페이지에 접근할 때.

**Success Post Conditions**
* 각 상태별(심사중/승인됨/거절됨) 매물 건수가 표시됨
* 매물 목록이 제목, 주소, 상태, 신청자 정보와 함께 표시됨
* 상태별로 색상과 라벨이 구분되어 직관적으로 확인 가능
* 매물이 없는 경우 안내 문구 표시

**Failure Post Conditions**
* 매물 목록 조회 실패 시 오류 메시지 출력

* * *
**MAIN SUCCESS SCENARIO**<br>
**Step** | **Action**<br>
**S** | 사용자가 매물 관리 대시보드에 접근한다.<br>
**1** | 시스템이 JWT 토큰을 검증한다.<br>
**2** | 시스템이 현재 사용자 ID로 ownership_claims 테이블을 조회한다 (`GET /api/ownership/my*claims`).<br>
**3** | 시스템이 조회된 신청 목록을 반환한다.<br>
**4** | 시스템이 각 신청의 상태(PENDING/APPROVED/REJECTED)를 확인한다.<br>
**5** | 시스템이 상태별 건수를 계산한다.<br>
**6** | 시스템이 심사중(PENDING) 건수를 표시한다.<br>
**7** | 시스템이 승인됨(APPROVED) 건수를 표시한다.<br>
**8** | 시스템이 거절됨(REJECTED) 건수를 표시한다.<br>
**9** | 시스템이 각 매물의 제목, 주소, 상태, 신청자 정보를 목록으로 표시한다.<br>
**10** | 시스템이 상태별로 색상과 라벨을 구분하여 표시한다 (PENDING: 노란색/주황색, APPROVED: 초록색, REJECTED: 빨간색).<br>
**11** | 사용자가 매물 목록을 확인한다.<br>
* * *
**EXTENSION SCENARIOS**<br>
**Step** | branching action<br>
**1**
* 1a. JWT 토큰이 유효하지 않은 경우
    * 1a1. 401 Unauthorized 응답을 반환한다.

**3**
* 3a. 신청 내역이 없는 경우 (빈 목록 반환)
    * 3a1. "현재 등록된 매물이 없습니다" 안내 문구를 표시한다.
    * 3a2. 상태별 건수를 모두 0으로 표시한다.

**2**
* 2a. 매물 목록 조회 실패
    * 2a1. 오류 메시지를 표시한다.
    * 2a2. 재시도 버튼을 제공한다.
****
* * *
**RELATED IMFORMATION**<br>
**Performance**
* ≤ 1 second (목록 조회 및 집계)
* 상태별 건수 계산은 클라이언트 측에서 수행

**Frequency**
* 매물 관리 대시보드 접근 시마다

**Concurrency**
* 제한없음

**Due Date**<br>
* * *

# Use case 4. 지도 위치 설정 기능
**GENERAL CHARACTERISTICS**
* * *
**Summary**
* 사용자가 지도를 통해 정확한 매물 위치를 설정하도록 한다.

**Scope**<br>
**Level**
* user level

**Author**<br>
**Last Update**<br>
**Status**
* Implemented

**Primary Actor**
* 로그인한 사용자 (일반 사용자)

**Preconditions**
* 사용자가 로그인되어 있어야 함 (JWT 토큰 보유)
* 매물 등록 신청 폼이 열려 있어야 함
* 지도 API 서비스가 정상 작동해야 함

**Trigger**
* 사용자가 매물 등록 신청 시 지도에서 위치를 선택하거나 주소를 입력할 때.

**Success Post Conditions**
* 선택한 위치의 좌표(latitude, longitude)가 저장됨
* 좌표에 해당하는 주소 정보가 자동으로 조회되어 표시됨
* 주소 필드에 도로명주소, 지번주소, 건물명, 우편번호가 자동 완성됨
* 매물 신청 시 위치 정보가 함께 저장됨

**Failure Post Conditions**
* 지도 API 호출 실패 시 오류 메시지 출력
* 위치 정보가 저장되지 않음

* * *
**MAIN SUCCESS SCENARIO**<br>
**Step** | **Action**<br>
**S** | 사용자가 매물 등록 신청 폼에서 지도를 연다.<br>
**1** | 시스템이 지도를 표시한다 (확대, 축소, 이동 가능).<br>
**2** | 사용자가 지도에서 원하는 위치를 클릭한다.<br>
**3** | 시스템이 클릭한 위치의 좌표(latitude, longitude)를 저장한다.<br>
**4** | 시스템이 해당 위치에 마커를 표시한다.<br>
**5** | 시스템이 좌표로 주소를 조회한다 (`GET /api/ownership/map/address?latitude={lat}&longitude={lng}`).<br>
**6** | 시스템이 Reverse Geocoding을 수행하여 주소 정보를 반환한다.<br>
**7** | 시스템이 도로명주소, 지번주소, 건물명, 우편번호를 주소 필드에 자동 완성한다.<br>
**8** | 사용자가 자동 완성된 주소 정보를 확인한다.<br>
**9** | 사용자가 필요시 상세주소를 추가 입력한다.<br>
**10** | 사용자가 신청하기 버튼을 클릭한다.<br>
**11** | 시스템이 위치 정보(propertyAddress, locationX, locationY, buildingName, postalCode)를 매물 신청과 함께 저장한다.<br>
* * *
**EXTENSION SCENARIOS**<br>
**Step** | branching action<br>
**2**
* 2a. 사용자가 주소를 직접 입력하는 경우
    * 2a1. 사용자가 주소 검색창에 주소를 입력한다.
    * 2a2. 시스템이 주소로 좌표를 조회한다 (`GET /api/ownership/map/coordinates?address={address}`).
    * 2a3. 시스템이 Geocoding을 수행하여 좌표를 반환한다.
    * 2a4. 시스템이 지도 중심을 해당 좌표로 이동한다.
    * 2a5. 시스템이 해당 위치에 마커를 표시한다.
    * 2a6. 시스템이 주소 필드를 자동 완성한다.

**3**
* 3a. 사용자가 마커를 드래그하여 위치를 변경하는 경우
    * 3a1. 시스템이 새로운 좌표를 저장한다.
    * 3a2. 시스템이 새로운 좌표로 주소를 재조회한다.
    * 3a3. 시스템이 주소 필드를 업데이트한다.

**5**
* 5a. 지도 API 호출 실패
    * 5a1. "주소 조회에 실패했습니다" 오류 메시지를 표시한다.
    * 5a2. 사용자가 주소를 수동으로 입력할 수 있도록 한다.

**6**
* 6a. 좌표에 해당하는 주소를 찾을 수 없는 경우
    * 6a1. 기본 주소 정보를 반환한다 (서울시청 기준).
    * 6a2. 사용자에게 주소를 수동으로 확인하도록 안내한다.

**\***
* \*a. 주변 건물 검색 기능 사용
    * \*a1. 사용자가 주변 건물 검색 버튼을 클릭한다.
    * \*a2. 시스템이 현재 위치 기준 반경 500m 내 건물을 조회한다 (`GET /api/ownership/map/nearby*buildings`).
    * \*a3. 시스템이 건물 목록을 표시한다 (건물명, 카테고리, 주소, 거리).
    * \*a4. 사용자가 건물을 선택하면 해당 위치로 이동한다.
****
* * *
**RELATED INFORMATION**<br>
**Performance**
* ≤ 1 second (지도 API 호출)
* Reverse Geocoding: 좌표 → 주소 변환
* Geocoding: 주소 → 좌표 변환
* 주변 건물 검색: 기본 반경 500m
* 현재 더미 데이터 사용 (네이버 API 구독 필요)

**Frequency**
* 매물 등록 신청 시마다
* 지도에서 위치 변경 시마다
* 주소 입력 시마다

**Concurrency**
* 제한없음
* 동시 API 호출 지원
* 지도 API 응답 시간에 따라 성능 변동 가능

**Due Date**<br>
* * *

# Use case 5. 소유권 증명 서류 업로드
**GENERAL CHARACTERISTICS**
* * *
**Summary**
* 다양한 종류의 소유권 증명 서류를 업로드 할 수 있다.

**Scope**<br>
**Level**
* user level

**Author**<br>
**Last Update**<br>
**Status**
* Implemented

**Primary Actor**
* 로그인한 사용자 (일반 사용자)

**Preconditions**
* 사용자가 로그인되어 있어야 함 (JWT 토큰 보유)
* 매물 등록 신청 폼이 열려 있어야 함

**Trigger**
* 사용자가 매물 등록 신청 시 서류 업로드 버튼을 클릭할 때.

**Success Post Conditions**
* 업로드된 파일이 서버 저장소에 저장됨 (`uploads/ownership/`)
* 파일 정보가 ownership_documents 테이블에 저장됨
* 원본 파일명, 저장 파일명, 파일 크기, 업로드 시간이 기록됨
* 관리자가 추후 확인 가능

**Failure Post Conditions**
* 파일 업로드 실패 시 오류 메시지 출력
* 파일이 저장되지 않음

* * *
**MAIN SUCCESS SCENARIO**<br>
**Step** | **Action**<br>
**S** | 사용자가 매물 등록 신청 폼에서 서류 업로드 섹션을 연다.<br>
**1** | 시스템이 서류 타입 목록을 조회한다 (`GET /api/ownership/document*types`).<br>
**2** | 시스템이 드롭다운에 서류 타입을 표시한다 (등기부등본, 신분증, 주민등록등본, 납세증명서, 기타).<br>
**3** | 사용자가 드롭다운에서 서류 타입을 선택한다.<br>
**4** | 사용자가 파일 선택 버튼을 클릭하여 파일을 선택한다.<br>
**5** | 시스템이 파일 형식을 검증한다 (PDF, JPG, PNG, DOCX, DOC).<br>
**6** | 시스템이 파일 크기를 검증한다 (10MB 이하).<br>
**7** | 사용자가 추가 서류를 업로드하기 위해 "서류 추가" 버튼을 클릭한다.<br>
**8** | 시스템이 새로운 서류 입력 필드를 추가한다.<br>
**9** | 사용자가 여러 개의 서류를 선택한다.<br>
**10** | 사용자가 신청하기 버튼을 클릭한다.<br>
**11** | 시스템이 파일 개수와 문서 타입 개수가 일치하는지 확인한다.<br>
**12** | 시스템이 각 파일을 서버 저장소에 저장한다 (고유 파일명: `yyyyMMdd_HHmmss_UUID.확장자`).<br>
**13** | 시스템이 각 파일 정보를 ownership_documents 테이블에 저장한다.<br>
**14** | 시스템이 원본 파일명, 저장 파일명, 파일 경로, 파일 크기, 콘텐츠 타입, 업로드 시간을 기록한다.<br>
**15** | 시스템이 신청 완료 메시지를 표시한다.<br>
* * *
**EXTENSION SCENARIOS**<br>
**Step** | branching action<br>
**5**
* 5a. 지원하지 않는 파일 형식인 경우
    * 5a1. "지원하지 않는 파일 형식입니다. PDF, JPG, PNG, DOCX만 업로드 가능합니다" 오류 메시지를 출력한다.
    * 5a2. 파일 선택을 취소한다.

**6**
* 6a. 파일 크기가 10MB를 초과하는 경우
    * 6a1. "파일 크기는 10MB를 초과할 수 없습니다" 오류 메시지를 출력한다.
    * 6a2. 파일 선택을 취소한다.
* 6b. 빈 파일을 업로드하는 경우
    * 6b1. "빈 파일은 업로드할 수 없습니다" 오류 메시지를 출력한다.

**11**
* 11a. 파일 개수와 문서 타입 개수가 일치하지 않는 경우
    * 11a1. "파일 개수와 문서 타입 개수가 일치하지 않습니다" 오류 메시지를 출력한다.
    * 11a2. 사용자에게 서류 타입을 다시 선택하도록 안내한다.

**12**
* 12a. 파일 저장 실패
    * 12a1. "파일 저장에 실패했습니다" 오류 메시지를 출력한다.
    * 12a2. 업로드를 중단한다.
* 12b. 업로드 디렉토리가 존재하지 않는 경우
    * 12b1. 시스템이 자동으로 디렉토리를 생성한다 (`uploads/ownership/`).
    * 12b2. 파일 저장을 계속 진행한다.
****
* * *
**RELATED IMFORMATION**<br>
**Performance**
* ≤ 1 second (파일 검증)
* 파일 업로드 시간은 파일 크기에 따라 다름
* 최대 파일 크기: 10MB per file
* 허용 파일 형식: PDF, JPG, JPEG, PNG, DOCX, DOC
* 파일명 생성 방식: `yyyyMMdd_HHmmss_UUID(8자).확장자`

**Frequency**
* 매물 등록 신청 시마다
* 매물 수정 시마다

**Concurrency**
* 제한없음
* 동시 업로드 지원
* 파일명 충돌 방지: 타임스탬프 + UUID 조합

**Due Date**<br>
* * *

# Use case 6. 심사 중 매물 신청 수정
**GENERAL CHARACTERISTICS**
* * *
**Summary**
* 사용자가 심사중인 매물 신청 정보를 수정할 수 있다.

**Scope**<br>
**Level**
* user level

**Author**<br>
**Last Update**<br>
**Status**
* Implemented

**Primary Actor**
* 로그인한 사용자 (일반 사용자)

**Preconditions**
* 사용자가 로그인되어 있어야 함 (JWT 토큰 보유)
* 수정하려는 신청이 존재해야 함
* 신청 상태가 PENDING(심사중)이어야 함

**Trigger**
* 사용자가 심사중인 신청의 수정 버튼을 클릭할 때.

**Success Post Conditions**
* 신청 정보가 수정됨
* 수정된 정보가 데이터베이스에 저장됨
* 감사 로그에 수정 이력이 기록됨
* updatedAt 필드가 현재 시간으로 갱신됨

**Failure Post Conditions**
* 신청 정보가 수정되지 않음
* 오류 메시지 출력

* * *
**MAIN SUCCESS SCENARIO**<br>
**Step** | **Action**<br>
**S** | 사용자가 내 신청 내역에서 심사중인 신청을 선택한다.<br>
**1** | 시스템이 신청 상태를 확인한다 (PENDING 여부).<br>
**2** | 시스템이 수정 버튼을 활성화한다.<br>
**3** | 사용자가 수정 버튼을 클릭한다.<br>
**4** | 시스템이 기존 신청 정보를 수정 폼에 표시한다.<br>
**5** | 사용자가 필요한 항목을 변경한다 (신청자 정보, 주소, 위치, 첨부 서류 등).<br>
**6** | 사용자가 수정 완료 버튼을 클릭한다.<br>
**7** | 시스템이 JWT 토큰을 검증한다.<br>
**8** | 시스템이 신청을 조회한다 (`PUT /api/ownership/claims/{claimId}`).<br>
**9** | 시스템이 수정 권한을 확인한다 (본인의 신청인지).<br>
**10** | 시스템이 신청 상태를 확인한다 (PENDING 상태인지).<br>
**11** | 시스템이 기본 정보를 업데이트한다 (이름, 연락처, 매물과의 관계, 추가 정보).<br>
**12** | 시스템이 위치 정보를 업데이트한다 (주소, 좌표, 건물명, 상세주소, 우편번호).<br>
**13** | 새로운 파일이 업로드된 경우 기존 문서를 삭제하고 새 문서를 저장한다.<br>
**14** | 시스템이 updatedAt 필드를 현재 시간으로 갱신한다 (PreUpdate).<br>
**15** | 시스템이 감사 로그를 생성한다 (UPDATE_CLAIM 액션).<br>
**16** | 시스템이 수정된 신청 정보를 반환한다.<br>
* * *
**EXTENSION SCENARIOS**<br>
**Step** | branching action<br>
**1**
* 1a. 신청 상태가 APPROVED(승인됨)인 경우
    * 1a1. 수정 버튼을 비활성화한다.
    * 1a2. "승인된 신청은 수정할 수 없습니다" 안내 메시지를 표시한다.
* 1b. 신청 상태가 REJECTED(거절됨)인 경우
    * 1b1. 수정 버튼을 비활성화한다.
    * 1b2. "거절된 신청은 수정할 수 없습니다" 안내 메시지를 표시한다.

**7**
* 7a. JWT 토큰이 유효하지 않은 경우
    * 7a1. 401 Unauthorized 응답을 반환한다.

**8**
* 8a. 신청을 찾을 수 없는 경우
    * 8a1. "신청을 찾을 수 없습니다" 오류 메시지를 출력한다.

**9**
* 9a. 다른 사용자의 신청을 수정하려는 경우
    * 9a1. "수정 권한이 없습니다" 오류 메시지를 출력한다.

**10**
* 10a. 신청 상태가 PENDING이 아닌 경우
    * 10a1. "심사중인 신청만 수정할 수 있습니다" 오류 메시지를 출력한다.

**13**
* 13a. 파일 업로드 실패
    * 13a1. 파일 저장 오류 메시지를 출력한다.
    * 13a2. 기존 정보는 유지된다.
****
* * *
**RELATED INFORMATION**<br>
**Performance**
* ≤ 1 second (파일 업로드 제외)
* 파일 업로드 시간은 파일 크기에 따라 다름
* 기존 문서 삭제 후 새 문서 업로드
* 감사 로그 자동 생성

**Frequency**
* 사용자가 신청 수정 시마다
* PENDING 상태인 신청만 수정 가능

**Concurrency**
* 제한없음
* 트랜잭션 관리로 데이터 일관성 보장
* PreUpdate로 updatedAt 자동 갱신

**Due Date**<br>
* * *

# Use case 7. 관리자 매물 신청 검토 및 처리
**GENERAL CHARACTERISTICS**
* * *
**Summary**
* 관리자가 신청을 검토하고 승인 또는 거절한다.

**Scope**<br>
**Level**
* user level

**Author**<br>
**Last Update**<br>
**Status**
* Implemented

**Primary Actor**
* 관리자 (Admin)

**Preconditions**
* 관리자 권한으로 로그인되어 있어야 함
* 검토할 신청이 존재해야 함

**Trigger**
* 관리자가 신청 목록에 접근하거나 특정 신청을 검토할 때.

**Success Post Conditions**
* 신청 상태가 APPROVED 또는 REJECTED로 변경됨
* 승인 시 Property 엔티티가 자동 생성됨
* 거절 시 거절 사유가 저장됨
* 검토 시간(reviewedAt)이 기록됨
* 감사 로그에 검토 이력이 기록됨
* 사용자에게 알림이 전송됨

**Failure Post Conditions**
* 신청 상태가 변경되지 않음
* 오류 메시지 출력

* * *
**MAIN SUCCESS SCENARIO**<br>
**Step** | **Action**<br>
**S** | 관리자가 관리자 페이지에 접근한다.<br>
**1** | 시스템이 관리자 권한을 확인한다 (role = "admin").<br>
**2** | 시스템이 모든 신청 내역을 조회한다 (`GET /api/ownership/admin/claims`).<br>
**3** | 시스템이 신청 목록을 리스트 형태로 표시한다 (신청자, 주소, 상태, 신청일 등).<br>
**4** | 관리자가 특정 신청을 선택한다.<br>
**5** | 시스템이 신청 상세 정보를 조회한다 (`GET /api/ownership/admin/claims/{claimId}`).<br>
**6** | 시스템이 신청자 정보, 매물 정보, 첨부 서류 목록을 표시한다.<br>
**7** | 관리자가 첨부 서류를 확인한다 (다운로드 가능).<br>
**8** | 관리자가 승인 또는 거절을 결정한다.<br>
**9** | 관리자가 승인 버튼을 클릭한다.<br>
**10** | 시스템이 신청 상태를 APPROVED로 변경한다 (`POST /api/ownership/admin/claims/{claimId}/approve`).<br>
**11** | 시스템이 검토자(admin)와 검토 시간(reviewedAt)을 기록한다.<br>
**12** | 시스템이 Property 엔티티를 자동 생성한다.<br>
**13** | 시스템이 매물 제목을 자동 생성한다 (건물명 또는 주소 기반, 중복 방지).<br>
**14** | 시스템이 Property 정보를 저장한다 (제목, 주소, 상태=AVAILABLE, 등록유형=OWNER, 소유자, 좌표).<br>
**15** | 시스템이 신청과 Property를 연결한다 (역참조 설정).<br>
**16** | 시스템이 감사 로그를 생성한다 (APPROVE_CLAIM 액션, 신청자/주소 정보 포함).<br>
**17** | 시스템이 사용자에게 승인 알림을 전송한다 (제목: "매물 승인 완료", 메시지: 주소 포함).<br>
**18** | 시스템이 승인 완료 메시지를 표시한다.<br>
* * *
**EXTENSION SCENARIOS**<br>
**Step** | branching action<br>
**1**
* 1a. 관리자 권한이 없는 경우
    * 1a1. "관리자 권한이 필요합니다" 오류 메시지를 출력한다.
    * 1a2. 403 Forbidden 응답을 반환한다.

**5**
* 5a. 신청을 찾을 수 없는 경우
    * 5a1. "신청을 찾을 수 없습니다" 오류 메시지를 출력한다.

**9**
* 9a. 관리자가 거절 버튼을 클릭하는 경우
    * 9a1. 시스템이 거절 사유 입력 창을 표시한다.
    * 9a2. 관리자가 거절 사유를 입력한다.
    * 9a3. 시스템이 신청 상태를 REJECTED로 변경한다 (`POST /api/ownership/admin/claims/{claimId}/reject`).
    * 9a4. 시스템이 거절 사유(rejectionReason)를 저장한다.
    * 9a5. 시스템이 검토자(admin)와 검토 시간(reviewedAt)을 기록한다.
    * 9a6. 시스템이 감사 로그를 생성한다 (REJECT_CLAIM 액션, 거절 사유 포함).
    * 9a7. 시스템이 사용자에게 거절 알림을 전송한다 (제목: "매물 신청 거절", 메시지: 거절 사유 포함).
    * 9a8. 시스템이 거절 완료 메시지를 표시한다.

**10**
* 10a. 관리자를 찾을 수 없는 경우
    * 10a1. "관리자를 찾을 수 없습니다" 오류 메시지를 출력한다.

**12**
* 12a. 이미 Property가 연결되어 있는 경우
    * 12a1. Property 생성을 건너뛴다.

**13**
* 13a. 매물 제목 중복 발생
    * 13a1. 제목 뒤에 번호를 추가한다 (예: "강남역 (1)", "강남역 (2)").
    * 13a2. 중복이 없을 때까지 번호를 증가시킨다.
****
* * *
**RELATED INFORMATION**<br>
**Performance**
* ≤ 1 second (목록 조회)
* ≤ 1 second (상세 조회)
* ≤ 2 seconds (승인/거절 처리)
* Property 자동 생성 포함
* 감사 로그 및 알림 자동 생성

**Frequency**
* 관리자가 신청 검토 시마다
* 승인/거절 처리 시마다

**Concurrency**
* 제한없음
* 트랜잭션 관리로 데이터 일관성 보장
* 감사 로그로 모든 검토 이력 추적 가능
* 알림 시스템으로 사용자에게 실시간 전달

**Due Date**<br>
* * *

# Use case 8. 매물 자동 생성
**GENERAL CHARACTERISTICS**
* * *
**Summary**
* 승인된 신청 정보를 기반으로 매물을 자동 생성한다.

**Scope**<br>
**Level**
* system level

**Author**<br>
**Last Update**<br>
**Status**
* Implemented

**Primary Actor**
* 시스템 (관리자 승인 시 자동 실행)

**Preconditions**
* 매물 신청이 존재해야 함
* 관리자가 신청을 승인해야 함
* 신청 상태가 APPROVED로 변경되어야 함

**Trigger**
* 관리자가 신청 승인 버튼을 클릭하여 승인 처리가 완료될 때.

**Success Post Conditions**
* Property 엔티티가 데이터베이스에 생성됨
* 신청(OwnershipClaim)과 매물(Property)이 서로 참조됨 (양방향 관계)
* 매물 제목이 중복되지 않도록 자동 생성됨
* 매물과 사용자(소유자) 간 관계가 매핑됨
* 지도 좌표가 Property 엔티티에 저장됨
* 매물 상태가 AVAILABLE로 설정됨

**Failure Post Conditions**
* Property 엔티티가 생성되지 않음
* 신청과 매물 간 참조 관계가 설정되지 않음

* * *
**MAIN SUCCESS SCENARIO**<br>
**Step** | **Action**<br>
**S** | 관리자가 신청 승인 처리를 완료한다.<br>
**1** | 시스템이 createPropertyFromClaim 메서드를 호출한다.<br>
**2** | 시스템이 이미 Property가 연결되어 있는지 확인한다.<br>
**3** | 시스템이 매물 제목을 자동 생성한다 (generatePropertyTitle 메서드 호출).<br>
**4** | 시스템이 건물명이 있는지 확인한다.<br>
**5** | 건물명이 있으면 건물명을 제목으로 사용한다.<br>
**6** | 건물명이 없으면 주소에서 동/구 정보를 추출하여 제목을 생성한다.<br>
**7** | 상세주소가 있으면 제목에 추가한다.<br>
**8** | 시스템이 제목 중복 여부를 확인한다 (propertyRepository.existsByTitle).<br>
**9** | 중복이 있으면 제목 뒤에 번호를 추가한다 (예: "강남역 (1)", "강남역 (2)").<br>
**10** | 중복이 없을 때까지 번호를 증가시킨다.<br>
**11** | 시스템이 Property 엔티티를 생성한다.<br>
**12** | 시스템이 제목(title)을 설정한다.<br>
**13** | 시스템이 주소(address)를 설정한다 (신청의 propertyAddress 또는 "주소 정보 없음").<br>
**14** | 시스템이 상태(status)를 AVAILABLE로 설정한다.<br>
**15** | 시스템이 등록 유형(listingType)을 OWNER로 설정한다.<br>
**16** | 시스템이 소유자(owner)를 신청자로 설정한다.<br>
**17** | 시스템이 신청(claim)을 연결한다.<br>
**18** | 시스템이 좌표(locationX, locationY)를 설정한다.<br>
**19** | 시스템이 이상치 여부(anomalyAlert)를 false로 설정한다.<br>
**20** | 시스템이 Property를 데이터베이스에 저장한다.<br>
**21** | 시스템이 신청(claim)에 Property를 역참조로 설정한다.<br>
**22** | 시스템이 신청을 데이터베이스에 저장한다 (양방향 관계 완성).<br>
* * *
**EXTENSION SCENARIOS**<br>
**Step** | branching action<br>
**2**
* 2a. 이미 Property가 연결되어 있는 경우
    * 2a1. Property 생성을 건너뛴다.
    * 2a2. 메서드를 종료한다.

**4**
* 4a. 건물명이 없는 경우
    * 4a1. 주소 정보를 확인한다.
    * 4a2. 주소를 공백으로 분리한다.
    * 4a3. 마지막 두 부분을 제목으로 사용한다 (동/구 정보).

**6**
* 6a. 주소도 없는 경우
    * 6a1. "매물"을 기본 제목으로 사용한다.

**8**
* 8a. 제목이 중복되는 경우
    * 8a1. 제목 뒤에 " (1)"을 추가한다.
    * 8a2. 여전히 중복이면 번호를 증가시킨다 " (2)", " (3)" 등.
    * 8a3. 중복이 없을 때까지 반복한다.

**13**
* 13a. 주소 정보가 없는 경우
    * 13a1. "주소 정보 없음"을 기본값으로 설정한다.
****
* * *
**RELATED INFORMATION**<br>
**Performance**
* ≤ 1 second
* 제목 중복 체크를 위한 데이터베이스 조회
* 중복 시 반복 조회 (일반적으로 1*2회)

**Frequency**
* 신청 승인 시마다 자동 실행
* 승인 프로세스의 일부로 실행

**Concurrency**
* 제한없음
* 트랜잭션 내에서 실행되어 데이터 일관성 보장
* 제목 중복 체크로 동시성 문제 방지

**Due Date**<br>
* * *

# Use case 9. 채팅방 접속 및 생성
**GENERAL CHARACTERISTICS**
* * *
**Summary**
* 사용자가 매물 상세 페이지에서 채팅방에 접속하거나, 없을 경우 새로운 채팅방을 생성한다.

**Scope**<br>
**Level**
* user level

**Author**


**Last Update**<br>
**Status**
* Analysis

**Primary Actor**
* 로그인한 사용자

**Preconditions**
* 로그인이 되어 있어야 한다

**Trigger**
* 채팅 버튼을 누른다

**Success Post Conditions**
* 기존 채팅방이 존재하면 입장하고, 없을 경우 새로운 채팅방이 생성된다.
* 채팅방에는 참여자 정보와 생성 시각이 기록된다.

**Failed Post Conditions**
* 채팅방 생성 또는 접속에 실패하면 오류 메시지가 출력된다.

* * *
**MAIN SUCCESS SCENARIO**<br>
**Step** | **Action**<br>
**S** | 사용자가 매물 상세 화면에서 ‘대화하기’ 버튼을 클릭한다.<br>
**1** | 시스템이 사용자의 로그인 상태와 토큰을 확인한다.<br>
**2** | 시스템이 매물 ID와 사용자 정보를 기반으로 기존 채팅방 존재 여부를 조회한다.<br>
**3** | 기존 채팅방이 있으면 해당 방으로 입장한다.<br>
**4** | 채팅방이 없으면 새로운 채팅방을 생성한다.<br>
**5** | 채팅방 생성 시 참여자 정보(판매자–구매자–중개인)와 생성 시각을 기록한다.<br>
**6** | 채팅방 화면으로 전환되어 메시지 목록을 불러온다.<br>
* * *
**EXTENSION SCENARIOS**<br>
**Step** | branching action<br>
**1**
* 1a. 로그인을 하지 않은 상태이다.
    * 1a1. 로그인하지 않은 상태에서 버튼을 누르면 오류 메시지를 띄우고 로그인 화면으로 이동한다.

**2**
* 2a. 채팅방이 존재한다
    * 2a1. 기존 채팅방이 존재하면 새로 생성하지 않고 해당 방으로 이동한다.

**3**
* 3a. 동일 매물 및 참여자 조합이 존재한다
    * 3a1. 동일 매물 및 동일 참여자 조합의 채팅방이 이미 존재하면 오류 메시지를 표시한다.
* 3b. 서버 오류나 네트워크 오류가 발생한다.
    * 3b1. 서버 오류나 네트워크 실패 시 재시도 버튼과 오류 안내를 표시한다.
****
* * *
**RELATED IMFORMATION**<br>
**Performance**
* ≤ 2 seconds (채팅방 생성 또는 입장까지)

**Frequency**
* 사용자가 매물 상세 화면에서 채팅 기능을 사용할 때마다

**Concurrency**
* 동일 매물에 대해 여러 사용자가 동시에 시도할 수 있으나, 시스템은 중복 채팅방 생성을 방지한다.

**Due Date**<br>
* * *

# Use case 10. 메시지 송수신
**GENERAL CHARACTERISTICS**
* * *
**Summary**
* 사용자가 채팅방에서 텍스트 메시지를 주고받을 수 있다.

**Scope**<br>
**Level**
* user level

**Author**


**Last Update**<br>
**Status**
* Analysis

**Primary Actor**
* 로그인한 사용자

**Preconditions**
* 로그인 상태이며, 유효한 채팅방(room_id)에 입장한 상태여야 한다.

**Trigger**
* 사용자가 채팅 입력창에 메시지를 작성하고 전송 버튼을 누른다.

**Success Post Conditions**
* 메시지가 Supabase 데이터베이스의 chat_message 테이블에 저장된다.
* 주기적 조회(또는 실시간 구독) 로직을 통해 새로운 메시지가 화면에 표시된다.
* 각 메시지에는 발신자, 발신 시각, 읽음 여부가 함께 기록된다.

**Failed Post Conditions**
* 메시지가 비어 있거나 DB 쓰기 실패 시 전송되지 않으며 오류 메시지가 표시된다.

* * *
**MAIN SUCCESS SCENARIO**<br>
**Step** | **Action**<br>
**S** | 사용자가 채팅 입력창에 메시지를 작성한다.<br>
**1** | 시스템이 입력된 메시지가 비어 있지 않은지 검증한다.<br>
**2** | 사용자가 전송 버튼을 누르면, 시스템이 chat_message 테이블에 메시지를 INSERT 요청한다.<br>
**3** | Supabase를 통해 메시지 데이터(방 ID, 작성자, 내용, 작성시각)를 저장한다.<br>
**4** | DB에 저장 성공 시 시스템이 로컬 메시지 목록에 즉시 반영한다.<br>
* * *
**EXTENSION SCENARIOS**<br>
**Step** | branching action<br>

**2**
* 2a. 네트워크 또는 DB 연결 오류 발생
    * 2a1. 시스템이 오류를 감지하고 “전송 실패” 안내를 표시한다.
    * 2a2. 재시도 버튼을 통해 INSERT 요청을 다시 시도할 수 있다.

**3**
* 3a. DB 삽입은 성공했으나 SELECT 주기보다 빠르게 UI가 갱신되지 않는다.
    * 3a1. 다음 조회 주기 시 최신 메시지가 동기화된다.

**4**
* 4a. 다른 사용자가 메시지를 보냈을 경우
    * 4a1. 시스템이 주기적 SELECT 시 해당 메시지를 감지하고 대화 목록에 추가한다.
****
* * *
**RELATED IMFORMATION**<br>
**Performance**
* ≤ 2 seconds (DB 쓰기 및 주기적 읽기 포함 반영까지)

**Frequency**
* 채팅 세션 중 메시지 입력 시마다 발생

**Concurrency**
* 다수의 사용자가 동시에 메시지를 저장할 수 있으며, DB는 created_at 기준으로 순서가 보장된다.

**Due Date**<br>
* * *

# Use case 11. 기존 내역 불러오기
**GENERAL CHARACTERISTICS**
* * *
**Summary**
* 사용자가 채팅방에 재접속했을 때 과거 메시지를 불러와 확인할 수 있다.

**Scope**<br>
**Level**
* user level

**Author**


**Last Update**<br>
**Status**
* Analysis

**Primary Actor**
* 로그인한 사용자

**Preconditions**
* 로그인 상태이며, 유효한 채팅방(room_id)에 입장한 상태여야 한다.
* chat_message 테이블에 해당 채팅방의 메시지 데이터가 존재해야 한다.

**Trigger**
* 사용자가 채팅방에 재입장하거나 스크롤을 올려 과거 메시지를 요청한다.

**Success Post Conditions**
* 최근 메시지부터 일정 개수의 메시지가 화면에 표시된다.
* 사용자가 스크롤 또는 추가 요청 시, 더 오래된 메시지가 순차적으로 로드된다.

**Failed Post Conditions**
* 네트워크 또는 DB 조회 오류로 인해 메시지를 불러오지 못하면 오류 안내가 표시된다.

* * *
**MAIN SUCCESS SCENARIO**<br>
**Step** | **Action**<br>
**S** | 사용자가 채팅 입력창에 메시지를 작성한다.<br>
**1** | 시스템이 chat_message 테이블에서 해당 room_id의 최신 N개 메시지를 조회한다.<br>
**2** | 조회된 메시지를 created_at 기준 오름차순으로 정렬한다.<br>
**3** | 정렬된 메시지를 화면에 표시한다.<br>
**4** | 사용자가 상단으로 스크롤하거나 “이전 메시지 보기”를 요청하면, 시스템이 더 오래된 메시지를 추가 조회한다.<br>
**5** | 새로 불러온 메시지는 기존 목록의 앞쪽에 병합되어 시간순으로 표시된다.<br>
* * *
**EXTENSION SCENARIOS**<br>
**Step** | branching action<br>
**1**
* 1a. 네트워크 또는 DB 연결 오류 발생
    * 1a1. 시스템이 오류를 감지하고 “전송 실패” 안내를 표시한다.
    * 1a2. 재시도 버튼을 제공한다.

**2**
* 2a. 더 이상 과거 메시지가 없음
    * 2a1. “더 이상 불러올 메시지가 없습니다.” 안내 문구를 표시한다.

**3**
* 3a. 다른 사용자가 메시지를 보냈을 경우
    * 3a1. 시스템이 주기적 SELECT 시 해당 메시지를 감지하고 대화 목록에 추가한다.
****
* * *
**RELATED IMFORMATION**<br>
**Performance**
* ≤ 1 seconds

**Frequency**
* 채팅방 입장 시 1회 자동 호출 + 사용자 요청 시 추가 호출

**Concurrency**
* 여러 사용자가 동시에 조회하더라도 읽기 전용 쿼리이므로 DB 락 없음.
* 메시지는 created_at 및 message_id 기준으로 정렬 일관성 유지.

**Due Date**<br>
* * *

# Use case 12. 읽음 처리
**GENERAL CHARACTERISTICS**
* * *
**Summary**
* 사용자가 읽은 메시지를 표시하고, 상대방도 이를 확인할 수 있다.

**Scope**<br>
**Level**
* user level

**Author**


**Last Update**<br>
**Status**
* Analysis

**Primary Actor**
* 로그인한 사용자

**Preconditions**
* 로그인 상태이며, 유효한 채팅방(room_id)에 입장한 상태여야 한다.
* chat_message 테이블에 해당 채팅방의 메시지 데이터가 존재해야 한다.

**Trigger**
* 사용자가 채팅방에서 메시지를 열람하거나 “모두 읽음”을 실행한다.

**Success Post Conditions**
* 열람한 메시지가 읽음 상태로 표시된다.
* 상대방(들)도 해당 메시지의 읽음 여부를 확인할 수 있다.
* 채팅방 목록/알림에서 미확인 메시지 개수가 갱신된다.

**Failed Post Conditions**
* 읽음 상태 갱신 실패 시 UI에 실패 안내가 표시되고, 다음 동기화 시 재시도한다.

* * *
**MAIN SUCCESS SCENARIO**<br>
**Step** | **Action**<br>
**S** | 사용자가 채팅방 화면을 연다(또는 특정 메시지까지 스크롤한다).<br>
**1** | 시스템이 사용자가 화면에서 확인한 마지막 메시지 ID를 계산한다(뷰포트 내 최하단 확인 기준 등).<br>
**2** | 시스템이 chat_message에 읽음 플래그를 업데이트한다.
**3** | 시스템이 현재 사용자의 미확인 메시지 수를 0 또는 감소치로 갱신한다.<br>
**4** | 상대방이 이후 조회할 때, 읽음 상태가 반영된 메시지 메타데이터를 수신한다.<br>
**5** | 사용자가 “모두 읽음” 실행 시, 현재 시점 기준 최신 메시지까지 일괄 업데이트한다.<br>
* * *
**EXTENSION SCENARIOS**<br>
**Step** | branching action<br>
**1**
* 1a. 네트워크 또는 DB 연결 오류 발생
    * 1a1. 로컬에 마지막 읽음 포인터를 보관하고, 연결 복구 시 재전송한다.

**2**
* 2a. 중복/과거 포인터 보고
    * 2a1. 서버는 더 큰(더 최신) 포인터만 수용한다(id/created_at 비교).

**3**
* 3a. 다중 기기 동시 사용
    * 3a1. 3a1. 가장 최신 포인터로 서버 상태를 정규화하고 클라이언트에 브로드캐스트한다(주기 조회 반영).
****
* * *
**RELATED IMFORMATION**<br>
**Performance**
* ≤ 500ms

**Frequency**
* 화면 진입/스크롤 시 수시 발생, “모두 읽음”은 사용자 액션 시 발생

**Concurrency**
* 동일 사용자의 다중 세션 동시 갱신 가능 — 서버는 단조 증가 규칙으로 정합성 보장

**Due Date**<br>
* * *

# Use case 13. 재접속 시 이어보기
**GENERAL CHARACTERISTICS**
* * *
**Summary**
* 사용자가 채팅방에 다시 들어왔을 때 마지막으로 본 지점 이후의 메시지만 확인할 수 있다.

**Scope**<br>
**Level**
* user level

**Author**<br>


**Last Update**<br>
**Status**
* Analysis

**Primary Actor**
* 로그인한 사용자

**Preconditions**
* 로그인 상태이며, 유효한 채팅방(room_id)에 입장한 상태여야 한다.
* 사용자별 마지막 읽음 플래그가 서버에 저장되어 있어야 한다.

**Trigger**
* 사용자가 채팅방에 재입장한다.

**Success Post Conditions**
* 마지막으로 읽은 메시지 이후의 새로운 메시지만 우선 표시된다.
* 불필요한 과거 내역 재조회 없이 효율적으로 대화를 이어볼 수 있다.

**Failed Post Conditions**
* 마지막 읽음 포인터 조회 실패 시 기본(최근 N개) 로딩으로 대체하고 안내 메시지를 표시한다.

* * *
**MAIN SUCCESS SCENARIO**<br>
**Step** | **Action**<br>
**S** | 사용자가 채팅방에 재입장한다.<br>
**1** | 시스템이 서버에서 사용자별 last_read_message_id(또는 last_read_at)를 조회한다.<br>
**2** | 시스템이 해당 지점 이후의 메시지를 우선 SELECT 하여 리스트에 표시한다(최신 정렬).<br>
**3** | 필요 시 사용자는 과거 메시지를 추가 요청하여 스크롤로 불러올 수 있다.<br>
**4** | 표시 완료 후, 화면 노출 범위까지 자동으로 읽음 포인터를 갱신한다.<br>
* * *
**EXTENSION SCENARIOS**<br>
**Step** | branching action<br>
**1**
* 1a. 포인터가 존재하지 않음(최초 입장)
    * 1a1. 최근 N개(예: 50개) 메시지를 기본으로 로드한다.
**2**
* 2a. 다중 기기에서 포인터가 서로 다름
    * 2a1. 서버 포인터를 단일 진실 소스로 사용하고 클라이언트는 이를 수용한다.

**3**
* 3a. 네트워크/DB 오류
    * 3a1. 최근 N개 로딩으로 폴백하고, 재시도 버튼 제공.
****
* * *
**RELATED IMFORMATION**<br>
**Performance**
* ≤ 1 seconds

**Frequency**
* 채팅방 재입장 시마다 1회 + 추가 과거 조회 시 반복

**Concurrency**
* 읽기 위주 시나리오로 DB 락 이슈 없음. 포인터 갱신은 단조 증가로 경쟁 상태 방지.

**Due Date**<br>

* * *

# Use case 14. 회원가입
**GENERAL CHARACTERISTICS**
* * *
**Summary**
* 사용자는 이메일, 비밀번호, 역할 등을 입력하여 계정을 생성한다.

**Scope**<br>
**Level**
* user level

**Author**<br>
**Last Update**<br>
**Status**
* Analysis

**Primary Actor**
* 로그인한 사용자

**Preconditions**<br>
**Trigger**
* 로그인 화면에서 회원가입 버튼을 누를 때.

**Success Post Conditions**
* 로그인 페이지로 이동한다.
* 사용자는 로그인을 할 수 있다.

**Failed Post Conditions**
* 사용자는 로그인을 할 수 있다.
* 사용자는 시스템을 이용할 수 없다.

* * *
**MAIN SUCCESS SCENARIO**<br>
**Step** | **Action**<br>
**S** | 사용자는 회원가입을 한다.<br>
**1** | 이 Use case는 사용자가 회원가입 할때 시작된다.<br>
**2** | 사용자는 사용자 유형으로 regular, broker, admin 중에 선택한다.<br>
**3** | 사용자는 이메일, 사용자명, 비밀번호를 필수로 기입한다.<br>
**4** | 사용자는 회원 가입 시 최대 30개의 중복 불가인 태그 등록이 가능하고 없는 태그는 DB에서 자동 생성된다.<br>
**5** | 회원가입 완료시 사용자가 입력한 사용자/중개사 프로필(broker일 경우)/태그를 저장한다.<br>
**6** | 이 Use case는 회원가입이 성공하면 끝난다.<br>
* * *
**EXTENSION SCENARIOS**<br>
**Step** | branching action<br>
**2**
* 2a. broker 선택 시 licenseNumber를 필수로 기입하고 agencyName은 선택적으로 기입한다. 시스템은 이를 확인한다.

**3**
* 3a. 시스템은 이메일, 사용자명, 비밀번호(8~64자)의 입력값을 검증한다.
    * 3a1. 시스템은 이미 등록된 이메일의 경우 사용자에게 오류 메세지를 보여준다.
****
* * *
**RELATED IMFORMATION**<br>
**Performance**
* < 3sec

**Frequency**
* 사용자당 최초 1번

**Concurrency**
* 제한 없음

**Due Date**<br>
* * *

# Use case 15. 로그인 / 토큰 관리
**GENERAL CHARACTERISTICS**
* * *
**Summary**
* 사용자가 시스템의 기능을 이용하기 위해 로그인을 하고 시스템은 이를 토큰 관리를 통해 유지 및 차단하는 기능.

**Scope**<br>
**Level**
* user level

**Author**<br>
**Last Update**<br>
**Status**
* Analysis

**Primary Actor**
* 로그인한 사용자

**Preconditions**
* 회원가입이 이미 완료된 상태여야 한다.

**Trigger**
* 사용자가 로그인 페이지에서 이메일과 비밀번호를 입력한 후 로그인 버튼을 누를 때.

**Success Post Conditions**
* 사용자는 시스템의 기능들을 사용 가능하다

**Failed Post Conditions**
* 다시 로그인을 시도한다.

* * *
**MAIN SUCCESS SCENARIO**<br>
**Step** | **Action**<br>
**S** | 사용자는 로그인 한다<br>
**1** | 이 Use case는 회원이 이메일/비밀번호를 입력하고 로그인을 요청할때 시작된다.<br>
**2** | 시스템은 이메일과 비밀번호를 검증한다<br>
**3** | 시스템은 로그인 성공시 AccessToken(JWT)와 RefreshToken을 발급한다.<br>
**4** | 시스템은 RefreshToken 만료일을 14일과 30일 중에 결정한다.<br>
**5** | 시스템은 사용자의 역할에 따라 분기된 메인 페이지를 보여준다.<br>
**6** | AccessToken 만료시 사용자는 RefreshToken을 이용해 새로운 AccessToken 재발급 받는다.<br>
* * *
**EXTENSION SCENARIOS**<br>
**Step** | branching action<br>
**2**
* 2a. 이메일이나 비밀번호가 잘못되어 로그인에 실패한다.
    * 2a1. 로그인 실패시 에러 메세지를 보여준다.
    * 2a2. 이메일과 비밀번호를 다시 입력 받는다.

**6**
* 6a. 만료/폐기된 RefreshToken을 사용할때 AccessToken재발급이 불가능하다.
    * 6a1. 토큰이 만료 되었다는 오류 메세지를 보여준다.
    * 6a2. 로그인 페이지로 이동하여 새로 로그인 하도록 한다.
****
* * *
**RELATED IMFORMATION**<br>
**Performance**
* < 4sec

**Frequency**<br>
**Concurrency**<br>
**Due Date**<br>
* * *


# Use case 16. 로그아웃
**GENERAL CHARACTERISTICS**
* * *
**Summary**
* 사용자가 로그아웃을 요청하는 기능.

**Scope**<br>
**Level**
* user level

**Author**<br>
**Last Update**<br>
**Status**
* Analysis

**Primary Actor**
* 로그인한 사용자

**Preconditions**
* 사용자는 로그인 상태여야 한다.
* 시스템에 토큰이 저장되어 있어야 한다.

**Trigger**
* 사용자가 로그아웃 버튼을 눌렀을 때.

**Success Post Conditions**
* 로그인 페이지로 이동한다.
* 시스템에서 토큰을 삭제한다.

**Failed Post Conditions**
* 현 페이지 그대로 유지된다.

* * *
**MAIN SUCCESS SCENARIO**<br>
**Step** | **Action**<br>
**S** | 사용자가 로그아웃을 요청한다.<br>
**1** | 이 Use case는 사용자가 로그아웃 버튼을 눌러 로그아웃을 요청 할 때 시작된다.<br>
**2** | 시스템은 RefreshToken을 revoked 처리하여 무효화한다.<br>
**3** | 브라우저 쿠키와 LocalStorage/SessionStorage의 토큰을 삭제한다.<br>
**4** | 사용자는 로그아웃 완료 후 재인증 없이는 API요청이 불가능하다.<br>
* * *
**EXTENSION SCENARIOS**<br>
**Step** | branching action<br>
**2**
* 2a. Token이 이미 만료/폐기 되었을 경우
    * 2a1. 이미 처리된 것으로 간주해서 3번 step으로 이동한다.
****
* * *
**RELATED IMFORMATION**<br>
**Performance**
* < 3sec

**Frequency**<br>
**Concurrency**<br>
**Due Date**<br>
* * *

# Use case 17. 비밀번호 재설정
**GENERAL CHARACTERISTICS**
* * *
**Summary**
* 사용자가 비밀번호 분실 시 재설정 하는 기능.

**Scope**<br>
**Level**
* user level

**Author**<br>
**Last Update**<br>
**Status**
* Analysis

**Primary Actor**
* 로그인한 사용자

**Preconditions**
* 회원가입이 완료된 상태여야 한다.

**Trigger**
* 로그인 페이지에서 비밀번호 찾기를 누를 때.

**Success Post Conditions**
* 로그인 페이지로 이동되며 재설정된 비밀번호로 로그인이 가능하다.

**Failed Post Conditions**
* 로그인 페이지로 이동되며 다시 비밀번호 재설정을 시도해야 한다.

* * *
**MAIN SUCCESS SCENARIO**<br>
**Step** | **Action**<br>
**S** | 사용자는 비밀번호를 재설정 한다.<br>
**1** | 사용자가 요청 시 PasswordResetToken을 발급한다. 이는 1시간동안 유효하고 만료 시 재사용이 불가능하다.<br>
**2** | 비밀번호 재설정 링크가 담긴 이메일을 사용자에게 발송한다.<br>
**3** | 사용자는 메일 링크를 클릭하여 비밀번호 재설정 화면으로 이동한다.<br>
**4** | 사용자는 새 비밀번호를 입력한다.<br>
**5** | 시스템은 토큰 유효성 검증 후 비밀번호 유효성을 검증한다.<br>
**6** | 완료 후 로그인 페이지로 이동한다.<br>
* * *
**EXTENSION SCENARIOS**<br>
**Step** | branching action<br>
**5**
* 5a. 토큰이 유효하지 않거나 비밀번호가 8~64자가 아니거나 기존과 동일한 경우
    * 5a1. 오류 메세지를 보여준다.
****
* * *
**RELATED IMFORMATION**<br>
**Performance**<br>
**Frequency**<br>
**Concurrency**<br>
**Due Date**<br>
* * *

# Use case 18. 사용자 프로필 관리
**GENERAL CHARACTERISTICS**
* * *
**Summary**
* 사용자가 자신의 프로필 정보를 조회하고 수정하는 기능.

**Scope**<br>
**Level**
* user level

**Author**<br>
**Last Update**<br>
**Status**
* Analysis

**Primary Actor**
* 로그인한 사용자

**Preconditions**
* 회원 가입 시에 프로필 정보를 입력한 상태여야 한다

**Trigger**
* 프로필 버튼을 눌러 프로필 패널을 띄울 때.

**Success Post Conditions**
* 프로필 패널에 사용자 프로필 정보가 나타난다.

**Failed Post Conditions**
* 프로필 패널이 열리지 않는다.
* 프로필 패널에 사용자 프로필 정보가 나타나지 않는다.

* * *
**MAIN SUCCESS SCENARIO**<br>
**Step** | **Action**<br>
**S** | 사용자가 프로필 패널을 열어 프로필 정보를 조회한다.<br>
**1** | 이 Use case는 사용자가 프로필 조회 및 수정을 할 때 시작된다.<br>
**2** | 사용자는 프로필 버튼을 눌러 프로필 패널을 연다.<br>
**3** | 프로필 패널에서 이메일, 닉네임, 역할, 전화번호, 소개글, 사진, 태그를 조회한다.<br>
* * *
**EXTENSION SCENARIOS**<br>
**Step** | branching action<br>
**3**
* 3a. broker계정인 경우
    * 3a1. licenseNumber, agencyName, intro, profileImageUrl을 같이 포함한다.
* 3b. 프로필 수정 버튼을 누른 경우
    * 3b1. 사용자는 현재 비밀번호를 입력해야 한다.
    * 3b2. 프로필 태그, 사진, 비밀번호, 프로필 소개문을 수정 가능하다.
    * 3b3. 시스템은 사용자가 태그 수정시 전체 삭제 후 재등록한다.(최대 30개, 중복불가, 없으면 DB를 생성한다)
    * 3b4. 비밀번호 변경 시에는 기존 비밀번호 검증 및 동일 여부를 확인한다.
    * 3b5. 시스템은 비밀번호 변경 성공시 새로운 해시로 저장한다.
****
* * *
**RELATED IMFORMATION**<br>
**Performance**
* 5<sec

**Frequency**<br>
**Concurrency**<br>
**Due Dat



# Use case 19. 매물 목록 조회 (전체)
**GENERAL CHARACTERISTICS**
* * *
**Summary**
* 사용자가 등록된 매물을 전체 목록으로 확인한다.

**Scope**<br>
**Level**
* user level

**Author**<br>


**Last Update**<br>
**Status**
* Analysis

**Primary Actor**
* 로그인한 사용자

**Preconditions**
* 사용자는 로그인 상태여야 한다.

**Trigger**
* 사용자가 “전체 매물 보기” 메뉴를 선택한다.

**Success Post Conditions**
* 전체 매물 목록이 페이지 단위로 표시된다.
* 기본 정렬은 최신순이며, 상태·유형·가격·지역 기준으로 필터링이 가능하다.

**Failed Post Conditions**
* 서버 또는 네트워크 오류로 조회 실패 시 오류 메시지가 표시된다.

* * *
**MAIN SUCCESS SCENARIO**<br>
**Step** | **Action**<br>
**S** | 사용자가 “전체 매물 보기” 메뉴를 선택한다.<br>
**1** | 시스템이 로그인 토큰을 확인한다.<br>
**2** | 시스템이 property 테이블에서 매물 목록을 페이지 단위로 조회한다.<br>
**3** | 결과를 최신순으로 정렬하여 화면에 표시한다.<br>
**4** | 사용자가 필터(상태, 유형, 가격, 지역 등)를 지정하면 시스템이 조건에 맞게 재조회한다.<br>
* * *
**EXTENSION SCENARIOS**<br>
**Step** | branching action<br>
**1**
* 1a. 로그인 상태가 아님
    * 1a1. 시스템이 로그인 화면으로 이동시키고 인증 후 재시도하도록 안내한다.
      
**2**
* 2a. 네트워크 또는 DB 오류
    * 2a1. “목록을 불러올 수 없습니다.” 메시지를 표시하고 재시도 버튼을 제공한다.

**3**
* 3a. 필터 조건에 해당하는 매물이 없음
    * 3a1. “조건에 맞는 매물이 없습니다.” 안내 문구를 표시한다.
****
* * *
**RELATED IMFORMATION**<br>
**Performance**
* ≤ 1.5 seconds

**Frequency**
* 사용자 탐색 시마다 발생

**Concurrency**
* 다수의 사용자가 동시에 조회 가능

**Due Date**<br>
* * *

# Use case 20. 내 매물 관리
**GENERAL CHARACTERISTICS**
* * *
**Summary**
* 사용자가 본인이 등록한 매물을 따로 확인하고 관리한다.

**Scope**<br>
**Level**
* user level

**Author**<br>


**Last Update**<br>
**Status**
* Analysis

**Primary Actor**
* 로그인한 소유자 또는 중개인 사용자

**Preconditions**
* 로그인 상태이며, 사용자 ID와 매물의 등록자 ID가 일치해야 한다.

**Trigger**
* 사용자가 “내 매물” 메뉴를 선택한다.

**Success Post Conditions**
* 본인 등록 매물 목록이 표시된다.
* 매물 상태 변경 또는 정보 수정이 가능하다.

**Failed Post Conditions**
* 서버 오류 또는 권한 불일치 시 수정/조회 실패.

* * *
**MAIN SUCCESS SCENARIO**<br>
**Step** | **Action**<br>
**S** | 사용자가 “내 매물” 메뉴를 연다.<br>
**1** | 시스템이 로그인 사용자의 user_id를 확인한다.<br>
**2** | 시스템이 property 테이블에서 owner_id = user_id 조건으로 매물 목록을 조회한다.<br>
**3** | 조회 결과를 화면에 표시하고, 필터와 정렬 기능을 동일하게 제공한다.<br>
**4** | 사용자가 매물 상태 변경 또는 수정 요청 시 시스템이 해당 항목을 업데이트한다.<br>
**5** | 성공 시 “저장되었습니다.” 안내 메시지를 표시한다.<br>
* * *
**EXTENSION SCENARIOS**<br>
**Step** | branching action<br>
**1**
* 1a. 로그인 상태가 아님
    * 1a1. 로그인 페이지로 이동 후 인증 완료 시 메뉴 재로드한다.

**2**
* 2a. 네트워크 또는 DB 오류
    * 2a1. “내 매물을 불러올 수 없습니다.” 안내 후 재시도 제공한다.

**4**
* 4a. 매물 수정 중 권한 불일치
    * 4a1. “수정 권한이 없습니다.” 안내 표시한다.
****
* * *
**RELATED IMFORMATION**<br>
**Performance**
* ≤ 1.5 seconds

**Frequency**
* 사용자가 자신의 매물을 확인할 때마다

**Concurrency**
* 동일 사용자의 다중 요청 발생 가능

**Due Date**<br>
* * *

# Use case 21. 상의 매물 조회
**GENERAL CHARACTERISTICS**
* * *
**Summary**
* 사용자가 다른 소유자가 등록한 매물만 확인한다.

**Scope**<br>
**Level**
* user level

**Author**<br>


**Last Update**<br>
**Status**
* Analysis

**Primary Actor**
* 로그인한 소유자 또는 중개인 사용자

**Preconditions**
* 로그인 상태이며, property.owner_id ≠ user_id 조건이 적용되어야 한다.

**Trigger**
* 사용자가 “다른 소유자 매물 보기” 메뉴를 선택한다.

**Success Post Conditions**
* 자신이 등록하지 않은 매물 목록이 표시된다.
* 매물의 기본 정보와 거래 조건을 열람할 수 있다.

**Failed Post Conditions**
* 조회 실패 시 오류 메시지가 표시된다.

* * *
**MAIN SUCCESS SCENARIO**<br>
**Step** | **Action**<br>
**S** | 사용자가 “다른 소유자 매물 보기” 메뉴를 선택한다.<br>
**1** | 시스템이 로그인 사용자의 user_id를 확인한다.<br>
**2** | 시스템이 property 테이블에서 owner_id != user_id 조건으로 조회한다.<br>
**3** | 조회 결과를 최신순으로 정렬하여 화면에 표시한다.<br>
**4** | 사용자는 매물 상세 정보를 열람할 수 있다.<br>
* * *
**EXTENSION SCENARIOS**<br>
**Step** | branching action<br>
**1**
* 1a. 로그인 상태가 아님
    * 1a1. 로그인 후 다시 메뉴 접근하도록 안내한다.

**2**
* 2a. 네트워크 또는 DB 오류
    * 2a1. “내 매물을 불러올 수 없습니다.” 안내 후 재시도 제공한다.

**4**
* 4a. 매물 수정 중 권한 불일치
    * 4a1. “수정 권한이 없습니다.” 안내 표시한다.
****
* * *
**RELATED IMFORMATION**<br>
**Performance**
* ≤ 1.5 seconds

**Frequency**
* 사용자가 자신의 매물을 확인할 때마다

**Concurrency**
* 동일 사용자의 다중 요청 발생 가능

**Due Date**<br>
* * *

# Use case 22. 매물 상세 조회
**GENERAL CHARACTERISTICS**
* * *
**Summary**
* 사용자가 특정 매물의 세부 정보를 확인한다.

**Scope**<br>
**Level**
* user level

**Author**<br>


**Last Update**<br>
**Status**
* Analysis

**Primary Actor**
* 로그인한 소유자 또는 중개인 사용자

**Preconditions**
* 로그인 상태이며, 매물이 유효한 property_id를 가지고 있어야 한다.

**Trigger**
* 사용자가 매물 목록에서 특정 매물을 선택한다.

**Success Post Conditions**
* 매물의 세부 정보(제목, 주소, 가격, 면적, 건축년도, 상태 등)가 표시된다.
* 거래 조건(매매/전세/월세, 보증금, 관리비 등)과 이미지가 함께 표시된다.

**Failed Post Conditions**
* 매물 정보 조회 실패 시 오류 안내가 표시된다.

* * *
**MAIN SUCCESS SCENARIO**<br>
**Step** | **Action**<br>
**S** | 사용자가 매물 목록에서 특정 매물을 선택한다.<br>
**1** | 시스템이 선택된 property_id를 확인한다.<br>
**2** | 시스템이 property, property_offers, property_images 테이블을 조회한다.<br>
**3** | 조회된 데이터를 통합하여 상세 화면에 표시한다.<br>
**4** | 사용자는 상세 정보를 열람하고, 필요 시 채팅 또는 즐겨찾기 기능을 사용할 수 있다.<br>

**EXTENSION SCENARIOS**<br>
**Step** | branching action<br>
**1**
* 1a. 잘못된 property_id
    * 1a1. “존재하지 않는 매물입니다.” 메시지를 표시하고 목록으로 복귀.
**2**
* 2a. 네트워크 및 DB 연결 오류
    * 2a1. “매물 정보를 불러올 수 없습니다.” 안내 표시.

**3**
* 3a. 이미지나 추가 정보 누락
    * 3a1. 누락된 항목은 빈 영역 또는 대체 문구로 표시한다.
****
* * *
**RELATED IMFORMATION**<br>
**Performance**
* ≤ 1.5 seconds (상세 데이터 조회 기준)

**Frequency**
* 매물 상세 페이지 진입 시마다 1회

**Concurrency**
* 동일 사용자의 다중 요청 발생 가능

**Due Date**<br>
* * *

# Use case 23. 위임 관리
**GENERAL CHARACTERISTICS**
* * *
**Summary**
* 매물 소유자가 브로커에게 판매 위임을 요청하고, 브로커가 이를 승인·거절·취소·삭제할 수 있는 기능.

**Scope**<br>
**Level**
* user level

**Author**<br>
**Last Update**<br>
**Status**
* Analysis

**Primary Actor**
* 소유자(Owner)

**Secondary Actor**
* 브로커(Broker)

**Preconditions**
* 소유자는 로그인 상태이며 본인 소유 매물이 존재해야 한다.
* 브로커는 실제 프로필이 등록되어 있어야 한다.

**Trigger**
* 소유자가 위임 요청을 생성하거나 브로커가 요청을 처리할 때.

**Success Post Conditions**
* 위임 요청이 생성·승인·거절·취소·삭제되고 매물 상태가 일관되게 반영된다.

**Failure Post Conditions**
* 요청 또는 상태 변경이 반영되지 않는다.
* * *
**MAIN SUCCESS SCENARIO**<br>
**Step** | **Action**<br>
**S** | 소유자가 매물 위임을 요청한다.<br>
**1** | 소유자가 본인 매물 상세 화면에서 ‘브로커 위임 요청’ 버튼을 누른다.<br>
**2** | 거래 유형(매매/전세/월세)에 맞게 필수 금액(매매가, 보증금, 월세)을 입력한다.<br>
**3** | 시스템은 동일 매물에 PENDING 요청이 존재하는지 확인한다.<br>
**4** | 유효한 브로커인지 확인 후 위임 요청을 PENDING 상태로 생성한다.<br>
**5** | 브로커는 자신에게 도착한 요청 목록을 확인한다.<br>
**6** | 브로커는 개별 요청을 승인하거나 거절 사유를 입력해 거절한다.<br>
**7** | 승인 시 매물이 공개 매물 목록에 등록된다.<br>
**8** | 소유자는 본인이 보낸 요청 내역을 확인하고 대기 중인 요청은 취소할 수 있다.<br>
**9** | 소유자는 승인된 요청을 제외한 대기/거절/취소 요청을 삭제할 수 있다.<br>
* * *
**EXTENSION SCENARIOS**
**Step** | Branching Action<br>
**3**
* 3a. 동일 매물에 PENDING 요청 존재
    * 3a1. 새 요청 생성을 차단하고 “이미 요청이 존재합니다” 메시지를 표시한다.

**4**
* 4a. 브로커가 유효하지 않은 경우
    * 4a1. 시스템이 요청 생성을 거부한다.

**6**
* 6a. 이미 처리된 요청을 다시 처리 시도
    * 6a1. 승인/거절 동작이 차단된다.

**9**
* 9a. 승인된 요청을 삭제 시도
    * 9a1. 시스템이 삭제를 차단하고 안내 메시지를 표시한다.
* * *
**RELATED INFORMATION**
**Performance**
* ≤ 1 second

**Frequency**
* 제한 없음

**Concurrency**
* 제한 없음

**Due Date**
* * *
* * *

# Use case 24. 알림 기능
**GENERAL CHARACTERISTICS**
* * *
**Summary**
* 시스템 이벤트 발생 시 사용자에게 알림을 전송하고, 사용자가 알림함을 확인 및 관리하는 기능.

**Scope**<br>
**Level**
* user level

**Author**<br>
**Last Update**<br>
**Status**
* Analysis

**Primary Actor**
* 사용자(User)

**Secondary Actors**
* 시스템(System), 관리자(Admin), 브로커(Broker)

**Preconditions**
* 사용자는 로그인 상태이며 알림 수신이 허용되어 있어야 한다.

**Trigger**
* 거래 완료, 가격 하락, 추천 매물 등록, 예산 도달, 계약서 승인 등 이벤트 발생 시.

**Success Post Conditions**
* 알림이 생성·전송되어 알림함에 표시되고, 읽음/삭제 상태로 관리된다.

**Failure Post Conditions**
* 알림이 생성되지 않거나 동기화에 실패한다.
* * *
**MAIN SUCCESS SCENARIO**<br>
**Step** | **Action**<br>
**S** | 시스템이 조건을 만족하는 이벤트를 감지한다.<br>
**1** | 시스템이 이벤트 발생 시 알림을 생성한다.<br>
**2** | 시스템이 알림을 사용자에게 전송한다.<br>
**3** | 사용자는 사이드바의 알림 아이콘을 눌러 알림함을 연다.<br>
**4** | 시스템이 최신순으로 알림 목록을 로드한다.<br>
**5** | 사용자는 개별 또는 전체 알림을 읽음/삭제 처리할 수 있다.<br>
**6** | 알림 상세를 통해 관련 화면(매물 상세, 추천 목록 등)으로 이동한다.<br>
* * *
**EXTENSION SCENARIOS**
**Step** | Branching Action<br>
**2**
* 2a. 네트워크 오류로 알림 저장/전송 실패
    * 2a1. 시스템은 재시도 정책을 적용하고 실패 시 로그를 남긴다.

**4**
* 4a. 알림 목록 로드 실패
    * 4a1. 캐시된 알림을 표시하고 ‘동기화 실패’ 메시지를 띄운다.

**5**
* 5a. 일부 알림 상태 업데이트 실패
    * 5a1. 성공한 건만 반영하고 실패 건은 안내 메시지를 표시한다.
* * *
**RELATED INFORMATION**
**Performance**
* ≤ 1 second

**Frequency**
* 제한 없음

**Concurrency**
* 제한 없음

**Due Date**
* * *
* * *

# Use case 26. 지도 매물 시각화
**GENERAL CHARACTERISTICS**
* * *
**Summary**
* 사용자의 지도 화면에 매물 위치를 아이콘으로 표시한다.

**Scope**<br>
**Level**
* user level

**Author**<br>
**Last Update**<br>
**Status**
* Analysis

**Primary Actor**

* 로그인한 사용자(구직/중개/소유자 등 공통)

**Preconditions**

* 로그인을 한 상태여야 한다.

**Trigger**

* 지도 화면 최초 진입, 또는 줌/팬 등 뷰포트 변경 이벤트 발생.

**Success Post Conditions**

* 지도에 현재 뷰포트 내 매물이 상태별 컬러 마커로 표시된다.
* 매물 선택 시 요약 패널/시트에 상세 정보가 로드된다.

**Failure Post Conditions**
* 지도에 매물 띄우기를 실패한다

* * *
**MAIN SUCCESS SCENARIO**<br>
**Step** | **Action**<br>
**S** | 사용자가 지도를 띄운다<br>
**1** | 시스템이 현재 지도 뷰포트(BBOX: south, west, north, east)와 필터(상태, 가격 범위 등)를 읽는다.<br>
**2** | 시스템이 Supabase(PostgREST)로 매물 목록을 조회한다. (BBOX + 상태 필터, 페이지네이션)<br>
**3** | 시스템이 결과를 상태별 컬러 규칙에 따라 마커/클러스터로 렌더링한다.<br>
**4** | 사용자가 마커를 탭하면 시스템이 properties, property_images, property_offers에서 상세를 조회하여 하단 시트/카드에 표시한다.<br>

* * *
**EXTENSION SCENARIOS**<br>
**Step** | branching action<br>
**1**
* 1a. 네이버 지도 API를 이용하여 지도를 띄운다
    * 1a1. 일정 시간 후 지도를 재조회 하여 새로운 정보를 받아와 지도에 띄운다.
    * 1a2. 지도의 줌/팬 이벤트 발생 시 범위 재조회 및 마커 갱신한다.
* 1b. 등록된 매물의 위치 정보를 불러와 지도에 마커와 함께 표시한다.
    * 1b1. 매물의 상태 정보 [available|pending|sold]을 기준으로 색상을 달리하며 마커의 색상을 변경한다.
    * 1b2. 매물 클릭시 매물의 정보를 properties , property_images, property_offers table에서 받아와 각 정보를 띄운다.

**3**
* 3a. 로그인을 하지않아 토큰이 없으면 실패한다.
    * 3a1. 토큰이 없다는 메시지를 출력한다.
    * 3a2. 아이디 입력단계로 돌아간다.
* 3b. 지도 호출을 실패한다.
    * 3b1. 재시도 및 오률를 출력한다
****
* * *
**RELATED IMFORMATION**<br>
**Performance**
* ≤ 1 second

**Frequency**
* 지도를 호출할 때 마다

**Concurrency**
* 제한없음

**Due Date**<br>
* * *

# Use case 27. 사용자 위치 표시
**GENERAL CHARACTERISTICS**
* * *
**Summary**
* 사용자의 현재 위치를 지도에 표시한다.

**Scope**<br>
**Level**
* user level
**Author**<br>
**Last Update**

**Status**

* Analysis

**Primary Actor**

* 로그인한 사용자(구직/중개/소유자 등 공통)

**Preconditions**

* 사용자가 위치 권한을 허용한 상태여야 한다.

**Trigger**

* 지도 화면이 처음 호출되거나 ‘현재 위치’ 버튼을 클릭했을 때.

**Success Post Conditions**

* 사용자의 현재 위치를 지도 중심으로 표시한다.
* 위치 정보 획득이 실패하면 기본 위치(시청)를 중심으로 설정한다.

**Failure Post Conditions**

* GPS 신호 또는 권한 획득 실패 시 기본 중심(시청)으로 설정된다.

***

**MAIN SUCCESS SCENARIO**

**Step** Action<br>
**S** | 사용자가 지도를 띄운다<br>
**1** | 시스템이 위치 권한 상태를 확인한다.<br>
**2** | 권한이 허용되어 있으면 현재 GPS 좌표를 획득한다.<br>
**3** | 지도 중심을 현재 위치로 이동하고 마커로 표시한다.<br>
**4** | 사용자가 ‘현재 위치 고정’ 버튼을 클릭하면 현재 중심 좌표를 DB에 저장한다.<br>

* * *
**EXTENSION SCENARIOS**<br>
**Step** | branching action<br>
**1**
* 1a. 위치 권한이 비활성화된 경우
    * 1a1. 권한 요청 팝업을 표시한다.
    * 1a2. 거부 시 기본 중심(시청 좌표)으로 이동한다.

**2**
* 2a. GPS 신호를 받지 못한 경우.
    * 2a1. 마지막 저장된 사용자 위치를 불러와 중심으로 이동한다.
    * 2a2. 마지막 위치 정보도 없을 경우 시청 좌표로 이동한다.
****
* * *
**RELATED IMFORMATION**<br>
**Performance**
* ≤ 1 second

**Frequency**
* 지도 진입 또는 '현재 위치' 버튼 클릭 시마다

**Concurrency**
* 제한없음

**Due Date**<br>
* * *

# Use case 28. 지도 매물 즐겨찾기
**GENERAL CHARACTERISTICS**
* * *
**Summary**
* 즐겨찾기 등록/조회/삭제 기능을 통해 사용자가 관심 매물을 관리한다.

**Scope**<br>
**Level**
* user level

**Author**<br>
**Last Update**<br>
**Status**
* Analysis

**Primary Actor**
* 로그인한 사용자(구직/중개/소유자 등 공통)

**Preconditions**
* 로그인되어 있어야 하며 토큰이 유효해야 한다.

**Trigger**
* 즐겨찾기 탭 클릭 또 매물 카드의 하트 버튼 클릭 시.

**Success Post Conditions**
* 즐겨찾기 목록을 정상 조회하거나 등록 삭제 동작을 완료한다.

**Failure Post Conditions**
* 네트워크 또는 인증 오류시 즐겨찾기 목록/등록이 실패한다다.

* * *

**MAIN SUCCESS SCENARIO**<br>
**Step** | **Action**<br>
**S** | 사용자가 즐겨찾기 탭을 클릭한다<br>
**1** | 시스템이 현재 로그인 된 사용자의 토큰을 검증한다.<br>
**2** | favorites 테이블에서 해양 사용자 id와 일치하는 즐겨찾기 목록을 조회한다.<br>
**3** | 지도에 즐겨찾기 매물들을 하트 표시된 상태로 표시한다.<br>
**4** | 사용자가 즐겨찾기 매물 클릭 시 지도 중심을 해당 매물 좌표로 이동시키고 상세정보 패널을 표시한다.<br>

***

**EXTENSION SCENARIOS**
**Step** | Branching Action<br>
**1**

* 1a. 즐겨 찾기 추가
  * 1a1. 매물의 하트 버튼 클릭 시 현재 로그인된 사용자 토큰으로 favorites 테이블에 데이터 추가한다.
  * 1a2. 추가 후 하트 버튼이 빨간색으로 변한다.

**1**

* 1b. 즐겨 찾기 제거.

  * 1b1. 빨간색 하트 클릭 시 favorites 테이블에서 해당 데이터를 삭제한다.
  * 1b2. 버튼 색상이 회색으로 변한다.

  **3**

* 3a. 정보 확인 실패
  * 3a1. 조회 실패 시 실패 원인을 상단 알림창에 표시한다.
  * 3a2. 재시도 버튼 제공

***

**RELATED IMFORMATION**
**Performance**

* ≤ 1 second

**Frequency**

* 즐겨찾기 탭 또는 버튼 클릭 시

**Concurrency**

* 제한없음

**Due Date**

***

***

# Use case 29. 매물 상세정보 표시
**GENERAL CHARACTERISTICS**
* * *
**Summary**
* 마커 클릭 시 매물의 상세종보를 사이드 바로 표시한다.

**Scope**<br>
**Level**
* user level

**Author**<br>
**Last Update**<br>
**Status**
* Analysis

**Primary Actor**
* 로그인한 사용자(구직/중개/소유자 등 공통)

**Preconditions**
* 지도에 매물 마커가 표시되어 있어야 한다.

**Trigger**
* 사용자가 마커를 클릭했을 때.

**Success Post Conditions**
* 매물 정보 패널이 열리고 상세 정보가 표시된다.

**Failure Post Conditions**
* 매물 정보 조회 또는 표시 실패 시 오류 메시지를 출력한다.

* * *
**MAIN SUCCESS SCENARIO**<br>
**Step** | **Action**<br>
**S** | 사용자가 지도에서 마커를 클릭한다.<br>
**1** | 시스템이 클릭된 마커의 property_id를 획득한다.<br>
**2** | Supabase API를 호출하여 properties, property_images, property_offers, favorite 정보를 받아온다..<br>
**3** | 받은 정보를 사이드바에 렌더링 한다.<br>

* * *
**EXTENSION SCENARIOS**<br>
**Step** | branching action<br>
**1**
* 1a. 매물 정보 소회 실패
    * 1a1. 실패 메시지를 표시하고 화면을 새로고침한다.
    * 1a2. 재시도 버튼 제공공.

**2**
* 2a. GPS 신호를 받지 못한 경우.
    * 2a1. 마지막 저장된 사용자 위치를 불러와 중심으로 이동한다.
    * 2a2. 마지막 위치 정보도 없을 경우 시청 좌표로 이동한다.
****
* * *
**RELATED IMFORMATION**<br>
**Performance**
* ≤ 1 second

**Frequency**
* 마커 클릭시 마다

**Concurrency**
* 제한없음

**Due Date**<br>
* * *

# Use case 30. 필터
**GENERAL CHARACTERISTICS**
* * *
**Summary**
* 매물을 필터링 한다.

**Scope**<br>
**Level**
* user level

**Author**<br>
**Last Update**<br>
**Status**
* Analysis

**Primary Actor**
* 로그인한 사용자(구직/중개/소유자 등 공통)

**Preconditions**
* 지도 화면과 매물 정보가 활성화 되어 있어야 한다.

**Trigger**
* 사용자가 개별 또는 종합 필터를 지정하고 적용 버튼을 클릭할 때.
* 검색창에 위치를 적용하고 확인을 누를 때

**Success Post Conditions**
* 필터 조건에 맞는 매물만 지도에 표시된다.
* 지도가 위치에 맞게 이동이 된다.

**Failure Post Conditions**
* 필터 적용 및 이동 실패 시 오류 메시지 출력 및 필터 해제.

* * *
**MAIN SUCCESS SCENARIO**<br>
**Step** | **Action**<br>
**S** | 사용자가 필터를 지정 후 버튼을 클릭한다<br>
**1** | 시스템이 property_offers 및 properties 테이블에서 조건에 맞는 매물을 조회한다.<br>
**2** | 결과를 지도에 표시하고 건물 상태에 따라 다르게 표시한다..<br>
**3** | 필터가 없는 경우 모든 매물을 표시한다..<br>
**4** | 필터가 적용된 경우 필터에 파랗게 된다.<br>

* * *
**EXTENSION SCENARIOS**<br>
**Step** | branching action<br>
**1**
* 1a. 종합 필터 적용
    * 1a1. 모든 조건을 한 번에 지정 후 적용 버튼 클릭 시 필터가 적용된다.
    * 1a2. 결과 매물만 지도에 표시된다.
* 1b. 위치 검색
    * 1b1. 위치를 검색한다.
    * 1b2. 관련된 위치가 하단에 표시된다.
    * 1b3. 위치 클릭 시 그 위치를 데이터를 받아와 지도 중심을 이동한다.

**2**
* 2a. 필터 저장 실패.
    * 2a1. 필터 지정 실패 시 오류 메시지를 출력하고 필터가 해제된다.
****
* * *
**RELATED IMFORMATION**<br>
**Performance**
* ≤ 1 second

**Frequency**
* 필터 지정정 시마다

**Concurrency**
* 제한없음

**Due Date**<br>
* * *

# Use case 31. 추천 매물
**GENERAL CHARACTERISTICS**
* * *
**Summary**
* 알고리즘을 통한 사요자의 관심사와 선호도를 분석하여 개인화된 매물을 추천한다.

**Scope**<br>
**Level**
* user level

**Author**<br>
**Last Update**<br>
**Status**
* Analysis

**Primary Actor**
* 로그인한 사용자(구직/중개/소유자 등 공통)

**Preconditions**
* 로그인한 상태여야 하면 이전에 선호도를 등록해놓은 상태여야 한다.

**Trigger**
* 사용자가 로그인 하거나 추천매물 섹션에 접근할 때.

**Success Post Conditions**
* 개인화된 매물 리스트가 추천 섹션에 표시된다.

**Failure Post Conditions**
* 데이터 부족 또는 알고리즘 오류 시 추천이 표시되지 않는다.

* * *
**MAIN SUCCESS SCENARIO**<br>
**Step** | **Action**<br>
**S** | 사용자가 로그인한다.<br>
**1** | 사용자가 열람한 매물 수를 확인한다.<br>
**2** | 매물 클릭 시 DB에 사용한 !D, 매물 !D 속성 정보를 저상한다.<br>
**3** | 열람 매물 수가 기준 이상이 되거나 이전에 저장해놓은 선호도가 있다면 추천 계산 트리거가 발생한다.<br>
**4** | 수집 데이터의 유효성 검증 → 원*핫 인코딩/정규화 처리 → 벡터화 수행.<br>
**5** | 전체 매물 베터와 사용자 벡터 간 유사도를 계산한다.<br>
**7** | 유사도 순으로 정렬 후 추천매물 섹션에 표시한다.<br>
**9** | 새 매물 클릭 시 재계산 및 재정렬 수행.<br>
**10** | 일정 매물 추가 조회시 추천 계산 트리거가 재 조회된다.<br>

* * *
**EXTENSION SCENARIOS**<br>
**Step** | branching action<br>
**1**
* 1a. 위치 권한이 비활성화된 경우
    * 1a1. 권한 요청 팝업을 표시한다.
    * 1a2. 거부 시 기본 중심(시청 좌표)으로 이동한다.

**2**
* 2a. GPS 신호를 받지 못한 경우.
    * 2a1. 마지막 저장된 사용자 위치를 불러와 중심으로 이동한다.
    * 2a2. 마지막 위치 정보도 없을 경우 시청 좌표로 이동한다.
****
* * *
**RELATED IMFORMATION**<br>
**Performance**
* ≤ 1 second

**Frequency**
* 지도 진입 또는 '현재 위치' 버튼 클릭 시마다

**Concurrency**
* 제한없음

**Due Date**<br>
* * *


# Use case 32. 중개인 목록 표시
**GENERAL CHARACTERISTICS**
* * *
**Summary**
* 등록된 중개인 목록과 상세 정보를 조회하고, 상세에서 연락/위임 의뢰로 연결하는 기능.

**Scope**<br>
**Level**
* user level

**Author**<br>
**Last Update**<br>
**Status**
* Analysis

**Primary Actor**
* 사용자(User)

**Secondary Actors**
* 브로커(Broker)

**Preconditions**
* 사용자는 로그인 상태이며 중개인 목록 조회 권한이 있어야 한다.

**Trigger**
* 사용자가 중개인 목록 아이콘을 클릭하거나 검색을 수행할 때.

**Success Post Conditions**
* 중개인 목록과 상세 정보가 표시되고, 연락 및 위임 의뢰가 가능하다.

**Failure Post Conditions**
* 목록 또는 상세 정보를 불러오지 못한다.
* * *
**MAIN SUCCESS SCENARIO**<br>
**Step** | **Action**<br>
**S** | 사용자가 중개인 목록 아이콘을 클릭한다.<br>
**1** | 시스템이 등록된 중개인 전체 목록을 불러온다.<br>
**2** | 검색어가 없으면 전체 목록을 표시하고, 입력 시 필터링한다.<br>
**3** | 사용자가 특정 중개인의 상세 정보를 클릭한다.<br>
**4** | 시스템이 해당 중개인의 연락처, 면허번호, 소개, 리뷰, 거래 건수를 표시한다.<br>
**5** | 사용자는 상세의 ‘연락하기’ 버튼으로 메시지 또는 전화 연결을 시도하거나, 위임 요청으로 이동한다.<br>
* * *
**EXTENSION SCENARIOS**<br>
**Step** | branching action<br>
**1**
* 1a. 네트워크 오류로 목록 로드 실패
    * 1a1. 재시도 버튼과 오류 메시지를 표시한다.

**4**
* 4a. 상세 정보 중 일부 누락
    * 4a1. 이용 가능한 정보만 표시하고, 누락 데이터는 추후 갱신한다.

**5**
* 5a. 연락 권한 미허용
    * 5a1. 권한 요청 안내 또는 대체 연락 수단을 제공한다.
****
* * *
**RELATED IMFORMATION**<br>
**Performance**
* ≤ 1 second

**Frequency**
* 제한 없음

**Concurrency**
* 제한 없음

**Due Date**<br>
* * *

# Use case 33. 전세가율 계산기
**GENERAL CHARACTERISTICS**
* * *
**Summary**
* 매물의 전세가율(전세가/매매가×100)을 계산하고, 주변 평균 및 AI 예측을 활용해 표시하는 기능.

**Scope**<br>
**Level**
* user level

**Author**<br>
**Last Update**<br>
**Status**
* Analysis

**Primary Actor**
* 사용자(User)

**Secondary Actors**
* 시스템(System), AI 예측 모듈

**Preconditions**
* 사용자는 매물 상세 페이지에 접근할 수 있어야 하며, DB에서 전세가와 매매가 또는 예측값을 조회할 수 있어야 한다.

**Trigger**
* 사용자가 매물 상세 페이지에 진입하거나 ‘전세가율 보기’를 선택할 때.

**Success Post Conditions**
* 전세가율이 계산되어 소수점 둘째 자리로 표시되고, 주변 평균 대비 높음/낮음 여부가 함께 표시된다.

**Failure Post Conditions**
* 전세가율 계산 또는 표시가 실패한다.
* * *
**MAIN SUCCESS SCENARIO**<br>
**Step** | **Action**<br>
**S** | 사용자가 매물 상세 페이지에 진입한다.<br>
**1** | 시스템이 DB에서 전세가와 매매가를 조회한다.<br>
**2** | 시스템이 전세가/매매가×100을 계산하고 소수점 둘째 자리로 반올림한다.<br>
**3** | 주변 매물 전세가율 평균을 조회하여 비교 결과(높음/낮음)를 산출한다.<br>
**4** | 매매가 데이터가 없으면 AI 예측 매매가를 사용해 “AI 예측 전세가율”로 표시한다.<br>
**5** | 계산 결과와 비교 정보를 상세 페이지에 표시한다.<br>
* * *
**EXTENSION SCENARIOS**<br>
**Step** | branching action<br>
**2**
* 2a. 전세가 또는 매매가 데이터가 없음
    * 2a1. AI 예측 값을 사용하고, 실패 시 “정보 없음”으로 표시한다.

**3**
* 3a. 주변 매물 데이터 부족
    * 3a1. 평균 비교 없이 전세가율만 표시한다.

**4**
* 4a. 계산 오류 발생
    * 4a1. 오류 메시지를 표시하고 재시도 버튼을 제공한다.
****
* * *
**RELATED IMFORMATION**<br>
**Performance**
* ≤ 1 second

**Frequency**
* 제한 없음

**Concurrency**
* 제한 없음

**Due Date**
* * *
