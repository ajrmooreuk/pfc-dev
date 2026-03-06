/**
 * Unit tests for canonical graph snapshots — Epic 19, Feature 19.3
 *
 * Tests freezeComposedGraph, getCanonicalSnapshot, listSnapshotVersions,
 * inheritSnapshot, diffSnapshots, immutability enforcement, and persistence.
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
  getCanonicalSnapshot,
  listSnapshotVersions,
  inheritSnapshot,
  diffSnapshots,
  restoreCompositionState,
} from '../js/emc-composer.js';

// ─── Fixture Helpers ────────────────────────────────────────────────────────

function makeComposedGraphSpec(overrides = {}) {
  return {
    specId: 'BAIV-COMPOSED-GRAPH',
    '@id': 'BAIV-COMPOSED-GRAPH',
    '@type': 'emc:ComposedGraphSpec',
    componentOntologies: [
      { ontologyRef: 'VP-ONT', series: 'VE-Series', required: true },
      { ontologyRef: 'RRR-ONT', series: 'VE-Series', required: true },
      { ontologyRef: 'KPI-ONT', series: 'VE-Series', required: false },
    ],
    joinPoints: [
      { from: 'vp:Solution', to: 'rrr:Requirement', relationship: 'alignsTo' },
    ],
    scopeRules: ['RULE-MKT-001', 'RULE-COMP-001'],
    entityCount: 42,
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

function resetState() {
  state.canonicalSnapshots.clear();
  state.snapshotVersionIndex.clear();
  state.pfiInstances.clear();
  state.pfiInstanceData.clear();
  state.composedPFIGraph = null;
  state.activeScopeRules = null;
  state.scopeRulesActive = false;
  state.activePersonaScope = null;
  state.productContext = null;
  state.scopeRuleLog = [];
  state.compositionManifests = [];
  localStorageMock.clear();
}

// ─── Test Suites ────────────────────────────────────────────────────────────

describe('freezeComposedGraph (S19.3.1)', () => {
  beforeEach(resetState);

  it('returns success and a frozen snapshot with correct metadata', () => {
    const spec = makeComposedGraphSpec();
    const result = freezeComposedGraph(spec, '1.0.0', 'admin@pfc.io');

    expect(result.success).toBe(true);
    expect(result.snapshot).toBeDefined();
    expect(result.snapshot.snapshotId).toBe('BAIV-COMPOSED-GRAPH-v1.0.0');
    expect(result.snapshot.snapshotVersion).toBe('1.0.0');
    expect(result.snapshot.frozenBy).toBe('admin@pfc.io');
    expect(result.snapshot.changeControlStatus).toBe('locked');
    expect(result.snapshot.frozenAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('deep-clones source — mutation of source does not affect snapshot', () => {
    const spec = makeComposedGraphSpec();
    const result = freezeComposedGraph(spec, '1.0.0', 'admin');
    spec.entityCount = 999;
    spec.componentOntologies.push({ ontologyRef: 'EXTRA-ONT' });

    const stored = getCanonicalSnapshot('BAIV-COMPOSED-GRAPH-v1.0.0');
    expect(stored.entityCount).toBe(42);
    expect(stored.componentOntologies).toHaveLength(3);
  });

  it('rejects invalid semver versions', () => {
    const spec = makeComposedGraphSpec();
    expect(freezeComposedGraph(spec, 'abc', 'admin').success).toBe(false);
    expect(freezeComposedGraph(spec, '1.0', 'admin').success).toBe(false);
    expect(freezeComposedGraph(spec, '', 'admin').success).toBe(false);
    expect(freezeComposedGraph(spec, null, 'admin').success).toBe(false);
  });

  it('rejects duplicate snapshotId', () => {
    const spec = makeComposedGraphSpec();
    freezeComposedGraph(spec, '1.0.0', 'admin');
    const dup = freezeComposedGraph(spec, '1.0.0', 'admin');
    expect(dup.success).toBe(false);
    expect(dup.error).toContain('already exists');
  });

  it('rejects null composedGraphSpec', () => {
    expect(freezeComposedGraph(null, '1.0.0', 'admin').success).toBe(false);
  });

  it('supersedes previous version and sets parentSnapshot link', () => {
    const spec = makeComposedGraphSpec();
    freezeComposedGraph(spec, '1.0.0', 'admin');
    freezeComposedGraph(spec, '2.0.0', 'admin');

    const v1 = getCanonicalSnapshot('BAIV-COMPOSED-GRAPH-v1.0.0');
    const v2 = getCanonicalSnapshot('BAIV-COMPOSED-GRAPH-v2.0.0');

    expect(v1.changeControlStatus).toBe('superseded');
    expect(v2.changeControlStatus).toBe('locked');
    expect(v2.parentSnapshot).toBe('BAIV-COMPOSED-GRAPH-v1.0.0');
    expect(v1.parentSnapshot).toBeNull();
  });

  it('stores snapshot in state.canonicalSnapshots', () => {
    const spec = makeComposedGraphSpec();
    freezeComposedGraph(spec, '1.0.0', 'admin');
    expect(state.canonicalSnapshots.has('BAIV-COMPOSED-GRAPH-v1.0.0')).toBe(true);
  });

  it('updates snapshotVersionIndex', () => {
    const spec = makeComposedGraphSpec();
    freezeComposedGraph(spec, '1.0.0', 'admin');
    freezeComposedGraph(spec, '1.1.0', 'admin');

    const idx = state.snapshotVersionIndex.get('BAIV-COMPOSED-GRAPH');
    expect(idx).toEqual(['BAIV-COMPOSED-GRAPH-v1.0.0', 'BAIV-COMPOSED-GRAPH-v1.1.0']);
  });

  it('persists to localStorage', () => {
    const spec = makeComposedGraphSpec();
    freezeComposedGraph(spec, '1.0.0', 'admin');

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'oaa-viz-canonical-snapshots',
      expect.any(String),
    );
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'oaa-viz-snapshot-version-index',
      expect.any(String),
    );
  });

  it('uses @id as fallback specId when specId is missing', () => {
    const spec = makeComposedGraphSpec({ specId: undefined });
    const result = freezeComposedGraph(spec, '1.0.0', 'admin');
    expect(result.snapshot.snapshotId).toBe('BAIV-COMPOSED-GRAPH-v1.0.0');
  });
});

describe('getCanonicalSnapshot (S19.3.2)', () => {
  beforeEach(resetState);

  it('returns a frozen copy of the snapshot', () => {
    freezeComposedGraph(makeComposedGraphSpec(), '1.0.0', 'admin');
    const snap = getCanonicalSnapshot('BAIV-COMPOSED-GRAPH-v1.0.0');

    expect(snap).toBeDefined();
    expect(snap.snapshotId).toBe('BAIV-COMPOSED-GRAPH-v1.0.0');
    expect(Object.isFrozen(snap)).toBe(true);
  });

  it('returns null for unknown snapshotId', () => {
    expect(getCanonicalSnapshot('non-existent')).toBeNull();
  });

  it('returns a copy, not the stored reference', () => {
    freezeComposedGraph(makeComposedGraphSpec(), '1.0.0', 'admin');
    const snap1 = getCanonicalSnapshot('BAIV-COMPOSED-GRAPH-v1.0.0');
    const snap2 = getCanonicalSnapshot('BAIV-COMPOSED-GRAPH-v1.0.0');
    expect(snap1).not.toBe(snap2);
    expect(snap1).toEqual(snap2);
  });

  it('returned copy has all metadata fields', () => {
    freezeComposedGraph(makeComposedGraphSpec(), '1.0.0', 'admin');
    const snap = getCanonicalSnapshot('BAIV-COMPOSED-GRAPH-v1.0.0');

    expect(snap).toHaveProperty('snapshotId');
    expect(snap).toHaveProperty('snapshotVersion');
    expect(snap).toHaveProperty('frozenAt');
    expect(snap).toHaveProperty('frozenBy');
    expect(snap).toHaveProperty('changeControlStatus');
    expect(snap).toHaveProperty('parentSnapshot');
    expect(snap).toHaveProperty('sourceComposedGraphSpec');
  });
});

describe('listSnapshotVersions (S19.3.3)', () => {
  beforeEach(resetState);

  it('returns empty array for unknown specId', () => {
    expect(listSnapshotVersions('non-existent')).toEqual([]);
  });

  it('returns single version correctly', () => {
    freezeComposedGraph(makeComposedGraphSpec(), '1.0.0', 'admin');
    const versions = listSnapshotVersions('BAIV-COMPOSED-GRAPH');

    expect(versions).toHaveLength(1);
    expect(versions[0].version).toBe('1.0.0');
    expect(versions[0].changeControlStatus).toBe('locked');
  });

  it('returns versions sorted by semver ascending', () => {
    const spec = makeComposedGraphSpec();
    freezeComposedGraph(spec, '1.0.0', 'admin');
    freezeComposedGraph(spec, '2.0.0', 'admin');
    freezeComposedGraph(spec, '1.1.0', 'admin');

    const versions = listSnapshotVersions('BAIV-COMPOSED-GRAPH');
    expect(versions.map(v => v.version)).toEqual(['1.0.0', '1.1.0', '2.0.0']);
  });

  it('handles complex semver ordering (1.0.0 < 1.1.0 < 1.2.0 < 2.0.0)', () => {
    const spec = makeComposedGraphSpec();
    freezeComposedGraph(spec, '2.0.0', 'admin');
    freezeComposedGraph(spec, '1.2.0', 'admin');
    freezeComposedGraph(spec, '1.0.0', 'admin');
    freezeComposedGraph(spec, '1.1.0', 'admin');

    const versions = listSnapshotVersions('BAIV-COMPOSED-GRAPH');
    expect(versions.map(v => v.version)).toEqual(['1.0.0', '1.1.0', '1.2.0', '2.0.0']);
  });

  it('includes status and parentSnapshot in each entry', () => {
    const spec = makeComposedGraphSpec();
    freezeComposedGraph(spec, '1.0.0', 'admin');
    freezeComposedGraph(spec, '2.0.0', 'admin');

    const versions = listSnapshotVersions('BAIV-COMPOSED-GRAPH');
    expect(versions[0]).toHaveProperty('changeControlStatus');
    expect(versions[0]).toHaveProperty('parentSnapshot');
    expect(versions[0]).toHaveProperty('frozenAt');
    expect(versions[0]).toHaveProperty('snapshotId');
  });

  it('filters by specId — different specs have separate version chains', () => {
    freezeComposedGraph(makeComposedGraphSpec({ specId: 'SPEC-A' }), '1.0.0', 'admin');
    freezeComposedGraph(makeComposedGraphSpec({ specId: 'SPEC-B' }), '1.0.0', 'admin');
    freezeComposedGraph(makeComposedGraphSpec({ specId: 'SPEC-A' }), '2.0.0', 'admin');

    const versionsA = listSnapshotVersions('SPEC-A');
    const versionsB = listSnapshotVersions('SPEC-B');

    expect(versionsA).toHaveLength(2);
    expect(versionsB).toHaveLength(1);
  });
});

describe('inheritSnapshot (S19.3.4)', () => {
  beforeEach(() => {
    resetState();
    // Set up a BAIV instance with the data needed for composition
    state.pfiInstances.set('PFI-BAIV', makeBAIVInstanceConfig());
    state.pfiInstanceData.set('PFI-BAIV', { files: [] });
  });

  it('rejects unknown snapshotId', () => {
    const result = inheritSnapshot('PFI-BAIV', 'non-existent');
    expect(result.success).toBe(false);
    expect(result.error).toContain('not found');
  });

  it('rejects superseded snapshot', () => {
    const spec = makeComposedGraphSpec();
    freezeComposedGraph(spec, '1.0.0', 'admin');
    freezeComposedGraph(spec, '2.0.0', 'admin');

    const result = inheritSnapshot('PFI-BAIV', 'BAIV-COMPOSED-GRAPH-v1.0.0');
    expect(result.success).toBe(false);
    expect(result.error).toContain('superseded');
  });

  it('accepts locked snapshot and returns success', () => {
    freezeComposedGraph(makeComposedGraphSpec(), '1.0.0', 'admin');
    const result = inheritSnapshot('PFI-BAIV', 'BAIV-COMPOSED-GRAPH-v1.0.0');
    expect(result.success).toBe(true);
    expect(result.composedGraph).toBeDefined();
  });

  it('stores inheritedSnapshotId on instance config', () => {
    freezeComposedGraph(makeComposedGraphSpec(), '1.0.0', 'admin');
    inheritSnapshot('PFI-BAIV', 'BAIV-COMPOSED-GRAPH-v1.0.0');

    const instance = state.pfiInstances.get('PFI-BAIV');
    expect(instance.inheritedSnapshotId).toBe('BAIV-COMPOSED-GRAPH-v1.0.0');
  });

  it('stores composed graph in state.composedPFIGraph', () => {
    freezeComposedGraph(makeComposedGraphSpec(), '1.0.0', 'admin');
    inheritSnapshot('PFI-BAIV', 'BAIV-COMPOSED-GRAPH-v1.0.0');
    expect(state.composedPFIGraph).toBeDefined();
  });

  it('multiple instances can inherit the same snapshot', () => {
    state.pfiInstances.set('PFI-VHF', {
      instanceId: 'PFI-VHF',
      products: ['VHF-B2C'],
      productCode: 'VHF-B2C',
      brands: ['VHF'],
      requirementScopes: ['PRODUCT'],
      maturityLevel: 1,
      verticalMarket: 'Health',
      jurisdictions: ['UK'],
      orgContext: { industry: 'Health', size: 'SME' },
      composedGraphSpec: { joinPoints: [] },
    });
    state.pfiInstanceData.set('PFI-VHF', { files: [] });

    freezeComposedGraph(makeComposedGraphSpec(), '1.0.0', 'admin');

    const r1 = inheritSnapshot('PFI-BAIV', 'BAIV-COMPOSED-GRAPH-v1.0.0');
    const r2 = inheritSnapshot('PFI-VHF', 'BAIV-COMPOSED-GRAPH-v1.0.0');

    expect(r1.success).toBe(true);
    expect(r2.success).toBe(true);
  });

  it('creates instance config if instanceId not found in state', () => {
    freezeComposedGraph(makeComposedGraphSpec(), '1.0.0', 'admin');
    inheritSnapshot('PFI-NEW', 'BAIV-COMPOSED-GRAPH-v1.0.0');

    const instance = state.pfiInstances.get('PFI-NEW');
    expect(instance).toBeDefined();
    expect(instance.inheritedSnapshotId).toBe('BAIV-COMPOSED-GRAPH-v1.0.0');
  });
});

describe('Immutability enforcement (S19.3.5)', () => {
  beforeEach(resetState);

  it('Object.freeze is applied to snapshot from freezeComposedGraph', () => {
    freezeComposedGraph(makeComposedGraphSpec(), '1.0.0', 'admin');
    const snap = state.canonicalSnapshots.get('BAIV-COMPOSED-GRAPH-v1.0.0');
    expect(Object.isFrozen(snap)).toBe(true);
  });

  it('nested objects are also frozen', () => {
    freezeComposedGraph(makeComposedGraphSpec(), '1.0.0', 'admin');
    const snap = state.canonicalSnapshots.get('BAIV-COMPOSED-GRAPH-v1.0.0');
    expect(Object.isFrozen(snap.componentOntologies)).toBe(true);
    expect(Object.isFrozen(snap.componentOntologies[0])).toBe(true);
  });

  it('nested arrays are frozen', () => {
    freezeComposedGraph(makeComposedGraphSpec(), '1.0.0', 'admin');
    const snap = state.canonicalSnapshots.get('BAIV-COMPOSED-GRAPH-v1.0.0');
    expect(Object.isFrozen(snap.scopeRules)).toBe(true);
    expect(Object.isFrozen(snap.joinPoints)).toBe(true);
  });

  it('modification attempts on frozen snapshot are rejected (strict mode)', () => {
    freezeComposedGraph(makeComposedGraphSpec(), '1.0.0', 'admin');
    const snap = state.canonicalSnapshots.get('BAIV-COMPOSED-GRAPH-v1.0.0');

    // In strict mode, assignment to frozen object throws
    expect(() => { 'use strict'; snap.entityCount = 999; }).toThrow();
  });

  it('getCanonicalSnapshot returns frozen copy', () => {
    freezeComposedGraph(makeComposedGraphSpec(), '1.0.0', 'admin');
    const snap = getCanonicalSnapshot('BAIV-COMPOSED-GRAPH-v1.0.0');
    expect(Object.isFrozen(snap)).toBe(true);
    expect(Object.isFrozen(snap.componentOntologies)).toBe(true);
  });

  it('status transition from locked → superseded works correctly', () => {
    const spec = makeComposedGraphSpec();
    freezeComposedGraph(spec, '1.0.0', 'admin');

    // v1 is locked
    let v1 = getCanonicalSnapshot('BAIV-COMPOSED-GRAPH-v1.0.0');
    expect(v1.changeControlStatus).toBe('locked');

    // Create v2 → v1 becomes superseded
    freezeComposedGraph(spec, '2.0.0', 'admin');
    v1 = getCanonicalSnapshot('BAIV-COMPOSED-GRAPH-v1.0.0');
    expect(v1.changeControlStatus).toBe('superseded');
  });

  it('superseded snapshot stays frozen', () => {
    const spec = makeComposedGraphSpec();
    freezeComposedGraph(spec, '1.0.0', 'admin');
    freezeComposedGraph(spec, '2.0.0', 'admin');

    const v1 = state.canonicalSnapshots.get('BAIV-COMPOSED-GRAPH-v1.0.0');
    expect(Object.isFrozen(v1)).toBe(true);
    expect(v1.changeControlStatus).toBe('superseded');
  });

  it('version bump required — cannot reuse locked version', () => {
    const spec = makeComposedGraphSpec();
    freezeComposedGraph(spec, '1.0.0', 'admin');
    const dup = freezeComposedGraph(spec, '1.0.0', 'admin');
    expect(dup.success).toBe(false);
  });
});

describe('diffSnapshots (S19.3.6)', () => {
  beforeEach(resetState);

  it('detects node additions', () => {
    const specV1 = makeComposedGraphSpec({
      componentOntologies: [
        { ontologyRef: 'VP-ONT', series: 'VE-Series', required: true },
      ],
    });
    const specV2 = makeComposedGraphSpec({
      componentOntologies: [
        { ontologyRef: 'VP-ONT', series: 'VE-Series', required: true },
        { ontologyRef: 'RRR-ONT', series: 'VE-Series', required: true },
      ],
    });
    freezeComposedGraph(specV1, '1.0.0', 'admin');
    freezeComposedGraph(specV2, '2.0.0', 'admin');

    const diff = diffSnapshots('BAIV-COMPOSED-GRAPH-v1.0.0', 'BAIV-COMPOSED-GRAPH-v2.0.0');
    expect(diff.success).toBe(true);
    expect(diff.summary.nodesAdded).toBe(1);
  });

  it('detects node removals', () => {
    const specV1 = makeComposedGraphSpec({
      componentOntologies: [
        { ontologyRef: 'VP-ONT', series: 'VE-Series', required: true },
        { ontologyRef: 'RRR-ONT', series: 'VE-Series', required: true },
      ],
    });
    const specV2 = makeComposedGraphSpec({
      componentOntologies: [
        { ontologyRef: 'VP-ONT', series: 'VE-Series', required: true },
      ],
    });
    freezeComposedGraph(specV1, '1.0.0', 'admin');
    freezeComposedGraph(specV2, '2.0.0', 'admin');

    const diff = diffSnapshots('BAIV-COMPOSED-GRAPH-v1.0.0', 'BAIV-COMPOSED-GRAPH-v2.0.0');
    expect(diff.summary.nodesRemoved).toBe(1);
  });

  it('detects node modifications', () => {
    const specV1 = makeComposedGraphSpec({
      componentOntologies: [
        { ontologyRef: 'VP-ONT', series: 'VE-Series', required: true },
      ],
    });
    const specV2 = makeComposedGraphSpec({
      componentOntologies: [
        { ontologyRef: 'VP-ONT', series: 'VE-Series', required: false },
      ],
    });
    freezeComposedGraph(specV1, '1.0.0', 'admin');
    freezeComposedGraph(specV2, '2.0.0', 'admin');

    const diff = diffSnapshots('BAIV-COMPOSED-GRAPH-v1.0.0', 'BAIV-COMPOSED-GRAPH-v2.0.0');
    expect(diff.summary.nodesModified).toBe(1);
  });

  it('detects edge additions', () => {
    const specV1 = makeComposedGraphSpec({ joinPoints: [] });
    const specV2 = makeComposedGraphSpec({
      joinPoints: [
        { from: 'vp:Solution', to: 'rrr:Requirement', relationship: 'alignsTo' },
      ],
    });
    freezeComposedGraph(specV1, '1.0.0', 'admin');
    freezeComposedGraph(specV2, '2.0.0', 'admin');

    const diff = diffSnapshots('BAIV-COMPOSED-GRAPH-v1.0.0', 'BAIV-COMPOSED-GRAPH-v2.0.0');
    expect(diff.summary.edgesAdded).toBe(1);
  });

  it('detects edge removals', () => {
    const specV1 = makeComposedGraphSpec({
      joinPoints: [
        { from: 'vp:Solution', to: 'rrr:Requirement', relationship: 'alignsTo' },
      ],
    });
    const specV2 = makeComposedGraphSpec({ joinPoints: [] });
    freezeComposedGraph(specV1, '1.0.0', 'admin');
    freezeComposedGraph(specV2, '2.0.0', 'admin');

    const diff = diffSnapshots('BAIV-COMPOSED-GRAPH-v1.0.0', 'BAIV-COMPOSED-GRAPH-v2.0.0');
    expect(diff.summary.edgesRemoved).toBe(1);
  });

  it('detects metadata changes', () => {
    const spec = makeComposedGraphSpec();
    freezeComposedGraph(spec, '1.0.0', 'admin');
    freezeComposedGraph(spec, '2.0.0', 'admin');

    const diff = diffSnapshots('BAIV-COMPOSED-GRAPH-v1.0.0', 'BAIV-COMPOSED-GRAPH-v2.0.0');
    expect(diff.metadata.length).toBeGreaterThan(0);
    const versionChange = diff.metadata.find(m => m.property === 'snapshotVersion');
    expect(versionChange).toBeDefined();
    expect(versionChange.oldValue).toBe('1.0.0');
    expect(versionChange.newValue).toBe('2.0.0');
  });

  it('first version (null old) — everything is added', () => {
    freezeComposedGraph(makeComposedGraphSpec(), '1.0.0', 'admin');
    const diff = diffSnapshots(null, 'BAIV-COMPOSED-GRAPH-v1.0.0');

    expect(diff.success).toBe(true);
    expect(diff.summary.nodesAdded).toBe(3);
    expect(diff.summary.nodesRemoved).toBe(0);
    expect(diff.oldVersion).toBeNull();
    expect(diff.newVersion).toBe('1.0.0');
  });

  it('returns error for unknown new snapshotId', () => {
    const diff = diffSnapshots(null, 'non-existent');
    expect(diff.success).toBe(false);
    expect(diff.error).toContain('not found');
  });
});

describe('Persistence and restore (restoreCompositionState)', () => {
  beforeEach(resetState);

  it('restoreCompositionState restores snapshots from localStorage', () => {
    // Freeze a snapshot — _persistSnapshots writes to mock store
    freezeComposedGraph(makeComposedGraphSpec(), '1.0.0', 'admin');

    // Clear state only (NOT localStorage) to simulate fresh load
    state.canonicalSnapshots.clear();
    state.snapshotVersionIndex.clear();

    restoreCompositionState();

    expect(state.canonicalSnapshots.has('BAIV-COMPOSED-GRAPH-v1.0.0')).toBe(true);
    const restored = state.canonicalSnapshots.get('BAIV-COMPOSED-GRAPH-v1.0.0');
    expect(restored.changeControlStatus).toBe('locked');
    expect(Object.isFrozen(restored)).toBe(true);
  });

  it('restoreCompositionState restores version index from localStorage', () => {
    freezeComposedGraph(makeComposedGraphSpec(), '1.0.0', 'admin');
    freezeComposedGraph(makeComposedGraphSpec(), '2.0.0', 'admin');

    // Clear state only (NOT localStorage)
    state.canonicalSnapshots.clear();
    state.snapshotVersionIndex.clear();

    restoreCompositionState();

    const idx = state.snapshotVersionIndex.get('BAIV-COMPOSED-GRAPH');
    expect(idx).toHaveLength(2);
  });

  it('handles missing localStorage data gracefully', () => {
    // Store is empty after resetState — restoreCompositionState should not throw
    expect(() => restoreCompositionState()).not.toThrow();
    expect(state.canonicalSnapshots.size).toBe(0);
  });
});
