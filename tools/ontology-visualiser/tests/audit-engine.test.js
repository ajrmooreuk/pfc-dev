/**
 * Unit tests for audit-engine.js — G7, G8 gates and completeness scoring.
 */

import { describe, it, expect, vi } from 'vitest';

// Mock state.js to provide constants without browser deps
vi.mock('../js/state.js', () => ({
  state: {},
  OAA_REQUIRED_ENTITY_PROPS: ['@id', '@type', 'name', 'description'],
  OAA_REQUIRED_REL_PROPS: ['@type', 'name'],
}));

import {
  extractEntities,
  extractRelationships,
  validateOAAv5,
  computeCompletenessScore
} from '../js/audit-engine.js';

// --- Test fixtures ---

const compliantOntology = {
  '@context': 'https://schema.org',
  '@id': 'test:ontology',
  name: 'Test Ontology',
  version: '1.0.0',
  entities: [
    { '@id': 'test:Alpha', '@type': 'Class', name: 'Alpha', description: 'First entity in the test ontology' },
    { '@id': 'test:Beta', '@type': 'Class', name: 'Beta', description: 'Second entity in the test ontology' },
    { '@id': 'test:Gamma', '@type': 'Class', name: 'Gamma', description: 'Third entity in the test ontology' },
  ],
  relationships: [
    { '@type': 'Relationship', name: 'relatesTo', domainIncludes: ['test:Alpha'], rangeIncludes: ['test:Beta'], cardinality: '1..*' },
    { '@type': 'Relationship', name: 'dependsOn', domainIncludes: ['test:Beta'], rangeIncludes: ['test:Gamma'], cardinality: '0..1' },
  ],
  businessRules: [
    { name: 'Rule1', condition: 'IF Alpha exists', action: 'THEN Beta must be linked', severity: 'error' },
  ],
};

const missingPropsOntology = {
  '@context': 'https://schema.org',
  '@id': 'test:incomplete',
  name: 'Incomplete',
  entities: [
    { '@id': 'test:A', name: 'A' }, // missing @type and description
    { '@id': 'test:B', '@type': 'Class', name: 'B', description: 'OK entity' },
  ],
  relationships: [
    { name: 'linksTo', domainIncludes: ['test:A'], rangeIncludes: ['test:B'] }, // missing @type
  ],
};

const duplicateIdOntology = {
  '@context': 'https://schema.org',
  '@id': 'test:dup',
  name: 'Duplicate',
  entities: [
    { '@id': 'test:Same', '@type': 'Class', name: 'Same', description: 'First instance' },
    { '@id': 'test:Same', '@type': 'Class', name: 'Same', description: 'Second instance' },
  ],
  relationships: [],
};

const badNamingOntology = {
  '@context': 'https://schema.org',
  '@id': 'test:naming',
  name: 'NamingTest',
  entities: [
    { '@id': 'test:goodName', '@type': 'Class', name: 'goodName', description: 'lowercase start' }, // not PascalCase
    { '@id': 'other:Alpha', '@type': 'Class', name: 'Alpha', description: 'Different prefix' },
  ],
  relationships: [
    { '@type': 'Relationship', name: 'GoodRel', domainIncludes: ['test:goodName'], rangeIncludes: ['other:Alpha'] }, // not camelCase
  ],
};

// --- Parser: cross-ontology refs typed as external ---

import { parseOntology } from '../js/ontology-parser.js';

const jsonldWithCrossRefs = {
  '@context': {
    '@vocab': 'https://schema.org/',
    'org-ctx': 'https://platformcore.io/ontology/org-context/',
    'ctx': 'https://baiv.co.uk/ontology/'
  },
  '@id': 'org-ctx:TestOntology',
  '@type': 'DefinedTermSet',
  name: 'Test Cross-Ref Ontology',
  description: 'Tests that cross-ontology targets are marked external',
  hasDefinedTerm: [
    { '@id': 'org-ctx:EntityA', '@type': 'DefinedTerm', name: 'EntityA', description: 'First local entity in the test ontology' },
    { '@id': 'org-ctx:EntityB', '@type': 'DefinedTerm', name: 'EntityB', description: 'Second local entity in the test ontology' }
  ],
  relationships: [
    { '@type': 'rdf:Property', name: 'localRel', domainIncludes: 'org-ctx:EntityA', rangeIncludes: 'org-ctx:EntityB', cardinality: '1:1' },
    { '@type': 'rdf:Property', name: 'crossRef', domainIncludes: 'org-ctx:EntityA', rangeIncludes: 'ctx:ExternalEntity', cardinality: '1:n', 'oaa:crossOntologyRef': 'CTX' }
  ]
};

describe('Parser: cross-ontology reference node types', () => {
  it('marks unseen relationship targets as external, not class', () => {
    const parsed = parseOntology(jsonldWithCrossRefs, 'test');
    const externalNode = parsed.nodes.find(n => n.id === 'ctx:ExternalEntity');
    expect(externalNode).toBeDefined();
    expect(externalNode.entityType).toBe('external');
  });

  it('keeps local entities as class, not external', () => {
    const parsed = parseOntology(jsonldWithCrossRefs, 'test');
    const localA = parsed.nodes.find(n => n.id === 'org-ctx:EntityA');
    const localB = parsed.nodes.find(n => n.id === 'org-ctx:EntityB');
    expect(localA.entityType).toBe('class');
    expect(localB.entityType).toBe('class');
  });

  it('G4 skips external nodes and passes when locals have descriptions', () => {
    const parsed = parseOntology(jsonldWithCrossRefs, 'test');
    const validation = validateOAAv5(jsonldWithCrossRefs, parsed);
    const g4 = validation.gates.find(g => g.gate === 'G4: Semantic Consistency');
    expect(g4.status).toBe('pass');
    expect(g4.warnings).toHaveLength(0);
  });
});

// --- extractEntities ---

describe('extractEntities', () => {
  it('extracts from pf-ontology (array entities)', () => {
    const result = extractEntities(compliantOntology);
    expect(result).toHaveLength(3);
    expect(result[0].name).toBe('Alpha');
  });

  it('extracts from hasDefinedTerm', () => {
    const data = { hasDefinedTerm: [{ '@id': 'x:A', name: 'A' }] };
    const result = extractEntities(data);
    expect(result).toHaveLength(1);
  });

  it('extracts from pf-ontology-keyed (object entities)', () => {
    const data = { entities: { Foo: { '@id': 'x:Foo', name: 'Foo' }, Bar: { '@id': 'x:Bar', name: 'Bar' } } };
    const result = extractEntities(data);
    expect(result).toHaveLength(2);
  });

  it('returns empty array for unknown format', () => {
    const result = extractEntities({ something: 'else' });
    expect(result).toEqual([]);
  });
});

// --- extractRelationships ---

describe('extractRelationships', () => {
  it('extracts from relationships array', () => {
    const result = extractRelationships(compliantOntology);
    expect(result).toHaveLength(2);
  });

  it('returns empty array when no relationships', () => {
    const result = extractRelationships({ name: 'empty' });
    expect(result).toEqual([]);
  });
});

// --- G7: Schema Properties ---

describe('G7: Schema Properties', () => {
  it('passes for compliant ontology', () => {
    const parsed = { nodes: compliantOntology.entities.map(e => ({ id: e['@id'], label: e.name, entityType: 'class', description: e.description })), edges: [{ from: 'test:Alpha', to: 'test:Beta', label: 'relatesTo' }, { from: 'test:Beta', to: 'test:Gamma', label: 'dependsOn' }], diagnostics: { format: 'pf-ontology' } };
    const validation = validateOAAv5(compliantOntology, parsed);
    const g7 = validation.gates.find(g => g.gate === 'G7: Schema Properties');
    expect(g7).toBeDefined();
    expect(g7.status).toBe('pass');
  });

  it('fails when entities missing required props', () => {
    const parsed = { nodes: [{ id: 'test:A', label: 'A', entityType: 'class', description: '' }], edges: [{ from: 'test:A', to: 'test:B', label: 'linksTo' }], diagnostics: { format: 'pf-ontology' } };
    const validation = validateOAAv5(missingPropsOntology, parsed);
    const g7 = validation.gates.find(g => g.gate === 'G7: Schema Properties');
    expect(g7.status).toBe('fail');
    expect(g7.issues.some(i => i.includes('missing'))).toBe(true);
  });

  it('fails on duplicate @id', () => {
    const parsed = { nodes: [{ id: 'test:Same', label: 'Same', entityType: 'class', description: 'x' }], edges: [], diagnostics: { format: 'pf-ontology' } };
    const validation = validateOAAv5(duplicateIdOntology, parsed);
    const g7 = validation.gates.find(g => g.gate === 'G7: Schema Properties');
    expect(g7.status).toBe('fail');
    expect(g7.issues.some(i => i.includes('Duplicate'))).toBe(true);
  });
});

// --- G8: Naming Conventions ---

describe('G8: Naming Conventions', () => {
  it('passes for PascalCase entities and camelCase relationships', () => {
    const parsed = { nodes: [], edges: [], diagnostics: { format: 'pf-ontology' } };
    const validation = validateOAAv5(compliantOntology, parsed);
    const g8 = validation.gates.find(g => g.gate === 'G8: Naming Conventions');
    expect(g8).toBeDefined();
    expect(g8.advisory).toBe(true);
  });

  it('warns on non-PascalCase entity names', () => {
    const parsed = { nodes: [], edges: [], diagnostics: { format: 'pf-ontology' } };
    const validation = validateOAAv5(badNamingOntology, parsed);
    const g8 = validation.gates.find(g => g.gate === 'G8: Naming Conventions');
    expect(g8.status).toBe('warn');
    expect(g8.warnings.some(w => w.includes('not PascalCase') || w.includes('not camelCase') || w.includes('Mixed prefixes'))).toBe(true);
  });

  it('is advisory-only (never fail)', () => {
    const parsed = { nodes: [], edges: [], diagnostics: { format: 'pf-ontology' } };
    const validation = validateOAAv5(badNamingOntology, parsed);
    const g8 = validation.gates.find(g => g.gate === 'G8: Naming Conventions');
    expect(g8.status).not.toBe('fail');
  });
});

// --- Completeness Score ---

describe('computeCompletenessScore', () => {
  it('returns 100% for all-pass validation', () => {
    const validation = {
      gates: [
        { gate: 'G1: Schema Structure', status: 'pass' },
        { gate: 'G2: Relationship Cardinality', status: 'pass' },
        { gate: 'G2B: Entity Connectivity', status: 'pass' },
        { gate: 'G2C: Graph Connectivity', status: 'pass' },
        { gate: 'G3: Business Rules', status: 'pass' },
        { gate: 'G4: Semantic Consistency', status: 'pass' },
        { gate: 'G5: Completeness', status: 'pass', advisory: true },
        { gate: 'G6: UniRegistry Format', status: 'pass', skipped: true },
        { gate: 'G7: Schema Properties', status: 'pass' },
        { gate: 'G8: Naming Conventions', status: 'pass', advisory: true },
      ],
      overall: 'pass',
      summary: { pass: 8, warn: 0, fail: 0, advisory: 2 }
    };
    const score = computeCompletenessScore(validation);
    expect(score.totalScore).toBe(100);
    expect(score.totalLabel).toBe('Excellent');
    expect(score.categories).toHaveLength(5);
  });

  it('returns lower score for mixed results', () => {
    const validation = {
      gates: [
        { gate: 'G1: Schema Structure', status: 'pass' },
        { gate: 'G2: Relationship Cardinality', status: 'pass' },
        { gate: 'G2B: Entity Connectivity', status: 'fail' },
        { gate: 'G2C: Graph Connectivity', status: 'warn' },
        { gate: 'G3: Business Rules', status: 'warn' },
        { gate: 'G4: Semantic Consistency', status: 'pass' },
        { gate: 'G5: Completeness', status: 'warn', advisory: true },
        { gate: 'G6: UniRegistry Format', status: 'pass', skipped: true },
        { gate: 'G7: Schema Properties', status: 'fail' },
        { gate: 'G8: Naming Conventions', status: 'warn', advisory: true },
      ],
      overall: 'fail',
      summary: { pass: 4, warn: 2, fail: 2, advisory: 2 }
    };
    const score = computeCompletenessScore(validation);
    expect(score.totalScore).toBeLessThan(80);
    expect(score.totalScore).toBeGreaterThan(0);
    // Score will be below 60 due to G2B fail + G7 fail
    expect(['Needs Work', 'Poor']).toContain(score.totalLabel);
  });

  it('has correct category weights summing to 1.0', () => {
    const validation = {
      gates: [
        { gate: 'G1: Schema Structure', status: 'pass' },
        { gate: 'G2B: Entity Connectivity', status: 'pass' },
        { gate: 'G2C: Graph Connectivity', status: 'pass' },
        { gate: 'G3: Business Rules', status: 'pass' },
        { gate: 'G4: Semantic Consistency', status: 'pass' },
        { gate: 'G5: Completeness', status: 'pass' },
        { gate: 'G6: UniRegistry Format', status: 'pass', skipped: true },
        { gate: 'G7: Schema Properties', status: 'pass' },
        { gate: 'G8: Naming Conventions', status: 'pass', advisory: true },
      ],
      overall: 'pass',
      summary: { pass: 7, warn: 0, fail: 0, advisory: 1 }
    };
    const score = computeCompletenessScore(validation);
    const totalWeight = score.categories.reduce((sum, c) => sum + c.weight, 0);
    expect(totalWeight).toBeCloseTo(1.0, 5);
  });
});
