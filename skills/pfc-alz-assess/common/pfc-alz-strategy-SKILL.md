# pfc-alz-strategy — ALZ Strategy Analysis, Consulting & Roadmap Skill

**Skill ID:** pfc-alz-strategy
**Version:** v0.1.0 (scaffold)
**Type:** AGENT_SUPERVISED
**Feature:** [F74.17](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/1074)
**Epic:** [Epic 74 (#1074)](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/1074)

---

## Purpose

The strategy and consulting skill that sits between assessment (what's wrong) and delivery (how to present it). Takes scored findings from pfc-alz-assess-* skills and produces a consulting-grade backcasted roadmap with OKRs, resource plans, benefits realisation, and investment models.

**This is the skill that makes the assessment commercially valuable.**

## Position in Skill Chain

```text
INPUT                          pfc-alz-strategy                    OUTPUT
─────                          ────────────────                    ──────
Assessment findings     →  1. Comparative Gap Analysis      →  Gap report
(from Stage 3–4)            2. Backcast from Destination     →  Roadmap
VE profile              →  3. OKR Framework                 →  OKR tree
(from Stage 1)              4. Resource & Capability Plan    →  Team plan
FDN context             →  5. Benefits Realisation           →  Value timeline
(from Stage 1)              6. Investment Model              →  Cost/ROI
                            7. Risk Reduction Trajectory     →  Risk curve
                            8. Executive Recommendation      →  1-pager
```

## Skills Consumed (Downstream)

| Skill | What It Provides | Status |
|---|---|---|
| `pfc-okr` | OKR generation from strategic objectives | ✅ Adopted |
| `pfc-kpi` | KPI definition for measurable targets | ✅ Adopted |
| `pfc-value-calc` | ROI and value quantification | ✅ Adopted |
| `pfc-benefit-realisation` | Benefits timeline and tracking | 🟠 Candidate |
| `pfc-cost-model` | Investment modelling per phase | 🟠 Candidate |
| `pfc-resource-profile` | Team composition, skills, capacity | 🟠 Candidate |
| `pfc-ve-prioritise` | VE-driven prioritisation | 🟠 Candidate |
| `risk-profile` | Risk profiling per domain | 🟠 Candidate |
| `risk-score` | Risk scoring and rating | 🟠 Candidate |
| `risk-report` | Risk report generation | 🟠 Candidate |
| `pfc-portfolio-assess` | Portfolio-level assessment | 🟠 Candidate |

## Core Logic: DMAIC Backcasting

### Step 1: Comparative Gap Analysis

For each assessment domain (WAF/CAF/Cyber/ALZ):

```text
Domain: WAF Security Pillar

  Best Practice    ████████████████████  95%
  Desired State    ████████████████░░░░  80%  ← from pfc-okr target
  Current State    ████████░░░░░░░░░░░░  42%  ← from pfc-alz-assess-waf

  Gap to Desired:  ████████              38 points
  Effort Estimate: 12 weeks (via pfc-resource-profile)
  Investment:      £45K (via pfc-cost-model)
  Risk Reduction:  Critical → Medium (via risk-score)
  Value Created:   £180K annual risk avoidance (via pfc-value-calc)
  ROI:             4.0x (via pfc-benefit-realisation)
  VE Priority:     HIGH — maps to vp:Problem "regulatory exposure"
  Kano:            MUST-BE (non-negotiable compliance)
```

### Step 2: Backcast from Desired Destination

Work backwards from the customer's desired state:

```text
PHASE 4 — DESTINATION (Month 9+)
  Target: All domains at desired scores
  Prerequisites: Phase 3 complete, continuous assurance operational
  Benefits: Full value realisation, risk at target level
      ↑
PHASE 3 — SUSTAIN (Month 7–9)
  Target: Continuous compliance operational, SPC baselines set
  Prerequisites: Phase 2 remediation complete
  Benefits: Regression prevention, audit readiness
      ↑
PHASE 2 — TRANSFORM (Month 3–6)
  Target: Critical and high gaps closed
  Prerequisites: Phase 1 complete, team capability built
  Benefits: Risk reduced from Critical → Medium across domains
      ↑
PHASE 1 — FOUNDATION (Month 1–2)
  Target: Quick wins deployed, blockers removed, team trained
  Prerequisites: Assessment complete, roadmap approved
  Benefits: Immediate risk reduction, visible progress
      ↑
NOW: Assessment complete, roadmap in hand
```

### Step 3: Backcasted OKR Framework

Generate OKRs reverse-engineered from destination:

```text
Objective: "Achieve 80% WAF Security pillar score by Q3 2026"
  KR1: Close all Critical MCSB control gaps by end of Phase 1
  KR2: Implement automated RBAC review by end of Phase 2
  KR3: Achieve zero Critical findings in recurring healthcheck by Phase 3
  KR4: Maintain SPC control chart within tolerance for 30 consecutive days

Objective: "Reduce Azure compliance risk from Critical to Medium by Q4 2026"
  KR1: Deploy missing Azure Policy assignments (12 identified) by Phase 1
  KR2: Remediate NSG over-permission across all spokes by Phase 2
  KR3: Establish continuous compliance monitoring with drift alerting by Phase 3
```

### Step 4: Resource & Capability Analysis

| Resource Type | Requirement | Source | Gap |
|---|---|---|---|
| Azure Architect | 0.5 FTE for 6 months | Client or AIRL | Assess via pfc-resource-profile |
| Security Engineer | 0.25 FTE for 3 months | Client or AIRL | Assess via pfc-resource-profile |
| Bicep/IaC capability | Intermediate level | Client team training | Skills gap from F33.10 |
| GRC knowledge | MCSB + NCSC CAF | AIRL provides | Part of engagement |
| Azure Policy expertise | Policy-as-code | Training + AIRL support | 2-week training plan |

### Step 5: Benefits Realisation Schedule

| Phase | Investment | Risk Reduction | Value Created | Cumulative ROI |
|---|---|---|---|---|
| Phase 1 | £15K | Critical → High | £60K (avoided incident cost) | 4.0x |
| Phase 2 | £30K | High → Medium | £120K (compliance + insurance) | 4.0x |
| Phase 3 | £10K | Maintained | £50K (operational efficiency) | 4.2x |
| Phase 4 | £5K | At target | £30K (continuous value) | 4.3x |
| **Total** | **£60K** | **Critical → Target** | **£260K** | **4.3x** |

### Step 6: Executive Recommendation (1-pager)

```text
┌─────────────────────────────────────────────────────┐
│  AZURE LANDING ZONE ASSESSMENT — EXECUTIVE SUMMARY  │
├─────────────────────────────────────────────────────┤
│  CURRENT STATE: 42% average across 4 domains        │
│  DESIRED STATE: 80% (your target, VE-validated)     │
│  GAP: 38 points across WAF/CAF/Cyber/ALZ            │
│  CRITICAL FINDINGS: 7 (3 WAF, 2 Cyber, 1 CAF, 1 ALZ)│
│                                                     │
│  ROADMAP: 4 phases over 9 months                    │
│  INVESTMENT: £60K total                             │
│  VALUE: £260K (risk avoidance + efficiency)         │
│  ROI: 4.3x                                         │
│  RISK: Critical → Medium by Phase 2 (Month 6)      │
│                                                     │
│  RECOMMENDATION: Proceed with Phase 1 immediately   │
│  Quick wins close 3 Critical findings in 4 weeks    │
└─────────────────────────────────────────────────────┘
```

## Inputs

- Assessment finding sets (from pfc-alz-assess-waf/caf/cyber/health)
- VE profile (from Stage 1: VSOM, OKR, KPI, VP, Kano)
- FDN context (from Stage 1: org maturity, risk appetite, budget)
- Cross-framework correlations (from Stage 4)
- RMF risk scores (from Stage 4)

## Outputs

- Comparative gap analysis report (per domain)
- Backcasted roadmap (4 phases)
- OKR framework (objectives + key results)
- Resource & capability plan
- Benefits realisation schedule
- Investment model with ROI
- Risk reduction trajectory
- Executive recommendation (1-pager)

## Human Checkpoints

- [ ] Gap analysis reviewed with client stakeholders
- [ ] Desired destination scores validated (not just best practice defaults)
- [ ] Resource assumptions validated against client capacity
- [ ] Investment/ROI assumptions validated
- [ ] Roadmap phasing approved before presentation build
