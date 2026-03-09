# From Audits to Programme

## How Snapshot Audits Provide the Context Engineering for a Value-Creating PPM Programme

| Property | Value |
|----------|-------|
| Document Title | From Audits to Programme |
| Document Reference | EA-PPM-AC-2026-001 |
| Version | 1.0 |
| Date | 05 February 2026 |
| Status | Draft for Review |
| Classification | Internal — Commercial in Confidence |

---

## 1. The Core Idea

The five snapshot audits are not compliance exercises performed for their own sake. They are **context engineering** — the systematic construction of the situational understanding that an Enterprise Architecture and a PPM programme require before they can be designed, scoped, and delivered.

Without the audits, the programme would be designed blind: investing in AI capabilities without knowing whether the cloud infrastructure is secure, building integrations without understanding the third-party landscape, automating processes without knowing which ones exist, and deploying agents without an AI governance framework.

The audits provide the "Where We Are" that makes the "Where We Want To Be" honest and achievable.

```text
AUDITS                         EA ARCHITECTURE                PPM PROGRAMME
(Context Engineering)          (Design)                       (Value Creation)
─────────────────────         ──────────────────             ────────────────────
"What do we have?"        →   "What do we need?"         →   "What do we build?"
"What state is it in?"    →   "What's the gap?"          →   "In what order?"
"What are the risks?"     →   "What decisions must       →   "What value does
"What's missing?"              we make?"                      each initiative
"What's manual?"          →   "What capabilities              deliver?"
                               are needed?"               →   "How do we measure
                                                               success?"
```

---

## 2. The Basis for the Audits

### Why Five Workstreams?

The five audit workstreams were not chosen arbitrarily. They map to the five domains that the EA must understand before any architecture can be designed or any initiative can be scoped:

| Audit Workstream | Domain | Why This Audit Exists | What Happens Without It |
|-----------------|--------|----------------------|------------------------|
| **ALZ** (Azure Landing Zone) | Cloud Infrastructure | The Azure environment hosts the AI platform, the Enterprise Graph, the data pipelines, and the integration layer. We need to know its posture before we build on it. | We deploy AI services and data workloads onto an infrastructure whose security posture, cost structure, and configuration are unknown. Compliance gaps go undetected. Costs spiral. |
| **O365** (Microsoft 365 Tenancy) | Identity, Collaboration, Productivity | M365 is where 800 people work every day — email, Teams, SharePoint, OneDrive. Entra ID controls who can access what. Copilot depends on well-governed M365 data. | We roll out Copilot onto a tenancy with identity governance gaps. Sensitive data is exposed. DLP policies are missing. Copilot gives wrong answers because the data it reads is ungoverned. |
| **PP** (Power Platform) | Low-Code, Automation, Dataverse | Power Platform is the automation layer — Power Automate, Power Apps, Copilot Studio. Dataverse is a potential data store. Without governance, it becomes shadow IT. | Business teams build ungoverned automations. Connectors expose data to unauthorised services. DLP policies don't exist. Dataverse becomes another data silo instead of a managed platform. |
| **TP** (Third-Party Applications) | Vendor Landscape, Integrations, SaaS Risk | Acturis is the core business system — client, policy, claims, accounts. Other third-party apps handle specialist functions. Their APIs, permissions, and risk profiles must be understood. | We design the Enterprise Graph without knowing whether Acturis data is extractable. We assume integrations that don't exist. Vendor risks go unmanaged. API permissions are over-privileged. |
| **RCSG** (Risk, Compliance, Security, Governance) | Governance, Regulatory, AI Ethics | Every initiative operates within a regulatory context (FCA, PRA, GDPR, DORA, UK AI Act). Without a governance framework, AI deployment is a liability, not a capability. | We deploy AI agents without governance. Compliance obligations are undocumented. Risk is unregistered. When the regulator asks "how do you govern your AI?", we have no answer. |

### How They Relate to Each Other

The audits are not independent — they form a connected assessment that covers the entire operational technology landscape:

```text
                    ┌──────────────────────────────┐
                    │        RCSG Governance        │
                    │  (Cross-cutting: risk, comp-  │
                    │  liance, security, AI ethics)  │
                    └──────────┬───────────────────┘
                               │ governs all
          ┌────────────────────┼────────────────────┐
          │                    │                     │
┌─────────▼──────┐  ┌─────────▼──────┐  ┌──────────▼─────┐
│  ALZ Audit     │  │  O365 Audit    │  │  PP Audit      │
│  (Azure infra) │  │  (M365 tenant) │  │  (Power Plat)  │
│                │  │                │  │                │
│  Hosts:        │  │  Manages:      │  │  Automates:    │
│  - AI platform │  │  - Identity    │  │  - Workflows   │
│  - Graph DB    │  │  - Collab      │  │  - Apps        │
│  - Data pipes  │  │  - Copilot     │  │  - Agents      │
└────────────────┘  └────────────────┘  └────────────────┘
          │                    │                     │
          └────────────────────┼────────────────────┘
                               │ integrates with
                    ┌──────────▼───────────────────┐
                    │       TP Audit               │
                    │  (Third-party apps)           │
                    │                               │
                    │  Connects:                    │
                    │  - Acturis (core business)    │
                    │  - Specialist SaaS            │
                    │  - External data sources      │
                    └──────────────────────────────┘
```

RCSG sits above and across all workstreams — it governs the governance. ALZ, O365, and PP form the Microsoft platform layer. TP connects the platform to the external systems that the business depends on.

---

## 3. Context Engineering: What Each Audit Produces

### The Audit as Context

Each audit workstream produces structured artefacts that become the input context for the EA design and the PPM programme. This is context engineering — the deliberate construction of the knowledge base needed to make good architectural and programme decisions.

| Audit | Artefacts Produced | Context Provided | EA Design Input | PPM Programme Input |
|-------|--------------------|-----------------|-----------------|---------------------|
| **ALZ** (~80%, 17 artefacts) | Subscription architecture review, MCSB compliance assessment, resource configuration audit, security baseline evaluation, cost analysis, networking review | What Azure infrastructure exists, how it's configured, where it deviates from Microsoft Cloud Security Benchmark, what it costs, and what's missing | Technology Capability layer — current state. Enterprise Graph deployment target. AI platform hosting requirements. | EPIC-1-03 (Azure Platform Governance): scope, priority, remediation plan. Informs every initiative that deploys to Azure. |
| **O365** (~50%, 6 artefacts) | M365 governance review, Entra ID posture assessment, identity and access audit, DLP policy review, license utilisation analysis, Copilot readiness | How identity is governed, who has access to what, where DLP gaps exist, whether the tenancy is ready for Copilot and AI agents | Technology Capability layer + AI Capability layer. Copilot prerequisites. Identity governance for agent data access. | EPIC-1-04 (M365 Governance): remediation scope. EPIC-2-02 (Copilot): readiness assessment. Informs every initiative touching M365 data. |
| **PP** (~25%, 4 artefacts) | Power Platform inventory, DLP policy assessment, connector governance review, Dataverse readiness evaluation | What Power Platform assets exist, whether they're governed, what connectors are in use, whether Dataverse is viable as a data layer | Technology Capability layer. Automation feasibility for process catalogue. Copilot Studio deployment readiness. | EPIC-1-05 (Power Platform Governance): scope. EPIC-2-03 (Decision Support): determines whether Power Platform is viable for automation. |
| **TP** (~25%, 4 artefacts) | Third-party application inventory, Graph API query results, vendor risk classification, API permissions audit, Acturis integration assessment | What external systems exist, how they integrate (or don't), what data they hold, what risk they carry, whether Acturis data is extractable | Information Capability layer. Enterprise Graph data source mapping. Acturis extraction feasibility for Client 360. | EPIC-3-01 (Client 360): gated by Acturis API access. EPIC-1-01 (Enterprise Graph): data source availability. Informs every initiative needing external data. |
| **RCSG** (~15%, 2 artefacts) | Risk register structure, compliance obligation inventory, AI governance principles, regulatory mapping (FCA, PRA, GDPR, DORA, UK AI Act) | What regulatory obligations apply, what risks are registered (and what aren't), whether AI governance exists, how compliance is currently managed | All capability layers — cross-cutting. RCSG ontology provides the governance schema. Compliance cross-mapping automation design. | EPIC-1-06 (RCSG Framework): scope and priority. EPIC-2-04 (AI Governance): framework input. Informs every initiative — nothing deploys without governance context. |

### What the Audits Tell Us Collectively

When the five audits are read together, they paint a comprehensive picture of organisational readiness:

**Infrastructure readiness** (ALZ + O365)
- *In plain terms:* Can we safely build on what we have, or do we need to fix the foundations first?
- *What we know:* Azure is partially assessed with compliance gaps identified but unquantified in production. M365 has identity governance gaps. Both need hardening before AI workloads are deployed.

**Data readiness** (TP + PP + O365)
- *In plain terms:* Can we get to the data we need, and is it in a fit state to use?
- *What we know:* Acturis integration is unmapped — API access is the single biggest dependency. Power Platform data governance is absent. M365 data is ungoverned. The Enterprise Graph has no data sources connected yet.

**Automation readiness** (PP + TP)
- *In plain terms:* Can we automate processes, and do we know which platforms to use?
- *What we know:* Power Platform is ungoverned — needs DLP and connector controls before it's safe for automation. Acturis process integration is unknown. The 60% manual process baseline is acknowledged but uncharted.

**Governance readiness** (RCSG)
- *In plain terms:* Do we have the governance structures to deploy AI responsibly and comply with regulations?
- *What we know:* No risk register exists. No compliance obligation inventory. No AI governance framework. This is the most critical gap — without governance, every other initiative carries unmanaged risk.

**AI readiness** (all five)
- *In plain terms:* Can we deploy AI agents and automation safely, effectively, and in compliance with regulations?
- *What we know:* 3 agents in development but without governance. Copilot not deployed and M365 not ready for it. Azure can host AI workloads but posture needs hardening. Data for AI context (Acturis, graph) not yet available. This is the compound gap — every audit contributes a piece of AI readiness.

---

## 4. From Context to Architecture

The audits don't just describe what exists — they generate the architectural requirements that the EA design must address.

### How Audit Findings Become Architectural Requirements

```text
AUDIT FINDING                          ARCHITECTURAL REQUIREMENT              EA ARTEFACT
──────────────                         ──────────────────────────             ────────────
"MCSB compliance gaps                  "Azure posture must meet MCSB v2      ADR: Compliance
 unquantified in production"       →    before AI workloads deploy"      →   automation approach

"Acturis integration unmapped"     →   "Graph schema must support            Enterprise Graph
                                        Acturis as a plug-in data source     Specification
                                        with fallback to mock data"      →

"No AI governance framework"       →   "Every agent must have governance     Agentic Layer
                                        controls, audit logging, and          Architecture
                                        human-in-the-loop before deploy" →

"60% of processes are manual"      →   "Process catalogue with automation    Process Automation
                                        feasibility scoring required         Assessment
                                        before prioritisation"           →

"No risk register"                 →   "Machine-readable risk register       RCSG Ontology v2
                                        connected to the Enterprise
                                        Graph as a first-class domain"   →

"Entra ID governance gaps"         →   "Identity governance hardened         M365 Governance
                                        before Copilot rollout and           Hardening Plan
                                        agent data access enabled"       →

"Power Platform ungoverned"        →   "DLP policies and connector           PP Governance
                                        controls before any new               Assessment
                                        automation workloads"            →
```

### The Architecture as the Bridge

The EA architecture sits between the audits (context) and the programme (value):

```text
                AUDITS                    EA ARCHITECTURE                  PPM PROGRAMME
            (What we know)              (What we decide)                 (What we build)

ALZ findings ──────────►  Technology     ────► EPIC-1-03: Azure Governance
                          Capability           EPIC-1-01: Graph Deployment
                          Layer
                                                     ↓ enables
O365 findings ─────────►  AI Capability  ────► EPIC-2-02: Copilot Rollout
                          Layer                EPIC-2-01: Agent Platform
                                                     ↓ enables
PP findings ───────────►  Business       ────► EPIC-2-03: Decision Support
                          Capability           EPIC-1-07: Process Catalogue
                          Layer
                                                     ↓ enables
TP findings ───────────►  Information    ────► EPIC-3-01: Client 360
                          Capability           EPIC-1-01: Graph Data Sources
                          Layer
                                                     ↓ enables
RCSG findings ─────────►  All Layers     ────► EPIC-1-06: RCSG Framework
                          (cross-cutting)      EPIC-2-04: AI Governance
```

---

## 5. From Architecture to Programme: The Value Chain

### How Context Becomes Value

The PPM programme is the mechanism by which architectural requirements become value-creating initiatives. Each initiative exists because:

1. An **audit finding** identified a gap or risk (context)
2. The **EA architecture** defined the capability needed to address it (design)
3. The **PPM programme** packages it as a scoped, resourced, measurable initiative (delivery)
4. The **BSC framework** measures whether it delivered the intended value (measurement)

This is the full chain from context to value:

| Audit Finding | Architectural Requirement | PPM Epic | Initiatives | BSC Value |
|--------------|--------------------------|----------|------------|-----------|
| No unified data model; data siloed across Acturis, M365, spreadsheets | Enterprise Graph as the foundational information architecture | EPIC-1-01: Enterprise Graph Foundation | Graph DB selection, schema design, compliance data load, identity data load, Acturis API scoping | **L2: Data Foundation** — enables 80% of all initiatives |
| No data governance platform; no classification; no lineage | Microsoft Purview as the data governance layer | EPIC-1-02: Data Governance Platform | Purview deployment, classification policy, quality baseline | **L2: Data Foundation, P3: Compliance** — governed data for AI and regulatory needs |
| Azure posture unquantified in production; MCSB gaps | Hardened Azure platform meeting MCSB v2 | EPIC-1-03: Azure Platform Governance | ALZ v2 execution, MCSB gap analysis, remediation plan | **P3: Compliance, L2: Data Foundation** — safe platform for AI workloads |
| Identity governance gaps; Copilot prerequisites unmet | Governed M365 tenancy ready for Copilot and agent data access | EPIC-1-04: M365 Governance Hardening | Entra ID hardening, conditional access, Copilot readiness | **P3: Compliance** — secure identity; enables Copilot |
| Power Platform ungoverned; DLP absent | Governed Power Platform with DLP and connector controls | EPIC-1-05: Power Platform Governance | DLP audit, connector governance, Dataverse assessment | **P3: Compliance, L3: AI Platform** — safe automation |
| No risk register; no compliance inventory; no AI governance | RCSG governance framework with machine-readable risk register | EPIC-1-06: RCSG Governance Framework | Risk register MVP, compliance inventory, cross-mapping automation | **P3: Compliance, F4: Cost-to-Serve** — regulatory readiness |
| ~60% manual processes; no catalogue | Catalogued and scored process landscape | EPIC-1-07: Process Catalogue | Process workshop, manual inventory, automation scoring | **P1: Automation, F2: Margin, F4: Cost-to-Serve** — path to <=20% manual |
| AI agents in development without governance or graph context | Governed agent platform with graph-connected context | EPIC-2-01: Agent Platform | Emma/Matt/Sci-Tech v2, orchestration design, graph context | **C2: Experience, L1: AI Workforce** — augmented people |
| Copilot not deployed; M365 not ready | Copilot adoption with governed M365 data | EPIC-2-02: Copilot & M365 AI | Licensing, pilot deployment, training | **L1: AI Workforce** — productivity across 800 people |
| No AI-assisted decision making | Decision support prototypes for key business processes | EPIC-2-03: Decision Support | Policy comparison, renewals automation, Next Best Action, prospecting | **P4: Decision Quality, F1: Revenue** — smarter commercial outcomes |
| No AI governance framework | AI governance aligned to UK AI Act, OWASP LLM Top 10, FCA | EPIC-2-04: AI Governance | Governance policy, agent risk assessment, HITL controls, audit logging | **P3: Compliance, L1: AI Workforce** — responsible AI |
| No Client 360 view; Acturis data inaccessible | Connected client view powered by Enterprise Graph | EPIC-3-01: Client 360 MVP | Acturis engagement, data extraction, Client 360 UI, graph client domain | **C1: Retention, C4: Insight, F1: Revenue** — know our clients |
| Risk analysis manual and inconsistent | AI-augmented risk analysis for MGA business | EPIC-3-02: MGA Risk Analysis Trial | Risk data modelling, Sci/Tech agent extension, trial execution | **C4: Insight, P4: Decision Quality** — better risk decisions |
| Agents operate independently with no collaboration | Orchestrated agent layer with handoff and context sharing | EPIC-3-03: Agentic Orchestration Design | Orchestration architecture, handoff protocol, autonomy model | **L1: AI Workforce, L3: AI Platform** — compound agent value |

### The Value Equation

Every initiative in the programme has a traceable value chain:

```text
Audit → Gap → Requirement → Capability → Initiative → BSC Metric → Business Value

Example:
  "No risk register" (RCSG audit)
  → Governance gap
  → "Machine-readable risk register needed" (requirement)
  → RCSG Governance capability (architecture)
  → EPIC-1-06: Risk register MVP, compliance cross-mapping (initiative)
  → P3: 90% compliance checks automated (metric)
  → Regulatory confidence, reduced audit cost, faster response to FCA (value)
```

No initiative exists without a corresponding audit finding or strategic requirement. No initiative is orphaned from a BSC objective. This is how audits become value.

---

## 6. The Programme as a Whole

### Three Pillars, Fourteen Epics, One Value Chain

```text
AUDIT CONTEXT                         PROGRAMME STRUCTURE

 ALZ ──────┐                          Pillar 1: FOUNDATIONAL INFRASTRUCTURE
 O365 ─────┤                          ├── EPIC-1-01  Enterprise Graph Foundation
 PP ───────┤──► EA Architecture ──►   ├── EPIC-1-02  Data Governance Platform
 TP ───────┤                          ├── EPIC-1-03  Azure Platform Governance
 RCSG ─────┘                          ├── EPIC-1-04  M365 Governance Hardening
                                      ├── EPIC-1-05  Power Platform Governance
 BSC Objectives ──────────────────►   ├── EPIC-1-06  RCSG Governance Framework
                                      └── EPIC-1-07  Process Catalogue
 Strategy (VSOM/OKR) ────────────►
                                      Pillar 2: AI AUGMENTATION
 Initiative Portfolio ───────────►    ├── EPIC-2-01  Virtual Agent Platform
                                      ├── EPIC-2-02  Copilot & M365 AI
                                      ├── EPIC-2-03  Decision Support & Automation
                                      └── EPIC-2-04  AI Governance

                                      Pillar 3: ACCELERATION WITH GEN AI
                                      ├── EPIC-3-01  Client 360 MVP
                                      ├── EPIC-3-02  MGA Risk Analysis Trial
                                      └── EPIC-3-03  Agentic Orchestration Design
```

### How the Programme Creates Value

| Pillar | Number of Epics | Audit Context Required | Value Created |
|--------|----------------|----------------------|---------------|
| **1. Foundational Infrastructure** | 7 epics | All 5 audits — this pillar directly addresses every audit finding | The foundations that make everything else possible: governed infrastructure, connected data, catalogued processes, compliance baseline |
| **2. AI Augmentation** | 4 epics | RCSG (governance), O365 (identity), ALZ (hosting), TP (data) | People augmented by AI: agents that help with clients, Copilot that helps with documents, decision support that helps with judgement |
| **3. Acceleration with Gen AI** | 3 epics | All 5 audits (compound) — acceleration requires all foundations + augmentation in place | Transformational capabilities: Client 360 view, autonomous risk analysis, orchestrated agents working together |

### The Manual Process Reduction Path

The audit context also drives the single most tangible programme metric — reducing manual process from 60% to <=20%:

```text
CURRENT STATE (from audits)              PROGRAMME                    TARGET STATE

60% manual processes                     Pillar 1:                    Phase 2: 60% → 45%
├── No process catalogue                 Process Catalogue            (catalogue + first
├── Manual renewals                      (EPIC-1-07)                   automations)
├── Manual prospecting
├── Manual compliance checks             Pillar 2:                    Medium: 45% → 30%
├── Manual data re-keying                Decision Support,            (agent-assisted
├── Manual reporting                     Renewals, Prospecting         processes)
├── Manual risk assessment               (EPIC-2-03)
└── Manual policy comparison                                          Long: 30% → <=20%
                                         Pillar 3:                    (autonomous
  Context: "we don't even know           Client 360, MGA Risk,        workflows, STP,
  which 60% is manual"                   Agent Orchestration           multi-portal
  (audit finding)                        (EPIC-3-01/02/03)            automation)
```

---

## 7. Summary: The Chain

```text
1. AUDITS exist to build context — what we have, what state it's in, what's missing.

2. CONTEXT feeds the architecture — turning findings into requirements,
   gaps into capabilities, risks into governance.

3. ARCHITECTURE feeds the programme — packaging capabilities into
   epics, sequencing by dependency, measuring by BSC.

4. THE PROGRAMME creates value — reduced manual process, augmented
   people, automated compliance, connected data, better client outcomes.

5. THE BSC measures value — 16 objectives, quantified targets,
   traceable from initiative to strategic outcome.

Nothing is built without context.
Nothing is designed without a finding.
Nothing is delivered without a measure.

AUDITS → CONTEXT → ARCHITECTURE → PROGRAMME → VALUE → MEASUREMENT
```

---

## 8. Document Cross-References

| Document | Relationship |
|----------|-------------|
| **EA-Workshop-Outline-v1.md** | Session 2 (Where We Are) presents audit context to the workshop |
| **EA-Assignment-Proposal-v1.md** | Design assignment consumes audit outputs to produce the EA architecture |
| **EA-Key-Artefacts-v1.md** | Defines the 14 PPM epics that translate audit context into value-creating initiatives |
| **EA-TOGAF-Rationalisation-v1.md** | Explains how audits map to TOGAF Phase D (Technology Architecture) |
| **EA-Framework-Summary-v1.md** | Describes the ontology-driven method by which context is captured and maintained |
| **EA-Strategy-Review-Wave1-Priorities-v1.md** | Defines Wave 1 priority items across audit workstreams |
| **AI-Strategy-Programme-Executive-Summary.md** | Programme context — 50+ initiatives, BSC framework, programme timeline |
| **EA_PPM_Portfolio_Review_Context_Summary_v3.docx.md** | Full strategic context — 5 pillars, 16 objectives, all initiatives |

---

*EA-PPM-AC-2026-001 — From Audits to Programme v1.0*
*Classification: Internal — Commercial in Confidence*
