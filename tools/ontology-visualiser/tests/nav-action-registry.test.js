/**
 * Unit tests for nav-action-registry.js — ACTION_REGISTRY completeness,
 * dispatchAction routing, and buildStateSnapshot computed properties.
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock state.js
vi.mock('../js/state.js', () => ({
  state: {
    contextLevel: 'PFC',
    activeView: 'graph',
    authoringMode: false,
    selectionMode: false,
    selectedNodeIds: new Set(),
    navigationStack: [],
    loadedOntologies: new Map(),
  },
  REGISTRY_BASE_PATH: '../../ONTOLOGIES/ontology-library/',
}));

import { ACTION_REGISTRY, dispatchAction, buildStateSnapshot } from '../js/nav-action-registry.js';
import { state } from '../js/state.js';

// --- ACTION_REGISTRY completeness ---

describe('ACTION_REGISTRY', () => {
  it('contains all expected L1 actions', () => {
    const l1Actions = [
      'toggleOntologyMenu', 'toggleAuditPanel', 'toggleLibraryPanel',
      'toggleCategoryPanel', 'toggleLayerPanel', 'toggleExportMenu',
      'showGlossaryEditor', 'openLocalFile', 'loadFromGitHub',
      'showURLModal', 'loadAllFromRegistry', 'showCreateOntology',
      'forkOntology', 'saveToLibrary',
    ];
    for (const action of l1Actions) {
      expect(ACTION_REGISTRY).toHaveProperty(action);
      expect(typeof ACTION_REGISTRY[action]).toBe('function');
    }
  });

  it('contains all expected L2 actions', () => {
    const l2Actions = [
      'togglePhysics', 'fitGraphToView', 'resetGraphView',
      'toggleDetailsPanel', 'changeLayout', 'fitMermaidView',
    ];
    for (const action of l2Actions) {
      expect(ACTION_REGISTRY).toHaveProperty(action);
    }
  });

  it('contains all expected L3 actions', () => {
    const l3Actions = [
      'toggleBacklogPanel', 'toggleMermaidEditor',
      'toggleDSPanel', 'toggleTokenMapPanel', 'togglePFCPFIMode',
      'selectPFIInstance', 'selectBrandVariant',
      'toggleLifecyclePanel', 'toggleSnapshotPanel', 'toggleSkeletonInspector',
      'runOAAUpgrade', 'showGitHubSettings', 'loadTestData',
    ];
    for (const action of l3Actions) {
      expect(ACTION_REGISTRY).toHaveProperty(action);
    }
  });

  it('contains all expected L5-authoring actions', () => {
    const l5Actions = [
      'showEntityEditor', 'showRelationshipEditor',
      'undoEdit', 'redoEdit',
      'showVersionBumpModal', 'showRevisionHistory',
      'saveAuthoring', 'generateWithAI',
      'toggleSelectionMode', 'exitAuthoringMode',
    ];
    for (const action of l5Actions) {
      expect(ACTION_REGISTRY).toHaveProperty(action);
    }
  });

  it('contains all expected L6-selection actions', () => {
    const l6Actions = [
      'selectAllNodes', 'clearSelection',
      'exportSelectionJSON', 'showSaveSelection',
    ];
    for (const action of l6Actions) {
      expect(ACTION_REGISTRY).toHaveProperty(action);
    }
  });

  it('contains noop utility action', () => {
    expect(ACTION_REGISTRY).toHaveProperty('noop');
    ACTION_REGISTRY.noop(); // should not throw
  });

  it('has at least 40 registered actions', () => {
    expect(Object.keys(ACTION_REGISTRY).length).toBeGreaterThanOrEqual(40);
  });

  it('all entries are functions', () => {
    for (const [name, handler] of Object.entries(ACTION_REGISTRY)) {
      expect(typeof handler).toBe('function');
    }
  });
});

// --- dispatchAction ---

describe('dispatchAction', () => {
  beforeEach(() => {
    // Reset window functions
    delete window.toggleAudit;
    delete window.toggleLibrary;
    delete window.setViewMode;
    delete window.doPickInstance;
  });

  it('dispatches simple action to handler', () => {
    const mockFn = vi.fn();
    window.toggleAudit = mockFn;
    dispatchAction('toggleAuditPanel');
    expect(mockFn).toHaveBeenCalled();
  });

  it('dispatches parameterised setViewMode action', () => {
    const mockFn = vi.fn();
    window.setViewMode = mockFn;
    dispatchAction('setViewMode:graph');
    expect(mockFn).toHaveBeenCalledWith('graph');
  });

  it('dispatches parameterised setViewMode with mermaid', () => {
    const mockFn = vi.fn();
    window.setViewMode = mockFn;
    dispatchAction('setViewMode:mermaid');
    expect(mockFn).toHaveBeenCalledWith('mermaid');
  });

  it('dispatches parameterised selectPFIInstance action', () => {
    const mockFn = vi.fn();
    window.doPickInstance = mockFn;
    dispatchAction('selectPFIInstance:BAIV', undefined);
    // selectPFIInstance handler checks for truthy value
    expect(mockFn).toHaveBeenCalledWith('BAIV');
  });

  it('does nothing for noop action', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    dispatchAction('noop');
    expect(warnSpy).not.toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('does nothing for null/empty action string', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    dispatchAction(null);
    dispatchAction('');
    expect(warnSpy).not.toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('logs warning for unknown action', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    dispatchAction('nonExistentAction');
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('No handler for action: nonExistentAction')
    );
    warnSpy.mockRestore();
  });

  it('passes eventOrValue to simple action handler', () => {
    const mockFn = vi.fn();
    window.toggleLibrary = mockFn;
    dispatchAction('toggleLibraryPanel', 'someValue');
    expect(mockFn).toHaveBeenCalled();
  });
});

// --- buildStateSnapshot ---

describe('buildStateSnapshot', () => {
  beforeEach(() => {
    state.contextLevel = 'PFC';
    state.activeView = 'graph';
    state.authoringMode = false;
    state.selectionMode = false;
    state.selectedNodeIds = new Set();
    state.navigationStack = [];
    state.loadedOntologies = new Map();
  });

  it('returns correct defaults for PFC mode', () => {
    const snapshot = buildStateSnapshot();

    expect(snapshot.currentView).toBe('graph');
    expect(snapshot.authoringMode).toBe(false);
    expect(snapshot.isPFIMode).toBe(false);
    expect(snapshot.selectionMode).toBe(false);
    expect(snapshot.selectedNodes).toEqual([]);
    expect(snapshot.ontologyCount).toBe(0);
  });

  it('computes isPFIMode from contextLevel', () => {
    state.contextLevel = 'PFI';
    const snapshot = buildStateSnapshot();
    expect(snapshot.isPFIMode).toBe(true);
  });

  it('reflects activeView changes', () => {
    state.activeView = 'mermaid';
    const snapshot = buildStateSnapshot();
    expect(snapshot.currentView).toBe('mermaid');
  });

  it('reflects authoringMode changes', () => {
    state.authoringMode = true;
    const snapshot = buildStateSnapshot();
    expect(snapshot.authoringMode).toBe(true);
  });

  it('counts loaded ontologies', () => {
    state.loadedOntologies = new Map([['vp', {}], ['rrr', {}], ['lsc', {}]]);
    const snapshot = buildStateSnapshot();
    expect(snapshot.ontologyCount).toBe(3);
  });

  it('snapshot is a detached copy (not a reference)', () => {
    state.selectedNodeIds = new Set(['a', 'b']);
    const snapshot = buildStateSnapshot();
    state.selectedNodeIds.add('c');
    expect(snapshot.selectedNodes).toHaveLength(2); // Not 3
  });
});

// --- togglePFCPFIMode ---

describe('togglePFCPFIMode action', () => {
  it('toggles from PFC to PFI', () => {
    state.contextLevel = 'PFC';
    const mockFn = vi.fn();
    window.setContextLevel = mockFn;
    ACTION_REGISTRY.togglePFCPFIMode();
    expect(mockFn).toHaveBeenCalledWith('PFI');
  });

  it('toggles from PFI to PFC', () => {
    state.contextLevel = 'PFI';
    const mockFn = vi.fn();
    window.setContextLevel = mockFn;
    ACTION_REGISTRY.togglePFCPFIMode();
    expect(mockFn).toHaveBeenCalledWith('PFC');
  });

  afterEach(() => {
    delete window.setContextLevel;
  });
});
