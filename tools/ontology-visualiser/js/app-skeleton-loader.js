/**
 * App Skeleton Loader — F40.13 + F40.20 (DS-ONT v3.0.0 Application Skeleton)
 *
 * Loads, parses, and merges application skeleton JSONLD instance data.
 * The skeleton encodes zones, navigation layers, nav items, actions, and
 * component placements — the app reads this at runtime to construct its
 * UI dynamically. Actions are ontology entities (ds:Action) that replace
 * the manual ACTION_REGISTRY — adding a new button = adding JSONLD data only.
 *
 * Follows the 4-tier EMC cascade: PFC → PFI → Product → App.
 * Each tier can add, override (by matching @id), or hide items.
 * PFC-tier entities are immutable — higher tiers cannot modify them.
 */

import { state, REGISTRY_BASE_PATH } from './state.js';

// ========================================
// PARSING
// ========================================

/**
 * Parse a JSONLD app skeleton instance into structured data.
 *
 * @param {Object} jsonld - Raw JSONLD object with @graph array
 * @returns {Object} { application, zones[], navLayers[], navItems[], actions[], zoneComponents[] }
 */
export function parseAppSkeleton(jsonld) {
  const graph = jsonld?.['@graph'] || [];

  const application = graph.find(n => n['@type'] === 'ds:Application') || null;
  const zones = graph.filter(n => n['@type'] === 'ds:AppZone');
  const navLayers = graph.filter(n => n['@type'] === 'ds:NavLayer');
  const navItems = graph.filter(n => n['@type'] === 'ds:NavItem');
  const actions = graph.filter(n => n['@type'] === 'ds:Action');
  const zoneComponents = graph.filter(n => n['@type'] === 'ds:ZoneComponent');

  return { application, zones, navLayers, navItems, actions, zoneComponents };
}

// ========================================
// CASCADE MERGE
// ========================================

/**
 * Merge an override skeleton into a base skeleton following EMC cascade rules.
 * - Items matched by @id: override replaces base (unless base is PFC-tier and override is higher)
 * - New items (no matching @id): added to the collection
 * - BR-DS-013 CascadeImmutability: PFC-tier items cannot be modified by higher tiers
 *
 * @param {Object} base - Parsed skeleton (from parseAppSkeleton)
 * @param {Object} override - Parsed skeleton overlay
 * @returns {Object} Merged skeleton
 */
export function mergeSkeletonCascade(base, override) {
  if (!override) return { ...base };

  const merged = {
    application: override.application || base.application,
    zones: mergeCollection(base.zones, override.zones),
    navLayers: mergeCollection(base.navLayers, override.navLayers),
    navItems: mergeCollection(base.navItems, override.navItems),
    actions: mergeCollection(base.actions || [], override.actions || []),
    zoneComponents: mergeCollection(base.zoneComponents, override.zoneComponents),
  };

  return merged;
}

/**
 * Merge two arrays of JSONLD entities by @id.
 * Override items with matching @id replace base items (cascade immutability enforced).
 * New override items are appended.
 *
 * @param {Array} baseArr - Base collection
 * @param {Array} overrideArr - Override collection
 * @returns {Array} Merged collection
 */
function mergeCollection(baseArr, overrideArr) {
  if (!overrideArr || overrideArr.length === 0) return [...baseArr];
  if (!baseArr || baseArr.length === 0) return [...overrideArr];

  const baseMap = new Map(baseArr.map(item => [item['@id'], item]));
  const result = [...baseArr];

  for (const overrideItem of overrideArr) {
    const id = overrideItem['@id'];
    const baseItem = baseMap.get(id);

    if (baseItem) {
      // BR-DS-013: PFC-tier items are immutable from higher tiers
      if (baseItem['ds:cascadeTier'] === 'PFC' && overrideItem['ds:cascadeTier'] !== 'PFC') {
        console.warn(`[app-skeleton] Cascade immutability: cannot modify PFC item ${id} from tier ${overrideItem['ds:cascadeTier']}`);
        continue;
      }
      // Replace in-place
      const idx = result.findIndex(r => r['@id'] === id);
      if (idx !== -1) result[idx] = { ...baseItem, ...overrideItem };
    } else {
      // New item — append
      result.push(overrideItem);
    }
  }

  return result;
}

// ========================================
// REGISTRY RESOLUTION
// ========================================

/**
 * Load and resolve the app skeleton for the current PFI configuration.
 * Loads PFC base, then merges PFI/Product/App overrides per the EMC cascade.
 *
 * @param {Object} [config] - Optional EMC appSkeletonConfig
 * @returns {Promise<{skeleton: Object, source: string}|null>}
 */
export async function resolveAppSkeletonForPFI(config) {
  // Load PFC base skeleton from registry
  const basePath = REGISTRY_BASE_PATH + 'PE-Series/DS-ONT/instance-data/pfc-app-skeleton-v1.0.0.jsonld';
  const cacheBust = '?_t=' + Date.now();
  let baseJsonld;

  try {
    const response = await fetch(basePath + cacheBust, { cache: 'no-store' });
    if (!response.ok) return null;
    baseJsonld = await response.json();
  } catch (err) {
    console.warn('[app-skeleton] Failed to load PFC base skeleton:', err.message);
    return null;
  }

  const base = parseAppSkeleton(baseJsonld);
  state.appSkeletonBase = base;

  // If no cascade config, return PFC base as-is
  if (!config?.pfiOverrides) {
    return { skeleton: base, source: 'registry' };
  }

  // Load and merge PFI overrides
  let merged = base;
  const overridePaths = [config.pfiOverrides, config.productOverrides, config.appOverrides].filter(Boolean);

  for (const overridePath of overridePaths) {
    try {
      const resolvedPath = overridePath.startsWith('http')
        ? overridePath
        : REGISTRY_BASE_PATH + overridePath.replace(/^PBS\/ONTOLOGIES\/ontology-library\//, '');
      const resp = await fetch(resolvedPath, { cache: 'no-cache' });
      if (resp.ok) {
        const overrideJsonld = await resp.json();
        const overrideSkeleton = parseAppSkeleton(overrideJsonld);
        merged = mergeSkeletonCascade(merged, overrideSkeleton);
      }
    } catch (err) {
      console.warn(`[app-skeleton] Failed to load override: ${overridePath}`, err.message);
    }
  }

  return { skeleton: merged, source: 'registry' };
}

// ========================================
// REGISTRY BUILDING
// ========================================

/**
 * Build navigation and zone registries from a parsed skeleton.
 * Populates state.navLayerRegistry and state.zoneRegistry.
 *
 * @param {Object} skeleton - Parsed skeleton from parseAppSkeleton or mergeSkeletonCascade
 */
export function buildSkeletonRegistries(skeleton) {
  // Build zone registry: zoneId → { zone, components[] }
  const zoneRegistry = new Map();
  for (const zone of skeleton.zones) {
    const zoneId = zone['ds:zoneId'];
    zoneRegistry.set(zoneId, { zone, components: [] });
  }

  // Attach components to zones
  for (const cmp of skeleton.zoneComponents) {
    const zoneRef = cmp['ds:placedInZone']?.['@id'];
    if (zoneRef) {
      // Find zone by @id
      const zoneEntry = [...zoneRegistry.values()].find(
        entry => entry.zone['@id'] === zoneRef
      );
      if (zoneEntry) {
        zoneEntry.components.push(cmp);
        // Sort by renderOrder
        zoneEntry.components.sort((a, b) => (a['ds:renderOrder'] || 0) - (b['ds:renderOrder'] || 0));
      }
    }
  }

  // Build nav layer registry: layerId → { layer, items[] }
  const navLayerRegistry = new Map();
  for (const layer of skeleton.navLayers) {
    const layerId = layer['ds:layerId'];
    navLayerRegistry.set(layerId, { layer, items: [] });
  }

  // Attach nav items to layers
  for (const item of skeleton.navItems) {
    const layerRef = item['ds:belongsToLayer']?.['@id'];
    if (layerRef) {
      const layerEntry = [...navLayerRegistry.values()].find(
        entry => entry.layer['@id'] === layerRef
      );
      if (layerEntry) {
        layerEntry.items.push(item);
        // Sort by renderOrder
        layerEntry.items.sort((a, b) => (a['ds:renderOrder'] || 0) - (b['ds:renderOrder'] || 0));
      }
    }
  }

  // Build action index: @id → Action entity (from ds:Action entities in skeleton)
  const actionIndex = new Map();
  for (const action of (skeleton.actions || [])) {
    actionIndex.set(action['@id'], action);
  }

  // Build zone DOM selector index: zoneId → CSS selector (from ds:domSelector)
  const zoneDomSelectors = new Map();
  for (const zone of skeleton.zones) {
    if (zone['ds:domSelector']) {
      zoneDomSelectors.set(zone['ds:zoneId'], zone['ds:domSelector']);
    }
  }

  state.navLayerRegistry = navLayerRegistry;
  state.zoneRegistry = zoneRegistry;
  state.actionIndex = actionIndex;
  state.zoneDomSelectors = zoneDomSelectors;
}

// ========================================
// DOM RENDERING
// ========================================

/**
 * Wire a click/change handler on a NavItem element using ontology-driven Action resolution.
 *
 * New signature (ontology-driven):
 *   wireAction(element, navItem, actionIndex)
 *   - Resolves ds:executesAction → Action entity → window[functionRef]
 *   - Checks guardCondition before execution
 *   - Auto-calls syncDynamicNavState if triggersSyncAfter is true
 *   - Applies accessibilityHint as aria-label
 *
 * Legacy signature (backward compat):
 *   wireAction(element, actionString, registry)
 *   - actionString is a plain string, registry is a plain object { name: fn }
 *
 * @param {HTMLElement} element - The DOM element to wire
 * @param {Object|string} navItemOrActionString - NavItem JSONLD object (new) or action string (legacy)
 * @param {Map|Object} actionIndexOrRegistry - actionIndex Map (new) or ACTION_REGISTRY object (legacy)
 */
export function wireAction(element, navItemOrActionString, actionIndexOrRegistry) {
  if (!element || !navItemOrActionString || !actionIndexOrRegistry) return;

  // Detect legacy vs ontology mode: string = legacy, object = ontology
  if (typeof navItemOrActionString === 'string') {
    return _wireActionLegacy(element, navItemOrActionString, actionIndexOrRegistry);
  }

  const navItem = navItemOrActionString;
  const actionIndex = actionIndexOrRegistry;

  // Resolve Action entity from ds:executesAction reference
  const actionRef = navItem['ds:executesAction']?.['@id'];
  if (!actionRef) {
    // Fallback: try legacy ds:action string on window (deferred resolution)
    const legacyAction = navItem['ds:action'];
    if (legacyAction && legacyAction !== 'noop') {
      const eventType = element.tagName === 'SELECT' ? 'change' : 'click';
      element.addEventListener(eventType, (e) => {
        e.preventDefault();
        const fn = window[legacyAction];
        if (typeof fn === 'function') {
          fn(element.tagName === 'SELECT' ? element.value : undefined);
        } else {
          console.warn(`[DynNav] window.${legacyAction} not available at click time`);
        }
      });
    }
    return;
  }

  const actionEntity = actionIndex.get(actionRef);
  if (!actionEntity) {
    console.warn(`[DynNav] Action entity not found: "${actionRef}"`);
    return;
  }

  const functionRef = actionEntity['ds:functionRef'];
  if (!functionRef || functionRef === 'noop') return;

  // Mark element as wired for diagnostics
  element.dataset.wired = 'true';
  element.dataset.functionRef = functionRef;

  // Apply accessibility hint
  const hint = actionEntity['ds:accessibilityHint'];
  if (hint) element.setAttribute('aria-label', hint);

  const guardCondition = actionEntity['ds:guardCondition'];
  const guardMessage = actionEntity['ds:guardMessage'] || 'Action not available';
  const triggersSyncAfter = actionEntity['ds:triggersSyncAfter'] === true;
  const parameterType = actionEntity['ds:parameterType'];

  const eventType = element.tagName === 'SELECT' ? 'change' : 'click';

  // Deferred resolution — resolve window[functionRef] at click time, not wire time.
  // This ensures handlers work even when wireAction runs before all modules
  // have finished registering their window.* exports.
  element.addEventListener(eventType, (e) => {
    e.preventDefault();
    console.log(`[DynNav] Click: ${functionRef} (action: ${actionRef})`);

    const handler = window[functionRef];
    if (typeof handler !== 'function') {
      console.warn(`[DynNav] window.${functionRef} is not a function (action: ${actionRef})`);
      return;
    }

    // Guard check
    if (guardCondition) {
      const allowed = evaluateCondition(guardCondition, state);
      if (!allowed) {
        alert(guardMessage);
        return;
      }
    }

    // Execute based on parameter type
    if (element.tagName === 'SELECT' || parameterType === 'Select') {
      handler(element.value);
    } else if (parameterType === 'String') {
      // Colon syntax from legacy ds:action (e.g. "setViewMode:graph")
      const legacyAction = navItem['ds:action'] || '';
      const colonIdx = legacyAction.indexOf(':');
      const param = colonIdx > -1 ? legacyAction.substring(colonIdx + 1) : undefined;
      handler(param);
    } else {
      handler();
    }

    // Auto-sync after execution if flagged
    if (triggersSyncAfter && typeof syncDynamicNavState === 'function') {
      syncDynamicNavState(state);
    }
  });
}

/**
 * Legacy wireAction path — string-based action + plain object registry.
 * @private
 */
function _wireActionLegacy(element, actionString, registry) {
  const colonIdx = actionString.indexOf(':');
  const actionName = colonIdx > -1 ? actionString.substring(0, colonIdx) : actionString;
  const param = colonIdx > -1 ? actionString.substring(colonIdx + 1) : undefined;

  const handler = registry[actionName];
  if (!handler) {
    console.warn(`[DynNav] No handler on window for action: "${actionName}"`);
    return;
  }

  const eventType = element.tagName === 'SELECT' ? 'change' : 'click';

  element.addEventListener(eventType, (e) => {
    e.preventDefault();
    if (element.tagName === 'SELECT') {
      handler(element.value);
    } else {
      handler(param);
    }
  });
}

/**
 * Render toolbar navigation from the skeleton's NavLayer/NavItem data.
 * Builds DOM elements dynamically based on skeleton data.
 *
 * Supports multi-zone rendering: layers with ds:navLayerInZone are routed
 * to the matching container in the zoneContainerMap. Layers without a zone
 * assignment (or whose zone has no container) go to the default container.
 *
 * @param {Object} skeleton - Parsed/merged skeleton
 * @param {HTMLElement|Map<string,HTMLElement>} containerOrMap - Single container (backward compat) or zoneId→container map
 * @param {Object|Map} [actionRegistryOrIndex] - ACTION_REGISTRY object (legacy) or actionIndex Map (ontology-driven)
 */
export function renderNavFromSkeleton(skeleton, containerOrMap, actionRegistryOrIndex) {
  if (!containerOrMap || !skeleton?.navLayers?.length) return;

  // Normalise to a zone→container map. Single element = default container.
  const isMap = containerOrMap instanceof Map;
  const defaultContainer = isMap ? containerOrMap.get('default') : containerOrMap;
  const zoneContainerMap = isMap ? containerOrMap : new Map([['default', containerOrMap]]);

  // Build a zone @id → zoneId lookup from the skeleton zones
  const zoneIdByRef = new Map();
  for (const zone of (skeleton.zones || [])) {
    zoneIdByRef.set(zone['@id'], zone['ds:zoneId']);
  }

  // Sort layers by renderOrder
  const sortedLayers = [...skeleton.navLayers].sort(
    (a, b) => (a['ds:renderOrder'] || 0) - (b['ds:renderOrder'] || 0)
  );

  // Get items grouped by layer
  const itemsByLayer = new Map();
  for (const item of skeleton.navItems) {
    const layerRef = item['ds:belongsToLayer']?.['@id'];
    if (!layerRef) continue;
    if (!itemsByLayer.has(layerRef)) itemsByLayer.set(layerRef, []);
    itemsByLayer.get(layerRef).push(item);
  }

  // Sort items within each layer
  for (const [, items] of itemsByLayer) {
    items.sort((a, b) => (a['ds:renderOrder'] || 0) - (b['ds:renderOrder'] || 0));
  }

  // Group fragments by target container
  const fragmentsByContainer = new Map();

  for (const layer of sortedLayers) {
    const layerId = layer['ds:layerId'];
    const layerName = layer['ds:layerName'] || layerId;

    // Resolve target container from layer's zone assignment
    const zoneRef = layer['ds:navLayerInZone']?.['@id'];
    const zoneId = zoneRef ? zoneIdByRef.get(zoneRef) : null;
    const container = (zoneId && zoneContainerMap.get(zoneId)) || defaultContainer;
    if (!container) continue;

    const layerDiv = document.createElement('div');
    layerDiv.className = `nav-layer nav-layer-${layerId}`;
    layerDiv.dataset.layerId = layerId;
    layerDiv.dataset.layerName = layerName;
    layerDiv.dataset.cascadeTier = layer['ds:cascadeTier'] || 'PFC';
    layerDiv.title = layerName;

    const items = itemsByLayer.get(layer['@id']) || [];

    for (const item of items) {
      const el = createNavItemElement(item, actionRegistryOrIndex);
      if (el) layerDiv.appendChild(el);
    }

    // Only add if layer has items (L4 may be empty at PFC level)
    if (items.length > 0) {
      if (!fragmentsByContainer.has(container)) {
        fragmentsByContainer.set(container, document.createDocumentFragment());
      }
      fragmentsByContainer.get(container).appendChild(layerDiv);
    }
  }

  // Append fragments to their containers
  for (const [container, fragment] of fragmentsByContainer) {
    container.appendChild(fragment);
  }
}

/**
 * Create a DOM element for a single NavItem based on its itemType.
 *
 * @param {Object} item - NavItem JSONLD object
 * @param {Object|Map} [actionRegistryOrIndex] - ACTION_REGISTRY object (legacy) or actionIndex Map (ontology-driven)
 * @returns {HTMLElement|null}
 */
function createNavItemElement(item, actionRegistryOrIndex) {
  const type = item['ds:itemType'];
  const label = item['ds:label'];
  const action = item['ds:action'];
  const icon = item['ds:icon'];
  const shortcut = item['ds:shortcut'];
  const condition = item['ds:visibilityCondition'];
  const enabledCondition = item['ds:enabledCondition'];
  const stateBinding = item['ds:stateBinding'];

  // Detect ontology mode: Map = actionIndex, plain object = legacy registry
  const isOntologyMode = actionRegistryOrIndex instanceof Map;

  let el;

  switch (type) {
    case 'Button':
      el = document.createElement('button');
      el.className = 'nav-item nav-button';
      el.textContent = label;
      el.title = shortcut ? `${label} (${shortcut})` : label;
      if (action) el.dataset.action = action;
      break;

    case 'Toggle':
      el = document.createElement('button');
      el.className = 'nav-item nav-toggle';
      el.textContent = label;
      el.title = shortcut ? `${label} (${shortcut})` : label;
      if (action) el.dataset.action = action;
      el.setAttribute('aria-pressed', 'false');
      break;

    case 'Dropdown': {
      // Wrapper div for dropdown + menu
      el = document.createElement('div');
      el.className = 'nav-item nav-dropdown-wrapper';

      const trigger = document.createElement('button');
      trigger.className = 'nav-dropdown';
      trigger.textContent = label;
      trigger.title = label;
      trigger.setAttribute('aria-haspopup', 'true');
      el.appendChild(trigger);

      // Build sub-menu from ds:children
      const children = item['ds:children'];
      if (Array.isArray(children) && children.length > 0) {
        const menu = document.createElement('div');
        menu.className = 'nav-dropdown-menu';
        menu.style.display = 'none';

        for (const child of children) {
          const childLabel = child['ds:label'];
          const childAction = child['ds:action'];

          if (childLabel === '---') {
            const hr = document.createElement('hr');
            menu.appendChild(hr);
          } else {
            const btn = document.createElement('button');
            btn.textContent = childLabel;
            if (actionRegistryOrIndex) {
              if (isOntologyMode && child['ds:executesAction']) {
                // Ontology mode: wire child as a mini nav item
                wireAction(btn, child, actionRegistryOrIndex);
              } else if (childAction) {
                // Legacy mode or fallback
                wireAction(btn, childAction, actionRegistryOrIndex);
              }
            }
            menu.appendChild(btn);
          }
        }

        el.appendChild(menu);

        // Toggle menu on trigger click
        trigger.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const isOpen = menu.style.display !== 'none';
          menu.style.display = isOpen ? 'none' : 'block';
        });

        // Close on click outside
        document.addEventListener('click', (e) => {
          if (!el.contains(e.target)) {
            menu.style.display = 'none';
          }
        });
      }
      break;
    }

    case 'Select':
      el = document.createElement('select');
      el.className = 'nav-item nav-select';
      el.title = label;
      if (action) el.dataset.action = action;
      // Options populated by app-level code
      /* eslint-disable-next-line no-case-declarations */
      const placeholder = document.createElement('option');
      placeholder.textContent = label;
      placeholder.value = '';
      el.appendChild(placeholder);
      break;

    case 'Chip':
      el = document.createElement('button');
      el.className = 'nav-item nav-chip';
      el.textContent = label;
      el.title = shortcut ? `${label} (${shortcut})` : label;
      if (action) el.dataset.action = action;
      break;

    case 'Separator':
      el = document.createElement('span');
      el.className = 'nav-separator';
      break;

    default:
      return null;
  }

  if (el) {
    el.dataset.itemId = item['ds:itemId'] || '';
    el.dataset.cascadeTier = item['ds:cascadeTier'] || 'PFC';
    if (condition) el.dataset.visibilityCondition = condition;
    if (enabledCondition) el.dataset.enabledCondition = enabledCondition;
    if (stateBinding) el.dataset.stateBinding = stateBinding;
    if (type) el.dataset.itemType = type;

    // Apply optional CSS class from skeleton (e.g. nav-exit-warning)
    const cssClass = item['ds:cssClass'];
    if (cssClass) el.classList.add(cssClass);

    // Wire action handler
    if (actionRegistryOrIndex) {
      if (isOntologyMode) {
        // Ontology mode: pass full navItem + actionIndex Map
        wireAction(el, item, actionRegistryOrIndex);
      } else if (action) {
        // Legacy mode: pass action string + plain object registry
        wireAction(el, action, actionRegistryOrIndex);
      }
    }
  }

  return el;
}

/**
 * Update visibility of skeleton-rendered nav items and zones based on current state.
 * Evaluates visibilityCondition expressions against the app state.
 *
 * @param {Object} stateSnapshot - Current state values to evaluate conditions against
 */
export function updateSkeletonVisibility(stateSnapshot) {
  // Update nav item visibility
  const navItems = document.querySelectorAll('[data-visibility-condition]');
  for (const el of navItems) {
    const condition = el.dataset.visibilityCondition;
    const visible = evaluateCondition(condition, stateSnapshot);
    el.style.display = visible ? '' : 'none';
  }
}

/**
 * Synchronise dynamic nav bar state with current app state.
 * Fully data-driven: reads data-state-binding and data-item-type from DOM elements
 * instead of hardcoded action name checks.
 *
 * - Toggles: evaluateCondition(binding, state) → aria-pressed
 * - Chips: binding === stateSnapshot.currentView → .active class
 * - Buttons with binding: evaluateCondition(binding, state) → disabled attribute
 *
 * @param {Object} stateSnapshot - Current state values: { currentView, isPFIMode, physicsEnabled, authoringMode, ... }
 */
export function syncDynamicNavState(stateSnapshot) {
  // Gather all dynamic nav containers
  const containers = [
    document.getElementById('dynamic-nav-bar'),
    document.getElementById('dynamic-authoring-bar'),
    document.getElementById('dynamic-selection-bar'),
  ].filter(Boolean);
  if (containers.length === 0) return;

  for (const bar of containers) {
    // 1. Chips — data-state-binding holds the view mode value (e.g. "graph", "mermaid")
    const chips = bar.querySelectorAll('.nav-chip');
    for (const chip of chips) {
      const binding = chip.dataset.stateBinding;
      if (binding) {
        chip.classList.toggle('active', binding === stateSnapshot.currentView);
      }
      // Enabled condition — disable chip until precondition met (S40.17b.1)
      const enCond = chip.dataset.enabledCondition;
      if (enCond) {
        const enabled = evaluateCondition(enCond, stateSnapshot);
        chip.disabled = !enabled;
        chip.classList.toggle('disabled', !enabled);
      }
    }

    // 2. Toggles — data-state-binding holds state path (e.g. "state.physicsEnabled")
    const toggles = bar.querySelectorAll('.nav-toggle');
    for (const toggle of toggles) {
      const binding = toggle.dataset.stateBinding;
      if (binding) {
        const pressed = evaluateCondition(binding, stateSnapshot);
        toggle.setAttribute('aria-pressed', String(pressed));
      }
    }

    // 3. Buttons with stateBinding — disabled condition (e.g. "state.authoringUndoLength === 0")
    const buttons = bar.querySelectorAll('.nav-button[data-state-binding]');
    for (const btn of buttons) {
      const binding = btn.dataset.stateBinding;
      if (binding) {
        btn.disabled = evaluateCondition(binding, stateSnapshot);
      }
    }
  }

  // 4. Visibility conditions (applies to all bars)
  updateSkeletonVisibility(stateSnapshot);
}

/**
 * Simple condition evaluator for visibility expressions.
 * Supports: state.prop === value, state.prop !== value, state.prop > 0, etc.
 *
 * @param {string} condition - Expression string like "state.currentView === 'mermaid'"
 * @param {Object} stateSnapshot - State values to evaluate against
 * @returns {boolean}
 */
function evaluateCondition(condition, stateSnapshot) {
  if (!condition) return true;

  try {
    // Safe subset: only allow state.* property access with simple comparisons
    const safeCondition = condition.replace(/state\.(\w+)/g, (_, prop) => {
      const val = stateSnapshot[prop];
      return JSON.stringify(val);
    });
    // eslint-disable-next-line no-new-func
    return new Function(`return (${safeCondition})`)();
  } catch {
    return true; // Default visible on parse error
  }
}

/**
 * Get all zones that should be visible for a given view mode.
 *
 * @param {string} viewMode - Current view mode ('graph', 'mermaid', 'mindmap', 'ds-cascade')
 * @param {Object} stateSnapshot - Current state for condition evaluation
 * @returns {Map<string, Object>} zoneId → zone entry (from zoneRegistry) that should be visible
 */
export function getVisibleZones(viewMode, stateSnapshot) {
  const visible = new Map();
  const snapshot = { ...stateSnapshot, currentView: viewMode };

  for (const [zoneId, entry] of state.zoneRegistry) {
    const zone = entry.zone;
    const isDefault = zone['ds:defaultVisible'] === true;
    const condition = zone['ds:visibilityCondition'];

    if (isDefault || (condition && evaluateCondition(condition, snapshot))) {
      visible.set(zoneId, entry);
    }
  }

  return visible;
}
