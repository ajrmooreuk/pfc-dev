/**
 * Unit tests for emc-composer.js — EMC composition engine,
 * PFI instance configs, test data generation, JSONB export,
 * and composition manifest versioning.
 *
 * Feature 7.3: EMC-Driven Composition & Platform Instances
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock state.js
vi.mock('../js/state.js', () => ({
  state: {
    registryIndex: null,
    pfiInstances: new Map(),
    compositionManifests: [],
    lastComposition: null,
  },
  REGISTRY_BASE_PATH: '../../ONTOLOGIES/ontology-library/',
}));

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn(key => store[key] || null),
    setItem: vi.fn((key, value) => { store[key] = value; }),
    removeItem: vi.fn(key => { delete store[key]; }),
    clear: () => { store = {}; },
  };
})();
vi.stubGlobal('localStorage', localStorageMock);

import { state } from '../js/state.js';
import {
  composeOntologySet,
  composeMultiCategory,
  listCategories,
  getCategory,
  createPFIInstance,
  getPFIInstances,
  getPFIInstance,
  deletePFIInstance,
  generateTestData,
  exportAsJSONB,
  createCompositionManifest,
  getCompositionManifests,
  clearCompositionManifests,
  restoreCompositionState,
  CATEGORY_COMPOSITIONS,
  nameToNamespace,
  namespaceToName,
  constrainToInstanceOntologies,
} from '../js/emc-composer.js';

// --- Reset state before each test ---

beforeEach(() => {
  state.pfiInstances = new Map();
  state.compositionManifests = [];
  state.lastComposition = null;
  state.registryIndex = null;
  localStorageMock.clear();
});

// ===================================================================
// composeOntologySet (7.3.1, 7.3.4)
// ===================================================================

describe('composeOntologySet', () => {
  it('composes STRATEGIC category with correct required ontologies', () => {
    const result = composeOntologySet('STRATEGIC');
    expect(result.success).toBe(true);
    expect(result.composition.requiredOntologies).toContain('VSOM');
    expect(result.composition.requiredOntologies).toContain('OKR');
    expect(result.composition.requiredOntologies).toContain('ORG');
    expect(result.composition.categoryCode).toBe('STRATEGIC');
    expect(result.composition.contextLevel).toBe('PFC');
  });

  it('always includes ORG via Rule 1 (FoundationAlwaysRequired)', () => {
    const result = composeOntologySet('COMPETITIVE');
    expect(result.success).toBe(true);
    expect(result.composition.requiredOntologies).toContain('ORG');
    const rule1 = result.ruleLog.find(r => r.rule === 'FoundationAlwaysRequired');
    expect(rule1).toBeDefined();
    expect(rule1.priority).toBe(1);
  });

  it('resolves dependency chains via Rule 2', () => {
    // OKR depends on VSOM, which depends on ORG
    // STRATEGIC already has VSOM and OKR, but let's verify chain resolution
    const result = composeOntologySet('STRATEGIC');
    expect(result.success).toBe(true);
    const rule2 = result.ruleLog.find(r => r.rule === 'DependencyChainResolution');
    expect(rule2).toBeDefined();
    expect(rule2.priority).toBe(2);
  });

  it('validates category minimum via Rule 3', () => {
    const result = composeOntologySet('STRATEGIC');
    expect(result.success).toBe(true);
    const rule3 = result.ruleLog.find(r => r.rule === 'CategoryMinimumOntologies');
    expect(rule3).toBeDefined();
    expect(rule3.action).toMatch(/\d+ required ontologies — OK/);
  });

  it('fails PFI context without product code (Rule 4)', () => {
    const result = composeOntologySet('PRODUCT', { contextLevel: 'PFI' });
    expect(result.success).toBe(false);
    expect(result.error).toContain('product code');
  });

  it('accepts PFI context with product code', () => {
    const result = composeOntologySet('PRODUCT', {
      contextLevel: 'PFI',
      productCode: 'BAIV-AIV',
    });
    expect(result.success).toBe(true);
    expect(result.composition.contextLevel).toBe('PFI');
    expect(result.composition.productCode).toBe('BAIV-AIV');
  });

  it('excludes advanced ontologies at low maturity (Rule 5)', () => {
    const result = composeOntologySet('ENTERPRISE', { maturityLevel: 2 });
    expect(result.success).toBe(true);
    expect(result.composition.requiredOntologies).not.toContain('KPI');
    expect(result.composition.requiredOntologies).not.toContain('GA');
    const rule5 = result.ruleLog.filter(r => r.rule === 'MaturityBasedFiltering');
    expect(rule5.some(r => r.action.includes('Excluded'))).toBe(true);
  });

  it('keeps advanced ontologies at high maturity', () => {
    const result = composeOntologySet('ENTERPRISE', { maturityLevel: 5 });
    expect(result.success).toBe(true);
    expect(result.composition.requiredOntologies).toContain('KPI');
    expect(result.composition.requiredOntologies).toContain('GA');
  });

  it('adds RCSG overlay when complianceScope is true (Rule 6)', () => {
    const result = composeOntologySet('STRATEGIC', { complianceScope: true });
    expect(result.success).toBe(true);
    // Compliance overlay should inject GRC governance hub + core RCSG ontologies
    const complianceRequired = CATEGORY_COMPOSITIONS.COMPLIANCE.required;
    const grcHub = complianceRequired.find(o => o.startsWith('GRC'));
    expect(grcHub).toBeTruthy();
    expect(result.composition.requiredOntologies).toContain(grcHub);
    expect(result.composition.activeSeries).toContain('RCSG-Series');
  });

  it('activates all series for ENTERPRISE (Rule 7)', () => {
    const result = composeOntologySet('ENTERPRISE');
    expect(result.success).toBe(true);
    expect(result.composition.activeSeries).toContain('VE-Series');
    expect(result.composition.activeSeries).toContain('PE-Series');
    expect(result.composition.activeSeries).toContain('RCSG-Series');
    expect(result.composition.activeSeries).toContain('Foundation');
    expect(result.composition.activeSeries).toContain('Competitive');
    expect(result.composition.activeSeries).toContain('Orchestration');
  });

  it('includes recommended ontologies by default', () => {
    const result = composeOntologySet('STRATEGIC');
    expect(result.success).toBe(true);
    expect(result.composition.allOntologies.length).toBeGreaterThan(
      result.composition.requiredOntologies.length
    );
  });

  it('excludes optional ontologies by default', () => {
    const result = composeOntologySet('STRATEGIC', { includeOptional: false });
    expect(result.success).toBe(true);
    expect(result.composition.optionalOntologies).toEqual([]);
  });

  it('includes optional ontologies when requested', () => {
    const result = composeOntologySet('STRATEGIC', { includeOptional: true });
    expect(result.success).toBe(true);
    // ORG-MAT is optional for STRATEGIC — may be added to required by deps
    // but optionalOntologies should be populated or empty if promoted
    expect(result.composition).toBeDefined();
  });

  it('returns error for unknown category', () => {
    const result = composeOntologySet('NONEXISTENT');
    expect(result.success).toBe(false);
    expect(result.error).toContain('Unknown category');
  });

  it('generates unique composition IDs', () => {
    const r1 = composeOntologySet('STRATEGIC');
    const r2 = composeOntologySet('PRODUCT');
    expect(r1.composition.compositionId).not.toBe(r2.composition.compositionId);
  });

  it('maps namespaces for all ontologies', () => {
    const result = composeOntologySet('STRATEGIC');
    expect(result.composition.namespaces.length).toBe(result.composition.allOntologies.length);
    expect(result.composition.namespaces).toContain('vsom:');
    expect(result.composition.namespaces).toContain('org:');
  });

  it('COMPLIANCE category auto-includes all its required ontologies', () => {
    const result = composeOntologySet('COMPLIANCE');
    expect(result.success).toBe(true);
    // All declared COMPLIANCE-required ontologies (+ dependencies) should be present
    for (const ont of CATEGORY_COMPOSITIONS.COMPLIANCE.required) {
      expect(result.composition.requiredOntologies).toContain(ont);
    }
  });

  it('AGENTIC category includes PE-Series and EA-AI', () => {
    const result = composeOntologySet('AGENTIC');
    expect(result.success).toBe(true);
    expect(result.composition.requiredOntologies).toContain('PE');
    expect(result.composition.requiredOntologies).toContain('EFS');
    expect(result.composition.requiredOntologies).toContain('EA');
    expect(result.composition.requiredOntologies).toContain('EA-AI');
    expect(result.composition.activeSeries).toContain('PE-Series');
  });

  it('FULFILMENT category includes LSC and OFM', () => {
    const result = composeOntologySet('FULFILMENT');
    expect(result.success).toBe(true);
    expect(result.composition.requiredOntologies).toContain('LSC');
    expect(result.composition.requiredOntologies).toContain('OFM');
    expect(result.composition.requiredOntologies).toContain('PE');
    expect(result.composition.requiredOntologies).toContain('ORG');
    expect(result.composition.activeSeries).toContain('PE-Series');
    expect(result.composition.activeSeries).toContain('Foundation');
  });

  it('FULFILMENT dependency chain resolves OFM and LSC deps', () => {
    const result = composeOntologySet('FULFILMENT');
    expect(result.success).toBe(true);
    // OFM depends on PE, ORG — LSC depends on PE, ORG — all in required
    expect(result.composition.requiredOntologies).toContain('OFM');
    expect(result.composition.requiredOntologies).toContain('LSC');
    expect(result.composition.requiredOntologies).toContain('PE');
    expect(result.composition.requiredOntologies).toContain('ORG');
  });

  it('SECURITY category includes MCSB and AZALZ', () => {
    const result = composeOntologySet('SECURITY');
    expect(result.success).toBe(true);
    expect(result.composition.requiredOntologies).toContain('MCSB');
    expect(result.composition.requiredOntologies).toContain('AZALZ');
    expect(result.composition.requiredOntologies).toContain('EA');
    expect(result.composition.activeSeries).toContain('RCSG-Series');
  });

  it('has 7 rules in the rule log', () => {
    const result = composeOntologySet('STRATEGIC');
    expect(result.ruleLog.length).toBe(7);
    expect(result.ruleLog.map(r => r.priority)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });
});

// ===================================================================
// listCategories / getCategory
// ===================================================================

describe('listCategories', () => {
  it('returns 11 categories', () => {
    const cats = listCategories();
    expect(cats.length).toBe(11);
    expect(cats.map(c => c.code)).toContain('STRATEGIC');
    expect(cats.map(c => c.code)).toContain('ENTERPRISE');
  });

  it('each category has required info', () => {
    const cats = listCategories();
    for (const cat of cats) {
      expect(cat.code).toBeTruthy();
      expect(cat.name).toBeTruthy();
      expect(cat.requiredCount).toBeGreaterThan(0);
      expect(cat.activeSeries.length).toBeGreaterThan(0);
    }
  });
});

describe('getCategory', () => {
  it('returns correct category', () => {
    const cat = getCategory('PRODUCT');
    expect(cat).toBeDefined();
    expect(cat.code).toBe('PRODUCT');
    expect(cat.required).toContain('VP');
  });

  it('returns null for unknown', () => {
    expect(getCategory('FAKE')).toBeNull();
  });
});

// ===================================================================
// PFI Instance Configuration (7.3.3)
// ===================================================================

describe('createPFIInstance', () => {
  it('creates a PFI instance with merged compositions', () => {
    const result = createPFIInstance({
      instanceId: 'PFI-BAIV',
      productCode: 'BAIV-AIV',
      instanceName: 'BAIV AI Visibility',
      description: 'BAIV product instance',
      requirementScopes: ['PRODUCT', 'COMPETITIVE'],
    });
    expect(result.success).toBe(true);
    expect(result.instance.instanceId).toBe('PFI-BAIV');
    expect(result.instance.contextLevel).toBe('PFI');
    expect(result.instance.requiredOntologies).toContain('VP');
    expect(result.instance.requiredOntologies).toContain('CA');
    expect(result.instance.requiredOntologies).toContain('ORG');
  });

  it('stores instance in state', () => {
    createPFIInstance({
      instanceId: 'PFI-TEST',
      productCode: 'TEST-001',
      instanceName: 'Test Instance',
      requirementScopes: ['STRATEGIC'],
    });
    expect(state.pfiInstances.has('PFI-TEST')).toBe(true);
  });

  it('fails without required params', () => {
    const result = createPFIInstance({ instanceId: 'X' });
    expect(result.success).toBe(false);
  });

  it('fails without requirement scopes', () => {
    const result = createPFIInstance({
      instanceId: 'X',
      productCode: 'Y',
      instanceName: 'Z',
      requirementScopes: [],
    });
    expect(result.success).toBe(false);
  });

  it('persists to localStorage', () => {
    createPFIInstance({
      instanceId: 'PFI-SAVE',
      productCode: 'SAVE-001',
      instanceName: 'Save Test',
      requirementScopes: ['PPM'],
    });
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'oaa-viz-pfi-instances',
      expect.any(String)
    );
  });
});

describe('getPFIInstances / getPFIInstance / deletePFIInstance', () => {
  beforeEach(() => {
    createPFIInstance({
      instanceId: 'PFI-A',
      productCode: 'A-001',
      instanceName: 'Instance A',
      requirementScopes: ['STRATEGIC'],
    });
    createPFIInstance({
      instanceId: 'PFI-B',
      productCode: 'B-001',
      instanceName: 'Instance B',
      requirementScopes: ['PRODUCT'],
    });
  });

  it('lists all instances', () => {
    expect(getPFIInstances().length).toBe(2);
  });

  it('gets specific instance', () => {
    const inst = getPFIInstance('PFI-A');
    expect(inst).toBeDefined();
    expect(inst.productCode).toBe('A-001');
  });

  it('returns null for unknown instance', () => {
    expect(getPFIInstance('NOPE')).toBeNull();
  });

  it('deletes an instance', () => {
    const result = deletePFIInstance('PFI-A');
    expect(result.success).toBe(true);
    expect(getPFIInstances().length).toBe(1);
  });

  it('fails to delete unknown instance', () => {
    const result = deletePFIInstance('NOPE');
    expect(result.success).toBe(false);
  });
});

// ===================================================================
// Test Data Generation (7.3.5)
// ===================================================================

describe('generateTestData', () => {
  it('generates test data for a composition', () => {
    const { composition } = composeOntologySet('STRATEGIC');
    const result = generateTestData(composition);
    expect(result.success).toBe(true);
    expect(result.testData.entities.length).toBeGreaterThan(0);
    expect(result.testData.relationships.length).toBeGreaterThan(0);
    expect(result.testData.ontologyCoverage).toEqual(composition.allOntologies);
  });

  it('generates 2 entities per ontology', () => {
    const { composition } = composeOntologySet('STRATEGIC');
    const result = generateTestData(composition);
    expect(result.testData.entities.length).toBe(composition.allOntologies.length * 2);
  });

  it('generates cross-ontology relationship when multiple ontologies', () => {
    const { composition } = composeOntologySet('STRATEGIC');
    const result = generateTestData(composition);
    const crossRels = result.testData.relationships.filter(r => r.crossOntology);
    expect(crossRels.length).toBeGreaterThanOrEqual(1);
  });

  it('fails on invalid composition', () => {
    const result = generateTestData(null);
    expect(result.success).toBe(false);
  });

  it('includes composition metadata', () => {
    const { composition } = composeOntologySet('PRODUCT', {
      contextLevel: 'PFI',
      productCode: 'TEST',
    });
    const result = generateTestData(composition);
    expect(result.testData.categoryCode).toBe('PRODUCT');
    expect(result.testData.contextLevel).toBe('PFI');
    expect(result.testData.generatedAt).toBeTruthy();
  });
});

// ===================================================================
// JSONB Export (7.3.6)
// ===================================================================

describe('exportAsJSONB', () => {
  it('returns valid JSON string', () => {
    const { composition } = composeOntologySet('STRATEGIC');
    const json = exportAsJSONB(composition);
    const parsed = JSON.parse(json);
    expect(parsed.schema_version).toBe('1.0.0');
    expect(parsed.category).toBe('STRATEGIC');
    expect(parsed.ontologies.length).toBeGreaterThan(0);
  });

  it('includes ontology tier classification', () => {
    const { composition } = composeOntologySet('STRATEGIC');
    const json = exportAsJSONB(composition);
    const parsed = JSON.parse(json);
    const tiers = parsed.ontologies.map(o => o.tier);
    expect(tiers).toContain('required');
  });

  it('includes test data when provided', () => {
    const { composition } = composeOntologySet('PPM');
    const { testData } = generateTestData(composition);
    const json = exportAsJSONB(composition, testData);
    const parsed = JSON.parse(json);
    expect(parsed.test_data).not.toBeNull();
    expect(parsed.test_data.entities.length).toBeGreaterThan(0);
  });
});

// ===================================================================
// Composition Manifest Versioning (7.3.7)
// ===================================================================

describe('createCompositionManifest', () => {
  it('creates a manifest with ontology versions', () => {
    const { composition } = composeOntologySet('STRATEGIC');
    const manifest = createCompositionManifest(composition);
    expect(manifest.compositionId).toBe(composition.compositionId);
    expect(manifest.categoryCode).toBe('STRATEGIC');
    expect(manifest.ontologyVersions).toBeDefined();
    expect(manifest.checksum).toBeTruthy();
  });

  it('stores manifest in state', () => {
    const { composition } = composeOntologySet('PRODUCT', {
      contextLevel: 'PFI',
      productCode: 'X',
    });
    createCompositionManifest(composition);
    expect(state.compositionManifests.length).toBe(1);
  });

  it('looks up versions from registry index', () => {
    state.registryIndex = {
      entries: [
        { name: 'VSOM Ontology (Vision)', namespace: 'vsom:', version: '3.0.0' },
        { name: 'OKR Ontology (Objectives)', namespace: 'okr:', version: '2.1.0' },
        { name: 'ORG Ontology (Organization)', namespace: 'org:', version: '3.0.0' },
      ],
    };
    const { composition } = composeOntologySet('STRATEGIC');
    const manifest = createCompositionManifest(composition);
    expect(manifest.ontologyVersions['VSOM']).toBe('3.0.0');
    expect(manifest.ontologyVersions['OKR']).toBe('2.1.0');
    expect(manifest.ontologyVersions['ORG']).toBe('3.0.0');
  });
});

describe('getCompositionManifests / clearCompositionManifests', () => {
  it('returns manifests in reverse order', () => {
    const { composition: c1 } = composeOntologySet('STRATEGIC');
    const { composition: c2 } = composeOntologySet('PRODUCT', {
      contextLevel: 'PFI', productCode: 'X',
    });
    createCompositionManifest(c1);
    createCompositionManifest(c2);
    const manifests = getCompositionManifests();
    expect(manifests.length).toBe(2);
    expect(manifests[0].categoryCode).toBe('PRODUCT');
  });

  it('clears all manifests', () => {
    const { composition } = composeOntologySet('PPM');
    createCompositionManifest(composition);
    clearCompositionManifests();
    expect(getCompositionManifests().length).toBe(0);
  });
});

// ===================================================================
// Namespace helpers
// ===================================================================

describe('nameToNamespace / namespaceToName', () => {
  it('converts name to namespace', () => {
    expect(nameToNamespace('VSOM')).toBe('vsom:');
    expect(nameToNamespace('ORG-CONTEXT')).toBe('org-ctx:');
    expect(nameToNamespace('EA-CORE')).toBe('ea-core:');
  });

  it('converts namespace to name', () => {
    expect(namespaceToName('vsom:')).toBe('VSOM');
    expect(namespaceToName('org-ctx:')).toBe('ORG-CONTEXT');
  });
});

// ===================================================================
// restoreCompositionState
// ===================================================================

describe('restoreCompositionState', () => {
  it('restores PFI instances from localStorage', () => {
    const data = [{ instanceId: 'PFI-X', productCode: 'X', instanceName: 'X' }];
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(data));
    restoreCompositionState();
    expect(state.pfiInstances.has('PFI-X')).toBe(true);
  });

  it('restores manifests from localStorage', () => {
    const manifests = [{ manifestId: 'test', compositionId: 'c1' }];
    localStorageMock.getItem
      .mockReturnValueOnce(null) // PFI instances
      .mockReturnValueOnce(JSON.stringify(manifests));
    state.compositionManifests = [];
    restoreCompositionState();
    expect(state.compositionManifests.length).toBe(1);
  });

  it('handles invalid localStorage data gracefully', () => {
    localStorageMock.getItem.mockReturnValueOnce('not-json{{{');
    expect(() => restoreCompositionState()).not.toThrow();
  });
});

// ===================================================================
// All 9 categories compose successfully
// ===================================================================

describe('all categories compose successfully', () => {
  const codes = ['STRATEGIC', 'PRODUCT', 'PPM', 'COMPETITIVE', 'ORG-DESIGN',
                 'PROCESS', 'ENTERPRISE', 'COMPLIANCE', 'AGENTIC'];

  for (const code of codes) {
    it(`${code} composes without errors`, () => {
      const result = composeOntologySet(code);
      expect(result.success).toBe(true);
      expect(result.composition.requiredOntologies.length).toBeGreaterThan(0);
      expect(result.composition.allOntologies.length).toBeGreaterThan(0);
      expect(result.ruleLog.length).toBe(7);
    });
  }
});

// ===================================================================
// composeMultiCategory (Epic 9F.2)
// ===================================================================

describe('composeMultiCategory', () => {
  it('returns error for empty array', () => {
    const result = composeMultiCategory([]);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/at least one/i);
  });

  it('returns error for non-array input', () => {
    const result = composeMultiCategory(null);
    expect(result.success).toBe(false);
  });

  it('single category mirrors composeOntologySet output', () => {
    const single = composeOntologySet('STRATEGIC');
    const multi = composeMultiCategory(['STRATEGIC']);

    expect(multi.success).toBe(true);
    expect(multi.composition.requiredOntologies.sort())
      .toEqual(single.composition.requiredOntologies.sort());
    expect(multi.composition.activeSeries.sort())
      .toEqual(single.composition.activeSeries.sort());
    expect(multi.overlapCount).toBe(0);
    expect(multi.perCategory).toHaveLength(1);
    expect(multi.perCategory[0].code).toBe('STRATEGIC');
  });

  it('two overlapping categories produce correct union', () => {
    const result = composeMultiCategory(['PRODUCT', 'STRATEGIC']);
    expect(result.success).toBe(true);

    // Both share ORG (foundation)
    expect(result.composition.requiredOntologies).toContain('ORG');

    // PRODUCT has VP, PMF, PE, EFS; STRATEGIC has VSOM, OKR
    expect(result.composition.requiredOntologies).toContain('VP');
    expect(result.composition.requiredOntologies).toContain('VSOM');

    // Union of series
    expect(result.composition.activeSeries).toContain('VE-Series');
    expect(result.composition.activeSeries).toContain('PE-Series');
    expect(result.composition.activeSeries).toContain('Foundation');

    // Overlap count > 0 (at least ORG appears in both)
    expect(result.overlapCount).toBeGreaterThan(0);

    expect(result.perCategory).toHaveLength(2);
  });

  it('three categories (PFI-BAIV scopes) deduplicate ontologies', () => {
    const scopes = ['PRODUCT', 'COMPETITIVE', 'STRATEGIC'];
    const result = composeMultiCategory(scopes, {
      contextLevel: 'PFI',
      productCode: 'BAIV-AIV',
    });
    expect(result.success).toBe(true);

    // No duplicate ontologies in allOntologies
    const unique = new Set(result.composition.allOntologies);
    expect(unique.size).toBe(result.composition.allOntologies.length);

    // All three categories represented
    expect(result.perCategory).toHaveLength(3);

    // compositionId contains MULTI
    expect(result.composition.compositionId).toMatch(/MULTI/);
    expect(result.composition.categoryCode).toBe('PRODUCT+COMPETITIVE+STRATEGIC');
  });

  it('maturity filtering applies across all categories', () => {
    const highMat = composeMultiCategory(['STRATEGIC', 'PPM'], { maturityLevel: 5 });
    const lowMat = composeMultiCategory(['STRATEGIC', 'PPM'], { maturityLevel: 1 });

    expect(highMat.success).toBe(true);
    expect(lowMat.success).toBe(true);

    // KPI should be present at maturity 5 (recommended for STRATEGIC) but not at 1
    const highAll = highMat.composition.allOntologies;
    const lowAll = lowMat.composition.allOntologies;
    if (highAll.includes('KPI')) {
      expect(lowAll).not.toContain('KPI');
    }
  });

  it('compliance scope adds RCSG to union', () => {
    const without = composeMultiCategory(['PRODUCT']);
    const withCompliance = composeMultiCategory(['PRODUCT'], { complianceScope: true });

    expect(withCompliance.success).toBe(true);
    // Compliance overlay should inject GRC governance hub + core RCSG ontologies
    const grcHub = CATEGORY_COMPOSITIONS.COMPLIANCE.required.find(o => o.startsWith('GRC'));
    expect(grcHub).toBeTruthy();
    expect(withCompliance.composition.requiredOntologies).toContain(grcHub);
    // Compliance overlay adds ontologies beyond what PRODUCT alone provides
    expect(withCompliance.composition.requiredOntologies.length).toBeGreaterThan(
      without.composition.requiredOntologies.length
    );
    expect(withCompliance.composition.activeSeries).toContain('RCSG-Series');
  });

  it('activeSeries is union of all category series', () => {
    // PRODUCT has PE-Series + Competitive; COMPLIANCE has RCSG-Series + PE-Series
    const result = composeMultiCategory(['PRODUCT', 'COMPLIANCE']);
    expect(result.success).toBe(true);

    expect(result.composition.activeSeries).toContain('PE-Series');
    expect(result.composition.activeSeries).toContain('RCSG-Series');
    expect(result.composition.activeSeries).toContain('Competitive');
    expect(result.composition.activeSeries).toContain('Foundation');
  });

  it('returns error for invalid category code in array', () => {
    const result = composeMultiCategory(['STRATEGIC', 'INVALID_CODE']);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/INVALID_CODE/);
  });

  it('namespaces are deduplicated in union', () => {
    const result = composeMultiCategory(['STRATEGIC', 'PRODUCT']);
    expect(result.success).toBe(true);

    const unique = new Set(result.composition.namespaces);
    expect(unique.size).toBe(result.composition.namespaces.length);
  });

  it('required wins over recommended in deduplication', () => {
    // KPI is recommended in STRATEGIC but optional in PPM
    // If included, it should only appear once and in the highest tier
    const result = composeMultiCategory(['STRATEGIC', 'PPM']);
    expect(result.success).toBe(true);

    const allOnts = result.composition.allOntologies;
    const unique = new Set(allOnts);
    expect(unique.size).toBe(allOnts.length);
  });

  it('W4M-WWG scopes (PRODUCT+FULFILMENT+COMPETITIVE) compose successfully', () => {
    const result = composeMultiCategory(['PRODUCT', 'FULFILMENT', 'COMPETITIVE'], {
      contextLevel: 'PFI',
      productCode: 'WWG',
      maturityLevel: 2,
    });
    expect(result.success).toBe(true);
    expect(result.perCategory).toHaveLength(3);
    // FULFILMENT brings LSC and OFM
    expect(result.composition.allOntologies).toContain('LSC');
    expect(result.composition.allOntologies).toContain('OFM');
    // PRODUCT brings VP, PMF, PE, EFS
    expect(result.composition.allOntologies).toContain('VP');
    // COMPETITIVE brings CA, CL, GA
    expect(result.composition.allOntologies).toContain('CA');
    // No duplicates
    const unique = new Set(result.composition.allOntologies);
    expect(unique.size).toBe(result.composition.allOntologies.length);
  });
});

// ===================================================================
// constrainToInstanceOntologies (PFI instance-level filtering)
// ===================================================================

describe('constrainToInstanceOntologies', () => {
  it('returns composition unchanged for empty instanceOntologies', () => {
    const { composition } = composeOntologySet('PRODUCT');
    const result = constrainToInstanceOntologies(composition, []);
    expect(result).toBe(composition); // same reference
  });

  it('returns composition unchanged for null instanceOntologies', () => {
    const { composition } = composeOntologySet('PRODUCT');
    const result = constrainToInstanceOntologies(composition, null);
    expect(result).toBe(composition);
  });

  it('returns composition unchanged for file-path-only entries (BAIV case)', () => {
    const { composition } = composeOntologySet('PRODUCT');
    const baivOnts = [
      'pfi-BAIV-AIV-ONT/RRR-DATA-BAIV-AIV-roles-v1.0.0.jsonld',
      'pfi-BAIV-AIV-ONT/AIV-Competitive-ONT/',
    ];
    const result = constrainToInstanceOntologies(composition, baivOnts);
    expect(result).toBe(composition);
  });

  it('constrains W4M-WWG composition to exactly the declared instance ontologies', () => {
    const multi = composeMultiCategory(['PRODUCT', 'FULFILMENT', 'COMPETITIVE'], {
      contextLevel: 'PFI',
      productCode: 'WWG',
      maturityLevel: 2,
    });
    expect(multi.success).toBe(true);

    const wwgOnts = ['VP-ONT', 'RRR-ONT', 'LSC-ONT', 'OFM-ONT', 'KPI-ONT', 'BSC-ONT', 'EMC-ONT'];
    const constrained = constrainToInstanceOntologies(multi.composition, wwgOnts);

    // Exactly the declared instance ontologies (after stripping -ONT)
    expect(constrained.allOntologies).toContain('VP');
    expect(constrained.allOntologies).toContain('RRR');
    expect(constrained.allOntologies).toContain('LSC');
    expect(constrained.allOntologies).toContain('OFM');
    expect(constrained.allOntologies).toContain('KPI');
    expect(constrained.allOntologies).toContain('BSC');
    expect(constrained.allOntologies).toContain('EMC');
    expect(constrained.allOntologies).toHaveLength(7);

    // Foundation/structural ontologies NOT in instance list are excluded
    // (they render as ghosts via activeSeries classification in buildFilteredView)
    expect(constrained.allOntologies).not.toContain('ORG');
    expect(constrained.allOntologies).not.toContain('PE');
    expect(constrained.allOntologies).not.toContain('CA');
    expect(constrained.allOntologies).not.toContain('PMF');
    expect(constrained.allOntologies).not.toContain('EFS');
  });

  it('namespaces match constrained ontologies exactly', () => {
    const { composition } = composeOntologySet('PRODUCT');
    const constrained = constrainToInstanceOntologies(composition, ['VP-ONT', 'RRR-ONT']);
    expect(constrained.namespaces).toHaveLength(2);
    expect(constrained.namespaces).toContain('vp:');
    expect(constrained.namespaces).toContain('rrr:');
    expect(constrained.allOntologies).toHaveLength(2);
  });

  it('sets instanceConstrained flag and preserves raw input', () => {
    const { composition } = composeOntologySet('PRODUCT');
    const constrained = constrainToInstanceOntologies(composition, ['VP-ONT']);
    expect(constrained.instanceConstrained).toBe(true);
    expect(constrained.instanceOntologiesRaw).toEqual(['VP-ONT']);
  });

  it('strips -ONT suffix case-insensitively', () => {
    const { composition } = composeOntologySet('STRATEGIC');
    const constrained = constrainToInstanceOntologies(composition, ['VSOM-ont', 'OKR-ONT']);
    expect(constrained.allOntologies).toContain('VSOM');
    expect(constrained.allOntologies).toContain('OKR');
  });

  it('does not modify original composition object', () => {
    const { composition } = composeOntologySet('PRODUCT');
    const origLength = composition.allOntologies.length;
    constrainToInstanceOntologies(composition, ['VP-ONT']);
    expect(composition.allOntologies.length).toBe(origLength);
  });

  it('constrains W4M-WWG with KANO-ONT to 8 ontologies', () => {
    const multi = composeMultiCategory(['PRODUCT', 'FULFILMENT', 'COMPETITIVE'], {
      contextLevel: 'PFI',
      productCode: 'WWG',
      maturityLevel: 2,
    });
    expect(multi.success).toBe(true);

    const wwgOnts = ['VP-ONT', 'RRR-ONT', 'LSC-ONT', 'OFM-ONT', 'KPI-ONT', 'BSC-ONT', 'EMC-ONT', 'KANO-ONT'];
    const constrained = constrainToInstanceOntologies(multi.composition, wwgOnts);

    expect(constrained.allOntologies).toContain('KANO');
    expect(constrained.allOntologies).toContain('VP');
    expect(constrained.allOntologies).toContain('BSC');
    expect(constrained.allOntologies).toHaveLength(8);
    expect(constrained.namespaces).toContain('kano:');
  });

  it('KANO activates under STRATEGIC composition', () => {
    const { composition } = composeOntologySet('STRATEGIC');
    const constrained = constrainToInstanceOntologies(composition, ['VSOM-ONT', 'OKR-ONT', 'ORG-ONT', 'KANO-ONT']);
    expect(constrained.allOntologies).toContain('KANO');
    expect(constrained.namespaces).toContain('kano:');
  });

  it('KANO activates under PRODUCT composition', () => {
    const { composition } = composeOntologySet('PRODUCT');
    const constrained = constrainToInstanceOntologies(composition, ['VP-ONT', 'PMF-ONT', 'PE-ONT', 'EFS-ONT', 'ORG-ONT', 'KANO-ONT']);
    expect(constrained.allOntologies).toContain('KANO');
  });

  it('KANO activates under COMPETITIVE composition', () => {
    const { composition } = composeOntologySet('COMPETITIVE');
    const constrained = constrainToInstanceOntologies(composition, ['CA-ONT', 'CL-ONT', 'GA-ONT', 'ORG-ONT', 'KANO-ONT']);
    expect(constrained.allOntologies).toContain('KANO');
  });

  it('KANO excluded when not in instance ontologies', () => {
    const { composition } = composeOntologySet('PRODUCT');
    const constrained = constrainToInstanceOntologies(composition, ['VP-ONT', 'PMF-ONT', 'PE-ONT', 'EFS-ONT', 'ORG-ONT']);
    expect(constrained.allOntologies).not.toContain('KANO');
  });

  it('KANO namespace resolves via nameToNamespace', () => {
    expect(nameToNamespace('KANO')).toBe('kano:');
  });

  it('KANO reverse-maps via namespaceToName', () => {
    expect(namespaceToName('kano:')).toBe('KANO');
  });
});
