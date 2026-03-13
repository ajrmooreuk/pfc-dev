# PFI-AIRL-GRC-BRIEF — Health Check Report: Strategic Deliverable & Interactive Dashboard

**Document ID:** PFI-AIRL-GRC-BRIEF-Health-Check-Report-Strategic-Deliverable-v1.0.0
**Date:** 2026-03-13
**Epic:** [Epic 74 (#1074)](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/1074)
**Feature:** F74.25 (Health Check Report Strategic Deliverable)
**Status:** Active
**Related Epics:** [Epic 73 (#1062)](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/1062) (Risk Intelligence), [Epic 67 (#986)](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/986) (QVF Skills), [Epic 69 (#1018)](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/1018) (SNG Directed Graph)

---

## 1. Executive Summary

The Health Check Report is the **primary deliverable** of the ALZ assessment pipeline — not just a document, but the strategic communication vehicle that translates technical findings into board-level decisions. The existing Word-based `CUSTOMER-Azure-Health-Check-v1.1.docx` (11 sections, 49 pages) is the proven starting point; this feature evolves it into:

- A **structured report** with its own sub-ontology (HCR-ONT) modelling report sections, findings, recommendations, and evidence chains
- An **interactive dashboard** with drill-down from executive summary to individual finding evidence
- A **backcasted strategic roadmap** projecting from current state through to desired destination
- An **independent verification layer** providing RMF-based assurance and evidence audit trails
- A **living document** that updates as posture changes — not a point-in-time snapshot that decays

The report IS the strategy and status communication. It answers: "Where are we? Where do we need to be? How do we get there? What does it cost? Is the evidence independently verified?"

---

## 2. Existing Report Structure (v1.1 Baseline)

The current Word template provides the proven table of contents:

```text
CUSTOMER Azure Health Check v1.1
├── Preface (document meta, authors, distribution, disclaimer)
├── 1. Executive Summary
│   └── 1.1 Document Purpose
├── 2. Azure Governance
│   ├── 2.1 Azure Regions
│   ├── 2.2 Management Groups
│   ├── 2.3 Subscriptions
│   ├── 2.4 Resource Groups
│   ├── 2.5 Naming Standards
│   ├── 2.6 Tagging Standards
│   ├── 2.7 Azure Policies
│   ├── 2.8 Cost Management
│   └── 2.9 Azure Advisor
├── 3. Identity & Access Management
│   ├── 3.1–3.4 Azure AD, Sync, Domains, RBAC
│   ├── 3.5–3.7 MFA, Conditional Access, Admin Units
│   └── 3.8–3.9 Password Protection, Secure Score
├── 4. Networking (VNet, LB, NSG, Routes, PIPs)
├── 5. Compute (Virtual Machines)
├── 6. Storage (Managed Disks, Storage Accounts)
├── 7. Security (Security Center, Key Vault, Update Mgmt, Remote Access)
├── 8. Monitoring & Logging (Monitor, Log Analytics, Platform Logs)
├── 9. Backup & Disaster Recovery
├── 10. Terms & Conditions
├── 11. Appendix
│   ├── 11.1 Azure Resources List
│   ├── 11.2 Summary of Recommendations
│   └── 11.3 Service Improvement Plan
└── 12. Glossary
```

### 2.1 What v1.1 Lacks (the gaps this feature fills)

| v1.1 Gap | F74.25 Addition |
|---|---|
| Static snapshot, no scoring | Three-state scoring per domain (Best Practice / Current / Desired) |
| No risk assessment | RMF-IS27005 risk scoring per finding, aggregate risk profile |
| No financial case | QVF Cyber Economics integration (ALE, ROI, insurance) |
| No backcasted roadmap | DMAIC backcasting from desired destination, phased OKRs |
| No independent verification | Evidence audit trail, RMF assurance, verification attestation |
| No interactive drill-down | Dashboard with executive → domain → finding → evidence drill |
| No cross-framework correlation | WAF ↔ CAF ↔ MCSB ↔ NCSC CAF finding correlation |
| Manual data collection | Agentic MCP extraction (azure-skills) |
| No continuous update | Living report, drift-detected, SPC-baselined |
| No AI/OWASP coverage | MCSB v2 AI controls + OWASP agentic/LLM/web/threat-model |

---

## 3. HCR-ONT — Health Check Report Sub-Ontology

### 3.1 Purpose

HCR-ONT models the report structure as a graph — sections, findings, recommendations, evidence chains, scores, risk assessments, and verification attestations. This makes the report queryable, composable, and updatable via ontology operations rather than document manipulation.

### 3.2 Entity Model

```text
HCR-ONT Entities
├── hcr:Report                     ← Top-level report container
│   ├── reportId, version, date, status
│   ├── customer, engagement
│   └── overallScore, riskRating
│
├── hcr:ReportSection              ← Maps to v1.1 chapters (Governance, IAM, etc.)
│   ├── sectionId, title, order
│   ├── domainScore (current/desired/bestPractice)
│   ├── riskRating (from RMF-IS27005)
│   └── framework (WAF/CAF/MCSB/AZALZ)
│
├── hcr:Finding                    ← Individual assessment finding
│   ├── findingId, severity, status
│   ├── currentState, desiredState, gap
│   ├── riskScore (impact × likelihood)
│   ├── controlRef (MCSB/WAF/CAF control ID)
│   └── evidence[] (links to hcr:Evidence)
│
├── hcr:Recommendation             ← Remediation recommendation
│   ├── recommendationId, priority
│   ├── effort (T-shirt size + hours)
│   ├── phase (1–4 backcasted phase)
│   ├── expectedImprovement (score delta)
│   ├── costEstimate (from pfc-cost-model)
│   └── valueCreated (from pfc-qvf-grc-roi)
│
├── hcr:Evidence                   ← Audit evidence chain
│   ├── evidenceId, type (KQL/policy/config/screenshot)
│   ├── source (azure-skill that extracted it)
│   ├── timestamp, hash
│   └── verificationStatus (unverified/verified/disputed)
│
├── hcr:RiskAssessment             ← Per-section RMF risk assessment
│   ├── inherentRisk, residualRisk
│   ├── treatmentStrategy (mitigate/accept/transfer/avoid)
│   ├── riskOwner
│   └── rmfContext (links to rmf:RiskContext)
│
├── hcr:Roadmap                    ← Backcasted strategic roadmap
│   ├── phases[] (hcr:RoadmapPhase)
│   ├── totalInvestment, totalValue, roi
│   └── targetDate
│
├── hcr:RoadmapPhase               ← Individual phase
│   ├── phaseId, name, duration
│   ├── projectedScore, investmentCost
│   ├── okrs[] (from pfc-okr)
│   └── recommendations[] (ordered by priority)
│
├── hcr:VerificationAttestation    ← Independent verification record
│   ├── verifierId, date, scope
│   ├── methodology (RMF/ISO27001/custom)
│   ├── findings[] (verification findings)
│   └── attestationStatus (pass/conditional/fail)
│
└── hcr:DashboardView              ← Dashboard configuration
    ├── viewId, type (executive/domain/finding/evidence)
    ├── filters, drillPath
    └── visualisationType (gauge/bar/heatmap/timeline/radar)
```

### 3.3 Ontology Relationships

```text
hcr:Report ──containsSection──→ hcr:ReportSection
hcr:ReportSection ──containsFinding──→ hcr:Finding
hcr:Finding ──hasEvidence──→ hcr:Evidence
hcr:Finding ──hasRecommendation──→ hcr:Recommendation
hcr:Finding ──assessedBy──→ hcr:RiskAssessment
hcr:Recommendation ──inPhase──→ hcr:RoadmapPhase
hcr:RoadmapPhase ──partOf──→ hcr:Roadmap
hcr:Report ──hasRoadmap──→ hcr:Roadmap
hcr:Report ──verifiedBy──→ hcr:VerificationAttestation
hcr:Evidence ──verifiedBy──→ hcr:VerificationAttestation
hcr:RiskAssessment ──referencesRMF──→ rmf:RiskContext
hcr:Finding ──mapsToControl──→ mcsb:SecurityControl | waf:Pillar | caf:ReadinessArea
```

### 3.4 Cross-Ontology Bridges

| HCR-ONT Entity | Bridges To | Purpose |
|---|---|---|
| `hcr:Finding.controlRef` | `mcsb:SecurityControl`, `waf:WellArchitectedPillar` | Control mapping |
| `hcr:RiskAssessment` | `rmf:Risk`, `rmf:RiskTreatment` | RMF risk framework |
| `hcr:Recommendation.costEstimate` | `rmf:RiskTreatment.costEstimate` | Treatment cost |
| `hcr:Recommendation.valueCreated` | `qvf:CashFlow[COST_AVOIDANCE]` | Financial value |
| `hcr:RoadmapPhase.okrs` | `okr:Objective`, `okr:KeyResult` | Strategic alignment |
| `hcr:ReportSection.domainScore` | Three-state scoring model (F74.14) | Assessment scoring |
| `hcr:DashboardView` | Visualiser compliance-reporter.js | Rendering |

---

## 4. Enhanced Report Structure (v2.0)

The evolved report structure extends v1.1 with strategic analysis, risk, and financial sections:

```text
Azure Health Check Report v2.0 (HCR-ONT structured)
│
├── FRONT MATTER
│   ├── Cover (customer branding, engagement ref, classification)
│   ├── Preface (authors, distribution, revision history, disclaimer)
│   └── Executive Dashboard (1-page traffic light + key metrics)
│
├── PART I: EXECUTIVE SUMMARY
│   ├── 1. Strategic Context
│   │   ├── 1.1 Engagement Purpose & Scope
│   │   ├── 1.2 VE-Aligned Objectives (from VSOM/OKR discovery)
│   │   └── 1.3 Assessment Methodology (DMAIC + Three-State Scoring)
│   ├── 2. Executive Scorecard
│   │   ├── 2.1 Overall Posture Score (unified gauge)
│   │   ├── 2.2 Domain Heatmap (governance → DR, RAG per domain)
│   │   ├── 2.3 Top 5 Critical Findings
│   │   └── 2.4 Risk Profile Summary (RMF aggregate)
│   └── 3. Strategic Recommendation
│       ├── 3.1 Backcasted Roadmap Summary (4 phases, timeline)
│       ├── 3.2 Investment & ROI (Cyber Value Equation output)
│       └── 3.3 Recommended Next Steps
│
├── PART II: DOMAIN ASSESSMENTS (one chapter per domain)
│   ├── 4. Azure Governance (MG, Subs, RG, Naming, Tagging, Policy, Cost, Advisor)
│   ├── 5. Identity & Access Management (Entra ID, RBAC, MFA, CA, PIM)
│   ├── 6. Networking (VNet, Hub/Spoke, NSG, Routes, Firewall, DNS, PIPs)
│   ├── 7. Compute (VMs, AKS, App Services, Functions)
│   ├── 8. Data & Storage (Managed Disks, Storage Accounts, Databases, Encryption)
│   ├── 9. Security Posture (Defender, Key Vault, MCSB Compliance, OWASP)
│   ├── 10. AI & Intelligent Workloads (MCSB v2 AI-1 to AI-7, OWASP Agentic/LLM)
│   ├── 11. Monitoring, Logging & Alerting (Monitor, Log Analytics, Sentinel)
│   └── 12. Business Continuity & DR (Backup, ASR, RPO/RTO, Runbooks)
│
│   Each domain chapter contains:
│   ├── Domain Score (current / desired / best practice gauge)
│   ├── Three-State Gap Visualisation
│   ├── Findings Table (severity, control ref, current state, gap)
│   ├── Risk Assessment (RMF inherent → residual per finding)
│   ├── Cross-Framework Correlation (WAF ↔ MCSB ↔ CAF mapping)
│   ├── Recommendations (prioritised by VE weight × risk × Kano)
│   └── Evidence Summary (KQL, policy, config — linked to evidence pack)
│
├── PART III: STRATEGIC ANALYSIS
│   ├── 13. Cross-Framework Correlation Analysis
│   │   ├── 13.1 WAF ↔ MCSB Control Overlap
│   │   ├── 13.2 CAF ↔ AZALZ Readiness Gaps
│   │   ├── 13.3 OWASP ↔ MCSB Application Security
│   │   └── 13.4 Regulatory Mapping (GDPR, NCSC CAF, NIS2)
│   ├── 14. Risk Assessment
│   │   ├── 14.1 Risk Methodology (RMF-IS27005)
│   │   ├── 14.2 Risk Register (per finding, inherent → residual)
│   │   ├── 14.3 Risk Heatmap (impact × likelihood)
│   │   ├── 14.4 Risk Treatment Recommendations (mitigate/accept/transfer/avoid)
│   │   └── 14.5 Residual Risk Profile (post-remediation projection)
│   ├── 15. Financial Analysis (QVF Cyber Economics)
│   │   ├── 15.1 Annualised Loss Expectancy (ALE per threat scenario)
│   │   ├── 15.2 GRC Investment Case (ROI, NPV, payback)
│   │   ├── 15.3 Cyber Insurance Impact (premium optimisation)
│   │   ├── 15.4 Cyber Value Equation (unified financial case)
│   │   └── 15.5 Sensitivity Analysis (optimistic / base / pessimistic)
│   └── 16. Backcasted Strategic Roadmap
│       ├── 16.1 Desired Destination (from VE discovery)
│       ├── 16.2 Phase Plan (4 phases, backcasted from destination)
│       ├── 16.3 OKR Framework (per phase)
│       ├── 16.4 Resource & Capability Requirements
│       ├── 16.5 Benefits Realisation Timeline
│       └── 16.6 Risk Reduction Trajectory
│
├── PART IV: ASSURANCE & VERIFICATION
│   ├── 17. Independent Verification
│   │   ├── 17.1 Verification Methodology
│   │   ├── 17.2 Evidence Audit Trail (hash-chained, timestamped)
│   │   ├── 17.3 Verification Findings
│   │   └── 17.4 Attestation Statement
│   └── 18. Continuous Assurance Plan
│       ├── 18.1 SPC Baselines & Control Limits
│       ├── 18.2 Drift Detection Configuration
│       ├── 18.3 Re-assessment Schedule
│       └── 18.4 Dashboard Access & Permissions
│
├── PART V: APPENDICES
│   ├── A. Azure Resource Inventory
│   ├── B. Full Recommendations Register (all findings, all priorities)
│   ├── C. Service Improvement Plan (phased)
│   ├── D. Evidence Pack (KQL results, policy exports, config snapshots)
│   ├── E. Ontology Cross-Reference (HCR-ONT → MCSB/WAF/CAF/AZALZ mappings)
│   └── F. Glossary of Terms
│
└── BACK MATTER
    └── Document Control, Classification, Distribution
```

---

## 5. Interactive Dashboards & Drill-Down

### 5.1 Dashboard Hierarchy

```text
LEVEL 0: Executive Dashboard (1-page)
├── Unified posture gauge (0–100%)
├── Domain heatmap (RAG per domain)
├── Top 5 critical findings
├── Risk profile radar chart
├── Roadmap timeline (Gantt)
└── Cyber Value Equation summary (£)
    │
    ↓ CLICK domain
LEVEL 1: Domain Dashboard
├── Three-state gauge (current / desired / best practice)
├── Findings list (sortable by severity, risk, VE priority)
├── Cross-framework correlation view
├── Risk heatmap for domain
└── Recommendations (prioritised, effort-tagged)
    │
    ↓ CLICK finding
LEVEL 2: Finding Detail
├── Finding description, severity, control reference
├── Current state evidence (screenshot, KQL, config)
├── Desired state definition (from VE/WAF/MCSB)
├── Risk assessment (RMF impact × likelihood)
├── Remediation recommendation (effort, cost, value)
└── Evidence chain (timestamped, hash-verified)
    │
    ↓ CLICK evidence
LEVEL 3: Evidence Viewer
├── Raw evidence (KQL result, policy JSON, config export)
├── Extraction source (which azure-skill MCP call)
├── Timestamp and hash
├── Verification status (unverified / verified / disputed)
└── Audit trail (who verified, when, methodology)
```

### 5.2 Dashboard Visualisation Types

| View | Type | Data Source |
|---|---|---|
| Posture gauge | Circular gauge (compliance-reporter pattern) | pfc-grc-posture unified score |
| Domain heatmap | Grid with RAG colour coding | Three-state scoring model |
| Risk heatmap | Impact × Likelihood matrix | RMF-IS27005 risk scores |
| Radar chart | Multi-axis domain comparison | Domain scores vs best practice |
| Gantt timeline | Phase roadmap with milestones | hcr:Roadmap phases |
| SPC control chart | Time series with UCL/LCL | pfc-grc-baseline historical data |
| Trend sparklines | Inline trend per domain | Supabase historical scores |
| Sankey diagram | Finding → Recommendation → Phase flow | HCR-ONT relationships |
| Financial waterfall | Cost → Value breakdown | QVF Cyber Economics outputs |

### 5.3 Dashboard Technology

Leverages existing visualiser infrastructure:
- **vis-network v9.1.2** for graph-based views (ontology explorer, correlation maps)
- **compliance-reporter.js** pattern for gauge and bar chart rendering
- **Supabase real-time** for live dashboard updates (Epic 59)
- **Export:** PDF, HTML, interactive web (GitHub Pages or customer-hosted)

---

## 6. Risk Assessment Integration

### 6.1 Overarching RMF Framework

Every health check finding passes through the RMF-IS27005 risk assessment:

```text
Finding                    RMF-IS27005 Assessment
───────                    ──────────────────────
pfc-alz-assess-* output → rmf:RiskContext (scoped to customer)
                         → rmf:Asset (affected Azure resource)
                         → rmf:Threat (threat scenario from MCSB/OWASP)
                         → rmf:Vulnerability (the finding itself)
                         → rmf:Risk (impact × likelihood → risk rating)
                         → rmf:RiskTreatment (recommendation + cost)
                         → rmf:RiskMonitoringPlan (continuous assurance)
```

### 6.2 Risk Scoring Per Finding

| Dimension | Scale | Source |
|---|---|---|
| Impact | 1–5 (Negligible → Catastrophic) | RMF-IS27005-ONT |
| Likelihood | 1–5 (Rare → Almost Certain) | RMF-IS27005-ONT + threat intelligence |
| Risk Rating | Impact × Likelihood (1–25) | Calculated |
| Risk Level | Low (1–6), Medium (7–12), High (13–18), Critical (19–25) | Threshold |
| ALE | £ per year | pfc-qvf-cyber-impact (financial overlay) |

### 6.3 Independent Verification

The verification layer provides assurance that:
1. **Evidence is authentic** — hash-chained, timestamped, source-attributed
2. **Methodology is sound** — RMF-IS27005 compliant, scoring calibrated
3. **Findings are reproducible** — re-run azure-skills MCP calls produce consistent results
4. **Recommendations are proportionate** — risk-based, VE-weighted, cost-justified

```text
Verification Process:
1. Evidence integrity check (hash verification)
2. Methodology audit (scoring model calibration)
3. Sample re-execution (re-run 10% of MCP calls for consistency)
4. Cross-reference validation (findings consistent across frameworks)
5. Attestation statement (signed, scoped, dated)
```

---

## 7. Backcasting & Roadmap Generation

### 7.1 From Future Vision to Current State

The roadmap is generated **backwards** from the customer's desired destination:

```text
DESIRED DESTINATION (from VE Discovery)
├── Domain scores: 80–90% across all domains
├── Risk level: Low–Medium (no Critical findings)
├── Compliance: MCSB >85%, OWASP findings resolved
├── Insurance: Preferred risk tier, broadest coverage
└── Continuous assurance: SPC baselines, drift detection active
    ↑
PHASE 4: OPTIMISE (Month 9+)
├── Near best practice across all domains
├── Continuous improvement operational
└── Benefit realisation tracking active
    ↑
PHASE 3: SUSTAIN (Month 7–9)
├── SPC baselines established
├── Drift detection active
├── Recurring healthcheck automated
└── Insurance renewal with improved evidence
    ↑
PHASE 2: TRANSFORM (Month 3–6)
├── Critical and High gaps closed
├── MCSB compliance >70%
├── Risk reduced from Critical → Medium
└── Quick ROI demonstrated
    ↑
PHASE 1: FOUNDATION (Month 1–2)
├── Quick wins deployed (high impact, low effort)
├── Blockers removed, team trained
├── Immediate risk reduction
└── Assessment baseline established
    ↑
NOW: Health Check Report delivered
```

### 7.2 OKR-Aligned Milestones

Each phase generates OKRs via pfc-okr:

```text
Phase 2 Objective: "Reduce Azure compliance risk from Critical to Medium"
  KR1: Close all 7 Critical MCSB findings by Week 8
  KR2: Achieve MCSB compliance score >70% across all domains by Week 12
  KR3: Implement automated RBAC review for all subscriptions by Week 10
  KR4: Complete OWASP threat model for all public-facing applications by Week 12

  Investment: £30K (via pfc-cost-model)
  Value: £120K annual risk avoidance (via pfc-qvf-grc-roi)
  ROI: 4.0x
```

---

## 8. HCR Skills

### 8.1 Skill Definitions

| Skill | Purpose | Type | Feature |
|---|---|---|---|
| `pfc-hcr-compose` | Compose health check report from all skill chain outputs, following HCR-ONT structure | AGENT_SUPERVISED | F74.25a |
| `pfc-hcr-analyse` | Deep cross-domain analysis — correlate findings across WAF/CAF/MCSB/AZALZ, identify systemic patterns | AGENT_AUTONOMOUS | F74.25b |
| `pfc-hcr-verify` | Independent verification — evidence audit trail, methodology audit, attestation | AGENT_SUPERVISED | F74.25c |
| `pfc-hcr-dashboard` | Generate interactive dashboard views with drill-down (executive → domain → finding → evidence) | AGENT_AUTONOMOUS | F74.25d |
| `pfc-hcr-roadmap` | Backcast-driven roadmap generation — phases, OKRs, investment, benefits, risk trajectory | AGENT_SUPERVISED | F74.25e |

### 8.2 Skill Chain Position

```text
ASSESSMENT SKILLS              HCR SKILLS                      DELIVERY
─────────────────              ──────────                      ────────

pfc-alz-assess-waf ──┐
pfc-alz-assess-caf ──┤
pfc-alz-assess-cyber ┤→ pfc-hcr-analyse (cross-correlate) → findings
pfc-alz-assess-health┘         │
                                ↓
pfc-alz-strategy ──────→ pfc-hcr-roadmap (backcast phases) → roadmap
                                │
pfc-qvf-cyber-* ──────→ pfc-hcr-compose (assemble report) → HCR v2.0
                                │
rmf risk-* skills ─────→ pfc-hcr-verify (assurance layer) → attestation
                                │
                        pfc-hcr-dashboard (interactive) → drill-down views
                                │
                                ↓
                        pfc-narrative → pfc-slide-engine → pfc-proposal-composer
```

### 8.3 Relationship to Existing Skills

| Existing Skill | HCR Skill Relationship |
|---|---|
| pfc-alz-strategy (F74.17) | pfc-hcr-roadmap consumes strategy analysis, materialises into report roadmap chapter |
| pfc-grc-mcsb-report (F74.20) | Domain-level MCSB reports feed into HCR domain chapters |
| pfc-narrative | Consumes HCR-ONT structured data for narrative generation |
| pfc-slide-engine | Generates slide decks from HCR dashboard views |
| pfc-proposal-composer | Generates client proposals from HCR executive summary |
| compliance-reporter.js | Dashboard rendering component (visualiser) |

---

## 9. DMAIC Integration

The Health Check Report maps to DMAIC as the primary output of each phase:

| DMAIC Phase | Report Section | HCR Skill |
|---|---|---|
| **Define** | Part I: Executive Summary + scope | pfc-hcr-compose (front matter + context) |
| **Measure** | Part II: Domain Assessments | pfc-hcr-analyse (cross-correlation) |
| **Analyse** | Part III: Strategic Analysis (risk + financial + roadmap) | pfc-hcr-analyse + pfc-hcr-roadmap |
| **Improve** | Part III §16: Roadmap + Part IV: Assurance Plan | pfc-hcr-roadmap + pfc-hcr-verify |
| **Control** | Part IV: Continuous Assurance + Dashboard | pfc-hcr-dashboard + pfc-hcr-verify |

The report itself is the **strategic communication** — it IS the output of the DMAIC process, not a side effect.

---

## 10. Competitive Positioning

### 10.1 What Competitors Deliver

```text
Typical Azure assessment output:
├── Spreadsheet of findings (Excel, 500+ rows)
├── Static PDF (point-in-time, stale in weeks)
├── No financial case (findings without £ impact)
├── No roadmap (just a list of things to fix)
├── No risk scoring (everything is "Critical" or "High")
└── No verification (trust us)
```

### 10.2 What We Deliver

```text
PFC Health Check Report v2.0:
├── Structured report (ontology-backed, queryable, composable)
├── Interactive dashboards (drill from executive to evidence)
├── Financial case (ALE, ROI, insurance impact, Cyber Value Equation)
├── Backcasted roadmap (phased, OKR-aligned, benefit-tracked)
├── RMF risk assessment (per finding, inherent → residual)
├── Independent verification (evidence audit trail, attestation)
├── Continuous assurance (SPC baselines, drift detection, living report)
├── Cross-framework correlation (WAF ↔ MCSB ↔ CAF ↔ OWASP)
└── AI security coverage (MCSB v2 + OWASP agentic/LLM)
```

This is the report that wins renewals and referrals. The insurance broker wants it. The board needs it. The technical team uses it daily.

---

## 11. Recommendations

1. **Approve F74.25** — Health Check Report Strategic Deliverable
2. **Build HCR-ONT v1.0.0** — register in ontology library (RCSG-Series or new Reporting series)
3. **Scaffold 5 HCR skills** in pfc-dev — parallel to GRC-MCSB and QVF skills
4. **Prototype dashboard** using existing compliance-reporter.js patterns
5. **Extend v1.1 template** — don't replace, evolve (backwards-compatible structure)
6. **Add HCR test data** to TDD plan (TD-HCR-GOLD, TD-HCR-PARTIAL, TD-HCR-REGULATED)
7. **Coordinate with Epic 69** (SNG) — HCR-ONT as a graph node in directed graph orchestration

---

## 12. Human Checkpoints

- [ ] HCR-ONT entity model approved
- [ ] Report structure v2.0 validated against customer expectations
- [ ] Dashboard drill-down hierarchy confirmed
- [ ] Verification methodology agreed (RMF scope, attestation format)
- [ ] Backcasting approach validated (4-phase model fits customer contexts)
- [ ] Financial sections confirmed (ALE methodology, insurance model)

---

*PFI-AIRL-GRC-BRIEF-Health-Check-Report-Strategic-Deliverable-v1.0.0*
*Epic 74 (#1074) — F74.25*
