# EFS Lineage Diagrams

## 1. Complete Five-Layer Lineage Architecture

```mermaid
flowchart TB
    subgraph L1["LAYER 1: VSOM/VSEM - Strategy"]
        direction LR
        V[Vision]
        S[Strategy]
        O[Strategic<br/>Objectives]
        M[Measures]
        V --> S --> O --> M
    end

    subgraph L2["LAYER 2: OKR/KPI - Context"]
        direction LR
        OBJ[Objectives]
        KR[Key Results]
        KPI[KPIs]
        OBJ --> KR
        OBJ --> KPI
    end

    subgraph L3["LAYER 3: Value Proposition"]
        direction TB
        VP[Value<br/>Proposition]
        subgraph IC_RRR["IC/RRR"]
            IC[Ideal Customer]
            RRR[Roles/RACI/RBAC]
        end
        subgraph ORG_CTX["ORG Context"]
            ORG[Organizational<br/>Alignment]
        end
        VP --> IC_RRR
        VP --> ORG_CTX
    end

    subgraph L4["LAYER 4: Customer Definition"]
        direction LR
        ICP[ICP]
        PER[Personas]
        PAIN[Pains]
        GAIN[Gains]
        BEN[Benefits]
        ICP --> PER --> PAIN --> GAIN --> BEN
    end

    subgraph L5["LAYER 5: EFS - Specification"]
        direction LR
        TH[Theme]
        EP[Epic]
        FE[Feature]
        ST[Story]
        TH --> EP --> FE --> ST
    end

    %% Layer connections
    O -->|"defines"| OBJ
    M -->|"measured by"| KPI
    OBJ -->|"context for"| VP
    KR -->|"validates"| VP
    ORG -.->|"aligns back to"| O
    IC -->|"defines"| ICP
    ICP -->|"segments"| TH
    PAIN -->|"addressed by"| EP
    GAIN -->|"delivered by"| FE
    BEN -->|"So That..."| ST
    PER -->|"As A..."| ST

    style L1 fill:#e1f5fe
    style L2 fill:#fff9c4
    style L3 fill:#f3e5f5
    style L4 fill:#e8f5e9
    style L5 fill:#fff3e0
```

---

## 2. Value Proposition Breakdown

```mermaid
flowchart TB
    subgraph OKR_IN["From OKR/KPI Layer"]
        OBJ[Objectives]
        KR[Key Results]
    end

    subgraph VP_CORE["VALUE PROPOSITION"]
        VP[Core Value<br/>Statement]

        subgraph IC_BOX["IC Component"]
            IC[Ideal Customer<br/>Definition]
        end

        subgraph RRR_BOX["RRR Metrics"]
            REV[Revenue<br/>How it creates value]
            RET[Retention<br/>How it keeps customers]
            REF[Referral<br/>How it drives growth]
        end

        subgraph ORG_BOX["ORG Context"]
            ORG_ALIGN[Strategic<br/>Alignment]
            ORG_CAP[Capability<br/>Requirements]
            ORG_RES[Resource<br/>Implications]
        end

        VP --> IC_BOX
        VP --> RRR_BOX
        VP --> ORG_BOX
    end

    subgraph VSOM_BACK["Back to VSOM"]
        SO[Strategic<br/>Objectives]
    end

    subgraph PMF_OUT["To PMF Layer"]
        ICP_OUT[ICP]
        PAIN_OUT[Pains]
        GAIN_OUT[Gains]
        BEN_OUT[Benefits]
    end

    OBJ -->|"provides context"| VP
    KR -->|"validates"| VP

    ORG_ALIGN -.->|"relates back"| SO

    IC -->|"defines"| ICP_OUT
    VP -->|"identifies"| PAIN_OUT
    VP -->|"promises"| GAIN_OUT
    VP -->|"delivers"| BEN_OUT

    REV -.->|"measured by"| SO
    RET -.->|"measured by"| SO
    REF -.->|"measured by"| SO

    style OKR_IN fill:#fff9c4
    style VP_CORE fill:#f3e5f5
    style VSOM_BACK fill:#e1f5fe
    style PMF_OUT fill:#e8f5e9
```

---

## 3. ICP to EFS Mapping

```mermaid
flowchart LR
    subgraph ICP_LAYER["ICP / Personas / Pains / Gains / Benefits"]
        ICP[ICP<br/>Ideal Customer<br/>Profile]
        PER[Personas<br/>User Archetypes]
        PAIN[Pains<br/>Problems to<br/>Solve]
        GAIN[Gains<br/>Desired<br/>Outcomes]
        BEN[Benefits<br/>Value<br/>Delivered]

        ICP --> PER
        ICP --> PAIN
        PAIN --> GAIN
        GAIN --> BEN
    end

    subgraph EFS_LAYER["EFS Specification"]
        TH[Theme<br/>Customer<br/>Segment]
        EP[Epic<br/>Business<br/>Outcome]
        FE[Feature<br/>Benefit<br/>Hypothesis]
        ST[Story<br/>As A / I Want<br/>/ So That]
        TK[Task<br/>Implementation]

        TH --> EP
        EP --> FE
        FE --> ST
        ST --> TK
    end

    ICP -->|"segments into"| TH
    PAIN -->|"addressed by"| EP
    GAIN -->|"delivered by"| FE
    BEN -->|"So That..."| ST
    PER -->|"As A..."| ST

    style ICP_LAYER fill:#e8f5e9
    style EFS_LAYER fill:#fff3e0
```

---

## 4. Complete Lineage Traceability Example

```mermaid
flowchart TB
    subgraph EXAMPLE["Complete Lineage: E-Commerce Checkout Optimization"]

        subgraph L1_EX["VSOM"]
            V1["Vision:<br/>Digital Excellence"]
            S1["Strategy:<br/>Customer-First"]
            O1["Objective:<br/>+20% Revenue"]
        end

        subgraph L2_EX["OKR/KPI"]
            OKR1["OKR:<br/>Improve Conversion"]
            KR1["KR:<br/>+15% Checkout<br/>Completion"]
            KPI1["KPI:<br/>Cart Abandonment<br/>Rate"]
        end

        subgraph L3_EX["Value Proposition"]
            VP1["VP:<br/>Seamless Shopping"]
            IC1["IC:<br/>Time-Conscious<br/>Shoppers"]
            RRR1["Revenue:<br/>Higher AOV"]
            ORG1["ORG:<br/>E-commerce<br/>Initiative"]
        end

        subgraph L4_EX["Customer Definition"]
            ICP1["ICP:<br/>Online Professional<br/>Shopper"]
            P1["Persona:<br/>Busy Professional"]
            PAIN1["Pain:<br/>Slow Checkout"]
            GAIN1["Gain:<br/>Quick Purchase"]
            BEN1["Benefit:<br/>Time Saved"]
        end

        subgraph L5_EX["EFS"]
            TH1["Theme:<br/>Checkout<br/>Optimization"]
            EP1["Epic:<br/>Streamlined<br/>Checkout"]
            FE1["Feature:<br/>One-Click Buy"]
            ST1["Story:<br/>As a Busy Pro<br/>I want 1-click<br/>So that I save time"]
        end

    end

    V1 --> S1 --> O1
    O1 --> OKR1
    OKR1 --> KR1
    OKR1 --> KPI1

    OKR1 --> VP1
    VP1 --> IC1
    VP1 --> RRR1
    VP1 --> ORG1
    ORG1 -.-> O1

    IC1 --> ICP1
    ICP1 --> P1
    ICP1 --> PAIN1
    PAIN1 --> GAIN1
    GAIN1 --> BEN1

    ICP1 --> TH1
    PAIN1 --> EP1
    GAIN1 --> FE1
    BEN1 --> ST1
    P1 --> ST1

    style L1_EX fill:#e1f5fe
    style L2_EX fill:#fff9c4
    style L3_EX fill:#f3e5f5
    style L4_EX fill:#e8f5e9
    style L5_EX fill:#fff3e0
```

---

## 5. Bidirectional Traceability

```mermaid
flowchart LR
    subgraph FORWARD["Forward Traceability (Top-Down)"]
        direction TB
        F1[Why are we<br/>building this?]
        F2[What value<br/>does it deliver?]
        F3[Who benefits?]
        F4[What gets built?]
        F1 --> F2 --> F3 --> F4
    end

    subgraph LAYERS["Lineage Layers"]
        direction TB
        VSOM[VSOM/VSEM]
        OKR[OKR/KPI]
        VP[Value Prop]
        PMF[ICP/PMF]
        EFS[EFS]
        VSOM --> OKR --> VP --> PMF --> EFS
    end

    subgraph BACKWARD["Backward Traceability (Bottom-Up)"]
        direction TB
        B4[What was built?]
        B3[Who used it?]
        B2[What value<br/>was delivered?]
        B1[Did it meet<br/>objectives?]
        B4 --> B3 --> B2 --> B1
    end

    F1 --- VSOM
    F2 --- VP
    F3 --- PMF
    F4 --- EFS

    EFS --- B4
    PMF --- B3
    VP --- B2
    VSOM --- B1

    style FORWARD fill:#e8f5e9
    style LAYERS fill:#fff3e0
    style BACKWARD fill:#e1f5fe
```

---

## 6. Lineage Status Visualization

```mermaid
stateDiagram-v2
    [*] --> Defined: Entity Created

    state "Lineage Status" as LS {
        Defined --> PartialLineage: Some links added
        PartialLineage --> CompleteLineage: All required links
        CompleteLineage --> Validated: Lineage verified

        PartialLineage --> BrokenLineage: Link target deleted
        CompleteLineage --> BrokenLineage: Link target deleted

        BrokenLineage --> PartialLineage: Link repaired
    }

    Validated --> [*]: Entity archived

    note right of Defined
        Entity exists but
        no lineage links
    end note

    note right of CompleteLineage
        All upstream and
        downstream links present
    end note

    note right of BrokenLineage
        Referenced entity
        was deleted or moved
    end note
```

---

## 7. Cross-Ontology Relationship Map

```mermaid
flowchart TB
    subgraph VSOM_ONT["vsom: namespace"]
        VSOM_V[Vision]
        VSOM_S[Strategy]
        VSOM_O[StrategicObjective]
        VSOM_M[StrategicMeasure]
        VSOM_I[StrategicInitiative]
    end

    subgraph OKR_ONT["okr: namespace"]
        OKR_O[Objective]
        OKR_KR[KeyResult]
    end

    subgraph KPI_ONT["kpi: namespace"]
        KPI_K[KPI]
        KPI_T[Target]
    end

    subgraph VP_ONT["vp: namespace"]
        VP_VP[ValueProposition]
        VP_IC[IdealCustomer]
        VP_RRR[RRRMetrics]
        VP_ORG[OrgContext]
    end

    subgraph PMF_ONT["pmf: namespace"]
        PMF_ICP[ICP]
        PMF_PER[Persona]
        PMF_PAIN[Pain]
        PMF_GAIN[Gain]
        PMF_BEN[Benefit]
    end

    subgraph EFS_ONT["efs: namespace"]
        EFS_TH[Theme]
        EFS_EP[Epic]
        EFS_FE[Feature]
        EFS_ST[UserStory]
        EFS_TK[Task]
    end

    VSOM_O -->|"defines"| OKR_O
    VSOM_M -->|"measuredBy"| KPI_K
    VSOM_I -->|"aligns"| EFS_TH

    OKR_O -->|"contextFor"| VP_VP
    OKR_KR -->|"validates"| VP_VP
    KPI_K -->|"measures"| VP_RRR

    VP_IC -->|"defines"| PMF_ICP
    VP_ORG -.->|"alignsTo"| VSOM_O

    PMF_ICP -->|"segments"| EFS_TH
    PMF_PAIN -->|"addressedBy"| EFS_EP
    PMF_GAIN -->|"deliveredBy"| EFS_FE
    PMF_BEN -->|"realizedIn"| EFS_ST
    PMF_PER -->|"referencedBy"| EFS_ST

    style VSOM_ONT fill:#e1f5fe
    style OKR_ONT fill:#fff9c4
    style KPI_ONT fill:#fff9c4
    style VP_ONT fill:#f3e5f5
    style PMF_ONT fill:#e8f5e9
    style EFS_ONT fill:#fff3e0
```

---

*Diagrams Version: 3.0.0 | Part of EFS Lineage Specification v3.0.0*
