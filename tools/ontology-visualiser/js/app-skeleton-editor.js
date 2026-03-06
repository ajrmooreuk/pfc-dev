/**
 * App Skeleton Editor — F40.19 (Reorder & Move Nav/Zone Mappings)
 *
 * Mutation functions for editing the PFC-level application skeleton:
 * - Reorder nav items within a layer (swap renderOrder)
 * - Move nav items between layers (change belongsToLayer)
 * - Reorder zone-components within a zone (swap renderOrder)
 * - Move components between zones (change placedInZone)
 *
 * Changes apply in-memory: rebuild registries + re-render toolbar + re-render panel.
 * Export downloads updated JSONLD.
 *
 * Follows ontology-author.js patterns: snapshot-based undo, touchModified, apply.
 */

import { state } from './state.js';
import { buildSkeletonRegistries } from './app-skeleton-loader.js';
import { renderSkeletonPanel } from './app-skeleton-panel.js';
import { refreshSkeletonGraph } from './skeleton-graph.js';

// ========================================
// EDIT MODE MANAGEMENT
// ========================================

export function enterSkeletonEditMode() {
  if (state.skeletonEditMode) return;
  if (!state.appSkeleton) return;
  state.skeletonEditMode = true;
  state.skeletonDirty = false;
  state.skeletonUndoStack = [];
  state.skeletonRedoStack = [];
  state.skeletonBaselineSnapshot = JSON.stringify(state.appSkeleton);
  renderSkeletonPanel();
}

export function exitSkeletonEditMode(discard) {
  if (!state.skeletonEditMode) return;
  if (discard && state.skeletonBaselineSnapshot) {
    state.appSkeleton = JSON.parse(state.skeletonBaselineSnapshot);
    _apply();
  }
  state.skeletonEditMode = false;
  state.skeletonDirty = false;
  state.skeletonUndoStack = [];
  state.skeletonRedoStack = [];
  state.skeletonBaselineSnapshot = null;
  renderSkeletonPanel();
}

// ========================================
// UNDO / REDO (snapshot-based)
// ========================================

export function pushSkeletonUndo(operation) {
  state.skeletonUndoStack.push({
    operation,
    timestamp: Date.now(),
    snapshot: JSON.stringify(state.appSkeleton),
  });
  state.skeletonRedoStack = [];
  state.skeletonDirty = true;
}

export function undoSkeletonEdit() {
  if (state.skeletonUndoStack.length === 0) return;
  const entry = state.skeletonUndoStack.pop();
  state.skeletonRedoStack.push({
    operation: 'undo-' + entry.operation,
    timestamp: Date.now(),
    snapshot: JSON.stringify(state.appSkeleton),
  });
  state.appSkeleton = JSON.parse(entry.snapshot);
  state.skeletonDirty = state.skeletonUndoStack.length > 0;
  _apply();
}

export function redoSkeletonEdit() {
  if (state.skeletonRedoStack.length === 0) return;
  const entry = state.skeletonRedoStack.pop();
  state.skeletonUndoStack.push({
    operation: 'redo',
    timestamp: Date.now(),
    snapshot: JSON.stringify(state.appSkeleton),
  });
  state.appSkeleton = JSON.parse(entry.snapshot);
  state.skeletonDirty = true;
  _apply();
}

// ========================================
// NAV ITEM MUTATIONS
// ========================================

/**
 * Reorder a nav item up or down within its current layer.
 * Swaps renderOrder with the adjacent item.
 */
export function reorderNavItem(itemId, direction) {
  if (!state.appSkeleton) return;
  const items = state.appSkeleton.navItems;
  const item = items.find(i => i['ds:itemId'] === itemId);
  if (!item) return;
  if (!state.skeletonEditMode && (item['ds:cascadeTier'] || 'PFC').toUpperCase() === 'PFC') return;

  const layerRef = item['ds:belongsToLayer']?.['@id'];
  const siblings = items
    .filter(i => i['ds:belongsToLayer']?.['@id'] === layerRef)
    .sort((a, b) => (a['ds:renderOrder'] || 0) - (b['ds:renderOrder'] || 0));

  const idx = siblings.findIndex(i => i['ds:itemId'] === itemId);
  const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= siblings.length) return;
  if (!state.skeletonEditMode && (siblings[swapIdx]['ds:cascadeTier'] || 'PFC').toUpperCase() === 'PFC') return;

  pushSkeletonUndo('reorderNavItem');

  const orderA = siblings[idx]['ds:renderOrder'];
  const orderB = siblings[swapIdx]['ds:renderOrder'];
  siblings[idx]['ds:renderOrder'] = orderB;
  siblings[swapIdx]['ds:renderOrder'] = orderA;

  _apply();
}

/**
 * Move a nav item to a different layer.
 * Appends at the end of the target layer's renderOrder sequence.
 */
export function moveNavItemToLayer(itemId, targetLayerId) {
  if (!state.appSkeleton) return;
  const items = state.appSkeleton.navItems;
  const item = items.find(i => i['ds:itemId'] === itemId);
  if (!item) return;
  if (!state.skeletonEditMode && (item['ds:cascadeTier'] || 'PFC').toUpperCase() === 'PFC') return;

  const targetLayer = state.appSkeleton.navLayers.find(
    l => l['ds:layerId'] === targetLayerId
  );
  if (!targetLayer) return;

  const currentLayerRef = item['ds:belongsToLayer']?.['@id'];
  if (currentLayerRef === targetLayer['@id']) return; // already there

  pushSkeletonUndo('moveNavItemToLayer');

  // Find max renderOrder in target layer
  const targetSiblings = items.filter(
    i => i['ds:belongsToLayer']?.['@id'] === targetLayer['@id']
  );
  const maxOrder = targetSiblings.reduce(
    (max, i) => Math.max(max, i['ds:renderOrder'] || 0), 0
  );

  item['ds:belongsToLayer'] = { '@id': targetLayer['@id'] };
  item['ds:renderOrder'] = maxOrder + 1;

  _apply();
}

// ========================================
// ZONE COMPONENT MUTATIONS
// ========================================

/**
 * Reorder a zone-component up or down within its current zone.
 */
export function reorderZoneComponent(placementId, direction) {
  if (!state.appSkeleton) return;
  const cmps = state.appSkeleton.zoneComponents;
  const cmp = cmps.find(c => c['ds:placementId'] === placementId);
  if (!cmp) return;
  if (!state.skeletonEditMode && (cmp['ds:cascadeTier'] || 'PFC').toUpperCase() === 'PFC') return;

  const zoneRef = cmp['ds:placedInZone']?.['@id'];
  const siblings = cmps
    .filter(c => c['ds:placedInZone']?.['@id'] === zoneRef)
    .sort((a, b) => (a['ds:renderOrder'] || 0) - (b['ds:renderOrder'] || 0));

  const idx = siblings.findIndex(c => c['ds:placementId'] === placementId);
  const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= siblings.length) return;
  if (!state.skeletonEditMode && (siblings[swapIdx]['ds:cascadeTier'] || 'PFC').toUpperCase() === 'PFC') return;

  pushSkeletonUndo('reorderZoneComponent');

  const orderA = siblings[idx]['ds:renderOrder'];
  const orderB = siblings[swapIdx]['ds:renderOrder'];
  siblings[idx]['ds:renderOrder'] = orderB;
  siblings[swapIdx]['ds:renderOrder'] = orderA;

  _apply();
}

/**
 * Move a zone-component to a different zone.
 */
export function moveZoneComponentToZone(placementId, targetZoneId) {
  if (!state.appSkeleton) return;
  const cmps = state.appSkeleton.zoneComponents;
  const cmp = cmps.find(c => c['ds:placementId'] === placementId);
  if (!cmp) return;
  if (!state.skeletonEditMode && (cmp['ds:cascadeTier'] || 'PFC').toUpperCase() === 'PFC') return;

  const targetZone = state.appSkeleton.zones.find(
    z => z['ds:zoneId'] === targetZoneId
  );
  if (!targetZone) return;

  const currentZoneRef = cmp['ds:placedInZone']?.['@id'];
  if (currentZoneRef === targetZone['@id']) return;

  pushSkeletonUndo('moveZoneComponentToZone');

  const targetSiblings = cmps.filter(
    c => c['ds:placedInZone']?.['@id'] === targetZone['@id']
  );
  const maxOrder = targetSiblings.reduce(
    (max, c) => Math.max(max, c['ds:renderOrder'] || 0), 0
  );

  cmp['ds:placedInZone'] = { '@id': targetZone['@id'] };
  cmp['ds:renderOrder'] = maxOrder + 1;

  _apply();
}

// ========================================
// ZONE CRUD OPERATIONS (F49.4)
// ========================================

/** PFI Zone ID pattern: Z-{PFI_SHORT_CODE}-{nnn} */
const PFI_ZONE_ID_RE = /^Z-[A-Z]{2,6}-\d{3,}$/;
/** PFC reserved range: Z1–Z99, Z-source, Z-admin, Z-context */
const PFC_ZONE_ID_RE = /^Z\d{1,2}[a-z]?$|^Z-(source|admin|context|dyn)$/;

/**
 * Validate a zone ID against CONVENTION-PFI-Zone-ID.
 * Returns null if valid, or an error message string.
 */
export function validateZoneId(zoneId, existingZones) {
  if (!zoneId || typeof zoneId !== 'string') return 'Zone ID is required';
  if (PFC_ZONE_ID_RE.test(zoneId)) return `Zone ID "${zoneId}" is in PFC reserved range (Z1-Z99)`;
  if (!PFI_ZONE_ID_RE.test(zoneId)) return `Zone ID "${zoneId}" must follow PFI pattern Z-{PFI}-{nnn} (e.g. Z-WWG-300)`;
  if (existingZones?.some(z => z['ds:zoneId'] === zoneId)) return `Zone ID "${zoneId}" already exists`;
  return null;
}

/**
 * Add a new PFI-tier zone to the skeleton.
 * PFC zones cannot be created via this function — use the skeleton JSONLD directly.
 *
 * @param {Object} zoneData - Zone properties (zoneId, zoneName, zoneType required)
 * @returns {string|null} New zone's ds:zoneId, or null on failure
 */
export function addZone(zoneData) {
  if (!state.appSkeleton) return null;
  if (!zoneData?.zoneId || !zoneData?.zoneName || !zoneData?.zoneType) return null;

  const validationError = validateZoneId(zoneData.zoneId, state.appSkeleton.zones);
  if (validationError) {
    console.warn('[skeleton-editor] addZone rejected:', validationError);
    return null;
  }

  pushSkeletonUndo('addZone');

  const newZone = {
    '@id': `ds:zone-${zoneData.zoneId}`,
    '@type': 'ds:AppZone',
    'ds:zoneId': zoneData.zoneId,
    'ds:zoneName': zoneData.zoneName,
    'ds:zoneType': zoneData.zoneType,
    'ds:defaultVisible': zoneData.defaultVisible ?? false,
    'ds:cascadeTier': 'PFI',
    'ds:position': zoneData.position || null,
    'ds:defaultWidth': zoneData.defaultWidth || null,
    'ds:visibilityCondition': zoneData.visibilityCondition || null,
    'ds:domSelector': zoneData.domSelector || null,
    'ds:description': zoneData.description || null,
    // v3.1.0 Application Specification bindings
    'ds:realizesEpic': zoneData.realizesEpic || null,
    'ds:realizesFeatures': zoneData.realizesFeatures || null,
    'ds:gatedByProject': zoneData.gatedByProject || null,
    'ds:targetMilestone': zoneData.targetMilestone || null,
    'ds:specStatus': zoneData.specStatus || 'planned',
  };

  state.appSkeleton.zones.push(newZone);
  _apply();
  return zoneData.zoneId;
}

/**
 * Remove a zone by ds:zoneId.
 * PFC-tier zones (Z1-Z99) cannot be removed.
 * Also removes all zone-components placed in this zone.
 *
 * @param {string} zoneId - ds:zoneId of the zone to remove
 * @returns {boolean} True if removed, false if rejected
 */
export function removeZone(zoneId) {
  if (!state.appSkeleton) return false;
  const zones = state.appSkeleton.zones;
  const idx = zones.findIndex(z => z['ds:zoneId'] === zoneId);
  if (idx === -1) return false;

  const zone = zones[idx];
  const tier = (zone['ds:cascadeTier'] || 'PFC').toUpperCase();
  if (tier === 'PFC') {
    console.warn('[skeleton-editor] Cannot remove PFC-tier zone:', zoneId);
    return false;
  }

  pushSkeletonUndo('removeZone');

  // Remove the zone
  zones.splice(idx, 1);

  // Remove zone-components placed in this zone
  const zoneAtId = zone['@id'];
  if (state.appSkeleton.zoneComponents) {
    state.appSkeleton.zoneComponents = state.appSkeleton.zoneComponents.filter(
      c => c['ds:placedInZone']?.['@id'] !== zoneAtId
    );
  }

  // Clear navLayerInZone references pointing to this zone
  for (const layer of state.appSkeleton.navLayers) {
    if (layer['ds:navLayerInZone']?.['@id'] === zoneAtId) {
      layer['ds:navLayerInZone'] = null;
    }
  }

  _apply();
  return true;
}

/**
 * Update a single property on a zone.
 * PFC-tier zone properties cannot be modified (except by PFC maintainers).
 *
 * @param {string} zoneId - ds:zoneId of the zone
 * @param {string} property - Property key (e.g. 'ds:zoneName', 'ds:specStatus')
 * @param {*} value - New value
 * @returns {boolean} True if updated
 */
export function updateZoneProperty(zoneId, property, value) {
  if (!state.appSkeleton) return false;
  const zone = state.appSkeleton.zones.find(z => z['ds:zoneId'] === zoneId);
  if (!zone) return false;

  const tier = (zone['ds:cascadeTier'] || 'PFC').toUpperCase();
  if (tier === 'PFC' && !state.skeletonEditMode) {
    console.warn('[skeleton-editor] Cannot modify PFC-tier zone outside edit mode:', zoneId);
    return false;
  }

  // Prevent changing immutable properties
  if (['@id', '@type', 'ds:zoneId'].includes(property)) {
    console.warn('[skeleton-editor] Cannot change immutable property:', property);
    return false;
  }

  pushSkeletonUndo('updateZoneProperty');
  zone[property] = value;
  _apply();
  return true;
}

// ========================================
// NAV LAYER ZONE ASSIGNMENT (F40.20 Phase 3)
// ========================================

/**
 * Move a NavLayer to a different zone.
 * Updates ds:navLayerInZone on the layer, pushes undo, re-renders.
 *
 * @param {string} layerId - ds:layerId of the layer to move
 * @param {string} targetZoneId - ds:zoneId of the target zone
 */
export function moveLayerToZone(layerId, targetZoneId) {
  if (!state.appSkeleton) return;
  const layers = state.appSkeleton.navLayers;
  const layer = layers.find(l => l['ds:layerId'] === layerId);
  if (!layer) return;

  const targetZone = state.appSkeleton.zones.find(
    z => z['ds:zoneId'] === targetZoneId
  );
  if (!targetZone) return;

  const currentZoneRef = layer['ds:navLayerInZone']?.['@id'];
  if (currentZoneRef === targetZone['@id']) return; // already there

  pushSkeletonUndo('moveLayerToZone');

  layer['ds:navLayerInZone'] = { '@id': targetZone['@id'] };

  _apply();
}

// ========================================
// SAVE TO LIBRARY + PERSISTENCE
// ========================================

const SKELETON_LS_KEY = 'oaa-viz-skeleton-edits';

// Persistent directory handle for File System Access API (avoids re-prompting)
let _libraryDirHandle = null;

/**
 * Serialize skeleton to JSONLD string.
 * Stamps dateModified; optionally bumps version.
 */
export function serializeSkeletonJsonld(newVersion) {
  if (!state.appSkeleton) return null;
  const sk = state.appSkeleton;

  if (sk.application) {
    sk.application['ds:dateModified'] = new Date().toISOString().split('T')[0];
    if (newVersion) sk.application['ds:version'] = newVersion;
  }

  const graph = [];
  if (sk.application) graph.push(sk.application);
  graph.push(...(sk.zones || []));
  graph.push(...(sk.navLayers || []));
  graph.push(...(sk.navItems || []));
  graph.push(...(sk.actions || []));
  graph.push(...(sk.zoneComponents || []));

  return JSON.stringify({
    '@context': {
      'ds': 'https://pf-core.dev/ds-ont/v3/',
      'description': 'http://purl.org/dc/terms/description',
    },
    '@graph': graph,
  }, null, 2);
}

/**
 * Save edited skeleton directly to the ontology library via File System Access API.
 * Writes to PE-Series/DS-ONT/instance-data/pfc-app-skeleton-v{ver}.jsonld.
 * Falls back to download if the API is unavailable or permission denied.
 * Also caches to localStorage for session resilience.
 *
 * @param {string} [newVersion] - Optional version bump
 * @returns {Promise<{method: string, path: string}>}
 */
export async function saveSkeletonToLibrary(newVersion) {
  const json = serializeSkeletonJsonld(newVersion);
  if (!json) throw new Error('No skeleton to save');

  const ver = (state.appSkeleton.application?.['ds:version'] || 'v1.0.0').replace(/^v/, '');
  const filename = `pfc-app-skeleton-v${ver}.jsonld`;
  const subPath = ['PE-Series', 'DS-ONT', 'instance-data'];

  // Always persist to localStorage as safety net
  persistSkeletonToLocalStorage();

  // Attempt File System Access API (Chrome/Edge)
  if (typeof window !== 'undefined' && window.showDirectoryPicker) {
    try {
      // Reuse saved handle or prompt for ontology-library directory
      if (!_libraryDirHandle) {
        _libraryDirHandle = await window.showDirectoryPicker({
          id: 'ontology-library',
          mode: 'readwrite',
          startIn: 'documents',
        });
      }

      // Navigate to PE-Series/DS-ONT/instance-data/
      let dir = _libraryDirHandle;
      for (const segment of subPath) {
        dir = await dir.getDirectoryHandle(segment);
      }

      // Write the file
      const fileHandle = await dir.getFileHandle(filename, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(json);
      await writable.close();

      state.skeletonDirty = false;
      renderSkeletonPanel();
      return { method: 'filesystem', path: subPath.join('/') + '/' + filename };
    } catch (err) {
      if (err.name === 'AbortError') {
        // User cancelled — don't fall through to download
        return { method: 'cancelled', path: '' };
      }
      console.warn('[skeleton-editor] File System Access failed, falling back to download:', err.message);
      _libraryDirHandle = null;
    }
  }

  // Fallback: browser download
  _downloadBlob(json, filename);
  state.skeletonDirty = false;
  renderSkeletonPanel();
  return { method: 'download', path: filename };
}

/**
 * Legacy export — always downloads (for compatibility or explicit user choice).
 */
export function exportSkeletonJsonld(newVersion) {
  const json = serializeSkeletonJsonld(newVersion);
  if (!json) return;
  const ver = (state.appSkeleton.application?.['ds:version'] || 'v1.0.0').replace(/^v/, '');
  _downloadBlob(json, `pfc-app-skeleton-v${ver}.jsonld`);
}

function _downloadBlob(json, filename) {
  const blob = new Blob([json], { type: 'application/ld+json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ========================================
// LOCAL STORAGE PERSISTENCE
// ========================================

/**
 * Cache edited skeleton to localStorage.
 * Survives page refresh — loaded on next session by restoreSkeletonFromLocalStorage.
 */
export function persistSkeletonToLocalStorage() {
  if (!state.appSkeleton) return;
  try {
    const json = serializeSkeletonJsonld();
    localStorage.setItem(SKELETON_LS_KEY, json);
    localStorage.setItem(SKELETON_LS_KEY + '-ts', new Date().toISOString());
  } catch (err) {
    console.warn('[skeleton-editor] localStorage save failed:', err.message);
  }
}

/**
 * Restore edited skeleton from localStorage if available.
 * Returns true if a cached version was loaded, false otherwise.
 * Called during app init, before registry fetch.
 */
export function restoreSkeletonFromLocalStorage() {
  try {
    const json = localStorage.getItem(SKELETON_LS_KEY);
    if (!json) return false;
    const ts = localStorage.getItem(SKELETON_LS_KEY + '-ts') || 'unknown';
    const parsed = JSON.parse(json);
    const graph = parsed?.['@graph'] || [];

    state.appSkeleton = {
      application: graph.find(n => n['@type'] === 'ds:Application') || null,
      zones: graph.filter(n => n['@type'] === 'ds:AppZone'),
      navLayers: graph.filter(n => n['@type'] === 'ds:NavLayer'),
      navItems: graph.filter(n => n['@type'] === 'ds:NavItem'),
      zoneComponents: graph.filter(n => n['@type'] === 'ds:ZoneComponent'),
    };

    buildSkeletonRegistries(state.appSkeleton);
    console.info(`[skeleton-editor] Restored edited skeleton from localStorage (saved ${ts})`);
    return true;
  } catch (err) {
    console.warn('[skeleton-editor] localStorage restore failed:', err.message);
    return false;
  }
}

/**
 * Clear any cached skeleton edits from localStorage.
 * Called when user discards changes or after a successful save-to-library.
 */
export function clearSkeletonLocalStorage() {
  localStorage.removeItem(SKELETON_LS_KEY);
  localStorage.removeItem(SKELETON_LS_KEY + '-ts');
}

/**
 * Check if there are pending skeleton edits in localStorage.
 */
export function hasPendingSkeletonEdits() {
  return localStorage.getItem(SKELETON_LS_KEY) !== null;
}

// ========================================
// CHANGE SUMMARY
// ========================================

/**
 * Generate a summary of changes since edit mode was entered.
 * Compares baseline snapshot against current state.
 */
export function getSkeletonEditSummary() {
  if (!state.skeletonBaselineSnapshot) return null;
  const baseline = JSON.parse(state.skeletonBaselineSnapshot);
  const current = state.appSkeleton;
  if (!baseline || !current) return null;

  const changes = [];

  for (const curr of current.navItems) {
    const orig = baseline.navItems.find(i => i['ds:itemId'] === curr['ds:itemId']);
    if (!orig) continue;
    if (orig['ds:renderOrder'] !== curr['ds:renderOrder']) {
      changes.push(`Nav "${curr['ds:label'] || curr['ds:itemId']}": renderOrder ${orig['ds:renderOrder']} → ${curr['ds:renderOrder']}`);
    }
    if (orig['ds:belongsToLayer']?.['@id'] !== curr['ds:belongsToLayer']?.['@id']) {
      changes.push(`Nav "${curr['ds:label'] || curr['ds:itemId']}": moved to ${curr['ds:belongsToLayer']?.['@id']}`);
    }
  }

  for (const curr of current.zoneComponents) {
    const orig = baseline.zoneComponents.find(c => c['ds:placementId'] === curr['ds:placementId']);
    if (!orig) continue;
    if (orig['ds:renderOrder'] !== curr['ds:renderOrder']) {
      changes.push(`Component "${curr['ds:placementId']}": renderOrder ${orig['ds:renderOrder']} → ${curr['ds:renderOrder']}`);
    }
    if (orig['ds:placedInZone']?.['@id'] !== curr['ds:placedInZone']?.['@id']) {
      changes.push(`Component "${curr['ds:placementId']}": moved to ${curr['ds:placedInZone']?.['@id']}`);
    }
  }

  return { changeCount: changes.length, changes };
}

// ========================================
// CRUD MUTATIONS — NavItem, DropdownChild, Action (F40.22)
// ========================================

/**
 * Add a new NavItem to a layer.
 * @param {string} layerId - ds:layerId of the target layer
 * @param {string} itemType - Button | Toggle | Chip | Dropdown | Separator
 * @param {string} label - Display label
 * @returns {string|null} New item's ds:itemId, or null on failure
 */
export function addNavItem(layerId, itemType, label) {
  if (!state.appSkeleton) return null;

  const layer = state.appSkeleton.navLayers.find(l => l['ds:layerId'] === layerId);
  if (!layer) return null;

  pushSkeletonUndo('addNavItem');

  const itemId = `nav-${layerId}-${Date.now()}`;
  const siblings = state.appSkeleton.navItems.filter(
    i => i['ds:belongsToLayer']?.['@id'] === layer['@id']
  );
  const maxOrder = siblings.reduce((max, i) => Math.max(max, i['ds:renderOrder'] || 0), 0);

  const newItem = {
    '@id': `ds:${itemId}`,
    '@type': 'ds:NavItem',
    'ds:itemId': itemId,
    'ds:label': label || `New ${itemType}`,
    'ds:itemType': itemType,
    'ds:action': 'noop',
    'ds:icon': null,
    'ds:shortcut': null,
    'ds:visibilityCondition': null,
    'ds:renderOrder': maxOrder + 1,
    'ds:cascadeTier': 'PFC',
    'ds:belongsToLayer': { '@id': layer['@id'] },
  };

  if (itemType === 'Dropdown') {
    newItem['ds:children'] = [];
  }

  state.appSkeleton.navItems.push(newItem);
  _apply();
  return itemId;
}

/**
 * Remove a NavItem by its ds:itemId.
 * Re-sequences renderOrder for remaining siblings.
 * @param {string} itemId - ds:itemId of the item to remove
 */
export function removeNavItem(itemId) {
  if (!state.appSkeleton) return;
  const items = state.appSkeleton.navItems;
  const idx = items.findIndex(i => i['ds:itemId'] === itemId);
  if (idx === -1) return;

  pushSkeletonUndo('removeNavItem');

  const item = items[idx];
  const layerRef = item['ds:belongsToLayer']?.['@id'];

  items.splice(idx, 1);

  // Re-sequence renderOrder for remaining siblings
  const siblings = items
    .filter(i => i['ds:belongsToLayer']?.['@id'] === layerRef)
    .sort((a, b) => (a['ds:renderOrder'] || 0) - (b['ds:renderOrder'] || 0));
  siblings.forEach((s, i) => { s['ds:renderOrder'] = i + 1; });

  _apply();
}

/**
 * Add a child item to a Dropdown NavItem's ds:children array.
 * @param {string} parentItemId - ds:itemId of the parent Dropdown
 * @param {string} label - Child label (use '---' for separator)
 * @param {number} [position] - Insert position (defaults to end)
 */
export function addDropdownChild(parentItemId, label, position) {
  if (!state.appSkeleton) return;
  const parent = state.appSkeleton.navItems.find(i => i['ds:itemId'] === parentItemId);
  if (!parent || parent['ds:itemType'] !== 'Dropdown') return;

  pushSkeletonUndo('addDropdownChild');

  if (!Array.isArray(parent['ds:children'])) {
    parent['ds:children'] = [];
  }

  const child = { 'ds:label': label };
  if (label !== '---') {
    child['ds:action'] = 'noop';
    child['ds:parentNavItem'] = { '@id': parent['@id'] };
  }

  if (position !== undefined && position >= 0 && position <= parent['ds:children'].length) {
    parent['ds:children'].splice(position, 0, child);
  } else {
    parent['ds:children'].push(child);
  }

  _apply();
}

/**
 * Remove a child from a Dropdown NavItem's ds:children array.
 * @param {string} parentItemId - ds:itemId of the parent Dropdown
 * @param {number} childIndex - Index within ds:children to remove
 */
export function removeDropdownChild(parentItemId, childIndex) {
  if (!state.appSkeleton) return;
  const parent = state.appSkeleton.navItems.find(i => i['ds:itemId'] === parentItemId);
  if (!parent || !Array.isArray(parent['ds:children'])) return;
  if (childIndex < 0 || childIndex >= parent['ds:children'].length) return;

  pushSkeletonUndo('removeDropdownChild');
  parent['ds:children'].splice(childIndex, 1);
  _apply();
}

/**
 * Update a single property on a NavItem.
 * @param {string} itemId - ds:itemId of the item
 * @param {string} property - Property key (e.g. 'ds:label', 'ds:icon')
 * @param {*} value - New value
 */
export function updateNavItemProperty(itemId, property, value) {
  if (!state.appSkeleton) return;
  const item = state.appSkeleton.navItems.find(i => i['ds:itemId'] === itemId);
  if (!item) return;

  pushSkeletonUndo('updateNavItemProperty');
  item[property] = value;
  _apply();
}

/**
 * Add a new Action entity to the skeleton.
 * @param {Object} actionData - Partial Action entity data (functionRef required)
 * @returns {string|null} New action's @id, or null on failure
 */
export function addActionEntity(actionData) {
  if (!state.appSkeleton) return null;
  if (!actionData?.['ds:functionRef']) return null;

  pushSkeletonUndo('addActionEntity');

  const actionId = `action-${Date.now()}`;
  const newAction = {
    '@id': `ds:${actionId}`,
    '@type': 'ds:Action',
    'ds:actionId': actionId,
    'ds:actionName': actionData['ds:actionName'] || actionId,
    'ds:functionRef': actionData['ds:functionRef'],
    'ds:parameterType': actionData['ds:parameterType'] || 'None',
    'ds:guardCondition': actionData['ds:guardCondition'] || null,
    'ds:guardMessage': actionData['ds:guardMessage'] || null,
    'ds:triggersSyncAfter': actionData['ds:triggersSyncAfter'] || false,
    'ds:accessibilityHint': actionData['ds:accessibilityHint'] || null,
  };

  if (!state.appSkeleton.actions) state.appSkeleton.actions = [];
  state.appSkeleton.actions.push(newAction);
  _apply();
  return actionId;
}

/**
 * Remove an Action entity by @id.
 * Clears ds:executesAction references on any NavItems pointing to it.
 * @param {string} actionAtId - Full @id (e.g. 'ds:action-toggleAudit')
 */
export function removeActionEntity(actionAtId) {
  if (!state.appSkeleton?.actions) return;
  const idx = state.appSkeleton.actions.findIndex(a => a['@id'] === actionAtId);
  if (idx === -1) return;

  pushSkeletonUndo('removeActionEntity');
  state.appSkeleton.actions.splice(idx, 1);

  // Clear dangling refs on NavItems
  for (const item of state.appSkeleton.navItems) {
    if (item['ds:executesAction']?.['@id'] === actionAtId) {
      delete item['ds:executesAction'];
    }
    // Also check dropdown children
    if (Array.isArray(item['ds:children'])) {
      for (const child of item['ds:children']) {
        if (child['ds:executesAction']?.['@id'] === actionAtId) {
          delete child['ds:executesAction'];
        }
      }
    }
  }

  _apply();
}

/**
 * Move a dropdown child from one parent to another.
 * @param {string} sourceParentId - ds:itemId of source Dropdown
 * @param {number} childIndex - Index in source's ds:children
 * @param {string} targetParentId - ds:itemId of target Dropdown
 */
export function reparentDropdownChild(sourceParentId, childIndex, targetParentId) {
  if (!state.appSkeleton) return;
  const source = state.appSkeleton.navItems.find(i => i['ds:itemId'] === sourceParentId);
  const target = state.appSkeleton.navItems.find(i => i['ds:itemId'] === targetParentId);
  if (!source || !target) return;
  if (!Array.isArray(source['ds:children']) || childIndex < 0 || childIndex >= source['ds:children'].length) return;
  if (target['ds:itemType'] !== 'Dropdown') return;

  pushSkeletonUndo('reparentDropdownChild');

  const [child] = source['ds:children'].splice(childIndex, 1);
  child['ds:parentNavItem'] = { '@id': target['@id'] };
  if (!Array.isArray(target['ds:children'])) target['ds:children'] = [];
  target['ds:children'].push(child);

  _apply();
}

/**
 * Create a minimal blank skeleton (1 Application, 1 Zone, 1 Layer, 0 items).
 * Replaces current skeleton on state.appSkeleton.
 */
export function createBlankSkeleton() {
  pushSkeletonUndo('createBlankSkeleton');

  state.appSkeleton = {
    application: {
      '@id': 'ds:app-new',
      '@type': 'ds:Application',
      'ds:applicationName': 'New Application',
      'ds:version': '0.1.0',
      'ds:dateModified': new Date().toISOString().split('T')[0],
    },
    zones: [{
      '@id': 'ds:zone-Z1',
      '@type': 'ds:AppZone',
      'ds:zoneId': 'Z1',
      'ds:zoneName': 'Main Toolbar',
      'ds:zoneType': 'toolbar',
      'ds:defaultVisible': true,
      'ds:domSelector': '#dynamic-nav-bar',
    }],
    navLayers: [{
      '@id': 'ds:navlayer-L1',
      '@type': 'ds:NavLayer',
      'ds:layerId': 'L1',
      'ds:layerName': 'Main',
      'ds:layerLevel': 1,
      'ds:renderOrder': 1,
      'ds:cascadeTier': 'PFC',
      'ds:navLayerInZone': { '@id': 'ds:zone-Z1' },
    }],
    navItems: [],
    actions: [],
    zoneComponents: [],
  };

  _apply();
}

// ========================================
// INTERNAL — Apply after mutation
// ========================================

function _apply() {
  if (!state.appSkeleton) return;
  buildSkeletonRegistries(state.appSkeleton);

  // Re-render dynamic nav bar from skeleton data (F40.17b)
  if (typeof globalThis.window !== 'undefined' && typeof window.renderDynamicNavBar === 'function') {
    window.renderDynamicNavBar();
  }

  // Auto-persist to localStorage for session resilience
  persistSkeletonToLocalStorage();

  renderSkeletonPanel();

  // Refresh skeleton graph view if active (F40.22)
  if (state.activeView === 'skeleton' && state.skeletonGraphNodes && state.skeletonGraphEdges) {
    refreshSkeletonGraph(state.skeletonGraphNodes, state.skeletonGraphEdges, state.appSkeleton, {
      showActions: state._skeletonShowActions,
      direction: state._skeletonDirection,
    });
  }
}
