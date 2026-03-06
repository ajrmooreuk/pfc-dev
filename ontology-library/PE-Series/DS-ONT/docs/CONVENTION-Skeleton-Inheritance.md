# Skeleton Inheritance Model — ds:extendsApp Semantics

**Version**: 1.0.0
**Date**: 2026-02-24
**Status**: Active
**Story**: S40.21.8 (#656) — F40.21 (#646) — Epic 40 (#577)

---

## Purpose

Define how a PFI application skeleton references and extends the PFC base skeleton without duplicating its 22 zones, 26 nav items, and 25 zone components. This documents the existing `ds:extendsApp` mechanism implemented in `app-skeleton-loader.js`.

---

## 1. The ds:extendsApp Property

Each PFI skeleton declares its parent via `ds:extendsApp`:

```json
{
  "@id": "ds:dice-app-skeleton-v1.0.0",
  "@type": "ds:Application",
  "ds:appName": "FloodGraph AI — PFI-PC-DICE",
  "ds:extendsApp": { "@id": "ds:pfc-app-skeleton-v1.0.0" },
  "ds:cascadeTier": "PFI",
  "ds:configuredByApp": { "@id": "emc:InstanceConfiguration-PFI-PC-DICE" }
}
```

The loader resolves this reference at load time, fetching the PFC base and merging it with the PFI overlay.

---

## 2. The 4-Tier Cascade

The EMC cascade defines four tiers of skeleton inheritance:

```
PFC Base Skeleton (tier: PFC)
  └── PFI Override Skeleton (tier: PFI)
       └── Product Override Skeleton (tier: Product)
            └── App/Client Override Skeleton (tier: App)
```

Each tier can:
- **Add** new zones, nav items, nav layers, and zone components
- **Override** properties of entities owned by the same tier or lower tiers
- **NOT modify** structural properties of entities owned by a higher tier (BR-DS-013)

### Resolution Order

`resolveAppSkeletonForPFI()` in `app-skeleton-loader.js` executes:

1. Fetch PFC base skeleton → `parseAppSkeleton()` → base parsed
2. If PFI override exists → fetch → parse → `mergeSkeletonCascade(base, pfiOverride)`
3. If Product override exists → fetch → parse → `mergeSkeletonCascade(result, productOverride)`
4. If App override exists → fetch → parse → `mergeSkeletonCascade(result, appOverride)`

Each merge is additive: new entities are appended, matching entities (by `@id`) are spread-merged with the override winning.

---

## 3. Merge Rules

### 3.1 Entity Matching

Entities are matched by `@id` across base and overlay collections. The merge operates independently on each of the four collections:

| Collection | Matched By | Merge Behaviour |
|------------|-----------|-----------------|
| `zones[]` | `@id` | Override replaces base (subject to BR-DS-013) |
| `navLayers[]` | `@id` | Override replaces base (subject to BR-DS-013) |
| `navItems[]` | `@id` | Override replaces base (subject to BR-DS-013) |
| `zoneComponents[]` | `@id` | Override replaces base (subject to BR-DS-013) |
| `application` | (singleton) | Override wins if present |

### 3.2 BR-DS-013: Cascade Tier Immutability

**Rule**: If a base entity has `ds:cascadeTier === 'PFC'` and an overlay entity targets the same `@id` but does NOT have `ds:cascadeTier === 'PFC'`, the overlay is **blocked** with a `console.warn`.

This means:
- PFC zones (Z1–Z22) cannot be structurally modified by PFI overrides
- PFC nav items (nav-audit, nav-library, etc.) cannot be redefined
- PFC zone components (cmp-glb-*, cmp-viz-*) cannot be replaced

**Exception**: PFI-tier entities defined in the PFC base (like `cmp-pfi-context-bar` with `cascadeTier: "PFI"`) CAN be overridden by PFI skeletons. The BAIV skeleton uses this to add token overrides to `cmp-pfi-context-bar`.

### 3.3 What PFI Skeletons Can Do

| Action | Example |
|--------|---------|
| Add new zones | `Z-DICE-101` (Agent Dashboard) |
| Add new L4 nav items | `nav-dice-agents` (AI Agents button) |
| Add new zone components | `cmp-dice-agent-dashboard` |
| Override PFI-tier components | `cmp-pfi-context-bar` with DICE brand colours |
| Add token overrides | `ds:tokenOverrides` on zone components |
| Add visibility conditions | `state.activeInstanceId === 'PFI-PC-DICE'` |

### 3.4 What PFI Skeletons MUST NOT Do

| Prohibited | Reason |
|-----------|--------|
| Redefine PFC zones (Z1–Z22) | BR-DS-013 |
| Modify PFC nav layers (L1–L3) | BR-DS-013 |
| Replace PFC nav items | BR-DS-013 |
| Replace PFC zone components (cmp-glb-*, cmp-viz-*) | BR-DS-013 |
| Omit `ds:extendsApp` reference | Loader requires it for cascade resolution |
| Use zone IDs in PFC range (Z1–Z99) | Convention: PFI Zone ID Allocation v1.0.0 |

---

## 4. Skeleton File Structure

### PFI Override Skeleton (Minimal)

A PFI skeleton contains ONLY the delta from the PFC base:

```json
{
  "@context": {
    "@vocab": "https://schema.org/",
    "ds": "https://platformcore.io/ontology/ds/",
    "emc": "https://platformcore.io/ontology/emc/"
  },
  "@id": "ds:{pfi}-app-skeleton-v1.0.0",
  "@type": "ds:AppSkeletonInstance",
  "ds:version": "1.0.0",
  "@graph": [
    { "@type": "ds:Application", "ds:extendsApp": { "@id": "ds:pfc-app-skeleton-v1.0.0" }, "..." },
    { "@type": "ds:AppZone", "...new PFI zones..." },
    { "@type": "ds:NavItem", "...new L4 items..." },
    { "@type": "ds:ZoneComponent", "...new/overridden components..." }
  ]
}
```

The PFI skeleton does NOT duplicate the 22 PFC zones, 5 nav layers, 26 nav items, or 25 zone components. These are inherited automatically at merge time.

### Entity Count After Merge

| Collection | PFC Base | Typical PFI Addition | Merged Total |
|------------|----------|---------------------|--------------|
| Zones | 22 | 8–15 | 30–37 |
| Nav Layers | 5 | 0 (reuse L4) | 5 |
| Nav Items | 26 | 5–12 | 31–38 |
| Zone Components | 25 | 8–15 | 33–40 |

---

## 5. Nav Layer Extensibility

### L4: PFI Custom Layer

All PFI nav items are placed in L4 (`ds:navlayer-L4`), which is defined in the PFC base with `cascadeTier: "PFI"`. PFI skeletons add items to L4 — they do not need to redefine the layer itself.

### L5+: Future Extension Layers

If a PFI instance needs additional nav layers beyond L4, it can define L5, L6, etc. in its skeleton. These would be new `ds:NavLayer` entities with `cascadeTier: "PFI"` and `layerLevel` > 4.

The dynamic nav renderer (F40.17b) will render any layers it encounters, with no hardcoded layer count assumption.

---

## 6. Token Overrides

PFI skeletons can apply brand-specific token overrides to zone components:

```json
{
  "@id": "ds:cmp-pfi-context-bar",
  "@type": "ds:ZoneComponent",
  "ds:cascadeTier": "PFI",
  "ds:tokenOverrides": {
    "--viz-accent": "#2563EB",
    "--viz-accent-active": "#1D4ED8"
  },
  "ds:visibilityCondition": "state.activeInstanceId === 'PFI-PC-DICE'"
}
```

Token overrides are applied at the component level and scoped by visibility condition to the active PFI instance.

---

## 7. Existing Implementation

The inheritance model is fully implemented in `app-skeleton-loader.js`:

| Function | Role |
|----------|------|
| `resolveAppSkeletonForPFI(config)` | Orchestrates cascade fetch + merge |
| `parseAppSkeleton(jsonld)` | Extracts typed entities from `@graph` |
| `mergeSkeletonCascade(base, override)` | Additive merge with BR-DS-013 enforcement |
| `buildSkeletonRegistries(skeleton)` | Populates zone + nav layer registries |
| `renderNavFromSkeleton(skeleton, container)` | Builds DOM from merged skeleton |

No code changes are required for F40.21 — the inheritance model is a documentation of existing behaviour.

---

*DS-ONT Convention — Skeleton Inheritance Model v1.0.0*
*Ref: DS-ONT v2.0.0, app-skeleton-loader.js, BR-DS-013 CascadeImmutability*
