/**
 * Export functions — audit reports, PNG/SVG/Mermaid/D3 export, PDF report, ontology download.
 */

import { state, TYPE_COLORS, getArchetypeColor } from './state.js';
import { validateOAAv5, runV7Gates, extractEntities, extractRelationships } from './audit-engine.js';
import { buildGateReportMarkdown } from './ui-panels.js';

export function generateAuditReport(ontologyData, parsed, validation, registryInfo = null) {
  const timestamp = new Date().toISOString();
  const fileName = document.getElementById('file-name').textContent || 'unknown';

  const ontologyName = ontologyData.name ||
                       ontologyData['rdfs:label'] ||
                       ontologyData['@id']?.split('/').pop() ||
                       'unnamed';
  const ontologyVersion = ontologyData['oaa:moduleVersion'] ||
                          ontologyData.version ||
                          ontologyData['owl:versionInfo'] ||
                          'unknown';

  return {
    "@context": "https://oaa-ontology.org/audit/v1/",
    "@type": "OAAAuditReport",
    "@id": `audit:${ontologyName.toLowerCase().replace(/\s+/g, '-')}-${timestamp.replace(/[:.]/g, '-')}`,
    "auditMetadata": {
      "generatedAt": timestamp,
      "generatedBy": "OAA Visualiser v7.0.0",
      "oaaVersion": "7.0.0",
      "auditVersion": "1.0.0"
    },
    "ontologyMetadata": {
      "name": ontologyName,
      "version": ontologyVersion,
      "schemaVersion": ontologyData['oaa:schemaVersion'] || null,
      "domain": ontologyData['oaa:domain'] || null,
      "previousVersion": ontologyData['oaa:previousVersion'] || null,
      "sourceFile": fileName
    },
    "complianceResult": {
      "overallStatus": validation.overall,
      "summary": validation.summary
    },
    "gateResults": validation.gates.map(g => ({
      "gateId": g.gate.split(':')[0].trim(),
      "gateName": g.gate.split(':')[1]?.trim() || g.gate,
      "status": g.status,
      "isAdvisory": g.advisory || false,
      "isSkipped": g.skipped || false,
      "detail": g.detail,
      "issues": g.issues || [],
      "warnings": g.warnings || []
    })),
    "graphMetrics": {
      "totalNodes": parsed.nodes.length,
      "totalEdges": parsed.edges.length,
      "entityCount": parsed.nodes.filter(n => n.entityType !== 'external').length,
      "relationshipCount": (ontologyData.relationships ||
                           ontologyData.ontologyDefinition?.relationships || []).length,
      "businessRuleCount": (ontologyData.businessRules ||
                           ontologyData.rules ||
                           ontologyData.ontologyDefinition?.businessRules || []).length,
      "edgeToNodeRatio": parsed.nodes.length > 0 ?
                         (parsed.edges.length / parsed.nodes.filter(n => n.entityType !== 'external').length).toFixed(2) : 0,
      "connectedComponents": state.lastAudit?.components?.length || 1,
      "orphanedEntities": validation.gates.find(g => g.gate.includes('G2B'))?.orphaned || []
    },
    "registryInfo": registryInfo ? {
      "matched": true,
      "entryId": registryInfo.entryId,
      "registryVersion": registryInfo.version,
      "registryStatus": registryInfo.status,
      "validatedDate": registryInfo.validatedDate,
      "dependencies": registryInfo.dependencies || [],
      "dependents": registryInfo.dependents || []
    } : {
      "matched": false
    }
  };
}

export function exportAuditFile() {
  if (!state.currentData || !state.lastParsed) {
    alert('Load an ontology first to generate audit report');
    return;
  }

  const validation = state.lastValidation || validateOAAv5(state.currentData, state.lastParsed);
  const auditReport = generateAuditReport(state.currentData, state.lastParsed, validation, state.currentRegistryEntry);

  const ontName = auditReport.ontologyMetadata.name.toLowerCase().replace(/\s+/g, '-');
  const ontVersion = auditReport.ontologyMetadata.version;
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `${ontName}-audit-${ontVersion}-${dateStr}.json`;

  const blob = new Blob([JSON.stringify(auditReport, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportPNG() {
  if (!state.network) return;
  const canvas = document.querySelector('#network canvas');
  if (canvas) {
    const link = document.createElement('a');
    link.download = 'ontology-graph.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }
}

export function exportSVG() {
  if (!state.network || !state.lastParsed) return;

  const positions = state.network.getPositions();
  const nodes = state.lastParsed.nodes;
  const edges = state.lastParsed.edges;

  if (nodes.length === 0) return;

  // Compute bounding box
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const node of nodes) {
    const pos = positions[node.id];
    if (!pos) continue;
    minX = Math.min(minX, pos.x);
    minY = Math.min(minY, pos.y);
    maxX = Math.max(maxX, pos.x);
    maxY = Math.max(maxY, pos.y);
  }

  const padding = 80;
  const nodeRadius = 18;
  const width = Math.max(maxX - minX + padding * 2, 200);
  const height = Math.max(maxY - minY + padding * 2, 200);
  const offsetX = -minX + padding;
  const offsetY = -minY + padding;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="background:#0f1117">\n`;

  // Arrowhead marker
  svg += `<defs>\n`;
  svg += `  <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">\n`;
  svg += `    <polygon points="0 0, 10 3.5, 0 7" fill="#888"/>\n`;
  svg += `  </marker>\n`;
  svg += `</defs>\n`;

  // Edges
  for (const edge of edges) {
    const fromPos = positions[edge.from];
    const toPos = positions[edge.to];
    if (!fromPos || !toPos) continue;
    const x1 = fromPos.x + offsetX;
    const y1 = fromPos.y + offsetY;
    const x2 = toPos.x + offsetX;
    const y2 = toPos.y + offsetY;

    // Shorten line to stop at node border
    const dx = x2 - x1, dy = y2 - y1;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist === 0) continue;
    const ux = dx / dist, uy = dy / dist;
    const sx = x1 + ux * nodeRadius, sy = y1 + uy * nodeRadius;
    const ex = x2 - ux * (nodeRadius + 10), ey = y2 - uy * (nodeRadius + 10);

    const dashArray = edge.edgeType === 'inheritance' ? ' stroke-dasharray="6,3"' : '';
    const color = edge.edgeType === 'inheritance' ? '#888' : edge.edgeType === 'binding' ? '#FF9800' : '#555';
    svg += `  <line x1="${sx.toFixed(1)}" y1="${sy.toFixed(1)}" x2="${ex.toFixed(1)}" y2="${ey.toFixed(1)}" stroke="${color}" stroke-width="1.5"${dashArray} marker-end="url(#arrowhead)"/>\n`;

    // Edge label
    if (edge.label) {
      const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
      const escaped = escSvg(edge.label);
      svg += `  <text x="${mx.toFixed(1)}" y="${(my - 4).toFixed(1)}" fill="#888" font-size="9" font-family="sans-serif" text-anchor="middle">${escaped}</text>\n`;
    }
  }

  // Nodes
  for (const node of nodes) {
    const pos = positions[node.id];
    if (!pos) continue;
    const cx = pos.x + offsetX;
    const cy = pos.y + offsetY;
    const fill = getArchetypeColor(node.entityType);
    svg += `  <circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${nodeRadius}" fill="${fill}" stroke="#222" stroke-width="1.5"/>\n`;
    const escaped = escSvg(node.label || '');
    svg += `  <text x="${cx.toFixed(1)}" y="${(cy + nodeRadius + 14).toFixed(1)}" fill="#ccc" font-size="11" font-family="sans-serif" text-anchor="middle">${escaped}</text>\n`;
  }

  svg += `</svg>`;

  const fileName = document.getElementById('file-name')?.textContent || 'ontology';
  const baseName = fileName.replace(/\.json$/i, '').replace(/\s+/g, '-').toLowerCase();
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${baseName}-graph.svg`;
  a.click();
  URL.revokeObjectURL(url);
}

function escSvg(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function exportMermaid() {
  if (!state.lastParsed) return '';

  const { nodes, edges } = state.lastParsed;
  const idMap = new Map();
  let mermaid = 'flowchart LR\n';

  // Node declarations — map IDs to safe Mermaid identifiers
  nodes.forEach((n, i) => {
    const safeId = `n${i}`;
    idMap.set(n.id, safeId);
    const label = escMermaid(n.label || n.id);
    const shape = n.entityType === 'core' ? `(("${label}"))` :
                  n.entityType === 'external' ? `[/"${label}"/]` :
                  n.entityType === 'agent' ? `{{"${label}"}}` :
                  `["${label}"]`;
    mermaid += `    ${safeId}${shape}\n`;
  });

  mermaid += '\n';

  // Edge declarations
  edges.forEach(e => {
    const from = idMap.get(e.from);
    const to = idMap.get(e.to);
    if (!from || !to) return;
    const arrow = e.edgeType === 'inheritance' ? '-.->' :
                  e.edgeType === 'binding' ? '==>' : '-->';
    const label = e.label ? `|"${escMermaid(e.label)}"|` : '';
    mermaid += `    ${from} ${arrow}${label} ${to}\n`;
  });

  // Style classes by entity type
  const typeGroups = new Map();
  nodes.forEach((n, i) => {
    const t = n.entityType || 'default';
    if (!typeGroups.has(t)) typeGroups.set(t, []);
    typeGroups.get(t).push(`n${i}`);
  });
  mermaid += '\n';
  for (const [type, ids] of typeGroups) {
    const color = getArchetypeColor(type);
    mermaid += `    classDef ${type.replace(/[^a-zA-Z0-9]/g, '_')} fill:${color},stroke:#333,color:#fff\n`;
    mermaid += `    class ${ids.join(',')} ${type.replace(/[^a-zA-Z0-9]/g, '_')}\n`;
  }

  // Build reverse map (safeId → entityId) for bidirectional linking (Epic 9F)
  const reverseMap = new Map();
  for (const [entityId, safeId] of idMap) {
    reverseMap.set(safeId, entityId);
  }
  state.mermaidLastIdMap = reverseMap;

  // Download as .mmd
  const fileName = document.getElementById('file-name')?.textContent || 'ontology';
  const baseName = fileName.replace(/\.json$/i, '').replace(/\s+/g, '-').toLowerCase();
  const blob = new Blob([mermaid], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${baseName}-graph.mmd`;
  a.click();
  URL.revokeObjectURL(url);

  return mermaid;
}

export function exportMermaidAsText() {
  if (!state.lastParsed) return { mermaidText: '', idMap: new Map(), reverseMap: new Map() };

  const { nodes, edges } = state.lastParsed;
  const idMap = new Map();
  let mermaid = 'flowchart LR\n';

  nodes.forEach((n, i) => {
    const safeId = `n${i}`;
    idMap.set(n.id, safeId);
    const label = escMermaid(n.label || n.id);
    const shape = n.entityType === 'core' ? `(("${label}"))` :
                  n.entityType === 'external' ? `[/"${label}"/]` :
                  n.entityType === 'agent' ? `{{"${label}"}}` :
                  `["${label}"]`;
    mermaid += `    ${safeId}${shape}\n`;
  });

  mermaid += '\n';

  edges.forEach(e => {
    const from = idMap.get(e.from);
    const to = idMap.get(e.to);
    if (!from || !to) return;
    const arrow = e.edgeType === 'inheritance' ? '-.->' :
                  e.edgeType === 'binding' ? '==>' : '-->';
    const label = e.label ? `|"${escMermaid(e.label)}"|` : '';
    mermaid += `    ${from} ${arrow}${label} ${to}\n`;
  });

  const typeGroups = new Map();
  nodes.forEach((n, i) => {
    const t = n.entityType || 'default';
    if (!typeGroups.has(t)) typeGroups.set(t, []);
    typeGroups.get(t).push(`n${i}`);
  });
  mermaid += '\n';
  for (const [type, ids] of typeGroups) {
    const color = getArchetypeColor(type);
    mermaid += `    classDef ${type.replace(/[^a-zA-Z0-9]/g, '_')} fill:${color},stroke:#333,color:#fff\n`;
    mermaid += `    class ${ids.join(',')} ${type.replace(/[^a-zA-Z0-9]/g, '_')}\n`;
  }

  const reverseMap = new Map();
  for (const [entityId, safeId] of idMap) {
    reverseMap.set(safeId, entityId);
  }
  state.mermaidLastIdMap = reverseMap;

  return { mermaidText: mermaid, idMap, reverseMap };
}

function escMermaid(str) {
  return str.replace(/"/g, '#quot;').replace(/[[\]{}()|]/g, '');
}

export function exportD3JSON() {
  if (!state.lastParsed) return null;

  const { nodes, edges } = state.lastParsed;
  const positions = state.network ? state.network.getPositions() : {};

  const d3Data = {
    nodes: nodes.map(n => {
      const pos = positions[n.id];
      return {
        id: n.id,
        label: n.label,
        group: n.entityType || 'default',
        description: n.description || '',
        ...(pos ? { x: Math.round(pos.x), y: Math.round(pos.y) } : {})
      };
    }),
    links: edges.map(e => ({
      source: e.from,
      target: e.to,
      label: e.label || '',
      type: e.edgeType || 'relationship'
    })),
    metadata: {
      name: state.lastParsed.name || '',
      format: state.lastParsed.diagnostics?.format || '',
      exportedAt: new Date().toISOString(),
      nodeCount: nodes.length,
      edgeCount: edges.length
    }
  };

  // Download as JSON
  const fileName = document.getElementById('file-name')?.textContent || 'ontology';
  const baseName = fileName.replace(/\.json$/i, '').replace(/\s+/g, '-').toLowerCase();
  const blob = new Blob([JSON.stringify(d3Data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${baseName}-d3-graph.json`;
  a.click();
  URL.revokeObjectURL(url);

  return d3Data;
}

/**
 * Generate PDF report HTML string. Extracted for testability.
 * @param {Object} opts
 * @param {string} opts.fileName - Ontology file name
 * @param {Object} opts.validation - Gate results from validateOAAv5 (G1-G8)
 * @param {Object|null} opts.score - Completeness score object
 * @param {Object|null} opts.audit - Graph audit metrics
 * @param {Object|null} opts.currentData - Raw ontology JSON
 * @param {string} opts.graphImg - Base64 graph snapshot (or empty string)
 * @returns {string} Full HTML document string
 */
export function generatePDFHTML({ fileName, validation, score, audit, currentData, graphImg }) {
  const ontVersion = currentData?.['oaa:moduleVersion'] ||
                     currentData?.version || '';
  const schemaVersion = currentData?.['oaa:schemaVersion'] || '';
  const oaaLabel = schemaVersion ? `v${schemaVersion}` : 'v6.x';

  const scoreColor = score?.totalScore >= 80 ? '#155724' : score?.totalScore >= 60 ? '#856404' : '#721c24';
  const scoreBg = score?.totalScore >= 80 ? '#d4edda' : score?.totalScore >= 60 ? '#fff3cd' : '#f8d7da';

  // Run v7 quality gates
  const v7Gates = currentData ? runV7Gates(currentData) : [];
  const v7Active = v7Gates.filter(g => !g.skipped);

  let html = `<!DOCTYPE html><html><head>
<meta charset="UTF-8">
<title>${esc(fileName)} - OAA ${oaaLabel} Validation Report</title>
<style>
  body { font-family: 'Segoe UI', system-ui, sans-serif; max-width: 900px; margin: 0 auto; padding: 20px; color: #333; line-height: 1.5; }
  h1 { color: #017c75; border-bottom: 2px solid #017c75; padding-bottom: 8px; font-size: 22px; }
  h2 { color: #444; margin-top: 24px; font-size: 16px; }
  h3 { color: #555; margin-top: 18px; font-size: 14px; }
  table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 13px; }
  th, td { border: 1px solid #ddd; padding: 6px 10px; text-align: left; }
  th { background: #f5f5f5; font-weight: 600; }
  .graph-img { max-width: 100%; border: 1px solid #ddd; border-radius: 8px; margin: 16px 0; }
  .score-badge { display: inline-block; padding: 4px 14px; border-radius: 4px; font-weight: 600; font-size: 14px; }
  .meta { color: #666; font-size: 13px; margin: 4px 0; }
  .section-label { color: #888; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 16px; margin-bottom: 4px; }
  .print-btn { background: #017c75; color: white; border: none; padding: 10px 24px; border-radius: 6px; cursor: pointer; font-size: 14px; margin-bottom: 16px; }
  @media print { .print-btn { display: none; } }
</style>
</head><body>
<button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
<h1>OAA ${esc(oaaLabel)} Validation Report</h1>
<p class="meta"><strong>Ontology:</strong> ${esc(fileName)}${ontVersion ? ` v${esc(ontVersion)}` : ''}</p>
<p class="meta"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
<p class="meta"><strong>OAA Schema:</strong> ${esc(oaaLabel)}</p>
<p class="meta"><strong>Overall:</strong> <span class="score-badge" style="background:${scoreBg};color:${scoreColor}">${validation.overall.toUpperCase()}</span></p>`;

  if (score) {
    html += `<p class="meta"><strong>Completeness Score:</strong> <span class="score-badge" style="background:${scoreBg};color:${scoreColor}">${score.totalScore}% (${score.totalLabel})</span></p>`;
  }

  // Graph snapshot
  if (graphImg) {
    html += `<h2>Graph Visualisation</h2>`;
    html += `<img src="${graphImg}" class="graph-img" alt="Ontology Graph">`;
  }

  // Completeness category breakdown
  if (score) {
    html += `<h2>Completeness Breakdown</h2><table><tr><th>Category</th><th>Weight</th><th>Score</th></tr>`;
    score.categories.forEach(cat => {
      html += `<tr><td>${esc(cat.name)}</td><td>${Math.round(cat.weight * 100)}%</td><td>${cat.score}%</td></tr>`;
    });
    html += `</table>`;
  }

  // --- Core Gates (G1-G4, G7) ---
  const coreGates = validation.gates.filter(g => !g.skipped && !g.advisory);
  if (coreGates.length > 0) {
    html += `<h2>Gate Results</h2>`;
    html += `<p class="section-label">Core Gates (Required)</p>`;
    html += `<table><tr><th>Gate</th><th>Status</th><th>Detail</th></tr>`;
    coreGates.forEach(g => {
      const icon = g.status === 'pass' ? '&#x2705;' : g.status === 'warn' ? '&#x26A0;&#xFE0F;' : '&#x274C;';
      html += `<tr><td>${esc(g.gate)}</td><td>${icon} ${g.status.toUpperCase()}</td><td>${esc(g.detail || '')}</td></tr>`;
    });
    html += `</table>`;
  }

  // --- Advisory Gates (G5-G6, G8) ---
  const advisoryGates = validation.gates.filter(g => !g.skipped && g.advisory);
  if (advisoryGates.length > 0) {
    html += `<p class="section-label">Advisory Gates (Recommendations)</p>`;
    html += `<table><tr><th>Gate</th><th>Status</th><th>Detail</th></tr>`;
    advisoryGates.forEach(g => {
      const icon = g.status === 'pass' ? '&#x2705;' : g.status === 'warn' ? '&#x26A0;&#xFE0F;' : '&#x274C;';
      html += `<tr><td>${esc(g.gate)} (advisory)</td><td>${icon} ${g.status.toUpperCase()}</td><td>${esc(g.detail || '')}</td></tr>`;
    });
    html += `</table>`;
  }

  // --- v7 Quality Gates (G20-G24) ---
  if (v7Active.length > 0) {
    html += `<p class="section-label">v7 Quality Gates</p>`;
    html += `<table><tr><th>Gate</th><th>Status</th><th>Detail</th></tr>`;
    v7Active.forEach(g => {
      const icon = g.status === 'pass' ? '&#x2705;' : g.status === 'warn' ? '&#x26A0;&#xFE0F;' : '&#x274C;';
      const advisory = g.advisory ? ' (advisory)' : '';
      html += `<tr><td>${esc(g.gate)}${advisory}</td><td>${icon} ${g.status.toUpperCase()}</td><td>${esc(g.detail || '')}</td></tr>`;
    });
    html += `</table>`;

    // Competency Coverage metrics (G20)
    const g20 = v7Active.find(g => g.gate.includes('G20'));
    if (g20?.metrics) {
      html += `<h3>Competency Question Coverage</h3>`;
      html += `<table><tr><th>Metric</th><th>Coverage</th></tr>`;
      html += `<tr><td>Entity Coverage</td><td>${g20.metrics.entityCoverage ?? 0}%</td></tr>`;
      html += `<tr><td>Relationship Coverage</td><td>${g20.metrics.relationshipCoverage ?? 0}%</td></tr>`;
      html += `<tr><td>Rule Coverage</td><td>${g20.metrics.ruleCoverage ?? 0}%</td></tr>`;
      html += `</table>`;
    }

    // Instance Data Distribution (G24)
    const g24 = v7Active.find(g => g.gate.includes('G24'));
    if (g24?.metrics?.distribution) {
      const dist = g24.metrics.distribution;
      const total = g24.metrics.totalInstances || 0;
      html += `<h3>Instance Data Distribution</h3>`;
      html += `<table><tr><th>Category</th><th>Count</th><th>Percentage</th></tr>`;
      const pct = (n) => total > 0 ? Math.round((n / total) * 100) : 0;
      html += `<tr><td>Happy Path</td><td>${dist.happyPath || 0}</td><td>${pct(dist.happyPath || 0)}%</td></tr>`;
      html += `<tr><td>Edge Cases</td><td>${dist.edge || 0}</td><td>${pct(dist.edge || 0)}%</td></tr>`;
      html += `<tr><td>Boundary</td><td>${dist.boundary || 0}</td><td>${pct(dist.boundary || 0)}%</td></tr>`;
      html += `<tr><td>Error</td><td>${dist.error || 0}</td><td>${pct(dist.error || 0)}%</td></tr>`;
      html += `</table>`;
      if (g24.metrics.cqCoverage != null) {
        html += `<p class="meta"><strong>CQ-to-Instance Coverage:</strong> ${g24.metrics.cqCoverage}%</p>`;
      }
    }
  }

  // Graph metrics
  if (audit) {
    const density = audit.totalNodes > 0 ? (audit.totalEdges / audit.totalNodes).toFixed(2) : '0.00';
    html += `<h2>Graph Metrics</h2><table><tr><th>Metric</th><th>Value</th></tr>`;
    html += `<tr><td>Nodes</td><td>${audit.totalNodes}</td></tr>`;
    html += `<tr><td>Edges</td><td>${audit.totalEdges}</td></tr>`;
    html += `<tr><td>Density (edge:node)</td><td>${density}</td></tr>`;
    html += `<tr><td>Connected Components</td><td>${audit.components.length}</td></tr>`;
    html += `<tr><td>Isolated Nodes</td><td>${audit.isolated.length}</td></tr>`;
    html += `</table>`;
  }

  html += `<p style="margin-top:24px;color:#999;font-size:11px;">Generated by OAA Ontology Visualiser v4.5.0</p>`;
  html += `</body></html>`;

  return html;
}

export function exportPDF() {
  if (!state.lastParsed || !state.lastValidation) {
    alert('Load an ontology and run validation first');
    return;
  }

  const canvas = document.querySelector('#network canvas');
  const graphImg = canvas ? canvas.toDataURL('image/png') : '';
  const fileName = document.getElementById('file-name')?.textContent || 'Ontology';

  const html = generatePDFHTML({
    fileName,
    validation: state.lastValidation,
    score: state.lastCompletenessScore,
    audit: state.lastAudit,
    currentData: state.currentData,
    graphImg,
  });

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
  }
}

// ========================================
// FULL ONTOLOGY CATALOGUE PDF (F9J.4)
// ========================================

/**
 * Generate a full ontology catalogue PDF as HTML string.
 * Unlike generatePDFHTML (validation-focused), this produces a comprehensive
 * reference document: entities, relationships, business rules, enums, and scope.
 *
 * @param {Object} opts
 * @param {string} opts.fileName - Ontology file name
 * @param {Object} opts.currentData - Raw ontology JSON
 * @param {Object|null} opts.parsed - Parsed graph (nodes/edges)
 * @param {Object|null} opts.audit - Graph audit metrics
 * @param {string} opts.graphImg - Base64 graph snapshot (or empty string)
 * @returns {string} Full HTML document string
 */
export function generateCataloguePDFHTML({ fileName, currentData, parsed, audit, graphImg }) {
  const ontName = currentData?.name ||
                  currentData?.['rdfs:label'] ||
                  currentData?.['@id']?.split('/').pop() ||
                  fileName || 'Unnamed Ontology';
  const ontVersion = currentData?.['oaa:moduleVersion'] ||
                     currentData?.version ||
                     currentData?.['owl:versionInfo'] || '';
  const schemaVersion = currentData?.['oaa:schemaVersion'] || '';
  const oaaLabel = schemaVersion ? `v${schemaVersion}` : 'v6.x';
  const domain = currentData?.['oaa:domain'] ||
                 currentData?.metadata?.domain ||
                 currentData?.domain || '';
  const description = currentData?.description ||
                      currentData?.['rdfs:comment'] ||
                      currentData?.metadata?.description || '';
  const dependencies = currentData?.metadata?.dependencies ||
                       currentData?.dependencies || [];

  const entities = currentData ? extractEntities(currentData) : [];
  const relationships = currentData ? extractRelationships(currentData) : [];
  const businessRules = currentData?.businessRules || currentData?.rules ||
                        currentData?.ontologyDefinition?.businessRules || [];

  // Extract enums from entity properties
  const enums = [];
  for (const ent of entities) {
    const props = ent.properties || [];
    for (const prop of props) {
      if (prop.type === 'enum' && Array.isArray(prop.values) && prop.values.length > 0) {
        const entName = ent.name || ent['rdfs:label'] || ent['@id'] || 'unknown';
        enums.push({ entity: entName, property: prop.name, values: prop.values });
      }
    }
  }

  let html = `<!DOCTYPE html><html><head>
<meta charset="UTF-8">
<title>${esc(ontName)} - Ontology Catalogue</title>
<style>
  body { font-family: 'Segoe UI', system-ui, sans-serif; max-width: 960px; margin: 0 auto; padding: 20px; color: #333; line-height: 1.5; }
  h1 { color: #017c75; border-bottom: 2px solid #017c75; padding-bottom: 8px; font-size: 22px; }
  h2 { color: #017c75; margin-top: 28px; font-size: 17px; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
  h3 { color: #555; margin-top: 18px; font-size: 14px; }
  table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 13px; }
  th, td { border: 1px solid #ddd; padding: 6px 10px; text-align: left; vertical-align: top; }
  th { background: #f5f5f5; font-weight: 600; }
  tr:nth-child(even) { background: #fafafa; }
  .graph-img { max-width: 100%; border: 1px solid #ddd; border-radius: 8px; margin: 16px 0; }
  .meta { color: #666; font-size: 13px; margin: 4px 0; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 3px; font-size: 11px; font-weight: 600; }
  .badge-core { background: #d4edda; color: #155724; }
  .badge-supporting { background: #cce5ff; color: #004085; }
  .badge-framework { background: #fff3cd; color: #856404; }
  .badge-external { background: #e2e3e5; color: #383d41; }
  .badge-agent { background: #f8d7da; color: #721c24; }
  .rule-list { margin: 8px 0; padding-left: 20px; }
  .rule-list li { margin: 6px 0; font-size: 13px; }
  .enum-values { font-family: monospace; font-size: 12px; color: #555; }
  .toc { background: #f8f9fa; border: 1px solid #ddd; border-radius: 6px; padding: 12px 20px; margin: 16px 0; }
  .toc a { color: #017c75; text-decoration: none; }
  .toc a:hover { text-decoration: underline; }
  .toc ul { margin: 4px 0; padding-left: 18px; }
  .toc li { margin: 2px 0; font-size: 13px; }
  .print-btn { background: #017c75; color: white; border: none; padding: 10px 24px; border-radius: 6px; cursor: pointer; font-size: 14px; margin-bottom: 16px; }
  .dep-list { margin: 4px 0; padding-left: 18px; font-size: 12px; color: #555; }
  @media print { .print-btn { display: none; } }
</style>
</head><body>
<button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
<h1>${esc(ontName)} — Ontology Catalogue</h1>
<p class="meta"><strong>Version:</strong> ${ontVersion ? esc(ontVersion) : 'N/A'}</p>
<p class="meta"><strong>OAA Schema:</strong> ${esc(oaaLabel)}</p>
<p class="meta"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>`;

  if (domain) {
    html += `<p class="meta"><strong>Domain:</strong> ${esc(domain)}</p>`;
  }
  if (description) {
    html += `<p class="meta"><strong>Description:</strong> ${esc(description)}</p>`;
  }
  if (dependencies.length > 0) {
    html += `<p class="meta"><strong>Dependencies:</strong></p><ul class="dep-list">`;
    dependencies.forEach(d => { html += `<li>${esc(typeof d === 'string' ? d : d.name || JSON.stringify(d))}</li>`; });
    html += `</ul>`;
  }

  // Table of contents
  html += `<div class="toc"><strong>Contents</strong><ul>`;
  html += `<li><a href="#scope">Scope Summary</a> (${entities.length} entities, ${relationships.length} relationships, ${businessRules.length} rules)</li>`;
  if (graphImg) html += `<li><a href="#graph">Graph Visualisation</a></li>`;
  html += `<li><a href="#entities">Entity Catalogue</a></li>`;
  html += `<li><a href="#relationships">Relationship Catalogue</a></li>`;
  if (businessRules.length > 0) html += `<li><a href="#rules">Business Rules</a></li>`;
  if (enums.length > 0) html += `<li><a href="#enums">Enum Definitions</a></li>`;
  html += `</ul></div>`;

  // Scope summary
  html += `<h2 id="scope">Scope Summary</h2>`;
  html += `<table><tr><th>Metric</th><th>Value</th></tr>`;
  html += `<tr><td>Entities</td><td>${entities.length}</td></tr>`;
  html += `<tr><td>Relationships</td><td>${relationships.length}</td></tr>`;
  html += `<tr><td>Business Rules</td><td>${businessRules.length}</td></tr>`;
  html += `<tr><td>Enum Definitions</td><td>${enums.length}</td></tr>`;
  if (audit) {
    const density = audit.totalNodes > 0 ? (audit.totalEdges / audit.totalNodes).toFixed(2) : '0.00';
    html += `<tr><td>Graph Nodes</td><td>${audit.totalNodes}</td></tr>`;
    html += `<tr><td>Graph Edges</td><td>${audit.totalEdges}</td></tr>`;
    html += `<tr><td>Density (edge:node)</td><td>${density}</td></tr>`;
    html += `<tr><td>Connected Components</td><td>${audit.components.length}</td></tr>`;
    html += `<tr><td>Isolated Nodes</td><td>${audit.isolated.length}</td></tr>`;
  }
  html += `</table>`;

  // Graph visualisation
  if (graphImg) {
    html += `<h2 id="graph">Graph Visualisation</h2>`;
    html += `<img src="${graphImg}" class="graph-img" alt="Ontology Graph">`;
  }

  // Entity catalogue
  html += `<h2 id="entities">Entity Catalogue</h2>`;
  if (entities.length === 0) {
    html += `<p class="meta">No entities defined.</p>`;
  } else {
    html += `<table><tr><th>Name</th><th>Type</th><th>Description</th><th>Properties</th><th>Schema.org Base</th></tr>`;
    for (const ent of entities) {
      const name = ent.name || ent['rdfs:label'] || ent['@id'] || ent.id || '';
      const entType = ent.entityType || ent['@type'] || ent.type || '';
      const desc = ent.description || ent['rdfs:comment'] || '';
      const props = ent.properties || [];
      const schemaBase = ent.schemaOrgBase || ent['schema:additionalType'] || '';
      const badgeClass = entType === 'core' ? 'badge-core' :
                         entType === 'supporting' ? 'badge-supporting' :
                         entType === 'framework' ? 'badge-framework' :
                         entType === 'external' ? 'badge-external' :
                         entType === 'agent' ? 'badge-agent' : '';
      const typeBadge = entType ? `<span class="badge ${badgeClass}">${esc(entType)}</span>` : '';
      html += `<tr><td><strong>${esc(name)}</strong></td><td>${typeBadge}</td><td>${esc(desc)}</td><td>${props.length}</td><td>${esc(schemaBase)}</td></tr>`;
    }
    html += `</table>`;
  }

  // Relationship catalogue
  html += `<h2 id="relationships">Relationship Catalogue</h2>`;
  if (relationships.length === 0) {
    html += `<p class="meta">No relationships defined.</p>`;
  } else {
    html += `<table><tr><th>Name</th><th>Domain (From)</th><th>Range (To)</th><th>Cardinality</th><th>Description</th></tr>`;
    for (const rel of relationships) {
      const name = rel.name || rel['rdfs:label'] || rel['@id'] || '';
      const domainArr = rel.domainIncludes || rel['oaa:domainIncludes'] || rel.domain || [];
      const rangeArr = rel.rangeIncludes || rel['oaa:rangeIncludes'] || rel.range || [];
      const domain = Array.isArray(domainArr) ? domainArr.join(', ') : String(domainArr);
      const range = Array.isArray(rangeArr) ? rangeArr.join(', ') : String(rangeArr);
      const card = rel.cardinality || rel['oaa:cardinality'] || '';
      const desc = rel.description || rel['rdfs:comment'] || '';
      html += `<tr><td><strong>${esc(name)}</strong></td><td>${esc(domain)}</td><td>${esc(range)}</td><td>${esc(card)}</td><td>${esc(desc)}</td></tr>`;
    }
    html += `</table>`;
  }

  // Business rules
  if (businessRules.length > 0) {
    html += `<h2 id="rules">Business Rules</h2>`;
    html += `<ol class="rule-list">`;
    for (const rule of businessRules) {
      const ruleText = typeof rule === 'string' ? rule :
                       rule.rule || rule.description || rule.name || JSON.stringify(rule);
      const mandatory = rule.mandatory !== undefined ? (rule.mandatory ? ' (mandatory)' : ' (advisory)') : '';
      html += `<li>${esc(ruleText)}${mandatory}</li>`;
    }
    html += `</ol>`;
  }

  // Enum definitions
  if (enums.length > 0) {
    html += `<h2 id="enums">Enum Definitions</h2>`;
    html += `<table><tr><th>Entity</th><th>Property</th><th>Values</th></tr>`;
    for (const en of enums) {
      html += `<tr><td>${esc(en.entity)}</td><td>${esc(en.property)}</td><td><span class="enum-values">${esc(en.values.join(', '))}</span></td></tr>`;
    }
    html += `</table>`;
  }

  html += `<p style="margin-top:24px;color:#999;font-size:11px;">Generated by OAA Ontology Visualiser v4.5.0 — Full Ontology Catalogue</p>`;
  html += `</body></html>`;

  return html;
}

export function exportCataloguePDF() {
  if (!state.currentData) {
    alert('Load an ontology first to generate catalogue');
    return;
  }

  const canvas = document.querySelector('#network canvas');
  const graphImg = canvas ? canvas.toDataURL('image/png') : '';
  const fileName = document.getElementById('file-name')?.textContent || 'Ontology';

  const html = generateCataloguePDFHTML({
    fileName,
    currentData: state.currentData,
    parsed: state.lastParsed,
    audit: state.lastAudit,
    graphImg,
  });

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
  }
}

function esc(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function downloadOntologyForOAA() {
  const blob = new Blob([JSON.stringify(state.currentData, null, 2)], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const fileName = document.getElementById('file-name').textContent || 'ontology';
  a.download = fileName.replace(/\.json$/i, '') + '-for-oaa.json';
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Exports a subgraph (selected nodes + edges) as OAA-compatible JSON-LD.
 * @param {Object} ontologyData - Raw ontology JSON (state.currentData)
 * @param {Set} nodeIds - Selected node IDs
 * @param {Set} edgeIds - Selected edge IDs (unused for filtering — edges are derived from entities)
 * @returns {string} JSON string of the subgraph
 */
export function exportSubgraph(ontologyData, nodeIds, edgeIds) {
  if (!ontologyData || !nodeIds || nodeIds.size === 0) return '{}';
  const copy = JSON.parse(JSON.stringify(ontologyData));

  // Filter entities to only selected nodes
  const entities = copy.entities || copy.hasDefinedTerm || (copy.ontologyDefinition && copy.ontologyDefinition.entities) || [];
  const filtered = entities.filter(e => {
    const id = e['@id'] || e.id || e.name;
    return nodeIds.has(id);
  });

  if (copy.entities) copy.entities = filtered;
  else if (copy.hasDefinedTerm) copy.hasDefinedTerm = filtered;
  else if (copy.ontologyDefinition) copy.ontologyDefinition.entities = filtered;

  // Filter relationships to only those between selected entities
  const selectedSet = new Set(filtered.map(e => e['@id'] || e.id || e.name));
  const rels = copy.relationships || (copy.ontologyDefinition && copy.ontologyDefinition.relationships) || [];
  const filteredRels = rels.filter(r => {
    const domain = r.domainIncludes || [];
    const range = r.rangeIncludes || [];
    return domain.some(d => selectedSet.has(d)) && range.some(rr => selectedSet.has(rr));
  });

  if (copy.relationships) copy.relationships = filteredRels;
  else if (copy.ontologyDefinition) copy.ontologyDefinition.relationships = filteredRels;

  return JSON.stringify(copy, null, 2);
}

// ========================================
// DS DESIGN-DIRECTOR EXPORT (S7.6.8)
// ========================================

/**
 * Export page/template definitions with resolved token values as JSON
 * for Design-Director consumption.
 *
 * @param {Object} parsed - DS instance parsed data (from parseDSInstance)
 * @param {string} brand - Brand key
 * @param {Object} options - { includeTokens: boolean }
 * @returns {string} JSON string
 */
export function exportDSForDesignDirector(parsed, brand, options = {}) {
  if (!parsed) return '{}';

  const pages = parsed.pages || [];
  const templates = parsed.templates || [];

  const tokenIndex = options.includeTokens !== false ? buildTokenIndex(parsed) : undefined;

  const output = {
    '@context': { ds: 'https://platformcore.io/ontology/ds/' },
    '@type': 'DesignDirectorExport',
    exportedAt: new Date().toISOString(),
    brand,
    dsVersion: parsed.designSystem?.['ds:version'] || '0.0.0',
    dsName: parsed.designSystem?.['ds:name'] || '',
    pages: pages.map(p => ({
      ...p,
      _resolvedSlots: _resolvePageSlots(p, tokenIndex),
    })),
    templates: templates.map(t => ({ ...t })),
    componentCount: parsed.components.length,
    tokenIndex,
  };

  return JSON.stringify(output, null, 2);
}

/**
 * Build a flat token index: tokenName -> resolved value.
 */
export function buildTokenIndex(parsed) {
  const index = {};

  // Pass 1: Primitives — name → raw value
  for (const tok of parsed.primitives) {
    const name = tok['ds:tokenName'];
    if (name) index[name] = tok['ds:value'] || '';
  }

  // Pass 1b: Semantics — name → lightModeValue (already resolved to primitive value)
  // Also build @id → value lookup for pass 2 resolution
  const semanticById = new Map();
  for (const tok of parsed.semantics) {
    const name = tok['ds:tokenName'];
    const value = tok['ds:lightModeValue'] || '';
    if (name) index[name] = value;
    semanticById.set(tok['@id'], value);
  }

  // Pass 2: ComponentTokens — resolve through semantic reference to final value
  for (const tok of parsed.components) {
    if (tok['@type'] !== 'ds:ComponentToken') continue;
    const name = tok['ds:tokenName'];
    const ref = tok['ds:referencesToken'] || tok['ds:referencesSemanticToken'];
    const refId = typeof ref === 'string' ? ref : ref?.['@id'] || '';
    // Resolve to semantic value (which is already resolved to primitive)
    const resolved = semanticById.get(refId) || index[refId] || refId;
    if (name) index[name] = resolved;
  }

  return index;
}

/**
 * Download the DS bundle as a .ds-bundle.json file. (S7.6.8)
 * @param {Object} parsed - Output from parseDSInstance()
 * @param {string} brand - Active brand name
 */
export function downloadDSBundle(parsed, brand) {
  const json = exportDSForDesignDirector(parsed, brand);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${brand}-ds-bundle.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Resolve component slot token references to concrete values.
 */
function _resolvePageSlots(page, tokenIndex) {
  if (!page['ds:componentSlots'] || !tokenIndex) return [];
  try {
    const slots = JSON.parse(page['ds:componentSlots']);
    return slots.map(slot => ({
      ...slot,
      _resolvedTokens: slot.tokens ? Object.fromEntries(
        Object.entries(slot.tokens).map(([k, v]) => [k, tokenIndex[v] || v])
      ) : undefined,
    }));
  } catch {
    return [];
  }
}
