# Team Briefing: Visualiser Design Strategy for Series & Sub-Series

**Date:** 2026-02-13
**Author:** Design Director / Azlan EA-AAA
**Audience:** Engineering, design, AI agent developers, stakeholders
**Status:** Active — implementation in progress
**Related:** Epic 8 (#80), F8.11–F8.14, [DESIGN-SYSTEM-SPEC.md](./DESIGN-SYSTEM-SPEC.md)

---

## 1. Why This Matters

The ontology library has grown from 6 ontologies across 3 series to **34 ontologies across 5 series** with sub-series branching. Without a deliberate visual hierarchy, the graph becomes a wall of dots — users cannot distinguish strategic framework groupings from execution tools from foundation plumbing.

**The core problem:** cognitive overload. When everything looks the same, nothing communicates.

**The design strategy:** curated visual hierarchy through series and sub-series grouping, so the graph *thinks for the user* before the user has to think for themselves.

---

## 2. The Tier Model

The visualiser uses a progressive-disclosure navigation model:

```
Tier 0: Library Overview (graph-of-series)
  Series are 45px dot nodes — one per series
  User sees 5 nodes: VE, PE, Foundation, RCSG, Orchestration
  Cross-series edges show how series interconnect
    │
    ▼  double-click a series
Tier 1: Series View (ontologies within a series)
  Ontology nodes are 30px dots
  Sub-series grouping nodes are 35px dots (mid-size = mid-hierarchy)
  Context nodes from other series appear faded (0.55 opacity)
    │
    ▼  double-click a sub-series grouping node
Tier 1 Sub-Series: Sub-Series Drill-In
  Only member ontologies of that sub-series shown as primary
  Parent series + parent ontology shown as faded context
  Cross-ontology edges scoped to sub-series members
    │
    ▼  double-click an ontology
Tier 2: Entity Graph
  Entities, relationships, business rules, enumerations
  Cross-ontology references shown as dashed outbound edges
```

**Key principle:** each tier reduces scope while increasing detail. The user never sees more than ~12 primary nodes at any tier.

---

## 3. Sub-Series: The Pattern

### What It Is

A sub-series is a **domain-coherent grouping** of ontologies that share a parent/spine ontology and collectively cover a specific analytical or operational domain.

### How It Works in the Registry

```json
"VE-Series": {
  "ontologies": ["VSOM", "OKR", "VP", "RRR", "PMF", "KPI"],
  "subSeries": {
    "VSOM-SA": {
      "name": "VSOM Strategy Analysis",
      "description": "Strategic analysis frameworks layered on VSOM spine",
      "ontologies": ["BSC", "INDUSTRY", "REASON", "MACRO", "PORTFOLIO"]
    },
    "VSOM-SC": {
      "name": "VSOM Strategy Communication",
      "description": "Strategy communication (planned)",
      "ontologies": []
    }
  }
}
```

### How It Renders

At **Tier 1 (VE-Series)**, the user sees:
- 6 primary ontology nodes (VSOM, OKR, VP, RRR, PMF, KPI)
- 1 solid grouping node: **VSOM-SA** (35px, "5 ontologies" badge)
- 1 dashed grouping node: **VSOM-SC** (35px, dashed border = placeholder, "0 ontologies")
- A `subSeriesLink` edge from the VSOM node to the VSOM-SA node (dashed, light blue)

The 5 SA ontologies (BSC, INDUSTRY, REASON, MACRO, PORTFOLIO) are **hidden** at this tier — they live inside the grouping node. Double-clicking VSOM-SA drills into the sub-series view showing only those 5.

### The Visual Vocabulary

| Element | Shape | Size | Border | Opacity | Meaning |
|---------|-------|------|--------|---------|---------|
| Series node (T0) | dot | 45px | 3px solid | 1.0 | Top-level series |
| Sub-series grouping (T1) | dot | 35px | 3px solid / 2px dashed | 1.0 | Populated / placeholder sub-series |
| Ontology node (T1) | dot | 30px | 2px solid | 1.0 | Individual ontology |
| Context node | dot | 20-25px | 1px solid | 0.55 | Cross-ref context, not primary |
| Sub-series link edge | dashed | 2px | — | 1.0 | Parent-to-sub-series relationship |

---

## 4. Design Principles (DP-SERIES)

These principles govern how we organise ontologies in the graph. They apply **generally** — not by exception.

### DP-SERIES-001: Single Series Membership
Every ontology MUST belong to exactly one series. No ontology appears in two series. This prevents ambiguity in the graph.

### DP-SERIES-002: Sub-Series Threshold
Series with more than 6 direct ontologies SHOULD use sub-series grouping. The threshold is a guideline, not a hard rule — group by domain coherence first, count second.

### DP-SERIES-003: Spine Ontology Anchor
Sub-series MUST have a parent/spine ontology that provides the drill-through anchor node at the parent tier. For VSOM-SA, the spine is VSOM. For ORG-CTX, the spine is ORG-CONTEXT. The spine node persists at the series level; the sub-series node branches from it.

### DP-SERIES-004: Visual Hierarchy for Cognitive Load
Visual hierarchy MUST reduce cognitive load. Use node size, opacity, border weight, and containment (drill-through) to signal primary vs secondary elements. The user should never have to count or sort — the graph does that.

### DP-SERIES-005: Domain Coherence Over Count
Series/sub-series grouping is a curation decision based on domain coherence, not arbitrary ontology count. A sub-series of 2 ontologies is valid if they form a coherent domain (e.g. ORG-CTX with ORG-CONTEXT + CTX).

---

## 5. Context Node Visibility (DR-CONTEXT)

Context/ghost nodes are ontologies from other series that appear at the current tier because they are referenced by cross-ontology edges.

### DR-CONTEXT-001: Opacity
Context/ghost nodes MUST render at `opacity: 0.55`. This is visible enough to read but clearly subordinate to primary nodes at `opacity: 1.0`. Previous value was `0.3` — too faint.

### DR-CONTEXT-002: Size
Context nodes MUST be 60-70% the size of primary nodes at the same tier. At Tier 1 (primary = 30px), context nodes = 20px. At sub-series view (primary = 30px), context = 25px.

### DR-CONTEXT-003: Border
Context node borders MUST be 1px (vs 2-3px for primary). This subtle cue reinforces the visual hierarchy without requiring the user to compare opacity values.

---

## 6. Abbreviated Codes on Nodes (DR-NODE-LABEL)

### DR-NODE-LABEL-001: Abbreviated Code Display
Series, sub-series, and ontology nodes MUST display their abbreviated code on the first line of the label. This enables rapid scanning without reading full names.

**Tier 0 (Series):**
```
VE
VE-Series
11 ontologies
```

**Tier 1 (Sub-Series Grouping):**
```
SA
VSOM-SA
5 ontologies
```

**Tier 1 (Ontology):**
```
bsc:
BSC Ontology
```

---

## 7. Current & Planned Sub-Series

| Series | Sub-Series | Spine Ontology | Members | Status |
|--------|-----------|----------------|---------|--------|
| VE-Series | VSOM-SA | VSOM | BSC, INDUSTRY, REASON, MACRO, PORTFOLIO | Implemented |
| VE-Series | VSOM-SC | VSOM | (empty) | Placeholder |
| Foundation | ORG-CTX | ORG-CONTEXT | ORG-CONTEXT, CTX | Planned (F8.12) |
| PE-Series | (future) | EA | EA-CORE, EA-TOGAF, EA-MSFT | Candidate |
| RCSG-Series | (future) | RCSG-FW | MCSB, MCSB2, GDPR, PII, RMF-IS27005 | Candidate |

---

## 8. Breadcrumb Navigation

The breadcrumb supports index-based navigation across tiers with duplicate tier numbers:

```
Library  ▸  VE-Series  ▸  VSOM-SA  ▸  BSC Ontology
  ◫          ◉             ◎            ●
 T0         T1            T1-SS         T2
```

| Icon | Tier | Meaning |
|------|------|---------|
| ◫ | 0 | Library |
| ◉ | 1 | Series |
| ◎ | 1 (sub-series) | Sub-series view |
| ● | 2 | Entity graph |

Each breadcrumb segment is clickable and navigates to that exact stack position — not just the tier level.

---

## 9. Implementation Status

| Component | File | Status |
|-----------|------|--------|
| Sub-series state fields | `js/state.js` | Done |
| Sub-series data resolution | `js/multi-loader.js` | Done |
| Tier 1 grouping nodes | `js/graph-renderer.js` | Done |
| Sub-series drill-in view | `js/graph-renderer.js` | Done |
| Breadcrumb navigation | `js/app.js` | Done |
| Sub-series link edge style | `js/state.js` | Done |
| Tests (17 new) | `tests/multi-loader.test.js` | Done |
| Context opacity enhancement | `js/graph-renderer.js` | Planned (F8.11) |
| Foundation::ORG-CTX | `ont-registry-index.json` | Planned (F8.12) |
| Abbreviated codes | `js/graph-renderer.js` | Planned (F8.13) |
| Design principles docs | `DESIGN-SYSTEM-SPEC.md` | Planned (F8.14) |

---

## 10. For AI Agent Developers

The sub-series pattern is transparent to AI agents traversing the graph:
- `subSeriesData` is available in state after registry load
- Composite keys follow the pattern `"Series::SubSeries"` (e.g. `"VE-Series::VSOM-SA"`)
- Each ontology record carries `subSeries: "VSOM-SA"` (or `null`)
- Cross-ontology edges work identically whether ontologies are in a sub-series or not
- The `PortfolioStrategicLens` entity in PORTFOLIO-ONT is specifically designed for AI agent "zoom-in" operations

---

## 11. Related Documents

| Document | Path | Purpose |
| -------- | ---- | ------- |
| Design System Spec | [DESIGN-SYSTEM-SPEC.md](./DESIGN-SYSTEM-SPEC.md) | Normative DR-* design rules, token cascade, theme modes, brand integration — the authoritative design reference |
| VSOM-SA Briefing | [BRIEFING-VSOM-Strategy-Analysis.md](../../ONTOLOGIES/ontology-library/VE-Series/VSOM-SA/BRIEFING-VSOM-Strategy-Analysis.md) | 5-layer SA architecture, 10-step AI agent traversal, cross-ontology bridges for strategy analysis |
| VSOM-SC Briefing | [BRIEFING-VSOM-Strategy-Communication.md](../../ONTOLOGIES/ontology-library/VE-Series/VSOM-SC/BRIEFING-VSOM-Strategy-Communication.md) | SC architectural patterns, communication patterns, templates/decks, SA+SC patterns map for strategy communication |

**Design rules referenced in this briefing:**

- **DR-CONTEXT-001–003** (Section 5) — context/ghost node opacity, size, border weight
- **DR-NODE-LABEL-001** (Section 6) — abbreviated codes on nodes
- **DP-SERIES-001–005** (Section 4) — series and sub-series design principles

These rules will be codified in [DESIGN-SYSTEM-SPEC.md](./DESIGN-SYSTEM-SPEC.md) as part of F8.14 (Curated Design Principles).

---

*This briefing is a living document. It will be updated as F8.11–F8.14 are implemented and as new sub-series are introduced.*
