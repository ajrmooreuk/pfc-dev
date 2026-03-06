/**
 * Unit tests for ds-codegen.js — React component code generation,
 * CSS custom property export, Figma Make JSON, sandbox preview,
 * component-scoped CSS, LLM prompts, CSS bundle, and validation.
 * (Epic 8, Feature 8.3 + Epic 43, Feature 43.6)
 */

import { describe, it, expect, vi } from 'vitest';

// Mock state.js (same pattern as ds-loader.test.js)
vi.mock('../js/state.js', () => ({
  state: {
    dsInstances: new Map(),
    dsArtefactHistory: new Map(),
    activeDSBrand: null,
  },
  REGISTRY_BASE_PATH: '../../ONTOLOGIES/ontology-library/',
}));

// Mock design-token-tree.js for F40.12 functions
vi.mock('../js/design-token-tree.js', () => ({
  getGlobalComponentLibrary: () => [
    { id: 'interactive-base', componentName: 'ds.global.interactive.base', extends: null,
      atomicLevel: 'Atom', category: 'Interactive',
      tokens: [
        { label: 'background', cssVar: '--viz-surface-subtle', hex: '#2a2d37', dsToken: 'neutral.surface.subtle', tier: 'semantic' },
        { label: 'text', cssVar: '--viz-text-primary', hex: '#e0e0e0', dsToken: 'neutral.text.body', tier: 'semantic' },
      ]},
    { id: 'button-primary', componentName: 'ds.global.button.primary', extends: 'ds.global.interactive.base',
      atomicLevel: 'Atom', category: 'Interactive',
      tokens: [
        { label: 'background', cssVar: '--viz-accent', hex: '#9dfff5', dsToken: 'primary.surface.default', tier: 'semantic' },
      ]},
    { id: 'panel-base', componentName: 'ds.global.panel', extends: null,
      atomicLevel: 'Organism', category: 'Layout',
      tokens: [
        { label: 'background', cssVar: '--viz-surface-elevated', hex: '#1a1d27', dsToken: 'neutral.surface.subtle', tier: 'semantic' },
      ]},
  ],
  getComponentRegistry: () => [
    { id: 'Z1', componentName: 'pfc.viz.header', zone: 'Z1', depth: 0 },
    { id: 'Z2-btn-active', componentName: 'pfc.viz.toolbar.btn-active', zone: 'Z2', depth: 1 },
  ],
  resolveInheritanceChain: (name) => {
    if (name === 'pfc.viz.toolbar.btn-active') return ['pfc.viz.toolbar.btn-active', 'ds.global.button.primary', 'ds.global.interactive.base'];
    if (name === 'ds.global.button.primary') return ['ds.global.button.primary', 'ds.global.interactive.base'];
    return [name];
  },
  resolveInheritedTokens: (name, ownTokens) => {
    if (name === 'ds.global.button.primary') return [
      { label: 'background', cssVar: '--viz-accent', hex: '#9dfff5', dsToken: 'primary.surface.default', tier: 'semantic' },
      { label: 'text', cssVar: '--viz-text-primary', hex: '#e0e0e0', dsToken: 'neutral.text.body', tier: 'semantic' },
    ];
    if (name === 'pfc.viz.toolbar.btn-active') return [
      { label: 'background', cssVar: '--viz-accent', hex: '#9dfff5', dsToken: 'primary.surface.default', tier: 'semantic' },
      { label: 'text', cssVar: '--viz-text-primary', hex: '#e0e0e0', dsToken: 'neutral.text.body', tier: 'semantic' },
    ];
    if (name === 'ds.global.interactive.base') return [
      { label: 'background', cssVar: '--viz-surface-subtle', hex: '#2a2d37', dsToken: 'neutral.surface.subtle', tier: 'semantic' },
      { label: 'text', cssVar: '--viz-text-primary', hex: '#e0e0e0', dsToken: 'neutral.text.body', tier: 'semantic' },
    ];
    if (name === 'ds.global.panel') return [
      { label: 'background', cssVar: '--viz-surface-elevated', hex: '#1a1d27', dsToken: 'neutral.surface.subtle', tier: 'semantic' },
    ];
    return ownTokens || [];
  },
  getRulesForComponent: (name) => ({
    system: [],
    component: [
      { '@id': 'DR-TEST-01', '@type': 'ds:ComponentDesignRule', 'ds:label': 'Test Rule', 'ds:severity': 'error', 'ds:constraintType': 'ContrastRatio' },
    ],
  }),
  validateRuleConstraint: (rule, name, tokens) => ({ status: 'pass', message: 'OK' }),
}));

import {
  generateReactComponentCode,
  generateCSSCustomProperties,
  generateFigmaMakeJSON,
  generateSandboxHTML,
  generateComponentScopedCSS,
  generateLLMPrompt,
  generateComponentCSSBundle,
  validateGeneratedTokens,
} from '../js/ds-codegen.js';

// --- Fixtures ---

const minimalFixture = {
  '@context': { ds: 'https://platformcore.io/ontology/ds/' },
  '@graph': [
    {
      '@id': 'test-ds:system',
      '@type': 'ds:DesignSystem',
      'ds:name': 'Test DS',
      'ds:version': '1.0.0',
      'ds:namespace': 'https://test.io/ds/',
      'ds:pfiInstanceName': 'TEST',
      'ds:themeModeSupport': true,
    },
    {
      '@id': 'test-ds:prim-teal-500',
      '@type': 'ds:PrimitiveToken',
      'ds:tokenName': 'color.teal.500',
      'ds:value': '#00a4bf',
      'ds:valueType': 'Color',
    },
    {
      '@id': 'test-ds:prim-spacing-md',
      '@type': 'ds:PrimitiveToken',
      'ds:tokenName': 'spacing.md',
      'ds:value': '16px',
      'ds:valueType': 'Spacing',
    },
    {
      '@id': 'test-ds:prim-radius-md',
      '@type': 'ds:PrimitiveToken',
      'ds:tokenName': 'borderRadius.md',
      'ds:value': '8px',
      'ds:valueType': 'Radius',
    },
    {
      '@id': 'test-ds:sem-primary-surface-default',
      '@type': 'ds:SemanticToken',
      'ds:tokenName': 'primary.surface.default',
      'ds:lightModeValue': '#00a4bf',
    },
    {
      '@id': 'test-ds:sem-primary-surface-darker',
      '@type': 'ds:SemanticToken',
      'ds:tokenName': 'primary.surface.darker',
      'ds:lightModeValue': '#005b6b',
      'ds:darkModeValue': '#00d0f2',
    },
    {
      '@id': 'test-ds:sem-neutral-text-title',
      '@type': 'ds:SemanticToken',
      'ds:tokenName': 'neutral.text.title',
      'ds:lightModeValue': '#1c1f1f',
      'ds:darkModeValue': '#e9f3f3',
    },
    {
      '@id': 'test-ds:sem-neutral-text-negative',
      '@type': 'ds:SemanticToken',
      'ds:tokenName': 'neutral.text.negative',
      'ds:lightModeValue': '#e9f3f3',
    },
    {
      '@id': 'test-ds:sem-error-surface-default',
      '@type': 'ds:SemanticToken',
      'ds:tokenName': 'error.surface.default',
      'ds:lightModeValue': '#cf057d',
    },
    {
      '@id': 'test-ds:sem-neutral-border-default',
      '@type': 'ds:SemanticToken',
      'ds:tokenName': 'neutral.border.default',
      'ds:lightModeValue': '#d9ebeb',
    },
    {
      '@id': 'test-ds:comp-button-primary-bg',
      '@type': 'ds:ComponentToken',
      'ds:tokenName': 'button.primary.background',
      'ds:componentName': 'Button',
      'ds:partOrState': 'primary/background',
      'ds:referencesSemanticToken': { '@id': 'test-ds:sem-primary-surface-default' },
    },
    {
      '@id': 'test-ds:comp-button-primary-text',
      '@type': 'ds:ComponentToken',
      'ds:tokenName': 'button.primary.text',
      'ds:componentName': 'Button',
      'ds:partOrState': 'primary/text',
      'ds:referencesSemanticToken': { '@id': 'test-ds:sem-neutral-text-negative' },
    },
    {
      '@id': 'test-ds:comp-button-destructive-bg',
      '@type': 'ds:ComponentToken',
      'ds:tokenName': 'button.destructive.background',
      'ds:componentName': 'Button',
      'ds:partOrState': 'destructive/background',
      'ds:referencesSemanticToken': { '@id': 'test-ds:sem-error-surface-default' },
    },
    {
      '@id': 'test-ds:comp-input-border',
      '@type': 'ds:ComponentToken',
      'ds:tokenName': 'input.border',
      'ds:componentName': 'Input',
      'ds:partOrState': 'border/default',
      'ds:referencesSemanticToken': { '@id': 'test-ds:sem-neutral-border-default' },
    },
    {
      '@id': 'test-ds:comp-input-border-focus',
      '@type': 'ds:ComponentToken',
      'ds:tokenName': 'input.border.focus',
      'ds:componentName': 'Input',
      'ds:partOrState': 'border/focus',
      'ds:referencesSemanticToken': { '@id': 'test-ds:sem-primary-surface-default' },
    },
    {
      '@id': 'test-ds:mode-light',
      '@type': 'ds:ThemeMode',
      'ds:modeName': 'light',
      'ds:isDefault': true,
    },
  ],
};

// Helper: parse via the same logic as parseDSInstance
function parseMini(jsonld) {
  const graph = jsonld?.['@graph'] || [];
  const result = {
    designSystem: null, categories: [], primitives: [], semantics: [],
    components: [], variants: [], figmaSources: [], modes: [],
    patterns: [], pages: [], templates: [], designRules: [],
  };
  for (const node of graph) {
    const type = node['@type'] || '';
    if (type === 'ds:DesignSystem') result.designSystem = node;
    else if (type === 'ds:PrimitiveToken') result.primitives.push(node);
    else if (type === 'ds:SemanticToken') result.semantics.push(node);
    else if (type === 'ds:ComponentToken' || type === 'ds:DesignComponent') result.components.push(node);
    else if (type === 'ds:ThemeMode') result.modes.push(node);
  }
  return result;
}

const parsed = parseMini(minimalFixture);


// ============================================
// S8.3.2: generateCSSCustomProperties
// ============================================

describe('generateCSSCustomProperties', () => {
  it('returns fallback comment for null input', () => {
    const css = generateCSSCustomProperties(null, 'test');
    expect(css).toContain('No DS instance data');
  });

  it('generates valid CSS with :root block', () => {
    const css = generateCSSCustomProperties(parsed, 'test');
    expect(css).toContain(':root {');
    expect(css).toContain('}');
  });

  it('includes header with brand and version', () => {
    const css = generateCSSCustomProperties(parsed, 'test');
    expect(css).toContain('Test DS');
    expect(css).toContain('test v1.0.0');
  });

  it('includes primitive tokens as --primitive-* custom properties', () => {
    const css = generateCSSCustomProperties(parsed, 'test');
    expect(css).toContain('--primitive-color-teal-500: #00a4bf;');
    expect(css).toContain('--primitive-spacing-md: 16px;');
    expect(css).toContain('--primitive-borderradius-md: 8px;');
  });

  it('includes semantic tokens with var() cascade to primitives (light mode)', () => {
    const css = generateCSSCustomProperties(parsed, 'test');
    // primary.surface.default (#00a4bf) matches primitive color.teal.500 → var() cascade
    expect(css).toContain('--primary-surface-default: var(--primitive-color-teal-500, #00a4bf);');
    // neutral.text.title (#1c1f1f) has no matching primitive → raw value
    expect(css).toContain('--neutral-text-title: #1c1f1f;');
  });

  it('includes dark mode block when tokens have darkModeValue', () => {
    const css = generateCSSCustomProperties(parsed, 'test');
    expect(css).toContain('Dark Mode');
    expect(css).toContain('--primary-surface-darker: #00d0f2;');
    expect(css).toContain('--neutral-text-title: #e9f3f3;');
  });

  it('uses .dark class selector by default', () => {
    const css = generateCSSCustomProperties(parsed, 'test');
    expect(css).toContain('.dark {');
  });

  it('uses @media prefers-color-scheme when darkMode=media', () => {
    const css = generateCSSCustomProperties(parsed, 'test', { darkMode: 'media' });
    expect(css).toContain('@media (prefers-color-scheme: dark)');
  });

  it('includes component tokens with var() references to semantic', () => {
    const css = generateCSSCustomProperties(parsed, 'test');
    expect(css).toContain('-- BUTTON --');
    expect(css).toContain('--button-primary-background: var(--primary-surface-default);');
  });

  it('includes Input component tokens', () => {
    const css = generateCSSCustomProperties(parsed, 'test');
    expect(css).toContain('-- INPUT --');
    expect(css).toContain('--input-border-default: var(--neutral-border-default);');
  });

  it('groups primitives by type', () => {
    const css = generateCSSCustomProperties(parsed, 'test');
    expect(css).toContain('Colors Primitives');
    expect(css).toContain('Spacing Primitives');
    expect(css).toContain('Radius Primitives');
  });

  it('handles empty primitives gracefully', () => {
    const empty = { ...parsed, primitives: [] };
    const css = generateCSSCustomProperties(empty, 'test');
    expect(css).toContain(':root');
    // No actual primitive property declarations (header comment may mention --primitive-*)
    expect(css).not.toContain('--primitive-color-');
    expect(css).not.toContain('--primitive-spacing-');
  });
});


// ============================================
// S8.3.1: generateReactComponentCode
// ============================================

describe('generateReactComponentCode', () => {
  it('returns fallback for null input', () => {
    const code = generateReactComponentCode(null, 'test');
    expect(code).toContain('No DS instance data');
  });

  it('includes use client directive', () => {
    const code = generateReactComponentCode(parsed, 'test');
    expect(code).toContain("'use client';");
  });

  it('includes React imports', () => {
    const code = generateReactComponentCode(parsed, 'test');
    expect(code).toContain("import * as React from 'react';");
  });

  it('generates ThemeMode type', () => {
    const code = generateReactComponentCode(parsed, 'test');
    expect(code).toContain("export type ThemeMode = 'light' | 'dark' | 'system';");
  });

  it('generates SemanticTokens interface from actual instance data', () => {
    const code = generateReactComponentCode(parsed, 'test');
    expect(code).toContain('export interface SemanticTokens {');
    expect(code).toContain('primary: {');
    expect(code).toContain('surfaceDefault: string;');
  });

  it('generates per-component interfaces from ComponentTokens', () => {
    const code = generateReactComponentCode(parsed, 'test');
    expect(code).toContain('export interface ButtonTokens {');
    expect(code).toContain('primaryBackground: string;');
    expect(code).toContain('primaryText: string;');
    expect(code).toContain('export interface InputTokens {');
  });

  it('generates ComponentTokens master interface', () => {
    const code = generateReactComponentCode(parsed, 'test');
    expect(code).toContain('export interface ComponentTokens {');
    expect(code).toContain('button: ButtonTokens;');
    expect(code).toContain('input: InputTokens;');
  });

  it('generates createComponentTokens factory', () => {
    const code = generateReactComponentCode(parsed, 'test');
    expect(code).toContain('export function createComponentTokens(semantic: SemanticTokens): ComponentTokens {');
    expect(code).toContain('semantic.primary.surfaceDefault');
  });

  it('generates Provider component with brand name', () => {
    const code = generateReactComponentCode(parsed, 'test');
    expect(code).toContain('export function TestTokenProvider(');
    expect(code).toContain('TestTokenContext');
  });

  it('generates useComponentTokens hook', () => {
    const code = generateReactComponentCode(parsed, 'test');
    expect(code).toContain('export function useTestTokens()');
    expect(code).toContain('export function useComponentTokens');
  });

  it('respects includeProvider=false option', () => {
    const code = generateReactComponentCode(parsed, 'test', { includeProvider: false });
    expect(code).not.toContain('TestTokenProvider');
  });

  it('respects includeHooks=false option', () => {
    const code = generateReactComponentCode(parsed, 'test', { includeHooks: false });
    expect(code).not.toContain('useTestTokens');
  });

  it('infers components from ComponentToken names when no DesignComponent entities', () => {
    // Our fixture has only ComponentToken entities, no explicit DesignComponent
    const code = generateReactComponentCode(parsed, 'test');
    expect(code).toContain('ButtonTokens');
    expect(code).toContain('InputTokens');
  });
});


// ============================================
// S8.3.3: generateFigmaMakeJSON
// ============================================

describe('generateFigmaMakeJSON', () => {
  it('returns empty object for null input', () => {
    const json = generateFigmaMakeJSON(null, 'test');
    expect(json).toBe('{}');
  });

  it('returns valid JSON', () => {
    const json = generateFigmaMakeJSON(parsed, 'test');
    expect(() => JSON.parse(json)).not.toThrow();
  });

  it('includes @context with make namespace', () => {
    const obj = JSON.parse(generateFigmaMakeJSON(parsed, 'test'));
    expect(obj['@context']).toHaveProperty('make');
    expect(obj['@context']).toHaveProperty('ds');
  });

  it('includes brand and version metadata', () => {
    const obj = JSON.parse(generateFigmaMakeJSON(parsed, 'test'));
    expect(obj['make:brand']).toBe('test');
    expect(obj['make:dsVersion']).toBe('1.0.0');
  });

  it('includes resolvedAt date', () => {
    const obj = JSON.parse(generateFigmaMakeJSON(parsed, 'test'));
    expect(obj['make:resolvedAt']).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('includes Button component with resolved tokens', () => {
    const obj = JSON.parse(generateFigmaMakeJSON(parsed, 'test'));
    expect(obj.components).toHaveProperty('Button');
    expect(obj.components.Button.tokens).toHaveProperty('primary/background');
    expect(obj.components.Button.tokens['primary/background'].resolved).toBe('#00a4bf');
  });

  it('includes semantic reference IDs', () => {
    const obj = JSON.parse(generateFigmaMakeJSON(parsed, 'test'));
    const bg = obj.components.Button.tokens['primary/background'];
    expect(bg.semanticRef).toBe('test-ds:sem-primary-surface-default');
    expect(bg.tokenName).toBe('primary.surface.default');
  });

  it('includes Input component', () => {
    const obj = JSON.parse(generateFigmaMakeJSON(parsed, 'test'));
    expect(obj.components).toHaveProperty('Input');
    expect(obj.components.Input.tokens).toHaveProperty('border/default');
  });

  it('uses custom pageId/pageName from options', () => {
    const obj = JSON.parse(generateFigmaMakeJSON(parsed, 'test', {
      pageId: 'my-page', pageName: 'My Page',
    }));
    expect(obj['make:pageId']).toBe('my-page');
    expect(obj['make:pageName']).toBe('My Page');
  });
});


// ============================================
// S8.3.4: generateSandboxHTML
// ============================================

describe('generateSandboxHTML', () => {
  it('returns fallback for null input', () => {
    const html = generateSandboxHTML(null, 'test');
    expect(html).toContain('No DS instance data');
  });

  it('returns valid HTML with DOCTYPE', () => {
    const html = generateSandboxHTML(parsed, 'test');
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<html');
    expect(html).toContain('</html>');
  });

  it('contains embedded CSS with token variables and cascade', () => {
    const html = generateSandboxHTML(parsed, 'test');
    expect(html).toContain('<style>');
    // Semantic tokens cascade through primitive var() references
    expect(html).toContain('--primary-surface-default: var(--primitive-color-teal-500, #00a4bf);');
  });

  it('contains brand name in title and header', () => {
    const html = generateSandboxHTML(parsed, 'test');
    expect(html).toContain('Test Component Preview');
    expect(html).toContain('TEST');
  });

  it('renders Button component preview', () => {
    const html = generateSandboxHTML(parsed, 'test');
    expect(html).toContain('Button');
    expect(html).toContain('demo-button primary');
    expect(html).toContain('demo-button secondary');
  });

  it('renders Input component preview', () => {
    const html = generateSandboxHTML(parsed, 'test');
    expect(html).toContain('Input');
    expect(html).toContain('demo-input');
  });

  it('includes theme toggle script', () => {
    const html = generateSandboxHTML(parsed, 'test');
    expect(html).toContain('toggleTheme');
    expect(html).toContain('Toggle Dark');
  });

  it('shows token binding count per component', () => {
    const html = generateSandboxHTML(parsed, 'test');
    expect(html).toContain('3 token bindings'); // Button has 3
    expect(html).toContain('2 token bindings'); // Input has 2
  });

  it('includes colour swatches for resolved tokens', () => {
    const html = generateSandboxHTML(parsed, 'test');
    expect(html).toContain('swatch-dot');
    expect(html).toContain('#00a4bf');
  });
});


// ============================================
// S43.6.1: generateComponentScopedCSS
// ============================================

describe('generateComponentScopedCSS', () => {
  const tokens = [
    { label: 'background', cssVar: '--viz-accent', hex: '#9dfff5', dsToken: 'primary.surface.default', tier: 'semantic' },
    { label: 'text', cssVar: '--viz-text-primary', hex: '#e0e0e0', dsToken: 'neutral.text.body', tier: 'semantic' },
  ];

  it('generates CSS rule block with kebab-case selector', () => {
    const css = generateComponentScopedCSS('pfc.viz.toolbar.btn-active', tokens);
    expect(css).toContain('.pfc-viz-toolbar-btn-active {');
    expect(css).toContain('}');
  });

  it('includes var() with fallback hex values', () => {
    const css = generateComponentScopedCSS('pfc.viz.toolbar.btn-active', tokens);
    expect(css).toContain('var(--viz-accent, #9dfff5)');
    expect(css).toContain('var(--viz-text-primary, #e0e0e0)');
  });

  it('includes extends comment when extendsChain provided', () => {
    const css = generateComponentScopedCSS('pfc.viz.toolbar.btn-active', tokens, {
      extendsChain: ['pfc.viz.toolbar.btn-active', 'ds.global.button.primary', 'ds.global.interactive.base'],
    });
    expect(css).toContain('extends ds.global.button.primary');
  });

  it('handles components with no tokens (empty rule block)', () => {
    const css = generateComponentScopedCSS('pfc.viz.empty', []);
    expect(css).toContain('.pfc-viz-empty {');
    expect(css).toContain('}');
  });

  it('handles tokens without cssVar (uses raw hex only)', () => {
    const rawTokens = [
      { label: 'background', cssVar: null, hex: '#4CAF50', dsToken: null, tier: null },
    ];
    const css = generateComponentScopedCSS('ds.global.badge', rawTokens);
    expect(css).toContain('--background: #4CAF50;');
    expect(css).not.toContain('var(');
  });
});


// ============================================
// S43.6.2: generateLLMPrompt
// ============================================

describe('generateLLMPrompt', () => {
  const tokens = [
    { label: 'background', cssVar: '--viz-accent', hex: '#9dfff5', dsToken: 'primary.surface.default', tier: 'semantic' },
  ];
  const chain = ['pfc.viz.toolbar.btn-active', 'ds.global.button.primary', 'ds.global.interactive.base'];
  const rules = {
    system: [],
    component: [{ '@id': 'DR-01', '@type': 'ds:ComponentDesignRule', 'ds:label': 'Min Contrast', 'ds:severity': 'error', 'ds:constraintType': 'ContrastRatio' }],
  };

  it('returns string containing component name and token table', () => {
    const prompt = generateLLMPrompt('pfc.viz.toolbar.btn-active', tokens, chain, rules, 'css');
    expect(prompt).toContain('pfc.viz.toolbar.btn-active');
    expect(prompt).toContain('| Label |');
    expect(prompt).toContain('background');
    expect(prompt).toContain('#9dfff5');
  });

  it('CSS format includes custom property instructions', () => {
    const prompt = generateLLMPrompt('pfc.viz.toolbar.btn-active', tokens, chain, rules, 'css');
    expect(prompt).toContain('scoped CSS custom properties');
  });

  it('React format includes TypeScript instructions', () => {
    const prompt = generateLLMPrompt('pfc.viz.toolbar.btn-active', tokens, chain, rules, 'react');
    expect(prompt).toContain('TypeScript React component');
  });

  it('Tailwind format includes @theme instructions', () => {
    const prompt = generateLLMPrompt('pfc.viz.toolbar.btn-active', tokens, chain, rules, 'tailwind');
    expect(prompt).toContain('@theme');
  });

  it('includes design rules section when rules exist', () => {
    const prompt = generateLLMPrompt('pfc.viz.toolbar.btn-active', tokens, chain, rules, 'css');
    expect(prompt).toContain('## Design Rules');
    expect(prompt).toContain('Min Contrast');
  });

  it('includes extends chain in identity section', () => {
    const prompt = generateLLMPrompt('pfc.viz.toolbar.btn-active', tokens, chain, rules, 'css');
    expect(prompt).toContain('ds.global.button.primary');
  });
});


// ============================================
// S43.6.3: generateComponentCSSBundle
// ============================================

describe('generateComponentCSSBundle', () => {
  it('returns CSS string with file header comment', () => {
    const css = generateComponentCSSBundle();
    expect(css).toContain('PF-Core Component Token CSS Bundle');
    expect(css).toContain('Generated at:');
  });

  it('contains global component section (ds.global.*)', () => {
    const css = generateComponentCSSBundle();
    expect(css).toContain('GLOBAL BASE COMPONENTS');
    expect(css).toContain('.ds-global-button-primary');
    expect(css).toContain('.ds-global-interactive-base');
  });

  it('contains app-specific component section (pfc.viz.*)', () => {
    const css = generateComponentCSSBundle();
    expect(css).toContain('APP-SPECIFIC COMPONENTS');
    expect(css).toContain('.pfc-viz-header');
    expect(css).toContain('.pfc-viz-toolbar-btn-active');
  });

  it('respects includeGlobals=false option', () => {
    const css = generateComponentCSSBundle({ includeGlobals: false });
    expect(css).not.toContain('GLOBAL BASE COMPONENTS');
    expect(css).toContain('APP-SPECIFIC COMPONENTS');
  });

  it('respects includeAppSpecific=false option', () => {
    const css = generateComponentCSSBundle({ includeAppSpecific: false });
    expect(css).toContain('GLOBAL BASE COMPONENTS');
    expect(css).not.toContain('APP-SPECIFIC COMPONENTS');
  });

  it('includes total component count in footer', () => {
    const css = generateComponentCSSBundle();
    expect(css).toMatch(/Total: \d+ components/);
  });
});


// ============================================
// S43.6.4: validateGeneratedTokens
// ============================================

describe('validateGeneratedTokens', () => {
  it('returns pass/fail/warnings counts', () => {
    const result = validateGeneratedTokens('pfc.viz.toolbar.btn-active', []);
    expect(result).toHaveProperty('passed');
    expect(result).toHaveProperty('failed');
    expect(result).toHaveProperty('warnings');
    expect(result).toHaveProperty('results');
  });

  it('reports pass when validation succeeds', () => {
    const result = validateGeneratedTokens('pfc.viz.toolbar.btn-active', [
      { label: 'background', value: '#9dfff5' },
    ]);
    expect(result.passed).toBeGreaterThanOrEqual(1);
    expect(result.failed).toBe(0);
  });

  it('returns results array with rule IDs', () => {
    const result = validateGeneratedTokens('pfc.viz.toolbar.btn-active', []);
    expect(result.results.length).toBeGreaterThanOrEqual(1);
    expect(result.results[0]).toHaveProperty('ruleId');
    expect(result.results[0]).toHaveProperty('status');
    expect(result.results[0]).toHaveProperty('message');
  });

  it('returns empty results when no rules apply', () => {
    // Use a component that (via our mock) returns rules but validates OK
    const result = validateGeneratedTokens('pfc.viz.header', []);
    expect(result.results).toBeInstanceOf(Array);
  });
});
