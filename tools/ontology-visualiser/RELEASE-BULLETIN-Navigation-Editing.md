# Release Bulletin: Navigation Editing Fix + Architecture Docs

**Date:** 2026-02-25
**Visualiser Version:** 5.7.0
**Scope:** F40.24 — Skeleton editor cascade-tier guard bypass, layer-to-zone UI, architecture documentation

---

## What's New

### Navigation Editing Now Works for PFC Admin

The skeleton editor (F40.19) had a critical bug: **cascade-tier guards silently blocked ALL editing of PFC-tier nav items**. Since every item in the master PFC skeleton is PFC-tier, the Z22 panel showed lock icons on all items with no edit controls visible. Reorder and move operations returned silently without doing anything.

**Root cause:** Guards in `reorderNavItem()`, `moveNavItemToLayer()`, `reorderZoneComponent()`, and `moveZoneComponentToZone()` checked:

```javascript
if ((item['ds:cascadeTier'] || 'PFC').toUpperCase() === 'PFC') return;
```

This is correct for PFI instances (they must not modify PFC base items per BR-DS-013). But when the PFC admin enters skeleton edit mode, these guards need to be bypassed.

**Fix:** All 6 guards now check `state.skeletonEditMode`:

```javascript
if (!state.skeletonEditMode && (item['ds:cascadeTier'] || 'PFC').toUpperCase() === 'PFC') return;
```

```text
PFC Admin enters skeleton edit mode
        │
        ▼
  skeletonEditMode = true
        │
        ├── PFC items: guards BYPASSED → editing works ✓
        └── _apply() pipeline: registries → render → persist → panel → graph

PFI instance edits merged skeleton
        │
        ▼
  skeletonEditMode = false
        │
        ├── PFC items: guards ACTIVE → items locked ✓ (BR-DS-013)
        └── PFI items: guards pass → editing works ✓
```

---

### Layer-to-Zone UI in Z22 Panel

The `moveLayerToZone()` function existed and worked but had **no UI exposure**. Now:

- **Nav Layers tab** shows a **Zone dropdown** on each layer card (in edit mode)
- Dropdown lists toolbar zones: Z2 (Primary Toolbar), Z4 (Authoring Toolbar), Z4b (Selection Toolbar)
- Changing the dropdown immediately moves the entire layer to the target zone
- The live toolbar updates via `_apply()` pipeline

### "Move to Zone..." in Skeleton Graph

- **Right-click a layer node** in the skeleton graph view
- Select **"Move to Zone..."** from the context menu
- Prompt asks for target zone (Z2, Z4, Z4b)
- Graph refreshes to show the new hierarchy

### PFC Items Show Edit Controls

Previously, PFC items in the Z22 panel displayed only a lock icon. Now in edit mode:

- Lock icon remains as a **tier indicator** (visual badge, not a block)
- **Up/down arrows** for reordering within layer
- **Layer dropdown** for moving between layers
- **Drag handle** for drag-and-drop reordering
- All standard edit controls that PFI items had

---

## Architecture Documentation

Two new reference documents have been created for the wider team:

### ARCH-NAVIGATION.md — Technical Architecture

Complete technical reference covering:
- Data flow from JSONLD skeleton through registries to live toolbar
- Zone architecture (22 zones with DOM selectors)
- Layer hierarchy (7 layers across 3 toolbar bars)
- Full nav item catalogue (56 items, 65 actions)
- Action resolution pipeline
- Visibility engine and state sync
- Cascade tier system and business rules
- Editor mutation functions and `_apply()` pipeline
- File inventory and test coverage map

### OPERATING-GUIDE-Navigation.md — Team Process Guide

Day-to-day navigation management guide covering:
- Quick reference table for common tasks
- Toolbar layout diagram (3 bars, 7 layers)
- Step-by-step Z22 panel editing walkthrough
- Skeleton graph editing with context menus
- Adding new nav items and actions (with code examples)
- Direct JSONLD editing patterns
- Visibility conditions reference
- PFI instance customisation rules
- Testing checklist (automated + manual)
- Troubleshooting guide (5 common issues)
- Process workflows for minor/structural/PFI changes

---

## Cross-References

| Document | Path | Purpose |
|----------|------|---------|
| **ARCH-NAVIGATION.md** | `PBS/TOOLS/ontology-visualiser/ARCH-NAVIGATION.md` | Technical architecture |
| **OPERATING-GUIDE-Navigation.md** | `PBS/TOOLS/ontology-visualiser/OPERATING-GUIDE-Navigation.md` | Team process guide |
| **PLAN-nav-layer-hybrid.md** | `PBS/TOOLS/ontology-visualiser/PLAN-nav-layer-hybrid.md` | Dynamic nav replacement plan (Phase 1-4) |
| **ARCH-DECISION-TREE.md** | `PBS/TOOLS/ontology-visualiser/ARCH-DECISION-TREE.md` | Decision tree architecture |
| **RELEASE-BULLETIN-Zone-Overlay.md** | `PBS/TOOLS/ontology-visualiser/RELEASE-BULLETIN-Zone-Overlay.md` | Zone overlay feature (v5.5.0) |

---

## How to Use

### Reorganise the toolbar:

1. Open visualiser → click **Skeleton** button → Z22 panel opens
2. Click **Edit** to enter skeleton edit mode
3. **Nav Layers tab**: use up/down arrows, layer dropdown, or zone dropdown
4. Live toolbar updates immediately after each change
5. Click **Save** to persist to JSONLD file, or **Discard** to revert

### Move a layer to a different toolbar bar:

1. In edit mode, find the layer card in Nav Layers tab
2. Use the **Zone dropdown** (Z2/Z4/Z4b)
3. The entire layer moves to the target toolbar bar

### Via skeleton graph:

1. Switch to Skeleton view (5th view tab)
2. Right-click a **layer** node → "Move to Zone..."
3. Enter target zone ID when prompted

See **OPERATING-GUIDE-Navigation.md** for full workflows.

---

## Files Changed

### New Files

| File | Purpose |
|------|---------|
| `ARCH-NAVIGATION.md` | Technical architecture reference (~450 lines) |
| `OPERATING-GUIDE-Navigation.md` | Team operating guide (~400 lines) |
| `RELEASE-BULLETIN-Navigation-Editing.md` | This release bulletin |

### Modified Files

| File | Change |
|------|--------|
| `js/app-skeleton-editor.js` | 6 cascade-tier guards: added `!state.skeletonEditMode &&` prefix |
| `js/app-skeleton-panel.js` | Edit controls for PFC items, `_layerZoneSelect()` helper, zone field on layer cards |
| `js/skeleton-graph.js` | "Move to Zone..." context menu for layer nodes |
| `js/app.js` | `moveLayerToZone` callback for skeleton graph |
| `tests/app-skeleton-editor.test.js` | Fixed guard tests (use `skeletonEditMode: false`), added 4 positive-path tests |

---

## Test Results

| Metric | Before | After |
|--------|--------|-------|
| Test files | 44 | 49 |
| Tests passing | 1751 | 1825 |
| Test failures | 0 | 0 |

**New tests added:**
- `reorderNavItem succeeds for PFC item in skeleton edit mode`
- `reorderNavItem swap-target PFC check bypassed in skeleton edit mode`
- `moveNavItemToLayer succeeds for PFC item in skeleton edit mode`
- `moveNavItemToLayer target-layer PFC check bypassed in skeleton edit mode`
- `reorderNavItem refuses to reorder PFC-tier items (outside edit mode)`
- `reorderNavItem refuses swap when partner is PFC (outside edit mode)`
- `moveNavItemToLayer refuses to move PFC-tier items (outside edit mode)`
- `reorderZoneComponent refuses to reorder PFC-tier components (outside edit mode)`
- `reorderZoneComponent refuses swap when partner is PFC (outside edit mode)`
- `moveZoneComponentToZone refuses to move PFC-tier components (outside edit mode)`
- `PFI-tier items are editable` (4 positive-path tests for nav + zone)

**Existing tests updated:**
- 12 positive-path tests updated to use `buildMixedTierSkeleton()` fixture targeting PFI-tier items
- 6 "PFC cascade-tier guards" tests updated to use `skeletonEditMode: false` (they were incorrectly testing the guard-active path with edit mode enabled)

---

## Breaking Changes

**None.** PFI instances editing merged skeletons are unaffected — guards still block PFC item modification when `skeletonEditMode` is `false`. The fix only unlocks editing when the PFC admin explicitly enters skeleton edit mode.

---

## Business Rules Preserved

| Rule | Status |
|------|--------|
| **BR-DS-013** (PFI cannot modify PFC items) | Preserved — guards active when `skeletonEditMode: false` |
| **BR-DS-014** (renderOrder determines position) | Preserved — reorder updates renderOrder correctly |
| **BR-DS-015** (layers belong to exactly one zone) | Preserved — moveLayerToZone updates zone reference |

---

*OAA Ontology Visualiser v5.7.0 — Release Bulletin*
