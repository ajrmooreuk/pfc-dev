# EFS Ontology Mermaid Diagrams

## 1. Core Class Hierarchy

```mermaid
classDiagram
    direction TB
    
    class BacklogItem {
        <<abstract>>
        +String backlogItemId
        +PriorityLevel priority
        +BacklogItemStatus status
        +Number estimate
        +Number valueScore
        +Number riskScore
    }
    
    class Epic {
        +Theme epicTheme
        +Outcome businessOutcome
        +Release targetRelease
        +Feature[] hasFeature
        +Hypothesis[] hypotheses
        +Feature[] mvpScope
    }
    
    class Feature {
        +FeatureType featureType
        +String benefitHypothesis
        +AcceptanceCriterion[] acceptanceCriteria
        +UserStory[] hasStory
        +Capability enablesCapability
        +Enabler[] technicalEnablers
    }
    
    class UserStory {
        +Persona asA
        +String iWant
        +String soThat
        +AcceptanceCriterion[] storyAcceptanceCriteria
        +Number storyPoints
        +Task[] hasTasks
    }
    
    class Enabler {
        +EnablerType enablerType
        +Feature[] enablesFeatures
        +Number technicalDebtReduction
    }
    
    class Task {
        +TaskType taskType
        +Number estimatedHours
        +Number actualHours
        +Person assignee
    }
    
    BacklogItem <|-- Epic
    BacklogItem <|-- Feature
    BacklogItem <|-- UserStory
    BacklogItem <|-- Enabler
    
    Epic "1" --> "*" Feature : hasFeature
    Feature "1" --> "*" UserStory : hasStory
    UserStory "1" --> "*" Task : hasTasks
    Feature "*" --> "*" Enabler : technicalEnablers
```

## 2. Value Flow Architecture

```mermaid
flowchart TB
    subgraph VSOM["VSOM/VSEM (Strategy)"]
        VI[Vision]
        SI[Strategic Initiative]
        SO[Strategic Objective]
        KPI[Strategic KPI]
        VI --> SI --> SO --> KPI
    end
    
    subgraph EFS["EFS (Specification)"]
        TH[Theme]
        EP[Epic]
        FE[Feature]
        US[User Story]
        OC[Outcome]
        BN[Benefit]
        HY[Hypothesis]
        
        TH --> EP
        EP --> FE
        FE --> US
        EP --> OC
        OC --> BN
        EP --> HY
    end
    
    subgraph PMF["PMF (Validation)"]
        CS[Customer Segment]
        CN[Customer Need]
        VP[Value Proposition]
        FV[Fit Validation]
    end
    
    subgraph GTM["GTM (Market)"]
        LP[Launch Plan]
        PM[Product Message]
        DP[Differentiation Point]
    end
    
    subgraph EXEC["Execution"]
        SP[Sprint]
        RL[Release]
        TM[Team]
    end
    
    %% VSOM to EFS
    SI -.->|aligns| TH
    SO -.->|achieves| EP
    KPI -.->|measures| OC
    
    %% EFS to PMF
    FE -.->|delivers| VP
    US -.->|addresses| CN
    HY -.->|validates| FV
    
    %% EFS to GTM
    RL -.->|triggers| LP
    FE -.->|supports| PM
    
    %% Execution
    US --> SP
    FE --> RL
    TM --> SP
    
    style VSOM fill:#e1f5fe
    style EFS fill:#fff3e0
    style PMF fill:#f3e5f5
    style GTM fill:#e8f5e9
    style EXEC fill:#fce4ec
```

## 3. Module Dependency Graph

```mermaid
flowchart TD
    subgraph CORE["Core Modules"]
        BM[BacklogManagement<br/>Epic, Feature, Story]
        VD[ValueDelivery<br/>Outcome, Benefit]
    end
    
    subgraph STRATEGY["Strategic Modules"]
        SA[StrategicAlignment<br/>Theme, Capability]
        CD[CapabilityDelivery<br/>Maturity Levels]
    end
    
    subgraph QUALITY["Quality Modules"]
        QA[QualityAssurance<br/>Acceptance Criteria]
        RM[RiskManagement<br/>Risk, Mitigation]
        DM[DependencyManagement<br/>Dependencies]
    end
    
    subgraph EXECUTION["Execution Modules"]
        EM[ExecutionManagement<br/>Sprint, Task]
        TM[TeamManagement<br/>Team, Velocity]
        REL[ReleaseManagement<br/>Release, Version]
    end
    
    subgraph VALIDATION["Validation Modules"]
        VV[ValueValidation<br/>Hypothesis]
        UX[UserExperience<br/>Persona, JTBD]
    end
    
    BM --> VD
    BM --> QA
    BM --> RM
    BM --> DM
    
    VD --> SA
    VD --> VV
    
    SA --> CD
    
    BM --> EM
    EM --> TM
    EM --> REL
    
    BM --> UX
    
    %% External integrations
    SA -.->|vsom:| VSOM[(VSOM)]
    VV -.->|pmf:| PMF[(PMF)]
    REL -.->|gtm:| GTM[(GTM)]
    
    style CORE fill:#ffcc80
    style STRATEGY fill:#81d4fa
    style QUALITY fill:#a5d6a7
    style EXECUTION fill:#ce93d8
    style VALIDATION fill:#ef9a9a
```

## 4. Integration Interface Diagram

```mermaid
flowchart LR
    subgraph EFS["EFS Ontology"]
        E[Epic]
        F[Feature]
        S[UserStory]
        O[Outcome]
        B[Benefit]
        H[Hypothesis]
        P[Persona]
        R[Release]
        C[Capability]
    end
    
    subgraph VSOM_INT["VSOM Interface"]
        direction TB
        E -->|achieves| SO[StrategicObjective]
        O -->|measures| KPI[StrategicKPI]
        C -->|maps| OC[OperationalCapability]
    end
    
    subgraph PMF_INT["PMF Interface"]
        direction TB
        F -->|delivers| VP[ValueProposition]
        H -->|validates| FV[FitValidation]
        P -->|represents| CS[CustomerSegment]
        S -->|addresses| CN[CustomerNeed]
    end
    
    subgraph GTM_INT["GTM Interface"]
        direction TB
        R -->|triggers| LP[LaunchPlan]
        F -->|supports| PM[ProductMessage]
        C -->|enables| DP[DifferentiationPoint]
    end
    
    style EFS fill:#fff3e0
    style VSOM_INT fill:#e1f5fe
    style PMF_INT fill:#f3e5f5
    style GTM_INT fill:#e8f5e9
```

## 5. Idea-to-Execution Flow

```mermaid
flowchart LR
    subgraph IDEATE["Ideate"]
        I1[Vision Alignment]
        I2[Theme Definition]
        I3[Epic Creation]
    end
    
    subgraph SPECIFY["Specify"]
        S1[Feature Definition]
        S2[Story Writing]
        S3[Acceptance Criteria]
    end
    
    subgraph VALIDATE["Validate"]
        V1[Hypothesis Formation]
        V2[MVP Scoping]
        V3[PMF Testing]
    end
    
    subgraph BUILD["Build"]
        B1[Sprint Planning]
        B2[Task Execution]
        B3[Quality Assurance]
    end
    
    subgraph RELEASE["Release"]
        R1[Release Planning]
        R2[GTM Trigger]
        R3[Market Launch]
    end
    
    subgraph MEASURE["Measure"]
        M1[Outcome Tracking]
        M2[Benefit Realisation]
        M3[KPI Achievement]
    end
    
    I1 --> I2 --> I3
    I3 --> S1 --> S2 --> S3
    S1 --> V1 --> V2 --> V3
    S3 --> B1 --> B2 --> B3
    B3 --> R1 --> R2 --> R3
    R3 --> M1 --> M2 --> M3
    
    M3 -.->|Feedback Loop| I1
    V3 -.->|Pivot/Persist| S1
    
    style IDEATE fill:#bbdefb
    style SPECIFY fill:#c8e6c9
    style VALIDATE fill:#ffe0b2
    style BUILD fill:#e1bee7
    style RELEASE fill:#b2dfdb
    style MEASURE fill:#f8bbd9
```

## 6. Status Workflow State Machine

```mermaid
stateDiagram-v2
    [*] --> Idea
    
    Idea --> Backlog: Approved
    Idea --> [*]: Rejected
    
    Backlog --> Ready: Refined
    Backlog --> Idea: Needs clarification
    
    Ready --> InProgress: Sprint started
    
    InProgress --> InReview: Development complete
    InProgress --> Ready: Blocked
    
    InReview --> Done: Accepted
    InReview --> InProgress: Rework needed
    
    Done --> Released: Deployed
    
    Released --> [*]
    
    note right of Ready
        Acceptance criteria defined
        Estimated and prioritized
    end note
    
    note right of InReview
        Code review
        QA verification
        Stakeholder acceptance
    end note
```

## 7. Hypothesis Validation Cycle

```mermaid
flowchart TB
    subgraph FORM["Form Hypothesis"]
        H1["We believe [capability]"]
        H2["Will result in [outcome]"]
        H3["For [persona/segment]"]
    end
    
    subgraph DESIGN["Design Experiment"]
        D1[Define success criteria]
        D2[Select validation method]
        D3[Scope MVP features]
    end
    
    subgraph TEST["Run Test"]
        T1[Build MVP]
        T2[Deploy to segment]
        T3[Collect metrics]
    end
    
    subgraph LEARN["Evaluate & Learn"]
        L1{Validated?}
        L2[Document learnings]
        L3[Update hypothesis]
    end
    
    H1 --> H2 --> H3
    H3 --> D1 --> D2 --> D3
    D3 --> T1 --> T2 --> T3
    T3 --> L1
    
    L1 -->|Yes| PMF_PROGRESS[Progress PMF Score]
    L1 -->|No| L2 --> L3
    L3 -->|Pivot| H1
    L3 -->|Persist| D2
    
    PMF_PROGRESS --> SCALE[Scale Feature]
    
    style FORM fill:#e3f2fd
    style DESIGN fill:#fff8e1
    style TEST fill:#fce4ec
    style LEARN fill:#e8f5e9
```
