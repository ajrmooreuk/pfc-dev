# pfc-qvf-cyber-impact — Annualised Loss Expectancy Calculator

**Skill ID:** pfc-qvf-cyber-impact
**Version:** v0.1.0 (scaffold)
**Type:** AGENT_SUPERVISED
**Feature:** F74.22a
**Epic:** [Epic 74 (#1074)](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/1074)

---

## Purpose

Calculate Annualised Loss Expectancy (ALE) per threat scenario and aggregate portfolio cyber risk exposure. Wires `cra:BusinessImpact.annualisedLossExpectancy` (Cyber-Risk-ONT) to financial outputs via FAIR methodology.

## Inputs

- pfc-grc-mcsb-assess domain scores (control effectiveness → exposure factor)
- pfc-owasp-threat-model threat scenarios (`cra:RiskScenario`)
- pfc-qvf-breach-model cost components (SLE breakdown)
- Industry ARO benchmarks (frequency data per threat type)
- `rmf:Risk.inherentRiskLevel` / `rmf:Risk.residualRiskLevel` (ISO 27005)

## Process

1. For each `cra:RiskScenario`, calculate SLE = Asset Value × Exposure Factor
2. Estimate ARO from threat model + industry benchmarks
3. Calculate ALE = SLE × ARO per scenario
4. Apply sensitivity scenarios (optimistic/base/pessimistic)
5. Aggregate Expected ALE = Σ(scenario_probability × scenario_ALE)
6. Calculate ΔALE (inherent − residual) for ROI downstream

## Outputs

- ALE per threat scenario (stored as `cra:BusinessImpact.annualisedLossExpectancy`)
- Aggregate portfolio ALE
- Sensitivity-adjusted Expected ALE
- ΔALE (before/after remediation) for pfc-qvf-grc-roi
- `qvf:CashFlow[category=COST_AVOIDANCE]` entries

## Ontology Surface

- Cyber-Risk-ONT v1.0.0 (`cra:BusinessImpact`, `cra:RiskScenario`)
- RMF-IS27005-ONT v1.0.0 (`rmf:Risk`, `rmf:RiskTreatment`)
- QVF-ONT v1.0.0 (`qvf:Assumption`, `qvf:SensitivityScenario`)
- ERM-ONT v1.0.0 (`erm:RiskAppetite` — acceptable ALE threshold)

## Downstream Consumers

- pfc-qvf-grc-roi (ΔALE for ROI calculation)
- pfc-qvf-cyber-insure (ALE for insurance economics)
- pfc-qvf-grc-value (unified cyber value equation)
- risk-report (SKL-070) — ALE in risk reporting
