# INS Portfolio-to-Programme v1.0.0

**Vertical:** Insurance Advisory Practice
**Ontology Instances:** `ppm-ins-template-v1.0.0.jsonld`, `ppm-ins-instance-v1.0.0.jsonld`, `pe-ins-process-template-v1.0.0.jsonld`, `pe-ins-process-instance-v1.0.0.jsonld`
**Schema:** PPM-ONT v4.0.0 + PE-ONT v3.0.0 (OAA v6.1.0)
**Date:** 2026-02-12
**Status:** Active

---

## 1. Portfolio Overview

### Insurance Advisory Practice Portfolio FY2026

The Insurance Advisory Practice Portfolio encompasses all insurance sector digital transformation engagements, aligning advisory services with organisational strategy across four core workstreams.

| Attribute | Value |
|-----------|-------|
| Portfolio Name | Insurance Advisory Practice Portfolio FY2026 |
| Owner | Azlan Consulting Ltd |
| Budget | $3.5M |
| Active Engagements | 4 |
| Pipeline Opportunities | 3 |
| Governance | PRINCE2 Agile + MSP |
| Maturity Level | 3 (Defined) |

### Strategic Objectives

1. Deliver 4 insurance digital transformation engagements in FY2026
2. Achieve 85%+ client satisfaction score across all engagements
3. Build reusable insurance vertical IP reducing delivery time by 30%
4. Establish RCS compliance expertise as market differentiator in insurance
5. Pipeline 3 new insurance engagements for FY2027

---

## 2. Programme Structure

### Insurance Digital Transformation Programme (INS-DTP-001)

A coordinated programme delivering 4 workstreams for insurance sector clients, with shared governance and cross-workstream dependency management.

| Attribute | Value |
|-----------|-------|
| Programme ID | INS-DTP-001 |
| Budget | $1.2M |
| Duration | 40 weeks (March - December 2026) |
| Team Size | 20 |
| Projects | 4 |
| Governance | Programme Board + Workstream Leads + Client Steering Committee |

### Programme Governance

| Forum | Frequency | Participants | Purpose |
|-------|-----------|-------------|---------|
| Programme Board | Monthly | Programme Dir, Client CTO, Workstream Leads | Strategic decisions, budget, risks |
| Workstream Leads | Weekly | All 4 workstream leads + Programme Dir | Cross-workstream coordination |
| Client Steering Committee | Fortnightly | Client CTO, CISO, CFO + Programme Dir | Client alignment and approvals |

---

## 3. Project Registry

### 3.1 INS-EA-001: Insurance EA Assessment

| Attribute | Value |
|-----------|-------|
| Type | Assessment |
| Methodology | TOGAF ADM + Insurance Vertical Extensions |
| Budget | $180K |
| Duration | 12 weeks |
| Team | 4 |
| Status | Planning |
| Risk | Medium |

**Deliverables:**
1. Current State Architecture Blueprint (Week 6)
2. Target State Architecture Blueprint (Week 9)
3. Gap Analysis Report (Week 11)
4. Transformation Roadmap (Week 12)
5. Insurance Regulatory Architecture Overlay (Week 12)

### 3.2 INS-COMP-001: Insurance Compliance Uplift

| Attribute | Value |
|-----------|-------|
| Type | Compliance |
| Methodology | RCS Unified Compliance Assessment |
| Budget | $350K |
| Duration | 16 weeks |
| Team | 5 |
| Status | Planning |
| Risk | High |
| Dependency | EA Assessment (INS-EA-001) |

**Deliverables:**
1. Compliance Baseline Assessment (Week 4)
2. Cross-Framework Gap Analysis (Week 7)
3. Remediation Roadmap (Week 10)
4. Insurance Regulatory Mapping — Solvency II, IDD, DORA (Week 13)
5. Continuous Monitoring Configuration (Week 16)

**Frameworks Covered:** MCSB, GDPR, PII, Solvency II, IDD, DORA

### 3.3 INS-AIR-001: Insurance AI Readiness Assessment

| Attribute | Value |
|-----------|-------|
| Type | Assessment |
| Methodology | AIRL AI Readiness Assessment |
| Budget | $120K |
| Duration | 8 weeks |
| Team | 3 |
| Status | Planning |
| Risk | Medium |
| Dependency | EA Assessment (INS-EA-001) |

**Deliverables:**
1. AI Maturity Baseline — 5 dimensions (Week 3)
2. Insurance AI Use Case Prioritisation (Week 5)
3. AI Gap Analysis (Week 6)
4. AI Transformation Roadmap (Week 8)
5. AI Governance Framework Recommendations (Week 8)

**Insurance AI Use Cases:** Underwriting automation, Claims processing AI, Risk modelling, Customer service chatbots

### 3.4 INS-MIG-001: Insurance Platform Migration to Azure

| Attribute | Value |
|-----------|-------|
| Type | Migration |
| Methodology | Azure CAF + Insurance Regulatory Overlay |
| Budget | $550K |
| Duration | 24 weeks |
| Team | 8 |
| Status | Planning |
| Risk | High |
| Dependencies | EA Assessment + Compliance Uplift |

**Deliverables:**
1. Migration Discovery & Assessment (Week 4)
2. Azure Landing Zone Design — Insurance-compliant (Week 8)
3. Data Migration Plan (Week 11)
4. Application Modernisation Roadmap (Week 14)
5. Insurance Compliance Controls Deployment (Week 21)
6. Post-Migration Validation Report (Week 24)

### Project Dependency Map

```
INS-EA-001 (EA Assessment) ----+----> INS-COMP-001 (Compliance Uplift)
     Weeks 1-12                |          Weeks 7-22
                               |
                               +----> INS-AIR-001 (AI Readiness)
                               |          Weeks 7-14
                               |
                               +----> INS-MIG-001 (Platform Migration)
                                          Weeks 15-38
                                          (also depends on COMP-001)
```

---

## 4. Process Lifecycle

### EA Assessment Process (PE-ONT)

The Insurance EA Assessment follows a 5-phase process defined in `pe-ins-process-template-v1.0.0.jsonld`:

| Phase | Duration | Gate | Key Activities |
|-------|----------|------|---------------|
| 1. Discovery | 3 weeks | G1: Completeness (80%) | Stakeholder interviews, document review, regulatory landscape mapping |
| 2. Analysis | 3 weeks | G2: Quality (85%) | Architecture pattern analysis, tech debt, regulatory gap analysis |
| 3. Design | 3 weeks | G3: Approval (90%), G4: Compliance (85%) | Target state workshops, ADRs, Azure patterns, compliance overlay |
| 4. Roadmap | 2 weeks | -- | Gap analysis, prioritisation, roadmap creation |
| 5. Governance | 1 week | -- | Board setup, knowledge transfer, monitoring config |

### Insurance-Specific Process Patterns

**Compliance-First Architecture Assessment**
- Front-load regulatory analysis in Discovery phase
- Blocking compliance gate before Design phase
- AI compliance scanner throughout assessment
- Regulatory requirements inform ADRs
- Result: Zero late-stage compliance surprises

**Risk-Driven Prioritisation**
- Multi-dimensional risk scoring (architecture + compliance + operational)
- Objective roadmap ranking by composite risk reduction per investment
- AI risk assessor for unbiased scoring
- Result: Defensible, board-confident transformation sequencing

### Process Artefacts

| Phase | Artefact | Format | Mandatory |
|-------|----------|--------|-----------|
| Analysis | Current State Blueprint | ArchiMate + Markdown | Yes |
| Design | Target State Blueprint | ArchiMate + Markdown | Yes |
| Roadmap | Gap Analysis Report | Markdown + Spreadsheet | Yes |
| Roadmap | Transformation Roadmap | Markdown + Gantt | Yes |
| Analysis | Insurance Regulatory Overlay | Markdown + Ontology | Yes |

---

## 5. AI Augmentation

### AI Agent Skills

| Agent | Type | Phase | Autonomy | Key Capability |
|-------|------|-------|----------|---------------|
| Insurance Compliance Scanner | Analysis | Analysis, Design | Supervised | Regulatory requirement mapping across Solvency II, IDD, DORA, GDPR, MCSB |
| Architecture Risk Assessor | Analysis | Analysis | Supervised | Technology debt scoring, dependency complexity, insurance operational risk |
| Gap Analysis Generator | Generation | Roadmap | Supervised | Current vs. target comparison, severity scoring, insurance-specific categorisation |

### AI Augmentation Results (Exemplar Execution)

| Metric | Manual Estimate | AI-Augmented Actual | Savings |
|--------|----------------|-------------------|---------|
| Total Assessment Hours | 480 | 310 | 35.4% |
| Gap Analysis Generation | 40 hours | 4 hours | 90% |
| Compliance Scanning | 60 hours/cycle | Continuous | 100% |
| Risk Assessment | 80 hours | 45 hours | 44% |
| Overall Automation Level | 0% | 35% | -- |

### Validated Hypotheses

1. **Compliance-First Pattern**: Front-loading regulatory compliance analysis reduced compliance-driven rework by 100% (target: 40%). Zero compliance-driven design changes in Phase 3. **Confidence: 85%**

2. **AI Efficiency Hypothesis**: AI agents reduced assessment effort by 35.4% (target: 35%). Gap analysis: 90% effort reduction. Compliance scanning: from periodic to continuous. **Confidence: 80%**

---

## 6. Success Metrics & KPIs

### Programme-Level KPIs

| KPI | Target | Exemplar Actual | Status |
|-----|--------|----------------|--------|
| Programme Delivery On-Time | 90% milestones | 100% | Exceeded |
| Client Satisfaction | 4.0/5.0 | 4.5/5.0 | Exceeded |
| Budget Variance | <10% | 0% (on budget) | Met |
| Reusable IP Created | 3 templates | 4 templates | Exceeded |

### EA Assessment Process Metrics

| Metric | Target | Actual | Method |
|--------|--------|--------|--------|
| Architecture Domain Coverage | 100% | 100% | Manual |
| Regulatory Coverage Score | 85% | 87% | Automated (AI scanner) |
| Architecture Maturity (Current) | Assess | 2.3/5.0 | Manual |
| Critical/High Gaps | <10 | 12 | Hybrid |
| Gate Pass Rate | 100% | 100% (4/4) | Manual |
| AI Effort Savings | 35% | 35.4% | Tracked |

### Programme Milestones

| # | Milestone | Date | Gate |
|---|-----------|------|------|
| M1 | EA Assessment Complete | 2026-05-23 | G1 |
| M2 | Compliance Baseline Established | 2026-05-09 | G1 |
| M3 | AI Readiness Assessed | 2026-06-06 | G2 |
| M4 | Remediation Plan Approved | 2026-06-20 | G2 |
| M5 | Landing Zone Deployed | 2026-08-07 | G3 |
| M6 | Migration Complete | 2026-12-05 | G4 |
| M7 | Programme Close-Out | 2026-12-31 | G4 |

---

## 7. RCSG Compliance Integration

### Framework Coverage

The Insurance Advisory Programme integrates with RCSG-Series ontologies for comprehensive regulatory compliance:

| Framework | Ontology | Coverage | Project |
|-----------|----------|----------|---------|
| Microsoft Cloud Security Benchmark | MCSB-ONT | Cloud security controls | Compliance Uplift + Migration |
| GDPR | GDPR-ONT | Data protection | Compliance Uplift |
| PII Protection | PII-ONT | Personal data safeguards | Compliance Uplift |
| Azure Security Baseline | AZALZ-ONT | Azure-native controls | Migration |
| Solvency II | Insurance Extension | Capital and risk management | Compliance Uplift |
| IDD (Insurance Distribution) | Insurance Extension | Distribution channel compliance | Compliance Uplift |
| DORA (Digital Resilience) | Insurance Extension | Digital operational resilience | Compliance Uplift + Migration |

### Cross-Framework Mapping

The RCS platform (used in INS-COMP-001) automatically maps overlapping requirements across all 7 frameworks, identifying:
- **Shared controls** that satisfy multiple frameworks simultaneously
- **Intersection gaps** where framework requirements conflict or create additional obligations
- **Remediation efficiency** — single fixes that close gaps in 3+ frameworks

### Compliance Metrics

| Metric | Baseline | Post-Assessment | Target (Post-Remediation) |
|--------|----------|-----------------|--------------------------|
| MCSB Coverage | 58% | 72% | 90% |
| GDPR Coverage | 65% | 78% | 92% |
| PII Coverage | 60% | 75% | 88% |
| Solvency II Architecture | 45% | 70% | 85% |
| IDD Compliance | 55% | 68% | 85% |
| DORA Resilience | 40% | 65% | 80% |
| Cross-Framework Average | 54% | 71% | 87% |

---

## 8. Design Director Connection

### How INS Programme Feeds the Design Director Pipeline

The Insurance Advisory Programme sits at the **PPM -> PE** stage of the Design Director pipeline:

```
VSOM (Strategy) --> OKR (Objectives) --> VP (Value Prop) --> PMF (Market Fit)
                                          |
                                    AIRL VP + RCS VP
                                    (feed INS programme requirements)
                                          |
                                          v
PPM (Portfolio) --> PE (Process) --> EFS (Features) --> DS-ONT (Design) --> Code
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
INS PROGRAMME HERE
```

### Upstream Integration

| Source | Integration | Data Flow |
|--------|------------|-----------|
| AIRL VP | AI Readiness assessment requirements | VP pain points -> INS-AIR-001 project scope |
| RCS VP | Compliance assessment requirements | VP compliance needs -> INS-COMP-001 project scope |
| VSOM-ONT | Strategic objectives | Insurance transformation strategy -> portfolio objectives |
| ORG-ONT | Client context | Client org data -> programme scoping |

### Downstream Consumers

| Consumer | Integration | Data Flow |
|----------|------------|-----------|
| EFS-ONT | Programme deliverables -> Epics/Features | PBS items map to EFS execution backlog |
| DS-ONT | Design system component requirements | Dashboard/reporting UI components from RCS + AIRL |
| EMC-ONT | Composition orchestration | PPM category triggers PPM + EFS + PE composition |

### EMC Composition

| Category | Ontologies Composed | Trigger |
|----------|-------------------|---------|
| PPM | PPM-ONT + EFS-ONT + PE-ONT | Programme delivery lifecycle |
| COMPLIANCE | MCSB-ONT + GDPR-ONT + PII-ONT + AZALZ-ONT | INS-COMP-001 compliance workstream |
| PRODUCT | VP-ONT + PMF-ONT + PE-ONT + CA-ONT | AIRL/RCS VP feeding programme requirements |

---

## Key Lessons Learned (Exemplar Execution)

1. **Compliance-first pattern validated** -- Zero late-stage compliance surprises when regulatory analysis is front-loaded in Discovery
2. **AI agents essential for insurance breadth** -- Insurance regulatory landscape too broad for manual scanning alone
3. **Risk-driven prioritisation produces defensible roadmaps** -- Board and steering committee confidence in objective risk scoring
4. **DORA requirements expanding rapidly** -- Build automatic regulatory update scanning into process
5. **Stakeholder availability is critical path** -- Schedule all interviews in first 2 weeks of Discovery

---

*Generated from PPM-ONT v4.0.0 + PE-ONT v3.0.0 instance data. Last updated: 2026-02-12.*
*Cross-references: VSOM-ONT, ORG-ONT, EFS-ONT, VP-ONT (AIRL, RCS), MCSB-ONT, GDPR-ONT, PII-ONT, AZALZ-ONT, EA-ONT, DS-ONT, EMC-ONT*
