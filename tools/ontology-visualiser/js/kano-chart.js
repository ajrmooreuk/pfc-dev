/**
 * kano-chart.js — Kano Analysis Visualisation Module (F49.11)
 *
 * Renders four Kano-specific visualisations from KANO-ONT instance data:
 *   V1: Satisfaction Curves (SVG)
 *   V2: Feature Priority Matrix (2×2 quadrant, DOM)
 *   V3: Segment Heatmap (DOM table)
 *   V4: Decay Timeline (SVG)
 *
 * Plus: Mermaid quadrant export, JSON export schema.
 *
 * Zero external dependencies — SVG/DOM rendering only.
 * Follows PFC zero-build-step architecture.
 */

import { state } from './state.js';

// ─── Kano Category Constants ────────────────────────────────────────────────

export const KANO_CATEGORIES = ['MustBe', 'Performance', 'Attractive', 'Indifferent', 'Reverse'];

export const KANO_CATEGORY_LABELS = {
  MustBe: 'Must-Be',
  Performance: 'Performance',
  Attractive: 'Attractive',
  Indifferent: 'Indifferent',
  Reverse: 'Reverse',
};

/**
 * Resolve Kano category colour from CSS custom property or fallback.
 */
export function getKanoCategoryColor(category) {
  const cssMap = {
    MustBe: '--viz-kano-must-be',
    Performance: '--viz-kano-performance',
    Attractive: '--viz-kano-attractive',
    Indifferent: '--viz-kano-indifferent',
    Reverse: '--viz-kano-reverse',
  };
  const fallbackMap = {
    MustBe: '#E53935',
    Performance: '#1E88E5',
    Attractive: '#43A047',
    Indifferent: '#757575',
    Reverse: '#FB8C00',
  };
  const prop = cssMap[category];
  if (prop && typeof getComputedStyle !== 'undefined') {
    const val = getComputedStyle(document.documentElement).getPropertyValue(prop).trim();
    if (val) return val;
  }
  return fallbackMap[category] || '#757575';
}

// ─── Data Extraction from KANO-ONT Graph ────────────────────────────────────

/**
 * Extract Kano entities from a loaded ontology graph.
 * Looks for kano: prefixed types in the merged graph nodes.
 */
export function extractKanoData(graphData) {
  if (!graphData) return null;

  const nodes = graphData.nodes || graphData['@graph'] || [];
  const result = {
    classifications: [],
    curves: [],
    decays: [],
    priorities: [],
    surveys: [],
    questions: [],
  };

  for (const node of nodes) {
    const type = node['@type'] || node.type || '';
    if (type.includes('KanoClassification')) result.classifications.push(node);
    else if (type.includes('SatisfactionCurve')) result.curves.push(node);
    else if (type.includes('KanoDecay')) result.decays.push(node);
    else if (type.includes('FeaturePriority')) result.priorities.push(node);
    else if (type.includes('KanoSurvey')) result.surveys.push(node);
    else if (type.includes('KanoQuestion')) result.questions.push(node);
  }

  return result;
}

// ─── V1: Satisfaction Curve Chart (SVG) ─────────────────────────────────────

/**
 * Curve functions for each Kano category.
 * x: 0-1 (implementation level), returns y: -1 to 1 (satisfaction).
 */
const CURVE_FUNCTIONS = {
  MustBe:      x => -1 + (1 / (1 + Math.exp(-10 * (x - 0.3)))),  // asymptotic
  Performance: x => 2 * x - 1,                                      // linear
  Attractive:  x => Math.pow(x, 2.5) * 2 - 0.1,                    // exponential
  Indifferent: () => 0,                                               // flat
  Reverse:     x => 0.5 - x,                                         // inverse
};

/**
 * Render Kano satisfaction curves as an SVG element.
 *
 * @param {Object} kanoData - Output from extractKanoData()
 * @param {Object} [options] - width, height, showFeatures, showLegend
 * @returns {SVGElement} The rendered SVG element
 */
export function renderKanoCurves(kanoData, options = {}) {
  const {
    width = 500,
    height = 400,
    showFeatures = true,
    showLegend = true,
  } = options;

  const pad = { top: 30, right: 20, bottom: 40, left: 50 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;
  const midY = pad.top + plotH / 2;

  const svg = _svgEl('svg', { width, height, viewBox: `0 0 ${width} ${height}` });
  svg.style.fontFamily = 'monospace';
  svg.style.fontSize = '11px';

  // Background
  svg.appendChild(_svgEl('rect', { x: 0, y: 0, width, height, fill: 'var(--viz-surface-card, #22252f)', rx: 6 }));

  // Axes
  const axisColor = 'var(--viz-text-muted, #666)';
  // X axis (centre)
  svg.appendChild(_svgEl('line', { x1: pad.left, y1: midY, x2: pad.left + plotW, y2: midY, stroke: axisColor, 'stroke-width': 1 }));
  // Y axis
  svg.appendChild(_svgEl('line', { x1: pad.left, y1: pad.top, x2: pad.left, y2: pad.top + plotH, stroke: axisColor, 'stroke-width': 1 }));

  // Labels
  svg.appendChild(_svgText(pad.left + plotW / 2, height - 8, 'Feature Implementation →', { fill: 'var(--viz-text-secondary, #888)', 'text-anchor': 'middle', 'font-size': '10px' }));
  svg.appendChild(_svgText(12, midY - plotH / 2 + 10, 'Satisfaction ▲', { fill: 'var(--viz-text-secondary, #888)', 'font-size': '10px' }));
  svg.appendChild(_svgText(12, midY + plotH / 2 - 5, 'Dissatisfaction ▼', { fill: 'var(--viz-text-secondary, #888)', 'font-size': '10px' }));

  // Draw curves
  for (const cat of KANO_CATEGORIES) {
    const fn = CURVE_FUNCTIONS[cat];
    const color = getKanoCategoryColor(cat);
    const points = [];
    const steps = 60;
    for (let i = 0; i <= steps; i++) {
      const x = i / steps;
      const y = fn(x);
      const px = pad.left + x * plotW;
      const py = midY - y * (plotH / 2);
      points.push(`${px},${py}`);
    }
    const polyline = _svgEl('polyline', {
      points: points.join(' '),
      fill: 'none',
      stroke: color,
      'stroke-width': 2,
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
    });
    svg.appendChild(polyline);
  }

  // Plot feature dots on curves
  if (showFeatures && kanoData?.classifications) {
    for (const cls of kanoData.classifications) {
      const cat = cls['kano:category'] || cls.category;
      const impl = parseFloat(cls['kano:implementationLevel'] || cls.implementationLevel || 0.5);
      const fn = CURVE_FUNCTIONS[cat];
      if (!fn) continue;
      const y = fn(impl);
      const px = pad.left + impl * plotW;
      const py = midY - y * (plotH / 2);
      const color = getKanoCategoryColor(cat);
      const dot = _svgEl('circle', { cx: px, cy: py, r: 5, fill: color, stroke: '#fff', 'stroke-width': 1.5, cursor: 'pointer' });
      const label = cls['kano:featureRef'] || cls.featureRef || '';
      if (label) {
        const title = _svgEl('title');
        title.textContent = `${label} (${KANO_CATEGORY_LABELS[cat] || cat}, impl: ${Math.round(impl * 100)}%)`;
        dot.appendChild(title);
      }
      svg.appendChild(dot);
    }
  }

  // Legend
  if (showLegend) {
    let ly = pad.top + 5;
    for (const cat of KANO_CATEGORIES) {
      const color = getKanoCategoryColor(cat);
      svg.appendChild(_svgEl('rect', { x: pad.left + plotW - 115, y: ly, width: 10, height: 10, fill: color, rx: 2 }));
      svg.appendChild(_svgText(pad.left + plotW - 100, ly + 9, KANO_CATEGORY_LABELS[cat], { fill: 'var(--viz-text-primary, #e0e0e0)', 'font-size': '10px' }));
      ly += 16;
    }
  }

  return svg;
}

// ─── V2: Feature Priority Matrix (2×2 Quadrant) ─────────────────────────────

/**
 * Render a 2×2 feature priority matrix.
 * X-axis: implementation cost, Y-axis: satisfaction impact.
 *
 * @param {Object} kanoData - Output from extractKanoData()
 * @param {Object} [options] - width, height
 * @returns {HTMLElement} A DOM container with the matrix
 */
export function renderPriorityMatrix(kanoData, options = {}) {
  const { width = 500, height = 400 } = options;

  const container = document.createElement('div');
  container.className = 'kano-priority-matrix';
  container.style.cssText = `width:${width}px; height:${height}px; display:grid; grid-template-columns:1fr 1fr; grid-template-rows:auto 1fr 1fr auto; gap:2px; background:var(--viz-surface-card,#22252f); border-radius:6px; padding:8px; font-family:monospace; font-size:11px; color:var(--viz-text-primary,#e0e0e0);`;

  // Header
  const header = document.createElement('div');
  header.style.cssText = 'grid-column:1/3; text-align:center; font-weight:bold; padding:4px;';
  header.textContent = 'Feature Priority Matrix';
  container.appendChild(header);

  const quadrants = [
    { label: 'QUICK WINS', desc: 'High Impact · Low Cost', icon: '★', bg: 'rgba(67,160,71,0.15)', border: 'var(--viz-kano-attractive,#43A047)' },
    { label: 'STRATEGIC', desc: 'High Impact · High Cost', icon: '◆', bg: 'rgba(30,136,229,0.15)', border: 'var(--viz-kano-performance,#1E88E5)' },
    { label: 'NICE-TO-HAVE', desc: 'Low Impact · Low Cost', icon: '○', bg: 'rgba(117,117,117,0.15)', border: 'var(--viz-kano-indifferent,#757575)' },
    { label: 'ELIMINATE', desc: 'Low Impact · High Cost', icon: '✕', bg: 'rgba(251,140,0,0.15)', border: 'var(--viz-kano-reverse,#FB8C00)' },
  ];

  // Classify features into quadrants
  const buckets = [[], [], [], []]; // quick-win, strategic, nice-to-have, eliminate
  if (kanoData?.priorities) {
    for (const p of kanoData.priorities) {
      const rec = p['kano:investmentRecommendation'] || p.investmentRecommendation || '';
      const name = p['kano:featureRef'] || p.featureRef || p['@id'] || '?';
      const rank = p['kano:priorityRank'] || p.priorityRank || 0;
      if (rec === 'Invest') buckets[0].push({ name, rank });
      else if (rec === 'Maintain') buckets[1].push({ name, rank });
      else if (rec === 'Deprioritise') buckets[2].push({ name, rank });
      else if (rec === 'Eliminate') buckets[3].push({ name, rank });
      else buckets[2].push({ name, rank }); // default
    }
  }

  quadrants.forEach((q, i) => {
    const cell = document.createElement('div');
    cell.style.cssText = `background:${q.bg}; border:1px solid ${q.border}; border-radius:4px; padding:8px; overflow:auto;`;
    const title = document.createElement('div');
    title.style.cssText = 'font-weight:bold; margin-bottom:4px;';
    title.textContent = `${q.icon} ${q.label}`;
    cell.appendChild(title);
    const desc = document.createElement('div');
    desc.style.cssText = 'font-size:9px; color:var(--viz-text-muted,#666); margin-bottom:6px;';
    desc.textContent = q.desc;
    cell.appendChild(desc);
    for (const f of buckets[i]) {
      const badge = document.createElement('span');
      badge.style.cssText = `display:inline-block; background:var(--viz-surface-subtle,#2a2d37); border-radius:3px; padding:2px 6px; margin:2px; font-size:10px; border:1px solid ${q.border};`;
      badge.textContent = f.name;
      cell.appendChild(badge);
    }
    container.appendChild(cell);
  });

  // Footer axis labels
  const footer = document.createElement('div');
  footer.style.cssText = 'grid-column:1/3; display:flex; justify-content:space-between; font-size:9px; color:var(--viz-text-muted,#666); padding:2px 4px;';
  footer.innerHTML = '<span>← Low Cost</span><span>High Cost →</span>';
  container.appendChild(footer);

  return container;
}

// ─── V3: Segment Heatmap ────────────────────────────────────────────────────

/**
 * Render a Features × Segments heatmap with Kano category cell colours.
 *
 * @param {Object} kanoData - Output from extractKanoData()
 * @param {Object} [options] - width
 * @returns {HTMLElement} A DOM table element
 */
export function renderSegmentHeatmap(kanoData, options = {}) {
  const container = document.createElement('div');
  container.className = 'kano-segment-heatmap';
  container.style.cssText = 'font-family:monospace; font-size:11px; overflow-x:auto;';

  if (!kanoData?.classifications || kanoData.classifications.length === 0) {
    container.textContent = 'No Kano classification data available';
    return container;
  }

  // Group by feature and segment
  const featureSegmentMap = new Map(); // featureRef -> Map(segment -> category)
  const segments = new Set();
  for (const cls of kanoData.classifications) {
    const feature = cls['kano:featureRef'] || cls.featureRef || cls['@id'] || '?';
    const segment = cls['kano:segmentRef'] || cls.segmentRef || 'All';
    const category = cls['kano:category'] || cls.category || 'Indifferent';
    segments.add(segment);
    if (!featureSegmentMap.has(feature)) featureSegmentMap.set(feature, new Map());
    featureSegmentMap.get(feature).set(segment, category);
  }

  const segList = [...segments].sort();
  const table = document.createElement('table');
  table.style.cssText = 'border-collapse:collapse; width:100%;';

  // Header row
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  const thFeature = document.createElement('th');
  thFeature.style.cssText = 'padding:6px 8px; text-align:left; border-bottom:1px solid var(--viz-border-default,#2a2d37); color:var(--viz-text-primary,#e0e0e0);';
  thFeature.textContent = 'Feature';
  headerRow.appendChild(thFeature);
  for (const seg of segList) {
    const th = document.createElement('th');
    th.style.cssText = 'padding:6px 8px; text-align:center; border-bottom:1px solid var(--viz-border-default,#2a2d37); color:var(--viz-text-primary,#e0e0e0); min-width:80px;';
    th.textContent = seg;
    headerRow.appendChild(th);
  }
  thead.appendChild(headerRow);
  table.appendChild(thead);

  // Body rows
  const tbody = document.createElement('tbody');
  for (const [feature, segMap] of featureSegmentMap) {
    const tr = document.createElement('tr');
    const tdName = document.createElement('td');
    tdName.style.cssText = 'padding:6px 8px; border-bottom:1px solid var(--viz-border-subtle,#3a3d47); color:var(--viz-text-primary,#e0e0e0); white-space:nowrap;';
    tdName.textContent = feature;
    tr.appendChild(tdName);
    for (const seg of segList) {
      const cat = segMap.get(seg) || '';
      const td = document.createElement('td');
      const color = cat ? getKanoCategoryColor(cat) : 'transparent';
      td.style.cssText = `padding:6px 8px; text-align:center; border-bottom:1px solid var(--viz-border-subtle,#3a3d47); background:${color}22; color:${color}; font-weight:bold; font-size:10px;`;
      td.textContent = cat ? (KANO_CATEGORY_LABELS[cat] || cat) : '—';
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);
  container.appendChild(table);
  return container;
}

// ─── V4: Decay Timeline (SVG) ──────────────────────────────────────────────

/**
 * Render decay timelines showing category migration over time.
 *
 * @param {Object} kanoData - Output from extractKanoData()
 * @param {Object} [options] - width, height
 * @returns {SVGElement} The rendered SVG element
 */
export function renderDecayTimeline(kanoData, options = {}) {
  const { width = 500, height: requestedHeight } = options;
  const decays = kanoData?.decays || [];
  const rowHeight = 60;
  const pad = { top: 30, right: 20, bottom: 20, left: 140 };
  const height = requestedHeight || Math.max(150, pad.top + decays.length * rowHeight + pad.bottom);
  const plotW = width - pad.left - pad.right;

  const svg = _svgEl('svg', { width, height, viewBox: `0 0 ${width} ${height}` });
  svg.style.fontFamily = 'monospace';
  svg.style.fontSize = '11px';

  svg.appendChild(_svgEl('rect', { x: 0, y: 0, width, height, fill: 'var(--viz-surface-card, #22252f)', rx: 6 }));

  if (decays.length === 0) {
    svg.appendChild(_svgText(width / 2, height / 2, 'No decay data available', { fill: 'var(--viz-text-muted,#666)', 'text-anchor': 'middle' }));
    return svg;
  }

  // Find max months for scale
  const maxMonths = Math.max(...decays.map(d => parseFloat(d['kano:decayPeriodMonths'] || d.decayPeriodMonths || 12)), 24);

  // Header
  svg.appendChild(_svgText(width / 2, 18, 'Category Decay Timeline', { fill: 'var(--viz-text-primary,#e0e0e0)', 'text-anchor': 'middle', 'font-weight': 'bold' }));

  // Time axis ticks
  const ticks = [0, 6, 12, 18, 24].filter(t => t <= maxMonths);
  for (const t of ticks) {
    const x = pad.left + (t / maxMonths) * plotW;
    svg.appendChild(_svgEl('line', { x1: x, y1: pad.top, x2: x, y2: height - pad.bottom, stroke: 'var(--viz-border-subtle,#3a3d47)', 'stroke-width': 0.5 }));
    svg.appendChild(_svgText(x, height - 5, `${t}mo`, { fill: 'var(--viz-text-muted,#666)', 'text-anchor': 'middle', 'font-size': '9px' }));
  }

  // Rows
  decays.forEach((decay, i) => {
    const y = pad.top + i * rowHeight + rowHeight / 2;
    const feature = decay['kano:featureRef'] || decay.featureRef || '?';
    const from = decay['kano:fromCategory'] || decay.fromCategory || 'Attractive';
    const to = decay['kano:toCategory'] || decay.toCategory || 'Performance';
    const months = parseFloat(decay['kano:decayPeriodMonths'] || decay.decayPeriodMonths || 12);
    const pressure = decay['kano:competitivePressure'] || decay.competitivePressure || 'Medium';

    // Feature label
    svg.appendChild(_svgText(pad.left - 8, y + 4, feature, { fill: 'var(--viz-text-primary,#e0e0e0)', 'text-anchor': 'end', 'font-size': '10px' }));

    // Gradient bar from->to
    const fromColor = getKanoCategoryColor(from);
    const toColor = getKanoCategoryColor(to);
    const barEnd = pad.left + (months / maxMonths) * plotW;

    // Create gradient
    const gradId = `kano-decay-grad-${i}`;
    const defs = _svgEl('defs');
    const grad = _svgEl('linearGradient', { id: gradId, x1: '0%', y1: '0%', x2: '100%', y2: '0%' });
    grad.appendChild(_svgEl('stop', { offset: '0%', 'stop-color': fromColor }));
    grad.appendChild(_svgEl('stop', { offset: '100%', 'stop-color': toColor }));
    defs.appendChild(grad);
    svg.appendChild(defs);

    svg.appendChild(_svgEl('rect', { x: pad.left, y: y - 10, width: barEnd - pad.left, height: 20, fill: `url(#${gradId})`, rx: 4, opacity: 0.7 }));

    // Category labels on bar
    svg.appendChild(_svgText(pad.left + 4, y + 3, KANO_CATEGORY_LABELS[from] || from, { fill: '#fff', 'font-size': '9px', 'font-weight': 'bold' }));
    svg.appendChild(_svgText(barEnd - 4, y + 3, KANO_CATEGORY_LABELS[to] || to, { fill: '#fff', 'font-size': '9px', 'text-anchor': 'end', 'font-weight': 'bold' }));

    // Competitive pressure marker
    if (pressure === 'High') {
      const midX = pad.left + (months / maxMonths / 2) * plotW;
      svg.appendChild(_svgEl('circle', { cx: midX, cy: y - 16, r: 3, fill: 'var(--viz-kano-reverse,#FB8C00)' }));
      svg.appendChild(_svgText(midX + 6, y - 13, '⚠ High pressure', { fill: 'var(--viz-kano-reverse,#FB8C00)', 'font-size': '8px' }));
    }
  });

  return svg;
}

// ─── Mermaid Export ─────────────────────────────────────────────────────────

/**
 * Export Kano priority data as a Mermaid quadrant chart.
 *
 * @param {Object} kanoData - Output from extractKanoData()
 * @returns {string} Mermaid diagram source
 */
export function exportKanoMermaid(kanoData) {
  const lines = [
    'quadrantChart',
    '    title Feature Priority (Kano)',
    '    x-axis "Low Cost" --> "High Cost"',
    '    y-axis "Low Impact" --> "High Impact"',
  ];

  if (kanoData?.priorities) {
    for (const p of kanoData.priorities) {
      const name = (p['kano:featureRef'] || p.featureRef || p['@id'] || 'Feature').replace(/[[\]"]/g, '');
      const rec = p['kano:investmentRecommendation'] || p.investmentRecommendation || 'Maintain';
      const wtp = parseFloat(p['kano:wtpElasticity'] || p.wtpElasticity || 0.5);
      // Map to quadrant coordinates
      let x, y;
      if (rec === 'Invest')        { x = 0.25; y = 0.75; }
      else if (rec === 'Maintain') { x = 0.75; y = 0.75; }
      else if (rec === 'Deprioritise') { x = 0.25; y = 0.25; }
      else                         { x = 0.75; y = 0.25; }
      // Add some jitter based on wtp
      x += (wtp - 0.5) * 0.2;
      y += (wtp - 0.5) * 0.15;
      lines.push(`    "${name}": [${x.toFixed(2)}, ${y.toFixed(2)}]`);
    }
  }

  return lines.join('\n');
}

/**
 * Export Kano data as a JSON schema suitable for PFI product apps (Tier 3).
 *
 * @param {Object} kanoData - Output from extractKanoData()
 * @returns {Object} Simplified JSON for downstream consumption
 */
export function exportKanoJSON(kanoData) {
  return {
    schemaVersion: '1.0.0',
    generatedAt: new Date().toISOString(),
    generator: 'kano-chart.js',
    categories: KANO_CATEGORIES.map(cat => ({
      id: cat,
      label: KANO_CATEGORY_LABELS[cat],
      color: getKanoCategoryColor(cat),
    })),
    classifications: (kanoData?.classifications || []).map(c => ({
      feature: c['kano:featureRef'] || c.featureRef || c['@id'],
      category: c['kano:category'] || c.category,
      confidence: parseFloat(c['kano:confidence'] || c.confidence || 0),
      segment: c['kano:segmentRef'] || c.segmentRef || null,
    })),
    priorities: (kanoData?.priorities || []).map(p => ({
      feature: p['kano:featureRef'] || p.featureRef || p['@id'],
      rank: parseInt(p['kano:priorityRank'] || p.priorityRank || 0),
      recommendation: p['kano:investmentRecommendation'] || p.investmentRecommendation || null,
      wtpElasticity: parseFloat(p['kano:wtpElasticity'] || p.wtpElasticity || 0),
    })),
    decays: (kanoData?.decays || []).map(d => ({
      feature: d['kano:featureRef'] || d.featureRef || d['@id'],
      from: d['kano:fromCategory'] || d.fromCategory,
      to: d['kano:toCategory'] || d.toCategory,
      months: parseFloat(d['kano:decayPeriodMonths'] || d.decayPeriodMonths || 0),
      pressure: d['kano:competitivePressure'] || d.competitivePressure || 'Medium',
    })),
  };
}

// ─── Z9 Sidebar Tab Rendering ───────────────────────────────────────────────

/**
 * Render the Kano tab content for the Z9 sidebar.
 * Calls V1-V4 renderers and assembles them into a scrollable panel.
 *
 * @param {Object} kanoData - Output from extractKanoData()
 * @param {HTMLElement} container - The tab-kano div
 */
export function renderKanoTab(kanoData, container) {
  container.innerHTML = '';

  if (!kanoData || (!kanoData.classifications.length && !kanoData.priorities.length && !kanoData.decays.length)) {
    container.innerHTML = '<p style="color:var(--viz-text-muted,#666); padding:16px;">No Kano data loaded. Load a KANO-ONT instance to see analysis.</p>';
    return;
  }

  container.style.cssText = 'overflow-y:auto; padding:8px;';

  // Section helper
  const section = (title) => {
    const h = document.createElement('h4');
    h.style.cssText = 'color:var(--viz-text-primary,#e0e0e0); margin:12px 0 6px 0; padding-bottom:4px; border-bottom:1px solid var(--viz-border-subtle,#3a3d47); font-size:12px;';
    h.textContent = title;
    return h;
  };

  // V1: Curves
  if (kanoData.classifications.length > 0 || kanoData.curves.length > 0) {
    container.appendChild(section('Satisfaction Curves'));
    const curvesSvg = renderKanoCurves(kanoData, { width: 340, height: 260, showLegend: true });
    container.appendChild(curvesSvg);
  }

  // V2: Priority Matrix
  if (kanoData.priorities.length > 0) {
    container.appendChild(section('Investment Priority'));
    const matrix = renderPriorityMatrix(kanoData, { width: 340, height: 280 });
    container.appendChild(matrix);
  }

  // V3: Segment Heatmap
  if (kanoData.classifications.length > 0) {
    container.appendChild(section('Segment Heatmap'));
    const heatmap = renderSegmentHeatmap(kanoData, { width: 340 });
    container.appendChild(heatmap);
  }

  // V4: Decay Timeline
  if (kanoData.decays.length > 0) {
    container.appendChild(section('Category Decay'));
    const timeline = renderDecayTimeline(kanoData, { width: 340 });
    container.appendChild(timeline);
  }
}

// ─── SVG Helpers ────────────────────────────────────────────────────────────

function _svgEl(tag, attrs = {}) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v !== null && v !== undefined) el.setAttribute(k, v);
  }
  return el;
}

function _svgText(x, y, text, attrs = {}) {
  const el = _svgEl('text', { x, y, ...attrs });
  el.textContent = text;
  return el;
}
