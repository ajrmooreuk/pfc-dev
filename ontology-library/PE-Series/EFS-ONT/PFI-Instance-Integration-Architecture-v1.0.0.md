# PFI-Instance Integration Architecture v1.0.0

## Strategic Value Chain: VSOM → VP → EFS → Build

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     VALUE ENGINEERING STACK                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│  │    VSOM     │───▶│   OKR/KPI   │───▶│     VP      │───▶│     ICP     │  │
│  │  (Vision    │    │ (Objectives │    │   (Value    │    │   (Ideal    │  │
│  │  Strategy   │    │  Key        │    │  Proposition│    │  Customer   │  │
│  │  Objectives │    │  Results)   │    │  Canvas)    │    │  Profiles)  │  │
│  │  Measures)  │    │             │    │             │    │             │  │
│  └─────────────┘    └─────────────┘    └─────────────┘    └──────┬──────┘  │
│                                                                   │         │
└───────────────────────────────────────────────────────────────────┼─────────┘
                                                                    │
                                                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     CUSTOMER VALUE DEFINITION                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    PAINS / GAINS / SOLUTIONS                         │   │
│  ├─────────────────┬───────────────────┬───────────────────────────────┤   │
│  │     PAINS       │      GAINS        │         SOLUTIONS             │   │
│  │ (Customer       │ (Customer         │ (How we solve it)             │   │
│  │  frustrations)  │  desired outcomes)│                               │   │
│  │                 │                   │                               │   │
│  │  ↓ Maps to      │  ↓ Maps to        │  ↓ Maps to                    │   │
│  │  EPICS          │  FEATURES         │  USER STORIES + TASKS         │   │
│  └─────────────────┴───────────────────┴───────────────────────────────┘   │
│                                                                             │
└───────────────────────────────────────────────────────────────────────────┬─┘
                                                                            │
                                                                            ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     EFS EXECUTION LAYER                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Theme ──▶ Epic ──▶ Feature ──▶ User Story ──▶ Task ──▶ Acceptance Criteria│
│    │         │         │            │            │                          │
│    │         │         │            │            └──▶ Technical Artifact    │
│    │         │         │            └──▶ "As A [Persona] I Want So That"   │
│    │         │         └──▶ Delivers Value to ICP                          │
│    │         └──▶ Addresses Pain Point                                     │
│    └──▶ Aligns to Strategic Pillar                                         │
│                                                                             │
└───────────────────────────────────────────────────────────────────────────┬─┘
                                                                            │
                                                                            ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     PFC-CORE TECHNICAL ARTIFACTS                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐    │
│  │  PBS-UI   │ │ ONTOLOGIES│ │ DATABASE  │ │  AGENTS   │ │  3RD PARTY│    │
│  │    UX     │ │           │ │           │ │  (Claude) │ │    APIs   │    │
│  └─────┬─────┘ └─────┬─────┘ └─────┬─────┘ └─────┬─────┘ └─────┬─────┘    │
│        │             │             │             │             │           │
│        └─────────────┴─────────────┴─────────────┴─────────────┘           │
│                                    │                                        │
│                                    ▼                                        │
│                          PFI-INSTANCE BUILD                                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Ontology Validation Pipeline (OAA v5.0.0)

> Reference: OAA v5.0.0 defines the canonical validation gates. All ontologies must pass these gates for production readiness.

### OAA v5.0.0 Gate Sequence

```
┌────────────────────────────────────────────────────────────────────────────┐
│                    OAA v5.0.0 VALIDATION GATES                              │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  G1: ENTITY DESCRIPTIONS   G2: CARDINALITY        G2B: CONNECTIVITY       │
│  ┌──────────────┐         ┌──────────────┐       ┌──────────────┐         │
│  │ All entities │         │ Relationships│       │ 100% entity  │         │
│  │ ≥20 chars    │────────▶│ have         │──────▶│ connectivity │         │
│  │ descriptions │         │ cardinality  │       │ No orphans   │         │
│  └──────────────┘         └──────────────┘       └──────────────┘         │
│                                                         │                  │
│                                                         ▼                  │
│  G2C: GRAPH CONNECTIVITY   G3: BUSINESS RULES    G4: SCHEMA.ORG           │
│  ┌──────────────┐         ┌──────────────┐       ┌──────────────┐         │
│  │ Single       │         │ IF-THEN      │       │ Base type    │         │
│  │ component    │◀────────│ format       │◀──────│ mappings     │         │
│  │ ratio ≥0.8   │         │ validation   │       │ for entities │         │
│  └──────────────┘         └──────────────┘       └──────────────┘         │
│        │                                                                   │
│        ▼                                                                   │
│  G5: TEST DATA            G6: UNIREGISTRY                                 │
│  ┌──────────────┐         ┌──────────────┐                                │
│  │ 60% Happy    │         │ Entry in     │                                │
│  │ 20% Edge     │────────▶│ unified-     │──────▶ PRODUCTION READY        │
│  │ 10% Error    │         │ registry     │                                │
│  │ 10% Boundary │         └──────────────┘                                │
│  └──────────────┘                                                          │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

### Gate Definitions (OAA v5.0.0)

| Gate | Name | Requirement |
|------|------|-------------|
| **G1** | Entity Descriptions | All entities have descriptions ≥20 characters |
| **G2** | Relationship Cardinality | All relationships define cardinality (1:1, 1:N, N:1, N:N) |
| **G2B** | Entity Connectivity | 100% entities connected, 0 orphaned |
| **G2C** | Graph Connectivity | Single component, edge:node ratio ≥0.8 |
| **G3** | Business Rules | All rules in IF-THEN format with severity |
| **G4** | Schema.org Mappings | All entities have schema.org base type |
| **G5** | Test Data | 60% happy / 20% edge / 10% error / 10% boundary |
| **G6** | UniRegistry Entry | Valid entry in unified-registry/entries/ |

### Current Ontology Status (per OAA v5.0.0)

| Ontology | G1 | G2 | G2B | G2C | G3 | G4 | G5 | G6 | Version | Priority |
|----------|:--:|:--:|:---:|:---:|:--:|:--:|:--:|:--:|:-------:|:--------:|
| **VP**   | ✅ | ✅ | ✅  | ✅  | ✅ | ✅ | ✅ | ✅ | v1.1.0  | ✅ READY |
| **EFS**  | ✅ | ✅ | ✅  | ✅  | ✅ | ✅ | ❌ | ✅ | v3.0.0  | HIGH     |
| **VSOM** | ✅ | ✅ | ✅  | ✅  | ✅ | ✅ | ❌ | ✅ | v2.1.0  | HIGH     |
| **PPM**  | ✅ | ✅ | ✅  | ✅  | ✅ | ✅ | ❌ | ⚠️ | v5.0.1  | HIGH     |
| **OKR**  | ✅ | ✅ | ⚠️  | ⚠️  | ❌ | ✅ | ❌ | ✅ | v1.0.0  | MEDIUM   |
| **PMF**  | ❌ | ❌ | ❌  | ❌  | ❌ | ❌ | ❌ | ⚠️ | -       | HIGH     |
| **RRR**  | ✅ | ✅ | ⚠️  | ⚠️  | ⚠️ | ✅ | ❌ | ⚠️ | v3.0.0  | MEDIUM   |

> **STATUS UPDATE (2026-02-02):** VP v1.1.0 now fully OAA v5.0.0 compliant with VSOM lineage and EFS bridges. VP↔EFS integration ready for PFI-instance builds.

---

## Agent Orchestration Architecture (Claude SDK)

### Multi-Agent Process Flow for PFI-Instance Build

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    AGENT ORCHESTRATION LAYER                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                        ┌─────────────────────┐                              │
│                        │   ORCHESTRATOR      │                              │
│                        │   AGENT (ORC-AGN)   │                              │
│                        │                     │                              │
│                        │   - Task routing    │                              │
│                        │   - State mgmt      │                              │
│                        │   - Progress track  │                              │
│                        └──────────┬──────────┘                              │
│                                   │                                         │
│           ┌───────────────────────┼───────────────────────┐                 │
│           │                       │                       │                 │
│           ▼                       ▼                       ▼                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐         │
│  │  STRATEGY-AGN   │    │   VALUE-AGN     │    │    BUILD-AGN    │         │
│  │                 │    │                 │    │                 │         │
│  │  - VSOM parse   │    │  - VP validate  │    │  - EFS→Tasks    │         │
│  │  - OKR extract  │    │  - ICP define   │    │  - Code gen     │         │
│  │  - KPI map      │    │  - Pain/Gain    │    │  - Test gen     │         │
│  └────────┬────────┘    └────────┬────────┘    └────────┬────────┘         │
│           │                      │                      │                   │
│           └──────────────────────┼──────────────────────┘                   │
│                                  │                                          │
│                                  ▼                                          │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                      SPECIALIST AGENTS                                 │ │
│  ├───────────────┬───────────────┬───────────────┬───────────────────────┤ │
│  │   UI-AGN      │   ONT-AGN     │   DB-AGN      │   API-AGN             │ │
│  │               │               │               │                       │ │
│  │   PBS-UI/UX   │   Ontology    │   Database    │   3rd Party           │ │
│  │   Components  │   Generation  │   Schema      │   Integrations        │ │
│  │   Screens     │   Validation  │   Migrations  │   Connectors          │ │
│  └───────────────┴───────────────┴───────────────┴───────────────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Agent Communication Protocol

```typescript
interface AgentMessage {
  from: AgentType;
  to: AgentType;
  type: 'REQUEST' | 'RESPONSE' | 'EVENT' | 'ERROR';
  payload: {
    ontologyRef?: string;      // Reference to ontology entity
    artifactType?: ArtifactType;
    validationStatus?: ValidationStatus;
    buildSpec?: BuildSpecification;
  };
  correlationId: string;
  timestamp: string;
}

type AgentType =
  | 'ORC-AGN'      // Orchestrator
  | 'STRATEGY-AGN' // Strategy layer
  | 'VALUE-AGN'    // Value proposition layer
  | 'BUILD-AGN'    // Build specification layer
  | 'UI-AGN'       // UI/UX generation
  | 'ONT-AGN'      // Ontology management
  | 'DB-AGN'       // Database operations
  | 'API-AGN';     // API integrations

type ArtifactType =
  | 'PBS-UI-UX'
  | 'ONTOLOGY'
  | 'DATABASE'
  | 'AGENT-CLAUDE'
  | 'DATABASE-UI'
  | 'API-INTEGRATION';
```

---

## Iterative MVP Build Process

### Phase-Gated Development Cycle

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ITERATIVE MVP BUILD CYCLE                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ITERATION N                                                                │
│  ═══════════                                                                │
│                                                                             │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐                │
│  │   VALIDATE   │────▶│    SPECIFY   │────▶│    BUILD     │                │
│  │              │     │              │     │              │                │
│  │  VP Ontology │     │  EFS Items   │     │  Artifacts   │                │
│  │  EFS Links   │     │  Tasks       │     │  Tests       │                │
│  │  ICP Mapping │     │  Acceptance  │     │  Deploy      │                │
│  └──────────────┘     └──────────────┘     └──────────────┘                │
│         │                    │                    │                         │
│         ▼                    ▼                    ▼                         │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐                │
│  │   REVIEW     │◀────│   VERIFY     │◀────│   MEASURE    │                │
│  │              │     │              │     │              │                │
│  │  PMF Signal  │     │  Acceptance  │     │  KPIs        │                │
│  │  User Feedback│    │  Criteria    │     │  OKR Progress│                │
│  │  Pivot/Persist│    │  Integration │     │  Value Metrics│               │
│  └──────────────┘     └──────────────┘     └──────────────┘                │
│         │                                                                   │
│         ▼                                                                   │
│  ITERATION N+1 ───────────────────────────────────────────────────────────▶│
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Claude SDK Implementation Pattern

```python
from anthropic import Anthropic
import json

class PFIInstanceBuilder:
    """
    Orchestrates PFI-Instance builds using Claude SDK
    with validated ontologies and iterative development.
    """

    def __init__(self, client: Anthropic):
        self.client = client
        self.ontology_registry = OntologyRegistry()
        self.build_state = BuildState()

    async def validate_ontologies(self, required: list[str]) -> ValidationReport:
        """
        Validate required ontologies before build.
        Required: ['VP', 'EFS'] minimum for MVP.
        """
        report = ValidationReport()

        for ont_id in required:
            # Load ontology from registry
            ontology = self.ontology_registry.get(ont_id)

            # Run through validation gates
            for gate in [G1_Structure, G2_Semantics, G3_Rules,
                        G4_Connectivity, G5_TestData, G6_AgentGuidance]:
                result = await self._validate_gate(ontology, gate)
                report.add_result(ont_id, gate, result)

                if not result.passed and gate.blocking:
                    report.mark_blocked(ont_id, gate)
                    break

        return report

    async def generate_build_spec(self,
                                   vp_instance: ValueProposition,
                                   efs_backlog: list[EFSItem]) -> BuildSpecification:
        """
        Generate build specification from validated VP and EFS items.
        Maps pains→epics, gains→features, solutions→stories.
        """
        spec = BuildSpecification()

        # Map ICP pains to technical requirements
        for pain in vp_instance.pains:
            epic = self._pain_to_epic(pain)
            for gain in pain.related_gains:
                feature = self._gain_to_feature(gain, epic)
                for solution in gain.solutions:
                    story = self._solution_to_story(solution, feature)
                    tasks = self._story_to_tasks(story)

                    # Classify tasks by artifact type
                    for task in tasks:
                        artifact = self._classify_artifact(task)
                        spec.add_artifact(artifact)

        return spec

    async def execute_iteration(self,
                                 spec: BuildSpecification,
                                 iteration: int) -> IterationResult:
        """
        Execute one iteration of MVP build.
        Uses specialist agents for each artifact type.
        """
        result = IterationResult(iteration)

        # Route to specialist agents
        agent_tasks = {
            'PBS-UI-UX': self._invoke_ui_agent,
            'ONTOLOGY': self._invoke_ont_agent,
            'DATABASE': self._invoke_db_agent,
            'AGENT-CLAUDE': self._invoke_agent_agent,
            'API-INTEGRATION': self._invoke_api_agent,
        }

        for artifact in spec.artifacts_for_iteration(iteration):
            agent_fn = agent_tasks.get(artifact.type)
            if agent_fn:
                build_result = await agent_fn(artifact)
                result.add_build_result(build_result)

        # Verify against acceptance criteria
        verification = await self._verify_iteration(result)
        result.set_verification(verification)

        # Measure against OKR/KPIs
        metrics = await self._measure_iteration(result)
        result.set_metrics(metrics)

        return result

    async def _invoke_specialist_agent(self,
                                        agent_type: str,
                                        artifact: Artifact) -> BuildResult:
        """
        Invoke a specialist Claude agent for artifact generation.
        """
        # Load agent prompt from ontology guidance
        agent_prompt = self.ontology_registry.get_agent_guidance(
            agent_type,
            artifact.ontology_ref
        )

        response = await self.client.messages.create(
            model="claude-sonnet-4-20250514",  # or claude-opus-4-5-20251101 for complex
            max_tokens=8192,
            system=agent_prompt.system,
            messages=[{
                "role": "user",
                "content": json.dumps(artifact.to_spec())
            }]
        )

        return BuildResult.from_response(response, artifact)
```

---

## VP ↔ EFS Connection Specification

### Entity Mapping Rules

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    VP → EFS MAPPING RULES                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  VALUE PROPOSITION LAYER              EFS EXECUTION LAYER                   │
│  ══════════════════════              ═══════════════════                    │
│                                                                             │
│  TargetCustomer.persona ─────────────▶ Persona                              │
│       │                                    │                                │
│       └── demographics                     └── goals, painPoints, jtbd      │
│       └── psychographics                                                    │
│       └── willingnessToPay                                                  │
│                                                                             │
│  Problem (severity: high) ───────────▶ Epic                                 │
│       │                                    │                                │
│       └── painPoints[]                     └── implementsInitiative → VSOM │
│       └── consequences[]                   └── hasOutcome[]                 │
│       └── validationEvidence               └── hasRisk[]                    │
│                                                                             │
│  Problem (severity: med/low) ────────▶ Feature                              │
│       │                                    │                                │
│       └── painPoints[]                     └── deliversValue → VP           │
│                                            └── hasStory[]                   │
│                                                                             │
│  Benefit ────────────────────────────▶ UserStory.soThat                     │
│       │                                    │                                │
│       └── type (Quantifiable/Qual)         └── "so that [benefit realized]" │
│       └── category (CostReduction...)      └── hasAcceptanceCriteria[]      │
│                                                                             │
│  Feature (VP) ───────────────────────▶ Feature (EFS)                        │
│       │                                    │                                │
│       └── enablesBenefit                   └── capability[]                 │
│       └── addressesPainPoint               └── enablesCapability[]          │
│       └── priority                         └── priority (MoSCoW)            │
│                                                                             │
│  Solution ───────────────────────────▶ UserStory + Task[]                   │
│       │                                    │                                │
│       └── deliveryMethod                   └── iWant: "[solution action]"   │
│       └── differentiators                  └── tasks: implementation units  │
│                                                                             │
│  Differentiator ─────────────────────▶ Capability                           │
│       │                                    │                                │
│       └── type (Tech, Approach...)         └── strategicImportance          │
│       └── defensibility                    └── maturityLevel                │
│                                                                             │
│  SuccessMetric ──────────────────────▶ AcceptanceCriterion                  │
│       │                                    │                                │
│       └── baseline, target                 └── given/when/then              │
│       └── measurementMethod                └── automatable: true            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Traceability Chain

```json
{
  "@context": "https://pfc.ontology/context/v1",
  "@type": "TraceabilityChain",
  "chain": [
    {
      "layer": "VSOM",
      "entity": "StrategicObjective",
      "instance": "obj-001",
      "value": "Achieve 40% market share in enterprise segment"
    },
    {
      "layer": "OKR",
      "entity": "Objective",
      "instance": "okr-001",
      "value": "Reduce enterprise onboarding time by 80%",
      "linkedFrom": "obj-001"
    },
    {
      "layer": "VP",
      "entity": "Problem",
      "instance": "prob-001",
      "value": "Enterprise customers face 2-week deployment cycles",
      "linkedFrom": "okr-001"
    },
    {
      "layer": "VP",
      "entity": "TargetCustomer",
      "instance": "icp-001",
      "value": "DevOps Lead at F500 company",
      "linkedFrom": "prob-001"
    },
    {
      "layer": "EFS",
      "entity": "Epic",
      "instance": "epic-001",
      "value": "One-Click Enterprise Deployment",
      "linkedFrom": ["prob-001", "okr-001"]
    },
    {
      "layer": "EFS",
      "entity": "Feature",
      "instance": "feat-001",
      "value": "Auto-Config Detection",
      "linkedFrom": "epic-001"
    },
    {
      "layer": "EFS",
      "entity": "UserStory",
      "instance": "story-001",
      "value": "As DevOps Lead, I want auto-detected configs so that deployment takes 5 mins not 2 weeks",
      "linkedFrom": "feat-001",
      "persona": "icp-001"
    },
    {
      "layer": "BUILD",
      "entity": "Task",
      "instance": "task-001",
      "value": "Implement config scanner service",
      "artifactType": "DATABASE",
      "linkedFrom": "story-001"
    }
  ]
}
```

---

## Technical Artifact Classification

### PFC-Core Artifact Types

| Artifact Type | Description | Agent | Ontology Ref |
|--------------|-------------|-------|--------------|
| **PBS-UI-UX** | User interface components, screens, flows | UI-AGN | EFS.Feature → UI Spec |
| **ONTOLOGY** | JSON-LD schema definitions, entity models | ONT-AGN | VP/EFS entity definitions |
| **DATABASE** | Supabase schema, migrations, RLS policies | DB-AGN | EFS.Task → DB operations |
| **AGENT-CLAUDE** | Claude agent prompts, tool definitions | AGENT-AGN | EFS.Capability → Agent spec |
| **DATABASE-UI** | Admin interfaces, CRUD operations | UI-AGN | DB schema → UI mapping |
| **API-INTEGRATION** | 3rd party connectors, webhooks | API-AGN | EFS.Enabler → Integration |

### Task → Artifact Routing Rules

```
IF task.type == "ui" OR task.tags.includes("frontend")
  THEN artifact.type = "PBS-UI-UX"

IF task.type == "schema" OR task.tags.includes("model", "entity")
  THEN artifact.type = "ONTOLOGY"

IF task.type == "data" OR task.tags.includes("storage", "query", "migration")
  THEN artifact.type = "DATABASE"

IF task.type == "agent" OR task.tags.includes("ai", "prompt", "tool")
  THEN artifact.type = "AGENT-CLAUDE"

IF task.type == "admin" OR task.tags.includes("crud", "management")
  THEN artifact.type = "DATABASE-UI"

IF task.type == "integration" OR task.tags.includes("api", "webhook", "external")
  THEN artifact.type = "API-INTEGRATION"
```

---

## Validation Checklist Before Build

### VP Ontology Validation

- [ ] JSON-LD schema valid (@context, @type, @id)
- [ ] TargetCustomer fully defined (demographics, psychographics, willingness)
- [ ] Problems have severity, frequency, painPoints[]
- [ ] Solutions have differentiators[], benefits[]
- [ ] ValueProposition has primaryStatement, evidence[]
- [ ] Cross-references to PMF CustomerSegment validated
- [ ] Test data: 60% happy / 20% edge / 10% error / 10% boundary

### EFS Ontology Validation

- [ ] Epics link to VSOM StrategicObjective
- [ ] Features have deliversValue → VP.ValueProposition
- [ ] UserStories follow "As A / I Want / So That" format
- [ ] Personas map to VP.TargetCustomer
- [ ] AcceptanceCriteria in Given/When/Then format
- [ ] All relationships have inverse definitions
- [ ] Test data: 60% happy / 20% edge / 10% error / 10% boundary

### Connection Validation

- [ ] VP.Problem → EFS.Epic mappings complete
- [ ] VP.Benefit → EFS.UserStory.soThat mappings complete
- [ ] VP.TargetCustomer → EFS.Persona mappings complete
- [ ] VP.SuccessMetric → EFS.AcceptanceCriterion mappings complete
- [ ] Bidirectional links verified
- [ ] No orphan entities in either ontology

---

## Next Steps: Immediate Actions

### 1. VP Ontology Formalization (CRITICAL)
Create formal JSON-LD ontology from existing VP framework documentation.

### 2. Test Data Generation
Generate 60-20-10-10 test data for EFS and VP ontologies.

### 3. Connection Validation Agent
Build agent to validate VP↔EFS cross-references automatically.

### 4. MVP Build Automation Prototype
Implement PFIInstanceBuilder class with Claude SDK for first iteration.

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-02-02 | Initial architecture specification |
