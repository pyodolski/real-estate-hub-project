export function iconByStatus(status = 'AVAILABLE', active = false) {
  const s = (status || 'AVAILABLE').toUpperCase();
  const activeCls = active ? 'active ' : '';
  return `<div class="marker-dot ${activeCls}${s}"></div>`;
}