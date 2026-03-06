/**
 * Unit tests for ds-loader.js — DS instance parsing, token graph building,
 * CSS variable generation, and instance summary.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock state.js
vi.mock('../js/state.js', () => ({
  state: {
    dsInstances: new Map(),
    dsArtefactHistory: new Map(),
  },
  REGISTRY_BASE_PATH: '../../ONTOLOGIES/ontology-library/',
}));

import {
  parseDSInstance,
  buildDSTokenGraph,
  getDSInstanceSummary,
  generateCSSVars,
  generateWorkflowMermaid,
  addDSGraphEntry,
  saveDSArtefact,
  bumpDSArtefactVersion,
  getDSArtefactHistory,
  traceTokenResolution,
} from '../js/ds-loader.js';

// --- Fixtures ---

const baivFixture = {
  '@context': {
    'ds': 'https://platformcore.io/ontology/ds/',
    'baiv-ds': 'https://baiv.platform.io/ontology/ds/',
  },
  '@graph': [
    {
      '@id': 'baiv-ds:system-baiv-v1.0',
      '@type': 'ds:DesignSystem',
      'ds:name': 'BAIV Design System',
      'ds:version': '1.0.0',
      'ds:namespace': 'https://baiv.platform.io/ontology/ds/',
      'ds:pfiInstanceName': 'BAIV',
      'ds:isActive': true,
      'ds:themeModeSupport': true,
    },
    {
      '@id': 'baiv-ds:cat-colors',
      '@type': 'ds:TokenCategory',
      'ds:categoryName': 'Colors',
      'ds:tier': 'Primitive',
      'ds:description': 'Color scales',
    },
    {
      '@id': 'baiv-ds:cat-semantic-primary',
      '@type': 'ds:TokenCategory',
      'ds:categoryName': 'Primary',
      'ds:tier': 'Semantic',
      'ds:description': 'Primary brand colours',
    },
    {
      '@id': 'baiv-ds:prim-teal-500',
      '@type': 'ds:PrimitiveToken',
      'ds:tokenName': 'color.teal.500',
      'ds:value': '#00a4bf',
      'ds:valueType': 'Color',
      'ds:category': { '@id': 'baiv-ds:cat-colors' },
    },
    {
      '@id': 'baiv-ds:prim-teal-700',
      '@type': 'ds:PrimitiveToken',
      'ds:tokenName': 'color.teal.700',
      'ds:value': '#005b6b',
      'ds:valueType': 'Color',
      'ds:category': { '@id': 'baiv-ds:cat-colors' },
    },
    {
      '@id': 'baiv-ds:prim-spacing-md',
      '@type': 'ds:PrimitiveToken',
      'ds:tokenName': 'spacing.md',
      'ds:value': '16px',
      'ds:valueType': 'Dimension',
      'ds:category': { '@id': 'baiv-ds:cat-spacing' },
    },
    {
      '@id': 'baiv-ds:sem-primary-surface-default',
      '@type': 'ds:SemanticToken',
      'ds:tokenName': 'primary.surface.default',
      'ds:lightModeValue': '#00a4bf',
      'ds:referencesPrimitiveToken': { '@id': 'baiv-ds:prim-teal-500' },
      'ds:category': { '@id': 'baiv-ds:cat-semantic-primary' },
    },
    {
      '@id': 'baiv-ds:sem-primary-surface-darker',
      '@type': 'ds:SemanticToken',
      'ds:tokenName': 'primary.surface.darker',
      'ds:lightModeValue': '#005b6b',
      'ds:referencesPrimitiveToken': { '@id': 'baiv-ds:prim-teal-700' },
      'ds:category': { '@id': 'baiv-ds:cat-semantic-primary' },
    },
    {
      '@id': 'baiv-ds:sem-neutral-text-title',
      '@type': 'ds:SemanticToken',
      'ds:tokenName': 'neutral.text.title',
      'ds:lightModeValue': '#1c1f1f',
    },
    {
      '@id': 'baiv-ds:sem-neutral-surface-default',
      '@type': 'ds:SemanticToken',
      'ds:tokenName': 'neutral.surface.default',
      'ds:lightModeValue': '#d9ebeb',
    },
    {
      '@id': 'baiv-ds:sem-neutral-surface-subtle',
      '@type': 'ds:SemanticToken',
      'ds:tokenName': 'neutral.surface.subtle',
      'ds:lightModeValue': '#e9f3f3',
    },
    {
      '@id': 'baiv-ds:sem-neutral-border-default',
      '@type': 'ds:SemanticToken',
      'ds:tokenName': 'neutral.border.default',
      'ds:lightModeValue': '#d9ebeb',
    },
    {
      '@id': 'baiv-ds:sem-error-surface-default',
      '@type': 'ds:SemanticToken',
      'ds:tokenName': 'error.surface.default',
      'ds:lightModeValue': '#cf057d',
    },
    {
      '@id': 'baiv-ds:sem-warning-surface-default',
      '@type': 'ds:SemanticToken',
      'ds:tokenName': 'warning.surface.default',
      'ds:lightModeValue': '#cec528',
    },
    {
      '@id': 'baiv-ds:sem-success-surface-default',
      '@type': 'ds:SemanticToken',
      'ds:tokenName': 'success.surface.default',
      'ds:lightModeValue': '#019587',
    },
    {
      '@id': 'baiv-ds:sem-info-surface-default',
      '@type': 'ds:SemanticToken',
      'ds:tokenName': 'information.surface.default',
      'ds:lightModeValue': '#3b6fcc',
    },
    {
      '@id': 'baiv-ds:comp-button-primary-bg',
      '@type': 'ds:ComponentToken',
      'ds:tokenName': 'button.primary.background',
      'ds:componentName': 'Button',
      'ds:referencesSemanticToken': { '@id': 'baiv-ds:sem-primary-surface-default' },
    },
    {
      '@id': 'baiv-ds:comp-button-primary-text',
      '@type': 'ds:ComponentToken',
      'ds:tokenName': 'button.primary.text',
      'ds:componentName': 'Button',
      'ds:referencesSemanticToken': { '@id': 'baiv-ds:sem-neutral-text-title' },
    },
    {
      '@id': 'baiv-ds:variant-baiv',
      '@type': 'ds:BrandVariant',
      'ds:brandName': 'BAIV',
    },
    {
      '@id': 'baiv-ds:figma-source',
      '@type': 'ds:FigmaSource',
      'ds:fileKey': 'bXCyfNwzc8Z9kEeFIeIB8C',
      'ds:fileName': 'BAIV-Figma-Variables-v3',
      'ds:syncStatus': 'populated',
      'ds:lastSyncedAt': '2026-02-10',
    },
    {
      '@id': 'baiv-ds:mode-light',
      '@type': 'ds:ThemeMode',
      'ds:modeName': 'light',
    },
    {
      '@id': 'baiv-ds:mode-dark',
      '@type': 'ds:ThemeMode',
      'ds:modeName': 'dark',
    },
    {
      '@id': 'baiv-ds:pattern-atom',
      '@type': 'ds:DesignPattern',
      'ds:patternLevel': 'atom',
    },
  ],
};

const emptyFixture = { '@context': {}, '@graph': [] };

const noComponentsFixture = {
  '@context': { 'ds': 'https://platformcore.io/ontology/ds/' },
  '@graph': [
    {
      '@id': 'test:system',
      '@type': 'ds:DesignSystem',
      'ds:name': 'Minimal DS',
      'ds:version': '0.1.0',
      'ds:themeModeSupport': false,
    },
    {
      '@id': 'test:prim-1',
      '@type': 'ds:PrimitiveToken',
      'ds:tokenName': 'color.red.500',
      'ds:value': '#f44336',
      'ds:valueType': 'Color',
    },
    {
      '@id': 'test:sem-1',
      '@type': 'ds:SemanticToken',
      'ds:tokenName': 'error.surface.default',
      'ds:lightModeValue': '#f44336',
    },
  ],
};

// --- parseDSInstance ---

describe('parseDSInstance', () => {
  it('classifies all node types correctly from BAIV fixture', () => {
    const result = parseDSInstance(baivFixture);
    expect(result.designSystem).not.toBeNull();
    expect(result.designSystem['ds:name']).toBe('BAIV Design System');
    expect(result.categories).toHaveLength(2);
    expect(result.primitives).toHaveLength(3);
    expect(result.semantics).toHaveLength(10);
    expect(result.components).toHaveLength(2);
    expect(result.variants).toHaveLength(1);
    expect(result.figmaSources).toHaveLength(1);
    expect(result.modes).toHaveLength(2);
    expect(result.patterns).toHaveLength(1);
  });

  it('returns empty arrays for empty @graph', () => {
    const result = parseDSInstance(emptyFixture);
    expect(result.designSystem).toBeNull();
    expect(result.categories).toHaveLength(0);
    expect(result.primitives).toHaveLength(0);
    expect(result.semantics).toHaveLength(0);
    expect(result.components).toHaveLength(0);
    expect(result.variants).toHaveLength(0);
    expect(result.figmaSources).toHaveLength(0);
    expect(result.modes).toHaveLength(0);
    expect(result.patterns).toHaveLength(0);
  });

  it('handles missing @graph gracefully', () => {
    const result = parseDSInstance({});
    expect(result.designSystem).toBeNull();
    expect(result.primitives).toHaveLength(0);
  });

  it('handles null input gracefully', () => {
    const result = parseDSInstance(null);
    expect(result.designSystem).toBeNull();
    expect(result.primitives).toHaveLength(0);
  });

  it('parses fixture with no components', () => {
    const result = parseDSInstance(noComponentsFixture);
    expect(result.designSystem).not.toBeNull();
    expect(result.primitives).toHaveLength(1);
    expect(result.semantics).toHaveLength(1);
    expect(result.components).toHaveLength(0);
  });
});

// --- buildDSTokenGraph ---

describe('buildDSTokenGraph', () => {
  it('builds nodes for all token types plus system node', () => {
    const parsed = parseDSInstance(baivFixture);
    const graph = buildDSTokenGraph(parsed);

    // 1 system + 2 categories + 3 primitives + 10 semantics + 2 components = 18
    expect(graph.nodes).toHaveLength(18);
    expect(graph.edges.length).toBeGreaterThan(0);
  });

  it('creates category edges from system node', () => {
    const parsed = parseDSInstance(baivFixture);
    const graph = buildDSTokenGraph(parsed);

    const categoryEdges = graph.edges.filter(e => e.label === 'hasCategory');
    expect(categoryEdges).toHaveLength(2);
  });

  it('creates reference edges from component tokens', () => {
    const parsed = parseDSInstance(baivFixture);
    const graph = buildDSTokenGraph(parsed);

    const refEdges = graph.edges.filter(e => e.label === 'references');
    expect(refEdges).toHaveLength(2);
  });

  it('uses actual colour values for colour primitive nodes', () => {
    const parsed = parseDSInstance(baivFixture);
    const graph = buildDSTokenGraph(parsed);

    const teal500 = graph.nodes.find(n => n.id === 'baiv-ds:prim-teal-500');
    expect(teal500).toBeDefined();
    expect(teal500.color.background).toBe('#00a4bf');
  });

  it('uses tier colours for non-colour primitives', () => {
    const parsed = parseDSInstance(baivFixture);
    const graph = buildDSTokenGraph(parsed);

    const spacingNode = graph.nodes.find(n => n.id === 'baiv-ds:prim-spacing-md');
    expect(spacingNode).toBeDefined();
    expect(spacingNode.color.background).toBe('#4CAF50'); // Primitive tier green
  });

  it('handles empty parsed data', () => {
    const parsed = parseDSInstance(emptyFixture);
    const graph = buildDSTokenGraph(parsed);
    expect(graph.nodes).toHaveLength(0);
    expect(graph.edges).toHaveLength(0);
  });

  it('builds graph with no components', () => {
    const parsed = parseDSInstance(noComponentsFixture);
    const graph = buildDSTokenGraph(parsed);

    // 1 system + 1 primitive + 1 semantic = 3 nodes
    expect(graph.nodes).toHaveLength(3);
    const refEdges = graph.edges.filter(e => e.label === 'references');
    expect(refEdges).toHaveLength(0);
  });

  it('renders DesignComponent nodes with token count badge', () => {
    // Build a parsed instance with a DesignComponent and 2 ComponentTokens
    const parsed = parseDSInstance({ '@graph': [
      { '@id': 'ds:system', '@type': 'ds:DesignSystem', 'ds:name': 'Test', 'ds:version': '1.0' },
      { '@id': 'ds:sem-1', '@type': 'ds:SemanticToken', 'ds:tokenName': 'primary', 'ds:lightModeValue': '#00a4bf' },
      { '@id': 'ds:comp-btn', '@type': 'ds:DesignComponent', 'ds:componentName': 'Button', 'ds:category': 'Atom' },
      { '@id': 'ds:ct-btn-bg', '@type': 'ds:ComponentToken', 'ds:tokenName': 'button.bg', 'ds:componentName': 'Button', 'ds:referencesSemanticToken': { '@id': 'ds:sem-1' } },
      { '@id': 'ds:ct-btn-text', '@type': 'ds:ComponentToken', 'ds:tokenName': 'button.text', 'ds:componentName': 'Button', 'ds:referencesSemanticToken': { '@id': 'ds:sem-1' } },
    ]});
    const graph = buildDSTokenGraph(parsed);

    // DesignComponent node exists with badge
    const compNode = graph.nodes.find(n => n.id === 'ds:comp-btn');
    expect(compNode).toBeDefined();
    expect(compNode.label).toBe('Button [2]');
    expect(compNode.shape).toBe('box');
    expect(compNode._dsType).toBe('DesignComponent');
    expect(compNode._bindingCount).toBe(2);

    // consumesToken edges from DesignComponent to ComponentTokens
    const consumeEdges = graph.edges.filter(e => e.label === 'consumesToken');
    expect(consumeEdges).toHaveLength(2);
    expect(consumeEdges.every(e => e.from === 'ds:comp-btn')).toBe(true);

    // reference edges from ComponentTokens to SemanticTokens
    const refEdges = graph.edges.filter(e => e.label === 'references');
    expect(refEdges).toHaveLength(2);
  });

  it('renders DesignComponent with zero bindings (no badge)', () => {
    const parsed = parseDSInstance({ '@graph': [
      { '@id': 'ds:system', '@type': 'ds:DesignSystem', 'ds:name': 'Test', 'ds:version': '1.0' },
      { '@id': 'ds:comp-card', '@type': 'ds:DesignComponent', 'ds:componentName': 'Card', 'ds:category': 'Molecule' },
    ]});
    const graph = buildDSTokenGraph(parsed);

    const compNode = graph.nodes.find(n => n.id === 'ds:comp-card');
    expect(compNode).toBeDefined();
    expect(compNode.label).toBe('Card');
    expect(compNode._bindingCount).toBe(0);
  });
});

// --- getDSInstanceSummary ---

describe('getDSInstanceSummary', () => {
  it('returns correct counts for BAIV fixture', () => {
    const parsed = parseDSInstance(baivFixture);
    parsed._meta = { brand: 'baiv', version: '1.0.0', status: 'populated' };
    const summary = getDSInstanceSummary(parsed);

    expect(summary.brand).toBe('baiv');
    expect(summary.name).toBe('BAIV Design System');
    expect(summary.version).toBe('1.0.0');
    expect(summary.primitiveCount).toBe(3);
    expect(summary.semanticCount).toBe(10);
    expect(summary.componentCount).toBe(2);
    expect(summary.totalTokens).toBe(15);
    expect(summary.categoryCount).toBe(2);
    expect(summary.themeModeSupport).toBe(true);
    expect(summary.modeCount).toBe(2);
    expect(summary.variantCount).toBe(1);
    expect(summary.patternCount).toBe(1);
  });

  it('returns figma info from FigmaSource node', () => {
    const parsed = parseDSInstance(baivFixture);
    parsed._meta = { brand: 'baiv' };
    const summary = getDSInstanceSummary(parsed);

    expect(summary.syncStatus).toBe('populated');
    expect(summary.figmaFileKey).toBe('bXCyfNwzc8Z9kEeFIeIB8C');
    expect(summary.figmaFileName).toBe('BAIV-Figma-Variables-v3');
  });

  it('falls back to _meta for missing DS node', () => {
    const parsed = parseDSInstance(emptyFixture);
    parsed._meta = { brand: 'test-brand', version: '0.0.1', status: 'draft' };
    const summary = getDSInstanceSummary(parsed);

    expect(summary.brand).toBe('test-brand');
    expect(summary.version).toBe('0.0.1');
    expect(summary.totalTokens).toBe(0);
    expect(summary.syncStatus).toBe('draft');
  });

  it('handles no _meta gracefully', () => {
    const parsed = parseDSInstance(noComponentsFixture);
    const summary = getDSInstanceSummary(parsed);

    expect(summary.brand).toBe('unknown');
    expect(summary.name).toBe('Minimal DS');
    expect(summary.themeModeSupport).toBe(false);
  });
});

// --- generateCSSVars ---

describe('generateCSSVars', () => {
  it('maps semantic tokens to CSS variables', () => {
    const parsed = parseDSInstance(baivFixture);
    const vars = generateCSSVars(parsed);

    expect(vars['--viz-accent']).toBe('#00a4bf');
    expect(vars['--viz-accent-active']).toBe('#005b6b');
    expect(vars['--viz-text-primary']).toBe('#1c1f1f');
    expect(vars['--viz-error']).toBe('#cf057d');
    expect(vars['--viz-warning']).toBe('#cec528');
    expect(vars['--viz-success']).toBe('#019587');
    expect(vars['--viz-info']).toBe('#3b6fcc');
  });

  it('returns empty object for empty instance', () => {
    const parsed = parseDSInstance(emptyFixture);
    const vars = generateCSSVars(parsed);
    expect(Object.keys(vars)).toHaveLength(0);
  });

  it('only includes vars for tokens that exist', () => {
    const parsed = parseDSInstance(noComponentsFixture);
    const vars = generateCSSVars(parsed);

    // noComponentsFixture only has error.surface.default
    expect(vars['--viz-error']).toBe('#f44336');
    expect(vars['--viz-accent']).toBeUndefined();
    expect(vars['--viz-warning']).toBeUndefined();
  });

  it('derives surface-elevated, surface-card, border-subtle from available tokens', () => {
    const parsed = parseDSInstance(baivFixture);
    const vars = generateCSSVars(parsed);

    // BAIV neutral.surface.default is #d9ebeb (light theme) — derived vars should exist
    expect(vars['--viz-surface-default']).toBe('#d9ebeb');
    expect(vars['--viz-surface-elevated']).toBeDefined();
    expect(vars['--viz-surface-card']).toBeDefined();
    expect(vars['--viz-border-subtle']).toBeDefined();

    // Elevated should be lighter than default for a light theme
    expect(vars['--viz-surface-elevated']).not.toBe(vars['--viz-surface-default']);
    expect(vars['--viz-surface-card']).not.toBe(vars['--viz-surface-default']);
  });

  it('derives accent-subtle as rgba from accent', () => {
    const parsed = parseDSInstance(baivFixture);
    const vars = generateCSSVars(parsed);

    // accent-subtle is derived from primary.surface.subtle if present,
    // otherwise from accent as rgba — BAIV has primary.surface.subtle so that's used directly
    expect(vars['--viz-accent-subtle']).toBeDefined();
  });

  it('does not derive vars when no surface-default exists', () => {
    const parsed = parseDSInstance(noComponentsFixture);
    const vars = generateCSSVars(parsed);

    // noComponentsFixture has no neutral.surface.default
    expect(vars['--viz-surface-elevated']).toBeUndefined();
    expect(vars['--viz-surface-card']).toBeUndefined();
  });

  it('handles component token string reference format', () => {
    const fixture = {
      '@graph': [
        {
          '@id': 'test:comp',
          '@type': 'ds:ComponentToken',
          'ds:tokenName': 'button.bg',
          'ds:componentName': 'Button',
          'ds:referencesSemanticToken': 'test:sem-primary',
        },
      ],
    };
    const parsed = parseDSInstance(fixture);
    expect(parsed.components).toHaveLength(1);
  });
});

// --- parseDSInstance: PageDefinition & TemplateDefinition (S7.6.5) ---

describe('parseDSInstance — pages and templates', () => {
  it('classifies PageDefinition nodes into pages array', () => {
    const fixture = {
      '@graph': [
        { '@id': 'test:page-home', '@type': 'ds:PageDefinition', 'ds:pageName': 'Home' },
        { '@id': 'test:page-about', '@type': 'ds:PageDefinition', 'ds:pageName': 'About' },
      ],
    };
    const result = parseDSInstance(fixture);
    expect(result.pages).toHaveLength(2);
    expect(result.pages[0]['ds:pageName']).toBe('Home');
  });

  it('classifies TemplateDefinition nodes into templates array', () => {
    const fixture = {
      '@graph': [
        { '@id': 'test:tmpl-default', '@type': 'ds:TemplateDefinition', 'ds:templateName': 'Default' },
      ],
    };
    const result = parseDSInstance(fixture);
    expect(result.templates).toHaveLength(1);
    expect(result.templates[0]['ds:templateName']).toBe('Default');
  });

  it('initialises pages and templates as empty arrays for empty graph', () => {
    const result = parseDSInstance({ '@graph': [] });
    expect(result.pages).toHaveLength(0);
    expect(result.templates).toHaveLength(0);
  });

  it('includes page/template counts in summary', () => {
    const fixture = {
      '@graph': [
        { '@id': 'test:system', '@type': 'ds:DesignSystem', 'ds:name': 'Test', 'ds:version': '1.0' },
        { '@id': 'test:page-1', '@type': 'ds:PageDefinition', 'ds:pageName': 'P1' },
        { '@id': 'test:page-2', '@type': 'ds:PageDefinition', 'ds:pageName': 'P2' },
        { '@id': 'test:tmpl-1', '@type': 'ds:TemplateDefinition', 'ds:templateName': 'T1' },
      ],
    };
    const parsed = parseDSInstance(fixture);
    const summary = getDSInstanceSummary(parsed);
    expect(summary.pageCount).toBe(2);
    expect(summary.templateCount).toBe(1);
  });
});

// --- generateWorkflowMermaid (S7.6.7) ---

const processFixture = {
  'pe:processName': 'DS Token Extraction',
  'pe:hasPhase': [
    { 'pe:phaseId': 'phase-1', 'pe:phaseNumber': 1, 'pe:phaseName': 'Init', 'pe:estimatedDuration': 'PT5M' },
    { 'pe:phaseId': 'phase-2', 'pe:phaseNumber': 2, 'pe:phaseName': 'Extract', 'pe:estimatedDuration': 'PT15M' },
    { 'pe:phaseId': 'phase-3', 'pe:phaseNumber': 3, 'pe:phaseName': 'Validate', 'pe:estimatedDuration': 'PT10M' },
  ],
  'pe:hasGate': [
    { 'pe:gateName': 'Readiness', 'pe:afterPhase': 'phase-1' },
    { 'pe:gateName': 'Quality', 'pe:afterPhase': 'phase-2' },
  ],
};

describe('generateWorkflowMermaid', () => {
  it('returns empty string for null input', () => {
    expect(generateWorkflowMermaid(null)).toBe('');
  });

  it('returns empty string for missing phases', () => {
    expect(generateWorkflowMermaid({})).toBe('');
    expect(generateWorkflowMermaid({ 'pe:hasPhase': [] })).toBe('');
  });

  it('generates valid Mermaid starting with flowchart TD', () => {
    const mermaid = generateWorkflowMermaid(processFixture);
    expect(mermaid).toMatch(/^flowchart TD/);
  });

  it('includes all 3 phases', () => {
    const mermaid = generateWorkflowMermaid(processFixture);
    expect(mermaid).toContain('Phase 1: Init');
    expect(mermaid).toContain('Phase 2: Extract');
    expect(mermaid).toContain('Phase 3: Validate');
  });

  it('includes 2 gates', () => {
    const mermaid = generateWorkflowMermaid(processFixture);
    expect(mermaid).toContain('GATE-1: Readiness');
    expect(mermaid).toContain('GATE-2: Quality');
  });

  it('includes START and Complete nodes', () => {
    const mermaid = generateWorkflowMermaid(processFixture);
    expect(mermaid).toContain('START');
    expect(mermaid).toContain('Complete');
    expect(mermaid).toContain('DONE');
  });

  it('includes duration labels', () => {
    const mermaid = generateWorkflowMermaid(processFixture);
    expect(mermaid).toContain('~5min');
    expect(mermaid).toContain('~15min');
    expect(mermaid).toContain('~10min');
  });

  it('generates edges connecting phases and gates in sequence', () => {
    const mermaid = generateWorkflowMermaid(processFixture);
    expect(mermaid).toContain('START --> P1');
    expect(mermaid).toContain('P1 --> G1');
    expect(mermaid).toContain('G1 --> P2');
    expect(mermaid).toContain('P2 --> G2');
    expect(mermaid).toContain('G2 --> P3');
    expect(mermaid).toContain('P3 --> DONE');
  });

  it('includes style definitions', () => {
    const mermaid = generateWorkflowMermaid(processFixture);
    expect(mermaid).toContain('classDef startNode');
    expect(mermaid).toContain('classDef phaseNode');
    expect(mermaid).toContain('classDef gateNode');
    expect(mermaid).toContain('classDef doneNode');
  });

  it('handles process with no gates', () => {
    const noGates = {
      'pe:processName': 'Simple',
      'pe:hasPhase': [
        { 'pe:phaseId': 'p1', 'pe:phaseNumber': 1, 'pe:phaseName': 'Only Phase', 'pe:estimatedDuration': 'PT2M' },
      ],
    };
    const mermaid = generateWorkflowMermaid(noGates);
    expect(mermaid).toContain('Phase 1: Only Phase');
    expect(mermaid).not.toContain('GATE');
    expect(mermaid).toContain('START --> P1');
    expect(mermaid).toContain('P1 --> DONE');
  });

  it('sorts phases by phaseNumber', () => {
    const unordered = {
      'pe:processName': 'Out of Order',
      'pe:hasPhase': [
        { 'pe:phaseId': 'p3', 'pe:phaseNumber': 3, 'pe:phaseName': 'Third', 'pe:estimatedDuration': 'PT1M' },
        { 'pe:phaseId': 'p1', 'pe:phaseNumber': 1, 'pe:phaseName': 'First', 'pe:estimatedDuration': 'PT1M' },
        { 'pe:phaseId': 'p2', 'pe:phaseNumber': 2, 'pe:phaseName': 'Second', 'pe:estimatedDuration': 'PT1M' },
      ],
    };
    const mermaid = generateWorkflowMermaid(unordered);
    const p1Pos = mermaid.indexOf('Phase 1: First');
    const p2Pos = mermaid.indexOf('Phase 2: Second');
    const p3Pos = mermaid.indexOf('Phase 3: Third');
    expect(p1Pos).toBeLessThan(p2Pos);
    expect(p2Pos).toBeLessThan(p3Pos);
  });
});

// --- addDSGraphEntry (S7.6.4, S7.6.5) ---

describe('addDSGraphEntry', () => {
  it('returns error for null parsed', () => {
    const result = addDSGraphEntry(null, { '@type': 'ds:DesignComponent', '@id': 'test:c1' });
    expect(result.success).toBe(false);
  });

  it('returns error for entry without @type', () => {
    const parsed = parseDSInstance({ '@graph': [] });
    const result = addDSGraphEntry(parsed, { '@id': 'test:c1' });
    expect(result.success).toBe(false);
    expect(result.error).toContain('@type');
  });

  it('returns error for entry without @id', () => {
    const parsed = parseDSInstance({ '@graph': [] });
    const result = addDSGraphEntry(parsed, { '@type': 'ds:DesignComponent' });
    expect(result.success).toBe(false);
    expect(result.error).toContain('@id');
  });

  it('adds DesignComponent to components array', () => {
    const parsed = parseDSInstance({ '@graph': [] });
    const entry = { '@type': 'ds:DesignComponent', '@id': 'test:comp-1', 'ds:componentName': 'Button' };
    const result = addDSGraphEntry(parsed, entry);
    expect(result.success).toBe(true);
    expect(parsed.components).toHaveLength(1);
    expect(parsed.components[0]['ds:componentName']).toBe('Button');
  });

  it('adds ComponentToken to components array', () => {
    const parsed = parseDSInstance({ '@graph': [] });
    const entry = { '@type': 'ds:ComponentToken', '@id': 'test:ct-1', 'ds:tokenName': 'button.bg' };
    const result = addDSGraphEntry(parsed, entry);
    expect(result.success).toBe(true);
    expect(parsed.components).toHaveLength(1);
  });

  it('adds PageDefinition to pages array', () => {
    const parsed = parseDSInstance({ '@graph': [] });
    const entry = { '@type': 'ds:PageDefinition', '@id': 'test:page-home', 'ds:pageName': 'Home' };
    const result = addDSGraphEntry(parsed, entry);
    expect(result.success).toBe(true);
    expect(parsed.pages).toHaveLength(1);
  });

  it('adds TemplateDefinition to templates array', () => {
    const parsed = parseDSInstance({ '@graph': [] });
    const entry = { '@type': 'ds:TemplateDefinition', '@id': 'test:tmpl-default', 'ds:templateName': 'Default' };
    const result = addDSGraphEntry(parsed, entry);
    expect(result.success).toBe(true);
    expect(parsed.templates).toHaveLength(1);
  });

  it('rejects duplicate @id', () => {
    const parsed = parseDSInstance({ '@graph': [] });
    const entry = { '@type': 'ds:PageDefinition', '@id': 'test:page-dup', 'ds:pageName': 'Dup' };
    addDSGraphEntry(parsed, entry);
    const result = addDSGraphEntry(parsed, entry);
    expect(result.success).toBe(false);
    expect(result.error).toContain('Duplicate');
  });

  it('rejects unknown @type', () => {
    const parsed = parseDSInstance({ '@graph': [] });
    const entry = { '@type': 'ds:UnknownType', '@id': 'test:unknown-1' };
    const result = addDSGraphEntry(parsed, entry);
    expect(result.success).toBe(false);
    expect(result.error).toContain('Unknown @type');
  });

  it('adds all standard DS types', () => {
    const parsed = parseDSInstance({ '@graph': [] });
    const types = [
      ['ds:PrimitiveToken', 'primitives'],
      ['ds:SemanticToken', 'semantics'],
      ['ds:TokenCategory', 'categories'],
      ['ds:BrandVariant', 'variants'],
      ['ds:FigmaSource', 'figmaSources'],
      ['ds:ThemeMode', 'modes'],
      ['ds:DesignPattern', 'patterns'],
    ];
    for (const [type, arr] of types) {
      const result = addDSGraphEntry(parsed, { '@type': type, '@id': `test:${arr}-1` });
      expect(result.success).toBe(true);
      expect(parsed[arr]).toHaveLength(1);
    }
  });
});

// --- saveDSArtefact, bumpDSArtefactVersion, getDSArtefactHistory (S7.6.6) ---

import { state as mockState } from '../js/state.js';

describe('saveDSArtefact', () => {
  beforeEach(() => {
    mockState.dsInstances.clear();
    mockState.dsArtefactHistory.clear();
  });

  it('returns error for unloaded brand', () => {
    const result = saveDSArtefact('nonexistent', { '@type': 'ds:PageDefinition', '@id': 'test:p1' });
    expect(result.success).toBe(false);
    expect(result.error).toContain('not loaded');
  });

  it('adds artefact to parsed instance and creates version history', () => {
    const parsed = parseDSInstance({ '@graph': [] });
    mockState.dsInstances.set('test-brand', parsed);

    const artefact = {
      '@type': 'ds:PageDefinition',
      '@id': 'test:page-home',
      'ds:pageName': 'Home',
      'ds:version': '1.0.0',
    };
    const result = saveDSArtefact('test-brand', artefact);
    expect(result.success).toBe(true);
    expect(parsed.pages).toHaveLength(1);

    const history = getDSArtefactHistory('test:page-home');
    expect(history).toHaveLength(1);
    expect(history[0].version).toBe('1.0.0');
    expect(history[0].changes).toBe('Initial creation');
  });
});

describe('bumpDSArtefactVersion', () => {
  beforeEach(() => {
    mockState.dsInstances.clear();
    mockState.dsArtefactHistory.clear();
  });

  it('returns error for unloaded brand', () => {
    const result = bumpDSArtefactVersion('missing', 'test:p1', 'patch');
    expect(result.success).toBe(false);
  });

  it('returns error for missing artefact', () => {
    const parsed = parseDSInstance({ '@graph': [] });
    mockState.dsInstances.set('test-brand', parsed);
    const result = bumpDSArtefactVersion('test-brand', 'test:nonexistent', 'patch');
    expect(result.success).toBe(false);
    expect(result.error).toContain('not found');
  });

  it('bumps patch version', () => {
    const parsed = parseDSInstance({ '@graph': [] });
    parsed.pages.push({ '@id': 'test:page-1', '@type': 'ds:PageDefinition', 'ds:version': '1.0.0' });
    mockState.dsInstances.set('brand', parsed);

    const result = bumpDSArtefactVersion('brand', 'test:page-1', 'patch');
    expect(result.success).toBe(true);
    expect(result.oldVersion).toBe('1.0.0');
    expect(result.newVersion).toBe('1.0.1');
    expect(parsed.pages[0]['ds:version']).toBe('1.0.1');
  });

  it('bumps minor version and resets patch', () => {
    const parsed = parseDSInstance({ '@graph': [] });
    parsed.pages.push({ '@id': 'test:page-2', '@type': 'ds:PageDefinition', 'ds:version': '1.2.3' });
    mockState.dsInstances.set('brand', parsed);

    const result = bumpDSArtefactVersion('brand', 'test:page-2', 'minor');
    expect(result.success).toBe(true);
    expect(result.newVersion).toBe('1.3.0');
  });

  it('bumps major version and resets minor+patch', () => {
    const parsed = parseDSInstance({ '@graph': [] });
    parsed.templates.push({ '@id': 'test:tmpl-1', '@type': 'ds:TemplateDefinition', 'ds:version': '2.1.5' });
    mockState.dsInstances.set('brand', parsed);

    const result = bumpDSArtefactVersion('brand', 'test:tmpl-1', 'major');
    expect(result.success).toBe(true);
    expect(result.newVersion).toBe('3.0.0');
  });

  it('records bump in version history', () => {
    const parsed = parseDSInstance({ '@graph': [] });
    parsed.pages.push({ '@id': 'test:page-3', '@type': 'ds:PageDefinition', 'ds:version': '1.0.0' });
    mockState.dsInstances.set('brand', parsed);

    bumpDSArtefactVersion('brand', 'test:page-3', 'patch');
    const history = getDSArtefactHistory('test:page-3');
    expect(history).toHaveLength(1);
    expect(history[0].version).toBe('1.0.1');
    expect(history[0].changes).toContain('patch bump');
  });
});

// --- getDSArtefactHistory ---

describe('getDSArtefactHistory', () => {
  beforeEach(() => {
    mockState.dsArtefactHistory.clear();
  });

  it('returns empty array for unknown artefact', () => {
    expect(getDSArtefactHistory('nonexistent')).toEqual([]);
  });

  it('returns history chain in order', () => {
    mockState.dsArtefactHistory.set('test:art-1', [
      { version: '1.0.0', timestamp: '2026-02-09', changes: 'Initial' },
      { version: '1.0.1', timestamp: '2026-02-10', changes: 'Fix' },
    ]);
    const history = getDSArtefactHistory('test:art-1');
    expect(history).toHaveLength(2);
    expect(history[0].version).toBe('1.0.0');
    expect(history[1].version).toBe('1.0.1');
  });
});

// --- DS-ONT v1.3.0: DesignRule & ComponentDesignRule (S7.7.1 / S7.7.4) ---

const v130Fixture = {
  '@context': { 'ds': 'https://platformcore.io/ontology/ds/' },
  '@graph': [
    { '@id': 'test:system', '@type': 'ds:DesignSystem', 'ds:name': 'Test DS', 'ds:version': '1.0.0' },
    { '@id': 'test:sem-1', '@type': 'ds:SemanticToken', 'ds:tokenName': 'primary', 'ds:lightModeValue': '#00a4bf' },
    { '@id': 'test:comp-btn', '@type': 'ds:DesignComponent', 'ds:componentName': 'Button', 'ds:category': 'Atom' },
    {
      '@id': 'test:rule-canvas-001',
      '@type': 'ds:DesignRule',
      'ds:ruleId': 'DR-CANVAS-001',
      'ds:ruleName': 'Canvas Background Immutability',
      'ds:ruleCategory': 'Canvas',
      'ds:scope': 'GlobalSystem',
      'ds:condition': 'IF neutral.surface.default is set by brand',
      'ds:requirement': 'THEN luminance MUST be < 0.05 or >= 0.2',
      'ds:severity': 'error',
      'ds:priority': 1,
      'ds:mutabilityTier': 'PF-Core',
    },
    {
      '@id': 'test:rule-graph-001',
      '@type': 'ds:DesignRule',
      'ds:ruleId': 'DR-GRAPH-001',
      'ds:ruleName': 'Node Base Colour',
      'ds:ruleCategory': 'Graph',
      'ds:scope': 'GlobalSystem',
      'ds:condition': 'IF entity.type is defined',
      'ds:requirement': 'THEN node colour MUST use TYPE_COLORS palette',
      'ds:severity': 'warning',
      'ds:priority': 2,
      'ds:mutabilityTier': 'PF-Core',
    },
    {
      '@id': 'test:rule-comp-btn-contrast',
      '@type': 'ds:ComponentDesignRule',
      'ds:ruleId': 'DR-COMP-BUTTON-001',
      'ds:ruleName': 'Button Background Contrast',
      'ds:ruleCategory': 'Component',
      'ds:scope': 'ComponentDefinition',
      'ds:condition': 'IF button background token is set',
      'ds:requirement': 'THEN contrast ratio MUST be >= 4.5:1',
      'ds:severity': 'error',
      'ds:priority': 1,
      'ds:mutabilityTier': 'PF-Instance',
      'ds:targetComponent': { '@id': 'test:comp-btn' },
      'ds:constraintType': 'ContrastRatio',
      'ds:constraintTarget': 'background',
      'ds:constraintValue': '4.5',
    },
  ],
};

describe('parseDSInstance — DesignRule v1.3.0', () => {
  it('classifies DesignRule nodes into designRules array', () => {
    const result = parseDSInstance(v130Fixture);
    expect(result.designRules).toHaveLength(3);
  });

  it('classifies ComponentDesignRule into designRules array', () => {
    const result = parseDSInstance(v130Fixture);
    const compRules = result.designRules.filter(r => r['@type'] === 'ds:ComponentDesignRule');
    expect(compRules).toHaveLength(1);
    expect(compRules[0]['ds:ruleId']).toBe('DR-COMP-BUTTON-001');
  });

  it('preserves all DesignRule properties', () => {
    const result = parseDSInstance(v130Fixture);
    const rule = result.designRules.find(r => r['ds:ruleId'] === 'DR-CANVAS-001');
    expect(rule['ds:ruleName']).toBe('Canvas Background Immutability');
    expect(rule['ds:ruleCategory']).toBe('Canvas');
    expect(rule['ds:scope']).toBe('GlobalSystem');
    expect(rule['ds:severity']).toBe('error');
    expect(rule['ds:priority']).toBe(1);
    expect(rule['ds:mutabilityTier']).toBe('PF-Core');
  });

  it('preserves ComponentDesignRule constraint properties', () => {
    const result = parseDSInstance(v130Fixture);
    const rule = result.designRules.find(r => r['@type'] === 'ds:ComponentDesignRule');
    expect(rule['ds:constraintType']).toBe('ContrastRatio');
    expect(rule['ds:constraintTarget']).toBe('background');
    expect(rule['ds:constraintValue']).toBe('4.5');
    expect(rule['ds:targetComponent']['@id']).toBe('test:comp-btn');
  });

  it('initialises designRules as empty array for empty graph', () => {
    const result = parseDSInstance({ '@graph': [] });
    expect(result.designRules).toHaveLength(0);
  });

  it('backward compat: v1.2.0 instance without rules still parses cleanly', () => {
    const result = parseDSInstance(baivFixture);
    expect(result.designRules).toHaveLength(0);
    expect(result.designSystem).not.toBeNull();
    expect(result.primitives).toHaveLength(3);
    expect(result.semantics).toHaveLength(10);
  });
});

describe('buildDSTokenGraph — DesignRule nodes', () => {
  it('renders DesignRule nodes as box with severity icon', () => {
    const parsed = parseDSInstance(v130Fixture);
    const graph = buildDSTokenGraph(parsed);

    const ruleNode = graph.nodes.find(n => n.id === 'test:rule-canvas-001');
    expect(ruleNode).toBeDefined();
    expect(ruleNode.shape).toBe('box');
    expect(ruleNode.label).toContain('DR-CANVAS-001');
    expect(ruleNode.label).toContain('[!]'); // error severity
    expect(ruleNode._dsType).toBe('DesignRule');
  });

  it('renders ComponentDesignRule nodes with amber color', () => {
    const parsed = parseDSInstance(v130Fixture);
    const graph = buildDSTokenGraph(parsed);

    const compRuleNode = graph.nodes.find(n => n.id === 'test:rule-comp-btn-contrast');
    expect(compRuleNode).toBeDefined();
    expect(compRuleNode.color.background).toBe('#FFB84D');
    expect(compRuleNode._dsType).toBe('ComponentDesignRule');
  });

  it('creates hasRule edges from DesignSystem to system-level rules', () => {
    const parsed = parseDSInstance(v130Fixture);
    const graph = buildDSTokenGraph(parsed);

    const sysRuleEdges = graph.edges.filter(
      e => e.label === 'hasRule' && e.from === 'test:system'
    );
    // 2 system-level DesignRules (not ComponentDesignRule)
    expect(sysRuleEdges).toHaveLength(2);
  });

  it('creates hasRule edges from DesignComponent to ComponentDesignRules', () => {
    const parsed = parseDSInstance(v130Fixture);
    const graph = buildDSTokenGraph(parsed);

    const compRuleEdges = graph.edges.filter(
      e => e.label === 'hasRule' && e.from === 'test:comp-btn'
    );
    expect(compRuleEdges).toHaveLength(1);
    expect(compRuleEdges[0].to).toBe('test:rule-comp-btn-contrast');
  });

  it('renders warning severity icon as ~', () => {
    const parsed = parseDSInstance(v130Fixture);
    const graph = buildDSTokenGraph(parsed);

    const warnNode = graph.nodes.find(n => n.id === 'test:rule-graph-001');
    expect(warnNode).toBeDefined();
    expect(warnNode.label).toContain('[~]');
  });

  it('backward compat: v1.2.0 instance graph builds without rule nodes', () => {
    const parsed = parseDSInstance(baivFixture);
    const graph = buildDSTokenGraph(parsed);

    const ruleNodes = graph.nodes.filter(n => n._dsType === 'DesignRule' || n._dsType === 'ComponentDesignRule');
    expect(ruleNodes).toHaveLength(0);
    // Existing 18 nodes unchanged
    expect(graph.nodes).toHaveLength(18);
  });
});

describe('addDSGraphEntry — DesignRule types', () => {
  it('adds DesignRule to designRules array', () => {
    const parsed = parseDSInstance({ '@graph': [] });
    const entry = {
      '@type': 'ds:DesignRule',
      '@id': 'test:rule-1',
      'ds:ruleId': 'DR-TEST-001',
    };
    const result = addDSGraphEntry(parsed, entry);
    expect(result.success).toBe(true);
    expect(parsed.designRules).toHaveLength(1);
  });

  it('adds ComponentDesignRule to designRules array', () => {
    const parsed = parseDSInstance({ '@graph': [] });
    const entry = {
      '@type': 'ds:ComponentDesignRule',
      '@id': 'test:comp-rule-1',
      'ds:ruleId': 'DR-COMP-001',
    };
    const result = addDSGraphEntry(parsed, entry);
    expect(result.success).toBe(true);
    expect(parsed.designRules).toHaveLength(1);
  });

  it('rejects duplicate DesignRule @id', () => {
    const parsed = parseDSInstance({ '@graph': [] });
    const entry = { '@type': 'ds:DesignRule', '@id': 'test:rule-dup' };
    addDSGraphEntry(parsed, entry);
    const result = addDSGraphEntry(parsed, entry);
    expect(result.success).toBe(false);
    expect(result.error).toContain('Duplicate');
  });

  it('backward compat: adds to designRules array even if missing from old parsed instance', () => {
    // Simulate a v1.2.0 parsed instance that lacks designRules property
    const oldParsed = {
      designSystem: null,
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
      // No designRules property — v1.2.0 format
    };
    const entry = { '@type': 'ds:DesignRule', '@id': 'test:rule-compat' };
    const result = addDSGraphEntry(oldParsed, entry);
    expect(result.success).toBe(true);
    expect(oldParsed.designRules).toHaveLength(1);
  });
});

describe('getDSInstanceSummary — designRuleCount', () => {
  it('includes designRuleCount for v1.3.0 instance', () => {
    const parsed = parseDSInstance(v130Fixture);
    const summary = getDSInstanceSummary(parsed);
    expect(summary.designRuleCount).toBe(3);
  });

  it('returns 0 designRuleCount for v1.2.0 instance', () => {
    const parsed = parseDSInstance(baivFixture);
    parsed._meta = { brand: 'baiv' };
    const summary = getDSInstanceSummary(parsed);
    expect(summary.designRuleCount).toBe(0);
  });
});

describe('bumpDSArtefactVersion — DesignRule artefacts', () => {
  beforeEach(() => {
    mockState.dsInstances.clear();
    mockState.dsArtefactHistory.clear();
  });

  it('can bump version of a DesignRule artefact', () => {
    const parsed = parseDSInstance({ '@graph': [] });
    parsed.designRules.push({
      '@id': 'test:rule-bump',
      '@type': 'ds:DesignRule',
      'ds:version': '1.0.0',
    });
    mockState.dsInstances.set('brand', parsed);

    const result = bumpDSArtefactVersion('brand', 'test:rule-bump', 'minor');
    expect(result.success).toBe(true);
    expect(result.newVersion).toBe('1.1.0');
  });
});

// --- traceTokenResolution (S7.6.7) ---

const traceFixture = {
  '@context': { 'ds': 'https://platformcore.io/ontology/ds/' },
  '@graph': [
    { '@id': 'test:system', '@type': 'ds:DesignSystem', 'ds:name': 'Trace DS' },
    { '@id': 'test:prim-blue', '@type': 'ds:PrimitiveToken', 'ds:tokenName': 'blue-500', 'ds:value': '#2196F3' },
    {
      '@id': 'test:sem-primary',
      '@type': 'ds:SemanticToken',
      'ds:tokenName': 'primary',
      'ds:lightModeValue': '#2196F3',
      'ds:aliasRef': { '@id': 'test:prim-blue' },
    },
    {
      '@id': 'test:comp-btn-bg',
      '@type': 'ds:ComponentToken',
      'ds:tokenName': 'button.primary.background',
      'ds:referencesToken': { '@id': 'test:sem-primary' },
    },
    { '@id': 'test:comp-btn', '@type': 'ds:DesignComponent', 'ds:componentName': 'Button', 'ds:category': 'Atom' },
    { '@id': 'test:prim-grey', '@type': 'ds:PrimitiveToken', 'ds:tokenName': 'grey-100', 'ds:value': '#F5F5F5' },
  ],
};

describe('traceTokenResolution — S7.6.7', () => {
  it('traces ComponentToken → SemanticToken → PrimitiveToken (3-tier chain)', () => {
    const parsed = parseDSInstance(traceFixture);
    const trace = traceTokenResolution('test:comp-btn-bg', parsed);

    expect(trace.path).toHaveLength(3);
    expect(trace.path[0].name).toBe('button.primary.background');
    expect(trace.path[1].name).toBe('primary');
    expect(trace.path[2].name).toBe('blue-500');
    expect(trace.path[2].value).toBe('#2196F3');
  });

  it('traces SemanticToken → PrimitiveToken (2-tier chain)', () => {
    const parsed = parseDSInstance(traceFixture);
    const trace = traceTokenResolution('test:sem-primary', parsed);

    expect(trace.path).toHaveLength(2);
    expect(trace.path[0].name).toBe('primary');
    expect(trace.path[1].name).toBe('blue-500');
  });

  it('returns single-node path for PrimitiveToken (leaf)', () => {
    const parsed = parseDSInstance(traceFixture);
    const trace = traceTokenResolution('test:prim-blue', parsed);

    expect(trace.path).toHaveLength(1);
    expect(trace.path[0].name).toBe('blue-500');
    expect(trace.path[0].value).toBe('#2196F3');
  });

  it('returns nodeIds for graph highlighting', () => {
    const parsed = parseDSInstance(traceFixture);
    const trace = traceTokenResolution('test:comp-btn-bg', parsed);

    expect(trace.nodeIds).toEqual(['test:comp-btn-bg', 'test:sem-primary', 'test:prim-blue']);
  });

  it('returns edgeIds for path edges', () => {
    const parsed = parseDSInstance(traceFixture);
    const trace = traceTokenResolution('test:comp-btn-bg', parsed);

    expect(trace.edgeIds).toHaveLength(2);
    expect(trace.edgeIds[0]).toBe('test:comp-btn-bg→test:sem-primary');
    expect(trace.edgeIds[1]).toBe('test:sem-primary→test:prim-blue');
  });

  it('returns empty path for unknown node', () => {
    const parsed = parseDSInstance(traceFixture);
    const trace = traceTokenResolution('test:nonexistent', parsed);

    expect(trace.path).toHaveLength(0);
    expect(trace.nodeIds).toHaveLength(0);
  });

  it('handles DesignComponent node (non-token, single node)', () => {
    const parsed = parseDSInstance(traceFixture);
    const trace = traceTokenResolution('test:comp-btn', parsed);

    expect(trace.path).toHaveLength(1);
    expect(trace.path[0].name).toBe('Button');
  });

  it('handles isolated PrimitiveToken with no inbound references', () => {
    const parsed = parseDSInstance(traceFixture);
    const trace = traceTokenResolution('test:prim-grey', parsed);

    expect(trace.path).toHaveLength(1);
    expect(trace.path[0].value).toBe('#F5F5F5');
  });
});
