# Release Bulletin: DS-PPTX Bridge v1.0.0

**Date**: 2026-03-08
**Feature**: F63.2 — Slide Deck Production Line
**Epic**: Epic 63 — PFC Architecture: Agents, Plugins, Skills & Tools Unification

## What Changed

The slide deck generator (`generate-ve-deck.mjs`) now uses **live brand tokens** from DS-ONT instance data instead of hardcoded colour constants.

### New Module

- **`ds-pptx-bridge.mjs`** — Bridge from DS-ONT JSONLD → pptxgenjs palette
  - Reads any of the 5 brand instance files (BAIV, RCS, WWG, PAND, VHF)
  - Maps semantic tokens to slide palette roles (background, accent, text tiers)
  - Extracts typography from primitive tokens (font families)

### Modified

- **`generate-ve-deck.mjs`**
  - Replaced hardcoded `const C = { navy: '0D1B2A', ... }` with `buildSlideColours(BRAND)`
  - Replaced 20 hardcoded `'Helvetica Neue'` references with brand typography token
  - New env var: `BRAND=baiv|rcs|wwg|pand|vhf` (default: `baiv`)

## Brand Palettes

| Brand | Background | Accent | Gold/Highlight | Font |
|-------|-----------|--------|----------------|------|
| BAIV  | `#003D48` (dark teal) | `#00A4BF` | `#CEC528` | Jura |
| RCS   | `#380A47` (deep purple) | `#8314AB` | `#C8B133` | Jura |
| WWG   | Resolved from tokens | Resolved from tokens | Resolved from tokens | From tokens |
| PAND  | Resolved from tokens | Resolved from tokens | Resolved from tokens | From tokens |
| VHF   | Resolved from tokens | Resolved from tokens | Resolved from tokens | From tokens |

## Deployment

```bash
cd PBS/TOOLS/ontology-visualiser

# 1. Verify tests pass
npx vitest run tests/ds-pptx-bridge.test.js  # 23 tests

# 2. Generate BAIV deck
node generate-ve-deck.mjs
# → OAA-Ontology-Visualiser-VE-Skill-Chain-DS-SC-v1.1.0.pptx (44 slides)

# 3. Generate RCS deck
BRAND=rcs node generate-ve-deck.mjs

# 4. Verify full suite still green
npx vitest run  # 2418 tests
```

## Token Pipeline

```
Figma DS Master → PE-DS-EXTRACT-001 (MCP) → {brand}-ds-instance.jsonld
                                                    ↓
                                            ds-pptx-bridge.mjs
                                                    ↓
                                            generate-ve-deck.mjs → Branded PPTX
```

No new dependencies. No schema changes. The bridge reads the same JSONLD files that `ds-loader.js` already consumes for the visualiser UI — same pipeline, different output format.

## RCS Token Status

RCS tokens and docs confirmed in Azlan repo:
- `PE-Series/DS-ONT/instance-data/rcs-ds-instance-v1.0.0.jsonld` (250 tokens)
- `PE-Series/DS-ONT/instance-data/rcs-extraction-log.json`
- `PE-Series/DS-ONT/instance-data/PROMPT-Brand-RCS-Design-Tokens.md` (688 lines)
- `VE-Series/VP-ONT/instance-data/RCS-Value-Proposition-v1.0.0.md`
- PFI triads: `pfi-w4m-rcs-{dev,test,prod}` cloned locally

## Test Results

```
23 tests — ds-pptx-bridge.test.js
  Token parsing (BAIV + RCS): 7 pass
  Palette mapping: 5 pass
  Dark background derivation: 2 pass
  All 5 brands parseable: 5 pass
  Edge cases: 2 pass
  Typography: 2 pass

Full suite: 2418/2418 pass (60 test files)
```

## Documentation

| Doc | Path |
|-----|------|
| Architecture | `docs/ARCH-ds-pptx-bridge.md` |
| Ops Guide | `docs/OPS-GUIDE-ds-pptx-bridge.md` |
| Test Plan | `docs/TEST-PLAN-ds-pptx-bridge.md` |
| This Bulletin | `docs/BULLETIN-ds-pptx-bridge-v1.0.0.md` |

## Next Steps

- **Mini UI**: Integrate brand-switch into ont-vis (already has token switching via Token Map)
- **Standalone test**: Generate RCS + BAIV decks side-by-side for visual QA
- **VE Skill Chain use case**: Wire VE chain output as slide content source
- **Social/Infographic branches**: Same bridge pattern, different output generators
