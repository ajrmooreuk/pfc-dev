/**
 * Unit tests for multi-loader.js — Phase 2 functions + cross-ref bug fix.
 *
 * These tests mock browser-dependent imports (state.js, ontology-parser.js,
 * github-loader.js) and test the pure logic functions in isolation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock browser-dependent modules before importing the module under test
vi.mock('../js/state.js', () => ({
  state: {
    viewMode: 'multi',
    loadedOntologies: new Map(),
    mergedGraph: null,
    seriesData: null,
  },
  REGISTRY_BASE_PATH: '../../ONTOLOGIES/ontology-library/',
  SERIES_COLORS: {
    'VE-Series': '#2196F3',
    'PE-Series': '#4CAF50',
    'Foundation': '#FF9800',
    'Competitive': '#E91E63',
    'RCSG-Series': '#9C27B0',
    'Orchestration': '#00BCD4',
    'placeholder': '#616161',
  },
  LINEAGE_CHAINS: {
    VE: ['VSOM', 'OKR', 'VP', 'PMF', 'EFS'],
    PE: ['PPM', 'PE', 'EFS', 'EA'],
    EA: ['EA-CORE', 'EA-TOGAF', 'EA-MSFT', 'EA-AI'],
  },
}));

vi.mock('../js/ontology-parser.js', () => ({
  parseOntology: vi.fn(() => ({ nodes: [], edges: [], name: 'mock' })),
}));

vi.mock('../js/github-loader.js', () => ({
  loadRegistryIndex: vi.fn(),
}));

// Now import the functions under test
const { buildCrossSeriesEdges, getOntologiesForSeries, detectCrossReferences, getNodeSeries, resolveSeriesForOntology, resolveSubSeriesForOntology, getSubSeriesForSeries, getOntologiesForSubSeries, buildSubSeriesData, validateRegistryMetadata, discoverProcesses, discoverApplications, classifyLineageEdge, getNodeLineageRole } = await import('../js/multi-loader.js');


// ========================================
// TEST DATA FACTORIES
// ========================================

function createLoadedOntologies(entries) {
  const map = new Map();
  for (const entry of entries) {
    map.set(entry.namespace, {
      name: entry.name,
      series: entry.series,
      isPlaceholder: entry.isPlaceholder || false,
      registryEntry: entry.registryEntry || null,
      parsed: entry.parsed || { nodes: [], edges: [] },
      rawData: entry.rawData || {},
      status: entry.status || 'active',
    });
  }
  return map;
}

function createCrossEdge(from, to, label, sourceNamespace) {
  return {
    from,
    to,
    label: label || 'cross-ref',
    edgeType: 'crossOntology',
    purpose: '',
    sourceNamespace,
    isCrossOntology: true,
  };
}


// ========================================
// buildCrossSeriesEdges
// ========================================

describe('buildCrossSeriesEdges', () => {
  let loadedOntologies;

  beforeEach(() => {
    loadedOntologies = createLoadedOntologies([
      { namespace: 'vsom:', name: 'VSOM', series: 'VE-Series' },
      { namespace: 'okr:', name: 'OKR', series: 'VE-Series' },
      { namespace: 'vp:', name: 'VP', series: 'VE-Series' },
      { namespace: 'ppm:', name: 'PPM', series: 'PE-Series' },
      { namespace: 'pe:', name: 'PE', series: 'PE-Series' },
      { namespace: 'org:', name: 'ORG', series: 'Foundation' },
    ]);
  });

  it('returns empty array when no cross-series edges exist', () => {
    const crossEdges = [
      createCrossEdge('vsom::Entity1', 'okr::Entity2', 'intra-ref', 'vsom:'),
    ];
    const result = buildCrossSeriesEdges(crossEdges, loadedOntologies);
    expect(result).toEqual([]);
  });

  it('aggregates cross-series edges between VE and PE', () => {
    const crossEdges = [
      createCrossEdge('vsom::Objective', 'ppm::Portfolio', 'aligns', 'vsom:'),
      createCrossEdge('vp::ValueProp', 'pe::Process', 'enables', 'vp:'),
    ];
    const result = buildCrossSeriesEdges(crossEdges, loadedOntologies);
    expect(result).toHaveLength(1);
    expect(result[0].from).toBe('PE-Series');
    expect(result[0].to).toBe('VE-Series');
    expect(result[0].count).toBe(2);
    expect(result[0].bridges).toEqual(['aligns', 'enables']);
  });

  it('normalises direction alphabetically to avoid duplicates', () => {
    const crossEdges = [
      createCrossEdge('vsom::A', 'ppm::B', 'forward', 'vsom:'),
      createCrossEdge('ppm::C', 'vsom::D', 'reverse', 'ppm:'),
    ];
    const result = buildCrossSeriesEdges(crossEdges, loadedOntologies);
    expect(result).toHaveLength(1);
    // PE-Series < VE-Series alphabetically
    expect(result[0].from).toBe('PE-Series');
    expect(result[0].to).toBe('VE-Series');
    expect(result[0].count).toBe(2);
  });

  it('creates separate edges for different series pairs', () => {
    const crossEdges = [
      createCrossEdge('vsom::A', 'ppm::B', 'VE-PE', 'vsom:'),
      createCrossEdge('vsom::C', 'org::D', 'VE-Foundation', 'vsom:'),
    ];
    const result = buildCrossSeriesEdges(crossEdges, loadedOntologies);
    expect(result).toHaveLength(2);

    const pairs = result.map(r => `${r.from}->${r.to}`).sort();
    expect(pairs).toContain('Foundation->VE-Series');
    expect(pairs).toContain('PE-Series->VE-Series');
  });

  it('skips edges with unknown namespaces', () => {
    const crossEdges = [
      createCrossEdge('vsom::A', 'unknown::B', 'bad-ref', 'vsom:'),
    ];
    const result = buildCrossSeriesEdges(crossEdges, loadedOntologies);
    expect(result).toEqual([]);
  });

  it('skips edges with unknown source namespace', () => {
    const crossEdges = [
      createCrossEdge('unknown::A', 'ppm::B', 'bad-ref', 'unknown:'),
    ];
    const result = buildCrossSeriesEdges(crossEdges, loadedOntologies);
    expect(result).toEqual([]);
  });

  it('returns empty array for empty input', () => {
    const result = buildCrossSeriesEdges([], loadedOntologies);
    expect(result).toEqual([]);
  });
});


// ========================================
// getOntologiesForSeries
// ========================================

describe('getOntologiesForSeries', () => {
  let loadedOntologies;

  beforeEach(() => {
    loadedOntologies = createLoadedOntologies([
      { namespace: 'vsom:', name: 'VSOM', series: 'VE-Series' },
      { namespace: 'okr:', name: 'OKR', series: 'VE-Series' },
      { namespace: 'vp:', name: 'VP', series: 'VE-Series' },
      { namespace: 'ppm:', name: 'PPM', series: 'PE-Series' },
      { namespace: 'pe:', name: 'PE', series: 'PE-Series' },
      { namespace: 'org:', name: 'ORG', series: 'Foundation' },
    ]);
  });

  it('returns VE-Series ontologies', () => {
    const result = getOntologiesForSeries('VE-Series', loadedOntologies);
    expect(result.size).toBe(3);
    expect(result.has('vsom:')).toBe(true);
    expect(result.has('okr:')).toBe(true);
    expect(result.has('vp:')).toBe(true);
  });

  it('returns PE-Series ontologies', () => {
    const result = getOntologiesForSeries('PE-Series', loadedOntologies);
    expect(result.size).toBe(2);
    expect(result.has('ppm:')).toBe(true);
    expect(result.has('pe:')).toBe(true);
  });

  it('returns Foundation ontologies', () => {
    const result = getOntologiesForSeries('Foundation', loadedOntologies);
    expect(result.size).toBe(1);
    expect(result.has('org:')).toBe(true);
  });

  it('returns empty Map for unknown series', () => {
    const result = getOntologiesForSeries('Nonexistent', loadedOntologies);
    expect(result.size).toBe(0);
  });

  it('returns empty Map for empty ontologies', () => {
    const result = getOntologiesForSeries('VE-Series', new Map());
    expect(result.size).toBe(0);
  });

  it('preserves record data in filtered results', () => {
    const result = getOntologiesForSeries('VE-Series', loadedOntologies);
    const vsomRecord = result.get('vsom:');
    expect(vsomRecord.name).toBe('VSOM');
    expect(vsomRecord.series).toBe('VE-Series');
  });
});


// ========================================
// detectCrossReferences — Bug Fix Verification
// TC-5: Both keyBridges and crossOntology properties read
// ========================================

describe('detectCrossReferences — cross-ref property bug fix', () => {
  it('reads bridges from keyBridges property (VP pattern)', () => {
    const loadedOntologies = createLoadedOntologies([
      {
        namespace: 'vp:',
        name: 'VP',
        series: 'VE-Series',
        registryEntry: {
          relationships: {
            keyBridges: [
              { from: 'vp:ValueProposition', to: 'vsom:ObjectivesComponent', name: 'aligns-to' },
            ],
            crossOntology: 8, // count, not array — should be ignored
          },
        },
        rawData: {},
      },
      {
        namespace: 'vsom:',
        name: 'VSOM',
        series: 'VE-Series',
        registryEntry: { relationships: {} },
        rawData: {},
      },
    ]);

    const mergedGraph = {
      nodes: [],
      edges: [],
      nodeIndex: new Map([
        ['vp::ValueProposition', true],
        ['vsom::ObjectivesComponent', true],
      ]),
    };

    const result = detectCrossReferences(loadedOntologies, mergedGraph);
    expect(result.length).toBeGreaterThanOrEqual(1);

    const alignsEdge = result.find(e => e.label === 'aligns-to');
    expect(alignsEdge).toBeDefined();
    expect(alignsEdge.from).toBe('vp::ValueProposition');
    expect(alignsEdge.to).toBe('vsom::ObjectivesComponent');
    expect(alignsEdge.sourceNamespace).toBe('vp:');
  });

  it('reads bridges from crossOntology property (VSOM pattern)', () => {
    const loadedOntologies = createLoadedOntologies([
      {
        namespace: 'vsom:',
        name: 'VSOM',
        series: 'VE-Series',
        registryEntry: {
          relationships: {
            crossOntology: [
              { from: 'vsom:Objective', to: 'okr:KeyResult', name: 'drives' },
            ],
            // no keyBridges property at all
          },
        },
        rawData: {},
      },
      {
        namespace: 'okr:',
        name: 'OKR',
        series: 'VE-Series',
        registryEntry: { relationships: {} },
        rawData: {},
      },
    ]);

    const mergedGraph = {
      nodes: [],
      edges: [],
      nodeIndex: new Map([
        ['vsom::Objective', true],
        ['okr::KeyResult', true],
      ]),
    };

    const result = detectCrossReferences(loadedOntologies, mergedGraph);
    expect(result.length).toBeGreaterThanOrEqual(1);

    const drivesEdge = result.find(e => e.label === 'drives');
    expect(drivesEdge).toBeDefined();
    expect(drivesEdge.from).toBe('vsom::Objective');
    expect(drivesEdge.to).toBe('okr::KeyResult');
    expect(drivesEdge.sourceNamespace).toBe('vsom:');
  });

  it('reads from both keyBridges and crossOntology when both are arrays', () => {
    const loadedOntologies = createLoadedOntologies([
      {
        namespace: 'dual:',
        name: 'Dual',
        series: 'VE-Series',
        registryEntry: {
          relationships: {
            keyBridges: [
              { from: 'dual:A', to: 'other:B', name: 'bridge-link' },
            ],
            crossOntology: [
              { from: 'dual:C', to: 'other:D', name: 'cross-link' },
            ],
          },
        },
        rawData: {},
      },
      {
        namespace: 'other:',
        name: 'Other',
        series: 'PE-Series',
        registryEntry: { relationships: {} },
        rawData: {},
      },
    ]);

    const mergedGraph = {
      nodes: [],
      edges: [],
      nodeIndex: new Map([
        ['dual::A', true],
        ['other::B', true],
        ['dual::C', true],
        ['other::D', true],
      ]),
    };

    const result = detectCrossReferences(loadedOntologies, mergedGraph);
    const labels = result.map(e => e.label);
    expect(labels).toContain('bridge-link');
    expect(labels).toContain('cross-link');
  });

  it('ignores non-array crossOntology (count value like VP)', () => {
    const loadedOntologies = createLoadedOntologies([
      {
        namespace: 'count:',
        name: 'Count',
        series: 'VE-Series',
        registryEntry: {
          relationships: {
            crossOntology: 8, // numeric count, not an array
            // no keyBridges
          },
        },
        rawData: {},
      },
    ]);

    const mergedGraph = { nodes: [], edges: [], nodeIndex: new Map() };
    const result = detectCrossReferences(loadedOntologies, mergedGraph);
    // Should not crash, should return empty (no valid bridges)
    expect(result).toEqual([]);
  });

  it('skips placeholder ontologies', () => {
    const loadedOntologies = createLoadedOntologies([
      {
        namespace: 'placeholder:',
        name: 'Placeholder',
        series: 'VE-Series',
        isPlaceholder: true,
        registryEntry: {
          relationships: {
            crossOntology: [
              { from: 'placeholder:A', to: 'other:B', name: 'should-skip' },
            ],
          },
        },
        rawData: {},
      },
      {
        namespace: 'other:',
        name: 'Other',
        series: 'PE-Series',
        registryEntry: { relationships: {} },
        rawData: {},
      },
    ]);

    const mergedGraph = {
      nodes: [],
      edges: [],
      nodeIndex: new Map([
        ['placeholder::A', true],
        ['other::B', true],
      ]),
    };

    const result = detectCrossReferences(loadedOntologies, mergedGraph);
    expect(result).toEqual([]);
  });

  it('deduplicates edges with the same key', () => {
    const loadedOntologies = createLoadedOntologies([
      {
        namespace: 'src:',
        name: 'Source',
        series: 'VE-Series',
        registryEntry: {
          relationships: {
            keyBridges: [
              { from: 'src:A', to: 'tgt:B', name: 'dup-link' },
            ],
            crossOntology: [
              { from: 'src:A', to: 'tgt:B', name: 'dup-link' },
            ],
          },
        },
        rawData: {},
      },
      {
        namespace: 'tgt:',
        name: 'Target',
        series: 'PE-Series',
        registryEntry: { relationships: {} },
        rawData: {},
      },
    ]);

    const mergedGraph = {
      nodes: [],
      edges: [],
      nodeIndex: new Map([
        ['src::A', true],
        ['tgt::B', true],
      ]),
    };

    const result = detectCrossReferences(loadedOntologies, mergedGraph);
    const dupLinks = result.filter(e => e.label === 'dup-link');
    expect(dupLinks).toHaveLength(1);
  });

  it('handles missing relationships object gracefully', () => {
    const loadedOntologies = createLoadedOntologies([
      {
        namespace: 'norefs:',
        name: 'NoRefs',
        series: 'VE-Series',
        registryEntry: {
          // no relationships property
        },
        rawData: {},
      },
    ]);

    const mergedGraph = { nodes: [], edges: [], nodeIndex: new Map() };
    const result = detectCrossReferences(loadedOntologies, mergedGraph);
    expect(result).toEqual([]);
  });
});


// ========================================
// getNodeSeries
// ========================================

describe('getNodeSeries', () => {
  let loadedOntologies;

  beforeEach(() => {
    loadedOntologies = createLoadedOntologies([
      { namespace: 'vsom:', name: 'VSOM', series: 'VE-Series' },
      { namespace: 'ppm:', name: 'PPM', series: 'PE-Series' },
      { namespace: 'org:', name: 'ORG', series: 'Foundation' },
    ]);
  });

  it('returns series for known namespace', () => {
    expect(getNodeSeries('vsom:', loadedOntologies)).toBe('VE-Series');
    expect(getNodeSeries('ppm:', loadedOntologies)).toBe('PE-Series');
    expect(getNodeSeries('org:', loadedOntologies)).toBe('Foundation');
  });

  it('returns null for unknown namespace', () => {
    expect(getNodeSeries('unknown:', loadedOntologies)).toBeNull();
  });

  it('returns null when loadedOntologies is null', () => {
    expect(getNodeSeries('vsom:', null)).toBeNull();
  });

  it('returns null when loadedOntologies is undefined', () => {
    expect(getNodeSeries('vsom:', undefined)).toBeNull();
  });
});


// ========================================
// resolveSeriesForOntology — series resolution bug fix
// ========================================

describe('resolveSeriesForOntology — series resolution', () => {
  const seriesRegistry = {
    'VE-Series': { ontologies: ['VSOM', 'OKR', 'VP', 'RRR', 'PMF', 'KPI'] },
    'PE-Series': { ontologies: ['PPM', 'PE', 'EFS', 'EA', 'EA-CORE', 'EA-TOGAF', 'EA-MSFT', 'DS'] },
    'RCSG-Series': { ontologies: ['RCSG-FW', 'MCSB', 'MCSB2', 'GDPR', 'AZALZ', 'PII'] },
    'Foundation': { ontologies: ['ORG', 'ORG-CONTEXT', 'ORG-MAT', 'CTX'] },
    'Competitive': { ontologies: ['CA', 'CL', 'GA'] },
    'Orchestration': { ontologies: ['EMC'] },
  };

  it('resolves "EMC Ontology (...)" to Orchestration', () => {
    expect(resolveSeriesForOntology('EMC Ontology (Enterprise Model Composition)', seriesRegistry)).toBe('Orchestration');
  });

  it('resolves "GDPR Regulatory Framework Ontology" to RCSG-Series (not Foundation)', () => {
    expect(resolveSeriesForOntology('GDPR Regulatory Framework Ontology', seriesRegistry)).toBe('RCSG-Series');
  });

  it('resolves "PII Governance Ontology (Microsoft Native Web Apps)" to RCSG-Series', () => {
    expect(resolveSeriesForOntology('PII Governance Ontology (Microsoft Native Web Apps)', seriesRegistry)).toBe('RCSG-Series');
  });

  it('resolves "RCSG-FW Ontology (RCSG Framework)" to RCSG-Series', () => {
    expect(resolveSeriesForOntology('RCSG-FW Ontology (RCSG Framework)', seriesRegistry)).toBe('RCSG-Series');
  });

  it('resolves "CTX Ontology (...)" to Foundation', () => {
    expect(resolveSeriesForOntology('CTX Ontology (ContextTypes)', seriesRegistry)).toBe('Foundation');
  });

  it('falls back to Foundation for unknown names', () => {
    expect(resolveSeriesForOntology('Unknown Thing', seriesRegistry)).toBe('Foundation');
  });

  it('falls back to Foundation when seriesRegistry is null', () => {
    expect(resolveSeriesForOntology('VSOM Ontology', null)).toBe('Foundation');
  });

  it('resolves sub-series ontology "BSC Ontology" to VE-Series (parent series)', () => {
    const regWithSub = {
      ...seriesRegistry,
      'VE-Series': {
        ...seriesRegistry['VE-Series'],
        subSeries: { 'VSOM-SA': { ontologies: ['BSC', 'INDUSTRY', 'REASON', 'MACRO', 'PORTFOLIO'] } }
      }
    };
    expect(resolveSeriesForOntology('BSC Ontology (Balanced Scorecard)', regWithSub)).toBe('VE-Series');
  });

  it('resolves EA sub-series ontologies to PE-Series via subSeries (not top-level ontologies)', () => {
    const regWithEA = {
      ...seriesRegistry,
      'PE-Series': {
        ontologies: ['PPM', 'PE', 'EFS', 'DS'],
        subSeries: { 'EA': { ontologies: ['EA-CORE', 'EA-TOGAF', 'EA-MSFT', 'EA-AI'] } }
      }
    };
    expect(resolveSeriesForOntology('EA-CORE Ontology (Enterprise Architecture Core)', regWithEA)).toBe('PE-Series');
    expect(resolveSeriesForOntology('EA-TOGAF Ontology (TOGAF ADM Methodology)', regWithEA)).toBe('PE-Series');
    expect(resolveSeriesForOntology('EA-MSFT Ontology (Microsoft Cloud Platform)', regWithEA)).toBe('PE-Series');
    expect(resolveSeriesForOntology('EA-AI Ontology (AI/ML Architecture)', regWithEA)).toBe('PE-Series');
  });
});

// ========================================
// resolveSubSeriesForOntology
// ========================================

describe('resolveSubSeriesForOntology', () => {
  const seriesRegistry = {
    'VE-Series': {
      ontologies: ['VSOM', 'OKR', 'VP', 'RRR', 'PMF', 'KPI'],
      subSeries: {
        'VSOM-SA': { name: 'VSOM Strategy Analysis', ontologies: ['BSC', 'INDUSTRY', 'REASON', 'MACRO', 'PORTFOLIO'] },
        'VSOM-SC': { name: 'VSOM Strategy Communication', ontologies: [] }
      }
    },
    'PE-Series': { ontologies: ['PPM', 'PE', 'EFS'] }
  };

  it('resolves BSC to VSOM-SA', () => {
    expect(resolveSubSeriesForOntology('BSC Ontology (Balanced Scorecard)', seriesRegistry)).toBe('VSOM-SA');
  });

  it('resolves INDUSTRY to VSOM-SA', () => {
    expect(resolveSubSeriesForOntology('INDUSTRY Ontology (Porter 5F)', seriesRegistry)).toBe('VSOM-SA');
  });

  it('resolves PORTFOLIO to VSOM-SA', () => {
    expect(resolveSubSeriesForOntology('PORTFOLIO', seriesRegistry)).toBe('VSOM-SA');
  });

  it('returns null for top-level VE ontology', () => {
    expect(resolveSubSeriesForOntology('VSOM Ontology', seriesRegistry)).toBeNull();
  });

  it('returns null for PE-Series ontology', () => {
    expect(resolveSubSeriesForOntology('PPM Ontology', seriesRegistry)).toBeNull();
  });

  it('returns null when seriesRegistry is null', () => {
    expect(resolveSubSeriesForOntology('BSC Ontology', null)).toBeNull();
  });

  it('resolves EA-CORE to EA sub-series', () => {
    const regWithEA = {
      ...seriesRegistry,
      'PE-Series': {
        ontologies: ['PPM', 'PE', 'EFS'],
        subSeries: { 'EA': { name: 'Enterprise Architecture', ontologies: ['EA-CORE', 'EA-TOGAF', 'EA-MSFT', 'EA-AI'] } }
      }
    };
    expect(resolveSubSeriesForOntology('EA-CORE Ontology (Enterprise Architecture Core)', regWithEA)).toBe('EA');
    expect(resolveSubSeriesForOntology('EA-AI Ontology (AI/ML Architecture)', regWithEA)).toBe('EA');
  });
});

// ========================================
// getSubSeriesForSeries
// ========================================

describe('getSubSeriesForSeries', () => {
  const subSeriesData = {
    'VE-Series::VSOM-SA': { name: 'SA', parentSeries: 'VE-Series', count: 5 },
    'VE-Series::VSOM-SC': { name: 'SC', parentSeries: 'VE-Series', count: 0 },
    'PE-Series::PE-EXT': { name: 'PE Extension', parentSeries: 'PE-Series', count: 2 }
  };

  it('returns only sub-series for the specified parent', () => {
    const result = getSubSeriesForSeries('VE-Series', subSeriesData);
    expect(Object.keys(result)).toEqual(['VE-Series::VSOM-SA', 'VE-Series::VSOM-SC']);
  });

  it('returns empty object for series with no sub-series', () => {
    expect(getSubSeriesForSeries('Foundation', subSeriesData)).toEqual({});
  });

  it('returns empty object when subSeriesData is null', () => {
    expect(getSubSeriesForSeries('VE-Series', null)).toEqual({});
  });
});

// ========================================
// getOntologiesForSubSeries
// ========================================

describe('getOntologiesForSubSeries', () => {
  it('returns only ontologies matching both series and subSeries', () => {
    const loaded = createLoadedOntologies([
      { namespace: 'bsc:', name: 'BSC Ontology', series: 'VE-Series' },
      { namespace: 'ind:', name: 'INDUSTRY Ontology', series: 'VE-Series' },
      { namespace: 'vsom:', name: 'VSOM Ontology', series: 'VE-Series' },
      { namespace: 'ppm:', name: 'PPM Ontology', series: 'PE-Series' }
    ]);
    loaded.get('bsc:').subSeries = 'VSOM-SA';
    loaded.get('ind:').subSeries = 'VSOM-SA';

    const result = getOntologiesForSubSeries('VE-Series', 'VSOM-SA', loaded);
    expect(result.size).toBe(2);
    expect(result.has('bsc:')).toBe(true);
    expect(result.has('ind:')).toBe(true);
    expect(result.has('vsom:')).toBe(false);
  });

  it('returns empty map when no ontologies match', () => {
    const loaded = createLoadedOntologies([
      { namespace: 'vsom:', name: 'VSOM Ontology', series: 'VE-Series' }
    ]);
    const result = getOntologiesForSubSeries('VE-Series', 'VSOM-SA', loaded);
    expect(result.size).toBe(0);
  });
});

// ========================================
// buildSubSeriesData
// ========================================

describe('buildSubSeriesData', () => {
  const seriesRegistry = {
    'VE-Series': {
      name: 'Value Engineering Series',
      ontologies: ['VSOM', 'OKR'],
      subSeries: {
        'VSOM-SA': { name: 'VSOM Strategy Analysis', description: 'SA desc', ontologies: ['BSC', 'INDUSTRY'] },
        'VSOM-SC': { name: 'VSOM Strategy Communication', description: 'SC desc', ontologies: [] }
      }
    },
    'PE-Series': { name: 'Platform Engineering', ontologies: ['PPM'] }
  };

  it('builds composite keys correctly', () => {
    const loaded = createLoadedOntologies([
      { namespace: 'vsom:', name: 'VSOM Ontology', series: 'VE-Series' },
      { namespace: 'bsc:', name: 'BSC Ontology', series: 'VE-Series' },
      { namespace: 'ind:', name: 'INDUSTRY Ontology', series: 'VE-Series' }
    ]);
    loaded.get('bsc:').subSeries = 'VSOM-SA';
    loaded.get('ind:').subSeries = 'VSOM-SA';

    const result = buildSubSeriesData(seriesRegistry, loaded);
    expect(result).toHaveProperty('VE-Series::VSOM-SA');
    expect(result).toHaveProperty('VE-Series::VSOM-SC');
    expect(Object.keys(result)).toHaveLength(2);
  });

  it('counts loaded ontologies per sub-series', () => {
    const loaded = createLoadedOntologies([
      { namespace: 'vsom:', name: 'VSOM Ontology', series: 'VE-Series' },
      { namespace: 'bsc:', name: 'BSC Ontology', series: 'VE-Series' },
      { namespace: 'ind:', name: 'INDUSTRY Ontology', series: 'VE-Series' }
    ]);
    loaded.get('bsc:').subSeries = 'VSOM-SA';
    loaded.get('ind:').subSeries = 'VSOM-SA';

    const result = buildSubSeriesData(seriesRegistry, loaded);
    expect(result['VE-Series::VSOM-SA'].count).toBe(2);
    expect(result['VE-Series::VSOM-SC'].count).toBe(0);
  });

  it('resolves parent ontology namespace', () => {
    const loaded = createLoadedOntologies([
      { namespace: 'vsom:', name: 'VSOM Ontology', series: 'VE-Series' },
      { namespace: 'bsc:', name: 'BSC Ontology', series: 'VE-Series' }
    ]);
    loaded.get('bsc:').subSeries = 'VSOM-SA';

    const result = buildSubSeriesData(seriesRegistry, loaded);
    expect(result['VE-Series::VSOM-SA'].parentOntologyNs).toBe('vsom:');
    expect(result['VE-Series::VSOM-SA'].parentOntologyShort).toBe('VSOM');
  });

  it('returns empty object when seriesRegistry is null', () => {
    const loaded = createLoadedOntologies([]);
    expect(buildSubSeriesData(null, loaded)).toEqual({});
  });

  it('returns empty object for series without subSeries', () => {
    const reg = { 'PE-Series': { name: 'PE', ontologies: ['PPM'] } };
    const loaded = createLoadedOntologies([]);
    expect(buildSubSeriesData(reg, loaded)).toEqual({});
  });
});

// ========================================
// VALIDATE REGISTRY METADATA
// ========================================

describe('validateRegistryMetadata', () => {
  it('returns correct metadata from a valid registry', () => {
    const registry = {
      version: '7.0.0',
      oaaVersion: '6.1.0',
      lastUpdated: '2026-02-13',
      entries: [
        { '@id': 'Entry-ONT-VSOM-001', name: 'VSOM Ontology', namespace: 'vsom:', status: 'compliant' },
        { '@id': 'Entry-ONT-OKR-001', name: 'OKR Ontology', namespace: 'okr:', status: 'compliant' }
      ],
      statistics: { totalOntologies: 2 },
      seriesRegistry: {
        'VE-Series': { name: 'VE', ontologies: ['VSOM', 'OKR'] }
      }
    };
    const result = validateRegistryMetadata(registry);
    expect(result.version).toBe('7.0.0');
    expect(result.oaaVersion).toBe('6.1.0');
    expect(result.lastUpdated).toBe('2026-02-13');
    expect(result.totalEntries).toBe(2);
    expect(result.declaredTotal).toBe(2);
    expect(result.warnings).toHaveLength(0);
    expect(result.seriesOrphans).toHaveLength(0);
  });

  it('warns when statistics.totalOntologies mismatches entries.length', () => {
    const registry = {
      version: '7.0.0',
      entries: [
        { '@id': 'Entry-ONT-ORG-001', name: 'ORG Ontology', namespace: 'org:', status: 'compliant' }
      ],
      statistics: { totalOntologies: 5 },
      seriesRegistry: { 'Foundation': { ontologies: ['ORG'] } }
    };
    const result = validateRegistryMetadata(registry);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0]).toContain('mismatch');
    expect(result.warnings[0]).toContain('5');
    expect(result.warnings[0]).toContain('1');
  });

  it('detects series orphans when entry not in any seriesRegistry', () => {
    const registry = {
      version: '1.0.0',
      entries: [
        { '@id': 'Entry-ONT-VSOM-001', name: 'VSOM Ontology', namespace: 'vsom:', status: 'compliant' },
        { '@id': 'Entry-ONT-NEW-001', name: 'NEW Ontology', namespace: 'new:', status: 'compliant' }
      ],
      statistics: { totalOntologies: 2 },
      seriesRegistry: {
        'VE-Series': { ontologies: ['VSOM'] },
        'Foundation': { ontologies: [] }
      }
    };
    const result = validateRegistryMetadata(registry);
    expect(result.seriesOrphans).toContain('NEW Ontology');
    expect(result.warnings.some(w => w.includes('not covered'))).toBe(true);
  });

  it('ignores deprecated entries for orphan detection', () => {
    const registry = {
      version: '1.0.0',
      entries: [
        { '@id': 'Entry-ONT-CA-001', name: 'CA Ontology [DEPRECATED]', namespace: 'ca:', status: 'deprecated' }
      ],
      statistics: { totalOntologies: 1 },
      seriesRegistry: { 'Foundation': { ontologies: [] } }
    };
    const result = validateRegistryMetadata(registry);
    expect(result.seriesOrphans).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });
});


// ========================================
// F40.16: PROCESS & APPLICATION DISCOVERY
// ========================================

function createRegistryRecord(ns, name, instanceData) {
  return {
    namespace: ns,
    name: name,
    series: 'PE-Series',
    registryEntry: {
      artifacts: { instanceData: instanceData || [] }
    },
    parsed: { nodes: [], edges: [] }
  };
}

describe('discoverProcesses', () => {
  it('returns empty array when no ontologies loaded', () => {
    const result = discoverProcesses(new Map());
    expect(result).toEqual([]);
  });

  it('returns empty array when no instanceData has peProcessRef', () => {
    const ontologies = new Map();
    ontologies.set('ds:', createRegistryRecord('ds:', 'DS Ontology', [
      { brand: 'vhf', status: 'draft' }
    ]));
    const result = discoverProcesses(ontologies);
    expect(result).toEqual([]);
  });

  it('discovers processes from instanceData peProcessRef fields', () => {
    const ontologies = new Map();
    ontologies.set('ds:', createRegistryRecord('ds:', 'DS Ontology (Design System)', [
      { brand: 'baiv', status: 'populated', peProcessRef: 'PE-DS-EXTRACT-001' },
      { brand: 'rcs', status: 'populated', peProcessRef: 'PE-DS-EXTRACT-001' },
      { brand: 'pfc', status: 'populated', peProcessRef: 'PE-DS-EXTRACT-002' }
    ]));

    const result = discoverProcesses(ontologies);
    expect(result).toHaveLength(2);

    const extract001 = result.find(p => p.processId === 'PE-DS-EXTRACT-001');
    expect(extract001).toBeDefined();
    expect(extract001.instanceCount).toBe(2);
    expect(extract001.name).toBe('Design System Token Extraction');
    expect(extract001.parentNs).toBe('ds:');

    const extract002 = result.find(p => p.processId === 'PE-DS-EXTRACT-002');
    expect(extract002).toBeDefined();
    expect(extract002.instanceCount).toBe(1);
    expect(extract002.name).toBe('Application Skeleton Authoring');
  });

  it('handles ontologies with no registryEntry gracefully', () => {
    const ontologies = new Map();
    ontologies.set('pe:', { namespace: 'pe:', name: 'PE Ontology', registryEntry: null });
    const result = discoverProcesses(ontologies);
    expect(result).toEqual([]);
  });

  it('collects instance details (brand, status, version)', () => {
    const ontologies = new Map();
    ontologies.set('ds:', createRegistryRecord('ds:', 'DS Ontology', [
      { brand: 'baiv', status: 'populated', version: '1.0.0', peProcessRef: 'PE-DS-EXTRACT-001' }
    ]));

    const result = discoverProcesses(ontologies);
    expect(result[0].instances).toHaveLength(1);
    expect(result[0].instances[0]).toEqual({ brand: 'baiv', status: 'populated', version: '1.0.0' });
  });
});

describe('discoverApplications', () => {
  it('returns empty array when no ontologies loaded', () => {
    const result = discoverApplications(new Map());
    expect(result).toEqual([]);
  });

  it('discovers skeleton entries via peProcessRef PE-DS-EXTRACT-002', () => {
    const ontologies = new Map();
    ontologies.set('ds:', createRegistryRecord('ds:', 'DS Ontology (Design System)', [
      { brand: 'baiv', status: 'populated', peProcessRef: 'PE-DS-EXTRACT-001' },
      { brand: 'pfc', status: 'populated', version: '1.0.0', peProcessRef: 'PE-DS-EXTRACT-002', description: 'PFC base application skeleton — 20 zones' }
    ]));

    const result = discoverApplications(ontologies);
    expect(result).toHaveLength(1);
    expect(result[0].brand).toBe('pfc');
    expect(result[0].cascadeTier).toBe('PFC');
    expect(result[0].appName).toBe('PFC base application skeleton');
    expect(result[0].parentNs).toBe('ds:');
  });

  it('discovers skeleton entries via path containing skeleton', () => {
    const ontologies = new Map();
    ontologies.set('ds:', createRegistryRecord('ds:', 'DS Ontology', [
      { brand: 'baiv', status: 'populated', path: 'instance-data/baiv-app-skeleton-v1.0.0.jsonld', version: '1.0.0' }
    ]));

    const result = discoverApplications(ontologies);
    expect(result).toHaveLength(1);
    expect(result[0].brand).toBe('baiv');
    expect(result[0].cascadeTier).toBe('PFI');
  });

  it('enriches with zone/nav/component counts when skeleton is loaded', () => {
    const ontologies = new Map();
    ontologies.set('ds:', createRegistryRecord('ds:', 'DS Ontology', [
      { brand: 'pfc', status: 'populated', version: '1.0.0', peProcessRef: 'PE-DS-EXTRACT-002' }
    ]));

    const zoneRegistry = new Map();
    zoneRegistry.set('Z1', { zone: {}, components: [{ id: 'c1' }, { id: 'c2' }] });
    zoneRegistry.set('Z2', { zone: {}, components: [{ id: 'c3' }] });

    const navLayerRegistry = new Map();
    navLayerRegistry.set('L1', { layer: {}, items: [] });

    const result = discoverApplications(ontologies, { '@graph': [] }, zoneRegistry, navLayerRegistry);
    expect(result[0].zones).toBe(2);
    expect(result[0].navLayers).toBe(1);
    expect(result[0].components).toBe(3);
  });

  it('returns null counts when no skeleton is loaded', () => {
    const ontologies = new Map();
    ontologies.set('ds:', createRegistryRecord('ds:', 'DS Ontology', [
      { brand: 'pfc', status: 'populated', peProcessRef: 'PE-DS-EXTRACT-002' }
    ]));

    const result = discoverApplications(ontologies, null, null, null);
    expect(result[0].zones).toBeNull();
    expect(result[0].navLayers).toBeNull();
    expect(result[0].components).toBeNull();
  });
});

// ========================================
// classifyLineageEdge — EA sub-series chain (F10.7)
// ========================================

describe('classifyLineageEdge — EA hub-spoke chain', () => {
  it('classifies EA-CORE → EA-TOGAF as PE lineage (within EA chain)', () => {
    const result = classifyLineageEdge('ea-core:', 'ea-togaf:');
    expect(result.isPE).toBe(true);
    expect(result.isVE).toBe(false);
  });

  it('classifies EA-CORE → EA-MSFT as PE lineage', () => {
    const result = classifyLineageEdge('ea-core:', 'ea-msft:');
    expect(result.isPE).toBe(true);
  });

  it('classifies EA-AI → EA-CORE as PE lineage (reverse direction)', () => {
    const result = classifyLineageEdge('ea-ai:', 'ea-core:');
    expect(result.isPE).toBe(true);
  });

  it('does not classify EA-CORE → VSOM as lineage', () => {
    const result = classifyLineageEdge('ea-core:', 'vsom:');
    expect(result.isPE).toBe(false);
    expect(result.isVE).toBe(false);
  });
});

// ========================================
// getNodeLineageRole — EA sub-series inclusion (F10.7)
// ========================================

describe('getNodeLineageRole — EA sub-series', () => {
  it('includes EA-CORE in PE lineage', () => {
    const result = getNodeLineageRole('ea-core:');
    expect(result.inPE).toBe(true);
    expect(result.inVE).toBe(false);
  });

  it('includes EA-TOGAF in PE lineage', () => {
    expect(getNodeLineageRole('ea-togaf:').inPE).toBe(true);
  });

  it('includes EA-MSFT in PE lineage', () => {
    expect(getNodeLineageRole('ea-msft:').inPE).toBe(true);
  });

  it('includes EA-AI in PE lineage', () => {
    expect(getNodeLineageRole('ea-ai:').inPE).toBe(true);
  });
});
