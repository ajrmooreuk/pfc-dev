# OAA Visualiser — Recovery & Deployment Plan

**Version:** 1.0.0
**Date:** 2026-03-13
**Context:** Pre-database-migration backup. This document describes how to restore and deploy the OAA Visualiser from this backup if the database migration (Epic 59) encounters issues.

---

## 1. What This Backup Contains

| Component | Path | Notes |
|-----------|------|-------|
| HTML entry point | `browser-viewer.html` | Single-page app, 1120 lines |
| ES modules (45) | `js/` | ~1.5 MB, zero build step |
| Stylesheet | `css/viewer.css` | 132 KB |
| vis-network lib | `lib/` | Local fallback copy |
| Tests (2081) | `tests/` | vitest + playwright |
| Docs & guides | `*.md` | Architecture, operating guides, release bulletins |
| Sample data | `sample-*.json`, `test-data/` | Demo ontologies |
| Package manifest | `package.json`, `package-lock.json` | Test deps only |

**Excluded:** `node_modules/` (regenerate with `npm ci`), `playwright-report/`, `test-results/`

---

## 2. Recovery Procedure

### 2.1 — Full Restore to GitHub Pages (Azlan-EA-AAA)

If the visualiser in `Azlan-EA-AAA` is damaged or needs rollback:

```bash
# 1. Clone this backup
git clone https://github.com/ajrmooreuk/pfc-dev.git
cd pfc-dev

# 2. Copy visualiser back to source repo
rsync -av --delete \
  --exclude='node_modules' \
  tools/ontology-visualiser/ \
  /path/to/Azlan-EA-AAA/PBS/TOOLS/ontology-visualiser/

# 3. Reinstall test dependencies
cd /path/to/Azlan-EA-AAA/PBS/TOOLS/ontology-visualiser
npm ci

# 4. Verify tests pass
npx vitest run   # Expect 2081/2081 pass

# 5. Commit and push to trigger GitHub Pages deployment
cd /path/to/Azlan-EA-AAA
git add PBS/TOOLS/ontology-visualiser/
git commit -m "restore: OAA visualiser from pfc-dev backup"
git push origin main
```

GitHub Pages will auto-deploy via `.github/workflows/pages.yml`.

### 2.2 — Quick Local Deployment (No GitHub)

For immediate local access without pushing to GitHub:

```bash
cd pfc-dev/tools/ontology-visualiser
python3 -m http.server 8080
# Open http://localhost:8080/browser-viewer.html
```

No build step, no npm install needed — the app runs from static files.

### 2.3 — Rollback via Existing Snapshot Tags

Before restoring from this backup, check if a deployment snapshot is closer to what you need:

```bash
# List available deployment snapshots in Azlan-EA-AAA
cd /path/to/Azlan-EA-AAA
git tag -l 'deploy/*' | sort -r | head -15

# Rollback to a specific snapshot
gh workflow run rollback.yml -f tag=deploy/YYYY-MM-DD-HHMM
```

---

## 3. Pre-Migration Checklist

Before starting Epic 59 database migrations, confirm:

- [ ] This backup commit exists in `pfc-dev` main branch
- [ ] `npx vitest run` passes 2081/2081 in this backup
- [ ] GitHub Pages deployment snapshot tag exists for the current live version
- [ ] Supabase project is provisioned and schema migrations are scripted (not manual)
- [ ] Rollback workflow (`.github/workflows/rollback.yml`) is tested and functional

---

## 4. Deployment Architecture (Current → Target)

```
CURRENT (Static GitHub Pages)
├── Azlan-EA-AAA/PBS/TOOLS/ontology-visualiser/
├── Deployed via: .github/workflows/pages.yml
├── URL: ajrmooreuk.github.io/Azlan-EA-AAA/...
├── Auth: Private repo (collaborators only)
└── Data: Client-side (IndexedDB, sessionStorage)

TARGET (Database + SSO — Epic 59)
├── Supabase backend (JSONB graph storage)
├── SSO authentication (RLS policies)
├── Hosted app (TBD — Vercel/Netlify/Pages)
└── Data: Server-side (Supabase PostgreSQL)
```

---

## 5. Recovery Decision Tree

```
Issue detected during/after migration
│
├─ Visualiser UI broken?
│  ├─ YES → Restore from this backup (§2.1)
│  └─ NO → Continue
│
├─ Data loss in Supabase?
│  ├─ YES → Ontology data lives in git (ontology-library/)
│  │         Re-import from JSONLD files
│  └─ NO → Continue
│
├─ SSO/auth blocking access?
│  ├─ YES → Fall back to GitHub Pages (private repo gate)
│  │         This backup serves the pre-SSO version
│  └─ NO → Continue
│
└─ All clear → Migration successful
```

---

## 6. Contacts & Repos

| Resource | Location |
|----------|----------|
| Source repo | `ajrmooreuk/Azlan-EA-AAA` (private) |
| This backup | `ajrmooreuk/pfc-dev` → `tools/ontology-visualiser/` |
| CI/CD docs | `PBS/STRATEGY/PFC-CICD-*` |
| Epic 59 (DB) | GitHub Issue #840 |
| Epic 61 (CI/CD) | GitHub Issue #947 |
| Rollback workflow | `.github/workflows/rollback.yml` |
