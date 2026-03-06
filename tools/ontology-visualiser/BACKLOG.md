# OAA Ontology Visualiser — Product Backlog

**Version:** 2.8.0
**Date:** 2026-02-10
**Status:** Active Development

---

## Backlog Overview

```
EPIC 1: OAA 5.0.0 Verification                       [✅ DONE]
EPIC 2: Sub-Ontology Connections                     [✅ DONE]
EPIC 3: Enhanced Audit & Validation                  [✅ DONE]
EPIC 4: Export & Reporting                           [✅ DONE]
EPIC 5: Multi-Source Loading                         [✅ DONE]
EPIC 6: Package & Distribution                       [PRIORITY: LOW]
EPIC 7: Ontology Authoring, Composition & Instances  [PRIORITY: HIGH]
EPIC 8: Design-Director                              [PRIORITY: HIGH]
EPIC 8B: DJM-DESIGN-SYS — DS Asset Preparation        [PRIORITY: HIGH] ← NEW
EPIC 9: Future Design-System Capabilities             [PRIORITY: LOW]
EPIC 10: PE Process-Engineer E2E                       [PRIORITY: HIGH] ← NEW
EPIC 10A: Security MVP — Multi-PFI Foundation            [PRIORITY: HIGH] ← NEW
EPIC 11: Admin-Cleanup                                  [PRIORITY: MED — ONGOING]
EPIC 12: PFI-BAIV-AIV-Build                             [PRIORITY: HIGH — TBD]
EPIC 13: PFI-W4M-PF-Core & Client Sub-Instances         [PRIORITY: HIGH — TBD]
EPIC 14: PFI-AIRL-EA-AIR                                [PRIORITY: HIGH — TBD]
EPIC 15: PFI-W4M-EA-Togaf                               [PRIORITY: HIGH — TBD]
EPIC 16: PFI-RCS-W4M-AIR-Collab-MS-Azure-EA-Assess     [PRIORITY: HIGH — TBD]
```

---

## EPIC 1: OAA 5.0.0 Verification

**Goal:** Enable visual verification that ontologies pass new OAA 5.0.0 connectivity gates

### Feature 1.1: GATE 2B Violation Highlighting

**Stories:**

| ID | Story | Points | Status |
|----|-------|--------|--------|
| 1.1.1 | As a user, I want isolated nodes (zero edges) highlighted with orange dashed borders so I can immediately see GATE 2B violations | 3 | ✅ Done |
| 1.1.2 | As a user, I want the Audit panel to list all isolated nodes with their IDs so I can fix them in the source | 2 | ✅ Done |
| 1.1.3 | As a user, I want to click an isolated node in the Audit panel to focus on it in the graph | 2 | ✅ Done |
| 1.1.4 | As a user, I want a PASS/FAIL badge for GATE 2B in the Audit panel | 1 | ✅ Done |

### Feature 1.2: GATE 2C Component Analysis

**Stories:**

| ID | Story | Points | Status |
|----|-------|--------|--------|
| 1.2.1 | As a user, I want to see the number of connected components so I know if my ontology has disconnected clusters | 2 | ✅ Done |
| 1.2.2 | As a user, I want each component colored differently so I can visually distinguish clusters | 3 | ✅ Done |
| 1.2.3 | As a user, I want to filter view to show only a specific component | 3 | ✅ Done |
| 1.2.4 | As a user, I want a PASS/WARNING badge for GATE 2C based on component count | 1 | ✅ Done |

### Feature 1.3: Relationship Density Metrics

**Stories:**

| ID | Story | Points | Status |
|----|-------|--------|--------|
| 1.3.1 | As a user, I want to see edge-to-node ratio in the stats bar | 1 | ✅ Done |
| 1.3.2 | As a user, I want visual indicator (green/yellow/red) based on density threshold | 2 | ✅ Done |
| 1.3.3 | As a user, I want to configure the density threshold (default 0.8) | 2 | ✅ Done |

### Feature 1.4: OAA Gate Summary Report

**Stories:**

| ID | Story | Points | Status |
|----|-------|--------|--------|
| 1.4.1 | As a user, I want a consolidated "OAA Gates" section showing all gate statuses | 3 | ✅ Done |
| 1.4.2 | As a user, I want to export a validation report as Markdown | 3 | ✅ Done |
| 1.4.3 | As a user, I want to copy gate results to clipboard for pasting into PRs | 2 | ✅ Done |

---

## EPIC 2: Sub-Ontology Connections

**Goal:** Enable visualization and management of connections between related ontologies through shared nodes and cross-references

### Architecture: Sub-Ontology Connection Model

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                           ONTOLOGY LIBRARY                                    │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│   ┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐│
│   │ Foundation      │         │ Domain A        │         │ Domain B        ││
│   │ Ontology        │         │ Ontology        │         │ Ontology        ││
│   │                 │         │                 │         │                 ││
│   │  ┌───────────┐  │         │  ┌───────────┐  │         │  ┌───────────┐  ││
│   │  │ Entity:   │  │◄────────│  │ extends:  │  │         │  │ extends:  │──┼┼─┐
│   │  │ Person    │  │  refs   │  │ Customer  │  │         │  │ Vendor    │  ││ │
│   │  └───────────┘  │         │  └───────────┘  │         │  └───────────┘  ││ │
│   │                 │         │                 │         │                 ││ │
│   │  ┌───────────┐  │         │  ┌───────────┐  │◄────────│  ┌───────────┐  ││ │
│   │  │ Entity:   │  │◄────────│  │ uses:     │  │  refs   │  │ uses:     │──┼┼─┤
│   │  │ Location  │  │  refs   │  │ Address   │  │         │  │ Warehouse │  ││ │
│   │  └───────────┘  │         │  └───────────┘  │         │  └───────────┘  ││ │
│   │                 │         │                 │         │                 ││ │
│   └────────▲────────┘         └─────────────────┘         └─────────────────┘│ │
│            │                                                                  │ │
│            │                                                                  │ │
│            └──────────────────────────────────────────────────────────────────┼─┘
│                              Cross-Ontology References                        │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Connection Types

| Type | Description | Edge Style |
|------|-------------|------------|
| `extends` | Entity inherits from foundation entity | Solid, arrow |
| `references` | Entity points to entity in another ontology | Dashed, arrow |
| `sameAs` | Entities are equivalent across ontologies | Dotted, bidirectional |
| `imports` | Entire ontology imported as dependency | Thick, to subgraph |

### Feature 2.1: Multi-Ontology Loading

**Stories:**

| ID | Story | Points | Status |
|----|-------|--------|--------|
| 2.1.1 | As a user, I want to load multiple ontology files and see them merged in one graph | 5 | ✅ Done (Epic #32) |
| 2.1.2 | As a user, I want each ontology visually grouped (subgraph) with a label | 3 | ✅ Done (Epic #32) |
| 2.1.3 | As a user, I want to toggle visibility of individual ontologies | 3 | ✅ Done (Epic #32) |
| 2.1.4 | As a user, I want to see a list of loaded ontologies with metadata | 2 | ✅ Done (Epic #32) |

### Feature 2.2: Cross-Ontology Edge Detection

**Stories:**

| ID | Story | Points | Status |
|----|-------|--------|--------|
| 2.2.1 | As a user, I want edges that reference external entities (e.g., `foundation:Person`) to render as cross-ontology links | 5 | ✅ Done (Epic #32) |
| 2.2.2 | As a user, I want cross-ontology edges styled differently (dashed, different color) | 2 | ✅ Done (Epic #32) |
| 2.2.3 | As a user, I want the Audit panel to report cross-ontology dependencies | 3 | ✅ Done (Epic #32) |
| 2.2.4 | As a user, I want to see which foundation entities are extended by domain ontologies | 3 | ✅ Done (#73) |

### Feature 2.3: Bridge Node Highlighting

**Stories:**

| ID | Story | Points | Status |
|----|-------|--------|--------|
| 2.3.1 | As a user, I want "bridge nodes" (entities connecting multiple ontologies) highlighted with a special indicator | 3 | ✅ Done (Epic #32) |
| 2.3.2 | As a user, I want to filter to show only bridge nodes and their connections | 3 | ✅ Done (Epic #32) |
| 2.3.3 | As a user, I want the Details panel to show which ontologies reference this entity | 2 | ✅ Done (#73) |

### Feature 2.4: Ontology Library View

**Stories:**

| ID | Story | Points | Status |
|----|-------|--------|--------|
| 2.4.1 | As a user, I want a "Library" panel showing all available ontologies in my workspace | 5 | ✅ Done (#70) |
| 2.4.2 | As a user, I want to drag ontologies from Library onto the graph to add them | 3 | ✅ Done (#71) |
| 2.4.3 | As a user, I want to see dependency graph of ontologies (which imports which) | 5 | ✅ Done (#72) |

### Sub-Ontology Connection Schema

```json
{
  "@context": {
    "pf": "https://platformfoundation.io/ontology/",
    "extends": "pf:extends",
    "references": "pf:references",
    "imports": "pf:imports"
  },
  "ontologyId": "domain-a-ontology",
  "imports": [
    "pf:foundation-ontology"
  ],
  "entities": [
    {
      "@id": "Customer",
      "extends": "pf:Person",
      "name": "Customer",
      "properties": [...]
    },
    {
      "@id": "Address",
      "references": "pf:Location",
      "name": "Address"
    }
  ],
  "relationships": [
    {
      "name": "livesAt",
      "domainIncludes": ["Customer"],
      "rangeIncludes": ["Address"],
      "crossOntology": false
    },
    {
      "name": "birthPlace",
      "domainIncludes": ["Customer"],
      "rangeIncludes": ["pf:Location"],
      "crossOntology": true
    }
  ]
}
```

---

## EPIC 3: Enhanced Audit & Validation

**Goal:** Comprehensive ontology quality analysis beyond connectivity
**Required on completion:** Update BACKLOG.md, ARCHITECTURE.md, README.md, OPERATING-GUIDE.md

### Feature 3.1: Schema Validation

**Stories:**

| ID | Story | Points | Status |
|----|-------|--------|--------|
| 3.1.1 | As a user, I want required properties flagged if missing from entity definitions | 3 | ✅ Done |
| 3.1.2 | As a user, I want property type mismatches highlighted | 3 | ✅ Done |
| 3.1.3 | As a user, I want cardinality validation (1..*, 0..1, etc.) checked | 3 | ✅ Done |

### Feature 3.2: Naming Convention Checks

**Stories:**

| ID | Story | Points | Status |
|----|-------|--------|--------|
| 3.2.1 | As a user, I want entity names validated against PascalCase convention | 2 | ✅ Done |
| 3.2.2 | As a user, I want relationship names validated against camelCase convention | 2 | ✅ Done |
| 3.2.3 | As a user, I want @id values validated for uniqueness | 2 | ✅ Done |

### Feature 3.3: Completeness Scoring

**Stories:**

| ID | Story | Points | Status |
|----|-------|--------|--------|
| 3.3.1 | As a user, I want an overall "Completeness Score" (0-100%) based on all gates | 3 | ✅ Done |
| 3.3.2 | As a user, I want breakdown of score by category (connectivity, schema, naming) | 3 | ✅ Done |
| 3.3.3 | As a user, I want to compare scores across multiple ontologies | 5 | ✅ Done |

---

## EPIC 4: Export & Reporting

**Goal:** Generate artifacts for documentation and CI/CD integration
**Required on completion:** Update BACKLOG.md, ARCHITECTURE.md, README.md, OPERATING-GUIDE.md

### Feature 4.1: Validation Report Export

**Stories:**

| ID | Story | Points | Status |
|----|-------|--------|--------|
| 4.1.1 | As a user, I want to export validation results as Markdown for PR reviews | 3 | ✅ Done |
| 4.1.2 | As a user, I want to export validation results as JSON for CI pipelines | 2 | ✅ Done |
| 4.1.3 | As a user, I want to generate a PDF report with graph snapshot | 5 | ✅ Done |

### Feature 4.2: Graph Export Formats

**Stories:**

| ID | Story | Points | Status |
|----|-------|--------|--------|
| 4.2.1 | As a user, I want to export graph as PNG with transparent background option | 2 | ✅ Done |
| 4.2.2 | As a user, I want to export graph as SVG for scalable documentation | 3 | ✅ Done |
| 4.2.3 | As a user, I want to export graph data as Mermaid diagram code | 3 | ✅ Done |
| 4.2.4 | As a user, I want to export as D3.js-compatible JSON | 2 | ✅ Done |

### Feature 4.3: Changelog Generation

**Stories:**

| ID | Story | Points | Status |
|----|-------|--------|--------|
| 4.3.1 | As a user, I want to compare two versions of an ontology and see differences | 5 | ✅ Done |
| 4.3.2 | As a user, I want added/removed/modified entities highlighted in diff view | 5 | ✅ Done |
| 4.3.3 | As a user, I want to generate a changelog Markdown from the diff | 3 | ✅ Done |

---

## EPIC 5: Multi-Source Loading

**Goal:** Load ontologies from various sources beyond local files
**Required on completion:** Update BACKLOG.md, ARCHITECTURE.md, README.md, OPERATING-GUIDE.md

### Feature 5.1: GitHub Integration Enhancements

**Stories:**

| ID | Story | Points | Status |
|----|-------|--------|--------|
| 5.1.1 | As a user, I want to browse GitHub repos and select files visually | 5 | ✅ Done |
| 5.1.2 | As a user, I want to load from specific branches/tags | 2 | ✅ Done |
| 5.1.3 | As a user, I want to authenticate via GitHub PAT with optional persistence | 5 | ✅ Done |

### Feature 5.2: URL Loading

**Stories:**

| ID | Story | Points | Status |
|----|-------|--------|--------|
| 5.2.1 | As a user, I want to paste any URL to a JSON file and load it | 3 | ✅ Done |
| 5.2.2 | As a user, I want to load from CDN-hosted ontology registries | 3 | ✅ Done |

### Feature 5.3: Local Storage

**Stories:**

| ID | Story | Points | Status |
|----|-------|--------|--------|
| 5.3.1 | As a user, I want recently loaded ontologies saved in browser storage | 3 | ✅ Done |
| 5.3.2 | As a user, I want a "Recent Files" quick-access list | 2 | ✅ Done |
| 5.3.3 | As a user, I want to bookmark favorite ontologies | 2 | ✅ Done |

---

## EPIC 6: Package & Distribution

**Goal:** Make visualiser available through standard package managers
**Required on completion:** Update BACKLOG.md, ARCHITECTURE.md, README.md, OPERATING-GUIDE.md

### Feature 6.1: npm Package

**Stories:**

| ID | Story | Points | Status |
|----|-------|--------|--------|
| 6.1.1 | As a developer, I want to install visualiser via `npm install @baiv/ontology-visualiser` | 5 | Backlog |
| 6.1.2 | As a developer, I want TypeScript type definitions included | 3 | Backlog |
| 6.1.3 | As a developer, I want to embed visualiser as a React/Vue component | 8 | Backlog |

### Feature 6.2: CLI Tool

**Stories:**

| ID | Story | Points | Status |
|----|-------|--------|--------|
| 6.2.1 | As a CI pipeline, I want to run `oaa-validate ontology.json` and get exit code | 5 | Backlog |
| 6.2.2 | As a CI pipeline, I want JSON output for parsing in scripts | 2 | Backlog |
| 6.2.3 | As a developer, I want to generate PNG graphs headlessly | 5 | Backlog |

### Feature 6.3: Docker Image

**Stories:**

| ID | Story | Points | Status |
|----|-------|--------|--------|
| 6.3.1 | As a user, I want to run visualiser via `docker run -p 8080:80 baiv/ontology-visualiser` | 3 | Backlog |
| 6.3.2 | As a user, I want to mount local ontology files into container | 2 | Backlog |

---

## EPIC 7: Azlan Ontology Authoring, Composition & Instance Management

**Goal:** Transform Azlan from a read-only visualiser into an authoring platform that can enhance, generate, and version-control ontologies — and leverage EMC orchestration to compose platform/product-specific instances with domain data and knowledge
**Required on completion:** Update BACKLOG.md, ARCHITECTURE.md, README.md, OPERATING-GUIDE.md

### Feature 7.1: Ontology Authoring & Revision Generation

**Stories:**

| ID | Story | Points | Status |
|----|-------|--------|--------|
| 7.1.1 | As a user, I want to create a new blank ontology from a template within Azlan so I can author ontologies without editing raw JSON | 5 | ✅ Done |
| 7.1.2 | As a user, I want to add, edit, and remove entities and their properties on a loaded ontology so I can enhance existing ontologies | 5 | ✅ Done |
| 7.1.3 | As a user, I want to add, edit, and remove relationships between entities so I can refine the ontology graph | 5 | ✅ Done |
| 7.1.4 | As a user, I want to generate a new revision (semver version bump) of an ontology with my changes so revisions are tracked | 3 | ✅ Done |
| 7.1.5 | As a user, I want authored/revised ontologies saved in OAA-compliant JSON-LD format so they integrate with the ontology library | 3 | ✅ Done |
| 7.1.6 | As a user, I want the ontology validated against all OAA gates before saving so I cannot create non-compliant ontologies | 3 | ✅ Done |
| 7.1.7 | As a user, I want to fork an existing ontology as a new ontology with a new namespace so I can create domain variants | 3 | ✅ Done |

### Feature 7.2: Revision Documentation & Glossary Management

**Stories:**

| ID | Story | Points | Status |
|----|-------|--------|--------|
| 7.2.1 | As a user, I want changelogs auto-generated when I create a new revision showing added/removed/modified entities and relationships | 5 | ✅ Done |
| 7.2.2 | As a user, I want to add/update unified glossary entries for new or modified terms directly from the authoring UI | 3 | ✅ Done |
| 7.2.3 | As a user, I want a revision history panel showing all versions of an ontology with diffs between adjacent versions | 5 | ✅ Done |
| 7.2.4 | As a user, I want to export revision documentation as Markdown for PR reviews and release bulletins | 3 | ✅ Done |
| 7.2.5 | As a user, I want glossary entries linked to ontology entities so navigating from glossary to graph node is seamless | 3 | ✅ Done |

### Feature 7.3: EMC-Driven Composition & Platform Instances

**Stories:**

| ID | Story | Points | Status |
|----|-------|--------|--------|
| 7.3.1 | As a user, I want to select an EMC Requirement Category (e.g., STRATEGIC, COMPLIANCE, AGENTIC) and have Azlan auto-compose the required ontology set per EMC composition rules | 8 | ✅ Done |
| 7.3.2 | As a user, I want to choose PFC (core templates) or PFI (product instance) context and have the composition filtered accordingly | 5 | ✅ Done |
| 7.3.3 | As a user, I want to create a new PFI Instance Configuration (e.g., for a new product) that specifies which ontologies and instance data to load | 5 | ✅ Done |
| 7.3.4 | As a user, I want EMC composition rules (Foundation Always Required, Dependency Chain, Maturity Filtering, RCSG Overlay) applied automatically so invalid compositions are prevented | 5 | ✅ Done |
| 7.3.5 | As a user, I want to generate test data (sample entities, relationships) for a composed ontology set so I can validate integrations before production use | 5 | ✅ Done |
| 7.3.6 | As a user, I want to export composed ontology sets and test data as JSONB-compatible output for platform database ingestion | 5 | ✅ Done |
| 7.3.7 | As a user, I want composed ontology sets version-controlled with a composition manifest that records which ontology versions were included | 3 | ✅ Done |

### Feature 7.4: Domain-Specific Data & Knowledge Management

**Stories:**

| ID | Story | Points | Status |
|----|-------|--------|--------|
| 7.4.1 | As a user, I want to create product-specific ontology instances (like BAIV-AIV) that extend PFC ontologies with domain-specific entities and data | 8 | ✅ Done |
| 7.4.2 | As a user, I want domain instance data validated against the parent PFC ontology schema so domain extensions stay consistent | 5 | ✅ Done |
| 7.4.3 | As a user, I want to visualise the lineage from PFC core entities to their domain-specific extensions so I can trace inheritance | 3 | ✅ Done |
| 7.4.4 | As a user, I want domain ontologies version-controlled independently from their PFC parents with linked dependency tracking | 5 | ✅ Done |
| 7.4.5 | As a user, I want to merge domain knowledge back into shared ontologies when patterns prove reusable across products | 5 | ✅ Done |

### Feature 7.5: Graph Selection Export

**Stories:**

| ID | Story | Points | Status |
|----|-------|--------|--------|
| 7.5.1 | As a user, I want to select a subgraph (specific nodes and edges) in the canvas and export only the selection | 5 | ✅ Done |
| 7.5.2 | As a user, I want selected subgraph exportable in all supported formats (PNG, SVG, Mermaid, JSON-LD, Markdown) | 3 | ✅ Done |
| 7.5.3 | As a user, I want to save a named selection as a reusable "view" so I can re-export it after ontology changes | 3 | ✅ Done |

### Feature 7.6: Design System Integration

**Stories:**

| ID | Story | Points | Status |
|----|-------|--------|--------|
| 7.6.1 | As a user, I want to load DS-ONT and visualise the three-tier token cascade (Primitive → Semantic → Component) with cascade edges styled distinctly | 5 | Backlog |
| 7.6.2 | As a user, I want to see DS cross-ontology bridges to EFS (realizesFeature), EMC (configuredByInstance), and PE (governedByProcess) in the merged graph | 3 | Backlog |
| 7.6.3 | As a user, I want to select a PFI/Brand variant and see which DS config, Figma source, tokens, and components apply for that brand | 5 | Backlog |
| 7.6.4 | As a user, I want to author/extend DesignComponents with token bindings and atomic design level classification in the authoring UI | 5 | Backlog |
| 7.6.5 | As a user, I want to define Page and Template entities in DS-ONT that capture layout structure, slot definitions, and component placement rules so page composition is ontology-governed | 5 | Backlog |
| 7.6.6 | As a user, I want pages and templates stored as versioned artefacts (IndexedDB / Supabase) with references to the DesignComponents and tokens they consume so I can trace page → component → token lineage | 5 | Backlog |
| 7.6.7 | As a user, I want to visualise the full DS e2e workflow path (Figma Source → Token Extraction → Token Storage → Component Binding → Page/Template Assembly → Brand Resolution) as a directed graph in the merged view | 5 | Backlog |
| 7.6.8 | As a user, I want page/template definitions exportable as input to the Design-Director pipeline (Epic 8) so authored layouts feed directly into code generation and Figma Make round-tripping | 3 | Backlog |

### Feature 7.7: Library Integration & Registry Management

**Goal:** When ontologies are authored, revised, or imported, automatically manage registry entries, index updates, EMC composition rules, dependency chains, and provide adopt/draft decision gates — preventing orphaned ontologies that exist in files but not in the registry.

**Stories:**

| ID | Story | Points | Status |
|----|-------|--------|--------|
| 7.7.1 | As an ontology author, I want a "Publish to Library" action after authoring that auto-generates the registry entry (Entry-ONT-*.json) with OAA gate compliance status, artifacts, components, and relationship counts | 5 | Backlog |
| 7.7.2 | As an ontology author, I want the registry index (ont-registry-index.json) auto-updated on publish — namespace added, series updated, statistics bumped, validation summary refreshed | 5 | Backlog |
| 7.7.3 | As an ontology author, I want dependent ontology entries auto-updated when I add cross-ontology references — my ontology added to their dependents list and their entries added to my dependencies | 5 | Backlog |
| 7.7.4 | As an ontology author, I want to choose between "Draft" (saved locally for review, not published to registry) and "Adopt" (full publish with registry integration) when integrating changes to PFC or PFI ontologies | 3 | Backlog |
| 7.7.5 | As an ontology author, I want a diff preview showing all proposed registry/library changes (new entries, index updates, dependent entry changes, EMC composition updates) before confirming adoption | 5 | Backlog |
| 7.7.6 | As an ontology author, I want OAA gate validation enforced before adoption — drafts may be non-compliant but adopted ontologies must pass all gates | 3 | Backlog |
| 7.7.7 | As an ontology author, I want a "Library Status" indicator on each ontology showing: Adopted (in registry), Draft (not yet published), Modified (file differs from registry entry), or Orphaned (file exists without entry) | 3 | Backlog |
| 7.7.8 | As an ontology author, I want bulk operations to detect and resolve orphaned ontologies — files that exist in the library but have no registry entry — with one-click adopt or archive | 3 | Backlog |
| 7.7.9 | As an ontology author, I want EMC composition rules (CATEGORY_COMPOSITIONS, DEPENDENCY_MAP, NAME_TO_PREFIX) auto-updated when a new ontology is adopted, based on its series, dependencies, and cross-ontology references | 5 | Backlog |
| 7.7.10 | As an ontology author, I want revision history auto-appended to registry entries when I publish a new version, with version bump, date, and change summary | 3 | Backlog |

### Feature 7.8: Audit Log & Change Tracking

**Goal:** Provide a viewable, queryable audit log for all ontology management operations — authoring, publishing, cross-reference changes, EMC updates, and PE process governance — enabling end-to-end traceability of who changed what, when, and why across the ontology lifecycle.

**Stories:**

| ID | Story | Points | Status |
|----|-------|--------|--------|
| 7.8.1 | As an ontology manager, I want all ontology CRUD operations (create, update, publish, archive) logged to an append-only audit trail with timestamp, user, action type, ontology ID, and change summary | 5 | Backlog |
| 7.8.2 | As an ontology manager, I want an Audit Log panel in the visualiser UI that displays recent operations filterable by ontology, action type, date range, and user | 5 | Backlog |
| 7.8.3 | As an ontology manager, I want cross-ontology reference changes (adding/removing bridges, updating dependents) logged as discrete audit events with before/after state for each affected entry | 5 | Backlog |
| 7.8.4 | As an ontology manager, I want EMC composition rule changes (DEPENDENCY_MAP, CATEGORY_COMPOSITIONS, NAME_TO_PREFIX) logged with the triggering ontology publish event so I can trace why composition rules changed | 3 | Backlog |
| 7.8.5 | As an ontology manager, I want registry index updates (statistics, namespaces, series, validation summary) logged with diff showing old vs new values | 3 | Backlog |
| 7.8.6 | As an ontology manager, I want PE process governance events (OAA gate validation results, adopt/draft decisions, compliance status changes) logged to the audit trail for regulatory and quality traceability | 5 | Backlog |
| 7.8.7 | As an ontology manager, I want the audit log exportable as Markdown or JSON for external reporting, compliance evidence, and integration with PE process documentation | 3 | Backlog |
| 7.8.8 | As an ontology manager, I want audit entries linked to the PE process step that triggered them (e.g., "Published during Sprint 12 — Feature 7.7 Library Integration") for process-ontology alignment | 3 | Backlog |

### Feature 7.9: EMC PE Change Ripple Management

**Goal:** When PFC (Platform Foundation Core) ontologies are changed, automatically detect and manage the ripple effects across all PFI (Platform Foundation Instance) ontologies and compositions — preventing unintended consequences from upstream ontology changes propagating silently to downstream instances.

**Stories:**

| ID | Story | Points | Status |
|----|-------|--------|--------|
| 7.9.1 | As an ontology architect, I want a "Change Impact Analysis" action that, given a PFC ontology change, identifies all affected PFI instances, dependent ontologies, and EMC compositions that reference the changed entities or relationships | 8 | Backlog |
| 7.9.2 | As an ontology architect, I want a visual ripple map showing PFC → PFI propagation paths — which instances consume the changed ontology, via which EMC composition categories, and which cross-ontology bridges are affected | 5 | Backlog |
| 7.9.3 | As an ontology architect, I want PFI ontology compositions to declare a pinned PFC version so upstream changes don't automatically propagate — instances must explicitly adopt new PFC versions | 5 | Backlog |
| 7.9.4 | As an ontology architect, I want a "Breaking Change" classification (additive, compatible, breaking) computed from the diff — new entities/relationships are additive, modified descriptions are compatible, removed/renamed entities or changed cardinality are breaking | 5 | Backlog |
| 7.9.5 | As an ontology architect, I want breaking PFC changes to require explicit approval per affected PFI before propagation, with a review workflow showing the diff and impact per instance | 5 | Backlog |
| 7.9.6 | As an ontology architect, I want EMC composition rules to track PFC ontology versions per PFI instance — so each instance can be at a different PFC version during staged rollouts | 5 | Backlog |
| 7.9.7 | As an ontology architect, I want a "PFI Health Check" that validates each instance's ontology composition against current PFC versions, flagging stale dependencies, missing required ontologies, and version mismatches | 5 | Backlog |
| 7.9.8 | As an ontology architect, I want all ripple propagation decisions (adopt, defer, reject per PFI) logged to the audit trail with rationale, enabling change governance across the platform ecosystem | 3 | Backlog |

---

## EPIC 8: Design-Director

**Goal:** End-to-end design system process combining DS-ONT, Figma MCP extraction, Supabase token storage, component code generation, and multi-brand resolution via EMC — proving the workflow with Azlan Ontology Visualiser as the first application
**Required on completion:** Update BACKLOG.md, ARCHITECTURE.md, README.md, OPERATING-GUIDE.md

### Feature 8.1: Figma Token Extraction Pipeline

**Stories:**

| ID | Story | Points | Status |
|----|-------|--------|--------|
| 8.1.1 | As a developer, I want to extract design tokens from a Figma file via MCP (get_variable_defs) and receive structured JSON output | 5 | Backlog |
| 8.1.2 | As a developer, I want extracted tokens automatically classified into the three-tier cascade (primitive/semantic/component) | 5 | Backlog |
| 8.1.3 | As a developer, I want extracted tokens validated against DS-ONT schema (business rules BR-DS-001 through BR-DS-008) | 3 | Backlog |
| 8.1.4 | As a developer, I want light and dark mode token values extracted and mapped to ThemeMode entities | 3 | Backlog |

### Feature 8.2: Token Storage & Resolution

**Stories:**

| ID | Story | Points | Status |
|----|-------|--------|--------|
| 8.2.1 | As a developer, I want to set up Supabase JSONB storage for design system tokens following the schema from ds-e2e-prototype | 5 | Backlog |
| 8.2.2 | As a developer, I want a resolve_token() SQL function that cascades through Component → Semantic → Primitive tiers with max 10-depth recursion | 5 | Backlog |
| 8.2.3 | As a developer, I want to switch active brand at runtime by updating the active BrandVariant without redeployment | 3 | Backlog |
| 8.2.4 | As a developer, I want token version history tracked so I can roll back to previous design system versions | 3 | Backlog |

### Feature 8.3: Component Code Generation

**Stories:**

| ID | Story | Points | Status |
|----|-------|--------|--------|
| 8.3.1 | As a developer, I want DS-ONT DesignComponent definitions to generate React/Shadcn component wrappers with token bindings | 8 | Backlog |
| 8.3.2 | As a developer, I want generated components to output CSS custom properties from the token cascade | 3 | Backlog |
| 8.3.3 | As a developer, I want generated component output usable as Figma Make input for design-to-code round-tripping | 5 | Backlog |
| 8.3.4 | As a developer, I want to preview components with resolved tokens in a browser sandbox before committing | 5 | Backlog |

### Feature 8.4: Multi-Brand EMC Resolution

**Stories:**

| ID | Story | Points | Status |
|----|-------|--------|--------|
| 8.4.1 | As a developer, I want EMC InstanceConfiguration to include a designSystemConfig reference with DS config URL and brand binding | 5 | Backlog |
| 8.4.2 | As a developer, I want to resolve PFI-BAIV to BAIV design system, PFI-W4M to W4M design system via EMC composition rules | 5 | Backlog |
| 8.4.3 | As a developer, I want DS config files version-controlled with URL-based resolution (e.g., ds-config-baiv-v1.0.0.json) | 3 | Backlog |
| 8.4.4 | As a developer, I want to test brand switching across BAIV, W4M, and Azlan-PFC brands in the Azlan test environment | 5 | Backlog |

### Feature 8.5: Agentic Design Workflow

**Stories:**

| ID | Story | Points | Status |
|----|-------|--------|--------|
| 8.5.1 | As a developer, I want an agent skill for design token extraction that invokes Figma MCP and produces DS-ONT-compliant output | 8 | Backlog |
| 8.5.2 | As a developer, I want an agent skill for layout management that reads page specs and applies DS component tokens | 5 | Backlog |
| 8.5.3 | As a developer, I want an agent skill for code generation that produces React/CSS from DS-ONT component definitions | 5 | Backlog |
| 8.5.4 | As a developer, I want agent workflows orchestrated via PE process definitions with gate validations | 5 | Backlog |

---

## EPIC 8B: DJM-DESIGN-SYS — Design System Asset Preparation

**Goal:** Formalise and prepare existing design system prototype assets (tokens, configs, Figma references, component definitions) as structured data ready for DS-ONT ontology integration and consumption by Epic 8 (Design-Director)
**Source:** `PBS/DESIGN-SYSTEM/ds-e2e-prototype-azlan/` — existing v1 ontology, token taxonomy, React provider, CSS properties, brand configs
**Required on completion:** Update BACKLOG.md, ARCHITECTURE.md, README.md, OPERATING-GUIDE.md, IMPLEMENTATION-PLAN

### Feature 8B.1: DS-ONT Ontology Creation

**Stories:**

| ID | Story | Points | Status |
|----|-------|--------|--------|
| 8B.1.1 | As a developer, I want DS-ONT created as an OAA v6.1.0 compliant ontology in PE-Series/DS-ONT/ with 10 owned entities (DesignSystem, PrimitiveToken, SemanticToken, ComponentToken, DesignComponent, BrandVariant, FigmaSource, ThemeMode, TokenCategory, DesignPattern) and 3 external stubs (efs:Feature, emc:InstanceConfiguration, pe:Process) | 8 | Backlog |
| 8B.1.2 | As a developer, I want DS-ONT registered in ont-registry-index.json with Entry-ONT-DS-001, namespace ds:, and dependency links to EFS-ONT, EMC-ONT, PE-ONT | 3 | Backlog |
| 8B.1.3 | As a developer, I want DS-ONT cross-ontology bridges (realizesFeature → EFS, configuredByInstance → EMC, governedByProcess → PE) with oaa:crossOntologyRef annotations | 3 | Backlog |
| 8B.1.4 | As a developer, I want DS-ONT business rules (8 rules, IF-THEN format) encoding token cascade constraints, theme mode requirements, and Figma sync staleness checks | 3 | Backlog |

### Feature 8B.2: Token Taxonomy Formalisation

**Stories:**

| ID | Story | Points | Status |
|----|-------|--------|--------|
| 8B.2.1 | As a developer, I want existing BAIV primitive tokens (88+ colours, spacing, radius, typography from baiv-tokens.css) mapped to DS-ONT PrimitiveToken entities with category classification | 5 | Backlog |
| 8B.2.2 | As a developer, I want existing BAIV semantic tokens (8 intent categories × 4 variants: surface, text, border, accent, feedback) mapped to DS-ONT SemanticToken entities with referencesPrimitive links | 5 | Backlog |
| 8B.2.3 | As a developer, I want existing BAIV component tokens (Button, Card, Input, Alert, Checkbox) mapped to DS-ONT ComponentToken entities with referencesSemantic links | 3 | Backlog |
| 8B.2.4 | As a developer, I want token taxonomy exported as structured JSON matching DS-ONT schema so it can be loaded into Supabase and validated against the ontology | 3 | Backlog |

### Feature 8B.3: Brand & Figma Configuration

**Stories:**

| ID | Story | Points | Status |
|----|-------|--------|--------|
| 8B.3.1 | As a developer, I want azlan-ds-config.json upgraded to reference DS-ONT entities, linking brand variants (BAIV active, W4M/Azlan-PFC placeholder) to BrandVariant ontology entities | 3 | Backlog |
| 8B.3.2 | As a developer, I want Figma source metadata (file key bXCyfNwzc8Z9kEeFIeIB8C, variable collections) structured as DS-ONT FigmaSource entities with sync status tracking | 3 | Backlog |
| 8B.3.3 | As a developer, I want the v1 ontology (design-system-ontology-v1.0.0.json) migrated from Schema.org format to OAA v6.1.0 format, preserved as source material in PE-Series/DS-ONT/source/ | 2 | Backlog |

### Feature 8B.4: Component & Pattern Definitions

**Stories:**

| ID | Story | Points | Status |
|----|-------|--------|--------|
| 8B.4.1 | As a developer, I want existing React provider patterns (DesignSystemContext, useToken, useComponentTokens from baiv-tokens.tsx) documented as DS-ONT DesignComponent instances with atomic design level classification | 3 | Backlog |
| 8B.4.2 | As a developer, I want the 6-stage E2E workflow (Extract → Transform → Store → Resolve → Bind → Render) from azlan-ds-config.json formalised as a PE process definition referencing DS-ONT entities at each stage | 5 | Backlog |
| 8B.4.3 | As a developer, I want Supabase schema definitions (design_system, brand_variants, token_versions tables) documented with ontology reference columns linking JSONB data to DS-ONT entity URIs | 3 | Backlog |

---

## EPIC 9: Future Design-System Capabilities

**Goal:** Extend the Design-Director foundation with advanced design system capabilities including Figma Make kit generation, pre-release beta testing workflows, social media integration via FigJam, and emerging W3C standards adoption
**Required on completion:** Update BACKLOG.md, ARCHITECTURE.md, README.md, OPERATING-GUIDE.md

### Feature 9.1: Figma Make Kit Generation

**Stories:**

| ID | Story | Points | Status |
|----|-------|--------|--------|
| 9.1.1 | As a developer, I want DS-ONT component definitions to generate Figma Make-compatible kit files that can be imported as reusable Figma components | 8 | Backlog |
| 9.1.2 | As a developer, I want Make kits to include token bindings so Figma components stay in sync with the DS token cascade | 5 | Backlog |
| 9.1.3 | As a developer, I want Make kits generated per brand variant so each PFI product gets a branded Figma component library | 5 | Backlog |
| 9.1.4 | As a developer, I want round-trip sync between Make kits and DS-ONT — changes in Figma propagate back to ontology definitions | 8 | Backlog |
| 9.1.5 | As a developer, I want Make kit versioning aligned with DS-ONT versions so kit consumers can pin to specific design system releases | 3 | Backlog |

### Feature 9.2: Pre-Release Beta Test Options

**Stories:**

| ID | Story | Points | Status |
|----|-------|--------|--------|
| 9.2.1 | As a developer, I want to publish a design system version as "beta" alongside the stable version so testers can opt in without affecting production | 5 | Backlog |
| 9.2.2 | As a developer, I want beta tokens resolvable via a beta channel flag on the BrandVariant so components can preview upcoming design changes | 5 | Backlog |
| 9.2.3 | As a developer, I want a visual diff between stable and beta token sets showing added/changed/removed tokens | 5 | Backlog |
| 9.2.4 | As a developer, I want beta promotion workflow: beta → release candidate → stable with gate validations at each stage | 5 | Backlog |
| 9.2.5 | As a developer, I want beta test feedback captured and linked to DS-ONT component definitions for design iteration tracking | 3 | Backlog |

### Feature 9.3: FigJam Social & Collaboration Integration

**Stories:**

| ID | Story | Points | Status |
|----|-------|--------|--------|
| 9.3.1 | As a developer, I want to generate FigJam boards from DS-ONT component hierarchies for collaborative design review sessions | 5 | Backlog |
| 9.3.2 | As a developer, I want FigJam annotations and sticky notes linked back to DS-ONT entities for design decision capture | 5 | Backlog |
| 9.3.3 | As a developer, I want FigJam boards shareable as social media content templates for brand consistency across channels | 3 | Backlog |

### Feature 9.4: W3C Design Tokens Specification Alignment

**Stories:**

| ID | Story | Points | Status |
|----|-------|--------|--------|
| 9.4.1 | As a developer, I want DS-ONT tokens exportable in W3C Design Tokens Community Group JSON format for cross-tool interoperability | 5 | Backlog |
| 9.4.2 | As a developer, I want W3C Design Tokens format importable into DS-ONT so tokens authored in other tools can be consumed | 5 | Backlog |
| 9.4.3 | As a developer, I want DS-ONT schema to track W3C spec evolution and flag tokens that need migration when the spec updates | 3 | Backlog |

---

## EPIC 10: PE Process-Engineer E2E — Program Manager & PF-Manager

**Goal:** End-to-end integrated idea-to-execution platform combining Program Manager (opportunity identification → needs specification → solution build) and PF-Manager (agent-led platform operations, support & maintenance) across multiple F-Core capabilities and customised PFI instances — positioning Azlan as the PE E2E Knowledge Ontology Manager that maximises value and minimises effort through Claude Code Agent SDK orchestration

**Required on completion:** Update BACKLOG.md, ARCHITECTURE.md, README.md, OPERATING-GUIDE.md

**Key Concepts:**
- **Program Manager:** Brings all threads together — identify opportunity, specify needs, build solution across PPM → PE → EFS → DS pipeline
- **PF-Manager:** Agent-led process for operating, supporting and maintaining platform services post-build
- **F-Core Capabilities:** Cross-cutting platform capabilities shared by all PFI instances (auth, config, tokens, deployment, monitoring)
- **PFI Instances:** Market-specific, brand-specific, or enterprise-specific platform configurations — each leveraging F-Core to optimise quality, performance and value for customer, provider and partners

### Feature 10.1: Program Manager E2E Workflow

**Stories:**

| ID | Story | Points | Status |
|----|-------|--------|--------|
| 10.1.1 | As a program manager, I want an E2E workflow orchestrating Opportunity → Discovery → Specification → Build → Test → Deploy phases, each mapped to PE process definitions with quality gates | 8 | Backlog |
| 10.1.2 | As a program manager, I want the Discovery phase to invoke VE-Series ontologies (VSOM → OKR → VP → PMF) to validate strategic alignment and product-market fit before committing to build | 5 | Backlog |
| 10.1.3 | As a program manager, I want the Specification phase to decompose validated opportunities into PPM Portfolio → Programme → Project → PBS/WBS structures with EFS Epic/Feature/Story backlog generation | 8 | Backlog |
| 10.1.4 | As a program manager, I want the Build phase to coordinate EA architecture decisions (EA-CORE patterns, EA-MSFT Azure resources, EA-TOGAF ADM phases) with DS component generation and PE process execution | 8 | Backlog |
| 10.1.5 | As a program manager, I want cross-thread visibility showing how a single opportunity flows through VE validation → PPM planning → PE execution → EFS delivery → DS implementation with traceability at every step | 5 | Backlog |
| 10.1.6 | As a program manager, I want RCSG governance overlay automatically applied when compliance requirements (MCSB, GDPR, PII) are detected in the opportunity scope via EMC composition rules | 3 | Backlog |

### Feature 10.2: PFI Instance Configuration & Lifecycle

**Stories:**

| ID | Story | Points | Status |
|----|-------|--------|--------|
| 10.2.1 | As a platform operator, I want to create new PFI instances from templates specifying market (e.g., PFI-BAIV for Brand AI Visibility), brand variant, target users, and required F-Core capabilities | 5 | Backlog |
| 10.2.2 | As a platform operator, I want each PFI instance to auto-resolve its ontology composition via EMC — loading the correct VE, PE, RCSG, Foundation, and Competitive ontologies for its requirement category | 5 | Backlog |
| 10.2.3 | As a platform operator, I want PFI instances to inherit F-Core capabilities (auth, config, tokens, monitoring) while allowing instance-specific overrides for market/brand customisation | 5 | Backlog |
| 10.2.4 | As a platform operator, I want PFI lifecycle management — create, configure, activate, suspend, archive — with PE process gates governing each transition | 3 | Backlog |
| 10.2.5 | As a platform operator, I want to clone an existing PFI (e.g., fork PFI-BAIV to create PFI-W4M) carrying forward F-Core config while resetting instance-specific data | 5 | Backlog |
| 10.2.6 | As a platform operator, I want PFI instances registered in ont-registry-index.json with product bindings, ontology references, and DS config URLs for full traceability | 3 | Backlog |

### Feature 10.3: F-Core Platform Capabilities

**Stories:**

| ID | Story | Points | Status |
|----|-------|--------|--------|
| 10.3.1 | As a platform architect, I want F-Core capabilities defined as shared PE process patterns (auth, config management, token resolution, deployment, monitoring) that every PFI inherits | 5 | Backlog |
| 10.3.2 | As a platform architect, I want F-Core auth capability integrating ORG-ONT roles, RRR-ONT RBAC, and MCSB security controls into a unified access pattern for all PFI instances | 5 | Backlog |
| 10.3.3 | As a platform architect, I want F-Core config capability using EMC InstanceConfiguration to resolve which ontologies, DS config, Figma source, and Supabase schema each PFI loads at runtime | 5 | Backlog |
| 10.3.4 | As a platform architect, I want F-Core deployment capability defining the CI/CD pipeline from code generation → test → staging → production with PE quality gates at each stage | 5 | Backlog |
| 10.3.5 | As a platform architect, I want F-Core monitoring capability connecting PE ProcessMetrics and KPI-ONT indicators to real-time PFI health dashboards | 3 | Backlog |
| 10.3.6 | As a platform architect, I want F-Core capabilities versioned independently so PFI instances can upgrade capabilities without full platform redeployment | 3 | Backlog |

### Feature 10.4: PF-Manager — Agent-Led Platform Operations

**Stories:**

| ID | Story | Points | Status |
|----|-------|--------|--------|
| 10.4.1 | As a platform operator, I want a PF-Manager agent process that continuously monitors PFI instance health, token sync status, dependency freshness, and compliance posture | 8 | Backlog |
| 10.4.2 | As a platform operator, I want PF-Manager to auto-detect when ontology updates (new versions, new cross-references) affect active PFI instances and trigger compatibility checks | 5 | Backlog |
| 10.4.3 | As a platform operator, I want PF-Manager to orchestrate routine maintenance — DS token refresh from Figma, security control re-validation against MCSB updates, dependency chain integrity checks | 5 | Backlog |
| 10.4.4 | As a platform operator, I want PF-Manager to handle incident response: detect anomalies → diagnose root cause via ontology graph traversal → recommend remediation → execute with approval gates | 8 | Backlog |
| 10.4.5 | As a platform operator, I want PF-Manager to produce operational reports showing PFI utilisation, value delivery (VE metrics), process efficiency (PE metrics), and compliance status (RCSG) | 5 | Backlog |
| 10.4.6 | As a platform operator, I want PF-Manager to support partner/client PFI instances with delegated operations where partners manage their instance within F-Core guardrails | 3 | Backlog |

### Feature 10.5: Agent SDK Orchestration — Claude Code Integration

**Stories:**

| ID | Story | Points | Status |
|----|-------|--------|--------|
| 10.5.1 | As a developer, I want the 8 registered agents (OAA, VE, CE, EA, AAA, AIE, SA, DE) formalised as Claude Code Agent SDK tool definitions with input/output schemas derived from their ontology domains | 8 | Backlog |
| 10.5.2 | As a developer, I want a Program Manager meta-agent that coordinates the 8 specialist agents through the E2E workflow, routing tasks based on PE phase and EMC requirement category | 8 | Backlog |
| 10.5.3 | As a developer, I want a PF-Manager meta-agent that coordinates operational agents (SA for security, DE for data, CE for context) through maintenance and incident response workflows | 5 | Backlog |
| 10.5.4 | As a developer, I want agent coordination patterns (hub-spoke, pipeline, broadcast) defined as PE ProcessPatterns so agent workflows are ontology-governed and auditable | 5 | Backlog |
| 10.5.5 | As a developer, I want agent autonomy levels (highly-autonomous, supervised, manual, hybrid) enforced per PE phase — supervised for architecture decisions, autonomous for code generation and testing | 3 | Backlog |
| 10.5.6 | As a developer, I want agent execution traces stored as PE ProcessInstance records with phase transitions, gate results, artifacts produced, and metrics collected for full audit trail | 5 | Backlog |

### Feature 10.6: Azlan Knowledge Ontology Dashboard

**Stories:**

| ID | Story | Points | Status |
|----|-------|--------|--------|
| 10.6.1 | As a knowledge manager, I want Azlan Visualiser to show the full E2E pipeline — from opportunity through VE validation → PPM planning → PE execution → EFS delivery → DS implementation — as an interactive directed graph | 8 | Backlog |
| 10.6.2 | As a knowledge manager, I want to select any PFI instance and see its complete ontology composition, F-Core capabilities, active processes, agent assignments, and compliance status in a unified view | 5 | Backlog |
| 10.6.3 | As a knowledge manager, I want a "value flow" visualisation tracing how strategic objectives (VSOM) cascade through OKRs → value propositions → PMF validation → EFS epics → PE processes → deployed PFI capabilities | 5 | Backlog |
| 10.6.4 | As a knowledge manager, I want cross-PFI comparison showing shared F-Core capabilities vs instance-specific customisations with effort/value metrics from PPM WBS and VE KPIs | 5 | Backlog |
| 10.6.5 | As a knowledge manager, I want the dashboard to surface optimisation opportunities — where PFI instances could share more F-Core capabilities, where duplicate effort exists, where value gaps appear | 5 | Backlog |
| 10.6.6 | As a knowledge manager, I want the dashboard exportable as a Program Manager briefing (Markdown/PDF) covering portfolio health, PFI status, agent activity, and next-action recommendations | 3 | Backlog |

---

## EPIC 10A: Security MVP — Multi-PFI Foundation

**Goal:** Deliver multi-PFI-aware security foundations for the Azlan Ontology Platform — starting with the Ontology Manager/Visualiser as the first secured application, progressing through Design Director (S2) to Agentic expansion (S3)
**Priority:** HIGH
**VSOM:** [MVP-Security-VSOM-v1.0.0.md](../../ARCHITECTURE/Security/MVP-Security-VSOM-v1.0.0.md)
**Aligned to:** RRR-ONT v4.0.0 (RBAC), MCSB-ONT v2.0.0 (security controls)
**Required on completion:** Update BACKLOG.md, ARCHITECTURE.md, README.md, OPERATING-GUIDE.md

**Key Concepts:**
- **Multi-PFI from day 1** — users may access 1 PFI, multiple PFIs, or PF-Core
- **4-role model** — pf-owner, pfi-admin, pfi-member, viewer (mapped to RRR-ONT RBAC)
- **5 Supabase tables** — pfi_instances, profiles, user_pfi_access, ontologies, audit_log
- **RLS not application logic** — security at database layer via Supabase RLS policies
- **Co-brandable** — Azlan tool works across all PFI instances

### Feature 10A.1: Supabase Schema & RLS Foundation

**Stories:**

| ID | Story | Points | Status |
|----|-------|--------|--------|
| 10A.1.1 | As a platform architect, I want the 5-table Supabase schema (pfi_instances, profiles, user_pfi_access, ontologies, audit_log) created with PFI-scoped foreign keys and JSONB ontology storage | 5 | Backlog |
| 10A.1.2 | As a platform architect, I want RLS policies on ontologies table so users only see ontologies for their assigned PFI(s) plus PF-CORE shared ontologies, with pf-owner seeing all | 5 | Backlog |
| 10A.1.3 | As a platform architect, I want the audit_log table to be append-only (insert-only, no update/delete) with RLS allowing admin read access | 3 | Backlog |
| 10A.1.4 | As a platform architect, I want PF-CORE, BAIV-AIV, and AIRL-AIR seeded as initial pfi_instances | 1 | Backlog |

### Feature 10A.2: Authentication & User Management

**Stories:**

| ID | Story | Points | Status |
|----|-------|--------|--------|
| 10A.2.1 | As a user, I want to log in to the Ontology Visualiser via Supabase Auth (email/password) so my access is controlled | 5 | Backlog |
| 10A.2.2 | As a pf-owner, I want to assign users to PFI instances via user_pfi_access so access is scoped per product | 3 | Backlog |
| 10A.2.3 | As a user, I want a login form integrated into the visualiser UI with auth state persisted across page reloads | 3 | Backlog |
| 10A.2.4 | As a user, I want to see my assigned PFI(s) in a context switcher and toggle between them | 3 | Backlog |

### Feature 10A.3: PFI-Scoped Ontology Storage

**Stories:**

| ID | Story | Points | Status |
|----|-------|--------|--------|
| 10A.3.1 | As a user, I want ontologies saved to Supabase (replacing IndexedDB) with PFI scoping so my ontologies persist across devices | 5 | Backlog |
| 10A.3.2 | As a user, I want to load ontologies from Supabase filtered by my active PFI context | 3 | Backlog |
| 10A.3.3 | As a user, I want all ontology CRUD operations logged to audit_log with user_id, pfi_id, action, and detail | 3 | Backlog |

### Feature 10A.4: Minimal Security UI

**Stories:**

| ID | Story | Points | Status |
|----|-------|--------|--------|
| 10A.4.1 | As a user, I want protected routes — viewer sees read-only graph, member can author, admin can manage users | 3 | Backlog |
| 10A.4.2 | As a pfi-admin, I want an audit log viewer showing recent actions for my PFI | 3 | Backlog |
| 10A.4.3 | As a user, I want my profile (display name, role, assigned PFIs) shown in the UI header | 2 | Backlog |

---

## EPIC 11: Admin-Cleanup

**Goal:** Ad-hoc housekeeping of repository directories and legacy files — rationalise what is needed, safely archive what might not be, and keep the directory tree clean and current as the project evolves
**Priority:** MEDIUM — ONGOING (run tasks between feature sprints or when cleanup is blocking)

### Feature 11.1: Directory Audit & Inventory

**Stories:**

| ID | Story | Points | Status |
|----|-------|--------|--------|
| 11.1.1 | As a maintainer, I want a catalogue of every top-level directory and its purpose so I can identify what is current vs legacy | 2 | Backlog |
| 11.1.2 | As a maintainer, I want stale files flagged (no commits in 90+ days, not referenced by code or docs) so I have a cleanup candidate list | 3 | Backlog |
| 11.1.3 | As a maintainer, I want duplicate/download-artefact files identified (e.g. `file (1).json`, `Copy of ...`) so they can be removed | 2 | Backlog |

### Feature 11.2: Quarantine & Safe Archival

**Stories:**

| ID | Story | Points | Status |
|----|-------|--------|--------|
| 11.2.1 | As a maintainer, I want a `_quarantine/` directory convention where uncertain files are moved rather than deleted, with a manifest recording origin path and reason | 3 | Backlog |
| 11.2.2 | As a maintainer, I want quarantined items reviewed after one sprint — if nothing broke, they are deleted; if referenced, they are restored | 2 | Backlog |
| 11.2.3 | As a maintainer, I want git history preserved when moving files to quarantine (git mv, not delete + re-add) so we can always recover | 1 | Backlog |

### Feature 11.3: Directory Rationalisation

**Stories:**

| ID | Story | Points | Status |
|----|-------|--------|--------|
| 11.3.1 | As a maintainer, I want orphaned or misplaced files relocated to their correct series/category directory per the ontology library structure | 3 | Backlog |
| 11.3.2 | As a maintainer, I want empty directories and placeholder stubs removed when they no longer serve a purpose | 1 | Backlog |
| 11.3.3 | As a maintainer, I want naming conventions enforced (UPPER-CASE-ONT dirs, kebab-case files) with a checklist to verify after each cleanup pass | 2 | Backlog |
| 11.3.4 | As a maintainer, I want case-variant duplicates resolved (e.g. `ALZ-ONT/` vs `alz-ont/` tracked separately on macOS) via `git rm --cached` cleanup | 2 | Backlog |

### Feature 11.4: Ongoing Hygiene

**Stories:**

| ID | Story | Points | Status |
|----|-------|--------|--------|
| 11.4.1 | As a maintainer, I want `.gitignore` updated to prevent common clutter (OS files, editor backups, download duplicates) from being committed | 1 | Backlog |
| 11.4.2 | As a maintainer, I want a pre-commit or CI check that warns when files with spaces/parens or known junk patterns are staged | 3 | Backlog |
| 11.4.3 | As a maintainer, I want a lightweight "cleanup log" (Markdown or JSON) recording what was moved/deleted/archived in each cleanup pass for audit trail | 2 | Backlog |

---

## EPIC 12: PFI-BAIV-AIV-Build

**Goal:** Build the BAIV (Business AI Ventures) Platform Foundation Instance — the first production PFI deployment using F-Core capabilities, DS design system, and EMC composition
**Priority:** HIGH — to be defined
**Depends on:** E8 (Design-Director), E8B (DS assets), E10 (PFI lifecycle)

> Scope to be defined — stories will be added as E8/E8B/E10 outputs crystallise.

---

## EPIC 13: PFI-W4M-PF-Core and Client Sub-Instances

**Goal:** Build the W4M (Work4Me) Platform Foundation Instance including PF-Core shared capabilities and client-specific sub-instances that extend it
**Priority:** HIGH — to be defined
**Depends on:** E8 (Design-Director), E10 (PFI lifecycle), E12 (BAIV reference implementation)

> Scope to be defined — W4M is a multi-tenant platform requiring client sub-instance patterns. Stories will be added once PFI lifecycle (E10) and BAIV reference (E12) are established.

---

## EPIC 14: PFI-AIRL-EA-AIR

**Goal:** Build the AIRL (AI Readiness Lab) PFI focused on EA-AIR (Enterprise Architecture AI Readiness) assessment and maturity modelling
**Priority:** HIGH — to be defined
**Depends on:** E10 (PFI lifecycle), Foundation/AIR-ONT

> Scope to be defined — leverages AIR-ONT maturity framework. Stories will be added as E10 PFI lifecycle patterns are proven.

---

## EPIC 15: PFI-W4M-EA-Togaf

**Goal:** Build the W4M TOGAF EA (Enterprise Architecture) PFI — TOGAF-aligned architecture practice instance for the W4M platform
**Priority:** HIGH — to be defined
**Depends on:** E10 (PFI lifecycle), E13 (W4M PF-Core), PE-Series/EA-ONT

> Scope to be defined — extends W4M PF-Core (E13) with TOGAF EA capabilities. Stories will be added once W4M core is established.

---

## EPIC 16: PFI-RCS-W4M-AIR-Collab-MS-Azure-EA-Assess

**Goal:** Build the RCS (Regulatory Compliance & Security) collaborative PFI combining W4M, AIR maturity, and Microsoft Azure EA assessment capabilities
**Priority:** HIGH — to be defined
**Depends on:** E10 (PFI lifecycle), E13 (W4M PF-Core), E14 (AIRL-EA-AIR), RCSG-Series ontologies

> Scope to be defined — cross-cutting PFI spanning W4M platform, AI readiness assessment, and Azure/Microsoft compliance (MCSB, GDPR). Stories will be added once upstream PFIs are established.

---

## Priority Matrix

```
                    IMPACT
              Low    Med    High
         ┌─────────────────────────┐
    High │        │ E3,E4 │ E1,E2  │
         │        │       │E7,E8,E10│
         │        │       │E8B,E12 │
         │        │       │E13-E16 │
         ├─────────────────────────┤
URGENCY Med  │        │ E11   │        │
         ├─────────────────────────┤
    Low  │        │ E5,E6 │        │
         │        │  E9   │        │
         └─────────────────────────┘
```

**Recommended Sprint Order:**
1. ~~EPIC 1 (OAA 5.0.0 verification)~~ — ✅ Complete
2. ~~EPIC 2 (sub-ontology connections)~~ — ✅ Complete
3. ~~EPIC 3 (enhanced audit & validation)~~ — ✅ Complete
4. ~~EPIC 4 (export & reporting)~~ — ✅ Complete
5. ~~EPIC 5 (multi-source loading)~~ — ✅ Complete
6. EPIC 7 (ontology authoring, composition & instances) — Features 7.1-7.5 ✅ Done, **7.6-7.9 in backlog**
7. EPIC 8B (DJM-DESIGN-SYS: DS asset preparation for DS-ONT) ← **Now — parallel with E7.6**
8. EPIC 10A (Security MVP: multi-PFI auth + Supabase + RLS + audit) ← **Now — parallel with E8B**
9. EPIC 8 (Design-Director: Figma + Supabase + code gen + multi-brand) ← **Next — consumes E8B output**
10. EPIC 10 (PE E2E: Program Manager + PF-Manager + PFI lifecycle + Agent SDK) ← **After E8**
11. EPIC 12 (PFI-BAIV-AIV-Build: first production PFI) ← **After E10 — reference implementation**
12. EPIC 13 (PFI-W4M-PF-Core & Client Sub-Instances) ← **After E12**
13. EPIC 14 (PFI-AIRL-EA-AIR: AI readiness assessment) ← **After E10**
14. EPIC 15 (PFI-W4M-EA-Togaf: TOGAF EA practice) ← **After E13**
15. EPIC 16 (PFI-RCS-W4M-AIR-Collab-MS-Azure-EA-Assess) ← **After E13+E14**
16. EPIC 6 (packaging & distribution) — low priority
17. EPIC 9 (Future DS capabilities: Make kits, beta testing, FigJam, W3C) — low priority

---

## Definition of Done

- [ ] Feature works in Chrome, Firefox, Safari
- [ ] No console errors
- [ ] **Documentation updated before push to main:**
  - [ ] BACKLOG.md (stories marked Done)
  - [ ] ARCHITECTURE.md
  - [ ] README.md
  - [ ] OPERATING-GUIDE.md
  - [ ] IMPLEMENTATION-PLAN (trigger for GH Projects check)
- [ ] **GitHub Projects verified:** board status matches implementation plan
- [ ] Sample files demonstrate feature
- [ ] PR reviewed and merged to main
- [ ] GitHub Pages deployment verified

---

*OAA Ontology Visualiser v2.6.0 — Product Backlog*
