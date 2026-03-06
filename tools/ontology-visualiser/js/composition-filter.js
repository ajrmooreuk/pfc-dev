/**
 * Composition Filter Bridge — Epic 9D, Story 9D.1
 *
 * Takes a CompositionResult from emc-composer.composeOntologySet() and
 * translates it into a FilteredView that the graph renderer can consume.
 * This bridges the gap between composition logic (pure data) and visual
 * rendering (DOM / vis-network).
 *
 * Pure logic module — no DOM access.
 */

import { state } from './state.js';
import { nameToNamespace } from './emc-composer.js';

// ========================================
// FILTERED VIEW CONSTRUCTION
// ========================================

/**
 * Build a FilteredView from a CompositionResult.
 *
 * A FilteredView tells the renderer which namespaces are visible (in the
 * composition), which are hidden, and which are "context ghosts" (not in the
 * composition but are dependencies of visible ontologies).
 *
 * @param {Object} composition - From composeOntologySet().composition
 * @param {Map}    loadedOntologies - state.loadedOntologies
 * @returns {Object} FilteredView
 */
export function buildFilteredView(composition, loadedOntologies) {
  if (!composition || !loadedOntologies) return null;

  const visibleNamespaces = new Set(composition.namespaces || []);
  const activeSeriesSet = new Set(composition.activeSeries || []);
  const hiddenNamespaces = new Set();
  const contextGhostNamespaces = new Set();

  // Determine hidden namespaces (loaded but not in composition)
  for (const [ns] of loadedOntologies) {
    if (!visibleNamespaces.has(ns)) {
      hiddenNamespaces.add(ns);
    }
  }

  // Identify context ghosts: hidden namespaces whose series is active
  // These are ontologies in an active series but not directly required
  for (const ns of hiddenNamespaces) {
    const record = loadedOntologies.get(ns);
    if (record && activeSeriesSet.has(record.series)) {
      contextGhostNamespaces.add(ns);
      hiddenNamespaces.delete(ns);
    }
  }

  // Build the filter label for breadcrumb display
  const instanceName = composition.productCode
    ? `${composition.productCode}`
    : '';
  const categoryName = composition.categoryName || composition.categoryCode || '';
  const filterLabel = [instanceName, categoryName].filter(Boolean).join(':');

  return {
    visibleNamespaces,
    hiddenNamespaces,
    contextGhostNamespaces,
    activeSeriesSet,
    instanceDataFiles: composition.instanceDataFiles || [],
    filterLabel,
    composition,
  };
}

/**
 * Build a FilteredView for series-level filtering (Tier 0).
 * Returns only the series data entries that are in the active series set.
 *
 * @param {Object} filteredView - From buildFilteredView()
 * @param {Object} seriesData   - state.seriesData (key → info)
 * @returns {Object} Filtered seriesData with adjusted counts
 */
export function filterSeriesData(filteredView, seriesData) {
  if (!filteredView || !seriesData) return seriesData;

  const result = {};
  for (const [key, info] of Object.entries(seriesData)) {
    if (filteredView.activeSeriesSet.has(key)) {
      // Count only visible ontologies in this series
      const visibleInSeries = (info.ontologies || []).filter(shortName => {
        const ns = nameToNamespace(shortName);
        return filteredView.visibleNamespaces.has(ns);
      });
      const ghostInSeries = (info.ontologies || []).filter(shortName => {
        const ns = nameToNamespace(shortName);
        return filteredView.contextGhostNamespaces.has(ns);
      });

      result[key] = {
        ...info,
        count: visibleInSeries.length + ghostInSeries.length,
        visibleCount: visibleInSeries.length,
        ghostCount: ghostInSeries.length,
        totalCount: info.count,
      };
    }
    // Series not in activeSeriesSet are excluded from Tier 0
  }
  return result;
}

/**
 * Filter cross-series edges to only those between visible/active series.
 *
 * @param {Object} filteredView     - From buildFilteredView()
 * @param {Array}  crossSeriesEdges - state.crossSeriesEdges
 * @returns {Array} Filtered edges
 */
export function filterCrossSeriesEdges(filteredView, crossSeriesEdges) {
  if (!filteredView || !crossSeriesEdges) return crossSeriesEdges || [];

  return crossSeriesEdges.filter(edge =>
    filteredView.activeSeriesSet.has(edge.from) &&
    filteredView.activeSeriesSet.has(edge.to)
  );
}

/**
 * Check whether a node should be rendered, and how.
 *
 * @param {Object} node         - Merged graph node
 * @param {Object} filteredView - From buildFilteredView()
 * @returns {'visible'|'ghost'|'hidden'} Render mode
 */
export function getNodeRenderMode(node, filteredView) {
  if (!filteredView) return 'visible';

  const ns = node.sourceNamespace || node.id?.split('::')[0] + ':';
  if (filteredView.visibleNamespaces.has(ns)) return 'visible';
  if (filteredView.contextGhostNamespaces.has(ns)) {
    // F40.22 S40.22.6: When ghost toggle is off, treat ghosts as hidden
    return state.ghostNodesVisible ? 'ghost' : 'hidden';
  }
  return 'hidden';
}

/**
 * Check whether an edge should be rendered.
 *
 * @param {Object} edge         - Merged graph edge
 * @param {Object} filteredView - From buildFilteredView()
 * @param {Object} mergedGraph  - For node lookup
 * @returns {boolean}
 */
export function isEdgeVisible(edge, filteredView, mergedGraph) {
  if (!filteredView) return true;

  // Find the namespaces of source and target nodes
  const fromNode = mergedGraph.nodes.find(n => n.id === edge.from);
  const toNode = mergedGraph.nodes.find(n => n.id === edge.to);
  if (!fromNode || !toNode) return false;

  const fromMode = getNodeRenderMode(fromNode, filteredView);
  const toMode = getNodeRenderMode(toNode, filteredView);

  // Show edge if at least one endpoint is visible (not hidden)
  return fromMode !== 'hidden' && toMode !== 'hidden';
}

// ========================================
// SCOPED FILTERED VIEW (Epic 19, F19.4)
// ========================================

/**
 * Build a ScopedFilteredView from a composed PFI graph.
 * Entity-level visibility: entities in composed graph → visible,
 * entities in loaded ontologies but not composed → ghost,
 * entities excluded by scope rules → hidden.
 *
 * @param {Object} composedGraph - From composeInstanceGraph() { nodes, edges, metadata }
 * @param {Object} [scopeResult] - From evaluateScopeRules() { excludedEntityTypes }
 * @returns {Object} ScopedFilteredView
 */
export function buildScopedFilteredView(composedGraph, scopeResult) {
  const visibleEntityIds = new Set();
  const ghostEntityIds = new Set();
  const hiddenEntityIds = new Set();

  // Build set of visible entity IDs from composed graph nodes
  const composedNodeIds = new Set();
  for (const node of (composedGraph?.nodes || [])) {
    const nodeId = node.id || node['@id'];
    if (nodeId) {
      composedNodeIds.add(nodeId);
      visibleEntityIds.add(nodeId);
    }
  }

  // Build set of excluded entity types from scope rules
  const excludedTypes = scopeResult?.excludedEntityTypes || new Set();

  // Classify loaded ontology entities as ghost or hidden
  if (state.loadedOntologies) {
    for (const [, ontData] of state.loadedOntologies) {
      const entities = ontData?.parsed?.entities || ontData?.entities || [];
      const entityList = Array.isArray(entities) ? entities : Object.values(entities);
      for (const entity of entityList) {
        const entityId = entity.id || entity['@id'] || entity.name;
        if (!entityId || composedNodeIds.has(entityId)) continue;
        const entityType = entity['@type'] || entity.entityType || '';
        if (excludedTypes.has?.(entityType)) {
          hiddenEntityIds.add(entityId);
        } else {
          ghostEntityIds.add(entityId);
        }
      }
    }
  }

  // Count unique ontology sources
  const ontologySources = new Set();
  for (const node of (composedGraph?.nodes || [])) {
    if (node.sourceNamespace || node.ontologyRef) {
      ontologySources.add(node.sourceNamespace || node.ontologyRef);
    }
  }

  const instanceId = composedGraph?.metadata?.instanceId || state.activeInstanceId || '';
  const filterLabel = `PFI: ${instanceId} (${visibleEntityIds.size} entities, ${ontologySources.size} ontologies)`;

  return {
    visibleEntityIds,
    ghostEntityIds,
    hiddenEntityIds,
    filterLabel,
    isScopedView: true,
    ontologySourceCount: ontologySources.size,
  };
}

/**
 * Determine render mode for a node using scoped entity-level visibility.
 *
 * @param {Object} node - Graph node with id
 * @param {Object} scopedView - From buildScopedFilteredView()
 * @returns {'visible'|'ghost'|'hidden'}
 */
export function getScopedNodeRenderMode(node, scopedView) {
  if (!scopedView || !scopedView.isScopedView) return 'visible';
  const nodeId = node.id || node['@id'];
  if (scopedView.visibleEntityIds.has(nodeId)) return 'visible';
  if (scopedView.ghostEntityIds.has(nodeId)) return 'ghost';
  return 'hidden';
}

/**
 * Check whether an edge should be rendered in scoped view.
 *
 * @param {Object} edge - Graph edge { from, to }
 * @param {Object} scopedView - From buildScopedFilteredView()
 * @returns {boolean}
 */
export function isScopedEdgeVisible(edge, scopedView) {
  if (!scopedView || !scopedView.isScopedView) return true;
  const fromHidden = scopedView.hiddenEntityIds.has(edge.from);
  const toHidden = scopedView.hiddenEntityIds.has(edge.to);
  return !fromHidden && !toHidden;
}

// ========================================
// APPLY / CLEAR COMPOSITION FILTER
// ========================================

/**
 * Apply a composition as the active filter.
 * Sets state fields and returns the FilteredView for immediate use.
 *
 * @param {Object} composition - From composeOntologySet().composition
 * @returns {Object|null} FilteredView or null if no loaded ontologies
 */
export function applyCompositionFilter(composition) {
  if (!composition || state.loadedOntologies.size === 0) return null;

  const filteredView = buildFilteredView(composition, state.loadedOntologies);

  state.activeComposition = composition;
  state.compositionFilterActive = true;
  state.lastComposition = composition;

  return filteredView;
}

/**
 * Clear the active composition filter, restoring full registry view.
 */
export function clearCompositionFilter() {
  state.activeComposition = null;
  state.compositionFilterActive = false;
}

/**
 * Get the current FilteredView from the active composition (if any).
 *
 * @returns {Object|null} FilteredView or null if no filter active
 */
export function getActiveFilteredView() {
  if (!state.compositionFilterActive || !state.activeComposition) return null;
  return buildFilteredView(state.activeComposition, state.loadedOntologies);
}
