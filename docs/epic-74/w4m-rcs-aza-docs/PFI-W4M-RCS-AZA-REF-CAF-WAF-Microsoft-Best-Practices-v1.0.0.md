# PFI-W4M-RCS-AZA — Microsoft CAF/WAF Best Practices Reference

> **Product:** PFI-W4M-RCS-AZA — Azure Landing Zone & WAF Assessment Platform
> **Purpose:** Curated reference index of Microsoft Cloud Adoption Framework (CAF), Well-Architected Framework (WAF), Azure Landing Zone (ALZ) design areas, and Microsoft Cloud Security Benchmark (MCSB) documentation
> **Version:** v1.0.0
> **Generated:** 2026-03-13

---

## Table of Contents

1. [CAF — Cloud Adoption Framework](#1-caf--cloud-adoption-framework)
2. [ALZ — Azure Landing Zone Design Areas](#2-alz--azure-landing-zone-design-areas)
3. [WAF — Well-Architected Framework Pillars](#3-waf--well-architected-framework-pillars)
4. [MCSB — Microsoft Cloud Security Benchmark](#4-mcsb--microsoft-cloud-security-benchmark)
5. [CAF Governance & Compliance](#5-caf-governance--compliance)
6. [Assessment Tools](#6-assessment-tools)
7. [Cross-Reference to AIRL Scoring Model](#7-cross-reference-to-airl-scoring-model)

---

## 1. CAF — Cloud Adoption Framework

The Microsoft Cloud Adoption Framework (CAF) is a structured roadmap covering seven core methodologies. The foundational methodologies (Strategy, Plan, Ready, Adopt) are sequential; the operational methodologies (Govern, Secure, Manage) are ongoing.

### 1.1 Core Methodology URLs

| Methodology | URL | Description |
|---|---|---|
| **CAF Overview** | https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ | Root landing page |
| **CAF Introduction** | https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/overview | Seven-methodology overview |
| **Strategy** | https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/strategy/ | Business outcomes, motivations, financial considerations |
| **Plan** | https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/plan/prepare-organization-for-cloud | Digital estate rationalisation, adoption plan |
| **Ready** | https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ready/landing-zone/ | Landing zone setup — see §2 below |
| **Adopt (Migrate)** | https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/migrate/ | Workload migration best practices |
| **Adopt (Innovate)** | https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/innovate/ | Cloud-native innovation |
| **Govern** | https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/govern/corporate-policy | Governance methodology — see §5 below |
| **Secure** | https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/secure/overview | Security methodology |
| **Manage** | https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/manage/ready-cloud-operations | Operations management (RAMP approach) |
| **AI Adoption** | https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/scenarios/ai/ | AI-specific CAF guidance |

### 1.2 CAF Training

| Resource | URL |
|---|---|
| Introduction to CAF (Microsoft Learn module) | https://learn.microsoft.com/en-us/training/modules/cloud-adoption-framework/ |

---

## 2. ALZ — Azure Landing Zone Design Areas

Azure Landing Zones define 8 design areas. These map directly to our DA-1 through DA-8 scoring model in the ALZ assessment.

### 2.1 Design Area Master Index

| DA# | Design Area | URL |
|---|---|---|
| — | **All Design Areas (index)** | https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ready/landing-zone/design-areas |
| — | **Design Principles** | https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ready/landing-zone/design-principles |
| DA-1 | **Billing & Microsoft Entra Tenant** | https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ready/landing-zone/design-area/azure-billing-microsoft-entra-tenant |
| DA-2 | **Identity & Access Management** | https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ready/landing-zone/design-area/identity-access |
| DA-2b | Identity — Landing Zone Specifics | https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ready/landing-zone/design-area/identity-access-landing-zones |
| DA-3 | **Resource Organisation** | https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ready/landing-zone/design-area/resource-org |
| DA-3b | Management Groups | https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ready/landing-zone/design-area/resource-org-management-groups |
| DA-4 | **Network Topology & Connectivity** | https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ready/landing-zone/design-area/network-topology-and-connectivity |
| DA-5 | **Security** | https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ready/landing-zone/design-area/security |
| DA-6 | **Management** | https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ready/landing-zone/design-area/management |
| DA-6b | Application Development Environments | https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ready/landing-zone/design-area/management-application-environments |
| DA-7 | **Governance** | https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ready/landing-zone/design-area/governance |
| DA-8 | **Platform Automation & DevOps** | https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ready/landing-zone/design-area/platform-automation-devops |

### 2.2 Landing Zone Implementation

| Resource | URL |
|---|---|
| What is an Azure Landing Zone? | https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ready/landing-zone/ |
| Implementation Options (Bicep/Terraform) | https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ready/landing-zone/implementation-options |
| Deploy Azure Landing Zones (Architecture Center) | https://learn.microsoft.com/en-us/azure/architecture/landing-zones/landing-zone-deploy |
| Landing Zone Regions | https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ready/considerations/regions |

---

## 3. WAF — Well-Architected Framework Pillars

The Well-Architected Framework defines 5 pillars. These map to our WAF pillar scoring model (1–5 maturity, Initial→Optimised).

### 3.1 WAF Core URLs

| Resource | URL |
|---|---|
| **WAF Overview** | https://learn.microsoft.com/en-us/azure/well-architected/ |
| **What is WAF?** | https://learn.microsoft.com/en-us/azure/well-architected/what-is-well-architected-framework |
| **All Pillars (index)** | https://learn.microsoft.com/en-us/azure/well-architected/pillars |
| **What's New** | https://learn.microsoft.com/en-us/azure/well-architected/whats-new |
| **Service Guides** | https://learn.microsoft.com/en-us/azure/well-architected/service-guides/ |

### 3.2 Pillar Documentation

| Pillar | Documentation | Checklist | Design Principles | Tradeoffs |
|---|---|---|---|---|
| **Reliability** | https://learn.microsoft.com/en-us/azure/well-architected/reliability/ | https://learn.microsoft.com/en-us/azure/well-architected/reliability/checklist | https://learn.microsoft.com/en-us/azure/well-architected/reliability/principles | https://learn.microsoft.com/en-us/azure/well-architected/reliability/tradeoffs |
| **Security** | https://learn.microsoft.com/en-us/azure/well-architected/security/ | https://learn.microsoft.com/en-us/azure/well-architected/security/checklist | https://learn.microsoft.com/en-us/azure/well-architected/security/principles | https://learn.microsoft.com/en-us/azure/well-architected/security/tradeoffs |
| **Cost Optimisation** | https://learn.microsoft.com/en-us/azure/well-architected/cost-optimization/ | https://learn.microsoft.com/en-us/azure/well-architected/cost-optimization/checklist | https://learn.microsoft.com/en-us/azure/well-architected/cost-optimization/principles | https://learn.microsoft.com/en-us/azure/well-architected/cost-optimization/tradeoffs |
| **Operational Excellence** | https://learn.microsoft.com/en-us/azure/well-architected/operational-excellence/ | https://learn.microsoft.com/en-us/azure/well-architected/operational-excellence/checklist | https://learn.microsoft.com/en-us/azure/well-architected/operational-excellence/principles | https://learn.microsoft.com/en-us/azure/well-architected/operational-excellence/tradeoffs |
| **Performance Efficiency** | https://learn.microsoft.com/en-us/azure/well-architected/performance-efficiency/ | https://learn.microsoft.com/en-us/azure/well-architected/performance-efficiency/checklist | https://learn.microsoft.com/en-us/azure/well-architected/performance-efficiency/principles | https://learn.microsoft.com/en-us/azure/well-architected/performance-efficiency/tradeoffs |

### 3.3 Reliability Pillar — Detailed Recommendations

| Ref | Topic | URL |
|---|---|---|
| RE01 | Simplify & Efficiency | https://learn.microsoft.com/en-us/azure/well-architected/reliability/simplify |
| RE02 | Identify & Rate Flows | https://learn.microsoft.com/en-us/azure/well-architected/reliability/identify-flows |
| RE03 | Failure Mode Analysis | https://learn.microsoft.com/en-us/azure/well-architected/reliability/failure-mode-analysis |
| RE04 | Define Reliability Targets | https://learn.microsoft.com/en-us/azure/well-architected/reliability/metrics |
| RE05 | Redundancy | https://learn.microsoft.com/en-us/azure/well-architected/reliability/redundancy |
| RE06 | Scaling Strategy | https://learn.microsoft.com/en-us/azure/well-architected/reliability/scaling |
| RE07 | Self-Preservation | https://learn.microsoft.com/en-us/azure/well-architected/reliability/self-preservation |
| RE08 | Testing Strategy | https://learn.microsoft.com/en-us/azure/well-architected/reliability/testing-strategy |
| RE09 | Disaster Recovery | https://learn.microsoft.com/en-us/azure/well-architected/reliability/disaster-recovery |
| RE10 | Monitoring & Alerting | https://learn.microsoft.com/en-us/azure/well-architected/reliability/monitoring-alerting-strategy |

### 3.4 WAF Maturity Model

| Resource | URL |
|---|---|
| Maturity Model Assessment | https://learn.microsoft.com/en-us/assessments/af7d9889-8cb2-4b8b-b6bb-e5a2e2f2a59c/ |
| Reliability Maturity Model | https://learn.microsoft.com/en-us/azure/well-architected/reliability/maturity-model |

---

## 4. MCSB — Microsoft Cloud Security Benchmark

The MCSB provides security control recommendations mapped to Azure services, AWS, and GCP. v2 (preview) adds AI security controls and 420+ Azure Policy built-in definitions.

### 4.1 MCSB Core URLs

| Resource | URL |
|---|---|
| **MCSB Overview** | https://learn.microsoft.com/en-us/security/benchmark/azure/ |
| **MCSB Introduction** | https://learn.microsoft.com/en-us/security/benchmark/azure/introduction |
| **MCSB v1 Overview** | https://learn.microsoft.com/en-us/security/benchmark/azure/overview-mcsb-v1 |
| **MCSB v2 Overview (Preview)** | https://learn.microsoft.com/en-us/security/benchmark/azure/overview |

### 4.2 MCSB Security Domains

| Domain | URL |
|---|---|
| **Governance & Strategy** | https://learn.microsoft.com/en-us/security/benchmark/azure/mcsb-governance-strategy |
| **Posture & Vulnerability Management (v2)** | https://learn.microsoft.com/en-us/security/benchmark/azure/mcsb-v2-posture-vulnerability-management |
| **AI Security (v2)** | https://learn.microsoft.com/en-us/security/benchmark/azure/mcsb-v2-artificial-intelligence-security |
| Network Security (NS) | https://learn.microsoft.com/en-us/security/benchmark/azure/mcsb-network-security |
| Identity Management (IM) | https://learn.microsoft.com/en-us/security/benchmark/azure/mcsb-identity-management |
| Privileged Access (PA) | https://learn.microsoft.com/en-us/security/benchmark/azure/mcsb-privileged-access |
| Data Protection (DP) | https://learn.microsoft.com/en-us/security/benchmark/azure/mcsb-data-protection |
| Asset Management (AM) | https://learn.microsoft.com/en-us/security/benchmark/azure/mcsb-asset-management |
| Logging & Threat Detection (LT) | https://learn.microsoft.com/en-us/security/benchmark/azure/mcsb-logging-threat-detection |
| Incident Response (IR) | https://learn.microsoft.com/en-us/security/benchmark/azure/mcsb-incident-response |
| Backup & Recovery (BR) | https://learn.microsoft.com/en-us/security/benchmark/azure/mcsb-backup-recovery |
| DevOps Security (DS) | https://learn.microsoft.com/en-us/security/benchmark/azure/mcsb-devops-security |

### 4.3 MCSB Azure Policy Integration

| Resource | URL |
|---|---|
| MCSB in Defender for Cloud | https://learn.microsoft.com/en-us/azure/defender-for-cloud/concept-regulatory-compliance |
| MCSB Regulatory Compliance (Policy) | https://learn.microsoft.com/en-us/azure/governance/policy/samples/azure-security-benchmark |
| MCSB Azure Gov Compliance (Policy) | https://learn.microsoft.com/en-us/azure/governance/policy/samples/gov-azure-security-benchmark |

---

## 5. CAF Governance & Compliance

### 5.1 Governance Methodology

The CAF Govern methodology: Build team → Assess risks → Document policies → Enforce policies → Monitor governance.

| Resource | URL |
|---|---|
| **Govern Overview** | https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/govern/corporate-policy |
| Build a Governance Team | https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/govern/build-cloud-governance-team |
| Document Governance Policies | https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/govern/document-cloud-governance-policies |
| Enforce Governance Policies | https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/govern/enforce-cloud-governance-policies |
| Securely Govern Cloud Estate | https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/secure/govern |

### 5.2 Azure Policy

| Resource | URL |
|---|---|
| **Azure Policy Overview** | https://learn.microsoft.com/en-us/azure/governance/policy/overview |
| Setup Guide: Governance & Compliance | https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ready/azure-setup-guide/governance-compliance |
| CAF Foundation Blueprint | https://learn.microsoft.com/en-us/azure/governance/blueprints/samples/caf-foundation/ |

---

## 6. Assessment Tools

| Tool | URL | Description |
|---|---|---|
| **Azure Well-Architected Review** | https://learn.microsoft.com/en-us/assessments/azure-architecture-review/ | ~60 questions across 5 pillars — free, iterative scoring |
| **WAF Maturity Model Assessment** | https://learn.microsoft.com/en-us/assessments/af7d9889-8cb2-4b8b-b6bb-e5a2e2f2a59c/ | Maturity assessment per pillar |
| WAF Assessment via Azure Advisor | https://learn.microsoft.com/en-us/azure/advisor/advisor-assessments | In-portal WAF assessment integration |
| Implementing WAF Recommendations | https://learn.microsoft.com/en-us/azure/well-architected/design-guides/implementing-recommendations | Post-assessment implementation guide |
| Well-Architected for Industry | https://learn.microsoft.com/en-us/industry/well-architected/overview | Industry-specific WAF guidance |

---

## 7. Cross-Reference to AIRL Scoring Model

This reference index maps to the PFI-W4M-RCS-AZA assessment framework as follows:

| AIRL Component | Weight | Microsoft Source | Section |
|---|---|---|---|
| ALZ Design Areas (DA-1→DA-8) | 35% | CAF → ALZ Design Areas | §2 |
| WAF Pillars (5) | 20% | Well-Architected Framework | §3 |
| MCSB Controls | 15% | Microsoft Cloud Security Benchmark | §4 |
| PbD (Privacy by Design) | 15% | ISO 31700 + ICO UK GDPR | External |
| SbD (Security by Design) | 10% | NCSC CAF + MCSB | §4 + External |
| Compliance | 5% | Azure Policy + Regulatory | §5 |

### Related Documents

| Document | Location |
|---|---|
| ALZ Assessment Strategy Brief | `PBS/DOCS/PFI-W4M-RCS-AZA-STRAT-BRIEF-Azure-Landing-Zone-Assessment-v1.0.0.md` |
| ALZ + WAF Assessment Scope | `PBS/DOCS/PFI-W4M-RCS-AZA-SCOPE-ALZ-WAF-Assessment-v1.0.0.md` |
| MCSB Security Benchmarks (converted) | `PBS/DOCS/PFI-W4M-RCS-AZA-REF-MCSB-Security-Benchmarks-v2.md` |
| WAF Framework Spine (converted) | `PBS/DOCS/PFI-W4M-RCS-AZA-REF-WAF-Framework-Spine-v1.0.0.md` |
| Azure Health Check Example | `PBS/DOCS/CUSTOMER-Azure-Health-Check-v1.1.docx` |
| Assessment Platform Architecture | `PBS/DOCS/PFC-GRC-BRIEF-Azure-RCS-Assessment-Platform-v1.0.0.md` |
| Generic Risk Management Framework | `PBS/DOCS/PFC-GRC-BRIEF-Generic-Risk-Management-Framework-v1.0.0.md` |
| Azure Assessments Strategy | `PBS/DOCS/PFI-W4M-RCS-AZA-STRAT-BRIEF-Azure-Assessments-Strategy-v1.0.0.md` |
| AZALZ-ONT (Ontology — placeholder) | `Azlan-EA-AAA/PBS/ONTOLOGIES/ontology-library/RCSG-Series/GRC-04-SEC/AZALZ-ONT/` |

---

*This reference index is maintained as part of the PFI-W4M-RCS-AZA assessment platform documentation set.*
