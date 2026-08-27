// ============================================================
//  TEAM PANEL ENTRY POINT
// ============================================================

import { tpBoot, renderSelectScreen, joinTeam, renderBidScreen,
         tpAdjust, tpSetBid, tpPlaceBid, toggleInv } from './team/team-panel.js';

// Expose to window for onclick= handlers in team.html
window.tpBoot             = tpBoot;
window.renderSelectScreen = renderSelectScreen;
window.joinTeam           = joinTeam;
window.renderBidScreen    = renderBidScreen;
window.tpAdjust           = tpAdjust;
window.tpSetBid           = tpSetBid;
window.tpPlaceBid         = tpPlaceBid;
window.toggleInv          = toggleInv;

// Boot after DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', tpBoot);
} else {
  tpBoot();
}