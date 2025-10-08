// 위임 요청 상세 패널 더블버퍼 A/B 관리 및 애니메이션 전환
// 공개 API: initDelegationDetailPanel, openDelegationDetail(delegationId), closeDelegationDetail()

(function () {
  let currentBuffer = "a";
  let isOpen = false;
  let currentDelegationId = null;
  let onApproveCallback = null;
  let onRejectCallback = null;

  const qs = (sel) => document.querySelector(sel);

  function getElems(buf) {
    const suffix = buf === "a" ? "a" : "b";
    return {
      overlay: qs(`#delegation-detail-overlay-${suffix}`),
      closeBtn: qs(`#close-delegation-detail-${suffix}`),
      statusBadge: qs(`#delegation-status-badge-${suffix}`),
      propertyTitle: qs(`#delegation-property-title-${suffix}`),
      propertyAddress: qs(`#delegation-property-address-${suffix}`),
      ownerName: qs(`#delegation-owner-name-${suffix}`),
      offerContainer: qs(`#delegation-offer-container-${suffix}`),
      offerType: qs(`#delegation-offer-type-${suffix}`),
      offerHousetype: qs(`#delegation-offer-housetype-${suffix}`),
      offerFloor: qs(`#delegation-offer-floor-${suffix}`),
      priceSale: qs(`#delegation-price-sale-${suffix}`),
      totalPrice: qs(`#delegation-total-price-${suffix}`),
      priceJeonse: qs(`#delegation-price-jeonse-${suffix}`),
      depositJeonse: qs(`#delegation-deposit-jeonse-${suffix}`),
      priceWolse: qs(`#delegation-price-wolse-${suffix}`),
      depositWolse: qs(`#delegation-deposit-wolse-${suffix}`),
      monthlyRent: qs(`#delegation-monthly-rent-${suffix}`),
      maintenanceFee: qs(`#delegation-maintenance-fee-${suffix}`),
      negotiableContainer: qs(`#delegation-negotiable-container-${suffix}`),
      availableFromContainer: qs(`#delegation-available-from-container-${suffix}`),
      availableFrom: qs(`#delegation-available-from-${suffix}`),
      optionsContainer: qs(`#delegation-options-container-${suffix}`),
      optionsList: qs(`#delegation-options-list-${suffix}`),
      rejectReasonContainer: qs(`#delegation-reject-reason-container-${suffix}`),
      rejectReason: qs(`#delegation-reject-reason-${suffix}`),
      actionsContainer: qs(`#delegation-actions-${suffix}`),
      rejectBtn: qs(`#reject-delegation-btn-${suffix}`),
      approveBtn: qs(`#approve-delegation-btn-${suffix}`),
    };
  }

  function setOverlayVisible(el, visible) {
    if (!el) return;
    if (visible) {
      el.style.opacity = "1";
      el.style.pointerEvents = "auto";
      el.classList.remove("-translate-x-full");
    } else {
      el.style.opacity = "0";
      el.style.pointerEvents = "none";
      el.classList.add("-translate-x-full");
    }
  }

  function getStatusBadge(status) {
    switch (status) {
      case "PENDING":
        return { label: "대기 중", className: "bg-orange-100 text-orange-800" };
      case "APPROVED":
        return { label: "승인됨", className: "bg-green-100 text-green-800" };
      case "REJECTED":
        return { label: "거절됨", className: "bg-red-100 text-red-800" };
      case "CANCELED":
        return { label: "취소됨", className: "bg-gray-100 text-gray-800" };
      default:
        return { label: "알 수 없음", className: "bg-gray-100 text-gray-800" };
    }
  }

  function getTransactionTypeLabel(type) {
    switch (type) {
      case "SALE":
        return "매매";
      case "JEONSE":
        return "전세";
      case "WOLSE":
        return "월세";
      default:
        return "정보 없음";
    }
  }

  function getHouseTypeLabel(type) {
    switch (type) {
      case "APART":
        return "아파트";
      case "BILLA":
        return "빌라";
      case "ONE":
        return "원룸";
      default:
        return "정보 없음";
    }
  }

  function formatPrice(value) {
    if (!value) return "정보 없음";
    return `${Number(value).toLocaleString()}만원`;
  }

  function formatDate(dateString) {
    if (!dateString) return "정보 없음";
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR");
  }

  function parseOptions(optionString) {
    if (!optionString) return [];
    // "1000000000" 형태의 문자열을 배열로 변환
    const optionLabels = [
      "에어컨", "냉장고", "세탁기", "TV", "인터넷",
      "침대", "책상", "옷장", "신발장", "전자레인지"
    ];
    return optionString.split("").map((char, idx) => {
      return char === "1" ? optionLabels[idx] : null;
    }).filter(Boolean);
  }

  function renderInto(buf, data) {
    const el = getElems(buf);
    if (!el.overlay) return;

    const d = data || {};
    const offer = d.offer || {};

    // 디버깅: 받은 데이터 확인
    console.log('[DelegationDetailPanel] 렌더링 데이터:', {
      전체데이터: d,
      offer데이터: offer,
      ownerName: d.ownerName,
      brokerName: d.brokerName
    });

    // 상태 배지
    const statusInfo = getStatusBadge(d.status);
    if (el.statusBadge) {
      el.statusBadge.textContent = statusInfo.label;
      el.statusBadge.className = `px-3 py-1 rounded-full text-sm font-semibold ${statusInfo.className}`;
    }

    // 매물 정보
    if (el.propertyTitle) el.propertyTitle.textContent = d.propertyTitle || "정보 없음";
    if (el.propertyAddress) el.propertyAddress.textContent = d.propertyAddress || "정보 없음";

    // 의뢰인 정보
    if (el.ownerName) el.ownerName.textContent = d.ownerName || "정보 없음";

    // 매물 상세 정보
    if (offer && Object.keys(offer).length > 0) {
      if (el.offerType) el.offerType.textContent = getTransactionTypeLabel(offer.type);
      if (el.offerHousetype) el.offerHousetype.textContent = getHouseTypeLabel(offer.housetype);
      if (el.offerFloor) el.offerFloor.textContent = offer.floor ? `${offer.floor}층` : "정보 없음";

      // 가격 정보 (거래 유형별로 다르게 표시)
      if (offer.type === "SALE") {
        if (el.priceSale) el.priceSale.style.display = "block";
        if (el.priceJeonse) el.priceJeonse.style.display = "none";
        if (el.priceWolse) el.priceWolse.style.display = "none";
        if (el.totalPrice) el.totalPrice.textContent = formatPrice(offer.totalPrice);
      } else if (offer.type === "JEONSE") {
        if (el.priceSale) el.priceSale.style.display = "none";
        if (el.priceJeonse) el.priceJeonse.style.display = "block";
        if (el.priceWolse) el.priceWolse.style.display = "none";
        if (el.depositJeonse) el.depositJeonse.textContent = formatPrice(offer.deposit);
      } else if (offer.type === "WOLSE") {
        if (el.priceSale) el.priceSale.style.display = "none";
        if (el.priceJeonse) el.priceJeonse.style.display = "none";
        if (el.priceWolse) el.priceWolse.style.display = "block";
        if (el.depositWolse) el.depositWolse.textContent = formatPrice(offer.deposit);
        if (el.monthlyRent) el.monthlyRent.textContent = formatPrice(offer.monthlyRent);
      }

      if (el.maintenanceFee) el.maintenanceFee.textContent = formatPrice(offer.maintenanceFee);

      // 협상 가능 여부
      if (el.negotiableContainer) {
        el.negotiableContainer.style.display = offer.negotiable ? "block" : "none";
      }

      // 입주 가능일
      if (offer.availableFrom) {
        if (el.availableFromContainer) el.availableFromContainer.style.display = "block";
        if (el.availableFrom) el.availableFrom.textContent = formatDate(offer.availableFrom);
      } else {
        if (el.availableFromContainer) el.availableFromContainer.style.display = "none";
      }

      // 옵션 표시
      const options = parseOptions(offer.oftion);
      if (options.length > 0) {
        if (el.optionsContainer) el.optionsContainer.style.display = "block";
        if (el.optionsList) {
          el.optionsList.innerHTML = options
            .map((opt) => `<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">${opt}</span>`)
            .join("");
        }
      } else {
        if (el.optionsContainer) el.optionsContainer.style.display = "none";
      }

      if (el.offerContainer) el.offerContainer.style.display = "block";
    } else {
      if (el.offerContainer) el.offerContainer.style.display = "none";
    }

    // 거절 사유
    if (d.rejectReason) {
      if (el.rejectReason) el.rejectReason.textContent = d.rejectReason;
      if (el.rejectReasonContainer) el.rejectReasonContainer.style.display = "block";
    } else {
      if (el.rejectReasonContainer) el.rejectReasonContainer.style.display = "none";
    }

    // 승인/거절 버튼 표시 여부
    if (d.status === "PENDING") {
      if (el.actionsContainer) el.actionsContainer.style.display = "block";

      if (el.approveBtn) {
        el.approveBtn.onclick = () => handleApprove(d.id);
      }
      if (el.rejectBtn) {
        el.rejectBtn.onclick = () => handleReject(d.id);
      }
    } else {
      if (el.actionsContainer) el.actionsContainer.style.display = "none";
    }
  }

  function handleApprove(delegationId) {
    if (onApproveCallback) {
      onApproveCallback(delegationId);
    }
  }

  function handleReject(delegationId) {
    if (onRejectCallback) {
      onRejectCallback(delegationId);
    }
  }

  function openDelegationDetail(delegationId, data) {
    // 같은 요청을 다시 클릭한 경우 (토글 동작)
    if (currentDelegationId === delegationId && isOpen) {
      closeDelegationDetail();
      return;
    }

    currentDelegationId = delegationId;

    // data가 제공되면 그대로 사용, 아니면 찾기
    if (data) {
      showPanel(data);
    } else {
      // broker-delegation-management.js에서 데이터 가져오기
      if (typeof brokerDelegation !== 'undefined' && brokerDelegation.delegationRequests) {
        const request = brokerDelegation.delegationRequests.find(req => req.id === delegationId);
        if (request) {
          showPanel(request);
        }
      }
    }
  }

  function showPanel(data) {
    const nextBuf = currentBuffer === "a" ? "b" : "a";
    const curElems = getElems(currentBuffer);
    const nextElems = getElems(nextBuf);

    renderInto(nextBuf, data);

    // 다음 패널 초기 상태 설정
    if (nextElems.overlay) {
      nextElems.overlay.classList.add("-translate-x-full");
      nextElems.overlay.style.transform = "";
      nextElems.overlay.style.transition = "";
      nextElems.overlay.style.opacity = "0";
      nextElems.overlay.style.pointerEvents = "none";
    } else {
      return;
    }

    // 겹치기: 현재 닫히는 애니메이션 + 다음 열림 애니메이션 동시
    setOverlayVisible(nextElems.overlay, true);
    if (isOpen && curElems.overlay) {
      setOverlayVisible(curElems.overlay, false);
    }

    currentBuffer = nextBuf;
    isOpen = true;

    // 닫기 버튼 이벤트 설정
    if (nextElems.closeBtn) {
      nextElems.closeBtn.onclick = () => closeDelegationDetail();
    }
  }

  function closeDelegationDetail() {
    const el = getElems(currentBuffer);
    setOverlayVisible(el.overlay, false);
    isOpen = false;
    currentDelegationId = null;
  }

  function initDelegationDetailPanel(options = {}) {
    onApproveCallback = options.onApprove || null;
    onRejectCallback = options.onReject || null;

    // 양쪽 버퍼 닫기 버튼 설정
    ["a", "b"].forEach((buf) => {
      const el = getElems(buf);
      if (el.closeBtn) {
        el.closeBtn.onclick = () => closeDelegationDetail();
      }
    });
  }

  // 전역 API 노출
  window.initDelegationDetailPanel = initDelegationDetailPanel;
  window.openDelegationDetail = openDelegationDetail;
  window.closeDelegationDetail = closeDelegationDetail;
})();

