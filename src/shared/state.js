// ============================================================
//  SHARED STATE ENGINE  –  synced via the local server's
//  /api/state endpoint so admin (index.html), team panels
//  (team.html), and join.html all see ONE game state, even
//  when opened on different devices on the same network.
//
//  A localStorage-backed cache is kept as a synchronous read
//  fallback (getState() has always been synchronous), and a
//  BroadcastChannel is still used to sync same-browser tabs
//  instantly while the cross-device sync happens over HTTP.
// ============================================================

const STORE_KEY = 'smartcity_state';
const API_URL = '/api/state';
const POLL_MS = 1200;

export const channel = typeof BroadcastChannel !== 'undefined'
  ? new BroadcastChannel('smartcity')
  : null;

let cache = null;
try { cache = JSON.parse(localStorage.getItem(STORE_KEY)) || null; }
catch { cache = null; }

const listeners = new Set();

// ---------- read / write ----------
// Synchronous, returns the last known state (kept fresh by polling below).
export function getState() {
  return cache;
}

export function setState(s) {
  cache = s;
  try { localStorage.setItem(STORE_KEY, JSON.stringify(s)); } catch { /* ignore quota errors */ }
  if (channel) channel.postMessage({ type: 'STATE_UPDATE' });
  notify();
  pushToServer(s);
}

// Fully discard the current game — clears the in-memory cache, this
// browser's copy, AND the shared server copy. Without the server DELETE
// the old game would simply reappear on the next poll.
export async function clearState() {
  cache = null;
  try { localStorage.removeItem(STORE_KEY); } catch { /* ignore */ }
  if (channel) channel.postMessage({ type: 'STATE_UPDATE' });
  notify();
  try {
    await fetch(API_URL, { method: 'DELETE' });
  } catch (err) {
    console.warn('Could not clear state on server:', err.message);
  }
}

// Subscribe to state changes (fired on local writes, remote polls, and
// same-browser BroadcastChannel messages).
export function onStateChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function notify() {
  listeners.forEach(fn => { try { fn(cache); } catch (err) { console.error(err); } });
}

// ---------- network sync ----------
let pushInFlight = null;
function pushToServer(s) {
  pushInFlight = fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(s),
  }).catch(err => console.warn('Could not sync state to server:', err.message));
  return pushInFlight;
}

async function pullFromServer() {
  try {
    const res = await fetch(API_URL, { cache: 'no-store' });
    if (!res.ok) return;
    const remote = await res.json();
    const remoteStr = JSON.stringify(remote);
    if (remoteStr !== JSON.stringify(cache)) {
      cache = remote;
      try { localStorage.setItem(STORE_KEY, remoteStr); } catch { /* ignore */ }
      notify();
    }
  } catch {
    // Server unreachable (offline, wrong URL, etc.) — keep using cached state.
  }
}

// Poll the server for changes made from other devices.
pullFromServer();
setInterval(pullFromServer, POLL_MS);

// Same-browser tabs still get an instant nudge via BroadcastChannel.
// (addEventListener, not .onmessage, so other modules can also listen.)
if (channel) {
  channel.addEventListener('message', (e) => {
    if (e.data && e.data.type === 'STATE_UPDATE') pullFromServer();
  });
}