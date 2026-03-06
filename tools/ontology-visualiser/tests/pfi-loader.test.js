/**
 * Unit tests for pfi-loader.js — Epic 9D, Story 9D.4
 *
 * Tests PFI instance loading, config population, listing, and clearing.
 * Async fetch operations are mocked.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock state.js
vi.mock('../js/state.js', () => ({
  state: {
    registryIndex: null,
    pfiInstances: new Map(),
    pfiInstanceData: new Map(),
  },
  REGISTRY_BASE_PATH: '../../ONTOLOGIES/ontology-library/',
}));

// Mock ontology-parser.js
vi.mock('../js/ontology-parser.js', () => ({
  parseOntology: vi.fn((jsonld) => ({
    nodes: [{ id: 'test-node', label: 'Test' }],
    edges: [],
    name: jsonld?.['@type'] || 'Parsed Ontology',
    diagnostics: { format: 'test' },
  })),
}));

import { state } from '../js/state.js';
import {
  loadPFIInstanceConfigs,
  loadPFIInstanceData,
  getPFIInstanceData,
  listPFIInstances,
  clearPFIInstanceData,
} from '../js/pfi-loader.js';

// ─── Test Fixtures ───────────────────────────────────────────────────────────

function makeRegistryIndex() {
  return {
    pfiInstances: [
      {
        '@id': 'PFI-BAIV',
        name: 'BAIV Instance',
        description: 'Brand AI Visibility PF-Instance',
        products: ['AIV'],
        brands: ['BAIV'],
        requirementScopes: ['PRODUCT', 'COMPETITIVE', 'STRATEGIC'],
        maturityLevel: 1,
        contextLevel: 'PFI',
        orgContext: {
          organizationRef: 'org:baiv-limited',
          organizationName: 'BAIV Limited',
          industry: 'MarTech SaaS',
          size: 'Startup',
        },
        verticalMarket: 'MarTech',
        jurisdictions: ['UK', 'EU'],
        instanceDataFiles: [
          {
            ontologyRef: 'VP-ONT',
            path: 'pfi-BAIV-AIV-ONT/baiv-vp-instance.jsonld',
            type: 'instance-data',
            description: 'BAIV VP instance',
          },
          {
            ontologyRef: 'RRR-ONT',
            path: 'pfi-BAIV-AIV-ONT/baiv-rrr-roles.jsonld',
            type: 'instance-data',
            description: 'BAIV RRR roles',
          },
        ],
        instanceOntologies: [],
        clientOrgs: [],
      },
      {
        '@id': 'PFI-W4M',
        name: 'W4M Instance',
        description: 'Work4Me PF-Instance',
        products: ['W4M'],
        brands: ['W4M'],
        requirementScopes: ['PRODUCT'],
        maturityLevel: 2,
        contextLevel: 'PFI',
        verticalMarket: 'HR-Tech',
        jurisdictions: ['UK'],
        instanceDataFiles: [],
        clientOrgs: [],
      },
    ],
  };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('loadPFIInstanceConfigs', () => {
  beforeEach(() => {
    state.pfiInstances.clear();
  });

  it('returns empty array for null registry', () => {
    expect(loadPFIInstanceConfigs(null)).toEqual([]);
  });

  it('returns empty array for registry with no pfiInstances', () => {
    expect(loadPFIInstanceConfigs({ entries: [] })).toEqual([]);
  });

  it('populates state.pfiInstances from registry', () => {
    const configs = loadPFIInstanceConfigs(makeRegistryIndex());

    expect(configs).toHaveLength(2);
    expect(state.pfiInstances.has('PFI-BAIV')).toBe(true);
    expect(state.pfiInstances.has('PFI-W4M')).toBe(true);
  });

  it('does not overwrite existing instances', () => {
    state.pfiInstances.set('PFI-BAIV', { custom: true });
    loadPFIInstanceConfigs(makeRegistryIndex());

    expect(state.pfiInstances.get('PFI-BAIV').custom).toBe(true);
  });
});

describe('loadPFIInstanceData', () => {
  beforeEach(() => {
    state.pfiInstanceData.clear();
    state.registryIndex = null;
    vi.restoreAllMocks();
  });

  it('returns error when no registry index', async () => {
    const result = await loadPFIInstanceData('PFI-BAIV');
    expect(result.success).toBe(false);
    expect(result.error).toContain('No registry index');
  });

  it('returns error when instance not found', async () => {
    const result = await loadPFIInstanceData('PFI-UNKNOWN', makeRegistryIndex());
    expect(result.success).toBe(false);
    expect(result.error).toContain('not found');
  });

  it('handles instance with no data files', async () => {
    const result = await loadPFIInstanceData('PFI-W4M', makeRegistryIndex());

    expect(result.success).toBe(true);
    expect(result.files).toEqual([]);
    expect(state.pfiInstanceData.has('PFI-W4M')).toBe(true);
  });

  it('loads data files successfully with mocked fetch', async () => {
    // Mock fetch for both data files
    const mockJsonld = { '@type': 'TestOntology', '@graph': [] };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockJsonld,
    });

    const result = await loadPFIInstanceData('PFI-BAIV', makeRegistryIndex());

    expect(result.success).toBe(true);
    expect(result.files).toHaveLength(2);
    expect(result.files[0].status).toBe('loaded');
    expect(result.files[0].ontologyRef).toBe('VP-ONT');
    expect(result.files[1].ontologyRef).toBe('RRR-ONT');
    expect(result.stats.loaded).toBe(2);
    expect(result.stats.failed).toBe(0);
    expect(result.orgContext).not.toBeNull();
    expect(result.orgContext.organizationName).toBe('BAIV Limited');

    delete global.fetch;
  });

  it('handles fetch failure gracefully', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
    });

    const result = await loadPFIInstanceData('PFI-BAIV', makeRegistryIndex());

    expect(result.success).toBe(true); // Operation succeeds even if files fail
    expect(result.stats.loaded).toBe(0);
    expect(result.stats.failed).toBe(2);
    expect(result.files[0].status).toBe('load-failed');

    delete global.fetch;
  });

  it('stores result in state.pfiInstanceData', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ '@type': 'Test' }),
    });

    await loadPFIInstanceData('PFI-BAIV', makeRegistryIndex());

    const stored = state.pfiInstanceData.get('PFI-BAIV');
    expect(stored).not.toBeNull();
    expect(stored.config['@id']).toBe('PFI-BAIV');

    delete global.fetch;
  });
});

describe('getPFIInstanceData', () => {
  beforeEach(() => {
    state.pfiInstanceData.clear();
  });

  it('returns null for unknown instance', () => {
    expect(getPFIInstanceData('PFI-UNKNOWN')).toBeNull();
  });

  it('returns stored data', () => {
    state.pfiInstanceData.set('PFI-BAIV', { files: [], orgContext: null });
    expect(getPFIInstanceData('PFI-BAIV')).toEqual({ files: [], orgContext: null });
  });
});

describe('listPFIInstances', () => {
  it('returns empty array for null registry', () => {
    expect(listPFIInstances(null)).toEqual([]);
  });

  it('lists all instances with metadata', () => {
    const list = listPFIInstances(makeRegistryIndex());

    expect(list).toHaveLength(2);
    expect(list[0].id).toBe('PFI-BAIV');
    expect(list[0].products).toEqual(['AIV']);
    expect(list[0].brands).toEqual(['BAIV']);
    expect(list[0].requirementScopes).toEqual(['PRODUCT', 'COMPETITIVE', 'STRATEGIC']);
    expect(list[0].maturityLevel).toBe(1);
    expect(list[0].verticalMarket).toBe('MarTech');
    expect(list[0].jurisdictions).toEqual(['UK', 'EU']);

    expect(list[1].id).toBe('PFI-W4M');
    expect(list[1].maturityLevel).toBe(2);
  });

  it('uses state.registryIndex when no argument', () => {
    state.registryIndex = makeRegistryIndex();
    const list = listPFIInstances();
    expect(list).toHaveLength(2);
    state.registryIndex = null;
  });
});

describe('clearPFIInstanceData', () => {
  beforeEach(() => {
    state.pfiInstanceData.set('PFI-BAIV', { files: [] });
    state.pfiInstanceData.set('PFI-W4M', { files: [] });
  });

  it('clears a specific instance', () => {
    clearPFIInstanceData('PFI-BAIV');
    expect(state.pfiInstanceData.has('PFI-BAIV')).toBe(false);
    expect(state.pfiInstanceData.has('PFI-W4M')).toBe(true);
  });

  it('clears all instances when no argument', () => {
    clearPFIInstanceData();
    expect(state.pfiInstanceData.size).toBe(0);
  });
});

// ─── F40.18: String-format instanceDataFiles (W4M-WWG pattern) ──────────────

describe('loadPFIInstanceData — string-format instanceDataFiles (F40.18)', () => {
  beforeEach(() => {
    state.pfiInstanceData.clear();
    state.registryIndex = null;
    vi.restoreAllMocks();
  });

  function makeWWGRegistryIndex() {
    return {
      pfiInstances: [{
        '@id': 'PFI-W4M-WWG',
        name: 'W4M-WWG Instance',
        products: ['WWG'],
        brands: ['W4M'],
        requirementScopes: ['PRODUCT', 'FULFILMENT', 'COMPETITIVE'],
        maturityLevel: 3,
        instanceDataFiles: [
          'VE-Series/VP-ONT/instance-data/vp-wwg-instance-v1.0.0.jsonld',
          'Orchestration/EMC-ONT/instance-data/wwg/wwg-emc-instance-v1.0.0.jsonld',
          'PE-Series/LSC-ONT/instance-data/wwg/wwg-lsc-au-uk-v1.0.0.json',
        ],
        instanceOntologies: ['VP-ONT', 'RRR-ONT', 'LSC-ONT', 'OFM-ONT', 'KPI-ONT', 'BSC-ONT', 'EMC-ONT'],
      }],
    };
  }

  it('normalises string paths to objects with inferred ontologyRef', async () => {
    const mockJsonld = { '@type': 'TestOntology', '@graph': [] };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockJsonld,
    });

    const result = await loadPFIInstanceData('PFI-W4M-WWG', makeWWGRegistryIndex());

    expect(result.success).toBe(true);
    expect(result.files).toHaveLength(3);
    // ontologyRef inferred from path
    expect(result.files[0].ontologyRef).toBe('VP-ONT');
    expect(result.files[1].ontologyRef).toBe('EMC-ONT');
    expect(result.files[2].ontologyRef).toBe('LSC-ONT');

    delete global.fetch;
  });

  it('resolves correct fetch paths for string entries', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });

    await loadPFIInstanceData('PFI-W4M-WWG', makeWWGRegistryIndex());

    // Verify fetch was called with the correct resolved paths
    expect(global.fetch).toHaveBeenCalledTimes(3);
    const calledPaths = global.fetch.mock.calls.map(c => c[0]);
    expect(calledPaths[0]).toContain('VE-Series/VP-ONT/instance-data/vp-wwg-instance');
    expect(calledPaths[1]).toContain('Orchestration/EMC-ONT/instance-data/wwg/wwg-emc-instance');
    expect(calledPaths[2]).toContain('PE-Series/LSC-ONT/instance-data/wwg/wwg-lsc-au-uk');

    delete global.fetch;
  });

  it('handles mixed string and object entries', async () => {
    const mixedRegistry = {
      pfiInstances: [{
        '@id': 'PFI-MIXED',
        name: 'Mixed',
        products: ['MIX'],
        instanceDataFiles: [
          'VE-Series/VP-ONT/instance-data/mix-vp.jsonld',
          { ontologyRef: 'RRR-ONT', path: 'VE-Series/RRR-ONT/instance-data/mix-rrr.jsonld', type: 'instance-data' },
        ],
      }],
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });

    const result = await loadPFIInstanceData('PFI-MIXED', mixedRegistry);
    expect(result.success).toBe(true);
    expect(result.files).toHaveLength(2);
    expect(result.files[0].ontologyRef).toBe('VP-ONT');
    expect(result.files[1].ontologyRef).toBe('RRR-ONT');

    delete global.fetch;
  });
});
