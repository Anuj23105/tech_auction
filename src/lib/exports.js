// ============================================================
//  GLOBAL EXPORTS – makes functions available globally for onclick handlers
// ============================================================

// Import everything explicitly so they are in scope for initGlobals
import { getState, setState, clearState, channel, onStateChange } from '../shared/state.js';
import { formatL, sanitize, showToast, categoryColor, shuffle } from '../shared/utils.js';
import { AUCTION_ITEMS, SURPRISE_EVENTS, CITY_ZONES, CITY_REQUIREMENTS } from '../data/auction-data.js';
import {
  goTo, addTeam, removeTeam, setBudget, startGame,
  renderAuction, renderTeamsGrid, renderBidLog,
  adjustBid, placeBid, sellItem, skipItem, nextItem, prevItem,
  openAllTeamPanels, openTeamPanel, populateBidTeamSelect,
  initCityPage, renderCityMap, loadTeamCity,
  dragItem, dropOnZone, updateChecklist,
  initScoringPage, computeFinal,
  openNetworkInfo, closeNetworkInfo, loadNetworkInfo, copyNetworkUrl
} from '../admin/admin-app.js';
import {
  tpBoot, renderSelectScreen, joinTeam, renderBidScreen,
  tpAdjust, tpSetBid, tpPlaceBid, toggleInv
} from '../team/team-panel.js';

// Re-export everything for module consumers
export {
  getState, setState, clearState, channel, onStateChange,
  formatL, sanitize, showToast, categoryColor, shuffle,
  AUCTION_ITEMS, SURPRISE_EVENTS, CITY_ZONES, CITY_REQUIREMENTS,
  goTo, addTeam, removeTeam, setBudget, startGame,
  renderAuction, renderTeamsGrid, renderBidLog,
  adjustBid, placeBid, sellItem, skipItem, nextItem, prevItem,
  openAllTeamPanels, openTeamPanel, populateBidTeamSelect,
  initCityPage, renderCityMap, loadTeamCity,
  dragItem, dropOnZone, updateChecklist,
  initScoringPage, computeFinal,
  openNetworkInfo, closeNetworkInfo, loadNetworkInfo, copyNetworkUrl,
  tpBoot, renderSelectScreen, joinTeam, renderBidScreen,
  tpAdjust, tpSetBid, tpPlaceBid, toggleInv
};

// Initialize globals — assign real functions to window for onclick= handlers
export function initGlobals() {
  // Admin globals
  window.goTo                = goTo;
  window.addTeam             = addTeam;
  window.removeTeam          = removeTeam;
  window.setBudget           = setBudget;
  window.startGame           = startGame;
  window.renderAuction       = renderAuction;
  window.renderTeamsGrid     = renderTeamsGrid;
  window.renderBidLog        = renderBidLog;
  window.adjustBid           = adjustBid;
  window.placeBid            = placeBid;
  window.sellItem            = sellItem;
  window.skipItem            = skipItem;
  window.nextItem            = nextItem;
  window.prevItem            = prevItem;
  window.openAllTeamPanels   = openAllTeamPanels;
  window.openTeamPanel       = openTeamPanel;
  window.populateBidTeamSelect = populateBidTeamSelect;
  window.initCityPage        = initCityPage;
  window.renderCityMap       = renderCityMap;
  window.loadTeamCity        = loadTeamCity;
  window.dragItem            = dragItem;
  window.dropOnZone          = dropOnZone;
  window.updateChecklist     = updateChecklist;
  window.initScoringPage     = initScoringPage;
  window.computeFinal        = computeFinal;
  window.openNetworkInfo     = openNetworkInfo;
  window.closeNetworkInfo    = closeNetworkInfo;
  window.loadNetworkInfo     = loadNetworkInfo;
  window.copyNetworkUrl      = copyNetworkUrl;

  // Shared utils
  window.getState            = getState;
  window.setState            = setState;
  window.clearState          = clearState;
  window.onStateChange       = onStateChange;
  window.showToast           = showToast;
  window.formatL             = formatL;
  window.sanitize            = sanitize;
  window.shuffle             = shuffle;
  window.categoryColor       = categoryColor;

  // Team globals
  window.tpBoot              = tpBoot;
  window.renderSelectScreen  = renderSelectScreen;
  window.joinTeam            = joinTeam;
  window.renderBidScreen     = renderBidScreen;
  window.tpAdjust            = tpAdjust;
  window.tpSetBid            = tpSetBid;
  window.tpPlaceBid          = tpPlaceBid;
  window.toggleInv           = toggleInv;
}