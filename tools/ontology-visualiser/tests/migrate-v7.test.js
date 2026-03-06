/**
 * TDD tests for S21.14.1: v6→v7 migration contract tests.
 * Validates that migrate-v7 correctly transforms v6 ontology JSON
 * into v7 shape with metadata fields and skeleton competency questions.
 * Written BEFORE implementation per F21.14 TDD policy.
 */

import { describe, it, expect } from 'vitest';
import {
  migrateOntologyToV7,
  generateSkeletonCQs,
  deriveOntologyIdFromEntry,
  deriveSeriesFromLayer,
} from '../scripts/migrate-v7.mjs';

// ── Fixtures ──

const v6OntologySimple = {
  '@context': 'https://schema.org',
  '@type': 'Ontology',
  '@id': 'vsom:VSOMFramework',
  name: 'VSOM Ontology',
  version: '3.0.0',
  entities: [
    { '@id': 'vsom:StrategicObjective', name: 'StrategicObjective', description: 'A strategic objective' },
    { '@id': 'vsom:VisionComponent', name: 'VisionComponent', description: 'The vision component' },
  ],
  relationships: [
    { name: 'cascadesTo', domainIncludes: 'vsom:StrategicObjective', rangeIncludes: 'vsom:VisionComponent' },
  ],
  businessRules: [
    { '@id': 'vsom:BR-001', name: 'BR-001', description: 'Vision must exist' },
  ],
};

const registryEntry = {
  '@id': 'Entry-ONT-VSOM-001',
  name: 'VSOM Ontology',
  namespace: 'vsom:',
  prefix: 'vsom:',
  layer: 'STRATEGIC LAYER (VE-Series)',
  artifacts: { ontology: './vsom-ontology-v3.0.0-oaa-v6.json' },
};

const v6OntologyNoEntities = {
  '@context': 'https://schema.org',
  name: 'Empty Ontology',
  version: '1.0.0',
  entities: [],
  relationships: [],
};

const emptyEntry = {
  '@id': 'Entry-ONT-EMPTY-001',
  namespace: 'empty:',
  prefix: 'empty:',
  layer: 'Foundation',
  artifacts: { ontology: './empty-v1.0.0.json' },
};

// ── deriveOntologyIdFromEntry ──

describe('deriveOntologyIdFromEntry', () => {
  it('derives VSOM-ONT from Entry-ONT-VSOM-001', () => {
    expect(deriveOntologyIdFromEntry('Entry-ONT-VSOM-001')).toBe('VSOM-ONT');
  });

  it('derives GRC-FW-ONT from Entry-ONT-GRC-FW-001', () => {
    expect(deriveOntologyIdFromEntry('Entry-ONT-GRC-FW-001')).toBe('GRC-FW-ONT');
  });

  it('derives ORG-CONTEXT-ONT from Entry-ONT-ORG-CTX-001', () => {
    expect(deriveOntologyIdFromEntry('Entry-ONT-ORG-CTX-001')).toBe('ORG-CTX-ONT');
  });

  it('derives EMC-ONT from Entry-ONT-EMC-001', () => {
    expect(deriveOntologyIdFromEntry('Entry-ONT-EMC-001')).toBe('EMC-ONT');
  });
});

// ── deriveSeriesFromLayer ──

describe('deriveSeriesFromLayer', () => {
  it('extracts VE-Series from "STRATEGIC LAYER (VE-Series)"', () => {
    expect(deriveSeriesFromLayer('STRATEGIC LAYER (VE-Series)')).toBe('VE-Series');
  });

  it('extracts PE-Series from "EXECUTION LAYER (PE-Series)"', () => {
    expect(deriveSeriesFromLayer('EXECUTION LAYER (PE-Series)')).toBe('PE-Series');
  });

  it('extracts RCSG-Series from "GOVERNANCE LAYER (RCSG-Series)"', () => {
    expect(deriveSeriesFromLayer('GOVERNANCE LAYER (RCSG-Series)')).toBe('RCSG-Series');
  });

  it('returns Foundation when no parenthesised series', () => {
    expect(deriveSeriesFromLayer('Foundation')).toBe('Foundation');
  });

  it('extracts Orchestration from "ORCHESTRATION LAYER (Orchestration)"', () => {
    expect(deriveSeriesFromLayer('ORCHESTRATION LAYER (Orchestration)')).toBe('Orchestration');
  });
});

// ── generateSkeletonCQs ──

describe('generateSkeletonCQs', () => {
  it('generates 1 CQ per entity', () => {
    const cqs = generateSkeletonCQs(v6OntologySimple);
    expect(cqs).toHaveLength(2);
  });

  it('each CQ has @id, question, targetEntities', () => {
    const cqs = generateSkeletonCQs(v6OntologySimple);
    cqs.forEach(cq => {
      expect(cq['@id']).toBeDefined();
      expect(cq.question).toBeDefined();
      expect(cq.targetEntities).toBeInstanceOf(Array);
      expect(cq.targetEntities.length).toBeGreaterThan(0);
    });
  });

  it('CQ @id follows pattern CQ-NNN', () => {
    const cqs = generateSkeletonCQs(v6OntologySimple);
    expect(cqs[0]['@id']).toMatch(/CQ-001/);
    expect(cqs[1]['@id']).toMatch(/CQ-002/);
  });

  it('includes targetRelationships and targetRules as empty arrays', () => {
    const cqs = generateSkeletonCQs(v6OntologySimple);
    cqs.forEach(cq => {
      expect(cq.targetRelationships).toBeInstanceOf(Array);
      expect(cq.targetRules).toBeInstanceOf(Array);
    });
  });

  it('returns empty array for ontology with no entities', () => {
    const cqs = generateSkeletonCQs(v6OntologyNoEntities);
    expect(cqs).toHaveLength(0);
  });
});

// ── migrateOntologyToV7 ──

describe('migrateOntologyToV7', () => {
  it('adds oaa:schemaVersion 7.0.0', () => {
    const result = migrateOntologyToV7(v6OntologySimple, registryEntry);
    expect(result['oaa:schemaVersion']).toBe('7.0.0');
  });

  it('adds oaa:ontologyId derived from entry', () => {
    const result = migrateOntologyToV7(v6OntologySimple, registryEntry);
    expect(result['oaa:ontologyId']).toBe('VSOM-ONT');
  });

  it('adds oaa:series derived from layer', () => {
    const result = migrateOntologyToV7(v6OntologySimple, registryEntry);
    expect(result['oaa:series']).toBe('VE-Series');
  });

  it('adds competencyQuestions array', () => {
    const result = migrateOntologyToV7(v6OntologySimple, registryEntry);
    expect(result.competencyQuestions).toBeInstanceOf(Array);
    expect(result.competencyQuestions.length).toBe(2);
  });

  it('preserves all existing fields', () => {
    const result = migrateOntologyToV7(v6OntologySimple, registryEntry);
    expect(result['@context']).toBe('https://schema.org');
    expect(result.name).toBe('VSOM Ontology');
    expect(result.version).toBe('3.0.0');
    expect(result.entities).toHaveLength(2);
    expect(result.relationships).toHaveLength(1);
    expect(result.businessRules).toHaveLength(1);
  });

  it('does not overwrite existing oaa:schemaVersion', () => {
    const alreadyV7 = { ...v6OntologySimple, 'oaa:schemaVersion': '7.0.0', 'oaa:ontologyId': 'VSOM-ONT' };
    const result = migrateOntologyToV7(alreadyV7, registryEntry);
    expect(result['oaa:schemaVersion']).toBe('7.0.0');
  });

  it('does not overwrite existing competencyQuestions', () => {
    const withCQs = { ...v6OntologySimple, competencyQuestions: [{ '@id': 'CQ-CUSTOM', question: 'Custom?' }] };
    const result = migrateOntologyToV7(withCQs, registryEntry);
    expect(result.competencyQuestions).toHaveLength(1);
    expect(result.competencyQuestions[0]['@id']).toBe('CQ-CUSTOM');
  });

  it('returns a migration report object', () => {
    const result = migrateOntologyToV7(v6OntologySimple, registryEntry);
    expect(result._migrationReport).toBeDefined();
    expect(result._migrationReport.fieldsAdded).toBeInstanceOf(Array);
    expect(result._migrationReport.fieldsAdded).toContain('oaa:schemaVersion');
    expect(result._migrationReport.cqsGenerated).toBe(2);
  });
});
