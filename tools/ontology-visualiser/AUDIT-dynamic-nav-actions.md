# Dynamic Navigation — Action Registry Audit

**Date:** 2026-02-24 | **Commit:** 0249925 | **Feature:** F40.20 (DS-ONT v3.0.0) | **Issue:** #669

> **DS-ONT v3.0.0:** The manual `ACTION_REGISTRY` in app.js has been **deleted**. All 62 actions are now `ds:Action` ontology entities in the skeleton JSONLD (`pfc-app-skeleton-v1.0.0.jsonld`). The runtime resolves actions via `state.actionIndex` built from ontology data. Guard conditions, accessibility hints, state bindings, and `triggersSyncAfter` are all declared in the ontology. Adding a new button = adding JSONLD data + a `window` function export — zero registry edits.

---

## Button Label → Action → Function Map

The primary audit table. Every clickable UI element mapped to its `ds:Action` entity and the `window[functionRef]` it resolves to.

### Z2-dyn: Main Toolbar

#### L1 — Main Capabilities

| Button Label | Type | Action Name | JS Function | Show When |
|-------------|------|-------------|-------------|-----------|
| **Ontology** | Dropdown | `toggleOntologyMenu` | `toggleLibrary()` | Always |
| **OAA Audit** | Button | `toggleAuditPanel` | `toggleAudit()` | Always |
| **Library** | Button | `toggleLibraryPanel` | `toggleLibrary()` | Always |
| **Categories** | Button | `toggleCategoryPanel` | `toggleCategoryPanel()` | Always |
| **Layers** | Button | `toggleLayerPanel` | `toggleLayerPanel()` | Always |
| **Export** | Dropdown | `noop` | (self-toggle) | Always |
| ↳ PNG Image | Sub-item | `exportPNG` | `exportPNG()` | — |
| ↳ SVG Image | Sub-item | `exportSVG` | `exportSVG()` | — |
| ↳ Mermaid Diagram | Sub-item | `exportMermaid` | `exportMermaid()` | — |
| ↳ D3.js JSON | Sub-item | `exportD3JSON` | `exportD3JSON()` | — |
| ↳ Neo4j Cypher | Sub-item | `exportCypher` | `exportCypher()` | — |
| ↳ Validation Report (MD) | Sub-item | `exportGateReport` | `exportGateReport()` | — |
| ↳ Audit Report (JSON) | Sub-item | `exportAuditFile` | `exportAuditFile()` | — |
| ↳ Full Report (PDF) | Sub-item | `exportPDF` | `exportPDF()` | — |
| ↳ Compare Versions... | Sub-item | `showDiffModal` | `showDiffModal()` | — |
| ↳ DS Bundle (JSON) | Sub-item | `downloadDSBundle` | `downloadDSBundle()` | — |
| **Glossary** | Button | `toggleGlossary` | `showGlossaryEditor()` | Always |
| **Open File** | Button | `openFileDialog` | clicks `#file-input` | Always |
| **GitHub** | Button | `loadFromGitHub` | `loadFromGitHub()` | Always |
| **Load URL** | Button | `loadFromURL` | `showURLModal()` | Always |
| **Load Registry** | Button | `loadFromRegistry` | `loadRegistry()` | Always (auto-fires at boot) |
| **+ New** | Button | `createNewOntology` | `showCreateOntologyModal()` | Always |
| **Fork** | Button | `forkOntology` | `showForkModal()` | Always (guards: no data → alert) |
| **Save** | Button | `saveToLibrary` | `showSaveToLibrary()` | Authoring mode |

#### L2 — View Controls

| Button Label | Type | Action Name | JS Function | Show When |
|-------------|------|-------------|-------------|-----------|
| **Physics** | Toggle | `togglePhysics` | `togglePhysics()` + `_syncDynNav()` | Graph view |
| **Fit View** | Button | `fitGraphToView` | `fitGraph()` | Graph view |
| **Reset View** | Button | `resetGraphView` | `resetGraph()` | Graph view |
| **Details** | Button | `toggleDetailsPanel` | `toggleSidebar()` | Always |
| **Layout** | Select | `changeLayout` | `changeLayout(param)` | Graph view |
| **Fit** | Button | `fitMermaidToView` | `fitMermaid()` | Mermaid view |

#### L3-context — View Tabs + Context

| Button Label | Type | Action Name | JS Function | Show When |
|-------------|------|-------------|-------------|-----------|
| **Graph** | Chip | `switchToGraphTab` | `switchToGraphTab()` | Always |
| **DS Cascade** | Chip | `switchToDSCascadeTab` | `switchToDSCascadeTab()` | Always |
| **Mermaid** | Chip | `switchToMermaidTab` | `switchToMermaidTab()` | Always |
| **Mindmap** | Chip | `switchToMindmapTab` | `switchToMindmapTab()` | Always |
| — | Separator | `noop` | — | Always |
| **Backlog** | Button | `toggleBacklogPanel` | `toggleBacklogPanel()` | Always |
| **Mermaid Edit** | Button | `toggleMermaidEditor` | `window.toggleMermaidEditor()` | Mermaid view |

#### L3-admin — Admin & Config

| Button Label | Type | Action Name | JS Function | Show When |
|-------------|------|-------------|-------------|-----------|
| **DS Tokens** | Button | `toggleDSPanel` | `toggleDSPanel()` | Always |
| **Token Map** | Button | `toggleTokenMapPanel` | `toggleAdminPanel()` | Always |
| — | Separator | `noop` | — | Always |
| **PFC/PFI** | Toggle | `togglePFCPFIMode` | toggles `state.isPFIMode` + `_syncDynNav()` | Always |
| **Instance** | Select | `selectPFIInstance` | `selectPFIInstance(value)` | PFI mode |
| **Brand** | Select | `selectBrandVariant` | `switchDSBrand(value)` | PFI mode |
| **Lifecycle** | Button | `togglePFILifecyclePanel` | `togglePFILifecyclePanel()` | PFI mode |
| **Snapshots** | Button | `showSnapshotManager` | `showSnapshotManager()` | PFI mode |
| **Skeleton** | Button | `toggleSkeletonPanel` | `toggleSkeletonPanel()` | Always |
| **Upgrade OAA** | Button | `runOAAUpgrade` | `runOAAUpgrade()` | Authoring mode |
| **GitHub Settings** | Button | `showGitHubSettings` | `showGitHubSettings()` | Always |
| **Test Data** | Button | `loadTestData` | `loadTestDataFile()` | Always |

---

### Z4: Authoring Bar (L5-authoring) — visible when authoring mode active

| Button Label | Type | Action Name | JS Function | State Sync |
|-------------|------|-------------|-------------|------------|
| **+ Entity** | Button | `showEntityEditor` | `showEntityEditor()` | — |
| **+ Relationship** | Button | `showRelationshipEditor` | `showRelationshipEditor()` | — |
| **Undo** | Button | `doUndo` | `doUndo(renderGraph)` | Disabled when undo stack empty |
| **Redo** | Button | `doRedo` | `doRedo(renderGraph)` | Disabled when redo stack empty |
| **New Revision** | Button | `showVersionBumpModal` | `showVersionBumpModal()` | — |
| **History** | Button | `showRevisionHistory` | `showRevisionHistoryPanel()` | — |
| **Glossary** | Button | `showGlossaryEditor` | `showGlossaryEditor()` | — |
| **Save** | Button | `saveAuthoredOntology` | `showSaveWithValidation()` | — |
| **Generate with AI** | Button | `showGenerationModal` | `showGenerationModal()` | — |
| **Selection** | Toggle | `toggleSelectionMode` | `toggleSelectionMode()` + `_syncDynNav()` | aria-pressed syncs |
| **Exit Authoring** | Button | `exitAuthoringMode` | `exitAuthoringMode()` + `_syncDynNav()` | Styled red/warning |

---

### Z4b: Selection Bar (L6-selection) — visible when selection mode active

| Button Label | Type | Action Name | JS Function | Notes |
|-------------|------|-------------|-------------|-------|
| **Select All** | Button | `selectAllNodes` | `selectAllNodes()` | — |
| **Clear** | Button | `clearSelection` | `clearSelection()` + `_syncDynNav()` | — |
| **Export JSON** | Button | `exportSelectionJSON` | inline: validates selection, exports JSON-LD blob | Guards: alerts if no selection |
| **Save Selection** | Button | `showSaveSelectionModal` | `showSaveSelectionModal()` | — |

---

## Boot Sequence

On `DOMContentLoaded` the app runs the following automatically (no user click required):

| Step | Function | Purpose |
|------|----------|---------|
| 1 | `loadAppSkeletonFresh()` | Fetches JSONLD skeleton (bypasses localStorage cache), renders dynamic nav bar |
| 2 | `loadRegistry()` | Loads unified registry (all 45 ontologies), builds merged graph, displays it |

The user lands on a ready-to-use app with the full ontology registry already loaded and the graph rendered.

---

## Utility Actions (No Dedicated NavItem)

These `ds:Action` entities serve infrastructure roles — separators, dropdown triggers, or aliases:

| Action Entity | functionRef | Purpose |
|---------------|-------------|---------|
| `ds:action-noop` | `noop` | Used by separators + dropdown trigger |
| `ds:action-toggleOntologyMenu` | `toggleLibrary` | Wired to Ontology dropdown trigger |

All 13 export sub-items (`exportPNG`, `exportSVG`, etc.) are wired to the Export dropdown children, not standalone buttons.

---

## Totals

| Metric | Count |
|--------|-------|
| `ds:Action` entities in skeleton | 62 |
| NavItems in skeleton | 60 (+ 13 export sub-items = 73 clickable) |
| Zones used | 3 (Z2-dyn, Z4, Z4b) |
| NavLayers | 6 (L1, L2, L3-context, L3-admin, L5-authoring, L6-selection) |
| Buttons | 45 |
| Toggles | 4 (Physics, PFC/PFI, Selection, Mermaid Edit) |
| Chips | 4 (Graph, DS Cascade, Mermaid, Mindmap) |
| Dropdowns | 2 (Ontology, Export) |
| Selects | 3 (Layout, Instance, Brand) |
| Separators | 2 |
| Guard-protected actions | 2 (forkOntology, exportSelectionJSON) |
| triggersSyncAfter actions | 6 (physics, PFC/PFI, selection, exit authoring, clear selection, mermaid edit) |
