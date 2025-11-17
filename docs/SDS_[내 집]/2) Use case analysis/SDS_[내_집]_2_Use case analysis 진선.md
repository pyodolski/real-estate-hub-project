# Use case 
**GENERAL CHARACTERISTICS**<br>
* * *
**Summary**<br>

**Scope**<br>
**Level** User<br>
**Author**<br>
**Last Update**<br>
**Status**<br>
**Primary Actor** User<br>
**Preconditions**<br>
**Trigger**<br>
**Success Post Conditions**<br>
**Failed Post Conditions**<br>
* * *
**MAIN SUCCESS SCENARIO**<br>
**Step** Action<br>
**S**<br>
**1**<br>
**2**<br>
**3**<br>
**4**<br>
**5**<br>
* * *
**EXTENSION SCENARIOS**<br>
**Step** Branching Action<br>
****
* * *
**RELATED IMFORMATION**<br>
**Performance**<br>
**Frequency**<br>
**<Concurrency>**<br>
**Due Date**<br>
* * *

# Use case 14. 회원가입
**GENERAL CHARACTERISTICS**<br>
* * *
**Summary**<br>
* 사용자는 이메일, 비밀번호, 역할 등을 입력하여 계정을 생성한다.

**Scope**<br>
**Level** User<br>
**Author**<br>
**Last Update**<br>
**Status**<br>
**Primary Actor** User<br>
**Preconditions**<br>
**Trigger**<br>
* 로그인 화면에서 회원가입 버튼을 누를 때.

**Success Post Conditions**<br>
* 로그인 페이지로 이동한다.
* 사용자는 로그인을 할 수 있다.

**Failed Post Conditions**<br>
* 사용자는 로그인을 할 수 있다.
* 사용자는 시스템을 이용할 수 없다.

* * *
**MAIN SUCCESS SCENARIO**<br>
**Step** Action<br>
**S** 사용자는 회원가입을 한다.<br>
**1** 이 Use case는 사용자가 회원가입 할때 시작된다.<br>
**2** 사용자는 사용자 유형으로 regular, broker, admin 중에 선택한다.<br>
**3** 사용자는 이메일, 사용자명, 비밀번호를 필수로 기입한다.<br>
**4** 사용자는 회원 가입 시 최대 30개의 중복 불가인 태그 등록이 가능하고 없는 태그는 DB에서 자동 생성된다.<br>
**5** 회원가입 완료시 사용자가 입력한 사용자/중개사 프로필(broker일 경우)/태그를 저장한다.<br>
**6** 이 Use case는 회원가입이 성공하면 끝난다.<br>
* * *
**EXTENSION SCENARIOS**<br>
**Step** Branching Action<br>
**2**<br>
**2a** broker 선택 시 licenseNumber를 필수로 기입하고 agencyName은 선택적으로 기입한다. 시스템은 이를 확인한다.<br>
**3**<br>
**3a1** 시스템은 이메일, 사용자명, 비밀번호(8~64자)의 입력값을 검증한다.<br>
**3a2** 시스템은 이미 등록된 이메일의 경우 사용자에게 오류 메세지를 보여준다.<br>

****
* * *
**RELATED IMFORMATION**<br>
**Performance** < 3sec<br>
**Frequency** 사용자당 최초 1번<br>
**<Concurrency>**제한 없음<br>
**Due Date**<br>
* * *

# Use case 15. 로그인 / 토큰 관리
**GENERAL CHARACTERISTICS**<br>
* * *
**Summary**<br>
* 사용자가 시스템의 기능을 이용하기 위해 로그인을 하고 시스템은 이를 토큰 관리를 통해 유지 및 차단하는 기능.

**Scope**<br>
**Level** User<br>
**Author**<br>
**Last Update**<br>
**Status**<br>
**Primary Actor** User<br>
**Preconditions**<br>
* 회원가입이 이미 완료된 상태여야 한다.
**Trigger**<br>
* 사용자가 로그인 페이지에서 이메일과 비밀번호를 입력한 후 로그인 버튼을 누를 때.
**Success Post Conditions**<br>
* 사용자는 시스템의 기능들을 사용 가능하다
**Failed Post Conditions**<br>
* 다시 로그인을 시도한다.
* * *
**MAIN SUCCESS SCENARIO**<br>
**Step** Action<br>
**S** 사용자는 로그인 한다<br>
**1** 이 Use case는 회원이 이메일/비밀번호를 입력하고 로그인을 요청할때 시작된다.<br>
**2** 시스템은 이메일과 비밀번호를 검증한다<br>
**3** 시스템은 로그인 성공시 AccessToken(JWT)와 RefreshToken을 발급한다.<br>
**4** 시스템은 RefreshToken 만료일을 14일과 30일 중에 결정한다.<br>
**5** 시스템은 사용자의 역할에 따라 분기된 메인 페이지를 보여준다.<br>
**6** AccessToken 만료시 사용자는 RefreshToken을 이용해 새로운 AccessToken 재발급 받는다.<br>
* * *
**EXTENSION SCENARIOS**<br>
**Step** Branching Action<br>
**2**<br>
**2a** 이메일이나 비밀번호가 잘못되어 로그인에 실패한다.<br>
**2a1** 로그인 실패시 에러 메세지를 보여준다.<br>
**2a2** 이메일과 비밀번호를 다시 입력 받는다.<br>
**6**<br>
**6a** 만료/폐기된 RefreshToken을 사용할때 AccessToken재발급이 불가능하다.<br>
**6a1** 토큰이 만료 되었다는 오류 메세지를 보여준다.<br>
**6a2** 로그인 페이지로 이동하여 새로 로그인 하도록 한다.<br>
****
* * *
**RELATED IMFORMATION**<br>
**Performance** < 4sec<br>
**Frequency**<br>
**<Concurrency>**<br>
**Due Date**<br>
* * *

# Use case 16. 로그아웃
**GENERAL CHARACTERISTICS**<br>
* * *
**Summary**<br>
* 사용자가 로그아웃을 요청하는 기능.

**Scope**<br>
**Level** User<br>
**Author**<br>
**Last Update**<br>
**Status**<br>
**Primary Actor** User<br>
**Preconditions**<br>
* 사용자는 로그인 상태여야 한다.
* 시스템에 토큰이 저장되어 있어야 한다.
**Trigger**<br>
* 사용자가 로그아웃 버튼을 눌렀을 때.
**Success Post Conditions**<br>
* 로그인 페이지로 이동한다.
* 시스템에서 토큰을 삭제한다.
**Failed Post Conditions**<br>
* 현 페이지 그대로 유지된다.
* * *
**MAIN SUCCESS SCENARIO**<br>
**Step** Action<br>
**S** 사용자가 로그아웃을 요청한다.<br>
**1** 이 Use case는 사용자가 로그아웃 버튼을 눌러 로그아웃을 요청 할 때 시작된다.<br>
**2** 시스템은 RefreshToken을 revoked 처리하여 무효화한다.<br>
**3** 브라우저 쿠키와 LocalStorage/SessionStorage의 토큰을 삭제한다.<br>
**4** 사용자는 로그아웃 완료 후 재인증 없이는 API요청이 불가능하다.<br>
* * *
**EXTENSION SCENARIOS**<br>
**Step** Branching Action<br>
**2**<br>
**2a** Token이 이미 만료/폐기 되었을 경우
**2a1** 이미 처리된 것으로 간주해서 3번 step으로 이동한다.
****
* * *
**RELATED IMFORMATION**<br>
**Performance** < 3sec<br>
**Frequency**<br>
**<Concurrency>**<br>
**Due Date**<br>
* * *

# Use case 17. 비밀번호 재설정
**GENERAL CHARACTERISTICS**<br>
* * *
**Summary**<br>
* 사용자가 비밀번호 분실 시 재설정 하는 기능.
**Scope**<br>
**Level** User<br>
**Author**<br>
**Last Update**<br>
**Status**<br>
**Primary Actor** User<br>
**Preconditions**<br>
* 회원가입이 완료된 상태여야 한다.
**Trigger**<br>
* 로그인 페이지에서 비밀번호 찾기를 누를 때.
**Success Post Conditions**<br>
* 로그인 페이지로 이동되며 재설정된 비밀번호로 로그인이 가능하다.
**Failed Post Conditions**<br>
* 로그인 페이지로 이동되며 다시 비밀번호 재설정을 시도해야 한다.
* * *
**MAIN SUCCESS SCENARIO**<br>
**Step** Action<br>
**S** 사용자는 비밀번호를 재설정 한다.<br>
**1** 사용자가 요청 시 PasswordResetToken을 발급한다. 이는 1시간동안 유효하고 만료 시 재사용이 불가능하다.<br>
**2** 비밀번호 재설정 링크가 담긴 이메일을 사용자에게 발송한다.<br>
**3** 사용자는 메일 링크를 클릭하여 비밀번호 재설정 화면으로 이동한다.<br>
**4** 사용자는 새 비밀번호를 입력한다.<br>
**5** 시스템은 토큰 유효성 검증 후 비밀번호 유효성을 검증한다.<br>
**6** 완료 후 로그인 페이지로 이동한다.
* * *
**EXTENSION SCENARIOS**<br>
**Step** Branching Action<br>
**5**<br>
**5a1** 토큰이 유효하지 않거나 비밀번호가 8~64자가 아니거나 기존과 동일한 경우 오류 메세지를 보여준다.<br>
****
* * *
**RELATED IMFORMATION**<br>
**Performance**<br>
**Frequency**<br>
**<Concurrency>**<br>
**Due Date**<br>
* * *

# Use case 18. 사용자 프로필 관리
**GENERAL CHARACTERISTICS**<br>
* * *
**Summary**<br>
* 사용자가 자신의 프로필 정보를 조회하고 수정하는 기능.
**Scope**<br>
**Level** User<br>
**Author**<br>
**Last Update**<br>
**Status**<br>
**Primary Actor** User<br>
**Preconditions**<br>
* 회원 가입 시에 프로필 정보를 입력한 상태여야 한다
**Trigger**<br>
* 프로필 버튼을 눌러 프로필 패널을 띄울 때.
**Success Post Conditions**<br>
* 프로필 패널에 사용자 프로필 정보가 나타난다.
**Failed Post Conditions**<br>
* 프로필 패널이 열리지 않는다.
* 프로필 패널에 사용자 프로필 정보가 나타나지 않는다.
* * *
**MAIN SUCCESS SCENARIO**<br>
**Step** Action<br>
**S** 사용자가 프로필 패널을 열어 프로필 정보를 조회한다.<br>
**1** 이 Use case는 사용자가 프로필 조회 및 수정을 할 때 시작된다.<br>
**2** 사용자는 프로필 버튼을 눌러 프로필 패널을 연다.<br>
**3** 프로필 패널에서 이메일, 닉네임, 역할, 전화번호, 소개글, 사진, 태그를 조회한다.<br>
**4** <br>
**5**<br>
* * *
**EXTENSION SCENARIOS**<br>
**Step** Branching Action<br>
**3**
**3a** broker계정인 경우.
**3a1** licenseNumber, agencyName, intro, profileImageUrl을 같이 포함한다.
**3b** 프로필 수정 버튼을 누른 경우
**3b1** 사용자는 현재 비밀번호를 입력해야 한다.
**3b2** 프로필 태그, 사진, 비밀번호, 프로필 소개문을 수정 가능하다.
**3b3** 시스템은 사용자가 태그 수정시 전체 삭제 후 재등록한다.(최대 30개, 중복불가, 없으면 DB를 생성한다)
**3b4** 비밀번호 변경 시에는 기존 비밀번호 검증 및 동일 여부를 확인한다.
**3b5** 시스템은 비밀번호 변경 성공시 새로운 해시로 저장한다.
****
* * *
**RELATED IMFORMATION**<br>
**Performance** 5<sec <br>
**Frequency**<br>
**<Concurrency>**<br>
**Due Date**<br>
* * *