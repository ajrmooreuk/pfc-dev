# Azure RCS Assessment Platform — Epic 68

## Epic 68: PFI-Azure-RCS — Azure Assessment Platform via Azure-RCS Instance

| Field | Value |
| --- | --- |
| **Date** | 2026-03-11 |
| **Version** | 1.0.0 |
| **Status** | STRATEGY BRIEF — For Review & Approval |
| **Classification** | CONFIDENTIAL — Strategic Planning Asset |
| **Epic Ref** | [Epic 68 (#1005)](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/1005) |
| **Predecessor** | Epic 16 (#91) PFI-RCS-W4M-AIR-Collab-MS-Azure-EA-Assess (Closed — scope TBD) |
| **Parent** | Epic 34 (#518) PF-Core Graph-Based Agentic Platform |
| **VSOM Alignment** | S2 (Risk & Compliance) + S3 (Agentic Orchestration) + S4 (Instance+Client Customisation) |
| **Ontology Alignment** | GRC-FW-ONT v3.0.0, RMF-IS27005-ONT v1.0.0, ERM-ONT v1.0.0, MCSB-ONT v2.0.0, AZALZ-ONT |
| **Skill Chain** | pfc-rmf-assess → pfc-azure-posture → pfc-grc-report (new — registered in F68.7) |
| **Instance** | `pfi-azure-rcs-{dev\|test\|prod}` (new triad to be provisioned) |

---

## Executive Summary

The Azure-RCS Instance is a new PFI purpose-built as a cross-cutting **Assessment Platform** — delivering Azure security posture scoring, RMF risk assessments, and GRC compliance evidence to BAIV's client base, AIRL's CAF pipeline, PFI-ANTQ's eCommerce security layer, and any future client organisation requiring cloud governance assessment.

This Epic realises the intent of the closed Epic 16 (PFI-RCS-W4M-AIR-Collab-MS-Azure-EA-Assess) with a concrete, ontology-driven delivery model. It emerges from the intersection of:

1. **VE × RMF convergence** — the Value Engineering skill chain applied to Risk Management Framework domains, treating risk as a value problem: `vp:Problem → rrr:Risk`, `vp:Solution → rrr:Requirement`, `vp:Benefit → rrr:Result`
2. **GRC Series maturity** — Epic 30 ontologies (GRC-FW, RMF-IS27005, MCSB, AZALZ) now provide the semantic backbone for assessment delivery
3. **PFI multi-client demand** — BAIV clients need Azure security evidence; AIRL needs CAF-to-Azure alignment; ANTQ needs eCommerce GRC posture; future PFIs need a reusable assessment model

---

## Strategic Context

### Why Now

| Signal | Implication |
| --- | --- |
| BAIV at 80% readiness, targeting 100-client base | Clients need Azure security posture as part of AI Visibility scoring |
| AIRL-CAF-AzA at 60% readiness | Azure Landing Zone alignment (AZALZ-ONT) needs delivery infrastructure |
| PFI-ANTQ in PoC/Discovery | eCommerce security (GDPR, payment posture) needs GRC backbone before MVP |
| Epic 30 GRC ontologies published | RMF-IS27005-ONT, ERM-ONT, MCSB-ONT in registry — assessment engine ready to build |
| Epic 33 (Azure IaC LZ) backlog | Azure-RCS assessment and Azure-LZ IaC can share the same platform foundation |
| Epic 53 (Cloud Sovereignty) open | Data sovereignty tier classification feeds directly into Azure-RCS scoping |

### Relationship to Closed Epic 16

Epic 16 (PFI-RCS-W4M-AIR-Collab-MS-Azure-EA-Assess) was closed with scope TBD, pending upstream PFI readiness (E10, E13, E14). Those dependencies are now substantially met. Epic 68 is not a resurrection of Epic 16 but a **purpose-redefined successor** — focused on a standalone assessment platform rather than a collaborative PFI overlay.

---

## Architectural Model

```text
                    ┌──────────────────────────────────────────┐
                    │         PFI-Azure-RCS Instance           │
                    │    Assessment Platform Hub               │
                    │                                          │
                    │  GRC-FW-ONT (hub)                        │
                    │   ├─ RMF-IS27005-ONT (risk assessment)   │
                    │   ├─ ERM-ONT (enterprise risk mgmt)      │
                    │   ├─ MCSB-ONT (Azure security benchmark) │
                    │   └─ AZALZ-ONT (Azure landing zone)      │
                    │                                          │
                    │  Skills: pfc-rmf-assess                  │
                    │          pfc-azure-posture               │
                    │          pfc-grc-report                  │
                    └──────────────┬───────────────────────────┘
                                   │  Assessment outputs
              ┌────────────────────┼────────────────────────┐
              │                    │                        │
    ┌─────────▼──────┐   ┌────────▼────────┐   ┌──────────▼──────┐
    │   PFI-BAIV     │   │   PFI-AIRL      │   │   PFI-ANTQ      │
    │   AI Sec       │   │   CAF/AzA       │   │   eComm Sec     │
    │   Posture      │   │   Compliance    │   │   GDPR/PCI      │
    │   (per client) │   │   Dashboard     │   │   Posture       │
    └────────────────┘   └─────────────────┘   └─────────────────┘
              │                    │                        │
    ┌─────────▼──────────────────────────────────────────────────┐
    │                 Client Organisations                        │
    │   (Any BAIV/AIRL/ANTQ client requiring Azure assessment)   │
    └─────────────────────────────────────────────────────────────┘
```

### VE × RMF Bridge — Join Pattern

The key architectural innovation is applying the VP-RRR join pattern to the security/risk domain:

| VE Construct | RMF Equivalent | GRC Ontology Entity |
| --- | --- | --- |
| `vp:Problem` | `rrr:Risk` | `ERM-ONT:Risk`, `RMF-IS27005-ONT:RiskStatement` |
| `vp:Solution` | `rrr:Requirement` | `GRC-FW-ONT:Control`, `MCSB-ONT:SecurityControl` |
| `vp:Benefit` | `rrr:Result` | `GRC-FW-ONT:ComplianceEvidence`, `RMF-IS27005-ONT:RiskTreatment` |
| `vp:Customer` | `rrr:Stakeholder` | `ERM-ONT:RiskOwner`, `GRC-FW-ONT:Accountable` |

Join Pattern ID: `JP-VE-RMF-001` — to be registered in the OAA v7.0.0 join pattern registry (F21.19).

---

## Features

### F68.1 — Azure-RCS PFI Instance Bootstrap

**Goal:** Provision the `pfi-azure-rcs` triad repos with standard PFC structure.

**Stories:**

- S68.1.1: Create `pfi-azure-rcs-{dev|test|prod}` GitHub repos with branch protection
- S68.1.2: Seed CLAUDE.md, PBS/STRATEGY, PBS/ONTOLOGIES structure per PFC standard
- S68.1.3: Seed VP + RRR instance data for Azure assessment value proposition
- S68.1.4: Configure EMC instance — RCSG-Series GRC-FW hub-spoke binding
- S68.1.5: Register in PFC registry index + pfi-instances manifest

**Dependencies:** Epic 10A (RBAC/Supabase), Epic 31 (CI/CD bootstrap), Epic 58 (PFC triad)

---

### F68.2 — RMF Assessment Skills

**Goal:** Build `pfc-rmf-assess` — ISO 27005-aligned risk assessment skill with OAA v7.0.0 compliance.

**Stories:**

- S68.2.1: `pfc-rmf-assess` skill scaffold — scope, context, method chain
- S68.2.2: Risk identification step — maps to `RMF-IS27005-ONT:RiskStatement` entities
- S68.2.3: Risk evaluation step — likelihood × impact matrix, `ERM-ONT:RiskScore`
- S68.2.4: Risk treatment step — `vp:Solution → rrr:Requirement` mapping
- S68.2.5: Output: structured risk register in JSONLD + Supabase graph write
- S68.2.6: Skill registration in `skills-register-index.json` + `PFC-SKBLD-REL-*.md`

**Ontology:** RMF-IS27005-ONT v1.0.0, ERM-ONT v1.0.0

**NIST Alignment:** NIST SP 800-30 Rev 1 (Guide for Risk Assessments)

---

### F68.3 — Azure Security Posture Scoring

**Goal:** Build `pfc-azure-posture` — MCSB v2.0.0-aligned maturity scoring, mirroring the BAIV AI Visibility scoring pattern.

**Stories:**

- S68.3.1: MCSB control family mapping — 12 domains, `MCSB-ONT:ControlFamily` entities
- S68.3.2: Scoring engine — maturity levels 1–5, `MCSB-ONT:MaturityScore`
- S68.3.3: Azure ALZ alignment check — `AZALZ-ONT:LandingZonePolicy` gap analysis
- S68.3.4: Posture dashboard output — scored JSON, Supabase write, Visualiser panel
- S68.3.5: Per-client posture delta — baseline vs target vs current, trend tracking
- S68.3.6: Skill registration

**Ontology:** MCSB-ONT v2.0.0, AZALZ-ONT

**Azure Alignment:** Microsoft Cloud Security Benchmark v2.0, Azure Security Centre

---

### F68.4 — GRC-VE Bridge — Risk-to-Value Mapping

**Goal:** Formalise the `JP-VE-RMF-001` join pattern and implement it as a graph composition rule in EMC.

**Stories:**

- S68.4.1: Define `JP-VE-RMF-001` join pattern — VE-Series × RCSG-Series bridge
- S68.4.2: EMC composition rule — `constrainToInstanceOntologies()` extended for RCS scope
- S68.4.3: Register JP-VE-RMF-001 in OAA v7.0.0 Join Pattern Registry (F21.19)
- S68.4.4: Validate bridge with worked example — BAIV client Azure assessment → AI Visibility score integration
- S68.4.5: Cross-reference GRC-FW-ONT VSEM bridges (7 existing) + add VE-bridge entry

**Dependencies:** Epic 21 F21.19 (Join Pattern Registry), Epic 30 (GRC Series)

---

### F68.5 — Cross-PFI Assessment Templates

**Goal:** Reusable assessment template library deployable to BAIV, AIRL, ANTQ, and client instances.

**Stories:**

- S68.5.1: BAIV template — AI system security assessment (MCSB AI workload controls + ERM)
- S68.5.2: AIRL template — CAF-to-Azure alignment assessment (NCSC-CAF-ONT × AZALZ-ONT)
- S68.5.3: ANTQ template — eCommerce security posture (GDPR-ONT × MCSB-ONT × PII-ONT)
- S68.5.4: Generic client template — Azure tenant baseline (MCSB + ERM, configurable scope)
- S68.5.5: Template distribution via EMC Document Distribution (Epic 58 CI/CD pattern)

**Ontology:** GDPR-ONT, NCSC-CAF-ONT, MCSB-ONT, PII-ONT (RCSG-Series)

---

### F68.6 — Azure-RCS EMC Configuration

**Goal:** Configure the EMC instance for Azure-RCS — RCSG-Series as primary, cross-series bridges to VE and PE.

**Stories:**

- S68.6.1: `pfi-azure-rcs-graph-scope.json` — RCSG-Series scope definition
- S68.6.2: EMC `instanceConfig` — ontology composition rules for RCS scope
- S68.6.3: VE-Series bridge — VP-ONT, RRR-ONT included as cross-series composition targets
- S68.6.4: Foundation-Series inclusion — ORG-ONT, ORG-CONTEXT-ONT for client org context
- S68.6.5: Validate EMC composition — Visualiser graph load + entity count gate

**Dependencies:** Epic 41 F41.5 (EMC-ONT v5.0.0 updates)

---

### F68.7 — RMF Skill Registration & Documentation

**Goal:** Register all new skills and produce the operating guide, release notes, and docs register entries.

**Stories:**

- S68.7.1: `skills-register-index.json` — register `pfc-rmf-assess`, `pfc-azure-posture`, `pfc-grc-report`
- S68.7.2: `PFC-SKBLD-REL-Azure-RCS-Skills-v1.0.0.md` — release bulletin
- S68.7.3: Operating guide — `PFC-GRC-OPS-Azure-RCS-Assessment-v1.0.0.md`
- S68.7.4: `PFC-STRAT-IDX-Strategy-Briefings.md` update — register all new docs
- S68.7.5: Validate Epic 30 F30.6 cross-series integration gate — OSCAL alignment check

---

## OKR Cascade

### Objective 1: Azure-RCS Instance Operational

- **KR1.1:** `pfi-azure-rcs-dev` repo live with VP+RRR seed — Week 2
- **KR1.2:** EMC instance loads RCSG-Series graph without errors — Week 3
- **KR1.3:** First `pfc-rmf-assess` run produces valid JSONLD risk register — Week 4

### Objective 2: Multi-PFI Assessment Capability

- **KR2.1:** BAIV Azure security posture template deployed to `pfi-baiv-aiv-dev` — Week 6
- **KR2.2:** AIRL CAF-to-Azure template deployed to `pfi-airl-caf-aza-dev` — Week 7
- **KR2.3:** ANTQ eCommerce template available for PoC — Week 8

### Objective 3: VE × RMF Bridge Validated

- **KR3.1:** JP-VE-RMF-001 registered in OAA join pattern registry — Week 5
- **KR3.2:** Worked example: BAIV client risk register → AI Visibility score delta — Week 9
- **KR3.3:** EMC composition rule gate passing in Visualiser — Week 9

---

## Value Proposition

### For BAIV Clients

**Problem (Risk):** Azure deployments lack assessed security posture, creating liability in AI system audits.

**Solution (Requirement):** Structured MCSB-aligned posture scoring with evidence artefacts.

**Benefit (Result):** Auditable AI Visibility improvement — security as a scoring dimension.

### For AIRL Engagements

**Problem (Risk):** CAF assessments are manual, framework-siloed, and disconnected from Azure configuration reality.

**Solution (Requirement):** NCSC-CAF × AZALZ ontology-driven gap analysis with automated evidence mapping.

**Benefit (Result):** Faster CAF readiness reports with Azure policy linkage — differentiated service.

### For PFI-ANTQ

**Problem (Risk):** eCommerce platform has undefined GDPR and payment security posture pre-MVP.

**Solution (Requirement):** GDPR-ONT × MCSB eCommerce template — privacy and security posture baseline.

**Benefit (Result):** Investor and partner confidence in platform security foundations from day one.

---

## Risk Register

| ID | Risk | Likelihood | Impact | Treatment |
| --- | --- | --- | --- | --- |
| R1 | Epic 30 GRC ontologies not yet complete (F30.2–F30.6 open) | Medium | High | F68 features gate on Epic 30 completion where needed; F68.2/F68.3 can proceed with published v1.0.0 ontologies |
| R2 | Epic 59 Supabase provisioning blocked — no DB for graph writes | High (current) | High | Phase F68 Supabase-dependent stories after Epic 59 S59.1 resolves |
| R3 | MCSB alignment drift — Microsoft updates benchmark | Low | Medium | MCSB-ONT version-pinned; update path via Epic 30 F30.6 registry |
| R4 | Template proliferation across PFIs creates maintenance burden | Low | Medium | Templates managed via EMC Document Distribution (Epic 58 pattern) |

---

## Dependencies

| Epic | Feature | Dependency Type |
| --- | --- | --- |
| Epic 10A | #127 | Security MVP — Supabase RBAC required for per-client scoping |
| Epic 21 | F21.19 | Join Pattern Registry — JP-VE-RMF-001 registration |
| Epic 30 | F30.2–F30.6 | GRC ontology completeness gate for F68.4, F68.5 |
| Epic 31 | F31.4 | PFC bootstrap + instance provisioning workflow |
| Epic 41 | F41.5 | EMC-ONT v5.0.0 updates for F68.6 |
| Epic 53 | F53.4 | Data sovereignty tier classification feeds Azure-RCS scoping |
| Epic 58 | #837 | PFC triad for template distribution |
| Epic 59 | #840 | Per-stage DB isolation for assessment graph writes |

---

## Related Documents

| Document | Product | Path |
| --- | --- | --- |
| GRC Series Architecture (Epic 30) | GRC | `PBS/STRATEGY/PFC-GRC-PLAN-Security-First-Platform-Implementation-v1.0.0.md` |
| PFI-AIRL GRC Foundations | GRC | `PBS/STRATEGY/PFI-AIRL/PFI-AIRL-GRC-BRIEF-02-PbD-SbD-Foundations-v2.0.0.md` |
| PFI-AIRL GRC Domains Compliance | GRC | `PBS/STRATEGY/PFI-AIRL/PFI-AIRL-GRC-BRIEF-06-Domains-Compliance-v2.0.0.md` |
| Sovereign Azure Deployment | STRAT | `PBS/STRATEGY/PFC-STRAT-BRIEF-Sovereign-Agentic-Azure-Deployment-v1.0.0.md` |
| Cloud Vendor Sovereignty (Epic 53) | STRAT | `PBS/STRATEGY/PFC-STRAT-BRIEF-Cloud-Vendor-Sovereignty-v1.0.0.md` |
| Azure Landing Zone Epic 33 | GRC | GitHub: [#505](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/505) |
| PFI-ANTQ Strategy On A Page | VE | `PBS/STRATEGY/PFI-ANTQ-STRAT-SOA-Strategy-On-A-Page-v1.0.0.md` |

---

*PFC-GRC-BRIEF-Azure-RCS-Assessment-Platform-v1.0.0.md*
*Epic 68 — Azure Assessment Platform via Azure-RCS Instance*
*Generated: 2026-03-11*
