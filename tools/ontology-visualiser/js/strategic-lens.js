/**
 * Strategic Lens — Epic 9G: VESM / BSC / Role-Authority Filtering
 *
 * Pure logic module (no DOM). Provides VESM tier classification,
 * BSC perspective mapping, Role-Authority filtering, and compound
 * composability with existing layer/composition filters.
 *
 * Pattern: follows layer-filter.js — returns {visible, dimmed} Sets
 * consumed by applyStrategicLensToGraph() in app.js.
 */

import { VESM_TIERS, BSC_PERSPECTIVES, RACI_BADGES } from './state.js';

// ========================================
// VESM TIER CLASSIFICATION (S9G.1.1)
// ========================================

/**
 * Build a reverse lookup: entityType string → tier key.
 * Cached on first call for performance.
 * @returns {Map<string, string>} entityType → tierKey
 */
let _entityTypeTierCache = null;
function _getEntityTypeTierMap() {
  if (_entityTypeTierCache) return _entityTypeTierCache;
  _entityTypeTierCache = new Map();
  for (const [tierKey, tier] of Object.entries(VESM_TIERS)) {
    for (const et of tier.entityTypes) {
      _entityTypeTierCache.set(et, tierKey);
    }
  }
  return _entityTypeTierCache;
}

/**
 * Build a reverse lookup: ontology short name → tier key (first match).
 * Used as a fallback when entity type doesn't directly match.
 * @returns {Map<string, string>} ontologyShortName → tierKey
 */
let _ontologyTierCache = null;
function _getOntologyTierMap() {
  if (_ontologyTierCache) return _ontologyTierCache;
  _ontologyTierCache = new Map();
  for (const [tierKey, tier] of Object.entries(VESM_TIERS)) {
    for (const ont of tier.ontologies) {
      // Only set if not already set (first tier wins for shared ontologies)
      if (!_ontologyTierCache.has(ont)) {
        _ontologyTierCache.set(ont, tierKey);
      }
    }
  }
  return _ontologyTierCache;
}

/**
 * Classify a single node into a VESM tier.
 *
 * Resolution order:
 * 1. Direct entity type match against VESM_TIERS[tier].entityTypes
 * 2. Namespace prefix match against VESM_TIERS[tier].ontologies
 *
 * @param {Object} node - Parsed node with label, entityType, namespace, @id
 * @returns {string|null} Tier key ('vision'|'strategy'|'execution'|'metrics') or null
 */
export function classifyNodeVESMTier(node) {
  if (!node) return null;

  const etMap = _getEntityTypeTierMap();

  // 1. Try entity type (label or entityType field)
  const label = node.label || '';
  // Strip namespace prefix if present (e.g. 'vsom:VisionComponent' → 'VisionComponent')
  const shortLabel = label.includes(':') ? label.split(':').pop() : label;
  if (etMap.has(shortLabel)) return etMap.get(shortLabel);

  // Also try the entityType field directly
  if (node.entityType) {
    const shortET = node.entityType.includes(':') ? node.entityType.split(':').pop() : node.entityType;
    if (etMap.has(shortET)) return etMap.get(shortET);
  }

  // 2. Namespace/ontology prefix fallback
  const ontMap = _getOntologyTierMap();
  const ns = node.namespace || '';
  // Extract short name from namespace (e.g. 'vsom' → check against 'VSOM')
  const nsUpper = ns.toUpperCase();
  for (const [ontKey, tierKey] of ontMap) {
    if (nsUpper === ontKey || nsUpper.startsWith(ontKey + '-')) return tierKey;
  }

  // Also try deriving from @id prefix
  const id = node['@id'] || node.id || '';
  const idPrefix = id.includes(':') ? id.split(':')[0].toUpperCase() : '';
  if (idPrefix && ontMap.has(idPrefix)) return ontMap.get(idPrefix);

  return null;
}

/**
 * Build a tier map for all nodes.
 * @param {Array<Object>} nodes - Parsed node array
 * @returns {Map<string, string>} nodeId → tierKey
 */
export function buildVESMTierMap(nodes) {
  const map = new Map();
  if (!nodes) return map;
  for (const n of nodes) {
    const tier = classifyNodeVESMTier(n);
    if (tier) map.set(n.id, tier);
  }
  return map;
}

/**
 * Compute which nodes are visible vs dimmed based on active VESM tiers.
 *
 * @param {Array<Object>} nodes - Parsed node array
 * @param {Set<string>} activeTiers - Set of active tier keys (e.g. {'vision', 'strategy'})
 * @param {string} scopeLevel - Scope level filter (currently 'all' — reserved for future)
 * @returns {{ visible: Set<string>, dimmed: Set<string> }}
 */
export function computeVESMFilter(nodes, activeTiers, scopeLevel = 'all') {
  const visible = new Set();
  const dimmed = new Set();
  if (!nodes) return { visible, dimmed };

  // No tiers selected → all dimmed
  if (!activeTiers || activeTiers.size === 0) {
    for (const n of nodes) dimmed.add(n.id);
    return { visible, dimmed };
  }

  const tierMap = buildVESMTierMap(nodes);

  for (const n of nodes) {
    const tier = tierMap.get(n.id);
    if (tier && activeTiers.has(tier)) {
      visible.add(n.id);
    } else {
      dimmed.add(n.id);
    }
  }

  return { visible, dimmed };
}

/**
 * Count nodes per VESM tier.
 * @param {Array<Object>} nodes - Parsed node array
 * @returns {Object<string, number>} { tierKey: count }
 */
export function computeVESMTierCounts(nodes) {
  const counts = {};
  for (const key of Object.keys(VESM_TIERS)) counts[key] = 0;
  counts._unclassified = 0;
  if (!nodes) return counts;
  for (const n of nodes) {
    const tier = classifyNodeVESMTier(n);
    if (tier) counts[tier]++;
    else counts._unclassified++;
  }
  return counts;
}

// ========================================
// BSC PERSPECTIVE CLASSIFICATION (S9G.1.2)
// ========================================

/**
 * Classify a node into a BSC perspective.
 *
 * Resolution order:
 * 1. Direct perspectiveType property on the node
 * 2. bscPerspective property (used by ExecutiveRole entities in RRR-ONT)
 *
 * @param {Object} node - Parsed node with properties
 * @returns {string|null} Perspective key or null
 */
export function classifyNodeBSCPerspective(node) {
  if (!node) return null;

  // Check direct perspectiveType property
  const props = node.properties || node;
  const pt = props.perspectiveType || props['bsc:perspectiveType'];
  if (pt) return _normalizePerspectiveKey(pt);

  // Check bscPerspective (RRR-ONT ExecutiveRole)
  const bscP = props.bscPerspective || props['pf:bscPerspective'];
  if (bscP) return _normalizePerspectiveKey(bscP);

  return null;
}

/**
 * Normalise a BSC perspective value to a key.
 * Maps 'Financial' → 'financial', 'Internal Process' → 'internal-process', etc.
 * @param {string} value
 * @returns {string|null}
 */
function _normalizePerspectiveKey(value) {
  if (!value) return null;
  const lower = value.toLowerCase().trim();
  if (BSC_PERSPECTIVES[lower]) return lower;
  // Handle 'Internal Process' → 'internal-process'
  const dashed = lower.replace(/\s+/g, '-');
  if (BSC_PERSPECTIVES[dashed]) return dashed;
  // Handle 'Learning & Growth' → 'learning-growth'
  const cleaned = lower.replace(/\s*&\s*/g, '-').replace(/\s+/g, '-');
  if (BSC_PERSPECTIVES[cleaned]) return cleaned;
  return null;
}

/**
 * Build a perspective map for all nodes, optionally using edge traversal.
 *
 * Without edges: resolves perspectives from direct node properties only.
 * With edges: also propagates perspectives via BSC relationship edges:
 *   - hasPerspectiveObjective: BSCPerspective → BSCObjective
 *   - measuredByKPI / hasMeasure: BSCObjective → KPI/BSCMeasure
 *   - alignedToObjective / supportsObjective: generic linkage
 *   - perspectiveOwnedBy: BSCPerspective → ExecutiveRole (ownership)
 *
 * @param {Array<Object>} nodes - Parsed node array
 * @param {Array<Object>} [edges] - Optional edge array for relationship traversal
 * @returns {Map<string, string>} nodeId → perspectiveKey
 */
export function buildBSCPerspectiveMap(nodes, edges) {
  const map = new Map();
  if (!nodes) return map;

  // Phase 1: direct property classification
  for (const n of nodes) {
    const perspective = classifyNodeBSCPerspective(n);
    if (perspective) map.set(n.id, perspective);
  }

  // Phase 2: edge-based propagation (if edges provided)
  if (!edges || edges.length === 0) return map;

  const propagationLabels = new Set([
    'hasPerspectiveObjective', 'bsc:hasPerspectiveObjective',
    'measuredByKPI', 'bsc:measuredByKPI',
    'hasMeasure', 'bsc:hasMeasure',
    'alignedToObjective', 'bsc:alignedToObjective',
    'supportsObjective', 'bsc:supportsObjective',
    'perspectiveOwnedBy', 'bsc:perspectiveOwnedBy',
  ]);

  // Build adjacency for forward propagation (from perspective-node → connected node)
  let changed = true;
  let passes = 0;
  const MAX_PASSES = 3; // limit propagation depth

  while (changed && passes < MAX_PASSES) {
    changed = false;
    passes++;
    for (const e of edges) {
      const label = e.label || '';
      const shortLabel = label.includes(':') ? label.split(':').pop() : label;
      if (!propagationLabels.has(label) && !propagationLabels.has(shortLabel)) continue;

      // Propagate from source → target
      if (map.has(e.from) && !map.has(e.to)) {
        map.set(e.to, map.get(e.from));
        changed = true;
      }
      // Reverse propagation for ownership edges (target → source)
      if (map.has(e.to) && !map.has(e.from) &&
          (shortLabel === 'perspectiveOwnedBy' || shortLabel === 'alignedToObjective')) {
        map.set(e.from, map.get(e.to));
        changed = true;
      }
    }
  }

  return map;
}

/**
 * Compute BSC perspective filter.
 * @param {Array<Object>} nodes - Parsed node array
 * @param {Set<string>} activePerspectives - Set of active perspective keys
 * @param {Map<string, string>} perspectiveMap - From buildBSCPerspectiveMap()
 * @returns {{ visible: Set<string>, dimmed: Set<string> }}
 */
export function computeBSCFilter(nodes, activePerspectives, perspectiveMap) {
  const visible = new Set();
  const dimmed = new Set();
  if (!nodes) return { visible, dimmed };

  if (!activePerspectives || activePerspectives.size === 0) {
    for (const n of nodes) dimmed.add(n.id);
    return { visible, dimmed };
  }

  for (const n of nodes) {
    const perspective = perspectiveMap ? perspectiveMap.get(n.id) : null;
    if (perspective && activePerspectives.has(perspective)) {
      visible.add(n.id);
    } else {
      dimmed.add(n.id);
    }
  }

  return { visible, dimmed };
}

/**
 * Get the BSC border colour for a perspective key.
 * @param {string} perspectiveKey
 * @returns {string|null} Hex colour string or null
 */
export function getBSCBorderColor(perspectiveKey) {
  if (!perspectiveKey) return null;
  const p = BSC_PERSPECTIVES[perspectiveKey];
  return p ? p.color : null;
}

/**
 * Count nodes per BSC perspective.
 * @param {Array<Object>} nodes - Parsed node array
 * @param {Map<string, string>} perspectiveMap - From buildBSCPerspectiveMap()
 * @returns {Object<string, number>} { perspectiveKey: count, _unclassified: count }
 */
export function computeBSCPerspectiveCounts(nodes, perspectiveMap) {
  const counts = {};
  for (const key of Object.keys(BSC_PERSPECTIVES)) counts[key] = 0;
  counts._unclassified = 0;
  if (!nodes) return counts;
  for (const n of nodes) {
    const p = perspectiveMap ? perspectiveMap.get(n.id) : null;
    if (p && counts[p] !== undefined) counts[p]++;
    else counts._unclassified++;
  }
  return counts;
}

/**
 * Get BSC perspective styles for all visible nodes (border colours).
 * Returns a map of nodeId → { borderColor, borderWidth } for nodes that have
 * a BSC perspective classification.
 *
 * @param {Set<string>} visibleNodes - Set of visible node IDs
 * @param {Map<string, string>} perspectiveMap - From buildBSCPerspectiveMap()
 * @returns {Map<string, {borderColor: string, borderWidth: number}>}
 */
export function getBSCBorderStyles(visibleNodes, perspectiveMap) {
  const styles = new Map();
  if (!visibleNodes || !perspectiveMap) return styles;
  for (const nodeId of visibleNodes) {
    const perspKey = perspectiveMap.get(nodeId);
    if (perspKey) {
      const color = getBSCBorderColor(perspKey);
      if (color) {
        styles.set(nodeId, { borderColor: color, borderWidth: 3 });
      }
    }
  }
  return styles;
}

// ========================================
// ROLE-AUTHORITY CLASSIFICATION (S9G.1.3)
// ========================================

/**
 * Build a map from role entity IDs to their owned/governed entities.
 *
 * Scans nodes for ExecutiveRole/FunctionalRole entities, then traces
 * edges to build the ownership set per role.
 *
 * @param {Array<Object>} nodes - Parsed node array
 * @param {Array<Object>} edges - Array of {from, to, label} edge objects
 * @returns {Map<string, Object>} roleId → { role, ownedEntities: Set<string>, raciAssignments: Map<string, string> }
 */
export function buildRoleEntityMap(nodes, edges) {
  const roleMap = new Map();
  if (!nodes) return roleMap;

  // Identify role nodes
  const roleEntityTypes = new Set(['ExecutiveRole', 'FunctionalRole', 'RoleAssignment']);
  for (const n of nodes) {
    const shortLabel = (n.label || '').includes(':') ? (n.label || '').split(':').pop() : (n.label || '');
    const shortET = (n.entityType || '').includes(':') ? (n.entityType || '').split(':').pop() : (n.entityType || '');
    if (roleEntityTypes.has(shortLabel) || roleEntityTypes.has(shortET)) {
      roleMap.set(n.id, {
        role: n,
        ownedEntities: new Set(),
        raciAssignments: new Map(), // entityId → 'accountable'|'responsible'|'consulted'|'informed'
      });
    }
  }

  if (!edges || roleMap.size === 0) return roleMap;

  // Authority/ownership edge labels (from BSC-ONT and RRR-ONT relationships)
  const ownershipLabels = new Set([
    'perspectiveOwnedBy', 'objectiveOwnedBy', 'governedBy',
    'managedBy', 'ownedBy', 'assignedTo', 'delegatedTo',
  ]);
  const raciLabels = {
    'raciAccountable': 'accountable',
    'raciResponsible': 'responsible',
    'raciConsulted': 'consulted',
    'raciInformed': 'informed',
  };

  for (const e of edges) {
    // Forward direction: entity → role (ownership edges point TO role)
    if (roleMap.has(e.to) && ownershipLabels.has(e.label)) {
      roleMap.get(e.to).ownedEntities.add(e.from);
    }
    // Reverse direction: role → entity (role acts on entity)
    if (roleMap.has(e.from) && ownershipLabels.has(e.label)) {
      roleMap.get(e.from).ownedEntities.add(e.to);
    }
    // RACI assignments
    if (e.label && raciLabels[e.label]) {
      if (roleMap.has(e.from)) {
        roleMap.get(e.from).raciAssignments.set(e.to, raciLabels[e.label]);
      }
      if (roleMap.has(e.to)) {
        roleMap.get(e.to).raciAssignments.set(e.from, raciLabels[e.label]);
      }
    }
  }

  return roleMap;
}

/**
 * Compute role filter — show only entities owned/governed by the selected role.
 *
 * @param {Array<Object>} nodes - Parsed node array
 * @param {string|null} activeRoleRef - Selected role @id, or null for no filter
 * @param {string|null} raciMode - RACI filter: null (show all), or specific RACI type
 * @param {Map} roleEntityMap - From buildRoleEntityMap()
 * @returns {{ visible: Set<string>, dimmed: Set<string> }}
 */
export function computeRoleFilter(nodes, activeRoleRef, raciMode, roleEntityMap) {
  const visible = new Set();
  const dimmed = new Set();
  if (!nodes) return { visible, dimmed };

  // No role selected → no filtering (all visible)
  if (!activeRoleRef || !roleEntityMap || !roleEntityMap.has(activeRoleRef)) {
    for (const n of nodes) visible.add(n.id);
    return { visible, dimmed };
  }

  const roleEntry = roleEntityMap.get(activeRoleRef);
  const ownedSet = roleEntry.ownedEntities;
  const raciMap = roleEntry.raciAssignments;

  for (const n of nodes) {
    // The role node itself is always visible
    if (n.id === activeRoleRef) {
      visible.add(n.id);
      continue;
    }

    let isOwned = ownedSet.has(n.id);

    // If RACI mode filter is active, further restrict to matching RACI type
    if (raciMode && isOwned) {
      const raciType = raciMap.get(n.id);
      isOwned = raciType === raciMode;
    }

    if (isOwned) {
      visible.add(n.id);
    } else {
      dimmed.add(n.id);
    }
  }

  return { visible, dimmed };
}

/**
 * Get RACI badges for a node (which roles have RACI assignments to this node).
 *
 * @param {string} nodeId
 * @param {Map} roleEntityMap - From buildRoleEntityMap()
 * @returns {Array<{type: string, roleId: string, roleLabel: string}>}
 */
export function getRACIBadgesForNode(nodeId, roleEntityMap) {
  const badges = [];
  if (!nodeId || !roleEntityMap) return badges;

  for (const [roleId, entry] of roleEntityMap) {
    const raciType = entry.raciAssignments.get(nodeId);
    if (raciType) {
      const roleLabel = entry.role?.label || entry.role?.name || roleId;
      const shortRole = roleLabel.includes(':') ? roleLabel.split(':').pop() : roleLabel;
      badges.push({ type: raciType, roleId, roleLabel: shortRole });
    }
  }
  return badges;
}

/**
 * Extract all role entities from nodes for dropdown population.
 * @param {Array<Object>} nodes - Parsed node array
 * @returns {Array<{id: string, label: string, entityType: string}>}
 */
export function extractRoles(nodes) {
  if (!nodes) return [];
  const roleEntityTypes = new Set(['ExecutiveRole', 'FunctionalRole']);
  const roles = [];
  for (const n of nodes) {
    const shortLabel = (n.label || '').includes(':') ? (n.label || '').split(':').pop() : (n.label || '');
    const shortET = (n.entityType || '').includes(':') ? (n.entityType || '').split(':').pop() : (n.entityType || '');
    if (roleEntityTypes.has(shortLabel) || roleEntityTypes.has(shortET)) {
      roles.push({ id: n.id, label: n.label || n.name || n.id, entityType: shortET || shortLabel });
    }
  }
  return roles.sort((a, b) => a.label.localeCompare(b.label));
}

/**
 * Build authority chain for a role — traces 'reportsTo' / 'delegatedFrom' edges upward.
 *
 * @param {string} roleId - Starting role ID
 * @param {Array<Object>} edges - Edge array with {from, to, label}
 * @param {Map} roleEntityMap - From buildRoleEntityMap()
 * @returns {Array<{id: string, label: string}>} Chain from role upward (root last)
 */
export function buildAuthorityChain(roleId, edges, roleEntityMap) {
  const chain = [];
  if (!roleId || !edges || !roleEntityMap) return chain;

  const authorityLabels = new Set(['reportsTo', 'delegatedFrom', 'escalatesTo', 'rrr:reportsTo']);
  const visited = new Set();
  let current = roleId;

  while (current && !visited.has(current)) {
    visited.add(current);
    const entry = roleEntityMap.get(current);
    if (entry) {
      const lbl = entry.role?.label || entry.role?.name || current;
      const shortLbl = lbl.includes(':') ? lbl.split(':').pop() : lbl;
      chain.push({ id: current, label: shortLbl });
    }

    // Find the next authority node (current → reportsTo → superior)
    let next = null;
    for (const e of edges) {
      if (e.from === current && authorityLabels.has(e.label)) {
        next = e.to;
        break;
      }
      // Reverse: superior delegatedFrom → current
      if (e.to === current && e.label === 'delegatedFrom') {
        next = e.from;
        break;
      }
    }
    current = next;
  }

  return chain;
}

/**
 * Format RACI badge text for node label appending.
 * Returns a string like "[A:CEO R:CFO]" for display in node labels.
 *
 * @param {Array<{type: string, roleId: string, roleLabel: string}>} badges - From getRACIBadgesForNode()
 * @returns {string} Formatted badge string, or '' if no badges
 */
export function formatRACIBadgeLabel(badges) {
  if (!badges || badges.length === 0) return '';
  const parts = badges.map(b => {
    const code = RACI_BADGES[b.type]?.label || b.type[0].toUpperCase();
    return `${code}:${b.roleLabel}`;
  });
  return `[${parts.join(' ')}]`;
}

// ========================================
// COMPOUND COMPOSABILITY (9G.5)
// ========================================

/**
 * Compute the combined strategic lens filter from all active sub-lenses.
 *
 * Uses AND logic: a node must pass ALL active sub-lenses to be visible.
 * If no sub-lens is active, all nodes are visible.
 *
 * @param {Array<Object>} nodes - Parsed node array
 * @param {Object} lensState - { vesmTiersActive, vesmScopeLevel, bscPerspectivesActive, roleFilterActive, activeRoleRef, raciFilterMode }
 * @param {Object} [context] - Optional: { edges, roleEntityMap, perspectiveMap }
 * @returns {{ visible: Set<string>, dimmed: Set<string> }}
 */
export function computeStrategicLensFilter(nodes, lensState, context = {}) {
  if (!nodes || nodes.length === 0) return { visible: new Set(), dimmed: new Set() };

  const subResults = [];

  // VESM tier filter
  if (lensState.vesmTiersActive && lensState.vesmTiersActive.size > 0) {
    subResults.push(computeVESMFilter(nodes, lensState.vesmTiersActive, lensState.vesmScopeLevel));
  }

  // BSC perspective filter
  if (lensState.bscPerspectivesActive && lensState.bscPerspectivesActive.size > 0) {
    const perspMap = context.perspectiveMap || buildBSCPerspectiveMap(nodes, context.edges);
    subResults.push(computeBSCFilter(nodes, lensState.bscPerspectivesActive, perspMap));
  }

  // Role-Authority filter
  if (lensState.roleFilterActive && lensState.activeRoleRef) {
    const roleMap = context.roleEntityMap || buildRoleEntityMap(nodes, context.edges || []);
    subResults.push(computeRoleFilter(nodes, lensState.activeRoleRef, lensState.raciFilterMode, roleMap));
  }

  // No sub-lens active → all visible
  if (subResults.length === 0) {
    const visible = new Set();
    for (const n of nodes) visible.add(n.id);
    return { visible, dimmed: new Set() };
  }

  // AND intersection: visible only if visible in ALL sub-results
  const visible = new Set();
  const dimmed = new Set();

  for (const n of nodes) {
    let passesAll = true;
    for (const result of subResults) {
      if (!result.visible.has(n.id)) {
        passesAll = false;
        break;
      }
    }
    if (passesAll) {
      visible.add(n.id);
    } else {
      dimmed.add(n.id);
    }
  }

  return { visible, dimmed };
}

/**
 * Reset the VESM tier caches (for testing).
 */
export function _resetCaches() {
  _entityTypeTierCache = null;
  _ontologyTierCache = null;
}
