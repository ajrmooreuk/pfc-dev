/**
 * Graph rendering with vis.js — renderGraph, layout controls, focus/zoom.
 */

import { state, EDGE_STYLES, SERIES_COLORS, LINEAGE_COLORS, SERIES_HIGHLIGHT_COLORS, COMPONENT_COLORS, CONTEXT_OPACITY, EDGE_LABEL_CATEGORIES, EDGE_SEMANTIC_STYLES, DS_BRIDGE_STYLES, getArchetypeColor, getArchetypeShape, getArchetypeSize, getEdgeSemanticColor, refreshArchetypeCache } from './state.js';
import { parseOntology } from './ontology-parser.js';
import { auditGraph, validateOAAv5, computeCompletenessScore } from './audit-engine.js';
import { renderOAACompliancePanel, renderCompletenessScore } from './compliance-reporter.js';
import { lookupRegistry } from './github-loader.js';
import { renderAuditPanel, showNodeDetails, switchTab, closeSidebar, showScopeRuleLog } from './ui-panels.js';
import { classifyLineageEdge, getNodeLineageRole, getNodeSeries, getSubSeriesForSeries, getOntologiesForSubSeries } from './multi-loader.js';
import { getActiveFilteredView, getNodeRenderMode, isEdgeVisible, filterSeriesData, filterCrossSeriesEdges, buildScopedFilteredView, getScopedNodeRenderMode, isScopedEdgeVisible } from './composition-filter.js';

// Safe DOM helpers
function _show(id, display = 'block') { const el = document.getElementById(id); if (el) el.style.display = display; }
function _hide(id) { const el = document.getElementById(id); if (el) el.style.display = 'none'; }
function _rmClass(id, cls) { const el = document.getElementById(id); if (el) el.classList.remove(cls); }

// F40.22 S40.22.5: Build PFI scope summary text for stats bar
function _buildScopeSummaryText(filteredView) {
  if (!state.compositionFilterActive || !filteredView) return '';
  const vis = filteredView.visibleNamespaces.size;
  const ghost = filteredView.contextGhostNamespaces.size;
  const hidden = filteredView.hiddenNamespaces.size;
  const instanceLabel = state.activeInstanceId || 'Composition';
  const declaredCount = state.activeComposition?.instanceOntologiesRaw?.length || vis;
  return ` | ${instanceLabel}: ${declaredCount} declared, ${vis} visible, ${ghost} ghost, ${hidden} hidden`;
}

// ========================================
// CENTRALISED EDGE STYLING HELPER (DR-EDGE-005 through DR-EDGE-008)
// ========================================

/**
 * Get complete vis-network edge styling for a given edge semantic type.
 * @param {string} edgeType - Key in EDGE_STYLES (e.g. 'relationship', 'crossOntology')
 * @param {Object} [ctx] - Rendering context for overrides
 * @param {string} [ctx.tier] - 'single'|'multi'|'tier0'|'tier1'|'connectionMap'
 * @param {string} [ctx.dynamicColor] - Override colour (for lineage series matches)
 * @param {number} [ctx.dynamicWidth] - Override width (for connectionMap weighting)
 * @returns {Object} vis-network edge options { color, font, arrows, dashes, width, smooth }
 */
export function getEdgeStyle(edgeType, ctx = {}) {
  // DR-SEMANTIC-002: label-based category overrides generic edgeType
  let s;
  if (ctx.label && EDGE_LABEL_CATEGORIES[ctx.label]) {
    const category = EDGE_LABEL_CATEGORIES[ctx.label];
    const sem = EDGE_SEMANTIC_STYLES[category];
    if (sem) {
      const semColor = getEdgeSemanticColor(category);
      s = { ...sem, color: semColor };
    }
  }
  if (!s) s = EDGE_STYLES[edgeType] || EDGE_STYLES.default;
  const color = ctx.dynamicColor || s.color;
  const highlight = ctx.dynamicColor || s.highlightColor;
  const width = ctx.dynamicWidth ?? s.width;
  // Multi-mode internal edges use 80% width to reduce clutter (DR-EDGE-005)
  const effectiveWidth = (ctx.tier === 'multi' && s.priority <= 2) ? Math.max(width * 0.8, 1) : width;
  return {
    color: { color, highlight },
    font: { color: s.fontColor || '#888', size: s.fontSize || 10, strokeWidth: 0, background: 'rgba(15,17,23,0.85)' },
    arrows: s.arrows,
    dashes: s.dashes,
    width: effectiveWidth,
    smooth: s.smooth
  };
}

// ========================================
// SERIES HIGHLIGHT / LINEAGE EDGE STYLING HELPERS
// ========================================

/**
 * Style a cross-ontology edge based on highlighted series membership.
 * VE/PE use lineage chain logic (consecutive steps); other series highlight
 * any edge where both endpoints belong to the highlighted series.
 * Returns vis.js edge styling overrides or null for default styling.
 */
function getLineageEdgeStyle(fromNs, toNs) {
  if (state.highlightedSeries.size === 0) return null;

  const highlighted = state.highlightedSeries;

  // VE/PE chain-consecutive logic
  const veActive = highlighted.has('VE-Series');
  const peActive = highlighted.has('PE-Series');
  if (veActive || peActive) {
    const { isVE, isPE, isConvergence } = classifyLineageEdge(fromNs, toNs);
    if (isConvergence && veActive && peActive) return getEdgeStyle('lineageConvergence');
    if (isVE && veActive) return getEdgeStyle('lineageVE');
    if (isPE && peActive) return getEdgeStyle('lineagePE');
  }

  // General series highlighting: both endpoints in same highlighted series
  const fromSeries = getNodeSeries(fromNs, state.loadedOntologies);
  const toSeries = getNodeSeries(toNs, state.loadedOntologies);
  if (fromSeries && toSeries && fromSeries === toSeries && highlighted.has(fromSeries)) {
    const color = SERIES_HIGHLIGHT_COLORS[fromSeries] || '#eab839';
    return getEdgeStyle('lineageSeriesFull', { dynamicColor: color });
  }

  // One endpoint in a highlighted series — partial highlight
  if ((fromSeries && highlighted.has(fromSeries)) || (toSeries && highlighted.has(toSeries))) {
    const matchedSeries = (fromSeries && highlighted.has(fromSeries)) ? fromSeries : toSeries;
    const color = SERIES_HIGHLIGHT_COLORS[matchedSeries] || '#eab839';
    return getEdgeStyle('lineageSeriesPartial', { dynamicColor: color });
  }

  // Dim non-matching cross-ontology edges
  return getEdgeStyle('lineageDimmed');
}

/**
 * Get highlight node styling when a node belongs to 2+ highlighted series
 * (convergence point) or when VE+PE lineage chains overlap (EFS).
 * Returns vis.js node styling overrides or null.
 */
function getConvergenceNodeStyle(namespace) {
  if (state.highlightedSeries.size === 0) return null;

  // Check VE/PE lineage convergence (EFS appears in both chains)
  const { isConvergence } = getNodeLineageRole(namespace);
  if (isConvergence && state.highlightedSeries.has('VE-Series') && state.highlightedSeries.has('PE-Series')) {
    return {
      borderColor: SERIES_HIGHLIGHT_COLORS.convergence,
      borderWidth: 4,
      size: 1.3, // multiplier
      shadow: { enabled: true, color: SERIES_HIGHLIGHT_COLORS.convergence, size: 12, x: 0, y: 0 },
      title: 'CONVERGENCE POINT \u2014 VE and PE lineage chains meet here'
    };
  }

  // Single-series highlighting: glow nodes in the highlighted series
  const series = getNodeSeries(namespace, state.loadedOntologies);
  if (series && state.highlightedSeries.has(series)) {
    const color = SERIES_HIGHLIGHT_COLORS[series] || '#eab839';
    return {
      borderColor: color,
      borderWidth: 3,
      size: 1.15,
      shadow: { enabled: true, color: color, size: 8, x: 0, y: 0 },
      title: null // no extra title for simple series highlight
    };
  }

  return null;
}

/**
 * Attach a cross-ontology edge click handler to the current network.
 * Clicking a cross-ontology edge navigates to the target ontology (X.3.7).
 */
function attachEdgeClickHandler(visEdges) {
  if (!state.network) return;
  state.network.on('selectEdge', function(params) {
    if (params.edges.length !== 1 || params.nodes.length > 0) return;
    const edgeId = params.edges[0];
    const edge = visEdges.find(e => e.id === edgeId);
    if (!edge || !edge._crossOntologyTarget) return;
    const targetNs = edge._crossOntologyTarget;
    if (state.loadedOntologies?.has(targetNs)) {
      const record = state.loadedOntologies.get(targetNs);
      if (record && !record.isPlaceholder) {
        window.drillToOntology(targetNs);
      }
    }
  });
}

export function focusNode(id) {
  if (state.network) { state.network.selectNodes([id]); state.network.focus(id, { scale: 1.5, animation: true }); }
}

export function focusNodes(ids) {
  if (state.network) { state.network.selectNodes(ids); state.network.fit({ nodes: ids, animation: true }); }
}

export function renderGraph(parsed, seriesContext) {
  state.lastParsed = parsed;
  refreshArchetypeCache(); // DR-SEMANTIC-001: pick up brand-overridden archetype colours

  const audit = auditGraph(parsed);
  renderAuditPanel(audit);

  const validation = validateOAAv5(state.currentData, parsed);
  renderOAACompliancePanel(validation);

  const score = computeCompletenessScore(validation);
  renderCompletenessScore(score);
  state.lastCompletenessScore = score;

  lookupRegistry().then(regInfo => {
    if (regInfo) {
      console.log('Registry entry found:', regInfo.entryId, 'v' + regInfo.version);
    }
  }).catch(err => console.warn('Registry lookup failed:', err));

  const siloNodeIds = new Set();
  audit.isolated.forEach(n => siloNodeIds.add(n.id));
  if (audit.components.length > 1) {
    audit.components.slice(1).forEach(comp => comp.forEach(id => siloNodeIds.add(id)));
  }

  // Store component map for colouring/filtering (Story #61, #62)
  state.componentMap = audit.componentMap;
  const useComponentColors = state.componentColoringActive && audit.components.length > 1;
  const filterIdx = state.componentFilter;

  const visNodes = parsed.nodes
    .filter(n => {
      // Component filter: hide nodes not in selected component
      if (filterIdx !== null && audit.componentMap.has(n.id)) {
        return audit.componentMap.get(n.id) === filterIdx;
      }
      return true;
    })
    .map(n => {
      const isSilo = siloNodeIds.has(n.id);
      const compIdx = audit.componentMap.get(n.id);
      const compColor = useComponentColors && compIdx !== undefined
        ? COMPONENT_COLORS[compIdx % COMPONENT_COLORS.length] : null;
      // DR-SERIES-003: series border persists through drill-through (silo/component take priority)
      const seriesBorder = seriesContext && !isSilo && !compColor ? seriesContext.seriesColor : null;
      const borderColor = isSilo ? '#FF9800' : (compColor || seriesBorder || '#222');
      // DR-BRAND-001: brand glow ring when DS brand is active
      const brandGlow = state.brandContext ? { enabled: true, color: state.brandContext.accentColor, size: 6, x: 0, y: 0 } : undefined;
      const shape = getArchetypeShape(n.entityType);
      const autoSized = ['box', 'hexagon', 'ellipse', 'square'].includes(shape);
      return {
        id: n.id,
        label: n.label,
        color: {
          background: compColor || getArchetypeColor(n.entityType),
          border: borderColor,
          highlight: { background: '#9dfff5', border: '#017c75' }
        },
        borderWidth: isSilo ? 3 : (seriesBorder ? 2.5 : 2),
        borderWidthSelected: 4,
        shapeProperties: { borderDashes: isSilo ? [6, 3] : false },
        shadow: brandGlow,
        font: { color: '#e0e0e0', size: 13 },
        shape,
        size: autoSized ? undefined : getArchetypeSize(n.entityType),
        widthConstraint: autoSized ? { minimum: 60, maximum: 120 } : undefined,
        title: n.description || n.label,
        _data: n
      };
    });

  // Build a set of visible node IDs for edge filtering
  const visibleNodeIds = new Set(visNodes.map(n => n.id));

  const visEdges = parsed.edges
    .filter(e => visibleNodeIds.has(e.from) && visibleNodeIds.has(e.to))
    .map(e => ({
      from: e.from,
      to: e.to,
      label: e.label,
      ...getEdgeStyle(e.edgeType || 'default', { tier: 'single', label: e.label })
    }));

  const container = document.getElementById('network');
  const data = { nodes: new vis.DataSet(visNodes), edges: new vis.DataSet(visEdges) };

  const options = {
    physics: {
      enabled: state.physicsEnabled,
      stabilization: { iterations: 200 },
      barnesHut: { gravitationalConstant: -3000, springLength: 150 }
    },
    interaction: { hover: true, tooltipDelay: 200 },
    nodes: { borderWidth: 2 },
    edges: { smooth: { type: 'continuous', roundness: 0.3 } },
    layout: {}
  };

  state.network = new vis.Network(container, data, options);

  state.network.once('stabilizationIterationsDone', function() {
    state.network.fit({ animation: true });
  });

  state.network.on('click', function(params) {
    if (params.nodes.length > 0) {
      const nodeId = params.nodes[0];
      // Selection mode intercept (Epic 7)
      if (state.selectionMode && typeof window.toggleNodeSelection === 'function') {
        window.toggleNodeSelection(nodeId);
        return;
      }
      const node = visNodes.find(n => n.id === nodeId);
      if (node) showNodeDetails(node._data);
    } else {
      closeSidebar();
    }
  });

  state.network.on('doubleClick', function(params) {
    if (params.nodes.length > 0) {
      const nodeId = params.nodes[0];
      // In authoring mode, double-click opens entity editor (Epic 7)
      if (state.authoringMode && typeof window.showEntityEditorUI === 'function') {
        window.showEntityEditorUI(nodeId);
        return;
      }
      const node = visNodes.find(n => n.id === nodeId);
      if (node) {
        showNodeDetails(node._data);
        switchTab('connections');
      }
    }
  });

  document.getElementById('stats').textContent =
    `${parsed.nodes.length} nodes | ${parsed.edges.length} edges | ${parsed.name} [${parsed.diagnostics.format}]`;

  buildLegend(parsed.nodes, seriesContext);

  // F8.7: Re-apply layer filter after render
  if (state.layerFilterActive && typeof window.applyLayerFilterToGraph === 'function') {
    setTimeout(() => window.applyLayerFilterToGraph(), 50);
  }
}

/**
 * Map vis-network shape name to legend CSS class.
 */
function _legendShapeClass(shape) {
  const map = { hexagon: 'legend-shape legend-shape-hexagon', triangle: 'legend-shape legend-shape-triangle', diamond: 'legend-shape legend-shape-diamond', star: 'legend-shape legend-shape-star', square: 'legend-shape legend-shape-square', ellipse: 'legend-shape legend-shape-ellipse', box: 'legend-shape legend-shape-square', dot: 'legend-dot' };
  return map[shape] || 'legend-dot';
}

/**
 * Count edges per semantic category from the last parsed edges.
 */
function _countEdgeCategories(edges) {
  const counts = {};
  for (const e of edges) {
    const cat = EDGE_LABEL_CATEGORIES[e.label];
    if (cat) counts[cat] = (counts[cat] || 0) + 1;
  }
  return counts;
}

/**
 * Build interactive semantic legend with hover-highlight and click-filter (DR-SEMANTIC-004).
 */
export function buildLegend(nodes, seriesContext) {
  const legend = document.getElementById('legend');
  if (!legend) return;
  legend.style.display = 'block';

  // Count nodes per type
  const typeCounts = {};
  for (const n of nodes) {
    const t = n.entityType || 'default';
    typeCounts[t] = (typeCounts[t] || 0) + 1;
  }

  let html = '<div class="legend-header"><h4>Entities</h4>' +
    '<button class="legend-reset-btn" data-legend-action="reset" title="Clear filter">Reset</button></div>';

  // Node type section with shape indicators
  html += '<div class="legend-section">';
  for (const [type, count] of Object.entries(typeCounts)) {
    const color = getArchetypeColor(type);
    const shape = getArchetypeShape(type);
    const cls = _legendShapeClass(shape);
    html += `<div class="legend-item" data-legend-type="${type}" data-legend-group="node">` +
      `<div class="${cls}" style="background:${color}"></div>` +
      `<span>${type}</span><span class="legend-count">${count}</span></div>`;
  }
  html += '</div>';

  // Edge category section
  const edgeCats = state.lastParsed ? _countEdgeCategories(state.lastParsed.edges) : {};
  if (Object.keys(edgeCats).length > 0) {
    html += '<div class="legend-section"><div class="legend-section-title">Relationships</div>';
    for (const [cat, count] of Object.entries(edgeCats)) {
      const s = EDGE_SEMANTIC_STYLES[cat];
      if (!s) continue;
      const dashStyle = Array.isArray(s.dashes) ? 'dashed' : 'solid';
      html += `<div class="legend-item" data-legend-type="${cat}" data-legend-group="edge">` +
        `<div class="legend-edge-sample" style="border-top: ${s.width}px ${dashStyle} ${getEdgeSemanticColor(cat)}"></div>` +
        `<span>${cat}</span><span class="legend-count">${count}</span></div>`;
    }
    html += '</div>';
  }

  // DR-SERIES-004: series provenance indicator
  if (seriesContext) {
    html += `<div class="legend-item" style="margin-top:6px;border-top:1px solid var(--viz-border-subtle);padding-top:4px;">` +
      `<div class="legend-dot" style="background:transparent;border:2.5px solid ${seriesContext.seriesColor}"></div>${seriesContext.seriesKey} (border)</div>`;
  }
  // DR-BRAND-001: brand context indicator
  if (state.brandContext) {
    html += `<div class="legend-item"><div class="legend-dot" style="background:transparent;box-shadow:0 0 6px 2px ${state.brandContext.accentColor}"></div>${state.brandContext.brand} (glow)</div>`;
  }

  // F40.22 S40.22.1: Scope visibility section
  html += _buildScopeVisibilitySection();

  legend.innerHTML = html;
  _attachLegendInteraction(legend);
}

function buildSeriesLegend(seriesData) {
  const legend = document.getElementById('legend');
  if (!legend) return;
  legend.style.display = 'block';
  let html = '<div class="legend-header"><h4>Series</h4>' +
    '<button class="legend-reset-btn" data-legend-action="reset" title="Clear filter">Reset</button></div>';
  html += '<div class="legend-section">';
  html += Object.entries(seriesData)
    .filter(([, info]) => info.count > 0)
    .map(([key, info]) =>
      `<div class="legend-item" data-legend-type="${key}" data-legend-group="series"><div class="legend-dot" style="background:${info.color}"></div>${key}<span class="legend-count">${info.count}</span></div>`
    ).join('');
  html += `<div class="legend-item"><div class="legend-dot" style="background:${SERIES_COLORS.placeholder};border:2px dashed #888"></div>Placeholder</div>`;
  html += `<div class="legend-item"><div class="legend-dot" style="background:#eab839"></div>Cross-ontology</div>`;
  html += '</div>';

  // Highlighted series
  if (state.highlightedSeries.size > 0) {
    html += '<div class="legend-section"><div class="legend-section-title">Highlights</div>';
    for (const seriesKey of state.highlightedSeries) {
      const color = SERIES_HIGHLIGHT_COLORS[seriesKey] || '#eab839';
      const shortName = seriesKey.replace('-Series', '');
      html += `<div class="legend-item"><div class="legend-dot" style="background:${color}"></div>${shortName} Highlight</div>`;
    }
    if (state.highlightedSeries.has('VE-Series') && state.highlightedSeries.has('PE-Series')) {
      html += `<div class="legend-item"><div class="legend-dot" style="background:${SERIES_HIGHLIGHT_COLORS.convergence}; border:2px solid ${LINEAGE_COLORS.VE}"></div>Convergence (EFS)</div>`;
    }
    html += '</div>';
  }

  // F40.22 S40.22.1: Scope visibility section
  html += _buildScopeVisibilitySection();

  legend.innerHTML = html;
  _attachLegendInteraction(legend);
}

// ========================================
// SCOPE VISIBILITY LEGEND (F40.22 — S40.22.1)
// ========================================

/**
 * Build the "Scope Visibility" legend section showing in-scope / ghost / hidden counts.
 * Returns HTML string, or empty string if no composition filter is active.
 */
function _buildScopeVisibilitySection() {
  if (!state.compositionFilterActive) return '';
  const fv = getActiveFilteredView();
  if (!fv) return '';

  const visibleCount = fv.visibleNamespaces.size;
  const ghostCount = fv.contextGhostNamespaces.size;
  const hiddenCount = fv.hiddenNamespaces.size;

  let html = '<div class="legend-section"><div class="legend-section-title">Scope Visibility</div>';
  html += `<div class="legend-item" data-legend-type="scope-visible" data-legend-group="scope">` +
    `<div class="legend-dot" style="background:var(--viz-accent)"></div>` +
    `<span>In scope</span><span class="legend-count">${visibleCount}</span></div>`;
  html += `<div class="legend-item" data-legend-type="scope-ghost" data-legend-group="scope">` +
    `<div class="legend-dot legend-dot-ghost" style="background:#2a2a2a;border:1.5px dashed #555"></div>` +
    `<span>Context (ghost)</span><span class="legend-count">${ghostCount}</span></div>`;
  html += `<div class="legend-item" data-legend-type="scope-hidden" data-legend-group="scope">` +
    `<div class="legend-dot" style="background:transparent;border:1.5px dashed var(--viz-text-muted)"></div>` +
    `<span>Hidden</span><span class="legend-count">${hiddenCount}</span></div>`;
  const ghostBtnLabel = state.ghostNodesVisible ? 'Hide Ghosts' : 'Show Ghosts';
  html += `<div style="margin-top:4px;"><button id="ghost-toggle-btn" class="legend-reset-btn" style="width:100%;text-align:center;padding:3px 8px;border:1px solid var(--viz-border-default);border-radius:4px;" onclick="toggleGhostVisibility()">${ghostBtnLabel}</button></div>`;
  html += '</div>';
  return html;
}

// ========================================
// LEGEND INTERACTION (DR-SEMANTIC-004)
// ========================================

let _legendActiveFilter = null;
let _legendHoverTimeout = null;

function _attachLegendInteraction(legendEl) {
  _legendActiveFilter = null;

  legendEl.addEventListener('mouseenter', function(e) {
    const item = e.target.closest('.legend-item[data-legend-type]');
    if (!item || _legendActiveFilter) return;
    clearTimeout(_legendHoverTimeout);
    _legendHoverTimeout = setTimeout(() => {
      _highlightByLegend(item.dataset.legendType, item.dataset.legendGroup);
    }, 100);
  }, true);

  legendEl.addEventListener('mouseleave', function(e) {
    const item = e.target.closest('.legend-item[data-legend-type]');
    if (!item || _legendActiveFilter) return;
    clearTimeout(_legendHoverTimeout);
    _clearLegendHighlight();
  }, true);

  legendEl.addEventListener('click', function(e) {
    const resetBtn = e.target.closest('[data-legend-action="reset"]');
    if (resetBtn) {
      _legendActiveFilter = null;
      _clearLegendFilter(legendEl);
      return;
    }
    const item = e.target.closest('.legend-item[data-legend-type]');
    if (!item) return;
    const type = item.dataset.legendType;
    const group = item.dataset.legendGroup;
    if (_legendActiveFilter === type) {
      _legendActiveFilter = null;
      _clearLegendFilter(legendEl);
    } else {
      _legendActiveFilter = type;
      _filterByLegend(type, group, legendEl);
    }
  });
}

function _highlightByLegend(type, group) {
  if (!state.network) return;
  if (group === 'node') {
    const allNodes = state.network.body.data.nodes.get();
    const ids = allNodes.filter(n => n._data && n._data.entityType === type).map(n => n.id);
    state.network.selectNodes(ids);
  } else if (group === 'edge') {
    const allEdges = state.network.body.data.edges.get();
    const ids = allEdges.filter(e => EDGE_LABEL_CATEGORIES[e.label] === type).map(e => e.id);
    state.network.selectEdges(ids);
  } else if (group === 'series') {
    const allNodes = state.network.body.data.nodes.get();
    const ids = allNodes.filter(n => n._data && n._data.series === type).map(n => n.id);
    state.network.selectNodes(ids);
  } else if (group === 'scope') {
    const allNodes = state.network.body.data.nodes.get();
    const isGhostFilter = type === 'scope-ghost';
    const isVisibleFilter = type === 'scope-visible';
    const ids = allNodes.filter(n => {
      if (!n._data) return false;
      if (isGhostFilter) return n._data.isGhost === true;
      if (isVisibleFilter) return !n._data.isGhost;
      return false;
    }).map(n => n.id);
    state.network.selectNodes(ids);
  }
}

function _clearLegendHighlight() {
  if (state.network) state.network.unselectAll();
}

function _filterByLegend(type, group, legendEl) {
  if (!state.network) return;
  const allNodes = state.network.body.data.nodes.get();
  const updates = allNodes.map(n => {
    let matches;
    if (group === 'node') matches = n._data && n._data.entityType === type;
    else if (group === 'series') matches = n._data && n._data.series === type;
    else if (group === 'scope') {
      if (type === 'scope-ghost') matches = n._data && n._data.isGhost === true;
      else if (type === 'scope-visible') matches = n._data && !n._data.isGhost;
      else matches = false;
    }
    else matches = true;
    return { id: n.id, opacity: matches ? 1.0 : 0.15, font: { color: matches ? '#e0e0e0' : '#333', size: n.font?.size || 13 } };
  });
  state.network.body.data.nodes.update(updates);
  legendEl.querySelectorAll('.legend-item[data-legend-type]').forEach(item => {
    item.classList.toggle('active', item.dataset.legendType === type);
    item.classList.toggle('dimmed', item.dataset.legendType !== type && item.dataset.legendGroup === group);
  });
}

function _clearLegendFilter(legendEl) {
  if (!state.network) return;
  // Epic 9G: If strategic lens is active, re-apply it instead of restoring all to 1.0
  if (state.strategicLensActive && typeof window.applyStrategicLensToGraph === 'function') {
    window.applyStrategicLensToGraph();
  // F8.7: If layer filter is active, re-apply it instead of restoring all to 1.0
  } else if (state.layerFilterActive && typeof window.applyLayerFilterToGraph === 'function') {
    window.applyLayerFilterToGraph();
  } else {
    const allNodes = state.network.body.data.nodes.get();
    const updates = allNodes.map(n => ({
      id: n.id,
      opacity: (n._data && n._data.isGhost) ? CONTEXT_OPACITY : 1.0,
      font: { color: (n._data && n._data.isGhost) ? '#666' : '#e0e0e0', size: n.font?.size || 13 }
    }));
    state.network.body.data.nodes.update(updates);
  }
  legendEl.querySelectorAll('.legend-item').forEach(item => {
    item.classList.remove('active', 'dimmed');
  });
}

/**
 * Render a merged multi-ontology graph with series-based colouring.
 * Bridge nodes (referenced by 3+ ontologies) get special styling.
 */
export function renderMultiGraph(mergedGraph, crossEdges, seriesData) {
  state.lastParsed = mergedGraph;
  refreshArchetypeCache();

  // Hide single-ontology panels
  _hide('compliance-status');
  _rmClass('audit-panel', 'open');

  // Check for bridge nodes
  const bridgeNodes = state.bridgeNodes || new Map();
  const showOnlyBridges = state.bridgeFilterActive || false;

  // Composition filter (Epic 9D): determine which nodes are visible/ghost/hidden
  const filteredView = getActiveFilteredView();

  // Scope-aware filter (Epic 19, F19.4): entity-level visibility from PFI graph
  const scopedView = (state.scopeRulesActive && state.composedPFIGraph)
    ? buildScopedFilteredView(state.composedPFIGraph, { excludedEntityTypes: state.activeScopeRules?.excludedEntityTypes })
    : null;

  const visNodes = mergedGraph.nodes
    .filter(n => {
      if (showOnlyBridges && !bridgeNodes.has(n.id)) return false;
      // Scope-aware filter takes precedence when active
      if (scopedView) {
        const mode = getScopedNodeRenderMode(n, scopedView);
        if (mode === 'hidden') return false;
      } else if (filteredView) {
        const mode = getNodeRenderMode(n, filteredView);
        if (mode === 'hidden') return false;
      }
      return true;
    })
    .map(n => {
      const seriesColor = SERIES_COLORS[n.series] || SERIES_COLORS.placeholder;
      const isBridge = bridgeNodes.has(n.id);
      const bridgeInfo = isBridge ? bridgeNodes.get(n.id) : null;

      // Composition/scope filter: ghost nodes get reduced opacity styling
      const renderMode = scopedView
        ? getScopedNodeRenderMode(n, scopedView)
        : (filteredView ? getNodeRenderMode(n, filteredView) : 'visible');
      const isGhost = renderMode === 'ghost';

      // Bridge nodes: 1.5x size, gold double-border effect, special tooltip
      const baseSize = n.isPlaceholder ? 18 : Math.round(getArchetypeSize(n.entityType) * 0.8);
      let nodeSize = isBridge ? Math.round(baseSize * 1.5) : baseSize;
      if (isGhost) nodeSize = Math.round(baseSize * 0.7);

      // Bridge nodes get gold border; ghost nodes get dashed grey border
      let borderColor = isBridge ? '#eab839' : (n.isPlaceholder ? '#888' : '#222');
      let borderWidth = isBridge ? 4 : 2;
      if (isGhost) { borderColor = '#555'; borderWidth = 1; }

      // Build tooltip
      let tooltip = `${n.sourceName || ''}\n${n.description || n.label}`;
      if (isBridge) {
        tooltip = `🌉 BRIDGE NODE — referenced by ${bridgeInfo.refCount} ontologies:\n` +
          bridgeInfo.referencingOntologies.join(', ') + '\n\n' + tooltip;
      }
      if (isGhost) {
        const ghostReason = state.activeInstanceId
          ? `Outside ${state.activeInstanceId} scope (context dependency)`
          : 'Not in active composition (context dependency)';
        tooltip = `[GHOST] ${ghostReason}\n${tooltip}`;
      }

      // Ghost node background is desaturated
      const bgColor = isGhost
        ? '#2a2a2a'
        : (n.isPlaceholder ? SERIES_COLORS.placeholder : seriesColor);

      return {
        id: n.id,
        label: n.label,
        color: {
          background: bgColor,
          border: borderColor,
          highlight: { background: '#9dfff5', border: isBridge ? '#eab839' : '#017c75' }
        },
        borderWidth: borderWidth,
        borderWidthSelected: isBridge ? 6 : 4,
        shapeProperties: { borderDashes: (n.isPlaceholder || isGhost) ? [6, 3] : false },
        font: { color: isGhost ? '#666' : '#e0e0e0', size: isBridge ? 14 : (isGhost ? 11 : 13), bold: isBridge },
        shape: n.isPlaceholder ? 'diamond' : getArchetypeShape(n.entityType),
        size: nodeSize,
        title: tooltip,
        shadow: isBridge ? { enabled: true, color: '#eab839', size: 10, x: 0, y: 0 } : false,
        _data: { ...n, isBridge, bridgeInfo, isGhost }
      };
    });

  // F40.22 S40.22.3: Build ghost node ID set for edge differentiation
  const ghostNodeIds = new Set(visNodes.filter(n => n._data?.isGhost).map(n => n.id));

  // Internal edges (hidden when cross-edge filter is active; filtered by composition/scope)
  const visEdges = state.crossEdgeFilterActive ? [] : mergedGraph.edges
    .filter(e => scopedView ? isScopedEdgeVisible(e, scopedView) : isEdgeVisible(e, filteredView, mergedGraph))
    .map(e => {
      const style = getEdgeStyle(e.edgeType || 'default', { tier: 'multi', label: e.label });
      const touchesGhost = ghostNodeIds.has(e.from) || ghostNodeIds.has(e.to);
      if (touchesGhost) {
        style.color = { ...style.color, opacity: CONTEXT_OPACITY };
        style.dashes = [4, 4];
        if (style.width > 1) style.width -= 1;
      }
      return { from: e.from, to: e.to, label: e.label, ...style };
    });

  // Cross-ontology edges (with lineage styling)
  for (const ce of crossEdges) {
    const fromNs = ce.sourceNamespace || '';
    const toPrefix = ce.to.split('::')[0];
    const toNs = toPrefix + ':';
    const lineageStyle = getLineageEdgeStyle(fromNs, toNs);
    const base = lineageStyle || getEdgeStyle('crossOntology');

    // S7.6.2: Apply per-pattern colour for DS bridges
    const bridgeStyle = ce.bridgeName ? DS_BRIDGE_STYLES[ce.bridgeName] : null;
    if (bridgeStyle && !lineageStyle) {
      base.color = { color: bridgeStyle.color, highlight: bridgeStyle.highlightColor };
      base.dashes = bridgeStyle.dashes;
    }

    // S7.6.2: Skip edges filtered out by bridge type toggles
    if (state.dsBridgeTypeFilters && ce.patternId) {
      if (state.dsBridgeTypeFilters[ce.patternId] === false) continue;
    }

    const touchesGhost = ghostNodeIds.has(ce.from) || ghostNodeIds.has(ce.to);
    if (touchesGhost) {
      base.color = { ...base.color, opacity: CONTEXT_OPACITY };
      base.dashes = [4, 4];
      if (base.width > 1) base.width -= 1;
    }

    visEdges.push({
      id: `multi-${ce.from}-${ce.to}`,
      from: ce.from,
      to: ce.to,
      label: ce.label,
      ...base,
      smooth: { type: 'continuous', roundness: 0.4 },
      _crossOntologyTarget: toNs,
      _patternId: ce.patternId || null,
      _bridgeName: ce.bridgeName || null
    });
  }

  // 9E.4: Overlay PFI instance data entities with distinct styling
  if (state.activeInstanceId && state.pfiInstanceData.has(state.activeInstanceId)) {
    const instanceResult = state.pfiInstanceData.get(state.activeInstanceId);
    const brandColor = state.brandContext?.accentColor || '#9dfff5';
    _mergeInstanceDataIntoGraph(visNodes, visEdges, instanceResult, brandColor);
  }

  const container = document.getElementById('network');
  const data = { nodes: new vis.DataSet(visNodes), edges: new vis.DataSet(visEdges) };

  const options = {
    physics: {
      enabled: state.physicsEnabled,
      stabilization: { iterations: 300 },
      barnesHut: { gravitationalConstant: -4000, springLength: 180, springConstant: 0.02 }
    },
    interaction: { hover: true, tooltipDelay: 200 },
    nodes: { borderWidth: 2 },
    edges: { smooth: { type: 'continuous', roundness: 0.3 } },
    layout: {}
  };

  state.network = new vis.Network(container, data, options);

  state.network.once('stabilizationIterationsDone', function() {
    state.network.fit({ animation: true });
  });

  state.network.on('click', function(params) {
    if (params.nodes.length > 0) {
      const nodeId = params.nodes[0];
      const node = visNodes.find(n => n.id === nodeId);
      if (node) showNodeDetails(node._data);
    } else {
      closeSidebar();
    }
  });

  state.network.on('doubleClick', function(params) {
    if (params.nodes.length > 0) {
      const nodeId = params.nodes[0];
      const node = visNodes.find(n => n.id === nodeId);
      if (node) {
        showNodeDetails(node._data);
        switchTab('connections');
      }
    }
  });

  // Attach edge click handler for cross-ontology navigation (X.3.7)
  attachEdgeClickHandler(visEdges);

  const totalEdges = mergedGraph.edges.length + crossEdges.length;
  const bridgeCount = state.bridgeNodes?.size || 0;
  const filterText = showOnlyBridges ? ' [bridges only]' : (state.crossEdgeFilterActive ? ' [cross-refs only]' : '');
  const statsEl = document.getElementById('stats');
  const baseStats = `${visNodes.length} nodes | ${totalEdges} edges | ${bridgeCount} bridge nodes | Unified Registry [multi]${filterText}`;
  if (scopedView) {
    const personaText = state.activePersonaScope ? ` / Persona: ${state.activePersonaScope}` : '';
    statsEl.innerHTML = `${baseStats} | <span class="pfi-breadcrumb" style="cursor:pointer;text-decoration:underline;color:#9dfff5;" title="Click to view scope rule log">${scopedView.filterLabel}${personaText}</span>`;
    const breadcrumbEl = statsEl.querySelector('.pfi-breadcrumb');
    if (breadcrumbEl) breadcrumbEl.addEventListener('click', () => showScopeRuleLog());
  } else {
    const scopeSummary = _buildScopeSummaryText(filteredView);
    const compositionText = filteredView && !scopeSummary ? ` | Composition: ${filteredView.filterLabel}` : '';
    statsEl.textContent = `${baseStats}${scopeSummary || compositionText}`;
  }

  buildSeriesLegend(seriesData);

  // F8.7: Re-apply layer filter after render
  if (state.layerFilterActive && typeof window.applyLayerFilterToGraph === 'function') {
    setTimeout(() => window.applyLayerFilterToGraph(), 50);
  }
}

// ========================================
// 9E.4: INSTANCE DATA OVERLAY
// ========================================

/**
 * Overlay PFI instance data entities into the multi-graph.
 * Instance nodes get dashed borders and brand accent colour.
 */
function _mergeInstanceDataIntoGraph(visNodes, visEdges, instanceResult, brandColor) {
  if (!instanceResult?.files) return;
  const existingIds = new Set(visNodes.map(n => n.id));

  for (const file of instanceResult.files) {
    if (file.status !== 'loaded' || !file.parsed) continue;
    const ontRef = file.ontologyRef || '';
    const entities = file.parsed.nodes || file.parsed.entities || [];

    for (const entity of entities) {
      const entityId = entity['@id'] || entity.id;
      if (!entityId) continue;
      const nodeId = `inst::${entityId}`;
      if (existingIds.has(nodeId)) continue;
      existingIds.add(nodeId);

      const label = entity.name || entityId.split(':').pop() || entityId;
      visNodes.push({
        id: nodeId,
        label: `[inst] ${label}`,
        color: {
          background: 'rgba(30,35,50,0.85)',
          border: brandColor,
          highlight: { background: '#2a2d37', border: brandColor },
        },
        borderWidth: 2,
        borderDashes: [4, 4],
        font: { color: brandColor, size: 11, vadjust: -2 },
        shape: 'box',
        size: 18,
        opacity: 0.85,
        title: `Instance: ${label}\nSource: ${ontRef}\nFile: ${file.path || ''}`,
        _data: {
          id: nodeId,
          label: label,
          entityType: 'instance-data',
          description: entity.description || '',
          series: ontRef,
          instanceFile: file.path,
          sourceEntity: entityId,
        },
      });

      // Link instance entity to its template counterpart if it exists in the graph
      const ns = entityId.includes(':') ? entityId.split(':')[0] + ':' : '';
      const localName = entityId.includes(':') ? entityId.split(':').slice(1).join(':') : entityId;
      const templateId = ns ? `${ns}:${localName}` : localName;
      if (existingIds.has(templateId)) {
        visEdges.push({
          id: `inst-link-${nodeId}`,
          from: templateId,
          to: nodeId,
          label: 'instanceOf',
          color: { color: brandColor, opacity: 0.5, highlight: brandColor },
          width: 1,
          dashes: [4, 4],
          arrows: { to: { enabled: true, scaleFactor: 0.5 } },
          font: { color: brandColor, size: 8, strokeWidth: 0 },
          smooth: { type: 'continuous', roundness: 0.3 },
        });
      }
    }
  }
}

// ========================================
// TIER 0: SERIES ROLLUP VIEW (Phase 2)
// ========================================

/**
 * Render 6 series super-nodes with cross-series edges.
 * Entry point for multi-ontology mode.
 */
export function renderTier0(seriesData, crossSeriesEdges) {
  // Hide single-ontology panels
  _hide('compliance-status');
  _rmClass('audit-panel', 'open');

  // Composition filter (Epic 9D): narrow to active series only
  const filteredView = getActiveFilteredView();
  const effectiveSeriesData = filteredView
    ? filterSeriesData(filteredView, seriesData)
    : seriesData;

  const effectiveCrossEdges = filteredView
    ? filterCrossSeriesEdges(filteredView, crossSeriesEdges)
    : crossSeriesEdges;

  const visNodes = [];
  const tier0Nodes = []; // for state.lastParsed

  for (const [key, info] of Object.entries(effectiveSeriesData)) {
    if (info.count === 0 && !info.ontologies?.length) continue;

    // Apply series highlight border to selected series nodes
    let borderColor = '#222';
    let borderWidth = 3;
    let shadow = false;
    if (state.highlightedSeries.has(key)) {
      const color = SERIES_HIGHLIGHT_COLORS[key] || '#eab839';
      borderColor = color;
      borderWidth = 4;
      shadow = { enabled: true, color: color, size: 8, x: 0, y: 0 };
    }

    // Show filtered/total count when composition active
    const countLabel = info.totalCount && info.totalCount !== info.count
      ? `${info.visibleCount}/${info.totalCount} ontologies`
      : `${info.count} ontologies`;

    // 9E.3: Proportional sizing when composition filter active
    const baseSize = 45;
    let nodeSize = baseSize;
    if (filteredView && info.totalCount > 0) {
      const ratio = info.visibleCount / info.totalCount;
      nodeSize = Math.max(25, Math.round(baseSize * (0.5 + 0.5 * ratio)));
    }

    const seriesCode = key.replace(/-Series$/, '');
    const node = {
      id: key,
      label: `${seriesCode}\n${info.name}\n${countLabel}`,
      color: {
        background: info.color,
        border: borderColor,
        highlight: { background: '#9dfff5', border: '#017c75' }
      },
      borderWidth: borderWidth,
      borderWidthSelected: 5,
      font: { color: '#e0e0e0', size: 16, multi: 'md' },
      shape: 'dot',
      size: nodeSize,
      title: `${info.name}\n${info.description || ''}\n${info.count} ontologies`,
      shadow: shadow,
      _data: {
        id: key,
        label: info.name,
        entityType: 'series',
        description: info.description || '',
        series: key,
        ontologyCount: info.count,
        ontologies: info.ontologies
      }
    };
    visNodes.push(node);
    tier0Nodes.push(node._data);
  }

  const visEdges = [];
  const tier0Edges = [];

  // Cross-series edges (with series highlighting when active)
  for (const cse of effectiveCrossEdges) {
    let style;

    // Apply highlighting if either endpoint series is highlighted
    if (state.highlightedSeries.size > 0) {
      const fromHighlighted = state.highlightedSeries.has(cse.from);
      const toHighlighted = state.highlightedSeries.has(cse.to);

      if (fromHighlighted || toHighlighted) {
        const matchedSeries = fromHighlighted ? cse.from : cse.to;
        const color = SERIES_HIGHLIGHT_COLORS[matchedSeries] || '#eab839';
        style = getEdgeStyle('lineageSeriesFull', { tier: 'tier0', dynamicColor: color, dynamicWidth: 3 });
      } else {
        style = getEdgeStyle('lineageDimmed', { tier: 'tier0' });
      }
    } else {
      style = getEdgeStyle('crossSeries', { tier: 'tier0' });
    }

    visEdges.push({
      from: cse.from,
      to: cse.to,
      label: `${cse.count} refs`,
      ...style
    });
    tier0Edges.push({
      from: cse.from, to: cse.to, label: `${cse.count} refs`,
      edgeType: 'crossSeries', isCrossOntology: true
    });
  }

  // Set lastParsed for sidebar compatibility
  state.lastParsed = {
    nodes: tier0Nodes,
    edges: tier0Edges,
    name: 'Unified Registry',
    diagnostics: { format: 'series-rollup' }
  };

  const container = document.getElementById('network');
  const data = { nodes: new vis.DataSet(visNodes), edges: new vis.DataSet(visEdges) };

  const options = {
    physics: {
      enabled: true,
      stabilization: { iterations: 150 },
      barnesHut: { gravitationalConstant: -5000, springLength: 250, springConstant: 0.02 }
    },
    interaction: { hover: true, tooltipDelay: 200 },
    nodes: { borderWidth: 3 },
    edges: { smooth: { type: 'continuous', roundness: 0.3 } },
    layout: {}
  };

  state.network = new vis.Network(container, data, options);

  state.network.once('stabilizationIterationsDone', function() {
    state.network.fit({ animation: true });
  });

  state.network.on('click', function(params) {
    if (params.nodes.length > 0) {
      const nodeId = params.nodes[0];
      const node = visNodes.find(n => n.id === nodeId);
      if (node) showNodeDetails(node._data);
    } else {
      closeSidebar();
    }
  });

  state.network.on('doubleClick', function(params) {
    if (params.nodes.length > 0) {
      const seriesKey = params.nodes[0];
      if (seriesData[seriesKey]) {
        window.drillToSeries(seriesKey);
      }
    }
  });

  const scopeSummary = _buildScopeSummaryText(filteredView);
  const compositionText = filteredView && !scopeSummary ? ` | ${filteredView.filterLabel}` : '';
  const pfiLabel = !scopeSummary && state.activeInstanceId ? ` | PFI: ${state.activeInstanceId}` : '';
  document.getElementById('stats').textContent =
    `${visNodes.length} series | ${effectiveCrossEdges.length} cross-series edges | Unified Registry [rollup]${scopeSummary || compositionText}${pfiLabel}`;

  buildSeriesLegend(effectiveSeriesData);

  // F8.7: Re-apply layer filter after render
  if (state.layerFilterActive && typeof window.applyLayerFilterToGraph === 'function') {
    setTimeout(() => window.applyLayerFilterToGraph(), 50);
  }
}

// ========================================
// TIER 1: SERIES DRILL-DOWN (Phase 2)
// ========================================

/**
 * Render ontology nodes for a single series, with faded context nodes
 * for other series.
 */
export function renderTier1(seriesKey, loadedOntologies, seriesData) {
  // Hide single-ontology panels
  _hide('compliance-status');
  _rmClass('audit-panel', 'open');

  const seriesInfo = seriesData[seriesKey];
  if (!seriesInfo) return;

  // Composition filter (Epic 9D): determine visibility per ontology
  const filteredView = getActiveFilteredView();

  // Sub-series: identify ontologies grouped under sub-series nodes
  const subSeriesMap = state.subSeriesData ? getSubSeriesForSeries(seriesKey, state.subSeriesData) : {};
  const subSeriesOntologyNs = new Set();
  for (const [ns, record] of loadedOntologies) {
    if (record.series === seriesKey && record.subSeries) subSeriesOntologyNs.add(ns);
  }

  const visNodes = [];
  const tier1Nodes = [];

  // Primary nodes: ontologies in this series (skip sub-series members)
  for (const [ns, record] of loadedOntologies) {
    if (record.series !== seriesKey) continue;
    if (subSeriesOntologyNs.has(ns)) continue; // grouped under sub-series node

    // Composition filter: skip hidden ontologies, style ghosts
    const isGhostOnt = filteredView && !filteredView.visibleNamespaces.has(ns) && filteredView.contextGhostNamespaces.has(ns);
    const isHiddenOnt = filteredView && !filteredView.visibleNamespaces.has(ns) && !filteredView.contextGhostNamespaces.has(ns);
    if (isHiddenOnt) continue;

    const shortName = record.name.replace(/\s+Ontology.*$/i, '').replace(/\s*\(.*\)$/, '');

    // Check for convergence point styling
    const convergenceStyle = getConvergenceNodeStyle(ns);
    let borderColor = record.isPlaceholder ? '#888' : '#222';
    let borderWidth = 2;
    let nodeSize = 30;
    let shadow = false;
    let extraTitle = '';

    if (convergenceStyle && !isGhostOnt) {
      borderColor = convergenceStyle.borderColor;
      borderWidth = convergenceStyle.borderWidth;
      nodeSize = Math.round(30 * convergenceStyle.size);
      shadow = convergenceStyle.shadow;
      if (convergenceStyle.title) extraTitle = '\n' + convergenceStyle.title;
    }

    // Ghost ontologies: reduced size, dashed border, dim text
    if (isGhostOnt) {
      borderColor = '#555';
      borderWidth = 1;
      nodeSize = 20;
      extraTitle = '\n(context — not in active composition)';
    }

    const nsPrefix = ns.replace(/:$/, '');
    const node = {
      id: ns,
      label: `${nsPrefix}:\n${shortName}`,
      color: {
        background: isGhostOnt ? '#2a2a2a' : (record.isPlaceholder ? SERIES_COLORS.placeholder : seriesInfo.color),
        border: borderColor,
        highlight: { background: '#9dfff5', border: '#017c75' }
      },
      borderWidth: borderWidth,
      borderWidthSelected: 4,
      shapeProperties: { borderDashes: (record.isPlaceholder || isGhostOnt) ? [6, 3] : false },
      font: { color: isGhostOnt ? '#666' : '#e0e0e0', size: isGhostOnt ? 12 : 14 },
      shape: record.isPlaceholder ? 'diamond' : 'dot',
      size: nodeSize,
      shadow: shadow,
      title: `${record.name}\n${record.isPlaceholder ? 'Placeholder' : record.status || 'active'}\n${record.parsed?.nodes?.length || 0} entities${extraTitle}`,
      _data: {
        id: ns,
        label: shortName,
        entityType: 'ontology',
        description: record.registryEntry?.description || record.name,
        series: seriesKey,
        sourceName: record.name,
        sourceNamespace: ns,
        isPlaceholder: record.isPlaceholder,
        entityCount: record.parsed?.nodes?.length || 0,
        isGhost: isGhostOnt
      }
    };
    visNodes.push(node);
    tier1Nodes.push(node._data);
  }

  // Sub-series grouping nodes (e.g. VSOM-SA, VSOM-SC)
  const visEdgesSubSeries = [];
  for (const [compositeKey, ssInfo] of Object.entries(subSeriesMap)) {
    const subKey = compositeKey.split('::')[1]; // 'VSOM-SA'
    const isPlaceholder = ssInfo.count === 0;
    const countLabel = isPlaceholder ? 'planned' : `${ssInfo.count} ontologies`;

    const ssCode = subKey.includes('-') ? subKey.split('-').pop() : subKey;
    visNodes.push({
      id: compositeKey,
      label: `${ssCode}\n${subKey}\n${countLabel}`,
      color: {
        background: ssInfo.color,
        border: isPlaceholder ? '#888' : ssInfo.color,
        highlight: { background: ssInfo.color, border: '#9dfff5' }
      },
      borderWidth: isPlaceholder ? 2 : 3,
      borderWidthSelected: 4,
      shapeProperties: isPlaceholder ? { borderDashes: [5, 5] } : {},
      font: { color: '#ddd', size: 14, multi: 'md', bold: { color: '#fff' } },
      shape: 'dot',
      size: 35,
      shadow: !isPlaceholder,
      title: `${ssInfo.name} (${countLabel})\n${ssInfo.description || ''}\nDouble-click to drill in`,
      _data: {
        id: compositeKey,
        label: ssInfo.name,
        entityType: 'subSeries',
        description: ssInfo.description || '',
        series: ssInfo.parentSeries,
        subSeriesKey: subKey,
        ontologyCount: ssInfo.count,
        isPlaceholder
      }
    });
    tier1Nodes.push({
      id: compositeKey, label: ssInfo.name, entityType: 'subSeries',
      series: ssInfo.parentSeries, subSeriesKey: subKey, ontologyCount: ssInfo.count
    });

    // Edge from parent ontology to sub-series node
    if (ssInfo.parentOntologyNs) {
      const edgeStyle = getEdgeStyle('subSeriesLink');
      visEdgesSubSeries.push({
        from: ssInfo.parentOntologyNs,
        to: compositeKey,
        ...edgeStyle,
        label: subKey,
        title: `${ssInfo.parentOntologyShort} → ${subKey}`,
        _data: { from: ssInfo.parentOntologyNs, to: compositeKey, label: subKey, edgeType: 'subSeriesLink' }
      });
    }
  }

  // Context nodes: other series as faded super-nodes (only active series when filtered)
  const contextSeriesData = filteredView
    ? filterSeriesData(filteredView, seriesData)
    : seriesData;
  for (const [key, info] of Object.entries(contextSeriesData)) {
    if (key === seriesKey || info.count === 0) continue;

    visNodes.push({
      id: key,
      label: info.name.replace(' Series', '').replace(' Ontologies', ''),
      color: {
        background: info.color,
        border: '#333',
        highlight: { background: info.color, border: '#555' }
      },
      opacity: 0.55,
      borderWidth: 1,
      font: { color: '#666', size: 12 },
      shape: 'dot',
      size: 25,
      title: `${info.name} (${info.count} ontologies)\nClick to switch`,
      _data: {
        id: key,
        label: info.name,
        entityType: 'series',
        description: info.description || '',
        series: key,
        ontologyCount: info.count,
        isContext: true
      }
    });
    tier1Nodes.push({
      id: key, label: info.name, entityType: 'series',
      series: key, isContext: true
    });
  }

  // Edges: cross-ontology edges within and across this series
  const visEdges = [];
  const tier1Edges = [];

  for (const edge of (state.crossEdges || [])) {
    const fromPrefix = edge.from.split('::')[0];
    const toPrefix = edge.to.split('::')[0];

    // Find source and target namespaces
    let fromNs = null, toNs = null;
    for (const [ns] of loadedOntologies) {
      const prefix = ns.replace(/:$/, '');
      if (prefix === fromPrefix) fromNs = ns;
      if (prefix === toPrefix) toNs = ns;
    }

    if (!fromNs || !toNs) continue;
    const fromRecord = loadedOntologies.get(fromNs);
    const toRecord = loadedOntologies.get(toNs);
    if (!fromRecord || !toRecord) continue;

    // Show edges where at least one end is in this series
    const fromInSeries = fromRecord.series === seriesKey;
    const toInSeries = toRecord.series === seriesKey;
    if (!fromInSeries && !toInSeries) continue;

    // Map edge endpoints to ontology-level or sub-series node IDs
    let edgeFrom = fromInSeries ? fromNs : fromRecord.series;
    let edgeTo = toInSeries ? toNs : toRecord.series;
    // Remap sub-series member ontologies to their grouping node
    if (fromInSeries && subSeriesOntologyNs.has(fromNs) && fromRecord.subSeries) {
      edgeFrom = `${seriesKey}::${fromRecord.subSeries}`;
    }
    if (toInSeries && subSeriesOntologyNs.has(toNs) && toRecord.subSeries) {
      edgeTo = `${seriesKey}::${toRecord.subSeries}`;
    }

    // Avoid self-loops and duplicate edges
    if (edgeFrom === edgeTo) continue;
    const edgeKey = `${edgeFrom}->${edgeTo}`;
    if (tier1Edges.some(e => `${e.from}->${e.to}` === edgeKey)) continue;

    // Apply lineage styling if active, otherwise default cross-ontology
    const lineageStyle = getLineageEdgeStyle(fromNs, toNs);
    const base = lineageStyle || getEdgeStyle('crossOntology', { tier: 'tier1' });

    // Resolve target namespace for edge click navigation
    const targetNs = toInSeries ? toNs : null;

    visEdges.push({
      id: `tier1-${edgeFrom}-${edgeTo}`,
      from: edgeFrom,
      to: edgeTo,
      label: edge.label,
      ...base,
      smooth: { type: 'continuous', roundness: 0.4 },
      _crossOntologyTarget: targetNs
    });
    tier1Edges.push({
      from: edgeFrom, to: edgeTo, label: edge.label,
      edgeType: 'crossOntology', isCrossOntology: true
    });
  }

  // Set lastParsed for sidebar compatibility
  // Add sub-series link edges
  visEdges.push(...visEdgesSubSeries);

  state.lastParsed = {
    nodes: tier1Nodes,
    edges: tier1Edges,
    name: `${seriesKey} — Ontologies`,
    diagnostics: { format: 'series-drill' }
  };

  const container = document.getElementById('network');
  const data = { nodes: new vis.DataSet(visNodes), edges: new vis.DataSet(visEdges) };

  const options = {
    physics: {
      enabled: true,
      stabilization: { iterations: 150 },
      barnesHut: { gravitationalConstant: -3000, springLength: 200, springConstant: 0.03 }
    },
    interaction: { hover: true, tooltipDelay: 200 },
    nodes: { borderWidth: 2 },
    edges: { smooth: { type: 'continuous', roundness: 0.3 } },
    layout: {}
  };

  state.network = new vis.Network(container, data, options);

  state.network.once('stabilizationIterationsDone', function() {
    state.network.fit({ animation: true });
  });

  state.network.on('click', function(params) {
    if (params.nodes.length > 0) {
      const nodeId = params.nodes[0];
      const node = visNodes.find(n => n.id === nodeId);
      if (node) showNodeDetails(node._data);
    } else {
      closeSidebar();
    }
  });

  state.network.on('doubleClick', function(params) {
    if (params.nodes.length > 0) {
      const nodeId = params.nodes[0];
      // Check if it's a context series node (switch series)
      if (seriesData[nodeId] && nodeId !== seriesKey) {
        window.drillToSeries(nodeId);
        return;
      }
      // Check if it's a sub-series grouping node (drill into sub-series)
      if (state.subSeriesData && state.subSeriesData[nodeId]) {
        const ssInfo = state.subSeriesData[nodeId];
        if (ssInfo.count > 0) {
          window.drillToSubSeries(seriesKey, nodeId.split('::')[1]);
        }
        return;
      }
      // Otherwise drill into ontology entities
      const record = loadedOntologies.get(nodeId);
      if (record && !record.isPlaceholder) {
        window.drillToOntology(nodeId);
      }
    }
  });

  // Attach edge click handler for cross-ontology navigation (X.3.7)
  attachEdgeClickHandler(visEdges);

  const ontCount = visNodes.filter(n => n._data.entityType === 'ontology').length;
  const scopeSummary = _buildScopeSummaryText(filteredView);
  const compositionText = filteredView && !scopeSummary ? ` | ${filteredView.filterLabel}` : '';
  document.getElementById('stats').textContent =
    `${seriesInfo.name}: ${ontCount} ontologies | ${visEdges.length} cross-ref edges | Unified Registry [series-drill]${scopeSummary || compositionText}`;

  buildSeriesLegend(seriesData);

  // F8.7: Re-apply layer filter after render
  if (state.layerFilterActive && typeof window.applyLayerFilterToGraph === 'function') {
    setTimeout(() => window.applyLayerFilterToGraph(), 50);
  }
}

// ========================================
// SUB-SERIES DRILL-IN VIEW
// ========================================

/**
 * Render the sub-series drill-in view — shows ontologies belonging to a
 * specific sub-series (e.g. VSOM-SA) with faded context nodes for the
 * parent series and parent ontology.
 */
export function renderTier1SubSeries(seriesKey, subSeriesKey, loadedOntologies, seriesData) {
  _hide('compliance-status');
  _rmClass('audit-panel', 'open');

  const compositeKey = `${seriesKey}::${subSeriesKey}`;
  const ssInfo = state.subSeriesData?.[compositeKey];
  if (!ssInfo) return;

  const seriesColor = SERIES_COLORS[seriesKey] || SERIES_COLORS.placeholder;
  const visNodes = [];
  const tier1Nodes = [];

  // Composition filter (Epic 9D): determine visibility per ontology
  const filteredView = getActiveFilteredView();

  // Primary nodes: ontologies in this sub-series
  for (const [ns, record] of loadedOntologies) {
    if (record.series !== seriesKey || record.subSeries !== subSeriesKey) continue;

    // Composition filter: skip hidden ontologies, style ghosts
    const isGhostOnt = filteredView && !filteredView.visibleNamespaces.has(ns) && filteredView.contextGhostNamespaces.has(ns);
    const isHiddenOnt = filteredView && !filteredView.visibleNamespaces.has(ns) && !filteredView.contextGhostNamespaces.has(ns);
    if (isHiddenOnt) continue;

    const shortName = record.name.replace(/\s+Ontology.*$/i, '').replace(/\s*\(.*\)$/, '');
    let borderColor = record.isPlaceholder ? '#888' : '#222';
    let nodeSize = 30;
    let extraTitle = '';

    if (isGhostOnt) {
      borderColor = '#555';
      nodeSize = 20;
      extraTitle = '\n(context — not in active composition)';
    }

    const nsPrefix = ns.replace(/:$/, '');
    const node = {
      id: ns,
      label: `${nsPrefix}:\n${shortName}`,
      color: {
        background: isGhostOnt ? '#2a2a2a' : seriesColor,
        border: borderColor,
        highlight: { background: seriesColor, border: '#9dfff5' }
      },
      borderWidth: isGhostOnt ? 1 : 2,
      borderWidthSelected: 3,
      shapeProperties: (record.isPlaceholder || isGhostOnt) ? { borderDashes: [5, 5] } : {},
      font: { color: isGhostOnt ? '#666' : '#ddd', size: isGhostOnt ? 12 : 14 },
      shape: record.isPlaceholder ? 'diamond' : 'dot',
      size: nodeSize,
      title: `${record.name}\n${record.parsed?.nodes?.length || 0} entities\nDouble-click to explore${extraTitle}`,
      _data: {
        id: ns,
        label: shortName,
        entityType: 'ontology',
        description: record.registryEntry?.description || '',
        series: seriesKey,
        subSeries: subSeriesKey,
        sourceName: record.name,
        sourceNamespace: ns,
        isPlaceholder: record.isPlaceholder,
        entityCount: record.parsed?.nodes?.length || 0,
        isGhost: isGhostOnt
      }
    };
    visNodes.push(node);
    tier1Nodes.push(node._data);
  }

  // Context node: faded parent series super-node
  const seriesInfo = seriesData[seriesKey];
  if (seriesInfo) {
    visNodes.push({
      id: seriesKey,
      label: seriesInfo.name.replace(' Series', '').replace(' Ontologies', ''),
      color: {
        background: seriesColor,
        border: '#333',
        highlight: { background: seriesColor, border: '#555' }
      },
      opacity: 0.55,
      borderWidth: 1,
      font: { color: '#666', size: 12 },
      shape: 'dot',
      size: 25,
      title: `${seriesInfo.name}\nClick to go back to series`,
      _data: {
        id: seriesKey,
        label: seriesInfo.name,
        entityType: 'series',
        series: seriesKey,
        isContext: true
      }
    });
  }

  // Context node: faded parent ontology (e.g. VSOM)
  if (ssInfo.parentOntologyNs) {
    const parentRecord = loadedOntologies.get(ssInfo.parentOntologyNs);
    if (parentRecord) {
      const parentShort = parentRecord.name.replace(/\s+Ontology.*$/i, '').replace(/\s*\(.*\)$/, '');
      visNodes.push({
        id: ssInfo.parentOntologyNs,
        label: parentShort,
        color: {
          background: seriesColor,
          border: '#333',
          highlight: { background: seriesColor, border: '#555' }
        },
        opacity: 0.55,
        borderWidth: 1,
        font: { color: '#666', size: 12 },
        shape: 'dot',
        size: 25,
        title: `${parentRecord.name}\nParent ontology — double-click to explore`,
        _data: {
          id: ssInfo.parentOntologyNs,
          label: parentShort,
          entityType: 'ontology',
          series: seriesKey,
          sourceName: parentRecord.name,
          sourceNamespace: ssInfo.parentOntologyNs,
          isContext: true
        }
      });
    }
  }

  // Edges: cross-ontology edges scoped to sub-series members
  const visEdges = [];
  const tier1Edges = [];
  const subSeriesNs = new Set();
  for (const [ns, record] of loadedOntologies) {
    if (record.series === seriesKey && record.subSeries === subSeriesKey) subSeriesNs.add(ns);
  }

  for (const edge of (state.crossEdges || [])) {
    const fromPrefix = edge.from.split('::')[0];
    const toPrefix = edge.to.split('::')[0];

    let fromNs = null, toNs = null;
    for (const [ns] of loadedOntologies) {
      const prefix = ns.replace(/:$/, '');
      if (prefix === fromPrefix) fromNs = ns;
      if (prefix === toPrefix) toNs = ns;
    }

    if (!fromNs || !toNs) continue;
    const fromInSub = subSeriesNs.has(fromNs);
    const toInSub = subSeriesNs.has(toNs);
    if (!fromInSub && !toInSub) continue;

    // Map endpoints: in-sub-series → ontology node, outside → parent context or skip
    const edgeFrom = fromInSub ? fromNs : (fromNs === ssInfo.parentOntologyNs ? fromNs : null);
    const edgeTo = toInSub ? toNs : (toNs === ssInfo.parentOntologyNs ? toNs : null);
    if (!edgeFrom || !edgeTo || edgeFrom === edgeTo) continue;

    const edgeKey = `${edgeFrom}->${edgeTo}`;
    if (tier1Edges.some(e => `${e.from}->${e.to}` === edgeKey)) continue;

    const base = getEdgeStyle('crossOntology', { tier: 'tier1' });
    visEdges.push({
      id: `ss-${edgeFrom}-${edgeTo}`,
      from: edgeFrom,
      to: edgeTo,
      label: edge.label,
      ...base,
      smooth: { type: 'continuous', roundness: 0.4 }
    });
    tier1Edges.push({ from: edgeFrom, to: edgeTo, label: edge.label, edgeType: 'crossOntology' });
  }

  state.lastParsed = {
    nodes: tier1Nodes,
    edges: tier1Edges,
    name: `${subSeriesKey} — Ontologies`,
    diagnostics: { format: 'sub-series-drill' }
  };

  const container = document.getElementById('network');
  const data = { nodes: new vis.DataSet(visNodes), edges: new vis.DataSet(visEdges) };

  const options = {
    physics: {
      enabled: true,
      stabilization: { iterations: 150 },
      barnesHut: { gravitationalConstant: -3000, springLength: 200, springConstant: 0.03 }
    },
    interaction: { hover: true, tooltipDelay: 200 },
    nodes: { borderWidth: 2 },
    edges: { smooth: { type: 'continuous', roundness: 0.3 } },
    layout: {}
  };

  if (state.network) state.network.destroy();
  state.network = new vis.Network(container, data, options);

  state.network.once('stabilizationIterationsDone', function() {
    state.network.fit({ animation: true });
  });

  state.network.on('click', function(params) {
    if (params.nodes.length > 0) {
      const nodeId = params.nodes[0];
      const node = visNodes.find(n => n.id === nodeId);
      if (node) showNodeDetails(node._data);
    } else {
      closeSidebar();
    }
  });

  state.network.on('doubleClick', function(params) {
    if (params.nodes.length > 0) {
      const nodeId = params.nodes[0];
      // Context series node → go back to series
      if (nodeId === seriesKey) {
        window.drillToSeries(seriesKey);
        return;
      }
      // Ontology node → drill to entity graph
      const record = loadedOntologies.get(nodeId);
      if (record && !record.isPlaceholder) {
        window.drillToOntology(nodeId);
      }
    }
  });

  attachEdgeClickHandler(visEdges);

  const ontCount = visNodes.filter(n => n._data.entityType === 'ontology' && !n._data.isContext).length;
  document.getElementById('stats').textContent =
    `${ssInfo.name}: ${ontCount} ontologies | ${visEdges.length} cross-ref edges | ${seriesInfo?.name || seriesKey} [sub-series]`;

  // F8.7: Re-apply layer filter after render
  if (state.layerFilterActive && typeof window.applyLayerFilterToGraph === 'function') {
    setTimeout(() => window.applyLayerFilterToGraph(), 50);
  }
}

// ========================================
// CONNECTION MAP MODE (Phase 4 — Feature #41)
// ========================================

/**
 * Render a Connection Map showing all ontologies as nodes with
 * cross-ontology edges weighted by reference count.
 * Each node is an ontology (not series, not entity).
 * Edge thickness and labels show cross-reference counts.
 */
export function renderConnectionMap(loadedOntologies, crossEdges, seriesData) {
  // Hide single-ontology panels
  _hide('compliance-status');
  _rmClass('audit-panel', 'open');

  const visNodes = [];
  const connectionMapNodes = [];

  // Build ontology-to-ontology edge counts
  const ontologyEdgeCounts = new Map(); // 'fromNs->toNs' => count

  for (const edge of crossEdges) {
    // Extract source namespace
    const fromNs = edge.sourceNamespace;
    if (!fromNs) continue;

    // Extract target namespace from edge.to (prefix::entity)
    const toPrefix = edge.to.split('::')[0];
    let toNs = null;
    for (const [ns] of loadedOntologies) {
      if (ns.replace(/:$/, '') === toPrefix) {
        toNs = ns;
        break;
      }
    }
    if (!toNs || fromNs === toNs) continue;

    // Normalise edge direction (alphabetical) to merge bidirectional refs
    const key = fromNs < toNs ? `${fromNs}->${toNs}` : `${toNs}->${fromNs}`;
    ontologyEdgeCounts.set(key, (ontologyEdgeCounts.get(key) || 0) + 1);
  }

  // Composition filter (Epic 9D): determine visibility per ontology
  const filteredView = getActiveFilteredView();

  // Create one node per ontology
  for (const [ns, record] of loadedOntologies) {
    // Composition filter: skip hidden ontologies, style ghosts
    const isGhostOnt = filteredView && !filteredView.visibleNamespaces.has(ns) && filteredView.contextGhostNamespaces.has(ns);
    const isHiddenOnt = filteredView && !filteredView.visibleNamespaces.has(ns) && !filteredView.contextGhostNamespaces.has(ns);
    if (isHiddenOnt) continue;

    const seriesColor = SERIES_COLORS[record.series] || SERIES_COLORS.placeholder;
    const shortName = record.name
      .replace(/\s+Ontology.*$/i, '')
      .replace(/\s*\(.*\)$/, '')
      .trim();

    // Check for convergence point styling
    const convergenceStyle = getConvergenceNodeStyle(ns);
    let borderColor = record.isPlaceholder ? '#888' : '#222';
    let borderWidth = 2;
    let nodeSize = 25;
    let shadow = false;
    let extraTitle = '';

    if (convergenceStyle && !isGhostOnt) {
      borderColor = convergenceStyle.borderColor;
      borderWidth = convergenceStyle.borderWidth;
      nodeSize = Math.round(25 * convergenceStyle.size);
      shadow = convergenceStyle.shadow;
      if (convergenceStyle.title) extraTitle = '\n' + convergenceStyle.title;
    }

    if (isGhostOnt) {
      borderColor = '#555';
      borderWidth = 1;
      nodeSize = 18;
      extraTitle = '\n(context — not in active composition)';
    }

    const node = {
      id: ns,
      label: shortName,
      color: {
        background: isGhostOnt ? '#2a2a2a' : (record.isPlaceholder ? SERIES_COLORS.placeholder : seriesColor),
        border: borderColor,
        highlight: { background: '#9dfff5', border: '#017c75' }
      },
      borderWidth: borderWidth,
      borderWidthSelected: 4,
      shapeProperties: { borderDashes: (record.isPlaceholder || isGhostOnt) ? [6, 3] : false },
      font: { color: isGhostOnt ? '#666' : '#e0e0e0', size: isGhostOnt ? 10 : 12 },
      shape: record.isPlaceholder ? 'diamond' : 'dot',
      size: nodeSize,
      shadow: isGhostOnt ? false : shadow,
      title: `${record.name}\n${record.series}\n${record.parsed?.nodes?.length || 0} entities${extraTitle}`,
      _data: {
        id: ns,
        label: shortName,
        entityType: 'ontology',
        description: record.registryEntry?.description || record.name,
        series: record.series,
        sourceName: record.name,
        sourceNamespace: ns,
        isPlaceholder: record.isPlaceholder,
        entityCount: record.parsed?.nodes?.length || 0,
        isGhost: isGhostOnt
      }
    };
    visNodes.push(node);
    connectionMapNodes.push(node._data);
  }

  // Create edges with weighted thickness
  const visEdges = [];
  const connectionMapEdges = [];
  const maxCount = Math.max(...ontologyEdgeCounts.values(), 1);

  for (const [key, count] of ontologyEdgeCounts) {
    const [fromNs, toNs] = key.split('->');

    // Calculate edge width: 1 to 6 based on count
    const normalised = count / maxCount;
    let width = 1 + normalised * 5;

    // Apply lineage styling if active, otherwise default cross-ontology with weighted width
    const lineageStyle = getLineageEdgeStyle(fromNs, toNs);
    let base;
    if (lineageStyle) {
      // Lineage edges: use lineage width or max with weighted width
      const effectiveWidth = lineageStyle.width > 1 ? Math.max(width, lineageStyle.width) : lineageStyle.width;
      base = { ...lineageStyle, width: effectiveWidth };
    } else {
      base = getEdgeStyle('crossOntology', { tier: 'connectionMap', dynamicWidth: width });
    }

    visEdges.push({
      id: `conn-${fromNs}-${toNs}`,
      from: fromNs,
      to: toNs,
      label: `${count}`,
      ...base,
      arrows: { to: { enabled: true, scaleFactor: 0.5 } },
      smooth: { type: 'continuous', roundness: 0.4 },
      title: `${count} cross-reference${count > 1 ? 's' : ''}`,
      _crossOntologyTarget: toNs
    });

    connectionMapEdges.push({
      from: fromNs,
      to: toNs,
      label: `${count} refs`,
      count: count,
      edgeType: 'crossOntology',
      isCrossOntology: true
    });
  }

  // Set lastParsed for sidebar compatibility
  state.lastParsed = {
    nodes: connectionMapNodes,
    edges: connectionMapEdges,
    name: 'Connection Map',
    diagnostics: { format: 'connection-map' }
  };

  const container = document.getElementById('network');
  const data = { nodes: new vis.DataSet(visNodes), edges: new vis.DataSet(visEdges) };

  const options = {
    physics: {
      enabled: true,
      stabilization: { iterations: 250 },
      barnesHut: { gravitationalConstant: -4000, springLength: 220, springConstant: 0.025 }
    },
    interaction: { hover: true, tooltipDelay: 200 },
    nodes: { borderWidth: 2 },
    edges: { smooth: { type: 'continuous', roundness: 0.3 } },
    layout: {}
  };

  state.network = new vis.Network(container, data, options);

  state.network.once('stabilizationIterationsDone', function() {
    state.network.fit({ animation: true });
  });

  state.network.on('click', function(params) {
    if (params.nodes.length > 0) {
      const nodeId = params.nodes[0];
      const node = visNodes.find(n => n.id === nodeId);
      if (node) showNodeDetails(node._data);
    } else {
      closeSidebar();
    }
  });

  state.network.on('doubleClick', function(params) {
    if (params.nodes.length > 0) {
      const namespace = params.nodes[0];
      const record = loadedOntologies.get(namespace);
      if (record && !record.isPlaceholder) {
        window.drillToOntology(namespace);
      }
    }
  });

  // Attach edge click handler for cross-ontology navigation (X.3.7)
  attachEdgeClickHandler(visEdges);

  const ontologyCount = visNodes.length;
  const edgeCount = visEdges.length;
  const totalRefs = Array.from(ontologyEdgeCounts.values()).reduce((a, b) => a + b, 0);

  document.getElementById('stats').textContent =
    `${ontologyCount} ontologies | ${edgeCount} connections (${totalRefs} refs) | Connection Map`;

  buildSeriesLegend(seriesData);

  // F8.7: Re-apply layer filter after render
  if (state.layerFilterActive && typeof window.applyLayerFilterToGraph === 'function') {
    setTimeout(() => window.applyLayerFilterToGraph(), 50);
  }
}

export function togglePhysics() {
  state.physicsEnabled = !state.physicsEnabled;
  const physBtn = document.getElementById('btn-physics');
  if (physBtn) physBtn.classList.toggle('active');
  if (state.network) state.network.setOptions({ physics: { enabled: state.physicsEnabled } });
}

export function changeLayout() {
  const layout = document.getElementById('layout-select').value;
  if (!state.network) return;
  const opts = { layout: {} };
  if (layout === 'hierarchical') {
    opts.layout = { hierarchical: { direction: 'UD', sortMethod: 'hubsize', levelSeparation: 120 } };
    opts.physics = { enabled: false };
  } else if (layout === 'circular') {
    opts.physics = { enabled: true, barnesHut: { gravitationalConstant: -1000, centralGravity: 0.8, springLength: 100 } };
    setTimeout(() => { if (state.network) state.network.setOptions({ physics: { enabled: false } }); }, 2000);
  } else {
    opts.physics = { enabled: state.physicsEnabled };
  }
  state.network.setOptions(opts);
}

export function fitGraph() {
  if (state.network) state.network.fit({ animation: true });
}

export function applyDiffHighlighting(diff) {
  if (!state.network || !state.lastParsed) return;

  const addedIds = new Set(diff.entities.added.map(a => a.id));
  const removedIds = new Set(diff.entities.removed.map(r => r.id));
  const modifiedIds = new Set(diff.entities.modified.map(m => m.id));

  // Update existing node styles
  const nodeUpdates = [];
  state.lastParsed.nodes.forEach(n => {
    if (addedIds.has(n.id)) {
      nodeUpdates.push({ id: n.id, borderWidth: 3, color: { border: '#4CAF50', background: getArchetypeColor(n.entityType) } });
    } else if (modifiedIds.has(n.id)) {
      nodeUpdates.push({ id: n.id, borderWidth: 3, color: { border: '#FF9800', background: getArchetypeColor(n.entityType) } });
    }
  });

  // Add removed nodes as ghost nodes
  if (diff._oldParsed) {
    diff.entities.removed.forEach(r => {
      const oldNode = diff._oldParsed.nodes.find(n => n.id === r.id);
      if (oldNode) {
        nodeUpdates.push({
          id: oldNode.id,
          label: oldNode.label,
          borderWidth: 3,
          opacity: 0.55,
          color: { border: '#f44336', background: '#333' },
          font: { color: '#666' }
        });
      }
    });
  }

  if (nodeUpdates.length > 0 && state.network.body?.data?.nodes) {
    state.network.body.data.nodes.update(nodeUpdates);
  }

  state.diffMode = true;
}

export function exitDiffMode() {
  state.diffMode = false;
  state.lastDiff = null;
  state.diffBaseData = null;
  // Re-render to clear highlighting
  if (state.lastParsed) renderGraph(state.lastParsed);
}

export function resetGraph() {
  if (!state.currentData) {
    _hide('compliance-status');
    return;
  }

  const fileName = document.getElementById('file-name')?.textContent || 'reset';
  const parsed = parseOntology(state.currentData, fileName);

  renderGraph(parsed);

  _rmClass('sidebar', 'open');
  _rmClass('audit-panel', 'open');

  state.physicsEnabled = true;
  const physBtn = document.getElementById('btn-physics');
  if (physBtn) physBtn.classList.add('active');
  const layoutSel = document.getElementById('layout-select');
  if (layoutSel) layoutSel.value = 'physics';
}

