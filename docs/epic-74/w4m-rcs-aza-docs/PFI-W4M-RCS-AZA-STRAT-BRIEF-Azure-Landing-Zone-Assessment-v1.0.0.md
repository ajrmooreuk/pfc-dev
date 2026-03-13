# PFI-W4M-RCS-AZA — Azure Landing Zone Assessment: VE Skill Chain Strategy Brief

> **Document Reference:** PFI-W4M-RCS-AZA-STRAT-BRIEF-Azure-Landing-Zone-Assessment-v1.0.0.md
> **Type:** VE Skill Chain Strategy Brief
> **Product:** PFI-W4M-RCS-AZA — Azure Landing Zone Assessment (W4M-RCS channel · pre-AIRL promotion)
> **Version:** v1.0.0 | **Date:** 2026-03-13
> **Author:** PF-Core / PFI-W4M-RCS-AZA Programme (AI-assisted)
> **VE Chain Method:** VSOM → OKR → KPI → ValueProp → Kano → PMF
> **PFC Lineage:** [Epic 16 (#91)](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/91) — Azlan-EA-AAA
> **AIRL Staging:** [Epic 3 (#50)](https://github.com/ajrmooreuk/pfi-airl-caf-aza-dev/issues/50) · [F3.6 (#161)](https://github.com/ajrmooreuk/pfi-airl-caf-aza-dev/issues/161) — pfi-airl-caf-aza-dev
> **Epic 68:** [#1005](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/1005) — Azure Assessment Platform via Azure-RCS Instance
> **Ontology Alignment:** AZALZ-ONT (placeholder), MCSB-ONT v2.0.0, GRC-FW-ONT v3.0.0, RMF-IS27005-ONT v1.0.0
> **Design Principles:** ISO 31700 (PbD) · NCSC Secure by Design · NIST AI RMF · ICO UK GDPR · Microsoft CAF/WAR
> **Process Frameworks:** DELTA (Discover-Evaluate-Leverage-Transform-Adapt, PE-ONT) · DMAIC (Six Sigma) · Velocity Framework (Sprint Delivery)
> **Classification:** INTERNAL — STRATEGIC

---

## Executive Summary

This brief applies the **VE Skill Chain** (VSOM → OKR → KPI → VP → Kano → PMF) to the Azure Landing Zone (ALZ) Assessment capability within the W4M-RCS-AZA product. ALZ assessment is the bridge between Microsoft's Cloud Adoption Framework (CAF) discovery outputs and an executable, PbD/SbD-gated Azure deployment programme.

The strategic finding: **every Azure migration begins with a landing zone decision, but most organisations lack the structured assessment capability to evaluate their ALZ design against security, privacy, governance, and operational readiness standards.** Microsoft's Well-Architected Review (WAR) scores the platform after deployment. PFI-AIRL's ALZ Assessment scores the design *before* deployment — preventing costly rework, compliance gaps, and security exposure from day one.

The ALZ Assessment sits at the intersection of three PFC capabilities:
1. **AZALZ-ONT** — the ontology-driven landing zone design area model (5 design areas, maturity scoring)
2. **MCSB-ONT** — Microsoft Cloud Security Benchmark alignment (12 control families)
3. **AIRL 9-Domain Scoring** — the PbD/SbD-extended assessment framework that captures what WAR omits

---

## 1. VSOM — Vision, Strategy, Objectives, Metrics

### 1.1 Vision

> **"To deliver the definitive pre-deployment Azure Landing Zone assessment — ontology-driven, PbD/SbD-gated, and CAF-aligned — that converts landing zone design decisions into scored, auditable, sprint-ready deployment programmes, compressing ALZ delivery from months to weeks with zero critical security findings."**

### Vision Decomposition

| Dimension | Statement |
|---|---|
| **Competitive Position** | First-mover: no UK advisory firm offers a structured, scored ALZ pre-deployment assessment with PbD/SbD gates |
| **Target Beneficiary** | Cloud architects, CISOs, DPOs, infrastructure leads in UK Public Sector & Mid-Market |
| **Core Belief** | Landing zone quality is determined before deployment, not discovered after — assess first, deploy once |
| **Distinctive Mechanism** | AZALZ-ONT × MCSB-ONT × AIRL 9-domain scoring — ontology-driven, agentic, evidence-generating |
| **Design Standard** | ISO 31700 PbD · NCSC Secure by Design · Microsoft CAF · Azure Well-Architected Framework |
| **Time Horizon** | 12 months to productised ALZ assessment capability within AIRL |

### 1.2 Strategy Pillars

| Pillar | Description | Ontology Link |
|---|---|---|
| **S1 · ALZ Design Area Assessment** | Score each of the 5 ALZ design areas (Identity, Network, Management, Platform, Security) against maturity criteria | AZALZ-ONT |
| **S2 · MCSB Security Posture Baseline** | Map ALZ design to MCSB v2.0 control families — pre-deployment security validation | MCSB-ONT |
| **S3 · PbD/SbD Pre-Deployment Gates** | Apply privacy-by-design and security-by-design gates before any ALZ resources are provisioned | AIRL D07 (PbD) + D08 (SbD) |
| **S4 · CAF-to-ALZ Sprint Bridge** | Convert CAF assessment outputs into ALZ blueprint selection + sprint sequencing | GRC-FW-ONT + VP-ONT |
| **S5 · Compliance Evidence Generation** | Auto-generate compliance evidence packs (ICO, NHS DSP, CE+, ISO 27001) from ALZ assessment outputs | RMF-IS27005-ONT |

### 1.3 VSOM Cascade

```mermaid
flowchart TB
    subgraph V["VISION"]
        V1["Definitive ALZ Pre-Deployment Assessment\nOntology-driven · PbD/SbD-gated · CAF-aligned\nMonths to weeks · Zero critical findings"]
    end

    subgraph S["STRATEGY PILLARS"]
        S1["S1 · ALZ Design Area\nAssessment\n[5 Design Areas Scored]"]
        S2["S2 · MCSB Security\nPosture Baseline\n[12 Control Families]"]
        S3["S3 · PbD/SbD\nPre-Deployment Gates\n[Privacy + Security First]"]
        S4["S4 · CAF-to-ALZ\nSprint Bridge\n[Assessment → Blueprint]"]
        S5["S5 · Compliance\nEvidence Generation\n[Auto-Evidence Packs]"]
    end

    subgraph O["OBJECTIVES"]
        O1["Productise ALZ\nAssessment Skill\nQ2 2026"]
        O2["Deliver 10 ALZ\nAssessments in\n≤3 days each"]
        O3["Zero critical sec\nfindings on ALZ\ndeployments assessed"]
        O4["PbD/SbD gates\napplied to 100%\nof ALZ engagements"]
    end

    subgraph M["METRICS"]
        M1["ALZ Assessment\nDelivery ≤3 days\nper engagement"]
        M2["MCSB Alignment\n≥85% control\ncoverage pre-deploy"]
        M3["Zero critical\nfindings post-deploy\non assessed ALZs"]
        M4["Compliance evidence\nauto-generated\n≥80% of artefacts"]
    end

    V1 -->|informs| S1 & S2 & S3 & S4 & S5
    S1 -->|decomposes| O1
    S2 -->|decomposes| O2
    S3 -->|decomposes| O4
    S4 -->|decomposes| O2
    S5 -->|decomposes| O3

    O1 -->|measured by| M1
    O2 -->|measured by| M2
    O3 -->|measured by| M3
    O4 -->|measured by| M4

    style V fill:#bbdefb,stroke:#1565c0
    style S fill:#e1bee7,stroke:#6a1b9a
    style O fill:#ffe0b2,stroke:#e65100
    style M fill:#c8e6c9,stroke:#2e7d32
```

---

## 2. OKR Cascade

### Objective 1: Productise ALZ Assessment as a Repeatable Skill

| Key Result | Target | Timeline |
|---|---|---|
| KR1.1: `pfc-alz-assess` skill operational with AZALZ-ONT scoring | Skill registered + passing tests | Q2 2026 |
| KR1.2: ALZ assessment template deployed to AIRL + BAIV instances | 2 PFI instances consuming | Q2 2026 |
| KR1.3: Assessment delivery time | ≤3 days from engagement start to scored report | Q3 2026 |

### Objective 2: Establish ALZ Assessment as Pre-Deployment Standard

| Key Result | Target | Timeline |
|---|---|---|
| KR2.1: ALZ assessments completed | 10 engagements in first 6 months | Q4 2026 |
| KR2.2: MCSB control coverage pre-deployment | ≥85% across all 12 control families | Ongoing |
| KR2.3: Post-assessment ALZ deployment time | ≤21 days from assessment to live ALZ | Ongoing |

### Objective 3: Zero Critical Findings on Assessed Deployments

| Key Result | Target | Timeline |
|---|---|---|
| KR3.1: Critical security findings on assessed ALZs | Zero | Ongoing |
| KR3.2: PbD/SbD gate pass rate | ≥90% first-pass | Ongoing |
| KR3.3: Client CISO sign-off rate pre-deployment | ≥80% of engagements | Q4 2026 |

### Objective 4: PbD/SbD as ALZ Differentiator

| Key Result | Target | Timeline |
|---|---|---|
| KR4.1: PbD/SbD gates applied | 100% of ALZ assessments | Q2 2026 |
| KR4.2: DPIA auto-generated for ALZ data workloads | <2 hours per engagement | Q3 2026 |
| KR4.3: PbD/SbD cited as ALZ purchase driver | ≥30% of assessed clients | Q4 2026 |

---

## 3. KPI Framework — BSC Balanced Scorecard

### Financial Perspective

| KPI | Target | Rationale |
|---|---|---|
| ALZ Assessment Revenue per Engagement | ≥£15K | Standalone assessment value — upsell to ALZ deployment |
| ALZ Assessment → Deployment Conversion Rate | ≥70% | Assessment creates the deployment pipeline |
| ALZ ARR Contribution | £500K within 12 months | Assessment + deployment combined stream |

### Customer Perspective

| KPI | Target | Rationale |
|---|---|---|
| Assessment NPS | ≥65 | Post-assessment satisfaction — are clients acting on findings? |
| CISO/DPO Sponsor Rate | ≥50% | Security/privacy buyers validate the PbD/SbD positioning |
| Time-to-Decision | ≤5 days from report to client decision | Assessment must compress the decision cycle, not extend it |

### Internal Process Perspective

| KPI | Target | Rationale |
|---|---|---|
| Assessment Delivery Time | ≤3 days | Competitive vs 4–8 week traditional ALZ reviews |
| MCSB Control Coverage | ≥85% pre-deployment | Security baseline must be provably high before first resource deploys |
| AZALZ Design Area Completeness | 5/5 design areas scored per engagement | No gaps — Identity, Network, Management, Platform, Security all assessed |
| DPIA Auto-Generation Time | <2 hours | Privacy evidence must not be a bottleneck |

### Learning & Growth Perspective

| KPI | Target | Rationale |
|---|---|---|
| AZALZ-ONT Maturity | From placeholder to v1.0.0 published | Ontology must be production-grade for skill chain execution |
| ALZ Assessment Reuse Rate | ≥75% template components reused | Scalability depends on repeatable, composable assessment patterns |
| Team ALZ Certification | ≥2 Azure Expert MSP-level practitioners | Credibility for partner co-sell |

---

## 4. Value Proposition Canvas

### Customer Profile

| Customer Job | Pain | Gain Sought |
|---|---|---|
| Deploy Azure estate compliantly | ALZ design decisions are ad-hoc — no structured assessment before deployment | Confidence that ALZ design is secure, compliant, and right-sized before provisioning |
| Prove security posture to board/CISO | WAR scores the platform *after* deployment — rework is expensive | Pre-deployment security evidence that prevents post-build findings |
| Satisfy DPO before data workloads launch | No ALZ assessment includes privacy design review — PbD is an afterthought | DPIA and PbD evidence generated as part of ALZ assessment, not bolted on later |
| Select the right ALZ blueprint variant | Microsoft offers multiple ALZ patterns — clients don't know which fits | AIRL maps CAF findings to the correct ALZ variant with scored rationale |
| Meet NHS DSP / CE+ / ISO 27001 requirements | Compliance evidence is assembled manually weeks after deployment | Compliance evidence auto-generated from assessment — audit-ready on day one |

### Value Map

| Product/Service | Pain Reliever | Gain Creator |
|---|---|---|
| **ALZ Design Area Assessment** (5 areas scored) | Replaces ad-hoc design reviews with structured, repeatable scoring | Board-ready ALZ maturity report with design area heatmap |
| **MCSB Pre-Deployment Baseline** | Identifies security gaps *before* resources are provisioned — no rework | CISO confidence: MCSB alignment score ≥85% before go-live |
| **PbD/SbD Pre-Deployment Gates** | Privacy and security validated before deployment, not discovered after | DPO sign-off with evidence pack — DPIA in <2 hours |
| **CAF→ALZ Sprint Bridge** | Eliminates the post-CAF void — assessment outputs become sprint inputs | ALZ deployment starts within 5 days of assessment, not 5 weeks |
| **Compliance Evidence Pack** | Auto-generates NHS DSP, CE+, ISO 27001 evidence from assessment data | Audit-ready on deployment day — zero additional documentation effort |

### The Pre-Deployment Moat

The single most important positioning insight: **Microsoft's WAR reviews the platform after deployment. PFI-AIRL's ALZ Assessment reviews the design before deployment.** This is not a competing product — it is a complementary capability that makes WAR scores better by preventing the findings WAR would otherwise surface. No Azure partner in the UK market currently offers a structured, PbD/SbD-gated pre-deployment ALZ assessment.

---

## 5. Kano Analysis — Feature Classification

| Feature | Kano Category | Rationale | Priority |
|---|---|---|---|
| **ALZ 5 Design Area Scoring** | Performance | More design areas scored = more confidence — linear satisfaction | P0 — Core capability |
| **MCSB Pre-Deployment Baseline** | Performance | Security coverage directly reduces post-deployment risk | P0 — Ship with v1 |
| **PbD Gate — Pre-Deployment Privacy Review** | Excitement / Moat | No ALZ assessment includes this — DPOs will demand it once seen | P0 — Structural moat |
| **SbD Gate — Pre-Deployment Security Review** | Excitement | Prevents costly post-build rework — CISOs recognise immediate value | P0 — Differentiator |
| **CAF→ALZ Sprint Bridge** | Excitement | Eliminates post-assessment void — no competitor does this automatically | P0 — Core differentiator |
| **Compliance Evidence Auto-Generation** | Performance | Growing mandate — NHS DSP, CE+, ISO 27001 all require pre-evidence | P1 — Q3 |
| **ALZ Blueprint Variant Selection** | Performance | Removes decision paralysis — scored rationale for blueprint choice | P1 — Q3 |
| **DPIA Auto-Generation for Data Workloads** | Excitement | <2 hours vs 4 weeks — no competitor offers this for ALZ engagements | P0 — Differentiator |
| **Azure Policy-as-Code Readiness Score** | Must-Have (emerging) | Clients on G-Cloud/DOS require policy-as-code evidence | P1 — Q4 |
| **Sector-Specific ALZ Templates** (NHS, Local Gov, Mid-Market) | Performance | Sector tuning increases relevance and reduces assessment time | P2 — 2027 |

```mermaid
quadrantChart
    title Kano Analysis — ALZ Assessment Features
    x-axis Low Execution --> High Execution
    y-axis Low Satisfaction --> High Satisfaction
    quadrant-1 Performance Drivers
    quadrant-2 Excitement Delighters
    quadrant-3 Dissatisfiers / Drop
    quadrant-4 Must-Have Basics

    ALZ 5 Design Area Scoring: [0.82, 0.80]
    MCSB Pre-Deployment Baseline: [0.78, 0.78]
    PbD Pre-Deployment Gate: [0.65, 0.92]
    SbD Pre-Deployment Gate: [0.70, 0.88]
    CAF-to-ALZ Sprint Bridge: [0.68, 0.90]
    DPIA Auto-Generation: [0.62, 0.93]
    Compliance Evidence Pack: [0.80, 0.72]
    ALZ Blueprint Selection: [0.75, 0.75]
    Policy-as-Code Readiness: [0.82, 0.50]
    Sector ALZ Templates: [0.55, 0.65]
```

---

## 6. PMF — Product-Market Fit Model

### 6.1 Ideal Customer Profile

| Attribute | Profile |
|---|---|
| **Organisation Type** | UK Public Sector (NHS, Local Government, Central Government) · Mid-Market (≤£500M revenue) |
| **Azure Commitment** | Active Azure CSP/EA agreement — migrating or expanding workloads |
| **ALZ Status** | Planning or early-stage ALZ deployment — design decisions not yet finalised |
| **Compliance Pressure** | NHS DSP Toolkit, Cyber Essentials Plus, ISO 27001, or sector-specific obligations |
| **Decision Maker** | Cloud Architect or Infrastructure Lead with CISO/DPO sign-off requirement |
| **Budget** | £15K–£50K for assessment + blueprint — upsell to £100K+ for managed ALZ deployment |

### 6.2 PMF Signal — The Pre-Deployment Conversion Funnel

```text
Microsoft CSP/MPN Partner delivers CAF assessment
              ↓
Client receives CAF maturity score — no ALZ blueprint prescribed
              ↓
Post-CAF Void begins (typically 6–12 weeks)
              ↓
PFI-AIRL engages — ALZ Assessment (8 design areas + 5 WAF pillars + PbD/SbD)
              ↓
Scored ALZ design report + blueprint variant selection in ≤3 days
              ↓
PbD/SbD gates validated — DPIA auto-generated if data workloads scoped
              ↓
ALZ deployment sprint starts within 5 days — ≤21 days to live ALZ
              ↓
Compliance evidence pack auto-generated — audit-ready on day one
```

### 6.3 PMF Measurement

| Signal | Target | Measurement Method |
|---|---|---|
| **Sean Ellis Test** | ≥40% "Very Disappointed" if ALZ Assessment withdrawn | Post-assessment survey |
| **Assessment → Deployment Conversion** | ≥70% of assessed clients proceed to ALZ deployment | Pipeline tracking |
| **Repeat Engagement Rate** | ≥50% of clients request assessment for additional workloads within 6 months | CRM |
| **DPO/CISO Referral Rate** | ≥30% of new engagements sourced from DPO/CISO referral | Lead attribution |
| **Post-CAF Capture Rate** | ≥25% of AIRL engagements originate from a prior CAF assessment | Pipeline tracking |

### 6.4 Competitive Differentiation

| Dimension | Traditional ALZ Review | Microsoft WAR | PFI-AIRL ALZ Assessment |
|---|---|---|---|
| **Timing** | Post-deployment review | Post-deployment scoring | **Pre-deployment assessment** |
| **Duration** | 4–8 weeks | 1–2 days (automated) | **≤3 days (structured + scored)** |
| **PbD Coverage** | None | None | **ISO 31700 PbD gate — 15% of score** |
| **SbD Coverage** | Partial (NCSC alignment varies) | Security pillar only | **NCSC SbD + Zero Trust + MCSB — 15% of score** |
| **Output** | Recommendations document | Pillar scores + recommendations | **Scored design report + blueprint selection + sprint plan + compliance evidence** |
| **Sprint Bridge** | None — client must plan separately | None | **CAF→ALZ→Sprint in ≤5 days** |
| **Compliance Evidence** | Manual assembly | Azure Policy dashboard | **Auto-generated NHS DSP, CE+, ISO 27001 packs** |

---

## 7. ALZ Design Area Assessment Model

> **Alignment note:** This section is aligned to the companion scope document `PFI-W4M-RCS-AZA-SCOPE-ALZ-WAF-Assessment-v1.0.0.md` which defines the full assessment methodology, maturity spectrums, and scoring model.

### 7.1 The 8 ALZ Design Areas (Platform Level — AZALZ-ONT Planned)

The assessment uses Microsoft's recommended 8 ALZ design areas, evaluated in dependency sequence. Each design area is scored on a **1–4 scale** (Poor / Basic / Good / Excellent) per the companion scope doc.

| DA | Design Area | Assessment Focus | MCSB Control Families | AIRL Domain Link |
|---|---|---|---|---|
| **DA-1** | **Billing & Entra Tenant** | Billing arrangement (EA/MCA/CSP), tenant config, billing-to-hierarchy alignment | GS (Governance & Strategy) | D05: Financial & Commercial |
| **DA-2** | **Identity & Access Management** | MFA, PIM, Conditional Access, break-glass, RBAC, external identity, monitoring | IM (Identity Management), PA (Privileged Access) | D08: SbD Maturity |
| **DA-3** | **Resource Organisation** | Management Group hierarchy, subscription strategy, subscription vending | AM (Asset Management) | D03: Azure Platform Maturity |
| **DA-4** | **Network Topology & Connectivity** | Hub-spoke/VWAN, on-prem connectivity, IPAM, Private Endpoints, WAF, DDoS, NSGs, DNS | NS (Network Security), ES (Endpoint Security) | D03: Azure Platform Maturity |
| **DA-5** | **Security** | Security baseline, Defender for Cloud, service enablement controls, Sentinel, threat protection | All security families | D08: SbD Maturity |
| **DA-6** | **Management** | Logging, monitoring, compliance assurance, operational visibility, patching, backup | LT (Logging & Threat Detection), IR (Incident Response) | D04: Process & Operational Maturity |
| **DA-7** | **Governance** | Cost management, tagging strategy, FinOps, Azure Advisor, spend optimisation | GS (Governance & Strategy) | D05: Financial & Commercial |
| **DA-8** | **Platform Automation & DevOps** | IaC (Bicep/Terraform), CI/CD, GitOps, Azure Policy effects, team structure (CCoE/Platform Engineering) | DS (DevOps Security) | D03: Azure Platform Maturity |

### 7.2 The 5 WAF Pillars (Workload Level)

In addition to platform-level design areas, the assessment evaluates representative workloads against the **5 WAF Pillars**, scored on the Microsoft WAF Maturity Model **(Levels 1–5: Initial → Optimised)**.

| Pillar | Assessment Focus | AIRL Domain Link |
|---|---|---|
| **Reliability** | SLOs/SLAs, failure mode analysis, redundancy, scaling, self-healing, DR, health monitoring | D03: Azure Platform Maturity |
| **Security** | Security baseline, supply chain, data classification, segmentation, identity, encryption, secrets, incident response | D08: SbD Maturity + D07: PbD Maturity |
| **Cost Optimisation** | Financial responsibility culture, cost modelling, monitoring, governance, right-sizing, reserved capacity | D05: Financial & Commercial |
| **Operational Excellence** | DevOps culture, IaC, observability, incident management, safe deployment practices, automation | D04: Process & Operational Maturity |
| **Performance Efficiency** | Performance targets, capacity planning, service selection, performance testing, scaling, critical flow optimisation | D03: Azure Platform Maturity |

### 7.3 Maturity Scoring

#### ALZ Design Areas (1–4 Scale)

| Score | Rating | Description |
|---|---|---|
| **1** | Poor | No implementation or fundamentally misaligned with ALZ guidance |
| **2** | Basic | Partial implementation with significant gaps |
| **3** | Good | Solid implementation aligned to ALZ guidance with minor gaps |
| **4** | Excellent | Full implementation aligned to ALZ conceptual architecture with automation and continuous improvement |

#### WAF Pillars (1–5 Scale)

| Score | Level | Description |
|---|---|---|
| **1** | Initial | Reactive, unpredictable, no formal practices |
| **2** | Evolving | Ad-hoc, some awareness but inconsistent application |
| **3** | Acceptable | Well-understood, proactive practices in place |
| **4** | Advanced | Measured, controlled, predictable outcomes |
| **5** | Optimised | Continuous improvement, feedback loops, industry-leading |

### 7.4 Composite Scoring Model

#### ALZ + WAF Combined Maturity Rating

| Rating | Criteria |
|---|---|
| **Foundational** | ALZ < 2.0 or WAF < 2.0 |
| **Developing** | ALZ 2.0–2.9 and WAF 2.0–2.9 |
| **Established** | ALZ 3.0–3.4 and WAF 3.0–3.9 |
| **Advanced** | ALZ 3.5–3.9 and WAF 4.0–4.4 |
| **Optimised** | ALZ 4.0 and WAF 4.5+ |

#### AIRL-Extended Composite Score (with PbD/SbD overlay)

| Component | Weight | Source |
|---|---|---|
| ALZ Design Area Average (8 areas) | 35% | AZALZ-ONT scoring (1–4 normalised) |
| WAF Pillar Average (5 pillars) | 20% | WAF maturity model (1–5 normalised) |
| MCSB Control Coverage | 15% | MCSB-ONT alignment check |
| PbD Maturity (AIRL D07) | 15% | AIRL 9-domain scoring |
| SbD Maturity (AIRL D08) | 10% | AIRL 9-domain scoring |
| Compliance Readiness (AIRL D06) | 5% | AIRL 9-domain scoring |

---

## 8. AIRL 9-Domain Integration — ALZ Assessment Lens

| AIRL Domain | ALZ Assessment Application | Weight |
|---|---|---|
| D01: AI Strategy & Governance | AI workload readiness within ALZ scope — governance policies for AI services | 15% |
| D02: Data Readiness & Quality | Data classification, Purview coverage, PII identification within ALZ data workloads | 15% |
| D03: Azure Platform Maturity | **Primary** — ALZ design area scores map directly to platform maturity | 10% |
| D04: Process & Operational Maturity | Management & monitoring design area — operational readiness for ALZ workloads | 10% |
| D05: Financial & Commercial Readiness | Cost governance, tagging, budget alerts within ALZ subscription design | 10% |
| D06: Compliance & Regulatory | NHS DSP, CE+, ISO 27001 alignment — auto-evidence from ALZ assessment | 5% |
| D07: Privacy by Design Maturity | **PbD gate** — data workload privacy review, DPIA scoping, consent architecture | 15% |
| D08: Security by Design Maturity | **SbD gate** — Zero Trust, MCSB alignment, Defender score, pen test readiness | 15% |
| D09: Talent & Change Readiness | ALZ operations team capability — IaC skills, DevSecOps maturity, policy management | 5% |

---

## 9. Delivery Architecture

### 9.1 Agentic Pipeline

```text
Input Sources
├── CAF Assessment Output (JSON/CSV)     → CAF maturity model structured output
├── Existing ALZ Config (Azure export)   → Current-state ALZ resource configuration
├── WAR Export (if available)            → Post-deployment WAR for comparison
└── Client Questionnaire                 → Organisation-specific context + constraints
         ↓
ALZ Assessment Agent (pfc-alz-assess)
├── Parse → normalise to AZALZ-ONT 8-design-area schema (DA-1 through DA-8)
├── Score → apply maturity levels 1–4 per design area (Poor/Basic/Good/Excellent)
├── WAF-score → apply WAF maturity model 1–5 per pillar (5 workload pillars)
├── MCSB-map → check alignment against 12 MCSB control families
├── PbD-gate → apply ISO 31700 privacy review to data workloads
├── SbD-gate → apply NCSC SbD + Zero Trust validation
└── Sequence → generate ALZ deployment sprint plan
         ↓
Ontology Layer
├── AZALZ-ONT: design area entities + maturity scores
├── MCSB-ONT: control family alignment + gap register
├── VP-ONT: map findings to customer jobs/pains/gains
├── RRR-ONT: map risks → requirements → results
└── GRC-FW-ONT: compliance evidence mapping
         ↓
Output Artefacts
├── ALZ Design Area Scorecard (8 areas, maturity levels, heatmap)
├── WAF Pillar Scorecard (5 pillars, maturity levels 1–5)
├── MCSB Alignment Report (12 control families, coverage %)
├── ALZ Blueprint Variant Recommendation (scored rationale)
├── PbD/SbD Gate Report (pass/fail per gate, remediation register)
├── Sprint Plan (Velocity Framework sequenced — ≤21 days to live ALZ)
├── DPIA Scope Register (auto-generated if data workloads scoped)
└── Compliance Evidence Pack (NHS DSP, CE+, ISO 27001 mappings)
```

### 9.2 Target Delivery Timeline (DMAIC-Aligned)

| Phase | DMAIC | Duration | Output |
|---|---|---|---|
| **Discovery** | Define | Day 0–1 | Client questionnaire + Azure config export + CAF data (if available) |
| **Assessment** | Measure | Day 1–2 | 8 ALZ design areas scored (1–4), 5 WAF pillars scored (1–5), MCSB aligned, PbD/SbD gates applied |
| **Gap Analysis** | Analyse | Day 2 | Gap heatmap, risk register (RRR-ONT), cross-DA dependency mapping |
| **Report & Sprint Plan** | Improve | Day 2–3 | Scored report, blueprint recommendation, remediation roadmap, sprint plan, compliance evidence |
| **Client Review** | — | Day 3–5 | Findings walkthrough, decision on ALZ deployment engagement |
| **ALZ Deployment Sprint** | — | Day 5–26 | ≤21-day ALZ deployment via Velocity Framework (if client proceeds) |
| **Governance Baseline** | Control | Ongoing | Azure Policy deployment, monitoring dashboard, re-assessment triggers |

---

## 10. DMAIC Process Model — Assessment Delivery Lifecycle

The assessment toolkit uses **DMAIC** (Define → Measure → Analyse → Improve → Control) as its core delivery process. DMAIC provides the structured, repeatable, data-driven improvement cycle that maps directly to the ALZ/WAF assessment lifecycle — and critically, supports **fast-tracking to automation** by making each phase a discrete, automatable step.

### 10.1 DMAIC Phase Mapping

```mermaid
flowchart LR
    subgraph D["DEFINE"]
        D1["Scope Azure estate"]
        D2["Identify DAs + WAF pillars"]
        D3["Set engagement boundaries"]
        D4["Client questionnaire"]
    end

    subgraph M["MEASURE"]
        M1["Score 8 ALZ DAs (1–4)"]
        M2["Score 5 WAF pillars (1–5)"]
        M3["MCSB control coverage %"]
        M4["PbD/SbD gate assessment"]
    end

    subgraph A["ANALYSE"]
        A1["Gap analysis heatmap"]
        A2["Root cause of maturity gaps"]
        A3["Risk prioritisation (RRR-ONT)"]
        A4["Cross-DA dependency impact"]
    end

    subgraph I["IMPROVE"]
        I1["Remediation roadmap"]
        I2["Blueprint variant selection"]
        I3["Sprint plan (Velocity)"]
        I4["Quick wins vs structural"]
    end

    subgraph C["CONTROL"]
        C1["Azure Policy enforcement"]
        C2["Continuous monitoring"]
        C3["Re-assessment triggers"]
        C4["Governance dashboard"]
    end

    D --> M --> A --> I --> C
    C -.->|"feedback loop"| D

    style D fill:#e3f2fd,stroke:#1565c0
    style M fill:#f3e5f5,stroke:#6a1b9a
    style A fill:#fff3e0,stroke:#e65100
    style I fill:#e8f5e9,stroke:#2e7d32
    style C fill:#fce4ec,stroke:#b71c1c
```

### 10.2 DMAIC × Assessment Toolkit Automation

Each DMAIC phase maps to a **toolkit automation level** — the path from manual delivery to fully automated assessment:

| DMAIC Phase | Manual (Today) | Semi-Auto (Q3 2026) | Fully Auto (Q1 2027) |
|---|---|---|---|
| **Define** | Consultant scopes via interviews + config review | Client self-service questionnaire + Azure export parser | Auto-discovery from Azure Resource Graph + tenant config |
| **Measure** | Consultant scores DAs and WAF pillars from evidence | Agent-assisted scoring with AZALZ-ONT schema validation | `pfc-alz-assess` agent scores autonomously from Azure data |
| **Analyse** | Manual gap analysis in spreadsheet | Agent generates heatmap + risk register from scored data | Automated root-cause analysis with cross-DA dependency mapping |
| **Improve** | Consultant writes remediation plan | Agent drafts remediation roadmap from gap register | Auto-generated sprint plan with Velocity Framework sequencing |
| **Control** | Manual re-assessment on schedule | Azure Policy baseline deployed from assessment findings | Continuous monitoring with automated re-assessment triggers |

### 10.3 DMAIC Phase → Deliverable Mapping

| Phase | Duration | Input | Output Artefact | Automation Target |
|---|---|---|---|---|
| **Define** | Day 0–1 | Client engagement brief | Scoped assessment plan, Azure config export, questionnaire responses | Auto-scope from Azure Resource Graph |
| **Measure** | Day 1–2 | Azure config + questionnaire + CAF data | 8 DA scorecards (1–4) + 5 WAF pillar scores (1–5) + MCSB coverage % | `pfc-alz-assess` agent + AZALZ-ONT |
| **Analyse** | Day 2 | Scored data | Gap heatmap, risk register (RRR-ONT), cross-DA dependency analysis | Automated gap analysis + RRR mapping |
| **Improve** | Day 2–3 | Gap analysis | Blueprint recommendation, remediation roadmap, sprint plan, DPIA scope | Auto-generated remediation + sprint plan |
| **Control** | Ongoing | Assessment baseline | Azure Policy deployment, monitoring dashboard, re-assessment schedule | Continuous compliance monitoring |

### 10.4 DMAIC Fast-Track Principles

1. **Every phase must be independently automatable** — no phase depends on consultant judgement that can't be codified
2. **Measure before Analyse** — no analysis without scored data; scoring schema (AZALZ-ONT) is the gatekeeper
3. **Improve generates executable outputs** — not recommendations documents, but sprint plans with Azure-deployable IaC
4. **Control closes the loop** — every assessment creates a baseline that triggers re-assessment when drift is detected
5. **DMAIC cycles compress with automation** — manual: 3–5 days; semi-auto: 1–2 days; fully auto: <4 hours

---

## 11. DELTA Discovery Process — PE-ONT Applied to ALZ Assessment

The **DELTA process** (Discover → Evaluate → Leverage → Transform → Adapt) is the PFC platform's universal 5-phase discovery and gap analysis cycle, defined in `pe:delta-discovery-gap-analysis-template` (PE-ONT, PE-Series). DELTA is industry-agnostic by design — the phases govern HOW discovery happens; WHAT is discovered is layered in by PFI context (in this case, Azure ALZ/WAF assessment). When contextualised via the `pfc-ve-context-agent` (Layer 4 of the seven-layer architecture), DELTA becomes org/sector/maturity-specific.

> **Source ontology:** `PE-Series/PE-ONT/instance-data/pe-delta-process-template-v1.0.0.jsonld`
> **Architecture:** `PFC-AGNT-BRIEF-VE-Contextualised-DELTA-DMAIC-OKR-QVF-Agent-Architecture-v1.0.0.md`
> **Epic lineage:** Epic 52 (#755) DELTA · Epic 40 (#577) Skills Workbench · Epic 69 (#1018) SNG Directed Graph

### 11.1 DELTA Phases Applied to ALZ Assessment

| Phase | PE-ONT Definition | ALZ Assessment Application | Gate | Duration |
|---|---|---|---|---|
| **Discover** | Extract and structure context. Map the territory. Surface raw evidence before analysis. | Scope Azure estate; capture tenant config + Azure Resource Graph data; map stakeholders (CISO, DPO, Cloud Architect); formulate driving question ("Is this ALZ design fit for deployment?"); populate `orgctx:OrganizationContext` | **G1:** Scope defined, stakeholders mapped, ≥3 evidence sources, driving question formulated | Day 0–1 |
| **Evaluate** | Assess current state vs desired state. Decompose the gap using MECE discipline. | Score 8 ALZ DAs (1–4) + 5 WAF pillars (1–5) against target maturity; MECE decomposition of gaps per DA; quantify each gap with magnitude/impact/urgency; evidence chains per finding; MCSB control coverage baseline | **G2:** MECE tree validated, ≥1 gap quantified per branch, evidence chains documented, baseline scored | Day 1–2 |
| **Leverage** | Identify highest-impact levers. Generate hypotheses. Test assumptions. Prioritise. | Sensitivity analysis on gap tree — identify top-3 highest-impact DAs for remediation; hypothesis per lever ("If we implement PIM, DA-2 moves from Basic to Good"); test MustBeTrue assumptions; impact-effort mapping; cross-DA dependency analysis | **G3:** Top-3 levers with sensitivity, hypotheses tested, no invalidated MustBeTrue assumptions (BR-DELTA-001: if invalidated → loop to Evaluate) | Day 2 |
| **Transform** | Plan and execute interventions. Translate recommendations into delivery. | Blueprint variant selection; remediation roadmap as OKR cascade; BSC measures linked to KPIs; sprint plan via Velocity Framework; PbD/SbD gate application; DPIA scope; compliance evidence generation; stakeholder narrative | **G4:** OKR cascade defined, BSC operationalised, KPIs instrumented, stakeholder comms complete | Day 2–3 |
| **Adapt** | Close the feedback loop. Monitor impact. Learn. Feed into next cycle. | Post-deployment monitoring via Azure Policy; variance analysis (actual vs planned per KPI); lesson capture; cycle determination (None/Adjust/Pivot/Revise); threshold breach detection triggers re-assessment; prepare next DELTA cycle inputs if gaps remain | **G5:** Variance analysis complete, lessons captured, cycle output determined, next-cycle inputs prepared | Ongoing |

### 11.2 DELTA × DMAIC Relationship

DELTA and DMAIC are **complementary, not competing** processes in the PFC architecture:

| Dimension | DELTA | DMAIC |
|---|---|---|
| **Purpose** | Discovery-led — "What is the gap and what levers close it?" | Quality-led — "How do we measure, analyse, and control the process?" |
| **Origin** | PE-ONT (PFC platform process engineering) | Six Sigma (external methodology, VE-integrated) |
| **Strength** | Evidence chains, MECE discipline, hypothesis testing, sensitivity analysis | Statistical rigour, process control, continuous improvement loops |
| **ALZ role** | Discovery engine — scopes, evaluates, identifies levers, generates transformation plan | Delivery engine — structures the assessment delivery, ensures measurement, maintains control |
| **Sequence** | DELTA runs first (or in parallel) — produces gap analysis + lever identification | DMAIC wraps the delivery — ensures each assessment is measured, repeatable, controlled |

### 11.3 DELTA Phase Mapping to DMAIC

```text
DELTA Discover  ←→  DMAIC Define    (scope and context)
DELTA Evaluate  ←→  DMAIC Measure   (baseline scoring and gap quantification)
DELTA Leverage  ←→  DMAIC Analyse   (root cause, sensitivity, hypothesis testing)
DELTA Transform ←→  DMAIC Improve   (intervention planning and execution)
DELTA Adapt     ←→  DMAIC Control   (feedback loop, monitoring, re-assessment)
```

The key distinction: **DELTA gates (G1–G5) enforce evidence quality** (MECE validation, hypothesis testing, MustBeTrue assumptions). **DMAIC phases enforce process quality** (measurement, statistical control, repeatability). Both run in parallel — DELTA ensures we find the right things; DMAIC ensures we do it the right way.

### 11.4 Contextualised DELTA for ALZ — Via pfc-ve-context-agent

When the VE chain has completed for a W4M-RCS-AZA engagement, the `pfc-ve-context-agent` produces a **ContextualisationManifest** that parametrises DELTA:

| Manifest Parameter | Source | Effect on DELTA |
|---|---|---|
| `scope` | VE strategic scope → `functional` or `enterprise` | Controls phase depth and duration |
| `sector` | Foundation context → UK Public Sector / Mid-Market | Selects sector-specific discovery templates |
| `maturityLevel` | ORG-MAT assessment | Calibrates gate thresholds (Level 2 org gets different G2 criteria than Level 4) |
| `discoveryTemplates` | PFI instance → AZALZ-ONT + MCSB-ONT + EA-MSFT-ONT | Determines which ontologies drive the Evaluate phase |
| `gateCalibration` | Maturity-dependent thresholds | Prevents false positives (Level 2 passing Level 4 gates) |
| `evidenceRequirements` | VE conclusions + GRC compliance obligations | DELTA hypotheses validated against VE strategic context |
| `qvfTermination` | Always true for VE-tier engagements | DELTA must terminate in `qvf:EconomicCase` — findings without economic quantification are architecturally incomplete |

### 11.5 DELTA Automation Roadmap

```mermaid
gantt
    title ALZ Assessment — DELTA + DMAIC Automation Roadmap
    dateFormat YYYY-MM
    axisFormat %b %Y

    section DELTA Manual (Current)
    Consultant-led DELTA discovery     :done, d1, 2026-01, 2026-03
    Manual DMAIC delivery (3-5 days)   :active, d2, 2026-03, 2026-06

    section DELTA Semi-Auto (Q3 2026)
    pfc-ve-context-agent integration   :d3, 2026-06, 2026-08
    Agent-assisted Evaluate + Leverage :d4, 2026-07, 2026-09
    Auto-generated MECE gap trees      :d5, 2026-08, 2026-10
    DELTA+DMAIC delivery in 1-2 days   :d6, 2026-09, 2026-12

    section DELTA Autonomous (Q1 2027)
    Azure Resource Graph auto-Discover :d7, 2026-10, 2027-01
    Autonomous pfc-alz-assess agent    :d8, 2026-11, 2027-02
    Automated G1-G5 gate validation    :d9, 2027-01, 2027-03
    DELTA+DMAIC delivery in hours      :d10, 2027-02, 2027-06

    section QVF Terminal Layer (Q2 2027)
    QVF economic case from DELTA output :d11, 2027-03, 2027-06
    Cross-client benchmarking           :d12, 2027-04, 2027-07
    Continuous DELTA Adapt cycle         :d13, 2027-06, 2027-10
```

---

## 12. OAA GRC Ontology Series — RCSG-Series Reference

The ALZ Assessment capability draws on the **RCSG-Series** (Risk, Compliance, Security & Governance) ontology family within the OAA ontology library. The RCSG-Series provides the semantic backbone for all GRC-driven assessment, scoring, and compliance evidence generation.

### RCSG-Series Directory Structure

```text
PBS/ONTOLOGIES/ontology-library/RCSG-Series/
├── GRC-01-GOV/                              ← Governance Domain
│   └── GRC-FW-ONT/                          ← GRC Framework Ontology v3.0.0 (hub)
│       ├── grc-framework-ontology-v3.0.0.json
│       ├── grc-fw-domain-authorities-v3.0.0.json
│       ├── grc-fw-mapping-instances-v3.0.0.json
│       └── Entry-ONT-GRC-FW-001.json
├── GRC-02-RISK/                             ← Risk Domain
│   ├── RMF-IS27005-ONT/                     ← ISO 27005 Risk Management Framework
│   └── ERM-ONT/                             ← Enterprise Risk Management
├── GRC-03-COMP/                             ← Compliance Domain
│   ├── GDPR-ONT/                            ← GDPR Regulatory Framework v1.0.0
│   │   ├── gdpr-regulatory-framework-v1.0.0.json
│   │   └── Entry-ONT-GDPR-001.json
│   ├── NCSC-CAF-ONT/                        ← NCSC Cyber Assessment Framework v1.0.0
│   │   ├── ncsc-caf-ontology-v1.0.0.json
│   │   └── Entry-ONT-NCSC-CAF-001.json
│   └── DSPT-ONT/                            ← NHS Data Security & Protection Toolkit v1.0.0
│       ├── dspt-ontology-v1.0.0.json
│       └── Entry-ONT-DSPT-001.json
├── GRC-04-SEC/                              ← Security Domain
│   ├── MCSB-ONT/                            ← Microsoft Cloud Security Benchmark v2.0.0
│   │   ├── mcsb-v2.0.0-oaa-v6.json
│   │   ├── source/v2/MCSB-ONTOLOGY-V2.0.0.json
│   │   └── Entry-ONT-ALZ-001.json
│   ├── MCSB2-ONT/                           ← MCSB v2 Extended
│   │   └── Entry-ONT-MCSB2-001.json
│   ├── PII-ONT/                             ← PII Governance (Microsoft-native) v3.3.0
│   │   ├── pii-governance-microsoft-native-v3.3.0.json
│   │   └── Entry-ONT-PII-001.json
│   └── AZALZ-ONT/                           ← Azure Landing Zone Assessment (PLACEHOLDER)
│       └── Entry-ONT-AZALZ-001.json
├── GRC-05-RES/                              ← Resilience Domain
├── GRC-06-AI/                               ← AI Governance Domain
├── RCSG-04-GOV/                             ← RCSG Governance Framework v2.0.0
│   ├── RCSG-FW-ONT/
│   │   ├── rcsg-framework-ontology-v2.0.0.json
│   │   ├── rcsg-fw-mapping-instances-v2.0.0.json
│   │   └── Cyber-Risk-ONT/                  ← Cyber Risk Domain Ontology
│   │       ├── cyber-risk-domain-ontology.json
│   │       ├── cyber-risk-vsom.json
│   │       ├── cyber-risk-bsc.json
│   │       └── *.mermaid (vsom-hierarchy, bsc-strategy, vsem-execution)
│   └── Cyber_Governance_Code_of_Practice.pdf
└── SECURITY_STANDARDS_REFERENCE_AI_CICD.md
```

### Ontology Dependency Chain for ALZ Assessment

```text
GRC-FW-ONT v3.0.0 (hub)
├── RMF-IS27005-ONT (risk assessment methodology)
├── ERM-ONT (enterprise risk register)
├── MCSB-ONT v2.0.0 (Azure security benchmark — 12 control families)
│   └── AZALZ-ONT (Azure Landing Zone design area assessment) ← PLACEHOLDER
├── GDPR-ONT (GDPR regulatory mapping → PbD evidence)
├── NCSC-CAF-ONT (NCSC Cyber Assessment Framework → SbD evidence)
├── DSPT-ONT (NHS Data Security & Protection Toolkit)
├── PII-ONT v3.3.0 (PII governance — Purview/Microsoft-native)
└── RCSG-FW-ONT v2.0.0 (Cyber Governance Code of Practice)
    └── Cyber-Risk-ONT (cyber risk domain + VSOM + BSC)
```

### AZALZ-ONT Status

AZALZ-ONT is currently a **placeholder** (status: `placeholder`, all compliance gates: `pending`). The ontology entry defines planned components:

| Component | Description |
|---|---|
| **Design Areas** | ALZ design areas: Identity, Network, Management, Platform, Security |
| **Compliance Checks** | Landing zone compliance assessment criteria |
| **Governance Policies** | Azure Policy and governance evaluation |
| **Maturity Levels** | ALZ implementation maturity assessment (Levels 1–5) |
| **Remediation Guidance** | Gap remediation and improvement recommendations |

**Dependencies:** `Entry-ONT-ALZ-001` (MCSB-ONT), `Entry-ONT-MCSB2-001` (MCSB v2 Extended)

**Priority:** AZALZ-ONT must be promoted from placeholder to v1.0.0 as a prerequisite for the `pfc-alz-assess` skill (KR1.1). This is a blocking dependency for ALZ Assessment productisation.

---

## 13. Relationship to Existing Briefs & Docs

| Document | Relationship |
|---|---|
| `PFI-W4M-RCS-AZA-STRAT-BRIEF-Azure-Assessments-Strategy-v1.0.0.md` | Parent — establishes Microsoft assessment leverage; this brief specialises for ALZ |
| `PFC-GRC-BRIEF-Azure-RCS-Assessment-Platform-v1.0.0.md` | Platform — Epic 68 defines the Azure-RCS assessment platform infrastructure |
| `PFC-GRC-BRIEF-Generic-Risk-Management-Framework-v1.0.0.md` | Framework — RMF provides the risk assessment methodology used in ALZ scoring |
| `PFI-AIRL-VE-BRIEF-01-Vision-Strategy-VSOM-v2.0.0.md` | Upstream — AIRL VSOM cascade; ALZ assessment is S2 execution |
| `PFI-AIRL-GRC-BRIEF-06-Domains-Compliance-v2.0.0.md` | Upstream — AIRL 9-domain model; ALZ assessment applies all 9 domains |
| `PFI-W4M-RCS-AZA-SCOPE-ALZ-WAF-Assessment-v1.0.0.md` | **Companion** — Client-deliverable assessment scope: 8 ALZ design areas + 5 WAF pillars, maturity scoring, delivery methodology |

---

## 14. Summary — VE Skill Chain Position

| VE Layer | Finding |
|---|---|
| **Vision** | Definitive pre-deployment ALZ assessment — assess first, deploy once, PbD/SbD-native |
| **Strategy** | 5 strategy pillars: 8 ALZ design area scoring + 5 WAF pillar scoring, MCSB baseline, PbD/SbD gates, CAF→ALZ bridge, compliance evidence |
| **Objectives** | Productise skill (Q2), 10 engagements (Q4), zero critical findings, 100% PbD/SbD gate coverage |
| **KPIs** | ≤3-day delivery, ≥85% MCSB coverage, ≥70% assessment→deployment conversion, ≥65 NPS |
| **Value Prop** | Pain: ALZ design is ad-hoc, security discovered post-build, privacy absent. AIRL: scored, gated, sprint-ready in 3 days |
| **Kano** | PbD/SbD gates = Excitement/Moat. CAF→ALZ bridge = Excitement. Design area scoring = Performance. DPIA auto-gen = Excitement |
| **PMF** | Post-CAF clients at peak intent. Microsoft creates ALZ demand; AIRL captures the pre-deployment assessment gap. Sean Ellis target ≥40% |
| **DMAIC** | Define→Measure→Analyse→Improve→Control maps 1:1 to assessment delivery. Every phase independently automatable. Manual 3–5 days → semi-auto 1–2 days → fully auto <4 hours |
| **DELTA** | PE-ONT 5-phase discovery: Discover→Evaluate→Leverage→Transform→Adapt with G1–G5 gates. Contextualised via pfc-ve-context-agent ContextualisationManifest. MECE gap discipline, hypothesis testing, sensitivity analysis. Terminates in QVF economic case |

The structural insight: **WAR scores after deployment; AIRL ALZ Assessment scores before.** This is not a timing difference — it is a fundamentally different value proposition. Pre-deployment assessment prevents findings. Post-deployment review discovers them. Prevention is worth more than discovery, and the PbD/SbD gates make it structurally uncopyable by any partner without an ontology-driven scoring model.

---

*PFI-W4M-RCS-AZA-STRAT-BRIEF-Azure-Landing-Zone-Assessment-v1.0.0.md*
*VE Skill Chain Brief | v1.0.0 | 2026-03-13*
*INTERNAL — STRATEGIC | PFC Programme*
