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

즐겨찾기를 조회한다	
	즐겨찾기 탭 클릭 시 저장된 즐겨찾기 목록을 조회하여 표시한다,
	현재 로그인된 아이디의 토큰을 받아와 그와 일치하는 즐겨찾기 매물을 표시한다.
조회된 매물 정보 확인한다	
	즐겨찾기 목록 항목 클릭 시 지도 중심을 해당 매물 좌표로 이동하고 상세정보 창을 연다.
정보확인에 실패한다	
	정보 확인 실패시 실패 원인과 함께 상단에 띄운다.
즐겨찾기 추가한다	
	매물에서 하트 버튼을 클릭시 즐겨찾기 클릭시 현재 로그인된 아이디의 토큰으로 id를 받아와서 즐겨찾기에 등록한다.
	즐겨찾기 등록시 즐겨찾기 하트 버튼 빨간색으로 변한뒤 favorites table에서 data를 추가한다.
즐겨찾기 제거한다	
	빨같게 켜져있는 즐겨찾기 버튼을 클릭시 현재 로그인이 되어있는 아이디의 토큰을 받아와서 즐겨찾기를 해재한다.
	즐겨찾기 해제시 즐겨찾기 하트 버튼 회색으로 변한뒤 favorites table에서 data를 지운다.

* * *
* * *

**Use case 29. 매물 상세정보 표시**
매물 클릭시 매물 정보표시창를 표시한다	
	마커 클릭시 property_id를 획득하고 api로 호출하여 세부 정보를 수신 받는다.
	수신 받은 정보를 사이드바에 렌더링하여 표시한다.
매물 정보 표시를 실패한다	 
	매물 정보 표시 실패시 실패 표시와 함께 화면을 새로고침 한다.

* * *
* * *

**Use case 30. 필터**
개별 필터를 지정한다	
	필터를 지정시 매물 property_offers, properties의 정보를 받아와서 지도에 그의 맞는 매물 표시한다.
	필터 등록된 정보는 지도가 재호출 될때는 버튼 클릭을 완료시에 지정된다.
	필터를 지정하지 않으면 모든 매물을 띄운다.
종합 필터를 지정한다	
	모든 필터를 한번에 지정후 적용 버튼을 클릭시 필터가 적용된다.
필터 지정에 실패한다	
	필터 지정 실패시 오류 메시지와 함께 필터가 헤제된다.

**Use case 34. 추천 매물**
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

AI 기반 알고리즘을 통해 사용자의 관심사와 선호도를 분석하여 개인화된 매물을 추천하는 기능	
	사용자가 로그인하면 왼쪽 카드 패널의 추천매물 섹션에 접근이 가능하다.
	일정 개수의 매물을 보기 전이라면 현재까지 클릭한 매물 수를 표시한다.
	사용자가 매물을 클릭하여 상세페이지에 진입할 때, DB에 자동으로 사용자 ID, 매물ID + 매물 속성 정보를 저장한다.
	조회한 매물 수가 일정 개수 이상이 되었는지 확인 후, 되었다면 계산하는 트리거가 발동된다.
	수집된 데이터의 유효성 검증, 범주형 데이터의 원-핫 인코딩 변환, 수치형 데이터는 정규화 처리를 수행한다.
	전체 매물 DB의 모든 매물을 동일한 방식으로 벡터화한다.
	각 벡터와 사용자 프로필 벡터 간의 유사도를 계산하여 높은 순서대로 매물을 정렬한다.
	추천 매물 섹션에 정렬된 순서대로 매물을 표시한다.
	다른 매물을 클릭하면 다시 계산해서 높은 순서대로 재정렬한다.
	같은 매물을 한 번 더 조회하게 되면 별도의 감점을 줘서 추천 매물에 표시가 되지 않게 한다.
