// ============================================================
//  GLOBAL EXPORTS – makes functions available globally for onclick handlers
//  This file re-exports all functions for backward compatibility
// ============================================================

// Re-export from shared
export * from '../shared/state.js';
export * from '../shared/utils.js';

// Re-export from data
export * from '../data/auction-data.js';

// Re-export from admin
export * from '../admin/admin-app.js';

// Re-export from team
export * from '../team/team-panel.js';

// Make available globally for onclick handlers
window.goTo = window.goTo || (() => {});
window.addTeam = window.addTeam || (() => {});
window.removeTeam = window.removeTeam || (() => {});
window.setBudget = window.setBudget || (() => {});
window.startGame = window.startGame || (() => {});
window.renderAuction = window.renderAuction || (() => {});
window.renderTeamsGrid = window.renderTeamsGrid || (() => {});
window.renderBidLog = window.renderBidLog || (() => {});
window.adjustBid = window.adjustBid || (() => {});
window.placeBid = window.placeBid || (() => {});
window.sellItem = window.sellItem || (() => {});
window.skipItem = window.skipItem || (() => {});
window.nextItem = window.nextItem || (() => {});
window.prevItem = window.prevItem || (() => {});
window.openAllTeamPanels = window.openAllTeamPanels || (() => {});
window.openTeamPanel = window.openTeamPanel || (() => {});
window.populateBidTeamSelect = window.populateBidTeamSelect || (() => {});
window.initCityPage = window.initCityPage || (() => {});
window.renderCityMap = window.renderCityMap || (() => {});
window.loadTeamCity = window.loadTeamCity || (() => {});
window.dragItem = window.dragItem || (() => {});
window.dropOnZone = window.dropOnZone || (() => {});
window.updateChecklist = window.updateChecklist || (() => {});
window.initScoringPage = window.initScoringPage || (() => {});
window.computeFinal = window.computeFinal || (() => {});

// Team panel exports
window.tpBoot = window.tpBoot || (() => {});
window.renderSelectScreen = window.renderSelectScreen || (() => {});
window.joinTeam = window.joinTeam || (() => {});
window.renderBidScreen = window.renderBidScreen || (() => {});
window.tpAdjust = window.tpAdjust || (() => {});
window.tpSetBid = window.tpSetBid || (() => {});
window.tpPlaceBid = window.tpPlaceBid || (() => {});
window.toggleInv = window.toggleInv || (() => {});

// State functions are already exported from state.js
window.getState = window.getState || (() => null);
window.setState = window.setState || (() => {});
window.showToast = window.showToast || (() => {});
window.formatL = window.formatL || (() => '');
window.sanitize = window.sanitize || (() => '');
window.shuffle = window.shuffle || (() => []);
window.categoryColor = window.categoryColor || (() => '');

// Initialize globals after all modules load
export function initGlobals() {
  // Admin globals
  window.goTo = goTo;
  window.addTeam = addTeam;
  window.removeTeam = removeTeam;
  window.setBudget = setBudget;
  window.startGame = startGame;
  window.renderAuction = renderAuction;
  window.renderTeamsGrid = renderTeamsGrid;
  window.renderBidLog = renderBidLog;
  window.adjustBid = adjustBid;
  window.placeBid = placeBid;
  window.sellItem = sellItem;
  window.skipItem = skipItem;
  window.nextItem = nextItem;
  window.prevItem = prevItem;
  window.openAllTeamPanels = openAllTeamPanels;
  window.openTeamPanel = openTeamPanel;
  window.populateBidTeamSelect = populateBidTeamSelect;
  window.initCityPage = initCityPage;
  window.renderCityMap = renderCityMap;
  window.loadTeamCity = loadTeamCity;
  window.dragItem = dragItem;
  window.dropOnZone = dropOnZone;
  window.updateChecklist = updateChecklist;
  window.initScoringPage = initScoringPage;
  window.computeFinal = computeFinal;

  // Team globals
  window.tpBoot = tpBoot;
  window.renderSelectScreen = renderSelectScreen;
  window.joinTeam = joinTeam;
  window.renderBidScreen = renderBidScreen;
  window.tpAdjust = tpAdjust;
  window.tpSetBid = tpSetBid;
  window.tpPlaceBid = tpPlaceBid;
  window.toggleInv = toggleInv;
}