/**
 * Unit tests for revision-manager.js — revision history, changelog generation,
 * glossary management, and glossary-to-node linking.
 *
 * Feature 7.2: Revision Documentation & Glossary Management
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock state.js
vi.mock('../js/state.js', () => ({
  state: {
    currentData: null,
    authoringBaselineSnapshot: null,
    revisionHistory: [],
    glossaryData: null,
    glossaryLinks: new Map(),
  },
  REGISTRY_BASE_PATH: '../../ONTOLOGIES/ontology-library/',
  OAA_REQUIRED_ENTITY_PROPS: ['@id', '@type', 'name', 'description'],
  OAA_REQUIRED_REL_PROPS: ['@type', 'name'],
}));

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn(key => store[key] || null),
    setItem: vi.fn((key, value) => { store[key] = value; }),
    removeItem: vi.fn(key => { delete store[key]; }),
    clear: () => { store = {}; },
  };
})();
vi.stubGlobal('localStorage', localStorageMock);

import { state } from '../js/state.js';
import {
  createRevision,
  getRevisionHistory,
  getAllRevisionHistory,
  clearRevisionHistory,
  exportRevisionDocs,
  loadGlossaryFromData,
  searchGlossary,
  addGlossaryEntry,
  updateGlossaryEntry,
  removeGlossaryEntry,
  getCustomGlossaryEntries,
  linkGlossaryToNode,
  unlinkGlossaryFromNode,
  getGlossaryForNode,
  getAllGlossaryLinks,
  suggestGlossaryLinks,
  restoreRevisionState,
} from '../js/revision-manager.js';

// --- Test fixtures ---

function makeOntology(version, entities, relationships) {
  return {
    '@context': { '@vocab': 'https://schema.org/' },
    '@type': 'Ontology',
    '@id': 'test:test-ontology',
    metadata: {
      name: 'Test Ontology',
      version: version || '1.0.0',
      oaaVersion: '6.1.0',
      dateModified: '2026-01-01',
    },
    entities: entities || [
      { '@type': 'pf:EntityDefinition', '@id': 'test:Alpha', name: 'Alpha', description: 'First' },
      { '@type': 'pf:EntityDefinition', '@id': 'test:Beta', name: 'Beta', description: 'Second' },
    ],
    relationships: relationships || [
      { '@type': 'rdf:Property', name: 'relatesTo', domainIncludes: ['test:Alpha'], rangeIncludes: ['test:Beta'] },
    ],
  };
}

const sampleGlossary = {
  '@context': 'https://platformcore.io/ontology/glossary/',
  '@type': 'UnifiedGlossary',
  version: '2.0.0',
  foundationLayer: {
    'ORG-ONT': {
      Organization: 'Core organizational entity representing a company',
      OrganizationContext: 'Bridge entity connecting an organization to domain-specific contexts',
    },
  },
  veSeriesLayer: {
    'VE-VSOM-ONT': {
      VSOMFramework: 'Vision-Strategy-Objectives-Metrics framework',
      VisionComponent: 'Long-term aspirational statement',
    },
  },
  customEntries: {},
};

// --- Setup ---

beforeEach(() => {
  state.currentData = null;
  state.authoringBaselineSnapshot = null;
  state.revisionHistory = [];
  state.glossaryData = null;
  state.glossaryLinks = new Map();
  localStorageMock.clear();
});

// ─── createRevision ──────────────────────────────────────────────────────────

describe('createRevision', () => {
  it('returns error when no data provided', () => {
    const result = createRevision(null, 'patch');
    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it('bumps version and generates changelog', () => {
    const data = makeOntology('1.0.0');
    state.currentData = data;
    state.authoringBaselineSnapshot = JSON.stringify(data);

    const result = createRevision(data, 'minor');
    expect(result.success).toBe(true);
    expect(result.oldVersion).toBe('1.0.0');
    expect(result.newVersion).toBe('1.1.0');
    expect(result.changelog).toContain('# Changelog');
    expect(result.changelog).toContain('1.0.0');
    expect(result.changelog).toContain('1.1.0');
  });

  it('stores revision in history', () => {
    const data = makeOntology('1.0.0');
    state.currentData = data;
    state.authoringBaselineSnapshot = JSON.stringify(data);

    createRevision(data, 'patch');
    expect(state.revisionHistory.length).toBe(1);
    expect(state.revisionHistory[0].ontologyId).toBe('test:test-ontology');
    expect(state.revisionHistory[0].bumpType).toBe('patch');
  });

  it('captures entity changes when baseline differs from current', () => {
    const baseline = makeOntology('1.0.0');
    const data = makeOntology('1.0.0', [
      { '@type': 'pf:EntityDefinition', '@id': 'test:Alpha', name: 'Alpha', description: 'First' },
      { '@type': 'pf:EntityDefinition', '@id': 'test:Beta', name: 'Beta', description: 'Second' },
      { '@type': 'pf:EntityDefinition', '@id': 'test:Gamma', name: 'Gamma', description: 'New entity' },
    ]);

    state.currentData = data;
    state.authoringBaselineSnapshot = JSON.stringify(baseline);

    const result = createRevision(data, 'minor');
    expect(result.success).toBe(true);
    expect(result.diff.summary.entitiesAdded).toBe(1);
    expect(result.changelog).toContain('test:Gamma');
  });

  it('resets baseline after revision', () => {
    const data = makeOntology('1.0.0');
    state.currentData = data;
    state.authoringBaselineSnapshot = JSON.stringify(data);

    createRevision(data, 'patch');
    // Baseline should now reflect the bumped version
    const newBaseline = JSON.parse(state.authoringBaselineSnapshot);
    expect(newBaseline.metadata.version).toBe('1.0.1');
  });

  it('persists to localStorage', () => {
    const data = makeOntology('1.0.0');
    state.currentData = data;
    state.authoringBaselineSnapshot = JSON.stringify(data);

    createRevision(data, 'patch');
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'oaa-viz-revision-history',
      expect.any(String)
    );
  });

  it('supports major bump', () => {
    const data = makeOntology('1.2.3');
    state.currentData = data;
    state.authoringBaselineSnapshot = JSON.stringify(data);

    const result = createRevision(data, 'major');
    expect(result.newVersion).toBe('2.0.0');
  });
});

// ─── getRevisionHistory ──────────────────────────────────────────────────────

describe('getRevisionHistory', () => {
  it('returns empty array when no revisions', () => {
    state.currentData = makeOntology();
    expect(getRevisionHistory()).toEqual([]);
  });

  it('filters by ontology ID', () => {
    state.revisionHistory = [
      { ontologyId: 'test:a', oldVersion: '1.0.0', newVersion: '1.0.1' },
      { ontologyId: 'test:b', oldVersion: '1.0.0', newVersion: '1.0.1' },
      { ontologyId: 'test:a', oldVersion: '1.0.1', newVersion: '1.0.2' },
    ];
    const result = getRevisionHistory('test:a');
    expect(result.length).toBe(2);
    expect(result.every(r => r.ontologyId === 'test:a')).toBe(true);
  });

  it('returns newest first', () => {
    state.revisionHistory = [
      { ontologyId: 'test:x', oldVersion: '1.0.0', newVersion: '1.0.1' },
      { ontologyId: 'test:x', oldVersion: '1.0.1', newVersion: '1.0.2' },
    ];
    const result = getRevisionHistory('test:x');
    expect(result[0].newVersion).toBe('1.0.2');
    expect(result[1].newVersion).toBe('1.0.1');
  });
});

describe('getAllRevisionHistory', () => {
  it('returns all revisions newest first', () => {
    state.revisionHistory = [
      { ontologyId: 'a', oldVersion: '1.0.0', newVersion: '1.1.0' },
      { ontologyId: 'b', oldVersion: '2.0.0', newVersion: '2.1.0' },
    ];
    const all = getAllRevisionHistory();
    expect(all.length).toBe(2);
    expect(all[0].ontologyId).toBe('b');
  });
});

describe('clearRevisionHistory', () => {
  it('clears all when no ID given', () => {
    state.revisionHistory = [
      { ontologyId: 'a' },
      { ontologyId: 'b' },
    ];
    clearRevisionHistory();
    expect(state.revisionHistory.length).toBe(0);
  });

  it('clears only matching ontology', () => {
    state.revisionHistory = [
      { ontologyId: 'a' },
      { ontologyId: 'b' },
      { ontologyId: 'a' },
    ];
    clearRevisionHistory('a');
    expect(state.revisionHistory.length).toBe(1);
    expect(state.revisionHistory[0].ontologyId).toBe('b');
  });
});

// ─── exportRevisionDocs ──────────────────────────────────────────────────────

describe('exportRevisionDocs', () => {
  it('returns placeholder when no revisions', () => {
    state.currentData = makeOntology();
    const md = exportRevisionDocs();
    expect(md).toContain('No revisions recorded yet');
  });

  it('generates full markdown document with TOC', () => {
    state.currentData = makeOntology();
    state.revisionHistory = [
      {
        ontologyId: 'test:test-ontology',
        oldVersion: '1.0.0',
        newVersion: '1.1.0',
        bumpType: 'minor',
        timestamp: '2026-02-08T12:00:00Z',
        changelog: '# Changelog: 1.0.0 → 1.1.0\n\nSome changes\n',
        diff: { summary: {} },
      },
      {
        ontologyId: 'test:test-ontology',
        oldVersion: '1.1.0',
        newVersion: '2.0.0',
        bumpType: 'major',
        timestamp: '2026-02-09T12:00:00Z',
        changelog: '# Changelog: 1.1.0 → 2.0.0\n\nBreaking changes\n',
        diff: { summary: {} },
      },
    ];

    const md = exportRevisionDocs();
    expect(md).toContain('# Revision History: Test Ontology');
    expect(md).toContain('Total Revisions:** 2');
    expect(md).toContain('Table of Contents');
    expect(md).toContain('1.0.0 → 1.1.0');
    expect(md).toContain('1.1.0 → 2.0.0');
    expect(md).toContain('Some changes');
    expect(md).toContain('Breaking changes');
  });
});

// ─── Glossary CRUD ───────────────────────────────────────────────────────────

// Deep-clone helper to prevent cross-test mutation of sampleGlossary
const cloneGlossary = () => JSON.parse(JSON.stringify(sampleGlossary));

describe('glossary management', () => {
  describe('loadGlossaryFromData', () => {
    it('loads glossary data into state', () => {
      loadGlossaryFromData(cloneGlossary());
      expect(state.glossaryData).toBeTruthy();
      expect(state.glossaryData.version).toBe('2.0.0');
    });

    it('creates blank glossary if null', () => {
      loadGlossaryFromData(null);
      expect(state.glossaryData).toBeTruthy();
      expect(state.glossaryData.customEntries).toBeDefined();
    });
  });

  describe('searchGlossary', () => {
    beforeEach(() => loadGlossaryFromData(cloneGlossary()));

    it('returns empty for empty query', () => {
      expect(searchGlossary('')).toEqual([]);
    });

    it('finds terms by name', () => {
      const results = searchGlossary('Organization');
      expect(results.length).toBeGreaterThanOrEqual(2);
      expect(results.some(r => r.term === 'Organization')).toBe(true);
    });

    it('finds terms by definition content', () => {
      const results = searchGlossary('aspirational');
      expect(results.length).toBe(1);
      expect(results[0].term).toBe('VisionComponent');
    });

    it('is case-insensitive', () => {
      const results = searchGlossary('vsom');
      expect(results.length).toBeGreaterThanOrEqual(1);
    });

    it('searches custom entries', () => {
      addGlossaryEntry('MyCustomTerm', 'A custom definition', 'DS-ONT');
      const results = searchGlossary('MyCustom');
      expect(results.length).toBe(1);
      expect(results[0].term).toBe('MyCustomTerm');
      expect(results[0].layer).toBe('custom');
    });
  });

  describe('addGlossaryEntry', () => {
    beforeEach(() => loadGlossaryFromData(cloneGlossary()));

    it('adds a new custom entry', () => {
      const result = addGlossaryEntry('NewTerm', 'New definition', 'TEST-ONT');
      expect(result.success).toBe(true);
      expect(state.glossaryData.customEntries.NewTerm).toBeTruthy();
      expect(state.glossaryData.customEntries.NewTerm.definition).toBe('New definition');
    });

    it('rejects duplicate entries', () => {
      addGlossaryEntry('Dup', 'First');
      const result = addGlossaryEntry('Dup', 'Second');
      expect(result.success).toBe(false);
      expect(result.error).toContain('already exists');
    });

    it('rejects empty term or definition', () => {
      expect(addGlossaryEntry('', 'def').success).toBe(false);
      expect(addGlossaryEntry('term', '').success).toBe(false);
    });

    it('works even without pre-loaded glossary', () => {
      state.glossaryData = null;
      const result = addGlossaryEntry('Term', 'Def');
      expect(result.success).toBe(true);
      expect(state.glossaryData.customEntries.Term).toBeTruthy();
    });
  });

  describe('updateGlossaryEntry', () => {
    beforeEach(() => {
      loadGlossaryFromData(cloneGlossary());
      addGlossaryEntry('EditMe', 'Original', 'ONT-1');
    });

    it('updates definition', () => {
      const result = updateGlossaryEntry('EditMe', { definition: 'Updated' });
      expect(result.success).toBe(true);
      expect(state.glossaryData.customEntries.EditMe.definition).toBe('Updated');
    });

    it('returns error for non-existent entry', () => {
      const result = updateGlossaryEntry('NonExistent', { definition: 'x' });
      expect(result.success).toBe(false);
    });
  });

  describe('removeGlossaryEntry', () => {
    beforeEach(() => {
      loadGlossaryFromData(cloneGlossary());
      addGlossaryEntry('RemoveMe', 'To be removed');
    });

    it('removes custom entry', () => {
      const result = removeGlossaryEntry('RemoveMe');
      expect(result.success).toBe(true);
      expect(state.glossaryData.customEntries.RemoveMe).toBeUndefined();
    });

    it('returns error for non-existent entry', () => {
      expect(removeGlossaryEntry('Nope').success).toBe(false);
    });
  });

  describe('getCustomGlossaryEntries', () => {
    it('returns formatted custom entries', () => {
      loadGlossaryFromData(cloneGlossary());
      addGlossaryEntry('A', 'Def A', 'ONT-A');
      addGlossaryEntry('B', 'Def B', 'ONT-B');
      const entries = getCustomGlossaryEntries();
      expect(entries.length).toBe(2);
      expect(entries[0].term).toBe('A');
      expect(entries[0].definition).toBe('Def A');
    });
  });
});

// ─── Glossary-to-Node Linking ────────────────────────────────────────────────

describe('glossary-to-node linking', () => {
  beforeEach(() => loadGlossaryFromData(cloneGlossary()));

  describe('linkGlossaryToNode', () => {
    it('links a term to an entity', () => {
      const result = linkGlossaryToNode('Organization', 'org:Organization');
      expect(result.success).toBe(true);
      expect(state.glossaryLinks.get('org:Organization')).toContain('Organization');
    });

    it('does not duplicate links', () => {
      linkGlossaryToNode('Foo', 'entity:1');
      linkGlossaryToNode('Foo', 'entity:1');
      expect(state.glossaryLinks.get('entity:1').length).toBe(1);
    });

    it('supports multiple terms per entity', () => {
      linkGlossaryToNode('TermA', 'entity:1');
      linkGlossaryToNode('TermB', 'entity:1');
      expect(state.glossaryLinks.get('entity:1').length).toBe(2);
    });

    it('rejects empty inputs', () => {
      expect(linkGlossaryToNode('', 'entity:1').success).toBe(false);
      expect(linkGlossaryToNode('term', '').success).toBe(false);
    });
  });

  describe('unlinkGlossaryFromNode', () => {
    it('removes a specific link', () => {
      linkGlossaryToNode('TermA', 'entity:1');
      linkGlossaryToNode('TermB', 'entity:1');
      const result = unlinkGlossaryFromNode('TermA', 'entity:1');
      expect(result.success).toBe(true);
      expect(state.glossaryLinks.get('entity:1')).toEqual(['TermB']);
    });

    it('removes entity key when last link removed', () => {
      linkGlossaryToNode('Only', 'entity:1');
      unlinkGlossaryFromNode('Only', 'entity:1');
      expect(state.glossaryLinks.has('entity:1')).toBe(false);
    });

    it('returns error when no links exist', () => {
      expect(unlinkGlossaryFromNode('Foo', 'none').success).toBe(false);
    });
  });

  describe('getGlossaryForNode', () => {
    it('returns linked glossary entries with definitions', () => {
      linkGlossaryToNode('Organization', 'org:Org');
      const entries = getGlossaryForNode('org:Org');
      expect(entries.length).toBe(1);
      expect(entries[0].term).toBe('Organization');
      expect(entries[0].definition).toContain('organizational entity');
    });

    it('returns empty array for unlinked nodes', () => {
      expect(getGlossaryForNode('nope')).toEqual([]);
    });

    it('returns placeholder for missing glossary terms', () => {
      linkGlossaryToNode('NonExistentTerm', 'entity:1');
      const entries = getGlossaryForNode('entity:1');
      expect(entries[0].definition).toContain('not found');
    });
  });

  describe('getAllGlossaryLinks', () => {
    it('returns plain object of all links', () => {
      linkGlossaryToNode('A', 'e1');
      linkGlossaryToNode('B', 'e2');
      const obj = getAllGlossaryLinks();
      expect(obj.e1).toEqual(['A']);
      expect(obj.e2).toEqual(['B']);
    });
  });
});

// ─── suggestGlossaryLinks ────────────────────────────────────────────────────

describe('suggestGlossaryLinks', () => {
  beforeEach(() => loadGlossaryFromData(cloneGlossary()));

  it('suggests links for entities matching glossary terms', () => {
    const data = {
      entities: [
        { '@id': 'org:Organization', name: 'Organization' },
        { '@id': 'org:Something', name: 'Something' },
      ],
    };
    const suggestions = suggestGlossaryLinks(data);
    expect(suggestions.length).toBe(1);
    expect(suggestions[0].entityId).toBe('org:Organization');
    expect(suggestions[0].matches[0].term).toBe('Organization');
  });

  it('skips already-linked entities', () => {
    linkGlossaryToNode('Organization', 'org:Organization');
    const data = {
      entities: [{ '@id': 'org:Organization', name: 'Organization' }],
    };
    const suggestions = suggestGlossaryLinks(data);
    expect(suggestions.length).toBe(0);
  });

  it('handles empty data gracefully', () => {
    expect(suggestGlossaryLinks(null)).toEqual([]);
    expect(suggestGlossaryLinks({})).toEqual([]);
  });
});

// ─── restoreRevisionState ────────────────────────────────────────────────────

describe('restoreRevisionState', () => {
  it('restores revision history from localStorage', () => {
    const hist = [{ ontologyId: 'test', oldVersion: '1.0.0', newVersion: '1.0.1' }];
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(hist));
    restoreRevisionState();
    expect(state.revisionHistory.length).toBe(1);
    expect(state.revisionHistory[0].ontologyId).toBe('test');
  });

  it('restores glossary links from localStorage', () => {
    const links = { 'entity:1': ['TermA', 'TermB'] };
    localStorageMock.getItem
      .mockReturnValueOnce(null)  // revision history
      .mockReturnValueOnce(JSON.stringify(links));  // glossary links
    restoreRevisionState();
    expect(state.glossaryLinks.get('entity:1')).toEqual(['TermA', 'TermB']);
  });

  it('handles corrupt localStorage gracefully', () => {
    localStorageMock.getItem.mockReturnValueOnce('not-json');
    expect(() => restoreRevisionState()).not.toThrow();
  });
});
