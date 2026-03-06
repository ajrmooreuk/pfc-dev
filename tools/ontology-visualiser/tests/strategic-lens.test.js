/**
 * Unit tests for strategic-lens.js — Epic 9G: VESM / BSC / Role-Authority
 *
 * Tests: VESM tier classification, BSC perspective mapping, role-authority
 * filtering, RACI badges, compound composability, and edge cases.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock state.js
vi.mock('../js/state.js', () => ({
  state: {
    strategicLensActive: false,
    strategicLensPanelOpen: false,
    strategicLensTab: 'vesm',
    vesmTiersActive: new Set(),
    vesmScopeLevel: 'all',
    bscPerspectivesActive: new Set(),
    bscOverlayMode: 'border',
    roleFilterActive: false,
    activeRoleRef: null,
    raciFilterMode: null,
    roleAuthorityChain: [],
    network: null,
    mergedGraph: null,
    lastParsed: null,
    viewMode: 'single',
  },
  VESM_TIERS: {
    vision:    { name: 'Vision',    color: '#7C4DFF', ontologies: ['VSOM'],           entityTypes: ['Vision', 'VisionComponent'] },
    strategy:  { name: 'Strategy',  color: '#2196F3', ontologies: ['VSOM', 'BSC'],    entityTypes: ['Strategy', 'StrategyComponent', 'BalancedScorecard', 'StrategyMap', 'BSCPerspective', 'StrategicReviewCycle'] },
    execution: { name: 'Execution', color: '#FF9800', ontologies: ['OKR', 'RRR', 'PE'], entityTypes: ['Objective', 'KeyResult', 'ObjectivesComponent', 'BSCObjective', 'ExecutiveRole', 'FunctionalRole', 'RoleAssignment', 'StakeholderAlignment'] },
    metrics:   { name: 'Metrics',   color: '#4CAF50', ontologies: ['KPI', 'BSC'],     entityTypes: ['Metric', 'MetricsComponent', 'KPI', 'BSCMeasure', 'ValueMeasure', 'VEAnalysis', 'VEFunction', 'VECostElement'] },
  },
  BSC_PERSPECTIVES: {
    'financial':        { name: 'Financial',           color: '#4CAF50', shortCode: 'F' },
    'customer':         { name: 'Customer',            color: '#2196F3', shortCode: 'C' },
    'internal-process': { name: 'Internal Process',    color: '#FF9800', shortCode: 'IP' },
    'learning-growth':  { name: 'Learning & Growth',   color: '#9C27B0', shortCode: 'LG' },
  },
  RACI_BADGES: {
    accountable: { label: 'A', color: '#E91E63', tooltip: 'Accountable' },
    responsible: { label: 'R', color: '#FF9800', tooltip: 'Responsible' },
    consulted:   { label: 'C', color: '#2196F3', tooltip: 'Consulted' },
    informed:    { label: 'I', color: '#9E9E9E', tooltip: 'Informed' },
  },
}));

import {
  classifyNodeVESMTier,
  buildVESMTierMap,
  computeVESMFilter,
  computeVESMTierCounts,
  classifyNodeBSCPerspective,
  buildBSCPerspectiveMap,
  computeBSCFilter,
  getBSCBorderColor,
  computeBSCPerspectiveCounts,
  getBSCBorderStyles,
  buildRoleEntityMap,
  computeRoleFilter,
  getRACIBadgesForNode,
  extractRoles,
  buildAuthorityChain,
  formatRACIBadgeLabel,
  computeStrategicLensFilter,
  _resetCaches,
} from '../js/strategic-lens.js';
import { VESM_TIERS, BSC_PERSPECTIVES, RACI_BADGES } from '../js/state.js';

// ─── Test Fixtures ───────────────────────────────────────────────────────────

function makeNode(id, label, entityType = 'class', namespace = '', properties = {}) {
  return { id, label, entityType, namespace, name: label, description: '', properties, '@id': id };
}

// VESM tier nodes
const VISION_NODE = makeNode('vsom:VisionComponent', 'VisionComponent', 'core', 'vsom');
const STRATEGY_NODE = makeNode('vsom:StrategyComponent', 'StrategyComponent', 'core', 'vsom');
const BSC_NODE = makeNode('bsc:BalancedScorecard', 'BalancedScorecard', 'framework', 'bsc');
const BSC_PERSP_NODE = makeNode('bsc:BSCPerspective', 'BSCPerspective', 'class', 'bsc');
const OBJECTIVE_NODE = makeNode('okr:Objective', 'Objective', 'class', 'okr');
const KEY_RESULT_NODE = makeNode('okr:KeyResult', 'KeyResult', 'class', 'okr');
const BSC_OBJ_NODE = makeNode('bsc:BSCObjective', 'BSCObjective', 'class', 'bsc');
const KPI_NODE = makeNode('kpi:KPI', 'KPI', 'class', 'kpi');
const METRIC_NODE = makeNode('kpi:Metric', 'Metric', 'class', 'kpi');
const BSC_MEASURE_NODE = makeNode('bsc:BSCMeasure', 'BSCMeasure', 'class', 'bsc');
const EXEC_ROLE_NODE = makeNode('rrr:CEO', 'ExecutiveRole', 'class', 'rrr');
const FUNC_ROLE_NODE = makeNode('rrr:DevLead', 'FunctionalRole', 'class', 'rrr');
const UNMAPPED_NODE = makeNode('org:Organisation', 'Organisation', 'core', 'org');
const VISION_PREFIXED = makeNode('vsom:Vision', 'vsom:Vision', 'core', 'vsom');

// BSC perspective nodes
const FINANCIAL_NODE = makeNode('bsc:FinPersp', 'BSCPerspective', 'class', 'bsc', { perspectiveType: 'Financial' });
const CUSTOMER_NODE = makeNode('bsc:CustPersp', 'BSCPerspective', 'class', 'bsc', { perspectiveType: 'Customer' });
const INTERNAL_NODE = makeNode('bsc:IntPersp', 'BSCPerspective', 'class', 'bsc', { perspectiveType: 'Internal Process' });
const LEARNING_NODE = makeNode('bsc:LearnPersp', 'BSCPerspective', 'class', 'bsc', { perspectiveType: 'Learning & Growth' });
const ROLE_WITH_BSC = makeNode('rrr:CFO', 'ExecutiveRole', 'class', 'rrr', { bscPerspective: 'Financial' });

const ALL_VESM_NODES = [
  VISION_NODE, STRATEGY_NODE, BSC_NODE, BSC_PERSP_NODE,
  OBJECTIVE_NODE, KEY_RESULT_NODE, BSC_OBJ_NODE,
  KPI_NODE, METRIC_NODE, BSC_MEASURE_NODE,
  EXEC_ROLE_NODE, UNMAPPED_NODE,
];

// Reset caches between test runs
beforeEach(() => {
  _resetCaches();
});

// ─── classifyNodeVESMTier ───────────────────────────────────────────────────

describe('classifyNodeVESMTier', () => {
  it('classifies VisionComponent as vision tier', () => {
    expect(classifyNodeVESMTier(VISION_NODE)).toBe('vision');
  });

  it('classifies StrategyComponent as strategy tier', () => {
    expect(classifyNodeVESMTier(STRATEGY_NODE)).toBe('strategy');
  });

  it('classifies BalancedScorecard as strategy tier', () => {
    expect(classifyNodeVESMTier(BSC_NODE)).toBe('strategy');
  });

  it('classifies BSCPerspective as strategy tier', () => {
    expect(classifyNodeVESMTier(BSC_PERSP_NODE)).toBe('strategy');
  });

  it('classifies Objective as execution tier', () => {
    expect(classifyNodeVESMTier(OBJECTIVE_NODE)).toBe('execution');
  });

  it('classifies KeyResult as execution tier', () => {
    expect(classifyNodeVESMTier(KEY_RESULT_NODE)).toBe('execution');
  });

  it('classifies BSCObjective as execution tier', () => {
    expect(classifyNodeVESMTier(BSC_OBJ_NODE)).toBe('execution');
  });

  it('classifies ExecutiveRole as execution tier', () => {
    expect(classifyNodeVESMTier(EXEC_ROLE_NODE)).toBe('execution');
  });

  it('classifies KPI as metrics tier', () => {
    expect(classifyNodeVESMTier(KPI_NODE)).toBe('metrics');
  });

  it('classifies Metric as metrics tier', () => {
    expect(classifyNodeVESMTier(METRIC_NODE)).toBe('metrics');
  });

  it('classifies BSCMeasure as metrics tier', () => {
    expect(classifyNodeVESMTier(BSC_MEASURE_NODE)).toBe('metrics');
  });

  it('returns null for unmapped entity types', () => {
    expect(classifyNodeVESMTier(UNMAPPED_NODE)).toBe(null);
  });

  it('handles null input', () => {
    expect(classifyNodeVESMTier(null)).toBe(null);
  });

  it('handles node with namespace-prefixed label', () => {
    expect(classifyNodeVESMTier(VISION_PREFIXED)).toBe('vision');
  });

  it('falls back to namespace when entity type is ambiguous', () => {
    const node = makeNode('kpi:CustomThing', 'CustomThing', 'class', 'kpi');
    // CustomThing doesn't match any entityType directly, but namespace 'kpi' maps to metrics
    expect(classifyNodeVESMTier(node)).toBe('metrics');
  });
});

// ─── buildVESMTierMap ───────────────────────────────────────────────────────

describe('buildVESMTierMap', () => {
  it('builds tier map for mixed node set', () => {
    const map = buildVESMTierMap(ALL_VESM_NODES);
    expect(map.get(VISION_NODE.id)).toBe('vision');
    expect(map.get(STRATEGY_NODE.id)).toBe('strategy');
    expect(map.get(OBJECTIVE_NODE.id)).toBe('execution');
    expect(map.get(KPI_NODE.id)).toBe('metrics');
    expect(map.has(UNMAPPED_NODE.id)).toBe(false);
  });

  it('returns empty map for null input', () => {
    expect(buildVESMTierMap(null).size).toBe(0);
  });

  it('returns empty map for empty array', () => {
    expect(buildVESMTierMap([]).size).toBe(0);
  });
});

// ─── computeVESMFilter ──────────────────────────────────────────────────────

describe('computeVESMFilter', () => {
  it('shows only vision tier nodes when vision is active', () => {
    const { visible, dimmed } = computeVESMFilter(ALL_VESM_NODES, new Set(['vision']));
    expect(visible.has(VISION_NODE.id)).toBe(true);
    expect(dimmed.has(STRATEGY_NODE.id)).toBe(true);
    expect(dimmed.has(OBJECTIVE_NODE.id)).toBe(true);
  });

  it('shows vision and strategy when both are active', () => {
    const { visible } = computeVESMFilter(ALL_VESM_NODES, new Set(['vision', 'strategy']));
    expect(visible.has(VISION_NODE.id)).toBe(true);
    expect(visible.has(STRATEGY_NODE.id)).toBe(true);
    expect(visible.has(BSC_NODE.id)).toBe(true); // BalancedScorecard is strategy tier
  });

  it('dims all when no tiers are active', () => {
    const { visible, dimmed } = computeVESMFilter(ALL_VESM_NODES, new Set());
    expect(visible.size).toBe(0);
    expect(dimmed.size).toBe(ALL_VESM_NODES.length);
  });

  it('handles null nodes', () => {
    const { visible, dimmed } = computeVESMFilter(null, new Set(['vision']));
    expect(visible.size).toBe(0);
    expect(dimmed.size).toBe(0);
  });

  it('shows all 4 tiers when all are active', () => {
    const allTiers = new Set(['vision', 'strategy', 'execution', 'metrics']);
    const { visible } = computeVESMFilter(ALL_VESM_NODES, allTiers);
    // Only UNMAPPED_NODE should be dimmed
    expect(visible.has(UNMAPPED_NODE.id)).toBe(false);
    expect(visible.size).toBe(ALL_VESM_NODES.length - 1);
  });
});

// ─── computeVESMTierCounts ──────────────────────────────────────────────────

describe('computeVESMTierCounts', () => {
  it('counts nodes per tier correctly', () => {
    const counts = computeVESMTierCounts(ALL_VESM_NODES);
    expect(counts.vision).toBe(1);     // VisionComponent
    expect(counts.strategy).toBe(3);   // StrategyComponent, BalancedScorecard, BSCPerspective
    expect(counts.execution).toBe(4);  // Objective, KeyResult, BSCObjective, ExecutiveRole
    expect(counts.metrics).toBe(3);    // KPI, Metric, BSCMeasure
    expect(counts._unclassified).toBe(1); // Organisation
  });

  it('returns zero counts for null input', () => {
    const counts = computeVESMTierCounts(null);
    expect(counts.vision).toBe(0);
    expect(counts._unclassified).toBe(0);
  });
});

// ─── classifyNodeBSCPerspective ─────────────────────────────────────────────

describe('classifyNodeBSCPerspective', () => {
  it('classifies from direct perspectiveType property', () => {
    expect(classifyNodeBSCPerspective(FINANCIAL_NODE)).toBe('financial');
  });

  it('classifies Customer perspective', () => {
    expect(classifyNodeBSCPerspective(CUSTOMER_NODE)).toBe('customer');
  });

  it('classifies Internal Process perspective', () => {
    expect(classifyNodeBSCPerspective(INTERNAL_NODE)).toBe('internal-process');
  });

  it('classifies Learning & Growth perspective', () => {
    expect(classifyNodeBSCPerspective(LEARNING_NODE)).toBe('learning-growth');
  });

  it('classifies from bscPerspective property (RRR-ONT role)', () => {
    expect(classifyNodeBSCPerspective(ROLE_WITH_BSC)).toBe('financial');
  });

  it('returns null for nodes without perspective data', () => {
    expect(classifyNodeBSCPerspective(UNMAPPED_NODE)).toBe(null);
  });

  it('handles null input', () => {
    expect(classifyNodeBSCPerspective(null)).toBe(null);
  });
});

// ─── buildBSCPerspectiveMap ─────────────────────────────────────────────────

describe('buildBSCPerspectiveMap', () => {
  it('builds map from nodes with perspective data', () => {
    const nodes = [FINANCIAL_NODE, CUSTOMER_NODE, INTERNAL_NODE, LEARNING_NODE, UNMAPPED_NODE];
    const map = buildBSCPerspectiveMap(nodes);
    expect(map.get(FINANCIAL_NODE.id)).toBe('financial');
    expect(map.get(CUSTOMER_NODE.id)).toBe('customer');
    expect(map.get(INTERNAL_NODE.id)).toBe('internal-process');
    expect(map.get(LEARNING_NODE.id)).toBe('learning-growth');
    expect(map.has(UNMAPPED_NODE.id)).toBe(false);
  });

  it('returns empty map for null', () => {
    expect(buildBSCPerspectiveMap(null).size).toBe(0);
  });
});

// ─── computeBSCFilter ───────────────────────────────────────────────────────

describe('computeBSCFilter', () => {
  const bscNodes = [FINANCIAL_NODE, CUSTOMER_NODE, INTERNAL_NODE, LEARNING_NODE, UNMAPPED_NODE];
  const perspMap = buildBSCPerspectiveMap(bscNodes);

  it('shows only financial nodes when financial is active', () => {
    const { visible, dimmed } = computeBSCFilter(bscNodes, new Set(['financial']), perspMap);
    expect(visible.has(FINANCIAL_NODE.id)).toBe(true);
    expect(dimmed.has(CUSTOMER_NODE.id)).toBe(true);
    expect(dimmed.has(UNMAPPED_NODE.id)).toBe(true);
  });

  it('shows multiple perspectives when active', () => {
    const { visible } = computeBSCFilter(bscNodes, new Set(['financial', 'customer']), perspMap);
    expect(visible.has(FINANCIAL_NODE.id)).toBe(true);
    expect(visible.has(CUSTOMER_NODE.id)).toBe(true);
    expect(visible.size).toBe(2);
  });

  it('dims all when no perspectives active', () => {
    const { dimmed } = computeBSCFilter(bscNodes, new Set(), perspMap);
    expect(dimmed.size).toBe(bscNodes.length);
  });
});

// ─── getBSCBorderColor ──────────────────────────────────────────────────────

describe('getBSCBorderColor', () => {
  it('returns correct colour for financial', () => {
    expect(getBSCBorderColor('financial')).toBe('#4CAF50');
  });

  it('returns correct colour for customer', () => {
    expect(getBSCBorderColor('customer')).toBe('#2196F3');
  });

  it('returns correct colour for internal-process', () => {
    expect(getBSCBorderColor('internal-process')).toBe('#FF9800');
  });

  it('returns correct colour for learning-growth', () => {
    expect(getBSCBorderColor('learning-growth')).toBe('#9C27B0');
  });

  it('returns null for unknown perspective', () => {
    expect(getBSCBorderColor('unknown')).toBe(null);
  });

  it('returns null for null input', () => {
    expect(getBSCBorderColor(null)).toBe(null);
  });
});

// ─── buildRoleEntityMap ─────────────────────────────────────────────────────

describe('buildRoleEntityMap', () => {
  const CEO = makeNode('rrr:CEO', 'ExecutiveRole', 'class', 'rrr');
  const CFO = makeNode('rrr:CFO', 'ExecutiveRole', 'class', 'rrr');
  const VISION = makeNode('vsom:Vision', 'Vision', 'core', 'vsom');
  const BUDGET = makeNode('kpi:Budget', 'KPI', 'class', 'kpi');
  const nodes = [CEO, CFO, VISION, BUDGET];

  it('identifies role nodes from entity type', () => {
    const map = buildRoleEntityMap(nodes, []);
    expect(map.has('rrr:CEO')).toBe(true);
    expect(map.has('rrr:CFO')).toBe(true);
    expect(map.has('vsom:Vision')).toBe(false);
  });

  it('traces ownership edges to build owned entities', () => {
    const edges = [
      { from: 'vsom:Vision', to: 'rrr:CEO', label: 'ownedBy' },
      { from: 'kpi:Budget', to: 'rrr:CFO', label: 'managedBy' },
    ];
    const map = buildRoleEntityMap(nodes, edges);
    expect(map.get('rrr:CEO').ownedEntities.has('vsom:Vision')).toBe(true);
    expect(map.get('rrr:CFO').ownedEntities.has('kpi:Budget')).toBe(true);
  });

  it('traces RACI edges', () => {
    const edges = [
      { from: 'rrr:CEO', to: 'vsom:Vision', label: 'raciAccountable' },
    ];
    const map = buildRoleEntityMap(nodes, edges);
    expect(map.get('rrr:CEO').raciAssignments.get('vsom:Vision')).toBe('accountable');
  });

  it('returns empty map for null nodes', () => {
    expect(buildRoleEntityMap(null, []).size).toBe(0);
  });
});

// ─── computeRoleFilter ──────────────────────────────────────────────────────

describe('computeRoleFilter', () => {
  const CEO = makeNode('rrr:CEO', 'ExecutiveRole', 'class', 'rrr');
  const VISION = makeNode('vsom:Vision', 'Vision', 'core', 'vsom');
  const BUDGET = makeNode('kpi:Budget', 'KPI', 'class', 'kpi');
  const OTHER = makeNode('org:Org', 'Organisation', 'core', 'org');
  const nodes = [CEO, VISION, BUDGET, OTHER];

  const edges = [
    { from: 'vsom:Vision', to: 'rrr:CEO', label: 'ownedBy' },
    { from: 'rrr:CEO', to: 'vsom:Vision', label: 'raciAccountable' },
  ];
  const roleMap = buildRoleEntityMap(nodes, edges);

  it('shows only owned entities when role is selected', () => {
    const { visible, dimmed } = computeRoleFilter(nodes, 'rrr:CEO', null, roleMap);
    expect(visible.has('rrr:CEO')).toBe(true);      // role itself always visible
    expect(visible.has('vsom:Vision')).toBe(true);   // owned by CEO
    expect(dimmed.has('kpi:Budget')).toBe(true);     // not owned by CEO
    expect(dimmed.has('org:Org')).toBe(true);
  });

  it('shows all when no role selected', () => {
    const { visible } = computeRoleFilter(nodes, null, null, roleMap);
    expect(visible.size).toBe(nodes.length);
  });

  it('applies RACI mode filter', () => {
    const { visible } = computeRoleFilter(nodes, 'rrr:CEO', 'accountable', roleMap);
    expect(visible.has('rrr:CEO')).toBe(true);
    expect(visible.has('vsom:Vision')).toBe(true);   // raciAccountable
  });
});

// ─── getRACIBadgesForNode ───────────────────────────────────────────────────

describe('getRACIBadgesForNode', () => {
  const CEO = makeNode('rrr:CEO', 'ExecutiveRole', 'class', 'rrr');
  const VISION = makeNode('vsom:Vision', 'Vision', 'core', 'vsom');
  const nodes = [CEO, VISION];
  const edges = [
    { from: 'rrr:CEO', to: 'vsom:Vision', label: 'raciAccountable' },
  ];
  const roleMap = buildRoleEntityMap(nodes, edges);

  it('returns RACI badge for a node with assignment', () => {
    const badges = getRACIBadgesForNode('vsom:Vision', roleMap);
    expect(badges.length).toBe(1);
    expect(badges[0].type).toBe('accountable');
    expect(badges[0].roleId).toBe('rrr:CEO');
  });

  it('returns empty array for node without assignments', () => {
    const badges = getRACIBadgesForNode('org:Unknown', roleMap);
    expect(badges.length).toBe(0);
  });

  it('returns empty array for null inputs', () => {
    expect(getRACIBadgesForNode(null, roleMap).length).toBe(0);
    expect(getRACIBadgesForNode('x', null).length).toBe(0);
  });
});

// ─── extractRoles ───────────────────────────────────────────────────────────

describe('extractRoles', () => {
  it('extracts ExecutiveRole and FunctionalRole nodes', () => {
    const nodes = [EXEC_ROLE_NODE, FUNC_ROLE_NODE, UNMAPPED_NODE];
    const roles = extractRoles(nodes);
    expect(roles.length).toBe(2);
    expect(roles.map(r => r.id)).toContain(EXEC_ROLE_NODE.id);
    expect(roles.map(r => r.id)).toContain(FUNC_ROLE_NODE.id);
  });

  it('returns empty array for null', () => {
    expect(extractRoles(null).length).toBe(0);
  });

  it('returns sorted by label', () => {
    const roles = extractRoles([FUNC_ROLE_NODE, EXEC_ROLE_NODE]);
    // Both have label 'ExecutiveRole' and 'FunctionalRole' respectively
    expect(roles[0].label).toBe('ExecutiveRole');
    expect(roles[1].label).toBe('FunctionalRole');
  });
});

// ─── computeStrategicLensFilter ─────────────────────────────────────────────

describe('computeStrategicLensFilter', () => {
  it('returns all visible when no sub-lens is active', () => {
    const lensState = {
      vesmTiersActive: new Set(),
      bscPerspectivesActive: new Set(),
      roleFilterActive: false,
      activeRoleRef: null,
      raciFilterMode: null,
    };
    const { visible } = computeStrategicLensFilter(ALL_VESM_NODES, lensState);
    expect(visible.size).toBe(ALL_VESM_NODES.length);
  });

  it('applies VESM filter when only VESM tiers are active', () => {
    const lensState = {
      vesmTiersActive: new Set(['vision']),
      vesmScopeLevel: 'all',
      bscPerspectivesActive: new Set(),
      roleFilterActive: false,
      activeRoleRef: null,
      raciFilterMode: null,
    };
    const { visible, dimmed } = computeStrategicLensFilter(ALL_VESM_NODES, lensState);
    expect(visible.has(VISION_NODE.id)).toBe(true);
    expect(dimmed.has(KPI_NODE.id)).toBe(true);
  });

  it('applies BSC filter when only BSC perspectives are active', () => {
    const bscNodes = [FINANCIAL_NODE, CUSTOMER_NODE, UNMAPPED_NODE];
    const lensState = {
      vesmTiersActive: new Set(),
      bscPerspectivesActive: new Set(['financial']),
      roleFilterActive: false,
      activeRoleRef: null,
      raciFilterMode: null,
    };
    const { visible } = computeStrategicLensFilter(bscNodes, lensState);
    expect(visible.has(FINANCIAL_NODE.id)).toBe(true);
    expect(visible.has(CUSTOMER_NODE.id)).toBe(false);
  });

  it('applies AND logic when VESM + BSC are both active', () => {
    // Node must pass BOTH filters to be visible
    // FINANCIAL_NODE: perspectiveType=Financial but label=BSCPerspective → strategy tier
    const nodes = [FINANCIAL_NODE, VISION_NODE, UNMAPPED_NODE];
    const lensState = {
      vesmTiersActive: new Set(['strategy']),    // BSCPerspective is strategy tier
      vesmScopeLevel: 'all',
      bscPerspectivesActive: new Set(['financial']),
      roleFilterActive: false,
      activeRoleRef: null,
      raciFilterMode: null,
    };
    const { visible } = computeStrategicLensFilter(nodes, lensState);
    // FINANCIAL_NODE: strategy tier ✓, financial perspective ✓ → visible
    expect(visible.has(FINANCIAL_NODE.id)).toBe(true);
    // VISION_NODE: vision tier (not strategy) → fails VESM → dimmed
    expect(visible.has(VISION_NODE.id)).toBe(false);
  });

  it('handles empty node array', () => {
    const lensState = { vesmTiersActive: new Set(['vision']), vesmScopeLevel: 'all', bscPerspectivesActive: new Set(), roleFilterActive: false, activeRoleRef: null, raciFilterMode: null };
    const { visible, dimmed } = computeStrategicLensFilter([], lensState);
    expect(visible.size).toBe(0);
    expect(dimmed.size).toBe(0);
  });
});

// ─── buildBSCPerspectiveMap with edges (S9G.1.2) ────────────────────────────

describe('buildBSCPerspectiveMap with edge traversal', () => {
  it('propagates perspective from BSCPerspective to BSCObjective via hasPerspectiveObjective', () => {
    const perspNode = makeNode('bsc:FinPersp', 'BSCPerspective', 'class', 'bsc', { perspectiveType: 'Financial' });
    const objNode = makeNode('bsc:Obj1', 'BSCObjective', 'class', 'bsc');
    const unrelated = makeNode('org:Org', 'Organisation', 'core', 'org');
    const edges = [
      { from: 'bsc:FinPersp', to: 'bsc:Obj1', label: 'hasPerspectiveObjective' },
    ];
    const map = buildBSCPerspectiveMap([perspNode, objNode, unrelated], edges);
    expect(map.get('bsc:FinPersp')).toBe('financial');
    expect(map.get('bsc:Obj1')).toBe('financial');
    expect(map.has('org:Org')).toBe(false);
  });

  it('propagates perspective through measuredByKPI chain', () => {
    const perspNode = makeNode('bsc:CustPersp', 'BSCPerspective', 'class', 'bsc', { perspectiveType: 'Customer' });
    const objNode = makeNode('bsc:Obj2', 'BSCObjective', 'class', 'bsc');
    const kpiNode = makeNode('kpi:CustSat', 'KPI', 'class', 'kpi');
    const edges = [
      { from: 'bsc:CustPersp', to: 'bsc:Obj2', label: 'hasPerspectiveObjective' },
      { from: 'bsc:Obj2', to: 'kpi:CustSat', label: 'measuredByKPI' },
    ];
    const map = buildBSCPerspectiveMap([perspNode, objNode, kpiNode], edges);
    expect(map.get('bsc:CustPersp')).toBe('customer');
    expect(map.get('bsc:Obj2')).toBe('customer');
    expect(map.get('kpi:CustSat')).toBe('customer');
  });

  it('propagates with namespaced edge labels (bsc:hasPerspectiveObjective)', () => {
    const perspNode = makeNode('bsc:IntPersp', 'BSCPerspective', 'class', 'bsc', { perspectiveType: 'Internal Process' });
    const objNode = makeNode('bsc:Obj3', 'BSCObjective', 'class', 'bsc');
    const edges = [
      { from: 'bsc:IntPersp', to: 'bsc:Obj3', label: 'bsc:hasPerspectiveObjective' },
    ];
    const map = buildBSCPerspectiveMap([perspNode, objNode], edges);
    expect(map.get('bsc:Obj3')).toBe('internal-process');
  });

  it('does not propagate across unrelated edge labels', () => {
    const perspNode = makeNode('bsc:FinPersp', 'BSCPerspective', 'class', 'bsc', { perspectiveType: 'Financial' });
    const other = makeNode('org:Org', 'Organisation', 'core', 'org');
    const edges = [
      { from: 'bsc:FinPersp', to: 'org:Org', label: 'unrelatedEdge' },
    ];
    const map = buildBSCPerspectiveMap([perspNode, other], edges);
    expect(map.has('org:Org')).toBe(false);
  });

  it('limits propagation depth to prevent infinite loops', () => {
    // Circular edges should not cause infinite loop
    const a = makeNode('a', 'BSCPerspective', 'class', 'bsc', { perspectiveType: 'Financial' });
    const b = makeNode('b', 'BSCObjective', 'class', 'bsc');
    const c = makeNode('c', 'KPI', 'class', 'kpi');
    const edges = [
      { from: 'a', to: 'b', label: 'hasPerspectiveObjective' },
      { from: 'b', to: 'c', label: 'measuredByKPI' },
      { from: 'c', to: 'a', label: 'hasPerspectiveObjective' }, // circular
    ];
    const map = buildBSCPerspectiveMap([a, b, c], edges);
    expect(map.get('a')).toBe('financial');
    expect(map.get('b')).toBe('financial');
    expect(map.get('c')).toBe('financial');
  });

  it('returns same results as without edges when no BSC edges present', () => {
    const nodes = [FINANCIAL_NODE, CUSTOMER_NODE, UNMAPPED_NODE];
    const mapNoEdges = buildBSCPerspectiveMap(nodes);
    const mapWithEdges = buildBSCPerspectiveMap(nodes, []);
    expect(mapNoEdges.size).toBe(mapWithEdges.size);
  });
});

// ─── computeBSCPerspectiveCounts ─────────────────────────────────────────────

describe('computeBSCPerspectiveCounts', () => {
  it('counts perspectives correctly', () => {
    const nodes = [FINANCIAL_NODE, CUSTOMER_NODE, INTERNAL_NODE, LEARNING_NODE, UNMAPPED_NODE];
    const perspMap = buildBSCPerspectiveMap(nodes);
    const counts = computeBSCPerspectiveCounts(nodes, perspMap);
    expect(counts.financial).toBe(1);
    expect(counts.customer).toBe(1);
    expect(counts['internal-process']).toBe(1);
    expect(counts['learning-growth']).toBe(1);
    expect(counts._unclassified).toBe(1);
  });

  it('returns zero counts for null inputs', () => {
    const counts = computeBSCPerspectiveCounts(null, null);
    expect(counts.financial).toBe(0);
    expect(counts._unclassified).toBe(0);
  });

  it('counts edge-propagated perspectives', () => {
    const perspNode = makeNode('bsc:FinPersp', 'BSCPerspective', 'class', 'bsc', { perspectiveType: 'Financial' });
    const objNode = makeNode('bsc:Obj1', 'BSCObjective', 'class', 'bsc');
    const edges = [{ from: 'bsc:FinPersp', to: 'bsc:Obj1', label: 'hasPerspectiveObjective' }];
    const perspMap = buildBSCPerspectiveMap([perspNode, objNode], edges);
    const counts = computeBSCPerspectiveCounts([perspNode, objNode], perspMap);
    expect(counts.financial).toBe(2);
  });
});

// ─── getBSCBorderStyles ──────────────────────────────────────────────────────

describe('getBSCBorderStyles', () => {
  it('returns border styles for visible nodes with perspectives', () => {
    const nodes = [FINANCIAL_NODE, CUSTOMER_NODE, UNMAPPED_NODE];
    const perspMap = buildBSCPerspectiveMap(nodes);
    const visible = new Set([FINANCIAL_NODE.id, CUSTOMER_NODE.id, UNMAPPED_NODE.id]);
    const styles = getBSCBorderStyles(visible, perspMap);
    expect(styles.has(FINANCIAL_NODE.id)).toBe(true);
    expect(styles.get(FINANCIAL_NODE.id).borderColor).toBe('#4CAF50');
    expect(styles.get(FINANCIAL_NODE.id).borderWidth).toBe(3);
    expect(styles.has(CUSTOMER_NODE.id)).toBe(true);
    expect(styles.has(UNMAPPED_NODE.id)).toBe(false);
  });

  it('returns empty map for null inputs', () => {
    expect(getBSCBorderStyles(null, null).size).toBe(0);
  });

  it('returns empty map for nodes not in visible set', () => {
    const nodes = [FINANCIAL_NODE];
    const perspMap = buildBSCPerspectiveMap(nodes);
    const styles = getBSCBorderStyles(new Set(), perspMap);
    expect(styles.size).toBe(0);
  });
});

// ─── buildAuthorityChain (S9G.1.3) ──────────────────────────────────────────

describe('buildAuthorityChain', () => {
  it('builds chain from role upward via reportsTo edges', () => {
    const ceo = makeNode('rrr:CEO', 'ExecutiveRole', 'class', 'rrr');
    const cfo = makeNode('rrr:CFO', 'ExecutiveRole', 'class', 'rrr');
    const manager = makeNode('rrr:Mgr', 'FunctionalRole', 'class', 'rrr');
    const nodes = [ceo, cfo, manager];
    const edges = [
      { from: 'rrr:Mgr', to: 'rrr:CFO', label: 'reportsTo' },
      { from: 'rrr:CFO', to: 'rrr:CEO', label: 'reportsTo' },
    ];
    const roleMap = buildRoleEntityMap(nodes, edges);
    const chain = buildAuthorityChain('rrr:Mgr', edges, roleMap);
    expect(chain.length).toBe(3);
    expect(chain[0].id).toBe('rrr:Mgr');
    expect(chain[1].id).toBe('rrr:CFO');
    expect(chain[2].id).toBe('rrr:CEO');
  });

  it('returns single-element chain for top-level role', () => {
    const ceo = makeNode('rrr:CEO', 'ExecutiveRole', 'class', 'rrr');
    const roleMap = buildRoleEntityMap([ceo], []);
    const chain = buildAuthorityChain('rrr:CEO', [], roleMap);
    expect(chain.length).toBe(1);
    expect(chain[0].id).toBe('rrr:CEO');
  });

  it('handles circular authority (prevents infinite loop)', () => {
    const a = makeNode('rrr:A', 'ExecutiveRole', 'class', 'rrr');
    const b = makeNode('rrr:B', 'ExecutiveRole', 'class', 'rrr');
    const edges = [
      { from: 'rrr:A', to: 'rrr:B', label: 'reportsTo' },
      { from: 'rrr:B', to: 'rrr:A', label: 'reportsTo' },
    ];
    const roleMap = buildRoleEntityMap([a, b], edges);
    const chain = buildAuthorityChain('rrr:A', edges, roleMap);
    expect(chain.length).toBe(2); // stops at cycle
  });

  it('returns empty array for null inputs', () => {
    expect(buildAuthorityChain(null, [], new Map()).length).toBe(0);
    expect(buildAuthorityChain('x', null, new Map()).length).toBe(0);
    expect(buildAuthorityChain('x', [], null).length).toBe(0);
  });
});

// ─── formatRACIBadgeLabel ────────────────────────────────────────────────────

describe('formatRACIBadgeLabel', () => {
  it('formats single badge', () => {
    const badges = [{ type: 'accountable', roleId: 'rrr:CEO', roleLabel: 'CEO' }];
    expect(formatRACIBadgeLabel(badges)).toBe('[A:CEO]');
  });

  it('formats multiple badges', () => {
    const badges = [
      { type: 'accountable', roleId: 'rrr:CEO', roleLabel: 'CEO' },
      { type: 'responsible', roleId: 'rrr:CFO', roleLabel: 'CFO' },
    ];
    expect(formatRACIBadgeLabel(badges)).toBe('[A:CEO R:CFO]');
  });

  it('returns empty string for no badges', () => {
    expect(formatRACIBadgeLabel([])).toBe('');
    expect(formatRACIBadgeLabel(null)).toBe('');
  });

  it('formats all 4 RACI types', () => {
    const badges = [
      { type: 'accountable', roleId: 'a', roleLabel: 'CEO' },
      { type: 'responsible', roleId: 'b', roleLabel: 'CTO' },
      { type: 'consulted', roleId: 'c', roleLabel: 'Legal' },
      { type: 'informed', roleId: 'd', roleLabel: 'Board' },
    ];
    expect(formatRACIBadgeLabel(badges)).toBe('[A:CEO R:CTO C:Legal I:Board]');
  });
});

// ─── computeStrategicLensFilter with BSC edges + Role (S9G.1.2/S9G.1.3) ────

describe('computeStrategicLensFilter — BSC edge propagation', () => {
  it('BSC filter via edge propagation resolves children to visible', () => {
    const perspNode = makeNode('bsc:FinPersp', 'BSCPerspective', 'class', 'bsc', { perspectiveType: 'Financial' });
    const objNode = makeNode('bsc:Obj1', 'BSCObjective', 'class', 'bsc');
    const kpiNode = makeNode('kpi:RevKPI', 'KPI', 'class', 'kpi');
    const other = makeNode('org:Org', 'Organisation', 'core', 'org');
    const nodes = [perspNode, objNode, kpiNode, other];
    const edges = [
      { from: 'bsc:FinPersp', to: 'bsc:Obj1', label: 'hasPerspectiveObjective' },
      { from: 'bsc:Obj1', to: 'kpi:RevKPI', label: 'measuredByKPI' },
    ];
    const lensState = {
      vesmTiersActive: new Set(),
      bscPerspectivesActive: new Set(['financial']),
      roleFilterActive: false,
      activeRoleRef: null,
      raciFilterMode: null,
    };
    const { visible } = computeStrategicLensFilter(nodes, lensState, { edges });
    expect(visible.has('bsc:FinPersp')).toBe(true);
    expect(visible.has('bsc:Obj1')).toBe(true);
    expect(visible.has('kpi:RevKPI')).toBe(true);
    expect(visible.has('org:Org')).toBe(false);
  });
});

describe('computeStrategicLensFilter — Role + RACI compound', () => {
  it('role filter AND VESM intersection', () => {
    const ceo = makeNode('rrr:CEO', 'ExecutiveRole', 'class', 'rrr');
    const vision = makeNode('vsom:Vision', 'Vision', 'core', 'vsom');
    const budget = makeNode('kpi:Budget', 'KPI', 'class', 'kpi');
    const nodes = [ceo, vision, budget];
    const edges = [
      { from: 'vsom:Vision', to: 'rrr:CEO', label: 'ownedBy' },
    ];
    const lensState = {
      vesmTiersActive: new Set(['vision']),
      vesmScopeLevel: 'all',
      bscPerspectivesActive: new Set(),
      roleFilterActive: true,
      activeRoleRef: 'rrr:CEO',
      raciFilterMode: null,
    };
    const { visible } = computeStrategicLensFilter(nodes, lensState, { edges });
    // Vision is vision tier AND owned by CEO → visible
    expect(visible.has('vsom:Vision')).toBe(true);
    // CEO is execution tier (not vision) → dimmed by VESM
    expect(visible.has('rrr:CEO')).toBe(false);
    // Budget is metrics tier, not owned → dimmed by both
    expect(visible.has('kpi:Budget')).toBe(false);
  });
});

// ─── Constants structure ────────────────────────────────────────────────────

describe('VESM_TIERS structure', () => {
  it('has exactly 4 tiers', () => {
    expect(Object.keys(VESM_TIERS).length).toBe(4);
  });

  it('each tier has required fields', () => {
    for (const [key, tier] of Object.entries(VESM_TIERS)) {
      expect(tier.name).toBeTruthy();
      expect(tier.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(Array.isArray(tier.ontologies)).toBe(true);
      expect(tier.ontologies.length).toBeGreaterThan(0);
      expect(Array.isArray(tier.entityTypes)).toBe(true);
      expect(tier.entityTypes.length).toBeGreaterThan(0);
    }
  });
});

describe('BSC_PERSPECTIVES structure', () => {
  it('has exactly 4 perspectives', () => {
    expect(Object.keys(BSC_PERSPECTIVES).length).toBe(4);
  });

  it('each perspective has required fields', () => {
    for (const [key, persp] of Object.entries(BSC_PERSPECTIVES)) {
      expect(persp.name).toBeTruthy();
      expect(persp.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(persp.shortCode).toBeTruthy();
    }
  });
});

describe('RACI_BADGES structure', () => {
  it('has exactly 4 badge types', () => {
    expect(Object.keys(RACI_BADGES).length).toBe(4);
  });

  it('each badge has required fields', () => {
    for (const [key, badge] of Object.entries(RACI_BADGES)) {
      expect(badge.label).toBeTruthy();
      expect(badge.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(badge.tooltip).toBeTruthy();
    }
  });
});
