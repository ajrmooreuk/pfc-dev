# Test Plan: Slide Deck Engine (F63.2)

**Version**: 2.0.0
**Modules**: `ds-pptx-bridge.mjs`, `ve-content-loader.mjs`
**Runner**: vitest
**Total tests**: 53 (23 bridge + 30 content loader)

## Running Tests

```bash
cd PBS/TOOLS/ontology-visualiser

# All slide engine tests
npx vitest run tests/ds-pptx-bridge.test.js tests/ve-content-loader.test.js

# Bridge only
npx vitest run tests/ds-pptx-bridge.test.js

# Content loader only
npx vitest run tests/ve-content-loader.test.js

# Full suite (includes all 2448 tests)
npx vitest run

# Watch mode
npx vitest tests/ds-pptx-bridge.test.js tests/ve-content-loader.test.js
```

---

## Part A: ds-pptx-bridge.test.js (23 tests)

### 1. Token Parsing (Unit)

| # | Test | Validates |
|---|------|-----------|
| 1.1 | Parse BAIV JSONLD — semantic token count | semMap has 60+ entries |
| 1.2 | Parse BAIV JSONLD — primitive token count | primMap has 40+ entries |
| 1.3 | Semantic token names match DS-ONT schema | GATE-3 mandatory tokens present |
| 1.4 | Primitive typography tokens extracted | `typography.fontFamily.headings` present |
| 1.5 | Parse RCS JSONLD — semantic tokens differ from BAIV | Brands produce distinct palettes |
| 1.6 | RCS primary is purple | `#8314ab` |
| 1.7 | Typography object populated | Jura headings, JetBrains Mono mono |

### 2. Palette Mapping (Unit)

| # | Test | Validates |
|---|------|-----------|
| 2.1 | buildSlideColours returns all 9 keys | navy, db, teal, gold, w, mg, lt, fontHeading, fontBody |
| 2.2 | Hex values are uppercase, no '#' prefix | pptxgenjs format compliance |
| 2.3 | BAIV accent = `00A4BF` | primary.surface.default maps correctly |
| 2.4 | BAIV bg = `003D48` | primary.text.label maps correctly |
| 2.5 | BAIV font = Jura | Typography token resolved |
| 2.6 | RCS accent = `8314AB` | Different brand, different accent |
| 2.7 | RCS bg differs from BAIV | Brand differentiation |

### 3. Dark Background Derivation (Unit)

| # | Test | Validates |
|---|------|-----------|
| 3.1 | bgAlt is valid 6-char hex | Darken function output |
| 3.2 | bgAlt differs from bg | 50% darken applied |

### 4. All Brands Parseable

| # | Test | Validates |
|---|------|-----------|
| 4.1-4.5 | Each of 5 brands produces valid palette | baiv, rcs, wwg, pand, vhf |

### 5. Edge Cases

| # | Test | Validates |
|---|------|-----------|
| 5.1 | Unknown brand throws | Readable error message |
| 5.2 | Custom filePath override works | Explicit path accepted |

---

## Part B: ve-content-loader.test.js (30 tests)

### 6. Brand Listing

| # | Test | Validates |
|---|------|-----------|
| 6.1 | Lists 5+ brands | All registered brands returned |
| 6.2 | Includes baiv, wwg, rcs | Key brands present |
| 6.3 | WWG shows 4+ stages | Most complete chain |

### 7. WWG Full Chain (most complete)

| # | Test | Validates |
|---|------|-----------|
| 7.1 | 5 VE stages present | VSOM, VP, RRR, KPI/BSC, Kano |
| 7.2 | Vision statement extracted | Non-empty string |
| 7.3 | Strategies extracted | 2+ with name + description |
| 7.4 | Objectives extracted | 1+ entries |
| 7.5 | Value propositions extracted | 1+ with primaryStatement |
| 7.6 | Problems extracted | 2+ with statement + severity |
| 7.7 | Pain points extracted | 3+ entries |
| 7.8 | Solutions extracted | 1+ entries |
| 7.9 | Benefits extracted | 3+ with quantified values |
| 7.10 | ICPs extracted | 3+ with industry |
| 7.11 | keyBenefits is always array | Type safety |
| 7.12 | 4 BSC perspectives | Financial, Customer, Internal, Learning |
| 7.13 | 20+ KPIs | Full metric set |
| 7.14 | Kano features extracted | 3+ features |
| 7.15 | Kano segments extracted | 2+ segments |
| 7.16 | Kano classifications extracted | 8+ with category |
| 7.17 | RRR roles extracted | 5+ functional roles |

### 8. BAIV (VSOM only)

| # | Test | Validates |
|---|------|-----------|
| 8.1 | VSOM coverage only | vsom=true, vp=false |
| 8.2 | BAIV vision contains "AI Visible" | Correct content |
| 8.3 | 3+ strategies | Strategy count |
| 8.4 | Objectives span 3+ BSC perspectives | Cross-perspective coverage |
| 8.5 | Missing stages are null | vp, rrr, kpi, kano all null |

### 9. RCS (VP only)

| # | Test | Validates |
|---|------|-----------|
| 9.1 | VP coverage only | vp=true, vsom=false |
| 9.2 | RCS VP extracted | 1+ value proposition |
| 9.3 | keyBenefits forced to array | Handles string in RCS data |

### 10. Edge Cases

| # | Test | Validates |
|---|------|-----------|
| 10.1 | Unknown brand throws | Readable error |
| 10.2 | Partial chain — coverage count correct | RCS has 1 stage |

---

## Coverage Target

- 100% of exported functions across both modules
- All 5+ brand instances parseable
- Partial chain support validated
- Array safety for VP fields
- pptxgenjs hex format compliance

## Current Results

```
53 tests across 2 test files
  ds-pptx-bridge.test.js:    23 pass
  ve-content-loader.test.js: 30 pass

Full suite: 2448/2448 pass (61 test files)
```
