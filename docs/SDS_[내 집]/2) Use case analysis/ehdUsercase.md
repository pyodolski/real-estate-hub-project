# Use case 26. 지도 매물 시각화
**GENERAL CHARACTERISTICS**
* * *
**Summary**
* 사용자의 지도 화면에 매물 위치를 아이콘으로 표시한다.

**Scope**

**Level**
* User level

**Author**
**Last Update**

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
**MAIN SUCCESS SCENARIO**

**Step** Action<br>
**S** | 사용자가 지도를 띄운다<br>
**1** | 시스템이 현재 지도 뷰포트(BBOX: south, west, north, east)와 필터(상태, 가격 범위 등)를 읽는다.<br>
**2** | 시스템이 Supabase(PostgREST)로 매물 목록을 조회한다. (BBOX + 상태 필터, 페이지네이션)<br>
**3** | 시스템이 결과를 상태별 컬러 규칙에 따라 마커/클러스터로 렌더링한다.<br>
**4** | 사용자가 마커를 탭하면 시스템이 properties, property_images, property_offers에서 상세를 조회하여 하단 시트/카드에 표시한다.<br>
* * *
**EXTENSION SCENARIOS**
**Step** | Branching Action<br>
**1**
* 1a. 네이버 지도 API를 이용하여 지도를 띄운다
	* 1a1. 일정 시간 후 지도를 재조회 하여 새로운 정보를 받아와 지도에 띄운다.
	* 1a2. 지도의 줌/팬 이벤트 발생 시 범위 재조회 및 마커 갱신한다.

**1**
* 1b. 등록된 매물의 위치 정보를 불러와 지도에 마커와 함께 표시한다.
	* 1b1. 매물의 상태 정보 [available|pending|sold]을 기준으로 색상을 달리하며 마커의 색상을 변경한다.
	* 1b2. 매물 클릭시 매물의 정보를 properties , property_images, property_offers table에서 받아와 각 정보를 띄운다.

**3**
* 3a.로그인을 하지않아 토큰이 없으면 실패한다.
	* 3a1.토큰이 없다는 메시지를 출력한다.
	* 3a2.아이디 입력단계로 돌아간다.

**3**<br>
* 3b.지도 호출을 실패한다.
	* 3b1. 재시도 및 오률를 출력한다
* * *
**RELATED IMFORMATION**
**Performance**
* ≤ 1 second

**Frequency**
* 지도를 호출할 때 마다

**Concurrency**
* 제한없음

**Due Date**
* * *
* * *
# Use case 27. 사용자 위치 표시
**GENERAL CHARACTERISTICS**
* * *
**Summary**
* 사용자의 현재 위치를 지도에 표시한다.

**Scope**

**Level**
* User level

**Author**
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
* * *
**MAIN SUCCESS SCENARIO**

**Step** Action<br>
**S** | 사용자가 지도를 띄운다<br>
**1** | 시스템이 위치 권한 상태를 확인한다.<br>
**2** | 권한이 허용되어 있으면 현재 GPS 좌표를 획득한다.<br>
**3** | 지도 중심을 현재 위치로 이동하고 마커로 표시한다.<br>
**4** | 사용자가 ‘현재 위치 고정’ 버튼을 클릭하면 현재 중심 좌표를 DB에 저장한다.<br>
* * *
**EXTENSION SCENARIOS**
**Step** | Branching Action<br>
**1**
* 1a. 위치 권한이 비활성화된 경우
	* 1a1. 권한 요청 팝업을 표시한다.
	* 1a2. 거부 시 기본 중심(시청 좌표)으로 이동한다.

**2**
* 2a. GPS 신호를 받지 못한 경우.
	* 2a1. 마지막 저장된 사용자 위치를 불러와 중심으로 이동한다.
	* 2a2. 마지막 위치 정보도 없을 경우 시청 좌표로 이동한다.

* * *
**RELATED IMFORMATION**
**Performance**
* ≤ 1 second

**Frequency**
* 지도 진입 또는 '현재 위치' 버튼 클릭 시마다

**Concurrency**
* 제한없음

**Due Date**

* * *
* * *

**Use case 28. 지도 매물 즐겨찾기**
**GENERAL CHARACTERISTICS**
* * *
**Summary**
* 즐겨찾기 등록/조회/삭제 기능을 통해 사용자가 관심 매물을 관리한다.

**Scope**

**Level**
* User level

**Author**
**Last Update**

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
**MAIN SUCCESS SCENARIO**

**Step** Action<br>
**S** | 사용자가 즐겨찾기 탭을 클릭한다<br>
**1** | 시스템이 현재 로그인 된 사용자의 토큰을 검증한다.<br>
**2** | favorites 테이블에서 해양 사용자 id와 일치하는 즐겨찾기 목록을 조회한다.<br>
**3** | 지도에 즐겨찾기 매물들을 하트 표시된 상태로 표시한다.<br>
**4** | 사용자가 즐겨찾기 매물 클릭 시 지도 중심을 해당 매물 좌표로 이동시키고 상세정보 패널을 표시한다.<br>
* * *
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

* * *
**RELATED IMFORMATION**
**Performance**
* ≤ 1 second

**Frequency**
* 즐겨찾기 탭 또는 버튼 클릭 시

**Concurrency**
* 제한없음

**Due Date**

* * *
* * *

# Use case 29. 매물 상세정보 표시
**GENERAL CHARACTERISTICS**
* * *
**Summary**
* 마커 클릭 시 매물의 상세종보를 사이드 바로 표시한다.

**Scope**

**Level**
* User level

**Author**
**Last Update**

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
**MAIN SUCCESS SCENARIO**

**Step** Action<br>
**S** | 사용자가 지도에서 마커를 클릭한다.<br>
**1** | 시스템이 클릭된 마커의 property_id를 획득한다.<br>
**2** | Supabase API를 호출하여 properties, property_images, property_offers, favorite 정보를 받아온다..<br>
**3** | 받은 정보를 사이드바에 렌더링 한다.<br>
* * *
**EXTENSION SCENARIOS**
**Step** | Branching Action<br>
**1**
* 1a. 매물 정보 소회 실패
	* 1a1. 실패 메시지를 표시하고 화면을 새로고침한다.
	* 1a2. 재시도 버튼 제공공.

**2**
* 2a. GPS 신호를 받지 못한 경우.
	* 2a1. 마지막 저장된 사용자 위치를 불러와 중심으로 이동한다.
	* 2a2. 마지막 위치 정보도 없을 경우 시청 좌표로 이동한다.

* * *
**RELATED IMFORMATION**
**Performance**
* ≤ 1 second

**Frequency**
* 마커 클릭시 마다

**Concurrency**
* 제한없음

**Due Date**

* * *
* * *

# Use case 30. 필터
**GENERAL CHARACTERISTICS**
* * *
**Summary**
* 매물을 필터링 한다.

**Scope**

**Level**
* User level

**Author**
**Last Update**

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
**MAIN SUCCESS SCENARIO**

**Step** Action<br>
**S** | 사용자가 필터를 지정 후 버튼을 클릭한다<br>
**1** | 시스템이 property_offers 및 properties 테이블에서 조건에 맞는 매물을 조회한다.<br>
**2** | 결과를 지도에 표시하고 건물 상태에 따라 다르게 표시한다..<br>
**3** | 필터가 없는 경우 모든 매물을 표시한다..<br>
**4** | 필터가 적용된 경우 필터에 파랗게 된다.<br>
* * *
**EXTENSION SCENARIOS**
**Step** | Branching Action<br>
**1**
* 1a. 종합 필터 적용
	* 1a1. 모든 조건을 한 번에 지정 후 적용 버튼 클릭 시 필터가 적용된다.
	* 1a2. 결과 매물만 지도에 표시된다.

**1**
* 1b. 위치 검색
	* 1b1. 위치를 검색한다.
   	* 1b2. 관련된 위치가 하단에 표시된다.
   	* 1b3. 위치 클릭 시 그 위치를 데이터를 받아와 지도 중심을 이동한다.

**2**
* 2a. 필터 저장 실패.
	* 2a1. 필터 지정 실패 시 오류 메시지를 출력하고 필터가 해제된다.

* * *
**RELATED IMFORMATION**
**Performance**
* ≤ 1 second

**Frequency**
* 필터 지정정 시마다

**Concurrency**
* 제한없음

**Due Date**


* * *
* * *

# Use case 34. 추천 매물
**GENERAL CHARACTERISTICS**
* * *
**Summary**
* 알고리즘을 통한 사요자의 관심사와 선호도를 분석하여 개인화된 매물을 추천한다.

**Scope**

**Level**
* User level

**Author**
**Last Update**

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
**MAIN SUCCESS SCENARIO**

**Step** Action<br>
**S** | 사용자가 로그인한다.<br>
**1** | 사용자가 열람한 매물 수를 확인한다.<br>
**2** | 매물 클릭 시 DB에 사용한 !D, 매물 !D 속성 정보를 저상한다.<br>
**3** | 열람 매물 수가 기준 이상이 되거나 이전에 저장해놓은 선호도가 있다면 추천 계산 트리거가 발생한다.<br>
**4** | 수집 데이터의 유효성 검증 → 원-핫 인코딩/정규화 처리 → 벡터화 수행.<br>
**5** | 전체 매물 베터와 사용자 벡터 간 유사도를 계산한다.<br>
**7** | 유사도 순으로 정렬 후 추천매물 섹션에 표시한다.<br>
**9** | 새 매물 클릭 시 재계산 및 재정렬 수행.<br>
**10** | 일정 매물 추가 조회시 추천 계산 트리거가 재 조회된다.<br>
* * *
**EXTENSION SCENARIOS**
**Step** | Branching Action<br>
**1**
* 1a. 위치 권한이 비활성화된 경우
	* 1a1. 권한 요청 팝업을 표시한다.
	* 1a2. 거부 시 기본 중심(시청 좌표)으로 이동한다.

**2**
* 2a. GPS 신호를 받지 못한 경우.
	* 2a1. 마지막 저장된 사용자 위치를 불러와 중심으로 이동한다.
	* 2a2. 마지막 위치 정보도 없을 경우 시청 좌표로 이동한다.

* * *
**RELATED IMFORMATION**
**Performance**
* ≤ 1 second

**Frequency**
* 지도 진입 또는 '현재 위치' 버튼 클릭 시마다

**Concurrency**
* 제한없음

**Due Date**
