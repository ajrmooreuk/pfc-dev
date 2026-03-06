# OAA Ontology Visualiser — Deployment Guide

**Version:** 2.1.0
**Date:** 2026-02-13

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DEVELOPMENT                                     │
│                                                                              │
│   Azlan-EA-AAA (Source of Truth)                                            │
│   └── tools/ontology-visualiser/                                            │
│       ├── browser-viewer.html    ← Main application                         │
│       ├── OPERATING-GUIDE.md     ← User documentation                       │
│       ├── VISUALISER-DOCS.md     ← Technical documentation                  │
│       ├── DEPLOYMENT.md          ← This file                                │
│       ├── BACKLOG.md             ← Epics/Features/Stories                   │
│       └── sample-*.json          ← Demo data                                │
│                                                                              │
│   GitHub Pages: https://ajrmooreuk.github.io/Azlan-EA-AAA/                  │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ CDN Link (GitHub Pages)
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                               RUNTIME                                        │
│                                                                              │
│   PF-Core-BAIV                    VHF                   Other PF Instances  │
│   └── tools/ontology-visualiser/  └── tools/...         └── tools/...       │
│       ├── index.html (redirect)       ├── index.html        ├── index.html  │
│       └── README.md                   └── README.md         └── README.md   │
│                                                                              │
│   All redirect to Azlan-hosted version — no local code                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Deployment Options

### Option A: GitHub Pages CDN (Recommended)

**Best for:** Multi-repo environments, zero-maintenance runtime access

**Setup:**
1. Azlan-EA-AAA already has GitHub Pages enabled
2. Visualiser accessible at:
   ```
   https://ajrmooreuk.github.io/Azlan-EA-AAA/tools/ontology-visualiser/browser-viewer.html
   ```

**For Runtime Repos (PF-Core-BAIV, VHF, etc.):**

Create `tools/ontology-visualiser/index.html`:
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>OAA Ontology Visualiser — Redirecting</title>
    <meta http-equiv="refresh" content="2; url=https://ajrmooreuk.github.io/Azlan-EA-AAA/tools/ontology-visualiser/browser-viewer.html">
</head>
<body>
    <p>Redirecting to Azlan-hosted visualiser...</p>
    <a href="https://ajrmooreuk.github.io/Azlan-EA-AAA/tools/ontology-visualiser/browser-viewer.html">
        Click here if not redirected
    </a>
</body>
</html>
```

**Pros:**
- Single source of truth
- Zero maintenance for runtime repos
- Auto-updates when Azlan deploys
- No code duplication

**Cons:**
- Requires internet access
- Dependent on GitHub Pages availability

---

### Option B: Embed in Documentation

**Best for:** Internal wikis, Confluence, documentation sites

```html
<iframe
  src="https://ajrmooreuk.github.io/Azlan-EA-AAA/tools/ontology-visualiser/browser-viewer.html"
  width="100%"
  height="800px"
  frameborder="0"
  style="border: 1px solid #2a2d37; border-radius: 8px;">
</iframe>
```

---

### Option C: Local Copy (Air-gapped)

**Best for:** Offline environments, security-restricted networks

**Steps:**
1. Download `browser-viewer.html` from Azlan
2. Download vis.js library locally:
   ```bash
   curl -o vis-network.min.js https://unpkg.com/vis-network/standalone/umd/vis-network.min.js
   ```
3. Update the script tag in `browser-viewer.html`:
   ```html
   <script src="./vis-network.min.js"></script>
   ```
4. Deploy both files together

**Note:** This creates a fork that won't receive updates automatically.

---

### Option D: npm Package (Future)

**Status:** Planned (see BACKLOG.md)

```bash
npm install @baiv/ontology-visualiser
```

Would enable:
- Versioned releases
- Dependency management
- Integration with build pipelines

---

## GitHub Pages Setup (Azlan)

If GitHub Pages is not yet enabled:

1. Go to **Settings** → **Pages** in Azlan-EA-AAA repo
2. Set Source: **Deploy from a branch**
3. Select branch: `main`
4. Select folder: `/ (root)`
5. Click **Save**

The visualiser will be available at:
```
https://ajrmooreuk.github.io/Azlan-EA-AAA/tools/ontology-visualiser/browser-viewer.html
```

---

## Custom Domain (Optional)

To use a custom domain like `visualiser.baiv.io`:

1. Create `CNAME` file in repo root:
   ```
   visualiser.baiv.io
   ```

2. Configure DNS:
   ```
   CNAME visualiser.baiv.io → ajrmooreuk.github.io
   ```

3. Enable HTTPS in GitHub Pages settings

---

## Deployment Checklist

### For Azlan (Development)

- [ ] Code changes merged to `main`
- [ ] GitHub Pages deployed automatically
- [ ] Test at live URL
- [ ] Update OPERATING-GUIDE.md if UI changed
- [ ] Update VISUALISER-DOCS.md if architecture changed
- [ ] If adding DS brands: verify `neutral.surface.default` passes DR-CANVAS-001 luminance guard (< 0.05 dark or >= 0.2 light)
- [ ] If adding PFI instances: verify `designSystemConfig.brand` maps to a loaded DS-ONT brand in `state.dsInstances` (DR-PFI-001)
- [ ] Context switch UI: verify identity bar shows PFI name + accent strip, graph border glow matches accent, title/favicon update, confirmation modal fires when switching between PFI instances (DR-CTX-SWITCH-001–004)
- [ ] Semantic coherence: verify node shapes match archetypes (hexagon=core, triangle=supporting, star=agent, etc.), edge colours match semantic categories (purple=structural, red=dependency, blue=informational), and interactive legend hover/click/reset works (DR-SEMANTIC-001–004)
- [ ] If adding DS brand archetype/edge token overrides: verify `archetype.{type}.surface` and `edge.{category}.color` values pass 3:1 contrast against canvas (DR-SEMANTIC-005/006)
- [ ] Layer filtering: verify Layers toolbar button opens panel, 6 semantic layers show correct counts, OR/AND modes work, presets apply correct layers, URL hash updates on filter change and restores on page reload (DR-LAYER-001–004)

### For Runtime Repos

- [ ] Copy `index.html` redirect file
- [ ] Copy `README.md` usage documentation
- [ ] Verify redirect works
- [ ] No other files needed

---

## Version Management

| Component | Location | Versioning |
|-----------|----------|------------|
| Visualiser | Azlan `browser-viewer.html` | Comment header |
| Documentation | `*.md` files | Version field |
| Sample data | `sample-*.json` | `version` field in JSON |

When updating, increment version in:
1. `browser-viewer.html` header comment
2. All `*.md` file headers
3. Create git tag: `visualiser-v2.1.0`

---

## Monitoring & Support

### Health Check
Verify the visualiser is accessible:
```bash
curl -I https://ajrmooreuk.github.io/Azlan-EA-AAA/tools/ontology-visualiser/browser-viewer.html
# Should return 200 OK
```

### Issue Reporting
Report issues at: https://github.com/ajrmooreuk/Azlan-EA-AAA/issues

Use labels:
- `visualiser` — General visualiser issues
- `bug` — Functionality problems
- `enhancement` — Feature requests
- `documentation` — Docs improvements

---

*OAA Ontology Visualiser v2.2.0 — Deployment Guide*
