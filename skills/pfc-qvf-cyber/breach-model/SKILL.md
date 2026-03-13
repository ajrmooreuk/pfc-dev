# pfc-qvf-breach-model — Breach Cost Model

**Skill ID:** pfc-qvf-breach-model
**Version:** v0.1.0 (scaffold)
**Type:** AGENT_AUTONOMOUS
**Feature:** F74.22c
**Epic:** [Epic 74 (#1074)](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/1074)

---

## Purpose

Model breach cost components (direct, indirect, regulatory, reputational) per threat scenario. Provides the SLE (Single Loss Expectancy) breakdown that feeds ALE calculation in pfc-qvf-cyber-impact.

## Inputs

- Threat scenario type (data breach, ransomware, supply chain, insider, AI/LLM, cloud misconfig)
- Asset inventory (data volume, record count, classification)
- Organisational context (revenue, employee count, industry sector)
- Regulatory obligations (GDPR, NIS2, DORA, PCI-DSS)
- `rmf:RiskContext` (ISO 27005 business context)
- PII-ONT data protection posture (breach notification scope)

## Cost Components

```text
SLE = Direct + Indirect + Regulatory + Reputational + Recovery + Third-Party

Where:
  Direct       = Incident response + forensics + legal + notification
  Indirect     = Business interruption (downtime × revenue per hour)
  Regulatory   = GDPR Art 83 (4% turnover) + NIS2 (€10M) + DORA fines
  Reputational = Customer churn × CLV + brand damage estimate
  Recovery     = Restore + rebuild + harden
  Third-Party  = Contractual liability + supply chain + class action
```

## Scenario Templates

| Scenario | Key Cost Drivers | Regulatory Exposure |
|---|---|---|
| Data breach (PII) | Notification × records, ICO fine | GDPR Art 83, DSPT |
| Ransomware | Downtime × revenue/hr, recovery | NIS2, DORA |
| Supply chain compromise | Third-party liability, SLA penalties | Contractual, NIS2 |
| Insider threat | Investigation, IP theft, competitive damage | Employment law |
| AI/LLM exploitation | Model retraining, data poisoning remediation | AI Act (emerging) |
| Cloud misconfiguration | Data exposure, compliance gap remediation | MCSB domain impact |

## Process

1. Select scenario template based on threat type
2. Parameterise cost components from organisational context
3. Apply regulatory multipliers from compliance obligations
4. Calculate SLE per component
5. Apply sensitivity ranges (optimistic/base/pessimistic)
6. Store as `qvf:CashFlow` entries with provenance

## Outputs

- SLE breakdown per cost component
- Scenario-specific cost model with sensitivity ranges
- Regulatory fine exposure calculation
- `qvf:CashFlow` entries per component
- `qvf:CalculationProvenance` (data sources, assumptions, confidence)

## Ontology Surface

- Cyber-Risk-ONT v1.0.0 (`cra:RiskScenario`, `cra:BusinessImpact`)
- RMF-IS27005-ONT v1.0.0 (`rmf:RiskContext`, `rmf:Asset`)
- QVF-ONT v1.0.0 (`qvf:CashFlow`, `qvf:Assumption`, `qvf:CalculationProvenance`)
- PII-ONT v3.x.0 (breach notification scope, data classification)
- GDPR-ONT v1.0.0 (Art 83 fine calculation)

## Downstream Consumers

- pfc-qvf-cyber-impact (SLE feeds ALE calculation)
- pfc-qvf-threat-econ (cost parameterisation)
- pfc-qvf-grc-roi (breach cost in ROI denominator context)
