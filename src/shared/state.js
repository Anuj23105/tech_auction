// ============================================================
//  SHARED STATE ENGINE  –  localStorage + BroadcastChannel
//  Both admin (index.html) and team (team.html) import this.
// ============================================================

const STORE_KEY = 'smartcity_state';

export const channel = typeof BroadcastChannel !== 'undefined'
  ? new BroadcastChannel('smartcity')
  : null;

// ---------- read / write ----------
export function getState() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY)) || null; }
  catch { return null; }
}

export function setState(s) {
  localStorage.setItem(STORE_KEY, JSON.stringify(s));
  if (channel) channel.postMessage({ type: 'STATE_UPDATE' });
}