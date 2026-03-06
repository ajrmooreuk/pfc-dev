# PE-DS-EXTRACT-002 v1.0.0 — Skeleton Authoring Guide

**Process:** Application Skeleton Authoring Pipeline
**Version:** 1.0.0 | **Phases:** 4 | **Gates:** 4 | **Automation:** Manual
**Schema:** `ds-v2.0.0-oaa-v6.json`
**Definition:** `ds-skeleton-authoring-process-v1.0.0.json`

---

## Scope

This guide covers **app skeleton authoring** — the hand-authored JSONLD that defines application layout (zones, navigation layers, nav items, zone components). Skeletons are structural; they describe *where* UI elements live, not *how* they look.

**Token extraction** (colours, spacing, typography from Figma) is a separate automated process covered in [PE-DS-EXTRACT-001](./PE-DS-EXTRACT-001-guide.md).

---

## Pipeline Overview

```
PHASE 1              PHASE 2              PHASE 3              PHASE 4
Author JSONLD  ->  Validate Rules  ->  Test with Loader  ->  Commit & Verify
     |                   |                    |                     |
  GATE-1              GATE-2               GATE-3               GATE-4
  Schema Valid      BR Rules Pass       Loader Parses OK      Live Verified
```

---

## Phase 1 — Author JSONLD

**What:** Create or extend an app skeleton JSONLD file.

### File Naming

| Cascade Tier | File Pattern                                          | Example                            |
|--------------|-------------------------------------------------------|------------------------------------|
| PFC          | `pfc-app-skeleton-v{VERSION}.jsonld`                  | `pfc-app-skeleton-v1.0.0.jsonld`   |
| PFI          | `{instance}-app-skeleton-override-v{VERSION}.jsonld`  | `baiv-app-skeleton-override-v1.0.0.jsonld` |
| Product      | `{product}-app-skeleton-override-v{VERSION}.jsonld`   | (future)                           |

### JSONLD Structure

```json
{
  "@context": {
    "ds": "https://platformcore.io/ontology/ds/"
  },
  "@graph": [
    { "@type": "ds:Application", ... },
    { "@type": "ds:AppZone", ... },
    { "@type": "ds:NavLayer", ... },
    { "@type": "ds:NavItem", ... },
    { "@type": "ds:ZoneComponent", ... }
  ]
}
```

### Entity Reference

#### ds:Application

Root container for an application skeleton. Each PFI product resolves to one Application via EMC InstanceConfiguration.

| Property          | Type          | Required | Description                                      |
|-------------------|---------------|----------|--------------------------------------------------|
| `appId`           | xsd:string    | Yes      | Unique ID (e.g. `pfc-visualiser`)                |
| `appName`         | xsd:string    | Yes      | Human-readable name                              |
| `version`         | xsd:string    | Yes      | Semantic version of the skeleton                 |
| `appType`         | ds:AppType    | Yes      | SPA, MPA, or Hybrid                              |
| `rootRoute`       | xsd:string    | No       | Default route path (e.g. `/`)                    |
| `cascadeTier`     | ds:CascadeTier| Yes      | Which cascade tier this skeleton belongs to      |
| `description`     | xsd:string    | No       | Application purpose and scope                    |

**Relationship:** `ds:appUsesDesignSystem` — links Application to DesignSystem (1..1). E.g. `"ds:appUsesDesignSystem": { "@id": "ds:pfc-design-system" }`.

#### ds:AppZone

A spatial region within the application layout with behaviour type, position, and visibility rules.

| Property              | Type          | Required | Description                                      |
|-----------------------|---------------|----------|--------------------------------------------------|
| `zoneId`              | xsd:string    | Yes      | Zone code (e.g. `Z1`, `Z4b`, `Z18`)             |
| `zoneName`            | xsd:string    | Yes      | Human-readable label (e.g. `Header`)             |
| `zoneType`            | ds:ZoneType   | Yes      | Fixed, Floating, Sliding, Overlay, Conditional   |
| `position`            | xsd:string    | No       | CSS hint: top, right, left, center, bottom-left  |
| `defaultWidth`        | xsd:string    | No       | Default width (e.g. `380px`, `100%`, `auto`)     |
| `defaultVisible`      | xsd:boolean   | Yes      | Whether zone is visible on initial load          |
| `visibilityCondition` | xsd:string    | No       | State expression (e.g. `state.isPFIMode === true`)|
| `zIndex`              | xsd:integer   | No       | CSS z-index stacking order                       |
| `cascadeTier`         | ds:CascadeTier| Yes      | PFC (immutable) or PFI/Product/App               |
| `description`         | xsd:string    | No       | Zone purpose and content summary                 |

#### ds:NavLayer

A navigation capability layer grouping related UI actions, rendered into a host zone (typically Z2 Toolbar).

| Property      | Type          | Required | Description                                      |
|---------------|---------------|----------|--------------------------------------------------|
| `layerId`     | xsd:string    | Yes      | Layer code (e.g. `L1`, `L3-context`, `L4`)       |
| `layerName`   | xsd:string    | Yes      | Human-readable label                             |
| `layerLevel`  | xsd:integer   | Yes      | Numeric level 1–4 (controls grouping)            |
| `renderOrder` | xsd:integer   | Yes      | Order within host zone (lower = first)           |
| `cascadeTier` | ds:CascadeTier| Yes      | Which cascade tier owns this layer               |
| `description` | xsd:string    | No       | Layer purpose and grouping rationale             |

#### ds:NavItem

A single navigation action within a NavLayer, rendered as a control in the toolbar.

| Property              | Type            | Required | Description                                      |
|-----------------------|-----------------|----------|--------------------------------------------------|
| `itemId`              | xsd:string      | Yes      | Unique ID (e.g. `nav-audit`, `nav-physics`)      |
| `label`               | xsd:string      | Yes      | Button/control label text                        |
| `itemType`            | ds:NavItemType  | Yes      | Button, Toggle, Dropdown, Select, Separator, Chip|
| `action`              | xsd:string      | Yes      | JS function name (e.g. `toggleAudit`)            |
| `icon`                | xsd:string      | No       | Unicode emoji or icon class                      |
| `shortcut`            | xsd:string      | No       | Keyboard shortcut (e.g. `P`, `Ctrl+L`)           |
| `visibilityCondition` | xsd:string      | No       | State expression for conditional display         |
| `renderOrder`         | xsd:integer     | Yes      | Order within parent NavLayer (lower = first)     |
| `cascadeTier`         | ds:CascadeTier  | Yes      | Which cascade tier owns this item                |

**Relationship:** `ds:belongsToLayer` — inverse of `ds:hasNavItem`. NavItem declares its parent NavLayer for flat-graph JSONLD. E.g. `"ds:belongsToLayer": { "@id": "ds:navlayer-L1" }`. Cardinality: 1..1.

#### ds:ZoneComponent

A placement binding a DesignComponent to an AppZone with optional token overrides.

| Property              | Type          | Required | Description                                      |
|-----------------------|---------------|----------|--------------------------------------------------|
| `placementId`         | xsd:string    | Yes      | Unique ID (e.g. `cmp-glb-header`)               |
| `renderOrder`         | xsd:integer   | Yes      | Order within zone (lower = first)                |
| `slotName`            | xsd:string    | No       | Named slot (e.g. `primary`, `footer`)            |
| `tokenOverrides`      | xsd:string    | No       | JSON string of token overrides                   |
| `visibilityCondition` | xsd:string    | No       | State expression for conditional rendering       |
| `cascadeTier`         | ds:CascadeTier| Yes      | Which cascade tier owns this placement           |

### Enum Reference

| Enum            | Values                                              |
|-----------------|-----------------------------------------------------|
| **AppType**     | SPA, MPA, Hybrid                                    |
| **ZoneType**    | Fixed, Floating, Sliding, Overlay, Conditional      |
| **CascadeTier** | PFC, PFI, Product, App                              |
| **NavItemType** | Button, Toggle, Dropdown, Select, Separator, Chip   |

**GATE-1:** Valid JSON; all required properties present; enum values valid; `@id` unique within file.

---

## Phase 2 — Validate Business Rules

**What:** Check skeleton against DS-ONT business rules BR-DS-013 through BR-DS-015.

### BR-DS-013: CascadeTierImmutability (severity: error)

Higher cascade tiers **MUST NOT** modify structural properties of PFC-tier entities. Structural properties: `zoneType`, `position`, `layerLevel`, `action`.

A PFI override can **add** new zones/items or **hide** existing ones (via `visibilityCondition`), but cannot change a PFC zone's type from Fixed to Floating.

### BR-DS-014: ZonesMustHaveType (severity: error)

Every AppZone **MUST** have `zoneType` and `defaultVisible` set.

### BR-DS-015: NavItemMustHaveAction (severity: error)

Every NavItem with `itemType` other than `Separator` **MUST** have a non-empty `action` string referencing a valid function name.

### Validation Checklist

- [ ] All AppZones have `zoneId`, `zoneName`, `zoneType`, `defaultVisible`, `cascadeTier`
- [ ] All NavItems have `itemId`, `label`, `itemType`, `action` (unless Separator), `renderOrder`, `cascadeTier`
- [ ] All ZoneComponents reference valid zone `@id` in `placedInZone`
- [ ] PFI overrides do not modify PFC structural properties
- [ ] No duplicate `@id` values across base + override

**GATE-2:** Zero blocking errors from BR-DS-013/014/015.

---

## Phase 3 — Test with Runtime Loader

**What:** Verify the loader parses the skeleton correctly.

### Runtime Loading

The `app-skeleton-loader.js` module provides:

| Function                  | Purpose                                           |
|---------------------------|---------------------------------------------------|
| `parseAppSkeleton(jsonld)` | Extract typed entities from JSONLD `@graph`       |
| `mergeSkeletonCascade(base, override)` | Merge PFI override into PFC base (with BR-DS-013 enforcement) |
| `buildSkeletonRegistries(skeleton)` | Populate `state.zoneRegistry` and `state.navLayerRegistry` |
| `getVisibleZones(view, ctx)` | Evaluate visibility conditions for current state  |

### Test Steps

1. Run existing loader tests:
   ```bash
   npx vitest run tests/app-skeleton-loader.test.js
   ```

2. Verify admin token panel reflects skeleton data:
   ```bash
   npx vitest run tests/design-token-tree.test.js
   ```

3. Manual browser test:
   - Open visualiser before skeleton loads → admin panel shows fallback (21 zones)
   - After skeleton loads → admin panel shows zones from `state.zoneRegistry` with cascade tier badges
   - PFI toggle → Z3 (Context Identity Bar) and Z16 (Context Drawer) become visible

**GATE-3:** All tests pass; loader parses without errors; `state.zoneRegistry` populated with correct zone count.

---

## Phase 4 — Commit & Verify

**What:** Stage, commit, push, verify deployment.

### Steps

1. Run full test suite:
   ```bash
   npx vitest run
   ```
2. Stage skeleton file:
   ```bash
   git add instance-data/{name}-app-skeleton-*.jsonld
   ```
3. Commit:
   ```
   feat(ds): add {NAME} app skeleton via PE-DS-EXTRACT-002
   ```
4. Pull and rebase: `git pull --rebase` (stash if needed)
5. Push: `git push`
6. Verify: `gh run list --limit 1`

**Error recovery:**

| Error                        | Fix                                                                          |
|------------------------------|------------------------------------------------------------------------------|
| Push rejected (fetch first)  | `git stash && git pull --rebase && git stash pop && git push`                |
| Rebase conflict              | Resolve conflicts, `git add`, `git rebase --continue`, push                  |
| Tests fail                   | Investigate and fix before committing — do not skip                          |

**GATE-4:** Push exit code 0; workflow status = completed/success; JSONLD accessible on GitHub Pages.

---

## EMC Cascade Rules

The 4-tier cascade governs how skeletons are inherited and extended:

```
PFC (immutable base)
 └─ PFI (instance extensions)
     └─ Product (product customisation)
         └─ App (final overrides)
```

### What Each Tier Can Do

| Action                        | PFC | PFI | Product | App |
|-------------------------------|-----|-----|---------|-----|
| Define base zones             | Yes | --  | --      | --  |
| Add new zones                 | Yes | Yes | Yes     | Yes |
| Hide PFC zones (condition)    | --  | Yes | Yes     | Yes |
| Modify PFC structural props   | --  | No  | No      | No  |
| Add nav items to L4           | --  | Yes | Yes     | Yes |
| Add nav items to L1-L3        | --  | Yes | Yes     | Yes |
| Override PFC nav item action  | --  | No  | No      | No  |
| Add zone components           | --  | Yes | Yes     | Yes |

### Override-by-@id Semantics

When merging, entities are matched by `@id`. If a PFI override contains an entity with the same `@id` as the PFC base:
- Non-structural properties can be overridden (e.g. `label`, `icon`, `shortcut`)
- Structural properties are protected by BR-DS-013
- A console warning is logged if an immutability violation is detected

### Add/Hide Semantics

- **Add:** PFI skeleton includes new entities not present in PFC base — they are appended
- **Hide:** Set `visibilityCondition` on the override entity to control when it appears (e.g. `state.isPFIMode === true`)

---

## Current Skeleton Inventory

### PFC Base Skeleton (v1.0.0)

**File:** `instance-data/pfc-app-skeleton-v1.0.0.jsonld`
**Total entities:** 69

| Entity Type     | Count | Cascade Split     |
|-----------------|-------|--------------------|
| Application     | 1     | 1 PFC              |
| AppZone         | 20    | 18 PFC + 2 PFI     |
| NavLayer        | 5     | 4 PFC + 1 PFI      |
| NavItem         | 23    | 23 PFC              |
| ZoneComponent   | 20    | 17 PFC + 3 PFI     |

### Zone Inventory (20 zones)

| Zone ID | Zone Name              | Zone Type    | Cascade | Visible | Components |
|---------|------------------------|--------------|---------|---------|------------|
| Z1      | Header                 | Fixed        | PFC     | Yes     | 1          |
| Z2      | Toolbar                | Fixed        | PFC     | Yes     | 1          |
| Z3      | Context Identity Bar   | Conditional  | PFI     | No      | 1          |
| Z4      | Authoring Toolbar      | Conditional  | PFC     | No      | 1          |
| Z4b     | Selection Toolbar      | Conditional  | PFC     | No      | 0          |
| Z5      | Breadcrumb Bar         | Conditional  | PFC     | No      | 1          |
| Z6      | Graph Canvas           | Fixed        | PFC     | Yes     | 1          |
| Z7      | Legend                 | Floating     | PFC     | No      | 1          |
| Z8      | Layer Panel            | Floating     | PFC     | No      | 1          |
| Z9      | Sidebar Details        | Sliding      | PFC     | No      | 1          |
| Z10     | Audit Panel            | Sliding      | PFC     | No      | 1          |
| Z11     | Library Panel          | Sliding      | PFC     | No      | 1          |
| Z12     | DS Panel               | Sliding      | PFC     | No      | 2          |
| Z13     | Backlog Panel          | Sliding      | PFC     | No      | 1          |
| Z14     | Mermaid Editor         | Sliding      | PFC     | No      | 1          |
| Z15     | Mindmap Properties     | Sliding      | PFC     | No      | 1          |
| Z16     | Context Drawer         | Sliding      | PFI     | No      | 1          |
| Z17     | Category Panel         | Sliding      | PFC     | No      | 1          |
| Z18     | Modal/Dialog           | Overlay      | PFC     | No      | 1          |
| Z19     | Tooltip/Hover          | Overlay      | PFC     | No      | 1          |
| Z20     | Drop Zone              | Conditional  | PFC     | No      | 1          |

### Nav Layer Inventory (5 layers)

| Layer ID    | Layer Name          | Level | Items | Cascade |
|-------------|---------------------|-------|-------|---------|
| L1          | Main Capabilities   | 1     | 6     | PFC     |
| L2          | View Controls       | 2     | 4     | PFC     |
| L3-context  | Context/Mode        | 3     | 7     | PFC     |
| L3-admin    | Admin/Config        | 3     | 6     | PFC     |
| L4          | PFI Custom          | 4     | 0     | PFI     |

---

## Related Guides

| Guide                              | Scope                                                                       |
|------------------------------------|-----------------------------------------------------------------------------|
| **PE-DS-EXTRACT-001**              | Token extraction from Figma → DS-ONT instance data                          |
| **PE-DS-EXTRACT-002** (this file)  | App skeleton authoring — JSONLD structure for zones, nav layers, components |

---

## Troubleshooting

### Loader doesn't pick up new skeleton file
1. Check file path matches `state.skeletonSource` in config
2. Verify `@context` has `"ds": "https://platformcore.io/ontology/ds/"` prefix
3. Check browser console for `[Skeleton]` log messages

### PFI override has no effect
1. Verify `@id` matches the base entity you want to override
2. Check `cascadeTier` is set to `PFI` (not `PFC`) on the override entity
3. If modifying a structural property, BR-DS-013 will block it — check console for "Cascade immutability" warning

### Admin panel shows fallback instead of skeleton data
1. Skeleton must load before admin panel renders — check load order
2. Verify `state.zoneRegistry` is populated: it should have entries after `buildSkeletonRegistries()` runs
3. If `zoneRegistry` is empty, `buildZoneTree()` returns the 21-zone fallback
