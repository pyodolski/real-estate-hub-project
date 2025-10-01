// 관리자 권한 체크
const accessToken = localStorage.getItem("accessToken");

if (!accessToken) {
  alert("로그인이 필요합니다.");
  window.location.href = "/loginX.html";
} else {
  // 사용자 정보 확인
  fetch("/api/users/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("사용자 정보를 불러올 수 없습니다.");
      }
      return response.json();
    })
    .then((userData) => {
      if (userData.role !== "admin") {
        alert("관리자 권한이 필요합니다.");
        window.location.href = "/";
      }
    })
    .catch((error) => {
      console.error("권한 체크 실패:", error);
      alert("로그인이 필요합니다.");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      window.location.href = "/loginX.html";
    });
}
