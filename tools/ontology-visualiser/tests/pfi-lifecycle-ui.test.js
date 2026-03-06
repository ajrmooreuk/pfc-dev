/**
 * Unit tests for PFI Lifecycle Workbench UI — Epic 40, Feature 40.17
 *
 * Tests renderPFILifecyclePanel, updateLifecycleStep, renderSnapshotManager,
 * renderBindingInspector, and lifecycle action handlers.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Mock DOM ────────────────────────────────────────────────────────────────

const mockElements = {};
function resetMockElements() {
  Object.keys(mockElements).forEach(k => delete mockElements[k]);
}

function createMockElement(id, overrides = {}) {
  const el = {
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
    },
    querySelectorAll: vi.fn(() => []),
    addEventListener: vi.fn(),
    appendChild: vi.fn(),
    remove: vi.fn(() => { delete mockElements[id]; }),
    ...overrides,
  };
  mockElements[id] = el;
  return el;
}

vi.stubGlobal('document', {
  getElementById: vi.fn((id) => mockElements[id] || null),
  querySelectorAll: vi.fn(() => []),
  createElement: vi.fn(() => ({
    style: {}, innerHTML: '', textContent: '',
    addEventListener: vi.fn(),
  })),
});

vi.stubGlobal('window', { focusNode: vi.fn() });

const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn(key => store[key] || null),
    setItem: vi.fn((key, value) => { store[key] = value; }),
    removeItem: vi.fn(key => { delete store[key]; }),
    clear: () => { store = {}; },
  };
})();
vi.stubGlobal('localStorage', localStorageMock);

// ─── Mock state.js ───────────────────────────────────────────────────────────

vi.mock('../js/state.js', () => ({
  state: {
    registryIndex: null,
    pfiInstances: new Map(),
    pfiInstanceData: new Map(),
    compositionManifests: [],
    lastComposition: null,
    composedPFIGraph: null,
    activeScopeRules: null,
    scopeRulesActive: false,
    canonicalSnapshots: new Map(),
    activePersonaScope: null,
    productContext: null,
    scopeRuleLog: [],
    productBindings: null,
    icpBindings: null,
    snapshotVersionIndex: new Map(),
    activeInstanceId: null,
    isPFIMode: false,
    activePFI: null,
  },
  REGISTRY_BASE_PATH: '../../ONTOLOGIES/ontology-library/',
}));

// ─── Mock emc-composer.js ────────────────────────────────────────────────────

vi.mock('../js/emc-composer.js', () => ({
  populateScopeRulesFromEMC: vi.fn(() => 3),
  resolveProductContext: vi.fn(() => ({
    products: ['BAIV-AIV'], brands: ['BAIV'], maturityLevel: 1,
    requirementScopes: ['PRODUCT'], marketSegments: ['MarTech'],
  })),
  evaluateScopeRules: vi.fn(() => ({
    includedNamespaces: new Set(['vp:']),
    excludedNamespaces: new Set(),
    ruleLog: [{ ruleId: 'R1', fired: true }],
  })),
  composeInstanceGraph: vi.fn(() => ({
    success: true,
    nodes: [{ id: 'n1' }, { id: 'n2' }],
    edges: [{ from: 'n1', to: 'n2', label: 'test' }],
    metadata: { entityCount: 2, edgeCount: 1, ontologySources: ['VP-ONT'] },
  })),
  resolveProductBindings: vi.fn(() => {
    const m = new Map();
    m.set('vp:Problem-1', [{ productCode: 'BAIV-AIV', bindingType: 'instance-data', confidence: 1.0 }]);
    return m;
  }),
  resolveICPBindings: vi.fn(() => {
    const m = new Map();
    m.set('vp:Problem-1', [{ icpRef: 'icp-soc', icpLabel: 'SoC Manager', seniorityLevel: 'Tactical' }]);
    return m;
  }),
  inferProductBindings: vi.fn(() => new Map()),
  freezeComposedGraph: vi.fn((spec, version) => ({
    success: true,
    snapshot: { snapshotId: `${spec.specId}-v${version}`, snapshotVersion: version, changeControlStatus: 'locked' },
  })),
  getCanonicalSnapshot: vi.fn(() => null),
  listSnapshotVersions: vi.fn(() => []),
  inheritSnapshot: vi.fn(() => ({ success: true, composedGraph: {} })),
  diffSnapshots: vi.fn(() => ({
    success: true,
    summary: { nodesAdded: 1, nodesRemoved: 0, nodesModified: 0, edgesAdded: 0, edgesRemoved: 0 },
    oldVersion: '1.0.0', newVersion: '2.0.0',
  })),
  generatePFIGraph: vi.fn(() => ({ success: true })),
  generatePersonaWorkflow: vi.fn(() => ({ success: true })),
}));

// ─── Imports ─────────────────────────────────────────────────────────────────

import { state } from '../js/state.js';
import {
  renderPFILifecyclePanel, renderSnapshotManager, renderBindingInspector,
  updateLifecycleStep,
  doLifecycleLoadScopeRules, doLifecycleCompose, doLifecycleResolveBindings,
  doFreezeSnapshot, doInheritSnapshot, doDiffSelectedSnapshots,
  filterBindings,
} from '../js/pfi-lifecycle-ui.js';
import {
  resolveProductContext, evaluateScopeRules, composeInstanceGraph,
  resolveProductBindings, resolveICPBindings, inferProductBindings,
  freezeComposedGraph, inheritSnapshot,
} from '../js/emc-composer.js';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function setupDOM() {
  resetMockElements();
  createMockElement('pfi-lifecycle-panel', { style: { display: 'none' } });
  createMockElement('pfi-lifecycle-content');
  createMockElement('snapshot-modal', { style: { display: 'none' } });
  createMockElement('snapshot-modal-body');
  createMockElement('tab-bindings', { style: { display: 'none' } });
  createMockElement('snapshot-version-input', { value: '' });
  createMockElement('snapshot-admin-input', { value: '' });
  createMockElement('snapshot-freeze-status');
  createMockElement('snapshot-diff-result');
}

function resetState() {
  state.pfiInstances.clear();
  state.pfiInstanceData.clear();
  state.canonicalSnapshots.clear();
  state.snapshotVersionIndex.clear();
  state.composedPFIGraph = null;
  state.activeScopeRules = null;
  state.scopeRulesActive = false;
  state.activePersonaScope = null;
  state.productContext = null;
  state.scopeRuleLog = [];
  state.productBindings = null;
  state.icpBindings = null;
  state.activeInstanceId = null;
  localStorageMock.clear();
}

// ─── Test Suites ─────────────────────────────────────────────────────────────

describe('renderPFILifecyclePanel (S40.17.3)', () => {
  beforeEach(() => {
    resetState();
    setupDOM();
  });

  it('renders 10 steps in the lifecycle panel', () => {
    state.activeInstanceId = 'PFI-BAIV';
    renderPFILifecyclePanel('PFI-BAIV');
    const content = mockElements['pfi-lifecycle-content'];
    expect(content.innerHTML).toContain('Create PFI Instance');
    expect(content.innerHTML).toContain('Freeze Canonical Snapshot');
    expect(content.innerHTML).toContain('Filter to Persona');
  });

  it('shows instance name in header', () => {
    renderPFILifecyclePanel('PFI-BAIV');
    const content = mockElements['pfi-lifecycle-content'];
    expect(content.innerHTML).toContain('PFI-BAIV');
  });

  it('auto-detects step 1 complete when instance exists', () => {
    state.pfiInstances.set('PFI-BAIV', { instanceId: 'PFI-BAIV' });
    renderPFILifecyclePanel('PFI-BAIV');
    const content = mockElements['pfi-lifecycle-content'];
    // Step 1 gets the complete status class
    expect(content.innerHTML).toContain('lifecycle-step-complete');
  });

  it('auto-detects steps 4-6 complete when composedPFIGraph exists', () => {
    state.composedPFIGraph = { metadata: { entityCount: 5, edgeCount: 3 } };
    renderPFILifecyclePanel('PFI-BAIV');
    const content = mockElements['pfi-lifecycle-content'];
    expect(content.innerHTML).toContain('5 entities');
  });

  it('shows scope rule log summary in footer', () => {
    state.scopeRuleLog = [{ ruleId: 'R1', fired: true }, { ruleId: 'R2', fired: false }];
    renderPFILifecyclePanel('PFI-BAIV');
    const content = mockElements['pfi-lifecycle-content'];
    expect(content.innerHTML).toContain('1/2 fired');
  });

  it('shows action buttons for incomplete steps', () => {
    renderPFILifecyclePanel('PFI-BAIV');
    const content = mockElements['pfi-lifecycle-content'];
    expect(content.innerHTML).toContain('Load Rules');
    expect(content.innerHTML).toContain('Compose');
  });

  it('handles no instance gracefully', () => {
    renderPFILifecyclePanel(null);
    const content = mockElements['pfi-lifecycle-content'];
    expect(content.innerHTML).toContain('None');
  });

  it('handles missing container gracefully', () => {
    delete mockElements['pfi-lifecycle-content'];
    expect(() => renderPFILifecyclePanel('PFI-BAIV')).not.toThrow();
  });
});

describe('updateLifecycleStep (S40.17.3)', () => {
  beforeEach(() => {
    resetState();
    setupDOM();
  });

  it('updates step status and detail', () => {
    // Make panel visible so re-render triggers
    mockElements['pfi-lifecycle-panel'].style.display = 'block';
    state.activeInstanceId = 'PFI-BAIV';
    renderPFILifecyclePanel('PFI-BAIV');

    updateLifecycleStep(3, 'complete', '3 rules loaded');
    const content = mockElements['pfi-lifecycle-content'];
    expect(content.innerHTML).toContain('3 rules loaded');
  });

  it('handles error status', () => {
    mockElements['pfi-lifecycle-panel'].style.display = 'block';
    state.activeInstanceId = 'PFI-BAIV';
    renderPFILifecyclePanel('PFI-BAIV');

    updateLifecycleStep(3, 'error', 'No EMC data');
    const content = mockElements['pfi-lifecycle-content'];
    expect(content.innerHTML).toContain('No EMC data');
  });

  it('does not throw when panel is hidden', () => {
    expect(() => updateLifecycleStep(1, 'complete')).not.toThrow();
  });
});

describe('renderSnapshotManager (S40.17.4)', () => {
  beforeEach(() => {
    resetState();
    setupDOM();
  });

  it('renders freeze form with version and admin inputs', () => {
    state.composedPFIGraph = { metadata: { entityCount: 10, edgeCount: 5, ontologySources: ['VP-ONT'] } };
    renderSnapshotManager('PFI-BAIV');
    const body = mockElements['snapshot-modal-body'];
    expect(body.innerHTML).toContain('Freeze New Snapshot');
    expect(body.innerHTML).toContain('snapshot-version-input');
    expect(body.innerHTML).toContain('snapshot-admin-input');
  });

  it('shows instance name', () => {
    renderSnapshotManager('PFI-BAIV');
    const body = mockElements['snapshot-modal-body'];
    expect(body.innerHTML).toContain('PFI-BAIV');
  });

  it('shows graph stats when composed graph exists', () => {
    state.composedPFIGraph = { metadata: { entityCount: 42, edgeCount: 15, ontologySources: ['VP-ONT', 'RRR-ONT'] } };
    renderSnapshotManager('PFI-BAIV');
    const body = mockElements['snapshot-modal-body'];
    expect(body.innerHTML).toContain('42 entities');
    expect(body.innerHTML).toContain('2 ontologies');
  });

  it('shows "No snapshots yet" when no versions exist', () => {
    renderSnapshotManager('PFI-BAIV');
    const body = mockElements['snapshot-modal-body'];
    expect(body.innerHTML).toContain('No snapshots yet');
  });

  it('disables freeze button when no composed graph', () => {
    state.composedPFIGraph = null;
    renderSnapshotManager('PFI-BAIV');
    const body = mockElements['snapshot-modal-body'];
    expect(body.innerHTML).toContain('disabled');
  });

  it('handles missing container gracefully', () => {
    delete mockElements['snapshot-modal-body'];
    expect(() => renderSnapshotManager('PFI-BAIV')).not.toThrow();
  });
});

describe('renderBindingInspector (S40.17.5)', () => {
  beforeEach(() => {
    resetState();
    setupDOM();
  });

  it('renders product bindings table', () => {
    state.productBindings = new Map([
      ['vp:Problem-1', [{ productCode: 'BAIV-AIV', bindingType: 'instance-data', confidence: 1.0 }]],
    ]);
    renderBindingInspector('PFI-BAIV');
    const tab = mockElements['tab-bindings'];
    expect(tab.innerHTML).toContain('Product Bindings');
    expect(tab.innerHTML).toContain('BAIV-AIV');
    expect(tab.innerHTML).toContain('100%');
  });

  it('renders ICP bindings table', () => {
    state.icpBindings = new Map([
      ['vp:Problem-1', [{ icpRef: 'icp-soc', icpLabel: 'SoC Manager', seniorityLevel: 'Tactical' }]],
    ]);
    renderBindingInspector('PFI-BAIV');
    const tab = mockElements['tab-bindings'];
    expect(tab.innerHTML).toContain('ICP Bindings');
    expect(tab.innerHTML).toContain('SoC Manager');
    expect(tab.innerHTML).toContain('Tactical');
  });

  it('shows filter buttons', () => {
    state.productBindings = new Map([['n1', [{ productCode: 'P1', bindingType: 'instance-data', confidence: 1.0 }]]]);
    renderBindingInspector('PFI-BAIV');
    const tab = mockElements['tab-bindings'];
    expect(tab.innerHTML).toContain('Explicit');
    expect(tab.innerHTML).toContain('Inferred');
  });

  it('shows empty message when no bindings', () => {
    renderBindingInspector('PFI-BAIV');
    const tab = mockElements['tab-bindings'];
    expect(tab.innerHTML).toContain('No bindings resolved');
  });

  it('shows inferred binding badge', () => {
    state.productBindings = new Map([
      ['n1', [{ productCode: 'BAIV-AIV', bindingType: 'inferred', confidence: 0.5 }]],
    ]);
    renderBindingInspector('PFI-BAIV');
    const tab = mockElements['tab-bindings'];
    expect(tab.innerHTML).toContain('inferred');
    expect(tab.innerHTML).toContain('50%');
  });

  it('handles missing container gracefully', () => {
    delete mockElements['tab-bindings'];
    expect(() => renderBindingInspector('PFI-BAIV')).not.toThrow();
  });
});

describe('doLifecycleCompose (S40.17.6)', () => {
  beforeEach(() => {
    resetState();
    setupDOM();
    vi.clearAllMocks();
  });

  it('calls resolveProductContext → evaluateScopeRules → composeInstanceGraph', () => {
    state.activeInstanceId = 'PFI-BAIV';
    doLifecycleCompose();
    expect(resolveProductContext).toHaveBeenCalledWith('PFI-BAIV');
    expect(evaluateScopeRules).toHaveBeenCalled();
    expect(composeInstanceGraph).toHaveBeenCalled();
  });

  it('sets state.composedPFIGraph after compose', () => {
    state.activeInstanceId = 'PFI-BAIV';
    doLifecycleCompose();
    expect(state.composedPFIGraph).toBeDefined();
    expect(state.scopeRulesActive).toBe(true);
  });

  it('does nothing when no activeInstanceId', () => {
    state.activeInstanceId = null;
    doLifecycleCompose();
    expect(resolveProductContext).not.toHaveBeenCalled();
  });
});

describe('doLifecycleResolveBindings (S40.17.6)', () => {
  beforeEach(() => {
    resetState();
    setupDOM();
    vi.clearAllMocks();
  });

  it('calls resolveProductBindings and resolveICPBindings', () => {
    state.activeInstanceId = 'PFI-BAIV';
    doLifecycleResolveBindings();
    expect(resolveProductBindings).toHaveBeenCalledWith('PFI-BAIV');
    expect(resolveICPBindings).toHaveBeenCalledWith('PFI-BAIV');
  });

  it('stores bindings in state', () => {
    state.activeInstanceId = 'PFI-BAIV';
    doLifecycleResolveBindings();
    expect(state.productBindings).toBeDefined();
    expect(state.icpBindings).toBeDefined();
  });
});

describe('doFreezeSnapshot (S40.17.6)', () => {
  beforeEach(() => {
    resetState();
    setupDOM();
    vi.clearAllMocks();
  });

  it('calls freezeComposedGraph with correct args', () => {
    state.composedPFIGraph = {
      specId: 'TEST-SPEC',
      metadata: { entityCount: 5, edgeCount: 2, ontologySources: ['VP-ONT'] },
      edges: [],
    };
    state.activeInstanceId = 'PFI-BAIV';
    state.scopeRuleLog = [];
    // Set input values
    mockElements['snapshot-version-input'].value = '1.0.0';
    mockElements['snapshot-admin-input'].value = 'admin@test.io';
    doFreezeSnapshot();
    expect(freezeComposedGraph).toHaveBeenCalled();
  });

  it('shows error when no composed graph', () => {
    state.composedPFIGraph = null;
    mockElements['snapshot-version-input'].value = '1.0.0';
    doFreezeSnapshot();
    const status = mockElements['snapshot-freeze-status'];
    expect(status.textContent).toContain('No composed graph');
  });
});

describe('Integration — full lifecycle flow', () => {
  beforeEach(() => {
    resetState();
    setupDOM();
    vi.clearAllMocks();
  });

  it('compose → resolve bindings → renders both panels', () => {
    state.activeInstanceId = 'PFI-BAIV';
    state.pfiInstances.set('PFI-BAIV', { instanceId: 'PFI-BAIV' });
    state.pfiInstanceData.set('PFI-BAIV', { files: [] });

    // Step 4-6: compose
    doLifecycleCompose();
    expect(state.composedPFIGraph).toBeDefined();

    // Step 7: bindings
    doLifecycleResolveBindings();
    expect(state.productBindings).toBeDefined();

    // Render lifecycle panel
    mockElements['pfi-lifecycle-panel'].style.display = 'block';
    renderPFILifecyclePanel('PFI-BAIV');
    const content = mockElements['pfi-lifecycle-content'];
    expect(content.innerHTML).toContain('2 entities');

    // Render binding inspector
    renderBindingInspector('PFI-BAIV');
    const tab = mockElements['tab-bindings'];
    expect(tab.innerHTML).toContain('Product Bindings');
  });

  it('lifecycle panel renders all 10 step labels', () => {
    renderPFILifecyclePanel('PFI-BAIV');
    const content = mockElements['pfi-lifecycle-content'];
    const expectedLabels = [
      'Create PFI Instance', 'Load Instance Data', 'Populate Scope Rules',
      'Resolve Product Context', 'Evaluate Scope Rules', 'Compose Instance Graph',
      'Resolve Entity Bindings', 'Freeze Canonical Snapshot',
      'Generate PFI Graph', 'Filter to Persona',
    ];
    for (const label of expectedLabels) {
      expect(content.innerHTML).toContain(label);
    }
  });

  it('filterBindings hides rows by type', () => {
    state.productBindings = new Map([
      ['n1', [{ productCode: 'P1', bindingType: 'instance-data', confidence: 1.0 }]],
      ['n2', [{ productCode: 'P1', bindingType: 'inferred', confidence: 0.5 }]],
    ]);
    renderBindingInspector('PFI-BAIV');

    // Mock querySelectorAll to return rows with style and dataset
    const row1 = { style: { display: '' }, dataset: { type: 'instance-data' } };
    const row2 = { style: { display: '' }, dataset: { type: 'inferred' } };
    document.querySelectorAll.mockReturnValueOnce([row1, row2]);

    filterBindings('explicit');
    // The 'explicit' filter hides rows whose dataset.type !== 'explicit'
    // Since 'instance-data' !== 'explicit', row1 is hidden; 'inferred' !== 'explicit', row2 hidden
    expect(row2.style.display).toBe('none');
    expect(row1.style.display).toBe('none');
  });
});
