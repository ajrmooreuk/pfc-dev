# Navigation Architecture Reference

**Version:** 2.0.0 | **Date:** 2026-02-25 | **Status:** Live (F40.17b + F40.20 + F40.22)

The PFC Graph Workbench uses **ontology-driven navigation** — every button, toggle, chip, dropdown, and select in the toolbar is defined in a JSON-LD skeleton file, rendered dynamically at runtime, and editable via the Skeleton Inspector panel. There is no hardcoded toolbar HTML.

---

## 1. Data Flow

```
pfc-app-skeleton-v1.0.0.jsonld
        |
        v
  parseAppSkeleton()             splits @graph into typed arrays
        |
        v (optional PFI override)
  mergeSkeletonCascade()          BR-DS-013: PFC items immutable at PFI tier
        |
        v
  buildSkeletonRegistries()       populates 4 state registries:
        |                           navLayerRegistry   Map<layerId, {layer, items[]}>
        |                           zoneRegistry       Map<zoneId, {zone, components[]}>
        |                           actionIndex        Map<@id, Action entity>
        |                           zoneDomSelectors   Map<zoneId, CSS selector>
        v
  renderDynamicNavBar()           wipes 3 containers, builds zoneContainerMap
        |
        v
  renderNavFromSkeleton()         per layer: creates <div.nav-layer> routed to zone container
        |                         per item:  createNavItemElement() + wireAction()
        v
  syncDynamicNavState()           chips, toggles, visibility conditions, disabled states
```

Every editor mutation calls `_apply()` which re-runs this entire pipeline.

---

## 2. Zone Architecture

### 2.1 Toolbar Zones (nav-bearing)

These three zones host navigation layers and are the targets for `moveLayerToZone()`:

| Zone | DOM Selector | Visibility | Purpose |
|------|-------------|------------|---------|
| **Z2** | `#dynamic-nav-bar` | Always visible | Primary toolbar — L1 through L4 |
| **Z4** | `#dynamic-authoring-bar` | `state.authoringMode === true` | Authoring tools — L5 |
| **Z4b** | `#dynamic-selection-bar` | `state.selectedNodes.length > 0` | Selection tools — L6 |

Z4 and Z4b auto-collapse via CSS `:empty { display: none }` when they contain no layers with items.

### 2.2 All Zones (22)

```
Z1   Header              Fixed       top          always visible
Z2   Toolbar             Fixed       top          always visible        <-- NAV
Z2-dyn Dynamic Nav Bar   Fixed       top          state.dynamicNavEnabled (reserved)
Z3   Context Identity    Conditional top          state.isPFIMode       (PFI tier)
Z4   Authoring Toolbar   Conditional top          state.authoringMode   <-- NAV
Z4b  Selection Toolbar   Conditional top          selectedNodes > 0     <-- NAV
Z5   Breadcrumb Bar      Conditional top          breadcrumbPath > 0
Z6   Graph Canvas        Fixed       center       always visible
Z7   Legend              Floating    bottom-left   toggled
Z8   Layer Panel         Floating    bottom-right  toggled
Z9   Sidebar Details     Sliding     right         toggled
Z10  Audit Panel         Sliding     left          toggled
Z11  Library Panel       Sliding     right         toggled
Z12  DS Panel            Sliding     left          toggled
Z13  Backlog Panel       Sliding     right         toggled
Z14  Mermaid Editor      Sliding     left          state.currentView === 'mermaid'
Z15  Mindmap Properties  Sliding     right         state.currentView === 'mindmap'
Z16  Context Drawer      Sliding     right         state.isPFIMode       (PFI tier)
Z17  Category Panel      Sliding     right         toggled
Z18  Modal/Dialog        Overlay     center        on demand
Z19  Tooltip/Hover       Overlay     cursor        on demand
Z20  Drop Zone           Conditional center        isDragOver || ontologyCount===0
Z21  PFI Lifecycle Panel Sliding     left          state.isPFIMode
Z22  Skeleton Inspector  Sliding     left          toggled
```

---

## 3. Layer Hierarchy

```
Z2 ─ Primary Toolbar (#dynamic-nav-bar)
 |
 ├── L1    Main Capabilities     renderOrder 1   PFC   14 items
 ├── L2    View Controls         renderOrder 2   PFC    6 items
 ├── L3c   Context/Mode          renderOrder 3   PFC    9 items
 ├── L3a   Admin/Config          renderOrder 4   PFC   12 items
 └── L4    PFI Custom            renderOrder 5   PFI    0 items (PFI-injected)

Z4 ─ Authoring Toolbar (#dynamic-authoring-bar)
 |
 └── L5    Authoring Tools       renderOrder 6   PFC   11 items

Z4b ─ Selection Toolbar (#dynamic-selection-bar)
 |
 └── L6    Selection Tools       renderOrder 7   PFC    4 items
```

Layers within a zone are separated by a 1px left border. Items within a layer are rendered left-to-right by `ds:renderOrder`.

---

## 4. Nav Item Catalogue

### L1 — Main Capabilities (14 items, Z2)

| # | Label | Type | Action | Notes |
|---|-------|------|--------|-------|
| 1 | Ontology | Dropdown | toggleOntologyMenu | |
| 2 | OAA Audit | Button | toggleAuditPanel | Ctrl+Shift+A |
| 3 | Library | Button | toggleLibraryPanel | Ctrl+Shift+L |
| 4 | Categories | Button | toggleCategoryPanel | |
| 5 | Layers | Button | toggleLayerPanel | |
| 6 | Export | Dropdown | noop | 13 children (PNG, SVG, Mermaid, D3, Cypher, reports, diff, DS bundle) |
| 7 | Glossary | Button | toggleGlossary | |
| 8 | Open File | Button | openFileDialog | |
| 9 | GitHub | Button | loadFromGitHub | |
| 10 | Load URL | Button | loadFromURL | |
| 11 | Load Registry | Button | loadFromRegistry | |
| 12 | + New | Button | createNewOntology | |
| 13 | Fork | Button | forkOntology | Guard: `state.currentData != null` |
| 14 | Save | Button | saveToLibrary | Visible only in authoring mode |

### L2 — View Controls (6 items, Z2)

| # | Label | Type | Action | Visible When |
|---|-------|------|--------|-------------|
| 1 | Physics | Toggle | togglePhysics | graph view |
| 2 | Fit View | Button | fitGraphToView | graph view |
| 3 | Reset View | Button | resetGraphView | graph view |
| 4 | Details | Button | toggleDetailsPanel | always |
| 5 | Layout | Select | changeLayout | graph view |
| 6 | Fit | Button | fitMermaidToView | mermaid view |

### L3-context — Context/Mode (9 items, Z2)

| # | Label | Type | Action | Binding |
|---|-------|------|--------|---------|
| 1 | Graph | Chip | switchToGraphTab | graph |
| 2 | DS Cascade | Chip | switchToDSCascadeTab | ds-cascade |
| 3 | Mermaid | Chip | switchToMermaidTab | mermaid |
| 4 | Mindmap | Chip | switchToMindmapTab | mindmap |
| 5 | Skeleton | Chip | switchToSkeletonTab | skeleton |
| 6 | Decision Tree | Chip | switchToDecisionTreeTab | decision-tree |
| 7 | --- | Separator | noop | |
| 8 | Backlog | Button | toggleBacklogPanel | |
| 9 | Mermaid Edit | Button | toggleMermaidEditor | mermaid view |

### L3-admin — Admin/Config (12 items, Z2)

| # | Label | Type | Action | Visible When |
|---|-------|------|--------|-------------|
| 1 | DS Tokens | Button | toggleDSPanel | always |
| 2 | Token Map | Button | toggleTokenMapPanel | always |
| 3 | --- | Separator | noop | |
| 4 | PFC/PFI | Toggle | togglePFCPFIMode | always |
| 5 | Instance | Select | selectPFIInstance | PFI mode |
| 6 | Brand | Select | selectBrandVariant | PFI mode |
| 7 | Lifecycle | Button | togglePFILifecyclePanel | PFI mode |
| 8 | Snapshots | Button | showSnapshotManager | PFI mode |
| 9 | Skeleton | Button | toggleSkeletonPanel | always |
| 10 | Upgrade OAA | Button | runOAAUpgrade | authoring mode |
| 11 | GitHub Settings | Button | showGitHubSettings | always |
| 12 | Test Data | Button | loadTestData | always |

### L4 — PFI Custom (0 items at PFC tier, Z2)

Empty. PFI instances inject items here via the cascade merge. `cascadeTier: PFI`.

### L5 — Authoring Tools (11 items, Z4)

| # | Label | Type | Action |
|---|-------|------|--------|
| 1 | + Entity | Button | showEntityEditor |
| 2 | + Relationship | Button | showRelationshipEditor |
| 3 | Undo | Button | doUndo |
| 4 | Redo | Button | doRedo |
| 5 | New Revision | Button | showVersionBumpModal |
| 6 | History | Button | showRevisionHistory |
| 7 | Glossary | Button | showGlossaryEditor |
| 8 | Save | Button | saveAuthoredOntology |
| 9 | Generate with AI | Button | showGenerationModal |
| 10 | Selection | Toggle | toggleSelectionMode |
| 11 | Exit Authoring | Button | exitAuthoringMode |

### L6 — Selection Tools (4 items, Z4b)

| # | Label | Type | Action |
|---|-------|------|--------|
| 1 | Select All | Button | selectAllNodes |
| 2 | Clear | Button | clearSelection |
| 3 | Export JSON | Button | exportSelectionJSON |
| 4 | Save Selection | Button | showSaveSelectionModal |

---

## 5. Action Resolution

Every non-separator nav item has `ds:executesAction` pointing to an Action entity. The action resolution path:

```
NavItem['ds:executesAction']['@id']
  -> state.actionIndex.get(ref)
    -> Action entity
      -> ds:functionRef       e.g. "toggleAudit"
      -> window[functionRef]  e.g. window.toggleAudit
```

### Action Properties

| Property | Purpose |
|----------|---------|
| `ds:functionRef` | JS function name on `window` scope |
| `ds:parameterType` | `None` / `String` / `Select` |
| `ds:guardCondition` | JS expression evaluated before execution |
| `ds:guardMessage` | Alert shown when guard blocks |
| `ds:triggersSyncAfter` | Auto-calls `syncDynamicNavState()` after execution |
| `ds:accessibilityHint` | Applied as `aria-label` |
| `ds:allowedRoles` | RBAC: references RRR Role entities |
| `ds:governedByControl` | GRC: references Control entities for audit |

### Item Types to DOM

| `ds:itemType` | DOM Element | CSS Classes |
|--------------|------------|-------------|
| Button | `<button>` | `nav-item nav-button` |
| Toggle | `<button aria-pressed>` | `nav-item nav-toggle` |
| Dropdown | `<div>` + `<button>` + `<div.nav-dropdown-menu>` | `nav-item nav-dropdown-wrapper` |
| Select | `<select>` | `nav-item nav-select` |
| Chip | `<button>` | `nav-item nav-chip` |
| Separator | `<span>` | `nav-separator` |

---

## 6. Visibility & State Sync

### Visibility Conditions

Items with `ds:visibilityCondition` are shown/hidden by `evaluateCondition()`:

```javascript
// Safe evaluation: replaces state.prop tokens, wraps in Function()
evaluateCondition("state.currentView === 'graph'", stateSnapshot)
// -> JSON.stringify("graph") === 'graph' -> true
```

Fails open (returns `true` on parse error).

### State Bindings

| Item Type | Binding Effect |
|-----------|---------------|
| Chip | `.active` class when `binding === stateSnapshot.currentView` |
| Toggle | `aria-pressed` from `evaluateCondition(binding)` |
| Button | `disabled` from `evaluateCondition(binding)` |

### State Snapshot Fields

```
currentView, isPFIMode, physicsEnabled, authoringMode, selectionMode,
authoringUndoLength, authoringRedoLength, selectedNodes, breadcrumbPath,
isDragOver, ontologyCount
```

---

## 7. Cascade Tier System

```
PFC (Platform Core)  — Immutable base skeleton, ships with visualiser
  |
  v  mergeSkeletonCascade()
PFI (Platform Instance)  — Instance overrides (L4 items, brand tokens)
  |
  v
Product  — Product-level customisation
  |
  v
App  — Client app overrides
```

**BR-DS-013 CascadeImmutability:** PFI/Product/App tiers cannot modify `ds:cascadeTier: "PFC"` items. The merge silently skips conflicting overrides with `console.warn`.

**Admin bypass:** When `state.skeletonEditMode === true`, cascade-tier guards are bypassed in all editor mutation functions. This allows the platform admin to reorganise the PFC skeleton directly.

---

## 8. Skeleton Editor Mutations

All mutations: `pushSkeletonUndo()` -> mutate in-place -> `_apply()`.

The `_apply()` pipeline:
1. `buildSkeletonRegistries()` — rebuild all 4 registries
2. `window.renderDynamicNavBar()` — full DOM teardown and rebuild
3. `persistSkeletonToLocalStorage()` — safety net
4. `renderSkeletonPanel()` — update Z22 panel
5. `refreshSkeletonGraph()` — update skeleton graph view (if active)

### Nav Item Mutations

| Function | What It Does |
|----------|-------------|
| `reorderNavItem(itemId, 'up'/'down')` | Swaps renderOrder with adjacent sibling |
| `moveNavItemToLayer(itemId, targetLayerId)` | Changes layer, appends at end |
| `addNavItem(layerId, itemType, label)` | Creates new item with auto-ID |
| `removeNavItem(itemId)` | Deletes and re-sequences siblings |
| `updateNavItemProperty(itemId, prop, value)` | Direct property patch |

### Dropdown Mutations

| Function | What It Does |
|----------|-------------|
| `addDropdownChild(parentId, label, position?)` | Insert child at position or append |
| `removeDropdownChild(parentId, childIndex)` | Remove by index |
| `reparentDropdownChild(srcParent, idx, tgtParent)` | Move child between dropdowns |

### Layer & Zone Mutations

| Function | What It Does |
|----------|-------------|
| `moveLayerToZone(layerId, targetZoneId)` | Moves entire layer to different toolbar zone |
| `reorderZoneComponent(placementId, direction)` | Reorder component within zone |
| `moveZoneComponentToZone(placementId, targetZoneId)` | Move component to different zone |

### Action Mutations

| Function | What It Does |
|----------|-------------|
| `addActionEntity(actionData)` | Create new Action, requires `ds:functionRef` |
| `removeActionEntity(actionAtId)` | Delete Action, clears dangling refs |

### Persistence

| Method | Mechanism |
|--------|-----------|
| **Auto-persist** | `localStorage['oaa-viz-skeleton-edits']` after every `_apply()` |
| **Save to Library** | File System Access API -> writes to `PE-Series/DS-ONT/instance-data/` |
| **Export** | Browser download of `.jsonld` file |
| **Restore** | On app init, checks localStorage for pending edits |

### Undo/Redo

Snapshot-based: each mutation pushes a full `JSON.stringify(state.appSkeleton)` to the undo stack. Undo restores the snapshot and pushes current to redo. Entering edit mode captures a baseline snapshot for discard.

---

## 9. Editing Interfaces

### Z22 Skeleton Inspector Panel

4 tabs:
- **Zones** — read-only zone cards with type, position, visibility, condition
- **Functions** — zone-component list with reorder/move controls in edit mode
- **Nav Layers** — layer cards with item lists, zone dropdown, reorder/move controls
- **Properties** — detail view for currently selected skeleton graph node

Edit mode activated via "Edit" button -> `enterSkeletonEditMode()`. Shows:
- Dirty indicator (amber dot)
- Undo/Redo buttons
- Save/Download/Discard controls
- Per-item: drag handle, up/down arrows, layer select dropdown
- Per-layer: zone select dropdown (Z2/Z4/Z4b)
- Lock icon on PFC items (informational, not blocking)

### Skeleton Graph View (5th view tab)

vis-network hierarchical graph showing:
```
Application -> Zones -> Layers -> NavItems -> DropdownChildren -> Actions
```

Right-click context menus:
- **Layer**: Add Button/Toggle/Chip/Dropdown/Separator, Move to Zone...
- **NavItem**: Edit Properties, Move to Layer..., Delete
- **Zone**: Add Layer
- **Action**: Edit Properties, Delete

Floating toolbar: Actions toggle, UD/LR direction, Fit, Collapse, Expand, New, Export.

---

## 10. File Inventory

| File | Lines | Role |
|------|-------|------|
| `PE-Series/DS-ONT/instance-data/pfc-app-skeleton-v1.0.0.jsonld` | ~1200 | Skeleton data (JSONLD) |
| `PE-Series/DS-ONT/ds-v3.0.0-oaa-v6.json` | ~800 | DS-ONT schema (entity types, rules) |
| `js/app-skeleton-loader.js` | ~730 | Parser, renderer, action wiring, state sync |
| `js/app-skeleton-editor.js` | ~780 | CRUD mutations, undo/redo, persistence |
| `js/app-skeleton-panel.js` | ~690 | Z22 inspector panel UI |
| `js/skeleton-graph.js` | ~690 | vis-network graph view |
| `js/app.js` | ~5200 | `renderDynamicNavBar()`, skeleton graph callbacks |
| `js/state.js` | ~200 | State field definitions |
| `browser-viewer.html` | ~150 | DOM containers |
| `css/viewer.css` | ~700 | All nav and skeleton styles |

### Test Coverage

| Test File | Tests |
|-----------|-------|
| `tests/app-skeleton-loader.test.js` | 76 |
| `tests/app-skeleton-editor.test.js` | 84 |
| `tests/app-skeleton-panel.test.js` | 29 |
| `tests/skeleton-graph.test.js` | 37 |
| **Total skeleton tests** | **226** |
| **Total all tests** | **1801** |

---

## 11. EMC Nav Bar (Separate System)

The EMC cascade nav bar (`#emc-nav-bar`) is a **separate navigation system** not driven by the skeleton. It renders the PFC > PFI > Product > App cascade breadcrumb, scope chips, and persona chips from `state.pfiInstances`. It sits below the toolbar zones in the DOM and has its own CSS (`.emc-nav-bar`).

Do not confuse this with the skeleton-driven toolbar. The EMC nav bar is managed by `emc-nav-bar.js` and tested in `emc-nav-bar.test.js`.

---

## 12. Audit Panel Buttons (Separate System)

The OAA audit panel (`#audit-panel`, Z10) contains **three action buttons** that are controlled by `compliance-reporter.js`, NOT by the skeleton navigation system:

| Button ID | Label | Controlled By | Visible When |
| ----------- | ------- | --------------- | ------------- |
| `btn-run-oaa` | Upgrade with OAA v7 | `renderOAACompliancePanel()` | `validation.overall !== 'pass'` (warn or fail) |
| `btn-save-library` | Save to Library | `renderOAACompliancePanel()` | `validation.overall === 'pass'` |
| `btn-export-audit` | Export Report | `renderOAACompliancePanel()` | Always (after first validation) |

These buttons live inside the audit panel `<div>` in `browser-viewer.html` (not in a dynamic nav zone). They call `window.runOAAUpgrade()`, `window.showSaveToLibrary()`, and `window.exportAuditFile()` respectively.

> **Regression note (commit 149c99b):** These buttons were accidentally deleted during F40.20 Phase 4 (commit 732decb) when the static toolbar was removed. The JS guard `if (upgradeBtn)` silently swallowed the missing elements. The L3-admin "Upgrade OAA" button in the dynamic nav is a **separate control** — it appears only in authoring mode. The audit panel buttons appear based on compliance validation status regardless of authoring mode. Both systems must coexist.
