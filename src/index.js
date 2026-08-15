// ============================================================
//  ADMIN APP ENTRY POINT
// ============================================================

import { initGlobals } from './lib/exports.js';
import { getState } from './shared/state.js';
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
      localStorage.removeItem('smartcity_state');
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
import { channel } from './shared/state.js';

if (channel) {
  channel.onmessage = (e) => {
    if (e.data.type === 'STATE_UPDATE') {
      const page = document.querySelector('.page.active');
      if (page && page.id === 'page-auction') {
        renderAuction();
        window.populateBidTeamSelect();
      }
    }
  };
}

// Poll fallback
setInterval(() => {
  const page = document.querySelector('.page.active');
  if (page && page.id === 'page-auction') {
    renderAuction();
    window.populateBidTeamSelect();
  }
}, 1500);