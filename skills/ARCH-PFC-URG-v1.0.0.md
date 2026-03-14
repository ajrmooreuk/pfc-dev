> ✅ **PFC-Dev Copy** | Sourced from [Azlan-EA-AAA](https://github.com/ajrmooreuk/pfc-dev/blob/main/skills/ARCH-PFC-URG-v1.0.0.md) on 2026-03-14. Canonical version lives in the Azlan monorepo.

# URG Programme Management Skills — Architecture v1.0.0

**Date:** 2026-03-11 | **Status:** Implemented | **Epic:** 46 (#683) F46.3 (#686)

> Consolidated architecture for the URG Programme Management skill family: pfc-tracker-update, pfc-tracker-pdf, pfc-tracker-validate. Per-skill behaviour: see [SKILL.md](pfc-tracker-update/SKILL.md) in each skill directory.

---

## 1. System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                  URG Programme Management Skill Family (Phase 3)             │
│                                                                             │
│  Source of Record                                                           │
│  ──────────────                                                             │
│  programme-tracker.json ──► programme-tracker.schema.json (Draft-07)       │
│  (68 epics | 147 docs)        (validation rules)                           │
│                                                                             │
│  Mutate                  Export                   Validate                  │
│  ──────                  ──────                   ────────                  │
│  pfc-tracker-update      pfc-tracker-pdf           pfc-tracker-validate     │
│  (SKILL_STANDALONE)      (SKILL_STANDALONE)        (SKILL_STANDALONE + CI) │
│                                                                             │
│  Operations:             Modes:                   Checks:                  │
│  · add-epic              · tracker                · 18-point schema        │
│  · add-feature           · docregister            · enum validation        │
│  · add-doc               · both                   · id patterns + uniq     │
│  · update-status         · self-contained HTML     · orphan epicRefs        │
│  · update-priority       · version-stamped         · open features/closed  │
│                          · @media print            · CI workflow            │
│                                                                             │
│  ── JSON is always the system of record. HTML/PDF = point-in-time view. ── │
│                                                                             │
│  Workbench Panels (S.URG.4 + S.URG.5)                                      │
│  ────────────────────────────────────                                       │
│  panel-renderer.js (browser ES module)                                     │
│  · Programme Tracker Panel  (#programme-tracker-content)                   │
│  · Document Register Panel  (#document-register-content)                   │
│  Both panels fetch programme-tracker.json at runtime (cache-busted)        │
│                                                                             │
│  CI Pipeline                                                                │
│  ──────────                                                                 │
│  push/PR touching tracker JSON                                              │
│       │                                                                     │
│       ▼                                                                     │
│  pfc-tracker-validate.yml                                                   │
│       │                                                                     │
│       ├── Step 1: JSON parse check (fast-fail)                              │
│       ├── Step 2: validate-tracker.mjs (18 checks, annotations)            │
│       └── Step 3: GitHub step summary (epic/doc counts)                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Data Model

### programme-tracker.json

Top-level structure:

```json
{
  "schemaVersion": "1.0.0",
  "generated": "2026-03-11",
  "epics": [ <EpicEntry>... ],
  "documents": [ <DocumentEntry>... ]
}
```

#### EpicEntry

```json
{
  "id": "epic-46reg",           // ^epic-[a-z0-9]+$ — globally unique
  "ref": "#683",                // GitHub issue reference
  "title": "URG Registry",
  "status": "open",             // open | no-open-features | closed
  "priority": "P1",             // P0 | P1 | P2 | P3 | —
  "features": [ <FeatureEntry>... ],
  "docs": []
}
```

#### FeatureEntry (nested in epic.features[])

```json
{
  "id": "F46.3",                // ^F[A-Za-z0-9.]+$ — unique per parent epic
  "ref": "#686",
  "title": "Skills Register",
  "status": "open",             // open | closed | residual
  "priority": "P1"
}
```

#### DocumentEntry (flat array in documents[])

```json
{
  "filename": "PFC-PBS-BRIEF-My-Brief-v1.0.0.md",
  "type": "BRIEF",              // 23 valid type codes (see schema)
  "productCode": "PBS",
  "epicRefs": ["epic-46reg"],   // referential integrity enforced by CI
  "status": "Active"            // Active | Draft | Superseded | Proposal | Open
}
```

---

## 3. Classification Decisions

| Skill | Dtree Path | Score | Rationale |
|-------|-----------|-------|-----------|
| pfc-tracker-update | HG-01 PASS (5.0) → HG-03 FAIL (2.5) | SKILL_STANDALONE | Structured mutation workflow, single-concern, always user-driven |
| pfc-tracker-pdf | HG-01 PASS (4.5) → HG-03 FAIL (2.5) | SKILL_STANDALONE | Deterministic render, no orchestration, no external calls |
| pfc-tracker-validate | HG-01 PASS (3.5) → HG-03 FAIL (2.0) | SKILL_STANDALONE | Deterministic checks, embedded CI script, no state mutation |

None are AGENT_STANDALONE — all are single-concern, single-operation skills. An orchestrator is not needed because the three skills compose linearly (update → validate → pdf) with no conditional branching.

---

## 4. Design Decisions

### D-URG-01: JSON as Single Source of Record

**Decision:** All programme and document metadata lives in `programme-tracker.json`. The old MD files (`PFC-STRAT-IDX-Strategy-Briefings.md` and the Epic & Feature Tracker MD) are replaced by JSON.

**Rationale:** JSON is machine-readable, schema-validatable, CI-checkable, and renderable to any target format (HTML, PDF, visualiser panels). Markdown requires manual maintenance and cannot be validated programmatically.

**Consequence:** The JSON file must never be edited by hand without going through `pfc-tracker-update` (which validates inputs against the schema before writing).

### D-URG-02: Flat Documents Array

**Decision:** Documents are stored as a flat array in `documents[]`, cross-referenced to epics via `epicRefs[]`. They are NOT nested inside epic objects.

**Rationale:** Documents often span multiple epics, and nesting would require duplication. The flat model with epicRefs array supports many-to-many relationships. Referential integrity is enforced by `pfc-tracker-validate`.

**Consequence:** Orphan epicRef detection is a mandatory CI check (FAIL not WARNING).

### D-URG-03: Schema Draft-07 (not Draft 2020-12)

**Decision:** `programme-tracker.schema.json` uses JSON Schema Draft-07.

**Rationale:** Draft-07 is universally supported (ajv, Node.js inline, all CI environments) without version-lock issues. The schema complexity does not require the additional features in Draft 2020-12.

### D-URG-04: No Build Step for Validation

**Decision:** `validate-tracker.mjs` uses only Node.js built-ins (`fs`, `path`, `url`). No npm dependencies.

**Rationale:** Keeps CI fast (no `npm install` step). The 18 validation checks are implementable with pure JS. AJV would add an npm dependency for marginal benefit given the inline enum sets match the schema exactly.

### D-URG-05: Visualiser Panels Fetch at Runtime (No Build Step)

**Decision:** `panel-renderer.js` fetches `programme-tracker.json` at panel-open time with cache-busting (`?t={timestamp}`).

**Rationale:** The visualiser is zero-build. Inlining the JSON would require a build step. Runtime fetch with cache-busting ensures the panel always shows the latest committed data when served via HTTP.

### D-URG-06: Open Features in Closed Epics = WARNING not FAIL

**Decision:** `pfc-tracker-validate` emits a `::warning` (not `::error`) when it finds `open` features inside `closed` epics.

**Rationale:** This is a data quality issue, not a structural violation. A team may legitimately have residual open features in a closed epic. Blocking CI on this would be too aggressive. The `residual` status exists precisely for this case and should be used instead of `open`.

---

## 5. Skill Interaction Pattern

Typical daily workflow:

```
1. New epic created in GitHub (via pfc-efs)
   → /pfc-tracker-update add-epic --epic-id epic-70 --ref "#1020" ...
   → pfc-tracker-validate.yml runs (CI)

2. New strategy document added to docs/strategy/
   → /pfc-tracker-update add-doc --filename "PFC-PBS-BRIEF-*.md" ...
   → pfc-tracker-validate.yml runs (CI)

3. Epic closed out (via close-out skill)
   → /pfc-tracker-update update-status --epic-id epic-X --status closed
   → (for each open feature) update-status --status closed

4. Before a programme review meeting
   → /pfc-tracker-pdf --mode both --open
   → Print to PDF from browser

5. Ad-hoc validation check
   → /pfc-tracker-validate
```

---

## 6. File Inventory

| File | Type | Purpose |
|------|------|---------|
| `docs/strategy/programme-tracker.json` | Data | Source of record — all epics, features, documents |
| `docs/strategy/programme-tracker.schema.json` | Schema | JSON Schema Draft-07 — validation rules |
| `skills/pfc-tracker-update/SKILL.md` | Skill | Mutation operations |
| `skills/pfc-tracker-pdf/SKILL.md` | Skill | HTML/PDF export |
| `skills/pfc-tracker-validate/SKILL.md` | Skill | Manual validation |
| `.github/workflows/pfc-tracker-validate.yml` | CI | Automated validation on push/PR |
| `.github/scripts/validate-tracker.mjs` | Script | 18-check validation engine |
| `tools/ontology-visualiser/js/panel-renderer.js` | Browser ES module | Visualiser panels (tracker + doc register) |

---

## 7. Cross-References

| Artefact | Relationship |
|----------|-------------|
| `pfc-efs` (Entry-SKL-001) | Upstream — generates epics/features that pfc-tracker-update registers |
| `close-out` skill | Consumer — uses pfc-tracker-update to mark epics/features closed |
| `oaa-v7-validate.yml` | Sibling CI workflow — same trigger pattern for ontology files |
| Epic 46 #683 | Home epic for URG initiative |
| F46.3 #686 | Parent feature for all URG Phase 3 skills |
| S.URG.9 #1015 | Next phase — DOC-ONT scoping (Document & Programme Control Ontology) |
