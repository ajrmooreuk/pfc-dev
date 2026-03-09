# Epic 49: VSOM Skilled Application Planner — Feature & Story Index

| Field | Value |
|---|---|
| **Epic** | [#747](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/747) |
| **Status** | ACTIVE |
| **Date** | 2026-03-04 |
| **Features** | 13 (2 complete, 11 backlog) |
| **Stories** | 44+ |

---

## Quick Links

- [Epic Issue #747](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/747)
- [Architecture: Skeleton-Application-Specification-Framework](ARCH-Skeleton-Application-Specification-Framework.md)
- [Architecture: PFC-PFI-Product-Client-Graph-Cascade](ARCH-PFC-PFI-Product-Client-Graph-Cascade.md)
- [Briefing: F49.9 Figma-Pencil Design Tooling Strategy](BRIEFING-F49.9-Figma-Pencil-Design-Tooling-Strategy.md)

---

## Feature Summary

| # | Feature | Issue | Stories | Status | Phase |
|---|---------|-------|:-------:|--------|-------|
| F49.1 | DS-ONT v3.1.0 + PPM-ONT v4.1.0 Schema Extensions | — | 3 | Backlog | 1: Schema |
| F49.2 | pfc-ppm-plan — PPM Project Plan Skill | — | 3 | Backlog | 2: Skills |
| F49.3 | pfc-efs PPM Integration | — | 3 | Backlog | 2: Skills |
| F49.4 | Zone CRUD Operations in Skeleton Editor | — | 3 | Backlog | 1: Schema |
| F49.5 | pfc-zone-allocator — EFS to Skeleton Zone Allocation | — | 4 | Backlog | 2: Skills |
| F49.6 | pfc-gh-triad — GitHub Triad Configurator | — | 3 | Backlog | 3: Compose |
| F49.7 | pfc-spec-composer — Application Specification Composer | — | 3 | Backlog | 3: Compose |
| F49.8 | E2E Validation — W4M-WWG Full Chain | — | 2 | Backlog | 4: Validate |
| F49.9 | Design Tooling Strategy — Figma vs Pencil | [#766](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/766) | 5 | Backlog | UI/UX |
| F49.10 | KANO-ONT — Customer Satisfaction Classification | [#816](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/816) | 7 | ✅ Done | VE-SA |
| F49.11 | Kano Analysis Visualisation | [#817](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/817) | TBD | Backlog | VE-SA |
| F49.12 | Close-Out Skill — Post-Change Housekeeping Pipeline | [#818](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/818) | 1 | ✅ Done | Cross-cutting |
| **F49.13** | **Navigation Zone Redistribution — UI/UX Layer Cleanup** | [**#825**](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/825) | **7** | **ACTIVE** | **UI/UX** |

---

## Implementation Phases

```
Phase 1: Schema Foundation          Phase UI/UX: Navigation (TODAY)
  F49.1 — Schema extensions           F49.13 — Zone redistribution ← START HERE
  F49.4 — Zone CRUD                   F49.9  — Figma/Pencil strategy

Phase 2: Core Skills                Phase 3: Composition & Delivery
  F49.2 — pfc-ppm-plan                F49.6 — pfc-gh-triad
  F49.3 — pfc-efs PPM integration     F49.7 — pfc-spec-composer
  F49.5 — pfc-zone-allocator

Phase 4: Validation                 Standalone
  F49.8 — E2E W4M-WWG                 F49.10 — KANO-ONT ✅
                                       F49.11 — Kano visualisation
                                       F49.12 — Close-out skill ✅
```

**Critical path:** F49.13 → F49.4 → F49.1 → F49.2 → F49.3 → F49.5 → F49.7 → F49.8

---

## Detailed Feature & Story Index

---

### F49.13: Navigation Zone Redistribution — UI/UX Layer Cleanup ← ACTIVE
**Issue:** [#825](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/825) | **Blocks:** F49.4, F49.9, Application Builder

Z2 has 41 nav items — must redistribute to dedicated zones before building the application layer.

**Target:** Z2 drops from 41 → 18 items (56% reduction)

| New Zone | Purpose | Items Moving |
|----------|---------|:------------:|
| Z-source | Source/load panel (dropdown) | 7 |
| Z-admin | Admin drawer (gear icon) | 6 |
| Z3 | PFI context bar | 5 |
| Z-context | Secondary context bar | 3 |

| Story | Title | Issue | Depends | Status |
|-------|-------|-------|---------|--------|
| S49.13.1 | Define Z-source, Z-admin, Z-context zones in skeleton JSONLD | [#826](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/826) | None | ⬜ |
| S49.13.2 | Move source/load items (7) to Z-source panel | [#827](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/827) | S49.13.1 | ⬜ |
| S49.13.3 | Move admin items (6) to Z-admin drawer | [#828](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/828) | S49.13.1 | ⬜ |
| S49.13.4 | Move PFI context items (5) to Z3 context identity bar | [#829](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/829) | None | ⬜ |
| S49.13.5 | Move secondary context items (3) to Z-context zone | [#830](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/830) | S49.13.1 | ⬜ |
| S49.13.6 | CSS/layout for new zones — panels, drawers, transitions | [#831](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/831) | S49.13.1–3 | ⬜ |
| S49.13.7 | Update tests — zone assignment, visibility, action wiring | [#832](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/832) | S49.13.2–6 | ⬜ |

**Implementation order:** S49.13.1 first → S49.13.2 + S49.13.3 + S49.13.4 + S49.13.5 in parallel → S49.13.6 → S49.13.7

---

### F49.9: Design Tooling Strategy — Figma vs Pencil Platform Impact
**Issue:** [#766](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/766) | **Briefing:** [BRIEFING-F49.9](BRIEFING-F49.9-Figma-Pencil-Design-Tooling-Strategy.md)

Figma = human design source of truth. Pencil = agentic design execution engine.

| Story | Title | Issue | Depends | Status |
|-------|-------|-------|---------|--------|
| S49.9.1 | Define `.pen` template convention for PFI zones | — | — | ⬜ |
| S49.9.2 | DS-ONT → Pencil token bridge specification | — | — | ⬜ |
| S49.9.3 | PoC — W4M-WWG zone layout in Pencil | — | S49.9.2, F44.1 | ⬜ |
| S49.9.4 | Token Map panel `.pen` validation extension | — | S49.9.2 | ⬜ |
| S49.9.5 | Supabase schema extension for design artefacts | — | S49.9.3 | ⬜ |

---

### F49.1: DS-ONT v3.1.0 + PPM-ONT v4.1.0 Schema Extensions
**Issue:** — (not yet created) | **Unblocks:** F49.2–F49.7

| Story | Title | Issue | Status |
|-------|-------|-------|--------|
| S49.1.1 | Add `realizesEpic`, `realizesFeatures`, `gatedByProject`, `targetMilestone`, `specStatus` to DS-ONT | — | ⬜ |
| S49.1.2 | Add `deliversEpic`, `gatesRelease`, `decomposesFeature` to PPM-ONT | — | ⬜ |
| S49.1.3 | Define JP-SPEC-001 through JP-SPEC-008 join patterns in EMC-ONT | — | ⬜ |

---

### F49.2: pfc-ppm-plan — PPM Project Plan Skill
**Issue:** — | **Depends:** F49.1

| Story | Title | Issue | Status |
|-------|-------|-------|--------|
| S49.2.1 | Implement pfc-ppm-plan SKILL.md — 8-section pipeline | — | ⬜ |
| S49.2.2 | Create registry entry Entry-SKL-011 | — | ⬜ |
| S49.2.3 | Validate against W4M-WWG (2 programmes, 4 projects, 6 milestones) | — | ⬜ |

---

### F49.3: pfc-efs PPM Integration
**Issue:** — | **Depends:** F49.1, F49.2

| Story | Title | Issue | Status |
|-------|-------|-------|--------|
| S49.3.1 | Extend pfc-efs to accept PPM project plan context | — | ⬜ |
| S49.3.2 | Add JP-EFS-PPM-001/003 join pattern resolution | — | ⬜ |
| S49.3.3 | Validate against W4M-WWG with PPM traceability | — | ⬜ |

---

### F49.4: Zone CRUD Operations in Skeleton Editor
**Issue:** — | **Depends:** F49.13

| Story | Title | Issue | Status |
|-------|-------|-------|--------|
| S49.4.1 | Add `addZone()`, `removeZone()`, `updateZoneProperty()` with PFI-tier enforcement | — | ⬜ |
| S49.4.2 | Add `addNavItem()`, `addAction()` with naming convention validation | — | ⬜ |
| S49.4.3 | Zone builder tab in Z22 skeleton panel | — | ⬜ |

---

### F49.5: pfc-zone-allocator — EFS to Skeleton Zone Allocation
**Issue:** — | **Depends:** F49.1, F49.2, F49.3

| Story | Title | Issue | Status |
|-------|-------|-------|--------|
| S49.5.1 | Implement pfc-zone-allocator SKILL.md — 8-section pipeline | — | ⬜ |
| S49.5.2 | NavItem + Action generator with `realizesFeature` binding | — | ⬜ |
| S49.5.3 | Skeleton delta output as PFI override patch | — | ⬜ |
| S49.5.4 | Validate against W4M-WWG zone allocation | — | ⬜ |

---

### F49.6: pfc-gh-triad — GitHub Triad Configurator
**Issue:** — | **Depends:** F49.3

| Story | Title | Issue | Status |
|-------|-------|-------|--------|
| S49.6.1 | Implement pfc-gh-triad SKILL.md wrapping existing GH workflow skills | — | ⬜ |
| S49.6.2 | Dry-run mode generating config JSONLD | — | ⬜ |
| S49.6.3 | Milestone mapping — PPM → GH milestones with due dates | — | ⬜ |

---

### F49.7: pfc-spec-composer — Application Specification Composer
**Issue:** — | **Depends:** F49.1, F49.5

| Story | Title | Issue | Status |
|-------|-------|-------|--------|
| S49.7.1 | Compose skeleton + EFS + PPM into Application Specification JSONLD | — | ⬜ |
| S49.7.2 | Coverage metrics (100% epic, 100% feature, 80%+ milestone) | — | ⬜ |
| S49.7.3 | Add `SCOPE_BY_EPIC/PROJECT/MILESTONE` modes to emc-composer.js | — | ⬜ |

---

### F49.8: E2E Validation — W4M-WWG Full Chain
**Issue:** — | **Depends:** All

| Story | Title | Issue | Status |
|-------|-------|-------|--------|
| S49.8.1 | Run complete pipeline — verify all output artifacts (09–15) | — | ⬜ |
| S49.8.2 | Traceability audit — every issue and zone traces end-to-end | — | ⬜ |

---

### ✅ F49.10: KANO-ONT — Customer Satisfaction Classification
**Issue:** [#816](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/816) | **Status:** DONE

7 stories — all complete. KANO-ONT added to VE-Series.

---

### F49.11: Kano Analysis Visualisation — Workbench Rendering
**Issue:** [#817](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/817) | **Depends:** F49.10

Stories TBD — Kano matrix rendering in workbench graph view.

---

### ✅ F49.12: Close-Out Skill — Post-Change Housekeeping Pipeline
**Issue:** [#818](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/818) | **Status:** DONE

| Story | Title | Issue | Status |
|-------|-------|-------|--------|
| S49.12.1 | Create close-out SKILL.md with 6-stage pipeline | — | ✅ |

---

## Today's Implementation Plan — F49.13

### Sequence

```
S49.13.1 (zones)          ← START: skeleton JSONLD + trigger items
    │
    ├── S49.13.2 (source)  ─┐
    ├── S49.13.3 (admin)   ─┤ Parallel moves
    ├── S49.13.4 (PFI→Z3)  ┤
    └── S49.13.5 (context) ─┘
              │
         S49.13.6 (CSS)
              │
         S49.13.7 (tests)
```

### Key Files

| File | Changes |
|------|---------|
| `ontology-library/PE-Series/DS-ONT/instance-data/pfc-app-skeleton-v1.0.0.jsonld` | 3 new zones, 3 new layers, 2 trigger items, 2 new actions, 21 item zone reassignments |
| `js/app-skeleton-loader.js` | New zone rendering (Z-source, Z-admin, Z-context), toggle handlers |
| `browser-viewer.html` | 3 new zone container divs |
| `css/browser-viewer.css` | Panel/drawer/bar styles for new zones |
| `test/app-skeleton-loader.test.js` | Zone assignment + visibility tests |

---

*Index v1.0.0 — 2026-03-04*
