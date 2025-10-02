// URL의 ?token= 값을 읽는다
const params = new URLSearchParams(location.search);
const token = params.get("token");

const form = document.getElementById("resetForm");
const msg = document.getElementById("msg");

if (!token) {
  msg.className = "text-sm mt-2 text-red-600";
  msg.textContent = "유효하지 않은 링크입니다. (토큰 없음)";
  form.querySelector("button").disabled = true;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const p1 = document.getElementById("newPassword").value.trim();
  const p2 = document.getElementById("newPassword2").value.trim();

  if (p1.length < 8) {
    msg.className = "text-sm mt-2 text-red-600";
    msg.textContent = "비밀번호는 8자 이상이어야 합니다.";
    return;
  }
  if (p1 !== p2) {
    msg.className = "text-sm mt-2 text-red-600";
    msg.textContent = "두 비밀번호가 일치하지 않습니다.";
    return;
  }

  try {
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: token, newPassword: p1 }),
    });

    if (res.ok) {
      msg.className = "text-sm mt-2 text-green-600";
      msg.textContent = "비밀번호가 변경되었습니다. 로그인 페이지로 이동합니다...";
      setTimeout(() => (window.location.href = "/loginX.html"), 1200);
    } else {
      const text = await res.text();
      msg.className = "text-sm mt-2 text-red-600";
      msg.textContent = text || "링크가 만료되었거나 이미 사용되었습니다.";
    }
  } catch (err) {
    msg.className = "text-sm mt-2 text-red-600";
    msg.textContent = "요청 중 오류가 발생했습니다. 잠시 후 다시 시도하세요.";
    console.error(err);
  }
});
