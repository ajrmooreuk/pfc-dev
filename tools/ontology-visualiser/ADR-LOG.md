# Architecture Decision Record Log — Ontology Visualiser

**Living document** — append new ADRs as decisions are made during development.

Aligned to the `sa:ArchitectureDecisionRecord` entity in the Solution Architecture Ontology (SA-ONT v1.0.0) and the Solution Architect role definition in the RRR Ontology (VE-RRR-ONT v3.1.0).

| Property | Value |
|----------|-------|
| Product | OAA Ontology Visualiser |
| Repo | Azlan-EA-AAA |
| Created | 2026-02-04 |
| Last Updated | 2026-03-05 |
| VSOM Alignment | L3 (Technology Platform), P1 (Process Excellence) |

## Role Governance (from RRR Ontology)

Architecture decisions in this log are governed by the role hierarchy defined in `RRR-DATA-architectural-roles-v1.0.0.jsonld`:

```
CTO
└── Enterprise Architect (EA) — governance, standards, cross-cutting alignment
    └── Solution Architect (SA) — solution design, ADR ownership, implementation architecture
```

### RACI for ADRs

| Activity | SA | EA | CTO |
|----------|----|----|-----|
| Identify decision requiring ADR | **R** | C | I |
| Document context and alternatives | **R/A** | C | I |
| Make architecture decision | **R** | C (cross-cutting) | I |
| Approve decision (within SA scope) | **A** | I | I |
| Approve decision (cross-cutting / strategic) | R | **A** | I |
| Escalate decision (enterprise impact) | R | R | **A** |
| Maintain ADR log | **R/A** | I | I |
| Review ADRs at governance gate | C | **R/A** | I |

### SA Decision Authority (from RRR Ontology)

The Solution Architect has authority over:
- Solution component selection
- Integration approach and patterns
- Database schema design direction
- API contract definitions
- Performance optimisation approach
- Security control implementation (consulted by Security Architect)
- Agent handoff specifications
- Technology component selection (within EA guidelines)
- Build vs buy recommendations
- Solution testing approach

Decisions that cross enterprise architecture boundaries (e.g., ADR-001 storage architecture, ADR-005 multi-tenancy) require EA consultation.

### Source References

| Document | Path |
|----------|------|
| RRR Ontology Definition | `PBS/ONTOLOGIES/pfc-ontologies/VE-Series-ONT/VE-RRR-ONT/pf-RRR-ONT-v3.1.0.jsonld` |
| SA Role Data | `PBS/ONTOLOGIES/pfc-ontologies/VE-Series-ONT/VE-RRR-ONT/RRR-DATA-architectural-roles-v1.0.0.jsonld` |
| SA Ontology (SA-ONT) | `PBS/ONTOLOGIES/pfc-ontologies/VE-Series-ONT/VE-RRR-ONT/RRR-Sol-Architect-role-import/solution-architecture-ontology-v1.0.0-draft (2).json` |
| RRR Glossary | `PBS/ONTOLOGIES/pfc-ontologies/VE-Series-ONT/VE-RRR-ONT/pf-roles-raci-rbac-glossary-v3.0.0.json` |

---

## Index

| ADR | Title | Status | Date |
|-----|-------|--------|------|
| [ADR-001](#adr-001) | Storage Architecture: Supabase-First | Accepted | 2026-01-31 |
| [ADR-002](#adr-002) | Validation Location: Client + Server | Accepted | 2026-01-31 |
| [ADR-003](#adr-003) | Graph Library: Retain vis.js | Accepted | 2026-01-31 |
| [ADR-004](#adr-004) | Tier Navigation: Separate Views + Inline Expansion | Accepted | 2026-01-31 |
| [ADR-005](#adr-005) | Multi-Tenancy: Shared Supabase with RLS | Accepted | 2026-01-31 |
| [ADR-006](#adr-006) | Compliance Enforcement: Allow + Recommend | Accepted | 2026-01-31 |
| [ADR-007](#adr-007) | Branding Control: RBAC-Protected | Accepted | 2026-01-31 |
| [ADR-008](#adr-008) | Theming Source: Figma MCP Primary, CSS Fallback | Accepted | 2026-01-31 |
| [ADR-009](#adr-009) | Modularisation: Native ES Modules (No Build Step) | Accepted | 2026-02-04 |
| [ADR-010](#adr-010) | Rollup Default View: Series View (6 Nodes) | Proposed | 2026-02-04 |
| [ADR-011](#adr-011) | Cross-Ontology Detection: Namespace Prefix Scanning | Accepted | 2026-02-04 |
| [ADR-012](#adr-012) | Supabase Project: Dedicated (Not Shared with ds-e2e) | Proposed | 2026-02-04 |
| [ADR-013](#adr-013) | Placeholder Ontologies: Show with Badge | Accepted | 2026-02-04 |
| [ADR-014](#adr-014) | Skeleton-Driven Navigation (No Hardcoded Toolbar) | Accepted | 2026-02-20 |
| [ADR-015](#adr-015) | Two-Layer PFI Instance Filtering | Accepted | 2026-02-22 |
| [ADR-016](#adr-016) | View Mode Extensibility Pattern | Accepted | 2026-03-02 |

---

## ADR-001

### Storage Architecture: Supabase-First

| Property | Value |
|----------|-------|
| Status | **Accepted** |
| Date | 2026-01-31 |
| Decision Maker | Solution Architect (human) |
| VSOM Alignment | L2-KR2.1 (Data Foundation), L3-KR3.1 (Technology Platform) |
| Source | HLD-VISUALISER-ENHANCED-v1.0.0.md, Decision D1 |

**Context:** The visualiser needs a persistent storage backend to replace file-by-file loading. Three options were evaluated for how ontologies are stored and retrieved.

**Decision:** Option A — Supabase-First. All ontologies stored in Supabase Postgres with JSONB. Visualiser fetches from DB as primary source.

**Alternatives Considered:**

| Option | Description | Why Not |
|--------|-------------|---------|
| B: Hybrid (Local + Sync) | Work offline with files, sync to Supabase when connected | Sync complexity, potential conflicts, duplicate storage |
| C: Registry-as-Service | Central PFC REST/GraphQL API | Single point of failure, cross-org access control complexity, higher infrastructure cost |

**Rationale:**
- Single source of truth for all PFI instances
- Real-time sync across instances without custom sync logic
- Version history built into Postgres
- Cross-ontology queries via SQL (critical for rollup and cross-reference detection)
- Supabase is already in the technology stack (ds-e2e-prototype)

**Consequences:**
- (+) Unified registry queryable from any client
- (+) Built-in auth, RLS, and Edge Functions
- (-) Requires Supabase project setup per PFI deployment
- (-) Network dependency for primary operations (mitigated by IndexedDB cache)

---

## ADR-002

### Validation Location: Client + Server

| Property | Value |
|----------|-------|
| Status | **Accepted** |
| Date | 2026-01-31 |
| Decision Maker | Solution Architect (human) |
| VSOM Alignment | P3 (Compliance) |
| Source | HLD-VISUALISER-ENHANCED-v1.0.0.md, Decision D2 |

**Context:** OAA v7.0.0 validation gates (G1-G8, G20-G24) can run in the browser, on the server (Edge Function), or both.

**Decision:** Both — client-side validation for immediate feedback, server-side validation as authoritative gate before database writes.

**Alternatives Considered:**

| Option | Why Not |
|--------|---------|
| Browser only | No enforcement on API uploads; non-compliant data could enter DB |
| Server only | Slow feedback loop; user must wait for round-trip to see issues |

**Rationale:**
- Client-side gives instant feedback during editing/upload
- Server-side prevents non-compliant data in production environment (enforced via `validate_for_environment()` trigger)
- Dev environment allows non-compliant with warnings; prod requires compliance

**Consequences:**
- (+) Fast UX with authoritative enforcement
- (-) Validation logic maintained in two places (JS + Edge Function)
- Mitigation: shared validation rules as JSON config consumed by both

---

## ADR-003

### Graph Library: Retain vis.js

| Property | Value |
|----------|-------|
| Status | **Accepted** |
| Date | 2026-01-31 |
| Decision Maker | Solution Architect (human) |
| VSOM Alignment | P1 (Process Excellence) |
| Source | HLD-VISUALISER-ENHANCED-v1.0.0.md, Decision D4 |

**Context:** The current visualiser uses vis-network (vis.js). Alternatives include D3.js and Cytoscape.js.

**Decision:** Retain vis.js (vis-network v9.1.2).

**Alternatives Considered:**

| Option | Why Not |
|--------|---------|
| D3.js | Lower-level — would require rewriting all graph rendering, physics, interaction from scratch. More flexible but far more effort. |
| Cytoscape.js | Better graph analysis APIs but would require rewriting all rendering code. Less mature community. |

**Rationale:**
- Already integrated and working
- Handles 500+ nodes with Barnes-Hut physics without performance issues
- Built-in hierarchical layout (useful for drill-through)
- Clustering API available if node count exceeds performance thresholds
- Avoids rewrite risk

**Consequences:**
- (+) No migration effort
- (+) Existing physics config and node styling preserved
- (-) vis.js has limited compound/nested node support — tiered navigation will use view switching rather than nested subgraphs
- (-) vis.js community is less active than D3 — acceptable given current feature set covers needs

**Revisit trigger:** If node count regularly exceeds 1,000 or if nested subgraph rendering becomes a hard requirement.

---

## ADR-004

### Tier Navigation: Separate Views + Inline Expansion

| Property | Value |
|----------|-------|
| Status | **Accepted** |
| Date | 2026-01-31 |
| Decision Maker | Solution Architect (human) |
| VSOM Alignment | C1 (Client Retention — usability) |
| Source | HLD-VISUALISER-ENHANCED-v1.0.0.md, Decision D5 |

**Context:** When drilling from Tier 0 (series) to Tier 1 (ontologies) to Tier 2 (entities), the navigation could replace the entire view, expand inline within the existing graph, or offer both.

**Decision:** Both — offer view replacement (click series → shows ontologies as new view) and inline expansion (click ontology → expands entities within current view, fading siblings).

**Rationale:**
- Separate views are cleaner for large graphs (prevents visual overload)
- Inline expansion preserves context (user can see sibling ontologies)
- Different users prefer different interaction patterns
- Breadcrumb navigation provides consistent wayfinding regardless of method

**Consequences:**
- (+) Flexible UX supporting different workflows
- (-) Two rendering paths to maintain
- Mitigation: both paths use the same `graph-renderer.js` module, just with different vis.js DataSet populations

---

## ADR-005

### Multi-Tenancy: Shared Supabase with RLS

| Property | Value |
|----------|-------|
| Status | **Accepted** |
| Date | 2026-01-31 |
| Decision Maker | Solution Architect (human) |
| VSOM Alignment | L3 (Technology Platform), F4 (Cost Reduction) |
| Source | HLD-VISUALISER-ENHANCED-v1.0.0.md, Decision D6 |

**Context:** Multiple PFI instances (BAIV, W4M, Azlan) may share the visualiser. Need to decide isolation strategy.

**Decision:** Shared Supabase instance with Row-Level Security (RLS) policies filtering by `pfi_id`.

**Alternatives Considered:**

| Option | Why Not |
|--------|---------|
| Per-PFI Supabase project | Higher infrastructure cost, harder to share ontologies cross-PFI |
| No isolation | Security risk — PFI data must be segregated |

**Rationale:**
- PFC distributes core config to PFIs; shared DB aligns with this model
- RLS provides row-level data isolation without separate infrastructure
- Enables cross-PFI ontology sharing where authorised
- Single deployment to manage

**Consequences:**
- (+) Cost-effective: one Supabase project
- (+) Cross-PFI ontology queries possible (with explicit access grants)
- (-) RLS policy complexity increases with PFI count
- (-) Single Supabase project is a shared dependency

---

## ADR-006

### Compliance Enforcement: Allow + Recommend

| Property | Value |
|----------|-------|
| Status | **Accepted** |
| Date | 2026-01-31 |
| Decision Maker | Solution Architect (human) |
| VSOM Alignment | P3 (Compliance) |
| Source | HLD-VISUALISER-ENHANCED-v1.0.0.md |

**Context:** When a user uploads a non-OAA-compliant ontology, should the system block storage or allow it?

**Decision:** Allow storage with `compliance_status = 'non-compliant'` flag. Show recommendation to run OAA v7.0.0 upgrade. Non-compliant ontologies visible but flagged in UI.

**Exception:** Production environment (`environment = 'prod'`) enforces compliance via database trigger — non-compliant ontologies are blocked from prod.

**Rationale:**
- Blocking in dev/test would prevent iterative development
- Many ontologies start as drafts and evolve toward compliance
- Flagging makes non-compliance visible without being obstructive
- Prod enforcement ensures quality at deployment boundary

**Consequences:**
- (+) Low friction for development workflow
- (+) Clear path to compliance via OAA Upgrade Assistant
- (-) Non-compliant ontologies may accumulate in dev — mitigated by periodic cleanup/reporting

---

## ADR-007

### Branding Control: RBAC-Protected

| Property | Value |
|----------|-------|
| Status | **Accepted** |
| Date | 2026-01-31 |
| Decision Maker | Solution Architect (human) |
| VSOM Alignment | C1 (Client Experience) |
| Source | HLD-VISUALISER-ENHANCED-v1.0.0.md, Decision D8 |

**Context:** PFI brand switching in the visualiser (changing Figma design tokens) needs access control.

**Decision:** RBAC-protected. Only admin role can switch PFI branding. Viewers and editors see the current PFI brand, no switcher visible.

**Rationale:**
- Brand consistency is important for client-facing deployments
- Accidental brand switching could confuse users
- Admins need switching for testing and configuration

---

## ADR-008

### Theming Source: Figma MCP Primary, CSS Fallback

| Property | Value |
|----------|-------|
| Status | **Accepted** |
| Date | 2026-01-31 |
| Decision Maker | Solution Architect (human) |
| VSOM Alignment | C1 (Client Experience), L3 (Technology Platform) |
| Source | HLD-VISUALISER-ENHANCED-v1.0.0.md, Decision D3 |

**Context:** The visualiser needs PFI-specific theming. Tokens can come from Figma (via MCP extraction) or pre-built CSS.

**Decision:** Figma MCP extraction as primary source, with CSS variable fallback for when Figma is unavailable or MCP not configured.

**Rationale:**
- Figma is the single source of truth for brand tokens
- MCP extraction keeps tokens in sync with design system
- CSS fallback ensures the visualiser works without Figma/MCP dependency
- `design_tokens` table in Supabase caches extracted tokens

---

## ADR-009

### Modularisation: Native ES Modules (No Build Step)

| Property | Value |
|----------|-------|
| Status | **Accepted** |
| Date | 2026-02-04 |
| Decision Maker | Solution Architect (AI-assisted) |
| VSOM Alignment | P1 (Process Excellence), L3 (Technology Platform) |
| Source | IMPLEMENTATION-PLAN-v1.0.0.md, Phase 0 |

**Context:** The `browser-viewer.html` is a 2,980-line monolithic HTML file with all CSS and JavaScript inline. Adding rollup, drill-through, cross-ontology detection, and Supabase integration would push it past 5,000+ lines, making it unmaintainable. The codebase needs to be split into separate modules.

**Decision:** Use native ES modules (`<script type="module">`, `import`/`export` syntax) to split into ~10 JavaScript files. No build tool (Webpack, Vite, Rollup, etc.). No TypeScript.

**Alternatives Considered:**

| Option | Why Not |
|--------|---------|
| Vite + TypeScript | Introduces Node.js dependency, `npm install`, build step. Breaks the zero-dependency deployment model. TypeScript adds compile step. |
| Webpack bundle | Same build-step concerns. Adds complexity for a team of one. |
| Keep monolith | 5,000+ lines is unmaintainable. No way to test individual modules. Merge conflicts on every change. |
| IIFE pattern (no modules) | Works without build step but no proper encapsulation. Global namespace pollution. No tree-shaking benefit even conceptually. |

**Rationale:**
- ES modules are natively supported in all evergreen browsers (Chrome 61+, Firefox 60+, Safari 11+, Edge 16+)
- HTTP/2 handles parallel loading of ~10 small files efficiently
- No build tool dependency — `git push` to main still deploys directly to GitHub Pages
- Clean module boundaries enforce separation of concerns
- Each module is independently testable
- Future migration to Vite/TypeScript remains easy (ES modules are the standard)

**Consequences:**
- (+) Zero additional toolchain dependencies
- (+) GitHub Pages deployment unchanged
- (+) Clean module interfaces prevent global state leakage
- (-) No minification in production — acceptable for a private tool with ~10 users
- (-) No TypeScript type safety — mitigated by clear JSDoc annotations on module exports

**Revisit trigger:** If the tool becomes public-facing or if the team grows beyond 2-3 developers, consider adding Vite for bundling/minification and TypeScript for type safety.

---

## ADR-010

### Rollup Default View: Series View (6 Nodes)

| Property | Value |
|----------|-------|
| Status | **Accepted** |
| Date | 2026-02-04 |
| Accepted | 2026-02-05 |
| Decision Maker | Solution Architect (AI-assisted) |
| VSOM Alignment | C1 (Client Experience) |
| Source | FEATURE-SPEC-Graph-Rollup-DrillThrough-v1.0.0.md, Open Question Q2 |
| Implemented | Phase 2 — `js/graph-renderer.js` `renderTier0()`, `js/app.js` `navigateToTier0()` (PR #45) |

**Context:** When loading the full ontology library, the Tier 0 rollup can show either 6 series nodes (compact) or 23 individual ontology nodes (detailed).

**Decision:** Default to Series View (6 nodes). User can toggle to Ontology View (23 nodes) via breadcrumb bar toggle.

**Implementation:** `loadRegistry()` now calls `navigateToTier0()` which renders 6 series super-nodes via `renderTier0()`. The breadcrumb bar includes a "Series (6) / Ontologies (23)" toggle. Series view shows cross-series edges (gold dashed) with reference counts. Three-tier drill-through: Series → Ontologies → Entity Graph.

**Rationale:**
- 6 nodes is a clean, comprehensible entry point
- Shows the structural story (VE, PE, Foundation, Competitive, Security, Orchestration) before detail
- Users can always expand to 23 nodes with one click
- First-time users benefit from progressive disclosure

**Alternatives:**
- Default to 23-node view: more detail upfront but visually noisier
- No default / let user choose on load: adds friction

---

## ADR-011

### Cross-Ontology Detection: Two-Pass Namespace Scanning

| Property | Value |
|----------|-------|
| Status | **Accepted** |
| Date | 2026-02-04 |
| Decision Maker | Solution Architect (AI-assisted) |
| VSOM Alignment | P1 (Process Excellence) |
| Source | FEATURE-SPEC-Graph-Rollup-DrillThrough-v1.0.0.md, Feature 3 |
| Implemented | Phase 1 — `js/multi-loader.js` `detectCrossReferences()` (PR #43) |

**Context:** Cross-ontology relationships need to be detected automatically. The ontologies use namespace prefixes (e.g., `okr:Objective`, `efs:Service`) to reference entities in other ontologies.

**Decision:** Two-pass detection algorithm:

1. **Pass 1 — Registry-declared bridges:** Reads `entry.relationships.keyBridges[]` from each registry entry JSON. Parses prefixed references (e.g., `vp:ValueProposition`) and resolves them to namespace-prefixed node IDs in the merged graph.
2. **Pass 2 — Namespace-prefix scan:** Scans `rangeIncludes` and `domainIncludes` on raw node data. If a reference uses a namespace prefix belonging to a different ontology (verified against `knownPrefixes` set from loaded ontologies), creates a cross-ontology edge.

Cross-ontology edges are rendered as gold dashed lines (width 2.5) with distinct styling from internal edges.

**Rationale:**

- Two-pass approach combines explicit declarations (high confidence) with automatic detection (wider coverage)
- Namespace prefixes are already consistently used across all 23 ontologies
- The `namespaceRegistry` in `ont-registry-index.json` maps all 24 prefixes to IRIs
- No manual mapping required — detection is algorithmic
- Handles future ontologies automatically as long as they follow the namespace convention
- Edge deduplication via `Set<edgeKey>` prevents duplicate cross-refs from both passes

**Consequences:**

- (+) Automatic detection with no manual configuration
- (+) Registry bridges provide high-confidence edges; prefix scan catches implicit references
- (-) Implicit references (shared entity names without namespace prefix) may be missed
- Mitigation: registry `keyBridges` can be manually maintained for known cases

---

## ADR-012

### Supabase Project: Dedicated (Not Shared with ds-e2e)

| Property | Value |
|----------|-------|
| Status | **Proposed** |
| Date | 2026-02-04 |
| Decision Maker | Pending |
| VSOM Alignment | L3 (Technology Platform) |
| Source | FEATURE-SPEC-Graph-Rollup-DrillThrough-v1.0.0.md, Open Question Q4 |

**Context:** The ds-e2e-prototype already has a Supabase schema defined (10 tables for design system, conversations, etc.). The visualiser needs its own tables (ontologies, graph_nodes, graph_edges, cross_ontology_edges, design_tokens).

**Decision (proposed):** Create a dedicated Supabase project for the ontology visualiser, separate from the ds-e2e-prototype project.

**Rationale:**
- Ontology data is structurally distinct from design system/conversation data
- Separate projects allow independent scaling, backup, and access control
- Avoids schema collision and migration complexity
- `design_tokens` table exists in both schemas but serves different purposes (ds-e2e: full design system; visualiser: graph styling only)

**Alternatives:**
- Shared project with separate schemas: reduces Supabase project count but couples lifecycles
- Shared project, same schema: risk of table naming conflicts and migration entanglement

---

## ADR-013

### Placeholder Ontologies: Show with Badge

| Property | Value |
|----------|-------|
| Status | **Accepted** |
| Date | 2026-02-04 |
| Decision Maker | Solution Architect (AI-assisted) |
| VSOM Alignment | P3 (Compliance) |
| Source | FEATURE-SPEC-Graph-Rollup-DrillThrough-v1.0.0.md, Open Question Q3 |
| Implemented | Phase 1 — `js/multi-loader.js` `createPlaceholderRecord()`, `js/graph-renderer.js` `renderMultiGraph()` (PR #43) |

**Context:** 5 of the 23 ontologies are placeholders (KPI, MCSB2, AIR, GDPR, AZALZ) — they have registry entries but no artifact files. Should they appear in the multi-ontology view?

**Decision:** Yes, show placeholders with distinct visual treatment:

- **Shape:** Diamond (vs circle/dot for standard entities)
- **Colour:** Grey (`#616161`) regardless of series
- **Border:** Dashed (6px dash, 3px gap) to indicate incomplete status
- **Sidebar:** Shows "Placeholder" badge, source ontology name, and series membership
- **Series totals:** Placeholders count toward series counts in the legend

Additionally, ontologies whose artifact files fail to load at runtime are treated as placeholders with a `load-failed` status and the error message preserved.

**Rationale:**

- Shows the intended scope of the ontology library (23 ontologies, not just the 18 with definitions)
- Makes gaps visible — users can see what's planned but not yet built
- Diamond shape + grey + dashed border provides clear visual distinction from defined ontologies
- Clicking a placeholder shows registry entry metadata (what exists) rather than empty content
- Graceful degradation — fetch failures become placeholders rather than breaking the entire load

**Alternatives Considered:**

| Option | Why Not |
| ------ | ------- |
| Hide placeholders | Cleaner view but hides planned scope; users wouldn't know 5 ontologies are planned |
| Show as full nodes | Misleading — implies a definition exists when it doesn't |
| Block load on failure | Too fragile — one missing artifact would prevent viewing the other 22 ontologies |

**Consequences:**

- (+) Complete view of the ontology library's planned scope
- (+) Resilient to missing/failed artifact files
- (-) 5 placeholder diamonds may add visual noise — mitigated by distinct styling that's easy to mentally filter

---

## ADR-014

### Skeleton-Driven Navigation (No Hardcoded Toolbar)

| Property | Value |
|----------|-------|
| Status | **Accepted** |
| Date | 2026-02-20 |
| Decision Maker | Solution Architect (AI-assisted) |
| VSOM Alignment | P1 (Process Excellence), C1 (Client Experience) |
| Source | F40.17b (#633), F40.20 (#644), ARCH-NAVIGATION.md |
| Implemented | `js/app-skeleton-loader.js`, `js/nav-action-registry.js`, `js/app.js` |

**Context:** The visualiser toolbar contained 50+ hardcoded HTML buttons in `browser-viewer.html`. Adding PFI-specific navigation items required editing HTML directly. The skeleton JSONLD already defined NavItem entities with action bindings, but they were not used for rendering — the toolbar and skeleton were two separate systems that had to be manually kept in sync.

**Decision:** Replace the entire hardcoded toolbar with skeleton-driven dynamic navigation. All buttons, toggles, chips, dropdowns, and selects are defined as JSON-LD entities in `pfc-app-skeleton-v1.0.0.jsonld` and rendered at runtime by `renderDynamicNavBar()`. Actions are dispatched via `nav-action-registry.js` which maps action strings to JS handler functions.

**Alternatives Considered:**

| Option | Why Not |
|--------|---------|
| Keep hardcoded toolbar + skeleton as metadata | Two systems to maintain, PFI customisation requires HTML editing |
| Hybrid (some static, some dynamic) | Inconsistent UX, harder to reason about which items are where |
| React/Vue component library | Violates ADR-009 (no build step), over-engineering for current team size |

**Rationale:**
- Single source of truth: skeleton JSONLD defines all navigation
- PFI instances can inject L4 items via cascade merge without code changes
- The skeleton editor (F40.22) enables visual navigation editing
- 62 Action entities provide guard conditions, RBAC, and audit governance
- Removed ~200 lines of dead HTML and ~100 lines of dead JS sync code

**Consequences:**
- (+) All nav items editable via Skeleton Inspector panel
- (+) PFI customisation via JSON-LD cascade merge (no code changes)
- (+) Action entities support guards, RBAC, accessibility hints
- (-) Full DOM teardown/rebuild on every state change (acceptable: <16ms)
- (-) Debugging requires understanding the JSONLD → DOM pipeline

**Revisit trigger:** If render performance degrades with >100 nav items, or if a framework migration (ADR-009 revisit) offers component-level reactivity.

---

## ADR-015

### Two-Layer PFI Instance Filtering

| Property | Value |
|----------|-------|
| Status | **Accepted** |
| Date | 2026-02-22 |
| Decision Maker | Solution Architect (AI-assisted) |
| VSOM Alignment | P1 (Process Excellence), L2 (Data Foundation) |
| Source | F40.19 (#645), `js/emc-composer.js` |
| Implemented | `constrainToInstanceOntologies()` in `emc-composer.js` |

**Context:** The EMC composition engine selects ontologies by category (PRODUCT, COMPETITIVE, etc.), but different PFI instances need different subsets of the same category. For example, W4M-WWG declares 7 ontologies in its `instanceOntologies` array, while BAIV uses file-path entries. A single-layer filter (categories only) shows too many ontologies for a specific PFI instance.

**Decision:** Two-layer filtering: (1) categories define the broad universe via `composeMultiCategory()`, then (2) `constrainToInstanceOntologies()` narrows to only the ontologies declared in the PFI instance's registry entry. Foundation dependencies (ORG-ONT, CTX-ONT) that aren't in `instanceOntologies` but are required by declared ontologies render as ghost nodes with visual distinction.

**Alternatives Considered:**

| Option | Why Not |
|--------|---------|
| Category-only filtering | Too broad — shows ontologies the PFI doesn't use |
| Instance-only filtering (no categories) | Loses the compositional grouping that categories provide |
| Hardcoded per-PFI filter maps | Not scalable — every new PFI requires code changes |

**Rationale:**
- `instanceOntologies` is already declared in each PFI's registry entry
- Ghost nodes preserve dependency context without cluttering the primary view
- Backward compatible: BAIV's file-path entries are skipped (no constraint applied)
- Foundation deps as ghosts gives users a "why is this here?" answer

**Consequences:**
- (+) Each PFI sees exactly its declared ontology scope
- (+) Ghost nodes make dependency structure visible
- (+) No per-PFI code changes needed — driven by registry data
- (-) Ghost node styling adds visual complexity — mitigated by toggle (F40.23)

---

## ADR-016

### View Mode Extensibility Pattern

| Property | Value |
|----------|-------|
| Status | **Accepted** |
| Date | 2026-03-02 |
| Decision Maker | Solution Architect (AI-assisted) |
| VSOM Alignment | P1 (Process Excellence) |
| Source | F40.1 (#515), F40.3 (#579), F40.22 (#670), ARCH-EPIC-40-DELTA.md |

**Context:** Epic 40 expanded the visualiser from 3 view modes (graph, mermaid, mindmap) to 7. Each new view mode required changes in multiple locations (HTML, app.js, mermaid-viewer.js, skeleton JSONLD, CSS). Without a consistent pattern, each addition was ad-hoc and prone to forgetting a step (e.g., not hiding the new container when switching to ontology mode).

**Decision:** Standardise a 6-step pattern for adding view modes:

1. Container `<div id="{name}-container">` in `browser-viewer.html` (display: none)
2. `_switchTo{Name}Mode()` function in `app.js` (hides all peer containers, shows self)
3. Case in `setViewMode()` dispatcher
4. Toolbar config in `_setToolbarButtonsForView()` stateMap + allIds
5. NavItem entry in skeleton JSONLD (L3-context layer, Chip type, stateBinding)
6. Action entity in skeleton JSONLD (functionRef → `window.switchTo{Name}Tab`)

Each `_switchTo*Mode()` must call `switchToOntologyMode()` first (hides mermaid/mindmap), then explicitly hide all non-graph containers before showing its own.

**Rationale:**
- Consistent pattern reduces bugs when adding future view modes
- Container isolation prevents view state leakage
- Skeleton integration means the nav chip appears automatically
- All 7 current views follow this exact pattern

**Consequences:**
- (+) Adding view mode 8 follows a checklist, not guesswork
- (+) Each view is fully isolated (no shared DOM state)
- (-) Boilerplate per view (~30 lines across 3 files) — acceptable trade-off for consistency

---

## ADR-017

### EA Hub-Spoke Sub-Series Lineage Chain

| Property | Value |
|----------|-------|
| Status | **Accepted** |
| Date | 2026-03-05 |
| Decision Maker | Solution Architect (AI-assisted) |
| VSOM Alignment | L3 (Technology Platform) |
| Source | F10.7 (#885), BRIEFING-EA-Sub-Series-Restructure-VE-Skill-Chain.md |

**Context:** The EA cluster was restructured from 4 flat PE-Series siblings into a hub-spoke sub-series (EA-CORE hub + EA-TOGAF/EA-MSFT/EA-AI spokes), mirroring the GRC-FW pattern. Phase 1 (commit 8cbc64f) moved directories and updated registry entries but did not wire the visualiser's lineage classification or sub-series nesting.

**Decision:** Add a dedicated `EA` lineage chain (`['EA-CORE', 'EA-TOGAF', 'EA-MSFT', 'EA-AI']`) to `LINEAGE_CHAINS` in `state.js`. EA intra-chain edges classify as PE lineage for graph styling. EA chain members register as PE lineage in `getNodeLineageRole()`. Explicit `subSeries: "EA"` field added to all 4 registry index entries (matching VSOM-SA/VSOM-SC pattern).

**Alternatives considered:**
1. *Extend PE chain directly* — rejected: PE chain models a sequential pipeline (PPM→PE→EFS→EA), while EA is a parallel hub-spoke topology. Mixing sequential and parallel in one chain would break consecutive-pair edge detection.
2. *No lineage chain for EA* — rejected: EA cross-references (EA-CORE→EA-MSFT, EA-CORE→EA-AI) would render as generic cross-ontology edges instead of themed PE lineage edges.

**Consequences:**
- (+) EA hub-spoke edges get PE lineage styling (copper/forest green)
- (+) `subSeries` field enables correct registry browser nesting
- (+) Future EA spokes (EA-AWS, EA-Google) insert into the EA chain with a one-line addition
- (-) Lineage classification now checks 3 chains instead of 2 — negligible performance impact

**Revisit trigger:** If more PE sub-series emerge (e.g., L6S), consider generalising the sub-series lineage pattern into a configuration-driven approach rather than per-chain constants.

---

## Template for New ADRs

```markdown
## ADR-NNN

### [Title]

| Property | Value |
|----------|-------|
| Status | **Proposed** / **Accepted** / **Deprecated** / **Superseded by ADR-NNN** |
| Date | YYYY-MM-DD |
| Decision Maker | [SA / EA / CTO / AI-assisted] |
| Approval Required | [SA scope (SA approves) / Cross-cutting (EA approves) / Enterprise (CTO approves)] |
| VSOM Alignment | [BSC objectives] |
| Source | [document reference] |

**Context:** [What is the situation that requires a decision?]

**Decision:** [What was decided?]

**Alternatives Considered:**

| Option | Why Not |
|--------|---------|
| ... | ... |

**Rationale:** [Why was this option chosen over alternatives?]

**Consequences:**
- (+) [Positive outcomes]
- (-) [Negative outcomes / trade-offs]

**Revisit trigger:** [Under what conditions should this decision be reconsidered?]
```

### Approval Scope Guide (from RRR RACI)

**SA scope** — Solution Architect approves: component selection, API contracts, DB schema, testing approach, solution patterns

**Cross-cutting** — Enterprise Architect approves: storage architecture, multi-tenancy, enterprise standards, cross-PFI decisions

**Enterprise** — CTO approves: technology strategy changes, vendor commitments, security policy exceptions

---

*ADR Log — Ontology Visualiser*
*Aligned to SA-ONT ArchitectureDecisionRecord entity and RRR Ontology role governance (SA → EA → CTO)*
*Azlan-EA-AAA repo*
