# ALZ Snapshot Audit - Mermaid Diagram Library

> **Version:** 1.0.0 | **Date:** 2026-02-03
> **Purpose:** Reusable Mermaid diagrams for ALZ Audit documentation and presentations

---

## Table of Contents

1. [Overview Diagrams](#1-overview-diagrams)
2. [Entity Relationship Diagrams](#2-entity-relationship-diagrams)
3. [Workflow Diagrams](#3-workflow-diagrams)
4. [Framework & Compliance Diagrams](#4-framework--compliance-diagrams)
5. [WAF Pillar Diagrams](#5-waf-pillar-diagrams)
6. [CAF Phase Diagrams](#6-caf-phase-diagrams)
7. [Data Distribution Diagrams](#7-data-distribution-diagrams)
8. [Timeline & Gantt Diagrams](#8-timeline--gantt-diagrams)
9. [Architecture Diagrams](#9-architecture-diagrams)
10. [Analysis Charts](#10-analysis-charts)

---

## 1. Overview Diagrams

### 1.1 ALZ Audit Ecosystem

```mermaid
mindmap
  root((ALZ Snapshot<br/>Audit))
    Compliance Frameworks
      MCSB v2
      NIST 800-53
      ISO 27001
      UK NCSC
      Insurance Regs
    WAF Pillars
      Reliability
      Security
      Cost Optimization
      Operational Excellence
      Performance Efficiency
    CAF Phases
      Strategy
      Plan
      Ready
      Adopt
      Govern
      Manage
    Outputs
      Executive Summary
      Current State Report
      Resource Inventory
      Gap Analysis
      Metrics Dashboard
```

### 1.2 High-Level Process Flow

```mermaid
flowchart LR
    subgraph Input
        T[Tenant ID]
        S[Subscriptions]
        F[Frameworks]
    end

    subgraph Audit
        A[Snapshot Audit]
        Q[KQL Queries]
        R[Results]
    end

    subgraph Assessment
        CA[Compliance Assessment]
        WA[WAF Assessment]
        FI[Findings]
    end

    subgraph Output
        D[Deliverables]
        RE[Recommendations]
    end

    T --> A
    S --> A
    F --> A
    A --> Q
    Q --> R
    R --> CA
    R --> WA
    CA --> FI
    WA --> FI
    FI --> D
    FI --> RE
```

---

## 2. Entity Relationship Diagrams

### 2.1 Complete Entity Relationship Model

```mermaid
erDiagram
    ComplianceFramework ||--|{ ComplianceControl : contains
    ComplianceControl ||--|{ ControlMapping : mapsTo
    ComplianceControl ||--|{ ControlImplementation : implementedBy

    SnapshotAudit ||--|{ AuditQuery : executes
    SnapshotAudit ||--|{ AuditDeliverable : produces
    SnapshotAudit ||--o{ ComplianceAssessment : generates
    SnapshotAudit ||--o{ WAFAssessment : generates
    SnapshotAudit }|--|| CAFPhase : alignsTo

    AuditQuery ||--|{ AuditResult : produces
    AuditResult }|--o{ AzureResource : discovers

    ComplianceAssessment ||--o{ ComplianceFinding : produces
    ComplianceAssessment }|--|{ ComplianceFramework : covers

    WAFAssessment }|--|{ WAFPillar : covers

    ComplianceFinding }|--|| AzureResource : affects
    ComplianceFinding }|--|| ComplianceControl : violates

    InsuranceSectorRequirement }|--|{ ComplianceControl : addressedBy

    ControlImplementation }|--|| AzureResource : appliesTo
```

### 2.2 Core Compliance Entities

```mermaid
erDiagram
    ComplianceFramework {
        string frameworkId PK
        string frameworkName
        string frameworkVersion
        string regulatoryBody
        string[] applicableSectors
        url policySetDefinitionId
    }

    ComplianceControl {
        string controlId PK
        string controlName
        string controlFamily
        string description
        string implementationGuidance
        string[] auditEvidence
    }

    ControlMapping {
        string sourceControl FK
        string targetControl FK
        enum mappingStrength
        string mappingRationale
    }

    ComplianceFramework ||--|{ ComplianceControl : contains
    ComplianceControl ||--o{ ControlMapping : mapsTo
```

### 2.3 Audit Workflow Entities

```mermaid
erDiagram
    SnapshotAudit {
        string auditId PK
        string sessionId UK
        string auditName
        date auditDate
        datetime startedAt
        datetime completedAt
        string tenantId
        string[] subscriptionScope
        int auditDurationDays
        enum status
        int runSequence
        string previousSessionId FK
    }

    AuditQuery {
        string queryId PK
        string queryName
        string description
        string queryText
        enum queryCategory
        string outputFile
        enum outputFormat
    }

    AuditResult {
        string resultId PK
        string queryRef FK
        datetime captureTimestamp
        string outputFilePath
        int recordCount
        enum resultFormat
        int fileSizeBytes
    }

    SnapshotAudit ||--|{ AuditQuery : executes
    AuditQuery ||--|{ AuditResult : produces
```

---

## 3. Workflow Diagrams

### 3.1 Audit Execution Flow

```mermaid
flowchart TB
    subgraph Initialization
        A1[Create Audit] --> A2[Generate Session ID]
        A2 --> A3[Define Scope]
        A3 --> A4[Select Frameworks]
    end

    subgraph Execution
        B1[Execute Queries] --> B2[Collect Results]
        B2 --> B3[Discover Resources]
        B3 --> B4[Assess Compliance]
        B4 --> B5[Assess WAF Pillars]
    end

    subgraph Analysis
        C1[Generate Findings] --> C2[Calculate Scores]
        C2 --> C3[Map Controls]
        C3 --> C4[Prioritize Remediation]
    end

    subgraph Output
        D1[Generate Deliverables] --> D2[Executive Summary]
        D1 --> D3[Technical Reports]
        D1 --> D4[Raw Data Export]
    end

    Initialization --> Execution
    Execution --> Analysis
    Analysis --> Output
```

### 3.2 Audit State Machine

```mermaid
stateDiagram-v2
    [*] --> Planned: Schedule Audit

    Planned --> InProgress: Start Execution
    InProgress --> Completed: Success
    InProgress --> Failed: Error

    Completed --> [*]: Archive
    Failed --> InProgress: Retry
    Failed --> [*]: Cancel

    Completed --> Planned: Schedule Re-audit

    note right of Planned: sessionId generated
    note right of InProgress: startedAt recorded
    note right of Completed: completedAt recorded
```

### 3.3 Query Execution Flow

```mermaid
sequenceDiagram
    participant A as Snapshot Audit
    participant Q as Audit Query
    participant ARG as Azure Resource Graph
    participant R as Audit Result
    participant S as Storage

    A->>Q: Execute Query
    Q->>ARG: Submit KQL
    ARG-->>Q: Return Data
    Q->>R: Create Result
    R->>S: Save to File
    R-->>A: Return Result ID

    Note over Q,ARG: Query Categories:<br/>inventory, security,<br/>mcsbCompliance,<br/>wafPillarAssessment
```

### 3.4 Multi-Run Audit Sequence

```mermaid
sequenceDiagram
    participant I as Initial Audit
    participant REM as Remediation
    participant R as Re-Audit
    participant D as Delta Analysis

    I->>I: sessionId: UUID-001
    I->>I: runSequence: 1
    I->>I: Execute Full Audit
    I-->>I: Findings Generated

    Note over I,REM: Remediation Period

    REM->>REM: Fix Critical Issues
    REM->>REM: Fix High Issues

    R->>R: sessionId: UUID-002
    R->>R: runSequence: 2
    R->>R: previousSessionId: UUID-001
    R->>D: Compare Results

    D-->>R: Delta Report

    Note over R,D: Improvements Measured
```

---

## 4. Framework & Compliance Diagrams

### 4.1 Framework Hierarchy

```mermaid
graph TB
    subgraph "Microsoft Standards"
        MCSB2[MCSB v2<br/>Active]
        MCSB1[MCSB v1<br/>Deprecated]
    end

    subgraph "Government Standards"
        NIST[NIST 800-53 R5]
        NCSC[UK NCSC<br/>14 Principles]
    end

    subgraph "International Standards"
        ISO[ISO 27001:2022]
    end

    subgraph "Sector Standards"
        FCA[FCA SYSC]
        PRA[PRA SS1/21]
        GDPR[GDPR]
        LLOYDS[Lloyd's MS13]
    end

    MCSB2 -.->|Maps to| NIST
    MCSB2 -.->|Maps to| ISO
    MCSB2 -.->|Informs| FCA
    NIST -.->|Overlaps| ISO
```

### 4.2 Control Family Distribution

```mermaid
pie showData
    title MCSB v2 Control Families
    "Network Security (NS)" : 10
    "Identity Management (IM)" : 9
    "Privileged Access (PA)" : 8
    "Data Protection (DP)" : 8
    "Asset Management (AM)" : 6
    "Logging & Threat Detection (LT)" : 6
    "Incident Response (IR)" : 5
    "Posture & Vulnerability (PV)" : 6
    "Endpoint Security (ES)" : 5
    "Backup & Recovery (BR)" : 4
    "DevOps Security (DS)" : 5
    "Governance & Strategy (GS)" : 4
```

### 4.3 Control Mapping Network

```mermaid
graph LR
    subgraph MCSB
        NS1[NS-1]
        DP3[DP-3]
        IM1[IM-1]
    end

    subgraph NIST
        SC7[SC-7]
        SC8[SC-8]
        IA2[IA-2]
    end

    subgraph ISO
        A9[A.9.2.1]
        A13[A.13.1.1]
        A10[A.10.1.1]
    end

    NS1 ==>|Exact| SC7
    DP3 ==>|Exact| SC8
    IM1 -->|Partial| IA2
    IM1 -->|Partial| A9
    NS1 -->|Partial| A13
    DP3 -->|Partial| A10
```

---

## 5. WAF Pillar Diagrams

### 5.1 WAF Pillar Overview

```mermaid
mindmap
  root((Azure WAF))
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
    OE - Operational Excellence
      DevOps
      Monitoring
      Automation
    PE - Performance Efficiency
      Scaling
      Caching
      Load Balancing
```

### 5.2 WAF to Advisor Category Mapping

```mermaid
graph LR
    subgraph "WAF Pillars"
        RE[Reliability]
        SE[Security]
        CO[Cost Optimization]
        OE[Operational Excellence]
        PE[Performance Efficiency]
    end

    subgraph "Azure Advisor Categories"
        HA[High Availability]
        SEC[Security]
        COST[Cost]
        OPEX[Operational Excellence]
        PERF[Performance]
    end

    RE --> HA
    SE --> SEC
    CO --> COST
    OE --> OPEX
    PE --> PERF
```

### 5.3 WAF Score Radar

```mermaid
%%{init: {'theme': 'base'}}%%
quadrantChart
    title WAF Pillar Assessment
    x-axis Low Score --> High Score
    y-axis Low Priority --> High Priority
    quadrant-1 Focus Area
    quadrant-2 Strength
    quadrant-3 Quick Wins
    quadrant-4 Monitor

    Security: [0.85, 0.95]
    Reliability: [0.72, 0.85]
    "Op Excellence": [0.78, 0.75]
    Performance: [0.81, 0.60]
    "Cost Opt": [0.65, 0.50]
```

---

## 6. CAF Phase Diagrams

### 6.1 CAF Journey

```mermaid
graph LR
    S[Strategy<br/>Define Why] --> P[Plan<br/>Define What]
    P --> R[Ready<br/>Prepare How]
    R --> A[Adopt<br/>Execute]
    A --> G[Govern<br/>Control]
    G --> M[Manage<br/>Operate]

    style R fill:#0078D4,color:#fff

    linkStyle 1,2 stroke:#0078D4,stroke-width:3px
```

### 6.2 CAF with Activities

```mermaid
flowchart TB
    subgraph Strategy
        S1[Define Motivations]
        S2[Document Outcomes]
        S3[Financial Considerations]
        S4[Technical Considerations]
    end

    subgraph Plan
        P1[Digital Estate<br/>Rationalization]
        P2[Initial Organization<br/>Alignment]
        P3[Skills Readiness]
        P4[Cloud Adoption<br/>Plan]
    end

    subgraph Ready
        R1[Operating Model]
        R2[Landing Zone<br/>Selection]
        R3[Landing Zone<br/>Deployment]
        R4[Extend Landing<br/>Zone]
    end

    subgraph "Audit Alignment"
        AU[Snapshot Audit<br/>Assessment]
    end

    Strategy --> Plan
    Plan --> Ready
    Ready --> AU

    style Ready fill:#0078D4,color:#fff
    style AU fill:#107c10,color:#fff
```

### 6.3 CAF Phase Details

```mermaid
graph TB
    subgraph "Phase 1: Strategy"
        direction TB
        S[Strategy]
        S --> S1["Motivations"]
        S --> S2["Business Outcomes"]
        S --> S3["Business Case"]
    end

    subgraph "Phase 3: Ready"
        direction TB
        R[Ready]
        R --> R1["Azure Setup"]
        R --> R2["Landing Zone"]
        R --> R3["Assessment"]
    end

    subgraph "Phase 5: Govern"
        direction TB
        G[Govern]
        G --> G1["Methodology"]
        G --> G2["Benchmark"]
        G --> G3["Foundation"]
    end

    S --> R
    R --> G
```

---

## 7. Data Distribution Diagrams

### 7.1 Test Data Distribution

```mermaid
pie showData
    title Test Data Distribution (96 Instances)
    "Typical Cases (60%)" : 58
    "Edge Cases (20%)" : 16
    "Boundary Cases (10%)" : 11
    "Invalid Cases (10%)" : 11
```

### 7.2 Entity Instance Distribution

```mermaid
pie showData
    title Instances per Entity Category
    "Core Compliance" : 12
    "WAF/CAF" : 12
    "Audit Workflow" : 24
    "Assessments" : 12
    "Resources" : 18
    "Insurance" : 6
    "Findings" : 12
```

### 7.3 Finding Severity Distribution

```mermaid
pie showData
    title Compliance Findings by Severity
    "Critical" : 1
    "High" : 2
    "Medium" : 1
    "Informational" : 1
```

---

## 8. Timeline & Gantt Diagrams

### 8.1 Audit Journey Timeline

```mermaid
gantt
    title Insurance Client Audit Journey
    dateFormat  YYYY-MM-DD

    section Initial Audit
    Pre-ALZ Assessment      :done, a1, 2026-02-03, 5d

    section Remediation
    Critical Fixes          :crit, a2, 2026-02-08, 7d
    High Priority Fixes     :a3, 2026-02-15, 14d
    Medium Priority Fixes   :a4, 2026-03-01, 14d

    section Re-Audit
    Post-Remediation Audit  :a5, 2026-03-15, 3d

    section Ongoing
    Quarterly Review        :a6, 2026-06-15, 2d
```

### 8.2 Regulatory Timeline

```mermaid
gantt
    title Insurance Regulatory Timeline
    dateFormat  YYYY-MM-DD

    section UK Regulators
    GDPR Art.32 (ICO)       :done, 2018-05-25, 1d
    PRA SS1/21              :done, 2021-03-31, 1d
    FCA SYSC 13.9           :done, 2022-03-31, 1d

    section Industry
    Lloyd's MS13            :active, 2023-01-01, 730d

    section Future
    EIOPA DORA              :2027-01-01, 180d
```

### 8.3 Audit Execution Timeline

```mermaid
gantt
    title Snapshot Audit Execution
    dateFormat  HH:mm
    axisFormat  %H:%M

    section Queries
    Resource Inventory      :a1, 09:00, 15m
    Security Config         :a2, 09:15, 10m
    MCSB Compliance         :a3, 09:25, 15m
    WAF Assessment          :a4, 09:40, 20m

    section Analysis
    Generate Findings       :b1, 10:00, 30m
    Calculate Scores        :b2, 10:30, 15m

    section Reporting
    Generate Deliverables   :c1, 10:45, 45m
```

---

## 9. Architecture Diagrams

### 9.1 Azure Landing Zone Audit Scope

```mermaid
graph TB
    subgraph "Azure Tenant"
        subgraph "Management Group Hierarchy"
            MG[Root MG]
            MG --> PLT[Platform MG]
            MG --> LZ[Landing Zones MG]

            PLT --> CONN[Connectivity]
            PLT --> MGMT[Management]
            PLT --> ID[Identity]

            LZ --> PROD[Production]
            LZ --> DEV[Development]
        end

        subgraph "Audit Scope"
            PROD --> SUB1[Sub: Production-001]
            PROD --> SUB2[Sub: Production-002]
            DEV --> SUB3[Sub: Development-001]
        end
    end

    style SUB1 fill:#0078D4,color:#fff
    style SUB2 fill:#0078D4,color:#fff
```

### 9.2 Audit Data Flow

```mermaid
graph LR
    subgraph "Data Sources"
        ARG[Azure Resource Graph]
        DFC[Defender for Cloud]
        ADV[Azure Advisor]
        POL[Azure Policy]
    end

    subgraph "Audit Engine"
        QE[Query Executor]
        AN[Analyzer]
        SC[Score Calculator]
    end

    subgraph "Outputs"
        JSON[JSON Results]
        CSV[CSV Reports]
        MD[Markdown Docs]
        PDF[PDF Reports]
    end

    ARG --> QE
    DFC --> QE
    ADV --> QE
    POL --> QE

    QE --> AN
    AN --> SC

    SC --> JSON
    SC --> CSV
    SC --> MD
    SC --> PDF
```

---

## 10. Analysis Charts

### 10.1 WAF Score Comparison

```mermaid
%%{init: {'theme': 'base'}}%%
xychart-beta
    title "WAF Scores: Initial vs Post-Remediation"
    x-axis [RE, SE, CO, OE, PE]
    y-axis "Score (%)" 0 --> 100
    bar "Initial" [72, 85, 65, 78, 81]
    bar "Post-Remediation" [89, 94, 82, 91, 87]
```

### 10.2 Compliance Score Progression

```mermaid
%%{init: {'theme': 'base'}}%%
xychart-beta
    title "Compliance Score Over Time"
    x-axis ["Feb (Pre)", "Mar (Q1)", "May (Post)"]
    y-axis "Score (%)" 0 --> 100
    line "Overall Score" [72, 85, 94]
    line "Target" [90, 90, 90]
```

### 10.3 Findings Reduction

```mermaid
%%{init: {'theme': 'base'}}%%
xychart-beta
    title "Findings Count Over Time"
    x-axis ["Initial", "Q1 Review", "Post-Remediation"]
    y-axis "Count" 0 --> 20
    bar [15, 8, 3]
```

### 10.4 Resource Type Distribution

```mermaid
pie showData
    title Resources by Type
    "Storage Accounts" : 23
    "Key Vaults" : 8
    "Virtual Networks" : 5
    "Virtual Machines" : 45
    "SQL Databases" : 12
    "App Services" : 18
    "Other" : 1136
```

---

## Usage Notes

### Rendering Mermaid Diagrams

These diagrams can be rendered in:
- GitHub Markdown files
- Azure DevOps Wikis
- VS Code with Mermaid extension
- Mermaid Live Editor (https://mermaid.live)
- Documentation tools supporting Mermaid

### Customization

Diagrams can be customized using Mermaid theme variables:

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#0078D4', 'primaryTextColor': '#fff'}}}%%
graph LR
    A[Customized] --> B[Diagram]
```

### Export Formats

From Mermaid Live Editor, export to:
- PNG (raster image)
- SVG (vector image)
- PDF (document)

---

*Generated from ALZ Compliance Ontology Test Data v1.1.0*
*Diagram Library Version: 1.0.0*
