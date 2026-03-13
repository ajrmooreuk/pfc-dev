# Architecture: Slide Deck Engine (F63.2)

**Version**: 2.0.0
**Parent**: F63.2 — Slide Deck Production Line
**Modules**: `ds-pptx-bridge.mjs`, `ve-content-loader.mjs`, `generate-ve-deck.mjs`

## Purpose

Two-module pipeline that reads DS-ONT brand tokens and VE Skill Chain instance data from JSONLD, then generates branded strategy slide decks via pptxgenjs.

- **ds-pptx-bridge.mjs** — Brand token bridge (colours + typography)
- **ve-content-loader.mjs** — VE chain content extractor (VSOM, VP, RRR, KPI/BSC, Kano)
- **generate-ve-deck.mjs** — Slide deck assembler (dynamic + legacy modes)

## Architecture Position

```
Figma DS Master                    VE Ontology Instance Data
    |                                  |
    v  (PE-DS-EXTRACT-001)             v  (JSONLD files per brand)
DS-ONT Instance JSONLD             VSOM / VP / RRR / KPI / Kano JSONLD
    |                                  |
    v  [ds-pptx-bridge.mjs]            v  [ve-content-loader.mjs]
Slide Palette + Typography         Structured VE content
    \                                /
     v                              v
        [generate-ve-deck.mjs]
              |
              v
        Branded PPTX
```

## Module 1: ds-pptx-bridge.mjs (Token Bridge)

### Data Flow

1. **Input**: DS-ONT instance JSONLD (207+ @graph entities per brand)
2. **Parse**: `ds:SemanticToken` → `semMap`, `ds:PrimitiveToken` → `primMap`
3. **Map**: Semantic tokens → slide palette roles:

| Palette key | DS-ONT semantic token       | Role                    |
|-------------|-----------------------------|-------------------------|
| `bg`        | `primary.text.label`        | Dark slide background   |
| `bgAlt`     | Darkened `primary.text.label` | Divider background    |
| `accent`    | `primary.surface.default`   | Brand accent colour     |
| `gold`      | `warning.surface.default`   | Secondary highlight     |
| `textLight` | `neutral.text.negative`     | Light text on dark bg   |
| `textMid`   | `neutral.text.disabled`     | Medium grey text        |
| `textSubtle`| `neutral.border.default`    | Subtle/caption text     |

4. **Typography**: `typography.fontFamily.{headings,body,mono}` → font names
5. **Output**: `{ navy, db, teal, gold, w, mg, lt, fontHeading, fontBody }`

### API

- `loadBrandTokens(brand, filePath?)` — Full token data `{ semMap, primMap, typography, palette }`
- `buildSlideColours(brand, filePath?)` — Drop-in `C` object for slide builders

## Module 2: ve-content-loader.mjs (Content Loader)

### Data Flow

1. **Input**: PFI brand code (baiv, wwg, rcs, airl, vhf, antq)
2. **Load**: Reads JSONLD files for each available VE stage
3. **Extract**: Type-specific parsers for each ontology's entity format
4. **Output**: `{ brand, brandName, vsom, vp, rrr, kpi, kano, coverage }`

### Extraction per Ontology

| Stage | Source entities | Extracted fields |
|-------|----------------|------------------|
| VSOM | `vsom:Vision`, `vsom:Strategy`, `vsom:StrategicObjective` | vision, strategies[], objectives[] |
| VP | `vp:ValueProposition`, `vp:Problem`, `vp:PainPoint`, `vp:Solution`, `vp:Benefit`, `vp:IdealCustomerProfile` | vps[], problems[], pains[], solutions[], benefits[], icps[] |
| KPI/BSC | `bsc:BSCPerspective`, `kpi:KPI` | perspectives[], kpis[] |
| Kano | `kano:KanoClassification` + manifest | features[], segments[], classifications[] |
| RRR | `rrr:FunctionalRole` | roles[] |

### Brand Coverage (as of v2.0.0)

| Brand | VSOM | VP | RRR | KPI/BSC | Kano | Dynamic slides |
|-------|------|----|----|---------|------|---------------|
| WWG   | 3 strategies | 3 probs, 5 pains, 5 benefits, 4 ICPs | 7 roles | 22 KPIs, 4 perspectives | 4 features, 12 classifications | 21 |
| BAIV  | 3 strategies, 10 objectives | — | — | — | — | 8 |
| AIRL  | 6 strategies | 3 VPs | — | — | — | Available |
| RCS   | — | 1 VP | — | — | — | 10 |
| VHF   | — | 3 VPs | 7 roles | — | — | Available |
| ANTQ  | — | 1 VP | — | — | — | Available |

### API

- `loadVEChainContent(brand)` — Full VE chain data with coverage report
- `listAvailableBrands()` — All brands with their available VE stages

## Module 3: generate-ve-deck.mjs (Assembler)

### Two Modes

| Mode | Env vars | Behaviour |
|------|----------|-----------|
| **Dynamic** (default) | `BRAND=wwg` | Reads VE chain JSONLD, builds slides from live data |
| **Legacy** | `LEGACY=1 BRAND=baiv` | Uses hardcoded PoC content (44 slides) |

### Slide Builder Primitives

5 reusable functions shared by both modes:

- `titleSlide(p)` — Full-bleed title with brand colours
- `divSlide(p, n, t, sub)` — Section divider with number/title
- `bulSlide(p, t, items, opts)` — Bullet list with optional image
- `ssSlide(p, t, f, cap)` — Screenshot slide with caption
- `tblSlide(p, t, hd, rows, o)` — Data table with brand-styled headers

### Dynamic Deck Assembly

Sections self-assemble based on VE coverage — missing stages are skipped:

1. Title (always) — brand name, VE coverage, date
2. Agenda (always) — dynamic from coverage
3. VSOM (if available) — vision, strategies, objectives table
4. VP (if available) — value props, problems, pains table, solutions+benefits, ICPs table
5. KPI/BSC (if available) — perspectives, KPI dashboard table
6. Kano (if available) — feature classification table
7. RRR (if available) — functional roles table
8. Summary + closing (always)

## Supported Brands (DS-ONT Tokens)

| Code  | Instance file                          | Primary   | Background |
|-------|----------------------------------------|-----------|------------|
| `baiv`| `baiv-ds-instance-v1.0.0.jsonld`       | `#00A4BF` | `#003D48`  |
| `rcs` | `rcs-ds-instance-v1.0.0.jsonld`        | `#8314AB` | `#380A47`  |
| `wwg` | `wwg-ds-instance-v1.0.0.jsonld`        | From tokens | From tokens |
| `pand`| `pand-ds-instance-v1.0.0.jsonld`       | From tokens | From tokens |
| `vhf` | `vhf-viridian-ds-instance-v1.0.0.jsonld`| From tokens | From tokens |

## Design Decisions

1. **No browser dependency**: Both bridge modules are standalone Node.js — no imports from `ds-loader.js` or `state.js`.
2. **Dark-mode derivation**: Brand tokens are light-mode. Bridge uses `primary.text.label` as dark background.
3. **Partial chain support**: Missing VE stages produce `null`, sections are skipped gracefully.
4. **Array safety**: VP `keyBenefits`/`differentiators` forced to array — some instances store as string.
5. **Backward-compatible keys**: `C` object keys match the original PoC (`navy`, `db`, `teal`, etc.).
6. **Legacy mode preserved**: `LEGACY=1` reproduces the exact original 44-slide PoC.
