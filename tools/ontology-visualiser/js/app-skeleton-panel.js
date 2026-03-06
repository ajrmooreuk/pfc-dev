/**
 * App Skeleton Inspector Panel — Z22 (F40.18 + F40.19 Editor)
 *
 * Introspects the loaded application skeleton, showing:
 * - Spatial zone diagram (CSS grid mini wireframe)
 * - Zones tab: all zones with type, position, visibility, cascade tier
 * - Functions tab: zone-to-component mapping (with reorder/move in edit mode)
 * - Nav Layers tab: L1-L4 layers with their nav items (with reorder/move in edit mode)
 *
 * F40.19 adds edit mode: reorder nav items, move between layers, reorder/move components.
 *
 * Reads from state.zoneRegistry, state.navLayerRegistry, state.appSkeleton.
 */

import { state } from './state.js';
import { getVisibleZones } from './app-skeleton-loader.js';

function esc(s) { return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

/* ── Cascade tier badge ── */
function _cascadeTierBadge(tier) {
  const t = String(tier || 'PFC').toUpperCase();
  const cls = t === 'PFI' ? 'skeleton-tier-pfi' : 'skeleton-tier-pfc';
  return `<span class="skeleton-tier-badge ${cls}">${esc(t)}</span>`;
}

/* ── Zone type → CSS colour hint (used by spatial diagram) ── */
function _zoneTypeClass(zoneType) {
  const t = String(zoneType || 'Fixed').toLowerCase();
  if (t === 'fixed') return 'zone-type-fixed';
  if (t === 'sliding') return 'zone-type-sliding';
  if (t === 'conditional') return 'zone-type-conditional';
  if (t === 'floating') return 'zone-type-floating';
  if (t === 'overlay') return 'zone-type-overlay';
  return 'zone-type-fixed';
}

/* ── Check if a zone is currently visible ── */
function _isZoneVisible(zoneId) {
  try {
    const visible = getVisibleZones(state.currentView || 'graph', state);
    return visible.has(zoneId);
  } catch {
    const entry = state.zoneRegistry.get(zoneId);
    return entry?.zone?.['ds:defaultVisible'] === true;
  }
}

/* ── Scroll to zone card in the detail list ── */
function _scrollToZoneCard(zoneId) {
  const card = document.getElementById('skeleton-zone-' + zoneId);
  if (card) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ── Zone block helper for spatial diagram ── */
function _zoneBlock(zoneId, label, extraClass) {
  const entry = state.zoneRegistry.get(zoneId);
  const zoneType = entry?.zone?.['ds:zoneType'] || 'Fixed';
  const visible = _isZoneVisible(zoneId);
  const visClass = visible ? 'zone-visible' : 'zone-hidden';
  const typeClass = _zoneTypeClass(zoneType);
  const fullName = entry?.zone?.['ds:zoneName'] || zoneId;
  return `<div class="skeleton-zone-block ${typeClass} ${visClass} ${extraClass || ''}" title="${esc(zoneId + ': ' + fullName)}" onclick="(function(){ document.getElementById('skeleton-zone-${esc(zoneId)}')?.scrollIntoView({behavior:'smooth',block:'start'}) })()">${esc(label || zoneId)}</div>`;
}

/* ── Edit mode helpers ── */
function _editBtn(label, title, onclick, disabled) {
  const dis = disabled ? ' disabled' : '';
  return `<button class="skeleton-arrow-btn" title="${esc(title)}" onclick="${esc(onclick)}"${dis}>${label}</button>`;
}

function _lockIcon() {
  return `<span class="skeleton-lock-icon" title="PFC-tier — immutable (BR-DS-013)">&#x1F512;</span>`;
}

function _layerSelect(itemId, currentLayerRef) {
  const layers = [...state.navLayerRegistry.entries()];
  let html = `<select class="skeleton-move-select" title="Move to layer" onchange="moveNavItemToLayer('${esc(itemId)}', this.value)">`;
  for (const [lid, entry] of layers) {
    const sel = entry.layer['@id'] === currentLayerRef ? ' selected' : '';
    html += `<option value="${esc(lid)}"${sel}>${esc(lid)}</option>`;
  }
  html += '</select>';
  return html;
}

function _zoneSelect(placementId, currentZoneRef) {
  const zones = [...state.zoneRegistry.entries()].sort((a, b) => {
    const aIdx = parseInt(a[0].replace(/\D/g, '')) || 0;
    const bIdx = parseInt(b[0].replace(/\D/g, '')) || 0;
    return aIdx - bIdx;
  });
  let html = `<select class="skeleton-move-select" title="Move to zone" onchange="moveZoneComponentToZone('${esc(placementId)}', this.value)">`;
  for (const [zid, entry] of zones) {
    const sel = entry.zone['@id'] === currentZoneRef ? ' selected' : '';
    html += `<option value="${esc(zid)}"${sel}>${esc(zid)}</option>`;
  }
  html += '</select>';
  return html;
}

function _layerZoneSelect(layerId, currentZoneRef) {
  const toolbarZones = ['Z2', 'Z4', 'Z4b'];
  let html = `<select class="skeleton-move-select" title="Move layer to zone" onchange="moveLayerToZone('${esc(layerId)}', this.value)">`;
  for (const zid of toolbarZones) {
    const entry = state.zoneRegistry.get(zid);
    if (!entry) continue;
    const sel = entry.zone['@id'] === currentZoneRef ? ' selected' : '';
    html += `<option value="${esc(zid)}"${sel}>${esc(zid)} — ${esc(entry.zone['ds:zoneName'] || '')}</option>`;
  }
  html += '</select>';
  return html;
}

/* ────────────────────────────────────────────────
   Public API
   ──────────────────────────────────────────────── */

/**
 * Toggle skeleton inspector panel open/close.
 */
export function toggleSkeletonPanel() {
  const panel = document.getElementById('skeleton-panel');
  if (!panel) return;
  const opening = !panel.classList.contains('open');
  panel.classList.toggle('open');
  state.skeletonPanelOpen = opening;
  if (opening) renderSkeletonPanel();
}

/**
 * Switch between zones / functions / nav tabs.
 */
export function switchSkeletonTab(tabName) {
  state.skeletonPanelTab = tabName;
  document.querySelectorAll('.skeleton-tab').forEach(btn => {
    const match = btn.textContent.trim().toLowerCase().replace(/\s+/g, '');
    const target = tabName === 'nav' ? 'navlayers' : tabName;
    btn.classList.toggle('active', match === target);
  });
  ['zones', 'functions', 'nav', 'properties'].forEach(name => {
    const el = document.getElementById('skeleton-tab-' + name);
    if (el) el.style.display = name === tabName ? 'block' : 'none';
  });
  // Re-render the active tab content
  const container = document.getElementById('skeleton-tab-' + tabName);
  if (!container) return;
  if (tabName === 'zones') renderZonesTab(container);
  else if (tabName === 'functions') renderFunctionsTab(container);
  else if (tabName === 'nav') renderNavTab(container);
  else if (tabName === 'properties') renderPropertiesTab(container);
}

/**
 * Top-level render: edit toolbar + spatial diagram + active tab.
 */
export function renderSkeletonPanel() {
  if (state.zoneRegistry.size === 0) {
    const diag = document.getElementById('skeleton-spatial-diagram');
    if (diag) diag.innerHTML = '';
    const toolbar = document.getElementById('skeleton-edit-toolbar');
    if (toolbar) toolbar.innerHTML = '';
    ['zones', 'functions', 'nav', 'properties'].forEach(t => {
      const el = document.getElementById('skeleton-tab-' + t);
      if (el) el.innerHTML = '<div class="skeleton-empty">No skeleton loaded. Click Load Registry to populate.</div>';
    });
    return;
  }

  _renderEditToolbar();

  const diagEl = document.getElementById('skeleton-spatial-diagram');
  if (diagEl) renderSpatialDiagram(diagEl);

  const tab = state.skeletonPanelTab || 'zones';
  const container = document.getElementById('skeleton-tab-' + tab);
  if (!container) return;
  if (tab === 'zones') renderZonesTab(container);
  else if (tab === 'functions') renderFunctionsTab(container);
  else if (tab === 'nav') renderNavTab(container);
  else if (tab === 'properties') renderPropertiesTab(container);
}

/**
 * Render edit toolbar (Edit/Undo/Redo/Save/Export/Discard).
 */
function _renderEditToolbar() {
  const el = document.getElementById('skeleton-edit-toolbar');
  if (!el) return;

  if (!state.skeletonEditMode) {
    const disabled = !state.appSkeleton ? ' disabled' : '';
    el.innerHTML = `<button class="skeleton-edit-toggle" onclick="enterSkeletonEditMode()"${disabled}>Edit</button>`;
    return;
  }

  const undoDisabled = state.skeletonUndoStack.length === 0 ? ' disabled' : '';
  const redoDisabled = state.skeletonRedoStack.length === 0 ? ' disabled' : '';
  const dirty = state.skeletonDirty ? '<span class="skeleton-dirty-dot"></span>' : '';

  el.innerHTML = `
    ${dirty}
    <button class="skeleton-edit-toggle active" onclick="exitSkeletonEditMode(false)">Done</button>
    <button class="skeleton-arrow-btn" onclick="undoSkeletonEdit()" title="Undo"${undoDisabled}>&#x21A9;</button>
    <button class="skeleton-arrow-btn" onclick="redoSkeletonEdit()" title="Redo"${redoDisabled}>&#x21AA;</button>
    <button class="skeleton-save-btn" onclick="saveSkeletonToLibrary()" title="Save to ontology library">Save</button>
    <button class="skeleton-arrow-btn" onclick="exportSkeletonJsonld()" title="Download JSONLD file">&#x2B73;</button>
    <button class="skeleton-arrow-btn" onclick="exitSkeletonEditMode(true)" title="Discard changes">&#x2718;</button>
  `;
}

/**
 * Render CSS grid mini wireframe showing zone layout.
 */
export function renderSpatialDiagram(container) {
  let html = '';

  // Row 1: Z1 Header (full width)
  html += _zoneBlock('Z1', 'Z1 Header', 'zone-full');

  // Row 2: Z2 Toolbar (full width)
  html += _zoneBlock('Z2', 'Z2 Toolbar', 'zone-full');

  // Row 3: Conditional bars (full width)
  html += `<div class="skeleton-zone-block zone-type-conditional zone-full ${_isZoneVisible('Z3') || _isZoneVisible('Z4') || _isZoneVisible('Z5') ? 'zone-visible' : 'zone-hidden'}" style="font-size:7px;" title="Z3/Z4/Z4b/Z5: Conditional bars" onclick="(function(){ document.getElementById('skeleton-zone-Z3')?.scrollIntoView({behavior:'smooth',block:'start'}) })()">Z3 Z4 Z4b Z5</div>`;

  // Row 4: Left panels | Canvas | Right panels
  const leftZones = ['Z10', 'Z12', 'Z14', 'Z21', 'Z22'];
  const rightZones = ['Z9', 'Z11', 'Z13', 'Z15', 'Z16', 'Z17'];

  let leftHtml = '<div style="display:flex; flex-direction:column; gap:1px; height:100%;">';
  leftZones.forEach(z => {
    const entry = state.zoneRegistry.get(z);
    const vis = _isZoneVisible(z);
    const typeClass = _zoneTypeClass(entry?.zone?.['ds:zoneType'] || 'Sliding');
    leftHtml += `<div class="skeleton-zone-block ${typeClass} ${vis ? 'zone-visible' : 'zone-hidden'}" style="flex:1; font-size:7px;" title="${esc(z + ': ' + (entry?.zone?.['ds:zoneName'] || z))}" onclick="(function(){ document.getElementById('skeleton-zone-${z}')?.scrollIntoView({behavior:'smooth',block:'start'}) })()">${z}</div>`;
  });
  leftHtml += '</div>';

  let rightHtml = '<div style="display:flex; flex-direction:column; gap:1px; height:100%;">';
  rightZones.forEach(z => {
    const entry = state.zoneRegistry.get(z);
    const vis = _isZoneVisible(z);
    const typeClass = _zoneTypeClass(entry?.zone?.['ds:zoneType'] || 'Sliding');
    rightHtml += `<div class="skeleton-zone-block ${typeClass} ${vis ? 'zone-visible' : 'zone-hidden'}" style="flex:1; font-size:7px;" title="${esc(z + ': ' + (entry?.zone?.['ds:zoneName'] || z))}" onclick="(function(){ document.getElementById('skeleton-zone-${z}')?.scrollIntoView({behavior:'smooth',block:'start'}) })()">${z}</div>`;
  });
  rightHtml += '</div>';

  html += leftHtml;
  html += _zoneBlock('Z6', 'Z6 Canvas', '');
  html += rightHtml;

  // Row 5: Floating zones
  html += _zoneBlock('Z7', 'Z7 Legend', '');
  html += `<div></div>`; // empty center
  html += _zoneBlock('Z8', 'Z8 Layers', '');

  html += '</div>'; // close the grid (it's the container itself)

  // Overlay indicators (outside grid)
  html += '<div class="skeleton-overlay-row">';
  ['Z18', 'Z19', 'Z20'].forEach(z => {
    const entry = state.zoneRegistry.get(z);
    const name = entry?.zone?.['ds:zoneName'] || z;
    html += `<span class="skeleton-overlay-badge" title="${esc(z + ': ' + name)}">${esc(z)}</span>`;
  });
  html += '</div>';

  container.innerHTML = html;
}

/**
 * Zones tab: all zones with metadata.
 */
export function renderZonesTab(container) {
  if (state.zoneRegistry.size === 0) {
    container.innerHTML = '<div class="skeleton-empty">No zones loaded.</div>';
    return;
  }

  let html = '';
  const sorted = [...state.zoneRegistry.entries()].sort((a, b) => {
    const aIdx = parseInt(a[0].replace(/\D/g, '')) || 0;
    const bIdx = parseInt(b[0].replace(/\D/g, '')) || 0;
    return aIdx - bIdx;
  });

  for (const [zoneId, entry] of sorted) {
    const z = entry.zone;
    const visible = _isZoneVisible(zoneId);
    const cmpCount = entry.components?.length || 0;

    html += `<div class="skeleton-card" id="skeleton-zone-${esc(zoneId)}">
      <div class="skeleton-card-header">
        <span>${esc(zoneId)}: ${esc(z['ds:zoneName'] || '')}</span>
        ${_cascadeTierBadge(z['ds:cascadeTier'])}
      </div>
      <div class="skeleton-card-body">
        <div class="skeleton-field"><span class="skeleton-field-label">Type</span><span class="skeleton-field-value">${esc(z['ds:zoneType'])}</span></div>
        <div class="skeleton-field"><span class="skeleton-field-label">Position</span><span class="skeleton-field-value">${esc(z['ds:position'])}</span></div>
        <div class="skeleton-field"><span class="skeleton-field-label">Width</span><span class="skeleton-field-value">${esc(z['ds:defaultWidth'])}</span></div>
        <div class="skeleton-field"><span class="skeleton-field-label">Visible</span><span class="skeleton-field-value">${z['ds:defaultVisible'] ? 'Yes' : 'No'}${visible && !z['ds:defaultVisible'] ? ' (active)' : ''}</span></div>
        ${z['ds:visibilityCondition'] ? `<div class="skeleton-field"><span class="skeleton-field-label">Condition</span><span class="skeleton-field-value" style="font-family:monospace; font-size:10px;">${esc(z['ds:visibilityCondition'])}</span></div>` : ''}
        <div class="skeleton-field"><span class="skeleton-field-label">Z-Index</span><span class="skeleton-field-value">${z['ds:zIndex'] ?? '—'}</span></div>
        <div class="skeleton-field"><span class="skeleton-field-label">Components</span><span class="skeleton-field-value">${cmpCount}</span></div>
      </div>
    </div>`;
  }

  container.innerHTML = html;
}

/**
 * Functions tab: zone → component placement mapping.
 * In edit mode: drag handles, up/down arrows, move-to-zone dropdown.
 */
export function renderFunctionsTab(container) {
  if (state.zoneRegistry.size === 0) {
    container.innerHTML = '<div class="skeleton-empty">No zones loaded.</div>';
    return;
  }

  const editing = state.skeletonEditMode;
  let html = '';
  const sorted = [...state.zoneRegistry.entries()].sort((a, b) => {
    const aIdx = parseInt(a[0].replace(/\D/g, '')) || 0;
    const bIdx = parseInt(b[0].replace(/\D/g, '')) || 0;
    return aIdx - bIdx;
  });

  for (const [zoneId, entry] of sorted) {
    const z = entry.zone;
    const cmps = entry.components || [];

    html += `<div class="skeleton-card" id="skeleton-func-${esc(zoneId)}">
      <div class="skeleton-card-header">
        <span>${esc(zoneId)}: ${esc(z['ds:zoneName'] || '')}</span>
        <span style="font-size:10px; color:var(--viz-text-muted);">${cmps.length} component${cmps.length !== 1 ? 's' : ''}</span>
      </div>`;

    if (cmps.length === 0) {
      html += '<div class="skeleton-card-body"><span style="color:var(--viz-text-muted); font-size:11px; font-style:italic;">(empty)</span></div>';
    } else {
      html += '<div class="skeleton-component-list">';
      cmps.forEach((c, i) => {
        const pid = c['ds:placementId'] || '';
        const placesRef = c['ds:placesComponent']?.['@id'] || '—';
        const slot = c['ds:slotName'] || '—';
        const zoneRef = c['ds:placedInZone']?.['@id'] || '';
        const isPFC = (c['ds:cascadeTier'] || 'PFC').toUpperCase() === 'PFC';
        const isFirst = i === 0;
        const isLast = i === cmps.length - 1;

        const dragAttrs = editing
          ? ` draggable="true" ondragstart="event.dataTransfer.setData('text/plain','cmp:${esc(pid)}')" ondragover="event.preventDefault();this.classList.add('skeleton-drop-target')" ondragleave="this.classList.remove('skeleton-drop-target')" ondrop="event.preventDefault();this.classList.remove('skeleton-drop-target');_handleCmpDrop(event,'${esc(pid)}','${esc(zoneId)}')"` : '';

        const editControls = editing
          ? `<span class="skeleton-edit-controls">
              ${isPFC ? _lockIcon() : ''}
              <span class="skeleton-drag-handle" title="Drag to reorder">&#x2630;</span>
              ${_editBtn('&#x25B2;', 'Move up', `reorderZoneComponent('${esc(pid)}','up')`, isFirst)}
              ${_editBtn('&#x25BC;', 'Move down', `reorderZoneComponent('${esc(pid)}','down')`, isLast)}
              ${_zoneSelect(pid, zoneRef)}
            </span>` : '';

        html += `<div class="skeleton-component-item${editing ? ' skeleton-editable' : ''}"${dragAttrs}>
          ${editControls}
          <span class="cmp-name">${esc(pid)}</span>
          <span style="margin-left:6px; font-size:10px; color:var(--viz-text-muted);">slot: ${esc(slot)}</span>
          <span style="margin-left:6px; font-size:10px; color:var(--viz-text-secondary);">${esc(placesRef)}</span>
          ${_cascadeTierBadge(c['ds:cascadeTier'])}
        </div>`;
      });
      html += '</div>';
    }

    html += '</div>';
  }

  container.innerHTML = html;
}

/**
 * Nav Layers tab: L1-L4 layers with nav items.
 * In edit mode: drag handles, up/down arrows, move-to-layer dropdown.
 */
export function renderNavTab(container) {
  if (state.navLayerRegistry.size === 0) {
    container.innerHTML = '<div class="skeleton-empty">No nav layers loaded.</div>';
    return;
  }

  const editing = state.skeletonEditMode;
  let html = '';
  const sorted = [...state.navLayerRegistry.entries()].sort((a, b) => {
    const aLevel = a[1].layer?.['ds:layerLevel'] ?? 0;
    const bLevel = b[1].layer?.['ds:layerLevel'] ?? 0;
    return aLevel - bLevel;
  });

  for (const [layerId, entry] of sorted) {
    const layer = entry.layer;
    const items = entry.items || [];

    html += `<div class="skeleton-card">
      <div class="skeleton-card-header">
        <span>${esc(layerId)}: ${esc(layer['ds:layerName'] || '')}</span>
        ${_cascadeTierBadge(layer['ds:cascadeTier'])}
      </div>
      <div class="skeleton-card-body">
        <div class="skeleton-field"><span class="skeleton-field-label">Level</span><span class="skeleton-field-value">${layer['ds:layerLevel'] ?? '—'}</span></div>
        <div class="skeleton-field"><span class="skeleton-field-label">Render Order</span><span class="skeleton-field-value">${layer['ds:renderOrder'] ?? '—'}</span></div>
        <div class="skeleton-field"><span class="skeleton-field-label">Zone</span>${editing ? _layerZoneSelect(layerId, layer['ds:navLayerInZone']?.['@id']) : `<span class="skeleton-field-value">${esc(layer['ds:navLayerInZone']?.['@id']?.replace('ds:zone-', '') || '—')}</span>`}</div>
        <div class="skeleton-field"><span class="skeleton-field-label">Items</span><span class="skeleton-field-value">${items.length}</span></div>`;

    if (items.length > 0) {
      html += '<div style="margin-top: 6px;">';
      items.forEach((item, i) => {
        const iid = item['ds:itemId'] || '';
        const layerRef = item['ds:belongsToLayer']?.['@id'] || '';
        const shortcut = item['ds:shortcut'] ? `<span style="font-size:9px; color:var(--viz-text-muted); margin-left:auto;">${esc(item['ds:shortcut'])}</span>` : '';
        const condition = item['ds:visibilityCondition'] ? `<span style="font-size:9px; color:var(--viz-text-muted); font-family:monospace; margin-left:4px;" title="${esc(item['ds:visibilityCondition'])}">*</span>` : '';

        const isPFC = (item['ds:cascadeTier'] || 'PFC').toUpperCase() === 'PFC';
        const isFirst = i === 0;
        const isLast = i === items.length - 1;

        const dragAttrs = editing
          ? ` draggable="true" ondragstart="event.dataTransfer.setData('text/plain','nav:${esc(iid)}')" ondragover="event.preventDefault();this.classList.add('skeleton-drop-target')" ondragleave="this.classList.remove('skeleton-drop-target')" ondrop="event.preventDefault();this.classList.remove('skeleton-drop-target');_handleNavDrop(event,'${esc(iid)}','${esc(layerId)}')"` : '';

        const editControls = editing
          ? `<span class="skeleton-edit-controls">
              ${isPFC ? _lockIcon() : ''}
              <span class="skeleton-drag-handle" title="Drag to reorder">&#x2630;</span>
              ${_editBtn('&#x25B2;', 'Move up', `reorderNavItem('${esc(iid)}','up')`, isFirst)}
              ${_editBtn('&#x25BC;', 'Move down', `reorderNavItem('${esc(iid)}','down')`, isLast)}
              ${_layerSelect(iid, layerRef)}
            </span>` : '';

        html += `<div class="skeleton-nav-item-row${editing ? ' skeleton-editable' : ''}"${dragAttrs}>
          ${editControls}
          <span class="skeleton-nav-item-label">${esc(item['ds:label'] || item['ds:itemId'])}</span>
          <span class="skeleton-nav-item-type">${esc(item['ds:itemType'] || '—')}</span>
          <span class="skeleton-nav-item-action">${esc(item['ds:action'] || '—')}</span>
          ${_cascadeTierBadge(item['ds:cascadeTier'])}
          ${condition}
          ${shortcut}
        </div>`;
      });
      html += '</div>';
    }

    html += '</div></div>';
  }

  container.innerHTML = html;
}

/* ────────────────────────────────────────────────
   Properties Tab (F40.22 — Skeleton Graph Node Editor)
   ──────────────────────────────────────────────── */

/**
 * Show properties for a skeleton graph node and switch to Properties tab.
 * Called from skeleton-graph.js click handler.
 * @param {string} nodeId — the vis-network node id (e.g. 'nav-L2-graph', 'zone-Z6', 'layer-L1-core')
 */
export function showPropertiesForNode(nodeId) {
  state._skeletonSelectedNode = nodeId;
  // Open the panel if not already open
  const panel = document.getElementById('skeleton-panel');
  if (panel && !panel.classList.contains('open')) {
    panel.classList.add('open');
    state.skeletonPanelOpen = true;
  }
  switchSkeletonTab('properties');
}

/**
 * Render the properties tab for the currently selected skeleton graph node.
 */
export function renderPropertiesTab(container) {
  const nodeId = state._skeletonSelectedNode;
  if (!nodeId) {
    container.innerHTML = '<div class="skeleton-empty">Click a node in the Skeleton Graph to inspect its properties.</div>';
    return;
  }

  const skeleton = state.appSkeleton;
  if (!skeleton) {
    container.innerHTML = '<div class="skeleton-empty">No skeleton loaded.</div>';
    return;
  }

  // Determine node type from prefix
  if (nodeId === 'app-root') {
    _renderAppProperties(container, skeleton);
  } else if (nodeId.startsWith('zone-')) {
    _renderZoneProperties(container, nodeId.replace('zone-', ''), skeleton);
  } else if (nodeId.startsWith('layer-')) {
    _renderLayerProperties(container, nodeId.replace('layer-', ''), skeleton);
  } else if (nodeId.startsWith('nav-')) {
    _renderNavItemProperties(container, nodeId.replace('nav-', ''), skeleton);
  } else if (nodeId.startsWith('child-')) {
    _renderDropdownChildProperties(container, nodeId, skeleton);
  } else if (nodeId.startsWith('action-')) {
    _renderActionProperties(container, nodeId.replace('action-', ''), skeleton);
  } else {
    container.innerHTML = `<div class="skeleton-empty">Unknown node type: ${esc(nodeId)}</div>`;
  }
}

/* ── App root ── */
function _renderAppProperties(container, skeleton) {
  const app = skeleton.application || {};
  container.innerHTML = `
    <div class="skeleton-card">
      <div class="skeleton-card-header"><span>Application</span></div>
      <div class="skeleton-card-body">
        <div class="skeleton-field"><span class="skeleton-field-label">Name</span><span class="skeleton-field-value">${esc(app['ds:appName'] || app['@id'] || 'PFC Application')}</span></div>
        <div class="skeleton-field"><span class="skeleton-field-label">Zones</span><span class="skeleton-field-value">${(skeleton.zones || []).length}</span></div>
        <div class="skeleton-field"><span class="skeleton-field-label">Nav Layers</span><span class="skeleton-field-value">${(skeleton.navLayers || []).length}</span></div>
        <div class="skeleton-field"><span class="skeleton-field-label">Nav Items</span><span class="skeleton-field-value">${(skeleton.navItems || []).length}</span></div>
        <div class="skeleton-field"><span class="skeleton-field-label">Actions</span><span class="skeleton-field-value">${(skeleton.actions || []).length}</span></div>
      </div>
    </div>`;
}

/* ── Zone ── */
function _renderZoneProperties(container, zoneId, skeleton) {
  const zone = (skeleton.zones || []).find(z => (z['@id'] || '').endsWith(zoneId) || z['@id'] === 'ds:' + zoneId);
  if (!zone) {
    container.innerHTML = `<div class="skeleton-empty">Zone "${esc(zoneId)}" not found.</div>`;
    return;
  }
  container.innerHTML = `
    <div class="skeleton-card">
      <div class="skeleton-card-header"><span>Zone: ${esc(zone['ds:zoneName'] || zoneId)}</span>${_cascadeTierBadge(zone['ds:cascadeTier'])}</div>
      <div class="skeleton-card-body">
        <div class="skeleton-field"><span class="skeleton-field-label">ID</span><span class="skeleton-field-value" style="font-family:monospace;">${esc(zone['@id'])}</span></div>
        <div class="skeleton-field"><span class="skeleton-field-label">Name</span><span class="skeleton-field-value">${esc(zone['ds:zoneName'])}</span></div>
        <div class="skeleton-field"><span class="skeleton-field-label">Type</span><span class="skeleton-field-value">${esc(zone['ds:zoneType'])}</span></div>
        <div class="skeleton-field"><span class="skeleton-field-label">Position</span><span class="skeleton-field-value">${esc(zone['ds:position'])}</span></div>
        <div class="skeleton-field"><span class="skeleton-field-label">Default Width</span><span class="skeleton-field-value">${esc(zone['ds:defaultWidth'])}</span></div>
        <div class="skeleton-field"><span class="skeleton-field-label">Default Visible</span><span class="skeleton-field-value">${zone['ds:defaultVisible'] ? 'Yes' : 'No'}</span></div>
        ${zone['ds:visibilityCondition'] ? `<div class="skeleton-field"><span class="skeleton-field-label">Condition</span><span class="skeleton-field-value" style="font-family:monospace; font-size:10px;">${esc(zone['ds:visibilityCondition'])}</span></div>` : ''}
        <div class="skeleton-field"><span class="skeleton-field-label">Z-Index</span><span class="skeleton-field-value">${zone['ds:zIndex'] ?? '—'}</span></div>
        <div class="skeleton-field"><span class="skeleton-field-label">Cascade Tier</span><span class="skeleton-field-value">${esc(zone['ds:cascadeTier'] || 'PFC')}</span></div>
      </div>
    </div>`;
}

/* ── Nav Layer ── */
function _renderLayerProperties(container, layerId, skeleton) {
  const layer = (skeleton.navLayers || []).find(l => (l['@id'] || '').endsWith(layerId) || l['@id'] === 'ds:' + layerId);
  if (!layer) {
    container.innerHTML = `<div class="skeleton-empty">Layer "${esc(layerId)}" not found.</div>`;
    return;
  }
  const items = (skeleton.navItems || []).filter(it => {
    const ref = it['ds:belongsToLayer']?.['@id'] || it['ds:belongsToLayer'] || '';
    return ref === layer['@id'] || ref.endsWith(layerId);
  });
  container.innerHTML = `
    <div class="skeleton-card">
      <div class="skeleton-card-header"><span>Layer: ${esc(layer['ds:layerName'] || layerId)}</span>${_cascadeTierBadge(layer['ds:cascadeTier'])}</div>
      <div class="skeleton-card-body">
        <div class="skeleton-field"><span class="skeleton-field-label">ID</span><span class="skeleton-field-value" style="font-family:monospace;">${esc(layer['@id'])}</span></div>
        <div class="skeleton-field"><span class="skeleton-field-label">Name</span><span class="skeleton-field-value">${esc(layer['ds:layerName'])}</span></div>
        <div class="skeleton-field"><span class="skeleton-field-label">Level</span><span class="skeleton-field-value">${layer['ds:layerLevel'] ?? '—'}</span></div>
        <div class="skeleton-field"><span class="skeleton-field-label">Render Order</span><span class="skeleton-field-value">${layer['ds:renderOrder'] ?? '—'}</span></div>
        <div class="skeleton-field"><span class="skeleton-field-label">Cascade Tier</span><span class="skeleton-field-value">${esc(layer['ds:cascadeTier'] || 'PFC')}</span></div>
        <div class="skeleton-field"><span class="skeleton-field-label">Nav Items</span><span class="skeleton-field-value">${items.length}</span></div>
      </div>
    </div>`;
}

/* ── NavItem ── */
function _renderNavItemProperties(container, itemId, skeleton) {
  const item = (skeleton.navItems || []).find(it => {
    const id = it['ds:itemId'] || it['@id'] || '';
    return id === itemId || id === 'ds:' + itemId || id.endsWith(itemId);
  });
  if (!item) {
    container.innerHTML = `<div class="skeleton-empty">Nav item "${esc(itemId)}" not found.</div>`;
    return;
  }
  const editing = state.skeletonEditMode;
  const actionRef = item['ds:executesAction']?.['@id'] || item['ds:action'] || '—';
  const children = item['ds:children'] || [];

  let editableFields = '';
  if (editing) {
    editableFields = `
      <div class="skeleton-prop-edit-section">
        <div class="skeleton-field">
          <span class="skeleton-field-label">Label</span>
          <input class="skeleton-prop-input" value="${esc(item['ds:label'] || '')}"
            onchange="updateNavItemProperty('${esc(item['ds:itemId'] || item['@id'])}', 'ds:label', this.value)" />
        </div>
        <div class="skeleton-field">
          <span class="skeleton-field-label">Item Type</span>
          <select class="skeleton-prop-input"
            onchange="updateNavItemProperty('${esc(item['ds:itemId'] || item['@id'])}', 'ds:itemType', this.value)">
            ${['Button', 'Toggle', 'Chip', 'Dropdown', 'Separator'].map(t =>
              `<option value="${t}"${(item['ds:itemType'] || '') === t ? ' selected' : ''}>${t}</option>`
            ).join('')}
          </select>
        </div>
        <div class="skeleton-field">
          <span class="skeleton-field-label">Icon</span>
          <input class="skeleton-prop-input" value="${esc(item['ds:icon'] || '')}"
            onchange="updateNavItemProperty('${esc(item['ds:itemId'] || item['@id'])}', 'ds:icon', this.value)" />
        </div>
        <div class="skeleton-field">
          <span class="skeleton-field-label">State Binding</span>
          <input class="skeleton-prop-input" value="${esc(item['ds:stateBinding'] || '')}"
            onchange="updateNavItemProperty('${esc(item['ds:itemId'] || item['@id'])}', 'ds:stateBinding', this.value)" />
        </div>
        <div class="skeleton-field">
          <span class="skeleton-field-label">Shortcut</span>
          <input class="skeleton-prop-input" value="${esc(item['ds:shortcut'] || '')}"
            onchange="updateNavItemProperty('${esc(item['ds:itemId'] || item['@id'])}', 'ds:shortcut', this.value)" />
        </div>
        <div class="skeleton-field">
          <span class="skeleton-field-label">Visibility Condition</span>
          <input class="skeleton-prop-input" value="${esc(item['ds:visibilityCondition'] || '')}" style="font-family:monospace; font-size:10px;"
            onchange="updateNavItemProperty('${esc(item['ds:itemId'] || item['@id'])}', 'ds:visibilityCondition', this.value)" />
        </div>
      </div>`;
  }

  container.innerHTML = `
    <div class="skeleton-card">
      <div class="skeleton-card-header"><span>NavItem: ${esc(item['ds:label'] || itemId)}</span>${_cascadeTierBadge(item['ds:cascadeTier'])}</div>
      <div class="skeleton-card-body">
        <div class="skeleton-field"><span class="skeleton-field-label">ID</span><span class="skeleton-field-value" style="font-family:monospace;">${esc(item['ds:itemId'] || item['@id'])}</span></div>
        <div class="skeleton-field"><span class="skeleton-field-label">Label</span><span class="skeleton-field-value">${esc(item['ds:label'])}</span></div>
        <div class="skeleton-field"><span class="skeleton-field-label">Type</span><span class="skeleton-field-value">${esc(item['ds:itemType'])}</span></div>
        <div class="skeleton-field"><span class="skeleton-field-label">Icon</span><span class="skeleton-field-value">${esc(item['ds:icon'] || '—')}</span></div>
        <div class="skeleton-field"><span class="skeleton-field-label">State Binding</span><span class="skeleton-field-value">${esc(item['ds:stateBinding'] || '—')}</span></div>
        <div class="skeleton-field"><span class="skeleton-field-label">Action</span><span class="skeleton-field-value" style="font-family:monospace; font-size:10px;">${esc(actionRef)}</span></div>
        <div class="skeleton-field"><span class="skeleton-field-label">Layer</span><span class="skeleton-field-value">${esc(item['ds:belongsToLayer']?.['@id'] || '—')}</span></div>
        <div class="skeleton-field"><span class="skeleton-field-label">Render Order</span><span class="skeleton-field-value">${item['ds:renderOrder'] ?? '—'}</span></div>
        <div class="skeleton-field"><span class="skeleton-field-label">Shortcut</span><span class="skeleton-field-value">${esc(item['ds:shortcut'] || '—')}</span></div>
        ${item['ds:visibilityCondition'] ? `<div class="skeleton-field"><span class="skeleton-field-label">Condition</span><span class="skeleton-field-value" style="font-family:monospace; font-size:10px;">${esc(item['ds:visibilityCondition'])}</span></div>` : ''}
        <div class="skeleton-field"><span class="skeleton-field-label">Cascade Tier</span><span class="skeleton-field-value">${esc(item['ds:cascadeTier'] || 'PFC')}</span></div>
        ${children.length > 0 ? `<div class="skeleton-field"><span class="skeleton-field-label">Children</span><span class="skeleton-field-value">${children.length}</span></div>` : ''}
        ${editableFields}
      </div>
    </div>`;
}

/* ── Dropdown Child ── */
function _renderDropdownChildProperties(container, nodeId, skeleton) {
  // nodeId format: child-{parentItemId}-{childIndex}
  const parts = nodeId.split('-');
  const childIndex = parseInt(parts[parts.length - 1], 10);
  const parentItemId = parts.slice(1, parts.length - 1).join('-');

  const parent = (skeleton.navItems || []).find(it => {
    const id = it['ds:itemId'] || it['@id'] || '';
    return id === parentItemId || id === 'ds:' + parentItemId || id.endsWith(parentItemId);
  });
  if (!parent || !parent['ds:children']) {
    container.innerHTML = `<div class="skeleton-empty">Dropdown child not found.</div>`;
    return;
  }
  const child = parent['ds:children'][childIndex];
  if (!child) {
    container.innerHTML = `<div class="skeleton-empty">Child at index ${childIndex} not found.</div>`;
    return;
  }

  container.innerHTML = `
    <div class="skeleton-card">
      <div class="skeleton-card-header"><span>Dropdown Child: ${esc(child['ds:label'] || `Child ${childIndex}`)}</span></div>
      <div class="skeleton-card-body">
        <div class="skeleton-field"><span class="skeleton-field-label">Label</span><span class="skeleton-field-value">${esc(child['ds:label'] || '—')}</span></div>
        <div class="skeleton-field"><span class="skeleton-field-label">Parent</span><span class="skeleton-field-value" style="font-family:monospace;">${esc(parent['ds:itemId'] || parent['@id'])}</span></div>
        <div class="skeleton-field"><span class="skeleton-field-label">Index</span><span class="skeleton-field-value">${childIndex}</span></div>
        ${child['ds:action'] ? `<div class="skeleton-field"><span class="skeleton-field-label">Action</span><span class="skeleton-field-value" style="font-family:monospace; font-size:10px;">${esc(child['ds:action'])}</span></div>` : ''}
        ${child['ds:executesAction']?.['@id'] ? `<div class="skeleton-field"><span class="skeleton-field-label">Executes Action</span><span class="skeleton-field-value" style="font-family:monospace; font-size:10px;">${esc(child['ds:executesAction']['@id'])}</span></div>` : ''}
        ${child['ds:icon'] ? `<div class="skeleton-field"><span class="skeleton-field-label">Icon</span><span class="skeleton-field-value">${esc(child['ds:icon'])}</span></div>` : ''}
      </div>
    </div>`;
}

/* ── Action ── */
function _renderActionProperties(container, actionId, skeleton) {
  const action = (skeleton.actions || []).find(a => {
    const id = a['@id'] || '';
    return id === actionId || id === 'ds:' + actionId || id.endsWith(actionId);
  });
  if (!action) {
    container.innerHTML = `<div class="skeleton-empty">Action "${esc(actionId)}" not found.</div>`;
    return;
  }

  // Find nav items that reference this action
  const referencedBy = (skeleton.navItems || []).filter(it => {
    const ref = it['ds:executesAction']?.['@id'] || '';
    return ref === action['@id'];
  }).map(it => it['ds:label'] || it['ds:itemId'] || it['@id']);

  container.innerHTML = `
    <div class="skeleton-card">
      <div class="skeleton-card-header"><span>Action: ${esc(action['ds:functionRef'] || actionId)}</span></div>
      <div class="skeleton-card-body">
        <div class="skeleton-field"><span class="skeleton-field-label">ID</span><span class="skeleton-field-value" style="font-family:monospace;">${esc(action['@id'])}</span></div>
        <div class="skeleton-field"><span class="skeleton-field-label">Function Ref</span><span class="skeleton-field-value" style="font-family:monospace;">${esc(action['ds:functionRef'] || '—')}</span></div>
        <div class="skeleton-field"><span class="skeleton-field-label">Parameter Type</span><span class="skeleton-field-value">${esc(action['ds:parameterType'] || 'None')}</span></div>
        <div class="skeleton-field"><span class="skeleton-field-label">Triggers Sync</span><span class="skeleton-field-value">${action['ds:triggersSyncAfter'] ? 'Yes' : 'No'}</span></div>
        ${referencedBy.length > 0 ? `<div class="skeleton-field"><span class="skeleton-field-label">Referenced By</span><span class="skeleton-field-value">${referencedBy.map(r => esc(r)).join(', ')}</span></div>` : ''}
      </div>
    </div>`;
}
