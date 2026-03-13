# pfc-qvf-cyber — QVF Cyber Economics Skills Family

**Epic:** [Epic 74 (#1074)](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/1074)
**Features:** F74.22 (QVF Cyber Economics), F74.23 (Cyber Insurance Optimisation), F74.24 (GRC ROI & Value Equation)
**Strategy Briefing:** `PFI-AIRL-GRC-BRIEF-QVF-Cyber-Economics-Value-Quantification-v1.0.0.md`

---

## Overview

6 skills that bridge technical security assessment to financial case — making every remediation a quantified investment decision rather than a compliance checkbox.

## Skills

| Skill | Purpose | Type | Feature |
|---|---|---|---|
| `pfc-qvf-cyber-impact` | Calculate ALE per threat scenario, aggregate portfolio risk | AGENT_SUPERVISED | F74.22a |
| `pfc-qvf-threat-econ` | FAIR financial overlay on threat model outputs | AGENT_SUPERVISED | F74.22b |
| `pfc-qvf-breach-model` | Breach cost model (direct, indirect, regulatory, reputational) | AGENT_AUTONOMOUS | F74.22c |
| `pfc-qvf-cyber-insure` | Cyber insurance premium optimisation & evidence packaging | AGENT_SUPERVISED | F74.23 |
| `pfc-qvf-grc-roi` | GRC investment ROI, NPV, payback, economic case | AGENT_SUPERVISED | F74.24a |
| `pfc-qvf-grc-value` | Unified Cyber Value Equation aggregation | AGENT_SUPERVISED | F74.24b |

## Skill Chain Flow

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
```

## Key Principle

These skills are **wiring, not new entities**. The ontology building blocks already exist:
- `cra:BusinessImpact.annualisedLossExpectancy` (Cyber-Risk-ONT)
- `rmf:RiskTreatment.costEstimate` (RMF-IS27005-ONT)
- `qvf:CashFlow[category=COST_AVOIDANCE]` (QVF-ONT)
- `risk-balance` formula (SKL-068, Epic 73)

The new skills are the **calculation engines** that activate these entities into actionable financial outputs.

## Ontology Dependencies

- QVF-ONT v1.0.0, Cyber-Risk-ONT v1.0.0, RMF-IS27005-ONT v1.0.0
- ERM-ONT v1.0.0, MCSB-ONT v2.0.0, PII-ONT v3.x.0, GDPR-ONT v1.0.0
- GRC-FW-ONT v3.0.0, VP-ONT (VP-RRR convention)

## ISO 27005 Risk Treatment Mapping

| Treatment | Skill | Financial Output |
|---|---|---|
| Mitigate | pfc-qvf-grc-roi | ROI of control implementation |
| Accept | pfc-qvf-cyber-impact | Quantified residual ALE |
| Transfer | pfc-qvf-cyber-insure | Insurance premium optimisation |
| Avoid | pfc-value-calc | Opportunity cost of avoided activity |
