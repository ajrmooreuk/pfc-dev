/**
 * Layer Filter — F8.7 Multilayer Semantic Filtering
 *
 * Pure logic module (no DOM). Maps OAA series metadata to 6 semantic layers
 * and provides compound OR/AND filtering with depth-of-field dimming.
 *
 * Layers: Strategic (VE), Operational (PE), Compliance (RCSG),
 *         Foundation, Orchestration, Cross-Ref (edge-based).
 */

import { state, SEMANTIC_LAYERS, LAYER_PRESETS } from './state.js';

// ========================================
// NODE LAYER MEMBERSHIP
// ========================================

/**
 * Get the semantic layer key for a node based on its series metadata.
 * @param {Object} node - Parsed node with `series` property
 * @returns {string|null} Layer key (e.g. 'strategic') or null if unmapped
 */
export function getNodeLayer(node) {
  if (!node || !node.series) return null;
  for (const [layerKey, layer] of Object.entries(SEMANTIC_LAYERS)) {
    if (layer.series.includes(node.series)) return layerKey;
  }
  return null;
}

/**
 * Build a Set of node IDs involved in cross-ontology edges.
 * These nodes belong to the 'crossRef' layer.
 * @param {Array} crossEdges - Array of {from, to} cross-ontology edges
 * @returns {Set<string>} Node IDs
 */
export function buildCrossRefNodeSet(crossEdges) {
  const ids = new Set();
  if (!crossEdges) return ids;
  for (const e of crossEdges) {
    if (e.from) ids.add(e.from);
    if (e.to) ids.add(e.to);
  }
  return ids;
}

/**
 * Check whether a node belongs to a specific semantic layer.
 * @param {Object} node - Parsed node with `series` property
 * @param {string} layerKey - Layer key from SEMANTIC_LAYERS
 * @param {Set<string>} crossRefNodeIds - Set from buildCrossRefNodeSet()
 * @returns {boolean}
 */
export function isNodeInLayer(node, layerKey, crossRefNodeIds) {
  if (!node || !layerKey) return false;
  if (layerKey === 'crossRef') {
    return crossRefNodeIds ? crossRefNodeIds.has(node.id) : false;
  }
  const layer = SEMANTIC_LAYERS[layerKey];
  if (!layer) return false;
  return layer.series.includes(node.series);
}

// ========================================
// COMPOUND FILTER COMPUTATION
// ========================================

/**
 * Compute which nodes are visible vs dimmed based on active layers and mode.
 *
 * OR mode:  node visible if it matches ANY active layer
 * AND mode: node visible if it matches ALL active layers
 *           (crossRef treated as overlay — node must be in crossRef AND at least one other active series layer)
 *
 * @param {Array} nodes - Array of parsed nodes
 * @param {Set<string>} activeLayers - Set of active layer keys
 * @param {string} mode - 'or' | 'and'
 * @param {Set<string>} crossRefNodeIds - Set from buildCrossRefNodeSet()
 * @returns {{ visible: Set<string>, dimmed: Set<string> }}
 */
export function computeLayerFilter(nodes, activeLayers, mode, crossRefNodeIds) {
  const visible = new Set();
  const dimmed = new Set();

  if (!nodes || !activeLayers || activeLayers.size === 0) {
    // No layers selected → all dimmed
    for (const n of (nodes || [])) dimmed.add(n.id);
    return { visible, dimmed };
  }

  const allLayerKeys = [...activeLayers];
  const seriesLayerKeys = allLayerKeys.filter(k => k !== 'crossRef');
  const crossRefActive = activeLayers.has('crossRef');

  for (const n of nodes) {
    let passes = false;

    if (mode === 'or') {
      // OR: visible if node matches ANY active layer
      for (const lk of allLayerKeys) {
        if (isNodeInLayer(n, lk, crossRefNodeIds)) {
          passes = true;
          break;
        }
      }
    } else {
      // AND: node must match ALL active layers
      // Special handling: crossRef is an overlay layer.
      // If crossRef + series layers active → node must be in crossRef AND in at least one series layer.
      // If only crossRef active → node must be in crossRef.
      // If only series layers active → node must be in ALL series layers (strict intersection — typically empty for multi-series).
      if (crossRefActive && seriesLayerKeys.length > 0) {
        // Must be in crossRef AND at least one of the series layers
        const inCrossRef = isNodeInLayer(n, 'crossRef', crossRefNodeIds);
        let inAnySeries = false;
        for (const lk of seriesLayerKeys) {
          if (isNodeInLayer(n, lk, crossRefNodeIds)) { inAnySeries = true; break; }
        }
        passes = inCrossRef && inAnySeries;
      } else if (crossRefActive && seriesLayerKeys.length === 0) {
        passes = isNodeInLayer(n, 'crossRef', crossRefNodeIds);
      } else {
        // Only series layers — node must match ALL (intersection)
        passes = true;
        for (const lk of seriesLayerKeys) {
          if (!isNodeInLayer(n, lk, crossRefNodeIds)) { passes = false; break; }
        }
      }
    }

    if (passes) {
      visible.add(n.id);
    } else {
      dimmed.add(n.id);
    }
  }

  return { visible, dimmed };
}

/**
 * Count nodes per semantic layer.
 * @param {Array} nodes - Array of parsed nodes
 * @param {Set<string>} crossRefNodeIds - Set from buildCrossRefNodeSet()
 * @returns {Object<string, number>} { layerKey: count }
 */
export function computeLayerCounts(nodes, crossRefNodeIds) {
  const counts = {};
  for (const key of Object.keys(SEMANTIC_LAYERS)) counts[key] = 0;
  if (!nodes) return counts;
  for (const n of nodes) {
    const layer = getNodeLayer(n);
    if (layer) counts[layer]++;
    if (crossRefNodeIds && crossRefNodeIds.has(n.id)) counts.crossRef++;
  }
  return counts;
}

// ========================================
// URL HASH SERIALISATION (DR-LAYER-003)
// ========================================

/**
 * Serialise layer state to URL hash string.
 * @param {Set<string>} activeLayers
 * @param {string} mode - 'or' | 'and'
 * @param {string|null} preset - preset key or null
 * @returns {string} Hash string (without #)
 */
export function serializeLayerState(activeLayers, mode, preset) {
  const parts = [];
  if (activeLayers && activeLayers.size > 0) {
    parts.push('layers=' + [...activeLayers].sort().join(','));
  }
  if (mode && mode !== 'or') {
    parts.push('mode=' + mode);
  }
  if (preset) {
    parts.push('preset=' + preset);
  }
  return parts.join('&');
}

/**
 * Parse URL hash string into layer state.
 * @param {string} hash - Hash string (with or without #)
 * @returns {{ activeLayers: Set<string>, mode: string, preset: string|null }}
 */
export function deserializeLayerState(hash) {
  const result = { activeLayers: new Set(), mode: 'or', preset: null };
  if (!hash) return result;

  const clean = hash.startsWith('#') ? hash.slice(1) : hash;
  if (!clean) return result;

  const params = new URLSearchParams(clean);

  const layersStr = params.get('layers');
  if (layersStr) {
    for (const key of layersStr.split(',')) {
      const trimmed = key.trim();
      if (SEMANTIC_LAYERS[trimmed]) result.activeLayers.add(trimmed);
    }
  }

  const mode = params.get('mode');
  if (mode === 'and' || mode === 'or') result.mode = mode;

  const preset = params.get('preset');
  if (preset && LAYER_PRESETS[preset]) result.preset = preset;

  return result;
}
