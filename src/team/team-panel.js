// ============================================================
//  TEAM PANEL LOGIC
// ============================================================

import { getState } from '../shared/state.js';
import { formatL, showToast, categoryColor } from '../shared/utils.js';

let myTeamName = null;
let lastItemIdx = -1;
let bidLocked = false;

// ---- boot ----
export function tpBoot() {
  const s = getState();
  if (!s || !s.started) {
    // Show select screen; poll for game start
    renderSelectScreen(s);
    return;
  }
  // If URL has ?team= param, auto-join
  const params = new URLSearchParams(location.search);
  const paramTeam = params.get('team');
  if (paramTeam && s.teams.find(t => t.name === paramTeam)) {
    joinTeam(paramTeam);
    return;
  }
  renderSelectScreen(s);
}

export function renderSelectScreen(s) {
  const btns = document.getElementById('tp-team-buttons');
  if (!s || !s.started) {
    btns.innerHTML = '<p class="tp-waiting">⏳ Waiting for host to start the game…</p>';
    return;
  }
  btns.innerHTML = s.teams.map(t =>
    `<button class="tp-join-btn" onclick="joinTeam('${esc(t.name)}')">${t.name}</button>`
  ).join('');
}

export function joinTeam(name) {
  myTeamName = name;
  document.getElementById('tp-select').classList.remove('active');
  document.getElementById('tp-bid').classList.add('active');
  renderBidScreen();
}

// ---- main render ----
export function renderBidScreen() {
  const s = getState();
  if (!s) return;

  const me = s.teams.find(t => t.name === myTeamName);
  if (!me) return;

  // Header
  document.getElementById('tp-myName').textContent  = me.name;
  document.getElementById('tp-budget').textContent  = formatL(me.budget);
  document.getElementById('tp-itemNum').textContent = `Item ${s.currentItemIdx + 1}/${s.auctionItems.length}`;

  const item = s.auctionItems[s.currentItemIdx];
  if (!item) return;

  // If item changed, reset sold msg
  if (lastItemIdx !== s.currentItemIdx) {
    lastItemIdx = s.currentItemIdx;
    bidLocked = false;
    document.getElementById('tp-soldMsg').classList.add('hidden');
    document.getElementById('tp-submitBid').disabled = false;
    document.getElementById('tp-bidInput').value = Math.max(item.base, s.currentBidAmount + 10);
  }

  // Item card
  document.getElementById('tp-cat').textContent   = item.category;
  document.getElementById('tp-cat').style.background = categoryColor(item.category);
  document.getElementById('tp-emoji').textContent = item.emoji;
  document.getElementById('tp-name').textContent  = item.name;
  document.getElementById('tp-desc').textContent  = item.desc;
  document.getElementById('tp-base').textContent  = formatL(item.base);
  document.getElementById('tp-itemCard').classList.toggle('special-item', !!item.special);

  // Live bid
  document.getElementById('tp-liveBid').textContent    = formatL(s.currentBidAmount);
  document.getElementById('tp-liveBidder').textContent =
    s.currentBidTeam
      ? (s.currentBidTeam === myTeamName ? '🟢 You are winning!' : `⚠️ ${s.currentBidTeam} is leading`)
      : 'No bids yet';

  // Hint
  const minBid = s.currentBidTeam ? s.currentBidAmount + 10 : item.base;
  document.getElementById('tp-hint').textContent = `Minimum bid: ${formatL(minBid)}`;
  document.getElementById('tp-bidInput').min = minBid;

  // If sold
  if (s.soldItemIdx === s.currentItemIdx) {
    bidLocked = true;
    document.getElementById('tp-soldMsg').classList.remove('hidden');
    document.getElementById('tp-submitBid').disabled = true;
  }

  // Inventory
  document.getElementById('tp-invCount').textContent = `(${me.inventory.length} items)`;
  document.getElementById('tp-invList').innerHTML = me.inventory.length
    ? me.inventory.map(i => `<div class="tp-inv-item">${i.emoji} ${i.name} <span class="inv-cat">${i.category}</span></div>`).join('')
    : '<p class="empty-msg">No items yet</p>';

  // Event banner
  const lastEvent = s.lastEvent;
  if (lastEvent && lastEvent.itemIdx === s.currentItemIdx) {
    const ev = document.getElementById('tp-event');
    ev.innerHTML = `<strong>${lastEvent.name}</strong> – ${lastEvent.effect}`;
    ev.classList.remove('hidden');
    ev.classList.add('event-flash');
  }
}

// ---- bid ----
export function tpAdjust(delta) {
  const inp = document.getElementById('tp-bidInput');
  inp.value = Math.max(parseInt(inp.min) || 0, (parseInt(inp.value) || 0) + delta);
}

export function tpSetBid(val) {
  const s = getState();
  const minBid = s ? (s.currentBidTeam ? s.currentBidAmount + 10 : (s.auctionItems[s.currentItemIdx]?.base || 0)) : val;
  document.getElementById('tp-bidInput').value = Math.max(minBid, val);
}

export function tpPlaceBid() {
  if (bidLocked) return;
  const s = getState();
  if (!s || !s.started) return showToast('Game not started yet.', 2000);

  const me = s.teams.find(t => t.name === myTeamName);
  if (!me) return;

  const amount = parseInt(document.getElementById('tp-bidInput').value);
  const minBid = s.currentBidTeam ? s.currentBidAmount + 10 : s.auctionItems[s.currentItemIdx].base;

  if (amount < minBid) return showToast(`Minimum bid is ${formatL(minBid)}`, 2000);
  if (amount > me.budget) return showToast(`You can't afford ${formatL(amount)}!`, 2500);

  // Write bid to shared state
  s.currentBidAmount = amount;
  s.currentBidTeam   = myTeamName;
  s.bidLog = s.bidLog || [];
  s.bidLog.unshift({ team: myTeamName, amount, item: s.auctionItems[s.currentItemIdx].name, ts: Date.now() });
  if (s.bidLog.length > 50) s.bidLog.length = 50;
  setState(s);

  showToast(`✅ Bid placed: ${formatL(amount)}`, 1500);
  document.getElementById('tp-bidInput').value = amount + 10;
  renderBidScreen();
}

// ---- inventory toggle ----
export function toggleInv() {
  const list = document.getElementById('tp-invList');
  const icon = document.getElementById('tp-invToggle');
  list.classList.toggle('hidden');
  icon.textContent = list.classList.contains('hidden') ? '▼' : '▲';
}

// ---- listen for state changes ----
import { channel, setState } from '../shared/state.js';

if (channel) {
  channel.onmessage = (e) => {
    if (e.data.type === 'STATE_UPDATE') {
      const s = getState();
      if (!myTeamName) { renderSelectScreen(s); return; }
      renderBidScreen();
    }
  };
}

// Also poll every 1.5s as fallback (for cross-browser)
setInterval(() => {
  const s = getState();
  if (!myTeamName) { renderSelectScreen(s); }
  else renderBidScreen();
}, 1500);

function esc(s) { return s.replace(/'/g, "\\'"); }