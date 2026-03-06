/**
 * registry-browser.js — F40.3: Registry Browser View Mode
 *
 * Full-screen registry browser with series tree view, artifact type
 * filters, inheritance cascade highlighting, and PFI instance scoping.
 */

import { state, SERIES_COLORS } from './state.js';
import { escapeHtml } from './ui-panels.js';
import { resolveSeriesForOntology, resolveSubSeriesForOntology } from './multi-loader.js';

// ─── Module State ─────────────────────────────────────────────────────────────

let _activeTypeFilter = 'all';
let _activeSeriesFilter = 'all';
let _searchQuery = '';
let _expandedSeries = new Set();
let _expandedEntries = new Set();

const SERIES_ORDER = ['VE-Series', 'PE-Series', 'Foundation', 'RCSG-Series', 'Orchestration'];

const CASCADE_TIERS = {
  Core:     { label: 'Core',     color: '#2196f3' },
  Instance: { label: 'Instance', color: '#4caf50' },
  Product:  { label: 'Product',  color: '#ff9800' },
  Client:   { label: 'Client',   color: '#9c27b0' },
};

const TYPE_FILTERS = [
  { key: 'all',            label: 'All' },
  { key: 'ontologies',     label: 'Ontologies' },
  { key: 'processes',      label: 'Processes' },
  { key: 'applications',   label: 'Applications' },
  { key: 'pfi-instances',  label: 'PFI Instances' },
];

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Render the full-screen registry browser into the given container.
 * @param {string} containerId - DOM element ID to render into
 */
export function renderRegistryBrowser(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!state.registryIndex?.entries) {
    container.innerHTML = '<div class="rb-empty">Registry not loaded. Use "Load Registry" first.</div>';
    return;
  }

  const entries = state.registryIndex.entries;
  const seriesRegistry = state.registryIndex.seriesRegistry || {};
  const meta = state.registryMeta;

  // Group entries by series
  const groups = _groupBySeries(entries, seriesRegistry);

  // Discover processes and applications from loaded data
  const processes = state.discoveredProcesses || [];
  const applications = state.discoveredApplications || [];
  const pfiInstances = state.pfiInstances ? [...state.pfiInstances.entries()] : [];

  // Instance ontology set (for cascade highlighting)
  const instanceOntologies = _getInstanceOntologySet();

  let html = '';

  // ── Header Bar ──
  html += '<div class="rb-header">';
  html += '<div class="rb-header-title">';
  html += '<h2>Registry Browser</h2>';
  if (meta) {
    html += `<span class="rb-version-badge">v${escapeHtml(meta.version)}</span>`;
    html += `<span class="rb-meta-item">OAA ${escapeHtml(meta.oaaVersion)}</span>`;
    html += `<span class="rb-meta-item">${meta.totalEntries} entries</span>`;
    html += `<span class="rb-meta-item">${escapeHtml(meta.lastUpdated)}</span>`;
  }
  html += '</div>';
  html += '</div>';

  // ── Filter Bar ──
  html += '<div class="rb-filter-bar">';

  // Type filters
  html += '<div class="rb-type-filters">';
  for (const f of TYPE_FILTERS) {
    const active = f.key === _activeTypeFilter ? ' active' : '';
    html += `<button class="rb-filter-chip${active}" onclick="window._rbFilterType('${f.key}')">${f.label}</button>`;
  }
  html += '</div>';

  // Series filters
  html += '<div class="rb-series-filters">';
  const allActive = _activeSeriesFilter === 'all' ? ' active' : '';
  html += `<button class="rb-series-chip${allActive}" onclick="window._rbFilterSeries('all')">All Series</button>`;
  for (const series of SERIES_ORDER) {
    const color = SERIES_COLORS[series] || SERIES_COLORS.placeholder;
    const active = _activeSeriesFilter === series ? ' active' : '';
    const label = seriesRegistry[series]?.name || series;
    html += `<button class="rb-series-chip${active}" style="--rb-series-color:${color}" onclick="window._rbFilterSeries('${series}')">${escapeHtml(label)}</button>`;
  }
  html += '</div>';

  // Search
  html += '<div class="rb-search">';
  html += `<input type="text" class="rb-search-input" placeholder="Search registry..." value="${escapeHtml(_searchQuery)}" oninput="window._rbSearch(this.value)">`;
  html += '</div>';

  html += '</div>';

  // ── Content ──
  html += '<div class="rb-content">';

  // PFI Instances section (when type filter is 'all' or 'pfi-instances')
  if ((_activeTypeFilter === 'all' || _activeTypeFilter === 'pfi-instances') && pfiInstances.length > 0) {
    if (_activeSeriesFilter === 'all') {
      const filteredInstances = _filterBySearch(pfiInstances.map(([id, inst]) => ({
        _searchText: [id, inst.name, inst.description, inst.verticalMarket, ...(inst.products || [])].join(' '),
        id, inst,
      })));
      if (filteredInstances.length > 0) {
        html += '<div class="rb-section">';
        html += '<h3 class="rb-section-title" style="border-left-color:#00bcd4">PFI Instances</h3>';
        html += '<div class="rb-instance-grid">';
        for (const { id, inst } of filteredInstances) {
          html += _renderPFIInstanceCard(id, inst);
        }
        html += '</div></div>';
      }
    }
  }

  // Series tree (when type filter is 'all', 'ontologies', 'processes', or 'applications')
  if (_activeTypeFilter !== 'pfi-instances') {
    for (const series of SERIES_ORDER) {
      if (_activeSeriesFilter !== 'all' && _activeSeriesFilter !== series) continue;

      const seriesEntries = groups[series];
      if (!seriesEntries || seriesEntries.length === 0) continue;

      // Apply type filter
      const processNs = new Set(processes.map(p => p.parentNs));
      const appNs = new Set(applications.map(a => a.parentNs));
      let filtered = seriesEntries;
      if (_activeTypeFilter === 'processes') {
        filtered = seriesEntries.filter(e => processNs.has(e.namespace || ''));
      } else if (_activeTypeFilter === 'applications') {
        filtered = seriesEntries.filter(e => appNs.has(e.namespace || ''));
      }

      // Apply search filter
      filtered = _filterEntriesBySearch(filtered);

      if (filtered.length === 0) continue;

      const color = SERIES_COLORS[series] || SERIES_COLORS.placeholder;
      const seriesInfo = seriesRegistry[series];
      const isExpanded = _expandedSeries.has(series);

      // Series header
      html += `<div class="rb-series-group" data-series="${series}">`;
      html += `<div class="rb-series-header" onclick="window._rbToggleSeries('${series}')" style="border-left-color:${color}">`;
      html += `<span class="rb-expand-icon">${isExpanded ? '\u25BC' : '\u25B6'}</span>`;
      html += `<span class="rb-series-name" style="color:${color}">${escapeHtml(seriesInfo?.name || series)}</span>`;
      html += `<span class="rb-series-count">${filtered.length} ${filtered.length === 1 ? 'ontology' : 'ontologies'}</span>`;
      html += _renderSeriesMetrics(filtered);
      html += '</div>';

      // Entries (collapsible)
      if (isExpanded) {
        html += '<div class="rb-entries">';

        // Group by sub-series if applicable
        const subGroups = _groupBySubSeries(filtered, seriesRegistry);
        for (const [subKey, subEntries] of subGroups) {
          if (subKey) {
            html += `<div class="rb-subseries-label">${escapeHtml(subKey)}</div>`;
          }
          for (const entry of subEntries) {
            html += _renderEntry(entry, instanceOntologies, processes, applications);
          }
        }

        html += '</div>';
      }

      html += '</div>';
    }
  }

  html += '</div>';

  container.innerHTML = html;
}

/**
 * Filter registry by artifact type.
 * @param {string} type - 'all' | 'ontologies' | 'processes' | 'applications' | 'pfi-instances'
 */
export function filterRegistryByType(type) {
  _activeTypeFilter = type;
  renderRegistryBrowser('registry-browser-container');
}

/**
 * Filter registry by series.
 * @param {string} series - series key or 'all'
 */
export function filterRegistryBySeries(series) {
  _activeSeriesFilter = series;
  renderRegistryBrowser('registry-browser-container');
}

/**
 * Live text search across registry entries.
 * @param {string} query - search query string
 */
export function searchRegistryEntries(query) {
  _searchQuery = query.toLowerCase().trim();
  renderRegistryBrowser('registry-browser-container');
}

/**
 * Toggle a series group open/closed.
 * @param {string} series - series key
 */
export function toggleSeriesGroup(series) {
  if (_expandedSeries.has(series)) {
    _expandedSeries.delete(series);
  } else {
    _expandedSeries.add(series);
  }
  renderRegistryBrowser('registry-browser-container');
}

/**
 * Toggle an entry detail card open/closed.
 * @param {string} namespace - entry namespace
 */
export function toggleEntryDetail(namespace) {
  if (_expandedEntries.has(namespace)) {
    _expandedEntries.delete(namespace);
  } else {
    _expandedEntries.add(namespace);
  }
  renderRegistryBrowser('registry-browser-container');
}

/**
 * Reset all filters and search.
 */
export function resetRegistryFilters() {
  _activeTypeFilter = 'all';
  _activeSeriesFilter = 'all';
  _searchQuery = '';
  _expandedSeries.clear();
  _expandedEntries.clear();
  renderRegistryBrowser('registry-browser-container');
}

// ─── Rendering Helpers ────────────────────────────────────────────────────────

function _renderSeriesMetrics(entries) {
  const compliant = entries.filter(e => e.status === 'compliant' || e.status === 'proposal').length;
  const deprecated = entries.filter(e => e.status === 'deprecated' || e.status === 'superseded').length;
  const placeholder = entries.filter(e => e.status === 'placeholder').length;
  let loaded = 0;
  let totalEntities = 0;
  for (const e of entries) {
    const record = state.loadedOntologies?.get(e.namespace || '');
    if (record) {
      loaded++;
      if (record.parsed?.nodes) totalEntities += record.parsed.nodes.length;
    }
  }

  let html = '<span class="rb-series-metrics">';
  html += `<span class="rb-metric">${compliant} compliant</span>`;
  if (deprecated > 0) html += `<span class="rb-metric rb-metric-warn">${deprecated} deprecated</span>`;
  if (placeholder > 0) html += `<span class="rb-metric rb-metric-dim">${placeholder} placeholder</span>`;
  if (loaded > 0) html += `<span class="rb-metric rb-metric-loaded">${loaded} loaded (${totalEntities} entities)</span>`;
  html += '</span>';
  return html;
}

function _renderEntry(entry, instanceOntologies, processes, applications) {
  const ns = entry.namespace || '';
  const isExpanded = _expandedEntries.has(ns);
  const isLoaded = state.loadedOntologies?.has(ns);
  const record = state.loadedOntologies?.get(ns);
  const isInInstance = instanceOntologies.has(ns.replace(/:$/, ''));
  const cascadeTier = _inferCascadeTier(entry);

  let html = `<div class="rb-entry${isInInstance ? ' rb-entry-instance-highlight' : ''}" data-ns="${escapeHtml(ns)}">`;
  html += `<div class="rb-entry-header" onclick="window._rbToggleEntry('${escapeHtml(ns)}')">`;
  html += `<span class="rb-expand-icon">${isExpanded ? '\u25BC' : '\u25B6'}</span>`;

  // Name and namespace
  html += `<span class="rb-entry-name">${escapeHtml(entry.name || entry['@id'] || ns)}</span>`;
  html += `<span class="rb-entry-ns">${escapeHtml(ns)}</span>`;

  // Status badge
  html += _renderStatusBadge(entry.status);

  // Cascade tier badge
  if (cascadeTier) {
    const tier = CASCADE_TIERS[cascadeTier] || CASCADE_TIERS.Core;
    html += `<span class="rb-cascade-badge" style="background:${tier.color}">${tier.label}</span>`;
  }

  // Loaded indicator
  if (isLoaded) {
    const entityCount = record?.parsed?.nodes?.length || 0;
    html += `<span class="rb-loaded-badge">${entityCount} entities</span>`;
  }

  // Version
  if (entry.version) {
    html += `<span class="rb-version">${escapeHtml(entry.version)}</span>`;
  }

  html += '</div>';

  // Expanded detail card
  if (isExpanded) {
    html += '<div class="rb-entry-detail">';

    if (entry.description) {
      html += `<div class="rb-detail-row"><span class="rb-detail-label">Description</span><span class="rb-detail-value">${escapeHtml(entry.description)}</span></div>`;
    }
    if (entry.oaaVersion) {
      html += `<div class="rb-detail-row"><span class="rb-detail-label">OAA Version</span><span class="rb-detail-value">${escapeHtml(entry.oaaVersion)}</span></div>`;
    }
    if (entry.entityCount != null) {
      html += `<div class="rb-detail-row"><span class="rb-detail-label">Declared Entities</span><span class="rb-detail-value">${entry.entityCount}</span></div>`;
    }
    if (entry.relationshipCount != null) {
      html += `<div class="rb-detail-row"><span class="rb-detail-label">Relationships</span><span class="rb-detail-value">${entry.relationshipCount}</span></div>`;
    }
    if (entry.dependencies?.length > 0) {
      html += `<div class="rb-detail-row"><span class="rb-detail-label">Dependencies</span><span class="rb-detail-value">${entry.dependencies.map(d => escapeHtml(d)).join(', ')}</span></div>`;
    }
    if (entry.deprecatedBy) {
      html += `<div class="rb-detail-row"><span class="rb-detail-label">Deprecated By</span><span class="rb-detail-value rb-deprecated">${escapeHtml(entry.deprecatedBy)}</span></div>`;
    }

    // Processes discovered in this ontology
    const entryProcesses = processes.filter(p => p.parentNs === ns);
    if (entryProcesses.length > 0) {
      html += '<div class="rb-detail-section"><span class="rb-detail-label">Processes</span>';
      for (const p of entryProcesses) {
        html += `<div class="rb-process-item">${escapeHtml(p.name || p.processId)}</div>`;
      }
      html += '</div>';
    }

    // Applications discovered in this ontology
    const entryApps = applications.filter(a => a.parentNs === ns);
    if (entryApps.length > 0) {
      html += '<div class="rb-detail-section"><span class="rb-detail-label">Applications</span>';
      for (const a of entryApps) {
        html += `<div class="rb-app-item">${escapeHtml(a.name || a.appId)}</div>`;
      }
      html += '</div>';
    }

    // Action buttons
    html += '<div class="rb-entry-actions">';
    if (!isLoaded) {
      html += `<button class="rb-action-btn rb-action-primary" onclick="window._rbLoadOntology('${escapeHtml(ns)}')">Load</button>`;
    } else {
      html += `<button class="rb-action-btn rb-action-secondary" onclick="window._rbDrillToOntology('${escapeHtml(ns)}')">View in Graph</button>`;
    }
    html += '</div>';

    html += '</div>';
  }

  html += '</div>';
  return html;
}

function _renderPFIInstanceCard(id, inst) {
  let html = '<div class="rb-instance-card">';
  html += `<div class="rb-instance-name">${escapeHtml(inst.name || id)}</div>`;
  if (inst.description) {
    html += `<div class="rb-instance-desc">${escapeHtml(inst.description)}</div>`;
  }
  html += '<div class="rb-instance-meta">';
  if (inst.verticalMarket) html += `<span class="rb-instance-tag">${escapeHtml(inst.verticalMarket)}</span>`;
  if (inst.products?.length) html += `<span class="rb-instance-tag">Products: ${inst.products.join(', ')}</span>`;
  if (inst.maturityLevel != null) html += `<span class="rb-instance-tag">Maturity: ${inst.maturityLevel}</span>`;
  if (inst.jurisdictions?.length) html += `<span class="rb-instance-tag">${inst.jurisdictions.join(', ')}</span>`;
  html += '</div>';
  if (inst.instanceOntologies?.length) {
    html += `<div class="rb-instance-onts">${inst.instanceOntologies.length} ontologies</div>`;
  }
  html += '</div>';
  return html;
}

function _renderStatusBadge(status) {
  const colors = {
    compliant: '#4caf50',
    deprecated: '#ff5722',
    superseded: '#ff9800',
    placeholder: '#616161',
    proposal: '#03a9f4',
  };
  const color = colors[status] || '#888';
  return `<span class="rb-status-badge" style="background:${color}">${escapeHtml(status || 'unknown')}</span>`;
}

// ─── Data Helpers ─────────────────────────────────────────────────────────────

function _groupBySeries(entries, seriesRegistry) {
  const groups = {};
  for (const s of SERIES_ORDER) groups[s] = [];
  for (const entry of entries) {
    const series = resolveSeriesForOntology(entry.name, seriesRegistry);
    if (!groups[series]) groups[series] = [];
    groups[series].push(entry);
  }
  return groups;
}

function _groupBySubSeries(entries, seriesRegistry) {
  const subMap = new Map();
  subMap.set(null, []);
  for (const entry of entries) {
    const sub = resolveSubSeriesForOntology(entry.name || entry['@id'] || '', seriesRegistry);
    if (sub) {
      if (!subMap.has(sub)) subMap.set(sub, []);
      subMap.get(sub).push(entry);
    } else {
      subMap.get(null).push(entry);
    }
  }
  return subMap;
}

function _getInstanceOntologySet() {
  const set = new Set();
  if (state.activeInstanceId && state.pfiInstances) {
    const inst = state.pfiInstances.get(state.activeInstanceId);
    if (inst?.instanceOntologies) {
      for (const ont of inst.instanceOntologies) {
        // instanceOntologies may be short names like "VP-ONT" or paths
        if (!ont.includes('/')) set.add(ont);
      }
    }
  }
  return set;
}

function _inferCascadeTier(entry) {
  if (entry.cascadeTier) return entry.cascadeTier;
  const path = entry.path || entry['@id'] || '';
  if (path.includes('instance-data')) return 'Instance';
  if (path.includes('client-data')) return 'Client';
  if (path.includes('product-data')) return 'Product';
  return 'Core';
}

function _filterEntriesBySearch(entries) {
  if (!_searchQuery) return entries;
  return entries.filter(e => {
    const text = [e.name, e.namespace, e['@id'], e.description, e.status].join(' ').toLowerCase();
    return text.includes(_searchQuery);
  });
}

function _filterBySearch(items) {
  if (!_searchQuery) return items;
  return items.filter(item => item._searchText.toLowerCase().includes(_searchQuery));
}

// ─── Window Bindings ──────────────────────────────────────────────────────────

window._rbFilterType = function(type) { filterRegistryByType(type); };
window._rbFilterSeries = function(series) { filterRegistryBySeries(series); };
window._rbSearch = function(query) { searchRegistryEntries(query); };
window._rbToggleSeries = function(series) { toggleSeriesGroup(series); };
window._rbToggleEntry = function(ns) { toggleEntryDetail(ns); };

window._rbLoadOntology = async function(ns) {
  const { loadSingleOntologyFromRegistry } = await import('./multi-loader.js');
  await loadSingleOntologyFromRegistry(ns);
  renderRegistryBrowser('registry-browser-container');
};

window._rbDrillToOntology = function(ns) {
  if (window.drillToOntology) {
    window.drillToOntology(ns);
  }
};
