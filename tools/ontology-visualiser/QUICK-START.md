# OAA Ontology Visualiser — Quick Start

Open the visualiser:

```
https://ajrmooreuk.github.io/Azlan-EA-AAA/
```

---

## Load a Single Ontology

1. **Drag and drop** a `.json` or `.jsonld` file onto the page
2. The graph renders automatically with OAA v7.0.0 compliance validation
3. **Click** a node to inspect it, **double-click** to drill into connections

---

## Load the Full Registry

1. Click **Load Registry** in the toolbar
2. All 23 ontologies load as a merged graph with series-based colouring
3. Cross-ontology relationships appear as gold dashed edges
4. Click any node to see which ontology and series it belongs to

---

## Key Controls

| Action | What it does |
|--------|-------------|
| Drag and drop file | Load single ontology |
| **Load Registry** | Load all 23 ontologies merged |
| **Load from GitHub** | Fetch from private repo (needs PAT) |
| Click node | Open details sidebar |
| Double-click node | Zoom + show connections |
| **OAA Audit** | View compliance gate results |
| **Library** | Browse/save ontologies locally |
| Scroll | Zoom in/out |
| **Fit View** | Show all nodes |
| **Physics** | Toggle layout simulation |
| **Export PNG** | Download as image |

---

## Compliance

Every loaded ontology is validated against 15 OAA v7.0.0 gates (G1-G8, G20-G24). The header badge shows the result:

- **Green** = all gates pass
- **Orange** = warnings
- **Red** = failures (click "Upgrade with OAA v6" to generate a fix command)

---

## Running Locally

ES modules require an HTTP server — `file://` URLs won't work:

```bash
cd PBS/TOOLS/ontology-visualiser
python -m http.server 8080
# Open http://localhost:8080/browser-viewer.html
```

---

For the full guide, see [OPERATING-GUIDE.md](./OPERATING-GUIDE.md).
