/**
 * UI panel management — sidebar, audit panel, modals, tab navigation.
 * Functions that need renderGraph (loadFromLibrary, restoreVersion) are in app.js.
 */

import { state, SERIES_COLORS, DS_BRIDGE_STYLES } from './state.js';
import { validateOAAv5 } from './audit-engine.js';
import { getVersionHistory, loadOntologyFromLibrary } from './library-manager.js';
import { DEFAULT_CATEGORIES } from './state.js';
import { renderDSComponentBindings } from './ds-authoring.js';
import { getNodeRenderMode, getActiveFilteredView } from './composition-filter.js';

export function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Find namespace for a registry entry ID (e.g., "Entry-ONT-GDPR-001" → "gdpr:")
function findNamespaceForEntry(entryId) {
  if (!state.loadedOntologies) return null;
  for (const [ns, record] of state.loadedOntologies) {
    if (record.registryEntry && record.registryEntry['@id'] === entryId) {
      return ns;
    }
  }
  return null;
}

// Foundation extension helpers (Epic 2 — Story #73)

function findReferencingOntologies(nodeId) {
  const results = [];
  const seenNamespaces = new Set();

  for (const edge of state.crossEdges) {
    if (edge.to !== nodeId) continue;
    const sourceNs = edge.sourceNamespace;
    if (!sourceNs || seenNamespaces.has(sourceNs)) continue;
    seenNamespaces.add(sourceNs);

    const record = state.loadedOntologies?.get(sourceNs);
    if (record && record.series !== 'Foundation') {
      const refCount = state.crossEdges.filter(
        e => e.to === nodeId && e.sourceNamespace === sourceNs
      ).length;
      results.push({
        namespace: sourceNs,
        name: record.name.replace(/\s+Ontology.*$/i, ''),
        series: record.series,
        isPlaceholder: record.isPlaceholder,
        refCount
      });
    }
  }

  return results.sort((a, b) => b.refCount - a.refCount);
}

function findFoundationReferences(nodeId, sourceNs) {
  const results = [];
  const seenTargets = new Set();
  const sourcePrefix = sourceNs?.replace(/:$/, '');

  for (const edge of state.crossEdges) {
    // Check edges originating from this node or from the same ontology
    const edgeFromPrefix = edge.from?.split('::')[0];
    if (edge.from !== nodeId && edgeFromPrefix !== sourcePrefix) continue;

    // Check if target is in a Foundation ontology
    const toPrefix = edge.to?.split('::')[0];
    if (!toPrefix) continue;

    let targetNs = null;
    for (const [ns, record] of state.loadedOntologies) {
      if (ns.replace(/:$/, '') === toPrefix && record.series === 'Foundation') {
        targetNs = ns;
        break;
      }
    }

    if (targetNs && !seenTargets.has(edge.to)) {
      seenTargets.add(edge.to);
      const targetRecord = state.loadedOntologies.get(targetNs);
      results.push({
        entityId: edge.to,
        entityLabel: edge.to.split('::')[1] || edge.to,
        ontologyName: targetRecord?.name || targetNs,
        namespace: targetNs
      });
    }
  }

  return results;
}

// F40.26: Entity cross-reference lookup — find all ontologies with same local name

/**
 * Find cross-ontology references for a node based on shared local name.
 * Scans mergedGraph nodes for entities with the same local name in different namespaces.
 *
 * @param {Object} node - The selected node (must have sourceNamespace + originalId or id)
 * @returns {Array<{namespace: string, name: string, series: string, qualifiedId: string, prefixedId: string}>}
 */
export function getEntityCrossReferences(node) {
  if (state.viewMode !== 'multi' || !state.mergedGraph?.nodes) return [];

  const sourceNs = node.sourceNamespace;
  if (!sourceNs) return [];

  // Extract local name (after the colon in original ID)
  const origId = node.originalId || node.id;
  const localName = origId.includes(':') ? origId.split(':').pop() : origId;
  if (!localName) return [];

  const results = [];
  const seenNamespaces = new Set();
  seenNamespaces.add(sourceNs); // exclude self

  for (const n of state.mergedGraph.nodes) {
    if (!n.sourceNamespace || seenNamespaces.has(n.sourceNamespace)) continue;

    const nOrigId = n.originalId || n.id;
    const nLocalName = nOrigId.includes(':') ? nOrigId.split(':').pop() : nOrigId;

    if (nLocalName === localName) {
      seenNamespaces.add(n.sourceNamespace);
      const record = state.loadedOntologies?.get(n.sourceNamespace);
      results.push({
        namespace: n.sourceNamespace,
        name: record?.name?.replace(/\s+Ontology.*$/i, '') || n.sourceNamespace,
        series: n.series || record?.series || '',
        qualifiedId: nOrigId,
        prefixedId: n.id,
      });
    }
  }

  return results.sort((a, b) => a.name.localeCompare(b.name));
}

export function field(label, value) {
  return `<div class="field"><div class="field-label">${label}</div><div class="field-value">${value}</div></div>`;
}

export function renderAuditPanel(audit) {
  state.lastAudit = audit;
  const el = document.getElementById('audit-content');
  let html = '';

  // --- OAA Gates Summary (Story #67: 1.4.1) ---
  const gate2bPass = audit.isolated.length === 0;
  const gate2cPass = audit.components.length <= 1;
  const density = audit.totalNodes > 0 ? (audit.totalEdges / audit.totalNodes) : 0;
  const densityRounded = density.toFixed(2);
  const threshold = state.densityThreshold;
  const densityPass = density >= threshold;
  const densityWarn = density >= threshold * 0.75;
  const densityColor = densityPass ? 'green' : (densityWarn ? 'yellow' : 'red');
  const densityStatus = densityPass ? 'pass' : (densityWarn ? 'warn' : 'fail');
  const allGatesPass = gate2bPass && gate2cPass && densityPass;
  const overallStatus = allGatesPass ? 'pass' : (!gate2bPass ? 'fail' : 'warn');

  html += `<div class="gates-summary">`;
  html += `<div class="gates-summary-header">`;
  html += `<span class="gates-summary-title">OAA Gates</span>`;
  html += `<span class="gate-badge ${overallStatus}">${overallStatus === 'pass' ? 'ALL PASS' : overallStatus === 'fail' ? 'FAIL' : 'WARNING'}</span>`;
  html += `</div>`;

  // GATE 2B row
  html += `<div class="gates-summary-row">`;
  html += `<span class="gate-label">GATE 2B: Entity Connectivity</span>`;
  html += `<span class="gate-badge ${gate2bPass ? 'pass' : 'fail'}">${gate2bPass ? 'PASS' : 'FAIL'}</span>`;
  html += `</div>`;

  // GATE 2C row
  html += `<div class="gates-summary-row">`;
  html += `<span class="gate-label">GATE 2C: Graph Connectivity</span>`;
  html += `<span class="gate-badge ${gate2cPass ? 'pass' : 'warn'}">${gate2cPass ? 'PASS' : 'WARNING'}</span>`;
  html += `</div>`;

  // Density row
  html += `<div class="gates-summary-row">`;
  html += `<span class="gate-label">Density (edge:node)</span>`;
  html += `<span class="density-indicator"><span class="density-dot ${densityColor}"></span><span class="density-value">${densityRounded}</span><span class="gate-badge ${densityStatus}">${densityStatus === 'pass' ? 'PASS' : densityStatus === 'warn' ? 'WARN' : 'LOW'}</span></span>`;
  html += `</div>`;

  // Threshold config
  html += `<div class="gates-summary-row" style="border-bottom:none;">`;
  html += `<span class="density-threshold-control"><label>Threshold:</label><input type="number" id="density-threshold-input" value="${threshold}" step="0.1" min="0.1" max="3.0" onchange="updateDensityThreshold(this.value)"></span>`;
  html += `</div>`;

  // Export/copy actions
  html += `<div class="gates-summary-actions">`;
  html += `<button class="oaa-btn oaa-btn-secondary" onclick="exportGateReport()">Export MD</button>`;
  html += `<button class="oaa-btn oaa-btn-secondary" onclick="copyGateResults()">Copy to Clipboard</button>`;
  if (!allGatesPass) {
    html += `<button class="oaa-btn" onclick="runFixPrompt()" style="background:#017c75;" title="Generate a Claude Code prompt to fix failing gates">Fix with AI</button>`;
  }
  html += `</div>`;

  html += `</div>`;

  // --- Summary section ---
  html += `<div class="audit-section"><h4>Summary</h4>`;
  html += `<div class="audit-item">Format: <strong>${audit.format}</strong></div>`;
  html += `<div class="audit-item">${audit.totalNodes} nodes, ${audit.totalEdges} edges</div>`;
  html += `<div class="audit-item">Connected components: ${audit.components.length} `;
  html += audit.disconnectedCount === 0
    ? `<span class="audit-badge ok">Fully connected</span>`
    : `<span class="audit-badge warn">${audit.disconnectedCount} disconnected</span>`;
  html += `</div>`;
  html += `<div class="audit-item">Main component: ${audit.mainComponentSize} nodes</div>`;
  html += `<div class="audit-item">Density: <span class="density-indicator"><span class="density-dot ${densityColor}"></span><span class="density-value">${densityRounded}</span></span> (threshold: ${threshold})</div>`;
  html += `</div>`;

  if (audit.stubNodes.length > 0) {
    html += `<div class="audit-section"><h4>Auto-created stubs <span class="audit-badge warn">${audit.stubNodes.length}</span></h4>`;
    audit.stubNodes.forEach(id => {
      html += `<div class="audit-item" onclick="focusNode('${id.replace(/'/g, "\\'")}')">${id}</div>`;
    });
    html += `</div>`;
  }

  if (audit.isolated.length > 0) {
    html += `<div class="audit-section"><h4>Isolated nodes (silos) <span class="gate-badge fail">GATE 2B FAIL</span> <span class="audit-badge warn">${audit.isolated.length}</span></h4>`;
    audit.isolated.forEach(n => {
      html += `<div class="audit-item" onclick="focusNode('${n.id.replace(/'/g, "\\'")}')">${n.label} <span style="color:#666">(${n.entityType})</span></div>`;
    });
    html += `</div>`;
  }

  if (audit.components.length > 1) {
    html += `<div class="audit-section"><h4>Disconnected clusters <span class="gate-badge warn">GATE 2C WARNING</span></h4>`;

    // Component colouring toggle and filter (Stories #61, #62)
    html += `<div style="margin-bottom:8px; display:flex; gap:8px; align-items:center;">`;
    html += `<button class="oaa-btn oaa-btn-secondary" style="font-size:11px; padding:4px 10px;" onclick="toggleComponentColoring()">`;
    html += `${state.componentColoringActive ? 'Hide' : 'Show'} Colours</button>`;
    html += `<select id="component-filter-select" onchange="filterComponent(this.value)" style="background:#22252f; border:1px solid #3a3d47; border-radius:4px; padding:4px 8px; color:#ccc; font-size:11px;">`;
    html += `<option value="all" ${state.componentFilter === null ? 'selected' : ''}>Show All</option>`;
    audit.components.forEach((comp, i) => {
      const label = i === 0 ? `Main (${comp.length} nodes)` : `Cluster ${i} (${comp.length} nodes)`;
      html += `<option value="${i}" ${state.componentFilter === i ? 'selected' : ''}>${label}</option>`;
    });
    html += `</select>`;
    html += `</div>`;

    audit.components.slice(1).forEach((comp, i) => {
      const preview = comp.slice(0, 3).join(', ') + (comp.length > 3 ? '...' : '');
      html += `<div class="audit-item" onclick="focusNodes(${JSON.stringify(comp)})">Cluster ${i + 1}: ${comp.length} nodes \u2014 ${preview}</div>`;
    });
    html += `</div>`;
  }

  if (audit.stubNodes.length === 0 && audit.isolated.length === 0 && audit.disconnectedCount === 0) {
    html += `<div class="audit-section"><div class="audit-item" style="color:#86efac;">Graph is fully connected with no issues.</div></div>`;
  }

  // X.3.6: Cross-ontology dependency counts (only in multi mode)
  if (state.viewMode === 'multi' && state.crossEdges?.length > 0) {
    html += `<div class="audit-section"><h4>Cross-Ontology Dependencies</h4>`;

    // Count cross-refs per ontology (outbound)
    const ontologyCounts = new Map();
    for (const edge of state.crossEdges) {
      const fromNs = edge.sourceNamespace;
      if (fromNs) {
        ontologyCounts.set(fromNs, (ontologyCounts.get(fromNs) || 0) + 1);
      }
    }

    // Sort by count descending
    const sorted = [...ontologyCounts.entries()].sort((a, b) => b[1] - a[1]);

    for (const [ns, count] of sorted) {
      const record = state.loadedOntologies?.get(ns);
      const name = record?.name?.replace(/\s+Ontology.*$/i, '') || ns;
      html += `<div class="audit-item">${name}: <strong>${count}</strong> outbound cross-refs</div>`;
    }

    html += `<div class="audit-item" style="color:#eab839; margin-top:8px;">Total: ${state.crossEdges.length} cross-ontology edges</div>`;
    if (state.bridgeNodes?.size > 0) {
      html += `<div class="audit-item" style="color:#eab839;">Bridge nodes: ${state.bridgeNodes.size} (3+ ontology refs)</div>`;
    }
    html += `</div>`;
  }

  el.innerHTML = html;
}

export function showNodeDetails(node) {
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.add('open');
  state.currentNodeId = node.id;

  document.getElementById('sidebar-title').textContent = node.label || node.id;

  let detailsHtml = '';
  detailsHtml += field('ID', node.id);
  detailsHtml += field('Label', node.label);
  detailsHtml += field('Type', node.entityType);
  if (node.description) detailsHtml += field('Description', node.description);

  // F40.22 S40.22.4: Ghost node scope status banner
  const filteredView = getActiveFilteredView();
  if (filteredView) {
    const renderMode = getNodeRenderMode(node, filteredView);
    if (renderMode === 'ghost') {
      const instanceLabel = state.activeInstanceId || 'active composition';
      const ontologyName = node.sourceName || node.sourceNamespace || 'unknown ontology';
      detailsHtml += `<div class="scope-status-banner ghost">` +
        `<strong>Context Ghost</strong>` +
        `<p>This entity is from ${escapeHtml(ontologyName)} which is outside the ${escapeHtml(instanceLabel)} declared scope. ` +
        `It appears as context because its series is active in the current composition.</p></div>`;
    }
  }

  // Multi-ontology provenance (Phase 1) + drill actions (Phase 2)
  if (state.viewMode === 'multi' && node.sourceNamespace) {
    const seriesColor = SERIES_COLORS[node.series] || SERIES_COLORS.placeholder;
    detailsHtml += field('Source Ontology', node.sourceName || node.sourceNamespace);
    detailsHtml += field('Series',
      `<span class="provenance-badge series" style="color:${seriesColor}; border-color:${seriesColor}">${node.series || 'Unknown'}</span>`);
    if (node.isPlaceholder) {
      detailsHtml += field('Status', '<span class="provenance-badge placeholder">Placeholder</span>');
    }
    if (node.originalId) {
      detailsHtml += field('Original ID', node.originalId);
    }
  }

  // Tier-aware drill actions (Phase 2)
  if (state.viewMode === 'multi' && state.currentTier === 0 && node.entityType === 'series') {
    detailsHtml += `<div style="margin-top:12px;">
      <button class="oaa-btn" onclick="drillToSeries('${node.id}')">View Ontologies in this Series</button>
    </div>`;
    if (node.ontologies && node.ontologies.length > 0) {
      detailsHtml += field('Ontologies', node.ontologies.join(', '));
    }
  } else if (state.viewMode === 'multi' && state.currentTier === 1 && node.entityType === 'ontology') {
    if (!node.isPlaceholder) {
      detailsHtml += `<div style="margin-top:12px;">
        <button class="oaa-btn" onclick="drillToOntology('${node.id}')">View Entity Graph</button>
      </div>`;
    } else {
      detailsHtml += `<div style="margin-top:12px;">
        <button class="oaa-btn oaa-btn-secondary" onclick="showPlaceholderDetails('${node.id}')">View Placeholder Details</button>
      </div>`;
    }
    if (node.entityCount) {
      detailsHtml += field('Entities', node.entityCount);
    }
    // Show dependencies as clickable links
    const record = state.loadedOntologies?.get(node.id);
    if (record?.registryEntry?.dependencies?.length > 0) {
      let depHtml = '<div class="dependency-links">';
      record.registryEntry.dependencies.forEach(depId => {
        // Find the namespace for this dependency
        const depNs = findNamespaceForEntry(depId);
        const depRecord = depNs ? state.loadedOntologies.get(depNs) : null;
        const depName = depRecord?.name || depId.replace('Entry-ONT-', '').replace('-001', '');
        const isPlaceholder = depRecord?.isPlaceholder;
        depHtml += `<span class="dep-link ${isPlaceholder ? 'placeholder' : ''}"
          onclick="navigateToOntology('${depNs || depId}')"
          title="${isPlaceholder ? 'Placeholder' : 'Click to navigate'}">${depName}</span>`;
      });
      depHtml += '</div>';
      detailsHtml += field('Dependencies', depHtml);
    }
  } else if (state.viewMode === 'multi' && state.currentTier === 1 && node.entityType === 'series' && node.isContext) {
    detailsHtml += `<div style="margin-top:12px;">
      <button class="oaa-btn" onclick="drillToSeries('${node.id}')">Switch to this Series</button>
    </div>`;
  }

  // Foundation Extensions (Epic 2 — Story #73)
  if (state.currentTier >= 0 && state.crossEdges?.length > 0 && node.sourceNamespace) {
    const nodeRecord = state.loadedOntologies?.get(node.sourceNamespace);
    const isFoundation = nodeRecord?.series === 'Foundation';

    if (isFoundation) {
      const extenders = findReferencingOntologies(node.id);
      if (extenders.length > 0) {
        let extHtml = '<div class="foundation-extensions"><div class="dependency-links">';
        extenders.forEach(ext => {
          const cssClass = ext.isPlaceholder ? 'placeholder' : '';
          extHtml += `<span class="dep-link ${cssClass}"
            onclick="navigateToOntology('${ext.namespace}')"
            title="${ext.series} — ${ext.refCount} reference(s)">${ext.name}</span>`;
        });
        extHtml += '</div></div>';
        detailsHtml += field('Extended By', extHtml);
      }
    } else {
      const foundations = findFoundationReferences(node.id, node.sourceNamespace);
      if (foundations.length > 0) {
        let foundHtml = '<div class="foundation-extensions"><div class="dependency-links">';
        foundations.forEach(found => {
          foundHtml += `<span class="dep-link"
            onclick="navigateToNode('${found.entityId.replace(/'/g, "\\'")}')"
            title="Foundation entity in ${found.ontologyName}">${found.entityLabel}</span>`;
        });
        foundHtml += '</div></div>';
        detailsHtml += field('Extends Foundation', foundHtml);
      }
    }
  }

  // S7.6.2: Cross-ontology bridge connections for this node
  if (state.crossEdges?.length > 0) {
    const nodeBridges = state.crossEdges.filter(e =>
      (e.from === node.id || e.to === node.id) && e.isCrossOntology
    );
    if (nodeBridges.length > 0) {
      let bridgeHtml = '<div class="conn-section"><h4>Bridge Connections</h4>';
      for (const b of nodeBridges) {
        const isOutgoing = b.from === node.id;
        const otherNodeId = isOutgoing ? b.to : b.from;
        const otherLabel = otherNodeId.split('::')[1] || otherNodeId;
        const otherNs = otherNodeId.split('::')[0] || '';
        const style = b.bridgeName ? DS_BRIDGE_STYLES[b.bridgeName] : null;
        const color = style ? style.color : '#eab839';
        const patternLabel = style ? style.label : (b.bridgeName || b.label);
        const arrow = isOutgoing ? '\u2192' : '\u2190';
        const dirLabel = isOutgoing ? 'to' : 'from';
        bridgeHtml += `<div class="connection-item" onclick="navigateToNode('${otherNodeId.replace(/'/g, "\\'")}')">
          <span class="bridge-type-dot" style="background:${color};width:6px;height:6px;border-radius:50%;display:inline-block;margin-right:4px;"></span>
          <span class="connection-arrow">${arrow}</span>
          <span class="connection-label" style="color:${color};">${escapeHtml(patternLabel)}</span>
          <span class="connection-node">${dirLabel} ${escapeHtml(otherLabel)} (${escapeHtml(otherNs)})</span>
        </div>`;
      }
      bridgeHtml += '</div>';
      detailsHtml += bridgeHtml;
    }
  }

  // F40.26: Also Referenced By — cross-ontology same-name entities
  const crossRefs = getEntityCrossReferences(node);
  if (crossRefs.length > 0) {
    const isBridge = crossRefs.length >= 3;
    const badge = isBridge
      ? ' <span class="provenance-badge" style="color:#eab839;border-color:#eab839;font-size:10px;">bridge</span>'
      : '';
    let xrefHtml = `<div class="conn-section"><h4>Also Referenced By${badge}</h4>`;
    xrefHtml += `<div class="xref-list">`;
    for (const ref of crossRefs) {
      const seriesColor = SERIES_COLORS[ref.series] || SERIES_COLORS.placeholder || '#888';
      xrefHtml += `<div class="connection-item" onclick="window._xrefNavigate('${ref.namespace.replace(/'/g, "\\'")}','${ref.prefixedId.replace(/'/g, "\\'")}')" title="Navigate to ${ref.qualifiedId} in ${ref.name}">
        <span class="bridge-type-dot" style="background:${seriesColor};width:6px;height:6px;border-radius:50%;display:inline-block;margin-right:4px;"></span>
        <span class="connection-label">${escapeHtml(ref.name)}</span>
        <span class="connection-node">${escapeHtml(ref.qualifiedId)}</span>
        <span class="xref-go" style="margin-left:auto;color:var(--viz-accent,#9dfff5);font-size:11px;">Go \u2192</span>
      </div>`;
    }
    xrefHtml += `</div><div style="margin-top:4px;font-size:11px;color:var(--viz-text-muted,#666);">${crossRefs.length} ontolog${crossRefs.length === 1 ? 'y' : 'ies'} reference${crossRefs.length === 1 ? 's' : ''} this entity</div></div>`;
    detailsHtml += xrefHtml;
  }

  // Product/ICP Context (Epic 19 — Feature 19.5)
  if (state.productBindings || state.icpBindings) {
    const productEntries = state.productBindings?.get(node.id);
    const icpEntries = state.icpBindings?.get(node.id);

    if (productEntries?.length > 0 || icpEntries?.length > 0) {
      let ctxHtml = '<div class="conn-section"><h4>Product Context</h4>';

      if (productEntries) {
        for (const pb of productEntries) {
          const badge = pb.bindingType === 'inferred'
            ? `<span class="provenance-badge placeholder" title="Confidence: ${(pb.confidence * 100).toFixed(0)}%">inferred</span>`
            : `<span class="provenance-badge series" style="color:#4caf50;border-color:#4caf50">explicit</span>`;
          ctxHtml += `<div class="connection-item">
            <span class="connection-label">Product</span>
            <span class="connection-node">${escapeHtml(pb.productCode)} ${badge}</span>
          </div>`;
        }
      }

      if (icpEntries) {
        for (const ib of icpEntries) {
          const seniority = ib.seniorityLevel != null ? ` (L${ib.seniorityLevel})` : '';
          const scope = ib.functionScope ? ` — ${ib.functionScope}` : '';
          ctxHtml += `<div class="connection-item">
            <span class="connection-label">ICP Scope</span>
            <span class="connection-node">${escapeHtml(ib.icpLabel)}${seniority}${scope}</span>
          </div>`;
        }
      }

      ctxHtml += '</div>';
      detailsHtml += ctxHtml;
    }
  }

  if (node.properties && typeof node.properties === 'object') {
    for (const [k, v] of Object.entries(node.properties)) {
      if (['id', 'name', 'label', 'description', 'entityType', 'type', '@id', '@type', 'properties'].includes(k)) continue;
      const val = typeof v === 'object' ? JSON.stringify(v, null, 2) : v;
      detailsHtml += field(k, val);
    }
  }

  // DS DesignComponent token bindings (S7.6.4)
  if (node._dsType === 'DesignComponent' || node.id?.includes(':comp-')) {
    detailsHtml += renderDSComponentBindings(node.id);
  }

  document.getElementById('tab-details').innerHTML = detailsHtml;

  renderConnectionsTab(node.id);
  renderSchemaTab(node);
  renderDataTab(node.id);

  switchTab('details');
}

export function renderConnectionsTab(nodeId) {
  if (!state.lastParsed) return;

  const incoming = state.lastParsed.edges.filter(e => e.to === nodeId);
  const outgoing = state.lastParsed.edges.filter(e => e.from === nodeId);

  let html = '';

  html += `<div class="conn-section"><h4>Outgoing (${outgoing.length})</h4>`;
  if (outgoing.length === 0) {
    html += '<p class="no-data">No outgoing connections</p>';
  } else {
    outgoing.forEach(e => {
      const targetNode = state.lastParsed.nodes.find(n => n.id === e.to);
      const targetLabel = targetNode ? targetNode.label : e.to;
      html += `<div class="connection-item" onclick="navigateToNode('${e.to.replace(/'/g, "\\'")}')">
        <span class="connection-arrow">\u2192</span>
        <span class="connection-label">${e.label || 'relates to'}</span>
        <span class="connection-node">${targetLabel}</span>
      </div>`;
    });
  }
  html += '</div>';

  html += `<div class="conn-section"><h4>Incoming (${incoming.length})</h4>`;
  if (incoming.length === 0) {
    html += '<p class="no-data">No incoming connections</p>';
  } else {
    incoming.forEach(e => {
      const sourceNode = state.lastParsed.nodes.find(n => n.id === e.from);
      const sourceLabel = sourceNode ? sourceNode.label : e.from;
      html += `<div class="connection-item" onclick="navigateToNode('${e.from.replace(/'/g, "\\'")}')">
        <span class="connection-arrow">\u2190</span>
        <span class="connection-label">${e.label || 'relates to'}</span>
        <span class="connection-node">${sourceLabel}</span>
      </div>`;
    });
  }
  html += '</div>';

  const total = incoming.length + outgoing.length;
  html += `<div class="conn-section"><h4>Summary</h4>`;
  html += `<div style="font-size:12px; color:#ccc;">Total connections: ${total}</div>`;
  if (total === 0) {
    html += `<div style="font-size:12px; color:#FF9800; margin-top:4px;">This node is isolated (no edges)</div>`;
  }
  html += '</div>';

  document.getElementById('tab-connections').innerHTML = html;
}

export function renderSchemaTab(node) {
  let html = '';
  const props = node.properties || {};

  const subClassOf = props['rdfs:subClassOf'] || props.subClassOf;
  if (subClassOf) {
    const parentId = typeof subClassOf === 'object' ? (subClassOf['@id'] || subClassOf.id) : subClassOf;
    if (parentId) {
      html += '<div class="conn-section"><h4>Inherits From</h4>';
      html += `<div class="connection-item" onclick="navigateToNode('${parentId.replace(/'/g, "\\'")}')">
        <span class="connection-arrow">\u2191</span>
        <span class="connection-node">${parentId.replace(/.*[:#]/, '')}</span>
      </div>`;
      html += '</div>';
    }
  }

  if (props.schemaOrgBase) {
    html += '<div class="conn-section"><h4>Schema.org Base</h4>';
    html += `<div style="font-size:12px; color:#9dfff5;">${props.schemaOrgBase}</div>`;
    html += '</div>';
  }

  const schemaProps = props['oaa:properties'] || props.properties || props.attributes || [];

  if (Array.isArray(schemaProps) && schemaProps.length > 0) {
    html += '<div class="conn-section"><h4>Data Properties</h4>';
    schemaProps.forEach(p => {
      const name = p.name || p['@id'] || p.id || 'unknown';
      const type = p.type || p.dataType || p['@type'] || p.range || 'any';
      const required = p.required || p.minCount > 0;
      const desc = p.description || '';
      const schemaOrg = p.schemaOrgMapping || '';
      html += `<div class="prop-row" title="${desc}${schemaOrg ? ' (' + schemaOrg + ')' : ''}">
        <span class="prop-name">${name}${required ? '<span class="prop-required">*</span>' : ''}</span>
        <span class="prop-type">${type}${p.enumValues ? ' [' + p.enumValues.slice(0,3).join('|') + (p.enumValues.length > 3 ? '...' : '') + ']' : ''}</span>
      </div>`;
    });
    html += '</div>';
  }

  if (state.lastParsed) {
    const nodeId = node.id;
    const asSource = state.lastParsed.edges.filter(e => e.from === nodeId);
    const asTarget = state.lastParsed.edges.filter(e => e.to === nodeId);

    if (asSource.length > 0 || asTarget.length > 0) {
      html += '<div class="conn-section"><h4>Relationship Participation</h4>';

      const relTypes = new Map();
      asSource.forEach(e => {
        const key = `\u2192 ${e.label || 'relates to'}`;
        if (!relTypes.has(key)) relTypes.set(key, []);
        relTypes.get(key).push(e.to);
      });
      asTarget.forEach(e => {
        const key = `\u2190 ${e.label || 'relates to'}`;
        if (!relTypes.has(key)) relTypes.set(key, []);
        relTypes.get(key).push(e.from);
      });

      relTypes.forEach((targets, rel) => {
        const targetLabels = targets.map(t => {
          const n = state.lastParsed.nodes.find(x => x.id === t);
          return n ? n.label : t.replace(/.*[:#]/, '');
        }).slice(0, 3);
        html += `<div style="font-size:11px; color:#888; margin:4px 0;">
          <span style="color:#9dfff5;">${rel}</span> ${targetLabels.join(', ')}${targets.length > 3 ? '...' : ''}
        </div>`;
      });
      html += '</div>';
    }
  }

  const inlineProps = [];
  const skipKeys = ['id', 'name', 'label', 'description', 'entityType', 'type', '@id', '@type',
                    'properties', 'attributes', 'schemaOrgBase', 'oaa:properties', 'oaa:description',
                    'rdfs:label', 'rdfs:comment', 'rdfs:subClassOf', 'subClassOf'];
  for (const [k, v] of Object.entries(props)) {
    if (skipKeys.includes(k)) continue;
    if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
      inlineProps.push({ name: k, type: typeof v, value: v });
    }
  }

  if (inlineProps.length > 0) {
    html += '<div class="conn-section"><h4>Metadata</h4>';
    inlineProps.forEach(p => {
      html += `<div class="prop-row">
        <span class="prop-name">${p.name}</span>
        <span class="prop-type">${p.type}</span>
      </div>`;
    });
    html += '</div>';
  }

  if (!html) {
    html = '<p class="no-data">No schema information available for this entity</p>';
  }

  document.getElementById('tab-schema').innerHTML = html;
}

export function renderDataTab(nodeId) {
  let html = '';
  let testData = findTestData(nodeId);
  let isDSData = false;

  // Fallback: check DS instance data for DS-ONT entity types
  if (testData.length === 0) {
    testData = findDSInstanceData(nodeId);
    isDSData = testData.length > 0;
  }

  if (testData.length === 0) {
    html = '<p class="no-data">No data instances found for this entity.<br><br>Load an ontology with testData or instances to see sample values.</p>';
  } else {
    if (isDSData) {
      const brand = testData[0]?._dsBrand || 'unknown';
      const total = testData[0]?._dsTotal || testData.length;
      const truncated = total > testData.length;
      html += `<div style="font-size:11px; margin-bottom:12px;">
        <span style="color:var(--viz-accent, #9dfff5); font-weight:600;">DS Instance: ${escapeHtml(brand)}</span>
        <span style="color:var(--viz-text-secondary, #888);"> — ${total} record(s)${truncated ? ` (showing ${testData.length})` : ''}</span>
      </div>`;
    } else {
      html += `<div style="font-size:11px; color:var(--viz-text-secondary, #888); margin-bottom:12px;">${testData.length} instance(s) found</div>`;
    }
    testData.forEach((instance, idx) => {
      const instanceType = instance._dataType || 'typical';
      html += `<div class="data-instance">
        <div class="data-instance-header">
          <span class="data-instance-id">${instance.id || instance['@id'] || instance.name || 'Instance ' + (idx + 1)}</span>
          <span class="data-instance-type ${instanceType}">${instanceType}</span>
        </div>`;

      for (const [k, v] of Object.entries(instance)) {
        if (k === '_dataType' || k === '_entityType' || k === '_dsBrand' || k === '_dsTotal') continue;
        const displayVal = typeof v === 'object' ? JSON.stringify(v) : String(v);
        const isHexColor = typeof v === 'string' && /^#[0-9a-fA-F]{3,8}$/.test(v);
        const swatch = isHexColor
          ? `<span style="display:inline-block;width:12px;height:12px;background:${v};border-radius:2px;margin-right:4px;vertical-align:middle;border:1px solid rgba(255,255,255,0.2);"></span>`
          : '';
        html += `<div class="data-row">
          <span class="data-key">${k}</span>
          <span class="data-value">${swatch}${escapeHtml(displayVal)}</span>
        </div>`;
      }
      html += '</div>';
    });
  }

  document.getElementById('tab-data').innerHTML = html;
}

export function findTestData(entityId) {
  if (!state.currentData) return [];

  const results = [];

  const testDataSources = [
    state.currentData.testData,
    state.currentData.testInstances,
    state.currentData.instances,
    state.currentData.sampleData,
    state.currentData.data,
    state.currentData.ontologyDefinition?.testData,
    state.currentData.registryEntry?.testData
  ];

  for (const source of testDataSources) {
    if (!source) continue;

    if (typeof source === 'object' && !Array.isArray(source)) {
      for (const [key, instances] of Object.entries(source)) {
        if (key === entityId || key.toLowerCase() === entityId.toLowerCase() ||
            entityId.includes(key) || key.includes(entityId)) {
          if (Array.isArray(instances)) {
            instances.forEach(inst => {
              results.push({ ...inst, _entityType: key, _dataType: inst.testCategory || inst.dataType || 'typical' });
            });
          } else if (typeof instances === 'object') {
            results.push({ ...instances, _entityType: key, _dataType: instances.testCategory || 'typical' });
          }
        }
      }
    }

    if (Array.isArray(source)) {
      source.forEach(inst => {
        const instType = inst.entityType || inst['@type'] || inst.type || '';
        if (instType === entityId || instType.includes(entityId) || entityId.includes(instType)) {
          results.push({ ...inst, _dataType: inst.testCategory || inst.dataType || 'typical' });
        }
      });
    }
  }

  const distributions = ['typical', 'edge', 'boundary', 'invalid'];
  for (const dist of distributions) {
    const distData = state.currentData[dist] || state.currentData.testData?.[dist];
    if (distData && typeof distData === 'object') {
      for (const [key, instances] of Object.entries(distData)) {
        if (key === entityId || key.toLowerCase() === entityId.toLowerCase()) {
          if (Array.isArray(instances)) {
            instances.forEach(inst => results.push({ ...inst, _entityType: key, _dataType: dist }));
          }
        }
      }
    }
  }

  return results.slice(0, 10);
}

// DS-ONT entity ID → parsedDSInstance property mapping
const DS_ENTITY_INSTANCE_MAP = {
  'ds:DesignSystem': 'designSystem',
  'ds:TokenCategory': 'categories',
  'ds:PrimitiveToken': 'primitives',
  'ds:SemanticToken': 'semantics',
  'ds:ComponentToken': 'components',
  'ds:BrandVariant': 'variants',
  'ds:FigmaSource': 'figmaSources',
  'ds:ThemeMode': 'modes',
  'ds:DesignPattern': 'patterns'
};

/**
 * Find DS instance data for a DS-ONT entity type.
 * Falls back to state.dsInstances when standard testData sources are empty.
 *
 * @param {string} entityId - The entity node ID (e.g., "ds:PrimitiveToken" or "PrimitiveToken")
 * @returns {Array} formatted instance records compatible with renderDataTab
 */
function findDSInstanceData(entityId) {
  if (!state.dsInstances || state.dsInstances.size === 0) return [];

  const brand = state.activeDSBrand || state.dsInstances.keys().next().value;
  const parsed = state.dsInstances.get(brand);
  if (!parsed) return [];

  // Try direct match (e.g., "ds:PrimitiveToken"), then strip prefix
  let instanceKey = DS_ENTITY_INSTANCE_MAP[entityId];
  if (!instanceKey) {
    const stripped = entityId.replace(/^[a-z-]+:/i, '');
    for (const [mapId, mapKey] of Object.entries(DS_ENTITY_INSTANCE_MAP)) {
      if (mapId.endsWith(':' + stripped)) {
        instanceKey = mapKey;
        break;
      }
    }
  }

  if (!instanceKey) return [];

  const data = parsed[instanceKey];
  if (!data) return [];

  // Wrap single objects (DesignSystem) in an array
  const items = Array.isArray(data) ? data : [data];
  if (items.length === 0) return [];

  const MAX_DS_ITEMS = 25;
  const total = items.length;

  return items.slice(0, MAX_DS_ITEMS).map(item => ({
    ...item,
    _dataType: 'ds-instance',
    _dsBrand: brand,
    _dsTotal: total
  }));
}

export function navigateToNode(nodeId) {
  if (!state.network || !state.lastParsed) return;

  const node = state.lastParsed.nodes.find(n => n.id === nodeId);
  if (!node) return;

  state.network.selectNodes([nodeId]);
  state.network.focus(nodeId, { scale: 1.5, animation: true });

  showNodeDetails(node);
}

export function switchTab(tabName) {
  document.querySelectorAll('.sidebar-tab').forEach(btn => {
    btn.classList.toggle('active', btn.textContent.toLowerCase() === tabName);
  });

  ['details', 'connections', 'schema', 'data', 'bindings', 'kano'].forEach(name => {
    const el = document.getElementById('tab-' + name);
    if (el) el.style.display = name === tabName ? 'block' : 'none';
  });
}

export function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

export function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
}

/**
 * Show scope rule evaluation log in the sidebar.
 * Epic 19, F19.4 — S19.4.6 (breadcrumb click handler).
 */
export function showScopeRuleLog() {
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.add('open');
  document.getElementById('sidebar-title').textContent = 'Scope Rule Log';

  const log = state.scopeRuleLog || [];
  let html = '';

  if (log.length === 0) {
    html = '<div style="padding:8px;color:#888;">No scope rules evaluated yet.</div>';
  } else {
    html += `<div class="conn-section"><span class="conn-title">${log.length} Rules Evaluated</span></div>`;
    for (const entry of log) {
      const statusColor = entry.result === 'fired' ? '#4caf50' : (entry.result === 'skipped' ? '#888' : '#ff9800');
      const badge = `<span class="provenance-badge" style="background:${statusColor};color:#fff;margin-left:6px;">${entry.result || 'unknown'}</span>`;
      html += `<div class="connection-item" style="margin-bottom:6px;">`;
      html += `<strong>${escapeHtml(entry.ruleName || entry.ruleId || 'Rule')}</strong>${badge}<br>`;
      if (entry.conditionType) html += `<span style="color:#aaa;">Condition:</span> ${escapeHtml(entry.conditionType)} ${escapeHtml(entry.operator || '')} ${escapeHtml(String(entry.threshold || ''))}<br>`;
      if (entry.action) html += `<span style="color:#aaa;">Action:</span> ${escapeHtml(entry.action)}`;
      html += `</div>`;
    }
  }

  // Also show active instance + persona context
  if (state.activeInstanceId) {
    html += `<div class="conn-section" style="margin-top:12px;"><span class="conn-title">Active Context</span></div>`;
    html += field('PFI Instance', state.activeInstanceId);
    if (state.activePersonaScope) html += field('Persona', state.activePersonaScope);
    if (state.composedPFIGraph?.metadata) {
      const meta = state.composedPFIGraph.metadata;
      if (meta.entityCount != null) html += field('Entities', meta.entityCount);
      if (meta.ontologySources) html += field('Ontologies', meta.ontologySources.length);
    }
  }

  document.getElementById('details-content').innerHTML = html;
}

export function toggleAudit() {
  document.getElementById('audit-panel').classList.toggle('open');
}

export function loadTestDataFile() {
  if (!state.currentData) {
    alert('Load an ontology first, then add test data.');
    return;
  }

  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = function(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(ev) {
      try {
        const testData = JSON.parse(ev.target.result);

        if (testData.testData) {
          state.currentData.testData = { ...state.currentData.testData, ...testData.testData };
        } else if (testData.instances || testData.sampleData) {
          state.currentData.testData = testData.instances || testData.sampleData;
        } else if (Array.isArray(testData)) {
          state.currentData.testData = state.currentData.testData || {};
          testData.forEach(inst => {
            const entityType = inst.entityType || inst['@type'] || 'unknown';
            if (!state.currentData.testData[entityType]) state.currentData.testData[entityType] = [];
            state.currentData.testData[entityType].push(inst);
          });
        } else {
          state.currentData.testData = { ...state.currentData.testData, ...testData };
        }

        if (state.currentNodeId) {
          renderDataTab(state.currentNodeId);
        }

        alert('Test data loaded successfully! Click on entities to see their data in the Data tab.');
      } catch (err) {
        alert('Failed to parse test data: ' + err.message);
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

// OAA Upgrade functions
export function extractOntologyDomain(data) {
  if (!data) return null;
  return data['oaa:domain'] ||
         data.domain ||
         (data['rdfs:label'] && data['rdfs:label'].split(' ')[0]) ||
         (data.name && data.name.split(' ')[0]) ||
         null;
}

export function runOAAUpgrade() {
  if (!state.currentData) {
    alert('Load an ontology first');
    return;
  }

  const validation = validateOAAv5(state.currentData, state.lastParsed);
  const fileName = document.getElementById('file-name').textContent || 'ontology';
  const baseName = fileName.replace(/\.json$/i, '');
  const outputName = `${baseName}-oaa-v6-upgraded.json`;
  const prompt = buildOAAPrompt(state.currentData, validation);
  showOAAModal(prompt, outputName);
}

export function buildOAAPrompt(ontology, validation) {
  const issues = [];
  const orphanedEntities = [];
  const missingDescriptions = [];

  validation.gates.forEach(g => {
    if (g.status === 'fail') {
      issues.push(`FAIL: ${g.gate} - ${g.detail}`);
      if (g.gate.includes('2B') && g.orphaned) {
        orphanedEntities.push(...g.orphaned);
      }
    }
    if (g.status === 'warn') {
      issues.push(`WARN: ${g.gate} - ${g.detail}`);
      if (g.gate.includes('G4') && g.warnings) {
        g.warnings.forEach(w => {
          if (w.includes('missing description')) {
            const match = w.match(/^([^:]+):/);
            if (match) missingDescriptions.push(match[1]);
          }
        });
      }
    }
  });

  let prompt = `You are the OAA (Ontology Architect Agent) v7.0.0.

Upgrade this ontology to pass ALL OAA v7.0.0 compliance gates (G1-G4, G7, G20-G24).

## OAA v7.0.0 Core Gates (REQUIRED - must pass at 100%)

| Gate | Requirement |
|------|-------------|
| G1 | Schema Structure: Valid JSON-LD with @context, @id, entities, oaa:schemaVersion |
| G2 | Relationship Cardinality: All relationships have domainIncludes/rangeIncludes with cardinality |
| G2B | Entity Connectivity: EVERY entity must participate in \u22651 relationship |
| G2C | Graph Connectivity: All entities form a SINGLE connected component |
| G3 | Business Rules: IF-THEN format with severity levels |
| G4 | Semantic Consistency: All entities have descriptions (\u226520 chars) |
| G7 | Schema Properties: Entities need @id, @type, name, description; relationships need @type, name, domain, range |

## OAA v7.0.0 Quality Gates (REQUIRED for v7 compliance)

| Gate | Requirement |
|------|-------------|
| G20 | Competency Coverage: competencyQuestions[] with >=1 CQ per entity |
| G21 | Semantic Duplication: No duplicate entity names or near-duplicate descriptions |
| G22 | Cross-Ontology Rules: Application rules (AR-*) correctly reference valid entities |
| G23 | Lineage Integrity: Lineage rules (LR-*) reference valid predecessor ontologies |
| G24 | Instance Data Quality: Instance/test data conforms to schema constraints |

## v7 Mandatory Fields (MUST be present)

| Field | Example |
|-------|---------|
| oaa:schemaVersion | "7.0.0" |
| oaa:ontologyId | "VSOM-ONT" |
| oaa:series | "VE-Series" |
| competencyQuestions | [{"@id": "CQ-001", "question": "...", "targetEntities": [...]}] |

## Advisory Gates (Recommended but not required for compliance)

| Gate | Requirement |
|------|-------------|
| G5 | Completeness: Version, metadata, edge-to-node ratio \u22650.8 |
| G6 | UniRegistry Format: If applicable, valid registry structure |
| G8 | Naming Conventions: PascalCase entities, camelCase relationships, consistent prefixes |

## Current Compliance Status
${issues.length > 0 ? issues.filter(i => !i.includes('G5:') && !i.includes('G6:')).join('\n') : 'No critical issues, but validate and enhance.'}`;

  if (orphanedEntities.length > 0) {
    prompt += `

## CRITICAL: Orphaned Entities (G2B FAIL)
These entities have ZERO relationships and MUST be connected:
${orphanedEntities.map(e => `- ${e}`).join('\n')}

For EACH orphaned entity, add at least one relationship where it appears as:
- domainIncludes (source) OR
- rangeIncludes (target)`;
  }

  if (missingDescriptions.length > 0) {
    prompt += `

## Missing Descriptions (G4)
Add descriptions (\u226520 characters) for:
${missingDescriptions.slice(0, 10).map(e => `- ${e}`).join('\n')}${missingDescriptions.length > 10 ? `\n... and ${missingDescriptions.length - 10} more` : ''}`;
  }

  prompt += `

## Current Ontology
\`\`\`json
${JSON.stringify(ontology, null, 2)}
\`\`\`

## Required Output Format
Produce a compliant ontology with:
1. All entities connected via relationships (no orphans)
2. Relationships with proper domainIncludes/rangeIncludes arrays
3. Descriptions for all entities (\u226520 characters each)
4. Cardinality notation on relationships (e.g., "1..*", "0..1")
5. Single connected graph (all entities reachable from any other)

Output ONLY valid JSON. No explanations, no markdown, no code blocks.`;

  return prompt;
}

export function showOAAModal(prompt, outputName) {
  const modal = document.getElementById('oaa-modal');
  const body = document.getElementById('oaa-modal-body');

  const escapedPrompt = prompt.replace(/'/g, "'\\''");

  const domain = extractOntologyDomain(state.currentData);
  const domainFolder = domain ? domain.toUpperCase().replace(/\s+/g, '-') + '-ONT' : 'DOMAIN-ONT';
  const suggestedPath = `PBS/ONTOLOGIES/ontology-library/{Series}/${domainFolder}/${outputName}`;

  const command = `claude -p '${escapedPrompt}' > ${outputName}`;

  body.innerHTML = `
    <p style="color:#888; margin-bottom:16px;">Copy this command and run it in your terminal with Claude Code:</p>

    <div class="oaa-command" id="oaa-command">${escapeHtml(command)}</div>

    <div style="margin-bottom:16px;">
      <button class="oaa-btn" onclick="copyOAACommand()">Copy Command</button>
      <button class="oaa-btn oaa-btn-secondary" onclick="downloadOntologyForOAA()">Download Ontology JSON</button>
    </div>

    <details style="margin-top:16px;" open>
      <summary style="color:#9dfff5; cursor:pointer; font-weight:500;">Recommended file path</summary>
      <div style="background:#0d0f12; border:1px solid #3a3d47; border-radius:6px; padding:12px; margin-top:8px;">
        <code style="color:#9dfff5; font-size:12px; word-break:break-all;">${escapeHtml(suggestedPath)}</code>
        <button class="oaa-btn" style="margin-left:12px; padding:4px 8px; font-size:11px;" onclick="copyPath('${escapeHtml(suggestedPath)}', this)">Copy Path</button>
      </div>
      <p style="color:#666; margin-top:8px; font-size:11px;">
        Standard pattern: <code style="background:#0d0f12; padding:2px 6px; border-radius:3px;">PBS/ONTOLOGIES/ontology-library/{Series}/{DOMAIN}-ONT/{filename}</code>
      </p>
    </details>

    <details style="margin-top:12px;">
      <summary style="color:#888; cursor:pointer;">Alternative: Use file input</summary>
      <p style="color:#666; margin-top:8px; font-size:12px;">
        1. Download the ontology JSON using the button above<br>
        2. Run: <code style="background:#0d0f12; padding:2px 6px; border-radius:3px;">claude -p "Upgrade this ontology to OAA v7.0.0 compliance" &lt; ${outputName.replace('-upgraded', '-for-oaa')}</code>
      </p>
    </details>

    <div style="margin-top:20px; padding-top:16px; border-top:1px solid #3a3d47;">
      <p style="color:#888; font-size:12px;">After running, load the output file back into the Visualiser to verify compliance.</p>
    </div>
  `;

  modal.style.display = 'flex';
}

export function copyPath(path, btn) {
  navigator.clipboard.writeText(path).then(() => {
    const original = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(() => btn.textContent = original, 2000);
  });
}

export function closeOAAModal() {
  document.getElementById('oaa-modal').style.display = 'none';
}

export function copyOAACommand() {
  const command = document.getElementById('oaa-command').textContent;
  navigator.clipboard.writeText(command).then(() => {
    const btn = event.target;
    const original = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(() => btn.textContent = original, 2000);
  });
}

// Save to Library modal UI
export function showSaveToLibrary() {
  if (!state.currentData) {
    alert('Load an ontology first');
    return;
  }

  const modal = document.getElementById('save-library-modal');
  const body = document.getElementById('save-library-body');

  const currentName = document.getElementById('file-name').textContent || 'Untitled Ontology';
  const baseName = currentName.replace(/\.json$/i, '').replace(/ \(v[\d.]+\)$/, '');
  const currentVersion = state.currentData['owl:versionInfo'] || state.currentData.version || '1.0.0';

  let suggestedCategory = 'custom';
  if (baseName.toLowerCase().includes('pfc') || baseName.toLowerCase().includes('platform-foundation')) {
    suggestedCategory = 'ontology-library';
  } else if (baseName.toLowerCase().includes('pfi')) {
    suggestedCategory = 'pfi-ontologies';
  }

  body.innerHTML = `
    <div class="library-form-group">
      <label>Ontology Name</label>
      <input type="text" id="save-ont-name" class="library-input" value="${escapeHtml(baseName)}" placeholder="e.g., ppm-schema">
    </div>

    <div class="library-form-group">
      <label>Category / Folder</label>
      <select id="save-ont-category" class="library-select">
        ${DEFAULT_CATEGORIES.map(cat =>
          `<option value="${cat}" ${cat === suggestedCategory ? 'selected' : ''}>${cat.replace(/-/g, ' ')}</option>`
        ).join('')}
      </select>
    </div>

    <div class="library-form-group">
      <label>Version</label>
      <input type="text" id="save-ont-version" class="library-input" value="${escapeHtml(currentVersion)}" placeholder="e.g., 1.0.0">
    </div>

    <div class="library-form-group">
      <label>Notes (optional)</label>
      <input type="text" id="save-ont-notes" class="library-input" placeholder="e.g., Upgraded to OAA v7.0.0 compliance">
    </div>

    <div id="save-result"></div>

    <div style="margin-top:16px; display:flex; gap:8px;">
      <button class="oaa-btn" onclick="doSaveToLibrary()">Save to Library</button>
      <button class="oaa-btn oaa-btn-secondary" onclick="closeSaveLibraryModal()">Cancel</button>
    </div>

    <p style="color:#666; font-size:11px; margin-top:12px;">
      Saving creates a versioned entry in your local browser storage with full audit trail.
      Export the library for backup or sharing across devices.
    </p>
  `;

  modal.style.display = 'flex';
}

// ========================================
// OAA GATE FUNCTIONS (Epic 1)
// ========================================

export function updateDensityThreshold(value) {
  const v = parseFloat(value);
  if (isNaN(v) || v <= 0) return;
  state.densityThreshold = v;
  localStorage.setItem('oaa-viz-density-threshold', v.toString());
  // Re-render audit panel with new threshold
  if (state.lastAudit) {
    renderAuditPanel(state.lastAudit);
  }
}

export function buildGateReportMarkdown() {
  const audit = state.lastAudit;
  if (!audit) return '';

  const density = audit.totalNodes > 0 ? (audit.totalEdges / audit.totalNodes).toFixed(2) : '0.00';
  const threshold = state.densityThreshold;
  const gate2bPass = audit.isolated.length === 0;
  const gate2cPass = audit.components.length <= 1;
  const densityPass = parseFloat(density) >= threshold;

  const fileName = document.getElementById('file-name')?.textContent || 'Ontology';
  const date = new Date().toISOString().split('T')[0];

  let md = `## OAA Gate Validation Report\n\n`;
  md += `**Ontology:** ${fileName}  \n`;
  md += `**Date:** ${date}  \n`;
  md += `**Nodes:** ${audit.totalNodes} | **Edges:** ${audit.totalEdges}  \n\n`;

  md += `| Gate | Status | Detail |\n`;
  md += `|------|--------|--------|\n`;
  md += `| GATE 2B: Entity Connectivity | ${gate2bPass ? '✅ PASS' : '❌ FAIL'} | ${gate2bPass ? 'All entities connected' : `${audit.isolated.length} isolated node(s)`} |\n`;
  md += `| GATE 2C: Graph Connectivity | ${gate2cPass ? '✅ PASS' : '⚠️ WARNING'} | ${gate2cPass ? 'Single connected component' : `${audit.components.length} components`} |\n`;
  md += `| Density (edge:node) | ${densityPass ? '✅ PASS' : '⚠️ LOW'} | ${density} (threshold: ${threshold}) |\n`;
  md += `\n`;

  if (!gate2bPass) {
    md += `### Isolated Nodes (GATE 2B)\n\n`;
    audit.isolated.forEach(n => {
      md += `- ${n.label} (\`${n.entityType}\`)\n`;
    });
    md += `\n`;
  }

  if (!gate2cPass) {
    md += `### Disconnected Components (GATE 2C)\n\n`;
    md += `- Main component: ${audit.mainComponentSize} nodes\n`;
    audit.components.slice(1).forEach((comp, i) => {
      md += `- Cluster ${i + 1}: ${comp.length} nodes — ${comp.slice(0, 3).join(', ')}${comp.length > 3 ? '...' : ''}\n`;
    });
    md += `\n`;
  }

  // Completeness score
  if (state.lastCompletenessScore) {
    const score = state.lastCompletenessScore;
    md += `### Completeness Score: ${score.totalScore}% (${score.totalLabel})\n\n`;
    md += `| Category | Weight | Score |\n`;
    md += `|----------|--------|-------|\n`;
    score.categories.forEach(cat => {
      md += `| ${cat.name} | ${Math.round(cat.weight * 100)}% | ${cat.score}% |\n`;
    });
    md += `\n`;
  }

  // Full gate results from validation
  if (state.lastValidation) {
    md += `### All Gates\n\n`;
    md += `| Gate | Status | Detail |\n`;
    md += `|------|--------|--------|\n`;
    state.lastValidation.gates.forEach(g => {
      if (g.skipped) return;
      const icon = g.status === 'pass' ? '✅' : g.status === 'warn' ? '⚠️' : '❌';
      const advisory = g.advisory ? ' (advisory)' : '';
      md += `| ${g.gate}${advisory} | ${icon} ${g.status.toUpperCase()} | ${g.detail} |\n`;
    });
    md += `\n`;
  }

  return md;
}

export function exportGateReport() {
  const md = buildGateReportMarkdown();
  if (!md) return;

  const fileName = document.getElementById('file-name')?.textContent || 'ontology';
  const baseName = fileName.replace(/\.json$/i, '').replace(/\s+/g, '-').toLowerCase();

  const blob = new Blob([md], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${baseName}-validation-report.md`;
  a.click();
  URL.revokeObjectURL(url);
}

export function copyGateResults() {
  const text = buildGateReportMarkdown();
  if (!text) {
    alert('Load an ontology first to generate audit report');
    return;
  }

  navigator.clipboard.writeText(text).then(() => {
    // Find the Copy button in the gates summary actions
    const btns = document.querySelectorAll('.gates-summary-actions button');
    const btn = Array.from(btns).find(b => b.textContent.includes('Copy'));
    if (btn) {
      const original = btn.textContent;
      btn.textContent = 'Copied!';
      setTimeout(() => btn.textContent = original, 2000);
    }
  });
}

// Multi-ontology comparison table (Epic 3)
export function renderComparisonTable(scores) {
  const container = document.getElementById('audit-content');
  if (!container || !scores || scores.length === 0) return;

  const statusIcon = s => s === 'pass' ? '✅' : s === 'warn' ? '⚠️' : s === 'fail' ? '❌' : '—';

  let html = '<div style="margin-top:16px; border-top:1px solid #333; padding-top:12px;">';
  html += '<div style="font-size:11px; color:#888; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:8px;">Multi-Ontology Comparison</div>';
  html += '<div style="overflow-x:auto; max-height:400px; overflow-y:auto;">';
  html += '<table style="width:100%; border-collapse:collapse; font-size:11px;">';
  html += '<thead><tr style="border-bottom:1px solid #444; color:#888;">';
  html += '<th style="text-align:left; padding:4px 6px;">Ontology</th>';
  html += '<th style="text-align:left; padding:4px 6px;">Series</th>';
  html += '<th style="text-align:left; padding:4px 6px;">Ver</th>';
  html += '<th style="text-align:center; padding:4px 6px;">Score</th>';
  html += '<th style="text-align:center; padding:4px 6px;">G7</th>';
  html += '<th style="text-align:center; padding:4px 6px;">G8</th>';
  html += '<th style="text-align:center; padding:4px 6px;">Status</th>';
  html += '</tr></thead><tbody>';

  scores.forEach(s => {
    const scoreColor = s.score >= 80 ? '#86efac' : s.score >= 60 ? '#ffb48e' : '#fca5a5';
    const seriesColor = SERIES_COLORS[s.series] || '#888';
    html += `<tr style="border-bottom:1px solid #2a2d37; cursor:pointer;" onclick="window.drillToOntology && window.drillToOntology('${s.namespace}')">`;
    html += `<td style="padding:4px 6px; color:#e0e0e0;">${s.name.replace(/\s+Ontology.*$/i, '')}</td>`;
    html += `<td style="padding:4px 6px;"><span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:${seriesColor}; margin-right:4px;"></span>${s.series.replace('-Series', '')}</td>`;
    html += `<td style="padding:4px 6px; color:#888;">${s.version}</td>`;
    html += `<td style="text-align:center; padding:4px 6px; color:${scoreColor}; font-weight:600;">${s.score}%</td>`;
    html += `<td style="text-align:center; padding:4px 6px;">${statusIcon(s.g7)}</td>`;
    html += `<td style="text-align:center; padding:4px 6px;">${statusIcon(s.g8)}</td>`;
    html += `<td style="text-align:center; padding:4px 6px;">${statusIcon(s.overall)}</td>`;
    html += `</tr>`;
  });

  html += '</tbody></table></div></div>';

  // Append to existing audit content
  container.innerHTML += html;
}

// Component colouring toggle (Story #61) and filter (Story #62)
export function toggleComponentColoring() {
  state.componentColoringActive = !state.componentColoringActive;
  // Trigger re-render via window.rerenderSingleGraph (set by app.js)
  if (window.rerenderSingleGraph) window.rerenderSingleGraph();
}

export function filterComponent(value) {
  state.componentFilter = value === 'all' ? null : parseInt(value, 10);
  if (window.rerenderSingleGraph) window.rerenderSingleGraph();
}

// Diff view rendering (Epic 4)
export function renderDiffView(diff) {
  const container = document.getElementById('diff-results');
  if (!container) return;

  const s = diff.summary;
  let html = '<div style="margin-top:8px;">';

  // Summary badges
  html += '<div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:12px;">';
  if (s.entitiesAdded > 0) html += `<span style="background:rgba(76,175,80,0.2); color:#86efac; padding:3px 10px; border-radius:4px; font-size:12px; font-weight:600;">+${s.entitiesAdded} added</span>`;
  if (s.entitiesRemoved > 0) html += `<span style="background:rgba(244,67,54,0.2); color:#fca5a5; padding:3px 10px; border-radius:4px; font-size:12px; font-weight:600;">-${s.entitiesRemoved} removed</span>`;
  if (s.entitiesModified > 0) html += `<span style="background:rgba(255,152,0,0.2); color:#ffb48e; padding:3px 10px; border-radius:4px; font-size:12px; font-weight:600;">~${s.entitiesModified} modified</span>`;
  if (s.entitiesUnchanged > 0) html += `<span style="color:#888; font-size:12px; padding:3px 10px;">${s.entitiesUnchanged} unchanged</span>`;
  html += '</div>';

  // Relationship summary
  if (s.relsAdded + s.relsRemoved + s.relsModified > 0) {
    html += '<div style="font-size:11px; color:#888; margin-bottom:8px;">Relationships: ';
    const parts = [];
    if (s.relsAdded > 0) parts.push(`+${s.relsAdded} added`);
    if (s.relsRemoved > 0) parts.push(`-${s.relsRemoved} removed`);
    if (s.relsModified > 0) parts.push(`~${s.relsModified} modified`);
    html += parts.join(', ') + '</div>';
  }

  // Metadata changes
  if (diff.metadata.length > 0) {
    html += '<div style="font-size:11px; color:#888; margin-bottom:4px; text-transform:uppercase;">Metadata</div>';
    diff.metadata.forEach(c => {
      html += `<div style="font-size:12px; color:#ccc; margin-bottom:2px;"><strong>${escapeHtml(c.property)}:</strong> <span style="color:#fca5a5;">${escapeHtml(String(c.oldValue ?? ''))}</span> → <span style="color:#86efac;">${escapeHtml(String(c.newValue ?? ''))}</span></div>`;
    });
    html += '<div style="height:8px;"></div>';
  }

  // Added entities
  if (diff.entities.added.length > 0) {
    html += '<div style="font-size:11px; color:#86efac; margin-bottom:4px; text-transform:uppercase;">Added Entities</div>';
    diff.entities.added.forEach(a => {
      html += `<div style="font-size:12px; color:#ccc; margin-bottom:2px; padding-left:8px; border-left:2px solid #4CAF50;">+ ${escapeHtml(a.id)}</div>`;
    });
    html += '<div style="height:8px;"></div>';
  }

  // Removed entities
  if (diff.entities.removed.length > 0) {
    html += '<div style="font-size:11px; color:#fca5a5; margin-bottom:4px; text-transform:uppercase;">Removed Entities</div>';
    diff.entities.removed.forEach(r => {
      html += `<div style="font-size:12px; color:#888; margin-bottom:2px; padding-left:8px; border-left:2px solid #f44336; text-decoration:line-through;">- ${escapeHtml(r.id)}</div>`;
    });
    html += '<div style="height:8px;"></div>';
  }

  // Modified entities
  if (diff.entities.modified.length > 0) {
    html += '<div style="font-size:11px; color:#ffb48e; margin-bottom:4px; text-transform:uppercase;">Modified Entities</div>';
    diff.entities.modified.forEach(m => {
      html += `<div style="font-size:12px; color:#ccc; margin-bottom:4px; padding-left:8px; border-left:2px solid #FF9800;">`;
      html += `<strong>${escapeHtml(m.id)}</strong><br>`;
      m.changes.forEach(c => {
        html += `<span style="font-size:11px; color:#888;">${escapeHtml(c.property)}: changed</span><br>`;
      });
      html += '</div>';
    });
  }

  html += '</div>';
  container.innerHTML = html;
  container.style.display = 'block';

  // Show export changelog button
  const btn = document.getElementById('btn-export-changelog');
  if (btn) btn.style.display = 'inline-block';
}

export function closeSaveLibraryModal() {
  document.getElementById('save-library-modal').style.display = 'none';
}

// ========================================
// AGENTIC ONTOLOGY GENERATION (Epic 7)
// ========================================

/**
 * Returns a concise OAA v7.0.0 schema specification for embedding in AI prompts.
 */
export function getOAASchemaSpec() {
  return `## OAA v7.0.0 Schema Specification

### Required Top-Level Structure
{
  "@context": { "@vocab": "https://schema.org/", "oaa": "https://platformcore.io/ontology/oaa/", "prefix": "https://your-namespace/ontology/", ... },
  "@type": "Ontology",
  "@id": "prefix:ontology:name-vX.Y",
  "oaa:schemaVersion": "7.0.0",
  "oaa:ontologyId": "PREFIX-ONT",
  "oaa:series": "Series-Name",
  "metadata": { name, version, description, domain, purpose, oaaVersion: "7.0.0", dateCreated, creator },
  "entities": [ ... ],              // Array of EntityDefinition objects
  "relationships": [ ... ],         // Array of Property objects
  "businessRules": [ ... ],         // Array of business rule objects
  "competencyQuestions": [ ... ],   // v7 REQUIRED: >=1 CQ per entity
  "examples": [ ... ]               // Optional: sample instances
}

### Entity Format
{
  "@type": "pf:EntityDefinition",
  "@id": "prefix:EntityName",      // PascalCase
  "name": "EntityName",
  "description": "At least 20 characters describing this entity",
  "properties": [
    { "name": "propName", "type": "Text|Number|Boolean|URL|DateTime", "required": true/false, "description": "..." }
  ]
}

### Relationship Format
{
  "@type": "Property",
  "@id": "prefix:relationshipName",
  "name": "Relationship Name",
  "description": "Describes the relationship",
  "domainIncludes": ["prefix:SourceEntity"],
  "rangeIncludes": ["prefix:TargetEntity"],
  "cardinality": "1..1|0..1|1..*|0..*"
}

### Business Rule Format
{
  "ruleId": "BR-XXX-001",
  "name": "Rule Name",
  "condition": "IF some condition exists",
  "action": "THEN some action MUST be taken",
  "severity": "error|warning"
}

### Competency Question Format (v7 REQUIRED)
{
  "@id": "CQ-001",
  "question": "What is the role and purpose of EntityName within this ontology?",
  "targetEntities": ["prefix:EntityName"],
  "targetRelationships": ["relationshipName"],
  "targetRules": ["BR-XXX-001"]
}

### Compliance Gates (all must pass)
| Gate | Requirement |
|------|-------------|
| G1 | Schema Structure: Valid JSON-LD with @context, @id, @type, entities, relationships, oaa:schemaVersion |
| G2 | Relationship Cardinality: All relationships have domainIncludes, rangeIncludes, cardinality |
| G2B | Entity Connectivity: EVERY entity participates in >=1 relationship (no orphans) |
| G2C | Graph Connectivity: All entities form a SINGLE connected component |
| G3 | Business Rules: >=3 rules in IF-THEN format with severity |
| G4 | Semantic Consistency: All entities have descriptions >=20 characters |
| G5 | Completeness: Version, metadata, edge-to-node ratio >=0.8 |
| G7 | Schema Properties: Entities need @id, @type, name, description; rels need @type, name, domain, range |
| G8 | Naming: PascalCase entity @id, camelCase relationship names, consistent namespace prefix |
| G20 | Competency Coverage: competencyQuestions[] with >=1 CQ per entity |
| G21 | Semantic Duplication: No duplicate entity names or near-duplicate descriptions |
| G22 | Cross-Ontology Rules: Application rules (AR-*) reference valid entities |
| G23 | Lineage Integrity: Lineage rules (LR-*) reference valid predecessors |
| G24 | Instance Data Quality: Instance/test data conforms to schema constraints |`;
}

/**
 * Returns a minimal OAA v7.0.0 compliant example ontology JSON string.
 */
export function getOAAExampleSnippet() {
  return JSON.stringify({
    "@context": {
      "@vocab": "https://schema.org/",
      "oaa": "https://platformcore.io/ontology/oaa/",
      "ex": "https://example.org/ontology/"
    },
    "@type": "Ontology",
    "@id": "ex:ontology:example-v1.0",
    "oaa:schemaVersion": "7.0.0",
    "oaa:ontologyId": "EX-ONT",
    "oaa:series": "custom",
    "metadata": {
      "name": "Example Ontology",
      "version": "1.0.0",
      "description": "Minimal example showing correct OAA v7.0.0 structure",
      "domain": "Example Domain",
      "purpose": "Demonstrate OAA v7.0.0 compliance patterns",
      "oaaVersion": "7.0.0",
      "dateCreated": new Date().toISOString().split('T')[0],
      "creator": "OAA Generator"
    },
    "entities": [
      {
        "@type": "pf:EntityDefinition",
        "@id": "ex:Project",
        "name": "Project",
        "description": "A planned initiative with defined scope, timeline and deliverables",
        "properties": [
          { "name": "projectId", "type": "Text", "required": true, "description": "Unique project identifier" },
          { "name": "status", "type": "Text", "required": true, "description": "Current project status" }
        ]
      },
      {
        "@type": "pf:EntityDefinition",
        "@id": "ex:Team",
        "name": "Team",
        "description": "A group of people working together towards shared project objectives",
        "properties": [
          { "name": "teamId", "type": "Text", "required": true, "description": "Unique team identifier" },
          { "name": "name", "type": "Text", "required": true, "description": "Team display name" }
        ]
      },
      {
        "@type": "pf:EntityDefinition",
        "@id": "ex:Milestone",
        "name": "Milestone",
        "description": "A significant checkpoint or deliverable within a project timeline",
        "properties": [
          { "name": "dueDate", "type": "DateTime", "required": true, "description": "Target completion date" }
        ]
      }
    ],
    "relationships": [
      {
        "@type": "Property", "@id": "ex:hasTeam", "name": "Has Team",
        "description": "Links a project to the team responsible for delivery",
        "domainIncludes": ["ex:Project"], "rangeIncludes": ["ex:Team"], "cardinality": "1..*"
      },
      {
        "@type": "Property", "@id": "ex:hasMilestone", "name": "Has Milestone",
        "description": "Links a project to its key milestone checkpoints",
        "domainIncludes": ["ex:Project"], "rangeIncludes": ["ex:Milestone"], "cardinality": "0..*"
      },
      {
        "@type": "Property", "@id": "ex:assignedTo", "name": "Assigned To",
        "description": "Links a milestone to the team responsible for completing it",
        "domainIncludes": ["ex:Milestone"], "rangeIncludes": ["ex:Team"], "cardinality": "1..1"
      }
    ],
    "businessRules": [
      {
        "ruleId": "BR-EX-001", "name": "Project Requires Team",
        "condition": "IF a Project is created", "action": "THEN it MUST have at least one hasTeam relationship", "severity": "error"
      },
      {
        "ruleId": "BR-EX-002", "name": "Milestone Date Required",
        "condition": "IF a Milestone exists", "action": "THEN dueDate MUST be set and be a valid future date", "severity": "error"
      },
      {
        "ruleId": "BR-EX-003", "name": "Team Assignment Required",
        "condition": "IF a Milestone exists", "action": "THEN it MUST be assignedTo exactly one Team", "severity": "warning"
      }
    ],
    "competencyQuestions": [
      {
        "@id": "CQ-001", "question": "What is the role and purpose of Project within this ontology?",
        "targetEntities": ["ex:Project"], "targetRelationships": ["hasTeam", "hasMilestone"]
      },
      {
        "@id": "CQ-002", "question": "What is the role and purpose of Team within this ontology?",
        "targetEntities": ["ex:Team"], "targetRelationships": ["hasTeam", "assignedTo"]
      },
      {
        "@id": "CQ-003", "question": "What is the role and purpose of Milestone within this ontology?",
        "targetEntities": ["ex:Milestone"], "targetRelationships": ["hasMilestone", "assignedTo"]
      }
    ]
  }, null, 2);
}

/**
 * Builds a comprehensive prompt for generating a brand-new OAA v7.0.0 ontology.
 */
export function buildGenerationPrompt(name, namespace, description, entityHints, series) {
  const prefix = namespace.replace(/:$/, '').split('/').pop() || 'ns';

  let prompt = `You are the OAA (Ontology Architect Agent) v7.0.0.

Create a new ontology from the following specification:
- Name: ${name}
- Namespace: ${namespace}
- Prefix: ${prefix}
- Description: ${description}
- Series: ${series || 'custom'}

## Entity Hints (expand these into full OAA-compliant entities with properties)
${entityHints || 'Use the name and description to determine appropriate entities.'}

${getOAASchemaSpec()}

## Example Compliant Ontology (follow this exact structure)
\`\`\`json
${getOAAExampleSnippet()}
\`\`\`

## Critical Requirements
1. Every entity MUST participate in >=1 relationship — no orphaned entities (G2B)
2. All entities MUST form a SINGLE connected graph — reachable from any node (G2C)
3. All entity descriptions MUST be >=20 characters (G4)
4. Include >=3 business rules in IF condition THEN action format with severity (G3)
5. Use PascalCase for entity @id (e.g., ${prefix}:MyEntity), camelCase for relationship names (G8)
6. Every entity needs @type, @id, name, description. Every relationship needs @type, name, domainIncludes, rangeIncludes, cardinality (G7)
7. Set version to 1.0.0, oaaVersion to "7.0.0", oaa:schemaVersion to "7.0.0"
10. Include competencyQuestions[] with >=1 CQ per entity (G20)
11. Include oaa:ontologyId and oaa:series at top level
8. Edge-to-node ratio should be >=0.8 (G5) — ensure enough relationships
9. Use the prefix "${prefix}" consistently for all @id values

Output ONLY valid JSON. No explanations, no markdown, no code blocks.`;

  return prompt;
}

/**
 * Builds a targeted fix prompt for iterating on gate failures.
 */
export function buildFixPrompt(ontologyData, validation) {
  const failures = [];
  const warnings = [];
  const orphanedEntities = [];
  const missingDescriptions = [];

  validation.gates.forEach(g => {
    if (g.status === 'fail') {
      failures.push({ gate: g.gate, detail: g.detail, issues: g.issues || [] });
      if (g.gate.includes('2B') && g.orphaned) {
        orphanedEntities.push(...g.orphaned);
      }
    }
    if (g.status === 'warn') {
      warnings.push({ gate: g.gate, detail: g.detail });
      if (g.gate.includes('G4') && g.warnings) {
        g.warnings.forEach(w => {
          if (w.includes('missing description')) {
            const match = w.match(/^([^:]+):/);
            if (match) missingDescriptions.push(match[1]);
          }
        });
      }
    }
  });

  let prompt = `You are the OAA (Ontology Architect Agent) v7.0.0.

Fix ONLY the failing gates in this ontology. Do NOT remove entities or relationships that are already compliant. Preserve the existing structure and extend it to pass all gates.

## Failing Gates
${failures.map(f => `FAIL: ${f.gate} — ${f.detail}${f.issues.length > 0 ? '\n  Issues: ' + f.issues.join(', ') : ''}`).join('\n')}`;

  if (warnings.length > 0) {
    prompt += `

## Warnings (fix if possible)
${warnings.map(w => `WARN: ${w.gate} — ${w.detail}`).join('\n')}`;
  }

  if (orphanedEntities.length > 0) {
    prompt += `

## Orphaned Entities (G2B — MUST connect these)
${orphanedEntities.map(e => `- ${e}: Add at least one relationship where this entity appears in domainIncludes or rangeIncludes`).join('\n')}`;
  }

  if (missingDescriptions.length > 0) {
    prompt += `

## Missing Descriptions (G4 — MUST add >=20 char descriptions)
${missingDescriptions.map(e => `- ${e}`).join('\n')}`;
  }

  prompt += `

${getOAASchemaSpec()}

## Current Ontology (fix this)
\`\`\`json
${JSON.stringify(ontologyData, null, 2)}
\`\`\`

## Instructions
1. Fix ALL failing gates listed above
2. Do NOT remove any existing entities or relationships that pass validation
3. Add new relationships to connect orphaned entities
4. Add missing descriptions (>=20 characters each)
5. Ensure single connected graph (G2C)
6. Maintain the same namespace prefix and version

Output ONLY valid JSON. No explanations, no markdown, no code blocks.`;

  return prompt;
}

/**
 * Shows the generation form modal for creating a new ontology via AI.
 */
export function showGenerationModal() {
  const modal = document.getElementById('oaa-modal');
  const body = document.getElementById('oaa-modal-body');

  body.innerHTML = `
    <h3 style="color:#9dfff5; margin-bottom:16px;">Generate New Ontology with AI</h3>
    <p style="color:#888; margin-bottom:16px; font-size:12px;">Describe your ontology and we'll generate a Claude Code prompt to create it OAA v7.0.0 compliant from the start.</p>

    <div class="library-form-group">
      <label class="author-form-label">Ontology Name</label>
      <input type="text" id="gen-name" class="library-input" placeholder="e.g., Customer Journey Ontology">
    </div>

    <div class="library-form-group">
      <label class="author-form-label">Namespace</label>
      <input type="text" id="gen-namespace" class="library-input" placeholder="e.g., https://baiv.co.uk/ontology/cj" value="https://baiv.co.uk/ontology/">
    </div>

    <div class="library-form-group">
      <label class="author-form-label">Description</label>
      <textarea id="gen-description" class="library-input" rows="2" placeholder="What does this ontology model? What domain does it cover?"></textarea>
    </div>

    <div class="library-form-group">
      <label class="author-form-label">Entity Hints</label>
      <textarea id="gen-entity-hints" class="library-input" rows="4" placeholder="List the key entities, concepts and relationships you want. E.g.:&#10;- Customer, Journey, Touchpoint, Channel&#10;- Customers have journeys, journeys contain touchpoints&#10;- Touchpoints happen via channels"></textarea>
    </div>

    <div class="library-form-group">
      <label class="author-form-label">Series</label>
      <select id="gen-series" class="library-select">
        <option value="custom">Custom</option>
        <option value="VE-Series">VE-Series (Value Engineering)</option>
        <option value="PE-Series">PE-Series (Product Engineering)</option>
        <option value="Foundation">Foundation</option>
        <option value="Competitive">Competitive</option>
        <option value="RCSG-Series">RCSG-Series (Compliance)</option>
        <option value="Orchestration">Orchestration</option>
      </select>
    </div>

    <div style="margin-top:16px; display:flex; gap:8px;">
      <button class="oaa-btn" onclick="doGeneratePrompt()" style="background:#017c75;">Generate Prompt</button>
      <button class="oaa-btn oaa-btn-secondary" onclick="closeOAAModal()">Cancel</button>
    </div>
  `;

  modal.style.display = 'flex';
}

/**
 * Reads the generation form and shows the clipboard command.
 */
export function doGeneratePrompt() {
  const name = document.getElementById('gen-name')?.value?.trim();
  const namespace = document.getElementById('gen-namespace')?.value?.trim();
  const description = document.getElementById('gen-description')?.value?.trim();
  const entityHints = document.getElementById('gen-entity-hints')?.value?.trim();
  const series = document.getElementById('gen-series')?.value;

  if (!name) { alert('Please enter an ontology name'); return; }
  if (!namespace) { alert('Please enter a namespace'); return; }

  const prompt = buildGenerationPrompt(name, namespace, description, entityHints, series);
  const safeName = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');
  const outputName = `${safeName}-ontology-v1.0.0.json`;

  showOAAModal(prompt, outputName);
}

/**
 * Runs the fix prompt for the currently loaded ontology using its last validation.
 */
export function runFixPrompt() {
  if (!state.currentData) {
    alert('Load an ontology first');
    return;
  }

  const validation = state.lastValidation || validateOAAv5(state.currentData, state.lastParsed);
  state.lastValidation = validation;

  const hasFailures = validation.gates.some(g => g.status === 'fail');
  if (!hasFailures) {
    alert('All gates pass — no fixes needed!');
    return;
  }

  const prompt = buildFixPrompt(state.currentData, validation);
  const fileName = document.getElementById('file-name')?.textContent || 'ontology';
  const baseName = fileName.replace(/\.json$/i, '');
  const outputName = `${baseName}-fixed.json`;

  showOAAModal(prompt, outputName);
}

export async function showVersionHistory(ontologyId, name) {
  try {
    const versions = await getVersionHistory(ontologyId);
    const ontology = await loadOntologyFromLibrary(ontologyId);

    const modal = document.getElementById('save-library-modal');
    const body = document.getElementById('save-library-body');

    let historyHtml = '';
    if (versions.length === 0) {
      historyHtml = '<p class="library-empty">No previous versions</p>';
    } else {
      historyHtml = '<div class="version-history">';
      versions.forEach(v => {
        const date = new Date(v.timestamp).toLocaleString();
        historyHtml += `
          <div class="version-item">
            <div class="version-item-info">
              <strong>v${v.version}</strong>
              <div class="version-item-date">${date}</div>
              ${v.notes ? `<div style="color:#888; font-size:10px;">${escapeHtml(v.notes)}</div>` : ''}
            </div>
            <button class="oaa-btn oaa-btn-secondary" onclick="restoreVersion(${v.id})" style="font-size:11px; padding:4px 8px;">Restore</button>
          </div>`;
      });
      historyHtml += '</div>';
    }

    body.innerHTML = `
      <h4 style="color:#e0e0e0; margin-bottom:12px;">${escapeHtml(name)}</h4>
      <p style="color:#888; font-size:12px; margin-bottom:12px;">Current version: v${ontology.version}</p>
      ${historyHtml}
      <div style="margin-top:16px;">
        <button class="oaa-btn oaa-btn-secondary" onclick="closeSaveLibraryModal()">Close</button>
      </div>
    `;

    modal.style.display = 'flex';

  } catch (err) {
    alert('Error loading version history: ' + err.message);
  }
}
