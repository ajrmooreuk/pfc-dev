# Update Bulletin: OAA v7.0.0 Visualiser Tooling Fix

**Date:** 2026-02-23
**Priority:** P0
**Epic:** 21 (#270) | **Feature:** F21.22 (#632)
**Affects:** All PFI instances using the OAA Visualiser

---

## Summary

The OAA v7.0.0 migration (Epics 21 + 42) successfully migrated all 41 ontologies and implemented quality gates G20-G24, but the **visualiser's own code generators, templates, and AI prompts** were still hardcoded to v6.1.0. This has now been fixed.

## What Changed

### Code (3 commits)

| Commit | Scope | Files |
|--------|-------|-------|
| `946fe21` | JS source + tests | export.js, ontology-author.js, ui-panels.js, compliance-reporter.js, app.js, ontology-author.test.js |
| `c0e5503` | UI + README | browser-viewer.html, README.md |
| `7b5650f` | Active docs | OAA-ARCHITECTURE-GUIDE.md, ARCHITECTURE.md, VISUALISER-DOCS.md, QUICK-START.md, ADR-LOG.md |

### What Was Wrong

| Area | Before (v6.1.0) | After (v7.0.0) |
|------|-----------------|-----------------|
| **New ontology template** | Missing `oaa:schemaVersion`, `oaa:ontologyId`, `oaa:series`, `competencyQuestions` | All v7 mandatory fields included |
| **Audit report export** | Stamped `"generatedBy": "OAA Visualiser v6.1.0"` | Now `v7.0.0` |
| **AI upgrade prompts** | Referenced G1-G8 only | Now includes G20-G24 quality gates |
| **AI generation prompts** | `getOAASchemaSpec()` returned v6.1.0 spec | Returns v7.0.0 spec with CQ format |
| **Compliance badge** | "OAA v6.1.0 PASS/FAIL" | "OAA v7.0.0 PASS/FAIL" |
| **Drop zone text** | "Supports: OAA v6.1.0" | "Supports: OAA v7.0.0" |
| **Serializer fallback** | Defaulted missing `oaaVersion` to `6.1.0` | Defaults to `7.0.0` |

### What Was NOT Changed (Intentionally)

- **Backward-compat test fixtures** — 7 test files still use `oaa:schemaVersion: '6.1.0'` to verify that v7 gates correctly return `skipped` for v6 ontologies
- **Historical docs** — RELEASE-BULLETINs, IMPL-PLANs v2-v4, HLD v1.0.0, BACKLOG document what was shipped at the time
- **ARCH-OAA-V7.md** — the Mermaid diagram labels v6.1.0 as "Semantic Layer" in the v6 > v7 > v8 progression (correct)
- **audit-engine.js** — already correctly reads `oaa:schemaVersion` from each ontology and applies v7 gates; no changes needed

## Impact on PFI Instances

- **New ontologies** created via the Visualiser authoring tool will now be v7-compliant from the start
- **AI-assisted ontology generation** will produce v7-compliant output with competency questions
- **Existing ontologies** already migrated to v7 are unaffected
- **v6 ontologies** continue to work (backward-compatible)

## Verification

- **1514/1514 tests pass** (zero regressions)
- **Zero v6.1.0 references** remain in active JS/HTML source
- Epic 21 updated: 13/22 features complete

## Action Required

**None** — this fix is automatically available when loading the Visualiser from the Azlan hub repo. PFI instances that have `pfc-docs/OAA/` should update their local copies of the architecture docs.
