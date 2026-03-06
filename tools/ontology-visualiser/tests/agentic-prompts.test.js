/**
 * Unit tests for agentic ontology generation prompts (Epic 7 — Agentic Workflow).
 */

import { describe, it, expect, vi } from 'vitest';

// Mock state.js
vi.mock('../js/state.js', () => ({
  state: { currentData: null, lastValidation: null, lastParsed: null, lastAudit: null },
  SERIES_COLORS: {},
  DEFAULT_CATEGORIES: [],
}));

// Mock audit-engine
vi.mock('../js/audit-engine.js', () => ({
  validateOAAv5: vi.fn(() => ({ gates: [], overall: 'pass', summary: {} })),
}));

// Mock library-manager
vi.mock('../js/library-manager.js', () => ({
  getVersionHistory: vi.fn(() => Promise.resolve([])),
  loadOntologyFromLibrary: vi.fn(() => Promise.resolve({})),
}));

import {
  getOAASchemaSpec,
  getOAAExampleSnippet,
  buildGenerationPrompt,
  buildFixPrompt,
} from '../js/ui-panels.js';

// --- getOAASchemaSpec ---

describe('getOAASchemaSpec', () => {
  it('returns a string', () => {
    const spec = getOAASchemaSpec();
    expect(typeof spec).toBe('string');
    expect(spec.length).toBeGreaterThan(100);
  });

  it('includes all 8 gate references', () => {
    const spec = getOAASchemaSpec();
    expect(spec).toContain('G1');
    expect(spec).toContain('G2');
    expect(spec).toContain('G2B');
    expect(spec).toContain('G2C');
    expect(spec).toContain('G3');
    expect(spec).toContain('G4');
    expect(spec).toContain('G5');
    expect(spec).toContain('G7');
    expect(spec).toContain('G8');
  });

  it('includes entity format specification', () => {
    const spec = getOAASchemaSpec();
    expect(spec).toContain('EntityDefinition');
    expect(spec).toContain('@type');
    expect(spec).toContain('@id');
    expect(spec).toContain('description');
  });

  it('includes relationship format specification', () => {
    const spec = getOAASchemaSpec();
    expect(spec).toContain('domainIncludes');
    expect(spec).toContain('rangeIncludes');
    expect(spec).toContain('cardinality');
  });

  it('includes business rule format', () => {
    const spec = getOAASchemaSpec();
    expect(spec).toContain('IF');
    expect(spec).toContain('THEN');
    expect(spec).toContain('severity');
  });
});

// --- getOAAExampleSnippet ---

describe('getOAAExampleSnippet', () => {
  it('returns valid JSON', () => {
    const snippet = getOAAExampleSnippet();
    expect(() => JSON.parse(snippet)).not.toThrow();
  });

  it('has correct top-level structure', () => {
    const example = JSON.parse(getOAAExampleSnippet());
    expect(example['@context']).toBeDefined();
    expect(example['@type']).toBe('Ontology');
    expect(example['@id']).toBeDefined();
    expect(example.metadata).toBeDefined();
    expect(Array.isArray(example.entities)).toBe(true);
    expect(Array.isArray(example.relationships)).toBe(true);
    expect(Array.isArray(example.businessRules)).toBe(true);
  });

  it('has entities with required fields', () => {
    const example = JSON.parse(getOAAExampleSnippet());
    for (const entity of example.entities) {
      expect(entity['@type']).toBeDefined();
      expect(entity['@id']).toBeDefined();
      expect(entity.name).toBeDefined();
      expect(entity.description).toBeDefined();
      expect(entity.description.length).toBeGreaterThanOrEqual(20);
    }
  });

  it('has relationships with required fields', () => {
    const example = JSON.parse(getOAAExampleSnippet());
    for (const rel of example.relationships) {
      expect(rel['@type']).toBe('Property');
      expect(rel.name).toBeDefined();
      expect(Array.isArray(rel.domainIncludes)).toBe(true);
      expect(Array.isArray(rel.rangeIncludes)).toBe(true);
      expect(rel.cardinality).toBeDefined();
    }
  });

  it('has at least 3 business rules', () => {
    const example = JSON.parse(getOAAExampleSnippet());
    expect(example.businessRules.length).toBeGreaterThanOrEqual(3);
    for (const rule of example.businessRules) {
      expect(rule.condition).toContain('IF');
      expect(rule.action).toContain('THEN');
      expect(['error', 'warning']).toContain(rule.severity);
    }
  });

  it('all entities are connected via relationships', () => {
    const example = JSON.parse(getOAAExampleSnippet());
    const entityIds = new Set(example.entities.map(e => e['@id']));
    const connectedIds = new Set();
    for (const rel of example.relationships) {
      rel.domainIncludes.forEach(id => connectedIds.add(id));
      rel.rangeIncludes.forEach(id => connectedIds.add(id));
    }
    for (const id of entityIds) {
      expect(connectedIds.has(id)).toBe(true);
    }
  });
});

// --- buildGenerationPrompt ---

describe('buildGenerationPrompt', () => {
  it('includes ontology name and namespace', () => {
    const prompt = buildGenerationPrompt('Test Ontology', 'https://example.org/test', 'A test', '', 'custom');
    expect(prompt).toContain('Test Ontology');
    expect(prompt).toContain('https://example.org/test');
  });

  it('derives prefix from namespace', () => {
    const prompt = buildGenerationPrompt('Test', 'https://example.org/ontology/cj', 'desc', '', '');
    expect(prompt).toContain('Prefix: cj');
  });

  it('includes entity hints when provided', () => {
    const hints = 'Customer, Journey, Touchpoint';
    const prompt = buildGenerationPrompt('CJ', 'https://ex.org/cj', 'desc', hints, '');
    expect(prompt).toContain(hints);
  });

  it('includes schema spec', () => {
    const prompt = buildGenerationPrompt('Test', 'https://ex.org/t', 'desc', '', '');
    expect(prompt).toContain('EntityDefinition');
    expect(prompt).toContain('G2B');
    expect(prompt).toContain('G2C');
  });

  it('includes example snippet', () => {
    const prompt = buildGenerationPrompt('Test', 'https://ex.org/t', 'desc', '', '');
    expect(prompt).toContain('"@type": "Ontology"');
    expect(prompt).toContain('ex:Project');
  });

  it('includes output-only-JSON instruction', () => {
    const prompt = buildGenerationPrompt('Test', 'https://ex.org/t', 'desc', '', '');
    expect(prompt).toContain('Output ONLY valid JSON');
  });

  it('includes series when provided', () => {
    const prompt = buildGenerationPrompt('Test', 'https://ex.org/t', 'desc', '', 'VE-Series');
    expect(prompt).toContain('VE-Series');
  });

  it('includes all critical gate requirements', () => {
    const prompt = buildGenerationPrompt('Test', 'https://ex.org/t', 'desc', '', '');
    expect(prompt).toContain('G2B');
    expect(prompt).toContain('G2C');
    expect(prompt).toContain('G4');
    expect(prompt).toContain('G3');
    expect(prompt).toContain('G7');
    expect(prompt).toContain('G8');
    expect(prompt).toContain('G5');
  });
});

// --- buildFixPrompt ---

describe('buildFixPrompt', () => {
  const mockData = {
    '@context': { '@vocab': 'https://schema.org/' },
    '@type': 'Ontology',
    entities: [{ '@id': 'pf:Alpha', name: 'Alpha' }],
    relationships: [],
  };

  it('includes failing gate details', () => {
    const validation = {
      gates: [
        { gate: 'G2B: Entity Connectivity', status: 'fail', detail: '1 orphaned entity', orphaned: ['pf:Alpha'] },
        { gate: 'G1: Schema', status: 'pass', detail: 'OK' },
      ],
      overall: 'fail',
    };
    const prompt = buildFixPrompt(mockData, validation);
    expect(prompt).toContain('FAIL: G2B');
    expect(prompt).toContain('1 orphaned entity');
    expect(prompt).toContain('pf:Alpha');
  });

  it('includes warnings', () => {
    const validation = {
      gates: [
        { gate: 'G2B', status: 'fail', detail: 'orphans' },
        { gate: 'G5: Completeness', status: 'warn', detail: 'Low density' },
      ],
      overall: 'fail',
    };
    const prompt = buildFixPrompt(mockData, validation);
    expect(prompt).toContain('WARN: G5');
    expect(prompt).toContain('Low density');
  });

  it('includes the full ontology JSON', () => {
    const validation = {
      gates: [{ gate: 'G2B', status: 'fail', detail: 'orphans' }],
      overall: 'fail',
    };
    const prompt = buildFixPrompt(mockData, validation);
    expect(prompt).toContain('"@type": "Ontology"');
    expect(prompt).toContain('pf:Alpha');
  });

  it('includes preserve-structure instruction', () => {
    const validation = {
      gates: [{ gate: 'G2B', status: 'fail', detail: 'orphans' }],
      overall: 'fail',
    };
    const prompt = buildFixPrompt(mockData, validation);
    expect(prompt).toContain('Do NOT remove');
    expect(prompt).toContain('Preserve the existing structure');
  });

  it('includes schema spec for reference', () => {
    const validation = {
      gates: [{ gate: 'G2B', status: 'fail', detail: 'orphans' }],
      overall: 'fail',
    };
    const prompt = buildFixPrompt(mockData, validation);
    expect(prompt).toContain('EntityDefinition');
    expect(prompt).toContain('Compliance Gates');
  });

  it('includes output-only-JSON instruction', () => {
    const validation = {
      gates: [{ gate: 'G2B', status: 'fail', detail: 'orphans' }],
      overall: 'fail',
    };
    const prompt = buildFixPrompt(mockData, validation);
    expect(prompt).toContain('Output ONLY valid JSON');
  });

  it('handles missing descriptions in G4 warnings', () => {
    const validation = {
      gates: [
        { gate: 'G4: Semantic', status: 'warn', detail: 'missing descriptions', warnings: ['pf:Alpha: missing description'] },
        { gate: 'G2B', status: 'fail', detail: 'orphans' },
      ],
      overall: 'fail',
    };
    const prompt = buildFixPrompt(mockData, validation);
    expect(prompt).toContain('pf:Alpha');
    expect(prompt).toContain('Missing Descriptions');
  });
});
