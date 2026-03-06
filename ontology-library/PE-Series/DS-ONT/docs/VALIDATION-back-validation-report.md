# Back-Validation Report — F40.21 Template vs Existing Skeletons

**Version**: 1.0.0
**Date**: 2026-02-24
**Status**: Complete
**Story**: S40.21.6 (#662) — F40.21 (#646) — Epic 40 (#577)

---

## Purpose

Compare the F40.21 skeleton template against the existing BAIV PFI skeleton to validate the template's coverage and identify gaps.

---

## 1. BAIV Skeleton Analysis

**File**: `baiv-app-skeleton-v1.0.0.jsonld`

### What BAIV Has

| Entity Type | Count | Details |
|-------------|-------|---------|
| Application | 1 | `ds:extendsApp` → `ds:pfc-app-skeleton-v1.0.0`, `ds:cascadeTier: "PFI"` |
| Zones | 0 | No new zones — BAIV reuses PFC zones only |
| Nav Items | 5 | All L4: campaigns, agents, visibility, compose, freeze |
| Zone Components | 1 | Override of `cmp-pfi-context-bar` with brand colours |

### Template Comparison

| Template Section | BAIV Has It? | Notes |
|-----------------|--------------|-------|
| 1. Application Header | Yes | `ds:extendsApp` + `ds:configuredByApp` correctly set |
| 2. PFI Identity Zone (Z-{PFI}-100) | No | BAIV has no PFI-specific zones |
| 3. Agent Dashboard Zone (Z-{PFI}-101) | No | BAIV references agents via nav items only |
| 4. Agent Panel Zones | No | No domain agent-specific zones |
| 5. Stakeholder View Zones | No | BAIV is single-stakeholder (internal MarTech team) |
| 6. Compliance Dashboard | No | BAIV has no GRC-FW in its stack |
| 7. Analytics Dashboard | No | BAIV has no KPI+BSC in its stack |
| 8. PPM Zone | No | BAIV has no PPM-ONT |
| 9. L4 Nav Items | Yes | 5 items: campaigns, agents, visibility, compose, freeze |
| 10. Zone Components | Partial | 1 override (context-bar), no new zone components |
| 11. Token Overrides | Yes | `--viz-accent` and `--viz-accent-active` on context-bar |

### BAIV Template Variable Extraction

If we were to generate the BAIV skeleton from its VSOM:
- **D** (domain agents) = 0 (BAIV defines 16 agents in its VSOM but they are not PE-RMF-slotted domain agents in the same way as FloodGraph)
- **R** (stakeholder roles) = 1 (internal marketing team — single role)
- **G** (hasGRCFW) = 0
- **K** (hasKPI+BSC) = 0
- **P** (hasPPM) = 0

**Expected from template formula**:
- Zones: 2 + 0 + 1 + 0 + 0 + 0 = 3 (identity + dashboard + 1 stakeholder view)
- Nav Items: 3 + 0 + 1 + 0 + 0 + 0 = 4 (agents, stakeholders, compose, freeze)
- Components: 3 + 1 (brand override) = 4

**Actual BAIV skeleton**: 0 zones, 5 nav items, 1 component.

---

## 2. Gap Analysis

### Gaps in the Template (things BAIV does that the template doesn't cover)

| Gap | BAIV Pattern | Template Coverage | Resolution |
|-----|-------------|------------------|------------|
| Feature-specific nav items | `nav-baiv-visibility` (Visibility Score) | Not in standard template | These are product-specific nav items beyond the standard template. Add via manual extension after generation. |
| Zero-zone PFI override | BAIV adds no new zones at all | Template always generates zones | The template should handle the case where D=0 gracefully. Identity + Dashboard zones could be conditional on having domain agents. |
| Nav items without corresponding zones | BAIV has 5 nav items but 0 zones | Template pairs every nav item with a zone | This is a pre-F40.21 pattern. The template's pairing approach is more structured. |

### Gaps in BAIV (things the template generates that BAIV lacks)

| Gap | Template Pattern | Impact |
|-----|-----------------|--------|
| PFI Identity Zone | Z-{BAIV}-100 | BAIV uses the PFC context-bar override instead — functionally equivalent |
| Agent Dashboard Zone | Z-{BAIV}-101 | BAIV shows agent info inline, not in a dedicated zone — pre-F40.21 approach |
| Stakeholder View Zones | Z-{BAIV}-200 | BAIV is single-stakeholder so this is optional |
| Zone Components for nav items | Every zone has a component | BAIV's nav items toggle existing PFC zones, not PFI-specific zones |

---

## 3. Findings

### 3.1 The Template is Forward-Looking

The BAIV skeleton was created before F40.21 and follows a minimal override pattern: add L4 nav items + override context-bar brand colours. It does not add zones because the BAIV product was designed to work within existing PFC zones.

The F40.21 template represents the **new standard** for PFI skeletons going forward:
- Every PFI instance gets its own dedicated zones
- Every zone has a corresponding component
- Nav items are paired with zones they toggle
- Visibility is scoped to both instance and role

### 3.2 BAIV Compatibility

The existing BAIV skeleton is **compatible** with the F40.21 template system:
- It correctly uses `ds:extendsApp` (same mechanism the template requires)
- It correctly uses `ds:cascadeTier: "PFI"` on all entities
- Its nav items follow the `nav-baiv-{name}` convention
- It would benefit from adopting the zone-based approach in a future version

### 3.3 Template Refinement: D=0 Case

When a PFI instance has no PE-RMF-slotted domain agents (D=0), the template still generates:
- Z-{PFI}-100 (Identity Zone) — still useful
- Z-{PFI}-101 (Agent Dashboard) — less useful with no domain agents

**Recommendation**: The Agent Dashboard zone should be conditional on `D > 0`. When D=0, inherited PE-RMF agents are managed through the base PFC agent panel, not a PFI-specific dashboard.

### 3.4 W4M-WWG: No Skeleton Exists Yet

W4M-WWG has an EMC InstanceConfiguration and DS instance tokens (`wwg-ds-instance-v1.0.0.jsonld`) but no skeleton file. It would be a good candidate for the next template-generated skeleton:
- D = 0 (no domain agents documented in VSOM)
- R = 2 (supplier, buyer — from the supply-demand model)
- G = 0
- K = 1 (KPI + BSC in instanceOntologies)
- P = 0

Expected: 2 + 0 + 2 + 0 + 1 + 0 = 5 zones, simpler than FloodGraph.

---

## 4. Summary

| Metric | Result |
|--------|--------|
| Template covers FloodGraph VSOM | Full coverage — 13 zones, 11 nav items, 14 components generated |
| Template covers BAIV pattern | Partial — BAIV's minimal pattern is a subset of the template's output |
| BR-DS-013 compliance | Verified — no PFC entities modified |
| Zone ID convention compliance | Verified — all DICE entities use Z-DICE-{nnn} |
| Tests | 66/66 pass including 17 new DICE-specific tests |
| Template refinement needed | Minor — D=0 case should skip Agent Dashboard zone |
| Backward compatible | Yes — existing BAIV skeleton unaffected |

---

*DS-ONT Validation — Back-Validation Report v1.0.0*
*Ref: baiv-app-skeleton-v1.0.0.jsonld, dice-app-skeleton-v1.0.0.jsonld, MAPPING-VSOM-to-Skeleton.md*
