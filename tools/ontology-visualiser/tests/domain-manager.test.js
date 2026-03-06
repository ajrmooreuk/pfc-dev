/**
 * Unit tests for domain-manager.js — domain instance creation,
 * validation, lineage, version control, and merge-back.
 *
 * Feature 7.4: Domain-Specific Data & Knowledge Management
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock state.js
vi.mock('../js/state.js', () => ({
  state: {
    domainInstances: new Map(),
    domainVersionHistory: new Map(),
  },
  REGISTRY_BASE_PATH: '../../ONTOLOGIES/ontology-library/',
}));

// Mock audit-engine.js — extractEntities / extractRelationships
vi.mock('../js/audit-engine.js', () => ({
  extractEntities: vi.fn((data) => {
    if (data.entities && Array.isArray(data.entities)) return data.entities;
    if (data.hasDefinedTerm && Array.isArray(data.hasDefinedTerm)) return data.hasDefinedTerm;
    return [];
  }),
  extractRelationships: vi.fn((data) => {
    if (data.relationships && Array.isArray(data.relationships)) return data.relationships;
    return [];
  }),
}));

// Mock diff-engine.js
vi.mock('../js/diff-engine.js', () => ({
  diffOntologies: vi.fn(() => ({
    summary: {},
    entities: { added: [], removed: [], modified: [], unchanged: [] },
    relationships: { added: [], removed: [], modified: [] },
    metadata: [],
    oldVersion: '1.0.0',
    newVersion: '1.0.0',
  })),
}));

// Mock localStorage
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
  createDomainInstance,
  addDomainEntity,
  addDomainRelationship,
  validateDomainInstance,
  getDomainLineage,
  bumpDomainVersion,
  getDomainVersionHistory,
  prepareMergeBack,
  applyMergeBack,
  getDomainInstances,
  getDomainInstance,
  deleteDomainInstance,
  restoreDomainState,
} from '../js/domain-manager.js';

// --- Test fixtures ---

function makeParentOntology() {
  return {
    '@type': 'pf:Ontology',
    name: 'VP Ontology',
    version: '1.2.3',
    metadata: { version: '1.2.3' },
    entities: [
      { '@id': 'vp:ValueProposition', '@type': 'class', name: 'ValueProposition', description: 'A VP' },
      { '@id': 'vp:CustomerSegment', '@type': 'class', name: 'CustomerSegment', description: 'A segment' },
      { '@id': 'vp:Channel', '@type': 'supporting', name: 'Channel', description: 'A channel' },
    ],
    relationships: [
      { name: 'targetsSegment', domainIncludes: ['vp:ValueProposition'], rangeIncludes: ['vp:CustomerSegment'] },
      { name: 'deliveredVia', domainIncludes: ['vp:ValueProposition'], rangeIncludes: ['vp:Channel'] },
    ],
  };
}

// --- Reset state before each test ---

beforeEach(() => {
  state.domainInstances = new Map();
  state.domainVersionHistory = new Map();
  localStorageMock.clear();
});

// ===================================================================
// createDomainInstance (7.4.1)
// ===================================================================

describe('createDomainInstance', () => {
  it('creates a domain instance extending a PFC parent', () => {
    const result = createDomainInstance({
      instanceId: 'BAIV-VP',
      parentOntology: 'VP',
      productCode: 'BAIV-AIV',
      instanceName: 'BAIV Value Proposition',
      description: 'VP for BAIV product',
      parentData: makeParentOntology(),
    });
    expect(result.success).toBe(true);
    expect(result.instance.instanceId).toBe('BAIV-VP');
    expect(result.instance.parentOntology).toBe('VP');
    expect(result.instance.contextLevel).toBe('PFI');
    expect(result.instance.version).toBe('1.0.0');
  });

  it('extracts parent schema when parentData provided', () => {
    const result = createDomainInstance({
      instanceId: 'BAIV-VP',
      parentOntology: 'VP',
      productCode: 'BAIV-AIV',
      instanceName: 'BAIV VP',
      parentData: makeParentOntology(),
    });
    expect(result.instance.parentSchema).toBeDefined();
    expect(result.instance.parentSchema.entityCount).toBe(3);
    expect(result.instance.parentSchema.relationshipCount).toBe(2);
  });

  it('stores lineage information', () => {
    const result = createDomainInstance({
      instanceId: 'BAIV-VP',
      parentOntology: 'VP',
      productCode: 'BAIV-AIV',
      instanceName: 'BAIV VP',
      parentData: makeParentOntology(),
    });
    expect(result.instance.lineage.parent).toBe('VP');
    expect(result.instance.lineage.parentVersion).toBe('1.2.3');
    expect(result.instance.lineage.createdFrom).toBe('PFC');
  });

  it('stores in state', () => {
    createDomainInstance({
      instanceId: 'BAIV-VP',
      parentOntology: 'VP',
      productCode: 'BAIV-AIV',
      instanceName: 'BAIV VP',
    });
    expect(state.domainInstances.has('BAIV-VP')).toBe(true);
  });

  it('fails without required params', () => {
    const result = createDomainInstance({ instanceId: 'X' });
    expect(result.success).toBe(false);
  });

  it('works without parentData', () => {
    const result = createDomainInstance({
      instanceId: 'BAIV-VP',
      parentOntology: 'VP',
      productCode: 'BAIV-AIV',
      instanceName: 'BAIV VP',
    });
    expect(result.success).toBe(true);
    expect(result.instance.parentSchema).toBeNull();
  });
});

// ===================================================================
// addDomainEntity / addDomainRelationship
// ===================================================================

describe('addDomainEntity', () => {
  beforeEach(() => {
    createDomainInstance({
      instanceId: 'BAIV-VP',
      parentOntology: 'VP',
      productCode: 'BAIV-AIV',
      instanceName: 'BAIV VP',
    });
  });

  it('adds an entity to domain instance', () => {
    const result = addDomainEntity('BAIV-VP', {
      '@id': 'baiv:AIVisibilityProposition',
      name: 'AI Visibility Proposition',
      '@type': 'class',
      description: 'BAIV-specific VP',
    });
    expect(result.success).toBe(true);
    const instance = getDomainInstance('BAIV-VP');
    expect(instance.entities.length).toBe(1);
    expect(instance.entities[0].isDomainExtension).toBe(true);
  });

  it('rejects duplicate entity', () => {
    addDomainEntity('BAIV-VP', { '@id': 'dup:1', name: 'Dup' });
    const result = addDomainEntity('BAIV-VP', { '@id': 'dup:1', name: 'Dup Again' });
    expect(result.success).toBe(false);
    expect(result.error).toContain('already exists');
  });

  it('fails for unknown instance', () => {
    const result = addDomainEntity('NONEXISTENT', { '@id': 'x', name: 'X' });
    expect(result.success).toBe(false);
  });

  it('rejects entity without @id/id/name', () => {
    const result = addDomainEntity('BAIV-VP', { description: 'no id' });
    expect(result.success).toBe(false);
  });

  it('records domain extension', () => {
    addDomainEntity('BAIV-VP', { '@id': 'ext:1', name: 'Ext' });
    const instance = getDomainInstance('BAIV-VP');
    expect(instance.domainExtensions.length).toBe(1);
    expect(instance.domainExtensions[0].type).toBe('entity-added');
  });
});

describe('addDomainRelationship', () => {
  beforeEach(() => {
    createDomainInstance({
      instanceId: 'BAIV-VP',
      parentOntology: 'VP',
      productCode: 'BAIV-AIV',
      instanceName: 'BAIV VP',
    });
  });

  it('adds a relationship', () => {
    const result = addDomainRelationship('BAIV-VP', {
      name: 'aiTargets',
      domainIncludes: ['baiv:AIVisibilityProposition'],
      rangeIncludes: ['baiv:AISegment'],
    });
    expect(result.success).toBe(true);
    expect(getDomainInstance('BAIV-VP').relationships.length).toBe(1);
  });

  it('fails for unknown instance', () => {
    const result = addDomainRelationship('NOPE', { name: 'x' });
    expect(result.success).toBe(false);
  });
});

// ===================================================================
// validateDomainInstance (7.4.2)
// ===================================================================

describe('validateDomainInstance', () => {
  beforeEach(() => {
    createDomainInstance({
      instanceId: 'BAIV-VP',
      parentOntology: 'VP',
      productCode: 'BAIV-AIV',
      instanceName: 'BAIV VP',
      parentData: makeParentOntology(),
    });
  });

  it('validates a valid empty instance (with warning)', () => {
    const result = validateDomainInstance('BAIV-VP');
    expect(result.success).toBe(true);
    expect(result.valid).toBe(true);
    expect(result.warnings.length).toBeGreaterThanOrEqual(1);
    expect(result.warnings[0]).toContain('no entities');
  });

  it('passes validation with valid entities', () => {
    addDomainEntity('BAIV-VP', {
      '@id': 'baiv:X',
      '@type': 'class',
      name: 'X',
      description: 'X entity',
    });
    const result = validateDomainInstance('BAIV-VP');
    expect(result.success).toBe(true);
    expect(result.valid).toBe(true);
  });

  it('catches duplicate @id errors', () => {
    const instance = getDomainInstance('BAIV-VP');
    instance.entities.push(
      { '@id': 'dup', name: 'A', description: 'a' },
      { '@id': 'dup', name: 'B', description: 'b' },
    );
    const result = validateDomainInstance('BAIV-VP');
    expect(result.errors.some(e => e.includes('Duplicate'))).toBe(true);
  });

  it('warns about unknown relationship endpoints', () => {
    addDomainEntity('BAIV-VP', { '@id': 'EntityA', name: 'A' });
    addDomainRelationship('BAIV-VP', {
      name: 'relToUnknown',
      domainIncludes: ['EntityA'],
      rangeIncludes: ['NONEXISTENT'],
    });
    const result = validateDomainInstance('BAIV-VP');
    expect(result.warnings.some(w => w.includes('unknown range'))).toBe(true);
  });

  it('fails for unknown instance', () => {
    const result = validateDomainInstance('NOPE');
    expect(result.success).toBe(false);
  });
});

// ===================================================================
// getDomainLineage (7.4.3)
// ===================================================================

describe('getDomainLineage', () => {
  beforeEach(() => {
    createDomainInstance({
      instanceId: 'BAIV-VP',
      parentOntology: 'VP',
      productCode: 'BAIV-AIV',
      instanceName: 'BAIV VP',
      parentData: makeParentOntology(),
    });
    addDomainEntity('BAIV-VP', { '@id': 'baiv:E1', name: 'E1' });
    addDomainEntity('BAIV-VP', { '@id': 'baiv:E2', name: 'E2' });
  });

  it('returns lineage with PFC parent and domain entities', () => {
    const result = getDomainLineage('BAIV-VP');
    expect(result.success).toBe(true);
    expect(result.lineage.parentOntology).toBe('VP');
    // 1 parent + 1 instance + 2 entities = 4 nodes
    expect(result.lineage.nodes.length).toBe(4);
    // 1 extends + 2 defines = 3 edges
    expect(result.lineage.edges.length).toBe(3);
  });

  it('parent node is type pfc-parent', () => {
    const { lineage } = getDomainLineage('BAIV-VP');
    const parent = lineage.nodes.find(n => n.type === 'pfc-parent');
    expect(parent).toBeDefined();
    expect(parent.label).toContain('VP');
  });

  it('fails for unknown instance', () => {
    const result = getDomainLineage('NOPE');
    expect(result.success).toBe(false);
  });
});

// ===================================================================
// bumpDomainVersion / getDomainVersionHistory (7.4.4)
// ===================================================================

describe('bumpDomainVersion', () => {
  beforeEach(() => {
    createDomainInstance({
      instanceId: 'BAIV-VP',
      parentOntology: 'VP',
      productCode: 'BAIV-AIV',
      instanceName: 'BAIV VP',
    });
  });

  it('bumps patch version', () => {
    const result = bumpDomainVersion('BAIV-VP', 'patch');
    expect(result.success).toBe(true);
    expect(result.oldVersion).toBe('1.0.0');
    expect(result.newVersion).toBe('1.0.1');
  });

  it('bumps minor version', () => {
    const result = bumpDomainVersion('BAIV-VP', 'minor');
    expect(result.success).toBe(true);
    expect(result.newVersion).toBe('1.1.0');
  });

  it('bumps major version', () => {
    const result = bumpDomainVersion('BAIV-VP', 'major');
    expect(result.success).toBe(true);
    expect(result.newVersion).toBe('2.0.0');
  });

  it('records version history', () => {
    bumpDomainVersion('BAIV-VP', 'patch');
    bumpDomainVersion('BAIV-VP', 'minor');
    const history = getDomainVersionHistory('BAIV-VP');
    expect(history.length).toBe(2);
    expect(history[0].version).toBe('1.0.1'); // most recent first
    expect(history[1].version).toBe('1.0.0');
  });

  it('updates instance version', () => {
    bumpDomainVersion('BAIV-VP', 'patch');
    expect(getDomainInstance('BAIV-VP').version).toBe('1.0.1');
  });

  it('fails for unknown instance', () => {
    const result = bumpDomainVersion('NOPE');
    expect(result.success).toBe(false);
  });
});

// ===================================================================
// prepareMergeBack / applyMergeBack (7.4.5)
// ===================================================================

describe('prepareMergeBack', () => {
  beforeEach(() => {
    createDomainInstance({
      instanceId: 'BAIV-VP',
      parentOntology: 'VP',
      productCode: 'BAIV-AIV',
      instanceName: 'BAIV VP',
    });
    addDomainEntity('BAIV-VP', {
      '@id': 'baiv:NewEntity',
      '@type': 'class',
      name: 'NewEntity',
      description: 'Brand new',
    });
    addDomainEntity('BAIV-VP', {
      '@id': 'vp:ValueProposition',
      '@type': 'class',
      name: 'ValueProposition',
      description: 'Overlapping with parent',
    });
    addDomainRelationship('BAIV-VP', {
      name: 'newRelation',
      domainIncludes: ['baiv:NewEntity'],
      rangeIncludes: ['vp:ValueProposition'],
    });
  });

  it('identifies entities to add and merge', () => {
    const proposal = prepareMergeBack('BAIV-VP', makeParentOntology());
    expect(proposal.success).toBe(true);
    expect(proposal.proposal.entitiesToAdd.length).toBe(1);
    expect(proposal.proposal.entitiesToAdd[0]['@id']).toBe('baiv:NewEntity');
    expect(proposal.proposal.entitiesToMerge.length).toBe(1);
    expect(proposal.proposal.entitiesToMerge[0]['@id']).toBe('vp:ValueProposition');
  });

  it('identifies new relationships', () => {
    const proposal = prepareMergeBack('BAIV-VP', makeParentOntology());
    expect(proposal.proposal.relationshipsToAdd.length).toBe(1);
    expect(proposal.proposal.relationshipsToAdd[0].name).toBe('newRelation');
  });

  it('provides summary counts', () => {
    const proposal = prepareMergeBack('BAIV-VP', makeParentOntology());
    expect(proposal.proposal.summary.newEntities).toBe(1);
    expect(proposal.proposal.summary.newRelationships).toBe(1);
    expect(proposal.proposal.summary.overlappingEntities).toBe(1);
  });

  it('fails without parent data', () => {
    const result = prepareMergeBack('BAIV-VP', null);
    expect(result.success).toBe(false);
  });
});

describe('applyMergeBack', () => {
  it('merges new entities into parent', () => {
    createDomainInstance({
      instanceId: 'BAIV-VP',
      parentOntology: 'VP',
      productCode: 'BAIV-AIV',
      instanceName: 'BAIV VP',
    });
    addDomainEntity('BAIV-VP', {
      '@id': 'baiv:NewEntity',
      '@type': 'class',
      name: 'NewEntity',
    });

    const parent = makeParentOntology();
    const { proposal } = prepareMergeBack('BAIV-VP', parent);
    const result = applyMergeBack(parent, proposal);

    expect(result.success).toBe(true);
    expect(result.changeCount).toBeGreaterThan(0);
    const mergedEntities = result.mergedData.entities;
    expect(mergedEntities.some(e => e['@id'] === 'baiv:NewEntity')).toBe(true);
  });

  it('fails without arguments', () => {
    const result = applyMergeBack(null, null);
    expect(result.success).toBe(false);
  });
});

// ===================================================================
// CRUD: getDomainInstances, getDomainInstance, deleteDomainInstance
// ===================================================================

describe('domain instance CRUD', () => {
  beforeEach(() => {
    createDomainInstance({
      instanceId: 'D1',
      parentOntology: 'VP',
      productCode: 'P1',
      instanceName: 'Domain 1',
    });
    createDomainInstance({
      instanceId: 'D2',
      parentOntology: 'CA',
      productCode: 'P2',
      instanceName: 'Domain 2',
    });
  });

  it('lists all instances', () => {
    expect(getDomainInstances().length).toBe(2);
  });

  it('gets specific instance', () => {
    expect(getDomainInstance('D1').instanceName).toBe('Domain 1');
  });

  it('returns null for unknown', () => {
    expect(getDomainInstance('NOPE')).toBeNull();
  });

  it('deletes instance and its version history', () => {
    bumpDomainVersion('D1', 'patch');
    const result = deleteDomainInstance('D1');
    expect(result.success).toBe(true);
    expect(getDomainInstances().length).toBe(1);
    expect(getDomainVersionHistory('D1').length).toBe(0);
  });

  it('fails to delete unknown', () => {
    expect(deleteDomainInstance('NOPE').success).toBe(false);
  });
});

// ===================================================================
// restoreDomainState
// ===================================================================

describe('restoreDomainState', () => {
  it('restores domain instances from localStorage', () => {
    const data = [{ instanceId: 'D-X', parentOntology: 'VP', instanceName: 'X' }];
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(data));
    restoreDomainState();
    expect(state.domainInstances.has('D-X')).toBe(true);
  });

  it('restores version history from localStorage', () => {
    const data = { 'D-X': [{ version: '1.0.0', bumpType: 'patch' }] };
    localStorageMock.getItem
      .mockReturnValueOnce(null) // instances
      .mockReturnValueOnce(JSON.stringify(data));
    restoreDomainState();
    expect(state.domainVersionHistory.has('D-X')).toBe(true);
  });

  it('handles invalid localStorage gracefully', () => {
    localStorageMock.getItem.mockReturnValueOnce('{bad json');
    expect(() => restoreDomainState()).not.toThrow();
  });
});
