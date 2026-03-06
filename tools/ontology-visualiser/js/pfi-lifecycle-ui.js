/**
 * PFI Lifecycle Workbench UI — F40.17
 *
 * Surfaces the 10-step PFI graph creation pipeline as interactive panels:
 * - Lifecycle Panel (Z21): progress tracker with action buttons per step
 * - Snapshot Manager Modal (Z18): freeze, version history, inherit, diff
 * - Binding Inspector (Z9 sidebar tab): product/ICP binding table
 */

import { state } from './state.js';
import {
  populateScopeRulesFromEMC, getScopeRulesForInstance,
  resolveProductContext, evaluateScopeRules, composeInstanceGraph,
  resolveProductBindings, resolveICPBindings, inferProductBindings,
  freezeComposedGraph, getCanonicalSnapshot, listSnapshotVersions,
  inheritSnapshot, diffSnapshots,
  generatePFIGraph, generatePersonaWorkflow,
} from './emc-composer.js';

// ─── Step Definitions ────────────────────────────────────────────────────────

const LIFECYCLE_STEPS = [
  { num: 1,  label: 'Create PFI Instance',      auto: true },
  { num: 2,  label: 'Load Instance Data',        auto: true },
  { num: 3,  label: 'Populate Scope Rules',       action: 'loadScopeRules' },
  { num: 4,  label: 'Resolve Product Context',    action: 'composeGraph', group: '4-6' },
  { num: 5,  label: 'Evaluate Scope Rules',       action: 'composeGraph', group: '4-6' },
  { num: 6,  label: 'Compose Instance Graph',     action: 'composeGraph', group: '4-6' },
  { num: 7,  label: 'Resolve Entity Bindings',    action: 'resolveBindings' },
  { num: 8,  label: 'Freeze Canonical Snapshot',  action: 'openSnapshotManager' },
  { num: 9,  label: 'Generate PFI Graph',         auto: true },
  { num: 10, label: 'Filter to Persona',          auto: true },
];

// Per-session step status: 'pending' | 'ready' | 'complete' | 'error'
const _stepStatus = new Map();
const _stepDetail = new Map();

function _resetStepStatus() {
  for (const s of LIFECYCLE_STEPS) {
    _stepStatus.set(s.num, 'pending');
    _stepDetail.set(s.num, '');
  }
}
_resetStepStatus();

// ─── Lifecycle Panel (S40.17.3) ──────────────────────────────────────────────

/**
 * Render the 10-step pipeline as a progress tracker inside #pfi-lifecycle-content.
 */
export function renderPFILifecyclePanel(instanceId) {
  const container = document.getElementById('pfi-lifecycle-content');
  if (!container) return;

  // Auto-detect step status from state
  _detectAutoSteps(instanceId);

  let html = `<div class="lifecycle-header" style="font-size:12px; color:var(--viz-text-secondary); margin-bottom:12px;">
    Instance: <strong style="color:var(--viz-accent);">${instanceId || 'None'}</strong>
  </div>`;

  html += '<div class="lifecycle-steps">';
  for (const step of LIFECYCLE_STEPS) {
    const status = _stepStatus.get(step.num) || 'pending';
    const detail = _stepDetail.get(step.num) || '';
    const badge = _statusBadge(status);
    const actionBtn = _actionButton(step, instanceId, status);

    html += `<div class="lifecycle-step lifecycle-step-${status}" style="display:flex; align-items:center; gap:8px; padding:6px 0; border-bottom:1px solid var(--viz-border-subtle, #2a2d37);">
      <span style="min-width:22px; text-align:center; font-size:11px; color:var(--viz-text-secondary);">${step.num}</span>
      ${badge}
      <span style="flex:1; font-size:12px;">${step.label}</span>
      ${actionBtn}
    </div>`;
    if (detail) {
      html += `<div style="padding:2px 0 4px 38px; font-size:10px; color:var(--viz-text-secondary);">${detail}</div>`;
    }
  }
  html += '</div>';

  // Footer: scope rule log summary
  const ruleLog = state.scopeRuleLog || [];
  const fired = ruleLog.filter(r => r.fired).length;
  if (ruleLog.length > 0) {
    html += `<div style="margin-top:12px; font-size:11px; color:var(--viz-text-secondary); border-top:1px solid var(--viz-border-subtle, #2a2d37); padding-top:8px;">
      Scope rules: ${fired}/${ruleLog.length} fired
    </div>`;
  }

  container.innerHTML = html;
}

function _detectAutoSteps(instanceId) {
  // Step 1: instance exists
  if (instanceId && state.pfiInstances.has(instanceId)) {
    _stepStatus.set(1, 'complete');
  }
  // Step 2: instance data loaded
  if (instanceId && state.pfiInstanceData.has(instanceId)) {
    _stepStatus.set(2, 'complete');
  }
  // Step 3: scope rules loaded
  if (state.activeScopeRules && state.activeScopeRules.length > 0) {
    _stepStatus.set(3, 'complete');
    _stepDetail.set(3, `${state.activeScopeRules.length} rules loaded`);
  }
  // Steps 4-6: composed graph exists
  if (state.composedPFIGraph) {
    _stepStatus.set(4, 'complete');
    _stepStatus.set(5, 'complete');
    _stepStatus.set(6, 'complete');
    const meta = state.composedPFIGraph.metadata || {};
    _stepDetail.set(6, `${meta.entityCount || '?'} entities, ${meta.edgeCount || '?'} edges`);
  }
  // Step 7: bindings resolved
  if (state.productBindings && state.productBindings.size > 0) {
    _stepStatus.set(7, 'complete');
    _stepDetail.set(7, `${state.productBindings.size} product bindings`);
  }
  // Step 8: snapshot exists for this instance
  if (instanceId) {
    const inst = state.pfiInstances.get(instanceId);
    if (inst?.inheritedSnapshotId) {
      _stepStatus.set(8, 'complete');
      _stepDetail.set(8, inst.inheritedSnapshotId);
    }
  }
  // Step 9: PFI graph active
  if (state.composedPFIGraph && state.scopeRulesActive) {
    _stepStatus.set(9, 'complete');
  }
  // Step 10: persona active
  if (state.activePersonaScope) {
    _stepStatus.set(10, 'complete');
    _stepDetail.set(10, state.activePersonaScope);
  } else if (state.composedPFIGraph) {
    _stepStatus.set(10, 'ready');
    _stepDetail.set(10, 'Showing all personas');
  }
}

function _statusBadge(status) {
  const colors = { pending: '#555', ready: '#f59e0b', complete: '#22c55e', error: '#ef4444' };
  const icons = { pending: '○', ready: '◐', complete: '●', error: '✕' };
  return `<span style="color:${colors[status]}; font-size:13px; min-width:16px;" title="${status}">${icons[status]}</span>`;
}

function _actionButton(step, instanceId, status) {
  if (step.auto || status === 'complete') return '';
  if (step.group === '4-6' && step.num !== 4) return ''; // Only show button on step 4

  const actions = {
    loadScopeRules: { label: 'Load Rules', onclick: 'doLifecycleLoadScopeRules' },
    composeGraph: { label: 'Compose', onclick: 'doLifecycleCompose' },
    resolveBindings: { label: 'Resolve', onclick: 'doLifecycleResolveBindings' },
    openSnapshotManager: { label: 'Freeze...', onclick: 'showSnapshotManager' },
  };
  const a = actions[step.action];
  if (!a) return '';
  return `<button class="oaa-btn" onclick="${a.onclick}()" style="font-size:10px; padding:3px 8px;">${a.label}</button>`;
}

// ─── Step Status Updater ─────────────────────────────────────────────────────

/**
 * Update a single step's status badge and optional detail text.
 */
export function updateLifecycleStep(stepNumber, status, detail) {
  _stepStatus.set(stepNumber, status);
  if (detail !== undefined) _stepDetail.set(stepNumber, detail);
  // Re-render if panel is visible
  const panel = document.getElementById('pfi-lifecycle-panel');
  if (panel && panel.style.display !== 'none') {
    renderPFILifecyclePanel(state.activeInstanceId);
  }
}

// ─── Snapshot Manager Modal (S40.17.4) ───────────────────────────────────────

/**
 * Render snapshot manager inside #snapshot-modal-body.
 */
export function renderSnapshotManager(instanceId) {
  const container = document.getElementById('snapshot-modal-body');
  if (!container) return;

  // Current composed graph spec summary
  const graph = state.composedPFIGraph;
  const meta = graph?.metadata || {};
  let html = '<div style="margin-bottom:16px;">';
  html += `<div style="font-size:12px; color:var(--viz-text-secondary); margin-bottom:8px;">Instance: <strong>${instanceId || 'None'}</strong></div>`;
  if (graph) {
    html += `<div style="font-size:11px; color:var(--viz-text-secondary);">
      ${meta.entityCount || 0} entities, ${meta.edgeCount || 0} edges, ${(meta.ontologySources || []).length} ontologies
    </div>`;
  }
  html += '</div>';

  // Freeze form
  html += `<div style="border:1px solid var(--viz-border-subtle, #2a2d37); border-radius:6px; padding:12px; margin-bottom:16px;">
    <h4 style="margin:0 0 8px 0; font-size:13px;">Freeze New Snapshot</h4>
    <div style="display:flex; gap:8px; align-items:center; margin-bottom:8px;">
      <label style="font-size:11px; min-width:60px;">Version:</label>
      <input type="text" id="snapshot-version-input" placeholder="1.0.0" style="flex:1; background:var(--viz-surface-default, #1e1e2e); border:1px solid var(--viz-border-subtle, #2a2d37); color:var(--viz-text-primary); padding:4px 8px; border-radius:4px; font-size:12px;">
    </div>
    <div style="display:flex; gap:8px; align-items:center; margin-bottom:8px;">
      <label style="font-size:11px; min-width:60px;">Admin:</label>
      <input type="text" id="snapshot-admin-input" placeholder="admin@pfc.io" style="flex:1; background:var(--viz-surface-default, #1e1e2e); border:1px solid var(--viz-border-subtle, #2a2d37); color:var(--viz-text-primary); padding:4px 8px; border-radius:4px; font-size:12px;">
    </div>
    <button class="oaa-btn" onclick="doFreezeSnapshot()" style="font-size:11px; padding:5px 12px;" ${graph ? '' : 'disabled'}>Freeze</button>
    <span id="snapshot-freeze-status" style="font-size:11px; margin-left:8px;"></span>
  </div>`;

  // Version history
  const specId = graph?.specId || state.pfiInstances.get(instanceId)?.composedGraphSpec?.specId;
  const versions = specId ? listSnapshotVersions(specId) : [];

  html += '<h4 style="margin:0 0 8px 0; font-size:13px;">Version History</h4>';
  if (versions.length === 0) {
    html += '<div style="font-size:11px; color:var(--viz-text-secondary);">No snapshots yet.</div>';
  } else {
    html += '<table style="width:100%; border-collapse:collapse; font-size:11px;">';
    html += '<tr style="border-bottom:1px solid var(--viz-border-subtle, #2a2d37);"><th style="text-align:left; padding:4px;">Version</th><th>Status</th><th>Frozen At</th><th>Actions</th></tr>';
    for (const v of versions) {
      const statusColor = v.changeControlStatus === 'locked' ? '#22c55e' : '#666';
      const statusLabel = v.changeControlStatus === 'locked' ? 'Locked' : 'Superseded';
      const inheritBtn = v.changeControlStatus === 'locked'
        ? `<button class="oaa-btn" onclick="doInheritSnapshot('${v.snapshotId}')" style="font-size:10px; padding:2px 6px;">Inherit</button>`
        : '';
      const diffBtn = `<input type="checkbox" class="snapshot-diff-cb" data-id="${v.snapshotId}" style="margin-left:4px;" title="Select for diff">`;
      html += `<tr style="border-bottom:1px solid var(--viz-border-subtle, #2a2d37);">
        <td style="padding:4px;">${v.version}</td>
        <td style="text-align:center;"><span style="color:${statusColor}; font-size:10px;">${statusLabel}</span></td>
        <td style="text-align:center; color:var(--viz-text-secondary);">${v.frozenAt ? v.frozenAt.slice(0, 10) : ''}</td>
        <td style="text-align:right;">${inheritBtn}${diffBtn}</td>
      </tr>`;
    }
    html += '</table>';
    html += `<button class="oaa-btn oaa-btn-secondary" onclick="doDiffSelectedSnapshots()" style="font-size:10px; padding:3px 8px; margin-top:8px;">Compare Selected</button>`;
    html += '<div id="snapshot-diff-result" style="margin-top:8px;"></div>';
  }

  container.innerHTML = html;
}

// ─── Binding Inspector (S40.17.5) ────────────────────────────────────────────

/**
 * Render product/ICP binding tables in the sidebar Bindings tab.
 */
export function renderBindingInspector(instanceId) {
  const container = document.getElementById('tab-bindings');
  if (!container) return;

  const productBindings = state.productBindings;
  const icpBindings = state.icpBindings;

  if ((!productBindings || productBindings.size === 0) && (!icpBindings || icpBindings.size === 0)) {
    container.innerHTML = '<p style="color:#666; font-size:12px;">No bindings resolved. Use the Lifecycle panel to resolve entity bindings.</p>';
    return;
  }

  let html = '<div style="margin-bottom:8px; display:flex; gap:4px;">';
  html += '<button class="oaa-btn" onclick="filterBindings(\'all\')" style="font-size:10px; padding:2px 6px;">All</button>';
  html += '<button class="oaa-btn oaa-btn-secondary" onclick="filterBindings(\'explicit\')" style="font-size:10px; padding:2px 6px;">Explicit</button>';
  html += '<button class="oaa-btn oaa-btn-secondary" onclick="filterBindings(\'inferred\')" style="font-size:10px; padding:2px 6px;">Inferred</button>';
  html += '</div>';

  // Product bindings
  if (productBindings && productBindings.size > 0) {
    html += '<h4 style="font-size:12px; margin:8px 0 4px 0; color:var(--viz-accent);">Product Bindings</h4>';
    html += '<div class="binding-table" id="product-binding-table" style="max-height:200px; overflow-y:auto;">';
    for (const [entityId, entries] of productBindings) {
      for (const b of entries) {
        const typeBadge = b.bindingType === 'inferred'
          ? '<span style="color:#f59e0b; font-size:9px;">inferred</span>'
          : '<span style="color:#22c55e; font-size:9px;">explicit</span>';
        const conf = b.confidence !== undefined ? `${Math.round(b.confidence * 100)}%` : '';
        html += `<div class="binding-row" data-type="${b.bindingType}" style="display:flex; gap:6px; padding:3px 0; font-size:11px; border-bottom:1px solid var(--viz-border-subtle, #2a2d37); cursor:pointer;" onclick="focusBindingNode('${entityId}')">
          <span style="flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${entityId}</span>
          <span style="min-width:60px;">${b.productCode || ''}</span>
          ${typeBadge}
          <span style="min-width:30px; text-align:right; color:var(--viz-text-secondary);">${conf}</span>
        </div>`;
      }
    }
    html += '</div>';
  }

  // ICP bindings
  if (icpBindings && icpBindings.size > 0) {
    html += '<h4 style="font-size:12px; margin:12px 0 4px 0; color:var(--viz-accent);">ICP Bindings</h4>';
    html += '<div class="binding-table" id="icp-binding-table" style="max-height:200px; overflow-y:auto;">';
    for (const [entityId, entries] of icpBindings) {
      for (const b of entries) {
        const seniority = b.seniorityLevel ? `[${b.seniorityLevel}]` : '';
        html += `<div class="binding-row" style="display:flex; gap:6px; padding:3px 0; font-size:11px; border-bottom:1px solid var(--viz-border-subtle, #2a2d37); cursor:pointer;" onclick="focusBindingNode('${entityId}')">
          <span style="flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${entityId}</span>
          <span style="min-width:80px;">${b.icpLabel || b.icpRef || ''}</span>
          <span style="min-width:40px; color:var(--viz-text-secondary); font-size:10px;">${seniority}</span>
        </div>`;
      }
    }
    html += '</div>';
  }

  container.innerHTML = html;
}

// ─── Lifecycle Action Handlers ───────────────────────────────────────────────

/**
 * Step 3 handler: load scope rules from EMC data for the active instance.
 * Looks for EMC instance data in the active PFI's loaded files (ontologyRef
 * or path match), then populates SCOPE_RULES via populateScopeRulesFromEMC.
 */
export function doLifecycleLoadScopeRules() {
  try {
    const instanceId = state.activeInstanceId;
    if (!instanceId) {
      updateLifecycleStep(3, 'error', 'No active instance — select a PFI first');
      return;
    }

    const loaded = loadScopeRulesForInstance(instanceId);
    if (loaded > 0) {
      const rules = getScopeRulesForInstance(instanceId);
      updateLifecycleStep(3, 'complete', `${rules.length} rules loaded`);
    } else {
      // Check if BAIV defaults are available as fallback
      const defaults = getScopeRulesForInstance(instanceId);
      if (defaults.length > 0) {
        updateLifecycleStep(3, 'complete', `${defaults.length} default rules`);
      } else {
        updateLifecycleStep(3, 'warning', 'No EMC scope rules found for this instance');
      }
    }
  } catch (err) {
    updateLifecycleStep(3, 'error', err.message);
  }
}

/**
 * Load scope rules for a specific PFI instance from its loaded EMC data.
 * Searches the instance's loaded files for EMC-ONT data and parses scope rules.
 *
 * @param {string} instanceId - e.g. 'PFI-W4M-WWG'
 * @returns {number} Number of instances with rules populated
 */
export function loadScopeRulesForInstance(instanceId) {
  const instanceData = state.pfiInstanceData?.get(instanceId);
  if (!instanceData?.files) return 0;

  // Find EMC file by ontologyRef or path pattern
  const emcFile = instanceData.files.find(f =>
    f.ontologyRef === 'EMC-ONT' ||
    f.path?.toLowerCase().includes('emc')
  );

  if (emcFile?.rawData) {
    return populateScopeRulesFromEMC(emcFile.rawData, instanceId);
  }

  return 0;
}

/**
 * Steps 4-6 handler: resolve context → evaluate rules → compose graph.
 */
export function doLifecycleCompose() {
  const instanceId = state.activeInstanceId;
  if (!instanceId) return;
  try {
    const context = resolveProductContext(instanceId);
    updateLifecycleStep(4, 'complete');
    const scopeResult = evaluateScopeRules(instanceId, context);
    updateLifecycleStep(5, 'complete', `${scopeResult.ruleLog?.filter(r => r.fired).length || 0} rules fired`);
    const graph = composeInstanceGraph(instanceId, scopeResult);
    state.composedPFIGraph = graph;
    state.scopeRulesActive = true;
    state.productContext = context;
    state.scopeRuleLog = scopeResult.ruleLog || [];
    const meta = graph.metadata || {};
    updateLifecycleStep(6, 'complete', `${meta.entityCount || 0} entities, ${meta.edgeCount || 0} edges`);
    updateLifecycleStep(9, 'complete');
  } catch (err) {
    updateLifecycleStep(6, 'error', err.message);
  }
}

/**
 * Step 7 handler: resolve product + ICP + inferred bindings.
 */
export function doLifecycleResolveBindings() {
  const instanceId = state.activeInstanceId;
  if (!instanceId) return;
  try {
    state.productBindings = resolveProductBindings(instanceId);
    state.icpBindings = resolveICPBindings(instanceId);
    if (state.composedPFIGraph && state.productBindings) {
      const inferred = inferProductBindings(state.composedPFIGraph, state.productBindings);
      // Merge inferred into product bindings
      for (const [entityId, entries] of inferred) {
        const existing = state.productBindings.get(entityId) || [];
        state.productBindings.set(entityId, [...existing, ...entries]);
      }
    }
    updateLifecycleStep(7, 'complete', `${state.productBindings?.size || 0} product, ${state.icpBindings?.size || 0} ICP`);
  } catch (err) {
    updateLifecycleStep(7, 'error', err.message);
  }
}

/**
 * Freeze handler — called from snapshot manager modal.
 */
export function doFreezeSnapshot() {
  const versionInput = document.getElementById('snapshot-version-input');
  const adminInput = document.getElementById('snapshot-admin-input');
  const statusEl = document.getElementById('snapshot-freeze-status');
  if (!versionInput) return;

  const version = versionInput.value.trim();
  const adminRef = adminInput?.value.trim() || 'admin';

  // Build spec from current composed graph
  const graph = state.composedPFIGraph;
  if (!graph) {
    if (statusEl) statusEl.textContent = 'No composed graph — compose first';
    return;
  }

  const spec = {
    specId: graph.specId || `${state.activeInstanceId || 'PFI'}-Graph-Spec`,
    componentOntologies: (graph.metadata?.ontologySources || []).map(ref => ({
      ontologyRef: ref, series: '', required: true,
    })),
    joinPoints: graph.edges?.filter(e => e.isCrossOntology) || [],
    scopeRules: (state.scopeRuleLog || []).filter(r => r.fired).map(r => r.ruleId),
    entityCount: graph.metadata?.entityCount || 0,
  };

  const result = freezeComposedGraph(spec, version, adminRef);
  if (result.success) {
    if (statusEl) statusEl.innerHTML = `<span style="color:#22c55e;">Frozen as ${result.snapshot.snapshotId}</span>`;
    updateLifecycleStep(8, 'complete', result.snapshot.snapshotId);
    // Refresh version history
    renderSnapshotManager(state.activeInstanceId);
  } else {
    if (statusEl) statusEl.innerHTML = `<span style="color:#ef4444;">${result.error}</span>`;
  }
}

/**
 * Inherit a snapshot for the active instance.
 */
export function doInheritSnapshot(snapshotId) {
  const instanceId = state.activeInstanceId;
  if (!instanceId) return;
  const result = inheritSnapshot(instanceId, snapshotId);
  if (result.success) {
    updateLifecycleStep(8, 'complete', snapshotId);
    updateLifecycleStep(9, 'complete');
    renderSnapshotManager(instanceId);
  }
}

/**
 * Compare two selected snapshots via checkboxes.
 */
export function doDiffSelectedSnapshots() {
  const cbs = document.querySelectorAll('.snapshot-diff-cb:checked');
  const resultEl = document.getElementById('snapshot-diff-result');
  if (cbs.length !== 2) {
    if (resultEl) resultEl.innerHTML = '<span style="color:#f59e0b; font-size:11px;">Select exactly 2 snapshots to compare.</span>';
    return;
  }
  const ids = [...cbs].map(cb => cb.dataset.id);
  const diff = diffSnapshots(ids[0], ids[1]);
  if (!diff.success) {
    if (resultEl) resultEl.innerHTML = `<span style="color:#ef4444; font-size:11px;">${diff.error}</span>`;
    return;
  }
  if (resultEl) {
    resultEl.innerHTML = `<div style="font-size:11px; padding:8px; background:var(--viz-surface-default, #1e1e2e); border-radius:4px;">
      <strong>${diff.oldVersion || 'null'} → ${diff.newVersion}</strong><br>
      Nodes: <span style="color:#22c55e;">+${diff.summary.nodesAdded}</span>
      <span style="color:#ef4444;">-${diff.summary.nodesRemoved}</span>
      <span style="color:#f59e0b;">~${diff.summary.nodesModified}</span><br>
      Edges: <span style="color:#22c55e;">+${diff.summary.edgesAdded}</span>
      <span style="color:#ef4444;">-${diff.summary.edgesRemoved}</span>
    </div>`;
  }
}

/**
 * Filter binding rows by type (all/explicit/inferred).
 */
export function filterBindings(type) {
  const rows = document.querySelectorAll('.binding-row');
  for (const row of rows) {
    if (type === 'all') {
      row.style.display = '';
    } else {
      row.style.display = (row.dataset.type === type || !row.dataset.type) ? '' : 'none';
    }
  }
}

/**
 * Focus a node in the graph from binding inspector click.
 */
export function focusBindingNode(entityId) {
  if (typeof window.focusNode === 'function') {
    window.focusNode(entityId);
  }
}
