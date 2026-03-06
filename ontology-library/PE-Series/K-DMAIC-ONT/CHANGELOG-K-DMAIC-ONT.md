# Changelog - Kaizen DMAIC Ontology (K-DMAIC-ONT)

All notable changes to K-DMAIC-ONT will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-02-26

### Added --- New Entities (8)

| Entity | Description |
|--------|-------------|
| `kdmaic:KaizenEvent` | Time-boxed 3-5 day rapid improvement blitz with Gemba observation, VSM, experiments, and quick wins. |
| `kdmaic:GembaObservation` | Structured observation recorded at the point of work during a Gemba walk. |
| `kdmaic:WasteCategory` | One of the 8 Lean wastes (DOWNTIME mnemonic). 8 predefined instances included. |
| `kdmaic:ValueStreamMap` | Current-state or future-state VSM with lead time, process time, value-added ratio, takt time. |
| `kdmaic:RapidExperiment` | Quick try-storm test of a countermeasure (hours, not weeks). |
| `kdmaic:QuickWin` | Improvement implemented same-day during the event. |
| `kdmaic:VisualControl` | Visual management mechanism (andon, board, kanban, etc.) sustaining quick wins. |
| `kdmaic:FollowUpAction` | Post-event action item tracked during 30-day follow-up. |

### Added --- Relationships (18)

| # | Relationship | Domain -> Range | Cardinality | Purpose |
|---|-------------|-----------------|-------------|---------|
| 1 | `kdmaic:hasGembaObservation` | KaizenEvent -> GembaObservation | 1..* | Gemba observations from walk |
| 2 | `kdmaic:identifiesWaste` | GembaObservation -> WasteCategory | 1..1 | Classifies observed waste |
| 3 | `kdmaic:targetsWaste` | KaizenEvent -> WasteCategory | 1..* | Primary waste targets |
| 4 | `kdmaic:mapsCurrentState` | KaizenEvent -> ValueStreamMap | 0..1 | Current-state VSM |
| 5 | `kdmaic:mapsFutureState` | KaizenEvent -> ValueStreamMap | 0..1 | Future-state VSM |
| 6 | `kdmaic:runsExperiment` | KaizenEvent -> RapidExperiment | 0..* | Try-storm experiments |
| 7 | `kdmaic:implementsQuickWin` | RapidExperiment -> QuickWin | 0..* | Experiments become quick wins |
| 8 | `kdmaic:eliminatesWaste` | QuickWin -> WasteCategory | 1..1 | Which waste is eliminated |
| 9 | `kdmaic:controlledBy` | QuickWin -> VisualControl | 1..1 | Visual control sustaining win |
| 10 | `kdmaic:hasFollowUp` | KaizenEvent -> FollowUpAction | 0..* | 30-day follow-up actions |
| 11 | `kdmaic:followUpFor` | FollowUpAction -> QuickWin | 0..1 | Links follow-up to quick win |
| 12 | `kdmaic:vsmRevealsWaste` | ValueStreamMap -> WasteCategory | 0..* | VSM identifies wastes |
| 13 | `kdmaic:improvesMeasure` | KaizenEvent -> pe:ProcessMetric | 1..* | Cross-ontology PE bridge |
| 14 | `kdmaic:augmentedByAgent` | KaizenEvent -> pe:AIAgent | 0..* | Cross-ontology PE bridge |
| 15 | `kdmaic:invokesSkill` | KaizenEvent -> pe:Skill | 0..* | Cross-ontology PE bridge |
| 16 | `kdmaic:appliesToProcess` | KaizenEvent -> pe:Process | 1..1 | Cross-ontology PE bridge |
| 17 | `kdmaic:eventImplementsPattern` | KaizenEvent -> pe:ProcessPattern | 0..* | Cross-ontology PE bridge |
| 18 | `kdmaic:experimentTestsHypothesis` | RapidExperiment -> pe:Hypothesis | 0..1 | Cross-ontology PE bridge |

### Added --- Business Rules (8)

| Rule | Severity | Summary |
|------|----------|---------|
| BR-K-001 | error | KaizenEvent.duration must be P1D to P5D |
| BR-K-002 | error | At least one GembaObservation required before Analyze |
| BR-K-003 | error | Every QuickWin must have exactly one VisualControl |
| BR-K-004 | error | FollowUpAction.deadline within 30 days of event end |
| BR-K-005 | error | Both current-state and future-state VSM required before Improve |
| BR-K-006 | warning | Team size 5-10 advisory |
| BR-K-007 | error | Overdue FollowUpActions must trigger escalation |
| BR-K-008 | warning | RapidExperiment.duration should not exceed P1D |

### Added --- OAA v7 Features

| Feature | Count | Description |
|---------|-------|-------------|
| `oaa:imports` | 1 | PE-ONT v4.0.0 |
| `oaa:joinPatterns` | 3 | JP-K-001, JP-K-002, JP-K-003 |
| `testInstances` | 8 | DOWNTIME waste categories |

### Added --- Competency Questions (8)

- CQ-K-001: What wastes were observed during the Gemba walk and how severe are they?
- CQ-K-002: What is the value-added ratio from the current-state VSM and where is the bottleneck?
- CQ-K-003: Which rapid experiments succeeded and became quick wins?
- CQ-K-004: Does every quick win have a visual control ensuring sustainability?
- CQ-K-005: What follow-up actions are outstanding from the 30-day review?
- CQ-K-006: What was the before/after sigma level improvement from the Kaizen event?
- CQ-K-007: Which PE-ONT process metrics improved as a result of this event?
- CQ-K-008: Which waste categories are most frequently observed across events?

### Quality Metrics

| Metric | v1.0.0 |
|--------|--------|
| Entities | 8 |
| Relationships | 18 |
| Business Rules | 8 |
| Join Patterns | 3 |
| Competency Questions | 8 |
| Cross-Ontology Bridges | 6 (PE-ONT) |
| Predefined Instances | 8 (WasteCategory) |

---

## Design Decisions Log

### DD-K-001: Standalone Ontology, Not PE-ONT Instance Data (v1.0.0)
**Decision:** Model Kaizen DMAIC as a standalone ontology importing PE-ONT, not as PE-ONT instance data.
**Date:** 2026-02-26
**Rationale:** Kaizen DMAIC introduces 8 new entity types (GembaObservation, WasteCategory, ValueStreamMap, RapidExperiment, QuickWin, VisualControl, FollowUpAction, KaizenEvent) that PE-ONT cannot express. Standard DMAIC maps cleanly to existing PE-ONT entities (Process, ProcessPhase, ProcessGate, etc.) but Kaizen DMAIC requires waste taxonomy, rapid experiments, visual controls, and Gemba-specific concepts.
**Impact:** New namespace `kdmaic:`, new directory `PE-Series/K-DMAIC-ONT/`, import relationship to PE-ONT.

### DD-K-002: DOWNTIME Mnemonic as Predefined Instances (v1.0.0)
**Decision:** Include all 8 DOWNTIME waste categories as testInstances in the schema, not as a separate instance data file.
**Date:** 2026-02-26
**Rationale:** The 8 wastes are a canonical, universally accepted taxonomy in Lean methodology. They are structural to the ontology (WasteCategory entity references them) and should ship with the schema for G24 compliance. Custom waste categories can extend this set.
**Impact:** 8 testInstances in schema, each with wasteId, wasteName, wasteCode, mnemonic, description, examples, detectionMethod.

### DD-K-003: Cross-Ontology via Import, Not Duplication (v1.0.0)
**Decision:** Reference PE-ONT entities (Process, ProcessMetric, AIAgent, Skill, Hypothesis, ProcessPattern) via `oaa:imports` rather than duplicating definitions.
**Date:** 2026-02-26
**Rationale:** PE-ONT v4.0.0 already defines these entities comprehensively. Duplication would create version drift. Import + cross-ontology relationships maintain a single source of truth.
**Impact:** 6 cross-ontology relationships with `oaa:crossOntology: PE-ONT` annotation.

---

## Contributors

- Platform Foundation Core - Ontology Architect Agent
- Azlan EA-AAA

## Last Updated

2026-02-26
