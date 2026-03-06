# PFI Zone ID Allocation Convention

**Version**: 1.0.0
**Date**: 2026-02-24
**Status**: Active
**Story**: S40.21.7 (#655) — F40.21 (#646) — Epic 40 (#577)

---

## Purpose

Define a collision-free naming convention for zone IDs, nav item IDs, and zone component IDs so that PFI-generated skeletons never clash with PFC base entities or with each other.

---

## 1. Zone ID Scheme

### PFC Base Allocation (Reserved)

| Range | Owner | Usage |
|-------|-------|-------|
| `Z1` – `Z99` | PFC | Base platform zones (currently Z1–Z22 allocated, Z4b as sub-zone) |

PFC zones are immutable at the PFI tier (BR-DS-013 CascadeImmutability). PFI skeletons inherit all PFC zones via `ds:extendsApp` but MUST NOT redefine them.

### PFI Instance Allocation

**Pattern**: `Z-{PFI_SHORT_CODE}-{nnn}`

| Range | Purpose | Example |
|-------|---------|---------|
| `Z-{PFI}-100` | PFI Identity Zone | `Z-DICE-100` |
| `Z-{PFI}-101` | Agent Dashboard | `Z-DICE-101` |
| `Z-{PFI}-102` – `Z-{PFI}-199` | Agent Panel Zones (one per domain agent) | `Z-DICE-102` (FRA-Assessment) |
| `Z-{PFI}-200` – `Z-{PFI}-299` | Stakeholder View Zones (one per role) | `Z-DICE-200` (Developer View) |
| `Z-{PFI}-300` – `Z-{PFI}-399` | Conditional Dashboard Zones | `Z-DICE-300` (Compliance Dashboard) |
| `Z-{PFI}-400` – `Z-{PFI}-499` | Domain-Specific Panel Zones | Reserved for future use |

### Product-Tier Allocation

**Pattern**: `Z-{PFI}-P-{nnn}`

For product-level customisations within a PFI instance (EMC cascade tier: Product).

### App/Client-Tier Allocation

**Pattern**: `Z-{PFI}-A-{nnn}`

For client-level customisations (EMC cascade tier: App).

---

## 2. PFI Short Code Registry

Short codes are registered in the EMC InstanceConfiguration and must be unique across all PFI instances.

| Short Code | PFI Instance | Product Code | Vertical |
|------------|-------------|--------------|----------|
| `BAIV` | PFI-BAIV | BAIV-AIV | MarTech |
| `WWG` | PFI-W4M-WWG | W4M-WWG | Food Import |
| `AIRL` | PFI-AIRL | AIRL-CAF-AZA | Azure AI Readiness |
| `VHF` | PFI-VHF | VHF-Nutrition | HealthTech |
| `ANTQ` | PFI-ANTQ | ANTQ-Valuations | Antiques & Collectibles |
| `DICE` | PFI-PC-DICE | PC-DICE | Construction Flood Risk |

### Rules for New Short Codes

1. 2–5 uppercase ASCII characters
2. Must not collide with existing short codes
3. Must be registered in the EMC InstanceConfiguration before use in skeleton entities
4. Prefer the most recognisable abbreviation of the product name

---

## 3. Nav Item ID Scheme

### PFC Base Pattern

**Pattern**: `nav-{layer}-{name}` or `nav-{name}`

Examples from PFC base: `nav-audit`, `nav-library`, `nav-tab-graph`, `nav-pfc-pfi-toggle`

**JSON-LD @id**: `ds:nav-{layer}-{name}`

### PFI Instance Pattern

**Pattern**: `nav-{pfi}-{name}`

All PFI nav items belong to L4 (PFI Custom layer) or higher. The PFI short code is embedded in the item ID to prevent collisions.

| Example | Instance | Action |
|---------|----------|--------|
| `nav-dice-agents` | DICE | `toggleDICEAgents` |
| `nav-dice-compliance` | DICE | `toggleDICECompliance` |
| `nav-baiv-campaigns` | BAIV | `toggleBAIVCampaigns` |
| `nav-baiv-agents` | BAIV | `toggleBAIVAgents` |

**JSON-LD @id**: `ds:nav-L4-{pfi}-{name}`

### Action Naming Convention

PFI nav item actions follow the pattern: `{verb}{PFI_SHORT_CODE}{Feature}`

Examples: `toggleDICEAgents`, `composeDICEGraph`, `freezeDICESnapshot`

---

## 4. Zone Component ID Scheme

### PFC Base Patterns

| Prefix | Scope | Example |
|--------|-------|---------|
| `cmp-glb-` | Global/platform components | `cmp-glb-header`, `cmp-glb-canvas` |
| `cmp-viz-` | Visualiser-specific components | `cmp-viz-audit`, `cmp-viz-sidebar` |
| `cmp-pfi-` | PFI-tier components (PFC-defined) | `cmp-pfi-lifecycle`, `cmp-pfi-context-bar` |

### PFI Instance Pattern

**Pattern**: `cmp-{pfi}-{name}`

| Example | Instance | Placed In Zone |
|---------|----------|----------------|
| `cmp-dice-agent-dashboard` | DICE | `Z-DICE-101` |
| `cmp-dice-fra-assessment` | DICE | `Z-DICE-102` |
| `cmp-dice-developer-view` | DICE | `Z-DICE-200` |
| `cmp-baiv-campaigns` | BAIV | (uses PFC Z16) |

**JSON-LD @id**: `ds:cmp-{pfi}-{name}`

---

## 5. Collision Avoidance Rules

1. **PFC range is sacred**: Z1–Z99, L1–L4, `nav-L1-*` through `nav-L3-*`, `cmp-glb-*`, `cmp-viz-*`, and `cmp-pfi-*` are PFC-owned. PFI skeletons MUST NOT create entities in these namespaces.

2. **Short code uniqueness**: Each PFI instance has a unique short code. All PFI-tier entity IDs embed this short code, making cross-instance collisions impossible.

3. **Numeric range isolation**: Each PFI instance gets its own numeric range under its short code prefix. `Z-DICE-101` and `Z-BAIV-101` are distinct entities.

4. **Cascade tier tagging**: All PFI-created entities MUST have `"ds:cascadeTier": "PFI"`. This is enforced by BR-DS-013 at merge time.

5. **Visibility scoping**: PFI zones and nav items SHOULD include a `ds:visibilityCondition` scoped to the instance: `state.activeInstanceId === 'PFI-{SHORT_CODE}'`.

---

## 6. Backward Compatibility — BAIV

The existing BAIV skeleton (`baiv-app-skeleton-v1.0.0.jsonld`) predates this convention. Its nav items use `nav-baiv-{name}` which is consistent with this convention. Its zone components use `cmp-pfi-context-bar` (PFC namespace), which is a PFC-defined PFI-tier component being overridden — this is permitted by the cascade merge rules.

Future BAIV additions SHOULD use the `Z-BAIV-{nnn}` zone convention if new zones are needed.

---

*DS-ONT Convention — PFI Zone ID Allocation v1.0.0*
*Ref: DS-ONT v2.0.0, APP-SKELETON-GUIDE v1.1.0, BR-DS-013 CascadeImmutability*
