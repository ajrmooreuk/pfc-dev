/**
 * Unit tests for diff-engine.js — ontology comparison and changelog generation.
 */

import { describe, it, expect, vi } from 'vitest';

// Mock state.js
vi.mock('../js/state.js', () => ({
  state: {},
  OAA_REQUIRED_ENTITY_PROPS: ['@id', '@type', 'name', 'description'],
  OAA_REQUIRED_REL_PROPS: ['@type', 'name'],
}));

import { diffOntologies, generateChangelog } from '../js/diff-engine.js';

// --- Test fixtures ---

const ontologyV1 = {
  '@context': 'https://schema.org',
  '@id': 'test:ontology',
  name: 'Test Ontology',
  version: '1.0.0',
  entities: [
    { '@id': 'test:Alpha', '@type': 'Class', name: 'Alpha', description: 'First entity' },
    { '@id': 'test:Beta', '@type': 'Class', name: 'Beta', description: 'Second entity' },
    { '@id': 'test:Gamma', '@type': 'Class', name: 'Gamma', description: 'Third entity' },
  ],
  relationships: [
    { '@type': 'Relationship', name: 'relatesTo', domainIncludes: ['test:Alpha'], rangeIncludes: ['test:Beta'] },
  ],
};

const ontologyV2 = {
  '@context': 'https://schema.org',
  '@id': 'test:ontology',
  name: 'Test Ontology',
  version: '2.0.0',
  entities: [
    { '@id': 'test:Alpha', '@type': 'Class', name: 'Alpha', description: 'Updated first entity' }, // modified
    { '@id': 'test:Beta', '@type': 'Class', name: 'Beta', description: 'Second entity' },          // unchanged
    // Gamma removed
    { '@id': 'test:Delta', '@type': 'Class', name: 'Delta', description: 'New entity' },            // added
  ],
  relationships: [
    { '@type': 'Relationship', name: 'relatesTo', domainIncludes: ['test:Alpha'], rangeIncludes: ['test:Beta'] },
    { '@type': 'Relationship', name: 'dependsOn', domainIncludes: ['test:Delta'], rangeIncludes: ['test:Beta'] }, // added
  ],
};

const identicalOntology = { ...ontologyV1 };

// --- diffOntologies ---

describe('diffOntologies', () => {
  it('returns zero diffs for identical ontologies', () => {
    const diff = diffOntologies(ontologyV1, ontologyV1);
    expect(diff.summary.entitiesAdded).toBe(0);
    expect(diff.summary.entitiesRemoved).toBe(0);
    expect(diff.summary.entitiesModified).toBe(0);
    expect(diff.summary.entitiesUnchanged).toBe(3);
  });

  it('detects added entity', () => {
    const diff = diffOntologies(ontologyV1, ontologyV2);
    expect(diff.summary.entitiesAdded).toBe(1);
    expect(diff.entities.added[0].id).toBe('test:Delta');
  });

  it('detects removed entity', () => {
    const diff = diffOntologies(ontologyV1, ontologyV2);
    expect(diff.summary.entitiesRemoved).toBe(1);
    expect(diff.entities.removed[0].id).toBe('test:Gamma');
  });

  it('detects modified entity with change details', () => {
    const diff = diffOntologies(ontologyV1, ontologyV2);
    expect(diff.summary.entitiesModified).toBe(1);
    const mod = diff.entities.modified[0];
    expect(mod.id).toBe('test:Alpha');
    expect(mod.changes.some(c => c.property === 'description')).toBe(true);
  });

  it('detects added relationship', () => {
    const diff = diffOntologies(ontologyV1, ontologyV2);
    expect(diff.summary.relsAdded).toBe(1);
    expect(diff.relationships.added[0].id).toBe('dependsOn');
  });

  it('detects metadata version change', () => {
    const diff = diffOntologies(ontologyV1, ontologyV2);
    expect(diff.metadata.some(m => m.property === 'version')).toBe(true);
    expect(diff.oldVersion).toBe('1.0.0');
    expect(diff.newVersion).toBe('2.0.0');
  });

  it('works with pf-ontology-keyed format (object entities)', () => {
    const oldKeyed = {
      name: 'Keyed',
      version: '1.0.0',
      entities: { Foo: { '@id': 'k:Foo', name: 'Foo' }, Bar: { '@id': 'k:Bar', name: 'Bar' } },
      relationships: [],
    };
    const newKeyed = {
      name: 'Keyed',
      version: '2.0.0',
      entities: { Foo: { '@id': 'k:Foo', name: 'Foo' }, Baz: { '@id': 'k:Baz', name: 'Baz' } },
      relationships: [],
    };
    const diff = diffOntologies(oldKeyed, newKeyed);
    expect(diff.summary.entitiesAdded).toBe(1);
    expect(diff.summary.entitiesRemoved).toBe(1);
  });

  it('works with hasDefinedTerm format', () => {
    const oldHdt = {
      name: 'HDT',
      version: '1.0.0',
      hasDefinedTerm: [{ '@id': 'h:X', name: 'X' }],
    };
    const newHdt = {
      name: 'HDT',
      version: '2.0.0',
      hasDefinedTerm: [{ '@id': 'h:X', name: 'X' }, { '@id': 'h:Y', name: 'Y' }],
    };
    const diff = diffOntologies(oldHdt, newHdt);
    expect(diff.summary.entitiesAdded).toBe(1);
    expect(diff.summary.entitiesUnchanged).toBe(1);
  });

  it('handles empty ontologies gracefully', () => {
    const empty = { name: 'Empty', version: '1.0.0' };
    const diff = diffOntologies(empty, empty);
    expect(diff.summary.entitiesAdded).toBe(0);
    expect(diff.summary.entitiesRemoved).toBe(0);
  });
});

// --- generateChangelog ---

describe('generateChangelog', () => {
  it('produces valid markdown with header', () => {
    const diff = diffOntologies(ontologyV1, ontologyV2);
    const md = generateChangelog(diff);
    expect(md).toContain('# Changelog');
    expect(md).toContain('1.0.0');
    expect(md).toContain('2.0.0');
  });

  it('includes summary table with correct counts', () => {
    const diff = diffOntologies(ontologyV1, ontologyV2);
    const md = generateChangelog(diff);
    expect(md).toContain('| Entities | 1 | 1 | 1 |');
  });

  it('lists added entities', () => {
    const diff = diffOntologies(ontologyV1, ontologyV2);
    const md = generateChangelog(diff);
    expect(md).toContain('## Added Entities');
    expect(md).toContain('test:Delta');
  });

  it('uses strikethrough for removed entities', () => {
    const diff = diffOntologies(ontologyV1, ontologyV2);
    const md = generateChangelog(diff);
    expect(md).toContain('## Removed Entities');
    expect(md).toContain('~~test:Gamma~~');
  });

  it('lists modified entities with changed properties', () => {
    const diff = diffOntologies(ontologyV1, ontologyV2);
    const md = generateChangelog(diff);
    expect(md).toContain('## Modified Entities');
    expect(md).toContain('test:Alpha');
    expect(md).toContain('description');
  });
});
