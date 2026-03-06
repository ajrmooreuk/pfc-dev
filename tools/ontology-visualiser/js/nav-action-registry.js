/**
 * Navigation Action Registry — F40.20 Dynamic Nav
 *
 * Maps skeleton `ds:action` strings to JavaScript handler functions.
 * Each entry maps an action name (from pfc-app-skeleton JSONLD NavItems)
 * to the existing window-exposed function that performs that action.
 *
 * Supports parameterised actions via colon syntax: "setViewMode:graph"
 * splits into name="setViewMode", param="graph".
 */

import { state } from './state.js';

// ========================================
// ACTION REGISTRY
// ========================================

export const ACTION_REGISTRY = {
  // L1 — Main Capabilities
  toggleOntologyMenu:     () => window.toggleExportMenu?.(),
  toggleAuditPanel:       () => window.toggleAudit?.(),
  toggleLibraryPanel:     () => window.toggleLibrary?.(),
  toggleCategoryPanel:    () => window.toggleCategoryPanel?.(),
  toggleLayerPanel:       () => window.toggleLayerPanel?.(),
  toggleStrategicLensPanel: () => window.toggleStrategicLensPanel?.(),
  toggleExportMenu:       () => window.toggleExportMenu?.(),
  showGlossaryEditor:     () => window.showGlossaryEditorUI?.(),
  openLocalFile:          () => document.getElementById('file-input')?.click(),
  loadFromGitHub:         () => window.loadFromGitHub?.(),
  showURLModal:           () => window.showURLModal?.(),
  openGlobalSearch:       () => window.openGlobalSearch?.(),
  loadAllFromRegistry:    () => window.loadRegistry?.(),
  showCreateOntology:     () => window.showCreateOntologyModal?.(),
  forkOntology:           () => window.showForkModalUI?.(),
  saveToLibrary:          () => window.showSaveToLibrary?.(),

  // L2 — View Controls
  togglePhysics:          () => window.togglePhysics?.(),
  fitGraphToView:         () => window.fitGraph?.(),
  resetGraphView:         () => window.resetGraph?.(),
  toggleDetailsPanel:     () => window.toggleSidebar?.(),
  changeLayout:           (value) => {
    const sel = document.getElementById('layout-select');
    if (sel && value) { sel.value = value; window.changeLayout?.(); }
  },
  fitMermaidView:         () => window.fitMermaid?.(),

  // L3-context — Context/Mode
  switchToRegistryBrowserTab: () => window.switchToRegistryBrowserTab?.(),
  toggleBacklogPanel:     () => window.toggleBacklogPanel?.(),
  toggleMermaidEditor:    () => window.toggleMermaidEditor?.(),

  // L3-admin — Admin/Config
  toggleDSPanel:          () => window.toggleDSPanel?.(),
  toggleTokenMapPanel:    () => window.toggleAdminPanel?.(),
  togglePFCPFIMode:       () => {
    const next = state.contextLevel === 'PFI' ? 'PFC' : 'PFI';
    window.setContextLevel?.(next);
  },
  selectPFIInstance:       (value) => { if (value) window.doPickInstance?.(value); },
  selectBrandVariant:      (value) => { if (value) window.switchDSBrand?.(value); },
  toggleLifecyclePanel:    () => console.log('[nav] Lifecycle panel — pending EMC cascade integration'),
  toggleSnapshotPanel:     () => console.log('[nav] Snapshot panel — pending EMC cascade integration'),
  toggleSkeletonInspector: () => console.log('[nav] Skeleton inspector — pending F40.18'),
  runOAAUpgrade:           () => window.runOAAUpgrade?.(),
  showGitHubSettings:      () => window.showGitHubSettings?.(),
  loadTestData:            () => window.loadTestDataFile?.(),

  // L5 — Authoring Tools
  showEntityEditor:        () => window.showEntityEditorUI?.(),
  showRelationshipEditor:  () => window.showRelationshipEditorUI?.(),
  undoEdit:                () => window.doUndoUI?.(),
  redoEdit:                () => window.doRedoUI?.(),
  showVersionBumpModal:    () => window.showVersionBumpModalUI?.(),
  showRevisionHistory:     () => window.showRevisionHistoryUI?.(),
  saveAuthoring:           () => window.doSaveAuthoredOntology?.(),
  generateWithAI:          () => window.showGenerationModalUI?.(),
  toggleSelectionMode:     () => window.toggleSelectionModeUI?.(),
  exitAuthoringMode:       () => window.exitAuthoringModeUI?.(),

  // L6 — Selection Tools
  selectAllNodes:          () => window.selectAllNodesUI?.(),
  clearSelection:          () => window.clearSelectionUI?.(),
  exportSelectionJSON:     () => window.exportSelectionJSON?.(),
  exportCataloguePDF:      () => window.exportCataloguePDF?.(),
  showSaveSelection:       () => window.showSaveSelectionModalUI?.(),

  // Utility
  noop:                    () => {},
};

// ========================================
// PARAMETERISED ACTION DISPATCH
// ========================================

/**
 * Dispatch a skeleton action string to its handler.
 *
 * Supports simple actions ("toggleAuditPanel") and parameterised
 * actions ("setViewMode:graph" → calls setViewMode with "graph").
 *
 * @param {string} actionString - The ds:action value from the NavItem
 * @param {*} [eventOrValue] - Optional value (e.g. from <select> onchange)
 */
export function dispatchAction(actionString, eventOrValue) {
  if (!actionString || actionString === 'noop') return;

  const colonIdx = actionString.indexOf(':');
  if (colonIdx > 0) {
    const name = actionString.substring(0, colonIdx);
    const param = actionString.substring(colonIdx + 1);

    // setViewMode is the primary parameterised action
    if (name === 'setViewMode') {
      window.setViewMode?.(param);
      return;
    }

    // Generic parameterised dispatch
    const handler = ACTION_REGISTRY[name];
    if (handler) { handler(param); return; }
  }

  // Simple action lookup
  const handler = ACTION_REGISTRY[actionString];
  if (handler) {
    handler(eventOrValue);
  } else {
    console.warn(`[nav] No handler for action: ${actionString}`);
  }
}

// ========================================
// COMPUTED STATE HELPERS
// ========================================

/**
 * Build a state snapshot for visibility condition evaluation.
 * Adds computed properties that the skeleton conditions reference
 * but aren't directly in state.js (e.g. isPFIMode).
 *
 * @returns {Object} State snapshot with computed properties
 */
export function buildStateSnapshot() {
  return {
    currentView: state.activeView || 'graph',
    authoringMode: state.authoringMode || false,
    isPFIMode: state.contextLevel === 'PFI',
    selectedNodes: state.selectedNodeIds ? [...state.selectedNodeIds] : [],
    selectionMode: state.selectionMode || false,
    breadcrumbPath: state.navigationStack || [],
    isDragOver: false,
    ontologyCount: state.loadedOntologies?.size || 0,
  };
}
