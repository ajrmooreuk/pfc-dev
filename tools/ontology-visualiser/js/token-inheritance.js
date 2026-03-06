/**
 * Token Inheritance Engine — F40.8 (4-Tier Cascade Resolution)
 *
 * Resolves the effective value of a CSS token by walking UP the 4-tier chain:
 *   PF-Core → PF-Instance → App.Component (Brand) → Computed CSS
 *
 * Respects ds:MutabilityTier: PF-Core tokens (locked) cannot be overridden
 * by any higher tier. PF-Instance tokens are brand-variable.
 *
 * Source labels:
 *   CORE      — value from viewer.css :root default, or locked PF-Core token
 *   INHERITED — value from PF-Instance DS semantic tokens (generateCSSVars)
 *   BRAND     — value from BrandVariant.tokenOverrides
 *   LOCAL     — computed CSS differs from all known tiers (dev tools, inline)
 */

import { state } from './state.js';

// ── Resolution cache ──

let _cache = new Map();

/** Clear the resolution cache. Call on brand switch, CSS apply/reset, or panel re-render. */
export function invalidateCache() {
  _cache.clear();
}

// ── Mutability tier heuristics ──

/** Token name prefixes that are PF-Core (immutable across brands). */
const PF_CORE_PREFIXES = [
  'spacing.', 'radius.', 'borderRadius.', 'border.width',
  'font.size.', 'font.weight.', 'font.family.',
  'container.surface.'
];

/**
 * Determine the mutability tier for a DS token.
 *
 * Resolution order:
 *  1. Explicit `ds:mutabilityTier` property on the token entity
 *  2. Category's `ds:defaultMutabilityTier`
 *  3. Heuristic based on token name prefix
 *
 * @param {string} dsToken - DS-ONT token name (e.g., 'primary.surface.default')
 * @param {Object} parsed - Output from parseDSInstance()
 * @returns {'PF-Core'|'PF-Instance'|null}
 */
export function getMutabilityTier(dsToken, parsed) {
  if (!dsToken || !parsed) return null;

  // Search all token arrays for the matching token
  const allTokens = [
    ...(parsed.primitives || []),
    ...(parsed.semantics || []),
    ...(parsed.components || []).filter(c => c['@type'] === 'ds:ComponentToken')
  ];

  const token = allTokens.find(t => t['ds:tokenName'] === dsToken);

  // 1. Explicit property on the token
  if (token && token['ds:mutabilityTier']) {
    return token['ds:mutabilityTier'];
  }

  // 2. Category default
  if (token && parsed.categories) {
    for (const cat of parsed.categories) {
      if (cat['ds:defaultMutabilityTier']) {
        // Check if the token belongs to this category
        const catTokens = cat['ds:tokens'] || cat['ds:hasTokens'];
        if (Array.isArray(catTokens)) {
          const tokenId = token['@id'];
          const match = catTokens.some(ref => {
            const refId = typeof ref === 'string' ? ref : ref['@id'];
            return refId === tokenId;
          });
          if (match) return cat['ds:defaultMutabilityTier'];
        }
      }
    }
  }

  // 3. Heuristic fallback
  for (const prefix of PF_CORE_PREFIXES) {
    if (dsToken.startsWith(prefix)) return 'PF-Core';
  }

  // Colour/semantic tokens default to PF-Instance
  return 'PF-Instance';
}

/**
 * Check if the active brand variant has a tokenOverride for the given DS token.
 *
 * @param {string} dsToken - DS-ONT token name (e.g., 'primary.surface.default')
 * @returns {{ brandName: string, value: string, tokenId?: string }|null}
 */
export function getBrandOverride(dsToken) {
  if (!state.activeDSBrand || !dsToken) return null;

  const parsed = state.dsInstances?.get(state.activeDSBrand);
  if (!parsed || !parsed.variants || parsed.variants.length === 0) return null;

  // Find the active variant, or fall back to first
  const activeVariant = parsed.variants.find(v => v['ds:isActive'] === true)
    || parsed.variants[0];

  if (!activeVariant) return null;

  const overrides = activeVariant['ds:tokenOverrides'];
  if (!overrides) return null;

  if (typeof overrides === 'string') {
    console.warn(`[Token Inheritance] String tokenOverrides not yet supported: ${overrides}`);
    return null;
  }

  if (typeof overrides === 'object' && overrides[dsToken]) {
    return {
      brandName: activeVariant['ds:brandName'] || activeVariant['ds:brandId'] || state.activeDSBrand,
      value: overrides[dsToken],
      tokenId: activeVariant['@id'] || null
    };
  }

  return null;
}

/**
 * Resolve the inheritance source for a single token.
 *
 * @param {string} cssVar - CSS custom property name (e.g., '--viz-accent') or null
 * @param {string|null} dsToken - DS-ONT token name or null
 * @param {string} defaultHex - The hardcoded default value from the token tree
 * @returns {ResolutionResult}
 */
export function resolveToken(cssVar, dsToken, defaultHex) {
  // Check cache
  const cacheKey = cssVar || dsToken || defaultHex;
  if (_cache.has(cacheKey)) return _cache.get(cacheKey);

  const chain = [];
  let locked = false;

  // Tier 1: PF-Core (CSS default from viewer.css)
  chain.push({ tier: 'PF-Core', value: defaultHex, origin: 'viewer.css' });

  // Check mutability
  const parsed = state.activeDSBrand ? state.dsInstances?.get(state.activeDSBrand) : null;
  if (dsToken && parsed) {
    const mutability = getMutabilityTier(dsToken, parsed);
    if (mutability === 'PF-Core') {
      locked = true;
      const result = {
        source: 'CORE',
        resolvedTier: 'PF-Core',
        value: defaultHex,
        locked: true,
        chain,
        brandOverride: null
      };
      _cache.set(cacheKey, result);
      return result;
    }
  }

  // Tier 2: PF-Instance (DS semantic tokens via generateCSSVars)
  const pfiValue = state.dsAppliedCSSVars?.[cssVar] || null;
  if (pfiValue) {
    chain.push({ tier: 'PF-Instance', value: pfiValue, origin: state.activeDSBrand ? `${state.activeDSBrand} DS` : 'DS' });
  }

  // Tier 3: Brand override (BrandVariant.tokenOverrides)
  const brandOvr = dsToken ? getBrandOverride(dsToken) : null;
  if (brandOvr) {
    chain.push({ tier: 'App.Component', value: brandOvr.value, origin: `Brand: ${brandOvr.brandName}` });
  }

  // Tier 4: Computed CSS (what the browser is actually rendering)
  let computedValue = null;
  if (cssVar && typeof document !== 'undefined') {
    try {
      computedValue = getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim() || null;
    } catch (_) { /* non-browser */ }
    if (computedValue) {
      chain.push({ tier: 'Computed', value: computedValue });
    }
  }

  // Determine the effective value and source
  const finalValue = computedValue || brandOvr?.value || pfiValue || defaultHex;
  let source = 'CORE';
  let resolvedTier = 'PF-Core';

  if (brandOvr) {
    source = 'BRAND';
    resolvedTier = 'App.Component';
  } else if (pfiValue && pfiValue !== defaultHex) {
    source = 'INHERITED';
    resolvedTier = 'PF-Instance';
  }

  // LOCAL: computed CSS is something unexpected (dev tools, inline override)
  if (!brandOvr && computedValue && computedValue !== defaultHex && computedValue !== pfiValue) {
    source = 'LOCAL';
    resolvedTier = 'Computed';
  }

  const result = {
    source,
    resolvedTier,
    value: finalValue,
    locked,
    chain,
    brandOverride: brandOvr
  };

  _cache.set(cacheKey, result);
  return result;
}

/**
 * Resolve all tokens in a batch for performance.
 *
 * @param {Array<{cssVar, dsToken, hex}>} tokenLeaves
 * @returns {Map<string, ResolutionResult>} keyed by cssVar or dsToken or hex
 */
export function resolveTokenBatch(tokenLeaves) {
  const results = new Map();
  for (const t of tokenLeaves) {
    const key = t.cssVar || t.dsToken || t.hex;
    const resolution = resolveToken(t.cssVar, t.dsToken || null, t.hex);
    results.set(key, resolution);
  }
  return results;
}

// ── Token-to-CSS mapping (reverse of generateCSSVars) ──

const TOKEN_TO_CSS = {
  'primary.surface.default': '--viz-accent',
  'primary.surface.subtle': '--viz-accent-subtle',
  'primary.surface.darker': '--viz-accent-active',
  'primary.border.default': '--viz-accent-border',
  'neutral.text.title': '--viz-text-primary',
  'neutral.text.body': '--viz-text-secondary',
  'neutral.text.caption': '--viz-text-muted',
  'neutral.surface.subtle': '--viz-surface-subtle',
  'neutral.surface.default': '--viz-surface-default',
  'neutral.border.default': '--viz-border-default',
  'container.surface.default': '--viz-container-surface',
  'error.surface.default': '--viz-error',
  'warning.surface.default': '--viz-warning',
  'success.surface.default': '--viz-success',
  'information.surface.default': '--viz-info'
};

/**
 * Map a DS-ONT token name to its CSS custom property.
 *
 * @param {string} tokenName - DS-ONT token name
 * @returns {string|null} CSS custom property name or null
 */
export function mapTokenToCSSVar(tokenName) {
  if (!tokenName) return null;
  if (TOKEN_TO_CSS[tokenName]) return TOKEN_TO_CSS[tokenName];

  // Dynamic: archetype.{type}.surface → --viz-archetype-{type}
  const archMatch = tokenName.match(/^archetype\.(\w+)\.surface$/);
  if (archMatch) return `--viz-archetype-${archMatch[1]}`;

  // Dynamic: edge.{type}.color → --viz-edge-{type}
  const edgeMatch = tokenName.match(/^edge\.(\w+)\.color$/);
  if (edgeMatch) return `--viz-edge-${edgeMatch[1]}`;

  return null;
}

/**
 * Apply brand variant tokenOverrides as CSS custom properties.
 * Enforces BR-DS-006: only PF-Instance tokens may be overridden.
 *
 * @param {Object} parsed - Output from parseDSInstance()
 * @returns {Object} applied overrides { cssVar: value }
 */
export function applyBrandOverrides(parsed) {
  if (!parsed?.variants || parsed.variants.length === 0) return {};

  const activeVariant = parsed.variants.find(v => v['ds:isActive'] === true)
    || parsed.variants[0];

  if (!activeVariant) return {};

  const overrides = activeVariant['ds:tokenOverrides'];
  if (!overrides || typeof overrides !== 'object' || typeof overrides === 'string') return {};

  const applied = {};
  const root = typeof document !== 'undefined' ? document.documentElement : null;

  for (const [tokenName, value] of Object.entries(overrides)) {
    const cssVar = mapTokenToCSSVar(tokenName);
    if (!cssVar) continue;

    // BR-DS-006: Only PF-Instance tokens may be overridden by brands
    const mutability = getMutabilityTier(tokenName, parsed);
    if (mutability === 'PF-Core') {
      console.warn(`[DS] BR-DS-006: Brand override rejected for PF-Core token: ${tokenName}`);
      continue;
    }

    if (root) root.style.setProperty(cssVar, value);
    applied[cssVar] = value;
  }

  return applied;
}
