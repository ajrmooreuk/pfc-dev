# PFI-AIRL-GRC-STRAT: Azure Skills WAF/CAF/Cyber Assessment Strategy

**Product Code:** PFI-AIRL-GRC-STRAT
**Version:** v1.0.0
**Date:** 2026-03-13
**Status:** Active
**Epic:** [Epic 74 (#1074)](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/1074) — PFI-AIRL-AZS
**Author:** PFC Platform Team

---

## 1. Executive Summary

This strategy defines how Microsoft's open-source [`azure-skills`](https://github.com/microsoft/azure-skills) plugin — a 21-skill MCP execution layer for Azure — integrates with the PFC ontology-driven assessment methodology to deliver automated WAF, CAF, and cyber security assessments for AIRL, BAIV, and W4M-RCS client engagements.

**Strategic thesis:** Microsoft provides the execution muscle (live Azure data extraction via MCP); our ontology stack provides the assessment brain (cross-framework mapping, scoring, evidence packaging). Together they deliver automated, evidence-based assessments at scale that no competitor can replicate — because no one else has the ontology intelligence layer.

---

## 2. Strategic Context

### 2.1 The Assessment Market Gap

Azure assessments today are either:
- **Manual:** consultants run KQL queries, review Azure Advisor, compile spreadsheets — slow, expensive, inconsistent
- **Vendor tools:** Microsoft Assessment tools cover WAF pillars but lack cross-framework mapping (WAF ↔ CAF ↔ NCSC CAF ↔ MCSB) and business value linkage
- **Point solutions:** Defender for Cloud scores, but doesn't connect to CAF readiness or NCSC cyber outcomes

**Our differentiator:** An ontology-driven pipeline that maps findings across all four frameworks simultaneously, links them to business value via VE × RMF (JP-VE-RMF-001), and delivers packaged evidence for each assessment domain.

### 2.2 What Microsoft Azure Skills Brings

| Component | Capability | Assessment Value |
|---|---|---|
| **21 Azure Skills** | Agent-executable Azure workflows, decision trees, guardrails | Teaches our agents how Azure work gets done — replaces manual runbook knowledge |
| **Azure MCP Server** | 200+ structured tools across 40+ Azure services | Live read/write access to Azure resources, policy, compliance, RBAC, monitoring |
| **Foundry MCP** | Microsoft Foundry AI model discovery, deployments, agents | AI workload assessment capability for EA-AI-ONT aligned evaluations |

### 2.3 What We Already Have

| PFC Asset | Role | Gap Azure Skills Fills |
|---|---|---|
| EA-MSFT-ONT v1.1.0 | WAFPillar, AzureLandingZone, AzureResource entities | No live data — azure-skills provides real-time Azure tenant interrogation |
| MCSB-ONT v2.0.0 | Microsoft Cloud Security Benchmark controls | No automated evidence collection — azure-compliance provides live compliance state |
| NCSC-CAF-ONT | CAF outcome definitions and control mapping | No automated readiness assessment — azure-prepare/validate provides live validation |
| AZALZ-ONT | Landing zone policy definitions | No live healthcheck — azure-validate/resource-lookup provides live LZ state |
| GRC-FW-ONT v3.0.0 | Governance control framework | No automated control evidence — azure-diagnostics/observability provides live monitoring data |
| F68.8 ALZ Snapshot Audit | KQL-based landing zone audit artefacts | Manual KQL execution — azure-kusto + azure-resource-lookup automates this |

---

## 3. Assessment Domains & Methodology

### 3.1 WAF Pillar Assessment (F74.2)

**Objective:** Score each WAF pillar (Reliability, Security, Cost Optimization, Operational Excellence, Performance Efficiency) using live Azure data mapped to EA-MSFT-ONT:WAFPillar entities.

**Pipeline:**
1. `azure-validate` → extracts architecture decisions, resource configurations
2. `azure-compliance` → pulls Azure Policy compliance state per pillar
3. `azure-cost-optimization` → cost posture for Cost Optimization pillar
4. `azure-compute` → right-sizing data for Performance Efficiency pillar
5. `azure-observability` → monitoring coverage for Operational Excellence pillar
6. Results → EA-MSFT-ONT:WAFPillar scoring model → maturity score per pillar
7. Cross-reference → MCSB-ONT for Security pillar depth

**Deliverable:** WAF Assessment Report with per-pillar maturity scores, findings, and prioritised recommendations.

### 3.2 CAF Readiness Assessment (F74.3)

**Objective:** Evaluate Cloud Adoption Framework readiness using NCSC-CAF-ONT outcome mapping and live Azure environment validation.

**Pipeline:**
1. `azure-prepare` → environment readiness validation, prerequisite checks
2. `azure-compliance` → governance and policy posture
3. `azure-cloud-migrate` → migration readiness for workload assessment
4. `azure-deploy` → deployment capability validation
5. `azure-resource-visualizer` → current estate topology
6. Results → NCSC-CAF-ONT outcome mapping → readiness score per CAF domain
7. Cross-reference → GRC-FW-ONT governance controls

**Deliverable:** CAF Readiness Report with domain scores, gap analysis, and adoption roadmap.

### 3.3 Cyber & Security Posture Assessment (F74.4)

**Objective:** Assess security posture against MCSB v2.0.0 controls and NCSC CAF cyber outcomes using live compliance, RBAC, and diagnostic data.

**Pipeline:**
1. `azure-compliance` → Azure Policy compliance state, Defender for Cloud posture
2. `azure-rbac` → identity and access management audit
3. `azure-diagnostics` → security monitoring and alerting coverage
4. `azure-observability` → logging and telemetry completeness
5. `azure-storage` → data protection and encryption posture
6. `entra-app-registration` → Entra ID application security
7. `azure-ai` / `azure-aigateway` → AI-specific security controls (EA-AI-ONT alignment)
8. Results → MCSB-ONT control scoring + GRC-FW-ONT governance assessment + NCSC-CAF-ONT cyber outcomes
9. Cross-reference → F40.40 OWASP skill family for application-layer security

**Deliverable:** Cyber Posture Report with MCSB control scores, NCSC CAF cyber outcome mapping, and remediation priorities.

### 3.4 Azure Landing Zone Healthcheck (F74.5)

**Objective:** Automated healthcheck of deployed Azure Landing Zones against AZALZ-ONT policy definitions and Epic 33 IaC blueprint architecture.

**Pipeline:**
1. `azure-validate` → landing zone configuration validation
2. `azure-resource-lookup` → resource inventory and topology discovery
3. `azure-resource-visualizer` → visual topology for stakeholder reporting
4. `azure-compliance` → policy assignment compliance state
5. `azure-rbac` → RBAC binding validation against LZ design
6. `azure-kusto` → KQL evidence queries (replaces manual F68.8 approach)
7. Results → AZALZ-ONT compliance mapping → healthcheck scorecard
8. Drift detection → compare live state against Epic 33 Bicep-defined desired state

**Deliverable:** ALZ Healthcheck Report with compliance scorecard, drift findings, and remediation tasks.

---

## 4. Cross-Framework Assessment Intelligence

### 4.1 The Unique Value: Multi-Framework Correlation

No vendor tool maps findings across WAF, CAF, NCSC CAF, and MCSB simultaneously. Our ontology graph enables:

```text
Single Azure Finding (e.g. "NSG allows inbound 3389")
       │
  ├─→ WAF:Security → "Network security not hardened"
  ├─→ CAF:Govern → "Network governance gap"
  ├─→ NCSC CAF:B4 → "Network security controls insufficient"
  ├─→ MCSB:NS-1 → "Network security boundary not established"
  └─→ VE:Risk → "Lateral movement exposure" → RRR:Requirement → "NSG hardening"
```

### 4.2 Ontology Join Patterns

| Join Pattern | From → To | Purpose |
|---|---|---|
| JP-VE-RMF-001 | vp:Problem → rrr:Risk | Assessment finding → business risk |
| JP-VE-RMF-001 | vp:Solution → rrr:Requirement | Remediation → compliance requirement |
| JP-VE-RMF-001 | vp:Benefit → rrr:Result | Improvement → measurable outcome |
| JP-WAF-MCSB (new) | WAFPillar:Security → MCSB:Control | WAF pillar → specific security controls |
| JP-CAF-NCSC (new) | CAF:Domain → NCSC-CAF:Outcome | CAF readiness → NCSC cyber outcomes |

---

## 5. Agentic Pipeline Architecture

### 5.1 Execution Model

```text
┌─────────────────────────────────┐
│  Claude Code + Azure Skills MCP  │
│  (Agent execution environment)   │
├─────────────────────────────────┤
│  azure-skills (21 skills)        │ ← Decision trees, guardrails
│  Azure MCP Server (200+ tools)   │ ← Live Azure API access
│  Foundry MCP                     │ ← AI workload assessment
└──────────────┬──────────────────┘
               │ Structured findings
               ▼
┌─────────────────────────────────┐
│  PFC Assessment Intelligence     │
├─────────────────────────────────┤
│  EMC Composer                    │ ← Ontology graph composition
│  EA-MSFT-ONT + MCSB-ONT +       │
│  NCSC-CAF-ONT + AZALZ-ONT +     │
│  GRC-FW-ONT                      │ ← Cross-framework mapping
│  JP-VE-RMF-001                   │ ← Risk-to-value bridge
└──────────────┬──────────────────┘
               │ Scored, correlated findings
               ▼
┌─────────────────────────────────┐
│  W4M-RCS Market Delivery         │
├─────────────────────────────────┤
│  WAF Assessment Report           │
│  CAF Readiness Report            │
│  Cyber Posture Report            │
│  ALZ Healthcheck Report          │
│  Executive Summary               │
└─────────────────────────────────┘
```

### 5.2 Integration Points

| Integration | Source | Target | Mechanism |
|---|---|---|---|
| Azure MCP → PFC | Azure MCP Server | F71.3 MCP Registry | MCP server registration + connection config |
| azure-skills → Ontology | Skill output (JSON) | EMC Composer input | Structured finding → ontology entity mapping |
| Assessment → Report | Scored findings | W4M-RCS templates | SlideDeck / document generation |
| Assessment → Database | Scored findings | Supabase (Epic 59) | JSONB graph storage for trend analysis |

---

## 6. PE DMAIC, DELTA & RMF Assessment Methodology

### 6.1 DELTA-Driven Assessment Discovery

The DELTA Discovery process (Epic 52) structures the assessment engagement lifecycle:

| DELTA Phase | Assessment Application | azure-skills Used |
|---|---|---|
| **D — Discover** | Tenant discovery, resource inventory, stakeholder context | azure-resource-lookup, azure-prepare |
| **E — Evaluate** | Current-state assessment across WAF/CAF/Cyber/ALZ domains | azure-validate, azure-compliance |
| **L — Leverage** | Map findings to ontology entities, cross-framework correlation, quick wins | EMC Composer + ontology graph |
| **T — Transform** | Project current state → future state, remediation roadmap | azure-deploy, azure-cost-optimization |
| **A — Assure** | Continuous monitoring baselines, SPC control points, trend tracking | azure-observability, azure-compliance |

### 6.2 DMAIC Assessment Improvement Cycle

PE DMAIC (Epic 54) structures each assessment domain as a measurable improvement project:

| DMAIC Phase | Assessment Application | Output |
|---|---|---|
| **Define** | Scope domain, define CTQ metrics from ontology (VOC → client requirements) | Assessment scope, success criteria |
| **Measure** | Extract current-state data from Azure tenant — baseline metrics | Baseline maturity scores |
| **Analyse** | Cross-framework correlation, root cause analysis, gap identification | Finding graph, systemic gaps |
| **Improve** | Future-state projection, remediation recommendations, IaC alignment | Phased roadmap, projected scores |
| **Control** | SPC monitoring, continuous compliance, drift detection | Control charts, alert thresholds |

### 6.3 INS ALZ Snapshot Audit — Architect Assessment Pattern

The INS-origin ALZ Snapshot Audit (17 artefacts) provides the proven pattern for how the architect extracts, assesses, reviews, scores, and projects. Azure Skills evolves this from manual to fully agentic:

| Audit Phase | INS Artefact | Azure Skills Enhancement |
|---|---|---|
| **Extract** | Tenant-Discovery, Query-Executor scripts | `azure-resource-lookup` + `azure-kusto` replace manual scripts |
| **Assess** | KQL-Queries, Compliance-Mapping JSON | `azure-validate` + `azure-compliance` provide live assessment |
| **Review** | OAA-Ontology, Ontology-Readable | EMC Composer maps findings to ontology graph |
| **Score** | Azure-Workbook | EA-MSFT-ONT:WAFPillar + MCSB-ONT maturity scoring |
| **Project** | Vision-Strategy-Plan | DELTA T-phase: current → future state via VSOM adaptive graph |
| **Assure** | Full-Auto script | DMAIC Control: SPC baselines, recurring azure-compliance checks |

### 6.4 RMF Risk Assessment Integration

Every assessment finding must be formally risk-assessed via RMF-IS27005-ONT before entering the remediation roadmap:

```text
azure-skills Finding
       │
  Ontology Mapping (EMC Composer)
       │
  RMF Risk Assessment (RMF-IS27005-ONT)
  ├─ Impact Classification
  ├─ Likelihood Assessment
  ├─ Risk Rating (Critical / High / Medium / Low)
  └─ Control Effectiveness (MCSB-ONT alignment)
       │
  VE × RMF Bridge (JP-VE-RMF-001)
  ├─ vp:Problem → rrr:Risk (finding → business risk)
  ├─ vp:Solution → rrr:Requirement (remediation → control)
  └─ vp:Benefit → rrr:Result (improvement → outcome)
       │
  Prioritised Remediation Roadmap
  (risk-rated, cost-quantified, phased)
```

### 6.5 Current-State to Future-State Projection

| Phase | Method | Tooling |
|---|---|---|
| **Current State Capture** | DMAIC Measure + DELTA Evaluate | azure-skills live data → ontology baseline scoring |
| **Gap Analysis** | DMAIC Analyse + DELTA Leverage | Cross-framework correlation, VE × RMF risk quantification |
| **Future State Design** | DMAIC Improve + DELTA Transform | Remediation → Epic 33 IaC blueprints, projected maturity |
| **Continuous Assurance** | DMAIC Control + DELTA Assure | pfc-spc monitoring, recurring compliance, Supabase trending |

### 6.6 Full Assessment Lifecycle (Pre + Post Deployment)

| Phase | Strategy | Tooling |
|---|---|---|
| **Pre-deployment** | W4M-RCS ALZ Assessment (AZALZ-ONT × MCSB-ONT × 9-domain scoring) | Design review, ontology scoring |
| **Post-deployment** | Epic 74 azure-skills live assessment (WAF/CAF/Cyber/ALZ Health) | MCP live data extraction |
| **Continuous** | DMAIC Control + SPC monitoring + RMF risk trending | Recurring agentic pipeline |

---

## 7. Competitive Advantage (Extended)

| Dimension | Competitor Approach | PFC + Azure Skills |
|---|---|---|
| Data extraction | Manual KQL / Azure Advisor | Automated via 200+ MCP tools |
| Framework coverage | Single framework per tool | WAF + CAF + NCSC CAF + MCSB in one pass |
| Cross-referencing | Manual spreadsheet correlation | Ontology graph automatic join patterns |
| Business linkage | Technical findings only | VE × RMF risk-to-value mapping |
| Repeatability | Consultant-dependent | Agentic pipeline — consistent, scalable |
| Evidence packaging | Bespoke per engagement | Templated per PFI instance |
| Trend analysis | Point-in-time snapshots | JSONB graph storage enables longitudinal tracking |

---

## 8. Delivery Roadmap

| Phase | Features | Dependencies | Target |
|---|---|---|---|
| Phase 1 — Evaluate | F74.1 (Capability Evaluation), F74.8 (Documentation) | None | Immediate |
| Phase 2 — WAF + ALZ | F74.2 (WAF Assessment), F74.5 (ALZ Healthcheck), F74.6 (MCP Integration) | Azure MCP Server access, F71.3 | After Phase 1 |
| Phase 3 — CAF + Cyber | F74.3 (CAF Readiness), F74.4 (Cyber Posture) | Phase 2 complete, NCSC-CAF-ONT instances | After Phase 2 |
| Phase 4 — Pipeline | F74.7 (Agentic Pipeline) | All assessment domains validated, Epic 59 (DB) | After Phase 3 |

---

## 9. Risk & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Azure MCP Server access requires Azure credentials / tenant consent | Blocks live data extraction | Phase 1 evaluates skill definitions without live access; test with sandbox tenant |
| azure-skills output format may not map cleanly to ontology entities | Requires transformation layer | F74.1 includes output format analysis; design adapter pattern in F74.7 |
| Microsoft may change/deprecate skills | Breaking changes to pipeline | Pin to specific version; monitor repo releases; our ontology layer is decoupled |
| NCSC-CAF-ONT instances may not be ready | Blocks F74.3 CAF assessment | Prioritise WAF + ALZ (Phase 2) which depend on mature ontologies |
| Scope creep across 4 assessment domains | Delivery risk | Phase-gated approach; each domain is a separate feature with independent AC |

---

## 10. Cross-References

- [Epic 74 (#1074)](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/1074) — Parent epic
- [Epic 33 (#505)](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/505) — Azure Landing Zone IaC
- [Epic 68 (#1005)](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/1005) — Azure-RCS Assessment Platform
- [Epic 63 (#963)](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/963) — Agents, Plugins, Skills Unification
- [F71.3 (#1023)](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/1023) — MCP Server Integrations
- [Epic 29 (#356)](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/356) — NCSC CAF Value Proposition
- [Epic 30 (#370)](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/370) — GRC Series Architecture
- [F40.40 (#1046)](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/1046) — OWASP Mitigation & Methods Skill Family
- Source: [microsoft/azure-skills](https://github.com/microsoft/azure-skills)
- Briefing: `PBS/STRATEGY/PFI-AIRL-GRC-BRIEF-Azure-Skills-Capability-Evaluation-v1.0.0.md`

---

*PFI-AIRL-GRC-STRAT: Azure Skills WAF/CAF/Cyber Assessment Strategy v1.0.0*
*Microsoft's azure-skills = execution layer. PFC ontology stack = intelligence layer. Together = automated assessment at scale.*
