/**
 * Validation tests for QVF-ONT v1.0.0 — Quantitative Value & Finance Ontology
 *
 * Story S67.1.5 | Feature F67.1 (#987) | Epic 67 (#986)
 *
 * Covers:
 *   - OAA v6.1.0 structural compliance
 *   - Entity / relationship integrity (8 entities, 14 relationships)
 *   - Business rule enforcement (12 rules, currency/discount/time/assumptions)
 *   - Cross-ontology reference resolution (KPI, OKR, VP, BSC, RRR)
 *   - Registry entry validation
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join, resolve } from 'path';

const ONT_DIR = resolve(
  __dirname,
  '../../../ONTOLOGIES/ontology-library/VE-Series/QVF-ONT'
);
const ONT_FILE = join(ONT_DIR, 'qvf-ontology-v1.0.0-oaa-v6.jsonld');
const REGISTRY_FILE = join(ONT_DIR, 'Entry-ONT-QVF-001.json');

function loadJSON(path) {
  return JSON.parse(readFileSync(path, 'utf-8'));
}

// ── Expected constants ─────────────────────────────────────────────────────

const EXPECTED_ENTITY_IDS = [
  'qvf:ValueModel',
  'qvf:CashFlow',
  'qvf:Assumption',
  'qvf:SensitivityScenario',
  'qvf:BreakEvenAnalysis',
  'qvf:EconomicCase',
  'qvf:ApprovalStatus',
  'qvf:CalculationProvenance',
];

const EXPECTED_RELATIONSHIP_IDS = [
  'qvf:hasCashFlows',
  'qvf:hasAssumptions',
  'qvf:hasScenarios',
  'qvf:hasBreakEven',
  'qvf:hasApprovalStatus',
  'qvf:hasProvenance',
  'qvf:containsModels',
  'qvf:supersededBy',
  'qvf:variantOf',
  'qvf:measuredBy',
  'qvf:quantifies',
  'qvf:feedsBSCObjective',
  'qvf:quantifiesBenefit',
  'qvf:hasEconomicCase',
];

const MANDATORY_BUSINESS_RULE_ID_CURRENCY = 'qvf:rule-currency-required';

const VE_SERIES_PREFIXES = ['kpi:', 'okr:', 'vp:', 'bsc:', 'rrr:', 'vsom:', 'pmf:'];

// ── File existence ─────────────────────────────────────────────────────────

describe('QVF-ONT — file existence', () => {
  it('ontology JSONLD file exists', () => {
    expect(existsSync(ONT_FILE), `Missing: ${ONT_FILE}`).toBe(true);
  });

  it('registry entry file exists', () => {
    expect(existsSync(REGISTRY_FILE), `Missing: ${REGISTRY_FILE}`).toBe(true);
  });

  it('both files parse as valid JSON', () => {
    expect(() => loadJSON(ONT_FILE)).not.toThrow();
    expect(() => loadJSON(REGISTRY_FILE)).not.toThrow();
  });
});

// ── OAA structural compliance ──────────────────────────────────────────────

describe('QVF-ONT — OAA structural compliance', () => {
  let ont;

  beforeAll(() => { ont = loadJSON(ONT_FILE); });

  it('has required JSON-LD identity fields', () => {
    expect(ont['@context']).toBeDefined();
    expect(ont['@type']).toBe('pf:Ontology');
    expect(ont['@id']).toBe('qvf:qvf-ontology');
  });

  it('has required descriptive fields', () => {
    expect(ont.name).toBeTruthy();
    expect(ont.description).toBeTruthy();
    expect(ont.version).toBe('1.0.0');
  });

  it('declares oaaVersion 6.1.0', () => {
    expect(ont.oaaVersion).toBe('6.1.0');
  });

  it('has non-empty hasDefinedTerm array', () => {
    expect(Array.isArray(ont.hasDefinedTerm)).toBe(true);
    expect(ont.hasDefinedTerm.length).toBeGreaterThan(0);
  });

  it('has non-empty relationships array', () => {
    expect(Array.isArray(ont.relationships)).toBe(true);
    expect(ont.relationships.length).toBeGreaterThan(0);
  });

  it('has non-empty businessRules array', () => {
    expect(Array.isArray(ont.businessRules)).toBe(true);
    expect(ont.businessRules.length).toBeGreaterThan(0);
  });

  it('has metadata block with domain and lineageChain', () => {
    expect(ont.metadata).toBeDefined();
    expect(ont.metadata.domain).toBeTruthy();
    expect(ont.metadata.lineageChain).toContain('QVF');
  });

  it('has pfCoreModule set to VE series', () => {
    expect(ont.pfCoreModule).toMatch(/^VE/);
  });
});

// ── Entity integrity ───────────────────────────────────────────────────────

describe('QVF-ONT — entity integrity', () => {
  let terms;

  beforeAll(() => { terms = loadJSON(ONT_FILE).hasDefinedTerm; });

  it('defines exactly 8 Tier-1 entities', () => {
    expect(terms).toHaveLength(8);
  });

  it('all expected entity @ids are present', () => {
    const ids = terms.map(t => t['@id']);
    for (const expected of EXPECTED_ENTITY_IDS) {
      expect(ids, `Missing entity: ${expected}`).toContain(expected);
    }
  });

  it('every entity has @id, name, and description', () => {
    for (const term of terms) {
      expect(term['@id'], 'entity missing @id').toBeTruthy();
      expect(term.name, `${term['@id']} missing name`).toBeTruthy();
      expect(term.description, `${term['@id']} missing description`).toBeTruthy();
    }
  });

  it('all entity @ids use the qvf: prefix', () => {
    for (const term of terms) {
      expect(term['@id'], `${term['@id']} should use qvf: prefix`).toMatch(/^qvf:/);
    }
  });

  it('no duplicate entity @ids', () => {
    const ids = terms.map(t => t['@id']);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('qvf:ValueModel is present (root entity)', () => {
    const vm = terms.find(t => t['@id'] === 'qvf:ValueModel');
    expect(vm).toBeDefined();
    expect(vm.name).toBeTruthy();
  });

  it('qvf:Assumption is present (audit trail entity)', () => {
    const assumption = terms.find(t => t['@id'] === 'qvf:Assumption');
    expect(assumption).toBeDefined();
  });

  it('qvf:CalculationProvenance is present (provenance entity)', () => {
    const prov = terms.find(t => t['@id'] === 'qvf:CalculationProvenance');
    expect(prov).toBeDefined();
  });
});

// ── Relationship integrity ─────────────────────────────────────────────────

describe('QVF-ONT — relationship integrity', () => {
  let rels;

  beforeAll(() => { rels = loadJSON(ONT_FILE).relationships; });

  it('defines exactly 14 relationships', () => {
    expect(rels).toHaveLength(14);
  });

  it('all expected relationship @ids are present', () => {
    const ids = rels.map(r => r['@id']);
    for (const expected of EXPECTED_RELATIONSHIP_IDS) {
      expect(ids, `Missing relationship: ${expected}`).toContain(expected);
    }
  });

  it('every relationship has @type, @id, name, domainIncludes, rangeIncludes', () => {
    for (const rel of rels) {
      expect(rel['@type'], `${rel['@id']} missing @type`).toBeTruthy();
      expect(rel['@id'], 'relationship missing @id').toBeTruthy();
      expect(rel.name, `${rel['@id']} missing name`).toBeTruthy();
      expect(rel.domainIncludes, `${rel['@id']} missing domainIncludes`).toBeTruthy();
      expect(rel.rangeIncludes, `${rel['@id']} missing rangeIncludes`).toBeTruthy();
    }
  });

  it('no duplicate relationship @ids', () => {
    const ids = rels.map(r => r['@id']);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('qvf:hasCashFlows links ValueModel → CashFlow', () => {
    const rel = rels.find(r => r['@id'] === 'qvf:hasCashFlows');
    expect(rel).toBeDefined();
    expect(rel.domainIncludes).toBe('qvf:ValueModel');
    expect(rel.rangeIncludes).toBe('qvf:CashFlow');
  });

  it('qvf:hasAssumptions links ValueModel → Assumption', () => {
    const rel = rels.find(r => r['@id'] === 'qvf:hasAssumptions');
    expect(rel).toBeDefined();
    expect(rel.domainIncludes).toBe('qvf:ValueModel');
    expect(rel.rangeIncludes).toBe('qvf:Assumption');
  });

  it('qvf:quantifiesBenefit cross-references vp:Benefit (VP-RRR convention)', () => {
    const rel = rels.find(r => r['@id'] === 'qvf:quantifiesBenefit');
    expect(rel).toBeDefined();
    expect(rel.rangeIncludes).toContain('vp:');
  });

  it('qvf:feedsBSCObjective cross-references bsc: ontology', () => {
    const rel = rels.find(r => r['@id'] === 'qvf:feedsBSCObjective');
    expect(rel).toBeDefined();
    expect(rel.rangeIncludes).toContain('bsc:');
  });

  it('qvf:measuredBy cross-references kpi: ontology', () => {
    const rel = rels.find(r => r['@id'] === 'qvf:measuredBy');
    expect(rel).toBeDefined();
    // domain or range should reference kpi:
    const kpiRef = [rel.domainIncludes, rel.rangeIncludes].join(' ');
    expect(kpiRef).toContain('kpi:');
  });
});

// ── Business rules ─────────────────────────────────────────────────────────

describe('QVF-ONT — business rules', () => {
  let rules;

  beforeAll(() => { rules = loadJSON(ONT_FILE).businessRules; });

  it('defines exactly 12 business rules', () => {
    expect(rules).toHaveLength(12);
  });

  it('every rule has @id, name, description, and condition', () => {
    for (const rule of rules) {
      expect(rule['@id'], 'rule missing @id').toBeTruthy();
      expect(rule.name, `${rule['@id']} missing name`).toBeTruthy();
      expect(rule.description, `${rule['@id']} missing description`).toBeTruthy();
      expect(rule.condition, `${rule['@id']} missing condition`).toBeTruthy();
    }
  });

  it('no duplicate rule @ids', () => {
    const ids = rules.map(r => r['@id']);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('currency-required rule exists (ISO 4217 enforcement)', () => {
    const rule = rules.find(r => r['@id'] === MANDATORY_BUSINESS_RULE_ID_CURRENCY);
    expect(rule, 'qvf:rule-currency-required must exist').toBeDefined();
    expect(rule.description).toMatch(/ISO 4217/i);
  });

  it('all rule @ids use the qvf: prefix', () => {
    for (const rule of rules) {
      expect(rule['@id']).toMatch(/^qvf:/);
    }
  });
});

// ── Cross-ontology references ──────────────────────────────────────────────

describe('QVF-ONT — cross-ontology references', () => {
  let xrefs;

  beforeAll(() => { xrefs = loadJSON(ONT_FILE).crossOntologyReferences; });

  it('crossOntologyReferences block exists', () => {
    expect(xrefs).toBeDefined();
    expect(typeof xrefs).toBe('object');
  });

  it('veSeries lists all required VE-Series prefixes', () => {
    const veSeries = xrefs.veSeries;
    expect(Array.isArray(veSeries)).toBe(true);
    for (const prefix of VE_SERIES_PREFIXES) {
      expect(veSeries, `Missing VE-Series prefix: ${prefix}`).toContain(prefix);
    }
  });

  it('has keyBridges array with at least 4 cross-ontology bridges', () => {
    const bridges = xrefs.keyBridges;
    expect(Array.isArray(bridges)).toBe(true);
    expect(bridges.length).toBeGreaterThanOrEqual(4);
  });

  it('KPI → QVF bridge is declared (measuredBy inverse)', () => {
    const bridge = xrefs.keyBridges.find(b => b.from === 'kpi:KPI' && b.to === 'qvf:ValueModel');
    expect(bridge, 'Missing KPI→QVF bridge').toBeDefined();
  });

  it('QVF → OKR bridge is declared (quantifies)', () => {
    const bridge = xrefs.keyBridges.find(
      b => b.from === 'qvf:ValueModel' && b.to?.startsWith('okr:')
    );
    expect(bridge, 'Missing QVF→OKR bridge').toBeDefined();
  });

  it('QVF → VP bridge is declared (quantifiesBenefit — VP-RRR convention)', () => {
    const bridge = xrefs.keyBridges.find(
      b => b.from === 'qvf:ValueModel' && b.to?.startsWith('vp:')
    );
    expect(bridge, 'Missing QVF→VP bridge').toBeDefined();
  });

  it('QVF → BSC bridge is declared (feedsBSCObjective)', () => {
    const bridge = xrefs.keyBridges.find(
      b => b.from === 'qvf:ValueModel' && b.to?.startsWith('bsc:')
    );
    expect(bridge, 'Missing QVF→BSC bridge').toBeDefined();
  });

  it('VP-RRR convention is declared in metadata', () => {
    const ont = loadJSON(ONT_FILE);
    const convention = ont.metadata?.vpRrrConvention || '';
    expect(convention).toContain('vp:');
    expect(convention).toContain('rrr:');
  });

  it('lineageChain positions QVF correctly in VE chain', () => {
    const ont = loadJSON(ONT_FILE);
    const chain = ont.metadata?.lineageChain || '';
    // QVF should come after KPI and before VP
    const kpiPos = chain.indexOf('KPI');
    const qvfPos = chain.indexOf('QVF');
    const vpPos = chain.indexOf('VP');
    expect(kpiPos).toBeGreaterThanOrEqual(0);
    expect(qvfPos).toBeGreaterThan(kpiPos);
    expect(vpPos).toBeGreaterThan(qvfPos);
  });
});

// ── Registry entry validation ──────────────────────────────────────────────

describe('QVF-ONT — registry entry', () => {
  let entry;

  beforeAll(() => { entry = loadJSON(REGISTRY_FILE); });

  it('registry entry has @context, @type, @id', () => {
    expect(entry['@context']).toBeDefined();
    expect(entry['@type']).toBeDefined();
    expect(entry['@id']).toBeDefined();
  });

  it('entryId is Entry-ONT-QVF-001', () => {
    const id = entry.entryId || entry['@id'];
    expect(id).toContain('QVF');
  });

  it('ontology version matches 1.0.0', () => {
    const version = entry.version || entry.ontologyVersion;
    expect(version).toBe('1.0.0');
  });

  it('is placed in the VE-Series directory path', () => {
    expect(REGISTRY_FILE).toContain('VE-Series');
  });

  it('filePath or sourceFile references the JSONLD ontology file', () => {
    const ref = JSON.stringify(entry);
    expect(ref).toContain('qvf-ontology');
  });
});
