/**
 * Unit tests for product/ICP entity bindings — Epic 19, Feature 19.5
 *
 * Tests resolveProductBindings, resolveICPBindings, inferProductBindings,
 * and the ProductEntityBinding ontology model validation.
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
  resolveProductBindings,
  resolveICPBindings,
  inferProductBindings,
} from '../js/emc-composer.js';

// ─── Fixture Helpers ────────────────────────────────────────────────────────

function makeBAIVInstanceConfig() {
  return {
    productCode: 'BAIV-AIV',
    products: ['AIV'],
    brands: ['BAIV'],
    verticalMarket: 'MarTech',
    maturityLevel: 1,
  };
}

function makeBAIVInstanceData() {
  return {
    config: makeBAIVInstanceConfig(),
    files: [
      {
        ontologyRef: 'VP-ONT',
        status: 'loaded',
        parsed: {
          nodes: [
            { id: 'ICP-CMO', label: 'CMO', entityType: 'class', properties: { roleRef: 'pf:exec-cmo', seniorityLevel: 1, functionScope: 'Strategic' } },
            { id: 'ICP-MarketingDir', label: 'Marketing Director', entityType: 'class', properties: { roleRef: 'pf:func-marketing-director', seniorityLevel: 3, functionScope: 'Tactical' } },
            { id: 'prob-strategic-01', label: 'No AI Marketing Strategy', entityType: 'class', properties: { ownerRole: 'pf:exec-cmo', scopeLevel: 'Strategic' } },
            { id: 'prob-tactical-01', label: 'Content Pipeline Bottleneck', entityType: 'class', properties: { ownerRole: 'pf:func-marketing-director', scopeLevel: 'Tactical' } },
            { id: 'sol-01', label: 'AI Content Engine', entityType: 'class', properties: {} },
            { id: 'ben-01', label: 'Faster Time to Market', entityType: 'class', properties: {} },
          ],
          edges: [
            { from: 'prob-strategic-01', to: 'sol-01', label: 'hasSolution' },
            { from: 'prob-tactical-01', to: 'ben-01', label: 'hasBenefit' },
            { from: 'ICP-CMO', to: 'prob-strategic-01', label: 'icpHasProblem' },
          ],
        },
      },
      {
        ontologyRef: 'RRR-ONT',
        status: 'loaded',
        parsed: {
          nodes: [
            { id: 'role-cmo', label: 'CMO Role', entityType: 'class', properties: {} },
            { id: 'risk-01', label: 'Market Share Risk', entityType: 'class', properties: {} },
          ],
          edges: [
            { from: 'role-cmo', to: 'risk-01', label: 'hasRisk' },
          ],
        },
      },
      {
        ontologyRef: 'EFS-ONT',
        status: 'loaded',
        parsed: {
          nodes: [
            { id: 'epic-01', label: 'AI Integration Epic', entityType: 'class', properties: {} },
            { id: 'feature-01', label: 'Content Gen Feature', entityType: 'class', properties: {} },
          ],
          edges: [
            { from: 'epic-01', to: 'feature-01', label: 'hasFeature' },
          ],
        },
      },
    ],
  };
}

function makeEmptyInstanceData() {
  return {
    config: { productCode: 'TEST-PROD' },
    files: [],
  };
}

function makeComposedGraph() {
  return {
    nodes: [
      { id: 'vp::ICP-CMO', label: 'CMO', sourceNamespace: 'vp:' },
      { id: 'vp::prob-strategic-01', label: 'No AI Marketing Strategy', sourceNamespace: 'vp:' },
      { id: 'vp::sol-01', label: 'AI Content Engine', sourceNamespace: 'vp:' },
      { id: 'rrr::role-cmo', label: 'CMO Role', sourceNamespace: 'rrr:' },
      { id: 'rrr::risk-01', label: 'Market Share Risk', sourceNamespace: 'rrr:' },
      { id: 'efs::epic-01', label: 'AI Integration Epic', sourceNamespace: 'efs:' },
      { id: 'efs::feature-01', label: 'Content Gen Feature', sourceNamespace: 'efs:' },
      { id: 'org-ctx::competitor-01', label: 'Competitor A', sourceNamespace: 'org-ctx:' },
    ],
    edges: [
      { from: 'vp::ICP-CMO', to: 'vp::prob-strategic-01', label: 'icpHasProblem' },
      { from: 'vp::prob-strategic-01', to: 'vp::sol-01', label: 'hasSolution' },
      { from: 'rrr::role-cmo', to: 'rrr::risk-01', label: 'hasRisk' },
      { from: 'efs::epic-01', to: 'efs::feature-01', label: 'hasFeature' },
      { from: 'vp::sol-01', to: 'efs::epic-01', label: 'crossJoin' },
    ],
  };
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('resolveProductBindings', () => {
  beforeEach(() => {
    state.pfiInstances.clear();
    state.pfiInstanceData.clear();
  });

  it('should bind all entities in BAIV instance files to BAIV-AIV', () => {
    const config = makeBAIVInstanceConfig();
    state.pfiInstances.set('PFI-BAIV', config);
    state.pfiInstanceData.set('PFI-BAIV', makeBAIVInstanceData());

    const bindings = resolveProductBindings('PFI-BAIV');

    expect(bindings).toBeInstanceOf(Map);
    expect(bindings.size).toBeGreaterThan(0);

    // VP-ONT entities should be bound
    expect(bindings.has('vp::ICP-CMO')).toBe(true);
    expect(bindings.has('vp::prob-strategic-01')).toBe(true);
    expect(bindings.has('vp::sol-01')).toBe(true);

    // RRR-ONT entities should be bound
    expect(bindings.has('rrr::role-cmo')).toBe(true);
    expect(bindings.has('rrr::risk-01')).toBe(true);

    // EFS-ONT entities should be bound
    expect(bindings.has('efs::epic-01')).toBe(true);
    expect(bindings.has('efs::feature-01')).toBe(true);
  });

  it('should assign confidence 1.0 and bindingType instance-data', () => {
    state.pfiInstances.set('PFI-BAIV', makeBAIVInstanceConfig());
    state.pfiInstanceData.set('PFI-BAIV', makeBAIVInstanceData());

    const bindings = resolveProductBindings('PFI-BAIV');
    const entry = bindings.get('vp::ICP-CMO');

    expect(entry).toBeDefined();
    expect(entry[0].productCode).toBe('BAIV-AIV');
    expect(entry[0].bindingType).toBe('instance-data');
    expect(entry[0].confidence).toBe(1.0);
  });

  it('should return empty Map when no instance data loaded', () => {
    const bindings = resolveProductBindings('PFI-UNKNOWN');
    expect(bindings).toBeInstanceOf(Map);
    expect(bindings.size).toBe(0);
  });

  it('should return empty Map when instance has no files', () => {
    state.pfiInstances.set('PFI-EMPTY', { productCode: 'TEST' });
    state.pfiInstanceData.set('PFI-EMPTY', makeEmptyInstanceData());

    const bindings = resolveProductBindings('PFI-EMPTY');
    expect(bindings.size).toBe(0);
  });

  it('should return empty Map when no productCode configured', () => {
    state.pfiInstances.set('PFI-NOPROD', { products: ['X'] });
    state.pfiInstanceData.set('PFI-NOPROD', {
      config: { products: ['X'] },
      files: [{ ontologyRef: 'VP-ONT', status: 'loaded', parsed: { nodes: [{ id: 'n1', label: 'N1', entityType: 'class' }], edges: [] } }],
    });

    const bindings = resolveProductBindings('PFI-NOPROD');
    expect(bindings.size).toBe(0);
  });

  it('should not duplicate bindings for the same productCode', () => {
    state.pfiInstances.set('PFI-BAIV', makeBAIVInstanceConfig());
    state.pfiInstanceData.set('PFI-BAIV', makeBAIVInstanceData());

    const bindings = resolveProductBindings('PFI-BAIV');
    for (const [, entries] of bindings) {
      const codes = entries.map(e => e.productCode);
      expect(new Set(codes).size).toBe(codes.length);
    }
  });

  it('should skip files with status other than loaded', () => {
    state.pfiInstances.set('PFI-PARTIAL', { productCode: 'PART-001' });
    state.pfiInstanceData.set('PFI-PARTIAL', {
      config: { productCode: 'PART-001' },
      files: [
        { ontologyRef: 'VP-ONT', status: 'error', parsed: { nodes: [{ id: 'n1', entityType: 'class' }], edges: [] } },
        { ontologyRef: 'RRR-ONT', status: 'loaded', parsed: { nodes: [{ id: 'r1', entityType: 'class' }], edges: [] } },
      ],
    });

    const bindings = resolveProductBindings('PFI-PARTIAL');
    expect(bindings.has('vp::n1')).toBe(false);
    expect(bindings.has('rrr::r1')).toBe(true);
  });

  it('should use config from pfiInstances over instanceData.config', () => {
    state.pfiInstances.set('PFI-BAIV', { productCode: 'OVERRIDE-PROD' });
    state.pfiInstanceData.set('PFI-BAIV', makeBAIVInstanceData());

    const bindings = resolveProductBindings('PFI-BAIV');
    const entry = bindings.get('vp::ICP-CMO');
    expect(entry[0].productCode).toBe('OVERRIDE-PROD');
  });
});

describe('resolveICPBindings', () => {
  beforeEach(() => {
    state.pfiInstances.clear();
    state.pfiInstanceData.clear();
  });

  it('should bind ICP nodes to themselves', () => {
    state.pfiInstanceData.set('PFI-BAIV', makeBAIVInstanceData());

    const bindings = resolveICPBindings('PFI-BAIV');
    expect(bindings.has('vp::ICP-CMO')).toBe(true);
    expect(bindings.get('vp::ICP-CMO')[0].icpRef).toBe('ICP-CMO');
    expect(bindings.get('vp::ICP-CMO')[0].seniorityLevel).toBe(1);
    expect(bindings.get('vp::ICP-CMO')[0].functionScope).toBe('Strategic');
  });

  it('should bind problems to ICP via ownerRole', () => {
    state.pfiInstanceData.set('PFI-BAIV', makeBAIVInstanceData());

    const bindings = resolveICPBindings('PFI-BAIV');
    expect(bindings.has('vp::prob-strategic-01')).toBe(true);
    expect(bindings.get('vp::prob-strategic-01')[0].icpRef).toBe('ICP-CMO');
  });

  it('should bind tactical problems to Marketing Director ICP', () => {
    state.pfiInstanceData.set('PFI-BAIV', makeBAIVInstanceData());

    const bindings = resolveICPBindings('PFI-BAIV');
    expect(bindings.has('vp::prob-tactical-01')).toBe(true);
    expect(bindings.get('vp::prob-tactical-01')[0].icpRef).toBe('ICP-MarketingDir');
    expect(bindings.get('vp::prob-tactical-01')[0].functionScope).toBe('Tactical');
  });

  it('should cascade ICP binding from problem to solution via hasSolution edge', () => {
    state.pfiInstanceData.set('PFI-BAIV', makeBAIVInstanceData());

    const bindings = resolveICPBindings('PFI-BAIV');
    expect(bindings.has('vp::sol-01')).toBe(true);
    expect(bindings.get('vp::sol-01')[0].icpRef).toBe('ICP-CMO');
  });

  it('should cascade ICP binding from problem to benefit via hasBenefit edge', () => {
    state.pfiInstanceData.set('PFI-BAIV', makeBAIVInstanceData());

    const bindings = resolveICPBindings('PFI-BAIV');
    expect(bindings.has('vp::ben-01')).toBe(true);
    expect(bindings.get('vp::ben-01')[0].icpRef).toBe('ICP-MarketingDir');
  });

  it('should return empty Map when no VP-ONT data', () => {
    state.pfiInstanceData.set('PFI-NOVP', {
      config: {},
      files: [
        { ontologyRef: 'RRR-ONT', status: 'loaded', parsed: { nodes: [{ id: 'r1', entityType: 'class' }], edges: [] } },
      ],
    });

    const bindings = resolveICPBindings('PFI-NOVP');
    expect(bindings.size).toBe(0);
  });

  it('should return empty Map when instance not found', () => {
    const bindings = resolveICPBindings('PFI-UNKNOWN');
    expect(bindings.size).toBe(0);
  });

  it('should not duplicate ICP bindings on same entity', () => {
    state.pfiInstanceData.set('PFI-BAIV', makeBAIVInstanceData());

    const bindings = resolveICPBindings('PFI-BAIV');
    for (const [, entries] of bindings) {
      const refs = entries.map(e => e.icpRef);
      expect(new Set(refs).size).toBe(refs.length);
    }
  });

  it('should bind multiple ICPs in the hierarchy', () => {
    state.pfiInstanceData.set('PFI-BAIV', makeBAIVInstanceData());

    const bindings = resolveICPBindings('PFI-BAIV');
    // Both CMO and Marketing Director ICPs should be represented
    expect(bindings.has('vp::ICP-CMO')).toBe(true);
    expect(bindings.has('vp::ICP-MarketingDir')).toBe(true);
  });

  it('should handle problems without ownerRole (no ICP binding)', () => {
    state.pfiInstanceData.set('PFI-NOOWNER', {
      config: {},
      files: [{
        ontologyRef: 'VP-ONT',
        status: 'loaded',
        parsed: {
          nodes: [{ id: 'prob-orphan', label: 'Orphan Problem', entityType: 'class', properties: {} }],
          edges: [],
        },
      }],
    });

    const bindings = resolveICPBindings('PFI-NOOWNER');
    expect(bindings.has('vp::prob-orphan')).toBe(false);
  });
});

describe('inferProductBindings', () => {
  it('should infer bindings at depth 1 with confidence 0.5', () => {
    const graph = makeComposedGraph();
    const explicit = new Map();
    explicit.set('vp::prob-strategic-01', [{ productCode: 'BAIV-AIV', bindingType: 'instance-data', confidence: 1.0 }]);

    const inferred = inferProductBindings(graph, explicit);

    // Depth 1: ICP-CMO and sol-01 are adjacent to prob-strategic-01
    expect(inferred.has('vp::ICP-CMO')).toBe(true);
    expect(inferred.get('vp::ICP-CMO')[0].confidence).toBe(0.5);
    expect(inferred.get('vp::ICP-CMO')[0].bindingType).toBe('inferred');

    expect(inferred.has('vp::sol-01')).toBe(true);
    expect(inferred.get('vp::sol-01')[0].confidence).toBe(0.5);
  });

  it('should infer bindings at depth 2 with confidence 0.25', () => {
    const graph = makeComposedGraph();
    const explicit = new Map();
    explicit.set('vp::prob-strategic-01', [{ productCode: 'BAIV-AIV', bindingType: 'instance-data', confidence: 1.0 }]);

    const inferred = inferProductBindings(graph, explicit);

    // Depth 2: sol-01 → efs::epic-01 (through crossJoin)
    expect(inferred.has('efs::epic-01')).toBe(true);
    expect(inferred.get('efs::epic-01')[0].confidence).toBe(0.25);
  });

  it('should not override explicit bindings', () => {
    const graph = makeComposedGraph();
    const explicit = new Map();
    explicit.set('vp::prob-strategic-01', [{ productCode: 'BAIV-AIV', bindingType: 'instance-data', confidence: 1.0 }]);
    explicit.set('vp::ICP-CMO', [{ productCode: 'BAIV-AIV', bindingType: 'instance-data', confidence: 1.0 }]);

    const inferred = inferProductBindings(graph, explicit);

    // ICP-CMO is already explicit — should NOT appear in inferred
    expect(inferred.has('vp::ICP-CMO')).toBe(false);
  });

  it('should return empty Map for empty graph', () => {
    const inferred = inferProductBindings({ nodes: [], edges: [] }, new Map());
    expect(inferred.size).toBe(0);
  });

  it('should return empty Map when no explicit bindings', () => {
    const graph = makeComposedGraph();
    const inferred = inferProductBindings(graph, new Map());
    expect(inferred.size).toBe(0);
  });

  it('should handle null inputs gracefully', () => {
    expect(inferProductBindings(null, null).size).toBe(0);
    expect(inferProductBindings(null, new Map()).size).toBe(0);
    expect(inferProductBindings({ nodes: [], edges: [] }, null).size).toBe(0);
  });

  it('should not infer beyond depth 2', () => {
    const graph = makeComposedGraph();
    const explicit = new Map();
    explicit.set('vp::prob-strategic-01', [{ productCode: 'BAIV-AIV', bindingType: 'instance-data', confidence: 1.0 }]);

    const inferred = inferProductBindings(graph, explicit);

    // Depth 3: efs::feature-01 is 3 hops from prob-strategic-01
    // (prob → sol → epic → feature) — should NOT be inferred
    // Actually let me check: prob → ICP-CMO (1), prob → sol-01 (1), sol-01 → epic-01 (2), epic-01 → feature-01 (3)
    // But also: ICP-CMO → prob (1) and prob → sol (1) so sol is depth 1
    // sol → epic (2) and epic → feature (3) — feature is depth 3 from prob, not reachable
    expect(inferred.has('efs::feature-01')).toBe(false);
  });

  it('should handle disconnected nodes (no edges to explicit)', () => {
    const graph = makeComposedGraph();
    const explicit = new Map();
    explicit.set('vp::prob-strategic-01', [{ productCode: 'BAIV-AIV', bindingType: 'instance-data', confidence: 1.0 }]);

    const inferred = inferProductBindings(graph, explicit);

    // org-ctx::competitor-01 is disconnected from prob-strategic-01
    expect(inferred.has('org-ctx::competitor-01')).toBe(false);
  });

  it('should infer from multiple explicit sources', () => {
    const graph = makeComposedGraph();
    const explicit = new Map();
    explicit.set('vp::prob-strategic-01', [{ productCode: 'PROD-A', bindingType: 'instance-data', confidence: 1.0 }]);
    explicit.set('rrr::role-cmo', [{ productCode: 'PROD-B', bindingType: 'instance-data', confidence: 1.0 }]);

    const inferred = inferProductBindings(graph, explicit);

    // rrr::risk-01 should get PROD-B from role-cmo at depth 1
    expect(inferred.has('rrr::risk-01')).toBe(true);
    expect(inferred.get('rrr::risk-01')[0].productCode).toBe('PROD-B');
    expect(inferred.get('rrr::risk-01')[0].confidence).toBe(0.5);
  });

  it('should not add duplicate product codes for same entity', () => {
    const graph = {
      nodes: [
        { id: 'a', label: 'A' },
        { id: 'b', label: 'B' },
        { id: 'c', label: 'C' },
      ],
      edges: [
        { from: 'a', to: 'c', label: 'rel1' },
        { from: 'b', to: 'c', label: 'rel2' },
      ],
    };
    const explicit = new Map();
    explicit.set('a', [{ productCode: 'SAME', bindingType: 'instance-data', confidence: 1.0 }]);
    explicit.set('b', [{ productCode: 'SAME', bindingType: 'instance-data', confidence: 1.0 }]);

    const inferred = inferProductBindings(graph, explicit);
    const cBindings = inferred.get('c');
    expect(cBindings).toBeDefined();
    expect(cBindings.length).toBe(1); // Only one entry for SAME, not duplicated
  });
});

describe('ProductEntityBinding ontology model', () => {
  let emcOntology;

  beforeEach(async () => {
    const { readFileSync } = await import('fs');
    const { resolve } = await import('path');
    const filePath = resolve(
      import.meta.dirname || '.',
      '../../../ONTOLOGIES/ontology-library/Orchestration/EMC-ONT/pf-EMC-ONT-v5.2.0.jsonld'
    );
    emcOntology = JSON.parse(readFileSync(filePath, 'utf-8'));
  });

  it('should have version 5.2.0', () => {
    expect(emcOntology.version).toBe('5.2.0');
  });

  it('should define ProductEntityBinding entity type', () => {
    const terms = emcOntology.hasDefinedTerm;
    const peb = terms.find(t => t['@id'] === 'emc:ProductEntityBinding');
    expect(peb).toBeDefined();
    expect(peb.name).toBe('ProductEntityBinding');
    expect(peb.termCode).toBe('PEB');
  });

  it('should have required properties on ProductEntityBinding', () => {
    const peb = emcOntology.hasDefinedTerm.find(t => t['@id'] === 'emc:ProductEntityBinding');
    const props = peb.properties;
    expect(props.bindingId.required).toBe(true);
    expect(props.productRef.required).toBe(true);
    expect(props.boundEntityRef.required).toBe(true);
    expect(props.boundOntology.required).toBe(true);
    expect(props.bindingType.required).toBe(true);
    expect(props.bindingConfidence.required).toBe(true);
  });

  it('should define BindingType enum with 3 values', () => {
    const bt = emcOntology.hasDefinedTerm.find(t => t['@id'] === 'emc:BindingType');
    expect(bt).toBeDefined();
    expect(bt.enumValues).toHaveLength(3);
    const names = bt.enumValues.map(v => v.name);
    expect(names).toContain('instance-data');
    expect(names).toContain('cross-reference');
    expect(names).toContain('inferred');
  });

  it('should define entityHasProductBinding relationship', () => {
    const rel = emcOntology.relationships.find(r => r['@id'] === 'emc:entityHasProductBinding');
    expect(rel).toBeDefined();
    expect(rel.rangeIncludes).toBe('emc:ProductEntityBinding');
    expect(rel.cardinality).toBe('0:n');
  });

  it('should define BR-EMC-016 confidence validation rule', () => {
    const rule = emcOntology.businessRules.find(r => r['@id'] === 'emc:rule-binding-confidence-valid');
    expect(rule).toBeDefined();
    expect(rule.name).toBe('BindingConfidenceValid');
    expect(rule.priority).toBe(16);
    expect(rule.severity).toBe('error');
    expect(rule.enforcementLevel).toBe('mandatory');
  });

  it('should have v5.1.0 changelog entry', () => {
    expect(emcOntology.changeLog['v5.1.0']).toBeDefined();
    expect(emcOntology.changeLog['v5.1.0'].additions.length).toBe(4);
  });
});

describe('BAIV end-to-end binding pipeline', () => {
  beforeEach(() => {
    state.pfiInstances.clear();
    state.pfiInstanceData.clear();
    state.pfiInstances.set('PFI-BAIV', makeBAIVInstanceConfig());
    state.pfiInstanceData.set('PFI-BAIV', makeBAIVInstanceData());
  });

  it('should resolve product bindings then infer additional bindings', () => {
    const explicit = resolveProductBindings('PFI-BAIV');
    const graph = makeComposedGraph();
    const inferred = inferProductBindings(graph, explicit);

    // Explicit should have all entities from instance data files
    expect(explicit.size).toBeGreaterThan(0);

    // Since all VP/RRR/EFS entities are explicitly bound, the only inferred
    // entities would be those in the composed graph NOT in instance data
    // org-ctx::competitor-01 is disconnected so should not be inferred either
    // All instance data entities are already explicit, so few inferences expected
    expect(inferred.size).toBe(0); // All graph entities are already explicit
  });

  it('should resolve ICP bindings with full cascade', () => {
    const icpBindings = resolveICPBindings('PFI-BAIV');

    // ICPs themselves
    expect(icpBindings.has('vp::ICP-CMO')).toBe(true);
    expect(icpBindings.has('vp::ICP-MarketingDir')).toBe(true);

    // Problems via ownerRole
    expect(icpBindings.has('vp::prob-strategic-01')).toBe(true);
    expect(icpBindings.has('vp::prob-tactical-01')).toBe(true);

    // Cascaded to solutions/benefits
    expect(icpBindings.has('vp::sol-01')).toBe(true);
    expect(icpBindings.has('vp::ben-01')).toBe(true);
  });

  it('should produce inferred bindings when graph has non-instance entities', () => {
    // Only bind a subset of entities explicitly
    const explicit = new Map();
    explicit.set('vp::prob-strategic-01', [{ productCode: 'BAIV-AIV', bindingType: 'instance-data', confidence: 1.0 }]);

    const graph = makeComposedGraph();
    const inferred = inferProductBindings(graph, explicit);

    // Adjacent entities should be inferred
    expect(inferred.size).toBeGreaterThan(0);
    expect(inferred.has('vp::ICP-CMO')).toBe(true);
    expect(inferred.has('vp::sol-01')).toBe(true);
  });
});
