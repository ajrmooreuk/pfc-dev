/**
 * Authoring UI — modals and editors for ontology creation, entity/relationship CRUD,
 * version management, fork, and subgraph selection export.
 *
 * All DOM manipulation is here; data operations delegate to ontology-author.js.
 * Window bindings are set in app.js.
 */

import { state, OAA_ENTITY_TYPES } from './state.js';
import { parseOntology } from './ontology-parser.js';
import { validateOAAv5 } from './audit-engine.js';
import {
  createBlankOntology,
  addEntity,
  updateEntity,
  removeEntity,
  addRelationship,
  updateRelationship,
  removeRelationship,
  bumpVersion,
  getVersion,
  forkOntology,
  serializeToOAAJsonLD,
  applyEntityToGraph,
  applyRelationshipToGraph,
  pushUndoSnapshot,
  undo,
  redo,
  listEntityIds,
  getEntity,
  getRelationship,
} from './ontology-author.js';
import {
  createRevision,
  getRevisionHistory,
  exportRevisionDocs,
  loadGlossary,
  searchGlossary,
  addGlossaryEntry,
  updateGlossaryEntry as updateGlossaryEntryFn,
  removeGlossaryEntry as removeGlossaryEntryFn,
  getCustomGlossaryEntries,
  linkGlossaryToNode,
  unlinkGlossaryFromNode,
  getGlossaryForNode,
  suggestGlossaryLinks,
} from './revision-manager.js';
import { escapeHtml } from './ui-panels.js';

// ─── Authoring Mode Toggle ──────────────────────────────────────────────────

export function enterAuthoringMode() {
  state.authoringMode = true;
  state.authoringDirty = false;
  state.authoringUndoStack = [];
  state.authoringRedoStack = [];
  // Capture baseline snapshot for revision changelog (Feature 7.2.1)
  if (state.currentData) {
    state.authoringBaselineSnapshot = JSON.stringify(state.currentData);
  }
  _updateToolbarState();
}

export function exitAuthoringMode() {
  if (state.authoringDirty) {
    if (!confirm('You have unsaved changes. Exit authoring mode?')) return;
  }
  state.authoringMode = false;
  state.authoringDirty = false;
  state.authoringUndoStack = [];
  state.authoringRedoStack = [];
  _updateToolbarState();
}

function _updateToolbarState() {
  // Support both legacy and skeleton-driven toolbar IDs
  const toolbar = document.getElementById('dynamic-authoring-bar') || document.getElementById('authoring-toolbar');
  if (toolbar) toolbar.style.display = state.authoringMode ? 'flex' : 'none';
  const dirtyDot = document.getElementById('authoring-dirty-dot');
  if (dirtyDot) dirtyDot.style.display = state.authoringDirty ? 'inline-block' : 'none';
  const undoBtn = document.getElementById('btn-undo');
  if (undoBtn) undoBtn.disabled = state.authoringUndoStack.length === 0;
  const redoBtn = document.getElementById('btn-redo');
  if (redoBtn) redoBtn.disabled = state.authoringRedoStack.length === 0;
  // Sync skeleton nav visibility conditions (F40.20)
  window.updateSkeletonNavVisibility?.();
}

// ─── Create Ontology Modal ──────────────────────────────────────────────────

export function showCreateOntologyModal() {
  const modal = document.getElementById('create-ontology-modal');
  if (!modal) return;
  // Reset form
  const form = modal.querySelector('form');
  if (form) form.reset();
  const errEl = document.getElementById('create-ontology-error');
  if (errEl) errEl.style.display = 'none';
  modal.style.display = 'flex';
}

export function closeCreateOntologyModal() {
  const modal = document.getElementById('create-ontology-modal');
  if (modal) modal.style.display = 'none';
}

/**
 * Reads form values and creates a blank ontology, then renders it.
 * Called by the "Create" button inside the modal.
 * @param {Function} renderGraph — injected from app.js to avoid circular import
 */
export function doCreateOntology(renderGraph) {
  const name = document.getElementById('create-ont-name')?.value?.trim();
  const ns = document.getElementById('create-ont-namespace')?.value?.trim();
  const desc = document.getElementById('create-ont-description')?.value?.trim();
  const cat = document.getElementById('create-ont-category')?.value;
  const errEl = document.getElementById('create-ontology-error');

  try {
    const data = createBlankOntology(name, ns, desc, cat);
    state.currentData = data;
    const parsed = parseOntology(data, `${ns}-ontology.json`);
    state.lastParsed = parsed;
    state.viewMode = 'single';

    // Render (may be empty graph — that's fine for authoring)
    if (typeof renderGraph === 'function') {
      renderGraph(parsed);
    }
    const dropZone = document.getElementById('drop-zone');
    if (dropZone) dropZone.classList.add('hidden');
    document.getElementById('file-name').textContent = `${name} (new)`;

    enterAuthoringMode();
    closeCreateOntologyModal();
  } catch (err) {
    if (errEl) {
      errEl.textContent = err.message;
      errEl.style.display = 'block';
    }
  }
}

// ─── Entity Editor Modal ────────────────────────────────────────────────────

let _editingEntityId = null;

export function showEntityEditor(entityId) {
  const modal = document.getElementById('entity-editor-modal');
  if (!modal) return;

  const errEl = document.getElementById('entity-editor-error');
  if (errEl) errEl.style.display = 'none';

  _editingEntityId = entityId || null;
  const titleEl = modal.querySelector('h3');
  if (titleEl) titleEl.textContent = entityId ? 'Edit Entity' : 'Add Entity';

  // Populate form
  const idInput = document.getElementById('entity-id');
  const nameInput = document.getElementById('entity-name');
  const typeSelect = document.getElementById('entity-type');
  const descInput = document.getElementById('entity-description');
  const propsContainer = document.getElementById('entity-properties');

  if (entityId && state.currentData) {
    const ent = getEntity(state.currentData, entityId);
    if (ent) {
      if (idInput) { idInput.value = ent['@id'] || ent.id || ''; idInput.disabled = true; }
      if (nameInput) nameInput.value = ent.name || '';
      if (typeSelect) typeSelect.value = ent['oaa:entityType'] || ent.entityType || 'class';
      if (descInput) descInput.value = ent.description || '';
      _renderPropertyRows(propsContainer, ent.properties || []);
    }
  } else {
    if (idInput) { idInput.value = ''; idInput.disabled = false; }
    if (nameInput) nameInput.value = '';
    if (typeSelect) typeSelect.value = 'class';
    if (descInput) descInput.value = '';
    _renderPropertyRows(propsContainer, []);
  }

  modal.style.display = 'flex';
}

export function closeEntityEditor() {
  const modal = document.getElementById('entity-editor-modal');
  if (modal) modal.style.display = 'none';
  _editingEntityId = null;
}

export function doSaveEntity() {
  const data = state.currentData;
  if (!data) return;

  const id = document.getElementById('entity-id')?.value?.trim();
  const name = document.getElementById('entity-name')?.value?.trim();
  const entityType = document.getElementById('entity-type')?.value;
  const description = document.getElementById('entity-description')?.value?.trim();
  const properties = _collectPropertyRows();
  const errEl = document.getElementById('entity-editor-error');

  pushUndoSnapshot(_editingEntityId ? 'updateEntity' : 'addEntity');

  let result;
  if (_editingEntityId) {
    result = updateEntity(data, _editingEntityId, { name, entityType, description, properties: properties.length ? properties : undefined });
    if (result.success) {
      applyEntityToGraph({ id: _editingEntityId, name, entityType, description }, 'update');
    }
  } else {
    result = addEntity(data, { id, name, entityType, description, properties: properties.length ? properties : undefined });
    if (result.success) {
      applyEntityToGraph({ id, name, entityType, description }, 'add');
    }
  }

  if (!result.success) {
    if (errEl) { errEl.textContent = result.error; errEl.style.display = 'block'; }
    // Pop the undo snapshot since the operation failed
    state.authoringUndoStack.pop();
    return;
  }

  state.authoringDirty = true;
  _updateToolbarState();
  // Re-parse for sidebar/audit consistency
  state.lastParsed = parseOntology(data, 'authoring');
  closeEntityEditor();
}

export function doDeleteEntity() {
  if (!_editingEntityId || !state.currentData) return;
  if (!confirm(`Delete entity "${_editingEntityId}" and its relationships?`)) return;

  pushUndoSnapshot('removeEntity');
  const result = removeEntity(state.currentData, _editingEntityId);
  if (result.success) {
    applyEntityToGraph({ id: _editingEntityId }, 'remove');
    state.authoringDirty = true;
    state.lastParsed = parseOntology(state.currentData, 'authoring');
    _updateToolbarState();
  }
  closeEntityEditor();
}

// Property row helpers
function _renderPropertyRows(container, properties) {
  if (!container) return;
  let html = '';
  (properties || []).forEach((p, i) => {
    html += _propertyRowHtml(i, p.name || '', p.type || 'Text', p.required || false, p.description || '');
  });
  container.innerHTML = html;
}

function _propertyRowHtml(idx, name, type, required, description) {
  return `<div class="prop-row" data-idx="${idx}">
    <input type="text" class="prop-name" placeholder="Name" value="${escapeHtml(name)}">
    <select class="prop-type">
      <option value="Text"${type === 'Text' ? ' selected' : ''}>Text</option>
      <option value="Number"${type === 'Number' ? ' selected' : ''}>Number</option>
      <option value="Boolean"${type === 'Boolean' ? ' selected' : ''}>Boolean</option>
      <option value="DateTime"${type === 'DateTime' ? ' selected' : ''}>DateTime</option>
      <option value="URL"${type === 'URL' ? ' selected' : ''}>URL</option>
    </select>
    <label class="prop-req"><input type="checkbox"${required ? ' checked' : ''}> Req</label>
    <input type="text" class="prop-desc" placeholder="Description" value="${escapeHtml(description)}">
    <button class="prop-remove" onclick="removePropertyRow(this)">&#x2715;</button>
  </div>`;
}

export function addPropertyRow() {
  const container = document.getElementById('entity-properties');
  if (!container) return;
  const idx = container.querySelectorAll('.prop-row').length;
  container.insertAdjacentHTML('beforeend', _propertyRowHtml(idx, '', 'Text', false, ''));
}

export function removePropertyRow(btn) {
  const row = btn.closest('.prop-row');
  if (row) row.remove();
}

function _collectPropertyRows() {
  const container = document.getElementById('entity-properties');
  if (!container) return [];
  const rows = container.querySelectorAll('.prop-row');
  const props = [];
  rows.forEach(row => {
    const name = row.querySelector('.prop-name')?.value?.trim();
    if (!name) return;
    props.push({
      name,
      type: row.querySelector('.prop-type')?.value || 'Text',
      required: row.querySelector('.prop-req input')?.checked || false,
      description: row.querySelector('.prop-desc')?.value?.trim() || '',
    });
  });
  return props;
}

// ─── Relationship Editor Modal ──────────────────────────────────────────────

let _editingRelName = null;

export function showRelationshipEditor(relName) {
  const modal = document.getElementById('relationship-editor-modal');
  if (!modal) return;

  const errEl = document.getElementById('rel-editor-error');
  if (errEl) errEl.style.display = 'none';

  _editingRelName = relName || null;
  const titleEl = modal.querySelector('h3');
  if (titleEl) titleEl.textContent = relName ? 'Edit Relationship' : 'Add Relationship';

  const nameInput = document.getElementById('rel-name');
  const descInput = document.getElementById('rel-description');
  const cardInput = document.getElementById('rel-cardinality');
  const domainSelect = document.getElementById('rel-domain');
  const rangeSelect = document.getElementById('rel-range');

  // Populate entity options for domain/range
  const ids = state.currentData ? listEntityIds(state.currentData) : [];
  const optionsHtml = ids.map(id => `<option value="${escapeHtml(id)}">${escapeHtml(id)}</option>`).join('');
  if (domainSelect) domainSelect.innerHTML = optionsHtml;
  if (rangeSelect) rangeSelect.innerHTML = optionsHtml;

  if (relName && state.currentData) {
    const rel = getRelationship(state.currentData, relName);
    if (rel) {
      if (nameInput) nameInput.value = rel.name;
      if (descInput) descInput.value = rel.description || '';
      if (cardInput) cardInput.value = rel.cardinality || '';
      // Select matching options
      if (domainSelect) _selectMultiple(domainSelect, rel.domainIncludes || []);
      if (rangeSelect) _selectMultiple(rangeSelect, rel.rangeIncludes || []);
    }
  } else {
    if (nameInput) nameInput.value = '';
    if (descInput) descInput.value = '';
    if (cardInput) cardInput.value = '0..*';
  }

  modal.style.display = 'flex';
}

function _selectMultiple(selectEl, values) {
  Array.from(selectEl.options).forEach(opt => {
    opt.selected = values.includes(opt.value);
  });
}

export function closeRelationshipEditor() {
  const modal = document.getElementById('relationship-editor-modal');
  if (modal) modal.style.display = 'none';
  _editingRelName = null;
}

export function doSaveRelationship() {
  const data = state.currentData;
  if (!data) return;

  const name = document.getElementById('rel-name')?.value?.trim();
  const description = document.getElementById('rel-description')?.value?.trim();
  const cardinality = document.getElementById('rel-cardinality')?.value?.trim();
  const domainSelect = document.getElementById('rel-domain');
  const rangeSelect = document.getElementById('rel-range');
  const domainIncludes = domainSelect ? Array.from(domainSelect.selectedOptions).map(o => o.value) : [];
  const rangeIncludes = rangeSelect ? Array.from(rangeSelect.selectedOptions).map(o => o.value) : [];
  const errEl = document.getElementById('rel-editor-error');

  pushUndoSnapshot(_editingRelName ? 'updateRelationship' : 'addRelationship');

  let result;
  if (_editingRelName) {
    result = updateRelationship(data, _editingRelName, { name, domainIncludes, rangeIncludes, description, cardinality });
    if (result.success) {
      // Remove old edges and add updated ones
      applyRelationshipToGraph({ name: _editingRelName }, 'remove');
      applyRelationshipToGraph({ name, domainIncludes, rangeIncludes }, 'add');
    }
  } else {
    result = addRelationship(data, { name, domainIncludes, rangeIncludes, description, cardinality });
    if (result.success) {
      applyRelationshipToGraph({ name, domainIncludes, rangeIncludes }, 'add');
    }
  }

  if (!result.success) {
    if (errEl) { errEl.textContent = result.error; errEl.style.display = 'block'; }
    state.authoringUndoStack.pop();
    return;
  }

  state.authoringDirty = true;
  _updateToolbarState();
  state.lastParsed = parseOntology(data, 'authoring');
  closeRelationshipEditor();
}

export function doDeleteRelationship() {
  if (!_editingRelName || !state.currentData) return;
  if (!confirm(`Delete relationship "${_editingRelName}"?`)) return;

  pushUndoSnapshot('removeRelationship');
  const result = removeRelationship(state.currentData, _editingRelName);
  if (result.success) {
    applyRelationshipToGraph({ name: _editingRelName }, 'remove');
    state.authoringDirty = true;
    state.lastParsed = parseOntology(state.currentData, 'authoring');
    _updateToolbarState();
  }
  closeRelationshipEditor();
}

// ─── Version Bump Modal ─────────────────────────────────────────────────────

export function showVersionBumpModal() {
  const modal = document.getElementById('version-bump-modal');
  if (!modal) return;
  const currentEl = document.getElementById('version-current');
  if (currentEl && state.currentData) {
    currentEl.textContent = getVersion(state.currentData);
  }
  modal.style.display = 'flex';
}

export function closeVersionBumpModal() {
  const modal = document.getElementById('version-bump-modal');
  if (modal) modal.style.display = 'none';
}

export function doVersionBump(bumpType) {
  if (!state.currentData) return;
  pushUndoSnapshot('bumpVersion');

  // Use createRevision for auto-changelog generation (Feature 7.2.1)
  const result = createRevision(state.currentData, bumpType);
  if (result.success) {
    state.authoringDirty = true;
    _updateToolbarState();
    document.getElementById('file-name').textContent =
      `${state.currentData.metadata?.name || 'Ontology'} v${result.newVersion}`;
    // Show changelog notification
    _showRevisionToast(result.oldVersion, result.newVersion, result.diff?.summary);
  }
  closeVersionBumpModal();
}

function _showRevisionToast(oldVer, newVer, summary) {
  const existing = document.getElementById('revision-toast');
  if (existing) existing.remove();

  const counts = summary
    ? `+${summary.entitiesAdded}E -${summary.entitiesRemoved}E ~${summary.entitiesModified}E | +${summary.relsAdded}R -${summary.relsRemoved}R`
    : '';

  const toast = document.createElement('div');
  toast.id = 'revision-toast';
  toast.className = 'revision-toast';
  toast.innerHTML = `<strong>${oldVer} → ${newVer}</strong> changelog generated${counts ? `<br><span style="font-size:11px;color:#aaa;">${counts}</span>` : ''}`;
  document.body.appendChild(toast);
  setTimeout(() => { toast.classList.add('visible'); }, 10);
  setTimeout(() => { toast.classList.remove('visible'); setTimeout(() => toast.remove(), 300); }, 3500);
}

// ─── Fork Modal ─────────────────────────────────────────────────────────────

export function showForkModal() {
  const modal = document.getElementById('fork-modal');
  if (!modal) return;
  const errEl = document.getElementById('fork-error');
  if (errEl) errEl.style.display = 'none';
  const nameInput = document.getElementById('fork-name');
  const nsInput = document.getElementById('fork-namespace');
  if (nameInput) nameInput.value = '';
  if (nsInput) nsInput.value = '';
  modal.style.display = 'flex';
}

export function closeForkModal() {
  const modal = document.getElementById('fork-modal');
  if (modal) modal.style.display = 'none';
}

export function doForkOntology(renderGraph) {
  const name = document.getElementById('fork-name')?.value?.trim();
  const ns = document.getElementById('fork-namespace')?.value?.trim();
  const errEl = document.getElementById('fork-error');

  try {
    const forked = forkOntology(state.currentData, name, ns);
    state.currentData = forked;
    const parsed = parseOntology(forked, `${ns}-ontology.json`);
    state.lastParsed = parsed;
    if (typeof renderGraph === 'function') renderGraph(parsed);
    document.getElementById('file-name').textContent = `${name} v1.0.0 (forked)`;
    enterAuthoringMode();
    closeForkModal();
  } catch (err) {
    if (errEl) { errEl.textContent = err.message; errEl.style.display = 'block'; }
  }
}

// ─── Save with Validation ───────────────────────────────────────────────────

export function showSaveWithValidation() {
  if (!state.currentData) return;
  const parsed = state.lastParsed || parseOntology(state.currentData, 'authoring');
  const validation = validateOAAv5(state.currentData, parsed);

  // Block save on core gate failures (G1, G7)
  const coreFailures = validation.gates.filter(g =>
    !g.advisory && !g.skipped && g.status === 'fail'
  );

  if (coreFailures.length > 0) {
    const gateNames = coreFailures.map(g => g.gate).join(', ');
    alert(`Cannot save: core OAA gates failed (${gateNames}). Fix issues before saving.`);
    return;
  }

  // Serialize and trigger download
  const json = serializeToOAAJsonLD(state.currentData);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const meta = state.currentData.metadata;
  a.href = url;
  a.download = `${(meta?.name || 'ontology').replace(/\s+/g, '-').toLowerCase()}-v${meta?.version || '1.0.0'}-oaa-v6.json`;
  a.click();
  URL.revokeObjectURL(url);

  state.authoringDirty = false;
  _updateToolbarState();
}

// ─── Undo / Redo Wrappers ───────────────────────────────────────────────────

export function doUndo(renderGraph) {
  const result = undo();
  if (result.success && typeof renderGraph === 'function') {
    renderGraph(state.lastParsed);
  }
  _updateToolbarState();
}

export function doRedo(renderGraph) {
  const result = redo();
  if (result.success && typeof renderGraph === 'function') {
    renderGraph(state.lastParsed);
  }
  _updateToolbarState();
}

// ─── Selection Mode (Feature 7.5) ──────────────────────────────────────────

export function toggleSelectionMode() {
  state.selectionMode = !state.selectionMode;
  const btn = document.getElementById('btn-selection-mode');
  if (btn) btn.classList.toggle('active', state.selectionMode);

  // Support both legacy and skeleton-driven toolbar IDs
  const selToolbar = document.getElementById('dynamic-selection-bar') || document.getElementById('selection-toolbar');
  if (selToolbar) selToolbar.style.display = state.selectionMode ? 'flex' : 'none';

  if (!state.selectionMode) {
    // Clear selection
    state.selectedNodeIds.clear();
    state.selectedEdgeIds.clear();
    _updateSelectionCount();
    // Restore normal node/edge colours by re-rendering
    if (state.lastParsed && state.network) {
      const nodes = state.network.body.data.nodes;
      nodes.get().forEach(n => {
        nodes.update({ id: n.id, opacity: 1.0 });
      });
    }
  }
}

export function selectAllNodes() {
  if (!state.network) return;
  const nodes = state.network.body.data.nodes.getIds();
  nodes.forEach(id => state.selectedNodeIds.add(id));
  const edges = state.network.body.data.edges.getIds();
  edges.forEach(id => state.selectedEdgeIds.add(id));
  _highlightSelection();
  _updateSelectionCount();
}

export function clearSelection() {
  state.selectedNodeIds.clear();
  state.selectedEdgeIds.clear();
  _updateSelectionCount();
  if (state.network) {
    const nodes = state.network.body.data.nodes;
    nodes.get().forEach(n => nodes.update({ id: n.id, opacity: 1.0 }));
  }
}

/**
 * Toggles a node in/out of the selection.
 * Called from app.js click handler when selectionMode is active.
 */
export function toggleNodeSelection(nodeId) {
  if (state.selectedNodeIds.has(nodeId)) {
    state.selectedNodeIds.delete(nodeId);
  } else {
    state.selectedNodeIds.add(nodeId);
  }
  // Auto-select edges whose from+to are both selected
  if (state.network) {
    const edges = state.network.body.data.edges.get();
    state.selectedEdgeIds.clear();
    edges.forEach(e => {
      if (state.selectedNodeIds.has(e.from) && state.selectedNodeIds.has(e.to)) {
        state.selectedEdgeIds.add(e.id);
      }
    });
  }
  _highlightSelection();
  _updateSelectionCount();
}

function _highlightSelection() {
  if (!state.network) return;
  const nodes = state.network.body.data.nodes;
  nodes.get().forEach(n => {
    nodes.update({ id: n.id, opacity: state.selectedNodeIds.has(n.id) ? 1.0 : 0.25 });
  });
}

function _updateSelectionCount() {
  const el = document.getElementById('selection-count');
  if (el) el.textContent = `${state.selectedNodeIds.size} nodes, ${state.selectedEdgeIds.size} edges`;
}

export function showSaveSelectionModal() {
  const modal = document.getElementById('save-selection-modal');
  if (!modal) return;
  document.getElementById('selection-save-name').value = '';
  modal.style.display = 'flex';
}

export function closeSaveSelectionModal() {
  const modal = document.getElementById('save-selection-modal');
  if (modal) modal.style.display = 'none';
}

export function doSaveSelection() {
  const name = document.getElementById('selection-save-name')?.value?.trim();
  if (!name) return;
  const entry = {
    name,
    nodeIds: Array.from(state.selectedNodeIds),
    edgeIds: Array.from(state.selectedEdgeIds),
    timestamp: Date.now(),
  };
  state.savedSelections.push(entry);
  try {
    localStorage.setItem('oaa-viz-saved-selections', JSON.stringify(state.savedSelections));
  } catch (_) { /* quota exceeded — ignore */ }
  closeSaveSelectionModal();
}

export function loadSavedSelection(index) {
  const entry = state.savedSelections[index];
  if (!entry) return;
  state.selectedNodeIds = new Set(entry.nodeIds);
  state.selectedEdgeIds = new Set(entry.edgeIds);
  if (!state.selectionMode) toggleSelectionMode();
  _highlightSelection();
  _updateSelectionCount();
}

export function deleteSavedSelection(index) {
  state.savedSelections.splice(index, 1);
  try {
    localStorage.setItem('oaa-viz-saved-selections', JSON.stringify(state.savedSelections));
  } catch (_) { /* ignore */ }
}

// ─── Revision History Panel (Feature 7.2.3) ─────────────────────────────────

export function showRevisionHistoryPanel() {
  const modal = document.getElementById('revision-history-modal');
  if (!modal) return;
  _renderRevisionHistory();
  modal.style.display = 'flex';
}

export function closeRevisionHistoryPanel() {
  const modal = document.getElementById('revision-history-modal');
  if (modal) modal.style.display = 'none';
}

function _renderRevisionHistory() {
  const container = document.getElementById('revision-history-content');
  if (!container) return;

  const revisions = getRevisionHistory();

  if (revisions.length === 0) {
    container.innerHTML = '<p style="color:#666; font-size:13px;">No revisions yet. Use "New Revision" to create a version bump with auto-generated changelog.</p>';
    return;
  }

  let html = '';
  revisions.forEach((rev, i) => {
    const date = rev.timestamp.split('T')[0];
    const time = rev.timestamp.split('T')[1]?.substring(0, 5) || '';
    const s = rev.diff?.summary || {};
    const entityChanges = (s.entitiesAdded || 0) + (s.entitiesRemoved || 0) + (s.entitiesModified || 0);
    const relChanges = (s.relsAdded || 0) + (s.relsRemoved || 0) + (s.relsModified || 0);

    html += `<div class="revision-entry" data-index="${i}">`;
    html += `<div class="revision-header" onclick="toggleRevisionDetail(${i})">`;
    html += `<span class="revision-version"><strong>${escapeHtml(rev.oldVersion)} → ${escapeHtml(rev.newVersion)}</strong></span>`;
    html += `<span class="revision-badge revision-badge--${rev.bumpType}">${rev.bumpType}</span>`;
    html += `<span class="revision-date">${date} ${time}</span>`;
    html += `<span class="revision-stats">${entityChanges}E ${relChanges}R</span>`;
    html += `<span class="revision-expand">&#x25BC;</span>`;
    html += `</div>`;

    // Expandable detail (collapsed by default)
    html += `<div class="revision-detail" id="revision-detail-${i}" style="display:none;">`;

    // Summary
    if (s.entitiesAdded) html += `<div class="revision-change add">+${s.entitiesAdded} entities added</div>`;
    if (s.entitiesRemoved) html += `<div class="revision-change remove">-${s.entitiesRemoved} entities removed</div>`;
    if (s.entitiesModified) html += `<div class="revision-change modify">~${s.entitiesModified} entities modified</div>`;
    if (s.relsAdded) html += `<div class="revision-change add">+${s.relsAdded} relationships added</div>`;
    if (s.relsRemoved) html += `<div class="revision-change remove">-${s.relsRemoved} relationships removed</div>`;
    if (s.relsModified) html += `<div class="revision-change modify">~${s.relsModified} relationships modified</div>`;

    // Entity details
    const entities = rev.diff?.entities;
    if (entities?.added?.length) {
      html += `<div class="revision-section"><strong>Added:</strong> ${entities.added.map(e => escapeHtml(e.id)).join(', ')}</div>`;
    }
    if (entities?.removed?.length) {
      html += `<div class="revision-section"><strong>Removed:</strong> ${entities.removed.map(e => `<s>${escapeHtml(e.id)}</s>`).join(', ')}</div>`;
    }
    if (entities?.modified?.length) {
      html += `<div class="revision-section"><strong>Modified:</strong> ${entities.modified.map(e => `${escapeHtml(e.id)} (${e.changes?.join(', ') || 'props'})`).join('; ')}</div>`;
    }

    html += `</div></div>`;
  });

  container.innerHTML = html;
}

export function toggleRevisionDetail(index) {
  const detail = document.getElementById(`revision-detail-${index}`);
  if (!detail) return;
  const isOpen = detail.style.display !== 'none';
  detail.style.display = isOpen ? 'none' : 'block';
  // Toggle arrow
  const entry = detail.closest('.revision-entry');
  const arrow = entry?.querySelector('.revision-expand');
  if (arrow) arrow.innerHTML = isOpen ? '&#x25BC;' : '&#x25B2;';
}

/**
 * Exports all revision changelogs as a single Markdown document. (Story 7.2.4)
 */
export function doExportRevisionDocs() {
  const md = exportRevisionDocs();
  const name = state.currentData?.metadata?.name || 'ontology';
  const baseName = name.replace(/\s+/g, '-').toLowerCase();
  const blob = new Blob([md], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${baseName}-revision-history.md`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Glossary Editor (Feature 7.2.2) ────────────────────────────────────────

export async function showGlossaryEditor() {
  const modal = document.getElementById('glossary-editor-modal');
  if (!modal) return;

  // Ensure glossary is loaded
  await loadGlossary();

  _renderGlossaryEditor('');
  modal.style.display = 'flex';

  // Focus search
  const searchInput = document.getElementById('glossary-search');
  if (searchInput) { searchInput.value = ''; searchInput.focus(); }
}

export function closeGlossaryEditor() {
  const modal = document.getElementById('glossary-editor-modal');
  if (modal) modal.style.display = 'none';
}

export function doSearchGlossary() {
  const query = document.getElementById('glossary-search')?.value?.trim();
  _renderGlossaryEditor(query || '');
}

function _renderGlossaryEditor(query) {
  const container = document.getElementById('glossary-results');
  if (!container) return;

  let html = '';

  // Show custom entries first if no query or matching
  const customEntries = getCustomGlossaryEntries();
  if (customEntries.length > 0 && !query) {
    html += '<div class="glossary-section"><h4 style="color:#9dfff5; margin:0 0 8px;">Custom Entries</h4>';
    customEntries.forEach(entry => {
      html += _glossaryEntryHtml(entry.term, entry.definition, entry.ontology, true);
    });
    html += '</div>';
  }

  // Search results
  if (query) {
    const results = searchGlossary(query);
    if (results.length === 0) {
      html += '<p style="color:#666; font-size:13px;">No matching terms found.</p>';
    } else {
      html += `<div class="glossary-section"><h4 style="color:#888; margin:0 0 8px;">${results.length} result${results.length !== 1 ? 's' : ''}</h4>`;
      results.slice(0, 50).forEach(r => {
        const isCustom = r.layer === 'custom';
        html += _glossaryEntryHtml(r.term, r.definition, r.ontology, isCustom);
      });
      html += '</div>';
    }
  } else if (customEntries.length === 0) {
    html += '<p style="color:#666; font-size:13px;">Search the glossary above, or add a new term.</p>';
  }

  // Auto-suggest section
  if (!query && state.currentData) {
    const suggestions = suggestGlossaryLinks(state.currentData);
    if (suggestions.length > 0) {
      html += '<div class="glossary-section" style="margin-top:12px;"><h4 style="color:#FF9800; margin:0 0 8px;">Suggested Links</h4>';
      suggestions.forEach(s => {
        html += `<div class="glossary-suggestion">`;
        html += `<span>${escapeHtml(s.entityName)}</span> → `;
        html += `<span style="color:#9dfff5;">${escapeHtml(s.matches[0]?.term || '')}</span> `;
        html += `<button class="oaa-btn oaa-btn-secondary" style="font-size:10px; padding:2px 6px;" onclick="doLinkSuggestion('${escapeHtml(s.matches[0]?.term)}', '${escapeHtml(s.entityId)}')">Link</button>`;
        html += `</div>`;
      });
      html += '</div>';
    }
  }

  container.innerHTML = html;
}

function _glossaryEntryHtml(term, definition, ontology, isCustom) {
  const editBtns = isCustom
    ? `<button class="glossary-action" onclick="doEditGlossaryEntry('${escapeHtml(term)}')" title="Edit">&#x270E;</button>
       <button class="glossary-action" onclick="doRemoveGlossaryEntry('${escapeHtml(term)}')" title="Remove" style="color:#fca5a5;">&#x2715;</button>`
    : '';
  return `<div class="glossary-entry">
    <div class="glossary-term">${escapeHtml(term)} <span class="glossary-ont">${escapeHtml(ontology)}</span>${editBtns}</div>
    <div class="glossary-def">${escapeHtml(definition)}</div>
  </div>`;
}

export function showAddGlossaryForm() {
  const form = document.getElementById('glossary-add-form');
  if (form) form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

export function doAddGlossaryEntry() {
  const term = document.getElementById('glossary-new-term')?.value?.trim();
  const def = document.getElementById('glossary-new-def')?.value?.trim();
  const ont = document.getElementById('glossary-new-ont')?.value?.trim();
  const errEl = document.getElementById('glossary-add-error');

  if (!term || !def) {
    if (errEl) { errEl.textContent = 'Term and definition required'; errEl.style.display = 'block'; }
    return;
  }

  const result = addGlossaryEntry(term, def, ont || undefined);
  if (!result.success) {
    if (errEl) { errEl.textContent = result.error; errEl.style.display = 'block'; }
    return;
  }

  if (errEl) errEl.style.display = 'none';
  document.getElementById('glossary-new-term').value = '';
  document.getElementById('glossary-new-def').value = '';
  document.getElementById('glossary-add-form').style.display = 'none';
  _renderGlossaryEditor('');
}

export function doEditGlossaryEntry(term) {
  const newDef = prompt(`Update definition for "${term}":`, '');
  if (newDef === null) return;
  updateGlossaryEntryFn(term, { definition: newDef });
  _renderGlossaryEditor('');
}

export function doRemoveGlossaryEntry(term) {
  if (!confirm(`Remove custom glossary entry "${term}"?`)) return;
  removeGlossaryEntryFn(term);
  _renderGlossaryEditor('');
}

export function doLinkSuggestion(term, entityId) {
  linkGlossaryToNode(term, entityId);
  _renderGlossaryEditor('');
}

// ─── Glossary-to-Node Linking (Feature 7.2.5) ──────────────────────────────

export function showGlossaryLinkModal(entityId) {
  const modal = document.getElementById('glossary-link-modal');
  if (!modal) return;
  modal.dataset.entityId = entityId || '';

  const titleEl = document.getElementById('glossary-link-entity');
  if (titleEl) titleEl.textContent = entityId || 'Unknown';

  // Show existing links
  _renderNodeGlossaryLinks(entityId);

  // Reset search
  const searchInput = document.getElementById('glossary-link-search');
  if (searchInput) searchInput.value = '';
  const resultsEl = document.getElementById('glossary-link-results');
  if (resultsEl) resultsEl.innerHTML = '';

  modal.style.display = 'flex';
}

export function closeGlossaryLinkModal() {
  const modal = document.getElementById('glossary-link-modal');
  if (modal) modal.style.display = 'none';
}

export function doSearchGlossaryForLink() {
  const query = document.getElementById('glossary-link-search')?.value?.trim();
  const resultsEl = document.getElementById('glossary-link-results');
  const entityId = document.getElementById('glossary-link-modal')?.dataset.entityId;
  if (!resultsEl || !query) { if (resultsEl) resultsEl.innerHTML = ''; return; }

  const results = searchGlossary(query);
  if (results.length === 0) {
    resultsEl.innerHTML = '<p style="color:#666; font-size:12px;">No matches</p>';
    return;
  }

  let html = '';
  results.slice(0, 20).forEach(r => {
    html += `<div class="glossary-link-item" onclick="doLinkGlossaryToNode('${escapeHtml(r.term)}', '${escapeHtml(entityId)}')">`;
    html += `<span class="glossary-link-term">${escapeHtml(r.term)}</span>`;
    html += `<span class="glossary-link-def">${escapeHtml(r.definition).substring(0, 60)}</span>`;
    html += `</div>`;
  });
  resultsEl.innerHTML = html;
}

export function doLinkGlossaryToNode(term, entityId) {
  linkGlossaryToNode(term, entityId);
  _renderNodeGlossaryLinks(entityId);
  const resultsEl = document.getElementById('glossary-link-results');
  if (resultsEl) resultsEl.innerHTML = '<p style="color:#4CAF50; font-size:12px;">Linked!</p>';
}

export function doUnlinkGlossaryFromNode(term, entityId) {
  unlinkGlossaryFromNode(term, entityId);
  _renderNodeGlossaryLinks(entityId);
}

function _renderNodeGlossaryLinks(entityId) {
  const container = document.getElementById('glossary-link-current');
  if (!container || !entityId) return;

  const linked = getGlossaryForNode(entityId);
  if (linked.length === 0) {
    container.innerHTML = '<p style="color:#666; font-size:12px;">No glossary links</p>';
    return;
  }

  let html = '';
  linked.forEach(entry => {
    html += `<div class="glossary-linked-entry">`;
    html += `<span class="glossary-term">${escapeHtml(entry.term)}</span>`;
    html += `<span class="glossary-def">${escapeHtml(entry.definition).substring(0, 80)}</span>`;
    html += `<button class="glossary-action" onclick="doUnlinkGlossaryFromNode('${escapeHtml(entry.term)}', '${escapeHtml(entityId)}')" title="Unlink" style="color:#fca5a5;">&#x2715;</button>`;
    html += `</div>`;
  });
  container.innerHTML = html;
}

/**
 * Renders glossary links for a node in the sidebar details tab.
 * Called from ui-panels.js when a node is selected.
 */
export function renderGlossaryLinksForNode(entityId) {
  const linked = getGlossaryForNode(entityId);
  if (linked.length === 0) return '';

  let html = '<div class="sidebar-glossary"><h4 style="color:#9dfff5; font-size:12px; margin:12px 0 6px;">Glossary</h4>';
  linked.forEach(entry => {
    html += `<div style="margin-bottom:6px;">`;
    html += `<strong style="color:#e0e0e0; font-size:12px;">${escapeHtml(entry.term)}</strong>`;
    html += `<div style="color:#888; font-size:11px;">${escapeHtml(entry.definition)}</div>`;
    html += `</div>`;
  });
  html += '</div>';
  return html;
}
