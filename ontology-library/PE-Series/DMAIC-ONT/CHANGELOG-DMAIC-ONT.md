# Changelog — DMAIC-ONT (Six Sigma DMAIC Ontology)

All notable changes to the DMAIC-ONT ontology are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/).

---

## [1.0.0] - 2026-02-26

### Added — New Entities (8)

| Entity | Description |
|--------|-------------|
| `dmaic:SixSigmaProject` | DMAIC project charter, sigma tracking, phase progression |
| `dmaic:SIPOC` | Supplier-Input-Process-Output-Customer process scoping |
| `dmaic:CriticalToQuality` | VOC → CTQ tree with USL/LSL/target specification limits |
| `dmaic:MeasurementSystem` | Gage R&R / MSA — repeatability, reproducibility, %GRR |
| `dmaic:ProcessCapability` | Cp, Cpk, Pp, Ppk, sigma level, DPMO, yield |
| `dmaic:RootCauseAnalysis` | Fishbone (6M), 5-Why, hypothesis testing (p-value) |
| `dmaic:Experiment` | DOE — factorial design, factors, levels, interactions, R² |
| `dmaic:ControlPlan` | SPC chart type, UCL/LCL, reaction plan, monitoring frequency |

### Added — Relationships (18)

- **12 internal**: hasSIPOC, definesCTQ, validatedByMSA, baselineCapability, currentCapability, hasRootCause, testedByExperiment, confirmsImprovement, sustainedByControl, controlMonitors, msaForCapability, ctqFromSIPOC
- **6 cross-ontology (PE-ONT)**: appliesToProcess, improvesMeasure, augmentedByAgent, invokesSkill, testsHypothesis, followsPattern

### Added — Business Rules (8)

| Rule | Severity | Constraint |
|------|----------|------------|
| BR-D-001 | error | SIPOC must exist before any CTQ identification |
| BR-D-002 | error | MSA %GRR must be ≤ 30% for measurement system acceptance |
| BR-D-003 | error | Baseline capability required before root cause analysis |
| BR-D-004 | error | Root cause hypothesis p-value must be < 0.05 for validation |
| BR-D-005 | error | At least one experiment before control plan creation |
| BR-D-006 | error | Every control plan must monitor at least one CTQ |
| BR-D-007 | warning | Project duration advisory: 8-24 weeks typical |
| BR-D-008 | error | Current sigma must exceed baseline sigma for project closure |

### Added — OAA v7 Features

- 3 join patterns (JP-D-001: VOC-to-Sigma Pipeline, JP-D-002: Root-Cause-to-Proof Chain, JP-D-003: Cross-Ontology Process Bridge)
- 8 competency questions (CQ-D-001 through CQ-D-008)
- 8 predefined SPC chart type test instances (X-bar R, X-bar S, I-MR, p, np, c, u, CUSUM)
- PE-ONT v4.0.0 import (Process, ProcessMetric, AIAgent, Skill, Hypothesis, ProcessPattern)

### Quality Metrics

| Metric | Count |
|--------|-------|
| Entity types | 8 |
| Relationships | 18 (12 internal + 6 cross-ontology) |
| Business rules | 8 (6 error + 2 warning) |
| Join patterns | 3 |
| Competency questions | 8 |
| Cross-ontology bridges | 6 (all to PE-ONT) |
| Predefined instances | 8 (SPC chart types) |
| OAA gates passed | 8/8 |

---

## Design Decisions Log

### DD-D-001: Standalone Ontology vs PE-ONT Instance Data (v1.0.0)

**Decision:** Create DMAIC-ONT as a standalone OAA v7 ontology, not PE-ONT instance data.
**Date:** 2026-02-26
**Rationale:** Standard DMAIC introduces 8 entity types that PE-ONT cannot express — SIPOC, CTQ with spec limits, Gage R&R MSA, process capability indices, root cause analysis with p-values, DOE factorial designs, and SPC control plans. These are first-class domain concepts, not process template data.
**Impact:** DMAIC-ONT appears as a registered ontology in the visualiser's ONT Series Library graph alongside K-DMAIC-ONT.

### DD-D-002: Predefined SPC Chart Types as Test Instances (v1.0.0)

**Decision:** Provide 8 predefined SPC chart type instances (X-bar R, X-bar S, I-MR, p, np, c, u, CUSUM) as testInstances.
**Date:** 2026-02-26
**Rationale:** Mirrors K-DMAIC-ONT's 8 DOWNTIME waste category instances. SPC chart types are a well-defined taxonomy; providing them as predefined instances ensures consistency and enables chart type selection in tooling.
**Impact:** Tooling and instance data can reference standard chart types without redefinition.

### DD-D-003: Cross-Ontology via Import, Not Duplication (v1.0.0)

**Decision:** Import PE-ONT v4.0.0 entities via `oaa:imports` and reference them in cross-ontology relationships, rather than duplicating PE-ONT concepts.
**Date:** 2026-02-26
**Rationale:** Same approach as K-DMAIC-ONT (DD-K-003). Avoids entity duplication, maintains single source of truth for Process, ProcessMetric, AIAgent, Skill, Hypothesis, ProcessPattern.
**Impact:** 6 cross-ontology relationships bridge to PE-ONT; DMAIC-ONT depends on Entry-ONT-PE-001.
