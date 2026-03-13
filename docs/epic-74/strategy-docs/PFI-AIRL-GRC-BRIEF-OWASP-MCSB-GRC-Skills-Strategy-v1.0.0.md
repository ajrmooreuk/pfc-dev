# PFI-AIRL-GRC-BRIEF — OWASP, MCSB & GRC Security Skills Strategy

**Document ID:** PFI-AIRL-GRC-BRIEF-OWASP-MCSB-GRC-Skills-Strategy-v1.0.0
**Date:** 2026-03-13
**Epic:** [Epic 74 (#1074)](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/1074)
**Features:** F74.19 (OWASP Leverage), F74.20 (GRC-MCSB Skills), F74.21 (ASB→MCSB Lineage)
**Status:** Active
**Related Epics:** [Epic 73 (#1062)](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/1062) (Risk Intelligence), [Epic 37 (#517)](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/517) (Threat Modelling), [Epic 30 (#370)](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/370) (GRC Architecture)

---

## 1. Executive Summary

This briefing addresses three interconnected capabilities:

1. **Leveraging existing OWASP skills** (7 active) within the ALZ assessment pipeline to provide application-layer and AI security coverage that MCSB alone does not deliver
2. **Building a GRC-MCSB skills family** that operationalises MCSB-ONT v2.0.0 for automated compliance assessment, benchmarking, and continuous posture management
3. **Managing the ASB→MCSB lineage** (ASB v1→v2→v3 → MCSB v1 → MCSB v2) so that customers on any version get a clear migration path and gap analysis

Together these skills close the security posture assessment loop: MCSB provides the **infrastructure benchmark**, OWASP provides the **application and AI security bar**, and GRC-FW-ONT orchestrates **governance, risk, and compliance** across both.

---

## 2. ASB → MCSB Lineage & Version Strategy

### 2.1 Version History

```text
ASB v1 (2019)  →  ASB v2 (Sep 2020)  →  ASB v3 (Nov 2021)
                                              │
                                    Rebrand + Multicloud
                                              ↓
                                     MCSB v1 (Oct 2022 preview, GA 2023)
                                              │
                                    + AI Security Controls
                                              ↓
                                     MCSB v2 (Nov 2025 preview)
```

| Version | Scope | Status | Key Addition |
|---|---|---|---|
| ASB v1 | Azure-only | **Deprecated** | CIS Controls v7.1 mapping |
| ASB v2 | Azure-only | **Deprecated** | NIST SP 800-53 mapping |
| ASB v3 | Azure-only | **Deprecated** | DevOps Security domain, PCI-DSS mapping |
| MCSB v1 | Azure + AWS + GCP | **GA** (current) | Multicloud, Defender for Cloud integration |
| MCSB v2 | Azure + AWS + GCP + AI | **Preview** | AI Security domain (AI-1 to AI-7), 420+ Azure Policy definitions |

### 2.2 Ontology Coverage

| Ontology | Covers | OAA | Status |
|---|---|---|---|
| MCSB-ONT v2.0.0 | ASB v3 / MCSB v1 controls (12 domains) | 6.1.0 | **Compliant** (8/8 gates) |
| MCSB2-ONT v1.0.0 | MCSB v2 controls (12 domains + AI) | 7.0.0 | **Placeholder** (0/8 gates) |

### 2.3 Customer Positioning

Most Azure customers fall into one of three categories:

| Customer State | What They Have | What They Need |
|---|---|---|
| **ASB legacy** | ASB v2/v3 policies, no multicloud | Migration to MCSB v1, gap analysis, policy update |
| **MCSB v1 current** | MCSB v1 GA policies, Defender posture | Readiness assessment for MCSB v2, AI controls gap |
| **Greenfield** | No benchmark applied | MCSB v2 deployment, full posture baseline |

Each category requires a different skill chain entry point, but all converge on the same GRC-MCSB assessment output.

---

## 3. Leveraging Existing OWASP Skills

### 3.1 Current OWASP Skill Inventory

| Skill | Coverage | Ontology Target | Integration Point |
|---|---|---|---|
| `pfc-owasp-agentic` | OWASP Agentic AI Top 10 (ASI01-10) | ERM-ONT | AI workload assessment in MCSB v2 AI domain |
| `pfc-owasp-llm` | OWASP LLM Top 10 (2025) + MITRE ATLAS | ERM-ONT | AI model security, complements MCSB AI-1 to AI-7 |
| `pfc-owasp-pipeline` | CI/CD pipeline security orchestration | PE-ONT | DevOps Security domain (MCSB DS-1 to DS-7) |
| `pfc-owasp-code-review` | Source code security review | SEC-FW-ONT | Application layer — not covered by MCSB |
| `pfc-owasp-web` | OWASP Web Top 10 | SEC-FW-ONT | Web application security — not covered by MCSB |
| `pfc-owasp-threat-model` | Threat modelling (STRIDE, DREAD) | ERM-ONT | Risk identification feeding RMF risk register |
| `ext-owasp-agamm` | AI Governance & Maturity Model | GRC-FW-ONT | AI governance maturity — complements GRC-06-AI |

### 3.2 OWASP × MCSB Coverage Matrix

MCSB controls are **infrastructure-focused**. OWASP fills the **application and AI layer** gaps:

```text
┌─────────────────────────────────────────────────────────────────┐
│                   SECURITY POSTURE COVERAGE                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  INFRASTRUCTURE LAYER (MCSB)                                     │
│  ├── Network Security (NS-1 to NS-10)                           │
│  ├── Identity Management (IM-1 to IM-9)                         │
│  ├── Privileged Access (PA-1 to PA-8)                           │
│  ├── Data Protection (DP-1 to DP-8)                             │
│  ├── Logging & Threat Detection (LT-1 to LT-7)                 │
│  ├── Posture & Vulnerability (PV-1 to PV-6)                    │
│  ├── Endpoint Security (ES-1 to ES-3)                           │
│  ├── Backup & Recovery (BR-1 to BR-4)                           │
│  ├── Asset Management (AM-1 to AM-5)                            │
│  ├── Governance & Strategy (GS-1 to GS-10)                     │
│  └── DevOps Security (DS-1 to DS-7)                             │
│       └── pfc-owasp-pipeline supplements DS-1 to DS-7           │
│                                                                  │
│  AI SECURITY LAYER (MCSB v2 + OWASP)                            │
│  ├── AI-1 to AI-7 (MCSB v2)           ← platform controls      │
│  ├── pfc-owasp-agentic (ASI01-10)     ← agent-specific risks   │
│  ├── pfc-owasp-llm (LLM Top 10)      ← model-specific risks   │
│  └── ext-owasp-agamm                  ← AI governance maturity  │
│                                                                  │
│  APPLICATION LAYER (OWASP — not in MCSB)                        │
│  ├── pfc-owasp-web (Web Top 10)       ← web app security       │
│  ├── pfc-owasp-code-review            ← source code security   │
│  └── pfc-owasp-threat-model           ← threat modelling       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.3 Integration Architecture

OWASP skills integrate into the ALZ assessment pipeline at two points:

1. **Stage 3 (Cyber Assessment)**: `pfc-alz-assess-cyber` invokes OWASP skills for application-layer findings alongside MCSB control compliance
2. **Stage 4 (Cross-Framework Correlation)**: OWASP findings are cross-referenced via the `cross-framework` plugin to MCSB controls, NCSC CAF outcomes, and RMF risk statements

```text
pfc-alz-assess-cyber
├── azure-compliance (MCSB controls)
├── azure-rbac (identity)
├── pfc-owasp-web ──────────┐
├── pfc-owasp-code-review ──┤── Application layer
├── pfc-owasp-threat-model ─┘
├── pfc-owasp-agentic ─────┐
├── pfc-owasp-llm ─────────┤── AI security layer
├── ext-owasp-agamm ───────┘
└── cross-framework plugin → unified finding set
```

---

## 4. GRC-MCSB Skills Family

### 4.1 Proposed Skills

| Skill ID | Purpose | Type | Feature |
|---|---|---|---|
| `pfc-grc-mcsb-assess` | Assess current MCSB compliance posture per control domain | AGENT_SUPERVISED | F74.20a |
| `pfc-grc-mcsb-benchmark` | Benchmark customer posture against best practice and peer cohort | AGENT_SUPERVISED | F74.20b |
| `pfc-grc-mcsb-migrate` | Gap analysis for ASB→MCSB v1 or MCSB v1→v2 migration | AGENT_SUPERVISED | F74.21 |
| `pfc-grc-mcsb-policy` | Azure Policy assignment audit and remediation planning | AGENT_AUTONOMOUS | F74.20c |
| `pfc-grc-mcsb-report` | MCSB compliance report generation (per domain, executive, trend) | AGENT_AUTONOMOUS | F74.20d |
| `pfc-grc-posture` | Unified security posture score (MCSB + OWASP + WAF Security pillar) | AGENT_SUPERVISED | F74.20e |

### 4.2 Skill Definitions

#### pfc-grc-mcsb-assess

Assesses current MCSB compliance state using `azure-compliance` MCP skill:

```text
Inputs:
  - Azure tenant credentials (read-only)
  - MCSB version target (v1 or v2)
  - Scope: subscription(s) or management group

Process:
  1. Invoke azure-compliance → regulatory compliance state
  2. Map each finding to MCSB-ONT control domain entities
  3. Score per domain (0–100%) using scoring-model.md methodology
  4. Cross-reference to GRC-FW-ONT governance controls
  5. Generate RMF risk statement per non-compliant control

Outputs:
  - MCSB compliance scorecard (12 domains + AI if v2)
  - Non-compliant controls with remediation guidance
  - RMF risk register entries
  - Cross-framework references (NCSC CAF, WAF Security)
```

#### pfc-grc-mcsb-benchmark

Compares customer posture against:
- **Best practice** (100% compliance per domain)
- **Desired destination** (customer-defined targets)
- **Peer cohort** (industry vertical benchmarks from Supabase historical data)

Uses the three-state DMAIC backcasting from the ALZ assessment methodology.

#### pfc-grc-mcsb-migrate

Handles the ASB→MCSB version migration:

```text
Migration Scenarios:

  ASB v2/v3 → MCSB v1:
  ├── Map existing ASB policy assignments to MCSB v1 equivalents
  ├── Identify deprecated ASB policies (no MCSB equivalent)
  ├── Identify new MCSB v1 controls not in ASB (multicloud)
  ├── Generate migration plan with effort estimates
  └── Output: Migration roadmap + policy assignment delta

  MCSB v1 → MCSB v2:
  ├── Gap analysis: existing v1 coverage vs v2 requirements
  ├── New AI Security domain (AI-1 to AI-7) assessment
  ├── New/modified policy definitions (420+ in v2)
  ├── Generate upgrade plan with phased rollout
  └── Output: Upgrade roadmap + new control coverage plan
```

#### pfc-grc-mcsb-policy

Automated Azure Policy audit:

- Enumerate all policy assignments at MG/subscription scope
- Map to MCSB control domains
- Identify missing assignments (controls without policy enforcement)
- Detect conflicting or duplicate policies
- Generate remediation plan (assign missing, remove deprecated)

Uses `azure-compliance` + `azure-validate` MCP skills.

#### pfc-grc-mcsb-report

Report generation skill producing:

- **Domain report**: Per-control-domain compliance detail
- **Executive summary**: 1-page posture overview with traffic lights
- **Trend report**: Posture change over time (from Supabase historical baselines)
- **Regulatory mapping**: MCSB controls → regulatory framework compliance (GDPR, NCSC CAF, PCI-DSS)

#### pfc-grc-posture

Unified security posture aggregation:

```text
Unified Posture Score = weighted average of:
  ├── MCSB infrastructure score (pfc-grc-mcsb-assess)     weight: 0.40
  ├── OWASP application score (pfc-owasp-* aggregate)     weight: 0.25
  ├── WAF Security pillar (pfc-alz-assess-waf)            weight: 0.20
  └── AI Security score (pfc-owasp-agentic + MCSB AI)     weight: 0.15

Weights are VE-configurable per customer priority.
```

### 4.3 Ontology Dependencies

```text
GRC-MCSB Skills
├── MCSB-ONT v2.0.0      ← 12 control domains, entity mapping
├── MCSB2-ONT v1.0.0     ← v2 controls + AI domain (needs build-out)
├── GRC-FW-ONT v3.0.0    ← Governance framework orchestration
├── ERM-ONT v1.0.0       ← Risk register, risk categories
├── RMF-IS27005-ONT v1.0.0 ← Risk scoring model
├── SEC-FW-ONT v1.0.0    ← Security posture framework
├── COMP-FW-ONT v1.0.0   ← Compliance framework mapping
├── NCSC-CAF-ONT v1.0.0  ← UK cyber outcomes cross-reference
└── EA-MSFT-ONT           ← WAF pillar entities
```

---

## 5. GRC Planning & Management Skills

### 5.1 Planning Skills

| Skill ID | Purpose | Consumes |
|---|---|---|
| `pfc-grc-plan` | Generate MCSB compliance implementation plan (phased, costed) | pfc-grc-mcsb-assess, pfc-cost-model |
| `pfc-grc-remediate` | Prioritised remediation backlog from assessment findings | pfc-grc-mcsb-assess, pfc-ve-prioritise |
| `pfc-grc-baseline` | Establish compliance baseline and SPC control limits | pfc-grc-mcsb-assess, historical data |
| `pfc-grc-drift` | Continuous compliance drift detection and alerting | pfc-grc-mcsb-policy, azure-compliance |

### 5.2 Management Lifecycle

```text
PLAN                          ASSESS                    MANAGE
─────                         ──────                    ──────
pfc-grc-plan           →  pfc-grc-mcsb-assess    →  pfc-grc-baseline
pfc-grc-remediate      →  pfc-grc-mcsb-benchmark →  pfc-grc-drift
pfc-grc-mcsb-migrate   →  pfc-grc-mcsb-policy    →  pfc-grc-mcsb-report
                          pfc-grc-posture         →  pfc-grc-posture (recurring)

OWASP LAYER (continuous)
──────────────────────
pfc-owasp-web          →  Application scan        →  Finding set
pfc-owasp-code-review  →  Code scan               →  Finding set
pfc-owasp-agentic      →  AI agent scan           →  Finding set
pfc-owasp-llm          →  LLM deployment scan     →  Finding set
pfc-owasp-threat-model →  Threat model refresh    →  Risk register update
```

### 5.3 DMAIC Integration

| DMAIC Phase | GRC-MCSB Skills Used |
|---|---|
| **Define** | `pfc-grc-mcsb-migrate` (identify version gap), `pfc-grc-plan` (scope and targets) |
| **Measure** | `pfc-grc-mcsb-assess` (baseline scores), `pfc-grc-mcsb-policy` (policy audit) |
| **Analyse** | `pfc-grc-mcsb-benchmark` (three-state gap), `pfc-grc-posture` (unified score), OWASP skills (app layer) |
| **Improve** | `pfc-grc-remediate` (prioritised backlog), `pfc-alz-strategy` (backcasted roadmap) |
| **Control** | `pfc-grc-baseline` (SPC control charts), `pfc-grc-drift` (continuous monitoring), `pfc-grc-mcsb-report` (trend reporting) |

---

## 6. Cross-Epic Integration

### 6.1 Epic 73: Risk Intelligence (SKL-066 to SKL-074)

| Epic 73 Skill | GRC-MCSB Integration |
|---|---|
| `risk-profile` (SKL-066) | Consumes MCSB findings as risk input categories |
| `risk-score` (SKL-067) | Scores MCSB non-compliance findings (P0–P3) |
| `risk-balance` (SKL-068) | Balances MCSB remediation against VE value backlog |
| `risk-report` (SKL-070) | Includes MCSB posture in risk reporting |
| `risk-learn` (SKL-071) | Feeds MCSB remediation outcomes back to risk calibration |

### 6.2 Epic 37: Threat Modelling (#517)

| Capability | Connection |
|---|---|
| `pfc-owasp-threat-model` | Primary threat modelling skill — feeds risk-profile |
| STRIDE/DREAD models | Map to MCSB control gaps as threat scenarios |
| MITRE ATLAS | Cross-referenced by pfc-owasp-llm for AI threat landscape |

### 6.3 Epic 30: GRC Architecture (#370)

| Feature | Connection |
|---|---|
| F30.3: COMP-FW-ONT + SEC-FW-ONT | Foundation for pfc-grc-posture unified scoring |
| F30.12: OSCAL Format | Machine-readable compliance output from pfc-grc-mcsb-report |
| F30.13–14: RMF Generic Framework | Risk scoring model used by all GRC-MCSB skills |

### 6.4 F40.40: OWASP Security Bar (#1046)

This feature defines OWASP as "Security Bar for All PFI Instances". The GRC-MCSB skills formalise this by:
- Making OWASP scan mandatory in every ALZ assessment
- Including OWASP findings in the unified posture score
- Cross-referencing OWASP findings to MCSB controls where applicable

---

## 7. Skill Chain Readiness (GRC-MCSB Focus)

| Skill | Status | Blocker |
|---|---|---|
| `pfc-grc-mcsb-assess` | Scaffold needed | azure-compliance MCP access |
| `pfc-grc-mcsb-benchmark` | Scaffold needed | pfc-grc-mcsb-assess + Supabase historical |
| `pfc-grc-mcsb-migrate` | Scaffold needed | MCSB-ONT + MCSB2-ONT build-out |
| `pfc-grc-mcsb-policy` | Scaffold needed | azure-compliance MCP access |
| `pfc-grc-mcsb-report` | Scaffold needed | pfc-grc-mcsb-assess output |
| `pfc-grc-posture` | Scaffold needed | Multiple upstream skills |
| `pfc-grc-plan` | Scaffold needed | pfc-grc-mcsb-assess + pfc-cost-model |
| `pfc-grc-remediate` | Scaffold needed | pfc-grc-mcsb-assess + pfc-ve-prioritise |
| `pfc-grc-baseline` | Scaffold needed | Supabase historical storage |
| `pfc-grc-drift` | Scaffold needed | pfc-grc-mcsb-policy + scheduling |
| `pfc-owasp-agentic` | **Active** | — |
| `pfc-owasp-llm` | **Active** | — |
| `pfc-owasp-pipeline` | **Active** | — |
| `pfc-owasp-code-review` | **Active** | — |
| `pfc-owasp-web` | **Active** | — |
| `pfc-owasp-threat-model` | **Active** | — |
| `ext-owasp-agamm` | **Active** (external) | — |
| MCSB-ONT v2.0.0 | **Compliant** | — |
| MCSB2-ONT v1.0.0 | **Placeholder** | Needs full build-out for v2 controls |
| Epic 73 risk-* skills | **Pending** | 0/9 features complete |

### Critical Path

1. **MCSB2-ONT build-out** — populate v2 control entities including AI-1 to AI-7
2. **Azure MCP Server access** — required for live compliance data
3. **pfc-grc-mcsb-assess scaffold** — core assessment skill, everything depends on it
4. **Epic 73 risk-* skills** — needed for risk scoring integration
5. **Supabase historical storage** — needed for benchmarking and trend reporting

### Estimated Timeline

| Milestone | Target | Dependencies |
|---|---|---|
| MCSB2-ONT build-out | 2 weeks | Ontology team |
| GRC-MCSB skill scaffolds | 1 week | This briefing approved |
| pfc-grc-mcsb-assess MVP | 3 weeks | Azure MCP Server access |
| OWASP integration in pipeline | 1 week | pfc-alz-assess-cyber scaffold |
| Unified posture scoring | 2 weeks | pfc-grc-mcsb-assess + OWASP aggregate |
| Full GRC-MCSB pipeline | 8 weeks | All dependencies resolved |

---

## 8. Competitive Advantage

### 8.1 What Competitors Offer

- **Microsoft Defender for Cloud**: Automated MCSB compliance — but no OWASP, no backcasting, no VE value quantification
- **Wiz / Orca / Prisma**: Cloud security posture — but no ontology-driven analysis, no PE process rigour
- **Big 4 consulting**: Manual assessments — expensive, slow, not repeatable

### 8.2 What PFC Delivers Differently

| Differentiator | How |
|---|---|
| **Ontology-driven** | Every finding mapped to MCSB-ONT, cross-referenced to 6 frameworks |
| **OWASP + MCSB combined** | Infrastructure AND application layer in one assessment |
| **Version-aware migration** | Automated ASB→MCSB v1→v2 gap analysis and roadmap |
| **VE value quantification** | Every remediation costed and valued via VE skill chain |
| **DMAIC backcasting** | Customer-centric roadmap from desired destination, not just best practice |
| **Continuous posture** | SPC-based drift detection, not point-in-time audit |
| **Agentic automation** | MCP-driven live assessment vs. manual checklist |

---

## 9. Recommendations

1. **Approve F74.19–F74.21** — add OWASP leverage, GRC-MCSB skills, and ASB lineage features to Epic 74
2. **Prioritise MCSB2-ONT build-out** — the v2 placeholder needs populating before MCSB v2 assessment skills can be validated
3. **Scaffold 10 GRC-MCSB skills in pfc-dev** — parallel to existing ALZ assessment sub-skills
4. **Integrate OWASP skills into pfc-alz-assess-cyber** — add as application-layer assessment stage
5. **Coordinate with Epic 73** — risk-* skills are critical downstream consumers
6. **Add GRC-MCSB test data sets** to the TDD plan (TD-GRC-MCSB-COMPLIANT, TD-GRC-MCSB-LEGACY, TD-GRC-MCSB-AI)

---

## 10. Human Checkpoints

- [ ] ASB→MCSB version strategy approved
- [ ] OWASP integration points validated
- [ ] GRC-MCSB skill definitions reviewed
- [ ] Unified posture weighting approved (VE-configurable)
- [ ] MCSB2-ONT build-out scope agreed
- [ ] Coordination with Epic 73 risk-* skills confirmed

---

*PFI-AIRL-GRC-BRIEF-OWASP-MCSB-GRC-Skills-Strategy-v1.0.0*
*Epic 74 (#1074) — F74.19, F74.20, F74.21*
