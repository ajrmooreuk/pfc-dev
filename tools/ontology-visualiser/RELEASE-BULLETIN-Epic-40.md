# Release Bulletin — Epic 40: Graphing Workbench Evolution

**Version:** 5.8.0
**Date:** 2026-03-02
**Epic:** 40 (#577)

---

## Summary

Epic 40 evolves the ONT Visualiser from a single-purpose ontology graph viewer into a multi-layer graphing workbench with 7 view modes, skeleton-driven navigation, a 4-tier design system cascade, and a composition engine with PFI instance filtering. This is the largest single epic in the project — 22 features, 10 new modules, ~8,000 lines of new code, and 1,056 tests.

---

## New Features

### Skeleton-Driven Navigation (F40.17b, F40.20)

- All 60+ toolbar items are now rendered dynamically from JSON-LD skeleton data
- No hardcoded toolbar HTML — the entire toolbar is rebuilt from `pfc-app-skeleton-v1.0.0.jsonld`
- 62 Action entities with guard conditions, RBAC roles, and accessibility hints
- 6 navigation layers across 3 toolbar zones (Z2 Primary, Z4 Authoring, Z4b Selection)
- PFI instances inject custom L4 items via cascade merge without code changes

### 7 View Modes

| View | What You See |
|------|-------------|
| **Graph** | vis-network ontology graph (original) |
| **Mermaid** | Mermaid diagram rendering |
| **Mindmap** | Hierarchical mindmap canvas |
| **Skeleton** | vis-network hierarchy of zones, layers, nav items, and actions |
| **DS Cascade** | Design system cascade panel with zone/category/component views |
| **Decision Tree** | Interactive extensibility decision engine |
| **Registry** | Full-screen registry browser with series tree, filters, and PFI cards |

Switch between views via the L3-context chip bar in the toolbar.

### Design System (DS-ONT) Integration (F40.6–F40.14)

- **Token Map Panel** — 3-view admin browser (By Zone, By Category, By Component) with live CSS values and zone boundary overlay
- **4-Tier Token Cascade** — Core → Instance → Product → App inheritance with override tracking and hardcoded detection
- **Component Naming Convention** — Quasi-OO component library with naming registry
- **Scoped Design Rules** — DR-* rules with component targeting
- **CSS Code Generation** — LLM pipeline for design-to-code transcription
- **DS-ONT Extension** — Application zones, app components, and zone token bindings

### PFI Lifecycle Workbench (F40.17)

- 10-step pipeline UI for PFI instance lifecycle management
- Skeleton-driven panels for each pipeline step
- Step status tracking with visual progress indicators

### Composition Engine Enhancements (F40.18, F40.19, F40.23)

- **Dynamic Scope Rule Loading** — PFI instances load their own scope rules from EMC InstanceConfiguration
- **Instance Ontology Filter** — `constrainToInstanceOntologies()` narrows the graph to only the PFI's declared ontologies
- **Ghost Node UX** — Foundation dependencies render as ghost nodes with dashed borders, legend section, tooltips, and a toggle to show/hide
- 11 category compositions including FULFILMENT and SECURITY

### Skeleton Graph View & Editor (F40.22)

- vis-network hierarchical graph showing Application → Zones → Layers → NavItems → Actions
- 9 CRUD mutations: add/remove nav items, add dropdown children, reparent, reorder
- Right-click context menus for all node types
- Floating toolbar with layout controls
- Undo/redo with full snapshot history

### AI Skeleton Template (F40.21)

- Parameterised template (`{{placeholder}}`, `@if`, `@each` syntax) for generating PFI skeletons
- VSOM-to-Skeleton mapping rules (VP sections → zones, KPI → dashboards, agents → panels)
- DICE FloodGraph PoC: 500+ line skeleton generated from VSOM brief
- Claude prompt guide: 11-step instructions, validation checklist, 8 common pitfalls

### Extensibility Decision Tree (F40.1)

- Interactive decision engine with 7 hypothesis gates and 12 terminal recommendations
- Scoring panel for evaluating extensibility options (Skill vs Plugin vs Agent)
- vis-network graph visualisation of the decision tree
- JSON-LD and Mermaid export support

### Skill Builder (F40.24)

- Bridges PE-ONT processes → Decision Tree recommendation → scaffolded templates
- 12 scaffold generators (SKILL.md, agent config, plugin manifest)
- Process selector with phase/agent/gate toggles
- Registry artifact output (`pfc:RegistryArtifact` JSON-LD)

### Global Search (F40.25)

- Command palette search (`/` keyboard shortcut) across all loaded data
- Searches entities, relationships, rules, registry entries, glossary, PFI instances, skeleton
- Scored substring matching with result categories and match highlighting
- Click result to navigate: focus node, drill ontology, or open panel

### Cross-Reference Indicator (F40.26)

- "Also Referenced By" section in entity sidebar
- Shows all ontologies containing an entity with the same local name
- Series-coloured dots, "Go →" navigation links, bridge badge for 3+ references

---

## Technical Details

### New Modules (10)

| Module | Lines | Purpose |
|--------|-------|---------|
| `decision-tree.js` | ~1,200 | Extensibility decision engine |
| `design-token-tree.js` | 1,797 | Admin DS browser panel |
| `token-inheritance.js` | ~600 | 4-tier cascade resolution |
| `ds-codegen.js` | ~500 | CSS code generation pipeline |
| `pfi-lifecycle-ui.js` | ~400 | PFI lifecycle workbench |
| `nav-action-registry.js` | 154 | Skeleton action → JS handler dispatch |
| `skeleton-graph.js` | ~690 | Skeleton hierarchy graph view |
| `skill-builder.js` | 718 | Process-to-skill scaffolding |
| `global-search.js` | ~517 | Command palette search |
| `registry-browser.js` | 496 | Full-screen registry browser |

### Modified Modules (Key Changes)

| Module | Change |
|--------|--------|
| `app.js` | 7 view modes, dynamic nav bar, ~800 lines added |
| `app-skeleton-loader.js` | Parser, renderer, action wiring, PFI cascade merge |
| `app-skeleton-editor.js` | 9 CRUD mutations, undo/redo, persistence |
| `emc-composer.js` | `constrainToInstanceOntologies()`, 2 new categories |
| `browser-viewer.html` | 3 dynamic nav zones, 3 view containers |
| `css/viewer.css` | ~500 lines of new styles |

### Architecture Decisions

| ADR | Decision |
|-----|----------|
| ADR-014 | Skeleton-driven navigation — all nav from JSONLD, no hardcoded toolbar |
| ADR-015 | Two-layer PFI filtering — categories + instanceOntologies constraint |
| ADR-016 | View mode extensibility — standard 6-step pattern for adding views |

---

## Test Coverage

| Category | Tests | Status |
|----------|-------|--------|
| Epic 40 feature tests | 1,056 | All pass |
| Regression tests | 915 | All pass |
| **Total** | **1,971** | **All pass (54 files)** |

Test plan: `TEST-PLAN-Epic-40-v1.0.0.md`

---

## Known Limitations

| Issue | Status | Ref |
|-------|--------|-----|
| F40.24 Skill Builder UI enhancements (S40.24.6, S40.24.8) pending | Tracked separately | #680, #682 |
| F40.21 D=0 case: Agent Dashboard zone should be conditional on having domain agents | Minor refinement | Back-validation report |
| Agent Dashboard view (F40.2), Agent Composer (F40.4), Programme Manager (F40.5) | Transferred to Epic 49 | #578, #580, #581 |

---

## Deployment & Configuration Requirements

**None** — pull latest main. No environment variables, database migrations, or configuration changes required.

The visualiser remains a zero-build-step browser application deployed via GitHub Pages. All new features are self-contained in the ES module bundle.

### Post-Deployment Verification

- [ ] Load the hosted visualiser and confirm 7 view mode chips appear in the toolbar
- [ ] Press `/` to verify global search opens
- [ ] Click "Registry" chip to verify registry browser loads
- [ ] Switch to PFI mode and select an instance to verify instance filtering
- [ ] Open Skeleton Inspector (Z22) and verify 4 tabs render

---

*Release Bulletin — Epic 40 Close-Out*
*Azlan-EA-AAA / PBS / TOOLS / ontology-visualiser*
