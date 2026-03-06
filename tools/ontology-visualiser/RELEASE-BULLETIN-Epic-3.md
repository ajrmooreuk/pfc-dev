# Release Bulletin: Epic 3

**Date:** 2026-02-08
**Visualiser Version:** 4.3.0
**Scope:** Epic 3 (Enhanced Audit & Validation)

---

## What's New

### G7: Schema Properties Gate (Core)

Validates that entities and relationships have all required properties.

| Check | Description |
|-------|-------------|
| **Required entity props** | Each entity must have `@id`, `@type`, `name`, `description` (with alias support) |
| **Required relationship props** | Each relationship must have `@type`, `name`, plus domain and range |
| **Cardinality format** | If present, must match `(0|1|n)..(0|1|n|*)` notation |
| **@id uniqueness** | Flags duplicate `@id` values across entities and relationships |

### G8: Naming Conventions Gate (Advisory)

Checks naming patterns across the ontology. Advisory-only (never causes a FAIL).

| Check | Description |
|-------|-------------|
| **PascalCase entities** | Entity names should start with uppercase letter |
| **camelCase relationships** | Relationship names should start with lowercase letter |
| **Prefix consistency** | All entity `@id` values should use the same namespace prefix |

### Completeness Score

A weighted composite metric computed from all gate results, displayed as a percentage gauge.

| Category | Weight | Gates |
|----------|--------|-------|
| Connectivity | 30% | G2B, G2C |
| Schema | 25% | G1, G7 |
| Naming | 15% | G8 |
| Semantics | 20% | G3, G4 |
| Completeness | 10% | G5, G6 |

- CSS-only circular gauge (green >= 80%, yellow >= 60%, red < 60%)
- Category breakdown with progress bars
- Labels: Excellent (90+), Good (80+), Needs Work (60+), Poor (<60)

### Multi-Ontology Comparison Table

After Load Registry, a comparison table ranks all loaded ontologies by completeness score.

| Column | Description |
|--------|-------------|
| Ontology | Short name |
| Series | Series with colour dot |
| Version | From ontology metadata |
| Score | Percentage with colour indicator |
| G7 | Pass/warn/fail badge |
| G8 | Pass/warn badge |
| Status | Overall compliance status |

Click any row to navigate to that ontology.

---

## How to Use

### Completeness Score (Single Ontology)

1. **Load** any ontology (drag-drop, file picker, GitHub, or Library)
2. Click **OAA Audit** to open the audit panel
3. The **completeness score gauge** appears at the top of the compliance section
4. Below the gauge, see the **category breakdown** with individual scores

### G7 / G8 Gate Results

1. Load an ontology and open the **OAA Audit** panel
2. G7 appears under **Core Gates** — shows entity/relationship validation results
3. G8 appears under **Advisory Gates** — shows naming convention warnings
4. **Export Report** now includes G7, G8, and completeness score sections

### Multi-Ontology Comparison

1. Click **Load Registry** to load all 23 ontologies
2. Open the **OAA Audit** panel
3. Scroll to the **Multi-Ontology Comparison** section at the bottom
4. Click any row to navigate to that ontology

---

## How to Test

### Prerequisites

- Open the hosted version or serve locally with `python -m http.server 8080`
- Have a `.json` ontology file ready (or use built-in Load Registry)

### Test Checklist

| # | Test | Steps | Expected Result |
|---|------|-------|-----------------|
| 1 | G7 passes for compliant ontology | Load VSOM ontology > open OAA Audit | G7 shows PASS with entity/relationship counts |
| 2 | G7 fails for missing props | Load ontology with entities missing @type | G7 shows FAIL with specific missing property issues |
| 3 | G7 detects duplicate @id | Load ontology with duplicate entity IDs | G7 issues include "Duplicate @id" |
| 4 | G8 warns on naming | Load ontology with non-PascalCase names | G8 shows WARN (advisory) with specific names flagged |
| 5 | G8 never fails | Load any ontology | G8 status is never "fail" |
| 6 | Completeness gauge appears | Load any ontology > open audit | Circular gauge with percentage and category bars visible |
| 7 | Score >= 80% for compliant | Load a fully compliant ontology | Green gauge, "Good" or "Excellent" label |
| 8 | Score < 60% for non-compliant | Load ontology failing multiple gates | Red gauge, "Poor" label |
| 9 | Export includes score | Click Export Report | Markdown includes completeness score table |
| 10 | Comparison table appears | Load Registry > open audit | Table with all ontologies ranked by score |
| 11 | Click row navigates | Click a row in comparison table | Navigates to that ontology |

### Automated Tests

```bash
cd PBS/TOOLS/ontology-visualiser
npx vitest run
```

Expected: **38/39 pass** (1 pre-existing failure: placeholder skip test)

New test file: `tests/audit-engine.test.js` — 15 tests covering extractEntities, extractRelationships, G7, G8, and computeCompletenessScore.

---

## Files Changed

| File | Changes |
|------|---------|
| `js/audit-engine.js` | `extractEntities()`, `extractRelationships()`, `validateG7SchemaProperties()`, `validateG8NamingConventions()`, `computeCompletenessScore()`, `computeMultiOntologyScores()` |
| `js/compliance-reporter.js` | `renderCompletenessScore()` with CSS gauge and category breakdown |
| `js/graph-renderer.js` | Imports + calls for completeness scoring after validation |
| `js/ui-panels.js` | `renderComparisonTable()`, updated `buildGateReportMarkdown()` and `buildOAAPrompt()` to include G7/G8/score |
| `js/state.js` | `OAA_REQUIRED_ENTITY_PROPS`, `OAA_REQUIRED_REL_PROPS`, `lastCompletenessScore`, `multiOntologyScores` |
| `js/app.js` | Wired `computeMultiOntologyScores` + `renderComparisonTable` after registry load |
| `browser-viewer.html` | Added `#completeness-score` div, updated gate text to G1-G8 |
| `tests/audit-engine.test.js` | 15 new unit tests |
| `ARCHITECTURE.md` | G7, G8, completeness score, multi-comparison docs |
| `README.md` | Updated features list, version bump |

---

*OAA Ontology Visualiser v4.3.0 — Release Bulletin*
