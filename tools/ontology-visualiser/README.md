# OAA Ontology Visualiser

Interactive browser-based graph visualiser and authoring platform for ontologies produced by the OAA (Ontology Architect Agent). Supports single-ontology inspection with OAA v7.0.0 compliance validation, multi-ontology registry loading with cross-reference detection, ontology authoring with revision management, EMC-driven composition, and domain-specific instance management.

**Live version:** [https://ajrmooreuk.github.io/Azlan-EA-AAA/](https://ajrmooreuk.github.io/Azlan-EA-AAA/)

## Features

- **10 format auto-detection** — OAA v7.0.0 (hasDefinedTerm), OAA v6.2.0 (keyed entities), JSON-LD, PF Ontology, PF Ontology (keyed), DS Instance, UniRegistry, Registry Entry, Agent Registry, Generic
- **OAA v7.0.0 compliance validation** — 15 gates (G1-G8, G20-G24) with pass/warn/fail reporting, consolidated Gates summary panel with PASS/FAIL badges
- **OAA verification toolkit** — relationship density metrics with configurable threshold, connected-component colouring and filtering, gate report Markdown export, clipboard copy for PRs
- **Completeness scoring** — weighted composite score (0-100%) with category breakdown (Connectivity, Schema, Naming, Semantics, Completeness), CSS gauge display
- **Multi-ontology comparison** — ranked score table across all loaded ontologies in multi-mode
- **Multi-ontology registry loading** — batch load all 23 ontologies across 6 series with cross-ontology edge detection (including RCSG bridges to EA and OKR)
- **Interactive graph** — vis.js force-directed, hierarchical, or circular layouts with zoom, pan, drag
- **Entity inspection** — sidebar with Details, Connections, Schema, and Data tabs
- **Ontology library** — 3-view panel (Registry browse, Dependency graph, Saved/IndexedDB) with drag-to-add, click-to-load, and search/filter
- **Foundation extensions** — cross-ontology extension info in entity details (Extended By / Extends Foundation)
- **OAA upgrade workflow** — generates Claude Code commands to fix non-compliant ontologies
- **GitHub integration** — visual repo browser with branch/tag selection, PAT settings modal with validation, load ontologies from private repos
- **URL loading** — load any JSON ontology by URL, CDN registry support for remote registry indexes
- **Recent files & bookmarks** — auto-tracked recent files history with source icons, star/bookmark any ontology for quick access
- **Export dropdown** — PNG, SVG, Mermaid diagram (.mmd), D3.js JSON, validation report (MD), audit report (JSON), print-to-PDF full report
- **Ontology version diff** — compare two versions with added/removed/modified entity detection, diff graph highlighting, and Markdown changelog export
- **Ontology authoring** — create, edit, fork ontologies with entity/relationship CRUD, OAA-compliant output, and semver version bumps
- **Revision management** — auto-generated changelogs, revision history with diffs, unified glossary sync, Markdown export for PR reviews
- **Agentic generation** — clipboard-based AI workflow with structured prompts for entity, relationship, and full ontology generation
- **EMC composition** — 9 requirement categories (STRATEGIC, PRODUCT, PPM, etc.) with 7 priority-ordered composition rules, PFI instance creation, JSONB export, and composition manifests
- **Domain instance management** — create PFI domain ontologies extending PFC parents, schema validation, lineage visualisation, independent versioning, and merge-back support
- **Centralised view switcher** — segmented [Graph] [Mermaid] [Mindmap] tab group at toolbar start with one-click canvas switching via `setViewMode()`
- **Mermaid diagram viewer** — auto-exports loaded ontology to Mermaid flowchart syntax, pan/zoom mermaid canvas, `.mmd` file drag-and-drop
- **Mindmap canvas** — freeform mind mapping with vis-network, IndexedDB workspace persistence, node properties editor, empty-state hint
- **Design System integration** — DS-ONT instance loading from registry, multi-brand switching (BAIV, VHF-Viridian), CSS custom property theming with `--viz-*` variables, semantic token colour swatches in Data tab, localStorage brand persistence

## Quick Start

Open the hosted version — no install required:

```
https://ajrmooreuk.github.io/Azlan-EA-AAA/
```

Drop a `.json` or `.jsonld` file onto the page, or click **Load Registry** to see all 23 ontologies.

For local development, serve with any HTTP server (ES modules require it):

```bash
cd PBS/TOOLS/ontology-visualiser
python -m http.server 8080
# Open http://localhost:8080/browser-viewer.html
```

## Architecture

Zero-build-step browser application using 20 native ES modules (no bundler, no Node.js):

```
browser-viewer.html           ← HTML shell (110 lines)
├── css/viewer.css             ← All styles
└── js/
    ├── app.js                 ← Entry point, event wiring
    ├── state.js               ← Shared state + constants
    ├── ontology-parser.js     ← Format detection + parsing
    ├── graph-renderer.js      ← vis.js rendering (single + multi)
    ├── multi-loader.js        ← Registry batch loading + merged graph
    ├── audit-engine.js        ← OAA v7.0.0 validation gates
    ├── compliance-reporter.js ← Compliance panel rendering
    ├── ui-panels.js           ← Sidebar, audit, modals, tabs
    ├── library-manager.js     ← IndexedDB ontology library + recent files + bookmarks
    ├── github-loader.js       ← Registry integration + GitHub browser API + PAT management
    ├── export.js              ← PNG/SVG/Mermaid/D3/PDF export, audit JSON
    ├── diff-engine.js         ← Ontology version diff + changelog
    ├── ontology-author.js     ← Ontology authoring engine (Epic 7)
    ├── authoring-ui.js        ← Authoring UI panels (Epic 7)
    ├── revision-manager.js    ← Revision docs + glossary (Epic 7)
    ├── agentic-prompts.js     ← Agentic AI generation (Epic 7)
    ├── emc-composer.js        ← EMC composition engine (Epic 7)
    ├── domain-manager.js      ← Domain instance management (Epic 7)
    ├── ds-loader.js           ← DS-ONT instance loader + CSS var theming (Epic 8)
    ├── mermaid-viewer.js      ← Mermaid diagram rendering + container switching
    └── mindmap-canvas.js      ← Mindmap canvas, IndexedDB workspace persistence
```

## Dependencies

Single external dependency loaded via CDN:

- **vis-network** v9.1.2 (vis.js) — graph visualisation

No npm, no build step, no bundler.

## Deployment

Deployed automatically via GitHub Pages on push to `main`. The workflow copies the visualiser, unified registry, and OAA system prompts to the Pages site.

- **Primary:** `https://ajrmooreuk.github.io/Azlan-EA-AAA/PBS/TOOLS/ontology-visualiser/browser-viewer.html`
- **Root redirect:** `https://ajrmooreuk.github.io/Azlan-EA-AAA/`

## Documentation

| Document | Description |
|----------|-------------|
| [QUICK-START.md](./QUICK-START.md) | 2-minute getting started guide |
| [OPERATING-GUIDE.md](./OPERATING-GUIDE.md) | Full operating guide with all workflows |
| [FEATURE-SPEC-Graph-Rollup-DrillThrough-v1.0.0.md](./FEATURE-SPEC-Graph-Rollup-DrillThrough-v1.0.0.md) | v3 feature specification |
| [IMPLEMENTATION-PLAN-v1.0.0.md](./IMPLEMENTATION-PLAN-v1.0.0.md) | Original phased implementation plan |
| [IMPLEMENTATION-PLAN-v2.0.0.md](./IMPLEMENTATION-PLAN-v2.0.0.md) | Historical plan (Epics 1-2 scope) |
| [IMPLEMENTATION-PLAN-v3.0.0.md](./IMPLEMENTATION-PLAN-v3.0.0.md) | Historical plan (Epics 1-5 scope) |
| [IMPLEMENTATION-PLAN-v4.0.0.md](./IMPLEMENTATION-PLAN-v4.0.0.md) | Current status review (Epics 7/8/8B/9) |
| [ADR-LOG.md](./ADR-LOG.md) | Architecture Decision Records |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Technical architecture reference |
| [DESIGN-SYSTEM-SPEC.md](./DESIGN-SYSTEM-SPEC.md) | Design System Specification — rules, tokens, brand integration, DS-ONT extension |
| [RELEASE-BULLETIN-Epics-1-2.md](./RELEASE-BULLETIN-Epics-1-2.md) | Epics 1-2 release bulletin |
| [RELEASE-BULLETIN-Epic-3.md](./RELEASE-BULLETIN-Epic-3.md) | Epic 3 release bulletin |
| [RELEASE-BULLETIN-Epic-4.md](./RELEASE-BULLETIN-Epic-4.md) | Epic 4 release bulletin |
| [RELEASE-BULLETIN-Epic-5.md](./RELEASE-BULLETIN-Epic-5.md) | Epic 5 release bulletin |
| [RELEASE-BULLETIN-Epic-8C.md](./RELEASE-BULLETIN-Epic-8C.md) | Epic 8C release bulletin |
| [RELEASE-BULLETIN-ViewSwitcher.md](./RELEASE-BULLETIN-ViewSwitcher.md) | Centralised view switcher + mindmap fixes |

## Legacy Python Tools

The original Python visualisation tools (`demo.py`, `graph_builder.py`, `visualiser.py`, etc.) remain in this directory for reference but are superseded by the browser-based viewer.

---

**Version:** 5.1.0
**Last Updated:** February 2026
