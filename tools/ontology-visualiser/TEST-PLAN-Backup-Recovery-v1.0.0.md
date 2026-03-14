# Test Plan — Backup & Recovery

**Date:** 2026-03-13
**Feature:** Daily Backup to pfc-dev + Recovery Procedures
**Epic Ref:** [Epic 59 (#840)](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/840) · [Epic 61 (#947)](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/947)
**ADR:** [ADR-018](./ADR-LOG.md#adr-018)
**Status:** ACTIVE

---

## Scope

- Daily automated backup workflow (`visualiser-backup.yml`)
- Recovery from pfc-dev backup (full restore, local deployment)
- Rollback via deployment snapshot tags
- Failure alerting (auto-issue creation)
- Ontology library backup coverage
- PFI instance-specific ontology data recovery

## Files Modified / Created

| File | Change Type |
|------|-------------|
| `.github/workflows/visualiser-backup.yml` | New — daily backup workflow |
| `PBS/STRATEGY/PFC-CICD-RECOVERY-OAA-Visualiser-Pre-Migration-Backup-v1.0.0.md` | New — recovery plan |
| `PBS/TOOLS/ontology-visualiser/ADR-LOG.md` | Updated — ADR-018 |
| `PBS/TOOLS/ontology-visualiser/ARCHITECTURE.md` | Updated — backup architecture section |
| `PBS/TOOLS/ontology-visualiser/DEPLOYMENT.md` | Updated — backup & recovery runbook |
| `PBS/TOOLS/ontology-visualiser/OPERATING-GUIDE.md` | Updated — backup & recovery workflow |
| `.github/scripts/validate-tracker.mjs` | Updated — RECOVERY enum |
| `PBS/STRATEGY/programme-tracker.schema.json` | Updated — RECOVERY enum |
| `PBS/STRATEGY/programme-tracker.json` | Updated — RECOVERY doc entry |

---

## TC-1: Regression — Existing Tests

| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| TC-1.1 | Run `npx vitest run` from visualiser dir | 2081/2081 pass — no regressions from doc changes | |
| TC-1.2 | Run `node .github/scripts/validate-tracker.mjs` | VALIDATION PASSED — RECOVERY enum accepted, epic-61cicd ref resolves | |
| TC-1.3 | GitHub Pages deploys on push to main | Deployment succeeds, snapshot tag created | |

---

## TC-2: Backup Workflow

| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| TC-2.1 | Trigger `visualiser-backup.yml` manually via `gh workflow run` | Workflow completes successfully | |
| TC-2.2 | Verify pfc-dev commit created with correct message format | Commit message includes date, source SHA, file count | |
| TC-2.3 | Trigger backup when no changes exist | Workflow skips commit, logs "No changes detected" | |
| TC-2.4 | Verify excluded files not backed up | `node_modules/`, `playwright-report/`, `test-results/` absent in pfc-dev | |
| TC-2.5 | Verify backup includes all 45 JS modules | `ls pfc-dev/tools/ontology-visualiser/js/*.js | wc -l` matches source | |
| TC-2.6 | Verify backup includes ontology library | `pfc-dev/ontology-library/` contains registry index + all series | |

---

## TC-3: Recovery — Full Restore

| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| TC-3.1 | Clone pfc-dev, rsync to empty visualiser dir | All files restored, directory structure matches source | |
| TC-3.2 | Run `npm ci` after restore | Dependencies install without error | |
| TC-3.3 | Run `npx vitest run` after restore | 2081/2081 pass | |
| TC-3.4 | Push restored files, verify GitHub Pages deploys | Live URL serves restored visualiser | |
| TC-3.5 | Load Registry on restored version | All 52 ontologies load, tiered nav functional | |
| TC-3.6 | EMC composition after restore | Composition engine loads, PFI instances available | |

---

## TC-4: Recovery — Quick Local Deployment

| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| TC-4.1 | Clone pfc-dev, run `python3 -m http.server 8080` | Server starts, no errors | |
| TC-4.2 | Open `browser-viewer.html` in browser | Visualiser loads, drop zone visible | |
| TC-4.3 | Load a sample ontology via drag-and-drop | Graph renders correctly | |
| TC-4.4 | Verify no external dependencies block local use | vis-network loads from `lib/` fallback if CDN unavailable | |

---

## TC-5: Recovery — Snapshot Rollback

| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| TC-5.1 | List deployment snapshot tags | `git tag -l 'deploy/*'` returns 1+ tags | |
| TC-5.2 | Trigger `rollback.yml` with valid tag | Pages redeploy to snapshot version | |
| TC-5.3 | Verify rolled-back version at live URL | Content matches snapshot, not current HEAD | |

---

## TC-6: Failure Alerting

| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| TC-6.1 | Simulate backup failure (e.g. invalid PAT) | GitHub issue auto-created with `type:bug` + `cicd` labels | |
| TC-6.2 | Verify issue body contains workflow run link | Clickable link to failed Actions run | |
| TC-6.3 | Verify issue body contains recovery plan link | Link to RECOVERY-PLAN.md in pfc-dev | |
| TC-6.4 | Verify issue body lists likely causes | PAT expiry, repo rename, transient failure | |

---

## TC-7: Ontology Library & Instance Data Recovery

| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| TC-7.1 | Verify ontology library backed up in pfc-dev | `pfc-dev/ontology-library/` contains all 6 series + Foundation + Orchestration | |
| TC-7.2 | Verify registry index present | `ont-registry-index.json` in pfc-dev matches source version | |
| TC-7.3 | Verify PFI instance configs recoverable from triad repos | `gh repo view ajrmooreuk/pfi-w4m-dev` contains `pfc-core/` with instance data | |
| TC-7.4 | Verify PFI instance-specific ontologies in triad repos | Instance graphs accessible via `pfc-release.yml` distribution path | |
| TC-7.5 | Re-import ontologies from JSONLD after Supabase data loss | Load from `ontology-library/**/*.jsonld`, verify all 52 load | |

---

## Pre-Migration Gate

All TC-1 through TC-7 must pass before Epic 59 database migration begins. TC-6 (failure alerting) may be tested by temporarily revoking `PROMOTION_PAT` in a controlled manner.
