# EA Vision & Roadmap Workshop — Outline

## The Enterprise Architecture: Model, Layers, and Roadmap for AI-Augmented Professional Services

| Property | Value |
|----------|-------|
| Document Title | EA Vision & Roadmap Workshop — Outline |
| Document Reference | EA-PPM-WS-2026-001 |
| Version | 1.1 |
| Date | 05 February 2026 |
| Status | Draft for Review |
| Classification | Internal — Commercial in Confidence |
| Format | 1-Day Workshop (6 hours working time) |
| Participants | Steering Committee, EA Lead, Programme Manager, Business Leads, IT Leads |
| Pre-Reading | EA PPM Context Summary v3.1, Wave 1 Priorities v1.0, Executive Summary |

---

## Workshop Purpose

Present the Enterprise Architecture as a structured model with clear capability layers and a phased roadmap — then use that model to frame where we are today, where we need to be, and what it will take to get there.

The workshop is organised around three progressive pillars:

| Pillar | Focus | Key Question |
|--------|-------|-------------|
| **1. Foundational Infrastructure** | Data, graph, governance, platform, security | What must be in place before anything else works? |
| **2. AI Augmentation** | Virtual agents, Copilot, decision support, workforce enablement | How do we augment our people with AI capabilities? |
| **3. Acceleration with Gen AI** | Autonomous workflows, predictive analytics, transformational change | What becomes possible when foundations and augmentation compound? |

By the end of the day, the team will have:

1. A shared understanding of the EA model and its four capability layers
2. An honest assessment of current state mapped against that model
3. A vision for the target state, framed through the three pillars
4. Agreement on what can be achieved in the next 4 months (Phase 2: Feb-May 2026)
5. A line of sight to the 24-month transformation horizon
6. A commission for the 2-3 week EA Design Assignment to specify the programme

---

## Pre-Work (Circulated 3 Working Days Before)

| # | Item | Owner | Purpose |
|---|------|-------|---------|
| PW-1 | EA PPM Context Summary v3.1 | Workshop Lead | Full strategic context — 5 pillars, 16 BSC objectives, 50+ initiatives |
| PW-2 | Wave 1 Priorities v1.0 | EA Lead | Current audit workstream status and Wave 1 deliverables |
| PW-3 | Executive Summary (1-pager) | Workshop Lead | Quick reference — VSOM hierarchy, BSC metrics, programme timeline |
| PW-4 | BSC Strategy Map (PDF/Mermaid) | Workshop Lead | Visual cause-effect chain across all 4 BSC perspectives |
| PW-5 | Snapshot Audit Summary (1-pager, to be prepared) | EA Lead | Current state across all 5 audit workstreams — what we know, what we don't |

---

## Agenda

### Session 1: The Enterprise Architecture Model (09:00 - 10:15)

**Objective:** Present the EA as a structured model with four capability layers, the Enterprise Graph as its foundation, and the BSC strategy cascade that drives it.

#### 1A — Vision, Strategic Context, and EA Approach (20 mins)

- Vision: AI-Augmented Professional Services Excellence
- The 5 Strategic Pillars and their investment weighting (S1-S5 + RCSG)
- The 16 BSC Objectives and their cause-effect cascade (Financial ← Customer ← Process ← Learning & Growth)
- The critical path: L2 Data Foundation enables 80% of all initiatives
- Phase 2 milestones (M1-M4, Feb-May 2026) and what's already committed

**What is Enterprise Architecture?**

Enterprise Architecture (EA) is the discipline of defining how an organisation's business strategy translates into the systems, data, processes, and technology that deliver it. In TOGAF terms, EA is *"a coherent whole of principles, methods, and models that are used in the design and realisation of an enterprise's organisational structure, business processes, information systems, and infrastructure."*

For a mid-market professional services firm — circa £100M turnover, ~800 people — EA is not about building the kind of heavyweight architecture practice found in FTSE 100 organisations. It is about ensuring that:

- **Business capabilities** (client management, sales, compliance, advisory) are supported by the right information, applications, and technology — not by spreadsheets and workarounds
- **Data flows** between systems (Acturis, M365, Azure, Power Platform) in a governed, connected way — not trapped in silos
- **Technology investments** (AI, automation, cloud infrastructure) are sequenced and integrated — not deployed as disconnected point solutions
- **Regulatory obligations** (FCA, PRA, GDPR, DORA, UK AI Act) are designed into the architecture from the outset — not bolted on after the fact

At this scale, the EA function is lean: one Enterprise Architect supported by a Solution Architect and AI-assisted tooling, working within a close-knit steering committee. The architecture covers four domains — Business, Information, AI, and Technology — and its scope is the entire organisation's operating model as it transforms from manual, siloed operations to AI-augmented, data-driven professional services.

**EA Methodology: TOGAF — Fast-Tracked and Fit-for-Purpose**

TOGAF (The Open Group Architecture Framework) is the world's most widely adopted EA standard, used by over 80% of leading enterprises. It provides a structured method — the Architecture Development Method (ADM) — for developing an enterprise architecture through a cycle of phases.

We follow TOGAF's ADM as our guiding framework, but applied pragmatically for a mid-market firm rather than as a bureaucratic exercise. In a large enterprise, each phase below might take months and involve dozens of architects. For us, the same ground is covered in weeks by a lean team with AI augmentation.

**Where we are in the TOGAF cycle:**

- **Preliminary Phase — "How will we do EA?"** — DONE
  - *In plain terms:* Before you can build an architecture, you need to agree how you'll work — what tools, what standards, what governance.
  - *What we've done:* Defined the EA framework (tools, ontology standards, repository structure), established the OAA v6 quality standard, set up the GitHub repository for all artefacts, defined the SA → EA → CTO governance hierarchy.
  - *Status:* Complete. The framework is in place.

- **Architecture Vision (Phase A) — "What are we trying to achieve?"** — THIS WORKSHOP
  - *In plain terms:* Get everyone in a room and agree the big picture — what does the target look like, what are the priorities, and what's the scope of the architecture work.
  - *What this workshop does:* Establishes the shared vision (AI-Augmented Professional Services Excellence), confirms the three pillars (Foundation → Augmentation → Acceleration), agrees Phase 2 scope, and commissions the design assignment.
  - *Status:* This workshop is Phase A. By end of day we will have an agreed architectural vision.

- **Business Architecture (Phase B) — "What does the business need?"** — PARTIALLY DONE + DESIGN ASSIGNMENT
  - *In plain terms:* Understand the business — what it does, what it needs to do better, what processes are manual, what capabilities are missing.
  - *What we've done:* The BSC framework defines 16 business objectives across 5 strategic pillars. The AI Strategy Programme maps 50+ initiatives to those objectives. The snapshot audits reveal where the business is today.
  - *What the design assignment adds:* Stakeholder interviews to map business processes, the process catalogue (top 20 manual processes), and the Business Capability layer of the EA design.
  - *Status:* Strategy and objectives defined. Process-level detail comes from the design assignment.

- **Information Systems Architecture (Phase C) — "What data and systems are needed?"** — DESIGN ASSIGNMENT
  - *In plain terms:* Design how data will flow between systems and how information will be organised — so people can find what they need, systems can talk to each other, and AI has the data it needs to work.
  - *What the design assignment produces:* The Enterprise Graph specification (the database that connects all our data), data governance design (Microsoft Purview), and the Information Capability layer of the EA design.
  - *The Enterprise Graph in plain terms:* Today, client data is in Acturis, identity data is in Entra ID, compliance data is in audit outputs, and much of the rest is in spreadsheets. The Enterprise Graph connects all of these into a single, queryable knowledge layer — so a question like "which compliance obligations affect this client's policies?" can be answered by a system, not by a person searching through folders.
  - *Status:* Ontology framework (the structural blueprint) exists. The design assignment produces the full specification.

- **Technology Architecture (Phase D) — "What technology underpins it?"** — PARTIALLY DONE VIA AUDITS
  - *In plain terms:* Understand what technology we have, what state it's in, and what technology we need to add or improve.
  - *What we've done:* Five snapshot audits assess the current technology landscape:
    - ALZ Audit (~80% complete): Azure cloud infrastructure — how secure and well-configured is it?
    - O365 Audit (~50% complete): Microsoft 365 — how well-governed are identity, email, collaboration?
    - PP Audit (~25% complete): Power Platform — are our low-code tools governed and secure?
    - TP Audit (~25% complete): Third-party apps — is Acturis integration mapped? Are vendor risks understood?
    - RCSG Audit (~15% complete): Governance — do we have a risk register? Compliance obligation inventory? AI governance?
  - *What the design assignment adds:* 5 Architecture Decision Records (ADRs) for key technology choices, plus the Technology Capability layer of the EA design.
  - *Status:* Current state partially assessed. Live tenant audits (ALZ v2, O365 hardening) are Phase 2 deliverables.

- **Opportunities & Solutions (Phase E) — "How do we get there?"** — THIS WORKSHOP + DESIGN ASSIGNMENT
  - *In plain terms:* Look at the gap between where we are and where we need to be, and work out the best way to close it — what to build first, what to buy, what to do in parallel.
  - *What the workshop does:* The three pillars (Foundation → Augmentation → Acceleration) are our opportunities framework. Session 3 maps specific capabilities to each pillar. Session 4 identifies constraints and dependencies.
  - *What the design assignment adds:* The 14 PPM epics are the solution packages. The dependency analysis shows what must come before what. The BSC Implementation Map ensures every initiative traces to a strategic objective.
  - *Status:* High-level opportunities mapped in the workshop. Detailed solution design in the assignment.

- **Migration Planning (Phase F) — "In what order do we do it?"** — DESIGN ASSIGNMENT
  - *In plain terms:* Build the roadmap — what happens in the next 4 months, the next 12, the next 24. Sequence the work so that foundations come first and later work can build on them.
  - *What the design assignment produces:* Capability Roadmap (4/12/24 months), Programme Design with workstreams, Phase 2 Gantt chart, and the epic dependency map.
  - *Status:* Phase 2 scope agreed in the workshop. Detailed migration plan produced in the design assignment.

- **Implementation Governance (Phase G) — "Are we building what we designed?"** — ONGOING FROM PHASE 2
  - *In plain terms:* As we build, make sure we're actually following the architecture — not drifting off in ad hoc directions. Review progress, check conformance, manage changes.
  - *How we do it:* Monthly steering committee reviews. PR-based artefact governance (every document and model change is reviewed before it's accepted). Ontology quality validation via OAA v6 (6 automated quality gates). Architecture Decision Records for every significant technology choice.
  - *Status:* Governance structure defined. Operational from Phase 2 start.

- **Architecture Change Management (Phase H) — "How do we keep it current?"** — BUILT INTO THE TOOLING
  - *In plain terms:* The architecture isn't a one-time document — it needs to evolve as the business changes, new technology emerges, and regulations shift. How do we keep it alive?
  - *How we do it:* Because the architecture is encoded as machine-readable ontologies (not static documents), it's version-controlled in GitHub — every change has an audit trail. The Enterprise Graph evolves as new data sources connect. Continuous compliance monitoring flags when the architecture drifts from policy.
  - *In plain terms:* Unlike a traditional architecture that's written once and becomes outdated within months, this one is a living model that updates as the organisation changes.
  - *Status:* Change management is inherent in the ontology-driven approach. No separate process needed.

**How This Workshop Maps to TOGAF**

Each workshop session directly serves one or more TOGAF phases:

| Workshop Session | TOGAF Phase(s) | What It Achieves (in plain terms) |
|-----------------|----------------|----------------------------------|
| **Session 1: The EA Model** | Phase A (Vision) + Preliminary | Present the architecture model so everyone shares the same mental picture of what we're building |
| **Session 2: Where We Are** | Phase B (Business) + Phase D (Technology) | Map what the audits and current operations tell us — honestly — against the architecture model |
| **Session 3: The Vision** | Phase A (Vision) + Phase E (Opportunities) | Paint the picture of where we want to be, organised through the three pillars, and identify what's possible |
| **Session 4: The Roadmap** | Phase E (Opportunities) + Phase F (Migration) | Agree what we'll do in the next 4 months and beyond, and identify what could block us |
| **Session 5: Agreement** | Phase A (Vision) + Phase F (Migration) | Lock in decisions, confirm scope, and commission the design assignment that produces the detailed architecture |

The approach is **platform-agnostic by design** — TOGAF's four architecture domains (Business, Data, Application, Technology) map directly to our four capability layers:

- **Business Architecture** → Business Capabilities layer
  - *In plain terms:* What the business does — client management, sales, compliance, advisory, claims
- **Data Architecture** → Information Capabilities layer
  - *In plain terms:* What data exists, where it lives, how it connects — the Enterprise Graph
- **Application Architecture** → AI Capabilities layer (extended for the AI era)
  - *In plain terms:* What applications and AI agents serve the business — virtual agents, Copilot, decision support
- **Technology Architecture** → Technology Capabilities layer
  - *In plain terms:* What infrastructure and platforms underpin everything — Azure, M365, Power Platform, security

We are mindful of the significant benefits of the Microsoft stack — deep integration across Azure, M365, Entra ID, Purview, Copilot, and Power Platform — and will leverage those benefits wherever they deliver value. But the architecture is not constrained by Microsoft's boundaries: the Enterprise Graph uses open standards (JSON-LD, schema.org), the ontology framework is vendor-neutral, and key capabilities (AI models, graph database, specialist tooling) are selected on merit, not vendor affinity.

TOGAF provides the rigour. The three pillars provide the narrative. The BSC provides the measurement. Together they give us a fast-tracked but defensible EA approach.

See **EA-TOGAF-Rationalisation-v1.md** for the full TOGAF definition, coverage matrix, and maturity assessment.

#### 1B — The Four Capability Layers (25 mins)

Present the EA model as four interdependent layers that the programme must build across:

```
┌──────────────────────────────────────────────────────────────────┐
│                     BUSINESS CAPABILITIES                        │
│  Client Intelligence │ Sales Enablement │ Advisory Services      │
│  Compliance Mgmt     │ Claims Processing │ Risk Assessment       │
├──────────────────────────────────────────────────────────────────┤
│                    INFORMATION CAPABILITIES                      │
│  Enterprise Graph │ Data Governance │ Data Quality               │
│  Ontology Framework │ Reporting & Analytics │ Data Integration   │
├──────────────────────────────────────────────────────────────────┤
│                       AI CAPABILITIES                            │
│  Virtual Agents │ NLP/Document Processing │ Decision Support     │
│  Anomaly Detection │ Predictive Analytics │ AI Governance        │
├──────────────────────────────────────────────────────────────────┤
│                    TECHNOLOGY CAPABILITIES                        │
│  Azure Infrastructure │ M365 Platform │ Power Platform           │
│  API/Integration Layer │ Security & Identity │ DevOps/CI-CD      │
└──────────────────────────────────────────────────────────────────┘
```

For each layer, map:

| Layer | Scope | Microsoft Stack | Beyond Microsoft |
|-------|-------|-----------------|------------------|
| **Business** | Client intelligence, sales enablement, compliance, advisory | Dynamics 365, Power Apps, Copilot | Acturis, specialist insurtech |
| **Information** | Data foundation, graph, governance, quality | Purview, Dataverse, Cosmos DB, Power BI | Neo4j, dbt, open data standards |
| **AI** | Virtual agents, NLP, decision support, anomaly detection | Azure OpenAI, Copilot Studio, Anomaly Detector | Claude, specialist ML, open-source models |
| **Technology** | Infrastructure, security, identity, API layer | Azure, Entra ID, Defender, API Management | Terraform, GitHub Actions, open-source tooling |

Key message: the programme builds capabilities **across all four layers simultaneously** — they are interdependent, not sequential.

#### 1C — The Enterprise Graph: Connective Tissue (20 mins)

Present the Enterprise Graph as the foundational architecture component that connects every layer:

```
Data Sources                  Graph Layer                    Capabilities
┌─────────────┐              ┌────────────────┐             ┌──────────────────┐
│ Acturis     │──extract──►  │                │──enables──► │ Client 360 View  │
│ M365/Entra  │──integrate─► │  Enterprise    │──enables──► │ Risk Intelligence│
│ Azure/ALZ   │──assess────► │  Knowledge     │──enables──► │ Compliance Auto  │
│ Power BI    │──connect───► │  Graph         │──enables──► │ Sales Insights   │
│ Spreadsheets│──migrate───► │                │──enables──► │ Process Auto     │
│ External    │──ingest────► │  (Neo4j /      │──enables──► │ AI Agent Context │
└─────────────┘              │   Cosmos DB)   │             └──────────────────┘
                             └────────────────┘
                                    │
                             ┌──────┴──────┐
                             │  Ontology   │
                             │  Framework  │
                             │  (OAA v6)   │
                             └─────────────┘
```

- The graph as a single semantic layer connecting Client, Product, Market, Sector, Risk, Compliance
- Ontology-driven: each domain has a formal schema (ALZ, O365, PP, TP, RCSG already defined)
- Microsoft stack native but not limited by it: vendor-agnostic, API-first, open standards (JSON-LD, schema.org)
- VSOM JSON-LD ontology as the machine-readable strategy layer
- "The ontology framework already exists — the graph needs data, not more architecture"

#### 1D — Live Demo: The Ontology Framework Today (15 mins)

- Show the ontology visualiser with the unified registry (6 series, 23 ontologies, cross-references)
- Demonstrate the 3-tier drill-through: Series → Ontology → Entity
- Show how ALZ, O365, RCSG ontologies already connect across domains
- "This is the seed of the Enterprise Graph — the schema is ready, the data connections are next"

**Break (15 mins)**

---

### Session 2: Where We Are — Current State (10:30 - 11:45)

**Objective:** Map the current state honestly against the EA model — what we have, what we don't, and what the snapshot audits tell us about readiness.

#### 2A — Snapshot Audits: Current State by Layer (45 mins)

Walk through each audit workstream and map findings to the capability layers:

| Workstream | Status | Layer(s) Affected | Key Finding Areas |
|------------|--------|-------------------|-------------------|
| ALZ Audit (alz-ss-v1) | ~80% complete, 17 artifacts | Technology, Information | Infrastructure posture, MCSB compliance gaps, subscription architecture |
| O365 Audit (o365-ss-v1) | ~50% complete, 6 artifacts | Technology, Business | Identity governance, M365 configuration, Entra ID posture |
| PP Audit (pp-ds-v1) | ~25% (docs only), 4 artifacts | Technology, AI | Power Platform governance gaps, DLP policy, Dataverse readiness |
| TP Audit (tp-as-v1) | ~25% (docs only), 4 artifacts | Information, Business | Acturis integration landscape, SaaS risk, API permissions |
| RCSG Governance (rcsg-v1) | ~15% (foundation), 2 artifacts | All layers | Risk register gap, compliance obligations inventory, AI governance absence |

For each layer of the EA model, summarise the current maturity:

| Layer | Current Maturity | Critical Gaps |
|-------|-----------------|---------------|
| **Business** | Ad hoc / manual | No Client 360, no process catalogue, manual renewals, spreadsheet-driven prospecting |
| **Information** | Fragmented | No unified data model, no graph database, data siloed across Acturis/M365/spreadsheets, no data governance platform |
| **AI** | Emerging | 3 virtual agents in development, no AI governance framework, no decision support, no Copilot rollout |
| **Technology** | Partially assessed | Azure posture unquantified in production, identity governance gaps, no DLP audit, no connector governance |

**Key discussion:** What do the audits tell us about readiness for each of the three pillars? Where are the critical gaps that block progress?

#### 2B — The Manual Process Problem (20 mins)

- Current state: ~60% of key processes are manual
- Target state: <=20% manual (F4: -60% manual steps, P1: 70% straight-through processing)
- Map manual processes to the EA layers:
  - **Business layer:** renewals handling, prospecting, client communications, claims processing
  - **Information layer:** data re-keying across portals, spreadsheet reconciliation, manual reporting
  - **AI layer:** no automated document processing, no intelligent routing, no decision support
  - **Technology layer:** manual compliance checks, manual provisioning, no policy-as-code
- Which processes are candidates for automation? Where does value lie?
- Reference: F2 (-25% cost), P1 (15+ processes automated), P3 (90% compliance checks automated)

#### 2C — The Gap Summary (10 mins)

Present the gap between current state and the EA model as a single visual:

```
                    Current State              Target State
                    ─────────────              ────────────
Business:           Manual, siloed         →   AI-augmented, data-driven
Information:        Fragmented, no graph   →   Enterprise Graph, governed
AI:                 Emerging (3 agents)    →   Embedded across operations
Technology:         Partially assessed     →   Hardened, governed, automated
Manual Process:     ~60%                   →   <=20%
```

"This is the gap. The three pillars — Foundation, Augmentation, Acceleration — are how we close it."

**Lunch (45 mins)**

---

### Session 3: The Vision — Where We Want To Be (12:30 - 14:15)

**Objective:** Present the target state through three progressive pillars, showing how each builds on the last and what becomes possible at each stage.

#### 3A — The Three Pillars Framework (10 mins)

Introduce the three pillars as a progression:

```
Pillar 1                    Pillar 2                    Pillar 3
FOUNDATIONAL               AI                          ACCELERATION
INFRASTRUCTURE             AUGMENTATION                WITH GEN AI
───────────────            ───────────────             ───────────────
"Get the house             "Augment our                "Transform what's
 in order"                  people"                     possible"

Enterprise Graph            Virtual Agents              Autonomous Workflows
Data Governance             Copilot Rollout             Predictive Analytics
Platform Security           Decision Support            Real-Time Compliance
Compliance Baseline         Workforce Training          Self-Healing Systems
Process Catalogue           Document Processing         Intelligent Automation

MUST HAVE                   MULTIPLIER                  TRANSFORMATION
(enables everything)        (amplifies people)          (changes the game)
```

These are not sequential phases — they overlap. But Pillar 1 **must lead** because without the data foundation and platform governance, Pillars 2 and 3 cannot deliver value safely.

#### 3B — Pillar 1: Foundational Infrastructure (30 mins)

The enabling layer that everything else depends on. Present current state → target state for each component:

**Enterprise Graph**
- Current: No graph database, ontology framework exists but disconnected from live data
- Target: Graph database deployed, schema loaded, connected to Acturis/Entra/Azure data sources
- Phase 2 (4 months): Schema design, compliance and identity data load, Acturis API scoping
- Technology: Azure Cosmos DB (Gremlin) or managed Neo4j — ADR required

**Data Governance**
- Current: No governance platform, no data classification, no lineage tracking
- Target: Microsoft Purview deployed, data catalogue populated, quality baselines established
- Phase 2: Purview deployment, initial data classification, quality baseline for graph data

**Platform Security & Compliance**
- Current: ALZ partially assessed, O365 gaps identified, no DLP audit, RCSG framework absent
- Target: Hardened Azure and M365 posture, continuous compliance monitoring, RCSG risk register operational
- Phase 2: ALZ Audit v2 execution, O365 governance hardening, RCSG risk register MVP, compliance cross-mapping (MCSB ↔ NIST ↔ ISO 27001 ↔ FCA)

**Power Platform Governance**
- Current: Ungoverned, no DLP policy audit, Dataverse readiness unknown
- Target: Governed platform with DLP policies, connector controls, and Dataverse as a managed data layer
- Phase 2: DLP audit, connector governance, Dataverse readiness assessment

**Process Catalogue**
- Current: No formal process catalogue, ~60% manual
- Target: Catalogued top 20 processes with automation feasibility scored
- Phase 2: Workshop to inventory and prioritise candidate processes

**Discussion:** Which foundational components are most urgent? What's blocking progress?

| Priority | Data Domain | Source | BSC Impact | Phase 2 Feasibility |
|----------|-------------|--------|------------|---------------------|
| 1 | Client/Policy | Acturis extract | C1, C4, F1 | Depends on API access |
| 2 | Compliance Posture | ALZ/O365 audit outputs | P3, F4 | High — data exists |
| 3 | Risk Register | RCSG governance | P3, F4 | High — ontology ready |
| 4 | Identity & Access | Entra ID/M365 | P3, L2 | High — Graph API ready |
| 5 | Process Catalogue | Manual inventory | P1, F2 | Medium — needs workshop |

#### 3C — Pillar 2: AI Augmentation (30 mins)

How AI augments people across the business — not replacing roles, amplifying them.

**Virtual Agents**
- Current: Emma (Client Onboarding), Matt (Commercial Lines), Sci/Tech (Technical Advisory) — in development
- Target: 10+ specialised agents across client services, operations, and compliance
- Phase 2: 3 agents deployed and iterating with AI governance framework
- Key: agents are only as good as the data behind them — Pillar 1 dependency

**Copilot & M365 AI**
- Current: Not deployed
- Target: Copilot adopted across M365 suite — Teams, Outlook, Word, Excel, PowerPoint
- Phase 2: Copilot rollout plan, licensing, initial adoption with power users
- Key: Copilot works best with well-governed M365 data — Pillar 1 dependency

**Decision Support**
- Current: No AI-assisted decision making
- Target: Policy comparison, risk assessment augmentation, renewals recommendations
- Phase 2: Prototype decision support for policy comparison (commercial lines)

**AI Governance**
- Current: No AI governance framework
- Target: Full AI governance aligned to UK AI Act, OWASP LLM Top 10, FCA expectations
- Phase 2: AI governance policy, risk assessment for deployed agents

**Discussion:** Where will AI augmentation have the biggest impact on our people's effectiveness? What's the training and change management need?

#### 3D — Pillar 3: Acceleration with Gen AI (25 mins)

What becomes possible when Pillars 1 and 2 compound — the transformational capabilities that change the business model.

Present as a progression showing the compound effect:

```
Phase 2 Foundation          6-12 Month Compound              18-24 Month Transformation
(Feb-May 2026)              (Jun 2026 - Feb 2027)            (Feb 2027 - Feb 2028)
─────────────────           ──────────────────────           ──────────────────────────
Enterprise Graph MVP    →   Client Intelligence Suite    →   Predictive Client Analytics
3 Virtual Agents       →   Agent Scale-Out (10+)         →   Autonomous Advisory Workflows
Compliance Automation  →   Continuous Assurance          →   Real-Time Regulatory Response
ALZ/O365 Governance    →   Full Platform Governance      →   Self-Healing Infrastructure
Acturis Data Extract   →   Unified Data Platform          →   Cross-Source AI Insights
Process Catalogue      →   15+ Processes Automated       →   70% Straight-Through Processing
                                                             60% → <=20% Manual
```

**Acceleration capabilities (12-24 months):**

| Capability | What It Means | Pillar Dependencies | BSC Impact |
|-----------|---------------|---------------------|-----------|
| Predictive Client Analytics | AI predicts retention risk, cross-sell opportunities, lifecycle events | Graph + Agents + Acturis data | C1, C4, F1 |
| Autonomous Advisory Workflows | Agents handle routine advisory end-to-end with human oversight | Agents + Decision Support + Governance | P1, F2, L1 |
| Real-Time Regulatory Response | Compliance posture updates automatically when regulations change | RCSG + Compliance Automation + Graph | P3, F4 |
| Self-Healing Infrastructure | Azure and M365 environments auto-remediate drift from policy | ALZ/O365 governance + Policy-as-Code | P3, L2 |
| 70% Straight-Through Processing | Majority of operational processes run without manual intervention | Process Automation + Graph + Agents | P1, F2, F4 |
| Warm Introductions at Scale | Graph-powered identification of client connections and introducer networks | Graph + Client Intelligence + Agents | C4, F1, P2 |

**Discussion:** Which acceleration capabilities are most exciting? Which are most realistic? Where's the boundary between ambition and overreach?

**Break (15 mins)**

---

### Session 4: The Roadmap — Getting From Here to There (14:30 - 15:30)

**Objective:** Map the three pillars against time — what's achievable in 4 months, 12 months, and 24 months — and identify constraints.

#### 4A — The Roadmap by Strategic Theme (20 mins)

Map the journey against the four cross-cutting strategic themes:

| Theme | Phase 2 (4 months) | Medium Term (12 months) | Long Term (24 months) |
|-------|--------------------|-------------------------|----------------------|
| **Data-Driven Decisions** | Graph schema, initial data load, Purview | Client intelligence, AI data queries, health check RAG | Predictive analytics, client connections, warm introductions |
| **Intelligent Automation** | Renewals, prospecting, compliance cross-mapping | Quotes auto-entry, claims analysis, email responder | Multi-portal rekeying, auto responses (80/20), chasing underwriters |
| **Workforce Augmentation** | 3 virtual agents, Copilot rollout, training programme | 5+ agents, decision support, meeting summaries | Role-playing simulations, seamless advice, autonomous workflows |
| **Compliance by Design** | RCSG risk register, AI governance policy, audit v2 | Continuous assurance, regulatory change tracking, DORA readiness | Automated audit, real-time compliance, self-service governance |

#### 4B — Phase 2 Commitments: What We Will Do (20 mins)

Agree the Phase 2 (Feb-May 2026) deliverables mapped to pillars:

**Pillar 1 — Foundational Infrastructure (Phase 2)**
- Enterprise Graph schema design and initial data load (compliance + identity data)
- Acturis data extraction scoping and API mapping
- Microsoft Purview deployment for data governance
- ALZ Audit v2 execution (live tenant assessment)
- O365 governance hardening based on audit findings
- Power Platform DLP and connector governance
- RCSG risk register MVP (machine-readable, graph-connected)
- Compliance cross-mapping automation (MCSB ↔ NIST ↔ ISO 27001 ↔ FCA)

**Pillar 2 — AI Augmentation (Phase 2)**
- 3 virtual agents deployed and iterating (Emma, Matt, Sci/Tech)
- AI governance policy (UK AI Act, OWASP LLM Top 10 assessment)
- Copilot adoption plan and initial M365 rollout
- Decision support prototype for policy comparison
- Renewals automation and Next Best Action
- Prospecting suite (introducers, mass, leads)

**Pillar 3 — Acceleration Foundations (Phase 2)**
- Client 360 view (MVP) — dependent on Acturis extraction
- MGA Risk Analysis trial
- Process catalogue and automation prioritisation workshop
- CI/CD pipeline for ontology and compliance artifacts (already in place via GitHub)

#### 4C — Constraints and Dependencies (20 mins)

Facilitated discussion on what could block or slow us:

| Constraint | Pillar Affected | Impact | Mitigation |
|------------|----------------|--------|------------|
| Acturis API access and documentation | 1, 3 | Gates Client 360 and data foundation | Early vendor engagement, parallel mock data |
| Azure environment access (production) | 1 | Gates ALZ audit v2 execution | IT ops escalation, Policy export alternative |
| Resource contention (EA vs business projects) | All | Gates all enabling works | Ring-fenced EA capacity via steering committee |
| Regulatory clarity (UK AI, DORA) | 2, 3 | Affects AI governance and compliance scope | Monitor and design for flexibility |
| Data quality (manual processes, spreadsheets) | 1, 3 | Affects graph accuracy and AI model quality | Phased data quality improvement |
| Change management and adoption | 2 | Affects Copilot and agent uptake | Training programme, champion network |

---

### Session 5: Agreement and Next Steps (15:30 - 16:30)

**Objective:** Agree commitments, confirm the EA model as the guiding framework, and commission the design assignment.

#### 5A — Summary of Agreements (15 mins)

Capture consensus on:

1. **EA Model** — four capability layers confirmed as the structuring framework?
2. **Enterprise Graph** — confirmed as foundational architecture? Technology choice direction?
3. **Three Pillars** — Foundation → Augmentation → Acceleration progression agreed?
4. **Phase 2 scope** — what's in, what's deferred? Any additions or removals?
5. **Manual process reduction** — which processes are priority candidates for the 60% → <=20% journey?
6. **Resource commitment** — EA capacity ring-fenced for enabling works?
7. **Governance** — steering committee cadence and decision rights confirmed?

#### 5B — Commissioning the Design Assignment (20 mins)

Present the 2-3 week EA Design Assignment proposal:

| Aspect | Detail |
|--------|--------|
| **Purpose** | Translate workshop agreements into an actionable programme structure |
| **Duration** | 2-3 weeks from commission date |
| **Phases** | Week 1: Discover (inputs, interviews, process catalogue) → Week 2: Design (architecture, graph spec, ADRs) → Week 3: Specify (programme, roadmap, BSC map) |
| **Deliverables** | D1: EA Architecture Design, D2: Enterprise Graph Specification, D3: Capability Roadmap, D4: Programme Design, D5: Process Automation Assessment, D6: Technology Stack ADRs (×5), D7: BSC Implementation Map |
| **Resources** | EA Lead (100%), SA (100%), PM (25%), Business/IT leads (interviews) |
| **Inputs** | Workshop outputs, audit findings, BSC framework, initiative portfolio, stakeholder interviews |
| **Success** | Architecture covers all 4 layers, graph spec is implementable, all 50+ initiatives mapped to workstreams |

See: **EA-Assignment-Proposal-v1.md** for full scope, deliverables, and approach.

#### 5C — Actions and Close (10 mins)

| # | Action | Owner | Due |
|---|--------|-------|-----|
| 1 | Circulate workshop outputs (decisions, actions, parking lot) | Workshop Lead | +2 working days |
| 2 | Confirm design assignment commission and resource allocation | Steering Committee | +5 working days |
| 3 | Initiate Acturis vendor engagement for API access | Programme Manager | +5 working days |
| 4 | Submit Azure production access requests for ALZ v2 | EA Lead | +3 working days |
| 5 | Establish RCSG governance working group | EA Lead + Compliance | +5 working days |
| 6 | Schedule process catalogue workshop (business leads) | Programme Manager | +5 working days |
| 7 | Update programme Gantt with agreed Phase 2 scope | PMO | +5 working days |

---

## Workshop Outputs

| Output | Format | Audience |
|--------|--------|----------|
| Workshop Decision Record | Markdown (committed to repo) | All participants |
| Agreed Phase 2 Scope (updated) | Update to Executive Summary | Steering Committee |
| EA Model and Three Pillars (confirmed) | Visual artefact | All |
| Enterprise Graph Architecture Decision | ADR format | EA, IT |
| Priority Process Catalogue (initial) | Table/spreadsheet | Business, EA |
| Design Assignment Commission | Signed-off proposal | EA Lead, Steering Committee |
| Parking Lot Items | Issue list | PMO for triage |

---

## Facilitation Notes

- **Format:** In-person preferred; hybrid with screen-share if required
- **Room setup:** U-shape with large display for live diagrams, ontology visualiser demo, and EA model visuals
- **Materials:** Printed BSC strategy map, printed EA model (four layers), printed audit status summary, sticky notes for prioritisation
- **Live capture:** Decisions and actions captured in markdown during the session (committed to repo same day)
- **Tone:** Collaborative, pragmatic, honest about constraints. This is a close-knit team — encourage direct challenge and debate.
- **Key visual artefacts to prepare:**
  - EA four-layer model (large format, wall-mounted)
  - Three pillars progression diagram
  - Current state vs target state gap summary
  - BSC strategy map with cause-effect chains
  - Enterprise Graph architecture diagram

---

*EA-PPM-WS-2026-001 — EA Vision & Roadmap Workshop Outline v1.1*
*Classification: Internal — Commercial in Confidence*
