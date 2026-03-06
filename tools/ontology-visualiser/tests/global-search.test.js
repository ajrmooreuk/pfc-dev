/**
 * Unit tests for global-search.js — F40.25 Global Text Search
 *
 * Tests: index building, search scoring/ranking, case-insensitive matching,
 * min-length guard, category grouping, match highlighting, action dispatch.
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock state.js
vi.mock('../js/state.js', () => ({
  state: {
    viewMode: 'single',
    lastParsed: null,
    mergedGraph: null,
    registryIndex: null,
    loadedOntologies: new Map(),
    glossaryData: null,
    pfiInstances: new Map(),
    appSkeleton: null,
    globalSearchIndex: null,
  },
}));

// Mock ui-panels.js — provide escapeHtml
vi.mock('../js/ui-panels.js', () => ({
  escapeHtml: (text) => {
    if (!text) return '';
    return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  },
}));

import { state } from '../js/state.js';
import {
  buildSearchIndex,
  searchIndex,
  highlightMatch,
  executeSearchResult,
} from '../js/global-search.js';

// ─── Test Fixtures ───────────────────────────────────────────────────────────

function makeNode(id, label, entityType = 'class', opts = {}) {
  return { id, label, entityType, description: opts.description || '', series: opts.series || '', sourceNamespace: opts.sourceNamespace || '', properties: opts.properties || {} };
}

function makeEdge(from, to, label, edgeType = 'relationship') {
  return { from, to, label, edgeType };
}

function makeRegistryEntry(name, namespace, series = 'VE-Series', status = 'compliant') {
  return { '@id': `Entry-${namespace}`, name, namespace, series, status, description: `${name} ontology` };
}

function makeRule(ruleId, ruleName, severity = 'mandatory') {
  return { ruleId, ruleName, description: `${ruleName} description`, severity };
}

function makeGlossaryTerm(term, definition, ontology = 'vsom:') {
  return { term, definition, ontology, layer: 'strategic' };
}

// ─── buildSearchIndex ────────────────────────────────────────────────────────

describe('buildSearchIndex', () => {
  beforeEach(() => {
    state.viewMode = 'single';
    state.lastParsed = null;
    state.mergedGraph = null;
    state.registryIndex = null;
    state.loadedOntologies = new Map();
    state.glossaryData = null;
    state.pfiInstances = new Map();
    state.appSkeleton = null;
    state.globalSearchIndex = null;
  });

  it('returns empty index when no data is loaded', () => {
    const idx = buildSearchIndex();
    expect(idx).toEqual([]);
    expect(state.globalSearchIndex).toEqual([]);
  });

  it('indexes entity nodes from lastParsed in single mode', () => {
    state.lastParsed = {
      nodes: [
        makeNode('vsom:Vision', 'Vision', 'core', { series: 'VE-Series', description: 'Strategic direction' }),
        makeNode('vsom:Strategy', 'Strategy', 'class'),
      ],
      edges: [],
    };
    const idx = buildSearchIndex();
    expect(idx.length).toBe(2);
    expect(idx[0].category).toBe('entity');
    expect(idx[0].label).toBe('Vision');
    expect(idx[0].action).toEqual({ type: 'focusNode', id: 'vsom:Vision' });
    expect(idx[0].text).toContain('vision');
    expect(idx[0].text).toContain('strategic direction');
  });

  it('indexes entity nodes from mergedGraph in multi mode', () => {
    state.viewMode = 'multi';
    state.mergedGraph = {
      nodes: [
        makeNode('vsom:Vision', 'Vision', 'core'),
        makeNode('pe:Process', 'Process', 'class'),
      ],
      edges: [],
    };
    const idx = buildSearchIndex();
    const entities = idx.filter(e => e.category === 'entity');
    expect(entities.length).toBe(2);
    expect(entities[0].label).toBe('Vision');
    expect(entities[1].label).toBe('Process');
  });

  it('indexes relationship edges', () => {
    state.lastParsed = {
      nodes: [],
      edges: [
        makeEdge('vsom:Vision', 'vsom:Strategy', 'drivesStrategy'),
        makeEdge('vsom:Strategy', 'vsom:Objective', 'definesObjective'),
      ],
    };
    const idx = buildSearchIndex();
    expect(idx.length).toBe(2);
    expect(idx[0].category).toBe('relationship');
    expect(idx[0].label).toBe('drivesStrategy');
    expect(idx[0].action).toEqual({ type: 'focusEdge', from: 'vsom:Vision', to: 'vsom:Strategy' });
  });

  it('indexes registry entries', () => {
    state.registryIndex = {
      entries: [
        makeRegistryEntry('VSOM Ontology', 'vsom:', 'VE-Series'),
        makeRegistryEntry('PE Ontology', 'pe:', 'PE-Series'),
      ],
    };
    const idx = buildSearchIndex();
    expect(idx.length).toBe(2);
    expect(idx[0].category).toBe('registry');
    expect(idx[0].label).toBe('VSOM Ontology');
    expect(idx[0].action.type).toBe('loadOntology'); // single mode
  });

  it('registry entries use drillToOntology in multi mode', () => {
    state.viewMode = 'multi';
    state.registryIndex = {
      entries: [makeRegistryEntry('VSOM Ontology', 'vsom:')],
    };
    const idx = buildSearchIndex();
    expect(idx[0].action.type).toBe('drillToOntology');
  });

  it('indexes business rules from loaded ontologies', () => {
    state.loadedOntologies = new Map([
      ['vsom:', {
        rawData: {
          businessRules: [
            makeRule('BR-001', 'Mandatory Vision'),
            makeRule('BR-002', 'Strategy Required', 'advisory'),
          ],
        },
      }],
    ]);
    const idx = buildSearchIndex();
    const rules = idx.filter(e => e.category === 'rule');
    expect(rules.length).toBe(2);
    expect(rules[0].label).toBe('Mandatory Vision');
    expect(rules[0].sublabel).toContain('mandatory');
  });

  it('indexes business rules from ontologyDefinition path', () => {
    state.loadedOntologies = new Map([
      ['pe:', {
        rawData: {
          ontologyDefinition: {
            businessRules: [makeRule('BR-PE-001', 'Process Guard')],
          },
        },
      }],
    ]);
    const idx = buildSearchIndex();
    const rules = idx.filter(e => e.category === 'rule');
    expect(rules.length).toBe(1);
    expect(rules[0].label).toBe('Process Guard');
  });

  it('indexes glossary terms', () => {
    state.glossaryData = {
      terms: [
        makeGlossaryTerm('Vision', 'A strategic direction statement', 'vsom:'),
        makeGlossaryTerm('OKR', 'Objectives and Key Results', 'okr:'),
      ],
    };
    const idx = buildSearchIndex();
    const glossary = idx.filter(e => e.category === 'glossary');
    expect(glossary.length).toBe(2);
    expect(glossary[0].label).toBe('Vision');
    expect(glossary[0].action).toEqual({ type: 'showGlossary', term: 'Vision' });
  });

  it('indexes PFI instances', () => {
    state.pfiInstances = new Map([
      ['PFI-BAIV', { name: 'BAIV MarTech', description: 'Marketing AI', verticalMarket: 'MarTech', products: ['AIV'], instanceOntologies: ['VP', 'RRR'] }],
    ]);
    const idx = buildSearchIndex();
    const pfi = idx.filter(e => e.category === 'pfi-instance');
    expect(pfi.length).toBe(1);
    expect(pfi[0].label).toBe('BAIV MarTech');
    expect(pfi[0].text).toContain('martech');
    expect(pfi[0].text).toContain('aiv');
  });

  it('indexes app skeleton zones and nav items', () => {
    state.appSkeleton = {
      zones: [
        { '@id': 'Z1', name: 'Header Zone', description: 'Top navigation' },
        { '@id': 'Z2', name: 'Nav Bar Zone' },
      ],
      navLayers: [
        {
          '@id': 'L1', name: 'Main Nav',
          items: [
            { '@id': 'nav-1', label: 'Library', 'ds:action': 'toggleLibraryPanel' },
            { '@id': 'nav-2', label: 'Audit', 'ds:action': 'toggleAuditPanel' },
          ],
        },
      ],
    };
    const idx = buildSearchIndex();
    const skeleton = idx.filter(e => e.category === 'skeleton');
    expect(skeleton.length).toBe(4); // 2 zones + 2 nav items
    expect(skeleton[0].label).toBe('Header Zone');
    expect(skeleton[2].label).toBe('Library');
  });

  it('combines all sources into a single index', () => {
    state.lastParsed = {
      nodes: [makeNode('a', 'Alpha')],
      edges: [makeEdge('a', 'b', 'links')],
    };
    state.registryIndex = { entries: [makeRegistryEntry('Test', 'test:')] };
    state.loadedOntologies = new Map([['test:', { rawData: { businessRules: [makeRule('R1', 'Rule One')] } }]]);
    state.glossaryData = { terms: [makeGlossaryTerm('Term', 'A term')] };
    state.pfiInstances = new Map([['PFI-X', { name: 'X Instance' }]]);

    const idx = buildSearchIndex();
    const cats = new Set(idx.map(e => e.category));
    expect(cats).toContain('entity');
    expect(cats).toContain('relationship');
    expect(cats).toContain('registry');
    expect(cats).toContain('rule');
    expect(cats).toContain('glossary');
    expect(cats).toContain('pfi-instance');
    expect(idx.length).toBe(6);
  });

  it('includes entity property values in searchable text', () => {
    state.lastParsed = {
      nodes: [makeNode('x', 'Widget', 'class', { properties: { color: 'blue', size: 'large' } })],
      edges: [],
    };
    const idx = buildSearchIndex();
    expect(idx[0].text).toContain('blue');
    expect(idx[0].text).toContain('large');
  });
});

// ─── searchIndex ─────────────────────────────────────────────────────────────

describe('searchIndex', () => {
  const testIndex = [
    { text: 'vision strategic direction core ve-series', label: 'Vision', sublabel: 'core · VE-Series', category: 'entity', icon: '●', priority: 10, action: { type: 'focusNode', id: 'vsom:Vision' } },
    { text: 'strategy class ve-series', label: 'Strategy', sublabel: 'class · VE-Series', category: 'entity', icon: '●', priority: 10, action: { type: 'focusNode', id: 'vsom:Strategy' } },
    { text: 'drivesstrategy relationship vsom:vision vsom:strategy', label: 'drivesStrategy', sublabel: 'relationship', category: 'relationship', icon: '↔', priority: 8, action: { type: 'focusEdge', from: 'vsom:Vision', to: 'vsom:Strategy' } },
    { text: 'vsom ontology vsom: ve-series compliant', label: 'VSOM Ontology', sublabel: 'vsom: · VE-Series', category: 'registry', icon: '📖', priority: 5, action: { type: 'drillToOntology', namespace: 'vsom:' } },
    { text: 'mandatory vision br-001 mandatory', label: 'Mandatory Vision', sublabel: 'mandatory · vsom:', category: 'rule', icon: '🛡', priority: 6, action: { type: 'showRule', ruleIndex: 0, namespace: 'vsom:' } },
    { text: 'vision a strategic direction statement', label: 'Vision', sublabel: 'vsom: · strategic', category: 'glossary', icon: '"', priority: 4, action: { type: 'showGlossary', term: 'Vision' } },
  ];

  it('returns empty array for query shorter than 2 chars', () => {
    expect(searchIndex('', testIndex)).toEqual([]);
    expect(searchIndex('v', testIndex)).toEqual([]);
  });

  it('returns empty array for null/undefined index', () => {
    expect(searchIndex('vision', null)).toEqual([]);
    expect(searchIndex('vision', undefined)).toEqual([]);
  });

  it('finds matches by substring (case-insensitive)', () => {
    const results = searchIndex('vision', testIndex);
    expect(results.length).toBeGreaterThan(0);
    expect(results.some(r => r.label === 'Vision' && r.category === 'entity')).toBe(true);
  });

  it('is case-insensitive', () => {
    const lower = searchIndex('vision', testIndex);
    const upper = searchIndex('VISION', testIndex);
    const mixed = searchIndex('ViSiOn', testIndex);
    expect(lower.length).toBe(upper.length);
    expect(lower.length).toBe(mixed.length);
  });

  it('scores label prefix matches higher than contains matches', () => {
    const results = searchIndex('vi', testIndex);
    // 'Vision' (entity, label prefix) should rank above 'Mandatory Vision' (rule, label contains 'vi' only in text)
    const visionEntity = results.find(r => r.label === 'Vision' && r.category === 'entity');
    const mandatoryVision = results.find(r => r.label === 'Mandatory Vision');
    expect(visionEntity).toBeDefined();
    if (mandatoryVision) {
      expect(visionEntity.score).toBeGreaterThan(mandatoryVision.score);
    }
  });

  it('scores entities higher than relationships for same match quality', () => {
    const results = searchIndex('strategy', testIndex);
    const entity = results.find(r => r.category === 'entity' && r.label === 'Strategy');
    const rel = results.find(r => r.category === 'relationship');
    expect(entity).toBeDefined();
    if (rel) {
      expect(entity.score).toBeGreaterThanOrEqual(rel.score);
    }
  });

  it('limits results to specified limit', () => {
    const results = searchIndex('vi', testIndex, 2);
    expect(results.length).toBeLessThanOrEqual(2);
  });

  it('default limit is 50', () => {
    // Create a large index
    const bigIndex = [];
    for (let i = 0; i < 100; i++) {
      bigIndex.push({ text: `vision item ${i}`, label: `Vision ${i}`, sublabel: '', category: 'entity', icon: '●', priority: 10, action: { type: 'focusNode', id: `v${i}` } });
    }
    const results = searchIndex('vision', bigIndex);
    expect(results.length).toBe(50);
  });

  it('returns results sorted by score descending', () => {
    const results = searchIndex('vision', testIndex);
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score);
    }
  });

  it('finds matches in sublabel/description text', () => {
    const results = searchIndex('strategic', testIndex);
    expect(results.length).toBeGreaterThan(0);
  });

  it('returns no results for unmatched query', () => {
    const results = searchIndex('zzzznoexist', testIndex);
    expect(results).toEqual([]);
  });
});

// ─── highlightMatch ──────────────────────────────────────────────────────────

describe('highlightMatch', () => {
  it('wraps matched substring in <mark> tag', () => {
    const result = highlightMatch('Vision Statement', 'vision');
    expect(result).toBe('<mark class="search-highlight">Vision</mark> Statement');
  });

  it('is case-insensitive', () => {
    const result = highlightMatch('VSOM Ontology', 'vsom');
    expect(result).toBe('<mark class="search-highlight">VSOM</mark> Ontology');
  });

  it('escapes HTML in text to prevent XSS', () => {
    const result = highlightMatch('<script>alert("xss")</script>', 'script');
    expect(result).not.toContain('<script>');
    expect(result).toContain('&lt;');
    expect(result).toContain('<mark class="search-highlight">script</mark>');
  });

  it('returns escaped text when query is empty or too short', () => {
    expect(highlightMatch('Vision', '')).toBe('Vision');
    expect(highlightMatch('Vision', 'v')).toBe('Vision');
  });

  it('returns escaped text when no match found', () => {
    const result = highlightMatch('Vision', 'zz');
    expect(result).toBe('Vision');
    expect(result).not.toContain('<mark');
  });

  it('returns empty string for null/undefined text', () => {
    expect(highlightMatch(null, 'test')).toBe('');
    expect(highlightMatch(undefined, 'test')).toBe('');
  });

  it('highlights only first occurrence', () => {
    const result = highlightMatch('vision of vision', 'vision');
    const markCount = (result.match(/<mark/g) || []).length;
    expect(markCount).toBe(1);
  });
});

// ─── executeSearchResult ─────────────────────────────────────────────────────

describe('executeSearchResult', () => {
  beforeEach(() => {
    // Reset window mocks
    window.navigateToNode = vi.fn();
    window.focusNodes = vi.fn();
    window.drillToOntology = vi.fn();
    window.loadOntologyFromPanel = vi.fn();
    window.showGlossaryEditorUI = vi.fn();
    window.doSearchGlossary = vi.fn();
    window.doPickInstance = vi.fn();
    window.toggleSkeletonInspector = vi.fn();
  });

  it('dispatches focusNode for entity results', () => {
    executeSearchResult({ action: { type: 'focusNode', id: 'vsom:Vision' } });
    expect(window.navigateToNode).toHaveBeenCalledWith('vsom:Vision');
  });

  it('dispatches focusNodes for relationship results', () => {
    executeSearchResult({ action: { type: 'focusEdge', from: 'a', to: 'b' } });
    expect(window.focusNodes).toHaveBeenCalledWith(['a', 'b']);
  });

  it('dispatches drillToOntology for registry results in multi mode', () => {
    executeSearchResult({ action: { type: 'drillToOntology', namespace: 'vsom:' } });
    expect(window.drillToOntology).toHaveBeenCalledWith('vsom:');
  });

  it('dispatches loadOntologyFromPanel for registry results in single mode', () => {
    executeSearchResult({ action: { type: 'loadOntology', namespace: 'vsom:' } });
    expect(window.loadOntologyFromPanel).toHaveBeenCalledWith('vsom:');
  });

  it('dispatches showGlossaryEditorUI for glossary results', () => {
    executeSearchResult({ action: { type: 'showGlossary', term: 'Vision' } });
    expect(window.showGlossaryEditorUI).toHaveBeenCalled();
  });

  it('dispatches doPickInstance for PFI instance results', () => {
    executeSearchResult({ action: { type: 'selectInstance', instanceId: 'PFI-BAIV' } });
    expect(window.doPickInstance).toHaveBeenCalledWith('PFI-BAIV');
  });

  it('dispatches toggleSkeletonInspector for skeleton results', () => {
    executeSearchResult({ action: { type: 'showSkeletonItem', itemId: 'Z1' } });
    expect(window.toggleSkeletonInspector).toHaveBeenCalled();
  });

  it('handles null/undefined result gracefully', () => {
    expect(() => executeSearchResult(null)).not.toThrow();
    expect(() => executeSearchResult(undefined)).not.toThrow();
    expect(() => executeSearchResult({})).not.toThrow();
    expect(() => executeSearchResult({ action: null })).not.toThrow();
  });
});

// ─── Integration: build + search ─────────────────────────────────────────────

describe('build + search integration', () => {
  beforeEach(() => {
    state.viewMode = 'single';
    state.lastParsed = null;
    state.mergedGraph = null;
    state.registryIndex = null;
    state.loadedOntologies = new Map();
    state.glossaryData = null;
    state.pfiInstances = new Map();
    state.appSkeleton = null;
    state.globalSearchIndex = null;
  });

  it('builds index and searches it end-to-end', () => {
    state.lastParsed = {
      nodes: [
        makeNode('vsom:Vision', 'Vision', 'core', { description: 'Strategic direction' }),
        makeNode('vsom:Strategy', 'Strategy', 'class'),
        makeNode('pe:Process', 'Process', 'class'),
      ],
      edges: [
        makeEdge('vsom:Vision', 'vsom:Strategy', 'drivesStrategy'),
      ],
    };

    const idx = buildSearchIndex();
    expect(idx.length).toBe(4); // 3 nodes + 1 edge

    const results = searchIndex('vision', idx);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].label).toBe('Vision');
    expect(results[0].category).toBe('entity');
  });

  it('searches across multiple categories', () => {
    state.lastParsed = { nodes: [makeNode('vsom:Vision', 'Vision')], edges: [] };
    state.glossaryData = { terms: [makeGlossaryTerm('Vision', 'Direction')] };

    const idx = buildSearchIndex();
    const results = searchIndex('vision', idx);
    const cats = new Set(results.map(r => r.category));
    expect(cats).toContain('entity');
    expect(cats).toContain('glossary');
  });
});
