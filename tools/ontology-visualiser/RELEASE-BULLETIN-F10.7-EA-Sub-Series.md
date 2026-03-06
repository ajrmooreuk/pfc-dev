# Release Bulletin: F10.7 — EA Sub-Series Completion

**Date:** 2026-03-05
**Registry Version:** 11.2.0
**Visualiser Version:** 5.5.0
**Epic:** 10 (#84) — PE Process-Engineer E2E
**Feature:** F10.7 (#885) — EA Sub-Series Completion — Graph Rendering, Nesting & Hub-Spoke Wiring

---

## Summary

The EA hub-spoke sub-series (EA-CORE, EA-TOGAF, EA-MSFT, EA-AI) now has full visualiser support: correct sub-series nesting in the registry browser, lineage chain classification for graph edge styling, and cross-ontology bridge detection between hub and spokes.

Phase 1 (commit 8cbc64f) restructured the directory layout and registry entries. This release completes Phase 2: wiring the visualiser to recognise, classify, and render the EA sub-series correctly.

---

## What Changed

### Registry Index (v11.2.0)

| Change | Detail |
|--------|--------|
| `subSeries: "EA"` added | All 4 EA entries now declare their sub-series explicitly — matching VSOM-SA/VSOM-SC pattern |
| Entries affected | EA-CORE-ONT, EA-TOGAF-ONT, EA-MSFT-ONT, EA-AI-ONT |

### Lineage Chain (state.js)

| Change | Detail |
|--------|--------|
| New chain `EA` | `['EA-CORE', 'EA-TOGAF', 'EA-MSFT', 'EA-AI']` added to `LINEAGE_CHAINS` |
| New colour `EA` | `#2e7d32` (forest green) added to `LINEAGE_COLORS` |
| PE lineage extended | EA chain members now classify as PE lineage for edge styling |

### Cross-Reference Detection (multi-loader.js)

| Change | Detail |
|--------|--------|
| `classifyLineageEdge()` | EA intra-chain edges (e.g. EA-CORE → EA-MSFT) classified as PE lineage |
| `getNodeLineageRole()` | EA-CORE/TOGAF/MSFT/AI included in PE lineage membership |
| Bridge detection | Existing `detectCrossReferences()` already handles EA entry format — no changes needed |

### Tests (multi-loader.test.js)

| Category | Tests Added |
|----------|-------------|
| EA sub-series resolution | 1 test: 4 ontologies resolved to PE-Series via subSeries path |
| EA sub-series naming | 2 tests: EA-CORE/EA-AI resolved to "EA" sub-series key |
| EA lineage edge classification | 4 tests: hub→spoke, spoke→hub, non-EA rejection |
| EA lineage role | 4 tests: all 4 EA ontologies in PE lineage |
| **Total** | **11 new tests** (2382 → 2392, all pass) |

---

## EA Ontology Summary

| Ontology | Prefix | Role | Entities | Relationships | Cross-Ontology Bridges |
|----------|--------|------|----------|---------------|----------------------|
| EA-CORE-ONT | `ea-core:` | Hub | 17 | 12 | ORG, VSOM |
| EA-TOGAF-ONT | `ea-togaf:` | Spoke (methodology) | 12 | 12 | — (internal only) |
| EA-MSFT-ONT | `ea-msft:` | Spoke (vendor) | 11 | 9 | EA-CORE, EA-AI |
| EA-AI-ONT | `ea-ai:` | Spoke (capability) | 8 | 9 | EA-CORE |

---

## Files Changed

| File | Change |
|------|--------|
| `ontology-library/ont-registry-index.json` | v11.2.0 — `subSeries: "EA"` on 4 entries |
| `js/state.js` | EA lineage chain + colour |
| `js/multi-loader.js` | EA chain classification in lineage functions |
| `tests/multi-loader.test.js` | 11 new tests + LINEAGE_CHAINS mock |

---

## Verification

- 2392/2392 tests pass
- EA ontologies parse correctly: `pf-ontology` format, 48 entities + 42 relationships total
- Cross-references declared in entry files match `detectCrossReferences()` expected format

---

*Ref: BRIEFING-EA-Sub-Series-Restructure-VE-Skill-Chain.md (Phase 2), Epic 10 (#84), F10.7 (#885)*
