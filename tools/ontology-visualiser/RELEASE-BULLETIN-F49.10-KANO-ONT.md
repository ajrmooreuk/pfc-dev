# Release Bulletin — F49.10: KANO-ONT Customer Satisfaction Classification

**Version:** ont-registry v10.9.0 | KANO-ONT v1.0.0 | pfc-kano v1.0.0 | pfc-oaa-v7 v7.1
**Date:** 2026-03-01
**Commits:** 0cf35da, 03b8307

---

## Summary

Adds the Kano Model (Noriaki Kano, 1984) as a structured ontology and analysis skill to the VSOM-SA sub-series. KANO-ONT classifies product features into 5 satisfaction categories (Must-Be, Performance, Attractive, Indifferent, Reverse) and bridges the VP→PMF gap with non-linear satisfaction curves, temporal decay tracking, and segment-aware classification confidence. Delivered alongside a new OAA v7.1 skill that wraps the Ontology Architect Agent as a reusable Claude Code skill.

---

## New Features

### KANO-ONT v1.0.0 (S49.10.1, S49.10.2)
- OAA v7.0.0 compliant ontology with 6 entities, 1 enum, 7 business rules, 5 join patterns
- Positioned as **parallel analytical lens** in VSOM-SA (like L6S in PE-Series), not a VE chain link
- 5 join patterns: VP→Classification, Classification→PMF Validation, Curve→KPI, Decay→PivotAssessment, MECE→KanoCategory
- Registry entry passes 7/7 OAA compliance gates

### W4M-WWG Instance Data (S49.10.5)
- 4 VP features classified with segment variation across Restaurant Chains, Wholesalers, and Foodservice
- 510-line instance file demonstrating full Kano classification pipeline
- W4M-WWG instanceOntologies expanded from 7 to 8

### pfc-kano Skill (S49.10.3)
- 8-section pipeline: Context Loading → Feature Inventory → Survey Design → Classification → Curve Modelling → Decay Assessment → Priority Synthesis → Output Assembly
- 8 quality gates, Dtree classification: SKILL_STANDALONE
- Invocable via `/azlan-github-workflow:pfc-kano`

### pfc-oaa-v7 Skill v7.1
- Wraps OAA v7 system prompt as a Claude Code skill with structured workflow routing
- 3 workflows: A (New Creation), B (v6→v7 Conversion), C (Interactive Validation)
- Full G1-G23 gate validation table, namespace quick reference, artifact generation pipeline
- Invocable via `/azlan-github-workflow:pfc-oaa-v7`

### EMC Composer Integration (S49.10.4)
- KANO added as optional tier to STRATEGIC, PRODUCT, and COMPETITIVE categories
- Namespace `kano:` registered in NAME_TO_PREFIX
- Dependencies: VP, PMF registered in DEPENDENCY_MAP

### Visualiser Integration (S49.10.6)
- Automatic via existing sub-series rendering — no code changes required
- KANO-ONT renders in VSOM-SA cluster alongside BSC, INDUSTRY, REASON, MACRO, PORTFOLIO
- Inherits VE-Series colour scheme, standard edge styles

## Technical Details

| Component | Change |
|-----------|--------|
| `emc-composer.js` | +4 lines: NAME_TO_PREFIX, DEPENDENCY_MAP, 3 CATEGORY_COMPOSITIONS (optional tier) |
| `ont-registry-index.json` | v10.8.0 → v10.9.0: KANO in VSOM-SA ontologies, W4M-WWG expanded to 8 |
| `emc-composer.test.js` | +7 tests: composition constraint, multi-category activation, namespace resolution |

## Test Coverage

| Test File | Tests | Status |
|-----------|-------|--------|
| emc-composer.test.js | 368 (7 new) | All pass |
| All other test files (51) | 1527 | All pass |
| **Total** | **1895** | **1895 pass** |

## Files Changed

| File | Change Type |
|------|------------|
| `VE-Series/VSOM-SA/KANO-ONT/kano-ontology-v1.0.0-oaa-v7.json` | New (911 lines) |
| `VE-Series/VSOM-SA/KANO-ONT/Entry-ONT-KANO-001.json` | New |
| `VE-Series/VSOM-SA/KANO-ONT/instance-data/kano-wwg-instance-v1.0.0.json` | New (510 lines) |
| `ont-registry-index.json` | Modified (v10.9.0) |
| `js/emc-composer.js` | Modified (+4 lines) |
| `tests/emc-composer.test.js` | Modified (+7 tests) |
| `skills/pfc-kano/SKILL.md` | New (377 lines) |
| `skills/pfc-oaa-v7/SKILL.md` | New (290 lines) |
| `BRIEFING-KANO-ONT-Satisfaction-Classification-Strategy.md` | New (645 lines) |
| `BRIEFING-Kano-Analysis-Strategy.md` | New (526 lines) |

## Known Limitations

| Issue | Status | Ref |
|-------|--------|-----|
| F49.11 Kano Visualisation (Tier 2/3 charts) not yet implemented | Open | #817 |
| KANO-ONT instance data only covers W4M-WWG; other PFI instances pending | Planned | — |
| Kano decay temporal tracking requires real longitudinal data | Placeholder | BR-KANO-006 |

## Deployment & Configuration Requirements

**None** — pull latest main. No configuration changes required. KANO-ONT activates automatically when loaded via registry. No new environment variables, localStorage keys, or dependencies.
