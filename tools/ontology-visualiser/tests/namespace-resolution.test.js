/**
 * TDD tests for S21.17.3: Registry-backed namespace resolution.
 * Replaces the fragile fallback scan in resolveNodeInMergedGraph
 * with an entity alias index built during buildMergedGraph.
 * Written BEFORE implementation per F21.14 TDD policy.
 */

import { describe, it, expect, vi } from 'vitest';

// Mock browser-dependent modules before importing the module under test
vi.mock('../js/state.js', () => ({
  state: {
    viewMode: 'multi',
    loadedOntologies: new Map(),
    mergedGraph: null,
    seriesData: null,
  },
  REGISTRY_BASE_PATH: '../../ONTOLOGIES/ontology-library/',
  SERIES_COLORS: {},
}));

vi.mock('../js/ontology-parser.js', () => ({
  parseOntology: vi.fn(() => ({ nodes: [], edges: [], name: 'mock' })),
}));

vi.mock('../js/github-loader.js', () => ({
  loadRegistryIndex: vi.fn(),
}));

const { buildMergedGraph, resolveNodeInMergedGraph } = await import('../js/multi-loader.js');

// ── Fixtures ──

function makeRecord(ns, entities) {
  const nodes = entities.map(e => ({
    id: e.id,
    label: e.label || e.id.split(':').pop(),
    type: 'entity'
  }));
  const edges = [];
  return {
    parsed: { nodes, edges },
    name: ns.replace(/:$/, '').toUpperCase() + '-ONT',
    series: 'Test',
    isPlaceholder: false,
    rawData: {}
  };
}

// ── buildMergedGraph: entity alias index ──

describe('buildMergedGraph entity alias index', () => {
  it('builds entityAliasIndex in returned graph', () => {
    const loaded = new Map();
    loaded.set('vsom:', makeRecord('vsom:', [
      { id: 'vsom:StrategicObjective' },
      { id: 'vsom:VisionComponent' },
    ]));
    const graph = buildMergedGraph(loaded);
    expect(graph.entityAliasIndex).toBeDefined();
    expect(graph.entityAliasIndex).toBeInstanceOf(Map);
  });

  it('maps canonical prefix + local name to prefixed node ID', () => {
    const loaded = new Map();
    loaded.set('vsom:', makeRecord('vsom:', [
      { id: 'vsom:StrategicObjective' },
    ]));
    const graph = buildMergedGraph(loaded);
    // vsom:StrategicObjective → vsom::vsom:StrategicObjective
    expect(graph.entityAliasIndex.get('vsom:StrategicObjective')).toBe('vsom::vsom:StrategicObjective');
  });

  it('resolves mismatched prefix entities (pfc:Vision in kpi namespace)', () => {
    const loaded = new Map();
    loaded.set('kpi:', makeRecord('kpi:', [
      { id: 'pfc:Vision' },
      { id: 'pfc:KPI' },
    ]));
    const graph = buildMergedGraph(loaded);
    // kpi:Vision should resolve to kpi::pfc:Vision
    expect(graph.entityAliasIndex.get('kpi:Vision')).toBe('kpi::pfc:Vision');
    expect(graph.entityAliasIndex.get('kpi:KPI')).toBe('kpi::pfc:KPI');
  });

  it('resolves pf: alias entities in org namespace', () => {
    const loaded = new Map();
    loaded.set('org:', makeRecord('org:', [
      { id: 'pf:Organization' },
      { id: 'pf:OrganizationContext' },
    ]));
    const graph = buildMergedGraph(loaded);
    expect(graph.entityAliasIndex.get('org:Organization')).toBe('org::pf:Organization');
    expect(graph.entityAliasIndex.get('org:OrganizationContext')).toBe('org::pf:OrganizationContext');
  });

  it('handles entities without prefix (bare names)', () => {
    const loaded = new Map();
    loaded.set('test:', makeRecord('test:', [
      { id: 'SimpleEntity' },
    ]));
    const graph = buildMergedGraph(loaded);
    expect(graph.entityAliasIndex.get('test:SimpleEntity')).toBe('test::SimpleEntity');
  });
});

// ── resolveNodeInMergedGraph with alias index ──

describe('resolveNodeInMergedGraph with entity alias index', () => {
  it('resolves direct prefixed match (existing behaviour)', () => {
    const nodeIndex = new Map();
    nodeIndex.set('vsom::vsom:Objective', true);
    const result = resolveNodeInMergedGraph(
      { prefix: 'vsom', entity: 'vsom:Objective' },
      nodeIndex
    );
    expect(result).toBe('vsom::vsom:Objective');
  });

  it('resolves via entityAliasIndex instead of fallback scan', () => {
    const nodeIndex = new Map();
    nodeIndex.set('kpi::pfc:Vision', true);
    // kpi:Vision is NOT in nodeIndex directly
    const entityAliasIndex = new Map();
    entityAliasIndex.set('kpi:Vision', 'kpi::pfc:Vision');

    const result = resolveNodeInMergedGraph(
      { prefix: 'kpi', entity: 'Vision' },
      nodeIndex,
      entityAliasIndex
    );
    expect(result).toBe('kpi::pfc:Vision');
  });

  it('resolves pf:Organization via alias in org namespace', () => {
    const nodeIndex = new Map();
    nodeIndex.set('org::pf:Organization', true);
    const entityAliasIndex = new Map();
    entityAliasIndex.set('org:Organization', 'org::pf:Organization');

    const result = resolveNodeInMergedGraph(
      { prefix: 'org', entity: 'Organization' },
      nodeIndex,
      entityAliasIndex
    );
    expect(result).toBe('org::pf:Organization');
  });

  it('returns null when no match found anywhere', () => {
    const nodeIndex = new Map();
    const entityAliasIndex = new Map();
    const result = resolveNodeInMergedGraph(
      { prefix: 'xyz', entity: 'Unknown' },
      nodeIndex,
      entityAliasIndex
    );
    expect(result).toBeNull();
  });

  it('prefers direct match over alias', () => {
    const nodeIndex = new Map();
    nodeIndex.set('vsom::vsom:Vision', true);
    const entityAliasIndex = new Map();
    entityAliasIndex.set('vsom:Vision', 'vsom::vsom:Vision');

    const result = resolveNodeInMergedGraph(
      { prefix: 'vsom', entity: 'vsom:Vision' },
      nodeIndex
    );
    expect(result).toBe('vsom::vsom:Vision');
  });

  it('works without entityAliasIndex (backward compat)', () => {
    const nodeIndex = new Map();
    nodeIndex.set('test::Alpha', true);
    // No alias index — should still resolve direct matches
    const result = resolveNodeInMergedGraph(
      { prefix: 'test', entity: 'Alpha' },
      nodeIndex
    );
    expect(result).toBe('test::Alpha');
  });
});
