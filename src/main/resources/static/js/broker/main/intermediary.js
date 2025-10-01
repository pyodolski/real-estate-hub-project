// --- 샘플 데이터 ---
const registrationRequests = [
  {
    id: 101,
    image:
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=800&auto=format&fit=crop",
    price: "월세 500/95",
    location: "성동구 성수동1가",
    details: "오피스텔 ∙ 5층 ∙ 25.5m²",
    requester: { name: "박선호", contact: "010-1111-2222" },
  },
  {
    id: 102,
    image:
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=800&auto=format&fit=crop",
    price: "매매 12억",
    location: "용산구 이촌동",
    details: "아파트 ∙ 11층 ∙ 110.2m²",
    requester: { name: "이하나", contact: "010-3333-4444" },
  },
  {
    id: 103,
    image:
      "https://images.unsplash.com/photo-1598228723793-52759bba239c?q=80&w=800&auto=format&fit=crop",
    price: "전세 4억 5,000",
    location: "송파구 잠실동",
    details: "빌라 ∙ 3층 ∙ 68.0m²",
    requester: { name: "최민준", contact: "010-5555-6666" },
  },
];
const agentProperties = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=800&auto=format&fit=crop",
    price: "전세 1억 3,500",
    location: "관악구 봉천동",
    details: "원룸 ∙ 2층 ∙ 33.06m²",
    status: "active",
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=800&auto=format&fit=crop",
    price: "전세 1억 9,800",
    location: "관악구 신림동",
    details: "기타 ∙ 고층 ∙ 13.74m²",
    status: "active",
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=800&auto=format&fit=crop",
    price: "월세 3000/80",
    location: "동작구 상도동",
    details: "투룸 ∙ 3층 ∙ 45.12m²",
    status: "pending",
  },
  {
    id: 4,
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop",
    price: "매매 5억 2,000",
    location: "강남구 역삼동",
    details: "아파트 ∙ 15층 ∙ 84.9m²",
    status: "done",
  },
  {
    id: 5,
    image:
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=800&auto=format&fit=crop",
    price: "전세 2억 5,000",
    location: "마포구 서교동",
    details: "오피스텔 ∙ 10층 ∙ 28.5m²",
    status: "active",
  },
];

const requestListContainer = document.getElementById(
  "registration-requests"
);
const propertyListContainer = document.getElementById(
  "agent-property-list"
);

// --- 매물 상태 뱃지 생성 함수 ---
function getStatusBadge(status) {
  switch (status) {
    case "active":
      return '<span class="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">광고중</span>';
    case "pending":
      return '<span class="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">거래진행</span>';
    case "done":
      return '<span class="bg-gray-200 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">거래완료</span>';
    default:
      return "";
  }
}

// --- 등록 요청 카드 생성 함수 ---
function createRequestCard(request) {
  return `
        <div class="bg-white rounded-lg shadow-md overflow-hidden transition-shadow hover:shadow-xl border-l-4 border-indigo-500">
            <img src="${request.image}" alt="매물 사진" class="w-full h-48 object-cover">
            <div class="p-4">
                <div>
                    <h3 class="font-bold text-lg text-gray-900">${request.price}</h3>
                    <p class="text-gray-600 text-sm mt-1">${request.location}</p>
                    <p class="text-gray-500 text-xs my-2">${request.details}</p>
                </div>
                <div class="flex justify-between items-center mt-3 pt-3 border-t">
                    <p class="text-xs text-gray-600 font-medium">요청자: ${request.requester.name} (${request.requester.contact})</p>
                    <div class="flex items-center gap-2">
                        <button class="text-sm bg-green-100 text-green-700 px-4 py-1.5 rounded-md hover:bg-green-200">승인</button>
                        <button class="text-sm bg-gray-200 text-gray-800 px-4 py-1.5 rounded-md hover:bg-gray-300">거절</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// --- 관리 매물 카드 생성 함수 ---
function createAgentPropertyCard(property) {
  return `
        <div class="bg-white rounded-lg shadow-md overflow-hidden transition-shadow hover:shadow-xl">
            <img src="${
              property.image
            }" alt="매물 사진" class="w-full h-48 object-cover">
            <div class="p-4">
                <div>
                    <div class="flex justify-between items-start">
                        <h3 class="font-bold text-lg text-gray-900">${
                          property.price
                        }</h3>
                        ${getStatusBadge(property.status)}
                    </div>
                    <p class="text-gray-600 text-sm mt-1">${
                      property.location
                    }</p>
                    <p class="text-gray-500 text-xs my-2">${
                      property.details
                    }</p>
                </div>
                <div class="flex justify-end items-center gap-2 mt-3 pt-3 border-t">
                    <button class="text-sm bg-gray-200 text-gray-800 px-4 py-1.5 rounded-md hover:bg-gray-300">수정</button>
                    <button class="text-sm bg-red-100 text-red-700 px-4 py-1.5 rounded-md hover:bg-red-200">삭제</button>
                </div>
            </div>
        </div>
    `;
}

// --- 데이터 렌더링 ---
function renderAllLists() {
  requestListContainer.innerHTML = registrationRequests
    .map(createRequestCard)
    .join("");
  propertyListContainer.innerHTML = agentProperties
    .map(createAgentPropertyCard)
    .join("");
}
renderAllLists();

// --- 상태 변수 ---
let isPanelOpen = true;
let isPanelExpanded = false;

// --- DOM 요소 ---
const sidePanel = document.getElementById("side-panel");
const searchBarContainer = document.getElementById(
  "search-bar-container"
);
const mainContent = document.querySelector("main");
const rightSidePanel = document.getElementById("right-side-panel");
const rightToggleButton = document.getElementById(
  "right-panel-toggle-button"
);

// 왼쪽 패널 컨트롤 버튼
const openPanelButton = document.getElementById("open-panel-button");
const closePanelButton = document.getElementById("close-panel-button");
const expandPanelButton = document.getElementById("expand-panel-button");
const collapseFullscreenButton = document.getElementById(
  "collapse-fullscreen-button"
);
const addListingContainer = document.getElementById(
  "add-listing-container"
);

// --- UI 업데이트 로직 ---
function updateUIVisibility() {
  // Part 1: 패널 크기 및 그리드 레이아웃 관리
  if (isPanelExpanded) {
    sidePanel.classList.remove("w-[450px]");
    sidePanel.classList.add("w-full", "z-50");
    addListingContainer.classList.add("mr-16"); // 버튼 겹침 방지

    // 그리드 레이아웃으로 변경 (카드 크기 유지)
    requestListContainer.classList.remove(
      "flex",
      "flex-col",
      "space-y-4"
    );
    propertyListContainer.classList.remove(
      "flex",
      "flex-col",
      "space-y-4"
    );
    requestListContainer.classList.add(
      "grid",
      "grid-cols-1",
      "md:grid-cols-2",
      "lg:grid-cols-3",
      "xl:grid-cols-4",
      "gap-4"
    );
    propertyListContainer.classList.add(
      "grid",
      "grid-cols-1",
      "md:grid-cols-2",
      "lg:grid-cols-3",
      "xl:grid-cols-4",
      "gap-4"
    );
  } else {
    sidePanel.classList.add("w-[450px]");
    sidePanel.classList.remove("w-full", "z-50");
    addListingContainer.classList.remove("mr-16");

    // 원래의 flex 레이아웃으로 복원
    requestListContainer.classList.add("flex", "flex-col", "space-y-4");
    propertyListContainer.classList.add("flex", "flex-col", "space-y-4");
    requestListContainer.classList.remove(
      "grid",
      "grid-cols-1",
      "md:grid-cols-2",
      "lg:grid-cols-3",
      "xl:grid-cols-4",
      "gap-4"
    );
    propertyListContainer.classList.remove(
      "grid",
      "grid-cols-1",
      "md:grid-cols-2",
      "lg:grid-cols-3",
      "xl:grid-cols-4",
      "gap-4"
    );
  }

  // Part 2: 다른 모든 요소의 가시성 관리
  if (isPanelExpanded) {
    mainContent.classList.add("hidden");
    rightSidePanel.classList.add("hidden");
    rightToggleButton.classList.add("hidden");

    openPanelButton.classList.add("opacity-0", "pointer-events-none");
    closePanelButton.classList.add("opacity-0", "pointer-events-none");
    expandPanelButton.classList.add("opacity-0", "pointer-events-none");

    collapseFullscreenButton.classList.remove("hidden");
  } else {
    mainContent.classList.remove("hidden");
    rightSidePanel.classList.remove("hidden");
    rightToggleButton.classList.remove("hidden");

    collapseFullscreenButton.classList.add("hidden");

    // Part 3: 열기/닫기 상태 관리 (확장되지 않았을 때만)
    if (isPanelOpen) {
      sidePanel.classList.remove("-translate-x-full");
      searchBarContainer.style.left = "474px";

      closePanelButton.style.left = "450px";
      expandPanelButton.style.left = "450px";

      closePanelButton.classList.remove(
        "opacity-0",
        "pointer-events-none"
      );
      expandPanelButton.classList.remove(
        "opacity-0",
        "pointer-events-none"
      );
      openPanelButton.classList.add("opacity-0", "pointer-events-none");
    } else {
      // Panel is closed
      sidePanel.classList.add("-translate-x-full");
      searchBarContainer.style.left = "24px";

      closePanelButton.style.left = "0px";
      expandPanelButton.style.left = "0px";

      closePanelButton.classList.add("opacity-0", "pointer-events-none");
      expandPanelButton.classList.add("opacity-0", "pointer-events-none");
      openPanelButton.classList.remove(
        "opacity-0",
        "pointer-events-none"
      );
    }
  }
}

// --- 이벤트 리스너 ---
closePanelButton.addEventListener("click", () => {
  isPanelOpen = false;
  updateUIVisibility();
});

openPanelButton.addEventListener("click", () => {
  isPanelOpen = true;
  updateUIVisibility();
});

expandPanelButton.addEventListener("click", () => {
  isPanelExpanded = true;
  updateUIVisibility();
});

collapseFullscreenButton.addEventListener("click", () => {
  isPanelExpanded = false;
  updateUIVisibility();
});

// --- 오른쪽 패널 토글 로직 (롤백된 버전) ---
const rightOpenIcon = document.getElementById("right-open-icon");
const rightCloseIcon = document.getElementById("right-close-icon");
let isRightPanelOpen = true;

rightToggleButton.addEventListener("click", () => {
  isRightPanelOpen = !isRightPanelOpen;
  if (isRightPanelOpen) {
    rightSidePanel.classList.remove("translate-x-full");
    rightToggleButton.style.right = "75px";
    searchBarContainer.style.right = "99px";
    rightOpenIcon.classList.add("hidden");
    rightCloseIcon.classList.remove("hidden");
  } else {
    rightSidePanel.classList.add("translate-x-full");
    rightToggleButton.style.right = "0px";
    searchBarContainer.style.right = "24px";
    rightOpenIcon.classList.remove("hidden");
    rightCloseIcon.classList.add("hidden");
  }
});

// 초기 UI 상태 설정
updateUIVisibility();
