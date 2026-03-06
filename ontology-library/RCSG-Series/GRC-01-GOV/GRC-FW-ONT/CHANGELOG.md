# Changelog - GRC Framework Ontology

All notable changes to the GRC Framework Ontology (formerly RCSG Framework Ontology) will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [3.0.0] - 2026-02-17

### BREAKING CHANGES
- **Namespace:** `rcsg-fw:` → `grc-fw:` (URI: `https://platformcore.io/ontology/grc-fw/`)
- **RCSGContext** renamed to **GRCContext** with new required `governanceLevel` and optional `sectorClassification` properties
- **rcsgDrivesFunctionalMaturity** renamed to **grcDrivesFunctionalMaturity**
- **Series path:** `RCSG-04-GOV/RCSG-FW-ONT/` → `GRC-01-GOV/GRC-FW-ONT/`
- **Entry ID:** `Entry-ONT-RCSG-FW-001` → `Entry-ONT-GRC-FW-001`

### Added — New Entities (6)
- **GovernanceFramework** — adopted governance framework with ISO 38500 EDM cycle, COBIT 2019 EDM objectives (EDM01-05), NIST CSF 2.0 GOVERN categories, maturity scoring
- **GovernanceBody** — governance body (9 types: Board, SteeringCommittee, RiskCommittee, AuditCommittee, TechnologyCommittee, ARB, AIEthicsBoard, DataGovernanceBoard, SecurityForum) with IIA Three Lines role assignment
- **DecisionRight** — formalised decision authority with 11 decision domains (Investment through Benefit-Realisation), RACI roles, threshold values, delegation rules
- **GovernancePolicy** — policy hierarchy (Policy→Standard→Guideline→Procedure→Baseline→Exception) with enforcement levels, review cycles, regulatory drivers, domain targeting
- **GovernanceAssurance** — assurance activity (8 types: InternalAudit, ExternalAudit, PenTest, RedTeam, CertificationAudit, RegulatoryInspection, VendorAssessment, AI-Model-Audit) with maturity scoring and domain targeting
- **AssuranceFinding** — finding lifecycle (Open→In-Remediation→Risk-Accepted/Closed/Overdue) with severity, remediation tracking, regulatory implication

### Added — New Enumerations (8)
- **GovernanceLevel** — Platform, Instance, Product, Client (4-level governance model)
- **BodyType** — 9 governance body types
- **DecisionDomain** — 11 decision domains aligned to COBIT EDM
- **PolicyType** — 6 policy hierarchy levels
- **AssuranceType** — 8 assurance activity types
- **ThreeLineRole** — IIA Three Lines Model roles (Governing-Body, Line1, Line2, Line3)
- **COBITDomain** — EDM, APO, BAI, DSS, MEA reference codes
- **EnforcementLevel** — Mandatory, Advisory, Voluntary, Conditional

### Added — New Relationships (21)
**Internal (10):**
- hasGRCContext, hasGovernanceFramework, hasGovernanceBody, hasDecisionRight
- hasGovernancePolicy, policyDerivedFrom, hasAssurance, hasFinding
- findingAffectsPolicy, bodyOwnsCode

**Cross-domain — GRC Tier 1 (7):**
- governsRisk (→ erm:RiskRegister) — COBIT EDM03
- governsSecurity (→ sec-fw:SecurityPosture) — NIST CSF GOVERN
- governsCompliance (→ comp-fw:ComplianceAssessment) — COBIT MEA03
- governsAI (→ ai-gov:AISystem) — ISO 42001 / NIST AI RMF
- policyAppliesToSecurityDomain (→ sec-fw:SecurityDomain) — security-specific policy targeting
- assuranceAssessesSecurityPosture (→ sec-fw:SecurityPosture) — security assurance
- assuranceAssessesRisk (→ erm:Risk) — risk-based assurance

**VSEM bridges — VE-Series (7):**
- alignsToVision (→ vsom:VisionStatement) — governance-to-vision alignment
- supportsStrategy (→ vsom:StrategicObjective) — policy-to-strategy alignment
- constrainsExecution (→ vsom:StrategicObjective) — governance guardrails
- validatesAlignment (→ vsom:StrategicObjective) — assurance validates strategy
- achievesObjective (→ vsom:StrategicObjective) — body achieves strategic objectives
- requiresAlignment (→ vsom:StrategicObjective) — decision requires strategic alignment
- measuresImpact (→ vsom:StrategicObjective) — finding measures strategic impact

### Added — New Business Rules (7)
- BR-GRC-011: GovernanceLevel required on GRCContext, GovernanceFramework, GovernanceBody, DecisionRight, GovernancePolicy, GovernanceAssurance
- BR-GRC-012: GovernanceBody requires threeLineRole
- BR-GRC-013: GovernanceFramework must have at least one GovernanceBody
- BR-GRC-014: AssuranceFinding requires assurance parent
- BR-GRC-015: Policy hierarchy validation
- BR-GRC-016: GovernanceLevel cascade (Platform applies to all lower levels)
- BR-GRC-017: Security assurance should reference SecurityPosture

### Added — New Join Patterns (4)
- JP-GRC-005: Assurance → Finding → Policy remediation lifecycle
- JP-GRC-006: GRCContext → SecurityPosture (governance-to-security oversight)
- JP-GRC-007: GRCContext → RiskRegister (governance-to-risk oversight)
- JP-GRC-008: GovernanceFramework → VisionStatement (VSEM strategy alignment)

### Added — Forward Reference Stubs (6)
- erm:RiskRegister, erm:Risk (ERM-ONT — F30.2)
- sec-fw:SecurityPosture, sec-fw:SecurityDomain (SEC-FW-ONT — F30.3)
- comp-fw:ComplianceAssessment (COMP-FW-ONT — F30.3)
- ai-gov:AISystem (AI-GOV-ONT — F30.4)

### Added — VE-Series Stubs (2)
- vsom:VisionStatement, vsom:StrategicObjective (VSOM-ONT — existing)

### Changed
- RCSGContext → GRCContext with new `governanceLevel` (required) and `sectorClassification` (optional) properties
- RegulatoryRequirement enhanced with `aiRelevance` property
- All `ns:` URIs updated from `rcsg-fw:` to `grc-fw:`
- Series path `RCSG-04-GOV` → `GRC-01-GOV`
- JP-RCSG-001 through JP-RCSG-004 renumbered to JP-GRC-001 through JP-GRC-004
- BR-RCSG-001 through BR-RCSG-010 renumbered to BR-GRC-001 through BR-GRC-010
- Glossary term IDs changed from GT-RCSG-* to GT-GRC-*
- crossOntologyReferences section updated with security mapping detail and GRC Tier 1 references

### Preserved
- All 9 CG-ONT entities and their properties (GovernanceCode, GovernancePrinciple, GovernanceAction, GovernanceGlossaryTerm, GovernanceActionMapping, RegulatoryRequirement, ComplianceFramework, GovernanceModel)
- All 24 v2.0.0 relationships (14 internal + 10 cross-ontology)
- All 4 v2.0.0 enumerations (CodeType, CodeStatus, PrincipleCategory, MappingStrength)
- All 10 v2.0.0 business rules (renumbered BR-GRC-001–010)
- All seed instances: 1 governance code, 5 principles, 22 board actions, 12 glossary terms
- 150 cross-framework mapping instances across 9 international standards (separate file)
- 9 domain authority instances (separate file)

### Migration Notes

| v2.0.0 | v3.0.0 | Change |
|--------|--------|--------|
| `rcsg-fw:` namespace | `grc-fw:` namespace | Namespace renamed |
| `RCSGContext` | `GRCContext` | Renamed + new properties |
| `rcsgDrivesFunctionalMaturity` | `grcDrivesFunctionalMaturity` | Renamed |
| `Entry-ONT-RCSG-FW-001` | `Entry-ONT-GRC-FW-001` | Entry ID changed |
| `RCSG-04-GOV/RCSG-FW-ONT/` | `GRC-01-GOV/GRC-FW-ONT/` | Path changed |
| (none) | GovernanceFramework | New entity |
| (none) | GovernanceBody | New entity |
| (none) | DecisionRight | New entity |
| (none) | GovernancePolicy | New entity |
| (none) | GovernanceAssurance | New entity |
| (none) | AssuranceFinding | New entity |

### Standards Alignment
- **ISO 38500:2024** — 6 governance principles, Evaluate-Direct-Monitor cycle → GovernanceFramework.edmCycle
- **COBIT 2019 EDM01-05** — governance objectives → GovernanceFramework.cobitObjectives, COBITDomain enum
- **IIA Three Lines Model 2020** — Line 1/2/3 roles → GovernanceBody.threeLineRole, ThreeLineRole enum
- **NIST CSF 2.0 GOVERN** — 6 categories → GovernanceFramework.nistGovCategories
- **NCSC Cyber Governance Code 2025** — 5 principles, 22 actions → preserved seed instances
- **NIS2 Article 20** — board accountability → GovernanceBody (Board type)

---

## [2.0.0] - 2026-02-16

### Added
- Merged CG-ONT (Cyber Governance Code of Practice) into RCSG-FW
- 5 new entities: GovernanceCode, GovernancePrinciple, GovernanceAction, GovernanceGlossaryTerm, GovernanceActionMapping
- hasGovernanceCode relationship connecting GovernanceModel to governance code hierarchy
- NCSC-CAF and ORG cross-ontology bridges
- 6 new business rules (BR-RCSG-005–010)
- 4 enumerations (CodeType, CodeStatus, PrincipleCategory, MappingStrength)
- Seed instances: 1 code, 5 principles, 22 actions, 12 glossary terms
- 150 cross-framework mapping instances across 9 international standards
- 9 domain authority instances
- Epic 30 F30.8–F30.11

---

## [1.0.0] - 2026-02-10

### Added
- Initial release: 4 entities (RCSGContext, RegulatoryRequirement, ComplianceFramework, GovernanceModel)
- 10 relationships (3 internal + 7 cross-ontology to CTX, GDPR, MCSB, PII)
- 4 business rules
- OAA v6.1.0 compliant

---

## Design Decisions Log

### DD-005: Governance as Superordinate Domain (v3.0.0)
**Decision:** Governance is the superordinate domain — risk, compliance, security, AI governance, and resource economics operate as governed domains within it
**Date:** 2026-02-17
**Rationale:** Consensus across all major frameworks: COBIT 2019 EDM directs APO/BAI/DSS/MEA; NIST CSF 2.0 GOVERN is Function 1; ISO 38500 E-D-M at board level; IIA Three Lines governing body at apex. RCSG→GRC renaming reflects this hierarchy.
**Impact:** GRC-FW is the hub; ERM/COMP-FW/SEC-FW/AI-GOV/RES are governed Tier 1 domains

### DD-006: Cross-Series Caveats (v3.0.0)
**Decision:** Benefits realisation→VE-Series, processes→PE-Series, domain authorities→Foundation/ORG-CONTEXT-ONT
**Date:** 2026-02-17
**Rationale:** Separation of concerns. GRC-FW holds lightweight reference enums for COBIT processes but full process models reside in PE-Series. Benefits are a VE-Series concern bridged via VSEM. Domain authorities are Foundation org types.
**Impact:** VSEM bridge properties connect GRC-FW to VE-Series; no process entities in GRC-FW; domain authorities remain in ORG-CONTEXT-ONT

### DD-007: Security-Specific Edges (v3.0.0)
**Decision:** Explicit governance-to-security relationships (governsSecurity, policyAppliesToSecurityDomain, assuranceAssessesSecurityPosture)
**Date:** 2026-02-17
**Rationale:** Security is a primary governed domain. Board-level oversight of security posture, security-specific policy targeting, and security assurance (PenTest, RedTeam, certification) must be first-class relationships, not generic.
**Impact:** 3 dedicated security cross-domain edges to SEC-FW-ONT forward references

### DD-002: 4-Level Governance Model (v2.0.0, carried forward)
**Decision:** Platform/Instance/Product/Client governance levels
**Date:** 2026-02-16
**Rationale:** RCSG governs at every tier. UK public sector procurement evaluates governance at every supply chain level.
**Impact:** GovernanceLevel enum on all 6 new entities, cascade rule BR-GRC-016

---

## Contributors

- Amanda Moore (architecture, requirements, commercial context)
- PF-Core Security Module (v1.0.0 initial design)
- OAA Generator v6.1.0 (v1.0.0 generation)

---

**Document Version:** 3.0.0
**Last Updated:** 2026-02-17
