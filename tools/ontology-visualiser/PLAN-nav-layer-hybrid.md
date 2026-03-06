# Dynamic Navigation Zone — Skeleton-Driven Toolbar Replacement

**Version:** 2.1.0
**Date:** 2026-02-24
**Parent:** Epic 40 / F40.20 — Navigation as Ontology (DS-ONT v3.0.0)
**Status:** DELIVERED — All 4 phases complete (commit 0249925)

> **DS-ONT v3.0.0 supersedes this plan.** The ACTION_REGISTRY and ZONE_DOM_SELECTORS described below have been deleted. Every UI action is now a first-class `ds:Action` entity in the skeleton JSONLD. Guard conditions, accessibility hints, state bindings, and zone DOM selectors are all modeled in the ontology. See [APP-SKELETON-GUIDE.md](../DESIGN-SYSTEM/APP-SKELETON-GUIDE.md) for the current architecture.

---

## 1. Problem Statement

The toolbar (Z2) is 50+ hardcoded HTML buttons in `browser-viewer.html`. The application skeleton (`pfc-app-skeleton-v1.0.0.jsonld`) already defines 5 NavLayers, 26 NavItems, and a `ds:action` field per item — but this data **never drives the DOM**. The skeleton loads into state, builds registries, and sits there. Meanwhile every new feature adds another hardcoded button to the HTML.

The `NAV_ITEM_DOM_MAP` in `app-skeleton-editor.js` was an attempt to bridge the gap — mapping skeleton `ds:itemId` values to static CSS selectors. This is brittle, incomplete (only 16 of 26 items mapped), and fundamentally at odds with dynamic rendering.

**The plan**: Create a new zone that renders navigation entirely from skeleton JSONLD. Prove it works. Then delete the hardcoded toolbar and the `NAV_ITEM_DOM_MAP` bridge.

---

## 2. Design Principles

### 2a. Extensible Navigation Levels

The DS-ONT application skeleton must support **extensible navigation levels**. The current 5 layers (L1–L4 with L3 split) are the PFC base. PFI instances, products, and apps must be able to:

- **Add new layers** (L5, L6, ...) via cascade override
- **Add items to existing layers** (L4 is explicitly reserved for PFI custom items)
- **Re-order items** within any non-PFC-immutable layer
- **Hide PFC items** by overriding visibility conditions (not by deleting — BR-DS-013 cascade immutability)

The renderer must not hardcode any assumption about the number or names of layers.

### 2b. Reserved Layer Tiers

| Level | Layer ID | Name | Tier | Purpose |
|-------|----------|------|------|---------|
| 1 | L1 | Main Capabilities | PFC | Core ontology actions — load, audit, library, categories, layers, export |
| 2 | L2 | View Controls | PFC | Graph manipulation — physics, fit, reset, details |
| 3 | L3-context | Context/Mode | PFC | View tabs (Graph/DS/Mermaid/Mindmap) + context tools |
| 3 | L3-admin | Admin/Config | PFC | DS tokens, token map, PFC/PFI toggle, instance picker, skeleton |
| 4 | L4 | PFI Custom | PFI | Empty at PFC level — PFI instances add their own items here |
| 5+ | L5+ | (extensible) | PFI/Product/App | Instances define additional tiers via cascade |

L1–L4 are **reserved as-is** for PF-Instance toolbar specifics. PFI overrides add items to L4 and may define L5+ layers for product/app-specific navigation.

### 2c. Action Registry

Each NavItem has a `ds:action` string (e.g. `"toggleAuditPanel"`, `"setViewMode:graph"`). The dynamic zone needs an **action registry** that maps these strings to actual JS functions. This replaces the inline `onclick="fn()"` pattern.

```javascript
// Action registry — maps ds:action strings to callable functions
const ACTION_REGISTRY = {
  'toggleAuditPanel':     () => toggleAudit(),
  'toggleLibraryPanel':   () => toggleLibrary(),
  'togglePhysics':        () => togglePhysics(),
  'setViewMode:graph':    () => switchToGraphTab(),
  'setViewMode:mermaid':  () => switchToMermaidTab(),
  // ... every action from the skeleton JSONLD
};
```

Parameterised actions use colon syntax: `"setViewMode:graph"` splits into `action="setViewMode"`, `param="graph"`.

---

## 3. New Zone: Z2-dyn (Dynamic Navigation Bar)

### 3.1 Zone Definition

Add to `pfc-app-skeleton-v1.0.0.jsonld`:

```jsonld
{
  "@id": "ds:zone-Z2-dyn",
  "@type": "ds:AppZone",
  "ds:zoneId": "Z2-dyn",
  "ds:zoneName": "Dynamic Navigation Bar",
  "ds:zoneType": "Fixed",
  "ds:position": "top",
  "ds:defaultWidth": "100%",
  "ds:defaultVisible": false,
  "ds:visibilityCondition": null,
  "ds:zIndex": 98,
  "ds:cascadeTier": "PFC",
  "description": "Skeleton-driven navigation bar — renders all NavLayer/NavItem data dynamically from JSONLD. Runs in parallel with Z2 during proving phase, then replaces it."
}
```

**Key**: `ds:defaultVisible: false` during proving phase. Toggled on via a dev flag or skeleton panel control.

### 3.2 HTML Container

Add to `browser-viewer.html` directly after the existing `<div class="toolbar">`:

```html
<!-- Z2-dyn: Dynamic Navigation Bar (skeleton-driven, proving phase) -->
<div class="dynamic-nav-bar" id="dynamic-nav-bar" style="display:none;">
  <!-- Populated entirely by renderNavFromSkeleton() on boot -->
</div>
```

### 3.3 Rendering Pipeline

On boot, `loadAppSkeleton()` now calls `renderDynamicNavBar()`:

1. **Parse skeleton** — already done (zones, layers, items, components)
2. **Build action registry** — scan all `ds:action` values, map to JS functions
3. **Render layers** — for each NavLayer sorted by `ds:renderOrder`, create a `.nav-layer` div
4. **Render items** — for each NavItem in the layer, call `createNavItemElement()` (already exists)
5. **Wire actions** — attach `click` event listeners using the action registry
6. **Evaluate visibility** — run `updateSkeletonVisibility()` to show/hide conditional items
7. **Insert into Z2-dyn** container

### 3.4 Nav Layer Extensibility in Rendering

The renderer iterates `skeleton.navLayers` — no hardcoded L1/L2/L3/L4 assumptions:

```javascript
function renderDynamicNavBar(skeleton, container, actionRegistry) {
  const sortedLayers = [...skeleton.navLayers]
    .sort((a, b) => (a['ds:renderOrder'] || 0) - (b['ds:renderOrder'] || 0));

  for (const layer of sortedLayers) {
    const layerDiv = document.createElement('div');
    layerDiv.className = 'nav-layer';
    layerDiv.dataset.layerId = layer['ds:layerId'];
    layerDiv.dataset.layerName = layer['ds:layerName'];
    layerDiv.dataset.cascadeTier = layer['ds:cascadeTier'] || 'PFC';
    layerDiv.title = layer['ds:layerName'];

    const items = skeleton.navItems
      .filter(i => i['ds:belongsToLayer']?.['@id'] === layer['@id'])
      .sort((a, b) => (a['ds:renderOrder'] || 0) - (b['ds:renderOrder'] || 0));

    for (const item of items) {
      const el = createNavItemElement(item);
      if (el) {
        wireAction(el, item['ds:action'], actionRegistry);
        layerDiv.appendChild(el);
      }
    }

    if (items.length > 0 || layer['ds:cascadeTier'] === 'PFI') {
      container.appendChild(layerDiv);
    }
  }
}
```

PFI-tier layers render even when empty (placeholder for cascade-injected items).

---

## 4. Implementation Phases

### Phase 1: Action Registry + Dynamic Rendering (new zone, parallel)
**Files:** `app-skeleton-loader.js`, `app.js`, `browser-viewer.html`, `css/viewer.css`

1. **Build ACTION_REGISTRY** in `app.js` — map every `ds:action` value from the skeleton to the corresponding JS function. Start with the 26 items already in the JSONLD. Export as a constant or build dynamically.

2. **Add `wireAction()` to `app-skeleton-loader.js`** — attaches click/change handlers:
   ```javascript
   function wireAction(el, actionStr, registry) {
     if (!actionStr || actionStr === 'noop') return;
     const [action, param] = actionStr.split(':');
     const fn = registry[actionStr] || registry[action];
     if (fn) {
       el.addEventListener(el.tagName === 'SELECT' ? 'change' : 'click',
         () => fn(param));
     }
   }
   ```

3. **Add `renderDynamicNavBar()`** to `app-skeleton-loader.js` — as described in 3.4 above. Uses existing `createNavItemElement()`.

4. **Add Z2-dyn HTML container** to `browser-viewer.html` — hidden by default.

5. **Wire into boot** — in `loadAppSkeleton()` (app.js), after `buildSkeletonRegistries()`:
   ```javascript
   const dynBar = document.getElementById('dynamic-nav-bar');
   if (dynBar && state.appSkeleton) {
     renderDynamicNavBar(state.appSkeleton, dynBar, ACTION_REGISTRY);
   }
   ```

6. **Add toggle** — skeleton panel or dev console: `document.getElementById('dynamic-nav-bar').style.display = 'flex'` to show Z2-dyn alongside Z2 for comparison.

7. **CSS for `.nav-layer`** — visual sections with separators:
   ```css
   .dynamic-nav-bar {
     display: flex;
     align-items: center;
     gap: 2px;
     padding: 4px 8px;
     background: #1e1f26;
     border-bottom: 1px solid #2a2d35;
   }
   .nav-layer {
     display: inline-flex;
     align-items: center;
     gap: 4px;
   }
   .nav-layer + .nav-layer {
     border-left: 1px solid #3a3d47;
     margin-left: 6px;
     padding-left: 6px;
   }
   ```

**Acceptance:** Z2-dyn renders all 26 NavItems grouped by layer. Every button fires the correct app function. Conditional items (mermaid-edit, PFI-only controls) show/hide based on state.

### Phase 2: Visibility Engine + State Sync
**Files:** `app-skeleton-loader.js`, `app.js`

8. **Wire `updateSkeletonVisibility()`** — call it on every state change that affects visibility conditions (view mode switch, PFI mode toggle, authoring mode, node selection). Currently dead code — make it live for Z2-dyn elements.

9. **Toggle state sync** — when a Toggle-type NavItem is clicked (e.g. Physics), update its `aria-pressed` attribute and CSS active class. Match current button styling.

10. **Active view tab** — Chip-type items in L3-context (Graph/DS/Mermaid/Mindmap) need active state management. When view switches, update the active chip.

**Acceptance:** Dynamic bar reflects state changes in real time. Conditional items appear/disappear. Toggle buttons show active state. View tabs highlight current view.

### Phase 3: PFI Cascade Integration
**Files:** `app-skeleton-loader.js`, `pfc-app-skeleton-v1.0.0.jsonld`, BAIV override

11. **Test PFI cascade** — load BAIV skeleton override, verify L4 items appear in Z2-dyn. Verify PFC items are immutable (can't be deleted/modified by PFI override, only visibility-hidden).

12. **Test extensibility** — create a test PFI override with an L5 layer. Verify it renders after L4 with correct separation.

13. **Skeleton editor integration** — reorder/move operations in the editor should immediately reflect in Z2-dyn (the `_apply()` function re-renders the dynamic bar, not the static one).

**Acceptance:** PFI overrides inject items into L4 and custom layers. Skeleton editor mutations are reflected live in Z2-dyn.

### Phase 4: Prove and Replace
**Files:** `browser-viewer.html`, `app.js`, `app-skeleton-editor.js`

14. **Feature parity audit** — compare every hardcoded button in Z2 against the skeleton's NavItems. Identify any missing items not yet in the JSONLD. Add them.

15. **Enable Z2-dyn, disable Z2** — flip visibility: `Z2-dyn.style.display = 'flex'`, `Z2.style.display = 'none'`. Run full manual test pass.

16. **Delete hardcoded toolbar** — remove `<div class="toolbar">` (lines 24-91) from `browser-viewer.html`. Remove all inline `onclick="fn()"` handlers that were only used by static buttons.

17. **Delete `NAV_ITEM_DOM_MAP`** — remove the bridge map and `applySkeletonNavOrder()` from `app-skeleton-editor.js` (lines 457-540). No longer needed.

18. **Rename Z2-dyn → Z2** — update zone ID in skeleton JSONLD and all references. The dynamic bar becomes the toolbar.

19. **Delete dead code** — `context-toggle`, `instance-picker`, `context-identity-bar` HTML elements and their JS functions.

**Acceptance:** Single toolbar rendered entirely from skeleton. No hardcoded buttons. All 50+ actions work. PFI cascade extends it. Skeleton editor edits are live. All tests pass.

---

## 5. Data Model: Extensibility Requirements

### 5.1 No DS-ONT Schema Changes Needed

The existing schema already supports this:
- `ds:NavLayer` — no constraint on number of layers or layer IDs
- `ds:NavItem` — `ds:belongsToLayer` can reference any layer
- `ds:action` — freeform string, matched by action registry
- `ds:renderOrder` — numeric, determines position within layer
- `ds:cascadeTier` — enforces immutability (PFC items can't be modified by PFI)
- `ds:visibilityCondition` — evaluated at runtime

### 5.2 Skeleton JSONLD Updates Needed

**Phase 1**: Add Z2-dyn zone definition to `pfc-app-skeleton-v1.0.0.jsonld`.

**Phase 4**: Audit for missing NavItems. Currently 26 items in JSONLD but 50+ buttons in HTML. Missing items include:
- File input (Open File) — may stay as HTML form element, not a NavItem
- Layout select dropdown — needs NavItem with itemType "Select"
- Glossary button — needs NavItem in L1
- Run OAA Upgrade — needs NavItem in L1 (conditional)
- Save to Library — needs NavItem in L1 (conditional)
- Load from GitHub / GitHub settings / Load URL / Load Registry / Test Data — need NavItems in L1
- New Ontology / Fork — need NavItems in L3-context or L1
- Mermaid Fit — needs NavItem in L2 (conditional on mermaid view)
- View tabs — already present as Chip items in L3-context

Exact list to be finalised during Phase 4 feature parity audit.

### 5.3 PFI Override Example (BAIV)

```jsonld
{
  "@context": { "ds": "https://platformcore.io/ontology/ds/" },
  "@graph": [
    {
      "@id": "ds:navlayer-L5-baiv",
      "@type": "ds:NavLayer",
      "ds:layerId": "L5-baiv",
      "ds:layerName": "BAIV MarTech",
      "ds:layerLevel": 5,
      "ds:renderOrder": 6,
      "ds:cascadeTier": "PFI",
      "ds:navLayerInZone": { "@id": "ds:zone-Z2" }
    },
    {
      "@id": "ds:nav-L5-baiv-campaigns",
      "@type": "ds:NavItem",
      "ds:itemId": "nav-baiv-campaigns",
      "ds:label": "Campaigns",
      "ds:itemType": "Button",
      "ds:action": "toggleBAIVCampaigns",
      "ds:renderOrder": 1,
      "ds:cascadeTier": "PFI",
      "ds:belongsToLayer": { "@id": "ds:navlayer-L5-baiv" }
    }
  ]
}
```

---

## 6. Action Registry — Full Mapping

Current skeleton NavItems and their action mappings (26 items):

| ds:action | Target Function | Layer |
|-----------|----------------|-------|
| `toggleOntologyMenu` | `toggleOntologyMenu()` | L1 |
| `toggleAuditPanel` | `toggleAudit()` | L1 |
| `toggleLibraryPanel` | `toggleLibrary()` | L1 |
| `toggleCategoryPanel` | `toggleCategoryPanel()` | L1 |
| `toggleLayerPanel` | `toggleLayerPanel()` | L1 |
| `toggleExportMenu` | `toggleExportMenu()` | L1 |
| `togglePhysics` | `togglePhysics()` | L2 |
| `fitGraphToView` | `fitGraph()` | L2 |
| `resetGraphView` | `resetGraph()` | L2 |
| `toggleDetailsPanel` | `toggleSidebar()` | L2 |
| `setViewMode:graph` | `switchToGraphTab()` | L3-context |
| `setViewMode:ds-cascade` | `switchToDSCascadeTab()` | L3-context |
| `setViewMode:mermaid` | `switchToMermaidTab()` | L3-context |
| `setViewMode:mindmap` | `switchToMindmapTab()` | L3-context |
| `noop` | (separator) | L3-context |
| `toggleBacklogPanel` | `toggleBacklogPanel()` | L3-context |
| `toggleMermaidEditor` | `toggleMermaidEditor()` | L3-context |
| `toggleDSPanel` | `toggleDSPanel()` | L3-admin |
| `toggleTokenMapPanel` | `toggleAdminPanel()` | L3-admin |
| `noop` | (separator) | L3-admin |
| `togglePFCPFIMode` | `toggleContextMode()` | L3-admin |
| `selectPFIInstance` | `selectInstance(value)` | L3-admin |
| `selectBrandVariant` | `switchDSBrand(value)` | L3-admin |
| `togglePFILifecyclePanel` | `togglePFILifecycle()` | L3-admin |
| `showSnapshotManager` | `showSnapshotManager()` | L3-admin |
| `toggleSkeletonPanel` | `toggleSkeletonPanel()` | L3-admin |

---

## 7. Test Plan

| # | Test | File | Phase |
|---|------|------|-------|
| T1 | `renderDynamicNavBar` creates `.nav-layer` divs for each layer | `app-skeleton-loader.test.js` | 1 |
| T2 | Items within a layer are ordered by `ds:renderOrder` | `app-skeleton-loader.test.js` | 1 |
| T3 | `wireAction` attaches click handler from ACTION_REGISTRY | `app-skeleton-loader.test.js` | 1 |
| T4 | Parameterised actions (`setViewMode:graph`) pass param correctly | `app-skeleton-loader.test.js` | 1 |
| T5 | Separator items render as `.nav-separator` spans | `app-skeleton-loader.test.js` | 1 |
| T6 | `updateSkeletonVisibility` shows/hides items by condition | `app-skeleton-loader.test.js` | 2 |
| T7 | Toggle items reflect `aria-pressed` state on click | `app-skeleton-loader.test.js` | 2 |
| T8 | Chip items show active class for current view mode | `app-skeleton-loader.test.js` | 2 |
| T9 | PFI cascade adds L4 items to dynamic bar | `app-skeleton-loader.test.js` | 3 |
| T10 | PFI cascade L5+ layer renders after L4 | `app-skeleton-loader.test.js` | 3 |
| T11 | PFC items cannot be deleted by PFI override (BR-DS-013) | `app-skeleton-loader.test.js` | 3 |
| T12 | Skeleton editor reorder reflects in dynamic bar | `app-skeleton-editor.test.js` | 3 |
| T13 | Feature parity — every static button has a dynamic equivalent | `app-skeleton-loader.test.js` | 4 |
| T14 | Static toolbar removal doesn't break any test | all test files | 4 |

---

## 8. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Action name mismatch | Button click does nothing | Phase 1 logs unmapped actions to console; test T3 validates all 26 |
| Missing NavItems in JSONLD | Dynamic bar has fewer buttons than static | Phase 4 audit adds all missing items before switching over |
| Select/Dropdown items need dynamic options | Instance picker, brand picker have no options | Action handlers populate select options at runtime (same as current static approach) |
| Visibility condition evaluation is unsafe | XSS via crafted skeleton | Existing `evaluateCondition()` uses safe subset — only `state.*` property access |
| Z2-dyn renders wrongly on small screens | Layout breaks | Copy existing `.toolbar` responsive CSS; `.nav-layer` uses `flex-wrap` |
| PFI override adds conflicting layer IDs | Duplicate layers | `mergeSkeletonCascade` already handles `@id` dedup |

---

## 9. What Gets Deleted (Phase 4)

### HTML (browser-viewer.html)
- `<div class="toolbar">` — lines 24-91 (entire static toolbar)
- `<div class="context-toggle">` — line 82 (already dead)
- `<div class="instance-picker">` — line 83 (already dead)
- `<div class="context-identity-bar">` — lines 153-158 (already dead)

### JavaScript (app-skeleton-editor.js)
- `NAV_ITEM_DOM_MAP` — lines 457-477 (bridge map, obsolete)
- `applySkeletonNavOrder()` — lines 489-540+ (static DOM reordering, obsolete)

### JavaScript (app.js)
- All inline `onclick` wiring that referenced static button IDs
- Legacy context-toggle/instance-picker functions

---

## 10. Priority & Dependencies

```
Phase 1 (Action Registry + Dynamic Rendering)
  ├── No blockers — can start immediately
  ├── Deliverable: Z2-dyn renders 26 items, all clickable
  └── Dev toggle to show/hide alongside Z2

Phase 2 (Visibility Engine + State Sync)
  ├── Depends on: Phase 1
  ├── Deliverable: Conditional items, toggle states, active tabs
  └── Z2-dyn is functionally equivalent to Z2 for core actions

Phase 3 (PFI Cascade Integration)
  ├── Depends on: Phase 2
  ├── Deliverable: BAIV override adds L4/L5 items
  └── Skeleton editor edits reflect in Z2-dyn

Phase 4 (Prove and Replace)
  ├── Depends on: Phase 3 + full feature parity audit
  ├── Deliverable: Delete static toolbar, rename Z2-dyn → Z2
  └── All 938+ tests pass, no regressions
```

---

## 11. Cross-References

- **Skeleton data**: `ontology-library/PE-Series/DS-ONT/instance-data/pfc-app-skeleton-v1.0.0.jsonld`
- **BAIV override**: `ontology-library/PE-Series/DS-ONT/instance-data/baiv-app-skeleton-v1.0.0.jsonld`
- **Skeleton loader**: `js/app-skeleton-loader.js` — `parseAppSkeleton()`, `renderNavFromSkeleton()`, `createNavItemElement()`, `updateSkeletonVisibility()`
- **Skeleton panel**: `js/app-skeleton-panel.js` — Z22 inspector
- **Skeleton editor**: `js/app-skeleton-editor.js` — `NAV_ITEM_DOM_MAP` (to be deleted), `applySkeletonNavOrder()` (to be deleted)
- **Static toolbar HTML**: `browser-viewer.html` lines 24-91 (to be deleted)
- **Tests**: `tests/app-skeleton-{loader,panel,editor}.test.js` (121 tests)
- **DS-ONT schema**: `ontology-library/PE-Series/DS-ONT/ds-v2.0.0-oaa-v6.json`
