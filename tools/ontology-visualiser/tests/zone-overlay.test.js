/**
 * Zone Boundary Overlay — Unit Tests
 *
 * Tests the zone overlay feature from Token Map (design-token-tree.js).
 * Uses mock DOM pattern (no jsdom dependency) consistent with emc-nav-bar.test.js.
 */
import { describe, it, expect, beforeEach } from 'vitest';

// ── Mock state (zoneDomSelectors from ontology, replaces manual ZONE_DOM_SELECTORS) ──
const state = {
  activeZoneOverlays: new Set(),
  zoneDomSelectors: new Map([
    ['Z1',  'header'],
    ['Z2',  '.toolbar'],
    ['Z6',  '#network'],
    ['Z9',  '#sidebar'],
    ['Z4',  '#authoring-toolbar'],
    ['Z20', '#drop-zone'],
  ]),
};

// ── Mock FALLBACK_ZONE_TREE ──
const FALLBACK_ZONE_TREE = [
  { id: 'Z1', label: 'Z1 — Header' },
  { id: 'Z2', label: 'Z2 — Toolbar' },
  { id: 'Z4', label: 'Z4 — Authoring Toolbar' },
  { id: 'Z6', label: 'Z6 — Graph Canvas' },
  { id: 'Z9', label: 'Z9 — Sidebar Details' },
  { id: 'Z20', label: 'Z20 — Drop Zone' },
];

function esc(str) {
  return String(str).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]
  );
}

// ── Mock DOM ──
const mockElements = {};
const mockOverlays = {};

function createMockElement(id, overrides = {}) {
  return {
    id: id || '',
    style: {},
    className: '',
    dataset: {},
    innerHTML: '',
    textContent: '',
    tagName: overrides.tagName || 'DIV',
    offsetParent: overrides.offsetParent !== undefined ? overrides.offsetParent : {},
    _display: overrides.display || '',
    _children: [],
    classList: {
      _classes: new Set(overrides.classes || []),
      add(c) { this._classes.add(c); },
      remove(c) { this._classes.delete(c); },
      contains(c) { return this._classes.has(c); },
      toggle(c, force) {
        if (force !== undefined) { force ? this._classes.add(c) : this._classes.delete(c); }
        else { this._classes.has(c) ? this._classes.delete(c) : this._classes.add(c); }
      },
    },
    closest(sel) { return null; },
    remove() { delete mockOverlays[this.dataset?.zoneId]; },
    appendChild(child) { this._children.push(child); },
    querySelectorAll(sel) {
      if (sel === '.zone-boundary-overlay') return Object.values(mockOverlays);
      return [];
    },
    querySelector(sel) {
      const m = sel.match(/data-zone-id="([^"]+)"/);
      if (m) return mockOverlays[m[1]] || null;
      return null;
    },
    getBoundingClientRect() {
      return overrides.rect || { top: 0, left: 0, width: 100, height: 50 };
    },
  };
}

// Mock document/global functions used by the extracted functions
const mockDocument = {
  querySelector(sel) {
    // Zone DOM selectors
    if (sel === 'header') return mockElements['header'] || null;
    if (sel === '.toolbar') return mockElements['toolbar'] || null;
    if (sel === '#network') return mockElements['network'] || null;
    if (sel === '#sidebar') return mockElements['sidebar'] || null;
    if (sel === '#authoring-toolbar') return mockElements['authoring-toolbar'] || null;
    if (sel === '#drop-zone') return mockElements['drop-zone'] || null;
    // Overlay lookups
    const m = sel.match(/data-zone-id="([^"]+)"/);
    if (m) return mockOverlays[m[1]] || null;
    return null;
  },
  querySelectorAll(sel) {
    if (sel === '.zone-boundary-overlay') return Object.values(mockOverlays);
    return [];
  },
  getElementById(id) {
    return mockElements[id] || null;
  },
  createElement(tag) {
    const el = createMockElement('', { tagName: tag.toUpperCase() });
    return el;
  },
  body: {
    appendChild(child) { if (child.dataset?.zoneId) mockOverlays[child.dataset.zoneId] = child; },
  },
};

function mockGetComputedStyle(el) {
  return { display: el._display || '' };
}

// ── Extracted functions (using mock document/getComputedStyle) ──

function getZoneDOMElement(zoneId) {
  const selector = state.zoneDomSelectors?.get(zoneId);
  if (!selector) return null;
  return mockDocument.querySelector(selector);
}

function createZoneOverlay(zoneId) {
  const el = getZoneDOMElement(zoneId);
  const zoneLabel = FALLBACK_ZONE_TREE.find(z => z.id === zoneId)?.label || zoneId;

  const overlay = mockDocument.createElement('div');
  overlay.className = 'zone-boundary-overlay';
  overlay.dataset = { zoneId };

  const isHidden = !el || el.offsetParent === null || mockGetComputedStyle(el).display === 'none';

  if (isHidden) {
    overlay.classList.add('zone-boundary-overlay--hidden');
    overlay.innerHTML = `<span class="zone-boundary-label">${esc(zoneId)}: ${esc(zoneLabel)}</span><span class="zone-boundary-hidden-note">Hidden</span>`;
    overlay.style.position = 'fixed';
    overlay.style.top = '50%';
    overlay.style.left = '50%';
    overlay._isHidden = true;
  } else {
    const rect = el.getBoundingClientRect();
    overlay.style.position = 'fixed';
    overlay.style.top = rect.top + 'px';
    overlay.style.left = rect.left + 'px';
    overlay.style.width = rect.width + 'px';
    overlay.style.height = rect.height + 'px';
    overlay.innerHTML = `<span class="zone-boundary-label">${esc(zoneId)}: ${esc(zoneLabel)}</span>`;
  }

  mockDocument.body.appendChild(overlay);
  state.activeZoneOverlays.add(zoneId);
}

function removeZoneOverlay(zoneId) {
  const overlay = mockDocument.querySelector(`.zone-boundary-overlay[data-zone-id="${zoneId}"]`);
  if (overlay) overlay.remove();
  state.activeZoneOverlays.delete(zoneId);
}

function clearAllZoneOverlays() {
  mockDocument.querySelectorAll('.zone-boundary-overlay').forEach(el => el.remove());
  const prevIds = [...state.activeZoneOverlays];
  state.activeZoneOverlays.clear();
  prevIds.forEach(id => _updateZoneNodeActiveState(id));
}

function toggleZoneOverlay(zoneId) {
  if (state.activeZoneOverlays.has(zoneId)) {
    removeZoneOverlay(zoneId);
  } else {
    createZoneOverlay(zoneId);
  }
  _updateZoneNodeActiveState(zoneId);
}

function repositionAllZoneOverlays() {
  for (const zoneId of state.activeZoneOverlays) {
    const overlay = mockOverlays[zoneId];
    if (!overlay || overlay._isHidden) continue;

    const el = getZoneDOMElement(zoneId);
    if (!el) continue;

    const rect = el.getBoundingClientRect();
    overlay.style.top = rect.top + 'px';
    overlay.style.left = rect.left + 'px';
    overlay.style.width = rect.width + 'px';
    overlay.style.height = rect.height + 'px';
  }
}

function _updateZoneNodeActiveState(zoneId) {
  const nodeEl = mockDocument.getElementById(`admin-node-${zoneId}`);
  if (!nodeEl) return;
  if (state.activeZoneOverlays.has(zoneId)) {
    nodeEl.classList.add('zone-overlay-active');
  } else {
    nodeEl.classList.remove('zone-overlay-active');
  }
}

// ── Setup ──

function setupMockDOM() {
  // Clear
  Object.keys(mockElements).forEach(k => delete mockElements[k]);
  Object.keys(mockOverlays).forEach(k => delete mockOverlays[k]);
  state.activeZoneOverlays.clear();

  // Visible zones
  mockElements['header'] = createMockElement('header', {
    tagName: 'HEADER', rect: { top: 0, left: 0, width: 1200, height: 40 },
  });
  mockElements['toolbar'] = createMockElement('toolbar', {
    rect: { top: 40, left: 0, width: 1200, height: 38 },
  });
  mockElements['network'] = createMockElement('network', {
    rect: { top: 78, left: 0, width: 1200, height: 600 },
  });
  mockElements['drop-zone'] = createMockElement('drop-zone', {
    rect: { top: 78, left: 0, width: 1200, height: 600 },
  });

  // Hidden zones (display:none → offsetParent null)
  mockElements['sidebar'] = createMockElement('sidebar', { offsetParent: null, display: 'none' });
  mockElements['authoring-toolbar'] = createMockElement('authoring-toolbar', { offsetParent: null, display: 'none' });

  // Admin tree nodes
  mockElements['admin-node-Z1'] = createMockElement('admin-node-Z1');
  mockElements['admin-node-Z6'] = createMockElement('admin-node-Z6');
  mockElements['admin-node-Z4'] = createMockElement('admin-node-Z4');
}

// ── Tests ──

describe('Zone Boundary Overlay', () => {
  beforeEach(setupMockDOM);

  describe('getZoneDOMElement', () => {
    it('should return element for known zone Z1', () => {
      const el = getZoneDOMElement('Z1');
      expect(el).toBeTruthy();
      expect(el.tagName).toBe('HEADER');
    });

    it('should return element by class selector Z2', () => {
      const el = getZoneDOMElement('Z2');
      expect(el).toBeTruthy();
      expect(el.id).toBe('toolbar');
    });

    it('should return element by id selector Z6', () => {
      const el = getZoneDOMElement('Z6');
      expect(el).toBeTruthy();
      expect(el.id).toBe('network');
    });

    it('should return null for unknown zone', () => {
      expect(getZoneDOMElement('Z99')).toBeNull();
    });
  });

  describe('createZoneOverlay', () => {
    it('should create overlay with correct data-zone-id', () => {
      createZoneOverlay('Z1');
      expect(mockOverlays['Z1']).toBeTruthy();
      expect(mockOverlays['Z1'].dataset.zoneId).toBe('Z1');
    });

    it('should add zone to activeZoneOverlays set', () => {
      createZoneOverlay('Z6');
      expect(state.activeZoneOverlays.has('Z6')).toBe(true);
    });

    it('should set fixed position', () => {
      createZoneOverlay('Z1');
      expect(mockOverlays['Z1'].style.position).toBe('fixed');
    });

    it('should set dimensions from getBoundingClientRect', () => {
      createZoneOverlay('Z1');
      expect(mockOverlays['Z1'].style.top).toBe('0px');
      expect(mockOverlays['Z1'].style.left).toBe('0px');
      expect(mockOverlays['Z1'].style.width).toBe('1200px');
      expect(mockOverlays['Z1'].style.height).toBe('40px');
    });

    it('should include zone label text', () => {
      createZoneOverlay('Z1');
      expect(mockOverlays['Z1'].innerHTML).toContain('Z1');
      expect(mockOverlays['Z1'].innerHTML).toContain('Header');
    });

    it('should create hidden variant for display:none elements', () => {
      createZoneOverlay('Z4');
      expect(mockOverlays['Z4']._isHidden).toBe(true);
      expect(mockOverlays['Z4'].classList.contains('zone-boundary-overlay--hidden')).toBe(true);
    });

    it('should include Hidden note for hidden zones', () => {
      createZoneOverlay('Z4');
      expect(mockOverlays['Z4'].innerHTML).toContain('Hidden');
    });

    it('should centre hidden overlay at 50%', () => {
      createZoneOverlay('Z4');
      expect(mockOverlays['Z4'].style.top).toBe('50%');
      expect(mockOverlays['Z4'].style.left).toBe('50%');
    });
  });

  describe('removeZoneOverlay', () => {
    it('should remove overlay', () => {
      createZoneOverlay('Z1');
      expect(mockOverlays['Z1']).toBeTruthy();
      removeZoneOverlay('Z1');
      expect(mockOverlays['Z1']).toBeUndefined();
    });

    it('should remove zone from set', () => {
      createZoneOverlay('Z6');
      removeZoneOverlay('Z6');
      expect(state.activeZoneOverlays.has('Z6')).toBe(false);
    });

    it('should not throw for non-existent overlay', () => {
      expect(() => removeZoneOverlay('Z99')).not.toThrow();
    });
  });

  describe('toggleZoneOverlay', () => {
    it('should create overlay on first call', () => {
      toggleZoneOverlay('Z1');
      expect(mockOverlays['Z1']).toBeTruthy();
      expect(state.activeZoneOverlays.has('Z1')).toBe(true);
    });

    it('should remove overlay on second call', () => {
      toggleZoneOverlay('Z1');
      toggleZoneOverlay('Z1');
      expect(mockOverlays['Z1']).toBeUndefined();
      expect(state.activeZoneOverlays.has('Z1')).toBe(false);
    });

    it('should allow multiple zones simultaneously', () => {
      toggleZoneOverlay('Z1');
      toggleZoneOverlay('Z6');
      expect(state.activeZoneOverlays.size).toBe(2);
    });

    it('should add zone-overlay-active class to admin tree row', () => {
      toggleZoneOverlay('Z1');
      expect(mockElements['admin-node-Z1'].classList.contains('zone-overlay-active')).toBe(true);
    });

    it('should remove zone-overlay-active on second toggle', () => {
      toggleZoneOverlay('Z1');
      toggleZoneOverlay('Z1');
      expect(mockElements['admin-node-Z1'].classList.contains('zone-overlay-active')).toBe(false);
    });
  });

  describe('clearAllZoneOverlays', () => {
    it('should remove all overlays', () => {
      createZoneOverlay('Z1');
      createZoneOverlay('Z6');
      clearAllZoneOverlays();
      expect(Object.keys(mockOverlays).length).toBe(0);
    });

    it('should clear the set', () => {
      createZoneOverlay('Z1');
      createZoneOverlay('Z6');
      clearAllZoneOverlays();
      expect(state.activeZoneOverlays.size).toBe(0);
    });

    it('should remove active class from admin tree rows', () => {
      toggleZoneOverlay('Z1');
      toggleZoneOverlay('Z6');
      clearAllZoneOverlays();
      expect(mockElements['admin-node-Z1'].classList.contains('zone-overlay-active')).toBe(false);
      expect(mockElements['admin-node-Z6'].classList.contains('zone-overlay-active')).toBe(false);
    });

    it('should not throw when no overlays active', () => {
      expect(() => clearAllZoneOverlays()).not.toThrow();
    });
  });

  describe('repositionAllZoneOverlays', () => {
    it('should not throw when no overlays active', () => {
      expect(() => repositionAllZoneOverlays()).not.toThrow();
    });

    it('should update position from getBoundingClientRect', () => {
      createZoneOverlay('Z2');
      // Simulate element moving
      mockElements['toolbar'].getBoundingClientRect = () => ({ top: 100, left: 50, width: 900, height: 38 });
      repositionAllZoneOverlays();
      expect(mockOverlays['Z2'].style.top).toBe('100px');
      expect(mockOverlays['Z2'].style.left).toBe('50px');
      expect(mockOverlays['Z2'].style.width).toBe('900px');
    });

    it('should skip hidden overlays', () => {
      createZoneOverlay('Z4');
      const origTop = mockOverlays['Z4'].style.top;
      repositionAllZoneOverlays();
      expect(mockOverlays['Z4'].style.top).toBe(origTop);
    });
  });

  describe('_updateZoneNodeActiveState', () => {
    it('should add active class when zone is in set', () => {
      state.activeZoneOverlays.add('Z1');
      _updateZoneNodeActiveState('Z1');
      expect(mockElements['admin-node-Z1'].classList.contains('zone-overlay-active')).toBe(true);
    });

    it('should remove active class when zone not in set', () => {
      mockElements['admin-node-Z1'].classList.add('zone-overlay-active');
      _updateZoneNodeActiveState('Z1');
      expect(mockElements['admin-node-Z1'].classList.contains('zone-overlay-active')).toBe(false);
    });

    it('should not throw for non-existent admin node', () => {
      expect(() => _updateZoneNodeActiveState('Z99')).not.toThrow();
    });
  });
});
