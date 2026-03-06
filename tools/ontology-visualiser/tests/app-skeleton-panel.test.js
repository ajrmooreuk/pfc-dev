/**
 * Unit tests for app-skeleton-panel.js — Z22 App Skeleton Inspector Panel.
 * Tests toggle, tab switching, spatial diagram, zones tab, functions tab, nav tab.
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
    remove: vi.fn(() => { delete mockElements[id]; }),
    ...overrides,
  };
  mockElements[id] = el;
  return el;
}

vi.stubGlobal('document', {
  getElementById: vi.fn((id) => mockElements[id] || null),
  querySelectorAll: vi.fn(() => []),
  querySelector: vi.fn(() => null),
  createElement: vi.fn((tag) => ({
    style: {}, innerHTML: '', textContent: '',
    classList: { add: vi.fn(), remove: vi.fn(), contains: vi.fn(), toggle: vi.fn() },
    addEventListener: vi.fn(),
    appendChild: vi.fn(),
  })),
});

// ─── Mock state ──────────────────────────────────────────────────────────────

vi.mock('../js/state.js', () => ({
  state: {
    appSkeleton: null,
    appSkeletonBase: null,
    navLayerRegistry: new Map(),
    zoneRegistry: new Map(),
    skeletonSource: null,
    skeletonPanelOpen: false,
    skeletonPanelTab: 'zones',
    skeletonEditMode: false,
    currentView: 'graph',
    isPFIMode: false,
    _skeletonSelectedNode: null,
  },
}));

// Mock app-skeleton-loader.js
vi.mock('../js/app-skeleton-loader.js', () => ({
  getVisibleZones: vi.fn(() => new Map()),
}));

import {
  toggleSkeletonPanel,
  switchSkeletonTab,
  renderSkeletonPanel,
  renderSpatialDiagram,
  renderZonesTab,
  renderFunctionsTab,
  renderNavTab,
  showPropertiesForNode,
  renderPropertiesTab,
} from '../js/app-skeleton-panel.js';

import { state } from '../js/state.js';
import { getVisibleZones } from '../js/app-skeleton-loader.js';

// --- Fixtures ---

function makeZoneEntry(id, name, type, visible, tier) {
  return {
    zone: {
      '@id': `ds:zone-${id}`,
      '@type': 'ds:AppZone',
      'ds:zoneId': id,
      'ds:zoneName': name,
      'ds:zoneType': type || 'Fixed',
      'ds:position': 'top',
      'ds:defaultWidth': '100%',
      'ds:defaultVisible': visible !== false,
      'ds:visibilityCondition': null,
      'ds:zIndex': 100,
      'ds:cascadeTier': tier || 'PFC',
    },
    components: [],
  };
}

function makeNavLayerEntry(id, name, level, items) {
  return {
    layer: {
      '@id': `ds:navlayer-${id}`,
      '@type': 'ds:NavLayer',
      'ds:layerId': id,
      'ds:layerName': name,
      'ds:layerLevel': level,
      'ds:renderOrder': level,
      'ds:cascadeTier': 'PFC',
    },
    items: items || [],
  };
}

function makeNavItem(id, label, itemType, action, tier) {
  return {
    '@id': `ds:nav-${id}`,
    '@type': 'ds:NavItem',
    'ds:itemId': id,
    'ds:label': label,
    'ds:itemType': itemType || 'Button',
    'ds:action': action || 'noop',
    'ds:shortcut': null,
    'ds:visibilityCondition': null,
    'ds:renderOrder': 1,
    'ds:cascadeTier': tier || 'PFC',
  };
}

function makeComponent(placementId, slot, zone, tier) {
  return {
    '@id': `ds:${placementId}`,
    '@type': 'ds:ZoneComponent',
    'ds:placementId': placementId,
    'ds:renderOrder': 1,
    'ds:slotName': slot,
    'ds:tokenOverrides': null,
    'ds:visibilityCondition': null,
    'ds:cascadeTier': tier || 'PFC',
    'ds:placedInZone': { '@id': `ds:zone-${zone}` },
    'ds:placesComponent': { '@id': `ds:dc-${placementId}` },
  };
}

// ─── Setup ───────────────────────────────────────────────────────────────────

beforeEach(() => {
  resetMockElements();
  state.zoneRegistry = new Map();
  state.navLayerRegistry = new Map();
  state.skeletonPanelOpen = false;
  state.skeletonPanelTab = 'zones';
  state.currentView = 'graph';
  vi.clearAllMocks();
  getVisibleZones.mockReturnValue(new Map());
});


// ── toggleSkeletonPanel ──

describe('toggleSkeletonPanel', () => {
  it('opens panel and sets state', () => {
    const panel = createMockElement('skeleton-panel');

    toggleSkeletonPanel();

    expect(panel.classList.contains('open')).toBe(true);
    expect(state.skeletonPanelOpen).toBe(true);
  });

  it('closes panel when already open', () => {
    const panel = createMockElement('skeleton-panel');
    panel.classList.add('open');

    toggleSkeletonPanel();

    expect(panel.classList.contains('open')).toBe(false);
    expect(state.skeletonPanelOpen).toBe(false);
  });

  it('does not throw when panel element is absent', () => {
    expect(() => toggleSkeletonPanel()).not.toThrow();
  });
});


// ── switchSkeletonTab ──

describe('switchSkeletonTab', () => {
  function setupTabDOM() {
    createMockElement('skeleton-tab-zones');
    createMockElement('skeleton-tab-functions');
    createMockElement('skeleton-tab-nav');
  }

  it('shows functions tab and hides others', () => {
    setupTabDOM();
    switchSkeletonTab('functions');

    expect(mockElements['skeleton-tab-zones'].style.display).toBe('none');
    expect(mockElements['skeleton-tab-functions'].style.display).toBe('block');
    expect(mockElements['skeleton-tab-nav'].style.display).toBe('none');
  });

  it('shows nav tab and hides others', () => {
    setupTabDOM();
    switchSkeletonTab('nav');

    expect(mockElements['skeleton-tab-zones'].style.display).toBe('none');
    expect(mockElements['skeleton-tab-functions'].style.display).toBe('none');
    expect(mockElements['skeleton-tab-nav'].style.display).toBe('block');
  });

  it('updates state.skeletonPanelTab', () => {
    setupTabDOM();
    switchSkeletonTab('functions');
    expect(state.skeletonPanelTab).toBe('functions');
  });
});


// ── renderSpatialDiagram ──

describe('renderSpatialDiagram', () => {
  it('renders zone blocks into container innerHTML', () => {
    state.zoneRegistry.set('Z1', makeZoneEntry('Z1', 'Header', 'Fixed', true));
    state.zoneRegistry.set('Z6', makeZoneEntry('Z6', 'Canvas', 'Fixed', true));
    state.zoneRegistry.set('Z9', makeZoneEntry('Z9', 'Sidebar', 'Sliding', false));

    const container = createMockElement('skeleton-spatial-diagram');
    renderSpatialDiagram(container);

    expect(container.innerHTML).toContain('Z1');
    expect(container.innerHTML).toContain('Z6');
  });

  it('marks visible zones with zone-visible class', () => {
    state.zoneRegistry.set('Z1', makeZoneEntry('Z1', 'Header', 'Fixed', true));
    getVisibleZones.mockReturnValue(new Map([['Z1', state.zoneRegistry.get('Z1')]]));

    const container = createMockElement('test-diagram');
    renderSpatialDiagram(container);

    expect(container.innerHTML).toContain('zone-visible');
  });

  it('marks hidden zones with zone-hidden class', () => {
    state.zoneRegistry.set('Z9', makeZoneEntry('Z9', 'Sidebar', 'Sliding', false));
    getVisibleZones.mockReturnValue(new Map());

    const container = createMockElement('test-diagram');
    renderSpatialDiagram(container);

    expect(container.innerHTML).toContain('zone-hidden');
  });
});


// ── renderZonesTab ──

describe('renderZonesTab', () => {
  it('renders cards containing zone IDs and names', () => {
    state.zoneRegistry.set('Z1', makeZoneEntry('Z1', 'Header', 'Fixed', true));
    state.zoneRegistry.set('Z6', makeZoneEntry('Z6', 'Canvas', 'Fixed', true));

    const container = createMockElement('test-zones');
    renderZonesTab(container);

    expect(container.innerHTML).toContain('Z1');
    expect(container.innerHTML).toContain('Header');
    expect(container.innerHTML).toContain('Z6');
    expect(container.innerHTML).toContain('Canvas');
    expect(container.innerHTML).toContain('skeleton-card');
  });

  it('shows correct zone metadata', () => {
    state.zoneRegistry.set('Z12', makeZoneEntry('Z12', 'DS Panel', 'Sliding', false));

    const container = createMockElement('test-zones');
    renderZonesTab(container);

    expect(container.innerHTML).toContain('Sliding');
    expect(container.innerHTML).toContain('DS Panel');
    expect(container.innerHTML).toContain('PFC');
  });

  it('shows empty message when no zones loaded', () => {
    const container = createMockElement('test-zones');
    renderZonesTab(container);

    expect(container.innerHTML).toContain('No zones loaded');
  });
});


// ── renderFunctionsTab ──

describe('renderFunctionsTab', () => {
  it('renders zone-component mappings', () => {
    const entry = makeZoneEntry('Z12', 'DS Panel', 'Sliding', false);
    entry.components = [makeComponent('cmp-viz-ds-panel', 'ds-panel-content', 'Z12')];
    state.zoneRegistry.set('Z12', entry);

    const container = createMockElement('test-functions');
    renderFunctionsTab(container);

    expect(container.innerHTML).toContain('cmp-viz-ds-panel');
    expect(container.innerHTML).toContain('ds-panel-content');
  });

  it('shows (empty) for zones with no components', () => {
    state.zoneRegistry.set('Z6', makeZoneEntry('Z6', 'Canvas', 'Fixed', true));

    const container = createMockElement('test-functions');
    renderFunctionsTab(container);

    expect(container.innerHTML).toContain('(empty)');
  });
});


// ── renderNavTab ──

describe('renderNavTab', () => {
  it('renders sections containing layer names', () => {
    state.navLayerRegistry.set('L1', makeNavLayerEntry('L1', 'Main', 1, [
      makeNavItem('nav-audit', 'OAA Audit', 'Button', 'toggleAuditPanel'),
    ]));
    state.navLayerRegistry.set('L2', makeNavLayerEntry('L2', 'View', 2, []));

    const container = createMockElement('test-nav');
    renderNavTab(container);

    expect(container.innerHTML).toContain('Main');
    expect(container.innerHTML).toContain('View');
    expect(container.innerHTML).toContain('skeleton-card');
  });

  it('lists nav items within each layer', () => {
    state.navLayerRegistry.set('L1', makeNavLayerEntry('L1', 'Main', 1, [
      makeNavItem('nav-audit', 'OAA Audit', 'Button', 'toggleAuditPanel'),
      makeNavItem('nav-library', 'Library', 'Button', 'toggleLibrary'),
    ]));

    const container = createMockElement('test-nav');
    renderNavTab(container);

    expect(container.innerHTML).toContain('OAA Audit');
    expect(container.innerHTML).toContain('Library');
    expect(container.innerHTML).toContain('skeleton-nav-item-row');
  });

  it('shows correct item metadata', () => {
    state.navLayerRegistry.set('L1', makeNavLayerEntry('L1', 'Main', 1, [
      makeNavItem('nav-audit', 'OAA Audit', 'Button', 'toggleAuditPanel'),
    ]));

    const container = createMockElement('test-nav');
    renderNavTab(container);

    expect(container.innerHTML).toContain('Button');
    expect(container.innerHTML).toContain('toggleAuditPanel');
    expect(container.innerHTML).toContain('PFC');
  });
});

// ─── Properties Tab (F40.22) ────────────────────────────────────────────────

describe('showPropertiesForNode', () => {
  beforeEach(() => {
    resetMockElements();
    state._skeletonSelectedNode = null;
    state.skeletonPanelOpen = false;
    state.skeletonPanelTab = 'zones';
    createMockElement('skeleton-panel');
    createMockElement('skeleton-tab-properties');
    createMockElement('skeleton-tab-zones');
    createMockElement('skeleton-tab-functions');
    createMockElement('skeleton-tab-nav');
  });

  it('sets _skeletonSelectedNode', () => {
    showPropertiesForNode('nav-L1-audit');
    expect(state._skeletonSelectedNode).toBe('nav-L1-audit');
  });

  it('opens the skeleton panel if closed', () => {
    showPropertiesForNode('zone-Z1');
    expect(state.skeletonPanelOpen).toBe(true);
    const panel = mockElements['skeleton-panel'];
    expect(panel.classList.contains('open')).toBe(true);
  });

  it('switches to properties tab', () => {
    showPropertiesForNode('layer-L1-core');
    expect(state.skeletonPanelTab).toBe('properties');
  });
});

describe('renderPropertiesTab', () => {
  const testSkeleton = {
    application: { '@id': 'ds:app-test', 'ds:appName': 'Test App' },
    zones: [{ '@id': 'ds:zone-Z1', 'ds:zoneName': 'Header', 'ds:zoneType': 'Fixed', 'ds:position': 'top', 'ds:defaultWidth': '100%', 'ds:defaultVisible': true, 'ds:cascadeTier': 'PFC' }],
    navLayers: [{ '@id': 'ds:layer-L1', 'ds:layerName': 'Main', 'ds:layerLevel': 1, 'ds:renderOrder': 1, 'ds:cascadeTier': 'PFC' }],
    navItems: [
      { '@id': 'ds:nav-L1-audit', 'ds:itemId': 'nav-L1-audit', 'ds:label': 'Audit', 'ds:itemType': 'Button', 'ds:icon': 'search', 'ds:cascadeTier': 'PFC', 'ds:belongsToLayer': { '@id': 'ds:layer-L1' }, 'ds:executesAction': { '@id': 'ds:action-audit' } },
    ],
    actions: [{ '@id': 'ds:action-audit', 'ds:functionRef': 'toggleAuditPanel', 'ds:parameterType': 'None', 'ds:triggersSyncAfter': true }],
  };

  beforeEach(() => {
    state._skeletonSelectedNode = null;
    state.appSkeleton = null;
  });

  it('shows placeholder when no node selected', () => {
    const container = createMockElement('test-props');
    renderPropertiesTab(container);
    expect(container.innerHTML).toContain('Click a node');
  });

  it('shows placeholder when no skeleton loaded', () => {
    state._skeletonSelectedNode = 'nav-L1-audit';
    const container = createMockElement('test-props');
    renderPropertiesTab(container);
    expect(container.innerHTML).toContain('No skeleton loaded');
  });

  it('renders application properties for app-root node', () => {
    state._skeletonSelectedNode = 'app-root';
    state.appSkeleton = testSkeleton;
    const container = createMockElement('test-props');
    renderPropertiesTab(container);
    expect(container.innerHTML).toContain('Application');
    expect(container.innerHTML).toContain('Test App');
  });

  it('renders zone properties for zone-Z1 node', () => {
    state._skeletonSelectedNode = 'zone-Z1';
    state.appSkeleton = testSkeleton;
    const container = createMockElement('test-props');
    renderPropertiesTab(container);
    expect(container.innerHTML).toContain('Header');
    expect(container.innerHTML).toContain('Fixed');
  });

  it('renders layer properties for layer-L1 node', () => {
    state._skeletonSelectedNode = 'layer-L1';
    state.appSkeleton = testSkeleton;
    const container = createMockElement('test-props');
    renderPropertiesTab(container);
    expect(container.innerHTML).toContain('Main');
    expect(container.innerHTML).toContain('Level');
  });

  it('renders navItem properties for nav- prefix node', () => {
    state._skeletonSelectedNode = 'nav-L1-audit';
    state.appSkeleton = testSkeleton;
    const container = createMockElement('test-props');
    renderPropertiesTab(container);
    expect(container.innerHTML).toContain('Audit');
    expect(container.innerHTML).toContain('Button');
    expect(container.innerHTML).toContain('search');
  });

  it('renders action properties for action- prefix node', () => {
    state._skeletonSelectedNode = 'action-audit';
    state.appSkeleton = testSkeleton;
    const container = createMockElement('test-props');
    renderPropertiesTab(container);
    expect(container.innerHTML).toContain('toggleAuditPanel');
    expect(container.innerHTML).toContain('None');
  });

  it('shows editable fields when in edit mode', () => {
    state._skeletonSelectedNode = 'nav-L1-audit';
    state.appSkeleton = testSkeleton;
    state.skeletonEditMode = true;
    const container = createMockElement('test-props');
    renderPropertiesTab(container);
    expect(container.innerHTML).toContain('skeleton-prop-input');
    expect(container.innerHTML).toContain('skeleton-prop-edit-section');
    state.skeletonEditMode = false;
  });

  it('shows unknown node type message for unrecognised prefix', () => {
    state._skeletonSelectedNode = 'random-thing';
    state.appSkeleton = testSkeleton;
    const container = createMockElement('test-props');
    renderPropertiesTab(container);
    expect(container.innerHTML).toContain('Unknown node type');
  });
});
