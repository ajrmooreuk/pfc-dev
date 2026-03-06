# Changelog - Process Engineering Ontology (PE-ONT)

All notable changes to PE-ONT will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [4.0.0] - 2026-02-25

### BREAKING CHANGES

- **`AIAgent.capabilities` deprecated** --- free-text string replaced by `pe:agentProvidesSkill` relationship to formal `pe:Skill` entities. Property retained for backward compatibility but marked with `oaa:deprecationNote`. Consumers should migrate to skill-based capability declarations.

### Added --- New Entities (5)

| Entity | Description |
|--------|-------------|
| `pe:Skill` | Typed, invokable capability with formal inputs/outputs. Cross-cutting: any process phase, agent, or path step can invoke a skill regardless of owning ontology series. |
| `pe:Plugin` | Extension bundle providing one or more skills plus configuration. Follows EMC cascade tier model (PFC/PFI/Product/App). |
| `pe:ProcessPath` | Directed graph composition of processes and skills across series boundaries. **No fixed start node** --- entry determined by `entryPoint` flag on steps and runtime context. |
| `pe:PathStep` | Node in a ProcessPath graph. References either a Process (any series) or a Skill (direct invocation). Supports conditional availability via `conditionExpr`. |
| `pe:PathLink` | Directed edge with `bindingStrength` (mandatory/recommended/optional/conditional) and `linkType` (sequential/parallel/fork/join/fallback). |

### Added --- New Relationships (14)

| Relationship | Domain -> Range | Cardinality | Purpose |
|-------------|-----------------|-------------|---------|
| `pe:invokesSkill` | ProcessPhase -> Skill | 0..* | Phase invokes skills cross-cutting across series |
| `pe:agentProvidesSkill` | AIAgent -> Skill | 0..* | Replaces free-text capabilities |
| `pe:skillDependsOn` | Skill -> Skill | 0..* | Skill chaining / prerequisite DAG |
| `pe:providesSkill` | Plugin -> Skill | 1..* | Plugin's callable surface |
| `pe:pluginRequires` | Plugin -> Plugin | 0..* | Plugin dependency chain |
| `pe:pluginExtendsDesignSystem` | Plugin -> ds:DesignSystem | 0..1 | Cross-ontology DS-ONT bridge |
| `pe:hasPathStep` | ProcessPath -> PathStep | 2..* | Graph nodes |
| `pe:hasPathLink` | ProcessPath -> PathLink | 1..* | Graph edges |
| `pe:stepRefersToProcess` | PathStep -> Process | 0..1 | Cross-ontology process reference |
| `pe:stepInvokesSkill` | PathStep -> Skill | 0..1 | Direct skill invocation (mutually exclusive with stepRefersToProcess) |
| `pe:linkFrom` | PathLink -> PathStep | 1..1 | Edge source |
| `pe:linkTo` | PathLink -> PathStep | 1..1 | Edge target |
| `pe:pathImplementsPattern` | ProcessPath -> ProcessPattern | 0..* | Path reuses existing patterns |
| `pe:pathScopedToInstance` | ProcessPath -> emc:InstanceConfiguration | 0..1 | Instance-scoped paths (cross-ontology EMC bridge) |

### Added --- New Business Rules (9)

| Rule | Severity | Summary |
|------|----------|---------|
| BR-009 | error | Every ProcessPath must have at least one entry-point step |
| BR-010 | error | No mandatory-strength cycles in path links (optional/conditional cycles permitted) |
| BR-011 | error | Mandatory links must connect to satisfiable steps |
| BR-012 | error | Conditional links must specify a condition expression |
| BR-013 | error | Each step must reference exactly one process OR skill (mutually exclusive) |
| BR-014 | warning | Active skills should have at least one provider (agent or plugin) |
| BR-015 | error | No circular skill dependencies |
| BR-016 | error | Every plugin must expose at least one skill |
| BR-017 | error | No circular plugin dependencies |

### Added --- OAA v7 Features

| Feature | Count | Description |
|---------|-------|-------------|
| `oaa:imports` | 2 | DS-ONT v3.0.0, EMC-ONT v5.0.0 |
| `oaa:joinPatterns` | 8 | JP-PE-001 through JP-PE-008 |

### Added --- New Competency Questions (5)

- CQ-011: What skills can be invoked from a given process phase?
- CQ-012: What plugins are available at a given cascade tier?
- CQ-013: What are the possible process paths from a given entry point?
- CQ-014: Can a path step invoke a skill directly without entering the full owning process?
- CQ-015: Which process paths are available for a specific PFI instance?

### Added --- Instance Data

- **DMAIC Process Template** (`pe-dmaic-process-template-v1.0.0.jsonld`): Universal Six Sigma DMAIC process improvement template. 53 entities (Process, 5 Phases, 5 Gates, 15 Artifacts, 5 Metrics, Hypothesis, 3 Agents, 2 Patterns, 4 Skills, Plugin, ProcessPath, 5 PathSteps, 4 PathLinks, ValueChain). 78 relationships. First v4.0.0 instance data exercising Skill, Plugin, and ProcessPath entities.

### Preserved

All 10 existing entities, 14 relationships, 8 business rules, and 10 competency questions from v3.0.0 are fully preserved.

### Quality Metrics

| Metric | v3.0.0 | v4.0.0 |
|--------|--------|--------|
| Entities | 10 | 15 |
| Relationships | 14 | 28 |
| Business Rules | 8 | 17 |
| Join Patterns | 0 | 8 |
| Competency Questions | 10 | 15 |
| Cross-Ontology Bridges | 0 | 3 (DS-ONT, EMC-ONT, any-series via stepRefersToProcess) |

---

## [3.0.0] - 2026-02-09

- Upgraded to OAA v6.1.0: converted 14 object cardinalities to string notation, updated namespace URIs to v6.

## [2.0.0] - 2026-02-01

- Upgraded to OAA v5.0.0 JSON-LD compliance.

## [1.0.0] - 2026-01-18

- Initial creation in legacy format. 10 entities, 15 relationships, 8 business rules.

---

## Design Decisions Log

### DD-001: ProcessPath as Directed Graph, Not Sequence (v4.0.0)
**Decision:** Model process compositions as directed graphs with no fixed start node, rather than ordered sequences.
**Date:** 2026-02-25
**Rationale:** Processes across series (PPM, EFS, VSOM, OKR, KPI, VP) can be entered at any point depending on context. A sequence implies a fixed start; a graph with `entryPoint` flags and `bindingStrength` edges captures the real flexibility.
**Impact:** PathStep.entryPoint flag + BR-009 (at least one entry point per path). Mandatory-cycle prevention via BR-010.

### DD-002: Skill as Cross-Cutting Atomic Unit (v4.0.0)
**Decision:** Skills are invokable from any process in any series, not scoped to their owning ontology.
**Date:** 2026-02-25
**Rationale:** A VSOM skill (e.g. analyseVision) may be needed in a PPM phase or an EFS workflow. Restricting skills to their owning series would force full process entry when only a single capability is needed.
**Impact:** `pe:invokesSkill` and `pe:stepInvokesSkill` enable cross-series skill invocation. `owningOntology` property on Skill provides traceability.

### DD-003: bindingStrength as the Flexibility Mechanism (v4.0.0)
**Decision:** PathLink carries a `bindingStrength` enum (mandatory/recommended/optional/conditional) rather than a boolean required/optional flag.
**Date:** 2026-02-25
**Rationale:** Real process routing has four distinct strengths: "must follow" (within VE chain), "should follow" (PPM to EFS), "can follow" (EFS to VSOM fork), and "follows only if condition met" (scope-dependent activation). A boolean loses this nuance.
**Impact:** 4-value enum on PathLink. BR-012 enforces condition expressions on conditional links.

---

## Migration Notes

### From v3.0.0 to v4.0.0

1. **Filename**: Rename from `-oaa-v6.json` to `-oaa-v7.json`
2. **AIAgent.capabilities**: Migrate free-text capabilities to formal `pe:Skill` entities linked via `pe:agentProvidesSkill`. The capabilities property is deprecated but still read.
3. **Registry entry**: Update `Entry-ONT-PE-001.json` version to 4.0.0, add new compliance gates for Skill/Plugin/Path validation.
4. **Skill Builder**: Update `extractProcessSignals()` to also extract Skill entities and their dependencies (see UPGRADE-PE-v4-SKILL-BUILDER.md).
5. **Cross-ontology imports**: PE-ONT now declares `oaa:imports` for DS-ONT and EMC-ONT --- ensure these are available in the ontology loader.

---

## Contributors

- Platform Foundation Core - Ontology Architect Agent
- Azlan EA-AAA

## Last Updated

2026-02-25
