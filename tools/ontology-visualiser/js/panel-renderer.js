/**
 * Programme Tracker Panel — URG Phase 2 (S.URG.4)
 * Feature: F46.2 (#685) — Docs Register as First-Class Registry Artifacts
 * Initiative: URG (Unified Registry Governance)
 *
 * Reads programme-tracker.json and renders an interactive Programme Tracker
 * panel in the workbench DOM with filter tabs, priority badges, and expandable
 * feature rows with GitHub click-through.
 */

// Resolve tracker path relative to the page URL so it works from both
// /PBS/TOOLS/ontology-visualiser/ and legacy /tools/ontology-visualiser/
function resolveTrackerPath() {
  const pagePath = globalThis.location?.pathname || '';
  const pbsIdx = pagePath.indexOf('/PBS/TOOLS/ontology-visualiser/');
  if (pbsIdx >= 0) {
    // Primary path: /PBS/TOOLS/ontology-visualiser/ → /PBS/STRATEGY/
    return pagePath.substring(0, pbsIdx) + '/PBS/STRATEGY/programme-tracker.json';
  }
  // Legacy or local: fall back to relative
  return '../../STRATEGY/programme-tracker.json';
}
export const TRACKER_PATH = resolveTrackerPath();

const PRIORITY_COLORS = {
  P0: '#ef4444',
  P1: '#f59e0b',
  P2: '#22c55e',
  P3: '#3b82f6',
  '—': '#555',
};

let _trackerData = null;
let _activeFilter = 'open';
let _expandedEpics = new Set();

// ─── Data Access ──────────────────────────────────────────────────────────────

export async function loadTrackerData(path = TRACKER_PATH) {
  const res = await fetch(path + '?t=' + Date.now());
  if (!res.ok) throw new Error(`Failed to load tracker: ${res.status}`);
  _trackerData = await res.json();
  return _trackerData;
}

export function getTrackerData() {
  return _trackerData;
}

// ─── Filter & Expansion State ─────────────────────────────────────────────────

export function setFilter(filter) {
  _activeFilter = filter;
}

export function getFilter() {
  return _activeFilter;
}

export function toggleEpicExpansion(epicId) {
  if (_expandedEpics.has(epicId)) {
    _expandedEpics.delete(epicId);
  } else {
    _expandedEpics.add(epicId);
  }
}

export function isEpicExpanded(epicId) {
  return _expandedEpics.has(epicId);
}

// ─── Pure Render Helpers ──────────────────────────────────────────────────────

export function filterEpics(epics, filter) {
  return epics.filter(e => e.status === filter);
}

export function renderPriorityBadge(priority) {
  const color = PRIORITY_COLORS[priority] || '#555';
  return `<span style="display:inline-block; background:${color}22; color:${color}; border:1px solid ${color}44; border-radius:3px; font-size:9px; padding:1px 5px; min-width:22px; text-align:center;">${priority}</span>`;
}

export function renderFeatureRow(feature) {
  const statusDot = feature.status === 'residual'
    ? '<span style="color:#f59e0b; font-size:10px;" title="residual">◐</span>'
    : '<span style="color:#22c55e; font-size:10px;" title="open">○</span>';
  const link = feature.issueUrl
    ? `<a href="${feature.issueUrl}" target="_blank" rel="noopener" style="color:var(--viz-accent, #818cf8); text-decoration:none; font-size:10px;">${feature.ref}</a>`
    : `<span style="color:var(--viz-text-secondary, #888); font-size:10px;">${feature.ref}</span>`;
  return `<div class="tracker-feature-row" style="display:flex; align-items:center; gap:8px; padding:3px 0 3px 24px; border-bottom:1px solid var(--viz-border-subtle, #2a2d37); font-size:11px;">
    ${statusDot}
    <span style="min-width:48px; color:var(--viz-text-secondary, #888); font-size:10px;">${feature.id}</span>
    <span style="flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:var(--viz-text-secondary, #aaa);">${feature.title}</span>
    ${renderPriorityBadge(feature.priority)}
    ${link}
  </div>`;
}

export function renderEpicRow(epic) {
  const expanded = _expandedEpics.has(epic.id);
  const featureCount = epic.features?.length || 0;
  const expandIcon = featureCount > 0
    ? `<span style="color:var(--viz-text-secondary, #888); font-size:10px; min-width:12px; user-select:none;">${expanded ? '▾' : '▸'}</span>`
    : '<span style="min-width:12px; display:inline-block;"></span>';
  const issueLink = epic.issueUrl
    ? `<a href="${epic.issueUrl}" target="_blank" rel="noopener" style="color:var(--viz-accent, #818cf8); text-decoration:none; font-size:10px; white-space:nowrap;" onclick="event.stopPropagation()">${epic.ref}</a>`
    : `<span style="color:var(--viz-text-secondary, #888); font-size:10px;">${epic.ref}</span>`;
  const featurePill = featureCount > 0
    ? `<span style="background:var(--viz-surface-default, #1e1e2e); color:var(--viz-text-secondary, #888); font-size:9px; padding:1px 6px; border-radius:10px; margin-left:4px;">${featureCount}F</span>`
    : '';

  let html = `<div class="tracker-epic-row" data-epic-id="${epic.id}" onclick="toggleTrackerEpic('${epic.id}')" style="display:flex; align-items:center; gap:8px; padding:6px 0; border-bottom:1px solid var(--viz-border-subtle, #2a2d37); cursor:pointer;">
    ${expandIcon}
    ${renderPriorityBadge(epic.priority)}
    <span style="flex:1; font-size:12px; font-weight:500; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${epic.title}${featurePill}</span>
    ${issueLink}
  </div>`;

  if (expanded && featureCount > 0) {
    for (const f of epic.features) {
      html += renderFeatureRow(f);
    }
  }

  return html;
}

// ─── Panel Renderer ───────────────────────────────────────────────────────────

/**
 * Render the full tracker panel into a container element.
 * Pure — no side effects beyond writing container.innerHTML.
 */
export function renderTrackerPanel(container, data, filter) {
  if (!container) return;

  if (!data) {
    container.innerHTML = '<div style="color:var(--viz-text-secondary, #888); font-size:12px; padding:8px 0;">Loading...</div>';
    return;
  }

  const epics = filterEpics(data.epics, filter);
  const openCount = data.epics.filter(e => e.status === 'open').length;
  const noOpenCount = data.epics.filter(e => e.status === 'no-open-features').length;
  const closedCount = data.epics.filter(e => e.status === 'closed').length;

  const tabs = [
    { key: 'open',             label: `Open (${openCount})` },
    { key: 'no-open-features', label: `No Open Work (${noOpenCount})` },
    { key: 'closed',           label: `Closed (${closedCount})` },
  ];

  let html = `<div style="display:flex; align-items:center; gap:8px; font-size:10px; color:var(--viz-text-secondary, #888); margin-bottom:10px;">
    <span>v${data.schemaVersion} · ${data.generated} · ${data.epics.length} epics</span>
    <button onclick="reloadTrackerData()" title="Refresh from programme-tracker.json" style="background:none; border:1px solid var(--viz-border-subtle, #2a2d37); color:var(--viz-text-secondary, #888); border-radius:3px; font-size:10px; padding:1px 6px; cursor:pointer;">↻ Refresh</button>
  </div>`;

  // Filter tabs
  html += '<div style="display:flex; gap:4px; margin-bottom:12px; flex-wrap:wrap;">';
  for (const tab of tabs) {
    const isActive = tab.key === filter;
    const bg = isActive ? 'var(--viz-accent, #818cf8)' : 'var(--viz-surface-default, #1e1e2e)';
    const fg = isActive ? '#fff' : 'var(--viz-text-secondary, #888)';
    html += `<button onclick="setTrackerFilter('${tab.key}')" style="font-size:10px; padding:3px 8px; background:${bg}; color:${fg}; border:1px solid var(--viz-border-subtle, #2a2d37); border-radius:4px; cursor:pointer;">${tab.label}</button>`;
  }
  html += '</div>';

  if (epics.length === 0) {
    html += '<div style="color:var(--viz-text-secondary, #888); font-size:12px;">No epics in this view.</div>';
  } else {
    html += '<div class="tracker-epic-list">';
    for (const epic of epics) {
      html += renderEpicRow(epic);
    }
    html += '</div>';
  }

  container.innerHTML = html;
}

// ─── Panel Lifecycle ──────────────────────────────────────────────────────────

/**
 * Initialise the tracker panel: fetch data, render.
 * Renders a loading state immediately while fetch is in flight.
 */
export async function initTrackerPanel(containerId = 'programme-tracker-content', path = TRACKER_PATH) {
  const container = document.getElementById(containerId);
  if (!container) return;

  renderTrackerPanel(container, null, _activeFilter);

  try {
    const data = await loadTrackerData(path);
    renderTrackerPanel(container, data, _activeFilter);
  } catch (err) {
    if (container) {
      container.innerHTML = `<div style="color:#ef4444; font-size:12px; padding:8px 0;">Failed to load programme tracker: ${err.message}</div>`;
    }
  }
}

/**
 * Re-render using cached data and current filter. No-op if data not loaded.
 */
export function refreshTrackerPanel(containerId = 'programme-tracker-content') {
  const container = document.getElementById(containerId);
  if (!container || !_trackerData) return;
  renderTrackerPanel(container, _trackerData, _activeFilter);
}

/**
 * Re-fetch tracker data from programme-tracker.json and re-render both panels.
 * Callable from the refresh button in the tracker panel header.
 */
export async function reloadTrackerData(containerId = 'programme-tracker-content', path = TRACKER_PATH) {
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = '<div style="color:var(--viz-text-secondary, #888); font-size:12px; padding:8px 0;">Refreshing...</div>';
  }
  try {
    _trackerData = null; // clear cache
    const data = await loadTrackerData(path);
    if (container) renderTrackerPanel(container, data, _activeFilter);
    // Also refresh doc register if visible
    refreshDocumentRegisterPanel();
  } catch (err) {
    if (container) {
      container.innerHTML = `<div style="color:#ef4444; font-size:12px; padding:8px 0;">Refresh failed: ${err.message}</div>`;
    }
  }
}

// ─── Document Register State ──────────────────────────────────────────────────

const REPO_STRATEGY_URL = 'https://github.com/ajrmooreuk/Azlan-EA-AAA/blob/main/PBS/STRATEGY/';
const REPO_ROOT_URL     = 'https://github.com/ajrmooreuk/Azlan-EA-AAA/blob/main/';

let _docTypeFilter   = null; // null = all
let _docStatusFilter = null; // null = all
let _docExpandedGroups = new Set();

// ─── Document Register Helpers ────────────────────────────────────────────────

/**
 * Build a GitHub blob URL for a document filename.
 * Handles subdir paths (PFI-AIRL/..., PBS/PFI-WWG/...) and cross-repo paths.
 * Returns null for filenames that are clearly in external repos.
 */
export function buildDocumentUrl(filename) {
  if (!filename) return null;
  // Cross-repo paths — cannot link directly
  if (filename.startsWith('pfi-w4m-eoms-dev/')) return null;
  // Paths that already include PBS/ prefix
  if (filename.startsWith('PBS/') || filename.startsWith('azlan-github-workflow/')) {
    return REPO_ROOT_URL + filename;
  }
  return REPO_STRATEGY_URL + filename;
}

/**
 * Group documents by productCode, preserving insertion order.
 * Returns a Map<productCode, document[]>.
 */
export function groupDocumentsByProductCode(documents) {
  const groups = new Map();
  for (const doc of documents) {
    const key = doc.productCode || 'OTHER';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(doc);
  }
  return groups;
}

/**
 * Get sorted unique document types from a document array.
 */
export function getAvailableTypes(documents) {
  return [...new Set(documents.map(d => d.type))].sort();
}

/**
 * Get sorted unique status values from a document array.
 */
export function getAvailableStatuses(documents) {
  return [...new Set(documents.map(d => d.status))].sort();
}

/**
 * Apply type and status filters to a document array.
 */
export function filterDocuments(documents, typeFilter, statusFilter) {
  return documents.filter(d => {
    if (typeFilter && d.type !== typeFilter) return false;
    if (statusFilter && d.status !== statusFilter) return false;
    return true;
  });
}

// ─── Document Register Filter State ──────────────────────────────────────────

export function setDocTypeFilter(type) {
  _docTypeFilter = type || null;
}

export function getDocTypeFilter() {
  return _docTypeFilter;
}

export function setDocStatusFilter(status) {
  _docStatusFilter = status || null;
}

export function getDocStatusFilter() {
  return _docStatusFilter;
}

export function toggleDocGroupExpansion(code) {
  if (_docExpandedGroups.has(code)) {
    _docExpandedGroups.delete(code);
  } else {
    _docExpandedGroups.add(code);
  }
}

export function isDocGroupExpanded(code) {
  return _docExpandedGroups.has(code);
}

// ─── Document Register Render Helpers ────────────────────────────────────────

const STATUS_BADGE_COLORS = {
  Active:      '#22c55e',
  Draft:       '#f59e0b',
  Superseded:  '#555',
  Proposal:    '#3b82f6',
  Open:        '#818cf8',
};

export function renderStatusBadge(status) {
  const color = STATUS_BADGE_COLORS[status] || '#555';
  return `<span style="display:inline-block; background:${color}22; color:${color}; border:1px solid ${color}44; border-radius:3px; font-size:9px; padding:1px 5px; white-space:nowrap;">${status}</span>`;
}

export function renderTypeBadge(type) {
  return `<span style="display:inline-block; background:var(--viz-surface-default, #1e1e2e); color:var(--viz-text-secondary, #888); border:1px solid var(--viz-border-subtle, #2a2d37); border-radius:3px; font-size:9px; padding:1px 5px; min-width:36px; text-align:center;">${type}</span>`;
}

export function renderDocumentRow(doc) {
  const url = buildDocumentUrl(doc.filename);
  const basename = doc.filename.split('/').pop();
  const nameEl = url
    ? `<a href="${url}" target="_blank" rel="noopener" style="color:var(--viz-accent, #818cf8); text-decoration:none; font-size:11px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; flex:1;" title="${doc.filename}">${basename}</a>`
    : `<span style="color:var(--viz-text-secondary, #888); font-size:11px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; flex:1;" title="${doc.filename}">${basename}</span>`;
  return `<div class="doc-register-row" style="display:flex; align-items:center; gap:6px; padding:3px 0 3px 16px; border-bottom:1px solid var(--viz-border-subtle, #2a2d37); min-width:0;">
    ${renderTypeBadge(doc.type)}
    ${nameEl}
    ${renderStatusBadge(doc.status)}
  </div>`;
}

export function renderDocumentGroup(productCode, docs, typeFilter, statusFilter) {
  const filtered = filterDocuments(docs, typeFilter, statusFilter);
  const expanded = _docExpandedGroups.has(productCode);
  const countLabel = typeFilter || statusFilter
    ? `${filtered.length}/${docs.length}`
    : `${docs.length}`;
  const expandIcon = `<span style="color:var(--viz-text-secondary, #888); font-size:10px; min-width:12px; user-select:none;">${expanded ? '▾' : '▸'}</span>`;

  let html = `<div class="doc-group-header" onclick="toggleDocGroup('${productCode}')" style="display:flex; align-items:center; gap:8px; padding:6px 0; border-bottom:1px solid var(--viz-border-subtle, #2a2d37); cursor:pointer;">
    ${expandIcon}
    <span style="flex:1; font-size:12px; font-weight:500; color:var(--viz-accent, #818cf8);">${productCode}</span>
    <span style="background:var(--viz-surface-default, #1e1e2e); color:var(--viz-text-secondary, #888); font-size:9px; padding:1px 6px; border-radius:10px;">${countLabel}</span>
  </div>`;

  if (expanded) {
    if (filtered.length === 0) {
      html += `<div style="padding:3px 0 3px 16px; font-size:11px; color:var(--viz-text-secondary, #888);">No documents match current filters.</div>`;
    } else {
      for (const doc of filtered) {
        html += renderDocumentRow(doc);
      }
    }
  }

  return html;
}

// ─── Document Register Panel Renderer ────────────────────────────────────────

/**
 * Render the Document Register panel into a container element.
 */
export function renderDocumentRegisterPanel(container, data, typeFilter, statusFilter) {
  if (!container) return;

  if (!data) {
    container.innerHTML = '<div style="color:var(--viz-text-secondary, #888); font-size:12px; padding:8px 0;">Loading...</div>';
    return;
  }

  const docs = data.documents || [];
  const allTypes    = getAvailableTypes(docs);
  const allStatuses = getAvailableStatuses(docs);
  const filtered    = filterDocuments(docs, typeFilter, statusFilter);
  const groups      = groupDocumentsByProductCode(filtered);

  let html = `<div style="font-size:10px; color:var(--viz-text-secondary, #888); margin-bottom:10px;">
    ${docs.length} documents · ${groups.size} product codes
  </div>`;

  // Type filter chips
  html += '<div style="margin-bottom:6px; display:flex; gap:4px; flex-wrap:wrap; align-items:center;">';
  html += `<span style="font-size:10px; color:var(--viz-text-secondary, #888); margin-right:2px;">Type:</span>`;
  const typeAll = !typeFilter;
  html += `<button onclick="setDocRegTypeFilter(null)" style="font-size:9px; padding:2px 6px; background:${typeAll ? 'var(--viz-accent, #818cf8)' : 'var(--viz-surface-default, #1e1e2e)'}; color:${typeAll ? '#fff' : 'var(--viz-text-secondary, #888)'}; border:1px solid var(--viz-border-subtle, #2a2d37); border-radius:3px; cursor:pointer;">All</button>`;
  for (const t of allTypes) {
    const active = typeFilter === t;
    html += `<button onclick="setDocRegTypeFilter('${t}')" style="font-size:9px; padding:2px 6px; background:${active ? 'var(--viz-accent, #818cf8)' : 'var(--viz-surface-default, #1e1e2e)'}; color:${active ? '#fff' : 'var(--viz-text-secondary, #888)'}; border:1px solid var(--viz-border-subtle, #2a2d37); border-radius:3px; cursor:pointer;">${t}</button>`;
  }
  html += '</div>';

  // Status filter chips
  html += '<div style="margin-bottom:12px; display:flex; gap:4px; flex-wrap:wrap; align-items:center;">';
  html += `<span style="font-size:10px; color:var(--viz-text-secondary, #888); margin-right:2px;">Status:</span>`;
  const statusAll = !statusFilter;
  html += `<button onclick="setDocRegStatusFilter(null)" style="font-size:9px; padding:2px 6px; background:${statusAll ? 'var(--viz-accent, #818cf8)' : 'var(--viz-surface-default, #1e1e2e)'}; color:${statusAll ? '#fff' : 'var(--viz-text-secondary, #888)'}; border:1px solid var(--viz-border-subtle, #2a2d37); border-radius:3px; cursor:pointer;">All</button>`;
  for (const s of allStatuses) {
    const active = statusFilter === s;
    html += `<button onclick="setDocRegStatusFilter('${s}')" style="font-size:9px; padding:2px 6px; background:${active ? 'var(--viz-accent, #818cf8)' : 'var(--viz-surface-default, #1e1e2e)'}; color:${active ? '#fff' : 'var(--viz-text-secondary, #888)'}; border:1px solid var(--viz-border-subtle, #2a2d37); border-radius:3px; cursor:pointer;">${s}</button>`;
  }
  html += '</div>';

  if (groups.size === 0) {
    html += '<div style="color:var(--viz-text-secondary, #888); font-size:12px;">No documents match current filters.</div>';
  } else {
    html += '<div class="doc-register-groups">';
    for (const [code, groupDocs] of groups) {
      html += renderDocumentGroup(code, groupDocs, typeFilter, statusFilter);
    }
    html += '</div>';
  }

  container.innerHTML = html;
}

// ─── Document Register Panel Lifecycle ───────────────────────────────────────

export async function initDocumentRegisterPanel(containerId = 'document-register-content', path = TRACKER_PATH) {
  const container = document.getElementById(containerId);
  if (!container) return;

  renderDocumentRegisterPanel(container, null, _docTypeFilter, _docStatusFilter);

  try {
    // Reuse cached data if already loaded, otherwise fetch
    const data = _trackerData || await loadTrackerData(path);
    renderDocumentRegisterPanel(container, data, _docTypeFilter, _docStatusFilter);
  } catch (err) {
    if (container) {
      container.innerHTML = `<div style="color:#ef4444; font-size:12px; padding:8px 0;">Failed to load document register: ${err.message}</div>`;
    }
  }
}

export function refreshDocumentRegisterPanel(containerId = 'document-register-content') {
  const container = document.getElementById(containerId);
  if (!container || !_trackerData) return;
  renderDocumentRegisterPanel(container, _trackerData, _docTypeFilter, _docStatusFilter);
}
