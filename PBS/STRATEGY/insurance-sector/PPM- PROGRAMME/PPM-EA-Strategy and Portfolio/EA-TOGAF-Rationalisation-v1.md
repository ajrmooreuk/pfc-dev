# TOGAF Rationalisation

## Enterprise Architecture Framework: Right-Sized for a Mid-Market Insurance Broker

| Property | Value |
|----------|-------|
| Document Title | TOGAF Rationalisation |
| Document Reference | EA-PPM-TG-2026-001 |
| Version | 1.0 |
| Date | 05 February 2026 |
| Status | Draft for Review |
| Classification | Internal — Commercial in Confidence |
| Audience | Steering Committee, EA Lead, Programme Manager, Workshop Participants |

---

## 1. What is TOGAF?

TOGAF (The Open Group Architecture Framework) is the most widely adopted framework for Enterprise Architecture worldwide. First published in 1995, now at version 10 (2022), it is used by over 80% of the world's leading enterprises and is maintained by The Open Group, a vendor-neutral technology consortium.

TOGAF defines:

- **What Enterprise Architecture is** — a disciplined approach to aligning business strategy with the systems, data, and technology that deliver it
- **How to develop an Enterprise Architecture** — through the Architecture Development Method (ADM), a structured cycle of phases
- **What artefacts to produce** — a comprehensive catalogue of deliverables, artefacts, and building blocks
- **How to govern the architecture** — through governance structures, compliance reviews, and change management

### The TOGAF Definition of Enterprise Architecture

> *"A coherent whole of principles, methods, and models that are used in the design and realisation of an enterprise's organisational structure, business processes, information systems, and infrastructure."*

In plain terms: EA is the blueprint that connects what the business needs to do with how technology makes it happen. Without it, organisations deploy disconnected systems, duplicate data, accumulate technical debt, and find that their technology investments don't deliver the strategic outcomes they were intended to serve.

---

## 2. The Architecture Development Method (ADM)

The ADM is TOGAF's core — a cycle of eight phases plus a preliminary phase that governs how architecture is developed, maintained, and evolved:

```text
                          ┌─────────────────┐
                          │   Preliminary    │
                          │  (Framework &    │
                          │   Principles)    │
                          └────────┬────────┘
                                   │
                          ┌────────▼────────┐
                          │    Phase A       │
                          │  Architecture    │
                          │    Vision        │
                          └────────┬────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              │                    │                     │
     ┌────────▼────────┐ ┌────────▼────────┐  ┌────────▼────────┐
     │    Phase B       │ │    Phase C       │  │    Phase D       │
     │   Business       │ │  Information     │  │   Technology     │
     │  Architecture    │ │   Systems        │  │  Architecture    │
     │                  │ │  Architecture    │  │                  │
     └────────┬────────┘ └────────┬────────┘  └────────┬────────┘
              │                    │                     │
              └────────────────────┼────────────────────┘
                                   │
                          ┌────────▼────────┐
                          │    Phase E       │
                          │  Opportunities   │
                          │  & Solutions     │
                          └────────┬────────┘
                                   │
                          ┌────────▼────────┐
                          │    Phase F       │
                          │   Migration      │
                          │   Planning       │
                          └────────┬────────┘
                                   │
                          ┌────────▼────────┐
                          │    Phase G       │
                          │ Implementation   │
                          │  Governance      │
                          └────────┬────────┘
                                   │
                          ┌────────▼────────┐
                          │    Phase H       │
                          │  Architecture    │
                          │ Change Mgmt      │
                          └─────────────────┘
```

At its centre sits **Requirements Management** — the continuous process of identifying, storing, and feeding requirements into each phase.

### What Each Phase Covers

| Phase | Purpose | Key Question |
|-------|---------|-------------|
| **Preliminary** | Establish the architecture capability — principles, framework, tools, governance, organisation | "How will we do EA?" |
| **A: Architecture Vision** | Define the scope, stakeholders, constraints, and high-level vision for the architecture engagement | "What are we trying to achieve?" |
| **B: Business Architecture** | Define the business strategy, organisation, functions, services, and processes that the architecture must support | "What does the business need?" |
| **C: Information Systems Architecture** | Define the data architecture (what data exists, where it lives, how it flows) and the application architecture (what applications serve the business) | "What information and systems are needed?" |
| **D: Technology Architecture** | Define the technology infrastructure — hardware, software, networks, platforms — that hosts the information systems | "What technology underpins it?" |
| **E: Opportunities & Solutions** | Evaluate the options for delivering the target architecture, identify work packages, and assess build-vs-buy decisions | "How do we get there?" |
| **F: Migration Planning** | Develop the detailed implementation and migration plan, sequence work packages, and define transition architectures | "In what order do we do it?" |
| **G: Implementation Governance** | Provide architectural oversight of the implementation, ensure conformance, manage change requests | "Are we building what we designed?" |
| **H: Architecture Change Management** | Manage changes to the architecture over time — new requirements, technology shifts, business changes | "How do we keep it current?" |

---

## 3. TOGAF in Large Enterprises vs. This Organisation

### What a Typical Large Enterprise Does

In a FTSE 100 or Fortune 500 organisation, TOGAF is typically implemented as:

- A dedicated **Architecture Practice** of 10-50+ architects across domains
- A formal **Architecture Repository** with thousands of artefacts in specialised tooling (Sparx EA, Mega, LeanIX)
- Multi-month **architecture engagements** for each ADM cycle, often 6-12 months per iteration
- A heavy **governance layer** — Architecture Review Boards, formal compliance reviews, sign-off gates at every phase
- Extensive **stakeholder management** across business units, IT divisions, and third-party vendors
- Detailed **current-state documentation** of every system, interface, data flow, and business process
- Formal **reference architectures** and **building block catalogues** maintained continuously
- Separate teams for Business Architecture, Data Architecture, Application Architecture, and Technology Architecture

This is appropriate for organisations with thousands of employees, hundreds of applications, complex multi-vendor landscapes, and regulatory requirements that demand formal architectural governance.

### Why That Approach Doesn't Fit Here

INS is a mid-market professional services firm:

| Characteristic | INS Reality | Implication for EA |
|---------------|-------------|-------------------|
| **Size** | ~800 people | Small enough that one architect can understand the whole landscape |
| **Revenue** | ~£100M | Investment must be proportionate — no budget for a 20-person architecture team |
| **IT landscape** | Primarily Microsoft stack + Acturis | Fewer systems = fewer integration points = simpler architecture |
| **Team** | Close-knit, collaborative, accessible | Can work by conversation rather than formal review boards |
| **Maturity** | No existing EA practice, no architecture repository | Starting from zero — must build momentum quickly, not spend months on current-state documentation |
| **Regulatory** | FCA, PRA, GDPR, DORA, UK AI Act | Significant compliance burden but manageable scope — one regulated sector, one jurisdiction |
| **Ambition** | AI-augmented professional services, 60% → <=20% manual reduction | Transformational ambition that demands architecture — but delivered fast, not formally |
| **Decision-making** | Steering committee, EA lead, direct access to leadership | Decisions can be made in a room in an afternoon — no need for multi-week governance cycles |

The risk of applying full TOGAF to an organisation of this scale is that the framework becomes the work — months spent documenting current state, building governance structures, and producing artefacts that nobody reads, while the business waits for outcomes.

---

## 4. Our Approach: TOGAF Fast-Tracked

### The Principle

**Use TOGAF's structure and rigour without its bureaucracy.** Every ADM phase is covered. Every important artefact is produced. But the method is compressed, the governance is lean, and the tools are modern.

### How Every Phase is Covered

| TOGAF Phase | Full Enterprise Approach | INS Fast-Tracked Approach | Nothing Skipped? |
|-------------|------------------------|--------------------------|------------------|
| **Preliminary** | 3-6 month practice setup, tool procurement, principle workshops | EA Framework Summary document + ontology tooling already in place + this rationalisation | **Covered.** Principles defined, tools selected, governance agreed. Done in days not months because we're AI-augmented and the team is small. |
| **A: Vision** | Multi-week stakeholder engagement, formal vision document, architecture board approval | 1-day workshop (EA Vision & Roadmap Workshop) with live artefact production | **Covered.** Vision established, three pillars agreed, BSC alignment confirmed, Phase 2 scope committed — all in one day because the decision-makers are in the room. |
| **B: Business** | Months of business process mapping, capability modelling, organisational analysis | BSC strategy cascade (16 objectives, 5 pillars) + process catalogue (top 20 processes) + stakeholder interviews in Week 1 of design assignment | **Covered.** Business capabilities mapped through BSC objectives and strategic pillars. Process catalogue provides the operational view. Stakeholder interviews capture domain knowledge. |
| **C: Information Systems** | Extensive data modelling, application portfolio analysis, integration mapping | Enterprise Graph specification + ontology framework (23 ontologies) + data source mapping (Acturis, M365, Azure, Power Platform) | **Covered — and arguably better.** The ontology-driven approach produces a machine-readable, queryable information architecture rather than static diagrams. The Enterprise Graph is both the architecture artefact and the implementation target. |
| **D: Technology** | Detailed infrastructure assessment, technology standards, platform reference architecture | 5 snapshot audits (ALZ, O365, PP, TP, RCSG) + 5 ADRs + Microsoft stack assessment | **Covered.** Each audit workstream systematically assesses one technology domain. ADRs document key technology decisions. The audit ontologies capture findings as structured, cross-referenceable data. |
| **E: Opportunities & Solutions** | Formal options analysis, business case development, vendor evaluation | Three pillars (Foundation → Augmentation → Acceleration) + PPM epics + dependency analysis | **Covered.** The three pillars are the opportunities framework. The 14 PPM epics are the solution packages. Dependencies are mapped in the epic dependency diagram. |
| **F: Migration Planning** | Detailed transition architectures, phased migration plan, resource scheduling | Capability roadmap (4/12/24 months) + Phase 2 Gantt + programme design with workstreams | **Covered.** The capability roadmap is the migration plan. The Gantt provides the schedule. Workstreams provide the organisational structure. |
| **G: Implementation Governance** | Architecture Review Board, formal compliance gates, deviation management | Steering committee (monthly), EA lead (continuous), PR-based artefact governance, ontology compliance (OAA v6) | **Covered.** Governance is lean but real — every artefact goes through PR review, every ontology is validated against quality gates, every decision is recorded as an ADR. The steering committee provides strategic oversight. |
| **H: Change Management** | Formal architecture change request process, impact analysis, version control | Ontology versioning (JSON-LD, GitHub), graph schema evolution, continuous audit monitoring | **Covered — and more agile.** Because the architecture is encoded as machine-readable ontologies in version control, change management is built into the tooling. Every change has an audit trail. The graph evolves as data sources are connected. |

### What We Gain by Fast-Tracking

| Benefit | How |
|---------|-----|
| **Speed** | Workshop to architecture in weeks, not months. The business gets outcomes while the architecture is being built, not after. |
| **Relevance** | Architecture produced by the people who will implement it, in conversation with the people who will benefit from it. No Chinese whispers through layers of analysts. |
| **Living artefacts** | Ontologies and graph models that evolve with the organisation, not documents that gather dust. |
| **AI augmentation** | Claude generates, validates, and cross-references artefacts in real time — work that would take a team of analysts weeks is done in hours. |
| **Proportionate governance** | Decisions made by the people who have the context, with appropriate oversight, without bureaucratic gates that add latency but not value. |
| **Cost** | Lean team (EA + SA + AI tooling) rather than a large architecture practice. Investment goes into building capabilities, not maintaining an architecture bureaucracy. |

### What We Don't Compromise On

| TOGAF Principle | How We Honour It |
|-----------------|-----------------|
| **Architecture is strategy-driven** | Every artefact traces to a BSC objective. Every epic maps to a strategic pillar. The VSOM cascade ensures strategy → architecture → implementation alignment. |
| **Architecture covers all four domains** | Business, Information, AI, and Technology capability layers map directly to TOGAF's Business, Data, Application, and Technology domains. |
| **Current state is understood before target state is defined** | 5 snapshot audits (33 artefacts delivered) provide the current-state baseline. The gap analysis in the workshop is honest about what we know and what we don't. |
| **Decisions are documented and traceable** | ADRs for every key technology decision. Decision records from every workshop. Full audit trail in version control. |
| **Governance ensures conformance** | Steering committee oversight. PR-based artefact review. Ontology quality gates (OAA v6). AI governance for the agentic layer. |
| **Architecture evolves with the business** | Ontology versioning, graph evolution, and continuous compliance monitoring mean the architecture is never "done" — it grows with the organisation. |

---

## 5. Coverage Matrix: TOGAF Content Framework vs. INS Artefacts

TOGAF defines a Content Framework of artefacts across its four domains. The following matrix shows how our artefacts cover the same ground:

### Architecture Deliverables

| TOGAF Deliverable | INS Equivalent | Status |
|-------------------|---------------|--------|
| Architecture Vision | EA Vision & Roadmap (workshop output) | Workshop |
| Architecture Definition Document | EA Architecture Design (D1) — four capability layers | Design assignment |
| Architecture Requirements Specification | BSC objectives + Wave 1 Priorities + process catalogue | Available + assignment |
| Architecture Roadmap | Capability Roadmap (D3) — 4/12/24 month phases | Design assignment |
| Transition Architecture | Three Pillars progression (Foundation → Augmentation → Acceleration) | Workshop |
| Architecture Compliance Assessment | OAA v6 compliance engine + audit workstream outputs | Continuous |
| Implementation & Migration Plan | Programme Design (D4) + Phase 2 Gantt + epic dependency map | Design assignment |
| Architecture Contract | Design Assignment Commission (signed off by steering committee) | Workshop |

### Core Artefacts by Domain

| Domain | TOGAF Artefact | INS Equivalent |
|--------|---------------|---------------|
| **Business** | Business Capability Map | Four-layer capability model (Business layer) |
| | Organisation Map | Lean: EA + SA + steering committee + business/IT leads |
| | Process Flow Diagrams | Process catalogue (top 20) + Mermaid process flows |
| | Business Service Catalogue | Mapped through BSC objectives and strategic pillars |
| | Value Chain Diagram | BSC cause-effect cascade (Financial ← Customer ← Process ← L&G) |
| **Data** | Data Entity/Relationship Diagram | Enterprise Graph schema (ontology-driven) |
| | Data Dissemination Diagram | Data source mapping (Acturis, M365, Azure, PP → Graph) |
| | Data Lifecycle Diagram | Graph evolution roadmap (Phase 2 → Medium → Long term) |
| | Data Governance Framework | Microsoft Purview + ontology governance (OAA v6) |
| **Application** | Application Portfolio Catalogue | Technology landscape from audit workstreams (ALZ, O365, PP, TP) |
| | Application Communication Diagram | Integration architecture (ADR-DA-03) |
| | Application/Technology Matrix | Capability layer mapping (what tech serves what business need) |
| | Application Interaction Model | Agentic layer architecture (orchestration, context, governance) |
| **Technology** | Technology Standards | ADRs (5 key decisions) + Microsoft stack assessment |
| | Platform Decomposition Diagram | Azure, M365, Power Platform, AI platform breakdown |
| | Infrastructure Diagram | ALZ audit outputs (subscription architecture, networking, security) |
| | Technology Portfolio Catalogue | Audit artefacts across all 5 workstreams (33 artefacts) |

### Building Blocks

| TOGAF Concept | INS Implementation |
|--------------|-------------------|
| Architecture Building Blocks (ABBs) | Ontology entities — each domain concept (Client, Policy, Risk, Compliance, Process, Identity) is a formal building block with defined properties and relationships |
| Solution Building Blocks (SBBs) | Technology choices documented in ADRs — graph database, AI platform, integration architecture, data governance platform, compliance automation |

---

## 6. Maturity Model: Where INS is Today and Where This Takes Us

### Current EA Maturity (Before This Programme)

Using the TOGAF Architecture Maturity Model (aligned to ACMM — Architecture Capability Maturity Model):

| Level | Description | INS Position |
|-------|-------------|-------------|
| **0: None** | No architecture practice, no awareness of need | |
| **1: Initial** | Ad hoc architecture, reactive, no formal process | **← INS is here** |
| **2: Under Development** | Architecture process defined, basic governance, some documentation | |
| **3: Defined** | Architecture practice established, consistent process, governance operational | |
| **4: Managed** | Architecture metrics tracked, value demonstrated, continuous improvement | |
| **5: Optimised** | Architecture fully integrated into business planning, predictive, self-improving | |

INS currently sits at **Level 1 (Initial)**:
- No formal EA practice
- No architecture repository
- No governance framework for architecture decisions
- Technology decisions made ad hoc, driven by vendor relationships and immediate needs
- No unified data model — data siloed across Acturis, M365, spreadsheets
- No process catalogue — ~60% manual processes, uncharted
- AI initiatives emerging but ungoverned

### Target EA Maturity (After Phase 2: May 2026)

| Level | Target | How We Get There |
|-------|--------|-----------------|
| **2: Under Development** | **← Target for May 2026** | Framework defined (this document), ADM phases executed (workshop + assignment), governance established (steering committee + ADR process), basic documentation in place (all 12 artefacts) |

This is an honest and realistic target. Moving from Level 1 to Level 2 in 4 months is achievable with a lean, focused team and AI augmentation. It means:

- Architecture process is defined and being followed
- Key decisions are documented (ADRs)
- A governance mechanism exists (steering committee + PR-based review)
- Core artefacts are produced and maintained (ontologies, graph spec, roadmap, programme design)
- The architecture is informing implementation decisions, not just documenting them after the fact

### Medium-Term Maturity Target (12 months: Feb 2027)

| Level | Target | How We Get There |
|-------|--------|-----------------|
| **3: Defined** | **← Target for Feb 2027** | Architecture practice consistent across all workstreams, ontology governance operational (OAA v6), Enterprise Graph populated and queryable, all 5 audit workstreams at v2+, architecture informs all major technology decisions |

### Long-Term Maturity Target (24 months: Feb 2028)

| Level | Target | How We Get There |
|-------|--------|-----------------|
| **4: Managed** | **← Target for Feb 2028** | Architecture value demonstrated through BSC metrics (manual reduction measured, compliance posture scored, agent effectiveness quantified), continuous assurance operational, architecture self-updating through graph evolution and ontology versioning |

Level 5 (Optimised) is aspirational and may not be appropriate for an organisation of this scale — a Level 4 practice that consistently delivers value is more realistic and more useful than a Level 5 practice that consumes excessive overhead.

---

## 7. Why This Works for an Organisation of This Size

### The Scale Advantage

Paradoxically, INS's size is an advantage for EA, not a disadvantage:

| Factor | Large Enterprise Problem | INS Advantage |
|--------|------------------------|---------------|
| **Stakeholder access** | Months to schedule architecture review boards across business units | EA Lead has direct access to steering committee, business leads, and IT leads — decisions in a room in an afternoon |
| **Landscape complexity** | Hundreds of applications, thousands of interfaces | Primarily Microsoft stack + Acturis — manageable scope for one architect |
| **Decision latency** | Architecture decisions queue behind governance boards and budget cycles | Small steering committee can approve ADRs and commission work within days |
| **Team alignment** | Architecture practice competes with project teams for influence | Close-knit team, collaborative culture — architecture is embedded in the programme, not imposed from outside |
| **Technology homogeneity** | Multi-vendor, multi-cloud, legacy + modern hybrid | Microsoft-primary stack means fewer integration patterns, more pre-built connections, simpler architecture |
| **Data scope** | Petabytes across hundreds of data stores | Defined data sources (Acturis, M365, Azure, Power Platform, spreadsheets) — catalogueable in weeks |
| **Regulatory scope** | Multi-jurisdiction, multi-sector, complex compliance | UK-based, insurance sector — significant but bounded regulatory landscape (FCA, PRA, GDPR, DORA, UK AI Act) |

### The AI Multiplier

AI augmentation fundamentally changes the economics of EA for a mid-market organisation:

| Traditional EA Activity | Effort (Large Enterprise) | Effort (INS with AI) | What AI Does |
|------------------------|--------------------------|----------------------|-------------|
| Current-state documentation | 3-6 months, team of 5+ analysts | Weeks — audit workstreams + AI analysis | AI analyses audit outputs, generates current-state summaries, identifies gaps |
| Architecture diagram production | Days per diagram, manual in Visio/Sparx | Minutes per diagram — Mermaid generation | Claude generates Mermaid from natural language descriptions and ontology models |
| ADR production | Half-day per ADR, manual research | Hours — AI-assisted options analysis | Claude researches options, generates ADR drafts, facilitates decision |
| Process catalogue | Weeks of interviews + manual documentation | Days — AI-assisted interview analysis + process flow generation | Claude structures interview notes into process definitions, generates flow diagrams |
| Compliance cross-mapping | Weeks of manual framework comparison | Hours — automated ontology mapping | RCSG ontology encodes framework relationships; AI generates cross-mappings |
| BSC alignment checking | Manual spreadsheet exercise | Automated — AI validates coverage | Claude checks every initiative maps to BSC objectives, flags gaps |
| Architecture change impact | Days of manual analysis | Real-time — graph query + AI analysis | Graph traversal identifies impact; AI explains implications |

This is not theoretical — the audit workstreams have already demonstrated this. The ALZ audit produced 17 structured artefacts. The ontology framework has 23 ontologies with cross-references. The VSOM cascade was generated from the strategy documents. All AI-augmented, all in a fraction of the time a traditional approach would require.

### The Ontology Difference

The single most significant departure from traditional TOGAF implementation is the use of ontologies as the primary architecture artefact:

**Traditional approach:** Architecture exists in documents. Documents reference each other by name. When one document changes, others may become inconsistent. Cross-domain traceability requires manual checking.

**Ontology approach:** Architecture exists in machine-readable models. Models are connected in a graph. When one model changes, cross-references are automatically visible. Cross-domain traceability is a graph query.

For an organisation of INS's size, this means:

1. **The architecture doesn't require a team to maintain.** A single architect with AI tooling can manage 23+ ontologies because the tools do the consistency checking that a team of analysts would otherwise do manually.

2. **The architecture is immediately useful.** It's not a set of documents that inform decisions — it's a queryable model that answers questions. "Which systems does this compliance obligation affect?" is a graph query, not a meeting.

3. **The architecture grows with the organisation.** Each new data source connected to the graph, each new ontology added to the framework, makes the architecture more valuable. There is no "architecture refresh" project needed — the model is continuously current.

---

## 8. Risks and Mitigations

| Risk | Description | Mitigation |
|------|-------------|-----------|
| **Framework perceived as overhead** | Team sees TOGAF as bureaucracy rather than enabler | This document explains the fast-tracked approach. Artefacts are produced as part of delivery, not as separate work. |
| **Ontology approach unfamiliar** | Stakeholders don't understand why machine-readable models matter | Ontology visualiser demo in workshop. Concrete examples of graph queries answering real business questions. |
| **AI augmentation dependency** | Over-reliance on AI for architecture quality | AI augments, architect governs. Every AI-generated artefact is reviewed by EA Lead. ADRs require human sign-off. |
| **Maturity gap** | Level 1 → Level 2 jump requires cultural shift | Start with quick wins (audit outputs → graph, compliance cross-mapping). Demonstrate value before expanding scope. |
| **Scale creep** | Approach grows to match large-enterprise TOGAF as the programme expands | This document anchors the principle: lean, proportionate, AI-augmented. Review annually against organisation scale. |

---

## 9. Summary

| Question | Answer |
|----------|--------|
| **Is this TOGAF?** | Yes — every ADM phase is covered, every core artefact category is addressed, governance is defined, and change management is built in. |
| **Is this full TOGAF?** | No — and it shouldn't be. Full TOGAF is designed for large enterprises with dedicated architecture teams. It would be disproportionate overhead for an organisation of this scale. |
| **What's different?** | Speed (weeks not months), team size (EA + SA + AI not 20+ architects), artefact format (ontologies and graph not Visio and Word), governance (steering committee not architecture review board), and AI augmentation at every stage. |
| **What's the same?** | Strategy-driven architecture, four architectural domains, documented decisions (ADRs), governance and compliance, current-state before target-state, phased migration planning, continuous change management. |
| **Is anything missing?** | No. The coverage matrix (Section 5) shows every TOGAF deliverable and artefact has an INS equivalent. The difference is format and speed, not scope. |
| **Is it defensible?** | Yes — to a regulator (FCA, PRA), to an auditor, and to a board. The architecture is traceable from strategy (BSC) through design (ontologies, ADRs) to implementation (programme, epics). Every decision has a documented rationale. Every compliance obligation is mapped. |
| **What does maturity look like?** | Level 1 (today) → Level 2 (May 2026) → Level 3 (Feb 2027) → Level 4 (Feb 2028). Realistic, measurable, proportionate. |

TOGAF provides the rigour. The three pillars provide the narrative. The BSC provides the measurement. The ontologies provide the model. AI provides the speed. Together they give INS a fast-tracked but comprehensive Enterprise Architecture capability — right-sized for where the organisation is today, and designed to grow with it.

---

*EA-PPM-TG-2026-001 — TOGAF Rationalisation v1.0*
*Classification: Internal — Commercial in Confidence*
