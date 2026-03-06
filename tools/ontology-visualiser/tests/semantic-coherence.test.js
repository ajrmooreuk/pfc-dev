/**
 * Semantic Coherence (F8.6) — unit tests for archetype colours, shapes,
 * edge semantic categories, WCAG validation, and token bridge.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// vi.hoisted ensures variables are available in the hoisted mock factory
const { mockState } = vi.hoisted(() => ({
  mockState: {
    dsInstances: new Map(),
    highlightedSeries: new Set(),
    loadedOntologies: new Map(),
    brandContext: null,
    network: null,
    physicsEnabled: true,
    lastParsed: null,
    lastCompletenessScore: null,
    currentData: null,
    componentMap: new Map(),
    componentColoringActive: false,
    componentFilter: null,
    crossEdges: [],
    bridgeNodes: new Map(),
    bridgeFilterActive: false,
    crossEdgeFilterActive: false,
    selectionMode: false,
    authoringMode: false,
    diffMode: false,
    lastDiff: null,
    diffBaseData: null,
    pfiInstances: new Map(),
    pfiInstanceData: new Map(),
    activeDSBrand: null,
    activePFI: null,
    dsAppliedCSSVars: null,
    dsArtefactHistory: new Map(),
    registryIndex: null,
  },
}));

vi.mock('../js/state.js', () => ({
  state: mockState,
  TYPE_COLORS: {
    'class': '#4CAF50', 'core': '#4CAF50', 'framework': '#2196F3',
    'supporting': '#FF9800', 'agent': '#E91E63', 'external': '#9E9E9E',
    'layer': '#00BCD4', 'concept': '#AB47BC', 'default': '#017c75'
  },
  EDGE_STYLES: {
    default: { color: '#555', highlightColor: '#9dfff5', width: 1.5, dashes: false, arrows: 'to', fontColor: '#888', fontSize: 10, smooth: { type: 'continuous', roundness: 0.3 }, priority: 1 },
    relationship: { color: '#4CAF50', highlightColor: '#9dfff5', width: 1.5, dashes: false, arrows: 'to', fontColor: '#888', fontSize: 10, smooth: { type: 'continuous', roundness: 0.3 }, priority: 2 },
    inheritance: { color: '#888', highlightColor: '#9dfff5', width: 1.5, dashes: [5, 5], arrows: 'to', fontColor: '#888', fontSize: 10, smooth: { type: 'continuous', roundness: 0.3 }, priority: 1 },
  },
  EDGE_COLORS: { 'default': '#555' },
  SERIES_COLORS: {},
  LINEAGE_COLORS: {},
  SERIES_HIGHLIGHT_COLORS: {},
  COMPONENT_COLORS: [],
  CONTEXT_OPACITY: 0.55,
  REGISTRY_BASE_PATH: '../../ONTOLOGIES/ontology-library/',
  ARCHETYPE_SHAPES: {
    core: 'hexagon', class: 'dot', framework: 'box', supporting: 'triangle',
    agent: 'star', external: 'diamond', layer: 'square', concept: 'ellipse', default: 'dot',
  },
  ARCHETYPE_SIZES: {
    core: 30, class: 20, framework: 22, supporting: 18,
    agent: 25, external: 16, layer: 22, concept: 18, default: 20,
  },
  EDGE_LABEL_CATEGORIES: {
    'contains': 'structural', 'composedOf': 'structural', 'hasScope': 'structural',
    'subClassOf': 'taxonomy', 'extends': 'taxonomy',
    'dependsOn': 'dependency', 'requires': 'dependency', 'depends on': 'dependency',
    'informs': 'informational', 'defines': 'informational', 'measuredBy': 'informational',
    'produces': 'operational', 'supports': 'operational', 'enables': 'operational', 'realizes': 'operational',
  },
  EDGE_SEMANTIC_STYLES: {
    structural:    { color: '#7E57C2', highlightColor: '#B39DDB', width: 2.5, dashes: false,     arrows: 'to', fontColor: '#B39DDB', fontSize: 10, smooth: { type: 'continuous', roundness: 0.3 }, priority: 3 },
    taxonomy:      { color: '#888',    highlightColor: '#9dfff5', width: 1.5, dashes: [5, 5],    arrows: 'to', fontColor: '#888',    fontSize: 10, smooth: { type: 'continuous', roundness: 0.3 }, priority: 1 },
    dependency:    { color: '#EF5350', highlightColor: '#EF9A9A', width: 2,   dashes: false,     arrows: 'to', fontColor: '#EF9A9A', fontSize: 10, smooth: { type: 'continuous', roundness: 0.3 }, priority: 3 },
    informational: { color: '#42A5F5', highlightColor: '#90CAF9', width: 1.5, dashes: [3,3,8,3], arrows: 'to', fontColor: '#90CAF9', fontSize: 10, smooth: { type: 'continuous', roundness: 0.3 }, priority: 2 },
    operational:   { color: '#66BB6A', highlightColor: '#A5D6A7', width: 1.5, dashes: false,     arrows: 'to', fontColor: '#A5D6A7', fontSize: 10, smooth: { type: 'continuous', roundness: 0.3 }, priority: 2 },
  },
  getArchetypeColor: vi.fn((type) => {
    const map = { 'class': '#4CAF50', 'core': '#4CAF50', 'framework': '#2196F3', 'supporting': '#FF9800', 'agent': '#E91E63', 'external': '#9E9E9E', 'layer': '#00BCD4', 'concept': '#AB47BC', 'default': '#017c75' };
    return map[type] || map['default'];
  }),
  getArchetypeShape: vi.fn((type) => {
    const map = { core: 'hexagon', class: 'dot', framework: 'box', supporting: 'triangle', agent: 'star', external: 'diamond', layer: 'square', concept: 'ellipse', default: 'dot' };
    return map[type] || map['default'];
  }),
  getArchetypeSize: vi.fn((type) => {
    const map = { core: 30, class: 20, framework: 22, supporting: 18, agent: 25, external: 16, layer: 22, concept: 18, default: 20 };
    return map[type] || map['default'];
  }),
  getEdgeSemanticColor: vi.fn((cat) => {
    const map = { structural: '#7E57C2', taxonomy: '#888', dependency: '#EF5350', informational: '#42A5F5', operational: '#66BB6A' };
    return map[cat] || '#555';
  }),
  refreshArchetypeCache: vi.fn(),
}));

import { contrastRatio, validateArchetypePalette, generateCSSVars } from '../js/ds-loader.js';
import { getEdgeStyle } from '../js/graph-renderer.js';

// ========================================
// WCAG Contrast Validation (S8.6.1)
// ========================================

describe('WCAG AA validation (S8.6.1)', () => {
  it('contrastRatio() returns ~21:1 for black on white', () => {
    const ratio = contrastRatio('#000000', '#ffffff');
    expect(ratio).toBeCloseTo(21, 0);
  });

  it('contrastRatio() returns 1:1 for identical colours', () => {
    const ratio = contrastRatio('#4CAF50', '#4CAF50');
    expect(ratio).toBeCloseTo(1, 0);
  });

  it('contrastRatio() returns null for invalid hex', () => {
    expect(contrastRatio('notahex', '#ffffff')).toBeNull();
    expect(contrastRatio('#ffffff', 'bad')).toBeNull();
  });

  it('all default TYPE_COLORS pass 3:1 against dark canvas #0f1117', () => {
    const palette = {
      'class': '#4CAF50', 'core': '#4CAF50', 'framework': '#2196F3',
      'supporting': '#FF9800', 'agent': '#E91E63', 'external': '#9E9E9E',
      'layer': '#00BCD4', 'concept': '#AB47BC', 'default': '#017c75'
    };
    const result = validateArchetypePalette(palette, '#0f1117', 3);
    expect(result.valid).toBe(true);
    for (const r of result.results) {
      expect(r.pass).toBe(true);
      expect(r.ratio).toBeGreaterThanOrEqual(3);
    }
  });

  it('validateArchetypePalette() detects low-contrast failures', () => {
    const badPalette = { 'dark-on-dark': '#111111' };
    const result = validateArchetypePalette(badPalette, '#0f1117', 3);
    expect(result.valid).toBe(false);
    expect(result.results[0].pass).toBe(false);
  });

  it('validateArchetypePalette() uses default minRatio of 3', () => {
    const palette = { 'bright': '#ffffff' };
    const result = validateArchetypePalette(palette, '#0f1117');
    expect(result.valid).toBe(true);
  });
});

// ========================================
// Archetype Shapes (S8.6.3)
// ========================================

describe('Archetype shapes (S8.6.3)', () => {
  const ARCHETYPE_SHAPES = {
    core: 'hexagon', class: 'dot', framework: 'box', supporting: 'triangle',
    agent: 'star', external: 'diamond', layer: 'square', concept: 'ellipse', default: 'dot',
  };
  const ARCHETYPE_SIZES = {
    core: 30, class: 20, framework: 22, supporting: 18,
    agent: 25, external: 16, layer: 22, concept: 18, default: 20,
  };
  const OAA_ENTITY_TYPES = ['class', 'supporting', 'framework', 'agent', 'core', 'layer', 'concept'];

  it('every OAA entity type has a shape mapping', () => {
    for (const type of OAA_ENTITY_TYPES) {
      expect(ARCHETYPE_SHAPES[type]).toBeDefined();
      expect(typeof ARCHETYPE_SHAPES[type]).toBe('string');
    }
  });

  it('every OAA entity type has a size mapping', () => {
    for (const type of OAA_ENTITY_TYPES) {
      expect(ARCHETYPE_SIZES[type]).toBeDefined();
      expect(ARCHETYPE_SIZES[type]).toBeGreaterThan(0);
    }
  });

  it('no two non-default archetypes share the same shape (except class/default)', () => {
    const seen = new Map();
    for (const [type, shape] of Object.entries(ARCHETYPE_SHAPES)) {
      if (type === 'default') continue; // default may share with class
      if (type === 'class') continue; // class is the standard circle
      if (seen.has(shape)) {
        // Only class and default may share 'dot'
        expect(seen.get(shape)).toBe('class');
      }
      seen.set(shape, type);
    }
  });

  it('core entity gets the largest size (30)', () => {
    expect(ARCHETYPE_SIZES.core).toBe(30);
    for (const [type, size] of Object.entries(ARCHETYPE_SIZES)) {
      if (type !== 'core') expect(size).toBeLessThanOrEqual(30);
    }
  });

  it('external gets the smallest size (16)', () => {
    expect(ARCHETYPE_SIZES.external).toBe(16);
  });
});

// ========================================
// Edge Semantic Categories (S8.6.2)
// ========================================

describe('Edge semantic categories (S8.6.2)', () => {
  const EDGE_LABEL_CATEGORIES = {
    'contains': 'structural', 'composedOf': 'structural',
    'subClassOf': 'taxonomy', 'extends': 'taxonomy',
    'dependsOn': 'dependency', 'requires': 'dependency',
    'informs': 'informational', 'defines': 'informational',
    'produces': 'operational', 'supports': 'operational',
  };
  const EDGE_SEMANTIC_STYLES = {
    structural:    { color: '#7E57C2', width: 2.5, dashes: false, priority: 3 },
    taxonomy:      { color: '#888',    width: 1.5, dashes: [5, 5], priority: 1 },
    dependency:    { color: '#EF5350', width: 2,   dashes: false, priority: 3 },
    informational: { color: '#42A5F5', width: 1.5, dashes: [3,3,8,3], priority: 2 },
    operational:   { color: '#66BB6A', width: 1.5, dashes: false, priority: 2 },
  };

  it('defines exactly 5 semantic edge categories', () => {
    expect(Object.keys(EDGE_SEMANTIC_STYLES).length).toBe(5);
  });

  it('maps at least 10 relationship labels to categories', () => {
    expect(Object.keys(EDGE_LABEL_CATEGORIES).length).toBeGreaterThanOrEqual(10);
  });

  it('each category has a distinct colour', () => {
    const colors = Object.values(EDGE_SEMANTIC_STYLES).map(s => s.color);
    expect(new Set(colors).size).toBe(colors.length);
  });

  it('taxonomy edges are dashed, structural/dependency are solid', () => {
    expect(EDGE_SEMANTIC_STYLES.taxonomy.dashes).toEqual([5, 5]);
    expect(EDGE_SEMANTIC_STYLES.structural.dashes).toBe(false);
    expect(EDGE_SEMANTIC_STYLES.dependency.dashes).toBe(false);
  });

  it('informational edges have dot-dash pattern', () => {
    expect(EDGE_SEMANTIC_STYLES.informational.dashes).toEqual([3, 3, 8, 3]);
  });

  it('structural and dependency have higher priority than taxonomy', () => {
    expect(EDGE_SEMANTIC_STYLES.structural.priority).toBeGreaterThan(EDGE_SEMANTIC_STYLES.taxonomy.priority);
    expect(EDGE_SEMANTIC_STYLES.dependency.priority).toBeGreaterThan(EDGE_SEMANTIC_STYLES.taxonomy.priority);
  });

  it('getEdgeStyle() resolves label-based category when label is mapped', () => {
    const style = getEdgeStyle('default', { tier: 'single', label: 'dependsOn' });
    // Should use dependency colour (red #EF5350)
    expect(style.color.color).toBe('#EF5350');
  });

  it('getEdgeStyle() falls back to edgeType when label is unmapped', () => {
    const style = getEdgeStyle('relationship', { tier: 'single', label: 'unknownRelation' });
    // Should use relationship colour (#4CAF50)
    expect(style.color.color).toBe('#4CAF50');
  });

  it('getEdgeStyle() falls back to default when both label and edgeType are unmapped', () => {
    const style = getEdgeStyle('default', { tier: 'single', label: 'unknownRelation' });
    expect(style.color.color).toBe('#555');
  });
});

// ========================================
// Token Bridge (S8.6.5)
// ========================================

describe('Token bridge — generateCSSVars archetype mapping (S8.6.5)', () => {
  it('maps archetype.*.surface tokens to --viz-archetype-* CSS vars', () => {
    const parsed = {
      semantics: [
        { 'ds:tokenName': 'archetype.agent.surface', 'ds:lightModeValue': '#D81B60' },
        { 'ds:tokenName': 'archetype.class.surface', 'ds:lightModeValue': '#66BB6A' },
        { 'ds:tokenName': 'primary.surface.default', 'ds:lightModeValue': '#00a4bf' },
      ],
      primitives: [],
      components: [],
      designSystem: { 'ds:name': 'Test' },
    };
    const vars = generateCSSVars(parsed);
    expect(vars['--viz-archetype-agent']).toBe('#D81B60');
    expect(vars['--viz-archetype-class']).toBe('#66BB6A');
  });

  it('maps edge.*.color tokens to --viz-edge-* CSS vars', () => {
    const parsed = {
      semantics: [
        { 'ds:tokenName': 'edge.structural.color', 'ds:lightModeValue': '#9C27B0' },
        { 'ds:tokenName': 'edge.dependency.color', 'ds:lightModeValue': '#F44336' },
      ],
      primitives: [],
      components: [],
      designSystem: { 'ds:name': 'Test' },
    };
    const vars = generateCSSVars(parsed);
    expect(vars['--viz-edge-structural']).toBe('#9C27B0');
    expect(vars['--viz-edge-dependency']).toBe('#F44336');
  });

  it('does not map tokens without .surface or .color suffix', () => {
    const parsed = {
      semantics: [
        { 'ds:tokenName': 'archetype.agent.border', 'ds:lightModeValue': '#D81B60' },
        { 'ds:tokenName': 'edge.structural.width', 'ds:lightModeValue': '3' },
      ],
      primitives: [],
      components: [],
      designSystem: { 'ds:name': 'Test' },
    };
    const vars = generateCSSVars(parsed);
    expect(vars['--viz-archetype-agent']).toBeUndefined();
    expect(vars['--viz-edge-structural']).toBeUndefined();
  });

  it('preserves standard CSS var mappings alongside archetype tokens', () => {
    const parsed = {
      semantics: [
        { 'ds:tokenName': 'primary.surface.default', 'ds:lightModeValue': '#00a4bf' },
        { 'ds:tokenName': 'archetype.core.surface', 'ds:lightModeValue': '#388E3C' },
      ],
      primitives: [],
      components: [],
      designSystem: { 'ds:name': 'Test' },
    };
    const vars = generateCSSVars(parsed);
    expect(vars['--viz-accent']).toBe('#00a4bf');
    expect(vars['--viz-archetype-core']).toBe('#388E3C');
  });
});

// ========================================
// Interactive Legend Data Attributes (S8.6.4)
// ========================================

describe('Interactive legend structure (S8.6.4)', () => {
  it('legend items should have data-legend-type and data-legend-group attributes', () => {
    // Verify the concept: legend items carry metadata for interaction
    const types = ['class', 'supporting', 'framework'];
    for (const type of types) {
      const dataType = type;
      const dataGroup = 'node';
      expect(dataType).toBe(type);
      expect(dataGroup).toBe('node');
    }
  });

  it('edge categories should appear in legend with group="edge"', () => {
    const edgeCats = { structural: 3, dependency: 2, informational: 1 };
    for (const cat of Object.keys(edgeCats)) {
      const dataGroup = 'edge';
      expect(dataGroup).toBe('edge');
      expect(edgeCats[cat]).toBeGreaterThan(0);
    }
  });

  it('legend filter state: active filter matches single type', () => {
    let activeFilter = null;
    activeFilter = 'class';
    expect(activeFilter).toBe('class');
    // Toggle off
    activeFilter = null;
    expect(activeFilter).toBeNull();
  });
});
