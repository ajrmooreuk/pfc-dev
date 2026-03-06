/**
 * Mermaid Viewer module — CDN loading, diagram parsing, rendering, zoom/pan.
 * Epic 9F: Native Mermaid.js rendering as a new view mode.
 */

import { state } from './state.js';

// --- CDN Lazy Loading ---

let mermaidLib = null;
let mermaidLoading = null;

export async function initMermaid() {
  if (mermaidLib) return mermaidLib;
  if (mermaidLoading) return mermaidLoading;

  mermaidLoading = import('https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs')
    .then(mod => {
      mermaidLib = mod.default;
      mermaidLib.initialize({
        startOnLoad: false,
        theme: 'dark',
        themeVariables: {
          primaryColor: '#017c75',
          primaryTextColor: '#e0e0e0',
          primaryBorderColor: '#2a2d37',
          lineColor: '#888',
          secondaryColor: '#1a1d27',
          tertiaryColor: '#22252f',
          background: '#0f1117',
          mainBkg: '#1a1d27',
          nodeBorder: '#3a3d47',
          clusterBkg: '#22252f',
          titleColor: '#e0e0e0',
          edgeLabelBackground: '#1a1d27',
        },
        securityLevel: 'loose',
        flowchart: { htmlLabels: true, curve: 'basis' },
      });
      return mermaidLib;
    })
    .catch(err => {
      mermaidLoading = null;
      throw new Error('Failed to load Mermaid library from CDN: ' + err.message);
    });

  return mermaidLoading;
}

// --- Multi-Diagram File Parsing ---

export function detectDiagramType(source) {
  const firstLine = source.split('\n')[0].trim().toLowerCase();
  if (firstLine.startsWith('flowchart') || firstLine.startsWith('graph')) return 'flowchart';
  if (firstLine.startsWith('sequencediagram')) return 'sequence';
  if (firstLine.startsWith('statediagram')) return 'state';
  if (firstLine.startsWith('gantt')) return 'gantt';
  if (firstLine.startsWith('classdiagram')) return 'classDiagram';
  if (firstLine.startsWith('pie')) return 'pie';
  if (firstLine.startsWith('erdiagram')) return 'er';
  if (firstLine.startsWith('journey')) return 'journey';
  if (firstLine.startsWith('gitgraph')) return 'gitgraph';
  return 'unknown';
}

export function parseMermaidFile(text) {
  if (!text || !text.trim()) return [];

  const diagrams = [];
  const fenceRegex = /```mermaid\s*\n([\s\S]*?)```/g;

  let match;
  const fences = [];
  while ((match = fenceRegex.exec(text)) !== null) {
    fences.push({ start: match.index, end: match.index + match[0].length, source: match[1].trim() });
  }

  if (fences.length > 0) {
    // Multi-diagram file: find headings before each fence
    const headingRegex = /^#{1,3}\s+(.+)$/gm;
    for (const fence of fences) {
      const textBefore = text.substring(0, fence.start);
      const headings = [...textBefore.matchAll(headingRegex)];
      const title = headings.length > 0 ? headings[headings.length - 1][1].trim() : `Diagram ${diagrams.length + 1}`;
      const type = detectDiagramType(fence.source);
      diagrams.push({ title, type, source: fence.source });
    }
  } else {
    // Single raw diagram (no fences)
    const trimmed = text.trim();
    const type = detectDiagramType(trimmed);
    diagrams.push({ title: 'Diagram', type, source: trimmed });
  }

  return diagrams;
}

// --- Rendering ---

let renderCounter = 0;

export async function renderMermaidDiagram(source, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return { error: 'Container not found' };

  try {
    const mermaid = await initMermaid();
    renderCounter++;
    const id = `mermaid-svg-${renderCounter}`;
    const { svg } = await mermaid.render(id, source);
    container.innerHTML = svg;
    return { success: true };
  } catch (err) {
    container.innerHTML = '';
    return { error: err.message || String(err) };
  }
}

// --- Tab Bar Rendering ---

export function renderDiagramTabs(diagrams, activeIndex, onTabClick) {
  const tabContainer = document.getElementById('mermaid-diagram-tabs');
  if (!tabContainer) return;

  if (diagrams.length <= 1) {
    tabContainer.style.display = 'none';
    return;
  }

  tabContainer.style.display = 'flex';
  tabContainer.innerHTML = diagrams.map((d, i) => {
    const active = i === activeIndex ? ' active' : '';
    const typeLabel = d.type !== 'unknown' ? ` (${d.type})` : '';
    return `<button class="mermaid-tab${active}" data-index="${i}">${escHtml(d.title)}${typeLabel}</button>`;
  }).join('');

  tabContainer.querySelectorAll('.mermaid-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.index, 10);
      if (onTabClick) onTabClick(idx);
    });
  });
}

function escHtml(str) {
  return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// --- Zoom & Pan ---

let zoomLevel = 1;
let panX = 0;
let panY = 0;
let isPanning = false;
let panStartX = 0;
let panStartY = 0;

export function initZoomPan(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  zoomLevel = 1;
  panX = 0;
  panY = 0;

  container.addEventListener('wheel', e => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    zoomLevel = Math.max(0.2, Math.min(5, zoomLevel + delta));
    applyTransform(container);
  }, { passive: false });

  container.addEventListener('mousedown', e => {
    if (e.button !== 0) return;
    isPanning = true;
    panStartX = e.clientX - panX;
    panStartY = e.clientY - panY;
    container.style.cursor = 'grabbing';
  });

  container.addEventListener('mousemove', e => {
    if (!isPanning) return;
    panX = e.clientX - panStartX;
    panY = e.clientY - panStartY;
    applyTransform(container);
  });

  container.addEventListener('mouseup', () => {
    isPanning = false;
    container.style.cursor = 'grab';
  });

  container.addEventListener('mouseleave', () => {
    isPanning = false;
    container.style.cursor = 'grab';
  });

  container.style.cursor = 'grab';
}

function applyTransform(container) {
  const svg = container.querySelector('svg');
  if (svg) {
    svg.style.transform = `translate(${panX}px, ${panY}px) scale(${zoomLevel})`;
    svg.style.transformOrigin = 'center center';
  }
}

export function fitMermaidDiagram(containerId) {
  zoomLevel = 1;
  panX = 0;
  panY = 0;
  const container = document.getElementById(containerId);
  if (container) applyTransform(container);
}

// --- Mode Switching ---

export function switchToMermaidMode() {
  const network = document.getElementById('network');
  const mermaidContainer = document.getElementById('mermaid-container');
  const dropZone = document.getElementById('drop-zone');
  const mindmapContainer = document.getElementById('mindmap-container');

  if (network) network.style.display = 'none';
  if (mermaidContainer) mermaidContainer.style.display = 'flex';
  if (dropZone) dropZone.style.display = 'none';
  if (mindmapContainer) mindmapContainer.style.display = 'none';

  state.activeView = 'mermaid';
  state.mermaidMode = true;

  // Show/hide mermaid drop-zone based on whether a diagram is loaded
  const mermaidDropZone = document.getElementById('mermaid-drop-zone');
  if (mermaidDropZone) {
    const hasDiagram = state.mermaidDiagrams && state.mermaidDiagrams.length > 0;
    mermaidDropZone.classList.toggle('hidden', hasDiagram);
  }
}

export function switchToOntologyMode() {
  const network = document.getElementById('network');
  const mermaidContainer = document.getElementById('mermaid-container');
  const mindmapContainer = document.getElementById('mindmap-container');
  const skeletonContainer = document.getElementById('skeleton-graph-container');

  const dtContainer = document.getElementById('decision-tree-container');
  const rbContainer = document.getElementById('registry-browser-container');

  if (network) network.style.display = 'block';
  if (mermaidContainer) mermaidContainer.style.display = 'none';
  if (mindmapContainer) mindmapContainer.style.display = 'none';
  if (skeletonContainer) skeletonContainer.style.display = 'none';
  if (dtContainer) dtContainer.style.display = 'none';
  if (rbContainer) rbContainer.style.display = 'none';

  state.activeView = 'graph';
  state.mermaidMode = false;

  // Close editor panel if open
  const editorPanel = document.getElementById('mermaid-editor-panel');
  if (editorPanel) editorPanel.classList.remove('open');
  state.mermaidEditorOpen = false;
}

// --- Full Load Pipeline ---

export async function loadAndRenderMermaid(text, fileName) {
  state.mermaidSource = text;
  state.mermaidFileName = fileName;

  const diagrams = parseMermaidFile(text);
  state.mermaidDiagrams = diagrams;
  state.mermaidActiveDiagram = 0;

  if (!diagrams.length) {
    return { error: 'No diagrams found in file' };
  }

  switchToMermaidMode();

  // Render tabs
  renderDiagramTabs(diagrams, 0, async (idx) => {
    state.mermaidActiveDiagram = idx;
    renderDiagramTabs(diagrams, idx, null); // re-render tabs reattaches listeners below
    await renderMermaidDiagram(diagrams[idx].source, 'mermaid-render');
    // Re-attach tab listeners
    renderDiagramTabs(diagrams, idx, async (newIdx) => {
      state.mermaidActiveDiagram = newIdx;
      await loadAndRenderMermaid(text, fileName);
    });
  });

  // Render first diagram
  const result = await renderMermaidDiagram(diagrams[0].source, 'mermaid-render');

  // Init zoom/pan
  initZoomPan('mermaid-render');

  // Update stats
  updateMermaidStats(diagrams[0]);

  // Show error if rendering failed
  const errorEl = document.getElementById('mermaid-editor-error');
  if (result.error && errorEl) {
    errorEl.textContent = result.error;
    errorEl.style.display = 'block';
  } else if (errorEl) {
    errorEl.style.display = 'none';
  }

  // Hide drop-zone on successful render
  const mermaidDropZone = document.getElementById('mermaid-drop-zone');
  if (mermaidDropZone) mermaidDropZone.classList.add('hidden');

  // Update mermaid breadcrumb if wired
  if (typeof window.updateMermaidBreadcrumb === 'function') window.updateMermaidBreadcrumb();

  return result;
}

function updateMermaidStats(diagram) {
  const statsEl = document.getElementById('stats');
  if (!statsEl) return;
  const type = diagram.type !== 'unknown' ? diagram.type : 'diagram';
  statsEl.textContent = `${type} | ${diagram.title}`;
}
