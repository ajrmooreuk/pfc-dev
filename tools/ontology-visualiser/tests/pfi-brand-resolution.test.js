/**
 * PFI → DS brand resolution — unit tests for resolveDSBrandForPFI().
 * Covers three-tier resolution: designSystemConfig.brand → fallback → brands[] array.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// vi.hoisted ensures the variable is available when the hoisted mock factory runs
const { mockDsInstances } = vi.hoisted(() => ({
  mockDsInstances: new Map(),
}));

// Mock state.js — resolveDSBrandForPFI reads state.dsInstances
vi.mock('../js/state.js', () => ({
  state: {
    dsInstances: mockDsInstances,
    highlightedSeries: new Set(),
    loadedOntologies: new Map(),
    brandContext: null,
    network: null,
    physicsEnabled: true,
    lastParsed: null,
    lastCompletenessScore: null,
    currentData: null,
    componentMap: new Map(),
    componentColoringActive: false,
    componentFilter: null,
    crossEdges: [],
    bridgeNodes: new Map(),
    bridgeFilterActive: false,
    crossEdgeFilterActive: false,
    selectionMode: false,
    authoringMode: false,
    diffMode: false,
    lastDiff: null,
    diffBaseData: null,
    pfiInstances: new Map(),
    pfiInstanceData: new Map(),
    activeDSBrand: null,
    dsAppliedCSSVars: null,
    dsArtefactHistory: new Map(),
    registryIndex: null,
  },
  EDGE_STYLES: {
    default: { color: '#555', width: 1.5, dashes: false, arrows: 'to', fontColor: '#888', fontSize: 10, smooth: { type: 'continuous', roundness: 0.3 }, priority: 1 },
  },
  TYPE_COLORS: { 'default': '#017c75' },
  EDGE_COLORS: { 'default': '#555' },
  SERIES_COLORS: {},
  LINEAGE_COLORS: {},
  SERIES_HIGHLIGHT_COLORS: {},
  COMPONENT_COLORS: [],
  CONTEXT_OPACITY: 0.55,
  REGISTRY_BASE_PATH: '../../ONTOLOGIES/ontology-library/',
}));

import { resolveDSBrandForPFI } from '../js/ds-loader.js';

describe('resolveDSBrandForPFI', () => {
  beforeEach(() => {
    mockDsInstances.clear();
    // Simulate loaded DS brands
    mockDsInstances.set('baiv', { designSystem: { 'ds:name': 'BAIV' } });
    mockDsInstances.set('rcs', { designSystem: { 'ds:name': 'RCS' } });
    mockDsInstances.set('pfc', { designSystem: { 'ds:name': 'PF-Core' } });
    mockDsInstances.set('pand', { designSystem: { 'ds:name': 'Pand' } });
    mockDsInstances.set('wwg', { designSystem: { 'ds:name': 'WWG' } });
    mockDsInstances.set('vhf-viridian', { designSystem: { 'ds:name': 'VHF Viridian' } });
  });

  // --- Tier 1: designSystemConfig.brand ---

  it('resolves PFI-BAIV via designSystemConfig.brand', () => {
    const config = {
      '@id': 'PFI-BAIV',
      brands: ['BAIV'],
      designSystemConfig: { brand: 'baiv', configVersion: '1.0.0' }
    };
    const result = resolveDSBrandForPFI(config);
    expect(result.brand).toBe('baiv');
    expect(result.source).toBe('designSystemConfig');
  });

  it('resolves PFI-RCS via designSystemConfig.brand', () => {
    const config = {
      '@id': 'PFI-RCS',
      brands: ['RCS'],
      designSystemConfig: { brand: 'rcs', configVersion: '1.0.0' }
    };
    const result = resolveDSBrandForPFI(config);
    expect(result.brand).toBe('rcs');
    expect(result.source).toBe('designSystemConfig');
  });

  // --- Tier 2: fallback ---

  it('resolves PFI-W4M via designSystemConfig.fallback when brand is null', () => {
    const config = {
      '@id': 'PFI-W4M',
      brands: ['W4M'],
      designSystemConfig: { brand: null, fallback: 'pfc', configVersion: '1.0.0' }
    };
    const result = resolveDSBrandForPFI(config);
    expect(result.brand).toBe('pfc');
    expect(result.source).toBe('fallback');
  });

  it('falls back when brand is not in loaded dsInstances', () => {
    const config = {
      '@id': 'PFI-X',
      brands: ['X'],
      designSystemConfig: { brand: 'nonexistent', fallback: 'pfc', configVersion: '1.0.0' }
    };
    const result = resolveDSBrandForPFI(config);
    expect(result.brand).toBe('pfc');
    expect(result.source).toBe('fallback');
  });

  // --- Tier 3: brands[] array ---

  it('falls back to brands[0] lowercase when no designSystemConfig', () => {
    const config = {
      '@id': 'PFI-PAND',
      brands: ['PAND'],
    };
    // 'PAND'.toLowerCase() = 'pand' which is in dsInstances
    const result = resolveDSBrandForPFI(config);
    expect(result.brand).toBe('pand');
    expect(result.source).toBe('brands-array');
  });

  it('falls back to brands[0] when designSystemConfig has no brand and no fallback', () => {
    const config = {
      '@id': 'PFI-WWG',
      brands: ['WWG'],
      designSystemConfig: { configVersion: '1.0.0' }
    };
    const result = resolveDSBrandForPFI(config);
    expect(result.brand).toBe('wwg');
    expect(result.source).toBe('brands-array');
  });

  // --- No match ---

  it('returns null brand when brands[] does not match any dsInstance', () => {
    const config = {
      '@id': 'PFI-UNKNOWN',
      brands: ['UNKNOWN'],
      designSystemConfig: { brand: null, configVersion: '1.0.0' }
    };
    const result = resolveDSBrandForPFI(config);
    expect(result.brand).toBeNull();
    expect(result.source).toBe('none');
  });

  it('returns null brand for empty config', () => {
    const result = resolveDSBrandForPFI({});
    expect(result.brand).toBeNull();
    expect(result.source).toBe('none');
  });

  it('returns null brand for null input', () => {
    const result = resolveDSBrandForPFI(null);
    expect(result.brand).toBeNull();
    expect(result.source).toBe('none');
  });

  it('returns null brand for undefined input', () => {
    const result = resolveDSBrandForPFI(undefined);
    expect(result.brand).toBeNull();
    expect(result.source).toBe('none');
  });

  // --- Edge cases ---

  it('skips empty brands array', () => {
    const config = {
      '@id': 'PFI-EMPTY',
      brands: [],
      designSystemConfig: { brand: null }
    };
    const result = resolveDSBrandForPFI(config);
    expect(result.brand).toBeNull();
    expect(result.source).toBe('none');
  });

  it('handles missing dsInstances state gracefully', () => {
    // Temporarily clear dsInstances
    const orig = mockDsInstances.size;
    mockDsInstances.clear();

    const config = {
      '@id': 'PFI-BAIV',
      brands: ['BAIV'],
      designSystemConfig: { brand: 'baiv', configVersion: '1.0.0' }
    };
    const result = resolveDSBrandForPFI(config);
    expect(result.brand).toBeNull();
    expect(result.source).toBe('none');
  });

  it('prefers designSystemConfig.brand over fallback', () => {
    const config = {
      '@id': 'PFI-BAIV',
      brands: ['BAIV'],
      designSystemConfig: { brand: 'baiv', fallback: 'pfc', configVersion: '1.0.0' }
    };
    const result = resolveDSBrandForPFI(config);
    expect(result.brand).toBe('baiv');
    expect(result.source).toBe('designSystemConfig');
  });

  it('prefers fallback over brands[] array', () => {
    const config = {
      '@id': 'PFI-X',
      brands: ['PAND'],
      designSystemConfig: { brand: null, fallback: 'rcs', configVersion: '1.0.0' }
    };
    const result = resolveDSBrandForPFI(config);
    expect(result.brand).toBe('rcs');
    expect(result.source).toBe('fallback');
  });
});
