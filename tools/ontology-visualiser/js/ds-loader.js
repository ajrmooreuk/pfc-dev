/**
 * DS-ONT Instance Loader — Phase B (Epic 7, Feature 7.6)
 *
 * Loads DS-ONT instance data (JSONLD files), parses the three-tier token cascade,
 * builds vis-network sub-graphs for token visualisation, and generates CSS custom
 * properties for theme injection.
 */

import { state, REGISTRY_BASE_PATH } from './state.js';

// ========================================
// INSTANCE DATA LOADING
// ========================================

/**
 * Load DS instance data from a registry entry's artifacts.instanceData array.
 * Each entry has a path (same-repo relative or cross-repo via GitHub).
 *
 * @param {Object} registryEntry - Full registry entry JSON (e.g., Entry-ONT-DS-001.json)
 * @returns {Promise<Map<string, Object>>} brand → parsedDSInstance
 */
export async function loadDSInstanceData(registryEntry) {
  const instances = registryEntry?.artifacts?.instanceData;
  if (!Array.isArray(instances) || instances.length === 0) return new Map();

  const results = new Map();

  const makeFailed = (brand, error) => ({
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
    designRules: [],
    _meta: { brand, status: 'load-failed', error }
  });

  // Load brands in parallel so one slow/failed fetch doesn't block others
  const loadPromises = instances
    .filter(entry => entry.brand)
    .map(async (entry) => {
      const brand = entry.brand;
      try {
        let jsonld;

        if (entry.repo && entry.repo !== 'ajrmooreuk/Azlan-EA-AAA') {
          // Cross-repo: use GitHub loader (requires PAT)
          const { fetchFileContent } = await import('./github-loader.js');
          const [owner, repo] = entry.repo.split('/');
          jsonld = await fetchFileContent(owner, repo, 'main', entry.path);
        } else {
          // Same-repo: resolve from registry base path
          const resolvedPath = REGISTRY_BASE_PATH + entry.path.replace(/^PBS\/ONTOLOGIES\/ontology-library\//, '');
          const response = await fetch(resolvedPath);
          if (!response.ok) throw new Error(`HTTP ${response.status} for ${resolvedPath}`);
          jsonld = await response.json();
        }

        const parsed = parseDSInstance(jsonld);
        parsed._meta = {
          brand,
          version: entry.version,
          figmaFileKey: entry.figmaFileKey,
          status: entry.status,
          extractedAt: entry.extractedAt,
          repo: entry.repo
        };

        return { brand, parsed };
      } catch (err) {
        console.warn(`[DS Loader] Failed to load ${brand}:`, err.message);
        return { brand, parsed: makeFailed(brand, err.message) };
      }
    });

  const settled = await Promise.allSettled(loadPromises);
  for (const result of settled) {
    if (result.status === 'fulfilled' && result.value) {
      results.set(result.value.brand, result.value.parsed);
    }
  }

  console.log(`[DS Loader] ${results.size} brand(s) resolved from ${instances.length} entries`);
  return results;
}

// ========================================
// INSTANCE PARSING
// ========================================

/**
 * Parse a DS-ONT instance JSONLD file.
 * Walks the @graph array and classifies nodes by their @type.
 * Backward-compatible: v1.2.0 instances without DesignRule entities parse cleanly
 * (designRules array stays empty).
 *
 * @param {Object} jsonld - The raw JSONLD object with @context and @graph
 * @returns {Object} { designSystem, categories[], primitives[], semantics[],
 *                     components[], variants[], figmaSources[], modes[], patterns[],
 *                     pages[], templates[], designRules[] }
 */
export function parseDSInstance(jsonld) {
  const graph = jsonld?.['@graph'] || [];

  const result = {
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
    designRules: []
  };

  for (const node of graph) {
    const type = node['@type'] || '';

    if (type === 'ds:DesignSystem') {
      result.designSystem = node;
    } else if (type === 'ds:TokenCategory') {
      result.categories.push(node);
    } else if (type === 'ds:PrimitiveToken') {
      result.primitives.push(node);
    } else if (type === 'ds:SemanticToken') {
      result.semantics.push(node);
    } else if (type === 'ds:ComponentToken' || type === 'ds:DesignComponent') {
      result.components.push(node);
    } else if (type === 'ds:BrandVariant') {
      result.variants.push(node);
    } else if (type === 'ds:FigmaSource') {
      result.figmaSources.push(node);
    } else if (type === 'ds:ThemeMode') {
      result.modes.push(node);
    } else if (type === 'ds:DesignPattern') {
      result.patterns.push(node);
    } else if (type === 'ds:PageDefinition') {
      result.pages.push(node);
    } else if (type === 'ds:TemplateDefinition') {
      result.templates.push(node);
    } else if (type === 'ds:DesignRule' || type === 'ds:ComponentDesignRule') {
      result.designRules.push(node);
    }
  }

  return result;
}

// ========================================
// TOKEN GRAPH BUILDING
// ========================================

/**
 * Build a vis-network graph of the token cascade.
 * Three tiers connected by reference edges.
 *
 * @param {Object} parsed - Output from parseDSInstance()
 * @returns {{ nodes: Array, edges: Array }}
 */
export function buildDSTokenGraph(parsed) {
  const nodes = [];
  const edges = [];

  // Tier colours
  const tierColors = {
    Primitive: { background: '#4CAF50', border: '#388E3C' },
    Semantic: { background: '#2196F3', border: '#1565C0' },
    Component: { background: '#FF9800', border: '#E65100' },
    Category: { background: '#9C27B0', border: '#6A1B9A' },
    System: { background: '#00BCD4', border: '#00838F' },
    DesignRule: { background: '#FF6B6B', border: '#E53935' },
    ComponentRule: { background: '#FFB84D', border: '#F57C00' }
  };

  // Design System root node
  if (parsed.designSystem) {
    const ds = parsed.designSystem;
    nodes.push({
      id: ds['@id'],
      label: ds['ds:name'] || 'Design System',
      color: tierColors.System,
      shape: 'diamond',
      size: 30,
      font: { color: '#e0e0e0', size: 14, bold: { color: '#fff' } },
      title: `${ds['ds:name']} v${ds['ds:version']}`
    });
  }

  // Categories
  for (const cat of parsed.categories) {
    nodes.push({
      id: cat['@id'],
      label: cat['ds:categoryName'],
      color: tierColors.Category,
      shape: 'box',
      size: 18,
      font: { color: '#e0e0e0', size: 11 },
      title: `${cat['ds:tier']} — ${cat['ds:description'] || ''}`
    });

    // Edge from system to category
    if (parsed.designSystem) {
      edges.push({
        from: parsed.designSystem['@id'],
        to: cat['@id'],
        label: 'hasCategory',
        color: { color: '#666' },
        dashes: true
      });
    }
  }

  // Primitive tokens
  for (const tok of parsed.primitives) {
    const isColor = tok['ds:valueType'] === 'Color';
    nodes.push({
      id: tok['@id'],
      label: tok['ds:tokenName'],
      color: isColor
        ? { background: tok['ds:value'], border: '#388E3C' }
        : tierColors.Primitive,
      shape: 'dot',
      size: 10,
      font: { color: '#e0e0e0', size: 9 },
      title: `${tok['ds:tokenName']}: ${tok['ds:value']} (${tok['ds:valueType']})`
    });
  }

  // Semantic tokens
  for (const tok of parsed.semantics) {
    const val = tok['ds:lightModeValue'] || '';
    const isColor = val.startsWith('#');
    nodes.push({
      id: tok['@id'],
      label: tok['ds:tokenName'],
      color: isColor
        ? { background: val, border: '#1565C0' }
        : tierColors.Semantic,
      shape: 'dot',
      size: 12,
      font: { color: '#e0e0e0', size: 9 },
      title: `${tok['ds:tokenName']}: ${val}`
    });
  }

  // Separate DesignComponent entities from ComponentToken entries
  const designComponents = parsed.components.filter(c => c['@type'] === 'ds:DesignComponent');
  const componentTokens = parsed.components.filter(c => c['@type'] === 'ds:ComponentToken');

  // DesignComponent nodes with token count badge
  for (const comp of designComponents) {
    const compName = comp['ds:componentName'] || '';
    const bindingCount = componentTokens.filter(t => t['ds:componentName'] === compName).length;
    const badge = bindingCount > 0 ? ` [${bindingCount}]` : '';
    nodes.push({
      id: comp['@id'],
      label: `${compName}${badge}`,
      color: tierColors.Component,
      shape: 'box',
      size: 20,
      font: { color: '#e0e0e0', size: 11, bold: { color: '#fff' } },
      title: `${compName} (${comp['ds:category'] || 'Component'}) — ${bindingCount} token binding(s)`,
      _dsType: 'DesignComponent',
      _bindingCount: bindingCount
    });
  }

  // Component tokens
  for (const tok of componentTokens) {
    nodes.push({
      id: tok['@id'],
      label: tok['ds:tokenName'],
      color: tierColors.Component,
      shape: 'dot',
      size: 12,
      font: { color: '#e0e0e0', size: 9 },
      title: `${tok['ds:tokenName']} (${tok['ds:componentName']})`
    });

    // Edge from DesignComponent to its token
    const parentComp = designComponents.find(c => c['ds:componentName'] === tok['ds:componentName']);
    if (parentComp) {
      edges.push({
        from: parentComp['@id'],
        to: tok['@id'],
        label: 'consumesToken',
        color: { color: '#FF9800', opacity: 0.5 },
        dashes: [4, 2],
        arrows: 'to'
      });
    }

    // Edge to referenced semantic token
    const ref = tok['ds:referencesSemanticToken'];
    if (ref) {
      const targetId = typeof ref === 'string' ? ref : ref['@id'];
      if (targetId) {
        edges.push({
          from: tok['@id'],
          to: targetId,
          label: 'references',
          color: { color: '#FF9800' },
          arrows: 'to'
        });
      }
    }
  }

  // DesignRule and ComponentDesignRule nodes (v1.3.0+)
  for (const rule of (parsed.designRules || [])) {
    const isComponentRule = rule['@type'] === 'ds:ComponentDesignRule';
    const color = isComponentRule ? tierColors.ComponentRule : tierColors.DesignRule;
    const severity = rule['ds:severity'] || 'info';
    const severityIcon = severity === 'error' ? '!' : severity === 'warning' ? '~' : 'i';
    nodes.push({
      id: rule['@id'],
      label: `${rule['ds:ruleId'] || rule['@id']} [${severityIcon}]`,
      color,
      shape: 'box',
      size: 16,
      font: { color: '#e0e0e0', size: 10 },
      title: `${rule['ds:ruleName'] || ''}: ${rule['ds:description'] || ''}\nSeverity: ${severity}`,
      _dsType: isComponentRule ? 'ComponentDesignRule' : 'DesignRule'
    });

    // Edge: DesignSystem → DesignRule (hasDesignRule)
    if (!isComponentRule && parsed.designSystem) {
      edges.push({
        from: parsed.designSystem['@id'],
        to: rule['@id'],
        label: 'hasRule',
        color: { color: '#FF6B6B', opacity: 0.6 },
        dashes: [4, 2],
        arrows: 'to'
      });
    }

    // Edge: ComponentDesignRule → target DesignComponent (hasComponentRule)
    if (isComponentRule) {
      const target = rule['ds:targetComponent'];
      const targetId = target ? (typeof target === 'string' ? target : target['@id']) : null;
      if (targetId) {
        edges.push({
          from: targetId,
          to: rule['@id'],
          label: 'hasRule',
          color: { color: '#FFB84D', opacity: 0.6 },
          dashes: [4, 2],
          arrows: 'to'
        });
      }
    }

    // Edge: DesignRule → constrained token(s) (constrainsToken)
    const constrained = rule['ds:constrainsToken'];
    if (constrained) {
      const refs = Array.isArray(constrained) ? constrained : [constrained];
      for (const ref of refs) {
        const refId = typeof ref === 'string' ? ref : ref['@id'];
        if (refId) {
          edges.push({
            from: rule['@id'],
            to: refId,
            label: 'constrains',
            color: { color: '#FF6B6B', opacity: 0.4 },
            dashes: [2, 4],
            arrows: 'to'
          });
        }
      }
    }
  }

  return { nodes, edges };
}

// ========================================
// TOKEN RESOLUTION TRACE (S7.6.7)
// ========================================

/**
 * Trace the resolution chain from any token node back to its Primitive ancestor.
 * Walks "references" and "consumesToken" edges backward through the graph to
 * build an ordered path: ComponentToken → SemanticToken → PrimitiveToken.
 *
 * @param {string} nodeId - @id of the starting node
 * @param {Object} parsed - Output from parseDSInstance()
 * @returns {{ path: Array<{id, type, name, value}>, nodeIds: string[], edgeIds: string[] }}
 *          path is ordered leaf → root; nodeIds/edgeIds for graph highlighting
 */
export function traceTokenResolution(nodeId, parsed) {
  const path = [];
  const nodeIds = [];
  const edgeIds = [];
  const visited = new Set();

  // Build lookup maps
  const allNodes = new Map();
  for (const p of parsed.primitives) allNodes.set(p['@id'], { ...p, _tier: 'Primitive' });
  for (const s of parsed.semantics) allNodes.set(s['@id'], { ...s, _tier: 'Semantic' });
  for (const c of parsed.components) {
    if (c['@type'] === 'ds:ComponentToken') allNodes.set(c['@id'], { ...c, _tier: 'Component' });
    if (c['@type'] === 'ds:DesignComponent') allNodes.set(c['@id'], { ...c, _tier: 'DesignComponent' });
  }

  function walk(id) {
    if (visited.has(id)) return;
    visited.add(id);

    const node = allNodes.get(id);
    if (!node) return;

    nodeIds.push(id);
    path.push({
      id,
      type: node['@type'] || node._tier,
      name: node['ds:tokenName'] || node['ds:componentName'] || id,
      value: node['ds:value'] || node['ds:lightModeValue'] || null
    });

    // ComponentToken → references SemanticToken
    const ref = node['ds:referencesToken'] || node['ds:references'];
    if (ref) {
      const refId = typeof ref === 'string' ? ref : ref['@id'];
      if (refId) {
        edgeIds.push(`${id}→${refId}`);
        walk(refId);
        return;
      }
    }

    // SemanticToken → references PrimitiveToken via alias
    const alias = node['ds:aliasRef'] || node['ds:primitiveRef'];
    if (alias) {
      const aliasId = typeof alias === 'string' ? alias : alias['@id'];
      if (aliasId) {
        edgeIds.push(`${id}→${aliasId}`);
        walk(aliasId);
        return;
      }
    }

    // Fallback: search edges for "references" pointing from this node
    // (covers cases where the reference is encoded as a graph edge, not a property)
  }

  walk(nodeId);
  return { path, nodeIds, edgeIds };
}

// ========================================
// INSTANCE SUMMARY
// ========================================

/**
 * Generate a summary of a parsed DS instance.
 *
 * @param {Object} parsed - Output from parseDSInstance()
 * @returns {Object} { brand, name, version, primitiveCount, semanticCount,
 *                     componentCount, categoryCount, themeModeSupport, syncStatus, ... }
 */
export function getDSInstanceSummary(parsed) {
  const ds = parsed.designSystem || {};
  const source = parsed.figmaSources[0] || {};
  const meta = parsed._meta || {};

  return {
    brand: meta.brand || ds['ds:pfiInstanceName'] || 'unknown',
    name: ds['ds:name'] || 'Unnamed Design System',
    version: ds['ds:version'] || meta.version || '0.0.0',
    namespace: ds['ds:namespace'] || '',
    isActive: ds['ds:isActive'] !== false,
    primitiveCount: parsed.primitives.length,
    semanticCount: parsed.semantics.length,
    componentCount: parsed.components.length,
    categoryCount: parsed.categories.length,
    patternCount: parsed.patterns.length,
    pageCount: parsed.pages.length,
    templateCount: parsed.templates.length,
    designRuleCount: (parsed.designRules || []).length,
    totalTokens: parsed.primitives.length + parsed.semantics.length + parsed.components.length,
    themeModeSupport: ds['ds:themeModeSupport'] === true,
    modeCount: parsed.modes.length,
    variantCount: parsed.variants.length,
    syncStatus: source['ds:syncStatus'] || meta.status || 'unknown',
    lastSyncedAt: source['ds:lastSyncedAt'] || meta.extractedAt || null,
    figmaFileKey: source['ds:fileKey'] || meta.figmaFileKey || null,
    figmaFileName: source['ds:fileName'] || null
  };
}

// ========================================
// CSS CUSTOM PROPERTY GENERATION
// ========================================

/**
 * Generate CSS custom properties from a parsed DS instance.
 * Maps semantic tokens to visualiser CSS variables.
 *
 * @param {Object} parsed - Output from parseDSInstance()
 * @returns {Object} { varName: value } — e.g., { '--viz-accent': '#00a4bf' }
 */
export function generateCSSVars(parsed) {
  const vars = {};
  const semMap = {};

  // Build lookup of semantic token name → value
  for (const tok of parsed.semantics) {
    const name = tok['ds:tokenName'] || '';
    const value = tok['ds:lightModeValue'] || '';
    if (name && value) semMap[name] = value;
  }

  // Map DS-ONT semantic tokens → visualiser CSS variables
  // Primary surface → accent/brand colour
  if (semMap['primary.surface.default']) vars['--viz-accent'] = semMap['primary.surface.default'];
  if (semMap['primary.surface.subtle']) vars['--viz-accent-subtle'] = semMap['primary.surface.subtle'];
  if (semMap['primary.surface.darker']) vars['--viz-accent-active'] = semMap['primary.surface.darker'];
  if (semMap['primary.border.default']) vars['--viz-accent-border'] = semMap['primary.border.default'];

  // Neutral surfaces → backgrounds
  if (semMap['neutral.text.title']) vars['--viz-text-primary'] = semMap['neutral.text.title'];
  if (semMap['neutral.text.body']) vars['--viz-text-secondary'] = semMap['neutral.text.body'];
  if (semMap['neutral.text.caption']) vars['--viz-text-muted'] = semMap['neutral.text.caption'];
  if (semMap['neutral.surface.subtle']) vars['--viz-surface-subtle'] = semMap['neutral.surface.subtle'];
  // DR-CANVAS-001: Guard canvas background — only allow dark-safe (lum < 0.05)
  // or light-safe (lum >= 0.2) values to preserve WCAG contrast ratios.
  if (semMap['neutral.surface.default']) {
    const lum = _relativeLuminance(semMap['neutral.surface.default']);
    if (lum !== null && (lum < 0.05 || lum >= 0.2)) {
      vars['--viz-surface-default'] = semMap['neutral.surface.default'];
    } else {
      console.warn(
        `[DS-Loader] DR-CANVAS-001: Rejected brand surface "${semMap['neutral.surface.default']}"` +
        ` (luminance ${lum !== null ? lum.toFixed(3) : 'unknown'}).` +
        ` Canvas background must have luminance < 0.05 (dark) or >= 0.2 (light).`
      );
    }
  }
  if (semMap['neutral.border.default']) vars['--viz-border-default'] = semMap['neutral.border.default'];

  // Container surface (PF-Core — Design Director structural token, not brand-overridable)
  if (semMap['container.surface.default']) vars['--viz-container-surface'] = semMap['container.surface.default'];

  // Error/Warning/Success/Info for feedback
  if (semMap['error.surface.default']) vars['--viz-error'] = semMap['error.surface.default'];
  if (semMap['warning.surface.default']) vars['--viz-warning'] = semMap['warning.surface.default'];
  if (semMap['success.surface.default']) vars['--viz-success'] = semMap['success.surface.default'];
  if (semMap['information.surface.default']) vars['--viz-info'] = semMap['information.surface.default'];

  // DR-SEMANTIC-005: Archetype colour overrides from brand tokens
  // Brands can supply archetype.{type}.surface tokens to override the default palette.
  for (const [name, value] of Object.entries(semMap)) {
    if (name.startsWith('archetype.') && value) {
      const parts = name.replace('archetype.', '').split('.');
      if (parts.length >= 2 && parts[1] === 'surface') {
        vars[`--viz-archetype-${parts[0]}`] = value;
      }
    }
  }

  // DR-SEMANTIC-006: Edge semantic colour overrides from brand tokens
  for (const [name, value] of Object.entries(semMap)) {
    if (name.startsWith('edge.') && value) {
      const parts = name.replace('edge.', '').split('.');
      if (parts.length >= 2 && parts[1] === 'color') {
        vars[`--viz-edge-${parts[0]}`] = value;
      }
    }
  }

  // Derive missing variables so the full UI transforms (no dark remnants)
  _deriveMissingVars(vars);

  return vars;
}

/**
 * Derive CSS variables that have no direct DS-ONT token mapping.
 * Uses the available surface/border/accent values to compute a
 * coherent full palette (elevated, card, border-subtle, accent-subtle).
 */
function _deriveMissingVars(vars) {
  const surfDefault = vars['--viz-surface-default'];
  const surfSubtle  = vars['--viz-surface-subtle'];
  const borderDef   = vars['--viz-border-default'];
  const accent      = vars['--viz-accent'];

  if (!surfDefault) return; // nothing to derive from

  const light = _isLight(surfDefault);

  // --viz-surface-elevated: panels/sidebars — lighter than default for light themes
  if (!vars['--viz-surface-elevated']) {
    vars['--viz-surface-elevated'] = light
      ? _adjustBrightness(surfDefault, 20)   // push toward white
      : _adjustBrightness(surfDefault, 8);
  }

  // --viz-surface-card: cards/items — between elevated and default
  if (!vars['--viz-surface-card']) {
    vars['--viz-surface-card'] = light
      ? _adjustBrightness(surfDefault, 10)
      : _adjustBrightness(surfDefault, 12);
  }

  // --viz-border-subtle: lighter variant of border-default
  if (!vars['--viz-border-subtle']) {
    const base = borderDef || surfSubtle || surfDefault;
    vars['--viz-border-subtle'] = light
      ? _adjustBrightness(base, -15)   // darker for light themes
      : _adjustBrightness(base, 10);
  }

  // --viz-accent-subtle: low-opacity accent for hover highlights
  if (!vars['--viz-accent-subtle'] && accent) {
    const rgb = _parseHex(accent);
    if (rgb) {
      vars['--viz-accent-subtle'] = `rgba(${rgb.r},${rgb.g},${rgb.b},0.08)`;
    }
  }

  // --viz-accent-active: if not mapped, darken accent
  if (!vars['--viz-accent-active'] && accent) {
    vars['--viz-accent-active'] = _adjustBrightness(accent, light ? -30 : -20);
  }

  // --viz-accent-border: fallback to accent-active or accent
  if (!vars['--viz-accent-border']) {
    vars['--viz-accent-border'] = vars['--viz-accent-active'] || accent;
  }
}

/** Parse a hex colour string to {r, g, b}. */
function _parseHex(hex) {
  if (!hex || typeof hex !== 'string') return null;
  const m = hex.replace('#', '').match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (!m) return null;
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
}

/**
 * Compute WCAG 2.1 relative luminance for a hex colour.
 * Uses the sRGB linearisation formula (IEC 61966-2-1).
 * Returns a value in [0, 1] or null if the hex is unparseable.
 */
function _relativeLuminance(hex) {
  const c = _parseHex(hex);
  if (!c) return null;
  const lin = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  return 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b);
}

/**
 * Compute WCAG 2.1 contrast ratio between two hex colours.
 * Returns ratio >= 1.0. AA requires >= 4.5:1 for normal text, >= 3:1 for graphical objects.
 * @param {string} hex1
 * @param {string} hex2
 * @returns {number|null}
 */
export function contrastRatio(hex1, hex2) {
  const l1 = _relativeLuminance(hex1);
  const l2 = _relativeLuminance(hex2);
  if (l1 === null || l2 === null) return null;
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Validate that every archetype colour in a palette meets WCAG contrast
 * against the canvas background. Returns { valid: boolean, results: [] }.
 * @param {Object} palette - { archetypeKey: hexColour }
 * @param {string} canvasBackground - hex colour of the canvas (#0f1117 default)
 * @param {number} [minRatio=3] - minimum contrast ratio (3:1 for graphical objects)
 * @returns {{ valid: boolean, results: Array<{archetype: string, color: string, ratio: number|null, pass: boolean}> }}
 */
export function validateArchetypePalette(palette, canvasBackground, minRatio) {
  if (typeof minRatio === 'undefined') minRatio = 3;
  const results = [];
  for (const [archetype, color] of Object.entries(palette)) {
    const ratio = contrastRatio(color, canvasBackground);
    results.push({ archetype, color, ratio, pass: ratio !== null && ratio >= minRatio });
  }
  return { valid: results.every(r => r.pass), results };
}

/** Return true if the colour is perceptually light (relative luminance > 0.5). */
function _isLight(hex) {
  const c = _parseHex(hex);
  if (!c) return false;
  // sRGB relative luminance (simplified)
  return (0.299 * c.r + 0.587 * c.g + 0.114 * c.b) / 255 > 0.5;
}

/** Shift a hex colour's brightness by `amount` (positive = lighter, negative = darker). */
function _adjustBrightness(hex, amount) {
  const c = _parseHex(hex);
  if (!c) return hex;
  const clamp = v => Math.max(0, Math.min(255, Math.round(v + amount)));
  return `#${[clamp(c.r), clamp(c.g), clamp(c.b)].map(v => v.toString(16).padStart(2, '0')).join('')}`;
}

/**
 * Apply generated CSS vars to the document root.
 *
 * @param {Object} cssVars - Output from generateCSSVars()
 */
export function applyCSSVars(cssVars) {
  const root = document.documentElement;
  for (const [prop, value] of Object.entries(cssVars)) {
    root.style.setProperty(prop, value);
  }

  // DR-SEMANTIC-005: Validate archetype/edge colour overrides against canvas
  const canvasBg = cssVars['--viz-surface-default'] || getComputedStyle(root).getPropertyValue('--viz-surface-default').trim() || '#0f1117';
  for (const [varName, color] of Object.entries(cssVars)) {
    if (varName.startsWith('--viz-archetype-') || varName.startsWith('--viz-edge-')) {
      const ratio = contrastRatio(color, canvasBg);
      if (ratio !== null && ratio < 3) {
        console.warn(`[DS-Loader] DR-SEMANTIC-005: ${varName}=${color} insufficient contrast (${ratio.toFixed(1)}:1 < 3:1) against canvas ${canvasBg}. Reverting.`);
        root.style.removeProperty(varName);
      }
    }
  }
}

/**
 * Resolve the DS-ONT brand for a PFI instance configuration.
 * Three-tier resolution: designSystemConfig.brand → fallback → brands[0] lowercase.
 *
 * @param {Object} pfiConfig - PFI instance object (from state.pfiInstances or registry)
 * @returns {{ brand: string|null, source: string }}
 */
export function resolveDSBrandForPFI(pfiConfig) {
  const dsConfig = pfiConfig?.designSystemConfig;

  // Tier 1: explicit brand from designSystemConfig
  if (dsConfig?.brand && state.dsInstances?.has(dsConfig.brand)) {
    return { brand: dsConfig.brand, source: 'designSystemConfig' };
  }

  // Tier 2: fallback brand
  if (dsConfig?.fallback && state.dsInstances?.has(dsConfig.fallback)) {
    return { brand: dsConfig.fallback, source: 'fallback' };
  }

  // Tier 3: match brands[0] case-insensitively to loaded dsInstances
  const brands = pfiConfig?.brands;
  if (Array.isArray(brands) && brands.length > 0) {
    const key = brands[0].toLowerCase();
    if (state.dsInstances?.has(key)) {
      return { brand: key, source: 'brands-array' };
    }
  }

  return { brand: null, source: 'none' };
}

/**
 * Reset CSS vars to defaults by removing custom properties.
 *
 * @param {Object} cssVars - The vars to remove
 */
export function resetCSSVars(cssVars) {
  const root = document.documentElement;
  for (const prop of Object.keys(cssVars)) {
    root.style.removeProperty(prop);
  }
}

// ========================================
// WORKFLOW MERMAID GENERATION (S7.6.7)
// ========================================

/**
 * Generate a Mermaid flowchart from a PE process definition JSON.
 * Reads pe:hasPhase and pe:hasGate to build a phase-gate pipeline diagram.
 *
 * @param {Object} processJson - PE-DS-EXTRACT-001 process definition
 * @returns {string} Mermaid flowchart source text (empty string if invalid)
 */
export function generateWorkflowMermaid(processJson) {
  if (!processJson) return '';
  const phases = processJson['pe:hasPhase'];
  const gates = processJson['pe:hasGate'];
  if (!Array.isArray(phases) || phases.length === 0) return '';

  const sorted = [...phases].sort((a, b) => (a['pe:phaseNumber'] || 0) - (b['pe:phaseNumber'] || 0));
  const gateMap = {};
  if (Array.isArray(gates)) {
    for (const g of gates) {
      gateMap[g['pe:afterPhase']] = g;
    }
  }

  const lines = ['flowchart TD'];
  const processName = processJson['pe:processName'] || 'Process';
  lines.push(`    START(["${_mesc(processName)}"]):::startNode`);

  for (const phase of sorted) {
    const num = phase['pe:phaseNumber'];
    const name = phase['pe:phaseName'] || `Phase ${num}`;
    const dur = phase['pe:estimatedDuration'] || '';
    const durLabel = dur.replace('PT', '').replace('M', 'min').replace('S', 's');
    const pId = `P${num}`;
    lines.push(`    ${pId}["Phase ${num}: ${_mesc(name)}<br/>(~${durLabel})"]:::phaseNode`);

    const gate = gateMap[phase['pe:phaseId']];
    if (gate) {
      const gNum = num;
      const gName = gate['pe:gateName'] || `Gate ${gNum}`;
      const gId = `G${gNum}`;
      lines.push(`    ${gId}{"GATE-${gNum}: ${_mesc(gName)}"}:::gateNode`);
    }
  }

  lines.push(`    DONE(["Complete"]):::doneNode`);

  // Edges: START -> P1 -> G1 -> P2 -> G2 -> ... -> DONE
  let prev = 'START';
  for (const phase of sorted) {
    const num = phase['pe:phaseNumber'];
    const pId = `P${num}`;
    lines.push(`    ${prev} --> ${pId}`);
    const gate = gateMap[phase['pe:phaseId']];
    if (gate) {
      const gId = `G${num}`;
      lines.push(`    ${pId} --> ${gId}`);
      prev = gId;
    } else {
      prev = pId;
    }
  }
  lines.push(`    ${prev} --> DONE`);

  // Styles
  lines.push(`    classDef startNode fill:#1e40af,stroke:#93c5fd,color:#e0e0e0`);
  lines.push(`    classDef phaseNode fill:#1a1d27,stroke:#4CAF50,color:#e0e0e0`);
  lines.push(`    classDef gateNode fill:#1a1d27,stroke:#FF9800,color:#fcd34d`);
  lines.push(`    classDef doneNode fill:#166534,stroke:#86efac,color:#e0e0e0`);

  return lines.join('\n');
}

/** Escape Mermaid special characters in label text. */
function _mesc(str) {
  return (str || '').replace(/"/g, "'").replace(/[<>{}]/g, '');
}

// ========================================
// DS GRAPH ENTRY HELPERS (S7.6.4, S7.6.5)
// ========================================

/**
 * Add a new node to a parsed DS instance's appropriate array.
 * Detects array by @type, appends to parsed object in-place.
 *
 * @param {Object} parsed - Output from parseDSInstance() (mutated in-place)
 * @param {Object} entry - A JSONLD node with @type and @id
 * @returns {{ success: boolean, error?: string }}
 */
export function addDSGraphEntry(parsed, entry) {
  if (!parsed || !entry || !entry['@type'] || !entry['@id']) {
    return { success: false, error: 'Invalid entry: requires @type and @id' };
  }

  const typeMap = {
    'ds:DesignComponent': 'components',
    'ds:ComponentToken': 'components',
    'ds:PrimitiveToken': 'primitives',
    'ds:SemanticToken': 'semantics',
    'ds:TokenCategory': 'categories',
    'ds:BrandVariant': 'variants',
    'ds:FigmaSource': 'figmaSources',
    'ds:ThemeMode': 'modes',
    'ds:DesignPattern': 'patterns',
    'ds:PageDefinition': 'pages',
    'ds:TemplateDefinition': 'templates',
    'ds:DesignRule': 'designRules',
    'ds:ComponentDesignRule': 'designRules',
  };

  const arr = typeMap[entry['@type']];
  if (!arr) return { success: false, error: `Unknown @type: ${entry['@type']}` };

  // Ensure array exists (backward compat for v1.2.0 parsed instances without designRules)
  if (!parsed[arr]) parsed[arr] = [];

  // Check duplicate @id
  if (parsed[arr].some(n => n['@id'] === entry['@id'])) {
    return { success: false, error: `Duplicate @id: ${entry['@id']}` };
  }

  parsed[arr].push(entry);
  return { success: true };
}

// ========================================
// DS ARTEFACT VERSIONING (S7.6.6)
// ========================================

/**
 * Save a page/template artefact to the DS instance.
 *
 * @param {string} brand - Brand key in dsInstances map
 * @param {Object} artefact - PageDefinition or TemplateDefinition node
 * @returns {{ success: boolean, error?: string }}
 */
export function saveDSArtefact(brand, artefact) {
  const parsed = state.dsInstances.get(brand);
  if (!parsed) return { success: false, error: `Brand "${brand}" not loaded` };

  const result = addDSGraphEntry(parsed, artefact);
  if (!result.success) return result;

  // Record in version history
  const id = artefact['@id'];
  const version = artefact['ds:version'] || '1.0.0';
  if (!state.dsArtefactHistory.has(id)) {
    state.dsArtefactHistory.set(id, []);
  }
  state.dsArtefactHistory.get(id).push({
    version,
    timestamp: new Date().toISOString(),
    changes: 'Initial creation',
  });

  return { success: true };
}

/**
 * Bump the version of a DS artefact.
 *
 * @param {string} brand - Brand key
 * @param {string} artefactId - @id of the artefact
 * @param {'patch'|'minor'|'major'} bumpType
 * @returns {{ success: boolean, oldVersion?: string, newVersion?: string, error?: string }}
 */
export function bumpDSArtefactVersion(brand, artefactId, bumpType) {
  const parsed = state.dsInstances.get(brand);
  if (!parsed) return { success: false, error: `Brand "${brand}" not loaded` };

  const all = [...parsed.pages, ...parsed.templates, ...(parsed.designRules || [])];
  const artefact = all.find(a => a['@id'] === artefactId);
  if (!artefact) return { success: false, error: `Artefact "${artefactId}" not found` };

  const old = artefact['ds:version'] || '1.0.0';
  const parts = old.split('.').map(Number);
  if (bumpType === 'major') { parts[0]++; parts[1] = 0; parts[2] = 0; }
  else if (bumpType === 'minor') { parts[1]++; parts[2] = 0; }
  else { parts[2]++; }
  const newVer = parts.join('.');
  artefact['ds:version'] = newVer;

  if (!state.dsArtefactHistory.has(artefactId)) {
    state.dsArtefactHistory.set(artefactId, []);
  }
  state.dsArtefactHistory.get(artefactId).push({
    version: newVer,
    timestamp: new Date().toISOString(),
    changes: `${bumpType} bump from ${old}`,
  });

  return { success: true, oldVersion: old, newVersion: newVer };
}

/**
 * Get version history for a DS artefact.
 *
 * @param {string} artefactId - @id of the artefact
 * @returns {Array} [{version, timestamp, changes}]
 */
export function getDSArtefactHistory(artefactId) {
  return state.dsArtefactHistory.get(artefactId) || [];
}
