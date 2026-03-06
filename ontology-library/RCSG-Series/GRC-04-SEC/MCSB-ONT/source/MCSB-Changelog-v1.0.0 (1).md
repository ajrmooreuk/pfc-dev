# MCSB Ontology Changelog

All notable changes to the Microsoft Cloud Security Benchmark (MCSB) Ontology will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-01-23

### Added

#### Entities (10)
- **ControlDomain** - High-level security control category (NS, IM, PA, etc.)
- **SecurityControl** - Specific security control with implementation guidance
- **ImplementationGuidance** - Platform-specific implementation instructions
- **ComplianceMapping** - Cross-framework compliance mappings
- **ResponsibilityAssignment** - Shared responsibility model assignments
- **ComplianceFramework** - External framework reference (NIST, CIS, PCI-DSS)
- **CloudPlatform** - Cloud platform reference (Azure, AWS)
- **CloudService** - Specific cloud service reference
- **SecurityStakeholder** - Security role/stakeholder reference
- **ControlAssessment** - Control implementation assessment

#### Relationships (13)
- belongsToDomain / hasControl - Domain-Control hierarchy
- hasAzureGuidance / hasAWSGuidance / forControl - Guidance relationships
- hasComplianceMapping / mapsToControl / mapsToFramework - Compliance mappings
- hasResponsibility / responsibleFor - Responsibility assignments
- hasStakeholders / responsibleForControls - Stakeholder relationships
- assessedControl / hasAssessments - Assessment relationships
- supportsControls / implementedBy - Service-Control relationships
- belongsToPlatform / hasServices - Platform-Service relationships

#### Enumerations (4)
- **ResponsibilityType** - Client, Provider, Joint, SolutionProvider, ClientSolProvider
- **AssessmentStatus** - Compliant, PartiallyCompliant, NonCompliant, NotApplicable, NotAssessed
- **PriorityLevel** - Critical, High, Medium, Low
- **MappingType** - full, partial, related

#### Business Rules (18)
- Domain uniqueness validation (CD-BR-001, CD-BR-002)
- Control-Domain consistency validation (SC-BR-001, SC-BR-002, SC-BR-003)
- Guidance platform validation (IG-BR-001, IG-BR-002)
- Compliance mapping validation (CM-BR-001, CM-BR-002)
- Responsibility completeness validation (RA-BR-001, RA-BR-002)
- Framework enumeration validation (CF-BR-001)
- Platform-provider consistency (CP-BR-001)
- Service-platform consistency (CS-BR-001)
- Stakeholder role alignment (SS-BR-001)
- Assessment gap validation (CA-BR-001, CA-BR-002)

#### Artifacts (8)
- Ontology Definition (JSON-LD) - `MCSB-Ontology-v1.0.0.jsonld`
- Registry Entry (JSON) - `MCSB-Registry-Entry-v1.0.0.json`
- Glossary (JSON) - `MCSB-Glossary-v1.0.0.json`
- Glossary (Markdown) - `MCSB-Glossary-v1.0.0.md`
- Test Data (JSON) - `MCSB-TestData-v1.0.0.json`
- Validation Report (JSON) - `MCSB-ValidationReport-v1.0.0.json`
- Documentation (Markdown) - `MCSB-Documentation-v1.0.0.md`
- Changelog (Markdown) - `MCSB-Changelog-v1.0.0.md`

### Source Document
- **File:** PFC-Security_Schedules_Microsoft_cloud_security_benchmark_v1.xlsx
- **Framework:** Microsoft Cloud Security Benchmark v1
- **Control Domains:** 12
- **Security Controls:** 76
- **Compliance Frameworks Mapped:** NIST SP800-53 r4, CIS Controls v7.1, CIS Controls v8, PCI-DSS v3.2.1

### Quality Metrics
| Metric | Value |
|--------|-------|
| Schema.org Alignment | 85% |
| Competency Score | 100% |
| Completeness Gates | 5/5 PASS |
| Entity Reuse | 82% |
| Documentation Completeness | 100% |
| Confidence Score | 95% |

### Notes
- Initial release based on OAA System Prompt v4.0.0
- Custom domain competency pattern defined for security-compliance domain
- All completeness gates passed at 100%
- Test data follows 60-20-10-10 distribution (typical/edge/boundary/invalid)
- Glossary includes 16 fields per term as required
- Zero circular dependencies detected
- Zero PII detected in ontology

---

## Future Considerations

### Planned for v1.1.0
- Add MCSB v2 control updates when released
- Expand CloudService instances for Azure and AWS
- Add GCP platform support
- Add ISO 27001 compliance mapping

### Planned for v2.0.0
- Integration with PF-Core Security Module
- Real-time assessment data integration
- Automated remediation workflow support

---

*Maintained by OAA Agent v4.0.0*
*Registry Entry: Entry-020*
