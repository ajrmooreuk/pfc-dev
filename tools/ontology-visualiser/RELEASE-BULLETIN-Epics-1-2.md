# Release Bulletin: Epics 1 & 2

**Date:** 2026-02-08
**Visualiser Version:** 4.2.0
**Scope:** Epic 1 (OAA 5.0.0 Verification) + Epic 2 (Sub-Ontology Connections)

---

## What's New

### Epic 1 — OAA 5.0.0 Verification (30 pts)

Gate verification tools that let you visually inspect whether an ontology passes the OAA v6.1.0 compliance gates.

| Feature | Description |
|---------|-------------|
| **Gate 2B badges** | PASS/FAIL badge for entity connectivity — isolated nodes get orange dashed borders |
| **Gate 2C badges** | PASS/WARN badge for graph connectivity — shows connected component count |
| **Density metrics** | Edge-to-node ratio with green/yellow/red traffic-light indicator |
| **Density threshold** | Configurable slider (default 0.8), persisted to browser storage |
| **Component colouring** | Each connected component gets a distinct colour (12-colour palette) |
| **Component filter** | Dropdown to isolate a single component for inspection |
| **Gate report export** | Download a full Markdown validation report |
| **Clipboard copy** | Copy gate summary table to clipboard for pasting into PRs |

### Epic 2 — Sub-Ontology Connections (16 pts)

Library browsing, dependency visualisation, drag-to-add, and foundation extension info.

| Feature | Description |
|---------|-------------|
| **Library panel (3 views)** | Registry / Dependencies / Saved tabs in the Library panel |
| **Registry view** | All 23 ontologies grouped by 6 series with compliance badges and search |
| **Dependency graph** | Mini vis-network showing ontology-level relationships (23 nodes) |
| **Drag-to-add** | Drag an ontology from the Library panel onto the graph canvas to load it |
| **Foundation extensions** | Details tab shows "Extended By" / "Extends Foundation" cross-ontology info |

---

## How to Use

### Gate Verification (Epic 1)

1. **Open** the visualiser and load any ontology (drag-drop, file picker, or GitHub)
2. The **compliance badge** appears in the header — click it or click **OAA Audit** to open the report
3. At the top of the audit panel, find the **OAA Gates Summary**:
   - **GATE 2B** — shows PASS (green) or FAIL (red) with isolated node count
   - **GATE 2C** — shows PASS or WARN with component count
   - **Density** — edge/node ratio with colour indicator
4. **Adjust the density threshold** using the slider (default 0.8)
5. **Toggle Component Colouring** to see each disconnected component in a distinct colour
6. **Filter by Component** using the dropdown to isolate one component
7. **Export Report** to download a Markdown validation report, or **Copy Results** for clipboard

### Library Panel (Epic 2)

1. Click the **Library** button (book icon) in the toolbar
2. **Registry tab** — browse all 23 ontologies grouped by series:
   - Use the **search box** to filter by name, namespace, or series
   - **Click** any ontology to load it into the graph
   - **Drag** an ontology onto the graph canvas to load it
   - Placeholder ontologies (dashed border) show an info modal instead of loading
3. **Dependencies tab** — view a mini graph of ontology relationships:
   - Gold edges = detected cross-references (with count labels)
   - Grey dashed edges = declared dependencies from registry
   - **Double-click** any node to load that ontology
4. **Saved tab** — browse locally saved ontologies:
   - Use **Export** / **Import** to transfer between browsers

### Foundation Extension Info (Epic 2)

1. Click **Load Registry** to enter multi-ontology mode
2. Drill into any ontology (Tier 2) by double-clicking through series > ontology
3. **Click a node** to open the Details sidebar
4. Look for the new extension sections at the bottom of the Details tab:
   - **Foundation entities** (e.g., from ORG, ORG-CONTEXT) show an **"Extended By"** section listing domain ontologies that reference this entity
   - **Domain entities** (e.g., from VE-Series) show an **"Extends Foundation"** section linking to the foundation entities they reference

---

## How to Test

### Prerequisites

- Open the hosted version or serve locally with `python -m http.server 8080`
- Have a `.json` ontology file ready (or use the built-in Load Registry)

### Epic 1 Test Checklist

| # | Test | Steps | Expected Result |
|---|------|-------|-----------------|
| 1 | Gate badges appear | Load any ontology > open OAA Audit | GATE 2B and GATE 2C badges visible at top of audit panel |
| 2 | Isolated node highlighting | Load an ontology with isolated nodes | Isolated nodes have orange dashed borders; GATE 2B shows FAIL with count |
| 3 | Density metrics | Load any ontology | Edge/node ratio shown with green, yellow, or red dot |
| 4 | Density threshold slider | Adjust slider in Gates Summary | Density indicator colour updates; value persists on page reload |
| 5 | Component colouring | Click "Component Colouring" toggle | Each connected component gets a distinct colour |
| 6 | Component filter | Select a component from dropdown | Only that component's nodes/edges are shown |
| 7 | Export report | Click "Export Report" | Markdown `.md` file downloads with gate results |
| 8 | Copy results | Click "Copy Results" | Gate summary table copied to clipboard (paste into a text editor to verify) |
| 9 | Compliant ontology | Load an ontology that passes all gates | Green "OAA v6.1.0 PASS" badge in header |
| 10 | Non-compliant ontology | Load an ontology that fails gates | Red "FAIL" badge; "Upgrade with OAA v6" button appears |

### Epic 2 Test Checklist

| # | Test | Steps | Expected Result |
|---|------|-------|-----------------|
| 1 | Library opens to Registry | Click Library button | Panel opens with Registry tab active, 6 series groups visible |
| 2 | Series grouping | Inspect Registry view | 23 ontologies in 6 collapsible series groups with colour dots |
| 3 | Compliance badges | Inspect items | 20 show "compliant" (green), 3 show "placeholder" (grey) |
| 4 | Search filter | Type "vsom" in search box | Only matching entries visible; non-matching series groups hidden |
| 5 | Click to load | Click any compliant ontology | Graph renders in single-ontology mode; file name appears in header |
| 6 | Click placeholder | Click a placeholder ontology | Info modal appears (no crash, no graph render) |
| 7 | Drag to load | Drag a compliant ontology onto graph canvas | Drop zone highlight appears on dragover; ontology loads on drop |
| 8 | Drag placeholder | Drag a placeholder onto graph canvas | Info modal appears (no crash) |
| 9 | Dependencies tab | Switch to Dependencies tab | Mini graph with 23 nodes appears; edges visible if registry was loaded |
| 10 | Dep graph interaction | Double-click a node in dep graph | That ontology loads; Library panel closes |
| 11 | Saved tab | Switch to Saved tab | Shows locally saved ontologies (or empty state); Export/Import buttons visible |
| 12 | Foundation "Extended By" | Load Registry > drill to Foundation > click ORG entity | "Extended By" section lists domain ontologies referencing this entity |
| 13 | Domain "Extends Foundation" | Load Registry > drill to VE-Series > click entity | "Extends Foundation" section lists foundation entities it references |
| 14 | No extension info in single mode | Load single ontology > click any node | No "Extended By" or "Extends Foundation" sections shown |

### Regression Checklist

| # | Test | Expected Result |
|---|------|-----------------|
| 1 | Drag-drop file loading | Graph renders, compliance badge appears |
| 2 | File picker loading | Same as drag-drop |
| 3 | Load from GitHub | Prompts for PAT, loads ontology |
| 4 | Load Registry (full) | 6 series super-nodes at Tier 0, drill-through works |
| 5 | Series highlight toggles | VE/PE/Foundation/etc. toggles colour nodes/edges correctly |
| 6 | Cross-refs Only filter | Hides intra-ontology edges |
| 7 | Bridge filter | Shows only bridge nodes (3+ ontology references) |
| 8 | Breadcrumb navigation | Back-navigation through all tiers |
| 9 | Export PNG | Downloads graph image |
| 10 | Save to Library / Load from Library | Round-trip save and load works |

### Automated Tests

```bash
cd PBS/TOOLS/ontology-visualiser
npx vitest run
```

Expected: **23/24 pass** (1 pre-existing failure: placeholder skip test)

---

## Known Limitations

- **Dependency graph edges** require Load Registry to have been run at least once (cross-edges are populated during batch load)
- **Foundation extension info** only appears in multi-ontology mode after Load Registry — not available in single-ontology mode
- **Drag-to-add** loads ontologies in single-ontology mode (not additive to an existing multi-graph)
- **Search filter** is client-side only — filters DOM elements, does not re-query the registry

---

## Files Changed

### Epic 1

| File | Changes |
|------|---------|
| `js/audit-engine.js` | `componentMap` generation during `auditGraph()` |
| `js/graph-renderer.js` | Component colouring, filtering, isolated node styling |
| `js/ui-panels.js` | OAA Gates summary panel, density slider, gate report export, clipboard copy |
| `js/state.js` | `densityThreshold`, `componentColoringActive`, `componentFilter`, `componentMap`, `COMPONENT_COLORS` |
| `css/viewer.css` | Gate badges, density indicators, component colouring styles |

### Epic 2

| File | Changes |
|------|---------|
| `js/app.js` | Library panel orchestration, drag-to-add, dependency graph renderer |
| `js/multi-loader.js` | `loadSingleOntologyFromRegistry()` |
| `js/ui-panels.js` | Foundation extension info (`findReferencingOntologies`, `findFoundationReferences`) |
| `js/state.js` | `libraryView`, `libraryDepNetwork` |
| `browser-viewer.html` | 3-tab library panel layout |
| `css/viewer.css` | Library view tabs, series groups, drag styles |

---

*OAA Ontology Visualiser v4.2.0 — Release Bulletin*
