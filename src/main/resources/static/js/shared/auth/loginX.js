function setToken(raw) {
  const bearer = raw?.startsWith("Bearer ") ? raw : `Bearer ${raw}`;
  localStorage.setItem("auth_token", bearer);
  window.TOKEN = bearer;
}

// 페이지 로드 시 자동 로그아웃 (토큰 제거)
window.addEventListener("DOMContentLoaded", function () {
  localStorage.removeItem("auth_token"); // ★ 추가
  localStorage.removeItem("refresh_token"); // ★ 추가
  // localStorage에서 모든 인증 토큰 제거
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");

  // sessionStorage에서도 토큰 제거 (혹시 있을 수 있는 경우)
  sessionStorage.removeItem("accessToken");
  sessionStorage.removeItem("refreshToken");
  sessionStorage.removeItem("auth_token");
  sessionStorage.removeItem("refresh_token");

  console.log("자동 로그아웃 완료 - 모든 토큰이 제거되었습니다.");
});

// 폼 제출 처리
document
  .getElementById("loginForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = new FormData(this);
    const email = formData.get("email");
    const password = formData.get("password");

    // 간단한 유효성 검사
    if (!email.trim() || !password.trim()) {
      alert("이메일과 비밀번호를 모두 입력해주세요.");
      return;
    }

    // 로딩 애니메이션
    const submitButton = this.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = "로그인 중...";
    submitButton.disabled = true;

    try {
      // 1. 로그인 API 호출
      const loginResponse = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      if (!loginResponse.ok) {
        const errorData = await loginResponse.text();
        throw new Error(errorData || "로그인에 실패했습니다.");
      }

      const tokenData = await loginResponse.json();
      setToken(tokenData.accessToken);
      // 2. 액세스 토큰을 localStorage에 저장
      localStorage.setItem("accessToken", tokenData.accessToken);
      localStorage.setItem("refreshToken", tokenData.refreshToken);

      // 3. 사용자 정보 가져오기
      const userResponse = await fetch("/api/users/me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${tokenData.accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!userResponse.ok) {
        throw new Error("사용자 정보를 가져올 수 없습니다.");
      }

      const userData = await userResponse.json();

      // 사용자 정보도 localStorage에 저장 (필요시 사용)
      localStorage.setItem(
        "currentUser",
        JSON.stringify({
          userId: userData.id,
          email: userData.email,
          username: userData.username,
          role: userData.role,
        })
      );

      console.log("로그인 사용자 정보:", userData); // 디버깅용

      // 4. 역할별 페이지 리다이렉트
      switch (userData.role) {
        case "regular":
          window.location.href = "loginO.html";
          break;
        case "broker":
          window.location.href = "intermediary.html";
          break;
        case "admin":
          window.location.href = "admin.html";
          break;
        default:
          window.location.href = "loginO.html";
          break;
      }
    } catch (error) {
      console.error("로그인 오류:", error);
      alert(
        error.message ||
          "로그인 중 오류가 발생했습니다. 다시 시도해주세요."
      );

      // 버튼 상태 복원
      submitButton.innerHTML = originalText;
      submitButton.disabled = false;
    }
  });
