# PFI-AIRL-GRC-ARCH — Azure Assessment & ALZ Healthcheck Architecture

**Document ID:** PFI-AIRL-GRC-ARCH-Azure-Assessment-ALZ-Healthcheck-Architecture-v1.0.0
**Date:** 2026-03-13
**Epic:** [Epic 74 (#1074)](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/1074)
**Status:** Active
**Product:** PFI-AIRL Azure Assessment & ALZ Healthcheck
**Type:** ARCH (Architecture)

---

## 1. Product Overview

The AIRL Azure Assessment & ALZ Healthcheck is a complete GRC product that takes a customer from initial engagement through to a verified, financially-quantified strategic report with interactive dashboards. This document maps the full architecture: skill chains, ontology graph, data flows, and DMAIC lifecycle.

---

## 2. End-to-End Skill Chain Architecture

### 2.1 Seven-Stage Pipeline

```mermaid
graph TD
    subgraph "Stage 1: ENGAGE"
        S1A[pfc-foundation-pipeline]
        S1B[VE Chain: VSOM → OKR → KPI → VP → Kano]
        S1C[pfc-delta-scope]
        S1D[FDN: pfc-org-context + pfc-org-mat + pfc-ga]
    end

    subgraph "Stage 2: EXTRACT"
        S2A[azure-resource-lookup]
        S2B[azure-validate]
        S2C[azure-compliance]
        S2D[azure-rbac]
        S2E[azure-diagnostics]
        S2F[azure-kusto]
        S2G[azure-resource-visualizer]
    end

    subgraph "Stage 3: ASSESS"
        S3A[pfc-alz-assess-waf]
        S3B[pfc-alz-assess-caf]
        S3C[pfc-alz-assess-cyber]
        S3D[pfc-alz-assess-health]
    end

    subgraph "Stage 4: ANALYSE"
        S4A[pfc-hcr-analyse]
        S4B[cross-framework correlation]
        S4C[rmf risk-score]
        S4D[pfc-gap-analysis]
    end

    subgraph "Stage 5: STRATEGISE"
        S5A[pfc-alz-strategy]
        S5B[pfc-hcr-roadmap]
        S5C[pfc-qvf-cyber-impact]
        S5D[pfc-qvf-grc-roi]
        S5E[pfc-qvf-cyber-insure]
        S5F[pfc-qvf-grc-value]
    end

    subgraph "Stage 6: DOCUMENT"
        S6A[pfc-hcr-compose]
        S6B[pfc-hcr-verify]
        S6C[pfc-hcr-dashboard]
        S6D[pfc-narrative]
        S6E[pfc-slide-engine]
        S6F[pfc-proposal-composer]
    end

    subgraph "Stage 7: ASSURE"
        S7A[pfc-grc-baseline]
        S7B[pfc-grc-drift]
        S7C[pfc-benefit-realisation]
        S7D[risk-learn]
    end

    S1A & S1B & S1C & S1D --> S2A & S2B & S2C & S2D & S2E & S2F & S2G
    S2A & S2B & S2C & S2D & S2E & S2F --> S3A & S3B & S3C & S3D
    S3A & S3B & S3C & S3D --> S4A & S4B & S4C & S4D
    S4A & S4B & S4C & S4D --> S5A & S5B & S5C & S5D & S5E & S5F
    S5A & S5B & S5C & S5D & S5E & S5F --> S6A & S6B & S6C & S6D & S6E & S6F
    S6A & S6B & S6C --> S7A & S7B & S7C & S7D
    S7A & S7B & S7C & S7D -.->|continuous loop| S3A & S3B & S3C & S3D
```

### 2.2 Human Checkpoints

```mermaid
graph LR
    HC1["🔒 HC1: Scope Approval"]
    HC2["🔒 HC2: Findings Review"]
    HC3["🔒 HC3: Roadmap Approval"]
    HC4["🔒 HC4: Report Sign-off"]

    S1[Stage 1: ENGAGE] --> HC1
    HC1 --> S2[Stage 2-3: EXTRACT + ASSESS]
    S2 --> HC2
    HC2 --> S3[Stage 4-5: ANALYSE + STRATEGISE]
    S3 --> HC3
    HC3 --> S4[Stage 6: DOCUMENT]
    S4 --> HC4
    HC4 --> S5[Stage 7: ASSURE]
    S5 -.->|re-assessment| S2
```

---

## 3. Ontology Dependency Graph

### 3.1 Full Ontology Map

```mermaid
graph TB
    subgraph "VE-Series (Value Engineering)"
        VSOM[VSOM-ONT v3.0.0]
        OKR[OKR-ONT v2.0.0]
        VP[VP-ONT v2.0.0]
        RRR[RRR-ONT v2.0.0]
        KPI[KPI-ONT v2.0.0]
        PMF[PMF-ONT v2.0.0]
        KANO[KANO-ONT v1.0.0]
    end

    subgraph "PE-Series (Platform Engineering)"
        PE[PE-ONT v2.0.0]
        EA_MSFT[EA-MSFT-ONT v1.0.0<br/>WAF Pillars]
        DS[DS-ONT v3.0.0]
    end

    subgraph "RCSG-Series (Risk, Compliance, Security, Governance)"
        GRC_FW[GRC-FW-ONT v3.0.0]
        MCSB[MCSB-ONT v2.0.0<br/>12 control domains]
        MCSB2[MCSB2-ONT v1.0.0<br/>v2 + AI controls]
        RMF[RMF-IS27005-ONT v1.0.0<br/>Risk Management]
        GDPR[GDPR-ONT v1.0.0]
        PII[PII-ONT v3.x.0]
        NCSC[NCSC-CAF-ONT v1.0.0]
        AZALZ[AZALZ-ONT v0.1.0<br/>Landing Zone]
    end

    subgraph "Foundation"
        ORG[ORG-ONT]
        ORG_CTX[ORG-CONTEXT-ONT]
        ORG_MAT[ORG-MAT-ONT]
    end

    subgraph "Financial (VE-Series)"
        QVF[QVF-ONT v1.0.0]
        CRA[Cyber-Risk-ONT v1.0.0]
        ERM[ERM-ONT v1.0.0]
    end

    subgraph "Report (NEW)"
        HCR[HCR-ONT v1.0.0<br/>Health Check Report]
    end

    subgraph "Orchestration"
        EMC[EMC-ONT v5.0.0]
    end

    %% VE chain
    VSOM --> OKR --> KPI
    VP --> RRR
    VSOM --> VP
    KPI --> QVF

    %% Assessment ontologies feed HCR
    EA_MSFT --> HCR
    MCSB --> HCR
    NCSC --> HCR
    AZALZ --> HCR
    RMF --> HCR

    %% Risk and financial
    RMF --> CRA
    CRA --> QVF
    ERM --> RMF
    QVF --> HCR

    %% Foundation context
    ORG --> ORG_CTX --> ORG_MAT
    ORG_CTX --> RMF

    %% Compliance bridges
    MCSB --> GDPR
    MCSB --> NCSC
    RMF --> GDPR
    PII --> GDPR

    %% GRC framework
    GRC_FW --> MCSB
    GRC_FW --> RMF

    %% EMC orchestrates all
    EMC -.-> VSOM & MCSB & RMF & QVF & HCR

    style HCR fill:#f9f,stroke:#333,stroke-width:3px
    style QVF fill:#ff9,stroke:#333,stroke-width:2px
    style RMF fill:#9ff,stroke:#333,stroke-width:2px
    style MCSB fill:#9f9,stroke:#333,stroke-width:2px
```

### 3.2 Ontology-to-Skill Mapping

```mermaid
graph LR
    subgraph "Ontologies"
        O1[EA-MSFT-ONT<br/>WAF Pillars]
        O2[MCSB-ONT<br/>12 Domains + AI]
        O3[NCSC-CAF-ONT<br/>Readiness]
        O4[AZALZ-ONT<br/>Landing Zone]
        O5[RMF-IS27005-ONT<br/>Risk Mgmt]
        O6[QVF-ONT<br/>Value/Finance]
        O7[Cyber-Risk-ONT<br/>Threat/ALE]
        O8[HCR-ONT<br/>Report]
    end

    subgraph "Assessment Skills"
        A1[pfc-alz-assess-waf]
        A2[pfc-alz-assess-cyber]
        A3[pfc-alz-assess-caf]
        A4[pfc-alz-assess-health]
    end

    subgraph "GRC-MCSB Skills"
        G1[pfc-grc-mcsb-assess]
        G2[pfc-grc-mcsb-benchmark]
        G3[pfc-grc-posture]
        G4[pfc-grc-mcsb-report]
    end

    subgraph "QVF Cyber Skills"
        Q1[pfc-qvf-cyber-impact]
        Q2[pfc-qvf-threat-econ]
        Q3[pfc-qvf-breach-model]
        Q4[pfc-qvf-cyber-insure]
        Q5[pfc-qvf-grc-roi]
        Q6[pfc-qvf-grc-value]
    end

    subgraph "HCR Skills"
        H1[pfc-hcr-compose]
        H2[pfc-hcr-analyse]
        H3[pfc-hcr-verify]
        H4[pfc-hcr-dashboard]
        H5[pfc-hcr-roadmap]
    end

    O1 --> A1
    O2 --> A2 & G1 & G2 & G3
    O3 --> A3
    O4 --> A4
    O5 --> G1 & Q1 & Q4 & Q5 & H3
    O6 --> Q1 & Q3 & Q4 & Q5 & Q6
    O7 --> Q1 & Q2 & Q3
    O8 --> H1 & H2 & H3 & H4 & H5
```

---

## 4. Data Flow Architecture

### 4.1 Assessment Data Flow

```mermaid
flowchart LR
    subgraph Azure["Azure Tenant (Customer)"]
        AZ1[Resources]
        AZ2[Policies]
        AZ3[RBAC]
        AZ4[Logs]
        AZ5[Config]
    end

    subgraph MCP["Azure MCP Server"]
        M1[resource-lookup]
        M2[validate]
        M3[compliance]
        M4[rbac]
        M5[diagnostics]
        M6[kusto]
    end

    subgraph Assess["Assessment Layer"]
        AS1[WAF Scoring]
        AS2[CAF Scoring]
        AS3[MCSB Scoring]
        AS4[ALZ Scoring]
        AS5[OWASP Scoring]
    end

    subgraph ThreeState["Three-State Model"]
        TS1["Best Practice<br/>(WAF/CAF/MCSB docs)"]
        TS2["Current State<br/>(MCP live data)"]
        TS3["Desired Destination<br/>(VE Discovery)"]
    end

    AZ1 & AZ2 & AZ3 & AZ4 & AZ5 --> M1 & M2 & M3 & M4 & M5 & M6
    M1 & M2 & M3 & M4 & M5 & M6 --> AS1 & AS2 & AS3 & AS4 & AS5
    AS1 & AS2 & AS3 & AS4 & AS5 --> TS2
    TS1 & TS2 & TS3 --> GAP[Gap Calculation]
    GAP --> FINDINGS[Scored Findings]
```

### 4.2 Finding-to-Report Flow

```mermaid
flowchart TD
    FINDINGS[Scored Findings<br/>per domain] --> ANALYSE[pfc-hcr-analyse<br/>Cross-correlate]
    FINDINGS --> RISK[rmf risk-score<br/>Risk Assessment]

    ANALYSE --> CORR[Correlation Matrix<br/>Systemic Patterns]
    RISK --> REGISTER[Risk Register<br/>Inherent → Residual]

    CORR & REGISTER --> STRATEGY[pfc-alz-strategy<br/>Gap Analysis]
    STRATEGY --> ROADMAP[pfc-hcr-roadmap<br/>Backcast Phases]

    FINDINGS --> THREAT[pfc-qvf-threat-econ<br/>FAIR Overlay]
    THREAT --> ALE[pfc-qvf-cyber-impact<br/>ALE Calculation]
    ALE --> BREACH[pfc-qvf-breach-model]
    ALE --> INSURE[pfc-qvf-cyber-insure]
    ALE --> ROI[pfc-qvf-grc-roi]
    BREACH & INSURE & ROI --> VALUE[pfc-qvf-grc-value<br/>Cyber Value Equation]

    ROADMAP & VALUE & CORR & REGISTER --> COMPOSE[pfc-hcr-compose<br/>Report Assembly]
    COMPOSE --> VERIFY[pfc-hcr-verify<br/>Independent Verification]
    VERIFY --> REPORT[HCR v2.0 Report]
    REPORT --> DASH[pfc-hcr-dashboard<br/>Interactive Views]

    REPORT --> SLIDES[pfc-slide-engine]
    REPORT --> NARRATIVE[pfc-narrative]
    REPORT --> PROPOSAL[pfc-proposal-composer]

    style COMPOSE fill:#f9f,stroke:#333,stroke-width:2px
    style VALUE fill:#ff9,stroke:#333,stroke-width:2px
    style REPORT fill:#9f9,stroke:#333,stroke-width:3px
```

---

## 5. HCR-ONT Entity Relationship Diagram

```mermaid
erDiagram
    Report ||--o{ ReportSection : containsSection
    Report ||--|| Roadmap : hasRoadmap
    Report ||--o{ VerificationAttestation : verifiedBy
    Report {
        string reportId
        string version
        date date
        string customer
        float overallScore
        string riskRating
    }

    ReportSection ||--o{ Finding : containsFinding
    ReportSection {
        string sectionId
        string title
        int order
        float currentScore
        float desiredScore
        float bestPracticeScore
        string framework
        string riskRating
    }

    Finding ||--o{ Evidence : hasEvidence
    Finding ||--o{ Recommendation : hasRecommendation
    Finding ||--|| RiskAssessment : assessedBy
    Finding {
        string findingId
        string severity
        string status
        float currentState
        float desiredState
        float gap
        float riskScore
        string controlRef
    }

    Evidence ||--o{ VerificationAttestation : verifiedBy
    Evidence {
        string evidenceId
        string type
        string source
        datetime timestamp
        string hash
        string verificationStatus
    }

    Recommendation ||--|| RoadmapPhase : inPhase
    Recommendation {
        string recommendationId
        string priority
        string effort
        int phase
        float expectedImprovement
        float costEstimate
        float valueCreated
    }

    RiskAssessment {
        float inherentRisk
        float residualRisk
        string treatmentStrategy
        string riskOwner
    }

    Roadmap ||--o{ RoadmapPhase : containsPhase
    Roadmap {
        float totalInvestment
        float totalValue
        float roi
        date targetDate
    }

    RoadmapPhase {
        string phaseId
        string name
        string duration
        float projectedScore
        float investmentCost
    }

    VerificationAttestation {
        string verifierId
        date date
        string methodology
        string attestationStatus
    }

    DashboardView {
        string viewId
        string type
        string visualisationType
        string drillPath
    }
```

---

## 6. Three-State Scoring Architecture

```mermaid
graph TD
    subgraph "Per Domain (e.g., Security)"
        BP["Best Practice: 95%<br/>████████████████████"]
        DD["Desired Destination: 80%<br/>████████████████░░░░"]
        CS["Current State: 42%<br/>████████░░░░░░░░░░░░"]
    end

    CS --> GAP1["Gap to Desired: 38 pts"]
    CS --> GAP2["Gap to Best: 53 pts"]

    GAP1 --> PRIO["Priority Weighting"]

    subgraph "Priority Formula"
        VE["VE Weight: 0.40"]
        RMF2["RMF Risk: 0.35"]
        KANO2["Kano Class: 0.25"]
    end

    VE & RMF2 & KANO2 --> PRIO

    PRIO --> RANK["Ranked Recommendations"]
    RANK --> PHASE["Backcasted Phases"]

    subgraph "Roadmap Projection"
        P1["Phase 1: 42% → 55%"]
        P2["Phase 2: 55% → 72%"]
        P3["Phase 3: 72% → 80% = Desired"]
        P4["Phase 4: 80% → 90% = Near Best"]
    end

    PHASE --> P1 --> P2 --> P3 --> P4
```

---

## 7. Risk Assessment Architecture

### 7.1 RMF-IS27005 Risk Flow

```mermaid
flowchart TD
    CTX[rmf:RiskContext<br/>Business scope, assets] --> ASSET[rmf:Asset<br/>Azure resources]
    CTX --> CRITERIA[rmf:RiskCriteria<br/>Acceptable thresholds]

    ASSET --> THREAT[rmf:Threat<br/>Threat scenarios]
    THREAT --> VULN[rmf:Vulnerability<br/>Assessment findings]

    VULN --> RISK_I[rmf:Risk<br/>Inherent Risk<br/>Impact × Likelihood]

    RISK_I --> ASSESS[rmf:RiskAssessment<br/>Portfolio aggregation]
    ASSESS --> TREAT[rmf:RiskTreatment<br/>Strategy selection]

    subgraph "Treatment Strategies"
        T1["MITIGATE → pfc-qvf-grc-roi<br/>ROI of control implementation"]
        T2["ACCEPT → pfc-qvf-cyber-impact<br/>Quantified residual ALE"]
        T3["TRANSFER → pfc-qvf-cyber-insure<br/>Insurance optimisation"]
        T4["AVOID → pfc-value-calc<br/>Opportunity cost"]
    end

    TREAT --> T1 & T2 & T3 & T4
    T1 & T2 & T3 & T4 --> RISK_R[rmf:Risk<br/>Residual Risk]

    RISK_R --> MONITOR[rmf:RiskMonitoringPlan<br/>Continuous assurance]
    MONITOR -.->|drift detected| RISK_I

    RISK_I --> ALE_B["ALE_before = SLE × ARO"]
    RISK_R --> ALE_A["ALE_after = SLE × ARO"]
    ALE_B & ALE_A --> DELTA["ΔALE = before − after<br/>Risk Reduction Value"]

    style DELTA fill:#ff9,stroke:#333,stroke-width:2px
```

### 7.2 Risk Heatmap Structure

```mermaid
quadrantChart
    title Risk Heatmap (Impact × Likelihood)
    x-axis Low Likelihood --> High Likelihood
    y-axis Low Impact --> High Impact
    quadrant-1 Critical Risk (Mitigate NOW)
    quadrant-2 High Risk (Plan mitigation)
    quadrant-3 Medium Risk (Monitor)
    quadrant-4 Low Risk (Accept/Review)
    NSG Misconfiguration: [0.7, 0.8]
    Missing MFA: [0.6, 0.9]
    No Backup Testing: [0.3, 0.85]
    Tagging Gaps: [0.5, 0.2]
    Legacy VM OS: [0.8, 0.6]
    Missing Logs: [0.4, 0.7]
```

---

## 8. Financial Architecture (QVF Cyber Economics)

### 8.1 Cyber Value Equation Flow

```mermaid
flowchart LR
    subgraph "Risk Reduction Value"
        ALE_B[ALE Before] --> DELTA_ALE[ΔALE]
        ALE_A[ALE After] --> DELTA_ALE
    end

    subgraph "Insurance Savings"
        PREM_C[Premium Current] --> DELTA_P[ΔPremium]
        PREM_P[Premium Projected] --> DELTA_P
        EXC_C[Excess Current] --> DELTA_E[ΔExcess]
        EXC_P[Excess Projected] --> DELTA_E
    end

    subgraph "Compliance Value"
        FINES[Penalties Avoided]
        MARKET[Market Access]
    end

    subgraph "Operational Value"
        DOWN[Downtime Avoided]
        PROD[Productivity Gains]
    end

    subgraph "GRC Investment"
        IMPL[Implementation]
        TOOL[Tooling]
        PEOPLE[People]
    end

    DELTA_ALE --> CV[Cyber Value]
    DELTA_P & DELTA_E --> CV
    FINES & MARKET --> CV
    DOWN & PROD --> CV
    IMPL & TOOL & PEOPLE -->|subtract| CV

    CV --> ROI_CALC["GRC ROI = (Value − Cost) / Cost × 100"]
    CV --> NPV_CALC["NPV over 5-year horizon"]
    CV --> PAYBACK["Payback period (months)"]

    style CV fill:#ff9,stroke:#333,stroke-width:3px
```

### 8.2 ALE Calculation Chain

```mermaid
flowchart TD
    TM[pfc-owasp-threat-model<br/>Threat scenarios] --> TE[pfc-qvf-threat-econ<br/>FAIR overlay]

    TE --> ARO["ARO<br/>(Annual Rate of Occurrence)"]
    TE --> EF["Exposure Factor"]
    TE --> AV["Asset Value"]

    BM[pfc-qvf-breach-model<br/>Cost components] --> SLE["SLE = Asset Value × EF"]
    AV & EF --> SLE

    SLE --> ALE["ALE = SLE × ARO"]
    ARO --> ALE

    subgraph "Sensitivity"
        OPT["Optimistic (P=0.20)"]
        BASE["Base Case (P=0.60)"]
        PESS["Pessimistic (P=0.20)"]
    end

    ALE --> OPT & BASE & PESS
    OPT & BASE & PESS --> EXPECTED["Expected ALE<br/>= Σ(P × scenario ALE)"]

    EXPECTED --> IMPACT[pfc-qvf-cyber-impact<br/>Portfolio ALE]
    IMPACT --> INSURE[pfc-qvf-cyber-insure]
    IMPACT --> GRC_ROI[pfc-qvf-grc-roi]
    IMPACT --> GRC_VAL[pfc-qvf-grc-value]
```

---

## 9. Dashboard Drill-Down Architecture

```mermaid
flowchart TD
    L0["LEVEL 0: Executive Dashboard<br/>━━━━━━━━━━━━━━━━━━━━━━━<br/>Unified posture gauge (0-100%)<br/>Domain heatmap (RAG)<br/>Top 5 critical findings<br/>Risk radar chart<br/>Roadmap Gantt<br/>Cyber Value (£)"]

    L0 -->|click domain| L1["LEVEL 1: Domain Dashboard<br/>━━━━━━━━━━━━━━━━━━━━━━━<br/>Three-state gauge<br/>Findings table (sortable)<br/>Cross-framework view<br/>Domain risk heatmap<br/>SPC control chart<br/>Recommendations"]

    L1 -->|click finding| L2["LEVEL 2: Finding Detail<br/>━━━━━━━━━━━━━━━━━━━━━━━<br/>Description + severity<br/>Current vs desired state<br/>RMF risk assessment<br/>Remediation recommendation<br/>Cross-framework correlation<br/>Evidence chain"]

    L2 -->|click evidence| L3["LEVEL 3: Evidence Viewer<br/>━━━━━━━━━━━━━━━━━━━━━━━<br/>Raw evidence (KQL/JSON/config)<br/>MCP extraction source<br/>Timestamp + hash<br/>Verification status<br/>Audit trail"]

    style L0 fill:#e1f5fe,stroke:#0277bd,stroke-width:2px
    style L1 fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
    style L2 fill:#fff3e0,stroke:#e65100,stroke-width:2px
    style L3 fill:#fce4ec,stroke:#c62828,stroke-width:2px
```

---

## 10. DMAIC Lifecycle Architecture

```mermaid
flowchart LR
    subgraph D["DEFINE"]
        D1[Scope engagement]
        D2[VE Discovery]
        D3[Set desired destination]
        D4[Define risk appetite]
    end

    subgraph M["MEASURE"]
        M1[Azure MCP extraction]
        M2[WAF/CAF/MCSB/ALZ scoring]
        M3[Three-state gap calculation]
        M4[Baseline ALE measurement]
    end

    subgraph A["ANALYSE"]
        A1[Cross-framework correlation]
        A2[RMF risk assessment]
        A3[Root cause analysis]
        A4[Financial impact (QVF)]
    end

    subgraph I["IMPROVE"]
        I1[Backcast roadmap]
        I2[OKR-aligned phases]
        I3[VE-prioritised remediation]
        I4[Insurance optimisation]
    end

    subgraph C["CONTROL"]
        C1[SPC baselines]
        C2[Drift detection]
        C3[Benefit realisation]
        C4[Risk model calibration]
    end

    D --> M --> A --> I --> C
    C -.->|continuous loop| M

    subgraph "Report Output per Phase"
        R_D[Part I: Executive Summary]
        R_M[Part II: Domain Assessments]
        R_A[Part III: Strategic Analysis]
        R_I[Part III §16: Roadmap]
        R_C[Part IV: Assurance]
    end

    D -.-> R_D
    M -.-> R_M
    A -.-> R_A
    I -.-> R_I
    C -.-> R_C
```

---

## 11. Verification Architecture

```mermaid
flowchart TD
    subgraph "Assessment Team"
        AT1[pfc-alz-assess-*<br/>Generate findings]
        AT2[pfc-hcr-compose<br/>Assemble report]
    end

    subgraph "Verification Layer (Independent)"
        V1["1. Evidence Integrity<br/>Hash chain verification<br/>Timestamp validation<br/>Source attribution"]
        V2["2. Methodology Audit<br/>Scoring calibration<br/>Weight consistency<br/>Risk scoring check"]
        V3["3. Sample Re-execution<br/>10% of MCP calls<br/>Result comparison<br/>Variance analysis"]
        V4["4. Cross-Reference<br/>Framework consistency<br/>Risk proportionality<br/>Financial bounds"]
        V5["5. Attestation<br/>Scope statement<br/>Methodology statement<br/>Pass/Conditional/Fail"]
    end

    AT1 --> |evidence + findings| V1
    AT2 --> |assembled report| V2
    V1 --> V2 --> V3 --> V4 --> V5

    V5 --> ATTEST[hcr:VerificationAttestation<br/>Signed, scoped, dated]
    ATTEST --> REPORT[Part IV of HCR v2.0]

    style ATTEST fill:#c8e6c9,stroke:#2e7d32,stroke-width:2px
```

---

## 12. Continuous Assurance Loop

```mermaid
flowchart TD
    BASELINE[pfc-grc-baseline<br/>SPC Control Limits<br/>UCL / Mean / LCL] --> MONITOR[Continuous Monitoring<br/>Scheduled re-assessment]

    MONITOR --> DRIFT{pfc-grc-drift<br/>Score outside<br/>control limits?}

    DRIFT -->|No: In control| STABLE[Stable<br/>Continue monitoring]
    DRIFT -->|Yes: Drift detected| ALERT[Alert<br/>Drift notification]

    ALERT --> REASSESS[Re-assess<br/>affected domain]
    REASSESS --> UPDATE[Update Report<br/>Living document]
    UPDATE --> DASHBOARD[Refresh Dashboard<br/>Real-time update]

    STABLE --> BENEFIT[pfc-benefit-realisation<br/>Track projected vs actual]
    BENEFIT --> LEARN[risk-learn<br/>Calibrate models]
    LEARN --> BASELINE

    DASHBOARD --> INSURE_RENEW[Insurance Renewal<br/>Updated evidence package]

    style DRIFT fill:#fff3e0,stroke:#e65100,stroke-width:2px
    style ALERT fill:#ffcdd2,stroke:#c62828,stroke-width:2px
    style STABLE fill:#c8e6c9,stroke:#2e7d32,stroke-width:2px
```

---

## 13. Cross-Framework Correlation Architecture

```mermaid
graph TD
    subgraph "WAF (5 Pillars)"
        W1[Reliability]
        W2[Security]
        W3[Cost Optimisation]
        W4[Operational Excellence]
        W5[Performance Efficiency]
    end

    subgraph "MCSB (12 Domains)"
        M1[Network Security]
        M2[Identity Management]
        M3[Privileged Access]
        M4[Data Protection]
        M5[Asset Management]
        M6[Logging & Threat Detection]
    end

    subgraph "CAF (Readiness Areas)"
        C1[Strategy]
        C2[Plan]
        C3[Ready]
        C4[Govern]
        C5[Manage]
    end

    subgraph "AZALZ (LZ Domains)"
        A1[Management Groups]
        A2[Hub Network]
        A3[Policy Assignments]
        A4[RBAC Bindings]
        A5[Diagnostic Settings]
    end

    %% Cross-framework correlations
    W2 <-->|security overlap| M1 & M2 & M3 & M4
    W4 <-->|ops overlap| M6
    W1 <-->|reliability overlap| M5
    C4 <-->|governance overlap| A3 & A4
    C3 <-->|readiness overlap| A1 & A2
    M1 <-->|network overlap| A2
    M3 <-->|access overlap| A4

    W2 & M1 & A2 --> CORR1["NSG finding affects<br/>3 frameworks"]
    M2 & M3 & A4 --> CORR2["RBAC finding affects<br/>3 frameworks"]

    style CORR1 fill:#ffcdd2,stroke:#c62828,stroke-width:2px
    style CORR2 fill:#ffcdd2,stroke:#c62828,stroke-width:2px
```

---

## 14. Skill Inventory Summary

### 14.1 By Skill Family

```mermaid
pie title Skill Distribution by Family (F74)
    "Assessment (4)" : 4
    "GRC-MCSB (10)" : 10
    "OWASP (7 existing)" : 7
    "QVF Cyber (6)" : 6
    "HCR Report (5)" : 5
    "Strategy & Pipeline (2)" : 2
    "Azure MCP (7)" : 7
    "VE Chain (10+)" : 10
    "Risk Intelligence (9)" : 9
```

### 14.2 Skill Families Table

| Family | Skills | Epic/Feature | Status |
|---|---|---|---|
| **pfc-alz-assess** | waf, caf, cyber, health | F74.2–F74.5 | Scaffold |
| **pfc-grc-mcsb** | assess, benchmark, migrate, policy, report, posture, plan, remediate, baseline, drift | F74.20 | Scaffold |
| **pfc-qvf-cyber** | cyber-impact, threat-econ, breach-model, cyber-insure, grc-roi, grc-value | F74.22–F74.24 | Scaffold |
| **pfc-hcr** | compose, analyse, verify, dashboard, roadmap | F74.25 | Scaffold |
| **pfc-alz-strategy** | strategy | F74.17 | Scaffold |
| **pfc-alz-pipeline** | pipeline (orchestrator) | F74.18 | Scaffold |
| **pfc-owasp** | agentic, llm, pipeline, code-review, web, threat-model, ext-agamm | Epic 37 | Candidate |
| **risk-*** | profile, score, balance, update, report, learn, waive, pfc-ve-prioritise, pfc-cga | Epic 73 | Candidate |
| **azure-*** | resource-lookup, validate, compliance, rbac, diagnostics, kusto, visualizer | External MCP | MCP |

---

## 15. Deployment Architecture

```mermaid
flowchart TD
    subgraph "Development"
        DEV1[pfc-dev repo<br/>Skill scaffolds]
        DEV2[Azlan-EA-AAA<br/>Ontologies + Strategy]
    end

    subgraph "Ontology Library"
        ONT1[ont-registry-index.json<br/>v10.8.0 + HCR-ONT]
        ONT2[GitHub Pages<br/>Auto-deploy via pages.yml]
    end

    subgraph "Runtime"
        RT1[Claude Code Agent<br/>Skill orchestration]
        RT2[Azure MCP Server<br/>Live data extraction]
        RT3[Supabase<br/>Historical data + baselines]
    end

    subgraph "Delivery"
        DL1[HCR v2.0 Report<br/>HTML + PDF + DOCX]
        DL2[Interactive Dashboard<br/>GitHub Pages / Customer-hosted]
        DL3[Slide Deck<br/>pfc-slide-engine]
        DL4[Client Proposal<br/>pfc-proposal-composer]
    end

    DEV1 --> RT1
    DEV2 --> ONT1 --> ONT2
    RT1 --> RT2
    RT1 --> RT3
    RT1 --> DL1 & DL2 & DL3 & DL4
    RT3 -.->|historical trends| DL2
```

---

*PFI-AIRL-GRC-ARCH-Azure-Assessment-ALZ-Healthcheck-Architecture-v1.0.0*
*Epic 74 (#1074) — Product Architecture*
