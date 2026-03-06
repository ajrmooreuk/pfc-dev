/**
 * Unit tests for app-skeleton-editor.js — F40.19 Skeleton Editor.
 * Tests reorder, move, undo/redo, export, and edit mode management.
 *
 * Uses mock DOM pattern consistent with pfi-lifecycle-ui.test.js.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Mock DOM ────────────────────────────────────────────────────────────────

const mockElements = {};
function resetMockElements() {
  Object.keys(mockElements).forEach(k => delete mockElements[k]);
}

function createMockElement(id, overrides = {}) {
  const el = {
    id,
    style: {},
    innerHTML: '',
    textContent: '',
    value: '',
    dataset: {},
    classList: {
      _classes: new Set(),
      add(c) { this._classes.add(c); },
      remove(c) { this._classes.delete(c); },
      contains(c) { return this._classes.has(c); },
      toggle(c, force) {
        if (force === undefined) {
          if (this._classes.has(c)) { this._classes.delete(c); return false; }
          this._classes.add(c); return true;
        }
        if (force) { this._classes.add(c); } else { this._classes.delete(c); }
        return force;
      },
    },
    querySelectorAll: vi.fn(() => []),
    querySelector: vi.fn(() => null),
    addEventListener: vi.fn(),
    appendChild: vi.fn(),
    scrollIntoView: vi.fn(),
    remove: vi.fn(),
    click: vi.fn(),
    ...overrides,
  };
  mockElements[id] = el;
  return el;
}

vi.stubGlobal('document', {
  getElementById: vi.fn((id) => mockElements[id] || null),
  querySelector: vi.fn((sel) => {
    if (sel.startsWith('#')) return mockElements[sel.slice(1)] || null;
    return null;
  }),
  querySelectorAll: vi.fn(() => []),
  createElement: vi.fn((tag) => createMockElement('_tmp_' + tag)),
  createComment: vi.fn((text) => ({ nodeType: 8, textContent: text, parentNode: null })),
});

vi.stubGlobal('URL', {
  createObjectURL: vi.fn(() => 'blob:test'),
  revokeObjectURL: vi.fn(),
});

vi.stubGlobal('Blob', class MockBlob {
  constructor(parts, options) {
    this.parts = parts;
    this.options = options;
  }
});

// Mock localStorage
const _lsStore = {};
vi.stubGlobal('localStorage', {
  getItem: vi.fn((key) => _lsStore[key] ?? null),
  setItem: vi.fn((key, val) => { _lsStore[key] = String(val); }),
  removeItem: vi.fn((key) => { delete _lsStore[key]; }),
});
function resetLocalStorage() {
  Object.keys(_lsStore).forEach(k => delete _lsStore[k]);
}

// ─── Mock state ──────────────────────────────────────────────────────────────

vi.mock('../js/state.js', () => ({
  state: {
    appSkeleton: null,
    appSkeletonBase: null,
    navLayerRegistry: new Map(),
    zoneRegistry: new Map(),
    skeletonEditMode: false,
    skeletonDirty: false,
    skeletonUndoStack: [],
    skeletonRedoStack: [],
    skeletonBaselineSnapshot: null,
    skeletonPanelOpen: false,
    skeletonPanelTab: 'zones',
    currentView: 'graph',
  },
}));

vi.mock('../js/app-skeleton-loader.js', () => ({
  buildSkeletonRegistries: vi.fn(),
  getVisibleZones: vi.fn(() => new Map()),
}));

vi.mock('../js/app-skeleton-panel.js', () => ({
  renderSkeletonPanel: vi.fn(),
}));

vi.mock('../js/skeleton-graph.js', () => ({
  refreshSkeletonGraph: vi.fn(),
}));

// ─── Import after mocks ─────────────────────────────────────────────────────

import { state } from '../js/state.js';
import { buildSkeletonRegistries } from '../js/app-skeleton-loader.js';
import { renderSkeletonPanel } from '../js/app-skeleton-panel.js';
import {
  enterSkeletonEditMode, exitSkeletonEditMode,
  reorderNavItem, moveNavItemToLayer, moveLayerToZone,
  reorderZoneComponent, moveZoneComponentToZone,
  undoSkeletonEdit, redoSkeletonEdit,
  exportSkeletonJsonld, serializeSkeletonJsonld,
  getSkeletonEditSummary,
  persistSkeletonToLocalStorage, restoreSkeletonFromLocalStorage,
  clearSkeletonLocalStorage, hasPendingSkeletonEdits,
  addNavItem, removeNavItem,
  addDropdownChild, removeDropdownChild,
  updateNavItemProperty,
  addActionEntity, removeActionEntity,
  reparentDropdownChild, createBlankSkeleton,
  validateZoneId, addZone, removeZone, updateZoneProperty,
} from '../js/app-skeleton-editor.js';

// ─── Test skeleton fixture ──────────────────────────────────────────────────

function buildTestSkeleton() {
  return {
    application: {
      '@id': 'ds:test-app',
      '@type': 'ds:Application',
      'ds:appName': 'Test App',
      'ds:version': 'v1.0.0',
    },
    zones: [
      { '@id': 'ds:zone-Z1', '@type': 'ds:AppZone', 'ds:zoneId': 'Z1', 'ds:zoneName': 'Header' },
      { '@id': 'ds:zone-Z2', '@type': 'ds:AppZone', 'ds:zoneId': 'Z2', 'ds:zoneName': 'Toolbar' },
    ],
    navLayers: [
      { '@id': 'ds:navlayer-L1', '@type': 'ds:NavLayer', 'ds:layerId': 'L1', 'ds:layerName': 'Main', 'ds:layerLevel': 1, 'ds:renderOrder': 1, 'ds:cascadeTier': 'PFC', 'ds:navLayerInZone': { '@id': 'ds:zone-Z2' } },
      { '@id': 'ds:navlayer-L2', '@type': 'ds:NavLayer', 'ds:layerId': 'L2', 'ds:layerName': 'View', 'ds:layerLevel': 2, 'ds:renderOrder': 2, 'ds:cascadeTier': 'PFC', 'ds:navLayerInZone': { '@id': 'ds:zone-Z2' } },
    ],
    navItems: [
      { '@id': 'ds:nav-A', '@type': 'ds:NavItem', 'ds:itemId': 'nav-A', 'ds:label': 'Item A', 'ds:renderOrder': 1, 'ds:belongsToLayer': { '@id': 'ds:navlayer-L1' }, 'ds:cascadeTier': 'PFC' },
      { '@id': 'ds:nav-B', '@type': 'ds:NavItem', 'ds:itemId': 'nav-B', 'ds:label': 'Item B', 'ds:renderOrder': 2, 'ds:belongsToLayer': { '@id': 'ds:navlayer-L1' }, 'ds:cascadeTier': 'PFC' },
      { '@id': 'ds:nav-C', '@type': 'ds:NavItem', 'ds:itemId': 'nav-C', 'ds:label': 'Item C', 'ds:renderOrder': 3, 'ds:belongsToLayer': { '@id': 'ds:navlayer-L1' }, 'ds:cascadeTier': 'PFC' },
      { '@id': 'ds:nav-D', '@type': 'ds:NavItem', 'ds:itemId': 'nav-D', 'ds:label': 'Item D', 'ds:renderOrder': 1, 'ds:belongsToLayer': { '@id': 'ds:navlayer-L2' }, 'ds:cascadeTier': 'PFC' },
    ],
    zoneComponents: [
      { '@id': 'ds:cmp-1', '@type': 'ds:ZoneComponent', 'ds:placementId': 'cmp-1', 'ds:renderOrder': 1, 'ds:placedInZone': { '@id': 'ds:zone-Z1' }, 'ds:placesComponent': { '@id': 'ds:dc-header' }, 'ds:cascadeTier': 'PFC' },
      { '@id': 'ds:cmp-2', '@type': 'ds:ZoneComponent', 'ds:placementId': 'cmp-2', 'ds:renderOrder': 2, 'ds:placedInZone': { '@id': 'ds:zone-Z1' }, 'ds:placesComponent': { '@id': 'ds:dc-stats' }, 'ds:cascadeTier': 'PFC' },
      { '@id': 'ds:cmp-3', '@type': 'ds:ZoneComponent', 'ds:placementId': 'cmp-3', 'ds:renderOrder': 1, 'ds:placedInZone': { '@id': 'ds:zone-Z2' }, 'ds:placesComponent': { '@id': 'ds:dc-toolbar' }, 'ds:cascadeTier': 'PFC' },
    ],
  };
}

function buildMixedTierSkeleton() {
  const base = buildTestSkeleton();
  base.navItems.push(
    { '@id': 'ds:nav-E', '@type': 'ds:NavItem', 'ds:itemId': 'nav-E', 'ds:label': 'PFI Item E', 'ds:renderOrder': 4, 'ds:belongsToLayer': { '@id': 'ds:navlayer-L1' }, 'ds:cascadeTier': 'PFI' },
    { '@id': 'ds:nav-F', '@type': 'ds:NavItem', 'ds:itemId': 'nav-F', 'ds:label': 'PFI Item F', 'ds:renderOrder': 5, 'ds:belongsToLayer': { '@id': 'ds:navlayer-L1' }, 'ds:cascadeTier': 'PFI' },
    { '@id': 'ds:nav-G', '@type': 'ds:NavItem', 'ds:itemId': 'nav-G', 'ds:label': 'PFI Item G', 'ds:renderOrder': 1, 'ds:belongsToLayer': { '@id': 'ds:navlayer-L2' }, 'ds:cascadeTier': 'PFI' },
  );
  // Replace L2 nav-D with PFI tier so move tests work
  base.navItems.find(i => i['ds:itemId'] === 'nav-D')['ds:cascadeTier'] = 'PFI';
  base.zoneComponents.push(
    { '@id': 'ds:cmp-PFI-1', '@type': 'ds:ZoneComponent', 'ds:placementId': 'cmp-PFI-1', 'ds:renderOrder': 3, 'ds:placedInZone': { '@id': 'ds:zone-Z1' }, 'ds:placesComponent': { '@id': 'ds:dc-sidebar' }, 'ds:cascadeTier': 'PFI' },
    { '@id': 'ds:cmp-PFI-2', '@type': 'ds:ZoneComponent', 'ds:placementId': 'cmp-PFI-2', 'ds:renderOrder': 4, 'ds:placedInZone': { '@id': 'ds:zone-Z1' }, 'ds:placesComponent': { '@id': 'ds:dc-footer' }, 'ds:cascadeTier': 'PFI' },
  );
  return base;
}

function resetState() {
  state.appSkeleton = null;
  state.skeletonEditMode = false;
  state.skeletonDirty = false;
  state.skeletonUndoStack = [];
  state.skeletonRedoStack = [];
  state.skeletonBaselineSnapshot = null;
  state.navLayerRegistry = new Map();
  state.zoneRegistry = new Map();
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('app-skeleton-editor', () => {

  beforeEach(() => {
    resetMockElements();
    resetState();
    resetLocalStorage();
    vi.clearAllMocks();
  });

  // ────── Edit mode ──────

  describe('enterSkeletonEditMode', () => {
    it('sets edit mode and captures baseline', () => {
      state.appSkeleton = buildTestSkeleton();
      enterSkeletonEditMode();
      expect(state.skeletonEditMode).toBe(true);
      expect(state.skeletonBaselineSnapshot).toBeTruthy();
      expect(JSON.parse(state.skeletonBaselineSnapshot).application['@id']).toBe('ds:test-app');
    });

    it('does nothing if no skeleton loaded', () => {
      enterSkeletonEditMode();
      expect(state.skeletonEditMode).toBe(false);
    });

    it('does nothing if already in edit mode', () => {
      state.appSkeleton = buildTestSkeleton();
      enterSkeletonEditMode();
      const firstSnapshot = state.skeletonBaselineSnapshot;
      enterSkeletonEditMode();
      expect(state.skeletonBaselineSnapshot).toBe(firstSnapshot);
    });
  });

  describe('exitSkeletonEditMode', () => {
    it('exits edit mode and clears state', () => {
      state.appSkeleton = buildTestSkeleton();
      enterSkeletonEditMode();
      exitSkeletonEditMode(false);
      expect(state.skeletonEditMode).toBe(false);
      expect(state.skeletonBaselineSnapshot).toBeNull();
      expect(state.skeletonUndoStack).toEqual([]);
    });

    it('discards changes and restores baseline', () => {
      state.appSkeleton = buildTestSkeleton();
      enterSkeletonEditMode();

      // Mutate
      state.appSkeleton.navItems[0]['ds:renderOrder'] = 99;

      exitSkeletonEditMode(true);
      expect(state.appSkeleton.navItems[0]['ds:renderOrder']).toBe(1);
    });
  });

  // ────── Nav item reorder ──────

  describe('reorderNavItem', () => {
    it('swaps renderOrder when moving PFI item down', () => {
      state.appSkeleton = buildMixedTierSkeleton();
      state.skeletonEditMode = true;
      reorderNavItem('nav-E', 'down');

      const e = state.appSkeleton.navItems.find(i => i['ds:itemId'] === 'nav-E');
      const f = state.appSkeleton.navItems.find(i => i['ds:itemId'] === 'nav-F');
      expect(e['ds:renderOrder']).toBe(5);
      expect(f['ds:renderOrder']).toBe(4);
    });

    it('swaps renderOrder when moving PFI item up', () => {
      state.appSkeleton = buildMixedTierSkeleton();
      state.skeletonEditMode = true;
      reorderNavItem('nav-F', 'up');

      const e = state.appSkeleton.navItems.find(i => i['ds:itemId'] === 'nav-E');
      const f = state.appSkeleton.navItems.find(i => i['ds:itemId'] === 'nav-F');
      expect(f['ds:renderOrder']).toBe(4);
      expect(e['ds:renderOrder']).toBe(5);
    });

    it('no-op when first item moves up', () => {
      state.appSkeleton = buildTestSkeleton();
      state.skeletonEditMode = true;
      reorderNavItem('nav-A', 'up');
      const a = state.appSkeleton.navItems.find(i => i['ds:itemId'] === 'nav-A');
      expect(a['ds:renderOrder']).toBe(1); // unchanged
    });

    it('no-op when last item moves down', () => {
      state.appSkeleton = buildTestSkeleton();
      state.skeletonEditMode = true;
      reorderNavItem('nav-C', 'down');
      const c = state.appSkeleton.navItems.find(i => i['ds:itemId'] === 'nav-C');
      expect(c['ds:renderOrder']).toBe(3); // unchanged
    });

    it('pushes undo snapshot', () => {
      state.appSkeleton = buildMixedTierSkeleton();
      state.skeletonEditMode = true;
      reorderNavItem('nav-E', 'down');
      expect(state.skeletonUndoStack.length).toBe(1);
      expect(state.skeletonUndoStack[0].operation).toBe('reorderNavItem');
    });

    it('calls buildSkeletonRegistries and renderSkeletonPanel', () => {
      state.appSkeleton = buildMixedTierSkeleton();
      state.skeletonEditMode = true;
      reorderNavItem('nav-E', 'down');
      expect(buildSkeletonRegistries).toHaveBeenCalled();
      expect(renderSkeletonPanel).toHaveBeenCalled();
    });

    it('auto-persists to localStorage after mutation', () => {
      state.appSkeleton = buildMixedTierSkeleton();
      state.skeletonEditMode = true;
      reorderNavItem('nav-E', 'down');
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'oaa-viz-skeleton-edits',
        expect.stringContaining('ds:Application')
      );
    });
  });

  // ────── Nav item move ──────

  describe('moveNavItemToLayer', () => {
    it('moves PFI item to target layer', () => {
      state.appSkeleton = buildMixedTierSkeleton();
      state.skeletonEditMode = true;
      moveNavItemToLayer('nav-E', 'L2');

      const e = state.appSkeleton.navItems.find(i => i['ds:itemId'] === 'nav-E');
      expect(e['ds:belongsToLayer']['@id']).toBe('ds:navlayer-L2');
    });

    it('appends at end of target layer render order', () => {
      state.appSkeleton = buildMixedTierSkeleton();
      state.skeletonEditMode = true;
      moveNavItemToLayer('nav-E', 'L2');

      const e = state.appSkeleton.navItems.find(i => i['ds:itemId'] === 'nav-E');
      // L2 has nav-D (order 1) + nav-G (order 1), max is 1, so next is 2
      expect(e['ds:renderOrder']).toBe(2);
    });

    it('no-op if already in target layer', () => {
      state.appSkeleton = buildTestSkeleton();
      state.skeletonEditMode = true;
      moveNavItemToLayer('nav-A', 'L1');
      expect(state.skeletonUndoStack.length).toBe(0);
    });

    it('no-op if target layer not found', () => {
      state.appSkeleton = buildTestSkeleton();
      state.skeletonEditMode = true;
      moveNavItemToLayer('nav-A', 'L99');
      expect(state.skeletonUndoStack.length).toBe(0);
    });
  });

  // ────── Zone component reorder ──────

  describe('reorderZoneComponent', () => {
    it('swaps renderOrder when moving PFI component down', () => {
      state.appSkeleton = buildMixedTierSkeleton();
      state.skeletonEditMode = true;
      reorderZoneComponent('cmp-PFI-1', 'down');

      const p1 = state.appSkeleton.zoneComponents.find(c => c['ds:placementId'] === 'cmp-PFI-1');
      const p2 = state.appSkeleton.zoneComponents.find(c => c['ds:placementId'] === 'cmp-PFI-2');
      expect(p1['ds:renderOrder']).toBe(4);
      expect(p2['ds:renderOrder']).toBe(3);
    });

    it('no-op when only component in zone moves', () => {
      state.appSkeleton = buildTestSkeleton();
      state.skeletonEditMode = true;
      reorderZoneComponent('cmp-3', 'down'); // only component in Z2
      const c3 = state.appSkeleton.zoneComponents.find(c => c['ds:placementId'] === 'cmp-3');
      expect(c3['ds:renderOrder']).toBe(1);
    });
  });

  // ────── Zone component move ──────

  describe('moveZoneComponentToZone', () => {
    it('moves PFI component to different zone', () => {
      state.appSkeleton = buildMixedTierSkeleton();
      state.skeletonEditMode = true;
      moveZoneComponentToZone('cmp-PFI-1', 'Z2');

      const p1 = state.appSkeleton.zoneComponents.find(c => c['ds:placementId'] === 'cmp-PFI-1');
      expect(p1['ds:placedInZone']['@id']).toBe('ds:zone-Z2');
    });

    it('appends at end of target zone render order', () => {
      state.appSkeleton = buildMixedTierSkeleton();
      state.skeletonEditMode = true;
      moveZoneComponentToZone('cmp-PFI-1', 'Z2');

      const p1 = state.appSkeleton.zoneComponents.find(c => c['ds:placementId'] === 'cmp-PFI-1');
      expect(p1['ds:renderOrder']).toBe(2); // Z2 had cmp-3 at order 1, next is 2
    });

    it('no-op if already in target zone', () => {
      state.appSkeleton = buildTestSkeleton();
      state.skeletonEditMode = true;
      moveZoneComponentToZone('cmp-1', 'Z1');
      expect(state.skeletonUndoStack.length).toBe(0);
    });
  });

  // ────── Undo/Redo ──────

  describe('undo/redo', () => {
    it('undoes a reorder', () => {
      state.appSkeleton = buildMixedTierSkeleton();
      state.skeletonEditMode = true;
      reorderNavItem('nav-E', 'down');
      expect(state.appSkeleton.navItems.find(i => i['ds:itemId'] === 'nav-E')['ds:renderOrder']).toBe(5);

      undoSkeletonEdit();
      expect(state.appSkeleton.navItems.find(i => i['ds:itemId'] === 'nav-E')['ds:renderOrder']).toBe(4);
    });

    it('redoes after undo', () => {
      state.appSkeleton = buildMixedTierSkeleton();
      state.skeletonEditMode = true;
      reorderNavItem('nav-E', 'down');
      undoSkeletonEdit();
      redoSkeletonEdit();
      expect(state.appSkeleton.navItems.find(i => i['ds:itemId'] === 'nav-E')['ds:renderOrder']).toBe(5);
    });

    it('clears redo stack on new mutation', () => {
      state.appSkeleton = buildMixedTierSkeleton();
      state.skeletonEditMode = true;
      reorderNavItem('nav-E', 'down');
      undoSkeletonEdit();
      expect(state.skeletonRedoStack.length).toBe(1);
      reorderNavItem('nav-E', 'down'); // new mutation clears redo
      expect(state.skeletonRedoStack.length).toBe(0);
    });

    it('no-op undo on empty stack', () => {
      state.appSkeleton = buildTestSkeleton();
      undoSkeletonEdit();
      expect(buildSkeletonRegistries).not.toHaveBeenCalled();
    });

    it('no-op redo on empty stack', () => {
      state.appSkeleton = buildTestSkeleton();
      redoSkeletonEdit();
      expect(buildSkeletonRegistries).not.toHaveBeenCalled();
    });
  });

  // ────── Export ──────

  describe('exportSkeletonJsonld', () => {
    it('stamps dateModified on application entity', () => {
      state.appSkeleton = buildTestSkeleton();
      exportSkeletonJsonld();
      expect(state.appSkeleton.application['ds:dateModified']).toBeTruthy();
    });

    it('bumps version if provided', () => {
      state.appSkeleton = buildTestSkeleton();
      exportSkeletonJsonld('v1.1.0');
      expect(state.appSkeleton.application['ds:version']).toBe('v1.1.0');
    });

    it('triggers download with correct filename', () => {
      state.appSkeleton = buildTestSkeleton();
      const tmpLink = createMockElement('_tmp_link');
      tmpLink.click = vi.fn();
      document.createElement.mockReturnValueOnce(tmpLink);
      exportSkeletonJsonld();
      expect(tmpLink.download).toBe('pfc-app-skeleton-v1.0.0.jsonld');
      expect(tmpLink.click).toHaveBeenCalled();
    });

    it('uses bumped version in filename', () => {
      state.appSkeleton = buildTestSkeleton();
      const tmpLink = createMockElement('_tmp_link2');
      tmpLink.click = vi.fn();
      document.createElement.mockReturnValueOnce(tmpLink);
      exportSkeletonJsonld('v2.0.0');
      expect(tmpLink.download).toBe('pfc-app-skeleton-v2.0.0.jsonld');
    });
  });

  // ────── Edit summary ──────

  describe('getSkeletonEditSummary', () => {
    it('returns null when no baseline', () => {
      expect(getSkeletonEditSummary()).toBeNull();
    });

    it('detects renderOrder changes', () => {
      state.appSkeleton = buildTestSkeleton();
      enterSkeletonEditMode();
      state.appSkeleton.navItems[0]['ds:renderOrder'] = 99;
      const summary = getSkeletonEditSummary();
      expect(summary.changeCount).toBeGreaterThan(0);
      expect(summary.changes[0]).toContain('renderOrder');
    });

    it('detects layer move', () => {
      state.appSkeleton = buildTestSkeleton();
      enterSkeletonEditMode();
      state.appSkeleton.navItems[0]['ds:belongsToLayer'] = { '@id': 'ds:navlayer-L2' };
      const summary = getSkeletonEditSummary();
      expect(summary.changes.some(c => c.includes('moved to'))).toBe(true);
    });
  });

  // ────── Serialization ──────

  describe('serializeSkeletonJsonld', () => {
    it('returns null when no skeleton', () => {
      expect(serializeSkeletonJsonld()).toBeNull();
    });

    it('produces valid JSONLD with @context and @graph', () => {
      state.appSkeleton = buildTestSkeleton();
      const json = serializeSkeletonJsonld();
      const parsed = JSON.parse(json);
      expect(parsed['@context']).toBeDefined();
      expect(parsed['@graph']).toBeInstanceOf(Array);
      expect(parsed['@graph'].length).toBe(1 + 2 + 2 + 4 + 3); // app + zones + layers + items + cmps
    });

    it('stamps dateModified', () => {
      state.appSkeleton = buildTestSkeleton();
      serializeSkeletonJsonld();
      expect(state.appSkeleton.application['ds:dateModified']).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  // ────── localStorage persistence ──────

  describe('persistSkeletonToLocalStorage', () => {
    it('saves skeleton to localStorage', () => {
      state.appSkeleton = buildTestSkeleton();
      persistSkeletonToLocalStorage();
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'oaa-viz-skeleton-edits',
        expect.stringContaining('ds:Application')
      );
    });

    it('saves timestamp', () => {
      state.appSkeleton = buildTestSkeleton();
      persistSkeletonToLocalStorage();
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'oaa-viz-skeleton-edits-ts',
        expect.any(String)
      );
    });
  });

  describe('restoreSkeletonFromLocalStorage', () => {
    it('returns false when nothing stored', () => {
      expect(restoreSkeletonFromLocalStorage()).toBe(false);
    });

    it('restores skeleton from localStorage', () => {
      // First persist
      state.appSkeleton = buildTestSkeleton();
      persistSkeletonToLocalStorage();

      // Reset and restore
      state.appSkeleton = null;
      const result = restoreSkeletonFromLocalStorage();
      expect(result).toBe(true);
      expect(state.appSkeleton).not.toBeNull();
      expect(state.appSkeleton.navItems.length).toBe(4);
      expect(buildSkeletonRegistries).toHaveBeenCalled();
    });
  });

  describe('clearSkeletonLocalStorage', () => {
    it('removes cached data', () => {
      state.appSkeleton = buildTestSkeleton();
      persistSkeletonToLocalStorage();
      clearSkeletonLocalStorage();
      expect(localStorage.removeItem).toHaveBeenCalledWith('oaa-viz-skeleton-edits');
      expect(localStorage.removeItem).toHaveBeenCalledWith('oaa-viz-skeleton-edits-ts');
    });
  });

  describe('hasPendingSkeletonEdits', () => {
    it('returns false when empty', () => {
      expect(hasPendingSkeletonEdits()).toBe(false);
    });

    it('returns true after persist', () => {
      state.appSkeleton = buildTestSkeleton();
      persistSkeletonToLocalStorage();
      expect(hasPendingSkeletonEdits()).toBe(true);
    });
  });

  // ────── moveLayerToZone (F40.20 T10-T12) ──────

  describe('moveLayerToZone', () => {
    it('T10: updates layer navLayerInZone property', () => {
      state.appSkeleton = buildTestSkeleton();
      enterSkeletonEditMode();

      const layer = state.appSkeleton.navLayers.find(l => l['ds:layerId'] === 'L1');
      expect(layer['ds:navLayerInZone']['@id']).toBe('ds:zone-Z2');

      moveLayerToZone('L1', 'Z1');

      expect(layer['ds:navLayerInZone']['@id']).toBe('ds:zone-Z1');
    });

    it('T10b: no-ops when layer is already in target zone', () => {
      state.appSkeleton = buildTestSkeleton();
      enterSkeletonEditMode();

      moveLayerToZone('L1', 'Z2'); // already in Z2

      // Undo stack should only have the edit mode entry, not a moveLayerToZone
      const moveEntries = state.skeletonUndoStack.filter(
        e => e.operation === 'moveLayerToZone'
      );
      expect(moveEntries).toHaveLength(0);
    });

    it('T10c: no-ops for unknown layerId', () => {
      state.appSkeleton = buildTestSkeleton();
      enterSkeletonEditMode();

      moveLayerToZone('L99', 'Z1');

      const moveEntries = state.skeletonUndoStack.filter(
        e => e.operation === 'moveLayerToZone'
      );
      expect(moveEntries).toHaveLength(0);
    });

    it('T10d: no-ops for unknown target zoneId', () => {
      state.appSkeleton = buildTestSkeleton();
      enterSkeletonEditMode();

      moveLayerToZone('L1', 'Z99');

      const moveEntries = state.skeletonUndoStack.filter(
        e => e.operation === 'moveLayerToZone'
      );
      expect(moveEntries).toHaveLength(0);
    });

    it('T12: zone assignment survives undo round-trip', () => {
      state.appSkeleton = buildTestSkeleton();
      enterSkeletonEditMode();

      moveLayerToZone('L1', 'Z1');
      const layer = state.appSkeleton.navLayers.find(l => l['ds:layerId'] === 'L1');
      expect(layer['ds:navLayerInZone']['@id']).toBe('ds:zone-Z1');

      undoSkeletonEdit();
      const layerAfterUndo = state.appSkeleton.navLayers.find(l => l['ds:layerId'] === 'L1');
      expect(layerAfterUndo['ds:navLayerInZone']['@id']).toBe('ds:zone-Z2');
    });
  });

  // ─── F40.22 Phase 3: CRUD Mutations ─────────────────────────────────────────

  describe('addNavItem', () => {
    it('creates a new nav item in the specified layer', () => {
      state.appSkeleton = buildTestSkeleton();
      enterSkeletonEditMode();
      const id = addNavItem('L1', 'Button', 'New Item');
      expect(id).toBeTruthy();
      const item = state.appSkeleton.navItems.find(i => (i['ds:itemId'] || i['@id']) === id);
      expect(item).toBeDefined();
      expect(item['ds:label']).toBe('New Item');
      expect(item['ds:itemType']).toBe('Button');
    });

    it('sets renderOrder to max+1 within layer', () => {
      state.appSkeleton = buildTestSkeleton();
      enterSkeletonEditMode();
      addNavItem('L1', 'Button', 'New');
      const items = state.appSkeleton.navItems.filter(
        i => i['ds:belongsToLayer']?.['@id'] === 'ds:navlayer-L1'
      );
      const orders = items.map(i => i['ds:renderOrder']);
      const maxOrder = Math.max(...orders.filter(o => typeof o === 'number'));
      const newItem = items[items.length - 1];
      expect(newItem['ds:renderOrder']).toBe(maxOrder);
    });

    it('initialises empty children for Dropdown type', () => {
      state.appSkeleton = buildTestSkeleton();
      enterSkeletonEditMode();
      const id = addNavItem('L1', 'Dropdown', 'Menu');
      const item = state.appSkeleton.navItems.find(i => (i['ds:itemId'] || i['@id']) === id);
      expect(item['ds:children']).toEqual([]);
    });

    it('pushes undo snapshot', () => {
      state.appSkeleton = buildTestSkeleton();
      enterSkeletonEditMode();
      const undoLen = state.skeletonUndoStack.length;
      addNavItem('L1', 'Button', 'Test');
      expect(state.skeletonUndoStack.length).toBe(undoLen + 1);
    });

    it('returns null if no skeleton loaded', () => {
      state.appSkeleton = null;
      const result = addNavItem('L1', 'Button', 'Nope');
      expect(result).toBeNull();
    });
  });

  describe('removeNavItem', () => {
    it('removes a nav item by ID', () => {
      state.appSkeleton = buildTestSkeleton();
      enterSkeletonEditMode();
      const count = state.appSkeleton.navItems.length;
      removeNavItem('nav-A');
      expect(state.appSkeleton.navItems.length).toBe(count - 1);
      expect(state.appSkeleton.navItems.find(i => i['ds:itemId'] === 'nav-A')).toBeUndefined();
    });

    it('re-sequences renderOrder after removal', () => {
      state.appSkeleton = buildTestSkeleton();
      enterSkeletonEditMode();
      removeNavItem('nav-A');
      const l1Items = state.appSkeleton.navItems
        .filter(i => i['ds:belongsToLayer']?.['@id'] === 'ds:navlayer-L1')
        .sort((a, b) => a['ds:renderOrder'] - b['ds:renderOrder']);
      l1Items.forEach((item, i) => {
        expect(item['ds:renderOrder']).toBe(i + 1);
      });
    });

    it('pushes undo snapshot', () => {
      state.appSkeleton = buildTestSkeleton();
      enterSkeletonEditMode();
      const undoLen = state.skeletonUndoStack.length;
      removeNavItem('nav-B');
      expect(state.skeletonUndoStack.length).toBe(undoLen + 1);
    });

    it('does nothing for non-existent item', () => {
      state.appSkeleton = buildTestSkeleton();
      enterSkeletonEditMode();
      const count = state.appSkeleton.navItems.length;
      removeNavItem('non-existent');
      expect(state.appSkeleton.navItems.length).toBe(count);
    });
  });

  describe('addDropdownChild', () => {
    it('adds a child to a Dropdown item', () => {
      state.appSkeleton = buildTestSkeleton();
      // Add a dropdown item first
      enterSkeletonEditMode();
      const ddId = addNavItem('L1', 'Dropdown', 'Dropdown');
      addDropdownChild(ddId, 'Option 1');
      const dd = state.appSkeleton.navItems.find(i => (i['ds:itemId'] || i['@id']) === ddId);
      expect(dd['ds:children']).toHaveLength(1);
      expect(dd['ds:children'][0]['ds:label']).toBe('Option 1');
    });

    it('inserts at specific position', () => {
      state.appSkeleton = buildTestSkeleton();
      enterSkeletonEditMode();
      const ddId = addNavItem('L1', 'Dropdown', 'DD');
      addDropdownChild(ddId, 'First');
      addDropdownChild(ddId, 'Inserted', 0);
      const dd = state.appSkeleton.navItems.find(i => (i['ds:itemId'] || i['@id']) === ddId);
      expect(dd['ds:children'][0]['ds:label']).toBe('Inserted');
      expect(dd['ds:children'][1]['ds:label']).toBe('First');
    });
  });

  describe('removeDropdownChild', () => {
    it('removes a child by index', () => {
      state.appSkeleton = buildTestSkeleton();
      enterSkeletonEditMode();
      const ddId = addNavItem('L1', 'Dropdown', 'DD');
      addDropdownChild(ddId, 'A');
      addDropdownChild(ddId, 'B');
      removeDropdownChild(ddId, 0);
      const dd = state.appSkeleton.navItems.find(i => (i['ds:itemId'] || i['@id']) === ddId);
      expect(dd['ds:children']).toHaveLength(1);
      expect(dd['ds:children'][0]['ds:label']).toBe('B');
    });
  });

  describe('updateNavItemProperty', () => {
    it('updates a single property on a nav item', () => {
      state.appSkeleton = buildTestSkeleton();
      enterSkeletonEditMode();
      updateNavItemProperty('nav-A', 'ds:label', 'Renamed A');
      const item = state.appSkeleton.navItems.find(i => i['ds:itemId'] === 'nav-A');
      expect(item['ds:label']).toBe('Renamed A');
    });

    it('pushes undo snapshot', () => {
      state.appSkeleton = buildTestSkeleton();
      enterSkeletonEditMode();
      const undoLen = state.skeletonUndoStack.length;
      updateNavItemProperty('nav-B', 'ds:icon', 'search');
      expect(state.skeletonUndoStack.length).toBe(undoLen + 1);
    });

    it('does nothing for non-existent item', () => {
      state.appSkeleton = buildTestSkeleton();
      enterSkeletonEditMode();
      const undoLen = state.skeletonUndoStack.length;
      updateNavItemProperty('fake-item', 'ds:label', 'Nope');
      expect(state.skeletonUndoStack.length).toBe(undoLen);
    });
  });

  describe('addActionEntity', () => {
    it('creates an action entity', () => {
      state.appSkeleton = buildTestSkeleton();
      state.appSkeleton.actions = [];
      enterSkeletonEditMode();
      const id = addActionEntity({ 'ds:functionRef': 'doSomething', 'ds:parameterType': 'None' });
      expect(id).toBeTruthy();
      expect(state.appSkeleton.actions).toHaveLength(1);
      expect(state.appSkeleton.actions[0]['ds:functionRef']).toBe('doSomething');
    });

    it('auto-generates @id', () => {
      state.appSkeleton = buildTestSkeleton();
      state.appSkeleton.actions = [];
      enterSkeletonEditMode();
      const id = addActionEntity({ 'ds:functionRef': 'test' });
      expect(id).toMatch(/^action-/);
    });
  });

  describe('removeActionEntity', () => {
    it('removes action and clears dangling refs', () => {
      state.appSkeleton = buildTestSkeleton();
      state.appSkeleton.actions = [
        { '@id': 'ds:action-X', 'ds:functionRef': 'doX', 'ds:parameterType': 'None' },
      ];
      // Point nav-A at this action
      const itemA = state.appSkeleton.navItems.find(i => i['ds:itemId'] === 'nav-A');
      itemA['ds:executesAction'] = { '@id': 'ds:action-X' };

      enterSkeletonEditMode();
      removeActionEntity('ds:action-X');

      expect(state.appSkeleton.actions).toHaveLength(0);
      expect(itemA['ds:executesAction']).toBeUndefined();
    });
  });

  describe('reparentDropdownChild', () => {
    it('moves a child from one dropdown to another', () => {
      state.appSkeleton = buildTestSkeleton();
      enterSkeletonEditMode();

      // Manually create two dropdown items with known unique IDs to avoid timestamp collisions
      const src = {
        '@id': 'ds:nav-dd-src', '@type': 'ds:NavItem',
        'ds:itemId': 'nav-dd-src', 'ds:label': 'Source', 'ds:itemType': 'Dropdown',
        'ds:renderOrder': 10, 'ds:cascadeTier': 'PFC',
        'ds:belongsToLayer': { '@id': 'ds:navlayer-L1' },
        'ds:children': [{ 'ds:label': 'Moving Child', 'ds:action': 'noop' }],
      };
      const tgt = {
        '@id': 'ds:nav-dd-tgt', '@type': 'ds:NavItem',
        'ds:itemId': 'nav-dd-tgt', 'ds:label': 'Target', 'ds:itemType': 'Dropdown',
        'ds:renderOrder': 11, 'ds:cascadeTier': 'PFC',
        'ds:belongsToLayer': { '@id': 'ds:navlayer-L1' },
        'ds:children': [],
      };
      state.appSkeleton.navItems.push(src, tgt);

      reparentDropdownChild('nav-dd-src', 0, 'nav-dd-tgt');

      expect(src['ds:children']).toHaveLength(0);
      expect(tgt['ds:children']).toHaveLength(1);
      expect(tgt['ds:children'][0]['ds:label']).toBe('Moving Child');
    });
  });

  describe('createBlankSkeleton', () => {
    it('creates a minimal skeleton with 1 zone and 1 layer', () => {
      state.appSkeleton = null;
      createBlankSkeleton();
      expect(state.appSkeleton).toBeDefined();
      expect(state.appSkeleton.application).toBeDefined();
      expect(state.appSkeleton.zones.length).toBeGreaterThanOrEqual(1);
      expect(state.appSkeleton.navLayers.length).toBeGreaterThanOrEqual(1);
      expect(state.appSkeleton.navItems).toEqual([]);
    });

    it('creates empty actions array', () => {
      state.appSkeleton = null;
      createBlankSkeleton();
      expect(state.appSkeleton.actions).toEqual([]);
    });

    it('calls _apply after creation', () => {
      state.appSkeleton = null;
      createBlankSkeleton();
      expect(buildSkeletonRegistries).toHaveBeenCalled();
    });
  });

  // ─── PFC Cascade-Tier Guards (BR-DS-013) ──────────────────────────────────

  describe('PFC cascade-tier guards (outside edit mode)', () => {

    it('reorderNavItem refuses to reorder PFC-tier items when not in edit mode', () => {
      state.appSkeleton = buildTestSkeleton();
      state.skeletonEditMode = false;
      reorderNavItem('nav-A', 'down');
      const a = state.appSkeleton.navItems.find(i => i['ds:itemId'] === 'nav-A');
      expect(a['ds:renderOrder']).toBe(1); // unchanged
      expect(state.skeletonUndoStack.length).toBe(0);
    });

    it('reorderNavItem refuses swap when partner is PFC and not in edit mode', () => {
      state.appSkeleton = buildMixedTierSkeleton();
      state.skeletonEditMode = false;
      // nav-E (PFI, renderOrder 4) trying to swap up with nav-C (PFC, renderOrder 3)
      reorderNavItem('nav-E', 'up');
      const e = state.appSkeleton.navItems.find(i => i['ds:itemId'] === 'nav-E');
      expect(e['ds:renderOrder']).toBe(4); // unchanged — PFC swap partner blocked
      expect(state.skeletonUndoStack.length).toBe(0);
    });

    it('moveNavItemToLayer refuses to move PFC-tier items when not in edit mode', () => {
      state.appSkeleton = buildTestSkeleton();
      state.skeletonEditMode = false;
      moveNavItemToLayer('nav-A', 'L2');
      const a = state.appSkeleton.navItems.find(i => i['ds:itemId'] === 'nav-A');
      expect(a['ds:belongsToLayer']['@id']).toBe('ds:navlayer-L1'); // unchanged
      expect(state.skeletonUndoStack.length).toBe(0);
    });

    it('reorderZoneComponent refuses to reorder PFC-tier components when not in edit mode', () => {
      state.appSkeleton = buildTestSkeleton();
      state.skeletonEditMode = false;
      reorderZoneComponent('cmp-1', 'down');
      const c1 = state.appSkeleton.zoneComponents.find(c => c['ds:placementId'] === 'cmp-1');
      expect(c1['ds:renderOrder']).toBe(1); // unchanged
      expect(state.skeletonUndoStack.length).toBe(0);
    });

    it('reorderZoneComponent refuses swap when partner is PFC and not in edit mode', () => {
      state.appSkeleton = buildMixedTierSkeleton();
      state.skeletonEditMode = false;
      // cmp-PFI-1 (PFI, renderOrder 3) trying to swap up with cmp-2 (PFC, renderOrder 2)
      reorderZoneComponent('cmp-PFI-1', 'up');
      const p1 = state.appSkeleton.zoneComponents.find(c => c['ds:placementId'] === 'cmp-PFI-1');
      expect(p1['ds:renderOrder']).toBe(3); // unchanged — PFC swap partner blocked
      expect(state.skeletonUndoStack.length).toBe(0);
    });

    it('moveZoneComponentToZone refuses to move PFC-tier components when not in edit mode', () => {
      state.appSkeleton = buildTestSkeleton();
      state.skeletonEditMode = false;
      moveZoneComponentToZone('cmp-1', 'Z2');
      const c1 = state.appSkeleton.zoneComponents.find(c => c['ds:placementId'] === 'cmp-1');
      expect(c1['ds:placedInZone']['@id']).toBe('ds:zone-Z1'); // unchanged
      expect(state.skeletonUndoStack.length).toBe(0);
    });
  });

  describe('PFC items editable in skeleton edit mode', () => {

    it('reorderNavItem allows PFC-tier items in edit mode', () => {
      state.appSkeleton = buildTestSkeleton();
      state.skeletonEditMode = true;
      reorderNavItem('nav-A', 'down');
      const a = state.appSkeleton.navItems.find(i => i['ds:itemId'] === 'nav-A');
      expect(a['ds:renderOrder']).toBe(2); // swapped
      expect(state.skeletonUndoStack.length).toBe(1);
    });

    it('moveNavItemToLayer allows PFC-tier items in edit mode', () => {
      state.appSkeleton = buildTestSkeleton();
      state.skeletonEditMode = true;
      moveNavItemToLayer('nav-A', 'L2');
      const a = state.appSkeleton.navItems.find(i => i['ds:itemId'] === 'nav-A');
      expect(a['ds:belongsToLayer']['@id']).toBe('ds:navlayer-L2'); // moved
      expect(state.skeletonUndoStack.length).toBe(1);
    });

    it('reorderZoneComponent allows PFC-tier components in edit mode', () => {
      state.appSkeleton = buildTestSkeleton();
      state.skeletonEditMode = true;
      reorderZoneComponent('cmp-1', 'down');
      const c1 = state.appSkeleton.zoneComponents.find(c => c['ds:placementId'] === 'cmp-1');
      expect(c1['ds:renderOrder']).toBe(2); // swapped
      expect(state.skeletonUndoStack.length).toBe(1);
    });

    it('moveZoneComponentToZone allows PFC-tier components in edit mode', () => {
      state.appSkeleton = buildTestSkeleton();
      state.skeletonEditMode = true;
      moveZoneComponentToZone('cmp-1', 'Z2');
      const c1 = state.appSkeleton.zoneComponents.find(c => c['ds:placementId'] === 'cmp-1');
      expect(c1['ds:placedInZone']['@id']).toBe('ds:zone-Z2'); // moved
      expect(state.skeletonUndoStack.length).toBe(1);
    });
  });

  // ─── PFI-Tier Editability (positive path) ─────────────────────────────────

  describe('PFI-tier items are editable', () => {

    it('allows reorder of PFI nav items', () => {
      state.appSkeleton = buildMixedTierSkeleton();
      state.skeletonEditMode = true;
      reorderNavItem('nav-E', 'down');
      const e = state.appSkeleton.navItems.find(i => i['ds:itemId'] === 'nav-E');
      expect(e['ds:renderOrder']).toBe(5);
      expect(state.skeletonUndoStack.length).toBe(1);
    });

    it('allows moving PFI nav items between layers', () => {
      state.appSkeleton = buildMixedTierSkeleton();
      state.skeletonEditMode = true;
      moveNavItemToLayer('nav-E', 'L2');
      const e = state.appSkeleton.navItems.find(i => i['ds:itemId'] === 'nav-E');
      expect(e['ds:belongsToLayer']['@id']).toBe('ds:navlayer-L2');
      expect(state.skeletonUndoStack.length).toBe(1);
    });

    it('allows reorder of PFI zone components', () => {
      state.appSkeleton = buildMixedTierSkeleton();
      state.skeletonEditMode = true;
      reorderZoneComponent('cmp-PFI-1', 'down');
      const p1 = state.appSkeleton.zoneComponents.find(c => c['ds:placementId'] === 'cmp-PFI-1');
      expect(p1['ds:renderOrder']).toBe(4);
      expect(state.skeletonUndoStack.length).toBe(1);
    });

    it('allows moving PFI components between zones', () => {
      state.appSkeleton = buildMixedTierSkeleton();
      state.skeletonEditMode = true;
      moveZoneComponentToZone('cmp-PFI-1', 'Z2');
      const p1 = state.appSkeleton.zoneComponents.find(c => c['ds:placementId'] === 'cmp-PFI-1');
      expect(p1['ds:placedInZone']['@id']).toBe('ds:zone-Z2');
      expect(state.skeletonUndoStack.length).toBe(1);
    });
  });

  // ─── Zone CRUD (F49.4) ──────────────────────────────────────────────────────

  describe('validateZoneId', () => {
    it('rejects empty/null input', () => {
      expect(validateZoneId(null, [])).toBe('Zone ID is required');
      expect(validateZoneId('', [])).toBe('Zone ID is required');
      expect(validateZoneId(undefined, [])).toBe('Zone ID is required');
    });

    it('rejects PFC reserved IDs (Z1-Z99)', () => {
      expect(validateZoneId('Z1', [])).toMatch(/PFC reserved range/);
      expect(validateZoneId('Z22', [])).toMatch(/PFC reserved range/);
      expect(validateZoneId('Z2a', [])).toMatch(/PFC reserved range/);
      expect(validateZoneId('Z-dyn', [])).toMatch(/PFC reserved range/);
      expect(validateZoneId('Z-admin', [])).toMatch(/PFC reserved range/);
    });

    it('rejects non-PFI patterns', () => {
      expect(validateZoneId('MY-ZONE', [])).toMatch(/must follow PFI pattern/);
      expect(validateZoneId('Z-AB-1', [])).toMatch(/must follow PFI pattern/); // too few digits
      expect(validateZoneId('zone-300', [])).toMatch(/must follow PFI pattern/);
    });

    it('accepts valid PFI zone IDs', () => {
      expect(validateZoneId('Z-WWG-300', [])).toBeNull();
      expect(validateZoneId('Z-BAIV-100', [])).toBeNull();
      expect(validateZoneId('Z-AIRL-001', [])).toBeNull();
    });

    it('rejects duplicate zone IDs', () => {
      const existing = [{ 'ds:zoneId': 'Z-WWG-300' }];
      expect(validateZoneId('Z-WWG-300', existing)).toMatch(/already exists/);
    });
  });

  describe('addZone', () => {
    beforeEach(() => {
      resetState();
      state.appSkeleton = buildTestSkeleton();
      state.skeletonEditMode = true;
    });

    it('returns null when no skeleton loaded', () => {
      state.appSkeleton = null;
      expect(addZone({ zoneId: 'Z-WWG-300', zoneName: 'Test', zoneType: 'content' })).toBeNull();
    });

    it('returns null for missing required fields', () => {
      expect(addZone({ zoneId: 'Z-WWG-300' })).toBeNull();
      expect(addZone({ zoneId: 'Z-WWG-300', zoneName: 'Test' })).toBeNull();
      expect(addZone({})).toBeNull();
    });

    it('rejects PFC-reserved zone IDs', () => {
      expect(addZone({ zoneId: 'Z1', zoneName: 'Bad', zoneType: 'content' })).toBeNull();
    });

    it('adds a valid PFI zone with correct structure', () => {
      const id = addZone({ zoneId: 'Z-WWG-300', zoneName: 'Product Zone', zoneType: 'content' });
      expect(id).toBe('Z-WWG-300');
      const zone = state.appSkeleton.zones.find(z => z['ds:zoneId'] === 'Z-WWG-300');
      expect(zone).toBeTruthy();
      expect(zone['@id']).toBe('ds:zone-Z-WWG-300');
      expect(zone['@type']).toBe('ds:AppZone');
      expect(zone['ds:cascadeTier']).toBe('PFI');
      expect(zone['ds:specStatus']).toBe('planned'); // default
    });

    it('sets v3.1.0 spec bindings when provided', () => {
      addZone({
        zoneId: 'Z-WWG-301', zoneName: 'Epic Zone', zoneType: 'content',
        realizesEpic: 'E-WWG-001',
        gatedByProject: 'PRJ-WWG-Growth-01',
        specStatus: 'in-design',
      });
      const zone = state.appSkeleton.zones.find(z => z['ds:zoneId'] === 'Z-WWG-301');
      expect(zone['ds:realizesEpic']).toBe('E-WWG-001');
      expect(zone['ds:gatedByProject']).toBe('PRJ-WWG-Growth-01');
      expect(zone['ds:specStatus']).toBe('in-design');
    });

    it('pushes an undo entry', () => {
      addZone({ zoneId: 'Z-WWG-300', zoneName: 'Test', zoneType: 'content' });
      expect(state.skeletonUndoStack.length).toBe(1);
    });

    it('rejects duplicate zone IDs', () => {
      addZone({ zoneId: 'Z-WWG-300', zoneName: 'First', zoneType: 'content' });
      const dup = addZone({ zoneId: 'Z-WWG-300', zoneName: 'Duplicate', zoneType: 'content' });
      expect(dup).toBeNull();
    });
  });

  describe('removeZone', () => {
    beforeEach(() => {
      resetState();
      state.appSkeleton = buildTestSkeleton();
      state.skeletonEditMode = true;
      // Add a PFI zone with components
      state.appSkeleton.zones.push({
        '@id': 'ds:zone-Z-WWG-300', '@type': 'ds:AppZone',
        'ds:zoneId': 'Z-WWG-300', 'ds:zoneName': 'PFI Zone', 'ds:cascadeTier': 'PFI',
      });
      state.appSkeleton.zoneComponents.push({
        '@id': 'ds:cmp-pfi-1', '@type': 'ds:ZoneComponent',
        'ds:placementId': 'cmp-pfi-1', 'ds:renderOrder': 1,
        'ds:placedInZone': { '@id': 'ds:zone-Z-WWG-300' }, 'ds:cascadeTier': 'PFI',
      });
    });

    it('returns false when no skeleton loaded', () => {
      state.appSkeleton = null;
      expect(removeZone('Z-WWG-300')).toBe(false);
    });

    it('returns false for non-existent zone', () => {
      expect(removeZone('Z-FAKE-999')).toBe(false);
    });

    it('refuses to remove PFC-tier zones', () => {
      expect(removeZone('Z1')).toBe(false);
      expect(state.skeletonUndoStack.length).toBe(0);
    });

    it('removes PFI zone and cleans up components', () => {
      expect(removeZone('Z-WWG-300')).toBe(true);
      expect(state.appSkeleton.zones.find(z => z['ds:zoneId'] === 'Z-WWG-300')).toBeUndefined();
      expect(state.appSkeleton.zoneComponents.find(c => c['ds:placementId'] === 'cmp-pfi-1')).toBeUndefined();
      expect(state.skeletonUndoStack.length).toBe(1);
    });

    it('clears navLayer references to removed zone', () => {
      // Point a layer to the PFI zone
      state.appSkeleton.navLayers[0]['ds:navLayerInZone'] = { '@id': 'ds:zone-Z-WWG-300' };
      removeZone('Z-WWG-300');
      expect(state.appSkeleton.navLayers[0]['ds:navLayerInZone']).toBeNull();
    });
  });

  describe('updateZoneProperty', () => {
    beforeEach(() => {
      resetState();
      state.appSkeleton = buildTestSkeleton();
      state.skeletonEditMode = true;
      state.appSkeleton.zones.push({
        '@id': 'ds:zone-Z-WWG-300', '@type': 'ds:AppZone',
        'ds:zoneId': 'Z-WWG-300', 'ds:zoneName': 'PFI Zone', 'ds:cascadeTier': 'PFI',
        'ds:specStatus': 'planned',
      });
    });

    it('returns false when no skeleton loaded', () => {
      state.appSkeleton = null;
      expect(updateZoneProperty('Z-WWG-300', 'ds:zoneName', 'New')).toBe(false);
    });

    it('returns false for non-existent zone', () => {
      expect(updateZoneProperty('Z-FAKE-999', 'ds:zoneName', 'New')).toBe(false);
    });

    it('refuses to modify PFC-tier zone outside edit mode', () => {
      state.skeletonEditMode = false;
      expect(updateZoneProperty('Z1', 'ds:zoneName', 'Hacked')).toBe(false);
    });

    it('refuses to change immutable properties', () => {
      expect(updateZoneProperty('Z-WWG-300', '@id', 'hacked')).toBe(false);
      expect(updateZoneProperty('Z-WWG-300', 'ds:zoneId', 'Z-NEW-999')).toBe(false);
      expect(updateZoneProperty('Z-WWG-300', '@type', 'hacked')).toBe(false);
    });

    it('updates mutable properties on PFI zones', () => {
      expect(updateZoneProperty('Z-WWG-300', 'ds:zoneName', 'Renamed Zone')).toBe(true);
      const zone = state.appSkeleton.zones.find(z => z['ds:zoneId'] === 'Z-WWG-300');
      expect(zone['ds:zoneName']).toBe('Renamed Zone');
      expect(state.skeletonUndoStack.length).toBe(1);
    });

    it('updates v3.1.0 spec properties', () => {
      updateZoneProperty('Z-WWG-300', 'ds:specStatus', 'in-dev');
      updateZoneProperty('Z-WWG-300', 'ds:realizesEpic', 'E-WWG-001');
      const zone = state.appSkeleton.zones.find(z => z['ds:zoneId'] === 'Z-WWG-300');
      expect(zone['ds:specStatus']).toBe('in-dev');
      expect(zone['ds:realizesEpic']).toBe('E-WWG-001');
    });
  });

});
