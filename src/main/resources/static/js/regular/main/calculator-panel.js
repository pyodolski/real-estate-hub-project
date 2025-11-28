// 전세가율 계산기 패널
window.CalculatorPanel = (function () {
  // suffix = 'a' | 'b'
  function getElement(suffix) {
    const wrap = document.createElement('div');
    wrap.className = 'space-y-4';

    wrap.innerHTML = `
      <div class="bg-white border border-gray-200 rounded-lg p-4">
        <div class="flex items-center justify-between mb-2">
          <h3 class="font-semibold text-gray-800">전세가율 계산기</h3>
          <span class="text-xs text-gray-400">매물의 전세보증금 / 매매가</span>
        </div>

        <div class="mb-3">
          <label class="block text-sm text-gray-700 mb-1">
            임시 매매가 (선택, 만원 단위)
          </label>
          <div class="flex gap-2">
            <input
              type="text"
              id="jeonse-sale-input-${suffix}"
              class="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="예) 85000 (8억 5천만원)"
            />
            <button
              id="jeonse-calc-btn-${suffix}"
              class="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 whitespace-nowrap"
            >
              계산하기
            </button>
          </div>
          <p class="mt-1 text-xs text-gray-500">
            입력하지 않으면 매물에 저장된 매매가(Property.price)를 사용합니다.
          </p>
        </div>

        <div id="jeonse-result-box-${suffix}" class="mt-4 text-sm text-gray-700">
          <div class="text-gray-500 text-sm">
            아직 계산되지 않았습니다. <span class="text-blue-600 font-medium">[계산하기]</span>를 눌러주세요.
          </div>
        </div>
      </div>
    `;

    const btn   = wrap.querySelector(`#jeonse-calc-btn-${suffix}`);
    const input = wrap.querySelector(`#jeonse-sale-input-${suffix}`);
    const box   = wrap.querySelector(`#jeonse-result-box-${suffix}`);

    async function runCalc(auto = false) {
      // 현재 열려있는 오버레이에서 propertyId 가져오기
      const overlay = document.getElementById(`property-detail-overlay-${suffix}`);
      const propertyId = overlay?.dataset?.propertyId;

      if (!propertyId) {
        box.innerHTML = `<div class="text-red-500 text-sm">매물 ID를 찾을 수 없습니다.</div>`;
        return;
      }

      let salePriceFallback = null;

      // 자동 호출(auto=true)일 때는 입력값 없이 서버 기본 로직 사용
      if (!auto) {
        const raw = (input.value || '').trim();
        if (raw) {
          const num = Number(raw.replace(/,/g, ''));
          if (!Number.isFinite(num) || num <= 0) {
            alert('임시 매매가는 0보다 큰 숫자(만원 단위)로 입력해 주세요.');
            input.focus();
            return;
          }
          // 만원 → 원
          salePriceFallback = num * 10000;
        }
      }

          try {
            let url = `/api/properties/${propertyId}/jeonse-ratio`;
            if (salePriceFallback != null) {
              url += `?salePriceFallback=${salePriceFallback}`;
            }

            box.innerHTML = `
              <div class="flex items-center py-4 text-gray-500">
                <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
                전세가율 계산 중...
              </div>
            `;

            // ----- 응답 처리 -----
            const res  = await fetch(url, {
              method: 'GET',
              headers: { 'Content-Type': 'application/json' },
            });
            const text = await res.text(); // 항상 읽기
            const body = text || "";

            // ----- 예상 가능한 오류 처리 -----
            if (!res.ok) {

              // 1) 매매가 없음 → 임시 매매가 입력 유도
              if (body.includes("매매가(예측가)를 아직 구할 수 없습니다")) {
                box.innerHTML = `
                  <div class="text-sm text-gray-700 space-y-2">
                    <div class="text-red-500 font-medium">매매가(예측가)를 아직 구할 수 없습니다.</div>
                    <div>아래 입력칸에 <span class="font-semibold">임시 매매가(만원 단위)</span>를 입력한 뒤
                    <span class="text-blue-600 font-semibold">[계산하기]</span> 버튼을 눌러 주세요.</div>
                  </div>
                `;
                if (input && !auto) input.focus();
                return;   // ❗ catch 로 가지 않음 → 콘솔 안 찍힘
              }

              // 2) 전세 오퍼 없음 → 계산 불가 안내
              if (body.includes("전세 오퍼가 없습니다")) {
                box.innerHTML = `
                  <div class="text-sm text-gray-700 space-y-2">
                    <div class="text-red-500 font-medium">이 매물에는 전세 오퍼가 없습니다.</div>
                    <div>전세 조건이 등록된 매물에서만 전세가율을 계산할 수 있습니다.</div>
                  </div>
                `;
                return;   // ❗ catch 로 가지 않음 → 콘솔 안 찍힘
              }

              // 위 두 개는 예상 오류니까 catch로 보내지 않음
              // 그 외의 경우만 throw
              throw new Error(body || "전세가율 계산에 실패했습니다.");
            }

            // ----- 성공 처리 -----
            const data = JSON.parse(text);

            const deposit       = data.deposit;
            const salePriceUsed = data.salePriceUsed;
            const ratioPercent  = data.ratioPercent;
            const comment       = data.comment;
            const source        = data.salePriceSource;

            const fmtPrice = (p) =>
              typeof window.formatPrice === 'function'
                ? window.formatPrice(p)
                : Number(p ?? 0).toLocaleString() + '원';

            const ratioText =
              ratioPercent != null
                ? `${Number(ratioPercent).toFixed(2)} %`
                : '-';

            const sourceLabel =
              source === 'PREDICTED'       ? '예측 매매가 사용'
            : source === 'CLIENT_FALLBACK' ? '입력한 임시 매매가 사용'
            : source === 'PROPERTY_PRICE'  ? '매물 기본 매매가 사용'
            : '알 수 없음';

            box.innerHTML = `
              <div class="grid grid-cols-2 gap-3 text-sm">
                <div class="bg-gray-50 rounded-md px-3 py-2">
                  <div class="text-xs text-gray-500">전세보증금</div>
                  <div class="font-semibold text-gray-800">
                    ${fmtPrice(deposit)}
                  </div>
                </div>
                <div class="bg-gray-50 rounded-md px-3 py-2">
                  <div class="text-xs text-gray-500">매매가(계산 기준)</div>
                  <div class="font-semibold text-gray-800">
                    ${fmtPrice(salePriceUsed)}
                  </div>
                </div>
                <div class="bg-blue-50 rounded-md px-3 py-2 col-span-2 flex items-center justify-between">
                  <div>
                    <div class="text-xs text-gray-500">전세가율</div>
                    <div class="text-xl font-bold text-blue-700">
                      ${ratioText}
                    </div>
                  </div>
                  <div class="text-[11px] text-blue-800 bg-blue-100 px-2 py-1 rounded">
                    ${sourceLabel}
                  </div>
                </div>
                <div class="col-span-2 bg-white border border-gray-200 rounded-md px-3 py-2">
                  <div class="text-xs text-gray-500 mb-1">코멘트</div>
                  <div class="text-gray-800 text-sm">${comment || '-'}</div>
                </div>
              </div>
            `;

      } catch (err) {

        console.error("전세가율 계산 실패 (예상치 못한 오류):", err);

        box.innerHTML = `
          <div class="text-sm text-red-500">
            계산 중 오류가 발생했습니다.<br />
            ${(err && err.message) || ""}
          </div>
        `;
      }
    }

    // 버튼 클릭 시 계산
    if (btn) {
      btn.addEventListener('click', () => runCalc(false));
    }

    // 탭 처음 열릴 때 자동 한 번 계산 (매물 기본 매매가 사용)
    setTimeout(() => runCalc(true), 100);

    return wrap;
  }

  return { getElement };
})();