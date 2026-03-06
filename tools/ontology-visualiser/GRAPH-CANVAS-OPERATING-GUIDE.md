# Graph Canvas Operating Guide

**Version:** 1.0.0
**Date:** 2026-02-27
**OAA Version:** 7.0.0 | **Visualiser:** v5.7.0
**Audience:** Ontology authors, graph analysts, PFI instance operators, stakeholders
**Glossary Reference:** `unified-glossary-v3.0.0.json`

---

## Purpose

This guide defines how the graph canvas represents ontologies, entities, relationships, and cross-ontology connections. It covers the 3-tier navigation model, all node and edge visual encodings, the semantic category system, same-name entity handling, and cross-ontology navigation patterns. It is the normative reference for interpreting what you see on the canvas.

---

## 1. The 3-Tier Navigation Model

The graph canvas uses progressive disclosure across three tiers. Each tier shows a different level of abstraction.

### 1.1 Tier 0 — Series Rollup

```
┌─────────────────────────────────────────────────────────────┐
│                    TIER 0: SERIES ROLLUP                     │
│                                                              │
│    (VE)─────────gold dashed──────────(PE)                   │
│     │                                  │                     │
│     gold                              gold                   │
│     dashed                            dashed                 │
│     │                                  │                     │
│  (Foundation)──gold dashed──(RCSG)──(Orchestration)         │
│                                                              │
│  Each node = one series (6 total)                           │
│  Edge labels = cross-series reference counts                 │
│  Node size ∝ ontology count in series                       │
└─────────────────────────────────────────────────────────────┘
```

**What you see:**
- **6 super-nodes**, one per ontology series (VE, PE, Foundation, RCSG, Orchestration, Competitive)
- Each node is labelled with the series name and ontology count
- Nodes are sized proportionally — larger series appear bigger
- **Cross-series edges** (gold dashed) show aggregate reference counts between series

**How to read it:**
- A thick gold edge with label "12" between VE and PE means 12 cross-ontology references connect VE-Series ontologies to PE-Series ontologies
- The VE and PE nodes will typically be the largest (most ontologies)
- Foundation will show edges to most other series (it provides base entities)

**Navigation:** Double-click a series node to drill into Tier 1.

---

### 1.2 Tier 1 — Series Drill-Down

```
┌─────────────────────────────────────────────────────────────┐
│                TIER 1: SERIES DRILL-DOWN                     │
│                                                              │
│  Active series (full opacity):                               │
│    ┌──────┐   ┌──────┐   ┌──────┐   ┌──────┐               │
│    │ VSOM │───│ OKR  │───│  VP  │───│ PMF  │               │
│    │ 14e  │   │  6e  │   │  9e  │   │  4e  │               │
│    └──────┘   └──────┘   └──────┘   └──────┘               │
│         │                                 │                  │
│         └─────── gold dashed edges ───────┘                  │
│                                                              │
│  Context series (55% opacity):                               │
│    ○ PE  ○ Foundation  ○ RCSG                               │
│                                                              │
│  Placeholders (dashed diamond):                              │
│    ◇ MARKET-ONT  ◇ AGENT-ONT                               │
│                                                              │
│  Sub-series grouping:                                        │
│    VSOM-SA ──→ BSC, INDUSTRY, REASON, MACRO, PORTFOLIO      │
│    VSOM-SC ──→ NARRATIVE, CASCADE, CULTURE, VIZSTRAT        │
└─────────────────────────────────────────────────────────────┘
```

**What you see:**
- **Ontology nodes** in the selected series at full opacity with series colour
- Each ontology node shows its name and entity count (e.g., "VSOM 14e")
- **Cross-ontology edges** (gold dashed) between ontologies in this series
- **Context series** (other series) appear faded at 55% opacity — click to switch
- **Placeholder ontologies** render as dashed-border diamonds — not drillable
- **Sub-series grouping nodes** cluster related ontologies (e.g., VSOM-SA, VSOM-SC)
- **Ghost nodes** (#2a2a2a, near-black) appear for ontologies outside the active EMC composition

**How to read it:**
- Full-opacity nodes are ontologies you can drill into
- Gold dashed edges show which ontologies reference each other
- Faded nodes provide context — they exist but are not the focus
- Diamonds mean the ontology is planned but not yet developed

**Navigation:** Double-click an ontology node to drill into Tier 2. Double-click a faded context series node to switch to that series.

---

### 1.3 Tier 2 — Entity Graph

```
┌─────────────────────────────────────────────────────────────┐
│               TIER 2: ENTITY GRAPH                           │
│                                                              │
│     ⬡ VSOMFramework ─── contains ──→ ● VisionComponent     │
│           │                              │                   │
│       composedOf                      informs                │
│           │                              │                   │
│     ● StrategyComponent ← defines ── ● ObjectivesComponent  │
│           │                              │                   │
│       supports                       measuredBy              │
│           │                              │                   │
│     ▲ StrategicReviewCycle           ● MetricsComponent     │
│                                                              │
│  Legend:  ⬡ = core  ● = class  ▲ = supporting               │
│           ■ = framework  ★ = agent  ◆ = external            │
│           □ = layer  ⬮ = concept                            │
└─────────────────────────────────────────────────────────────┘
```

**What you see:**
- **Individual entities** rendered with archetype-specific shape, colour, and size
- **Edges** between entities styled by semantic category (see Section 3)
- Edge labels show the relationship name
- Arrows point from source to target (directional)

**How to read it:**
- The largest hexagonal nodes are the ontology's core entities
- Circle (dot) nodes are standard class entities — the bulk of any ontology
- Edge colour tells you the nature of the relationship (see Section 3)
- Dashed edges indicate taxonomy/inheritance; solid edges indicate other relationships

**Navigation:** Click any entity to open the sidebar details. Double-click to focus and zoom.

---

### 1.4 Breadcrumb Navigation

The breadcrumb bar tracks your position across tiers:

```
Library  >  VE-Series  >  VSOM-ONT
  │            │              │
  Tier 0       Tier 1         Tier 2
```

- Click any breadcrumb segment to jump back to that tier
- Click **Home** to return to Tier 0 at any time
- The `state.navigationStack` preserves full navigation history

---

## 2. Entity Archetypes — Visual Encoding

Every entity in an ontology is assigned an archetype via its `@type` field. The archetype determines how the entity appears on the canvas.

### 2.1 Archetype Reference Table

| Archetype | Shape | Colour | Size | Meaning |
|-----------|-------|--------|------|---------|
| **core** | Hexagon | Green (#4CAF50) | 30 | Foundational hub entity. The primary building block that other entities reference. Typically 1-3 per ontology. |
| **class** | Circle (dot) | Green (#4CAF50) | 20 | Standard domain entity. Concrete, instantiable, and composable. The default and most common archetype. |
| **framework** | Box | Blue (#2196F3) | 22 | Reference architecture, methodology, or pattern. Structures how domain data is organised. Not directly instantiated. |
| **supporting** | Triangle | Orange (#FF9800) | 18 | Auxiliary helper entity. Enriches the graph with context or configuration. Rarely a primary hub. |
| **agent** | Star | Pink (#E91E63) | 25 | Autonomous agent or AI capability. Performs actions, makes decisions, or executes without continuous human control. |
| **external** | Diamond | Grey (#9E9E9E) | 16 | Third-party or out-of-scope entity. Referenced but not owned. Appears smaller and muted. |
| **layer** | Square | Cyan (#00BCD4) | 22 | Named tier in a hierarchical model. Groups other entities by level or stratum. |
| **concept** | Ellipse | Purple (#AB47BC) | 18 | Abstract idea or principle. Cannot be directly instantiated as a concrete record. Classifies or qualifies other entities. |

### 2.2 How to Choose an Archetype (for Ontology Authors)

```
Is the entity the central hub of the ontology?
  ├── Yes → core (hexagon)
  └── No
        Is it a methodology, standard, or pattern?
          ├── Yes → framework (box)
          └── No
                Is it an autonomous actor (AI, bot, agent)?
                  ├── Yes → agent (star)
                  └── No
                        Is it from outside your ontology ecosystem?
                          ├── Yes → external (diamond)
                          └── No
                                Is it a named level/tier in a hierarchy?
                                  ├── Yes → layer (square)
                                  └── No
                                        Is it abstract (no direct instances)?
                                          ├── Yes → concept (ellipse)
                                          └── No
                                                Does it mainly support other entities?
                                                  ├── Yes → supporting (triangle)
                                                  └── No → class (dot) [default]
```

### 2.3 Brand-Overridable Colours

Archetype colours can be overridden per PFI brand via CSS custom properties:

```css
--viz-archetype-core       /* overrides #4CAF50 */
--viz-archetype-framework  /* overrides #2196F3 */
--viz-archetype-agent      /* overrides #E91E63 */
/* etc. */
```

Override colours are WCAG-validated at 3:1 minimum contrast against the canvas. Failing colours are silently reverted to defaults.

---

## 3. Edge Semantics — How Connections Help You Understand the Graph

Edges are the most information-dense element on the canvas. Every edge encodes three dimensions: **direction** (arrow), **nature** (colour/dash), and **scope** (intra- vs cross-ontology).

### 3.1 Semantic Edge Categories

When an edge label matches a known semantic category, it receives category styling that overrides the base edge type. This is the primary edge encoding system (DR-SEMANTIC-002).

| Category | Colour | Line Style | Width | What It Tells You | Example Labels |
|----------|--------|------------|-------|-------------------|----------------|
| **Structural** | Purple (#7E57C2) | Solid thick | 2.5px | Composition and containment. "A owns/contains B." Shows the backbone hierarchy. | `contains`, `composedOf`, `hasScope`, `hasPart` |
| **Taxonomy** | Grey (#888) | Dashed [5,5] | 1.5px | Classification and inheritance. "A is-a B" or "A extends B." Shows type hierarchies. | `subClassOf`, `extends`, `instanceOf`, `specialises` |
| **Dependency** | Red (#EF5350) | Solid | 2.0px | Dependency and requirement. "A needs B" or "A is blocked by B." Reveals critical path. | `dependsOn`, `requires`, `blockedBy`, `prerequisiteOf` |
| **Informational** | Blue (#42A5F5) | Dot-dash [3,3,8,3] | 1.5px | Knowledge and measurement flow. "A informs/measures B." Shows data and observability. | `informs`, `defines`, `measuredBy`, `monitors`, `reportsTo` |
| **Operational** | Green (#66BB6A) | Solid | 1.5px | Process and enablement. "A produces/supports B." Shows workflow and capability. | `produces`, `supports`, `enables`, `executes`, `triggers` |

**How this helps you:**
- **See structure at a glance**: Purple edges reveal the containment hierarchy — follow them to understand how entities nest.
- **Trace dependencies**: Red edges show coupling — a cluster of red edges indicates tight coupling and potential risk.
- **Follow data flow**: Blue dot-dash edges show where information originates and flows — useful for understanding measurement chains (KPI → Metrics → Objectives).
- **Understand workflows**: Green edges show operational chains — follow them to see how processes enable each other.
- **Spot inheritance**: Grey dashed edges show the type hierarchy — follow them upward to find parent classes.

### 3.2 Base Edge Types (Fallback)

When an edge label is not mapped to a semantic category, the base edge type determines styling:

| Edge Type | Colour | Line Style | Width | When Used |
|-----------|--------|------------|-------|-----------|
| **relationship** | Green (#4CAF50) | Solid | 1.5px | Default intra-ontology edge. Used when no semantic category matches. |
| **binding** | Orange (#FF9800) | Solid | 2.5px | Strong coupling — one entity is bound/configured by another. |
| **value_chain** | Blue (#2196F3) | Solid | 2.0px | Strategic or operational value transfer between entities. |
| **inheritance** | Grey (#888) | Dashed [5,5] | 1.5px | Type hierarchy (alias for subClassOf). |
| **default** | Dark grey (#555) | Solid | 1.5px | Fallback for completely unrecognised edge types. |

### 3.3 Cross-Ontology Edges (Multi-Ontology Mode Only)

These edges connect entities across different ontologies and are only visible when the registry is loaded.

| Edge Type | Colour | Line Style | Width | What It Tells You |
|-----------|--------|------------|-------|--------------------|
| **crossOntology** | Gold (#eab839) | Dashed [8,4] | 2.5px | Direct cross-ontology reference. "Entity in ontology A references entity in ontology B." **Clickable** — navigates to target ontology. |
| **crossSeries** | Gold (#eab839) | Dashed [8,4] | 2.0px | Aggregate cross-series edge at Tier 0. Label shows reference count. |
| **subSeriesLink** | Light blue (#90CAF9) | Dashed [6,3] | 2.0px | Link from sub-series grouping node to parent series at Tier 1. |

**How cross-ontology edges are detected (3-pass algorithm):**

1. **Pass 1 — Registry-declared bridges**: Reads `relationships.keyBridges[]` and `relationships.crossOntology[]` from registry entries. These are explicitly authored by ontology creators.
2. **Pass 2 — Namespace-prefix scan**: Scans entity `rangeIncludes`/`domainIncludes` for references using a different namespace prefix (e.g., `vsom:ObjectivesComponent` referenced from KPI-ONT).
3. **Pass 3 — Registry dependencies**: Processes `entry.dependencies` array for declared dependency edges.

Each cross-ontology edge carries metadata:
- `_crossOntologyTarget`: Target namespace (enables click navigation)
- `_patternId`: Join pattern reference (e.g., JP-DS-001)
- `_bridgeName`: Human-readable bridge name

### 3.4 Lineage Chain Edges (Series Highlighting Active)

When series highlight toggles are active, lineage chain edges show the strategic flow between ontologies within a series.

| Edge Type | Colour | Width | When Visible |
|-----------|--------|-------|--------------|
| **lineageVE** | Gold (#cec528) | 3.5px | VE toggle active. Shows VSOM → OKR → VP → PMF → EFS chain. |
| **lineagePE** | Copper (#b87333) | 3.5px | PE toggle active. Shows PPM → PE → EFS → EA chain. |
| **lineageConvergence** | Orange-red (#FF6B35) | 4.0px | Both VE + PE active. Shows convergence at EFS where both chains meet. |
| **lineageDimmed** | Dark grey (#444) | 1.0px | Any series highlighted. Non-matching edges dim to provide contrast. |

**How this helps you:**
- Activate the VE toggle to see the strategic value chain from Vision down to Features
- Activate the PE toggle to see the operational delivery chain from Portfolio down to Architecture
- Activate both to see where strategy meets delivery (the EFS convergence point)
- Dimmed edges fade into the background, letting you focus on the chain you care about

### 3.5 DS Bridge Edges (Design System Patterns)

DS-ONT defines specific cross-ontology bridge patterns with per-pattern colours:

| Pattern | Colour | Relationship | Bridge |
|---------|--------|--------------|--------|
| JP-DS-001 | Lime (#76ff03) | `realizesFeature` | DS → EFS |
| JP-DS-002 | Cyan (#00bcd4) | `configuredByInstance` / `configuredByApp` | DS → EMC |
| JP-DS-003 | Orange (#ff7043) | `governedByProcess` | DS → PE |
| JP-DS-004 | Purple (#ab47bc) | `ownedByBrand` | DS → ORG-CONTEXT |

Each bridge type can be independently toggled on/off in the bridge filter toolbar.

### 3.6 Edge Priority System (DR-EDGE-005)

Every edge type has a priority level (0-5) that controls rendering behaviour in multi-ontology mode:

| Priority | Edge Types | Multi-Mode Behaviour |
|----------|-----------|---------------------|
| 5 (highest) | Lineage (VE, PE, convergence) | Full width, always prominent |
| 4 | Cross-ontology, cross-series, series full | Full width |
| 3 | Binding, value_chain, structural, dependency, sub-series | Full width |
| 2 | Relationship, informational, operational | **Scaled to 80% width** to reduce clutter |
| 1 | Taxonomy, inheritance, default | **Scaled to 80% width** |
| 0 | Dimmed | Minimal width, maximum fade |

**Why this matters:** In multi-ontology mode, the canvas can have hundreds of edges. The priority system ensures important cross-ontology and lineage edges remain visible while lower-priority intra-ontology edges are de-emphasised.

---

## 4. Node States — Special Visual Indicators

Beyond archetype encoding, nodes carry additional visual state:

| Visual | Meaning | When Applied |
|--------|---------|--------------|
| Orange dashed border | **Silo node** — isolated entity with zero edges | Tier 2 when entity has no relationships |
| Gold thick border | **Bridge node** — referenced by 3+ ontologies | Multi-ontology mode |
| Series colour border + glow | **Highlighted series member** | Series toggle active |
| Convergence border (#FF6B35) | **EFS convergence point** | Both VE + PE highlighted |
| 55% opacity | **Context series node** | Tier 1, node belongs to a non-focused series |
| Near-black (#2a2a2a) | **Ghost node** — outside active EMC composition | Tier 1, ontology not in current composition |
| Dashed diamond border | **Placeholder ontology** — not yet developed | Tier 1, placeholder entries in registry |
| Component colour (Set2 palette) | **Connected component membership** | Component colouring mode active |

---

## 5. Same-Name Entities Across Ontologies

### 5.1 The Problem

The same entity name can appear in multiple ontologies. For example:
- `pfc:Vision` appears in VSOM-ONT (as the strategic vision concept)
- `kpi:Vision` may reference `pfc:Vision` via a cross-ontology bridge
- `org:Organization` in ORG-ONT may be referenced as `pf:Organization` in older ontologies

Without resolution, these create broken edges or duplicate nodes.

### 5.2 Current Resolution Mechanism

The visualiser uses a 3-step resolution system implemented in `resolveNodeInMergedGraph()`:

**Step 1 — Direct match:**
Look for `prefix::prefix:entity` in the node index (e.g., `vsom::vsom:StrategicObjective`).

**Step 2 — Original reference lookup:**
Look for the raw reference string (e.g., `vsom:StrategicObjective`) in the node index.

**Step 3 — Entity alias index fallback:**
Look up `prefix:entity` in the `entityAliasIndex` (built from registry data) to find the canonical node ID. This handles prefix mismatches (e.g., `kpi:Vision` → `kpi::pfc:Vision`).

**Prefix alias migration:**
For superseded namespaces, a `prefixAliasMap` translates old prefixes to new ones (e.g., `rcsg-fw` → `grc-fw`), ensuring backward compatibility.

### 5.3 How Cross-Ontology Navigation Works Today

1. **Click a gold dashed edge** in any multi-ontology view
2. The edge carries `_crossOntologyTarget` metadata (target namespace)
3. If the target ontology is loaded and non-placeholder, `drillToOntology(targetNs)` fires
4. The canvas navigates to Tier 2 showing the target ontology's entity graph
5. Breadcrumb updates to reflect the navigation path

This works for edges that are already detected and rendered. However, there is currently no UI to discover and navigate to same-name entities across ontologies when the user is looking at a single entity node.

### 5.4 Proposed Enhancement: Entity Cross-Reference Indicator

**Problem statement:** When a user clicks an entity node (e.g., "Vision" in VSOM-ONT), there is no indication that other ontologies also contain or reference entities with the same name. The user has no way to discover these connections without manually navigating to other ontologies.

**Proposed solution — "Also In" indicator panel:**

```
┌──────────────────────────────────────────────┐
│  DETAILS: VisionComponent                     │
│  Ontology: VE-VSOM-ONT                       │
│  Type: core (hexagon)                        │
│                                              │
│  ─── Also Referenced By ─────────────────    │
│  │ KPI-ONT  │ kpi:Vision        │ [Go →] │  │
│  │ BSC-ONT  │ bsc:Vision        │ [Go →] │  │
│  │ OKR-ONT  │ okr:Vision        │ [Go →] │  │
│  ──────────────────────────────────────────  │
│                                              │
│  3 ontologies reference this entity          │
│  Click [Go →] to navigate to that ontology   │
└──────────────────────────────────────────────┘
```

**Behaviour:**
1. When a user clicks an entity node, the sidebar checks the `entityAliasIndex` and cross-ontology edge data for all other ontologies that reference an entity with the same local name.
2. An "Also Referenced By" section appears below the standard entity details.
3. Each row shows: source ontology, qualified entity name, and a **[Go →]** navigation button.
4. Clicking **[Go →]** calls `drillToOntology(namespace)` to navigate to the target ontology, optionally highlighting the target entity.
5. The count badge (e.g., "3 ontologies reference this entity") provides immediate context about the entity's cross-ontology significance.
6. If the entity is a **bridge node** (3+ references), the indicator shows a gold border to match the graph encoding.

**Data source:** The `entityAliasIndex` (built during `buildMergedGraph`) already contains the mapping data. The enhancement requires:
- A UI component in `ui-panels.js` that queries the alias index for matching names
- A click handler that calls `drillToOntology()` with the target namespace
- Optional: highlight the target entity node after navigation (post-render focus)

**Feature trace:** See Section 7 for the feature issue specification.

---

## 6. Graph Modes — How Display Changes by Context

### 6.1 Mode Summary

| Mode | Activated By | Effect on Nodes | Effect on Edges |
|------|-------------|-----------------|-----------------|
| Single ontology | Drop/open one file | Archetype encoding (Tier 2) | Semantic categories |
| Multi-ontology | Load Registry | 3-tier navigation | Cross-ontology edges added |
| Series highlighting | VE/PE/Foundation/RCSG/Orch toggles | Matching nodes glow | Lineage chains visible; non-matching dimmed |
| Cross-refs only | Cross-refs Only button | All nodes visible | Only cross-ontology edges shown |
| Component colouring | Audit panel toggle | Nodes coloured by component | Edges coloured by component |
| Layer filtering | Layers panel | Non-matching dimmed to 15% | Non-matching edges hidden |
| Bridge type filter | Bridge pattern toggles | No change | Specific bridge patterns hidden |
| Brand theming | PFI instance selection | Archetype colours may change | Edge colours may change |

### 6.2 Mode Combinations

Modes can be combined. Common useful combinations:

- **Series highlight + Cross-refs only** — See only cross-ontology edges within a highlighted series. Reveals the series' external dependencies without intra-ontology noise.
- **Layer filtering + Series highlight** — Show only Strategic + Foundation layers with VE highlighted. Reveals how strategy links to foundational entities.
- **Component colouring + Layer filtering** — Isolate the Compliance layer and colour by connected component. Reveals which compliance ontologies are tightly coupled.

---

## 7. Feature Enhancement Trace

### 7.1 Existing Implemented Features

| Feature | Status | Implementation |
|---------|--------|---------------|
| Cross-ontology edge detection (3-pass) | Done | `multi-loader.js` lines 484-672 |
| Entity alias index (same-name resolution) | Done | `multi-loader.js` buildMergedGraph |
| Cross-ontology edge click navigation | Done | `graph-renderer.js` attachEdgeClickHandler |
| Tier 0/1/2 progressive disclosure | Done | `app.js` navigateToTier0/drillToSeries/drillToOntology |
| Series highlighting with lineage chains | Done | `graph-renderer.js` getLineageEdgeStyle |
| Bridge node detection (3+ ontology refs) | Done | `multi-loader.js` detectBridgeNodes |
| Semantic edge categories (5 types) | Done | `state.js` EDGE_SEMANTIC_STYLES |
| DS bridge pattern filtering | Done | `state.js` DS_BRIDGE_STYLES |
| Interactive legend with filter | Done | Workflow 21 in OPERATING-GUIDE.md |
| Foundation extension info (Extended By / Extends) | Done | `ui-panels.js` showNodeDetails |

### 7.2 Proposed New Feature: Entity Cross-Reference Indicator

**Feature ID:** F-XREF-INDICATOR
**Priority:** Medium
**Effort:** Small (UI-only, data already available)
**Parent:** Relates to Epic 40 (Workbench) / cross-ontology navigation theme

**Description:**
Add an "Also Referenced By" section to the entity details sidebar that shows all ontologies referencing an entity with the same local name. Each entry provides a one-click navigation link to that ontology.

**Acceptance Criteria:**
- [ ] When a user clicks an entity node in any multi-ontology view, the sidebar shows an "Also Referenced By" section if the entity name appears in other ontologies
- [ ] Each entry shows: ontology name, qualified entity ID, and a navigation button
- [ ] Clicking the navigation button calls `drillToOntology(namespace)` and navigates to Tier 2
- [ ] The target entity is highlighted (focused/zoomed) after navigation
- [ ] Bridge nodes (3+ refs) show a gold badge in the indicator
- [ ] The section is hidden in single-ontology mode (no cross-reference data available)
- [ ] The section is hidden when no cross-references exist for the selected entity

**Implementation Notes:**
- Data source: `entityAliasIndex` from `buildMergedGraph()` in `multi-loader.js`
- UI location: Below existing "Bridge Connections" section in `showNodeDetails()` in `ui-panels.js`
- Navigation: Reuse existing `window.drillToOntology(namespace)` API
- Post-navigation focus: After `renderGraph()` completes, call `network.focus(nodeId)` + `network.selectNodes([nodeId])` to highlight the target entity

**Stories (suggested):**
1. S-XREF-1: Build entity cross-reference lookup from entityAliasIndex
2. S-XREF-2: Render "Also Referenced By" section in sidebar
3. S-XREF-3: Implement click-to-navigate with post-navigation entity focus
4. S-XREF-4: Add bridge node badge and reference count
5. S-XREF-5: Tests — verify alias resolution, UI rendering, navigation

### 7.3 Proposed Enhancement: Same-Name Entity Search Disambiguation

**Feature ID:** F-SEARCH-DISAMBIG
**Priority:** Low
**Effort:** Small
**Parent:** Relates to search functionality

**Description:**
When a user searches for an entity name that exists in multiple ontologies (e.g., "Vision"), the search results should show all matches with their source ontology, rather than just the first match.

**Acceptance Criteria:**
- [ ] Search input in header/toolbar resolves matches across all loaded ontologies
- [ ] Results dropdown shows each match with: entity name, source ontology, archetype badge
- [ ] Clicking a result navigates to the target ontology (Tier 2) and focuses the entity
- [ ] Current single-ontology search behaviour unchanged when only one ontology is loaded

---

## 8. Quick Reference Card

### Node Shapes at a Glance

```
  ⬡  Core (hexagon, green, 30)       ★  Agent (star, pink, 25)
  ●  Class (dot, green, 20)           ◆  External (diamond, grey, 16)
  ■  Framework (box, blue, 22)        □  Layer (square, cyan, 22)
  ▲  Supporting (triangle, orange, 18) ⬮  Concept (ellipse, purple, 18)
```

### Edge Styles at a Glance

```
  ━━━ Purple solid      Structural (contains, composedOf)
  - - Grey dashed       Taxonomy (subClassOf, extends)
  ━━━ Red solid         Dependency (dependsOn, requires)
  -·- Blue dot-dash     Informational (informs, measuredBy)
  ━━━ Green solid       Operational (produces, enables)
  = = Gold dashed       Cross-ontology reference (clickable)
  ━━━ Gold thick solid  VE lineage chain
  ━━━ Copper solid      PE lineage chain
  ━━━ Orange-red solid  VE+PE convergence at EFS
```

### Tier Navigation

```
  Tier 0 (Series)  ─── double-click ──→  Tier 1 (Ontologies)  ─── double-click ──→  Tier 2 (Entities)
       ▲                                        ▲                                         │
       └──────── breadcrumb / Home ─────────────┘──────── breadcrumb ────────────────────┘
```

---

*Graph Canvas Operating Guide v1.0.0 — Normative reference for the OAA Ontology Visualiser*
