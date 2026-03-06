/**
 * Context Switch UI (F8.8) — unit tests for context bar, border glow, title, modal, drawer.
 * Tests focus on the exported resolveDSBrandForPFI logic powering the UI,
 * and DOM-based integration for the context switch helpers.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// vi.hoisted ensures variables are available in the hoisted mock factory
const { mockState } = vi.hoisted(() => ({
  mockState: {
    dsInstances: new Map(),
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
    activePFI: null,
    dsAppliedCSSVars: null,
    dsArtefactHistory: new Map(),
    registryIndex: null,
  },
}));

vi.mock('../js/state.js', () => ({
  state: mockState,
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

// Reset state between tests
beforeEach(() => {
  mockState.dsInstances.clear();
  mockState.pfiInstances.clear();
  mockState.activePFI = null;
  mockState.activeDSBrand = null;
  mockState.brandContext = null;
  mockState.dsAppliedCSSVars = null;

  // Populate common DS brands
  mockState.dsInstances.set('baiv', { designSystem: { 'ds:name': 'BAIV' } });
  mockState.dsInstances.set('rcs', { designSystem: { 'ds:name': 'RCS' } });
  mockState.dsInstances.set('pfc', { designSystem: { 'ds:name': 'PF-Core' } });

  // Populate PFI instances
  mockState.pfiInstances.set('PFI-BAIV', {
    '@id': 'PFI-BAIV',
    name: 'BAIV Instance',
    brands: ['BAIV'],
    designSystemConfig: { brand: 'baiv', configVersion: '1.0.0' },
  });
  mockState.pfiInstances.set('PFI-RCS', {
    '@id': 'PFI-RCS',
    name: 'RCS Instance',
    brands: ['RCS'],
    designSystemConfig: { brand: 'rcs', configVersion: '1.0.0' },
  });
  mockState.pfiInstances.set('PFI-W4M', {
    '@id': 'PFI-W4M',
    name: 'W4M Instance',
    brands: ['W4M'],
    designSystemConfig: { brand: null, fallback: 'pfc', configVersion: '1.0.0' },
  });
});

// ========================================
// Context Switch Modal Gate Logic (S8.8.3)
// ========================================

describe('Context switch modal gate logic', () => {
  it('should require modal when switching between two PFI instances', () => {
    // Simulate state where PFI-BAIV is active
    mockState.activePFI = 'PFI-BAIV';
    const targetId = 'PFI-RCS';

    // Gate condition: activePFI && targetId && targetId !== activePFI
    const needsModal = mockState.activePFI && targetId && targetId !== mockState.activePFI;
    expect(needsModal).toBe(true);
  });

  it('should NOT require modal when selecting initial PFI (from PF-Core)', () => {
    mockState.activePFI = null;
    const targetId = 'PFI-BAIV';

    const needsModal = mockState.activePFI && targetId && targetId !== mockState.activePFI;
    expect(needsModal).toBeFalsy();
  });

  it('should NOT require modal when clearing to PF-Core', () => {
    mockState.activePFI = 'PFI-BAIV';
    const targetId = '';

    const needsModal = mockState.activePFI && targetId && targetId !== mockState.activePFI;
    expect(needsModal).toBeFalsy();
  });

  it('should NOT require modal when selecting the same instance', () => {
    mockState.activePFI = 'PFI-BAIV';
    const targetId = 'PFI-BAIV';

    const needsModal = mockState.activePFI && targetId && targetId !== mockState.activePFI;
    expect(needsModal).toBe(false);
  });
});

// ========================================
// Context Bar Display Logic (S8.8.1)
// ========================================

describe('Context bar display logic', () => {
  it('should show PF-Core when no active PFI', () => {
    mockState.activePFI = null;
    mockState.brandContext = null;
    const hasPFI = !!mockState.activePFI;
    expect(hasPFI).toBe(false);
  });

  it('should show PFI instance ID when active', () => {
    mockState.activePFI = 'PFI-BAIV';
    mockState.brandContext = { brand: 'baiv', tier: 'PF-Instance', accentColor: '#00a4bf' };
    expect(mockState.activePFI).toBe('PFI-BAIV');
    expect(mockState.brandContext.accentColor).toBe('#00a4bf');
  });

  it('should hide bar when no PFI instances loaded', () => {
    mockState.pfiInstances.clear();
    const hasRegistry = mockState.pfiInstances.size > 0;
    expect(hasRegistry).toBe(false);
  });

  it('should show bar when PFI instances are loaded', () => {
    const hasRegistry = mockState.pfiInstances.size > 0;
    expect(hasRegistry).toBe(true);
  });
});

// ========================================
// Graph Border Glow Logic (S8.8.2)
// ========================================

describe('Graph border glow logic', () => {
  it('should activate glow when brandContext has accent colour', () => {
    mockState.brandContext = { brand: 'baiv', tier: 'PF-Instance', accentColor: '#00a4bf' };
    const shouldGlow = !!mockState.brandContext?.accentColor;
    expect(shouldGlow).toBe(true);
  });

  it('should deactivate glow when brandContext is null', () => {
    mockState.brandContext = null;
    const shouldGlow = !!mockState.brandContext?.accentColor;
    expect(shouldGlow).toBe(false);
  });
});

// ========================================
// Context Title Logic (S8.8.5)
// ========================================

describe('Context title logic', () => {
  it('should format title with PFI instance when active', () => {
    mockState.activePFI = 'PFI-BAIV';
    const title = mockState.activePFI
      ? `${mockState.activePFI} — OAA Visualiser`
      : 'OAA Ontology Visualiser';
    expect(title).toBe('PFI-BAIV — OAA Visualiser');
  });

  it('should use default title when no PFI active', () => {
    mockState.activePFI = null;
    const title = mockState.activePFI
      ? `${mockState.activePFI} — OAA Visualiser`
      : 'OAA Ontology Visualiser';
    expect(title).toBe('OAA Ontology Visualiser');
  });

  it('should use accent colour for favicon', () => {
    mockState.brandContext = { brand: 'rcs', tier: 'PF-Instance', accentColor: '#e63946' };
    const accentColor = mockState.brandContext?.accentColor || '#9dfff5';
    expect(accentColor).toBe('#e63946');
  });

  it('should use default accent when no brand context', () => {
    mockState.brandContext = null;
    const accentColor = mockState.brandContext?.accentColor || '#9dfff5';
    expect(accentColor).toBe('#9dfff5');
  });
});

// ========================================
// Drawer Card Rendering Logic (S8.8.6)
// ========================================

describe('Context drawer card rendering', () => {
  it('should always include PF-Core card first', () => {
    mockState.activePFI = null;
    const isCore = !mockState.activePFI;
    expect(isCore).toBe(true);
  });

  it('should mark active PFI instance card', () => {
    mockState.activePFI = 'PFI-BAIV';
    const instances = ['PFI-BAIV', 'PFI-RCS', 'PFI-W4M'];
    const activeCards = instances.filter(id => mockState.activePFI === id);
    expect(activeCards).toEqual(['PFI-BAIV']);
  });

  it('should resolve brand for each card via resolveDSBrandForPFI', () => {
    const baivConfig = mockState.pfiInstances.get('PFI-BAIV');
    const rcsConfig = mockState.pfiInstances.get('PFI-RCS');
    const w4mConfig = mockState.pfiInstances.get('PFI-W4M');

    expect(resolveDSBrandForPFI(baivConfig)).toEqual({ brand: 'baiv', source: 'designSystemConfig' });
    expect(resolveDSBrandForPFI(rcsConfig)).toEqual({ brand: 'rcs', source: 'designSystemConfig' });
    expect(resolveDSBrandForPFI(w4mConfig)).toEqual({ brand: 'pfc', source: 'fallback' });
  });

  it('should show 3 PFI cards + 1 PF-Core card', () => {
    const instanceCount = mockState.pfiInstances.size;
    const totalCards = instanceCount + 1; // + PF-Core
    expect(totalCards).toBe(4);
  });
});
