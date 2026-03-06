# EA-ONT (Enterprise Architecture) - Instance Data for PPM-ONT

**Status:** ON HOLD
**OAA Schema Version:** N/A (uses PPM-ONT schema)

## Overview

Enterprise Architecture programme data representing **instance data population** for the PPM-ONT (Portfolio-Programme-Project Management) ontology. This is NOT a separate ontology - it provides dataset instances that conform to PPM-ONT schema.

### Key Clarifications

- **EA-Programme** = Data population conforming to PPM-ONT Programme entity
- **Initiative** = Lifecycle stage BEFORE adoption as a Project (pre-project phase)
- **StrategicPillar, PracticeArea** = Context entities that connect to other ontologies (ORG-ONT, VSOM-ONT)

### Why ON HOLD

The EA-ONT schema work is paused until:
1. Connectivity to other ontologies is established (ORG-ONT, VSOM-ONT)
2. Cross-ontology relationship patterns are defined
3. Platform context requirements are clarified

## Files

| File | Version | Format | Description |
|------|---------|--------|-------------|
| `ea-ontology-v1.0.0-oaa-v5.json` | 1.0.0 | OAA v5.0.0 JSON-LD | Core EA ontology |
| `ea-portfolio-roadmaps-ppm-schema-oaa-v5.jsonld` | 5.0.0 | JSON-LD | PPM extension schema |
| `ea-portfolio-roadmaps-strategic-framework.jsonld` | - | JSON-LD | Instance: Strategic framework |
| `ea-portfolio-roadmaps-advisory-portfolio.jsonld` | - | JSON-LD | Instance: Advisory portfolio |
| `ea-portfolio-roadmaps-dependencies-graph.jsonld` | - | JSON-LD | Instance: Dependency mappings |
| `ea-portfolio-roadmaps-initiatives-batch-*.jsonld` | - | JSON-LD | Instance: Initiative data |

## Entities

| Entity | Schema.org Base | Description |
|--------|-----------------|-------------|
| Portfolio | Intangible | Collection of programmes within investment envelope |
| Programme | Intangible | Set of initiatives aligned to strategic pillar |
| Initiative | Action | Discrete transformation project with outcomes |
| Dependency | Intangible | Sequencing relationship between initiatives |
| Milestone | Event | Achievement point within initiative |
| PracticeArea | Organization | Business unit benefiting from transformation |
| StrategicPillar | Intangible | Major strategic theme grouping programmes |
| BenefitMetric | PropertyValue | Quantified benefit measurement |
| Risk | Intangible | Identified delivery risk |

## Hierarchy

```
Portfolio
    └── hasProgramme → Programme
                          └── hasInitiative → Initiative
                                                ├── hasDependency → Dependency
                                                ├── hasMilestone → Milestone
                                                ├── hasRisk → Risk
                                                └── tracksBenefit → BenefitMetric

StrategicPillar
    └── hasProgrammes → Programme

PracticeArea
    └── receivesInitiativeBenefits → Initiative
```

## Key Relationships

| Relationship | Domain | Range | Cardinality |
|--------------|--------|-------|-------------|
| hasProgramme | Portfolio | Programme | 1..* |
| hasInitiative | Programme | Initiative | 1..* |
| hasDependency | Initiative | Dependency | 0..* |
| alignsToStrategicPillar | Programme | StrategicPillar | 1..1 |
| benefitsPracticeArea | Initiative | PracticeArea | 0..* |
| tracksBenefit | Initiative/Programme | BenefitMetric | 0..* |

## Business Rules

| Rule | Severity | Description |
|------|----------|-------------|
| BR-EA-001 | error | Portfolio must have at least one programme |
| BR-EA-002 | error | Programme must belong to exactly one portfolio |
| BR-EA-003 | error | Initiative must belong to exactly one programme |
| BR-EA-004 | error | No circular dependencies allowed |
| BR-EA-005 | warning | Critical path dependencies require dates |
| BR-EA-006 | warning | Completed initiatives cannot have open milestones |
| BR-EA-007 | warning | High impact risks require mitigation |
| BR-EA-008 | warning | Strategic pillar weights should sum to 1.0 |

## Dependencies

- **VSOM-ONT** - Vision, Strategy, Objectives, Metrics framework
- **PPM-ONT** - Portfolio, Programme, Project Management core

## Validation

Load in [Ontology Visualiser](https://ajrmooreuk.github.io/Azlan-EA-AAA/) to verify OAA v5.0.0 compliance.

## Change History

| Version | Date | Change |
|---------|------|--------|
| 1.0.0 | 2026-02-01 | Initial EA ontology consolidating PPM schema and strategic framework |

---

*Part of PFC Ontologies | OAA Ontology Workbench*
