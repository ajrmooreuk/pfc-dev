# Release Bulletin: Epic 4

**Date:** 2026-02-08
**Visualiser Version:** 4.4.0
**Scope:** Epic 4 (Export & Reporting)

---

## What's New

### Export Dropdown Menu

All export actions are now consolidated in a single **Export** dropdown in the toolbar, replacing the scattered PNG/Audit buttons:

| Export | Format | Description |
|--------|--------|-------------|
| **PNG Image** | `.png` | Canvas screenshot of the graph |
| **SVG Image** | `.svg` | Scalable vector graphic built from node positions |
| **Mermaid Diagram** | `.mmd` | Mermaid flowchart syntax for docs/wikis |
| **D3.js JSON** | `.json` | Force-graph compatible JSON with nodes/links/metadata |
| **Validation Report** | `.md` | Markdown with gate results + completeness score |
| **Audit Report** | `.json` | Structured OAA audit JSON for CI pipelines |
| **Full Report (PDF)** | print | Print-friendly HTML report with graph snapshot |
| **Compare Versions** | modal | Ontology version diff and changelog |

### SVG Graph Export

Generates a clean SVG from the current graph using vis.js node positions. Nodes are coloured by entity type, edges include arrowhead markers and labels. The SVG is self-contained and can be embedded in documentation or edited in vector tools.

### Mermaid Diagram Export

Converts the ontology graph to Mermaid `flowchart LR` syntax:
- Node shapes by entity type (circles for core, rectangles for class, parallelograms for external)
- Dashed arrows for inheritance, solid for relationships, thick for bindings
- Style classes applied by entity type colour
- Safe Mermaid IDs (no colons from ontology namespaces)

### D3.js JSON Export

Produces a standard D3 force-directed graph JSON file:
- `nodes` array with `id`, `label`, `group`, `description`, and `x`/`y` positions
- `links` array with `source`, `target`, `label`, `type`
- `metadata` block with name, format, counts, and export timestamp

### Full Report (PDF)

Opens a print-friendly HTML page in a new window containing:
- Ontology name, version, date, and overall compliance status
- Completeness score badge and category breakdown table
- Full graph snapshot (captured from canvas)
- Gate results table with all G1-G8 statuses
- Graph metrics (nodes, edges, density, components, isolated nodes)

Use the browser's Print / Save as PDF to produce the final document.

### Ontology Version Diff & Changelog

Compare two versions of an ontology to see what changed:

| Feature | Description |
|---------|-------------|
| **Entity diff** | Added, removed, modified, and unchanged entities with per-property change details |
| **Relationship diff** | Added, removed, and modified relationships |
| **Metadata diff** | Version, name, description, domain changes |
| **Diff graph highlighting** | Green border = added, amber = modified, red ghost nodes = removed |
| **Changelog export** | Markdown file with summary table, entity lists, and property changes |

---

## How to Use

### Export Dropdown

1. **Load** any ontology
2. Click **Export** in the toolbar
3. Select the desired format from the dropdown

### Ontology Version Diff

1. Load the **current** version of an ontology
2. Click **Export** > **Compare Versions...**
3. In the modal, click **Choose Previous Version JSON** and select the older version file
4. Click **Compare** to see the diff summary
5. Click **Export Changelog** to download the Markdown changelog

---

## How to Test

### Prerequisites

- Open the hosted version or serve locally with `python -m http.server 8080`
- Have one or more `.json` ontology files ready

### Test Checklist

| # | Test | Steps | Expected Result |
|---|------|-------|-----------------|
| 1 | Export dropdown visible | Load any ontology | Export button with dropdown arrow in toolbar |
| 2 | PNG export works | Export > PNG Image | Downloads `ontology-graph.png` |
| 3 | SVG export works | Export > SVG Image | Downloads `.svg` file, opens in browser with correct graph |
| 4 | Mermaid export valid | Export > Mermaid Diagram | `.mmd` file pastes into mermaid.live and renders |
| 5 | D3 JSON valid | Export > D3.js JSON | JSON has `nodes`, `links`, `metadata` arrays |
| 6 | Validation report | Export > Validation Report (MD) | Downloads `.md` with gate table and completeness score |
| 7 | Audit report | Export > Audit Report (JSON) | Downloads structured JSON with gates and metrics |
| 8 | PDF report | Export > Full Report (PDF) | New window with formatted report, print button works |
| 9 | Diff modal opens | Export > Compare Versions | Modal shows current ontology name |
| 10 | Diff detects changes | Upload older version > Compare | Summary shows added/removed/modified counts |
| 11 | Diff graph highlighting | After diff comparison | Added nodes have green borders, modified have amber |
| 12 | Changelog export | Click Export Changelog | Downloads markdown with summary table and entity lists |

### Automated Tests

```bash
cd PBS/TOOLS/ontology-visualiser
npx vitest run
```

Expected: **66/67 pass** (1 pre-existing failure: placeholder skip test)

New test files:
- `tests/export.test.js` — 14 tests covering SVG, Mermaid, D3 export
- `tests/diff-engine.test.js` — 14 tests covering diffOntologies, generateChangelog

---

## Files Changed

| File | Changes |
|------|---------|
| `js/export.js` | `exportSVG()`, `exportMermaid()`, `exportD3JSON()`, `exportPDF()`, helper functions |
| `js/diff-engine.js` | **New module** — `diffOntologies()`, `generateChangelog()`, entity/relationship/metadata diff helpers |
| `js/graph-renderer.js` | `applyDiffHighlighting()`, `exitDiffMode()` |
| `js/ui-panels.js` | `renderDiffView()` for diff results in audit panel |
| `js/state.js` | `lastDiff`, `diffBaseData`, `diffMode` state properties |
| `js/app.js` | New imports, export dropdown toggle, diff modal handlers, window bindings |
| `browser-viewer.html` | Export dropdown menu replacing separate buttons, diff comparison modal |
| `css/viewer.css` | Export dropdown styles |
| `tests/export.test.js` | 14 new unit tests |
| `tests/diff-engine.test.js` | 14 new unit tests |
| `ARCHITECTURE.md` | Export & Reporting section, Diff Engine section, version bump |
| `README.md` | Updated features list, architecture tree, version bump |

---

*OAA Ontology Visualiser v4.4.0 — Release Bulletin*
