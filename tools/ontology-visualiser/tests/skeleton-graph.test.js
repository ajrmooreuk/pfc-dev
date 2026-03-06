/**
 * Unit tests for skeleton-graph.js — graph building, node/edge generation,
 * context menu, toolbar, and refresh.
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock state.js
vi.mock('../js/state.js', () => ({
  state: {
    appSkeleton: null,
    _skeletonShowActions: false,
    _skeletonDirection: 'UD',
    _skeletonSelectedNode: null,
  },
}));

import {
  buildSkeletonGraph,
  SKELETON_GROUPS,
  showContextMenu,
  dismissContextMenu,
  createSkeletonToolbar,
  refreshSkeletonGraph,
  itemTypeToGroup,
} from '../js/skeleton-graph.js';

// --- Fixtures ---

function makeMinimalSkeleton() {
  return {
    application: {
      '@id': 'ds:app-test',
      '@type': 'ds:Application',
      'ds:appName': 'Test App',
    },
    zones: [
      {
        '@id': 'ds:zone-Z1',
        '@type': 'ds:AppZone',
        'ds:zoneId': 'Z1',
        'ds:zoneName': 'Header',
        'ds:zoneType': 'Fixed',
        'ds:position': 'top',
        'ds:defaultWidth': '100%',
        'ds:defaultVisible': true,
        'ds:cascadeTier': 'PFC',
      },
      {
        '@id': 'ds:zone-Z2',
        '@type': 'ds:AppZone',
        'ds:zoneId': 'Z2',
        'ds:zoneName': 'Toolbar',
        'ds:zoneType': 'Fixed',
        'ds:position': 'top',
        'ds:defaultWidth': '100%',
        'ds:defaultVisible': true,
        'ds:cascadeTier': 'PFC',
      },
    ],
    navLayers: [
      {
        '@id': 'ds:layer-L1-core',
        '@type': 'ds:NavLayer',
        'ds:layerId': 'L1-core',
        'ds:layerName': 'Core Capabilities',
        'ds:layerLevel': 1,
        'ds:renderOrder': 1,
        'ds:cascadeTier': 'PFC',
        'ds:navLayerInZone': { '@id': 'ds:zone-Z2' },
      },
    ],
    navItems: [
      {
        '@id': 'ds:nav-L1-audit',
        '@type': 'ds:NavItem',
        'ds:itemId': 'nav-L1-audit',
        'ds:label': 'Audit',
        'ds:itemType': 'Button',
        'ds:action': 'toggleAuditPanel',
        'ds:renderOrder': 1,
        'ds:cascadeTier': 'PFC',
        'ds:belongsToLayer': { '@id': 'ds:layer-L1-core' },
        'ds:executesAction': { '@id': 'ds:action-toggleAuditPanel' },
      },
      {
        '@id': 'ds:nav-L1-library',
        '@type': 'ds:NavItem',
        'ds:itemId': 'nav-L1-library',
        'ds:label': 'Library',
        'ds:itemType': 'Button',
        'ds:renderOrder': 2,
        'ds:cascadeTier': 'PFC',
        'ds:belongsToLayer': { '@id': 'ds:layer-L1-core' },
      },
      {
        '@id': 'ds:nav-L1-views',
        '@type': 'ds:NavItem',
        'ds:itemId': 'nav-L1-views',
        'ds:label': 'Views',
        'ds:itemType': 'Dropdown',
        'ds:renderOrder': 3,
        'ds:cascadeTier': 'PFC',
        'ds:belongsToLayer': { '@id': 'ds:layer-L1-core' },
        'ds:children': [
          { 'ds:label': 'Graph', 'ds:action': 'setViewMode:graph' },
          { 'ds:label': 'Mermaid', 'ds:action': 'setViewMode:mermaid' },
          { 'ds:label': '---' },
        ],
      },
      {
        '@id': 'ds:nav-L1-sep',
        '@type': 'ds:NavItem',
        'ds:itemId': 'nav-L1-sep',
        'ds:label': '---',
        'ds:itemType': 'Separator',
        'ds:renderOrder': 4,
        'ds:cascadeTier': 'PFC',
        'ds:belongsToLayer': { '@id': 'ds:layer-L1-core' },
      },
    ],
    actions: [
      {
        '@id': 'ds:action-toggleAuditPanel',
        '@type': 'ds:Action',
        'ds:functionRef': 'toggleAuditPanel',
        'ds:parameterType': 'None',
        'ds:triggersSyncAfter': true,
      },
      {
        '@id': 'ds:action-toggleLibraryPanel',
        '@type': 'ds:Action',
        'ds:functionRef': 'toggleLibraryPanel',
        'ds:parameterType': 'None',
      },
    ],
  };
}

// --- Tests ---

describe('SKELETON_GROUPS', () => {
  it('defines expected node group keys', () => {
    const keys = Object.keys(SKELETON_GROUPS);
    expect(keys).toContain('application');
    expect(keys).toContain('zone');
    expect(keys).toContain('layer');
    expect(keys).toContain('navButton');
    expect(keys).toContain('navToggle');
    expect(keys).toContain('navChip');
    expect(keys).toContain('navDropdown');
    expect(keys).toContain('navSeparator');
    expect(keys).toContain('navChild');
    expect(keys).toContain('action');
  });

  it('each group has color and shape', () => {
    for (const [, g] of Object.entries(SKELETON_GROUPS)) {
      expect(g).toHaveProperty('color');
      expect(g).toHaveProperty('shape');
    }
  });
});

describe('itemTypeToGroup', () => {
  it('maps Button to navButton', () => expect(itemTypeToGroup('Button')).toBe('navButton'));
  it('maps Toggle to navToggle', () => expect(itemTypeToGroup('Toggle')).toBe('navToggle'));
  it('maps Chip to navChip', () => expect(itemTypeToGroup('Chip')).toBe('navChip'));
  it('maps Dropdown to navDropdown', () => expect(itemTypeToGroup('Dropdown')).toBe('navDropdown'));
  it('maps Separator to navSeparator', () => expect(itemTypeToGroup('Separator')).toBe('navSeparator'));
  it('defaults to navButton for unknown types', () => expect(itemTypeToGroup('Custom')).toBe('navButton'));
});

describe('buildSkeletonGraph', () => {
  let skeleton;

  beforeEach(() => {
    skeleton = makeMinimalSkeleton();
  });

  it('returns nodes and edges arrays', () => {
    const { nodes, edges } = buildSkeletonGraph(skeleton);
    expect(Array.isArray(nodes)).toBe(true);
    expect(Array.isArray(edges)).toBe(true);
  });

  it('creates application root node', () => {
    const { nodes } = buildSkeletonGraph(skeleton);
    const app = nodes.find(n => n._type === 'application');
    expect(app).toBeDefined();
    expect(app.group).toBe('application');
    expect(app.level).toBe(0);
  });

  it('creates zone nodes', () => {
    const { nodes } = buildSkeletonGraph(skeleton);
    const zones = nodes.filter(n => n._type === 'zone');
    expect(zones).toHaveLength(2);
    expect(zones[0].group).toBe('zone');
    expect(zones[0].level).toBe(1);
  });

  it('creates layer nodes with _zoneParent', () => {
    const { nodes } = buildSkeletonGraph(skeleton);
    const layers = nodes.filter(n => n._type === 'layer');
    expect(layers).toHaveLength(1);
    expect(layers[0].group).toBe('layer');
    expect(layers[0].level).toBe(2);
    expect(layers[0]._zoneParent).toBe('ds:zone-Z2');
  });

  it('creates navItem nodes with correct groups', () => {
    const { nodes } = buildSkeletonGraph(skeleton);
    const items = nodes.filter(n => n._type === 'navItem');
    expect(items).toHaveLength(4);

    const audit = items.find(n => n.id === 'ds:nav-L1-audit');
    expect(audit.group).toBe('navButton');
    expect(audit.level).toBe(3);

    const views = items.find(n => n.id === 'ds:nav-L1-views');
    expect(views.group).toBe('navDropdown');

    const sep = items.find(n => n.id === 'ds:nav-L1-sep');
    expect(sep.group).toBe('navSeparator');
    expect(sep.label).toBe('---');
  });

  it('creates dropdown child nodes', () => {
    const { nodes } = buildSkeletonGraph(skeleton);
    const children = nodes.filter(n => n._type === 'dropdownChild');
    expect(children).toHaveLength(3);
    expect(children[0].label).toBe('Graph');
    expect(children[0].level).toBe(4);
    expect(children[0]._parentItemId).toBe('ds:nav-L1-views');
    expect(children[0]._childIndex).toBe(0);
  });

  it('dropdown separator child uses separator group', () => {
    const { nodes } = buildSkeletonGraph(skeleton);
    const children = nodes.filter(n => n._type === 'dropdownChild');
    const sep = children.find(n => n.label === '---');
    expect(sep.group).toBe('navSeparator');
  });

  it('navItem nodes have _zoneParent', () => {
    const { nodes } = buildSkeletonGraph(skeleton);
    const audit = nodes.find(n => n.id === 'ds:nav-L1-audit');
    expect(audit._zoneParent).toBe('ds:zone-Z2');
  });

  it('dropdown children have _zoneParent from parent item', () => {
    const { nodes } = buildSkeletonGraph(skeleton);
    const children = nodes.filter(n => n._type === 'dropdownChild');
    children.forEach(c => {
      expect(c._zoneParent).toBe('ds:zone-Z2');
    });
  });

  it('excludes action nodes when showActions=false (default)', () => {
    const { nodes } = buildSkeletonGraph(skeleton);
    const actions = nodes.filter(n => n._type === 'action');
    expect(actions).toHaveLength(0);
  });

  it('includes action nodes when showActions=true', () => {
    const { nodes } = buildSkeletonGraph(skeleton, { showActions: true });
    const actions = nodes.filter(n => n._type === 'action');
    expect(actions).toHaveLength(2);
    expect(actions[0].group).toBe('action');
    expect(actions[0].level).toBe(5);
  });

  it('creates executesAction edges when showActions=true', () => {
    const { edges } = buildSkeletonGraph(skeleton, { showActions: true });
    const actionEdges = edges.filter(e => e.label === 'executesAction');
    expect(actionEdges.length).toBeGreaterThan(0);
    const auditActionEdge = actionEdges.find(e => e.from === 'ds:nav-L1-audit');
    expect(auditActionEdge).toBeDefined();
    expect(auditActionEdge.to).toBe('ds:action-toggleAuditPanel');
  });

  it('creates hasZone edges from app to zones', () => {
    const { edges } = buildSkeletonGraph(skeleton);
    const zoneEdges = edges.filter(e => e.label === 'hasZone');
    expect(zoneEdges).toHaveLength(2);
    expect(zoneEdges[0].from).toBe('ds:app-test');
  });

  it('creates containsLayer edges from zone to layer', () => {
    const { edges } = buildSkeletonGraph(skeleton);
    const layerEdges = edges.filter(e => e.label === 'containsLayer');
    expect(layerEdges).toHaveLength(1);
    expect(layerEdges[0].from).toBe('ds:zone-Z2');
    expect(layerEdges[0].to).toBe('ds:layer-L1-core');
  });

  it('creates edges from layer to navItems', () => {
    const { edges } = buildSkeletonGraph(skeleton);
    const itemEdges = edges.filter(e => e.from === 'ds:layer-L1-core');
    expect(itemEdges).toHaveLength(4); // 4 nav items
  });

  it('creates dashed edges from dropdown to children', () => {
    const { edges } = buildSkeletonGraph(skeleton);
    const childEdges = edges.filter(e => e.from === 'ds:nav-L1-views');
    expect(childEdges).toHaveLength(3); // 3 children
    childEdges.forEach(e => {
      expect(e.dashes).toEqual([5, 5]);
    });
  });

  it('handles empty skeleton', () => {
    const { nodes, edges } = buildSkeletonGraph({
      application: { '@id': 'ds:empty', '@type': 'ds:Application' },
      zones: [],
      navLayers: [],
      navItems: [],
      actions: [],
    });
    expect(nodes).toHaveLength(1); // just the app root
    expect(edges).toHaveLength(0);
  });

  it('handles missing optional arrays', () => {
    const { nodes } = buildSkeletonGraph({
      application: { '@id': 'ds:bare' },
    });
    expect(nodes).toHaveLength(1);
  });

  it('total node count matches expected for fixture', () => {
    const { nodes } = buildSkeletonGraph(skeleton);
    // 1 app + 2 zones + 1 layer + 4 navItems + 3 children = 11
    expect(nodes).toHaveLength(11);
  });

  it('total node count with actions', () => {
    const { nodes } = buildSkeletonGraph(skeleton, { showActions: true });
    // 11 + 2 actions = 13
    expect(nodes).toHaveLength(13);
  });
});

describe('showContextMenu', () => {
  beforeEach(() => {
    dismissContextMenu(); // clean up any stale menu
  });

  it('creates a context menu div', () => {
    const nodeData = { _type: 'navItem', _itemType: 'Button', id: 'test' };
    const mockEvent = { pageX: 100, pageY: 200 };
    showContextMenu(nodeData, mockEvent, {});
    const menu = document.querySelector('.skeleton-context-menu');
    expect(menu).toBeTruthy();
  });

  it('includes Add Button option for layer node', () => {
    const nodeData = { _type: 'layer', id: 'ds:layer-L1' };
    const mockEvent = { pageX: 100, pageY: 200 };
    showContextMenu(nodeData, mockEvent, {});
    const menu = document.querySelector('.skeleton-context-menu');
    expect(menu.textContent).toContain('Add Button');
  });

  it('includes Delete option for navItem node', () => {
    const nodeData = { _type: 'navItem', _itemType: 'Button', id: 'test-item' };
    const mockEvent = { pageX: 100, pageY: 200 };
    showContextMenu(nodeData, mockEvent, {});
    const menu = document.querySelector('.skeleton-context-menu');
    expect(menu.textContent).toContain('Delete');
  });

  it('includes Add Child option for dropdown node', () => {
    const nodeData = { _type: 'navItem', _itemType: 'Dropdown', id: 'test-dd' };
    const mockEvent = { pageX: 100, pageY: 200 };
    showContextMenu(nodeData, mockEvent, {});
    const menu = document.querySelector('.skeleton-context-menu');
    expect(menu.textContent).toContain('Add Child');
  });

  it('includes Fit View for application node', () => {
    const nodeData = { _type: 'application', id: 'app-root' };
    const mockEvent = { pageX: 100, pageY: 200 };
    showContextMenu(nodeData, mockEvent, {});
    const menu = document.querySelector('.skeleton-context-menu');
    expect(menu.textContent).toContain('Fit View');
  });

  it('dismissContextMenu removes the menu', () => {
    const nodeData = { _type: 'navItem', _itemType: 'Button', id: 'x' };
    showContextMenu(nodeData, { pageX: 0, pageY: 0 }, {});
    expect(document.querySelector('.skeleton-context-menu')).toBeTruthy();
    dismissContextMenu();
    expect(document.querySelector('.skeleton-context-menu')).toBeNull();
  });
});

describe('createSkeletonToolbar', () => {
  it('creates a toolbar div with buttons', () => {
    const parent = document.createElement('div');
    createSkeletonToolbar(parent, {
      toggleActions: vi.fn(),
      toggleDirection: vi.fn(),
      fitView: vi.fn(),
      collapseAll: vi.fn(),
      expandAll: vi.fn(),
      newSkeleton: vi.fn(),
      exportJsonld: vi.fn(),
    });
    const toolbar = parent.querySelector('.skeleton-graph-toolbar');
    expect(toolbar).toBeTruthy();
    const buttons = toolbar.querySelectorAll('.skeleton-toolbar-btn');
    expect(buttons.length).toBeGreaterThanOrEqual(5);
  });

  it('calls fitView callback when Fit button clicked', () => {
    const parent = document.createElement('div');
    const fitView = vi.fn();
    createSkeletonToolbar(parent, {
      toggleActions: vi.fn(),
      toggleDirection: vi.fn(),
      fitView,
      collapseAll: vi.fn(),
      expandAll: vi.fn(),
      newSkeleton: vi.fn(),
      exportJsonld: vi.fn(),
    });
    const buttons = parent.querySelectorAll('.skeleton-toolbar-btn');
    const fitBtn = [...buttons].find(b => b.textContent === 'Fit');
    expect(fitBtn).toBeTruthy();
    fitBtn.click();
    expect(fitView).toHaveBeenCalled();
  });
});

describe('refreshSkeletonGraph', () => {
  it('replaces DataSet contents', () => {
    const skeleton = makeMinimalSkeleton();
    // Create mock DataSets
    const nodesDS = { clear: vi.fn(), add: vi.fn() };
    const edgesDS = { clear: vi.fn(), add: vi.fn() };

    refreshSkeletonGraph(nodesDS, edgesDS, skeleton, { showActions: false });

    expect(nodesDS.clear).toHaveBeenCalled();
    expect(nodesDS.add).toHaveBeenCalled();
    expect(edgesDS.clear).toHaveBeenCalled();
    expect(edgesDS.add).toHaveBeenCalled();
  });
});
