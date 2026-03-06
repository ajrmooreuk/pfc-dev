# Changelog - Organization Ontology

All notable changes to the Organization Ontology will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-01-20

### Added
- Initial release of Organization Ontology
- **Entity:** Organization with 8 properties
  - organizationId (required, unique identifier)
  - name (required)
  - legalName (optional)
  - type (required, enum: PFI/Agency/Client/Affiliate/Partner/Competitor)
  - industry (required)
  - size (required, enum: Startup/SME/Mid-Market/Enterprise)
  - domain (optional)
  - platformRelationships (required, array)
- **Relationships:** 5 defined relationships
  - managedBy (0..1)
  - partnerOf (0..*)
  - competitorOf (0..*)
  - hasContext (0..1)
  - isAffiliateOf (0..*)
- **Business Rules:** 3 validation rules
  - BR-ORG-001: Multiple Relationships Allowed
  - BR-ORG-002: Agency Managed Requires Manager
  - BR-ORG-003: Unique Organization ID
- **Multi-relationship support:** Organizations can have multiple simultaneous platform relationships
- **Agency-managed client hierarchy:** Support for clients managed by agencies
- **Schema.org alignment:** 85% (5/8 properties directly mapped)
- **Full OAA v4.0.0 artifact package:**
  - Registry entry v3.0.0
  - Glossary (JSON + Markdown)
  - Test data (60-20-10-10 distribution)
  - Validation report
  - Documentation

### Schema.org Mappings
- organizationId → schema:identifier
- name → schema:name
- legalName → schema:legalName
- industry → schema:industry
- domain → schema:url

### Quality Metrics
- Completeness Score: 100%
- Competency Score: 100%
- Test Data Coverage: 100%
- Confidence Score: 0.87

---

## Migration Notes

### From v0.x (if applicable)
This is the initial release. No migration required.

### Breaking Changes
None - initial release.

---

## Roadmap

### Planned for v1.1.0
- [ ] Add support for organization hierarchy (parent/child relationships)
- [ ] Add geolocation properties (headquarters, operating regions)
- [ ] Add founding date and company age

### Planned for v2.0.0
- [ ] Enhanced schema.org alignment
- [ ] Integration with external organization registries (D-U-N-S, LEI)

---

## Contributors

- BAIV Platform Team (initial design)
- Amanda Moore (architecture review)
- Milana (requirements and testing)

---

**Document Version:** 1.0.0  
**Last Updated:** 2026-01-20
