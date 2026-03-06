/**
 * Unit tests for app-skeleton-loader.js — skeleton parsing, cascade merge,
 * registry building, nav rendering, and visibility evaluation.
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock state.js
vi.mock('../js/state.js', () => ({
  state: {
    appSkeleton: null,
    appSkeletonBase: null,
    navLayerRegistry: new Map(),
    zoneRegistry: new Map(),
    skeletonSource: null,
    actionIndex: null,
    zoneDomSelectors: null,
  },
  REGISTRY_BASE_PATH: '../../ONTOLOGIES/ontology-library/',
}));

import {
  parseAppSkeleton,
  mergeSkeletonCascade,
  buildSkeletonRegistries,
  getVisibleZones,
  updateSkeletonVisibility,
  renderNavFromSkeleton,
  wireAction,
  syncDynamicNavState,
} from '../js/app-skeleton-loader.js';

import { state } from '../js/state.js';

// --- Fixtures ---

const pfcSkeletonFixture = {
  '@context': { 'ds': 'https://platformcore.io/ontology/ds/' },
  '@graph': [
    {
      '@id': 'ds:app-pfc-visualiser',
      '@type': 'ds:Application',
      'ds:appId': 'pfc-visualiser',
      'ds:appName': 'PF-Core Visualiser',
      'ds:version': '4.5.0',
      'ds:appType': 'SPA',
      'ds:cascadeTier': 'PFC',
    },
    {
      '@id': 'ds:zone-Z1',
      '@type': 'ds:AppZone',
      'ds:zoneId': 'Z1',
      'ds:zoneName': 'Header',
      'ds:zoneType': 'Fixed',
      'ds:position': 'top',
      'ds:defaultWidth': '100%',
      'ds:defaultVisible': true,
      'ds:visibilityCondition': null,
      'ds:zIndex': 100,
      'ds:cascadeTier': 'PFC',
    },
    {
      '@id': 'ds:zone-Z2',
      '@type': 'ds:AppZone',
      'ds:zoneId': 'Z2',
      'ds:zoneName': 'Toolbar',
      'ds:zoneType': 'Fixed',
      'ds:position': 'top',
      'ds:defaultWidth': '100%',
      'ds:defaultVisible': true,
      'ds:visibilityCondition': null,
      'ds:zIndex': 99,
      'ds:cascadeTier': 'PFC',
    },
    {
      '@id': 'ds:zone-Z3',
      '@type': 'ds:AppZone',
      'ds:zoneId': 'Z3',
      'ds:zoneName': 'Context Identity Bar',
      'ds:zoneType': 'Conditional',
      'ds:position': 'top',
      'ds:defaultWidth': '100%',
      'ds:defaultVisible': false,
      'ds:visibilityCondition': "state.isPFIMode === true",
      'ds:zIndex': 98,
      'ds:cascadeTier': 'PFI',
    },
    {
      '@id': 'ds:zone-Z6',
      '@type': 'ds:AppZone',
      'ds:zoneId': 'Z6',
      'ds:zoneName': 'Graph Canvas',
      'ds:zoneType': 'Fixed',
      'ds:position': 'center',
      'ds:defaultWidth': '100%',
      'ds:defaultVisible': true,
      'ds:visibilityCondition': null,
      'ds:zIndex': 1,
      'ds:cascadeTier': 'PFC',
    },
    {
      '@id': 'ds:zone-Z9',
      '@type': 'ds:AppZone',
      'ds:zoneId': 'Z9',
      'ds:zoneName': 'Sidebar Details',
      'ds:zoneType': 'Sliding',
      'ds:position': 'right',
      'ds:defaultWidth': '380px',
      'ds:defaultVisible': false,
      'ds:visibilityCondition': null,
      'ds:zIndex': 60,
      'ds:cascadeTier': 'PFC',
    },
    {
      '@id': 'ds:navlayer-L1',
      '@type': 'ds:NavLayer',
      'ds:layerId': 'L1',
      'ds:layerName': 'Main Capabilities',
      'ds:layerLevel': 1,
      'ds:renderOrder': 1,
      'ds:cascadeTier': 'PFC',
    },
    {
      '@id': 'ds:navlayer-L4',
      '@type': 'ds:NavLayer',
      'ds:layerId': 'L4',
      'ds:layerName': 'PFI Custom',
      'ds:layerLevel': 4,
      'ds:renderOrder': 5,
      'ds:cascadeTier': 'PFI',
    },
    {
      '@id': 'ds:nav-L1-audit',
      '@type': 'ds:NavItem',
      'ds:itemId': 'nav-audit',
      'ds:label': 'OAA Audit',
      'ds:itemType': 'Button',
      'ds:action': 'toggleAuditPanel',
      'ds:renderOrder': 1,
      'ds:cascadeTier': 'PFC',
      'ds:belongsToLayer': { '@id': 'ds:navlayer-L1' },
    },
    {
      '@id': 'ds:nav-L1-library',
      '@type': 'ds:NavItem',
      'ds:itemId': 'nav-library',
      'ds:label': 'Library',
      'ds:itemType': 'Button',
      'ds:action': 'toggleLibraryPanel',
      'ds:renderOrder': 2,
      'ds:cascadeTier': 'PFC',
      'ds:belongsToLayer': { '@id': 'ds:navlayer-L1' },
    },
    {
      '@id': 'ds:cmp-glb-header',
      '@type': 'ds:ZoneComponent',
      'ds:placementId': 'cmp-glb-header',
      'ds:renderOrder': 1,
      'ds:slotName': 'header-content',
      'ds:cascadeTier': 'PFC',
      'ds:placedInZone': { '@id': 'ds:zone-Z1' },
      'ds:placesComponent': { '@id': 'ds:dc-header' },
    },
    {
      '@id': 'ds:cmp-viz-sidebar',
      '@type': 'ds:ZoneComponent',
      'ds:placementId': 'cmp-viz-sidebar',
      'ds:renderOrder': 1,
      'ds:slotName': 'sidebar-content',
      'ds:cascadeTier': 'PFC',
      'ds:placedInZone': { '@id': 'ds:zone-Z9' },
      'ds:placesComponent': { '@id': 'ds:dc-sidebar' },
    },
  ],
};

const baivOverrideFixture = {
  '@context': { 'ds': 'https://platformcore.io/ontology/ds/' },
  '@graph': [
    {
      '@id': 'ds:nav-L4-baiv-campaigns',
      '@type': 'ds:NavItem',
      'ds:itemId': 'nav-baiv-campaigns',
      'ds:label': 'Campaigns',
      'ds:itemType': 'Button',
      'ds:action': 'toggleBAIVCampaigns',
      'ds:renderOrder': 1,
      'ds:cascadeTier': 'PFI',
      'ds:belongsToLayer': { '@id': 'ds:navlayer-L4' },
    },
    {
      '@id': 'ds:nav-L4-baiv-agents',
      '@type': 'ds:NavItem',
      'ds:itemId': 'nav-baiv-agents',
      'ds:label': 'AI Agents',
      'ds:itemType': 'Button',
      'ds:action': 'toggleBAIVAgents',
      'ds:renderOrder': 2,
      'ds:cascadeTier': 'PFI',
      'ds:belongsToLayer': { '@id': 'ds:navlayer-L4' },
    },
  ],
};

// Fixture with a PFI item attempting to modify a PFC zone (should be blocked)
const immutabilityViolationFixture = {
  '@context': { 'ds': 'https://platformcore.io/ontology/ds/' },
  '@graph': [
    {
      '@id': 'ds:zone-Z1',
      '@type': 'ds:AppZone',
      'ds:zoneId': 'Z1',
      'ds:zoneName': 'Modified Header',
      'ds:zoneType': 'Floating',
      'ds:cascadeTier': 'PFI',
    },
  ],
};

// --- Tests ---

describe('parseAppSkeleton', () => {
  it('extracts application, zones, navLayers, navItems, and zoneComponents from JSONLD', () => {
    const result = parseAppSkeleton(pfcSkeletonFixture);

    expect(result.application).toBeTruthy();
    expect(result.application['ds:appId']).toBe('pfc-visualiser');
    expect(result.zones).toHaveLength(5);
    expect(result.navLayers).toHaveLength(2);
    expect(result.navItems).toHaveLength(2);
    expect(result.zoneComponents).toHaveLength(2);
  });

  it('returns empty arrays for null/undefined input', () => {
    const result = parseAppSkeleton(null);
    expect(result.application).toBeNull();
    expect(result.zones).toHaveLength(0);
    expect(result.navLayers).toHaveLength(0);
    expect(result.navItems).toHaveLength(0);
    expect(result.zoneComponents).toHaveLength(0);
  });

  it('returns empty arrays for JSONLD with no @graph', () => {
    const result = parseAppSkeleton({ '@context': {} });
    expect(result.zones).toHaveLength(0);
  });

  it('correctly identifies zone types', () => {
    const result = parseAppSkeleton(pfcSkeletonFixture);
    const fixed = result.zones.filter(z => z['ds:zoneType'] === 'Fixed');
    const sliding = result.zones.filter(z => z['ds:zoneType'] === 'Sliding');
    const conditional = result.zones.filter(z => z['ds:zoneType'] === 'Conditional');

    expect(fixed).toHaveLength(3);
    expect(sliding).toHaveLength(1);
    expect(conditional).toHaveLength(1);
  });
});

describe('mergeSkeletonCascade', () => {
  it('adds new PFI nav items without modifying base', () => {
    const base = parseAppSkeleton(pfcSkeletonFixture);
    const override = parseAppSkeleton(baivOverrideFixture);

    const merged = mergeSkeletonCascade(base, override);

    // Base had 2 nav items, override adds 2 more
    expect(merged.navItems).toHaveLength(4);
    // Original items preserved
    expect(merged.navItems.find(n => n['ds:itemId'] === 'nav-audit')).toBeTruthy();
    expect(merged.navItems.find(n => n['ds:itemId'] === 'nav-library')).toBeTruthy();
    // New items added
    expect(merged.navItems.find(n => n['ds:itemId'] === 'nav-baiv-campaigns')).toBeTruthy();
    expect(merged.navItems.find(n => n['ds:itemId'] === 'nav-baiv-agents')).toBeTruthy();
  });

  it('preserves zones from base when override has no zones', () => {
    const base = parseAppSkeleton(pfcSkeletonFixture);
    const override = parseAppSkeleton(baivOverrideFixture);

    const merged = mergeSkeletonCascade(base, override);
    expect(merged.zones).toHaveLength(5);
  });

  it('enforces BR-DS-013 CascadeImmutability — blocks PFI modification of PFC zone', () => {
    const base = parseAppSkeleton(pfcSkeletonFixture);
    const override = parseAppSkeleton(immutabilityViolationFixture);

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const merged = mergeSkeletonCascade(base, override);

    // Z1 should still have its PFC name 'Header', not 'Modified Header'
    const z1 = merged.zones.find(z => z['ds:zoneId'] === 'Z1');
    expect(z1['ds:zoneName']).toBe('Header');
    expect(z1['ds:zoneType']).toBe('Fixed');

    // Should have logged a warning
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Cascade immutability')
    );

    warnSpy.mockRestore();
  });

  it('returns base when override is null', () => {
    const base = parseAppSkeleton(pfcSkeletonFixture);
    const merged = mergeSkeletonCascade(base, null);

    expect(merged.zones).toHaveLength(5);
    expect(merged.navItems).toHaveLength(2);
  });

  it('preserves application from override when provided', () => {
    const base = parseAppSkeleton(pfcSkeletonFixture);
    const overrideWithApp = {
      application: { '@id': 'ds:app-baiv', 'ds:appName': 'BAIV Workbench' },
      zones: [], navLayers: [], navItems: [], zoneComponents: [],
    };

    const merged = mergeSkeletonCascade(base, overrideWithApp);
    expect(merged.application['ds:appName']).toBe('BAIV Workbench');
  });
});

describe('buildSkeletonRegistries', () => {
  beforeEach(() => {
    state.navLayerRegistry = new Map();
    state.zoneRegistry = new Map();
  });

  it('populates zoneRegistry with correct zone entries', () => {
    const skeleton = parseAppSkeleton(pfcSkeletonFixture);
    buildSkeletonRegistries(skeleton);

    expect(state.zoneRegistry.size).toBe(5);
    expect(state.zoneRegistry.has('Z1')).toBe(true);
    expect(state.zoneRegistry.has('Z6')).toBe(true);
    expect(state.zoneRegistry.has('Z9')).toBe(true);
  });

  it('attaches components to correct zones', () => {
    const skeleton = parseAppSkeleton(pfcSkeletonFixture);
    buildSkeletonRegistries(skeleton);

    const z1 = state.zoneRegistry.get('Z1');
    expect(z1.components).toHaveLength(1);
    expect(z1.components[0]['ds:placementId']).toBe('cmp-glb-header');

    const z9 = state.zoneRegistry.get('Z9');
    expect(z9.components).toHaveLength(1);
    expect(z9.components[0]['ds:placementId']).toBe('cmp-viz-sidebar');
  });

  it('populates navLayerRegistry with layers and items', () => {
    const skeleton = parseAppSkeleton(pfcSkeletonFixture);
    buildSkeletonRegistries(skeleton);

    expect(state.navLayerRegistry.size).toBe(2);

    const l1 = state.navLayerRegistry.get('L1');
    expect(l1).toBeTruthy();
    expect(l1.items).toHaveLength(2);
    expect(l1.items[0]['ds:itemId']).toBe('nav-audit');
    expect(l1.items[1]['ds:itemId']).toBe('nav-library');
  });

  it('L4 layer has no items at PFC level', () => {
    const skeleton = parseAppSkeleton(pfcSkeletonFixture);
    buildSkeletonRegistries(skeleton);

    const l4 = state.navLayerRegistry.get('L4');
    expect(l4).toBeTruthy();
    expect(l4.items).toHaveLength(0);
  });

  it('L4 layer gains items after BAIV merge', () => {
    const base = parseAppSkeleton(pfcSkeletonFixture);
    const override = parseAppSkeleton(baivOverrideFixture);
    const merged = mergeSkeletonCascade(base, override);
    buildSkeletonRegistries(merged);

    const l4 = state.navLayerRegistry.get('L4');
    expect(l4.items).toHaveLength(2);
    expect(l4.items[0]['ds:label']).toBe('Campaigns');
    expect(l4.items[1]['ds:label']).toBe('AI Agents');
  });
});

describe('getVisibleZones', () => {
  beforeEach(() => {
    const skeleton = parseAppSkeleton(pfcSkeletonFixture);
    buildSkeletonRegistries(skeleton);
  });

  it('returns defaultVisible zones for graph view', () => {
    const visible = getVisibleZones('graph', { isPFIMode: false });

    // Z1 (Header), Z2 (Toolbar), Z6 (Canvas) are defaultVisible: true
    expect(visible.has('Z1')).toBe(true);
    expect(visible.has('Z2')).toBe(true);
    expect(visible.has('Z6')).toBe(true);
    // Z3 (Context Bar) needs isPFIMode === true
    expect(visible.has('Z3')).toBe(false);
    // Z9 (Sidebar) is defaultVisible: false with no condition
    expect(visible.has('Z9')).toBe(false);
  });

  it('shows Z3 when PFI mode is active', () => {
    const visible = getVisibleZones('graph', { isPFIMode: true });
    expect(visible.has('Z3')).toBe(true);
  });
});

describe('cascade tier counts', () => {
  it('PFC skeleton has correct entity counts', () => {
    const result = parseAppSkeleton(pfcSkeletonFixture);
    const pfcZones = result.zones.filter(z => z['ds:cascadeTier'] === 'PFC');
    const pfiZones = result.zones.filter(z => z['ds:cascadeTier'] === 'PFI');

    expect(pfcZones.length).toBe(4);
    expect(pfiZones.length).toBe(1);
  });
});

// --- F40.17b + F40.20: Dynamic Navigation Tests ---

// Richer fixture with all 6 NavItem types for rendering tests
const dynNavFixture = {
  '@context': { 'ds': 'https://platformcore.io/ontology/ds/' },
  '@graph': [
    {
      '@id': 'ds:zone-Z2',
      '@type': 'ds:AppZone',
      'ds:zoneId': 'Z2',
      'ds:zoneName': 'Toolbar',
      'ds:zoneType': 'Fixed',
      'ds:defaultVisible': true,
      'ds:cascadeTier': 'PFC',
    },
    {
      '@id': 'ds:navlayer-L1',
      '@type': 'ds:NavLayer',
      'ds:layerId': 'L1',
      'ds:layerName': 'Main Capabilities',
      'ds:layerLevel': 1,
      'ds:renderOrder': 1,
      'ds:cascadeTier': 'PFC',
      'ds:navLayerInZone': { '@id': 'ds:zone-Z2' },
    },
    {
      '@id': 'ds:navlayer-L2',
      '@type': 'ds:NavLayer',
      'ds:layerId': 'L2',
      'ds:layerName': 'View Controls',
      'ds:layerLevel': 2,
      'ds:renderOrder': 2,
      'ds:cascadeTier': 'PFC',
      'ds:navLayerInZone': { '@id': 'ds:zone-Z2' },
    },
    {
      '@id': 'ds:navlayer-L3',
      '@type': 'ds:NavLayer',
      'ds:layerId': 'L3-context',
      'ds:layerName': 'Context/Mode',
      'ds:layerLevel': 3,
      'ds:renderOrder': 3,
      'ds:cascadeTier': 'PFC',
      'ds:navLayerInZone': { '@id': 'ds:zone-Z2' },
    },
    // L1 items: Button + Dropdown
    {
      '@id': 'ds:nav-audit',
      '@type': 'ds:NavItem',
      'ds:itemId': 'nav-audit',
      'ds:label': 'OAA Audit',
      'ds:itemType': 'Button',
      'ds:action': 'toggleAuditPanel',
      'ds:renderOrder': 1,
      'ds:cascadeTier': 'PFC',
      'ds:belongsToLayer': { '@id': 'ds:navlayer-L1' },
    },
    {
      '@id': 'ds:nav-export',
      '@type': 'ds:NavItem',
      'ds:itemId': 'nav-export',
      'ds:label': 'Export',
      'ds:itemType': 'Dropdown',
      'ds:action': 'toggleExportMenu',
      'ds:renderOrder': 2,
      'ds:cascadeTier': 'PFC',
      'ds:belongsToLayer': { '@id': 'ds:navlayer-L1' },
    },
    // L2 items: Toggle + Select
    {
      '@id': 'ds:nav-physics',
      '@type': 'ds:NavItem',
      'ds:itemId': 'nav-physics',
      'ds:label': 'Physics',
      'ds:itemType': 'Toggle',
      'ds:action': 'togglePhysics',
      'ds:stateBinding': 'state.physicsEnabled',
      'ds:renderOrder': 1,
      'ds:cascadeTier': 'PFC',
      'ds:visibilityCondition': "state.currentView === 'graph'",
      'ds:belongsToLayer': { '@id': 'ds:navlayer-L2' },
    },
    {
      '@id': 'ds:nav-instance',
      '@type': 'ds:NavItem',
      'ds:itemId': 'nav-instance-picker',
      'ds:label': 'PFI Instance',
      'ds:itemType': 'Select',
      'ds:action': 'selectPFIInstance',
      'ds:renderOrder': 2,
      'ds:cascadeTier': 'PFC',
      'ds:belongsToLayer': { '@id': 'ds:navlayer-L2' },
    },
    // L3-context items: Chip + Separator
    {
      '@id': 'ds:nav-tab-graph',
      '@type': 'ds:NavItem',
      'ds:itemId': 'nav-tab-graph',
      'ds:label': 'Graph',
      'ds:itemType': 'Chip',
      'ds:action': 'switchToGraphTab',
      'ds:stateBinding': 'graph',
      'ds:shortcut': '1',
      'ds:renderOrder': 1,
      'ds:cascadeTier': 'PFC',
      'ds:belongsToLayer': { '@id': 'ds:navlayer-L3' },
    },
    {
      '@id': 'ds:nav-tab-ds',
      '@type': 'ds:NavItem',
      'ds:itemId': 'nav-tab-ds',
      'ds:label': 'DS Cascade',
      'ds:itemType': 'Chip',
      'ds:action': 'switchToDSCascadeTab',
      'ds:stateBinding': 'ds-cascade',
      'ds:shortcut': '2',
      'ds:enabledCondition': 'state.activeDSBrand !== null',
      'ds:renderOrder': 2,
      'ds:cascadeTier': 'PFC',
      'ds:belongsToLayer': { '@id': 'ds:navlayer-L3' },
    },
    {
      '@id': 'ds:nav-sep-context',
      '@type': 'ds:NavItem',
      'ds:itemId': 'nav-sep-context',
      'ds:label': '',
      'ds:itemType': 'Separator',
      'ds:action': 'noop',
      'ds:renderOrder': 3,
      'ds:cascadeTier': 'PFC',
      'ds:belongsToLayer': { '@id': 'ds:navlayer-L3' },
    },
  ],
};

describe('wireAction (F40.17b T1-T3)', () => {
  it('T1: attaches click handler from registry for simple action', () => {
    const btn = document.createElement('button');
    const handler = vi.fn();
    const registry = { toggleAuditPanel: handler };

    wireAction(btn, 'toggleAuditPanel', registry);
    btn.click();

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(undefined);
  });

  it('T2: splits parameterised action on colon (setViewMode:graph)', () => {
    const btn = document.createElement('button');
    const handler = vi.fn();
    const registry = { setViewMode: handler };

    wireAction(btn, 'setViewMode:graph', registry);
    btn.click();

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith('graph');
  });

  it('T2b: handles parameterised action with multiple colons (setViewMode:ds-cascade)', () => {
    const btn = document.createElement('button');
    const handler = vi.fn();
    const registry = { setViewMode: handler };

    wireAction(btn, 'setViewMode:ds-cascade', registry);
    btn.click();

    expect(handler).toHaveBeenCalledWith('ds-cascade');
  });

  it('T3: logs warning for unmapped action', () => {
    const btn = document.createElement('button');
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    wireAction(btn, 'nonExistentAction', {});

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('nonExistentAction')
    );
    warnSpy.mockRestore();
  });

  it('uses change event for SELECT elements', () => {
    const select = document.createElement('select');
    const opt = document.createElement('option');
    opt.value = 'baiv';
    select.appendChild(opt);
    select.value = 'baiv';
    const handler = vi.fn();
    const registry = { selectPFIInstance: handler };

    wireAction(select, 'selectPFIInstance', registry);
    select.dispatchEvent(new Event('change'));

    expect(handler).toHaveBeenCalledWith('baiv');
  });

  it('does nothing when element, actionString, or registry is null', () => {
    expect(() => wireAction(null, 'toggle', {})).not.toThrow();
    expect(() => wireAction(document.createElement('button'), null, {})).not.toThrow();
    expect(() => wireAction(document.createElement('button'), 'toggle', null)).not.toThrow();
  });
});

describe('renderNavFromSkeleton with actionRegistry (F40.17b T4-T6)', () => {
  let container;
  let skeleton;

  beforeEach(() => {
    container = document.createElement('div');
    skeleton = parseAppSkeleton(dynNavFixture);
  });

  it('T4: creates separate .nav-layer divs per layer', () => {
    renderNavFromSkeleton(skeleton, container);

    const layers = container.querySelectorAll('.nav-layer');
    expect(layers.length).toBe(3); // L1, L2, L3-context
  });

  it('T5: each .nav-layer div has data-layer-name attribute', () => {
    renderNavFromSkeleton(skeleton, container);

    const layers = container.querySelectorAll('.nav-layer');
    const names = [...layers].map(l => l.dataset.layerName);

    expect(names).toContain('Main Capabilities');
    expect(names).toContain('View Controls');
    expect(names).toContain('Context/Mode');
  });

  it('T5b: each .nav-layer has level-specific CSS class', () => {
    renderNavFromSkeleton(skeleton, container);

    expect(container.querySelector('.nav-layer-L1')).toBeTruthy();
    expect(container.querySelector('.nav-layer-L2')).toBeTruthy();
    expect(container.querySelector('.nav-layer-L3-context')).toBeTruthy();
  });

  it('T6: all 6 NavItem types render with correct element types', () => {
    renderNavFromSkeleton(skeleton, container);

    // Button
    const audit = container.querySelector('[data-item-id="nav-audit"]');
    expect(audit).toBeTruthy();
    expect(audit.tagName).toBe('BUTTON');
    expect(audit.classList.contains('nav-button')).toBe(true);

    // Dropdown (wrapper div with button trigger + menu)
    const exportWrapper = container.querySelector('[data-item-id="nav-export"]');
    expect(exportWrapper).toBeTruthy();
    expect(exportWrapper.tagName).toBe('DIV');
    expect(exportWrapper.classList.contains('nav-dropdown-wrapper')).toBe(true);
    const exportTrigger = exportWrapper.querySelector('.nav-dropdown');
    expect(exportTrigger).toBeTruthy();
    expect(exportTrigger.getAttribute('aria-haspopup')).toBe('true');

    // Toggle
    const physics = container.querySelector('[data-item-id="nav-physics"]');
    expect(physics).toBeTruthy();
    expect(physics.tagName).toBe('BUTTON');
    expect(physics.classList.contains('nav-toggle')).toBe(true);
    expect(physics.getAttribute('aria-pressed')).toBe('false');

    // Select
    const instance = container.querySelector('[data-item-id="nav-instance-picker"]');
    expect(instance).toBeTruthy();
    expect(instance.tagName).toBe('SELECT');
    expect(instance.classList.contains('nav-select')).toBe(true);

    // Chip
    const graph = container.querySelector('[data-item-id="nav-tab-graph"]');
    expect(graph).toBeTruthy();
    expect(graph.tagName).toBe('BUTTON');
    expect(graph.classList.contains('nav-chip')).toBe(true);

    // Separator
    const sep = container.querySelector('[data-item-id="nav-sep-context"]');
    expect(sep).toBeTruthy();
    expect(sep.tagName).toBe('SPAN');
    expect(sep.classList.contains('nav-separator')).toBe(true);
  });

  it('wires action handlers when registry is provided', () => {
    const auditHandler = vi.fn();
    const graphTabHandler = vi.fn();
    const registry = {
      toggleAuditPanel: auditHandler,
      toggleExportMenu: vi.fn(),
      togglePhysics: vi.fn(),
      selectPFIInstance: vi.fn(),
      switchToGraphTab: graphTabHandler,
      noop: vi.fn(),
    };

    renderNavFromSkeleton(skeleton, container, registry);

    // Click the audit button — should fire handler
    const audit = container.querySelector('[data-item-id="nav-audit"]');
    audit.click();
    expect(auditHandler).toHaveBeenCalledTimes(1);

    // Click the graph chip — should fire switchToGraphTab
    const graphChip = container.querySelector('[data-item-id="nav-tab-graph"]');
    graphChip.click();
    expect(graphTabHandler).toHaveBeenCalledTimes(1);
  });

  it('does not wire handlers when registry is omitted', () => {
    renderNavFromSkeleton(skeleton, container);

    // Should render but no event listeners — clicking should not throw
    const audit = container.querySelector('[data-item-id="nav-audit"]');
    expect(() => audit.click()).not.toThrow();
  });

  it('sets data-action attribute regardless of registry', () => {
    renderNavFromSkeleton(skeleton, container);

    const audit = container.querySelector('[data-item-id="nav-audit"]');
    expect(audit.dataset.action).toBe('toggleAuditPanel');
  });

  it('preserves visibility condition data attribute', () => {
    renderNavFromSkeleton(skeleton, container);

    const physics = container.querySelector('[data-item-id="nav-physics"]');
    expect(physics.dataset.visibilityCondition).toBe("state.currentView === 'graph'");
  });

  it('layers are sorted by renderOrder', () => {
    renderNavFromSkeleton(skeleton, container);

    const layers = container.querySelectorAll('.nav-layer');
    const ids = [...layers].map(l => l.dataset.layerId);
    expect(ids).toEqual(['L1', 'L2', 'L3-context']);
  });

  it('items within a layer are sorted by renderOrder', () => {
    renderNavFromSkeleton(skeleton, container);

    const l1 = container.querySelector('.nav-layer-L1');
    const items = l1.querySelectorAll('[data-item-id]');
    const ids = [...items].map(el => el.dataset.itemId);
    expect(ids).toEqual(['nav-audit', 'nav-export']);
  });

  it('skips empty layers (no items)', () => {
    // Add an empty L4 layer to the skeleton
    const withEmptyL4 = parseAppSkeleton({
      ...dynNavFixture,
      '@graph': [
        ...dynNavFixture['@graph'],
        {
          '@id': 'ds:navlayer-L4',
          '@type': 'ds:NavLayer',
          'ds:layerId': 'L4',
          'ds:layerName': 'PFI Custom',
          'ds:layerLevel': 4,
          'ds:renderOrder': 4,
          'ds:cascadeTier': 'PFI',
        },
      ],
    });

    renderNavFromSkeleton(withEmptyL4, container);

    // L4 has no items — should not render
    const l4 = container.querySelector('.nav-layer-L4');
    expect(l4).toBeNull();
  });
});

// --- Phase 2: Visibility Engine + State Sync (F40.17b T7-T9) ---

describe('syncDynamicNavState (F40.17b T7-T9)', () => {
  let bar;
  let skeleton;

  beforeEach(() => {
    // Create a dynamic-nav-bar container in the DOM
    bar = document.createElement('div');
    bar.id = 'dynamic-nav-bar';
    document.body.appendChild(bar);

    skeleton = parseAppSkeleton(dynNavFixture);
    renderNavFromSkeleton(skeleton, bar);
  });

  afterEach(() => {
    bar.remove();
  });

  it('T7: conditional items hidden when condition is false', () => {
    // Physics toggle has visibilityCondition: "state.currentView === 'graph'"
    syncDynamicNavState({ currentView: 'mermaid', isPFIMode: false, physicsEnabled: false });

    const physics = bar.querySelector('[data-item-id="nav-physics"]');
    expect(physics.style.display).toBe('none');
  });

  it('T7b: conditional items shown when condition is true', () => {
    syncDynamicNavState({ currentView: 'graph', isPFIMode: false, physicsEnabled: false });

    const physics = bar.querySelector('[data-item-id="nav-physics"]');
    expect(physics.style.display).toBe('');
  });

  it('T8: toggle aria-pressed reflects physics state', () => {
    const physics = bar.querySelector('[data-item-id="nav-physics"]');

    syncDynamicNavState({ currentView: 'graph', isPFIMode: false, physicsEnabled: true });
    expect(physics.getAttribute('aria-pressed')).toBe('true');

    syncDynamicNavState({ currentView: 'graph', isPFIMode: false, physicsEnabled: false });
    expect(physics.getAttribute('aria-pressed')).toBe('false');
  });

  it('T9: active chip class updates on view mode change', () => {
    const graphChip = bar.querySelector('[data-item-id="nav-tab-graph"]');

    syncDynamicNavState({ currentView: 'graph', isPFIMode: false, physicsEnabled: false });
    expect(graphChip.classList.contains('active')).toBe(true);

    syncDynamicNavState({ currentView: 'mermaid', isPFIMode: false, physicsEnabled: false });
    expect(graphChip.classList.contains('active')).toBe(false);
  });

  it('only one chip is active at a time', () => {
    // dynNavFixture only has one chip (nav-tab-graph), but test the principle
    syncDynamicNavState({ currentView: 'graph', isPFIMode: false, physicsEnabled: false });

    const activeChips = bar.querySelectorAll('.nav-chip.active');
    expect(activeChips.length).toBe(1);
    expect(activeChips[0].dataset.itemId).toBe('nav-tab-graph');
  });

  it('no chips active when view mode matches none', () => {
    syncDynamicNavState({ currentView: 'mindmap', isPFIMode: false, physicsEnabled: false });

    const activeChips = bar.querySelectorAll('.nav-chip.active');
    expect(activeChips.length).toBe(0);
  });
});

// --- S40.17b.1: Chip Enabled Condition ---

describe('chip enabledCondition (S40.17b.1)', () => {
  let bar;

  beforeEach(() => {
    bar = document.createElement('div');
    bar.id = 'dynamic-nav-bar';
    document.body.appendChild(bar);

    const skeleton = parseAppSkeleton(dynNavFixture);
    renderNavFromSkeleton(skeleton, bar);
  });

  afterEach(() => {
    bar.remove();
  });

  it('DS Cascade chip renders with data-enabled-condition attribute', () => {
    const dsChip = bar.querySelector('[data-item-id="nav-tab-ds"]');
    expect(dsChip).not.toBeNull();
    expect(dsChip.dataset.enabledCondition).toBe('state.activeDSBrand !== null');
  });

  it('DS Cascade chip is disabled when activeDSBrand is null', () => {
    syncDynamicNavState({ currentView: 'graph', activeDSBrand: null });

    const dsChip = bar.querySelector('[data-item-id="nav-tab-ds"]');
    expect(dsChip.disabled).toBe(true);
    expect(dsChip.classList.contains('disabled')).toBe(true);
  });

  it('DS Cascade chip is enabled when activeDSBrand is set', () => {
    syncDynamicNavState({ currentView: 'graph', activeDSBrand: 'BAIV' });

    const dsChip = bar.querySelector('[data-item-id="nav-tab-ds"]');
    expect(dsChip.disabled).toBe(false);
    expect(dsChip.classList.contains('disabled')).toBe(false);
  });

  it('DS Cascade chip transitions from disabled to enabled', () => {
    const dsChip = bar.querySelector('[data-item-id="nav-tab-ds"]');

    // Initially disabled
    syncDynamicNavState({ currentView: 'graph', activeDSBrand: null });
    expect(dsChip.disabled).toBe(true);

    // Brand loaded → enabled
    syncDynamicNavState({ currentView: 'graph', activeDSBrand: 'W4M' });
    expect(dsChip.disabled).toBe(false);
    expect(dsChip.classList.contains('disabled')).toBe(false);
  });

  it('chips without enabledCondition are unaffected', () => {
    syncDynamicNavState({ currentView: 'graph', activeDSBrand: null });

    const graphChip = bar.querySelector('[data-item-id="nav-tab-graph"]');
    expect(graphChip.disabled).toBe(false);
    expect(graphChip.classList.contains('disabled')).toBe(false);
  });
});

// --- Phase 4: PFI Cascade Integration (F40.17b T13-T14) ---

describe('PFI cascade in dynamic nav (F40.17b T13-T14)', () => {
  it('T13: PFI cascade appends L4 items that render in the nav bar', () => {
    const base = parseAppSkeleton(dynNavFixture);

    // Simulate a PFI override adding L4 items
    const pfiOverride = parseAppSkeleton({
      '@context': { 'ds': 'https://platformcore.io/ontology/ds/' },
      '@graph': [
        {
          '@id': 'ds:navlayer-L4',
          '@type': 'ds:NavLayer',
          'ds:layerId': 'L4',
          'ds:layerName': 'PFI Custom',
          'ds:layerLevel': 4,
          'ds:renderOrder': 4,
          'ds:cascadeTier': 'PFI',
        },
        {
          '@id': 'ds:nav-baiv-campaigns',
          '@type': 'ds:NavItem',
          'ds:itemId': 'nav-baiv-campaigns',
          'ds:label': 'Campaigns',
          'ds:itemType': 'Button',
          'ds:action': 'toggleBAIVCampaigns',
          'ds:renderOrder': 1,
          'ds:cascadeTier': 'PFI',
          'ds:belongsToLayer': { '@id': 'ds:navlayer-L4' },
        },
      ],
    });

    const merged = mergeSkeletonCascade(base, pfiOverride);
    const container = document.createElement('div');
    renderNavFromSkeleton(merged, container);

    // L4 should now render with the PFI item
    const l4 = container.querySelector('.nav-layer-L4');
    expect(l4).toBeTruthy();
    const campaign = l4.querySelector('[data-item-id="nav-baiv-campaigns"]');
    expect(campaign).toBeTruthy();
    expect(campaign.textContent).toBe('Campaigns');
    expect(campaign.dataset.cascadeTier).toBe('PFI');
  });

  it('T14: PFC-tier items are immutable — override attempts rejected', () => {
    const base = parseAppSkeleton(dynNavFixture);

    // PFI tries to modify PFC item
    const pfiOverride = parseAppSkeleton({
      '@context': { 'ds': 'https://platformcore.io/ontology/ds/' },
      '@graph': [
        {
          '@id': 'ds:nav-audit',
          '@type': 'ds:NavItem',
          'ds:itemId': 'nav-audit',
          'ds:label': 'HACKED Audit',
          'ds:itemType': 'Button',
          'ds:renderOrder': 1,
          'ds:cascadeTier': 'PFI',
          'ds:belongsToLayer': { '@id': 'ds:navlayer-L1' },
        },
      ],
    });

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const merged = mergeSkeletonCascade(base, pfiOverride);
    warnSpy.mockRestore();

    // Original label preserved
    const audit = merged.navItems.find(i => i['ds:itemId'] === 'nav-audit');
    expect(audit['ds:label']).toBe('OAA Audit');
  });

  it('T14b: L5+ layers render without hardcoded layer assumptions', () => {
    const base = parseAppSkeleton(dynNavFixture);

    // Add L5 and L6 layers — no layer assumptions in renderer
    const extensionOverride = parseAppSkeleton({
      '@context': { 'ds': 'https://platformcore.io/ontology/ds/' },
      '@graph': [
        {
          '@id': 'ds:navlayer-L5',
          '@type': 'ds:NavLayer',
          'ds:layerId': 'L5',
          'ds:layerName': 'Client Custom',
          'ds:layerLevel': 5,
          'ds:renderOrder': 5,
          'ds:cascadeTier': 'Client',
        },
        {
          '@id': 'ds:nav-client-dashboard',
          '@type': 'ds:NavItem',
          'ds:itemId': 'nav-client-dashboard',
          'ds:label': 'Dashboard',
          'ds:itemType': 'Button',
          'ds:action': 'openClientDashboard',
          'ds:renderOrder': 1,
          'ds:cascadeTier': 'Client',
          'ds:belongsToLayer': { '@id': 'ds:navlayer-L5' },
        },
      ],
    });

    const merged = mergeSkeletonCascade(base, extensionOverride);
    const container = document.createElement('div');
    renderNavFromSkeleton(merged, container);

    // L5 renders correctly
    const l5 = container.querySelector('.nav-layer-L5');
    expect(l5).toBeTruthy();
    expect(l5.dataset.layerName).toBe('Client Custom');
    const dashboard = l5.querySelector('[data-item-id="nav-client-dashboard"]');
    expect(dashboard).toBeTruthy();

    // Layer ordering is correct: L1, L2, L3-context, L5
    const layers = container.querySelectorAll('.nav-layer');
    const ids = [...layers].map(l => l.dataset.layerId);
    expect(ids).toEqual(['L1', 'L2', 'L3-context', 'L5']);
  });
});

// --- F40.21: DICE (FloodGraph AI) PFI Skeleton Tests ---

const diceOverrideFixture = {
  '@context': {
    '@vocab': 'https://schema.org/',
    'ds': 'https://platformcore.io/ontology/ds/',
    'emc': 'https://platformcore.io/ontology/emc/',
  },
  '@graph': [
    {
      '@id': 'ds:dice-app-skeleton-v1.0.0',
      '@type': 'ds:Application',
      'ds:appId': 'dice-app',
      'ds:appName': 'FloodGraph AI — PFI-PC-DICE',
      'ds:version': '1.0.0',
      'ds:cascadeTier': 'PFI',
      'ds:extendsApp': { '@id': 'ds:pfc-app-skeleton-v1.0.0' },
      'ds:configuredByApp': { '@id': 'emc:InstanceConfiguration-PFI-PC-DICE' },
    },
    // 13 zones: identity + agent dashboard + 4 agent panels + 4 stakeholder views + compliance + analytics + PPM
    { '@id': 'ds:zone-Z-DICE-100', '@type': 'ds:AppZone', 'ds:zoneId': 'Z-DICE-100', 'ds:zoneName': 'FloodGraph AI Identity', 'ds:zoneType': 'Conditional', 'ds:position': 'top', 'ds:defaultVisible': false, 'ds:visibilityCondition': "state.activeInstanceId === 'PFI-PC-DICE'", 'ds:cascadeTier': 'PFI', 'ds:zIndex': 97 },
    { '@id': 'ds:zone-Z-DICE-101', '@type': 'ds:AppZone', 'ds:zoneId': 'Z-DICE-101', 'ds:zoneName': 'Agent Dashboard', 'ds:zoneType': 'Sliding', 'ds:position': 'right', 'ds:defaultVisible': false, 'ds:visibilityCondition': "state.activeInstanceId === 'PFI-PC-DICE'", 'ds:cascadeTier': 'PFI', 'ds:zIndex': 60 },
    { '@id': 'ds:zone-Z-DICE-102', '@type': 'ds:AppZone', 'ds:zoneId': 'Z-DICE-102', 'ds:zoneName': 'FRA Assessment Agent Panel', 'ds:zoneType': 'Sliding', 'ds:position': 'right', 'ds:defaultVisible': false, 'ds:visibilityCondition': "state.activeInstanceId === 'PFI-PC-DICE'", 'ds:cascadeTier': 'PFI', 'ds:zIndex': 60 },
    { '@id': 'ds:zone-Z-DICE-103', '@type': 'ds:AppZone', 'ds:zoneId': 'Z-DICE-103', 'ds:zoneName': 'SuDS Mitigation Agent Panel', 'ds:zoneType': 'Sliding', 'ds:position': 'right', 'ds:defaultVisible': false, 'ds:visibilityCondition': "state.activeInstanceId === 'PFI-PC-DICE'", 'ds:cascadeTier': 'PFI', 'ds:zIndex': 60 },
    { '@id': 'ds:zone-Z-DICE-104', '@type': 'ds:AppZone', 'ds:zoneId': 'Z-DICE-104', 'ds:zoneName': 'Climate Projection Agent Panel', 'ds:zoneType': 'Sliding', 'ds:position': 'right', 'ds:defaultVisible': false, 'ds:visibilityCondition': "state.activeInstanceId === 'PFI-PC-DICE'", 'ds:cascadeTier': 'PFI', 'ds:zIndex': 60 },
    { '@id': 'ds:zone-Z-DICE-105', '@type': 'ds:AppZone', 'ds:zoneId': 'Z-DICE-105', 'ds:zoneName': 'FRA Narrative Agent Panel', 'ds:zoneType': 'Sliding', 'ds:position': 'right', 'ds:defaultVisible': false, 'ds:visibilityCondition': "state.activeInstanceId === 'PFI-PC-DICE'", 'ds:cascadeTier': 'PFI', 'ds:zIndex': 60 },
    { '@id': 'ds:zone-Z-DICE-200', '@type': 'ds:AppZone', 'ds:zoneId': 'Z-DICE-200', 'ds:zoneName': 'Developer View', 'ds:zoneType': 'Sliding', 'ds:position': 'right', 'ds:defaultVisible': false, 'ds:visibilityCondition': "state.activeInstanceId === 'PFI-PC-DICE' && state.activeStakeholderRole === 'Developer'", 'ds:cascadeTier': 'PFI', 'ds:zIndex': 60 },
    { '@id': 'ds:zone-Z-DICE-201', '@type': 'ds:AppZone', 'ds:zoneId': 'Z-DICE-201', 'ds:zoneName': 'Consultant View', 'ds:zoneType': 'Sliding', 'ds:position': 'right', 'ds:defaultVisible': false, 'ds:visibilityCondition': "state.activeInstanceId === 'PFI-PC-DICE' && state.activeStakeholderRole === 'Consultant'", 'ds:cascadeTier': 'PFI', 'ds:zIndex': 60 },
    { '@id': 'ds:zone-Z-DICE-202', '@type': 'ds:AppZone', 'ds:zoneId': 'Z-DICE-202', 'ds:zoneName': 'LPA View', 'ds:zoneType': 'Sliding', 'ds:position': 'right', 'ds:defaultVisible': false, 'ds:visibilityCondition': "state.activeInstanceId === 'PFI-PC-DICE' && state.activeStakeholderRole === 'LPA'", 'ds:cascadeTier': 'PFI', 'ds:zIndex': 60 },
    { '@id': 'ds:zone-Z-DICE-203', '@type': 'ds:AppZone', 'ds:zoneId': 'Z-DICE-203', 'ds:zoneName': 'Insurer View', 'ds:zoneType': 'Sliding', 'ds:position': 'right', 'ds:defaultVisible': false, 'ds:visibilityCondition': "state.activeInstanceId === 'PFI-PC-DICE' && state.activeStakeholderRole === 'Insurer'", 'ds:cascadeTier': 'PFI', 'ds:zIndex': 60 },
    { '@id': 'ds:zone-Z-DICE-300', '@type': 'ds:AppZone', 'ds:zoneId': 'Z-DICE-300', 'ds:zoneName': 'Compliance Dashboard', 'ds:zoneType': 'Sliding', 'ds:position': 'left', 'ds:defaultVisible': false, 'ds:visibilityCondition': "state.activeInstanceId === 'PFI-PC-DICE'", 'ds:cascadeTier': 'PFI', 'ds:zIndex': 60 },
    { '@id': 'ds:zone-Z-DICE-301', '@type': 'ds:AppZone', 'ds:zoneId': 'Z-DICE-301', 'ds:zoneName': 'Analytics Dashboard', 'ds:zoneType': 'Sliding', 'ds:position': 'left', 'ds:defaultVisible': false, 'ds:visibilityCondition': "state.activeInstanceId === 'PFI-PC-DICE'", 'ds:cascadeTier': 'PFI', 'ds:zIndex': 60 },
    { '@id': 'ds:zone-Z-DICE-302', '@type': 'ds:AppZone', 'ds:zoneId': 'Z-DICE-302', 'ds:zoneName': 'Project Management', 'ds:zoneType': 'Sliding', 'ds:position': 'left', 'ds:defaultVisible': false, 'ds:visibilityCondition': "state.activeInstanceId === 'PFI-PC-DICE' && state.ppmActive === true", 'ds:cascadeTier': 'PFI', 'ds:zIndex': 60 },
    // 11 L4 nav items
    { '@id': 'ds:nav-L4-dice-agents', '@type': 'ds:NavItem', 'ds:itemId': 'nav-dice-agents', 'ds:label': 'AI Agents', 'ds:itemType': 'Button', 'ds:action': 'toggleDICEAgents', 'ds:renderOrder': 1, 'ds:cascadeTier': 'PFI', 'ds:visibilityCondition': "state.activeInstanceId === 'PFI-PC-DICE'", 'ds:belongsToLayer': { '@id': 'ds:navlayer-L4' } },
    { '@id': 'ds:nav-L4-dice-fra-assessment', '@type': 'ds:NavItem', 'ds:itemId': 'nav-dice-fra-assessment', 'ds:label': 'FRA Assessment', 'ds:itemType': 'Button', 'ds:action': 'toggleDICEFRAAssessment', 'ds:renderOrder': 2, 'ds:cascadeTier': 'PFI', 'ds:visibilityCondition': "state.activeInstanceId === 'PFI-PC-DICE'", 'ds:belongsToLayer': { '@id': 'ds:navlayer-L4' } },
    { '@id': 'ds:nav-L4-dice-suds', '@type': 'ds:NavItem', 'ds:itemId': 'nav-dice-suds', 'ds:label': 'SuDS Design', 'ds:itemType': 'Button', 'ds:action': 'toggleDICESuDS', 'ds:renderOrder': 3, 'ds:cascadeTier': 'PFI', 'ds:visibilityCondition': "state.activeInstanceId === 'PFI-PC-DICE'", 'ds:belongsToLayer': { '@id': 'ds:navlayer-L4' } },
    { '@id': 'ds:nav-L4-dice-climate', '@type': 'ds:NavItem', 'ds:itemId': 'nav-dice-climate', 'ds:label': 'Climate', 'ds:itemType': 'Button', 'ds:action': 'toggleDICEClimate', 'ds:renderOrder': 4, 'ds:cascadeTier': 'PFI', 'ds:visibilityCondition': "state.activeInstanceId === 'PFI-PC-DICE'", 'ds:belongsToLayer': { '@id': 'ds:navlayer-L4' } },
    { '@id': 'ds:nav-L4-dice-narrative', '@type': 'ds:NavItem', 'ds:itemId': 'nav-dice-narrative', 'ds:label': 'FRA Report', 'ds:itemType': 'Button', 'ds:action': 'toggleDICENarrative', 'ds:renderOrder': 5, 'ds:cascadeTier': 'PFI', 'ds:visibilityCondition': "state.activeInstanceId === 'PFI-PC-DICE'", 'ds:belongsToLayer': { '@id': 'ds:navlayer-L4' } },
    { '@id': 'ds:nav-L4-dice-stakeholders', '@type': 'ds:NavItem', 'ds:itemId': 'nav-dice-stakeholders', 'ds:label': 'Views', 'ds:itemType': 'Dropdown', 'ds:action': 'toggleDICEStakeholderMenu', 'ds:renderOrder': 6, 'ds:cascadeTier': 'PFI', 'ds:visibilityCondition': "state.activeInstanceId === 'PFI-PC-DICE'", 'ds:belongsToLayer': { '@id': 'ds:navlayer-L4' } },
    { '@id': 'ds:nav-L4-dice-compose', '@type': 'ds:NavItem', 'ds:itemId': 'nav-dice-compose', 'ds:label': 'Compose Graph', 'ds:itemType': 'Button', 'ds:action': 'composeDICEGraph', 'ds:renderOrder': 7, 'ds:cascadeTier': 'PFI', 'ds:visibilityCondition': "state.activeInstanceId === 'PFI-PC-DICE'", 'ds:belongsToLayer': { '@id': 'ds:navlayer-L4' } },
    { '@id': 'ds:nav-L4-dice-freeze', '@type': 'ds:NavItem', 'ds:itemId': 'nav-dice-freeze', 'ds:label': 'Freeze Snapshot', 'ds:itemType': 'Button', 'ds:action': 'freezeDICESnapshot', 'ds:renderOrder': 8, 'ds:cascadeTier': 'PFI', 'ds:visibilityCondition': "state.activeInstanceId === 'PFI-PC-DICE' && state.composedPFIGraph", 'ds:belongsToLayer': { '@id': 'ds:navlayer-L4' } },
    { '@id': 'ds:nav-L4-dice-compliance', '@type': 'ds:NavItem', 'ds:itemId': 'nav-dice-compliance', 'ds:label': 'Compliance', 'ds:itemType': 'Button', 'ds:action': 'toggleDICECompliance', 'ds:renderOrder': 9, 'ds:cascadeTier': 'PFI', 'ds:visibilityCondition': "state.activeInstanceId === 'PFI-PC-DICE'", 'ds:belongsToLayer': { '@id': 'ds:navlayer-L4' } },
    { '@id': 'ds:nav-L4-dice-analytics', '@type': 'ds:NavItem', 'ds:itemId': 'nav-dice-analytics', 'ds:label': 'Analytics', 'ds:itemType': 'Button', 'ds:action': 'toggleDICEAnalytics', 'ds:renderOrder': 10, 'ds:cascadeTier': 'PFI', 'ds:visibilityCondition': "state.activeInstanceId === 'PFI-PC-DICE'", 'ds:belongsToLayer': { '@id': 'ds:navlayer-L4' } },
    { '@id': 'ds:nav-L4-dice-ppm', '@type': 'ds:NavItem', 'ds:itemId': 'nav-dice-ppm', 'ds:label': 'Projects', 'ds:itemType': 'Button', 'ds:action': 'toggleDICEPPM', 'ds:renderOrder': 11, 'ds:cascadeTier': 'PFI', 'ds:visibilityCondition': "state.activeInstanceId === 'PFI-PC-DICE' && state.ppmActive === true", 'ds:belongsToLayer': { '@id': 'ds:navlayer-L4' } },
    // 13 zone components (+ 1 context-bar override = 14 total)
    { '@id': 'ds:cmp-dice-identity', '@type': 'ds:ZoneComponent', 'ds:placementId': 'cmp-dice-identity', 'ds:slotName': 'identity-content', 'ds:placedInZone': { '@id': 'ds:zone-Z-DICE-100' }, 'ds:placesComponent': { '@id': 'ds:dc-pfi-identity' }, 'ds:renderOrder': 1, 'ds:cascadeTier': 'PFI' },
    { '@id': 'ds:cmp-dice-agent-dashboard', '@type': 'ds:ZoneComponent', 'ds:placementId': 'cmp-dice-agent-dashboard', 'ds:slotName': 'agent-dashboard-content', 'ds:placedInZone': { '@id': 'ds:zone-Z-DICE-101' }, 'ds:placesComponent': { '@id': 'ds:dc-agent-dashboard' }, 'ds:renderOrder': 1, 'ds:cascadeTier': 'PFI' },
    { '@id': 'ds:cmp-dice-fra-assessment', '@type': 'ds:ZoneComponent', 'ds:placementId': 'cmp-dice-fra-assessment', 'ds:slotName': 'fra-assessment-content', 'ds:placedInZone': { '@id': 'ds:zone-Z-DICE-102' }, 'ds:placesComponent': { '@id': 'ds:dc-agent-panel' }, 'ds:renderOrder': 1, 'ds:cascadeTier': 'PFI' },
    { '@id': 'ds:cmp-dice-suds-mitigation', '@type': 'ds:ZoneComponent', 'ds:placementId': 'cmp-dice-suds-mitigation', 'ds:slotName': 'suds-mitigation-content', 'ds:placedInZone': { '@id': 'ds:zone-Z-DICE-103' }, 'ds:placesComponent': { '@id': 'ds:dc-agent-panel' }, 'ds:renderOrder': 1, 'ds:cascadeTier': 'PFI' },
    { '@id': 'ds:cmp-dice-climate-projection', '@type': 'ds:ZoneComponent', 'ds:placementId': 'cmp-dice-climate-projection', 'ds:slotName': 'climate-projection-content', 'ds:placedInZone': { '@id': 'ds:zone-Z-DICE-104' }, 'ds:placesComponent': { '@id': 'ds:dc-agent-panel' }, 'ds:renderOrder': 1, 'ds:cascadeTier': 'PFI' },
    { '@id': 'ds:cmp-dice-fra-narrative', '@type': 'ds:ZoneComponent', 'ds:placementId': 'cmp-dice-fra-narrative', 'ds:slotName': 'fra-narrative-content', 'ds:placedInZone': { '@id': 'ds:zone-Z-DICE-105' }, 'ds:placesComponent': { '@id': 'ds:dc-agent-panel' }, 'ds:renderOrder': 1, 'ds:cascadeTier': 'PFI' },
    { '@id': 'ds:cmp-dice-developer-view', '@type': 'ds:ZoneComponent', 'ds:placementId': 'cmp-dice-developer-view', 'ds:slotName': 'developer-view-content', 'ds:placedInZone': { '@id': 'ds:zone-Z-DICE-200' }, 'ds:placesComponent': { '@id': 'ds:dc-stakeholder-view' }, 'ds:renderOrder': 1, 'ds:cascadeTier': 'PFI' },
    { '@id': 'ds:cmp-dice-consultant-view', '@type': 'ds:ZoneComponent', 'ds:placementId': 'cmp-dice-consultant-view', 'ds:slotName': 'consultant-view-content', 'ds:placedInZone': { '@id': 'ds:zone-Z-DICE-201' }, 'ds:placesComponent': { '@id': 'ds:dc-stakeholder-view' }, 'ds:renderOrder': 1, 'ds:cascadeTier': 'PFI' },
    { '@id': 'ds:cmp-dice-lpa-view', '@type': 'ds:ZoneComponent', 'ds:placementId': 'cmp-dice-lpa-view', 'ds:slotName': 'lpa-view-content', 'ds:placedInZone': { '@id': 'ds:zone-Z-DICE-202' }, 'ds:placesComponent': { '@id': 'ds:dc-stakeholder-view' }, 'ds:renderOrder': 1, 'ds:cascadeTier': 'PFI' },
    { '@id': 'ds:cmp-dice-insurer-view', '@type': 'ds:ZoneComponent', 'ds:placementId': 'cmp-dice-insurer-view', 'ds:slotName': 'insurer-view-content', 'ds:placedInZone': { '@id': 'ds:zone-Z-DICE-203' }, 'ds:placesComponent': { '@id': 'ds:dc-stakeholder-view' }, 'ds:renderOrder': 1, 'ds:cascadeTier': 'PFI' },
    { '@id': 'ds:cmp-dice-compliance', '@type': 'ds:ZoneComponent', 'ds:placementId': 'cmp-dice-compliance', 'ds:slotName': 'compliance-content', 'ds:placedInZone': { '@id': 'ds:zone-Z-DICE-300' }, 'ds:placesComponent': { '@id': 'ds:dc-compliance-dashboard' }, 'ds:renderOrder': 1, 'ds:cascadeTier': 'PFI' },
    { '@id': 'ds:cmp-dice-analytics', '@type': 'ds:ZoneComponent', 'ds:placementId': 'cmp-dice-analytics', 'ds:slotName': 'analytics-content', 'ds:placedInZone': { '@id': 'ds:zone-Z-DICE-301' }, 'ds:placesComponent': { '@id': 'ds:dc-analytics-dashboard' }, 'ds:renderOrder': 1, 'ds:cascadeTier': 'PFI' },
    { '@id': 'ds:cmp-dice-ppm', '@type': 'ds:ZoneComponent', 'ds:placementId': 'cmp-dice-ppm', 'ds:slotName': 'ppm-content', 'ds:placedInZone': { '@id': 'ds:zone-Z-DICE-302' }, 'ds:placesComponent': { '@id': 'ds:dc-ppm-dashboard' }, 'ds:renderOrder': 1, 'ds:cascadeTier': 'PFI' },
    // Context bar override with DICE brand colours
    { '@id': 'ds:cmp-pfi-context-bar', '@type': 'ds:ZoneComponent', 'ds:placementId': 'cmp-pfi-context-bar', 'ds:slotName': 'context-bar-content', 'ds:placedInZone': { '@id': 'ds:zone-Z3' }, 'ds:placesComponent': { '@id': 'ds:dc-context-bar' }, 'ds:renderOrder': 1, 'ds:cascadeTier': 'PFI', 'ds:tokenOverrides': { '--viz-accent': '#2563EB', '--viz-accent-active': '#1D4ED8' }, 'ds:visibilityCondition': "state.activeInstanceId === 'PFI-PC-DICE'" },
  ],
};

describe('F40.21 — DICE (FloodGraph AI) PFI Skeleton', () => {

  describe('parseAppSkeleton — DICE entity counts', () => {
    it('extracts correct entity counts from DICE skeleton', () => {
      const result = parseAppSkeleton(diceOverrideFixture);

      expect(result.application).toBeTruthy();
      expect(result.application['ds:appName']).toBe('FloodGraph AI — PFI-PC-DICE');
      expect(result.zones).toHaveLength(13);
      expect(result.navItems).toHaveLength(11);
      expect(result.zoneComponents).toHaveLength(14); // 13 new + 1 context-bar override
    });

    it('all DICE zones have PFI cascade tier', () => {
      const result = parseAppSkeleton(diceOverrideFixture);
      const allPFI = result.zones.every(z => z['ds:cascadeTier'] === 'PFI');
      expect(allPFI).toBe(true);
    });

    it('all DICE zones follow Z-DICE-{nnn} convention', () => {
      const result = parseAppSkeleton(diceOverrideFixture);
      const allConvention = result.zones.every(z =>
        z['ds:zoneId'].startsWith('Z-DICE-')
      );
      expect(allConvention).toBe(true);
    });

    it('all DICE nav items follow nav-dice-{name} convention', () => {
      const result = parseAppSkeleton(diceOverrideFixture);
      const allConvention = result.navItems.every(n =>
        n['ds:itemId'].startsWith('nav-dice-')
      );
      expect(allConvention).toBe(true);
    });

    it('all DICE nav items have non-empty action (BR-DS-014)', () => {
      const result = parseAppSkeleton(diceOverrideFixture);
      const allHaveAction = result.navItems.every(n =>
        n['ds:action'] && n['ds:action'].length > 0
      );
      expect(allHaveAction).toBe(true);
    });

    it('all DICE zones have zoneType and defaultVisible (BR-DS-015)', () => {
      const result = parseAppSkeleton(diceOverrideFixture);
      const allValid = result.zones.every(z =>
        z['ds:zoneType'] && z['ds:defaultVisible'] !== undefined
      );
      expect(allValid).toBe(true);
    });
  });

  describe('mergeSkeletonCascade — PFC + DICE', () => {
    it('merged skeleton has correct total zone count (5 PFC + 13 DICE = 18)', () => {
      const base = parseAppSkeleton(pfcSkeletonFixture);
      const override = parseAppSkeleton(diceOverrideFixture);
      const merged = mergeSkeletonCascade(base, override);

      expect(merged.zones).toHaveLength(18); // 5 from PFC fixture + 13 DICE
    });

    it('merged skeleton has correct total nav item count (2 PFC + 11 DICE = 13)', () => {
      const base = parseAppSkeleton(pfcSkeletonFixture);
      const override = parseAppSkeleton(diceOverrideFixture);
      const merged = mergeSkeletonCascade(base, override);

      expect(merged.navItems).toHaveLength(13); // 2 PFC + 11 DICE
    });

    it('PFC zones are preserved unchanged after DICE merge (BR-DS-013)', () => {
      const base = parseAppSkeleton(pfcSkeletonFixture);
      const override = parseAppSkeleton(diceOverrideFixture);
      const merged = mergeSkeletonCascade(base, override);

      const z1 = merged.zones.find(z => z['ds:zoneId'] === 'Z1');
      expect(z1['ds:zoneName']).toBe('Header');
      expect(z1['ds:cascadeTier']).toBe('PFC');

      const z6 = merged.zones.find(z => z['ds:zoneId'] === 'Z6');
      expect(z6['ds:zoneName']).toBe('Graph Canvas');
    });

    it('DICE application overrides PFC application', () => {
      const base = parseAppSkeleton(pfcSkeletonFixture);
      const override = parseAppSkeleton(diceOverrideFixture);
      const merged = mergeSkeletonCascade(base, override);

      expect(merged.application['ds:appName']).toBe('FloodGraph AI — PFI-PC-DICE');
      expect(merged.application['ds:cascadeTier']).toBe('PFI');
    });

    it('context-bar override applies DICE brand colours', () => {
      const base = parseAppSkeleton(pfcSkeletonFixture);
      const override = parseAppSkeleton(diceOverrideFixture);
      const merged = mergeSkeletonCascade(base, override);

      const ctxBar = merged.zoneComponents.find(c =>
        c['ds:placementId'] === 'cmp-pfi-context-bar'
      );
      expect(ctxBar).toBeTruthy();
      expect(ctxBar['ds:tokenOverrides']).toEqual({
        '--viz-accent': '#2563EB',
        '--viz-accent-active': '#1D4ED8',
      });
    });
  });

  describe('buildSkeletonRegistries — DICE merged', () => {
    beforeEach(() => {
      state.navLayerRegistry = new Map();
      state.zoneRegistry = new Map();
    });

    it('zone registry contains both PFC and DICE zones', () => {
      const base = parseAppSkeleton(pfcSkeletonFixture);
      const override = parseAppSkeleton(diceOverrideFixture);
      const merged = mergeSkeletonCascade(base, override);
      buildSkeletonRegistries(merged);

      expect(state.zoneRegistry.has('Z1')).toBe(true); // PFC
      expect(state.zoneRegistry.has('Z-DICE-101')).toBe(true); // DICE
      expect(state.zoneRegistry.has('Z-DICE-200')).toBe(true); // stakeholder
      expect(state.zoneRegistry.has('Z-DICE-300')).toBe(true); // compliance
    });

    it('DICE zones have components attached', () => {
      const base = parseAppSkeleton(pfcSkeletonFixture);
      const override = parseAppSkeleton(diceOverrideFixture);
      const merged = mergeSkeletonCascade(base, override);
      buildSkeletonRegistries(merged);

      const agentDash = state.zoneRegistry.get('Z-DICE-101');
      expect(agentDash.components).toHaveLength(1);
      expect(agentDash.components[0]['ds:placementId']).toBe('cmp-dice-agent-dashboard');
    });

    it('L4 layer populated with 11 DICE nav items after merge', () => {
      const base = parseAppSkeleton(pfcSkeletonFixture);
      const override = parseAppSkeleton(diceOverrideFixture);
      const merged = mergeSkeletonCascade(base, override);
      buildSkeletonRegistries(merged);

      const l4 = state.navLayerRegistry.get('L4');
      expect(l4.items).toHaveLength(11);
      expect(l4.items[0]['ds:label']).toBe('AI Agents');
      expect(l4.items[10]['ds:label']).toBe('Projects');
    });

    it('L4 items sorted by renderOrder', () => {
      const base = parseAppSkeleton(pfcSkeletonFixture);
      const override = parseAppSkeleton(diceOverrideFixture);
      const merged = mergeSkeletonCascade(base, override);
      buildSkeletonRegistries(merged);

      const l4 = state.navLayerRegistry.get('L4');
      for (let i = 1; i < l4.items.length; i++) {
        expect(l4.items[i]['ds:renderOrder']).toBeGreaterThanOrEqual(
          l4.items[i - 1]['ds:renderOrder']
        );
      }
    });
  });

  describe('getVisibleZones — DICE visibility conditions', () => {
    beforeEach(() => {
      state.navLayerRegistry = new Map();
      state.zoneRegistry = new Map();
      const base = parseAppSkeleton(pfcSkeletonFixture);
      const override = parseAppSkeleton(diceOverrideFixture);
      const merged = mergeSkeletonCascade(base, override);
      buildSkeletonRegistries(merged);
    });

    it('DICE zones hidden when different PFI instance is active', () => {
      const visible = getVisibleZones('graph', {
        isPFIMode: true,
        activeInstanceId: 'PFI-BAIV',
      });

      expect(visible.has('Z-DICE-101')).toBe(false);
      expect(visible.has('Z-DICE-200')).toBe(false);
    });

    it('DICE zones visible when DICE instance is active', () => {
      const visible = getVisibleZones('graph', {
        isPFIMode: true,
        activeInstanceId: 'PFI-PC-DICE',
      });

      expect(visible.has('Z-DICE-101')).toBe(true);
      expect(visible.has('Z-DICE-300')).toBe(true);
    });

    it('stakeholder view zones require both instance AND role match', () => {
      const visible = getVisibleZones('graph', {
        isPFIMode: true,
        activeInstanceId: 'PFI-PC-DICE',
        activeStakeholderRole: 'Developer',
      });

      expect(visible.has('Z-DICE-200')).toBe(true); // Developer View
      expect(visible.has('Z-DICE-201')).toBe(false); // Consultant View
    });

    it('PPM zone requires ppmActive === true', () => {
      const withPPM = getVisibleZones('graph', {
        isPFIMode: true,
        activeInstanceId: 'PFI-PC-DICE',
        ppmActive: true,
      });
      expect(withPPM.has('Z-DICE-302')).toBe(true);

      const withoutPPM = getVisibleZones('graph', {
        isPFIMode: true,
        activeInstanceId: 'PFI-PC-DICE',
        ppmActive: false,
      });
      expect(withoutPPM.has('Z-DICE-302')).toBe(false);
    });
  });

  describe('DICE zone ID convention compliance', () => {
    it('agent panel zones use 102-105 range', () => {
      const result = parseAppSkeleton(diceOverrideFixture);
      const agentPanels = result.zones.filter(z =>
        z['ds:zoneName'].includes('Agent Panel')
      );
      expect(agentPanels).toHaveLength(4);

      const ids = agentPanels.map(z => z['ds:zoneId']).sort();
      expect(ids).toEqual(['Z-DICE-102', 'Z-DICE-103', 'Z-DICE-104', 'Z-DICE-105']);
    });

    it('stakeholder view zones use 200-203 range', () => {
      const result = parseAppSkeleton(diceOverrideFixture);
      const stakeholderViews = result.zones.filter(z =>
        z['ds:zoneName'].includes('View')
      );
      expect(stakeholderViews).toHaveLength(4);

      const ids = stakeholderViews.map(z => z['ds:zoneId']).sort();
      expect(ids).toEqual(['Z-DICE-200', 'Z-DICE-201', 'Z-DICE-202', 'Z-DICE-203']);
    });

    it('conditional dashboard zones use 300-302 range', () => {
      const result = parseAppSkeleton(diceOverrideFixture);
      const dashboards = result.zones.filter(z =>
        parseInt(z['ds:zoneId'].split('-').pop()) >= 300
      );
      expect(dashboards).toHaveLength(3);

      const ids = dashboards.map(z => z['ds:zoneId']).sort();
      expect(ids).toEqual(['Z-DICE-300', 'Z-DICE-301', 'Z-DICE-302']);
    });

    it('no zone IDs collide with PFC range (Z1-Z99)', () => {
      const result = parseAppSkeleton(diceOverrideFixture);
      const pfcCollisions = result.zones.filter(z =>
        /^Z\d+$/.test(z['ds:zoneId'])
      );
      expect(pfcCollisions).toHaveLength(0);
    });
  });
});

// --- DS-ONT v3.0.0: Action entities + actionIndex + zoneDomSelectors ---

const ontologyNavFixture = {
  '@context': { 'ds': 'https://platformcore.io/ontology/ds/' },
  '@graph': [
    {
      '@id': 'ds:zone-Z2',
      '@type': 'ds:AppZone',
      'ds:zoneId': 'Z2',
      'ds:zoneName': 'Toolbar',
      'ds:zoneType': 'Fixed',
      'ds:defaultVisible': true,
      'ds:cascadeTier': 'PFC',
      'ds:domSelector': '#dynamic-nav-bar',
    },
    {
      '@id': 'ds:zone-Z6',
      '@type': 'ds:AppZone',
      'ds:zoneId': 'Z6',
      'ds:zoneName': 'Graph Canvas',
      'ds:zoneType': 'Fixed',
      'ds:defaultVisible': true,
      'ds:cascadeTier': 'PFC',
      'ds:domSelector': '#network',
    },
    {
      '@id': 'ds:navlayer-L1',
      '@type': 'ds:NavLayer',
      'ds:layerId': 'L1',
      'ds:layerName': 'Main Capabilities',
      'ds:layerLevel': 1,
      'ds:renderOrder': 1,
      'ds:cascadeTier': 'PFC',
    },
    // Action entities (DS-ONT v3.0.0)
    {
      '@id': 'ds:action-toggleAuditPanel',
      '@type': 'ds:Action',
      'ds:functionRef': 'toggleAudit',
      'ds:parameterType': 'None',
      'ds:triggersSyncAfter': false,
      'ds:accessibilityHint': 'Toggle OAA audit panel',
    },
    {
      '@id': 'ds:action-forkOntology',
      '@type': 'ds:Action',
      'ds:functionRef': 'showForkModal',
      'ds:parameterType': 'None',
      'ds:guardCondition': 'state.currentData != null',
      'ds:guardMessage': 'Load an ontology first',
      'ds:triggersSyncAfter': false,
    },
    {
      '@id': 'ds:action-togglePhysics',
      '@type': 'ds:Action',
      'ds:functionRef': 'togglePhysics',
      'ds:parameterType': 'None',
      'ds:triggersSyncAfter': true,
    },
    {
      '@id': 'ds:action-noop',
      '@type': 'ds:Action',
      'ds:functionRef': 'noop',
      'ds:parameterType': 'None',
      'ds:triggersSyncAfter': false,
    },
    // NavItems with executesAction references
    {
      '@id': 'ds:nav-L1-audit',
      '@type': 'ds:NavItem',
      'ds:itemId': 'nav-audit',
      'ds:label': 'OAA Audit',
      'ds:itemType': 'Button',
      'ds:action': 'toggleAuditPanel',
      'ds:executesAction': { '@id': 'ds:action-toggleAuditPanel' },
      'ds:renderOrder': 1,
      'ds:cascadeTier': 'PFC',
      'ds:belongsToLayer': { '@id': 'ds:navlayer-L1' },
    },
    {
      '@id': 'ds:nav-L1-fork',
      '@type': 'ds:NavItem',
      'ds:itemId': 'nav-fork',
      'ds:label': 'Fork Ontology',
      'ds:itemType': 'Button',
      'ds:action': 'forkOntology',
      'ds:executesAction': { '@id': 'ds:action-forkOntology' },
      'ds:renderOrder': 2,
      'ds:cascadeTier': 'PFC',
      'ds:belongsToLayer': { '@id': 'ds:navlayer-L1' },
    },
  ],
};

describe('parseAppSkeleton — Action entities (DS-ONT v3.0.0)', () => {
  it('extracts Action entities from @graph', () => {
    const result = parseAppSkeleton(ontologyNavFixture);
    expect(result.actions).toHaveLength(4);
  });

  it('returns empty actions from legacy fixture', () => {
    const result = parseAppSkeleton(pfcSkeletonFixture);
    expect(result.actions).toHaveLength(0);
  });
});

describe('buildSkeletonRegistries — actionIndex + zoneDomSelectors (DS-ONT v3.0.0)', () => {
  beforeEach(() => {
    state.navLayerRegistry = new Map();
    state.zoneRegistry = new Map();
    state.actionIndex = null;
    state.zoneDomSelectors = null;
  });

  it('builds actionIndex Map from Action entities', () => {
    const skeleton = parseAppSkeleton(ontologyNavFixture);
    buildSkeletonRegistries(skeleton);

    expect(state.actionIndex.size).toBe(4);
    const toggleAudit = state.actionIndex.get('ds:action-toggleAuditPanel');
    expect(toggleAudit).toBeTruthy();
    expect(toggleAudit['ds:functionRef']).toBe('toggleAudit');
    expect(toggleAudit['ds:accessibilityHint']).toBe('Toggle OAA audit panel');
  });

  it('builds zoneDomSelectors Map from zone domSelector properties', () => {
    const skeleton = parseAppSkeleton(ontologyNavFixture);
    buildSkeletonRegistries(skeleton);

    expect(state.zoneDomSelectors.size).toBe(2);
    expect(state.zoneDomSelectors.get('Z2')).toBe('#dynamic-nav-bar');
    expect(state.zoneDomSelectors.get('Z6')).toBe('#network');
  });

  it('actionIndex is empty for legacy fixture without actions', () => {
    const skeleton = parseAppSkeleton(pfcSkeletonFixture);
    buildSkeletonRegistries(skeleton);

    expect(state.actionIndex.size).toBe(0);
  });
});

describe('wireAction — ontology mode (DS-ONT v3.0.0)', () => {
  let actionIndex;

  beforeEach(() => {
    actionIndex = new Map([
      ['ds:action-toggleAuditPanel', {
        '@id': 'ds:action-toggleAuditPanel',
        '@type': 'ds:Action',
        'ds:functionRef': 'toggleAudit',
        'ds:parameterType': 'None',
        'ds:triggersSyncAfter': false,
        'ds:accessibilityHint': 'Toggle OAA audit panel',
      }],
      ['ds:action-forkOntology', {
        '@id': 'ds:action-forkOntology',
        '@type': 'ds:Action',
        'ds:functionRef': 'showForkModal',
        'ds:parameterType': 'None',
        'ds:guardCondition': 'state.currentData != null',
        'ds:guardMessage': 'Load an ontology first',
        'ds:triggersSyncAfter': false,
      }],
      ['ds:action-togglePhysics', {
        '@id': 'ds:action-togglePhysics',
        '@type': 'ds:Action',
        'ds:functionRef': 'togglePhysics',
        'ds:parameterType': 'None',
        'ds:triggersSyncAfter': true,
      }],
    ]);
  });

  afterEach(() => {
    delete window.toggleAudit;
    delete window.showForkModal;
    delete window.togglePhysics;
  });

  it('resolves Action entity and calls window[functionRef]', () => {
    const btn = document.createElement('button');
    window.toggleAudit = vi.fn();

    const navItem = {
      'ds:itemId': 'nav-audit',
      'ds:executesAction': { '@id': 'ds:action-toggleAuditPanel' },
    };

    wireAction(btn, navItem, actionIndex);
    btn.click();

    expect(window.toggleAudit).toHaveBeenCalledTimes(1);
  });

  it('sets aria-label from accessibilityHint', () => {
    const btn = document.createElement('button');
    window.toggleAudit = vi.fn();

    const navItem = {
      'ds:itemId': 'nav-audit',
      'ds:executesAction': { '@id': 'ds:action-toggleAuditPanel' },
    };

    wireAction(btn, navItem, actionIndex);

    expect(btn.getAttribute('aria-label')).toBe('Toggle OAA audit panel');
  });

  it('checks guard condition and blocks with alert when false', () => {
    state.currentData = null;

    const btn = document.createElement('button');
    window.showForkModal = vi.fn();
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    const navItem = {
      'ds:itemId': 'nav-fork',
      'ds:executesAction': { '@id': 'ds:action-forkOntology' },
    };

    wireAction(btn, navItem, actionIndex);
    btn.click();

    expect(window.showForkModal).not.toHaveBeenCalled();
    expect(alertSpy).toHaveBeenCalledWith('Load an ontology first');

    alertSpy.mockRestore();
  });

  it('calls handler when guard passes', () => {
    state.currentData = { someData: true };

    const btn = document.createElement('button');
    window.showForkModal = vi.fn();

    const navItem = {
      'ds:itemId': 'nav-fork',
      'ds:executesAction': { '@id': 'ds:action-forkOntology' },
    };

    wireAction(btn, navItem, actionIndex);
    btn.click();

    expect(window.showForkModal).toHaveBeenCalledTimes(1);
  });

  it('falls back to legacy ds:action on window when no executesAction', () => {
    const btn = document.createElement('button');
    window.togglePhysics = vi.fn();

    const navItem = {
      'ds:itemId': 'nav-physics',
      'ds:action': 'togglePhysics',
    };

    wireAction(btn, navItem, actionIndex);
    btn.click();

    expect(window.togglePhysics).toHaveBeenCalledTimes(1);
  });
});
