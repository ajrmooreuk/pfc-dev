# PE-DS-EXTRACT-001 v2.2.0 — Operator Guide

**Process:** Design System Token Extraction Pipeline
**Version:** 2.2.0 | **Phases:** 6 | **Gates:** 6 | **Automation:** 98%
**Definition:** `ds-token-extraction-process-v2.2.0.json`

---

## Quick Start

Give the agent these 3 inputs and it handles everything else:

```
Extract brand {BRAND_ID} from Figma key {FILE_KEY} using PE-DS-EXTRACT-001 v2.2.0.
Brand display name: {BRAND_NAME}.
```

**Example:**
```
Extract brand wwg from Figma key 62j96Z3fx6OlZYZJJVPhG4 using PE-DS-EXTRACT-001 v2.2.0.
Brand display name: WWG.
```

---

## Required Inputs

| Input | Description | Example |
|-------|-------------|---------|
| `BRAND_ID` | Lowercase slug for file naming and registry | `wwg` |
| `FILE_KEY` | Figma file key (from URL after `/design/`) | `62j96Z3fx6OlZYZJJVPhG4` |
| `BRAND_NAME` | Display name for `pfiInstanceName` | `WWG` |
| `FIGMA_URL` | Full Figma URL *(optional, for provenance)* | `https://www.figma.com/design/62j96Z3fx6OlZYZJJVPhG4/...` |

---

## Pipeline Overview

```
PHASE 1          PHASE 2          PHASE 3          PHASE 4          PHASE 5          PHASE 6
Figma Extract -> Classify Tiers -> Validate Rules -> Populate JSONLD -> Commit & Deploy -> Verify Live
   |                |                 |                  |                  |                 |
 GATE-1           GATE-2           GATE-3             GATE-4            GATE-5            GATE-6
 Completeness     Classification   Schema Valid       Output Valid      Deployed          Live OK
```

---

## Phase Details

### Phase 1 — Figma Variable Extraction

**What:** Extract raw design token data from Figma via MCP tools.

**Steps:**
1. Call `get_variable_defs(fileKey, nodeId="0:1")` — try Variables API first
2. If empty (visual swatch files), fall back to:
   - `get_metadata(fileKey, nodeId="0:1")` — discover page structure
   - `get_design_context(fileKey, nodeId)` on each semantic section
3. Record all hex values, node IDs, and groups in extraction log

**Known template node IDs** (all current brand files use these):

| Section | Node ID |
|---------|---------|
| Primary | `32:128` |
| Secondary | `32:152` |
| Error | `32:175` |
| Warning | `32:221` |
| Information | `32:245` |
| Success | `32:268` |
| Accent | `32:314` |
| Neutral | `36:59` |

**GATE-1:** >= 10 colour tokens, 3 spacing, 2 radius extracted.

---

### Phase 2 — Token Tier Classification

**What:** Sort tokens into Primitive / Semantic / Component tiers.

**Rules:**
- Colour scales, raw hex values, spacing units, radii, typography = **Primitive**
- Intent-named (surface/text/border + primary/error/neutral) = **Semantic**
- Component-scoped (button/card/input prefix) = **Component**

**Expected counts** (for current template):
- 118 Primitives (88 colours + typography + spacing + radius)
- 75 Semantics (7 groups x 9 tokens + neutral x 12)
- 0 Components (none in current brand files)

**GATE-2:** Zero unclassified tokens; all have valid `valueType`.

---

### Phase 3 — DS-ONT Schema Validation

**What:** Validate against business rules BR-DS-001 through BR-DS-008.

**Critical check (BR-DS-008):** All 14 CSS-var-required semantic token names must exist:

```
primary.surface.default    primary.surface.subtle     primary.surface.darker
primary.border.default
neutral.text.title         neutral.text.body          neutral.text.caption
neutral.surface.subtle     neutral.surface.default    neutral.border.default
error.surface.default      warning.surface.default
success.surface.default    information.surface.default
```

**GATE-3:** Zero blocking errors.

---

### Phase 4 — DS Instance Population

**What:** Generate the JSONLD file, extraction log, and update the registry entry.

**Output files:**
```
instance-data/{brand}-ds-instance-v1.0.0.jsonld    # 207 @graph entries
instance-data/{brand}-extraction-log.json           # Gate results + extracted nodes
Entry-ONT-DS-001.json                               # Updated instanceData array
```

**JSONLD structure:**
```json
{
  "@context": { "ds": "...", "{brand}-ds": "https://{brand}.platform.io/ontology/ds/" },
  "@graph": [
    { "@type": "ds:DesignSystem", ... },       // 1
    { "@type": "ds:TokenCategory", ... },      // 7
    { "@type": "ds:PrimitiveToken", ... },     // 118
    { "@type": "ds:SemanticToken", ... },      // 75
    { "@type": "ds:BrandVariant", ... },       // 1
    { "@type": "ds:FigmaSource", ... },        // 1
    { "@type": "ds:ThemeMode", ... },          // 1
    { "@type": "ds:DesignPattern", ... }       // 3
  ]
}
```

**Validation command:**
```bash
python3 -c "
import json
with open('instance-data/{brand}-ds-instance-v1.0.0.jsonld') as f:
    data = json.load(f)
graph = data['@graph']
counts = {}
for n in graph:
    t = n.get('@type','?')
    counts[t] = counts.get(t,0) + 1
print(f'Entries: {len(graph)}')
for k,v in sorted(counts.items()): print(f'  {k}: {v}')
"
```

**GATE-4:** Valid JSON; correct entity counts; @context has brand prefix.

---

### Phase 5 — Commit & Deploy

**What:** Stage, commit, handle upstream changes, push, verify workflow.

**Steps:**
1. Run tests: `npx vitest run` from visualiser dir (383/384 pass expected, 1 pre-existing)
2. Stage files:
   ```bash
   git add instance-data/{brand}-ds-instance-v1.0.0.jsonld \
           instance-data/{brand}-extraction-log.json \
           Entry-ONT-DS-001.json
   ```
3. Commit:
   ```
   feat(ds): add {BRAND} brand instance data via PE-DS-EXTRACT-001
   ```
4. Pull & rebase: `git pull --rebase` (stash if needed)
5. Push: `git push`
6. Verify: `gh run list --limit 1`

**Error recovery:**

| Error | Fix |
|-------|-----|
| Push rejected (fetch first) | `git stash && git pull --rebase && git stash pop && git push` |
| Rebase conflict | Resolve conflicts, `git add`, `git rebase --continue`, push |
| Tests fail | Investigate and fix before committing — do not skip |

**GATE-5:** Push exit code 0; workflow status = `completed/success`.

---

### Phase 6 — Live Deployment Verification

**What:** Confirm files are accessible on GitHub Pages.

**Steps:**
1. Wait for workflow completion (~20-30s):
   ```bash
   gh run list --limit 1
   ```
2. Verify JSONLD is live:
   ```
   https://ajrmooreuk.github.io/Azlan-EA-AAA/PBS/ONTOLOGIES/ontology-library/PE-Series/DS-ONT/instance-data/{brand}-ds-instance-v1.0.0.jsonld
   ```
3. Verify registry entry is live:
   ```
   https://ajrmooreuk.github.io/Azlan-EA-AAA/PBS/ONTOLOGIES/ontology-library/PE-Series/DS-ONT/Entry-ONT-DS-001.json
   ```
4. Confirm the `instanceData` array includes the new brand

**CDN Cache Note:** GitHub Pages CDN caches files for up to 10 minutes. After deployment:
- New files: available within 1-2 minutes
- Updated files: may serve stale version for up to 10 minutes
- **Fix:** Hard refresh (`Cmd+Shift+R` / `Ctrl+Shift+R`) bypasses browser cache

**GATE-6:** HTTP 200; valid JSON; entity counts match GATE-4.

---

## Current Brand Inventory

| Brand | ID | Figma Key | Primary Colour | Status |
|-------|----|-----------|---------------|--------|
| VHF Viridian | `vhf-viridian` | `CWQqQv1fk9SLYjZFQKA2lE` | #017c75 (Teal) | draft |
| BAIV | `baiv` | `bXCyfNwzc8Z9kEeFIeIB8C` | #00a4bf (Cyan) | populated |
| RCS | `rcs` | `JowntVHgYzfuZmaLHNRVTZ` | #8314ab (Purple) | populated |
| PAND | `pand` | `a6EXm5Bbk9OuUBsGB8ZtV7` | #6ec833 (Green) | populated |
| WWG | `wwg` | `62j96Z3fx6OlZYZJJVPhG4` | #8d1f50 (Pink) | populated |

---

## Troubleshooting

### Brands don't appear in visualiser dropdown
1. **Hard refresh** (`Cmd+Shift+R`) — browser may cache old registry entry
2. Check browser console for `[DS]` or `[DS Loader]` log messages
3. Verify `Entry-ONT-DS-001.json` on GitHub Pages has the brand in `instanceData`
4. Verify JSONLD file returns HTTP 200 from GitHub Pages URL

### Figma extraction returns empty
- `get_variable_defs` fails on visual swatch files — use `get_metadata` + `get_design_context` fallback
- Check Figma MCP authentication: `whoami` tool

### JSONLD entity count mismatch
- Extraction log may show preliminary counts before full population
- Always validate final JSONLD with `python3 json.load()` count script
- Update extraction log to match actual counts

### Theme not applying in visualiser
- Brand needs all 14 CSS-var-required semantic token names (see Phase 3)
- Check `generateCSSVars()` output in browser console: `[DS] Applied N CSS vars`
- `_deriveMissingVars()` fills gaps via brightness adjustments if `neutral.surface.default` exists

---

## Scope Note

This guide covers **token extraction** — the automated pipeline that pulls design tokens from Figma and populates DS-ONT instance data (PrimitiveToken, SemanticToken, ComponentToken entities). Tokens are machine-extracted from Figma brand files.

**App skeleton authoring** (Application, AppZone, NavLayer, NavItem, ZoneComponent entities) is a separate, hand-authored process covered in PE-DS-EXTRACT-002.

---

## Related Guides

| Guide                              | Scope                                                                       |
|------------------------------------|-----------------------------------------------------------------------------|
| **PE-DS-EXTRACT-001** (this file)  | Token extraction from Figma → DS-ONT instance data                          |
| **PE-DS-EXTRACT-002**              | App skeleton authoring — JSONLD structure for zones, nav layers, components |

---

## File Map

```
PE-Series/DS-ONT/
  Entry-ONT-DS-001.json                          # Registry entry (5 brands)
  ds-v2.0.0-oaa-v6.json                           # Ontology schema (v2.0.0 with skeleton entities)
  ds-token-extraction-process-v1.0.0.json         # Process v1 (4 phases)
  ds-token-extraction-process-v2.1.0.json         # Process v2.1 (6 phases)
  ds-token-extraction-process-v2.2.0.json         # Token process v2.2 (6 phases) <-- current
  ds-skeleton-authoring-process-v1.0.0.json       # Skeleton process v1.0 (4 phases)
  PE-DS-EXTRACT-001-guide.md                      # This file (token extraction)
  PE-DS-EXTRACT-002-guide.md                      # Skeleton authoring guide
  instance-data/
    baiv-ds-instance-v1.0.0.jsonld                # BAIV brand (populated)
    baiv-extraction-log.json
    vhf-viridian-ds-instance-v1.0.0.jsonld        # VHF brand (draft)
    rcs-ds-instance-v1.0.0.jsonld                 # RCS brand (populated)
    rcs-extraction-log.json
    pand-ds-instance-v1.0.0.jsonld                # PAND brand (populated)
    pand-extraction-log.json
    wwg-ds-instance-v1.0.0.jsonld                 # WWG brand (populated)
    wwg-extraction-log.json
    pfc-app-skeleton-v1.0.0.jsonld               # PFC base skeleton (69 entities)
```

---

## Release Checklist (Adding a New Brand)

- [ ] Obtain Figma file key and brand ID
- [ ] Invoke PE-DS-EXTRACT-001 v2.2.0 with the 3 required inputs
- [ ] Phase 1: Figma extraction completes (GATE-1 pass)
- [ ] Phase 2: Token classification completes (GATE-2 pass)
- [ ] Phase 3: Schema validation passes (GATE-3 pass)
- [ ] Phase 4: JSONLD + extraction log + registry update written (GATE-4 pass)
- [ ] Phase 5: Tests pass, committed, pushed (GATE-5 pass)
- [ ] Phase 6: Live on GitHub Pages, verified accessible (GATE-6 pass)
- [ ] Hard refresh visualiser — brand appears in dropdown with token count
- [ ] Select brand — DS panel shows categories/primitives/semantics
- [ ] Apply to Visualiser — theme changes visually
- [ ] Reset Theme — returns to defaults
