/**
 * TDD tests for S21.17.4: G8 Style Guide compliance extension.
 * Advisory checks per OAA-STYLE-GUIDE.md rules.
 * Written BEFORE implementation per F21.14 TDD policy.
 */

import { describe, it, expect, vi } from 'vitest';

vi.mock('../js/state.js', () => ({
  state: { viewMode: 'single', loadedOntologies: new Map() },
}));

const { validateG8StyleGuideCompliance } = await import('../js/audit-engine.js');

// ── Fixtures ──

const v7OntologyClean = {
  'oaa:schemaVersion': '7.0.0',
  'oaa:ontologyId': 'TEST-ONT',
  name: 'Test Ontology',
  entities: [
    { '@id': 'test:StrategicGoal', name: 'StrategicGoal', description: 'A strategic goal driving the organization' },
    { '@id': 'test:KeyResult', name: 'KeyResult', description: 'A measurable key result linked to objectives' },
  ],
  relationships: [
    { name: 'alignsTo', domainIncludes: 'test:StrategicGoal', rangeIncludes: 'test:KeyResult' },
    { name: 'tracksProgress', domainIncludes: 'test:KeyResult', rangeIncludes: 'test:StrategicGoal' },
  ],
};

const v7OntologySpacedRels = {
  'oaa:schemaVersion': '7.0.0',
  'oaa:ontologyId': 'LEGACY-ONT',
  name: 'Legacy Ontology',
  entities: [
    { '@id': 'leg:Goal', name: 'Goal', description: 'An organizational goal' },
    { '@id': 'leg:Metric', name: 'Metric', description: 'A measurement metric' },
  ],
  relationships: [
    { name: 'Has Metric', domainIncludes: 'leg:Goal', rangeIncludes: 'leg:Metric' },
    { name: 'Belongs To Category', domainIncludes: 'leg:Metric', rangeIncludes: 'leg:Goal' },
  ],
};

const v7OntologyMixedPrefixes = {
  'oaa:schemaVersion': '7.0.0',
  'oaa:ontologyId': 'KPI-ONT',
  name: 'KPI Ontology',
  entities: [
    { '@id': 'pfc:Vision', name: 'Vision', description: 'The organizational vision statement' },
    { '@id': 'pfc:KPI', name: 'KPI', description: 'Key performance indicator' },
  ],
  relationships: [
    { name: 'measuredBy', domainIncludes: 'pfc:Vision', rangeIncludes: 'pfc:KPI' },
  ],
};

const v7OntologyShortDescriptions = {
  'oaa:schemaVersion': '7.0.0',
  'oaa:ontologyId': 'SHORT-ONT',
  name: 'Short Ontology',
  entities: [
    { '@id': 'short:Item', name: 'Item', description: 'An item' },
    { '@id': 'short:Thing', name: 'Thing', description: 'A thing' },
  ],
  relationships: [],
};

const v7OntologyNounRels = {
  'oaa:schemaVersion': '7.0.0',
  'oaa:ontologyId': 'NOUN-ONT',
  name: 'Noun Ontology',
  entities: [
    { '@id': 'noun:Process', name: 'Process', description: 'A business process definition' },
  ],
  relationships: [
    { name: 'governance', domainIncludes: 'noun:Process', rangeIncludes: 'noun:Process' },
    { name: 'alignment', domainIncludes: 'noun:Process', rangeIncludes: 'noun:Process' },
  ],
};

const v6Ontology = {
  'oaa:schemaVersion': '6.1.0',
  name: 'v6 Ontology',
  entities: [
    { '@id': 'pf:Org', name: 'Org', description: 'Organization' },
  ],
  relationships: [
    { name: 'Has Child', domainIncludes: 'pf:Org', rangeIncludes: 'pf:Org' },
  ],
};

// ── Tests ──

describe('G8 Style Guide Compliance (advisory)', () => {
  it('passes clean v7 ontology with all conventions met', () => {
    const result = validateG8StyleGuideCompliance(v7OntologyClean);
    expect(result.gate).toBe('G8: Style Guide Compliance');
    expect(result.status).toBe('pass');
    expect(result.advisory).toBe(true);
    expect(result.warnings).toHaveLength(0);
  });

  it('warns on spaced-phrase relationship names in v7', () => {
    const result = validateG8StyleGuideCompliance(v7OntologySpacedRels);
    expect(result.status).toBe('warn');
    expect(result.warnings.some(w => w.includes('Has Metric'))).toBe(true);
    expect(result.warnings.some(w => w.includes('camelCase'))).toBe(true);
  });

  it('warns on entity @id prefix mismatch with ontologyId', () => {
    const result = validateG8StyleGuideCompliance(v7OntologyMixedPrefixes);
    expect(result.status).toBe('warn');
    expect(result.warnings.some(w => w.includes('pfc') && w.includes('kpi'))).toBe(true);
  });

  it('warns on short entity descriptions (<10 chars)', () => {
    const result = validateG8StyleGuideCompliance(v7OntologyShortDescriptions);
    expect(result.status).toBe('warn');
    expect(result.warnings.some(w => w.includes('description') && w.includes('short'))).toBe(true);
  });

  it('warns on bare-noun relationship names (not verb-object)', () => {
    const result = validateG8StyleGuideCompliance(v7OntologyNounRels);
    expect(result.status).toBe('warn');
    expect(result.warnings.some(w => w.includes('governance') || w.includes('alignment'))).toBe(true);
  });

  it('skips for v6 ontologies', () => {
    const result = validateG8StyleGuideCompliance(v6Ontology);
    expect(result.status).toBe('pass');
    expect(result.skipped).toBe(true);
  });

  it('returns metrics with check counts', () => {
    const result = validateG8StyleGuideCompliance(v7OntologyClean);
    expect(result.metrics).toBeDefined();
    expect(typeof result.metrics.entitiesChecked).toBe('number');
    expect(typeof result.metrics.relationshipsChecked).toBe('number');
  });
});
