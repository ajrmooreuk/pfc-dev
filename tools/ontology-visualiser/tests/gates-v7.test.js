/**
 * TDD tests for OAA v7 Quality Gates: G20 (Competency Coverage), G21 (Semantic Duplication).
 * Written BEFORE implementation per F21.14 TDD policy.
 */

import { describe, it, expect, vi } from 'vitest';

vi.mock('../js/state.js', () => ({
  state: {},
  OAA_REQUIRED_ENTITY_PROPS: ['@id', '@type', 'name', 'description'],
  OAA_REQUIRED_REL_PROPS: ['@type', 'name'],
}));

import {
  validateG20CompetencyCoverage,
  validateG21SemanticDuplication,
  tokenJaccard,
} from '../js/audit-engine.js';

// ── Fixtures ──

const ontologyWithFullCoverage = {
  '@context': 'https://schema.org',
  '@id': 'test:covered',
  name: 'Full Coverage',
  version: '1.0.0',
  'oaa:schemaVersion': '7.0.0',
  entities: [
    { '@id': 'test:Alpha', '@type': 'Class', name: 'Alpha', description: 'Primary entity' },
    { '@id': 'test:Beta', '@type': 'Class', name: 'Beta', description: 'Secondary entity' },
  ],
  relationships: [
    { '@type': 'Relationship', name: 'relatesTo', domainIncludes: ['test:Alpha'], rangeIncludes: ['test:Beta'] },
  ],
  businessRules: [
    { '@id': 'test:BR-001', name: 'BR-001', condition: 'IF Alpha exists', action: 'THEN Beta must be linked', severity: 'error' },
  ],
  competencyQuestions: [
    {
      '@id': 'test:CQ-001',
      '@type': 'oaa:CompetencyQuestion',
      question: 'Which entities relate to each other?',
      targetEntities: ['test:Alpha', 'test:Beta'],
      targetRelationships: ['relatesTo'],
      targetRules: ['test:BR-001'],
      priority: 'P0',
    },
  ],
};

const ontologyWithPartialCoverage = {
  '@context': 'https://schema.org',
  '@id': 'test:partial',
  name: 'Partial Coverage',
  version: '1.0.0',
  'oaa:schemaVersion': '7.0.0',
  entities: [
    { '@id': 'test:Alpha', '@type': 'Class', name: 'Alpha', description: 'Primary entity' },
    { '@id': 'test:Beta', '@type': 'Class', name: 'Beta', description: 'Secondary entity' },
    { '@id': 'test:Gamma', '@type': 'Class', name: 'Gamma', description: 'Uncovered entity' },
  ],
  relationships: [
    { '@type': 'Relationship', name: 'relatesTo', domainIncludes: ['test:Alpha'], rangeIncludes: ['test:Beta'] },
    { '@type': 'Relationship', name: 'dependsOn', domainIncludes: ['test:Beta'], rangeIncludes: ['test:Gamma'] },
  ],
  businessRules: [
    { '@id': 'test:BR-001', name: 'BR-001', condition: 'IF Alpha', action: 'THEN Beta', severity: 'error' },
  ],
  competencyQuestions: [
    {
      '@id': 'test:CQ-001',
      question: 'How do Alpha and Beta relate?',
      targetEntities: ['test:Alpha', 'test:Beta'],
      targetRelationships: ['relatesTo'],
      targetRules: ['test:BR-001'],
      priority: 'P0',
    },
    // Gamma and dependsOn NOT covered
  ],
};

const ontologyWithNoCQs = {
  '@context': 'https://schema.org',
  '@id': 'test:nocq',
  name: 'No CQs',
  version: '2.0.0',
  entities: [
    { '@id': 'test:Alpha', '@type': 'Class', name: 'Alpha', description: 'An entity' },
  ],
  relationships: [],
  businessRules: [],
};

const v6Ontology = {
  '@context': 'https://schema.org',
  '@id': 'test:v6',
  name: 'Legacy v6',
  version: '1.0.0',
  'oaa:schemaVersion': '6.1.0',
  entities: [
    { '@id': 'test:Old', '@type': 'Class', name: 'Old', description: 'Legacy entity' },
  ],
  relationships: [],
  businessRules: [],
};

// ── G20: Competency Coverage ──

describe('G20: Competency Coverage', () => {
  it('passes with 100% entity, relationship, and rule coverage', () => {
    const result = validateG20CompetencyCoverage(ontologyWithFullCoverage);
    expect(result.gate).toBe('G20: Competency Coverage');
    expect(result.status).toBe('pass');
    expect(result.issues).toHaveLength(0);
  });

  it('warns when entity coverage is below 100% but above 80%', () => {
    // 2/3 entities covered = 66% — should warn
    const result = validateG20CompetencyCoverage(ontologyWithPartialCoverage);
    expect(result.status).toBe('warn');
    expect(result.warnings.some(w => w.includes('Gamma'))).toBe(true);
  });

  it('reports uncovered relationships', () => {
    const result = validateG20CompetencyCoverage(ontologyWithPartialCoverage);
    expect(result.warnings.some(w => w.includes('dependsOn'))).toBe(true);
  });

  it('warns when no competencyQuestions array exists on v7+ ontology', () => {
    const result = validateG20CompetencyCoverage(ontologyWithNoCQs);
    expect(result.status).toBe('warn');
    expect(result.skipped).toBe(false);
    expect(result.warnings.some(w => w.includes('required for v7'))).toBe(true);
  });

  it('skips for explicit v6.x ontologies', () => {
    const result = validateG20CompetencyCoverage(v6Ontology);
    expect(result.skipped).toBe(true);
  });

  it('includes coverage percentages in detail', () => {
    const result = validateG20CompetencyCoverage(ontologyWithFullCoverage);
    expect(result.detail).toMatch(/100%/);
  });

  it('returns entity, relationship, and rule coverage metrics', () => {
    const result = validateG20CompetencyCoverage(ontologyWithPartialCoverage);
    expect(result.metrics).toBeDefined();
    expect(result.metrics.entityCoverage).toBeCloseTo(66.7, 0);
    expect(result.metrics.relationshipCoverage).toBe(50);
    expect(result.metrics.ruleCoverage).toBe(100);
  });
});

// ── G21: Semantic Duplication ──

const ontologyWithDuplicates = {
  '@context': 'https://schema.org',
  '@id': 'test:dups',
  name: 'Duplicates',
  version: '1.0.0',
  'oaa:schemaVersion': '7.0.0',
  entities: [
    { '@id': 'test:CustomerOrder', '@type': 'Class', name: 'CustomerOrder', description: 'An order placed by a customer for products or services' },
    { '@id': 'test:ClientOrder', '@type': 'Class', name: 'ClientOrder', description: 'An order placed by a client for products or services' },
    { '@id': 'test:Invoice', '@type': 'Class', name: 'Invoice', description: 'A billing document sent to the customer after delivery' },
  ],
  relationships: [],
};

const ontologyNoDuplicates = {
  '@context': 'https://schema.org',
  '@id': 'test:nodup',
  name: 'Clean',
  version: '1.0.0',
  'oaa:schemaVersion': '7.0.0',
  entities: [
    { '@id': 'test:Order', '@type': 'Class', name: 'Order', description: 'A commercial transaction for goods' },
    { '@id': 'test:Invoice', '@type': 'Class', name: 'Invoice', description: 'A billing document sent after delivery' },
    { '@id': 'test:Shipment', '@type': 'Class', name: 'Shipment', description: 'Physical delivery of goods to a destination' },
  ],
  relationships: [],
};

const ontologyHighDuplication = {
  '@context': 'https://schema.org',
  '@id': 'test:highdup',
  name: 'HighDup',
  version: '1.0.0',
  'oaa:schemaVersion': '7.0.0',
  entities: [
    { '@id': 'test:StrategicObjective', '@type': 'Class', name: 'StrategicObjective', description: 'A high-level strategic goal for the organization' },
    { '@id': 'test:StrategicGoal', '@type': 'Class', name: 'StrategicGoal', description: 'A high-level strategic goal for the organization' },
  ],
  relationships: [],
};

describe('G21: Semantic Duplication Audit', () => {
  it('passes when no entities have similar descriptions', () => {
    const result = validateG21SemanticDuplication(ontologyNoDuplicates);
    expect(result.gate).toBe('G21: Semantic Duplication Audit');
    expect(result.status).toBe('pass');
    expect(result.issues).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });

  it('warns when description similarity exceeds 70%', () => {
    const result = validateG21SemanticDuplication(ontologyWithDuplicates);
    expect(result.status).toBe('warn');
    expect(result.warnings.some(w =>
      w.includes('CustomerOrder') && w.includes('ClientOrder')
    )).toBe(true);
  });

  it('fails when description similarity exceeds 90%', () => {
    const result = validateG21SemanticDuplication(ontologyHighDuplication);
    expect(result.status).toBe('fail');
    expect(result.issues.some(i =>
      i.includes('StrategicObjective') && i.includes('StrategicGoal')
    )).toBe(true);
  });

  it('skips for v6.x ontologies', () => {
    const result = validateG21SemanticDuplication(v6Ontology);
    expect(result.skipped).toBe(true);
  });

  it('skips when ontology has fewer than 2 entities', () => {
    const singleEntity = {
      entities: [{ '@id': 'test:Solo', name: 'Solo', description: 'Only one' }],
    };
    const result = validateG21SemanticDuplication(singleEntity);
    expect(result.skipped).toBe(true);
  });

  it('is advisory (never blocks compliance)', () => {
    const result = validateG21SemanticDuplication(ontologyHighDuplication);
    expect(result.advisory).toBe(true);
  });

  it('reports similarity percentage in issues/warnings', () => {
    const result = validateG21SemanticDuplication(ontologyWithDuplicates);
    const allMessages = [...result.issues, ...result.warnings];
    expect(allMessages.some(m => /%/.test(m))).toBe(true);
  });
});

// ── tokenJaccard utility ──

describe('tokenJaccard', () => {
  it('returns 1.0 for identical strings', () => {
    expect(tokenJaccard('hello world', 'hello world')).toBe(1.0);
  });

  it('returns 0.0 for completely different strings', () => {
    expect(tokenJaccard('alpha beta', 'gamma delta')).toBe(0.0);
  });

  it('returns value between 0 and 1 for partial overlap', () => {
    const score = tokenJaccard('an order placed by a customer', 'an order placed by a client');
    expect(score).toBeGreaterThan(0.5);
    expect(score).toBeLessThan(1.0);
  });

  it('is case-insensitive', () => {
    expect(tokenJaccard('Hello World', 'hello world')).toBe(1.0);
  });

  it('handles empty strings', () => {
    expect(tokenJaccard('', '')).toBe(0.0);
    expect(tokenJaccard('hello', '')).toBe(0.0);
  });
});
