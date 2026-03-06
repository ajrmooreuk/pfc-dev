# Test Plan — Phase 2: Series Rollup View & Drill-Through Navigation

**Version:** 1.0.0
**Date:** 2026-02-05
**PR:** #45
**Feature Spec:** FEATURE-SPEC-Graph-Rollup-DrillThrough-v1.0.0.md (Features 1 & 2)
**ADR:** ADR-010 (Accepted)
**Branch:** `feature/phase-2-rollup-drillthrough`

---

## Scope

Phase 2 adds three-tier progressive disclosure navigation to the multi-ontology registry view:

- **Tier 0** — Series Rollup: 6 series super-nodes (default entry point)
- **Tier 1** — Series Drill-Down: Ontology nodes within a selected series
- **Tier 2** — Entity Graph: Full entity-level graph for a single ontology

Also includes a bug fix for cross-reference property name detection in `multi-loader.js`.

---

## Files Modified

| File | Changes |
|------|---------|
| `js/state.js` | Navigation state fields, `LINEAGE_CHAINS` constant |
| `js/multi-loader.js` | Cross-ref bug fix, `buildCrossSeriesEdges()`, `getOntologiesForSeries()` |
| `js/graph-renderer.js` | `renderTier0()`, `renderTier1()` |
| `js/app.js` | Navigation functions, `loadRegistry()` modification, window bindings |
| `js/ui-panels.js` | Tier-aware drill buttons in sidebar |
| `browser-viewer.html` | Breadcrumb bar HTML |
| `css/viewer.css` | Breadcrumb + tier toggle styles |

---

## Test Categories

### TC-1: Regression — Single-Ontology Mode

Single-ontology workflows must remain unaffected by Phase 2 changes.

| ID | Test Case | Steps | Expected Result | Status | Tester | Date |
|----|-----------|-------|-----------------|--------|--------|------|
| TC-1.1 | Drag-drop single JSON | Drag a `.json` ontology file onto the drop zone | Graph renders, audit runs, compliance badge shown, no breadcrumb bar visible | | | |
| TC-1.2 | File picker load | Click "Open JSON File", select an ontology | Graph renders identically to drag-drop | | | |
| TC-1.3 | Load from GitHub | Click "Load from GitHub", enter PAT and path | Ontology loads, no breadcrumb visible | | | |
| TC-1.4 | Load from Library | Open Library panel, click a saved ontology | Ontology loads, no breadcrumb visible | | | |
| TC-1.5 | OAA compliance audit | Load any ontology, click "OAA Audit" | All 8 gates reported (G1-G6), badge shows pass/warn/fail | | | |
| TC-1.6 | Sidebar inspection | Click a node in single-ontology mode | Sidebar opens with Details, Connections, Schema, Data tabs — no drill buttons | | | |
| TC-1.7 | Double-click in single mode | Double-click a node | Focus + zoom to node, Connections tab opens | | | |
| TC-1.8 | Export PNG | Load ontology, click "Export PNG" | PNG file downloads with correct graph image | | | |
| TC-1.9 | Layout switching | Switch between Force-directed, Hierarchical, Circular | Layout changes correctly for each option | | | |
| TC-1.10 | Physics toggle | Toggle Physics button on/off | Nodes fix in place when off, resume simulation when on | | | |

---

### TC-2: Tier 0 — Series Rollup View

| ID | Test Case | Steps | Expected Result | Status | Tester | Date |
|----|-----------|-------|-----------------|--------|--------|------|
| TC-2.1 | Load Registry enters Tier 0 | Click "Load Registry" | 6 series super-nodes displayed (not 200+ entities), breadcrumb bar visible | | | |
| TC-2.2 | Series node labels | Inspect series nodes after Load Registry | Each node shows series name + ontology count (e.g., "Value Engineering\n6 ontologies") | | | |
| TC-2.3 | Series node colours | Inspect node colours | Each series has its assigned colour (Blue=VE, Green=PE, Orange=Foundation, Pink=Competitive, Purple=Security, Cyan=Orchestration) | | | |
| TC-2.4 | Cross-series edges | Inspect edges between series nodes | Gold dashed edges shown with reference count labels (e.g., "5 refs") | | | |
| TC-2.5 | Stats bar | Check stats display after Load Registry | Shows "6 series \| X cross-series edges \| Unified Registry [rollup]" | | | |
| TC-2.6 | Series legend | Check legend panel | Series legend visible with all 6 series colours | | | |
| TC-2.7 | Breadcrumb at Tier 0 | Check breadcrumb bar | Shows "Library" as current, Home button visible | | | |
| TC-2.8 | Series/Ontologies toggle | Check breadcrumb bar | "Series (6)" and "Ontologies (23)" toggle buttons visible | | | |
| TC-2.9 | Toggle to Ontologies view | Click "Ontologies (23)" in toggle | Flat 23-node merged graph renders (existing `renderMultiGraph`) | | | |
| TC-2.10 | Toggle back to Series view | From 23-node view, click "Series (6)" | Returns to 6-node Tier 0 view | | | |
| TC-2.11 | Click series node — sidebar | Single-click a series node | Sidebar shows series info + "View Ontologies in this Series" button + ontology list | | | |
| TC-2.12 | Double-click series node | Double-click a series node | Drills down to Tier 1 for that series | | | |
| TC-2.13 | Compliance hidden at Tier 0 | Check header after Load Registry | Compliance badge hidden, single-ontology buttons (Upgrade, Save to Library) hidden | | | |

---

### TC-3: Tier 1 — Series Drill-Down

| ID | Test Case | Steps | Expected Result | Status | Tester | Date |
|----|-----------|-------|-----------------|--------|--------|------|
| TC-3.1 | Drill into VE-Series | Double-click VE-Series at Tier 0 | Shows ontology nodes for VE-Series (VSOM, OKR, VP, RRR, PMF, KPI) | | | |
| TC-3.2 | Ontology node appearance | Inspect ontology nodes at Tier 1 | Size 30, series colour, short name labels | | | |
| TC-3.3 | Placeholder nodes | Check placeholder ontologies (e.g., KPI) | Shown as dashed-border diamonds, visually distinct | | | |
| TC-3.4 | Context series nodes | Check other series at Tier 1 | Other series shown as faded nodes (30% opacity) | | | |
| TC-3.5 | Cross-ontology edges | Check edges between ontology nodes | Intra-series cross-ontology edges shown | | | |
| TC-3.6 | Breadcrumb at Tier 1 | Check breadcrumb bar | Shows "Library > VE-Series", Library is clickable | | | |
| TC-3.7 | Navigate back via breadcrumb | Click "Library" in breadcrumb | Returns to Tier 0 (6 series nodes) | | | |
| TC-3.8 | Navigate back via Home | Click Home button | Returns to Tier 0 | | | |
| TC-3.9 | Switch series via context node | Double-click a faded context series node | Switches to that series (renders its ontologies) | | | |
| TC-3.10 | Sidebar — ontology node | Single-click an ontology node (non-placeholder) | Sidebar shows provenance + "View Entity Graph" button + entity count | | | |
| TC-3.11 | Sidebar — placeholder node | Single-click a placeholder node | Sidebar shows info but no "View Entity Graph" button | | | |
| TC-3.12 | Sidebar — context series node | Single-click a faded context series node | Sidebar shows "Switch to this Series" button | | | |
| TC-3.13 | Tier 0 toggle hidden at Tier 1 | Check breadcrumb bar | Series/Ontologies toggle NOT visible at Tier 1 | | | |
| TC-3.14 | Drill all 6 series | Repeat drill for each of the 6 series | Each series shows correct ontology nodes | | | |

---

### TC-4: Tier 2 — Entity Graph Drill-Down

| ID | Test Case | Steps | Expected Result | Status | Tester | Date |
|----|-----------|-------|-----------------|--------|--------|------|
| TC-4.1 | Drill into VSOM | At Tier 1 (VE-Series), double-click VSOM | Full VSOM entity graph renders (same as single-ontology view) | | | |
| TC-4.2 | Breadcrumb at Tier 2 | Check breadcrumb bar | Shows "Library > VE-Series > VSOM Ontology", Library and VE-Series are clickable | | | |
| TC-4.3 | Navigate back to Tier 1 | Click series name in breadcrumb | Returns to Tier 1 (VE-Series ontologies) | | | |
| TC-4.4 | Navigate back to Tier 0 | Click "Library" in breadcrumb | Returns to Tier 0 (6 series nodes) | | | |
| TC-4.5 | Entity sidebar at Tier 2 | Click an entity node at Tier 2 | Standard single-ontology sidebar (Details, Connections, Schema, Data) — no drill buttons | | | |
| TC-4.6 | Placeholder not drillable | At Tier 1, double-click a placeholder ontology | Nothing happens (no drill) | | | |
| TC-4.7 | Audit at Tier 2 | Click "OAA Audit" at Tier 2 | Compliance audit runs against the single ontology | | | |
| TC-4.8 | Entity double-click at Tier 2 | Double-click an entity node | Focus + zoom to node (single-ontology behaviour) | | | |

---

### TC-5: Cross-Reference Bug Fix

| ID | Test Case | Steps | Expected Result | Status | Tester | Date |
|----|-----------|-------|-----------------|--------|--------|------|
| TC-5.1 | VSOM cross-refs detected | Load Registry, check VSOM cross-ontology edges | Cross-refs from `relationships.crossOntology` are detected | PASS (auto) | Vitest | 2026-02-05 |
| TC-5.2 | VP cross-refs detected | Load Registry, check VP cross-ontology edges | Cross-refs from `relationships.keyBridges` are detected | PASS (auto) | Vitest | 2026-02-05 |
| TC-5.3 | OKR cross-refs detected | Load Registry, check OKR cross-ontology edges | Cross-refs from `relationships.crossOntology` are detected | PASS (auto) | Vitest | 2026-02-05 |
| TC-5.4 | Both property names read | Inspect console logs during Load Registry | `detectCrossReferences()` reads both `keyBridges` and `crossOntology` | PASS (auto) | Vitest | 2026-02-05 |
| TC-5.5 | No duplicate edges | Check cross-ref edges after Load Registry | No duplicate edges between the same ontology pair | PASS (auto) | Vitest | 2026-02-05 |

---

### TC-6: Breadcrumb Navigation

| ID | Test Case | Steps | Expected Result | Status | Tester | Date |
|----|-----------|-------|-----------------|--------|--------|------|
| TC-6.1 | Breadcrumb hidden in single mode | Load a single ontology | Breadcrumb bar not visible | | | |
| TC-6.2 | Breadcrumb shown in multi mode | Click Load Registry | Breadcrumb bar visible | | | |
| TC-6.3 | Full navigation path | Tier 0 > Tier 1 > Tier 2 > breadcrumb back to Tier 0 | Each transition works, breadcrumb updates correctly at each step | | | |
| TC-6.4 | Home button always returns to Tier 0 | From any tier, click Home | Returns to Tier 0 series rollup | | | |
| TC-6.5 | Breadcrumb after single-ontology load | Load Registry (Tier 0), then drag-drop a single file | Breadcrumb bar hidden, single-ontology mode restored | | | |
| TC-6.6 | Re-enter multi mode | After TC-6.5, click Load Registry again | Tier 0 view restored, breadcrumb visible | | | |

---

### TC-7: Series-Level Edge Aggregation

| ID | Test Case | Steps | Expected Result | Status | Tester | Date |
|----|-----------|-------|-----------------|--------|--------|------|
| TC-7.1 | Aggregation produces edges | Load Registry, inspect Tier 0 edges | Cross-series edges present between series that share cross-ontology references | PASS (auto) | Vitest | 2026-02-05 |
| TC-7.2 | Edge count labels | Inspect cross-series edge labels | Each edge shows count (e.g., "3 refs") | PASS (auto) | Vitest | 2026-02-05 |
| TC-7.3 | No self-edges | Check series nodes | No series has an edge to itself | PASS (auto) | Vitest | 2026-02-05 |
| TC-7.4 | Direction normalised | Check edge pairs | No duplicate edges between same pair of series (direction normalised alphabetically) | PASS (auto) | Vitest | 2026-02-05 |

---

### TC-8: Visual & UI Polish

| ID | Test Case | Steps | Expected Result | Status | Tester | Date |
|----|-----------|-------|-----------------|--------|--------|------|
| TC-8.1 | Breadcrumb styling | Inspect breadcrumb bar | Dark background (#13151a), teal links (#9dfff5), white current segment | | | |
| TC-8.2 | Tier toggle styling | Inspect Series/Ontologies toggle | Active button has teal background (#017c75), inactive is grey | | | |
| TC-8.3 | Series node sizing | Inspect Tier 0 nodes | Large nodes (size 45), readable multi-line labels (font 16) | | | |
| TC-8.4 | Faded context opacity | Inspect faded context nodes at Tier 1 | 30% opacity, clearly distinct from active nodes | | | |
| TC-8.5 | Gold edge styling | Inspect cross-series/cross-ontology edges | Gold colour (#eab839), dashed, width 2 | | | |
| TC-8.6 | Responsive layout | Resize browser window | Graph container adjusts, breadcrumb bar doesn't overflow | | | |

---

## Automated Test Suite

Unit tests for pure logic functions are implemented in Vitest and can be run via `npm test` from the visualiser directory.

**Setup:**

```bash
cd PBS/TOOLS/ontology-visualiser
npm install
npm test
```

**Test file:** `tests/multi-loader.test.js`

| Suite | Tests | Covers | Status |
|-------|-------|--------|--------|
| `buildCrossSeriesEdges` | 7 | TC-7.1–TC-7.4 + edge cases (unknown ns, empty input) | 7/7 PASS |
| `getOntologiesForSeries` | 6 | Series filtering, unknown series, data preservation | 6/6 PASS |
| `detectCrossReferences` (bug fix) | 7 | TC-5.1–TC-5.5 + edge cases (non-array crossOntology, missing relationships) | 7/7 PASS |
| **Total** | **20** | **TC-5, TC-7 fully covered** | **20/20 PASS** |

**Last run:** 2026-02-05 — Vitest v3.2.4, 276ms, 0 failures

**Remaining categories (TC-1 through TC-4, TC-6, TC-8)** require manual browser testing or future Playwright automation.

---

## Test Environment

| Item | Value |
|------|-------|
| Browser | Chrome 120+ / Firefox 120+ / Safari 17+ |
| Deployment | GitHub Pages (hosted) or local HTTP server |
| Data Source | Unified registry (23 ontologies via `ont-registry-index.json`) |
| Single-ontology test file | `sample-ontology-with-data.json` |
| Automated test runner | Vitest v3.2.4 (Node.js, `npm test`) |

---

## Pass Criteria

- All TC-1 (regression) tests pass — no single-ontology functionality broken — **pending manual**
- All TC-2 (Tier 0) tests pass — series rollup renders correctly — **pending manual**
- All TC-3 (Tier 1) tests pass — series drill-down works with context nodes — **pending manual**
- All TC-4 (Tier 2) tests pass — entity drill-down reuses single-ontology renderer — **pending manual**
- All TC-5 (bug fix) tests pass — both `keyBridges` and `crossOntology` detected — **PASS (automated, 5/5)**
- All TC-6 (breadcrumb) tests pass — navigation is consistent and reliable — **pending manual**
- All TC-7 (aggregation) tests pass — series-level edges are correct — **PASS (automated, 4/4)**
- All TC-8 (visual) tests pass — styling matches design specification — **pending manual**

---

## Sign-Off

| Role | Name | Date | Result |
|------|------|------|--------|
| Solution Architect | | | |
| Enterprise Architect | | | |
| Tester | | | |

---

*TEST-PLAN-Phase2-v1.0.0 — Series Rollup View & Drill-Through Navigation*
