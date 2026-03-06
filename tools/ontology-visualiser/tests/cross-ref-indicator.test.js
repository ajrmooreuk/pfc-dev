/**
 * Unit tests for F40.26: Entity Cross-Reference Indicator
 *
 * Tests getEntityCrossReferences() — the lookup that finds
 * all ontologies sharing the same local entity name.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../js/state.js', () => ({
  state: {
    viewMode: 'multi',
    mergedGraph: null,
    loadedOntologies: new Map(),
  },
  SERIES_COLORS: {
    'VE-Series': '#4caf50',
    'PE-Series': '#2196f3',
    'Foundation': '#ff9800',
    placeholder: '#888',
  },
  DS_BRIDGE_STYLES: {},
}));

// Mock dependencies imported by ui-panels.js
vi.mock('../js/audit-engine.js', () => ({ validateOAAv5: vi.fn() }));
vi.mock('../js/library-manager.js', () => ({
  getVersionHistory: vi.fn(),
  loadOntologyFromLibrary: vi.fn(),
}));
vi.mock('../js/ds-authoring.js', () => ({ renderDSComponentBindings: vi.fn(() => '') }));
vi.mock('../js/composition-filter.js', () => ({
  getNodeRenderMode: vi.fn(),
  getActiveFilteredView: vi.fn(() => null),
}));

// Stub document.createElement for escapeHtml
vi.stubGlobal('document', {
  createElement: vi.fn(() => {
    let _text = '';
    return {
      set textContent(v) { _text = v; },
      get innerHTML() {
        return _text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      },
    };
  }),
  getElementById: vi.fn(() => null),
  querySelector: vi.fn(() => null),
  querySelectorAll: vi.fn(() => []),
});

import { state } from '../js/state.js';
import { getEntityCrossReferences } from '../js/ui-panels.js';

// ─── Fixtures ────────────────────────────────────────────────────────────────

function makeMergedNode(prefix, localName, series = 'VE-Series') {
  return {
    id: `${prefix}::${prefix}:${localName}`,
    originalId: `${prefix}:${localName}`,
    label: localName,
    entityType: 'class',
    sourceNamespace: `${prefix}:`,
    series,
  };
}

function makeRecord(name, series) {
  return { name, series, parsed: { nodes: [], edges: [] } };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('getEntityCrossReferences (F40.26)', () => {
  beforeEach(() => {
    state.viewMode = 'multi';
    state.mergedGraph = null;
    state.loadedOntologies = new Map();
  });

  it('returns empty array in single-ontology mode', () => {
    state.viewMode = 'single';
    state.mergedGraph = { nodes: [makeMergedNode('vsom', 'Vision')] };
    const result = getEntityCrossReferences(makeMergedNode('vsom', 'Vision'));
    expect(result).toEqual([]);
  });

  it('returns empty array when no merged graph', () => {
    const result = getEntityCrossReferences(makeMergedNode('vsom', 'Vision'));
    expect(result).toEqual([]);
  });

  it('returns empty array when node has no sourceNamespace', () => {
    state.mergedGraph = { nodes: [] };
    const result = getEntityCrossReferences({ id: 'test', label: 'test' });
    expect(result).toEqual([]);
  });

  it('returns empty array when no cross-references exist', () => {
    state.mergedGraph = {
      nodes: [
        makeMergedNode('vsom', 'Vision'),
        makeMergedNode('vsom', 'Strategy'),
      ],
    };
    state.loadedOntologies.set('vsom:', makeRecord('VSOM Ontology', 'VE-Series'));

    const result = getEntityCrossReferences(makeMergedNode('vsom', 'Vision'));
    expect(result).toEqual([]);
  });

  it('finds cross-references sharing the same local name', () => {
    state.mergedGraph = {
      nodes: [
        makeMergedNode('vsom', 'Vision'),
        makeMergedNode('kpi', 'Vision'),
        makeMergedNode('bsc', 'Vision'),
        makeMergedNode('okr', 'Vision'),
        makeMergedNode('vsom', 'Strategy'),  // different name, should not match
      ],
    };
    state.loadedOntologies.set('vsom:', makeRecord('VSOM Ontology', 'VE-Series'));
    state.loadedOntologies.set('kpi:', makeRecord('KPI Ontology', 'VE-Series'));
    state.loadedOntologies.set('bsc:', makeRecord('BSC Ontology', 'VE-Series'));
    state.loadedOntologies.set('okr:', makeRecord('OKR Ontology', 'VE-Series'));

    const node = makeMergedNode('vsom', 'Vision');
    const result = getEntityCrossReferences(node);

    expect(result).toHaveLength(3);
    expect(result.map(r => r.namespace).sort()).toEqual(['bsc:', 'kpi:', 'okr:']);
  });

  it('excludes self namespace from results', () => {
    state.mergedGraph = {
      nodes: [
        makeMergedNode('vsom', 'Vision'),
        makeMergedNode('kpi', 'Vision'),
      ],
    };
    state.loadedOntologies.set('vsom:', makeRecord('VSOM', 'VE-Series'));
    state.loadedOntologies.set('kpi:', makeRecord('KPI', 'VE-Series'));

    const node = makeMergedNode('vsom', 'Vision');
    const result = getEntityCrossReferences(node);

    expect(result).toHaveLength(1);
    expect(result[0].namespace).toBe('kpi:');
    // Should not include self
    expect(result.some(r => r.namespace === 'vsom:')).toBe(false);
  });

  it('returns one entry per namespace (deduplicates)', () => {
    state.mergedGraph = {
      nodes: [
        makeMergedNode('vsom', 'Vision'),
        // Two nodes in kpi: with same local name (shouldn't happen but guard it)
        { ...makeMergedNode('kpi', 'Vision'), id: 'kpi::kpi:Vision-2', originalId: 'kpi:Vision' },
        makeMergedNode('kpi', 'Vision'),
      ],
    };
    state.loadedOntologies.set('vsom:', makeRecord('VSOM', 'VE-Series'));
    state.loadedOntologies.set('kpi:', makeRecord('KPI', 'VE-Series'));

    const result = getEntityCrossReferences(makeMergedNode('vsom', 'Vision'));
    expect(result).toHaveLength(1);
  });

  it('includes qualifiedId and prefixedId in results', () => {
    state.mergedGraph = {
      nodes: [
        makeMergedNode('vsom', 'Vision'),
        makeMergedNode('kpi', 'Vision'),
      ],
    };
    state.loadedOntologies.set('vsom:', makeRecord('VSOM', 'VE-Series'));
    state.loadedOntologies.set('kpi:', makeRecord('KPI', 'VE-Series'));

    const result = getEntityCrossReferences(makeMergedNode('vsom', 'Vision'));
    expect(result[0].qualifiedId).toBe('kpi:Vision');
    expect(result[0].prefixedId).toBe('kpi::kpi:Vision');
  });

  it('sorts results alphabetically by name', () => {
    state.mergedGraph = {
      nodes: [
        makeMergedNode('vsom', 'Vision'),
        makeMergedNode('okr', 'Vision'),
        makeMergedNode('bsc', 'Vision'),
        makeMergedNode('kpi', 'Vision'),
      ],
    };
    state.loadedOntologies.set('vsom:', makeRecord('VSOM', 'VE-Series'));
    state.loadedOntologies.set('okr:', makeRecord('OKR', 'VE-Series'));
    state.loadedOntologies.set('bsc:', makeRecord('BSC', 'VE-Series'));
    state.loadedOntologies.set('kpi:', makeRecord('KPI', 'VE-Series'));

    const result = getEntityCrossReferences(makeMergedNode('vsom', 'Vision'));
    expect(result.map(r => r.name)).toEqual(['BSC', 'KPI', 'OKR']);
  });

  it('strips "Ontology" suffix from name', () => {
    state.mergedGraph = {
      nodes: [
        makeMergedNode('vsom', 'Vision'),
        makeMergedNode('kpi', 'Vision'),
      ],
    };
    state.loadedOntologies.set('vsom:', makeRecord('VSOM Ontology v3.0.0', 'VE-Series'));
    state.loadedOntologies.set('kpi:', makeRecord('KPI Ontology v2.0.0', 'VE-Series'));

    const result = getEntityCrossReferences(makeMergedNode('vsom', 'Vision'));
    expect(result[0].name).toBe('KPI');
  });

  it('includes series from loaded ontologies', () => {
    state.mergedGraph = {
      nodes: [
        makeMergedNode('vsom', 'Vision', 'VE-Series'),
        makeMergedNode('org', 'Vision', 'Foundation'),
      ],
    };
    state.loadedOntologies.set('vsom:', makeRecord('VSOM', 'VE-Series'));
    state.loadedOntologies.set('org:', makeRecord('ORG', 'Foundation'));

    const result = getEntityCrossReferences(makeMergedNode('vsom', 'Vision', 'VE-Series'));
    expect(result[0].series).toBe('Foundation');
  });

  it('handles node with no colon in originalId', () => {
    state.mergedGraph = {
      nodes: [
        { id: 'ns1::RawName', originalId: 'RawName', label: 'RawName', sourceNamespace: 'ns1:', series: 'X' },
        { id: 'ns2::RawName', originalId: 'RawName', label: 'RawName', sourceNamespace: 'ns2:', series: 'X' },
      ],
    };
    state.loadedOntologies.set('ns1:', makeRecord('NS1', 'X'));
    state.loadedOntologies.set('ns2:', makeRecord('NS2', 'X'));

    const result = getEntityCrossReferences(state.mergedGraph.nodes[0]);
    expect(result).toHaveLength(1);
    expect(result[0].namespace).toBe('ns2:');
  });
});
