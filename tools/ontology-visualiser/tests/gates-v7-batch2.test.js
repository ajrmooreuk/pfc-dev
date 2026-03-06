/**
 * TDD tests for OAA v7 Quality Gates: G22 (Cross-Ontology Rule Enforcement),
 * G23 (Lineage Chain Integrity).
 * Written BEFORE implementation per F21.14 TDD policy.
 */

import { describe, it, expect, vi } from 'vitest';

vi.mock('../js/state.js', () => ({
  state: {},
  OAA_REQUIRED_ENTITY_PROPS: ['@id', '@type', 'name', 'description'],
  OAA_REQUIRED_REL_PROPS: ['@type', 'name'],
}));

import {
  validateG22CrossOntologyRules,
  validateG23LineageChainIntegrity,
} from '../js/audit-engine.js';

// ── Fixtures ──

const KNOWN_PREFIXES = ['vsom', 'okr', 'vp', 'pmf', 'efs', 'rrr', 'kpi', 'ppm', 'pe', 'org', 'org-ctx', 'ga', 'mat', 'grc', 'erm', 'mcsb', 'caf', 'dspt', 'gdpr', 'pii', 'emc', 'ds', 'ea', 'ctx', 'cicd', 'crt', 'bsc', 'ind', 'rsn', 'mac', 'pfl', 'nar', 'csc', 'cul', 'viz'];
const DEPRECATED_PREFIXES = ['cl', 'ca', 'rcsg-fw'];

const ontologyWithValidXrefs = {
  '@context': 'https://schema.org',
  '@id': 'test:valid-xref',
  name: 'ValidXref',
  'oaa:schemaVersion': '7.0.0',
  entities: [
    { '@id': 'vp:Problem', '@type': 'Class', name: 'Problem', description: 'A customer problem' },
    { '@id': 'vp:Solution', '@type': 'Class', name: 'Solution', description: 'A proposed solution' },
  ],
  relationships: [
    {
      '@type': 'Relationship', name: 'mapsToRisk',
      domainIncludes: ['vp:Problem'], rangeIncludes: ['rrr:Risk'],
      'oaa:crossOntologyRef': 'RRR-ONT'
    },
    {
      '@type': 'Relationship', name: 'internalRel',
      domainIncludes: ['vp:Problem'], rangeIncludes: ['vp:Solution']
    },
  ],
};

const ontologyWithInvalidPrefix = {
  '@context': 'https://schema.org',
  '@id': 'test:bad-prefix',
  name: 'BadPrefix',
  'oaa:schemaVersion': '7.0.0',
  entities: [
    { '@id': 'vp:Alpha', '@type': 'Class', name: 'Alpha', description: 'Entity one' },
  ],
  relationships: [
    {
      '@type': 'Relationship', name: 'linksToUnknown',
      domainIncludes: ['vp:Alpha'], rangeIncludes: ['xyz:Unknown'],
      'oaa:crossOntologyRef': 'XYZ-ONT'
    },
  ],
};

const ontologyWithDeprecatedRef = {
  '@context': 'https://schema.org',
  '@id': 'test:deprecated-ref',
  name: 'DeprecatedRef',
  'oaa:schemaVersion': '7.0.0',
  entities: [
    { '@id': 'org-ctx:Context', '@type': 'Class', name: 'Context', description: 'Org context' },
  ],
  relationships: [
    {
      '@type': 'Relationship', name: 'linksToDeprecated',
      domainIncludes: ['org-ctx:Context'], rangeIncludes: ['cl:CompetitiveLandscape'],
      'oaa:crossOntologyRef': 'CL-ONT'
    },
  ],
};

const v6OntologyXref = {
  '@context': 'https://schema.org',
  '@id': 'test:v6-xref',
  'oaa:schemaVersion': '6.1.0',
  entities: [{ '@id': 'test:A', '@type': 'Class', name: 'A', description: 'Test' }],
  relationships: [],
};

// ── G22: Cross-Ontology Rule Enforcement ──

describe('G22: Cross-Ontology Rule Enforcement', () => {
  it('passes when all cross-refs use valid prefixes', () => {
    const result = validateG22CrossOntologyRules(ontologyWithValidXrefs, KNOWN_PREFIXES, DEPRECATED_PREFIXES);
    expect(result.gate).toBe('G22: Cross-Ontology Rule Enforcement');
    expect(result.status).toBe('pass');
    expect(result.issues).toHaveLength(0);
  });

  it('warns on unrecognised cross-ontology prefix', () => {
    const result = validateG22CrossOntologyRules(ontologyWithInvalidPrefix, KNOWN_PREFIXES, DEPRECATED_PREFIXES);
    expect(result.status).toBe('warn');
    expect(result.warnings.some(w => w.includes('xyz'))).toBe(true);
  });

  it('warns when referencing deprecated ontology', () => {
    const result = validateG22CrossOntologyRules(ontologyWithDeprecatedRef, KNOWN_PREFIXES, DEPRECATED_PREFIXES);
    expect(result.warnings.some(w => w.includes('deprecated') || w.includes('CL-ONT'))).toBe(true);
  });

  it('skips for v6.x ontologies', () => {
    const result = validateG22CrossOntologyRules(v6OntologyXref, KNOWN_PREFIXES, DEPRECATED_PREFIXES);
    expect(result.skipped).toBe(true);
  });

  it('counts total cross-refs in detail', () => {
    const result = validateG22CrossOntologyRules(ontologyWithValidXrefs, KNOWN_PREFIXES, DEPRECATED_PREFIXES);
    expect(result.detail).toMatch(/1 cross-ref/);
  });

  it('ignores internal relationships (no cross-ontology ref)', () => {
    const result = validateG22CrossOntologyRules(ontologyWithValidXrefs, KNOWN_PREFIXES, DEPRECATED_PREFIXES);
    // Only 1 cross-ref (mapsToRisk), not 2
    expect(result.metrics.totalCrossRefs).toBe(1);
  });
});

// ── G23: Lineage Chain Integrity ──

const VE_LINEAGE_CHAIN = ['VSOM-ONT', 'OKR-ONT', 'VP-ONT', 'PMF-ONT', 'EFS-ONT'];

const vsomOntologyWithOkrRef = {
  '@context': 'https://schema.org',
  '@id': 'vsom:Framework',
  name: 'VSOM-ONT',
  'oaa:schemaVersion': '7.0.0',
  'oaa:ontologyId': 'VSOM-ONT',
  entities: [
    { '@id': 'vsom:StrategicObjective', '@type': 'Class', name: 'StrategicObjective', description: 'A strategic objective' },
  ],
  relationships: [
    {
      '@type': 'Relationship', name: 'cascadesTo',
      domainIncludes: ['vsom:StrategicObjective'], rangeIncludes: ['okr:Objective'],
      'oaa:crossOntologyRef': 'OKR-ONT'
    },
  ],
};

const vsomOntologyMissingLink = {
  '@context': 'https://schema.org',
  '@id': 'vsom:Framework',
  name: 'VSOM-ONT',
  'oaa:schemaVersion': '7.0.0',
  'oaa:ontologyId': 'VSOM-ONT',
  entities: [
    { '@id': 'vsom:StrategicObjective', '@type': 'Class', name: 'StrategicObjective', description: 'A strategic objective' },
  ],
  relationships: [],
};

const nonLineageOntology = {
  '@context': 'https://schema.org',
  '@id': 'ds:DesignSystem',
  name: 'DS-ONT',
  'oaa:schemaVersion': '7.0.0',
  'oaa:ontologyId': 'DS-ONT',
  entities: [
    { '@id': 'ds:Token', '@type': 'Class', name: 'Token', description: 'A design token' },
  ],
  relationships: [],
};

const vpOntologyWithBothLinks = {
  '@context': 'https://schema.org',
  '@id': 'vp:ValueProp',
  name: 'VP-ONT',
  'oaa:schemaVersion': '7.0.0',
  'oaa:ontologyId': 'VP-ONT',
  entities: [
    { '@id': 'vp:ValueProposition', '@type': 'Class', name: 'ValueProposition', description: 'A value proposition' },
  ],
  relationships: [
    {
      '@type': 'Relationship', name: 'informedByOKR',
      domainIncludes: ['vp:ValueProposition'], rangeIncludes: ['okr:KeyResult'],
      'oaa:crossOntologyRef': 'OKR-ONT'
    },
    {
      '@type': 'Relationship', name: 'validatesMarket',
      domainIncludes: ['vp:ValueProposition'], rangeIncludes: ['pmf:ProductMarketFit'],
      'oaa:crossOntologyRef': 'PMF-ONT'
    },
  ],
};

describe('G23: Lineage Chain Integrity', () => {
  it('passes when lineage ontology has required downstream ref', () => {
    const result = validateG23LineageChainIntegrity(vsomOntologyWithOkrRef, VE_LINEAGE_CHAIN);
    expect(result.gate).toBe('G23: Lineage Chain Integrity');
    expect(result.status).toBe('pass');
  });

  it('warns when lineage ontology is missing downstream ref', () => {
    const result = validateG23LineageChainIntegrity(vsomOntologyMissingLink, VE_LINEAGE_CHAIN);
    expect(result.status).toBe('warn');
    expect(result.warnings.some(w => w.includes('OKR-ONT'))).toBe(true);
  });

  it('skips for non-lineage ontologies', () => {
    const result = validateG23LineageChainIntegrity(nonLineageOntology, VE_LINEAGE_CHAIN);
    expect(result.skipped).toBe(true);
  });

  it('validates both upstream and downstream links for mid-chain ontologies', () => {
    const result = validateG23LineageChainIntegrity(vpOntologyWithBothLinks, VE_LINEAGE_CHAIN);
    expect(result.status).toBe('pass');
    expect(result.metrics.upstreamLinked).toBe(true);
    expect(result.metrics.downstreamLinked).toBe(true);
  });

  it('skips for v6.x ontologies', () => {
    const v6 = { ...vsomOntologyMissingLink, 'oaa:schemaVersion': '6.1.0' };
    const result = validateG23LineageChainIntegrity(v6, VE_LINEAGE_CHAIN);
    expect(result.skipped).toBe(true);
  });

  it('reports chain position in detail', () => {
    const result = validateG23LineageChainIntegrity(vsomOntologyWithOkrRef, VE_LINEAGE_CHAIN);
    expect(result.detail).toMatch(/VSOM-ONT/);
    expect(result.detail).toMatch(/position 1/i);
  });
});
