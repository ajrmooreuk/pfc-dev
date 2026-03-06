/**
 * Unit tests for ontology-author.js — CRUD, versioning, fork, serialization, undo/redo.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock state.js
vi.mock('../js/state.js', () => ({
  state: {
    network: null,
    currentData: null,
    lastParsed: null,
    authoringUndoStack: [],
    authoringRedoStack: [],
    authoringDirty: false,
  },
  OAA_ENTITY_TYPES: ['class', 'supporting', 'framework', 'agent', 'core', 'layer', 'concept'],
  TYPE_COLORS: {
    class: '#4CAF50', core: '#4CAF50', framework: '#2196F3',
    supporting: '#FF9800', agent: '#E91E63', default: '#017c75'
  },
}));

// Mock ontology-parser.js (used by undo/redo)
vi.mock('../js/ontology-parser.js', () => ({
  parseOntology: vi.fn(() => ({ nodes: [], edges: [], diagnostics: {} })),
}));

import {
  createBlankOntology,
  addEntity,
  updateEntity,
  removeEntity,
  addRelationship,
  updateRelationship,
  removeRelationship,
  bumpVersion,
  getVersion,
  forkOntology,
  serializeToOAAJsonLD,
  pushUndoSnapshot,
  undo,
  redo,
  listEntityIds,
  getEntity,
  getRelationship,
} from '../js/ontology-author.js';

import { state } from '../js/state.js';

// --- Fixtures ---

function makeOntology() {
  return {
    '@context': { '@vocab': 'https://schema.org/', pf: 'https://platform.framework/ontology/' },
    '@type': 'Ontology',
    '@id': 'test:test-ontology',
    metadata: {
      name: 'Test Ontology',
      version: '1.0.0',
      status: 'Draft',
      description: 'For testing',
      dateCreated: '2026-01-01',
      dateModified: '2026-01-01',
      oaaVersion: '7.0.0',
    },
    entities: [
      { '@type': 'pf:EntityDefinition', '@id': 'pf:Alpha', name: 'Alpha', description: 'First', 'oaa:entityType': 'class' },
      { '@type': 'pf:EntityDefinition', '@id': 'pf:Beta', name: 'Beta', description: 'Second', 'oaa:entityType': 'supporting' },
    ],
    relationships: [
      { '@type': 'rdf:Property', name: 'relatesTo', domainIncludes: ['pf:Alpha'], rangeIncludes: ['pf:Beta'], description: 'A relates to B' },
    ],
  };
}

// --- createBlankOntology ---

describe('createBlankOntology', () => {
  it('creates OAA v7.0.0 skeleton with required fields', () => {
    const ont = createBlankOntology('My Ontology', 'my-ont', 'A test ontology', 'custom');
    expect(ont['@context']).toBeDefined();
    expect(ont['@type']).toBe('Ontology');
    expect(ont['@id']).toBe('my-ont:my-ont-ontology');
    expect(ont['oaa:schemaVersion']).toBe('7.0.0');
    expect(ont['oaa:ontologyId']).toBe('MY-ONT-ONT');
    expect(ont['oaa:series']).toBe('custom');
    expect(ont.metadata.name).toBe('My Ontology');
    expect(ont.metadata.version).toBe('1.0.0');
    expect(ont.metadata.status).toBe('Draft');
    expect(ont.metadata.oaaVersion).toBe('7.0.0');
    expect(ont.entities).toEqual([]);
    expect(ont.relationships).toEqual([]);
    expect(ont.competencyQuestions).toEqual([]);
  });

  it('sanitizes namespace to lowercase alphanumeric + hyphens', () => {
    const ont = createBlankOntology('Test', 'My Weird NS!@#', 'desc');
    expect(ont['@id']).toMatch(/^myweirdns:/);
    expect(ont['@context']['myweirdns']).toContain('myweirdns');
  });

  it('throws if name is missing', () => {
    expect(() => createBlankOntology('', 'ns')).toThrow('Name and namespace are required');
  });

  it('throws if namespace is missing', () => {
    expect(() => createBlankOntology('Test', '')).toThrow('Name and namespace are required');
  });

  it('defaults description and category', () => {
    const ont = createBlankOntology('Test', 'test');
    expect(ont.metadata.description).toBe('');
    expect(ont.metadata.domain).toBe('custom');
  });
});

// --- Entity CRUD ---

describe('addEntity', () => {
  it('adds an entity to the entities array', () => {
    const data = makeOntology();
    const result = addEntity(data, { id: 'pf:Gamma', name: 'Gamma', entityType: 'framework', description: 'Third' });
    expect(result.success).toBe(true);
    expect(data.entities).toHaveLength(3);
    expect(data.entities[2]['@id']).toBe('pf:Gamma');
    expect(data.entities[2]['oaa:entityType']).toBe('framework');
  });

  it('rejects duplicate entity ID', () => {
    const data = makeOntology();
    const result = addEntity(data, { id: 'pf:Alpha', name: 'Alpha Dup' });
    expect(result.success).toBe(false);
    expect(result.error).toContain('already exists');
  });

  it('rejects entity without id', () => {
    const data = makeOntology();
    const result = addEntity(data, { name: 'NoId' });
    expect(result.success).toBe(false);
    expect(result.error).toContain('requires id and name');
  });

  it('rejects entity without name', () => {
    const data = makeOntology();
    const result = addEntity(data, { id: 'pf:X' });
    expect(result.success).toBe(false);
  });

  it('defaults entityType to class', () => {
    const data = makeOntology();
    addEntity(data, { id: 'pf:Default', name: 'Default' });
    const ent = data.entities.find(e => e['@id'] === 'pf:Default');
    expect(ent['oaa:entityType']).toBe('class');
  });

  it('adds properties array when provided', () => {
    const data = makeOntology();
    const props = [{ name: 'field1', type: 'Text', required: true }];
    addEntity(data, { id: 'pf:WithProps', name: 'WithProps', properties: props });
    const ent = data.entities.find(e => e['@id'] === 'pf:WithProps');
    expect(ent.properties).toHaveLength(1);
    expect(ent.properties[0].name).toBe('field1');
  });

  it('updates dateModified on add', () => {
    const data = makeOntology();
    data.metadata.dateModified = '2020-01-01';
    addEntity(data, { id: 'pf:New', name: 'New' });
    expect(data.metadata.dateModified).not.toBe('2020-01-01');
  });

  it('works with hasDefinedTerm format', () => {
    const data = { hasDefinedTerm: [{ '@id': 'x:A', name: 'A' }], metadata: { version: '1.0.0' } };
    const result = addEntity(data, { id: 'x:B', name: 'B' });
    expect(result.success).toBe(true);
    expect(data.hasDefinedTerm).toHaveLength(2);
  });
});

describe('updateEntity', () => {
  it('updates entity name and description', () => {
    const data = makeOntology();
    const result = updateEntity(data, 'pf:Alpha', { name: 'AlphaV2', description: 'Updated' });
    expect(result.success).toBe(true);
    expect(data.entities[0].name).toBe('AlphaV2');
    expect(data.entities[0].description).toBe('Updated');
  });

  it('updates entityType', () => {
    const data = makeOntology();
    updateEntity(data, 'pf:Alpha', { entityType: 'agent' });
    expect(data.entities[0]['oaa:entityType']).toBe('agent');
  });

  it('fails for non-existent entity', () => {
    const data = makeOntology();
    const result = updateEntity(data, 'pf:Missing', { name: 'X' });
    expect(result.success).toBe(false);
    expect(result.error).toContain('not found');
  });

  it('only changes specified fields', () => {
    const data = makeOntology();
    updateEntity(data, 'pf:Alpha', { description: 'New desc' });
    expect(data.entities[0].name).toBe('Alpha');
    expect(data.entities[0]['oaa:entityType']).toBe('class');
  });
});

describe('removeEntity', () => {
  it('removes entity and returns success', () => {
    const data = makeOntology();
    const result = removeEntity(data, 'pf:Beta');
    expect(result.success).toBe(true);
    expect(data.entities).toHaveLength(1);
    expect(data.entities[0]['@id']).toBe('pf:Alpha');
  });

  it('cascades relationship removal', () => {
    const data = makeOntology();
    const result = removeEntity(data, 'pf:Alpha');
    expect(result.success).toBe(true);
    expect(result.removedRelationships).toBe(1);
    expect(data.relationships).toHaveLength(0);
  });

  it('fails for non-existent entity', () => {
    const data = makeOntology();
    const result = removeEntity(data, 'pf:Missing');
    expect(result.success).toBe(false);
    expect(result.removedRelationships).toBe(0);
  });

  it('only removes relationships referencing the deleted entity', () => {
    const data = makeOntology();
    addRelationship(data, { name: 'selfRel', domainIncludes: ['pf:Beta'], rangeIncludes: ['pf:Beta'] });
    expect(data.relationships).toHaveLength(2);
    removeEntity(data, 'pf:Alpha');
    // relatesTo (Alpha->Beta) removed, selfRel (Beta->Beta) kept
    expect(data.relationships).toHaveLength(1);
    expect(data.relationships[0].name).toBe('selfRel');
  });
});

// --- Relationship CRUD ---

describe('addRelationship', () => {
  it('adds a relationship', () => {
    const data = makeOntology();
    const result = addRelationship(data, {
      name: 'dependsOn', domainIncludes: ['pf:Beta'], rangeIncludes: ['pf:Alpha'],
      description: 'Beta depends on Alpha', cardinality: '0..1'
    });
    expect(result.success).toBe(true);
    expect(data.relationships).toHaveLength(2);
    expect(data.relationships[1].cardinality).toBe('0..1');
  });

  it('rejects duplicate relationship name', () => {
    const data = makeOntology();
    const result = addRelationship(data, { name: 'relatesTo', domainIncludes: ['pf:Alpha'], rangeIncludes: ['pf:Beta'] });
    expect(result.success).toBe(false);
    expect(result.error).toContain('already exists');
  });

  it('rejects without name', () => {
    const data = makeOntology();
    const result = addRelationship(data, { domainIncludes: ['pf:Alpha'], rangeIncludes: ['pf:Beta'] });
    expect(result.success).toBe(false);
  });

  it('rejects without domain', () => {
    const data = makeOntology();
    const result = addRelationship(data, { name: 'x', rangeIncludes: ['pf:Beta'] });
    expect(result.success).toBe(false);
    expect(result.error).toContain('domain');
  });

  it('rejects without range', () => {
    const data = makeOntology();
    const result = addRelationship(data, { name: 'x', domainIncludes: ['pf:Alpha'] });
    expect(result.success).toBe(false);
    expect(result.error).toContain('range');
  });
});

describe('updateRelationship', () => {
  it('updates relationship fields', () => {
    const data = makeOntology();
    const result = updateRelationship(data, 'relatesTo', {
      description: 'Updated desc', cardinality: '1..1'
    });
    expect(result.success).toBe(true);
    expect(data.relationships[0].description).toBe('Updated desc');
    expect(data.relationships[0].cardinality).toBe('1..1');
  });

  it('can rename a relationship', () => {
    const data = makeOntology();
    updateRelationship(data, 'relatesTo', { name: 'linkedTo' });
    expect(data.relationships[0].name).toBe('linkedTo');
  });

  it('fails for non-existent relationship', () => {
    const data = makeOntology();
    const result = updateRelationship(data, 'nonExistent', { description: 'x' });
    expect(result.success).toBe(false);
  });
});

describe('removeRelationship', () => {
  it('removes relationship by name', () => {
    const data = makeOntology();
    const result = removeRelationship(data, 'relatesTo');
    expect(result.success).toBe(true);
    expect(data.relationships).toHaveLength(0);
  });

  it('fails for non-existent relationship', () => {
    const data = makeOntology();
    const result = removeRelationship(data, 'nonExistent');
    expect(result.success).toBe(false);
  });
});

// --- Version Management ---

describe('bumpVersion', () => {
  it('bumps patch version', () => {
    const data = makeOntology();
    const result = bumpVersion(data, 'patch');
    expect(result.success).toBe(true);
    expect(result.oldVersion).toBe('1.0.0');
    expect(result.newVersion).toBe('1.0.1');
    expect(data.metadata.version).toBe('1.0.1');
  });

  it('bumps minor version and resets patch', () => {
    const data = makeOntology();
    data.metadata.version = '2.3.7';
    const result = bumpVersion(data, 'minor');
    expect(result.newVersion).toBe('2.4.0');
  });

  it('bumps major version and resets minor + patch', () => {
    const data = makeOntology();
    data.metadata.version = '1.5.3';
    const result = bumpVersion(data, 'major');
    expect(result.newVersion).toBe('2.0.0');
  });

  it('handles missing version as 0.0.0', () => {
    const data = { metadata: {} };
    const result = bumpVersion(data, 'patch');
    expect(result.oldVersion).toBe('0.0.0');
    expect(result.newVersion).toBe('0.0.1');
  });

  it('handles flat version field (no metadata wrapper)', () => {
    const data = { version: '3.1.0' };
    const result = bumpVersion(data, 'minor');
    expect(result.newVersion).toBe('3.2.0');
    expect(data.version).toBe('3.2.0');
  });
});

describe('getVersion', () => {
  it('reads from metadata.version', () => {
    expect(getVersion({ metadata: { version: '2.1.0' } })).toBe('2.1.0');
  });

  it('reads from top-level version', () => {
    expect(getVersion({ version: '3.0.0' })).toBe('3.0.0');
  });

  it('defaults to 0.0.0', () => {
    expect(getVersion({})).toBe('0.0.0');
  });
});

// --- Fork ---

describe('forkOntology', () => {
  it('creates deep clone with new namespace', () => {
    const original = makeOntology();
    const fork = forkOntology(original, 'Forked Ontology', 'fork-ont');
    expect(fork.metadata.name).toBe('Forked Ontology');
    expect(fork.metadata.version).toBe('1.0.0');
    expect(fork.metadata.status).toBe('Draft');
    expect(fork['@id']).toBe('fork-ont:fork-ont-ontology');
    expect(fork['@context']['fork-ont']).toContain('fork-ont');
  });

  it('does not modify the original', () => {
    const original = makeOntology();
    forkOntology(original, 'Fork', 'fork');
    expect(original.metadata.name).toBe('Test Ontology');
    expect(original.metadata.version).toBe('1.0.0');
  });

  it('preserves entities and relationships', () => {
    const original = makeOntology();
    const fork = forkOntology(original, 'Fork', 'fork');
    expect(fork.entities).toHaveLength(2);
    expect(fork.relationships).toHaveLength(1);
  });

  it('throws if name or namespace is missing', () => {
    const data = makeOntology();
    expect(() => forkOntology(data, '', 'ns')).toThrow();
    expect(() => forkOntology(data, 'Name', '')).toThrow();
  });

  it('sanitizes namespace', () => {
    const data = makeOntology();
    const fork = forkOntology(data, 'Fork', 'My Fork!');
    expect(fork['@id']).toBe('myfork:myfork-ontology');
  });
});

// --- Serialization ---

describe('serializeToOAAJsonLD', () => {
  it('returns valid JSON string', () => {
    const data = makeOntology();
    const json = serializeToOAAJsonLD(data);
    const parsed = JSON.parse(json);
    expect(parsed['@context']).toBeDefined();
    expect(parsed['@type']).toBe('Ontology');
    expect(parsed.metadata.oaaVersion).toBe('7.0.0');
  });

  it('adds missing required fields', () => {
    const minimal = { name: 'Bare', version: '1.0.0', entities: [] };
    const json = serializeToOAAJsonLD(minimal);
    const parsed = JSON.parse(json);
    expect(parsed['@context']).toBeDefined();
    expect(parsed['@type']).toBe('Ontology');
    expect(parsed.metadata).toBeDefined();
    expect(parsed.metadata.oaaVersion).toBe('7.0.0');
    expect(parsed.relationships).toEqual([]);
  });

  it('does not modify original data', () => {
    const data = makeOntology();
    const vBefore = data.metadata.version;
    serializeToOAAJsonLD(data);
    expect(data.metadata.version).toBe(vBefore);
  });

  it('preserves entities and relationships', () => {
    const data = makeOntology();
    const parsed = JSON.parse(serializeToOAAJsonLD(data));
    expect(parsed.entities).toHaveLength(2);
    expect(parsed.relationships).toHaveLength(1);
  });
});

// --- Undo / Redo ---

describe('undo / redo', () => {
  beforeEach(() => {
    state.authoringUndoStack = [];
    state.authoringRedoStack = [];
    state.authoringDirty = false;
    state.currentData = null;
    state.lastParsed = null;
  });

  it('pushUndoSnapshot stores current state', () => {
    state.currentData = makeOntology();
    pushUndoSnapshot('addEntity');
    expect(state.authoringUndoStack).toHaveLength(1);
    expect(state.authoringUndoStack[0].operation).toBe('addEntity');
    expect(state.authoringDirty).toBe(true);
  });

  it('pushUndoSnapshot clears redo stack', () => {
    state.currentData = makeOntology();
    state.authoringRedoStack.push({ operation: 'old', snapshot: '{}', timestamp: 0 });
    pushUndoSnapshot('new');
    expect(state.authoringRedoStack).toHaveLength(0);
  });

  it('undo restores previous state', () => {
    state.currentData = makeOntology();
    pushUndoSnapshot('addEntity');
    // Mutate current data
    state.currentData.entities.push({ '@id': 'pf:New', name: 'New' });
    expect(state.currentData.entities).toHaveLength(3);

    const result = undo();
    expect(result.success).toBe(true);
    expect(result.operation).toBe('addEntity');
    expect(state.currentData.entities).toHaveLength(2);
  });

  it('undo pushes to redo stack', () => {
    state.currentData = makeOntology();
    pushUndoSnapshot('op1');
    state.currentData.entities.push({ '@id': 'pf:New', name: 'New' });
    undo();
    expect(state.authoringRedoStack).toHaveLength(1);
  });

  it('redo restores undone state', () => {
    state.currentData = makeOntology();
    pushUndoSnapshot('op1');
    state.currentData.entities.push({ '@id': 'pf:New', name: 'New' });
    undo();
    expect(state.currentData.entities).toHaveLength(2);

    const result = redo();
    expect(result.success).toBe(true);
    expect(state.currentData.entities).toHaveLength(3);
  });

  it('undo fails when stack is empty', () => {
    const result = undo();
    expect(result.success).toBe(false);
  });

  it('redo fails when stack is empty', () => {
    const result = redo();
    expect(result.success).toBe(false);
  });

  it('skips snapshot when no currentData', () => {
    state.currentData = null;
    pushUndoSnapshot('noop');
    expect(state.authoringUndoStack).toHaveLength(0);
  });
});

// --- Lookup helpers ---

describe('listEntityIds', () => {
  it('returns list of entity IDs', () => {
    const data = makeOntology();
    const ids = listEntityIds(data);
    expect(ids).toEqual(['pf:Alpha', 'pf:Beta']);
  });

  it('returns empty for data without entities', () => {
    expect(listEntityIds({})).toEqual([]);
  });
});

describe('getEntity', () => {
  it('finds entity by @id', () => {
    const data = makeOntology();
    const ent = getEntity(data, 'pf:Alpha');
    expect(ent).toBeDefined();
    expect(ent.name).toBe('Alpha');
  });

  it('returns null for missing entity', () => {
    const data = makeOntology();
    expect(getEntity(data, 'pf:Missing')).toBeNull();
  });

  it('returns null for data without entities', () => {
    expect(getEntity({}, 'x')).toBeNull();
  });
});

describe('getRelationship', () => {
  it('finds relationship by name', () => {
    const data = makeOntology();
    const rel = getRelationship(data, 'relatesTo');
    expect(rel).toBeDefined();
    expect(rel.domainIncludes).toContain('pf:Alpha');
  });

  it('returns null for missing relationship', () => {
    const data = makeOntology();
    expect(getRelationship(data, 'missing')).toBeNull();
  });

  it('returns null for data without relationships', () => {
    expect(getRelationship({}, 'x')).toBeNull();
  });
});

// --- Edge cases: different ontology formats ---

describe('format compatibility', () => {
  it('handles ontologyDefinition.entities format', () => {
    const data = {
      ontologyDefinition: {
        entities: [{ '@id': 'x:A', name: 'A' }],
        relationships: [{ name: 'r1', domainIncludes: ['x:A'], rangeIncludes: ['x:A'] }]
      },
      metadata: { version: '1.0.0' },
    };
    expect(listEntityIds(data)).toEqual(['x:A']);
    const result = addEntity(data, { id: 'x:B', name: 'B' });
    expect(result.success).toBe(true);
  });

  it('handles object-keyed entities format', () => {
    const data = {
      entities: { Foo: { '@id': 'x:Foo', name: 'Foo' }, Bar: { '@id': 'x:Bar', name: 'Bar' } },
      relationships: [],
      metadata: { version: '1.0.0' },
    };
    const ids = listEntityIds(data);
    expect(ids).toHaveLength(2);
    expect(ids).toContain('x:Foo');
  });

  it('handles ontologyDefinition.@graph format', () => {
    const data = {
      ontologyDefinition: {
        '@graph': [{ '@id': 'x:A', name: 'A' }],
        relationships: []
      },
      metadata: { version: '1.0.0' },
    };
    const ids = listEntityIds(data);
    expect(ids).toEqual(['x:A']);
  });
});
