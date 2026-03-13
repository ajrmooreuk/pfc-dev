# pfc-grc-mcsb-assess — MCSB Compliance Assessment Skill

**Skill ID:** pfc-grc-mcsb-assess
**Version:** v0.1.0 (scaffold)
**Type:** AGENT_SUPERVISED
**Feature:** F74.20a
**Epic:** [Epic 74 (#1074)](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/1074)

---

## Purpose

Assess current Microsoft Cloud Security Benchmark compliance posture per control domain using live MCP data from azure-compliance, scored via MCSB-ONT entities and cross-referenced to GRC-FW-ONT governance controls.

## Azure Skills Consumed

| azure-skill | Data Extracted |
|---|---|
| `azure-compliance` | Regulatory compliance state per MCSB initiative |
| `azure-rbac` | Identity and access assignments for IM/PA domains |
| `azure-diagnostics` | Logging configuration for LT domain |
| `azure-validate` | Resource configuration validation |

## Ontology Mapping

| MCSB Domain | MCSB-ONT Entity | Controls |
|---|---|---|
| Network Security | `mcsb:ControlDomain:NS` | NS-1 to NS-10 |
| Identity Management | `mcsb:ControlDomain:IM` | IM-1 to IM-9 |
| Privileged Access | `mcsb:ControlDomain:PA` | PA-1 to PA-8 |
| Data Protection | `mcsb:ControlDomain:DP` | DP-1 to DP-8 |
| Logging & Threat Detection | `mcsb:ControlDomain:LT` | LT-1 to LT-7 |
| Posture & Vulnerability | `mcsb:ControlDomain:PV` | PV-1 to PV-6 |
| Endpoint Security | `mcsb:ControlDomain:ES` | ES-1 to ES-3 |
| Backup & Recovery | `mcsb:ControlDomain:BR` | BR-1 to BR-4 |
| Asset Management | `mcsb:ControlDomain:AM` | AM-1 to AM-5 |
| Governance & Strategy | `mcsb:ControlDomain:GS` | GS-1 to GS-10 |
| DevOps Security | `mcsb:ControlDomain:DS` | DS-1 to DS-7 |
| Incident Response | `mcsb:ControlDomain:IR` | IR-1 to IR-6 |
| AI Security (v2 only) | `mcsb2:ControlDomain:AI` | AI-1 to AI-7 |

## Inputs

```text
- Azure tenant credentials (read-only)
- MCSB version target: v1 | v2
- Scope: subscription ID(s) or management group
- Customer priority weighting (VE-derived, optional)
```

## Process

1. Invoke `azure-compliance` → extract regulatory compliance state for MCSB initiative
2. Map each compliance finding to MCSB-ONT `SecurityControl` entities
3. Score per domain (0–100%) using scoring-model methodology
4. Cross-reference non-compliant controls to GRC-FW-ONT governance policies
5. Generate RMF risk statement per non-compliant control via RMF-IS27005-ONT
6. If MCSB v2 target: include AI Security domain (AI-1 to AI-7)

## Outputs

```text
- MCSB compliance scorecard (12 domains + AI if v2)
- Non-compliant controls with remediation guidance
- RMF risk register entries (ERM-ONT format)
- Cross-framework references (NCSC CAF, WAF Security pillar)
- Domain-level traffic light status (Red/Amber/Green)
```

## Human Checkpoint

Findings Review — architect validates scores and non-compliance before downstream consumption.

## Downstream Consumers

- pfc-grc-mcsb-benchmark (three-state gap analysis)
- pfc-grc-posture (unified score aggregation)
- pfc-grc-remediate (prioritised remediation backlog)
- risk-profile (Epic 73, SKL-066)
