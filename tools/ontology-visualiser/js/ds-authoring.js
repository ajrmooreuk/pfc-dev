/**
 * DS-ONT Authoring — DesignComponent, Page & Template authoring
 * with token bindings and design rule display.
 * (Epic 7, Feature 7.6: Stories 7.6.4, 7.6.5, 7.6.6; Feature 7.7: S7.7.5)
 *
 * Extends the general authoring pattern (authoring-ui.js) with DS-ONT-aware
 * forms for creating components, pages, and templates against the active
 * DS brand instance.
 */

import { state } from './state.js';
import { addDSGraphEntry, getDSArtefactHistory, saveDSArtefact, bumpDSArtefactVersion } from './ds-loader.js';

// ========================================
// UTILITY
// ========================================

function escHtml(str) {
  const d = document.createElement('div');
  d.textContent = str || '';
  return d.innerHTML;
}

/**
 * Detect if the active DS brand has instance data loaded.
 * @returns {boolean}
 */
export function hasDSInstanceLoaded() {
  return !!state.activeDSBrand && state.dsInstances.has(state.activeDSBrand);
}

// ========================================
// SEMANTIC TOKEN OPTION RENDERING
// ========================================

/**
 * Render HTML <option> elements for semantic tokens with color swatches.
 * @param {Object} parsed - DS instance parsed data
 * @returns {string} HTML options
 */
export function renderSemanticTokenOptions(parsed) {
  if (!parsed || !parsed.semantics) return '<option value="">No tokens</option>';
  return parsed.semantics.map(tok => {
    const id = tok['@id'] || '';
    const name = tok['ds:tokenName'] || id;
    const val = tok['ds:lightModeValue'] || '';
    const swatch = val.startsWith('#') ? `style="background:${escHtml(val)}; display:inline-block; width:10px; height:10px; border-radius:2px; margin-right:4px;"` : '';
    return `<option value="${escHtml(id)}" data-color="${escHtml(val)}">${escHtml(name)} (${escHtml(val)})</option>`;
  }).join('');
}

// ========================================
// DESIGN COMPONENT EDITOR (S7.6.4)
// ========================================

/**
 * Show the DesignComponent authoring modal.
 * @param {string|null} componentId - null for new, @id for edit
 */
export function showDSComponentEditor(componentId = null) {
  if (!hasDSInstanceLoaded()) {
    alert('Select a DS brand first.');
    return;
  }

  const modal = document.getElementById('ds-component-editor-modal');
  if (!modal) return;

  const parsed = state.dsInstances.get(state.activeDSBrand);
  const title = document.getElementById('ds-component-title');
  const nameEl = document.getElementById('ds-comp-name');
  const levelEl = document.getElementById('ds-comp-level');
  const categoryEl = document.getElementById('ds-comp-category');
  const baseEl = document.getElementById('ds-comp-base');
  const overridesEl = document.getElementById('ds-comp-overrides');
  const descEl = document.getElementById('ds-comp-description');
  const bindingsEl = document.getElementById('ds-token-bindings');
  const errorEl = document.getElementById('ds-component-error');

  if (errorEl) errorEl.style.display = 'none';

  if (componentId) {
    // Edit mode: populate from existing component
    const comp = parsed.components.find(c => c['@id'] === componentId && c['@type'] === 'ds:DesignComponent');
    if (comp) {
      if (title) title.textContent = 'Edit Design Component';
      if (nameEl) nameEl.value = comp['ds:componentName'] || '';
      if (levelEl) levelEl.value = comp['ds:category'] || 'Atom';
      if (categoryEl) categoryEl.value = comp['ds:componentCategory'] || '';
      if (baseEl) baseEl.value = comp['ds:baseComponent'] || '';
      if (overridesEl) overridesEl.checked = comp['ds:allowsOverrides'] === true;
      if (descEl) descEl.value = comp['ds:description'] || '';
    }
    modal.dataset.editId = componentId;
  } else {
    if (title) title.textContent = 'Add Design Component';
    if (nameEl) nameEl.value = '';
    if (levelEl) levelEl.value = 'Atom';
    if (categoryEl) categoryEl.value = '';
    if (baseEl) baseEl.value = '';
    if (overridesEl) overridesEl.checked = false;
    if (descEl) descEl.value = '';
    delete modal.dataset.editId;
  }

  // Populate existing token bindings when editing
  if (bindingsEl) {
    bindingsEl.innerHTML = '';
    if (componentId) {
      const compName = parsed.components.find(c => c['@id'] === componentId && c['@type'] === 'ds:DesignComponent')?.['ds:componentName'];
      if (compName) {
        const existingTokens = parsed.components.filter(c =>
          c['@type'] === 'ds:ComponentToken' && c['ds:componentName'] === compName
        );
        const options = renderSemanticTokenOptions(parsed);
        for (const tok of existingTokens) {
          const part = tok['ds:partOrState'] || '';
          const refId = typeof tok['ds:referencesSemanticToken'] === 'string'
            ? tok['ds:referencesSemanticToken']
            : tok['ds:referencesSemanticToken']?.['@id'] || '';
          const row = document.createElement('div');
          row.className = 'ds-token-binding-row';
          row.innerHTML = `
            <input type="text" class="library-input ds-binding-part" placeholder="partOrState (e.g. background, text, border)" style="flex:1;" value="${escHtml(part)}">
            <select class="library-input ds-binding-ref" style="flex:1.5;">
              <option value="">-- semantic token --</option>
              ${options}
            </select>
            <button class="oaa-btn oaa-btn-secondary" onclick="removeTokenBindingRow(this)" style="padding:4px 8px; font-size:10px;">&times;</button>
          `;
          bindingsEl.appendChild(row);
          // Set the selected option
          const sel = row.querySelector('.ds-binding-ref');
          if (sel && refId) sel.value = refId;
        }
      }
    }
  }

  modal.style.display = 'flex';
}

/**
 * Close the DS component editor modal.
 */
export function closeDSComponentEditor() {
  const modal = document.getElementById('ds-component-editor-modal');
  if (modal) modal.style.display = 'none';
}

/**
 * Add a token binding row to the component editor.
 */
export function addTokenBindingRow() {
  const container = document.getElementById('ds-token-bindings');
  if (!container) return;

  const parsed = state.dsInstances.get(state.activeDSBrand);
  const options = renderSemanticTokenOptions(parsed);

  const row = document.createElement('div');
  row.className = 'ds-token-binding-row';
  row.innerHTML = `
    <input type="text" class="library-input ds-binding-part" placeholder="partOrState (e.g. background, text, border)" style="flex:1;">
    <select class="library-input ds-binding-ref" style="flex:1.5;">
      <option value="">-- semantic token --</option>
      ${options}
    </select>
    <button class="oaa-btn oaa-btn-secondary" onclick="removeTokenBindingRow(this)" style="padding:4px 8px; font-size:10px;">&times;</button>
  `;
  container.appendChild(row);
}

/**
 * Remove a token binding row.
 */
export function removeTokenBindingRow(btn) {
  const row = btn.closest('.ds-token-binding-row');
  if (row) row.remove();
}

/**
 * Validate component token bindings against DS-ONT business rules.
 * - ds:rule-component-must-ref-semantic: every binding must reference a semantic token
 * - ds:rule-component-tokens-exist: referenced semantic tokens must exist in the instance
 * - BR-DS-003: if allowsOverrides is set, at least one binding must exist
 *
 * @param {Array<{part: string, ref: string}>} bindings - collected bindings
 * @param {Object} parsed - parsed DS instance
 * @param {boolean} allowsOverrides - whether overrides checkbox is set
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateComponentBindings(bindings, parsed, allowsOverrides) {
  const errors = [];
  const semanticIds = new Set((parsed.semantics || []).map(s => s['@id']));

  for (const b of bindings) {
    // ds:rule-component-must-ref-semantic — every binding must reference a semantic token
    if (!b.ref) {
      errors.push(`Binding "${b.part}" has no semantic token selected (BR-DS-002).`);
      continue;
    }
    // ds:rule-component-tokens-exist — referenced token must exist
    if (!semanticIds.has(b.ref)) {
      errors.push(`Binding "${b.part}" references unknown token "${b.ref}" (ds:rule-component-tokens-exist).`);
    }
  }

  // BR-DS-003: overridable components must have at least one binding
  if (allowsOverrides && bindings.length === 0) {
    errors.push('Overridable components must have at least one token binding (BR-DS-003).');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Save the DesignComponent to the DS instance.
 */
export function doSaveDSComponent() {
  const parsed = state.dsInstances.get(state.activeDSBrand);
  if (!parsed) return;

  const modal = document.getElementById('ds-component-editor-modal');
  const name = document.getElementById('ds-comp-name')?.value?.trim();
  const level = document.getElementById('ds-comp-level')?.value;
  const category = document.getElementById('ds-comp-category')?.value?.trim();
  const base = document.getElementById('ds-comp-base')?.value?.trim();
  const overrides = document.getElementById('ds-comp-overrides')?.checked;
  const desc = document.getElementById('ds-comp-description')?.value?.trim();
  const errorEl = document.getElementById('ds-component-error');

  if (!name) {
    if (errorEl) { errorEl.textContent = 'Component name is required.'; errorEl.style.display = 'block'; }
    return;
  }

  // Collect bindings from DOM rows
  const rows = document.querySelectorAll('.ds-token-binding-row');
  const bindings = [];
  for (const row of rows) {
    const part = row.querySelector('.ds-binding-part')?.value?.trim();
    const ref = row.querySelector('.ds-binding-ref')?.value;
    if (part) bindings.push({ part, ref: ref || '' });
  }

  // Validate against DS-ONT business rules
  const validation = validateComponentBindings(bindings, parsed, overrides);
  if (!validation.valid) {
    if (errorEl) { errorEl.textContent = validation.errors.join(' '); errorEl.style.display = 'block'; }
    return;
  }

  const brand = state.activeDSBrand;
  const prefix = `${brand}-ds`;
  const slug = name.toLowerCase().replace(/\s+/g, '-');
  const compId = `${prefix}:comp-${slug}`;
  const editId = modal?.dataset?.editId;

  // If editing, remove old component and its tokens before re-adding
  if (editId) {
    parsed.components = (parsed.components || []).filter(c =>
      c['@id'] !== editId && c['ds:componentName'] !== (parsed.components.find(x => x['@id'] === editId)?.['ds:componentName'])
    );
  }

  // Create DesignComponent node
  const compNode = {
    '@type': 'ds:DesignComponent',
    '@id': compId,
    'ds:componentName': name,
    'ds:category': level,
    'ds:componentCategory': category || undefined,
    'ds:baseComponent': base || undefined,
    'ds:allowsOverrides': overrides,
    'ds:description': desc || undefined,
  };

  const result = addDSGraphEntry(parsed, compNode);
  if (!result.success) {
    if (errorEl) { errorEl.textContent = result.error; errorEl.style.display = 'block'; }
    return;
  }

  // Create ComponentToken nodes from validated bindings
  for (const b of bindings) {
    if (!b.ref) continue;
    const tokId = `${prefix}:comptok-${slug}-${b.part.toLowerCase().replace(/\s+/g, '-')}`;
    const tokNode = {
      '@type': 'ds:ComponentToken',
      '@id': tokId,
      'ds:tokenName': `${name.toLowerCase()}.${b.part}`,
      'ds:componentName': name,
      'ds:partOrState': b.part,
      'ds:referencesSemanticToken': { '@id': b.ref },
    };
    addDSGraphEntry(parsed, tokNode);
  }

  closeDSComponentEditor();
  console.log(`[DS Authoring] Component "${name}" saved with ${bindings.length} token bindings`);
}

// ========================================
// PAGE / TEMPLATE EDITOR (S7.6.5)
// ========================================

/**
 * Show the Page/Template definition modal.
 * @param {'page'|'template'} type
 * @param {string|null} entityId - null for new, @id for edit
 */
export function showPageTemplateEditor(type = 'page', entityId = null) {
  if (!hasDSInstanceLoaded()) {
    alert('Select a DS brand first.');
    return;
  }

  const modal = document.getElementById('ds-page-template-modal');
  if (!modal) return;

  const title = document.getElementById('ds-pt-title');
  const nameEl = document.getElementById('ds-pt-name');
  const descEl = document.getElementById('ds-pt-description');
  const slotsEl = document.getElementById('ds-pt-slots');
  const errorEl = document.getElementById('ds-pt-error');
  const routeRow = document.getElementById('ds-pt-route-row');

  if (errorEl) errorEl.style.display = 'none';
  if (slotsEl) slotsEl.innerHTML = '';
  if (nameEl) nameEl.value = '';
  if (descEl) descEl.value = '';

  modal.dataset.type = type;
  delete modal.dataset.editId;

  if (type === 'page') {
    if (title) title.textContent = 'Define Page';
    if (routeRow) routeRow.style.display = 'block';
  } else {
    if (title) title.textContent = 'Define Template';
    if (routeRow) routeRow.style.display = 'none';
  }

  modal.style.display = 'flex';
}

export function closePageTemplateEditor() {
  const modal = document.getElementById('ds-page-template-modal');
  if (modal) modal.style.display = 'none';
}

/**
 * Add a component slot row to the page/template editor.
 */
export function addComponentSlot() {
  const container = document.getElementById('ds-pt-slots');
  if (!container) return;

  const parsed = state.dsInstances.get(state.activeDSBrand);
  const compOptions = (parsed?.components || []).map(c => {
    const name = c['ds:componentName'] || c['@id'];
    return `<option value="${escHtml(c['@id'])}">${escHtml(name)}</option>`;
  }).join('');

  const row = document.createElement('div');
  row.className = 'ds-token-binding-row';
  row.innerHTML = `
    <input type="text" class="library-input ds-slot-name" placeholder="Slot name (e.g. header, hero, footer)" style="flex:1;">
    <select class="library-input ds-slot-component" style="flex:1.5;">
      <option value="">-- component --</option>
      ${compOptions}
    </select>
    <button class="oaa-btn oaa-btn-secondary" onclick="removeComponentSlot(this)" style="padding:4px 8px; font-size:10px;">&times;</button>
  `;
  container.appendChild(row);
}

export function removeComponentSlot(btn) {
  const row = btn.closest('.ds-token-binding-row');
  if (row) row.remove();
}

/**
 * Save the Page or Template to the DS instance.
 */
export function doSavePageTemplate() {
  const modal = document.getElementById('ds-page-template-modal');
  if (!modal) return;

  const type = modal.dataset.type || 'page';
  const parsed = state.dsInstances.get(state.activeDSBrand);
  if (!parsed) return;

  const name = document.getElementById('ds-pt-name')?.value?.trim();
  const desc = document.getElementById('ds-pt-description')?.value?.trim();
  const route = document.getElementById('ds-pt-route')?.value?.trim();
  const errorEl = document.getElementById('ds-pt-error');

  if (!name) {
    if (errorEl) { errorEl.textContent = 'Name is required.'; errorEl.style.display = 'block'; }
    return;
  }

  const brand = state.activeDSBrand;
  const prefix = `${brand}-ds`;
  const slug = name.toLowerCase().replace(/\s+/g, '-');

  // Collect slots
  const slotRows = document.querySelectorAll('#ds-pt-slots .ds-token-binding-row');
  const slots = [];
  for (const row of slotRows) {
    const slotName = row.querySelector('.ds-slot-name')?.value?.trim();
    const compRef = row.querySelector('.ds-slot-component')?.value;
    if (slotName) {
      slots.push({ slotName, componentRef: compRef || null });
    }
  }

  if (type === 'page') {
    const node = {
      '@type': 'ds:PageDefinition',
      '@id': `${prefix}:page-${slug}`,
      'ds:pageId': slug,
      'ds:pageName': name,
      'ds:description': desc || undefined,
      'ds:route': route || undefined,
      'ds:componentSlots': JSON.stringify(slots),
      'ds:brand': brand,
      'ds:version': '1.0.0',
    };
    const result = saveDSArtefact(brand, node);
    if (!result.success) {
      if (errorEl) { errorEl.textContent = result.error; errorEl.style.display = 'block'; }
      return;
    }
  } else {
    const node = {
      '@type': 'ds:TemplateDefinition',
      '@id': `${prefix}:template-${slug}`,
      'ds:templateId': slug,
      'ds:templateName': name,
      'ds:description': desc || undefined,
      'ds:layoutSlots': JSON.stringify(slots),
      'ds:version': '1.0.0',
    };
    const result = saveDSArtefact(brand, node);
    if (!result.success) {
      if (errorEl) { errorEl.textContent = result.error; errorEl.style.display = 'block'; }
      return;
    }
  }

  closePageTemplateEditor();
  console.log(`[DS Authoring] ${type} "${name}" saved with ${slots.length} slots`);
}

// ========================================
// FIGMA MAKE IMPORT (S7.6.5)
// ========================================

/**
 * Import a Figma Make token file as a PageDefinition.
 * Converts the make: namespace format into DS-ONT PageDefinition.
 *
 * @param {Object} figmaMakeJson - Figma Make token file JSON
 * @param {string} brand - Brand key
 * @returns {Object} PageDefinition node for @graph
 */
export function importFigmaMakeAsPage(figmaMakeJson, brand) {
  if (!figmaMakeJson) return null;

  const pageId = figmaMakeJson['make:pageId'] || 'unknown';
  const pageName = figmaMakeJson['make:pageName'] || pageId;
  const components = figmaMakeJson.components || {};

  const slots = Object.entries(components).map(([slotName, comp]) => ({
    slotName,
    description: comp.description || '',
    tokenCount: comp.tokens ? Object.keys(comp.tokens).length : 0,
  }));

  return {
    '@type': 'ds:PageDefinition',
    '@id': `${brand}-ds:page-${pageId}`,
    'ds:pageId': pageId,
    'ds:pageName': pageName,
    'ds:description': figmaMakeJson['make:description'] || '',
    'ds:componentSlots': JSON.stringify(slots),
    'ds:brand': brand,
    'ds:version': '1.0.0',
    'ds:dsInstanceRef': figmaMakeJson['make:dsInstanceRef'] || '',
    'ds:importedFrom': 'figma-make',
  };
}

// ========================================
// DS COMPONENT BINDINGS — DETAILS TAB (S7.6.4)
// ========================================

/**
 * Render token bindings HTML for a DesignComponent in the sidebar Details tab.
 * Shows each binding with its referenced semantic token and provides
 * edit (open editor) and remove (delete binding) actions.
 *
 * @param {string} componentId - @id of the DesignComponent
 * @returns {string} HTML string (empty if not a DS component or no brand loaded)
 */
export function renderDSComponentBindings(componentId) {
  if (!hasDSInstanceLoaded()) return '';
  const parsed = state.dsInstances.get(state.activeDSBrand);
  if (!parsed) return '';

  const comp = parsed.components.find(c => c['@id'] === componentId && c['@type'] === 'ds:DesignComponent');
  if (!comp) return '';

  const compName = comp['ds:componentName'] || '';
  const tokens = parsed.components.filter(c =>
    c['@type'] === 'ds:ComponentToken' && c['ds:componentName'] === compName
  );

  // Build semantic token lookup for display
  const semLookup = {};
  for (const s of (parsed.semantics || [])) {
    semLookup[s['@id']] = s['ds:tokenName'] || s['@id'];
  }

  let html = `<div class="ds-bindings-section" style="margin-top:12px;">`;
  html += `<h4 style="color:#FF9800; font-size:12px; margin-bottom:6px;">Token Bindings (${tokens.length})</h4>`;

  if (tokens.length === 0) {
    html += `<p style="color:#666; font-size:11px;">No token bindings.</p>`;
  } else {
    for (const tok of tokens) {
      const part = escHtml(tok['ds:partOrState'] || '');
      const refRaw = tok['ds:referencesSemanticToken'];
      const refId = typeof refRaw === 'string' ? refRaw : refRaw?.['@id'] || '';
      const refName = escHtml(semLookup[refId] || refId);
      const tokId = escHtml(tok['@id']);

      html += `<div class="ds-binding-item" style="display:flex; align-items:center; gap:6px; padding:4px 0; border-bottom:1px solid var(--viz-border-default, #2a2d37); font-size:11px;">
        <span style="color:#FF9800; flex:0 0 auto;">${part}</span>
        <span style="color:#666;">\u2192</span>
        <span style="color:#2196F3; flex:1;">${refName}</span>
        <button class="oaa-btn oaa-btn-secondary" onclick="removeDSTokenBinding('${tokId}')" style="padding:2px 6px; font-size:9px;" title="Remove binding">&times;</button>
      </div>`;
    }
  }

  html += `<div style="margin-top:8px; display:flex; gap:6px;">`;
  html += `<button class="oaa-btn oaa-btn-secondary" onclick="showDSComponentEditor('${escHtml(componentId)}')" style="font-size:10px;">Edit Component</button>`;
  html += `</div></div>`;

  return html;
}

/**
 * Remove a single ComponentToken binding by @id.
 * @param {string} tokenId - @id of the ComponentToken to remove
 */
export function removeDSTokenBinding(tokenId) {
  if (!hasDSInstanceLoaded()) return;
  const parsed = state.dsInstances.get(state.activeDSBrand);
  if (!parsed) return;

  const idx = parsed.components.findIndex(c => c['@id'] === tokenId && c['@type'] === 'ds:ComponentToken');
  if (idx >= 0) {
    const removed = parsed.components.splice(idx, 1)[0];
    console.log(`[DS Authoring] Removed binding "${removed['ds:tokenName']}"`);
  }
}

// ========================================
// DESIGN RULE SIDEBAR DISPLAY (S7.7.5)
// ========================================

/**
 * Render applicable design rules for a DesignComponent in the sidebar.
 * Shows ComponentDesignRules targeting this component, plus system-level
 * DesignRules that apply to its category/scope.
 *
 * @param {string} componentId - @id of the DesignComponent
 * @returns {string} HTML string (empty if no brand loaded or no rules)
 */
export function renderDSComponentRules(componentId) {
  if (!hasDSInstanceLoaded()) return '';
  const parsed = state.dsInstances.get(state.activeDSBrand);
  if (!parsed) return '';

  const comp = parsed.components.find(c => c['@id'] === componentId && c['@type'] === 'ds:DesignComponent');
  if (!comp) return '';

  const rules = parsed.designRules || [];
  if (rules.length === 0) return '';

  const compCategory = comp['ds:category'] || '';

  // Find rules applicable to this component:
  // 1. ComponentDesignRules targeting this specific component
  // 2. ComponentDesignRules targeting this component's category
  // 3. System-level DesignRules with ComponentDefinition scope
  const applicable = rules.filter(r => {
    if (r['@type'] === 'ds:ComponentDesignRule') {
      const target = r['ds:targetComponent'];
      const targetId = target ? (typeof target === 'string' ? target : target['@id']) : null;
      if (targetId === componentId) return true;
      if (r['ds:targetCategory'] && r['ds:targetCategory'] === compCategory) return true;
      // Category-level rules with no specific target also apply
      if (!targetId && r['ds:targetCategory']) return true;
      return false;
    }
    // System-level DesignRules with ComponentDefinition scope apply to all components
    if (r['ds:scope'] === 'ComponentDefinition') return true;
    return false;
  });

  if (applicable.length === 0) return '';

  const severityColor = { error: '#FF6B6B', warning: '#FFB84D', info: '#2196F3' };
  const severityIcon = { error: '!', warning: '~', info: 'i' };

  let html = `<div class="ds-rules-section" style="margin-top:12px;">`;
  html += `<h4 style="color:#FF6B6B; font-size:12px; margin-bottom:6px;">Design Rules (${applicable.length})</h4>`;

  for (const rule of applicable) {
    const sev = rule['ds:severity'] || 'info';
    const color = severityColor[sev] || '#666';
    const icon = severityIcon[sev] || 'i';
    const ruleId = escHtml(rule['ds:ruleId'] || rule['@id']);
    const ruleName = escHtml(rule['ds:ruleName'] || '');
    const isCompRule = rule['@type'] === 'ds:ComponentDesignRule';
    const constraint = isCompRule
      ? `${escHtml(rule['ds:constraintType'] || '')}(${escHtml(rule['ds:constraintTarget'] || '')}) = ${escHtml(rule['ds:constraintValue'] || '')}`
      : '';

    html += `<div class="ds-rule-item" style="padding:4px 0; border-bottom:1px solid var(--viz-border-default, #2a2d37); font-size:11px;">
      <div style="display:flex; align-items:center; gap:4px;">
        <span style="color:${color}; font-weight:600; font-size:9px; border:1px solid ${color}; border-radius:3px; padding:0 3px;">[${icon}]</span>
        <span style="color:${color}; font-weight:600;">${ruleId}</span>
        <span style="color:var(--viz-text-secondary, #888);">${ruleName}</span>
      </div>`;

    if (constraint) {
      html += `<div style="color:#FFB84D; font-size:10px; margin-top:2px; padding-left:28px;">${constraint}</div>`;
    }

    html += `</div>`;
  }

  html += `</div>`;
  return html;
}

// ========================================
// VERSION HISTORY UI (S7.6.6)
// ========================================

/**
 * Render version history for a DS artefact as HTML.
 * @param {string} artefactId - @id of the artefact
 * @returns {string} HTML string
 */
export function renderDSVersionHistory(artefactId) {
  const history = getDSArtefactHistory(artefactId);
  if (history.length === 0) return '<p style="color:#666; font-size:11px;">No version history.</p>';

  return history.map(h => `
    <div class="ds-version-entry">
      <span class="ds-version-badge">v${escHtml(h.version)}</span>
      <span class="ds-version-time">${new Date(h.timestamp).toLocaleDateString()}</span>
      <span class="ds-version-changes">${escHtml(h.changes)}</span>
    </div>
  `).join('');
}
