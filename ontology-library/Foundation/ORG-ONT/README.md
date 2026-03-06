# Organization Ontology

**Version:** 1.0.0  
**Status:** Draft  
**Registry Entry:** ONT-ORG-001  
**Last Updated:** 2026-01-20

---

## Overview

The Organization Ontology defines the core organization entity used throughout the Platform Framework. It establishes the foundational structure for representing businesses, agencies, clients, affiliates, partners, and competitors within the platform ecosystem.

## Purpose

- Define the **foundational organization entity** that all other ontologies reference
- Enable **multi-relationship modeling** (organizations can be client + affiliate simultaneously)
- Support **agency-managed client hierarchies** for white-label scenarios
- Provide **platform-agnostic organization classification**

## Key Features

### Multi-Relationship Support
Organizations can have multiple simultaneous relationships with the platform:
```json
"platformRelationships": [
  {"type": "client", "tier": "direct", "status": "active"},
  {"type": "affiliate", "status": "active", "referralCode": "ABC123"}
]
```

### Organization Types
- **PFI** - Platform Framework Instance (platform operator)
- **Agency** - Manages multiple client organizations
- **Client** - End customer (direct or agency-managed)
- **Affiliate** - Referral partner
- **Partner** - Technology or business partner
- **Competitor** - Tracked for competitive analysis

### Access Tiers
- **direct** - Client accesses platform directly
- **agency_managed** - Client accesses through an agency

## Schema.org Alignment

| Property | Schema.org | Notes |
|----------|------------|-------|
| organizationId | schema:identifier | ✅ Direct mapping |
| name | schema:name | ✅ Direct mapping |
| legalName | schema:legalName | ✅ Direct mapping |
| industry | schema:industry | ✅ Direct mapping |
| domain | schema:url | ✅ Direct mapping |
| type | (custom) | Platform-specific |
| size | (custom) | Platform-specific |
| platformRelationships | (custom) | Platform-specific |

**Overall Alignment:** 85%

## Dependencies

This ontology has **no dependencies** - it is a foundation ontology.

## Dependents

The following ontologies depend on Organization Ontology:
- `pf:ontology:org-context-v1` - Rich organizational context
- `pf:ontology:rbac-v1` - Role-based access control
- `pf:ontology:value-proposition-v1` - Value proposition definitions

## Files in This Package

| File | Description |
|------|-------------|
| `org-ontology-v1.0.0.json` | Main ontology definition (JSON-LD) |
| `registry-entry-v3.0.0.json` | Registry v3.0 compliant entry |
| `glossary-v1.0.0.json` | Term definitions (JSON) |
| `glossary-v1.0.0.md` | Term definitions (Markdown) |
| `test-data-v1.0.0.json` | Test data (60-20-10-10 distribution) |
| `validation-report-v1.0.0.md` | 5-gate validation results |
| `README.md` | This file |
| `CHANGELOG.md` | Version history |

## Usage Example

```json
{
  "@type": "pf:Organization",
  "@id": "org:foot-scientific",
  "organizationId": "org:foot-scientific",
  "name": "Foot Scientific",
  "legalName": "Foot Scientific, LLC",
  "type": "Client",
  "industry": "Healthcare",
  "size": "SME (51-250)",
  "domain": "https://footscientific.com",
  "platformRelationships": [
    {"type": "client", "tier": "direct", "status": "active"},
    {"type": "affiliate", "status": "active"}
  ]
}
```

## Business Rules

| Rule ID | Description |
|---------|-------------|
| BR-ORG-001 | Organizations can have multiple platform relationships |
| BR-ORG-002 | Agency-managed clients must specify `managedBy` |
| BR-ORG-003 | Organization IDs must be unique |

## Quality Metrics

| Metric | Score |
|--------|-------|
| Completeness | 100% |
| Competency | 100% |
| Schema.org Alignment | 85% |
| Test Coverage | 100% |
| **Confidence Score** | **0.87** |

## Related Documentation

- [Org Context Ontology](../pfc-ont-org-context/) - Rich organizational context
- [RBAC Ontology](../pfc-ont-rbac/) - Role-based access control
- [Platform Framework Architecture](../../docs/PLATFORM_ARCHITECTURE.md)

## Change Control

This ontology is a **change-controlled artifact**. Changes require:
1. Impact assessment
2. Peer review
3. Approval from ontology governance

**Change Control ID:** CC-ORG-001

---

**Maintained by:** BAIV Platform Team  
**Contact:** ontology@baiv.co.uk
