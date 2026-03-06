# OAA Ontology Visualiser — Technical Documentation

**Version:** 5.1.0
**Date:** 2026-02-11

---

## Technology Stack

### vis.js (vis-network)
**What:** A JavaScript library for dynamic, browser-based network/graph visualization.

**Why:** Provides force-directed layouts, physics simulation, pan/zoom, node selection, and event handling out of the box. No server required — runs entirely in the browser.

**CDN:** `https://unpkg.com/vis-network/standalone/umd/vis-network.min.js`

**Key APIs Used:**
| API | Purpose |
|-----|---------|
| `new vis.Network(container, data, options)` | Initialize the graph visualization |
| `vis.DataSet(nodes)` | Reactive data structure for nodes |
| `vis.DataSet(edges)` | Reactive data structure for edges |
| `network.on('click', fn)` | Handle node/edge clicks |
| `network.on('doubleClick', fn)` | Handle double-click for drill-down |
| `network.focus(nodeId, options)` | Animate camera to a node |
| `network.selectNodes([ids])` | Programmatically select nodes |
| `network.fit()` | Zoom to fit all nodes in view |
| `network.stabilize(iterations)` | Run physics simulation |
| `network.setOptions(opts)` | Update physics/layout at runtime |

**Documentation:** https://visjs.github.io/vis-network/docs/network/

---

### HTML5 File API
**What:** Browser API for reading files dropped or selected by the user.

**Why:** Enables drag-and-drop JSON loading without a server.

**Key APIs Used:**
| API | Purpose |
|-----|---------|
| `FileReader()` | Read file contents asynchronously |
| `reader.readAsText(file)` | Read as UTF-8 string |
| `reader.onload` | Callback when file is loaded |
| `DataTransfer.files` | Access dropped files from drag event |

---

### GitHub REST API
**What:** GitHub's HTTP API for accessing repository contents.

**Why:** Enables loading ontologies directly from private GitHub repos (with PAT).

**Endpoint Used:**
```
GET /repos/{owner}/{repo}/contents/{path}
Accept: application/vnd.github.v3.raw
Authorization: token {PAT}
```

---

### CSS Custom Properties & Flexbox
**What:** Modern CSS for layout and theming.

**Why:** Dark theme, responsive panels, smooth transitions without external CSS frameworks.

---

### Canvas API (via vis.js)
**What:** HTML5 Canvas for 2D rendering.

**Why:** vis.js renders the graph to a `<canvas>` element for performance. Used for PNG export via `canvas.toDataURL()`.

---

## Architecture Overview

```mermaid
graph TB
    subgraph INPUT["Input Layer"]
        FILE[JSON File Drop]
        GH[GitHub API]
        TD[Test Data File]
    end

    subgraph PARSE["Parse Layer"]
        DETECT[Format Detection]
        PARSE_ONT[parseOntology]
        DIAG[Diagnostics]
    end

    subgraph AUDIT["Audit Layer"]
        CONN[Connectivity Check]
        COMP[Component Analysis]
        SILO[Silo Detection]
    end

    subgraph RENDER["Render Layer"]
        VISJS[vis.js Network]
        STAB[Stabilization]
        EQUIL[Equilibrium]
    end

    subgraph UI["UI Layer"]
        GRAPH[Graph Canvas]
        SIDEBAR[Details Sidebar]
        AUDIT_PANEL[Audit Panel]
        LEGEND[Legend]
    end

    FILE --> DETECT
    GH --> DETECT
    TD --> |merge| PARSE_ONT
    DETECT --> PARSE_ONT
    PARSE_ONT --> DIAG
    DIAG --> CONN
    CONN --> COMP
    COMP --> SILO
    SILO --> VISJS
    VISJS --> STAB
    STAB --> EQUIL
    EQUIL --> GRAPH
    PARSE_ONT --> SIDEBAR
    SILO --> AUDIT_PANEL
    PARSE_ONT --> LEGEND

    style INPUT fill:#2196F3,stroke:#1565C0,color:#fff
    style PARSE fill:#4CAF50,stroke:#2E7D32,color:#fff
    style AUDIT fill:#FF9800,stroke:#E65100,color:#fff
    style RENDER fill:#9C27B0,stroke:#6A1B9A,color:#fff
    style UI fill:#00BCD4,stroke:#00838F,color:#fff
```

---

## State Machine

```mermaid
stateDiagram-v2
    [*] --> Idle: Page Load

    Idle --> Loading: File Drop / GitHub Load
    Loading --> Parsing: JSON Valid
    Loading --> Error: JSON Invalid

    Parsing --> Auditing: Nodes Extracted
    Auditing --> Stabilizing: Audit Complete

    Stabilizing --> Equilibrium: Physics Converged
    Equilibrium --> Interactive: User Ready

    Interactive --> NodeSelected: Click Node
    Interactive --> DrillDown: Double-Click Node
    Interactive --> Stabilizing: Reset Layout

    NodeSelected --> Interactive: Click Away
    DrillDown --> NodeSelected: Navigate

    Interactive --> PhysicsFrozen: Toggle Physics OFF
    PhysicsFrozen --> Interactive: Toggle Physics ON

    Error --> Idle: Dismiss
```

---

## Lifecycle Phases

### Phase 1: IDLE
Initial page state. Drop zone visible, no graph rendered.

### Phase 2: LOADING
File being read (local) or fetched (GitHub API).

### Phase 3: PARSING
`parseOntology()` extracts nodes and edges based on detected format:
- `agent-registry` — Agents with dependencies
- `registry-entry` — UniRegistry wrapper
- `uni-registry` — Full ontology definition
- `pf-ontology` — PF-Core entities array format
- `pf-ontology-keyed` — OAA v6.2.0 object-keyed entities format
- `jsonld-definedterm` — OAA v7.0.0 hasDefinedTerm array (DefinedTerm entities)
- `jsonld` — Standard JSON-LD @graph
- `generic` — Fallback object traversal

### Phase 4: AUDITING
`auditGraph()` analyzes connectivity:
- Counts incoming/outgoing edges per node
- Identifies isolated nodes (zero edges)
- Runs BFS to find connected components
- Flags silos (disconnected clusters)

### Phase 5: STABILIZING
vis.js physics engine runs iterations:
- **Algorithm:** Barnes-Hut (O(n log n))
- **Gravitational Constant:** -3000 (repulsion)
- **Spring Length:** 150px (ideal edge length)
- **Iterations:** 200 max before timeout

### Phase 6: EQUILIBRIUM
Physics converged — nodes at rest in optimal positions. This is the **initial stable state**.

### Phase 7: INTERACTIVE
User can:
- Pan/zoom the canvas
- Click nodes to inspect
- Double-click to drill into connections
- Toggle physics on/off
- Switch layouts
- Export PNG

---

## Glossary

| Term | Definition |
|------|------------|
| **Stabilization** | The process where vis.js runs physics simulation iterations until the graph reaches a stable configuration. Nodes move from random/seeded positions toward equilibrium. |
| **Equilibrium** | The state where all forces (repulsion between nodes, spring tension on edges) are balanced. Nodes stop moving. This is the "settled" graph. |
| **Force-Directed Layout** | A graph layout algorithm where nodes repel each other (like electric charges) and edges act like springs pulling connected nodes together. |
| **Barnes-Hut Algorithm** | An optimization for force calculations that groups distant nodes, reducing complexity from O(n²) to O(n log n). |
| **Physics Engine** | The simulation system that calculates forces and updates node positions each frame. Can be toggled on/off. |
| **Gravitational Constant** | Controls repulsion strength. Negative = nodes push apart. More negative = stronger repulsion = more spread out graph. |
| **Spring Length** | The "ideal" distance edges want to be. Shorter = tighter clusters. Longer = more spread. |
| **Silo / Isolated Node** | A node with zero edges (no connections). Highlighted with orange dashed border. |
| **Connected Component** | A group of nodes where every node can reach every other node via edges. A fully connected graph has 1 component. |
| **Disconnected Cluster** | A connected component that is separate from the main graph. Indicates potential ontology issues. |
| **Hierarchical Layout** | Alternative layout where nodes are arranged in tree-like levels based on edge direction. Physics disabled. |
| **Circular Layout** | Nodes arranged in a circle, then briefly simulated to spread, then frozen. |
| **Drill-Down** | Navigation from one node to a connected node via the Connections tab. Double-click triggers this. |
| **AR (Application Rules)** | Cross-ontology rules (AR-*) that govern how ontologies interact — lineage chains, cross-reference integrity, and runtime enforcement. Defined in [BUSINESS-RULES-SPEC.md](../../ONTOLOGIES/ontology-library/BUSINESS-RULES-SPEC.md). |
| **BR (Business Rules)** | Entity-level constraints (BR-*) defined within individual ontology JSON files — e.g. "Epic must have at least one Feature". Catalogued in [BUSINESS-RULES-SPEC.md](../../ONTOLOGIES/ontology-library/BUSINESS-RULES-SPEC.md). |
| **DR (Design Rules)** | Visual/UI rules (DR-*) governing how ontology nodes, edges, and canvas elements render in the visualiser. Defined in [DESIGN-SYSTEM-SPEC.md](./DESIGN-SYSTEM-SPEC.md). |
| **LR (Lineage Rules)** | Strategy-to-execution traceability rules (LR-*) enforcing the VSOM → OKR → VP → PMF → EFS lineage chain. Defined in [EFS-Lineage-Specification](../../ONTOLOGIES/ontology-library/PE-Series/EFS-ONT/EFS-Lineage-Specification-v3.0.0.md). |
| **DP (Design Principles)** | Architectural design principles (DP-*) governing series/sub-series graph organisation. Defined in [DESIGN-SYSTEM-SPEC.md](./DESIGN-SYSTEM-SPEC.md). |

---

## Reset to Initial State

To restore the graph to its initial stabilized equilibrium:

### Option 1: Re-render (Full Reset)
```javascript
// Re-parse and re-render from stored data
if (currentData) {
  const parsed = parseOntology(currentData, 'reset');
  renderGraph(parsed);
}
```

### Option 2: Re-stabilize (Soft Reset)
```javascript
// Re-run physics stabilization without re-parsing
if (network) {
  network.setOptions({ physics: { enabled: true } });
  network.stabilize(200);
}
```

### Option 3: Fit to View (Position Reset)
```javascript
// Just reset zoom/pan to show all nodes
if (network) {
  network.fit({ animation: true });
}
```

### Implementation: Add Reset Button

To add a "Reset" button to the toolbar:

```html
<button onclick="resetGraph()">Reset</button>
```

```javascript
function resetGraph() {
  if (!currentData) return;

  // Re-parse from original data
  const parsed = parseOntology(currentData, document.getElementById('file-name').textContent || 'reset');

  // Re-render (triggers stabilization)
  renderGraph(parsed);

  // Close panels
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('audit-panel').classList.remove('open');

  // Reset physics toggle state
  physicsEnabled = true;
  document.getElementById('btn-physics').classList.add('active');
}
```

---

## Data Flow Diagram

```mermaid
flowchart LR
    subgraph Sources
        A[Local JSON]
        B[GitHub Repo]
        C[Test Data]
    end

    subgraph Processing
        D{Format Detect}
        E[Parse Nodes]
        F[Parse Edges]
        G[Validate Edges]
        H[Create Stubs]
    end

    subgraph Analysis
        I[Count Edges]
        J[Find Isolated]
        K[BFS Components]
        L[Flag Silos]
    end

    subgraph Visualization
        M[vis.js DataSet]
        N[Barnes-Hut Physics]
        O[Stabilization Loop]
        P[Equilibrium State]
    end

    A --> D
    B --> D
    D --> E
    E --> F
    F --> G
    G --> H
    H --> I
    I --> J
    J --> K
    K --> L
    L --> M
    M --> N
    N --> O
    O --> P
    C -.->|merge| M
```

---

## Component Interaction

```mermaid
sequenceDiagram
    participant User
    participant DropZone
    participant Parser
    participant Auditor
    participant VisJS
    participant Sidebar

    User->>DropZone: Drop JSON file
    DropZone->>Parser: loadFile(file)
    Parser->>Parser: detectFormat()
    Parser->>Parser: parseOntology()
    Parser->>Auditor: auditGraph(parsed)
    Auditor->>Auditor: Find isolated nodes
    Auditor->>Auditor: BFS components
    Auditor->>VisJS: renderGraph(parsed)
    VisJS->>VisJS: Create DataSet
    VisJS->>VisJS: Initialize Network
    VisJS->>VisJS: stabilize(200)
    VisJS-->>User: Graph at Equilibrium

    User->>VisJS: Click node
    VisJS->>Sidebar: showNodeDetails(node)
    Sidebar-->>User: Display tabs

    User->>Sidebar: Click connection
    Sidebar->>VisJS: navigateToNode(id)
    VisJS->>VisJS: focus() + select()
    VisJS->>Sidebar: showNodeDetails(node)
```

---

## File Structure

```
PBS/TOOLS/ontology-visualiser/
├── browser-viewer.html           # Main application (HTML shell)
├── css/viewer.css                # All styles
├── js/
│   ├── app.js                    # Entry point, event wiring
│   ├── state.js                  # Shared state + constants
│   ├── ontology-parser.js        # Format detection + parsing
│   ├── graph-renderer.js         # vis.js rendering (single + multi)
│   ├── multi-loader.js           # Registry batch loading + merged graph
│   ├── audit-engine.js           # OAA v7.0.0 validation gates
│   ├── compliance-reporter.js    # Compliance panel rendering
│   ├── ui-panels.js              # Sidebar, audit, modals, tabs
│   ├── library-manager.js        # IndexedDB ontology library
│   ├── github-loader.js          # Registry integration
│   ├── export.js                 # PNG, audit JSON, ontology download
│   ├── mermaid-viewer.js         # Mermaid diagram rendering + container switching
│   └── mindmap-canvas.js         # Mindmap canvas, IndexedDB workspace persistence
├── test-data/                    # Test ontologies for vitest suite
├── tests/                        # Vitest unit tests
├── VISUALISER-DOCS.md            # This documentation
├── README.md                     # Project readme
├── QUICK-START.md                # Getting started guide
└── FEATURE-SPEC-*.md             # Feature specifications
```

---

## View Switching

The visualiser supports three canvas views, controlled by a segmented tab group at the toolbar start:

| Tab | Canvas | Key Module | State |
|-----|--------|------------|-------|
| **Graph** | `#network` (vis.js force-directed) | `graph-renderer.js` | `state.activeView = 'graph'` |
| **Mermaid** | `#mermaid-container` (rendered flowchart) | `mermaid-viewer.js` | `state.activeView = 'mermaid'` |
| **Mindmap** | `#mindmap-container` (freeform vis-network) | `mindmap-canvas.js` | `state.activeView = 'mindmap'` |

All transitions go through `setViewMode(mode)` in `app.js`, which:

1. Closes all overlays (sidebar, audit, mermaid editor, properties panel)
2. Updates `state.activeView` and derived booleans (`mermaidMode`, `mindmapMode`)
3. Shows/hides the correct canvas container
4. Adjusts toolbar buttons for the active view
5. Highlights the active tab

### Mermaid View
- Auto-exports the loaded ontology to Mermaid flowchart syntax when switching
- Supports `.mmd` file drag-and-drop for direct Mermaid rendering
- Pan/zoom via mouse, "Fit" button to reset viewport
- "Editor" toggle for raw Mermaid code editing

### Mindmap View
- Freeform mind mapping with vis-network (separate instance from the graph canvas)
- Double-click canvas to add nodes; double-click nodes to edit
- Properties panel for node styling (colour, shape, font size)
- IndexedDB workspace persistence with auto-save
- Empty-state hint shown when canvas has no nodes

---

## Supported Formats

| Format | Detection Key | Example Structure |
|--------|--------------|-------------------|
| Agent Registry | `agents[]` | `{ "agents": [{ "id": "...", "dependencies": [] }] }` |
| Registry Entry | `registryEntry` | `{ "registryEntry": { "summary": { "entities": [] } } }` |
| UniRegistry | `ontologyDefinition` | `{ "ontologyDefinition": { "@graph": [], "entities": [] } }` |
| PF Ontology | `entities[]` (array) | `{ "entities": [{ "@id": "...", "name": "..." }] }` |
| PF Ontology (Keyed) | `entities{}` (object) | `{ "entities": { "Foo": { "@id": "...", "name": "..." } } }` |
| JSON-LD DefinedTerm | `hasDefinedTerm[]` | `{ "hasDefinedTerm": [{ "@type": "DefinedTerm", ... }] }` |
| JSON-LD | `@graph` or `classes` | `{ "@graph": [{ "@id": "...", "rdfs:subClassOf": "..." }] }` |
| Generic | (fallback) | Any JSON object — traverses keys recursively |

---

## Physics Parameters

| Parameter | Value | Effect |
|-----------|-------|--------|
| `gravitationalConstant` | -3000 | Repulsion strength (more negative = more spread) |
| `springLength` | 150 | Ideal edge length in pixels |
| `stabilization.iterations` | 200 | Max iterations before stopping |
| `barnesHut.theta` | 0.5 | Approximation threshold (default) |

To customize, modify the `options` object in `renderGraph()`.

---

*OAA Ontology Visualiser v5.1.0 — Documentation*
