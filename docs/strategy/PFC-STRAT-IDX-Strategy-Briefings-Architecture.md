r# Strategy & Briefing Document Catalogue

**Version:** 1.2.0 | **Date:** 2026-03-04 | **Total Documents:** 71+
**Repository:** [ajrmooreuk/Azlan-EA-AAA](https://github.com/ajrmooreuk/Azlan-EA-AAA)
**Supersedes:** `MANIFEST-Strategy-Briefings.md` (14-item list only)

---

## How to Use This Catalogue

Documents are grouped by **strategic theme** rather than file type. Each entry includes:
- **GitHub link** (relative path from repo root)
- **One-line summary** of what it covers
- **Epic/Feature alignment** where applicable
- **Cross-references** to related documents

Section 7 provides a **strategic synthesis** of how PFC/PFI/EMC architecture intersects with triads, CI/CD, and access controls.

---

## 1. Platform Foundation Strategy (Epic 34)

The four Epic 34 briefings form the **strategic master plan** for the entire PF-Core platform.

| # | Document | Summary |
|---|----------|---------|
| 1.1 | [BRIEFING-Epic34-PF-Core-VSOM-Platform-Strategy.md](BRIEFING-Epic34-PF-Core-VSOM-Platform-Strategy.md) | Master VSOM: Vision, 6 Strategies (S1-S6), BSC Objectives, Metrics. Defines the platform's strategic backbone. |
| 1.2 | [BRIEFING-Epic34-Graph-Series-Ontology-Mapping.md](BRIEFING-Epic34-Graph-Series-Ontology-Mapping.md) | 8 graph series mapped to 42+ ontologies. Gap analysis identifying GRAPH-CONFIG-ONT, AGENT-ONT, MARKET-ONT, SCENARIO-ONT as needed. VE-Series strongest (15 ONTs, 100%). |
| 1.3 | [BRIEFING-Epic34-Unified-Registry-Skills-Architecture.md](BRIEFING-Epic34-Unified-Registry-Skills-Architecture.md) | One registry with quasi-OO cascade (Core → Instance → Client). Skills as registry artifacts. Foundation for `resolve_cascaded_config()`. |
| 1.4 | [BRIEFING-Epic34-PFI-Instance-Readiness.md](BRIEFING-Epic34-PFI-Instance-Readiness.md) | 5 PFI instance readiness scores (BAIV 80%, AIRL 60%, W4M 40%, VHF 30%). 15 GitHub repos in dev/test/prod triads. |
| 1.5 | [BRIEFING-Unified-Registry-Database-Strategy.md](BRIEFING-Unified-Registry-Database-Strategy.md) | **VSOM-led strategy** for evolving `ont-registry-index.json` → `pfc-registry-index.json`. 10 artifact domains (ontologies, skills, agents, tokens, skeletons, DB schemas, code modules, schemas, docs, join patterns). 4-phase migration. Multi-artifact cascade, PFI context broadening, Supabase `pfc_registry` table, EMC multi-artifact composition. |

**Cross-refs:** All five feed into the [ARCH-PFC-PFI-Product-Client-Graph-Cascade.md](#3-architecture--cascade) and [PLAN-Supabase-JSONB-MVP-Platform-Phase.md](#5-supabase--data-platform).

---

## 2. Epic Briefings & Feature Strategies

### 2.1 EMC & Composition Engine (Epic 19)

| # | Document | Summary |
|---|----------|---------|
| 2.1.1 | [BRIEFING-Epic19-Phase3-4-and-Beyond.md](BRIEFING-Epic19-Phase3-4-and-Beyond.md) | EMC composition engine phases 3-4. Dependency patterns, BAIV worked examples, GraphScopeRule + ComposedGraphSpec. |

### 2.2 OFM & Fulfilment (Epic 41)

| # | Document | Summary |
|---|----------|---------|
| 2.2.1 | [BRIEFING-Epic41-OFM-ONT-Order-Fulfilment-Management.md](BRIEFING-Epic41-OFM-ONT-Order-Fulfilment-Management.md) | Commercial overlay on LSC-ONT logistics. 10 entities, 15 relationships for order fulfilment management. |

### 2.3 VSOM Skilled Application Planner (Epic 49)

| # | Document | Summary |
|---|----------|---------|
| 2.3.1 | [BRIEFING-Epic49-VSOM-Skilled-Application-Planner.md](BRIEFING-Epic49-VSOM-Skilled-Application-Planner.md) | Strategy-to-delivery pipeline. Skeleton + EFS + PPM integration. Application Specification Framework. |
| 2.3.2 | [BRIEFING-F49.9-Figma-Pencil-Design-Tooling-Strategy.md](BRIEFING-F49.9-Figma-Pencil-Design-Tooling-Strategy.md) | Figma = human design source of truth; Pencil = agentic design execution engine. Token bridge, zone layout, `.pen` convention. 5 stories (S49.9.1-S49.9.5). |

### 2.4 FairSlice Platform Economics (Epic 50 + Epic 51)

The FairSlice economic layer is the first full implementation of the PFC graph architecture. Five documents span two epics (50 + 51) covering platform economics, schema convergence, collaboration methodology, and open decisions. Start with the lead document (2.4.0).

| # | Document | Summary |
|---|----------|---------|
| 2.4.0 | [BRIEFING-FairSlice-Strategy-Implementation-Proposals.md](BRIEFING-FairSlice-Strategy-Implementation-Proposals.md) | **Lead document.** Consolidated FairSlice strategy: triple-loop revenue engine, 4 personas, 7-step waterfall, 5 FS strategies, BSC cascade (17 objectives), combined epic scope (18 features, 60 stories), 4-phase roadmap, AI Judge architecture, commercial model. Reading guide for all subordinate docs. |
| 2.4.1 | [BRIEFING-Epic50-FairSlice-Platform-Economics.md](BRIEFING-Epic50-FairSlice-Platform-Economics.md) | **Epic 50 briefing.** Full platform economics: FAIRSLICE-ONT v1.0.0 (9 entities), PARTNER-ONT v1.0.0 (6 entities), revenue waterfall engine, AI Judge (three-tier cost model), smart contract registry, Stripe Connect, partner/agency channel. 10 features, 33 stories. BAIV worked example. |
| 2.4.2 | [CONVERGENCE-FairSlice-JSONB-Graph-Patterns.md](CONVERGENCE-FairSlice-JSONB-Graph-Patterns.md) | **Schema convergence proof.** Table-by-table mapping: FairSlice tables = PFC JSONB graph patterns (F34.5). `resolve_cascaded_config()` shared function. Hybrid migration path (domain tables → graph abstraction → full convergence). 16 tables converging to ~9. |
| 2.4.3 | [DISCUSSION-FairSlice-Proposals-Overview.md](DISCUSSION-FairSlice-Proposals-Overview.md) | **Discussion paper.** One-page proposal, VSOM cascade (5 strategies, 14 objectives), 3 value propositions (VP-RRR aligned), 5 open decisions (build sequence, scope, commercial model, AI Judge scope, equity/cash split), risk register. |
| 2.4.4 | [BRIEFING-Epic51-FairSlice-VE-Skill-Chain-Collaboration-Strategy.md](BRIEFING-Epic51-FairSlice-VE-Skill-Chain-Collaboration-Strategy.md) | **Epic 51 briefing.** VE Skill Chain methodology for FairSlice elaboration: dual-loop architecture (outer=strategic, inner=operational), party model (ORG + PARTNER + RRR → FAIRSLICE), PFC-PFI cascade governance (10 gates), Pie Zero self-referential build, BAIV first PFI consumer. 8 features, 27 stories. |

**Cross-refs:** Lead document (2.4.0) consolidates all four subordinate docs. Schema convergence (2.4.2) proves FairSlice = F34.5 JSONB PoC (1.3, 5.1). Discussion paper (2.4.3) feeds Phase 1 partner workshops (2.4.4). Epic 51 (2.4.4) extends Epic 50 (2.4.1) with collaboration methodology. All trace to Epic 34 (1.1) OBJ-SH2 and OBJ-F4.

### 2.5 Ontology-Specific Briefings

| # | Document | Summary |
|---|----------|---------|
| 2.5.1 | [BRIEFING-EFS-ONT-Organisational-Functions-vs-Processes.md](BRIEFING-EFS-ONT-Organisational-Functions-vs-Processes.md) | Comprehensive taxonomy distinguishing organisational functions from processes. EFS-ONT v2.0.0 spec. 114K — the largest briefing. |
| 2.5.2 | [BRIEFING-KANO-ONT-Satisfaction-Classification-Strategy.md](BRIEFING-KANO-ONT-Satisfaction-Classification-Strategy.md) | Kano model (must-have / performance / delight factors). VP-RRR-LSC cascade integration. |
| 2.5.3 | [BRIEFING-Kano-Analysis-Strategy.md](BRIEFING-Kano-Analysis-Strategy.md) | Kano analysis methodology, satisfaction mapping, product feature classification. |

### 2.6 Ontology Series Briefings (in ontology-library)

| # | Document | Summary |
|---|----------|---------|
| 2.6.1 | [VE-Series/VSOM-SA/BRIEFING-VSOM-Strategy-Analysis.md](../../ONTOLOGIES/ontology-library/VE-Series/VSOM-SA/BRIEFING-VSOM-Strategy-Analysis.md) | VSOM-SA sub-series: BSC, INDUSTRY, REASON, MACRO, PORTFOLIO ontologies. Strategic analysis framework. |
| 2.6.2 | [VE-Series/VSOM-SC/BRIEFING-VSOM-Strategy-Communication.md](../../ONTOLOGIES/ontology-library/VE-Series/VSOM-SC/BRIEFING-VSOM-Strategy-Communication.md) | VSOM-SC sub-series: NARRATIVE, CASCADE, CULTURE, VIZSTRAT. Strategy communication patterns. |
| 2.6.3 | [TOOLS/ontology-visualiser/BRIEFING-Series-SubSeries-Design-Strategy.md](../../TOOLS/ontology-visualiser/BRIEFING-Series-SubSeries-Design-Strategy.md) | Visualiser design strategy for ontology grouping. Series/sub-series visual hierarchy. |

### 2.7 VE-Series Strategy Frameworks (AIRL Worked Example)

The Strategy-to-OKR-to-PMF framework and its AIRL AI Audit Services worked example. Cross-referenced from [AIRL repo](https://github.com/ajrmooreuk/AIRL/tree/main/1-Value-Engineering/Strategy-Create-Value-OKR). Demonstrates VE-Series ontologies (VSOM, OKR, PMF, VP, RRR, KPI) applied to a real PFI instance business model.

| # | Document | Summary |
|---|----------|---------|
| 2.7.1 | [BRIEFING-Strategy-to-OKR-to-PMF-Framework.md](BRIEFING-Strategy-to-OKR-to-PMF-Framework.md) | **Sector-independent framework.** 3-stage pipeline: Strategy (theory of value creation, strategy canvas, critical assumptions) → OKR (assumption-testing quarterly objectives) → PMF (6-dimension weighted scorecard). Services vs SaaS weighting. Decision framework (double-down / optimise / validate / stop). |
| 2.7.2 | [BRIEFING-AIRL-AI-Audit-Services-Strategy-OKR-PMF-Worked-Example.md](BRIEFING-AIRL-AI-Audit-Services-Strategy-OKR-PMF-Worked-Example.md) | **AIRL worked example.** AI-augmented advisory for mid-market & SMB. $35K engagement, 3-week delivery, 74% gross margin. Q1 2026 OKRs (3 objectives, 9 KRs). PMF score 78.84 (Strong Fit). Q2 actions: double-down network sales, optimise content CAC, validate implementation conversion. |

**Cross-refs:** Framework (2.7.1) is the generic pattern; AIRL example (2.7.2) is the first PFI instance application. Both align to VE-Series VSOM-OKR-PMF ontology chain. See also Epic 34 PFI Instance Readiness (1.4) for AIRL readiness score (60%).

### 2.8 PE-L6S & PPM Project Selection (Epic 54)

Three briefings covering Lean Six Sigma skills, ontology extensions, and PPM portfolio selection via the Three Voices framework (VoB / VoC / VoP). Aligned to **Epic 54** (#822) and **F54.1** (#823).

| # | Document | Summary |
|---|----------|---------|
| 2.8.1 | [BRIEFING-PE-L6S-Lean-Six-Sigma-Sub-Series-Strategy.md](BRIEFING-PE-L6S-Lean-Six-Sigma-Sub-Series-Strategy.md) | **Parent L6S architecture.** PE-L6S sub-series strategy: 4 new ontologies (VOC-ONT, PROCMAP-ONT, VSM-ONT, VANA-ONT), DMAIC/K-DMAIC v2.0.0 import/deprecate pattern, entity promotion, 888 lines. |
| 2.8.2 | [BRIEFING-PPM-Project-Selection-Three-Voices.md](BRIEFING-PPM-Project-Selection-Three-Voices.md) | Three Voices framework (VoB/VoC/VoP) for PPM portfolio selection. 6 new PPM-ONT v5.0.0 entities (InitiativeScorecard, SelectionCriteria, PortfolioRanking). Composite scoring model (VoB 0.40, VoC 0.35, VoP 0.25). 8 join patterns, 10 business rules. W4M-WWG worked example with 5 initiatives scored. |
| 2.8.3 | [BRIEFING-L6S-Skills-and-Ontology-Extensions.md](BRIEFING-L6S-Skills-and-Ontology-Extensions.md) | 7 L6S skills (pfc-voc, pfc-procmap, pfc-vsm, pfc-vana, pfc-dmaic, pfc-l6s-pipeline, pfc-spc). DMAIC v2.0.0 / K-DMAIC v2.0.0 upgrade plans. ProcessPath registration (8 steps, 9 links). 3 agent roles with 7 human checkpoints. W4M-WWG AU→UK lamb corridor worked example. |

**Cross-refs:** 2.8.1 is the parent architecture for 2.8.2 and 2.8.3. PPM selection (2.8.2) bridges VSOM-SA strategic analysis to PE-Series project execution. L6S skills (2.8.3) extend PE-ONT v4.0.0 pe:Skill and pe:ProcessPath. All three reference VP-RRR alignment convention and KANO-ONT (2.5.2).

### 2.9 Cross-Project Portfolio Reporting & Programme Management (Epic 55)

| # | Document | Summary |
|---|----------|---------|
| 2.9.1 | [BRIEFING-Epic55-Cross-Project-Portfolio-Reporting-Strategy.md](BRIEFING-Epic55-Cross-Project-Portfolio-Reporting-Strategy.md) | **Federated portfolio reporting.** Cross-project daily/weekly/monthly rolling reports (DONE/INFLIGHT/NOT DONE). PPM-ONT Three Voices portfolio scoring. PFC→PFI epic mirroring (non-editable). Registry health cadences (daily/weekly/monthly/ad-hoc). Change control & audit trail (4-layer model). Strategy paper consolidation recommendations. Phase 1: GitHub-native (`gh` CLI scripts + Actions + custom views). Phase 2: Workbench dashboard. 7 features (F55.1-F55.7), 31 stories. |

**Cross-refs:** Builds on Programme Distribution Strategy (4.3) for work orchestration. Uses PPM-ONT Three Voices framework (2.8.2) for portfolio scoring. Integrates with EMC cascade (2.1.1, 3.1) for PFC→PFI impact mapping. Extends close-out skill for status propagation. Registry cadences govern Unified Registry (1.3, 1.5). Triad distribution (4.1, 4.2) provides CI/CD context.

---

## 3. Architecture & Cascade

| # | Document | Summary |
|---|----------|---------|
| 3.1 | [ARCH-PFC-PFI-Product-Client-Graph-Cascade.md](ARCH-PFC-PFI-Product-Client-Graph-Cascade.md) | **Core architecture document.** 4-tier cascade (PFC → PFI → Product → Client). 4 critical gaps identified. EMC-ONT scope rules, ContextLevel, RequirementCategory. 7-priority composition rule pipeline. |
| 3.2 | [ARCH-Skeleton-Application-Specification-Framework.md](ARCH-Skeleton-Application-Specification-Framework.md) | Bridges 3 systems: skeleton (DS-ONT), EFS PRD, PPM project plan. Unified Application Specification Model. |
| 3.3 | [BRIEF-F34.8-Extensibility-Decision-Tree.md](BRIEF-F34.8-Extensibility-Decision-Tree.md) | Extensibility patterns for PFC platform. Plugin architecture, customisation scopes. |

---

## 4. CI/CD, Triads & Programme Distribution

| # | Document | Summary |
|---|----------|---------|
| 4.1 | [TRAINING-PFI-Release-and-Promotion-Guide.md](TRAINING-PFI-Release-and-Promotion-Guide.md) | **Primary training guide.** Hub-and-spoke architecture. Content flows Hub → dev → test → prod. 3-layer protection (guard-core.yml, CODEOWNERS, private repos). Full BAIV live walkthrough. |
| 4.2 | [AGENDA-PFI-CICD-Team-Session.md](AGENDA-PFI-CICD-Team-Session.md) | 60-min team session. 3 training scenarios (first release, core protection, concurrent workstreams). Permissions matrix and guardrails checklist. |
| 4.3 | [VSOM-Programme-Distribution-Strategy.md](VSOM-Programme-Distribution-Strategy.md) | **Programme-level work orchestration.** Federated epic/feature/story distribution across PFI triads. Classify all output as core-contribution or instance-specific. `triad-board-sync.yml` rollup. |

---

## 5. Supabase & Data Platform

| # | Document | Summary |
|---|----------|---------|
| 5.1 | [PLAN-Supabase-JSONB-MVP-Platform-Phase.md](PLAN-Supabase-JSONB-MVP-Platform-Phase.md) | **Master delivery plan.** 6 phases (Schema → Ingest → Loader → Auth/Security → API/MCP → Composed Graphs). Consolidates Epic 10A + F5.1 + F36.11. Migrations 001-005. |
| 5.2 | [BRIEFING-GraphQL-Supabase-JSONB-MVP.md](BRIEFING-GraphQL-Supabase-JSONB-MVP.md) | GraphQL transport layer architecture. JSONB views, computed columns, `resolve_composed_graph()` function. |
| 5.3 | [PROPOSAL-Supabase-Secure-Connections-API-MCP-v1.0.0.md](PROPOSAL-Supabase-Secure-Connections-API-MCP-v1.0.0.md) | **3-layer access architecture.** Layer 1: Browser (JWT+RLS). Layer 2: Claude MCP (5 tools, service key, PFI-scoped). Layer 3: REST API (API keys, rate-limited). Token-efficient by design. |

---

## 6. Cross-Cutting Strategies

### 6.1 Cloud, Sovereignty & Multi-Platform

| # | Document | Summary |
|---|----------|---------|
| 6.1.1 | [STRATEGY-Cloud-Vendor-Sovereignty-Multi-Platform-v1.0.0.md](STRATEGY-Cloud-Vendor-Sovereignty-Multi-Platform-v1.0.0.md) | 5 platform configurations across Azure, AWS, GCP, self-hosted. Tiered approach by client regulatory profile. Key finding: ontology layer is already platform-agnostic; migration cost is in workflow plumbing + AI skill porting. |

### 6.2 Process & Discovery

| # | Document | Summary |
|---|----------|---------|
| 6.2.1 | [BRIEFING-DELTA-Process-Industry-Agnostic-Discovery.md](BRIEFING-DELTA-Process-Industry-Agnostic-Discovery.md) | DELTA: Discover, Evaluate, Leverage, Transform, Adapt. 5-phase cycle. Core product engine for mid-market SaaS. |
| 6.2.2 | [PFC-STRAT-BRIEF-PFC-PFI-VE-PE-DELTA-Discovery-Led-Process-v1.0.0.md](PFC-STRAT-BRIEF-PFC-PFI-VE-PE-DELTA-Discovery-Led-Process-v1.0.0.md) | **PFC-PFI VE-PE-DELTA bridge.** Discovery-led process engineering: how PFC engines (VE, DELTA, L6S, DMAIC, VSOM Planner) extend into PFI domain-specific value creation. Process selection decision tree (strategic/process/rapid/hybrid/compliance). PFI-BAIV [AIV] first implementation. 6 AIV join patterns (JP-AIV-001 to JP-AIV-006). Reusable bridge pattern for all PFI instances. 9 features (F63.1-F63.9). Epic 63 (#969). |
| 6.2.3 | [BRIEFING-PFC-Context-Assistant-Universal-PBS-Strategy.md](BRIEFING-PFC-Context-Assistant-Universal-PBS-Strategy.md) | Unified registry as ecosystem ontology. Context assistant, RBAC-aware navigation, role-based graph filtering. |

### 6.3 Integration & External Systems

| # | Document | Summary |
|---|----------|---------|
| 6.3.1 | [BRIEFING-Monday-Neo4j-Integration-Roadmap.md](BRIEFING-Monday-Neo4j-Integration-Roadmap.md) | Monday.com integration strategy, API patterns, graph syncing, entity mapping. |

### 6.4 VSOM Implementation Guides

| # | Document | Summary |
|---|----------|---------|
| 6.4.1 | [VSOM-Strategic-Toolkit-Plan-v1.0.1.md](VSOM-Strategic-Toolkit-Plan-v1.0.1.md) | VSOM framework implementation toolkit. Strategy cascade, objective mapping. |
| 6.4.2 | [VSOM-FloodGraph-AI-FRA.md](VSOM-FloodGraph-AI-FRA.md) | AI-driven flood risk assessment use case. Graph composition, domain ontologies. |

### 6.5 Design & Interaction

| # | Document | Summary |
|---|----------|---------|
| 6.5.1 | [DESIGN-DIRECTOR-TOOLKIT-Graphing-Workbench-Decision-Tree.md](DESIGN-DIRECTOR-TOOLKIT-Graphing-Workbench-Decision-Tree.md) | Visual hierarchy strategy, series/sub-series grouping, cognitive overload mitigation. |
| 6.5.2 | [INTERACTION-LOGIC-TREE.md](INTERACTION-LOGIC-TREE.md) | User interaction patterns, event handling, state management, navigation logic. |
| 6.5.3 | [PFC-PFI-STRATEGY-GRAPH-MAPPING.md](PFC-PFI-STRATEGY-GRAPH-MAPPING.md) | Strategic mapping between PFC and PFI contexts. Instance filtering, scope resolution. |
| 6.5.4 | [BRIEFING-Design-Director-Cascading-Design-Governance-Strategy.md](BRIEFING-Design-Director-Cascading-Design-Governance-Strategy.md) | Design Director rules engine: cascading design governance (spacing, typography, composition, interaction, brand) through Core→Instance→Product→Client tiers. DS-ONT v3.1.0 extensions, candidate agents/skills, Pencil MCP validation loop. Aligns to Epic 34, Epic 40, Epic 49, F49.9. |

---

## 6.6 Plans & Workbench Features

| # | Document | Summary |
|---|----------|---------|
| 6.6.1 | [PLAN-F40.17-PFI-Lifecycle-Workbench.md](PLAN-F40.17-PFI-Lifecycle-Workbench.md) | 10-step pipeline UI. Instance creation through persona workflows. |
| 6.6.2 | [PLAN-F40.18-Skeleton-Inspector-Panel.md](PLAN-F40.18-Skeleton-Inspector-Panel.md) | Z22 panel with 3 tabs, spatial wireframe. Zone registry introspection. |
| 6.6.3 | [PLAN-F40.19-Skeleton-Editor.md](PLAN-F40.19-Skeleton-Editor.md) | Edit zones, nav layers, navigation items. Real-time skeleton validation. |

---

## 6.7 Neo4j Strategy Archive (Pre-Supabase Decision)

All in `PFC-Strategy-Neo4j/` — retained for context. ADR-2026-001 ruled in favour of Supabase JSONB.

| # | Document | Summary |
|---|----------|---------|
| 6.7.1 | [PFC-Strategy-Neo4j/PF-Core-ADR-Neo4j-vs-JSON-Graph-Claude-SDK-Evaluation-v1.0.docx.md](PFC-Strategy-Neo4j/PF-Core-ADR-Neo4j-vs-JSON-Graph-Claude-SDK-Evaluation-v1.0.docx.md) | Architecture Decision Record: Neo4j vs Supabase JSONB. Selection criteria, pros/cons. |
| 6.7.2 | [PFC-Strategy-Neo4j/PF-CORE-Arch-Agents-Graphs-Master-Index.md](PFC-Strategy-Neo4j/PF-CORE-Arch-Agents-Graphs-Master-Index.md) | Central index of all Neo4j strategy documents. |
| 6.7.3 | [PFC-Strategy-Neo4j/PF-CORE-Arch-Agents-Graphs-Claude-SDK-Integration.md](PFC-Strategy-Neo4j/PF-CORE-Arch-Agents-Graphs-Claude-SDK-Integration.md) | Claude SDK MCP setup, agent patterns, graph traversal. |
| 6.7.4 | [PFC-Strategy-Neo4j/PF-CORE-Arch-Agents-Graphs-Workflow-Schemas.md](PFC-Strategy-Neo4j/PF-CORE-Arch-Agents-Graphs-Workflow-Schemas.md) | Workflow composition, state machines, event flows. |
| 6.7.5 | [PFC-Strategy-Neo4j/PF-CORE-Arch-Agents-Graphs-Neo4j-MCP-Server-Setup.md](PFC-Strategy-Neo4j/PF-CORE-Arch-Agents-Graphs-Neo4j-MCP-Server-Setup.md) | Neo4j database setup, MCP server configuration, Cypher patterns. |
| 6.7.6 | [PFC-Strategy-Neo4j/PF-CORE-Arch-Agents-Graphs-Cypher-Query-Patterns.md](PFC-Strategy-Neo4j/PF-CORE-Arch-Agents-Graphs-Cypher-Query-Patterns.md) | Common Cypher patterns, graph traversal queries. |
| 6.7.7 | [PFC-Strategy-Neo4j/PF-CORE-Arch-Agents-Graphs-Visual-Diagrams.md](PFC-Strategy-Neo4j/PF-CORE-Arch-Agents-Graphs-Visual-Diagrams.md) | Architecture diagrams, data flow visualisations. |
| 6.7.8 | [PFC-Strategy-Neo4j/PF-CORE-Arch-Agents-Graphs-Package-Summary.md](PFC-Strategy-Neo4j/PF-CORE-Arch-Agents-Graphs-Package-Summary.md) | NPM packages, dependencies, setup checklist. |
| 6.7.9 | [PFC-Strategy-Neo4j/PF-CORE-Arch-Agents-Graphs-LinkedIn-Series-Strategy.md](PFC-Strategy-Neo4j/PF-CORE-Arch-Agents-Graphs-LinkedIn-Series-Strategy.md) | LinkedIn content strategy, series creation, engagement patterns. |
| 6.7.10 | [PFC-Strategy-Neo4j/REVIEW-Neo4j-Strategy-Docs-Direction-Setting.md](PFC-Strategy-Neo4j/REVIEW-Neo4j-Strategy-Docs-Direction-Setting.md) | Strategic review, future directions, Neo4j vs PostgreSQL JSONB trade-offs. |

---

## 6.8 PFI Instance Documents (W4M-WWG)

Located in `PBS/PFI-WWG/`.

| # | Document | Summary |
|---|----------|---------|
| 6.8.1 | [PBS/PFI-WWG/OPERATING-GUIDE-Visualiser.md](../../PFI-WWG/OPERATING-GUIDE-Visualiser.md) | How to load/view/compose W4M-WWG PFI in visualiser. 7 ontologies. |
| 6.8.2 | [PBS/PFI-WWG/VSOM-LSC-OFM-Intelligence.md](../../PFI-WWG/VSOM-LSC-OFM-Intelligence.md) | Supply chain intelligence, corridor mapping, fulfilment cost analysis. |
| 6.8.3 | [PBS/PFI-WWG/STRATEGY/VSOM-LSC-UK-Importer-Adoption.md](../../PFI-WWG/STRATEGY/VSOM-LSC-UK-Importer-Adoption.md) | UK food importer use case, adoption roadmap for AU/NZ/Iceland/Ireland corridors. |
| 6.8.4 | [PBS/PFI-WWG/STRATEGY/VSOM-SOP-Customer-Fulfillment-Risk.md](../../PFI-WWG/STRATEGY/VSOM-SOP-Customer-Fulfillment-Risk.md) | Customer fulfilment SOP, cold chain visibility, delivery SLA tracking. |
| 6.8.5 | [PBS/PFI-WWG/STRATEGY/VSOM-E2E-Supply-Demand-Graph.md](../../PFI-WWG/STRATEGY/VSOM-E2E-Supply-Demand-Graph.md) | End-to-end supply-demand graph composition, demand forecasting. |

---

## 6.9 Operational Guides

| # | Document | Summary |
|---|----------|---------|
| 6.9.1 | [OPERATING-GUIDE-PFI-Graph-Creation.md](OPERATING-GUIDE-PFI-Graph-Creation.md) | 10-step PFI graph creation pipeline with code examples. BAIV-AIV reference implementation. |

---

## 7. Strategic Synthesis: PFC/PFI/EMC, Triads, CI/CD & Access Controls

This section answers the question: **how does the PFC-PFI-EMC strategy fit with triad distribution, CI/CD pipelines, and access controls?**

### 7.1 The Three Layers of Governance

The platform operates three **distinct but interlocking** governance layers:

```
┌─────────────────────────────────────────────────────────────────┐
│  LAYER A: GRAPH GOVERNANCE (EMC-ONT + Cascade Architecture)     │
│  What ontologies each PFI sees, how they compose, scope rules   │
│  Documents: 1.1-1.4, 2.1.1, 3.1                                │
├─────────────────────────────────────────────────────────────────┤
│  LAYER B: ARTIFACT DISTRIBUTION (Triads + CI/CD)                │
│  How content flows from hub to PFI dev/test/prod repos          │
│  Documents: 4.1, 4.2, 4.3                                      │
├─────────────────────────────────────────────────────────────────┤
│  LAYER C: DATA ACCESS CONTROLS (Supabase RLS + RBAC + API)     │
│  Who can read/write what data, at what tier, via which path     │
│  Documents: 5.1, 5.2, 5.3                                      │
└─────────────────────────────────────────────────────────────────┘
```

### 7.2 How EMC Drives What Each PFI Receives

EMC-ONT defines **what** each PFI's graph universe contains:

| EMC Concept | What It Controls | Where Enforced |
|---|---|---|
| `ContextLevel` (PFC / PFI) | Tier 0 vs Tier 1 ontology selection | `emc-composer.js` → `constrainToInstanceOntologies()` |
| `RequirementCategory` | Which category compositions apply (PRODUCT, FULFILMENT, COMPLIANCE, etc.) | `requirementScopes` in registry per PFI |
| `instanceOntologies` | Exact ontology list for a PFI (e.g., W4M-WWG = VP, RRR, LSC, OFM, KPI, BSC, EMC) | `ont-registry-index.json` per PFI entry |
| `GraphScopeRule` + `ScopeCondition` | Dynamic filtering (maturity, org-context, vertical market) | EMC v5.0.0 declarative rules (runtime engine pending) |
| `ComposedGraphSpec` | Named, cached multi-ontology compositions | `composed_graphs` table in Supabase |

**The EMC layer is the "what" — it determines the graph content universe.**

### 7.3 How Triads Distribute That Content

The triad system is the **physical delivery mechanism** for EMC-scoped content:

```
EMC determines:     "BAIV gets VE+PE+RCSG+Foundation+Orchestration (45 ontologies)"
                          │
Triad distributes:        │
                          ▼
    Azlan-EA-AAA (hub)  ──pfc-release.yml──▶  pfi-baiv-aiv-dev
                                                    │
                                              promote.yml
                                                    ▼
                                              pfi-baiv-aiv-test
                                                    │
                                              promote.yml (+ SME gate)
                                                    ▼
                                              pfi-baiv-aiv-prod
```

**Key insight:** The `pfc-release.yml` workflow reads `hubSpokeConfig.ontologySeries` from the registry — which is itself governed by EMC's instance configuration. So EMC drives the CI/CD filter.

| CI/CD Mechanism | What It Does | EMC Relationship |
|---|---|---|
| `pfc-release.yml` | Filters registry by PFI series subscription → creates PR on dev | Reads EMC's `ontologySeries` declaration |
| `promote.yml` (dev→test) | Copies `pfc-core/` + `instance-data/` to test repo | Carries EMC-scoped content + PFI-team work |
| `promote.yml` (test→prod) | Same, with `needs-sme-approval` label | Final gate before EMC-scoped graph reaches production |
| `guard-core.yml` | Blocks human edits to `pfc-core/` | Protects EMC-governed content from PFI-team override |
| `triad-board-sync.yml` | Rolls up story completion to parent epic | Tracks delivery of EMC-aligned features |

### 7.4 How Access Controls Layer Over Both

Access controls operate at **three distinct boundaries**:

#### Boundary 1: Git Repository Access (Current)

| Control | Mechanism | Effect |
|---|---|---|
| Private repos | GitHub visibility settings | PFI teams can only see their own triad |
| `CODEOWNERS` | File-level approval rules | `pfc-core/` requires `@ajrmooreuk` approval |
| `guard-core.yml` | CI check | Rejects non-bot PRs touching `pfc-core/` |
| `PROMOTION_PAT` secret | GitHub Actions secret | Only dev repo workflows can create PRs on test/prod |
| Branch protection | Review requirements | Test requires 1 review; prod requires SME approval |

#### Boundary 2: Supabase Database Access (Planned — Phase 3+)

| Control | Mechanism | Effect |
|---|---|---|
| **RLS policies** | `WHERE pfi_id IN (SELECT pfi_id FROM user_pfi_access WHERE user_id = auth.uid())` | Users see only their assigned PFI's data |
| **4-role RBAC** | `pf-owner` > `pfi-admin` > `pfi-member` > `viewer` | Graduated permissions: owner manages all PFIs, admin manages one PFI, member contributes, viewer reads |
| **PFI context switcher** | UI dropdown bound to `user_pfi_access` | User explicitly selects which PFI context they're working in |
| **Audit logging** | `audit_log` table with trigger-based capture | Every mutation tracked with actor, action, resource, detail JSONB |
| **API key scoping** | `api_keys.pfi_id` + `permissions[]` | Third-party integrations scoped to one PFI with permission array |

#### Boundary 3: Agent/MCP Access (Planned — Phase 4)

| Control | Mechanism | Effect |
|---|---|---|
| **PFI_SCOPE env var** | MCP server reads at startup, not from agent request | Agent cannot escape its PFI — scope is set by deployment config, not runtime |
| **Service key + Edge Functions** | Service key bypasses RLS; Edge Function enforces PFI scope | Agent gets full access within its PFI but zero access outside |
| **X-PFI-Scope header** | Required on all service key requests | Edge Function validates scope before executing |
| **Token-efficient design** | 5 coarse-grained tools (not 30 CRUD tools) | 2,500-4,000 token overhead vs 15,000-25,000 |
| **Audit logging** | Every agent mutation logged with `actor_id = "agent:<pfi>"` | Full traceability of agent actions |

### 7.5 The Full Picture: EMC → Triads → Access Controls

```
                    ┌──────────────────────────────┐
                    │   EMC-ONT Composition Rules    │
                    │   (what each PFI's graph is)   │
                    └──────────────┬─────────────────┘
                                   │
          ┌────────────────────────┼────────────────────────┐
          ▼                        ▼                        ▼
   ┌──────────────┐      ┌─────────────────┐      ┌──────────────┐
   │ pfc-release  │      │ ont-registry    │      │ Supabase     │
   │ .yml         │      │ -index.json     │      │ ontologies   │
   │ (CI/CD)      │      │ (hub config)    │      │ table (JSONB)│
   └──────┬───────┘      └────────┬────────┘      └──────┬───────┘
          │                       │                       │
          ▼                       ▼                       ▼
   ┌──────────────────────────────────────────────────────────────┐
   │              PFI TRIAD: dev → test → prod                    │
   │                                                               │
   │  Git Access Controls          Supabase Access Controls        │
   │  ├─ Private repos             ├─ RLS (pfi_id scoping)        │
   │  ├─ CODEOWNERS                ├─ 4-role RBAC                 │
   │  ├─ guard-core.yml            ├─ Audit logging               │
   │  ├─ Branch protection         ├─ API key per-PFI scoping     │
   │  └─ PROMOTION_PAT             └─ MCP PFI_SCOPE env var       │
   └──────────────────────────────────────────────────────────────┘
```

### 7.6 The Unified Registry: Architectural Backbone

The unified registry is arguably the **single most important architectural concept** in PF-Core. It is the mechanism through which EMC governance, triad distribution, access controls, and the cascade architecture all converge into one coherent system.

#### 7.6.1 Core Concept: One Registry, All Artifact Types

The Unified Registry (doc [1.3](BRIEFING-Epic34-Unified-Registry-Skills-Architecture.md)) replaces the idea of separate registries per artifact type. Instead, **one table (`pfc_registry`)** governs all platform artifacts through a single inheritance cascade:

| Artifact Type | Examples | Same Governance |
|---|---|---|
| **Ontologies** | VP-ONT, RRR-ONT, EMC-ONT | Yes — cascade resolution |
| **Skills** | VSOM skill, OKR cascade, GRC compliance | Yes — Claude `.claude/skills` symlinks to `registry/skills/` |
| **Design Tokens** | `color-primary`, `font-heading`, spacing scales | Yes — `brand_config` on `pfi_instances` |
| **Agent Templates** | DELTA pipeline, composition agent | Yes — `pfc:artifactType: "agent"` |
| **Schemas** | JSON-LD contexts, OAA validation rules | Yes — `pfc:artifactType: "schema"` |

**Key insight:** Skills are not special. They are registry artifacts that follow the same on/off/customised pattern as ontologies and design tokens. Claude sees skills because `.claude/skills` is a symlink to `registry/skills/`.

#### 7.6.2 The Quasi-OO Cascade: deepMerge Semantics

The cascade operates like class inheritance with four resolution tiers:

```
Resolution Order:
1. Core artifact definition        ← Base class (always loaded first)
2. Instance override (if exists)   ← Subclass (extends/overrides)
3. Product override (if exists)    ← Further specialisation
4. Client override (if exists)     ← Final customisation
5. Effective configuration         ← deepMerge result
```

Each scope level can:
- **Inherit** — take the parent as-is (`overrideType: inherit`)
- **Extend** — add new properties without removing inherited ones (`overrideType: extend`)
- **Override** — replace specific config values (`overrideType: override`)
- **Disable** — set `status: inactive` (artifact not available at this scope)

**Worked example** (from doc 1.3):
```
Design Token "color-primary":
  Core:     #0099B1     ← defined
  BAIV:     #0099B1     ← inherited (ON)
  W4M:      #2D5F8A     ← customised (ON + override)
  AIR:      #0099B1     ← inherited (ON)
  Client X: #FF6600     ← customised (ON + override)

Skill "vsom":
  Core:     { bsc: false, maps: true }        ← defined
  BAIV:     { bsc: true, +ai_visibility }     ← customised (ON + extend)
  W4M:      { bsc: true, +wellbeing }         ← customised (ON + extend)
  AIR:      { bsc: false, maps: true }        ← inherited (ON)
  Client M: { status: OFF }                    ← disabled
```

Same cascade. Same resolution. Same registry. Same governance.

#### 7.6.3 Database Implementation: `resolve_artifact_config()`

The cascade is implemented as a PostgreSQL function (spec'd in doc 1.3, planned for migration 004):

```sql
resolve_artifact_config(
  p_artifact_type TEXT,    -- 'skill', 'ontology', 'design-token', ...
  p_name TEXT,             -- 'vsom', 'VP-ONT', 'color-primary'
  p_instance_id TEXT,      -- 'baiv', 'w4m', NULL for core
  p_client_id UUID         -- NULL unless client-scoped
) RETURNS JSONB
```

The function loads core config, then progressively merges instance, product, and client overrides using JSONB `||` (deepMerge semantics). This is the **runtime resolution** that the ARCH cascade document (3.1) identifies as a critical gap — once deployed, it operationalises Tiers 2-3 for the first time.

#### 7.6.4 Current State vs Target State

| Dimension | Current (File-Based) | Target (Supabase Unified Registry) |
|---|---|---|
| **Storage** | `ont-registry-index.json` v10.9.1 — ontologies only | `pfc_registry` table — all artifact types |
| **Scope** | 52 ontologies, 5 series, 5 PFI instances | Ontologies + skills + tokens + agents + schemas |
| **Cascade resolution** | Client-side `constrainToInstanceOntologies()` in `emc-composer.js` | Server-side `resolve_artifact_config()` in PostgreSQL |
| **Distribution** | `pfc-release.yml` copies filtered JSON snapshots to PFI triads | Supabase query by subscription — no copies, always current |
| **Access control** | Git private repos + `guard-core.yml` | RLS policies scoped by `pfi_id` + 4-role RBAC |
| **Versioning** | `pfcPin` field in registry (default `"latest"`) | Same concept, database-native |
| **Audit** | Git history | `audit_log` table, append-only, immutable |
| **Agent access** | None — agents read static files | 5-tool MCP server with `PFI_SCOPE` constraint |

#### 7.6.5 Impact on Triad Distribution

The unified registry **transforms** the triad model:

```
TODAY (File-Based):
  Hub: ont-registry-index.json (52 ontologies)
    │
    │ pfc-release.yml copies filtered JSON snapshots
    ▼
  PFI dev: pfc-core/ontology-registry.json (static copy)
    │
    │ promote.yml copies files
    ▼
  PFI test → PFI prod

FUTURE (Supabase Unified Registry):
  Hub: pfc_registry table (all artifact types)
    │
    │ PFI queries by subscription (live, always current)
    │ resolve_artifact_config() returns merged config
    ▼
  PFI dev: reads resolved config via API/MCP
    │
    │ Promotion shifts from "copy files" to "promote config + overrides"
    ▼
  PFI test → PFI prod: same resolved config, gated by environment field
```

As stated in the training guide (doc 4.1): *"The subscription model stays the same. Only the plumbing underneath changes."*

The `hubSpokeConfig.ontologySeries` that drives `pfc-release.yml` today maps directly to `pfc_registry` rows with `scope = 'instance'` and `instance_id = '<pfi-code>'` in the target state. The PFI's declared `ontologySeries` becomes a query filter rather than a CI/CD jq filter.

#### 7.6.6 Impact on Access Controls

The unified registry **unifies** access control across all artifact types:

| Access Path | File-Based (Current) | Unified Registry (Target) |
|---|---|---|
| **Human (browser)** | GitHub repo visibility | Supabase RLS: `pfi_id IN (user_pfi_access)` — same policy for ontologies, skills, tokens |
| **CI/CD pipeline** | `guard-core.yml` blocks `pfc-core/` edits | `pfc_registry` scope field: core artifacts are `SECURITY DEFINER` protected |
| **Agent (MCP)** | N/A | `PFI_SCOPE` env var → `X-PFI-Scope` header → Edge Function enforces scope on `pfc_registry` queries |
| **Third-party API** | N/A | `api_keys.pfi_id` + `permissions[]` array gates read/write per artifact type |
| **Config cascade** | No access control per tier | `resolve_artifact_config()` returns only the merged config the caller's scope permits |

**Critical security property:** The cascade resolution function is `SECURITY DEFINER` — it runs with elevated privileges to merge across scopes, but the caller only receives the resolved result for their scope. A PFI-scoped agent cannot see another PFI's overrides, even though the core config is shared.

#### 7.6.7 Impact on EMC Composition

EMC composition (doc 2.1.1) currently operates on client-side JavaScript (`emc-composer.js`). The unified registry enables **server-side composition** with cascaded access:

```
Client-side (current):
  1. Load all ontology JSON files
  2. constrainToInstanceOntologies() filters by PFI's instanceOntologies list
  3. composeMultiCategory() builds graph from filtered set
  4. All logic in browser, no access control beyond file availability

Server-side (target):
  1. resolve_composed_graph(pfi_code, categories) queries pfc_registry + ontologies
  2. RLS ensures PFI scoping at database layer
  3. resolve_artifact_config() merges EMC scope rules per PFI
  4. Composed graph cached in composed_graphs table (with is_canonical flag)
  5. Agent/API access via MCP tool pfc_export_graph
```

The `composed_graphs` table (migration 005) already has RLS policies that mirror the `ontologies` table — read requires PFI membership, insert requires `pfi-member+`, delete requires `pfi-admin+`.

#### 7.6.8 Implementation Artefacts

| Artefact | Status | Location |
|---|---|---|
| Registry concept & JSON-LD spec | Complete | [BRIEFING-Epic34-Unified-Registry-Skills-Architecture.md](BRIEFING-Epic34-Unified-Registry-Skills-Architecture.md) |
| `ont-registry-index.json` v10.9.1 | Live | `ontology-library/ont-registry-index.json` |
| Migration 001 (5-table schema) | SQL written, not deployed | `supabase/migrations/001_create_schema.sql` |
| Migration 002 (RLS policies) | SQL written, not deployed | `supabase/migrations/002_rls_policies.sql` |
| Migration 003 (API keys) | Spec'd in Proposal | Not yet written — planned Phase 4 step 4.5 |
| Migration 004 (`pfc_registry` + `resolve_artifact_config`) | Spec'd in Briefing + PLAN | Not yet written — planned Phase 4 step 4.4 |
| Migration 005 (GraphQL + views + `resolve_composed_graph`) | SQL written, not deployed | `supabase/migrations/005_graphql_layer.sql` |
| `constrainToInstanceOntologies()` (client-side) | Live | `js/emc-composer.js` line ~1627 |
| `resolve_composed_graph()` (server-side) | SQL written, not deployed | Migration 005 |
| `search_entities()` (cross-ontology search) | SQL written, not deployed | Migration 005 |
| `get_ontology_dependency_graph()` | SQL written, not deployed | Migration 005 |
| 5-tool MCP server | Spec'd | [PROPOSAL-Supabase-Secure-Connections-API-MCP-v1.0.0.md](PROPOSAL-Supabase-Secure-Connections-API-MCP-v1.0.0.md) |
| `registry-ci.yml` (unified validation) | Planned | Not yet written — one pipeline for all artifact types |

#### 7.6.9 Key Design Principles (from doc 1.3)

| Principle | Implementation |
|---|---|
| **One registry** | `pfc_registry` — single table, all artifact types |
| **Quasi-OO cascade** | Core → Instance → Product → Client with inherit/extend/override |
| **On/Off/Customised** | `status: active/inactive` + `override_type` per scope |
| **Same as design-system** | Tokens, skills, ontologies, agents, schemas — identical governance |
| **Config resolution** | `resolve_artifact_config()` merges up the cascade, deepMerge semantics |
| **Claude sees skills** | `.claude/skills` symlinks to `registry/skills/` |
| **One CI/CD pipeline** | Single validation workflow for all artifact types |
| **Three-tier testing** | Local → Haiku → Sonnet cost model for all artifacts |
| **File-first, DB-later** | JSON files in Git (now) → Supabase sync (scale) |

---

### 7.7 Gaps & Future Considerations

| Gap | Current State | Planned Resolution | Document |
|---|---|---|---|
| **Tier 2/3 cascade not operationalised** | EMC defines PFC→PFI (Tier 0→1) but Product→Client (Tier 2→3) has no runtime engine | F19.2-F19.7: composition engine for multi-tier | 3.1 |
| **No runtime scope rule engine** | 7 composition rules are declarative only | Supabase Phase 5 + EMC engine | 2.1.1, 5.1 |
| **Migration 003/004 not written** | `api_keys` and `pfc_registry` tables are spec'd but no SQL files exist | Phase 4 of PLAN-Supabase-JSONB-MVP | 5.1 |
| **Unified `registry-ci.yml` missing** | Ontology validation exists (`validate-ontology.yml`) but no cross-artifact-type pipeline | Single registry CI when artifact types expand beyond ontologies | 1.3 |
| **Work distribution is manual** | Epics/features delegated by conversation, not automation | Programme Distribution Strategy automation | 4.3 |
| **Cross-PFI visibility** | PFI teams cannot see other PFIs' progress | Programme dashboard on AZLAN-1 board | 4.3 |
| **Sovereign deployment** | All current infra is US-hosted | Cloud Vendor Sovereignty strategy: 5 platform configs | 6.1.1 |
| **Agent access to composed graphs** | MCP tools cover CRUD but not live composition | Phase 5: server-side composition + MCP exposure | 5.1, 5.3 |
| **PFI-to-core contribution flow** | `triad-board-sync.yml` syncs within triads only | Bidirectional sync from PFI → core epic | 4.3 |
| **Brand token cascade not connected** | `pfi_instances.brand_config` exists in migration 001 but `resolve_cascaded_config()` doesn't yet extend to it | F49.9 S49.9.2: token bridge (Figma → registry → Supabase) | 2.3.2 |

### 7.8 Reading Order for a New Team Member

For someone joining the project, the recommended reading path:

1. **Start:** [BRIEFING-Epic34-PF-Core-VSOM-Platform-Strategy.md](BRIEFING-Epic34-PF-Core-VSOM-Platform-Strategy.md) — the "why"
2. **Registry:** [BRIEFING-Epic34-Unified-Registry-Skills-Architecture.md](BRIEFING-Epic34-Unified-Registry-Skills-Architecture.md) — the "everything is a registry artifact" principle
3. **Architecture:** [ARCH-PFC-PFI-Product-Client-Graph-Cascade.md](ARCH-PFC-PFI-Product-Client-Graph-Cascade.md) — the 4-tier cascade and gaps
4. **CI/CD:** [TRAINING-PFI-Release-and-Promotion-Guide.md](TRAINING-PFI-Release-and-Promotion-Guide.md) — the "how" (artifact distribution)
5. **Security:** [PROPOSAL-Supabase-Secure-Connections-API-MCP-v1.0.0.md](PROPOSAL-Supabase-Secure-Connections-API-MCP-v1.0.0.md) — the "who can access what"
6. **Delivery:** [PLAN-Supabase-JSONB-MVP-Platform-Phase.md](PLAN-Supabase-JSONB-MVP-Platform-Phase.md) — the "when"
7. **Scale:** [VSOM-Programme-Distribution-Strategy.md](VSOM-Programme-Distribution-Strategy.md) — the "how" (work orchestration)
8. **Sovereignty:** [STRATEGY-Cloud-Vendor-Sovereignty-Multi-Platform-v1.0.0.md](STRATEGY-Cloud-Vendor-Sovereignty-Multi-Platform-v1.0.0.md) — the "where"

---

## Document Statistics

| Category | Count | Total Size |
|---|---|---|
| Epic 34 Briefings + Registry DB Strategy | 5 | ~85K |
| Epic/Feature Briefings | 16 | ~436K |
| Ontology Series Briefings | 3 | ~87K |
| Architecture | 3 | ~70K |
| CI/CD & Triads | 3 | ~53K |
| Supabase & Data Platform | 3 | ~85K |
| Cross-cutting Strategies | 8 | ~200K |
| Plans & Features | 3 | ~22K |
| Neo4j Archive | 10 | ~250K |
| PFI Instance (W4M-WWG) | 5 | ~90K |
| Operational Guides | 1 | ~18K |
| **Total** | **59** | **~1.5M** |

Note: Additional supporting files (test data, dashboards, monitoring playbooks) exist in `PBS/PFI-WWG/` but are not catalogued here as they are operational artifacts rather than strategy/briefing documents.
