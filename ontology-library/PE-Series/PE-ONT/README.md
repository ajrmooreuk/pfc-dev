# PE-Process-Engr-ONT (Process Engineering Core)

**Current Version:** 2.0.0
**OAA Schema Version:** 5.0.0
**Status:** Production
**Part of:** PE-Series-ONT

## Overview

Core Process Engineering ontology. Provides comprehensive definitions for designing, orchestrating, and optimizing business processes with agentic AI augmentation. Supports cradle-to-grave process management from vision through execution and continuous improvement.

## Directory Structure

```
PE-Process-Engr-ONT/
├── README.md
├── process-engineering-v2.0.0-oaa-v5.json      # Current OAA v5 ontology
├── process-engineering-ontology-v1.0.0.json    # Legacy ontology
├── process-engineering-glossary-v1.0.0.md      # Terminology glossary
├── process-engineering-architecture-visual-guide.md
├── process-engineer-agent-specification-v1 (2).md
├── application-scaffold-prd-v1 (1).md          # Application scaffold PRD
├── application-scaffold-process-v1 (1).json    # Scaffold process definition
├── registry-entry-v3.0.0.json                  # Registry entry
├── test-data-v1.0.0.json                       # Test data
├── validation-report-v1.0.0 (3).md             # Validation report
├── archive/                                     # Legacy versions
└── ref-ont-pe-files/                           # Reference files (migrated)
    ├── application-scaffold-*.md/json          # Scaffold specifications
    ├── baiv_implementation_framework (3).md    # BAIV implementation
    ├── baiv_process_ontology (3).json          # BAIV process ontology
    ├── process-engineer-agent-specification-v1.md
    └── process-ontology-*.json                 # Legacy process ontology files
```

## Files

### Core Ontology

| File | Version | Format | Description |
|------|---------|--------|-------------|
| `process-engineering-v2.0.0-oaa-v5.json` | 2.0.0 | OAA v5.0.0 JSON-LD | Current production ontology |
| `process-engineering-ontology-v1.0.0.json` | 1.0.0 | Legacy JSON | Previous version |

### Documentation

| File | Description |
|------|-------------|
| `process-engineering-glossary-v1.0.0.md` | Terminology and definitions |
| `process-engineering-architecture-visual-guide.md` | Architecture visual guide |
| `process-engineer-agent-specification-v1 (2).md` | Agent specification |
| `validation-report-v1.0.0 (3).md` | Ontology validation report |

### Application Scaffold

| File | Description |
|------|-------------|
| `application-scaffold-prd-v1 (1).md` | Product requirements document |
| `application-scaffold-process-v1 (1).json` | Process definition |

### Reference Files (ref-ont-pe-files/)

| File | Description |
|------|-------------|
| `application-scaffold-complete-specification-v1.md` | Complete scaffold specification |
| `application-scaffold-hld-v1.md` | High-level design |
| `application-scaffold-mvp-build-plan-v1.md` | MVP build plan |
| `baiv_implementation_framework (3).md` | BAIV implementation framework |
| `baiv_process_ontology (3).json` | BAIV-specific process ontology |
| `process-ontology-v1.json` | Original process ontology |
| `process-ontology-glossary-v1.json` | Original glossary |
| `process-ontology-testdata-v1.json` | Original test data |
| `process-ontology-registry-entry-v1.json` | Original registry entry |

## Entities

| Entity | Schema.org Base | Description |
|--------|-----------------|-------------|
| Process | Action | Structured sequence of activities |
| ProcessPhase | Action | Distinct stage within a process |
| ProcessArtifact | CreativeWork | Deliverables produced by phases |
| ProcessGate | Action | Quality checkpoints |
| ProcessMetric | PropertyValue | Performance indicators |
| AIAgent | SoftwareApplication | AI process augmentation |
| ProcessInstance | Event | Specific execution of process |
| Hypothesis | Claim | Testable assumptions |
| ValueChain | Thing | End-to-end value delivery |
| ProcessPattern | HowTo | Reusable process templates |

## Key Relationships

| Relationship | Domain | Range | Description |
|--------------|--------|-------|-------------|
| hasPhase | Process | ProcessPhase | Process contains phases |
| produces | ProcessPhase | ProcessArtifact | Phases produce artifacts |
| hasGate | ProcessPhase | ProcessGate | Phases have quality gates |
| measures | Process | ProcessMetric | Processes track metrics |
| augmentedBy | ProcessPhase | AIAgent | AI augmentation |
| dependsOn | ProcessPhase | ProcessPhase | Phase dependencies |
| instantiates | Process | ProcessInstance | Process executions |
| validates | Process | Hypothesis | Hypothesis testing |
| partOfValueChain | Process | ValueChain | Value chain membership |
| implementsPattern | Process | ProcessPattern | Pattern implementation |

## Business Rules

- Dependency phases must complete before dependent phases
- Blocking gates must pass for phase completion
- Mandatory artifacts required before phase completion
- Supervised AI agents require human review
- Circular dependencies are rejected

## Validation

Load in [Ontology Visualiser](https://ajrmooreuk.github.io/Azlan-EA-AAA/) to verify OAA v5.0.0 compliance.

## Change History

| Version | Date | Change |
|---------|------|--------|
| 2.0.0 | 2026-02-01 | Upgraded to OAA v5.0.0 JSON-LD format |
| 1.0.0 | 2026-01-18 | Initial creation in legacy format |

## Migration Notes

- Moved from PE-Series-ONT root to PE-Process-Engr-ONT subfolder on Feb 2026
- Process engineer files migrated from `PF-Core-BAIV/PBS/ONTOLOGIES/pfc-ontologies/pfc-foundation-ont/pfc-ont-process-engineer/` on Feb 2026
- Reference files in ref-ont-pe-files/ contain legacy process ontology versions and BAIV-specific implementations
- Core process engineering ontology remains at v2.0.0
- Now parallel to PE-PPM-ONT within PE-Series-ONT

---

*Part of PE-Series-ONT | OAA Ontology Workbench*
