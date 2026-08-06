// ============================================================
//  SHARED STATE ENGINE  –  localStorage + BroadcastChannel
//  Both admin (index.html) and team (team.html) import this.
// ============================================================

const STORE_KEY = 'smartcity_state';
const channel   = typeof BroadcastChannel !== 'undefined'
                    ? new BroadcastChannel('smartcity')
                    : null;

// ---------- read / write ----------
function getState() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY)) || null; }
  catch { return null; }
}

function setState(s) {
  localStorage.setItem(STORE_KEY, JSON.stringify(s));
  if (channel) channel.postMessage({ type: 'STATE_UPDATE' });
}

// ---------- helpers shared by both pages ----------
function formatL(lakhs) {
  if (lakhs >= 100) return '₹' + (lakhs / 100).toFixed(lakhs % 100 === 0 ? 0 : 2) + ' Cr';
  return '₹' + lakhs + ' L';
}
function sanitize(str) { return str.replace(/[^a-zA-Z0-9]/g, '_'); }

let _toastTimer = null;
function showToast(msg, duration = 2500) {
  let t = document.getElementById('toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => t.classList.remove('show'), duration);
}

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

function categoryColor(cat) {
  return { Networking:'#3b82f6', Security:'#ef4444', Computing:'#8b5cf6',
           IoT:'#10b981', Power:'#f59e0b', Public:'#ec4899', Special:'#fbbf24' }[cat] || '#6b7280';
}
