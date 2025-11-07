# 1. 인증 및 사용자 관리 관련

# User 클래스

```mermaid
classDiagram
  %% --- 부모 클래스 정의 (상속 관계) ---
  class BaseEntity {
    +createdAt: LocalDateTime
    +updatedAt: LocalDateTime
  }

  %% --- User 클래스 정의 ---
  class User {
    %% 클래스 설명: 일반 사용자의 기본 정보와 인증 정보를 관리
    -userId: Long
    -email: String
    -password: String
    -name: String
    -phoneNumber: String
    -role: UserRole
    -isActive: boolean
    %% createdAt, updatedAt은 BaseEntity로부터 상속받음
    
    %% --- Operations ---
    +updateProfile(name: String, phoneNumber: String): void
    +changePassword(currentPw: String, newPw: String): boolean
    +validatePassword(password: String): boolean
    +deactivateAccount(): void
    +getRole(): UserRole
  }

  %% --- 관계 정의 ---
  BaseEntity <|-- User : 상속 (Inheritance)
```

## 1.1. class description
일반 사용자의 기본 정보와 인증 정보를 관리하는 클래스이다. 회원가입, 로그인, 프로필 수정 등 사용자와 관련된 핵심 정보를 담고 있으며, 모든 사용자 유형의 기본이 되는 클래스이다.

## 1.2. attribution 구분

### 1.2.1. userId
* **name**: userId
* **type**: Long
* **visibility**: private
* **description**: 사용자를 고유하게 식별하기 위한 primary key로, 데이터베이스에서 자동 생성되는 사용자의 고유 ID이다.

### 1.2.2. email
* **name**: email
* **type**: String
* **visibility**: private
* **description**: 사용자의 이메일 주소로 로그인 ID로 사용되며, 시스템 내에서 고유해야 한다. 이메일 인증 및 알림 발송에도 사용된다.

### 1.2.3. password
* **name**: password
* **type**: String
* **visibility**: private
* **description**: BCrypt 알고리즘으로 암호화된 사용자의 비밀번호이다. 평문으로 저장되지 않으며, 보안을 위해 암호화된 형태로만 데이터베이스에 저장된다.

### 1.2.4. name
* **name**: name
* **type**: String
* **visibility**: private
* **description**: 사용자의 실명이다. 거래 시 본인 확인 및 계약서 작성에 사용되는 중요한 정보이다.

### 1.2.5. phoneNumber
* **name**: phoneNumber
* **type**: String
* **visibility**: private
* **description**: 사용자의 휴대폰 번호로, 연락처 확인 및 SMS 알림 발송에 사용된다.

### 1.2.6. role
* **name**: role
* **type**: UserRole
* **visibility**: private
* **description**: 사용자의 권한 수준을 나타내는 열거형 변수이다. GENERAL, BROKER, ADMIN 중 하나의 값을 가지며, 접근 권한 제어에 사용된다.

### 1.2.7. isActive
* **name**: isActive
* **type**: boolean
* **visibility**: private
* **description**: 사용자 계정의 활성화 상태를 나타낸다. false인 경우 로그인이 차단되며, 계정 정지나 탈퇴 시 사용된다.

### 1.2.8. createdAt
* **name**: createdAt
* **type**: LocalDateTime
* **visibility**: private
* **description**: 사용자 계정이 생성된 날짜와 시간이다. BaseEntity로부터 상속받아 자동으로 설정된다.

### 1.2.9. updatedAt
* **name**: updatedAt
* **type**: LocalDateTime
* **visibility**: private
* **description**: 사용자 정보가 마지막으로 수정된 날짜와 시간이다. BaseEntity로부터 상속받아 자동으로 업데이트된다.

## 1.3. Operations 구분

### 1.3.1. updateProfile
* **name**: updateProfile
* **type**: void
* **visibility**: public
* **description**: 사용자의 프로필 정보(이름, 전화번호 등)를 수정하는 메서드이다. 이메일과 비밀번호를 제외한 기본 정보를 업데이트한다.

### 1.3.2. changePassword
* **name**: changePassword
* **type**: boolean
* **visibility**: public
* **description**: 현재 비밀번호를 확인한 후 새로운 비밀번호로 변경하는 메서드이다. 변경 성공 시 true를 반환한다.

### 1.3.3. validatePassword
* **name**: validatePassword
* **type**: boolean
* **visibility**: public
* **description**: 입력받은 평문 비밀번호가 저장된 암호화된 비밀번호와 일치하는지 BCrypt를 통해 검증하는 메서드이다.

### 1.3.4. deactivateAccount
* **name**: deactivateAccount
* **type**: void
* **visibility**: public
* **description**: 사용자 계정을 비활성화하는 메서드이다. isActive를 false로 설정하여 로그인을 차단한다.

### 1.3.5. getRole
* **name**: getRole
* **type**: UserRole
* **visibility**: public
* **description**: 현재 사용자의 권한 수준을 반환하는 getter 메서드이다. 권한 검증 시 사용된다.



# Broker 클래스

```mermaid
classDiagram
  %% --- 연관된 클래스 (이름만 표시) ---
  class User {
    %% 2.2.2. Broker가 OneToOne으로 참조하는 User 객체
  }

  class BrokerProfile {
    %% 2.3.5. getBrokerProfile()이 반환하는 객체
  }

  %% --- Broker 클래스 상세 정의 ---
  class Broker {
    %% 2.1. class description: 브로커 사용자의 정보 관리
    -brokerId: Long
    -user: User
    -licenseNumber: String
    -agency: String
    -experienceYears: int
    -specialization: String
    -averageRating: double
    -totalReviews: int
    -isVerified: boolean
    
    +updateBrokerProfile(agency: String, exp: int, spec: String): void
    +calculateAverageRating(): void
    +incrementReviewCount(): void
    +verifyBroker(): void
    +getBrokerProfile(): BrokerProfile
  }

  %% --- 관계 정의 ---
  Broker "1" -- "1" User : OneToOne 연관
  Broker ..> BrokerProfile : 사용 (Returns)
```

## 2.1. class description
브로커 사용자의 정보를 관리하는 클래스이다. User 클래스를 상속받아 일반 사용자의 모든 속성을 포함하며, 브로커 고유의 프로필 정보와 자격증 정보를 추가로 관리한다.

## 2.2. attribution 구분

### 2.2.1. brokerId
* **name**: brokerId
* **type**: Long
* **visibility**: private
* **description**: 브로커를 고유하게 식별하기 위한 primary key이다. userId와는 별도로 관리된다.

### 2.2.2. user
* **name**: user
* **type**: User
* **visibility**: private
* **description**: 연관된 User 객체에 대한 참조이다. OneToOne 관계로 브로커의 기본 사용자 정보를 담고 있다.

### 2.2.3. licenseNumber
* **name**: licenseNumber
* **type**: String
* **visibility**: private
* **description**: 브로커의 부동산 중개사 자격증 번호이다. 브로커 자격 검증에 필수적인 정보이다.

### 2.2.4. agency
* **name**: agency
* **type**: String
* **visibility**: private
* **description**: 브로커가 소속된 부동산 중개업소의 이름이다.

### 2.2.5. experienceYears
* **name**: experienceYears
* **type**: int
* **visibility**: private
* **description**: 브로커의 경력 연수이다. 프로필에 표시되어 신뢰도 판단 지표로 사용된다.

### 2.2.6. specialization
* **name**: specialization
* **type**: String
* **visibility**: private
* **description**: 브로커의 전문 분야이다. 예를 들어 아파트, 상가, 오피스텔 등의 특화 분야를 나타낸다.

### 2.2.7. averageRating
* **name**: averageRating
* **type**: double
* **visibility**: private
* **description**: 브로커가 받은 리뷰들의 평균 평점이다. 0.0부터 5.0까지의 값을 가진다.

### 2.2.8. totalReviews
* **name**: totalReviews
* **type**: int
* **visibility**: private
* **description**: 브로커가 받은 총 리뷰 개수이다. 신뢰도 판단에 사용된다.

### 2.2.9. isVerified
* **name**: isVerified
* **type**: boolean
* **visibility**: private
* **description**: 브로커의 자격증 및 소속 업소가 관리자에 의해 검증되었는지 여부를 나타낸다.

## 2.3. Operations 구분

### 2.3.1. updateBrokerProfile
* **name**: updateBrokerProfile
* **type**: void
* **visibility**: public
* **description**: 브로커의 프로필 정보(소속 업소, 전문 분야, 경력 등)를 수정하는 메서드이다.

### 2.3.2. calculateAverageRating
* **name**: calculateAverageRating
* **type**: void
* **visibility**: public
* **description**: 브로커가 받은 모든 리뷰의 평점을 계산하여 averageRating을 업데이트하는 메서드이다.

### 2.3.3. incrementReviewCount
* **name**: incrementReviewCount
* **type**: void
* **visibility**: public
* **description**: 새로운 리뷰가 등록될 때 totalReviews를 1 증가시키는 메서드이다.

### 2.3.4. verifyBroker
* **name**: verifyBroker
* **type**: void
* **visibility**: public
* **description**: 관리자가 브로커의 자격을 검증했을 때 isVerified를 true로 설정하는 메서드이다.

### 2.3.5. getBrokerProfile
* **name**: getBrokerProfile
* **type**: BrokerProfile
* **visibility**: public
* **description**: 브로커의 상세 프로필 정보를 BrokerProfile 객체로 반환하는 메서드이다.



# Admin 클래스

```mermaid
classDiagram
  %% --- 연관된 클래스 (이름만 표시) ---
  class User {
    %% 3.2.2. Admin이 OneToOne으로 참조하는 User 객체
  }
  class Property {
    %% 3.3.2. Admin이 deleteProperty로 관리하는 매물 객체
  }
  class Broker {
    %% 3.3.3. Admin이 verifyBrokerLicense로 검증하는 브로커 객체
  }

  %% --- Admin 클래스 상세 정의 ---
  class Admin {
    %% 3.1. class description: 시스템 관리자 정보 관리
    -adminId: Long
    -user: User
    -adminLevel: int
    -department: String
    -lastLoginAt: LocalDateTime
    -canManageUsers: boolean
    -canManageProperties: boolean
    -canVerifyBrokers: boolean

    +suspendUser(user: User): void
    +deleteProperty(property: Property): void
    +verifyBrokerLicense(broker: Broker): boolean
    +updateLastLogin(): void
    +hasPermission(permissionType: String): boolean
  }

  %% --- 관계 정의 ---
  Admin "1" -- "1" User : OneToOne 연관
  Admin ..> User : 사용 (Manages)
  Admin ..> Property : 사용 (Manages)
  Admin ..> Broker : 사용 (Manages)
```

## 3.1. class description
시스템 관리자의 정보를 관리하는 클래스이다. User 클래스를 상속받아 일반 사용자의 모든 속성을 포함하며, 관리자 고유의 권한 및 활동 이력을 추가로 관리한다.

## 3.2. attribution 구분

### 3.2.1. adminId
* **name**: adminId
* **type**: Long
* **visibility**: private
* **description**: 관리자를 고유하게 식별하기 위한 primary key이다. userId와는 별도로 관리된다.

### 3.2.2. user
* **name**: user
* **type**: User
* **visibility**: private
* **description**: 연관된 User 객체에 대한 참조이다. OneToOne 관계로 관리자의 기본 사용자 정보를 담고 있다.

### 3.2.3. adminLevel
* **name**: adminLevel
* **type**: int
* **visibility**: private
* **description**: 관리자의 권한 수준을 나타낸다. 레벨이 높을수록 더 많은 관리 권한을 가진다.

### 3.2.4. department
* **name**: department
* **type**: String
* **visibility**: private
* **description**: 관리자가 소속된 부서명이다. 예를 들어 운영팀, 고객지원팀 등이 있다.

### 3.2.5. lastLoginAt
* **name**: lastLoginAt
* **type**: LocalDateTime
* **visibility**: private
* **description**: 관리자가 마지막으로 로그인한 날짜와 시간이다. 관리자 활동 모니터링에 사용된다.

### 3.2.6. canManageUsers
* **name**: canManageUsers
* **type**: boolean
* **visibility**: private
* **description**: 사용자 관리 권한이 있는지 여부를 나타낸다. true인 경우 사용자 계정을 차단하거나 삭제할 수 있다.

### 3.2.7. canManageProperties
* **name**: canManageProperties
* **type**: boolean
* **visibility**: private
* **description**: 매물 관리 권한이 있는지 여부를 나타낸다. true인 경우 부적절한 매물을 삭제하거나 수정할 수 있다.

### 3.2.8. canVerifyBrokers
* **name**: canVerifyBrokers
* **type**: boolean
* **visibility**: private
* **description**: 브로커 검증 권한이 있는지 여부를 나타낸다. true인 경우 브로커의 자격증을 검증할 수 있다.

## 3.3. Operations 구분

### 3.3.1. suspendUser
* **name**: suspendUser
* **type**: void
* **visibility**: public
* **description**: 특정 사용자의 계정을 정지시키는 메서드이다. canManageUsers 권한이 있어야 실행 가능하다.

### 3.3.2. deleteProperty
* **name**: deleteProperty
* **type**: void
* **visibility**: public
* **description**: 부적절한 매물을 삭제하는 메서드이다. canManageProperties 권한이 있어야 실행 가능하다.

### 3.3.3. verifyBrokerLicense
* **name**: verifyBrokerLicense
* **type**: boolean
* **visibility**: public
* **description**: 브로커의 자격증을 검증하는 메서드이다. 검증 성공 시 true를 반환하며, canVerifyBrokers 권한이 필요하다.

### 3.3.4. updateLastLogin
* **name**: updateLastLogin
* **type**: void
* **visibility**: public
* **description**: 관리자가 로그인할 때 lastLoginAt을 현재 시간으로 업데이트하는 메서드이다.

### 3.3.5. hasPermission
* **name**: hasPermission
* **type**: boolean
* **visibility**: public
* **description**: 특정 작업에 대한 권한이 있는지 확인하는 메서드이다. 권한 종류를 인자로 받아 해당 권한 여부를 반환한다.



# AuthService 클래스

```mermaid
classDiagram
  %% --- 의존 컴포넌트 및 엔티티 (이름만 표시) ---
  class UserRepository {
    %% 4.2.1. AuthService가 의존하는 리포지토리
  }
  class JwtTokenProvider {
    %% 4.2.2. AuthService가 의존하는 토큰 프로바이더
  }
  class BCryptPasswordEncoder {
    %% 4.2.3. AuthService가 의존하는 패스워드 인코더
  }
  class User {
    %% 4.3.1. register()가 반환하고
    %% 4.3.5. getUserFromToken()이 반환하는 객체
  }
  class TokenResponse {
    %% 4.3.2. login()이 반환하는 토큰 객체
  }

  %% --- AuthService 클래스 상세 정의 ---
  class AuthService {
    %% 4.1. class description: 사용자 인증 및 인가 처리
    -userRepository: UserRepository
    -jwtTokenProvider: JwtTokenProvider
    -passwordEncoder: BCryptPasswordEncoder
    -tokenExpirationTime: long
    -refreshTokenExpirationTime: long

    +register(registerRequest: Object): User
    +login(loginRequest: Object): TokenResponse
    +validateToken(token: String): boolean
    +refreshAccessToken(refreshToken: String): String
    +getUserFromToken(token: String): User
    -encryptPassword(password: String): String
    +logout(token: String): void
  }

  %% --- 관계 정의 (Dependencies & Usage) ---
  AuthService ..> UserRepository : 의존 (Depends on)
  AuthService ..> JwtTokenProvider : 의존 (Depends on)
  AuthService ..> BCryptPasswordEncoder : 의존 (Depends on)
  
  AuthService ..> User : 사용 (Uses/Returns)
  AuthService ..> TokenResponse : 사용 (Returns)
```

## 4.1. class description
사용자 인증 및 인가를 처리하는 서비스 클래스이다. 회원가입, 로그인, JWT 토큰 생성 및 검증, 비밀번호 암호화 등 인증과 관련된 모든 비즈니스 로직을 담당한다.

## 4.2. attribution 구분

### 4.2.1. userRepository
* **name**: userRepository
* **type**: UserRepository
* **visibility**: private
* **description**: User 엔티티에 대한 데이터베이스 접근을 담당하는 Repository이다. 사용자 정보 조회 및 저장에 사용된다.

### 4.2.2. jwtTokenProvider
* **name**: jwtTokenProvider
* **type**: JwtTokenProvider
* **visibility**: private
* **description**: JWT 토큰 생성 및 검증을 담당하는 컴포넌트이다. 액세스 토큰과 리프레시 토큰을 관리한다.

### 4.2.3. passwordEncoder
* **name**: passwordEncoder
* **type**: BCryptPasswordEncoder
* **visibility**: private
* **description**: 비밀번호를 BCrypt 알고L리즘으로 암호화하는 인코더이다. Spring Security에서 제공한다.

### 4.2.4. tokenExpirationTime
* **name**: tokenExpirationTime
* **type**: long
* **visibility**: private
* **description**: 액세스 토큰의 유효 시간이다. 밀리초 단위로 저장되며, 기본값은 1시간이다.

### 4.2.5. refreshTokenExpirationTime
* **name**: refreshTokenExpirationTime
* **type**: long
* **visibility**: private
* **description**: 리프레시 토큰의 유효 시간이다. 밀리초 단위로 저장되며, 기본값은 7일이다.

## 4.3. Operations 구분

### 4.3.1. register
* **name**: register
* **type**: User
* **visibility**: public
* **description**: 새로운 사용자를 회원가입 처리하는 메서드이다. 이메일 중복 확인, 비밀번호 암호화를 수행한 후 사용자를 데이터베이스에 저장하고 생성된 User 객체를 반환한다.

### 4.3.2. login
* **name**: login
* **type**: TokenResponse
* **visibility**: public
* **description**: 사용자 로그인을 처리하는 메서드이다. 이메일과 비밀번호를 검증한 후 액세스 토큰과 리프레시 토큰을 생성하여 TokenResponse 객체로 반환한다.

### 4.3.3. validateToken
* **name**: validateToken
* **type**: boolean
* **visibility**: public
* **description**: JWT 토큰의 유효성을 검증하는 메서드이다. 토큰의 서명, 만료 시간 등을 확인하여 유효한 토큰인지 판단한다.

### 4.3.4. refreshAccessToken
* **name**: refreshAccessToken
* **type**: String
* **visibility**: public
* **description**: 리프레시 토큰을 사용하여 새로운 액세스 토큰을 발급하는 메서드이다. 리프레시 토큰이 유효한 경우에만 새로운 액세스 토큰을 반환한다.

### 4.3.5. getUserFromToken
* **name**: getUserFromToken
* **type**: User
* **visibility**: public
* **description**: JWT 토큰에서 사용자 정보를 추출하는 메서드이다. 토큰의 클레임에서 사용자 ID를 가져와 해당 User 객체를 반환한다.

### 4.3.6. encryptPassword
* **name**: encryptPassword
* **type**: String
* **visibility**: private
* **description**: 평문 비밀번호를 BCrypt 알고리즘으로 암호화하는 메서드이다. 회원가입 및 비밀번호 변경 시 사용된다.

### 4.3.7. logout
* **name**: logout
* **type**: void
* **visibility**: public
* **description**: 사용자 로그아웃을 처리하는 메서드이다. 토큰을 무효화하거나 블랙리스트에 추가한다.



# UserRole 클래스

```mermaid
classDiagram
  %% 5.1. class description: 사용자의 권한 수준을 정의 (클래스로 변경)
  class UserRole {
    %% 5.2.1-5.2.3: Enum Constants (클래스에서는 static 상수로 표현될 수 있음)
    <<static>> GENERAL
    <<static>> BROKER
    <<static>> ADMIN
    
    %% 5.2.4-5.2.5: Attributes
    -roleName: String
    -description: String
    
    %% 5.3.1-5.3.5: Operations
    +getRoleName(): String
    +getDescription(): String
    +hasPermission(permission: String): boolean
    +isHigherThan(otherRole: UserRole): boolean
    +valueOf(name: String): UserRole
  }
```

## 5.1. class description
사용자의 권한 수준을 정의하는 열거형(Enum) 클래스이다. GENERAL, BROKER, ADMIN의 세 가지 역할을 정의하며, 각 역할에 따라 시스템 접근 권한이 달라진다.

## 5.2. attribution 구분

### 5.2.1. GENERAL
* **name**: GENERAL
* **type**: UserRole
* **visibility**: public
* **description**: 일반 사용자를 나타내는 열거형 상수이다. 매물 검색, 관심 매물 등록, 브로커에게 중개 요청 등의 기본 기능을 사용할 수 있다.

### 5.2.2. BROKER
* **name**: BROKER
* **type**: UserRole
* **visibility**: public
* **description**: 브로커 사용자를 나타내는 열거형 상수이다. 일반 사용자의 모든 기능에 더해 프로필 관리, 중개 위임 수락, 고객과의 채팅 등의 기능을 사용할 수 있다.

### 5.2.3. ADMIN
* **name**: ADMIN
* **type**: UserRole
* **visibility**: public
* **description**: 관리자를 나타내는 열거형 상수이다. 시스템의 모든 기능에 접근할 수 있으며, 사용자 관리, 매물 관리, 브로커 검증 등의 관리 기능을 수행할 수 있다.

### 5.2.4. roleName
* **name**: roleName
* **type**: String
* **visibility**: private
* **description**: 역할의 이름을 문자열로 저장하는 속성이다. 예를 들어 GENERAL의 경우 "일반사용자", BROKER의 경우 "브로커"로 저장된다.

### 5.2.5. description
* **name**: description
* **type**: String
* **visibility**: private
* **description**: 각 역할에 대한 설명을 저장하는 속성이다. UI에 역할 정보를 표시할 때 사용된다.

## 5.3. Operations 구분

### 5.3.1. getRoleName
* **name**: getRoleName
* **type**: String
* **visibility**: public
* **description**: 역할의 이름을 반환하는 getter 메서드이다. UI에 사용자 권한을 표시할 때 사용된다.

### 5.3.2. getDescription
* **name**: getDescription
* **type**: String
* **visibility**: public
* **description**: 역할에 대한 설명을 반환하는 getter 메서드이다. 사용자에게 권한에 대한 안내를 제공할 때 사용된다.

### 5.3.3. hasPermission
* **name**: hasPermission
* **type**: boolean
* **visibility**: public
* **description**: 특정 기능에 대한 접근 권한이 있는지 확인하는 메서드이다. 권한 종류를 문자열로 받아 해당 역할이 그 권한을 가지고 있는지 boolean으로 반환한다.

### 5.3.4. isHigherThan
* **name**: isHigherThan
* **type**: boolean
* **visibility**: public
* **description**: 다른 역할과 비교하여 현재 역할의 권한 수준이 더 높은지 확인하는 메서드이다. 예를 들어 ADMIN이 BROKER보다 높은 권한을 가진다.

### 5.3.5. valueOf
* **name**: valueOf
* **type**: UserRole
* **visibility**: public static
* **description**: 문자열로부터 해당하는 UserRole 열거형 상수를 반환하는 정적 메서드이다. 데이터베이스에서 읽어온 문자열을 열거형으로 변환할 때 사용된다.

============================================================================================

# 2. 브로커 프로필 관련

# BrokerProfile 클래스

```mermaid
classDiagram
  %% --- 연관된 클래스 (이름만 표시) ---
  class Broker {
    %% 1.2.2. BrokerProfile이 OneToOne으로 참조하는 Broker 객체
  }

  %% --- BrokerProfile 클래스 상세 정의 ---
  class BrokerProfile {
    %% 1.1. class description: 브로커 상세 프로필 정보 관리
    -profileId: Long
    -broker: Broker
    -introduction: String
    -specializedAreas: List~String~
    -propertyTypesHandled: List~PropertyType~
    -totalDeals: int
    -totalDealAmount: long
    -businessHours: String
    -officeAddress: String
    -profileImageUrl: String
    -certifications: List~String~
    -responseRate: double
    -averageResponseTime: int
    -isAvailable: boolean
    -viewCount: int
    
    +updateProfile(profileData: Object): void
    +addSpecializedArea(area: String): void
    +removeSpecializedArea(area: String): void
    +addPropertyType(type: PropertyType): void
    +incrementTotalDeals(dealAmount: long): void
    +updateResponseMetrics(isResponded: boolean, time: int): void
    +setAvailability(isAvailable: boolean): void
    +incrementViewCount(): void
    +updateProfileImage(imageUrl: String): void
    +getProfileSummary(): String
  }

  %% --- 관계 정의 ---
  BrokerProfile "1" -- "1" Broker : OneToOne 연관
```

## 1.1. class description
브로커의 상세 프로필 정보를 관리하는 클래스이다. Broker 클래스와 OneToOne 관계를 맺으며, 브로커의 자기소개, 전문 지역, 거래 실적, 영업시간 등 고객에게 보여질 상세한 프로필 정보를 담고 있다. 이 클래스는 사용자가 브로커를 선택할 때 참고하는 핵심 정보를 제공한다.

## 1.2. attribution 구분

### 1.2.1. profileId
* **name**: profileId
* **type**: Long
* **visibility**: private
* **description**: 브로커 프로필을 고유하게 식별하기 위한 primary key이다. 데이터베이스에서 자동 생성되는 프로필의 고유 ID로, 각 브로커마다 하나의 프로필만 존재한다.

### 1.2.2. broker
* **name**: broker
* **type**: Broker
* **visibility**: private
* **description**: 이 프로필이 속한 브로커 객체에 대한 참조이다. OneToOne 관계로 연결되어 있으며, 브로커의 기본 정보에 접근할 때 사용된다.

### 1.2.3. introduction
* **name**: introduction
* **type**: String
* **visibility**: private
* **description**: 브로커의 자기소개 텍스트이다. 최대 1000자까지 작성할 수 있으며, 브로커의 경력, 강점, 서비스 철학 등을 자유롭게 표현한다. 고객들이 브로커의 성향을 파악하는 데 중요한 정보이다.

### 1.2.4. specializedAreas
* **name**: specializedAreas
* **type**: List\<String\>
* **visibility**: private
* **description**: 브로커가 전문적으로 다루는 지역 목록이다. 예를 들어 "강남구", "서초구", "송파구" 등이 포함될 수 있으며, 사용자가 특정 지역의 전문가를 찾을 때 필터링 기준으로 사용된다.

### 1.2.5. propertyTypesHandled
* **name**: propertyTypesHandled
* **type**: List\<PropertyType\>
* **visibility**: private
* **description**: 브로커가 주로 취급하는 매물 유형 목록이다. 아파트, 빌라, 오피스텔, 상가 등의 PropertyType 열거형 값들을 리스트로 저장하며, 각 브로커의 전문 분야를 명확히 보여준다.

### 1.2.6. totalDeals
* **name**: totalDeals
* **type**: int
* **visibility**: private
* **description**: 브로커가 성사시킨 총 거래 건수이다. 경력과 더불어 브로커의 실력을 보여주는 객관적인 지표로, 숫자가 높을수록 경험이 풍부한 브로커임을 나타낸다.

### 1.2.7. totalDealAmount
* **name**: totalDealAmount
* **type**: long
* **visibility**: private
* **description**: 브로커가 성사시킨 거래의 총 금액이다. 단위는 원이며, 브로커가 다룬 매물의 규모를 파악할 수 있는 지표이다. 고액 거래 경험이 많은 브로커를 찾을 때 참고된다.

### 1.2.8. businessHours
* **name**: businessHours
* **type**: String
* **visibility**: private
* **description**: 브로커의 영업 시간 정보이다. 예를 들어 "평일 09:00-18:00, 주말 10:00-17:00" 형식으로 저장되며, 고객이 연락 가능한 시간대를 확인할 수 있다.

### 1.2.9. officeAddress
* **name**: officeAddress
* **type**: String
* **visibility**: private
* **description**: 브로커가 근무하는 사무실의 주소이다. 직접 방문 상담을 원하는 고객들을 위한 정보이며, 지도 API와 연동하여 위치를 표시할 수 있다.

### 1.2.10. profileImageUrl
* **name**: profileImageUrl
* **type**: String
* **visibility**: private
* **description**: 브로커의 프로필 사진 URL이다. S3나 다른 클라우드 스토리지에 저장된 이미지 파일의 경로를 문자열로 저장하며, 사용자에게 브로커의 얼굴을 보여줌으로써 신뢰감을 높인다.

### 1.2.11. certifications
* **name**: certifications
* **type**: List\<String\>
* **visibility**: private
* **description**: 브로커가 보유한 자격증 및 인증서 목록이다. 부동산 관련 추가 자격증이나 교육 이수 내역을 저장하며, 전문성을 입증하는 데 사용된다.

### 1.2.12. responseRate
* **name**: responseRate
* **type**: double
* **visibility**: private
* **description**: 브로커의 문의 응답률이다. 0부터 100까지의 값을 가지며, 고객의 채팅이나 연락에 얼마나 빠르게 응답하는지를 백분율로 나타낸다. 높은 응답률은 성실한 브로커임을 보여준다.

### 1.2.13. averageResponseTime
* **name**: averageResponseTime
* **type**: int
* **visibility**: private
* **description**: 브로커의 평균 응답 시간이다. 단위는 분이며, 고객의 문의에 평균적으로 얼마나 빨리 답변하는지를 나타낸다. 빠른 응답 시간은 고객 만족도를 높이는 중요한 요소이다.

### 1.2.14. isAvailable
* **name**: isAvailable
* **type**: boolean
* **visibility**: private
* **description**: 브로커가 현재 새로운 의뢰를 받을 수 있는 상태인지를 나타낸다. false인 경우 일시적으로 휴무 중이거나 업무 포화 상태임을 의미하며, 사용자에게 표시된다.

### 1.2.15. viewCount
* **name**: viewCount
* **type**: int
* **visibility**: private
* **description**: 브로커 프로필이 조회된 총 횟수이다. 인기도를 나타내는 지표로 사용되며, 검색 결과 정렬 시 참고될 수 있다.

## 1.3. Operations 구분

### 1.3.1. updateProfile
* **name**: updateProfile
* **type**: void
* **visibility**: public
* **description**: 브로커가 자신의 프로필 정보를 수정하는 메서드이다. 자기소개, 전문 지역, 영업시간, 사무실 주소 등 변경 가능한 모든 정보를 업데이트할 수 있다. 수정 시 updatedAt 필드가 자동으로 갱신된다.

### 1.3.2. addSpecializedArea
* **name**: addSpecializedArea
* **type**: void
* **visibility**: public
* **description**: 브로커의 전문 지역 목록에 새로운 지역을 추가하는 메서드이다. 지역명을 매개변수로 받아 specializedAreas 리스트에 추가하며, 중복된 지역은 추가하지 않도록 검증한다.

### 1.3.3. removeSpecializedArea
* **name**: removeSpecializedArea
* **type**: void
* **visibility**: public
* **description**: 브로커의 전문 지역 목록에서 특정 지역을 제거하는 메서드이다. 더 이상 해당 지역을 전문적으로 다루지 않을 때 사용된다.

### 1.3.4. addPropertyType
* **name**: addPropertyType
* **type**: void
* **visibility**: public
* **description**: 브로커가 취급하는 매물 유형 목록에 새로운 유형을 추가하는 메서드이다. PropertyType 열거형을 매개변수로 받아 propertyTypesHandled 리스트에 추가한다.

### 1.3.5. incrementTotalDeals
* **name**: incrementTotalDeals
* **type**: void
* **visibility**: public
* **description**: 새로운 거래가 성사되었을 때 총 거래 건수를 1 증가시키는 메서드이다. 거래 금액을 매개변수로 받아 totalDealAmount도 함께 업데이트한다.

### 1.3.6. updateResponseMetrics
* **name**: updateResponseMetrics
* **type**: void
* **visibility**: public
* **description**: 새로운 문의 응답 데이터를 바탕으로 응답률과 평균 응답 시간을 재계산하는 메서드이다. 응답 여부와 응답 시간을 매개변수로 받아 통계를 업데이트한다.

### 1.3.7. setAvailability
* **name**: setAvailability
* **type**: void
* **visibility**: public
* **description**: 브로커의 현재 의뢰 가능 상태를 변경하는 메서드이다. boolean 값을 매개변수로 받아 isAvailable을 설정하며, 브로커가 휴가나 업무 과부하로 일시적으로 의뢰를 받을 수 없을 때 사용된다.

### 1.3.8. incrementViewCount
* **name**: incrementViewCount
* **type**: void
* **visibility**: public
* **description**: 브로커 프로필이 조회될 때마다 viewCount를 1 증가시키는 메서드이다. 프로필 페이지가 로드될 때 자동으로 호출되어 인기도를 추적한다.

### 1.3.9. updateProfileImage
* **name**: updateProfileImage
* **type**: void
* **visibility**: public
* **description**: 브로커의 프로필 사진을 변경하는 메서드이다. 새로운 이미지 URL을 매개변수로 받아 profileImageUrl을 업데이트하며, 이전 이미지는 스토리지에서 삭제할 수 있다.

### 1.3.10. getProfileSummary
* **name**: getProfileSummary
* **type**: String
* **visibility**: public
* **description**: 브로커 프로필의 요약 정보를 반환하는 메서드이다. 이름, 경력 연수, 평균 평점, 총 거래 건수 등 핵심 정보를 간단한 문자열로 조합하여 리스트 뷰에서 표시할 때 사용된다.



# BrokerReview 클래스

```mermaid
classDiagram
  %% --- 연관된 클래스 (이름만 표시) ---
  class Broker {
    %% 2.2.2. 리뷰 대상 브로커
  }
  class User {
    %% 2.2.3. 리뷰 작성자
  }
  class Delegation {
    %% 2.2.4. 연관된 중개 위임 건
  }
  class BaseEntity {
    +createdAt: LocalDateTime
    +updatedAt: LocalDateTime
  }

  %% --- BrokerReview 클래스 상세 정의 ---
  class BrokerReview {
    %% 2.1. class description: 브로커에 대한 고객 리뷰 관리
    -reviewId: Long
    -broker: Broker
    -reviewer: User
    -delegation: Delegation
    -rating: int
    -content: String
    -serviceQualityRating: int
    -responseSpeedRating: int
    -communicationRating: int
    -isVerifiedPurchase: boolean
    -helpfulCount: int
    -isReported: boolean
    -brokerResponse: String
    %% createdAt, updatedAt은 BaseEntity로부터 상속
    
    +updateReview(rating: int, content: String): void
    +addBrokerResponse(response: String): void
    +incrementHelpfulCount(): void
    +reportReview(reason: String): void
    +deleteReview(): void
    +verifyPurchase(): void
    +getAverageDetailRating(): double
    +isEditableBy(user: User): boolean
  }

  %% --- 관계 정의 ---
  BaseEntity <|-- BrokerReview : 상속 (Inheritance)
  BrokerReview "N" -- "1" Broker : ManyToOne
  BrokerReview "N" -- "1" User : ManyToOne (reviewer)
  BrokerReview "1" -- "1" Delegation : OneToOne
```

## 2.1. class description
브로커에 대한 고객의 리뷰를 관리하는 클래스이다. 중개 서비스를 이용한 사용자가 브로커에게 남긴 평점과 후기를 저장하며, 다른 사용자들이 브로커를 선택할 때 중요한 참고 자료가 된다. 각 리뷰는 작성자, 대상 브로커, 평점, 내용, 작성일 등의 정보를 포함한다.

## 2.2. attribution 구분

### 2.2.1. reviewId
* **name**: reviewId
* **type**: Long
* **visibility**: private
* **description**: 리뷰를 고유하게 식별하기 위한 primary key이다. 데이터베이스에서 자동 생성되는 리뷰의 고유 ID로, 각 리뷰를 구분하는 데 사용된다.

### 2.2.2. broker
* **name**: broker
* **type**: Broker
* **visibility**: private
* **description**: 리뷰 대상이 되는 브로커 객체에 대한 참조이다. ManyToOne 관계로, 한 브로커는 여러 개의 리뷰를 받을 수 있다. 이 참조를 통해 특정 브로커의 모든 리뷰를 조회할 수 있다.

### 2.2.3. reviewer
* **name**: reviewer
* **type**: User
* **visibility**: private
* **description**: 리뷰를 작성한 사용자 객체에 대한 참조이다. ManyToOne 관계로, 한 사용자는 여러 브로커에게 리뷰를 남길 수 있다. 리뷰어의 이름과 정보를 표시할 때 사용된다.

### 2.2.4. delegation
* **name**: delegation
* **type**: Delegation
* **visibility**: private
* **description**: 이 리뷰가 연관된 중개 위임 건에 대한 참조이다. OneToOne 관계로, 각 중개 위임이 완료된 후 하나의 리뷰를 남길 수 있다. 실제 거래를 경험한 사용자만 리뷰를 작성하도록 보장한다.

### 2.2.5. rating
* **name**: rating
* **type**: int
* **visibility**: private
* **description**: 브로커에 대한 평점이다. 1부터 5까지의 정수값을 가지며, 5점이 가장 높은 평가이다. 이 값들이 모여 브로커의 평균 평점을 계산하는 데 사용된다.

### 2.2.6. content
* **name**: content
* **type**: String
* **visibility**: private
* **description**: 리뷰의 상세 내용이다. 최대 1000자까지 작성할 수 있으며, 브로커의 서비스에 대한 구체적인 경험과 평가를 자유롭게 서술한다. 다른 사용자들이 브로커를 선택할 때 실질적인 도움을 준다.

### 2.2.7. serviceQualityRating
* **name**: serviceQualityRating
* **type**: int
* **visibility**: private
* **description**: 서비스 품질에 대한 세부 평점이다. 1부터 5까지의 값을 가지며, 브로커의 전문성, 친절도, 정확성 등을 구체적으로 평가한다.

### 2.2.8. responseSpeedRating
* **name**: responseSpeedRating
* **type**: int
* **visibility**: private
* **description**: 응답 속도에 대한 세부 평점이다. 1부터 5까지의 값을 가지며, 브로커가 문의나 요청에 얼마나 신속하게 응답했는지를 평가한다.

### 2.2.9. communicationRating
* **name**: communicationRating
* **type**: int
* **visibility**: private
* **description**: 의사소통 능력에 대한 세부 평점이다. 1부터 5까지의 값을 가지며, 브로커의 설명 능력, 경청 태도 등을 평가한다.

### 2.2.10. isVerifiedPurchase
* **name**: isVerifiedPurchase
* **type**: boolean
* **visibility**: private
* **description**: 실제 거래를 완료한 후 작성된 리뷰인지를 나타낸다. delegation이 완료 상태인 경우 자동으로 true가 되며, 검증된 리뷰임을 표시하여 신뢰도를 높인다.

### 2.2.11. helpfulCount
* **name**: helpfulCount
* **type**: int
* **visibility**: private
* **description**: 다른 사용자들이 이 리뷰를 도움이 된다고 표시한 횟수이다. 리뷰의 유용성을 나타내는 지표로, 정렬 시 우선순위를 결정하는 데 사용된다.

### 2.2.12. isReported
* **name**: isReported
* **type**: boolean
* **visibility**: private
* **description**: 이 리뷰가 부적절한 내용으로 신고되었는지를 나타낸다. true인 경우 관리자 검토 대기 상태이며, 일시적으로 공개가 제한될 수 있다.

### 2.2.13. brokerResponse
* **name**: brokerResponse
* **type**: String
* **visibility**: private
* **description**: 브로커가 리뷰에 대해 남긴 답변이다. 최대 500자까지 작성할 수 있으며, 브로커가 고객의 의견에 성실하게 응대하는 모습을 보여줄 수 있다.

### 2.2.14. createdAt
* **name**: createdAt
* **type**: LocalDateTime
* **visibility**: private
* **description**: 리뷰가 작성된 날짜와 시간이다. BaseEntity로부터 상속받아 자동으로 설정되며, 최신 리뷰를 우선 표시하는 정렬 기준으로 사용된다.

### 2.2.15. updatedAt
* **name**: updatedAt
* **type**: LocalDateTime
* **visibility**: private
* **description**: 리뷰가 마지막으로 수정된 날짜와 시간이다. 리뷰어가 내용을 수정하거나 브로커가 답변을 추가할 때 자동으로 갱신된다.

## 2.3. Operations 구분

### 2.3.1. updateReview
* **name**: updateReview
* **type**: void
* **visibility**: public
* **description**: 리뷰 작성자가 리뷰 내용을 수정하는 메서드이다. 평점과 내용을 매개변수로 받아 업데이트하며, 작성 후 일정 기간 내에만 수정이 가능하도록 제한할 수 있다.

### 2.3.2. addBrokerResponse
* **name**: addBrokerResponse
* **type**: void
* **visibility**: public
* **description**: 브로커가 리뷰에 대한 답변을 작성하는 메서드이다. 답변 내용을 매개변수로 받아 brokerResponse 필드를 설정하며, 브로커만 자신의 리뷰에 답변할 수 있도록 권한을 확인한다.

### 2.3.3. incrementHelpfulCount
* **name**: incrementHelpfulCount
* **type**: void
* **visibility**: public
* **description**: 사용자가 리뷰를 도움이 된다고 표시할 때 helpfulCount를 1 증가시키는 메서드이다. 같은 사용자가 중복으로 표시하지 못하도록 검증이 필요하다.

### 2.3.4. reportReview
* **name**: reportReview
* **type**: void
* **visibility**: public
* **description**: 사용자가 부적절한 리뷰를 신고하는 메서드이다. 신고 사유를 매개변수로 받아 isReported를 true로 설정하고, 관리자에게 알림을 전송한다.

### 2.3.5. deleteReview
* **name**: deleteReview
* **type**: void
* **visibility**: public
* **description**: 리뷰를 삭제하는 메서드이다. 작성자 본인이나 관리자만 삭제할 수 있으며, 실제로는 데이터를 삭제하지 않고 isDeleted 플래그를 설정하는 소프트 삭제를 수행한다.

### 2.3.6. verifyPurchase
* **name**: verifyPurchase
* **type**: void
* **visibility**: public
* **description**: 연관된 중개 위임이 완료되었을 때 isVerifiedPurchase를 true로 설정하는 메서드이다. 실제 거래를 기반으로 한 검증된 리뷰임을 표시한다.

### 2.3.7. getAverageDetailRating
* **name**: getAverageDetailRating
* **type**: double
* **visibility**: public
* **description**: 세부 평점들(서비스 품질, 응답 속도, 의사소통)의 평균을 계산하여 반환하는 메서드이다. 브로커의 다양한 측면을 종합적으로 평가하는 데 사용된다.

### 2.3.8. isEditableBy
* **name**: isEditableBy
* **type**: boolean
* **visibility**: public
* **description**: 특정 사용자가 이 리뷰를 수정할 수 있는 권한이 있는지 확인하는 메서드이다. 작성자 본인이거나 작성 후 일정 시간이 지나지 않았을 때 true를 반환한다.



# BrokerRating 클래스

```mermaid
classDiagram
  %% --- 연관된 클래스 (이름만 표시) ---
  class Broker {
    %% 3.2.2. 이 평점이 속한 브로커 (OneToOne)
  }
  class BrokerReview {
    %% 3.3.2, 3.3.4. 평점 계산 시 참조하는 리뷰 객체
  }

  %% --- BrokerRating 클래스 상세 정의 ---
  class BrokerRating {
    %% 3.1. class description: 브로커 평점 계산 및 관리
    -ratingId: Long
    -broker: Broker
    -overallRating: double
    -totalReviews: int
    -averageServiceQuality: double
    -averageResponseSpeed: double
    -averageCommunication: double
    -fiveStarCount: int
    -fourStarCount: int
    -threeStarCount: int
    -twoStarCount: int
    -oneStarCount: int
    -lastUpdated: LocalDateTime
    -ratingTrend: String
    
    +recalculateRatings(): void
    +addNewReviewRating(review: BrokerReview): void
    -updateStarDistribution(newRating: int): void
    +removeReviewRating(review: BrokerReview): void
    +getStarDistribution(): Map~Integer,Integer~
    +calculateRatingTrend(): void
    +getOverallRating(): double
    +getDetailedRatingSummary(): String
    +isReliableRating(): boolean
  }

  %% --- 관계 정의 ---
  BrokerRating "1" -- "1" Broker : OneToOne 연관
  BrokerRating ..> BrokerReview : 사용 (Uses)
```

## 3.1. class description
브로커의 평점을 계산하고 관리하는 클래스이다. 여러 리뷰의 평점을 종합하여 브로커의 전체 평균 평점을 계산하고, 각 세부 항목별 평점도 산출한다. 이 클래스는 브로커의 평가 지표를 실시간으로 업데이트하고, 사용자에게 신뢰할 수 있는 평점 정보를 제공하는 역할을 한다.

## 3.2. attribution 구분

### 3.2.1. ratingId
* **name**: ratingId
* **type**: Long
* **visibility**: private
* **description**: 평점 레코드를 고유하게 식별하기 위한 primary key이다. 데이터베이스에서 자동 생성되는 평점의 고유 ID로, 각 브로커마다 하나의 평점 레코드를 가진다.

### 3.2.2. broker
* **name**: broker
* **type**: Broker
* **visibility**: private
* **description**: 이 평점이 속한 브로커 객체에 대한 참조이다. OneToOne 관계로 연결되어 있으며, 각 브로커는 하나의 종합 평점 정보를 가진다.

### 3.2.3. overallRating
* **name**: overallRating
* **type**: double
* **visibility**: private
* **description**: 브로커의 전체 평균 평점이다. 0.0부터 5.0까지의 값을 가지며, 소수점 첫째 자리까지 표시된다. 모든 리뷰의 rating 값을 평균하여 계산되며, 브로커 검색 시 가장 중요한 정렬 기준 중 하나이다.

### 3.2.4. totalReviews
* **name**: totalReviews
* **type**: int
* **visibility**: private
* **description**: 브로커가 받은 총 리뷰 개수이다. 평점의 신뢰도를 판단하는 데 중요한 지표로, 리뷰 개수가 많을수록 평점의 신뢰성이 높아진다.

### 3.2.5. averageServiceQuality
* **name**: averageServiceQuality
* **type**: double
* **visibility**: private
* **description**: 서비스 품질에 대한 평균 평점이다. 0.0부터 5.0까지의 값을 가지며, 모든 리뷰의 serviceQualityRating을 평균하여 계산된다.

### 3.2.6. averageResponseSpeed
* **name**: averageResponseSpeed
* **type**: double
* **visibility**: private
* **description**: 응답 속도에 대한 평균 평점이다. 0.0부터 5.0까지의 값을 가지며, 모든 리뷰의 responseSpeedRating을 평균하여 계산된다.

### 3.2.7. averageCommunication
* **name**: averageCommunication
* **type**: double
* **visibility**: private
* **description**: 의사소통 능력에 대한 평균 평점이다. 0.0부터 5.0까지의 값을 가지며, 모든 리뷰의 communicationRating을 평균하여 계산된다.

### 3.2.8. fiveStarCount
* **name**: fiveStarCount
* **type**: int
* **visibility**: private
* **description**: 5점 평점을 받은 리뷰의 개수이다. 평점 분포를 시각화할 때 사용되며, 브로커의 우수성을 나타내는 지표이다.

### 3.2.9. fourStarCount
* **name**: fourStarCount
* **type**: int
* **visibility**: private
* **description**: 4점 평점을 받은 리뷰의 개수이다. 평점 분포 분석에 사용된다.

### 3.2.10. threeStarCount
* **name**: threeStarCount
* **type**: int
* **visibility**: private
* **description**: 3점 평점을 받은 리뷰의 개수이다. 평점 분포 분석에 사용된다.

### 3.2.11. twoStarCount
* **name**: twoStarCount
* **type**: int
* **visibility**: private
* **description**: 2점 평점을 받은 리뷰의 개수이다. 평점 분포 분석에 사용된다.

### 3.2.12. oneStarCount
* **name**: oneStarCount
* **type**: int
* **visibility**: private
* **description**: 1점 평점을 받은 리뷰의 개수이다. 평점 분포를 완성하며, 낮은 평가를 받은 경우를 파악하는 데 사용된다.

### 3.2.13. lastUpdated
* **name**: lastUpdated
* **type**: LocalDateTime
* **visibility**: private
* **description**: 평점이 마지막으로 업데이트된 날짜와 시간이다. 새로운 리뷰가 추가되거나 기존 리뷰가 수정될 때 자동으로 갱신된다.

### 3.2.14. ratingTrend
* **name**: ratingTrend
* **type**: String
* **visibility**: private
* **description**: 최근 평점의 변화 추세를 나타낸다. "상승", "유지", "하락" 중 하나의 값을 가지며, 최근 3개월간의 평점 변화를 분석하여 설정된다.

## 3.3. Operations 구분

### 3.3.1. recalculateRatings
* **name**: recalculateRatings
* **type**: void
* **visibility**: public
* **description**: 브로커의 모든 리뷰를 다시 조회하여 평점을 재계산하는 메서드이다. 전체 평균 평점과 세부 항목별 평점을 모두 업데이트하며, 새로운 리뷰가 추가되거나 기존 리뷰가 수정/삭제될 때 호출된다.

### 3.3.2. addNewReviewRating
* **name**: addNewReviewRating
* **type**: void
* **visibility**: public
* **description**: 새로운 리뷰가 추가되었을 때 기존 평점에 새 평점을 반영하는 메서드이다. BrokerReview 객체를 매개변수로 받아, 전체 평점을 재계산하지 않고 효율적으로 업데이트한다. 리뷰 개수가 많을 때 성능상 이점이 있다.

### 3.3.3. updateStarDistribution
* **name**: updateStarDistribution
* **type**: void
* **visibility**: private
* **description**: 새로운 평점이 추가될 때 해당 평점에 맞는 카운터를 증가시키는 메서드이다. 예를 들어 5점 리뷰가 추가되면 fiveStarCount를 1 증가시킨다.

### 3.3.4. removeReviewRating
* **name**: removeReviewRating
* **type**: void
* **visibility**: public
* **description**: 리뷰가 삭제되었을 때 해당 리뷰의 평점을 전체 평점에서 제외하는 메서드이다. BrokerReview 객체를 매개변수로 받아 평점을 재계산하고 별점 분포도 조정한다.

### 3.3.5. getStarDistribution
* **name**: getStarDistribution
* **type**: Map\<Integer, Integer\>
* **visibility**: public
* **description**: 1점부터 5점까지의 평점 분포를 Map 형태로 반환하는 메서드이다. UI에서 평점 분포를 막대 그래프나 원형 차트로 표시할 때 사용된다.

### 3.3.6. calculateRatingTrend
* **name**: calculateRatingTrend
* **type**: void
* **visibility**: public
* **description**: 최근 3개월간의 평점 변화를 분석하여 ratingTrend를 업데이트하는 메서드이다. 이전 기간과 현재 기간의 평점을 비교하여 상승, 유지, 하락 중 하나를 설정한다.

### 3.3.7. getOverallRating
* **name**: getOverallRating
* **type**: double
* **visibility**: public
* **description**: 현재 전체 평균 평점을 반환하는 getter 메서드이다. 브로커 리스트나 프로필 페이지에서 평점을 표시할 때 사용된다.

### 3.3.8. getDetailedRatingSummary
* **name**: getDetailedRatingSummary
* **type**: String
* **visibility**: public
* **description**: 전체 평점, 리뷰 개수, 세부 항목별 평점을 포함한 종합 요약 정보를 문자열로 반환하는 메서드이다. 브로커 프로필에서 평점 정보를 상세히 표시할 때 사용된다.

### 3.3.9. isReliableRating
* **name**: isReliableRating
* **type**: boolean
* **visibility**: public
* **description**: 평점이 신뢰할 수 있는 수준인지 판단하는 메서드이다. 일반적으로 리뷰 개수가 10개 이상일 때 신뢰할 수 있다고 판단하며, 이를 기반으로 사용자에게 정보를 제공한다.

============================================================================================

# 3. 매물 관련

# PropertyController 클래스

```mermaid
classDiagram
  class PropertyController {
    -propertyservice: PropertyService
    -jeonseRatioService: JeonseRatioService
    +getPropertiesInBounds(minX: double, minY: double, maxX: double, maxY: double, status: Status?, minPrice: BigDecimal?, maxPrice: BigDecimal?): ResponseEntity<List<PropertyMarkerDto>>
    +completeDeal(request: CompleteDealRequest): ResponseEntity<Void>
    +getJeonseRatio(propertyId: Long, offerId: Long?, clientSalePrice: BigDecimal?): ResponseEntity<JeonseRatioResponse>
  }
```
## 1.1. class description
지도 범위 검색, 거래 완료 처리, 전세가율 계산 요청을 처리하는 클래스이다. REST 요청을 검증하고 서비스 계층에 위임한다.

## 1.2. attribution 구분

### 1.2.1. propertyservice
* **name**: propertyservice
* **type**: PropertyService
* **visibility**: private
* **description**: 지도/상세/거래완료 로직을 수행한다.

### 1.2.2. jeonseRatioService
* **name**: jeonseRatioService
* **type**: JeonseRatioService
* **visibility**: private
* **description**: 전세가율 계산을 수행한다.

## 1.3. Operations 구분

### 1.3.1. getPropertiesInBounds
* **name**: getPropertiesInBounds
* **type**: ResponseEntity<List<PropertyMarkerDto>>
* **visibility**: public
* **description**: 지도 사각 범위와 상태/가격 조건으로 매물 마커 목록을 조회한다.

### 1.3.2. completeDeal
* **name**: completeDeal
* **type**: ResponseEntity<Void>
* **visibility**: public
* **description**: 브로커 권한 확인 후 특정 매물을 거래 완료로 처리한다.

### 1.3.3. getJeonseRatio
* **name**: getJeonseRatio
* **type**: ResponseEntity<JeonseRatioResponse>
* **visibility**: public
* **description**: 전세가율을 계산하여 반환한다.


# PropertyFavoriteController 클래스

```mermaid
classDiagram
  class PropertyFavoriteController {
    -propertyFavoriteService: PropertyFavoriteService
    +getMyFavorites(page: int, size: int): ResponseEntity<List<PropertyFavoriteDto>>
  }
```
## 1.1. class description
인증 사용자의 찜 목록 API를 제공하는 클래스이다. 로그인 컨텍스트를 이용해 페이지네이션 조회를 수행한다.

## 1.2. attribution 구분

### 1.2.1. propertyFavoriteService
* **name**: propertyFavoriteService
* **type**: PropertyFavoriteService
* **visibility**: private
* **description**: 찜 목록 조회 비즈니스 로직을 수행한다.

## 1.3. Operations 구분

### 1.3.1. getMyFavorites
* **name**: getMyFavorites
* **type**: ResponseEntity<List<PropertyFavoriteDto>>
* **visibility**: public
* **description**: 로그인 사용자의 찜 목록을 조회한다.


# PropertyFavoriteToggleController 클래스

```mermaid
classDiagram
  class PropertyFavoriteToggleController {
    -propertyFavoriteService: PropertyFavoriteService
    +toggleFavorite(propertyId: Long): ResponseEntity<Map<String, Boolean>>
    +deleteFavorite(propertyId: Long): ResponseEntity<Void>
    +getFavorites(page: int, size: int): ResponseEntity<List<PropertyFavoriteDto>>
    +isFavorite(propertyId: Long): ResponseEntity<Boolean>
    +favoriteCount(propertyId: Long): ResponseEntity<Long>
  }
```
## 1.1. class description
특정 매물에 대한 찜 on/off 토글 및 조회 기능을 제공하는 클래스이다.

## 1.2. attribution 구분

### 1.2.1. propertyFavoriteService
* **name**: propertyFavoriteService
* **type**: PropertyFavoriteService
* **visibility**: private
* **description**: 찜 토글/카운트 로직을 수행한다.

## 1.3. Operations 구분

### 1.3.1. toggleFavorite
* **name**: toggleFavorite
* **type**: ResponseEntity<Map<String, Boolean>>
* **visibility**: public
* **description**: 해당 매물의 찜 상태를 토글한다.

### 1.3.2. deleteFavorite
* **name**: deleteFavorite
* **type**: ResponseEntity<Void>
* **visibility**: public
* **description**: 해당 매물의 찜을 해제한다.

### 1.3.3. getFavorites
* **name**: getFavorites
* **type**: ResponseEntity<List<PropertyFavoriteDto>>
* **visibility**: public
* **description**: 내 찜 목록을 조회한다.

### 1.3.4. isFavorite
* **name**: isFavorite
* **type**: ResponseEntity<Boolean>
* **visibility**: public
* **description**: 특정 매물에 대한 내 찜 여부를 반환한다.

### 1.3.5. favoriteCount
* **name**: favoriteCount
* **type**: ResponseEntity<Long>
* **visibility**: public
* **description**: 해당 매물의 총 찜 수를 반환한다.


# PropertyOfferController 클래스

```mermaid
classDiagram
  class PropertyOfferController {
    -propertyOfferService: PropertyOfferService
    +toggleActive(offerId: Long): ResponseEntity<PropertyOfferResponse>
    +updateOffer(offerId: Long, request: UpdateOfferRequest): ResponseEntity<PropertyOfferResponse>
    +deleteOffer(offerId: Long): ResponseEntity<Void>
  }
```
## 1.1. class description
매물 오퍼의 활성화/수정/삭제를 처리하는 클래스이다. 오퍼 소유자 권한을 검증한다.

## 1.2. attribution 구분

### 1.2.1. propertyOfferService
* **name**: propertyOfferService
* **type**: PropertyOfferService
* **visibility**: private
* **description**: 오퍼 권한 검증과 상태 변경을 수행한다.

## 1.3. Operations 구분

### 1.3.1. toggleActive
* **name**: toggleActive
* **type**: ResponseEntity<PropertyOfferResponse>
* **visibility**: public
* **description**: 특정 오퍼의 활성/비활성을 토글한다.

### 1.3.2. updateOffer
* **name**: updateOffer
* **type**: ResponseEntity<PropertyOfferResponse>
* **visibility**: public
* **description**: 오퍼의 상세 정보를 수정한다.

### 1.3.3. deleteOffer
* **name**: deleteOffer
* **type**: ResponseEntity<Void>
* **visibility**: public
* **description**: 정책 검증 후 오퍼를 삭제한다.


# PropertyQueryController 클래스

```mermaid
classDiagram
  class PropertyQueryController {
    -propertyQueryService: PropertyQueryService
    +listAll(page: int, size: int, sort: String?): ResponseEntity<List<PropertyResponse>>
    +listMine(page: int, size: int, sort: String?): ResponseEntity<List<PropertyResponse>>
    +listOthers(page: int, size: int, sort: String?): ResponseEntity<List<PropertyResponse>>
    +getOne(id: Long): ResponseEntity<PropertyWithOffersDto>
  }
```
## 1.1. class description
목록/상세 조회(전체/내 것/타인 것) 엔드포인트를 제공하는 클래스이다.

## 1.2. attribution 구분

### 1.2.1. propertyQueryService
* **name**: propertyQueryService
* **type**: PropertyQueryService
* **visibility**: private
* **description**: 페이지네이션·정렬·상세 변환 로직을 수행한다.

## 1.3. Operations 구분

### 1.3.1. listAll
* **name**: listAll
* **type**: ResponseEntity<List<PropertyResponse>>
* **visibility**: public
* **description**: 전체 매물 목록을 조회한다.

### 1.3.2. listMine
* **name**: listMine
* **type**: ResponseEntity<List<PropertyResponse>>
* **visibility**: public
* **description**: 내가 등록한 매물 목록을 조회한다.

### 1.3.3. listOthers
* **name**: listOthers
* **type**: ResponseEntity<List<PropertyResponse>>
* **visibility**: public
* **description**: 타인이 등록한 매물 목록을 조회한다.

### 1.3.4. getOne
* **name**: getOne
* **type**: ResponseEntity<PropertyWithOffersDto>
* **visibility**: public
* **description**: 단건 상세(오퍼 포함)를 조회한다.


# PropertySearchController 클래스

```mermaid
classDiagram
  class PropertySearchController {
    -propertySearchRepository: PropertySearchRepository
    +search(request: SearchRequest): ResponseEntity<List<PropertyResponse>>
  }
```
## 1.1. class description
복합 조건의 검색을 수행하는 클래스이다.

## 1.2. attribution 구분

### 1.2.1. propertySearchRepository
* **name**: propertySearchRepository
* **type**: PropertySearchRepository
* **visibility**: private
* **description**: 동적 쿼리 빌드를 통해 검색을 수행한다.

## 1.3. Operations 구분

### 1.3.1. search
* **name**: search
* **type**: ResponseEntity<List<PropertyResponse>>
* **visibility**: public
* **description**: SearchRequest 바디를 받아 조건 검색을 수행한다.


# CompleteDealRequest 클래스

```mermaid
classDiagram
  class CompleteDealRequest {
    -propertyId: Long
    -newOwnerId: Long?
    +getPropertyId(): Long
    +getNewOwnerId(): Long?
  }
```
## 1.1. class description
거래 완료 처리에 필요한 입력 값을 담는 클래스이다.

## 1.2. attribution 구분

### 1.2.1. propertyId
* **name**: propertyId
* **type**: Long
* **visibility**: private
* **description**: 거래 완료 대상 매물의 식별자이다.

### 1.2.2. newOwnerId
* **name**: newOwnerId
* **type**: Long?
* **visibility**: private
* **description**: 거래 완료 시 새 소유자의 식별자이다(선택).

## 1.3. Operations 구분

### 1.3.1. getters/setters
* **name**: getters/setters
* **type**: Long / Long?
* **visibility**: public
* **description**: 직렬화/역직렬화를 위해 접근자를 제공한다.


# JeonseRatioResponse 클래스

```mermaid
classDiagram
  class JeonseRatioResponse {
    -ratio: BigDecimal
    -source: String
    -comment: String
    +of(ratio: BigDecimal, source: String, comment: String): JeonseRatioResponse
  }
```
## 1.1. class description
전세가율 계산 결과를 담는 클래스이다.

## 1.2. attribution 구분

### 1.2.1. ratio
* **name**: ratio
* **type**: BigDecimal
* **visibility**: private
* **description**: 계산된 전세가율 값이다.

### 1.2.2. source
* **name**: source
* **type**: String
* **visibility**: private
* **description**: 매매가의 출처를 나타낸다.

### 1.2.3. comment
* **name**: comment
* **type**: String
* **visibility**: private
* **description**: 전세가율 해석 코멘트이다.

## 1.3. Operations 구분

### 1.3.1. of
* **name**: of
* **type**: static factory
* **visibility**: public
* **description**: 전달된 값으로 응답 객체를 생성한다.


# PropertyDetailDto 클래스

```mermaid
classDiagram
  class PropertyDetailDto {
    -id: Long
    -title: String
    -address: String
    -price: BigDecimal
    -areaM2: BigDecimal
    -buildingYear: Integer
    -status: Status
    -ownerId: Long?
    -brokerId: Long?
    -lat: Double
    -lng: Double
    -images: List<String>
    +from(entity: Property): PropertyDetailDto
  }
```
## 1.1. class description
단건 상세 화면에 필요한 매물 정보를 묶는 클래스이다.

## 1.2. attribution 구분

### 1.2.1. id
* **name**: id
* **type**: Long
* **visibility**: private
* **description**: 매물의 식별자이다.

### 1.2.2. title
* **name**: title
* **type**: String
* **visibility**: private
* **description**: 매물의 제목이다.

### 1.2.3. address
* **name**: address
* **type**: String
* **visibility**: private
* **description**: 매물의 주소이다.

### 1.2.4. price
* **name**: price
* **type**: BigDecimal
* **visibility**: private
* **description**: 대표 가격(매매가)이다.

### 1.2.5. areaM2
* **name**: areaM2
* **type**: BigDecimal
* **visibility**: private
* **description**: 전용면적(m²)이다.

### 1.2.6. buildingYear
* **name**: buildingYear
* **type**: Integer
* **visibility**: private
* **description**: 준공년도이다.

### 1.2.7. status
* **name**: status
* **type**: Enum
* **visibility**: private
* **description**: 매물의 상태이다.

### 1.2.8. ownerId
* **name**: ownerId
* **type**: Long?
* **visibility**: private
* **description**: 소유자 식별자이다.

### 1.2.9. brokerId
* **name**: brokerId
* **type**: Long?
* **visibility**: private
* **description**: 브로커 식별자이다.

### 1.2.10. lat
* **name**: lat
* **type**: Double
* **visibility**: private
* **description**: 위도 값이다.

### 1.2.11. lng
* **name**: lng
* **type**: Double
* **visibility**: private
* **description**: 경도 값이다.

### 1.2.12. images
* **name**: images
* **type**: List<String>
* **visibility**: private
* **description**: 이미지 URL 목록이다.

## 1.3. Operations 구분

### 1.3.1. from
* **name**: from
* **type**: static builder
* **visibility**: public
* **description**: 엔티티와 연관 데이터로 DTO를 생성한다.


# PropertyFavoriteDto 클래스

```mermaid
classDiagram
  class PropertyFavoriteDto {
    -propertyId: Long
    -title: String
    -thumbnailUrl: String
    -price: BigDecimal
    -regionCode: String
    -favoredAt: Instant
    +of(...): PropertyFavoriteDto
  }
```
## 1.1. class description
찜 카드 목록 표시를 위한 정보를 담는 클래스이다.

## 1.2. attribution 구분

### 1.2.1. propertyId
* **name**: propertyId
* **type**: Long
* **visibility**: private
* **description**: 매물 식별자이다.

### 1.2.2. title
* **name**: title
* **type**: String
* **visibility**: private
* **description**: 매물 제목이다.

### 1.2.3. thumbnailUrl
* **name**: thumbnailUrl
* **type**: String
* **visibility**: private
* **description**: 대표 이미지 URL이다.

### 1.2.4. price
* **name**: price
* **type**: BigDecimal
* **visibility**: private
* **description**: 표시용 가격이다.

### 1.2.5. regionCode
* **name**: regionCode
* **type**: String
* **visibility**: private
* **description**: 행정 구역 코드이다.

### 1.2.6. favoredAt
* **name**: favoredAt
* **type**: Instant
* **visibility**: private
* **description**: 찜한 시각이다.

## 1.3. Operations 구분

### 1.3.1. of
* **name**: of
* **type**: static builder
* **visibility**: public
* **description**: 네이티브/템플릿 결과에서 DTO를 생성한다.


# PropertyFilterDto 클래스

```mermaid
classDiagram
  class PropertyFilterDto {
    -minX: Double
    -minY: Double
    -maxX: Double
    -maxY: Double
    -status: Status?
    -minPrice: BigDecimal?
    -maxPrice: BigDecimal?
    +normalized(): PropertyFilterDto
  }
```
## 1.1. class description
지도 범위/상태/가격 필터를 보관하는 클래스이다.

## 1.2. attribution 구분

### 1.2.1. minX
* **name**: minX
* **type**: Double
* **visibility**: private
* **description**: 좌하단 경도의 최소값이다.

### 1.2.2. minY
* **name**: minY
* **type**: Double
* **visibility**: private
* **description**: 좌하단 위도의 최소값이다.

### 1.2.3. maxX
* **name**: maxX
* **type**: Double
* **visibility**: private
* **description**: 우상단 경도의 최대값이다.

### 1.2.4. maxY
* **name**: maxY
* **type**: Double
* **visibility**: private
* **description**: 우상단 위도의 최대값이다.

### 1.2.5. status
* **name**: status
* **type**: Enum?
* **visibility**: private
* **description**: 매물 상태 필터이다.

### 1.2.6. minPrice
* **name**: minPrice
* **type**: BigDecimal?
* **visibility**: private
* **description**: 최소 가격 필터이다.

### 1.2.7. maxPrice
* **name**: maxPrice
* **type**: BigDecimal?
* **visibility**: private
* **description**: 최대 가격 필터이다.

## 1.3. Operations 구분

### 1.3.1. normalized
* **name**: normalized
* **type**: PropertyFilterDto
* **visibility**: public
* **description**: 경계 뒤집힘을 보정한 새 필터를 반환한다.


# PropertyMarkerDto 클래스

```mermaid
classDiagram
  class PropertyMarkerDto {
    -propertyId: Long
    -lat: Double
    -lng: Double
    -price: BigDecimal
    -status: Status
    +fromEntity(entity: Property): PropertyMarkerDto
  }
```
## 1.1. class description
지도 마커 렌더링에 필요한 최소 정보를 담는 클래스이다.

## 1.2. attribution 구분

### 1.2.1. propertyId
* **name**: propertyId
* **type**: Long
* **visibility**: private
* **description**: 매물 식별자이다.

### 1.2.2. lat
* **name**: lat
* **type**: Double
* **visibility**: private
* **description**: 위도 값이다.

### 1.2.3. lng
* **name**: lng
* **type**: Double
* **visibility**: private
* **description**: 경도 값이다.

### 1.2.4. price
* **name**: price
* **type**: BigDecimal
* **visibility**: private
* **description**: 표시용 가격이다.

### 1.2.5. status
* **name**: status
* **type**: Enum
* **visibility**: private
* **description**: 매물 상태이다.

## 1.3. Operations 구분

### 1.3.1. fromEntity
* **name**: fromEntity
* **type**: static builder
* **visibility**: public
* **description**: 엔티티로부터 DTO를 생성한다.


# PropertyOfferCreateRequest 클래스

```mermaid
classDiagram
  class PropertyOfferCreateRequest {
    -type: Enum
    -houseType: Enum
    -totalPrice: BigDecimal?
    -deposit: BigDecimal?
    -monthlyRent: BigDecimal?
    -maintenanceFee: BigDecimal?
    -floor: Integer?
    -availableFrom: LocalDate?
    -negotiable: Boolean
    -optionsBitset: String?
    +toEntity(property: Property): PropertyOffer
  }
```
## 1.1. class description
오퍼 생성/수정 입력을 담는 클래스이다.

## 1.2. attribution 구분

### 1.2.1. type
* **name**: type
* **type**: Enum
* **visibility**: private
* **description**: 거래 유형이다.

### 1.2.2. houseType
* **name**: houseType
* **type**: Enum
* **visibility**: private
* **description**: 주택 유형이다.

### 1.2.3. totalPrice
* **name**: totalPrice
* **type**: BigDecimal?
* **visibility**: private
* **description**: 매매가이다.

### 1.2.4. deposit
* **name**: deposit
* **type**: BigDecimal?
* **visibility**: private
* **description**: 보증금이다.

### 1.2.5. monthlyRent
* **name**: monthlyRent
* **type**: BigDecimal?
* **visibility**: private
* **description**: 월세 금액이다.

### 1.2.6. maintenanceFee
* **name**: maintenanceFee
* **type**: BigDecimal?
* **visibility**: private
* **description**: 관리비이다.

### 1.2.7. floor
* **name**: floor
* **type**: Integer?
* **visibility**: private
* **description**: 층수이다.

### 1.2.8. availableFrom
* **name**: availableFrom
* **type**: LocalDate?
* **visibility**: private
* **description**: 입주 가능일이다.

### 1.2.9. negotiable
* **name**: negotiable
* **type**: Boolean
* **visibility**: private
* **description**: 가격 협상 가능 여부이다.

### 1.2.10. optionsBitset
* **name**: optionsBitset
* **type**: String?
* **visibility**: private
* **description**: 옵션 비트마스크 문자열이다.

## 1.3. Operations 구분

### 1.3.1. toEntity
* **name**: toEntity
* **type**: PropertyOffer
* **visibility**: public
* **description**: 유효성 검증 후 엔티티로 변환한다.


# PropertyOfferDto 클래스

```mermaid
classDiagram
  class PropertyOfferDto {
    -offerId: Long
    -type: Enum
    -totalPrice: BigDecimal?
    -deposit: BigDecimal?
    -monthlyRent: BigDecimal?
    -isActive: Boolean
    -floor: Integer?
    -availableFrom: LocalDate?
    +fromEntity(offer: PropertyOffer): PropertyOfferDto
  }
```
## 1.1. class description
화면 표시용 오퍼 정보를 담는 클래스이다.

## 1.2. attribution 구분

### 1.2.1. offerId
* **name**: offerId
* **type**: Long
* **visibility**: private
* **description**: 오퍼의 식별자이다.

### 1.2.2. type
* **name**: type
* **type**: Enum
* **visibility**: private
* **description**: 거래 유형이다.

### 1.2.3. totalPrice
* **name**: totalPrice
* **type**: BigDecimal?
* **visibility**: private
* **description**: 매매가이다.

### 1.2.4. deposit
* **name**: deposit
* **type**: BigDecimal?
* **visibility**: private
* **description**: 보증금이다.

### 1.2.5. monthlyRent
* **name**: monthlyRent
* **type**: BigDecimal?
* **visibility**: private
* **description**: 월세 금액이다.

### 1.2.6. isActive
* **name**: isActive
* **type**: Boolean
* **visibility**: private
* **description**: 활성 여부이다.

### 1.2.7. floor
* **name**: floor
* **type**: Integer?
* **visibility**: private
* **description**: 층수이다.

### 1.2.8. availableFrom
* **name**: availableFrom
* **type**: LocalDate?
* **visibility**: private
* **description**: 입주 가능일이다.

## 1.3. Operations 구분

### 1.3.1. fromEntity
* **name**: fromEntity
* **type**: static builder
* **visibility**: public
* **description**: 오퍼 엔티티를 DTO로 변환한다.


# PropertyOfferResponse 클래스

```mermaid
classDiagram
  class PropertyOfferResponse {
    -offer: PropertyOfferDto
    -message: String
    +of(offer: PropertyOfferDto, message: String): PropertyOfferResponse
  }
```
## 1.1. class description
오퍼 활성 토글/수정/삭제 응답을 담는 클래스이다.

## 1.2. attribution 구분

### 1.2.1. offer
* **name**: offer
* **type**: PropertyOfferDto
* **visibility**: private
* **description**: 응답에 포함되는 오퍼 DTO이다.

### 1.2.2. message
* **name**: message
* **type**: String
* **visibility**: private
* **description**: 처리 결과 메시지이다.

## 1.3. Operations 구분

### 1.3.1. of
* **name**: of
* **type**: static factory
* **visibility**: public
* **description**: 편의 생성기를 제공한다.


# PropertyResponse 클래스

```mermaid
classDiagram
  class PropertyResponse {
    -id: Long
    -title: String
    -regionCode: String
    -price: BigDecimal
    -thumbnailUrl: String?
    -createdAt: Instant
    -status: Enum
    -listingType: Enum
    +from(property: Property): PropertyResponse
  }
```
## 1.1. class description
목록 화면용 매물 요약 정보를 담는 클래스이다.

## 1.2. attribution 구분

### 1.2.1. id
* **name**: id
* **type**: Long
* **visibility**: private
* **description**: 매물 식별자이다.

### 1.2.2. title
* **name**: title
* **type**: String
* **visibility**: private
* **description**: 매물 제목이다.

### 1.2.3. regionCode
* **name**: regionCode
* **type**: String
* **visibility**: private
* **description**: 행정 구역 코드이다.

### 1.2.4. price
* **name**: price
* **type**: BigDecimal
* **visibility**: private
* **description**: 대표 가격이다.

### 1.2.5. thumbnailUrl
* **name**: thumbnailUrl
* **type**: String?
* **visibility**: private
* **description**: 썸네일 URL이다.

### 1.2.6. createdAt
* **name**: createdAt
* **type**: Instant
* **visibility**: private
* **description**: 생성일시이다.

### 1.2.7. status
* **name**: status
* **type**: Enum
* **visibility**: private
* **description**: 상태 값이다.

### 1.2.8. listingType
* **name**: listingType
* **type**: Enum
* **visibility**: private
* **description**: 등록 유형이다.

## 1.3. Operations 구분

### 1.3.1. from
* **name**: from
* **type**: static builder
* **visibility**: public
* **description**: 엔티티/조인 결과에서 DTO로 변환한다.


# PropertyWithOffersDto 클래스

```mermaid
classDiagram
  class PropertyWithOffersDto {
    -property: PropertyDetailDto
    -offers: List<PropertyOfferDto>
    +of(property: PropertyDetailDto, offers: List<PropertyOfferDto>): PropertyWithOffersDto
  }
```
## 1.1. class description
상세 화면에서 매물 + 다수 오퍼를 함께 반환하는 클래스이다.

## 1.2. attribution 구분

### 1.2.1. property
* **name**: property
* **type**: PropertyDetailDto
* **visibility**: private
* **description**: 매물 상세 DTO이다.

### 1.2.2. offers
* **name**: offers
* **type**: List<PropertyOfferDto>
* **visibility**: private
* **description**: 오퍼 DTO 목록이다.

## 1.3. Operations 구분

### 1.3.1. of
* **name**: of
* **type**: static factory
* **visibility**: public
* **description**: 편의 생성기를 제공한다.


# UpdateOfferRequest 클래스

```mermaid
classDiagram
  class UpdateOfferRequest {
    -totalPrice: BigDecimal?
    -deposit: BigDecimal?
    -monthlyRent: BigDecimal?
    -maintenanceFee: BigDecimal?
    -floor: Integer?
    -availableFrom: LocalDate?
    -negotiable: Boolean?
    -optionsBitset: String?
    +applyTo(offer: PropertyOffer)
  }
```
## 1.1. class description
오퍼 수정에 필요한 입력 값을 담는 클래스이다.

## 1.2. attribution 구분

### 1.2.1. totalPrice
* **name**: totalPrice
* **type**: BigDecimal?
* **visibility**: private
* **description**: 매매가(선택)이다.

### 1.2.2. deposit
* **name**: deposit
* **type**: BigDecimal?
* **visibility**: private
* **description**: 보증금(선택)이다.

### 1.2.3. monthlyRent
* **name**: monthlyRent
* **type**: BigDecimal?
* **visibility**: private
* **description**: 월세(선택)이다.

### 1.2.4. maintenanceFee
* **name**: maintenanceFee
* **type**: BigDecimal?
* **visibility**: private
* **description**: 관리비(선택)이다.

### 1.2.5. floor
* **name**: floor
* **type**: Integer?
* **visibility**: private
* **description**: 층수(선택)이다.

### 1.2.6. availableFrom
* **name**: availableFrom
* **type**: LocalDate?
* **visibility**: private
* **description**: 입주 가능일(선택)이다.

### 1.2.7. negotiable
* **name**: negotiable
* **type**: Boolean?
* **visibility**: private
* **description**: 협상 가능 여부(선택)이다.

### 1.2.8. optionsBitset
* **name**: optionsBitset
* **type**: String?
* **visibility**: private
* **description**: 옵션 비트마스크(선택)이다.

## 1.3. Operations 구분

### 1.3.1. applyTo
* **name**: applyTo
* **type**: void
* **visibility**: public
* **description**: 전달된 엔티티에 변경 사항을 반영한다.


# SearchRequest 클래스

```mermaid
classDiagram
  class SearchRequest {
    -types: List<Enum>
    -minArea: BigDecimal?
    -maxArea: BigDecimal?
    -minFloor: Integer?
    -maxFloor: Integer?
    -optionMode: Enum
    -optionBits: String?
    -minSale: BigDecimal?
    -maxSale: BigDecimal?
    -minJeonse: BigDecimal?
    -maxJeonse: BigDecimal?
    -minWolse: BigDecimal?
    -maxWolse: BigDecimal?
    -minYear: Integer?
    -maxYear: Integer?
    -page: Integer
    -size: Integer
    -sort: String?
    +toCriteria(): Map<String, Object>
  }
```
## 1.1. class description
다중 조건 검색을 위한 요청 바디를 담는 클래스이다.

## 1.2. attribution 구분

### 1.2.1. types
* **name**: types
* **type**: List<Enum>
* **visibility**: private
* **description**: 오퍼 타입 목록이다.

### 1.2.2. minArea
* **name**: minArea
* **type**: BigDecimal?
* **visibility**: private
* **description**: 면적 최소값이다.

### 1.2.3. maxArea
* **name**: maxArea
* **type**: BigDecimal?
* **visibility**: private
* **description**: 면적 최대값이다.

### 1.2.4. minFloor
* **name**: minFloor
* **type**: Integer?
* **visibility**: private
* **description**: 층수 최소값이다.

### 1.2.5. maxFloor
* **name**: maxFloor
* **type**: Integer?
* **visibility**: private
* **description**: 층수 최대값이다.

### 1.2.6. optionMode
* **name**: optionMode
* **type**: Enum
* **visibility**: private
* **description**: 옵션 비트마스크 매칭 모드이다.

### 1.2.7. optionBits
* **name**: optionBits
* **type**: String?
* **visibility**: private
* **description**: 옵션 비트마스크 문자열이다.

### 1.2.8. minSale/maxSale/minJeonse/maxJeonse/minWolse/maxWolse
* **name**: minSale/maxSale/minJeonse/maxJeonse/minWolse/maxWolse
* **type**: BigDecimal?×6
* **visibility**: private
* **description**: 거래유형별 가격 범위 필터이다.

### 1.2.9. minYear
* **name**: minYear
* **type**: Integer?
* **visibility**: private
* **description**: 준공년도 최소값이다.

### 1.2.10. maxYear
* **name**: maxYear
* **type**: Integer?
* **visibility**: private
* **description**: 준공년도 최대값이다.

### 1.2.11. page
* **name**: page
* **type**: Integer
* **visibility**: private
* **description**: 페이지 번호이다.

### 1.2.12. size
* **name**: size
* **type**: Integer
* **visibility**: private
* **description**: 페이지 크기이다.

### 1.2.13. sort
* **name**: sort
* **type**: String?
* **visibility**: private
* **description**: 정렬 스펙이다.

## 1.3. Operations 구분

### 1.3.1. toCriteria
* **name**: toCriteria
* **type**: Map<String, Object>
* **visibility**: public
* **description**: 검색 레포지토리에 전달할 파라미터 맵으로 변환한다.


# FavoriteJpaRepository 클래스

```mermaid
classDiagram
  class FavoriteJpaRepository {
    -entityManager: EntityManager
    +existsByUserIdAndPropertyId(userId: Long, propertyId: Long): boolean
    +deleteByUserIdAndPropertyId(userId: Long, propertyId: Long): long
    +countByPropertyId(propertyId: Long): long
    +findUserIdsByPropertyId(propertyId: Long): List<Long>
  }
```
## 1.1. class description
찜(Favorite) 엔티티 JPA 접근을 제공하는 클래스이다.

## 1.2. attribution 구분

### 1.2.1. entityManager
* **name**: entityManager
* **type**: EntityManager
* **visibility**: protected
* **description**: 기본 JPA 동작에 사용한다.

## 1.3. Operations 구분

### 1.3.1. existsByUserIdAndPropertyId
* **name**: existsByUserIdAndPropertyId
* **type**: boolean
* **visibility**: public
* **description**: 특정 유저-매물 조합의 찜 존재 여부를 확인한다.

### 1.3.2. deleteByUserIdAndPropertyId
* **name**: deleteByUserIdAndPropertyId
* **type**: long
* **visibility**: public
* **description**: 찜을 삭제한다.

### 1.3.3. countByPropertyId
* **name**: countByPropertyId
* **type**: long
* **visibility**: public
* **description**: 매물의 총 찜 수를 반환한다.

### 1.3.4. findUserIdsByPropertyId
* **name**: findUserIdsByPropertyId
* **type**: List<Long>
* **visibility**: public
* **description**: 해당 매물을 찜한 사용자 ID 목록을 반환한다.


# PropertyFavoriteRepository 클래스

```mermaid
classDiagram
  class PropertyFavoriteRepository {
    -jdbcTemplate: NamedParameterJdbcTemplate
    +findFavorites(userId: Long, limit: int, offset: int): List<PropertyFavoriteDto>
  }
```
## 1.1. class description
네이티브 SQL/템플릿으로 찜 목록 조회를 제공하는 클래스이다.

## 1.2. attribution 구분

### 1.2.1. jdbcTemplate
* **name**: jdbcTemplate
* **type**: NamedParameterJdbcTemplate
* **visibility**: private
* **description**: 네이티브 조인/페이지네이션 처리를 수행한다.

## 1.3. Operations 구분

### 1.3.1. findFavorites
* **name**: findFavorites
* **type**: List<PropertyFavoriteDto>
* **visibility**: public
* **description**: 썸네일 1장을 포함하여 내 찜 목록을 조회한다.


# PropertyOfferRepository 클래스

```mermaid
classDiagram
  class PropertyOfferRepository {
    +jpaRepository: SpringData
    +findByPropertyId(propertyId: Long): List<PropertyOffer>
    +findActiveJeonseTop1ByPropertyIdOrderByUpdatedAtDesc(propertyId: Long): Optional<PropertyOffer>
  }
```
## 1.1. class description
오퍼 엔티티 JPA 접근을 제공하는 클래스이다.

## 1.2. attribution 구분

### 1.2.1. jpaRepository
* **name**: jpaRepository
* **type**: Spring Data Infrastructure
* **visibility**: public
* **description**: 표준 CRUD/조회 기능을 제공한다.

## 1.3. Operations 구분

### 1.3.1. findByPropertyId
* **name**: findByPropertyId
* **type**: List<PropertyOffer>
* **visibility**: public
* **description**: 특정 매물의 모든 오퍼를 조회한다.

### 1.3.2. findActiveJeonseTop1ByPropertyIdOrderByUpdatedAtDesc
* **name**: findActiveJeonseTop1ByPropertyIdOrderByUpdatedAtDesc
* **type**: Optional<PropertyOffer>
* **visibility**: public
* **description**: 활성 전세 오퍼 최신 1건을 조회한다.


# PropertyRepository 클래스

```mermaid
classDiagram
  class PropertyRepository {
    -entityManager: EntityManager
    +findInBounds(minX: double, minY: double, maxX: double, maxY: double, status: Status?, minPrice: BigDecimal?, maxPrice: BigDecimal?): List<Property>
    +markAsSoldIfBrokerAuthorized(propertyId: Long, brokerId: Long): int
  }
```
## 1.1. class description
매물 엔티티 JPA 접근을 제공하는 클래스이다.

## 1.2. attribution 구분

### 1.2.1. entityManager
* **name**: entityManager
* **type**: EntityManager
* **visibility**: protected
* **description**: JPQL 업데이트 및 조회에 사용한다.

## 1.3. Operations 구분

### 1.3.1. findInBounds
* **name**: findInBounds
* **type**: List<Property>
* **visibility**: public
* **description**: 지도 경계/상태/가격으로 필터링된 매물을 조회한다.

### 1.3.2. markAsSoldIfBrokerAuthorized
* **name**: markAsSoldIfBrokerAuthorized
* **type**: int
* **visibility**: public
* **description**: 브로커 권한/상태 조건을 만족할 때 거래 완료로 업데이트한다.


# PropertySearchRepository 클래스

```mermaid
classDiagram
  class PropertySearchRepository {
    -jdbcTemplate: NamedParameterJdbcTemplate
    +search(params: Map<String,Object>): List<PropertyResponse>
  }
```
## 1.1. class description
NamedParameterJdbcTemplate로 복합 검색을 수행하는 클래스이다.

## 1.2. attribution 구분

### 1.2.1. jdbcTemplate
* **name**: jdbcTemplate
* **type**: NamedParameterJdbcTemplate
* **visibility**: private
* **description**: SQL 실행과 매핑을 담당한다.

## 1.3. Operations 구분

### 1.3.1. search
* **name**: search
* **type**: List<PropertyResponse>
* **visibility**: public
* **description**: SearchRequest를 해석해 필터링/페이징된 결과를 반환한다.


# PropertywoRepository 클래스

```mermaid
classDiagram
  class PropertywoRepository {
    +jpaRepository: SpringData
    +findAllByStatusOrderByCreatedAtDesc(status: Status, pageable: Pageable): Page<Property>
    +findAllByOwnerId(ownerId: Long, pageable: Pageable): Page<Property>
  }
```
## 1.1. class description
매물 목록 페이지네이션 파생 쿼리를 제공하는 클래스이다.

## 1.2. attribution 구분

### 1.2.1. jpaRepository
* **name**: jpaRepository
* **type**: Spring Data Infrastructure
* **visibility**: public
* **description**: 표준 CRUD/조회 기능을 제공한다.

## 1.3. Operations 구분

### 1.3.1. findAllByStatusOrderByCreatedAtDesc
* **name**: findAllByStatusOrderByCreatedAtDesc
* **type**: Page<Property>
* **visibility**: public
* **description**: 상태별 최신순 목록을 반환한다.

### 1.3.2. findAllByOwnerId
* **name**: findAllByOwnerId
* **type**: Page<Property>
* **visibility**: public
* **description**: 내 매물만 페이지네이션으로 조회한다.


# JeonseRatioService 클래스

```mermaid
classDiagram
  class JeonseRatioService {
    -propertyRepository: PropertyRepository
    -propertyOfferRepository: PropertyOfferRepository
    +calculate(propertyId: Long, offerId: Long?, clientSalePrice: BigDecimal?): JeonseRatioResponse
  }
```
## 1.1. class description
전세가율을 계산하는 클래스이다.

## 1.2. attribution 구분

### 1.2.1. propertyRepository
* **name**: propertyRepository
* **type**: PropertyRepository
* **visibility**: private
* **description**: 매물 정보를 조회한다.

### 1.2.2. propertyOfferRepository
* **name**: propertyOfferRepository
* **type**: PropertyOfferRepository
* **visibility**: private
* **description**: 오퍼 정보를 조회한다.

## 1.3. Operations 구분

### 1.3.1. calculate
* **name**: calculate
* **type**: JeonseRatioResponse
* **visibility**: public
* **description**: 보증금/매매가로 전세가율을 계산한다(소수 둘째 자리 반올림).


# PropertyFavoriteService 클래스

```mermaid
classDiagram
  class PropertyFavoriteService {
    -favoriteJpaRepository: FavoriteJpaRepository
    -propertyFavoriteRepository: PropertyFavoriteRepository
    +toggle(userId: Long, propertyId: Long): boolean
    +delete(userId: Long, propertyId: Long)
    +list(userId: Long, limit: int, offset: int): List<PropertyFavoriteDto>
    +exists(userId: Long, propertyId: Long): boolean
    +count(propertyId: Long): long
  }
```
## 1.1. class description
찜 토글/삭제/조회 로직을 제공하는 클래스이다.

## 1.2. attribution 구분

### 1.2.1. favoriteJpaRepository
* **name**: favoriteJpaRepository
* **type**: FavoriteJpaRepository
* **visibility**: private
* **description**: 단순 존재/삭제/카운트 조회에 사용한다.

### 1.2.2. propertyFavoriteRepository
* **name**: propertyFavoriteRepository
* **type**: PropertyFavoriteRepository
* **visibility**: private
* **description**: 조인 기반 찜 목록 조회에 사용한다.

## 1.3. Operations 구분

### 1.3.1. toggle
* **name**: toggle
* **type**: boolean
* **visibility**: public
* **description**: 찜을 토글하고 현재 상태를 반환한다.

### 1.3.2. delete
* **name**: delete
* **type**: void
* **visibility**: public
* **description**: 찜을 명시적으로 해제한다.

### 1.3.3. list
* **name**: list
* **type**: List<PropertyFavoriteDto>
* **visibility**: public
* **description**: 내 찜 목록을 조회한다.

### 1.3.4. exists
* **name**: exists
* **type**: boolean
* **visibility**: public
* **description**: 특정 유저-매물 찜 존재 여부를 확인한다.

### 1.3.5. count
* **name**: count
* **type**: long
* **visibility**: public
* **description**: 해당 매물의 찜 수를 반환한다.


# PropertyOfferService 클래스

```mermaid
classDiagram
  class PropertyOfferService {
    -propertyOfferRepository: PropertyOfferRepository
    +toggleActive(offerId: Long, userId: Long): PropertyOfferResponse
    +update(offerId: Long, request: UpdateOfferRequest, userId: Long): PropertyOfferResponse
    +delete(offerId: Long, userId: Long)
  }
```
## 1.1. class description
오퍼의 권한 검증 및 상태 변경을 수행하는 클래스이다.

## 1.2. attribution 구분

### 1.2.1. propertyOfferRepository
* **name**: propertyOfferRepository
* **type**: PropertyOfferRepository
* **visibility**: private
* **description**: 오퍼 CRUD에 사용한다.

## 1.3. Operations 구분

### 1.3.1. toggleActive
* **name**: toggleActive
* **type**: PropertyOfferResponse
* **visibility**: public
* **description**: 오퍼 활성/비활성을 토글한다.

### 1.3.2. update
* **name**: update
* **type**: PropertyOfferResponse
* **visibility**: public
* **description**: 오퍼 내용을 수정한다.

### 1.3.3. delete
* **name**: delete
* **type**: void
* **visibility**: public
* **description**: 삭제 정책을 검증한 뒤 오퍼를 삭제한다.


# PropertyQueryService 클래스

```mermaid
classDiagram
  class PropertyQueryService {
    -propertywoRepository: PropertywoRepository
    -propertyOfferRepository: PropertyOfferRepository
    +listAll(page: int, size: int, sort: String?): List<PropertyResponse>
    +listMine(userId: Long, page: int, size: int, sort: String?): List<PropertyResponse>
    +listOthers(userId: Long, page: int, size: int, sort: String?): List<PropertyResponse>
    +getOneWithOffers(id: Long): PropertyWithOffersDto
  }
```
## 1.1. class description
목록/상세 조회를 담당하는 클래스이다.

## 1.2. attribution 구분

### 1.2.1. propertywoRepository
* **name**: propertywoRepository
* **type**: PropertywoRepository
* **visibility**: private
* **description**: 페이지네이션 목록 조회에 사용한다.

### 1.2.2. propertyOfferRepository
* **name**: propertyOfferRepository
* **type**: PropertyOfferRepository
* **visibility**: private
* **description**: 오퍼 묶음 조회에 사용한다.

## 1.3. Operations 구분

### 1.3.1. listAll
* **name**: listAll
* **type**: List<PropertyResponse>
* **visibility**: public
* **description**: 전체 목록을 조회한다.

### 1.3.2. listMine
* **name**: listMine
* **type**: List<PropertyResponse>
* **visibility**: public
* **description**: 내가 등록한 매물 목록을 조회한다.

### 1.3.3. listOthers
* **name**: listOthers
* **type**: List<PropertyResponse>
* **visibility**: public
* **description**: 타인이 등록한 매물 목록을 조회한다.

### 1.3.4. getOneWithOffers
* **name**: getOneWithOffers
* **type**: PropertyWithOffersDto
* **visibility**: public
* **description**: 단건 상세와 오퍼 리스트를 함께 반환한다.


# propertyservice 클래스

```mermaid
classDiagram
  class propertyservice {
    -propertyRepository: PropertyRepository
    -propertyOfferRepository: PropertyOfferRepository
    +getMarkers(filter: PropertyFilterDto): List<PropertyMarkerDto>
    +getDetail(id: Long): PropertyDetailDto
    +completeDeal(request: CompleteDealRequest, brokerId: Long)
  }
```
## 1.1. class description
지도 마커 조회, 단건 상세, 브로커 거래 완료를 처리하는 클래스이다.

## 1.2. attribution 구분

### 1.2.1. propertyRepository
* **name**: propertyRepository
* **type**: PropertyRepository
* **visibility**: private
* **description**: 매물 조회 및 업데이트에 사용한다.

### 1.2.2. propertyOfferRepository
* **name**: propertyOfferRepository
* **type**: PropertyOfferRepository
* **visibility**: private
* **description**: 오퍼 조회에 사용한다.

## 1.3. Operations 구분

### 1.3.1. getMarkers
* **name**: getMarkers
* **type**: List<PropertyMarkerDto>
* **visibility**: public
* **description**: lat=Y/lng=X 규칙으로 지도 마커를 생성한다.

### 1.3.2. getDetail
* **name**: getDetail
* **type**: PropertyDetailDto
* **visibility**: public
* **description**: 단건 상세 데이터를 생성한다.

### 1.3.3. completeDeal
* **name**: completeDeal
* **type**: void
* **visibility**: public
* **description**: 브로커 권한 검증 후 거래 완료를 반영하고 이벤트를 발행한다.


# Favorite 클래스

```mermaid
classDiagram
  class BaseEntity {
    +createdAt: Instant
    +updatedAt: Instant
  }
  class Favorite {
    -id: Long
    -userId: Long
    -propertyId: Long
    +@PrePersist setCreatedAt()
  }
  BaseEntity <|-- Favorite
```
## 1.1. class description
유저와 매물 간의 찜 관계를 나타내는 클래스이다.

## 1.2. attribution 구분

### 1.2.1. id
* **name**: id
* **type**: Long
* **visibility**: private
* **description**: PK 식별자이다.

### 1.2.2. userId
* **name**: userId
* **type**: Long
* **visibility**: private
* **description**: 사용자 식별자이다.

### 1.2.3. propertyId
* **name**: propertyId
* **type**: Long
* **visibility**: private
* **description**: 매물 식별자이다.

### 1.2.4. createdAt
* **name**: createdAt
* **type**: Instant
* **visibility**: private
* **description**: 생성일시는 상속.

## 1.3. Operations 구분

### 1.3.1. @PrePersist setCreatedAt
* **name**: @PrePersist setCreatedAt
* **type**: void
* **visibility**: private
* **description**: 저장 시 생성일을 기록한다.


# PriceAnomaly 클래스

```mermaid
classDiagram
  class BaseEntity {
    +createdAt: Instant
    +updatedAt: Instant
  }
  class PriceAnomaly {
    -id: Long
    -property: Property
    -score: BigDecimal
    -reason: String
    +@PrePersist setCreatedAt()
  }
  BaseEntity <|-- PriceAnomaly
```
## 1.1. class description
매물의 가격 이상치 정보를 기록하는 클래스이다.

## 1.2. attribution 구분

### 1.2.1. id
* **name**: id
* **type**: Long
* **visibility**: private
* **description**: PK 식별자이다.

### 1.2.2. property
* **name**: property
* **type**: Property
* **visibility**: private
* **description**: 대상 매물 레퍼런스이다.

### 1.2.3. score
* **name**: score
* **type**: BigDecimal
* **visibility**: private
* **description**: 이상치 점수이다.

### 1.2.4. reason
* **name**: reason
* **type**: String
* **visibility**: private
* **description**: 이상치 사유이다.

### 1.2.5. createdAt
* **name**: createdAt
* **type**: Instant
* **visibility**: private
* **description**: 생성일시는 상속.

## 1.3. Operations 구분

### 1.3.1. @PrePersist setCreatedAt
* **name**: @PrePersist setCreatedAt
* **type**: void
* **visibility**: private
* **description**: 저장 시 생성일을 기록한다.


# Property 클래스

```mermaid
classDiagram
  class BaseEntity {
    +createdAt: Instant
    +updatedAt: Instant
  }
  class Property {
    -id: Long
    -title: String
    -address: String
    -regionCode: String
    -locationX: Double
    -locationY: Double
    -areaM2: BigDecimal
    -price: BigDecimal
    -status: Enum
    -listingType: Enum
    -buildingYear: Integer
    -ownerId: Long?
    -brokerId: Long?
    -anomalyAlert: Boolean
    +@PrePersist setCreatedAt()
    +@PreUpdate setUpdatedAt()
  }
  BaseEntity <|-- Property
```
## 1.1. class description
매물의 기본 정보를 나타내는 클래스이다.

## 1.2. attribution 구분

### 1.2.1. id
* **name**: id
* **type**: Long
* **visibility**: private
* **description**: PK 식별자이다.

### 1.2.2. title
* **name**: title
* **type**: String
* **visibility**: private
* **description**: 매물 제목이다.

### 1.2.3. address
* **name**: address
* **type**: String
* **visibility**: private
* **description**: 주소이다.

### 1.2.4. regionCode
* **name**: regionCode
* **type**: String
* **visibility**: private
* **description**: 행정 구역 코드이다.

### 1.2.5. locationX
* **name**: locationX
* **type**: Double
* **visibility**: private
* **description**: 경도 값이다.

### 1.2.6. locationY
* **name**: locationY
* **type**: Double
* **visibility**: private
* **description**: 위도 값이다.

### 1.2.7. areaM2
* **name**: areaM2
* **type**: BigDecimal
* **visibility**: private
* **description**: 전용면적(m²)이다.

### 1.2.8. price
* **name**: price
* **type**: BigDecimal
* **visibility**: private
* **description**: 대표 가격이다.

### 1.2.9. status
* **name**: status
* **type**: Enum
* **visibility**: private
* **description**: 상태 값이다.

### 1.2.10. listingType
* **name**: listingType
* **type**: Enum
* **visibility**: private
* **description**: 등록 유형이다.

### 1.2.11. buildingYear
* **name**: buildingYear
* **type**: Integer
* **visibility**: private
* **description**: 준공년도이다.

### 1.2.12. ownerId
* **name**: ownerId
* **type**: Long?
* **visibility**: private
* **description**: 소유자 식별자이다.

### 1.2.13. brokerId
* **name**: brokerId
* **type**: Long?
* **visibility**: private
* **description**: 브로커 식별자이다.

### 1.2.14. anomalyAlert
* **name**: anomalyAlert
* **type**: Boolean
* **visibility**: private
* **description**: 이상치 경고 여부이다.

### 1.2.15. createdAt/updatedAt
* **name**: createdAt/updatedAt
* **type**: Instant
* **visibility**: private
* **description**: 상속된 생성/갱신일시이다.

## 1.3. Operations 구분

### 1.3.1. @PrePersist setCreatedAt
* **name**: @PrePersist setCreatedAt
* **type**: void
* **visibility**: private
* **description**: 저장 시 생성일을 기록한다.

### 1.3.2. @PreUpdate setUpdatedAt
* **name**: @PreUpdate setUpdatedAt
* **type**: void
* **visibility**: private
* **description**: 수정 시 갱신일을 기록한다.


# PropertyImage 클래스

```mermaid
classDiagram
  class BaseEntity {
    +createdAt: Instant
    +updatedAt: Instant
  }
  class PropertyImage {
    -id: Long
    -property: Property
    -imageUrl: String
    -sortOrder: Integer
    +@PrePersist setCreatedAt()
  }
  BaseEntity <|-- PropertyImage
```
## 1.1. class description
매물의 이미지 정보를 나타내는 클래스이다.

## 1.2. attribution 구분

### 1.2.1. id
* **name**: id
* **type**: Long
* **visibility**: private
* **description**: PK 식별자이다.

### 1.2.2. property
* **name**: property
* **type**: Property
* **visibility**: private
* **description**: 소속 매물이다.

### 1.2.3. imageUrl
* **name**: imageUrl
* **type**: String
* **visibility**: private
* **description**: 이미지 URL이다.

### 1.2.4. sortOrder
* **name**: sortOrder
* **type**: Integer
* **visibility**: private
* **description**: 정렬 순서이다.

### 1.2.5. createdAt
* **name**: createdAt
* **type**: Instant
* **visibility**: private
* **description**: 생성일시는 상속.

## 1.3. Operations 구분

### 1.3.1. @PrePersist setCreatedAt
* **name**: @PrePersist setCreatedAt
* **type**: void
* **visibility**: private
* **description**: 저장 시 생성일을 기록한다.


# PropertyOffer 클래스

```mermaid
classDiagram
  class BaseEntity {
    +createdAt: Instant
    +updatedAt: Instant
  }
  class PropertyOffer {
    -id: Long
    -property: Property
    -type: Enum
    -houseType: Enum
    -totalPrice: BigDecimal?
    -deposit: BigDecimal?
    -monthlyRent: BigDecimal?
    -maintenanceFee: BigDecimal?
    -floor: Integer?
    -availableFrom: LocalDate?
    -negotiable: Boolean
    -isActive: Boolean
    -optionsBitset: String?
    +@PrePersist setCreatedAt()
    +@PreUpdate setUpdatedAt()
  }
  BaseEntity <|-- PropertyOffer
```
## 1.1. class description
매물의 판매/전세/월세 등 거래 제안을 나타내는 클래스이다.

## 1.2. attribution 구분

### 1.2.1. id
* **name**: id
* **type**: Long
* **visibility**: private
* **description**: PK 식별자이다.

### 1.2.2. property
* **name**: property
* **type**: Property
* **visibility**: private
* **description**: 대상 매물이다.

### 1.2.3. type
* **name**: type
* **type**: Enum
* **visibility**: private
* **description**: 거래 유형이다.

### 1.2.4. houseType
* **name**: houseType
* **type**: Enum
* **visibility**: private
* **description**: 주택 유형이다.

### 1.2.5. totalPrice
* **name**: totalPrice
* **type**: BigDecimal?
* **visibility**: private
* **description**: 매매가이다.

### 1.2.6. deposit
* **name**: deposit
* **type**: BigDecimal?
* **visibility**: private
* **description**: 보증금이다.

### 1.2.7. monthlyRent
* **name**: monthlyRent
* **type**: BigDecimal?
* **visibility**: private
* **description**: 월세이다.

### 1.2.8. maintenanceFee
* **name**: maintenanceFee
* **type**: BigDecimal?
* **visibility**: private
* **description**: 관리비이다.

### 1.2.9. floor
* **name**: floor
* **type**: Integer?
* **visibility**: private
* **description**: 층수이다.

### 1.2.10. availableFrom
* **name**: availableFrom
* **type**: LocalDate?
* **visibility**: private
* **description**: 입주 가능일이다.

### 1.2.11. negotiable
* **name**: negotiable
* **type**: Boolean
* **visibility**: private
* **description**: 협상 가능 여부이다.

### 1.2.12. isActive
* **name**: isActive
* **type**: Boolean
* **visibility**: private
* **description**: 활성 여부이다.

### 1.2.13. optionsBitset
* **name**: optionsBitset
* **type**: String?
* **visibility**: private
* **description**: 옵션 비트마스크이다.

### 1.2.14. createdAt/updatedAt
* **name**: createdAt/updatedAt
* **type**: Instant
* **visibility**: private
* **description**: 상속된 생성/갱신일시이다.

## 1.3. Operations 구분

### 1.3.1. @PrePersist setCreatedAt
* **name**: @PrePersist setCreatedAt
* **type**: void
* **visibility**: private
* **description**: 저장 시 생성일을 기록한다.

### 1.3.2. @PreUpdate setUpdatedAt
* **name**: @PreUpdate setUpdatedAt
* **type**: void
* **visibility**: private
* **description**: 수정 시 갱신일을 기록한다.


# PropertyReview 클래스

```mermaid
classDiagram
  class BaseEntity {
    +createdAt: Instant
    +updatedAt: Instant
  }
  class PropertyReview {
    -id: Long
    -property: Property
    -userId: Long
    -rating: Integer
    -comment: String
    +@PrePersist setCreatedAt()
    +@PreUpdate setUpdatedAt()
  }
  BaseEntity <|-- PropertyReview
```
## 1.1. class description
사용자가 매물에 남긴 리뷰를 나타내는 클래스이다.

## 1.2. attribution 구분

### 1.2.1. id
* **name**: id
* **type**: Long
* **visibility**: private
* **description**: PK 식별자이다.

### 1.2.2. property
* **name**: property
* **type**: Property
* **visibility**: private
* **description**: 리뷰 대상 매물이다.

### 1.2.3. userId
* **name**: userId
* **type**: Long
* **visibility**: private
* **description**: 작성자 식별자이다.

### 1.2.4. rating
* **name**: rating
* **type**: Integer
* **visibility**: private
* **description**: 평점(1~5)이다.

### 1.2.5. comment
* **name**: comment
* **type**: String
* **visibility**: private
* **description**: 리뷰 코멘트이다.

### 1.2.6. createdAt/updatedAt
* **name**: createdAt/updatedAt
* **type**: Instant
* **visibility**: private
* **description**: 상속된 생성/갱신일시이다.

## 1.3. Operations 구분

### 1.3.1. @PrePersist setCreatedAt
* **name**: @PrePersist setCreatedAt
* **type**: void
* **visibility**: private
* **description**: 저장 시 생성일을 기록한다.

### 1.3.2. @PreUpdate setUpdatedAt
* **name**: @PreUpdate setUpdatedAt
* **type**: void
* **visibility**: private
* **description**: 수정 시 갱신일을 기록한다.

# 4. 지도 관련 

# MapApiService 클래스

```mermaid
classDiagram
    %% --- MapApiService 클래스 정의 ---
    class MapApiService {
        %% 클래스 설명: 지도 API 연동 서비스로 좌표-주소 변환 및 주변 건물 검색 기능 제공
        -restTemplate: RestTemplate
        -logger: Logger
        -naverClientId: String
        -naverClientSecret: String

        %% --- Operations ---
        +getAddressFromCoordinates(latitude: double, longitude: double): AddressInfo
        +getCoordinatesFromAddress(address: String): CoordinateInfo
        +searchNearbyBuildings(latitude: double, longitude: double, radius: int): List~BuildingInfo~
    }

    %% --- 내부 DTO 클래스들 ---
    class AddressInfo {
        -roadAddress: String
        -jibunAddress: String
        -buildingName: String
        -postalCode: String
        -regionCode: String
    }

    class CoordinateInfo {
        -latitude: double
        -longitude: double
        -accuracy: String
    }

    class BuildingInfo {
        -name: String
        -category: String
        -address: String
        -distance: int
    }

    %% --- 관계 정의 ---
    MapApiService ..> AddressInfo : 반환 (Returns)
    MapApiService ..> CoordinateInfo : 반환 (Returns)
    MapApiService ..> BuildingInfo : 반환 (Returns)
```

## 1.1. class description

지도 API 연동 서비스로 카카오맵, 네이버맵, 구글맵 등의 API를 통합 관리하는 클래스이다. 좌표를 주소로 변환하는 Reverse Geocoding, 주소를 좌표로 변환하는 Geocoding, 주변 건물 검색 기능을 제공한다. 현재는 네이버 API 구독이 필요하므로 더미 데이터를 사용하여 구현되어 있다.

## 1.2. attribution 구분

### 1.2.1. restTemplate

- **name**: restTemplate
- **type**: RestTemplate
- **visibility**: private
- **description**: HTTP 요청을 수행하기 위한 Spring의 RestTemplate 객체이다. 외부 지도 API 호출 시 사용된다.

### 1.2.2. logger

- **name**: logger
- **type**: Logger
- **visibility**: private
- **description**: SLF4J Logger 객체로 지도 API 호출 및 응답에 대한 로깅을 수행한다. 디버깅 및 모니터링에 사용된다.

### 1.2.3. naverClientId

- **name**: naverClientId
- **type**: String
- **visibility**: private
- **description**: 네이버 지도 API 호출 시 필요한 클라이언트 ID이다. application.yml의 `naver.map.client-id` 설정값이 주입된다.

### 1.2.4. naverClientSecret

- **name**: naverClientSecret
- **type**: String
- **visibility**: private
- **description**: 네이버 지도 API 호출 시 필요한 클라이언트 시크릿 키이다. application.yml의 `naver.map.client-secret` 설정값이 주입된다.

## 1.3. Operations 구분

### 1.3.1. getAddressFromCoordinates

- **name**: getAddressFromCoordinates
- **type**: AddressInfo
- **visibility**: public
- **description**: 좌표(위도, 경도)를 입력받아 해당 위치의 주소 정보를 반환하는 Reverse Geocoding 메서드이다. 좌표 범위에 따라 대구, 부산, 서울 강남, 서울 시청(기본값) 중 하나의 주소 정보를 반환한다. 도로명주소, 지번주소, 건물명, 우편번호, 행정구역코드를 포함한 AddressInfo 객체를 반환한다.

### 1.3.2. getCoordinatesFromAddress

- **name**: getCoordinatesFromAddress
- **type**: CoordinateInfo
- **visibility**: public
- **description**: 주소 문자열을 입력받아 해당 위치의 좌표 정보를 반환하는 Geocoding 메서드이다. 주소에 "대구", "남구", "부산", "서울", "강남" 등의 키워드가 포함되어 있는지 확인하여 해당 지역의 좌표를 반환한다. 위도, 경도, 정확도(EXACT 또는 APPROXIMATE)를 포함한 CoordinateInfo 객체를 반환한다.

### 1.3.3. searchNearbyBuildings

- **name**: searchNearbyBuildings
- **type**: List<BuildingInfo>
- **visibility**: public
- **description**: 특정 좌표를 중심으로 지정된 반경 내의 주변 건물 정보를 검색하는 메서드이다. 현재는 더미 데이터로 "강남역"과 "강남파이낸스센터" 두 개의 건물 정보를 반환한다. 실제 구현 시에는 POI(Point of Interest) 검색 API를 사용할 예정이다. 건물명, 카테고리, 주소, 거리(미터)를 포함한 BuildingInfo 객체의 리스트를 반환한다.

---

# AddressInfo 클래스

```mermaid
classDiagram
    class AddressInfo {
        %% 클래스 설명: Reverse Geocoding 결과로 반환되는 주소 정보 DTO
        -roadAddress: String
        -jibunAddress: String
        -buildingName: String
        -postalCode: String
        -regionCode: String
    }
```

## 2.1. class description

Reverse Geocoding 결과로 반환되는 주소 정보를 담는 DTO(Data Transfer Object) 클래스이다. 좌표를 주소로 변환한 결과를 구조화하여 전달하며, 도로명주소, 지번주소, 건물명, 우편번호, 행정구역코드 등의 상세 주소 정보를 포함한다.

## 2.2. attribution 구분

### 2.2.1. roadAddress

- **name**: roadAddress
- **type**: String
- **visibility**: private
- **description**: 도로명주소 정보이다. 예: "서울 강남구 강남대로 396"

### 2.2.2. jibunAddress

- **name**: jibunAddress
- **type**: String
- **visibility**: private
- **description**: 지번주소 정보이다. 예: "서울 강남구 역삼동 825"

### 2.2.3. buildingName

- **name**: buildingName
- **type**: String
- **visibility**: private
- **description**: 건물명 정보이다. 예: "강남역", "서울시청"

### 2.2.4. postalCode

- **name**: postalCode
- **type**: String
- **visibility**: private
- **description**: 우편번호 정보이다. 예: "06292"

### 2.2.5. regionCode

- **name**: regionCode
- **type**: String
- **visibility**: private
- **description**: 행정구역코드 정보이다. 예: "1168010100"

---

# CoordinateInfo 클래스

```mermaid
classDiagram
    class CoordinateInfo {
        %% 클래스 설명: Geocoding 결과로 반환되는 좌표 정보 DTO
        -latitude: double
        -longitude: double
        -accuracy: String
    }
```

## 3.1. class description

Geocoding 결과로 반환되는 좌표 정보를 담는 DTO(Data Transfer Object) 클래스이다. 주소를 좌표로 변환한 결과를 구조화하여 전달하며, 위도, 경도, 정확도 정보를 포함한다.

## 3.2. attribution 구분

### 3.2.1. latitude

- **name**: latitude
- **type**: double
- **visibility**: private
- **description**: 위도 정보이다. 예: 37.4979 (서울 강남 지역)

### 3.2.2. longitude

- **name**: longitude
- **type**: double
- **visibility**: private
- **description**: 경도 정보이다. 예: 127.0276 (서울 강남 지역)

### 3.2.3. accuracy

- **name**: accuracy
- **type**: String
- **visibility**: private
- **description**: 좌표의 정확도를 나타낸다. "EXACT"(정확한 매칭), "INTERPOLATION"(보간), "APPROXIMATE"(근사값) 중 하나의 값을 가진다.

---

# BuildingInfo 클래스

```mermaid
classDiagram
    class BuildingInfo {
        %% 클래스 설명: 주변 건물 검색 결과로 반환되는 건물 정보 DTO
        -name: String
        -category: String
        -address: String
        -distance: int
    }
```

## 4.1. class description

주변 건물 검색 결과로 반환되는 건물 정보를 담는 DTO(Data Transfer Object) 클래스이다. POI(Point of Interest) 검색 결과를 구조화하여 전달하며, 건물명, 카테고리, 주소, 거리 정보를 포함한다.

## 4.2. attribution 구분

### 4.2.1. name

- **name**: name
- **type**: String
- **visibility**: private
- **description**: 건물명 또는 장소명이다. 예: "강남역", "강남파이낸스센터"

### 4.2.2. category

- **name**: category
- **type**: String
- **visibility**: private
- **description**: 건물의 카테고리 또는 유형이다. 예: "지하철역", "오피스빌딩"

### 4.2.3. address

- **name**: address
- **type**: String
- **visibility**: private
- **description**: 건물의 주소 정보이다. 예: "서울 강남구 강남대로 396"

### 4.2.4. distance

- **name**: distance
- **type**: int
- **visibility**: private
- **description**: 검색 기준 좌표로부터의 거리를 미터 단위로 나타낸다. 예: 0 (현재 위치), 200 (200미터 거리)

---

# UserMapState 클래스

```mermaid
classDiagram
    %% --- UserMapState 클래스 정의 ---
    class UserMapState {
        %% 클래스 설명: 사용자의 지도 상태(위치, 줌 레벨)를 저장하는 클래스
        -userId: Long
        -user: User
        -locationX: Double
        -locationY: Double
        -zoomLevel: Integer
        -updatedAt: LocalDateTime

        %% --- Operations ---
        +updateTime(): void
    }

    %% --- User 클래스 (참조용) ---
    class User {
        -userId: Long
        -email: String
        -name: String
    }

    %% --- 관계 정의 ---
    UserMapState --> User : 일대일 (OneToOne)
```

## 5.1. class description

사용자의 지도 상태(마지막 위치와 줌 레벨)를 저장하는 클래스이다. 사용자가 지도를 사용할 때 마지막으로 본 위치와 줌 레벨을 기억하여, 다음 접속 시 동일한 상태로 지도를 표시할 수 있도록 한다. User 엔티티와 일대일 관계를 가지며, userId를 Primary Key로 사용한다.

## 5.2. attribution 구분

### 5.2.1. userId

- **name**: userId
- **type**: Long
- **visibility**: private
- **description**: 사용자를 고유하게 식별하기 위한 primary key이다. User 엔티티의 userId와 동일한 값을 가지며, @MapsId 어노테이션을 통해 User의 ID를 공유한다.

### 5.2.2. user

- **name**: user
- **type**: User
- **visibility**: private
- **description**: 지도 상태를 소유한 사용자 엔티티에 대한 참조이다. @OneToOne 관계로 설정되어 있으며, LAZY 로딩 방식을 사용한다. @MapsId를 통해 userId를 공유한다.

### 5.2.3. locationX

- **name**: locationX
- **type**: Double
- **visibility**: private
- **description**: 사용자가 마지막으로 본 지도의 경도(longitude) 좌표이다. null 값을 허용하며, 사용자가 지도를 처음 사용하는 경우 null일 수 있다.

### 5.2.4. locationY

- **name**: locationY
- **type**: Double
- **visibility**: private
- **description**: 사용자가 마지막으로 본 지도의 위도(latitude) 좌표이다. null 값을 허용하며, 사용자가 지도를 처음 사용하는 경우 null일 수 있다.

### 5.2.5. zoomLevel

- **name**: zoomLevel
- **type**: Integer
- **visibility**: private
- **description**: 사용자가 마지막으로 설정한 지도의 줌 레벨이다. 숫자가 클수록 더 확대된 상태를 의미한다. null 값을 허용하며, 기본 줌 레벨은 클라이언트에서 설정된다.

### 5.2.6. updatedAt

- **name**: updatedAt
- **type**: LocalDateTime
- **visibility**: private
- **description**: 지도 상태가 마지막으로 업데이트된 날짜와 시간이다. @PrePersist와 @PreUpdate를 통해 엔티티가 저장되거나 수정될 때 자동으로 현재 시간으로 갱신된다.

## 5.3. Operations 구분

### 5.3.1. updateTime

- **name**: updateTime
- **type**: void
- **visibility**: public
- **description**: 엔티티가 저장되거나 수정될 때 자동으로 호출되는 메서드이다. @PrePersist와 @PreUpdate 어노테이션이 적용되어 있어, updatedAt 필드를 현재 시간으로 자동 갱신한다. 사용자가 지도 상태를 변경할 때마다 마지막 업데이트 시간이 기록된다.

---

# PropertyMarkerDto 클래스

```mermaid
classDiagram
    %% --- PropertyMarkerDto 클래스 정의 ---
    class PropertyMarkerDto {
        %% 클래스 설명: 지도에 표시할 매물 마커 정보를 담는 DTO (Record 타입)
        +id: Long
        +title: String
        +address: String
        +price: BigDecimal
        +status: String
        +lat: Double
        +lng: Double
    }
```

## 6.1. class description

지도에 표시할 매물 마커 정보를 담는 DTO(Data Transfer Object) 클래스이다. Java Record 타입으로 구현되어 불변(immutable) 객체이며, 매물의 기본 정보와 위치 좌표를 포함한다. 지도 API에서 매물 위치를 마커로 표시할 때 사용되며, 사용자가 지도를 탐색할 때 효율적으로 매물 정보를 전달하기 위한 경량화된 데이터 구조이다.

## 6.2. attribution 구분

### 6.2.1. id

- **name**: id
- **type**: Long
- **visibility**: public
- **description**: 매물을 고유하게 식별하기 위한 primary key이다. Property 엔티티의 id와 동일한 값을 가지며, 마커 클릭 시 상세 정보를 조회하는 데 사용된다.

### 6.2.2. title

- **name**: title
- **type**: String
- **visibility**: public
- **description**: 매물의 제목이다. 지도 마커에 마우스를 올렸을 때 또는 마커 클릭 시 표시되는 매물의 간략한 이름이다. 예: "강남역 오피스텔", "서울시청 인근 아파트"

### 6.2.3. address

- **name**: address
- **type**: String
- **visibility**: public
- **description**: 매물의 주소 정보이다. 도로명주소 또는 지번주소가 저장되며, 마커 팝업이나 간략 정보 표시 시 사용된다. 예: "서울 강남구 강남대로 396"

### 6.2.4. price

- **name**: price
- **type**: BigDecimal
- **visibility**: public
- **description**: 매물의 가격 정보이다. 매매가, 전세가, 월세 등의 금액을 나타내며, 지도에서 가격 필터링이나 마커 정보 표시에 사용된다. null 값을 허용하여 가격 미정인 매물도 표시할 수 있다.

### 6.2.5. status

- **name**: status
- **type**: String
- **visibility**: public
- **description**: 매물의 거래 상태를 나타낸다. "AVAILABLE"(거래 가능), "PENDING"(거래 진행 중), "SOLD"(판매 완료), "HIDDEN"(숨김) 중 하나의 값을 가진다. 마커의 색상이나 아이콘을 다르게 표시하는 데 사용된다.

### 6.2.6. lat

- **name**: lat
- **type**: Double
- **visibility**: public
- **description**: 매물의 위도(latitude) 좌표이다. 지도에서 마커를 표시할 Y축 위치를 나타낸다. 예: 37.4979 (서울 강남 지역)

### 6.2.7. lng

- **name**: lng
- **type**: Double
- **visibility**: public
- **description**: 매물의 경도(longitude) 좌표이다. 지도에서 마커를 표시할 X축 위치를 나타낸다. 예: 127.0276 (서울 강남 지역)

## 6.3. Operations 구분

### 6.3.1. Record 특성

- **name**: Record 타입
- **type**: N/A
- **visibility**: N/A
- **description**: PropertyMarkerDto는 Java Record로 구현되어 있어 다음과 같은 특성을 가진다:
    - 모든 필드는 final이며 불변(immutable)이다.
    - 생성자, getter, equals(), hashCode(), toString() 메서드가 자동으로 생성된다.
    - 별도의 setter 메서드가 없어 생성 후 값을 변경할 수 없다.
    - 간결한 문법으로 DTO를 정의할 수 있다.

---
# 5. 채팅 관련

# ChatRoom 클래스

```mermaid
classDiagram
    %% --- ChatRoom 클래스 정의 ---
    class ChatRoom {
        %% 클래스 설명: 채팅방 관리 및 참여자 정보를 담는 클래스
        -id: Long
        -property: Property
        -user1: User
        -user2: User
        -user3: User
        -createdAt: LocalDateTime

        %% --- Operations ---
        +prePersist(): void
    }

    %% --- 관련 클래스들 ---
    class Property {
        -id: Long
        -title: String
    }

    class User {
        -userId: Long
        -name: String
    }

    %% --- 관계 정의 ---
    ChatRoom --> Property : 다대일 (ManyToOne)
    ChatRoom --> User : 다대일 (ManyToOne) - user1
    ChatRoom --> User : 다대일 (ManyToOne) - user2
    ChatRoom --> User : 다대일 (ManyToOne) - user3
```

## 1.1. class description

채팅방을 관리하는 클래스이다. 특정 매물에 대해 사용자들 간의 대화를 위한 채팅방을 생성하고 관리한다. 최대 3명의 사용자가 참여할 수 있으며, 일반적으로 매물 소유자, 구매 희망자, 중개인이 참여한다. 동일한 매물과 참여자 조합으로 중복 채팅방이 생성되지 않도록 유니크 제약조건이 설정되어 있다.

## 1.2. attribution 구분

### 1.2.1. id

- **name**: id
- **type**: Long
- **visibility**: private
- **description**: 채팅방을 고유하게 식별하기 위한 primary key로, 데이터베이스에서 자동 생성되는 채팅방의 고유 ID이다.

### 1.2.2. property

- **name**: property
- **type**: Property
- **visibility**: private
- **description**: 채팅방이 연결된 매물 정보이다. 채팅의 주제가 되는 매물을 참조하며, LAZY 로딩 방식을 사용한다. null 값을 허용하지 않는 필수 필드이다.

### 1.2.3. user1

- **name**: user1
- **type**: User
- **visibility**: private
- **description**: 채팅방의 첫 번째 참여자이다. 일반적으로 채팅방을 생성한 사용자(매물 문의자)가 된다. LAZY 로딩 방식을 사용하며, null 값을 허용하지 않는 필수 필드이다.

### 1.2.4. user2

- **name**: user2
- **type**: User
- **visibility**: private
- **description**: 채팅방의 두 번째 참여자이다. 일반적으로 매물 소유자 또는 중개인이 된다. LAZY 로딩 방식을 사용하며, null 값을 허용하지 않는 필수 필드이다.

### 1.2.5. user3

- **name**: user3
- **type**: User
- **visibility**: private
- **description**: 채팅방의 세 번째 참여자이다. 선택적으로 중개인이 참여할 때 사용된다. LAZY 로딩 방식을 사용하며, null 값을 허용하는 선택 필드이다.

### 1.2.6. createdAt

- **name**: createdAt
- **type**: LocalDateTime
- **visibility**: private
- **description**: 채팅방이 생성된 날짜와 시간이다. @PrePersist를 통해 엔티티가 저장될 때 자동으로 현재 시간으로 설정되며, 이후 수정되지 않는다.

## 1.3. Operations 구분

### 1.3.1. prePersist

- **name**: prePersist
- **type**: void
- **visibility**: public
- **description**: 엔티티가 데이터베이스에 저장되기 전에 자동으로 호출되는 메서드이다. @PrePersist 어노테이션이 적용되어 있어, createdAt 필드를 현재 시간으로 자동 설정한다.

## 1.4. Constraints

### 1.4.1. Unique Constraint

- **name**: uniq_room
- **columns**: property_id, user1_id, user2_id
- **description**: 동일한 매물과 동일한 참여자 조합으로 중복 채팅방이 생성되는 것을 방지한다. 같은 매물에 대해 같은 사용자들이 여러 개의 채팅방을 만들 수 없도록 제약한다.

---

# ChatMessage 클래스

```mermaid
classDiagram
    %% --- ChatMessage 클래스 정의 ---
    class ChatMessage {
        %% 클래스 설명: 채팅 메시지 정보를 담는 클래스
        -id: Long
        -room: ChatRoom
        -sender: User
        -content: String
        -sentAt: LocalDateTime
        -isRead: Boolean

        %% --- Operations ---
        +prePersist(): void
    }

    %% --- 관련 클래스들 ---
    class ChatRoom {
        -id: Long
    }

    class User {
        -userId: Long
        -name: String
    }

    %% --- 관계 정의 ---
    ChatMessage --> ChatRoom : 다대일 (ManyToOne)
    ChatMessage --> User : 다대일 (ManyToOne) - sender
```

## 2.1. class description

채팅 메시지 정보를 담는 클래스이다. 특정 채팅방에서 사용자가 전송한 메시지의 내용, 발신자, 전송 시간, 읽음 여부 등을 관리한다. 효율적인 메시지 조회를 위해 room_id와 id, 그리고 읽지 않은 메시지 조회를 위한 인덱스가 설정되어 있다.

## 2.2. attribution 구분

### 2.2.1. id

- **name**: id
- **type**: Long
- **visibility**: private
- **description**: 메시지를 고유하게 식별하기 위한 primary key로, 데이터베이스에서 자동 생성되는 메시지의 고유 ID이다.

### 2.2.2. room

- **name**: room
- **type**: ChatRoom
- **visibility**: private
- **description**: 메시지가 속한 채팅방 정보이다. 어느 채팅방에서 전송된 메시지인지를 나타내며, LAZY 로딩 방식을 사용한다. null 값을 허용하지 않는 필수 필드이다.

### 2.2.3. sender

- **name**: sender
- **type**: User
- **visibility**: private
- **description**: 메시지를 전송한 사용자 정보이다. 메시지의 발신자를 나타내며, LAZY 로딩 방식을 사용한다. null 값을 허용하지 않는 필수 필드이다.

### 2.2.4. content

- **name**: content
- **type**: String
- **visibility**: private
- **description**: 메시지의 실제 내용이다. TEXT 타입으로 저장되어 긴 메시지도 저장할 수 있다. null 값을 허용하지 않는 필수 필드이다.

### 2.2.5. sentAt

- **name**: sentAt
- **type**: LocalDateTime
- **visibility**: private
- **description**: 메시지가 전송된 날짜와 시간이다. @PrePersist를 통해 엔티티가 저장될 때 자동으로 현재 시간으로 설정된다. null 값을 허용하지 않는 필수 필드이다.

### 2.2.6. isRead

- **name**: isRead
- **type**: Boolean
- **visibility**: private
- **description**: 메시지의 읽음 여부를 나타낸다. 기본값은 false이며, 수신자가 메시지를 읽으면 true로 변경된다. 읽지 않은 메시지 개수를 계산하거나 알림을 표시하는 데 사용된다.

## 2.3. Operations 구분

### 2.3.1. prePersist

- **name**: prePersist
- **type**: void
- **visibility**: public
- **description**: 엔티티가 데이터베이스에 저장되기 전에 자동으로 호출되는 메서드이다. @PrePersist 어노테이션이 적용되어 있어, sentAt 필드를 현재 시간으로 자동 설정한다.

## 2.4. Indexes

### 2.4.1. idx_msg_room_id_id_asc

- **name**: idx_msg_room_id_id_asc
- **columns**: room_id, id
- **description**: 특정 채팅방의 메시지를 ID 순서대로 빠르게 조회하기 위한 복합 인덱스이다. 채팅방별 메시지 목록 조회 성능을 향상시킨다.

### 2.4.2. idx_msg_room_sender_unread

- **name**: idx_msg_room_sender_unread
- **columns**: room_id, sender_id, is_read
- **description**: 특정 채팅방에서 특정 발신자의 읽지 않은 메시지를 빠르게 조회하기 위한 복합 인덱스이다. 읽지 않은 메시지 개수 계산 및 알림 기능의 성능을 향상시킨다.

---

# 6. 알림 관련

# Notification 클래스

```mermaid
classDiagram
    %% --- Notification 클래스 정의 ---
    class Notification {
        %% 클래스 설명: 사용자에게 전송되는 알림 정보를 관리하는 클래스
        -id: Long
        -user: User
        -type: NotificationType
        -title: String
        -message: String
        -relatedId: Long
        -isRead: Boolean
        -createdAt: LocalDateTime
        -readAt: LocalDateTime

        %% --- Operations ---
        +onCreate(): void
        +markAsRead(): void
    }

    %% --- NotificationType Enum ---
    class NotificationType {
        <<enumeration>>
        PROPERTY_APPROVED
        PROPERTY_REJECTED
        PROPERTY_SUBMITTED
        SYSTEM_UPDATE
        CHAT_MESSAGE
        PRICE_ALERT
        PROPERTY_SOLD
        PURCHASE_COMPLETED
        +getDisplayName(): String
    }

    %% --- User 클래스 (참조용) ---
    class User {
        -userId: Long
        -name: String
    }

    %% --- 관계 정의 ---
    Notification --> User : 다대일 (ManyToOne)
    Notification --> NotificationType : 사용 (Uses)
```

## 1.1. class description

사용자에게 전송되는 알림 정보를 관리하는 클래스이다. 매물 승인/거절, 채팅 메시지, 가격 알림, 시스템 업데이트 등 다양한 유형의 알림을 통합 관리한다. 알림의 읽음 여부를 추적하고, 관련 엔티티와의 연결을 통해 알림 클릭 시 해당 페이지로 이동할 수 있도록 지원한다.

## 1.2. attribution 구분

### 1.2.1. id

- **name**: id
- **type**: Long
- **visibility**: private
- **description**: 알림을 고유하게 식별하기 위한 primary key로, 데이터베이스에서 자동 생성되는 알림의 고유 ID이다.

### 1.2.2. user

- **name**: user
- **type**: User
- **visibility**: private
- **description**: 알림을 받을 사용자 정보이다. LAZY 로딩 방식을 사용하며, null 값을 허용하지 않는 필수 필드이다.

### 1.2.3. type

- **name**: type
- **type**: NotificationType
- **visibility**: private
- **description**: 알림의 유형을 나타내는 열거형 필드이다. PROPERTY_APPROVED, PROPERTY_REJECTED, CHAT_MESSAGE, PRICE_ALERT 등의 값을 가지며, 알림의 종류에 따라 다른 아이콘이나 색상을 표시하는 데 사용된다. 최대 50자로 제한되며, null 값을 허용하지 않는 필수 필드이다.

### 1.2.4. title

- **name**: title
- **type**: String
- **visibility**: private
- **description**: 알림의 제목이다. 알림 목록에서 표시되는 간략한 제목으로, 최대 200자로 제한된다. null 값을 허용하지 않는 필수 필드이다.

### 1.2.5. message

- **name**: message
- **type**: String
- **visibility**: private
- **description**: 알림의 상세 내용이다. TEXT 타입으로 저장되어 긴 메시지도 저장할 수 있다. null 값을 허용하지 않는 필수 필드이다.

### 1.2.6. relatedId

- **name**: relatedId
- **type**: Long
- **visibility**: private
- **description**: 알림과 관련된 엔티티의 ID이다. 예를 들어 매물 신청 알림의 경우 OwnershipClaim의 ID, 채팅 메시지 알림의 경우 ChatRoom의 ID가 저장된다. 알림 클릭 시 해당 페이지로 이동하는 데 사용되며, null 값을 허용한다.

### 1.2.7. isRead

- **name**: isRead
- **type**: Boolean
- **visibility**: private
- **description**: 알림의 읽음 여부를 나타낸다. 기본값은 false이며, 사용자가 알림을 확인하면 true로 변경된다. 읽지 않은 알림 개수를 계산하는 데 사용된다.

### 1.2.8. createdAt

- **name**: createdAt
- **type**: LocalDateTime
- **visibility**: private
- **description**: 알림이 생성된 날짜와 시간이다. @PrePersist를 통해 엔티티가 저장될 때 자동으로 현재 시간으로 설정되며, 이후 수정되지 않는다.

### 1.2.9. readAt

- **name**: readAt
- **type**: LocalDateTime
- **visibility**: private
- **description**: 알림을 읽은 날짜와 시간이다. markAsRead() 메서드 호출 시 현재 시간으로 설정되며, null 값을 허용한다.

## 1.3. Operations 구분

### 1.3.1. onCreate

- **name**: onCreate
- **type**: void
- **visibility**: protected
- **description**: 엔티티가 데이터베이스에 저장되기 전에 자동으로 호출되는 메서드이다. @PrePersist 어노테이션이 적용되어 있어, createdAt 필드를 현재 시간으로 자동 설정한다.

### 1.3.2. markAsRead

- **name**: markAsRead
- **type**: void
- **visibility**: public
- **description**: 알림을 읽음 처리하는 메서드이다. isRead를 true로 설정하고, readAt을 현재 시간으로 설정한다. 사용자가 알림을 클릭하거나 확인했을 때 호출된다.

## 1.4. NotificationType Enum

### 1.4.1. Enum Values

- **PROPERTY_APPROVED**: 매물 승인 알림 (displayName: "매물 승인")
- **PROPERTY_REJECTED**: 매물 거절 알림 (displayName: "매물 거절")
- **PROPERTY_SUBMITTED**: 매물 신청 알림 (displayName: "매물 신청")
- **SYSTEM_UPDATE**: 시스템 업데이트 알림 (displayName: "시스템 업데이트")
- **CHAT_MESSAGE**: 새 메시지 알림 (displayName: "새 메시지")
- **PRICE_ALERT**: 가격 알림 (displayName: "가격 알림")
- **PROPERTY_SOLD**: 찜한 매물 거래 완료 알림 (displayName: "찜한 매물 거래 완료")
- **PURCHASE_COMPLETED**: 구매 완료 알림 (displayName: "구매 완료")

### 1.4.2. getDisplayName()

- **name**: getDisplayName
- **type**: String
- **visibility**: public
- **description**: 알림 유형의 한글 표시명을 반환하는 메서드이다. UI에서 사용자에게 알림 유형을 표시할 때 사용된다.

---

# PriceAlert 클래스

```mermaid
classDiagram
    %% --- PriceAlert 클래스 정의 ---
    class PriceAlert {
        %% 클래스 설명: 가격 기반 알림 조건을 관리하는 클래스
        -id: Long
        -user: User
        -property: Property
        -targetValue: BigDecimal
        -tolerancePct: BigDecimal
        -createdAt: LocalDateTime
        -updatedAt: LocalDateTime

        %% --- Operations ---
        +prePersist(): void
        +preUpdate(): void
    }

    %% --- 관련 클래스들 ---
    class User {
        -userId: Long
        -name: String
    }

    class Property {
        -id: Long
        -title: String
        -price: BigDecimal
    }

    %% --- 관계 정의 ---
    PriceAlert --> User : 다대일 (ManyToOne)
    PriceAlert --> Property : 다대일 (ManyToOne)
```

## 2.1. class description

가격 기반 알림 조건을 관리하는 클래스이다. 사용자가 특정 매물의 가격이 목표 가격에 도달하거나 허용 오차 범위 내에 들어올 때 알림을 받을 수 있도록 설정한다. 매물 가격 변동을 모니터링하여 사용자가 원하는 가격대의 매물을 놓치지 않도록 지원한다.

## 2.2. attribution 구분

### 2.2.1. id

- **name**: id
- **type**: Long
- **visibility**: private
- **description**: 가격 알림을 고유하게 식별하기 위한 primary key로, 데이터베이스에서 자동 생성되는 알림의 고유 ID이다.

### 2.2.2. user

- **name**: user
- **type**: User
- **visibility**: private
- **description**: 가격 알림을 설정한 사용자 정보이다. LAZY 로딩 방식을 사용하며, null 값을 허용하지 않는 필수 필드이다.

### 2.2.3. property

- **name**: property
- **type**: Property
- **visibility**: private
- **description**: 가격 알림을 설정한 매물 정보이다. 해당 매물의 가격 변동을 모니터링한다. LAZY 로딩 방식을 사용하며, null 값을 허용하지 않는 필수 필드이다.

### 2.2.4. targetValue

- **name**: targetValue
- **type**: BigDecimal
- **visibility**: private
- **description**: 사용자가 설정한 목표 가격이다. 매물 가격이 이 값에 도달하거나 허용 오차 범위 내에 들어오면 알림이 발송된다. precision 14, scale 2로 설정되어 최대 12자리 정수와 2자리 소수를 저장할 수 있다. null 값을 허용하지 않는 필수 필드이다.

### 2.2.5. tolerancePct

- **name**: tolerancePct
- **type**: BigDecimal
- **visibility**: private
- **description**: 목표 가격의 허용 오차 비율(%)이다. 예를 들어 5%로 설정하면 목표 가격의 ±5% 범위 내에서 알림이 발송된다. precision 5, scale 2로 설정되어 최대 3자리 정수와 2자리 소수를 저장할 수 있다. null 값을 허용한다.

### 2.2.6. createdAt

- **name**: createdAt
- **type**: LocalDateTime
- **visibility**: private
- **description**: 가격 알림이 생성된 날짜와 시간이다. @PrePersist를 통해 엔티티가 저장될 때 자동으로 현재 시간으로 설정되며, 이후 수정되지 않는다.

### 2.2.7. updatedAt

- **name**: updatedAt
- **type**: LocalDateTime
- **visibility**: private
- **description**: 가격 알림이 마지막으로 수정된 날짜와 시간이다. @PrePersist와 @PreUpdate를 통해 엔티티가 저장되거나 수정될 때 자동으로 현재 시간으로 갱신된다.

## 2.3. Operations 구분

### 2.3.1. prePersist

- **name**: prePersist
- **type**: void
- **visibility**: public
- **description**: 엔티티가 데이터베이스에 저장되기 전에 자동으로 호출되는 메서드이다. @PrePersist 어노테이션이 적용되어 있어, createdAt과 updatedAt 필드를 현재 시간으로 자동 설정한다.

### 2.3.2. preUpdate

- **name**: preUpdate
- **type**: void
- **visibility**: public
- **description**: 엔티티가 수정될 때 자동으로 호출되는 메서드이다. @PreUpdate 어노테이션이 적용되어 있어, updatedAt 필드를 현재 시간으로 자동 갱신한다.

---

# ScoreAlert 클래스

```mermaid
classDiagram
    %% --- ScoreAlert 클래스 정의 ---
    class ScoreAlert {
        %% 클래스 설명: 점수 기반 알림 조건을 관리하는 클래스
        -id: Long
        -user: User
        -conditionType: ConditionType
        -targetScore: Integer
        -createdAt: LocalDateTime
        -updatedAt: LocalDateTime

        %% --- Operations ---
        +prePersist(): void
        +preUpdate(): void
    }

    %% --- ConditionType Enum ---
    class ConditionType {
        <<enumeration>>
        TOTAL
        TRAFFIC
        AMENITIES
        PRICE
        CONDITION
        DESCRIPTION
    }

    %% --- User 클래스 (참조용) ---
    class User {
        -userId: Long
        -name: String
    }

    %% --- 관계 정의 ---
    ScoreAlert --> User : 다대일 (ManyToOne)
    ScoreAlert --> ConditionType : 사용 (Uses)
```

## 3.1. class description

점수 기반 알림 조건을 관리하는 클래스이다. 사용자가 특정 평가 항목(교통, 편의시설, 가격, 상태 등)의 점수가 목표 점수 이상인 매물이 등록될 때 알림을 받을 수 있도록 설정한다. 매물의 다양한 평가 지표를 기반으로 사용자의 선호도에 맞는 매물을 자동으로 추천하고 알림을 제공한다.

## 3.2. attribution 구분

### 3.2.1. id

- **name**: id
- **type**: Long
- **visibility**: private
- **description**: 점수 알림을 고유하게 식별하기 위한 primary key로, 데이터베이스에서 자동 생성되는 알림의 고유 ID이다.

### 3.2.2. user

- **name**: user
- **type**: User
- **visibility**: private
- **description**: 점수 알림을 설정한 사용자 정보이다. LAZY 로딩 방식을 사용하며, null 값을 허용하지 않는 필수 필드이다.

### 3.2.3. conditionType

- **name**: conditionType
- **type**: ConditionType
- **visibility**: private
- **description**: 평가 조건의 유형을 나타내는 열거형 필드이다. TOTAL(종합 점수), TRAFFIC(교통 점수), AMENITIES(편의시설 점수), PRICE(가격 점수), CONDITION(상태 점수), DESCRIPTION(설명 점수) 중 하나의 값을 가진다. 최대 32자로 제한되며, null 값을 허용하지 않는 필수 필드이다.

### 3.2.4. targetScore

- **name**: targetScore
- **type**: Integer
- **visibility**: private
- **description**: 사용자가 설정한 최소 목표 점수이다. 매물의 해당 평가 항목 점수가 이 값 이상일 때 알림이 발송된다. null 값을 허용하지 않는 필수 필드이다.

### 3.2.5. createdAt

- **name**: createdAt
- **type**: LocalDateTime
- **visibility**: private
- **description**: 점수 알림이 생성된 날짜와 시간이다. @PrePersist를 통해 엔티티가 저장될 때 자동으로 현재 시간으로 설정되며, 이후 수정되지 않는다.

### 3.2.6. updatedAt

- **name**: updatedAt
- **type**: LocalDateTime
- **visibility**: private
- **description**: 점수 알림이 마지막으로 수정된 날짜와 시간이다. @PrePersist와 @PreUpdate를 통해 엔티티가 저장되거나 수정될 때 자동으로 현재 시간으로 갱신된다.

## 3.3. Operations 구분

### 3.3.1. prePersist

- **name**: prePersist
- **type**: void
- **visibility**: public
- **description**: 엔티티가 데이터베이스에 저장되기 전에 자동으로 호출되는 메서드이다. @PrePersist 어노테이션이 적용되어 있어, createdAt과 updatedAt 필드를 현재 시간으로 자동 설정한다.

### 3.3.2. preUpdate

- **name**: preUpdate
- **type**: void
- **visibility**: public
- **description**: 엔티티가 수정될 때 자동으로 호출되는 메서드이다. @PreUpdate 어노테이션이 적용되어 있어, updatedAt 필드를 현재 시간으로 자동 갱신한다.

## 3.4. ConditionType Enum

### 3.4.1. Enum Values

- **TOTAL**: 종합 점수 - 모든 평가 항목을 종합한 전체 점수
- **TRAFFIC**: 교통 점수 - 대중교통 접근성, 주요 도로 접근성 등
- **AMENITIES**: 편의시설 점수 - 주변 편의시설(마트, 병원, 학교 등)의 접근성
- **PRICE**: 가격 점수 - 가격 대비 가치 평가
- **CONDITION**: 상태 점수 - 매물의 물리적 상태 및 관리 상태
- **DESCRIPTION**: 설명 점수 - 매물 설명의 상세도 및 품질

---

# AlertNotification 클래스

```mermaid
classDiagram
    %% --- AlertNotification 클래스 정의 ---
    class AlertNotification {
        %% 클래스 설명: 가격/점수 알림 조건이 충족되었을 때 발송되는 알림 정보
        -id: Long
        -user: User
        -property: Property
        -priceAlert: PriceAlert
        -scoreAlert: ScoreAlert
        -alertType: AlertType
        -message: String
        -sentAt: LocalDateTime
        -isRead: Boolean
    }

    %% --- AlertType Enum ---
    class AlertType {
        <<enumeration>>
        BUDGET
        SCORE
    }

    %% --- 관련 클래스들 ---
    class User {
        -userId: Long
        -name: String
    }

    class Property {
        -id: Long
        -title: String
    }

    class PriceAlert {
        -id: Long
        -targetValue: BigDecimal
    }

    class ScoreAlert {
        -id: Long
        -targetScore: Integer
    }

    %% --- 관계 정의 ---
    AlertNotification --> User : 다대일 (ManyToOne)
    AlertNotification --> Property : 다대일 (ManyToOne)
    AlertNotification --> PriceAlert : 다대일 (ManyToOne)
    AlertNotification --> ScoreAlert : 다대일 (ManyToOne)
    AlertNotification --> AlertType : 사용 (Uses)
```

## 4.1. class description

가격 또는 점수 알림 조건이 충족되었을 때 발송되는 알림 정보를 관리하는 클래스이다. PriceAlert 또는 ScoreAlert에서 설정한 조건이 만족되면 자동으로 생성되어 사용자에게 전송된다. 어떤 알림 조건에 의해 발송되었는지, 어떤 매물에 대한 알림인지 등의 정보를 포함한다.

## 4.2. attribution 구분

### 4.2.1. id

- **name**: id
- **type**: Long
- **visibility**: private
- **description**: 알림을 고유하게 식별하기 위한 primary key로, 데이터베이스에서 자동 생성되는 알림의 고유 ID이다.

### 4.2.2. user

- **name**: user
- **type**: User
- **visibility**: private
- **description**: 알림을 받을 사용자 정보이다. LAZY 로딩 방식을 사용하며, null 값을 허용하지 않는 필수 필드이다.

### 4.2.3. property

- **name**: property
- **type**: Property
- **visibility**: private
- **description**: 알림과 관련된 매물 정보이다. 조건을 충족한 매물을 나타낸다. LAZY 로딩 방식을 사용하며, null 값을 허용한다.

### 4.2.4. priceAlert

- **name**: priceAlert
- **type**: PriceAlert
- **visibility**: private
- **description**: 이 알림을 발생시킨 가격 알림 조건이다. alertType이 BUDGET인 경우에만 값이 설정된다. LAZY 로딩 방식을 사용하며, null 값을 허용한다.

### 4.2.5. scoreAlert

- **name**: scoreAlert
- **type**: ScoreAlert
- **visibility**: private
- **description**: 이 알림을 발생시킨 점수 알림 조건이다. alertType이 SCORE인 경우에만 값이 설정된다. LAZY 로딩 방식을 사용하며, null 값을 허용한다.

### 4.2.6. alertType

- **name**: alertType
- **type**: AlertType
- **visibility**: private
- **description**: 알림의 유형을 나타내는 열거형 필드이다. BUDGET(가격 알림) 또는 SCORE(점수 알림) 중 하나의 값을 가진다. 최대 16자로 제한되며, null 값을 허용하지 않는 필수 필드이다.

### 4.2.7. message

- **name**: message
- **type**: String
- **visibility**: private
- **description**: 알림의 상세 메시지이다. 어떤 조건이 충족되었는지, 매물의 어떤 정보가 변경되었는지 등을 설명한다. TEXT 타입으로 저장되어 긴 메시지도 저장할 수 있으며, null 값을 허용한다.

### 4.2.8. sentAt

- **name**: sentAt
- **type**: LocalDateTime
- **visibility**: private
- **description**: 알림이 발송된 날짜와 시간이다. null 값을 허용한다.

### 4.2.9. isRead

- **name**: isRead
- **type**: Boolean
- **visibility**: private
- **description**: 알림의 읽음 여부를 나타낸다. 기본값은 false이며, 사용자가 알림을 확인하면 true로 변경된다. null 값을 허용하지 않는 필수 필드이다.

---

# 7. 중개 위임 관련

# Delegation 클래스

```mermaid
classDiagram
  %% --- 연관된 클래스 (이름만 표시) ---
  class User {
    %% 1.2.2. 중개 요청자
  }
  class Broker {
    %% 1.2.3. 중개 담당자
  }
  class Property {
    %% 1.2.4. 중개 대상 매물
  }
  class BaseEntity {
    %% 1.2.10. createdAt을 상속
    +createdAt: LocalDateTime
  }
  class StatusChange {
    %% 1.3.11. 상태 변경 이력 객체
  }

  %% --- DelegationStatus를 일반 클래스로 표현 (요청 사항) ---
  class DelegationStatus {
    %% 1.2.5. 위임 상태 (클래스로 표현됨)
    PENDING
    ACCEPTED
    IN_PROGRESS
    COMPLETED
    CANCELLED
    REJECTED
  }

  %% --- Delegation 클래스 상세 정의 ---
  class Delegation {
    %% 1.1. class description: 사용자-브로커 간의 중개 위임 관리
    -delegationId: Long
    -user: User
    -broker: Broker
    -property: Property
    -status: DelegationStatus
    -requestMessage: String
    -brokerResponse: String
    -desiredBudget: long
    -desiredMoveInDate: LocalDate
    -requestedAt: LocalDateTime
    -acceptedAt: LocalDateTime
    -completedAt: LocalDateTime
    -cancelledAt: LocalDateTime
    -estimatedCommission: long
    -actualCommission: long
    -priority: int
    -notes: String
    -isReviewSubmitted: boolean
    
    +acceptDelegation(brokerResponse: String): void
    +rejectDelegation(reasonMessage: String): void
    +startProgress(): void
    +completeDelegation(actualCommission: long): void
    +cancelDelegation(reason: String): void
    +updateStatus(newStatus: DelegationStatus): void
    +calculateEstimatedCommission(): void
    +updateNotes(newNote: String): void
    +canBeCancelledBy(user: User): boolean
    +getDuration(): long
    +getStatusHistory(): List~StatusChange~
  }

  %% --- 관계 정의 ---
  BaseEntity <|-- Delegation : 상속 (Inheritance)
  Delegation "N" -- "1" User : ManyToOne
  Delegation "N" -- "1" Broker : ManyToOne
  Delegation "N" -- "1" Property : ManyToOne
  Delegation ..> DelegationStatus : 사용 (Uses)
  Delegation ..> StatusChange : 사용 (Returns)
```

## 1.1. class description
사용자가 브로커에게 부동산 중개를 위임한 건에 대한 정보를 관리하는 핵심 클래스이다. 위임의 생성부터 완료까지의 전체 생명주기를 추적하며, 사용자와 브로커 간의 중개 계약 관계를 나타낸다. 이 클래스는 누가 누구에게 어떤 매물에 대해 중개를 요청했는지, 현재 진행 상태는 어떠한지, 언제 요청되고 완료되었는지 등의 모든 정보를 포함하고 있다. 중개 위임은 사용자가 매물을 직접 거래하는 것이 아니라 전문가인 브로커의 도움을 받아 거래를 진행하고자 할 때 생성되며, Real Estate Hub 플랫폼의 핵심 비즈니스 프로세스를 구현한다.

## 1.2. attribution 구분

### 1.2.1. delegationId
* **name**: delegationId
* **type**: Long
* **visibility**: private
* **description**: 중개 위임 건을 고유하게 식별하기 위한 primary key이다. 데이터베이스에서 자동 생성되는 위임의 고유 ID로, 각 위임 건을 추적하고 관리하는 데 사용된다. 이 ID를 통해 특정 위임 건의 전체 이력과 관련 정보를 조회할 수 있다.

### 1.2.2. user
* **name**: user
* **type**: User
* **visibility**: private
* **description**: 중개를 요청한 일반 사용자 객체에 대한 참조이다. ManyToOne 관계로, 한 사용자는 여러 브로커에게 다양한 매물에 대해 중개를 요청할 수 있다. 이 참조를 통해 위임을 요청한 고객의 연락처, 선호도, 과거 거래 이력 등의 정보에 접근할 수 있다.

### 1.2.3. broker
* **name**: broker
* **type**: Broker
* **visibility**: private
* **description**: 중개를 담당하는 브로커 객체에 대한 참조이다. ManyToOne 관계로, 한 브로커는 여러 고객으로부터 중개 의뢰를 받을 수 있다. 이 참조를 통해 담당 브로커의 프로필, 전문 분야, 연락처 등의 정보에 접근하며, 브로커에게 알림을 전송하거나 채팅을 시작할 때 사용된다.

### 1.2.4. property
* **name**: property
* **type**: Property
* **visibility**: private
* **description**: 중개 대상이 되는 매물 객체에 대한 참조이다. ManyToOne 관계로, 하나의 매물에 대해 여러 사용자가 각각 다른 브로커에게 중개를 요청할 수 있다. 이 참조를 통해 매물의 상세 정보, 가격, 위치 등을 확인하며, 브로커가 해당 매물에 대한 정보를 제공하거나 협상을 진행할 때 필요하다.

### 1.2.5. status
* **name**: status
* **type**: DelegationStatus
* **visibility**: private
* **description**: 현재 위임의 진행 상태를 나타내는 열거형 변수이다. PENDING(대기중), ACCEPTED(수락됨), IN_PROGRESS(진행중), COMPLETED(완료됨), CANCELLED(취소됨), REJECTED(거절됨) 등의 값을 가질 수 있으며, 위임 건의 생명주기를 추적한다. 이 상태에 따라 사용자와 브로커에게 다른 UI와 기능이 제공되며, 상태가 변경될 때마다 관련 당사자들에게 알림이 전송된다.


### 1.2.6. requestMessage
* **name**: requestMessage
* **type**: String
* **visibility**: private
* **description**: 사용자가 브로커에게 중개를 요청할 때 함께 보낸 메시지이다. 최대 1000자까지 작성할 수 있으며, 사용자의 구체적인 요구사항, 예산, 선호 조건, 원하는 거래 시기 등을 자유롭게 표현한다. 브로커는 이 메시지를 읽고 고객의 니즈를 파악하여 맞춤형 서비스를 제공할 수 있다.

### 1.2.7. brokerResponse
* **name**: brokerResponse
* **type**: String
* **visibility**: private
* **description**: 브로커가 위임 요청에 대해 답변한 메시지이다. 최대 1000자까지 작성할 수 있으며, 수락하는 경우 서비스 계획과 예상 일정을 안내하고, 거절하는 경우 사유를 설명한다. 이 메시지는 사용자에게 전달되어 브로커의 전문성과 성실성을 판단하는 데 도움을 준다.

### 1.2.8. desiredBudget
* **name**: desiredBudget
* **type**: long
* **visibility**: private
* **description**: 사용자가 희망하는 예산 범위이다. 단위는 원이며, 브로커가 고객에게 적합한 매물을 추천하거나 가격 협상을 진행할 때 중요한 기준이 된다. 실제 매물 가격보다 낮을 수도 있으며, 이 경우 브로커는 협상을 통해 가격을 조정하거나 대안 매물을 제시한다.

### 1.2.9. desiredMoveInDate
* **name**: desiredMoveInDate
* **type**: LocalDate
* **visibility**: private
* **description**: 사용자가 희망하는 입주 날짜이다. 브로커는 이 날짜를 고려하여 거래 일정을 계획하고, 매도자와 협상할 때 이 정보를 활용한다. 급하게 이사해야 하는 고객의 경우 이 날짜가 매우 중요한 조건이 될 수 있다.

### 1.2.10. requestedAt
* **name**: requestedAt
* **type**: LocalDateTime
* **visibility**: private
* **description**: 위임이 요청된 날짜와 시간이다. BaseEntity로부터 상속받은 createdAt과 동일한 값을 가지며, 위임 건을 시간순으로 정렬하거나 브로커의 응답 속도를 측정할 때 사용된다. 또한 오래된 미처리 요청을 자동으로 만료시키는 로직에도 활용된다.

### 1.2.11. acceptedAt
* **name**: acceptedAt
* **type**: LocalDateTime
* **visibility**: private
* **description**: 브로커가 위임을 수락한 날짜와 시간이다. null 값일 수 있으며, 브로커가 수락했을 때만 설정된다. 요청 시간과의 차이를 계산하여 브로커의 평균 응답 시간을 산출하는 데 사용된다.

### 1.2.12. completedAt
* **name**: completedAt
* **type**: LocalDateTime
* **visibility**: private
* **description**: 위임이 완료된 날짜와 시간이다. null 값일 수 있으며, 거래가 성사되었거나 중개 서비스가 종료되었을 때 설정된다. 이 시점 이후에 사용자는 브로커에 대한 리뷰를 작성할 수 있다.

### 1.2.13. cancelledAt
* **name**: cancelledAt
* **type**: LocalDateTime
* **visibility**: private
* **description**: 위임이 취소된 날짜와 시간이다. null 값일 수 있으며, 사용자나 브로커가 위임을 취소했을 때 설정된다. 취소 사유와 함께 기록되어 향후 분쟁이나 통계 분석에 활용될 수 있다.

### 1.2.14. estimatedCommission
* **name**: estimatedCommission
* **type**: long
* **visibility**: private
* **description**: 예상 중개 수수료이다. 단위는 원이며, 법정 수수료율을 기준으로 자동 계산되거나 브로커가 직접 제시할 수 있다. 사용자는 중개를 요청하기 전에 이 금액을 확인하여 총 비용을 파악할 수 있다.

### 1.2.15. actualCommission
* **name**: actualCommission
* **type**: long
* **visibility**: private
* **description**: 실제로 지불된 중개 수수료이다. 거래가 완료된 후에 설정되며, 협상이나 할인으로 인해 예상 수수료와 다를 수 있다. 이 금액은 브로커의 수익 통계와 플랫폼 수수료 계산에 사용된다.

### 1.2.16. priority
* **name**: priority
* **type**: int
* **visibility**: private
* **description**: 위임의 우선순위를 나타낸다. 1부터 5까지의 값을 가지며, 5가 가장 높은 우선순위이다. 사용자가 급하게 거래를 원하거나 프리미엄 서비스를 이용하는 경우 높은 우선순위가 부여된다. 브로커는 우선순위가 높은 위임을 먼저 처리하도록 권장된다.

### 1.2.17. notes
* **name**: notes
* **type**: String
* **visibility**: private
* **description**: 브로커가 위임 진행 과정에서 작성하는 메모이다. 고객과의 통화 내용, 현장 방문 결과, 매도자와의 협상 진행 상황 등을 자유롭게 기록한다. 이 메모는 브로커 본인만 볼 수 있으며, 업무 연속성을 유지하는 데 도움을 준다.

### 1.2.18. isReviewSubmitted
* **name**: isReviewSubmitted
* **type**: boolean
* **visibility**: private
* **description**: 위임 완료 후 사용자가 리뷰를 작성했는지 여부를 나타낸다. 완료된 위임에 대해 아직 리뷰가 작성되지 않은 경우, 사용자에게 리뷰 작성을 유도하는 알림을 전송하는 데 사용된다.

## 1.3. Operations 구분

### 1.3.1. acceptDelegation
* **name**: acceptDelegation
* **type**: void
* **visibility**: public
* **description**: 브로커가 위임 요청을 수락하는 메서드이다. 브로커의 응답 메시지를 매개변수로 받아 brokerResponse에 저장하고, status를 ACCEPTED로 변경하며, acceptedAt을 현재 시간으로 설정한다. 동시에 사용자에게 수락 알림을 전송하고, 채팅방을 자동으로 생성하여 원활한 의사소통이 가능하도록 한다. 브로커의 현재 업무 부하를 고려하여 수락 가능 여부를 먼저 확인하는 검증 로직도 포함된다.

### 1.3.2. rejectDelegation
* **name**: rejectDelegation
* **type**: void
* **visibility**: public
* **description**: 브로커가 위임 요청을 거절하는 메서드이다. 거절 사유를 담은 메시지를 매개변수로 받아 brokerResponse에 저장하고, status를 REJECTED로 변경한다. 사용자에게 거절 알림과 함께 다른 브로커 추천 목록을 제공하여 대안을 모색할 수 있도록 돕는다. 거절 사유는 통계로 수집되어 향후 매칭 알고리즘 개선에 활용된다.

### 1.3.3. startProgress
* **name**: startProgress
* **type**: void
* **visibility**: public
* **description**: 수락된 위임의 실제 작업을 시작하는 메서드이다. status를 IN_PROGRESS로 변경하며, 이 시점부터 브로커는 본격적으로 매물 상담, 현장 방문, 가격 협상 등의 중개 활동을 시작한다. 사용자에게 작업 시작 알림을 전송하고, 진행 상황을 주기적으로 업데이트하도록 브로커에게 안내한다.

### 1.3.4. completeDelegation
* **name**: completeDelegation
* **type**: void
* **visibility**: public
* **description**: 위임을 완료 처리하는 메서드이다. 거래가 성사되었거나 중개 서비스가 종료되었을 때 호출되며, status를 COMPLETED로 변경하고 completedAt을 현재 시간으로 설정한다. 실제 지불된 중개 수수료를 매개변수로 받아 actualCommission에 저장하며, 브로커의 거래 실적에 반영한다. 완료 후 사용자에게 리뷰 작성을 요청하는 알림을 전송한다.

### 1.3.5. cancelDelegation
* **name**: cancelDelegation
* **type**: void
* **visibility**: public
* **description**: 위임을 취소하는 메서드이다. 사용자나 브로커가 취소할 수 있으며, 취소 사유를 매개변수로 받아 기록한다. status를 CANCELLED로 변경하고 cancelledAt을 설정하며, 상대방에게 취소 알림을 전송한다. 위임의 현재 상태에 따라 취소 가능 여부와 위약금 발생 여부를 판단하는 로직도 포함된다.

### 1.3.6. updateStatus
* **name**: updateStatus
* **type**: void
* **visibility**: public
* **description**: 위임의 상태를 변경하는 범용 메서드이다. 새로운 DelegationStatus를 매개변수로 받아 현재 상태에서 해당 상태로 전환이 유효한지 검증한 후 변경한다. 상태 전환 규칙을 엄격하게 관리하여 잘못된 상태 변경을 방지하며, 각 상태 변경 시 적절한 후속 작업을 자동으로 수행한다.

### 1.3.7. calculateEstimatedCommission
* **name**: calculateEstimatedCommission
* **type**: void
* **visibility**: public
* **description**: 예상 중개 수수료를 계산하는 메서드이다. 매물 가격과 법정 중개보수 요율을 기준으로 자동 계산하며, 계산된 금액을 estimatedCommission에 저장한다. 거래 유형과 매물 가격대에 따라 다른 요율이 적용되며, 이 정보는 사용자가 위임을 요청하기 전에 확인할 수 있도록 제공된다.

### 1.3.8. updateNotes
* **name**: updateNotes
* **type**: void
* **visibility**: public
* **description**: 브로커가 위임 진행 과정에서 메모를 추가하거나 수정하는 메서드이다. 새로운 메모 내용을 매개변수로 받아 기존 notes에 타임스탬프와 함께 추가하며, 브로커가 작업 이력을 체계적으로 관리할 수 있도록 돕는다. 이 메모는 나중에 분쟁이 발생했을 때 증거 자료로도 활용될 수 있다.

### 1.3.9. canBeCancelledBy
* **name**: canBeCancelledBy
* **type**: boolean
* **visibility**: public
* **description**: 특정 사용자가 현재 위임을 취소할 수 있는 권한이 있는지 확인하는 메서드이다. 사용자 객체를 매개변수로 받아, 그 사용자가 위임을 요청한 고객이거나 담당 브로커인지, 그리고 현재 위임의 상태가 취소 가능한 상태인지를 종합적으로 판단하여 boolean 값을 반환한다.

### 1.3.10. getDuration
* **name**: getDuration
* **type**: long
* **visibility**: public
* **description**: 위임이 요청된 시점부터 현재까지의 경과 시간을 계산하는 메서드이다. 완료된 위임의 경우 요청부터 완료까지의 총 소요 시간을 반환하며, 단위는 일(day)이다. 이 정보는 브로커의 업무 처리 속도를 평가하는 지표로 사용된다.

### 1.3.11. getStatusHistory
* **name**: getStatusHistory
* **type**: List\<StatusChange\>
* **visibility**: public
* **description**: 위임의 상태 변경 이력을 시간순으로 반환하는 메서드이다. 언제 어떤 상태로 변경되었는지를 추적하여 리스트로 제공하며, 위임의 전체 진행 과정을 타임라인 형태로 시각화할 때 사용된다. 이는 투명한 서비스 제공과 분쟁 해결에 도움을 준다.



# DelegationStatus 클래스

```mermaid
classDiagram
  %% 2.1. class description: 중개 위임의 진행 상태를 정의 (class로 표현)
  class DelegationStatus {
    %% 2.2.1-2.2.6: Enum Constants (각각 별도 줄에 작성)
    PENDING
    ACCEPTED
    IN_PROGRESS
    COMPLETED
    CANCELLED
    REJECTED
    
    %% 2.2.7-2.2.10: Attributes
    -statusCode: String
    -statusName: String
    -description: String
    -allowedNextStatuses: List~DelegationStatus~
    
    %% 2.3.1-2.3.8: Operations
    +getStatusCode(): String
    +getStatusName(): String
    +getDescription(): String
    +canTransitionTo(targetStatus: DelegationStatus): boolean
    +isTerminalStatus(): boolean
    +requiresBrokerAction(): boolean
    +requiresUserAction(): boolean
    +getNextRecommendedAction(): String
  }
  
  %% 2.2.10. allowedNextStatuses에 대한 자기 참조 관계 (집약 관계)
  DelegationStatus "1" o--> "0..*" DelegationStatus : "allowedNextStatuses"
```

## 2.1. class description
중개 위임의 진행 상태를 정의하는 열거형(Enum) 클래스이다. 위임의 생명주기 전체를 여섯 가지 주요 상태로 구분하여 관리하며, 각 상태는 특정한 의미와 다음 가능한 상태 전환을 정의한다. 이 열거형은 위임 프로세스의 명확한 흐름을 보장하고, 각 상태에 따라 사용자와 브로커에게 적절한 기능과 정보를 제공하는 기준이 된다. 예를 들어 PENDING 상태에서는 브로커에게 수락/거절 버튼이 표시되고, IN_PROGRESS 상태에서는 진행 상황 업데이트와 채팅 기능이 활성화된다.

## 2.2. attribution 구분

### 2.2.1. PENDING
* **name**: PENDING
* **type**: DelegationStatus
* **visibility**: public
* **description**: 사용자가 브로커에게 중개를 요청했지만 브로커가 아직 응답하지 않은 대기 상태이다. 이 상태는 위임이 생성된 직후의 초기 상태이며, 브로커는 일정 시간 내에 수락 또는 거절로 응답해야 한다. 너무 오래 대기 상태로 남아있는 경우 자동으로 만료되거나 다른 브로커에게 재할당될 수 있다.

### 2.2.2. ACCEPTED
* **name**: ACCEPTED
* **type**: DelegationStatus
* **visibility**: public
* **description**: 브로커가 중개 요청을 수락한 상태이다. 이 시점에서 사용자와 브로커 간의 중개 계약이 성립되며, 채팅방이 자동으로 생성되어 양측이 소통할 수 있다. 브로커는 곧 실제 중개 활동을 시작할 준비를 하며, 사용자는 브로커의 다음 연락을 기다린다.

### 2.2.3. IN_PROGRESS
* **name**: IN_PROGRESS
* **type**: DelegationStatus
* **visibility**: public
* **description**: 브로커가 실제로 중개 활동을 진행하고 있는 상태이다. 매물 상담, 현장 방문, 가격 협상, 계약서 준비 등의 구체적인 작업이 이루어지는 단계이며, 가장 긴 시간이 소요되는 상태이다. 브로커는 주기적으로 진행 상황을 사용자에게 업데이트하며, 사용자는 언제든지 질문하거나 추가 요청을 할 수 있다.

### 2.2.4. COMPLETED
* **name**: COMPLETED
* **type**: DelegationStatus
* **visibility**: public
* **description**: 중개가 성공적으로 완료된 상태이다. 거래가 성사되었거나, 계약이 체결되었거나, 또는 중개 서비스가 정상적으로 종료되었음을 의미한다. 이 상태에 도달하면 사용자는 브로커에 대한 리뷰를 작성할 수 있으며, 중개 수수료가 정산된다. 완료된 위임은 양측의 거래 이력에 기록되어 향후 참고 자료가 된다.

### 2.2.5. CANCELLED
* **name**: CANCELLED
* **type**: DelegationStatus
* **visibility**: public
* **description**: 위임이 취소된 상태이다. 사용자나 브로커가 중도에 중개를 중단하기로 결정했거나, 고객이 다른 브로커를 선택했거나, 더 이상 매물이 필요하지 않게 된 경우 등의 이유로 취소된다. 취소 사유는 별도로 기록되며, 취소 시점과 진행 정도에 따라 부분적인 수수료가 발생할 수 있다.

### 2.2.6. REJECTED
* **name**: REJECTED
* **type**: DelegationStatus
* **visibility**: public
* **description**: 브로커가 중개 요청을 거절한 상태이다. 브로커의 업무 과부하, 전문 분야 불일치, 지역적 한계, 또는 고객의 비현실적인 요구사항 등의 이유로 거절될 수 있다. 거절 사유는 사용자에게 전달되며, 시스템은 자동으로 다른 적합한 브로커를 추천하여 사용자가 빠르게 대안을 찾을 수 있도록 돕는다.

### 2.2.7. statusCode
* **name**: statusCode
* **type**: String
* **visibility**: private
* **description**: 각 상태를 코드로 표현한 문자열이다. 예를 들어 PENDING은 "PD", ACCEPTED는 "AC"와 같은 짧은 코드로 저장될 수 있으며, 데이터베이스 저장 공간을 절약하거나 API 응답을 간소화할 때 사용된다.

### 2.2.8. statusName
* **name**: statusName
* **type**: String
* **visibility**: private
* **description**: 각 상태의 한글 또는 현지 언어 이름이다. 예를 들어 PENDING은 "대기중", ACCEPTED는 "수락됨"으로 저장되며, 사용자 인터페이스에 표시할 때 사용된다. 다국어 지원을 위해 언어별로 다른 값을 가질 수 있다.

### 2.2.9. description
* **name**: description
* **type**: String
* **visibility**: private
* **description**: 각 상태에 대한 자세한 설명이다. 사용자나 브로커에게 현재 상태가 무엇을 의미하는지, 다음 단계는 무엇인지를 안내하는 도움말로 사용되며, 툴팁이나 정보 패널에 표시된다.

### 2.2.10. allowedNextStatuses
* **name**: allowedNextStatuses
* **type**: List\<DelegationStatus\>
* **visibility**: private
* **description**: 현재 상태에서 전환 가능한 다음 상태들의 목록이다. 예를 들어 PENDING 상태에서는 ACCEPTED, REJECTED, CANCELLED로만 전환할 수 있으며, 잘못된 상태 전환을 방지하는 검증에 사용된다. 이를 통해 비즈니스 규칙을 코드 레벨에서 강제할 수 있다.

## 2.3. Operations 구분

### 10.3.1. getStatusCode
* **name**: getStatusCode
* **type**: String
* **visibility**: public
* **description**: 현재 상태의 코드를 반환하는 getter 메서드이다. API 응답이나 데이터베이스 조회 시 간결한 형태로 상태 정보를 전달할 때 사용되며, 프론트엔드에서 상태별 아이콘이나 색상을 결정하는 데 활용된다.

### 2.3.2. getStatusName
* **name**: getStatusName
* **type**: String
* **visibility**: public
* **description**: 현재 상태의 이름을 반환하는 getter 메서드이다. 사용자 인터페이스에서 상태를 읽기 쉬운 형태로 표시할 때 사용되며, 언어 설정에 따라 적절한 번역된 텍스트를 제공한다.

### 2.3.3. getDescription
* **name**: getDescription
* **type**: String
* **visibility**: public
* **description**: 현재 상태에 대한 설명을 반환하는 getter 메서드이다. 사용자가 상태의 의미를 정확히 이해할 수 있도록 상세한 안내 텍스트를 제공하며, 도움말 기능에 활용된다.

### 2.3.4. canTransitionTo
* **name**: canTransitionTo
* **type**: boolean
* **visibility**: public
* **description**: 현재 상태에서 특정 다른 상태로 전환이 가능한지 확인하는 메서드이다. 목표 상태를 매개변수로 받아 allowedNextStatuses에 포함되어 있는지 검사하며, 상태 변경 전에 유효성을 검증하는 데 사용된다. 이를 통해 잘못된 상태 전환으로 인한 데이터 무결성 문제를 예방한다.

### 2.3.5. isTerminalStatus
* **name**: isTerminalStatus
* **type**: boolean
* **visibility**: public
* **description**: 현재 상태가 최종 상태인지 확인하는 메서드이다. COMPLETED, CANCELLED, REJECTED는 최종 상태로 간주되며, 이 상태에 도달하면 더 이상 상태 변경이 불가능하다. 최종 상태의 위임은 아카이브되거나 통계 자료로 활용된다.

### 2.3.6. requiresBrokerAction
* **name**: requiresBrokerAction
* **type**: boolean
* **visibility**: public
* **description**: 현재 상태에서 브로커의 조치가 필요한지 확인하는 메서드이다. PENDING 상태에서는 브로커의 수락/거절 결정이 필요하고, IN_PROGRESS 상태에서는 진행 상황 업데이트가 필요하다. 이를 바탕으로 브로커에게 적절한 알림과 액션 버튼을 제공한다.

### 2.3.7. requiresUserAction
* **name**: requiresUserAction
* **type**: boolean
* **visibility**: public
* **description**: 현재 상태에서 사용자의 조치가 필요한지 확인하는 메서드이다. COMPLETED 상태에서는 리뷰 작성이 필요하며, 이를 기반으로 사용자에게 적절한 안내와 알림을 제공한다.

### 2.3.8. getNextRecommendedAction
* **name**: getNextRecommendedAction
* **type**: String
* **visibility**: public
* **description**: 현재 상태에서 권장되는 다음 행동을 문자열로 반환하는 메서드이다. 예를 들어 PENDING 상태에서는 브로커에게 "24시간 이내에 응답해주세요"라는 안내를, ACCEPTED 상태에서는 "고객에게 연락하여 일정을 잡으세요"라는 안내를 제공한다.



# DelegationRequest 클래스

```mermaid
classDiagram
  %% --- 연관된 엔티티 (이름만 표시) ---
  class Delegation {
    %% 3.3.7. toDelegation() 메서드가 생성/반환하는 엔티티
  }
  class User {
    %% 3.3.7. toDelegation()의 매개변수로 사용됨
  }
  class Broker {
    %% 3.3.2. 유효성 검증 대상 및 3.3.7. 매개변수로 사용됨
  }
  class Property {
    %% 3.3.3. 유효성 검증 대상
  }

  %% --- DelegationRequest DTO 클래스 상세 정의 ---
  class DelegationRequest {
    %% 3.1. class description: 중개 요청 DTO
    -brokerId: Long
    -propertyId: Long
    -requestMessage: String
    -desiredBudget: Long
    -desiredMoveInDate: LocalDate
    -priority: Integer
    -contactMethod: String
    -preferredContactTime: String
    -additionalRequirements: String
    -isUrgent: Boolean
    -agreeToTerms: Boolean
    -agreeToCommission: Boolean

    +validate(): boolean
    -validateBrokerId(): boolean
    -validatePropertyId(): boolean
    -validateDates(): boolean
    -validateBudget(): boolean
    +sanitizeInputs(): void
    +toDelegation(user: User, broker: Broker): Delegation
    +getEstimatedCommission(): long
    +checkAvailability(): boolean
    +generateRequestSummary(): String
  }

  %% --- 관계 정의 ---
  DelegationRequest ..> Delegation : "Creates"
  DelegationRequest ..> User : "Uses"
  DelegationRequest ..> Broker : "Uses"
  DelegationRequest ..> Property : "Uses"
```

## 3.1. class description
사용자가 브로커에게 중개를 요청할 때 전달하는 정보를 담은 DTO(Data Transfer Object) 클래스이다. 실제 Delegation 엔티티가 생성되기 전에 사용자로부터 필요한 모든 정보를 수집하고 검증하는 역할을 한다. 이 클래스는 웹 요청의 바디로 전달되거나 폼 데이터로 제출되며, 서비스 레이어에서 유효성을 검증한 후 실제 Delegation 엔티티로 변환된다. DTO 패턴을 사용함으로써 엔티티 클래스를 직접 노출하지 않고, 요청에 필요한 데이터만 선택적으로 받을 수 있어 보안과 유연성이 향상된다.

## 3.2. attribution 구분

### 3.2.1. brokerId
* **name**: brokerId
* **type**: Long
* **visibility**: private
* **description**: 중개를 요청할 브로커의 ID이다. 사용자가 브로커 목록에서 특정 브로커를 선택했을 때 그 브로커의 고유 ID가 여기에 저장된다. 이 ID를 통해 실제 Broker 엔티티를 조회하여 위임을 생성한다. null이 아니어야 하며, 존재하는 브로커의 ID여야 한다.

### 3.2.2. propertyId
* **name**: propertyId
* **type**: Long
* **visibility**: private
* **description**: 중개를 요청하려는 매물의 ID이다. 사용자가 관심 있는 매물 상세 페이지에서 중개 요청 버튼을 클릭했을 때 해당 매물의 ID가 자동으로 설정된다. 이 ID를 통해 실제 Property 엔티티를 조회하여 위임과 연결한다. null이 아니어야 하며, 실제 존재하는 매물이어야 한다.

### 3.2.3. requestMessage
* **name**: requestMessage
* **type**: String
* **visibility**: private
* **description**: 사용자가 브로커에게 전달하려는 메시지이다. 사용자의 구체적인 요구사항, 질문, 선호 조건 등을 자유롭게 작성할 수 있으며, 최소 10자 이상, 최대 1000자까지 입력 가능하다. 이 필드는 필수가 아닐 수 있지만, 구체적인 메시지가 있을 때 브로커가 더 나은 서비스를 제공할 수 있다.

### 3.2.4. desiredBudget
* **name**: desiredBudget
* **type**: Long
* **visibility**: private
* **description**: 사용자가 희망하는 예산이다. 양수여야 하며, 실제 매물 가격과 다를 수 있다. 브로커는 이 예산을 참고하여 가격 협상을 진행하거나 예산 내에서 가능한 대안을 제시한다. null일 수 있으며, 이 경우 매물의 정가를 기준으로 한다.

### 3.2.5. desiredMoveInDate
* **name**: desiredMoveInDate
* **type**: LocalDate
* **visibility**: private
* **description**: 사용자가 희망하는 입주 날짜이다. 오늘 날짜 이후여야 하며, 너무 먼 미래(예: 1년 후)는 허용되지 않을 수 있다. 브로커는 이 날짜를 고려하여 거래 일정을 조율하며, 급한 경우 우선순위를 높게 설정할 수 있다.

### 3.2.6. priority
* **name**: priority
* **type**: Integer
* **visibility**: private
* **description**: 사용자가 설정하는 요청의 우선순위이다. 1부터 5까지의 값을 가질 수 있으며, 기본값은 3(보통)이다. 프리미엄 사용자나 급한 거래의 경우 높은 우선순위를 설정할 수 있으며, 이는 브로커의 작업 순서에 영향을 줄 수 있다.

### 3.2.7. contactMethod
* **name**: contactMethod
* **type**: String
* **visibility**: private
* **description**: 사용자가 선호하는 연락 방법이다. "전화", "이메일", "채팅", "문자" 등의 값을 가질 수 있으며, 브로커가 고객에게 연락할 때 이 선호도를 참고한다. 여러 방법을 선택할 수 있도록 쉼표로 구분된 문자열로 저장될 수 있다.

### 3.2.8. preferredContactTime
* **name**: preferredContactTime
* **type**: String
* **visibility**: private
* **description**: 사용자가 연락 받기 선호하는 시간대이다. "오전", "오후", "저녁", "주말만" 등의 값을 가질 수 있으며, 브로커가 고객에게 연락할 최적의 시간을 파악하는 데 도움을 준다. 직장인 고객의 경우 업무 시간을 피하고자 할 때 유용하다.

### 3.2.9. additionalRequirements
* **name**: additionalRequirements
* **type**: String
* **visibility**: private
* **description**: 사용자의 추가적인 요구사항이나 특별한 조건이다. 예를 들어 반려동물 동반 가능 여부, 주차 공간 필요성, 리모델링 필요 여부 등 requestMessage에 포함되지 않은 구체적인 조건들을 기술한다. 선택적 필드이며 최대 500자까지 작성 가능하다.

### 3.2.10. isUrgent
* **name**: isUrgent
* **type**: Boolean
* **visibility**: private
* **description**: 긴급 처리가 필요한지 여부를 나타낸다. true인 경우 시스템은 자동으로 priority를 높게 설정하고, 브로커에게 긴급 알림을 전송한다. 기본값은 false이며, 남용을 방지하기 위해 일정 기간 동안 긴급 요청 횟수를 제한할 수 있다.

### 3.2.11. agreeToTerms
* **name**: agreeToTerms
* **type**: Boolean
* **visibility**: private
* **description**: 사용자가 중개 서비스 이용 약관에 동의했는지 여부이다. true여야만 요청이 처리되며, 필수 동의 항목이다. 법적 보호와 명확한 서비스 조건 제시를 위해 반드시 확인해야 한다.

### 3.2.12. agreeToCommission
* **name**: agreeToCommission
* **type**: Boolean
* **visibility**: private
* **description**: 사용자가 중개 수수료 지불에 동의했는지 여부이다. true여야만 요청이 처리되며, 예상 수수료 금액을 확인한 후 동의하도록 프로세스가 설계되어야 한다. 나중에 수수료 분쟁을 예방하는 중요한 필드이다.

## 3.3. Operations 구분

### 3.3.1. validate
* **name**: validate
* **type**: boolean
* **visibility**: public
* **description**: 요청 데이터의 유효성을 종합적으로 검증하는 메서드이다. 모든 필수 필드가 채워져 있는지, 각 필드의 값이 허용된 범위 내에 있는지, 논리적으로 모순되는 부분은 없는지 등을 체크한다. 검증에 실패하면 구체적인 오류 메시지와 함께 false를 반환하여 사용자에게 수정을 요청한다.

### 3.3.2. validateBrokerId
* **name**: validateBrokerId
* **type**: boolean
* **visibility**: private
* **description**: 브로커 ID의 유효성을 검증하는 메서드이다. null이 아닌지, 양수인지, 그리고 실제로 존재하는 브로커의 ID인지를 확인한다. 또한 해당 브로커가 현재 새로운 위임을 받을 수 있는 활성 상태인지도 검증한다.

### 3.3.3. validatePropertyId
* **name**: validatePropertyId
* **type**: boolean
* **visibility**: private
* **description**: 매물 ID의 유효성을 검증하는 메서드이다. null이 아닌지, 양수인지, 그리고 실제로 존재하며 현재 판매 중인 매물의 ID인지를 확인한다. 이미 거래 완료된 매물에 대한 위임 요청은 거부된다.

### 3.3.4. validateDates
* **name**: validateDates
* **type**: boolean
* **visibility**: private
* **description**: 날짜 관련 필드의 유효성을 검증하는 메서드이다. 희망 입주일이 오늘 이후인지, 너무 먼 미래가 아닌지 등을 확인하며, 날짜 형식이 올바른지도 검사한다.

### 3.3.5. validateBudget
* **name**: validateBudget
* **type**: boolean
* **visibility**: private
* **description**: 예산의 유효성을 검증하는 메서드이다. 양수인지, 현실적인 범위 내의 금액인지를 확인한다. 매물 가격의 일정 비율 이하로 너무 낮은 예산은 경고와 함께 재확인을 요청할 수 있다.

### 3.3.6. sanitizeInputs
* **name**: sanitizeInputs
* **type**: void
* **visibility**: public
* **description**: 사용자 입력값을 정제하는 메서드이다. 문자열 필드의 앞뒤 공백을 제거하고, XSS 공격을 방지하기 위해 위험한 HTML 태그나 스크립트를 제거하며, 허용되지 않은 특수 문자를 필터링한다. 보안을 위해 데이터베이스에 저장하기 전에 반드시 실행되어야 한다.

### 3.3.7. toDelegation
* **name**: toDelegation
* **type**: Delegation
* **visibility**: public
* **description**: 검증된 DTO 데이터를 실제 Delegation 엔티티 객체로 변환하는 메서드이다. User와 Broker 객체를 매개변수로 받아 새로운 Delegation 인스턴스를 생성하고, DTO의 모든 필드 값을 엔티티의 적절한 필드에 매핑한다. 초기 상태는 PENDING으로 설정되며, 생성 시간도 자동으로 기록된다.

### 3.3.8. getEstimatedCommission
* **name**: getEstimatedCommission
* **type**: long
* **visibility**: public
* **description**: 이 요청에 대한 예상 중개 수수료를 계산하여 반환하는 메서드이다. 매물 가격이나 사용자가 입력한 예산을 기준으로 법정 수수료율을 적용하여 계산하며, 사용자가 요청을 제출하기 전에 예상 비용을 확인할 수 있도록 한다.

### 3.3.9. checkAvailability
* **name**: checkAvailability
* **type**: boolean
* **visibility**: public
* **description**: 선택한 브로커가 현재 새로운 위임을 받을 수 있는 상태인지 확인하는 메서드이다. 브로커의 현재 업무 부하, 휴가 상태, 전문 지역 등을 종합적으로 고려하여 위임 가능 여부를 판단한다. 불가능한 경우 대체 브로커를 추천할 수 있다.

### 3.3.10. generateRequestSummary
* **name**: generateRequestSummary
* **type**: String
* **visibility**: public
* **description**: 요청 내용을 요약한 문자열을 생성하는 메서드이다. 매물 정보, 예산, 희망 일정 등의 핵심 정보를 간단히 정리하여 확인 화면이나 알림 메시지에 사용할 수 있는 형태로 제공한다. 사용자가 요청을 제출하기 전 최종 확인 단계에서 활용된다.

---

# 8. 소유권 검증 관련

```mermaid
classDiagram
  class OwnershipClaim {
    -id: Long
    -userId: Long
    -propertyId: Long
    -claimStatus: String
    -reason: String
    -createdAt: LocalDateTime
    -updatedAt: LocalDateTime
    +approve(): void
    +reject(reason: String): void
    +requestMoreDocs(reason: String): void
    +isTerminal(): boolean
  }

  class OwnershipDocument {
    -id: Long
    -claimId: Long
    -documentType: String
    -documentUrl: String
    -verified: boolean
    -uploadedAt: LocalDateTime
    +markVerified(): void
    +isImageLike(): boolean
  }

  class OwnershipClaimCreateRequest {
    -userId: Long
    -propertyId: Long
    -message: String
    -documentUrls: List~String~
    +validate(): boolean
    +toEntity(): OwnershipClaim
  }

  class OwnershipClaimRequest {
    -claimId: Long
    -action: String
    -reason: String
    -additionalDocumentUrls: List~String~
    +validate(): boolean
    +toUpdateInstruction(): Map~String,Object~
  }

  class OwnershipClaimResponse {
    -claimId: Long
    -userId: Long
    -propertyId: Long
    -status: String
    -reason: String
    -documents: List~OwnershipDocumentSummary~
    -createdAt: LocalDateTime
    -updatedAt: LocalDateTime
    +from(entity: OwnershipClaim, docs: List~OwnershipDocument~): OwnershipClaimResponse
    +summarize(): String
  }

  class OwnershipClaimRepository {
    +save(entity: OwnershipClaim): OwnershipClaim
    +findById(id: Long): Optional~OwnershipClaim~
    +findAllByUserId(userId: Long): List~OwnershipClaim~
    +existsByPropertyIdAndUserId(propertyId: Long, userId: Long): boolean
  }

  class OwnershipDocumentRepository {
    +save(doc: OwnershipDocument): OwnershipDocument
    +findAllByClaimId(claimId: Long): List~OwnershipDocument~
    +deleteById(id: Long): void
  }

  class OwnershipClaimService {
    -claimRepository: OwnershipClaimRepository
    -documentRepository: OwnershipDocumentRepository
    -clock: Clock
    +create(req: OwnershipClaimCreateRequest): OwnershipClaimResponse
    +update(req: OwnershipClaimRequest): OwnershipClaimResponse
    +getDetail(id: Long): OwnershipClaimResponse
    +listByUser(userId: Long): List~OwnershipClaimResponse~
    +attachDocuments(id: Long, urls: List~String~): OwnershipClaimResponse
  }

  class OwnershipClaimController {
    -service: OwnershipClaimService
    -mapper: Object
    +POST /ownership-claims: OwnershipClaimResponse
    +PATCH /ownership-claims/{id}: OwnershipClaimResponse
    +GET /ownership-claims/{id}: OwnershipClaimResponse
    +GET /ownership-claims?userId=: List~OwnershipClaimResponse~
  }
```

## OwnershipClaim 클래스

### 1.1 class description
부동산에 대한 소유권 주장을 표현하는 엔티티로, 사용자와 매물 간의 검증 절차를 관리한다.  
상태 전이(PENDING → APPROVED / REJECTED / NEED_MORE_DOCS)와 생성·검토 시점을 추적한다.

### 1.2 attribution 구분

#### 1.2.1. id
* **name**: id  
* **type**: Long  
* **visibility**: private  
* **description**: 소유권 주장 고유 식별자(PK).

#### 1.2.2. userId
* **name**: userId  
* **type**: Long  
* **visibility**: private  
* **description**: 주장을 제기한 사용자(User)의 ID.

#### 1.2.3. propertyId
* **name**: propertyId  
* **type**: Long  
* **visibility**: private  
* **description**: 대상 매물(Property)의 ID.

#### 1.2.4. claimStatus
* **name**: claimStatus  
* **type**: String  
* **visibility**: private  
* **description**: 처리 상태 (PENDING / APPROVED / REJECTED / NEED_MORE_DOCS).

#### 1.2.5. reason
* **name**: reason  
* **type**: String  
* **visibility**: private  
* **description**: 거절·보류 사유 또는 비고.

#### 1.2.6. createdAt
* **name**: createdAt  
* **type**: LocalDateTime  
* **visibility**: private  
* **description**: 생성 시각.

#### 1.2.7. updatedAt
* **name**: updatedAt  
* **type**: LocalDateTime  
* **visibility**: private  
* **description**: 갱신 시각.

### 1.3 Operations 구분

#### 1.3.1. approve
* **type**: void / public  
* **description**: 상태를 APPROVED로 변경하고 `updatedAt`을 갱신한다.

#### 1.3.2. reject
* **type**: void / public  
* **description**: 상태를 REJECTED로 변경하고 사유를 기록한다.

#### 1.3.3. requestMoreDocs
* **type**: void / public  
* **description**: 추가 서류 요청 상태로 전환한다.

#### 1.3.4. isTerminal
* **type**: boolean / public  
* **description**: 현재 상태가 APPROVED 또는 REJECTED인지 여부를 반환한다.

---

## OwnershipDocument 클래스

### 2.1 class description
소유권 주장에 첨부되는 증빙 문서를 나타낸다. (등기부등본, 세금영수증, 매매계약서 등)

### 2.2 attribution 구분

#### 2.2.1. id
* **type**: Long / private — 문서 고유 식별자(PK).

#### 2.2.2. claimId
* **type**: Long / private — 연관된 OwnershipClaim의 ID(FK).

#### 2.2.3. documentType
* **type**: String / private — 문서 유형(DEED, TAX, BILL 등).

#### 2.2.4. documentUrl
* **type**: String / private — 스토리지에 저장된 문서 URL.

#### 2.2.5. verified
* **type**: boolean / private — 검토 완료 여부.

#### 2.2.6. uploadedAt
* **type**: LocalDateTime / private — 업로드 시각.

### 2.3 Operations 구분

#### 2.3.1. markVerified
* **type**: void / public — 문서를 검증 완료 상태로 변경한다.

#### 2.3.2. isImageLike
* **type**: boolean / public — 이미지 또는 PDF형 문서인지 판별한다.

---

## OwnershipClaimCreateRequest 클래스

### 3.1 class description
소유권 주장을 최초로 생성할 때 사용하는 요청 DTO이다.

### 3.2 attribution 구분

#### 3.2.1. userId
* **type**: Long / private — 주장자 ID.

#### 3.2.2. propertyId
* **type**: Long / private — 대상 부동산 ID.

#### 3.2.3. message
* **type**: String / private — 검토 참고 메시지.

#### 3.2.4. documentUrls
* **type**: List<String> / private — 첨부 문서 URL 목록.

### 3.3 Operations 구분

#### 3.3.1. validate
* **type**: boolean / public — 필수 입력(userId, propertyId 등) 검증.

#### 3.3.2. toEntity
* **type**: OwnershipClaim / public — 초기 상태 PENDING으로 엔티티 변환.

---

## OwnershipClaimRequest 클래스

### 4.1 class description
소유권 주장 갱신·보완 요청 DTO로, 상태 변경 및 추가 문서 첨부 시 사용된다.

### 4.2 attribution 구분

#### 4.2.1. claimId
* **type**: Long / private — 대상 주장 ID.

#### 4.2.2. action
* **type**: String / private — 수행 동작(APPROVE, REJECT, NEED_MORE_DOCS 등).

#### 4.2.3. reason
* **type**: String / private — 사유 설명.

#### 4.2.4. additionalDocumentUrls
* **type**: List<String> / private — 추가 제출 문서 목록.

### 4.3 Operations 구분

#### 4.3.1. validate
* **type**: boolean / public — 상태 전이 규칙 검증.

#### 4.3.2. toUpdateInstruction
* **type**: Map<String,Object> / public — 서비스 계층용 변경 명세 생성.

---

## OwnershipClaimResponse 클래스

### 5.1 class description
소유권 주장 정보를 클라이언트로 반환하기 위한 응답 DTO이다.

### 5.2 attribution 구분

#### 5.2.1. claimId
* **type**: Long / private — 주장 ID.

#### 5.2.2. userId
* **type**: Long / private — 사용자 ID.

#### 5.2.3. propertyId
* **type**: Long / private — 부동산 ID.

#### 5.2.4. status
* **type**: String / private — 처리 상태.

#### 5.2.5. reason
* **type**: String / private — 상태 사유.

#### 5.2.6. documents
* **type**: List<OwnershipDocumentSummary> / private — 첨부 문서 목록.

#### 5.2.7. createdAt
* **type**: LocalDateTime / private — 생성 시각.

#### 5.2.8. updatedAt
* **type**: LocalDateTime / private — 최종 수정 시각.

### 5.3 Operations 구분

#### 5.3.1. from
* **type**: OwnershipClaimResponse / public — 엔티티와 문서 목록을 매핑.

#### 5.3.2. summarize
* **type**: String / public — 요약 텍스트 생성(예: “승인 대기 - 문서 2개”).

---

## OwnershipClaimService 클래스

### 6.1 class description
소유권 주장 생성·갱신·문서 첨부·상태 변경 로직을 담당하는 서비스 계층 클래스.

### 6.2 attribution 구분

#### 6.2.1. claimRepository
* **type**: OwnershipClaimRepository / private — 주장 데이터 접근 계층.

#### 6.2.2. documentRepository
* **type**: OwnershipDocumentRepository / private — 문서 데이터 접근 계층.

#### 6.2.3. clock
* **type**: Clock / private — 시간 주입용.

### 6.3 Operations 구분

#### 6.3.1. create
* **type**: OwnershipClaimResponse / public — 주장 생성.

#### 6.3.2. update
* **type**: OwnershipClaimResponse / public — 상태 업데이트.

#### 6.3.3. getDetail
* **type**: OwnershipClaimResponse / public — 단일 조회.

#### 6.3.4. listByUser
* **type**: List<OwnershipClaimResponse> / public — 사용자별 목록.

#### 6.3.5. attachDocuments
* **type**: OwnershipClaimResponse / public — 문서 첨부.

---

## OwnershipClaimController 클래스

### 7.1 class description
소유권 주장과 관련된 REST API를 제공하는 컨트롤러.

### 7.2 attribution 구분

#### 7.2.1. service
* **type**: OwnershipClaimService / private — 비즈니스 로직.

#### 7.2.2. mapper
* **type**: Object / private — DTO 매핑 보조.

### 7.3 Operations 구분

#### 7.3.1. POST /ownership-claims
* **type**: OwnershipClaimResponse / public — 주장 생성.

#### 7.3.2. PATCH /ownership-claims/{id}
* **type**: OwnershipClaimResponse / public — 상태 변경 및 문서 첨부.

#### 7.3.3. GET /ownership-claims/{id}
* **type**: OwnershipClaimResponse / public — 단건 상세 조회.

#### 7.3.4. GET /ownership-claims?userId=
* **type**: List<OwnershipClaimResponse> / public — 사용자별 목록 조회.

---

## OwnershipClaimRepository 클래스

### 8.1 class description
소유권 주장 엔티티용 JPA 리포지토리 인터페이스.

### 8.2 attribution 구분
- (상태 없음, 인터페이스)

### 8.3 Operations 구분

#### 8.3.1. save
* **type**: OwnershipClaim / public — 엔티티 저장.

#### 8.3.2. findById
* **type**: Optional<OwnershipClaim> / public — ID 기반 조회.

#### 8.3.3. findAllByUserId
* **type**: List<OwnershipClaim> / public — 사용자 ID로 조회.

#### 8.3.4. existsByPropertyIdAndUserId
* **type**: boolean / public — 동일 매물 중복 주장 여부 확인.

---

## OwnershipDocumentRepository 클래스

### 9.1 class description
소유권 증빙 문서용 리포지토리 인터페이스.

### 9.2 attribution 구분
- (상태 없음, 인터페이스)

### 9.3 Operations 구분

#### 9.3.1. save
* **type**: OwnershipDocument / public — 문서 저장.

#### 9.3.2. findAllByClaimId
* **type**: List<OwnershipDocument> / public — 주장 ID별 조회.

#### 9.3.3. deleteById
* **type**: void / public — 문서 삭제.


---

# 9. 매물 비교 관련

```mermaid
classDiagram
    %% ===== 엔티티 =====
    class ComparisonGroup {
        -id: Long
        -ownerUserId: Long
        -name: String
        -description: String
        -createdAt: LocalDateTime
        -updatedAt: LocalDateTime
        +rename(newName: String): void
        +changeDescription(desc: String): void
    }

    class ComparisonItem {
        -id: Long
        -groupId: Long
        -propertyId: Long
        -capturedPrice: Long
        -capturedArea: Double
        -capturedLocationScore: Double
        -note: String
        +updateSnapshot(price: Long, area: Double): void
        +applyNote(note: String): void
    }

    %% ===== DTO =====
    class CreateGroupRequest {
        -name: String
        -description: String
        +validate(): boolean
        +toEntity(ownerUserId: Long): ComparisonGroup
    }

    class GroupDetailResponse {
        -group: GroupResponse
        -items: List~ItemResponse~
        -weights: WeightsRequest
        -computedScore: Double
        +of(...): GroupDetailResponse
        +summaryText(): String
    }

    class GroupResponse {
        -id: Long
        -name: String
        -description: String
        -itemCount: int
        -createdAt: LocalDateTime
        +from(entity: ComparisonGroup, itemCount: int): GroupResponse
    }

    class GroupSummaryResponse {
        -groups: List~GroupResponse~
        -totalCount: long
        +of(list: List~GroupResponse~, total: long): GroupSummaryResponse
        +hasMore(offset: int, limit: int): boolean
    }

    class AddItemRequest {
        -groupId: Long
        -propertyId: Long
        -note: String
        +validate(): boolean
        +toEntity(): ComparisonItem
    }

    class CompareResultResponse {
        -groupId: Long
        -itemScores: List~Map~String,Object~~
        -usedWeights: WeightsRequest
        -computedAt: LocalDateTime
        +of(...): CompareResultResponse
        +topN(n: int): List~Long~
    }

    class RenameGroupRequest {
        -groupId: Long
        -newName: String
        +validate(): boolean
    }

    class ItemResponse {
        -itemId: Long
        -propertyId: Long
        -price: Long
        -area: Double
        -locationScore: Double
        -note: String
        +from(entity: ComparisonItem): ItemResponse
    }

    class WeightsRequest {
        -priceWeight: Double
        -areaWeight: Double
        -locationWeight: Double
        -normalize: boolean
        +validate(): boolean
        +normalized(): WeightsRequest
    }

    %% ===== Service, Repository =====
    class ComparisonService {
        -groupRepo: ComparisonGroupJpaRepository
        -itemRepo: ComparisonItemJpaRepository
        -scorer: Object
        +createGroup(req: CreateGroupRequest, ownerUserId: Long): GroupResponse
        +renameGroup(req: RenameGroupRequest, ownerUserId: Long): GroupResponse
        +addItem(req: AddItemRequest, ownerUserId: Long): ItemResponse
        +getGroupDetail(groupId: Long, ownerUserId: Long, weights: WeightsRequest): GroupDetailResponse
        +compare(groupId: Long, weights: WeightsRequest): CompareResultResponse
    }

    class ComparisonGroupJpaRepository {
        +save(group: ComparisonGroup): ComparisonGroup
        +findById(id: Long): Optional~ComparisonGroup~
        +findAllByOwnerUserId(ownerUserId: Long): List~ComparisonGroup~
        +deleteById(id: Long): void
    }

    class ComparisonItemJpaRepository {
        +save(item: ComparisonItem): ComparisonItem
        +findById(id: Long): Optional~ComparisonItem~
        +findAllByGroupId(groupId: Long): List~ComparisonItem~
        +deleteById(id: Long): void
    }

    %% ===== Relationships =====
    ComparisonGroup "1" --> "many" ComparisonItem : contains >
    ComparisonService --> ComparisonGroupJpaRepository : accesses >
    ComparisonService --> ComparisonItemJpaRepository : accesses >
    ComparisonService --> CreateGroupRequest : uses >
    ComparisonService --> AddItemRequest : uses >
    ComparisonService --> CompareResultResponse : returns >
    ComparisonService --> GroupResponse : returns >
    GroupDetailResponse --> ComparisonGroup : maps >
    GroupDetailResponse --> ItemResponse : includes >
    AddItemRequest --> ComparisonItem : converts >
    WeightsRequest --> CompareResultResponse : influences >
```

## ComparisonGroup 클래스

### 1.1 class description
사용자별 매물 비교 그룹 엔티티. 여러 매물을 하나의 그룹으로 묶어 비교/공유/이름 변경/가중치 적용을 지원한다.

### 1.2 attribution 구분
- **id**(Long) / private / PK
- **ownerUserId**(Long) / private / 그룹 소유 사용자
- **name**(String) / private / 그룹명
- **description**(String) / private / 설명
- **createdAt**(LocalDateTime) / private / 생성 시각
- **updatedAt**(LocalDateTime) / private / 수정 시각

### 1.3 Operations 구분
- **rename(newName: String) : void / public**
- **changeDescription(desc: String) : void / public**

---

## ComparisonItem 클래스

### 2.1 class description
비교 그룹에 포함된 개별 매물 항목 엔티티. 비교용 지표(가격/면적/위치 등) 스냅샷 보관.

### 2.2 attribution 구분
- **id**(Long) / private / PK
- **groupId**(Long) / private / ComparisonGroup FK
- **propertyId**(Long) / private / 원본 매물 ID
- **capturedPrice**(Long) / private / 비교 시점 가격
- **capturedArea**(Double) / private / 면적
- **capturedLocationScore**(Double) / private / 위치 점수
- **note**(String) / private / 비고

### 2.3 Operations 구분
- **updateSnapshot(price: Long, area: Double) : void / public**
- **applyNote(note: String) : void / public**

---

## CreateGroupRequest 클래스

### 3.1 class description
비교 그룹 생성 요청 DTO.

### 3.2 attribution 구분
- **name**(String) / private — 그룹명
- **description**(String) / private — 설명(선택)

### 3.3 Operations 구분
- **validate() : boolean / public**
- **toEntity(ownerUserId: Long) : ComparisonGroup / public**

---

## GroupDetailResponse 클래스

### 4.1 class description
그룹 상세 응답 DTO. 그룹 메타 + 항목 목록 + 집계 지표.

### 4.2 attribution 구분
- **group**(GroupResponse) / private
- **items**(List(ItemResponse)) / private
- **weights**(WeightsRequest) / private
- **computedScore**(Double) / private

### 4.3 Operations 구분
- **of(...) : GroupDetailResponse / public**
- **summaryText() : String / public**

---

## GroupResponse 클래스

### 5.1 class description
그룹 단건 응답 DTO(요약).

### 5.2 attribution 구분
- **id**(Long) / private
- **name**(String) / private
- **description**(String) / private
- **itemCount**(int) / private
- **createdAt**(LocalDateTime) / private

### 5.3 Operations 구분
- **from(entity: ComparisonGroup, itemCount: int) : GroupResponse / public**

---

## GroupSummaryResponse 클래스스

### 6.1 class description
여러 그룹의 요약 목록 응답 DTO.

### 6.2 attribution 구분
- **groups**(List(GroupResponse)) / private
- **totalCount**(long) / private

### 6.3 Operations 구분
- **of(list: List(GroupResponse), total: long) : GroupSummaryResponse / public**
- **hasMore(offset: int, limit: int) : boolean / public**

---

## AddItemRequest 클래스

### 7.1 class description
그룹에 항목(매물)을 추가하는 요청 DTO.

### 7.2 attribution 구분
- **groupId**(Long) / private
- **propertyId**(Long) / private
- **note**(String) / private

### 7.3 Operations 구분
- **validate() : boolean / public**
- **toEntity() : ComparisonItem / public**

---

## CompareResultResponse 클래스

### 8.1 class description
가중치/지표에 따라 계산된 비교 결과 응답 DTO. 항목별 점수와 순위를 포함.

### 8.2 attribution 구분
- **groupId**(Long) / private
- **itemScores**(List(Map(String,Object))) / private — {itemId, score, rank}
- **usedWeights**(WeightsRequest) / private
- **computedAt**(LocalDateTime) / private

### 8.3 Operations 구분
- **of(...) : CompareResultResponse / public**
- **topN(n: int) : List(Long) / public**

---

## RenameGroupRequest 클래스스

### 9.1 class description
그룹명 변경 요청 DTO.

### 9.2 attribution 구분
- **groupId**(Long) / private
- **newName**(String) / private

### 9.3 Operations 구분
- **validate() : boolean / public**

---

## ItemResponse 클래스

### 10.1 class description
그룹 항목 요약 응답 DTO.

### 10.2 attribution 구분
- **itemId**(Long) / private
- **propertyId**(Long) / private
- **price**(Long) / private
- **area**(Double) / private
- **locationScore**(Double) / private
- **note**(String) / private

### 10.3 Operations 구분
- **from(entity: ComparisonItem) : ItemResponse / public**

---

## WeightsRequest 클래스스

### 11.1 class description
비교 계산 시 사용할 가중치 입력 DTO. (예: 가격, 면적, 위치/교통 등)

### 11.2 attribution 구분
- **priceWeight**(Double) / private
- **areaWeight**(Double) / private
- **locationWeight**(Double) / private
- **normalize**(boolean) / private — 합=1 정규화 여부

### 11.3 Operations 구분
- **validate() : boolean / public**
- **normalized() : WeightsRequest / public**

---

## ComparisonService 클래스

### 12.1 class description
그룹/항목 CRUD, 비교 계산, 가중치 적용, 요약 응답 조립을 담당하는 도메인 서비스.

### 12.2 attribution 구분
- **groupRepo**(ComparisonGroupJpaRepository) / private
- **itemRepo**(ComparisonItemJpaRepository) / private
- **scorer**(Function or Component) / private

### 12.3 Operations 구분
- **createGroup(req: CreateGroupRequest, ownerUserId: Long) : GroupResponse / public**
- **renameGroup(req: RenameGroupRequest, ownerUserId: Long) : GroupResponse / public**
- **addItem(req: AddItemRequest, ownerUserId: Long) : ItemResponse / public**
- **getGroupDetail(groupId: Long, ownerUserId: Long, weights: WeightsRequest) : GroupDetailResponse / public**
- **compare(groupId: Long, weights: WeightsRequest) : CompareResultResponse / public**

---

## ComparisonGroupJpaRepository 클래스

### 13.1 class description
ComparisonGroup용 JPA/스프링 데이터 리포지토리 인터페이스.

### 13.2 attribution 구분
- (상태 없음, 인터페이스)

### 13.3 Operations 구분
- **save(group: ComparisonGroup) : ComparisonGroup / public**
- **findById(id: Long) : Optional<ComparisonGroup> / public**
- **findAllByOwnerUserId(ownerUserId: Long) : List<ComparisonGroup> / public**
- **deleteById(id: Long) : void / public**

---

## ComparisonItemJpaRepository 클래스

### 14.1 class description
ComparisonItem용 JPA/스프링 데이터 리포지토리 인터페이스.

### 14.2 attribution 구분
- (상태 없음, 인터페이스)

### 14.3 Operations 구분
- **save(item: ComparisonItem) : ComparisonItem / public**
- **findById(id: Long) : Optional<ComparisonItem> / public**
- **findAllByGroupId(groupId: Long) : List<ComparisonItem> / public**
- **deleteById(id: Long) : void / public**

---

# 10. 공통/유틸리티

## BaseEntity 클래스

```mermaid
classDiagram
  class BaseEntity {
    -createdAt: LocalDateTime
    -updatedAt: LocalDateTime
    +getCreatedAt(): LocalDateTime
    +getUpdatedAt(): LocalDateTime
  }
```
### 1.1 class description
모든 엔티티 클래스가 상속받는 공통 클래스. 생성/수정 시각 자동 관리.

### 1.2 attribution 구분
- **createdAt** : LocalDateTime / private — 생성 시각.
- **updatedAt** : LocalDateTime / private — 수정 시각.

### 1.3 Operations 구분
- **getCreatedAt() : LocalDateTime / public**
- **getUpdatedAt() : LocalDateTime / public**

---

## ResponseDTO 클래스

```mermaid
classDiagram
  class HttpStatus
  class ResponseDTO {
    -success: boolean
    -code: int
    -message: String
    -data: Object
    -timestamp: LocalDateTime
    +success(data: Object): ResponseDTO
    +success(data: Object, message: String): ResponseDTO
    +error(code: int, message: String): ResponseDTO
    +error(httpStatus: HttpStatus, message: String): ResponseDTO
    +getSuccess(): boolean
    +getCode(): int
    +getMessage(): String
    +getData(): Object
    +getTimestamp(): LocalDateTime
  }
  ResponseDTO ..> HttpStatus : Uses
```
### 2.1 class description
모든 API 응답을 일관된 형식으로 만들기 위한 공통 DTO.

### 2.2 attribution 구분
- **success**(boolean) / private — 성공 여부
- **code**(int) / private — HTTP 코드
- **message**(String) / private — 메시지
- **data**(Object) / private — 응답 데이터
- **timestamp**(LocalDateTime) / private — 생성 시각

### 2.3 Operations 구분
- **success(data)** / **success(data,message)**
- **error(code,message)** / **error(httpStatus,message)**
- **getters**: `getSuccess, getCode, getMessage, getData, getTimestamp`

---

## GlobalExceptionHandler 클래스

```mermaid
classDiagram
  class ResponseEntity
  class HttpStatus
  class IllegalArgumentException
  class MethodArgumentNotValidException
  class Exception

  class GlobalExceptionHandler {
    +handleIllegalArgumentException(e: IllegalArgumentException): ResponseEntity
    +handleValidationExceptions(ex: MethodArgumentNotValidException): ResponseEntity
    +handleGenericException(e: Exception): ResponseEntity
  }
```
### 3.1 class description
전역 예외 처리 핸들러. 컨트롤러 예외를 잡아 표준 오류 응답 반환.

### 3.2 attribution 구분
- (필드 없음)

### 3.3 Operations 구분
- **handleIllegalArgumentException(...) : ResponseEntity<String>**
- **handleValidationExceptions(...) : ResponseEntity<Map<String,String>>**
- **handleGenericException(...) : ResponseEntity<String>**

---

## ValidationUtil 클래스

```mermaid
classDiagram
  class ValidationUtil {
    +isValidEmail(email: String): boolean
    +isValidPhoneNumber(phoneNumber: String): boolean
    +isValidPassword(password: String): boolean
    +isValidUrl(url: String): boolean
    +isNotBlank(value: String): boolean
    +isValidLength(value: String, min: int, max: int): boolean
    +isValidInteger(value: String, min: int, max: int): boolean
    +sanitizeInput(input: String): String
    +validateNotNegative(value: int): boolean
    +validateNotNegative(value: long): boolean
  }
```
### 4.1 class description
입력값 유효성 검증 유틸리티(정규식/길이/숫자/URL/정제).

### 4.2 attribution 구분
- (필드 없음, static 메소드 집합)

### 4.3 Operations 구분
- **isValidEmail / isValidPhoneNumber / isValidPassword / isValidUrl / isNotBlank / isValidLength / isValidInteger / sanitizeInput / validateNotNegative(int,long)**

---

## SecurityConfig 클래스

```mermaid
classDiagram
  class JwtAuthenticationFilter
  class HttpSecurity
  class SecurityFilterChain
  class CorsConfigurationSource
  class PasswordEncoder
  class WebSecurityCustomizer

  class SecurityConfig {
    -jwtFilter: JwtAuthenticationFilter
    +filterChain(http: HttpSecurity): SecurityFilterChain
    +corsConfigurationSource(): CorsConfigurationSource
    +passwordEncoder(): PasswordEncoder
    +webSecurityCustomizer(): WebSecurityCustomizer
  }
```
### 5.1 class description
Spring Security 설정(JWT, CORS, PasswordEncoder, 정적 리소스 무시).

### 5.2 attribution 구분
- **jwtFilter**(JwtAuthenticationFilter) / private

### 5.3 Operations 구분
- **filterChain(...) : SecurityFilterChain**
- **corsConfigurationSource() : CorsConfigurationSource**
- **passwordEncoder() : PasswordEncoder**
- **webSecurityCustomizer() : WebSecurityCustomizer**

---

## JwtTokenProvider 클래스

```mermaid
classDiagram
  class User
  class Authentication
  class Jws

  class JwtTokenProvider {
    -secret: String
    -accessExp: long
    +createAccessToken(user: User): String
    +parse(token: String): Jws
    +validate(token: String): boolean
    +getAuthentication(token: String): Authentication
    +getUserId(token: String): Long
  }
```
### 6.1 class description
JWT 토큰 생성·검증·파싱·인증 추출 유틸리티.

### 6.2 attribution 구분
- **secret**(String) / private — 서명 키
- **accessExp**(long) / private — 만료(초)

### 6.3 Operations 구분
- **createAccessToken(User) : String**
- **parse(String) : Jws<Claims>**
- **validate(String) : boolean**
- **getAuthentication(String) : Authentication**
- **getUserId(String) : Long**
