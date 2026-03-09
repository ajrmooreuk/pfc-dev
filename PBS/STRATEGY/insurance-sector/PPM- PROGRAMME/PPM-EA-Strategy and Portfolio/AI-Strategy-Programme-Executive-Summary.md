# AI Strategy Programme — Executive Summary

## Business & AI Augmented IT Strategy

| Property | Value |
|----------|-------|
| Programme | AI Strategy Programme — Business & AI Augmented IT Strategy |
| Vision | AI-Augmented Professional Services Excellence |
| Horizon | 24 months (February 2026 — February 2028) |
| Phase 2 | February — May 2026 (Milestones M1-M4) |
| Strategic Pillars | 5 + RCSG Governance (cross-cutting) |
| BSC Objectives | 16 across 4 perspectives |
| Initiatives | 50+ across 12 capability domains |
| Cross-Cutting Themes | Data-Driven Decisions, Intelligent Automation, Workforce Augmentation, Compliance by Design |
| Document Reference | EA-PPM-AIS-EXEC-2026-001 |
| Classification | Internal — Commercial in Confidence |
| Date | 04 February 2026 |

---

## Key Documents

### Strategy & Portfolio

| # | Document | Description |
|---|----------|-------------|
| 1 | [EA PPM Portfolio Review & Context Summary v3.1](https://github.com/ajrmooreuk/INS-PPL-AZL/blob/main/PBS/PPM-%20PROGRAMME/PPM-EA-Strategy%20and%20Portfolio/EA_PPM_Portfolio_Review_Context_Summary_v3.docx.md) | Master strategy document defining 5 strategic pillars, 16 BSC objectives, 50+ initiatives, and 4 cross-cutting themes. Includes OKR-aligned key results with Phase 2 and 24-month targets, plus RCSG governance integration. |
| 2 | [EA Strategy Review — Wave 1 Priorities v1.0](https://github.com/ajrmooreuk/INS-PPL-AZL/blob/main/PBS/PPM-%20PROGRAMME/PPM-EA-Strategy%20and%20Portfolio/EA-Strategy-Review-Wave1-Priorities-v1.md) | Bridges AI Strategy Programme to EA audit workstreams (ALZ, O365, PP, TP, RCSG) with audit-to-BSC mapping. Defines Feb-Mar 2026 enabling works aligned to M1/M2 milestones. |
| 3 | [AI Strategy Programme Portfolio — Phase 2 (Feb-May)](https://github.com/ajrmooreuk/INS-PPL-AZL/blob/main/PBS/PPM-%20PROGRAMME/PPM-01-01-AI_Strategy_Programme_Portfolio_Feb-May_2026.docx.md) | Detailed Phase 2 delivery plan with 5 workstreams (Infrastructure, Business, Communications, Training, Governance) and 21+ live initiatives. Month-by-month deliverables gated by 4 milestones from foundation through operational capability. |
| 4 | [AI Strategy Programme Portfolio — Extended v2.1](https://github.com/ajrmooreuk/INS-PPL-AZL/blob/main/PBS/PPM-%20PROGRAMME/AI_Strategy_Programme_Portfolio_Extended_v2.docx.md) | Full 24-month initiative roadmap covering 50+ initiatives across 12 capability domains (Virtual Agents, Client Intelligence, Prospecting, etc.). Timeline-phased from near-term (<4 months) through long-term (<24 months). |

### Strategy Maps & Visualisations

| # | Document | Description |
|---|----------|-------------|
| 5 | [BSC Strategy Map (Detailed Mermaid)](https://github.com/ajrmooreuk/INS-PPL-AZL/blob/main/PBS/PPM-%20PROGRAMME/PPM-EA-Strategy%20and%20Portfolio/AI_Strategy_Programme_BSC_Strategy_Map.mermaid) | Full Balanced Scorecard strategy map showing all 16 objectives (F1-F4, C1-C4, P1-P4, L1-L4) with metrics, cause-effect chains, and RCSG governance layer. Visual representation of how Learning & Growth enables Process enables Customer enables Financial. |
| 6 | [BSC Strategy Map (Compact Mermaid)](https://github.com/ajrmooreuk/INS-PPL-AZL/blob/main/PBS/PPM-%20PROGRAMME/PPM-EA-Strategy%20and%20Portfolio/ai-strategy-bsc-map.mermaid) | Simplified BSC view showing pillar-to-objective decomposition and cross-perspective relationships. Highlights L2 (Data Foundation) as critical path and RCSG as cross-cutting governance. |
| 7 | [VSOM Hierarchy (Mermaid)](https://github.com/ajrmooreuk/INS-PPL-AZL/blob/main/PBS/PPM-%20PROGRAMME/PPM-EA-Strategy%20and%20Portfolio/ai-strategy-vsom-hierarchy.mermaid) | Four-layer VSOM cascade: Vision → Strategy (5 pillars + RCSG) → Objectives (16 BSC-OKR) → Metrics (24-month targets). Demonstrates the validation loop from metrics back to vision. |
| 8 | [VSOM Ontology (JSON-LD)](https://github.com/ajrmooreuk/INS-PPL-AZL/blob/main/PBS/PPM-%20PROGRAMME/PPM-EA-Strategy%20and%20Portfolio/ai-strategy-vsom.json) | Machine-readable strategy ontology aligned to schema.org and VSEM namespace. Encodes pillars, objectives, capabilities, and initiatives as linked data for programmatic strategy management. |
| 9 | [BSC Strategy Map (React Prototype)](https://github.com/ajrmooreuk/INS-PPL-AZL/blob/main/PBS/PPM-%20PROGRAMME/PPM-EA-Strategy%20and%20Portfolio/AI_Strategy_BSC_Map.jsx) | Interactive React component prototype of the BSC strategy map. |

### Governance & Audit

| # | Document | Description |
|---|----------|-------------|
| 10 | [RCSG Governance VSOM Strategy Plan](https://github.com/ajrmooreuk/INS-PPL-AZL/blob/main/PBS/ARCHITECTURE/RCSG-Governance-rcsg-v1/02-RCSG-Audit-Vision-Strategy-Plan-v1.md) | Cross-cutting governance framework defining 6 OKRs and 24 key results for enterprise risk, regulatory compliance, threat modelling, AI governance, and continuous assurance. Consumes outputs from ALZ, O365, PP, TP audit workstreams. |
| 11 | [RCSG Governance Ontology (JSON)](https://github.com/ajrmooreuk/INS-PPL-AZL/blob/main/PBS/ARCHITECTURE/RCSG-Governance-rcsg-v1/01-RCSG-Audit-Ontology-v1.json) | OAA v6 ontology with `rcsg:` namespace defining 10 entities (RiskRegister, ComplianceObligation, ThreatScenario, AIGovernanceControl, etc.) and their relationships for structured governance data. |
| 12 | [EA Audit Portfolio VSOM Structure](https://github.com/ajrmooreuk/INS-PPL-AZL/blob/main/PBS/DOCS/EA-Audit-Portfolio-VSOM-Structure.md) | Portfolio tracking document mapping all EA audit workstreams (ALZ, O365, PP, TP, RCSG) to epics, features, and the VE lineage chain. Operating model for ontology-driven automated assessments. |

---

## Executive VSOM — Portfolio Overview

```
VISION
  "AI-Augmented Professional Services Excellence"
  24-month transformation to deliver superior client outcomes through
  intelligent automation, data-driven decisions, and AI-augmented advisory.

STRATEGY (5 Pillars + RCSG Governance)
  S1  Client Excellence .............. 25%  → C1, C2, C4
  S2  Sales & Growth ................. 20%  → F1, P2
  S3  Operational Efficiency ......... 15%  → P1, P3, F2
  S4  Knowledge & Advisory ........... 15%  → L1, P4, C2
  S5  Data Foundation ................ 25%  → L2, L3
  RCSG Risk/Compliance/Security/Gov .. x-cut → P3, F4, L4

OBJECTIVES (16 BSC-Aligned)
  Financial    F1 Revenue Growth    F2 Operating Margin   F3 Asset Util.     F4 Cost-to-Serve
  Customer     C1 Retention         C2 Experience         C3 Response Time   C4 Proactive Insight
  Process      P1 Automation        P2 Sales Pipeline     P3 Compliance      P4 Decision Quality
  Learning     L1 AI Workforce      L2 Data Foundation*   L3 AI Platform     L4 Innovation Culture
                                       * CRITICAL PATH

METRICS (24-Month Targets)
  F1: +15% conversion, 95% renewal     C1: 90% early warning, 100% prep
  F2: -25% cost, 60% automation         C2: 5+ agents, 85% FCR
  F3: 80% adoption, 3:1 ROI             C3: -50% quote time, <4hr query
  F4: -50% errors, -60% manual          C4: 12/yr insights, 40% acted
  P1: 15+ processes, 70% STP            L1: 100% trained, 80% proficient
  P2: +25% conversion, +30% velocity    L2: 100% clients, 95% quality
  P3: 90% automated, -70% prep          L3: 20+ models, 99.5% uptime
  P4: 50% AI-assisted, +20% accuracy    L4: 100+ ideas, 20 experiments
```

---

## Outline Programme / Roadmap

```
2026                                           2027                    2028
Feb    Mar    Apr    May    Jun────────Dec     Jan────────Dec          Jan─Feb
 M1     M2     M3     M4
 ├──────Phase 2 Delivery──────┤
 │                             ├────Medium Term (<12m)─────┤
 │                                                         ├──Long Term──┤
```

### Phase 2: Feb-May 2026 (21+ initiatives)

| Workstream | Feb (M1) | Mar (M2) | Apr (M3) | May (M4) |
|------------|----------|----------|----------|----------|
| **WS1 Infrastructure** | Arch Design, Infra Plan | Client View, Sector View, Graph DB, Acturis, Unstructured Data | Product View, Markets View, Purview, App Exposure | API Filter (Perudio) |
| **WS2 Business** | Virtual Emma, Matt, Sci/Tech, MGA Risk Trial | Client View, Next Best Action, Prospecting (Introducers, Mass, Leads), Meeting Summaries | Policy Comparisons, AI Phone Scheduler | Email Mgmt, Outreach, Data Room (planning) |
| **WS3 Communications** | Campaign launch | Colleague showcase | Stakeholder engagement | Benefits comms |
| **WS4 Training** | Architect, Trainer, Infra resource selected; Training schedule; Drop-in clinics | Ongoing training delivery | Ongoing training delivery | Ongoing training delivery |
| **WS5 Governance** | Finance workshop, Budget approval, Benefits tracking, Steering group | Benefits monitoring | Benefits monitoring | Benefits report, Plan next phase |

### Medium Term: By Feb 2027 (20+ initiatives)

| Domain | Initiatives |
|--------|-------------|
| Client Intelligence | Query Tool, AI Data Queries, Client Interests, Health Check (RAG) |
| Sales Enablement | Campaigns, Sectors, Sourcing, Personalised Content, Preparation |
| Communications | Email Responder/Summariser, AI Phone Scheduler |
| Quotes & Claims | Auto-entry, Claims History, Claims Analysis |
| Compliance | Automated Compliance Checks |
| Reporting | Bordereaux Reporting |
| Analysis | Data Room Analysis |

### Long Term: By Feb 2028 (12+ initiatives)

| Domain | Initiatives |
|--------|-------------|
| Advanced Analytics | Client Connections (network), Warm Introductions |
| Automation at Scale | Auto Responses (80/20), Multi-portal Rekeying, Chasing Underwriters |
| Strategic | Business Plan Creation, Market Presentations |
| Innovation | Role Playing simulations, Monthly Audit automation, Seamless Advice |

### EA Audit Workstream Status (Enabling)

| Workstream | Status | BSC Impact |
|------------|--------|------------|
| ALZ Audit v1 | ~80% complete | L2, L3, P3 |
| O365 Audit | ~50% complete | P3, C1 |
| PP Audit | ~25% (docs only) | P1, P3 |
| TP Audit | ~25% (docs only) | P3 |
| RCSG Governance | ~15% (foundation) | P3, F4 |

---

## Programme Summary

| Metric | Value |
|--------|-------|
| Strategic Pillars | 5 + RCSG governance |
| BSC Objectives | 16 (4 per perspective) |
| Total Initiatives | 50+ across 12 capability domains |
| Phase 2 Initiatives | 21+ live delivery |
| Core AI Capabilities | 6 platform services |
| EA Audit Workstreams | 5 (ALZ, O365, PP, TP, RCSG) |
| Milestones (Phase 2) | M1 Feb, M2 Mar, M3 Apr, M4 May |
| Programme Horizon | 24 months (Feb 2026 — Feb 2028) |

---

## Appendix A: EA Audit Packages

Detailed architecture packages for each platform audit workstream.

### A.1 ALZ — Azure Landing Zone Audit (alz-ss-v1)

The most mature audit package (17 artifacts, ~80% complete). Covers Azure infrastructure governance, security posture, and compliance against MCSB, NIST, ISO 27001, and insurance-sector regulations.

| # | Artifact | Link |
|---|----------|------|
| 01 | README & Package Index | [01-ALZ-SS-Audit-README-v1.md](https://github.com/ajrmooreuk/INS-PPL-AZL/blob/main/PBS/ARCHITECTURE/ALZ-Audit-Snapshot-alz-ss-v1/01-ALZ-SS-Audit-README-v1.md) |
| 02 | Vision, Strategy & Plan (VSOM/OKR) | [02-ALZ-SS-Audit-Vision-Strategy-Plan-v1.md](https://github.com/ajrmooreuk/INS-PPL-AZL/blob/main/PBS/ARCHITECTURE/ALZ-Audit-Snapshot-alz-ss-v1/02-ALZ-SS-Audit-Vision-Strategy-Plan-v1.md) |
| 03 | Operating & Deployment Guide | [03-ALZ-SS-Audit-Operating-Deployment-Guide-v1.md](https://github.com/ajrmooreuk/INS-PPL-AZL/blob/main/PBS/ARCHITECTURE/ALZ-Audit-Snapshot-alz-ss-v1/03-ALZ-SS-Audit-Operating-Deployment-Guide-v1.md) |
| 05 | KQL Queries | [05-ALZ-SS-Audit-KQL-Queries-v1.json](https://github.com/ajrmooreuk/INS-PPL-AZL/blob/main/PBS/ARCHITECTURE/ALZ-Audit-Snapshot-alz-ss-v1/05-ALZ-SS-Audit-KQL-Queries-v1.json) |
| 06 | Compliance Mapping | [06-ALZ-SS-Audit-Compliance-Mapping-v1.json](https://github.com/ajrmooreuk/INS-PPL-AZL/blob/main/PBS/ARCHITECTURE/ALZ-Audit-Snapshot-alz-ss-v1/06-ALZ-SS-Audit-Compliance-Mapping-v1.json) |
| 07 | OAA Ontology (JSON-LD) | [07-ALZ-SS-Audit-OAA-Ontology-v1.json](https://github.com/ajrmooreuk/INS-PPL-AZL/blob/main/PBS/ARCHITECTURE/ALZ-Audit-Snapshot-alz-ss-v1/07-ALZ-SS-Audit-OAA-Ontology-v1.json) |
| 08 | OAA Visual Guide | [08-ALZ-SS-Audit-OAA-Visual-Guide-v1.md](https://github.com/ajrmooreuk/INS-PPL-AZL/blob/main/PBS/ARCHITECTURE/ALZ-Audit-Snapshot-alz-ss-v1/08-ALZ-SS-Audit-OAA-Visual-Guide-v1.md) |
| 09 | OAA Glossary | [09-ALZ-SS-Audit-OAA-Glossary-v1.json](https://github.com/ajrmooreuk/INS-PPL-AZL/blob/main/PBS/ARCHITECTURE/ALZ-Audit-Snapshot-alz-ss-v1/09-ALZ-SS-Audit-OAA-Glossary-v1.json) |
| 09+ | OAA Glossary (v6 upgraded) | [09-ALZ-SS-Audit-OAA-Glossary-v1-oaa-v6-upgraded.json](https://github.com/ajrmooreuk/INS-PPL-AZL/blob/main/PBS/ARCHITECTURE/ALZ-Audit-Snapshot-alz-ss-v1/09-ALZ-SS-Audit-OAA-Glossary-v1-oaa-v6-upgraded.json) |
| 10 | OAA Test Data | [10-ALZ-SS-Audit-OAA-TestData-v1.json](https://github.com/ajrmooreuk/INS-PPL-AZL/blob/main/PBS/ARCHITECTURE/ALZ-Audit-Snapshot-alz-ss-v1/10-ALZ-SS-Audit-OAA-TestData-v1.json) |
| 16 | Architecture HLD | [16-ALZ-SS-Audit-Architecture-HLD-v1.md](https://github.com/ajrmooreuk/INS-PPL-AZL/blob/main/PBS/ARCHITECTURE/ALZ-Audit-Snapshot-alz-ss-v1/16-ALZ-SS-Audit-Architecture-HLD-v1.md) |
| 17 | OAA Ontology Readable | [17-ALZ-SS-Audit-OAA-Ontology-Readable-v1.md](https://github.com/ajrmooreuk/INS-PPL-AZL/blob/main/PBS/ARCHITECTURE/ALZ-Audit-Snapshot-alz-ss-v1/17-ALZ-SS-Audit-OAA-Ontology-Readable-v1.md) |
| 18 | Executive Summary (Test) | [18-ALZ-SS-Audit-Executive-Summary-v1.md](https://github.com/ajrmooreuk/INS-PPL-AZL/blob/main/PBS/ARCHITECTURE/ALZ-Audit-Snapshot-alz-ss-v1/ALZ-Test-Example-Results/18-ALZ-SS-Audit-Executive-Summary-v1.md) |
| 19 | Analysis Report (Test) | [19-ALZ-SS-Audit-Analysis-Report-v1.md](https://github.com/ajrmooreuk/INS-PPL-AZL/blob/main/PBS/ARCHITECTURE/ALZ-Audit-Snapshot-alz-ss-v1/ALZ-Test-Example-Results/19-ALZ-SS-Audit-Analysis-Report-v1.md) |
| 20 | Analysis Data (Test) | [20-ALZ-SS-Audit-Analysis-Data-v1.json](https://github.com/ajrmooreuk/INS-PPL-AZL/blob/main/PBS/ARCHITECTURE/ALZ-Audit-Snapshot-alz-ss-v1/ALZ-Test-Example-Results/20-ALZ-SS-Audit-Analysis-Data-v1.json) |
| 21 | Mermaid Diagrams (Test) | [21-ALZ-SS-Audit-Mermaid-Diagrams-v1.md](https://github.com/ajrmooreuk/INS-PPL-AZL/blob/main/PBS/ARCHITECTURE/ALZ-Audit-Snapshot-alz-ss-v1/ALZ-Test-Example-Results/21-ALZ-SS-Audit-Mermaid-Diagrams-v1.md) |

### A.2 O365 — Microsoft 365 Tenancy Audit (o365-ss-v1)

Tenancy-level security and compliance audit for Microsoft 365 services. Covers Entra ID, Exchange Online, SharePoint, Teams, and Defender configuration against MCSB and insurance regulations.

| # | Artifact | Link |
|---|----------|------|
| 01 | README & Package Index | [01-O365-SS-Audit-README-v1.md](https://github.com/ajrmooreuk/INS-PPL-AZL/blob/main/PBS/ARCHITECTURE/O365-Tenancy-Snapshot-o365-ss-v1/01-O365-SS-Audit-README-v1.md) |
| 02 | Vision, Strategy & Plan (VSOM/OKR) | [02-O365-SS-Audit-Vision-Strategy-Plan-v1.md](https://github.com/ajrmooreuk/INS-PPL-AZL/blob/main/PBS/ARCHITECTURE/O365-Tenancy-Snapshot-o365-ss-v1/02-O365-SS-Audit-Vision-Strategy-Plan-v1.md) |
| 03 | Operating & Deployment Guide | [03-O365-SS-Audit-Operating-Deployment-Guide-v1.md](https://github.com/ajrmooreuk/INS-PPL-AZL/blob/main/PBS/ARCHITECTURE/O365-Tenancy-Snapshot-o365-ss-v1/03-O365-SS-Audit-Operating-Deployment-Guide-v1.md) |
| 04 | Graph API Queries | [04-O365-SS-Audit-Graph-API-Queries-v1.json](https://github.com/ajrmooreuk/INS-PPL-AZL/blob/main/PBS/ARCHITECTURE/O365-Tenancy-Snapshot-o365-ss-v1/04-O365-SS-Audit-Graph-API-Queries-v1.json) |
| 05 | Compliance Mapping | [05-O365-SS-Audit-Compliance-Mapping-v1.json](https://github.com/ajrmooreuk/INS-PPL-AZL/blob/main/PBS/ARCHITECTURE/O365-Tenancy-Snapshot-o365-ss-v1/05-O365-SS-Audit-Compliance-Mapping-v1.json) |
| 06 | Client Questions | [06-O365-SS-Audit-Client-Questions-v1.md](https://github.com/ajrmooreuk/INS-PPL-AZL/blob/main/PBS/ARCHITECTURE/O365-Tenancy-Snapshot-o365-ss-v1/06-O365-SS-Audit-Client-Questions-v1.md) |

### A.3 PP — Power Platform & Data Layer Audit (pp-ds-v1)

Power Platform governance and data architecture assessment covering Power Apps, Power Automate, Power BI, and Dataverse. Evaluates DLP policies, connector governance, and data classification.

| # | Artifact | Link |
|---|----------|------|
| 01 | README & Package Index | [01-PP-DS-Audit-README-v1.md](https://github.com/ajrmooreuk/INS-PPL-AZL/blob/main/PBS/ARCHITECTURE/PP-Data-Snapshot-pp-ds-v1/01-PP-DS-Audit-README-v1.md) |
| 02 | Vision, Strategy & Plan (VSOM/OKR) | [02-PP-DS-Audit-Vision-Strategy-Plan-v1.md](https://github.com/ajrmooreuk/INS-PPL-AZL/blob/main/PBS/ARCHITECTURE/PP-Data-Snapshot-pp-ds-v1/02-PP-DS-Audit-Vision-Strategy-Plan-v1.md) |
| 03 | Operating & Deployment Guide | [03-PP-DS-Audit-Operating-Deployment-Guide-v1.md](https://github.com/ajrmooreuk/INS-PPL-AZL/blob/main/PBS/ARCHITECTURE/PP-Data-Snapshot-pp-ds-v1/03-PP-DS-Audit-Operating-Deployment-Guide-v1.md) |
| 06 | Client Questions | [06-PP-DS-Audit-Client-Questions-v1.md](https://github.com/ajrmooreuk/INS-PPL-AZL/blob/main/PBS/ARCHITECTURE/PP-Data-Snapshot-pp-ds-v1/06-PP-DS-Audit-Client-Questions-v1.md) |

### A.4 TP — Third-Party Application Audit (tp-as-v1)

Third-party application risk assessment covering SaaS integrations, OAuth consent grants, API permissions, and vendor governance against PRA SS1/21 third-party risk requirements.

| # | Artifact | Link |
|---|----------|------|
| 01 | README & Package Index | [01-TP-AS-Audit-README-v1.md](https://github.com/ajrmooreuk/INS-PPL-AZL/blob/main/PBS/ARCHITECTURE/TP-App-Snapshot-tp-as-v1/01-TP-AS-Audit-README-v1.md) |
| 02 | Vision, Strategy & Plan (VSOM/OKR) | [02-TP-AS-Audit-Vision-Strategy-Plan-v1.md](https://github.com/ajrmooreuk/INS-PPL-AZL/blob/main/PBS/ARCHITECTURE/TP-App-Snapshot-tp-as-v1/02-TP-AS-Audit-Vision-Strategy-Plan-v1.md) |
| 03 | Operating & Deployment Guide | [03-TP-AS-Audit-Operating-Deployment-Guide-v1.md](https://github.com/ajrmooreuk/INS-PPL-AZL/blob/main/PBS/ARCHITECTURE/TP-App-Snapshot-tp-as-v1/03-TP-AS-Audit-Operating-Deployment-Guide-v1.md) |
| 06 | Client Questions | [06-TP-AS-Audit-Client-Questions-v1.md](https://github.com/ajrmooreuk/INS-PPL-AZL/blob/main/PBS/ARCHITECTURE/TP-App-Snapshot-tp-as-v1/06-TP-AS-Audit-Client-Questions-v1.md) |

### A.5 RCSG — Risk, Compliance, Security & Governance (rcsg-v1)

Cross-cutting governance layer aggregating findings from all platform audits. Provides enterprise risk register, regulatory compliance automation, threat modelling, AI governance, and continuous assurance.

| # | Artifact | Link |
|---|----------|------|
| 01 | RCSG Ontology (OAA v6 JSON-LD) | [01-RCSG-Audit-Ontology-v1.json](https://github.com/ajrmooreuk/INS-PPL-AZL/blob/main/PBS/ARCHITECTURE/RCSG-Governance-rcsg-v1/01-RCSG-Audit-Ontology-v1.json) |
| 02 | RCSG Vision, Strategy & Plan (VSOM/OKR) | [02-RCSG-Audit-Vision-Strategy-Plan-v1.md](https://github.com/ajrmooreuk/INS-PPL-AZL/blob/main/PBS/ARCHITECTURE/RCSG-Governance-rcsg-v1/02-RCSG-Audit-Vision-Strategy-Plan-v1.md) |

---

## Appendix B: Portfolio & Programme Management

Documents governing programme delivery, portfolio tracking, and feature specifications.

| Document | Description | Link |
|----------|-------------|------|
| EA Audit Portfolio VSOM Structure | Portfolio tracking: epics, features, VE lineage chain across all audit workstreams | [EA-Audit-Portfolio-VSOM-Structure.md](https://github.com/ajrmooreuk/INS-PPL-AZL/blob/main/PBS/DOCS/EA-Audit-Portfolio-VSOM-Structure.md) |
| Feature MVP Specifications | Minimum viable product definitions for audit features | [Feature-MVP-Specifications.md](https://github.com/ajrmooreuk/INS-PPL-AZL/blob/main/PBS/DOCS/Feature-MVP-Specifications.md) |
| PPM Programme Directory | Programme-level document index | [PPM Programme readme](https://github.com/ajrmooreuk/INS-PPL-AZL/blob/main/PBS/PPM-%20PROGRAMME/readme.md) |
| PPM-EA-Strategy Directory Index | Strategy and portfolio document index with version tracking | [PPM-EA-Strategy readme](https://github.com/ajrmooreuk/INS-PPL-AZL/blob/main/PBS/PPM-%20PROGRAMME/PPM-EA-Strategy%20and%20Portfolio/readme.md) |
| Architecture Packages Index | All audit package versions and status | [Architecture README](https://github.com/ajrmooreuk/INS-PPL-AZL/blob/main/PBS/ARCHITECTURE/README.md) |

---

## Appendix C: Reference Architecture & Supporting Documents

| Document | Description | Link |
|----------|-------------|------|
| ALZ Audit v2 (Draft) | Next-generation ALZ audit scope and approach | [ALZ-SS-Audit-v2 readme](https://github.com/ajrmooreuk/INS-PPL-AZL/blob/main/PBS/ARCHITECTURE/ALZ-SS-Audit-v2/readme.md) |
| EA Audit Methodology | Enterprise architecture audit methodology | [EA-Audit readme](https://github.com/ajrmooreuk/INS-PPL-AZL/blob/main/PBS/ARCHITECTURE/EA-Audit/readme.md) |
| EA Data Architecture | Data architecture patterns and standards | [EA-Data readme](https://github.com/ajrmooreuk/INS-PPL-AZL/blob/main/PBS/ARCHITECTURE/EA-Data/readme.md) |
| EA Strategy | Enterprise strategy reference | [EA-Strategy readme](https://github.com/ajrmooreuk/INS-PPL-AZL/blob/main/PBS/ARCHITECTURE/EA-Strategy/readme.md) |
| UK Insurance Regulatory Requirements | Insurance sector Azure regulatory mapping | [UK-Insurance-Azure-Regulatory-Requirements.md](https://github.com/ajrmooreuk/INS-PPL-AZL/blob/main/Paul/UK-Insurance-Azure-Regulatory-Requirements.md) |
| Ontology Definitions | ALZ-specific ontology definitions | [Ontologies README](https://github.com/ajrmooreuk/INS-PPL-AZL/blob/main/PBS/ONTOLOGIES/README.md) |
| Analysis Tools | Analysis tools and utilities | [Tools README](https://github.com/ajrmooreuk/INS-PPL-AZL/blob/main/PBS/TOOLS/README.md) |
| AI Agent Configurations | AI agent configurations | [Agents README](https://github.com/ajrmooreuk/INS-PPL-AZL/blob/main/PBS/AGENTS/README.md) |

---

## Appendix D: Repository & Workflow

| Resource | Description | Link |
|----------|-------------|------|
| Repository Root | INS-PPL-AZL main repository | [GitHub Repository](https://github.com/ajrmooreuk/INS-PPL-AZL) |
| Repository README | Project overview and getting started | [README.md](https://github.com/ajrmooreuk/INS-PPL-AZL/blob/main/README.md) |
| Contributing Guide | Contribution standards and workflow | [CONTRIBUTING.md](https://github.com/ajrmooreuk/INS-PPL-AZL/blob/main/std-docs/CONTRIBUTING.md) |
| Workflow Guide | Git workflow and branching strategy | [WORKFLOW-GUIDE.md](https://github.com/ajrmooreuk/INS-PPL-AZL/blob/main/std-docs/WORKFLOW-GUIDE.md) |
| PR Template | Pull request template | [pull_request_template.md](https://github.com/ajrmooreuk/INS-PPL-AZL/blob/main/.github/pull_request_template.md) |
| Open Issues | All open issues and feature tracking | [GitHub Issues](https://github.com/ajrmooreuk/INS-PPL-AZL/issues) |

### Related Repositories

| Repository | Description | Link |
|------------|-------------|------|
| Azlan-EA-AAA | Enterprise Architecture Ontology Framework | [GitHub](https://github.com/ajrmooreuk/Azlan-EA-AAA) |
| PF-Core-BAIV | Platform Foundation Core (reference implementation) | [GitHub](https://github.com/ajrmooreuk/PF-Core-BAIV) |

---

## Appendix E: Compliance & Regulatory Frameworks

| Framework | ID | Status | Scope |
|-----------|----|--------|-------|
| MCSB v2 | MCSB-v2 | Primary | Azure cloud security controls |
| NIST 800-53 R5 | NIST-800-53-R5 | Active | Federal security and privacy controls |
| ISO 27001:2022 | ISO-27001-2022 | Active | Information security management |
| UK NCSC | NCSC-14 | Reference | National cyber security centre guidance |
| MITRE ATT&CK | ATT&CK | Reference | Threat intelligence framework |
| STRIDE/DREAD | STRIDE | Active | Threat modelling methodology |
| OWASP LLM Top 10 | OWASP-LLM | Active | AI/LLM security risks |

### Insurance Sector Regulations

| Body | Regulation | Focus | Relevance |
|------|------------|-------|-----------|
| FCA | SYSC 13.9 | Operational Resilience | Core regulatory obligation |
| PRA | SS1/21 | Third Party Risk | Vendor and outsourcing governance |
| ICO | GDPR Art.32 | Data Protection | Data processing and privacy |
| Lloyd's | MS13 | Cyber Security | Market participant requirements |
| EU | DORA | Digital Operational Resilience | ICT risk management (Jan 2027) |
| UK | AI Regulation | AI Safety | Virtual agent compliance |
| EU | AI Act | AI Risk Classification | AI initiative governance |

---

## Appendix F: Feature & Issue Status (as at 04 Feb 2026)

70 open issues, 1 closed. Status assessed against artifacts delivered to `main`.

### Summary

| Status | Count | % |
|--------|-------|---|
| Done | 4 | 6% |
| In Flight (partial artifacts delivered) | 16 | 23% |
| Not Started | 51 | 71% |

### ALZ Audit Package (alz-ss-v1) — 26 artifacts delivered

| # | Issue | Status | Evidence |
|---|-------|--------|----------|
| [#1](https://github.com/ajrmooreuk/INS-PPL-AZL/issues/1) | Planning Snapshot Audit | In Flight | README, VSOM, Operating Guide delivered; audit not executed |
| [#2](https://github.com/ajrmooreuk/INS-PPL-AZL/issues/2) | ALZ Plans and tools | In Flight | Plans (01-03), scripts (11-15) delivered; no live execution |
| [#5](https://github.com/ajrmooreuk/INS-PPL-AZL/issues/5) | ALZ Core Capabilities | In Flight | KQL queries, compliance mapping, ontology, HLD delivered; missing live run |
| [#8](https://github.com/ajrmooreuk/INS-PPL-AZL/issues/8) | Ontology Integration & Project Governance | In Flight | OAA ontology (#07), glossary (#09/v6), visual guide (#08), readable (#17) delivered |
| [#11](https://github.com/ajrmooreuk/INS-PPL-AZL/issues/11) | Architecture Quality Assessment | In Flight | HLD (#16), test example results (18-21) delivered |
| [#19](https://github.com/ajrmooreuk/INS-PPL-AZL/issues/19) | AZALZ Ontology Development | Done | OAA ontology v1.2.0, glossary v6 upgrade delivered |
| [#21](https://github.com/ajrmooreuk/INS-PPL-AZL/issues/21) | Execute full tenant discovery | Not Started | Scripts exist but no live tenant output |
| [#22](https://github.com/ajrmooreuk/INS-PPL-AZL/issues/22) | Generate MCSB v2 compliance | Not Started | Compliance mapping template exists; no live Defender assessment |
| [#23](https://github.com/ajrmooreuk/INS-PPL-AZL/issues/23) | Map ALZ findings to VSOM | Not Started | VSOM hierarchy exists but no formal findings-to-objectives mapping |
| [#24](https://github.com/ajrmooreuk/INS-PPL-AZL/issues/24) | Create Epics from VP problems | Not Started | No VP-to-Epic artifacts |
| [#25](https://github.com/ajrmooreuk/INS-PPL-AZL/issues/25) | Define 8 AZALZ Design Area entities | Not Started | No design area maturity entities |
| [#26](https://github.com/ajrmooreuk/INS-PPL-AZL/issues/26) | ALZ Compliance Ontology v1.2.0 | Done | Closed — ontology delivered and registered |
| [#27](https://github.com/ajrmooreuk/INS-PPL-AZL/issues/27) | ALZ Test Data v1.1.0 | In Flight | Test data (#10) exists; not formally registered |
| [#53](https://github.com/ajrmooreuk/INS-PPL-AZL/issues/53) | ALZ Compliance Extensions | Not Started | No GDPR/AI Act compliance extension artifacts |
| [#60](https://github.com/ajrmooreuk/INS-PPL-AZL/issues/60) | Audit Revisions v2 | Not Started | ALZ-SS-Audit-v2/ has readme only (scope stub) |

### O365 Audit Package (o365-ss-v1) — 6 artifacts delivered

| # | Issue | Status | Evidence |
|---|-------|--------|----------|
| [#42](https://github.com/ajrmooreuk/INS-PPL-AZL/issues/42) | O365 Tenancy Snapshot Audit (Feature) | In Flight | 6 artifacts (README, VSOM, Operating Guide, Graph API queries, compliance mapping, client questions) |
| [#44](https://github.com/ajrmooreuk/INS-PPL-AZL/issues/44) | O365 Tenancy Snapshot Audit Capability (Epic) | In Flight | Framework delivered; Graph API queries not executed against live tenant |

### PP Audit Package (pp-ds-v1) — 4 artifacts delivered

| # | Issue | Status | Evidence |
|---|-------|--------|----------|
| [#43](https://github.com/ajrmooreuk/INS-PPL-AZL/issues/43) | Power Platform Snapshot Audit (Feature) | In Flight | 4 artifacts (README, VSOM, Operating Guide, client questions); no queries or compliance mapping |
| [#45](https://github.com/ajrmooreuk/INS-PPL-AZL/issues/45) | Power Platform Snapshot Audit Capability (Epic) | In Flight | Docs framework only; missing query set and compliance mapping |

### TP Audit Package (tp-as-v1) — 4 artifacts delivered

| # | Issue | Status | Evidence |
|---|-------|--------|----------|
| [#61](https://github.com/ajrmooreuk/INS-PPL-AZL/issues/61) | Third-Party App Audit (Feature) | In Flight | 4 artifacts (README, VSOM, Operating Guide, client questions); no Graph API queries or compliance mapping |
| [#62](https://github.com/ajrmooreuk/INS-PPL-AZL/issues/62) | Third-Party Application Audit Capability (Epic) | In Flight | Docs framework only; missing query set (#04) and compliance mapping (#05) |

### RCSG Governance (rcsg-v1) — 2 artifacts delivered

| # | Issue | Status | Evidence |
|---|-------|--------|----------|
| [#64](https://github.com/ajrmooreuk/INS-PPL-AZL/issues/64) | RCSG Governance Capability (Epic) | In Flight | VSOM strategy plan + ontology delivered; 6 features not started |
| [#65](https://github.com/ajrmooreuk/INS-PPL-AZL/issues/65) | Enterprise Risk Register (F25) | Not Started | Ontology schema exists; no register implementation |
| [#66](https://github.com/ajrmooreuk/INS-PPL-AZL/issues/66) | Regulatory Compliance Automation (F26) | Not Started | No compliance automation artifacts |
| [#67](https://github.com/ajrmooreuk/INS-PPL-AZL/issues/67) | Threat Modelling Integration (F27) | Not Started | No threat model artifacts |
| [#68](https://github.com/ajrmooreuk/INS-PPL-AZL/issues/68) | AI Governance Framework (F28) | Not Started | No AI governance assessment artifacts |
| [#69](https://github.com/ajrmooreuk/INS-PPL-AZL/issues/69) | Continuous Assurance Model (F29) | Not Started | No assurance model artifacts |
| [#70](https://github.com/ajrmooreuk/INS-PPL-AZL/issues/70) | Governance Operating Model (F30) | Not Started | No governance operating model artifacts |

### Strategy & VSOM (EA S.1.02)

| # | Issue | Status | Evidence |
|---|-------|--------|----------|
| [#6](https://github.com/ajrmooreuk/INS-PPL-AZL/issues/6) | Strategic Integration — VSOM to OKR | In Flight | VSOM hierarchy, BSC strategy maps, OKR tables in Context Summary v3.1 |
| [#13](https://github.com/ajrmooreuk/INS-PPL-AZL/issues/13) | VSOM Framework Integration | Done | VSOM hierarchy mermaid, VSOM JSON-LD ontology, BSC maps all delivered |
| [#14](https://github.com/ajrmooreuk/INS-PPL-AZL/issues/14) | OKR-Driven Prioritization | In Flight | OKRs defined in Context Summary; no prioritization tooling |
| [#15](https://github.com/ajrmooreuk/INS-PPL-AZL/issues/15) | Value Proposition Development | Not Started | No VP artifacts |
| [#17](https://github.com/ajrmooreuk/INS-PPL-AZL/issues/17) | Product-Market Fit Validation | Not Started | No PMF artifacts |
| [#20](https://github.com/ajrmooreuk/INS-PPL-AZL/issues/20) | KPI Framework Implementation | In Flight | Metrics defined in BSC maps; no tracking/dashboard implementation |

### PPM Portfolio & Programme (PPM P 1.01)

| # | Issue | Status | Evidence |
|---|-------|--------|----------|
| [#7](https://github.com/ajrmooreuk/INS-PPL-AZL/issues/7) | Value Realization — VP to EFS | Not Started | No VP-to-EFS execution artifacts |
| [#9](https://github.com/ajrmooreuk/INS-PPL-AZL/issues/9) | Discovery & Automation | Not Started | No discovery automation tooling |
| [#10](https://github.com/ajrmooreuk/INS-PPL-AZL/issues/10) | Compliance Assessment | In Flight | ALZ + O365 compliance mappings delivered; not executed |
| [#12](https://github.com/ajrmooreuk/INS-PPL-AZL/issues/12) | Deliverables & Reporting | In Flight | Executive Summary, test reports exist; no reporting platform |
| [#16](https://github.com/ajrmooreuk/INS-PPL-AZL/issues/16) | EFS Decomposition | Not Started | No Epic-Feature-Story decomposition beyond issue structure |
| [#18](https://github.com/ajrmooreuk/INS-PPL-AZL/issues/18) | PPM Ontology Adoption | In Flight | RCSG ontology + VSOM JSON delivered; no formal PPM ontology |
| [#28](https://github.com/ajrmooreuk/INS-PPL-AZL/issues/28) | Portfolio PMM (Epic) | In Flight | EA Audit Portfolio VSOM Structure + Feature MVP Specs delivered |
| [#29](https://github.com/ajrmooreuk/INS-PPL-AZL/issues/29) | Portfolio Governance Framework | Not Started | No governance framework document |
| [#30](https://github.com/ajrmooreuk/INS-PPL-AZL/issues/30) | Programme Management Framework | Not Started | PPM readme exists; no framework document |
| [#31](https://github.com/ajrmooreuk/INS-PPL-AZL/issues/31) | Project Delivery Framework | Not Started | No delivery framework |
| [#32](https://github.com/ajrmooreuk/INS-PPL-AZL/issues/32) | Resource & Capacity Management | Not Started | No resource management artifacts |
| [#33](https://github.com/ajrmooreuk/INS-PPL-AZL/issues/33) | PMM Reporting & Dashboards | Not Started | No reporting/dashboard artifacts |
| [#34](https://github.com/ajrmooreuk/INS-PPL-AZL/issues/34) | Stage-Gate Process | Not Started | No stage-gate artifacts |
| [#35](https://github.com/ajrmooreuk/INS-PPL-AZL/issues/35) | Define ALZ Portfolio structure | Not Started | VSOM structure exists; no formal 4-programme portfolio |
| [#36](https://github.com/ajrmooreuk/INS-PPL-AZL/issues/36) | Create PID template | Not Started | No PID template |
| [#37](https://github.com/ajrmooreuk/INS-PPL-AZL/issues/37) | Design portfolio dashboard | Not Started | No dashboard design |
| [#38](https://github.com/ajrmooreuk/INS-PPL-AZL/issues/38) | Programme: Platform Foundation | Not Started | Future (Y1 Q1-Q2) |
| [#39](https://github.com/ajrmooreuk/INS-PPL-AZL/issues/39) | Programme: Delivery Automation | Not Started | Future (Y1 Q3 - Y2 Q2) |
| [#40](https://github.com/ajrmooreuk/INS-PPL-AZL/issues/40) | Programme: Knowledge Enablement | Not Started | Future (Y1 Q4 - Y2 Q4) |
| [#41](https://github.com/ajrmooreuk/INS-PPL-AZL/issues/41) | Programme: Client Experience | Not Started | Future (Y2 Q3 - Y3 Q4) |
| [#58](https://github.com/ajrmooreuk/INS-PPL-AZL/issues/58) | Reporting Systems & Analytics | Not Started | No reporting platform artifacts |

### Compliance Features (EA X.1.00)

| # | Issue | Status | Evidence |
|---|-------|--------|----------|
| [#46](https://github.com/ajrmooreuk/INS-PPL-AZL/issues/46) | UK GDPR (DPA 2018) | Not Started | Marked duplicate; no specific artifacts |
| [#47](https://github.com/ajrmooreuk/INS-PPL-AZL/issues/47) | EU GDPR | Not Started | No EU GDPR compliance mapping |
| [#48](https://github.com/ajrmooreuk/INS-PPL-AZL/issues/48) | UK AI Regulation | Not Started | Referenced in RCSG VSOM; no assessment artifacts |
| [#49](https://github.com/ajrmooreuk/INS-PPL-AZL/issues/49) | EU AI Act | Not Started | Referenced in RCSG VSOM; no assessment artifacts |
| [#50](https://github.com/ajrmooreuk/INS-PPL-AZL/issues/50) | USA AI Governance | Not Started | Referenced in RCSG VSOM; no assessment artifacts |
| [#51](https://github.com/ajrmooreuk/INS-PPL-AZL/issues/51) | Nordic & Scandinavian Regulation | Not Started | No artifacts |
| [#52](https://github.com/ajrmooreuk/INS-PPL-AZL/issues/52) | European Data & AI (DACH, Benelux) | Not Started | No artifacts |
| [#59](https://github.com/ajrmooreuk/INS-PPL-AZL/issues/59) | UK Insurance Regulatory Migration | In Flight | Paul/UK-Insurance-Azure-Regulatory-Requirements.md exists; not migrated into ontology |

### Risk & Threat Modelling (EA R.1.00)

| # | Issue | Status | Evidence |
|---|-------|--------|----------|
| [#54](https://github.com/ajrmooreuk/INS-PPL-AZL/issues/54) | Risk Management Framework | In Flight | RCSG ontology references MITRE; no standalone risk framework |
| [#55](https://github.com/ajrmooreuk/INS-PPL-AZL/issues/55) | Threat Modelling & Security Assessment (Epic) | Not Started | No threat model artifacts |
| [#56](https://github.com/ajrmooreuk/INS-PPL-AZL/issues/56) | OWASP Security Standards | Not Started | Referenced in RCSG VSOM; no OWASP assessment |
| [#57](https://github.com/ajrmooreuk/INS-PPL-AZL/issues/57) | Threat Modelling Workflow (STRIDE/DREAD) | Not Started | Referenced in RCSG VSOM; no workflow artifacts |

### Knowledge & Ontology (EA K.1.01)

| # | Issue | Status | Evidence |
|---|-------|--------|----------|
| [#63](https://github.com/ajrmooreuk/INS-PPL-AZL/issues/63) | EA Enterprise Architecture Graph | Not Started | No graph implementation artifacts |

---

*AI Strategy Programme — Executive Summary*
*Document Reference: EA-PPM-AIS-EXEC-2026-001*
*Classification: Internal — Commercial in Confidence*
