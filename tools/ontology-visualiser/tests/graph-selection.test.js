/**
 * Unit tests for subgraph selection export (Epic 7 — Feature 7.5).
 */

import { describe, it, expect, vi } from 'vitest';

// Mock state.js
vi.mock('../js/state.js', () => ({
  state: { currentData: null, network: null },
  TYPE_COLORS: { default: '#017c75' },
}));

// Mock audit-engine (used by export.js)
vi.mock('../js/audit-engine.js', () => ({
  validateOAAv5: vi.fn(() => ({ gates: [], overall: 'pass', summary: {} })),
}));

// Mock ui-panels (used by export.js)
vi.mock('../js/ui-panels.js', () => ({
  buildGateReportMarkdown: vi.fn(() => ''),
}));

import { exportSubgraph } from '../js/export.js';

// --- Fixtures ---

function makeOntology() {
  return {
    '@context': { '@vocab': 'https://schema.org/' },
    '@type': 'Ontology',
    metadata: { name: 'Test', version: '1.0.0' },
    entities: [
      { '@id': 'pf:Alpha', name: 'Alpha', description: 'First' },
      { '@id': 'pf:Beta', name: 'Beta', description: 'Second' },
      { '@id': 'pf:Gamma', name: 'Gamma', description: 'Third' },
    ],
    relationships: [
      { name: 'relatesTo', domainIncludes: ['pf:Alpha'], rangeIncludes: ['pf:Beta'] },
      { name: 'dependsOn', domainIncludes: ['pf:Beta'], rangeIncludes: ['pf:Gamma'] },
      { name: 'links', domainIncludes: ['pf:Alpha'], rangeIncludes: ['pf:Gamma'] },
    ],
  };
}

// --- Tests ---

describe('exportSubgraph', () => {
  it('filters entities to selected node IDs', () => {
    const data = makeOntology();
    const nodeIds = new Set(['pf:Alpha', 'pf:Beta']);
    const edgeIds = new Set();
    const json = exportSubgraph(data, nodeIds, edgeIds);
    const result = JSON.parse(json);
    expect(result.entities).toHaveLength(2);
    expect(result.entities.map(e => e['@id'])).toEqual(['pf:Alpha', 'pf:Beta']);
  });

  it('filters relationships to only those between selected entities', () => {
    const data = makeOntology();
    const nodeIds = new Set(['pf:Alpha', 'pf:Beta']);
    const edgeIds = new Set();
    const json = exportSubgraph(data, nodeIds, edgeIds);
    const result = JSON.parse(json);
    // Only relatesTo (Alpha->Beta) should remain
    expect(result.relationships).toHaveLength(1);
    expect(result.relationships[0].name).toBe('relatesTo');
  });

  it('includes all relationships when all nodes selected', () => {
    const data = makeOntology();
    const nodeIds = new Set(['pf:Alpha', 'pf:Beta', 'pf:Gamma']);
    const json = exportSubgraph(data, nodeIds, new Set());
    const result = JSON.parse(json);
    expect(result.relationships).toHaveLength(3);
  });

  it('returns {} for empty selection', () => {
    const data = makeOntology();
    const json = exportSubgraph(data, new Set(), new Set());
    expect(json).toBe('{}');
  });

  it('returns {} for null data', () => {
    expect(exportSubgraph(null, new Set(['x']), new Set())).toBe('{}');
  });

  it('preserves metadata in export', () => {
    const data = makeOntology();
    const nodeIds = new Set(['pf:Alpha']);
    const json = exportSubgraph(data, nodeIds, new Set());
    const result = JSON.parse(json);
    expect(result.metadata.name).toBe('Test');
    expect(result.metadata.version).toBe('1.0.0');
    expect(result['@context']).toBeDefined();
  });

  it('does not modify original data', () => {
    const data = makeOntology();
    exportSubgraph(data, new Set(['pf:Alpha']), new Set());
    expect(data.entities).toHaveLength(3);
    expect(data.relationships).toHaveLength(3);
  });

  it('handles hasDefinedTerm format', () => {
    const data = {
      hasDefinedTerm: [
        { '@id': 'x:A', name: 'A' },
        { '@id': 'x:B', name: 'B' },
      ],
      relationships: [
        { name: 'r1', domainIncludes: ['x:A'], rangeIncludes: ['x:B'] },
      ],
    };
    const json = exportSubgraph(data, new Set(['x:A']), new Set());
    const result = JSON.parse(json);
    expect(result.hasDefinedTerm).toHaveLength(1);
    expect(result.relationships).toHaveLength(0); // A->B but only A selected
  });
});
