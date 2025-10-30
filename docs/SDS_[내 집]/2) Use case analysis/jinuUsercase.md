# Use case 23. 위임 관리
**GENERAL CHARACTERISTICS**
* * *
**Summary**
* 매물 소유자가 브로커에게 판매 위임을 요청하고, 브로커가 이를 승인·거절·취소·삭제할 수 있는 기능.

**Scope**

**Level**
* User level

**Author**

**Last Update**

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
**MAIN SUCCESS SCENARIO**

**Step** Action<br>
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

**Scope**

**Level**
* User level

**Author**

**Last Update**

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
**MAIN SUCCESS SCENARIO**

**Step** Action<br>
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

# Use case 35. 중개인 목록 표시
**GENERAL CHARACTERISTICS**
* * *
**Summary**
* 등록된 중개인 목록과 상세 정보를 조회하고, 상세에서 연락/위임 의뢰로 연결하는 기능.

**Scope**

**Level**
* User level

**Author**
**Last Update**

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
**MAIN SUCCESS SCENARIO**

**Step** Action<br>
**S** | 사용자가 중개인 목록 아이콘을 클릭한다.<br>
**1** | 시스템이 등록된 중개인 전체 목록을 불러온다.<br>
**2** | 검색어가 없으면 전체 목록을 표시하고, 입력 시 필터링한다.<br>
**3** | 사용자가 특정 중개인의 상세 정보를 클릭한다.<br>
**4** | 시스템이 해당 중개인의 연락처, 면허번호, 소개, 리뷰, 거래 건수를 표시한다.<br>
**5** | 사용자는 상세의 ‘연락하기’ 버튼으로 메시지 또는 전화 연결을 시도하거나, 위임 요청으로 이동한다.<br>
* * *
**EXTENSION SCENARIOS**
**Step** | Branching Action<br>
**1**
* 1a. 네트워크 오류로 목록 로드 실패
    * 1a1. 재시도 버튼과 오류 메시지를 표시한다.

**4**
* 4a. 상세 정보 중 일부 누락
    * 4a1. 이용 가능한 정보만 표시하고, 누락 데이터는 추후 갱신한다.

**5**
* 5a. 연락 권한 미허용
    * 5a1. 권한 요청 안내 또는 대체 연락 수단을 제공한다.
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

# Use case 38. 전세가율 계산기
**GENERAL CHARACTERISTICS**
* * *
**Summary**
* 매물의 전세가율(전세가/매매가×100)을 계산하고, 주변 평균 및 AI 예측을 활용해 표시하는 기능.

**Scope**

**Level**
* User level

**Author**
**Last Update**

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
**MAIN SUCCESS SCENARIO**

**Step** Action<br>
**S** | 사용자가 매물 상세 페이지에 진입한다.<br>
**1** | 시스템이 DB에서 전세가와 매매가를 조회한다.<br>
**2** | 시스템이 전세가/매매가×100을 계산하고 소수점 둘째 자리로 반올림한다.<br>
**3** | 주변 매물 전세가율 평균을 조회하여 비교 결과(높음/낮음)를 산출한다.<br>
**4** | 매매가 데이터가 없으면 AI 예측 매매가를 사용해 “AI 예측 전세가율”로 표시한다.<br>
**5** | 계산 결과와 비교 정보를 상세 페이지에 표시한다.<br>
* * *
**EXTENSION SCENARIOS**
**Step** | Branching Action<br>
**2**
* 2a. 전세가 또는 매매가 데이터가 없음
    * 2a1. AI 예측 값을 사용하고, 실패 시 “정보 없음”으로 표시한다.

**3**
* 3a. 주변 매물 데이터 부족
    * 3a1. 평균 비교 없이 전세가율만 표시한다.

**4**
* 4a. 계산 오류 발생
    * 4a1. 오류 메시지를 표시하고 재시도 버튼을 제공한다.
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
