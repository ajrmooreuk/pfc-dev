# PE-Series Process Catalogue as Skills & Plugins Foundation

**Feature:** F34.11 — Process-to-Skill Scaffolding
**Join Pattern:** JP-PE-SK-001 (Process-to-Skill Derivation Bridge)
**Version:** 1.0.0
**Date:** 2026-02-25

---

## 1. The Core Thesis

Every well-defined PE-ONT process is a potential skill, plugin, or agent. The PE-Series ontologies provide the **structural definition** (what the process does), while the Dtree engine provides the **mechanism selection** (how it should be packaged), and the Unified Registry provides the **catalogue** (where it's stored, versioned, and distributed).

```mermaid
flowchart LR
    subgraph PE["PE-Series Ontologies<br/>(What to Build)"]
        PROC["pe:Process"]
        PHASE["pe:ProcessPhase"]
        AGENT["pe:AIAgent"]
        GATE["pe:ProcessGate"]
        PAT["pe:ProcessPattern"]
        ART["pe:ProcessArtifact"]
        MET["pe:ProcessMetric"]
    end

    subgraph DTREE["Dtree Engine<br/>(How to Package)"]
        EVAL["7 Hypothesis Gates"]
        REC["13 Recommendations"]
    end

    subgraph SB["Skill Builder<br/>(Template Factory)"]
        EXTRACT["Signal Extraction"]
        MAP["Phase/Agent/Gate<br/>Mapping"]
        SCAFFOLD["Template<br/>Scaffolding"]
    end

    subgraph REG["Unified Registry<br/>(Catalogue & Distribution)"]
        RA["pfc:RegistryArtifact"]
        CAT["Skill/Plugin/Agent<br/>Catalogue"]
        CASCADE["Core → Instance →<br/>Product → Client"]
    end

    PROC --> EXTRACT
    EXTRACT --> EVAL
    EVAL --> REC
    REC --> MAP
    PROC --> MAP
    MAP --> SCAFFOLD
    SCAFFOLD --> RA
    RA --> CAT
    CAT --> CASCADE

    style PE fill:#1a1a2e,stroke:#3b82f6,color:#ccc
    style DTREE fill:#1a1a2e,stroke:#ef4444,color:#ccc
    style SB fill:#1a1a2e,stroke:#22c55e,color:#ccc
    style REG fill:#1a1a2e,stroke:#f59e0b,color:#ccc
```

---

## 2. PE-Series as the Process Catalogue

### 2.1 Process Entity Model

PE-ONT v3.0.0 defines 10 entity types that together describe any process with sufficient detail to scaffold an automation artifact:

```mermaid
erDiagram
    Process ||--o{ ProcessPhase : "hasPhase"
    Process ||--o{ AIAgent : "usesAgent"
    Process ||--o{ ProcessGate : "hasGate"
    Process ||--o{ ProcessPattern : "appliesPattern"
    Process ||--o{ ProcessMetric : "measuredBy"
    ProcessPhase ||--o{ ProcessArtifact : "produces"
    ProcessPhase ||--o{ ProcessGate : "gatedBy"
    AIAgent ||--o{ ProcessPhase : "participatesIn"

    Process {
        string processId PK
        string processName
        string processType
        int automationLevel
        string businessObjective
        string owner
    }

    ProcessPhase {
        string phaseId PK
        string phaseName
        int phaseNumber
        string activities
        string entryConditions
        string exitConditions
        bool parallelExecution
    }

    AIAgent {
        string agentId PK
        string agentName
        string agentType
        string autonomyLevel
        string capabilities
        string model
        int qualityThreshold
    }

    ProcessGate {
        string gateId PK
        string gateName
        string gateType
        int threshold
        bool automated
        string blockingFactor
    }

    ProcessArtifact {
        string artifactName
        string artifactType
        string format
        bool mandatory
    }

    ProcessMetric {
        string metricName
        string metricType
        string target
        string unit
        string frequency
    }

    ProcessPattern {
        string patternName
        string context
        string problem
        string solution
    }
```

### 2.2 Process Catalogue Assumption

**All processes defined in the PE-Series are candidates for skill/plugin cataloguing.** This means:

| PE-Series Ontology | Process Domain | Example Processes |
|---------------------|----------------|-------------------|
| PE-ONT | Process Engineering | Insurance EA Assessment, Cloud Migration, AIRL Assessment |
| DS-ONT | Design System | Token Extraction, Component Audit, Theme Generation |
| EFS-ONT | Enterprise Fulfilment | Order Processing, Supply Chain, Logistics |
| LSC-ONT | Logistics & Supply Chain | Corridor Management, Route Optimisation |
| OFM-ONT | Operating Model | Capability Assessment, Org Restructure |
| EA-ONT | Enterprise Architecture | TOGAF ADM, Architecture Review |
| PPM-ONT | Portfolio Management | Project Prioritisation, Resource Allocation |

Each ontology that defines `pe:Process` entities (directly or via cross-references) contributes processes to the catalogue.

### 2.3 Process Discovery in the Visualiser

The visualiser already discovers PE processes via `state.discoveredProcesses` (populated at ontology load time):

```mermaid
sequenceDiagram
    participant User
    participant Loader as Ontology Loader
    participant State as state.js
    participant Dtree as Dtree View
    participant SB as Skill Builder

    User->>Loader: Load PE-ONT or any<br/>ontology with pe:Process
    Loader->>Loader: Parse JSON-LD entities
    Loader->>State: Push to state.discoveredProcesses[]
    Note over State: [{processId, name, processType,<br/>phases, automation, version}]

    User->>Dtree: Open Dtree view
    Dtree->>Dtree: Evaluate gates, reach recommendation

    User->>SB: Click "Build from Process"
    SB->>State: Read discoveredProcesses
    SB->>SB: Populate process dropdown
    Note over SB: Shows all discovered PE processes<br/>from all loaded ontologies
```

---

## 3. Registry Artifact Model

### 3.1 The pfc:RegistryArtifact

When the Skill Builder scaffolds a template, it produces a `pfc:RegistryArtifact` — the unit of catalogue entry in the Unified Registry:

```mermaid
graph TD
    subgraph RA["pfc:RegistryArtifact"]
        ID["@id: pfc:skill-ins-ea-v1.0.0"]
        TYPE["artifactType: skill|agent|plugin"]
        SCOPE["scope: core|instance|product|client"]
        STATUS["status: draft|active|deprecated"]
        VER["version: 1.0.0"]
        DERIVED["derivedFromProcess: pe:ins-ea-assessment"]
        DR["decisionRecord: dt:decision-xxx"]
        JOIN["joinPattern: JP-PE-SK-001"]
        COMPS["components: SKILL.md, plugin.json, ..."]
    end

    PROC["pe:Process<br/>ins-ea-assessment"] -->|"pe:derivesSkill"| RA
    DTR["dt:DecisionRecord"] -->|"dt:recommends"| RA

    style RA fill:#1a1a2e,stroke:#f59e0b,color:#ccc
```

### 3.2 Catalogue Cascade: Core -> Instance -> Product -> Client

The Unified Registry architecture uses a 4-tier cascade. Each process-derived artifact lives at the appropriate scope level:

```mermaid
flowchart TD
    subgraph CORE["PFC Core (Shared)"]
        C1["skill-oaa-ontology-gen-v1.0.0"]
        C2["agent-oaa-validation-v1.0.0"]
        C3["plugin-registry-manager-v1.0.0"]
    end

    subgraph INSTANCE["PFI Instance (e.g., BAIV)"]
        I1["skill-ins-ea-assessment-v1.0.0"]
        I2["agent-baiv-discovery-v1.0.0"]
        I3["plugin-baiv-audit-v1.0.0"]
    end

    subgraph PRODUCT["Product (e.g., AI Visibility Audit)"]
        P1["skill-aiva-report-gen-v1.0.0"]
        P2["plugin-aiva-client-v1.0.0"]
    end

    subgraph CLIENT["Client (e.g., Acme Corp)"]
        CL1["skill-acme-custom-report-v1.0.0"]
    end

    CORE --> INSTANCE
    INSTANCE --> PRODUCT
    PRODUCT --> CLIENT

    style CORE fill:#1a1a2e,stroke:#3b82f6,color:#ccc
    style INSTANCE fill:#1a1a2e,stroke:#22c55e,color:#ccc
    style PRODUCT fill:#1a1a2e,stroke:#f59e0b,color:#ccc
    style CLIENT fill:#1a1a2e,stroke:#8b5cf6,color:#ccc
```

| Scope | Who Defines | Example |
|-------|-------------|---------|
| **Core** | PF-Core platform team | OAA ontology generation skill, registry manager plugin |
| **Instance** | PFI instance team (BAIV, W4M, AIRL) | Insurance EA assessment skill, BAIV discovery agent |
| **Product** | Product owner | AI Visibility Audit client plugin |
| **Client** | Client customisation | Client-specific report templates |

### 3.3 Artifact Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Draft : Skill Builder scaffolds
    Draft --> Active : Reviewed & published
    Active --> Updated : New version scaffolded
    Updated --> Active : Published
    Active --> Deprecated : Superseded
    Deprecated --> [*]

    note right of Draft
        Generated by Skill Builder
        from PE process + Dtree recommendation
    end note

    note right of Active
        Listed in registry catalogue
        Available for installation
    end note
```

---

## 4. Join Pattern: JP-PE-SK-001

The Process-to-Skill Derivation Bridge establishes traceability between PE-ONT process structures and the resulting automation artifacts:

```mermaid
graph LR
    subgraph PE["PE-ONT (Source)"]
        P["pe:Process"]
        PH["pe:ProcessPhase"]
        AG["pe:AIAgent"]
        PG["pe:ProcessGate"]
    end

    subgraph SK["Skill/Agent/Plugin (Target)"]
        RA["pfc:RegistryArtifact"]
        STEP["pfc:SkillStep"]
        CAP["pfc:AgentCapability"]
        QC["pfc:SkillQualityCheck"]
    end

    P -->|"pe:derivesSkill (0..*)"| RA
    PH -->|"pe:mapsToStep (0..1)"| STEP
    AG -->|"pe:definesCapability (0..*)"| CAP
    PG -->|"pe:definesQualityCheck (0..*)"| QC

    style PE fill:#1a1a2e,stroke:#3b82f6,color:#ccc
    style SK fill:#1a1a2e,stroke:#22c55e,color:#ccc
```

| Relationship | Cardinality | Meaning |
|-------------|-------------|---------|
| `pe:derivesSkill` | Process -> RegistryArtifact (0..*) | A process can produce multiple skills/agents/plugins |
| `pe:mapsToStep` | ProcessPhase -> SkillStep (0..1) | Each phase maps to at most one workflow step |
| `pe:definesCapability` | AIAgent -> AgentCapability (0..*) | Each agent defines capabilities in the template |
| `pe:definesQualityCheck` | ProcessGate -> SkillQualityCheck (0..*) | Each gate defines a quality checkpoint |

---

## 5. End-to-End Worked Example

### Insurance EA Assessment -> SKILL_STANDALONE

```mermaid
flowchart TD
    subgraph SOURCE["PE-ONT Instance Data"]
        PROC["pe:Process<br/>Insurance EA Assessment<br/>processType: analysis<br/>automationLevel: 65%"]
        PH1["Phase 1: Discovery"]
        PH2["Phase 2: Analysis"]
        PH3["Phase 3: Design"]
        PH4["Phase 4: Roadmap"]
        PH5["Phase 5: Governance"]
        AG1["Agent: Compliance Scanner"]
        AG2["Agent: Risk Assessor"]
        AG3["Agent: Architecture Analyst"]
        G1["Gate: Completeness 80%"]
        G2["Gate: Quality 85%"]
        G3["Gate: Compliance 90%"]
        G4["Gate: Sign-off 100%"]
    end

    subgraph DT_EVAL["Dtree Evaluation"]
        HG01["HG-01: Score 6.5 -> PARTIAL<br/>(65% automation, 3 agents,<br/>analysis type)"]
        HG03["HG-03: Score 6.2 -> PARTIAL<br/>(5 phases, patterns exist,<br/>3 artifacts)"]
        HG07["HG-07: Score 5.8 -> FAIL<br/>(3 agents > 1, skill not<br/>standalone enough)"]
        REC["-> PLUGIN_LIGHTWEIGHT"]
    end

    subgraph OUTPUT["Scaffolded Output"]
        SKILL_MD["SKILL.md<br/>5 sections (from 5 phases)<br/>3 agent capabilities<br/>4 quality gates<br/>5 metrics"]
        MANIFEST["plugin.json<br/>name, version, skills[],<br/>commands[], derivedFromProcess"]
        JSONLD["pfc:RegistryArtifact<br/>artifactType: plugin<br/>scope: instance<br/>JP-PE-SK-001"]
        MERMAID["Workflow Mermaid<br/>5 steps + 4 gate diamonds"]
    end

    PROC --> HG01
    HG01 --> HG03
    HG03 --> HG07
    HG07 --> REC
    REC --> SKILL_MD
    REC --> MANIFEST
    REC --> JSONLD
    REC --> MERMAID

    style SOURCE fill:#1a1a2e,stroke:#3b82f6,color:#ccc
    style DT_EVAL fill:#1a1a2e,stroke:#ef4444,color:#ccc
    style OUTPUT fill:#1a1a2e,stroke:#22c55e,color:#ccc
```

### Phase-to-Section Mapping Detail

| PE Phase | Skill Section | Mapped Content |
|----------|--------------|----------------|
| Discovery (Phase 1) | Section 1: Discovery | Activities -> Instructions, Entry conditions -> Prerequisites, Exit conditions -> Success criteria |
| Analysis (Phase 2) | Section 2: Analysis | + Gate G1 (Completeness 80%) as quality checkpoint |
| Design (Phase 3) | Section 3: Design | + Gate G2 (Quality 85%) + Artifact: Architecture Blueprint |
| Roadmap (Phase 4) | Section 4: Roadmap | + Gate G3 (Compliance 90%) + Artifact: Roadmap Document |
| Governance (Phase 5) | Section 5: Governance | + Gate G4 (Sign-off 100%) + Artifact: Governance Report |

---

## 6. How the Registry Enables Cataloguing

### 6.1 Discovery Path

```mermaid
flowchart LR
    A["PE-ONT loaded<br/>in visualiser"] --> B["Process entities<br/>discovered"]
    B --> C["Decision Tree<br/>evaluates"]
    C --> D["Skill Builder<br/>scaffolds"]
    D --> E["RegistryArtifact<br/>JSON-LD produced"]
    E --> F["Stored in<br/>ont-registry-index.json"]
    F --> G["Queryable by:<br/>- artifactType<br/>- scope<br/>- derivedFromProcess<br/>- recommendation<br/>- version"]
```

### 6.2 Catalogue Query Examples

From the registry, consumers can query:

| Query | Registry Filter | Result |
|-------|----------------|--------|
| "All skills for BAIV instance" | `scope=instance AND instance=BAIV` | Insurance EA Assessment skill, BAIV Discovery agent |
| "All agent templates" | `artifactType=agent` | All agent-type registry artifacts |
| "Skills derived from PE processes" | `joinPattern=JP-PE-SK-001` | All process-derived skills/agents/plugins |
| "Plugins with Cowork UI" | `artifactType=plugin AND cowork=true` | Cowork-enabled plugins |
| "What process defined this skill?" | `derivedFromProcess=pe:ins-ea-assessment` | Back-trace to source PE process |

### 6.3 Cross-Referencing

The `pfc:derivedFromProcess` link in every RegistryArtifact creates a bidirectional reference:

- **Forward**: PE Process -> "What skills/plugins exist for this process?"
- **Backward**: Skill/Plugin -> "What process defined this, and what are its phases/gates/agents?"

This enables:
- **Impact analysis**: If a PE process changes, which skills need updating?
- **Coverage analysis**: Which PE processes have no skills scaffolded yet?
- **Traceability**: From a client using a skill, trace back to the original process definition, its gates, and quality standards

---

## 7. Full PE-Series Coverage Map

Every PE-Series ontology that defines processes contributes to the potential skill catalogue:

```mermaid
graph TD
    subgraph PE_SERIES["PE-Series Ontologies"]
        PE["PE-ONT<br/>Core processes"]
        DS["DS-ONT<br/>Design System"]
        EFS["EFS-ONT<br/>Fulfilment"]
        LSC["LSC-ONT<br/>Logistics"]
        OFM["OFM-ONT<br/>Operating Model"]
        EA["EA-ONT<br/>Enterprise Arch"]
        PPM["PPM-ONT<br/>Portfolio Mgmt"]
    end

    subgraph DT_GATE["Dtree"]
        GATE["7 Gates<br/>13 Recommendations"]
    end

    subgraph CATALOGUE["Skill/Plugin Catalogue"]
        SKILLS["SKILL.md<br/>Templates"]
        AGENTS["Agent<br/>Templates"]
        PLUGINS["Plugin<br/>Manifests"]
    end

    subgraph REGISTRY["Unified Registry"]
        REG["ont-registry-index.json<br/>RegistryArtifact entries"]
    end

    PE --> GATE
    DS --> GATE
    EFS --> GATE
    LSC --> GATE
    OFM --> GATE
    EA --> GATE
    PPM --> GATE

    GATE --> SKILLS
    GATE --> AGENTS
    GATE --> PLUGINS

    SKILLS --> REG
    AGENTS --> REG
    PLUGINS --> REG

    style PE_SERIES fill:#1a1a2e,stroke:#3b82f6,color:#ccc
    style DT_GATE fill:#1a1a2e,stroke:#ef4444,color:#ccc
    style CATALOGUE fill:#1a1a2e,stroke:#22c55e,color:#ccc
    style REGISTRY fill:#1a1a2e,stroke:#f59e0b,color:#ccc
```

---

## 8. PFI Instance Perspective

Each PFI instance declares its `instanceOntologies` in the EMC configuration. The processes within those ontologies define the instance's skill catalogue scope:

| PFI Instance | Instance Ontologies | Available Processes | Potential Catalogue |
|-------------|--------------------|--------------------|-------------------|
| **BAIV** | VP, RRR, KPI, BSC, PE, OFM, LSC, EMC + 8 more | Insurance EA Assessment, AI Visibility Audit, Client Discovery | 16 agents, ~10 skills, ~5 plugins |
| **W4M-WWG** | VP, RRR, LSC, OFM, KPI, BSC, EMC | Supply Chain Management, Corridor Optimisation, Fulfilment Process | ~5 skills, ~3 plugins |
| **AIRL-CAF-AZA** | VP, RRR, KPI, PE, NCSC-CAF, AZALZ | Azure Readiness Assessment, CAF Compliance Audit, Landing Zone Design | ~8 skills, ~3 agents |
| **VHF** (PoC) | VP, RRR, KPI, OFM, BSC, EMC | Customer Journey, Product Catalogue, Support Process | ~4 skills, ~1 agent |

---

## 9. Future Evolution

### 9.1 Automated Catalogue Population

Currently the Skill Builder is manual (user selects process, adjusts parameters, clicks Generate). Future phases could:

1. **Batch scaffolding**: Iterate all `state.discoveredProcesses` and scaffold templates automatically
2. **Registry integration**: Direct publish to `ont-registry-index.json` from the Build Panel
3. **Version management**: Detect when a PE process has changed and prompt re-scaffolding
4. **Diff comparison**: Show what changed between v1.0.0 and v2.0.0 of a scaffolded skill

### 9.2 Cross-Series Skills

Some skills span multiple PE-Series ontologies (e.g., a compliance audit skill needs PE-ONT + GRC-FW-ONT + NCSC-CAF-ONT). The `pfc:dependencies` array in the RegistryArtifact tracks these:

```jsonld
{
  "@type": "pfc:RegistryArtifact",
  "pfc:derivedFromProcess": "pe:caf-compliance-audit",
  "pfc:dependencies": ["PE-ONT", "GRC-FW-ONT", "NCSC-CAF-ONT"],
  "pfc:joinPattern": "JP-PE-SK-001"
}
```

### 9.3 Agent-to-Skill Decomposition

An AGENT_ORCHESTRATOR recommendation may itself contain sub-skills. Future work could recursively scaffold inner skills from sub-agent definitions within the PE process.
