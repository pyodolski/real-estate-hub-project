# RealEstate Recommender – Web Prototype

[브라우저 / 앱] ⇄ [Spring Boot 추천 API]  
├── PropertyRepository (매물 DB)  
├── UserRepository (문진/로그 DB)  
├── RecommendService (벡터 계산, 코사인 유사도)  
└── FeedbackController (로그 저장)  

## 파일 구조

realestate-reco-java/  
└─ main/  
  ├─ java/com/example/app/  
  │  ├─ controller/RecommendController.java  
  │  ├─ service/  
  │  │  ├─ PropertyVectorService.java  
  │  │  ├─ UserVectorService.java  
  │  │  └─ RecommendService.java  
  │  ├─ model/  
  │  │  ├─ Property.java  
  │  │  └─ User.java  
  │  ├─ util/MathUtils.java  
  │  └─ data/SampleData.java  
  └─ resources/application.yml  



## 5) 확장 아이디어
- 외부 데이터 결합(상권/학군/안전/교통), 모델 기반 잠재속성 추정
- MiniBatch KMeans 야간 재학습, Redis 캐시, Postgres 저장
- 공정성/가격대 분산 제약, 밴딧 탐험

## 로직
- PropertyVectorService → **매물(부동산)**을 9차원 벡터로 변환
- UserVectorService → **사용자(선호도)**를 9차원 벡터로 변환
- RecommendService → 두 벡터의 유사도 계산 및 정렬 → 추천 목록 생성
- MathUtils → 벡터 연산 유틸 (정규화, 유사도, 값 제한)

## 건물에 대한 점수 가중치 - 이후 변경 가능
- 0	| traffic_access | 1.2 - distSubway/1000 - distBus/800 | 지하철·버스 접근성 (거리 짧을수록 +)
- 1 | green_park | 1 - distPark/1000 | 공원 근접도
- 2	| school_quality | (schoolDensity - 0.5)*2	 | 학군 밀도 (0~1 스케일)
- 3	| nightlife | (nightlifeDensity - 0.3)*2 | 유흥가 밀집 정도
- 4	|quietness | 0.6 * green - 0.7 * (trafficVolume-0.5) - 0.8 * nightlife | 조용함 (공원 +, 교통/유흥 -)
- 5 |sunshine | 0.5*(남향) + 0.05*층수 | 채광 (남향 + 고층 +)
- 6	|elevator_needed | (floorsTotal - 5)/15 | 건물층수 높을수록 엘리베이터 필요
- 7	|high_floor_view | (floor - 7)/10 | 고층 뷰 선호
- 8 | budget_fit | 0.8 - priceMillion/1500 | 예산 적합도 (가격 낮을수록 +)

- MathUtils.l2norm() 으로 전체 벡터를 단위벡터(norm=1)로 정규화



## 사용자 선호도 가중치 - 이후 변경가능
- 0 | traffic_access | prefTraffic * 0.8 | 교통 접근성 선호
- 1	| green_park | prefPark * 0.8 | 공원 선호
- 2	| school_quality | prefSchool * 0.7 | 학군 선호
- 3	| nightlife | -dislikeNightlife * 0.8	| 유흥 기피(선호 음수)
- 5	| sunshine | prefSunshine * 0.6 | 채광 선호
- 6	| elevator_needed | prefElevator * 0.5 | 엘리베이터 필요
- 7	| high_floor_view | prefHighFloor * 0.6 | 고층뷰 선호
- 8	| budget_fit | -diff * 0.7 (diff = (targetPrice - budget)/budget) | 예산 대비 적합도
- 4?| lightness | if (v[4] > 0 && v[3] > 0) { v[4] *= 0.7; v[3] *= 0.5; } | 밝기 //사용자의 응답(선호/기피/예산)을
  벡터 형태로 수치화한 것.

🔹 cosine(a, b)

코사인 유사도 계산:

similarity = 𝑎⋅𝑏 / ∣∣𝑎∣∣∣∣𝑏∣∣

두 벡터의 방향이 얼마나 비슷한지 측정 (1.0이면 완전 동일, -1.0이면 반대)

🔹 l2norm(v)

벡터 정규화:



벡터 길이를 1로 맞춰 방향만 유지
🔹 clamp(v, lo, hi)
값을 일정 범위에 제한

RecommendService — 추천 계산
이 클래스는 위 두 서비스를 이용해
실제로 추천 점수를 계산하고 상위 N개를 반환합니다.


user 가중치 table

create table user_property_preferences (
user_id     bigint primary key,
pref_vector double precision[],   -- 최소 구조
updated_at  timestamp default now()
);


공용 가중치 table

create table recommender_feature_weights (
id         serial primary key,
name       text not null,
weights    double precision[],
updated_at timestamp default now()
);


공용 디폴트 가중치
insert into recommender_feature_weights(name, weights)
values(
'default',
'{
1.0,   -- IDX_PRICE
1.0, 1.0, 1.0,   -- SALE, JEONSE, WOLSE
1.2, 1.0, 1.0,   -- APART, VILLA, ONE
1.0,             -- AREA
1.3,             -- OPTION
1.5              -- SUBWAY_DISTANCE
}'
);