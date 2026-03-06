# Changelog - RCSG Framework Ontology

All notable changes to the RCSG Framework Ontology will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.0.0] - 2026-02-16

### Added
- **RiskDomain** entity — central hub of R-C-S-G model with risk categories (InfoSec, Operational, Regulatory, Technology, AI/Model), structured riskAppetite, bridge to RMF-IS27005
- **ComplianceDomain** entity — absorbs RegulatoryRequirement + ComplianceFramework into unified compliance hub, bridges to GDPR/NCSC-CAF/DSPT
- **SecurityDomain** entity — bridges to MCSB/PII security controls, links to EA-CORE SecurityArchitecture, threat landscape reference to RMF threats
- **GovernanceDomain** entity — enhanced from GovernanceModel with three lines of defence, policy lifecycle, risk appetite governance, board oversight
- **RCSGInstanceProfile** entity — formalises PFI-to-RCSG binding with applicableOntologies, jurisdictionScope, frameworkRequirements, assessmentCadence
- `governanceLevel` enum on RCSGContext: Platform, Instance, Product, Client
- 6 inter-domain relationships: drivesCompliance, drivesSecurity, directsRisk, mandatesCompliance, authorizesSecurity, implementsCompliance
- 4-level governance model scoping rules (Platform/Instance/Product/Client)
- Jurisdiction-to-framework auto-resolution business rules
- New cross-ontology bridges: rcsg-fw → ncsc-caf, rcsg-fw → dspt, rcsg-fw → rmf-is27005

### Changed
- **BREAKING:** RegulatoryRequirement entity absorbed into ComplianceDomain
- **BREAKING:** ComplianceFramework entity absorbed into ComplianceDomain
- **BREAKING:** GovernanceModel entity renamed to GovernanceDomain with enhanced schema
- RCSGContext enhanced with governanceLevel, activeDomains fields
- Cross-ontology bridge targets updated (downstream ontologies must update their references)

### Removed
- RegulatoryRequirement as standalone entity (properties preserved in ComplianceDomain)
- ComplianceFramework as standalone entity (properties preserved in ComplianceDomain)
- GovernanceModel entity name (replaced by GovernanceDomain)

### Migration Notes
See `RCSG-FW-v1-to-v2-Migration-Guide.md` for full entity mapping.

| v1.0.0 Entity | v2.0.0 Entity | Change |
|---------------|---------------|--------|
| RCSGContext | RCSGContext (enhanced) | New governanceLevel + activeDomains fields |
| RegulatoryRequirement | ComplianceDomain | Properties absorbed into regulations sub-object |
| ComplianceFramework | ComplianceDomain | Properties absorbed into frameworks sub-object |
| GovernanceModel | GovernanceDomain | Renamed + enhanced with three lines, policy lifecycle |
| (none) | RiskDomain | New — central hub |
| (none) | SecurityDomain | New — security pillar |
| (none) | RCSGInstanceProfile | New — PFI binding |

### Downstream Impact
All 6 RCSG implementation ontologies require minor bridge updates:
- MCSB-ONT: frameworkImplementedByMCSB target → SecurityDomain
- GDPR-ONT: regulatoryImplementedByGDPR target → ComplianceDomain
- PII-ONT: frameworkImplementedByPII target → SecurityDomain
- RMF-IS27005: riskContextAlignsWith target → RiskDomain
- NCSC-CAF: assessedUnderFramework target → ComplianceDomain
- DSPT-ONT: registeredAsFramework target → ComplianceDomain

---

## [1.0.0] - 2026-02-10

### Added
- Initial release of RCSG Framework Ontology
- **4 Entities:**
  - RCSGContext (top-level RCSG profile)
  - RegulatoryRequirement (regulation tracking with jurisdiction mapping)
  - ComplianceFramework (certification and framework tracking)
  - GovernanceModel (corporate governance structure)
- **10 Relationships:**
  - hasRegulatoryRequirements (RCSGContext → RegulatoryRequirement)
  - hasComplianceFrameworks (RCSGContext → ComplianceFramework)
  - hasGovernanceModel (RCSGContext → GovernanceModel)
  - regulatoryShapedByGeo (→ ctx:GeoContext)
  - rcsgDrivesFunctionalMaturity (→ ctx:FunctionalMaturity)
  - regulatoryInMarket (→ ctx:MarketClassification)
  - complianceRequiresITMaturity (→ ctx:ITMaturity)
  - regulatoryImplementedByGDPR (→ gdpr:DataProtectionPrinciple)
  - frameworkImplementedByMCSB (→ mcsb:SecurityControl)
  - frameworkImplementedByPII (→ pii:ComplianceFramework)
- **4 Business Rules:**
  - BR-RCSG-001: RCSG Context requires at least one requirement or framework
  - BR-RCSG-002: Regulatory requirement requires jurisdiction
  - BR-RCSG-003: Certified framework requires expiry date
  - BR-RCSG-004: Governance model requires governance type
- Cross-ontology references to CTX (4 bridges), GDPR, MCSB, PII
- OAA v6.1.0 compliant

---

## Design Decisions Log

### DD-001: Risk as Central Hub (v2.0.0)
**Decision:** Make RiskDomain the central connector in R-C-S-G model
**Date:** 2026-02-16
**Participants:** Amanda Moore, Claude (architectural analysis)
**Rationale:** Risk is the "why" that drives Compliance (risk of regulatory penalty), Security (risk of breach), and Governance (risk of accountability failure). Risk-centred architecture reflects how organisations actually think about RCSG.
**Impact:** RiskDomain has bridges to all 3 other domains; Governance sits above as director

### DD-002: 4-Level Governance Model (v2.0.0)
**Decision:** Introduce Platform/Instance/Product/Client governance levels
**Date:** 2026-02-16
**Participants:** Amanda Moore
**Rationale:** RCSG is not just a product ontology — it must govern PF-Instances, products built on the platform, and clients served. UK public sector procurement evaluates governance at every tier of the supply chain.
**Impact:** governanceLevel enum on RCSGContext, scoping matrix for all RCSG entities, inheritance rules

### DD-003: Entity Absorption vs Separation (v2.0.0)
**Decision:** Absorb RegulatoryRequirement + ComplianceFramework into ComplianceDomain (not separate)
**Date:** 2026-02-16
**Rationale:** Regulations and frameworks are both compliance concerns. Keeping them as sub-objects within ComplianceDomain gives a cleaner hub-spoke model. Implementation ontologies (GDPR, NCSC-CAF, DSPT) provide the detail.
**Impact:** Breaking change — downstream bridge targets must update

### DD-004: PFI-RCSG Profile Binding (v2.0.0)
**Decision:** Formalize PFI-to-RCSG mapping with RCSGInstanceProfile entity
**Date:** 2026-02-16
**Participants:** Amanda Moore
**Rationale:** AIRL and W4M are both involved in RCSG and EA products/services. Currently implicit which RCSG ontologies apply to which instance. Explicit binding with auto-resolution rules (jurisdiction + vertical → required frameworks).
**Impact:** New entity in RCSG-FW, new rcsgProfile field in registry PFI entries

---

## Contributors

- Amanda Moore (architecture, requirements, commercial context)
- PF-Core Security Module (v1.0.0 initial design)
- OAA Generator v6.1.0 (v1.0.0 generation)

---

**Document Version:** 2.0.0
**Last Updated:** 2026-02-16
