export function renderDetail(d) {
  const el = document.getElementById('detail');
  if (!el) return;
  el.innerHTML = `
    <div><b>${d.title ?? ''}</b></div>
    <div>${d.address ?? ''}</div>
    <div>Status: ${d.status ?? ''} / Price: ${d.price ?? '-'}</div>
    <div>(${Number(d.lat).toFixed(5)}, ${Number(d.lng).toFixed(5)})</div>
  `;
  const btn = document.getElementById('btnFav');
  if (btn) { btn.style.display = 'inline-block'; btn.dataset.id = String(d.id); }
}

export function clearDetail() {
  const el = document.getElementById('detail');
  if (el) el.textContent = '마커를 클릭하세요';
  const btn = document.getElementById('btnFav');
  if (btn) btn.style.display = 'none';
}