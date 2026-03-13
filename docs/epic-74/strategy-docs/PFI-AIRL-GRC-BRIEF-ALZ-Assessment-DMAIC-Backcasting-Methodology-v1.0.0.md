# PFI-AIRL-GRC-BRIEF: ALZ Assessment DMAIC Backcasting Methodology

**Product Code:** PFI-AIRL-GRC-BRIEF
**Version:** v1.0.0
**Date:** 2026-03-13
**Status:** Active
**Epic:** [Epic 74 (#1074)](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/1074) — F74.13 + F74.14
**Dependencies:** [Epic 54 (#822)](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/822) PE-DMAIC, [Epic 48 (#703)](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/703) VE Process Chain, [Epic 72 (#1047)](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/1047) Foundation Series
**Author:** PFC Platform Team

---

## 1. Purpose

This brief defines the **ALZ Assessment delivery methodology** — how an architect (human or agentic) uses Microsoft azure-skills to establish WAF/CAF best-practice baselines, contrasts them with client current state, and uses DMAIC backcasting to create a value-driven roadmap from desired destination back to today.

The methodology is formalised as a **PE-ONT process set** — making the ALZ Assessment a repeatable, measurable, improvable process rather than a consultant-dependent engagement.

**Objective:** Accelerate time-to-value. Get foot in the door. Help the customer achieve optimal outcomes by always focusing on what matters most to them.

---

## 2. The Core Idea: Three-State DMAIC Backcasting

Traditional assessment: "Here's where you are, here's a list of gaps." The client gets a spreadsheet and no clear path forward.

Our approach flips this:

```text
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  BEST        │    │  CURRENT     │    │  DESIRED     │
│  PRACTICE    │    │  STATE       │    │  DESTINATION │
│              │    │              │    │              │
│  WAF/CAF     │    │  azure-skills│    │  Customer    │
│  benchmark   │    │  live audit  │    │  value goals │
│  (MS + PFC)  │    │  (MCP data)  │    │  (VE + FDN)  │
└──────┬───────┘    └──────┬───────┘    └──────┬───────┘
       │                   │                   │
       └───────────┬───────┘                   │
                   │                           │
            Gap Analysis                       │
            (what's missing)                   │
                   │                           │
                   └───────────┬───────────────┘
                               │
                        BACKCASTING
                    (work backwards from
                     desired destination)
                               │
                        ┌──────┴──────┐
                        │  ROADMAP    │
                        │  Phase N→1  │
                        │  (reverse   │
                        │   engineered│
                        │   from goal)│
                        └─────────────┘
```

### 2.1 Why Three States, Not Two

Most assessments compare current vs. best practice. That produces a compliance checklist — technically correct but not value-aligned. Adding the **Desired Destination** (defined by VE: what matters most to this customer) means:

- Not every WAF/CAF gap is equally important — VE prioritises by customer value
- The roadmap is pulled by where the customer wants to be, not pushed by generic compliance
- FDN (Foundation Series: ORG-ONT, CTX-ONT) contextualises: org maturity, risk appetite, budget, capability
- Backcasting from destination ensures every step has a clear "why" linked to business outcome

### 2.2 The VE + FDN Focus Filter

Before any technical assessment, establish **what matters most**:

| VE/FDN Input | Source | Assessment Impact |
|---|---|---|
| `vp:Problem` (VP-ONT) | Customer pain points, business risks | Prioritises which WAF/CAF domains to assess first |
| `vp:Benefit` (VP-ONT) | Desired business outcomes | Defines the "Desired Destination" for backcasting |
| `okr:Objective` (OKR-ONT) | Strategic goals | Aligns assessment findings to strategic priorities |
| `kpi:Metric` (KPI-ONT) | Success measures | Defines what "optimised outcome" looks like quantitatively |
| `org:Maturity` (ORG-MAT-ONT) | Org capability baseline | Constrains roadmap to achievable steps |
| `ctx:Context` (CTX-ONT) | Industry, regulatory, competitive context | Tailors best-practice benchmark to sector |
| `kano:Classification` (KANO-ONT) | Must-be / Performance / Delighter | Separates "must fix" from "differentiator" in roadmap |

---

## 3. DMAIC Backcasting — Phase by Phase

### 3.1 Define: Establish the Three States

| Activity | Method | Tools | Output |
|---|---|---|---|
| Capture customer value goals | VE Skill Chain (VSOM → OKR → KPI → VP → Kano) | pfc-voc, pfc-kano | Desired Destination profile |
| Establish organisational context | FDN series (ORG-ONT, CTX-ONT, ORG-MAT-ONT) | Foundation skills | Maturity baseline, constraints |
| Define WAF/CAF best-practice benchmark | azure-skills reference + MS documentation + PFC ontology | azure-validate (reference mode) | Best Practice profile per domain |
| Scope assessment domains | VE prioritisation (VP problems → domain mapping) | EMC Composer | Prioritised domain list |
| Define CTQ metrics | VOC → CTQ tree (from Epic 54) | pfc-voc | Critical-to-Quality measures |

**Key decision:** The customer's value goals define which WAF pillars and CAF domains matter most. A cost-sensitive customer gets Cost Optimization and Operational Excellence prioritised. A regulated customer gets Security and Compliance first. VE drives this, not a generic checklist.

### 3.2 Measure: Extract Current State

| Activity | Method | Tools | Output |
|---|---|---|---|
| Tenant discovery | DELTA D-phase, automated resource inventory | azure-resource-lookup, azure-prepare | Resource graph, topology |
| WAF pillar measurement | Live validation against WAF best practices | azure-validate, azure-compliance | Per-pillar current scores |
| CAF readiness measurement | Governance, identity, management, networking posture | azure-rbac, azure-compliance, azure-diagnostics | Per-domain readiness scores |
| Cyber posture measurement | MCSB control compliance, Defender score | azure-compliance, azure-rbac, entra-app-registration | MCSB control scores |
| ALZ configuration measurement | Landing zone topology, policy state, drift | azure-resource-lookup, azure-resource-visualizer | ALZ healthcheck baseline |
| Evidence collection | KQL queries, policy exports, RBAC dumps | azure-kusto, azure-compliance | Structured evidence set |

**Output:** Current State profile — scored per domain, with evidence.

### 3.3 Analyse: Three-State Gap Analysis

```text
For each assessment domain:

  Best Practice Score    [████████████████████] 100%
  Desired Destination    [████████████████░░░░]  80%  ← customer's target
  Current State          [████████░░░░░░░░░░░░]  40%  ← live measurement

  Gap to Desired:        [    ████████        ]  40%  ← what needs to close
  Gap to Best:           [    ████████████    ]  60%  ← total possible improvement

  VE Priority:           HIGH (maps to vp:Problem "security exposure in regulated data")
  Kano Classification:   MUST-BE (non-negotiable for regulatory compliance)
  RMF Risk Rating:       CRITICAL (impact: regulatory penalty, likelihood: high)
```

**Cross-framework correlation:** A single finding may appear in WAF (Security pillar), CAF (Govern domain), NCSC CAF (B4), and MCSB (NS-1). The ontology graph surfaces these correlations automatically — the highest-impact gaps are those that appear across multiple frameworks.

**Root cause analysis:** DMAIC Analyse phase traces gaps to systemic causes:
- Is this a policy gap (missing Azure Policy)? → IaC fix (Epic 33)
- Is this a capability gap (team doesn't know how)? → Skills roadmap (F33.10)
- Is this a design gap (architecture decision)? → Architecture review
- Is this a process gap (no operational procedure)? → PE-ONT process definition

### 3.4 Improve: Backcast from Desired Destination

This is where backcasting diverges from traditional assessment. Instead of "fix everything from bottom up," we work **backwards from the customer's desired destination**:

```text
BACKCASTING ROADMAP (read bottom to top for execution order):

Phase 4 (Destination): Desired state achieved
  └─ What must be true for this to hold?
Phase 3 (Sustain): Continuous compliance operational
  └─ What must be in place for continuous monitoring?
Phase 2 (Transform): Critical gaps closed
  └─ Which gaps must close to enable Phase 3?
Phase 1 (Foundation): Quick wins + blockers removed
  └─ What can we do immediately + what blocks Phase 2?
NOW: Current state (measured in 3.2)
```

| Backcasting Step | Method | Output |
|---|---|---|
| Define destination state | VE Desired Destination profile (from 3.1) | Target maturity scores per domain |
| Identify Phase 3 prerequisites | What must be true for destination to be sustainable | Continuous assurance requirements |
| Identify Phase 2 prerequisites | Which gaps must close to enable Phase 3 | Prioritised remediation list |
| Identify Phase 1 quick wins | Immediate improvements + blockers for Phase 2 | Sprint-ready action items |
| Cost-benefit per phase | VE quantification + azure-cost-optimization | ROI per phase, cumulative value |
| Risk reduction per phase | RMF residual risk projection | Risk score trajectory |

**VE value quantification at every step:**
- Each remediation is costed (effort + Azure spend via azure-cost-optimization)
- Each remediation is valued (risk reduction via RMF, business outcome via VP-ONT)
- Only actions where value > cost make the roadmap
- Kano MUST-BE items are non-negotiable regardless of ROI (compliance floor)

### 3.5 Control: Continuous Assurance & SPC

| Activity | Method | Tools | Output |
|---|---|---|---|
| Establish SPC baselines | pfc-spc from Epic 54 | pfc-spc plugin | Control charts per domain |
| Recurring compliance checks | Scheduled azure-compliance via agentic pipeline | azure-compliance, azure-validate | Compliance trend data |
| Drift detection | Compare live state vs. desired state (not just best practice) | azure-validate, azure-resource-lookup | Drift alerts |
| Trend dashboards | Supabase JSONB storage (Epic 59) | Supabase + visualiser | Longitudinal maturity tracking |
| Re-assessment triggers | SPC out-of-control signals | pfc-spc alert thresholds | Targeted re-assessment scope |
| Value realisation tracking | VE outcome measurement (KPI-ONT) | Foundation skills | Business outcome evidence |

---

## 4. ALZ Assessment as PE-ONT Process Set

### 4.1 Why Define as PE-ONT Processes

Making the ALZ Assessment a formal PE-ONT process set means:
- **Repeatable:** Any architect (or agent) follows the same process
- **Measurable:** Process metrics (time, quality, coverage) are tracked
- **Improvable:** DMAIC can be applied to the assessment process itself
- **Scalable:** New assessment domains (OWASP, GDPR, etc.) plug into the same process framework
- **Trainable:** Process maps define the skills required (feeds F33.10 Build Capability)

### 4.2 Process Hierarchy (L0–L3)

```text
L0: ALZ Assessment & Optimisation Service
│
├─ L1: Assessment Engagement Management
│   ├─ L2: Client Onboarding & Scoping
│   ├─ L2: VE Value Discovery (VSOM → OKR → KPI → VP → Kano)
│   └─ L2: Assessment Domain Prioritisation
│
├─ L1: Current State Measurement
│   ├─ L2: Tenant Discovery & Inventory
│   ├─ L2: WAF Pillar Assessment
│   ├─ L2: CAF Readiness Assessment
│   ├─ L2: Cyber Posture Assessment
│   └─ L2: ALZ Healthcheck
│
├─ L1: Analysis & Gap Assessment
│   ├─ L2: Three-State Gap Analysis (Best / Current / Desired)
│   ├─ L2: Cross-Framework Correlation
│   ├─ L2: RMF Risk Assessment & Scoring
│   └─ L2: Root Cause Analysis
│
├─ L1: Roadmap & Remediation Design
│   ├─ L2: Backcasting Roadmap Construction
│   ├─ L2: VE Cost-Benefit Quantification
│   ├─ L2: RMF Risk Reduction Projection
│   └─ L2: Phased Delivery Plan
│
├─ L1: Report & Delivery
│   ├─ L2: Assessment Report Generation
│   ├─ L2: Executive Summary & Recommendations
│   └─ L2: Client Presentation & Handover
│
└─ L1: Continuous Assurance
    ├─ L2: SPC Monitoring Setup
    ├─ L2: Recurring Compliance Checks
    ├─ L2: Drift Detection & Alerting
    └─ L2: Value Realisation Tracking
```

### 4.3 SIPOC for L0 Process

| Element | Detail |
|---|---|
| **Suppliers** | Client (Azure tenant access, business context), Microsoft (azure-skills, Azure APIs, WAF/CAF documentation), PFC (ontology stack, VE skills, PE processes) |
| **Inputs** | Azure tenant credentials, client value goals (VP-ONT), organisational context (FDN), WAF/CAF best-practice benchmarks, MCSB control definitions |
| **Process** | L0: ALZ Assessment & Optimisation Service (5 × L1, 18 × L2 as above) |
| **Outputs** | Assessment reports (WAF/CAF/Cyber/ALZ), backcasted roadmap, risk register, SPC baselines, value realisation plan |
| **Customers** | Client CTO/CISO/Cloud Architect, Client programme team, AIRL engagement team, W4M-RCS commercial team |

### 4.4 PE-ONT Entity Mapping

| PE-ONT Entity | ALZ Assessment Application |
|---|---|
| `pe:Process` | Each L1/L2 process in the hierarchy |
| `pe:ProcessStep` | Individual activities within each L2 |
| `pe:Input` / `pe:Output` | Data flows between processes |
| `pe:Role` | Architect, Client Stakeholder, Agent, Reviewer |
| `pe:Metric` | Process time, coverage %, score accuracy, client satisfaction |
| `pe:Tool` | azure-skills (21), EMC Composer, pfc-spc, VE skills |
| `procmap:SIPOC` | L0 SIPOC (from Epic 54 PROCMAP-ONT) |
| `vsm:ValueStream` | End-to-end assessment value stream (from Epic 54 VSM-ONT) |
| `vana:WasteCategory` | Assessment process waste (rework, waiting, overprocessing) |

### 4.5 Agentic vs. Human Execution

Each L2 process has an execution mode:

| L2 Process | Mode | Rationale |
|---|---|---|
| Client Onboarding & Scoping | **Human-led** | Relationship, trust, context gathering |
| VE Value Discovery | **Human-led, agent-assisted** | Strategic conversation, agent captures & structures |
| Domain Prioritisation | **Agent-recommended, human-approved** | Agent applies VE logic, human validates |
| Tenant Discovery & Inventory | **Agent-autonomous** | Fully automatable via azure-resource-lookup |
| WAF/CAF/Cyber/ALZ Assessment | **Agent-autonomous** | Live MCP data extraction + ontology scoring |
| Three-State Gap Analysis | **Agent-autonomous** | Ontology graph computation |
| Cross-Framework Correlation | **Agent-autonomous** | EMC Composer join patterns |
| RMF Risk Assessment | **Agent-recommended, human-reviewed** | Agent scores, human validates critical/high |
| Root Cause Analysis | **Human-led, agent-assisted** | Agent surfaces patterns, human applies judgement |
| Backcasting Roadmap | **Agent-drafted, human-refined** | Agent constructs phases, human adjusts for context |
| VE Cost-Benefit | **Agent-calculated, human-validated** | Agent quantifies, human validates assumptions |
| Report Generation | **Agent-autonomous** | Template-driven, ontology-sourced |
| Client Presentation | **Human-led** | Relationship, discussion, negotiation |
| SPC Monitoring Setup | **Agent-autonomous** | Automated baseline + threshold configuration |
| Recurring Compliance | **Agent-autonomous** | Scheduled agentic pipeline |
| Value Realisation Tracking | **Agent-measured, human-reported** | Agent tracks KPIs, human interprets for client |

---

## 5. Time-to-Value Acceleration

### 5.1 Traditional vs. PFC ALZ Assessment

| Dimension | Traditional Consultant | PFC + Azure Skills + DMAIC Backcasting |
|---|---|---|
| **Scoping** | 1–2 weeks of meetings | 1 VE session → automated domain prioritisation |
| **Data collection** | 2–4 weeks manual KQL, screenshots, interviews | Hours — azure-skills MCP automated extraction |
| **Analysis** | 2–3 weeks spreadsheet correlation | Minutes — ontology graph cross-framework correlation |
| **Roadmap** | 1–2 weeks consultant opinion | Backcasted from customer value goals, RMF-quantified |
| **Report** | 1 week writing | Agent-generated from ontology-scored findings |
| **Total** | 6–12 weeks | Days to 1–2 weeks |
| **Repeatability** | Starts from scratch each time | Process set — continuous, improving |
| **Focus** | Generic best-practice compliance | Customer value-driven (VE + FDN) |

### 5.2 "Foot in the Door" Strategy

The ALZ Assessment is the **land** in a land-and-expand model:

```text
LAND: ALZ Assessment (Epic 74)
  → Quick, high-value, low-risk engagement
  → Demonstrates ontology-driven insight + backcasting roadmap
  → Client sees: "they understand my business, not just Azure"
       │
EXPAND: Remediation Programme (Epic 33 IaC)
  → Execute the roadmap we co-created
  → Phase 1 quick wins build trust
  → Continuous assurance proves ongoing value
       │
EMBED: Continuous Assessment (DMAIC Control)
  → SPC monitoring becomes operational BAU
  → Re-assessment on change triggers
  → Value realisation tracking proves ROI
```

---

## 6. Cross-References

- [Epic 74 (#1074)](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/1074) — Parent epic (F74.13, F74.14)
- [Epic 54 (#822)](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/822) — PE-DMAIC (SIPOC, VSM, VANA, pfc-spc)
- [Epic 52 (#755)](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/755) — DELTA Discovery Process
- [Epic 48 (#703)](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/703) — VE Process Chain Skills
- [Epic 72 (#1047)](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/1047) — Foundation Series (ORG-ONT, CTX-ONT, ORG-MAT-ONT)
- [Epic 33 (#505)](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/505) — Azure Landing Zone IaC (remediation execution)
- [Epic 68 (#1005)](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/1005) — Azure-RCS Assessment Platform
- [Epic 67 (#986)](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/986) — Quantitative Value & Finance Skills
- W4M-RCS ALZ Assessment: `pfi-w4m-dev/PBS/DOCS/PFI-W4M-RCS-AZA-STRAT-BRIEF-Azure-Landing-Zone-Assessment-v1.0.0.md`
- Strategy: `PBS/STRATEGY/PFI-AIRL-GRC-STRAT-Azure-Skills-WAF-CAF-Cyber-Assessment-Strategy-v1.0.0.md`

---

*PFI-AIRL-GRC-BRIEF: ALZ Assessment DMAIC Backcasting Methodology v1.0.0*
*Three states. Backcast from destination. VE-driven. PE-ONT processified. Time-to-value in days, not months.*
