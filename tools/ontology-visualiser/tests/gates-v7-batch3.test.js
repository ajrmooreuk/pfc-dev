/**
 * TDD tests for OAA v7 Quality Gate: G24 (Instance Data Quality).
 * Written BEFORE implementation per F21.18 TDD policy.
 *
 * S21.18.1: Schema-conformance validator
 * S21.18.2: Test data distribution analysis
 * S21.18.3: CQ-to-test-data linkage
 * S21.18.4: G24 gate integration
 */

import { describe, it, expect, vi } from 'vitest';

vi.mock('../js/state.js', () => ({
  state: {},
  OAA_REQUIRED_ENTITY_PROPS: ['@id', '@type', 'name', 'description'],
  OAA_REQUIRED_REL_PROPS: ['@type', 'name'],
}));

import {
  validateG24InstanceDataQuality,
} from '../js/audit-engine.js';

// ── Fixtures ──

const v6Ontology = {
  '@context': 'https://schema.org',
  '@id': 'test:v6',
  name: 'V6Ontology',
  'oaa:schemaVersion': '6.1.0',
  entities: [
    { '@id': 'org:Department', '@type': 'Class', name: 'Department', description: 'An org unit' },
  ],
};

// Ontology with valid instance data (OAA JSON-LD format)
const ontologyWithValidInstances = {
  '@context': 'https://schema.org',
  '@id': 'test:valid-instances',
  name: 'ValidInstances',
  'oaa:schemaVersion': '7.0.0',
  entities: [
    { '@id': 'vp:ValueProposition', '@type': 'Class', name: 'ValueProposition', description: 'A value proposition' },
    { '@id': 'vp:Problem', '@type': 'Class', name: 'Problem', description: 'A customer problem' },
  ],
  relationships: [
    { '@type': 'Relationship', name: 'addressesProblem', domainIncludes: ['vp:ValueProposition'], rangeIncludes: ['vp:Problem'] },
  ],
  competencyQuestions: [
    { '@id': 'CQ-001', question: 'What is a VP?', targetEntities: ['vp:ValueProposition'], targetRelationships: [], targetRules: [] },
    { '@id': 'CQ-002', question: 'What is a Problem?', targetEntities: ['vp:Problem'], targetRelationships: [], targetRules: [] },
  ],
  testInstances: {
    happyPath: [
      { '@id': 'inst-1', '@type': 'vp:ValueProposition', testCategory: 'happy-path', name: 'Test VP', cqRef: 'CQ-001' },
      { '@id': 'inst-2', '@type': 'vp:ValueProposition', testCategory: 'happy-path', name: 'Test VP 2', cqRef: 'CQ-001' },
      { '@id': 'inst-3', '@type': 'vp:Problem', testCategory: 'happy-path', name: 'Test Prob', cqRef: 'CQ-002' },
      { '@id': 'inst-4', '@type': 'vp:ValueProposition', testCategory: 'happy-path', name: 'VP 3', cqRef: 'CQ-001' },
      { '@id': 'inst-5', '@type': 'vp:Problem', testCategory: 'happy-path', name: 'Prob 2', cqRef: 'CQ-002' },
      { '@id': 'inst-6', '@type': 'vp:ValueProposition', testCategory: 'happy-path', name: 'VP 4', cqRef: 'CQ-001' },
    ],
    edgeCases: [
      { '@id': 'inst-7', '@type': 'vp:ValueProposition', testCategory: 'edge', name: 'Edge VP', cqRef: 'CQ-001' },
      { '@id': 'inst-8', '@type': 'vp:Problem', testCategory: 'edge', name: 'Edge Prob', cqRef: 'CQ-002' },
    ],
    boundaryTests: [
      { '@id': 'inst-9', '@type': 'vp:ValueProposition', testCategory: 'boundary', name: 'Boundary VP', cqRef: 'CQ-001' },
    ],
    errorScenarios: [
      { '@id': 'inst-10', '@type': 'vp:ValueProposition', testCategory: 'invalid', name: 'Error VP', expectedValidation: 'FAIL', cqRef: 'CQ-001' },
    ],
  },
};

// Ontology with invalid @type references in instance data
const ontologyWithBadTypes = {
  '@context': 'https://schema.org',
  '@id': 'test:bad-types',
  name: 'BadTypes',
  'oaa:schemaVersion': '7.0.0',
  entities: [
    { '@id': 'org:Team', '@type': 'Class', name: 'Team', description: 'A team' },
  ],
  testInstances: {
    happyPath: [
      { '@id': 'inst-1', '@type': 'org:Team', testCategory: 'happy-path', name: 'Valid team' },
      { '@id': 'inst-2', '@type': 'org:NonExistent', testCategory: 'happy-path', name: 'Invalid type' },
      { '@id': 'inst-3', '@type': 'xyz:Unknown', testCategory: 'happy-path', name: 'Unknown prefix' },
    ],
  },
};

// Ontology with no test data (should warn, not fail)
const ontologyNoTestData = {
  '@context': 'https://schema.org',
  '@id': 'test:no-data',
  name: 'NoTestData',
  'oaa:schemaVersion': '7.0.0',
  entities: [
    { '@id': 'pe:Process', '@type': 'Class', name: 'Process', description: 'A process' },
  ],
};

// Ontology with skewed distribution (all happy-path)
const ontologySkewedDistribution = {
  '@context': 'https://schema.org',
  '@id': 'test:skewed',
  name: 'Skewed',
  'oaa:schemaVersion': '7.0.0',
  entities: [
    { '@id': 'pe:Process', '@type': 'Class', name: 'Process', description: 'A process' },
  ],
  testInstances: {
    happyPath: [
      { '@id': 'inst-1', '@type': 'pe:Process', testCategory: 'happy-path', name: 'P1' },
      { '@id': 'inst-2', '@type': 'pe:Process', testCategory: 'happy-path', name: 'P2' },
      { '@id': 'inst-3', '@type': 'pe:Process', testCategory: 'happy-path', name: 'P3' },
      { '@id': 'inst-4', '@type': 'pe:Process', testCategory: 'happy-path', name: 'P4' },
      { '@id': 'inst-5', '@type': 'pe:Process', testCategory: 'happy-path', name: 'P5' },
      { '@id': 'inst-6', '@type': 'pe:Process', testCategory: 'happy-path', name: 'P6' },
      { '@id': 'inst-7', '@type': 'pe:Process', testCategory: 'happy-path', name: 'P7' },
      { '@id': 'inst-8', '@type': 'pe:Process', testCategory: 'happy-path', name: 'P8' },
      { '@id': 'inst-9', '@type': 'pe:Process', testCategory: 'happy-path', name: 'P9' },
      { '@id': 'inst-10', '@type': 'pe:Process', testCategory: 'happy-path', name: 'P10' },
    ],
  },
};

// Ontology with CQs but no test data linked to them
const ontologyWithUnlinkedCQs = {
  '@context': 'https://schema.org',
  '@id': 'test:unlinked-cqs',
  name: 'UnlinkedCQs',
  'oaa:schemaVersion': '7.0.0',
  entities: [
    { '@id': 'vp:VP', '@type': 'Class', name: 'VP', description: 'Value prop' },
    { '@id': 'vp:ICP', '@type': 'Class', name: 'ICP', description: 'Ideal customer' },
  ],
  competencyQuestions: [
    { '@id': 'CQ-001', question: 'What is VP?', targetEntities: ['vp:VP'], targetRelationships: [], targetRules: [] },
    { '@id': 'CQ-002', question: 'What is ICP?', targetEntities: ['vp:ICP'], targetRelationships: [], targetRules: [] },
  ],
  testInstances: {
    happyPath: [
      { '@id': 'inst-1', '@type': 'vp:VP', testCategory: 'happy-path', name: 'VP Instance', cqRef: 'CQ-001' },
      // No instance linked to CQ-002
    ],
  },
};

// Ontology with flat testData format (sample-test-data.json style)
const ontologyWithFlatTestData = {
  '@context': 'https://schema.org',
  '@id': 'test:flat-format',
  name: 'FlatFormat',
  'oaa:schemaVersion': '7.0.0',
  entities: [
    { '@id': 'org:Department', '@type': 'Class', name: 'Department', description: 'A department' },
    { '@id': 'org:Employee', '@type': 'Class', name: 'Employee', description: 'An employee' },
  ],
  testData: {
    Department: [
      { id: 'DEP-001', name: 'Engineering', testCategory: 'typical' },
      { id: 'DEP-002', name: 'Marketing', testCategory: 'typical' },
    ],
    Employee: [
      { id: 'EMP-001', name: 'Alice', testCategory: 'typical' },
      { id: 'EMP-002', name: '', testCategory: 'edge' },
    ],
    NonExistent: [
      { id: 'NE-001', name: 'Ghost', testCategory: 'typical' },
    ],
  },
};

// ── Tests ──

describe('G24: Instance Data Quality', () => {

  // S21.18.4: Basic gate integration
  describe('gate metadata', () => {
    it('returns correct gate name', () => {
      const result = validateG24InstanceDataQuality(ontologyWithValidInstances);
      expect(result.gate).toBe('G24: Instance Data Quality');
    });

    it('is advisory — never blocks compliance', () => {
      const result = validateG24InstanceDataQuality(ontologyWithBadTypes);
      expect(result.advisory).toBe(true);
    });

    it('skips for v6.x ontologies', () => {
      const result = validateG24InstanceDataQuality(v6Ontology);
      expect(result.skipped).toBe(true);
      expect(result.status).toBe('pass');
    });
  });

  // S21.18.1: Schema-conformance
  describe('schema conformance', () => {
    it('passes when all instance @types resolve to declared entities', () => {
      const result = validateG24InstanceDataQuality(ontologyWithValidInstances);
      expect(result.status).toBe('pass');
      expect(result.issues).toHaveLength(0);
    });

    it('warns when no test data exists', () => {
      const result = validateG24InstanceDataQuality(ontologyNoTestData);
      expect(result.status).toBe('warn');
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain('No instance/test data');
    });

    it('warns when instance @type does not match a declared entity', () => {
      const result = validateG24InstanceDataQuality(ontologyWithBadTypes);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some(w => w.includes('org:NonExistent'))).toBe(true);
    });

    it('handles flat testData format (entity-keyed)', () => {
      const result = validateG24InstanceDataQuality(ontologyWithFlatTestData);
      expect(result.gate).toBe('G24: Instance Data Quality');
      // NonExistent key should trigger a warning
      expect(result.warnings.some(w => w.includes('NonExistent'))).toBe(true);
    });
  });

  // S21.18.2: Distribution analysis
  describe('test data distribution', () => {
    it('returns distribution metrics', () => {
      const result = validateG24InstanceDataQuality(ontologyWithValidInstances);
      expect(result.metrics).toBeDefined();
      expect(result.metrics.totalInstances).toBeGreaterThan(0);
      expect(result.metrics.distribution).toBeDefined();
    });

    it('warns when distribution deviates >10% from 60-20-10-10 target', () => {
      const result = validateG24InstanceDataQuality(ontologySkewedDistribution);
      expect(result.warnings.some(w => w.includes('distribution'))).toBe(true);
    });

    it('includes happy-path, edge, boundary, error counts', () => {
      const result = validateG24InstanceDataQuality(ontologyWithValidInstances);
      const dist = result.metrics.distribution;
      expect(dist).toHaveProperty('happyPath');
      expect(dist).toHaveProperty('edge');
      expect(dist).toHaveProperty('boundary');
      expect(dist).toHaveProperty('error');
    });
  });

  // S21.18.3: CQ-to-test-data linkage
  describe('CQ linkage', () => {
    it('reports CQ coverage when all CQs have linked test instances', () => {
      const result = validateG24InstanceDataQuality(ontologyWithValidInstances);
      expect(result.metrics.cqCoverage).toBeDefined();
      expect(result.metrics.cqCoverage).toBe(100);
    });

    it('warns when a CQ has no linked test instances', () => {
      const result = validateG24InstanceDataQuality(ontologyWithUnlinkedCQs);
      expect(result.warnings.some(w => w.includes('CQ-002'))).toBe(true);
    });

    it('reports uncovered CQ count in metrics', () => {
      const result = validateG24InstanceDataQuality(ontologyWithUnlinkedCQs);
      expect(result.metrics.uncoveredCQs).toBeGreaterThan(0);
    });
  });
});
