# Architecture Delta — Epic 40: Graphing Workbench Evolution

**Date:** 2026-03-02 | **Epic:** 40 (#577) | **Version:** 5.8.0

---

## Summary

Epic 40 evolved the Ontology Visualiser from a single-purpose graph viewer into a multi-layer graphing workbench with 7 view modes, skeleton-driven navigation, a 4-tier design system cascade, and a composition engine. This delta documents the 10 new modules, 3 new ADRs, and the key architectural changes introduced across 22 features.

---

## 1. New Modules (10)

| Module | Lines | Feature | Purpose |
|--------|-------|---------|---------|
| `js/decision-tree.js` | ~1,200 | F40.1 | Extensibility decision engine — 7 hypothesis gates, 12 terminal recommendations, vis-network graph, scoring panel |
| `js/design-token-tree.js` | 1,797 | F40.6 | Admin DS browser — 3-view panel (By Zone, By Category, By Component), live CSS values, zone overlay |
| `js/token-inheritance.js` | ~600 | F40.8 | 4-tier cascade resolution engine (Core → Instance → Product → App), override tracking, hardcoded detection |
| `js/ds-codegen.js` | ~500 | F40.12 | CSS transcription & code generation, LLM prompt pipeline for design-to-code |
| `js/pfi-lifecycle-ui.js` | ~400 | F40.17 | PFI lifecycle workbench — 10-step pipeline UI, step status tracking, skeleton-driven panels |
| `js/nav-action-registry.js` | 154 | F40.17b/F40.20 | Action dispatch — maps 26 skeleton `ds:action` strings to JS handler functions, parameterised actions via colon syntax |
| `js/skeleton-graph.js` | ~690 | F40.22 | vis-network hierarchical graph for skeleton inspection, 9 CRUD mutations, context menus, floating toolbar |
| `js/skill-builder.js` | 718 | F40.24 | Process-to-skill/plugin/agent template scaffolding, signal extraction, 12 scaffold generators, Mermaid export |
| `js/global-search.js` | ~517 | F40.25 | Command palette search — flat index across all loaded data, scored substring matching, categorised results |
| `js/registry-browser.js` | 496 | F40.3 | Full-screen registry browser — series tree, type/series filters, cascade tier badges, PFI instance cards |

## 2. Modified Modules (Significant Changes)

| Module | Features | Change Summary |
|--------|----------|---------------|
| `js/app.js` | F40.3, F40.17b, F40.19, F40.20, F40.22, F40.25 | +7 view modes (from 3), `renderDynamicNavBar()`, `setViewMode()` expanded, window bindings for all new panels |
| `js/app-skeleton-loader.js` | F40.13, F40.17, F40.17b, F40.18, F40.21 | Parser, renderer, action wiring, state sync, PFI cascade merge, scope rule loading |
| `js/app-skeleton-editor.js` | F40.22 | 9 CRUD mutations (addNavItem, removeNavItem, addDropdownChild, etc.), undo/redo, persistence, cascade-tier guards |
| `js/app-skeleton-panel.js` | F40.17, F40.22 | Z22 Skeleton Inspector — 4 tabs (Zones, Functions, Nav Layers, Properties), edit mode |
| `js/emc-composer.js` | F40.19 | `constrainToInstanceOntologies()`, 11 CATEGORY_COMPOSITIONS (added FULFILMENT + SECURITY), two-layer PFI filter |
| `js/composition-filter.js` | F40.19, F40.23 | Ghost node rendering, scope transparency, edge differentiation |
| `js/mermaid-viewer.js` | F40.3, F40.17b | `switchToOntologyMode()` updated to hide DT + RB containers |
| `js/ds-loader.js` | F40.6, F40.8, F40.13 | DS-ONT instance loader expanded for zone token bindings, component registry |
| `browser-viewer.html` | F40.3, F40.17b, F40.22 | Added `decision-tree-container`, `registry-browser-container`, `skeleton-graph-container`, 3 dynamic nav bar zones |
| `css/viewer.css` | All | +220 lines registry browser, +nav-chip/nav-layer/nav-dropdown styles, +skeleton-graph styles, +decision-tree styles |

## 3. Architecture Patterns Introduced

### 3.1 Skeleton-Driven Navigation (F40.17b, F40.20)

**Before:** Hardcoded HTML toolbar with 50+ buttons in `browser-viewer.html`.

**After:** All navigation items defined in `pfc-app-skeleton-v1.0.0.jsonld` as JSON-LD entities (62 Action entities, 60 NavItems across 6 layers). The `renderDynamicNavBar()` pipeline wipes 3 DOM containers and rebuilds from skeleton data on every state change. `nav-action-registry.js` maps action strings to JS handlers.

**Data flow:**
```
JSONLD skeleton → parseAppSkeleton() → buildSkeletonRegistries()
    → renderDynamicNavBar() → renderNavFromSkeleton() → wireAction()
        → syncDynamicNavState()
```

**Dead code removed:** `ACTION_REGISTRY`, `ZONE_DOM_SELECTORS`, `NAV_ITEM_DOM_MAP`, `applySkeletonNavOrder()`, entire `<div class="toolbar">` HTML.

### 3.2 View Mode System (F40.1, F40.3, F40.22, F40.25)

**Before:** 3 view modes (graph, mermaid, mindmap).

**After:** 7 view modes. Each view mode follows a standard pattern:
1. Container `<div>` in `browser-viewer.html` (display: none by default)
2. `_switchTo*Mode()` function in `app.js` (hides peers, shows self)
3. Case in `setViewMode()` dispatcher
4. Toolbar config in `_setToolbarButtonsForView()`
5. Nav chip entry in skeleton JSONLD (L3-context layer)
6. Action entity for chip click handler

| View Mode | Container | Feature |
|-----------|-----------|---------|
| graph | `#network` | Original |
| mermaid | `#mermaid-container` | Original |
| mindmap | `#mindmap-canvas` | Original |
| skeleton | `#skeleton-graph-container` | F40.22 |
| ds-cascade | (inline panel) | F40.6 |
| decision-tree | `#decision-tree-container` | F40.1 |
| registry-browser | `#registry-browser-container` | F40.3 |

### 3.3 Two-Layer PFI Filtering (F40.19)

**Pattern:** Categories define the broad ontology universe; `instanceOntologies` (from registry) narrows to what the PFI instance needs. Foundation dependencies render as ghost nodes with visual distinction (dashed borders, reduced opacity).

```
composeMultiCategory(categories)           → broad universe
constrainToInstanceOntologies(result, [])  → PFI-specific subset
```

### 3.4 Design System Cascade (F40.6–F40.14)

**4-tier cascade resolution:** Core → Instance → Product → App. Each tier inherits tokens from its parent and can override specific values. The `token-inheritance.js` engine resolves the cascade chain and tracks which tier provides each token value. Override detection identifies hardcoded values that should reference tokens.

### 3.5 AI Skeleton Template System (F40.21)

**Pattern:** Parameterised template (`{{placeholder}}`, `@if`, `@each` syntax) with VSOM-to-Skeleton mapping rules. Claude prompt guide provides 11-step instructions for generating PFI skeletons from VSOM briefs. Template variables drive zone, nav item, and component generation counts.

---

## 4. Dependency Graph (Epic 40 modules)

```
app.js (orchestrator)
├── decision-tree.js          standalone view
├── registry-browser.js       standalone view
├── skeleton-graph.js ───────► app-skeleton-editor.js ──► app-skeleton-loader.js
├── global-search.js          standalone (indexes all loaded data)
├── skill-builder.js ────────► decision-tree.js (extends Dtree with scaffolding)
├── pfi-lifecycle-ui.js ─────► app-skeleton-panel.js
├── nav-action-registry.js    standalone (action dispatch map)
├── design-token-tree.js ────► token-inheritance.js ──► ds-loader.js
├── ds-codegen.js ───────────► design-token-tree.js
└── emc-composer.js           standalone (composition engine)
    └── composition-filter.js  (ghost nodes, scope transparency)
```

---

## 5. New ADRs

See ADR-LOG.md entries ADR-014, ADR-015, ADR-016 (appended in this close-out).

| ADR | Title | Key Decision |
|-----|-------|-------------|
| ADR-014 | Skeleton-Driven Navigation | All nav from JSONLD, no hardcoded toolbar |
| ADR-015 | Two-Layer PFI Instance Filtering | Categories + instanceOntologies constraint |
| ADR-016 | View Mode Extensibility Pattern | Standard 6-step pattern for adding views |

---

## 6. Data Flow Changes

### New Data Sources

| Source | Module | Feature |
|--------|--------|---------|
| `pfc-app-skeleton-v1.0.0.jsonld` | app-skeleton-loader.js | F40.13 |
| `pfi-app-skeleton-template-v1.0.0.jsonld` | (template for AI generation) | F40.21 |
| `dice-app-skeleton-v1.0.0.jsonld` | app-skeleton-loader.js | F40.21 |
| `baiv-app-skeleton-v1.0.0.jsonld` | app-skeleton-loader.js | Pre-existing |
| EMC InstanceConfiguration `instanceDataFiles` | emc-composer.js | F40.18 |
| EMC `instanceOntologies` array | emc-composer.js | F40.19 |

### New State Fields

| Field | Module | Feature |
|-------|--------|---------|
| `state.activeView` | state.js | F40.17b |
| `state.appSkeleton` | state.js | F40.13 |
| `state.navLayerRegistry` | state.js | F40.17b |
| `state.zoneRegistry` | state.js | F40.17b |
| `state.actionIndex` | state.js | F40.17b |
| `state.zoneDomSelectors` | state.js | F40.17b |
| `state.skeletonEditMode` | state.js | F40.22 |
| `state.skeletonUndoStack` | state.js | F40.22 |

---

*Architecture Delta — Epic 40 Close-Out*
*Azlan-EA-AAA / PBS / TOOLS / ontology-visualiser*
