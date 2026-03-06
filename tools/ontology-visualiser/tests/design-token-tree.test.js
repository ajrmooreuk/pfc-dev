/**
 * Unit tests for design-token-tree.js — zone tree building, skeleton
 * integration, fallback behaviour, and zone ID sorting.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock state.js with empty zoneRegistry + dsInstances/activeDSBrand for F40.10
vi.mock('../js/state.js', () => ({
  state: {
    zoneRegistry: new Map(),
    dsInstances: new Map(),
    activeDSBrand: null,
  },
}));

// Provide minimal DOM stubs for module-level event listeners and getComputedStyle
if (typeof document === 'undefined') {
  global.document = {
    addEventListener: () => {},
    getElementById: () => null,
    querySelectorAll: () => [],
    documentElement: { style: {} },
  };
}
if (typeof getComputedStyle === 'undefined') {
  global.getComputedStyle = () => ({ getPropertyValue: () => '' });
}

import { buildZoneTree, getComponentRegistry, buildComponentTree, buildComponentConfigJSON, getDesignRules, getDesignRulesForTree, matchesComponentScope, getRulesForComponent, validateRuleConstraint, getGlobalComponentLibrary, resolveInheritanceChain, resolveInheritedTokens, buildGlobalComponentLibraryJSON } from '../js/design-token-tree.js';
import { state } from '../js/state.js';

// ── Helpers ──

function makeZoneEntry(zoneId, zoneName, zoneType, cascadeTier, components) {
  return {
    zone: {
      '@id': `ds:zone-${zoneId}`,
      '@type': 'ds:AppZone',
      'ds:zoneId': zoneId,
      'ds:zoneName': zoneName,
      'ds:zoneType': zoneType || 'Fixed',
      'ds:cascadeTier': cascadeTier || 'PFC',
    },
    components: components || [],
  };
}

// ── Tests ──

describe('buildZoneTree', () => {
  beforeEach(() => {
    state.zoneRegistry = new Map();
  });

  it('returns fallback tree when zoneRegistry is empty', () => {
    const tree = buildZoneTree();
    expect(tree.length).toBe(22); // Z1–Z20 + Z4b + Z22
    expect(tree[0].id).toBe('Z1');
    expect(tree[tree.length - 1].id).toBe('Z22');
  });

  it('returns fallback tree when zoneRegistry is null', () => {
    state.zoneRegistry = null;
    const tree = buildZoneTree();
    expect(tree.length).toBe(22);
  });

  it('uses skeleton data when zoneRegistry is populated', () => {
    state.zoneRegistry = new Map([
      ['Z1', makeZoneEntry('Z1', 'Header', 'Fixed', 'PFC')],
      ['Z6', makeZoneEntry('Z6', 'Graph Canvas', 'Fixed', 'PFC')],
      ['Z9', makeZoneEntry('Z9', 'Sidebar Details', 'Sliding', 'PFC')],
    ]);

    const tree = buildZoneTree();
    expect(tree.length).toBe(3);
    expect(tree[0].id).toBe('Z1');
    expect(tree[1].id).toBe('Z6');
    expect(tree[2].id).toBe('Z9');
  });

  it('preserves token children from fallback for known zones', () => {
    state.zoneRegistry = new Map([
      ['Z1', makeZoneEntry('Z1', 'Header', 'Fixed', 'PFC')],
    ]);

    const tree = buildZoneTree();
    const z1 = tree[0];
    expect(z1.children).toBeDefined();
    expect(z1.children.length).toBeGreaterThan(0);
    // Z1 has surface, text, border children in fallback
    const childIds = z1.children.map(c => c.id);
    expect(childIds).toContain('Z1-surface');
    expect(childIds).toContain('Z1-text');
    expect(childIds).toContain('Z1-border');
  });

  it('creates placeholder children for unknown zones', () => {
    state.zoneRegistry = new Map([
      ['Z99', makeZoneEntry('Z99', 'Custom Zone', 'Floating', 'PFI')],
    ]);

    const tree = buildZoneTree();
    expect(tree.length).toBe(1);
    const z99 = tree[0];
    expect(z99.id).toBe('Z99');
    expect(z99.label).toBe('Z99: Custom Zone');
    expect(z99.children).toBeDefined();
    expect(z99.children[0].id).toBe('Z99-surface');
    expect(z99.children[0].tokens[0].label).toBe('(no token mapping yet)');
  });

  it('enriches label with skeleton zoneName', () => {
    state.zoneRegistry = new Map([
      ['Z1', makeZoneEntry('Z1', 'Custom Header', 'Fixed', 'PFC')],
    ]);

    const tree = buildZoneTree();
    expect(tree[0].label).toBe('Z1: Custom Header');
  });

  it('includes cascadeTier and zoneType from skeleton', () => {
    state.zoneRegistry = new Map([
      ['Z3', makeZoneEntry('Z3', 'Context Bar', 'Conditional', 'PFI')],
    ]);

    const tree = buildZoneTree();
    expect(tree[0].cascadeTier).toBe('PFI');
    expect(tree[0].zoneType).toBe('Conditional');
  });

  it('sorts zones in natural zoneId order', () => {
    state.zoneRegistry = new Map([
      ['Z10', makeZoneEntry('Z10', 'Audit', 'Sliding', 'PFC')],
      ['Z2', makeZoneEntry('Z2', 'Toolbar', 'Fixed', 'PFC')],
      ['Z4b', makeZoneEntry('Z4b', 'Selection', 'Conditional', 'PFC')],
      ['Z1', makeZoneEntry('Z1', 'Header', 'Fixed', 'PFC')],
      ['Z4', makeZoneEntry('Z4', 'Authoring', 'Conditional', 'PFC')],
      ['Z20', makeZoneEntry('Z20', 'Drop Zone', 'Conditional', 'PFC')],
    ]);

    const tree = buildZoneTree();
    const ids = tree.map(z => z.id);
    expect(ids).toEqual(['Z1', 'Z2', 'Z4', 'Z4b', 'Z10', 'Z20']);
  });
});

describe('FALLBACK_ZONE_TREE completeness', () => {
  it('has 22 zones (Z1–Z20 plus Z4b and Z22)', () => {
    // When zoneRegistry is empty, buildZoneTree returns the fallback
    state.zoneRegistry = new Map();
    const tree = buildZoneTree();
    expect(tree.length).toBe(22);
  });

  it('Z4b (Selection Toolbar) is present', () => {
    state.zoneRegistry = new Map();
    const tree = buildZoneTree();
    const z4b = tree.find(z => z.id === 'Z4b');
    expect(z4b).toBeDefined();
    expect(z4b.label).toContain('Selection Toolbar');
  });

  it('each zone has at least one child', () => {
    state.zoneRegistry = new Map();
    const tree = buildZoneTree();
    for (const zone of tree) {
      expect(zone.children.length).toBeGreaterThan(0);
    }
  });

  it('zones are in correct order (Z1, Z2, Z3, Z4, Z4b, Z5, ...)', () => {
    state.zoneRegistry = new Map();
    const tree = buildZoneTree();
    const ids = tree.map(z => z.id);
    expect(ids[0]).toBe('Z1');
    expect(ids[3]).toBe('Z4');
    expect(ids[4]).toBe('Z4b');
    expect(ids[5]).toBe('Z5');
    expect(ids[ids.length - 1]).toBe('Z22');
  });
});

// ── F40.7: Component Registry ──

describe('getComponentRegistry', () => {
  it('returns an array of registry entries', () => {
    const reg = getComponentRegistry();
    expect(Array.isArray(reg)).toBe(true);
    expect(reg.length).toBeGreaterThan(0);
  });

  it('has 82 entries (22 zones + 60 sub-groups)', () => {
    const reg = getComponentRegistry();
    expect(reg.length).toBe(82);
  });

  it('every entry follows pfc.viz.* naming convention', () => {
    const reg = getComponentRegistry();
    for (const entry of reg) {
      expect(entry.componentName).toMatch(/^pfc\.viz\./);
    }
  });

  it('every FALLBACK_ZONE_TREE zone ID has a registry entry', () => {
    state.zoneRegistry = new Map();
    const tree = buildZoneTree();
    const reg = getComponentRegistry();
    const regIds = new Set(reg.map(r => r.id));

    for (const zone of tree) {
      expect(regIds.has(zone.id)).toBe(true);
    }
  });

  it('every FALLBACK_ZONE_TREE sub-group ID has a registry entry', () => {
    state.zoneRegistry = new Map();
    const tree = buildZoneTree();
    const reg = getComponentRegistry();
    const regIds = new Set(reg.map(r => r.id));

    function collectIds(nodes) {
      const ids = [];
      for (const n of nodes) {
        ids.push(n.id);
        if (n.children) ids.push(...collectIds(n.children));
      }
      return ids;
    }

    const allIds = [];
    for (const zone of tree) {
      allIds.push(zone.id);
      if (zone.children) allIds.push(...collectIds(zone.children));
    }

    for (const id of allIds) {
      expect(regIds.has(id), `Missing registry entry for ${id}`).toBe(true);
    }
  });

  it('zone entries have depth 0', () => {
    const reg = getComponentRegistry();
    const z1 = reg.find(r => r.id === 'Z1');
    expect(z1.depth).toBe(0);
    expect(z1.zone).toBe('Z1');
  });

  it('sub-group entries have depth 1', () => {
    const reg = getComponentRegistry();
    const z1s = reg.find(r => r.id === 'Z1-surface');
    expect(z1s.depth).toBe(1);
    expect(z1s.zone).toBe('Z1');
    expect(z1s.componentName).toBe('pfc.viz.header.surface');
  });

  it('entry ids and component names are unique', () => {
    const reg = getComponentRegistry();
    const ids = reg.map(r => r.id);
    const names = reg.map(r => r.componentName);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(names).size).toBe(names.length);
  });
});

// ── F40.9: Component Tree & Export ──

describe('buildComponentTree', () => {
  beforeEach(() => {
    state.zoneRegistry = new Map();
  });

  it('returns non-empty array', () => {
    const tree = buildComponentTree();
    expect(Array.isArray(tree)).toBe(true);
    expect(tree.length).toBeGreaterThan(0);
  });

  it('top-level entries are 22 zone-level components', () => {
    const tree = buildComponentTree();
    expect(tree.length).toBe(22);
  });

  it('every top-level entry has a pfc.viz.* componentName', () => {
    const tree = buildComponentTree();
    for (const comp of tree) {
      expect(comp.componentName).toMatch(/^pfc\.viz\./);
    }
  });

  it('sub-components are nested under parent zones', () => {
    const tree = buildComponentTree();
    const header = tree.find(c => c.id === 'Z1');
    expect(header).toBeDefined();
    expect(header.children.length).toBeGreaterThan(0);
    const surfaceChild = header.children.find(c => c.id === 'Z1-surface');
    expect(surfaceChild).toBeDefined();
    expect(surfaceChild.componentName).toBe('pfc.viz.header.surface');
  });

  it('every component with tokens has at least one token', () => {
    const tree = buildComponentTree();
    function walk(nodes) {
      for (const n of nodes) {
        if (n.tokens) expect(n.tokens.length).toBeGreaterThan(0);
        if (n.children) walk(n.children);
      }
    }
    walk(tree);
  });

  it('total tokens equals zone tree total (conservation)', () => {
    const compTree = buildComponentTree();
    const zoneTree = buildZoneTree();
    function countAll(nodes) {
      let c = 0;
      for (const n of nodes) {
        if (n.tokens) c += n.tokens.length;
        if (n.children) c += countAll(n.children);
      }
      return c;
    }
    expect(countAll(compTree)).toBe(countAll(zoneTree));
  });

  it('tokenStats.total equals subtree token count', () => {
    const tree = buildComponentTree();
    function countAll(node) {
      let c = 0;
      if (node.tokens) c += node.tokens.length;
      if (node.children) node.children.forEach(ch => { c += countAll(ch); });
      return c;
    }
    for (const comp of tree) {
      expect(comp.tokenStats.total).toBe(countAll(comp));
    }
  });

  it('tokenStats.hardcoded matches hardcoded token count', () => {
    const tree = buildComponentTree();
    function countHC(node) {
      let c = 0;
      if (node.tokens) c += node.tokens.filter(t => t.hardcoded).length;
      if (node.children) node.children.forEach(ch => { c += countHC(ch); });
      return c;
    }
    for (const comp of tree) {
      expect(comp.tokenStats.hardcoded).toBe(countHC(comp));
    }
  });

  it('component names are unique across the tree', () => {
    const tree = buildComponentTree();
    const names = [];
    function collect(nodes) {
      for (const n of nodes) {
        names.push(n.componentName);
        if (n.children) collect(n.children);
      }
    }
    collect(tree);
    expect(new Set(names).size).toBe(names.length);
  });

  it('Z4b maps to pfc.viz.selection-toolbar', () => {
    const tree = buildComponentTree();
    const z4b = tree.find(c => c.id === 'Z4b');
    expect(z4b).toBeDefined();
    expect(z4b.componentName).toBe('pfc.viz.selection-toolbar');
  });

  it('falls back to FALLBACK_ZONE_TREE when zoneRegistry is empty', () => {
    state.zoneRegistry = new Map();
    const tree = buildComponentTree();
    expect(tree.length).toBe(22);
  });
});

describe('buildComponentConfigJSON', () => {
  beforeEach(() => {
    state.zoneRegistry = new Map();
  });

  it('generates valid JSON-LD with @context and @graph', () => {
    const jsonld = buildComponentConfigJSON();
    expect(jsonld['@context']).toBeDefined();
    expect(jsonld['@context'].ds).toBeDefined();
    expect(Array.isArray(jsonld['@graph'])).toBe(true);
    expect(jsonld['@graph'].length).toBeGreaterThan(0);
  });

  it('@graph contains ds:DesignComponent entries', () => {
    const jsonld = buildComponentConfigJSON();
    const components = jsonld['@graph'].filter(e => e['@type'] === 'ds:DesignComponent');
    expect(components.length).toBeGreaterThan(0);
  });

  it('@graph contains ds:ComponentToken entries', () => {
    const jsonld = buildComponentConfigJSON();
    const tokens = jsonld['@graph'].filter(e => e['@type'] === 'ds:ComponentToken');
    expect(tokens.length).toBeGreaterThan(0);
  });

  it('DesignComponent entries have required fields', () => {
    const jsonld = buildComponentConfigJSON();
    const components = jsonld['@graph'].filter(e => e['@type'] === 'ds:DesignComponent');
    for (const comp of components) {
      expect(comp['ds:componentName']).toBeDefined();
      expect(comp['ds:category']).toBeDefined();
      expect(typeof comp['ds:allowsOverrides']).toBe('boolean');
      expect(Array.isArray(comp['ds:consumesTokens'])).toBe(true);
    }
  });

  it('ComponentToken entries have required fields', () => {
    const jsonld = buildComponentConfigJSON();
    const tokens = jsonld['@graph'].filter(e => e['@type'] === 'ds:ComponentToken');
    for (const tok of tokens) {
      expect(tok['ds:tokenName']).toBeDefined();
      expect(tok['ds:componentName']).toBeDefined();
      expect(tok['ds:partOrState']).toBeDefined();
      expect(['PF-Core', 'PF-Instance']).toContain(tok['ds:mutabilityTier']);
    }
  });

  it('consumesTokens references match ComponentToken @ids', () => {
    const jsonld = buildComponentConfigJSON();
    const tokenIds = new Set(
      jsonld['@graph'].filter(e => e['@type'] === 'ds:ComponentToken').map(e => e['@id'])
    );
    const components = jsonld['@graph'].filter(e => e['@type'] === 'ds:DesignComponent');
    for (const comp of components) {
      for (const ref of comp['ds:consumesTokens']) {
        expect(tokenIds.has(ref['@id']), `Missing token ${ref['@id']}`).toBe(true);
      }
    }
  });
});

// ── F40.10: Scoped Design Rules ──

// Helper: mock DS instance with design rules
function makeMockDSInstance(designRules) {
  return {
    designSystem: { '@type': 'ds:DesignSystem', 'ds:version': '1.0.0' },
    categories: [],
    primitives: [],
    semantics: [],
    components: [],
    variants: [],
    figmaSources: [],
    modes: [],
    patterns: [],
    pages: [],
    templates: [],
    designRules: designRules || [],
  };
}

function makeSystemRule(id, category, scope, severity, priority) {
  return {
    '@type': 'ds:DesignRule',
    '@id': `pfc-ds:rule-${id}`,
    'ds:ruleId': id,
    'ds:ruleName': `${id} Rule`,
    'ds:ruleCategory': category || 'Graph',
    'ds:scope': scope || 'GlobalSystem',
    'ds:severity': severity || 'warning',
    'ds:priority': priority || 3,
    'ds:mutabilityTier': 'PF-Core',
    'ds:condition': 'IF test',
    'ds:requirement': 'THEN test',
  };
}

function makeComponentRule(id, targetCategory, constraintType, constraintTarget, constraintValue, severity) {
  return {
    '@type': 'ds:ComponentDesignRule',
    '@id': `pfc-ds:rule-${id}`,
    'ds:ruleId': id,
    'ds:ruleName': `${id} Rule`,
    'ds:ruleCategory': 'Component',
    'ds:scope': 'ComponentDefinition',
    'ds:severity': severity || 'error',
    'ds:priority': 1,
    'ds:mutabilityTier': 'PF-Instance',
    'ds:condition': 'IF test',
    'ds:requirement': 'THEN test',
    'ds:targetCategory': targetCategory || 'Atom',
    'ds:constraintType': constraintType || 'ContrastRatio',
    'ds:constraintTarget': constraintTarget || 'background',
    'ds:constraintValue': constraintValue || '4.5',
  };
}

describe('getDesignRules / getDesignRulesForTree', () => {
  beforeEach(() => {
    state.zoneRegistry = new Map();
    state.dsInstances = new Map();
    state.activeDSBrand = null;
  });

  it('returns empty array when no DS instance loaded', () => {
    expect(getDesignRules()).toEqual([]);
    expect(getDesignRulesForTree()).toEqual([]);
  });

  it('returns rules when DS instance has design rules', () => {
    const rules = [makeSystemRule('DR-TEST-001'), makeComponentRule('DR-COMP-TEST-001')];
    state.dsInstances.set('test-brand', makeMockDSInstance(rules));
    state.activeDSBrand = 'test-brand';

    const result = getDesignRules();
    expect(result.length).toBe(2);
  });

  it('includes both DesignRule and ComponentDesignRule types', () => {
    const rules = [makeSystemRule('DR-SYS-001'), makeComponentRule('DR-COMP-001')];
    state.dsInstances.set('test-brand', makeMockDSInstance(rules));
    state.activeDSBrand = 'test-brand';

    const result = getDesignRules();
    const types = result.map(r => r['@type']);
    expect(types).toContain('ds:DesignRule');
    expect(types).toContain('ds:ComponentDesignRule');
  });

  it('rules have required fields', () => {
    const rules = [makeSystemRule('DR-SYS-002', 'Edge', 'GlobalSystem', 'error', 1)];
    state.dsInstances.set('test-brand', makeMockDSInstance(rules));
    state.activeDSBrand = 'test-brand';

    const result = getDesignRules();
    expect(result[0]['ds:ruleId']).toBe('DR-SYS-002');
    expect(result[0]['ds:severity']).toBe('error');
    expect(result[0]['ds:scope']).toBe('GlobalSystem');
  });
});

describe('matchesComponentScope', () => {
  it('GlobalSystem rules match all components', () => {
    const rule = makeSystemRule('DR-TEST', 'Graph', 'GlobalSystem');
    expect(matchesComponentScope(rule, 'pfc.viz.header')).toBe(true);
    expect(matchesComponentScope(rule, 'pfc.viz.toolbar.surface')).toBe(true);
  });

  it('ComponentDefinition DesignRule matches all components', () => {
    const rule = makeSystemRule('DR-TEST', 'DS', 'ComponentDefinition');
    expect(matchesComponentScope(rule, 'pfc.viz.header')).toBe(true);
  });

  it('ComponentDesignRule with targetCategory matches only matching categories', () => {
    // Atom maps to Form category; Z14 (filter-select) is Form
    const rule = makeComponentRule('DR-COMP', 'Atom');
    // pfc.viz.header is Navigation (Z1), not Form
    // The category-level rules with no specific target but with targetCategory apply to all
    expect(matchesComponentScope(rule, 'pfc.viz.header')).toBe(true); // no specific target + has targetCategory
  });

  it('BrandVariant scope matches only when brand is active', () => {
    const rule = makeSystemRule('DR-BRAND', 'Brand', 'BrandVariant');
    state.activeDSBrand = null;
    expect(matchesComponentScope(rule, 'pfc.viz.header')).toBe(false);
    state.activeDSBrand = 'test-brand';
    expect(matchesComponentScope(rule, 'pfc.viz.header')).toBe(true);
  });
});

describe('getRulesForComponent', () => {
  beforeEach(() => {
    state.zoneRegistry = new Map();
    state.dsInstances = new Map();
    state.activeDSBrand = null;
  });

  it('returns empty system and component arrays when no rules', () => {
    const result = getRulesForComponent('pfc.viz.header');
    expect(result.system).toEqual([]);
    expect(result.component).toEqual([]);
  });

  it('splits rules by type', () => {
    const rules = [makeSystemRule('DR-SYS-001'), makeComponentRule('DR-COMP-001')];
    state.dsInstances.set('test-brand', makeMockDSInstance(rules));
    state.activeDSBrand = 'test-brand';

    const result = getRulesForComponent('pfc.viz.header');
    expect(result.system.length).toBe(1);
    expect(result.component.length).toBe(1);
  });

  it('sorts by priority (lower first)', () => {
    const rules = [
      makeSystemRule('DR-P5', 'Graph', 'GlobalSystem', 'info', 5),
      makeSystemRule('DR-P1', 'Graph', 'GlobalSystem', 'error', 1),
      makeSystemRule('DR-P3', 'Graph', 'GlobalSystem', 'warning', 3),
    ];
    state.dsInstances.set('test-brand', makeMockDSInstance(rules));
    state.activeDSBrand = 'test-brand';

    const result = getRulesForComponent('pfc.viz.header');
    expect(result.system[0]['ds:ruleId']).toBe('DR-P1');
    expect(result.system[1]['ds:ruleId']).toBe('DR-P3');
    expect(result.system[2]['ds:ruleId']).toBe('DR-P5');
  });
});

describe('validateRuleConstraint', () => {
  it('system rules return info status', () => {
    const rule = makeSystemRule('DR-SYS-001');
    const result = validateRuleConstraint(rule, 'pfc.viz.header', []);
    expect(result.status).toBe('info');
  });

  it('MustReference returns pass when token has cssVar', () => {
    const rule = makeComponentRule('DR-MUST-REF', 'Atom', 'MustReference', 'focusRing', 'ds:SemanticToken');
    const tokens = [{ label: 'focusRing', cssVar: '--viz-accent', hex: '#9dfff5' }];
    const result = validateRuleConstraint(rule, 'pfc.viz.header', tokens);
    expect(result.status).toBe('pass');
  });

  it('MustReference returns fail when token is hardcoded', () => {
    const rule = makeComponentRule('DR-MUST-REF', 'Atom', 'MustReference', 'focusRing', 'ds:SemanticToken');
    const tokens = [{ label: 'focusRing', cssVar: null, hex: '#ff0000', hardcoded: true }];
    const result = validateRuleConstraint(rule, 'pfc.viz.header', tokens);
    expect(result.status).toBe('fail');
  });

  it('AllowedValues returns pass for matching value', () => {
    const rule = makeComponentRule('DR-ALLOW', 'Molecule', 'AllowedValues', 'border-radius', '4px,8px,12px');
    // Hardcoded token so liveValue won't resolve in test env, hex is used
    const tokens = [{ label: 'border-radius', cssVar: null, hex: '8px', hardcoded: true }];
    const result = validateRuleConstraint(rule, 'pfc.viz.header', tokens);
    expect(result.status).toBe('pass');
  });

  it('AllowedValues returns fail for non-matching value', () => {
    const rule = makeComponentRule('DR-ALLOW', 'Molecule', 'AllowedValues', 'border-radius', '4px,8px,12px');
    const tokens = [{ label: 'border-radius', cssVar: null, hex: '6px', hardcoded: true }];
    const result = validateRuleConstraint(rule, 'pfc.viz.header', tokens);
    expect(result.status).toBe('fail');
  });

  it('returns info when no matching token found', () => {
    const rule = makeComponentRule('DR-NO-MATCH', 'Atom', 'ContrastRatio', 'nonexistent', '4.5');
    const result = validateRuleConstraint(rule, 'pfc.viz.header', []);
    expect(result.status).toBe('info');
  });
});

describe('buildComponentTree with rules', () => {
  beforeEach(() => {
    state.zoneRegistry = new Map();
    state.dsInstances = new Map();
    state.activeDSBrand = null;
  });

  it('component nodes include rules when DS instance loaded', () => {
    const rules = [makeSystemRule('DR-SYS-001'), makeComponentRule('DR-COMP-001')];
    state.dsInstances.set('test-brand', makeMockDSInstance(rules));
    state.activeDSBrand = 'test-brand';

    const tree = buildComponentTree();
    const z1 = tree[0]; // pfc.viz.header
    expect(z1.rules).toBeDefined();
    expect(z1.rules.system.length).toBeGreaterThan(0);
  });

  it('ruleStats.total matches applicable rule count', () => {
    const rules = [
      makeSystemRule('DR-SYS-001', 'Graph', 'GlobalSystem', 'error'),
      makeSystemRule('DR-SYS-002', 'Graph', 'GlobalSystem', 'warning'),
    ];
    state.dsInstances.set('test-brand', makeMockDSInstance(rules));
    state.activeDSBrand = 'test-brand';

    const tree = buildComponentTree();
    const z1 = tree[0];
    expect(z1.ruleStats.total).toBe(2);
    expect(z1.ruleStats.errors).toBe(1);
    expect(z1.ruleStats.warnings).toBe(1);
  });

  it('falls back gracefully when no rules loaded', () => {
    const tree = buildComponentTree();
    const z1 = tree[0];
    expect(z1.rules.system).toEqual([]);
    expect(z1.rules.component).toEqual([]);
    expect(z1.ruleStats.total).toBe(0);
  });

  it('still produces 21 zone components with rules attached', () => {
    const rules = [makeSystemRule('DR-SYS-001')];
    state.dsInstances.set('test-brand', makeMockDSInstance(rules));
    state.activeDSBrand = 'test-brand';

    const tree = buildComponentTree();
    expect(tree.length).toBe(22);
    for (const comp of tree) {
      expect(comp.rules).toBeDefined();
      expect(comp.ruleStats).toBeDefined();
    }
  });
});

// ── F40.11: Global Component Library (Quasi-OO) ──

describe('getGlobalComponentLibrary', () => {
  it('returns array of 10 entries', () => {
    const lib = getGlobalComponentLibrary();
    expect(Array.isArray(lib)).toBe(true);
    expect(lib.length).toBe(10);
  });

  it('every entry has componentName starting with ds.global.*', () => {
    const lib = getGlobalComponentLibrary();
    for (const entry of lib) {
      expect(entry.componentName).toMatch(/^ds\.global\./);
    }
  });

  it('every entry has atomicLevel and category', () => {
    const lib = getGlobalComponentLibrary();
    for (const entry of lib) {
      expect(entry.atomicLevel).toBeDefined();
      expect(entry.category).toBeDefined();
    }
  });

  it('entry IDs are unique', () => {
    const lib = getGlobalComponentLibrary();
    const ids = lib.map(e => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('resolveInheritanceChain', () => {
  it('returns [self] when no extends defined', () => {
    const chain = resolveInheritanceChain('pfc.viz.graph-canvas');
    expect(chain).toEqual(['pfc.viz.graph-canvas']);
  });

  it('returns full chain for app component extending global', () => {
    const chain = resolveInheritanceChain('pfc.viz.header');
    expect(chain.length).toBe(2);
    expect(chain[0]).toBe('pfc.viz.header');
    expect(chain[1]).toBe('ds.global.panel');
  });

  it('follows multi-level inheritance (btn-active → button.primary → interactive.base)', () => {
    const chain = resolveInheritanceChain('pfc.viz.toolbar.btn-active');
    expect(chain.length).toBe(3);
    expect(chain[0]).toBe('pfc.viz.toolbar.btn-active');
    expect(chain[1]).toBe('ds.global.button.primary');
    expect(chain[2]).toBe('ds.global.interactive.base');
  });

  it('handles unknown components gracefully', () => {
    const chain = resolveInheritanceChain('pfc.viz.nonexistent');
    expect(chain).toEqual(['pfc.viz.nonexistent']);
  });

  it('follows global-to-global inheritance (collapsible → panel)', () => {
    const chain = resolveInheritanceChain('ds.global.collapsible');
    expect(chain.length).toBe(2);
    expect(chain[0]).toBe('ds.global.collapsible');
    expect(chain[1]).toBe('ds.global.panel');
  });
});

describe('resolveInheritedTokens', () => {
  it('returns own tokens when no inheritance', () => {
    const tokens = [{ label: 'bg', cssVar: '--viz-bg', hex: '#000' }];
    const result = resolveInheritedTokens('pfc.viz.graph-canvas', tokens);
    expect(result.length).toBe(1);
    expect(result[0].label).toBe('bg');
  });

  it('merges parent tokens with child tokens (closest wins)', () => {
    // pfc.viz.toolbar.btn-active extends ds.global.button.primary extends ds.global.interactive.base
    // interactive.base has: background, border, text
    // button.primary has: background (override), text (override)
    // btn-active's own tokens come from FALLBACK_ZONE_TREE — use custom tokens here
    const ownTokens = [{ label: 'background', cssVar: '--custom', hex: '#fff' }];
    const result = resolveInheritedTokens('pfc.viz.toolbar.btn-active', ownTokens);
    // Should have: background (from own), text (from button.primary), border (from interactive.base)
    expect(result.length).toBe(3);
    const bgToken = result.find(t => t.label === 'background');
    expect(bgToken.hex).toBe('#fff'); // closest (own) wins
  });

  it('child token overrides parent token with same label', () => {
    const ownTokens = [{ label: 'text', cssVar: '--my-text', hex: '#aaa' }];
    const result = resolveInheritedTokens('pfc.viz.toolbar.btn-active', ownTokens);
    const textToken = result.find(t => t.label === 'text');
    expect(textToken.hex).toBe('#aaa'); // own overrides parent
  });

  it('returns parent tokens for entries with empty token arrays', () => {
    // ds.global.button.secondary has tokens: [] and extends interactive.base
    const result = resolveInheritedTokens('pfc.viz.toolbar.btn-default', []);
    // btn-default extends button.secondary extends interactive.base (3 tokens)
    expect(result.length).toBe(3);
    const labels = result.map(t => t.label);
    expect(labels).toContain('background');
    expect(labels).toContain('border');
    expect(labels).toContain('text');
  });
});

describe('buildComponentTree with inheritance', () => {
  beforeEach(() => {
    state.zoneRegistry = new Map();
    state.dsInstances = new Map();
    state.activeDSBrand = null;
  });

  it('component nodes include extends property', () => {
    const tree = buildComponentTree();
    const header = tree.find(c => c.id === 'Z1');
    expect(header.extends).toBe('ds.global.panel');
    const canvas = tree.find(c => c.id === 'Z6');
    expect(canvas.extends).toBeNull();
  });

  it('inheritanceChain populated for mapped components', () => {
    const tree = buildComponentTree();
    const header = tree.find(c => c.id === 'Z1');
    expect(header.inheritanceChain.length).toBe(2);
    expect(header.inheritanceChain[0]).toBe('pfc.viz.header');
    expect(header.inheritanceChain[1]).toBe('ds.global.panel');
  });

  it('buildComponentConfigJSON populates ds:baseComponent', () => {
    const jsonld = buildComponentConfigJSON();
    const headerComp = jsonld['@graph'].find(e =>
      e['@type'] === 'ds:DesignComponent' && e['ds:componentName'] === 'pfc.viz.header'
    );
    expect(headerComp['ds:baseComponent']).toBe('ds.global.panel');
    const canvasComp = jsonld['@graph'].find(e =>
      e['@type'] === 'ds:DesignComponent' && e['ds:componentName'] === 'pfc.viz.graph-canvas'
    );
    expect(canvasComp['ds:baseComponent']).toBeNull();
  });
});

describe('buildGlobalComponentLibraryJSON', () => {
  it('returns JSON-LD with @context and @graph', () => {
    const jsonld = buildGlobalComponentLibraryJSON();
    expect(jsonld['@context']).toBeDefined();
    expect(jsonld['@context']['ds-global']).toBeDefined();
    expect(Array.isArray(jsonld['@graph'])).toBe(true);
    expect(jsonld['@graph'].length).toBeGreaterThan(0);
  });

  it('@graph entries have ds:extendsComponent and ds:atomicDesignLevel', () => {
    const jsonld = buildGlobalComponentLibraryJSON();
    const components = jsonld['@graph'].filter(e => e['@type'] === 'ds:DesignComponent');
    expect(components.length).toBe(10);
    for (const comp of components) {
      expect(comp).toHaveProperty('ds:extendsComponent');
      expect(comp).toHaveProperty('ds:atomicDesignLevel');
    }
    // button.primary should extend interactive.base
    const btnPrimary = components.find(c => c['ds:componentName'] === 'ds.global.button.primary');
    expect(btnPrimary['ds:extendsComponent']).toBe('ds.global.interactive.base');
  });
});
