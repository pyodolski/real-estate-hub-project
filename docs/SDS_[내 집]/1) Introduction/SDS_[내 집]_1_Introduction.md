# 1. Introduction

[cite_start]본 문서는 우리 팀에서 개발한 부동산 중개 플랫폼인 'Real Estate Hub'의 Software Design Specification(SDS)이다. [cite: 3664]
[cite_start]본 문서에서는 Real Estate Hub를 위해 기존에 식별한 기능적 요구사항을 구현하기 위해 시스템을 여러 관점에서 바라보고 설계한다. [cite: 3665]
[cite_start]Use case analysis는 사용자 관점에서 시스템이 사용자에게 제공하는 기능을 나타내고, Class diagram은 시스템 소프트웨어의 클래스 간 관계를 나타낸다. [cite: 3666]
Sequence diagram과 State machine diagram은 시스템의 동적 관점을 묘사했다. [cite_start]User interface prototype은 시스템에서 사용자가 접하는 UI들에 관해 서술한다. [cite: 3667]

[cite_start]Real Estate Hub는 부동산 거래의 모든 참여자들을 위한 종합 플랫폼이다. [cite: 3668]
[cite_start]일반 사용자는 매물을 검색하고, 관심 매물을 관리하며, 브로커에게 중개를 요청할 수 있다. [cite: 3669]
브로커는 자신의 프로필을 관리하고, 의뢰를 받아 처리하며, 고객과 실시간으로 소통할 수 있다. [cite_start]관리자는 시스템 전체를 모니터링하고 매물과 사용자를 관리한다. [cite: 3670]
[cite_start]시스템은 네이버 지도 API를 활용한 지도 기반 검색, 실시간 채팅, 알림 시스템, 매물 비교 기능 등 현대적인 부동산 플랫폼에 필요한 모든 핵심 기능을 제공한다. [cite: 3671]

본 문서 작성 시 가장 중요하게 생각한 점은 Diagram 간의 일관성이다. [cite_start]즉 여러 Diagram 간 모순되는 부분이 없도록 주의하여 작성했다. [cite: 3672]
[cite_start]예를 들어, 특정 기능의 Sequence diagram에서 사용된 object와 message는 모두 같은 기능의 Class diagram에 있는 association, attribute, operation과 일치한다. [cite: 3673]
또한 Sequence diagram의 흐름은 Use case description의 main success scenario와 일치한다. [cite_start]이러한 일관성은 각 장마다 다시 설명한다. [cite: 3674]
[cite_start]또한 이전 단계에서 산출된 SRS 문서에 작성된 기능들이 빠짐없이 Diagram에 반영되어 작성되었는지를 확인하고 SRS 문서와 본 문서 간의 차이 또는 모순이 없도록 하였다. [cite: 3675]

[cite_start]Real Estate Hub는 크게 백엔드 서버와 프론트엔드 웹 애플리케이션으로 구성되어 있다. [cite: 3676]
[cite_start]백엔드는 Spring Boot 프레임워크를 기반으로 한 Java 애플리케이션으로 개발되었으며, RESTful API 아키텍처를 따른다. [cite: 3677]
[cite_start]데이터베이스로는 MySQL을 사용하며, JPA(Java Persistence API)를 통해 객체 관계 매핑을 구현했다. [cite: 3678]
[cite_start]인증 시스템은 JWT(JSON Web Token) 기반으로 구현되어 있으며, Spring Security를 활용하여 세밀한 권한 관리를 제공한다. [cite: 3679]
[cite_start]프론트엔드는 바닐라 JavaScript로 구현된 Single Page Application(SPA)이다. [cite: 3680]

[cite_start]시스템 아키텍처는 도메인 주도 설계(Domain-Driven Design, DDD) 원칙을 따르며, 각 도메인은 독립적인 패키지로 구성되어 있다. [cite: 3681]
[cite_start]주요 도메인으로는 인증(auth), 사용자(user), 브로커 프로필(broker_profile), 매물(property), 채팅(chat), 알림(alert, notification), 중개 위임(delegation), 소유권 검증(ownership), 매물 비교(preference) 등이 있다. [cite: 3681]
[cite_start]각 도메인은 자신만의 엔티티, 서비스, 컨트롤러, DTO를 가지며, 명확한 책임 분리를 통해 유지보수성과 확장성을 높였다. [cite: 3682]

[cite_start]보안은 시스템 설계의 핵심 고려사항이다. [cite: 3683]
[cite_start]비밀번호는 BCrypt 알고리즘으로 암호화되어 저장되며, 모든 API 요청은 JWT 토큰을 통해 인증된다. [cite: 3683]
[cite_start]액세스 토큰은 1시간의 짧은 수명을 가지며, 리프레시 토큰은 HttpOnly 쿠키로 전송되어 XSS 공격으로부터 보호된다. [cite: 3684]
[cite_start]Spring Security의 필터 체인을 통해 요청별 권한 검증이 이루어지며, 역할 기반 접근 제어(RBAC)를 통해 사용자 유형에 따른 기능 제한이 구현되어 있다. [cite: 3685]

데이터베이스 설계는 정규화 원칙을 따르면서도 성능을 고려한 최적화가 이루어졌다. [cite_start]모든 엔티티는 BaseEntity를 상속받아 생성일시와 수정일시를 자동으로 추적하며, 이는 감사(audit) 추적과 데이터 관리에 중요한 역할을 한다. [cite: 3686]
[cite_start]관계형 데이터베이스의 외래키 제약조건을 적극 활용하여 데이터 무결성을 보장하며, JPA의 지연 로딩(Lazy Loading)을 통해 불필요한 데이터 조회를 최소화했다. [cite: 3687]

[cite_start]시스템의 핵심 기능 중 하나인 지도 기반 검색은 네이버 지도 API와의 통합을 통해 구현되었다. [cite: 3688]
[cite_start]사용자는 지도에서 직접 매물을 탐색할 수 있으며, 필터링 기능을 통해 원하는 조건의 매물만 표시할 수 있다. [cite: 3689]
[cite_start]사용자의 마지막 지도 상태(위치, 줌 레벨)는 UserMapState 엔티티에 저장되어, 재접속 시 동일한 화면에서 시작할 수 있도록 하여 사용자 경험을 크게 향상시켰다. [cite: 3690]

실시간 기능 구현을 위해 WebSocket 프로토콜을 사용한다. [cite_start]채팅 시스템은 양방향 통신을 통해 실시간 메시지 전송을 지원하며, 알림 시스템 역시 실시간으로 사용자에게 중요한 정보를 전달한다. [cite: 3691]
[cite_start]알림은 가격 기반 알림과 점수 기반 알림으로 나뉘며, 사용자가 설정한 조건에 맞는 매물이 등록되거나 변경될 때 자동으로 발송된다. [cite: 3692]

본 문서의 구성은 다음과 같다. [cite_start]2장에서는 Use case analysis를 통해 시스템이 제공하는 모든 기능을 사용자 관점에서 서술한다. [cite: 3693]
3장의 Class diagram에서는 시스템의 정적 구조를 다양한 관점에서 표현한다. [cite_start]4장의 Sequence diagram에서는 주요 기능의 실행 흐름을 시간 순서대로 보여준다. [cite: 3694]
5장의 State machine diagram에서는 시스템의 상태 변화를 모델링한다. [cite_start]6장의 User interface prototype에서는 실제 사용자가 접하게 될 화면들을 제시한다. [cite: 3695]
[cite_start]7장에서는 Implementation requirements를 다루고, 8장의 Glossary에서 주요 용어를 정의하며, 9장의 References에서 참고 자료를 제시한다. [cite: 3696]

[cite_start]본 문서는 개발팀의 구현 가이드이자 시스템 이해를 위한 핵심 문서로 활용될 것이다. [cite: 3697]
[cite_start]SRS 문서에서 정의된 요구사항이 어떻게 설계 수준에서 구체화되었는지를 보여주며, 향후 시스템 확장이나 유지보수 시 중요한 참고 자료가 될 것이다. [cite: 3698]
[cite_start]특히 Class diagram과 Sequence diagram은 실제 코드 구현과 직접적으로 연결되므로, 개발 과정에서 지속적으로 참조되어야 한다. [cite: 3699]