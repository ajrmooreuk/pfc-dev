# PFI-Instance Integration Architecture v1.1.0

## Strategic Value Chain: VSOM → VP → EFS → Build

```mermaid
flowchart TB
    subgraph VE["VALUE ENGINEERING STACK"]
        VSOM["VSOM<br/>(Vision Strategy<br/>Objectives Measures)"]
        OKR["OKR/KPI<br/>(Objectives<br/>Key Results)"]
        VP["VP<br/>(Value Proposition<br/>Canvas)"]
        ICP["ICP<br/>(Ideal Customer<br/>Profiles)"]

        VSOM --> OKR --> VP --> ICP
    end

    subgraph RRR["RRR-INTEGRATED ICP HIERARCHY (v1.2.0)"]
        direction TB
        CMO["CMO<br/>Strategic, Level 1"]
        VPM["VP Marketing<br/>Tactical, Level 2"]
        CD["Content Director<br/>Tactical, Level 3"]
        DGD["Demand Gen Director<br/>Tactical, Level 3"]
        SEOM["SEO Manager<br/>Operational, Level 4"]
        CM["Content Manager<br/>Operational, Level 4"]
        DMM["Digital Mktg Manager<br/>Level 4"]
        MOM["Marketing Ops Manager<br/>Level 4"]

        CMO -->|icpReportsTo| VPM
        VPM -->|icpReportsTo| CD
        VPM -->|icpReportsTo| DGD
        CD -->|icpReportsTo| SEOM
        CD -->|icpReportsTo| CM
        DGD -->|icpReportsTo| DMM
        DGD -->|icpReportsTo| MOM
    end

    ICP --> RRR

    subgraph CVD["CUSTOMER VALUE DEFINITION"]
        subgraph PROB["Hierarchical Problem Structure"]
            SP["STRATEGIC<br/>CMO Level"]
            TP["TACTICAL<br/>Director Level"]
            OP["OPERATIONAL<br/>Manager Level"]

            OP -->|problemRollsUpTo| TP
            TP -->|problemRollsUpTo| SP
        end

        subgraph PGS["Pains / Gains / Solutions"]
            PAINS["PAINS"]
            GAINS["GAINS"]
            SOLUTIONS["SOLUTIONS"]
        end
    end

    RRR --> CVD

    subgraph EFS["EFS EXECUTION LAYER"]
        Theme --> Epic --> Feature --> Story["User Story"] --> Task --> AC["Acceptance Criteria"]
        Task --> TA["Technical Artifact"]
    end

    CVD --> EFS

    subgraph PFCORE["PFC-CORE TECHNICAL ARTIFACTS"]
        PBSUI["PBS-UI/UX"]
        ONT["ONTOLOGIES"]
        DB["DATABASE"]
        AGENTS["AGENTS<br/>(Claude)"]
        APIS["3RD PARTY APIs"]

        PBSUI --> BUILD["PFI-INSTANCE BUILD"]
        ONT --> BUILD
        DB --> BUILD
        AGENTS --> BUILD
        APIS --> BUILD
    end

    EFS --> PFCORE
```

### Value Stack Legend

| Layer | Purpose | Ontology | Key Entities |
|-------|---------|----------|--------------|
| **VSOM** | Vision & Strategic Direction | VSOM v2.1.0 | Vision, Strategy, Objectives, Measures |
| **OKR/KPI** | Objective Tracking | OKR v1.0.0 | Objective, KeyResult, KPI |
| **VP** | Customer Value Definition | VP v1.2.0 | ValueProposition, RoleBasedICP, Problem, Benefit |
| **EFS** | Execution Framework | EFS v3.0.0 | Epic, Feature, UserStory, Task |
| **PFC-Core** | Technical Build | Multiple | UI, Database, Agents, APIs |

---

## RRR-Integrated ICP Hierarchy

```mermaid
graph TB
    subgraph ORG["Organizational Role Hierarchy (RRR v3.0.0)"]
        R_CMO["ExecutiveRole: CMO"]
        R_VPM["ExecutiveRole: VP Marketing"]
        R_CD["FunctionalRole: Content Director"]
        R_DGD["FunctionalRole: Demand Gen Director"]
        R_SEO["FunctionalRole: SEO Manager"]
        R_CM["FunctionalRole: Content Manager"]
        R_DMM["FunctionalRole: Digital Mktg Manager"]
        R_MOM["FunctionalRole: Marketing Ops Manager"]

        R_CMO -->|reportsTo| R_VPM
        R_VPM -->|reportsTo| R_CD
        R_VPM -->|reportsTo| R_DGD
        R_CD -->|reportsTo| R_SEO
        R_CD -->|reportsTo| R_CM
        R_DGD -->|reportsTo| R_DMM
        R_DGD -->|reportsTo| R_MOM
    end

    subgraph ICP["RoleBasedICP Hierarchy (VP v1.2.0)"]
        I_CMO["RoleBasedICP: CMO<br/>seniorityLevel: 1<br/>functionScope: Strategic"]
        I_VPM["RoleBasedICP: VP Marketing<br/>seniorityLevel: 2<br/>functionScope: Tactical"]
        I_CD["RoleBasedICP: Content Director<br/>seniorityLevel: 3<br/>functionScope: Tactical"]
        I_DGD["RoleBasedICP: Demand Gen Director<br/>seniorityLevel: 3<br/>functionScope: Tactical"]
        I_SEO["RoleBasedICP: SEO Manager<br/>seniorityLevel: 4<br/>functionScope: Operational"]
        I_CM["RoleBasedICP: Content Manager<br/>seniorityLevel: 4<br/>functionScope: Operational"]

        I_CMO -->|icpReportsTo| I_VPM
        I_VPM -->|icpReportsTo| I_CD
        I_VPM -->|icpReportsTo| I_DGD
        I_CD -->|icpReportsTo| I_SEO
        I_CD -->|icpReportsTo| I_CM
    end

    R_CMO -.->|roleRef| I_CMO
    R_VPM -.->|roleRef| I_VPM
    R_CD -.->|roleRef| I_CD
    R_DGD -.->|roleRef| I_DGD
    R_SEO -.->|roleRef| I_SEO
    R_CM -.->|roleRef| I_CM

    style R_CMO fill:#f9f,stroke:#333,stroke-width:2px
    style I_CMO fill:#9ff,stroke:#333,stroke-width:2px
```

Each **RoleBasedICP** has:
- `roleRef` → Points to corresponding RRR Role
- `functionScope` → Strategic | Tactical | Operational
- `seniorityLevel` → 1 (C-Suite) to 10 (Individual Contributor)
- `icpHasProblem` → Role-specific problems

---

## Cross-Ontology Lineage Architecture

```mermaid
flowchart LR
    subgraph VSOM["VSOM-ONT v2.1.0"]
        OC["ObjectivesComponent"]
    end

    subgraph VP["VP-ONT v1.2.0"]
        VPE["ValueProposition"]
        RBICP["RoleBasedICP"]
        PROB["Problem"]
        BEN["Benefit"]
        SM["SuccessMetric"]
        VPRACI["VPRACIAssignment"]
    end

    subgraph RRR["RRR-ONT v3.0.0"]
        ER["ExecutiveRole"]
        FR["FunctionalRole"]
        RACI["RACIAssignment"]
    end

    subgraph EFS["EFS-ONT v3.0.0"]
        EPIC["Epic"]
        FEAT["Feature"]
        PERS["Persona"]
        US["UserStory"]
        AC["AcceptanceCriterion"]
    end

    OC -->|alignsToObjective| VPE
    VPE -->|mapsToEpic| EPIC
    RBICP -->|manifestsAsPersona| PERS
    RBICP -->|roleRef| ER
    RBICP -->|roleRef| FR
    PROB -->|mapsToEpic| EPIC
    PROB -->|mapsToFeature| FEAT
    BEN -->|realizesInStory| US
    SM -->|metricMapsToAC| AC
    FR -->|hasRACIAssignment| RACI
    VPRACI -.->|extends| RACI

    style RBICP fill:#ffd,stroke:#333,stroke-width:2px
    style VPRACI fill:#ffd,stroke:#333,stroke-width:2px
```

### Join Patterns (VP v1.2.0)

| Pattern ID | Name | Path | Use Case |
|------------|------|------|----------|
| JP-VP-001 | VSOM-to-VP Alignment | `ObjectivesComponent → alignsToObjective ← ValueProposition` | Strategy drives VP |
| JP-VP-002 | VP-to-EFS Execution | `Problem → mapsToEpic → Epic → hasFeature → Feature` | Problem to execution |
| JP-VP-003 | ICP-to-Persona Bridge | `IdealCustomerProfile → manifestsAsPersona → Persona` | ICP to stories |
| JP-VP-008 | **RRR-to-ICP Role Bridge** | `ExecutiveRole → roleRef ← RoleBasedICP → icpReportsTo` | Role hierarchy to ICP |
| JP-VP-009 | **Problem Roll-Up Chain** | `Problem[Op] → problemRollsUpTo → Problem[Tac] → Problem[Strat]` | Root cause tracing |
| JP-VP-010 | **RACI-VP Activity Chain** | `VPRACIAssignment → role → FunctionalRole → roleRef ← RoleBasedICP` | Accountability chain |

---

## Problem Roll-Up Hierarchy

```mermaid
flowchart BT
    subgraph OP["OPERATIONAL PROBLEMS (Manager Level)"]
        OP1["SEO Tactics Ineffective<br/>Severity: Moderate<br/>Owner: SEO Manager"]
        OP2["No CRM Integration<br/>Severity: Minor<br/>Owner: Marketing Ops"]
        OP3["Content Structure Unknown<br/>Severity: Moderate<br/>Owner: Content Manager"]
        OP4["Campaign Attribution Gaps<br/>Severity: Minor<br/>Owner: Digital Mktg Mgr"]
    end

    subgraph TP["TACTICAL PROBLEMS (Director Level)"]
        TP1["Channel Fragmentation<br/>Severity: Major<br/>Owner: VP Marketing"]
        TP2["Team Capability Gap<br/>Severity: Major<br/>Owner: VP Marketing"]
        TP3["AI Attribution Gap<br/>Severity: Major<br/>Owner: Demand Gen Dir"]
    end

    subgraph SP["STRATEGIC PROBLEMS (CMO Level)"]
        SP1["AI Invisibility<br/>Severity: Critical<br/>Owner: CMO"]
        SP2["Budget Uncertainty<br/>Severity: Major<br/>Owner: CMO"]
    end

    OP1 -->|problemRollsUpTo| TP1
    OP3 -->|problemRollsUpTo| TP2
    OP2 -->|problemRollsUpTo| TP3
    OP4 -->|problemRollsUpTo| TP3

    TP1 -->|problemRollsUpTo| SP1
    TP2 -->|problemRollsUpTo| SP1
    TP3 -->|problemRollsUpTo| SP2

    style SP1 fill:#f99,stroke:#333,stroke-width:2px
    style SP2 fill:#f99,stroke:#333,stroke-width:2px
    style TP1 fill:#fc9,stroke:#333,stroke-width:2px
    style TP2 fill:#fc9,stroke:#333,stroke-width:2px
    style TP3 fill:#fc9,stroke:#333,stroke-width:2px
```

### Problem Level → EFS Mapping

| Problem Scope | Severity Range | Maps To | RACI Accountable |
|---------------|----------------|---------|------------------|
| **Strategic** | Critical, Major | Epic | CMO |
| **Tactical** | Major, Moderate | Feature | Director |
| **Operational** | Moderate, Minor | Task / Sub-Feature | Manager |

---

## RACI Integration for VP Activities (v1.2.0)

```mermaid
graph TB
    subgraph Activities["VP Activities"]
        A1["VP_Validation"]
        A2["ICP_Research"]
        A3["Problem_Discovery"]
        A4["Solution_Design"]
        A5["Benefit_Measurement"]
        A6["Messaging_Development"]
    end

    subgraph Roles["Role Assignments"]
        CMO["CMO"]
        VPM["VP Marketing"]
        CD["Content Director"]
        SEO["SEO Manager"]
        DGD["Demand Gen Dir"]
        MO["Marketing Ops"]
    end

    A1 -->|Accountable| CMO
    A1 -->|Responsible| VPM

    A2 -->|Accountable| CMO
    A2 -->|Responsible| VPM

    A3 -->|Accountable| CMO
    A3 -->|Responsible| VPM
    A3 -->|Responsible| CD
    A3 -->|Responsible| SEO

    A5 -->|Accountable| CMO
    A5 -->|Responsible| VPM
    A5 -->|Responsible| MO

    A6 -->|Accountable| CMO
    A6 -->|Responsible| CD
```

### VP Activity RACI Matrix

| VP Activity | CMO | VP Mktg | Content Dir | SEO Mgr | Demand Gen Dir | Mktg Ops |
|-------------|:---:|:-------:|:-----------:|:-------:|:--------------:|:--------:|
| VP_Validation | **A** | R | C | I | C | I |
| ICP_Research | A | **R** | C | I | C | I |
| Problem_Discovery | A | **R** | R | R | R | C |
| Solution_Design | A | **R** | C | R | C | R |
| Benefit_Measurement | **A** | R | I | I | R | **R** |
| Pain_Resolution | A | **A** | R | R | R | C |
| Competitive_Analysis | C | **A** | R | R | I | I |
| Messaging_Development | **A** | R | **R** | C | C | I |

**Legend:** **A** = Accountable (one per activity), R = Responsible, C = Consulted, I = Informed

### VPRACIAssignment Entity

```json
{
  "@id": "vp:VPRACIAssignment",
  "properties": [
    "vpActivity: VP_Validation | ICP_Research | Problem_Discovery | ...",
    "role: Reference to pf:ExecutiveRole or pf:FunctionalRole",
    "raciType: Responsible | Accountable | Consulted | Informed",
    "vpEntityRef: Reference to specific VP entity (optional)",
    "context: Additional context for this assignment"
  ],
  "businessRules": [
    "BR-VP-019: Each activity must have exactly ONE Accountable role",
    "BR-VP-019: Each activity must have AT LEAST ONE Responsible role"
  ]
}
```

---

## OAA v5.0.0 Validation Pipeline

```mermaid
flowchart LR
    subgraph G1["G1: ENTITY<br/>DESCRIPTIONS"]
        G1D["All entities<br/>≥20 chars<br/>descriptions"]
    end

    subgraph G2["G2: CARDINALITY"]
        G2D["Relationships<br/>have cardinality<br/>defined"]
    end

    subgraph G2B["G2B: CONNECTIVITY"]
        G2BD["100% entity<br/>connectivity<br/>No orphans"]
    end

    subgraph G2C["G2C: GRAPH<br/>CONNECTIVITY"]
        G2CD["Single component<br/>ratio ≥0.8"]
    end

    subgraph G3["G3: BUSINESS<br/>RULES"]
        G3D["IF-THEN format<br/>validation"]
    end

    subgraph G4["G4: SCHEMA.ORG"]
        G4D["Base type<br/>mappings for<br/>entities"]
    end

    subgraph G5["G5: TEST DATA"]
        G5D["60% Happy<br/>20% Edge<br/>10% Error<br/>10% Boundary"]
    end

    subgraph G6["G6: REGISTRY"]
        G6D["Entry in<br/>unified-registry"]
    end

    G1 --> G2 --> G2B --> G2C --> G3 --> G4 --> G5 --> G6
    G6 --> PROD["PRODUCTION<br/>READY"]

    style G6 fill:#9f9,stroke:#333,stroke-width:2px
    style PROD fill:#9f9,stroke:#333,stroke-width:3px
```

### Current Ontology Status (per OAA v5.0.0)

| Ontology | G1 | G2 | G2B | G2C | G3 | G4 | G5 | G6 | Version | Priority |
|----------|:--:|:--:|:---:|:---:|:--:|:--:|:--:|:--:|:-------:|:--------:|
| **VP**   | ✅ | ✅ | ✅  | ✅  | ✅ | ✅ | ✅ | ✅ | v1.1.0  | ✅ READY |
| **VP** (RRR) | ✅ | ✅ | ✅  | ✅  | ✅ | ✅ | ⚠️ | ⚠️ | v1.2.0  | IN PROGRESS |
| **EFS**  | ✅ | ✅ | ✅  | ✅  | ✅ | ✅ | ❌ | ✅ | v3.0.0  | HIGH     |
| **VSOM** | ✅ | ✅ | ✅  | ✅  | ✅ | ✅ | ❌ | ✅ | v2.1.0  | HIGH     |
| **RRR**  | ✅ | ✅ | ✅  | ⚠️  | ✅ | ✅ | ✅ | ✅ | v3.0.0  | ✅ READY |
| **PPM**  | ✅ | ✅ | ✅  | ✅  | ✅ | ✅ | ❌ | ⚠️ | v5.0.1  | HIGH     |
| **OKR**  | ✅ | ✅ | ⚠️  | ⚠️  | ❌ | ✅ | ❌ | ✅ | v1.0.0  | MEDIUM   |
| **ORG-CTX** | ✅ | ✅ | ✅  | ✅  | ✅ | ✅ | ❌ | ⚠️ | v1.0.1  | MEDIUM   |

> **STATUS UPDATE (2026-02-02):**
> - VP v1.1.0: Fully OAA v5.0.0 compliant with VSOM lineage and EFS bridges
> - VP v1.2.0: RRR integration in progress - adds RoleBasedICP, icpReportsTo, problemRollsUpTo, VPRACIAssignment
> - RRR v3.0.0: Production ready, integrated with VP v1.2.0

---

## VP v1.2.0 Schema Enhancements

### New Entities

| Entity | Description | Key Properties |
|--------|-------------|----------------|
| **RoleBasedICP** | ICP specialized for organizational role | `roleRef`, `parentICP`, `seniorityLevel`, `functionScope` |
| **VPRACIAssignment** | RACI for VP activities | `vpActivity`, `role`, `raciType`, `vpEntityRef` |

### New Relationships

| Relationship | Domain → Range | Description |
|--------------|----------------|-------------|
| **roleRef** | RoleBasedICP → ExecutiveRole/FunctionalRole | Links ICP to RRR role |
| **icpReportsTo** | RoleBasedICP → RoleBasedICP | ICP hierarchy matching role hierarchy |
| **problemRollsUpTo** | Problem → Problem | Aggregates operational→tactical→strategic |
| **icpHasProblem** | RoleBasedICP → Problem | Role-specific problems |
| **hasVPRACIAssignment** | VP entities → VPRACIAssignment | RACI accountability |

### New Business Rules (BR-VP-017 through BR-VP-022)

| Rule | Condition | Constraint |
|------|-----------|------------|
| BR-VP-017 | RoleBasedICP.roleRef.reportsTo = roleB | icpReportsTo MUST match role hierarchy |
| BR-VP-018 | Problem.problemRollsUpTo = parentProblem | Child severity ≤ parent severity |
| BR-VP-019 | VPRACIAssignment exists for activity | One Accountable, ≥1 Responsible |
| BR-VP-020 | RoleBasedICP.icpReportsTo = parentICP | Child seniorityLevel > parent seniorityLevel |
| BR-VP-021 | RoleBasedICP created | Must have roleRef to valid RRR role |
| BR-VP-022 | Problem owned by RoleBasedICP | Problem.scopeLevel SHOULD match ICP.functionScope |

---

## Agent Orchestration Architecture (Claude SDK)

```mermaid
flowchart TB
    subgraph ORC["ORCHESTRATOR AGENT (ORC-AGN)"]
        TR["Task Routing"]
        SM["State Management"]
        PT["Progress Tracking"]
        RE["RACI Enforcement"]
    end

    subgraph CORE["CORE AGENTS"]
        SA["STRATEGY-AGN<br/>• VSOM parse<br/>• OKR extract<br/>• KPI map"]
        VA["VALUE-AGN<br/>• VP validate<br/>• ICP hierarchy<br/>• Problem roll-up<br/>• RACI matrix"]
        BA["BUILD-AGN<br/>• EFS→Tasks<br/>• Code gen<br/>• Test gen"]
    end

    subgraph SPEC["SPECIALIST AGENTS"]
        UI["UI-AGN<br/>PBS-UI/UX<br/>Components"]
        ONT["ONT-AGN<br/>Ontology Gen<br/>Validation"]
        DB["DB-AGN<br/>Database<br/>Migrations"]
        API["API-AGN<br/>3rd Party<br/>Integrations"]
    end

    ORC --> SA
    ORC --> VA
    ORC --> BA

    SA --> SPEC
    VA --> SPEC
    BA --> SPEC

    RE -.->|"NEW: VP RACI check"| VA

    style ORC fill:#fcf,stroke:#333,stroke-width:2px
    style VA fill:#ffd,stroke:#333,stroke-width:2px
```

### RACI-Aware Agent Routing (v1.2.0)

```python
class RACIAwareOrchestrator:
    """
    Orchestrator that enforces RACI assignments for VP activities.
    """

    async def route_vp_activity(self,
                                 activity: VPActivity,
                                 initiator_role: str) -> RoutingDecision:
        """
        Route VP activity based on RACI assignments.
        """
        # Get RACI assignments for this activity
        raci_assignments = await self.get_raci_for_activity(activity)

        # Validate initiator has R or A
        initiator_raci = raci_assignments.get(initiator_role)
        if initiator_raci not in ['Responsible', 'Accountable']:
            raise UnauthorizedActivityError(
                f"Role {initiator_role} has {initiator_raci} for {activity}, "
                "cannot initiate. Only R or A roles can initiate."
            )

        # Get accountable role for sign-off requirement
        accountable_role = next(
            role for role, raci in raci_assignments.items()
            if raci == 'Accountable'
        )

        # Get responsible roles for execution
        responsible_roles = [
            role for role, raci in raci_assignments.items()
            if raci == 'Responsible'
        ]

        # Get consulted roles for input gathering
        consulted_roles = [
            role for role, raci in raci_assignments.items()
            if raci == 'Consulted'
        ]

        return RoutingDecision(
            activity=activity,
            execute_with=responsible_roles,
            require_approval_from=accountable_role,
            gather_input_from=consulted_roles,
            notify_on_completion=[
                role for role, raci in raci_assignments.items()
                if raci == 'Informed'
            ]
        )
```

---

## VP → EFS Mapping Flow

```mermaid
flowchart LR
    subgraph VP["VALUE PROPOSITION LAYER (VP v1.2.0)"]
        RBICP["RoleBasedICP<br/>• roleRef → RRR Role<br/>• icpReportsTo<br/>• seniorityLevel"]
        PS["Problem (Strategic)<br/>• scopeLevel: Strategic<br/>• ownerRole: CMO<br/>• severity: Critical"]
        PT["Problem (Tactical)<br/>• scopeLevel: Tactical<br/>• ownerRole: Director<br/>• severity: Major"]
        PO["Problem (Operational)<br/>• scopeLevel: Operational<br/>• ownerRole: Manager<br/>• severity: Moderate"]
        BEN["Benefit<br/>• benefitCategory<br/>• quantifiedValue"]
        SM["SuccessMetric<br/>• baseline, target<br/>• measurementMethod"]
    end

    subgraph EFS["EFS EXECUTION LAYER"]
        PERS["Persona<br/>• goals from functionScope<br/>• painPoints from icpHasProblem"]
        EPIC["Epic<br/>• implementsInitiative<br/>• hasOutcome[]"]
        FEAT["Feature<br/>• deliversValue<br/>• hasStory[]"]
        TASK["Task / Sub-Feature<br/>• belongsToFeature"]
        US["UserStory.soThat<br/>• so that benefit realized"]
        AC["AcceptanceCriterion<br/>• given/when/then<br/>• automatable: true"]
    end

    RBICP -->|manifestsAsPersona| PERS
    PS -->|mapsToEpic| EPIC
    PT -->|mapsToFeature| FEAT
    PO -->|mapsToTask| TASK
    BEN -->|realizesInStory| US
    SM -->|metricMapsToAC| AC

    style RBICP fill:#ffd,stroke:#333,stroke-width:2px
    style PS fill:#f99,stroke:#333,stroke-width:2px
    style PT fill:#fc9,stroke:#333,stroke-width:2px
    style PO fill:#ff9,stroke:#333,stroke-width:2px
```

### Entity Mapping Rules Summary

| VP Entity | EFS Entity | Key Transformation |
|-----------|------------|-------------------|
| **RoleBasedICP** | Persona | goals from functionScope, painPoints from icpHasProblem |
| **Problem (Strategic)** | Epic | CMO-level issues become major initiatives |
| **Problem (Tactical)** | Feature | Director-level issues become features |
| **Problem (Operational)** | Task | Manager-level issues become tasks |
| **Benefit** | UserStory.soThat | Benefit realized in story acceptance |
| **SuccessMetric** | AcceptanceCriterion | Metrics become testable criteria |

---

## CMO Dashboard View

```mermaid
flowchart TB
    subgraph STRAT["STRATEGIC PROBLEM: AI Invisibility (Critical)"]
        direction TB
        INFO["Owner: CMO<br/>Status: Active<br/>Impact: $5M TAM affected"]

        subgraph AGG["Aggregated From (Tactical)"]
            T1["Channel Fragmentation (Major)<br/>Owner: VP Marketing"]
            T2["Team Capability Gap (Major)<br/>Owner: VP Marketing"]

            subgraph ROOT1["Root Causes"]
                O1["Traditional SEO Ineffective<br/>Owner: SEO Manager"]
                O2["Campaign AI Impact Unknown<br/>Owner: Digital Marketing"]
            end

            subgraph ROOT2["Root Causes"]
                O3["No AI Optimization Playbook<br/>Owner: SEO Manager"]
                O4["Content Structure Unknown<br/>Owner: Content Manager"]
            end
        end

        T1 --- ROOT1
        T2 --- ROOT2

        subgraph RES["RESOLUTION STATUS"]
            EPIC["EFS Epic: AI Visibility Platform"]
            STATS["Features: 3 | Stories: 8 | Tasks: 24"]
            PROG["Sprint Progress: 80%"]
        end
    end

    style STRAT fill:#fff,stroke:#333,stroke-width:2px
    style T1 fill:#fc9,stroke:#333
    style T2 fill:#fc9,stroke:#333
    style O1 fill:#ff9,stroke:#333
    style O2 fill:#ff9,stroke:#333
    style O3 fill:#ff9,stroke:#333
    style O4 fill:#ff9,stroke:#333
```

---

## Implementation Checklist

### VP v1.2.0 RRR Integration

- [x] Create RoleBasedICP entity
- [x] Add icpReportsTo relationship
- [x] Add problemRollsUpTo relationship
- [x] Add VPRACIAssignment entity
- [x] Add roleRef relationship
- [x] Add icpHasProblem relationship
- [x] Add business rules BR-VP-017 through BR-VP-022
- [x] Add join patterns JP-VP-008 through JP-VP-011
- [x] Create BAIV enhanced instance with hierarchical ICPs
- [ ] Generate G5 test data for new entities
- [ ] Update unified registry for v1.2.0

### BAIV Instance Enhancements

- [x] Define role hierarchy (CMO → Directors → Managers)
- [x] Create hierarchical ICPs matching role hierarchy
- [x] Define problems at Strategic/Tactical/Operational levels
- [x] Create problem roll-up relationships
- [x] Define RACI matrix for VP activities
- [ ] Map to EFS Personas by seniority level
- [ ] Generate EFS items from hierarchical problems

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.1.0 | 2026-02-02 | Added VP v1.2.0 RRR integration, hierarchical ICP structure, problem roll-up, RACI matrix, Mermaid diagrams for all architecture visualizations |
| 1.0.0 | 2026-02-02 | Initial architecture specification |
