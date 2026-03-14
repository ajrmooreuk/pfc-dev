> ✅ **PFC-Dev Copy** | Sourced from [Azlan-EA-AAA](https://github.com/ajrmooreuk/pfc-dev/blob/main/skills/OPERATING-GUIDE-PFC-URG-v1.0.0.md) on 2026-03-14. Canonical version lives in the Azlan monorepo.

# URG Programme Management Skills — Operating Guide v1.0.0

**Date:** 2026-03-11 | **Status:** Active | **Epic:** 46 (#683) F46.3 (#686)

> Day-to-day operating procedures for the URG Programme Management skill family. For architecture and data model: see [ARCH-PFC-URG-v1.0.0.md](ARCH-PFC-URG-v1.0.0.md).

---

## 1. Quick Reference

| Task | Skill | Command Pattern |
|------|-------|----------------|
| Add a new epic | `pfc-tracker-update` | `add-epic --epic-id epic-N --ref "#N" --title "..." --status open --priority P1` |
| Add a feature to an epic | `pfc-tracker-update` | `add-feature --epic-id epic-N --feature-id FN.x --ref "#N" --title "..."` |
| Add a strategy document | `pfc-tracker-update` | `add-doc --filename "PFC-*.md" --type BRIEF --product-code PBS --status Active` |
| Close an epic | `pfc-tracker-update` | `update-status --epic-id epic-N --status closed` |
| Close a feature | `pfc-tracker-update` | `update-status --epic-id epic-N --feature-id FN.x --status closed` |
| Supersede a document | `pfc-tracker-update` | `update-status --filename "PFC-*.md" --status Superseded` |
| Change priority | `pfc-tracker-update` | `update-priority --epic-id epic-N --priority P0` |
| Validate before committing | `pfc-tracker-validate` | `/pfc-tracker-validate` |
| Export for a meeting | `pfc-tracker-pdf` | `/pfc-tracker-pdf --mode both --open` |
| Tracker only (no docs) | `pfc-tracker-pdf` | `/pfc-tracker-pdf --mode tracker --open` |
| Document register only | `pfc-tracker-pdf` | `/pfc-tracker-pdf --mode docregister --open` |

---

## 2. Standard Operating Procedures

### SOP-URG-01: Creating a New Epic

Trigger: A new GitHub epic issue is created (typically via `pfc-efs`).

1. Note the epic's GitHub issue number and title from the `pfc-efs` output or `gh issue view`
2. Determine the epic ID — must match `^epic-[a-z0-9]+$`. Convention: `epic-{n}` where n is the issue number, or `epic-{n}{suffix}` if disambiguating (e.g. `epic-46reg`, `epic-46fra`)
3. Run:
   ```
   /pfc-tracker-update add-epic \
     --epic-id epic-{n} \
     --ref "#{issue-number}" \
     --title "{epic title}" \
     --status open \
     --priority {P0|P1|P2|P3|—}
   ```
4. If the epic has initial features known, run `add-feature` for each (see SOP-URG-02)
5. Commit with: `feat(URG): [tracker-update] add-epic — epic-{n} {title}`

### SOP-URG-02: Adding a Feature to an Epic

Trigger: A new GitHub feature issue is created under an existing epic.

1. Confirm the parent epic ID exists in `programme-tracker.json`
2. Determine feature ID — must match `^F[A-Za-z0-9.]+$` and be unique within the parent epic (e.g. `F46.5`)
3. Run:
   ```
   /pfc-tracker-update add-feature \
     --epic-id epic-{n} \
     --feature-id F{n}.{x} \
     --ref "#{issue-number}" \
     --title "{feature title}" \
     --priority {P0|P1|P2|P3|—}
   ```
4. Commit with: `feat(URG): [tracker-update] add-feature — F{n}.{x} {title}`

### SOP-URG-03: Registering a New Strategy Document

Trigger: A new `.md` document is added to `docs/strategy/` (after following the naming convention).

1. Confirm the file exists and follows `[TIER]-[PRODUCT]-[DOC-TYPE]-<Subject>-v1.0.0.md` naming
2. Identify: `type` code (BRIEF, ARCH, PLAN, etc.), `productCode` (PBS, SKBLD, etc.), and any `epicRefs`
3. Run:
   ```
   /pfc-tracker-update add-doc \
     --filename "{filename}.md" \
     --type {TYPE} \
     --product-code {CODE} \
     --epic-refs "{epic-id1},{epic-id2}" \
     --status Active
   ```
4. Note: `docs/strategy/PFC-STRAT-IDX-Strategy-Briefings.md` is now maintained by the JSON and visualiser panel — no manual MD update required for documents registered in `programme-tracker.json`
5. Commit with: `feat(URG): [tracker-update] add-doc — {filename}`

### SOP-URG-04: Closing Out an Epic

Trigger: A close-out skill or manual process marks an epic as complete.

1. Close all open features first:
   ```
   /pfc-tracker-update update-status \
     --epic-id epic-{n} \
     --feature-id F{n}.{x} \
     --status closed
   ```
   (Repeat for each open feature, or use `residual` for carry-over work)
2. Then close the epic:
   ```
   /pfc-tracker-update update-status \
     --epic-id epic-{n} \
     --status closed
   ```
3. Run validate to confirm no orphan warnings: `/pfc-tracker-validate`
4. Commit with: `feat(URG): [tracker-update] close epic-{n} — {title}`

### SOP-URG-05: Superseding a Document

Trigger: A document is replaced by a newer version.

1. Register the new version as a new document (SOP-URG-03)
2. Mark the old document as superseded:
   ```
   /pfc-tracker-update update-status \
     --filename "{old-filename}.md" \
     --status Superseded
   ```
3. Commit both changes together

### SOP-URG-06: Exporting for a Programme Review

Trigger: Programme review meeting, stakeholder briefing, or formal distribution.

1. Run full export (both tracker + document register):
   ```
   /pfc-tracker-pdf --mode both --open
   ```
2. Browser opens automatically (`--open` flag)
3. File → Print → Save as PDF (A4 Portrait, Margins: Default)
4. The output filename will be `programme-tracker-both-{date}.html` in `docs/strategy/exports/`
5. The PDF is the distribution artefact. Do not commit the HTML or PDF to git unless required for archival purposes

### SOP-URG-07: Responding to CI Failure

Trigger: `pfc-tracker-validate.yml` fails on a push or PR.

1. Read the GitHub Actions annotations on the failing step — they include the exact field path and invalid value (e.g. `epics[3].status: "invalid-status" is not a valid value`)
2. Use `pfc-tracker-update` to fix:
   ```
   /pfc-tracker-update update-status --epic-id epic-{n} --status {valid-value}
   ```
3. Run locally before pushing: `/pfc-tracker-validate`
4. Commit the fix and push — CI will re-run automatically

---

## 3. Status Transition Rules

### Epic Status

```
open ──────────────────────────────► closed
  │                                   ▲
  └──► no-open-features ──────────────┘
```

- `open` → `no-open-features`: when all features are closed/residual but the epic is still active
- `open` / `no-open-features` → `closed`: when the epic is formally closed out
- Do NOT set a closed epic back to `open` without first reopening its features

### Feature Status

```
open ──► closed
  │
  └──► residual   (carry-over work in a closed epic)
```

- `open` → `closed`: normal close-out
- `open` → `residual`: feature work carried into another epic; parent epic can then be closed
- `residual` → `closed`: when carried-over work completes

### Document Status

```
Draft ──► Active ──► Superseded
  │
  └──► Proposal ──► Active
```

- New documents typically start as `Active` (if published) or `Draft` (if in progress)
- `Superseded` is permanent — do not reactivate a superseded document, register a new version instead

---

## 4. Priority Reference

| Code | Meaning | Typical use |
|------|---------|-------------|
| `P0` | Critical / blocking | Production issues, regulatory deadlines |
| `P1` | High | Active sprint work, imminent milestones |
| `P2` | Medium | Planned work, next quarter |
| `P3` | Low | Backlog, nice-to-have |
| `—` | Not prioritised | Parked, deferred, no timeline |

---

## 5. Document Type Codes

| Code | Full Name | Typical Use |
|------|-----------|-------------|
| `BRIEF` | Briefing | Strategy briefings, initiative briefs |
| `ARCH` | Architecture | System/capability architecture docs |
| `PLAN` | Plan | Project plans, roadmaps |
| `OPS` | Operating Guide | Day-to-day operating procedures (this document) |
| `REL` | Release Bulletin | Capability release notes |
| `RPT` | Report | Audit reports, analysis reports |
| `IDX` | Index | Registers, catalogues, indexes |
| `STD` | Standard | Naming conventions, coding standards |
| `GUIDE` | Guide | User guides, how-to documents |
| `TDG` | Technical Design | Technical design specs |
| `TEST` | Test Plan | Test plans and test results |
| `PROP` | Proposal | Business cases, proposals |
| `DD` | Decision Document | Architecture decision records |
| `SOA` | Statement of Architecture | Formal EA statements |
| `STATUS` | Status Report | Progress/status updates |
| `CONVERGENCE` | Convergence Note | Cross-epic alignment notes |
| `DISCUSSION` | Discussion Document | Working papers, discussion docs |
| `TRAINING` | Training Material | Training content |
| `OPERATING-GUIDE` | Operating Guide (alternate) | Used for tool-specific guides |
| `SLIDEDECK` | Slide Deck | PPTX/PDF presentation decks |
| `CATALOGUE` | Catalogue | Asset catalogues |
| `MANIFEST` | Manifest | File/deployment manifests |
| `OTHER` | Other | Does not fit any above category |

---

## 6. Common Errors and Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `id "epic-123" does not match ^epic-[a-z0-9]+$` | Epic ID contains uppercase or special chars | Use lowercase only: `epic-123` |
| `duplicate epic id` | Two epics with the same ID | Choose a unique suffix: `epic-46reg` vs `epic-46fra` |
| `epicRef "epic-99" not found in epics[]` | Document references a non-existent epic | Add the epic first, or remove the epicRef |
| `"invalid-type" is not a valid type code` | Unknown document type | Check type code table above |
| `open feature inside closed epic` (warning) | Epic closed but features not updated | Set features to `closed` or `residual` |
| `JSON parse failed` | programme-tracker.json is malformed | Check for trailing commas, unclosed brackets |

---

## 7. Related Documents

| Document | Path |
|----------|------|
| Architecture | `skills/ARCH-PFC-URG-v1.0.0.md` |
| Test Plan | `skills/TEST-PLAN-PFC-URG-v1.0.0.md` |
| pfc-tracker-update SKILL.md | `skills/pfc-tracker-update/SKILL.md` |
| pfc-tracker-pdf SKILL.md | `skills/pfc-tracker-pdf/SKILL.md` |
| pfc-tracker-validate SKILL.md | `skills/pfc-tracker-validate/SKILL.md` |
| URG Brief | `docs/strategy/PFC-PBS-BRIEF-Document-Control-JSON-Migration-Strategy-v1.0.0.md` |
