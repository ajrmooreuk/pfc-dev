# Navigation Operating Guide

**For:** PFC platform team, PFI instance developers, Claude agents
**Version:** 1.0.0 | **Date:** 2026-02-25

This guide covers day-to-day navigation management: how to reorganise the toolbar, add/remove items, move layers between zones, and persist changes. For technical architecture details see `ARCH-NAVIGATION.md`.

---

## Quick Reference

| Task | Method | Where |
|------|--------|-------|
| Reorder a nav item | Z22 Panel > Nav Layers > Edit > up/down arrows | In-app |
| Move item to different layer | Z22 Panel > Nav Layers > Edit > layer dropdown | In-app |
| Move layer to different zone | Z22 Panel > Nav Layers > Edit > zone dropdown | In-app |
| Add a new nav item | Skeleton Graph > right-click layer > Add Button/Toggle/etc | In-app |
| Delete a nav item | Skeleton Graph > right-click item > Delete | In-app |
| Save changes to file | Z22 Panel > Edit > Save (green button) | In-app |
| Undo a change | Z22 Panel > Edit > Undo (or Ctrl+Z in edit mode) | In-app |
| Discard all changes | Z22 Panel > Edit > Discard (red X) | In-app |

---

## 1. Understanding the Toolbar Layout

The toolbar is split into **3 bars** stacked vertically:

```
 ┌──────────────────────────────────────────────────────────┐
 │ Z2  Primary Toolbar  (always visible)                     │
 │ L1: Ontology | Audit | Library | Categories | Layers |    │
 │     Export | Glossary | File ops | + New | Fork | Save    │
 │ L2: Physics | Fit | Reset | Details | Layout              │
 │ L3c: [Graph] [DS] [Mermaid] [Mindmap] [Skeleton] [DT]    │
 │ L3a: DS Tokens | Token Map | PFC/PFI | Instance | ...     │
 ├──────────────────────────────────────────────────────────┤
 │ Z4  Authoring Bar  (visible in authoring mode only)       │
 │ L5: + Entity | + Rel | Undo | Redo | Save | AI | Exit     │
 ├──────────────────────────────────────────────────────────┤
 │ Z4b Selection Bar  (visible when nodes selected)          │
 │ L6: Select All | Clear | Export | Save Selection           │
 └──────────────────────────────────────────────────────────┘
```

**Layers** are visual groups separated by thin borders within a bar. Each layer belongs to exactly one zone. Items within a layer are ordered by `renderOrder`.

---

## 2. Editing Navigation (Z22 Panel Method)

This is the recommended approach for most reorganisation tasks.

### Step 1: Open the Skeleton Inspector

Click the **Skeleton** button in L3-admin (or press the Skeleton chip in L3-context to switch to the Skeleton graph view, then click Skeleton in the admin bar to open the panel).

### Step 2: Enter Edit Mode

Click the **Edit** button at the top of the Z22 panel. This:
- Captures a baseline snapshot (for discard)
- Enables the undo/redo stack
- Shows edit controls on all items (arrows, dropdowns, drag handles)
- Auto-persists every change to localStorage

### Step 3: Make Changes

**Reorder items within a layer:**
1. Go to the **Nav Layers** tab
2. Find the item you want to move
3. Click the up arrow (&#x25B2;) or down arrow (&#x25BC;)
4. The live toolbar updates immediately

**Move an item to a different layer:**
1. Find the item in the Nav Layers tab
2. Use the **layer dropdown** next to the arrows
3. Select the target layer (e.g. L2 -> L3-context)
4. The item moves to the end of the target layer

**Move a layer to a different zone:**
1. In the Nav Layers tab, find the layer card header
2. Use the **Zone dropdown** (shows Z2/Z4/Z4b)
3. Select the target zone
4. The entire layer moves to that toolbar bar

**Reorder zone components (Functions tab):**
1. Switch to the **Functions** tab
2. Use up/down arrows to reorder components within a zone
3. Use the zone dropdown to move a component to a different zone

### Step 4: Save or Discard

| Button | Action |
|--------|--------|
| **Save** (green) | Write to `pfc-app-skeleton-v{version}.jsonld` via File System Access API, or download |
| **Download** (arrow) | Always triggers browser download |
| **Discard** (red X) | Restores baseline snapshot, reverts all changes |
| **Undo** (&#x21A9;) | Undo last mutation |
| **Redo** (&#x21AA;) | Redo last undone mutation |

Changes auto-persist to `localStorage` after every mutation. If you close the browser without saving, the app will restore your edits on next load and prompt you to save or discard.

### Step 5: Exit Edit Mode

Click **Done**. The edit controls disappear but the toolbar retains your changes.

---

## 3. Editing Navigation (Skeleton Graph Method)

For visual editing or when you need to see the full hierarchy.

### Step 1: Switch to Skeleton View

Click the **Skeleton** chip in L3-context (or press `5`).

### Step 2: Navigate the Graph

The graph shows:

```
Application (navy)
  └── Zones (teal)
        └── Layers (amber)
              └── Nav Items (green/purple/orange by type)
                    └── Dropdown Children (light green)
                          └── Actions (red ellipses, optional)
```

- **Click** a node to select it and view properties in Z22
- **Right-click** a node for the context menu
- **Toggle "Actions"** in the floating toolbar to show/hide action nodes
- **Toggle "UD/LR"** to switch between top-down and left-right layout

### Step 3: Use Context Menus

| Right-click on... | Available actions |
|-------------------|-------------------|
| **Layer** | Add Button, Add Toggle, Add Chip, Add Dropdown, Add Separator, Move to Zone... |
| **NavItem** | Edit Properties, [Add Child Item, Add Child Separator], Move to Layer..., Delete |
| **Zone** | Add Layer |
| **DropdownChild** | Edit Properties, Delete |
| **Action** | Edit Properties, Delete |

"Move to Zone..." and "Move to Layer..." prompt for the target ID (e.g. `Z4`, `L2`).

---

## 4. Adding a New Nav Item

### Via Skeleton Graph:
1. Right-click the target **layer** node
2. Select the item type (Button, Toggle, Chip, Dropdown, Separator)
3. Enter a label when prompted
4. The item appears at the end of the layer

### Via Code (for agents/automation):
```javascript
// Requires skeleton edit mode
enterSkeletonEditMode();
const newId = addNavItem('L1', 'Button', 'My New Button');
updateNavItemProperty(newId, 'ds:action', 'myNewAction');
// For ontology-driven wiring, also create an Action entity:
const actionId = addActionEntity({
  'ds:actionName': 'myNewAction',
  'ds:functionRef': 'myNewAction',     // must exist on window
  'ds:parameterType': 'None',
  'ds:triggersSyncAfter': false,
});
updateNavItemProperty(newId, 'ds:executesAction', { '@id': `ds:${actionId}` });
```

---

## 5. Adding a New Action

Every non-separator nav item needs an Action entity that maps to a `window` function.

### Required fields:
- `ds:functionRef` — the JS function name (e.g. `toggleMyPanel`)
- `ds:parameterType` — `None`, `String`, or `Select`

### Optional fields:
- `ds:guardCondition` — JS expression that must be true to execute
- `ds:guardMessage` — shown to user when guard blocks
- `ds:triggersSyncAfter` — set `true` if the action changes toolbar state
- `ds:accessibilityHint` — `aria-label` for screen readers

### Wiring checklist:
1. Implement the function in `app.js` (or relevant module)
2. Export it to `window`: `window.myNewAction = myNewAction;`
3. Create the Action entity in the skeleton (via editor or JSONLD)
4. Set `ds:executesAction` on the NavItem to reference it
5. If the action toggles state, set `ds:triggersSyncAfter: true`

---

## 6. Editing the JSONLD Directly

For bulk changes, version bumps, or CI/CD automation, edit the source file directly:

**File:** `PBS/ONTOLOGIES/ontology-library/PE-Series/DS-ONT/instance-data/pfc-app-skeleton-v1.0.0.jsonld`

### Key patterns:

**Reorder items:** Change `ds:renderOrder` values. Items within a layer are sorted by this number.

**Move item to different layer:** Change `ds:belongsToLayer` reference:
```json
"ds:belongsToLayer": { "@id": "ds:navlayer-L2" }
```

**Move layer to different zone:** Change `ds:navLayerInZone` reference:
```json
"ds:navLayerInZone": { "@id": "ds:zone-Z4" }
```

**Add a new item:** Append to the navItems array in `@graph`. Required fields:
```json
{
  "@id": "ds:nav-L1-my-item",
  "@type": "ds:NavItem",
  "ds:itemId": "nav-my-item",
  "ds:label": "My Item",
  "ds:itemType": "Button",
  "ds:action": "myAction",
  "ds:renderOrder": 15,
  "ds:cascadeTier": "PFC",
  "ds:belongsToLayer": { "@id": "ds:navlayer-L1" },
  "ds:executesAction": { "@id": "ds:action-myAction" }
}
```

After editing the JSONLD, the changes take effect on next app load (or after `loadAppSkeletonFresh()`).

---

## 7. Visibility Conditions

Items can be conditionally shown/hidden using `ds:visibilityCondition`:

```json
"ds:visibilityCondition": "state.currentView === 'graph'"
```

### Available state fields for conditions:

| Field | Type | Example |
|-------|------|---------|
| `state.currentView` | string | `'graph'`, `'mermaid'`, `'mindmap'`, `'skeleton'` |
| `state.isPFIMode` | boolean | `state.isPFIMode === true` |
| `state.authoringMode` | boolean | `state.authoringMode === true` |
| `state.selectionMode` | boolean | `state.selectionMode === true` |
| `state.selectedNodes.length` | number | `state.selectedNodes.length > 0` |
| `state.breadcrumbPath.length` | number | `state.breadcrumbPath.length > 0` |
| `state.ontologyCount` | number | `state.ontologyCount > 0` |
| `state.currentData` | object/null | `state.currentData != null` |

Conditions evaluate fail-open: if parsing fails, the item is shown.

---

## 8. PFI Instance Customisation

PFI instances extend the PFC skeleton via the cascade merge system.

### What PFI instances CAN do:
- Add items to **L4** (PFI Custom layer)
- Add new layers (L5+) with their own items
- Override `ds:cascadeTier: "PFI"` items' properties
- Add new zones and zone components

### What PFI instances CANNOT do:
- Modify PFC-tier items (BR-DS-013)
- Change PFC item renderOrder, layer assignment, or properties
- Delete PFC items

### Creating a PFI skeleton override:

1. Create `pfi-{instance}-skeleton-override.jsonld` in the PFI instance data directory
2. Include only the items/layers/zones being added or overridden
3. Reference it in the PFI instance configuration
4. The merge applies: PFI items with matching `@id` replace PFI-tier base items; new items are appended

---

## 9. Testing Changes

### Automated tests:
```bash
cd PBS/TOOLS/ontology-visualiser
npx vitest run
```

All 1801 tests must pass. Key test files:
- `tests/app-skeleton-editor.test.js` — 84 tests (mutations, guards, undo/redo)
- `tests/app-skeleton-loader.test.js` — 76 tests (parsing, rendering, wiring)
- `tests/app-skeleton-panel.test.js` — 29 tests (Z22 panel UI)
- `tests/skeleton-graph.test.js` — 37 tests (graph view)

### Manual verification checklist:

After any navigation change:
- [ ] Toolbar renders correctly (items in right order, right layers, right zones)
- [ ] Visibility conditions work (switch views, toggle PFI mode, enter authoring)
- [ ] Chips highlight correctly for active view
- [ ] Toggles reflect state (Physics, PFC/PFI, Selection)
- [ ] Dropdowns open and close (Ontology, Export)
- [ ] Keyboard shortcuts work (P, F, R, D, B, 1-6)
- [ ] Z4 appears/disappears with authoring mode
- [ ] Z4b appears/disappears with node selection
- [ ] Undo/redo works in edit mode
- [ ] Save/export produces valid JSONLD

---

## 10. Troubleshooting

### "Nothing happens when I click up/down arrows"

**Cause:** Not in skeleton edit mode.
**Fix:** Click the **Edit** button in the Z22 panel first. The cascade-tier guards only bypass in edit mode.

### "Changes are lost after refresh"

**Cause:** Changes weren't saved to file, and localStorage was cleared.
**Fix:** Always use Save or Download before closing. If you see a "Pending edits" prompt on load, click "Restore" to recover cached changes.

### "Item doesn't appear in the toolbar"

**Possible causes:**
1. `ds:visibilityCondition` is hiding it (check the condition in Properties tab)
2. Item is in a layer assigned to Z4/Z4b which is conditionally hidden
3. `ds:renderOrder` conflict (two items with same order may overlap)
4. Missing `ds:executesAction` — items without action wiring may fail to render

### "Action doesn't fire when clicked"

**Possible causes:**
1. `ds:functionRef` doesn't match a `window` function name
2. `ds:guardCondition` is evaluating to `false` (check console for guard message)
3. The function isn't exported to `window` scope

### "Skeleton Graph shows stale data"

**Fix:** The graph auto-refreshes after mutations via `_apply()`. If it's stale, switch away from Skeleton view and back, or click Fit in the floating toolbar.

---

## 11. Process for Navigation Changes

### For minor reordering (same session):
1. Open Z22 Panel > Edit mode
2. Make changes (reorder, move between layers)
3. Verify toolbar visually
4. Save to library
5. Commit the updated JSONLD file

### For structural reorganisation (new layers, zone changes):
1. Plan the target layout (document which items go where)
2. Open Skeleton Graph view for visual overview
3. Enter edit mode
4. Execute changes step by step, verifying after each
5. Use undo if anything looks wrong
6. Save to library
7. Run tests: `npx vitest run`
8. Commit the updated JSONLD file
9. Update this guide if the layer/zone structure changed

### For PFI instance nav customisation:
1. Create PFI skeleton override JSONLD
2. Add L4 items or new layers
3. Test with PFI instance selected
4. Commit to PFI instance data directory
5. Document in PFI operating guide

---

## 12. Glossary

| Term | Definition |
|------|-----------|
| **Zone** | A spatial region of the UI (e.g. Z2 = toolbar, Z9 = sidebar). Has a DOM selector. |
| **Layer** | A logical group of nav items within a zone (e.g. L1 = Main Capabilities). Layers are visually separated by borders. |
| **NavItem** | A single toolbar control (button, toggle, chip, dropdown, select, separator). |
| **Action** | An entity that maps a NavItem click to a JS function. |
| **Cascade Tier** | PFC (base) > PFI (instance) > Product > App. Higher tiers can extend but not modify lower-tier items. |
| **Skeleton** | The JSONLD file defining all zones, layers, items, actions, and components. |
| **Z22 Panel** | The Skeleton Inspector panel (sliding, left side). |
| **Skeleton Graph** | The vis-network hierarchical view of the skeleton (5th view tab). |
| **Edit Mode** | Activated via Z22 panel's Edit button. Enables mutations, undo/redo, cascade-tier bypass. |
| **renderOrder** | Numeric sort key determining position within a layer or zone. Lower = further left/top. |
| **stateBinding** | Links an item's visual state to an app state field (e.g. chip active when view matches). |
| **visibilityCondition** | JS expression controlling show/hide of an item (e.g. only in graph view). |
