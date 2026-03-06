# Ontology Library — Verification Checklist

**Version:** 1.0.0
**Date:** 2026-02-07
**Scope:** Post-merge verification of ontology-library consolidation

---

## 1. Registry Index Integrity

| # | Check | Expected | Status |
|---|-------|----------|--------|
| 1.1 | `ont-registry-index.json` loads as valid JSON | No parse errors | |
| 1.2 | Registry version | `3.0.0` | |
| 1.3 | Total entries count | 23 | |
| 1.4 | Compliant entries count | 20 | |
| 1.5 | Placeholder entries count | 2 (MCSB2, AZALZ) | |
| 1.6 | Every entry `path` resolves to an existing file | 0 missing files | |
| 1.7 | No duplicate `@id` values across entries | 0 duplicates | |
| 1.8 | No duplicate `namespace` values across entries | 0 duplicates | |

---

## 2. Co-located Entry + Artifact Pairing

| # | Series | Ontology | Entry File Exists | Artifact File Exists | Status |
|---|--------|----------|-------------------|---------------------|--------|
| 2.1 | Orchestration | EMC-ONT | `Entry-ONT-EMC-001.json` | `pf-EMC-ONT-v1.0.0.jsonld` | |
| 2.2 | Foundation | ORG-ONT | `Entry-ONT-ORG-001.json` | `org-ontology-v2.1.0-oaa-v5.json` | |
| 2.3 | Foundation | ORG-CONTEXT-ONT | `Entry-ONT-ORG-CTX-001.json` | `org-context-ontology-v1.0.1.json` | |
| 2.4 | Foundation | ORG-MAT-ONT | `Entry-ONT-ORG-MAT-001.json` | `org-maturity-v1.0.0-oaa-v5.json` | |
| 2.5 | VE-Series | VSOM-ONT | `Entry-ONT-VSOM-001.json` | `vsom-ontology-v2.1.0-oaa-v5.json` | |
| 2.7 | VE-Series | OKR-ONT | `Entry-ONT-OKR-001.json` | `okr-ontology-v2.0.0-oaa-v6.json` | |
| 2.8 | VE-Series | VP-ONT | `Entry-ONT-VP-001.json` | `vp-ontology-v1.2.0.jsonld` | |
| 2.9 | VE-Series | RRR-ONT | `Entry-ONT-RRR-001.json` | `pf-roles-raci-rbac-ontology-v3.1.0.jsonld` | |
| 2.10 | VE-Series | PMF-ONT | `Entry-ONT-PMF-001.json` | `pmf-ontology-v1.0.0.jsonld` | |
| 2.11 | VE-Series | KPI-ONT | `Entry-ONT-KPI-001.json` | `kpi-ontology-v1.0.0-oaa-v6.json` | |
| 2.12 | PE-Series | PPM-ONT | `Entry-ONT-PPM-001.json` | `ppm-module-v3.0.0-oaa-v5.json` | |
| 2.13 | PE-Series | PE-ONT | `Entry-ONT-PE-001.json` | `process-engineering-v2.0.0-oaa-v5.json` | |
| 2.14 | PE-Series | EFS-ONT | `Entry-ONT-EFS-001.json` | `efs-ontology-v1.0.0.jsonld` | |
| 2.15 | PE-Series | EA-ONT | `Entry-ONT-EA-001.json` | `ea-portfolio-roadmaps-*.jsonld` | |
| 2.16 | RCSG-Series | MCSB-ONT | `Entry-ONT-ALZ-001.json` | `MCSB-Ontology-v1.0.0.jsonld` | |
| 2.17 | RCSG-Series | GDPR-ONT | `Entry-ONT-GDPR-001.json` | `gdpr-regulatory-framework-v1.0.0.json` | |
| 2.18 | RCSG-Series | PII-ONT | `Entry-ONT-PII-001.json` | `pii-governance-microsoft-native-v3.3.0.json` | |
| 2.19 | RCSG-Series | MCSB2-ONT | `Entry-ONT-MCSB2-001.json` | _(placeholder — no artifact)_ | |
| 2.20 | RCSG-Series | AZALZ-ONT | `Entry-ONT-AZALZ-001.json` | _(placeholder — no artifact)_ | |
| 2.21 | Competitive | CA-ONT | `Entry-ONT-CA-001.json` | `competitive-analysis-v2.1.0-oaa-v5.json` | |
| 2.22 | Competitive | CL-ONT | `Entry-ONT-CL-001.json` | `competitive-landscape-v1.0.0-oaa-v5.json` | |
| 2.23 | Competitive | GA-ONT | `Entry-ONT-GA-001.json` | `gap-analysis-v1.0.0-oaa-v5.json` | |

---

## 3. Entry Artifact Path Resolution

| # | Check | Expected | Status |
|---|-------|----------|--------|
| 3.1 | All compliant entries have `artifacts.ontology` starting with `./` | Co-located relative paths | |
| 3.2 | Shared glossary refs use `../../unified-glossary-v2.0.0.json` | Correct relative depth | |
| 3.3 | Shared validation report refs use `../../validation-reports/...` | Correct relative depth | |
| 3.4 | No remaining `../pfc-ontologies/` paths in any entry file | 0 occurrences | |
| 3.5 | No remaining `../unified-registry/` paths in any entry file | 0 occurrences | |

---

## 4. Visualiser Unit Tests

| # | Check | Expected | Status |
|---|-------|----------|--------|
| 4.1 | `npx vitest run` from `PBS/TOOLS/ontology-visualiser/` | 19 pass, 1 pre-existing fail | |
| 4.2 | Pre-existing failure is "skips placeholder ontologies" only | Confirmed known issue | |
| 4.3 | `REGISTRY_BASE_PATH` in test mock matches `state.js` | `../../ONTOLOGIES/ontology-library/` | |

---

## 5. Visualiser — Load Registry (Browser)

| # | Check | Expected | Status |
|---|-------|----------|--------|
| 5.1 | Open `browser-viewer.html` via local HTTP server | Page loads, no console errors | |
| 5.2 | Click **Load Registry** | Loading progress bar appears | |
| 5.3 | Tier 0 renders | 6 series super-nodes visible | |
| 5.4 | Total ontologies loaded | 23 (check status bar) | |
| 5.5 | Compliant ontologies | 20 (non-placeholder) | |
| 5.6 | Placeholder ontologies | 2 (MCSB2, AZALZ — diamond shape) | |
| 5.7 | Failed loads | 0 | |
| 5.8 | Cross-series edges visible (gold dashed) | At least 1 edge between series | |

---

## 6. Visualiser — Tiered Navigation

| # | Check | Expected | Status |
|---|-------|----------|--------|
| 6.1 | Double-click VE-Series node | Tier 1: 6 VE ontology nodes visible | |
| 6.2 | KPI-ONT shows as production (not placeholder diamond) | Solid circle, blue colour | |
| 6.3 | Double-click VSOM-ONT node | Tier 2: entity graph renders | |
| 6.4 | Breadcrumb shows "Library > VE-Series > VSOM" | Correct path | |
| 6.5 | Click "Library" in breadcrumb | Returns to Tier 0 | |
| 6.6 | Double-click a placeholder node (MCSB2) | No drill — placeholder not drillable | |

---

## 7. Visualiser — Series Highlight Selectors

| # | Check | Expected | Status |
|---|-------|----------|--------|
| 7.1 | Click **VE** toggle | Gold glow on VE-Series node, VE chain edges highlighted | |
| 7.2 | Click **PE** toggle | Copper glow on PE-Series node, PE chain edges highlighted | |
| 7.3 | Click **VE** + **PE** together | Both glow + EFS convergence styling (#FF6B35) | |
| 7.4 | Click **Foundation** toggle | Orange glow on Foundation node, Foundation ontologies highlighted in Tier 1 | |
| 7.5 | Click **Competitive** toggle | Pink glow on Competitive node | |
| 7.6 | Click **RCSG** toggle | Purple glow on RCSG-Series node | |
| 7.7 | Click **Orchestration** toggle | Cyan glow on Orchestration node | |
| 7.8 | Non-matching edges dimmed | Grey/faded when any series highlighted | |
| 7.9 | Deselect toggle | Click active button again — highlighting removed | |

---

## 8. Visualiser — Cross-Ontology Features

| # | Check | Expected | Status |
|---|-------|----------|--------|
| 8.1 | Click **Cross-refs Only** | Only cross-ontology edges shown | |
| 8.2 | Click a cross-ontology edge | Navigates to target ontology (Tier 2) | |
| 8.3 | KPI cross-refs to VSOM/OKR resolve | Edges visible despite prefix mismatch | |

---

## 9. GitHub Pages Deployment

| # | Check | Expected | Status |
|---|-------|----------|--------|
| 9.1 | Push to `main` triggers Pages workflow | Workflow runs | |
| 9.2 | Workflow copies `ontology-library/*` to `_site/` | No 404s for ontology files | |
| 9.3 | Hosted URL loads visualiser | `ajrmooreuk.github.io/Azlan-EA-AAA/PBS/TOOLS/ontology-visualiser/browser-viewer.html` | |
| 9.4 | **Load Registry** works on hosted version | 23 ontologies load from Pages | |
| 9.5 | Root redirect works | `ajrmooreuk.github.io/Azlan-EA-AAA/` → visualiser | |

---

## 10. Documentation Accuracy

| # | Check | Expected | Status |
|---|-------|----------|--------|
| 10.1 | `ONTOLOGY-ARCHITECTURE.md` directory tree matches actual file system | No stale references | |
| 10.2 | `ONTOLOGY-ARCHITECTURE.md` status table — all 23 ontologies listed | Correct versions/OAA levels | |
| 10.3 | `ARCHITECTURE.md` trigger paths match `pages.yml` | `ontology-library/**` (not pfc-ontologies) | |
| 10.4 | `OPERATING-GUIDE.md` series table matches registry | No SA, includes KPI, EA | |
| 10.5 | No remaining references to `pfc-ontologies` in docs | 0 occurrences | |
| 10.6 | No remaining references to `unified-registry` in docs | 0 occurrences | |

---

## 11. Clean-up Verification

| # | Check | Expected | Status |
|---|-------|----------|--------|
| 11.1 | `PBS/ONTOLOGIES/pfc-ontologies/` directory removed | Does not exist | |
| 11.2 | `PBS/ONTOLOGIES/unified-registry/` directory removed | Does not exist | |
| 11.3 | No files with `(1)`, `(2)` suffixes in ontology-library | 0 duplicate downloads | |
| 11.4 | `_orphans/` contains only non-indexed dirs | OAA-System-Prompts, PE-Campaign-Mgr, PE-Product-Manager, PFM-PF-Mngr, RCSG-Security | |

---

## Quick Validation Commands

```bash
# Count registry entries
cat PBS/ONTOLOGIES/ontology-library/ont-registry-index.json | python3 -c "import sys,json; print(len(json.load(sys.stdin)['entries']))"
# Expected: 23

# Check for stale path references in entries
grep -r "pfc-ontologies\|unified-registry" PBS/ONTOLOGIES/ontology-library/*/Entry-ONT-*.json
# Expected: no output

# Check for duplicate download files
find PBS/ONTOLOGIES/ontology-library -name "*([0-9])*"
# Expected: no output

# Run visualiser tests
cd PBS/TOOLS/ontology-visualiser && npx vitest run
# Expected: 19 pass, 1 fail (pre-existing)

# Check old directories are gone
ls -d PBS/ONTOLOGIES/pfc-ontologies PBS/ONTOLOGIES/unified-registry 2>&1
# Expected: "No such file or directory" for both
```

---

*Ontology Library Verification Checklist v1.0.0*
