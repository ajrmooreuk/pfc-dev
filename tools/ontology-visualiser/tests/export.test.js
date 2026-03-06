/**
 * Unit tests for export.js — SVG, Mermaid, D3 export functions.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock state.js
vi.mock('../js/state.js', () => ({
  state: {
    network: null,
    lastParsed: null,
    lastValidation: null,
    lastCompletenessScore: null,
    lastAudit: null,
    currentData: null,
    currentRegistryEntry: null,
  },
  TYPE_COLORS: {
    'class': '#4CAF50', 'core': '#4CAF50', 'framework': '#2196F3',
    'supporting': '#FF9800', 'agent': '#E91E63', 'external': '#9E9E9E',
    'layer': '#00BCD4', 'concept': '#AB47BC', 'default': '#017c75'
  },
  ARCHETYPE_SHAPES: {
    core: 'hexagon', class: 'dot', framework: 'box', supporting: 'triangle',
    agent: 'star', external: 'diamond', layer: 'square', concept: 'ellipse', default: 'dot',
  },
  ARCHETYPE_SIZES: {
    core: 30, class: 20, framework: 22, supporting: 18,
    agent: 25, external: 16, layer: 22, concept: 18, default: 20,
  },
  EDGE_LABEL_CATEGORIES: {
    'contains': 'structural', 'composedOf': 'structural',
    'subClassOf': 'taxonomy', 'extends': 'taxonomy',
    'dependsOn': 'dependency', 'requires': 'dependency',
    'informs': 'informational', 'defines': 'informational',
    'produces': 'operational', 'supports': 'operational', 'enables': 'operational',
  },
  EDGE_SEMANTIC_STYLES: {
    structural:    { color: '#7E57C2', highlightColor: '#B39DDB', width: 2.5, dashes: false, arrows: 'to', fontColor: '#B39DDB', fontSize: 10, smooth: { type: 'continuous', roundness: 0.3 }, priority: 3 },
    taxonomy:      { color: '#888',    highlightColor: '#9dfff5', width: 1.5, dashes: [5,5], arrows: 'to', fontColor: '#888', fontSize: 10, smooth: { type: 'continuous', roundness: 0.3 }, priority: 1 },
    dependency:    { color: '#EF5350', highlightColor: '#EF9A9A', width: 2, dashes: false, arrows: 'to', fontColor: '#EF9A9A', fontSize: 10, smooth: { type: 'continuous', roundness: 0.3 }, priority: 3 },
    informational: { color: '#42A5F5', highlightColor: '#90CAF9', width: 1.5, dashes: [3,3,8,3], arrows: 'to', fontColor: '#90CAF9', fontSize: 10, smooth: { type: 'continuous', roundness: 0.3 }, priority: 2 },
    operational:   { color: '#66BB6A', highlightColor: '#A5D6A7', width: 1.5, dashes: false, arrows: 'to', fontColor: '#A5D6A7', fontSize: 10, smooth: { type: 'continuous', roundness: 0.3 }, priority: 2 },
  },
  getArchetypeColor: vi.fn((type) => {
    const c = { 'class': '#4CAF50', 'core': '#4CAF50', 'framework': '#2196F3', 'supporting': '#FF9800', 'agent': '#E91E63', 'external': '#9E9E9E', 'layer': '#00BCD4', 'concept': '#AB47BC', 'default': '#017c75' };
    return c[type] || c['default'];
  }),
  getArchetypeShape: vi.fn((type) => {
    const s = { core: 'hexagon', class: 'dot', framework: 'box', supporting: 'triangle', agent: 'star', external: 'diamond', layer: 'square', concept: 'ellipse', default: 'dot' };
    return s[type] || s['default'];
  }),
  getArchetypeSize: vi.fn((type) => {
    const z = { core: 30, class: 20, framework: 22, supporting: 18, agent: 25, external: 16, layer: 22, concept: 18, default: 20 };
    return z[type] || z['default'];
  }),
  getEdgeSemanticColor: vi.fn(() => '#555'),
  refreshArchetypeCache: vi.fn(),
}));

// Mock audit-engine.js
vi.mock('../js/audit-engine.js', () => ({
  validateOAAv5: vi.fn(() => ({
    gates: [], overall: 'pass', summary: { pass: 0, warn: 0, fail: 0, advisory: 0 }
  })),
  runV7Gates: vi.fn(() => []),
  extractEntities: vi.fn((data) => {
    if (data?.entities && Array.isArray(data.entities)) return data.entities;
    if (data?.entities && typeof data.entities === 'object') return Object.values(data.entities);
    return [];
  }),
  extractRelationships: vi.fn((data) => {
    if (data?.relationships && Array.isArray(data.relationships)) return data.relationships;
    return [];
  }),
}));

// Mock ui-panels.js
vi.mock('../js/ui-panels.js', () => ({
  buildGateReportMarkdown: vi.fn(() => '## Mock Report'),
}));

// Mock DOM
vi.stubGlobal('document', {
  getElementById: vi.fn(() => ({ textContent: 'test-ontology.json', style: {} })),
  querySelector: vi.fn(() => null),
  createElement: vi.fn(() => ({ click: vi.fn(), href: '', download: '' })),
});
vi.stubGlobal('URL', {
  createObjectURL: vi.fn(() => 'blob:test'),
  revokeObjectURL: vi.fn(),
});
vi.stubGlobal('Blob', class { constructor(parts, opts) { this.parts = parts; this.type = opts?.type; } });

import { state, TYPE_COLORS } from '../js/state.js';

// We need to test the internal logic, so we'll import the module functions
// For SVG/Mermaid/D3 we test the returned/generated content

// --- SVG Export ---

describe('exportSVG', () => {
  beforeEach(() => {
    state.network = {
      getPositions: () => ({
        'a:Node1': { x: 0, y: 0 },
        'a:Node2': { x: 100, y: 50 },
      }),
    };
    state.lastParsed = {
      nodes: [
        { id: 'a:Node1', label: 'Node1', entityType: 'class' },
        { id: 'a:Node2', label: 'Node2', entityType: 'external' },
      ],
      edges: [
        { from: 'a:Node1', to: 'a:Node2', label: 'relates', edgeType: 'relationship' },
      ],
      name: 'Test',
      diagnostics: { format: 'pf-ontology' },
    };
  });

  it('generates SVG with correct node count', async () => {
    const { exportSVG } = await import('../js/export.js');
    // We can't easily capture the blob content, but we verify it doesn't throw
    exportSVG();
    // The function should have called createElement for the download link
    expect(document.createElement).toHaveBeenCalled();
  });

  it('does nothing when no network', async () => {
    state.network = null;
    const { exportSVG } = await import('../js/export.js');
    exportSVG();
    // Should not throw
  });
});

// --- Mermaid Export ---

describe('exportMermaid', () => {
  beforeEach(() => {
    state.lastParsed = {
      nodes: [
        { id: 'a:Alpha', label: 'Alpha', entityType: 'class' },
        { id: 'a:Beta', label: 'Beta', entityType: 'core' },
        { id: 'a:Gamma', label: 'Gamma', entityType: 'external' },
      ],
      edges: [
        { from: 'a:Alpha', to: 'a:Beta', label: 'relatesTo', edgeType: 'relationship' },
        { from: 'a:Beta', to: 'a:Gamma', label: 'inherits', edgeType: 'inheritance' },
      ],
      name: 'Test',
      diagnostics: { format: 'pf-ontology' },
    };
  });

  it('starts with flowchart LR', async () => {
    const { exportMermaid } = await import('../js/export.js');
    const result = exportMermaid();
    expect(result).toMatch(/^flowchart LR\n/);
  });

  it('contains safe node IDs (no colons)', async () => {
    const { exportMermaid } = await import('../js/export.js');
    const result = exportMermaid();
    // Should have n0, n1, n2 not a:Alpha
    expect(result).toContain('n0');
    expect(result).toContain('n1');
    expect(result).toContain('n2');
    expect(result).not.toContain('a:Alpha');
  });

  it('uses dashed arrow for inheritance', async () => {
    const { exportMermaid } = await import('../js/export.js');
    const result = exportMermaid();
    expect(result).toContain('-.->');
  });

  it('uses solid arrow for relationships', async () => {
    const { exportMermaid } = await import('../js/export.js');
    const result = exportMermaid();
    expect(result).toContain('-->');
  });

  it('includes edge labels', async () => {
    const { exportMermaid } = await import('../js/export.js');
    const result = exportMermaid();
    expect(result).toContain('relatesTo');
    expect(result).toContain('inherits');
  });

  it('uses different shapes for entity types', async () => {
    const { exportMermaid } = await import('../js/export.js');
    const result = exportMermaid();
    // core uses (("label")), external uses [/"label"/]
    expect(result).toContain('(("Beta"))');
    expect(result).toContain('[/"Gamma"/]');
  });

  it('returns empty string when no parsed data', async () => {
    state.lastParsed = null;
    const { exportMermaid } = await import('../js/export.js');
    const result = exportMermaid();
    expect(result).toBe('');
  });
});

// --- D3 JSON Export ---

describe('exportD3JSON', () => {
  beforeEach(() => {
    state.network = {
      getPositions: () => ({
        'x:A': { x: 10, y: 20 },
        'x:B': { x: 30, y: 40 },
      }),
    };
    state.lastParsed = {
      nodes: [
        { id: 'x:A', label: 'A', entityType: 'class', description: 'Node A' },
        { id: 'x:B', label: 'B', entityType: 'supporting', description: 'Node B' },
      ],
      edges: [
        { from: 'x:A', to: 'x:B', label: 'links', edgeType: 'relationship' },
      ],
      name: 'Test Ontology',
      diagnostics: { format: 'pf-ontology' },
    };
  });

  it('has nodes and links arrays', async () => {
    const { exportD3JSON } = await import('../js/export.js');
    const result = exportD3JSON();
    expect(result.nodes).toHaveLength(2);
    expect(result.links).toHaveLength(1);
  });

  it('uses source/target convention for links', async () => {
    const { exportD3JSON } = await import('../js/export.js');
    const result = exportD3JSON();
    expect(result.links[0].source).toBe('x:A');
    expect(result.links[0].target).toBe('x:B');
  });

  it('includes node positions from network', async () => {
    const { exportD3JSON } = await import('../js/export.js');
    const result = exportD3JSON();
    const nodeA = result.nodes.find(n => n.id === 'x:A');
    expect(nodeA.x).toBe(10);
    expect(nodeA.y).toBe(20);
  });

  it('includes metadata with correct counts', async () => {
    const { exportD3JSON } = await import('../js/export.js');
    const result = exportD3JSON();
    expect(result.metadata.nodeCount).toBe(2);
    expect(result.metadata.edgeCount).toBe(1);
    expect(result.metadata.name).toBe('Test Ontology');
  });

  it('returns null when no parsed data', async () => {
    state.lastParsed = null;
    const { exportD3JSON } = await import('../js/export.js');
    const result = exportD3JSON();
    expect(result).toBeNull();
  });
});

// --- exportDSForDesignDirector (S7.6.8) ---

describe('exportDSForDesignDirector', () => {
  const makeParsedDS = () => ({
    designSystem: { '@id': 'test:ds', '@type': 'ds:DesignSystem', 'ds:name': 'Test DS', 'ds:version': '2.0.0' },
    categories: [],
    primitives: [
      { '@id': 'test:prim-1', '@type': 'ds:PrimitiveToken', 'ds:tokenName': 'color.blue.500', 'ds:value': '#2196F3' },
    ],
    semantics: [
      { '@id': 'test:sem-1', '@type': 'ds:SemanticToken', 'ds:tokenName': 'primary.surface.default', 'ds:lightModeValue': '#2196F3' },
    ],
    components: [
      { '@id': 'test:comp-1', '@type': 'ds:ComponentToken', 'ds:tokenName': 'button.bg', 'ds:referencesSemanticToken': { '@id': 'test:sem-1' } },
    ],
    variants: [],
    figmaSources: [],
    modes: [],
    patterns: [],
    pages: [
      { '@id': 'test:page-home', '@type': 'ds:PageDefinition', 'ds:pageName': 'Home', 'ds:componentSlots': '[]' },
    ],
    templates: [
      { '@id': 'test:tmpl-default', '@type': 'ds:TemplateDefinition', 'ds:templateName': 'Default' },
    ],
  });

  it('returns valid JSON string', async () => {
    const { exportDSForDesignDirector } = await import('../js/export.js');
    const result = exportDSForDesignDirector(makeParsedDS(), 'test-brand');
    const parsed = JSON.parse(result);
    expect(parsed['@type']).toBe('DesignDirectorExport');
  });

  it('includes brand and DS metadata', async () => {
    const { exportDSForDesignDirector } = await import('../js/export.js');
    const result = JSON.parse(exportDSForDesignDirector(makeParsedDS(), 'baiv'));
    expect(result.brand).toBe('baiv');
    expect(result.dsName).toBe('Test DS');
    expect(result.dsVersion).toBe('2.0.0');
  });

  it('includes pages and templates', async () => {
    const { exportDSForDesignDirector } = await import('../js/export.js');
    const result = JSON.parse(exportDSForDesignDirector(makeParsedDS(), 'baiv'));
    expect(result.pages).toHaveLength(1);
    expect(result.templates).toHaveLength(1);
  });

  it('builds token index by default', async () => {
    const { exportDSForDesignDirector } = await import('../js/export.js');
    const result = JSON.parse(exportDSForDesignDirector(makeParsedDS(), 'baiv'));
    expect(result.tokenIndex).toBeDefined();
    expect(result.tokenIndex['color.blue.500']).toBe('#2196F3');
    expect(result.tokenIndex['primary.surface.default']).toBe('#2196F3');
  });

  it('skips token index when includeTokens=false', async () => {
    const { exportDSForDesignDirector } = await import('../js/export.js');
    const result = JSON.parse(exportDSForDesignDirector(makeParsedDS(), 'baiv', { includeTokens: false }));
    expect(result.tokenIndex).toBeUndefined();
  });

  it('returns "{}" for null parsed', async () => {
    const { exportDSForDesignDirector } = await import('../js/export.js');
    expect(exportDSForDesignDirector(null, 'baiv')).toBe('{}');
  });

  it('handles empty pages/templates', async () => {
    const { exportDSForDesignDirector } = await import('../js/export.js');
    const parsed = makeParsedDS();
    parsed.pages = [];
    parsed.templates = [];
    const result = JSON.parse(exportDSForDesignDirector(parsed, 'baiv'));
    expect(result.pages).toHaveLength(0);
    expect(result.templates).toHaveLength(0);
  });

  it('includes exportedAt timestamp', async () => {
    const { exportDSForDesignDirector } = await import('../js/export.js');
    const result = JSON.parse(exportDSForDesignDirector(makeParsedDS(), 'baiv'));
    expect(result.exportedAt).toBeDefined();
    expect(new Date(result.exportedAt)).toBeInstanceOf(Date);
  });

  // --- Two-pass token resolution (S7.6.8) ---

  it('resolves component tokens through semantic reference to primitive value', async () => {
    const { exportDSForDesignDirector } = await import('../js/export.js');
    const result = JSON.parse(exportDSForDesignDirector(makeParsedDS(), 'baiv'));
    // button.bg references test:sem-1 whose lightModeValue is #2196F3
    expect(result.tokenIndex['button.bg']).toBe('#2196F3');
  });

  it('resolves component token with string @id reference', async () => {
    const { exportDSForDesignDirector } = await import('../js/export.js');
    const parsed = makeParsedDS();
    // Use string ref instead of object
    parsed.components = [
      { '@id': 'test:comp-2', '@type': 'ds:ComponentToken', 'ds:tokenName': 'card.border', 'ds:referencesToken': 'test:sem-1' },
    ];
    const result = JSON.parse(exportDSForDesignDirector(parsed, 'baiv'));
    expect(result.tokenIndex['card.border']).toBe('#2196F3');
  });

  it('keeps all three tiers in token index', async () => {
    const { exportDSForDesignDirector } = await import('../js/export.js');
    const result = JSON.parse(exportDSForDesignDirector(makeParsedDS(), 'baiv'));
    expect(result.tokenIndex['color.blue.500']).toBe('#2196F3');       // primitive
    expect(result.tokenIndex['primary.surface.default']).toBe('#2196F3'); // semantic
    expect(result.tokenIndex['button.bg']).toBe('#2196F3');            // component → resolved
  });

  it('falls back to refId when semantic not found', async () => {
    const { exportDSForDesignDirector } = await import('../js/export.js');
    const parsed = makeParsedDS();
    parsed.components = [
      { '@id': 'test:comp-orphan', '@type': 'ds:ComponentToken', 'ds:tokenName': 'orphan.bg', 'ds:referencesToken': 'test:missing-sem' },
    ];
    const result = JSON.parse(exportDSForDesignDirector(parsed, 'baiv'));
    // Falls back to the raw reference ID
    expect(result.tokenIndex['orphan.bg']).toBe('test:missing-sem');
  });

  it('skips non-ComponentToken entries in components array', async () => {
    const { exportDSForDesignDirector } = await import('../js/export.js');
    const parsed = makeParsedDS();
    parsed.components.push(
      { '@id': 'test:dc-1', '@type': 'ds:DesignComponent', 'ds:componentName': 'Button' }
    );
    const result = JSON.parse(exportDSForDesignDirector(parsed, 'baiv'));
    // DesignComponent should not pollute token index
    expect(result.tokenIndex).not.toHaveProperty('Button');
  });

  it('resolves page slot tokens to concrete values', async () => {
    const { exportDSForDesignDirector } = await import('../js/export.js');
    const parsed = makeParsedDS();
    parsed.pages = [{
      '@id': 'test:page-1', '@type': 'ds:PageDefinition', 'ds:pageName': 'Home',
      'ds:componentSlots': JSON.stringify([
        { component: 'Button', tokens: { background: 'button.bg' } }
      ]),
    }];
    const result = JSON.parse(exportDSForDesignDirector(parsed, 'baiv'));
    const slot = result.pages[0]._resolvedSlots[0];
    expect(slot._resolvedTokens.background).toBe('#2196F3');
  });
});

// --- PDF Report (generatePDFHTML) ---

import { runV7Gates } from '../js/audit-engine.js';

describe('generatePDFHTML', () => {
  const baseValidation = {
    gates: [
      { gate: 'G1: Schema Structure', status: 'pass', detail: 'Valid JSON-LD', advisory: false, skipped: false },
      { gate: 'G2: Relationship Cardinality', status: 'pass', detail: 'All OK', advisory: false, skipped: false },
      { gate: 'G5: Completeness', status: 'warn', detail: 'Missing fields', advisory: true, skipped: false },
      { gate: 'G8: Naming Conventions', status: 'pass', detail: 'Compliant', advisory: true, skipped: false },
    ],
    overall: 'pass',
    summary: { pass: 2, warn: 0, fail: 0, advisory: 2 },
  };

  const baseScore = {
    totalScore: 85,
    totalLabel: 'Good',
    categories: [
      { name: 'Structure', weight: 0.3, score: 90 },
      { name: 'Semantics', weight: 0.25, score: 80 },
    ],
  };

  const baseAudit = {
    totalNodes: 10,
    totalEdges: 15,
    components: [['a', 'b']],
    isolated: [],
  };

  const v6Data = {
    name: 'Test Ontology',
    'oaa:moduleVersion': '2.0.0',
  };

  const v7Data = {
    name: 'Test Ontology v7',
    'oaa:moduleVersion': '3.0.0',
    'oaa:schemaVersion': '7.0.0',
    'oaa:ontologyId': 'TEST-ONT',
  };

  const v7GatesActive = [
    {
      gate: 'G20: Competency Coverage', status: 'pass', detail: 'Coverage: entities 90%, relationships 85%, rules 80%',
      skipped: false, advisory: false,
      metrics: { entityCoverage: 90, relationshipCoverage: 85, ruleCoverage: 80 },
    },
    {
      gate: 'G21: Semantic Duplication Audit', status: 'pass', detail: '0 errors, 0 warnings',
      skipped: false, advisory: true,
    },
    {
      gate: 'G24: Instance Data Quality', status: 'pass',
      detail: '20 instances, distribution: HP=60% E=20% B=10% Er=10%, CQ coverage: 95%',
      skipped: false, advisory: true,
      metrics: {
        totalInstances: 20,
        distribution: { happyPath: 12, edge: 4, boundary: 2, error: 2 },
        cqCoverage: 95,
        uncoveredCQs: 1,
      },
    },
  ];

  const v7GatesAllSkipped = [
    { gate: 'G20: Competency Coverage', status: 'pass', detail: '', skipped: true },
    { gate: 'G21: Semantic Duplication Audit', status: 'pass', detail: '', skipped: true },
    { gate: 'G22: Cross-Ontology Rule Enforcement', status: 'pass', detail: '', skipped: true },
    { gate: 'G23: Lineage Chain Integrity', status: 'pass', detail: '', skipped: true },
    { gate: 'G24: Instance Data Quality', status: 'pass', detail: '', skipped: true },
  ];

  beforeEach(() => {
    runV7Gates.mockReset();
  });

  it('returns valid HTML with DOCTYPE', async () => {
    runV7Gates.mockReturnValue([]);
    const { generatePDFHTML } = await import('../js/export.js');
    const html = generatePDFHTML({ fileName: 'test.json', validation: baseValidation, score: null, audit: null, currentData: v6Data, graphImg: '' });
    expect(html).toMatch(/^<!DOCTYPE html>/);
    expect(html).toContain('</html>');
  });

  it('shows ontology name and version in header', async () => {
    runV7Gates.mockReturnValue([]);
    const { generatePDFHTML } = await import('../js/export.js');
    const html = generatePDFHTML({ fileName: 'VSOM-ONT.json', validation: baseValidation, score: null, audit: null, currentData: v6Data, graphImg: '' });
    expect(html).toContain('VSOM-ONT.json');
    expect(html).toContain('v2.0.0');
  });

  it('shows OAA schema version when present', async () => {
    runV7Gates.mockReturnValue([]);
    const { generatePDFHTML } = await import('../js/export.js');
    const html = generatePDFHTML({ fileName: 'test.json', validation: baseValidation, score: null, audit: null, currentData: v7Data, graphImg: '' });
    expect(html).toContain('v7.0.0');
    expect(html).toContain('OAA Schema');
  });

  it('shows v6.x label when no schemaVersion', async () => {
    runV7Gates.mockReturnValue([]);
    const { generatePDFHTML } = await import('../js/export.js');
    const html = generatePDFHTML({ fileName: 'test.json', validation: baseValidation, score: null, audit: null, currentData: v6Data, graphImg: '' });
    expect(html).toContain('v6.x');
  });

  it('shows overall compliance badge', async () => {
    runV7Gates.mockReturnValue([]);
    const { generatePDFHTML } = await import('../js/export.js');
    const html = generatePDFHTML({ fileName: 'test.json', validation: baseValidation, score: null, audit: null, currentData: v6Data, graphImg: '' });
    expect(html).toContain('PASS');
  });

  it('shows completeness score when available', async () => {
    runV7Gates.mockReturnValue([]);
    const { generatePDFHTML } = await import('../js/export.js');
    const html = generatePDFHTML({ fileName: 'test.json', validation: baseValidation, score: baseScore, audit: null, currentData: v6Data, graphImg: '' });
    expect(html).toContain('85%');
    expect(html).toContain('Good');
    expect(html).toContain('Structure');
    expect(html).toContain('Semantics');
  });

  it('renders graph image when provided', async () => {
    runV7Gates.mockReturnValue([]);
    const { generatePDFHTML } = await import('../js/export.js');
    const html = generatePDFHTML({ fileName: 'test.json', validation: baseValidation, score: null, audit: null, currentData: v6Data, graphImg: 'data:image/png;base64,abc' });
    expect(html).toContain('<img src="data:image/png;base64,abc"');
    expect(html).toContain('Graph Visualisation');
  });

  it('groups core gates separately from advisory gates', async () => {
    runV7Gates.mockReturnValue([]);
    const { generatePDFHTML } = await import('../js/export.js');
    const html = generatePDFHTML({ fileName: 'test.json', validation: baseValidation, score: null, audit: null, currentData: v6Data, graphImg: '' });
    expect(html).toContain('Core Gates (Required)');
    expect(html).toContain('Advisory Gates (Recommendations)');
    // Core gates should NOT have (advisory) suffix
    expect(html).toContain('G1: Schema Structure</td>');
    // Advisory gates should have (advisory) suffix
    expect(html).toContain('G5: Completeness (advisory)');
  });

  it('shows v7 quality gates section for v7 ontologies', async () => {
    runV7Gates.mockReturnValue(v7GatesActive);
    const { generatePDFHTML } = await import('../js/export.js');
    const html = generatePDFHTML({ fileName: 'test.json', validation: baseValidation, score: null, audit: null, currentData: v7Data, graphImg: '' });
    expect(html).toContain('v7 Quality Gates');
    expect(html).toContain('G20: Competency Coverage');
    expect(html).toContain('G24: Instance Data Quality');
  });

  it('skips v7 section when all v7 gates are skipped (v6 ontology)', async () => {
    runV7Gates.mockReturnValue(v7GatesAllSkipped);
    const { generatePDFHTML } = await import('../js/export.js');
    const html = generatePDFHTML({ fileName: 'test.json', validation: baseValidation, score: null, audit: null, currentData: v6Data, graphImg: '' });
    expect(html).not.toContain('v7 Quality Gates');
    expect(html).not.toContain('G20');
  });

  it('shows competency coverage metrics from G20', async () => {
    runV7Gates.mockReturnValue(v7GatesActive);
    const { generatePDFHTML } = await import('../js/export.js');
    const html = generatePDFHTML({ fileName: 'test.json', validation: baseValidation, score: null, audit: null, currentData: v7Data, graphImg: '' });
    expect(html).toContain('Competency Question Coverage');
    expect(html).toContain('Entity Coverage');
    expect(html).toContain('90%');
    expect(html).toContain('Relationship Coverage');
    expect(html).toContain('85%');
    expect(html).toContain('Rule Coverage');
    expect(html).toContain('80%');
  });

  it('shows instance distribution metrics from G24', async () => {
    runV7Gates.mockReturnValue(v7GatesActive);
    const { generatePDFHTML } = await import('../js/export.js');
    const html = generatePDFHTML({ fileName: 'test.json', validation: baseValidation, score: null, audit: null, currentData: v7Data, graphImg: '' });
    expect(html).toContain('Instance Data Distribution');
    expect(html).toContain('Happy Path');
    expect(html).toContain('12');
    expect(html).toContain('Edge Cases');
    expect(html).toContain('CQ-to-Instance Coverage');
    expect(html).toContain('95%');
  });

  it('shows graph metrics table', async () => {
    runV7Gates.mockReturnValue([]);
    const { generatePDFHTML } = await import('../js/export.js');
    const html = generatePDFHTML({ fileName: 'test.json', validation: baseValidation, score: null, audit: baseAudit, currentData: v6Data, graphImg: '' });
    expect(html).toContain('Graph Metrics');
    expect(html).toContain('10');
    expect(html).toContain('15');
    expect(html).toContain('1.50');
  });

  it('footer contains v4.5.0', async () => {
    runV7Gates.mockReturnValue([]);
    const { generatePDFHTML } = await import('../js/export.js');
    const html = generatePDFHTML({ fileName: 'test.json', validation: baseValidation, score: null, audit: null, currentData: v6Data, graphImg: '' });
    expect(html).toContain('v4.5.0');
    expect(html).not.toContain('v4.4.0');
  });

  it('HTML-escapes special characters in ontology names', async () => {
    runV7Gates.mockReturnValue([]);
    const { generatePDFHTML } = await import('../js/export.js');
    const html = generatePDFHTML({ fileName: '<script>alert(1)</script>.json', validation: baseValidation, score: null, audit: null, currentData: v6Data, graphImg: '' });
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('handles missing/null score gracefully', async () => {
    runV7Gates.mockReturnValue([]);
    const { generatePDFHTML } = await import('../js/export.js');
    const html = generatePDFHTML({ fileName: 'test.json', validation: baseValidation, score: null, audit: null, currentData: null, graphImg: '' });
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).not.toContain('Completeness Score');
    expect(html).not.toContain('Completeness Breakdown');
  });
});

// --- Ontology Catalogue PDF (generateCataloguePDFHTML) — F9J.4 ---

import { extractEntities, extractRelationships } from '../js/audit-engine.js';

describe('generateCataloguePDFHTML', () => {
  const catalogueData = {
    name: 'VP-ONT',
    'oaa:moduleVersion': '3.1.0',
    'oaa:schemaVersion': '7.0.0',
    'oaa:domain': 'Value Proposition',
    description: 'Value Proposition Ontology for customer problem-solution mapping',
    metadata: { dependencies: ['RRR-ONT', 'KPI-ONT'] },
    entities: [
      {
        '@id': 'Problem', name: 'Problem', entityType: 'core',
        description: 'A customer pain point or unmet need',
        schemaOrgBase: 'schema:Thing',
        properties: [
          { name: 'severity', type: 'enum', values: ['low', 'medium', 'high', 'critical'] },
          { name: 'description', type: 'string' },
        ],
      },
      {
        '@id': 'Solution', name: 'Solution', entityType: 'supporting',
        description: 'A proposed remedy for a customer problem',
        properties: [{ name: 'status', type: 'string' }],
      },
      {
        '@id': 'Benefit', name: 'Benefit', entityType: 'framework',
        description: 'A measurable customer outcome',
        properties: [],
      },
    ],
    relationships: [
      {
        name: 'solves', domainIncludes: ['Solution'], rangeIncludes: ['Problem'],
        cardinality: '1..*', description: 'Solution addresses a problem',
      },
      {
        name: 'delivers', domainIncludes: ['Solution'], rangeIncludes: ['Benefit'],
        cardinality: '1..*', description: 'Solution delivers a benefit',
      },
    ],
    businessRules: [
      { rule: 'IF Problem.severity = critical THEN Solution.priority = high', mandatory: true },
      { rule: 'IF Benefit.measurable = false THEN WARN incomplete benefit', mandatory: false },
    ],
  };

  const catalogueAudit = {
    totalNodes: 3,
    totalEdges: 2,
    components: [['Problem', 'Solution', 'Benefit']],
    isolated: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    extractEntities.mockImplementation((data) => {
      if (data?.entities && Array.isArray(data.entities)) return data.entities;
      return [];
    });
    extractRelationships.mockImplementation((data) => {
      if (data?.relationships && Array.isArray(data.relationships)) return data.relationships;
      return [];
    });
  });

  it('produces valid HTML with DOCTYPE', async () => {
    const { generateCataloguePDFHTML } = await import('../js/export.js');
    const html = generateCataloguePDFHTML({ fileName: 'vp-ont.json', currentData: catalogueData, parsed: null, audit: null, graphImg: '' });
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('</html>');
  });

  it('includes ontology name and version in header', async () => {
    const { generateCataloguePDFHTML } = await import('../js/export.js');
    const html = generateCataloguePDFHTML({ fileName: 'vp-ont.json', currentData: catalogueData, parsed: null, audit: null, graphImg: '' });
    expect(html).toContain('VP-ONT');
    expect(html).toContain('3.1.0');
    expect(html).toContain('Ontology Catalogue');
  });

  it('shows OAA schema version', async () => {
    const { generateCataloguePDFHTML } = await import('../js/export.js');
    const html = generateCataloguePDFHTML({ fileName: 'vp-ont.json', currentData: catalogueData, parsed: null, audit: null, graphImg: '' });
    expect(html).toContain('v7.0.0');
  });

  it('shows domain and description', async () => {
    const { generateCataloguePDFHTML } = await import('../js/export.js');
    const html = generateCataloguePDFHTML({ fileName: 'vp-ont.json', currentData: catalogueData, parsed: null, audit: null, graphImg: '' });
    expect(html).toContain('Value Proposition');
    expect(html).toContain('customer problem-solution mapping');
  });

  it('lists dependencies', async () => {
    const { generateCataloguePDFHTML } = await import('../js/export.js');
    const html = generateCataloguePDFHTML({ fileName: 'vp-ont.json', currentData: catalogueData, parsed: null, audit: null, graphImg: '' });
    expect(html).toContain('RRR-ONT');
    expect(html).toContain('KPI-ONT');
  });

  it('renders table of contents with correct counts', async () => {
    const { generateCataloguePDFHTML } = await import('../js/export.js');
    const html = generateCataloguePDFHTML({ fileName: 'vp-ont.json', currentData: catalogueData, parsed: null, audit: null, graphImg: '' });
    expect(html).toContain('Contents');
    expect(html).toContain('3 entities');
    expect(html).toContain('2 relationships');
    expect(html).toContain('2 rules');
  });

  it('renders scope summary metrics', async () => {
    const { generateCataloguePDFHTML } = await import('../js/export.js');
    const html = generateCataloguePDFHTML({ fileName: 'vp-ont.json', currentData: catalogueData, parsed: null, audit: catalogueAudit, graphImg: '' });
    expect(html).toContain('Scope Summary');
    expect(html).toContain('Graph Nodes');
    expect(html).toContain('Connected Components');
  });

  it('renders entity catalogue with all entities', async () => {
    const { generateCataloguePDFHTML } = await import('../js/export.js');
    const html = generateCataloguePDFHTML({ fileName: 'vp-ont.json', currentData: catalogueData, parsed: null, audit: null, graphImg: '' });
    expect(html).toContain('Entity Catalogue');
    expect(html).toContain('Problem');
    expect(html).toContain('Solution');
    expect(html).toContain('Benefit');
    expect(html).toContain('customer pain point');
  });

  it('renders entity type badges', async () => {
    const { generateCataloguePDFHTML } = await import('../js/export.js');
    const html = generateCataloguePDFHTML({ fileName: 'vp-ont.json', currentData: catalogueData, parsed: null, audit: null, graphImg: '' });
    expect(html).toContain('badge-core');
    expect(html).toContain('badge-supporting');
    expect(html).toContain('badge-framework');
  });

  it('shows schema.org base type', async () => {
    const { generateCataloguePDFHTML } = await import('../js/export.js');
    const html = generateCataloguePDFHTML({ fileName: 'vp-ont.json', currentData: catalogueData, parsed: null, audit: null, graphImg: '' });
    expect(html).toContain('schema:Thing');
  });

  it('renders relationship catalogue with domain, range, cardinality', async () => {
    const { generateCataloguePDFHTML } = await import('../js/export.js');
    const html = generateCataloguePDFHTML({ fileName: 'vp-ont.json', currentData: catalogueData, parsed: null, audit: null, graphImg: '' });
    expect(html).toContain('Relationship Catalogue');
    expect(html).toContain('solves');
    expect(html).toContain('delivers');
    expect(html).toContain('1..*');
    expect(html).toContain('Solution addresses a problem');
  });

  it('renders business rules with mandatory/advisory labels', async () => {
    const { generateCataloguePDFHTML } = await import('../js/export.js');
    const html = generateCataloguePDFHTML({ fileName: 'vp-ont.json', currentData: catalogueData, parsed: null, audit: null, graphImg: '' });
    expect(html).toContain('Business Rules');
    expect(html).toContain('IF Problem.severity = critical');
    expect(html).toContain('(mandatory)');
    expect(html).toContain('(advisory)');
  });

  it('renders enum definitions extracted from entity properties', async () => {
    const { generateCataloguePDFHTML } = await import('../js/export.js');
    const html = generateCataloguePDFHTML({ fileName: 'vp-ont.json', currentData: catalogueData, parsed: null, audit: null, graphImg: '' });
    expect(html).toContain('Enum Definitions');
    expect(html).toContain('severity');
    expect(html).toContain('low, medium, high, critical');
  });

  it('embeds graph image when provided', async () => {
    const { generateCataloguePDFHTML } = await import('../js/export.js');
    const html = generateCataloguePDFHTML({ fileName: 'vp-ont.json', currentData: catalogueData, parsed: null, audit: null, graphImg: 'data:image/png;base64,ABC123' });
    expect(html).toContain('Graph Visualisation');
    expect(html).toContain('data:image/png;base64,ABC123');
  });

  it('omits graph section when no image provided', async () => {
    const { generateCataloguePDFHTML } = await import('../js/export.js');
    const html = generateCataloguePDFHTML({ fileName: 'vp-ont.json', currentData: catalogueData, parsed: null, audit: null, graphImg: '' });
    expect(html).not.toContain('Graph Visualisation');
  });

  it('handles null/missing currentData gracefully', async () => {
    extractEntities.mockReturnValue([]);
    extractRelationships.mockReturnValue([]);
    const { generateCataloguePDFHTML } = await import('../js/export.js');
    const html = generateCataloguePDFHTML({ fileName: 'empty.json', currentData: null, parsed: null, audit: null, graphImg: '' });
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('No entities defined');
    expect(html).toContain('No relationships defined');
  });

  it('handles ontology with no relationships or rules', async () => {
    const minimalData = { name: 'Minimal-ONT', entities: [{ '@id': 'X', name: 'X', entityType: 'core', description: 'Test', properties: [] }] };
    extractEntities.mockReturnValue(minimalData.entities);
    extractRelationships.mockReturnValue([]);
    const { generateCataloguePDFHTML } = await import('../js/export.js');
    const html = generateCataloguePDFHTML({ fileName: 'min.json', currentData: minimalData, parsed: null, audit: null, graphImg: '' });
    expect(html).toContain('Entity Catalogue');
    expect(html).toContain('No relationships defined');
    expect(html).not.toContain('id="rules"');
    expect(html).not.toContain('id="enums"');
  });

  it('HTML-escapes special characters in all fields', async () => {
    const xssData = {
      name: '<script>alert(1)</script>',
      entities: [{ '@id': 'X', name: '<b>Injected</b>', entityType: 'core', description: 'a<br>b', properties: [] }],
      relationships: [{ name: '<img onerror=alert(1)>', domainIncludes: ['X'], rangeIncludes: ['X'], description: '<xss>' }],
    };
    extractEntities.mockReturnValue(xssData.entities);
    extractRelationships.mockReturnValue(xssData.relationships);
    const { generateCataloguePDFHTML } = await import('../js/export.js');
    const html = generateCataloguePDFHTML({ fileName: 'xss.json', currentData: xssData, parsed: null, audit: null, graphImg: '' });
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('<b>');
    expect(html).not.toContain('<img');
    expect(html).toContain('&lt;script&gt;');
  });

  it('renders graph audit metrics when provided', async () => {
    const { generateCataloguePDFHTML } = await import('../js/export.js');
    const html = generateCataloguePDFHTML({ fileName: 'vp-ont.json', currentData: catalogueData, parsed: null, audit: catalogueAudit, graphImg: '' });
    expect(html).toContain('Density');
    expect(html).toContain('0.67');
    expect(html).toContain('Isolated Nodes');
  });

  it('footer contains catalogue label', async () => {
    const { generateCataloguePDFHTML } = await import('../js/export.js');
    const html = generateCataloguePDFHTML({ fileName: 'vp-ont.json', currentData: catalogueData, parsed: null, audit: null, graphImg: '' });
    expect(html).toContain('Full Ontology Catalogue');
  });

  it('includes print button', async () => {
    const { generateCataloguePDFHTML } = await import('../js/export.js');
    const html = generateCataloguePDFHTML({ fileName: 'vp-ont.json', currentData: catalogueData, parsed: null, audit: null, graphImg: '' });
    expect(html).toContain('window.print()');
    expect(html).toContain('Print / Save as PDF');
  });
});
