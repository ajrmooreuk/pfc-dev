/**
 * Unit tests for composition-filter.js — Epic 9D, Story 9D.1
 *
 * Tests the Composition Filter Bridge: buildFilteredView, applyCompositionFilter,
 * clearCompositionFilter, getActiveFilteredView, filtering helpers.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock state.js
vi.mock('../js/state.js', () => ({
  state: {
    loadedOntologies: new Map(),
    activeComposition: null,
    compositionFilterActive: false,
    ghostNodesVisible: true,
    lastComposition: null,
    activeInstanceId: null,
    contextLevel: 'PFC',
    pfiInstanceData: new Map(),
  },
  REGISTRY_BASE_PATH: '../../ONTOLOGIES/ontology-library/',
}));

// Mock emc-composer.js (only nameToNamespace needed)
vi.mock('../js/emc-composer.js', () => ({
  nameToNamespace: (name) => {
    const map = {
      VSOM: 'vsom:', OKR: 'okr:', VP: 'vp:', ORG: 'org:',
      'ORG-CONTEXT': 'org-ctx:', PE: 'pe:', EFS: 'efs:', PPM: 'ppm:',
      CA: 'ca:', CL: 'cl:', GA: 'ga:', EMC: 'emc:',
      KPI: 'kpi:', RRR: 'rrr:', PMF: 'pmf:', EA: 'ea:',
      MCSB: 'mcsb:', GDPR: 'gdpr:', PII: 'pii:',
      LSC: 'lsc:', OFM: 'ofm:', BSC: 'bsc:',
    };
    return map[name] || `${name.toLowerCase()}:`;
  },
}));

import { state } from '../js/state.js';
import {
  buildFilteredView,
  filterSeriesData,
  filterCrossSeriesEdges,
  getNodeRenderMode,
  isEdgeVisible,
  applyCompositionFilter,
  clearCompositionFilter,
  getActiveFilteredView,
} from '../js/composition-filter.js';

// ─── Test Fixtures ───────────────────────────────────────────────────────────

function makeLoadedOntologies() {
  const map = new Map();
  map.set('vsom:', { id: 'VSOM', series: 'VE-Series', name: 'VSOM Ontology' });
  map.set('okr:', { id: 'OKR', series: 'VE-Series', name: 'OKR Ontology' });
  map.set('vp:', { id: 'VP', series: 'VE-Series', name: 'VP Ontology' });
  map.set('pmf:', { id: 'PMF', series: 'VE-Series', name: 'PMF Ontology' });
  map.set('kpi:', { id: 'KPI', series: 'VE-Series', name: 'KPI Ontology' });
  map.set('org:', { id: 'ORG', series: 'Foundation', name: 'ORG Ontology' });
  map.set('org-ctx:', { id: 'ORG-CONTEXT', series: 'Foundation', name: 'ORG-CONTEXT Ontology' });
  map.set('pe:', { id: 'PE', series: 'PE-Series', name: 'PE Ontology' });
  map.set('efs:', { id: 'EFS', series: 'PE-Series', name: 'EFS Ontology' });
  map.set('ca:', { id: 'CA', series: 'Competitive', name: 'CA Ontology' });
  map.set('mcsb:', { id: 'MCSB', series: 'RCSG-Series', name: 'MCSB Ontology' });
  map.set('gdpr:', { id: 'GDPR', series: 'RCSG-Series', name: 'GDPR Ontology' });
  return map;
}

function makeStrategicComposition() {
  return {
    compositionId: 'comp-STRATEGIC-PFC-123',
    categoryCode: 'STRATEGIC',
    categoryName: 'Strategic Planning & Alignment',
    contextLevel: 'PFC',
    productCode: null,
    maturityLevel: 5,
    requiredOntologies: ['VSOM', 'OKR', 'ORG'],
    recommendedOntologies: ['ORG-CONTEXT', 'KPI'],
    optionalOntologies: [],
    allOntologies: ['VSOM', 'OKR', 'ORG', 'ORG-CONTEXT', 'KPI'],
    namespaces: ['vsom:', 'okr:', 'org:', 'org-ctx:', 'kpi:'],
    activeSeries: ['VE-Series', 'Foundation'],
    createdAt: new Date().toISOString(),
  };
}

function makeSeriesData() {
  return {
    'VE-Series': { name: 'Value Engineering', color: '#2196F3', count: 5, ontologies: ['VSOM', 'OKR', 'VP', 'PMF', 'KPI'] },
    'PE-Series': { name: 'Process Engineering', color: '#4CAF50', count: 2, ontologies: ['PE', 'EFS'] },
    'Foundation': { name: 'Foundation', color: '#FF9800', count: 2, ontologies: ['ORG', 'ORG-CONTEXT'] },
    'Competitive': { name: 'Competitive', color: '#E91E63', count: 1, ontologies: ['CA'] },
    'RCSG-Series': { name: 'RCSG', color: '#9C27B0', count: 2, ontologies: ['MCSB', 'GDPR'] },
  };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('buildFilteredView', () => {
  it('returns null for null composition', () => {
    expect(buildFilteredView(null, new Map())).toBeNull();
  });

  it('returns null for null loadedOntologies', () => {
    expect(buildFilteredView(makeStrategicComposition(), null)).toBeNull();
  });

  it('builds correct visible namespaces', () => {
    const fv = buildFilteredView(makeStrategicComposition(), makeLoadedOntologies());
    expect(fv.visibleNamespaces).toContain('vsom:');
    expect(fv.visibleNamespaces).toContain('okr:');
    expect(fv.visibleNamespaces).toContain('org:');
    expect(fv.visibleNamespaces).toContain('org-ctx:');
    expect(fv.visibleNamespaces).toContain('kpi:');
    expect(fv.visibleNamespaces.size).toBe(5);
  });

  it('identifies context ghost namespaces (in active series but not required)', () => {
    const fv = buildFilteredView(makeStrategicComposition(), makeLoadedOntologies());
    // VP, PMF are in VE-Series (active) but not in the STRATEGIC composition
    expect(fv.contextGhostNamespaces).toContain('vp:');
    expect(fv.contextGhostNamespaces).toContain('pmf:');
  });

  it('identifies hidden namespaces (not in active series)', () => {
    const fv = buildFilteredView(makeStrategicComposition(), makeLoadedOntologies());
    // PE, EFS (PE-Series), CA (Competitive), MCSB, GDPR (RCSG) are hidden
    expect(fv.hiddenNamespaces).toContain('pe:');
    expect(fv.hiddenNamespaces).toContain('efs:');
    expect(fv.hiddenNamespaces).toContain('ca:');
    expect(fv.hiddenNamespaces).toContain('mcsb:');
    expect(fv.hiddenNamespaces).toContain('gdpr:');
  });

  it('builds correct activeSeriesSet', () => {
    const fv = buildFilteredView(makeStrategicComposition(), makeLoadedOntologies());
    expect(fv.activeSeriesSet).toContain('VE-Series');
    expect(fv.activeSeriesSet).toContain('Foundation');
    expect(fv.activeSeriesSet).not.toContain('PE-Series');
    expect(fv.activeSeriesSet).not.toContain('RCSG-Series');
  });

  it('builds filter label from category name', () => {
    const fv = buildFilteredView(makeStrategicComposition(), makeLoadedOntologies());
    expect(fv.filterLabel).toBe('Strategic Planning & Alignment');
  });

  it('builds filter label with product code for PFI', () => {
    const comp = { ...makeStrategicComposition(), productCode: 'BAIV-AIV' };
    const fv = buildFilteredView(comp, makeLoadedOntologies());
    expect(fv.filterLabel).toBe('BAIV-AIV:Strategic Planning & Alignment');
  });
});

describe('filterSeriesData', () => {
  it('returns original data when no filter', () => {
    const sd = makeSeriesData();
    expect(filterSeriesData(null, sd)).toBe(sd);
  });

  it('returns only active series', () => {
    const fv = buildFilteredView(makeStrategicComposition(), makeLoadedOntologies());
    const filtered = filterSeriesData(fv, makeSeriesData());

    expect(Object.keys(filtered)).toContain('VE-Series');
    expect(Object.keys(filtered)).toContain('Foundation');
    expect(Object.keys(filtered)).not.toContain('PE-Series');
    expect(Object.keys(filtered)).not.toContain('RCSG-Series');
    expect(Object.keys(filtered)).not.toContain('Competitive');
  });

  it('adjusts counts for visible ontologies within series', () => {
    const fv = buildFilteredView(makeStrategicComposition(), makeLoadedOntologies());
    const filtered = filterSeriesData(fv, makeSeriesData());

    // VE-Series: VSOM, OKR, KPI visible; VP, PMF ghosts → count = 5 (3 visible + 2 ghost)
    expect(filtered['VE-Series'].visibleCount).toBe(3);
    expect(filtered['VE-Series'].ghostCount).toBe(2);
    expect(filtered['VE-Series'].totalCount).toBe(5);
  });
});

describe('filterCrossSeriesEdges', () => {
  it('returns original edges when no filter', () => {
    const edges = [{ from: 'VE-Series', to: 'PE-Series', count: 3 }];
    expect(filterCrossSeriesEdges(null, edges)).toBe(edges);
  });

  it('filters to only active series edges', () => {
    const fv = buildFilteredView(makeStrategicComposition(), makeLoadedOntologies());
    const edges = [
      { from: 'VE-Series', to: 'Foundation', count: 5 },
      { from: 'VE-Series', to: 'PE-Series', count: 3 },
      { from: 'PE-Series', to: 'RCSG-Series', count: 2 },
    ];
    const filtered = filterCrossSeriesEdges(fv, edges);

    expect(filtered).toHaveLength(1);
    expect(filtered[0].from).toBe('VE-Series');
    expect(filtered[0].to).toBe('Foundation');
  });
});

describe('getNodeRenderMode', () => {
  it('returns visible when no filter', () => {
    expect(getNodeRenderMode({ id: 'vsom::Vision' }, null)).toBe('visible');
  });

  it('returns visible for nodes in visible namespaces', () => {
    const fv = buildFilteredView(makeStrategicComposition(), makeLoadedOntologies());
    expect(getNodeRenderMode({ sourceNamespace: 'vsom:' }, fv)).toBe('visible');
    expect(getNodeRenderMode({ sourceNamespace: 'org:' }, fv)).toBe('visible');
  });

  it('returns ghost for nodes in context ghost namespaces', () => {
    const fv = buildFilteredView(makeStrategicComposition(), makeLoadedOntologies());
    expect(getNodeRenderMode({ sourceNamespace: 'vp:' }, fv)).toBe('ghost');
  });

  it('returns hidden for nodes in hidden namespaces', () => {
    const fv = buildFilteredView(makeStrategicComposition(), makeLoadedOntologies());
    expect(getNodeRenderMode({ sourceNamespace: 'pe:' }, fv)).toBe('hidden');
    expect(getNodeRenderMode({ sourceNamespace: 'mcsb:' }, fv)).toBe('hidden');
  });

  it('extracts namespace from node id when sourceNamespace missing', () => {
    const fv = buildFilteredView(makeStrategicComposition(), makeLoadedOntologies());
    expect(getNodeRenderMode({ id: 'vsom::Vision' }, fv)).toBe('visible');
  });
});

describe('isEdgeVisible', () => {
  const mergedGraph = {
    nodes: [
      { id: 'vsom::Vision', sourceNamespace: 'vsom:' },
      { id: 'okr::Objective', sourceNamespace: 'okr:' },
      { id: 'pe::Process', sourceNamespace: 'pe:' },
      { id: 'vp::ValueProp', sourceNamespace: 'vp:' },
    ],
  };

  it('returns true when no filter', () => {
    expect(isEdgeVisible({ from: 'vsom::Vision', to: 'pe::Process' }, null, mergedGraph)).toBe(true);
  });

  it('returns true for edge between two visible nodes', () => {
    const fv = buildFilteredView(makeStrategicComposition(), makeLoadedOntologies());
    expect(isEdgeVisible({ from: 'vsom::Vision', to: 'okr::Objective' }, fv, mergedGraph)).toBe(true);
  });

  it('returns true for edge between visible and ghost', () => {
    const fv = buildFilteredView(makeStrategicComposition(), makeLoadedOntologies());
    expect(isEdgeVisible({ from: 'vsom::Vision', to: 'vp::ValueProp' }, fv, mergedGraph)).toBe(true);
  });

  it('returns false for edge to hidden node', () => {
    const fv = buildFilteredView(makeStrategicComposition(), makeLoadedOntologies());
    expect(isEdgeVisible({ from: 'vsom::Vision', to: 'pe::Process' }, fv, mergedGraph)).toBe(false);
  });
});

describe('applyCompositionFilter / clearCompositionFilter', () => {
  beforeEach(() => {
    state.loadedOntologies = makeLoadedOntologies();
    state.activeComposition = null;
    state.compositionFilterActive = false;
    state.lastComposition = null;
  });

  it('applies composition and sets state', () => {
    const comp = makeStrategicComposition();
    const fv = applyCompositionFilter(comp);

    expect(fv).not.toBeNull();
    expect(state.compositionFilterActive).toBe(true);
    expect(state.activeComposition).toBe(comp);
    expect(state.lastComposition).toBe(comp);
  });

  it('returns null when no loaded ontologies', () => {
    state.loadedOntologies = new Map();
    expect(applyCompositionFilter(makeStrategicComposition())).toBeNull();
  });

  it('returns null for null composition', () => {
    expect(applyCompositionFilter(null)).toBeNull();
  });

  it('clears composition filter', () => {
    applyCompositionFilter(makeStrategicComposition());
    clearCompositionFilter();

    expect(state.compositionFilterActive).toBe(false);
    expect(state.activeComposition).toBeNull();
  });
});

describe('getActiveFilteredView', () => {
  beforeEach(() => {
    state.loadedOntologies = makeLoadedOntologies();
    state.activeComposition = null;
    state.compositionFilterActive = false;
  });

  it('returns null when no filter active', () => {
    expect(getActiveFilteredView()).toBeNull();
  });

  it('returns FilteredView when filter active', () => {
    applyCompositionFilter(makeStrategicComposition());
    const fv = getActiveFilteredView();

    expect(fv).not.toBeNull();
    expect(fv.visibleNamespaces).toContain('vsom:');
    expect(fv.filterLabel).toContain('Strategic');
  });
});
