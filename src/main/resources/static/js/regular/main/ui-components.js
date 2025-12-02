// js/ui-components.js

// --- 알림 아이콘 생성 함수 ---
function getNotificationIcon(iconType, colorClass) {
    const icons = {
        "trending-down": `<path stroke-linecap="round" stroke-linejoin="round" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"/>`,
        home: `<path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m0 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V10m-9-10"/>`,
        "message-circle": `<path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>`,
        "check-circle": `<path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>`,
        bell: `<path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>`,
        settings: `<path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>`,
        "file-text": `<path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>`,
    };

    return `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 ${colorClass}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">${
        icons[iconType] || icons["bell"]
    }</svg>`;
}

// --- 알림 카드 생성 함수 ---
function createNotificationCard(notification) {
    const unreadStyle = !notification.isRead
        ? "border-l-4 border-blue-500"
        : "";
    const unreadBg = !notification.isRead ? "bg-blue-50" : "bg-white";
    const unreadBadge = !notification.isRead
        ? '<span class="w-2 h-2 bg-blue-500 rounded-full"></span>'
        : "";

    return `
            <div class="rounded-lg p-4 border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer ${unreadStyle} ${unreadBg}">
                <div class="flex items-start space-x-3">
                    <div class="flex-shrink-0 w-10 h-10 ${
        notification.bgColor
    } rounded-full flex items-center justify-center">
                        ${getNotificationIcon(
        notification.icon,
        notification.iconColor
    )}
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex items-start justify-between mb-1">
                            <h3 class="font-medium text-gray-900 text-sm ${
        !notification.isRead ? "font-semibold" : ""
    }">${notification.title}</h3>
                            <div class="flex items-center space-x-2 ml-2">
                                ${unreadBadge}
                                <span class="text-xs text-gray-500 whitespace-nowrap">${
        notification.timestamp
    }</span>
                            </div>
                        </div>
                        <p class="text-sm text-gray-600 leading-relaxed ${
        !notification.isRead
            ? "font-medium text-gray-700"
            : ""
    }">${notification.message}</p>
                    </div>
                </div>
            </div>
        `;
}

// --- 즐겨찾기 매물 카드 생성 함수 ---
function createFavoritePropertyCard(property) {
    const tagsHTML = property.tags
        .map((tag) => {
            let colorClass = "bg-blue-100 text-blue-800";
            if (tag === "직거래") colorClass = "bg-green-100 text-green-800";
            if (tag === "확인") colorClass = "bg-gray-200 text-gray-800";
            return `<span class="text-xs font-semibold mr-2 px-2.5 py-0.5 rounded ${colorClass}">${tag}</span>`;
        })
        .join("");

    const propertyId = property.id || property.propertyId;
    
    // 즐겨찾기 여부 확인 (즐겨찾기 패널에 있는건 당연히 true겠지만, 일관성을 위해)
    const isFavored = true; 
    const heartColorClass = "text-red-500";
    const heartFill = "currentColor";

    return `
            <div class="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-[1.02]">
                <div class="relative">
                    <img src="${property.image}" alt="매물 사진" class="w-full h-40 object-cover">
                    <button class="absolute top-2 right-2 bg-white/70 p-1.5 rounded-full hover:bg-white favorite-btn" data-property-id="${propertyId}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="${heartFill}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${heartColorClass}"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></svg>
                    </button>
                </div>
                <div class="p-4">
                    <h3 class="font-bold text-lg text-gray-900">${property.price}</h3>
                    <p class="text-gray-600 text-sm">${property.location}</p>
                    <p class="text-gray-500 text-xs my-2">${property.details}</p>
                    <div class="mt-3">
                        ${tagsHTML}
                    </div>
                </div>
            </div>
        `;
}

// --- 비교 카드 생성 함수 ---
function createCompareCard(item) {
    const tagsHTML = (item.tags || [])
        .map((tag) => {
            let colorClass = "bg-blue-100 text-blue-800";
            if (tag === "직거래") colorClass = "bg-green-100 text-green-800";
            if (tag === "확인") colorClass = "bg-gray-200 text-gray-800";
            return `<span class="text-[10px] font-semibold mr-1.5 px-2 py-0.5 rounded ${colorClass}">${tag}</span>`;
        })
        .join("");

    return `
            <div class="bg-white rounded-lg shadow-md overflow-hidden flex-1 min-w-0">
                <div class="relative">
                    <img src="${item.image}" alt="매물 사진" class="w-full h-28 object-cover">
                </div>
                <div class="p-3">
                    <h3 class="font-bold text-sm text-gray-900">${item.price}</h3>
                    <p class="text-gray-600 text-xs">${item.location}</p>
                    <p class="text-gray-500 text-[11px] my-1.5">${item.details}</p>
                    <div class="mt-1.5">${tagsHTML}</div>
                </div>
            </div>
        `;
}

// --- 메인 매물 카드 생성 함수 ---
function createPropertyCard(property, index) {
    let tagsHTML = (property.tags || [])
        .map((tag) => {
            let colorClass = "bg-blue-100 text-blue-800";
            if (tag === "직거래") colorClass = "bg-green-100 text-green-800";
            if (tag === "확인") colorClass = "bg-gray-200 text-gray-800";
            return `<span class="text-xs font-semibold mr-2 px-2.5 py-0.5 rounded ${colorClass}">${tag}</span>`;
        })
        .join("");

    // 허위매물 위험 배지 (별도 라인으로 분리)
    let anomalyHtml = '';
    if (property.anomalyAlert) {
        anomalyHtml = `<div class="mt-2"><span class="text-xs font-semibold px-2.5 py-0.5 rounded bg-red-100 text-red-800">허위매물 위험</span></div>`;
    }

    // data-property-id 속성 추가하여 클릭 시 올바른 매물 데이터를 찾을 수 있도록 함
    const propertyId = property.id || index || 0;

    // 즐겨찾기 여부 확인
    const isFavored = window.isFavored ? window.isFavored(propertyId) : false;
    const heartColorClass = isFavored ? "text-red-500" : "text-gray-600";
    const heartFill = isFavored ? "currentColor" : "none";

    return `
            <div class="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-[1.02] cursor-pointer" data-property-id="${propertyId}">
                <div class="relative">
                    <img src="${property.image}" alt="매물 사진" class="w-full h-40 object-cover">
                    <button class="absolute top-2 right-2 bg-white/70 p-1.5 rounded-full hover:bg-white favorite-btn" data-property-id="${propertyId}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="${heartFill}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${heartColorClass}"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></svg>
                    </button>
                </div>
                <div class="p-4">
                    <h3 class="font-bold text-lg text-gray-900">${property.price}</h3>
                    <p class="text-gray-600 text-sm">${property.location}</p>
                    <p class="text-gray-500 text-xs my-2">${property.details}</p>
                    <div class="mt-3">
                        ${tagsHTML}
                    </div>
                    ${anomalyHtml}
                </div>
            </div>
        `;
}

// --- 채팅 카드 생성 함수 ---
function createChatCard(chat) {
    const unreadBadge = !chat.isRead
        ? '<span class="bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] h-5 flex items-center justify-center">N</span>'
        : "";
    const unreadStyle = !chat.isRead ? "font-semibold" : "";

    return `
            <div class="bg-white rounded-lg p-4 border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer">
                <div class="flex items-center space-x-3">
                    <div class="relative">
                        <img src="${chat.profileImage}" alt="${
        chat.name
    }" class="w-12 h-12 rounded-full object-cover">
                        ${
        !chat.isRead
            ? '<div class="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></div>'
            : ""
    }
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex justify-between items-start mb-1">
                            <h3 class="font-medium text-gray-900 truncate ${unreadStyle}">${
        chat.name
    }</h3>
                            <span class="text-xs text-gray-500 ml-2">${
        chat.timestamp
    }</span>
                        </div>
                        <p class="text-sm text-gray-600 truncate ${unreadStyle}">${
        chat.lastMessage
    }</p>
                        <p class="text-xs text-blue-600 mt-1 truncate">${
        chat.property
    }</p>
                    </div>
                    ${unreadBadge}
                </div>
            </div>
        `;
}

// --- 내 매물 관리 카드 생성 함수 ---
function createMyPropertyCard(property) {
    let statusColor = "bg-green-100 text-green-800";
    let badgeHtml = "";

    if (property.status === "reserved") {
        statusColor = "bg-yellow-100 text-yellow-800";
    } else if (property.status === "sold") {
        statusColor = "bg-gray-100 text-gray-600";
    }

    if (property.badge === "hot") {
        badgeHtml =
            '<span class="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">HOT</span>';
    } else if (property.badge === "new") {
        badgeHtml =
            '<span class="absolute top-2 left-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded">NEW</span>';
    }

    return `
            <div class="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div class="relative">
                    <img src="${
        property.image
    }" alt="매물 사진" class="w-full h-32 object-cover">
                    ${badgeHtml}
                    <div class="absolute top-2 right-2">
                        <span class="px-2 py-1 text-xs font-medium rounded-full ${statusColor}">${
        property.statusText
    }</span>
                    </div>
                </div>
                <div class="p-4">
                    <h3 class="font-bold text-base text-gray-900 mb-1">${
        property.title
    }</h3>
                    <p class="font-semibold text-blue-600 mb-1">${
        property.price
    }</p>
                    <p class="text-gray-500 text-sm mb-3">${
        property.details
    }</p>

                    <!-- 통계 정보 -->
                    <div class="flex items-center justify-between text-xs text-gray-500 mb-3 bg-gray-50 p-2 rounded">
                        <div class="flex items-center space-x-3">
                            <span class="flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                </svg>
                                ${property.views}
                            </span>
                            <span class="flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                                </svg>
                                ${property.inquiries}
                            </span>
                        </div>
                        <span>${property.registeredDate.replace(
        "2024-",
        ""
    )}</span>
                    </div>

                    <!-- 관리 버튼들 -->
                    <div class="flex space-x-2">
                        <button class="flex-1 px-3 py-2 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors">
                            수정
                        </button>
                        <button class="flex-1 px-3 py-2 text-xs bg-gray-50 text-gray-600 rounded hover:bg-gray-100 transition-colors">
                            통계
                        </button>
                        <button class="px-3 py-2 text-xs bg-gray-50 text-gray-600 rounded hover:bg-gray-100 transition-colors">
                            ⋯
                        </button>
                    </div>
                </div>
            </div>
        `;
  }
