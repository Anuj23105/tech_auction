// ============================================================
//  SHARED UTILITIES
//  Helpers used by both admin and team pages
// ============================================================

export function formatL(lakhs) {
  if (lakhs >= 100) return '₹' + (lakhs / 100).toFixed(lakhs % 100 === 0 ? 0 : 2) + ' Cr';
  return '₹' + lakhs + ' L';
}

export function sanitize(str) {
  return str.replace(/[^a-zA-Z0-9]/g, '_');
}

let _toastTimer = null;
export function showToast(msg, duration = 2500) {
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => t.classList.remove('show'), duration);
}

export function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

export function categoryColor(cat) {
  return {
    Networking:'#3b82f6',
    Security:'#ef4444',
    Computing:'#8b5cf6',
    IoT:'#10b981',
    Power:'#f59e0b',
    Public:'#ec4899',
    Special:'#fbbf24'
  }[cat] || '#6b7280';
}