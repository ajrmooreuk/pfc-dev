/**
 * Unit tests for EDGE_STYLES constant and getEdgeStyle() helper.
 * Validates DR-EDGE-005 (width hierarchy), DR-EDGE-006 (dash semantics),
 * DR-EDGE-007 (arrow semantics), DR-EDGE-008 (label readability).
 */

import { describe, it, expect, vi } from 'vitest';

// Mock state.js — inline all exports needed by graph-renderer.js
vi.mock('../js/state.js', () => ({
  state: {
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
  },
  EDGE_STYLES: {
    relationship:   { color: '#4CAF50', highlightColor: '#9dfff5', width: 1.5, dashes: false,   arrows: 'to', fontColor: '#888', fontSize: 10, smooth: { type: 'continuous', roundness: 0.3 }, priority: 2 },
    binding:        { color: '#FF9800', highlightColor: '#9dfff5', width: 2.5, dashes: false,   arrows: 'to', fontColor: '#888', fontSize: 10, smooth: { type: 'continuous', roundness: 0.3 }, priority: 3 },
    value_chain:    { color: '#2196F3', highlightColor: '#9dfff5', width: 2,   dashes: false,   arrows: 'to', fontColor: '#888', fontSize: 10, smooth: { type: 'continuous', roundness: 0.3 }, priority: 3 },
    inheritance:    { color: '#888',    highlightColor: '#9dfff5', width: 1.5, dashes: [5, 5],  arrows: 'to', fontColor: '#888', fontSize: 10, smooth: { type: 'continuous', roundness: 0.3 }, priority: 1 },
    subClassOf:     { color: '#888',    highlightColor: '#9dfff5', width: 1.5, dashes: [5, 5],  arrows: 'to', fontColor: '#888', fontSize: 10, smooth: { type: 'continuous', roundness: 0.3 }, priority: 1 },
    default:        { color: '#555',    highlightColor: '#9dfff5', width: 1.5, dashes: false,   arrows: 'to', fontColor: '#888', fontSize: 10, smooth: { type: 'continuous', roundness: 0.3 }, priority: 1 },
    crossOntology:  { color: '#eab839', highlightColor: '#FFF176', width: 2.5, dashes: [8, 4],  arrows: 'to', fontColor: '#eab839', fontSize: 9, smooth: { type: 'continuous', roundness: 0.4 }, priority: 4 },
    crossSeries:    { color: '#eab839', highlightColor: '#FFF176', width: 2,   dashes: [8, 4],  arrows: 'to', fontColor: '#eab839', fontSize: 11, smooth: { type: 'continuous', roundness: 0.4 }, priority: 4 },
    lineageVE:           { color: '#cec528', highlightColor: '#e8e05a', width: 3.5, dashes: false, arrows: 'to', fontColor: '#cec528', fontSize: 9, smooth: { type: 'continuous', roundness: 0.4 }, priority: 5 },
    lineagePE:           { color: '#b87333', highlightColor: '#d4956a', width: 3.5, dashes: false, arrows: 'to', fontColor: '#b87333', fontSize: 9, smooth: { type: 'continuous', roundness: 0.4 }, priority: 5 },
    lineageConvergence:  { color: '#FF6B35', highlightColor: '#ff8f5e', width: 4,   dashes: false, arrows: 'to', fontColor: '#FF6B35', fontSize: 9, smooth: { type: 'continuous', roundness: 0.4 }, priority: 5 },
    lineageSeriesFull:   { color: null,      highlightColor: null,      width: 3,   dashes: false, arrows: 'to', fontColor: null,      fontSize: 9, smooth: { type: 'continuous', roundness: 0.4 }, priority: 4 },
    lineageSeriesPartial:{ color: null,      highlightColor: null,      width: 2,   dashes: [6, 3], arrows: 'to', fontColor: null,      fontSize: 9, smooth: { type: 'continuous', roundness: 0.4 }, priority: 3 },
    lineageDimmed:       { color: '#444',    highlightColor: '#666',    width: 1,   dashes: [8, 4], arrows: 'to', fontColor: '#444',    fontSize: 9, smooth: { type: 'continuous', roundness: 0.4 }, priority: 0 },
  },
  TYPE_COLORS: {
    'class': '#4CAF50', 'core': '#4CAF50', 'framework': '#2196F3',
    'supporting': '#FF9800', 'agent': '#E91E63', 'external': '#9E9E9E',
    'layer': '#00BCD4', 'concept': '#AB47BC', 'default': '#017c75',
  },
  EDGE_COLORS: {
    'subClassOf': '#888', 'inheritance': '#888', 'relationship': '#4CAF50',
    'binding': '#FF9800', 'value_chain': '#2196F3', 'default': '#555',
  },
  SERIES_COLORS: { 'VE-Series': '#2196F3', 'PE-Series': '#4CAF50', 'Foundation': '#FF9800', 'placeholder': '#616161' },
  LINEAGE_COLORS: { VE: '#cec528', PE: '#b87333', convergence: '#FF6B35' },
  SERIES_HIGHLIGHT_COLORS: { 'VE-Series': '#cec528', 'PE-Series': '#b87333', convergence: '#FF6B35' },
  COMPONENT_COLORS: ['#66c2a5', '#fc8d62'],
  CONTEXT_OPACITY: 0.55,
  REGISTRY_BASE_PATH: '../../ONTOLOGIES/ontology-library/',
  EDGE_LABEL_CATEGORIES: {
    'contains': 'structural', 'composedOf': 'structural',
    'subClassOf': 'taxonomy', 'extends': 'taxonomy',
    'dependsOn': 'dependency', 'requires': 'dependency',
    'informs': 'informational', 'defines': 'informational',
    'produces': 'operational', 'supports': 'operational',
  },
  EDGE_SEMANTIC_STYLES: {
    structural:    { color: '#7E57C2', highlightColor: '#B39DDB', width: 2.5, dashes: false,     arrows: 'to', fontColor: '#B39DDB', fontSize: 10, smooth: { type: 'continuous', roundness: 0.3 }, priority: 3 },
    taxonomy:      { color: '#888',    highlightColor: '#9dfff5', width: 1.5, dashes: [5, 5],    arrows: 'to', fontColor: '#888',    fontSize: 10, smooth: { type: 'continuous', roundness: 0.3 }, priority: 1 },
    dependency:    { color: '#EF5350', highlightColor: '#EF9A9A', width: 2,   dashes: false,     arrows: 'to', fontColor: '#EF9A9A', fontSize: 10, smooth: { type: 'continuous', roundness: 0.3 }, priority: 3 },
    informational: { color: '#42A5F5', highlightColor: '#90CAF9', width: 1.5, dashes: [3,3,8,3], arrows: 'to', fontColor: '#90CAF9', fontSize: 10, smooth: { type: 'continuous', roundness: 0.3 }, priority: 2 },
    operational:   { color: '#66BB6A', highlightColor: '#A5D6A7', width: 1.5, dashes: false,     arrows: 'to', fontColor: '#A5D6A7', fontSize: 10, smooth: { type: 'continuous', roundness: 0.3 }, priority: 2 },
  },
  ARCHETYPE_SHAPES: { core: 'hexagon', class: 'dot', framework: 'box', supporting: 'triangle', agent: 'star', external: 'diamond', layer: 'square', concept: 'ellipse', default: 'dot' },
  ARCHETYPE_SIZES: { core: 30, class: 20, framework: 22, supporting: 18, agent: 25, external: 16, layer: 22, concept: 18, default: 20 },
  getArchetypeColor: vi.fn((t) => ({ 'class': '#4CAF50', 'core': '#4CAF50', 'framework': '#2196F3', 'supporting': '#FF9800', 'agent': '#E91E63', 'external': '#9E9E9E', 'layer': '#00BCD4', 'concept': '#AB47BC', 'default': '#017c75' }[t] || '#017c75')),
  getArchetypeShape: vi.fn((t) => ({ core: 'hexagon', class: 'dot', framework: 'box', supporting: 'triangle', agent: 'star', external: 'diamond', layer: 'square', concept: 'ellipse', default: 'dot' }[t] || 'dot')),
  getArchetypeSize: vi.fn((t) => ({ core: 30, class: 20, framework: 22, supporting: 18, agent: 25, external: 16, layer: 22, concept: 18, default: 20 }[t] || 20)),
  getEdgeSemanticColor: vi.fn((c) => ({ structural: '#7E57C2', taxonomy: '#888', dependency: '#EF5350', informational: '#42A5F5', operational: '#66BB6A' }[c] || '#555')),
  refreshArchetypeCache: vi.fn(),
}));

// Mock other imports used by graph-renderer.js
vi.mock('../js/ontology-parser.js', () => ({ parseOntology: vi.fn() }));
vi.mock('../js/audit-engine.js', () => ({
  auditGraph: vi.fn(() => ({ isolated: [], components: [], componentMap: new Map() })),
  validateOAAv5: vi.fn(() => ({})),
  computeCompletenessScore: vi.fn(() => 0),
}));
vi.mock('../js/compliance-reporter.js', () => ({
  renderOAACompliancePanel: vi.fn(),
  renderCompletenessScore: vi.fn(),
}));
vi.mock('../js/github-loader.js', () => ({
  lookupRegistry: vi.fn(() => Promise.resolve(null)),
}));
vi.mock('../js/ui-panels.js', () => ({
  renderAuditPanel: vi.fn(),
  showNodeDetails: vi.fn(),
  switchTab: vi.fn(),
  closeSidebar: vi.fn(),
}));
vi.mock('../js/multi-loader.js', () => ({
  classifyLineageEdge: vi.fn(() => ({ isVE: false, isPE: false, isConvergence: false })),
  getNodeLineageRole: vi.fn(() => ({ isConvergence: false })),
  getNodeSeries: vi.fn(() => null),
}));
vi.mock('../js/composition-filter.js', () => ({
  getActiveFilteredView: vi.fn(() => null),
  getNodeRenderMode: vi.fn(() => 'visible'),
  isEdgeVisible: vi.fn(() => true),
  filterSeriesData: vi.fn((v, d) => d),
  filterCrossSeriesEdges: vi.fn((v, e) => e),
}));

import { EDGE_STYLES } from '../js/state.js';
import { getEdgeStyle } from '../js/graph-renderer.js';

// --- All expected edge types ---
const EXPECTED_TYPES = [
  'relationship', 'binding', 'value_chain', 'inheritance', 'subClassOf',
  'default', 'crossOntology', 'crossSeries', 'lineageVE', 'lineagePE',
  'lineageConvergence', 'lineageSeriesFull', 'lineageSeriesPartial', 'lineageDimmed',
];

describe('EDGE_STYLES constant', () => {
  it('contains all 14 expected edge types', () => {
    for (const type of EXPECTED_TYPES) {
      expect(EDGE_STYLES).toHaveProperty(type);
    }
  });

  it('each entry has required properties', () => {
    const requiredProps = ['color', 'highlightColor', 'width', 'dashes', 'arrows', 'fontColor', 'fontSize', 'smooth', 'priority'];
    for (const [key, style] of Object.entries(EDGE_STYLES)) {
      for (const prop of requiredProps) {
        expect(style, `${key} missing ${prop}`).toHaveProperty(prop);
      }
    }
  });

  it('priority values range from 0 to 5', () => {
    for (const [key, style] of Object.entries(EDGE_STYLES)) {
      expect(style.priority, `${key} priority out of range`).toBeGreaterThanOrEqual(0);
      expect(style.priority, `${key} priority out of range`).toBeLessThanOrEqual(5);
    }
  });

  it('DR-EDGE-005: taxonomy edges have priority 1, lineage edges have priority 5', () => {
    expect(EDGE_STYLES.inheritance.priority).toBe(1);
    expect(EDGE_STYLES.subClassOf.priority).toBe(1);
    expect(EDGE_STYLES.default.priority).toBe(1);
    expect(EDGE_STYLES.lineageVE.priority).toBe(5);
    expect(EDGE_STYLES.lineagePE.priority).toBe(5);
    expect(EDGE_STYLES.lineageConvergence.priority).toBe(5);
  });

  it('DR-EDGE-006: taxonomy edges use [5,5] dash pattern', () => {
    expect(EDGE_STYLES.inheritance.dashes).toEqual([5, 5]);
    expect(EDGE_STYLES.subClassOf.dashes).toEqual([5, 5]);
  });

  it('DR-EDGE-006: cross-boundary edges use [8,4] dash pattern', () => {
    expect(EDGE_STYLES.crossOntology.dashes).toEqual([8, 4]);
    expect(EDGE_STYLES.crossSeries.dashes).toEqual([8, 4]);
    expect(EDGE_STYLES.lineageDimmed.dashes).toEqual([8, 4]);
  });

  it('DR-EDGE-006: partial-series uses [6,3] dash pattern', () => {
    expect(EDGE_STYLES.lineageSeriesPartial.dashes).toEqual([6, 3]);
  });

  it('DR-EDGE-006: intra-ontology relationship edges are solid (no dashes)', () => {
    expect(EDGE_STYLES.relationship.dashes).toBe(false);
    expect(EDGE_STYLES.binding.dashes).toBe(false);
    expect(EDGE_STYLES.value_chain.dashes).toBe(false);
  });

  it('DR-EDGE-007: all edges use directional "to" arrows', () => {
    for (const [key, style] of Object.entries(EDGE_STYLES)) {
      expect(style.arrows, `${key} should have 'to' arrows`).toBe('to');
    }
  });

  it('all smooth options have type and roundness', () => {
    for (const [key, style] of Object.entries(EDGE_STYLES)) {
      expect(style.smooth, `${key} smooth should have type`).toHaveProperty('type');
      expect(style.smooth, `${key} smooth should have roundness`).toHaveProperty('roundness');
    }
  });

  it('lineage edges have wider width than standard edges', () => {
    expect(EDGE_STYLES.lineageVE.width).toBeGreaterThan(EDGE_STYLES.relationship.width);
    expect(EDGE_STYLES.lineagePE.width).toBeGreaterThan(EDGE_STYLES.relationship.width);
    expect(EDGE_STYLES.lineageConvergence.width).toBeGreaterThan(EDGE_STYLES.lineageVE.width);
  });
});

describe('getEdgeStyle()', () => {
  it('returns complete vis-network edge styling object', () => {
    const style = getEdgeStyle('relationship');
    expect(style).toHaveProperty('color');
    expect(style).toHaveProperty('font');
    expect(style).toHaveProperty('arrows');
    expect(style).toHaveProperty('dashes');
    expect(style).toHaveProperty('width');
    expect(style).toHaveProperty('smooth');
  });

  it('returns nested colour object with color and highlight', () => {
    const style = getEdgeStyle('relationship');
    expect(style.color).toHaveProperty('color');
    expect(style.color).toHaveProperty('highlight');
  });

  it('returns font with color, size, background box (no stroke)', () => {
    const style = getEdgeStyle('binding');
    expect(style.font.color).toBeDefined();
    expect(style.font.size).toBeDefined();
    expect(style.font.strokeWidth).toBe(0);
    expect(style.font.background).toBe('rgba(15,17,23,0.85)');
  });

  it('falls back to default style for unknown edge type', () => {
    const style = getEdgeStyle('nonExistentType');
    const defaultStyle = getEdgeStyle('default');
    expect(style.color.color).toBe(defaultStyle.color.color);
    expect(style.width).toBe(defaultStyle.width);
  });

  it('DR-EDGE-005: multi-mode scales low-priority edges to 80% width', () => {
    const normal = getEdgeStyle('relationship', { tier: 'single' });
    const multi = getEdgeStyle('relationship', { tier: 'multi' });
    // relationship has priority 2 which is <= 2, so multi should scale
    expect(multi.width).toBe(Math.max(normal.width * 0.8, 1));
  });

  it('DR-EDGE-005: multi-mode does NOT scale high-priority edges', () => {
    const normal = getEdgeStyle('binding', { tier: 'single' });
    const multi = getEdgeStyle('binding', { tier: 'multi' });
    // binding has priority 3, should NOT scale
    expect(multi.width).toBe(normal.width);
  });

  it('dynamicColor overrides base colour', () => {
    const style = getEdgeStyle('default', { dynamicColor: '#FF0000' });
    expect(style.color.color).toBe('#FF0000');
    expect(style.color.highlight).toBe('#FF0000');
  });

  it('dynamicWidth overrides base width', () => {
    const style = getEdgeStyle('default', { dynamicWidth: 5 });
    expect(style.width).toBe(5);
  });

  it('preserves dash pattern from EDGE_STYLES', () => {
    const style = getEdgeStyle('inheritance');
    expect(style.dashes).toEqual([5, 5]);
  });

  it('preserves smooth option from EDGE_STYLES', () => {
    const style = getEdgeStyle('crossOntology');
    expect(style.smooth.type).toBe('continuous');
    expect(style.smooth.roundness).toBe(0.4);
  });

  it('lineageSeriesFull accepts dynamicColor for series highlighting', () => {
    const style = getEdgeStyle('lineageSeriesFull', { dynamicColor: '#cec528' });
    expect(style.color.color).toBe('#cec528');
    expect(style.color.highlight).toBe('#cec528');
    expect(style.dashes).toBe(false); // full series = solid
  });

  it('lineageDimmed has lowest priority (0) and thin width', () => {
    const style = getEdgeStyle('lineageDimmed');
    expect(EDGE_STYLES.lineageDimmed.priority).toBe(0);
    expect(style.width).toBe(1);
  });
});
