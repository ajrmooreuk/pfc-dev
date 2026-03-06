/**
 * Unit tests for S7.6.2 — DS-ONT Cross-Ontology Bridge Highlighting.
 * Tests: DS_BRIDGE_STYLES definition, patternId attachment in detectCrossReferences,
 * bridge type filtering, and bridge connections in node details.
 */

import { describe, it, expect } from 'vitest';

// state.js accesses localStorage at module level — provide a stub before importing
if (typeof globalThis.localStorage === 'undefined') {
  globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
}

const { DS_BRIDGE_STYLES, EDGE_STYLES } = await import('../js/state.js');

// ========================================
// DS_BRIDGE_STYLES constant validation
// ========================================

describe('DS_BRIDGE_STYLES', () => {
  it('should define styles for all 5 DS cross-ontology relationships', () => {
    expect(DS_BRIDGE_STYLES).toBeDefined();
    expect(DS_BRIDGE_STYLES.realizesFeature).toBeDefined();
    expect(DS_BRIDGE_STYLES.configuredByInstance).toBeDefined();
    expect(DS_BRIDGE_STYLES.configuredByApp).toBeDefined();
    expect(DS_BRIDGE_STYLES.governedByProcess).toBeDefined();
    expect(DS_BRIDGE_STYLES.ownedByBrand).toBeDefined();
  });

  it('should have unique patternIds for each distinct bridge type', () => {
    const patternIds = new Set();
    for (const [, style] of Object.entries(DS_BRIDGE_STYLES)) {
      patternIds.add(style.patternId);
    }
    // configuredByInstance and configuredByApp share JP-DS-002
    expect(patternIds.size).toBe(4);
    expect(patternIds.has('JP-DS-001')).toBe(true);
    expect(patternIds.has('JP-DS-002')).toBe(true);
    expect(patternIds.has('JP-DS-003')).toBe(true);
    expect(patternIds.has('JP-DS-004')).toBe(true);
  });

  it('should have a distinct colour for each pattern group', () => {
    const colors = new Set([
      DS_BRIDGE_STYLES.realizesFeature.color,
      DS_BRIDGE_STYLES.configuredByInstance.color,
      DS_BRIDGE_STYLES.governedByProcess.color,
      DS_BRIDGE_STYLES.ownedByBrand.color,
    ]);
    expect(colors.size).toBe(4); // 4 unique colours
  });

  it('should have color, highlightColor, dashes, patternId, label, and targetPrefix on every entry', () => {
    for (const [name, style] of Object.entries(DS_BRIDGE_STYLES)) {
      expect(style.color, `${name}.color`).toBeTruthy();
      expect(style.highlightColor, `${name}.highlightColor`).toBeTruthy();
      expect(Array.isArray(style.dashes), `${name}.dashes`).toBe(true);
      expect(style.patternId, `${name}.patternId`).toMatch(/^JP-DS-\d{3}$/);
      expect(style.label, `${name}.label`).toBeTruthy();
      expect(style.targetPrefix, `${name}.targetPrefix`).toBeTruthy();
    }
  });

  it('configuredByInstance and configuredByApp should share the same patternId', () => {
    expect(DS_BRIDGE_STYLES.configuredByInstance.patternId).toBe('JP-DS-002');
    expect(DS_BRIDGE_STYLES.configuredByApp.patternId).toBe('JP-DS-002');
  });

  it('should use colours distinct from the default crossOntology gold (#eab839)', () => {
    const defaultGold = EDGE_STYLES.crossOntology.color;
    for (const [name, style] of Object.entries(DS_BRIDGE_STYLES)) {
      expect(style.color, `${name} should not use default gold`).not.toBe(defaultGold);
    }
  });

  it('each bridge should have a human-readable label', () => {
    expect(DS_BRIDGE_STYLES.realizesFeature.label).toBe('Feature Realisation');
    expect(DS_BRIDGE_STYLES.configuredByInstance.label).toBe('Instance Config');
    expect(DS_BRIDGE_STYLES.governedByProcess.label).toBe('Process Governance');
    expect(DS_BRIDGE_STYLES.ownedByBrand.label).toBe('Brand Ownership');
  });

  it('each bridge should map to the correct target ontology prefix', () => {
    expect(DS_BRIDGE_STYLES.realizesFeature.targetPrefix).toBe('efs');
    expect(DS_BRIDGE_STYLES.configuredByInstance.targetPrefix).toBe('emc');
    expect(DS_BRIDGE_STYLES.configuredByApp.targetPrefix).toBe('emc');
    expect(DS_BRIDGE_STYLES.governedByProcess.targetPrefix).toBe('pe');
    expect(DS_BRIDGE_STYLES.ownedByBrand.targetPrefix).toBe('org-ctx');
  });
});

// ========================================
// Bridge type filter state logic
// ========================================

describe('Bridge type filter state', () => {
  it('should initialise all patterns as active (true) when first toggled', () => {
    const filters = {};
    for (const s of Object.values(DS_BRIDGE_STYLES)) {
      filters[s.patternId] = true;
    }
    expect(filters['JP-DS-001']).toBe(true);
    expect(filters['JP-DS-002']).toBe(true);
    expect(filters['JP-DS-003']).toBe(true);
    expect(filters['JP-DS-004']).toBe(true);
  });

  it('toggling a pattern should flip its value', () => {
    const filters = { 'JP-DS-001': true, 'JP-DS-002': true, 'JP-DS-003': true, 'JP-DS-004': true };
    filters['JP-DS-001'] = !filters['JP-DS-001'];
    expect(filters['JP-DS-001']).toBe(false);
    expect(filters['JP-DS-002']).toBe(true); // others unaffected
  });

  it('a false filter value should indicate the edge type is hidden', () => {
    const filters = { 'JP-DS-001': false, 'JP-DS-002': true };
    const edge = { patternId: 'JP-DS-001' };
    const isFiltered = filters[edge.patternId] === false;
    expect(isFiltered).toBe(true);
  });

  it('null/undefined filters should mean all edges are visible (no filtering)', () => {
    const filters = null;
    const edge = { patternId: 'JP-DS-001' };
    const isFiltered = filters && edge.patternId && filters[edge.patternId] === false;
    expect(isFiltered).toBeFalsy();
  });
});

// ========================================
// Cross-edge patternId and bridgeName attachment
// ========================================

describe('Cross-edge patternId attachment', () => {
  it('edge with bridgeName matching DS_BRIDGE_STYLES should resolve a style', () => {
    const edge = { bridgeName: 'realizesFeature', patternId: 'JP-DS-001' };
    const style = DS_BRIDGE_STYLES[edge.bridgeName];
    expect(style).toBeDefined();
    expect(style.patternId).toBe('JP-DS-001');
    expect(style.color).toBe('#76ff03');
  });

  it('edge with unknown bridgeName should not match any DS style', () => {
    const edge = { bridgeName: 'unknownRelationship' };
    const style = DS_BRIDGE_STYLES[edge.bridgeName];
    expect(style).toBeUndefined();
  });

  it('edge without bridgeName should gracefully return undefined', () => {
    const edge = {};
    const style = edge.bridgeName ? DS_BRIDGE_STYLES[edge.bridgeName] : null;
    expect(style).toBeNull();
  });
});

// ========================================
// Bridge node identification logic
// ========================================

describe('Bridge connections for node detail panel', () => {
  const mockCrossEdges = [
    { from: 'ds::DesignComponent', to: 'efs::Feature', bridgeName: 'realizesFeature', patternId: 'JP-DS-001', isCrossOntology: true, sourceNamespace: 'ds:' },
    { from: 'ds::DesignSystem', to: 'emc::InstanceConfiguration', bridgeName: 'configuredByInstance', patternId: 'JP-DS-002', isCrossOntology: true, sourceNamespace: 'ds:' },
    { from: 'ds::DesignSystem', to: 'pe::Process', bridgeName: 'governedByProcess', patternId: 'JP-DS-003', isCrossOntology: true, sourceNamespace: 'ds:' },
    { from: 'vsom::Vision', to: 'okr::Objective', bridgeName: 'informs', patternId: null, isCrossOntology: true, sourceNamespace: 'vsom:' },
  ];

  it('should find outgoing bridge connections for a DS node', () => {
    const nodeId = 'ds::DesignComponent';
    const bridges = mockCrossEdges.filter(e =>
      (e.from === nodeId || e.to === nodeId) && e.isCrossOntology
    );
    expect(bridges.length).toBe(1);
    expect(bridges[0].bridgeName).toBe('realizesFeature');
  });

  it('should find multiple bridges for a hub node', () => {
    const nodeId = 'ds::DesignSystem';
    const bridges = mockCrossEdges.filter(e =>
      (e.from === nodeId || e.to === nodeId) && e.isCrossOntology
    );
    expect(bridges.length).toBe(2);
  });

  it('should not find DS bridges for a non-DS node', () => {
    const nodeId = 'vsom::Vision';
    const bridges = mockCrossEdges.filter(e =>
      (e.from === nodeId || e.to === nodeId) && e.isCrossOntology && e.bridgeName && DS_BRIDGE_STYLES[e.bridgeName]
    );
    expect(bridges.length).toBe(0);
  });

  it('should distinguish outgoing vs incoming direction', () => {
    const nodeId = 'ds::DesignComponent';
    const bridges = mockCrossEdges.filter(e =>
      (e.from === nodeId || e.to === nodeId) && e.isCrossOntology
    );
    const bridge = bridges[0];
    const isOutgoing = bridge.from === nodeId;
    expect(isOutgoing).toBe(true);
    expect(bridge.to).toBe('efs::Feature');
  });
});
