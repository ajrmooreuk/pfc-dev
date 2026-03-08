# Programme Outstanding Work Register

**Generated:** 2026-03-07 (refreshed)
**Source:** GitHub Issues (ajrmooreuk/Azlan-EA-AAA) + Project Board Azlan-EA-AAA-2 (#33)
**Scope:** All epics with PBS IDs — open, closed, and backlog
**Sort order:** Priority (P0→P3), then PBS ID alphabetically. Epics → Features → Stories.

> **Epic 61 numbering collision:** Two issues share the "Epic 61" number — #947 (CICD-DevSecOps collecting epic, Section 1) and #876 (Design System Maturity, Section 2). Renumber one at next triage.

---

## Section 1 — P1 Critical-Path Chain (Collecting Epic 61)

Open epics at **P1** priority — now governed by **Epic 61 (#947)** as the collecting epic under PBS ID `PBS-PFC-ARCHITECTURE.CICD-DevSecOps`. Critical-path chain: 58→10A→59→31/53.

**Collecting Epic:** [Epic 61 (#947)](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/947) — `PBS-PFC-ARCHITECTURE.CICD-DevSecOps`
**Briefing:** [BRIEFING-Epic61-PBS-PFC-ARCHITECTURE-CICD-DevSecOps.md](BRIEFING-Epic61-PBS-PFC-ARCHITECTURE-CICD-DevSecOps.md)
**VSOM Master:** [Epic 60 (#859)](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/859)

| Priority | PBS Sub-ID | Epic | Issue | Title | Status |
|----------|------------|------|-------|-------|--------|
| P1 | `PBS-PFC-ARCHITECTURE.CICD-DevSecOps.PFC-Triad` | Epic 58 | [#837](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/837) | PFC-Core Own Triad | F58.1 ✅, F58.2 ✅, F58.3 next |
| P1 | `PBS-PFC-ARCHITECTURE.CICD-DevSecOps.Security-MVP` | Epic 10A | [#127](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/127) | Security MVP — Multi-PFI Foundation | Schema written, not deployed |
| P1 | `PBS-PFC-ARCHITECTURE.CICD-DevSecOps.DB-Cascade` | Epic 59 | [#840](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/840) | Platform Database Architecture | Proposed |
| P1 | `PBS-PFC-ARCHITECTURE.CICD-DevSecOps.CICD-Pipeline` | Epic 31 | [#394](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/394) | Multi-Instance CI/CD Pipeline | Partially implemented |
| P1 | `PBS-PFC-ARCHITECTURE.CICD-DevSecOps.Sovereignty` | Epic 53 | [#775](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/775) | Cloud Vendor Sovereignty | Proposed |
| P1 | `PBS-PFC-ARCHITECTURE.CICD-DevSecOps.Change-Control` | F61.1 | [#946](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/946) | Change Control — Unified CC, Audit & Governance | Candidate |

#### Epic 61 Cross-Cutting Features (3/41 stories done)

| Feature | Issue | Stories | Done | Status |
|---------|-------|---------|------|--------|
| F61.1: Change Control | [#946](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/946) | 8 | 0 | Candidate |
| F61.2: CC Database Layer | [#970](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/970) | 4 | 0 | Blocked (Epic 59) |
| F61.3: CC Reporting | [#971](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/971) | 4 | 0 | Pending |
| F61.4: PBS ID Assignment | [#972](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/972) | 6 | 0 | Pending |
| F61.5: PAT Governance | [#952](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/952) | 4 | 2 | In progress |
| F61.6: Naming Enforcement | [#962](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/962) | 5 | 0 | Pending |
| F60.1: VSOM Master Briefing | [#860](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/860) | 4 | 1 | In progress |
| F60.2: PFI-CICD Doc Refresh | [#861](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/861) | 6 | 0 | Pending |
| F60.3: Doc Governance | [#862](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/862) | 3 | 0 | Pending |

---

## Section 2 — P2 Open Epics (Sorted by PBS ID)

All open epics at **P2** priority, sorted alphabetically by PBS ID. Epics → Features → Stories.

---

### `PBS-ADMIN` | [Epic 11 #86](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/86) — Admin-Cleanup — Repo Housekeeping

Legacy admin tasks. Feature/story details in epic body.

---

### `PBS-ARCH-PFC-PAAS` | [Epic 56 #834](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/834) — Strategy-to-Build Pipeline

VE→EFS→PPM→Skeleton→Component Library→Build Graph→Supabase→GitHub Triad. 10 features, all open.

| Feature | Issue |
|---------|-------|
| F56.1: Strategy Briefing Triage | (inline) |
| F56.2: VE-to-EFS Skill Bridge | (inline) |
| F56.3: EFS-to-PPM Binding | (inline) |
| F56.4: EFS-to-Skeleton Zone | (inline) |
| F56.5: Component Library | (inline) |
| F56.6: Skeleton Framework Ext | (inline) |
| F56.7: Build Graph Engine | (inline) |
| F56.8: Supabase Graph Layer | (inline) |
| F56.9: GitHub Triad Automation | (inline) |
| F56.10: W4M-WWG PoC | (inline) |

---

### `PBS-MISC` | [Epic 57 #835](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/835) — MISC Clean-Up

Rolled-forward items. F54.1 ([#823](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/823)) — L6S Skills & Ontology Extensions approved 2026-03-04.

---

### `PBS-PFC-ARCH.APP-OAA-VIZ-WB-MD` | [Epic 9J #150](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/150) — Mermaid Panel

File loading, registry & library integration. F9J.4 complete; remaining features TBD.

---

### `PBS-PFC-ARCH.ONT-LAYER` | [Epic 19 #196](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/196) — PFI Graph-Scope Rules

5/7 features complete. Composition engine (F19.6) and visualiser integration (F19.7) remain.
**Briefing:** [BRIEFING-Epic19](PBS/STRATEGY/BRIEFING-Epic19-Phase3-4-and-Beyond.md)

---

### `PBS-PFC-ONT-MNGT` | [Epic 21 #270](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/270) — OAA v7/v8 Agent Architecture & Kinetic Layer

13/23 features complete. 10 v8 features deferred (kinetic layer). F21.23 added for live ONT CRUD toolkit.
**Briefing:** [ARCH-OAA-V7.md](PBS/TOOLS/ontology-visualiser/ARCH-OAA-V7.md)

#### v8 Features (deferred kinetic layer)

| Feature | Issue |
|---------|-------|
| F21.1: Action Types Schema | [#271](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/271) |
| F21.2: Interface Types | [#272](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/272) |
| F21.3: Agent-ONT Scope Binding | [#273](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/273) |
| F21.4: Derived Properties | [#274](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/274) |
| F21.5: Compliance Gates G15-G19 | [#275](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/275) |
| F21.6: Visualiser Kinetic Integration | [#276](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/276) |
| F21.7: E2E Agent Orchestration | [#277](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/277) |
| F21.8: FDOE | [#278](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/278) |
| F21.17: Agent Conflict Resolution | [#590](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/590) |
| F21.20: Agent Audit Trail | [#598](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/598) |

#### F21.23: Live OAA v7 Skill Invocation — ONT CRUD Toolkit

**Issue:** [F21.23 #877](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/877) | **Cross-ref:** [Epic 46a #683](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/683)
Live skill button replacing copy-paste prompt. 4 scoped modes: Add New ONT, Modify, Deprecate, Supersede.
Registry write-back to `ont-registry-index.json` via File System Access API.

| Story | Issue | Summary |
|-------|-------|---------|
| S21.23.1: Skill Button + Scope Selector UI | [#878](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/878) | Nav action `runOAAv7Skill` with colon-parameterised dropdown, context summary modal. |
| S21.23.2: Add New ONT Flow | [#879](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/879) | Series/namespace prompt → OAA v7 scaffold → skill invocation → authoring mode. |
| S21.23.3: Modify ONT Flow | [#880](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/880) | Current ONT + validation failures + user intent → skill → diff → accept/reject → bump. |
| S21.23.4: Deprecate / Supersede Flow | [#881](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/881) | Lifecycle status change, G22 impact analysis, 6-month grace or immediate. |
| S21.23.5: Registry Write-Back Engine | [#882](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/882) | File System Access API write with merge, version increment, audit fields. |

---

### `PBS-PFC-ONT-MNGT.GRC-ONT` | [Epic 30 #370](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/370) — GRC Series Architecture

1/7 features complete (F30.1). GRC-FW-ONT v3.0.0 hub delivered. 6 remaining features.

| Feature | Stories | Issue |
|---------|---------|-------|
| F30.2: ERM-ONT | 5 | (inline in epic) |
| F30.3: COMP-FW-ONT + SEC-FW-ONT | 5 | [#475](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/475) |
| F30.4: AI-GOV-ONT | 5 | [#476](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/476) |
| F30.5: RES-ONT | 5 | [#477](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/477) |
| F30.6: Cross-Series Integration | 6 | [#478](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/478) |
| F30.12: OSCAL Architecture | 5 | [#513](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/513) |

---

### `PBS-PFC-ONT-MNGT.GRC-COMPLIANCE-ONT` | [Epic 20 #269](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/269) — UK Public Sector Compliance Auditing

CAF & DSPT assessment engine. Domain gates G9-G14. 4 features, 15 stories.

| Feature | Stories | Issue |
|---------|---------|-------|
| F20.1: CAF Assessment | S20.1.1–S20.1.4 (4) | [#337](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/337) |
| F20.2: DSPT Assessment | S20.2.1–S20.2.4 (4) | [#342](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/342) |
| F20.3: Compliance Dashboard | S20.3.1–S20.3.4 (4) | [#347](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/347) |
| F20.4: CAF Profile Mgmt | S20.4.1–S20.4.3 (3) | [#352](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/352) |

---

### `PBS-PFC-ONT-MNGT.NUT-ONT` | [Epic 50 #748](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/748) — NUT-ONT — Nutrition Coaching & VHF

0/5 features. OAA v7 conversion, registry integration, VE chain connection for VHF PFI instance.

| Feature | Issue |
|---------|-------|
| F50.1: OAA v7 Conversion | [#749](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/749) |
| F50.2: Registry Integration | [#750](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/750) |
| F50.3: OAA v7 Validation | [#751](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/751) |
| F50.4: Instance Data & EMC | [#752](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/752) |
| F50.5: VP & RRR Chain | [#753](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/753) |

---

### `PBS-PFC-ONT-MNGT.RMF-AI` | [Epic 37 #517](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/517) — AI-Enhanced Threat Modelling

Dynamic GRC risk intelligence. 5 features, ~24 stories.

| Feature | Stories |
|---------|---------|
| F37.1: ThreatModel ONT | S37.1.1–S37.1.6 (6) |
| F37.2: Cyber-Risk-ONT Bridge | S37.2.1–S37.2.4 (4) |
| F37.3: Agent Skills | S37.3.1–S37.3.6 (6) |
| F37.4: Threat Visualisation | S37.4.1–S37.4.4 (4) |
| F37.5: EA + Azure + OSCAL | S37.5.1–S37.5.4 (4) |

---

### `PBS-PFC-ONT-MNGT.PE-EA-AZURE-ALZ` | [Epic 33 #505](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/505) — Azure Graph & Ontology-Driven Landing Zone

IaC blueprint architecture for AIRL-CAF-AzA. Feature details in epic body.
**Briefing:** [BRIEFING-EA-Architecture](PBS/STRATEGY/BRIEFING-EA-Architecture-Tiered-Schematic.md)

---

### `PBS-PE-E2E` | [Epic 10 #84](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/84) — PE Process-Engineer E2E

Program Manager & PF-Manager process engineering. Feature details in epic body.

---

### `PBS-PFC-ARCH-APP` | [Epic 47 #700](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/700) — PFC Context Assistant

RBAC-filtered graph traversal, adaptive PFI integration, content graph surfing. 5 features.
**Briefing:** [BRIEFING-Context-Assistant](PBS/STRATEGY/BRIEFING-PFC-Context-Assistant-Universal-PBS-Strategy.md)

| Feature | Issue |
|---------|-------|
| F47.1: Context Engine Core | [#693](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/693) |
| F47.2: RBAC + Role Adaptation | [#694](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/694) |
| F47.3: Adaptive PFI Integration | [#695](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/695) |
| F47.4: Context Assistant UI | [#696](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/696) |
| F47.5: Content Graph Surfing | [#697](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/697) |

---

### `PBS-PFC-ARCH-DS-LAYER` | [Epic 61 #876](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/876) — Design System Maturity

Token gap remediation, auto-fill rules, component tier population, slide deck generation. F61.5/F61.6 blocked on Epic 59.
**Briefing:** [BRIEFING-Epic61](PBS/STRATEGY/BRIEFING-Epic61-Design-System-Maturity-Token-Gap-Remediation.md)

| Feature | Stories | Notes |
|---------|---------|-------|
| F61.1: Token Gap Analyser | S61.1.1–S61.1.8 (8) | |
| F61.2: Auto-Fill Per Brand | S61.2.1–S61.2.8 (8) | |
| F61.3: Component Tokens | S61.3.1–S61.3.7 (7) | |
| F61.4: VHF Brand Standardisation | S61.4.1–S61.4.5 (5) | |
| F61.5: Supabase Token Storage | S61.5.1–S61.5.4 (4) | Blocked on Epic 59 |
| F61.6: Agent Skills | S61.6.1–S61.6.4 (4) | Blocked on Epic 59 |
| F61.7: PPTX Slide Deck Gen | S61.7.1–S61.7.4 (4) | |

---

### `PBS-PFC-ARCH-DS-LAYER.DIRECTOR` | [Epic 8 #80](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/80) — Design-Director — DS-ONT + Figma + Supabase

13/15 features complete. 2 remaining: F8.2 (Token Storage), F8.5 (Agentic Design Workflow).
**Briefing:** [BRIEFING-Design-Director](PBS/STRATEGY/BRIEFING-Design-Director-Cascading-Design-Governance-Strategy.md)

---

### `PBS-PFC-ARCH-DS-LAYER.FUTURE` | [Epic 9 #81](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/81) — Future Design-System Capabilities

Figma Make kits, pre-release beta, FigJam collaboration, W3C design tokens. 4 features, all open.

---

### `PBS-PFC-ARCH-DS-LAYER.WWG` | [Epic 44 #631](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/631) — WWG Design System — MCP Token Re-Extraction

4 features: Figma re-extraction, triad population, component audit, registry validation. All open.

---

### `PBS-PFC-ARCH-PE-DOCS` | [Epic 60 #859](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/859) — Unified Platform Delivery Docs

VSOM master briefing consolidation + PFI-CICD doc refresh. 3 features, 1/13 stories done.
**Briefing:** [BRIEFING-Epic60](PBS/STRATEGY/BRIEFING-Epic60-VSOM-Platform-Delivery-Infrastructure.md)

| Feature | Stories (remaining) | Issue |
|---------|---------------------|-------|
| F60.1: VSOM Master Briefing | S60.1.2–S60.1.4 (3) | [#860](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/860) |
| F60.2: PFI-CICD Doc Refresh | S60.2.1–S60.2.6 (6) | [#861](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/861), [S60.2.1 #867](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/867)–[S60.2.6 #872](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/872) |
| F60.3: Doc Governance | S60.3.1–S60.3.3 (3) | [#862](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/862), [S60.3.1 #873](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/873)–[S60.3.3 #875](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/875) |

---

### `PBS-PFC-ARCH-PE.PPM` | [Epic 55 #836](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/836) — Federated Portfolio Reporting

Daily rolling status, epic mirroring, registry health, backlog mgmt, workbench dashboard. 7 features, all open.
**Briefing:** [BRIEFING-Epic55](PBS/STRATEGY/BRIEFING-Epic55-Cross-Project-Portfolio-Reporting-Strategy.md)

| Feature | Issue |
|---------|-------|
| F55.1: Daily Rolling Status | (inline) |
| F55.2: PFC→PFI Epic Mirroring | (inline) |
| F55.3: Registry Health Cadences | (inline) |
| F55.4: Portfolio Backlog Mgmt | (inline) |
| F55.5: Roadmap Rollup | (inline) |
| F55.6: Change Control & Audit | (inline) |
| F55.7: Workbench Dashboard | (inline) |

---

### `PBS-PFC-ARCH-TDD-AUTO.Playwright` | [Epic 22a #280](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/280) — PFC-TDD UI/UX Test Automation

Playwright test framework for the visualiser. 9 features, ~36 stories.

| Feature | Stories | Story Issues |
|---------|---------|--------------|
| F22.1: Playwright Setup | S22.1.1–S22.1.4 (4) | [#290](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/290)–[#293](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/293) |
| F22.2: Page Object Model | S22.2.1–S22.2.4 (4) | [#294](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/294)–[#297](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/297) |
| F22.3: Core Interaction Tests | S22.3.1–S22.3.5 (5) | [#298](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/298)–[#302](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/302) |
| F22.4: Parameterised Matrix | S22.4.1–S22.4.4 (4) | [#303](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/303)–[#306](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/306) |
| F22.5: Visual Snapshots | S22.5.1–S22.5.5 (5) | [#307](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/307)–[#311](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/311) |
| F22.6: Brand Context Matrix | S22.6.1–S22.6.4 (4) | [#312](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/312)–[#315](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/315) |
| F22.7: Edit/Diff/Mindmap Tests | S22.7.1–S22.7.5 (5) | [#316](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/316)–[#320](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/320) |
| F22.8: GitHub Actions CI Gate | S22.8.1–S22.8.4 (4) | [#321](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/321)–[#324](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/324) |
| F22.9: MCP Playwright + Claude | S22.9.1–S22.9.4 (4) | [#325](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/325)–[#328](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/328) |

---

### `PBS-PFC-ARCH-UNIFIED-REGISTRY` | [Epic 46a #683](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/683) — PFC-ONT Unified Registry & Context Assistant

0/11 features. Unified registry across 6 asset types.
**Briefing:** [BRIEFING-PFC-Context-Assistant](PBS/STRATEGY/BRIEFING-PFC-Context-Assistant-Universal-PBS-Strategy.md), [BRIEFING-Unified-Registry-Database](PBS/STRATEGY/BRIEFING-Unified-Registry-Database-Strategy.md)

| Feature | Issue |
|---------|-------|
| F46.1: Ontology Register Enhancement | [#684](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/684) |
| F46.2: Docs Register | [#685](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/685) |
| F46.3: Skills Register | [#686](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/686) |
| F46.4: Agent Register | [#687](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/687) |
| F46.5: Design System Register | [#688](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/688) |
| F46.6: Process Register | [#689](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/689) |
| F46.7: PFC-ONT Ecosystem Ontology | [#690](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/690) |
| F46.8: Universal PBS Alignment | [#691](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/691) |
| F46.9: Registry Cascade Validation | [#692](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/692) |
| F46.10: GitHub Workflow Standardisation | [#698](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/698) |
| F46.11: Doc Lifecycle PE Process | [#699](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/699) |

---

### `PBS-PFC-VE-VSOM-SA` | [Epic 36 #524](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/524) — VSOM Strategy Audit & Platform Architecture

Strategy inventory, unified map, cross-epic dependencies, roadmap consolidation, JSONB PoC. ~6 features.

| Feature | Issue |
|---------|-------|
| F36.1: Strategy Inventory | [#525](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/525) |
| F36.2: Unified Strategy Map | [#526](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/526) |
| F36.3: Cross-Epic Dependency Graph | [#527](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/527) |
| F36.4: Roadmap Consolidation | [#528](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/528) |
| F36.5: VSOM Metrics Framework | [#529](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/529) |
| F36.6: Briefing Integration | [#530](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/530) |

---

### `PBS-PFC-VE-VSOM-SA.8` | [Epic 38 #560](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/560) — Strategy Analysis Engine

SA pattern pipeline: Porter's 5 Forces, SWOT, Ansoff, promotion gates, Bayesian reasoning. 8 features.

| Feature | Stories | Issue |
|---------|---------|-------|
| F38.0: VSOM-SA Adaptive Graph | S38.0.1–S38.0.4 (4) | [#561](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/561) |
| F38.1–F38.7 | ~30 stories | (inline in epic) |

---

### `PBS-PFI-AIRL` | [Epic 14 #89](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/89) — PFI-AIRL-EA-AIR

Azure AI Readiness instance. Feature/story details in epic body.
**Briefing:** [BRIEFING-AIRL](PBS/STRATEGY/BRIEFING-AIRL-AI-Audit-Services-Strategy-OKR-PMF-Worked-Example.md), [PFI-AIRL/](PBS/STRATEGY/PFI-AIRL/)

---

### `PBS-PFI-AIRL-RMF-CAF` | [Epic 29 #356](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/356) — VSOM-to-Value Proposition — NCSC CAF

3 features: ICP segments, VP instances, VSOM-CAF strategy bridge. ~10 stories.

| Feature | Stories | Issue |
|---------|---------|-------|
| F29.1: NCSC CAF ICP Segments | S29.1.1–S29.1.3 (3) | [#357](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/357) |
| F29.2: VP Instance Data | S29.2.1–S29.2.4 (4) | [#361](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/361) |
| F29.3: VSOM-CAF Bridge | S29.3.1–S29.3.3 (3) | [#366](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/366) |

---

### `PBS-PFI-BAIV` | [Epic 12 #87](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/87) — PFI-BAIV-AIV-Build

BAIV MarTech instance build. Feature/story details in epic body.

---

### `PBS-PFI-DICE` | [Epic 46b #668](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/668) — PFI-PC-DICE FloodGraph AI

Construction flood risk assessment platform. Feature details TBD.

---

### `PBS-PFI-ANTQ-CANDIDATE` | [Epic 62 #948](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/948) — PFC-PFI [Candidate-Antiques-SME-Value-Insure-Sell] — DACS-ONT 20C Design Classification

Candidate PFI instance. AI-augmented 20C design/arts classification, insurance valuation via DACS-ONT + ANTIQUES-ONT. VE Skill Chain leads all features. Features and stories TBD.

---

### `PBS-PFI-W4M-DW-FINSERVICES` | New Epic — PFI-DW-FinServices Enquiry

**Repo:** `ajrmooreuk/pfi-w4m-dev`
W4M Dev — Financial Services discovery/enquiry workstream. Features and stories TBD. No GitHub issue created yet.

---

### `PBS-PKG-DIST` | [Epic 6 #58](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/58) — Package & Distribution

npm, CLI, Docker packaging. F6.1–F6.3 open; F6.4 complete.

---

### `PBS-VENN-OVERLAP` | [Epic 9I #148](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/148) — Venn Overlap & Inheritance Analysis

Ontology intersection visualisation. Feature/story details TBD.

---

## Section 3 — Closed Epics

Completed epics, ordered by issue number.

| Epic | Issue | Title |
|------|-------|-------|
| Epic (unnumbered) | [#32](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/32) | Visualiser v3 — Graph Rollup, Drill-Through & Database Integration |
| Epic (unnumbered) | [#53](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/53) | OAA 5.0.0 Verification — Visual Gate Compliance |
| Epic (unnumbered) | [#54](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/54) | Sub-Ontology Connections — Multi-Ontology & Library View |
| Epic (unnumbered) | [#55](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/55) | Enhanced Audit & Validation — Schema & Completeness |
| Epic (unnumbered) | [#56](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/56) | Export & Reporting — Formats, Diffs & CI Integration |
| Epic (unnumbered) | [#57](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/57) | Multi-Source Loading — GitHub, URL & Local Storage |
| Epic 7 | [#79](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/79) | Ontology Authoring, Composition & Instances |
| Epic 8B | [#85](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/85) | DJM-DESIGN-SYS — DS Asset Preparation |
| Epic 13 | [#88](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/88) | PFI-W4M-PF-Core and Client Sub-Instances |
| Epic 15 | [#90](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/90) | PFI-W4M-EA-Togaf |
| Epic 16 | [#91](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/91) | PFI-RCS-W4M-AIR-Collab-MS-Azure-EA-Assess |
| Epic 9C | [#136](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/136) | Refine Ontology Series |
| Epic 9D | [#138](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/138) | PFI Graph Lifecycle Architecture |
| Epic 9E | [#139](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/139) | PFI Instance Selection & Core/Instance View |
| Epic 9F | [#140](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/140) | PFC Requirement-Scoped Graph Composition |
| Epic 17 | [#141](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/141) | PF-Core-[W4M-EA] — Engineering EA into PF Core |
| Epic 9G | [#146](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/146) | Strategic Lens VESM BSC Role Authority |
| Epic 9H | [#147](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/147) | Client-Org and Vertical Market Configuration |
| Epic 9K | [#155](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/155) | Packaged GitHub Workflow — Template Repo, Reusable Actions & Claude Plugin |
| Epic 18 | [#190](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/190) | VSOM-SC — Strategy Communication Sub-Series |
| Epic 22b | [#330](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/330) | Industry Physics Engine (Porter's 5 Forces) |
| Epic 23 | [#331](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/331) | Capability-Market Fit — SWOT Ontology Mapping & Gap Analysis |
| Epic 24 | [#332](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/332) | Growth Vector Simulation — Ansoff Matrix & RAROI Scoring |
| Epic 25 | [#333](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/333) | Dynamic Agenda Controller — Strategy Pivot Automation |
| Epic 26 | [#334](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/334) | Semantic Foundational Engineering — Atomic Proposition Decomposition |
| Epic 27 | [#335](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/335) | Probabilistic State Simulation — Bayesian-Deductive What-If Engine |
| Epic 28 | [#336](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/336) | Strategic Prioritization & Pivot Logic |
| Epic 32 | [#479](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/479) | Cross-Repo Programme Visibility & Roadmap Linkage |
| Epic 34 | [#514](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/514) | PF-Core Graph-Based Agentic Platform Strategy — Graphing Workbench |
| Epic 34 | [#518](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/518) | PF-Core Graph-Based Agentic Platform — VSOM Strategy & Architecture |
| Epic 39 | [#562](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/562) | PFI Strategy Cascade — Artifact Migration & Triad Activation |
| Epic 39 | [#569](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/569) | PFI Strategy Cascade — Instance Activation & Artifact Distribution |
| Epic 40 | [#577](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/577) | Graphing Workbench Evolution — ONT Visualiser to 4-Layer Workbench |
| Epic 41 | [#599](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/599) | OFM-ONT — Order Fulfilment Management Ontology |
| Epic 42 | [#608](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/608) | CI/CD Training & OAA v7 Migration Pipeline |
| Epic 43 | [#609](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/609) | DS-ONT Component Design System |
| Epic 45 | [#634](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/634) | PFI-W4M-WWG Supply-Demand Graph — E2E Procurement to Customer Fulfilment |
| Epic 48 | [#703](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/703) | VE Process Chain Skills — E2E Value Engineering Pipeline |
| Epic 49 | [#747](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/747) | VSOM Skilled Application Planner |
| Epic 51 | [#754](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/754) | FairSlice — Platform Economics & Revenue Distribution |
| Epic 52 | [#755](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/755) | DELTA Process — Industry-Agnostic Discovery & Gap Analysis |
| Epic 54 | [#822](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/822) | PE-L6S — Lean Six Sigma Skills & PPM Project Selection |

---

## Totals

| Metric | Count |
|--------|-------|
| P1 epics — backlog/review (Section 1) | 5 |
| P2 epics — open (Section 2) | 31 |
| Total open epics | 36 |
| Closed epics (Section 3) | 42 |
| Epics with proper PBS ID | 31 |
| Epics needing PBS reassignment | 5 |
| Epic numbering collisions | 1 (Epic 61: #947 vs #876) |
