# EA Design Assignment — Proposal

## Enterprise Architecture Programme Design for AI-Augmented Professional Services

| Property | Value |
|----------|-------|
| Document Title | EA Design Assignment — Proposal |
| Document Reference | EA-PPM-DA-2026-001 |
| Version | 1.0 |
| Date | 05 February 2026 |
| Status | Draft for Commission |
| Classification | Internal — Commercial in Confidence |
| Duration | 2-3 weeks from commission date |
| Prerequisite | EA Vision & Roadmap Workshop (EA-PPM-WS-2026-001) |

---

## 1. Purpose

This proposal defines a 2-3 week design assignment to produce the Enterprise Architecture specification and programme design that will underpin the AI Strategy Programme's 50+ initiatives across the next 24 months.

The assignment translates workshop agreements into an actionable programme structure — defining the business, information, AI, and technology capabilities needed to achieve the organisation's strategic objectives, with particular focus on:

- Reducing manual process from 60% to <=20% across key operations
- Establishing the Enterprise Graph as the foundational information architecture
- Mapping initiatives to a structured programme with clear dependencies and sequencing
- Leveraging the Microsoft stack while avoiding vendor lock-in on critical capabilities
- Ensuring compliance-by-design across all pillars (FCA, PRA, GDPR, DORA, UK AI Act)

---

## 2. Strategic Context

### 2.1 Programme Vision

**"AI-Augmented Professional Services Excellence"** — a 24-month transformation delivering superior client outcomes through intelligent automation, data-driven decisions, and AI-augmented advisory services.

### 2.2 Strategic Pillars

| Pillar | Investment | Primary BSC Objectives |
|--------|-----------|------------------------|
| S1: Client Excellence | 25% | C1 Retention, C2 Experience, C4 Proactive Insight |
| S2: Sales & Growth | 20% | F1 Revenue Growth, P2 Sales Pipeline |
| S3: Operational Efficiency | 15% | P1 Automation, P3 Compliance, F2 Operating Margin |
| S4: Knowledge & Advisory | 15% | L1 AI Workforce, P4 Decision Quality, C2 Experience |
| S5: Data Foundation | 25% | L2 Data Foundation (CRITICAL PATH), L3 AI Platform |
| RCSG: Governance | Cross-cutting | P3 Compliance, F4 Cost-to-Serve |

### 2.3 Current State (from Snapshot Audits)

| Domain | Maturity | Key Gaps |
|--------|----------|----------|
| Azure Infrastructure (ALZ) | Assessed (~80%) | Live tenant execution pending, MCSB compliance gaps unquantified |
| M365 Tenancy (O365) | Partially assessed (~50%) | Identity governance gaps, DLP policy gaps, Entra ID hardening |
| Power Platform (PP) | Scoped (~25%) | No DLP audit, no connector governance, Dataverse readiness unknown |
| Third-Party Apps (TP) | Scoped (~25%) | Acturis integration unmapped, vendor risk unclassified, API permissions unaudited |
| Governance (RCSG) | Foundation only (~15%) | No risk register, no compliance obligation inventory, no AI governance framework |
| Enterprise Graph | Not started | No graph database, no unified data model, ontology framework exists but disconnected from live data |
| Process Automation | Ad hoc | ~60% manual processes, no process catalogue, no automation prioritisation |

### 2.4 The Gap

The strategy (vision, pillars, BSC objectives, 50+ initiatives) is well-defined. The enabling architecture is not. Specifically:

- No Enterprise Architecture Design connecting strategy to implementation
- No unified information architecture (the Enterprise Graph)
- No structured programme design mapping initiatives to capabilities and dependencies
- No capability roadmap showing the build sequence across Business, Information, AI, and Technology layers
- No formal process catalogue to drive the 60% → <=20% manual reduction

This assignment closes that gap.

---

## 3. Scope

### 3.1 In Scope

| # | Deliverable | Description |
|---|-------------|-------------|
| D1 | Enterprise Architecture Design | Target-state architecture across 4 capability layers (Business, Information, AI, Technology) with current-state mapping and gap analysis |
| D2 | Enterprise Graph Specification | Technical specification for the graph database: technology selection, schema design, data sources, integration patterns, deployment approach |
| D3 | Capability Roadmap | Time-phased roadmap showing capability build sequence across Phase 2 (4 months), Medium Term (12 months), and Long Term (24 months) |
| D4 | Programme Design | Structured programme with workstreams, dependencies, milestones, and initiative mapping to BSC objectives |
| D5 | Process Automation Assessment | Catalogue of candidate processes for automation with prioritisation against manual reduction targets |
| D6 | Technology Stack Decisions | Architecture Decision Records (ADRs) for key technology choices including graph database, AI platform, integration layer |
| D7 | BSC Implementation Map | Detailed mapping of every initiative to BSC objectives, capabilities, dependencies, and delivery sequence |

### 3.2 Out of Scope

- Detailed solution design for individual initiatives (each initiative gets its own design)
- Procurement or vendor selection (recommendations only)
- Implementation or build work
- Organisational design or change management planning (separate workstream)
- Budget approval (this feeds the budget case)

---

## 4. Approach

### 4.1 Three Phases

```
Week 1                     Week 2                     Week 3
DISCOVER                   DESIGN                     SPECIFY
─────────────────         ─────────────────          ─────────────────
Inputs analysis            Architecture design        Programme spec
Stakeholder interviews     Graph specification         Capability roadmap
Process catalogue          Technology decisions        BSC implementation map
Gap analysis               Capability mapping          Review & sign-off
```

### 4.2 Week 1: Discover

**Objective:** Deep-dive into the current state, validate workshop agreements, catalogue processes, and identify all architectural constraints and dependencies.

| Day | Activity | Outputs |
|-----|----------|---------|
| 1 | Review all audit artifacts (ALZ, O365, PP, TP, RCSG — 33 artifacts delivered) and strategy documents. Inventory existing ontologies, compliance mappings, and technical assets. | Asset inventory, artifact gap analysis |
| 2 | Stakeholder interviews — Business leads: understand priority processes, pain points, automation candidates. Map "day in the life" for key roles. | Process pain point map, automation candidate list |
| 3 | Stakeholder interviews — IT/Technology: understand infrastructure constraints, Microsoft licensing, integration landscape, Acturis technical architecture. | Technology constraint register, integration map |
| 4 | Process catalogue build: document the top 20 manual processes with current effort, frequency, error rate, and automation feasibility. Map to F4 (-60% manual), P1 (15+ processes). | Draft process catalogue with prioritisation scores |
| 5 | Gap analysis synthesis: current state vs target state across all 4 capability layers. Identify critical missing capabilities and dependencies. | Gap analysis document, dependency map |

**Key inputs consumed:**
- EA PPM Portfolio Review Context Summary v3.1
- Wave 1 Priorities v1.0
- All audit VSOM strategy plans (ALZ, O365, PP, TP, RCSG)
- BSC Strategy Map and VSOM hierarchy
- AI Strategy Programme Portfolio (Phase 2 and Extended)
- Workshop Decision Record (from EA Vision & Roadmap Workshop)

### 4.3 Week 2: Design

**Objective:** Produce the Enterprise Architecture design, Enterprise Graph specification, and key technology decisions.

| Day | Activity | Outputs |
|-----|----------|---------|
| 1 | Enterprise Architecture — Business Capability Layer: map business capabilities to strategic pillars, identify capability gaps, define target operating model for each domain (Client, Sales, Operations, Advisory, Compliance). | Business capability model |
| 2 | Enterprise Architecture — Information Capability Layer: design the Enterprise Graph schema, define data domains (Client, Policy, Risk, Compliance, Identity, Product, Market), map data sources to graph entities, define data quality requirements. | Enterprise Graph schema design (v1), data source mapping |
| 3 | Enterprise Architecture — AI Capability Layer: define AI service catalogue (virtual agents, NLP, decision support, anomaly detection, document processing), map to Azure OpenAI / Copilot Studio / open alternatives, define AI governance integration points. | AI service catalogue, governance integration design |
| 4 | Enterprise Architecture — Technology Capability Layer: define target infrastructure (Azure, M365, Power Platform, graph database), integration architecture (API Management, Logic Apps, custom connectors), deployment and operations model. | Technology architecture, integration patterns |
| 5 | Technology Decision Records: produce ADRs for critical choices. Checkpoint with EA Lead and key stakeholders. | ADRs (see Section 5), stakeholder feedback |

**Key ADRs to produce:**

| ADR | Decision | Options Considered |
|-----|----------|-------------------|
| ADR-DA-01 | Graph Database Technology | Azure Cosmos DB (Gremlin), Azure Cosmos DB (PostgreSQL + Apache AGE), managed Neo4j on Azure, Microsoft Fabric with graph capabilities |
| ADR-DA-02 | AI Platform Architecture | Azure OpenAI only, Azure OpenAI + open-source models, multi-provider (Azure + Anthropic/Google), Copilot Studio for agents vs custom |
| ADR-DA-03 | Integration Architecture | API Management (centralized), Logic Apps + Power Automate (distributed), custom middleware, event-driven (Event Grid + Functions) |
| ADR-DA-04 | Data Governance Platform | Microsoft Purview only, Purview + custom ontology layer, third-party governance (Collibra/Atlan), graph-native governance |
| ADR-DA-05 | Compliance Automation Approach | Policy-as-code (Azure Policy + custom), continuous assessment (Defender + RCSG), hybrid (automated + manual gates) |

### 4.4 Week 3: Specify

**Objective:** Produce the programme design, capability roadmap, and BSC implementation map. Present for review and commission.

| Day | Activity | Outputs |
|-----|----------|---------|
| 1 | Programme structure design: define workstreams, map initiatives to workstreams, identify inter-workstream dependencies, define milestone gates. | Programme structure document |
| 2 | Capability roadmap: sequence capability delivery across Phase 2 / Medium Term / Long Term. Map each capability to prerequisites, BSC objectives, and manual reduction impact. | Capability roadmap (visual + table) |
| 3 | BSC Implementation Map: map every initiative (50+) to specific BSC objectives, required capabilities, dependencies, delivery workstream, and target milestone. | BSC Implementation Map (comprehensive table) |
| 4 | Process automation roadmap: sequence the top 20 processes for automation with expected manual reduction impact, technology approach, and dependencies. Quantify the path from 60% → <=20%. | Process automation roadmap with impact model |
| 5 | Final review, stakeholder presentation, and sign-off. | Final deliverable pack, presentation, commission recommendation |

---

## 5. Deliverables

### D1: Enterprise Architecture Design

A four-layer architecture document covering:

```
┌──────────────────────────────────────────────────────────────┐
│                    BUSINESS CAPABILITIES                      │
│  Client Intelligence │ Sales Enablement │ Advisory Services   │
│  Compliance Mgmt     │ Claims Processing │ Risk Assessment    │
├──────────────────────────────────────────────────────────────┤
│                   INFORMATION CAPABILITIES                    │
│  Enterprise Graph │ Data Governance │ Data Quality            │
│  Ontology Framework │ Reporting & Analytics │ Data Integration│
├──────────────────────────────────────────────────────────────┤
│                      AI CAPABILITIES                          │
│  Virtual Agents │ NLP/Document Processing │ Decision Support  │
│  Anomaly Detection │ Predictive Analytics │ AI Governance     │
├──────────────────────────────────────────────────────────────┤
│                   TECHNOLOGY CAPABILITIES                     │
│  Azure Infrastructure │ M365 Platform │ Power Platform        │
│  API/Integration Layer │ Security & Identity │ DevOps/CI-CD   │
└──────────────────────────────────────────────────────────────┘
```

Each layer includes: current state, target state, gap analysis, dependencies, and key decisions.

### D2: Enterprise Graph Specification

| Section | Content |
|---------|---------|
| Technology Selection | ADR with rationale, cost model, performance requirements |
| Schema Design | Core entities (Client, Policy, Product, Market, Risk, Compliance, Identity, Process), relationships, properties |
| Data Source Integration | Source-by-source mapping (Acturis, Entra ID, Azure Resource Graph, Power BI, manual sources) with extraction patterns |
| Ontology Alignment | How OAA v6 ontologies (ALZ, O365, PP, TP, RCSG, VSOM) map to the graph schema |
| Deployment Architecture | Azure deployment, networking, access control, backup, monitoring |
| Phase 1 Data Load | What goes in first, validation criteria, quality gates |

### D3: Capability Roadmap

Visual roadmap showing build sequence:

| Capability | Phase 2 (Feb-May) | Medium (Jun-Feb 27) | Long (Mar 27-Feb 28) |
|------------|-------------------|---------------------|----------------------|
| **Enterprise Graph** | Schema + compliance data load | Client + product data, full Acturis integration | Predictive graph, real-time updates |
| **Virtual Agents** | 3 agents (Emma, Matt, Sci/Tech) | 5+ agents, specialisation | Autonomous advisory workflows |
| **Compliance Automation** | Cross-mapping, risk register MVP | Continuous assurance, DORA readiness | Real-time regulatory response |
| **Client Intelligence** | Client 360 MVP | Query tool, health check RAG, interests | Predictive retention, warm introductions |
| **Process Automation** | Renewals, prospecting | 15+ processes, quotes, claims | 70% STP, multi-portal automation |
| **Data Governance** | Purview deployment, data quality baseline | Full governance framework, classification | Self-service governance, automated lineage |

### D4: Programme Design

Structured programme with recommended workstreams:

| Workstream | Scope | BSC Alignment | Lead |
|------------|-------|---------------|------|
| **WS-A: Data Foundation** | Enterprise Graph, data integration, Acturis extraction, Purview, data quality | L2, L3 | EA Lead |
| **WS-B: AI Platform** | Virtual agents, AI governance, Copilot, Azure OpenAI services | C2, L1, L3 | AI Lead |
| **WS-C: Client & Sales** | Client 360, prospecting, renewals, Next Best Action | C1, C4, F1, P2 | Business Lead (Client) |
| **WS-D: Operations & Compliance** | Process automation, compliance automation, RCSG governance | P1, P3, F2, F4 | Business Lead (Ops) |
| **WS-E: Platform & Security** | ALZ hardening, O365 governance, Power Platform governance, infrastructure | L2, L3, P3 | IT Lead |
| **WS-F: Enablement** | Training, change management, communications, innovation culture | L1, L4 | Programme Manager |

Each workstream includes: initiative mapping, dependencies on other workstreams, milestone alignment (M1-M4), resource requirements, and risk register.

### D5: Process Automation Assessment

| Process | Current State | Manual % | Annual Volume | Automation Approach | Target Manual % | BSC Impact | Priority |
|---------|--------------|----------|---------------|--------------------|-----------------|-----------|---------|
| *(Top 20 processes catalogued during Week 1 stakeholder interviews)* | | | | | | | |

Includes the quantified path from 60% → <=20% manual with milestone targets:
- Phase 2 (May 2026): 60% → 45% manual
- Medium Term (Feb 2027): 45% → 30% manual
- Long Term (Feb 2028): 30% → <=20% manual

### D6: Technology Stack Decisions

5 Architecture Decision Records (ADRs) as specified in Section 4.3.

### D7: BSC Implementation Map

Complete mapping of all 50+ initiatives:

| Initiative | Pillar | BSC Objective(s) | Required Capabilities | Dependencies | Workstream | Phase | Target Milestone |
|-----------|--------|-------------------|----------------------|--------------|------------|-------|-----------------|
| *(All 50+ initiatives from the portfolio)* | | | | | | | |

---

## 6. Inputs Required

| # | Input | Source | Status |
|---|-------|--------|--------|
| 1 | Workshop Decision Record | EA Vision & Roadmap Workshop | Pending workshop |
| 2 | EA PPM Context Summary v3.1 | Strategy folder | Available |
| 3 | Wave 1 Priorities v1.0 | Strategy folder | Available |
| 4 | Executive Summary | Strategy folder | Available |
| 5 | BSC Strategy Map (Mermaid) | Strategy folder | Available |
| 6 | VSOM Hierarchy (Mermaid) | Strategy folder | Available |
| 7 | VSOM Ontology (JSON-LD) | Strategy folder | Available |
| 8 | AI Strategy Portfolio (Phase 2) | PPM folder | Available |
| 9 | AI Strategy Portfolio (Extended v2.1) | PPM folder | Available |
| 10 | ALZ Audit artifacts (17) | Architecture/ALZ folder | Available |
| 11 | O365 Audit artifacts (6) | Architecture/O365 folder | Available |
| 12 | PP Audit artifacts (4) | Architecture/PP folder | Available |
| 13 | TP Audit artifacts (4) | Architecture/TP folder | Available |
| 14 | RCSG Governance artifacts (2) | Architecture/RCSG folder | Available |
| 15 | EA Audit Portfolio VSOM Structure | DOCS folder | Available |
| 16 | Feature MVP Specifications | DOCS folder | Available |
| 17 | Stakeholder time (interviews) | Business + IT leads | To be scheduled |
| 18 | Acturis technical documentation | Vendor / internal SME | To be confirmed |
| 19 | Microsoft licensing inventory | IT | To be requested |
| 20 | Current process documentation (if any) | Business leads | To be requested |

---

## 7. Success Criteria

| # | Criterion | Measure |
|---|-----------|---------|
| 1 | Architecture design covers all 4 capability layers with clear current/target/gap | Reviewed and accepted by EA Lead |
| 2 | Enterprise Graph specification is implementable (technology selected, schema designed, data sources mapped) | ADR accepted, schema validated against at least 2 data sources |
| 3 | Capability roadmap is realistic and resourced | Validated by Programme Manager against available capacity |
| 4 | Programme design maps all 50+ initiatives to workstreams with dependencies | Complete coverage confirmed against portfolio |
| 5 | Process catalogue identifies >=15 automation candidates with quantified impact | Business leads validate process descriptions and priority |
| 6 | Technology decisions are documented as ADRs with clear rationale | ADRs follow standard format, consider Microsoft + alternatives |
| 7 | BSC Implementation Map provides full traceability from initiative to strategic objective | Every initiative has BSC alignment, every BSC objective has >=1 initiative |
| 8 | Deliverables are committed to the INS-PPL-AZL repository | All artifacts in PBS/ folder structure, PR reviewed |

---

## 8. Resource Requirements

| Role | Commitment | Responsibility |
|------|-----------|----------------|
| Enterprise Architect (Lead) | 100% for 2-3 weeks | Architecture design, graph specification, ADRs, programme structure |
| Solution Architect (AI-assisted) | 100% for 2-3 weeks | Ontology alignment, graph schema, data source mapping, compliance automation design |
| Programme Manager | 25% for 2-3 weeks | Programme structure input, milestone alignment, resource validation |
| Business Lead (Client/Sales) | 2 x half-day interviews | Process pain points, automation candidates, business capability requirements |
| Business Lead (Operations) | 2 x half-day interviews | Process catalogue, compliance workflows, manual effort quantification |
| IT Lead | 2 x half-day interviews | Infrastructure constraints, Microsoft licensing, integration landscape |
| Compliance Lead | 1 x half-day interview | Regulatory requirements, compliance automation priorities, RCSG scope |

---

## 9. Risks

| # | Risk | Likelihood | Impact | Mitigation |
|---|------|-----------|--------|------------|
| 1 | Stakeholder availability for interviews in Week 1 | Medium | High | Schedule all interviews before assignment starts; have backup slots |
| 2 | Acturis technical documentation unavailable | Medium | Medium | Design graph schema with Acturis as a "plug-in" data source; don't block on vendor |
| 3 | Scope expansion during design (adjacent requirements surface) | Medium | Medium | Maintain strict scope boundary; capture additions as backlog items for future work |
| 4 | Technology decisions contested by stakeholders | Low | Medium | Present ADRs with clear options analysis; facilitate decision rather than dictate |
| 5 | Process catalogue incomplete due to tribal knowledge | Medium | Medium | Start with top 10 highest-impact processes; iterate in subsequent phases |

---

## 10. Governance

### 10.1 Reporting

| Checkpoint | Timing | Audience | Format |
|-----------|--------|----------|--------|
| Week 1 Summary | End of Week 1 | EA Lead, Programme Manager | Written summary (1-2 pages) + 30-min call |
| Week 2 Design Review | End of Week 2 | EA Lead, IT Lead, Programme Manager | Architecture walkthrough (60 mins) |
| Final Presentation | End of Week 3 | Steering Committee | Formal presentation (90 mins) + deliverable pack |

### 10.2 Decision Rights

| Decision | Authority |
|----------|-----------|
| Architecture design approval | EA Lead |
| Technology selection (ADRs) | EA Lead + IT Lead (joint) |
| Programme structure approval | Steering Committee |
| Process automation priorities | Business Leads + Programme Manager |
| Budget implications | Steering Committee |

### 10.3 Artifact Management

All deliverables committed to the INS-PPL-AZL repository:

```
PBS/
├── ARCHITECTURE/
│   ├── EA-Design/
│   │   ├── EA-Architecture-Design-v1.md          (D1)
│   │   ├── Enterprise-Graph-Specification-v1.md   (D2)
│   │   └── ADR/
│   │       ├── ADR-DA-01-Graph-Database.md         (D6)
│   │       ├── ADR-DA-02-AI-Platform.md            (D6)
│   │       ├── ADR-DA-03-Integration.md            (D6)
│   │       ├── ADR-DA-04-Data-Governance.md        (D6)
│   │       └── ADR-DA-05-Compliance-Automation.md  (D6)
│   └── ...
├── PPM- PROGRAMME/
│   ├── PPM-EA-Strategy and Portfolio/
│   │   ├── EA-Capability-Roadmap-v1.md             (D3)
│   │   ├── EA-Programme-Design-v1.md               (D4)
│   │   ├── EA-Process-Automation-Assessment-v1.md  (D5)
│   │   └── EA-BSC-Implementation-Map-v1.md         (D7)
│   └── ...
```

---

## 11. Alignment to BSC Themes and Pillars

This assignment directly serves the following BSC objectives:

| BSC Objective | How This Assignment Contributes |
|---------------|-------------------------------|
| **L2: Data Foundation** | Enterprise Graph specification — the technical foundation for 80% of initiatives |
| **L3: AI Platform** | AI capability layer design and ADR for platform architecture |
| **P1: Process Automation** | Process catalogue and automation roadmap with quantified targets |
| **P3: Compliance** | Compliance automation design integrated with RCSG governance |
| **F4: Cost-to-Serve** | Manual process reduction path (60% → <=20%) with milestone targets |
| **F2: Operating Margin** | Automation ROI model embedded in process assessment |

And is structured around the four strategic themes:

| Theme | Assignment Contribution |
|-------|------------------------|
| **Data-Driven Decisions** | Enterprise Graph as the single source of analytical truth |
| **Intelligent Automation** | Process catalogue + automation roadmap with technology choices |
| **Workforce Augmentation** | AI service catalogue defining agent and Copilot deployment patterns |
| **Compliance by Design** | RCSG integration into every capability layer, not bolted on |

---

## 12. Commission

### Approval Required

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Steering Committee Chair | | | |
| EA Lead | | | |
| Programme Manager | | | |

### Timeline

| Event | Date |
|-------|------|
| Workshop (prerequisite) | TBD |
| Assignment commission | Workshop + 5 working days |
| Week 1 complete | Commission + 5 working days |
| Week 2 complete | Commission + 10 working days |
| Final delivery | Commission + 15 working days |
| Steering Committee presentation | Commission + 17 working days |

---

*EA-PPM-DA-2026-001 — EA Design Assignment Proposal v1.0*
*Classification: Internal — Commercial in Confidence*
