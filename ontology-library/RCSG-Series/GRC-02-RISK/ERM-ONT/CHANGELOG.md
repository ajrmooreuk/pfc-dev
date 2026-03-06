# Changelog — ERM-ONT (Enterprise Risk Management)

All notable changes to the ERM Ontology will be documented in this file,
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] — 2026-02-17

### Initial Release — ISO 31000:2018 Enterprise Risk Management

**Epic 30 F30.2** — GRC Tier 1 domain-agnostic risk management ontology.

### Design Decisions

- **Tier 1 parent**: Positioned above RMF-IS27005-ONT (Tier 2, ISO 27005) as domain-agnostic parent
- **Control ownership**: erm:Control is the single authoritative source for enterprise controls across GRC — SEC-FW and COMP-FW will reference rather than duplicate
- **23 risk categories**: Single flat enum with documentation-only grouping (Traditional 5, Technology 3, AI-Specific 9, Operational-Extended 6)
- **6th entity**: RiskAssessment added beyond the 5-entity spec — ISO 31000 clause 6.4 requires it; bridges to RMF-IS27005's RiskAssessment

### Added — Entities (6)

- **RiskRegister** — 7 scope levels (Enterprise→Vendor), review cadence, risk counts, appetite link
- **Risk** — 23 categories, 5×5 inherent/residual scoring, velocity, trend, 5 response strategies, escalation triggers
- **RiskAppetite** — 5 appetite levels (Averse→Hungry), tolerance thresholds, per-category overrides
- **Control** — 5 types, 4 natures, 5 automation levels (Manual→AI-Driven), effectiveness scoring
- **ResilienceCapability** — 8 types inc. AI-Model-Failover and AI-Pipeline-Recovery, RTO/RPO, FCA/PRA impact tolerances
- **RiskAssessment** — 7 types, 5 methodologies, lifecycle tracking

### Added — Relationships (19)

**Internal (11):**
- containsRisk, belongsToRegister, hasAppetite, mitigatedByControl, controlMitigatesRisk
- protectsAgainstRisk, hasResilienceCapability, assessesRegister, assessmentIdentifiesRisk
- controlTestedByAssessment, resilienceTestedByAssessment

**Cross-ontology (8):**
- governedBy (→ grc-fw:GRCContext) — governance oversight
- assessedByAssurance (→ grc-fw:GovernanceAssurance) — risk-based assurance
- specialisedByInfoSecRisk (→ rmf:Risk) — Tier 1→Tier 2 hierarchy
- specialisedByInfoSecAssessment (→ rmf:RiskAssessment) — Tier 1→Tier 2
- specialisedByInfoSecControl (→ rmf:Control) — Tier 1→Tier 2
- assessedByCAFOutcome (→ ncsc-caf:ContributingOutcome) — CAF Objective A alignment
- controlAlignsToBenchmark (→ mcsb:SecurityControl) — cloud security benchmark
- riskThreatsObjective (→ vsom:StrategicObjective) — VSEM bridge

### Added — Business Rules (15)

BR-ERM-001 through BR-ERM-015. Key rules:
- Risk requires register + owner (001, 002)
- 5×5 scoring calculation (003, 004)
- Critical risk requires non-Accept response (005)
- Mitigate response requires controls (006)
- Accept requires appetite validation (007)
- Enterprise/Division register requires governance link (008)
- Resilience capability requires RTO/RPO (010)
- Escalation trigger for critical/increasing risks (014)

### Added — Enumerations (11)

RegisterScope (7), RiskCategory (23), RiskResponse (5), AppetiteLevel (5), ControlType (5), ControlNature (4), AutomationLevel (5), ResilienceType (8), RiskLevel (4), RiskVelocity (5), AssessmentType (7)

### Standards Alignment

- **ISO 31000:2018** — risk principles, framework (PDCA), risk process
- **COBIT 2019 APO12/EDM03** — managed risk / risk optimisation
- **NCSC Cyber Governance Code Principle A** — board-level risk management
- **FCA/PRA Operational Resilience PS21/3** — IBS, impact tolerances
- **DORA Chapter II** — ICT risk management framework
- **NIS2 Article 21** — 10 minimum cybersecurity measures

### Contributors

- Azlan EA-AAA
