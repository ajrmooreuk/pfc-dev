# pfc-qvf-threat-econ — Threat Model Financial Overlay (FAIR)

**Skill ID:** pfc-qvf-threat-econ
**Version:** v0.1.0 (scaffold)
**Type:** AGENT_SUPERVISED
**Feature:** F74.22b
**Epic:** [Epic 74 (#1074)](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/1074)

---

## Purpose

Apply FAIR (Factor Analysis of Information Risk) financial overlay to threat model outputs. Transforms qualitative threat scenarios into quantified risk economics: actor capability → ARO, vulnerability severity → exposure factor, asset criticality → asset value.

## Inputs

- pfc-owasp-threat-model output (threat actors, attack techniques, vulnerabilities)
- Asset inventory with business criticality and revenue attribution
- MITRE ATT&CK technique frequency data (ARO estimation)
- CVSS scores + exploitability metrics (exposure factor)
- `rmf:RiskContext` (ISO 27005 business context)

## Process

1. Map threat actors to capability + motivation → ARO estimate
2. Map attack techniques to MITRE ATT&CK frequency data → ARO refinement
3. Map vulnerabilities via CVSS + exploitability → Exposure Factor
4. Map assets to business criticality + revenue → Asset Value
5. Compose complete risk scenarios with financial parameters
6. Tag each parameter with `qvf:Assumption[sensitivity]` classification

## Outputs

- Financially-parameterised threat scenarios
- ARO estimates per threat type (with confidence intervals)
- Exposure factors per vulnerability class
- Asset valuations (tangible + intangible)
- `qvf:Assumption` entries for sensitivity analysis
- FAIR-compliant risk quantification data

## Ontology Surface

- Cyber-Risk-ONT v1.0.0 (`cra:ThreatActor`, `cra:AttackTechnique`, `cra:Vulnerability`)
- RMF-IS27005-ONT v1.0.0 (`rmf:RiskContext`, `rmf:Asset`, `rmf:Threat`, `rmf:Vulnerability`)
- QVF-ONT v1.0.0 (`qvf:Assumption`, `qvf:CalculationProvenance`)

## Downstream Consumers

- pfc-qvf-cyber-impact (consumes parameterised scenarios for ALE calculation)
- pfc-qvf-breach-model (cost component estimation)
