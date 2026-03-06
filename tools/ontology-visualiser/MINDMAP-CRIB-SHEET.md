# Mindmap / Ideation Canvas — Operating Crib Sheet

**Feature:** F9F.8 (Epic 9F)
**Module:** `js/mindmap-canvas.js`
**Version:** 5.1.0

---

## Getting There

Click the **Mindmap** tab in the segmented view switcher at the top-left of the toolbar. The canvas initialises automatically on first visit. Your last workspace is restored from IndexedDB if one exists.

---

## Toolbar Buttons

| Button | Action |
|--------|--------|
| **+ Idea** | Add a purple ellipse idea node at canvas centre |
| **Connect** | Enter edge-drawing mode (cursor → crosshair) |
| **Edge type dropdown** | Choose relationship type before connecting |
| **+ Action** | Add an orange action card with status/owner/due fields |
| **Lanes** | Toggle 4 ideation lane zones (Ideation / Analysis / Design / Execution) |
| **Save** | Save current workspace to IndexedDB |
| **Workspaces** | Open workspace manager modal (create, load, rename, delete) |
| **Export** | Dropdown: Workspace JSON or Mermaid Mindmap (.mmd) |

The workspace name displays at the far right of the toolbar. A red dot appears when unsaved changes exist.

---

## Mouse & Keyboard Controls

| Interaction | What happens |
|-------------|-------------|
| **Double-click empty space** | Add a new Idea node at that position |
| **Double-click a node** | Edit the node label inline (prompt dialog) |
| **Single-click a node** | Select it and open the Properties panel |
| **Single-click empty space** | Deselect and close Properties panel |
| **Right-click empty space** | Context menu: + Idea, + Action Card |
| **Right-click a node** | Context menu: Edit Label, Connect From Here, Delete Node |
| **Drag a node** | Move it (auto-saves after 2 seconds) |
| **Scroll wheel** | Zoom in/out |
| **Click + drag canvas** | Pan |

---

## Node Types

| Type | Shape | Colour | How to create |
|------|-------|--------|---------------|
| **Idea** | Ellipse | Purple `#9C27B0` | Toolbar "+ Idea" / double-click canvas / right-click menu |
| **Action Card** | Box | Orange `#FF9800` | Toolbar "+ Action" / right-click menu |
| **Ontology Ref** | Box | Matches entity type colour | Drag from graph sidebar (future) |
| **Lane / Zone** | Large dashed box | Semi-transparent | Toolbar "Lanes" toggle |

### Action Card Fields

Action cards have structured fields editable in the Properties panel:

- **Status**: pending, in-progress, done, blocked
- **Owner**: free text
- **Due**: date picker
- **Priority**: low, medium, high, critical

---

## Edge Types (Relationships)

Select the type from the dropdown **before** clicking Connect.

| Edge type | Style | Semantic |
|-----------|-------|----------|
| `supports` | Solid | A supports B |
| `implements` | Solid | A implements B |
| `derives-from` | Solid | A derives from B |
| `challenges` | **Dashed** | A challenges B |
| `informs` | Solid | A informs B |
| `depends-on` | Solid | A depends on B |
| `conflicts-with` | **Dashed** | A conflicts with B |
| `extends` | Solid | A extends B |
| `refines` | Solid | A refines B |
| `custom` | Solid | Custom label |

### Drawing an Edge

1. Click **Connect** (or right-click a node and choose "Connect From Here")
2. Click the **source** node (it highlights)
3. Click the **target** node
4. Edge is created and edge mode exits automatically
5. Click empty space to cancel without drawing

---

## Lanes / Zones

Toggle with the **Lanes** button. Four fixed-position lane columns appear:

| Lane | Position | Purpose |
|------|----------|---------|
| Ideation | Far left | Brainstorming, raw ideas |
| Analysis | Centre-left | Research, investigation |
| Design | Centre-right | Architecture, planning |
| Execution | Far right | Implementation, delivery |

Lanes are large dashed-border background boxes. Drag idea nodes into lanes to organise them. Lanes don't connect to other nodes. Toggle off to remove them.

---

## Properties Panel

Click any node to open the Properties panel on the right. Fields:

| Field | All types | Ontology Ref only | Action Card only |
|-------|-----------|-------------------|-----------------|
| **Label** | Editable text | Editable text | Editable text |
| **Type** | Read-only badge | Read-only badge | Read-only badge |
| **Notes** | Free text area | Free text area | Free text area |
| **Ontology Reference** | | Entity ID + description | |
| **Action Fields** | | | Status, Owner, Due, Priority |
| **Delete Node** | Red button | Red button | Red button |

Changes to label and notes auto-save.

---

## Workspace Persistence

Workspaces are stored in **IndexedDB** (`OntologyLibrary` database, `mindmap-workspaces` store). Data persists across browser sessions.

| Operation | How |
|-----------|-----|
| **Save** | Click toolbar "Save" (or auto-saves 2s after any change) |
| **Load** | Click "Workspaces" → select from list |
| **Rename** | Click "Workspaces" → rename button next to workspace |
| **Delete** | Click "Workspaces" → delete button (no undo) |
| **New** | Click "Workspaces" → type name → Create |

The last active workspace ID is stored in `localStorage` and auto-restored when you return to the Mindmap tab.

---

## Export Options

Available from the toolbar **Export** dropdown:

| Format | Output | Use case |
|--------|--------|----------|
| **Workspace JSON** | `.json` file with full node/edge/viewport data | Backup, share, reimport |
| **Mermaid Mindmap** | `.mmd` file in Mermaid mindmap syntax | Paste into docs, render in Mermaid viewer |

The Mermaid export builds a tree from root nodes (nodes with no incoming edges) and walks the adjacency list depth-first.

---

## State Properties

All mindmap state lives in `state.js` under the `state` object:

| Property | Type | Purpose |
|----------|------|---------|
| `mindmapMode` | boolean | `true` when mindmap canvas is active |
| `mindmapNetwork` | vis.Network | The vis-network instance |
| `mindmapNodes` | vis.DataSet | Reactive node data |
| `mindmapEdges` | vis.DataSet | Reactive edge data |
| `mindmapActiveWorkspaceId` | number | IndexedDB key of current workspace |
| `mindmapWorkspaceName` | string | Display name |
| `mindmapNodeCounter` | number | Auto-increment for unique node IDs (`mm-N`) |
| `mindmapEdgeCounter` | number | Auto-increment for unique edge IDs (`mme-N`) |
| `mindmapSelectedNode` | string | Currently selected node ID |
| `mindmapEdgeMode` | boolean | `true` when drawing an edge |
| `mindmapEdgeSource` | string | Source node ID during edge drawing |
| `mindmapDirty` | boolean | Unsaved changes exist |
| `mindmapPropertiesPanelOpen` | boolean | Properties panel visible |

---

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| Clicking "+ Idea" does nothing | Canvas not initialised (null DataSet) | Fixed in commit `3167ed3` — `_ensureCanvas()` auto-inits |
| Red dot won't go away | Unsaved changes | Click "Save" or it auto-saves in 2s if a workspace is active |
| Workspace not restoring | No workspace saved yet | Save at least once to create a workspace |
| Lanes overlap nodes | Lane positions are fixed | Drag nodes into the lane zones manually |
| Empty canvas on return | No prior workspace | First visit starts empty — this is expected |

---

*OAA Ontology Visualiser v5.1.0 — Mindmap Crib Sheet*
