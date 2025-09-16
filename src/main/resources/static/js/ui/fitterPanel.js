export function getFilters() {
  const status = document.getElementById('statusFilter')?.value || '';
  return { status };
}