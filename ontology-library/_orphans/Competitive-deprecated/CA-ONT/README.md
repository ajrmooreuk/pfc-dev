# CA Ontology (Competitive Analysis) - OAA v5.0.0 Compliant

**Current Version:** 2.1.0
**OAA Schema Version:** 5.0.0
**Status:** Production

## Overview

Generalized ontology for analyzing competitors across any market domain. References ORG-ONT for organization entities and CL-ONT for competitive landscape context. Enables AI agents to reason about competitive positioning, market opportunities, and strategic intelligence.

## Cross-Ontology Integration

CA-ONT integrates with other ontologies via references rather than duplicating entities:

```
ORG-ONT                          CA-ONT                           CL-ONT
┌─────────────────┐              ┌─────────────────────────┐      ┌─────────────────┐
│  Organization   │◄─────────────│  CompetitiveAnalysis    │      │ CompetitiveLandscape │
│                 │ targetOrgRef │    ├── targetOrgRef ────┼──────│                 │
│                 │              │    ├── analysisUsesLandscape ──►│                 │
│                 │              │                         │      │                 │
│                 │◄─────────────│  CompetitorAssessment   │      │  MarketSegment  │
│                 │competitorOrgRef   ├── competitorOrgRef │      │        ▲        │
│                 │              │                         │      │        │        │
│                 │◄─────────────│  CompetitivePosition    │      │        │        │
│                 │ organizationRef   ├── organizationRef  │      │        │        │
│                 │              │                         │      │        │        │
│                 │              │  MarketOffering ────────┼──────┼────────┘        │
│                 │              │    └── offeringTargetsSegment  │                 │
└─────────────────┘              └─────────────────────────┘      └─────────────────┘
```

## Files

| File | Version | Format | Description |
|------|---------|--------|-------------|
| `competitive-analysis-v2.1.0-oaa-v5.json` | 2.1.0 | OAA v5.0.0 JSON-LD | Current production ontology |
| `archive/competitive-analysis-v2.0.0-oaa-v5.json` | 2.0.0 | OAA v5.0.0 JSON-LD | Previous version |
| `archive/competitive-analysis-v1.0.0-legacy.json` | 1.0.0 | Legacy format | Archived pre-OAA format |

## Entities

| Entity | Schema.org Base | Description |
|--------|-----------------|-------------|
| CompetitiveAnalysis | CreativeWork | Analysis report with targetOrgRef to ORG-ONT |
| CompetitorAssessment | Intangible | Assessment of specific competitor (competitorOrgRef to ORG-ONT) |
| MarketOffering | Product | Products/services in market |
| CompetitivePosition | Intangible | Market positioning (organizationRef to ORG-ONT) |
| BlueOceanOpportunity | Intangible | Untapped market opportunities |

## Key Relationships

| Relationship | Domain | Range | Cross-Ontology |
|--------------|--------|-------|----------------|
| analysisUsesLandscape | CompetitiveAnalysis | cl:CompetitiveLandscape | Yes (CL-ONT) |
| hasCompetitorAssessment | CompetitiveAnalysis | CompetitorAssessment | No |
| hasCompetitivePosition | CompetitiveAnalysis | CompetitivePosition | No |
| identifiesOpportunity | CompetitiveAnalysis | BlueOceanOpportunity | No |
| assessmentOfOffering | CompetitorAssessment | MarketOffering | No |
| offeringTargetsSegment | MarketOffering | cl:MarketSegment | Yes (CL-ONT) |
| opportunityInSegment | BlueOceanOpportunity | cl:MarketSegment | Yes (CL-ONT) |

## Join Patterns

| Pattern | Path | Use Case |
|---------|------|----------|
| JP-CA-001 | CompetitiveAnalysis → analysisUsesLandscape → cl:CompetitiveLandscape | Ground analysis in landscape context |
| JP-CA-002 | cl:CompetitiveLandscape → informsAnalysis → CompetitiveAnalysis | Landscape informs analysis (inverse) |

## Dependencies

- **ORG-ONT** v2.1.0+ - Organization entity references (required)
- **CL-ONT** v1.0.0+ - CompetitiveLandscape, MarketSegment (optional but recommended)

## Business Rules

| Rule | Severity | Description |
|------|----------|-------------|
| BR-CA-001 | Warning | Analysis must have at least 3 competitor assessments |
| BR-CA-002 | Error | Blue ocean opportunities require low/no barriers |
| BR-CA-003 | Error | Direct competitors must have threat level assigned |
| BR-CA-004 | Error | Analysis must reference target organization (ORG-ONT) |
| BR-CA-005 | Error | Competitive positions must reference organization |
| BR-CA-006 | Info | Analyses should use landscape context from CL-ONT |

## Validation

Load in [Ontology Visualiser](https://ajrmooreuk.github.io/Azlan-EA-AAA/) to verify OAA v5.0.0 compliance.

## Change History

| Version | Date | Change |
|---------|------|--------|
| 2.1.0 | 2026-02-01 | Integrated with ORG-ONT and CL-ONT. Removed duplicate organization entities. Added CompetitorAssessment. Added cross-ontology relationships. |
| 2.0.0 | 2026-02-01 | Upgraded to OAA v5.0.0 JSON-LD format |
| 1.0.0 | 2025-10-08 | Initial creation in legacy format |

---

*Part of PFC Ontologies | OAA Ontology Workbench*
