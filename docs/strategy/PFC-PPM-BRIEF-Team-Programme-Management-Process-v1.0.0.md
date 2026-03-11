# PFC-PPM-BRIEF-Team-Programme-Management-Process-v1.0.0

**Product Code:** PFC-PPM
**Doc Type:** BRIEF (Team Briefing)
**Version:** 1.0.0
**Date:** 2026-03-11
**Status:** Active — For Team Review and Buy-In
**Audience:** All PFI leads, contributors, and stakeholders
**Epic Ref:** [Epic 61 (#947)](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/947), [F61.14 (#1000)](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/1000)

---

## Why This Matters

Before today, work across PFC and all PFI instances lived in disconnected backlogs with no coherent programme view. Issues sat in repos, epics had no portfolio context, and there was no consistent answer to "what are we working on, why, and for whom?"

This briefing explains how we've fixed that — and what it means for how we work going forward.

---

## The Model: Portfolio → Programme → Project

We use a standard three-tier programme management hierarchy, backed by our own PPM-ONT ontology and mirrored in GitHub Projects.

```
Portfolio
  └── Programme
        └── Project(s)
```

Think of it this way:

| Tier | What it is | Example |
|---|---|---|
| **Portfolio** | The collection of everything we're building and why | "PFC Platform Foundation Portfolio" |
| **Programme** | A PFI instance — a coherent set of delivery for a specific domain or client | "PFI-W4M Programme", "PFI-AIRL Programme" |
| **Project** | A specific product, phase, or client engagement within a programme | "W4M-WWG", "W4M-EOMS", "AIRL-CAFHUB" |

This maps directly to the **EMC cascade** you already know:

```
PFC (Core Platform)
  └── PFI (Instance — e.g. W4M, BAIV, AIRL)
        └── Product (e.g. WWG, EOMS, CAFHUB)
              └── Client (e.g. a specific client engagement)
```

Each tier has its own GitHub Project board, its own backlog, and its own governance scope. They are **connected, not flattened**.

---

## What We've Built

### Six New GitHub Project Boards

| Board | Tier | Link | Tracks |
|---|---|---|---|
| PFC Portfolio | PFC | [#65](https://github.com/users/ajrmooreuk/projects/65) | Platform epics, ontology releases, cross-cutting strategy |
| PFI-W4M Programme | PFI | [#66](https://github.com/users/ajrmooreuk/projects/66) | All W4M delivery work |
| PFI-BAIV Programme | PFI | [#67](https://github.com/users/ajrmooreuk/projects/67) | All BAIV delivery work |
| PFI-AIRL Programme | PFI | [#68](https://github.com/users/ajrmooreuk/projects/68) | All AIRL delivery work |
| W4M-WWG | Product | [#69](https://github.com/users/ajrmooreuk/projects/69) | WWG product backlog |
| W4M-EOMS | Product | [#70](https://github.com/users/ajrmooreuk/projects/70) | EOMS product backlog |

Each board has consistent custom fields:

| Field | What it captures |
|---|---|
| `cascade_tier` | PFC / PFI / Product / Client |
| `pfi_instance` | Which instance this work belongs to |
| `parent_ref` | Which programme or portfolio this rolls up to |
| `priority` | P0 (critical) → P3 (nice to have) |
| `triad_env` | dev / test / prod — where the work sits in the pipeline |

### Automated Field Population

When you create or edit a GitHub issue and include these lines in the body:

```
| **PFI Instance** | `W4M` |
| **Cascade Tier** | `PFI` |
```

The `set-pbs-id.yml` workflow automatically sets those fields on the project board. No manual tagging.

### Ontology-Backed Source of Truth

Every portfolio, programme and project has a corresponding JSONLD instance data file. These are the canonical definitions — GitHub Projects is the *view*, the JSONLD is the *truth*.

---

## How We Work Now

### Starting Something New

**Before creating a project, feature, or initiative — validate it.**

We use three lenses:

| Lens | Question | Tool |
|---|---|---|
| **Voice of Customer (VoC)** | Does the customer actually want this? | VP-ONT — Problem → Solution → Benefit |
| **Voice of the Process (VoP)** | Does our platform actually support it? | PMF-ONT / Kano |
| **Voice of the Business (VoB)** | Does it create value for us? | VSOM / OKR / KPI |

If it doesn't pass at least two of the three lenses — **don't build it yet.** Add it to the portfolio as a candidate and validate first. This is the Three Voices gate.

### Raising Work

1. **Raise issues in the correct repo** — W4M work in `pfi-w4m-dev`, AIRL work in `pfi-airl-caf-aza-dev`, etc.
2. **Include `PFI Instance` and `Cascade Tier` in the issue body** — the workflow does the rest.
3. **Follow the naming convention** — `Epic N`, `FN.x`, `SN.x.y` — enforced by CI.
4. **Epics must have a PBS ID** — this is what connects issues to the ontology-backed programme structure.

### New Products or Client Engagements

If a PFI instance needs a new product project (e.g. AIRL wants to create AIRL-CAFHUB as a distinct product) or a client engagement project:

1. Validate it through Three Voices first
2. Raise the request — a new `ppm:Project` instance data file gets created
3. A new GitHub Project board is created at the correct tier
4. The triad repos (dev/test/prod) are linked — the same triad serves multiple product projects

**You do not need a new triad for every product.** The triad is the CI/CD pipeline. The programme structure lives above it.

---

## The Cascade in Practice

Here's how a piece of work flows from idea to delivery:

```
1. IDEA surfaces at any tier
        ↓
2. THREE VOICES GATE — does it pass VoC, VoP, VoB?
        ↓ (yes)
3. PORTFOLIO — initiative added to the correct portfolio
        ↓
4. PROGRAMME — epics raised in the PFI's GitHub Project (e.g. PFI-AIRL #68)
        ↓
5. PROJECT — features and stories in the product/client project board (e.g. AIRL-CAFHUB)
        ↓
6. TRIAD — dev work in pfi-airl-caf-aza-dev → promote to test → promote to prod
        ↓
7. RELEASE — pfc-release.yml distributes validated artefacts back to PFI
```

At every tier, the work is traceable — from the strategic objective (VSOM/OKR) down to the GitHub story and the code commit.

---

## Who Owns What

| Tier | Owner | Responsibility |
|---|---|---|
| PFC Portfolio | Amanda | Platform strategy, ontology library, cross-PFI governance |
| PFI-W4M Programme | W4M lead | W4M delivery backlog, instance configuration |
| PFI-BAIV Programme | BAIV lead | BAIV delivery backlog, instance configuration |
| PFI-AIRL Programme | AIRL lead | AIRL delivery backlog, instance configuration |
| W4M-WWG / EOMS | Product leads | Product-specific backlogs, sprint planning |
| RCS | Alex | RCS instance — same pattern, separate board when needed |

---

## What's Coming Next (Phase 3)

These are the remaining items — they will be completed next sprint:

- **PFI Instance Lifecycle process definition** — a formal `pe:ProcessPath` that defines the steps to spin up a new PFI instance, from activation through to first production release
- **Three Voices scoring template** — a reusable checklist to validate new initiatives at portfolio level before they enter any backlog
- **PMF/Kano validation checklist** — for product-tier projects specifically, to confirm market fit before committing delivery resource

---

## Key Links

| Resource | Link |
|---|---|
| Full technical briefing (v2.0.0) | [PFC-PPM-BRIEF-GitHub-Projects-PFI-Programme-Management-v2.0.0.md](https://github.com/ajrmooreuk/Azlan-EA-AAA/blob/main/PBS/STRATEGY/PFC-PPM-BRIEF-GitHub-Projects-PFI-Programme-Management-v2.0.0.md) |
| PFC Portfolio board | [#65](https://github.com/users/ajrmooreuk/projects/65) |
| PFI-AIRL Programme board | [#68](https://github.com/users/ajrmooreuk/projects/68) |
| PFI-BAIV Programme board | [#67](https://github.com/users/ajrmooreuk/projects/67) |
| PFI-W4M Programme board | [#66](https://github.com/users/ajrmooreuk/projects/66) |
| PPM instance data | [PE-Series/PPM-ONT/instance-data/](https://github.com/ajrmooreuk/Azlan-EA-AAA/tree/main/PBS/ONTOLOGIES/ontology-library/PE-Series/PPM-ONT/instance-data) |
| F61.14 implementation issue | [#1000](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/1000) |

---

*PFC-PPM-BRIEF-Team-Programme-Management-Process-v1.0.0 — 2026-03-11*
