/**
 * Skeleton Graph View — F40.22 (Visual Navigation Editor)
 *
 * Renders the application skeleton JSONLD hierarchy as an interactive
 * vis-network hierarchical graph. Provides visual editing of zones,
 * layers, nav items, dropdown children, and action entities.
 *
 * Node hierarchy:
 *   Application → Zone → NavLayer → NavItem → DropdownChild → Action
 *
 * @module skeleton-graph
 */

import { state } from './state.js';

// ========================================
// NODE GROUP DEFINITIONS
// ========================================

const GROUP_APPLICATION = 'application';
const GROUP_ZONE = 'zone';
const GROUP_LAYER = 'layer';
const GROUP_BUTTON = 'navButton';
const GROUP_TOGGLE = 'navToggle';
const GROUP_CHIP = 'navChip';
const GROUP_DROPDOWN = 'navDropdown';
const GROUP_SEPARATOR = 'navSeparator';
const GROUP_CHILD = 'navChild';
const GROUP_ACTION = 'action';

/**
 * vis-network group configuration — colours, shapes, fonts per node type.
 */
export const SKELETON_GROUPS = {
  [GROUP_APPLICATION]: {
    color: { background: '#1a237e', border: '#0d1347', highlight: { background: '#283593', border: '#1a237e' } },
    font: { color: '#fff', size: 16, face: 'Inter, sans-serif', bold: { color: '#fff' } },
    shape: 'box',
    borderWidth: 2,
  },
  [GROUP_ZONE]: {
    color: { background: '#00695c', border: '#004d40', highlight: { background: '#00897b', border: '#00695c' } },
    font: { color: '#fff', size: 13, face: 'Inter, sans-serif' },
    shape: 'box',
    borderWidth: 1,
  },
  [GROUP_LAYER]: {
    color: { background: '#f57f17', border: '#e65100', highlight: { background: '#f9a825', border: '#f57f17' } },
    font: { color: '#fff', size: 12, face: 'Inter, sans-serif' },
    shape: 'box',
    borderWidth: 1,
  },
  [GROUP_BUTTON]: {
    color: { background: '#2e7d32', border: '#1b5e20', highlight: { background: '#43a047', border: '#2e7d32' } },
    font: { color: '#fff', size: 11, face: 'Inter, sans-serif' },
    shape: 'box',
    borderWidth: 1,
  },
  [GROUP_TOGGLE]: {
    color: { background: '#6a1b9a', border: '#4a148c', highlight: { background: '#8e24aa', border: '#6a1b9a' } },
    font: { color: '#fff', size: 11, face: 'Inter, sans-serif' },
    shape: 'box',
    borderWidth: 1,
  },
  [GROUP_CHIP]: {
    color: { background: '#e65100', border: '#bf360c', highlight: { background: '#ef6c00', border: '#e65100' } },
    font: { color: '#fff', size: 11, face: 'Inter, sans-serif' },
    shape: 'box',
    borderWidth: 1,
  },
  [GROUP_DROPDOWN]: {
    color: { background: '#00838f', border: '#006064', highlight: { background: '#0097a7', border: '#00838f' } },
    font: { color: '#fff', size: 11, face: 'Inter, sans-serif' },
    shape: 'box',
    borderWidth: 1,
  },
  [GROUP_SEPARATOR]: {
    color: { background: '#616161', border: '#424242', highlight: { background: '#757575', border: '#616161' } },
    font: { color: '#fff', size: 10, face: 'Inter, sans-serif' },
    shape: 'box',
    borderWidth: 1,
    size: 8,
  },
  [GROUP_CHILD]: {
    color: { background: '#66bb6a', border: '#43a047', highlight: { background: '#81c784', border: '#66bb6a' } },
    font: { color: '#1b5e20', size: 10, face: 'Inter, sans-serif' },
    shape: 'box',
    borderWidth: 1,
  },
  [GROUP_ACTION]: {
    color: { background: '#c62828', border: '#b71c1c', highlight: { background: '#e53935', border: '#c62828' } },
    font: { color: '#fff', size: 10, face: 'Inter, sans-serif' },
    shape: 'ellipse',
    borderWidth: 1,
  },
};

// ========================================
// GRAPH BUILDING
// ========================================

/**
 * Map a NavItem itemType to its vis-network group.
 * @param {string} itemType - ds:itemType value
 * @returns {string} group name
 */
export function itemTypeToGroup(itemType) {
  switch (itemType) {
    case 'Button': return GROUP_BUTTON;
    case 'Toggle': return GROUP_TOGGLE;
    case 'Chip': return GROUP_CHIP;
    case 'Dropdown': return GROUP_DROPDOWN;
    case 'Select': return GROUP_DROPDOWN;
    case 'Separator': return GROUP_SEPARATOR;
    default: return GROUP_BUTTON;
  }
}

/**
 * Build vis-network node and edge arrays from a parsed skeleton.
 *
 * @param {Object} skeleton - Parsed skeleton from parseAppSkeleton / mergeSkeletonCascade
 * @param {Object} [options] - Build options
 * @param {boolean} [options.showActions=false] - Include Action entity nodes
 * @returns {{ nodes: Array, edges: Array }}
 */
export function buildSkeletonGraph(skeleton, options = {}) {
  const { showActions = false } = options;
  const nodes = [];
  const edges = [];

  if (!skeleton) return { nodes, edges };

  // --- Application root ---
  const app = skeleton.application;
  const appId = app?.['@id'] || 'ds:app-root';
  const appLabel = app?.['ds:applicationName'] || app?.['ds:name'] || 'Application';
  const appVersion = app?.['ds:version'] || '';

  nodes.push({
    id: appId,
    label: appVersion ? `${appLabel}\nv${appVersion}` : appLabel,
    group: GROUP_APPLICATION,
    level: 0,
    title: `Application: ${appLabel}`,
    _type: 'application',
    _data: app,
  });

  // --- Zones ---
  // Build zone @id → zoneId lookup
  const zoneRefToId = new Map();
  for (const zone of (skeleton.zones || [])) {
    zoneRefToId.set(zone['@id'], zone['ds:zoneId']);
  }

  for (const zone of (skeleton.zones || [])) {
    const zoneId = zone['@id'];
    const zoneLabel = zone['ds:zoneId'] || zoneId;
    const zoneName = zone['ds:zoneName'] || zoneLabel;

    nodes.push({
      id: zoneId,
      label: zoneLabel,
      group: GROUP_ZONE,
      level: 1,
      title: `Zone: ${zoneName}\nType: ${zone['ds:zoneType'] || 'unknown'}\nSelector: ${zone['ds:domSelector'] || 'none'}`,
      _type: 'zone',
      _data: zone,
    });

    edges.push({
      from: appId,
      to: zoneId,
      label: 'hasZone',
      color: { color: '#1a237e', opacity: 0.6 },
      width: 2,
      arrows: 'to',
    });
  }

  // --- NavLayers ---
  // Build layer @id → layerId lookup
  const layerRefToId = new Map();
  for (const layer of (skeleton.navLayers || [])) {
    layerRefToId.set(layer['@id'], layer['ds:layerId']);
  }

  const sortedLayers = [...(skeleton.navLayers || [])].sort(
    (a, b) => (a['ds:layerLevel'] || 0) - (b['ds:layerLevel'] || 0)
  );

  for (const layer of sortedLayers) {
    const layerId = layer['@id'];
    const layerLabel = layer['ds:layerId'] || layerId;
    const layerName = layer['ds:layerName'] || layerLabel;

    // Edge from zone to layer
    const zoneRef = layer['ds:navLayerInZone']?.['@id'];
    const parentZone = zoneRef || appId;

    nodes.push({
      id: layerId,
      label: `${layerLabel}\n${layerName}`,
      group: GROUP_LAYER,
      level: 2,
      title: `Layer: ${layerName}\nLevel: ${layer['ds:layerLevel'] || 0}\nTier: ${layer['ds:cascadeTier'] || 'PFC'}`,
      _type: 'layer',
      _data: layer,
      _zoneParent: parentZone,
    });
    edges.push({
      from: parentZone,
      to: layerId,
      label: 'containsLayer',
      color: { color: '#00695c', opacity: 0.6 },
      width: 1.5,
      arrows: 'to',
      dashes: false,
    });
  }

  // --- NavItems ---
  // Build layer → zone lookup for clustering metadata
  const layerToZone = new Map();
  for (const layer of sortedLayers) {
    const zRef = layer['ds:navLayerInZone']?.['@id'] || appId;
    layerToZone.set(layer['@id'], zRef);
  }

  // Group items by layer ref for ordering
  const itemsByLayer = new Map();
  for (const item of (skeleton.navItems || [])) {
    const layerRef = item['ds:belongsToLayer']?.['@id'];
    if (!layerRef) continue;
    if (!itemsByLayer.has(layerRef)) itemsByLayer.set(layerRef, []);
    itemsByLayer.get(layerRef).push(item);
  }
  for (const [, items] of itemsByLayer) {
    items.sort((a, b) => (a['ds:renderOrder'] || 0) - (b['ds:renderOrder'] || 0));
  }

  for (const item of (skeleton.navItems || [])) {
    const itemId = item['@id'];
    const itemType = item['ds:itemType'] || 'Button';
    const label = item['ds:label'] || item['ds:itemId'] || itemId;
    const group = itemTypeToGroup(itemType);

    const layerRef = item['ds:belongsToLayer']?.['@id'];
    const itemZoneParent = layerRef ? (layerToZone.get(layerRef) || appId) : appId;

    nodes.push({
      id: itemId,
      label: itemType === 'Separator' ? '---' : label,
      group,
      level: 3,
      title: `NavItem: ${label}\nType: ${itemType}\nAction: ${item['ds:action'] || 'none'}\nTier: ${item['ds:cascadeTier'] || 'PFC'}`,
      _type: 'navItem',
      _itemType: itemType,
      _data: item,
      _zoneParent: itemZoneParent,
    });

    // Edge from layer to item
    if (layerRef) {
      edges.push({
        from: layerRef,
        to: itemId,
        color: { color: '#f57f17', opacity: 0.5 },
        width: 1,
        arrows: 'to',
      });
    }

    // --- Dropdown children ---
    const children = item['ds:children'];
    if (Array.isArray(children) && children.length > 0) {
      children.forEach((child, idx) => {
        const childId = `${itemId}__child_${idx}`;
        const childLabel = child['ds:label'] || '---';
        const isSep = childLabel === '---';

        nodes.push({
          id: childId,
          label: isSep ? '---' : childLabel,
          group: isSep ? GROUP_SEPARATOR : GROUP_CHILD,
          level: 4,
          title: isSep ? 'Separator' : `Child: ${childLabel}\nAction: ${child['ds:action'] || 'none'}`,
          _type: 'dropdownChild',
          _parentItemId: itemId,
          _childIndex: idx,
          _data: child,
          _zoneParent: itemZoneParent,
        });

        edges.push({
          from: itemId,
          to: childId,
          dashes: [5, 5],
          color: { color: '#2e7d32', opacity: 0.5 },
          width: 1,
          arrows: 'to',
        });

        // Action edge from child
        if (showActions && child['ds:executesAction']) {
          const actionRef = child['ds:executesAction']?.['@id'];
          if (actionRef) {
            edges.push({
              from: childId,
              to: actionRef,
              dashes: [2, 4],
              color: { color: '#c62828', opacity: 0.4 },
              width: 1,
              arrows: 'to',
              label: 'executesAction',
            });
          }
        }
      });
    }

    // Action edge from navItem
    if (showActions && item['ds:executesAction']) {
      const actionRef = item['ds:executesAction']?.['@id'];
      if (actionRef) {
        edges.push({
          from: itemId,
          to: actionRef,
          dashes: [2, 4],
          color: { color: '#c62828', opacity: 0.4 },
          width: 1,
          arrows: 'to',
          label: 'executesAction',
        });
      }
    }
  }

  // --- Action entities (optional) ---
  if (showActions) {
    for (const action of (skeleton.actions || [])) {
      const actionId = action['@id'];
      const funcRef = action['ds:functionRef'] || '';
      const paramType = action['ds:parameterType'] || 'None';
      const label = funcRef || actionId;

      nodes.push({
        id: actionId,
        label,
        group: GROUP_ACTION,
        level: 5,
        title: `Action: ${actionId}\nFunction: ${funcRef}\nParam: ${paramType}\nGuard: ${action['ds:guardCondition'] || 'none'}\nSync: ${action['ds:triggersSyncAfter'] || false}`,
        _type: 'action',
        _data: action,
      });
    }
  }

  return { nodes, edges };
}

// ========================================
// RENDERING
// ========================================

/**
 * Render the skeleton graph into a container element.
 *
 * @param {HTMLElement} container - DOM element to render into
 * @param {Object} skeleton - Parsed skeleton
 * @param {Object} [options] - Render options
 * @param {boolean} [options.showActions=false] - Show Action entity nodes
 * @param {string} [options.direction='UD'] - Layout direction: 'UD' or 'LR'
 * @param {Function} [options.onSelectNode] - Callback when node is clicked: (nodeData) => void
 * @param {Function} [options.onContext] - Callback for right-click: (nodeData, event) => void
 * @param {Function} [options.onDragEnd] - Callback when drag ends on a node: (nodeId, targetNodeId) => void
 * @returns {{ network: Object, nodesDataSet: Object, edgesDataSet: Object }}
 */
export function renderSkeletonGraph(container, skeleton, options = {}) {
  const { showActions = false, direction = 'UD', onSelectNode, onContext, onDragEnd } = options;

  const { nodes, edges } = buildSkeletonGraph(skeleton, { showActions });

  const nodesDataSet = new vis.DataSet(nodes);
  const edgesDataSet = new vis.DataSet(edges);

  const networkOptions = {
    groups: SKELETON_GROUPS,
    layout: {
      hierarchical: {
        enabled: true,
        direction,
        sortMethod: 'directed',
        levelSeparation: 100,
        nodeSpacing: 60,
        treeSpacing: 80,
        blockShifting: true,
        edgeMinimization: true,
        parentCentralization: true,
      },
    },
    physics: { enabled: false },
    interaction: {
      dragNodes: true,
      hover: true,
      multiselect: false,
      tooltipDelay: 200,
    },
    edges: {
      smooth: {
        type: 'cubicBezier',
        forceDirection: direction === 'UD' ? 'vertical' : 'horizontal',
      },
      font: { size: 9, color: '#999', strokeWidth: 0 },
    },
    nodes: {
      margin: { top: 6, bottom: 6, left: 10, right: 10 },
    },
  };

  const network = new vis.Network(container, { nodes: nodesDataSet, edges: edgesDataSet }, networkOptions);

  // --- Event Handlers ---

  // Click → select node, fire callback
  network.on('click', (params) => {
    if (params.nodes.length > 0 && onSelectNode) {
      const nodeId = params.nodes[0];
      const nodeData = nodesDataSet.get(nodeId);
      onSelectNode(nodeData);
    }
  });

  // Right-click → context menu callback
  network.on('oncontext', (params) => {
    params.event.preventDefault();
    if (onContext) {
      const nodeId = network.getNodeAt(params.pointer.DOM);
      if (nodeId) {
        const nodeData = nodesDataSet.get(nodeId);
        onContext(nodeData, params.event);
      } else {
        // Right-click on canvas background
        onContext(null, params.event);
      }
    }
  });

  // Drag end → reparent callback
  if (onDragEnd) {
    network.on('dragEnd', (params) => {
      if (params.nodes.length > 0) {
        const draggedId = params.nodes[0];
        // Find what node is at the drop position
        const dropPosition = params.pointer.DOM;
        const targetId = network.getNodeAt(dropPosition);
        if (targetId && targetId !== draggedId) {
          onDragEnd(draggedId, targetId);
        }
      }
    });
  }

  return { network, nodesDataSet, edgesDataSet };
}

// ========================================
// CONTEXT MENU
// ========================================

let _activeContextMenu = null;

/**
 * Show a context menu at the given position for the given node.
 *
 * @param {Object|null} nodeData - The vis-network node data (null = canvas background)
 * @param {MouseEvent} event - The right-click event
 * @param {Object} callbacks - Menu action callbacks
 */
export function showContextMenu(nodeData, event, callbacks) {
  dismissContextMenu();

  const menu = document.createElement('div');
  menu.className = 'skeleton-context-menu';
  menu.style.position = 'fixed';
  menu.style.left = event.clientX + 'px';
  menu.style.top = event.clientY + 'px';
  menu.style.zIndex = '10000';

  const items = _getMenuItems(nodeData, callbacks);
  for (const item of items) {
    if (item.separator) {
      const hr = document.createElement('hr');
      menu.appendChild(hr);
    } else {
      const btn = document.createElement('button');
      btn.textContent = item.label;
      btn.className = 'skeleton-context-menu-item';
      if (item.disabled) btn.disabled = true;
      btn.addEventListener('click', () => {
        dismissContextMenu();
        if (item.action) item.action();
      });
      menu.appendChild(btn);
    }
  }

  document.body.appendChild(menu);
  _activeContextMenu = menu;

  // Close on click outside or Escape
  const closeHandler = (e) => {
    if (!menu.contains(e.target)) {
      dismissContextMenu();
      document.removeEventListener('click', closeHandler);
    }
  };
  const escHandler = (e) => {
    if (e.key === 'Escape') {
      dismissContextMenu();
      document.removeEventListener('keydown', escHandler);
    }
  };
  // Defer to avoid immediately closing from the right-click event
  setTimeout(() => {
    document.addEventListener('click', closeHandler);
    document.addEventListener('keydown', escHandler);
  }, 0);
}

/**
 * Dismiss any open context menu.
 */
export function dismissContextMenu() {
  if (_activeContextMenu && _activeContextMenu.parentNode) {
    _activeContextMenu.parentNode.removeChild(_activeContextMenu);
  }
  _activeContextMenu = null;
}

/**
 * Build menu items for a given node type.
 * @private
 */
function _getMenuItems(nodeData, cb) {
  if (!nodeData) {
    // Canvas background
    return [
      { label: 'Fit View', action: cb.fitView },
    ];
  }

  const type = nodeData._type;

  switch (type) {
    case 'application':
      return [
        { label: 'Expand All', action: cb.expandAll },
        { label: 'Collapse All', action: cb.collapseAll },
        { separator: true },
        { label: 'Fit View', action: cb.fitView },
      ];

    case 'zone':
      return [
        { label: 'Add Layer', action: () => cb.addLayer?.(nodeData) },
        { separator: true },
        { label: 'Fit View', action: cb.fitView },
      ];

    case 'layer':
      return [
        { label: 'Add Button', action: () => cb.addNavItem?.(nodeData, 'Button') },
        { label: 'Add Toggle', action: () => cb.addNavItem?.(nodeData, 'Toggle') },
        { label: 'Add Chip', action: () => cb.addNavItem?.(nodeData, 'Chip') },
        { label: 'Add Dropdown', action: () => cb.addNavItem?.(nodeData, 'Dropdown') },
        { label: 'Add Separator', action: () => cb.addNavItem?.(nodeData, 'Separator') },
        { separator: true },
        { label: 'Move to Zone...', action: () => cb.moveLayerToZone?.(nodeData) },
      ];

    case 'navItem': {
      const items = [
        { label: 'Edit Properties', action: () => cb.editProperties?.(nodeData) },
      ];
      if (nodeData._itemType === 'Dropdown') {
        items.push({ label: 'Add Child Item', action: () => cb.addDropdownChild?.(nodeData) });
        items.push({ label: 'Add Child Separator', action: () => cb.addDropdownSeparator?.(nodeData) });
      }
      items.push({ separator: true });
      items.push({ label: 'Move to Layer...', action: () => cb.moveToLayer?.(nodeData) });
      items.push({ label: 'Delete', action: () => cb.deleteNavItem?.(nodeData) });
      return items;
    }

    case 'dropdownChild':
      return [
        { label: 'Edit Properties', action: () => cb.editProperties?.(nodeData) },
        { separator: true },
        { label: 'Delete', action: () => cb.deleteDropdownChild?.(nodeData) },
      ];

    case 'action':
      return [
        { label: 'Edit Properties', action: () => cb.editProperties?.(nodeData) },
        { separator: true },
        { label: 'Delete', action: () => cb.deleteAction?.(nodeData) },
      ];

    default:
      return [];
  }
}

// ========================================
// FLOATING TOOLBAR
// ========================================

/**
 * Create the floating toolbar for the skeleton graph view.
 *
 * @param {HTMLElement} parent - Container element to append toolbar to
 * @param {Object} callbacks - Button action callbacks
 * @returns {HTMLElement} The toolbar element
 */
export function createSkeletonToolbar(parent, callbacks) {
  const toolbar = document.createElement('div');
  toolbar.className = 'skeleton-graph-toolbar';
  toolbar.id = 'skeleton-graph-toolbar';

  const buttons = [
    { label: 'Actions', title: 'Toggle Action entity nodes', action: callbacks.toggleActions, toggle: true, id: 'skel-btn-actions' },
    { label: 'UD', title: 'Switch layout direction (UD/LR)', action: callbacks.toggleDirection, id: 'skel-btn-direction' },
    { label: 'Fit', title: 'Fit graph to view', action: callbacks.fitView },
    { label: 'Collapse', title: 'Collapse to zone level', action: callbacks.collapseAll },
    { label: 'Expand', title: 'Expand all clusters', action: callbacks.expandAll },
    { sep: true },
    { label: 'New', title: 'Create blank skeleton', action: callbacks.newSkeleton },
    { label: 'Export', title: 'Export skeleton as JSONLD', action: callbacks.exportJsonld },
  ];

  for (const btn of buttons) {
    if (btn.sep) {
      const sep = document.createElement('span');
      sep.className = 'skeleton-toolbar-sep';
      toolbar.appendChild(sep);
      continue;
    }
    const el = document.createElement('button');
    el.className = 'skeleton-toolbar-btn';
    el.textContent = btn.label;
    el.title = btn.title || '';
    if (btn.id) el.id = btn.id;
    if (btn.toggle) el.dataset.toggled = 'false';
    el.addEventListener('click', () => {
      if (btn.toggle) {
        const toggled = el.dataset.toggled === 'true';
        el.dataset.toggled = String(!toggled);
        el.classList.toggle('active', !toggled);
      }
      btn.action?.();
    });
    toolbar.appendChild(el);
  }

  parent.appendChild(toolbar);
  return toolbar;
}

// ========================================
// GRAPH REFRESH (after mutation)
// ========================================

/**
 * Refresh the skeleton graph in-place after a mutation.
 * Rebuilds node/edge DataSets without destroying the network.
 *
 * @param {Object} nodesDataSet - Current vis.DataSet for nodes
 * @param {Object} edgesDataSet - Current vis.DataSet for edges
 * @param {Object} skeleton - Updated skeleton data
 * @param {Object} [options] - Build options (showActions, etc.)
 */
export function refreshSkeletonGraph(nodesDataSet, edgesDataSet, skeleton, options = {}) {
  const { nodes, edges } = buildSkeletonGraph(skeleton, options);

  nodesDataSet.clear();
  nodesDataSet.add(nodes);

  edgesDataSet.clear();
  edgesDataSet.add(edges);
}
