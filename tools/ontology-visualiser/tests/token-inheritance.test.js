/**
 * Token Inheritance Engine — F40.8 Unit Tests
 *
 * Tests the 4-tier cascade resolution: PF-Core → PF-Instance → App.Component → Computed CSS
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mock state ──
vi.mock('../js/state.js', () => ({
  state: {
    activeDSBrand: null,
    dsInstances: new Map(),
    dsAppliedCSSVars: null,
    tokenResolutionCache: new Map(),
  },
}));

// ── Mock getComputedStyle ──
let _mockCSSValues = {};
vi.stubGlobal('document', {
  documentElement: { style: { setProperty: vi.fn(), removeProperty: vi.fn() } },
});
vi.stubGlobal('getComputedStyle', () => ({
  getPropertyValue: (varName) => _mockCSSValues[varName] || '',
}));

import {
  resolveToken,
  getMutabilityTier,
  getBrandOverride,
  resolveTokenBatch,
  invalidateCache,
  mapTokenToCSSVar,
  applyBrandOverrides,
} from '../js/token-inheritance.js';

import { state } from '../js/state.js';

// ── Fixtures ──

const baseParsed = {
  designSystem: { '@id': 'test:ds', '@type': 'ds:DesignSystem', 'ds:name': 'Test DS' },
  categories: [
    { '@id': 'test:cat-colors', 'ds:categoryName': 'colors', 'ds:tier': 'Primitive', 'ds:defaultMutabilityTier': 'PF-Instance' },
    { '@id': 'test:cat-spacing', 'ds:categoryName': 'spacing', 'ds:tier': 'Primitive', 'ds:defaultMutabilityTier': 'PF-Core',
      'ds:tokens': [{ '@id': 'test:prim-spacing-md' }] },
  ],
  primitives: [
    { '@id': 'test:prim-teal-500', '@type': 'ds:PrimitiveToken', 'ds:tokenName': 'color.teal.500', 'ds:value': '#00a4bf', 'ds:valueType': 'Color' },
    { '@id': 'test:prim-spacing-md', '@type': 'ds:PrimitiveToken', 'ds:tokenName': 'spacing.md', 'ds:value': '16px', 'ds:valueType': 'Spacing' },
    { '@id': 'test:prim-radius-lg', '@type': 'ds:PrimitiveToken', 'ds:tokenName': 'radius.lg', 'ds:value': '12px', 'ds:valueType': 'Radius' },
  ],
  semantics: [
    { '@id': 'test:sem-primary', '@type': 'ds:SemanticToken', 'ds:tokenName': 'primary.surface.default', 'ds:lightModeValue': '#e2f7ff' },
    { '@id': 'test:sem-neutral', '@type': 'ds:SemanticToken', 'ds:tokenName': 'neutral.text.body', 'ds:lightModeValue': '#333333' },
    { '@id': 'test:sem-container', '@type': 'ds:SemanticToken', 'ds:tokenName': 'container.surface.default', 'ds:lightModeValue': '#f0f0f0' },
    { '@id': 'test:sem-explicit-core', '@type': 'ds:SemanticToken', 'ds:tokenName': 'structural.surface.base', 'ds:lightModeValue': '#ffffff', 'ds:mutabilityTier': 'PF-Core' },
  ],
  components: [
    { '@id': 'test:comp-btn-bg', '@type': 'ds:ComponentToken', 'ds:tokenName': 'button.primary.background', 'ds:componentName': 'button' },
  ],
  variants: [],
  figmaSources: [],
  modes: [],
  patterns: [],
  pages: [],
  templates: [],
  designRules: [],
};

const brandVariantWithOverrides = {
  '@id': 'test:brand-acme',
  '@type': 'ds:BrandVariant',
  'ds:brandName': 'Acme Brand',
  'ds:brandId': 'acme',
  'ds:isActive': true,
  'ds:tokenOverrides': {
    'primary.surface.default': '#ff0000',
    'neutral.text.body': '#111111',
  },
};

const brandVariantNoOverrides = {
  '@id': 'test:brand-plain',
  '@type': 'ds:BrandVariant',
  'ds:brandName': 'Plain',
  'ds:brandId': 'plain',
  'ds:isActive': true,
  'ds:tokenOverrides': null,
};

const brandVariantStringOverrides = {
  '@id': 'test:brand-path',
  '@type': 'ds:BrandVariant',
  'ds:brandName': 'PathBrand',
  'ds:isActive': true,
  'ds:tokenOverrides': '/path/to/overrides.json',
};

// ── Setup ──

beforeEach(() => {
  invalidateCache();
  _mockCSSValues = {};
  state.activeDSBrand = null;
  state.dsInstances = new Map();
  state.dsAppliedCSSVars = null;
  document.documentElement.style.setProperty.mockClear();
  document.documentElement.style.removeProperty.mockClear();
});

// ════════════════════════════════════════
// getMutabilityTier
// ════════════════════════════════════════

describe('getMutabilityTier', () => {
  it('returns null for null dsToken', () => {
    expect(getMutabilityTier(null, baseParsed)).toBeNull();
  });

  it('returns null for null parsed', () => {
    expect(getMutabilityTier('primary.surface.default', null)).toBeNull();
  });

  it('returns explicit mutabilityTier from token property', () => {
    expect(getMutabilityTier('structural.surface.base', baseParsed)).toBe('PF-Core');
  });

  it('falls back to category defaultMutabilityTier', () => {
    expect(getMutabilityTier('spacing.md', baseParsed)).toBe('PF-Core');
  });

  it('uses heuristic for spacing.* tokens → PF-Core', () => {
    // Token not in parsed data, falls to heuristic
    expect(getMutabilityTier('spacing.xl', baseParsed)).toBe('PF-Core');
  });

  it('uses heuristic for radius.* tokens → PF-Core', () => {
    expect(getMutabilityTier('radius.lg', baseParsed)).toBe('PF-Core');
  });

  it('uses heuristic for font.size.* tokens → PF-Core', () => {
    expect(getMutabilityTier('font.size.md', baseParsed)).toBe('PF-Core');
  });

  it('uses heuristic for font.weight.* tokens → PF-Core', () => {
    expect(getMutabilityTier('font.weight.bold', baseParsed)).toBe('PF-Core');
  });

  it('uses heuristic for font.family.* tokens → PF-Core', () => {
    expect(getMutabilityTier('font.family.heading', baseParsed)).toBe('PF-Core');
  });

  it('uses heuristic for container.surface.* tokens → PF-Core', () => {
    expect(getMutabilityTier('container.surface.default', baseParsed)).toBe('PF-Core');
  });

  it('defaults to PF-Instance for colour semantic tokens', () => {
    expect(getMutabilityTier('primary.surface.default', baseParsed)).toBe('PF-Instance');
  });

  it('defaults to PF-Instance for unknown tokens', () => {
    expect(getMutabilityTier('custom.unknown.token', baseParsed)).toBe('PF-Instance');
  });
});

// ════════════════════════════════════════
// getBrandOverride
// ════════════════════════════════════════

describe('getBrandOverride', () => {
  it('returns null when no brand is active', () => {
    expect(getBrandOverride('primary.surface.default')).toBeNull();
  });

  it('returns null for null dsToken', () => {
    state.activeDSBrand = 'test';
    state.dsInstances.set('test', baseParsed);
    expect(getBrandOverride(null)).toBeNull();
  });

  it('returns null when variants array is empty', () => {
    state.activeDSBrand = 'test';
    state.dsInstances.set('test', baseParsed);
    expect(getBrandOverride('primary.surface.default')).toBeNull();
  });

  it('returns null when tokenOverrides is null', () => {
    state.activeDSBrand = 'test';
    const parsed = { ...baseParsed, variants: [brandVariantNoOverrides] };
    state.dsInstances.set('test', parsed);
    expect(getBrandOverride('primary.surface.default')).toBeNull();
  });

  it('returns override value when tokenOverrides matches', () => {
    state.activeDSBrand = 'test';
    const parsed = { ...baseParsed, variants: [brandVariantWithOverrides] };
    state.dsInstances.set('test', parsed);

    const result = getBrandOverride('primary.surface.default');
    expect(result).not.toBeNull();
    expect(result.value).toBe('#ff0000');
    expect(result.brandName).toBe('Acme Brand');
  });

  it('returns null when tokenOverrides does not contain the token', () => {
    state.activeDSBrand = 'test';
    const parsed = { ...baseParsed, variants: [brandVariantWithOverrides] };
    state.dsInstances.set('test', parsed);

    expect(getBrandOverride('error.surface.default')).toBeNull();
  });

  it('logs warning for string tokenOverrides', () => {
    state.activeDSBrand = 'test';
    const parsed = { ...baseParsed, variants: [brandVariantStringOverrides] };
    state.dsInstances.set('test', parsed);
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const result = getBrandOverride('primary.surface.default');
    expect(result).toBeNull();
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('String tokenOverrides not yet supported'));
    spy.mockRestore();
  });

  it('uses first variant if none is marked isActive', () => {
    state.activeDSBrand = 'test';
    const inactiveVariant = {
      ...brandVariantWithOverrides,
      'ds:isActive': false,
      'ds:brandName': 'Fallback Brand',
    };
    const parsed = { ...baseParsed, variants: [inactiveVariant] };
    state.dsInstances.set('test', parsed);

    const result = getBrandOverride('primary.surface.default');
    expect(result).not.toBeNull();
    expect(result.brandName).toBe('Fallback Brand');
  });
});

// ════════════════════════════════════════
// resolveToken
// ════════════════════════════════════════

describe('resolveToken', () => {
  it('returns CORE source when no DS brand is active', () => {
    const result = resolveToken('--viz-accent', 'primary.surface.default', '#9dfff5');
    expect(result.source).toBe('CORE');
    expect(result.resolvedTier).toBe('PF-Core');
    expect(result.value).toBe('#9dfff5');
    expect(result.locked).toBe(false);
  });

  it('returns CORE with locked=true for PF-Core immutable token (spacing)', () => {
    state.activeDSBrand = 'test';
    state.dsInstances.set('test', baseParsed);

    const result = resolveToken(null, 'spacing.md', '16px');
    expect(result.source).toBe('CORE');
    expect(result.locked).toBe(true);
    expect(result.chain).toHaveLength(1);
    expect(result.chain[0].tier).toBe('PF-Core');
  });

  it('returns CORE with locked=true for explicitly marked PF-Core token', () => {
    state.activeDSBrand = 'test';
    state.dsInstances.set('test', baseParsed);

    const result = resolveToken(null, 'structural.surface.base', '#ffffff');
    expect(result.source).toBe('CORE');
    expect(result.locked).toBe(true);
  });

  it('returns INHERITED when PF-Instance value differs from default', () => {
    state.activeDSBrand = 'test';
    state.dsInstances.set('test', baseParsed);
    state.dsAppliedCSSVars = { '--viz-accent': '#00a4bf' };
    _mockCSSValues['--viz-accent'] = '#00a4bf';

    const result = resolveToken('--viz-accent', 'primary.surface.default', '#9dfff5');
    expect(result.source).toBe('INHERITED');
    expect(result.resolvedTier).toBe('PF-Instance');
    expect(result.chain.length).toBeGreaterThanOrEqual(2);
  });

  it('returns CORE when PF-Instance value equals PF-Core default', () => {
    state.activeDSBrand = 'test';
    state.dsInstances.set('test', baseParsed);
    state.dsAppliedCSSVars = { '--viz-accent': '#9dfff5' };
    _mockCSSValues['--viz-accent'] = '#9dfff5';

    const result = resolveToken('--viz-accent', 'primary.surface.default', '#9dfff5');
    expect(result.source).toBe('CORE');
  });

  it('returns BRAND when tokenOverrides contains the token', () => {
    state.activeDSBrand = 'test';
    const parsed = { ...baseParsed, variants: [brandVariantWithOverrides] };
    state.dsInstances.set('test', parsed);
    state.dsAppliedCSSVars = { '--viz-accent': '#e2f7ff' };
    _mockCSSValues['--viz-accent'] = '#ff0000';

    const result = resolveToken('--viz-accent', 'primary.surface.default', '#9dfff5');
    expect(result.source).toBe('BRAND');
    expect(result.resolvedTier).toBe('App.Component');
    expect(result.brandOverride).not.toBeNull();
    expect(result.brandOverride.value).toBe('#ff0000');
  });

  it('returns LOCAL when computed CSS differs from all known tiers', () => {
    state.activeDSBrand = 'test';
    state.dsInstances.set('test', baseParsed);
    state.dsAppliedCSSVars = {};
    _mockCSSValues['--viz-accent'] = '#abcdef';  // unknown source

    const result = resolveToken('--viz-accent', 'primary.surface.default', '#9dfff5');
    expect(result.source).toBe('LOCAL');
    expect(result.resolvedTier).toBe('Computed');
  });

  it('builds correct chain array with multiple tiers', () => {
    state.activeDSBrand = 'test';
    state.dsInstances.set('test', baseParsed);
    state.dsAppliedCSSVars = { '--viz-accent': '#00a4bf' };
    _mockCSSValues['--viz-accent'] = '#00a4bf';

    const result = resolveToken('--viz-accent', 'primary.surface.default', '#9dfff5');
    expect(result.chain[0].tier).toBe('PF-Core');
    expect(result.chain[0].value).toBe('#9dfff5');
    expect(result.chain[1].tier).toBe('PF-Instance');
    expect(result.chain[1].value).toBe('#00a4bf');
    // Computed may also be present
    expect(result.chain.length).toBeGreaterThanOrEqual(2);
  });

  it('handles null cssVar gracefully (hardcoded token)', () => {
    const result = resolveToken(null, 'priority.low.surface', '#1a2a1a');
    expect(result.source).toBe('CORE');
    expect(result.value).toBe('#1a2a1a');
  });

  it('handles null dsToken gracefully', () => {
    _mockCSSValues['--viz-surface-subtle'] = '#2a2d37';
    const result = resolveToken('--viz-surface-subtle', null, '#2a2d37');
    expect(result.source).toBe('CORE');
    expect(result.locked).toBe(false);
  });

  it('locked PF-Core token stays CORE even if brand override exists', () => {
    state.activeDSBrand = 'test';
    // Brand tries to override a PF-Core token
    const overrideVariant = {
      ...brandVariantWithOverrides,
      'ds:tokenOverrides': { 'spacing.md': '24px' }
    };
    const parsed = { ...baseParsed, variants: [overrideVariant] };
    state.dsInstances.set('test', parsed);

    const result = resolveToken(null, 'spacing.md', '16px');
    expect(result.source).toBe('CORE');
    expect(result.locked).toBe(true);
    expect(result.value).toBe('16px');
  });
});

// ════════════════════════════════════════
// resolveTokenBatch + cache
// ════════════════════════════════════════

describe('resolveTokenBatch', () => {
  it('resolves multiple tokens in a single call', () => {
    const leaves = [
      { cssVar: '--viz-accent', dsToken: 'primary.surface.default', hex: '#9dfff5' },
      { cssVar: '--viz-error', dsToken: 'error.surface.default', hex: '#cf057d' },
    ];

    const results = resolveTokenBatch(leaves);
    expect(results.size).toBe(2);
    expect(results.has('--viz-accent')).toBe(true);
    expect(results.has('--viz-error')).toBe(true);
  });

  it('returns Map keyed by cssVar', () => {
    const results = resolveTokenBatch([
      { cssVar: '--viz-success', hex: '#4CAF50' },
    ]);
    const entry = results.get('--viz-success');
    expect(entry).toBeDefined();
    expect(entry.source).toBe('CORE');
  });

  it('uses cached results on second call', () => {
    const leaf = { cssVar: '--viz-info', hex: '#2196F3' };
    resolveTokenBatch([leaf]);
    // Mutate state (would change result if cache missed)
    state.dsAppliedCSSVars = { '--viz-info': '#ff0000' };
    const results2 = resolveTokenBatch([leaf]);
    // Should still return cached CORE (not re-resolved)
    expect(results2.get('--viz-info').source).toBe('CORE');
  });

  it('cache is invalidated by invalidateCache()', () => {
    const leaf = { cssVar: '--viz-warning', hex: '#FF9800' };
    resolveTokenBatch([leaf]);
    invalidateCache();
    state.activeDSBrand = 'test';
    state.dsInstances.set('test', baseParsed);
    state.dsAppliedCSSVars = { '--viz-warning': '#ff5500' };
    _mockCSSValues['--viz-warning'] = '#ff5500';

    const results = resolveTokenBatch([{ ...leaf, dsToken: 'warning.surface.default' }]);
    expect(results.get('--viz-warning').source).toBe('INHERITED');
  });
});

// ════════════════════════════════════════
// mapTokenToCSSVar
// ════════════════════════════════════════

describe('mapTokenToCSSVar', () => {
  it('maps static token name correctly', () => {
    expect(mapTokenToCSSVar('primary.surface.default')).toBe('--viz-accent');
  });

  it('maps neutral.text.body → --viz-text-secondary', () => {
    expect(mapTokenToCSSVar('neutral.text.body')).toBe('--viz-text-secondary');
  });

  it('maps error.surface.default → --viz-error', () => {
    expect(mapTokenToCSSVar('error.surface.default')).toBe('--viz-error');
  });

  it('maps archetype.class.surface → --viz-archetype-class', () => {
    expect(mapTokenToCSSVar('archetype.class.surface')).toBe('--viz-archetype-class');
  });

  it('maps archetype.agent.surface → --viz-archetype-agent', () => {
    expect(mapTokenToCSSVar('archetype.agent.surface')).toBe('--viz-archetype-agent');
  });

  it('maps edge.structural.color → --viz-edge-structural', () => {
    expect(mapTokenToCSSVar('edge.structural.color')).toBe('--viz-edge-structural');
  });

  it('maps edge.dependency.color → --viz-edge-dependency', () => {
    expect(mapTokenToCSSVar('edge.dependency.color')).toBe('--viz-edge-dependency');
  });

  it('returns null for unknown token name', () => {
    expect(mapTokenToCSSVar('custom.unknown.token')).toBeNull();
  });

  it('returns null for null input', () => {
    expect(mapTokenToCSSVar(null)).toBeNull();
  });
});

// ════════════════════════════════════════
// applyBrandOverrides
// ════════════════════════════════════════

describe('applyBrandOverrides', () => {
  it('returns empty object when no variants', () => {
    expect(applyBrandOverrides(baseParsed)).toEqual({});
  });

  it('returns empty object when tokenOverrides is null', () => {
    const parsed = { ...baseParsed, variants: [brandVariantNoOverrides] };
    expect(applyBrandOverrides(parsed)).toEqual({});
  });

  it('applies PF-Instance token overrides to document', () => {
    const parsed = { ...baseParsed, variants: [brandVariantWithOverrides] };
    const applied = applyBrandOverrides(parsed);

    expect(applied['--viz-accent']).toBe('#ff0000');
    expect(applied['--viz-text-secondary']).toBe('#111111');
    expect(document.documentElement.style.setProperty).toHaveBeenCalledWith('--viz-accent', '#ff0000');
  });

  it('rejects PF-Core token overrides (BR-DS-006)', () => {
    const coreOverrideVariant = {
      ...brandVariantWithOverrides,
      'ds:tokenOverrides': {
        'container.surface.default': '#aabbcc',  // PF-Core (has CSS mapping) — should be rejected
        'primary.surface.default': '#ff0000',     // PF-Instance — should be applied
      },
    };
    const parsed = { ...baseParsed, variants: [coreOverrideVariant] };
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const applied = applyBrandOverrides(parsed);
    expect(applied['--viz-accent']).toBe('#ff0000');
    expect(applied).not.toHaveProperty('--viz-container-surface');
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('BR-DS-006'));
    spy.mockRestore();
  });

  it('skips tokens with no CSS mapping', () => {
    const unmappedVariant = {
      ...brandVariantWithOverrides,
      'ds:tokenOverrides': { 'custom.unmapped.token': '#aabbcc' },
    };
    const parsed = { ...baseParsed, variants: [unmappedVariant] };
    const applied = applyBrandOverrides(parsed);
    expect(Object.keys(applied)).toHaveLength(0);
  });
});
