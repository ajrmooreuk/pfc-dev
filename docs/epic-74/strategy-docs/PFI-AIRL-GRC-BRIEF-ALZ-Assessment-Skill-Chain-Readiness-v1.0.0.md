# PFI-AIRL-GRC-BRIEF: ALZ Assessment Skill Chain Readiness

**Product Code:** PFI-AIRL-GRC-BRIEF
**Version:** v1.0.0
**Date:** 2026-03-13
**Status:** Active
**Epic:** [Epic 74 (#1074)](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/1074) — F74.17, F74.18
**Skills Register:** v2.2.0 — 85 skills (46 adopted, 39 candidate)
**Author:** PFC Platform Team

---

## 1. The Question

How near or far are we — using the existing PFC skill chain (85 skills) plus the new Epic 74 azure-skills integration — from being able to run the full ALZ assessment pipeline end-to-end?

**Pipeline:** Audit Extraction → Assessment → Review → Document → Conclude → Roadmap → Continuous Assurance

---

## 2. The Full ALZ Assessment Skill Chain

### 2.1 End-to-End Pipeline — Skills Required at Each Stage

```text
STAGE 1: ENGAGE & SCOPE          STAGE 2: DISCOVER & EXTRACT
─────────────────────────         ──────────────────────────
pfc-org-context      ✅ adopted   azure-resource-lookup    🔵 NEW (MCP)
pfc-ctx              ✅ adopted   azure-prepare            🔵 NEW (MCP)
pfc-org-mat          ✅ adopted   azure-validate           🔵 NEW (MCP)
pfc-vsom             ✅ adopted   azure-compliance         🔵 NEW (MCP)
pfc-okr              ✅ adopted   azure-rbac               🔵 NEW (MCP)
pfc-kpi              ✅ adopted   azure-diagnostics        🔵 NEW (MCP)
pfc-vp               ✅ adopted   azure-kusto              🔵 NEW (MCP)
pfc-kano             ✅ adopted   azure-resource-visualizer🔵 NEW (MCP)
pfc-voc              ✅ adopted
pfc-delta-scope      ✅ adopted
pfc-foundation-pipeline ✅ adopted

STAGE 3: ASSESS & SCORE          STAGE 4: ANALYSE & CORRELATE
────────────────────────          ────────────────────────────
pfc-alz-assess-waf   🟡 scaffold  pfc-gap-analysis         🟠 candidate
pfc-alz-assess-caf   🟡 scaffold  pfc-reason-decompose     🟠 candidate
pfc-alz-assess-cyber 🟡 scaffold  pfc-crt                  ✅ adopted (dir exists)
pfc-alz-assess-health🟡 scaffold  pfc-bsc-align            🟠 candidate
pfc-maturity-assess  🟠 candidate cross-framework plugin   🔴 NOT STARTED
                                   rmf-scorer plugin        🔴 NOT STARTED
                                   risk-profile             🟠 candidate
                                   risk-score               🟠 candidate

STAGE 5: STRATEGISE & ROADMAP    STAGE 6: DOCUMENT & PRESENT
─────────────────────────────     ─────────────────────────────
pfc-alz-strategy     🔴 NEW      pfc-narrative             ✅ adopted
pfc-benefit-realisation 🟠 candidate  pfc-slide-engine     ✅ adopted
pfc-cost-model       🟠 candidate pfc-vizstrat             ✅ adopted
pfc-resource-profile 🟠 candidate pfc-strategy-deck-composer ✅ adopted
pfc-ve-prioritise    🟠 candidate pfc-proposal-composer    ✅ adopted
pfc-value-calc       ✅ adopted   pfc-cascade-translate    🟠 candidate
risk-report          🟠 candidate pfc-narrative-craft      🟠 candidate
pfc-portfolio-assess 🟠 candidate risk-report              🟠 candidate

STAGE 7: CONTINUOUS ASSURANCE
──────────────────────────────
pfc-spc              ✅ adopted (dir exists)
azure-compliance     🔵 NEW (MCP, recurring)
azure-validate       🔵 NEW (MCP, recurring)
risk-update          🟠 candidate
pfc-tracker-update   ✅ adopted
```

### 2.2 Readiness Summary

| Stage | Skills Needed | Adopted | Candidate | Scaffold | New/MCP | Not Started | Readiness |
|---|---|---|---|---|---|---|---|
| 1. Engage & Scope | 11 | **11** | 0 | 0 | 0 | 0 | **100%** |
| 2. Discover & Extract | 8 | 0 | 0 | 0 | **8** | 0 | **0%** (needs MCP) |
| 3. Assess & Score | 5 | 0 | **1** | **4** | 0 | 0 | **0%** (scaffold only) |
| 4. Analyse & Correlate | 8 | **1** | **5** | 0 | 0 | **2** | **12%** |
| 5. Strategise & Roadmap | 8 | **1** | **6** | 0 | **1** | 0 | **12%** |
| 6. Document & Present | 8 | **5** | **3** | 0 | 0 | 0 | **62%** |
| 7. Continuous Assurance | 5 | **2** | **1** | 0 | **2** | 0 | **40%** |
| **TOTAL** | **53** | **20** | **16** | **4** | **11** | **2** | **~38%** |

### 2.3 What This Means

**Good news:**
- Stage 1 (Engage & Scope) is **100% ready** — all VE/FDN skills are adopted and working
- Stage 6 (Document & Present) is **62% ready** — narrative, slides, proposals all adopted
- Stage 7 (Continuous Assurance) is **40%** — SPC and tracker skills exist
- The skill chain *architecture* is proven (VE pipeline, DELTA pipeline, DMAIC-VE all work)

**The gaps:**
- Stage 2 (Extract) is entirely dependent on **azure-skills MCP** — zero PFC skills here, but Microsoft provides them
- Stage 3 (Assess & Score) has scaffolds but no implementation yet
- Stage 4 (Analyse) and Stage 5 (Strategise) have the right candidates but they're not adopted
- Two plugins (cross-framework, rmf-scorer) don't exist at all yet
- The new `pfc-alz-strategy` skill needs to be defined

**Critical path:** Azure MCP Server access → Stage 2 unblocked → Stage 3 can be built → everything else follows.

---

## 3. The Missing Piece: pfc-alz-strategy (F74.17)

### 3.1 Purpose

`pfc-alz-strategy` is the **strategy analysis, consulting, and roadmap skill** — it sits between assessment (what's wrong) and delivery (how to fix it). It's the skill that makes the assessment commercially valuable:

- Takes scored assessment findings from Stages 3–4
- Applies DMAIC backcasting from desired destination
- Produces comparative gap analysis (current → desired → best practice)
- Creates backcasted OKR framework (what success looks like, measured)
- Generates resource and capability analysis (what it takes to get there)
- Projects benefits realisation timeline (when value is delivered)
- Outputs a consulting-grade roadmap with phased recommendations

### 3.2 Skill Chain Position

```text
pfc-alz-assess-*  →  pfc-alz-strategy  →  pfc-narrative / pfc-slide-engine
(what's wrong)        (what to do)          (how to present it)
     │                     │                      │
     │                     ├─ pfc-okr (target OKRs)
     │                     ├─ pfc-kpi (success metrics)
     │                     ├─ pfc-value-calc (ROI)
     │                     ├─ pfc-benefit-realisation (timeline)
     │                     ├─ pfc-cost-model (investment)
     │                     ├─ pfc-resource-profile (team/capability)
     │                     ├─ risk-profile + risk-score (residual risk)
     │                     └─ pfc-ve-prioritise (what matters most)
     │                     │
     └─────────────────────┘
        Cross-ref: findings → recommendations → OKRs → benefits
```

### 3.3 What pfc-alz-strategy Produces

| Output | Content | Consumer |
|---|---|---|
| **Comparative Gap Analysis** | Current vs. Desired vs. Best Practice per domain, scored, visualised | Client CTO/CISO |
| **Backcasted OKR Framework** | Objectives reverse-engineered from desired destination, KRs with measurable targets | Client programme team |
| **Resource & Capability Plan** | Skills needed, team composition, training requirements, timeline | Client HR/L&D, AIRL delivery |
| **Benefits Realisation Schedule** | Phase-by-phase value delivery, cumulative ROI, payback period | Client CFO/Board |
| **Investment Model** | Cost per phase (Azure spend + consulting + internal effort) | Client procurement |
| **Risk Reduction Trajectory** | RMF risk score projection per phase, residual risk at destination | Client CISO/DPO |
| **Phased Roadmap** | Backcasted phases with dependencies, milestones, decision gates | Client programme team |
| **Executive Recommendation** | 1-page: current state, destination, path, investment, ROI, risk | Client C-suite |

---

## 4. Bringing It All Together: The ALZ Assessment Orchestrator (F74.18)

### 4.1 pfc-alz-pipeline — The Assessment Orchestrator

Like `pfc-ve-pipeline` orchestrates VE skills and `pfc-delta-pipeline` orchestrates DELTA, we need `pfc-alz-pipeline` to orchestrate the full assessment:

```text
pfc-alz-pipeline (AGENT_ORCHESTRATOR)
│
├─ Phase 1: ENGAGE
│   ├─ pfc-foundation-pipeline (FDN context)
│   ├─ pfc-vsom → pfc-okr → pfc-kpi → pfc-vp → pfc-kano (VE value discovery)
│   └─ pfc-delta-scope (assessment scope)
│
├─ Phase 2: EXTRACT
│   ├─ azure-resource-lookup (tenant discovery)
│   ├─ azure-prepare (readiness check)
│   ├─ azure-validate (configuration validation)
│   ├─ azure-compliance (policy & compliance state)
│   ├─ azure-rbac (identity audit)
│   ├─ azure-diagnostics (monitoring coverage)
│   └─ azure-kusto (evidence queries)
│
├─ Phase 3: ASSESS
│   ├─ pfc-alz-assess-waf (WAF pillar scoring)
│   ├─ pfc-alz-assess-caf (CAF readiness scoring)
│   ├─ pfc-alz-assess-cyber (cyber posture scoring)
│   └─ pfc-alz-assess-health (ALZ healthcheck)
│
├─ Phase 4: ANALYSE
│   ├─ cross-framework plugin (WAF ↔ CAF ↔ NCSC ↔ MCSB)
│   ├─ rmf-scorer plugin (risk statements)
│   ├─ pfc-gap-analysis (three-state gap)
│   ├─ pfc-reason-decompose (root cause)
│   └─ ve-tagger plugin (value linkage)
│
├─ Phase 5: STRATEGISE
│   ├─ pfc-alz-strategy (backcasting, OKRs, roadmap)    ← NEW
│   ├─ pfc-value-calc (ROI quantification)
│   ├─ pfc-benefit-realisation (timeline)
│   ├─ pfc-cost-model (investment)
│   ├─ pfc-resource-profile (capability)
│   └─ risk-report (risk trajectory)
│
├─ Phase 6: DOCUMENT
│   ├─ pfc-narrative (assessment narrative)
│   ├─ pfc-slide-engine (presentation)
│   ├─ pfc-strategy-deck-composer (strategy deck)
│   └─ pfc-proposal-composer (engagement proposal)
│
└─ Phase 7: ASSURE
    ├─ pfc-spc (control baselines)
    ├─ azure-compliance (recurring)
    └─ pfc-tracker-update (progress tracking)
```

### 4.2 Human Checkpoints in the Pipeline

| Checkpoint | After Phase | Decision |
|---|---|---|
| HC-1: Scope Approval | Phase 1 | Client confirms assessment scope and domain priorities |
| HC-2: Findings Review | Phase 4 | Architect reviews critical/high findings before strategy |
| HC-3: Roadmap Approval | Phase 5 | Client reviews and refines backcasted roadmap |
| HC-4: Report Sign-off | Phase 6 | Quality review before client presentation |

---

## 5. Near/Far Assessment — Honest Readiness Evaluation

### 5.1 What's Ready NOW (can use today)

| Capability | Skills | Status |
|---|---|---|
| Client value discovery | pfc-vsom, pfc-okr, pfc-kpi, pfc-vp, pfc-kano, pfc-voc | All adopted, all working |
| Organisational context | pfc-org-context, pfc-ctx, pfc-org-mat, pfc-ga, pfc-foundation-pipeline | All adopted |
| Strategic analysis | pfc-macro-analysis, pfc-industry-analysis, pfc-bsc | Adopted |
| Document & present | pfc-narrative, pfc-slide-engine, pfc-vizstrat, pfc-strategy-deck-composer, pfc-proposal-composer | All adopted |
| DELTA discovery | pfc-delta-scope/evaluate/leverage/narrate/adapt + pipeline | All adopted |
| DMAIC-VE | pfc-dmaic-ve | Adopted |
| Value quantification | pfc-value-calc | Adopted |
| Process mapping | pfc-procmap, pfc-vsm, pfc-vana | All adopted (dirs exist) |
| SPC monitoring | pfc-spc | Adopted (dir exists) |

**Verdict: Stages 1 and 6 are production-ready.** We can run VE discovery sessions and produce strategy decks right now.

### 5.2 What's Close (1–2 sprints with azure-skills MCP access)

| Capability | Gap | Effort |
|---|---|---|
| Azure data extraction (Stage 2) | Need Azure MCP Server configured + test tenant | **1 sprint** — it's Microsoft's code, we configure it |
| WAF/CAF/Cyber/ALZ assessment (Stage 3) | Scaffolds exist, need scoring logic + ontology mapping | **2 sprints** — scoring model defined, needs implementation |
| Cross-framework correlation (Stage 4) | Plugin not started, but ontology join patterns defined | **1 sprint** — EMC Composer pattern exists |
| RMF scoring (Stage 4) | Plugin not started, but RMF-IS27005-ONT exists | **1 sprint** — risk-profile + risk-score skills are candidate |

### 5.3 What's Further (3–4 sprints)

| Capability | Gap | Effort |
|---|---|---|
| pfc-alz-strategy (Stage 5) | New skill — backcasting logic, OKR generation, resource planning | **2 sprints** — builds on pfc-okr, pfc-value-calc, pfc-benefit-realisation |
| pfc-alz-pipeline orchestrator (Stage 5) | New — 7-phase orchestration | **1 sprint** — pattern exists (pfc-ve-pipeline, pfc-delta-pipeline) |
| Candidate skill graduation (Stages 4–5) | 16 candidate skills need adoption | **2 sprints** — SKILL.md exists for all, need testing + registration |
| TDD validation (Stage 3) | Test data + sandbox tenant + golden outputs | **2 sprints** — Bicep deployment + assertion framework |

### 5.4 The Critical Path

```text
WEEK 1–2:  Configure Azure MCP Server + test tenant
           Graduate risk-profile, risk-score to adopted
           Build cross-framework + rmf-scorer plugins
                    ↓
WEEK 3–4:  Implement pfc-alz-assess-* scoring logic
           Build ontology-adapter plugin
           Start TDD with TD-ALZ-GOLD + TD-ALZ-DRIFT
                    ↓
WEEK 5–6:  Build pfc-alz-strategy skill
           Graduate benefit-realisation, cost-model, resource-profile
           Build pfc-alz-pipeline orchestrator
                    ↓
WEEK 7–8:  End-to-end validation (UC-15)
           Documentation + report templates
           Cascade to pfi-w4m-rcs-dev
                    ↓
WEEK 9+:   First client engagement
```

### 5.5 Bottom Line

| Measure | Value |
|---|---|
| **Skills needed** | 53 across 7 stages |
| **Already adopted** | 20 (38%) |
| **Candidate (need graduation)** | 16 (30%) |
| **Scaffold (need implementation)** | 4 (8%) |
| **New/MCP (Microsoft provides)** | 11 (21%) |
| **Not started** | 2 (4%) |
| **Time to MVP (first client engagement)** | ~8 weeks from MCP access |
| **Biggest blocker** | Azure MCP Server access + test tenant provisioning |
| **Biggest strength** | Stages 1 + 6 are 100%/62% ready — we can engage and present NOW |

---

## 6. Strategic Implication

The skill chain is **structurally complete** — every stage has skills defined or scaffolded, and the orchestration pattern is proven. The gaps are:

1. **Execution tooling** (azure-skills MCP) — Microsoft provides this, we configure it
2. **Scoring implementation** (assessment sub-skills) — scaffolds ready, need logic
3. **Strategy skill** (pfc-alz-strategy) — new, but builds on existing VE/FDN skills
4. **Candidate graduation** — 16 skills have SKILL.md, need testing and registration

The honest assessment: **we are closer than it looks.** The hard part (skill architecture, ontology mapping, process definition, VE methodology) is done. What remains is implementation and integration — and 70% of the skill chain is already adopted or has a clear path to adoption.

The **foot-in-the-door play** works immediately: run Stage 1 (VE discovery) + Stage 6 (present findings) using manual/semi-automated Stage 2–5. The full agentic pipeline follows as skills are implemented.

---

## 7. Cross-References

- [Epic 74 (#1074)](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/1074) — Parent epic
- [Skills Register Index](azlan-github-workflow/skills/skills-register-index.json) — v2.2.0, 85 skills
- [Epic 54 (#822)](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/822) — PE-DMAIC (DMAIC skills)
- [Epic 48 (#703)](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/703) — VE Process Chain
- [Epic 69 (#1018)](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/1018) — SNG Directed Graph Orchestration
- [Epic 67 (#986)](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/986) — Quantitative Value & Finance Skills
- [Epic 73 (#1062)](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/1062) — Risk Intelligence Skill Family
- [Epic 72 (#1047)](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/1047) — Foundation Series
- Strategy: `PFI-AIRL-GRC-STRAT-Azure-Skills-WAF-CAF-Cyber-Assessment-Strategy-v1.0.0.md`

---

*PFI-AIRL-GRC-BRIEF: ALZ Assessment Skill Chain Readiness v1.0.0*
*53 skills across 7 stages. 38% adopted. ~8 weeks to MVP. Stages 1 + 6 ready now.*
