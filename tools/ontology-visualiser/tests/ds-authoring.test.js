/**
 * Unit tests for ds-authoring.js — DS component, page/template authoring,
 * Figma Make import, and version history rendering.
 * (Epic 7, Feature 7.6: Stories 7.6.4, 7.6.5, 7.6.6, 7.6.8)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Create shared artefact history map via vi.hoisted so it's available to mock factories
const { sharedHistory, sharedInstances } = vi.hoisted(() => ({
  sharedHistory: new Map(),
  sharedInstances: new Map(),
}));

// Stub DOM/localStorage before any module imports
vi.stubGlobal('localStorage', {
  getItem: vi.fn(() => null),
  setItem: vi.fn(),
});

vi.stubGlobal('document', {
  createElement: vi.fn(() => {
    let _text = '';
    return {
      get textContent() { return _text; },
      set textContent(v) { _text = v; },
      get innerHTML() {
        return _text
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
    };
  }),
  getElementById: vi.fn(() => null),
  querySelectorAll: vi.fn(() => []),
});

// Mock state.js
vi.mock('../js/state.js', () => ({
  state: {
    activeDSBrand: null,
    dsInstances: sharedInstances,
    dsArtefactHistory: sharedHistory,
  },
  REGISTRY_BASE_PATH: '../../ONTOLOGIES/ontology-library/',
}));

// Mock ds-loader.js
vi.mock('../js/ds-loader.js', () => ({
  addDSGraphEntry: vi.fn((parsed, entry) => {
    if (!parsed || !entry || !entry['@type'] || !entry['@id']) {
      return { success: false, error: 'Invalid entry: requires @type and @id' };
    }
    const typeMap = {
      'ds:DesignComponent': 'components',
      'ds:ComponentToken': 'components',
      'ds:PageDefinition': 'pages',
      'ds:TemplateDefinition': 'templates',
      'ds:DesignRule': 'designRules',
      'ds:ComponentDesignRule': 'designRules',
    };
    const arr = typeMap[entry['@type']];
    if (!arr) return { success: false, error: `Unknown @type: ${entry['@type']}` };
    if (parsed[arr].some(n => n['@id'] === entry['@id'])) {
      return { success: false, error: `Duplicate @id: ${entry['@id']}` };
    }
    parsed[arr].push(entry);
    return { success: true };
  }),
  getDSArtefactHistory: vi.fn((id) => {
    return sharedHistory.get(id) || [];
  }),
  saveDSArtefact: vi.fn(),
  bumpDSArtefactVersion: vi.fn(),
}));

import {
  hasDSInstanceLoaded,
  renderSemanticTokenOptions,
  importFigmaMakeAsPage,
  renderDSVersionHistory,
  validateComponentBindings,
  renderDSComponentBindings,
  removeDSTokenBinding,
  renderDSComponentRules,
} from '../js/ds-authoring.js';

import { state } from '../js/state.js';

// --- Fixtures ---

function makeParsedDS() {
  return {
    designSystem: { '@id': 'test-ds:system', '@type': 'ds:DesignSystem', 'ds:name': 'Test DS', 'ds:version': '1.0.0' },
    categories: [],
    primitives: [],
    semantics: [
      { '@id': 'test-ds:sem-primary', '@type': 'ds:SemanticToken', 'ds:tokenName': 'primary.surface.default', 'ds:lightModeValue': '#00a4bf' },
      { '@id': 'test-ds:sem-error', '@type': 'ds:SemanticToken', 'ds:tokenName': 'error.surface.default', 'ds:lightModeValue': '#cf057d' },
    ],
    components: [],
    variants: [],
    figmaSources: [],
    modes: [],
    patterns: [],
    pages: [],
    templates: [],
    designRules: [],
  };
}

// --- hasDSInstanceLoaded ---

describe('hasDSInstanceLoaded', () => {
  beforeEach(() => {
    state.activeDSBrand = null;
    sharedInstances.clear();
  });

  it('returns false when no brand is active', () => {
    expect(hasDSInstanceLoaded()).toBe(false);
  });

  it('returns false when brand is set but not in dsInstances', () => {
    state.activeDSBrand = 'missing-brand';
    expect(hasDSInstanceLoaded()).toBe(false);
  });

  it('returns true when brand is active and instance is loaded', () => {
    state.activeDSBrand = 'baiv';
    sharedInstances.set('baiv', makeParsedDS());
    expect(hasDSInstanceLoaded()).toBe(true);
  });
});

// --- renderSemanticTokenOptions ---

describe('renderSemanticTokenOptions', () => {
  it('returns "No tokens" option for null parsed', () => {
    const html = renderSemanticTokenOptions(null);
    expect(html).toContain('No tokens');
  });

  it('returns "No tokens" option for parsed with no semantics key', () => {
    const html = renderSemanticTokenOptions({});
    expect(html).toContain('No tokens');
  });

  it('renders options for each semantic token', () => {
    const parsed = makeParsedDS();
    const html = renderSemanticTokenOptions(parsed);
    expect(html).toContain('primary.surface.default');
    expect(html).toContain('#00a4bf');
    expect(html).toContain('error.surface.default');
    expect(html).toContain('#cf057d');
  });

  it('renders option values with @id', () => {
    const parsed = makeParsedDS();
    const html = renderSemanticTokenOptions(parsed);
    expect(html).toContain('test-ds:sem-primary');
    expect(html).toContain('test-ds:sem-error');
  });

  it('handles empty semantics array', () => {
    const html = renderSemanticTokenOptions({ semantics: [] });
    expect(html).toBe('');
  });
});

// --- importFigmaMakeAsPage ---

describe('importFigmaMakeAsPage', () => {
  it('returns null for null input', () => {
    expect(importFigmaMakeAsPage(null, 'baiv')).toBeNull();
  });

  it('converts minimal Figma Make JSON to PageDefinition', () => {
    const figmaMake = {
      'make:pageId': 'landing',
      'make:pageName': 'Landing Page',
      'make:description': 'Main marketing page',
      components: {},
    };
    const result = importFigmaMakeAsPage(figmaMake, 'baiv');

    expect(result['@type']).toBe('ds:PageDefinition');
    expect(result['@id']).toBe('baiv-ds:page-landing');
    expect(result['ds:pageId']).toBe('landing');
    expect(result['ds:pageName']).toBe('Landing Page');
    expect(result['ds:description']).toBe('Main marketing page');
    expect(result['ds:brand']).toBe('baiv');
    expect(result['ds:version']).toBe('1.0.0');
    expect(result['ds:importedFrom']).toBe('figma-make');
  });

  it('extracts component slots from Figma Make components', () => {
    const figmaMake = {
      'make:pageId': 'login',
      'make:pageName': 'Login Page',
      components: {
        header: { description: 'Top nav', tokens: { bg: '#fff', text: '#000' } },
        loginForm: { description: 'Login form area', tokens: { bg: '#f0f0f0' } },
        footer: { description: 'Footer area' },
      },
    };
    const result = importFigmaMakeAsPage(figmaMake, 'rcs');

    expect(result['@id']).toBe('rcs-ds:page-login');
    const slots = JSON.parse(result['ds:componentSlots']);
    expect(slots).toHaveLength(3);
    expect(slots[0].slotName).toBe('header');
    expect(slots[0].tokenCount).toBe(2);
    expect(slots[1].slotName).toBe('loginForm');
    expect(slots[1].tokenCount).toBe(1);
    expect(slots[2].slotName).toBe('footer');
    expect(slots[2].tokenCount).toBe(0);
  });

  it('handles missing optional fields', () => {
    const figmaMake = { components: {} };
    const result = importFigmaMakeAsPage(figmaMake, 'test');

    expect(result['ds:pageId']).toBe('unknown');
    expect(result['ds:pageName']).toBe('unknown');
    expect(result['ds:description']).toBe('');
    expect(result['ds:dsInstanceRef']).toBe('');
  });

  it('preserves make:dsInstanceRef when present', () => {
    const figmaMake = {
      'make:pageId': 'home',
      'make:pageName': 'Home',
      'make:dsInstanceRef': 'baiv-ds:system-baiv-v1.0',
      components: {},
    };
    const result = importFigmaMakeAsPage(figmaMake, 'baiv');
    expect(result['ds:dsInstanceRef']).toBe('baiv-ds:system-baiv-v1.0');
  });
});

// --- validateComponentBindings (S7.6.4 — BR validation) ---

describe('validateComponentBindings', () => {
  const parsed = makeParsedDS();

  it('returns valid for correct bindings referencing existing semantic tokens', () => {
    const bindings = [
      { part: 'background', ref: 'test-ds:sem-primary' },
      { part: 'text', ref: 'test-ds:sem-error' },
    ];
    const result = validateComponentBindings(bindings, parsed, false);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects binding with empty ref (ds:rule-component-must-ref-semantic)', () => {
    const bindings = [{ part: 'background', ref: '' }];
    const result = validateComponentBindings(bindings, parsed, false);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('BR-DS-002');
  });

  it('rejects binding referencing non-existent semantic token (ds:rule-component-tokens-exist)', () => {
    const bindings = [{ part: 'background', ref: 'test-ds:sem-nonexistent' }];
    const result = validateComponentBindings(bindings, parsed, false);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('ds:rule-component-tokens-exist');
  });

  it('rejects overridable component with no bindings (BR-DS-003)', () => {
    const result = validateComponentBindings([], parsed, true);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('BR-DS-003');
  });

  it('accepts overridable component with at least one binding', () => {
    const bindings = [{ part: 'background', ref: 'test-ds:sem-primary' }];
    const result = validateComponentBindings(bindings, parsed, true);
    expect(result.valid).toBe(true);
  });

  it('accepts non-overridable component with no bindings', () => {
    const result = validateComponentBindings([], parsed, false);
    expect(result.valid).toBe(true);
  });

  it('reports multiple errors at once', () => {
    const bindings = [
      { part: 'bg', ref: '' },
      { part: 'text', ref: 'test-ds:nonexistent' },
    ];
    const result = validateComponentBindings(bindings, parsed, true);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(2);
  });
});

// --- renderDSComponentBindings (S7.6.4 — Details tab) ---

describe('renderDSComponentBindings', () => {
  beforeEach(() => {
    state.activeDSBrand = null;
    sharedInstances.clear();
  });

  it('returns empty string when no brand is loaded', () => {
    expect(renderDSComponentBindings('test:comp-button')).toBe('');
  });

  it('returns empty string when component is not a DesignComponent', () => {
    state.activeDSBrand = 'baiv';
    const parsed = makeParsedDS();
    sharedInstances.set('baiv', parsed);
    expect(renderDSComponentBindings('test:comp-nonexistent')).toBe('');
  });

  it('renders binding count and no-bindings message for component with zero bindings', () => {
    state.activeDSBrand = 'baiv';
    const parsed = makeParsedDS();
    parsed.components.push({
      '@type': 'ds:DesignComponent',
      '@id': 'baiv-ds:comp-card',
      'ds:componentName': 'Card',
      'ds:category': 'Atom',
    });
    sharedInstances.set('baiv', parsed);

    const html = renderDSComponentBindings('baiv-ds:comp-card');
    expect(html).toContain('Token Bindings (0)');
    expect(html).toContain('No token bindings');
    expect(html).toContain('Edit Component');
  });

  it('renders each binding with part and semantic token name', () => {
    state.activeDSBrand = 'baiv';
    const parsed = makeParsedDS();
    parsed.components.push(
      {
        '@type': 'ds:DesignComponent',
        '@id': 'baiv-ds:comp-button',
        'ds:componentName': 'Button',
        'ds:category': 'Atom',
      },
      {
        '@type': 'ds:ComponentToken',
        '@id': 'baiv-ds:comptok-button-bg',
        'ds:componentName': 'Button',
        'ds:partOrState': 'background',
        'ds:referencesSemanticToken': { '@id': 'test-ds:sem-primary' },
      },
      {
        '@type': 'ds:ComponentToken',
        '@id': 'baiv-ds:comptok-button-text',
        'ds:componentName': 'Button',
        'ds:partOrState': 'text',
        'ds:referencesSemanticToken': { '@id': 'test-ds:sem-error' },
      }
    );
    sharedInstances.set('baiv', parsed);

    const html = renderDSComponentBindings('baiv-ds:comp-button');
    expect(html).toContain('Token Bindings (2)');
    expect(html).toContain('background');
    expect(html).toContain('primary.surface.default');
    expect(html).toContain('text');
    expect(html).toContain('error.surface.default');
    expect(html).toContain('removeDSTokenBinding');
  });
});

// --- removeDSTokenBinding (S7.6.4 — remove binding) ---

describe('removeDSTokenBinding', () => {
  beforeEach(() => {
    state.activeDSBrand = null;
    sharedInstances.clear();
  });

  it('does nothing when no brand is loaded', () => {
    removeDSTokenBinding('test:tok-1');
    // no error thrown
  });

  it('removes a ComponentToken by @id', () => {
    state.activeDSBrand = 'baiv';
    const parsed = makeParsedDS();
    parsed.components.push(
      {
        '@type': 'ds:DesignComponent',
        '@id': 'baiv-ds:comp-card',
        'ds:componentName': 'Card',
      },
      {
        '@type': 'ds:ComponentToken',
        '@id': 'baiv-ds:comptok-card-bg',
        'ds:componentName': 'Card',
        'ds:partOrState': 'background',
        'ds:tokenName': 'card.background',
        'ds:referencesSemanticToken': { '@id': 'test-ds:sem-primary' },
      }
    );
    sharedInstances.set('baiv', parsed);

    expect(parsed.components).toHaveLength(2);
    removeDSTokenBinding('baiv-ds:comptok-card-bg');
    expect(parsed.components).toHaveLength(1);
    expect(parsed.components[0]['@type']).toBe('ds:DesignComponent');
  });

  it('does not remove non-matching entries', () => {
    state.activeDSBrand = 'baiv';
    const parsed = makeParsedDS();
    parsed.components.push({
      '@type': 'ds:ComponentToken',
      '@id': 'baiv-ds:comptok-x',
      'ds:tokenName': 'x.bg',
    });
    sharedInstances.set('baiv', parsed);

    removeDSTokenBinding('baiv-ds:comptok-nonexistent');
    expect(parsed.components).toHaveLength(1);
  });
});

// --- renderDSVersionHistory ---

describe('renderDSVersionHistory', () => {
  beforeEach(() => {
    sharedHistory.clear();
  });

  it('returns "No version history" for unknown artefact', () => {
    const html = renderDSVersionHistory('nonexistent-id');
    expect(html).toContain('No version history');
  });

  it('renders version entries when history exists', () => {
    sharedHistory.set('test:page-home', [
      { version: '1.0.0', timestamp: '2026-02-09T10:00:00Z', changes: 'Initial creation' },
      { version: '1.0.1', timestamp: '2026-02-10T14:00:00Z', changes: 'patch bump from 1.0.0' },
    ]);

    const html = renderDSVersionHistory('test:page-home');
    expect(html).toContain('v1.0.0');
    expect(html).toContain('v1.0.1');
    expect(html).toContain('Initial creation');
    expect(html).toContain('patch bump from 1.0.0');
    expect(html).toContain('ds-version-badge');
    expect(html).toContain('ds-version-entry');
  });
});

// --- renderDSComponentRules (S7.7.5) ---

describe('renderDSComponentRules', () => {
  beforeEach(() => {
    state.activeDSBrand = null;
    sharedInstances.clear();
  });

  it('returns empty string when no brand is loaded', () => {
    expect(renderDSComponentRules('test:comp-btn')).toBe('');
  });

  it('returns empty string when component is not a DesignComponent', () => {
    state.activeDSBrand = 'baiv';
    const parsed = makeParsedDS();
    sharedInstances.set('baiv', parsed);
    expect(renderDSComponentRules('test:nonexistent')).toBe('');
  });

  it('returns empty string when no design rules exist', () => {
    state.activeDSBrand = 'baiv';
    const parsed = makeParsedDS();
    parsed.components.push({
      '@type': 'ds:DesignComponent',
      '@id': 'baiv-ds:comp-card',
      'ds:componentName': 'Card',
      'ds:category': 'Atom',
    });
    sharedInstances.set('baiv', parsed);
    expect(renderDSComponentRules('baiv-ds:comp-card')).toBe('');
  });

  it('renders ComponentDesignRule targeting this specific component', () => {
    state.activeDSBrand = 'baiv';
    const parsed = makeParsedDS();
    parsed.components.push({
      '@type': 'ds:DesignComponent',
      '@id': 'baiv-ds:comp-button',
      'ds:componentName': 'Button',
      'ds:category': 'Atom',
    });
    parsed.designRules.push({
      '@type': 'ds:ComponentDesignRule',
      '@id': 'pfc-ds:rule-comp-btn-contrast',
      'ds:ruleId': 'DR-COMP-BUTTON-001',
      'ds:ruleName': 'Button Background Contrast',
      'ds:severity': 'error',
      'ds:scope': 'ComponentDefinition',
      'ds:targetComponent': { '@id': 'baiv-ds:comp-button' },
      'ds:constraintType': 'ContrastRatio',
      'ds:constraintTarget': 'background',
      'ds:constraintValue': '4.5',
    });
    sharedInstances.set('baiv', parsed);

    const html = renderDSComponentRules('baiv-ds:comp-button');
    expect(html).toContain('Design Rules (1)');
    expect(html).toContain('DR-COMP-BUTTON-001');
    expect(html).toContain('Button Background Contrast');
    expect(html).toContain('ContrastRatio(background) = 4.5');
    expect(html).toContain('[!]'); // error severity
  });

  it('renders category-level ComponentDesignRule matching component category', () => {
    state.activeDSBrand = 'baiv';
    const parsed = makeParsedDS();
    parsed.components.push({
      '@type': 'ds:DesignComponent',
      '@id': 'baiv-ds:comp-input',
      'ds:componentName': 'Input',
      'ds:category': 'Atom',
    });
    parsed.designRules.push({
      '@type': 'ds:ComponentDesignRule',
      '@id': 'pfc-ds:rule-atom-focus',
      'ds:ruleId': 'DR-ATOM-FOCUS-001',
      'ds:ruleName': 'Atom Focus Ring',
      'ds:severity': 'warning',
      'ds:scope': 'ComponentDefinition',
      'ds:targetCategory': 'Atom',
      'ds:constraintType': 'MustReference',
      'ds:constraintTarget': 'focusRing',
      'ds:constraintValue': 'ds:SemanticToken',
    });
    sharedInstances.set('baiv', parsed);

    const html = renderDSComponentRules('baiv-ds:comp-input');
    expect(html).toContain('Design Rules (1)');
    expect(html).toContain('DR-ATOM-FOCUS-001');
    expect(html).toContain('[~]'); // warning severity
  });

  it('renders system-level rules with ComponentDefinition scope', () => {
    state.activeDSBrand = 'baiv';
    const parsed = makeParsedDS();
    parsed.components.push({
      '@type': 'ds:DesignComponent',
      '@id': 'baiv-ds:comp-card',
      'ds:componentName': 'Card',
      'ds:category': 'Molecule',
    });
    parsed.designRules.push({
      '@type': 'ds:DesignRule',
      '@id': 'pfc-ds:rule-ds-003',
      'ds:ruleId': 'DR-DS-003',
      'ds:ruleName': 'DesignComponent Node Rendering',
      'ds:severity': 'error',
      'ds:scope': 'ComponentDefinition',
    });
    sharedInstances.set('baiv', parsed);

    const html = renderDSComponentRules('baiv-ds:comp-card');
    expect(html).toContain('DR-DS-003');
    expect(html).toContain('DesignComponent Node Rendering');
  });

  it('excludes system-level rules with GlobalSystem scope', () => {
    state.activeDSBrand = 'baiv';
    const parsed = makeParsedDS();
    parsed.components.push({
      '@type': 'ds:DesignComponent',
      '@id': 'baiv-ds:comp-card',
      'ds:componentName': 'Card',
      'ds:category': 'Molecule',
    });
    parsed.designRules.push({
      '@type': 'ds:DesignRule',
      '@id': 'pfc-ds:rule-canvas-001',
      'ds:ruleId': 'DR-CANVAS-001',
      'ds:ruleName': 'Canvas Background Immutability',
      'ds:severity': 'error',
      'ds:scope': 'GlobalSystem',
    });
    sharedInstances.set('baiv', parsed);

    const html = renderDSComponentRules('baiv-ds:comp-card');
    expect(html).toBe('');
  });

  it('renders multiple rules for a single component', () => {
    state.activeDSBrand = 'baiv';
    const parsed = makeParsedDS();
    parsed.components.push({
      '@type': 'ds:DesignComponent',
      '@id': 'baiv-ds:comp-button',
      'ds:componentName': 'Button',
      'ds:category': 'Atom',
    });
    parsed.designRules.push(
      {
        '@type': 'ds:ComponentDesignRule',
        '@id': 'pfc-ds:rule-comp-btn-1',
        'ds:ruleId': 'DR-COMP-BTN-001',
        'ds:ruleName': 'Button Contrast',
        'ds:severity': 'error',
        'ds:scope': 'ComponentDefinition',
        'ds:targetComponent': { '@id': 'baiv-ds:comp-button' },
        'ds:constraintType': 'ContrastRatio',
        'ds:constraintTarget': 'background',
        'ds:constraintValue': '4.5',
      },
      {
        '@type': 'ds:DesignRule',
        '@id': 'pfc-ds:rule-ds-003',
        'ds:ruleId': 'DR-DS-003',
        'ds:ruleName': 'Component Node Rendering',
        'ds:severity': 'error',
        'ds:scope': 'ComponentDefinition',
      }
    );
    sharedInstances.set('baiv', parsed);

    const html = renderDSComponentRules('baiv-ds:comp-button');
    expect(html).toContain('Design Rules (2)');
    expect(html).toContain('DR-COMP-BTN-001');
    expect(html).toContain('DR-DS-003');
  });
});
