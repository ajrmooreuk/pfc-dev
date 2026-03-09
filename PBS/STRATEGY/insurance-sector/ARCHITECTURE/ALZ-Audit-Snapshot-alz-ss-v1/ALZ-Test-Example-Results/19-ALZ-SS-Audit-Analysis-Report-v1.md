# ALZ Snapshot Audit - Detailed Analysis Report

> **Date:** 2026-02-03 | **Version:** 1.1.0 | **Ontology:** v1.2.0
> **Test Data Instances:** 96 | **Entities:** 16 | **Validation:** PASS

---

## Table of Contents

1. [Test Data Overview](#1-test-data-overview)
2. [Entity Analysis](#2-entity-analysis)
3. [Compliance Framework Analysis](#3-compliance-framework-analysis)
4. [WAF Pillar Analysis](#4-waf-pillar-analysis)
5. [CAF Phase Analysis](#5-caf-phase-analysis)
6. [Audit Workflow Analysis](#6-audit-workflow-analysis)
7. [Control Mapping Analysis](#7-control-mapping-analysis)
8. [Findings Analysis](#8-findings-analysis)
9. [Insurance Sector Requirements](#9-insurance-sector-requirements)
10. [Relationship Analysis](#10-relationship-analysis)
11. [Validation Summary](#11-validation-summary)

---

## 1. Test Data Overview

### Distribution Analysis

The test data follows the OAA 60-20-10-10 distribution pattern:

```mermaid
pie showData
    title Test Case Distribution by Category
    "Typical (Target: 60%)" : 58
    "Edge Cases (Target: 20%)" : 16
    "Boundary (Target: 10%)" : 11
    "Invalid (Target: 10%)" : 11
```

| Category | Target | Actual | Instances | Variance |
|----------|--------|--------|-----------|----------|
| Typical | 60% | 60.4% | 58 | +0.4% |
| Edge Cases | 20% | 16.7% | 16 | -3.3% |
| Boundary | 10% | 11.5% | 11 | +1.5% |
| Invalid | 10% | 11.5% | 11 | +1.5% |

### Entity Instance Distribution

```mermaid
bar
    title Instances per Entity (6 per entity target)
    x-axis ["Framework", "Control", "WAFPillar", "CAFPhase", "Audit", "Query", "Result", "Mapping", "Resource", "Impl", "Assessment", "WAFAssess", "Finding", "Deliverable", "Requirement"]
    y-axis "Count" 0 --> 8
    bar [6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6]
```

---

## 2. Entity Analysis

### 2.1 Core Compliance Entities

#### ComplianceFramework (6 instances)

| ID | Framework | Version | Body | Sectors | Category |
|----|-----------|---------|------|---------|----------|
| mcsb-v2 | Microsoft Cloud Security Benchmark v2 | 2.0.0 | Microsoft | All | Typical |
| nist-800-53-r5 | NIST SP 800-53 Revision 5 | 5.0.0 | NIST | Gov, Critical | Typical |
| iso-27001 | ISO/IEC 27001:2022 | 2022 | ISO | All | Typical |
| mcsb-v1 | MCSB v1 (Legacy) | 1.0.0 | Microsoft | All | Edge |
| custom-insurance | Custom Insurance Advisory | 0.1.0-alpha | Internal | Insurance | Boundary |
| invalid-001 | (Invalid) | not-semver | - | - | Invalid |

**Coverage Analysis:**
- Primary frameworks: MCSB v2, NIST, ISO
- Legacy support: MCSB v1 (deprecated but still assessed)
- Sector-specific: Custom insurance framework for advisory

#### ComplianceControl (6 instances)

| Control ID | Name | Family | Evidence Required | Category |
|------------|------|--------|-------------------|----------|
| NS-1 | Network segmentation boundaries | Network Security | VNet diagram, NSG exports, Firewall logs | Typical |
| DP-3 | Encrypt sensitive data in transit | Data Protection | TLS configs, Certificate inventory | Typical |
| IM-1 | Centralized identity system | Identity Management | Entra ID config, CA policies, Sign-in logs | Typical |
| SC-7(21) | Boundary Protection - Isolation | System/Comms Protection | Network topology, Firewall rules | Edge |
| MIN-001 | Minimum Control | Custom | None | Boundary |
| INV-001 | Invalid Control | Invalid | - | Invalid |

**Control Family Distribution:**

```mermaid
pie showData
    title Controls by Family
    "Network Security" : 2
    "Data Protection" : 1
    "Identity Management" : 1
    "Custom/Other" : 2
```

### 2.2 Azure Well-Architected Framework Entities

#### WAFPillar (5 pillars + 1 invalid)

```mermaid
mindmap
  root((WAF Pillars))
    RE - Reliability
      Resiliency
      Availability
      Recovery
      Data Integrity
    SE - Security
      Identity
      Network
      Data Protection
      Security Operations
    CO - Cost Optimization
      Cost Management
      Rightsizing
      Reserved Capacity
      Spot Instances
    OE - Operational Excellence
      DevOps
      Monitoring
      Automation
      Safe Deployment
    PE - Performance Efficiency
      Scaling
```

| Code | Pillar | MCSB Alignment | Advisor Category | Focus Areas |
|------|--------|----------------|------------------|-------------|
| RE | Reliability | BR-1, BR-2, BR-3 | HighAvailability | 4 |
| SE | Security | IM-1, IM-2, NS-1, NS-2, DP-1, DP-3 | Security | 4 |
| CO | Cost Optimization | None | Cost | 4 |
| OE | Operational Excellence | LT-1, LT-2, LT-3, AM-1, AM-2 | OperationalExcellence | 4 |
| PE | Performance Efficiency | None | Performance | 1 |

#### CAFPhase (6 phases)

```mermaid
graph LR
    S[1. Strategy] --> P[2. Plan]
    P --> R[3. Ready]
    R --> A[4. Adopt]
    A --> G[5. Govern]
    G --> M[6. Manage]

    style R fill:#0078D4,color:#fff

    subgraph "Snapshot Audit Aligns Here"
        R
    end
```

| Order | Phase | Key Activities | Deliverables | Category |
|-------|-------|----------------|--------------|----------|
| 1 | Strategy | Define motivations, Document outcomes | Cloud Strategy, Business Case | Typical |
| 2 | Plan | Digital estate rationalization | Migration Plan | Boundary |
| 3 | Ready | Landing zone deployment | Azure Landing Zone | Typical |
| 4 | Adopt | Migrate/Innovate workloads | (Varies) | Edge |
| 5 | Govern | Policy compliance, Governance maturity | Governance Policies | Typical |
| 6 | Manage | Ongoing operations | - | (Implicit) |

---

## 3. Compliance Framework Analysis

### Framework Comparison Matrix

```mermaid
graph TB
    subgraph "Cross-Framework Mapping"
        MCSB[MCSB v2<br/>90+ Controls]
        NIST[NIST 800-53 R5<br/>1000+ Controls]
        ISO[ISO 27001<br/>93 Controls]
        NCSC[UK NCSC<br/>14 Principles]
    end

    MCSB <-->|"Exact/Partial"| NIST
    MCSB <-->|"Exact/Partial"| ISO
    MCSB <-->|"Related"| NCSC
    NIST <-->|"Partial"| ISO
```

### Policy Set Definition Links

| Framework | Azure Policy Set | Status |
|-----------|------------------|--------|
| MCSB v2 | `1f3afdf9-d0c9-4c3d-847f-89da613e70a8` | Active |
| NIST 800-53 R5 | `179d1daa-458f-4e47-8086-2a68d0d6c38f` | Active |
| ISO 27001:2022 | `89c6cddc-1c73-4ac1-b19c-54d1a15a42f2` | Active |
| MCSB v1 | `null` (deprecated) | Legacy |

---

## 4. WAF Pillar Analysis

### Score Progression Analysis

Based on test data assessments:

```mermaid
%%{init: {'theme': 'base'}}%%
xychart-beta
    title "WAF Scores: Initial vs Post-Remediation"
    x-axis [Reliability, Security, "Cost Opt", "Op Excellence", Performance]
    y-axis "Score (%)" 0 --> 100
    line "Initial" [72, 85, 65, 78, 81]
    line "Post-Remediation" [89, 94, 82, 91, 87]
```

### Detailed Pillar Scores

| Assessment | RE | SE | CO | OE | PE | Avg | Advisor Recs |
|------------|----|----|----|----|-----|-----|--------------|
| INS-2026-001 (Initial) | 72 | 85 | 65 | 78 | 81 | 76.2 | 47 |
| FIN-2026-001 | 88 | 92 | 71 | 85 | 79 | 83.0 | 23 |
| INS-2026-002 (Post-Rem) | 89 | 94 | 82 | 91 | 87 | 88.6 | 12 |
| Security-Only | - | 95 | - | - | - | 95.0 | 5 |
| Perfect Score | 100 | 100 | 100 | 100 | 100 | 100.0 | 0 |

### Improvement Metrics

| Pillar | Δ Score | % Improvement |
|--------|---------|---------------|
| Reliability | +17 | +23.6% |
| Security | +9 | +10.6% |
| Cost Optimization | +17 | +26.2% |
| Operational Excellence | +13 | +16.7% |
| Performance Efficiency | +6 | +7.4% |

**Total Advisor Recommendations:** Reduced by 74% (47 → 12)

---

## 5. CAF Phase Analysis

### Phase-Activity Matrix

```mermaid
flowchart TB
    subgraph Strategy
        S1[Define motivations]
        S2[Document business outcomes]
        S3[Evaluate financial considerations]
        S4[Understand technical considerations]
    end

    subgraph Plan
        P1[Digital estate rationalization]
    end

    subgraph Ready
        R1[Operating model alignment]
        R2[Azure landing zone selection]
        R3[Landing zone deployment]
        R4[Extend landing zone]
    end

    subgraph Govern
        G1[Benchmark assessment]
        G2[Governance foundation]
        G3[Governance maturity]
        G4[Policy compliance]
    end

    Strategy --> Plan --> Ready --> Govern

    style Ready fill:#0078D4,color:#fff
```

### Snapshot Audit CAF Alignment

The Snapshot Audit aligns to the **Ready** phase, specifically the Assessment activity within landing zone preparation:

| Phase | Relevance to Audit | Alignment |
|-------|-------------------|-----------|
| Strategy | Business context | Input |
| Plan | Scope definition | Input |
| **Ready** | **Assessment execution** | **Primary** |
| Adopt | Migration guidance | Output |
| Govern | Policy recommendations | Output |
| Manage | Monitoring guidance | Output |

---

## 6. Audit Workflow Analysis

### SnapshotAudit Entity Analysis

```mermaid
stateDiagram-v2
    [*] --> Planned: Create Audit
    Planned --> InProgress: Start Execution
    InProgress --> Completed: Success
    InProgress --> Failed: Error
    Completed --> [*]
    Failed --> InProgress: Retry

    Completed --> Planned: Schedule Re-audit
```

#### Audit Instance Summary

| Audit ID | Session | Status | Scope | Duration | Run# |
|----------|---------|--------|-------|----------|------|
| AUD-INS-2026-001 | 550e...001 | Completed | 2 subs | 5 days | 1 |
| AUD-INS-2026-001 | 550e...002 | Completed | 2 subs | 3 days | 2 |
| AUD-FIN-2026-001 | 660e...003 | In-Progress | 3 subs | 5 days | 1 |
| AUD-PLN-2026-001 | 770e...004 | Planned | 1 sub | 5 days | 1 |
| AUD-MIN-2026-001 | 880e...005 | Completed | 1 sub | 1 day | 1 |

### Session Tracking Features

```mermaid
sequenceDiagram
    participant A as Initial Audit
    participant R as Remediation
    participant B as Re-Audit

    A->>A: sessionId: UUID-001
    A->>A: runSequence: 1
    A->>A: startedAt: T1
    A->>A: completedAt: T2

    Note over A,R: 40 Day Remediation Period

    R->>R: Fix Findings

    B->>B: sessionId: UUID-002
    B->>B: runSequence: 2
    B->>B: previousSessionId: UUID-001
    B->>B: startedAt: T3
    B->>B: completedAt: T4

    Note over B: Delta Comparison Available
```

### Query Execution Analysis

| Query ID | Name | Category | Output | Format |
|----------|------|----------|--------|--------|
| QRY-INV-001 | Full Resource Inventory | inventory | inventory-full.json | JSON |
| QRY-SEC-001 | Storage Account Security | security | storage-security.csv | CSV |
| QRY-CMP-001 | MCSB v2 Compliance | mcsbCompliance | mcsb-v2-compliance.json | JSON |
| QRY-WAF-001 | WAF Reliability Assessment | wafPillarAssessment | waf-reliability.json | JSON |
| QRY-SUM-001 | Resource Count Summary | summary | summary.json | JSON |

### Result Metrics

| Result ID | Records | File Size | Query | Category |
|-----------|---------|-----------|-------|----------|
| RES-INV-2026-001 | 1,247 | 512 KB | Inventory | Typical |
| RES-SEC-2026-001 | 23 | 8 KB | Security | Typical |
| RES-CMP-2026-001 | 156 | 128 KB | Compliance | Typical |
| RES-EMPTY-2026-001 | 0 | 2 B | WAF | Edge |
| RES-LARGE-2026-001 | 50,000 | 100 MB | Inventory | Boundary |

---

## 7. Control Mapping Analysis

### Mapping Strength Distribution

```mermaid
pie showData
    title Control Mapping Strength
    "Exact Match" : 2
    "Partial Match" : 2
    "Related" : 1
    "No Rationale" : 1
```

### Cross-Framework Mappings

| Source Control | Target Control | Strength | Rationale |
|----------------|----------------|----------|-----------|
| MCSB NS-1 | NIST SC-7(21) | **Exact** | Both require network segmentation |
| MCSB DP-3 | NIST SC-8 | **Exact** | Both mandate encryption in transit |
| MCSB IM-1 | ISO A.9.2.1 | **Partial** | Centralized identity partially addresses user registration |
| MCSB NS-1 | Custom INS-NET-001 | **Related** | Thematically related, not equivalent |

### Implementation Coverage

| Implementation | Policy Available | Config Property | Expected Value |
|----------------|------------------|-----------------|----------------|
| Storage TLS 1.2 | Yes | minimumTlsVersion | TLS1_2 |
| Key Vault RBAC | Yes | enableRbacAuthorization | true |
| NSG Subnet Association | Yes | networkSecurityGroup.id | not null |
| Manual Config Review | No | multiple | varies |

---

## 8. Findings Analysis

### Severity Distribution

```mermaid
pie showData
    title Findings by Severity
    "Critical" : 1
    "High" : 2
    "Medium" : 1
    "Informational" : 1
```

### Finding Details

| ID | Severity | Resource | Control | Current State | Priority |
|----|----------|----------|---------|---------------|----------|
| FND-2026-CRIT-001 | **Critical** | keyvault-001 | DP-3 | Public access, no firewall | P1 |
| FND-2026-001 | High | storage-001 | DP-3 | TLS 1.0 enabled | P1 |
| FND-2026-003 | High | vnet-001 | NS-1 | Subnet without NSG | P1 |
| FND-2026-002 | Medium | keyvault-001 | IM-1 | Access policy mode | P2 |
| FND-2026-INFO-001 | Info | storage-001 | MIN-001 | Config present | P5 |

### Remediation Priority Matrix

```mermaid
quadrantChart
    title Finding Priority vs Effort
    x-axis Low Effort --> High Effort
    y-axis Low Priority --> High Priority
    quadrant-1 Schedule
    quadrant-2 Do Now
    quadrant-3 Quick Wins
    quadrant-4 Delegate

    "Critical-KV": [0.3, 0.95]
    "High-TLS": [0.25, 0.8]
    "High-NSG": [0.5, 0.8]
    "Medium-RBAC": [0.4, 0.5]
    "Info": [0.1, 0.1]
```

---

## 9. Insurance Sector Requirements

### Regulatory Body Coverage

```mermaid
graph TB
    subgraph "UK Financial Regulators"
        FCA[FCA]
        PRA[PRA]
    end

    subgraph "Data Protection"
        ICO[ICO]
    end

    subgraph "Industry Standards"
        LLOYDS[Lloyd's]
    end

    subgraph "EU Authority"
        EIOPA[EIOPA]
    end

    FCA --> SYSC[SYSC 13.9<br/>Operational Resilience]
    PRA --> SS1[SS1/21<br/>Third Party Risk]
    ICO --> GDPR[GDPR Art.32<br/>Security Processing]
    LLOYDS --> MS13[MS13<br/>Cyber Security]
    EIOPA --> DORA[DORA<br/>Digital Resilience]
```

### Requirement Timeline

| Requirement | Body | Regulation | Enforcement | Deadline | Status |
|-------------|------|------------|-------------|----------|--------|
| FCA-SYSC-13.9 | FCA | SYSC 13.9 | 2022-03-31 | - | Active |
| PRA-SS1/21 | PRA | SS1/21 | 2021-03-31 | - | Active |
| GDPR-ART-32 | ICO | GDPR Art.32 | 2018-05-25 | - | Active |
| LLOYDS-MS13 | Lloyd's | MS13 | 2023-01-01 | 2024-12-31 | Active |
| EIOPA-2027-001 | EIOPA | DORA Ext | 2027-01-01 | 2027-06-30 | Future |

---

## 10. Relationship Analysis

### Entity Relationship Summary

```mermaid
erDiagram
    SnapshotAudit ||--|{ AuditQuery : executes
    AuditQuery ||--|{ AuditResult : produces
    AuditResult }|--|| AzureResource : discovers
    SnapshotAudit ||--|{ AuditDeliverable : produces
    SnapshotAudit ||--|{ ComplianceAssessment : generates
    SnapshotAudit ||--|{ WAFAssessment : generates

    ComplianceFramework ||--|{ ComplianceControl : contains
    ComplianceControl ||--|{ ControlMapping : mapsTo
    ComplianceControl ||--|{ ControlImplementation : implementedBy

    ComplianceAssessment ||--|{ ComplianceFinding : produces
    ComplianceFinding }|--|| AzureResource : affects
    ComplianceFinding }|--|| ComplianceControl : violates

    WAFAssessment }|--|{ WAFPillar : covers
    SnapshotAudit }|--|| CAFPhase : alignsTo
```

### Relationship Test Cases

| Relationship | From | To | Instances | Validated |
|--------------|------|-----|-----------|-----------|
| auditExecutesQuery | SnapshotAudit | AuditQuery | 3 queries | Yes |
| queryProducesResult | AuditQuery | AuditResult | 1:1 | Yes |
| auditProducesDeliverable | SnapshotAudit | AuditDeliverable | 3 deliverables | Yes |
| auditGeneratesAssessment | SnapshotAudit | Assessment | 2 types | Yes |
| wafAssessmentCoversPillar | WAFAssessment | WAFPillar | 5 pillars | Yes |

---

## 11. Validation Summary

### Completeness Gates

| Gate | Requirement | Result |
|------|-------------|--------|
| G1 | Entity descriptions ≥20 chars | PASS (16/16) |
| G2 | Relationship cardinality defined | PASS (28/28) |
| G2B | Entity connectivity | PASS (16/16) |
| G2C | Graph connectivity | PASS (1 component) |
| G3 | Business rules IF-THEN format | PASS (10/10) |
| G4 | Property schema.org mapping | PASS (100%) |
| G5 | Test data coverage | PASS (6/entity) |
| G6 | Cross-artifact consistency | PASS |

### Session Tracking Validation

| Feature | Status |
|---------|--------|
| Multiple runs supported | Yes |
| Session ID format (UUID) | Valid |
| Timestamp fields | startedAt, completedAt |
| Delta comparison | previousSessionId supported |

### Test Case Coverage

| Entity | Typical | Edge | Boundary | Invalid | Total |
|--------|---------|------|----------|---------|-------|
| ComplianceFramework | 3 | 1 | 1 | 1 | 6 |
| ComplianceControl | 3 | 1 | 1 | 1 | 6 |
| WAFPillar | 3 | 1 | 1 | 1 | 6 |
| CAFPhase | 3 | 1 | 1 | 1 | 6 |
| SnapshotAudit | 3 | 1 | 1 | 1 | 6 |
| AuditQuery | 3 | 1 | 1 | 1 | 6 |
| AuditResult | 3 | 1 | 1 | 1 | 6 |
| WAFAssessment | 3 | 1 | 1 | 1 | 6 |
| AuditDeliverable | 3 | 1 | 1 | 1 | 6 |
| AzureResource | 3 | 1 | 1 | 1 | 6 |
| ControlMapping | 3 | 1 | 1 | 1 | 6 |
| ControlImplementation | 3 | 1 | 1 | 1 | 6 |
| ComplianceAssessment | 3 | 1 | 1 | 1 | 6 |
| ComplianceFinding | 3 | 1 | 1 | 1 | 6 |
| InsuranceSectorReq | 3 | 1 | 1 | 1 | 6 |
| **TOTAL** | **48** | **16** | **16** | **16** | **96** |

### Overall Status

| Metric | Value | Status |
|--------|-------|--------|
| **Total Entities** | 16 | Complete |
| **Test Instances** | 96 | Validated |
| **Distribution Compliance** | 60-20-10-10 | PASS |
| **Entity Coverage** | 100% | PASS |
| **Validation Status** | PASS | **APPROVED** |

---

*Generated from ALZ Compliance Ontology Test Data v1.1.0*
*Analysis Date: 2026-02-03*
