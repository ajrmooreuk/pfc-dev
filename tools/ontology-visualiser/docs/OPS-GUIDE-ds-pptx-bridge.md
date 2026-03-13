# Operations Guide: Slide Deck Engine

**Version**: 2.0.0
**Modules**: `ds-pptx-bridge.mjs`, `ve-content-loader.mjs`, `generate-ve-deck.mjs`

## Quick Start

```bash
cd PBS/TOOLS/ontology-visualiser

# Generate dynamic deck from VE chain data (default: BAIV)
node generate-ve-deck.mjs

# Generate for a specific brand
BRAND=wwg node generate-ve-deck.mjs     # 21 slides (full VE chain)
BRAND=baiv node generate-ve-deck.mjs    # 8 slides (VSOM only)
BRAND=rcs node generate-ve-deck.mjs     # 10 slides (VP only, purple brand)

# Legacy mode (original 44-slide PoC)
LEGACY=1 node generate-ve-deck.mjs

# Custom output path
OUT_FILE=./my-deck.pptx BRAND=wwg node generate-ve-deck.mjs
```

## Prerequisites

- Node.js >= 18
- `pptxgenjs` installed (`npm install` from visualiser dir)
- DS-ONT instance JSONLD files in `ontology-library/PE-Series/DS-ONT/instance-data/`
- VE chain JSONLD files in `ontology-library/VE-Series/*/instance-data/`

## Environment Variables

| Var | Default | Purpose |
|-----|---------|---------|
| `BRAND` | `baiv` | Brand code: baiv, rcs, wwg, pand, vhf, airl, antq |
| `LEGACY` | unset | Set to `1` for hardcoded PoC content |
| `OUT_FILE` | `{BRAND}-VE-Strategy-Deck.pptx` | Custom output path |

## Brand Token Pipeline

### Refreshing Tokens (PE-DS-EXTRACT-001)

When a brand's Figma Design System is updated:

1. Run the MCP extraction process (6 phases, 6 gates)
2. Output overwrites `{brand}-ds-instance-v1.0.0.jsonld`
3. Next `generate-ve-deck.mjs` run picks up new tokens automatically

### Verifying Token Coverage

```bash
node -e "
import { loadBrandTokens } from './ds-pptx-bridge.mjs';
const { semMap } = loadBrandTokens('baiv');
const required = [
  'primary.surface.default', 'primary.surface.subtle', 'primary.surface.darker',
  'neutral.text.title', 'neutral.text.body', 'neutral.text.caption',
  'neutral.surface.default', 'neutral.surface.subtle', 'neutral.border.default',
  'error.surface.default', 'warning.surface.default', 'success.surface.default',
  'information.surface.default', 'primary.text.label'
];
const missing = required.filter(t => !semMap[t]);
console.log(missing.length ? 'MISSING: ' + missing.join(', ') : 'All 14 tokens present');
"
```

### Previewing Palette

```bash
node -e "
import { buildSlideColours } from './ds-pptx-bridge.mjs';
console.log(JSON.stringify(buildSlideColours('baiv'), null, 2));
"
```

## VE Chain Content

### Checking Brand Coverage

```bash
node -e "
import { listAvailableBrands } from './ve-content-loader.mjs';
console.table(listAvailableBrands());
"
```

### Previewing Content Without Generating

```bash
node -e "
import { loadVEChainContent } from './ve-content-loader.mjs';
const ve = loadVEChainContent('wwg');
console.log('Coverage:', ve.coverage.stages.join(' → '));
console.log('Strategies:', ve.vsom?.strategies.length);
console.log('Problems:', ve.vp?.problems.length);
console.log('KPIs:', ve.kpi?.kpis.length);
console.log('Kano features:', ve.kano?.features.length);
"
```

## Adding a New Brand

### 1. DS-ONT tokens (visual identity)

1. Complete PE-DS-EXTRACT-001 → `{brand}-ds-instance-v1.0.0.jsonld`
2. Add entry to `BRAND_INSTANCES` in `ds-pptx-bridge.mjs`

### 2. VE chain content (deck content)

1. Create VSOM/VP/RRR/KPI/Kano JSONLD instance files
2. Add entry to `BRAND_DATA` in `ve-content-loader.mjs` with file paths
3. Run: `BRAND=newbrand node generate-ve-deck.mjs`

## Running Tests

```bash
cd PBS/TOOLS/ontology-visualiser

# Bridge tests only (23 tests — token parsing, palette mapping)
npx vitest run tests/ds-pptx-bridge.test.js

# Content loader tests only (30 tests — VE chain extraction)
npx vitest run tests/ve-content-loader.test.js

# Both slide engine tests (53 tests)
npx vitest run tests/ds-pptx-bridge.test.js tests/ve-content-loader.test.js

# Full visualiser suite (2448 tests, 61 files)
npx vitest run

# Watch mode (re-runs on file changes)
npx vitest tests/ds-pptx-bridge.test.js tests/ve-content-loader.test.js
```

## Output Files

| Mode | Brand | Output file | Slides |
|------|-------|-------------|--------|
| Dynamic | `wwg` | `WWG-VE-Strategy-Deck.pptx` | 21 |
| Dynamic | `baiv` | `BAIV-VE-Strategy-Deck.pptx` | 8 |
| Dynamic | `rcs` | `RCS-VE-Strategy-Deck.pptx` | 10 |
| Legacy | `baiv` | `OAA-Ontology-Visualiser-VE-Skill-Chain-DS-SC-v1.1.0.pptx` | 44 |

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `Error: ENOENT` on JSONLD | Missing instance file | Run PE-DS-EXTRACT-001 or check path in BRAND_INSTANCES / BRAND_DATA |
| Slides look washed out | Brand tokens are very light | Check `primary.text.label` has a dark enough value |
| Font not rendering in PPTX | Font not installed on viewer's machine | Ensure brand font (e.g. Jura) is installed |
| `keyBenefits.forEach is not a function` | VP instance has string, not array | Fixed in v2.0.0 — loader forces arrays |
| Very few slides generated | Brand has partial VE coverage | Expected — add more VE instance data |
| `Unknown brand` error | Brand not in BRAND_DATA | Add entry to `ve-content-loader.mjs` |

## File Inventory

| File | Purpose |
|------|---------|
| `ds-pptx-bridge.mjs` | Token bridge — DS-ONT JSONLD → pptxgenjs palette |
| `ve-content-loader.mjs` | Content loader — VE chain JSONLD → structured content |
| `generate-ve-deck.mjs` | Slide deck assembler (dynamic + legacy modes) |
| `tests/ds-pptx-bridge.test.js` | Token bridge tests (23) |
| `tests/ve-content-loader.test.js` | Content loader tests (30) |
| `docs/ARCH-ds-pptx-bridge.md` | Architecture documentation |
| `docs/OPS-GUIDE-ds-pptx-bridge.md` | This operations guide |
| `docs/TEST-PLAN-ds-pptx-bridge.md` | Test plan |
| `docs/BULLETIN-ds-pptx-bridge-v1.0.0.md` | v1.0.0 release bulletin |
| `docs/BULLETIN-ve-content-loader-v2.0.0.md` | v2.0.0 release bulletin |
