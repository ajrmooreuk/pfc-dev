/**
 * Unit tests for scope-rules engine — Epic 19, Feature 19.2
 *
 * Tests SCOPE_RULES, populateScopeRulesFromEMC, evaluateScopeCondition,
 * evaluateScopeRules, resolveProductContext, composeInstanceGraph,
 * resolvePersonaWorkflowGraph.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../js/state.js', () => ({
  state: {
    registryIndex: null,
    pfiInstances: new Map(),
    pfiInstanceData: new Map(),
    compositionManifests: [],
    lastComposition: null,
    composedPFIGraph: null,
    activeScopeRules: null,
    scopeRulesActive: false,
    canonicalSnapshots: new Map(),
    activePersonaScope: null,
    productContext: null,
    scopeRuleLog: [],
  },
  REGISTRY_BASE_PATH: '../../ONTOLOGIES/ontology-library/',
}));

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
  evaluateScopeCondition,
  evaluateScopeRules,
  resolveProductContext,
  composeInstanceGraph,
  resolvePersonaWorkflowGraph,
  SCOPE_RULES,
  populateScopeRulesFromEMC,
  getScopeRulesForInstance,
  clearScopeRules,
} from '../js/emc-composer.js';

// ─── Fixture Helpers ────────────────────────────────────────────────────────

function makeBAIVContext() {
  return {
    products: ['AIV', 'BAIV-AIV'],
    brands: ['BAIV'],
    marketSegments: ['MarTech'],
    maturityLevel: 1,
    jurisdictions: ['UK', 'EU'],
    verticalMarket: 'MarTech',
    requirementScopes: ['PRODUCT', 'COMPETITIVE', 'STRATEGIC'],
    icpSeniority: null,
    gapSeverity: null,
    personaScope: null,
  };
}

function makeBAIVInstanceConfig() {
  return {
    '@id': 'PFI-BAIV',
    products: ['AIV'],
    productCode: 'BAIV-AIV',
    brands: ['BAIV'],
    requirementScopes: ['PRODUCT', 'COMPETITIVE', 'STRATEGIC'],
    maturityLevel: 1,
    verticalMarket: 'MarTech',
    jurisdictions: ['UK', 'EU'],
    orgContext: { industry: 'MarTech SaaS', size: 'Startup' },
    composedGraphSpec: {
      joinPoints: [
        { from: 'vp:IdealCustomerProfile-CMO', to: 'rrr:Role-ContentManager',
          relationship: 'icpMapsToRole', description: 'ICP to role mapping' },
      ],
    },
  };
}

function makeBAIVInstanceData() {
  return {
    files: [
      {
        ontologyRef: 'VP-ONT',
        status: 'loaded',
        parsed: {
          nodes: [
            { id: 'vp:ValueProposition-AIV', label: 'AIV Value Proposition', entityType: 'class' },
            { id: 'vp:IdealCustomerProfile-CMO', label: 'CMO Persona', entityType: 'class',
              properties: { seniority: 'C-Suite' } },
            { id: 'vp:Problem-AIInvisibility', label: 'AI Invisibility', entityType: 'class' },
          ],
          edges: [
            { from: 'vp:ValueProposition-AIV', to: 'vp:IdealCustomerProfile-CMO', label: 'targetsCustomer' },
            { from: 'vp:ValueProposition-AIV', to: 'vp:Problem-AIInvisibility', label: 'addressesProblem' },
          ],
        },
      },
      {
        ontologyRef: 'RRR-ONT',
        status: 'loaded',
        parsed: {
          nodes: [
            { id: 'rrr:Role-ContentManager', label: 'Content Manager', entityType: 'class' },
            { id: 'rrr:Responsibility-ContentOps', label: 'Content Operations', entityType: 'class' },
          ],
          edges: [
            { from: 'rrr:Role-ContentManager', to: 'rrr:Responsibility-ContentOps', label: 'hasResponsibility' },
          ],
        },
      },
      {
        ontologyRef: 'EFS-ONT',
        status: 'loaded',
        parsed: {
          nodes: [
            { id: 'efs:Epic-AIV-001', label: 'Citation Tracking Epic', entityType: 'class' },
            { id: 'efs:Feature-AIV-001-01', label: 'Citation Scanner', entityType: 'class' },
          ],
          edges: [
            { from: 'efs:Epic-AIV-001', to: 'efs:Feature-AIV-001-01', label: 'hasFeature' },
          ],
        },
      },
      {
        ontologyRef: 'KPI-ONT',
        status: 'loaded',
        parsed: {
          nodes: [
            { id: 'kpi:KPI-Citations', label: 'Citation Count KPI', entityType: 'class' },
          ],
          edges: [],
        },
      },
    ],
    config: makeBAIVInstanceConfig(),
    orgContext: { industry: 'MarTech SaaS', size: 'Startup' },
  };
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('SCOPE_RULES data structure (S19.2.1)', () => {
  it('SCOPE_RULES is a Map', () => {
    expect(SCOPE_RULES).toBeInstanceOf(Map);
  });

  it('BAIV defaults are pre-populated', () => {
    expect(SCOPE_RULES.has('PFI-BAIV')).toBe(true);
  });

  it('BAIV has 3 rules sorted by priority', () => {
    const rules = SCOPE_RULES.get('PFI-BAIV');
    expect(rules).toHaveLength(3);
    expect(rules[0].priority).toBe(1);
    expect(rules[1].priority).toBe(2);
    expect(rules[2].priority).toBe(3);
  });

  it('each BAIV rule has conditions as an array', () => {
    const rules = SCOPE_RULES.get('PFI-BAIV');
    for (const rule of rules) {
      expect(Array.isArray(rule.conditions)).toBe(true);
      expect(rule.conditions.length).toBeGreaterThan(0);
    }
  });

  it('populateScopeRulesFromEMC returns 0 for null input', () => {
    expect(populateScopeRulesFromEMC(null)).toBe(0);
  });

  it('populateScopeRulesFromEMC normalises single condition to array', () => {
    const emcData = {
      hasDefinedTerm: [{
        '@id': 'emc:InstanceConfiguration',
        instances: [{
          '@id': 'emc:InstanceConfiguration-TEST',
          scopeRules: [{
            ruleId: 'TEST-Rule',
            priority: 1,
            condition: { conditionType: 'product-match', conditionOperator: 'equals', conditionValue: 'X' },
            action: { actionType: 'include-data', targetNamespaces: ['vp:'] },
          }],
        }],
      }],
    };
    const count = populateScopeRulesFromEMC(emcData);
    expect(count).toBe(1);
    const rules = SCOPE_RULES.get('PFI-TEST');
    expect(rules).toHaveLength(1);
    expect(Array.isArray(rules[0].conditions)).toBe(true);
    expect(rules[0].conditions[0].conditionType).toBe('product-match');
    // Clean up
    SCOPE_RULES.delete('PFI-TEST');
  });

  it('populateScopeRulesFromEMC sorts rules by priority', () => {
    const emcData = {
      hasDefinedTerm: [{
        '@id': 'emc:InstanceConfiguration',
        instances: [{
          '@id': 'emc:InstanceConfiguration-SORT',
          scopeRules: [
            { ruleId: 'R3', priority: 3, conditions: [], action: { actionType: 'include-data' } },
            { ruleId: 'R1', priority: 1, conditions: [], action: { actionType: 'include-data' } },
            { ruleId: 'R2', priority: 2, conditions: [], action: { actionType: 'exclude-data' } },
          ],
        }],
      }],
    };
    populateScopeRulesFromEMC(emcData);
    const rules = SCOPE_RULES.get('PFI-SORT');
    expect(rules[0].ruleId).toBe('R1');
    expect(rules[1].ruleId).toBe('R2');
    expect(rules[2].ruleId).toBe('R3');
    SCOPE_RULES.delete('PFI-SORT');
  });
});

describe('evaluateScopeCondition (S19.2.2)', () => {
  const ctx = makeBAIVContext();

  it('returns false for null condition', () => {
    expect(evaluateScopeCondition(null, ctx)).toBe(false);
  });

  it('returns false for null context', () => {
    expect(evaluateScopeCondition({ conditionType: 'product-match', conditionOperator: 'equals', conditionValue: 'X' }, null)).toBe(false);
  });

  // product-match
  it('product-match equals — matches when product in array', () => {
    expect(evaluateScopeCondition(
      { conditionType: 'product-match', conditionOperator: 'equals', conditionValue: 'AIV' }, ctx
    )).toBe(true);
  });

  it('product-match equals — fails when product not in array', () => {
    expect(evaluateScopeCondition(
      { conditionType: 'product-match', conditionOperator: 'equals', conditionValue: 'OTHER' }, ctx
    )).toBe(false);
  });

  it('product-match not-equals — true when product absent', () => {
    expect(evaluateScopeCondition(
      { conditionType: 'product-match', conditionOperator: 'not-equals', conditionValue: 'OTHER' }, ctx
    )).toBe(true);
  });

  // brand-match
  it('brand-match equals — matches BAIV', () => {
    expect(evaluateScopeCondition(
      { conditionType: 'brand-match', conditionOperator: 'equals', conditionValue: 'BAIV' }, ctx
    )).toBe(true);
  });

  it('brand-match in-set — matches when brand in set', () => {
    expect(evaluateScopeCondition(
      { conditionType: 'brand-match', conditionOperator: 'in-set', conditionValue: ['BAIV', 'VHF'] }, ctx
    )).toBe(true);
  });

  // market-segment
  it('market-segment equals — matches MarTech', () => {
    expect(evaluateScopeCondition(
      { conditionType: 'market-segment', conditionOperator: 'equals', conditionValue: 'MarTech' }, ctx
    )).toBe(true);
  });

  it('market-segment contains — substring match', () => {
    expect(evaluateScopeCondition(
      { conditionType: 'market-segment', conditionOperator: 'contains', conditionValue: 'Tech' }, ctx
    )).toBe(true);
  });

  // maturity-threshold
  it('maturity-threshold less-than — 1 < 3 is true', () => {
    expect(evaluateScopeCondition(
      { conditionType: 'maturity-threshold', conditionOperator: 'less-than', conditionValue: '3' }, ctx
    )).toBe(true);
  });

  it('maturity-threshold greater-than — 1 > 3 is false', () => {
    expect(evaluateScopeCondition(
      { conditionType: 'maturity-threshold', conditionOperator: 'greater-than', conditionValue: '3' }, ctx
    )).toBe(false);
  });

  it('maturity-threshold less-than — 5 < 3 is false', () => {
    expect(evaluateScopeCondition(
      { conditionType: 'maturity-threshold', conditionOperator: 'less-than', conditionValue: '3' },
      { ...ctx, maturityLevel: 5 }
    )).toBe(false);
  });

  // jurisdiction-match
  it('jurisdiction-match equals — UK in array', () => {
    expect(evaluateScopeCondition(
      { conditionType: 'jurisdiction-match', conditionOperator: 'equals', conditionValue: 'UK' }, ctx
    )).toBe(true);
  });

  it('jurisdiction-match in-set — intersects', () => {
    expect(evaluateScopeCondition(
      { conditionType: 'jurisdiction-match', conditionOperator: 'in-set', conditionValue: ['US', 'EU'] }, ctx
    )).toBe(true);
  });

  // requirement-scope
  it('requirement-scope equals — PRODUCT in scopes', () => {
    expect(evaluateScopeCondition(
      { conditionType: 'requirement-scope', conditionOperator: 'equals', conditionValue: 'PRODUCT' }, ctx
    )).toBe(true);
  });

  // gap-severity
  it('gap-severity equals — matches when set', () => {
    expect(evaluateScopeCondition(
      { conditionType: 'gap-severity', conditionOperator: 'equals', conditionValue: 'HIGH' },
      { ...ctx, gapSeverity: 'HIGH' }
    )).toBe(true);
  });

  // icp-seniority
  it('icp-seniority equals — matches when set', () => {
    expect(evaluateScopeCondition(
      { conditionType: 'icp-seniority', conditionOperator: 'equals', conditionValue: 'C-Suite' },
      { ...ctx, icpSeniority: 'C-Suite' }
    )).toBe(true);
  });

  // persona-scope
  it('persona-scope equals — matches when set', () => {
    expect(evaluateScopeCondition(
      { conditionType: 'persona-scope', conditionOperator: 'equals', conditionValue: 'Strategic' },
      { ...ctx, personaScope: 'Strategic' }
    )).toBe(true);
  });

  // unknown
  it('unknown conditionType returns false', () => {
    expect(evaluateScopeCondition(
      { conditionType: 'unknown-type', conditionOperator: 'equals', conditionValue: 'X' }, ctx
    )).toBe(false);
  });

  it('unknown operator returns false', () => {
    expect(evaluateScopeCondition(
      { conditionType: 'product-match', conditionOperator: 'weird-op', conditionValue: 'AIV' }, ctx
    )).toBe(false);
  });
});

describe('evaluateScopeRules (S19.2.3)', () => {
  it('returns empty sets when no rules exist for instance', () => {
    const result = evaluateScopeRules('PFI-NONEXISTENT', makeBAIVContext());
    expect(result.includedNamespaces.size).toBe(0);
    expect(result.excludedNamespaces.size).toBe(0);
    expect(result.ruleLog).toHaveLength(1);
    expect(result.ruleLog[0].action).toBe('no-rules');
  });

  it('BAIV rules fire in priority order', () => {
    const result = evaluateScopeRules('PFI-BAIV', makeBAIVContext());
    const firedRules = result.ruleLog.filter(r => r.fired);
    expect(firedRules.length).toBe(3);
    expect(firedRules[0].priority).toBe(1);
    expect(firedRules[1].priority).toBe(2);
    expect(firedRules[2].priority).toBe(3);
  });

  it('BAIV Product-Scope includes vp:, rrr:, efs:', () => {
    const result = evaluateScopeRules('PFI-BAIV', makeBAIVContext());
    expect(result.includedNamespaces.has('vp:')).toBe(true);
    expect(result.includedNamespaces.has('rrr:')).toBe(true);
    expect(result.includedNamespaces.has('efs:')).toBe(true);
  });

  it('BAIV Market-Scope includes org-ctx:', () => {
    const result = evaluateScopeRules('PFI-BAIV', makeBAIVContext());
    expect(result.includedNamespaces.has('org-ctx:')).toBe(true);
  });

  it('BAIV Maturity-Scope excludes kpi:, ga: at maturity < 3', () => {
    const result = evaluateScopeRules('PFI-BAIV', makeBAIVContext());
    expect(result.excludedNamespaces.has('kpi:')).toBe(true);
    expect(result.excludedNamespaces.has('ga:')).toBe(true);
  });

  it('BAIV Maturity-Scope does NOT fire at maturity >= 3', () => {
    const ctx = { ...makeBAIVContext(), maturityLevel: 5 };
    const result = evaluateScopeRules('PFI-BAIV', ctx);
    expect(result.excludedNamespaces.has('kpi:')).toBe(false);
    const maturityLog = result.ruleLog.find(r => r.ruleId === 'BAIV-Startup-Maturity-Scope');
    expect(maturityLog.fired).toBe(false);
  });

  it('inactive rule is skipped and logged', () => {
    SCOPE_RULES.set('PFI-INACTIVE', [{
      ruleId: 'Disabled-Rule', priority: 1, isActive: false,
      conditions: [{ conditionType: 'product-match', conditionOperator: 'equals', conditionValue: 'X' }],
      action: { actionType: 'include-data', targetNamespaces: ['vp:'] },
    }]);
    const result = evaluateScopeRules('PFI-INACTIVE', makeBAIVContext());
    expect(result.includedNamespaces.size).toBe(0);
    expect(result.ruleLog[0].action).toBe('skipped');
    SCOPE_RULES.delete('PFI-INACTIVE');
  });

  it('AND logic — multi-condition rule requires all conditions true', () => {
    SCOPE_RULES.set('PFI-AND', [{
      ruleId: 'AND-Rule', priority: 1, isActive: true,
      conditions: [
        { conditionType: 'product-match', conditionOperator: 'equals', conditionValue: 'AIV' },
        { conditionType: 'brand-match', conditionOperator: 'equals', conditionValue: 'NONEXIST' },
      ],
      action: { actionType: 'include-data', targetNamespaces: ['vp:'] },
    }]);
    const result = evaluateScopeRules('PFI-AND', makeBAIVContext());
    expect(result.includedNamespaces.size).toBe(0);
    expect(result.ruleLog[0].fired).toBe(false);
    SCOPE_RULES.delete('PFI-AND');
  });

  it('include-before-exclude at same priority (BR-EMC-011)', () => {
    SCOPE_RULES.set('PFI-ORDER', [
      {
        ruleId: 'Exclude-First', priority: 1, isActive: true,
        conditions: [{ conditionType: 'product-match', conditionOperator: 'equals', conditionValue: 'AIV' }],
        action: { actionType: 'exclude-data', targetNamespaces: ['ga:'] },
      },
      {
        ruleId: 'Include-First', priority: 1, isActive: true,
        conditions: [{ conditionType: 'product-match', conditionOperator: 'equals', conditionValue: 'AIV' }],
        action: { actionType: 'include-data', targetNamespaces: ['vp:'] },
      },
    ]);
    const result = evaluateScopeRules('PFI-ORDER', makeBAIVContext());
    // Include should fire before exclude in the log
    const firedLog = result.ruleLog.filter(r => r.fired);
    expect(firedLog[0].action).toBe('include-data');
    expect(firedLog[1].action).toBe('exclude-data');
    SCOPE_RULES.delete('PFI-ORDER');
  });

  it('ruleLog entry has required fields', () => {
    const result = evaluateScopeRules('PFI-BAIV', makeBAIVContext());
    for (const entry of result.ruleLog) {
      expect(entry).toHaveProperty('ruleId');
      expect(entry).toHaveProperty('priority');
      expect(entry).toHaveProperty('fired');
      expect(entry).toHaveProperty('action');
      expect(entry).toHaveProperty('reason');
    }
  });

  it('scope-to-persona action sets personaScope', () => {
    SCOPE_RULES.set('PFI-PERSONA', [{
      ruleId: 'Persona-Rule', priority: 1, isActive: true,
      conditions: [],
      action: { actionType: 'scope-to-persona', targetEntityFilter: 'Strategic', targetEntityTypes: [] },
    }]);
    const result = evaluateScopeRules('PFI-PERSONA', makeBAIVContext());
    expect(result.personaScope).toBe('Strategic');
    SCOPE_RULES.delete('PFI-PERSONA');
  });
});

describe('resolveProductContext (S19.2.4)', () => {
  beforeEach(() => {
    state.pfiInstances.clear();
    state.pfiInstanceData.clear();
  });

  it('returns safe defaults for missing instance', () => {
    const ctx = resolveProductContext('PFI-NONEXISTENT');
    expect(ctx.products).toEqual([]);
    expect(ctx.brands).toEqual([]);
    expect(ctx.maturityLevel).toBe(5);
    expect(ctx.jurisdictions).toEqual([]);
    expect(ctx.icpHierarchy).toBeNull();
  });

  it('BAIV context has correct products, brands, maturityLevel', () => {
    state.pfiInstances.set('PFI-BAIV', makeBAIVInstanceConfig());
    const ctx = resolveProductContext('PFI-BAIV');
    expect(ctx.products).toContain('AIV');
    expect(ctx.products).toContain('BAIV-AIV');
    expect(ctx.brands).toEqual(['BAIV']);
    expect(ctx.maturityLevel).toBe(1);
  });

  it('context includes jurisdictions and verticalMarket', () => {
    state.pfiInstances.set('PFI-BAIV', makeBAIVInstanceConfig());
    const ctx = resolveProductContext('PFI-BAIV');
    expect(ctx.jurisdictions).toEqual(['UK', 'EU']);
    expect(ctx.verticalMarket).toBe('MarTech');
  });

  it('context includes requirementScopes', () => {
    state.pfiInstances.set('PFI-BAIV', makeBAIVInstanceConfig());
    const ctx = resolveProductContext('PFI-BAIV');
    expect(ctx.requirementScopes).toEqual(['PRODUCT', 'COMPETITIVE', 'STRATEGIC']);
  });

  it('ICP hierarchy populated from VP-ONT instance data', () => {
    state.pfiInstances.set('PFI-BAIV', makeBAIVInstanceConfig());
    state.pfiInstanceData.set('PFI-BAIV', makeBAIVInstanceData());
    const ctx = resolveProductContext('PFI-BAIV');
    expect(ctx.icpHierarchy).not.toBeNull();
    expect(ctx.icpHierarchy.length).toBeGreaterThan(0);
    expect(ctx.icpSeniority).toBe('C-Suite');
  });

  it('enriches marketSegments from orgContext.industry', () => {
    state.pfiInstances.set('PFI-BAIV', {
      ...makeBAIVInstanceConfig(),
      verticalMarket: undefined,
      orgContext: { industry: 'HealthTech', size: 'Enterprise' },
    });
    const ctx = resolveProductContext('PFI-BAIV');
    expect(ctx.marketSegments).toContain('HealthTech');
  });
});

describe('composeInstanceGraph (S19.2.5)', () => {
  beforeEach(() => {
    state.pfiInstances.clear();
    state.pfiInstanceData.clear();
  });

  it('returns error when no instance data loaded', () => {
    const scopeResult = { includedNamespaces: new Set(), excludedNamespaces: new Set(), includedEntityTypes: new Set(), excludedEntityTypes: new Set() };
    const result = composeInstanceGraph('PFI-BAIV', scopeResult);
    expect(result.success).toBe(false);
    expect(result.error).toContain('No instance data');
  });

  it('assembles nodes from included namespaces only', () => {
    state.pfiInstanceData.set('PFI-BAIV', makeBAIVInstanceData());
    const scopeResult = {
      includedNamespaces: new Set(['vp:', 'rrr:']),
      excludedNamespaces: new Set(),
      includedEntityTypes: new Set(),
      excludedEntityTypes: new Set(),
    };
    const result = composeInstanceGraph('PFI-BAIV', scopeResult);
    expect(result.success).toBe(true);
    // VP-ONT has 3 nodes, RRR-ONT has 2 nodes = 5
    expect(result.metadata.entityCount).toBe(5);
    // EFS and KPI should be excluded
    expect(result.nodes.every(n => n.sourceNamespace === 'vp:' || n.sourceNamespace === 'rrr:')).toBe(true);
  });

  it('excludes nodes from excluded namespaces', () => {
    state.pfiInstanceData.set('PFI-BAIV', makeBAIVInstanceData());
    const scopeResult = {
      includedNamespaces: new Set(),
      excludedNamespaces: new Set(['kpi:']),
      includedEntityTypes: new Set(),
      excludedEntityTypes: new Set(),
    };
    const result = composeInstanceGraph('PFI-BAIV', scopeResult);
    expect(result.success).toBe(true);
    // KPI nodes should be excluded
    expect(result.nodes.some(n => n.sourceNamespace === 'kpi:')).toBe(false);
    // VP, RRR, EFS should be included
    expect(result.nodes.some(n => n.sourceNamespace === 'vp:')).toBe(true);
  });

  it('prefixes node IDs with namespace', () => {
    state.pfiInstanceData.set('PFI-BAIV', makeBAIVInstanceData());
    const scopeResult = {
      includedNamespaces: new Set(['vp:']),
      excludedNamespaces: new Set(),
      includedEntityTypes: new Set(),
      excludedEntityTypes: new Set(),
    };
    const result = composeInstanceGraph('PFI-BAIV', scopeResult);
    expect(result.nodes[0].id).toMatch(/^vp::/);
    expect(result.nodes[0].originalId).toBe('vp:ValueProposition-AIV');
  });

  it('edges only included when both endpoints present', () => {
    state.pfiInstanceData.set('PFI-BAIV', makeBAIVInstanceData());
    const scopeResult = {
      includedNamespaces: new Set(['vp:']),
      excludedNamespaces: new Set(),
      includedEntityTypes: new Set(),
      excludedEntityTypes: new Set(),
    };
    const result = composeInstanceGraph('PFI-BAIV', scopeResult);
    // VP has 2 edges where both endpoints are VP nodes
    for (const edge of result.edges) {
      expect(result.nodes.some(n => n.id === edge.from)).toBe(true);
      expect(result.nodes.some(n => n.id === edge.to)).toBe(true);
    }
  });

  it('resolves cross-ontology joins from composedGraphSpec', () => {
    state.pfiInstances.set('PFI-BAIV', makeBAIVInstanceConfig());
    state.pfiInstanceData.set('PFI-BAIV', makeBAIVInstanceData());
    const scopeResult = {
      includedNamespaces: new Set(['vp:', 'rrr:']),
      excludedNamespaces: new Set(),
      includedEntityTypes: new Set(),
      excludedEntityTypes: new Set(),
    };
    const result = composeInstanceGraph('PFI-BAIV', scopeResult);
    expect(result.metadata.joinCount).toBe(1);
    const crossEdge = result.edges.find(e => e.isCrossOntology);
    expect(crossEdge).toBeDefined();
    expect(crossEdge.label).toBe('icpMapsToRole');
  });

  it('metadata includes ontologySources and counts', () => {
    state.pfiInstanceData.set('PFI-BAIV', makeBAIVInstanceData());
    const scopeResult = {
      includedNamespaces: new Set(['vp:', 'rrr:', 'efs:']),
      excludedNamespaces: new Set(),
      includedEntityTypes: new Set(),
      excludedEntityTypes: new Set(),
    };
    const result = composeInstanceGraph('PFI-BAIV', scopeResult);
    expect(result.metadata.ontologySources).toContain('VP-ONT');
    expect(result.metadata.ontologySources).toContain('RRR-ONT');
    expect(result.metadata.ontologySources).toContain('EFS-ONT');
    expect(result.metadata.entityCount).toBeGreaterThan(0);
    expect(result.metadata.edgeCount).toBeGreaterThan(0);
  });

  it('marks all nodes as isInstanceData', () => {
    state.pfiInstanceData.set('PFI-BAIV', makeBAIVInstanceData());
    const scopeResult = {
      includedNamespaces: new Set(['vp:']),
      excludedNamespaces: new Set(),
      includedEntityTypes: new Set(),
      excludedEntityTypes: new Set(),
    };
    const result = composeInstanceGraph('PFI-BAIV', scopeResult);
    for (const node of result.nodes) {
      expect(node.isInstanceData).toBe(true);
    }
  });
});

describe('resolvePersonaWorkflowGraph (S19.2.6)', () => {
  const composedGraph = {
    nodes: [
      { id: 'vp::vp:IdealCustomerProfile-CMO', originalId: 'vp:IdealCustomerProfile-CMO', label: 'CMO' },
      { id: 'vp::vp:ValueProposition-AIV', originalId: 'vp:ValueProposition-AIV', label: 'AIV VP' },
      { id: 'vp::vp:Problem-AIInvisibility', originalId: 'vp:Problem-AIInvisibility', label: 'AI Invisibility' },
      { id: 'rrr::rrr:Role-ContentManager', originalId: 'rrr:Role-ContentManager', label: 'Content Manager' },
      { id: 'efs::efs:Epic-AIV-001', originalId: 'efs:Epic-AIV-001', label: 'Citation Epic' },
      { id: 'efs::efs:Feature-AIV-001-01', originalId: 'efs:Feature-AIV-001-01', label: 'Citation Scanner' },
    ],
    edges: [
      { from: 'vp::vp:ValueProposition-AIV', to: 'vp::vp:IdealCustomerProfile-CMO', label: 'targetsCustomer' },
      { from: 'vp::vp:ValueProposition-AIV', to: 'vp::vp:Problem-AIInvisibility', label: 'addressesProblem' },
      { from: 'vp::vp:IdealCustomerProfile-CMO', to: 'rrr::rrr:Role-ContentManager', label: 'icpMapsToRole' },
      { from: 'efs::efs:Epic-AIV-001', to: 'efs::efs:Feature-AIV-001-01', label: 'hasFeature' },
    ],
  };

  it('returns error for null composedGraph', () => {
    const result = resolvePersonaWorkflowGraph(null, 'vp:IdealCustomerProfile-CMO');
    expect(result.success).toBe(false);
  });

  it('returns error for null icpRef', () => {
    const result = resolvePersonaWorkflowGraph(composedGraph, null);
    expect(result.success).toBe(false);
  });

  it('returns error when ICP node not found', () => {
    const result = resolvePersonaWorkflowGraph(composedGraph, 'vp:NONEXISTENT');
    expect(result.success).toBe(false);
    expect(result.error).toContain('not found');
  });

  it('filters to ICP connected subgraph (BFS depth-2)', () => {
    const result = resolvePersonaWorkflowGraph(composedGraph, 'vp:IdealCustomerProfile-CMO');
    expect(result.success).toBe(true);
    // Depth 0: CMO
    // Depth 1: VP-AIV (via targetsCustomer), Role-ContentManager (via icpMapsToRole)
    // Depth 2: Problem-AIInvisibility (via addressesProblem from VP-AIV)
    expect(result.nodes.length).toBe(4);
    expect(result.nodes.some(n => n.id.includes('CMO'))).toBe(true);
    expect(result.nodes.some(n => n.id.includes('ValueProposition'))).toBe(true);
    expect(result.nodes.some(n => n.id.includes('ContentManager'))).toBe(true);
    expect(result.nodes.some(n => n.id.includes('AIInvisibility'))).toBe(true);
    // EFS nodes are NOT connected within depth 2
    expect(result.nodes.some(n => n.id.includes('Epic'))).toBe(false);
  });

  it('retains edges between retained nodes only', () => {
    const result = resolvePersonaWorkflowGraph(composedGraph, 'vp:IdealCustomerProfile-CMO');
    for (const edge of result.edges) {
      expect(result.nodes.some(n => n.id === edge.from)).toBe(true);
      expect(result.nodes.some(n => n.id === edge.to)).toBe(true);
    }
  });

  it('metadata includes personaRef and counts', () => {
    const result = resolvePersonaWorkflowGraph(composedGraph, 'vp:IdealCustomerProfile-CMO');
    expect(result.metadata.personaRef).toBe('vp:IdealCustomerProfile-CMO');
    expect(result.metadata.filteredFromTotal).toBe(6);
    expect(result.metadata.retainedCount).toBe(4);
  });
});

describe('BAIV end-to-end integration', () => {
  beforeEach(() => {
    state.pfiInstances.clear();
    state.pfiInstanceData.clear();
    state.pfiInstances.set('PFI-BAIV', makeBAIVInstanceConfig());
    state.pfiInstanceData.set('PFI-BAIV', makeBAIVInstanceData());
  });

  it('full pipeline: resolveProductContext -> evaluateScopeRules -> composeInstanceGraph', () => {
    const ctx = resolveProductContext('PFI-BAIV');
    expect(ctx.products).toContain('AIV');

    const scopeResult = evaluateScopeRules('PFI-BAIV', ctx);
    expect(scopeResult.ruleLog.filter(r => r.fired).length).toBe(3);

    const graph = composeInstanceGraph('PFI-BAIV', scopeResult);
    expect(graph.success).toBe(true);
    expect(graph.metadata.entityCount).toBeGreaterThan(0);
  });

  it('BAIV scope result includes VP/RRR/EFS, excludes KPI/GA', () => {
    const ctx = resolveProductContext('PFI-BAIV');
    const scopeResult = evaluateScopeRules('PFI-BAIV', ctx);

    expect(scopeResult.includedNamespaces.has('vp:')).toBe(true);
    expect(scopeResult.includedNamespaces.has('rrr:')).toBe(true);
    expect(scopeResult.includedNamespaces.has('efs:')).toBe(true);
    expect(scopeResult.excludedNamespaces.has('kpi:')).toBe(true);
    expect(scopeResult.excludedNamespaces.has('ga:')).toBe(true);
  });

  it('composed graph respects scope — no KPI nodes in output', () => {
    const ctx = resolveProductContext('PFI-BAIV');
    const scopeResult = evaluateScopeRules('PFI-BAIV', ctx);
    const graph = composeInstanceGraph('PFI-BAIV', scopeResult);

    expect(graph.success).toBe(true);
    expect(graph.nodes.some(n => n.sourceNamespace === 'kpi:')).toBe(false);
    expect(graph.nodes.some(n => n.sourceNamespace === 'vp:')).toBe(true);
    expect(graph.nodes.some(n => n.sourceNamespace === 'rrr:')).toBe(true);
  });
});

// ─── F40.18: Multi-instance scope rule loading ──────────────────────────────

describe('populateScopeRulesFromEMC — Format 2: examples[] (F40.18)', () => {
  it('parses rules from examples[] with @type emc:InstanceConfiguration', () => {
    const emcData = {
      examples: [{
        '@type': 'emc:InstanceConfiguration',
        '@id': 'emc:InstanceConfiguration-W4M-WWG',
        scopeRules: [
          { ruleId: 'WWG-Product-Scope', priority: 1, scopeLevel: 'entity',
            condition: { conditionType: 'product-match', conditionOperator: 'equals', conditionValue: 'WWG' },
            action: { actionType: 'include-data', targetNamespaces: ['vp:', 'rrr:'] } },
          { ruleId: 'WWG-Corridor-Scope', priority: 2,
            conditions: [{ conditionType: 'jurisdiction-match', conditionOperator: 'in-set', conditionValue: ['AU', 'NZ', 'IS', 'IE'] }],
            action: { actionType: 'include-data', targetNamespaces: ['lsc:'] } },
        ],
      }],
    };
    const count = populateScopeRulesFromEMC(emcData);
    expect(count).toBe(1);
    const rules = SCOPE_RULES.get('PFI-W4M-WWG');
    expect(rules).toHaveLength(2);
    expect(rules[0].ruleId).toBe('WWG-Product-Scope');
    expect(rules[0].priority).toBe(1);
    expect(Array.isArray(rules[0].conditions)).toBe(true);
    SCOPE_RULES.delete('PFI-W4M-WWG');
  });

  it('filters out _section markers in scopeRules array', () => {
    const emcData = {
      examples: [{
        '@type': 'emc:InstanceConfiguration',
        '@id': 'emc:InstanceConfiguration-SECT',
        scopeRules: [
          { _section: 'Core Rules' },
          { ruleId: 'Real-Rule', priority: 1, conditions: [],
            action: { actionType: 'include-data', targetNamespaces: ['vp:'] } },
          { _section: 'Extended Rules' },
        ],
      }],
    };
    const count = populateScopeRulesFromEMC(emcData);
    expect(count).toBe(1);
    const rules = SCOPE_RULES.get('PFI-SECT');
    expect(rules).toHaveLength(1);
    expect(rules[0].ruleId).toBe('Real-Rule');
    SCOPE_RULES.delete('PFI-SECT');
  });

  it('uses instanceIdOverride when provided', () => {
    const emcData = {
      examples: [{
        '@type': 'emc:InstanceConfiguration',
        '@id': 'emc:InstanceConfiguration-WRONG',
        scopeRules: [
          { ruleId: 'Override-Rule', priority: 1, conditions: [],
            action: { actionType: 'include-data', targetNamespaces: ['vp:'] } },
        ],
      }],
    };
    const count = populateScopeRulesFromEMC(emcData, 'PFI-OVERRIDE');
    expect(count).toBe(1);
    expect(SCOPE_RULES.has('PFI-OVERRIDE')).toBe(true);
    expect(SCOPE_RULES.has('PFI-WRONG')).toBe(false);
    SCOPE_RULES.delete('PFI-OVERRIDE');
  });

  it('ignores examples without @type emc:InstanceConfiguration', () => {
    const emcData = {
      examples: [
        { '@type': 'emc:SomethingElse', scopeRules: [{ ruleId: 'Skip', priority: 1 }] },
        { '@type': 'emc:InstanceConfiguration', '@id': 'emc:InstanceConfiguration-VALID',
          scopeRules: [{ ruleId: 'Keep', priority: 1, conditions: [],
            action: { actionType: 'include-data', targetNamespaces: ['vp:'] } }] },
      ],
    };
    const count = populateScopeRulesFromEMC(emcData);
    expect(count).toBe(1);
    expect(SCOPE_RULES.has('PFI-VALID')).toBe(true);
    SCOPE_RULES.delete('PFI-VALID');
  });

  it('handles singular examples (not array)', () => {
    const emcData = {
      examples: {
        '@type': 'emc:InstanceConfiguration',
        '@id': 'emc:InstanceConfiguration-SINGLE',
        scopeRules: [
          { ruleId: 'Single-Rule', priority: 1, conditions: [],
            action: { actionType: 'include-data', targetNamespaces: ['vp:'] } },
        ],
      },
    };
    const count = populateScopeRulesFromEMC(emcData);
    expect(count).toBe(1);
    SCOPE_RULES.delete('PFI-SINGLE');
  });

  it('sets isActive true when not explicitly false', () => {
    const emcData = {
      examples: [{
        '@type': 'emc:InstanceConfiguration',
        '@id': 'emc:InstanceConfiguration-ACTIVE',
        scopeRules: [
          { ruleId: 'NoFlag', priority: 1, conditions: [],
            action: { actionType: 'include-data', targetNamespaces: ['vp:'] } },
          { ruleId: 'Explicit', priority: 2, isActive: false, conditions: [],
            action: { actionType: 'include-data', targetNamespaces: ['rrr:'] } },
        ],
      }],
    };
    populateScopeRulesFromEMC(emcData);
    const rules = SCOPE_RULES.get('PFI-ACTIVE');
    expect(rules[0].isActive).toBe(true);
    expect(rules[1].isActive).toBe(false);
    SCOPE_RULES.delete('PFI-ACTIVE');
  });
});

describe('getScopeRulesForInstance (F40.18)', () => {
  it('returns empty array for unknown instance', () => {
    expect(getScopeRulesForInstance('PFI-NONEXISTENT')).toEqual([]);
  });

  it('returns BAIV default rules', () => {
    const rules = getScopeRulesForInstance('PFI-BAIV');
    expect(rules.length).toBeGreaterThan(0);
    expect(rules[0].ruleId).toContain('BAIV');
  });

  it('returns dynamically loaded rules', () => {
    SCOPE_RULES.set('PFI-TEST-GET', [{ ruleId: 'T1', priority: 1 }]);
    const rules = getScopeRulesForInstance('PFI-TEST-GET');
    expect(rules).toHaveLength(1);
    expect(rules[0].ruleId).toBe('T1');
    SCOPE_RULES.delete('PFI-TEST-GET');
  });
});

describe('clearScopeRules (F40.18)', () => {
  it('removes non-BAIV rules', () => {
    SCOPE_RULES.set('PFI-CLEAR-ME', [{ ruleId: 'Gone', priority: 1 }]);
    clearScopeRules('PFI-CLEAR-ME');
    expect(SCOPE_RULES.has('PFI-CLEAR-ME')).toBe(false);
  });

  it('preserves BAIV defaults', () => {
    const before = SCOPE_RULES.get('PFI-BAIV');
    clearScopeRules('PFI-BAIV');
    expect(SCOPE_RULES.get('PFI-BAIV')).toBe(before);
  });
});
