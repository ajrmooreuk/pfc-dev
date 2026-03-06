# Release Bulletin: Zone Boundary Overlay

**Date:** 2026-02-23
**Visualiser Version:** 5.5.0
**Scope:** Token Map — Zone Boundary Overlay (locate zones from admin panel)

---

## What's New

### Zone Boundary Overlay — Highlight Zones from Token Map

The Token Map admin panel now lets you visually locate any of the 21 UI zones (Z1-Z21) by overlaying a red dashed boundary on the corresponding DOM element. Each zone row has a **◎** (bullseye) locate button that toggles the overlay.

```text
Token Map zone tree ──► Click ◎ ──► Red dashed overlay on matching DOM element
                                         │
                        ┌────────────────┼────────────────┐
                        ▼                                 ▼
                Zone visible                       Zone hidden
                Fixed overlay matches              Muted grey centred
                getBoundingClientRect              indicator + "Hidden" note
                        │                                 │
                        └────────────────┬────────────────┘
                                         │
                        Click ◎ again ──► Overlay dismissed
                        Press Escape ──► All overlays cleared
```

---

### Feature Summary

| Feature | Description |
|---------|-------------|
| **Locate button** | ◎ bullseye button on each depth-0 zone row in the Token Map tree |
| **Visible zone overlay** | Red dashed border (`2px dashed var(--viz-error)`), semi-transparent pink tint, zone label tag (top-left), dismiss button (top-right) |
| **Hidden zone indicator** | Muted grey centred variant for zones that are `display:none` or have no `offsetParent` |
| **Toggle** | Click locate button again to dismiss, or use dismiss (X) button on the overlay |
| **Escape to clear** | Press Escape to clear all active overlays at once |
| **Multi-zone support** | Multiple zones can be highlighted simultaneously |
| **Scroll/resize reposition** | Overlays automatically reposition on window scroll and resize |
| **Active state highlight** | Tree row gets accent border when its overlay is active (`.zone-overlay-active`) |

---

## How to Use

### 1. Open Token Map

Click the **Token Map** button in the toolbar to open the admin panel. The zone tree shows all 21 zones (Z1-Z21) as expandable rows.

### 2. Locate a Zone

Click the **◎** button on any zone row. For visible zones (e.g., Z1 Header, Z6 Graph Canvas), a red dashed outline appears around the element. For hidden zones (e.g., Z4 Authoring Toolbar when collapsed), a muted grey indicator appears centred on screen.

### 3. Dismiss

- Click the same **◎** button again to dismiss a single overlay
- Click the **X** button on the overlay itself
- Press **Escape** to clear all overlays at once

---

## Zone Map (21 Zones)

| Zone | Element | CSS Selector |
|------|---------|-------------|
| Z1 | Header | `header` |
| Z2 | Toolbar | `.toolbar` |
| Z3 | EMC Nav Bar | `#emc-nav-bar` |
| Z4 | Authoring Toolbar | `#authoring-toolbar` |
| Z4b | Selection Toolbar | `#selection-toolbar` |
| Z5 | Breadcrumb | `#breadcrumb` |
| Z6 | Graph Canvas | `#network` |
| Z7 | Legend | `#legend` |
| Z8 | Layer Panel | `#layer-panel` |
| Z9 | Sidebar Details | `#sidebar` |
| Z10 | Audit Panel | `#audit-panel` |
| Z11 | Library Panel | `#library-panel` |
| Z12 | DS Panel | `#ds-panel` |
| Z13 | Backlog Panel | `#backlog-panel` |
| Z14 | Mermaid Editor | `#mermaid-editor-panel` |
| Z15 | Mindmap Properties | `#mindmap-properties-panel` |
| Z16 | Context Identity Bar | `#context-identity-bar` |
| Z17 | Category Panel | `#category-panel` |
| Z18 | Modal Overlay | `.modal-overlay` |
| Z19 | Tooltip | `.vis-tooltip` |
| Z20 | Drop Zone | `#drop-zone` |
| Z21 | PFI Lifecycle Panel | `#pfi-lifecycle-panel` |

---

## How to Test

### Prerequisites

- Open visualiser in browser (`browser-viewer.html`)
- Click Token Map button to open admin panel

### Test Checklist

| # | Test | Steps | Expected Result |
|---|------|-------|-----------------|
| 1 | Locate visible zone | Click ◎ on Z1 (Header) | Red dashed outline appears around the header element |
| 2 | Locate graph canvas | Click ◎ on Z6 (Graph Canvas) | Red dashed outline around `#network` |
| 3 | Locate hidden zone | Click ◎ on Z4 (Authoring Toolbar) | Muted grey centred indicator with "Hidden" note |
| 4 | Zone label shown | Any locate | Zone ID and label text in overlay tag (e.g., "Z1: Z1 — Header") |
| 5 | Toggle off | Click same ◎ again | Overlay dismissed |
| 6 | Multi-zone | Click ◎ on Z1, then Z6 | Both overlays visible simultaneously |
| 7 | Escape clears all | With 2+ overlays active, press Escape | All overlays removed |
| 8 | Dismiss button | Click X on overlay | That single overlay removed |
| 9 | Active state | Click ◎ on Z1 | Tree row gets accent border highlight |
| 10 | Active state clears | Toggle Z1 off | Tree row accent border removed |
| 11 | Scroll reposition | With overlay active, scroll page | Overlay repositions to match element |
| 12 | Resize reposition | With overlay active, resize window | Overlay repositions to match element |

---

## Files Changed

### New Files

| File | Purpose |
|------|---------|
| `tests/zone-overlay.test.js` | 30 unit tests for zone overlay functions (mock DOM pattern) |
| `RELEASE-BULLETIN-Zone-Overlay.md` | This release bulletin |

### Modified Files

| File | Change |
|------|--------|
| `js/state.js` | +`activeZoneOverlays: new Set()` |
| `js/design-token-tree.js` | +`ZONE_DOM_SELECTORS` map (21 entries), +locate button in `renderBranch()`, +click delegation, +7 overlay functions, +Escape/scroll/resize listeners |
| `css/viewer.css` | +~80 lines zone overlay CSS (boundary, label, dismiss, hidden variant, locate button, active row) |
| `ARCHITECTURE.md` | +Zone Boundary Overlay section, +`design-token-tree.js`/`pfi-lifecycle-ui.js` to module list, version bump to 5.5.0 |
| `OPERATING-GUIDE.md` | +Workflow 23, +keyboard shortcut, +toolbar entry, +troubleshooting entries, version bump to 5.5.0 |

---

## Test Results

| Metric | Before | After |
|--------|--------|-------|
| Test files | 43 | 44 |
| Tests passing | 1419 | 1449 |
| Test failures | 0 | 0 |

---

## Breaking Changes

**None.** This is a purely additive feature. All existing Token Map functionality is unchanged. The zone overlay is entirely new UI with no impact on existing workflows.

---

## CSS Classes Added

| Class | Element | Purpose |
|-------|---------|---------|
| `.zone-boundary-overlay` | `<div>` appended to `<body>` | Fixed-position overlay matching zone element bounds |
| `.zone-boundary-overlay--hidden` | Modifier | Muted grey variant for hidden/absent zones |
| `.zone-boundary-label` | `<span>` inside overlay | Zone ID + label tag at top-left |
| `.zone-boundary-dismiss` | `<button>` inside overlay | X dismiss button at top-right |
| `.zone-boundary-hidden-note` | `<span>` inside overlay | "Hidden" note text |
| `.admin-zone-locate-btn` | `<button>` in tree row | ◎ bullseye locate button |
| `.zone-overlay-active` | `.admin-zone-node` modifier | Accent border on tree row when overlay active |

---

*OAA Ontology Visualiser v5.5.0 — Release Bulletin*
