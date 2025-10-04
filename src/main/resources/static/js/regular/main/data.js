// js/data.js

// --- 알림 데이터는 notification-management.js에서 API로 로드됩니다 ---

// --- 내 매물 관리 데이터 (더미) ---
const myProperties = [
  {
    id: 1,
    title: "강남구 역삼동 오피스텔",
    price: "전세 2억 8천만원",
    location: "강남구 역삼동",
    details: "오피스텔 ∙ 방 1개 ∙ 12층 ∙ 33.06m²",
    status: "active", // active, reserved, sold
    statusText: "판매중",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop",
    views: 156,
    inquiries: 8,
    registeredDate: "2024-01-15",
    badge: "hot", // hot, new, none
  },
  {
    id: 2,
    title: "마포구 합정동 투룸 빌라",
    price: "월세 500/65",
    location: "마포구 합정동",
    details: "빌라 ∙ 방 2개 ∙ 3층 ∙ 45.12m²",
    status: "reserved",
    statusText: "예약중",
    image:
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070&auto=format&fit=crop",
    views: 89,
    inquiries: 12,
    registeredDate: "2024-01-20",
    badge: "none",
  },
  {
    id: 3,
    title: "서초구 반포동 아파트",
    price: "매매 4억 2천만원",
    location: "서초구 반포동",
    details: "아파트 ∙ 방 3개 ∙ 8층 ∙ 84.9m²",
    status: "sold",
    statusText: "거래완료",
    image:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop",
    views: 234,
    inquiries: 15,
    registeredDate: "2024-01-10",
    badge: "none",
  },
];

// --- 즐겨찾기 매물 데이터 (샘플) ---
const favoriteProperties = [
  {
    image:
      "https://images.unsplash.com/photo-15701294TT492-45c003edd2be?q=80&w=2070&auto=format&fit=crop",
    price: "전세 1억 3,500",
    location: "관악구 봉천동",
    details: "원룸 ∙ 방 1개 ∙ 2층 ∙ 33.06m²",
    tags: ["집주인 인증", "추천", "확인"],
  },
  {
    image:
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=1974&auto=format&fit=crop",
    price: "전세 1억 9,800",
    location: "관악구 신림동",
    details: "기타 ∙ 방 1개 ∙ 고층 ∙ 13.74m²",
    tags: ["직거래", "추천"],
  },
  {
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop",
    price: "매매 5억 2,000",
    location: "강남구 역삼동",
    details: "아파트 ∙ 방 3개 ∙ 15층 ∙ 84.9m²",
    tags: ["확인"],
  },
  {
    image:
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070&auto=format&fit=crop",
    price: "전세 3억 1,000",
    location: "서대문구 연희동",
    details: "빌라 ∙ 방 2개 ∙ 4층 ∙ 55.0m²",
    tags: ["직거래"],
  },
];

// --- 비교 그룹 데이터 (샘플) ---
const compareGroups = [
  {
    groupId: 1,
    items: [
      {
        image:
          "https://images.unsplash.com/photo-15701294TT492-45c003edd2be?q=80&w=2070&auto=format&fit=crop",
        price: "전세 1억 3,500",
        location: "관악구 봉천동",
        details: "원룸 ∙ 33.06m²",
        tags: ["추천"],
      },
      {
        image:
          "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=1974&auto=format&fit=crop",
        price: "전세 1억 9,800",
        location: "관악구 신림동",
        details: "기타 ∙ 13.74m²",
        tags: ["직거래"],
      },
    ],
  },
  {
    groupId: 2,
    items: [
      {
        image:
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop",
        price: "매매 5억 2,000",
        location: "강남구 역삼동",
        details: "아파트 ∙ 84.9m²",
        tags: ["확인"],
      },
      {
        image:
          "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop",
        price: "월세 3000/80",
        location: "동작구 상도동",
        details: "투룸 ∙ 45.12m²",
        tags: ["추천"],
      },
      {
        image:
          "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070&auto=format&fit=crop",
        price: "전세 3억 1,000",
        location: "서대문구 연희동",
        details: "빌라 ∙ 55.0m²",
        tags: ["직거래"],
      },
    ],
  },
];

// --- 메인 화면 매물 리스트 데이터 (샘플. 상세정보추가) ---
const properties = [
  {
    id: 101,
    image:
      "https://images.unsplash.com/photo-15701294TT492-45c003edd2be?q=80&w=2070&auto=format&fit=crop",
    price: "전세 1억 3,500",
    location: "관악구 봉천동",
    details: "원룸 ∙ 방 1개 ∙ 2층 ∙ 33.06m²",
    tags: ["집주인 인증", "추천", "확인"],
    isRecommended: true,
    buildingYear: 2018,
    options: ["에어컨", "냉장고", "세탁기", "인터넷", "주차장"],
    description:
      "관악구 봉천동에 위치한 깔끔한 원룸입니다. 교통이 편리하고 주변 상권이 발달되어 있습니다.",
    brokerName: "김부동",
    brokerPhone: "010-1234-5678",
    status: "AVAILABLE",
  },
  {
    id: 102,
    image:
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=1974&auto=format&fit=crop",
    price: "전세 1억 9,800",
    location: "관악구 신림동",
    details: "기타 ∙ 방 1개 ∙ 고층 ∙ 13.74m²",
    tags: ["직거래", "추천"],
    isRecommended: true,
    buildingYear: 2020,
    options: ["에어컨", "냉장고", "세탁기", "인터넷", "주차장", "엘리베이터"],
    description:
      "관악구 신림동의 고층 원룸입니다. 넓은 전망과 깔끔한 인테리어를 자랑합니다.",
    brokerName: "이중개",
    brokerPhone: "010-9876-5432",
    status: "AVAILABLE",
  },
  {
    id: 103,
    image:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop",
    price: "월세 3000/80",
    location: "동작구 상도동",
    details: "투룸 ∙ 방 2개 ∙ 3층 ∙ 45.12m²",
    tags: ["추천"],
    isRecommended: false,
    buildingYear: 2019,
    options: ["에어컨", "냉장고", "세탁기", "인터넷", "주차장"],
    description:
      "동작구 상도동의 넓은 투룸입니다. 가족이 거주하기에 적합한 공간입니다.",
    brokerName: "박부동산",
    brokerPhone: "010-5555-7777",
    status: "AVAILABLE",
  },
  {
    id: 104,
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop",
    price: "매매 5억 2,000",
    location: "강남구 역삼동",
    details: "아파트 ∙ 방 3개 ∙ 15층 ∙ 84.9m²",
    tags: ["확인"],
    isRecommended: true,
    buildingYear: 2022,
    options: [
      "에어컨",
      "냉장고",
      "세탁기",
      "인터넷",
      "주차장",
      "엘리베이터",
      "관리사무소",
      "CCTV",
    ],
    description:
      "강남구 역삼동의 프리미엄 아파트입니다. 최신 시설과 우수한 관리로 주거 환경이 뛰어납니다.",
    brokerName: "최부동",
    brokerPhone: "010-1111-2222",
    status: "CONTRACTED",
  },
  {
    id: 105,
    image:
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=2074&auto=format&fit=crop",
    price: "전세 2억 5,000",
    location: "마포구 서교동",
    details: "오피스텔 ∙ 방 1개 ∙ 10층 ∙ 28.5m²",
    tags: ["집주인 인증"],
    isRecommended: false,
    buildingYear: 2021,
    options: ["에어컨", "냉장고", "세탁기", "인터넷", "주차장", "엘리베이터"],
    description:
      "마포구 서교동의 현대적인 오피스텔입니다. 홍대 상권과 가까워 생활이 편리합니다.",
    brokerName: "정중개",
    brokerPhone: "010-3333-4444",
    status: "AVAILABLE",
  },
  {
    id: 106,
    image:
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070&auto=format&fit=crop",
    price: "전세 3억 1,000",
    location: "서대문구 연희동",
    details: "빌라 ∙ 방 2개 ∙ 4층 ∙ 55.0m²",
    tags: ["직거래"],
    isRecommended: true,
    buildingYear: 2017,
    options: ["에어컨", "냉장고", "세탁기", "인터넷", "주차장"],
    description:
      "서대문구 연희동의 조용한 빌라입니다. 한적한 주거 환경을 원하는 분께 추천합니다.",
    brokerName: "윤부동산",
    brokerPhone: "010-6666-7777",
    status: "AVAILABLE",
  },
];

// --- 채팅 데이터 (샘플) ---
const chatData = [
  {
    id: 1,
    name: "김중개사",
    lastMessage: "이 매물에 대해 문의주신 내용 답변드립니다.",
    timestamp: "오후 3:24",
    isRead: false,
    profileImage:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    property: "강남구 역삼동 아파트",
  },
  {
    id: 2,
    name: "박부동산",
    lastMessage: "네, 언제든 연락주세요!",
    timestamp: "오후 2:15",
    isRead: true,
    profileImage:
      "https://images.unsplash.com/photo-1494790108755-2616b612b436?w=100&h=100&fit=crop&crop=face",
    property: "서초구 반포동 오피스텔",
  },
  {
    id: 3,
    name: "이공인중개사",
    lastMessage: "방문 일정은 내일 오전 10시로 확정되었습니다.",
    timestamp: "오전 11:30",
    isRead: false,
    profileImage:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    property: "마포구 합정동 빌라",
  },
];
