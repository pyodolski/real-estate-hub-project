## #14 회원가입

```mermaid
sequenceDiagram
    actor User as 사용자
    participant UI as Frontend
    participant Controller as AuthController
    participant Service as AuthService
    participant PasswordEncoder as PasswordEncoder
    participant UserRepo as UserRepository
    participant BrokerRepo as BrokerProfileRepository
    participant TagRepo as TagRepository
    participant DB as Database

    User->>UI: 회원가입 페이지 접속
    
    UI->>UI: 회원가입 폼 렌더링
    
    User->>UI: 사용자 유형 선택<br/>(REGULAR/BROKER/ADMIN)
    
    alt 사용자 유형이 BROKER
        UI->>UI: 중개사 정보 필드 표시<br/>(licenseNumber, agencyName)
        User->>UI: 중개사 등록번호 입력<br/>(필수)
        User->>UI: 중개사 상호명 입력<br/>(선택)
    end
    
    User->>UI: 필수 정보 입력<br/>(이메일, 사용자명,<br/>비밀번호 8~64자)
    
    User->>UI: 태그 입력<br/>(최대 30개 선택/입력,<br/>중복 불가, 선택사항)
    
    User->>UI: "회원가입" 버튼 클릭
    
    UI->>UI: 클라이언트 입력값 검증<br/>(이메일 형식, 비밀번호 길이 등)
    
    alt 클라이언트 검증 실패
        UI->>User: 오류 메시지 표시
    else 클라이언트 검증 성공
        UI->>Controller: POST /api/auth/signup<br/>{userType, email, username,<br/>password, licenseNumber,<br/>agencyName, tags}
        
        Controller->>Controller: 요청 검증
        
        Controller->>Service: register(signupRequest)
        
        Service->>Service: 이메일 형식 검증
        
        Service->>UserRepo: existsByEmail(email)
        UserRepo->>DB: SELECT COUNT(*) FROM users<br/>WHERE email = ?
        DB-->>UserRepo: 결과
        UserRepo-->>Service: 이메일 중복 여부
        
        alt 이메일 이미 존재
            Service-->>Controller: 오류 응답<br/>("이미 등록된 이메일")
            Controller-->>UI: 400 Bad Request
        else 이메일 미존재
            Service->>Service: 비밀번호 검증<br/>(8~64자)
            
            Service->>PasswordEncoder: encode(password)
            PasswordEncoder-->>Service: 해시된 비밀번호
            
            Service->>Service: User 엔티티 생성<br/>(email, username, hashedPassword,<br/>role, isActive=true)
            
            Service->>UserRepo: save(user)
            UserRepo->>DB: INSERT INTO users
            DB-->>UserRepo: userId
            UserRepo-->>Service: User with userId
            
            alt 사용자 유형이 BROKER
                Service->>Service: BrokerProfile 엔티티 생성<br/>(userId, licenseNumber,<br/>agencyName, isVerified=false)
                
                Service->>BrokerRepo: save(brokerProfile)
                BrokerRepo->>DB: INSERT INTO broker_profiles
                DB-->>BrokerRepo: 저장 완료
                BrokerRepo-->>Service: BrokerProfile
            end
            
            alt 태그가 입력됨
                loop 각 태그마다
                    Service->>TagRepo: findOrCreateByName(tagName)
                    
                    alt 태그 존재
                        TagRepo->>DB: SELECT id FROM tags<br/>WHERE name = ?
                        DB-->>TagRepo: tagId
                    else 태그 미존재
                        TagRepo->>DB: INSERT INTO tags<br/>(name, created_at)
                        DB-->>TagRepo: 새 tagId
                    end
                    
                    Service->>Service: UserTag 관계 생성<br/>(userId, tagId)
                    Service->>TagRepo: save(userTag)
                    TagRepo->>DB: INSERT INTO user_tags
                    DB-->>TagRepo: 저장 완료
                end
            end
            
            Service-->>Controller: 회원가입 완료 응답<br/>{userId, email, username, role}
            
            Controller-->>UI: 201 Created<br/>회원가입 성공
            
            UI->>UI: 성공 메시지 표시
            UI->>UI: 로그인 페이지로 자동 이동
            UI-->>User: "회원가입 완료. 로그인해주세요" 메시지
        end
    end

```

**설명**  
이 시퀀스 다이어그램은 사용자가 회원가입 페이지에 접속하여 계정을 생성하는 전체 과정을 보여준다. 사용자가 회원가입 페이지에 접속하면 클라이언트(Frontend)는 회원가입 폼을 렌더링한다. 사용자는 사용자 유형으로 REGULAR, BROKER, ADMIN 중에 선택한다. BROKER를 선택한 경우 클라이언트는 중개사 정보 필드(licenseNumber, agencyName)를 표시하고, 사용자는 등록번호를 필수로, 상호명을 선택적으로 입력한다. 이후 사용자는 필수 정보(이메일, 사용자명, 비밀번호 8~64자)와 선택 정보(태그, 최대 30개, 중복 불가)를 입력한다. 회원가입 버튼을 클릭하면 클라이언트는 먼저 입력값의 유효성을 검증한다(이메일 형식, 비밀번호 길이 등). 검증이 실패하면 오류 메시지를 표시하고, 통과되면 POST /api/auth/signup 요청을 AuthController로 전송한다. 컨트롤러는 요청 검증을 수행한 후 AuthService의 register 메서드를 호출한다. 서비스는 이메일 형식을 검증한 뒤 UserRepository를 통해 existsByEmail을 호출하여 데이터베이스에서 이메일 중복 여부를 확인한다. 이미 등록된 이메일이면 400 Bad Request를 반환하고, 사용 가능한 경우 비밀번호 검증(8~64자)을 수행한다. 검증 통과 후 PasswordEncoder를 사용하여 비밀번호를 BCrypt로 해시화하고, User 엔티티를 생성하여 UserRepository.save로 데이터베이스에 저장한다. 사용자 유형이 BROKER인 경우 BrokerProfile 엔티티를 생성하여 BrokerProfileRepository.save로 저장한다. 태그가 입력된 경우 각 태그마다 TagRepository.findOrCreateByName을 호출하여 태그를 조회하거나 새로 생성하고, UserTag 관계를 생성하여 저장한다. 모든 과정이 완료되면 서비스는 생성된 사용자 정보를 컨트롤러에 반환하고, 컨트롤러는 201 Created 응답과 함께 결과를 클라이언트에 전달한다. 클라이언트는 성공 메시지를 표시하고 로그인 페이지로 자동 이동한다.

---

## #15 로그인 / 토큰 관리

```mermaid
sequenceDiagram
    actor User as 사용자
    participant UI as 클라이언트
    participant Controller as AuthController
    participant Service as AuthService
    participant Repository as UserRepository
    participant TokenService as TokenService
    participant DB as Database

    User->>UI: 로그인 페이지 접근
    UI->>UI: 로그인 폼 표시 (이메일, 비밀번호)
    
    User->>UI: 이메일, 비밀번호 입력 후 로그인 버튼 클릭
    UI->>Controller: POST /api/auth/login (email, password)
    
    Controller->>Service: login(email, password)
    
    Service->>Repository: findByEmail(email)
    Repository->>DB: SELECT * FROM users WHERE email = ?
    DB-->>Repository: 사용자 정보
    Repository-->>Service: User Entity
    
    alt 사용자 없음
        Service-->>Controller: UserNotFoundException
        Controller-->>UI: 401 Unauthorized
        UI-->>User: "이메일 또는 비밀번호가 잘못되었습니다" 오류
    else 사용자 있음
        Service->>Service: 비밀번호 검증 (해시 비교)
        alt 비밀번호 일치하지 않음
            Service-->>Controller: InvalidPasswordException
            Controller-->>UI: 401 Unauthorized
            UI-->>User: "이메일 또는 비밀번호가 잘못되었습니다" 오류
        else 비밀번호 일치
            Service->>TokenService: generateTokens(userId, role)
            
            TokenService->>TokenService: AccessToken 생성 (JWT, 15분)
            TokenService->>TokenService: RefreshToken 생성 (14일 또는 30일)
            TokenService-->>Service: AccessToken, RefreshToken
            
            Service->>Repository: saveRefreshToken(userId, refreshToken)
            Repository->>DB: INSERT INTO refresh_tokens (user_id, token, expires_at)
            DB-->>Repository: 저장 완료
            
            Service-->>Controller: 200 OK + AccessToken, RefreshToken
            
            Controller-->>UI: 200 OK + 토큰
            UI->>UI: 토큰 저장 (쿠키 또는 LocalStorage)
            UI->>UI: 역할(role)에 따라 메인 페이지 이동
            alt regular/owner
                UI-->>User: 메인 페이지 표시
            else broker
                UI-->>User: 브로커 대시보드 표시
            else admin
                UI-->>User: 관리자 페이지 표시
            end
        end
    end

    par 사용 중 토큰 갱신
        User->>UI: API 요청
        UI->>Controller: API 요청 + AccessToken
        
        Controller->>Controller: 토큰 검증
        alt AccessToken 유효
            Controller->>Service: 요청 처리
            Service-->>Controller: 결과
            Controller-->>UI: 200 OK
        else AccessToken 만료
            Controller->>Controller: 401 Unauthorized
            UI->>Controller: POST /api/auth/refresh (RefreshToken)
            
            Controller->>TokenService: refreshAccessToken(refreshToken)
            
            TokenService->>Repository: findRefreshToken(refreshToken)
            Repository->>DB: SELECT * FROM refresh_tokens WHERE token = ?
            DB-->>Repository: 토큰 정보
            Repository-->>TokenService: RefreshToken Entity
            
            alt RefreshToken 만료/폐기됨
                TokenService-->>Controller: InvalidTokenException
                Controller-->>UI: 401 Unauthorized
                UI->>UI: 로그인 화면으로 리다이렉트
                UI-->>User: "세션이 만료되었습니다. 다시 로그인하세요" 메시지
            else RefreshToken 유효
                TokenService->>TokenService: 새로운 AccessToken 생성
                TokenService-->>Controller: 새로운 AccessToken
                
                Controller-->>UI: 200 OK + 새로운 AccessToken
                UI->>UI: 새 토큰 저장
                UI->>Controller: 원래 요청 재시도 (새 AccessToken)
                Controller->>Service: 요청 처리
                Service-->>Controller: 결과
                Controller-->>UI: 200 OK
                UI-->>User: 요청 완료
            end
        end
    end

    User->>UI: 로그아웃 버튼 클릭
    UI->>Controller: POST /api/auth/logout
    
    Controller->>Service: logout(userId)
    
    Service->>Repository: revokeRefreshToken(userId)
    Repository->>DB: UPDATE refresh_tokens SET revoked = true WHERE user_id = ?
    DB-->>Repository: 업데이트 완료
    
    Service-->>Controller: 200 OK
    
    Controller-->>UI: 200 OK
    UI->>UI: 토큰 삭제 (쿠키/LocalStorage)
    UI->>UI: 로그인 페이지로 리다이렉트
    UI-->>User: 로그인 페이지 표시

    alt 오류 (토큰 검증 실패 등)
        Service-->>Controller: Exception
        Controller-->>UI: 500 Internal Server Error
        UI-->>User: "오류 발생, 재시도 버튼"
    end

```

**설명**  
이 시퀀스 다이어그램은 사용자의 로그인, 토큰 발급 및 갱신, 로그아웃의 전체 과정을 보여준다. 사용자가 로그인 페이지에 접근하면 클라이언트는 로그인 폼(이메일, 비밀번호)을 표시한다. 사용자가 이메일과 비밀번호를 입력한 후 로그인 버튼을 클릭하면 클라이언트는 POST /api/auth/login 요청을 AuthController로 전송한다. 컨트롤러는 AuthService의 login 메서드를 호출하고, 서비스는 UserRepository를 통해 findByEmail로 데이터베이스에서 사용자를 조회한다. 사용자가 존재하지 않거나 비밀번호가 일치하지 않으면 401 Unauthorized 응답과 함께 "이메일 또는 비밀번호가 잘못되었습니다" 오류 메시지를 반환한다. 인증이 성공하면 서비스는 TokenService의 generateTokens를 호출하여 AccessToken(JWT, 15분 유효)과 RefreshToken(14일 또는 30일 유효)을 생성한다. 생성된 RefreshToken은 UserRepository.saveRefreshToken을 통해 데이터베이스에 저장된다. 토큰은 클라이언트에 반환되며, 클라이언트는 이를 쿠키나 LocalStorage에 저장한 후 사용자의 역할(role)에 따라 메인 페이지, 브로커 대시보드, 관리자 페이지 중 하나로 이동한다. 사용 중 AccessToken이 만료되면 클라이언트는 자동으로 POST /api/auth/refresh 요청을 보내고, 컨트롤러는 TokenService.refreshAccessToken을 호출한다. TokenService는 UserRepository를 통해 데이터베이스에서 RefreshToken을 조회하고, 만료되거나 폐기된 경우 InvalidTokenException을 던져 로그인 화면으로 리다이렉트한다. RefreshToken이 유효한 경우 새로운 AccessToken을 생성하여 반환하고, 클라이언트는 새 토큰을 저장한 후 원래 요청을 재시도한다. 사용자가 로그아웃 버튼을 클릭하면 POST /api/auth/logout 요청이 전송되고, 서비스는 UserRepository.revokeRefreshToken을 호출하여 데이터베이스에서 RefreshToken을 revoked=true로 업데이트한다. 클라이언트는 로컬에 저장된 토큰을 삭제하고 로그인 페이지로 리다이렉트한다.

---

## #16 로그아웃

```mermaid
sequenceDiagram
    actor User as 사용자
    participant UI as 클라이언트
    participant Controller as AuthController
    participant Service as AuthService
    participant Repository as TokenRepository
    participant DB as Database

    User->>UI: 사이드바의 로그아웃 버튼 클릭
    UI->>Controller: POST /api/auth/logout (AccessToken 포함)
    
    Controller->>Controller: 로그인 토큰 검증
    alt 토큰 없음
        Controller-->>UI: 401 Unauthorized
        UI-->>User: 로그인 화면으로 이동
    else 토큰 유효
        Controller->>Service: logout(userId)
        
        Service->>Repository: findRefreshToken(userId)
        Repository->>DB: SELECT * FROM refresh_tokens WHERE user_id = ?
        DB-->>Repository: RefreshToken 정보
        Repository-->>Service: RefreshToken Entity
        
        alt RefreshToken 이미 만료/폐기됨
            Service->>Service: 이미 처리된 것으로 간주
            Service-->>Controller: 200 OK
        else RefreshToken 유효
            Service->>Repository: revokeRefreshToken(userId)
            Repository->>DB: UPDATE refresh_tokens SET revoked = true WHERE user_id = ?
            DB-->>Repository: 업데이트 완료
            
            Service-->>Controller: 200 OK
        end
        
        Controller-->>UI: 200 OK
        UI->>UI: 로컬스토리지/세션스토리지의 토큰 삭제
        UI->>UI: 쿠키의 토큰 삭제
        UI->>UI: 로그인 페이지로 리다이렉트
        UI-->>User: 로그인 페이지 표시
    end

    alt 로그아웃 후 API 요청 시도
        User->>UI: API 요청 시도
        UI->>Controller: API 요청 (만료된 AccessToken)
        
        Controller->>Controller: 토큰 검증
        alt AccessToken 유효하지 않음
            Controller-->>UI: 401 Unauthorized
            UI-->>User: "인증이 필요합니다. 로그인하세요" 오류
            UI->>UI: 로그인 페이지로 리다이렉트
        end
    end

    alt DB 또는 네트워크 오류
        DB-->>Service: Exception
        Service-->>Controller: 500 Internal Server Error
        Controller-->>UI: 500
        UI-->>User: "오류 발생, 재시도 버튼"
    end

```

**설명**  
이 시퀀스 다이어그램은 사용자가 사이드바의 로그아웃 버튼을 통해 세션을 종료하고 토큰을 무효화하는 과정을 보여준다. 사용자가 사이드바의 로그아웃 버튼을 클릭하면 클라이언트는 AccessToken을 포함하여 POST /api/auth/logout 요청을 AuthController로 전송한다. 컨트롤러는 먼저 JWT 토큰을 검증하여 사용자 인증 상태를 확인하고, 토큰이 없거나 유효하지 않으면 401 Unauthorized를 반환하여 로그인 화면으로 이동시킨다. 토큰이 유효한 경우 컨트롤러는 AuthService의 logout 메서드를 호출한다. 서비스는 TokenRepository를 통해 findRefreshToken으로 해당 사용자의 RefreshToken을 데이터베이스에서 조회한다. 이미 만료되거나 폐기된 토큰이면 이미 처리된 것으로 간주하여 200 OK를 반환한다. RefreshToken이 아직 유효한 경우 서비스는 TokenRepository.revokeRefreshToken을 호출하여 데이터베이스에서 해당 토큰을 revoked=true로 업데이트하여 무효화한다. 업데이트가 완료되면 서비스는 컨트롤러에 200 OK를 반환하고, 컨트롤러는 클라이언트에 성공 응답을 전달한다. 클라이언트는 응답을 받으면 로컬스토리지, 세션스토리지, 쿠키에 저장된 모든 토큰을 삭제한 후 로그인 페이지로 리다이렉트한다. 로그아웃 후 사용자가 만료된 AccessToken으로 API 요청을 시도하면 컨트롤러의 토큰 검증 단계에서 401 Unauthorized가 반환되고, 클라이언트는 "인증이 필요합니다. 로그인하세요" 오류 메시지를 표시한 뒤 로그인 페이지로 이동한다. 데이터베이스나 네트워크 오류가 발생할 경우 서비스는 예외를 컨트롤러에 전달하고, 컨트롤러는 500 Internal Server Error를 반환하여 클라이언트는 "오류 발생, 재시도 버튼" 메시지를 사용자에게 보여준다.

---

## #17 비밀번호 재설정

```mermaid
sequenceDiagram
    actor User as 사용자
    participant UI as 클라이언트
    participant Controller as PasswordResetController
    participant Service as PasswordResetService
    participant TokenService as TokenService
    participant EmailService as EmailService
    participant Repository as UserRepository
    participant DB as Database

    User->>UI: 로그인 페이지에서 "비밀번호 찾기" 클릭
    UI->>UI: 비밀번호 재설정 페이지로 이동
    UI-->>User: 이메일 입력 폼 표시

    User->>UI: 이메일 입력 후 "재설정 링크 발송" 버튼 클릭
    UI->>Controller: POST /api/auth/password-reset/request (email)
    
    Controller->>Service: requestPasswordReset(email)
    
    Service->>Repository: findByEmail(email)
    Repository->>DB: SELECT * FROM users WHERE email = ?
    DB-->>Repository: 사용자 정보
    Repository-->>Service: User Entity
    
    alt 사용자 없음
        Service-->>Controller: 200 OK (보안상 동일 응답)
        Controller-->>UI: 200 OK
        UI-->>User: "이메일이 발송되었습니다" 메시지
        Note over Service: 실제로는 이메일 발송 안 함<br/>(보안: 이메일 존재 여부 노출 방지)
    else 사용자 있음
        Service->>TokenService: generatePasswordResetToken(userId)
        
        TokenService->>TokenService: PasswordResetToken 생성 (UUID, 1시간 유효)
        TokenService->>DB: INSERT INTO password_reset_tokens (user_id, token, expires_at)
        DB-->>TokenService: 저장 완료
        TokenService-->>Service: PasswordResetToken
        
        Service->>EmailService: sendPasswordResetEmail(email, token)
        EmailService->>EmailService: 이메일 템플릿 생성 (링크 포함)
        EmailService->>EmailService: 이메일 발송 (SMTP)
        EmailService-->>Service: 발송 완료
        
        Service-->>Controller: 200 OK
        Controller-->>UI: 200 OK
        UI-->>User: "비밀번호 재설정 링크가 이메일로 발송되었습니다" 메시지
    end

    User->>User: 이메일 확인
    User->>UI: 이메일 링크 클릭 (token 포함)
    UI->>Controller: GET /api/auth/password-reset?token={token}
    
    Controller->>Service: validateResetToken(token)
    
    Service->>DB: SELECT * FROM password_reset_tokens WHERE token = ? AND expires_at > NOW() AND used = false
    DB-->>Service: 토큰 정보
    
    alt 토큰 유효하지 않음 (만료/사용됨/없음)
        Service-->>Controller: InvalidTokenException
        Controller-->>UI: 400 Bad Request
        UI-->>User: "유효하지 않거나 만료된 링크입니다" 오류
    else 토큰 유효
        Service-->>Controller: 200 OK + 비밀번호 재설정 페이지
        Controller-->>UI: 200 OK
        UI->>UI: 비밀번호 재설정 폼 렌더링
        UI-->>User: 새 비밀번호 입력 폼 표시
    end

    User->>UI: 새 비밀번호 입력 (2회) 후 "재설정" 버튼 클릭
    UI->>Controller: POST /api/auth/password-reset/confirm (token, newPassword)
    
    Controller->>Service: resetPassword(token, newPassword)
    
    Service->>Service: 토큰 유효성 재검증
    Service->>DB: SELECT * FROM password_reset_tokens WHERE token = ? AND expires_at > NOW() AND used = false
    DB-->>Service: 토큰 정보
    
    alt 토큰 유효하지 않음
        Service-->>Controller: InvalidTokenException
        Controller-->>UI: 400 Bad Request
        UI-->>User: "유효하지 않거나 만료된 토큰입니다" 오류
    else 토큰 유효
        Service->>Service: 비밀번호 유효성 검증 (8~64자)
        
        alt 비밀번호 형식 오류
            Service-->>Controller: ValidationException
            Controller-->>UI: 400 Bad Request
            UI-->>User: "비밀번호는 8~64자여야 합니다" 오류
        else 비밀번호 형식 OK
            Service->>Repository: findById(userId)
            Repository->>DB: SELECT * FROM users WHERE id = ?
            DB-->>Repository: 사용자 정보
            Repository-->>Service: User Entity
            
            Service->>Service: 기존 비밀번호와 동일한지 확인
            alt 기존과 동일
                Service-->>Controller: ValidationException
                Controller-->>UI: 400 Bad Request
                UI-->>User: "기존 비밀번호와 다른 비밀번호를 입력하세요" 오류
            else 기존과 다름
                Service->>Service: 새 비밀번호 해시화 (bcrypt)
                Service->>Repository: updatePassword(userId, hashedPassword)
                Repository->>DB: UPDATE users SET password = ? WHERE id = ?
                DB-->>Repository: 업데이트 완료
                
                Service->>DB: UPDATE password_reset_tokens SET used = true WHERE token = ?
                DB-->>Service: 토큰 사용 처리 완료
                
                Service-->>Controller: 200 OK
                Controller-->>UI: 200 OK
                UI->>UI: 로그인 페이지로 리다이렉트
                UI-->>User: "비밀번호가 재설정되었습니다. 로그인하세요" 메시지
            end
        end
    end

    alt 이메일 발송 실패
        EmailService-->>Service: EmailSendException
        Service-->>Controller: 500 Internal Server Error
        UI-->>User: "이메일 발송에 실패했습니다. 재시도하세요" 오류
    end

    alt DB 또는 네트워크 오류
        DB-->>Service: Exception
        Service-->>Controller: 500 Internal Server Error
        Controller-->>UI: 500
        UI-->>User: "오류 발생, 재시도 버튼"
    end

```

**설명**  
이 시퀀스 다이어그램은 사용자가 비밀번호를 잊었을 때 이메일을 통해 재설정하는 전체 프로세스를 보여준다. 사용자가 로그인 페이지에서 "비밀번호 찾기"를 클릭하면 클라이언트는 비밀번호 재설정 페이지로 이동하여 이메일 입력 폼을 표시한다. 사용자가 이메일을 입력하고 "재설정 링크 발송" 버튼을 클릭하면 POST /api/auth/password-reset/request 요청이 PasswordResetController로 전송된다. 컨트롤러는 요청을 PasswordResetService에 위임하고, 서비스는 UserRepository를 통해 입력된 이메일로 사용자를 조회한다. 사용자가 존재하지 않을 경우 보안을 위해 실제로는 이메일을 발송하지 않지만, 이메일 존재 여부를 노출하지 않기 위해 동일하게 200 OK를 반환하고 "이메일이 발송되었습니다" 메시지를 표시한다. 사용자가 존재하는 경우 서비스는 TokenService.generatePasswordResetToken을 호출하여 UUID 형태의 비밀번호 재설정 토큰을 생성한다(1시간 유효). 이 토큰은 데이터베이스의 password_reset_tokens 테이블에 저장된다. 이후 EmailService.sendPasswordResetEmail을 호출하여 비밀번호 재설정 링크를 포함한 이메일 템플릿을 생성하고 SMTP를 통해 사용자에게 발송한다. 사용자가 이메일에서 링크를 클릭하면 토큰이 포함된 GET /api/auth/password-reset 요청이 서버로 전송되고, 서비스는 데이터베이스에서 해당 토큰의 유효성을 검증한다(만료 시간 확인, 사용 여부 확인). 토큰이 유효하지 않으면 400 Bad Request와 함께 "유효하지 않거나 만료된 링크입니다" 오류를 반환하고, 유효한 경우 비밀번호 재설정 폼을 렌더링하여 새 비밀번호 입력 페이지를 표시한다. 사용자가 새 비밀번호를 두 번 입력하고 "재설정" 버튼을 클릭하면 POST /api/auth/password-reset/confirm 요청이 전송되고, 서비스는 토큰 유효성을 재검증한 후 비밀번호 형식을 검증한다(8~64자). 비밀번호가 기존과 동일하거나 형식이 맞지 않으면 각각 적절한 오류 메시지와 함께 400 Bad Request를 반환한다. 모든 검증이 통과하면 새 비밀번호를 BCrypt로 해시화하여 데이터베이스에 업데이트하고, 재설정 토큰은 used=true로 표시하여 재사용을 방지한다. 성공 시 클라이언트는 로그인 페이지로 리다이렉트하며 "비밀번호가 재설정되었습니다. 로그인하세요" 메시지를 표시한다. 이메일 발송 실패나 데이터베이스 오류가 발생할 경우 적절한 오류 메시지와 함께 500 Internal Server Error를 반환하여 사용자에게 상황을 알린다.

---

## #18 사용자 프로필 관리

```mermaid
sequenceDiagram
    actor User as 사용자
    participant UI as Frontend
    participant Controller as UserController
    participant Service as UserService
    participant UserRepo as UserRepository
    participant BrokerRepo as BrokerProfileRepository
    participant TagRepo as TagRepository
    participant PasswordEncoder as PasswordEncoder
    participant DB as Database

    User->>UI: 프로필 버튼 클릭
    
    UI->>Controller: GET /api/user/profile
    
    Controller->>Controller: JWT 토큰 검증
    Controller->>Controller: 현재 userId 추출
    
    Controller->>Service: getProfileDetail(userId)
    
    Service->>UserRepo: findById(userId)
    UserRepo->>DB: SELECT users WHERE id = ?
    DB-->>UserRepo: User
    UserRepo-->>Service: User
    
    alt 사용자의 role이 BROKER
        Service->>BrokerRepo: findById(userId)
        BrokerRepo->>DB: SELECT broker_profiles WHERE user_id = ?
        DB-->>BrokerRepo: BrokerProfile
        BrokerRepo-->>Service: BrokerProfile
    end
    
    Service->>TagRepo: findUserTags(userId)
    TagRepo->>DB: SELECT tags FROM user_tags WHERE user_id = ?
    DB-->>TagRepo: 태그 목록
    TagRepo-->>Service: List<Tag>
    
    Service->>Service: 프로필 정보 조합<br/>(이메일, 닉네임, 역할, 전화번호,<br/>소개글, 사진, 태그 목록)
    
    Service-->>Controller: 프로필 정보 응답
    
    Controller-->>UI: 200 OK<br/>{프로필 정보}
    
    UI->>UI: 프로필 패널에 정보 표시
    
    alt 프로필 수정을 원하지 않음
        UI-->>User: 프로필 조회 완료
    else 프로필 수정 버튼 클릭
        User->>UI: "프로필 수정" 버튼 클릭
        
        UI->>UI: 프로필 수정 폼 활성화<br/>(현재 정보 미리 채우기)
        
        User->>UI: 기본 정보 수정<br/>(전화번호, 소개글 등)
        
        alt 사진 변경
            User->>UI: 새로운 사진 업로드
            UI->>UI: 이미지 미리보기 표시
        end
        
        alt 태그 변경
            User->>UI: 태그 삭제 및 추가
            UI->>UI: 태그 최대 30개 확인
            UI->>UI: 중복 태그 검사
        end
        
        alt 비밀번호 변경 필요
            User->>UI: "비밀번호 변경" 섹션<br/>현재 비밀번호 입력
            User->>UI: 새 비밀번호 입력 (8~64자)
            User->>UI: 새 비밀번호 재입력
            
            UI->>UI: 유효성 검증<br/>(길이, 동일성)
        end
        
        User->>UI: "수정 완료" 버튼 클릭
        
        UI->>UI: 클라이언트 검증
        
        alt 비밀번호 변경 포함
            UI->>Controller: PUT /api/user/profile<br/>{기본정보, 태그, 새비밀번호}
        else 비밀번호 변경 미포함
            UI->>Controller: PUT /api/user/profile<br/>{기본정보, 태그}
        end
        
        Controller->>Controller: JWT 토큰 검증
        Controller->>Controller: 현재 userId 추출
        
        Controller->>Service: updateProfile(userId, updateRequest)
        
        Service->>UserRepo: findById(userId)
        UserRepo->>DB: SELECT users WHERE id = ?
        DB-->>UserRepo: User
        UserRepo-->>Service: User
        
        alt 비밀번호 변경 요청됨
            Service->>Service: 현재 비밀번호 입력 검증 필요<br/>확인
            
            Service->>PasswordEncoder: encode(currentPassword)
            PasswordEncoder-->>Service: 비교를 위한 해시
            
            Service->>Service: 입력된 현재 비밀번호와<br/>저장된 비밀번호 비교
            
            alt 현재 비밀번호 일치하지 않음
                Service-->>Controller: 오류 응답<br/>("현재 비밀번호가 일치하지 않습니다")
                Controller-->>UI: 400 Bad Request
            else 현재 비밀번호 일치
                Service->>Service: 새 비밀번호와 기존 비밀번호<br/>동일성 확인
                
                alt 새 비밀번호 = 기존 비밀번호
                    Service-->>Controller: 오류 응답<br/>("새 비밀번호는 기존과 달라야 합니다")
                    Controller-->>UI: 400 Bad Request
                else 새 비밀번호 ≠ 기존 비밀번호
                    Service->>PasswordEncoder: encode(newPassword)
                    PasswordEncoder-->>Service: 새 해시 비밀번호
                end
            end
        end
        
        Service->>Service: 기본 정보 업데이트<br/>(전화번호, 소개글, 이미지 URL)
        
        alt 태그 수정됨
            Service->>TagRepo: 기존 UserTag 삭제
            loop 각 기존 태그마다
                Service->>DB: DELETE FROM user_tags
                DB-->>TagRepo: 삭제 완료
            end
            
            loop 각 새 태그마다
                Service->>TagRepo: findOrCreateByName(tagName)
                
                alt 태그 존재
                    TagRepo->>DB: SELECT id FROM tags WHERE name = ?
                    DB-->>TagRepo: tagId
                else 태그 미존재
                    TagRepo->>DB: INSERT INTO tags(name)
                    DB-->>TagRepo: 새 tagId
                end
                
                Service->>TagRepo: createUserTag(userId, tagId)
                TagRepo->>DB: INSERT INTO user_tags
                DB-->>TagRepo: 저장 완료
            end
        end
        
        Service->>UserRepo: save(User)
        UserRepo->>DB: UPDATE users<br/>SET updated_at = NOW()
        DB-->>UserRepo: 업데이트 완료
        UserRepo-->>Service: User
        
        Service-->>Controller: 수정 완료 응답
        
        Controller-->>UI: 200 OK<br/>{업데이트된 프로필 정보}
        
        UI->>UI: 성공 메시지 표시
        UI->>UI: 프로필 패널 새로고침
        UI-->>User: 프로필 수정 완료
    end

```

**설명**  
이 시퀀스 다이어그램은 사용자가 자신의 프로필 정보를 조회하고 수정하는 전체 과정을 보여준다. 사용자가 프로필 버튼을 클릭하면 클라이언트는 GET /api/user/profile 요청을 UserController로 전송한다. 컨트롤러는 JWT 토큰을 검증하여 사용자 인증 상태를 확인한 뒤 토큰에서 userId를 추출하여 UserService의 getProfileDetail 메서드를 호출한다. 서비스는 UserRepository를 통해 findById로 사용자 기본 정보를 조회하고, 사용자의 역할이 BROKER인 경우 BrokerProfileRepository를 통해 추가 브로커 프로필 정보(licenseNumber, agencyName, intro, profileImageUrl)를 조회한다. 또한 TagRepository를 통해 findUserTags로 사용자와 연결된 태그 목록을 조회한 후, 모든 정보를 통합하여 프로필 정보 응답을 컨트롤러에 반환한다. 컨트롤러는 200 OK와 함께 프로필 정보를 클라이언트에 전달하고, 클라이언트는 프로필 패널에 정보를 표시한다. 사용자가 프로필 수정을 원하는 경우 "프로필 수정" 버튼을 클릭하면 클라이언트는 프로필 수정 폼을 활성화하고 현재 정보를 미리 채운다. 사용자는 기본 정보(전화번호, 소개글), 프로필 사진, 태그(최대 30개, 중복 불가), 비밀번호 등을 수정할 수 있으며, 클라이언트는 각 항목에 대해 유효성 검증을 수행한다. 수정 완료 버튼을 클릭하면 PUT /api/user/profile 요청이 전송되고, 서비스는 요청된 정보에 따라 데이터베이스를 업데이트한다. 비밀번호 변경이 포함된 경우 현재 비밀번호를 PasswordEncoder로 검증하고, 새 비밀번호가 기존과 다른지 확인한 후 BCrypt로 해시화하여 저장한다. 태그가 수정된 경우 기존 UserTag 관계를 모두 삭제한 뒤 새로운 태그들을 TagRepository.findOrCreateByName으로 찾거나 생성하여 UserTag 관계를 다시 설정한다. 기본 정보는 User 엔티티에 업데이트되고 updatedAt 필드가 자동으로 갱신된다. 모든 업데이트가 완료되면 서비스는 수정된 프로필 정보를 컨트롤러에 반환하고, 컨트롤러는 200 OK와 함께 업데이트된 정보를 클라이언트에 전달한다. 클라이언트는 성공 메시지를 표시하고 프로필 패널을 새로고침하여 변경사항을 반영한다.
