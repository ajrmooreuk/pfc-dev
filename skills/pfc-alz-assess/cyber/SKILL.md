# pfc-alz-assess-cyber — Cyber & Security Posture Assessment Skill

**Skill ID:** pfc-alz-assess-cyber
**Version:** v0.1.0 (scaffold)
**Type:** AGENT_SUPERVISED
**Feature:** [F74.4](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/1074)
**Epic:** [Epic 74 (#1074)](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/1074)

---

## Purpose

Assess Azure security posture against MCSB v2.0.0 controls, GRC-FW-ONT governance framework, and NCSC CAF cyber outcomes using live compliance, RBAC, and diagnostic data.

## Azure Skills Consumed

| azure-skill | Security Domain | Data Extracted |
|---|---|---|
| `azure-compliance` | All | Azure Policy compliance, Defender for Cloud posture, regulatory compliance |
| `azure-rbac` | Identity | Role assignments, PIM status, service principals, Entra ID |
| `azure-diagnostics` | Monitoring | Security monitoring, alert rules, log coverage |
| `azure-observability` | Logging | Telemetry completeness, Log Analytics, Sentinel |
| `azure-storage` | Data Protection | Encryption, access controls, data classification |
| `entra-app-registration` | Identity | App registrations, service principal hygiene |
| `azure-ai` | AI Security | AI workload security, Responsible AI controls |
| `azure-aigateway` | AI Security | AI Gateway config, rate limiting, model access |

## Ontology Mapping

| MCSB Control Family | MCSB-ONT Entity | Key Controls |
|---|---|---|
| Network Security | `mcsb:NetworkSecurity` | NS-1 to NS-10 |
| Identity Management | `mcsb:IdentityManagement` | IM-1 to IM-9 |
| Privileged Access | `mcsb:PrivilegedAccess` | PA-1 to PA-8 |
| Data Protection | `mcsb:DataProtection` | DP-1 to DP-8 |
| Asset Management | `mcsb:AssetManagement` | AM-1 to AM-5 |
| Logging & Threat Detection | `mcsb:LoggingThreatDetection` | LT-1 to LT-7 |
| Incident Response | `mcsb:IncidentResponse` | IR-1 to IR-5 |
| Posture & Vulnerability | `mcsb:PostureVulnerability` | PV-1 to PV-6 |
| Endpoint Security | `mcsb:EndpointSecurity` | ES-1 to ES-3 |
| Backup & Recovery | `mcsb:BackupRecovery` | BR-1 to BR-4 |
| DevOps Security | `mcsb:DevOpsSecurity` | DS-1 to DS-7 |
| Governance & Strategy | `mcsb:GovernanceStrategy` | GS-1 to GS-10 |

## Cross-Framework Correlation

Each finding maps to:
- MCSB control (primary)
- WAF Security pillar (EA-MSFT-ONT:WAFPillar)
- NCSC CAF cyber outcomes (NCSC-CAF-ONT)
- GRC-FW-ONT governance controls
- OWASP where applicable (F40.40)

## RMF Integration

Every security finding → RMF-IS27005-ONT risk statement:
- Impact classification (confidentiality, integrity, availability)
- Likelihood assessment (threat landscape, exposure)
- Risk rating (Critical / High / Medium / Low)
- Residual risk after proposed control

## Inputs

- Azure tenant credentials (read-only)
- VE profile (security priorities, regulatory requirements)
- FDN context (industry sector, compliance obligations)

## Outputs

- MCSB control compliance scores (per family)
- NCSC CAF cyber outcome mapping
- RMF risk register (risk-rated findings)
- Security posture score (aggregated)
- Remediation priorities (VE-driven)
