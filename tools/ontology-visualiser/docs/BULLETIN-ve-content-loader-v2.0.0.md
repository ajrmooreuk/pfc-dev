# Release Bulletin: Slide Deck Engine v2.0.0

**Date**: 2026-03-08
**Feature**: F63.2 — Slide Deck Production Line
**Epic**: Epic 63 — PFC Architecture: Agents, Plugins, Skills & Tools Unification

## What Changed

Slide decks are now built **dynamically from VE chain ontology instance data**. You tell it the brand, it reads the JSONLD, and assembles the deck from live content + brand tokens.

### New Module

- **`ve-content-loader.mjs`** — Reads VSOM, VP, RRR, KPI/BSC, Kano JSONLD for any PFI brand
  - Extracts vision, strategies, objectives, problems, solutions, benefits, ICPs, KPIs, Kano classifications, roles
  - Supports partial chains — missing stages are skipped gracefully
  - 6 brands registered: baiv, airl, wwg, rcs, vhf, antq

### Modified

- **`generate-ve-deck.mjs`** — Now has two modes:
  - **Dynamic** (default): `BRAND=wwg node generate-ve-deck.mjs` → reads VE chain JSONLD
  - **Legacy**: `LEGACY=1 node generate-ve-deck.mjs` → original 44-slide PoC

### Output Examples

| Brand | VE Coverage | Slides | Output file |
|-------|-------------|--------|-------------|
| WWG | VSOM → VP → RRR → KPI/BSC → Kano | 21 | `WWG-VE-Strategy-Deck.pptx` |
| BAIV | VSOM | 8 | `BAIV-VE-Strategy-Deck.pptx` |
| RCS | VP | 10 | `RCS-VE-Strategy-Deck.pptx` |
| Legacy | Hardcoded | 44 | `OAA-Ontology-Visualiser-VE-Skill-Chain-DS-SC-v1.1.0.pptx` |

## How to Use

```bash
cd PBS/TOOLS/ontology-visualiser

# Dynamic deck from VE chain data
BRAND=wwg node generate-ve-deck.mjs

# Different brand
BRAND=rcs node generate-ve-deck.mjs

# Legacy PoC mode
LEGACY=1 node generate-ve-deck.mjs
```

## Running Tests

```bash
# Slide engine tests (53 tests)
npx vitest run tests/ds-pptx-bridge.test.js tests/ve-content-loader.test.js

# Full suite (2448 tests)
npx vitest run
```

## Pipeline

```
Figma DS Master ──→ PE-DS-EXTRACT-001 ──→ {brand}-ds-instance.jsonld
                                                    ↓
                                          ds-pptx-bridge.mjs ──→ Brand palette + font
                                                                        ↓
VE Instance Data ──→ ve-content-loader.mjs ──→ Structured content ──→ generate-ve-deck.mjs
  VSOM JSONLD                                                              ↓
  VP JSONLD                                                         Branded PPTX
  KPI/BSC JSONLD
  Kano JSON
  RRR JSONLD
```

## Test Results

```
53 tests — slide engine
  ds-pptx-bridge.test.js:    23 pass (token parsing, palette mapping, all brands)
  ve-content-loader.test.js: 30 pass (VSOM/VP/KPI/Kano/RRR extraction, partial chains)

Full suite: 2448/2448 pass (61 test files)
```

## Documentation

| Doc | Path |
|-----|------|
| Architecture | `docs/ARCH-ds-pptx-bridge.md` |
| Ops Guide | `docs/OPS-GUIDE-ds-pptx-bridge.md` |
| Test Plan | `docs/TEST-PLAN-ds-pptx-bridge.md` |
| v1.0.0 Bulletin | `docs/BULLETIN-ds-pptx-bridge-v1.0.0.md` |
| v2.0.0 Bulletin | `docs/BULLETIN-ve-content-loader-v2.0.0.md` |

## Next Steps

- **Mini UI**: Integrate brand-switch into ont-vis (already has token switching via Token Map)
- **Standalone visual QA**: Generate all brand decks side-by-side
- **VE chain gap-filling**: Add BAIV VP/KPI/Kano instance data for fuller deck
- **Social/Infographic branches**: Same bridge pattern, different output generators
- **Skill wiring**: Connect `pfc-slide-engine` skill to call `generate-ve-deck.mjs` with params
