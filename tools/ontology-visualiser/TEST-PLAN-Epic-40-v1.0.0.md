# Test Plan — Epic 40: Graphing Workbench Evolution

**Date:** 2026-03-02
**Epic:** 40 (#577)
**Version:** 5.8.0

---

## Scope

Full regression and feature test coverage for all 22 features in Epic 40, spanning skeleton-driven navigation, design system cascade, composition engine, view modes, and utility features.

---

## Test Categories

### TC-1: Regression (Full Suite)

| ID | Test Case | Status |
|----|-----------|--------|
| TC-1.1 | All 1,971 existing tests pass | Pass |

### TC-2: Epic 40 Feature Tests

| Test File | Tests | Feature(s) | Status |
|-----------|-------|------------|--------|
| `tests/decision-tree.test.js` | 72 | F40.1 Extensibility Decision Tree | All pass |
| `tests/registry-browser.test.js` | 41 | F40.3 Registry Browser | All pass |
| `tests/design-token-tree.test.js` | 76 | F40.6 Design Token Map Panel | All pass |
| `tests/token-inheritance.test.js` | 49 | F40.8 Token Inheritance Engine | All pass |
| `tests/ds-codegen.test.js` | 64 | F40.12 CSS Transcription | All pass |
| `tests/pfi-lifecycle-ui.test.js` | 33 | F40.17 PFI Lifecycle Workbench | All pass |
| `tests/app-skeleton-loader.test.js` | 81 | F40.13, F40.17b, F40.18, F40.21 | All pass |
| `tests/app-skeleton-editor.test.js` | 84 | F40.22 Skeleton CRUD | All pass |
| `tests/app-skeleton-panel.test.js` | 29 | F40.17 Z22 Inspector Panel | All pass |
| `tests/nav-action-registry.test.js` | 24 | F40.17b/F40.20 Action Dispatch | All pass |
| `tests/skeleton-graph.test.js` | 37 | F40.22 Skeleton Graph View | All pass |
| `tests/emc-composer.test.js` | 90 | F40.19 Instance Filtering | All pass |
| `tests/composition-filter.test.js` | 28 | F40.19, F40.23 Scope/Ghost Nodes | All pass |
| `tests/scope-rules.test.js` | 72 | F40.18 Scope Rules | All pass |
| `tests/skill-builder.test.js` | 46 | F40.24 Skill Builder | All pass |
| `tests/global-search.test.js` | 41 | F40.25 Global Search | All pass |
| `tests/cross-ref-indicator.test.js` | 12 | F40.26 Cross-Reference Indicator | All pass |
| `tests/ds-loader.test.js` | 87 | F40.6, F40.8, F40.13 DS Loading | All pass |
| `tests/ds-bridge.test.js` | 19 | F40.6 DS Bridge | All pass |
| `tests/ds-authoring.test.js` | 37 | F40.10 Scoped Design Rules | All pass |
| `tests/pfi-brand-resolution.test.js` | 14 | F40.14 PFI Brand Resolution | All pass |
| `tests/pfi-loader.test.js` | 20 | F40.18 PFI Loader | All pass |
| **Epic 40 subtotal** | **1,056** | | **All pass** |

### TC-3: Non-Epic-40 Regression Tests

| Test File | Tests | Status |
|-----------|-------|--------|
| `tests/ontology-author.test.js` | 67 | All pass |
| `tests/product-bindings.test.js` | 38 | All pass |
| `tests/cypher-export.test.js` | 51 | All pass |
| `tests/export.test.js` | 44 | All pass |
| `tests/mindmap-canvas.test.js` | 55 | All pass |
| `tests/mermaid-viewer.test.js` | 42 | All pass |
| `tests/snapshot-freeze.test.js` | 46 | All pass |
| `tests/pfi-graph-gen.test.js` | 34 | All pass |
| `tests/domain-manager.test.js` | 41 | All pass |
| `tests/multi-loader.test.js` | 62 | All pass |
| `tests/revision-manager.test.js` | 48 | All pass |
| `tests/zone-overlay.test.js` | 30 | All pass |
| `tests/emc-nav-bar.test.js` | 40 | All pass |
| `tests/edge-styles.test.js` | 23 | All pass |
| `tests/audit-engine.test.js` | 18 | All pass |
| `tests/migrate-v7.test.js` | 22 | All pass |
| `tests/layer-filter.test.js` | 53 | All pass |
| `tests/github-loader.test.js` | 15 | All pass |
| `tests/recent-bookmarks.test.js` | 19 | All pass |
| `tests/agentic-prompts.test.js` | 26 | All pass |
| `tests/semantic-coherence.test.js` | 27 | All pass |
| `tests/gates-v7.test.js` | 19 | All pass |
| `tests/gates-v7-batch2.test.js` | 12 | All pass |
| `tests/gates-v7-batch3.test.js` | 13 | All pass |
| `tests/instance-overlay.test.js` | 8 | All pass |
| `tests/context-switch-ui.test.js` | 18 | All pass |
| `tests/container-surface.test.js` | 1 | All pass |
| `tests/graph-selection.test.js` | 8 | All pass |
| `tests/diff-engine.test.js` | 14 | All pass |
| `tests/namespace-resolution.test.js` | 11 | All pass |
| `tests/g8-style-guide.test.js` | 7 | All pass |
| `tests/duplicate-imports.test.js` | 3 | All pass |
| **Regression subtotal** | **915** | **All pass** |

---

## Test Coverage Summary

| Category | Tests | Status |
|----------|-------|--------|
| Epic 40 feature tests | 1,056 | All pass |
| Non-Epic-40 regression | 915 | All pass |
| **Total** | **1,971** | **1,971 pass (54 files)** |

---

## Test Execution

```
Test Files  54 passed (54)
      Tests  1971 passed (1971)
   Start at  00:08:32
   Duration  1.88s (transform 2.34s, setup 0ms, collect 4.83s, tests 2.05s, environment 3.04s, prepare 2.49s)
```

Framework: Vitest (jsdom environment)
Command: `npx vitest run` from `PBS/TOOLS/ontology-visualiser/`

---

*Test Plan — Epic 40 Close-Out v1.0.0*
