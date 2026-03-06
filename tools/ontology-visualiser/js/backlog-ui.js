/**
 * Backlog UI — panel rendering, forms, review views, drag-reorder.
 * Epic 8C — PE-Ontology-Management-Functions
 */

import { state, FEATURE_STATUSES, FEATURE_CATEGORIES, PRIORITY_BANDS, EPIC_STATUSES } from './state.js';
import {
  getAllFeatures, getAllEpics, getFeature, getEpic,
  createFeature, updateFeature, deleteFeature,
  createEpic, updateEpic, deleteEpic,
  getFeaturesByEpic, getFeaturesByStatus,
  computePriority, getPriorityBand, sortFeaturesByPriority, buildPriorityMatrix,
  saveReviewState, loadReviewState,
  exportBacklogAsJSON, exportBacklogAsMarkdown,
  importBacklogFromJSON, importFromBacklogMD,
  buildFeaturePrompt, submitForReview, approveFeature, rejectFeature,
} from './backlog-manager.js';

function esc(str) { return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

// ========================================
// PANEL TOGGLE
// ========================================

export function toggleBacklogPanel() {
  const panel = document.getElementById('backlog-panel');
  if (!panel) return;
  state.backlogPanelOpen = !state.backlogPanelOpen;
  panel.classList.toggle('open', state.backlogPanelOpen);

  // Close library panel if open (both are right-side drawers)
  if (state.backlogPanelOpen) {
    const libPanel = document.getElementById('library-panel');
    if (libPanel && libPanel.classList.contains('open')) libPanel.classList.remove('open');
  }

  if (state.backlogPanelOpen) refreshBacklogView();
}

export function closeBacklogPanel() {
  const panel = document.getElementById('backlog-panel');
  if (panel) panel.classList.remove('open');
  state.backlogPanelOpen = false;
}

// ========================================
// VIEW SWITCHING
// ========================================

export function switchBacklogView(view) {
  state.backlogView = view;
  document.querySelectorAll('.backlog-view-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.view === view);
  });
  refreshBacklogView();
}

async function refreshBacklogView() {
  switch (state.backlogView) {
    case 'overview': await renderBacklogOverview(); break;
    case 'daily': await renderDailyReview(); break;
    case 'weekly': await renderWeeklyReview(); break;
    case 'matrix': await renderPriorityMatrix(); break;
  }
}

// ========================================
// OVERVIEW VIEW
// ========================================

export async function renderBacklogOverview() {
  const container = document.getElementById('backlog-content');
  if (!container) return;

  const [allFeatures, allEpics] = await Promise.all([getAllFeatures(), getAllEpics()]);

  // Apply filters
  const features = filterFeatures(allFeatures);

  // Group by epic
  const byEpic = new Map();
  byEpic.set(null, []);
  for (const e of allEpics) byEpic.set(e.id, []);
  for (const f of features) {
    const key = f.epicId ?? null;
    if (!byEpic.has(key)) byEpic.set(key, []);
    byEpic.get(key).push(f);
  }

  if (features.length === 0) {
    container.innerHTML = '<p class="library-empty">No features yet. Click + Feature to start.</p>';
    return;
  }

  let html = '';

  // Render epic groups
  for (const epic of allEpics) {
    const epicFeatures = sortFeaturesByPriority(byEpic.get(epic.id) || []);
    if (epicFeatures.length === 0 && state.backlogFilterText) continue;
    const doneCount = epicFeatures.filter(f => f.status === 'done').length;
    const pct = epicFeatures.length > 0 ? Math.round((doneCount / epicFeatures.length) * 100) : 0;

    html += `<div class="backlog-epic-group">
      <div class="backlog-epic-header" onclick="toggleEpicCollapse(${epic.id})">
        <span class="backlog-epic-chevron" id="epic-chev-${epic.id}">&#x25BC;</span>
        <span style="flex:1;">${esc(epic.title)}</span>
        <span style="font-size:10px; color:var(--viz-text-muted);">${doneCount}/${epicFeatures.length}</span>
        <button class="backlog-edit-btn" onclick="event.stopPropagation(); showEpicForm(${epic.id})" title="Edit epic">&#x270E;</button>
      </div>
      <div class="backlog-epic-progress"><div class="backlog-epic-progress-bar" style="width:${pct}%;"></div></div>
      <div class="backlog-epic-features" id="epic-features-${epic.id}">
        ${epicFeatures.map(f => renderFeatureCard(f)).join('')}
      </div>
    </div>`;
  }

  // Unassigned
  const unassigned = sortFeaturesByPriority(byEpic.get(null) || []);
  if (unassigned.length > 0) {
    html += `<div class="backlog-epic-group">
      <div class="backlog-epic-header" onclick="toggleEpicCollapse('unassigned')">
        <span class="backlog-epic-chevron" id="epic-chev-unassigned">&#x25BC;</span>
        <span style="flex:1; font-style:italic;">Unassigned</span>
        <span style="font-size:10px; color:var(--viz-text-muted);">${unassigned.length}</span>
      </div>
      <div class="backlog-epic-features" id="epic-features-unassigned">
        ${unassigned.map(f => renderFeatureCard(f)).join('')}
      </div>
    </div>`;
  }

  container.innerHTML = html;
}

function renderFeatureCard(f) {
  const band = getPriorityBand(f.computedPriority);
  const focusCls = f.dailyFocus ? ' daily-focus' : '';
  const blockedCls = f.blockerReason ? ' blocked' : '';
  const aiTag = f.generatedBy === 'claude-cli' ? '<span style="font-size:9px; color:var(--viz-accent); margin-left:4px;">AI</span>' : '';
  const reviewBanner = f.status === 'pending-review'
    ? `<div class="backlog-review-banner" onclick="event.stopPropagation();">
        <span style="font-size:10px; color:#fcd34d;">Pending Review</span>
        <button class="oaa-btn" style="font-size:10px; padding:2px 8px;" onclick="doApproveFeature(${f.id})">Approve</button>
        <button class="oaa-btn oaa-btn-secondary" style="font-size:10px; padding:2px 8px; color:#fca5a5;" onclick="doRejectFeature(${f.id})">Reject</button>
      </div>`
    : '';
  return `<div class="backlog-feature ${f.status}${focusCls}${blockedCls}" onclick="showFeatureForm(${f.id})">
    <div class="backlog-feature-header">
      <span class="backlog-feature-title">${esc(f.title)}${aiTag}</span>
      <span class="backlog-priority-badge backlog-priority-${band.css}">${f.computedPriority}</span>
    </div>
    <div class="backlog-feature-meta">
      <span class="backlog-status-badge ${f.status}">${f.status}</span>
      <span>${esc(f.category)}</span>
      ${f.tags.length ? `<span>${f.tags.map(t => '#' + esc(t)).join(' ')}</span>` : ''}
    </div>
    ${reviewBanner}
  </div>`;
}

// ========================================
// DAILY REVIEW VIEW
// ========================================

export async function renderDailyReview() {
  const container = document.getElementById('backlog-content');
  if (!container) return;

  const allFeatures = await getAllFeatures();
  const reviewState = loadReviewState();
  const todayISO = new Date().toISOString().slice(0, 10);

  const focusIds = new Set(reviewState.dailyFocusIds || []);
  const focusFeatures = allFeatures.filter(f => focusIds.has(f.id));
  const inProgress = allFeatures.filter(f => f.status === 'in-progress');
  const blocked = allFeatures.filter(f => f.blockerReason);
  const doneToday = allFeatures.filter(f => f.status === 'done' && f.updated && f.updated.slice(0, 10) === todayISO);

  let html = `<div class="backlog-daily-stats">
    <span class="backlog-stat"><strong>${inProgress.length}</strong> in progress</span>
    <span class="backlog-stat"><strong>${blocked.length}</strong> blocked</span>
    <span class="backlog-stat"><strong>${doneToday.length}</strong> done today</span>
  </div>`;

  // Today's Focus
  html += `<div class="backlog-daily-section">
    <h4>Today's Focus</h4>
    ${focusFeatures.length === 0 ? '<p class="library-empty" style="font-size:11px;">No focus items. Mark features from Overview.</p>' : ''}
    ${focusFeatures.map(f => `<div class="backlog-feature ${f.status} daily-focus" onclick="showFeatureForm(${f.id})">
      <div class="backlog-feature-header">
        <input type="checkbox" checked onclick="event.stopPropagation(); toggleDailyFocus(${f.id})" title="Remove from focus">
        <span class="backlog-feature-title" style="margin-left:6px;">${esc(f.title)}</span>
        <span class="backlog-priority-badge backlog-priority-${getPriorityBand(f.computedPriority).css}">${f.computedPriority}</span>
      </div>
    </div>`).join('')}
  </div>`;

  // Blockers
  if (blocked.length > 0) {
    html += `<div class="backlog-daily-section">
      <h4>Blockers</h4>
      ${blocked.map(f => `<div class="backlog-blocker">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <strong>${esc(f.title)}</strong>
          <button class="oaa-btn oaa-btn-secondary" style="font-size:10px; padding:2px 8px;" onclick="resolveBlocker(${f.id})">Resolve</button>
        </div>
        <div style="margin-top:4px; font-size:11px;">${esc(f.blockerReason)}</div>
      </div>`).join('')}
    </div>`;
  }

  // In Progress
  if (inProgress.length > 0) {
    html += `<div class="backlog-daily-section">
      <h4>In Progress</h4>
      ${inProgress.map(f => `<div class="backlog-feature in-progress" onclick="showFeatureForm(${f.id})">
        <div class="backlog-feature-header">
          <span class="backlog-feature-title">${esc(f.title)}</span>
          <button class="oaa-btn oaa-btn-secondary" style="font-size:10px; padding:2px 8px;" onclick="event.stopPropagation(); markBlocker(${f.id})">Mark Blocker</button>
        </div>
      </div>`).join('')}
    </div>`;
  }

  container.innerHTML = html;
}

// ========================================
// WEEKLY REVIEW VIEW
// ========================================

export async function renderWeeklyReview() {
  const container = document.getElementById('backlog-content');
  if (!container) return;

  const [allFeatures, allEpics] = await Promise.all([getAllFeatures(), getAllEpics()]);
  const reviewState = loadReviewState();

  let html = `<div style="margin-bottom:12px;">
    <label class="author-label">Sprint Goal</label>
    <input type="text" id="weekly-sprint-goal" class="library-input" placeholder="This week's goal..."
      value="${esc(reviewState.sprintGoal || '')}" onchange="updateSprintGoal(this.value)">
  </div>`;

  // Group by epic
  const byEpic = new Map();
  byEpic.set(null, []);
  for (const e of allEpics) byEpic.set(e.id, []);
  for (const f of allFeatures) {
    const key = f.epicId ?? null;
    if (!byEpic.has(key)) byEpic.set(key, []);
    byEpic.get(key).push(f);
  }

  for (const epic of allEpics) {
    const epicFeatures = sortFeaturesByPriority(byEpic.get(epic.id) || []);
    const doneCount = epicFeatures.filter(f => f.status === 'done').length;
    const pct = epicFeatures.length > 0 ? Math.round((doneCount / epicFeatures.length) * 100) : 0;

    html += `<div class="backlog-epic-group">
      <div class="backlog-epic-header">
        <span style="flex:1;">${esc(epic.title)}</span>
        <span style="font-size:10px; color:var(--viz-text-muted);">${doneCount}/${epicFeatures.length} (${pct}%)</span>
      </div>
      <div class="backlog-epic-progress"><div class="backlog-epic-progress-bar" style="width:${pct}%;"></div></div>
      <div class="backlog-weekly-features" id="weekly-epic-${epic.id}" data-epic-id="${epic.id}">
        ${epicFeatures.map(f => renderWeeklyCard(f)).join('')}
      </div>
    </div>`;
  }

  // Unassigned
  const unassigned = sortFeaturesByPriority(byEpic.get(null) || []);
  if (unassigned.length > 0) {
    html += `<div class="backlog-epic-group">
      <div class="backlog-epic-header"><span style="flex:1; font-style:italic;">Unassigned</span></div>
      <div class="backlog-weekly-features" id="weekly-epic-unassigned" data-epic-id="">
        ${unassigned.map(f => renderWeeklyCard(f)).join('')}
      </div>
    </div>`;
  }

  // Weekly Notes
  html += `<div style="margin-top:16px;">
    <label class="author-label">Weekly Notes</label>
    <textarea id="weekly-notes" class="library-input" rows="3" style="resize:vertical;"
      placeholder="Review notes, decisions..." onchange="updateWeeklyNotes(this.value)">${esc(reviewState.weeklyNotes || '')}</textarea>
  </div>`;

  container.innerHTML = html;
  setupDragReorder();
}

function renderWeeklyCard(f) {
  const band = getPriorityBand(f.computedPriority);
  return `<div class="backlog-feature ${f.status}" draggable="true" data-feature-id="${f.id}" onclick="showFeatureForm(${f.id})">
    <div class="backlog-feature-header">
      <span class="backlog-drag-handle" title="Drag to reorder">&#x2630;</span>
      <span class="backlog-feature-title" style="margin-left:6px;">${esc(f.title)}</span>
      <span class="backlog-priority-badge backlog-priority-${band.css}">${f.computedPriority}</span>
    </div>
    <div class="backlog-feature-meta">
      <select class="backlog-inline-status" onchange="event.stopPropagation(); inlineStatusChange(${f.id}, this.value)" onclick="event.stopPropagation();">
        ${FEATURE_STATUSES.map(s => `<option value="${s}" ${s === f.status ? 'selected' : ''}>${s}</option>`).join('')}
      </select>
      <span>V:${f.valueScore} S:${f.significanceScore}</span>
      <span>${esc(f.category)}</span>
    </div>
    ${f.description ? `<div style="font-size:11px; color:var(--viz-text-muted); margin-top:4px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${esc(f.description)}</div>` : ''}
  </div>`;
}

// ========================================
// PRIORITY MATRIX VIEW
// ========================================

export async function renderPriorityMatrix() {
  const container = document.getElementById('backlog-content');
  if (!container) return;

  const allFeatures = await getAllFeatures();
  const active = allFeatures.filter(f => f.status !== 'archived');
  const matrix = buildPriorityMatrix(active);

  // Render 5x5 grid with axis labels
  let html = '<div style="margin-bottom:8px; font-size:12px; color:var(--viz-text-secondary); text-align:center;">Value x Significance Priority Matrix</div>';
  html += '<div class="backlog-matrix">';

  // Header row (significance labels 1-5)
  html += '<div class="backlog-matrix-label"></div>';
  for (let s = 1; s <= 5; s++) {
    html += `<div class="backlog-matrix-axis">S${s}</div>`;
  }

  // Data rows (value 5 down to 1, so highest value is at top)
  for (let v = 5; v >= 1; v--) {
    html += `<div class="backlog-matrix-label">V${v}</div>`;
    for (let s = 1; s <= 5; s++) {
      const cellFeatures = matrix[v - 1][s - 1];
      const priority = v * s;
      const band = getPriorityBand(priority);
      const opacity = Math.min(0.6, 0.1 + (priority / 25) * 0.5);
      html += `<div class="backlog-matrix-cell" style="background:rgba(${bandRGB(band.css)},${opacity});"
        onclick="matrixCellClick(${v}, ${s})" title="${band.label}: ${cellFeatures.length} feature(s)">
        ${cellFeatures.length > 0 ? `<span class="backlog-matrix-count">${cellFeatures.length}</span>` : ''}
        ${cellFeatures.slice(0, 2).map(f => `<div class="backlog-matrix-pill">${esc(f.title.slice(0, 18))}</div>`).join('')}
        ${cellFeatures.length > 2 ? `<div class="backlog-matrix-pill" style="opacity:0.6;">+${cellFeatures.length - 2} more</div>` : ''}
      </div>`;
    }
  }

  html += '</div>';

  // Summary stats
  const bandCounts = PRIORITY_BANDS.map(b => ({
    ...b,
    count: active.filter(f => f.computedPriority >= b.min && f.computedPriority <= b.max).length,
  }));
  html += '<div style="display:flex; gap:8px; margin-top:12px; flex-wrap:wrap;">';
  for (const bc of bandCounts) {
    html += `<span class="backlog-priority-badge backlog-priority-${bc.css}" style="font-size:11px;">${bc.label}: ${bc.count}</span>`;
  }
  html += '</div>';

  container.innerHTML = html;
}

function bandRGB(css) {
  switch (css) {
    case 'low': return '76,175,80';
    case 'medium': return '255,235,59';
    case 'high': return '255,152,0';
    case 'very-high': return '255,87,34';
    case 'critical': return '244,67,54';
    default: return '100,100,100';
  }
}

// ========================================
// FEATURE FORM
// ========================================

export async function showFeatureForm(featureId) {
  state.backlogEditingFeatureId = featureId || null;
  const modal = document.getElementById('feature-form-modal');
  if (!modal) return;

  const titleEl = document.getElementById('feature-form-title');
  const deleteBtn = document.getElementById('btn-delete-feature');

  // Populate epic dropdown
  const epicSelect = document.getElementById('feature-epic');
  if (epicSelect) {
    const epics = await getAllEpics();
    epicSelect.innerHTML = '<option value="">-- Unassigned --</option>' +
      epics.map(e => `<option value="${e.id}">${esc(e.title)}</option>`).join('');
  }

  // Review section (shown/hidden based on state)
  const reviewSection = document.getElementById('feature-review-section');
  const submitReviewBtn = document.getElementById('btn-submit-review');
  const reviewInfoEl = document.getElementById('feature-review-info');
  const rejectionHistoryEl = document.getElementById('feature-rejection-history');

  if (featureId) {
    const f = await getFeature(featureId);
    if (!f) return;
    titleEl.textContent = 'Edit Feature';
    deleteBtn.style.display = '';
    document.getElementById('feature-title').value = f.title;
    document.getElementById('feature-category').value = f.category;
    if (epicSelect) epicSelect.value = f.epicId || '';
    document.getElementById('feature-user-story').value = f.userStory;
    document.getElementById('feature-description').value = f.description;
    document.getElementById('feature-value').value = f.valueScore;
    document.getElementById('feature-significance').value = f.significanceScore;
    document.getElementById('feature-status').value = f.status;
    document.getElementById('feature-tags').value = (f.tags || []).join(', ');
    document.getElementById('feature-notes').value = f.notes;
    renderCriteriaList(f.acceptanceCriteria || []);
    updatePriorityPreview();
    const focusCb = document.getElementById('feature-daily-focus');
    if (focusCb) focusCb.checked = f.dailyFocus || false;

    // Review controls
    if (reviewSection) reviewSection.style.display = '';
    if (submitReviewBtn) submitReviewBtn.style.display = f.status === 'draft' ? '' : 'none';
    if (reviewInfoEl) {
      if (f.status === 'approved' && f.reviewerName) {
        reviewInfoEl.innerHTML = `<span style="color:var(--viz-success); font-size:11px;">Approved by ${esc(f.reviewerName)} on ${f.reviewedAt ? new Date(f.reviewedAt).toLocaleDateString() : '?'}${f.reviewComment ? ': ' + esc(f.reviewComment) : ''}</span>`;
        reviewInfoEl.style.display = '';
      } else if (f.status === 'pending-review') {
        reviewInfoEl.innerHTML = '<span style="color:#fcd34d; font-size:11px;">Awaiting review</span>';
        reviewInfoEl.style.display = '';
      } else {
        reviewInfoEl.style.display = 'none';
      }
    }
    if (rejectionHistoryEl) {
      const rh = f.rejectionHistory || [];
      if (rh.length > 0) {
        rejectionHistoryEl.innerHTML = '<div style="font-size:11px; color:var(--viz-text-muted); margin-top:4px;"><strong>Rejection history:</strong></div>' +
          rh.map(r => `<div class="backlog-rejection-item">${esc(r.reviewer)} (${new Date(r.timestamp).toLocaleDateString()}): ${esc(r.comment)}</div>`).join('');
        rejectionHistoryEl.style.display = '';
      } else {
        rejectionHistoryEl.style.display = 'none';
      }
    }
  } else {
    titleEl.textContent = 'New Feature';
    deleteBtn.style.display = 'none';
    document.getElementById('feature-title').value = '';
    document.getElementById('feature-category').value = 'visualiser';
    if (epicSelect) epicSelect.value = '';
    document.getElementById('feature-user-story').value = '';
    document.getElementById('feature-description').value = '';
    document.getElementById('feature-value').value = '3';
    document.getElementById('feature-significance').value = '3';
    document.getElementById('feature-status').value = 'draft';
    document.getElementById('feature-tags').value = '';
    document.getElementById('feature-notes').value = '';
    renderCriteriaList([]);
    updatePriorityPreview();
    const focusCb = document.getElementById('feature-daily-focus');
    if (focusCb) focusCb.checked = false;
    // Hide review controls for new features
    if (reviewSection) reviewSection.style.display = 'none';
  }

  modal.style.display = 'flex';
}

export function closeFeatureForm() {
  const modal = document.getElementById('feature-form-modal');
  if (modal) modal.style.display = 'none';
  state.backlogEditingFeatureId = null;
}

export async function doSaveFeature() {
  const errorEl = document.getElementById('feature-form-error');
  const title = document.getElementById('feature-title').value.trim();
  if (!title) {
    if (errorEl) { errorEl.textContent = 'Title is required.'; errorEl.style.display = ''; }
    return;
  }
  if (errorEl) errorEl.style.display = 'none';

  const tagsStr = document.getElementById('feature-tags').value;
  const tags = tagsStr ? tagsStr.split(',').map(t => t.trim()).filter(Boolean) : [];
  const epicVal = document.getElementById('feature-epic').value;
  const focusCb = document.getElementById('feature-daily-focus');

  const data = {
    title,
    description: document.getElementById('feature-description').value.trim(),
    category: document.getElementById('feature-category').value,
    userStory: document.getElementById('feature-user-story').value.trim(),
    acceptanceCriteria: collectCriteria(),
    epicId: epicVal ? Number(epicVal) : null,
    valueScore: Number(document.getElementById('feature-value').value) || 3,
    significanceScore: Number(document.getElementById('feature-significance').value) || 3,
    status: document.getElementById('feature-status').value,
    tags,
    notes: document.getElementById('feature-notes').value.trim(),
    dailyFocus: focusCb ? focusCb.checked : false,
  };

  if (state.backlogEditingFeatureId) {
    await updateFeature(state.backlogEditingFeatureId, data);
  } else {
    await createFeature(data);
  }

  // Update daily focus in review state if changed
  if (data.dailyFocus !== undefined) {
    const rs = loadReviewState();
    const focusSet = new Set(rs.dailyFocusIds || []);
    const fid = state.backlogEditingFeatureId;
    if (fid) {
      if (data.dailyFocus) focusSet.add(fid); else focusSet.delete(fid);
      saveReviewState({ dailyFocusIds: [...focusSet] });
    }
  }

  closeFeatureForm();
  refreshBacklogView();
}

export async function doDeleteFeature() {
  if (!state.backlogEditingFeatureId) return;
  if (!confirm('Delete this feature?')) return;
  await deleteFeature(state.backlogEditingFeatureId);
  closeFeatureForm();
  refreshBacklogView();
}

// ========================================
// ACCEPTANCE CRITERIA ROWS
// ========================================

function renderCriteriaList(criteria) {
  const container = document.getElementById('feature-criteria-list');
  if (!container) return;
  container.innerHTML = criteria.map((c, i) => criterionRowHTML(i, c)).join('');
}

function criterionRowHTML(index, value) {
  return `<div class="backlog-criterion-row" data-index="${index}" style="display:flex; gap:4px; margin-bottom:4px;">
    <input type="text" class="library-input backlog-criterion-input" value="${esc(value)}" placeholder="Given/When/Then..." style="flex:1;">
    <button type="button" class="oaa-btn oaa-btn-secondary" onclick="removeCriterionRow(${index})" style="padding:4px 8px; font-size:11px; color:#fca5a5;">x</button>
  </div>`;
}

export function addCriterionRow() {
  const container = document.getElementById('feature-criteria-list');
  if (!container) return;
  const index = container.querySelectorAll('.backlog-criterion-row').length;
  container.insertAdjacentHTML('beforeend', criterionRowHTML(index, ''));
}

export function removeCriterionRow(index) {
  const container = document.getElementById('feature-criteria-list');
  if (!container) return;
  const row = container.querySelector(`[data-index="${index}"]`);
  if (row) row.remove();
}

function collectCriteria() {
  const inputs = document.querySelectorAll('.backlog-criterion-input');
  return Array.from(inputs).map(i => i.value.trim()).filter(Boolean);
}

// ========================================
// PRIORITY PREVIEW
// ========================================

export function updatePriorityPreview() {
  const v = Number(document.getElementById('feature-value')?.value) || 1;
  const s = Number(document.getElementById('feature-significance')?.value) || 1;
  const p = computePriority(v, s);
  const band = getPriorityBand(p);
  const el = document.getElementById('feature-computed-priority');
  if (el) {
    el.textContent = p;
    el.className = `backlog-priority-badge backlog-priority-${band.css}`;
  }
}

// ========================================
// EPIC FORM
// ========================================

export async function showEpicForm(epicId) {
  state.backlogEditingEpicId = epicId || null;
  const modal = document.getElementById('epic-form-modal');
  if (!modal) return;

  const titleEl = document.getElementById('epic-form-title');
  const deleteBtn = document.getElementById('btn-delete-epic');

  if (epicId) {
    const e = await getEpic(epicId);
    if (!e) return;
    titleEl.textContent = 'Edit Epic';
    deleteBtn.style.display = '';
    document.getElementById('epic-title').value = e.title;
    document.getElementById('epic-description').value = e.description;
    document.getElementById('epic-category').value = e.category;
    document.getElementById('epic-status').value = e.status;
  } else {
    titleEl.textContent = 'New Epic';
    deleteBtn.style.display = 'none';
    document.getElementById('epic-title').value = '';
    document.getElementById('epic-description').value = '';
    document.getElementById('epic-category').value = 'visualiser';
    document.getElementById('epic-status').value = 'planning';
  }

  modal.style.display = 'flex';
}

export function closeEpicForm() {
  const modal = document.getElementById('epic-form-modal');
  if (modal) modal.style.display = 'none';
  state.backlogEditingEpicId = null;
}

export async function doSaveEpic() {
  const title = document.getElementById('epic-title').value.trim();
  if (!title) return;

  const data = {
    title,
    description: document.getElementById('epic-description').value.trim(),
    category: document.getElementById('epic-category').value,
    status: document.getElementById('epic-status').value,
  };

  if (state.backlogEditingEpicId) {
    await updateEpic(state.backlogEditingEpicId, data);
  } else {
    await createEpic(data);
  }

  closeEpicForm();
  refreshBacklogView();
}

export async function doDeleteEpic() {
  if (!state.backlogEditingEpicId) return;
  if (!confirm('Delete this epic? Features will become unassigned.')) return;
  await deleteEpic(state.backlogEditingEpicId);
  closeEpicForm();
  refreshBacklogView();
}

// ========================================
// DAILY REVIEW HELPERS
// ========================================

export async function toggleDailyFocus(featureId) {
  const rs = loadReviewState();
  const focusSet = new Set(rs.dailyFocusIds || []);
  if (focusSet.has(featureId)) focusSet.delete(featureId);
  else focusSet.add(featureId);
  saveReviewState({ dailyFocusIds: [...focusSet] });
  await updateFeature(featureId, { dailyFocus: focusSet.has(featureId) });
  if (state.backlogView === 'daily') await renderDailyReview();
}

export async function markBlocker(featureId) {
  const reason = prompt('Blocker reason:');
  if (reason === null) return;
  await updateFeature(featureId, { blockerReason: reason || 'Blocked' });
  const rs = loadReviewState();
  const blockers = rs.blockers || [];
  blockers.push({ featureId, reason: reason || 'Blocked', since: new Date().toISOString() });
  saveReviewState({ blockers });
  refreshBacklogView();
}

export async function resolveBlocker(featureId) {
  await updateFeature(featureId, { blockerReason: null });
  const rs = loadReviewState();
  saveReviewState({ blockers: (rs.blockers || []).filter(b => b.featureId !== featureId) });
  refreshBacklogView();
}

// ========================================
// WEEKLY REVIEW HELPERS
// ========================================

export function updateSprintGoal(value) {
  saveReviewState({ sprintGoal: value });
}

export function updateWeeklyNotes(value) {
  saveReviewState({ weeklyNotes: value });
}

export async function inlineStatusChange(featureId, newStatus) {
  await updateFeature(featureId, { status: newStatus });
  // Don't re-render — inline update is sufficient
}

// ========================================
// DRAG-REORDER (HTML5 Drag & Drop)
// ========================================

function setupDragReorder() {
  document.querySelectorAll('.backlog-weekly-features').forEach(container => {
    container.addEventListener('dragstart', onDragStart);
    container.addEventListener('dragover', onDragOver);
    container.addEventListener('drop', onDrop);
    container.addEventListener('dragend', onDragEnd);
  });
}

let dragFeatureId = null;

function onDragStart(e) {
  const card = e.target.closest('.backlog-feature');
  if (!card) return;
  dragFeatureId = Number(card.dataset.featureId);
  card.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
}

function onDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  const card = e.target.closest('.backlog-feature');
  // Clear all drag-over states in this container
  const container = e.target.closest('.backlog-weekly-features');
  if (container) container.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
  if (card && Number(card.dataset.featureId) !== dragFeatureId) {
    card.classList.add('drag-over');
  }
}

async function onDrop(e) {
  e.preventDefault();
  const card = e.target.closest('.backlog-feature');
  if (!card || dragFeatureId === null) return;
  const targetId = Number(card.dataset.featureId);
  if (targetId === dragFeatureId) return;

  const container = card.closest('.backlog-weekly-features');
  if (!container) return;

  // Get ordered feature IDs from DOM
  const cards = [...container.querySelectorAll('.backlog-feature')];
  const ids = cards.map(c => Number(c.dataset.featureId));
  const fromIndex = ids.indexOf(dragFeatureId);
  const toIndex = ids.indexOf(targetId);
  if (fromIndex === -1 || toIndex === -1) return;

  ids.splice(fromIndex, 1);
  ids.splice(toIndex, 0, dragFeatureId);

  // Update priorityRank for all features in this group
  for (let i = 0; i < ids.length; i++) {
    await updateFeature(ids[i], { priorityRank: i });
  }

  dragFeatureId = null;
  await renderWeeklyReview();
}

function onDragEnd(e) {
  document.querySelectorAll('.dragging').forEach(el => el.classList.remove('dragging'));
  document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
  dragFeatureId = null;
}

// ========================================
// MATRIX CELL CLICK
// ========================================

export function matrixCellClick(value, significance) {
  state.backlogFilterText = '';
  const searchInput = document.getElementById('backlog-search-input');
  if (searchInput) searchInput.value = '';
  // Switch to overview with a temporary filter
  state.backlogView = 'overview';
  document.querySelectorAll('.backlog-view-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.view === 'overview');
  });
  // Temporarily store matrix filter
  state._matrixFilter = { value, significance };
  renderBacklogOverview();
}

// ========================================
// SEARCH & FILTER
// ========================================

export function filterBacklogEntries(text) {
  state.backlogFilterText = text.toLowerCase();
  state._matrixFilter = null;
  refreshBacklogView();
}

function filterFeatures(features) {
  let filtered = features;

  // Matrix filter (temporary, from cell click)
  if (state._matrixFilter) {
    const { value, significance } = state._matrixFilter;
    filtered = filtered.filter(f => f.valueScore === value && f.significanceScore === significance);
    return filtered;
  }

  // Text search
  if (state.backlogFilterText) {
    const q = state.backlogFilterText;
    filtered = filtered.filter(f =>
      (f.title || '').toLowerCase().includes(q) ||
      (f.description || '').toLowerCase().includes(q) ||
      (f.userStory || '').toLowerCase().includes(q) ||
      (f.tags || []).some(t => t.toLowerCase().includes(q))
    );
  }

  return filtered;
}

// ========================================
// EPIC COLLAPSE TOGGLE
// ========================================

export function toggleEpicCollapse(epicId) {
  const features = document.getElementById(`epic-features-${epicId}`);
  const chevron = document.getElementById(`epic-chev-${epicId}`);
  if (!features) return;
  const collapsed = features.style.display === 'none';
  features.style.display = collapsed ? '' : 'none';
  if (chevron) chevron.innerHTML = collapsed ? '&#x25BC;' : '&#x25B6;';
}

// ========================================
// IMPORT / EXPORT UI
// ========================================

export function showImportBacklogModal() {
  const modal = document.getElementById('import-backlog-modal');
  if (modal) modal.style.display = 'flex';
}

export function closeImportBacklogModal() {
  const modal = document.getElementById('import-backlog-modal');
  if (modal) modal.style.display = 'none';
}

export async function doImportBacklog() {
  const fileInput = document.getElementById('import-backlog-file');
  if (!fileInput || !fileInput.files.length) return;

  const file = fileInput.files[0];
  const text = await file.text();
  let result;

  try {
    if (file.name.endsWith('.json')) {
      const data = JSON.parse(text);
      result = await importBacklogFromJSON(data);
    } else {
      result = await importFromBacklogMD(text);
    }
    alert(`Imported ${result.epicCount} epics, ${result.featureCount} features.`);
  } catch (err) {
    alert('Import failed: ' + err.message);
  }

  closeImportBacklogModal();
  refreshBacklogView();
}

export async function doExportBacklog(format) {
  let content, filename, type;

  if (format === 'markdown') {
    content = await exportBacklogAsMarkdown();
    filename = 'backlog-export.md';
    type = 'text/markdown';
  } else {
    content = JSON.stringify(await exportBacklogAsJSON(), null, 2);
    filename = 'backlog-export.json';
    type = 'application/json';
  }

  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ========================================
// BULK OPERATIONS
// ========================================

export async function bulkStatusChange(featureIds, newStatus) {
  for (const id of featureIds) {
    await updateFeature(id, { status: newStatus });
  }
  refreshBacklogView();
}

// ========================================
// QUICK CAPTURE — AI-assisted feature entry
// ========================================

let _captureInput = '';  // stash brief text between modals

export function showQuickCaptureModal() {
  _captureInput = '';
  const modal = document.getElementById('capture-modal');
  if (!modal) return;
  const ta = modal.querySelector('#capture-brief-text');
  if (ta) ta.value = '';
  modal.style.display = 'flex';
}

export function closeQuickCaptureModal() {
  const modal = document.getElementById('capture-modal');
  if (modal) modal.style.display = 'none';
}

export function doGenerateFeaturePrompt() {
  const ta = document.getElementById('capture-brief-text');
  if (!ta || !ta.value.trim()) { alert('Please enter a brief feature idea.'); return; }

  _captureInput = ta.value.trim();
  const prompt = buildFeaturePrompt(_captureInput);

  closeQuickCaptureModal();

  // Reuse existing OAA modal pattern — show prompt with copy button
  const cmdText = `claude -p '${prompt.replace(/'/g, "'\\''")}'`;
  const modalHtml = `
    <div style="padding:18px; max-width:640px;">
      <h3 style="margin-top:0;">Generate Feature with Claude CLI</h3>
      <p style="font-size:12px; color:#94a3b8;">Copy the command below, run it in your terminal, then paste the JSON result back.</p>
      <textarea id="capture-prompt-text" readonly rows="10"
        style="width:100%; font-family:monospace; font-size:11px; background:#1e293b; color:#e2e8f0; border:1px solid #334155; border-radius:6px; padding:10px; resize:vertical;">${esc(cmdText)}</textarea>
      <div style="margin-top:12px; display:flex; gap:8px; justify-content:flex-end;">
        <button class="oaa-btn" onclick="document.getElementById('capture-prompt-text').select(); document.execCommand('copy'); this.textContent='Copied!';">Copy Command</button>
        <button class="oaa-btn" onclick="showCapturePasteModal()">Paste Result</button>
        <button class="oaa-btn oaa-btn-secondary" onclick="this.closest('.oaa-modal-overlay').style.display='none'">Close</button>
      </div>
    </div>`;

  // Create/reuse a floating overlay
  let overlay = document.getElementById('capture-prompt-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'capture-prompt-overlay';
    overlay.className = 'oaa-modal-overlay';
    document.body.appendChild(overlay);
  }
  overlay.innerHTML = modalHtml;
  overlay.style.display = 'flex';
}

export function showCapturePasteModal() {
  // Hide the prompt overlay if open
  const promptOverlay = document.getElementById('capture-prompt-overlay');
  if (promptOverlay) promptOverlay.style.display = 'none';

  const modal = document.getElementById('capture-paste-modal');
  if (!modal) return;
  const ta = modal.querySelector('#capture-paste-text');
  if (ta) ta.value = '';
  modal.style.display = 'flex';
}

export function closeCapturePasteModal() {
  const modal = document.getElementById('capture-paste-modal');
  if (modal) modal.style.display = 'none';
}

export async function doImportCapturedFeature() {
  const ta = document.getElementById('capture-paste-text');
  if (!ta || !ta.value.trim()) { alert('Please paste the JSON output from Claude.'); return; }

  let parsed;
  try {
    parsed = JSON.parse(ta.value.trim());
  } catch (e) {
    alert('Invalid JSON — please paste only the JSON output.\n\n' + e.message);
    return;
  }

  // Validate required fields
  const required = ['title'];
  for (const key of required) {
    if (!parsed[key]) { alert(`Missing required field: ${key}`); return; }
  }

  // Map parsed JSON to feature fields
  const featureData = {
    title: parsed.title || 'Untitled Feature',
    description: parsed.description || '',
    category: FEATURE_CATEGORIES.includes(parsed.category) ? parsed.category : 'visualiser',
    userStory: parsed.userStory || '',
    acceptanceCriteria: Array.isArray(parsed.acceptanceCriteria) ? parsed.acceptanceCriteria.join('\n') : (parsed.acceptanceCriteria || ''),
    valueScore: Math.max(1, Math.min(5, parseInt(parsed.valueScore) || 3)),
    significanceScore: Math.max(1, Math.min(5, parseInt(parsed.significanceScore) || 3)),
    tags: Array.isArray(parsed.tags) ? parsed.tags.join(', ') : (parsed.tags || ''),
    notes: parsed.notes || '',
    status: 'draft',
    generatedBy: 'claude-cli',
    captureInput: _captureInput || null,
  };

  try {
    const result = await createFeature(featureData);
    closeCapturePasteModal();
    _captureInput = '';

    // Open the feature form pre-filled so user can review/edit before saving further
    state.backlogEditingFeatureId = result.id;
    showFeatureForm(result.id);
    refreshBacklogView();
  } catch (e) {
    alert('Failed to create feature: ' + e.message);
  }
}

// ========================================
// HITL — Approve / Reject workflow
// ========================================

export async function doSubmitForReview() {
  const featureId = state.backlogEditingFeatureId;
  if (!featureId) return;

  try {
    await submitForReview(featureId);
    refreshBacklogView();
    // Refresh the form to show updated status
    showFeatureForm(featureId);
  } catch (e) {
    alert('Failed to submit for review: ' + e.message);
  }
}

export async function doApproveFeature(featureId) {
  const name = prompt('Reviewer name:');
  if (!name) return;
  const comment = prompt('Approval comment (optional):') || '';

  try {
    await approveFeature(featureId, name.trim(), comment.trim());
    refreshBacklogView();
    // If the feature form is open for this feature, refresh it
    if (state.backlogEditingFeatureId === featureId) {
      showFeatureForm(featureId);
    }
  } catch (e) {
    alert('Failed to approve: ' + e.message);
  }
}

export async function doRejectFeature(featureId) {
  const name = prompt('Reviewer name:');
  if (!name) return;
  const reason = prompt('Rejection reason:');
  if (!reason) { alert('A rejection reason is required.'); return; }

  try {
    await rejectFeature(featureId, name.trim(), reason.trim());
    refreshBacklogView();
    if (state.backlogEditingFeatureId === featureId) {
      showFeatureForm(featureId);
    }
  } catch (e) {
    alert('Failed to reject: ' + e.message);
  }
}
