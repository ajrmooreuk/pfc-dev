# PFI-AIRL-GRC-BRIEF — QVF Cyber Economics & Value Quantification Strategy

**Document ID:** PFI-AIRL-GRC-BRIEF-QVF-Cyber-Economics-Value-Quantification-v1.0.0
**Date:** 2026-03-13
**Epic:** [Epic 74 (#1074)](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/1074)
**Features:** F74.22 (QVF Cyber Economics), F74.23 (Cyber Insurance Optimisation), F74.24 (GRC ROI & Value Equation)
**Status:** Active
**Related Epics:** [Epic 67 (#986)](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/986) (QVF Skills), [Epic 73 (#1062)](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/1062) (Risk Intelligence)

---

## 1. Executive Summary

Security assessments that report findings without quantifying financial impact fail to drive board-level action. This briefing defines how QVF (Quantitative Value & Finance) skills extend into cyber economics to answer the questions that actually move budgets:

- **"What does a breach cost us?"** — Annualised Loss Expectancy (ALE) per threat scenario
- **"What's the ROI of fixing this?"** — GRC investment return via risk reduction
- **"How does this affect our insurance?"** — Cyber insurance premium optimisation via posture improvement
- **"What's the value of adaptive governance?"** — Continuous GRC ROI vs point-in-time audit

The QVF Cyber Economics skills bridge the MCSB/OWASP technical assessment (what's wrong) to the financial case (what it costs and what fixing it saves), making every remediation a quantified investment decision rather than a compliance checkbox.

---

## 2. Existing Ontology & Skill Foundation

### 2.1 What Already Exists

The QVF Cyber Economics skills are **wiring, not new entities**. The PFC ontology library already contains the building blocks:

| Ontology | Entity / Property | Cyber Economics Role |
|---|---|---|
| **Cyber-Risk-ONT v1.0.0** | `cra:BusinessImpact.annualisedLossExpectancy` | First-class ALE property — already defined, needs skill to *calculate* it |
| **Cyber-Risk-ONT v1.0.0** | `cra:RiskScenario`, `cra:ThreatActor`, `cra:AttackTechnique` | Threat scenario structure for financial overlay |
| **RMF-IS27005-ONT v1.0.0** | `rmf:RiskTreatment.costEstimate` | Treatment cost — the denominator in ROI calculation |
| **RMF-IS27005-ONT v1.0.0** | `rmf:RiskTreatment.treatmentStrategy` (mitigate\|accept\|transfer\|avoid) | Maps directly to financial strategies (fix, self-insure, insure, abandon) |
| **RMF-IS27005-ONT v1.0.0** | `rmf:Risk.inherentRiskLevel` / `rmf:Risk.residualRiskLevel` | Before/after risk — the ΔALE calculation |
| **ERM-ONT v1.0.0** | `erm:RiskAppetite` | Acceptable ALE threshold per domain |
| **QVF-ONT v1.0.0** | `qvf:CashFlow[category=COST_AVOIDANCE]` | ALE reduction as a cash flow — already modelled |
| **QVF-ONT v1.0.0** | `qvf:Assumption[sensitivity=HIGH]` | ARO and exposure factor as sensitivity-tagged assumptions |
| **QVF-ONT v1.0.0** | `qvf:EconomicCase`, `qvf:BreakEvenAnalysis` | Investment case structure — ready for GRC ROI |

### 2.2 Existing Skills Foundation

| Skill | Epic | Status | Cyber Economics Role |
|---|---|---|---|
| pfc-value-calc | Epic 67 (SKL-059) | Adopted | Tier 1 QVF — consumes ALE as COST_AVOIDANCE cash flow |
| pfc-cost-model | Epic 67 (SKL-060) | Candidate | Remediation cost estimation — denominator for GRC ROI |
| pfc-benefit-realisation | Epic 67 (SKL-061) | Candidate | Tracks projected vs actual ALE reduction |
| risk-score | Epic 73 (SKL-067) | Candidate | P0–P3 scores map to SLE magnitude bands |
| risk-balance | Epic 73 (SKL-068) | Candidate | `QVF_Value × Kano_Weight × (1 − Risk_Score) / Resource_Cost` — already combines QVF with risk |
| risk-learn | Epic 73 (SKL-071) | Candidate | Actual incidents calibrate ALE models |
| risk-waive | Epic 73 (SKL-072) | Candidate | Risk acceptance with quantified residual ALE exposure |
| pfc-owasp-threat-model | Epic 37 | Candidate | Threat scenarios that feed financial overlay |

### 2.3 ISO 27005 Integration — Risk Treatment Economics

RMF-IS27005-ONT v1.0.0 provides the complete risk management framework that underpins cyber economics. The ISO 27005 process maps directly to the QVF financial chain:

```text
ISO 27005 Process                    QVF Extension
──────────────────                   ──────────────
rmf:RiskContext                  →   Business context (revenue, asset criticality)
  ↓                                  Sets scope for financial modelling
rmf:Asset + rmf:Threat           →   Asset Value × Exposure Factor = SLE
  ↓                                  pfc-qvf-threat-econ
rmf:Vulnerability                →   CVSS → exploitability → ARO refinement
  ↓                                  pfc-qvf-breach-model
rmf:Risk (inherent)              →   ALE_before = SLE × ARO
  ↓                                  pfc-qvf-cyber-impact
rmf:RiskAssessment               →   Portfolio ALE aggregation
  ↓                                  Risk-ranked by financial impact
rmf:RiskTreatment                →   Treatment cost vs risk reduction
  ↓                                  GRC ROI = (ΔALE − cost) / cost
rmf:Risk (residual)              →   ALE_after — the target state
  ↓                                  pfc-qvf-grc-roi
rmf:RiskMonitoringPlan           →   Continuous ALE tracking
                                     pfc-benefit-realisation
```

Key ISO 27005 entities for cyber economics:
- **BR-RMF-001** (Risk must reference context): Every ALE calculation is scoped to an `rmf:RiskContext` — no orphan calculations
- **BR-RMF-003** (inherent → residual after treatment): The ΔALE that drives ROI requires both states
- **BR-RMF-005** (`rmf:RiskTreatment.costEstimate` required): Every treatment option has a cost — the GRC investment denominator
- **BR-RMF-009** (cross-ontology mapping): `rmf:ComplianceMapping` bridges to GDPR-ONT (fine calculation) and MCSB-ONT (control effectiveness)

### 2.4 The "Transfer" Treatment — Cyber Insurance as ISO 27005 Risk Transfer

ISO 27005 defines four risk treatment strategies. Each maps to a financial skill:

| ISO 27005 Treatment | `rmf:RiskTreatment.treatmentStrategy` | Financial Skill | What It Calculates |
|---|---|---|---|
| **Mitigate** | `mitigate` | pfc-qvf-grc-roi | ROI of control implementation |
| **Accept** | `accept` | pfc-qvf-cyber-impact | Quantified residual ALE (the accepted exposure) |
| **Transfer** | `transfer` | pfc-qvf-cyber-insure | Insurance premium optimisation (risk → insurer) |
| **Avoid** | `avoid` | pfc-value-calc | Opportunity cost of avoided activity |

Cyber insurance is specifically ISO 27005 **risk transfer** — the customer pays a premium to transfer residual risk to an insurer. The skill `pfc-qvf-cyber-insure` quantifies whether transfer is economically optimal vs mitigation:

```text
Transfer Decision:
  If Premium < Residual_ALE × P(materialisation) → transfer is cost-effective
  If Premium > Residual_ALE × P(materialisation) → mitigate or accept instead

Optimal Strategy = min(Mitigation_Cost, Transfer_Cost, Accepted_ALE)
```

### 2.5 Key Insight: What's New vs What Exists

```text
ALREADY EXISTS (ontology entities + adopted skills):
├── ALE as a property (cra:BusinessImpact.annualisedLossExpectancy)
├── Risk treatment costs (rmf:RiskTreatment.costEstimate)
├── Cost avoidance cash flows (qvf:CashFlow[COST_AVOIDANCE])
├── Risk scoring (risk-score SKL-067)
├── Risk-value balancing (risk-balance SKL-068)
└── Value calculation engine (pfc-value-calc SKL-059)

NEW (the 6 QVF Cyber Economics skills):
├── pfc-qvf-cyber-impact   → CALCULATES the ALE (wires threat model to financial model)
├── pfc-qvf-threat-econ    → OVERLAYS financial data on threat scenarios (FAIR method)
├── pfc-qvf-breach-model   → MODELS breach cost components (regulatory, operational, reputational)
├── pfc-qvf-cyber-insure   → OPTIMISES insurance (maps ISO 27005 transfer to premium economics)
├── pfc-qvf-grc-roi        → CALCULATES investment return (ΔALE − cost / cost)
└── pfc-qvf-grc-value      → AGGREGATES the unified Cyber Value Equation
```

The new skills are the **calculation engines** that wire existing ontology entities into actionable financial outputs. They don't duplicate — they activate.

---

## 3. The Cyber Value Equation

### 2.1 Core Formula

```text
┌──────────────────────────────────────────────────────────────────┐
│                                                                   │
│  Cyber Value = Risk Reduction Value + Insurance Savings           │
│              + Compliance Value + Operational Value                │
│              − GRC Investment Cost                                │
│                                                                   │
│  Where:                                                           │
│    Risk Reduction Value = ΔALE (before − after remediation)       │
│    Insurance Savings    = ΔPremium + ΔExcess reduction            │
│    Compliance Value     = Penalties avoided + Market access        │
│    Operational Value    = Downtime avoided + Productivity          │
│    GRC Investment Cost  = Implementation + Tooling + People       │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### 2.2 Annualised Loss Expectancy (ALE)

The foundational risk economics calculation, adapted from FAIR (Factor Analysis of Information Risk):

```text
ALE = SLE × ARO

Where:
  SLE (Single Loss Expectancy) = Asset Value × Exposure Factor
  ARO (Annual Rate of Occurrence) = frequency of threat materialising

Components of SLE:
  ├── Direct costs (incident response, forensics, legal, notification)
  ├── Business interruption (downtime × revenue per hour)
  ├── Regulatory fines (GDPR 4% global turnover, NIS2 €10M, DORA)
  ├── Reputational damage (customer churn × CLV)
  ├── Recovery costs (restore, rebuild, harden)
  └── Third-party liability (contractual, supply chain, class action)
```

### 2.3 Risk Reduction ROI

```text
GRC ROI = (ALE_before − ALE_after − Remediation_Cost) / Remediation_Cost × 100

Where:
  ALE_before  = current state ALE (from pfc-grc-mcsb-assess + threat model)
  ALE_after   = projected ALE after remediation
  Remediation_Cost = pfc-cost-model output for control implementation

QVF Integration:
  qvf:ValueModel.roi          = GRC ROI
  qvf:CashFlow[category=COST_AVOIDANCE] = ALE_before − ALE_after
  qvf:Assumption[sensitivity=HIGH]      = ARO estimate, Exposure Factor
```

### 2.4 VE Value Chain Integration

The Cyber Value Equation feeds into the VE chain at multiple points:

```text
VE Stage 1 (VSOM) → Strategic objective: "Reduce cyber risk exposure by X%"
VE Stage 2 (OKR)  → KR: "Achieve MCSB compliance score >85% across all domains"
VE Stage 3 (KPI)  → Metrics: ALE, MCSB score, posture drift, insurance premium
VE Stage 4 (QVF)  → Financial model: GRC ROI, NPV of risk reduction, payback period
                     ↓
              ┌──────────────────────┐
              │ QVF CYBER ECONOMICS  │ ← NEW SKILLS
              │ pfc-qvf-cyber-impact │
              │ pfc-qvf-cyber-insure │
              │ pfc-qvf-grc-roi      │
              │ pfc-qvf-threat-econ  │
              └──────────────────────┘
                     ↓
VE Stage 5 (VP)   → Value Prop: "Quantified cyber risk reduction with ROI"
VE Stage 8 (BR)   → Benefit realisation: projected ALE reduction vs actual
```

---

## 4. Threat Modelling Economics

### 3.1 From Threat Model to Financial Impact

```text
pfc-owasp-threat-model          pfc-qvf-threat-econ
─────────────────────           ────────────────────
Threat Actor         →  Actor capability + motivation  →  ARO estimate
Attack Technique     →  MITRE ATT&CK frequency data   →  ARO refinement
Vulnerability        →  CVSS + exploitability          →  Exposure Factor
Asset                →  Business criticality + revenue →  Asset Value
Risk Scenario        →  Complete threat scenario       →  SLE calculation
                                                       →  ALE per scenario
                                                       →  Aggregate ALE
```

### 3.2 Threat Scenario Costing

Each `cra:RiskScenario` from Cyber-Risk-ONT gets financial overlay:

| Scenario Component | Financial Model | Source |
|---|---|---|
| Data breach (PII) | Notification cost + regulatory fine + litigation | GDPR Art 83, ICO penalty calculator |
| Ransomware | Downtime cost + ransom (if paid) + recovery | Industry benchmarks, business impact analysis |
| Supply chain compromise | Third-party liability + remediation + audit | Contractual analysis, SLA penalties |
| Insider threat | Investigation + data loss + IP theft | HR cost model, competitive damage estimate |
| AI/LLM exploitation | Model retraining + data poisoning remediation | OWASP agentic/LLM skill outputs |
| Cloud misconfiguration | Data exposure + remediation + compliance gap | MCSB domain score impact |

### 3.3 Sensitivity Analysis

Every ALE calculation requires QVF-ONT sensitivity scenarios:

```text
Optimistic (P=0.20): Low ARO, contained impact, rapid response
Base case  (P=0.60): Industry-average ARO, moderate impact
Pessimistic (P=0.20): High ARO, cascading impact, regulatory scrutiny

Expected ALE = Σ(scenario_probability × scenario_ALE)
```

---

## 5. Cyber Insurance Economics

### 4.1 Insurance Premium Optimisation

Cyber insurance premiums are directly influenced by security posture. Better GRC = lower premiums:

```text
Premium Factors (insurer perspective):
├── Security controls maturity     → MCSB compliance score
├── Incident response capability   → IR process maturity, tabletop frequency
├── Data protection posture        → PII-ONT compliance, encryption coverage
├── Access management              → RBAC audit, privileged access controls
├── Backup & recovery              → RPO/RTO targets, tested recovery
├── Regulatory compliance          → GDPR, NIS2, DORA compliance evidence
├── AI governance                  → OWASP agentic/LLM controls, AI-GOV maturity
└── Historical claims              → Prior incidents, remediation evidence
```

### 4.2 Insurance Value Model

```text
pfc-qvf-cyber-insure calculates:

  Premium_current   = Current annual cyber insurance premium
  Premium_projected = Estimated premium after GRC improvement
  ΔPremium         = Premium_current − Premium_projected (annual saving)

  Excess_current    = Current policy excess/deductible
  Excess_projected  = Estimated excess after posture improvement
  ΔExcess          = Excess_current − Excess_projected (reduced exposure)

  Coverage_gap     = Uninsured risk (exclusions × ALE for excluded scenarios)
  Coverage_delta   = Additional coverage available at improved posture

  Insurance NPV = Σ(ΔPremium_t / (1+r)^t) over policy horizon
                 + Σ(ΔExcess × P(claim) / (1+r)^t)
                 + Coverage_gap_reduction_value
```

### 4.3 Insurer Evidence Package

GRC-MCSB assessment produces evidence that directly feeds insurance renewal:

| Evidence | Source Skill | Insurer Value |
|---|---|---|
| MCSB compliance scorecard | pfc-grc-mcsb-assess | Controls effectiveness evidence |
| OWASP application scan | pfc-owasp-web/code-review | Application security posture |
| Threat model with controls | pfc-owasp-threat-model | Threat awareness demonstration |
| Incident response process | pfc-alz-assess-cyber | IR capability evidence |
| Compliance trend report | pfc-grc-mcsb-report | Continuous improvement evidence |
| AI governance maturity | ext-owasp-agamm | AI-specific risk management |
| Unified posture score | pfc-grc-posture | Single metric for underwriter |

### 4.4 The Virtuous Cycle

```text
Better GRC Posture → Lower Premiums → Budget freed → Invest in GRC → Better Posture
     ↑                                                                      │
     └──────────────────── Continuous improvement loop ─────────────────────┘

Quantified via pfc-benefit-realisation:
  Year 1: GRC investment £X → Premium saving £Y → Net cost £(X−Y)
  Year 2: Continued compliance → Premium reduction compounds → Positive ROI
  Year 3: Industry-leading posture → Preferred risk, broadest coverage, lowest excess
```

---

## 6. GRC ROI & Investment Case

### 5.1 The Economic Case for Adaptive GRC

```text
Point-in-time audit:
  Cost: £30K–£100K per engagement
  Value: Snapshot, decays immediately
  Shelf life: ~3 months before drift invalidates findings

Adaptive GRC (our model):
  Cost: Platform subscription + initial assessment
  Value: Continuous posture management, live dashboards
  Shelf life: Perpetual (drift detection, SPC baselines, auto-remediation)

Economic comparison (qvf:EconomicCase):
  5-year TCO adaptive vs 5-year periodic:
  ├── Periodic: 20 audits × £50K = £1M + drift risk exposure
  ├── Adaptive: £150K setup + £50K/yr = £400K + continuous assurance
  └── Saving: £600K + reduced breach probability + lower insurance
```

### 5.2 QVF Value Model for GRC Investment

```text
qvf:ValueModel "GRC-Investment-Case" {
  cashFlows: [
    // Costs
    { period: 0, amount: -150000, category: "CAPEX", label: "Platform setup" },
    { period: 1-60, amount: -4167/mo, category: "OPEX", label: "Subscription" },

    // Benefits
    { period: 1-60, amount: varies, category: "COST_AVOIDANCE", label: "ALE reduction" },
    { period: 12-60, amount: varies, category: "COST_SAVING", label: "Insurance premium reduction" },
    { period: 1-60, amount: varies, category: "COST_AVOIDANCE", label: "Compliance penalties avoided" },
    { period: 1-60, amount: varies, category: "COST_SAVING", label: "Audit cost reduction" },
    { period: 1-60, amount: varies, category: "REVENUE", label: "Market access (compliance-gated contracts)" }
  ],
  assumptions: [
    { name: "ARO-ransomware", value: 0.15, sensitivity: "HIGH" },
    { name: "breach-cost-per-record", value: 130, sensitivity: "MEDIUM" },
    { name: "insurance-premium-reduction", value: 0.15, sensitivity: "MEDIUM" },
    { name: "compliance-fine-probability", value: 0.05, sensitivity: "HIGH" }
  ],
  sensitivityScenarios: [
    { variant: "optimistic", probability: 0.20 },
    { variant: "base", probability: 0.60 },
    { variant: "pessimistic", probability: 0.20 }
  ]
}
```

### 5.3 Benefit Realisation Loop

```text
pfc-benefit-realisation tracks:
  Projected ALE reduction → Actual incidents avoided
  Projected premium saving → Actual renewal quote
  Projected compliance score → Actual MCSB score trajectory
  Projected audit savings → Actual audit cost delta

Variance feeds back to:
  ├── risk-learn (Epic 73, SKL-071) — calibrate risk models
  ├── FDN F2 enrichment — update org risk profile
  ├── KPI recalibration — adjust targets based on actuals
  └── QVF assumption refinement — update sensitivity classifications
```

---

## 7. QVF Cyber Economics Skills

### 6.1 Skill Definitions

| Skill | Purpose | Type | Feature |
|---|---|---|---|
| `pfc-qvf-cyber-impact` | Calculate ALE per threat scenario, aggregate portfolio risk | AGENT_SUPERVISED | F74.22a |
| `pfc-qvf-threat-econ` | Financial overlay on threat model (FAIR methodology) | AGENT_SUPERVISED | F74.22b |
| `pfc-qvf-cyber-insure` | Cyber insurance premium optimisation and evidence packaging | AGENT_SUPERVISED | F74.23 |
| `pfc-qvf-grc-roi` | GRC investment ROI, NPV, payback, economic case | AGENT_SUPERVISED | F74.24a |
| `pfc-qvf-grc-value` | Unified cyber value equation aggregation | AGENT_SUPERVISED | F74.24b |
| `pfc-qvf-breach-model` | Breach cost model (direct, indirect, regulatory, reputational) | AGENT_AUTONOMOUS | F74.22c |

### 6.2 Skill Chain Flow

```text
TECHNICAL ASSESSMENT                    FINANCIAL QUANTIFICATION
───────────────────                     ────────────────────────

pfc-grc-mcsb-assess ──┐
pfc-owasp-* skills ───┤
pfc-alz-assess-* ─────┤── findings ──→ pfc-qvf-threat-econ (FAIR overlay)
pfc-owasp-threat-model ┘                     │
                                             ↓
                                    pfc-qvf-cyber-impact (ALE calculation)
                                             │
                              ┌──────────────┼──────────────┐
                              ↓              ↓              ↓
                     pfc-qvf-breach-model  pfc-qvf-cyber-insure  pfc-qvf-grc-roi
                     (breach cost detail)  (premium optimisation) (investment case)
                              │              │              │
                              └──────────────┼──────────────┘
                                             ↓
                                    pfc-qvf-grc-value
                                    (unified cyber value equation)
                                             │
                                             ↓
                                    pfc-value-calc (Tier 1 QVF)
                                    → qvf:EconomicCase
                                    → pfc-benefit-realisation (tracking)
```

### 6.3 Ontology Surface

```text
QVF Cyber Economics Skills
├── QVF-ONT v1.0.0      ← ValueModel, CashFlow, Assumption, Sensitivity, EconomicCase
├── Cyber-Risk-ONT v1.0.0 ← ThreatActor, AttackTechnique, Vulnerability, RiskScenario
├── ERM-ONT v1.0.0       ← RiskRegister, Risk, RiskAppetite, Control
├── RMF-IS27005-ONT v1.0.0 ← Risk scoring (P0–P3)
├── MCSB-ONT v2.0.0      ← Control effectiveness → exposure factor
├── PII-ONT v3.x.0       ← Data protection posture → breach notification scope
├── GDPR-ONT v1.0.0      ← Regulatory fine calculation (Art 83)
├── GRC-FW-ONT v3.0.0    ← Governance framework for control ownership
└── VP-ONT               ← vp:Benefit → rrr:Result (VP-RRR convention)
```

---

## 8. Cross-Epic Integration

### 7.1 Epic 67: QVF Skills (#986)

| Existing QVF Skill | Cyber Economics Extension |
|---|---|
| pfc-value-calc (Tier 1, adopted) | Consumes cyber-impact ALE as cost-avoidance cash flow |
| pfc-cost-model (Tier 2, candidate) | Provides remediation cost input to GRC ROI |
| pfc-benefit-realisation (Tier 2, candidate) | Tracks projected vs actual ALE reduction |
| pfc-resource-profile (Tier 2, candidate) | Resource requirements for GRC implementation |
| pfc-risk-appetite (Tier 3, candidate) | Risk appetite thresholds for acceptable ALE |
| pfc-qvf-pipeline (Tier 3, candidate) | Orchestrates full QVF chain including cyber economics |

### 7.2 Epic 73: Risk Intelligence (#1062)

| Risk Skill | Cyber Economics Feed |
|---|---|
| risk-profile (SKL-066) | Cyber risk profile feeds ALE scenario selection |
| risk-score (SKL-067) | P0–P3 scores map to SLE magnitude bands |
| risk-balance (SKL-068) | Balances remediation priority by financial impact |
| risk-report (SKL-070) | Includes ALE and GRC ROI in risk reporting |
| risk-learn (SKL-071) | Actual incidents calibrate ALE models |
| risk-waive (SKL-072) | Risk acceptance with quantified residual ALE exposure |

### 7.3 Epic 37: Threat Modelling (#517)

- pfc-owasp-threat-model → threat scenarios → pfc-qvf-threat-econ → financial overlay
- STRIDE/DREAD qualitative → FAIR quantitative transformation
- MITRE ATT&CK technique frequency → ARO estimation

---

## 9. Competitive Positioning

### 8.1 The "So What" Problem

Most security assessments end with: "You have 47 critical findings." The customer asks: "So what? What does that cost me? What should I spend to fix it?"

Our answer:

```text
"Your current ALE exposure is £2.3M/year across 12 threat scenarios.
 Fixing the top 5 findings costs £180K and reduces ALE to £890K.
 That's a £1.23M annual saving — ROI of 583% in year one.
 Your cyber insurance premium drops an estimated 18% (£45K/year saving).
 Your MCSB compliance score moves from 62% to 89%.
 Payback period: 2.1 months."
```

This is the conversation that opens budgets and wins engagements.

### 8.2 Insurance Broker Value

Cyber insurance brokers need evidence to negotiate premiums. Our GRC assessment produces broker-ready evidence:
- Unified posture score with trend
- Control-by-control MCSB compliance
- Threat model with controls mapped
- Incident response capability assessment
- AI governance maturity score

This makes the assessment valuable beyond the customer — the broker becomes a referral channel.

---

## 10. DMAIC Lifecycle Integration

| Phase | QVF Cyber Skills Used |
|---|---|
| **Define** | pfc-qvf-breach-model (cost categories), pfc-risk-appetite (acceptable ALE) |
| **Measure** | pfc-qvf-cyber-impact (ALE baseline), pfc-qvf-threat-econ (threat financial overlay) |
| **Analyse** | pfc-qvf-grc-roi (investment case), pfc-qvf-cyber-insure (insurance economics) |
| **Improve** | pfc-qvf-grc-value (unified value equation), pfc-grc-remediate (VE-prioritised by £) |
| **Control** | pfc-benefit-realisation (projected vs actual ALE), risk-learn (model calibration) |

---

## 11. Recommendations

1. **Approve F74.22–F74.24** — add QVF Cyber Economics features to Epic 74
2. **Scaffold 6 QVF cyber skills in pfc-dev** — parallel to GRC-MCSB skills
3. **Coordinate with Epic 67** — these are Tier 2 QVF skills consuming pfc-value-calc
4. **Build pfc-qvf-breach-model first** — foundational cost model that feeds all others
5. **Engage insurance brokers early** — validate insurer evidence requirements
6. **Add cyber economics test data** to TDD plan (TD-QVF-CYBER-BREACH, TD-QVF-CYBER-INSURE)
7. **Update pfc-alz-pipeline** to include QVF cyber skills in Stage 5 (Strategise)

---

## 12. Human Checkpoints

- [ ] Cyber Value Equation approved
- [ ] ALE methodology validated (FAIR alignment)
- [ ] Insurance premium model reviewed with broker input
- [ ] GRC ROI assumptions validated
- [ ] Breach cost model categories confirmed
- [ ] VP-RRR convention maintained for all quantified benefits

---

*PFI-AIRL-GRC-BRIEF-QVF-Cyber-Economics-Value-Quantification-v1.0.0*
*Epic 74 (#1074) — F74.22, F74.23, F74.24*
