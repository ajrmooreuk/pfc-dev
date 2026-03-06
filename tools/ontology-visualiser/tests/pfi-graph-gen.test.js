/**
 * Unit tests for PFI instance graph generation & persona workflows — Epic 19, Feature 19.4
 *
 * Tests generatePFIGraph, buildScopedFilteredView, getScopedNodeRenderMode,
 * isScopedEdgeVisible, generatePersonaWorkflow, and full integration pipeline.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

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
    loadedOntologies: new Map(),
    activeInstanceId: null,
  },
  REGISTRY_BASE_PATH: '../../ONTOLOGIES/ontology-library/',
}));

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

import { state } from '../js/state.js';
import {
  freezeComposedGraph,
  generatePFIGraph,
  generatePersonaWorkflow,
} from '../js/emc-composer.js';
import {
  buildScopedFilteredView,
  getScopedNodeRenderMode,
  isScopedEdgeVisible,
} from '../js/composition-filter.js';

// ─── Fixture Helpers ────────────────────────────────────────────────────────

function makeComposedGraphSpec(overrides = {}) {
  return {
    specId: 'BAIV-COMPOSED-GRAPH',
    '@id': 'BAIV-COMPOSED-GRAPH',
    '@type': 'emc:ComposedGraphSpec',
    componentOntologies: [
      { ontologyRef: 'VP-ONT', series: 'VE-Series', required: true },
      { ontologyRef: 'RRR-ONT', series: 'VE-Series', required: true },
    ],
    joinPoints: [
      { from: 'vp:Solution', to: 'rrr:Requirement', relationship: 'alignsTo' },
    ],
    scopeRules: ['RULE-MKT-001'],
    entityCount: 12,
    ...overrides,
  };
}

function makeBAIVInstanceConfig() {
  return {
    '@id': 'PFI-BAIV',
    instanceId: 'PFI-BAIV',
    products: ['AIV'],
    productCode: 'BAIV-AIV',
    brands: ['BAIV'],
    requirementScopes: ['PRODUCT', 'COMPETITIVE', 'STRATEGIC'],
    maturityLevel: 1,
    verticalMarket: 'MarTech',
    jurisdictions: ['UK', 'EU'],
    orgContext: { industry: 'MarTech SaaS', size: 'Startup' },
    composedGraphSpec: {
      joinPoints: [{ from: 'vp:Solution', to: 'rrr:Requirement', relationship: 'alignsTo' }],
    },
  };
}

function makeComposedGraph(overrides = {}) {
  return {
    success: true,
    nodes: [
      { id: 'vp::Problem-1', label: 'Poor Attribution', sourceNamespace: 'vp:', ontologyRef: 'VP-ONT' },
      { id: 'vp::Solution-1', label: 'AI Analytics', sourceNamespace: 'vp:', ontologyRef: 'VP-ONT' },
      { id: 'rrr::Requirement-1', label: 'Build Dashboard', sourceNamespace: 'rrr:', ontologyRef: 'RRR-ONT' },
    ],
    edges: [
      { from: 'vp::Solution-1', to: 'rrr::Requirement-1', label: 'alignsTo' },
    ],
    metadata: {
      instanceId: 'PFI-BAIV',
      ontologySources: ['VP-ONT', 'RRR-ONT'],
      joinCount: 1,
      entityCount: 3,
      edgeCount: 1,
    },
    ...overrides,
  };
}

function resetState() {
  state.canonicalSnapshots.clear();
  state.snapshotVersionIndex.clear();
  state.pfiInstances.clear();
  state.pfiInstanceData.clear();
  state.loadedOntologies.clear();
  state.composedPFIGraph = null;
  state.activeScopeRules = null;
  state.scopeRulesActive = false;
  state.activePersonaScope = null;
  state.productContext = null;
  state.scopeRuleLog = [];
  state.compositionManifests = [];
  state.productBindings = null;
  state.icpBindings = null;
  state.activeInstanceId = null;
  localStorageMock.clear();
}

// ─── Test Suites ────────────────────────────────────────────────────────────

describe('generatePFIGraph (S19.4.1)', () => {
  beforeEach(() => {
    resetState();
    state.pfiInstances.set('PFI-BAIV', makeBAIVInstanceConfig());
    state.pfiInstanceData.set('PFI-BAIV', { files: [] });
  });

  it('returns error when instanceId is missing', () => {
    const result = generatePFIGraph(null, 'snap-v1.0.0');
    expect(result.success).toBe(false);
    expect(result.error).toContain('instanceId');
  });

  it('returns error when snapshotId is missing', () => {
    const result = generatePFIGraph('PFI-BAIV', null);
    expect(result.success).toBe(false);
    expect(result.error).toContain('snapshotId');
  });

  it('returns error when snapshot not found', () => {
    const result = generatePFIGraph('PFI-BAIV', 'non-existent');
    expect(result.success).toBe(false);
    expect(result.error).toContain('not found');
  });

  it('returns error when snapshot is superseded', () => {
    const spec = makeComposedGraphSpec();
    freezeComposedGraph(spec, '1.0.0', 'admin');
    freezeComposedGraph(spec, '2.0.0', 'admin');

    const result = generatePFIGraph('PFI-BAIV', 'BAIV-COMPOSED-GRAPH-v1.0.0');
    expect(result.success).toBe(false);
    expect(result.error).toContain('superseded');
  });

  it('succeeds with locked snapshot and returns composedGraph', () => {
    freezeComposedGraph(makeComposedGraphSpec(), '1.0.0', 'admin');
    const result = generatePFIGraph('PFI-BAIV', 'BAIV-COMPOSED-GRAPH-v1.0.0');

    expect(result.success).toBe(true);
    expect(result.composedGraph).toBeDefined();
    expect(result.scopeResult).toBeDefined();
    expect(result.context).toBeDefined();
  });

  it('sets state.scopeRulesActive to true', () => {
    freezeComposedGraph(makeComposedGraphSpec(), '1.0.0', 'admin');
    generatePFIGraph('PFI-BAIV', 'BAIV-COMPOSED-GRAPH-v1.0.0');
    expect(state.scopeRulesActive).toBe(true);
  });

  it('stores composedGraph in state.composedPFIGraph', () => {
    freezeComposedGraph(makeComposedGraphSpec(), '1.0.0', 'admin');
    generatePFIGraph('PFI-BAIV', 'BAIV-COMPOSED-GRAPH-v1.0.0');
    expect(state.composedPFIGraph).toBeDefined();
  });

  it('stores product context in state.productContext', () => {
    freezeComposedGraph(makeComposedGraphSpec(), '1.0.0', 'admin');
    generatePFIGraph('PFI-BAIV', 'BAIV-COMPOSED-GRAPH-v1.0.0');
    expect(state.productContext).toBeDefined();
  });
});

describe('buildScopedFilteredView (S19.4.2)', () => {
  beforeEach(resetState);

  it('builds visible set from composed graph nodes', () => {
    const view = buildScopedFilteredView(makeComposedGraph());
    expect(view.visibleEntityIds.size).toBe(3);
    expect(view.visibleEntityIds.has('vp::Problem-1')).toBe(true);
    expect(view.visibleEntityIds.has('vp::Solution-1')).toBe(true);
    expect(view.visibleEntityIds.has('rrr::Requirement-1')).toBe(true);
  });

  it('classifies loaded ontology entities not in composed graph as ghost', () => {
    state.loadedOntologies.set('KPI-ONT', {
      parsed: {
        entities: [
          { id: 'kpi::KPI-1', '@type': 'kpi:KPI', name: 'Revenue' },
          { id: 'kpi::KPI-2', '@type': 'kpi:KPI', name: 'NPS' },
        ],
      },
    });
    const view = buildScopedFilteredView(makeComposedGraph());
    expect(view.ghostEntityIds.has('kpi::KPI-1')).toBe(true);
    expect(view.ghostEntityIds.has('kpi::KPI-2')).toBe(true);
  });

  it('classifies entities excluded by scope rules as hidden', () => {
    state.loadedOntologies.set('KPI-ONT', {
      parsed: {
        entities: [
          { id: 'kpi::KPI-1', '@type': 'kpi:KPI', name: 'Revenue' },
        ],
      },
    });
    const scopeResult = { excludedEntityTypes: new Set(['kpi:KPI']) };
    const view = buildScopedFilteredView(makeComposedGraph(), scopeResult);
    expect(view.hiddenEntityIds.has('kpi::KPI-1')).toBe(true);
    expect(view.ghostEntityIds.has('kpi::KPI-1')).toBe(false);
  });

  it('sets isScopedView to true', () => {
    const view = buildScopedFilteredView(makeComposedGraph());
    expect(view.isScopedView).toBe(true);
  });

  it('generates filterLabel with entity and ontology counts', () => {
    state.activeInstanceId = 'PFI-BAIV';
    const view = buildScopedFilteredView(makeComposedGraph());
    expect(view.filterLabel).toContain('PFI:');
    expect(view.filterLabel).toContain('3 entities');
  });

  it('handles empty composed graph', () => {
    const view = buildScopedFilteredView({ nodes: [], edges: [], metadata: {} });
    expect(view.visibleEntityIds.size).toBe(0);
    expect(view.isScopedView).toBe(true);
  });

  it('handles null composed graph gracefully', () => {
    const view = buildScopedFilteredView(null);
    expect(view.visibleEntityIds.size).toBe(0);
  });

  it('does not classify composed graph nodes as ghost', () => {
    state.loadedOntologies.set('VP-ONT', {
      parsed: {
        entities: [
          { id: 'vp::Problem-1', '@type': 'vp:Problem', name: 'Attribution' },
        ],
      },
    });
    const view = buildScopedFilteredView(makeComposedGraph());
    expect(view.visibleEntityIds.has('vp::Problem-1')).toBe(true);
    expect(view.ghostEntityIds.has('vp::Problem-1')).toBe(false);
  });
});

describe('getScopedNodeRenderMode (S19.4.2)', () => {
  beforeEach(resetState);

  it('returns visible for nodes in visibleEntityIds', () => {
    const view = buildScopedFilteredView(makeComposedGraph());
    expect(getScopedNodeRenderMode({ id: 'vp::Problem-1' }, view)).toBe('visible');
  });

  it('returns ghost for nodes in ghostEntityIds', () => {
    state.loadedOntologies.set('KPI-ONT', {
      parsed: { entities: [{ id: 'kpi::KPI-1', '@type': 'kpi:KPI' }] },
    });
    const view = buildScopedFilteredView(makeComposedGraph());
    expect(getScopedNodeRenderMode({ id: 'kpi::KPI-1' }, view)).toBe('ghost');
  });

  it('returns hidden for nodes not in any set', () => {
    const view = buildScopedFilteredView(makeComposedGraph());
    expect(getScopedNodeRenderMode({ id: 'unknown::Entity-X' }, view)).toBe('hidden');
  });

  it('returns visible when scopedView is null', () => {
    expect(getScopedNodeRenderMode({ id: 'any' }, null)).toBe('visible');
  });

  it('returns visible when scopedView is not a scoped view', () => {
    expect(getScopedNodeRenderMode({ id: 'any' }, { isScopedView: false })).toBe('visible');
  });
});

describe('isScopedEdgeVisible (S19.4.2)', () => {
  beforeEach(resetState);

  it('returns true when both endpoints are visible', () => {
    const view = buildScopedFilteredView(makeComposedGraph());
    expect(isScopedEdgeVisible({ from: 'vp::Solution-1', to: 'rrr::Requirement-1' }, view)).toBe(true);
  });

  it('returns false when from endpoint is hidden', () => {
    const view = buildScopedFilteredView(makeComposedGraph());
    view.hiddenEntityIds.add('hidden-node');
    expect(isScopedEdgeVisible({ from: 'hidden-node', to: 'vp::Problem-1' }, view)).toBe(false);
  });

  it('returns false when to endpoint is hidden', () => {
    const view = buildScopedFilteredView(makeComposedGraph());
    view.hiddenEntityIds.add('hidden-node');
    expect(isScopedEdgeVisible({ from: 'vp::Problem-1', to: 'hidden-node' }, view)).toBe(false);
  });

  it('returns true when scopedView is null', () => {
    expect(isScopedEdgeVisible({ from: 'a', to: 'b' }, null)).toBe(true);
  });
});

describe('generatePersonaWorkflow (S19.4.3)', () => {
  beforeEach(() => {
    resetState();
    state.pfiInstances.set('PFI-BAIV', makeBAIVInstanceConfig());
    state.pfiInstanceData.set('PFI-BAIV', { files: [] });
  });

  it('returns error when instanceId is missing', () => {
    const result = generatePersonaWorkflow(null, 'vp:ICP-CMO');
    expect(result.success).toBe(false);
    expect(result.error).toContain('instanceId');
  });

  it('clears persona scope when icpRef is null', () => {
    state.activePersonaScope = 'vp:ICP-CMO';
    state.composedPFIGraph = makeComposedGraph();
    const result = generatePersonaWorkflow('PFI-BAIV', null);
    expect(result.success).toBe(true);
    expect(result.personaRef).toBeNull();
    expect(state.activePersonaScope).toBeNull();
  });

  it('returns error when no composed PFI graph exists', () => {
    state.composedPFIGraph = null;
    const result = generatePersonaWorkflow('PFI-BAIV', 'vp:ICP-CMO');
    expect(result.success).toBe(false);
    expect(result.error).toContain('No composed PFI graph');
  });

  it('sets state.activePersonaScope on success', () => {
    state.composedPFIGraph = makeComposedGraph();
    generatePersonaWorkflow('PFI-BAIV', 'vp:ICP-SocManager');
    expect(state.activePersonaScope).toBe('vp:ICP-SocManager');
  });

  it('returns workflowGraph and personaRef on success', () => {
    state.composedPFIGraph = makeComposedGraph();
    const result = generatePersonaWorkflow('PFI-BAIV', 'vp:ICP-CMO');
    expect(result.success).toBe(true);
    expect(result.personaRef).toBe('vp:ICP-CMO');
    expect(result.workflowGraph).toBeDefined();
  });
});

describe('Integration: freeze → generate → persona → scoped view', () => {
  beforeEach(() => {
    resetState();
    state.pfiInstances.set('PFI-BAIV', makeBAIVInstanceConfig());
    state.pfiInstanceData.set('PFI-BAIV', { files: [] });
  });

  it('full pipeline: freeze snapshot → generatePFIGraph → scoped view', () => {
    freezeComposedGraph(makeComposedGraphSpec(), '1.0.0', 'admin');
    const genResult = generatePFIGraph('PFI-BAIV', 'BAIV-COMPOSED-GRAPH-v1.0.0');
    expect(genResult.success).toBe(true);

    const scopedView = buildScopedFilteredView(state.composedPFIGraph);
    expect(scopedView.isScopedView).toBe(true);
    expect(scopedView.visibleEntityIds.size).toBeGreaterThanOrEqual(0);
  });

  it('persona workflow after PFI graph generation', () => {
    freezeComposedGraph(makeComposedGraphSpec(), '1.0.0', 'admin');
    generatePFIGraph('PFI-BAIV', 'BAIV-COMPOSED-GRAPH-v1.0.0');

    const personaResult = generatePersonaWorkflow('PFI-BAIV', 'vp:ICP-CMO');
    expect(personaResult.success).toBe(true);
    expect(state.activePersonaScope).toBe('vp:ICP-CMO');
  });

  it('clearing persona resets activePersonaScope', () => {
    freezeComposedGraph(makeComposedGraphSpec(), '1.0.0', 'admin');
    generatePFIGraph('PFI-BAIV', 'BAIV-COMPOSED-GRAPH-v1.0.0');
    generatePersonaWorkflow('PFI-BAIV', 'vp:ICP-CMO');
    expect(state.activePersonaScope).toBe('vp:ICP-CMO');

    generatePersonaWorkflow('PFI-BAIV', null);
    expect(state.activePersonaScope).toBeNull();
  });

  it('scoped view correctly classifies ghost entities from loaded ontologies', () => {
    state.loadedOntologies.set('KPI-ONT', {
      parsed: { entities: [{ id: 'kpi::KPI-1', '@type': 'kpi:KPI' }] },
    });

    freezeComposedGraph(makeComposedGraphSpec(), '1.0.0', 'admin');
    generatePFIGraph('PFI-BAIV', 'BAIV-COMPOSED-GRAPH-v1.0.0');

    const scopedView = buildScopedFilteredView(state.composedPFIGraph);
    expect(scopedView.ghostEntityIds.has('kpi::KPI-1')).toBe(true);
  });
});
