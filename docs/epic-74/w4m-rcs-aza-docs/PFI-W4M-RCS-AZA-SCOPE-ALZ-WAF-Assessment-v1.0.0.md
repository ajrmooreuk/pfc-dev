# Azure Landing Zone & Well-Architected Framework Assessment Scope

> **Document Reference:** PFI-W4M-RCS-AZA-SCOPE-ALZ-WAF-Assessment-v1.0.0.md
> **Document Type:** Assessment Scope Definition
> **Version:** 1.0.0 | **Date:** 2026-03-12
> **Author:** Amanda Moore — AI BI & Digital Transformation Consultant Architect
> **Classification:** Client Deliverable — Pre-Engagement
> **PFC Lineage:** [Epic 16 (#91)](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/91) — Azlan-EA-AAA
> **AIRL Staging:** [Epic 3 (#50)](https://github.com/ajrmooreuk/pfi-airl-caf-aza-dev/issues/50) · [F3.6 (#161)](https://github.com/ajrmooreuk/pfi-airl-caf-aza-dev/issues/161)
> **Epic 68:** [#1005](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/1005) — Azure Assessment Platform via Azure-RCS Instance
> **Companion Brief:** `PFI-W4M-RCS-AZA-STRAT-BRIEF-Azure-Landing-Zone-Assessment-v1.0.0.md`

---

## 1. Executive Summary

This document defines the scope, methodology, and maturity scoring framework for conducting an Azure Landing Zone (ALZ) Assessment combined with a Microsoft Azure Well-Architected Framework (WAF) Review. The assessment is structured around Microsoft's **eight ALZ Design Areas** and **five WAF Pillars**, providing a holistic evaluation of an organisation's Azure environment maturity — from foundational platform design through to workload-level architectural excellence.

The assessment is designed to be conducted as a structured engagement (typically 2–4 weeks depending on environment complexity) and produces a scored maturity baseline, gap analysis, and prioritised remediation roadmap aligned to the Microsoft Cloud Adoption Framework (CAF).

---

## 2. Assessment Objectives

The assessment serves four primary objectives:

| # | Objective | Description |
|---|---|---|
| **1** | **Baseline Current State** | Establish a quantified maturity score across all ALZ design areas and WAF pillars, providing a defensible starting point for improvement planning |
| **2** | **Identify Architectural Gaps** | Surface misalignments between the current Azure environment and Microsoft's recommended Landing Zone conceptual architecture, with particular attention to security posture, governance controls, and network segmentation |
| **3** | **Define Target Architecture** | Map a clear path from current state to a target state aligned with the ALZ conceptual architecture, incorporating the organisation's specific regulatory, operational, and commercial requirements |
| **4** | **Produce Actionable Roadmap** | Deliver a prioritised, phased remediation plan with estimated effort, risk ratings, and dependencies that can be integrated into the organisation's programme planning |

---

## 3. Assessment Framework Structure

The assessment combines two complementary Microsoft frameworks into a unified evaluation model.

### 3.1 Azure Landing Zone Design Areas (Platform Level)

These eight design areas evaluate the foundational platform upon which all workloads are deployed. They are assessed in the recommended dependency sequence.

---

#### DA-1: Azure Billing and Microsoft Entra Tenant

**Scope:** Evaluate the billing arrangement (EA, MCA, CSP, PAYG), tenant configuration, and the relationship between billing entities and the Azure resource hierarchy.

**Key Questions:**
- Which billing arrangement is in place and does it support the organisation's scale requirements?
- What is the current Microsoft Entra ID (formerly Azure AD) tenant configuration?
- Is there a single-tenant or multi-tenant strategy and is it appropriate for the operating model?

**Maturity Spectrum:**

| Level | Description |
|---|---|
| **Poor** | No formal billing arrangement; resources deployed under individual PAYG subscriptions with no cost visibility or allocation. Single Entra ID tenant with no governance over tenant-level settings. |
| **Basic** | EA or MCA in place but billing structure does not reflect organisational hierarchy. Entra ID tenant exists but directory configuration is default with no hardening applied. |
| **Good** | Billing arrangement aligns to organisational structure with departments/accounts mapped. Entra ID tenant has basic security defaults enabled, custom domain registered. |
| **Excellent** | Billing hierarchy fully reflects management group structure with chargeback/showback. Entra ID tenant hardened with Conditional Access baseline, security defaults replaced with targeted policies, PIM configured for privileged roles, tenant-level settings reviewed and locked down. |

---

#### DA-2: Identity and Access Management

**Scope:** Evaluate authentication, authorisation, RBAC practices, privileged access management, external identity handling, and monitoring of identity-related events.

**Key Questions:**
- Which services/features are used to authenticate and authorise access to Azure resources?
- Which users are those services applied to (all users, privileged only, external)?
- Have emergency access ("break glass") accounts been implemented for Microsoft Entra ID?
- What is the current monitoring, logging, and alerting implementation for authentication and authorisation activity?
- How do external users (partners, vendors) gain access to manage Azure resources?
- What RBAC practices are used when granting access (least privilege, group-based, time-bounded)?
- How are RBAC role definitions managed (built-in only, custom roles, regular review)?

**Maturity Spectrum:**

| Level | Description |
|---|---|
| **Poor** | No MFA enforcement. Shared accounts in use. No PIM. No break-glass accounts. No logging of sign-in or audit events. External users given direct subscription-level access with permanent Owner roles. |
| **Basic** | MFA enabled via Security Defaults. Some privileged accounts identified but PIM not configured. Break-glass accounts exist but are not tested. Basic Entra ID sign-in logs retained at default. External users managed ad-hoc via guest accounts. |
| **Good** | Conditional Access policies replace Security Defaults with targeted MFA and device compliance. PIM configured for Global Admin and key Azure roles. Break-glass accounts documented and tested quarterly. Sign-in and audit logs forwarded to Log Analytics. External access managed through Entra ID B2B with access reviews. RBAC assignments follow least-privilege with group-based assignment at management group level. |
| **Excellent** | Zero Trust identity model implemented. All privileged access is JIT via PIM with approval workflows and access reviews. Passwordless authentication deployed for privileged users. Comprehensive Entra ID monitoring with Sentinel integration, anomaly detection, and automated response playbooks. External access governed by Entitlement Management with access packages, time-bounded assignments, and mandatory quarterly reviews. Custom RBAC roles defined only where built-in roles are insufficient, with regular attestation and removal of orphaned assignments. |

---

#### DA-3: Resource Organisation

**Scope:** Evaluate Management Group hierarchy, subscription strategy, and subscription provisioning processes.

**Key Questions:**
- What is the current Management Group structure and does it align with the ALZ conceptual architecture?
- How are subscriptions organised and democratised across teams?
- How are new subscriptions provisioned (manual, automated, vending machine)?

**Maturity Spectrum:**

| Level | Description |
|---|---|
| **Poor** | No Management Groups in use. All resources in one or two subscriptions. Subscriptions created manually via portal with no naming convention or tagging. |
| **Basic** | Management Groups exist but do not follow ALZ recommended hierarchy. Multiple subscriptions but not consistently organised by workload or environment. Subscriptions requested via ticket with manual provisioning. |
| **Good** | Management Group hierarchy follows ALZ pattern (Platform/Landing Zones/Sandbox/Decommissioned). Subscriptions organised by workload with environment separation. Subscription provisioning semi-automated with governance guardrails. |
| **Excellent** | Full ALZ Management Group hierarchy implemented with dedicated Platform, Corp, Online, and Sandbox Management Groups. Subscription vending machine automated via IaC with policy assignment inheritance. New subscriptions provisioned in minutes with pre-configured governance, networking, and RBAC inherited from parent MG. |

---

#### DA-4: Network Topology and Connectivity

**Scope:** Evaluate network architecture (Hub-Spoke or Virtual WAN), on-premises connectivity, IP address management, DNS resolution, PaaS connectivity, inbound/outbound internet security, NSG strategy, and traffic inspection.

**Key Questions:**
- Has the organisation implemented a Hub-Spoke or Virtual WAN topology and is it appropriate?
- What is the connectivity strategy to on-premises and other cloud environments?
- Is there a documented IP address management (IPAM) strategy spanning Azure, on-premises, and multi-cloud?
- How is connectivity to Azure PaaS services secured (Private Endpoints, Service Endpoints, public)?
- How is inbound HTTP/S traffic from the internet protected (WAF, DDoS, Front Door)?
- What is the outbound internet access strategy (centralised NVA, Azure Firewall, distributed)?
- How are NSGs used to protect east-west traffic across subnets and the platform?
- What is the traffic inspection strategy (Azure Firewall, third-party NVA, no inspection)?
- How is central DNS name resolution implemented?

**Maturity Spectrum:**

| Level | Description |
|---|---|
| **Poor** | Flat network with no hub-spoke architecture. No on-premises connectivity planning. Public endpoints exposed on PaaS services. No WAF or DDoS protection. Default outbound internet access. No NSG rules beyond defaults. No DNS strategy. |
| **Basic** | Hub-spoke exists but hub is undersized or not centrally managed. VPN to on-premises but no redundancy. Some Private Endpoints for critical PaaS but inconsistent. Basic NSGs on some subnets. Azure-provided DNS only. |
| **Good** | Hub-spoke or VWAN deployed per ALZ guidance with centrally managed hub. ExpressRoute or VPN with redundancy. IPAM documented and non-overlapping. Private Endpoints enforced for data-plane PaaS access. Azure Firewall or NVA for centralised outbound. NSGs on all subnets with flow logs enabled. Azure Private DNS Zones for PaaS resolution. |
| **Excellent** | Fully segmented network with dedicated connectivity, management, and identity subscriptions. ExpressRoute with Global Reach or VWAN with secured hubs. Comprehensive IPAM integrated with Azure IPAM tool. All PaaS data-plane access via Private Endpoints with public access disabled. Azure Firewall Premium with TLS inspection and IDPS. NSG flow logs analysed via Traffic Analytics. Azure DNS Private Resolver for hybrid DNS with conditional forwarding. DDoS Protection Standard on all VNets with public-facing workloads. |

---

#### DA-5: Security

**Scope:** Evaluate security baseline definition, threat protection, service enablement controls, and security monitoring across the platform.

**Key Questions:**
- How does the organisation meet its security requirements in Azure?
- How is it determined whether to allow or deny specific Azure services in the environment?

**Maturity Spectrum:**

| Level | Description |
|---|---|
| **Poor** | No documented security baseline. Microsoft Defender for Cloud not enabled. No service restriction policies. No centralised security monitoring. |
| **Basic** | Defender for Cloud enabled in free tier. Some Azure Policy for service restrictions but inconsistent. Security alerts reviewed ad-hoc. |
| **Good** | Defender for Cloud enabled across all subscriptions with CSPM and workload protection plans. Azure Policy deny effects used to restrict unapproved services. Microsoft Sentinel deployed with core data connectors. Security MG established per updated ALZ guidance. |
| **Excellent** | Full Defender CSPM and all relevant Defender plans enabled. Service allow-listing enforced via Policy with exemption workflow. Sentinel deployed in dedicated Security subscription with comprehensive connector coverage, custom analytics rules, automated investigation and response (SOAR) playbooks, and threat hunting workbooks. Regular purple-team exercises validate detection coverage. Regulatory compliance dashboard maintained against relevant frameworks (ISO 27001, SOC 2, PCI DSS etc.). |

---

#### DA-6: Management

**Scope:** Evaluate logging, monitoring, compliance assurance, and operational visibility across the platform.

**Key Questions:**
- How are logs retained for insights and analytics?
- How is Azure resource configuration compliance assured against organisational and regulatory standards?

**Maturity Spectrum:**

| Level | Description |
|---|---|
| **Poor** | No centralised logging. Activity logs at default 90-day retention only. No compliance monitoring. |
| **Basic** | Log Analytics workspace exists but not all resources send diagnostics. Default retention periods. Azure Policy assigned but compliance not actively monitored. |
| **Good** | Centralised Log Analytics workspace(s) with platform and workload diagnostic settings configured. Retention aligned to regulatory requirements. Azure Policy compliance dashboard reviewed regularly with remediation tasks tracked. Azure Monitor alerts configured for platform health. |
| **Excellent** | Tiered logging strategy (hot/warm/cold) with Log Analytics for operational data and Storage/Event Hubs for long-term archival. All Azure resource types sending diagnostic logs. Azure Monitor baseline alerts deployed for all platform components (per ALZ baseline alert set). Azure Policy compliance integrated into CI/CD with drift detection and automated remediation where safe. Azure Update Manager or equivalent for patching. Azure Backup and Azure Site Recovery configured per business continuity requirements. |

---

#### DA-7: Governance

**Scope:** Evaluate cost management, tagging strategy, and spend optimisation practices.

**Key Questions:**
- How are costs tracked for Azure resources?
- How is resource tagging used within the environment?
- How is spending optimisation ensured?

**Maturity Spectrum:**

| Level | Description |
|---|---|
| **Poor** | No cost tracking beyond the invoice. No tagging strategy. No awareness of Azure Advisor cost recommendations. |
| **Basic** | Cost Management + Billing used occasionally. Some tags applied but no enforcement. Azure Advisor recommendations reviewed periodically. |
| **Good** | Cost Management configured with budgets and alerts per subscription/MG. Mandatory tagging enforced via Azure Policy (cost centre, environment, owner). Azure Advisor recommendations integrated into regular operational reviews. Reserved Instances evaluated for steady-state workloads. |
| **Excellent** | FinOps practice established with dedicated function or embedded capability. Comprehensive tagging taxonomy enforced via Policy with automated inheritance. Cost allocation using tags and MG structure for full showback/chargeback. Savings Plans and Reserved Instances actively managed. Anomaly detection alerts configured. Cost optimisation integrated into architecture review process. |

---

#### DA-8: Platform Automation and DevOps

**Scope:** Evaluate IaC practices, deployment pipelines, team collaboration models, Azure Policy usage, and organisational structure for platform management.

**Key Questions:**
- How are changes to the Azure Landing Zone environment managed and deployed?
- How do different teams collaborate to deploy and manage Azure resources?
- Which Azure Policy effects are used to control and audit subscriptions and resources?
- How are teams structured internally to interact and manage Azure?

**Maturity Spectrum:**

| Level | Description |
|---|---|
| **Poor** | All changes made via Azure Portal manually. No IaC. No CI/CD. Siloed teams with no collaboration framework. Azure Policy not used or only default assignments. |
| **Basic** | Some ARM/Bicep templates used but not consistently. Manual deployments via CLI/Portal still common. Teams collaborate informally. Azure Policy assigned but effects limited to Audit. |
| **Good** | Platform landing zone managed via IaC (Bicep/Terraform) with CI/CD pipelines in Azure DevOps or GitHub Actions. Workload teams use IaC for their resources with platform team providing guardrails. Azure Policy uses Deny for critical controls and Audit/DeployIfNotExists for compliance. Platform and workload teams have defined responsibilities (Platform Engineering model). |
| **Excellent** | Full GitOps model for platform management using ALZ IaC Accelerator or Azure Verified Modules. Subscription vending fully automated. Canary environments used to test platform changes before production rollout. Comprehensive test coverage for IaC including policy testing. Platform team operates as an internal product team with SLOs for platform services. Azure Policy comprehensively applied with Deny, DeployIfNotExists, and Modify effects. Regular policy hygiene reviews and exemption management process. Teams structured following a Cloud Centre of Excellence (CCoE) or Platform Engineering model with clear RACI. |

---

### 3.2 Well-Architected Framework Pillars (Workload Level)

These five pillars evaluate individual workloads deployed on the landing zone platform. Each pillar is assessed using the Microsoft WAF Maturity Model (Levels 1–5).

#### WAF Maturity Levels

| Level | Name | Description |
|---|---|---|
| **1** | Initial | Capabilities are non-existent, unpredictable, poorly controlled, and reactive |
| **2** | Evolving | Capabilities are frequently reactive, ad-hoc, and situational |
| **3** | Acceptable | Capabilities are well-characterised and well-understood; organisation is more proactive than reactive |
| **4** | Advanced | Capabilities are measured and controlled with predictable processes that meet organisational goals |
| **5** | Optimised | Capabilities are stable, flexible, frequently measured, and fed back through iteration loops to adopt continuous improvement |

---

#### Pillar 1: Reliability

**Assessment Questions:**
- How do you keep the workload simple and efficient?
- How do you identify and rate the workload's flows?
- How do you perform failure mode analysis?
- How do you define reliability targets (SLOs/SLAs/SLIs)?
- How do you implement redundancy?
- How do you define a scaling strategy?
- How do you implement self-preservation and self-healing measures?
- How do you test your resiliency and availability strategies?
- How do you plan for disaster scenarios?
- How do you monitor workload health?

**What "Excellent" Looks Like:** Workload has documented SLOs derived from business requirements. Critical flows identified with failure mode analysis completed. Multi-region active-active or active-passive deployment with automated failover. Chaos engineering practices in place. Comprehensive health modelling with automated remediation for known failure modes.

---

#### Pillar 2: Security

**Assessment Questions:**
- Do you have a documented security baseline?
- How do you secure the application code, development environment, and software supply chain?
- Have you classified all data persisted by the workload?
- How do you segment your workload as a defence-in-depth measure?
- What identity and access controls do you use to secure your application?
- How do you secure connectivity for this workload?
- What are your plans and procedures for encrypting data?
- What measures do you take to continuously harden your workload against attack?
- How do you secure your secrets and credentials?
- How do you monitor the application and infrastructure?
- How do you test your workload before and after it reaches production?
- How prepared are you to respond to incidents?

**What "Excellent" Looks Like:** Zero Trust security model applied at workload level. All data classified with encryption at rest (CMK) and in transit (TLS 1.3). Managed identities used for all service-to-service communication. Secrets managed via Key Vault with rotation policies. Comprehensive security testing in CI/CD pipeline (SAST, DAST, SCA, container scanning). Incident response playbooks tested through tabletop exercises.

---

#### Pillar 3: Cost Optimisation

**Assessment Questions:**
- How do you create a culture of financial responsibility?
- How do you perform cost modelling?
- How do you monitor costs?
- How do you govern your spending?
- How do you get the best rates from providers?
- How do you align resource usage to billing increments?
- How do you optimise workload component costs?
- How do you optimise each workload environment?
- How do you optimise flow costs?
- How do you optimise data costs?
- How do you optimise code costs?
- How do you optimise resource scaling costs?
- How do you optimise personnel time?
- How do you evaluate resource consolidation?

**What "Excellent" Looks Like:** FinOps principles embedded in workload design. Cost modelling performed during architecture design phase. Budgets, alerts, and anomaly detection configured. Right-sizing reviewed monthly. Auto-scaling optimised for cost. Non-production environments right-sized or deallocated outside business hours. Reserved capacity or Savings Plans applied where appropriate.

---

#### Pillar 4: Operational Excellence

**Assessment Questions:**
- How do you foster a DevOps culture?
- How do you formalise routine and nonroutine tasks?
- How do you formalise software ideation and planning processes?
- How do you optimise software development and quality assurance processes?
- How do you use Infrastructure as Code (IaC)?
- How did you build your workload supply chain?
- How did you design your observability platform?
- How do you implement your incident management (IcM) process?
- How do you automate tasks that don't need human intervention?
- What is your approach to designing automation capability into your workload?
- What safe deployment practices do you use?

**What "Excellent" Looks Like:** Full DevOps culture with shared responsibility between development and operations. All infrastructure and configuration managed as code. CI/CD pipelines with automated testing, progressive deployment (canary/blue-green), and automated rollback. Comprehensive observability (distributed tracing, structured logging, metrics dashboards, SLO-based alerting). Runbooks automated where possible. Blameless post-incident reviews conducted and actioned.

---

#### Pillar 5: Performance Efficiency

**Assessment Questions:**
- How do you define performance targets?
- How do you conduct capacity planning?
- How do you select the right services?
- How do you collect performance data?
- How do you manage scalability and partitioning?
- How do you conduct performance testing?
- How do you optimise the performance of your code and infrastructure?
- How do you optimise data performance?
- How do you prioritise the performance of critical flows?
- How do you optimise your operational tasks?
- How do you respond to live performance issues?
- How do you enable continuous performance optimisation?

**What "Excellent" Looks Like:** Performance targets defined per critical flow with SLIs measured continuously. Capacity planning conducted with load testing data informing scaling thresholds. Services selected based on documented decision records. Performance regression testing integrated into CI/CD. Auto-scaling configured and validated. Data tier optimised with appropriate indexing, caching, and partitioning strategies. Performance dashboards maintained and reviewed as part of operational rhythm.

---

## 4. Scoring Methodology

### 4.1 Landing Zone Design Areas

Each of the eight design areas is scored on a 1–4 scale:

| Score | Rating | Description |
|---|---|---|
| **1** | Poor | No implementation or fundamentally misaligned with ALZ guidance |
| **2** | Basic | Partial implementation with significant gaps |
| **3** | Good | Solid implementation aligned to ALZ guidance with minor gaps |
| **4** | Excellent | Full implementation aligned to ALZ conceptual architecture with automation and continuous improvement |

**Composite ALZ Score** = Mean of all eight design area scores (max 4.0)

### 4.2 Well-Architected Framework Pillars

Each of the five pillars is scored using the Microsoft WAF Maturity Model (1–5):

| Score | Level | Description |
|---|---|---|
| **1** | Initial | Reactive, unpredictable, no formal practices |
| **2** | Evolving | Ad-hoc, some awareness but inconsistent application |
| **3** | Acceptable | Well-understood, proactive practices in place |
| **4** | Advanced | Measured, controlled, predictable outcomes |
| **5** | Optimised | Continuous improvement, feedback loops, industry-leading |

**Composite WAF Score** = Mean of all five pillar scores (max 5.0)

### 4.3 Overall Maturity Rating

The combined assessment produces a maturity rating:

| Rating | Criteria |
|---|---|
| **Foundational** | ALZ < 2.0 or WAF < 2.0 |
| **Developing** | ALZ 2.0–2.9 and WAF 2.0–2.9 |
| **Established** | ALZ 3.0–3.4 and WAF 3.0–3.9 |
| **Advanced** | ALZ 3.5–3.9 and WAF 4.0–4.4 |
| **Optimised** | ALZ 4.0 and WAF 4.5+ |

---

## 5. Assessment Delivery Approach

### Phase 1: Discovery (Week 1)

- Stakeholder interviews (Cloud Platform Team, Security, Network, Application Teams)
- Document collection (architecture diagrams, policies, runbooks)
- Automated evidence gathering via Azure Resource Graph, Policy Compliance, Defender for Cloud Secure Score
- Complete Microsoft ALZ Review assessment questionnaire
- Complete Microsoft WAF Review assessment for representative workloads

### Phase 2: Analysis (Week 2)

- Score each design area and pillar against the maturity model
- Identify gaps between current state and target state
- Classify findings by severity (Critical / High / Medium / Low)
- Map findings to Microsoft reference documentation and remediation guidance

### Phase 3: Reporting (Week 3)

- Produce assessment report with executive summary, detailed findings, and scored heatmap
- Develop prioritised remediation roadmap with quick wins, medium-term, and strategic items
- Present findings to stakeholders with recommendations
- Deliver all artefacts including evidence repository

---

## 6. Key Reference Sources

### Microsoft Assessment Tools

- Azure Landing Zone Review Assessment
- Azure Well-Architected Review Assessment
- Azure Well-Architected Framework Maturity Model Assessment

### Microsoft Documentation

- Azure Landing Zone Design Areas
- What is an Azure Landing Zone?
- Azure Well-Architected Framework
- WAF Pillars

### Source Spreadsheet and Documents

- Azure Landing Zone Assessment Spreadsheet — Original question set and scoring matrix
- Azure Landing Zone Review (Google Doc) — Extracted assessment categories and questions
- MS Azure Well Architected Framework (Google Doc) — WAF pillar questions and assessment links

---

## 7. Schema.org Alignment

This assessment scope document aligns to the following Schema.org types for downstream integration and ontology portability:

| Schema.org Type | Application |
|---|---|
| `schema:Service` | The assessment engagement itself |
| `schema:Report` | The deliverable assessment report |
| `schema:Rating` | Maturity scores per design area and pillar |
| `schema:DefinedTerm` | Maturity levels (Poor/Basic/Good/Excellent and Initial through Optimised) |
| `schema:HowTo` | Remediation roadmap items |
| `schema:Organization` | The assessed client entity |
| `schema:SoftwareApplication` | Azure services under evaluation |

---

*This scope document should be reviewed and tailored per client engagement. The maturity model answers represent archetypal responses and should be calibrated to the specific industry, regulatory environment, and organisational context of each assessment.*

---

*PFI-W4M-RCS-AZA-SCOPE-ALZ-WAF-Assessment-v1.0.0.md*
*Assessment Scope Definition | v1.0.0 | 2026-03-12*
*Client Deliverable — Pre-Engagement | PFC Programme*
