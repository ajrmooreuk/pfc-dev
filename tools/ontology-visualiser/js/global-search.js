/**
 * Global Text Search — F40.25 Command Palette Search
 *
 * Provides a command-palette-style overlay (press '/') that searches
 * across all loaded ontology data: entities, relationships, rules,
 * registry entries, glossary terms, PFI instances, and skeleton items.
 *
 * Exports:
 *   buildSearchIndex()       — build/rebuild flat search index from state
 *   searchIndex(query, idx)  — scored substring search
 *   openGlobalSearch()       — show command palette overlay
 *   closeGlobalSearch()      — dismiss overlay
 *   executeSearchResult(r)   — navigate to a search result
 *   highlightMatch(t, q)     — HTML with <mark> around match
 */

import { state } from './state.js';
import { escapeHtml } from './ui-panels.js';

// ── Category definitions ──────────────────────────────────────────────

const CATEGORIES = {
  entity:         { label: 'Entities',        icon: '\u25CF', priority: 10 },  // ●
  relationship:   { label: 'Relationships',   icon: '\u2194', priority: 8 },   // ↔
  rule:           { label: 'Business Rules',  icon: '\uD83D\uDEE1', priority: 6 }, // 🛡
  registry:       { label: 'Registry',        icon: '\uD83D\uDCD6', priority: 5 }, // 📖
  glossary:       { label: 'Glossary',        icon: '\u201C', priority: 4 },   // "
  'pfi-instance': { label: 'PFI Instances',   icon: '\uD83C\uDFE2', priority: 3 }, // 🏢
  skeleton:       { label: 'Skeleton',        icon: '\u25A6', priority: 2 },   // ▦
};

const CATEGORY_ORDER = ['entity', 'relationship', 'rule', 'registry', 'glossary', 'pfi-instance', 'skeleton'];

// ── Module-level state ────────────────────────────────────────────────

let _flatResults = [];
let _selectedIdx = -1;
let _currentIndex = null;

// ── Index Builder ─────────────────────────────────────────────────────

/**
 * Build a flat SearchIndexEntry[] from all state data sources.
 * Call after registry load, single-ontology load, PFI selection, etc.
 */
export function buildSearchIndex() {
  const index = [];

  // 1. Entity nodes
  const nodes = _getNodes();
  for (const node of nodes) {
    const parts = [node.id, node.label, node.description, node.entityType, node.sourceNamespace, node.series];
    if (node.properties) {
      for (const v of Object.values(node.properties)) {
        if (typeof v === 'string') parts.push(v);
      }
    }
    index.push({
      text: parts.filter(Boolean).join(' ').toLowerCase(),
      label: node.label || node.id,
      sublabel: [node.entityType, node.sourceNamespace || node.series].filter(Boolean).join(' · '),
      category: 'entity',
      icon: CATEGORIES.entity.icon,
      priority: CATEGORIES.entity.priority,
      action: { type: 'focusNode', id: node.id },
    });
  }

  // 2. Relationship edges
  const edges = _getEdges();
  for (const edge of edges) {
    const parts = [edge.label, edge.from, edge.to, edge.edgeType];
    index.push({
      text: parts.filter(Boolean).join(' ').toLowerCase(),
      label: edge.label || `${edge.from} → ${edge.to}`,
      sublabel: [edge.edgeType, `${edge.from} → ${edge.to}`].filter(Boolean).join(' · '),
      category: 'relationship',
      icon: CATEGORIES.relationship.icon,
      priority: CATEGORIES.relationship.priority,
      action: { type: 'focusEdge', from: edge.from, to: edge.to },
    });
  }

  // 3. Registry entries
  if (state.registryIndex && state.registryIndex.entries) {
    for (const entry of state.registryIndex.entries) {
      const parts = [entry.name, entry.namespace, entry['@id'], entry.status, entry.description, entry.series];
      index.push({
        text: parts.filter(Boolean).join(' ').toLowerCase(),
        label: entry.name || entry['@id'],
        sublabel: [entry.namespace, entry.series, entry.status].filter(Boolean).join(' · '),
        category: 'registry',
        icon: CATEGORIES.registry.icon,
        priority: CATEGORIES.registry.priority,
        action: state.viewMode === 'multi'
          ? { type: 'drillToOntology', namespace: entry.namespace }
          : { type: 'loadOntology', namespace: entry.namespace },
      });
    }
  }

  // 4. Business rules
  if (state.loadedOntologies && state.loadedOntologies.size > 0) {
    for (const [ns, record] of state.loadedOntologies) {
      const rules = _extractRules(record);
      for (let i = 0; i < rules.length; i++) {
        const rule = rules[i];
        const name = rule.ruleName || rule.name || rule['@id'] || rule.ruleId || `Rule ${i + 1}`;
        const parts = [name, rule.description, rule.severity, rule.condition, rule.remediation, rule.ruleId];
        index.push({
          text: parts.filter(Boolean).join(' ').toLowerCase(),
          label: name,
          sublabel: [rule.severity, ns].filter(Boolean).join(' · '),
          category: 'rule',
          icon: CATEGORIES.rule.icon,
          priority: CATEGORIES.rule.priority,
          action: { type: 'showRule', ruleIndex: i, namespace: ns },
        });
      }
    }
  }

  // 5. Glossary terms
  if (state.glossaryData && state.glossaryData.terms) {
    for (const term of state.glossaryData.terms) {
      const parts = [term.term, term.definition, term.ontology, term.layer];
      if (term.aliases) parts.push(...term.aliases);
      index.push({
        text: parts.filter(Boolean).join(' ').toLowerCase(),
        label: term.term,
        sublabel: [term.ontology, term.layer].filter(Boolean).join(' · '),
        category: 'glossary',
        icon: CATEGORIES.glossary.icon,
        priority: CATEGORIES.glossary.priority,
        action: { type: 'showGlossary', term: term.term },
      });
    }
  }

  // 6. PFI instances
  if (state.pfiInstances && state.pfiInstances.size > 0) {
    for (const [id, inst] of state.pfiInstances) {
      const parts = [id, inst.name, inst.description, inst.verticalMarket];
      if (inst.products) parts.push(...(Array.isArray(inst.products) ? inst.products : [inst.products]));
      if (inst.brands) parts.push(...(Array.isArray(inst.brands) ? inst.brands : [inst.brands]));
      if (inst.instanceOntologies) parts.push(...inst.instanceOntologies);
      index.push({
        text: parts.filter(Boolean).join(' ').toLowerCase(),
        label: inst.name || id,
        sublabel: [inst.verticalMarket, id].filter(Boolean).join(' · '),
        category: 'pfi-instance',
        icon: CATEGORIES['pfi-instance'].icon,
        priority: CATEGORIES['pfi-instance'].priority,
        action: { type: 'selectInstance', instanceId: id },
      });
    }
  }

  // 7. App skeleton (zones, nav items)
  if (state.appSkeleton) {
    _indexSkeleton(index, state.appSkeleton);
  }

  state.globalSearchIndex = index;
  _currentIndex = index;
  return index;
}

function _getNodes() {
  if (state.viewMode === 'multi' && state.mergedGraph && state.mergedGraph.nodes) {
    return state.mergedGraph.nodes;
  }
  if (state.lastParsed && state.lastParsed.nodes) {
    return state.lastParsed.nodes;
  }
  return [];
}

function _getEdges() {
  if (state.viewMode === 'multi' && state.mergedGraph && state.mergedGraph.edges) {
    return state.mergedGraph.edges;
  }
  if (state.lastParsed && state.lastParsed.edges) {
    return state.lastParsed.edges;
  }
  return [];
}

function _extractRules(record) {
  if (!record || !record.rawData) return [];
  const rd = record.rawData;
  if (rd.businessRules && Array.isArray(rd.businessRules)) return rd.businessRules;
  if (rd.ontologyDefinition && rd.ontologyDefinition.businessRules && Array.isArray(rd.ontologyDefinition.businessRules)) {
    return rd.ontologyDefinition.businessRules;
  }
  return [];
}

function _indexSkeleton(index, skeleton) {
  // Index zones
  if (skeleton.zones) {
    for (const zone of skeleton.zones) {
      const parts = [zone['@id'], zone.name, zone.description];
      index.push({
        text: parts.filter(Boolean).join(' ').toLowerCase(),
        label: zone.name || zone['@id'],
        sublabel: 'Zone',
        category: 'skeleton',
        icon: CATEGORIES.skeleton.icon,
        priority: CATEGORIES.skeleton.priority,
        action: { type: 'showSkeletonItem', itemId: zone['@id'] },
      });
    }
  }
  // Index nav items from layers
  if (skeleton.navLayers) {
    for (const layer of skeleton.navLayers) {
      if (!layer.items) continue;
      for (const item of layer.items) {
        const parts = [item['@id'], item.label, item.name, item['ds:action'], item.description];
        index.push({
          text: parts.filter(Boolean).join(' ').toLowerCase(),
          label: item.label || item.name || item['@id'],
          sublabel: [layer.name || layer['@id'], item['ds:action']].filter(Boolean).join(' · '),
          category: 'skeleton',
          icon: CATEGORIES.skeleton.icon,
          priority: CATEGORIES.skeleton.priority,
          action: { type: 'showSkeletonItem', itemId: item['@id'] },
        });
      }
    }
  }
}

// ── Search Engine ─────────────────────────────────────────────────────

/**
 * Search the index for a query string.
 * Returns scored, sorted results limited to `limit`.
 */
export function searchIndex(query, index, limit = 50) {
  if (!query || query.length < 2 || !index) return [];
  const q = query.toLowerCase();
  const results = [];

  for (const entry of index) {
    const pos = entry.text.indexOf(q);
    if (pos === -1) continue;

    let score = entry.priority;
    const labelLower = entry.label.toLowerCase();
    if (labelLower.startsWith(q)) score += 100;
    else if (labelLower.indexOf(q) !== -1) score += 50;
    else if (pos === 0) score += 30;
    else score += 10;

    results.push({ ...entry, score, matchPos: pos });
  }

  results.sort((a, b) => b.score - a.score || a.label.localeCompare(b.label));
  return results.slice(0, limit);
}

// ── Match Highlighting ────────────────────────────────────────────────

/**
 * Returns HTML string with <mark> around the first match of query in text.
 * All text is HTML-escaped first to prevent XSS.
 */
export function highlightMatch(text, query) {
  if (!text) return '';
  if (!query || query.length < 2) return escapeHtml(text);
  const lower = text.toLowerCase();
  const idx = lower.indexOf(query.toLowerCase());
  if (idx === -1) return escapeHtml(text);
  const before = text.substring(0, idx);
  const match = text.substring(idx, idx + query.length);
  const after = text.substring(idx + query.length);
  return `${escapeHtml(before)}<mark class="search-highlight">${escapeHtml(match)}</mark>${escapeHtml(after)}`;
}

// ── Command Palette UI ────────────────────────────────────────────────

/**
 * Open the global search command palette overlay.
 */
export function openGlobalSearch() {
  // If already open, just focus the input
  const existing = document.getElementById('global-search-overlay');
  if (existing) {
    document.getElementById('global-search-input')?.focus();
    return;
  }

  // Build index if stale or missing
  if (!_currentIndex) buildSearchIndex();

  const overlay = document.createElement('div');
  overlay.id = 'global-search-overlay';
  overlay.className = 'global-search-overlay';
  overlay.innerHTML = `
    <div class="global-search-palette">
      <div class="global-search-header">
        <span class="global-search-icon">\uD83D\uDD0D</span>
        <input type="text" id="global-search-input" class="global-search-input"
               placeholder="Search entities, relationships, rules, glossary..."
               autocomplete="off" spellcheck="false">
        <kbd class="global-search-hint">Esc</kbd>
      </div>
      <div id="global-search-results" class="global-search-results">
        <div class="global-search-empty">Type at least 2 characters to search</div>
      </div>
      <div class="global-search-footer">
        <span><kbd>\u2191</kbd><kbd>\u2193</kbd> Navigate</span>
        <span><kbd>Enter</kbd> Select</span>
        <span><kbd>Esc</kbd> Close</span>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Backdrop click to close
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeGlobalSearch();
  });

  // Wire up input with debounce
  const input = document.getElementById('global-search-input');
  let debounceTimer = null;
  input.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      _performSearch(input.value);
    }, 150);
  });

  // Keyboard navigation within palette
  input.addEventListener('keydown', _handleSearchKeydown);
  _flatResults = [];
  _selectedIdx = -1;
  input.focus();
}

/**
 * Close the global search overlay.
 */
export function closeGlobalSearch() {
  const overlay = document.getElementById('global-search-overlay');
  if (overlay) overlay.remove();
  _flatResults = [];
  _selectedIdx = -1;
}

// ── Internal: search & render ─────────────────────────────────────────

function _performSearch(query) {
  const resultsEl = document.getElementById('global-search-results');
  if (!resultsEl) return;

  if (!query || query.length < 2) {
    resultsEl.innerHTML = '<div class="global-search-empty">Type at least 2 characters to search</div>';
    _flatResults = [];
    _selectedIdx = -1;
    return;
  }

  const results = searchIndex(query, _currentIndex);
  if (results.length === 0) {
    resultsEl.innerHTML = '<div class="global-search-empty">No results found</div>';
    _flatResults = [];
    _selectedIdx = -1;
    return;
  }

  // Group by category
  const groups = {};
  for (const r of results) {
    if (!groups[r.category]) groups[r.category] = [];
    groups[r.category].push(r);
  }

  let html = '';
  let globalIdx = 0;
  for (const cat of CATEGORY_ORDER) {
    if (!groups[cat]) continue;
    const catDef = CATEGORIES[cat];
    html += `<div class="global-search-category">${catDef.label} (${groups[cat].length})</div>`;
    for (const r of groups[cat]) {
      html += `<div class="global-search-item" data-idx="${globalIdx}" onclick="window._gsExecuteResult(${globalIdx})">
        <span class="global-search-item-icon">${r.icon}</span>
        <div class="global-search-item-text">
          <div class="global-search-item-label">${highlightMatch(r.label, query)}</div>
          <div class="global-search-item-sublabel">${highlightMatch(r.sublabel, query)}</div>
        </div>
      </div>`;
      globalIdx++;
    }
  }

  resultsEl.innerHTML = html;
  _flatResults = results;
  _selectedIdx = -1;
}

function _handleSearchKeydown(e) {
  if (e.key === 'Escape') {
    closeGlobalSearch();
    e.preventDefault();
    return;
  }
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    _moveSelection(1);
    return;
  }
  if (e.key === 'ArrowUp') {
    e.preventDefault();
    _moveSelection(-1);
    return;
  }
  if (e.key === 'Enter' && _selectedIdx >= 0 && _selectedIdx < _flatResults.length) {
    e.preventDefault();
    executeSearchResult(_flatResults[_selectedIdx]);
    closeGlobalSearch();
    return;
  }
}

function _moveSelection(delta) {
  if (_flatResults.length === 0) return;
  const items = document.querySelectorAll('.global-search-item');
  if (items.length === 0) return;

  // Remove old active
  if (_selectedIdx >= 0 && _selectedIdx < items.length) {
    items[_selectedIdx].classList.remove('active');
  }

  // Compute new index
  if (_selectedIdx < 0) {
    _selectedIdx = delta > 0 ? 0 : items.length - 1;
  } else {
    _selectedIdx += delta;
    if (_selectedIdx >= items.length) _selectedIdx = 0;
    if (_selectedIdx < 0) _selectedIdx = items.length - 1;
  }

  // Apply active
  items[_selectedIdx].classList.add('active');
  items[_selectedIdx].scrollIntoView({ block: 'nearest' });
}

// ── Navigation Dispatch ───────────────────────────────────────────────

/**
 * Execute a search result action — navigate to the item.
 */
export function executeSearchResult(result) {
  if (!result || !result.action) return;
  const a = result.action;

  switch (a.type) {
    case 'focusNode':
      window.navigateToNode?.(a.id);
      break;

    case 'focusEdge':
      window.focusNodes?.([a.from, a.to]);
      break;

    case 'drillToOntology':
      window.drillToOntology?.(a.namespace);
      break;

    case 'loadOntology':
      window.loadOntologyFromPanel?.(a.namespace);
      break;

    case 'showGlossary':
      window.showGlossaryEditorUI?.();
      setTimeout(() => {
        const glossarySearch = document.getElementById('glossary-search');
        if (glossarySearch) {
          glossarySearch.value = a.term;
          window.doSearchGlossary?.(a.term);
        }
      }, 100);
      break;

    case 'selectInstance':
      window.doPickInstance?.(a.instanceId);
      break;

    case 'showSkeletonItem':
      window.toggleSkeletonInspector?.();
      break;

    case 'showRule':
      // Navigate to the ontology if not current, then show rule detail
      window.navigateToNode?.(a.namespace);
      break;

    default:
      console.warn('[GlobalSearch] Unknown action type:', a.type);
  }
}

// Window export for inline onclick
if (typeof window !== 'undefined') {
  window._gsExecuteResult = function (idx) {
    if (idx >= 0 && idx < _flatResults.length) {
      executeSearchResult(_flatResults[idx]);
      closeGlobalSearch();
    }
  };
}
