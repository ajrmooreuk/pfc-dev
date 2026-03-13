# pfc-qvf-cyber-insure — Cyber Insurance Premium Optimisation

**Skill ID:** pfc-qvf-cyber-insure
**Version:** v0.1.0 (scaffold)
**Type:** AGENT_SUPERVISED
**Feature:** F74.23
**Epic:** [Epic 74 (#1074)](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/1074)

---

## Purpose

Quantify cyber insurance economics: premium optimisation via improved GRC posture, excess/deductible reduction, coverage gap analysis, and insurer evidence packaging. Maps ISO 27005 risk transfer (`rmf:RiskTreatment.treatmentStrategy = transfer`) to financial outcomes.

## Inputs

- pfc-grc-posture unified score (current and projected)
- pfc-qvf-cyber-impact ALE data (residual risk after mitigation)
- Current policy details (premium, excess, exclusions, coverage limits)
- pfc-grc-mcsb-assess domain scores (insurer evidence)
- pfc-grc-mcsb-report compliance trend data

## Process

1. Calculate current premium baseline and excess exposure
2. Model projected premium after GRC posture improvement
3. Calculate ΔPremium (annual saving) and ΔExcess (reduced exposure)
4. Identify coverage gaps (exclusions × ALE for excluded scenarios)
5. Model coverage expansion available at improved posture
6. Calculate Insurance NPV over policy horizon
7. Compare transfer cost vs mitigation cost (optimal strategy selection)
8. Package insurer evidence from GRC assessment outputs

## Transfer Decision Logic

```text
If Premium < Residual_ALE × P(materialisation) → transfer is cost-effective
If Premium > Residual_ALE × P(materialisation) → mitigate or accept instead
Optimal Strategy = min(Mitigation_Cost, Transfer_Cost, Accepted_ALE)
```

## Outputs

- ΔPremium (projected annual saving)
- ΔExcess (reduced deductible exposure)
- Coverage gap analysis with financial impact
- Insurance NPV over policy horizon
- Transfer vs mitigate recommendation per risk
- Insurer evidence package (broker-ready)
- `qvf:CashFlow[category=COST_SAVING]` entries for premium reduction

## Ontology Surface

- RMF-IS27005-ONT v1.0.0 (`rmf:RiskTreatment[treatmentStrategy=transfer]`, `rmf:RiskTreatment.costEstimate`)
- QVF-ONT v1.0.0 (`qvf:CashFlow`, `qvf:EconomicCase`, `qvf:SensitivityScenario`)
- MCSB-ONT v2.0.0 (control effectiveness evidence)
- GRC-FW-ONT v3.0.0 (governance framework evidence)
- PII-ONT v3.x.0 (data protection posture)

## Downstream Consumers

- pfc-qvf-grc-value (insurance savings in unified cyber value equation)
- pfc-benefit-realisation (projected vs actual premium at renewal)
- pfc-narrative (insurance economics for proposals)
