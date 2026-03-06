# OAA Ontology Visualiser — Operating Guide

**Version:** 5.9.0
**Date:** 2026-03-05
**OAA Version:** 7.0.0 | **Registry:** v11.2.0
**Audience:** Team members, stakeholders, and contributors

---

## Quick Start

### Option 1: Use Hosted Version (Recommended)
Open directly in browser:
```
https://ajrmooreuk.github.io/Azlan-EA-AAA/PBS/TOOLS/ontology-visualiser/browser-viewer.html
```
Or via the root redirect:
```
https://ajrmooreuk.github.io/Azlan-EA-AAA/
```

### Option 2: Run Locally
1. Clone the Azlan-EA-AAA repository
2. Serve the repo with any local HTTP server (required for ES module imports):
   ```bash
   cd PBS/TOOLS/ontology-visualiser
   python -m http.server 8080
   ```
3. Open `http://localhost:8080/browser-viewer.html` in any modern browser

> **Note:** Opening `browser-viewer.html` directly as a file:// URL will not work — ES modules require an HTTP server. The hosted GitHub Pages version is the easiest option.

---

## Architecture Overview (v5.8.0)

The visualiser is a zero-build-step browser application using native ES modules (34 modules):

```text
browser-viewer.html          ← HTML shell (incl. 3 dynamic nav zones, view containers)
├── css/viewer.css            ← All styles (nav, views, panels, badges, overlays)
└── js/
    ├── app.js                ← Entry point, 7 view modes, dynamic nav bar, window bindings
    ├── state.js              ← Shared state + constants
    ├── ontology-parser.js    ← Format detection + parsing (10 formats)
    ├── graph-renderer.js     ← vis.js rendering (single + Tier 0/1 + series highlight styling)
    ├── multi-loader.js       ← Registry batch loading, series aggregation, lineage
    ├── audit-engine.js       ← OAA v7.0.0 validation gates (G1-G8+, G20-G24)
    ├── compliance-reporter.js ← Compliance panel rendering
    ├── ui-panels.js          ← Sidebar, audit, modals, tabs, drill buttons
    ├── library-manager.js    ← IndexedDB ontology library
    ├── github-loader.js      ← Registry integration + PAT management
    ├── export.js             ← PNG/SVG/Mermaid/D3/Cypher/PDF export
    ├── diff-engine.js        ← Ontology version diff + changelog
    ├── ontology-author.js    ← Ontology authoring engine (Epic 7)
    ├── authoring-ui.js       ← Authoring UI panels (Epic 7)
    ├── revision-manager.js   ← Revision docs + glossary management (Epic 7)
    ├── agentic-prompts.js    ← Agentic AI generation (Epic 7)
    ├── emc-composer.js       ← EMC composition engine + PFI instance filtering (Epic 7/40)
    ├── domain-manager.js     ← Domain instance management (Epic 7)
    ├── ds-loader.js          ← DS-ONT instance loader + CSS var theming (Epic 8)
    ├── composition-filter.js ← Ghost node rendering, scope transparency (Epic 40)
    ├── decision-tree.js      ← Extensibility decision engine — 7 gates, 12 recommendations (Epic 40)
    ├── design-token-tree.js  ← Admin DS browser — 3-view panel, zone overlay (Epic 40)
    ├── token-inheritance.js  ← 4-tier cascade resolution (Core→Instance→Product→App) (Epic 40)
    ├── ds-codegen.js         ← CSS transcription & LLM code generation pipeline (Epic 40)
    ├── pfi-lifecycle-ui.js   ← PFI lifecycle workbench — 10-step pipeline UI (Epic 40)
    ├── nav-action-registry.js ← Action dispatch — skeleton action → JS handler map (Epic 40)
    ├── app-skeleton-loader.js ← Skeleton parser, renderer, action wiring, state sync (Epic 40)
    ├── app-skeleton-editor.js ← Skeleton CRUD mutations, undo/redo, persistence (Epic 40)
    ├── app-skeleton-panel.js  ← Z22 Skeleton Inspector panel UI (Epic 40)
    ├── skeleton-graph.js     ← vis-network skeleton hierarchy graph view (Epic 40)
    ├── skill-builder.js      ← Process-to-skill/plugin/agent scaffolding (Epic 40)
    ├── global-search.js      ← Command palette search across all loaded data (Epic 40)
    └── registry-browser.js   ← Full-screen registry browser with series tree (Epic 40)
```

---

## Core Workflows

### Workflow 1: Load and Visualise a Single Ontology

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Drop JSON   │ ──► │   Parsing    │ ──► │ OAA v7.0.0   │ ──► │  Graph View  │
│    File      │     │ (10 formats) │     │  Validation   │     │ (Stabilized) │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
```

**Steps:**
1. Open the visualiser in your browser
2. Drag and drop a `.json` or `.jsonld` ontology file onto the drop zone
3. The graph renders with physics simulation, audit panel auto-populates
4. The OAA v7.0.0 compliance badge appears in the header

**Alternative loading methods:**
- Click **Open JSON File** in the toolbar to use a file picker
- Click **Load from GitHub** to fetch from a private repo (requires PAT)
- Click **Load Registry** to load all 45 ontologies (see Workflow 7)

**Supported Formats:**
| Format | Detection Key | Example |
|--------|--------------|---------|
| OAA v7.0.0 (hasDefinedTerm) | `hasDefinedTerm[]` | `{ "hasDefinedTerm": [...] }` |
| PF Ontology | `entities[]` | `{ "entities": [...] }` |
| JSON-LD | `@graph` | `{ "@graph": [...] }` |
| UniRegistry | `ontologyDefinition` | `{ "ontologyDefinition": {...} }` |
| Registry Entry | `@type: OntologyRegistryEntry` | Entry from unified registry |
| Agent Registry | `agents[]` | `{ "agents": [...] }` |
| PF Ontology (keyed) | `entities{}` (object) | `{ "entities": { "Foo": {...} } }` |
| DS Instance | `@graph` with `ds:` types | DS-ONT token instance data |
| Generic | (fallback) | Any JSON object |

---

### Workflow 2: Inspect Entity Details

```
Click Node ──► Sidebar Opens ──► 4 Tabs Available
                                  ├── Details (ID, Type, Description, Provenance)
                                  ├── Connections (Incoming/Outgoing)
                                  ├── Schema (Properties, Types, Cardinality)
                                  └── Data (Test instances)
```

**Steps:**
1. Single-click any node to open the sidebar
2. Use tabs to explore different aspects:
   - **Details**: Core metadata (ID, type, description). In multi-ontology mode, also shows source ontology, series badge, and placeholder status
   - **Connections**: Navigate to related entities (click to jump)
   - **Schema**: Property definitions with types and cardinality
   - **Data**: Sample test data instances (when test data is loaded), or DS-ONT instance data with colour swatches (when DS brand is active)

---

### Workflow 3: Drill-Down Navigation

#### Single-Ontology Mode

```text
Double-Click ──► Focus + Zoom ──► Connections Tab ──► Click Related Node
     │                                                       │
     └───────────────────────────────────────────────────────┘
                         (repeat)
```

**Steps:**
1. Double-click any node
2. Graph focuses and zooms to that node
3. Connections tab opens automatically showing incoming/outgoing edges
4. Click any connection to navigate to that entity
5. Continue drilling down through the graph

#### Multi-Ontology Mode (Tiered Navigation)

```text
Tier 0 (6 Series)  ──►  Tier 1 (Ontologies)  ──►  Tier 2 (Entities)
  double-click             double-click              double-click
  series node              ontology node              focus+zoom
       ▲                        ▲                         │
       └── breadcrumb ──────────┘── breadcrumb ───────────┘
```

**Steps:**
1. Click **Load Registry** to enter Tier 0 (6 series super-nodes)
2. Double-click a series node to drill into its ontologies (Tier 1)
3. Double-click an ontology node to view its entity graph (Tier 2)
4. Use the breadcrumb bar to navigate back to any previous tier
5. Click the **Home** button to return to Tier 0 at any time
6. At Tier 1, double-click a faded context series node to switch to that series

---

### Workflow 4: OAA v7.0.0 Compliance Audit

```
Load Ontology ──► Compliance Badge Appears ──► Click Badge or "OAA Audit"
                                                         │
                                                         ▼
                                                  ┌──────────────────┐
                                                  │  Gate Report      │
                                                  │                   │
                                                  │  CORE (G1-G4)    │
                                                  │  G1: Schema       │
                                                  │  G2: Relations    │
                                                  │  G2B: Nodes       │
                                                  │  G2C: Graph       │
                                                  │  G3: Rules        │
                                                  │  G4: Semantic     │
                                                  │                   │
                                                  │  ADVISORY (G5-G8) │
                                                  │  G5: Completeness │
                                                  │  G6: Registry     │
                                                  │  G7: Schema Props │
                                                  │  G8: Naming+Style │
                                                  │                   │
                                                  │  QUALITY (G20-G24)│
                                                  │  G20: Competency  │
                                                  │  G21: Duplication │
                                                  │  G22: Cross-Ont   │
                                                  │  G23: Lineage     │
                                                  │  G24: Inst. Data  │
                                                  └──────────────────┘
```

**Steps:**
1. Load any ontology
2. The compliance badge in the header shows pass/warn/fail status
3. Click the badge or the **OAA Audit** button to open the full report
4. Review each gate:

   **Core Gates (G1-G4) — must pass for compliance:**
   - **G1 (Schema Structure)**: Valid `@context`, `@type`, required fields
   - **G2 (Relationship Cardinality)**: All relationships properly defined
   - **G2B (Entity Connectivity)**: Every entity in at least one relationship
   - **G2C (Graph Connectivity)**: Single connected component
   - **G3 (Business Rules)**: IF-THEN rules with correct format
   - **G4 (Semantic Consistency)**: Naming conventions, description quality

   **Advisory Gates (G5-G8+) — warnings only:**
   - **G5 (Completeness)**: Test data with required distribution
   - **G6 (UniRegistry)**: Registry entry with required metadata
   - **G7 (Schema Properties)**: Required entity/relationship props, @id uniqueness
   - **G8 (Naming + Style Guide)**: PascalCase entities, camelCase relationships, prefix consistency

   **v7 Quality Gates (G20-G24) — skipped for v6 ontologies:**
   - **G20 (Competency Coverage)**: Every entity, relationship, and rule exercised by at least one CQ
   - **G21 (Semantic Duplication)**: Detects near-duplicate entity descriptions (Jaccard similarity)
   - **G22 (Cross-Ontology Rules)**: Cross-ontology references use known/non-deprecated prefixes
   - **G23 (Lineage Chain Integrity)**: Upstream/downstream references valid in VE, PE, GRC chains
   - **G24 (Instance Data Quality)**: Schema conformance, distribution analysis, CQ-test linkage (advisory)

**OAA Gates Summary Panel:**

At the top of the audit panel, a consolidated Gates summary section shows:

- **GATE 2B badge** — PASS (all entities connected) or FAIL (isolated nodes detected) with count
- **GATE 2C badge** — PASS (single component) or WARN (N components) with count
- **Density ratio** — edge-to-node ratio with traffic-light indicator (green/yellow/red)
- **Density threshold** — configurable via slider (default 0.8, persisted to browser storage)
- **Component colouring toggle** — colour each connected component with a distinct colour (ColorBrewer Set2 palette)
- **Component filter dropdown** — isolate a single component to inspect it in detail
- **Export Report** — download a full Markdown validation report
- **Copy Results** — copy gate summary table to clipboard for pasting into PRs

**Additional Actions (when audit completes):**

- **Upgrade with OAA v7**: Generates a Claude Code command to upgrade non-compliant ontologies (visible when warn/fail)
- **Save to Library**: Save compliant ontologies to the browser's IndexedDB library (visible when pass)
- **Export Report**: Download the full audit report as JSON (always visible after validation)

> **Implementation note:** These three buttons (`btn-run-oaa`, `btn-save-library`, `btn-export-audit`) live in the audit panel HTML and are controlled by `compliance-reporter.js` based on validation status. They are **separate** from the L3-admin "Upgrade OAA" dynamic nav button (which appears only in authoring mode). Both must exist — do not delete the audit panel buttons when refactoring the toolbar.

---

### Workflow 5: OAA Upgrade (Non-Compliant Ontologies)

```
Audit Shows Failures ──► Click "Upgrade with OAA v7" ──► Copy Command ──► Run in Claude Code
```

**Steps:**
1. Load an ontology that fails one or more gates
2. The **Upgrade with OAA v7** button appears
3. Click it to generate a Claude Code command
4. Copy the command and paste into Claude Code terminal
5. The agent will fix the ontology to pass all gates

---

### Workflow 6: Ontology Library

```
┌──────────────────────────────────────────────────────┐
│                  Library Panel                        │
│  ┌──────────┐  ┌──────────────┐  ┌────────┐          │
│  │ Registry │  │ Dependencies │  │ Saved  │          │
│  └──────────┘  └──────────────┘  └────────┘          │
│                                                       │
│  Registry: 45 ontologies grouped by 6 series          │
│  Dependencies: mini graph of ontology relationships   │
│  Saved: IndexedDB local storage with versioning       │
└──────────────────────────────────────────────────────┘
```

**Steps:**
1. Click the **Library** button (book icon) to open the library panel
2. Use the **3 view tabs** to switch between:
   - **Registry** — browse all 45 ontologies grouped by series, with compliance badges and search/filter. Click any entry to load it, or drag it onto the graph canvas
   - **Dependencies** — mini vis-network showing ontology-level import/reference relationships. Double-click a node to load that ontology
   - **Saved** — browse locally saved ontologies by category, with version history
3. In the **Registry** view, use the search box to filter by name, namespace, or series
4. In the **Saved** view, use **Export** / **Import** to transfer your library between browsers

**Drag-to-Add (from Registry):**
1. Open the Library panel to the Registry view
2. Drag any ontology entry from the panel onto the graph canvas
3. The ontology loads and renders (placeholder ontologies show an info modal instead)

**Saving an Ontology:**
1. Load an ontology that passes compliance
2. Click **Save to Library**
3. Enter name, category, version, and notes
4. The ontology is stored locally in IndexedDB with full version history

---

### Workflow 7: Load Full Registry (Multi-Ontology Mode)

```text
Click "Load Registry" ──► Batch Load (45 ontologies) ──► Tier 0: Series Rollup (6 nodes)
                                                                │
                                                       ┌────────┴────────┐
                                                       │ 6 Series Nodes  │
                                                       │ Cross-Series    │
                                                       │ Edges (gold)    │
                                                       └────────┬────────┘
                                                                │
                                              Double-click ─────┴───── Toggle to
                                              series node              "Ontologies (41)"
                                                    │                       │
                                                    ▼                       ▼
                                           Tier 1: Series         Flat 41-node view
                                           Drill-Down             (legacy merged graph)
                                                    │
                                              Double-click
                                              ontology node
                                                    │
                                                    ▼
                                           Tier 2: Entity Graph
                                           (single-ontology renderer)
```

**Steps:**

1. Click **Load Registry** in the toolbar
2. Wait for all 45 ontologies to load from the unified registry
3. The **Tier 0 Series Rollup** displays with:
   - **6 series super-nodes** — large nodes representing each ontology series, labelled with ontology count
   - **Cross-series edges** — gold dashed lines showing relationships between series, labelled with reference count
   - **Series/Ontologies toggle** — breadcrumb bar toggle to switch between 6-node and 41-node views
4. **Drill into a series** (Tier 1): Double-click a series node to see its ontologies
   - Ontology nodes for the selected series are shown at full opacity
   - Other series appear as faded context nodes (30% opacity) — click to switch context
   - Placeholder ontologies shown as dashed-border diamonds (not drillable)
5. **Drill into an ontology** (Tier 2): Double-click an ontology node to see its entity graph
   - Full entity-level graph rendered using the single-ontology renderer
   - Breadcrumb shows: Library > Series > Ontology
6. **Navigate back**: Use breadcrumb links or Home button to return to any previous tier

**Series Colour Key:**

| Series | Colour | Ontologies (41 active) |
|--------|--------|------------|
| VE-Series (Value Engineering) | Blue | VSOM, OKR, VP, RRR, PMF, KPI, CRT + VSOM-SA (BSC, IND, RSN, MAC, PFL) + VSOM-SC (NAR, CSC, CUL, VIZ) |
| PE-Series (Process Engineering) | Green | PPM, PE, EFS, DS, CICD, LSC, OFM + EA (EA-CORE hub, EA-TOGAF, EA-MSFT, EA-AI) |
| RCSG-Series (Risk, Compliance, Security & Governance) | Purple | GRC-FW (hub), ERM, ALZ, GDPR, PII, NCSC-CAF, DSPT, RMF |
| Foundation | Orange | ORG, ORG-CONTEXT, ORG-MAT, CTX, GA |
| Orchestration | Cyan | EMC |

**Returning to Single Mode:**

- Drag-drop a single file, use file picker, or load from GitHub/Library to return to single-ontology mode

---

### Workflow 8: Load Test Data

```
Ontology Loaded ──► Click "+ Test Data" ──► Select JSON ──► Data Tab Populated
```

**Steps:**
1. Load an ontology first
2. Click **+ Test Data** in toolbar
3. Select a test data JSON file
4. Click entities to see their test instances in the **Data** tab

**Test Data Format:**
```json
{
  "testData": {
    "EntityName": [
      { "id": "...", "name": "...", "testCategory": "typical" },
      { "id": "...", "name": "...", "testCategory": "edge" }
    ]
  }
}
```

---

### Workflow 9: Load from GitHub (Private Repos)

```
Click "Load from GitHub" ──► Enter PAT ──► Enter repo/path ──► Ontology Loads
```

**Steps:**
1. Click **Load from GitHub**
2. Enter your GitHub Personal Access Token (stored in session only, cleared on tab close)
3. Enter path: `owner/repo/path/to/ontology.json`
4. Ontology loads directly from GitHub API

---

### Workflow 10: Series Highlight Selectors

```text
Load Registry ──► Tier 0/1 View ──► Click series toggles (VE / PE / Foundation / ...)
                                              │
                                     ┌────────┴────────┐
                                     │ Series nodes     │
                                     │ + edges glow     │
                                     │ in series colour │
                                     │                  │
                                     │ VE/PE retain     │
                                     │ chain logic      │
                                     └─────────────────┘
```

**Steps:**

1. Click **Load Registry** to enter multi-ontology mode
2. In the breadcrumb bar, six series toggle buttons appear — one per series:
   - **VE** — highlights VE-Series ontologies and VE chain edges (VSOM → OKR → VP → PMF → EFS) in gold (#cec528)
   - **PE** — highlights PE-Series ontologies and PE chain edges (PPM → PE → EFS → EA) in copper (#b87333), plus EA hub-spoke chain (EA-CORE ↔ EA-TOGAF/EA-MSFT/EA-AI) in forest green (#2e7d32)
   - **Foundation** — highlights Foundation ontologies in orange (#FF9800)
   - **Competitive** — highlights Competitive ontologies in pink (#E91E63)
   - **RCSG** — highlights RCSG-Series ontologies in purple (#9C27B0)
   - **Orchestration** — highlights Orchestration ontologies in cyan (#00BCD4)
3. When a series is highlighted:
   - Series nodes and ontology nodes glow with the series colour border
   - Cross-ontology edges within the highlighted series are emphasised
   - Non-matching cross-ontology edges are dimmed
   - For VE/PE, consecutive chain edges are shown as thick solid lines (gold/copper)
   - When both VE + PE are active, EFS shows convergence styling (#FF6B35)
4. Multiple series can be active simultaneously (independent toggles)
5. Click an active toggle again to deselect it
6. Series highlighting works at Tier 0, Tier 1, all-ontologies view, and connection map view

**Cross-Refs Only Filter:**

- Click **Cross-refs Only** button to hide all intra-ontology edges and show only cross-ontology connections
- Useful for understanding inter-ontology dependencies without visual noise
- Can be combined with series highlighting

---

### Workflow 11: Cross-Ontology Edge Navigation

```text
Click cross-ontology edge ──► Navigates to target ontology (Tier 2)
```

**Steps:**

1. In any multi-ontology view (Tier 0, Tier 1, all-ontologies, or connection map), click a cross-ontology edge (gold dashed line)
2. The visualiser navigates directly to the target ontology's entity graph (Tier 2)
3. Only edges pointing to loaded (non-placeholder) ontologies are navigable
4. Use the breadcrumb to navigate back

---

### Workflow 12: Foundation Extension Info

**Steps:**

1. Load the registry (**Load Registry**) and drill into any ontology (Tier 2)
2. Click a node to open the Details sidebar
3. If the node is a **Foundation entity** (e.g., from ORG, ORG-CONTEXT):
   - An "Extended By" section shows which domain ontologies reference this entity, with counts
4. If the node is a **domain entity** (e.g., from VE-Series, PE-Series):
   - An "Extends Foundation" section shows which foundation entities it references, with clickable links

This helps understand cross-ontology dependencies at the entity level.

---

### Workflow 13: Ontology Authoring

**Steps:**

1. **Create a new ontology** — call `createOntology({ name, namespace, prefix, description })` via the browser console or authoring UI. This generates a blank OAA v7.0.0-compliant ontology
2. **Add entities** — call `addEntity(ontology, { '@id': 'MyEntity', name: 'My Entity', '@type': 'core', description: '...' })` to add entities with full property definitions
3. **Add relationships** — call `addRelationship(ontology, { name: 'relatesTo', domainIncludes: ['EntityA'], rangeIncludes: ['EntityB'] })`
4. **Fork an existing ontology** — call `forkOntology(ontology, 'new-namespace:')` to deep-clone with a new namespace for domain variants
5. **Validate before saving** — call `validateForSave(ontology)` to run all OAA gate checks
6. **Bump version** — call `bumpVersion(ontology, 'minor')` for semver increment (major/minor/patch)

All authoring functions produce OAA-compliant JSON-LD output ready for the ontology library.

---

### Workflow 14: Revision Documentation & Glossary

**Steps:**

1. **Create a revision** — after editing an ontology, call `createRevision(oldOntology, newOntology, 'minor')` to auto-generate a diff and changelog
2. **View revision history** — call `getRevisionHistory(ontologyId)` to see all versions with diffs between adjacent versions
3. **Manage glossary** — call `updateGlossaryEntry(term, definition)` to add/update unified glossary entries linked to ontology entities
4. **Export docs** — call `exportRevisionDocs(revisionId, 'markdown')` to generate Markdown for PR reviews and release bulletins

---

### Workflow 15: Agentic Ontology Generation

**Steps:**

1. **Generate a prompt** — call `generateEntityPrompt()`, `generateRelationshipPrompt()`, or `generateOntologyPrompt()` to get a structured AI prompt
2. **Copy to clipboard** — the prompt is copied to clipboard for pasting into Claude or another AI assistant
3. **Get AI response** — the AI generates JSON following the structured prompt format
4. **Parse response** — call `parseAgenticResponse(clipboardText)` to parse the AI-generated JSON and integrate it into the current ontology

---

### Workflow 16: EMC Composition

**Steps:**

1. **Compose by category** — call `composeOntologySet(['STRATEGIC'], { context: 'PFC' })` to auto-compose the required ontology set for a requirement category
   - 9 categories available: STRATEGIC, PRODUCT, PPM, COMPETITIVE, ORG-DESIGN, PROCESS, ENTERPRISE, COMPLIANCE, AGENTIC
   - 7 composition rules applied automatically (Foundation Always Required, Dependency Chain, Category Minimum, PFI Product Context, Maturity Filtering, RCSG Overlay, Enterprise All-Series)
2. **Create a PFI instance** — call `createPFIInstance('my-product', 'My Product', ['PRODUCT', 'COMPLIANCE'])` to create a named product instance merging multiple category compositions
3. **Generate test data** — call `generateTestData(composition)` to create sample entities and relationships for validation
4. **Export as JSONB** — call `exportAsJSONB(composition)` to generate platform database-compatible output with tier classification (required/recommended/optional)
5. **Create manifest** — call `createCompositionManifest(compositionId, composition)` to version-control which ontology versions were included

---

### Workflow 17: Domain Instance Management

**Steps:**

1. **Create a domain instance** — call `createDomainInstance('BAIV-VP', parentOntology, { name: 'BAIV Value Proposition' })` to create a PFI domain ontology extending a PFC parent
2. **Add domain entities** — call `addDomainEntity('BAIV-VP', { '@id': 'CustomEntity', name: '...', '@type': 'core' })` to extend with domain-specific data
3. **Validate** — call `validateDomainInstance('BAIV-VP')` to check against parent schema (entity types, required properties, relationship endpoints, @id uniqueness)
4. **View lineage** — call `getDomainLineage('BAIV-VP')` to see the inheritance graph from PFC parent → domain instance → domain entities
5. **Version independently** — call `bumpDomainVersion('BAIV-VP', 'minor')` for independent semver versioning with history tracking
6. **Merge back** — call `prepareMergeBack('BAIV-VP')` then `applyMergeBack('BAIV-VP', parentOntology)` to promote reusable patterns back to shared PFC ontologies

---

### Workflow 18: Design System Brand Switching (Epic 8)

```
Load Registry ──► DS-ONT detected ──► instanceData loaded ──► Brand selector appears
                                                                    │
                                          ┌─────────────────────────┤
                                          ▼                         ▼
                                   VHF-Viridian              BAIV (default)
                                          │                         │
                                          ▼                         ▼
                                   CSS vars injected ──► Visualiser theme updates
                                          │
                                   localStorage persists brand + vars
```

**Steps:**

1. Click **Load Registry** — the DS-ONT entry is detected and its `instanceData[]` array is loaded
2. For each brand in instanceData, the JSONLD instance file is fetched and parsed via `ds-loader.js`
3. A brand selector dropdown appears in the toolbar area (when DS instances are available)
4. Select a brand (e.g. BAIV, VHF-Viridian) — semantic tokens are mapped to CSS custom properties
5. The visualiser theme updates immediately (surface colours, text, accents, borders)
6. The selected brand and computed CSS vars persist to `localStorage` for next session
7. When clicking a DS-ONT entity node (e.g. `ds:PrimitiveToken`), the **Data** tab shows instance data for that entity type from the active brand, with hex colour swatches

**CSS Custom Properties:**

The visualiser uses 20 `--viz-*` CSS custom properties in `:root` with dark-theme defaults. When a DS brand is applied, `generateCSSVars()` maps semantic tokens to these properties. Missing vars are auto-derived using luminance detection (`_deriveMissingVars()`).

| Property | Default | DS Token Source |
|----------|---------|-----------------|
| `--viz-surface-default` | `#0f1117` | `surface.default` (immutability-guarded) |
| `--viz-surface-elevated` | `#1a1d27` | `surface.elevated` |
| `--viz-text-primary` | `#e0e0e0` | `text.primary` |
| `--viz-accent` | `#9dfff5` | `accent.primary` or brand accent |
| `--viz-border-default` | `#2a2d37` | `border.default` |

**Canvas Background Immutability (DR-CANVAS-001):**

The graph canvas background is protected from unsafe brand overrides. When a DS brand provides a `neutral.surface.default` token, its WCAG relative luminance is validated before application:

- **Dark-safe** (luminance < 0.05): Accepted — the existing dark-theme node/edge colours maintain WCAG AA contrast
- **Light-safe** (luminance >= 0.2): Accepted — light-theme alternatives (Material 700-900) provide sufficient contrast
- **Mid-range** (0.05 – 0.19): Rejected — a `console.warn` is logged explaining the rejection

If a brand's surface colour is rejected, the canvas retains its current colour (either the `:root` default `#0f1117` or a previously-applied valid brand). Check the browser console for `[DS-Loader] DR-CANVAS-001` messages when troubleshooting theme issues.

---

### Workflow 19: PFI Instance Selection with Auto-Brand Resolution (F8.4)

```
Load Registry ──► PFI instances loaded ──► PFI dropdown appears
                                                  │
                             ┌────────────────────┼────────────────────┐
                             ▼                    ▼                    ▼
                        PFI-BAIV             PFI-RCS             PFI-W4M
                             │                    │                    │
                             ▼                    ▼                    ▼
                   designSystemConfig    designSystemConfig    designSystemConfig
                     brand: "baiv"         brand: "rcs"         brand: null
                             │                    │              fallback: "pfc"
                             ▼                    ▼                    ▼
                     switchDSBrand() ─── CSS vars injected ─── PF-Core defaults
```

**Steps:**

1. Click **Load Registry** — PFI instance configs are loaded from `pfiInstances[]` in the registry
2. A PFI instance dropdown appears in the toolbar (next to the DS brand selector)
3. Select a PFI instance (e.g. PFI-BAIV, PFI-RCS, PFI-W4M)
4. `resolveDSBrandForPFI()` auto-resolves the DS brand using a three-tier cascade:
   - **Tier 1:** `designSystemConfig.brand` — explicit brand key
   - **Tier 2:** `designSystemConfig.fallback` — used when brand is null or not loaded
   - **Tier 3:** `brands[0].toLowerCase()` — case-insensitive match against loaded DS instances
5. The resolved brand is applied via the same `switchDSBrand()` → `generateCSSVars()` → `applyCSSVars()` pipeline
6. The DS brand dropdown syncs to show the resolved brand
7. Selecting "PF-Core (no instance)" resets to default CSS vars
8. The selected PFI instance persists to `localStorage` (`oaa-viz-pfi-instance`)

**Brand Mapping:**

| PFI Instance | DS Brand | Resolution Source |
|-------------|----------|-------------------|
| PFI-BAIV | `baiv` | designSystemConfig.brand |
| PFI-RCS | `rcs` | designSystemConfig.brand |
| PFI-W4M | `pfc` | designSystemConfig.fallback |

**Note:** The PFI dropdown and DS brand dropdown work together — selecting a PFI instance auto-sets the brand, but the DS brand dropdown remains functional as a manual override.

### Workflow 20: Context Switch UI — Identity Bar, Glow, Drawer (F8.8)

```text
Registry loaded ──► Context identity bar appears (PF-Core)
                            │
          ┌─────────────────┼──────────────────┐
          ▼                 ▼                  ▼
  Click bar / press C   Select PFI dropdown   Clear to PF-Core
          │                 │                  │
          ▼                 ▼                  ▼
  Quick-switch drawer   If switching between   Bar: "PF-Core"
  opens (right slide)   PFI instances:         Glow: removed
  PF-Core + PFI cards   ► Confirmation modal   Title: default
          │               Apply / Cancel       Favicon: default
          ▼                 │
  Click card ──────────► _doSelectPFIInstance()
                            │
              ┌─────────────┼─────────────┐
              ▼             ▼             ▼
        Identity bar    Graph border   Title + Favicon
        updates with    glow matches   update to show
        PFI name +      brand accent   active PFI name
        accent strip    colour (0.4s)  + accent dot
```

**Visual Channels:**

| Channel | Element | Rule |
| ------- | ------- | ---- |
| Identity bar | 4px accent strip + PFI label + DS brand | DR-CTX-SWITCH-001 |
| Graph border glow | Inset box-shadow on `#graph-container` | DR-CTX-SWITCH-002 |
| Title & favicon | `document.title` + 16x16 canvas favicon | DR-CTX-SWITCH-003 |
| Switch confirmation | Modal when switching between PFI instances | DR-CTX-SWITCH-004 |

### Workflow 20b: EMC Cascade Navigation — PFC → PFI → Product → App (F19.4+)

**Supersedes:** The old Core/Instance toggle and instance picker dropdown (Workflows 19-20) are now hidden. The EMC Cascade Navigation Bar replaces them with an always-visible breadcrumb hierarchy.

```text
Page load ──► EMC nav bar visible (PF-Core active, PFI/Product/App disabled)
                    │
Load Registry ──► PFI dropdown enables (8 instances)
                    │
          Click [Instance ▼] ──► Dropdown: PF-Core + all PFI instances
                    │                (scope pills, brand, market, maturity)
          Select instance ──► [PF-Core] › [BAIV Instance ▼] › [AIV ▼] › [App]
                    │
                    ├── DS brand auto-resolves
                    ├── Scope chips appear in nav bar
                    ├── Graph recomposes via EMC composition
                    └── Product auto-selects (first product)
                              │
          Click [Product ▼] ──► Dropdown: all products for this instance
                              │    (e.g., CAF-Audit, Cyber-Insurance-Advisory)
          Select product ──► Graph recomposes with product-specific scope rules
                              │
          Click [PF-Core] ──► Cascade reset to full core graph
```

**Steps:**

1. **On page load** — The EMC nav bar appears immediately showing **PF-Core** as active. PFI, Product, and App levels are greyed out.
2. Click **Load Registry** — The PFI dropdown enables. All 8 instances appear with scope pills.
3. Click the **Instance** dropdown — Select a PFI instance (e.g., PFI-BAIV). The nav bar shows the cascade: `PF-Core › BAIV Instance › AIV › App`.
4. The first product is auto-selected. For multi-product instances (e.g., PFI-AIRL-CAF-AZA), click the **Product** dropdown to switch between `CAF-Audit` and `Cyber-Insurance-Advisory`.
5. Selecting a different product re-triggers `composeMultiCategory()` with the product-specific code, applying product-match scope rules.
6. Click **PF-Core** in the breadcrumb to reset to the full core graph. All child levels (PFI, Product) reset.
7. The right side of the bar shows the DS brand and vertical market/tier summary.

**Multi-product instances:**

| Instance | Products | Scope |
|----------|----------|-------|
| PFI-BAIV | AIV | PRODUCT, COMPETITIVE, STRATEGIC |
| PFI-AIRL-CAF-AZA | CAF-Audit, Cyber-Insurance-Advisory | COMPLIANCE, SECURITY, PRODUCT |
| PFI-VHF | VHF-Nutrition | PRODUCT |
| PFI-W4M | W4M | PRODUCT |

**App level (placeholder):** The App button is disabled and styled in italic. It will be activated when F19.6 (Application-Tier Scope Rules) adds `ApplicationContext` to EMC v5.1.0.

---

### Workflow 21: Semantic Coherence — Interactive Legend & Visual Encoding (F8.6)

The graph uses a formalised visual encoding system where every colour, shape, and edge style maps to a documented archetype or relationship category.

**Node Shapes:** Each entity archetype has a distinct shape — hexagon (core), dot (class), box (framework), triangle (supporting), star (agent), diamond (external), square (layer), ellipse (concept). Shapes are visible at all tiers.

**Edge Categories:** Relationship labels are grouped into 5 semantic categories with distinct visual styles:

| Category | Colour | Dash | Example Labels |
| -------- | ------ | ---- | -------------- |
| Structural | Purple | Solid thick | `contains`, `composedOf`, `hasScope` |
| Taxonomy | Grey | Dashed | `subClassOf`, `extends` |
| Dependency | Red | Solid | `dependsOn`, `requires` |
| Informational | Blue | Dot-dash | `informs`, `defines`, `measuredBy` |
| Operational | Green | Solid | `produces`, `supports`, `enables` |

**Interactive Legend:** The legend panel (bottom-left of graph) shows node types with shape indicators and edge categories with line samples. Interaction:

- **Hover** a legend item to dim all non-matching nodes/edges (15% opacity)
- **Click** a legend item to toggle a persistent filter (dimmed items stay dimmed)
- **Click "Reset"** to clear all filters and restore full opacity

**Brand Override:** When a DS brand is applied (Workflow 18/19), brand tokens can override archetype and edge colours via `archetype.{type}.surface` and `edge.{category}.color` DS-ONT tokens. Overrides are WCAG-validated at 3:1 minimum contrast against the canvas — failing colours are silently reverted.

---

### Workflow 22: Multilayer Semantic Filtering — Layer Toggle Panel (F8.7)

The visualiser provides a 6-layer semantic filtering system to isolate subsets of the merged ontology graph based on series classification, foundation entities, orchestration, and cross-references.

```text
Load Registry ──► Click "Layers" ──► Layer panel opens (right drawer)
                                           │
                      ┌────────────────────┼────────────────────┐
                      ▼                    ▼                    ▼
              Toggle layer chips    Set mode (OR/AND)    Apply preset
                      │                    │                    │
              ┌───────┴────────┐           │           ┌────────┴────────┐
              ▼                ▼           ▼           ▼                 ▼
        Active layers    Inactive      Filter logic   Strategic       Full Mesh
        full opacity     15% opacity    applied       Overview        (all active)
                                            │
                                            ▼
                                     Filtered graph
                                     + search respects layers
                                     + URL hash persists state
```

**6 Semantic Layers:**

| Layer | Description | Ontology Series |
|-------|-------------|-----------------|
| **Strategic** | VE-Series ontologies | VSOM, OKR, VP, RRR, PMF, KPI + VSOM-SA/SC sub-series |
| **Operational** | PE-Series ontologies | PPM, PE, EFS, EA, EA-CORE, EA-TOGAF, EA-MSFT, DS |
| **Compliance** | RCSG-Series ontologies | RCSG-FW, MCSB, GDPR, PII, MCSB2, AZALZ, RMF-IS27005 |
| **Foundation** | Foundation ontologies | ORG, ORG-CONTEXT, ORG-MAT, CTX, GA |
| **Orchestration** | Orchestration ontologies | EMC |
| **Cross-Ref** | Cross-ontology edges only | Nodes with 3+ cross-refs (bridge nodes) |

**Steps:**

1. Click **Load Registry** to enter multi-ontology mode
2. Click the **Layers** button in the toolbar to open the layer toggle panel (right drawer)
3. The panel shows 6 layer chips — click to toggle each on/off:
   - **Active layers** (selected) — nodes/edges shown at full opacity
   - **Inactive layers** (deselected) — nodes/edges shown at 15% opacity
4. Choose filter mode:
   - **OR mode (default)** — show nodes matching ANY active layer
   - **AND mode** — show nodes matching ALL active layers (useful for Cross-Ref intersections)
5. Use **Presets** dropdown for common scenarios:
   - **Strategic Overview** — Strategic + Foundation layers
   - **Compliance Audit** — Compliance + Foundation layers
   - **Cross-Ref Only** — Cross-Ref layer only (bridge nodes + cross-edges)
   - **Full Mesh** — All 6 layers active
6. **Search input** — filter nodes by label/type within active layers:
   - Searches respect the current layer selection
   - Check **"All layers"** checkbox to search across hidden layers
7. **Reset button** — clear all filters and restore default state (all layers active, OR mode)
8. **URL hash persistence** — layer state is encoded in the URL hash:
   - Share links with layer filters applied
   - Example: `#layers=strategic,foundation&mode=or`

**Visual Indicators:**

- Active layer chips show full colour + checkmark icon
- Inactive layer chips show greyed-out + no checkmark
- Nodes in inactive layers dimmed to 15% opacity
- Cross-ref edges (gold dashed) always visible when Cross-Ref layer active
- Layer panel shows live counts for each layer (e.g. "Strategic (18 nodes)")

---

### Workflow 23: Zone Boundary Overlay — Highlight Zones from Token Map

The Token Map admin panel lets you visually locate any of the 22 UI zones (Z1-Z22) by overlaying a red dashed boundary on the corresponding DOM element.

```text
Open Token Map ──► Zone tree (Z1-Z22) ──► Click ◎ locate button on zone row
                                                    │
                                    ┌───────────────┼───────────────┐
                                    ▼                               ▼
                            Zone visible                    Zone hidden
                            Red dashed outline               Muted grey centred
                            matches element                  indicator with
                            getBoundingClientRect            "Hidden" note
                                    │                               │
                                    └───────────────┬───────────────┘
                                                    │
                                    Click ◎ again ──► Overlay dismissed
                                    Press Escape ──► All overlays cleared
```

**Steps:**

1. Click the **Token Map** button in the toolbar to open the admin panel
2. The zone tree shows all 22 zones (Z1-Z22) as expandable rows
3. Each zone row has a **◎** (bullseye) locate button on the right
4. Click the locate button on any zone:
   - **Visible zones** (e.g., Z1 Header, Z6 Graph Canvas) — a red dashed outline appears around the element with a zone label tag and dismiss button
   - **Hidden zones** (e.g., Z4 Authoring Toolbar when collapsed) — a muted grey indicator appears centred on screen with "Hidden" note
5. Click the same locate button again to dismiss that overlay
6. Click the **X** dismiss button on any overlay to remove it
7. Press **Escape** to clear all active overlays at once
8. Multiple zones can be highlighted simultaneously
9. Overlays reposition automatically on scroll and window resize

**Active State:** When a zone overlay is active, the corresponding tree row gets an accent border highlight (`.zone-overlay-active`), making it easy to see which zones are currently highlighted.

**Zone Map (22 zones):**

| Zone | Element | Selector |
| ---- | ------- | -------- |
| Z1 | Header | `header` |
| Z2 | Toolbar | `.toolbar` |
| Z3 | EMC Nav Bar | `#emc-nav-bar` |
| Z4 | Authoring Toolbar | `#authoring-toolbar` |
| Z6 | Graph Canvas | `#network` |
| Z9 | Sidebar Details | `#sidebar` |
| Z20 | Drop Zone | `#drop-zone` |
| Z22 | Skeleton Inspector | `#skeleton-panel` |

*(Plus Z4b, Z5, Z7, Z8, Z10-Z19, Z21 — see `ZONE_DOM_SELECTORS` in `design-token-tree.js` for the full map.)*

---

### Workflow 24: Skeleton Inspector — Browse Zones, Components, and Navigation

The **Skeleton** button opens the App Skeleton Inspector panel (Z22), a left-side sliding panel that introspects the loaded application skeleton structure.

```text
Click Skeleton ──► Panel slides in from left
       │
       ├── Spatial Diagram (top) ──► Mini CSS-grid wireframe of all zones
       │        Click zone block ──► Scrolls to zone card in list below
       │
       ├── Zones tab ──► All 22 zones with type, position, visibility, zIndex, tier
       ├── Functions tab ──► Zone → component mapping (which components live where)
       └── Nav Layers tab ──► L1–L4 layers with nav items, action bindings, shortcuts
```

**Steps:**

1. Click the **Skeleton** button in the toolbar (L3-admin layer)
2. The panel opens on the left (440px) with a spatial diagram at the top
3. The diagram shows all zones colour-coded by type: teal=Fixed, blue=Sliding, amber=Conditional, purple=Floating, grey=Overlay
4. Currently visible zones are opaque; hidden zones are dimmed with dashed borders
5. Click any zone block in the diagram to scroll to its detail card below
6. Use the **Zones** tab to inspect zone metadata (type, position, width, visibility condition, z-index, cascade tier)
7. Use the **Functions** tab to see which components are placed in each zone (placementId, slot, component reference)
8. Use the **Nav Layers** tab to browse navigation layers (L1 Main, L2 View, L3 Context/Admin, L4 PFI Custom) with their items
9. All entities show PFC/PFI cascade tier badges (green=PFC, blue=PFI)
10. If no skeleton is loaded, the panel shows "No skeleton loaded. Click Load Registry to populate."

---

### Workflow 25: Skeleton Editor — Reorder & Move Nav/Zone Mappings (F40.19)

The Skeleton Inspector panel (Z22) includes a built-in editor for mutating the PFC-level application skeleton at runtime — reordering nav items, moving items between layers, reordering zone-components, moving components between zones, and moving entire layers between toolbar zones.

```text
Open Skeleton Panel ──► Click "Edit" ──► Edit toolbar appears
       │                                       │
       ├── Nav Layers tab                      ├── 🔒 Lock icon (PFC tier indicator)
       │    Each item row shows:               ├── Up/Down arrows (reorder within layer)
       │    🔒 ☰ drag │ ▲ ▼ │ [Layer ▼]       ├── ▲ disabled on first, ▼ disabled on last
       │    Layer card shows: [Zone ▼]         ├── Drag handle (drag-to-reorder)
       │                                       └── Layer/Zone select (move between)
       ├── Functions tab
       │    Each component row shows:          Undo/Redo (snapshot-based)
       │    🔒 ☰ drag │ ▲ ▼ │ [Zone ▼]        Save to Library (File System Access API)
       │                                       Export (browser download)
       └── Click "Done" ──► Edit controls      Discard (restore baseline)
                            hidden
```

**Steps:**

1. Open the **Skeleton** panel (click Skeleton button in toolbar)
2. Click **Edit** to enter edit mode — the edit toolbar appears with Undo/Redo/Save/Export/Discard buttons
3. Switch to the **Nav Layers** tab to edit navigation:
   - **Lock icon**: PFC-tier items show a 🔒 icon as a tier indicator alongside edit controls
   - **Reorder**: Click **▲**/**▼** arrows to swap an item's `renderOrder` with its adjacent sibling
   - **Boundary disable**: The **▲** arrow is disabled on the first item; **▼** is disabled on the last
   - **Drag**: Use the **☰** drag handle to drag an item to a new position within its layer
   - **Move item**: Use the **Layer** dropdown to move an item to a different nav layer (appends at end)
   - **Move layer to zone**: Use the **Zone** dropdown on each layer card to move the entire layer to a different toolbar zone (Z2 Primary, Z4 Authoring, Z4b Selection)
4. Switch to the **Functions** tab to edit zone-component placements:
   - **Lock icon**: PFC-tier components show a 🔒 icon as a tier indicator
   - **Reorder**: Click **▲**/**▼** arrows to reorder components within their zone
   - **Boundary disable**: First/last arrows disabled at boundaries
   - **Drag**: Use the **☰** drag handle to drag-to-reorder
   - **Move**: Use the **Zone** dropdown to move a component to a different zone
5. Changes are applied **immediately** in-memory — the toolbar and panel re-render after each mutation
6. Use **Undo** (snapshot-based) to reverse any change; **Redo** to re-apply
7. A **dirty dot** (amber) appears when unsaved changes exist
8. **Save to Library** — writes directly to `PE-Series/DS-ONT/instance-data/` via File System Access API (Chrome/Edge). Falls back to browser download if API unavailable
9. **Export** — downloads the skeleton JSONLD as a file (legacy/manual workflow)
10. **Discard** — restores the baseline snapshot captured when Edit was clicked
11. Click **Done** to exit edit mode (unsaved changes persist in memory until page refresh)

**Cascade-Tier Guard Behaviour (BR-DS-013):**

The skeleton editor enforces PFC cascade-tier immutability with dual-mode guards:

- **In skeleton edit mode** (PFC admin) — All items are editable regardless of tier. The 🔒 icon appears as a visual tier indicator but does not block editing.
- **Outside edit mode** (PFI instance merged skeleton) — PFC-tier items are locked. Reorder and move operations silently return without mutating. PFI-tier items remain editable. A swap-partner guard also prevents a PFI item from swapping with an adjacent PFC item.

**Session Resilience:**

Skeleton edits are automatically cached to `localStorage` (`oaa-viz-skeleton-edits`). If the page is refreshed, pending edits are auto-restored on next load — before the registry fetch. Use Save to Library to commit changes permanently.

**Change Control:**

The Save function stamps `ds:dateModified` on the `ds:Application` entity and optionally bumps the version. The output filename includes the version (e.g. `pfc-app-skeleton-v1.0.0.jsonld`) for registry alignment. `getSkeletonEditSummary()` provides a diff of all renderOrder changes and layer/zone moves since edit mode was entered.

---

### Workflow 26: DS Cross-Ontology Bridge Highlighting (S7.6.2, Epic 7)

DS-ONT defines cross-ontology bridges to EFS, EMC, PE, and ORG-CONTEXT via join patterns JP-DS-001 through JP-DS-004. The bridge highlighting system renders these with per-pattern colours, filterable type toggles, clickable detail cards, path highlighting, and node-detail bridge connections.

```text
Load Registry ──► Multi-graph renders ──► Bridge edges show per-pattern colours
       │                                         │
       ├── JP-DS-001 (lime)    realizesFeature   ──► ds → efs
       ├── JP-DS-002 (cyan)    configuredBy*     ──► ds → emc
       ├── JP-DS-003 (orange)  governedByProcess ──► ds → pe
       └── JP-DS-004 (purple)  ownedByBrand      ──► ds → org-ctx
```

**Bridge Type Filter Toggles:**

1. Load Registry to enter multi-graph mode — bridge type toggle buttons appear in the bridge filter toolbar
2. Each toggle shows a colour dot matching its pattern and a label (e.g. "Feature Realisation")
3. Click a toggle to hide/show all edges of that pattern type — inactive toggles dim to indicate hidden edges
4. The graph re-renders immediately after each toggle; hidden edges are skipped in `renderMultiGraph()`
5. Filter state is stored in `state.dsBridgeTypeFilters` (patternId → boolean)

**Bridge Info Panel — Per-Pattern Cards:**

1. The bridge info panel (toggled via the Bridges button) groups cross-ontology edges by DS bridge pattern
2. Each card shows: colour dot, pattern label (e.g. "Instance Config — JP-DS-002"), edge count, and sample edge list
3. Click a card to expand/collapse its detail section showing individual edges
4. Click **Highlight in Graph** to activate path highlighting for that bridge type

**Bridge Path Highlighting:**

1. From an expanded bridge card, click "Highlight in Graph"
2. All non-matching edges and nodes dim to 15% opacity
3. Matching bridge edges glow with their highlight colour and increased width
4. Connected nodes (source + target) retain full opacity
5. Camera fits to the highlighted subgraph
6. Click empty canvas to clear the highlight and restore normal rendering

**Node Detail — Bridge Connections:**

1. Click any node in the graph to open the details sidebar
2. If the node participates in cross-ontology bridges, a "Bridge Connections" section appears
3. Each bridge is listed with: colour dot, pattern label, direction (outgoing/incoming), and target node ID
4. Click a bridge entry to navigate to the connected node

**Key Constants:**

- `DS_BRIDGE_STYLES` in `state.js` — 5 entries mapping bridge relationship names to colour, dash pattern, patternId, label, and target ontology prefix
- `state.dsBridgeTypeFilters` — runtime filter object (patternId → boolean)

---

## Toolbar Reference

> **Note (v5.8.0):** The toolbar is now skeleton-driven — all buttons, toggles, chips, and dropdowns are rendered dynamically from `pfc-app-skeleton-v1.0.0.jsonld`. The items below reflect the default PFC skeleton. PFI instances may inject additional L4 items via cascade merge. See `ARCH-NAVIGATION.md` for the full catalogue.

| Button / Chip | Function |
|--------|----------|
| **Open JSON File** | File picker for local ontology |
| **Physics** | Toggle force-directed physics on/off |
| **Layout** | Switch between Force-directed, Hierarchical, Circular |
| **Fit View** | Zoom to show all nodes |
| **Reset** | Reload current ontology with default settings |
| **Export** | Dropdown: PNG, SVG, Mermaid, D3, Cypher, reports, diff, DS bundle |
| **Details** | Toggle sidebar panel |
| **OAA Audit** | Toggle compliance/audit panel |
| **Library** | Browse/load saved ontologies |
| **Categories** | Toggle category composition panel |
| **Layers** | Toggle layer filter panel |
| **Load from GitHub** | Fetch from private GitHub repo |
| **Load Registry** | Load all 52 ontologies with tiered navigation |
| **Graph** (chip) | Switch to graph view mode |
| **DS Cascade** (chip) | Switch to design system cascade view |
| **Mermaid** (chip) | Switch to Mermaid diagram view |
| **Mindmap** (chip) | Switch to mindmap view |
| **Skeleton** (chip) | Switch to skeleton graph view |
| **Decision Tree** (chip) | Switch to extensibility decision tree |
| **Registry** (chip) | Switch to full-screen registry browser |
| **Backlog** | Toggle backlog panel |
| **DS Tokens** | Open design system token panel |
| **Token Map** | Open admin panel — 22-zone tree, token inspection, zone overlay |
| **PFC/PFI** | Toggle between PFC and PFI context modes |
| **Instance** (select) | Pick PFI instance (PFI mode only) |
| **Brand** (select) | Pick DS brand variant (PFI mode only) |
| **Lifecycle** | Open PFI lifecycle workbench (PFI mode only) |
| **Skeleton** (admin) | Open Skeleton Inspector panel (Z22) |
| **Global Search** | Open command palette search (`/` shortcut) |
| **+ Test Data** | Overlay test data instances |

---

## Keyboard & Mouse Controls

| Action | Effect |
|--------|--------|
| **Scroll** | Zoom in/out |
| **Drag canvas** | Pan view |
| **Drag node** | Move node (physics adjusts) |
| **Click node** | Select + show details sidebar |
| **Double-click node (single mode)** | Focus + drill into connections tab |
| **Double-click node (multi mode)** | Tier 0: drill into series; Tier 1: drill into ontology/switch series |
| **Click cross-ontology edge** | Navigate to target ontology (Tier 2) — multi-mode only |
| **Click away** | Deselect |
| **Escape** | Close any open modal; clear all zone overlays |
| **L** | Toggle Library panel |
| **C** | Toggle Context quick-switch drawer (F8.8) |
| **H** | Go Home (series overview — multi-mode) |
| **/** | Open global search (command palette) |
| **?** | Show keyboard shortcut help overlay |

---

## Visual Indicators

### Single-Ontology Mode — Node Colours
| Colour | Entity Type |
|--------|-------------|
| Green | Core / Class |
| Blue | Framework |
| Orange | Supporting |
| Pink | Agent |
| Cyan | Layer |
| Purple | Concept |
| Grey | External |
| Teal | Default |

### Multi-Ontology Mode — Series Colours
| Colour | Series |
|--------|--------|
| Blue (#2196F3) | VE-Series (Value Engineering) |
| Green (#4CAF50) | PE-Series (Process Engineering) |
| Orange (#FF9800) | Foundation |
| Pink (#E91E63) | Competitive |
| Purple (#9C27B0) | RCSG-Series (Risk, Compliance, Security & Governance) |
| Cyan (#00BCD4) | Orchestration |
| Grey (#616161) | Placeholder (not yet developed) |

### Edge Styles

**Semantic Categories (F8.6 — resolved from relationship label):**

| Style | Category | Example Labels |
| ----- | -------- | -------------- |
| Solid purple (thick, #7E57C2) | Structural | `contains`, `composedOf`, `hasScope` |
| Dashed grey (#888) | Taxonomy | `subClassOf`, `extends` |
| Solid red (#EF5350) | Dependency | `dependsOn`, `requires` |
| Dot-dash blue (#42A5F5) | Informational | `informs`, `defines`, `measuredBy` |
| Solid green (#66BB6A) | Operational | `produces`, `supports`, `enables` |

**Type-based (fallback for unmapped labels):**

| Style | Meaning |
| ----- | ------- |
| Solid green (#4CAF50) | Standard relationship |
| Dashed grey | Inheritance / subClassOf |
| Solid orange (thick) | Binding |
| **Gold dashed (thick)** | **Cross-ontology reference (multi-mode only)** |
| **Gold solid (thick, #cec528)** | **VE chain edge (when VE highlighted)** |
| **Copper solid (thick, #b87333)** | **PE chain edge (when PE highlighted)** |
| **Series colour solid** | **Edge between ontologies in a highlighted series** |
| **Convergence glow (#FF6B35)** | **VE+PE convergence edge at EFS (when both highlighted)** |
| Dimmed grey dashed | Non-matching edge (when any series highlighting active) |

### Node Shapes (Semantic Coherence — F8.6)

| Shape | Archetype | Size |
| ----- | --------- | ---- |
| Hexagon | Core | 30 |
| Circle (dot) | Class | 20 |
| Box | Framework | 22 (auto-sized to text) |
| Triangle | Supporting | 18 |
| Star | Agent | 25 |
| Diamond | External | 16 |
| Square | Layer | 22 (auto-sized to text) |
| Ellipse | Concept | 18 (auto-sized to text) |
| Large circle (size 45) | Series super-node (Tier 0 only) | 45 |
| Medium circle (size 30) | Ontology node (Tier 1 only) | 30 |
| Faded node (55% opacity) | Context series node (Tier 1 only) | 25 |
| Gold border (thick) | Bridge node (referenced by 3+ ontologies) | — |
| Series colour border + glow | Ontology in a highlighted series | — |
| Convergence border (#FF6B35) | EFS convergence point (when VE + PE both highlighted) | — |

### Silo Indicators
| Visual | Meaning |
|--------|---------|
| Orange dashed border | Isolated node (zero edges) |
| Separate cluster | Disconnected component |

### OAA Verification Indicators

| Visual | Meaning |
|--------|---------|
| PASS badge (green) | Gate passes — e.g. all entities connected (2B), single component (2C) |
| FAIL badge (red) | Gate fails — isolated nodes (2B) or multiple components (2C) |
| WARN badge (orange) | Gate has warnings |
| Green density dot | Edge-to-node ratio meets threshold |
| Yellow density dot | Ratio is 50-100% of threshold |
| Red density dot | Ratio below 50% of threshold |
| Component colours | Each connected component assigned a distinct colour (ColorBrewer Set2, 12 colours) |

---

## Compliance Badge Reference

The compliance badge in the header shows the overall OAA v7.0.0 validation result:

| Badge | Meaning |
|-------|---------|
| Green "OAA v7.0.0 PASS" | All 8 gates passed |
| Orange "OAA v7.0.0 WARN" | Some gates have warnings |
| Red "OAA v7.0.0 FAIL" | One or more gates failed |
| Hidden | Multi-mode or no ontology loaded |

Click the badge to jump directly to the compliance report.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Graph doesn't appear | Check browser console (F12) for errors. Ensure using HTTP server, not file:// |
| Blank page / modules fail | ES modules require an HTTP server. Use the hosted version or `python -m http.server` |
| Nodes overlap badly | Toggle Physics ON, wait for stabilisation, or try Hierarchical layout |
| Can't see all nodes | Click **Fit View** |
| GitHub load fails | Check PAT permissions (needs `repo` scope). Token stored in session only |
| No test data showing | Ensure testData keys match entity `@id` or `name` fields |
| Layout too spread | Try Hierarchical or Circular layout |
| Library not loading | IndexedDB may be blocked in private browsing mode |
| Load Registry shows errors | Some ontology artifact files may not exist yet — placeholders are created for failures |
| Cross-ref edges not showing | Cross-refs are detected from registry `keyBridges` and namespace prefixes. Ontologies without declared bridges won't show cross-refs |
| Series toggles not visible | Series highlight toggles only appear in multi-ontology mode (after Load Registry). They are hidden in single-ontology mode and Tier 2 |
| Edge click doesn't navigate | Only cross-ontology edges pointing to loaded (non-placeholder) ontologies are navigable. Placeholder ontologies cannot be drilled into |
| EFS convergence not showing | EFS convergence styling only appears when both VE and PE series are highlighted simultaneously |
| Zone overlay not appearing | The zone's DOM element may not exist yet (panel not rendered). Hidden zones show a muted centred indicator instead |
| Zone overlay misaligned | Overlays reposition on scroll/resize. If still misaligned, toggle the overlay off and on again |

---

## Deployment

The visualiser is deployed automatically via GitHub Pages when changes are pushed to `main`:

- **Trigger paths:** `PBS/TOOLS/ontology-visualiser/**`, `PBS/ONTOLOGIES/ontology-library/**`
- **Primary URL:** `https://ajrmooreuk.github.io/Azlan-EA-AAA/PBS/TOOLS/ontology-visualiser/browser-viewer.html`
- **Root redirect:** `https://ajrmooreuk.github.io/Azlan-EA-AAA/` (redirects to primary)
- **Legacy URL:** `https://ajrmooreuk.github.io/Azlan-EA-AAA/tools/ontology-visualiser/browser-viewer.html` (backwards compatibility)

The workflow also deploys the ontology library (index, co-located entries + artifacts, glossary, validation reports from `PBS/ONTOLOGIES/ontology-library/`) so the **Load Registry** feature works on the hosted version.

---

## Sample Files

Located in `PBS/TOOLS/ontology-visualiser/`:

| File | Purpose |
|------|---------|
| `sample-ontology-with-data.json` | Demo ontology with embedded test data |
| `sample-test-data.json` | Standalone test data for overlay |

Ontology files for the registry are in `PBS/ONTOLOGIES/ontology-library/` (co-located with their registry entries).

---

## Related Documentation

- [QUICK-START.md](./QUICK-START.md) — 2-minute getting started guide
- [FEATURE-SPEC-Graph-Rollup-DrillThrough-v1.0.0.md](./FEATURE-SPEC-Graph-Rollup-DrillThrough-v1.0.0.md) — v3 feature specification
- [IMPLEMENTATION-PLAN-v1.0.0.md](./IMPLEMENTATION-PLAN-v1.0.0.md) — Original phased implementation plan
- [IMPLEMENTATION-PLAN-v2.0.0.md](./IMPLEMENTATION-PLAN-v2.0.0.md) — Current implementation plan (Epics 1-2 complete)
- [ADR-LOG.md](./ADR-LOG.md) — Architecture Decision Records
- [ARCHITECTURE.md](./ARCHITECTURE.md) — Technical architecture reference
- [DESIGN-SYSTEM-SPEC.md](./DESIGN-SYSTEM-SPEC.md) — Design System Specification — 24 design rules, token cascade, brand integration
- [GRAPH-CANVAS-OPERATING-GUIDE.md](./GRAPH-CANVAS-OPERATING-GUIDE.md) — Normative reference for graph tiers, entity archetypes, edge semantics, same-name entity handling, and cross-ontology navigation
- [unified-glossary-v3.0.0.json](../../ONTOLOGIES/ontology-library/unified-glossary-v3.0.0.json) — Unified glossary with entity archetypes, edge semantics, and graph concepts

---

*OAA Ontology Visualiser v5.7.0 — Operating Guide*
