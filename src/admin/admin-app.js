// ============================================================
//  ADMIN APP  –  uses shared state from shared.js
// ============================================================

import { getState, setState } from '../shared/state.js';
import { formatL, sanitize, showToast, categoryColor, shuffle } from '../shared/utils.js';
import { AUCTION_ITEMS, SURPRISE_EVENTS, CITY_ZONES, CITY_REQUIREMENTS } from '../data/auction-data.js';

// ---- NAV ----
export function goTo(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(pageId).classList.add('active');
  if (pageId === 'page-city')    initCityPage();
  if (pageId === 'page-scoring') initScoringPage();
}

// ---- CONNECTION INFO (share-able link, works when WiFi changes per venue) ----
export function openNetworkInfo() {
  document.getElementById('networkInfoModal').classList.remove('hidden');
  loadNetworkInfo();
}

export function closeNetworkInfo() {
  document.getElementById('networkInfoModal').classList.add('hidden');
}

export async function loadNetworkInfo() {
  const list = document.getElementById('networkInfoList');
  list.innerHTML = '<p class="no-teams">Detecting network…</p>';
  try {
    const res = await fetch('/api/network-info', { cache: 'no-store' });
    if (!res.ok) throw new Error('bad response');
    const { port, ips } = await res.json();

    if (!ips || !ips.length) {
      list.innerHTML = '<p class="no-teams">No network adapter detected. Make sure you\'re connected to WiFi.</p>';
      return;
    }

    const firstGoodIdx = ips.findIndex(ip => !ip.likelyVirtual);
    list.innerHTML = ips.map(({ name, address, likelyVirtual }, idx) => {
      const url = `http://${address}:${port}/join.html`;
      const isRecommended = idx === firstGoodIdx;
      return `
        <div class="network-info-card ${isRecommended ? 'recommended' : ''}">
          <div class="network-info-name">${isRecommended ? '✅ Recommended — ' : ''}${sanitize(name)}${likelyVirtual ? ' (virtual adapter, participants likely can\'t reach this)' : ''}</div>
          <div class="network-info-url" id="net-url-${idx}">${url}</div>
          <button class="btn-copy" onclick="copyNetworkUrl(${idx})">📋 Copy Link</button>
        </div>`;
    }).join('');
  } catch {
    list.innerHTML = '<p class="no-teams">⚠️ Could not reach the server. Is it running?</p>';
  }
}

export function copyNetworkUrl(idx) {
  const el = document.getElementById('net-url-' + idx);
  if (!el) return;
  navigator.clipboard.writeText(el.textContent).then(
    () => showToast('✅ Link copied!', 1500),
    () => showToast('Could not copy — select and copy manually.', 2000)
  );
}

// ---- SETUP ----
let setupState = {
  teams: [],
  budgetPerTeam: 1000,
};

export function addTeam() {
  const input = document.getElementById('teamNameInput');
  const name = input.value.trim();
  if (!name) return alert('Enter a team name.');
  if (setupState.teams.find(t => t.name === name)) return alert('Name already used.');
  if (setupState.teams.length >= 15) return alert('Max 15 teams.');
  setupState.teams.push({ name, budget: setupState.budgetPerTeam, inventory: [], bonusPoints: 0, penaltyPoints: 0 });
  input.value = '';
  renderTeamList();
}

export function removeTeam(name) {
  setupState.teams = setupState.teams.filter(t => t.name !== name);
  renderTeamList();
}

function renderTeamList() {
  document.getElementById('teamList').innerHTML = setupState.teams.map((t, i) => `
    <div class="team-chip">
      <span>${i + 1}. ${t.name}</span>
      <button onclick="removeTeam('${t.name}')" class="btn-remove">✕</button>
    </div>`).join('');
}

export function setBudget(btn, val) {
  setupState.budgetPerTeam = val;
  document.querySelectorAll('.budget-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('budgetDisplay').textContent = '₹' + (val / 100) + ' Crore';
}

export function startGame() {
  if (setupState.teams.length < 2) return alert('Add at least 2 teams.');
  const regular = AUCTION_ITEMS.filter(i => !i.special);
  const special  = AUCTION_ITEMS.filter(i =>  i.special);
  const items    = [...shuffle(regular), ...shuffle(special)];

  // Build event trigger points
  const triggers = [];
  for (let i = 8; i < items.length - 4; i += 8 + Math.floor(Math.random() * 3)) triggers.push(i);

  const teams = setupState.teams.map(t => ({
    ...t, budget: setupState.budgetPerTeam, inventory: [], bonusPoints: 0, penaltyPoints: 0
  }));

  const s = {
    started: true,
    teams,
    budgetPerTeam: setupState.budgetPerTeam,
    auctionItems: items,
    currentItemIdx: 0,
    currentBidAmount: items[0].base,
    currentBidTeam: null,
    soldItemIdx: -1,
    triggeredEvents: [],
    eventTriggerPoints: triggers,
    lastEvent: null,
    bidLog: [],
  };
  setState(s);
  renderAuction();
  goTo('page-auction');
}

// ---- AUCTION ----
export function renderAuction() {
  const s = getState();
  if (!s) return;
  const item = s.auctionItems[s.currentItemIdx];
  if (!item) return;

  document.getElementById('itemCounter').textContent = `Item ${s.currentItemIdx + 1} / ${s.auctionItems.length}`;
  document.getElementById('itemCategory').textContent = item.category;
  document.getElementById('itemCategory').style.background = categoryColor(item.category);
  document.getElementById('itemEmoji').textContent = item.emoji;
  document.getElementById('itemName').textContent  = item.name;
  document.getElementById('itemDesc').textContent  = item.desc;
  document.getElementById('basePrice').textContent = formatL(item.base);
  document.getElementById('currentItemCard').classList.toggle('special-item', !!item.special);

  // Reset bid controls to current state
  document.getElementById('currentBid').textContent    = formatL(s.currentBidAmount);
  document.getElementById('currentBidder').textContent = s.currentBidTeam
    ? s.currentBidTeam + ' is winning!'
    : 'No bids yet';

  const minNext = s.currentBidTeam ? s.currentBidAmount + 10 : item.base;
  document.getElementById('bidAmount').value = minNext;

  renderTeamsGrid();
  checkEventTrigger();
  renderBidLog();

  // Show sold banner if needed
  const soldBanner = document.getElementById('soldBanner');
  if (s.soldItemIdx === s.currentItemIdx && s.soldTo) {
    soldBanner.textContent = `✅ SOLD to ${s.soldTo} for ${formatL(s.soldAmount)}`;
    soldBanner.classList.remove('hidden');
  } else {
    soldBanner.classList.add('hidden');
  }
}

function checkEventTrigger() {
  const s = getState();
  if (!s) return;
  if (!s.eventTriggerPoints.includes(s.currentItemIdx)) return;
  if (s.triggeredEvents.find(e => e.itemIdx === s.currentItemIdx)) return;

  const remaining = SURPRISE_EVENTS.filter(e => !s.triggeredEvents.find(te => te.eventId === e.id));
  if (!remaining.length) return;

  const event = remaining[Math.floor(Math.random() * remaining.length)];
  s.triggeredEvents.push({ eventId: event.id, itemIdx: s.currentItemIdx });
  s.lastEvent = { ...event, itemIdx: s.currentItemIdx };

  // Apply effects
  s.teams.forEach(t => {
    const inv = t.inventory.map(i => i.id);
    if (event.penaltyIf && event.penaltyIf(inv)) t.penaltyPoints = (t.penaltyPoints || 0) + event.penaltyPoints;
    if (event.bonusIf  && event.bonusIf(inv))  t.bonusPoints  = (t.bonusPoints  || 0) + event.bonusPoints;
  });
  setState(s);

  const banner = document.getElementById('eventBanner');
  banner.innerHTML = `
    <div class="event-icon">${event.icon}</div>
    <div class="event-text">
      <strong>${event.name}</strong>
      <span>${event.desc}</span>
      <em>${event.effect}</em>
    </div>
    <button onclick="this.parentElement.classList.add('hidden')">✕</button>`;
  banner.classList.remove('hidden');
  showToast(event.name + ' – ' + event.effect, 5000);
}

export function renderTeamsGrid() {
  const s = getState();
  if (!s) return;
  document.getElementById('teamsGrid').innerHTML = s.teams.map(t => `
    <div class="team-tile ${s.currentBidTeam === t.name ? 'winning-bidder' : ''}">
      <div class="tile-name">${t.name}</div>
      <div class="tile-budget">${formatL(t.budget)}</div>
      <div class="tile-items">${t.inventory.length} items</div>
      ${t.penaltyPoints ? `<div class="tile-penalty">−${t.penaltyPoints} pts</div>` : ''}
      ${t.bonusPoints   ? `<div class="tile-bonus">+${t.bonusPoints} pts</div>`   : ''}
    </div>`).join('');
}

export function renderBidLog() {
  const s = getState();
  if (!s) return;
  const log = document.getElementById('bidLog');
  if (!log) return;
  const bids = (s.bidLog || []).slice(0, 12);
  log.innerHTML = bids.length
    ? bids.map(b => `<div class="log-row"><span class="log-team">${b.team}</span> bid <span class="log-amt">${formatL(b.amount)}</span> on <span class="log-item">${b.item}</span></div>`).join('')
    : '<p class="log-empty">No bids yet</p>';
}

// ---- ADMIN BID (fallback for host to bid on behalf) ----
export function adjustBid(delta) {
  const inp = document.getElementById('bidAmount');
  const s = getState();
  const min = s ? (s.currentBidTeam ? s.currentBidAmount + 10 : (s.auctionItems[s.currentItemIdx]?.base || 0)) : 0;
  inp.value = Math.max(min, (parseInt(inp.value) || 0) + delta);
}

export function placeBid() {
  const s = getState();
  if (!s) return;
  const teamName = document.getElementById('bidTeamSelect').value;
  const amount   = parseInt(document.getElementById('bidAmount').value);
  const team     = s.teams.find(t => t.name === teamName);
  if (!team) return;
  const minBid = s.currentBidTeam ? s.currentBidAmount + 10 : s.auctionItems[s.currentItemIdx].base;
  if (amount < minBid) return showToast(`Minimum bid is ${formatL(minBid)}`, 2000);
  if (amount > team.budget) return showToast(`${teamName} can't afford ${formatL(amount)}!`, 2000);

  s.currentBidAmount = amount;
  s.currentBidTeam   = teamName;
  s.bidLog = s.bidLog || [];
  s.bidLog.unshift({ team: teamName, amount, item: s.auctionItems[s.currentItemIdx].name, ts: Date.now() });
  setState(s);
  renderAuction();
  showToast(`🔨 ${teamName} bids ${formatL(amount)}`, 1500);
}

export function sellItem() {
  const s = getState();
  if (!s) return;
  if (!s.currentBidTeam) return showToast('No bids placed!', 2000);
  const item = s.auctionItems[s.currentItemIdx];
  const team = s.teams.find(t => t.name === s.currentBidTeam);
  team.budget -= s.currentBidAmount;
  team.inventory.push(item);
  if (item.special && item.bonus) {
    if (item.bonus.type === 'money')  team.budget += item.bonus.value;
    if (item.bonus.type === 'points') team.bonusPoints = (team.bonusPoints || 0) + item.bonus.value;
  }
  s.soldItemIdx = s.currentItemIdx;
  s.soldTo      = s.currentBidTeam;
  s.soldAmount  = s.currentBidAmount;
  setState(s);
  showToast(`✅ SOLD! ${item.name} → ${s.currentBidTeam} for ${formatL(s.currentBidAmount)}`, 2500);
  renderAuction();
  setTimeout(nextItem, 1500);
}

export function skipItem() {
  const s = getState();
  showToast(`⏭ ${s.auctionItems[s.currentItemIdx].name} skipped.`, 1500);
  nextItem();
}

export function nextItem() {
  const s = getState();
  if (!s) return;
  if (s.currentItemIdx < s.auctionItems.length - 1) {
    s.currentItemIdx++;
    s.currentBidAmount = s.auctionItems[s.currentItemIdx].base;
    s.currentBidTeam   = null;
    s.soldItemIdx      = -1;
    s.soldTo           = null;
    setState(s);
    renderAuction();
  } else {
    showToast('🎉 Auction complete!', 3000);
  }
}

export function prevItem() {
  const s = getState();
  if (!s || s.currentItemIdx <= 0) return;
  s.currentItemIdx--;
  s.currentBidAmount = s.auctionItems[s.currentItemIdx].base;
  s.currentBidTeam   = null;
  s.soldItemIdx      = -1;
  setState(s);
  renderAuction();
}

// ---- TEAM PANELS ----
export function openAllTeamPanels() {
  const s = getState();
  if (!s) return;
  s.teams.forEach(t => {
    window.open(`team.html?team=${encodeURIComponent(t.name)}`, `team_${sanitize(t.name)}`);
  });
}

export function openTeamPanel(name) {
  window.open(`team.html?team=${encodeURIComponent(name)}`, `team_${sanitize(name)}`);
}

// ---- POPULATE TEAM SELECT ----
export function populateBidTeamSelect() {
  const s = getState();
  if (!s) return;
  const sel = document.getElementById('bidTeamSelect');
  const cur = sel.value;
  sel.innerHTML = s.teams.map(t =>
    `<option value="${t.name}" ${t.name === cur ? 'selected':''}>${t.name} (${formatL(t.budget)})</option>`
  ).join('');
}

// ---- CITY PAGE ----
export function initCityPage() {
  const s = getState();
  if (!s) return;
  const sel = document.getElementById('cityTeamSelect');
  sel.innerHTML = s.teams.map(t => `<option value="${t.name}">${t.name}</option>`).join('');
  renderCityMap();
  loadTeamCity();
}

export function renderCityMap() {
  const map = document.getElementById('cityMap');
  map.innerHTML = CITY_ZONES.map(z => `
    <div class="zone" id="zone-${z.id}"
         style="left:${z.x}%;top:${z.y}%;width:${z.w}%;height:${z.h}%"
         ondragover="event.preventDefault()"
         ondrop="dropOnZone(event,'${z.id}')">
      <span class="zone-emoji">${z.emoji}</span>
      <span class="zone-name">${z.name}</span>
      <div class="zone-items" id="zone-items-${z.id}"></div>
    </div>`).join('');
}

export function loadTeamCity() {
  const s = getState();
  if (!s) return;
  const teamName = document.getElementById('cityTeamSelect').value;
  const team = s.teams.find(t => t.name === teamName);
  if (!team) return;
  document.getElementById('invBudget').textContent = `Remaining: ${formatL(team.budget)}`;
  document.getElementById('inventoryList').innerHTML = team.inventory.length
    ? team.inventory.map(item => `
        <div class="inv-item" draggable="true" ondragstart="dragItem(event,'${item.id}','${teamName}')">
          ${item.emoji} ${item.name} <span class="inv-cat">${item.category}</span>
        </div>`).join('')
    : '<p class="empty-msg">No items purchased.</p>';
  updateChecklist(teamName);
}

export function dragItem(event, itemId, teamName) {
  event.dataTransfer.setData('itemId', itemId);
  event.dataTransfer.setData('teamName', teamName);
}

export function dropOnZone(event, zoneId) {
  event.preventDefault();
  const itemId = event.dataTransfer.getData('itemId');
  const item   = AUCTION_ITEMS.find(i => i.id === itemId);
  const zoneEl = document.getElementById('zone-items-' + zoneId);
  if (!item || !zoneEl) return;
  const chip = document.createElement('div');
  chip.className = 'zone-chip';
  chip.textContent = item.emoji + ' ' + item.name.split(' ')[0];
  zoneEl.appendChild(chip);
}

export function updateChecklist(teamName) {
  const s = getState();
  if (!s) return;
  const team = s.teams.find(t => t.name === teamName);
  const invIds = team ? team.inventory.map(i => i.id) : [];
  document.getElementById('cityChecklist').innerHTML = CITY_REQUIREMENTS.map(req => {
    const met = req.needs.some(n => invIds.includes(n));
    return `<div class="check-item ${met ? 'met' : 'unmet'}">${met ? '✅' : '❌'} ${req.label}</div>`;
  }).join('');
}

// ---- SCORING ----
export function initScoringPage() {
  const s = getState();
  if (!s) return;
  document.getElementById('scoreCards').innerHTML = s.teams.map(t => `
    <div class="score-entry-card">
      <h3>${t.name}</h3>
      <div class="score-fields">
        ${[['Auction Strategy (0–20)','auction',20],['Budget Mgmt (0–15)','budget',15],
           ['Tech Usage (0–20)','techuse',20],['City Design (0–20)','design',20],
           ['Innovation (0–10)','innovation',10],['Presentation (0–10)','present',10],
           ['Teamwork (0–5)','teamwork',5]].map(([l,k,m]) => `
          <div class="score-row">
            <label>${l}</label>
            <input type="number" min="0" max="${m}" value="0" id="score-${sanitize(t.name)}-${k}"/>
          </div>`).join('')}
      </div>
      <div class="score-auto">
        <span>Bonuses: <strong>+${t.bonusPoints || 0}</strong></span>
        <span>Penalties: <strong>−${t.penaltyPoints || 0}</strong></span>
      </div>
    </div>`).join('');
}

export function computeFinal() {
  const s = getState();
  if (!s) return;
  const results = s.teams.map(t => {
    const keys = ['auction','budget','techuse','design','innovation','present','teamwork'];
    const judged = keys.reduce((sum, k) => {
      const el = document.getElementById(`score-${sanitize(t.name)}-${k}`);
      return sum + (el ? parseInt(el.value) || 0 : 0);
    }, 0);
    const total = judged + (t.bonusPoints || 0) - (t.penaltyPoints || 0);
    return { name: t.name, judged, bonus: t.bonusPoints || 0, penalty: t.penaltyPoints || 0, total };
  }).sort((a, b) => b.total - a.total);

  const lb = document.getElementById('leaderboard');
  lb.innerHTML = `<h3>🏆 Final Leaderboard</h3>
    <table class="lb-table">
      <thead><tr><th>Rank</th><th>Team</th><th>Judge</th><th>Bonus</th><th>Penalty</th><th>Total</th></tr></thead>
      <tbody>${results.map((r, i) => `
        <tr class="${i===0?'rank-gold':i===1?'rank-silver':i===2?'rank-bronze':''}">
          <td>${i===0?'🥇':i===1?'🥈':i===2?'🥉':i+1}</td>
          <td><strong>${r.name}</strong></td><td>${r.judged}</td>
          <td class="green">+${r.bonus}</td><td class="red">−${r.penalty}</td>
          <td><strong>${r.total}</strong></td>
        </tr>`).join('')}
      </tbody></table>`;
  lb.classList.remove('hidden');
  lb.scrollIntoView({ behavior: 'smooth' });
  if (results[0]) showToast(`🏆 Winner: ${results[0].name} with ${results[0].total} pts!`, 5000);
}