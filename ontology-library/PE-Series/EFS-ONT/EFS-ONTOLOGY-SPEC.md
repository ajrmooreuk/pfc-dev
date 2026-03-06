# Epic-Features-Stories (EFS) Ontology Specification

## Overview

The Epic-Features-Stories (EFS) Ontology provides a modular, Schema.org-grounded semantic framework for managing the complete idea-to-execution lifecycle in product development. It is designed as a pluggable component that integrates with:

- **Value Proposition Ontology** (upstream) - Connecting product specifications to value delivery
- **Product-Market Fit (PMF) Ontology** (parallel) - Validating market alignment
- **Go-To-Market (GTM) Ontology** (downstream) - Enabling market launch coordination

## Design Principles

### 1. Modular Architecture
The ontology is organised into discrete modules that can be deployed independently based on organisational maturity and needs. Core modules provide essential functionality; extension modules add capabilities progressively.

### 2. Schema.org Foundation
All classes extend Schema.org base types, ensuring semantic interoperability and compatibility with existing knowledge graph infrastructure.

### 3. Integration-First Design
Explicit integration interfaces define connection points to external ontologies, enabling seamless value flow from strategy to market.

### 4. Lean/Agile Alignment
The specification embeds lean principles (hypothesis validation, MVP, iterative delivery) and agile practices (sprints, velocity, acceptance criteria) as first-class concepts.

---

## Core Class Hierarchy

```
schema:CreativeWork
└── efs:BacklogItem (abstract)
    ├── efs:Epic
    │   └── efs:Feature
    │       └── efs:UserStory
    │           └── efs:Task
    └── efs:Enabler

schema:Thing
├── efs:Outcome
├── efs:Benefit
├── efs:Hypothesis
├── efs:Capability
├── efs:Theme
├── efs:Risk
└── efs:Dependency

schema:Person
├── efs:Persona
└── efs:Stakeholder

schema:Organization
└── efs:Team

schema:Event
└── efs:Sprint

schema:SoftwareApplication
└── efs:Release
```

---

## Module Definitions

### Core Modules (Required)

#### BacklogManagement
The foundational module providing Epic-Feature-Story hierarchy and backlog operations.

**Classes:** BacklogItem, Epic, Feature, UserStory, Enabler, Task
**Dependencies:** None

#### ValueDelivery
Connects delivery work to business outcomes and benefits.

**Classes:** Outcome, Benefit
**Dependencies:** BacklogManagement
**External Integration:** pmf:ValueProposition, vsom:StrategicObjective

### Extension Modules (Optional)

| Module | Purpose | Dependencies | External Integration |
|--------|---------|--------------|---------------------|
| StrategicAlignment | Theme, capability, and strategy mapping | BacklogManagement, ValueDelivery | vsom:StrategicInitiative |
| ExecutionManagement | Sprint, task, and team execution | BacklogManagement | - |
| ReleaseManagement | Release planning and market readiness | BacklogManagement, ExecutionManagement | gtm:LaunchPlan |
| ValueValidation | Hypothesis testing and lean validation | BacklogManagement, ValueDelivery | pmf:ProductMarketFit |
| QualityAssurance | Acceptance criteria and test automation | BacklogManagement | - |
| RiskManagement | Risk identification and mitigation | BacklogManagement | - |
| DependencyManagement | Inter-item dependencies | BacklogManagement | - |
| UserExperience | Personas and jobs-to-be-done | BacklogManagement | pmf:CustomerSegment |
| CapabilityDelivery | Business capability mapping | BacklogManagement, StrategicAlignment | - |
| TeamManagement | Team structure and capacity | ExecutionManagement | - |
| StakeholderManagement | Stakeholder mapping | BacklogManagement | - |
| TechnicalDebt | Tech debt and enablers | BacklogManagement | - |

---

## Integration Interfaces

### 1. Value Proposition Interface

Connects EFS to the upstream Value Proposition ontology, ensuring features deliver articulated value.

```
efs:Benefit --contributes--> pmf:ValueElement
efs:Feature --delivers--> pmf:ValueProposition
efs:Outcome --validates--> pmf:ValueProposition
```

**Use Case:** When defining features, map each to specific value proposition elements to ensure market alignment.

### 2. Product-Market Fit Interface

Enables hypothesis-driven development aligned with PMF validation.

```
efs:Hypothesis --validates--> pmf:FitValidation
efs:Persona --represents--> pmf:CustomerSegment
efs:UserStory --addresses--> pmf:CustomerNeed
```

**Use Case:** Track hypothesis validation status to inform PMF confidence scoring.

### 3. Go-To-Market Interface

Connects release planning to market launch activities.

```
efs:Release --triggers--> gtm:LaunchPlan
efs:Feature --supports--> gtm:ProductMessage
efs:Capability --enables--> gtm:DifferentiationPoint
```

**Use Case:** Release milestones trigger GTM preparation activities; feature capabilities inform market positioning.

### 4. VSOM Strategic Interface

Ensures product work aligns with strategic objectives.

```
efs:Epic --achieves--> vsom:StrategicObjective
efs:Theme --aligns--> vsom:StrategicInitiative
efs:Outcome --measures--> vsom:StrategicKPI
efs:Capability --maps--> vsom:OperationalCapability
```

**Use Case:** Epics trace to strategic objectives; outcomes contribute to strategic KPI measurement.

---

## Class Specifications

### efs:Epic

Large body of work decomposable into features; represents strategic initiative at product level.

| Property | Type | Description |
|----------|------|-------------|
| epicTheme | Theme | Strategic theme grouping |
| businessOutcome | Outcome | Expected business result |
| targetRelease | Release | Planned release |
| hasFeature | Feature[] | Component features |
| hypotheses | Hypothesis[] | Value assumptions |
| mvpScope | Feature[] | Minimum viable features |
| alignsToObjective | vsom:StrategicObjective | Strategic alignment |
| implementsInitiative | vsom:StrategicInitiative | Initiative mapping |

### efs:Feature

Distinct functionality delivering user or business value; decomposable into stories.

| Property | Type | Description |
|----------|------|-------------|
| featureType | FeatureType | Functional, Non-Functional, Compliance, etc. |
| benefitHypothesis | string | Statement of expected benefit |
| acceptanceCriteria | AcceptanceCriterion[] | Completion conditions |
| hasStory | UserStory[] | Component stories |
| enablesCapability | Capability | Capability enabled |
| technicalEnablers | Enabler[] | Required technical work |
| deliversValue | pmf:ValueProposition | Value proposition mapping |

### efs:UserStory

User-centric description of functionality from specific persona perspective.

| Property | Type | Description |
|----------|------|-------------|
| asA | Persona | User role |
| iWant | string | Desired functionality |
| soThat | string | Expected benefit |
| storyAcceptanceCriteria | AcceptanceCriterion[] | Given-When-Then criteria |
| storyPoints | number | Relative effort |
| hasTasks | Task[] | Implementation tasks |
| forPersona | Persona | Target persona |
| targetsSegment | pmf:CustomerSegment | Market segment |

### efs:Hypothesis

Testable assumption about value delivery; core to lean/agile validation.

| Property | Type | Description |
|----------|------|-------------|
| hypothesisStatement | string | "We believe [X] will result in [Y]" |
| validationMethod | ValidationMethod | How to test |
| successCriteria | AcceptanceCriterion[] | Measurable criteria |
| validationStatus | ValidationStatus | Current state |
| learnings | string | Insights gained |
| validatesForPMF | pmf:ProductMarketFit | PMF connection |

### efs:Outcome

Measurable result achieved through delivery; bridges to value proposition.

| Property | Type | Description |
|----------|------|-------------|
| outcomeType | OutcomeType | Classification |
| leadMetric | vsom:StrategicKPI | Leading indicator |
| lagMetric | vsom:StrategicKPI | Trailing indicator |
| targetValue | QuantitativeValue | Target |
| currentValue | QuantitativeValue | Actual |
| achievesObjective | vsom:StrategicObjective | Strategic mapping |
| realizesBenefit | Benefit | Benefit connection |

### efs:Release

Planned delivery milestone containing features; connects to GTM.

| Property | Type | Description |
|----------|------|-------------|
| releaseVersion | string | Semantic version |
| releaseDate | date | Planned date |
| releaseType | ReleaseType | MVP, Major, Minor, Patch |
| includedFeatures | Feature[] | Scope |
| releaseNotes | string | Description |
| marketReadiness | MarketReadinessLevel | GTM readiness |
| triggersLaunch | gtm:LaunchPlan | GTM trigger |

---

## Enumerations

### PriorityLevel
- Critical (1)
- High (2)
- Medium (3)
- Low (4)

### BacklogItemStatus
- Idea
- Backlog
- Ready
- In Progress
- In Review
- Done
- Released

### FeatureType
- Functional
- Non-Functional
- Compliance
- Integration
- Migration

### EnablerType
- Infrastructure
- Architectural
- Exploration/Spike
- Compliance

### ReleaseType
- MVP
- Major
- Minor
- Patch
- Beta
- General Availability

### ValidationStatus
- Not Tested
- Testing
- Validated
- Invalidated
- Needs More Data

### CapabilityMaturityLevel
- Initial (1)
- Developing (2)
- Defined (3)
- Managed (4)
- Optimizing (5)

---

## Implementation Guidance

### Minimum Viable Implementation

For initial deployment, implement only core modules:

1. **BacklogManagement** - Essential Epic-Feature-Story structure
2. **ValueDelivery** - Outcome and benefit tracking

This provides foundation for basic product management with value alignment.

### Progressive Enhancement Path

```
Phase 1: BacklogManagement + ValueDelivery
    ↓
Phase 2: + StrategicAlignment + QualityAssurance
    ↓
Phase 3: + ExecutionManagement + TeamManagement
    ↓
Phase 4: + ReleaseManagement (GTM integration ready)
    ↓
Phase 5: + ValueValidation (PMF integration ready)
    ↓
Phase 6: + Full module deployment
```

### Tool Integration Patterns

| Tool Category | Mapped EFS Classes | Integration Method |
|--------------|-------------------|-------------------|
| Jira/Azure DevOps | Epic, Feature, UserStory, Task | Bidirectional sync via API |
| Aha!/ProductBoard | Epic, Feature, Outcome, Hypothesis | Import/export JSON-LD |
| Figma/Miro | Persona, UserStory | Manual mapping |
| Power BI/Tableau | Outcome, Benefit, Sprint | Query endpoints |
| GitHub/GitLab | Release, Task | Webhook integration |

---

## Versioning

**Current Version:** 1.0.0

**Namespace:** `https://platformcore.io/ontology/efs/`

**Change Log:**
- 1.0.0 (2026-01-28): Initial release with full module specification

---

## References

- Schema.org: https://schema.org/
- SAFe Framework: https://scaledagileframework.com/
- Lean Startup (Hypothesis-Driven Development)
- Jobs To Be Done Framework
- OKR Methodology (for Outcome alignment)
- [BUSINESS-RULES-SPEC.md](../../BUSINESS-RULES-SPEC.md) — BR-EFS business rules, AR-PE cross-ontology rules, EFS-PPM alignment contract
