/**
 * Unit tests for layer-filter.js — F8.7 Multilayer Semantic Filtering
 *
 * Tests: layer model, node membership, compound filtering (OR/AND),
 * cross-ref detection, layer counts, URL hash serialisation/deserialisation,
 * and preset application.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock state.js
vi.mock('../js/state.js', () => ({
  state: {
    layerFilterActive: false,
    activeLayers: new Set(),
    layerMode: 'or',
    layerPreset: null,
    layerSearchQuery: '',
    layerSearchAll: false,
    layerPanelOpen: false,
    crossEdges: [],
    mergedGraph: null,
    lastParsed: null,
    viewMode: 'single',
    network: null,
  },
  SEMANTIC_LAYERS: {
    strategic:     { name: 'Strategic',     series: ['VE-Series'],     color: '#2196F3' },
    operational:   { name: 'Operational',   series: ['PE-Series'],     color: '#4CAF50' },
    compliance:    { name: 'Compliance',    series: ['RCSG-Series'],   color: '#9C27B0' },
    foundation:    { name: 'Foundation',    series: ['Foundation'],    color: '#FF9800' },
    orchestration: { name: 'Orchestration', series: ['Orchestration'], color: '#00BCD4' },
    crossRef:      { name: 'Cross-Ref',    series: [],                color: '#eab839' },
  },
  LAYER_PRESETS: {
    complianceAudit:   { name: 'Compliance Audit',   layers: ['compliance', 'foundation', 'crossRef'], mode: 'or' },
    strategicOverview: { name: 'Strategic Overview',  layers: ['strategic', 'foundation'],              mode: 'or' },
    fullMesh:          { name: 'Full Mesh',           layers: ['strategic', 'operational', 'compliance', 'foundation', 'orchestration', 'crossRef'], mode: 'or' },
    crossRefOnly:      { name: 'Cross-Ref Only',      layers: ['crossRef'],                             mode: 'or' },
  },
}));

import {
  getNodeLayer,
  buildCrossRefNodeSet,
  isNodeInLayer,
  computeLayerFilter,
  computeLayerCounts,
  serializeLayerState,
  deserializeLayerState,
} from '../js/layer-filter.js';

// ─── Test Fixtures ───────────────────────────────────────────────────────────

function makeNode(id, series, entityType = 'class') {
  return { id, series, entityType, label: id, description: '' };
}

const VE_NODE = makeNode('vsom:Vision', 'VE-Series', 'core');
const PE_NODE = makeNode('pe:Process', 'PE-Series', 'class');
const RCSG_NODE = makeNode('rcsg:Control', 'RCSG-Series', 'framework');
const FOUND_NODE = makeNode('org:Organisation', 'Foundation', 'core');
const ORCH_NODE = makeNode('emc:Composition', 'Orchestration', 'class');
const UNKNOWN_NODE = makeNode('foo:Bar', 'Unknown-Series', 'class');

const ALL_NODES = [VE_NODE, PE_NODE, RCSG_NODE, FOUND_NODE, ORCH_NODE, UNKNOWN_NODE];

const CROSS_EDGES = [
  { from: 'vsom:Vision', to: 'pe:Process' },
  { from: 'rcsg:Control', to: 'org:Organisation' },
  { from: 'vsom:Vision', to: 'rcsg:Control' },
];

// ─── getNodeLayer ────────────────────────────────────────────────────────────

describe('getNodeLayer', () => {
  it('maps VE-Series node to strategic', () => {
    expect(getNodeLayer(VE_NODE)).toBe('strategic');
  });

  it('maps PE-Series node to operational', () => {
    expect(getNodeLayer(PE_NODE)).toBe('operational');
  });

  it('maps RCSG-Series node to compliance', () => {
    expect(getNodeLayer(RCSG_NODE)).toBe('compliance');
  });

  it('maps Foundation node to foundation', () => {
    expect(getNodeLayer(FOUND_NODE)).toBe('foundation');
  });

  it('maps Orchestration node to orchestration', () => {
    expect(getNodeLayer(ORCH_NODE)).toBe('orchestration');
  });

  it('returns null for unknown series', () => {
    expect(getNodeLayer(UNKNOWN_NODE)).toBeNull();
  });

  it('returns null for null/undefined node', () => {
    expect(getNodeLayer(null)).toBeNull();
    expect(getNodeLayer(undefined)).toBeNull();
  });

  it('returns null for node without series', () => {
    expect(getNodeLayer({ id: 'test', entityType: 'class' })).toBeNull();
  });
});

// ─── buildCrossRefNodeSet ────────────────────────────────────────────────────

describe('buildCrossRefNodeSet', () => {
  it('extracts from and to node IDs from cross edges', () => {
    const set = buildCrossRefNodeSet(CROSS_EDGES);
    expect(set.has('vsom:Vision')).toBe(true);
    expect(set.has('pe:Process')).toBe(true);
    expect(set.has('rcsg:Control')).toBe(true);
    expect(set.has('org:Organisation')).toBe(true);
    expect(set.size).toBe(4);
  });

  it('returns empty set for null/undefined', () => {
    expect(buildCrossRefNodeSet(null).size).toBe(0);
    expect(buildCrossRefNodeSet(undefined).size).toBe(0);
  });

  it('returns empty set for empty array', () => {
    expect(buildCrossRefNodeSet([]).size).toBe(0);
  });
});

// ─── isNodeInLayer ───────────────────────────────────────────────────────────

describe('isNodeInLayer', () => {
  const crossRefIds = buildCrossRefNodeSet(CROSS_EDGES);

  it('VE node is in strategic layer', () => {
    expect(isNodeInLayer(VE_NODE, 'strategic', crossRefIds)).toBe(true);
  });

  it('VE node is NOT in operational layer', () => {
    expect(isNodeInLayer(VE_NODE, 'operational', crossRefIds)).toBe(false);
  });

  it('VE node is in crossRef layer (it has cross edges)', () => {
    expect(isNodeInLayer(VE_NODE, 'crossRef', crossRefIds)).toBe(true);
  });

  it('unknown series node is NOT in crossRef layer', () => {
    expect(isNodeInLayer(UNKNOWN_NODE, 'crossRef', crossRefIds)).toBe(false);
  });

  it('orchestration node is NOT in crossRef layer', () => {
    expect(isNodeInLayer(ORCH_NODE, 'crossRef', crossRefIds)).toBe(false);
  });

  it('returns false for null node or layer', () => {
    expect(isNodeInLayer(null, 'strategic', crossRefIds)).toBe(false);
    expect(isNodeInLayer(VE_NODE, null, crossRefIds)).toBe(false);
  });

  it('returns false for invalid layer key', () => {
    expect(isNodeInLayer(VE_NODE, 'nonexistent', crossRefIds)).toBe(false);
  });
});

// ─── computeLayerFilter — OR mode ───────────────────────────────────────────

describe('computeLayerFilter — OR mode', () => {
  const crossRefIds = buildCrossRefNodeSet(CROSS_EDGES);

  it('all layers active → all nodes with known series visible', () => {
    const allLayers = new Set(['strategic', 'operational', 'compliance', 'foundation', 'orchestration', 'crossRef']);
    const { visible, dimmed } = computeLayerFilter(ALL_NODES, allLayers, 'or', crossRefIds);
    expect(visible.size).toBe(5); // VE, PE, RCSG, Foundation, Orchestration
    expect(dimmed.size).toBe(1); // Unknown only (no series match, no cross-ref)
  });

  it('single layer (strategic) → only VE-Series visible', () => {
    const { visible, dimmed } = computeLayerFilter(ALL_NODES, new Set(['strategic']), 'or', crossRefIds);
    expect(visible.has('vsom:Vision')).toBe(true);
    expect(visible.size).toBe(1);
    expect(dimmed.size).toBe(5);
  });

  it('no layers → all dimmed', () => {
    const { visible, dimmed } = computeLayerFilter(ALL_NODES, new Set(), 'or', crossRefIds);
    expect(visible.size).toBe(0);
    expect(dimmed.size).toBe(6);
  });

  it('strategic + compliance → VE + RCSG visible', () => {
    const { visible } = computeLayerFilter(ALL_NODES, new Set(['strategic', 'compliance']), 'or', crossRefIds);
    expect(visible.has('vsom:Vision')).toBe(true);
    expect(visible.has('rcsg:Control')).toBe(true);
    expect(visible.size).toBe(2);
  });

  it('crossRef only → nodes with cross edges visible', () => {
    const { visible } = computeLayerFilter(ALL_NODES, new Set(['crossRef']), 'or', crossRefIds);
    expect(visible.has('vsom:Vision')).toBe(true);
    expect(visible.has('pe:Process')).toBe(true);
    expect(visible.has('rcsg:Control')).toBe(true);
    expect(visible.has('org:Organisation')).toBe(true);
    expect(visible.size).toBe(4);
  });
});

// ─── computeLayerFilter — AND mode ──────────────────────────────────────────

describe('computeLayerFilter — AND mode', () => {
  const crossRefIds = buildCrossRefNodeSet(CROSS_EDGES);

  it('strategic + crossRef → only VE nodes with cross edges', () => {
    const { visible } = computeLayerFilter(ALL_NODES, new Set(['strategic', 'crossRef']), 'and', crossRefIds);
    expect(visible.has('vsom:Vision')).toBe(true);
    expect(visible.size).toBe(1);
  });

  it('compliance + crossRef → only RCSG nodes with cross edges', () => {
    const { visible } = computeLayerFilter(ALL_NODES, new Set(['compliance', 'crossRef']), 'and', crossRefIds);
    expect(visible.has('rcsg:Control')).toBe(true);
    expect(visible.size).toBe(1);
  });

  it('crossRef only in AND mode → same as OR (all crossRef nodes)', () => {
    const { visible } = computeLayerFilter(ALL_NODES, new Set(['crossRef']), 'and', crossRefIds);
    expect(visible.size).toBe(4);
  });

  it('strategic + operational in AND mode → empty (no node in both VE and PE)', () => {
    const { visible, dimmed } = computeLayerFilter(ALL_NODES, new Set(['strategic', 'operational']), 'and', crossRefIds);
    expect(visible.size).toBe(0);
    expect(dimmed.size).toBe(6);
  });
});

// ─── computeLayerCounts ──────────────────────────────────────────────────────

describe('computeLayerCounts', () => {
  const crossRefIds = buildCrossRefNodeSet(CROSS_EDGES);

  it('returns correct counts per layer', () => {
    const counts = computeLayerCounts(ALL_NODES, crossRefIds);
    expect(counts.strategic).toBe(1);
    expect(counts.operational).toBe(1);
    expect(counts.compliance).toBe(1);
    expect(counts.foundation).toBe(1);
    expect(counts.orchestration).toBe(1);
    expect(counts.crossRef).toBe(4); // VE, PE, RCSG, Foundation nodes
  });

  it('returns all zeros for empty nodes', () => {
    const counts = computeLayerCounts([], new Set());
    for (const key of Object.keys(counts)) {
      expect(counts[key]).toBe(0);
    }
  });
});

// ─── serializeLayerState ─────────────────────────────────────────────────────

describe('serializeLayerState', () => {
  it('serialises active layers', () => {
    const hash = serializeLayerState(new Set(['strategic', 'compliance']), 'or', null);
    expect(hash).toBe('layers=compliance,strategic');
  });

  it('includes mode when not default (or)', () => {
    const hash = serializeLayerState(new Set(['strategic']), 'and', null);
    expect(hash).toContain('mode=and');
  });

  it('omits mode when default (or)', () => {
    const hash = serializeLayerState(new Set(['strategic']), 'or', null);
    expect(hash).not.toContain('mode=');
  });

  it('includes preset when set', () => {
    const hash = serializeLayerState(new Set(['compliance', 'foundation', 'crossRef']), 'or', 'complianceAudit');
    expect(hash).toContain('preset=complianceAudit');
  });

  it('returns empty string when no layers', () => {
    const hash = serializeLayerState(new Set(), 'or', null);
    expect(hash).toBe('');
  });
});

// ─── deserializeLayerState ───────────────────────────────────────────────────

describe('deserializeLayerState', () => {
  it('parses layers from hash', () => {
    const result = deserializeLayerState('#layers=strategic,compliance');
    expect(result.activeLayers.has('strategic')).toBe(true);
    expect(result.activeLayers.has('compliance')).toBe(true);
    expect(result.activeLayers.size).toBe(2);
  });

  it('parses mode from hash', () => {
    const result = deserializeLayerState('#layers=strategic&mode=and');
    expect(result.mode).toBe('and');
  });

  it('defaults mode to or', () => {
    const result = deserializeLayerState('#layers=strategic');
    expect(result.mode).toBe('or');
  });

  it('parses preset from hash', () => {
    const result = deserializeLayerState('#layers=compliance,foundation,crossRef&preset=complianceAudit');
    expect(result.preset).toBe('complianceAudit');
  });

  it('ignores invalid layer keys', () => {
    const result = deserializeLayerState('#layers=strategic,invalid,compliance');
    expect(result.activeLayers.size).toBe(2);
    expect(result.activeLayers.has('invalid')).toBe(false);
  });

  it('ignores invalid preset', () => {
    const result = deserializeLayerState('#preset=nonexistent');
    expect(result.preset).toBeNull();
  });

  it('handles empty hash', () => {
    const result = deserializeLayerState('');
    expect(result.activeLayers.size).toBe(0);
    expect(result.mode).toBe('or');
    expect(result.preset).toBeNull();
  });

  it('handles null hash', () => {
    const result = deserializeLayerState(null);
    expect(result.activeLayers.size).toBe(0);
  });

  it('handles hash with only #', () => {
    const result = deserializeLayerState('#');
    expect(result.activeLayers.size).toBe(0);
  });

  it('handles hash without # prefix', () => {
    const result = deserializeLayerState('layers=strategic');
    expect(result.activeLayers.has('strategic')).toBe(true);
  });
});

// ─── LAYER_PRESETS validation ────────────────────────────────────────────────

// Import the mocked constants to validate their structure
import { SEMANTIC_LAYERS as SL, LAYER_PRESETS as LP } from '../js/state.js';

describe('LAYER_PRESETS', () => {
  it('has 4 presets', () => {
    expect(Object.keys(LP).length).toBe(4);
  });

  it('all preset layer keys are valid SEMANTIC_LAYERS keys', () => {
    for (const [, preset] of Object.entries(LP)) {
      for (const layerKey of preset.layers) {
        expect(SL).toHaveProperty(layerKey);
      }
    }
  });

  it('complianceAudit includes compliance, foundation, crossRef', () => {
    expect(LP.complianceAudit.layers).toEqual(['compliance', 'foundation', 'crossRef']);
  });

  it('fullMesh includes all 6 layers', () => {
    expect(LP.fullMesh.layers.length).toBe(6);
  });
});

// ─── SEMANTIC_LAYERS validation ──────────────────────────────────────────────

describe('SEMANTIC_LAYERS', () => {
  it('has 6 layers', () => {
    expect(Object.keys(SL).length).toBe(6);
  });

  it('each layer has name, series array, and color', () => {
    for (const [, layer] of Object.entries(SL)) {
      expect(layer).toHaveProperty('name');
      expect(layer).toHaveProperty('series');
      expect(layer).toHaveProperty('color');
      expect(Array.isArray(layer.series)).toBe(true);
      expect(layer.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  it('crossRef layer has empty series array', () => {
    expect(SL.crossRef.series).toEqual([]);
  });
});

// ─── Round-trip serialisation ────────────────────────────────────────────────

describe('serialise → deserialise round-trip', () => {
  it('round-trips layers + mode + preset', () => {
    const layers = new Set(['compliance', 'foundation', 'crossRef']);
    const hash = serializeLayerState(layers, 'and', 'complianceAudit');
    const result = deserializeLayerState(hash);
    expect(result.activeLayers).toEqual(layers);
    expect(result.mode).toBe('and');
    expect(result.preset).toBe('complianceAudit');
  });

  it('round-trips single layer with default mode', () => {
    const layers = new Set(['strategic']);
    const hash = serializeLayerState(layers, 'or', null);
    const result = deserializeLayerState(hash);
    expect(result.activeLayers).toEqual(layers);
    expect(result.mode).toBe('or');
    expect(result.preset).toBeNull();
  });
});
