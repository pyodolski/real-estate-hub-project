# Use case 9. 채팅방 접속 및 생성
    **GENERAL CHARACTERISTICS**
* * *
**Summary**
* 사용자가 매물 상세 페이지에서 채팅방에 접속하거나, 없을 경우 새로운 채팅방을 생성한다.

**Scope**<br>
**Level**
* user level

**Author**
* 김도림

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
* 김도림

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
* 김도림

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
* 김도림

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

**Author**
* 김도림

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


# Use case 19. 매물 목록 조회 (전체)
**GENERAL CHARACTERISTICS**
* * *
**Summary**
* 사용자가 등록된 매물을 전체 목록으로 확인한다.

**Scope**<br>
**Level**
* user level

**Author**
* 김도림

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

**Author**
* 김도림

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

**Author**
* 김도림

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

**Author**
* 김도림

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