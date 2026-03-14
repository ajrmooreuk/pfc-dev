> ✅ **PFC-Dev Copy** | Sourced from [Azlan-EA-AAA](https://github.com/ajrmooreuk/pfc-dev/blob/main/skills/TEST-PLAN-PFC-URG-v1.0.0.md) on 2026-03-14. Canonical version lives in the Azlan monorepo.

# URG Programme Management Skills — Test Plan v1.0.0

**Date:** 2026-03-11 | **Status:** Active | **Epic:** 46 (#683) F46.3 (#686)

> Consolidated test plan for the URG Programme Management skill family. CI validation tests run against `validate-tracker.mjs`. Skill tests are manual invocation scenarios.

---

## 1. validate-tracker.mjs — Unit Tests (CI Script)

Run with: `node .github/scripts/validate-tracker.mjs` from repo root.

### TC-V01: Valid file — full pass

**Fixture:** `programme-tracker.json` (live, current)
**Expected:** Exit 0. All 4 sections pass. Summary shows epic + document counts.
**Status:** ✓ PASS — 68 epics, 147 documents (verified 2026-03-11)

---

### TC-V02: Invalid JSON

**Fixture:** Copy of tracker with a trailing comma injected (makes it invalid JSON)
```bash
# Test inline
echo '{"schemaVersion":"1.0.0","generated":"2026-03-11","epics":,[]}' > /tmp/bad.json
node -e "JSON.parse(require('fs').readFileSync('/tmp/bad.json','utf8'))" || echo "FAIL as expected"
```
**Expected:** Exit 1 with `::error` annotation. Message: `Invalid JSON — cannot parse`

---

### TC-V03: Missing required top-level field

**Fixture:** Tracker with `generated` field removed
**Expected:** Exit 1. Error: `Missing required top-level field: "generated"`

---

### TC-V04: Epic id pattern violation

**Fixture:** Epic with `"id": "Epic-1"` (uppercase E)
**Expected:** Exit 1. Error: `epics[N].id "Epic-1": does not match ^epic-[a-z0-9]+$`

---

### TC-V05: Duplicate epic id

**Fixture:** Two epics both with `"id": "epic-99"`
**Expected:** Exit 1. Error: `epics[M].id "epic-99": duplicate epic id`

---

### TC-V06: Invalid epic status enum

**Fixture:** Epic with `"status": "in-progress"` (not a valid enum value)
**Expected:** Exit 1. Error: `epics[N].status: "in-progress" is not a valid value`

---

### TC-V07: Invalid epic priority enum

**Fixture:** Epic with `"priority": "HIGH"` (not a valid enum value)
**Expected:** Exit 1. Error: `epics[N].priority: "HIGH" is not a valid value`

---

### TC-V08: Feature id pattern violation

**Fixture:** Feature with `"id": "feature-1"` inside an epic
**Expected:** Exit 1. Error: `epics[N].features[M].id "feature-1": does not match ^F[A-Za-z0-9.]+$`

---

### TC-V09: Duplicate feature id within epic

**Fixture:** Two features in the same epic both with `"id": "F46.3"`
**Expected:** Exit 1. Error: `epics[N].features[M].id "F46.3": duplicate feature id within epic "epic-46reg"`

---

### TC-V10: Invalid feature status enum

**Fixture:** Feature with `"status": "parked"` (not a valid enum value)
**Expected:** Exit 1. Error: `epics[N].features[M].status: "parked" is not a valid value`

---

### TC-V11: Invalid document type code

**Fixture:** Document with `"type": "NOTE"` (not a registered type code)
**Expected:** Exit 1. Error: `documents[N].type: "NOTE" is not a valid value`

---

### TC-V12: Duplicate document filename

**Fixture:** Two documents both with `"filename": "PFC-PBS-BRIEF-My-Brief-v1.0.0.md"`
**Expected:** Exit 1. Error: `documents[M].filename "PFC-PBS-BRIEF-My-Brief-v1.0.0.md": duplicate filename`

---

### TC-V13: Orphan document epicRef (FAIL)

**Fixture:** Document with `"epicRefs": ["epic-9999"]` where `epic-9999` does not exist in epics[]
**Expected:** Exit 1. Error: `Orphan document ref: "filename.md" → epicRef "epic-9999" not found in epics[]`

---

### TC-V14: Valid epicRef — no error

**Fixture:** Document with `"epicRefs": ["epic-46reg"]` where `epic-46reg` exists in epics[]
**Expected:** No error for this document. Passes TC-V13 check.

---

### TC-V15: Empty epicRefs — no error

**Fixture:** Document with `"epicRefs": []`
**Expected:** No error. Empty array is valid.

---

### TC-V16: Open feature inside closed epic (WARNING not FAIL)

**Fixture:** Epic with `"status": "closed"` and a feature with `"status": "open"`
**Expected:** Exit 0 (does NOT fail). Warning emitted: `Orphan feature: "F{n}.{x}" is "open" inside closed epic "epic-{n}"`. `::warning` annotation generated.

---

### TC-V17: Multiple errors in single run

**Fixture:** Tracker with 3 separate violations (invalid status, duplicate id, orphan ref)
**Expected:** Exit 1. All 3 errors reported in the output. Error count stated.

---

### TC-V18: GitHub Actions annotation format

**Fixture:** Any file with one error
**Expected:** Output contains `::error file=docs/strategy/programme-tracker.json::{message}` (parseable by GitHub Actions)

---

## 2. pfc-tracker-update — Skill Tests

Manual invocation scenarios. Run against a copy of `programme-tracker.json` if destructive testing is needed.

### TC-U01: add-epic — valid input

```
/pfc-tracker-update add-epic \
  --epic-id epic-99 \
  --ref "#999" \
  --title "Test Epic" \
  --status open \
  --priority P2
```
**Expected:** Epic appended to epics[]. `generated` date updated. Change summary output. CI passes on next push.

---

### TC-U02: add-epic — id already exists

```
/pfc-tracker-update add-epic \
  --epic-id epic-46reg \
  --ref "#683" \
  --title "Duplicate" \
  --status open --priority P1
```
**Expected:** Validation fails at G3. Error: `id "epic-46reg" already exists in epics[]`. File not written.

---

### TC-U03: add-epic — id pattern violation

```
/pfc-tracker-update add-epic \
  --epic-id Epic-99 \
  ...
```
**Expected:** G3 fail. Error: `id "Epic-99" does not match ^epic-[a-z0-9]+$`

---

### TC-U04: add-feature — valid input

```
/pfc-tracker-update add-feature \
  --epic-id epic-46reg \
  --feature-id F46.9 \
  --ref "#1099" \
  --title "New Feature" \
  --priority P2
```
**Expected:** Feature appended to epic-46reg.features[]. `generated` updated.

---

### TC-U05: add-feature — parent epic not found

```
/pfc-tracker-update add-feature \
  --epic-id epic-9999 \
  --feature-id F9999.1 \
  --ref "#9999" \
  --title "Orphan" \
  --priority P3
```
**Expected:** G3 fail. Error: `epic-id "epic-9999" does not exist in epics[]`. File not written.

---

### TC-U06: add-doc — valid input

```
/pfc-tracker-update add-doc \
  --filename "PFC-PBS-TEST-My-Doc-v1.0.0.md" \
  --type TEST \
  --product-code PBS \
  --epic-refs "epic-46reg" \
  --status Active
```
**Expected:** Document appended to documents[]. `generated` updated.

---

### TC-U07: add-doc — invalid type code

```
/pfc-tracker-update add-doc \
  --filename "PFC-PBS-NOTE-My-Doc-v1.0.0.md" \
  --type NOTE \
  --product-code PBS \
  --status Active
```
**Expected:** G3 fail. Error: `type "NOTE" is not a valid type code`

---

### TC-U08: add-doc — epicRef pointing to non-existent epic

```
/pfc-tracker-update add-doc \
  --filename "PFC-PBS-BRIEF-Test-v1.0.0.md" \
  --type BRIEF \
  --product-code PBS \
  --epic-refs "epic-9999"
```
**Expected:** G3 fail. Error: `epicRef "epic-9999" does not exist in epics[]`

---

### TC-U09: update-status — epic closed

```
/pfc-tracker-update update-status \
  --epic-id epic-46reg \
  --status closed
```
**Expected:** epic-46reg.status set to `closed`. `generated` updated. Change summary shows `status → "open" → "closed"`.

---

### TC-U10: update-status — invalid status for epic

```
/pfc-tracker-update update-status \
  --epic-id epic-46reg \
  --status in-progress
```
**Expected:** G3 fail. Error: `"in-progress" is not a valid epic status`

---

### TC-U11: update-status — document superseded

```
/pfc-tracker-update update-status \
  --filename "PFC-PBS-BRIEF-Document-Control-JSON-Migration-Strategy-v1.0.0.md" \
  --status Superseded
```
**Expected:** Document status updated. `generated` updated.

---

### TC-U12: update-priority — epic P0 escalation

```
/pfc-tracker-update update-priority \
  --epic-id epic-59 \
  --priority P0
```
**Expected:** epic-59.priority set to `P0`. Change summary shows old → new value.

---

### TC-U13: update-priority — on document (invalid)

```
/pfc-tracker-update update-priority \
  --filename "some-doc.md" \
  --priority P1
```
**Expected:** Skill reports: "Documents do not support priority. Use update-status for documents." No file written.

---

## 3. pfc-tracker-pdf — Skill Tests

### TC-P01: Mode both — full export

```
/pfc-tracker-pdf --mode both
```
**Expected:** HTML file created at `docs/strategy/exports/programme-tracker-both-{date}.html`. Contains both tracker section (3 groups: open/no-open/closed) and document register section (product-code groups). Version stamp present in header.

---

### TC-P02: Mode tracker — tracker only

```
/pfc-tracker-pdf --mode tracker
```
**Expected:** HTML file with Programme Tracker section only. No document register section. No page-break div.

---

### TC-P03: Mode docregister — doc register only

```
/pfc-tracker-pdf --mode docregister
```
**Expected:** HTML file with Document Register section only. Groups present for each productCode in documents[].

---

### TC-P04: Version stamp content

Open the exported HTML and verify:
```
PFC Programme Tracker | Schema v1.0.0 | Generated: {date} | Exported: {today}
```
**Expected:** All four fields present and correct.

---

### TC-P05: Cross-repo filename — no link rendered

**Fixture:** Document with `filename` starting with `pfi-w4m-eoms-dev/`
**Expected:** Rendered as plain text, no `<a>` tag.

---

### TC-P06: PBS-prefix filename — correct URL

**Fixture:** Document with `filename` = `tools/ontology-visualiser/OPERATING-GUIDE.md`
**Expected:** Link href = `https://github.com/ajrmooreuk/Azlan-EA-AAA/blob/main/tools/ontology-visualiser/OPERATING-GUIDE.md`

---

### TC-P07: Standard strategy filename — correct URL

**Fixture:** Document with `filename` = `PFC-PBS-BRIEF-My-Brief-v1.0.0.md`
**Expected:** Link href = `https://github.com/ajrmooreuk/pfc-dev/blob/main/docs/strategy/PFC-PBS-BRIEF-My-Brief-v1.0.0.md`

---

### TC-P08: Self-contained HTML — no external resources

Open the HTML export and verify:
- No `<link rel="stylesheet">` tags
- No `<script src="...">` tags
- No `<img src="http...">` tags
**Expected:** File renders correctly when opened offline (file:// URL)

---

### TC-P09: Print layout — @media print rules present

Inspect `<style>` block in the exported HTML.
**Expected:** Contains `@media print { ... }` block with `font-size: 10pt` and `.no-print { display: none }` rules.

---

## 4. CI Workflow Tests (pfc-tracker-validate.yml)

### TC-CI01: Clean push — workflow passes

**Setup:** Push a valid change to `programme-tracker.json` (e.g. `generated` date update)
**Expected:** Both steps pass, step summary shows epic + document counts

---

### TC-CI02: Invalid JSON committed — workflow fails

**Setup:** Commit a version of `programme-tracker.json` with a syntax error
**Expected:** Step 1 ("Validate JSON parse") fails with `::error` annotation. Build blocked.

---

### TC-CI03: Schema violation committed — workflow fails

**Setup:** Commit a version with an invalid enum value in an epic's status
**Expected:** Step 2 ("Run schema + integrity validation") fails. `::error` annotation on the specific field. Build blocked.

---

### TC-CI04: Orphan epicRef committed — workflow fails

**Setup:** Add a document with `epicRefs: ["epic-9999"]` (non-existent)
**Expected:** Step 2 fails. Error: orphan ref annotation. Build blocked.

---

### TC-CI05: Open feature in closed epic — warning only

**Setup:** Set an epic to `closed` while leaving one feature as `open`
**Expected:** Step 2 exits 0. `::warning` annotation for the open feature. Build NOT blocked.

---

### TC-CI06: Workflow_dispatch — manual trigger

**Setup:** Go to Actions → Programme Tracker Validation → Run workflow
**Expected:** Workflow runs on demand, passes on current main branch state.

---

## 5. Test Matrix Summary

| Test | Scope | Type | Expected outcome |
|------|-------|------|-----------------|
| TC-V01 | validate-tracker | Auto (CI) | PASS — live data |
| TC-V02–V03 | validate-tracker | Manual fixture | FAIL with error |
| TC-V04–V12 | validate-tracker | Manual fixture | FAIL with specific error |
| TC-V13–V15 | validate-tracker | Manual fixture | FAIL / PASS / PASS |
| TC-V16 | validate-tracker | Manual fixture | WARNING, not FAIL |
| TC-V17–V18 | validate-tracker | Manual fixture | Multi-error / annotation format |
| TC-U01 | pfc-tracker-update | Manual invocation | Write + report |
| TC-U02–U03 | pfc-tracker-update | Manual invocation | G3 fail, no write |
| TC-U04–U05 | pfc-tracker-update | Manual invocation | Write / G3 fail |
| TC-U06–U08 | pfc-tracker-update | Manual invocation | Write / G3 fail |
| TC-U09–U13 | pfc-tracker-update | Manual invocation | Status/priority updates |
| TC-P01–P09 | pfc-tracker-pdf | Manual invocation | HTML output checks |
| TC-CI01–CI06 | CI workflow | GitHub Actions | Pass/fail/warning assertions |
