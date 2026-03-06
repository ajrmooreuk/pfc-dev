/**
 * Mindmap/Ideation Canvas — vis-network freeform canvas, node/edge CRUD,
 * workspace persistence, view mode switching.
 * Feature F9F.8 — Epic 9F.
 */

import { state, TYPE_COLORS, MINDMAP_NODE_TYPES, MINDMAP_EDGE_TYPES, MINDMAP_LANES, DB_NAME, DB_VERSION, getArchetypeColor } from './state.js';

// ========================================
// CANVAS INITIALISATION
// ========================================

export function initMindmapCanvas(containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn('[Mindmap] initMindmapCanvas: container not found:', containerId);
    return;
  }

  // Destroy previous instance
  if (state.mindmapNetwork) {
    state.mindmapNetwork.destroy();
  }

  state.mindmapNodes = new vis.DataSet([]);
  state.mindmapEdges = new vis.DataSet([]);

  const options = {
    physics: { enabled: false },
    interaction: { hover: true, tooltipDelay: 200, multiselect: true, navigationButtons: false },
    manipulation: { enabled: false },
    nodes: { borderWidth: 2, font: { color: '#e0e0e0', size: 14 } },
    edges: { smooth: { type: 'continuous', roundness: 0.3 } },
    layout: {},
  };

  state.mindmapNetwork = new vis.Network(
    container,
    { nodes: state.mindmapNodes, edges: state.mindmapEdges },
    options
  );

  // Click handler
  state.mindmapNetwork.on('click', (params) => {
    // Dismiss any open context menu
    _removeContextMenu();

    if (params.nodes.length > 0) {
      const nodeId = params.nodes[0];

      // Edge mode: set source or complete edge
      if (state.mindmapEdgeMode) {
        if (!state.mindmapEdgeSource) {
          state.mindmapEdgeSource = nodeId;
          _highlightEdgeSource(nodeId);
        } else if (nodeId !== state.mindmapEdgeSource) {
          const edgeType = document.getElementById('mm-edge-type-select')?.value || 'supports';
          completeEdge(nodeId, edgeType);
        }
        return;
      }

      // Normal click: select and show properties
      state.mindmapSelectedNode = nodeId;
      _showNodeProperties(nodeId);
    } else {
      // Clicked empty space
      if (state.mindmapEdgeMode) {
        cancelEdgeMode();
      }
      state.mindmapSelectedNode = null;
      _closePropertiesPanel();
    }
  });

  // Double-click: edit label inline
  state.mindmapNetwork.on('doubleClick', (params) => {
    if (params.nodes.length > 0) {
      const nodeId = params.nodes[0];
      const node = state.mindmapNodes.get(nodeId);
      if (node && node._data?.type !== 'lane') {
        const newLabel = prompt('Edit label:', node.label || '');
        if (newLabel !== null && newLabel.trim()) {
          updateNodeLabel(nodeId, newLabel.trim());
        }
      }
    } else {
      // Double-click empty space: add idea node at that position
      const canvasPos = state.mindmapNetwork.DOMtoCanvas({
        x: params.pointer.DOM.x,
        y: params.pointer.DOM.y
      });
      addIdeaNode(canvasPos.x, canvasPos.y);
    }
  });

  // Right-click context menu
  state.mindmapNetwork.on('oncontext', (params) => {
    params.event.preventDefault();
    const canvasPos = state.mindmapNetwork.DOMtoCanvas({
      x: params.pointer.DOM.x,
      y: params.pointer.DOM.y
    });
    const nodeAt = state.mindmapNetwork.getNodeAt(params.pointer.DOM);
    _showContextMenu(params.pointer.DOM.x, params.pointer.DOM.y, canvasPos, nodeAt);
  });

  // Drag end: mark dirty (position changed)
  state.mindmapNetwork.on('dragEnd', () => {
    state.mindmapDirty = true;
    _updateDirtyIndicator();
    _scheduleAutoSave();
  });
}

// ========================================
// NODE CRUD
// ========================================

/** Ensure the mindmap canvas is initialised before any CRUD operation. */
function _ensureCanvas() {
  if (!state.mindmapNodes || !state.mindmapNetwork) {
    // Ensure container is visible before init — vis.js needs real dimensions
    const parent = document.getElementById('mindmap-container');
    if (parent && parent.style.display === 'none') parent.style.display = 'flex';
    try {
      initMindmapCanvas('mindmap-network');
    } catch (err) {
      console.error('[Mindmap] _ensureCanvas init failed:', err);
      return false;
    }
  }
  return !!state.mindmapNodes;
}

function _hideEmptyHint() {
  const hint = document.getElementById('mindmap-empty-hint');
  if (hint) hint.style.display = 'none';
}

function _showEmptyHint() {
  const hint = document.getElementById('mindmap-empty-hint');
  if (hint) hint.style.display = '';
}

export function addIdeaNode(x, y, label = 'New Idea') {
  if (!_ensureCanvas()) return null;
  state.mindmapNodeCounter++;
  const id = `mm-${state.mindmapNodeCounter}`;
  const node = {
    id,
    label,
    x, y,
    shape: 'ellipse',
    color: {
      background: MINDMAP_NODE_TYPES.idea.color,
      border: MINDMAP_NODE_TYPES.idea.border,
      highlight: { background: '#BA68C8', border: '#9C27B0' }
    },
    font: { color: '#e0e0e0', size: 14 },
    borderWidth: 2,
    _data: { type: 'idea', created: new Date().toISOString(), notes: '' }
  };
  state.mindmapNodes.add(node);
  _hideEmptyHint();
  state.mindmapDirty = true;
  _updateDirtyIndicator();
  _scheduleAutoSave();
  // Focus the canvas on the new node so it's visible
  if (state.mindmapNetwork) {
    state.mindmapNetwork.fit({ animation: { duration: 300, easingFunction: 'easeInOutQuad' } });
  }
  return id;
}

export function addOntologyRefNode(x, y, entity, namespace) {
  if (!_ensureCanvas()) return null;
  state.mindmapNodeCounter++;
  const id = `mm-${state.mindmapNodeCounter}`;
  const entityType = entity.entityType || entity['@type'] || 'default';
  const color = getArchetypeColor(entityType);
  const node = {
    id,
    label: entity.label || entity.name || entity['@id'] || 'Entity',
    x, y,
    shape: 'box',
    color: {
      background: color,
      border: '#333',
      highlight: { background: '#9dfff5', border: '#017c75' }
    },
    font: { color: '#e0e0e0', size: 13 },
    borderWidth: 2,
    _data: {
      type: 'ontRef',
      entityId: entity['@id'] || entity.id,
      entityType,
      namespace: namespace || '',
      description: entity.description || '',
      created: new Date().toISOString(),
      notes: ''
    }
  };
  state.mindmapNodes.add(node);
  _hideEmptyHint();
  state.mindmapDirty = true;
  _updateDirtyIndicator();
  _scheduleAutoSave();
  if (state.mindmapNetwork) {
    state.mindmapNetwork.fit({ animation: { duration: 300, easingFunction: 'easeInOutQuad' } });
  }
  return id;
}

export function addActionCardNode(x, y, title = 'New Action') {
  if (!_ensureCanvas()) return null;
  state.mindmapNodeCounter++;
  const id = `mm-${state.mindmapNodeCounter}`;
  const fields = { status: 'pending', owner: '', due: '', priority: 'medium', notes: '' };
  const node = {
    id,
    label: _buildActionLabel(title, fields),
    x, y,
    shape: 'box',
    color: {
      background: MINDMAP_NODE_TYPES.action.color,
      border: MINDMAP_NODE_TYPES.action.border,
      highlight: { background: '#FFB74D', border: '#FF9800' }
    },
    font: { color: '#fff', size: 12, multi: 'html', face: 'monospace' },
    borderWidth: 2,
    widthConstraint: { minimum: 180, maximum: 260 },
    _data: {
      type: 'action',
      title,
      fields,
      created: new Date().toISOString()
    }
  };
  state.mindmapNodes.add(node);
  _hideEmptyHint();
  state.mindmapDirty = true;
  _updateDirtyIndicator();
  _scheduleAutoSave();
  if (state.mindmapNetwork) {
    state.mindmapNetwork.fit({ animation: { duration: 300, easingFunction: 'easeInOutQuad' } });
  }
  return id;
}

function _buildActionLabel(title, fields) {
  let label = `<b>${_escLabel(title)}</b>`;
  if (fields.status) label += `\nstatus: ${fields.status}`;
  if (fields.owner) label += `\nowner: ${fields.owner}`;
  if (fields.due) label += `\ndue: ${fields.due}`;
  return label;
}

function _escLabel(str) {
  return (str || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function updateActionCard(nodeId, fieldUpdates) {
  if (!state.mindmapNodes) return;
  const node = state.mindmapNodes.get(nodeId);
  if (!node || node._data?.type !== 'action') return;
  Object.assign(node._data.fields, fieldUpdates);
  if (fieldUpdates.title !== undefined) node._data.title = fieldUpdates.title;
  node.label = _buildActionLabel(node._data.title, node._data.fields);
  state.mindmapNodes.update(node);
  state.mindmapDirty = true;
  _updateDirtyIndicator();
  _scheduleAutoSave();
}

export function updateNodeLabel(nodeId, newLabel) {
  if (!state.mindmapNodes) return;
  const node = state.mindmapNodes.get(nodeId);
  if (!node) return;
  node.label = newLabel;
  state.mindmapNodes.update(node);
  state.mindmapDirty = true;
  _updateDirtyIndicator();
  _scheduleAutoSave();
}

export function updateNodeData(nodeId, dataUpdates) {
  if (!state.mindmapNodes) return;
  const node = state.mindmapNodes.get(nodeId);
  if (!node || !node._data) return;
  Object.assign(node._data, dataUpdates);
  state.mindmapNodes.update(node);
  state.mindmapDirty = true;
  _updateDirtyIndicator();
  _scheduleAutoSave();
}

export function deleteNode(nodeId) {
  if (!nodeId || !state.mindmapNodes) return;
  // Remove connected edges
  const connectedEdges = state.mindmapNetwork
    ? state.mindmapNetwork.getConnectedEdges(nodeId)
    : [];
  if (state.mindmapEdges) {
    for (const edgeId of connectedEdges) {
      state.mindmapEdges.remove(edgeId);
    }
  }
  state.mindmapNodes.remove(nodeId);
  if (state.mindmapSelectedNode === nodeId) {
    state.mindmapSelectedNode = null;
    _closePropertiesPanel();
  }
  state.mindmapDirty = true;
  _updateDirtyIndicator();
  _scheduleAutoSave();
}

export function getNodeData(nodeId) {
  if (!state.mindmapNodes) return null;
  const node = state.mindmapNodes.get(nodeId);
  return node ? { id: node.id, label: node.label, ...(node._data || {}) } : null;
}

export function clearCanvas() {
  if (state.mindmapNodes) state.mindmapNodes.clear();
  if (state.mindmapEdges) state.mindmapEdges.clear();
  state.mindmapNodeCounter = 0;
  state.mindmapEdgeCounter = 0;
  state.mindmapSelectedNode = null;
  state.mindmapDirty = false;
  _updateDirtyIndicator();
  _closePropertiesPanel();
  _showEmptyHint();
}

// ========================================
// EDGE DRAWING
// ========================================

export function startEdgeMode() {
  state.mindmapEdgeMode = true;
  state.mindmapEdgeSource = null;
  const container = document.getElementById('mindmap-network');
  if (container) container.style.cursor = 'crosshair';
  const btn = document.getElementById('btn-mm-connect');
  if (btn) btn.classList.add('active');
}

export function cancelEdgeMode() {
  state.mindmapEdgeMode = false;
  state.mindmapEdgeSource = null;
  const container = document.getElementById('mindmap-network');
  if (container) container.style.cursor = 'default';
  const btn = document.getElementById('btn-mm-connect');
  if (btn) btn.classList.remove('active');
  // Remove highlight from source node
  if (state.mindmapNetwork) {
    state.mindmapNetwork.unselectAll();
  }
}

export function completeEdge(targetNodeId, edgeType = 'supports') {
  if (!state.mindmapEdges || !state.mindmapEdgeSource || state.mindmapEdgeSource === targetNodeId) return;
  state.mindmapEdgeCounter++;
  const id = `mme-${state.mindmapEdgeCounter}`;
  const isDashed = edgeType === 'challenges' || edgeType === 'conflicts-with';
  const edge = {
    id,
    from: state.mindmapEdgeSource,
    to: targetNodeId,
    label: edgeType,
    arrows: 'to',
    color: { color: '#888', highlight: '#9dfff5' },
    font: { color: '#888', size: 10, strokeWidth: 2, strokeColor: '#0f1117' },
    dashes: isDashed,
    width: 1.5,
    smooth: { type: 'continuous', roundness: 0.3 },
    _data: { type: edgeType }
  };
  state.mindmapEdges.add(edge);
  state.mindmapDirty = true;
  _updateDirtyIndicator();
  _scheduleAutoSave();
  cancelEdgeMode();
  return id;
}

export function deleteEdge(edgeId) {
  if (!edgeId || !state.mindmapEdges) return;
  state.mindmapEdges.remove(edgeId);
  state.mindmapDirty = true;
  _updateDirtyIndicator();
  _scheduleAutoSave();
}

function _highlightEdgeSource(nodeId) {
  if (state.mindmapNetwork) {
    state.mindmapNetwork.selectNodes([nodeId]);
  }
}

// ========================================
// LANES / ZONES
// ========================================

let _lanesVisible = false;
const _laneNodeIds = [];

export function toggleLanes() {
  if (_lanesVisible) {
    // Remove lanes
    for (const laneId of _laneNodeIds) {
      state.mindmapNodes.remove(laneId);
    }
    _laneNodeIds.length = 0;
    _lanesVisible = false;
  } else {
    // Create lane nodes
    const positions = [-1200, -400, 400, 1200];
    for (let i = 0; i < MINDMAP_LANES.length; i++) {
      const lane = MINDMAP_LANES[i];
      const laneId = `mm-lane-${lane.id}`;
      _laneNodeIds.push(laneId);
      state.mindmapNodes.add({
        id: laneId,
        label: lane.label,
        x: positions[i],
        y: 0,
        shape: 'box',
        size: 40,
        widthConstraint: { minimum: 700 },
        heightConstraint: { minimum: 600 },
        color: {
          background: lane.color,
          border: '#3a3d47',
          highlight: { background: lane.color, border: '#555' }
        },
        font: { color: '#555', size: 22, vadjust: -250 },
        borderWidth: 1,
        shapeProperties: { borderDashes: [8, 4] },
        fixed: { x: true, y: true },
        physics: false,
        chosen: false,
        _data: { type: 'lane', laneId: lane.id }
      });
    }
    _lanesVisible = true;
  }
  state.mindmapDirty = true;
  _updateDirtyIndicator();
  return _lanesVisible;
}

export function areLanesVisible() {
  return _lanesVisible;
}

// ========================================
// WORKSPACE SERIALISATION
// ========================================

export function serializeWorkspace() {
  const nodes = state.mindmapNodes ? state.mindmapNodes.get() : [];
  const edges = state.mindmapEdges ? state.mindmapEdges.get() : [];
  const viewport = state.mindmapNetwork
    ? { scale: state.mindmapNetwork.getScale(), position: state.mindmapNetwork.getViewPosition() }
    : { scale: 1, position: { x: 0, y: 0 } };

  return {
    name: state.mindmapWorkspaceName || 'Untitled',
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    nodeCounter: state.mindmapNodeCounter,
    edgeCounter: state.mindmapEdgeCounter,
    nodes: nodes.map(n => ({
      id: n.id, label: n.label, x: n.x, y: n.y,
      shape: n.shape, color: n.color, font: n.font,
      borderWidth: n.borderWidth, size: n.size,
      widthConstraint: n.widthConstraint, heightConstraint: n.heightConstraint,
      shapeProperties: n.shapeProperties, fixed: n.fixed,
      image: n.image, chosen: n.chosen,
      _data: n._data
    })),
    edges: edges.map(e => ({
      id: e.id, from: e.from, to: e.to, label: e.label,
      arrows: e.arrows, color: e.color, font: e.font,
      dashes: e.dashes, width: e.width, smooth: e.smooth,
      _data: e._data
    })),
    viewport
  };
}

export function deserializeWorkspace(workspace) {
  if (!workspace) return;
  clearCanvas();
  state.mindmapWorkspaceName = workspace.name || 'Untitled';
  state.mindmapNodeCounter = workspace.nodeCounter || 0;
  state.mindmapEdgeCounter = workspace.edgeCounter || 0;

  // Restore nodes
  if (workspace.nodes && state.mindmapNodes) {
    for (const n of workspace.nodes) {
      state.mindmapNodes.add(n);
    }
  }

  // Restore edges
  if (workspace.edges && state.mindmapEdges) {
    for (const e of workspace.edges) {
      state.mindmapEdges.add(e);
    }
  }

  // Restore viewport
  if (workspace.viewport && state.mindmapNetwork) {
    state.mindmapNetwork.moveTo({
      position: workspace.viewport.position,
      scale: workspace.viewport.scale,
      animation: false
    });
  }

  // Check if lanes are present
  _lanesVisible = false;
  _laneNodeIds.length = 0;
  if (workspace.nodes) {
    for (const n of workspace.nodes) {
      if (n._data?.type === 'lane') {
        _lanesVisible = true;
        _laneNodeIds.push(n.id);
      }
    }
  }

  state.mindmapDirty = false;
  _updateDirtyIndicator();
  _updateWorkspaceNameDisplay();

  // Hide empty hint if workspace has content nodes
  const contentNodes = (workspace.nodes || []).filter(n => n._data?.type !== 'lane');
  if (contentNodes.length > 0) _hideEmptyHint();
}

// ========================================
// WORKSPACE PERSISTENCE (IndexedDB)
// ========================================

function _getDB() {
  return new Promise((resolve, reject) => {
    if (state.libraryDB) { resolve(state.libraryDB); return; }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onsuccess = () => { state.libraryDB = req.result; resolve(req.result); };
    req.onerror = () => reject(req.error);
  });
}

export async function saveWorkspace(name) {
  const db = await _getDB();
  const workspace = serializeWorkspace();
  workspace.name = name || state.mindmapWorkspaceName || 'Untitled';
  workspace.updated = new Date().toISOString();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(['mindmap-workspaces'], 'readwrite');
    const store = tx.objectStore('mindmap-workspaces');

    if (state.mindmapActiveWorkspaceId) {
      workspace.id = state.mindmapActiveWorkspaceId;
      store.put(workspace);
    } else {
      const req = store.add(workspace);
      req.onsuccess = () => { state.mindmapActiveWorkspaceId = req.result; };
    }

    tx.oncomplete = () => {
      state.mindmapWorkspaceName = workspace.name;
      state.mindmapDirty = false;
      _updateDirtyIndicator();
      _updateWorkspaceNameDisplay();
      try { localStorage.setItem('oaa-viz-active-workspace', String(state.mindmapActiveWorkspaceId)); } catch (_) {}
      resolve(state.mindmapActiveWorkspaceId);
    };
    tx.onerror = () => reject(tx.error);
  });
}

export async function loadWorkspace(workspaceId) {
  const db = await _getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['mindmap-workspaces'], 'readonly');
    const store = tx.objectStore('mindmap-workspaces');
    const req = store.get(workspaceId);
    req.onsuccess = () => {
      if (!req.result) { reject(new Error('Workspace not found')); return; }
      state.mindmapActiveWorkspaceId = workspaceId;
      deserializeWorkspace(req.result);
      try { localStorage.setItem('oaa-viz-active-workspace', String(workspaceId)); } catch (_) {}
      resolve(req.result);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function listWorkspaces() {
  const db = await _getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['mindmap-workspaces'], 'readonly');
    const store = tx.objectStore('mindmap-workspaces');
    const req = store.getAll();
    req.onsuccess = () => {
      const workspaces = (req.result || []).map(ws => ({
        id: ws.id,
        name: ws.name,
        updated: ws.updated,
        nodeCount: ws.nodes?.length || 0,
        edgeCount: ws.edges?.length || 0
      }));
      workspaces.sort((a, b) => (b.updated || '').localeCompare(a.updated || ''));
      resolve(workspaces);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function deleteWorkspace(workspaceId) {
  const db = await _getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['mindmap-workspaces'], 'readwrite');
    const store = tx.objectStore('mindmap-workspaces');
    store.delete(workspaceId);
    tx.oncomplete = () => {
      if (state.mindmapActiveWorkspaceId === workspaceId) {
        state.mindmapActiveWorkspaceId = null;
        state.mindmapWorkspaceName = '';
        try { localStorage.removeItem('oaa-viz-active-workspace'); } catch (_) {}
        _updateWorkspaceNameDisplay();
      }
      resolve();
    };
    tx.onerror = () => reject(tx.error);
  });
}

export async function renameWorkspace(workspaceId, newName) {
  const db = await _getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['mindmap-workspaces'], 'readwrite');
    const store = tx.objectStore('mindmap-workspaces');
    const req = store.get(workspaceId);
    req.onsuccess = () => {
      if (!req.result) { reject(new Error('Not found')); return; }
      req.result.name = newName;
      req.result.updated = new Date().toISOString();
      store.put(req.result);
    };
    tx.oncomplete = () => {
      if (state.mindmapActiveWorkspaceId === workspaceId) {
        state.mindmapWorkspaceName = newName;
        _updateWorkspaceNameDisplay();
      }
      resolve();
    };
    tx.onerror = () => reject(tx.error);
  });
}

// ========================================
// AUTO-SAVE
// ========================================

let _autoSaveTimer = null;

function _scheduleAutoSave() {
  if (!state.mindmapActiveWorkspaceId) return;
  clearTimeout(_autoSaveTimer);
  _autoSaveTimer = setTimeout(() => {
    saveWorkspace(state.mindmapWorkspaceName).catch(err => {
      console.error('[Mindmap] Auto-save failed:', err);
    });
  }, 2000);
}

// ========================================
// VIEW MODE SWITCHING
// ========================================

export function switchToMindmapMode() {
  const network = document.getElementById('network');
  const mermaidContainer = document.getElementById('mermaid-container');
  const dropZone = document.getElementById('drop-zone');
  const mindmapContainer = document.getElementById('mindmap-container');
  const skeletonContainer = document.getElementById('skeleton-graph-container');

  if (network) network.style.display = 'none';
  if (mermaidContainer) mermaidContainer.style.display = 'none';
  if (dropZone) dropZone.style.display = 'none';
  if (mindmapContainer) mindmapContainer.style.display = 'flex';
  if (skeletonContainer) skeletonContainer.style.display = 'none';

  state.activeView = 'mindmap';
  state.mindmapMode = true;

  // Init canvas if not already done
  if (!state.mindmapNetwork) {
    initMindmapCanvas('mindmap-network');
  }

  // Try restoring last workspace
  if (!state.mindmapActiveWorkspaceId) {
    try {
      const savedId = localStorage.getItem('oaa-viz-active-workspace');
      if (savedId) {
        loadWorkspace(parseInt(savedId, 10)).catch(() => {});
      }
    } catch (_) {}
  }
}

export function switchFromMindmapMode() {
  const network = document.getElementById('network');
  const mermaidContainer = document.getElementById('mermaid-container');
  const mindmapContainer = document.getElementById('mindmap-container');
  const dropZone = document.getElementById('drop-zone');

  if (network) network.style.display = 'block';
  if (mermaidContainer) mermaidContainer.style.display = 'none';
  if (mindmapContainer) mindmapContainer.style.display = 'none';

  // Restore drop-zone if no ontology is loaded
  if (dropZone && !state.lastParsed) {
    dropZone.style.display = '';
    dropZone.classList.remove('hidden');
  }

  state.activeView = 'graph';
  state.mindmapMode = false;

  // Close properties panel
  _closePropertiesPanel();
}

// ========================================
// EXPORT
// ========================================

export function exportWorkspaceJSON() {
  const workspace = serializeWorkspace();
  const json = JSON.stringify(workspace, null, 2);
  const baseName = (state.mindmapWorkspaceName || 'mindmap').replace(/\s+/g, '-').toLowerCase();
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${baseName}-workspace.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportAsMermaidMindmap() {
  const nodes = state.mindmapNodes ? state.mindmapNodes.get() : [];
  const edges = state.mindmapEdges ? state.mindmapEdges.get() : [];
  if (!nodes.length) return '';

  // Filter out lane nodes
  const contentNodes = nodes.filter(n => n._data?.type !== 'lane');
  if (!contentNodes.length) return '';

  // Build adjacency list
  const children = new Map();
  const hasParent = new Set();
  for (const e of edges) {
    if (!children.has(e.from)) children.set(e.from, []);
    children.get(e.from).push(e.to);
    hasParent.add(e.to);
  }

  // Root nodes: no incoming edges
  const roots = contentNodes.filter(n => !hasParent.has(n.id));
  if (!roots.length) roots.push(contentNodes[0]); // fallback

  let mmd = 'mindmap\n';
  mmd += `  root((${_escMmd(state.mindmapWorkspaceName || 'Workspace')}))\n`;

  const visited = new Set();
  function walk(nodeId, depth) {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);
    const node = state.mindmapNodes.get(nodeId);
    if (!node) return;
    const indent = '  '.repeat(depth + 2);
    const label = (node.label || '').replace(/\n/g, ' ').replace(/<[^>]*>/g, '');
    mmd += `${indent}${_escMmd(label)}\n`;
    const kids = children.get(nodeId) || [];
    for (const kid of kids) {
      walk(kid, depth + 1);
    }
  }

  for (const root of roots) {
    walk(root.id, 0);
  }

  // Download
  const baseName = (state.mindmapWorkspaceName || 'mindmap').replace(/\s+/g, '-').toLowerCase();
  const blob = new Blob([mmd], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${baseName}-mindmap.mmd`;
  a.click();
  URL.revokeObjectURL(url);
  return mmd;
}

function _escMmd(str) {
  return (str || '').replace(/[()[\]{}]/g, '');
}

// ========================================
// CANVAS → DOM COORDINATE HELPER
// ========================================

export function domToCanvas(event) {
  if (state.mindmapNetwork) {
    return state.mindmapNetwork.DOMtoCanvas({ x: event.offsetX, y: event.offsetY });
  }
  return { x: event.offsetX || 0, y: event.offsetY || 0 };
}

// ========================================
// UI HELPERS (PRIVATE)
// ========================================

function _showNodeProperties(nodeId) {
  const node = state.mindmapNodes.get(nodeId);
  if (!node) return;
  const panel = document.getElementById('mindmap-properties-panel');
  if (!panel) return;

  const titleEl = document.getElementById('mm-props-title');
  const labelInput = document.getElementById('mm-prop-label');
  const typeEl = document.getElementById('mm-prop-type');
  const notesEl = document.getElementById('mm-prop-notes');
  const refSection = document.getElementById('mm-prop-ref-section');
  const actionSection = document.getElementById('mm-prop-action-section');

  if (titleEl) titleEl.textContent = MINDMAP_NODE_TYPES[node._data?.type]?.label || 'Node Properties';
  if (labelInput) labelInput.value = (node.label || '').replace(/<[^>]*>/g, '');
  if (typeEl) typeEl.textContent = node._data?.type || 'unknown';
  if (notesEl) notesEl.value = node._data?.notes || '';

  // Show/hide type-specific sections
  if (refSection) refSection.style.display = node._data?.type === 'ontRef' ? 'block' : 'none';
  if (actionSection) actionSection.style.display = node._data?.type === 'action' ? 'block' : 'none';

  if (node._data?.type === 'ontRef') {
    const refDetails = document.getElementById('mm-prop-ref-details');
    if (refDetails) {
      refDetails.innerHTML = `<strong>${node._data.entityId || ''}</strong><br>${node._data.description || ''}`;
    }
  }

  if (node._data?.type === 'action') {
    const actionFields = document.getElementById('mm-prop-action-fields');
    if (actionFields) {
      actionFields.innerHTML = _renderActionFields(node._data.fields);
    }
  }

  panel.classList.add('open');
  state.mindmapPropertiesPanelOpen = true;
}

function _renderActionFields(fields) {
  if (!fields) return '';
  return `
    <div style="margin-bottom:8px;">
      <label class="field-label">Status</label>
      <select class="library-input" style="width:100%;" onchange="updateMindmapActionField('status', this.value)">
        ${['pending', 'in-progress', 'done', 'blocked'].map(s =>
          `<option value="${s}"${fields.status === s ? ' selected' : ''}>${s}</option>`
        ).join('')}
      </select>
    </div>
    <div style="margin-bottom:8px;">
      <label class="field-label">Owner</label>
      <input type="text" class="library-input" style="width:100%;" value="${_escAttr(fields.owner || '')}" onchange="updateMindmapActionField('owner', this.value)">
    </div>
    <div style="margin-bottom:8px;">
      <label class="field-label">Due</label>
      <input type="date" class="library-input" style="width:100%;" value="${fields.due || ''}" onchange="updateMindmapActionField('due', this.value)">
    </div>
    <div style="margin-bottom:8px;">
      <label class="field-label">Priority</label>
      <select class="library-input" style="width:100%;" onchange="updateMindmapActionField('priority', this.value)">
        ${['low', 'medium', 'high', 'critical'].map(p =>
          `<option value="${p}"${fields.priority === p ? ' selected' : ''}>${p}</option>`
        ).join('')}
      </select>
    </div>`;
}

function _escAttr(str) {
  return (str || '').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function _closePropertiesPanel() {
  const panel = document.getElementById('mindmap-properties-panel');
  if (panel) panel.classList.remove('open');
  state.mindmapPropertiesPanelOpen = false;
}

function _updateDirtyIndicator() {
  const dot = document.getElementById('mm-dirty-dot');
  if (dot) dot.style.display = state.mindmapDirty ? 'inline' : 'none';
}

function _updateWorkspaceNameDisplay() {
  const el = document.getElementById('mm-workspace-name');
  if (el) el.textContent = state.mindmapWorkspaceName || '';
}

// ========================================
// CONTEXT MENU
// ========================================

let _contextMenuEl = null;

function _showContextMenu(screenX, screenY, canvasPos, nodeId) {
  _removeContextMenu();
  const menu = document.createElement('div');
  menu.className = 'mm-context-menu';
  menu.style.left = screenX + 'px';
  menu.style.top = screenY + 'px';

  if (nodeId) {
    menu.innerHTML = `
      <button onclick="editMindmapNodeLabelUI()">Edit Label</button>
      <button onclick="toggleMindmapEdgeModeUI()">Connect From Here</button>
      <hr>
      <button onclick="deleteMindmapNodeUI()">Delete Node</button>
    `;
  } else {
    menu.innerHTML = `
      <button onclick="addIdeaNodeAtUI(${Math.round(canvasPos.x)}, ${Math.round(canvasPos.y)})">+ Idea</button>
      <button onclick="addActionCardAtUI(${Math.round(canvasPos.x)}, ${Math.round(canvasPos.y)})">+ Action Card</button>
    `;
  }

  const container = document.getElementById('mindmap-container') || document.body;
  container.appendChild(menu);
  _contextMenuEl = menu;

  // Auto-dismiss on click elsewhere
  setTimeout(() => {
    document.addEventListener('click', _removeContextMenu, { once: true });
  }, 10);
}

function _removeContextMenu() {
  if (_contextMenuEl && _contextMenuEl.parentNode) {
    _contextMenuEl.parentNode.removeChild(_contextMenuEl);
  }
  _contextMenuEl = null;
}
