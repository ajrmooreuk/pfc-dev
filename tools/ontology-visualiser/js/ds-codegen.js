/**
 * DS-ONT Code Generation Module
 * ==============================
 * Generates React/Shadcn wrappers, CSS custom properties, Figma Make JSON,
 * and sandbox preview HTML from DesignComponent definitions and token cascade.
 *
 * Epic 8, Feature 8.3: Stories 8.3.1, 8.3.2, 8.3.3, 8.3.4
 *
 * @module ds-codegen
 * @version 1.0.0
 */

import { buildTokenIndex } from './export.js';
import {
  getGlobalComponentLibrary, getComponentRegistry,
  resolveInheritanceChain, resolveInheritedTokens,
  getRulesForComponent, validateRuleConstraint,
} from './design-token-tree.js';

// ========================================
// HELPERS
// ========================================

/** Convert dot/slash notation to CSS var name: "primary.surface.default" → "--primary-surface-default" */
function _tokenNameToVar(name) {
  return '--' + name.replace(/[./]/g, '-').toLowerCase();
}

/** Convert string to PascalCase: "button" → "Button", "input-group" → "InputGroup", "surface.default" → "SurfaceDefault" */
function _toPascalCase(str) {
  return str.replace(/(^|[-_./ ])(\w)/g, (_, _sep, ch) => ch.toUpperCase());
}

/** Convert string to camelCase: "primary/background" → "primaryBackground" */
function _toCamelCase(str) {
  const pascal = _toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

/** Convert camelCase/PascalCase to kebab-case: "primaryBackground" → "primary-background" */
function _toKebab(str) {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/[./]/g, '-').toLowerCase();
}

/**
 * Group ComponentToken entities by componentName.
 * Returns Map<componentName, ComponentToken[]>
 */
function _groupComponentTokens(parsed) {
  const groups = new Map();
  for (const item of (parsed.components || [])) {
    if (item['@type'] !== 'ds:ComponentToken') continue;
    const name = item['ds:componentName'] || 'Unknown';
    if (!groups.has(name)) groups.set(name, []);
    groups.get(name).push(item);
  }
  return groups;
}

/**
 * Get DesignComponent entities. If none exist explicitly, infer from
 * unique ds:componentName values on ComponentTokens.
 */
function _getDesignComponents(parsed) {
  const explicit = (parsed.components || []).filter(c => c['@type'] === 'ds:DesignComponent');
  if (explicit.length > 0) return explicit;

  // Infer from ComponentToken componentName values
  const seen = new Set();
  const inferred = [];
  for (const item of (parsed.components || [])) {
    if (item['@type'] !== 'ds:ComponentToken') continue;
    const name = item['ds:componentName'];
    if (name && !seen.has(name)) {
      seen.add(name);
      inferred.push({
        '@type': 'ds:DesignComponent',
        'ds:componentName': name,
        'ds:category': 'Form',
        'ds:allowsOverrides': true,
        '_inferred': true,
      });
    }
  }
  return inferred;
}

/**
 * Find semantic token by @id and return its tokenName.
 */
function _findSemanticTokenName(refId, parsed) {
  for (const tok of (parsed.semantics || [])) {
    if (tok['@id'] === refId) return tok['ds:tokenName'];
  }
  return null;
}

/**
 * Group primitives by valueType for CSS output.
 * Returns { colors: [], spacing: [], radius: [], typography: [], border: [], other: [] }
 */
function _groupPrimitivesByType(primitives) {
  const groups = { colors: [], spacing: [], radius: [], typography: [], border: [], other: [] };
  for (const tok of primitives) {
    const vt = (tok['ds:valueType'] || '').toLowerCase();
    if (vt === 'color') groups.colors.push(tok);
    else if (vt === 'spacing') groups.spacing.push(tok);
    else if (vt === 'radius') groups.radius.push(tok);
    else if (vt === 'typography') groups.typography.push(tok);
    else if (vt === 'border') groups.border.push(tok);
    else groups.other.push(tok);
  }
  return groups;
}


// ========================================
// S8.3.2: CSS CUSTOM PROPERTIES
// ========================================

/**
 * Generate a complete CSS file with all tokens as custom properties.
 * Three-tier cascade: Primitive → Semantic → Component.
 *
 * @param {Object} parsed - Output from parseDSInstance()
 * @param {string} brand - Brand key (e.g., 'baiv')
 * @param {Object} [options] - { darkMode: 'class'|'media' }
 * @returns {string} CSS source text
 */
export function generateCSSCustomProperties(parsed, brand, options = {}) {
  if (!parsed) return '/* No DS instance data */';

  const darkMode = options.darkMode || 'class';
  const dsName = parsed.designSystem?.['ds:name'] || brand;
  const dsVersion = parsed.designSystem?.['ds:version'] || '0.0.0';
  const lines = [];

  lines.push(`/**`);
  lines.push(` * ${dsName} Design Token System - CSS Variables`);
  lines.push(` * Generated from DS-ONT instance: ${brand} v${dsVersion}`);
  lines.push(` * Generated at: ${new Date().toISOString()}`);
  lines.push(` *`);
  lines.push(` * Three-tier taxonomy:`);
  lines.push(` *   1. Primitives: Raw design values (--primitive-*)`);
  lines.push(` *   2. Semantic: Intent-based tokens (--{group}-{property})`);
  lines.push(` *   3. Component: Component-specific (--{component}-{property})`);
  lines.push(` */`);
  lines.push('');

  // --- Layer 1: Primitives ---
  lines.push('/* ============================================');
  lines.push('   LAYER 1: PRIMITIVE TOKENS');
  lines.push('   ============================================ */');
  lines.push('');
  lines.push(':root {');

  const primGroups = _groupPrimitivesByType(parsed.primitives || []);

  for (const [groupName, tokens] of Object.entries(primGroups)) {
    if (tokens.length === 0) continue;
    lines.push(`  /* ${groupName.charAt(0).toUpperCase() + groupName.slice(1)} Primitives */`);
    for (const tok of tokens) {
      const name = tok['ds:tokenName'];
      const value = tok['ds:value'] || '';
      if (name) {
        lines.push(`  --primitive-${name.replace(/[./]/g, '-').toLowerCase()}: ${value};`);
      }
    }
    lines.push('');
  }

  lines.push('}');
  lines.push('');

  // --- Build primitive reverse lookup: value → CSS var name ---
  const primValueToVar = new Map();
  for (const tok of (parsed.primitives || [])) {
    const name = tok['ds:tokenName'];
    const value = (tok['ds:value'] || '').toLowerCase();
    if (name && value) {
      primValueToVar.set(value, `--primitive-${name.replace(/[./]/g, '-').toLowerCase()}`);
    }
  }

  // --- Layer 2: Semantics (light mode) ---
  lines.push('/* ============================================');
  lines.push('   LAYER 2: SEMANTIC TOKENS - Light Mode');
  lines.push('   ============================================ */');
  lines.push('');
  lines.push(':root {');

  const semanticsByGroup = new Map();
  for (const tok of (parsed.semantics || [])) {
    const name = tok['ds:tokenName'] || '';
    const group = name.split('.')[0] || 'other';
    if (!semanticsByGroup.has(group)) semanticsByGroup.set(group, []);
    semanticsByGroup.get(group).push(tok);
  }

  for (const [group, tokens] of semanticsByGroup) {
    lines.push(`  /* ${_toPascalCase(group)} Tokens */`);
    for (const tok of tokens) {
      const name = tok['ds:tokenName'];
      const rawValue = tok['ds:lightModeValue'] || '';
      if (!name) continue;

      // Cascade: use var() reference to primitive when value matches
      const primVar = primValueToVar.get(rawValue.toLowerCase());
      if (primVar) {
        lines.push(`  ${_tokenNameToVar(name)}: var(${primVar}, ${rawValue});`);
      } else {
        lines.push(`  ${_tokenNameToVar(name)}: ${rawValue};`);
      }
    }
    lines.push('');
  }

  lines.push('}');
  lines.push('');

  // --- Layer 2: Semantics (dark mode) ---
  const hasDarkMode = (parsed.semantics || []).some(t => t['ds:darkModeValue']);
  if (hasDarkMode) {
    lines.push('/* ============================================');
    lines.push('   LAYER 2: SEMANTIC TOKENS - Dark Mode');
    lines.push('   ============================================ */');
    lines.push('');

    if (darkMode === 'media') {
      lines.push('@media (prefers-color-scheme: dark) {');
      lines.push('  :root {');
    } else {
      lines.push(':root[data-theme="dark"],');
      lines.push('.dark {');
    }

    for (const [group, tokens] of semanticsByGroup) {
      const darkTokens = tokens.filter(t => t['ds:darkModeValue']);
      if (darkTokens.length === 0) continue;
      lines.push(`  /* ${_toPascalCase(group)} Tokens */`);
      for (const tok of darkTokens) {
        const name = tok['ds:tokenName'];
        const rawValue = tok['ds:darkModeValue'];
        const indent = darkMode === 'media' ? '    ' : '  ';
        if (!name) continue;

        // Cascade: use var() reference to primitive when value matches
        const primVar = primValueToVar.get(rawValue.toLowerCase());
        if (primVar) {
          lines.push(`${indent}${_tokenNameToVar(name)}: var(${primVar}, ${rawValue});`);
        } else {
          lines.push(`${indent}${_tokenNameToVar(name)}: ${rawValue};`);
        }
      }
      lines.push('');
    }

    if (darkMode === 'media') {
      lines.push('  }');
    }
    lines.push('}');
    lines.push('');
  }

  // --- Layer 3: Component tokens ---
  const compGroups = _groupComponentTokens(parsed);
  if (compGroups.size > 0) {
    lines.push('/* ============================================');
    lines.push('   LAYER 3: COMPONENT TOKENS');
    lines.push('   ============================================ */');
    lines.push('');

    for (const [compName, tokens] of compGroups) {
      const kebab = _toKebab(compName);
      lines.push(`/* --- ${compName.toUpperCase()} --- */`);
      lines.push(':root {');

      for (const tok of tokens) {
        const part = tok['ds:partOrState'] || '';
        const partKebab = _toKebab(part);
        const varName = `--${kebab}-${partKebab}`;

        // Resolve reference to semantic var
        const ref = tok['ds:referencesToken'] || tok['ds:referencesSemanticToken'];
        const refId = typeof ref === 'string' ? ref : ref?.['@id'] || '';
        const semName = _findSemanticTokenName(refId, parsed);

        if (semName) {
          lines.push(`  ${varName}: var(${_tokenNameToVar(semName)});`);
        } else {
          // No semantic ref — use description hint or empty
          lines.push(`  ${varName}: /* unresolved */;`);
        }
      }

      lines.push('}');
      lines.push('');
    }
  }

  return lines.join('\n');
}


// ========================================
// S8.3.1: REACT/SHADCN COMPONENT CODE
// ========================================

/**
 * Generate React/Shadcn TypeScript component wrappers from DS-ONT instance.
 *
 * @param {Object} parsed - Output from parseDSInstance()
 * @param {string} brand - Brand key (e.g., 'baiv')
 * @param {Object} [options] - { includeProvider: true, includeHooks: true }
 * @returns {string} TypeScript source code
 */
export function generateReactComponentCode(parsed, brand, options = {}) {
  if (!parsed) return '// No DS instance data';

  const includeProvider = options.includeProvider !== false;
  const includeHooks = includeProvider && options.includeHooks !== false;
  const brandPascal = _toPascalCase(brand);
  const dsName = parsed.designSystem?.['ds:name'] || brand;
  const dsVersion = parsed.designSystem?.['ds:version'] || '0.0.0';
  const components = _getDesignComponents(parsed);
  const compGroups = _groupComponentTokens(parsed);
  const tokenIndex = buildTokenIndex(parsed);
  const lines = [];

  // Header
  lines.push(`/**`);
  lines.push(` * ${dsName} Design Token System`);
  lines.push(` * Generated from DS-ONT instance: ${brand} v${dsVersion}`);
  lines.push(` * Generated at: ${new Date().toISOString()}`);
  lines.push(` *`);
  lines.push(` * Architecture: Figma → DS-ONT → shadcn/ui Token Bridge`);
  lines.push(` */`);
  lines.push('');
  lines.push(`'use client';`);
  lines.push('');
  lines.push(`import * as React from 'react';`);
  lines.push(`import { createContext, useContext, useMemo, useState, useEffect } from 'react';`);
  lines.push('');

  // Type definitions
  lines.push('// ============================================');
  lines.push('// TYPE DEFINITIONS');
  lines.push('// ============================================');
  lines.push('');
  lines.push(`export type ThemeMode = 'light' | 'dark' | 'system';`);
  lines.push('');

  // Semantic token interface (from actual instance data)
  lines.push('/** Semantic token definitions (intent-based) */');
  lines.push('export interface SemanticTokens {');
  const semGroups = new Map();
  for (const tok of (parsed.semantics || [])) {
    const name = tok['ds:tokenName'] || '';
    const parts = name.split('.');
    const group = parts[0] || 'other';
    const prop = parts.slice(1).join('.');
    if (!semGroups.has(group)) semGroups.set(group, []);
    semGroups.get(group).push(prop);
  }
  for (const [group, props] of semGroups) {
    lines.push(`  ${group}: {`);
    for (const prop of props) {
      lines.push(`    ${_toCamelCase(prop)}: string;`);
    }
    lines.push(`  };`);
  }
  lines.push('}');
  lines.push('');

  // Per-component interfaces
  for (const comp of components) {
    const name = comp['ds:componentName'];
    const pascal = _toPascalCase(name);
    const tokens = compGroups.get(name) || [];

    lines.push(`export interface ${pascal}Tokens {`);
    for (const tok of tokens) {
      const part = tok['ds:partOrState'] || '';
      const camel = _toCamelCase(part);
      lines.push(`  ${camel}: string;`);
    }
    lines.push('}');
    lines.push('');
  }

  // Master ComponentTokens interface
  lines.push('/** Aggregate component tokens */');
  lines.push('export interface ComponentTokens {');
  for (const comp of components) {
    const name = comp['ds:componentName'];
    const camel = name.charAt(0).toLowerCase() + name.slice(1);
    const pascal = _toPascalCase(name);
    lines.push(`  ${camel}: ${pascal}Tokens;`);
  }
  lines.push('}');
  lines.push('');

  // createComponentTokens factory
  lines.push('// ============================================');
  lines.push('// COMPONENT TOKEN FACTORY');
  lines.push('// ============================================');
  lines.push('');
  lines.push(`export function createComponentTokens(semantic: SemanticTokens): ComponentTokens {`);
  lines.push('  return {');

  for (const comp of components) {
    const name = comp['ds:componentName'];
    const camel = name.charAt(0).toLowerCase() + name.slice(1);
    const tokens = compGroups.get(name) || [];

    lines.push(`    ${camel}: {`);
    for (const tok of tokens) {
      const part = tok['ds:partOrState'] || '';
      const propName = _toCamelCase(part);
      // Resolve the semantic reference path
      const ref = tok['ds:referencesToken'] || tok['ds:referencesSemanticToken'];
      const refId = typeof ref === 'string' ? ref : ref?.['@id'] || '';
      const semName = _findSemanticTokenName(refId, parsed);

      if (semName) {
        // Build the semantic access path: "primary.surface.default" → "semantic.primary.surfaceDefault"
        const parts = semName.split('.');
        const group = parts[0];
        const rest = parts.slice(1).join('.');
        const camelRest = _toCamelCase(rest);
        lines.push(`      ${propName}: semantic.${group}.${camelRest},`);
      } else {
        // Resolve from token index or leave as comment
        const resolved = tokenIndex[tok['ds:tokenName']] || '';
        lines.push(`      ${propName}: '${resolved}', // unresolved semantic ref`);
      }
    }
    lines.push(`    },`);
  }

  lines.push('  };');
  lines.push('}');
  lines.push('');

  // Provider + hooks
  if (includeProvider) {
    lines.push('// ============================================');
    lines.push('// TOKEN PROVIDER');
    lines.push('// ============================================');
    lines.push('');
    lines.push(`interface ${brandPascal}TokenContextValue {`);
    lines.push(`  mode: ThemeMode;`);
    lines.push(`  setMode: (mode: ThemeMode) => void;`);
    lines.push(`  semantic: SemanticTokens;`);
    lines.push(`  components: ComponentTokens;`);
    lines.push('}');
    lines.push('');
    lines.push(`const ${brandPascal}TokenContext = createContext<${brandPascal}TokenContextValue | null>(null);`);
    lines.push('');
    lines.push(`export function ${brandPascal}TokenProvider({`);
    lines.push(`  children,`);
    lines.push(`  initialMode = 'light',`);
    lines.push(`  semanticLight,`);
    lines.push(`  semanticDark,`);
    lines.push(`}: {`);
    lines.push(`  children: React.ReactNode;`);
    lines.push(`  initialMode?: ThemeMode;`);
    lines.push(`  semanticLight: SemanticTokens;`);
    lines.push(`  semanticDark?: SemanticTokens;`);
    lines.push(`}) {`);
    lines.push(`  const [mode, setMode] = useState<ThemeMode>(initialMode);`);
    lines.push('');
    lines.push(`  const resolvedMode = useMemo(() => {`);
    lines.push(`    if (mode !== 'system') return mode;`);
    lines.push(`    return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';`);
    lines.push(`  }, [mode]);`);
    lines.push('');
    lines.push(`  const semantic = resolvedMode === 'dark' && semanticDark ? semanticDark : semanticLight;`);
    lines.push(`  const components = useMemo(() => createComponentTokens(semantic), [semantic]);`);
    lines.push('');
    lines.push(`  const value = useMemo(() => ({ mode, setMode, semantic, components }), [mode, semantic, components]);`);
    lines.push('');
    lines.push(`  return (`);
    lines.push(`    <${brandPascal}TokenContext.Provider value={value}>`);
    lines.push(`      {children}`);
    lines.push(`    </${brandPascal}TokenContext.Provider>`);
    lines.push(`  );`);
    lines.push('}');
    lines.push('');
  }

  if (includeHooks) {
    lines.push('// ============================================');
    lines.push('// HOOKS');
    lines.push('// ============================================');
    lines.push('');
    lines.push(`export function use${brandPascal}Tokens() {`);
    lines.push(`  const ctx = useContext(${brandPascal}TokenContext);`);
    lines.push(`  if (!ctx) throw new Error('use${brandPascal}Tokens must be used within ${brandPascal}TokenProvider');`);
    lines.push(`  return ctx;`);
    lines.push('}');
    lines.push('');
    lines.push(`export function useComponentTokens<K extends keyof ComponentTokens>(component: K): ComponentTokens[K] {`);
    lines.push(`  const { components } = use${brandPascal}Tokens();`);
    lines.push(`  return components[component];`);
    lines.push('}');
  }

  return lines.join('\n');
}


// ========================================
// S8.3.3: FIGMA MAKE JSON
// ========================================

/**
 * Generate Figma Make-compatible JSON from DS-ONT instance.
 *
 * @param {Object} parsed - Output from parseDSInstance()
 * @param {string} brand - Brand key
 * @param {Object} [options] - { pageId?: string, pageName?: string }
 * @returns {string} JSON string
 */
export function generateFigmaMakeJSON(parsed, brand, options = {}) {
  if (!parsed) return '{}';

  const tokenIndex = buildTokenIndex(parsed);
  const compGroups = _groupComponentTokens(parsed);
  const dsVersion = parsed.designSystem?.['ds:version'] || '0.0.0';
  const dsRef = parsed.designSystem?.['@id'] || `${brand}-ds:system-${brand}`;

  const output = {
    '@context': {
      ds: 'https://platformcore.io/ontology/ds/',
      [`${brand}-ds`]: `https://${brand}.platform.io/ontology/ds/`,
      make: 'https://platformcore.io/figma-make/',
    },
    'make:pageId': options.pageId || `${brand}-components`,
    'make:pageName': options.pageName || `${_toPascalCase(brand)} Component Tokens`,
    'make:description': `${_toPascalCase(brand)} component token mapping — resolves DS-ONT three-tier cascade to concrete brand values.`,
    'make:brand': brand,
    'make:dsInstanceRef': dsRef,
    'make:dsVersion': dsVersion,
    'make:resolvedAt': new Date().toISOString().split('T')[0],
    components: {},
  };

  // Build semantic @id → token entry lookup
  const semanticById = new Map();
  for (const tok of (parsed.semantics || [])) {
    semanticById.set(tok['@id'], tok);
  }

  for (const [compName, tokens] of compGroups) {
    const compEntry = { description: `${compName} component tokens`, tokens: {} };

    for (const tok of tokens) {
      const part = tok['ds:partOrState'] || 'default';
      const ref = tok['ds:referencesToken'] || tok['ds:referencesSemanticToken'];
      const refId = typeof ref === 'string' ? ref : ref?.['@id'] || '';
      const semTok = semanticById.get(refId);

      const entry = {};
      if (semTok) {
        entry.semanticRef = refId;
        entry.tokenName = semTok['ds:tokenName'] || '';
      } else {
        entry.tokenName = tok['ds:tokenName'] || '';
      }
      entry.resolved = tokenIndex[tok['ds:tokenName']] || '';
      compEntry.tokens[part] = entry;
    }

    output.components[compName] = compEntry;
  }

  return JSON.stringify(output, null, 2);
}


// ========================================
// S8.3.4: BROWSER SANDBOX PREVIEW
// ========================================

/**
 * Generate a self-contained HTML document for component preview.
 * Loaded into an <iframe> via srcdoc — no external dependencies.
 *
 * @param {Object} parsed - Output from parseDSInstance()
 * @param {string} brand - Brand key
 * @returns {string} Complete HTML document string
 */
export function generateSandboxHTML(parsed, brand) {
  if (!parsed) return '<html><body>No DS instance data</body></html>';

  const css = generateCSSCustomProperties(parsed, brand, { darkMode: 'class' });
  const brandPascal = _toPascalCase(brand);
  const dsVersion = parsed.designSystem?.['ds:version'] || '0.0.0';
  const compGroups = _groupComponentTokens(parsed);
  const tokenIndex = buildTokenIndex(parsed);

  // Build component preview HTML blocks
  const componentPreviews = [];
  for (const [compName, tokens] of compGroups) {
    const kebab = _toKebab(compName);
    componentPreviews.push(_generateComponentPreview(compName, kebab, tokens, tokenIndex));
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${brandPascal} Component Preview — v${dsVersion}</title>
  <style>
${css}

/* Preview layout */
* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: system-ui, -apple-system, sans-serif;
  padding: 24px;
  background: var(--neutral-surface-subtle, #f5f5f5);
  color: var(--neutral-text-body, #333);
  transition: background 0.3s, color 0.3s;
}

.dark body {
  background: #0f1117;
  color: #e0e0e0;
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--neutral-border-default, #ddd);
}

.preview-header h1 {
  font-size: 18px;
  font-weight: 600;
}

.preview-header .brand-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  background: var(--primary-surface-default, #0066cc);
  color: #fff;
}

.theme-toggle {
  padding: 6px 14px;
  border: 1px solid var(--neutral-border-default, #ccc);
  border-radius: 6px;
  background: var(--neutral-surface-default, #fff);
  color: var(--neutral-text-body, #333);
  cursor: pointer;
  font-size: 13px;
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.component-card {
  background: var(--neutral-surface-default, #fff);
  border: 1px solid var(--neutral-border-default, #ddd);
  border-radius: 12px;
  padding: 20px;
  transition: background 0.3s, border-color 0.3s;
}

.dark .component-card {
  background: #1a1d27;
  border-color: #333;
}

.component-card h2 {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
  color: var(--primary-surface-default, #0066cc);
}

.component-card .binding-count {
  font-size: 11px;
  color: var(--neutral-text-caption, #888);
  margin-bottom: 16px;
}

.component-card .demo { display: flex; flex-direction: column; gap: 10px; }

/* Generic component styles using CSS vars */
.demo-button {
  display: inline-block;
  padding: 8px 16px;
  border-radius: var(--primitive-border-radius-md, 8px);
  border: 1px solid transparent;
  font-size: 14px;
  cursor: pointer;
  text-align: center;
}

.demo-button.primary {
  background: var(--button-primary-background, var(--primary-surface-default, #0066cc));
  color: var(--button-primary-text, #fff);
}

.demo-button.secondary {
  background: var(--button-secondary-background, var(--neutral-surface-subtle, #eee));
  color: var(--button-secondary-text, var(--neutral-text-title, #333));
  border-color: var(--neutral-border-default, #ccc);
}

.demo-button.destructive {
  background: var(--button-destructive-background, var(--error-surface-default, #cc0033));
  color: #fff;
}

.demo-input {
  padding: 8px 12px;
  border: 1px solid var(--input-border-default, var(--neutral-border-default, #ccc));
  border-radius: var(--primitive-border-radius-md, 8px);
  background: var(--input-background, var(--neutral-surface-default, #fff));
  color: var(--input-text-default, var(--neutral-text-body, #333));
  font-size: 14px;
  outline: none;
}

.demo-input:focus {
  border-color: var(--input-border-focus, var(--primary-border-default, #0066cc));
  box-shadow: 0 0 0 2px var(--primary-surface-subtle, rgba(0, 102, 204, 0.2));
}

.demo-checkbox-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.demo-checkbox {
  width: 18px;
  height: 18px;
  accent-color: var(--checkbox-background-checked, var(--primary-surface-default, #0066cc));
}

.swatch-row {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.swatch {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--neutral-text-caption, #888);
}

.swatch-dot {
  width: 14px;
  height: 14px;
  border-radius: 3px;
  border: 1px solid rgba(0,0,0,0.1);
}
  </style>
</head>
<body>
  <div class="preview-header">
    <div>
      <h1>${brandPascal} Component Preview</h1>
      <span style="font-size:12px; color:var(--neutral-text-caption, #888);">v${dsVersion} &middot; ${(parsed.primitives || []).length}P + ${(parsed.semantics || []).length}S + ${compGroups.size > 0 ? Array.from(compGroups.values()).reduce((a, b) => a + b.length, 0) : 0}C tokens</span>
    </div>
    <div style="display:flex; gap:8px; align-items:center;">
      <span class="brand-badge">${brand.toUpperCase()}</span>
      <button class="theme-toggle" onclick="toggleTheme()">Toggle Dark</button>
    </div>
  </div>

  <div class="preview-grid">
${componentPreviews.join('\n')}
  </div>

  <script>
    function toggleTheme() {
      document.documentElement.classList.toggle('dark');
      const btn = document.querySelector('.theme-toggle');
      if (btn) btn.textContent = document.documentElement.classList.contains('dark') ? 'Toggle Light' : 'Toggle Dark';
    }
  </script>
</body>
</html>`;
}

/**
 * Generate HTML preview block for a single component.
 */
function _generateComponentPreview(compName, kebab, tokens, tokenIndex) {
  const lower = compName.toLowerCase();
  const tokenSwatches = tokens.map(tok => {
    const name = tok['ds:tokenName'] || '';
    const resolved = tokenIndex[name] || '';
    const isColor = /^#[0-9a-fA-F]{6,8}$/.test(resolved);
    if (isColor) {
      return `        <span class="swatch"><span class="swatch-dot" style="background:${resolved}"></span>${tok['ds:partOrState'] || name}</span>`;
    }
    return `        <span class="swatch">${tok['ds:partOrState'] || name}: ${resolved}</span>`;
  }).join('\n');

  let demoHTML = '';

  if (lower === 'button') {
    demoHTML = `
      <div class="demo">
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <button class="demo-button primary">Primary</button>
          <button class="demo-button secondary">Secondary</button>
          <button class="demo-button destructive">Destructive</button>
        </div>
      </div>`;
  } else if (lower === 'input') {
    demoHTML = `
      <div class="demo">
        <input class="demo-input" placeholder="Default input" />
        <input class="demo-input" placeholder="Focus me" />
      </div>`;
  } else if (lower === 'checkbox') {
    demoHTML = `
      <div class="demo">
        <label class="demo-checkbox-row"><input type="checkbox" class="demo-checkbox" checked /> Checked</label>
        <label class="demo-checkbox-row"><input type="checkbox" class="demo-checkbox" /> Unchecked</label>
      </div>`;
  } else {
    // Generic component — show token swatches only
    demoHTML = `
      <div class="demo">
        <div style="padding:12px; border-radius:8px; background:var(--${kebab}-background, var(--neutral-surface-subtle, #eee)); border:1px solid var(--${kebab}-border-default, var(--neutral-border-default, #ccc));">
          <span style="font-size:13px;">${compName} preview</span>
        </div>
      </div>`;
  }

  return `    <div class="component-card">
      <h2>${compName}</h2>
      <div class="binding-count">${tokens.length} token binding${tokens.length !== 1 ? 's' : ''}</div>
${demoHTML}
      <div class="swatch-row" style="margin-top:12px;">
${tokenSwatches}
      </div>
    </div>`;
}


// ========================================
// S43.6.1: COMPONENT-SCOPED CSS
// ========================================

/**
 * Generate a scoped CSS rule block for a single component.
 * Uses the component's resolved tokens (own + inherited via quasi-OO chain).
 *
 * @param {string} componentName - e.g. 'pfc.viz.toolbar.btn-active' or 'ds.global.button.primary'
 * @param {Array} resolvedTokens - Array of { label, cssVar, hex, dsToken, tier }
 * @param {Object} [options] - { includeComment: true, extendsChain: [] }
 * @returns {string} CSS rule block
 */
export function generateComponentScopedCSS(componentName, resolvedTokens, options = {}) {
  const includeComment = options.includeComment !== false;
  const chain = options.extendsChain || [];
  const selector = '.' + componentName.replace(/\./g, '-');
  const lines = [];

  if (includeComment) {
    const extendsLabel = chain.length > 1 ? ` — extends ${chain.slice(1).join(' → ')}` : '';
    lines.push(`/* ${componentName}${extendsLabel} */`);
  }

  lines.push(`${selector} {`);

  for (const token of (resolvedTokens || [])) {
    const label = _toKebab(token.label || 'unknown');
    if (token.cssVar) {
      lines.push(`  --${label}: var(${token.cssVar}, ${token.hex || ''});`);
    } else {
      lines.push(`  --${label}: ${token.hex || ''};`);
    }
  }

  lines.push('}');
  return lines.join('\n');
}


// ========================================
// S43.6.2: LLM PROMPT TEMPLATES
// ========================================

/**
 * Generate a structured LLM prompt for transcribing component specs.
 *
 * @param {string} componentName - Component name
 * @param {Array} resolvedTokens - Token array from resolveInheritedTokens
 * @param {Array} chain - Inheritance chain from resolveInheritanceChain
 * @param {Object} rules - { system: [], component: [] } from getRulesForComponent
 * @param {'css'|'react'|'tailwind'} targetFormat - Output format
 * @returns {string} Prompt text
 */
export function generateLLMPrompt(componentName, resolvedTokens, chain, rules, targetFormat) {
  const format = targetFormat || 'css';
  const lines = [];

  // Header
  lines.push(`# Component Transcription: ${componentName}`);
  lines.push('');

  // Identity
  const globalLib = getGlobalComponentLibrary();
  const globalEntry = globalLib.find(g => g.componentName === componentName) ||
                      globalLib.find(g => chain.includes(g.componentName));
  if (globalEntry) {
    lines.push(`- **Atomic Level**: ${globalEntry.atomicLevel}`);
    lines.push(`- **Category**: ${globalEntry.category}`);
  }
  if (chain.length > 1) {
    lines.push(`- **Extends**: ${chain.slice(1).join(' → ')}`);
  }
  lines.push('');

  // Token table
  lines.push('## Design Tokens');
  lines.push('');
  lines.push('| Label | CSS Variable | Value | Semantic Alias | Tier |');
  lines.push('|-------|-------------|-------|----------------|------|');
  for (const t of (resolvedTokens || [])) {
    lines.push(`| ${t.label || ''} | ${t.cssVar || '—'} | ${t.hex || ''} | ${t.dsToken || '—'} | ${t.tier || '—'} |`);
  }
  lines.push('');

  // Design rules
  const allRules = [...(rules?.system || []), ...(rules?.component || [])];
  if (allRules.length > 0) {
    lines.push('## Design Rules');
    lines.push('');
    for (const r of allRules) {
      const id = r['@id'] || r.id || 'rule';
      const label = r['ds:label'] || r['rdfs:label'] || id;
      const severity = r['ds:severity'] || 'info';
      const constraint = r['ds:constraintType'] || '';
      lines.push(`- **${label}** (${severity}): ${constraint}`);
    }
    lines.push('');
  }

  // Target-specific instructions
  lines.push('## Instructions');
  lines.push('');

  if (format === 'css') {
    lines.push('Generate scoped CSS custom properties for this component:');
    lines.push('');
    lines.push('1. Use the selector `.{component-name-kebab}` (dots replaced with hyphens)');
    lines.push('2. Declare each token as `--{label}: var({cssVar}, {fallback});`');
    lines.push('3. Include a comment header with the component name and extends chain');
    lines.push('4. If the component has design rules with ContrastRatio constraints, validate that');
    lines.push('   the generated colour pairs meet the required ratio');
  } else if (format === 'react') {
    lines.push('Generate a TypeScript React component:');
    lines.push('');
    lines.push('1. Create a typed props interface using the token labels');
    lines.push('2. Apply tokens via CSS custom properties on the root element');
    lines.push('3. Use `var()` references for all colour/spacing values');
    lines.push('4. Export the component and its props interface');
    lines.push('5. Follow shadcn/ui conventions (forwardRef, cn utility, variants via cva)');
  } else if (format === 'tailwind') {
    lines.push('Generate Tailwind CSS configuration for this component:');
    lines.push('');
    lines.push('1. Map each token to a Tailwind `@theme` entry under the component namespace');
    lines.push('2. Create utility classes using `@apply` with custom property bindings');
    lines.push('3. Use `theme()` function references where appropriate');
    lines.push('4. Follow Tailwind v4 conventions with CSS-first configuration');
  }

  lines.push('');

  // Validation checklist
  if (allRules.length > 0) {
    lines.push('## Validation Checklist');
    lines.push('');
    for (const r of allRules) {
      const label = r['ds:label'] || r['rdfs:label'] || r['@id'] || 'rule';
      lines.push(`- [ ] ${label}`);
    }
  }

  return lines.join('\n');
}


// ========================================
// S43.6.3: CSS BUNDLE DOWNLOAD
// ========================================

/**
 * Generate a complete CSS bundle with scoped rules for all components.
 * Iterates global base components + app-specific components from COMPONENT_REGISTRY.
 *
 * @param {Object} [options] - { includeGlobals: true, includeAppSpecific: true }
 * @returns {string} CSS file contents
 */
export function generateComponentCSSBundle(options = {}) {
  const includeGlobals = options.includeGlobals !== false;
  const includeAppSpecific = options.includeAppSpecific !== false;

  const lines = [];
  let componentCount = 0;

  // File header
  lines.push('/**');
  lines.push(' * PF-Core Component Token CSS Bundle');
  lines.push(` * Generated at: ${new Date().toISOString()}`);
  lines.push(' *');
  lines.push(' * Component-scoped CSS custom properties derived from the');
  lines.push(' * design token tree and quasi-OO global component library.');
  lines.push(' */');
  lines.push('');

  // Section 1: Global base components
  if (includeGlobals) {
    const globals = getGlobalComponentLibrary();
    lines.push('/* ============================================');
    lines.push('   GLOBAL BASE COMPONENTS (ds.global.*)');
    lines.push('   ============================================ */');
    lines.push('');

    for (const entry of globals) {
      const chain = resolveInheritanceChain(entry.componentName);
      const tokens = resolveInheritedTokens(entry.componentName, entry.tokens || []);
      lines.push(generateComponentScopedCSS(entry.componentName, tokens, {
        includeComment: true,
        extendsChain: chain,
      }));
      lines.push('');
      componentCount++;
    }
  }

  // Section 2: App-specific components
  if (includeAppSpecific) {
    const registry = getComponentRegistry();
    lines.push('/* ============================================');
    lines.push('   APP-SPECIFIC COMPONENTS (pfc.viz.*)');
    lines.push('   ============================================ */');
    lines.push('');

    for (const entry of registry) {
      const chain = resolveInheritanceChain(entry.componentName);
      const tokens = resolveInheritedTokens(entry.componentName, []);
      lines.push(generateComponentScopedCSS(entry.componentName, tokens, {
        includeComment: true,
        extendsChain: chain,
      }));
      lines.push('');
      componentCount++;
    }
  }

  // Footer
  lines.push(`/* Total: ${componentCount} components */`);

  return lines.join('\n');
}


// ========================================
// S43.6.4: POST-GENERATION VALIDATION
// ========================================

/**
 * Validate generated token values against applicable design rules.
 * Static validation (no live DOM) — passes token values directly.
 *
 * @param {string} componentName - The component to validate
 * @param {Array} tokenValues - Array of { label, value } from generated output
 * @returns {{ passed: number, failed: number, warnings: number, results: Array }}
 */
export function validateGeneratedTokens(componentName, tokenValues) {
  const { component: compRules } = getRulesForComponent(componentName);
  const results = [];
  let passed = 0, failed = 0, warnings = 0;

  for (const rule of (compRules || [])) {
    const result = validateRuleConstraint(rule, componentName, tokenValues);
    const ruleId = rule['@id'] || rule.id || 'unknown';
    results.push({ ruleId, status: result.status, message: result.message });
    if (result.status === 'pass') passed++;
    else if (result.status === 'fail') failed++;
    else warnings++;
  }

  return { passed, failed, warnings, results };
}
