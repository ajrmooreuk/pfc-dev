# pfc-qvf-grc-roi — GRC Investment ROI & Economic Case

**Skill ID:** pfc-qvf-grc-roi
**Version:** v0.1.0 (scaffold)
**Type:** AGENT_SUPERVISED
**Feature:** F74.24a
**Epic:** [Epic 74 (#1074)](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/1074)

---

## Purpose

Calculate GRC investment return: ROI, NPV, payback period, and full economic case comparing adaptive GRC vs point-in-time audit. Maps ISO 27005 risk mitigation (`rmf:RiskTreatment.treatmentStrategy = mitigate`) to investment economics.

## Inputs

- pfc-qvf-cyber-impact ΔALE (ALE_before − ALE_after)
- pfc-cost-model remediation cost estimates (`rmf:RiskTreatment.costEstimate`)
- pfc-qvf-cyber-insure ΔPremium (insurance savings)
- Customer resource constraints (budget, timeline)
- Discount rate for NPV calculation

## Core Formula

```text
GRC ROI = (ALE_before − ALE_after − Remediation_Cost) / Remediation_Cost × 100

Where:
  ALE_before  = current state ALE (from pfc-qvf-cyber-impact)
  ALE_after   = projected ALE after remediation
  Remediation_Cost = pfc-cost-model output for control implementation

QVF Integration:
  qvf:ValueModel.roi          = GRC ROI
  qvf:CashFlow[COST_AVOIDANCE] = ALE_before − ALE_after
  qvf:Assumption[sensitivity=HIGH] = ARO estimate, Exposure Factor
```

## Process

1. Aggregate ΔALE from pfc-qvf-cyber-impact
2. Aggregate remediation costs from pfc-cost-model
3. Calculate GRC ROI percentage
4. Build NPV model with cash flows over 1–5 year horizon
5. Calculate payback period (months to positive cumulative value)
6. Compare adaptive GRC TCO vs periodic audit TCO
7. Generate `qvf:EconomicCase` with full financial model
8. Apply sensitivity scenarios (optimistic/base/pessimistic)

## Outputs

- GRC ROI percentage
- NPV of risk reduction programme
- Payback period (months)
- 5-year TCO comparison (adaptive vs periodic)
- `qvf:EconomicCase` with complete cash flow model
- Sensitivity-adjusted projections
- Executive summary (board-ready investment case)

## Ontology Surface

- RMF-IS27005-ONT v1.0.0 (`rmf:RiskTreatment[treatmentStrategy=mitigate]`, `rmf:RiskTreatment.costEstimate`)
- QVF-ONT v1.0.0 (`qvf:ValueModel`, `qvf:CashFlow`, `qvf:EconomicCase`, `qvf:BreakEvenAnalysis`)
- Cyber-Risk-ONT v1.0.0 (`cra:BusinessImpact.annualisedLossExpectancy`)

## Downstream Consumers

- pfc-qvf-grc-value (ROI in unified cyber value equation)
- pfc-benefit-realisation (projected vs actual ROI tracking)
- pfc-slide-engine (investment case slides)
- pfc-proposal-composer (client-facing proposals)
