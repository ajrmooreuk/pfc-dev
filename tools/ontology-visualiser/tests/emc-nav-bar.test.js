/**
 * EMC Cascade Navigation Bar — unit tests (F19.4+)
 *
 * Tests the EMC nav bar helper logic: level state management, dropdown rendering,
 * product selection, and cascade reset behavior.
 *
 * Since app.js has extensive top-level DOM wiring that makes direct import
 * impractical in tests, we test the EMC nav functions via mock DOM + state
 * verification patterns (consistent with context-switch-ui.test.js).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Mock state ──────────────────────────────────────────────────────────────

const mockState = {
  registryIndex: null,
  pfiInstances: new Map(),
  activeInstanceId: null,
  contextLevel: 'PFC',
  activePFI: null,
  brandContext: null,
  activeCategories: [],
  multiCategoryResult: null,
  activeMaturityLevel: 5,
  complianceScopeActive: false,
  activeProductCode: null,
  emcNavLevel: 0,
};

// ─── Mock DOM ────────────────────────────────────────────────────────────────

const mockElements = {};

function createMockElement(id, overrides = {}) {
  const el = {
    style: {},
    innerHTML: '',
    textContent: '',
    disabled: false,
    className: '',
    classList: {
      _classes: new Set(),
      add(c) { this._classes.add(c); },
      remove(c) { this._classes.delete(c); },
      contains(c) { return this._classes.has(c); },
      toggle(c, force) {
        if (force === undefined) {
          if (this._classes.has(c)) { this._classes.delete(c); return false; }
          this._classes.add(c); return true;
        }
        if (force) { this._classes.add(c); } else { this._classes.delete(c); }
        return force;
      },
    },
    ...overrides,
  };
  mockElements[id] = el;
  return el;
}

function resetMockElements() {
  Object.keys(mockElements).forEach(k => delete mockElements[k]);
}

function getElementById(id) {
  return mockElements[id] || null;
}

// ─── Mock PFI instances ──────────────────────────────────────────────────────

const MOCK_INSTANCES = [
  {
    '@id': 'PFI-BAIV',
    name: 'BAIV Instance',
    products: ['AIV'],
    brands: ['BAIV'],
    requirementScopes: ['PRODUCT', 'COMPETITIVE', 'STRATEGIC'],
    maturityLevel: 1,
    verticalMarket: 'MarTech',
  },
  {
    '@id': 'PFI-AIRL-CAF-AZA',
    name: 'AIRL CAF Audit & Advisory',
    products: ['CAF-Audit', 'Cyber-Insurance-Advisory'],
    brands: ['AIRL'],
    requirementScopes: ['COMPLIANCE', 'SECURITY', 'PRODUCT'],
    maturityLevel: 0,
    verticalMarket: 'GRC',
  },
  {
    '@id': 'PFI-VHF',
    name: 'VHF Nutrition App Instance',
    products: ['VHF-Nutrition'],
    brands: ['VHF'],
    requirementScopes: ['PRODUCT'],
    maturityLevel: 0,
    verticalMarket: 'HealthTech',
  },
  {
    '@id': 'PFI-W4M-WWG',
    name: 'W4M WWG (World Wide Gourmet)',
    products: ['WWG'],
    brands: ['W4M'],
    requirementScopes: ['PRODUCT', 'FULFILMENT', 'COMPETITIVE'],
    maturityLevel: 2,
    verticalMarket: 'Food Import / International Trade',
  },
];

function listPFIInstances(regIndex) {
  if (!regIndex?.pfiInstances) return [];
  return regIndex.pfiInstances.map(inst => ({
    id: inst['@id'],
    name: inst.name,
    products: inst.products || [],
    brands: inst.brands || [],
    requirementScopes: inst.requirementScopes || [],
    maturityLevel: inst.maturityLevel ?? 5,
    verticalMarket: inst.verticalMarket || null,
  }));
}

function setupRegistryWithInstances() {
  mockState.registryIndex = { pfiInstances: MOCK_INSTANCES };
  for (const inst of MOCK_INSTANCES) {
    mockState.pfiInstances.set(inst['@id'], inst);
  }
}

// ─── Extracted EMC Nav functions (from app.js) ──────────────────────────────
// These replicate the logic from app.js for isolated unit testing.

function _closeAllEMCDropdowns() {
  ['emc-nav-pfi-dropdown', 'emc-nav-product-dropdown'].forEach(id => {
    const el = getElementById(id);
    if (el) el.style.display = 'none';
  });
}

function _setEMCNavLevelState(level, levelState) {
  const ids = ['emc-nav-pfc', 'emc-nav-pfi', 'emc-nav-product', 'emc-nav-app'];
  const el = getElementById(ids[level]);
  if (!el) return;
  el.className = 'emc-nav-level';
  if (levelState === 'active') el.className += ' emc-nav-level--active';
  else if (levelState === 'disabled') el.className += ' emc-nav-level--disabled';
  else if (levelState === 'placeholder') el.className += ' emc-nav-level--placeholder';
}

function _resetEMCLevelsAbove(level) {
  const pfiLabel = getElementById('emc-nav-pfi-label');
  const productLabel = getElementById('emc-nav-product-label');

  if (level < 1) {
    const instances = listPFIInstances(mockState.registryIndex);
    _setEMCNavLevelState(1, instances.length > 0 ? 'active' : 'disabled');
    const btn = getElementById('emc-nav-pfi-btn');
    if (btn) btn.disabled = instances.length === 0;
    if (pfiLabel) pfiLabel.textContent = 'Instance';
    const sep1 = getElementById('emc-nav-sep-1');
    if (sep1) sep1.style.display = 'none';
  }
  if (level < 2) {
    _setEMCNavLevelState(2, 'disabled');
    const btn = getElementById('emc-nav-product-btn');
    if (btn) btn.disabled = true;
    if (productLabel) productLabel.textContent = 'Product';
    const sep2 = getElementById('emc-nav-sep-2');
    if (sep2) sep2.style.display = 'none';
  }
  _setEMCNavLevelState(3, 'placeholder');
  const sep3 = getElementById('emc-nav-sep-3');
  if (sep3) sep3.style.display = 'none';
}

function _updateEMCNavPFILabel(instanceId) {
  const label = getElementById('emc-nav-pfi-label');
  if (!label) return;
  const config = mockState.pfiInstances.get(instanceId);
  label.textContent = config?.name || instanceId || 'Instance';
}

function _updateEMCNavProductLabel(productCode) {
  const label = getElementById('emc-nav-product-label');
  if (label) label.textContent = productCode || 'Product';
}

function _updateEMCNavSummary() {
  const brandEl = getElementById('emc-nav-brand');
  const tierEl = getElementById('emc-nav-tier');
  const accentEl = getElementById('emc-nav-accent');

  if (mockState.activePFI) {
    const config = mockState.pfiInstances.get(mockState.activePFI);
    if (brandEl) brandEl.textContent = mockState.brandContext?.brand ? `DS: ${mockState.brandContext.brand}` : '';
    if (tierEl) {
      let tierText = config?.verticalMarket ? `${config.verticalMarket} | PF-Instance` : 'PF-Instance';
      if (mockState.activeProductCode) tierText = `${mockState.activeProductCode} | ${tierText}`;
      tierEl.textContent = tierText;
    }
  } else {
    if (brandEl) brandEl.textContent = '';
    if (tierEl) tierEl.textContent = 'Core Templates';
  }

  if (accentEl) {
    accentEl.style.background = mockState.brandContext?.accentColor || 'var(--viz-accent)';
  }
}

function _syncEMCNavHighlights() {
  const levelBtnIds = ['emc-nav-pfc-btn', 'emc-nav-pfi-btn', 'emc-nav-product-btn'];
  levelBtnIds.forEach((id, idx) => {
    const btn = getElementById(id);
    if (btn) btn.classList.toggle('emc-nav-btn--active', idx === mockState.emcNavLevel);
  });
}

function escapeHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function _renderEMCPFIItems() {
  const list = getElementById('emc-nav-pfi-list');
  if (!list) return;

  const instances = listPFIInstances(mockState.registryIndex);
  let html = '';

  const isCore = !mockState.activeInstanceId;
  html += `<div class="emc-nav-item${isCore ? ' active' : ''}" onclick="selectEMCInstance('')">
    <div class="emc-nav-item-name">PF-Core</div>
    <div class="emc-nav-item-meta">Default templates &mdash; all ontologies</div>
  </div>`;

  for (const inst of instances) {
    const isActive = mockState.activeInstanceId === inst.id;
    const scopePills = (inst.requirementScopes || []).map(s =>
      `<span class="instance-picker-scope-pill">${escapeHtml(s)}</span>`
    ).join('');
    const meta = [inst.brands?.[0], inst.verticalMarket, `maturity ${inst.maturityLevel ?? '?'}`]
      .filter(Boolean).join(' \u00B7 ');
    html += `<div class="emc-nav-item${isActive ? ' active' : ''}" onclick="selectEMCInstance('${escapeHtml(inst.id)}')">
      <div class="emc-nav-item-name">${escapeHtml(inst.name || inst.id)}</div>
      <div class="emc-nav-item-meta">${escapeHtml(meta)}</div>
      <div class="emc-nav-item-scopes">${scopePills}</div>
    </div>`;
  }

  list.innerHTML = html;
}

function _renderEMCProductItems() {
  const list = getElementById('emc-nav-product-list');
  if (!list) return;

  const config = mockState.pfiInstances.get(mockState.activeInstanceId);
  const products = config?.products || [];

  if (products.length === 0) {
    list.innerHTML = '<div class="emc-nav-item"><div class="emc-nav-item-meta">No products defined.</div></div>';
    return;
  }

  let html = '';
  for (const productCode of products) {
    const isActive = mockState.activeProductCode === productCode;
    html += `<div class="emc-nav-item${isActive ? ' active' : ''}" onclick="selectEMCProduct('${escapeHtml(productCode)}')">
      <div class="emc-nav-item-name">${escapeHtml(productCode)}</div>
      <div class="emc-nav-item-meta">${escapeHtml(config?.name || mockState.activeInstanceId || '')} product</div>
    </div>`;
  }

  list.innerHTML = html;
}

function initEMCNavBar() {
  const bar = getElementById('emc-nav-bar');
  if (!bar) return;

  bar.style.display = 'flex';
  _setEMCNavLevelState(0, 'active');

  const instances = listPFIInstances(mockState.registryIndex);
  if (instances.length > 0) {
    _setEMCNavLevelState(1, 'active');
    const btn = getElementById('emc-nav-pfi-btn');
    if (btn) btn.disabled = false;
  }

  _updateEMCNavSummary();
}

function toggleEMCDropdown(level) {
  const dropdownIds = { 1: 'emc-nav-pfi-dropdown', 2: 'emc-nav-product-dropdown' };
  const dropdownId = dropdownIds[level];
  if (!dropdownId) return;

  const dropdown = getElementById(dropdownId);
  if (!dropdown) return;

  const wasOpen = dropdown.style.display !== 'none';
  _closeAllEMCDropdowns();

  if (!wasOpen) {
    dropdown.style.display = 'block';
    if (level === 1) _renderEMCPFIItems();
    if (level === 2) _renderEMCProductItems();
  }
}

function selectEMCInstance(instanceId) {
  _closeAllEMCDropdowns();

  if (!instanceId) {
    // Reset to PFC
    mockState.activeProductCode = null;
    mockState.emcNavLevel = 0;
    mockState.contextLevel = 'PFC';
    mockState.activeInstanceId = null;
    mockState.activePFI = null;
    _resetEMCLevelsAbove(0);
    _syncEMCNavHighlights();
    _updateEMCNavSummary();
    return;
  }

  mockState.contextLevel = 'PFI';
  mockState.activeInstanceId = instanceId;
  mockState.activePFI = instanceId;
  mockState.emcNavLevel = 1;
  _updateEMCNavPFILabel(instanceId);

  const sep1 = getElementById('emc-nav-sep-1');
  if (sep1) sep1.style.display = 'inline';

  const config = mockState.pfiInstances.get(instanceId);
  const products = config?.products || [];
  if (products.length > 0) {
    _setEMCNavLevelState(2, 'active');
    const btn = getElementById('emc-nav-product-btn');
    if (btn) btn.disabled = false;

    mockState.activeProductCode = products[0];
    mockState.emcNavLevel = 2;
    _updateEMCNavProductLabel(products[0]);

    const sep2 = getElementById('emc-nav-sep-2');
    if (sep2) sep2.style.display = 'inline';
    const sep3 = getElementById('emc-nav-sep-3');
    if (sep3) sep3.style.display = 'inline';
  } else {
    _setEMCNavLevelState(2, 'disabled');
  }

  _syncEMCNavHighlights();
  _updateEMCNavSummary();
}

function selectEMCProduct(productCode) {
  _closeAllEMCDropdowns();

  mockState.activeProductCode = productCode;
  mockState.emcNavLevel = 2;

  _updateEMCNavProductLabel(productCode);

  const sep2 = getElementById('emc-nav-sep-2');
  if (sep2) sep2.style.display = 'inline';
  const sep3 = getElementById('emc-nav-sep-3');
  if (sep3) sep3.style.display = 'inline';

  _syncEMCNavHighlights();
  _updateEMCNavSummary();
}

function setEMCLevel(level) {
  _closeAllEMCDropdowns();

  if (level === 0) {
    mockState.activeProductCode = null;
    mockState.emcNavLevel = 0;
    mockState.contextLevel = 'PFC';
    mockState.activeInstanceId = null;
    mockState.activePFI = null;
    _resetEMCLevelsAbove(0);
    _syncEMCNavHighlights();
    _updateEMCNavSummary();
    return;
  }

  if (level === 1 && mockState.activeInstanceId) {
    mockState.activeProductCode = null;
    mockState.emcNavLevel = 1;
    _resetEMCLevelsAbove(1);
    _syncEMCNavHighlights();
    _updateEMCNavSummary();
  }
}

// ─── DOM Setup ───────────────────────────────────────────────────────────────

function setupEMCNavDOM() {
  createMockElement('emc-nav-bar');
  createMockElement('emc-nav-accent');
  createMockElement('emc-nav-pfc', { className: 'emc-nav-level emc-nav-level--active' });
  createMockElement('emc-nav-pfc-btn');
  createMockElement('emc-nav-pfc-label', { textContent: 'PF-Core' });
  createMockElement('emc-nav-pfi', { className: 'emc-nav-level emc-nav-level--disabled' });
  createMockElement('emc-nav-pfi-btn', { disabled: true });
  createMockElement('emc-nav-pfi-label', { textContent: 'Instance' });
  createMockElement('emc-nav-pfi-dropdown', { style: { display: 'none' } });
  createMockElement('emc-nav-pfi-list');
  createMockElement('emc-nav-product', { className: 'emc-nav-level emc-nav-level--disabled' });
  createMockElement('emc-nav-product-btn', { disabled: true });
  createMockElement('emc-nav-product-label', { textContent: 'Product' });
  createMockElement('emc-nav-product-dropdown', { style: { display: 'none' } });
  createMockElement('emc-nav-product-list');
  createMockElement('emc-nav-app', { className: 'emc-nav-level emc-nav-level--placeholder' });
  createMockElement('emc-nav-sep-1', { style: { display: 'none' } });
  createMockElement('emc-nav-sep-2', { style: { display: 'none' } });
  createMockElement('emc-nav-sep-3', { style: { display: 'none' } });
  createMockElement('emc-nav-chips');
  createMockElement('emc-nav-brand');
  createMockElement('emc-nav-tier');
  createMockElement('emc-nav-summary');
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('EMC Cascade Navigation Bar', () => {
  beforeEach(() => {
    resetMockElements();
    mockState.registryIndex = null;
    mockState.pfiInstances.clear();
    mockState.activeInstanceId = null;
    mockState.activePFI = null;
    mockState.contextLevel = 'PFC';
    mockState.brandContext = null;
    mockState.activeCategories = [];
    mockState.multiCategoryResult = null;
    mockState.activeProductCode = null;
    mockState.emcNavLevel = 0;
    setupEMCNavDOM();
  });

  describe('initEMCNavBar', () => {
    it('should make nav bar visible on init (before registry load)', () => {
      initEMCNavBar();
      expect(mockElements['emc-nav-bar'].style.display).toBe('flex');
    });

    it('should set PFC level as active on init', () => {
      initEMCNavBar();
      expect(mockElements['emc-nav-pfc'].className).toContain('emc-nav-level--active');
    });

    it('should keep PFI level disabled before registry load', () => {
      initEMCNavBar();
      expect(mockElements['emc-nav-pfi-btn'].disabled).toBe(true);
    });

    it('should enable PFI level after registry with instances loads', () => {
      setupRegistryWithInstances();
      initEMCNavBar();
      expect(mockElements['emc-nav-pfi-btn'].disabled).toBe(false);
    });

    it('should set PFI level to active state after registry load', () => {
      setupRegistryWithInstances();
      initEMCNavBar();
      expect(mockElements['emc-nav-pfi'].className).toContain('emc-nav-level--active');
    });

    it('should show Core Templates in tier summary before PFI selection', () => {
      initEMCNavBar();
      expect(mockElements['emc-nav-tier'].textContent).toBe('Core Templates');
    });
  });

  describe('toggleEMCDropdown', () => {
    it('should open PFI dropdown when level 1 toggled', () => {
      setupRegistryWithInstances();
      initEMCNavBar();

      toggleEMCDropdown(1);
      expect(mockElements['emc-nav-pfi-dropdown'].style.display).toBe('block');
    });

    it('should close PFI dropdown when toggled again', () => {
      setupRegistryWithInstances();
      initEMCNavBar();

      toggleEMCDropdown(1);
      expect(mockElements['emc-nav-pfi-dropdown'].style.display).toBe('block');

      toggleEMCDropdown(1);
      expect(mockElements['emc-nav-pfi-dropdown'].style.display).toBe('none');
    });

    it('should close PFI dropdown when product dropdown opened', () => {
      setupRegistryWithInstances();
      initEMCNavBar();

      toggleEMCDropdown(1);
      expect(mockElements['emc-nav-pfi-dropdown'].style.display).toBe('block');

      toggleEMCDropdown(2);
      expect(mockElements['emc-nav-pfi-dropdown'].style.display).toBe('none');
    });

    it('should populate PFI dropdown with all instances including W4M-WWG', () => {
      setupRegistryWithInstances();
      initEMCNavBar();

      toggleEMCDropdown(1);

      const listHTML = mockElements['emc-nav-pfi-list'].innerHTML;
      expect(listHTML).toContain('PF-Core');
      expect(listHTML).toContain('BAIV Instance');
      expect(listHTML).toContain('AIRL CAF Audit');
      expect(listHTML).toContain('VHF Nutrition');
      expect(listHTML).toContain('W4M WWG (World Wide Gourmet)');
    });

    it('should show scope pills in PFI dropdown items', () => {
      setupRegistryWithInstances();
      initEMCNavBar();

      toggleEMCDropdown(1);

      const listHTML = mockElements['emc-nav-pfi-list'].innerHTML;
      expect(listHTML).toContain('PRODUCT');
      expect(listHTML).toContain('COMPLIANCE');
      expect(listHTML).toContain('STRATEGIC');
      expect(listHTML).toContain('FULFILMENT');
    });

    it('should render W4M-WWG with correct onclick handler', () => {
      setupRegistryWithInstances();
      initEMCNavBar();

      toggleEMCDropdown(1);

      const listHTML = mockElements['emc-nav-pfi-list'].innerHTML;
      expect(listHTML).toContain("selectEMCInstance('PFI-W4M-WWG')");
    });
  });

  describe('selectEMCInstance', () => {
    it('should reset to PFC when empty instanceId provided', () => {
      setupRegistryWithInstances();
      initEMCNavBar();
      selectEMCInstance('PFI-BAIV');

      selectEMCInstance('');
      expect(mockState.emcNavLevel).toBe(0);
      expect(mockState.contextLevel).toBe('PFC');
      expect(mockState.activeInstanceId).toBeNull();
    });

    it('should update PFI label when instance selected', () => {
      setupRegistryWithInstances();
      initEMCNavBar();

      selectEMCInstance('PFI-BAIV');
      expect(mockElements['emc-nav-pfi-label'].textContent).toBe('BAIV Instance');
    });

    it('should show separator between PFC and PFI after selection', () => {
      setupRegistryWithInstances();
      initEMCNavBar();

      selectEMCInstance('PFI-BAIV');
      expect(mockElements['emc-nav-sep-1'].style.display).toBe('inline');
    });

    it('should enable product level for instance with products', () => {
      setupRegistryWithInstances();
      initEMCNavBar();

      selectEMCInstance('PFI-BAIV');
      expect(mockElements['emc-nav-product-btn'].disabled).toBe(false);
    });

    it('should auto-select first product', () => {
      setupRegistryWithInstances();
      initEMCNavBar();

      selectEMCInstance('PFI-BAIV');
      expect(mockState.activeProductCode).toBe('AIV');
    });

    it('should update product label with auto-selected product', () => {
      setupRegistryWithInstances();
      initEMCNavBar();

      selectEMCInstance('PFI-BAIV');
      expect(mockElements['emc-nav-product-label'].textContent).toBe('AIV');
    });

    it('should set contextLevel to PFI', () => {
      setupRegistryWithInstances();
      initEMCNavBar();

      selectEMCInstance('PFI-BAIV');
      expect(mockState.contextLevel).toBe('PFI');
    });

    it('should close all dropdowns on selection', () => {
      setupRegistryWithInstances();
      initEMCNavBar();

      toggleEMCDropdown(1);
      expect(mockElements['emc-nav-pfi-dropdown'].style.display).toBe('block');

      selectEMCInstance('PFI-BAIV');
      expect(mockElements['emc-nav-pfi-dropdown'].style.display).toBe('none');
    });
  });

  describe('selectEMCProduct', () => {
    it('should update activeProductCode', () => {
      setupRegistryWithInstances();
      initEMCNavBar();
      selectEMCInstance('PFI-AIRL-CAF-AZA');

      selectEMCProduct('Cyber-Insurance-Advisory');
      expect(mockState.activeProductCode).toBe('Cyber-Insurance-Advisory');
    });

    it('should set emcNavLevel to 2', () => {
      setupRegistryWithInstances();
      initEMCNavBar();
      selectEMCInstance('PFI-AIRL-CAF-AZA');

      selectEMCProduct('CAF-Audit');
      expect(mockState.emcNavLevel).toBe(2);
    });

    it('should update product label', () => {
      setupRegistryWithInstances();
      initEMCNavBar();
      selectEMCInstance('PFI-AIRL-CAF-AZA');

      selectEMCProduct('Cyber-Insurance-Advisory');
      expect(mockElements['emc-nav-product-label'].textContent).toBe('Cyber-Insurance-Advisory');
    });

    it('should show product separator', () => {
      setupRegistryWithInstances();
      initEMCNavBar();
      selectEMCInstance('PFI-AIRL-CAF-AZA');

      selectEMCProduct('CAF-Audit');
      expect(mockElements['emc-nav-sep-2'].style.display).toBe('inline');
    });
  });

  describe('setEMCLevel', () => {
    it('should reset to PFC when level 0 selected', () => {
      setupRegistryWithInstances();
      initEMCNavBar();
      selectEMCInstance('PFI-BAIV');

      setEMCLevel(0);

      expect(mockState.emcNavLevel).toBe(0);
      expect(mockState.activeProductCode).toBeNull();
      expect(mockState.contextLevel).toBe('PFC');
    });

    it('should clear product when level 1 selected', () => {
      setupRegistryWithInstances();
      initEMCNavBar();
      selectEMCInstance('PFI-BAIV');
      selectEMCProduct('AIV');
      expect(mockState.activeProductCode).toBe('AIV');

      setEMCLevel(1);

      expect(mockState.activeProductCode).toBeNull();
      expect(mockState.emcNavLevel).toBe(1);
    });

    it('should hide separators when resetting to level 0', () => {
      setupRegistryWithInstances();
      initEMCNavBar();
      selectEMCInstance('PFI-BAIV');

      setEMCLevel(0);

      expect(mockElements['emc-nav-sep-1'].style.display).toBe('none');
      expect(mockElements['emc-nav-sep-2'].style.display).toBe('none');
      expect(mockElements['emc-nav-sep-3'].style.display).toBe('none');
    });

    it('should reset PFI label to default when going to level 0', () => {
      setupRegistryWithInstances();
      initEMCNavBar();
      selectEMCInstance('PFI-BAIV');
      expect(mockElements['emc-nav-pfi-label'].textContent).toBe('BAIV Instance');

      setEMCLevel(0);

      expect(mockElements['emc-nav-pfi-label'].textContent).toBe('Instance');
    });

    it('should reset product label when going to level 1', () => {
      setupRegistryWithInstances();
      initEMCNavBar();
      selectEMCInstance('PFI-BAIV');
      selectEMCProduct('AIV');
      expect(mockElements['emc-nav-product-label'].textContent).toBe('AIV');

      setEMCLevel(1);

      expect(mockElements['emc-nav-product-label'].textContent).toBe('Product');
    });
  });

  describe('multi-product instance', () => {
    it('should auto-select first product of multi-product instance', () => {
      setupRegistryWithInstances();
      initEMCNavBar();

      selectEMCInstance('PFI-AIRL-CAF-AZA');
      expect(mockState.activeProductCode).toBe('CAF-Audit');
    });

    it('should show both products in product dropdown', () => {
      setupRegistryWithInstances();
      initEMCNavBar();
      selectEMCInstance('PFI-AIRL-CAF-AZA');

      toggleEMCDropdown(2);

      const listHTML = mockElements['emc-nav-product-list'].innerHTML;
      expect(listHTML).toContain('CAF-Audit');
      expect(listHTML).toContain('Cyber-Insurance-Advisory');
    });

    it('should switch between products', () => {
      setupRegistryWithInstances();
      initEMCNavBar();
      selectEMCInstance('PFI-AIRL-CAF-AZA');
      expect(mockState.activeProductCode).toBe('CAF-Audit');

      selectEMCProduct('Cyber-Insurance-Advisory');
      expect(mockState.activeProductCode).toBe('Cyber-Insurance-Advisory');
      expect(mockElements['emc-nav-product-label'].textContent).toBe('Cyber-Insurance-Advisory');
    });
  });

  describe('nav summary', () => {
    it('should show vertical market and PF-Instance in tier when PFI selected', () => {
      setupRegistryWithInstances();
      initEMCNavBar();
      mockState.brandContext = { brand: 'BAIV-MarTech', accentColor: '#00f5d4' };

      selectEMCInstance('PFI-BAIV');

      expect(mockElements['emc-nav-tier'].textContent).toContain('MarTech');
      expect(mockElements['emc-nav-tier'].textContent).toContain('PF-Instance');
    });

    it('should include product code in tier text when product selected', () => {
      setupRegistryWithInstances();
      initEMCNavBar();
      mockState.brandContext = { brand: 'BAIV', accentColor: '#00f5d4' };

      selectEMCInstance('PFI-BAIV');

      expect(mockElements['emc-nav-tier'].textContent).toContain('AIV');
    });

    it('should show DS brand in brand element', () => {
      setupRegistryWithInstances();
      initEMCNavBar();
      mockState.brandContext = { brand: 'BAIV-MarTech', accentColor: '#00f5d4' };

      selectEMCInstance('PFI-BAIV');

      expect(mockElements['emc-nav-brand'].textContent).toBe('DS: BAIV-MarTech');
    });

    it('should update accent bar colour from brand context', () => {
      setupRegistryWithInstances();
      initEMCNavBar();
      mockState.brandContext = { brand: 'BAIV', accentColor: '#00f5d4' };

      selectEMCInstance('PFI-BAIV');

      expect(mockElements['emc-nav-accent'].style.background).toBe('#00f5d4');
    });

    it('should show Core Templates when reset to PFC', () => {
      setupRegistryWithInstances();
      initEMCNavBar();
      mockState.brandContext = { brand: 'BAIV', accentColor: '#00f5d4' };
      selectEMCInstance('PFI-BAIV');

      mockState.brandContext = null;
      setEMCLevel(0);

      expect(mockElements['emc-nav-tier'].textContent).toBe('Core Templates');
    });
  });

  describe('highlight synchronisation', () => {
    it('should highlight PFC button after resetting to level 0', () => {
      setupRegistryWithInstances();
      initEMCNavBar();
      selectEMCInstance('PFI-BAIV');

      setEMCLevel(0);

      const pfcBtn = mockElements['emc-nav-pfc-btn'];
      expect(pfcBtn.classList.contains('emc-nav-btn--active')).toBe(true);
    });

    it('should highlight product button at level 2', () => {
      setupRegistryWithInstances();
      initEMCNavBar();
      selectEMCInstance('PFI-BAIV');

      const productBtn = mockElements['emc-nav-product-btn'];
      expect(productBtn.classList.contains('emc-nav-btn--active')).toBe(true);

      const pfcBtn = mockElements['emc-nav-pfc-btn'];
      expect(pfcBtn.classList.contains('emc-nav-btn--active')).toBe(false);
    });
  });

  describe('empty product list', () => {
    it('should show "No products defined" for instance with no products', () => {
      setupRegistryWithInstances();
      // Add an instance with no products
      const noProductInst = {
        '@id': 'PFI-EMPTY',
        name: 'Empty Instance',
        products: [],
        brands: [],
        requirementScopes: [],
      };
      mockState.registryIndex.pfiInstances.push(noProductInst);
      mockState.pfiInstances.set('PFI-EMPTY', noProductInst);

      initEMCNavBar();
      mockState.activeInstanceId = 'PFI-EMPTY';

      toggleEMCDropdown(2);

      const listHTML = mockElements['emc-nav-product-list'].innerHTML;
      expect(listHTML).toContain('No products defined');
    });
  });
});
