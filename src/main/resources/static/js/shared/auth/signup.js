// 폼 제출 처리
document
  .getElementById("signupForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const formData = new FormData(this);
    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");
    const agreeTerms = document.getElementById("agreeTerms").checked;

    // 비밀번호 길이 확인
    if (password.length < 8) {
      alert("비밀번호는 8자 이상이어야 합니다.");
      return;
    }

    // 비밀번호 확인
    if (password !== confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    // 이용약관 동의 확인
    if (!agreeTerms) {
      alert("이용약관에 동의해주세요.");
      return;
    }

    // 로딩 애니메이션
    const submitButton = this.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = "가입 중...";
    submitButton.disabled = true;

    // 선택된 역할 확인
    const selectedRole = formData.get("roleId");

    // 중개인 선택 시 필수 필드 검증
    if (selectedRole === "broker") {
      const licenseNumber = formData.get("licenseNumber");
      if (!licenseNumber || licenseNumber.trim() === "") {
        alert("중개사 면허 번호는 필수 입력 항목입니다.");
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
        return;
      }
    }

    // 회원가입 API 호출
    const signupData = {
      email: formData.get("email"),
      username: formData.get("username"),
      password: formData.get("password"),
      role: selectedRole,
      phoneNumber: formData.get("phoneNumber") || null,
      intro: formData.get("intro") || null,
      profileImageUrl: null,
      licenseNumber:
        selectedRole === "broker" ? formData.get("licenseNumber") : null,
      agencyName:
        selectedRole === "broker" ? formData.get("agencyName") : null,
    };

    console.log("회원가입 데이터:", signupData);

    fetch("/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(signupData),
    })
      .then((response) => {
        console.log("응답 상태:", response.status);
        if (!response.ok) {
          return response.text().then((text) => {
            console.error("에러 응답:", text);
            let errorMessage = text;
            try {
              const errorJson = JSON.parse(text);
              errorMessage = errorJson.error || errorJson.message || text;
            } catch (e) {
              // JSON 파싱 실패시 원본 텍스트 사용
            }
            throw new Error(errorMessage || "회원가입에 실패했습니다.");
          });
        }
        return response;
      })
      .then(() => {
        alert("회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.");
        window.location.href = "loginX.html";
      })
      .catch((error) => {
        console.error("회원가입 오류:", error);
        alert(
          error.message ||
            "회원가입 중 오류가 발생했습니다. 다시 시도해주세요."
        );

        // 버튼 상태 복원
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
      });
  });

// 사용자 유형 변경 시 스타일 업데이트 및 중개인 필드 표시/숨김
document.querySelectorAll('input[name="roleId"]').forEach((radio) => {
  radio.addEventListener("change", function () {
    // 모든 라벨에서 선택된 스타일 제거
    document.querySelectorAll('input[name="roleId"]').forEach((r) => {
      const label = r.closest("label");
      const div = label.querySelector("div");
      if (r.value === "admin") {
        div.classList.remove("border-red-400", "bg-red-50");
      } else {
        div.classList.remove("border-green-400", "bg-green-50");
      }
      div.classList.add("border-gray-200");
    });

    // 선택된 라벨에 스타일 적용
    const parentLabel = this.closest("label");
    const div = parentLabel.querySelector("div");
    if (this.value === "admin") {
      div.classList.add("border-red-400", "bg-red-50");
    } else {
      div.classList.add("border-green-400", "bg-green-50");
    }
    div.classList.remove("border-gray-200");

    // 중개인 전용 필드 표시/숨김
    const brokerFields = document.getElementById("brokerFields");
    const licenseNumberInput = document.getElementById("licenseNumber");
    const agencyNameInput = document.getElementById("agencyName");

    if (this.value === "broker") {
      brokerFields.classList.remove("hidden");
      licenseNumberInput.required = true;
    } else {
      brokerFields.classList.add("hidden");
      licenseNumberInput.required = false;
      licenseNumberInput.value = "";
      agencyNameInput.value = "";
    }
  });
});
