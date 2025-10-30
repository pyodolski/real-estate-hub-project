# Use case 1. 매물 등록 신청

**GENERAL CHARACTERISTICS**

---

**Summary**

- 사용자가 매물 소유권 증명을 위한 신청서를 상세정보와 필수 서류와 함께 제출하는 기능

**Scope**

**Level**

- User level

**Author**
**Last Update**

**Status**

- Implemented

**Primary Actor**

- 로그인한 사용자 (일반 사용자)

**Preconditions**

- 사용자가 로그인되어 있어야 함 (JWT 토큰 보유)
- `/api/ownership/**` 엔드포인트는 인증된 사용자만 접근 가능

**Trigger**

- 사용자가 매물 소유권 신청 폼에서 "신청하기" 버튼을 클릭했을 때.

**Success Post Conditions**

- 매물 소유권 신청이 데이터베이스에 저장됨 (Status: PENDING)
- 업로드된 서류 파일들이 서버 저장소(`uploads/ownership/`)에 저장됨
- 고유한 파일명(타임스탬프 + UUID)으로 파일 저장
- 신청 ID가 포함된 응답 반환
- 관리자에게 검토 대기 상태로 전달됨

**Failure Post Conditions**

- 신청 데이터가 저장되지 않음
- 업로드된 파일들이 저장되지 않음
- 사용자에게 오류 메시지 반환

---

**MAIN SUCCESS SCENARIO**

**Step** Action<br>
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

---

**EXTENSION SCENARIOS**
**Step** | Branching Action<br>
**6**

- 6a. 파일이 비어있는 경우
  - 6a1. "빈 파일은 업로드할 수 없습니다" 오류 메시지를 출력한다.

**6**

- 6b. 파일 크기가 10MB를 초과하는 경우
  - 6b1. "파일 크기는 10MB를 초과할 수 없습니다" 오류 메시지를 출력한다.

**6**

- 6c. 지원하지 않는 파일 형식인 경우
  - 6c1. "지원하지 않는 파일 형식입니다. PDF, JPG, PNG, DOCX만 업로드 가능합니다" 오류 메시지를 출력한다.

**8**

- 8a. JWT 토큰이 유효하지 않은 경우
  - 8a1. 401 Unauthorized 응답을 반환한다.

**9**

- 9a. 같은 주소로 PENDING 상태 신청이 이미 존재하는 경우
  - 9a1. "같은 주소로 심사 중인 신청이 이미 존재합니다" 오류 메시지를 출력한다.

**9**

- 9b. 기존 매물에 대해 이미 신청한 경우
  - 9b1. "이미 해당 매물에 신청이 존재합니다" 오류 메시지를 출력한다.

**11**

- 11a. 파일 저장 실패 시
  - 11a1. "파일 저장에 실패했습니다" 오류 메시지를 출력한다.

**11**

- 11b. 파일 개수와 문서 타입 개수가 일치하지 않는 경우
  - 11b1. "파일 개수와 문서 타입 개수가 일치하지 않습니다" 오류 메시지를 출력한다.

**13**

- 13a. 사용자가 존재하지 않는 경우
  - 13a1. "사용자가 존재하지 않습니다" 오류 메시지를 출력한다.

**\***

- \*a. 기타 예외 발생 시
  - \*a1. "매물 등록 처리 중 오류가 발생했습니다" 오류 메시지를 출력한다.

---

**RELATED IMFORMATION**
**Performance**

- ≤ 1 second (파일 업로드 제외)
- 파일 업로드 최대 크기: 10MB per file
- 파일 저장 위치: `uploads/ownership/` 디렉토리
- 파일명 생성 방식: `yyyyMMdd_HHmmss_UUID(8자).확장자`
- 허용 파일 형식: PDF, JPG, JPEG, PNG, DOCX, DOC

**Frequency**

- 사용자당 신청 빈도 제한 없음
- 중복 신청 방지 로직 존재

**Concurrency**

- 제한없음

**Due Date**

---

---

# Use case 2. 매물 신청 현황 조회

**GENERAL CHARACTERISTICS**

---

**Summary**

- 사용자가 신청한 매물들의 상태를 확인한다.

**Scope**

**Level**

- User level

**Author**

**Last Update**

**Status**

- Implemented

**Primary Actor**

- 로그인한 사용자 (일반 사용자)

**Preconditions**

- 사용자가 로그인되어 있어야 함 (JWT 토큰 보유)
- `/api/ownership/**` 엔드포인트는 인증된 사용자만 접근 가능

**Trigger**

- 사용자가 내 신청 내역 페이지에 접근하거나 특정 신청 상세를 조회할 때.

**Success Post Conditions**

- 사용자의 모든 신청 내역이 목록으로 표시됨
- 각 신청의 상태(심사중/승인됨/거절됨)가 표시됨
- 심사중인 경우 남은 일수가 표시됨 (마감일: 수정일 + 7일)
- 거절된 경우 거절 사유가 표시됨
- 첨부된 서류를 원본 파일명으로 다운로드 가능

**Failure Post Conditions**

- 신청 내역 조회 실패 시 오류 메시지 출력
- 권한이 없는 신청 접근 시 오류 메시지 출력

---

**MAIN SUCCESS SCENARIO**

**Step** Action<br>
**S** | 사용자가 내 신청 내역 페이지에 접근한다.<br>
**1** | 시스템이 JWT 토큰을 검증한다.<br>
**2** | 시스템이 현재 사용자 ID로 ownership_claims 테이블을 조회한다 (`GET /api/ownership/my-claims`).<br>
**3** | 시스템이 각 신청의 상태를 확인한다 (PENDING/APPROVED/REJECTED).<br>
**4** | 시스템이 신청 목록을 반환한다 (신청 ID, 주소, 상태, 신청일, 마감일 등).<br>
**5** | 사용자가 특정 신청을 클릭하여 상세 정보를 조회한다.<br>
**6** | 시스템이 해당 신청의 상세 정보를 조회한다 (`GET /api/ownership/claims/{claimId}`).<br>
**7** | 시스템이 신청자 정보, 매물 정보, 첨부 서류 목록을 반환한다.<br>
**8** | 상태가 'APPROVED'인 경우 '승인됨'으로 표시한다.<br>
**9** | 상태가 'PENDING'인 경우 '심사중'으로 표시하고 남은 일수를 계산하여 표시한다 (마감일 - 현재일).<br>
**10** | 상태가 'REJECTED'인 경우 '거절됨'으로 표시하고 거절 사유를 함께 표시한다.<br>
**11** | 사용자가 첨부 서류의 다운로드 버튼을 클릭한다.<br>
**12** | 시스템이 문서 정보를 조회한다 (`GET /api/ownership/documents/{documentId}/download`).<br>
**13** | 시스템이 파일 존재 여부와 읽기 가능 여부를 확인한다.<br>
**14** | 시스템이 원본 파일명으로 인코딩하여 파일을 다운로드한다.<br>

---

**EXTENSION SCENARIOS**

**Step** | Branching Action<br>
**1**

- 1a. JWT 토큰이 유효하지 않은 경우
  - 1a1. 401 Unauthorized 응답을 반환한다.

**2**

- 2a. 신청 내역이 없는 경우
  - 2a1. 빈 목록을 반환한다.

**6**

- 6a. 신청을 찾을 수 없는 경우
  - 6a1. "신청을 찾을 수 없습니다" 오류 메시지를 출력한다.

**6**

- 6b. 다른 사용자의 신청에 접근하려는 경우
  - 6b1. "접근 권한이 없습니다" 오류 메시지를 출력한다.

**12**

- 12a. 문서를 찾을 수 없는 경우
  - 12a1. "문서를 찾을 수 없습니다" 오류 메시지를 출력한다.

**13**

- 13a. 파일이 존재하지 않거나 읽을 수 없는 경우
  - 13a1. "파일을 읽을 수 없습니다" 오류 메시지를 출력한다.

**14**

- 14a. 파일 경로가 잘못된 경우
  - 14a1. "파일 경로가 잘못되었습니다" 오류 메시지를 출력한다.

**14**

- 14b. 파일 다운로드 중 오류 발생
  - 14b1. "파일 다운로드 중 오류가 발생했습니다" 오류 메시지를 출력한다.

---

**RELATED IMFORMATION**

**Performance**

- ≤ 1 second (목록 조회)
- ≤ 1 second (상세 조회)
- 파일 다운로드 시간은 파일 크기에 따라 다름
- 마감일 계산: 수정일(updated_at) + 7일
- 한글 파일명 인코딩 처리 (UTF-8)

**Frequency**

- 사용자가 내 신청 내역 페이지 접근 시마다
- 특정 신청 상세 조회 시마다
- 서류 다운로드 시마다

**Concurrency**

- 제한없음

**Due Date**

---

---

# Use case 3. 매물 관리 현황 요약

**GENERAL CHARACTERISTICS**

---

**Summary**

- 전체 매물 관리 상황을 한눈에 파악할 수 있도록 요약 정보를 제공한다.

**Scope**

**Level**

- User level

**Author**

**Last Update**

**Status**

- Implemented

**Primary Actor**

- 로그인한 사용자 (일반 사용자)

**Preconditions**

- 사용자가 로그인되어 있어야 함 (JWT 토큰 보유)
- `/api/ownership/**` 엔드포인트는 인증된 사용자만 접근 가능

**Trigger**

- 사용자가 매물 관리 대시보드 또는 내 신청 내역 페이지에 접근할 때.

**Success Post Conditions**

- 각 상태별(심사중/승인됨/거절됨) 매물 건수가 표시됨
- 매물 목록이 제목, 주소, 상태, 신청자 정보와 함께 표시됨
- 상태별로 색상과 라벨이 구분되어 직관적으로 확인 가능
- 매물이 없는 경우 안내 문구 표시

**Failure Post Conditions**

- 매물 목록 조회 실패 시 오류 메시지 출력

---

**MAIN SUCCESS SCENARIO**

**Step** Action<br>
**S** | 사용자가 매물 관리 대시보드에 접근한다.<br>
**1** | 시스템이 JWT 토큰을 검증한다.<br>
**2** | 시스템이 현재 사용자 ID로 ownership_claims 테이블을 조회한다 (`GET /api/ownership/my-claims`).<br>
**3** | 시스템이 조회된 신청 목록을 반환한다.<br>
**4** | 시스템이 각 신청의 상태(PENDING/APPROVED/REJECTED)를 확인한다.<br>
**5** | 시스템이 상태별 건수를 계산한다.<br>
**6** | 시스템이 심사중(PENDING) 건수를 표시한다.<br>
**7** | 시스템이 승인됨(APPROVED) 건수를 표시한다.<br>
**8** | 시스템이 거절됨(REJECTED) 건수를 표시한다.<br>
**9** | 시스템이 각 매물의 제목, 주소, 상태, 신청자 정보를 목록으로 표시한다.<br>
**10** | 시스템이 상태별로 색상과 라벨을 구분하여 표시한다 (PENDING: 노란색/주황색, APPROVED: 초록색, REJECTED: 빨간색).<br>
**11** | 사용자가 매물 목록을 확인한다.<br>

---

**EXTENSION SCENARIOS**

**Step** | Branching Action<br>
**1**

- 1a. JWT 토큰이 유효하지 않은 경우
  - 1a1. 401 Unauthorized 응답을 반환한다.

**3**

- 3a. 신청 내역이 없는 경우 (빈 목록 반환)
  - 3a1. "현재 등록된 매물이 없습니다" 안내 문구를 표시한다.
  - 3a2. 상태별 건수를 모두 0으로 표시한다.

**2**

- 2a. 매물 목록 조회 실패
  - 2a1. 오류 메시지를 표시한다.
  - 2a2. 재시도 버튼을 제공한다.

---

**RELATED IMFORMATION**

**Performance**

- ≤ 1 second (목록 조회 및 집계)
- 상태별 건수 계산은 클라이언트 측에서 수행

**Frequency**

- 매물 관리 대시보드 접근 시마다

**Concurrency**

- 제한없음

**Due Date**

---

---

# Use case 4. 지도 위치 설정 기능

**GENERAL CHARACTERISTICS**

---

**Summary**

사용자가 지도를 통해 정확한 매물 위치를 설정하도록 한다.

**Scope**

Real Estate Application - Ownership Claim Module

**Level**

User level

**Author**

**Last Update**

**Status**

Implemented

**Primary Actor**

로그인한 사용자 (일반 사용자)

**Preconditions**

- 사용자가 로그인되어 있어야 함 (JWT 토큰 보유)
- 매물 등록 신청 폼이 열려 있어야 함
- 지도 API 서비스가 정상 작동해야 함

**Trigger**

사용자가 매물 등록 신청 시 지도에서 위치를 선택하거나 주소를 입력할 때.

**Success Post Conditions**

- 선택한 위치의 좌표(latitude, longitude)가 저장됨
- 좌표에 해당하는 주소 정보가 자동으로 조회되어 표시됨
- 주소 필드에 도로명주소, 지번주소, 건물명, 우편번호가 자동 완성됨
- 매물 신청 시 위치 정보가 함께 저장됨

**Failure Post Conditions**

- 지도 API 호출 실패 시 오류 메시지 출력
- 위치 정보가 저장되지 않음

---

**MAIN SUCCESS SCENARIO**

**Step** Action<br>
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

---

**EXTENSION SCENARIOS**

**Step** | Branching Action<br>
**2**

- 2a. 사용자가 주소를 직접 입력하는 경우
  - 2a1. 사용자가 주소 검색창에 주소를 입력한다.
  - 2a2. 시스템이 주소로 좌표를 조회한다 (`GET /api/ownership/map/coordinates?address={address}`).
  - 2a3. 시스템이 Geocoding을 수행하여 좌표를 반환한다.
  - 2a4. 시스템이 지도 중심을 해당 좌표로 이동한다.
  - 2a5. 시스템이 해당 위치에 마커를 표시한다.
  - 2a6. 시스템이 주소 필드를 자동 완성한다.

**3**

- 3a. 사용자가 마커를 드래그하여 위치를 변경하는 경우
  - 3a1. 시스템이 새로운 좌표를 저장한다.
  - 3a2. 시스템이 새로운 좌표로 주소를 재조회한다.
  - 3a3. 시스템이 주소 필드를 업데이트한다.

**5**

- 5a. 지도 API 호출 실패
  - 5a1. "주소 조회에 실패했습니다" 오류 메시지를 표시한다.
  - 5a2. 사용자가 주소를 수동으로 입력할 수 있도록 한다.

**6**

- 6a. 좌표에 해당하는 주소를 찾을 수 없는 경우
  - 6a1. 기본 주소 정보를 반환한다 (서울시청 기준).
  - 6a2. 사용자에게 주소를 수동으로 확인하도록 안내한다.

**\***

- \*a. 주변 건물 검색 기능 사용
  - \*a1. 사용자가 주변 건물 검색 버튼을 클릭한다.
  - \*a2. 시스템이 현재 위치 기준 반경 500m 내 건물을 조회한다 (`GET /api/ownership/map/nearby-buildings`).
  - \*a3. 시스템이 건물 목록을 표시한다 (건물명, 카테고리, 주소, 거리).
  - \*a4. 사용자가 건물을 선택하면 해당 위치로 이동한다.

---

**RELATED INFORMATION**

**Performance**

- ≤ 1 second (지도 API 호출)
- Reverse Geocoding: 좌표 → 주소 변환
- Geocoding: 주소 → 좌표 변환
- 주변 건물 검색: 기본 반경 500m
- 현재 더미 데이터 사용 (네이버 API 구독 필요)

**Frequency**

- 매물 등록 신청 시마다
- 지도에서 위치 변경 시마다
- 주소 입력 시마다

**Concurrency**

- 제한없음
- 동시 API 호출 지원
- 지도 API 응답 시간에 따라 성능 변동 가능

**Due Date**

- ***

# Use case 5. 소유권 증명 서류 업로드

**GENERAL CHARACTERISTICS**

---

**Summary**

다양한 종류의 소유권 증명 서류를 업로드 할 수 있다.

**Scope**

Real Estate Application - Ownership Claim Module

**Level**

User level

**Author**

**Last Update**

**Status**

Implemented

**Primary Actor**

로그인한 사용자 (일반 사용자)

**Preconditions**

- 사용자가 로그인되어 있어야 함 (JWT 토큰 보유)
- 매물 등록 신청 폼이 열려 있어야 함

**Trigger**

사용자가 매물 등록 신청 시 서류 업로드 버튼을 클릭할 때.

**Success Post Conditions**

- 업로드된 파일이 서버 저장소에 저장됨 (`uploads/ownership/`)
- 파일 정보가 ownership_documents 테이블에 저장됨
- 원본 파일명, 저장 파일명, 파일 크기, 업로드 시간이 기록됨
- 관리자가 추후 확인 가능

**Failure Post Conditions**

- 파일 업로드 실패 시 오류 메시지 출력
- 파일이 저장되지 않음

---

**MAIN SUCCESS SCENARIO**

**Step** Action<br>
**S** | 사용자가 매물 등록 신청 폼에서 서류 업로드 섹션을 연다.<br>
**1** | 시스템이 서류 타입 목록을 조회한다 (`GET /api/ownership/document-types`).<br>
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

---

**EXTENSION SCENARIOS**

**Step** | Branching Action<br>
**5**

- 5a. 지원하지 않는 파일 형식인 경우
  - 5a1. "지원하지 않는 파일 형식입니다. PDF, JPG, PNG, DOCX만 업로드 가능합니다" 오류 메시지를 출력한다.
  - 5a2. 파일 선택을 취소한다.

**6**

- 6a. 파일 크기가 10MB를 초과하는 경우
  - 6a1. "파일 크기는 10MB를 초과할 수 없습니다" 오류 메시지를 출력한다.
  - 6a2. 파일 선택을 취소한다.

**6**

- 6b. 빈 파일을 업로드하는 경우
  - 6b1. "빈 파일은 업로드할 수 없습니다" 오류 메시지를 출력한다.

**11**

- 11a. 파일 개수와 문서 타입 개수가 일치하지 않는 경우
  - 11a1. "파일 개수와 문서 타입 개수가 일치하지 않습니다" 오류 메시지를 출력한다.
  - 11a2. 사용자에게 서류 타입을 다시 선택하도록 안내한다.

**12**

- 12a. 파일 저장 실패
  - 12a1. "파일 저장에 실패했습니다" 오류 메시지를 출력한다.
  - 12a2. 업로드를 중단한다.

**12**

- 12b. 업로드 디렉토리가 존재하지 않는 경우
  - 12b1. 시스템이 자동으로 디렉토리를 생성한다 (`uploads/ownership/`).
  - 12b2. 파일 저장을 계속 진행한다.

---

**RELATED INFORMATION**

**Performance**

- ≤ 1 second (파일 검증)
- 파일 업로드 시간은 파일 크기에 따라 다름
- 최대 파일 크기: 10MB per file
- 허용 파일 형식: PDF, JPG, JPEG, PNG, DOCX, DOC
- 파일명 생성 방식: `yyyyMMdd_HHmmss_UUID(8자).확장자`

**Frequency**

- 매물 등록 신청 시마다
- 매물 수정 시마다

**Concurrency**

- 제한없음
- 동시 업로드 지원
- 파일명 충돌 방지: 타임스탬프 + UUID 조합

**Due Date**

- ***

# Use case 6. 심사 중 매물 신청 수정

**GENERAL CHARACTERISTICS**

---

**Summary**

사용자가 심사중인 매물 신청 정보를 수정할 수 있다.

**Scope**

Real Estate Application - Ownership Claim Module

**Level**

User level

**Author**

**Last Update**

**Status**

Implemented

**Primary Actor**

로그인한 사용자 (일반 사용자)

**Preconditions**

- 사용자가 로그인되어 있어야 함 (JWT 토큰 보유)
- 수정하려는 신청이 존재해야 함
- 신청 상태가 PENDING(심사중)이어야 함

**Trigger**

사용자가 심사중인 신청의 수정 버튼을 클릭할 때.

**Success Post Conditions**

- 신청 정보가 수정됨
- 수정된 정보가 데이터베이스에 저장됨
- 감사 로그에 수정 이력이 기록됨
- updatedAt 필드가 현재 시간으로 갱신됨

**Failure Post Conditions**

- 신청 정보가 수정되지 않음
- 오류 메시지 출력

---

**MAIN SUCCESS SCENARIO**

**Step** Action<br>
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

---

**EXTENSION SCENARIOS**

**Step** | Branching Action<br>
**1**

- 1a. 신청 상태가 APPROVED(승인됨)인 경우
  - 1a1. 수정 버튼을 비활성화한다.
  - 1a2. "승인된 신청은 수정할 수 없습니다" 안내 메시지를 표시한다.
- 1b. 신청 상태가 REJECTED(거절됨)인 경우
  - 1b1. 수정 버튼을 비활성화한다.
  - 1b2. "거절된 신청은 수정할 수 없습니다" 안내 메시지를 표시한다.

**7**

- 7a. JWT 토큰이 유효하지 않은 경우
  - 7a1. 401 Unauthorized 응답을 반환한다.

**8**

- 8a. 신청을 찾을 수 없는 경우
  - 8a1. "신청을 찾을 수 없습니다" 오류 메시지를 출력한다.

**9**

- 9a. 다른 사용자의 신청을 수정하려는 경우
  - 9a1. "수정 권한이 없습니다" 오류 메시지를 출력한다.

**10**

- 10a. 신청 상태가 PENDING이 아닌 경우
  - 10a1. "심사중인 신청만 수정할 수 있습니다" 오류 메시지를 출력한다.

**13**

- 13a. 파일 업로드 실패
  - 13a1. 파일 저장 오류 메시지를 출력한다.
  - 13a2. 기존 정보는 유지된다.

---

**RELATED INFORMATION**

**Performance**

- ≤ 1 second (파일 업로드 제외)
- 파일 업로드 시간은 파일 크기에 따라 다름
- 기존 문서 삭제 후 새 문서 업로드
- 감사 로그 자동 생성

**Frequency**

- 사용자가 신청 수정 시마다
- PENDING 상태인 신청만 수정 가능

**Concurrency**

- 제한없음
- 트랜잭션 관리로 데이터 일관성 보장
- PreUpdate로 updatedAt 자동 갱신

**Due Date**

- ***

# Use case 7. 관리자 매물 신청 검토 및 처리

**GENERAL CHARACTERISTICS**

---

**Summary**

관리자가 신청을 검토하고 승인 또는 거절한다.

**Scope**

Real Estate Application - Ownership Claim Module (Admin)

**Level**

User level

**Author**

**Last Update**

**Status**

Implemented

**Primary Actor**

관리자 (Admin)

**Preconditions**

- 관리자 권한으로 로그인되어 있어야 함
- 검토할 신청이 존재해야 함

**Trigger**

관리자가 신청 목록에 접근하거나 특정 신청을 검토할 때.

**Success Post Conditions**

- 신청 상태가 APPROVED 또는 REJECTED로 변경됨
- 승인 시 Property 엔티티가 자동 생성됨
- 거절 시 거절 사유가 저장됨
- 검토 시간(reviewedAt)이 기록됨
- 감사 로그에 검토 이력이 기록됨
- 사용자에게 알림이 전송됨

**Failure Post Conditions**

- 신청 상태가 변경되지 않음
- 오류 메시지 출력

---

**MAIN SUCCESS SCENARIO**

**Step** Action<br>
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

---

**EXTENSION SCENARIOS**

**Step** | Branching Action<br>
**1**

- 1a. 관리자 권한이 없는 경우
  - 1a1. "관리자 권한이 필요합니다" 오류 메시지를 출력한다.
  - 1a2. 403 Forbidden 응답을 반환한다.

**5**

- 5a. 신청을 찾을 수 없는 경우
  - 5a1. "신청을 찾을 수 없습니다" 오류 메시지를 출력한다.

**9**

- 9a. 관리자가 거절 버튼을 클릭하는 경우
  - 9a1. 시스템이 거절 사유 입력 창을 표시한다.
  - 9a2. 관리자가 거절 사유를 입력한다.
  - 9a3. 시스템이 신청 상태를 REJECTED로 변경한다 (`POST /api/ownership/admin/claims/{claimId}/reject`).
  - 9a4. 시스템이 거절 사유(rejectionReason)를 저장한다.
  - 9a5. 시스템이 검토자(admin)와 검토 시간(reviewedAt)을 기록한다.
  - 9a6. 시스템이 감사 로그를 생성한다 (REJECT_CLAIM 액션, 거절 사유 포함).
  - 9a7. 시스템이 사용자에게 거절 알림을 전송한다 (제목: "매물 신청 거절", 메시지: 거절 사유 포함).
  - 9a8. 시스템이 거절 완료 메시지를 표시한다.

**10**

- 10a. 관리자를 찾을 수 없는 경우
  - 10a1. "관리자를 찾을 수 없습니다" 오류 메시지를 출력한다.

**12**

- 12a. 이미 Property가 연결되어 있는 경우
  - 12a1. Property 생성을 건너뛴다.

**13**

- 13a. 매물 제목 중복 발생
  - 13a1. 제목 뒤에 번호를 추가한다 (예: "강남역 (1)", "강남역 (2)").
  - 13a2. 중복이 없을 때까지 번호를 증가시킨다.

---

**RELATED INFORMATION**

**Performance**

- ≤ 1 second (목록 조회)
- ≤ 1 second (상세 조회)
- ≤ 2 seconds (승인/거절 처리)
- Property 자동 생성 포함
- 감사 로그 및 알림 자동 생성

**Frequency**

- 관리자가 신청 검토 시마다
- 승인/거절 처리 시마다

**Concurrency**

- 제한없음
- 트랜잭션 관리로 데이터 일관성 보장
- 감사 로그로 모든 검토 이력 추적 가능
- 알림 시스템으로 사용자에게 실시간 전달

**Due Date**

- ***

# Use case 8. 매물 자동 생성

**GENERAL CHARACTERISTICS**

---

**Summary**

- 승인된 신청 정보를 기반으로 매물을 자동 생성한다.

**Scope**

**Level**

- System level

**Author**
**Last Update**

**Status**

- Implemented

**Primary Actor**

- 시스템 (관리자 승인 시 자동 실행)

**Preconditions**

- 매물 신청이 존재해야 함
- 관리자가 신청을 승인해야 함
- 신청 상태가 APPROVED로 변경되어야 함

**Trigger**

- 관리자가 신청 승인 버튼을 클릭하여 승인 처리가 완료될 때.

**Success Post Conditions**

- Property 엔티티가 데이터베이스에 생성됨
- 신청(OwnershipClaim)과 매물(Property)이 서로 참조됨 (양방향 관계)
- 매물 제목이 중복되지 않도록 자동 생성됨
- 매물과 사용자(소유자) 간 관계가 매핑됨
- 지도 좌표가 Property 엔티티에 저장됨
- 매물 상태가 AVAILABLE로 설정됨

**Failure Post Conditions**

- Property 엔티티가 생성되지 않음
- 신청과 매물 간 참조 관계가 설정되지 않음

---

**MAIN SUCCESS SCENARIO**

**Step** Action<br>
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

---

**EXTENSION SCENARIOS**
**Step** | Branching Action<br>
**2**

- 2a. 이미 Property가 연결되어 있는 경우
  - 2a1. Property 생성을 건너뛴다.
  - 2a2. 메서드를 종료한다.

**4**

- 4a. 건물명이 없는 경우
  - 4a1. 주소 정보를 확인한다.
  - 4a2. 주소를 공백으로 분리한다.
  - 4a3. 마지막 두 부분을 제목으로 사용한다 (동/구 정보).

**6**

- 6a. 주소도 없는 경우
  - 6a1. "매물"을 기본 제목으로 사용한다.

**8**

- 8a. 제목이 중복되는 경우
  - 8a1. 제목 뒤에 " (1)"을 추가한다.
  - 8a2. 여전히 중복이면 번호를 증가시킨다 " (2)", " (3)" 등.
  - 8a3. 중복이 없을 때까지 반복한다.

**13**

- 13a. 주소 정보가 없는 경우
  - 13a1. "주소 정보 없음"을 기본값으로 설정한다.

---

**RELATED INFORMATION**
**Performance**

- ≤ 1 second
- 제목 중복 체크를 위한 데이터베이스 조회
- 중복 시 반복 조회 (일반적으로 1-2회)

**Frequency**

- 신청 승인 시마다 자동 실행
- 승인 프로세스의 일부로 실행

**Concurrency**

- 제한없음
- 트랜잭션 내에서 실행되어 데이터 일관성 보장
- 제목 중복 체크로 동시성 문제 방지

**Due Date**

---
