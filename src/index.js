// ============================================================
//  ADMIN APP ENTRY POINT
// ============================================================

import { initGlobals } from './lib/exports.js';
import { getState, clearState } from './shared/state.js';
import { goTo, renderAuction } from './admin/admin-app.js';

// Initialize globals for onclick handlers
initGlobals();

// ---- DOMContentLoaded ----
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('teamNameInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') window.addTeam();
  });

  // Check if a game was already in progress
  const s = getState();
  if (s && s.started) {
    // Offer to resume
    if (confirm('A game is already in progress. Resume it?')) {
      renderAuction();
      goTo('page-auction');
    } else {
      // Must clear the SERVER copy too, otherwise the discarded game
      // reappears on the next poll (and on every team's device).
      clearState();
    }
  }

  // Render team launch buttons after DOM ready
  const origRender = window.renderTeamsGrid;
  window.renderTeamsGrid = function() {
    origRender();
    const state = getState();
    if (!state) return;
    document.getElementById('team-launch-btns').innerHTML = state.teams.map(t =>
      `<button class="btn-team-launch" onclick="openTeamPanel('${t.name.replace(/'/g,"\\'")}')">
        📱 ${t.name}
      </button>`
    ).join('');
  };
});

// ---- Listen for team bids ----
import { channel, onStateChange } from './shared/state.js';

function refreshAuctionIfActive() {
  const page = document.querySelector('.page.active');
  if (page && page.id === 'page-auction') {
    renderAuction();
    window.populateBidTeamSelect();
  }
}

if (channel) {
  channel.addEventListener('message', (e) => {
    if (e.data.type === 'STATE_UPDATE') refreshAuctionIfActive();
  });
}

// Fires whenever state changes locally OR is pulled from the server
// (i.e. a team bidding from another device shows up here too).
onStateChange(refreshAuctionIfActive);

