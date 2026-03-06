/**
 * Unit tests for mindmap-canvas.js — canvas init, node/edge CRUD,
 * serialization, mode switching, lanes, and export.
 * F9F.8 Phase 1 — S9F.8.7 tests.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock state.js
vi.mock('../js/state.js', () => ({
  state: {
    viewMode: 'single',
    activeView: 'graph',
    mindmapMode: false,
    mindmapNetwork: null,
    mindmapNodes: null,
    mindmapEdges: null,
    mindmapActiveWorkspaceId: null,
    mindmapWorkspaceName: '',
    mindmapNodeCounter: 0,
    mindmapEdgeCounter: 0,
    mindmapSelectedNode: null,
    mindmapEdgeMode: false,
    mindmapEdgeSource: null,
    mindmapDirty: false,
    mindmapPropertiesPanelOpen: false,
    libraryDB: null,
  },
  TYPE_COLORS: {
    'class': '#4CAF50', 'core': '#4CAF50', 'framework': '#2196F3',
    'supporting': '#FF9800', 'agent': '#E91E63', 'external': '#9E9E9E',
    'layer': '#00BCD4', 'concept': '#AB47BC', 'default': '#017c75'
  },
  MINDMAP_NODE_TYPES: {
    idea:    { shape: 'ellipse', color: '#9C27B0', border: '#7B1FA2', label: 'Idea' },
    ontRef:  { shape: 'box',     color: null,       border: null,      label: 'Ontology Ref' },
    mermaid: { shape: 'image',   color: null,       border: '#9dfff5', label: 'Mermaid Embed' },
    action:  { shape: 'box',     color: '#FF9800',  border: '#F57C00', label: 'Action Card' },
    lane:    { shape: 'box',     color: 'transparent', border: '#3a3d47', label: 'Lane/Zone' },
  },
  MINDMAP_EDGE_TYPES: [
    'supports', 'implements', 'derives-from', 'challenges', 'informs',
    'depends-on', 'conflicts-with', 'extends', 'refines', 'custom'
  ],
  MINDMAP_LANES: [
    { id: 'ideation',  label: 'Ideation',  color: 'rgba(156,39,176,0.08)' },
    { id: 'analysis',  label: 'Analysis',  color: 'rgba(33,150,243,0.08)' },
    { id: 'design',    label: 'Design',    color: 'rgba(76,175,80,0.08)'  },
    { id: 'execution', label: 'Execution', color: 'rgba(255,152,0,0.08)'  },
  ],
  DB_NAME: 'OntologyVisualizerLibrary',
  DB_VERSION: 4,
  getArchetypeColor: vi.fn((type) => {
    const c = { 'class': '#4CAF50', 'core': '#4CAF50', 'framework': '#2196F3', 'supporting': '#FF9800', 'agent': '#E91E63', 'external': '#9E9E9E', 'layer': '#00BCD4', 'concept': '#AB47BC', 'default': '#017c75' };
    return c[type] || c['default'];
  }),
  getArchetypeShape: vi.fn((type) => {
    const s = { core: 'hexagon', class: 'dot', framework: 'box', supporting: 'triangle', agent: 'star', external: 'diamond', layer: 'square', concept: 'ellipse', default: 'dot' };
    return s[type] || s['default'];
  }),
  getArchetypeSize: vi.fn((type) => {
    const z = { core: 30, class: 20, framework: 22, supporting: 18, agent: 25, external: 16, layer: 22, concept: 18, default: 20 };
    return z[type] || z['default'];
  }),
  getEdgeSemanticColor: vi.fn(() => '#555'),
  refreshArchetypeCache: vi.fn(),
}));

// --- Mock vis.DataSet and vis.Network ---

class MockDataSet {
  constructor(data = []) {
    this._items = new Map();
    for (const item of data) {
      this._items.set(item.id, { ...item });
    }
  }
  add(item) {
    if (Array.isArray(item)) {
      for (const i of item) this._items.set(i.id, { ...i });
    } else {
      this._items.set(item.id, { ...item });
    }
  }
  get(id) {
    if (id === undefined) return [...this._items.values()];
    return this._items.get(id) || null;
  }
  update(item) {
    if (this._items.has(item.id)) {
      this._items.set(item.id, { ...item });
    }
  }
  remove(id) {
    this._items.delete(id);
  }
  clear() {
    this._items.clear();
  }
  get length() {
    return this._items.size;
  }
}

const mockNetworkHandlers = {};
const mockNetwork = {
  on: vi.fn((event, handler) => {
    mockNetworkHandlers[event] = handler;
  }),
  destroy: vi.fn(),
  DOMtoCanvas: vi.fn(({ x, y }) => ({ x, y })),
  getNodeAt: vi.fn(() => null),
  getConnectedEdges: vi.fn(() => []),
  getScale: vi.fn(() => 1),
  getViewPosition: vi.fn(() => ({ x: 0, y: 0 })),
  moveTo: vi.fn(),
  selectNodes: vi.fn(),
  unselectAll: vi.fn(),
  fit: vi.fn(),
};

vi.stubGlobal('vis', {
  DataSet: MockDataSet,
  Network: vi.fn(() => mockNetwork),
});

// --- Mock DOM ---

const mockElements = {};
function resetMockElements() {
  Object.keys(mockElements).forEach(k => delete mockElements[k]);
}

vi.stubGlobal('document', {
  getElementById: vi.fn((id) => {
    if (!mockElements[id]) {
      mockElements[id] = {
        style: {},
        innerHTML: '',
        textContent: '',
        value: '',
        classList: {
          _classes: new Set(),
          add(c) { this._classes.add(c); },
          remove(c) { this._classes.delete(c); },
          contains(c) { return this._classes.has(c); },
        },
        querySelectorAll: vi.fn(() => []),
        addEventListener: vi.fn(),
        appendChild: vi.fn(),
        parentNode: { removeChild: vi.fn() },
      };
    }
    return mockElements[id];
  }),
  createElement: vi.fn(() => ({
    className: '', style: {}, innerHTML: '',
    addEventListener: vi.fn(),
    click: vi.fn(),
  })),
  addEventListener: vi.fn(),
  body: { appendChild: vi.fn() },
});

vi.stubGlobal('prompt', vi.fn(() => 'Edited Label'));
vi.stubGlobal('URL', {
  createObjectURL: vi.fn(() => 'blob:mock'),
  revokeObjectURL: vi.fn(),
});
vi.stubGlobal('Blob', vi.fn(function(parts, options) {
  this.parts = parts;
  this.options = options;
}));
vi.stubGlobal('localStorage', {
  _data: {},
  getItem(k) { return this._data[k] || null; },
  setItem(k, v) { this._data[k] = v; },
  removeItem(k) { delete this._data[k]; },
});

// --- Import module under test ---

import { state } from '../js/state.js';
import {
  initMindmapCanvas,
  addIdeaNode,
  addOntologyRefNode,
  addActionCardNode,
  updateNodeLabel,
  updateNodeData,
  updateActionCard,
  deleteNode,
  getNodeData,
  clearCanvas,
  startEdgeMode,
  cancelEdgeMode,
  completeEdge,
  deleteEdge,
  toggleLanes,
  areLanesVisible,
  serializeWorkspace,
  deserializeWorkspace,
  switchToMindmapMode,
  switchFromMindmapMode,
  exportWorkspaceJSON,
  exportAsMermaidMindmap,
  domToCanvas,
} from '../js/mindmap-canvas.js';

// --- Reset before each test ---

beforeEach(() => {
  state.mindmapMode = false;
  state.mindmapNetwork = null;
  state.mindmapNodes = null;
  state.mindmapEdges = null;
  state.mindmapActiveWorkspaceId = null;
  state.mindmapWorkspaceName = '';
  state.mindmapNodeCounter = 0;
  state.mindmapEdgeCounter = 0;
  state.mindmapSelectedNode = null;
  state.mindmapEdgeMode = false;
  state.mindmapEdgeSource = null;
  state.mindmapDirty = false;
  state.mindmapPropertiesPanelOpen = false;
  state.viewMode = 'single';
  state.activeView = 'graph';
  state.libraryDB = null;

  resetMockElements();
  vi.clearAllMocks();
  localStorage._data = {};
});

// ========================================
// CANVAS INITIALISATION
// ========================================

describe('initMindmapCanvas', () => {
  it('creates vis.Network and DataSets', () => {
    initMindmapCanvas('mindmap-network');
    expect(state.mindmapNodes).toBeInstanceOf(MockDataSet);
    expect(state.mindmapEdges).toBeInstanceOf(MockDataSet);
    expect(state.mindmapNetwork).toBe(mockNetwork);
  });

  it('destroys previous network instance', () => {
    const oldNetwork = { destroy: vi.fn() };
    state.mindmapNetwork = oldNetwork;
    initMindmapCanvas('mindmap-network');
    expect(oldNetwork.destroy).toHaveBeenCalled();
  });

  it('binds click, doubleClick, oncontext, and dragEnd handlers', () => {
    initMindmapCanvas('mindmap-network');
    expect(mockNetwork.on).toHaveBeenCalledWith('click', expect.any(Function));
    expect(mockNetwork.on).toHaveBeenCalledWith('doubleClick', expect.any(Function));
    expect(mockNetwork.on).toHaveBeenCalledWith('oncontext', expect.any(Function));
    expect(mockNetwork.on).toHaveBeenCalledWith('dragEnd', expect.any(Function));
  });

  it('returns early for non-existent container', () => {
    vi.mocked(document.getElementById).mockReturnValueOnce(null);
    initMindmapCanvas('non-existent');
    expect(state.mindmapNetwork).toBeNull();
  });
});

// ========================================
// NODE CRUD
// ========================================

describe('addIdeaNode', () => {
  beforeEach(() => initMindmapCanvas('mindmap-network'));

  it('adds an idea node at the given position', () => {
    const id = addIdeaNode(100, 200);
    expect(id).toBe('mm-1');
    const node = state.mindmapNodes.get('mm-1');
    expect(node.x).toBe(100);
    expect(node.y).toBe(200);
    expect(node.shape).toBe('ellipse');
    expect(node._data.type).toBe('idea');
  });

  it('uses default label "New Idea"', () => {
    addIdeaNode(0, 0);
    expect(state.mindmapNodes.get('mm-1').label).toBe('New Idea');
  });

  it('uses custom label when provided', () => {
    addIdeaNode(0, 0, 'My Thought');
    expect(state.mindmapNodes.get('mm-1').label).toBe('My Thought');
  });

  it('increments node counter', () => {
    addIdeaNode(0, 0);
    addIdeaNode(50, 50);
    expect(state.mindmapNodeCounter).toBe(2);
    expect(state.mindmapNodes.get('mm-2')).toBeTruthy();
  });

  it('marks canvas dirty', () => {
    addIdeaNode(0, 0);
    expect(state.mindmapDirty).toBe(true);
  });
});

describe('addOntologyRefNode', () => {
  beforeEach(() => initMindmapCanvas('mindmap-network'));

  it('adds ontology reference node with entity label', () => {
    const entity = { label: 'Vision', '@type': 'core', '@id': 'pfc:Vision', description: 'Strategic vision' };
    const id = addOntologyRefNode(300, 400, entity, 'pfc-ontology');
    expect(id).toBe('mm-1');
    const node = state.mindmapNodes.get('mm-1');
    expect(node.label).toBe('Vision');
    expect(node.shape).toBe('box');
    expect(node._data.type).toBe('ontRef');
    expect(node._data.namespace).toBe('pfc-ontology');
    expect(node._data.entityType).toBe('core');
  });

  it('falls back to default color for unknown entity type', () => {
    const entity = { label: 'Test', entityType: 'unknown' };
    addOntologyRefNode(0, 0, entity, 'test');
    const node = state.mindmapNodes.get('mm-1');
    expect(node.color.background).toBe('#017c75');
  });
});

describe('addActionCardNode', () => {
  beforeEach(() => initMindmapCanvas('mindmap-network'));

  it('adds action card with default fields', () => {
    const id = addActionCardNode(500, 600);
    const node = state.mindmapNodes.get(id);
    expect(node._data.type).toBe('action');
    expect(node._data.fields.status).toBe('pending');
    expect(node._data.fields.priority).toBe('medium');
  });

  it('sets multi-line HTML label', () => {
    addActionCardNode(0, 0, 'Deploy Service');
    const node = state.mindmapNodes.get('mm-1');
    expect(node.label).toContain('Deploy Service');
    expect(node.label).toContain('status: pending');
  });
});

describe('updateNodeLabel', () => {
  beforeEach(() => initMindmapCanvas('mindmap-network'));

  it('updates the label of an existing node', () => {
    addIdeaNode(0, 0, 'Old');
    updateNodeLabel('mm-1', 'New');
    expect(state.mindmapNodes.get('mm-1').label).toBe('New');
  });

  it('does nothing for non-existent node', () => {
    updateNodeLabel('mm-999', 'Test');
    // No error thrown
  });
});

describe('updateNodeData', () => {
  beforeEach(() => initMindmapCanvas('mindmap-network'));

  it('merges data updates into node _data', () => {
    addIdeaNode(0, 0);
    updateNodeData('mm-1', { notes: 'Hello', custom: 42 });
    const data = state.mindmapNodes.get('mm-1')._data;
    expect(data.notes).toBe('Hello');
    expect(data.custom).toBe(42);
    expect(data.type).toBe('idea');
  });
});

describe('updateActionCard', () => {
  beforeEach(() => initMindmapCanvas('mindmap-network'));

  it('updates action card fields and rebuilds label', () => {
    addActionCardNode(0, 0, 'Task');
    updateActionCard('mm-1', { status: 'done', owner: 'Alice' });
    const node = state.mindmapNodes.get('mm-1');
    expect(node._data.fields.status).toBe('done');
    expect(node._data.fields.owner).toBe('Alice');
    expect(node.label).toContain('done');
    expect(node.label).toContain('Alice');
  });

  it('ignores non-action nodes', () => {
    addIdeaNode(0, 0);
    updateActionCard('mm-1', { status: 'done' });
    // No error, idea node unchanged
    expect(state.mindmapNodes.get('mm-1')._data.type).toBe('idea');
  });
});

describe('deleteNode', () => {
  beforeEach(() => initMindmapCanvas('mindmap-network'));

  it('removes node from DataSet', () => {
    addIdeaNode(0, 0);
    expect(state.mindmapNodes.get('mm-1')).toBeTruthy();
    deleteNode('mm-1');
    expect(state.mindmapNodes.get('mm-1')).toBeNull();
  });

  it('clears selected node if deleted', () => {
    addIdeaNode(0, 0);
    state.mindmapSelectedNode = 'mm-1';
    deleteNode('mm-1');
    expect(state.mindmapSelectedNode).toBeNull();
  });

  it('does nothing for null nodeId', () => {
    deleteNode(null);
    // No error
  });
});

describe('getNodeData', () => {
  beforeEach(() => initMindmapCanvas('mindmap-network'));

  it('returns node data with flattened _data properties', () => {
    addIdeaNode(0, 0, 'Test');
    const data = getNodeData('mm-1');
    expect(data.id).toBe('mm-1');
    expect(data.label).toBe('Test');
    expect(data.type).toBe('idea');
  });

  it('returns null for non-existent node', () => {
    expect(getNodeData('mm-999')).toBeNull();
  });
});

describe('clearCanvas', () => {
  beforeEach(() => initMindmapCanvas('mindmap-network'));

  it('removes all nodes and edges, resets counters', () => {
    addIdeaNode(0, 0);
    addIdeaNode(50, 50);
    clearCanvas();
    expect(state.mindmapNodes.get()).toHaveLength(0);
    expect(state.mindmapEdges.get()).toHaveLength(0);
    expect(state.mindmapNodeCounter).toBe(0);
    expect(state.mindmapEdgeCounter).toBe(0);
    expect(state.mindmapDirty).toBe(false);
  });
});

// ========================================
// EDGE DRAWING
// ========================================

describe('startEdgeMode', () => {
  beforeEach(() => initMindmapCanvas('mindmap-network'));

  it('enables edge mode in state', () => {
    startEdgeMode();
    expect(state.mindmapEdgeMode).toBe(true);
    expect(state.mindmapEdgeSource).toBeNull();
  });
});

describe('cancelEdgeMode', () => {
  beforeEach(() => initMindmapCanvas('mindmap-network'));

  it('disables edge mode', () => {
    startEdgeMode();
    cancelEdgeMode();
    expect(state.mindmapEdgeMode).toBe(false);
    expect(state.mindmapEdgeSource).toBeNull();
  });
});

describe('completeEdge', () => {
  beforeEach(() => initMindmapCanvas('mindmap-network'));

  it('creates edge between source and target', () => {
    addIdeaNode(0, 0);
    addIdeaNode(100, 100);
    startEdgeMode();
    state.mindmapEdgeSource = 'mm-1';
    const edgeId = completeEdge('mm-2', 'supports');
    expect(edgeId).toBe('mme-1');
    const edge = state.mindmapEdges.get('mme-1');
    expect(edge.from).toBe('mm-1');
    expect(edge.to).toBe('mm-2');
    expect(edge.label).toBe('supports');
  });

  it('creates dashed edge for challenges type', () => {
    state.mindmapEdgeSource = 'mm-1';
    state.mindmapEdgeCounter = 0;
    const edgeId = completeEdge('mm-2', 'challenges');
    const edge = state.mindmapEdges.get(edgeId);
    expect(edge.dashes).toBe(true);
  });

  it('creates dashed edge for conflicts-with type', () => {
    state.mindmapEdgeSource = 'mm-1';
    state.mindmapEdgeCounter = 0;
    const edgeId = completeEdge('mm-2', 'conflicts-with');
    const edge = state.mindmapEdges.get(edgeId);
    expect(edge.dashes).toBe(true);
  });

  it('does not create self-loops', () => {
    state.mindmapEdgeSource = 'mm-1';
    const edgeId = completeEdge('mm-1', 'supports');
    expect(edgeId).toBeUndefined();
  });

  it('does nothing without edge source', () => {
    state.mindmapEdgeSource = null;
    const edgeId = completeEdge('mm-2', 'supports');
    expect(edgeId).toBeUndefined();
  });

  it('cancels edge mode after completion', () => {
    state.mindmapEdgeSource = 'mm-1';
    completeEdge('mm-2', 'supports');
    expect(state.mindmapEdgeMode).toBe(false);
  });
});

describe('deleteEdge', () => {
  beforeEach(() => initMindmapCanvas('mindmap-network'));

  it('removes edge from DataSet', () => {
    state.mindmapEdgeSource = 'mm-1';
    state.mindmapEdgeCounter = 0;
    completeEdge('mm-2', 'supports');
    expect(state.mindmapEdges.get('mme-1')).toBeTruthy();
    deleteEdge('mme-1');
    expect(state.mindmapEdges.get('mme-1')).toBeNull();
  });
});

// ========================================
// LANES / ZONES
// ========================================

describe('toggleLanes', () => {
  beforeEach(() => {
    initMindmapCanvas('mindmap-network');
    // Reset module-level _lanesVisible via deserializeWorkspace
    deserializeWorkspace({ name: '', nodes: [], edges: [], nodeCounter: 0, edgeCounter: 0 });
  });

  it('adds 4 lane nodes when toggled on', () => {
    const visible = toggleLanes();
    expect(visible).toBe(true);
    expect(areLanesVisible()).toBe(true);
    const nodes = state.mindmapNodes.get();
    const lanes = nodes.filter(n => n._data?.type === 'lane');
    expect(lanes).toHaveLength(4);
  });

  it('removes lane nodes when toggled off', () => {
    toggleLanes(); // on
    toggleLanes(); // off
    expect(areLanesVisible()).toBe(false);
    const nodes = state.mindmapNodes.get();
    const lanes = nodes.filter(n => n._data?.type === 'lane');
    expect(lanes).toHaveLength(0);
  });

  it('lane nodes have correct labels', () => {
    toggleLanes();
    const nodes = state.mindmapNodes.get();
    const labels = nodes.map(n => n.label).sort();
    expect(labels).toEqual(['Analysis', 'Design', 'Execution', 'Ideation']);
  });

  it('lane nodes are fixed position', () => {
    toggleLanes();
    const nodes = state.mindmapNodes.get();
    for (const n of nodes) {
      expect(n.fixed).toEqual({ x: true, y: true });
    }
  });
});

// ========================================
// WORKSPACE SERIALISATION
// ========================================

describe('serializeWorkspace', () => {
  beforeEach(() => initMindmapCanvas('mindmap-network'));

  it('serializes empty workspace', () => {
    state.mindmapWorkspaceName = 'Test WS';
    const ws = serializeWorkspace();
    expect(ws.name).toBe('Test WS');
    expect(ws.nodes).toHaveLength(0);
    expect(ws.edges).toHaveLength(0);
    expect(ws.viewport).toBeDefined();
  });

  it('serializes nodes and edges', () => {
    addIdeaNode(10, 20, 'Idea A');
    addIdeaNode(30, 40, 'Idea B');
    state.mindmapEdgeSource = 'mm-1';
    completeEdge('mm-2', 'supports');

    const ws = serializeWorkspace();
    expect(ws.nodes).toHaveLength(2);
    expect(ws.edges).toHaveLength(1);
    expect(ws.nodeCounter).toBe(2);
    expect(ws.edgeCounter).toBe(1);
  });

  it('preserves _data properties', () => {
    addIdeaNode(0, 0, 'Test');
    const ws = serializeWorkspace();
    expect(ws.nodes[0]._data.type).toBe('idea');
  });
});

describe('deserializeWorkspace', () => {
  beforeEach(() => initMindmapCanvas('mindmap-network'));

  it('restores nodes and edges from workspace object', () => {
    const workspace = {
      name: 'Restored',
      nodeCounter: 5,
      edgeCounter: 2,
      nodes: [
        { id: 'mm-1', label: 'X', x: 0, y: 0, shape: 'ellipse', _data: { type: 'idea' } },
        { id: 'mm-2', label: 'Y', x: 100, y: 100, shape: 'box', _data: { type: 'ontRef' } },
      ],
      edges: [
        { id: 'mme-1', from: 'mm-1', to: 'mm-2', label: 'supports', _data: { type: 'supports' } },
      ],
      viewport: { scale: 1.5, position: { x: 50, y: 50 } },
    };

    deserializeWorkspace(workspace);
    expect(state.mindmapWorkspaceName).toBe('Restored');
    expect(state.mindmapNodeCounter).toBe(5);
    expect(state.mindmapEdgeCounter).toBe(2);
    expect(state.mindmapNodes.get()).toHaveLength(2);
    expect(state.mindmapEdges.get()).toHaveLength(1);
    expect(state.mindmapDirty).toBe(false);
  });

  it('detects lane nodes and sets lanesVisible', () => {
    const workspace = {
      name: 'WithLanes',
      nodeCounter: 4,
      edgeCounter: 0,
      nodes: [
        { id: 'mm-lane-ideation', label: 'Ideation', _data: { type: 'lane', laneId: 'ideation' } },
      ],
      edges: [],
    };
    deserializeWorkspace(workspace);
    expect(areLanesVisible()).toBe(true);
  });

  it('handles null workspace gracefully', () => {
    deserializeWorkspace(null);
    // No error
  });

  it('clears existing canvas before restoring', () => {
    addIdeaNode(0, 0);
    addIdeaNode(50, 50);
    const workspace = {
      name: 'Fresh',
      nodeCounter: 1,
      edgeCounter: 0,
      nodes: [{ id: 'mm-1', label: 'Only', x: 0, y: 0, _data: { type: 'idea' } }],
      edges: [],
    };
    deserializeWorkspace(workspace);
    expect(state.mindmapNodes.get()).toHaveLength(1);
  });
});

// ========================================
// VIEW MODE SWITCHING
// ========================================

describe('switchToMindmapMode', () => {
  it('sets activeView to mindmap', () => {
    switchToMindmapMode();
    expect(state.activeView).toBe('mindmap');
    expect(state.mindmapMode).toBe(true);
  });

  it('does not overwrite viewMode (single/multi is preserved)', () => {
    state.viewMode = 'multi';
    switchToMindmapMode();
    expect(state.viewMode).toBe('multi');
    expect(state.activeView).toBe('mindmap');
  });

  it('hides network and shows mindmap container', () => {
    switchToMindmapMode();
    expect(mockElements['network']?.style.display).toBe('none');
    expect(mockElements['mindmap-container']?.style.display).toBe('flex');
  });
});

describe('switchFromMindmapMode', () => {
  it('sets activeView back to graph', () => {
    switchToMindmapMode();
    switchFromMindmapMode();
    expect(state.activeView).toBe('graph');
    expect(state.mindmapMode).toBe(false);
  });

  it('preserves viewMode (single/multi)', () => {
    state.viewMode = 'multi';
    switchToMindmapMode();
    switchFromMindmapMode();
    expect(state.viewMode).toBe('multi');
  });

  it('shows network and hides mindmap container', () => {
    switchToMindmapMode();
    switchFromMindmapMode();
    expect(mockElements['network']?.style.display).toBe('block');
    expect(mockElements['mindmap-container']?.style.display).toBe('none');
  });
});

// ========================================
// EXPORT
// ========================================

describe('exportAsMermaidMindmap', () => {
  beforeEach(() => initMindmapCanvas('mindmap-network'));

  it('returns empty string for empty canvas', () => {
    const result = exportAsMermaidMindmap();
    expect(result).toBe('');
  });

  it('generates Mermaid mindmap syntax from nodes and edges', () => {
    state.mindmapWorkspaceName = 'Test Project';
    addIdeaNode(0, 0, 'Root Idea');
    addIdeaNode(100, 0, 'Child');
    state.mindmapEdgeSource = 'mm-1';
    completeEdge('mm-2', 'supports');

    const mmd = exportAsMermaidMindmap();
    expect(mmd).toContain('mindmap');
    expect(mmd).toContain('root');
    expect(mmd).toContain('Root Idea');
    expect(mmd).toContain('Child');
  });

  it('excludes lane nodes from export', () => {
    toggleLanes();
    addIdeaNode(0, 0, 'Real Node');

    const mmd = exportAsMermaidMindmap();
    expect(mmd).not.toContain('Ideation');
    expect(mmd).not.toContain('Analysis');
    expect(mmd).toContain('Real Node');
  });
});

describe('domToCanvas', () => {
  it('delegates to network DOMtoCanvas when available', () => {
    state.mindmapNetwork = mockNetwork;
    mockNetwork.DOMtoCanvas.mockReturnValueOnce({ x: 42, y: 84 });
    const result = domToCanvas({ offsetX: 100, offsetY: 200 });
    expect(result).toEqual({ x: 42, y: 84 });
  });

  it('falls back to offsetX/offsetY without network', () => {
    state.mindmapNetwork = null;
    const result = domToCanvas({ offsetX: 100, offsetY: 200 });
    expect(result).toEqual({ x: 100, y: 200 });
  });
});
