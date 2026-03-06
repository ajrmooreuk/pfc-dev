# ORG-MAT-ONT (Organization Maturity) - OAA v5.0.0 Compliant

**Current Version:** 1.0.0
**OAA Schema Version:** 5.0.0
**Status:** Production

## Overview

Comprehensive ontology for assessing organizational maturity across multiple dimensions. Provides structured assessment framework covering size, sector, geography, technology, marketing, digital transformation, data, process, talent, innovation, governance, security, sustainability, and ecosystem maturity.

## Bridge Pattern Architecture

ORG-MAT-ONT connects to ORG-ONT via OrganizationContext:

```
ORG-ONT                              ORG-MAT-ONT
┌─────────────────┐                  ┌────────────────────────────────────┐
│   Organization  │                  │         MaturityProfile            │
│        │        │                  │              │                     │
│   hasContext    │                  │   ┌─────────┼─────────┐            │
│        ▼        │                  │   │         │         │            │
│ OrganizationContext ──────────────►│   ▼         ▼         ▼            │
│                 │ hasMaturityProfile│ SizeProfile DimensionScore ...    │
└─────────────────┘                  │              │                     │
                                     │   ┌─────────┴─────────────┐        │
                                     │   │ 19 Maturity Dimensions │        │
                                     │   └───────────────────────┘        │
                                     └────────────────────────────────────┘
```

## Files

| File | Version | Format | Description |
|------|---------|--------|-------------|
| `org-maturity-v1.0.0-oaa-v5.json` | 1.0.0 | OAA v5.0.0 JSON-LD | Current production ontology |

## Maturity Dimensions

### Core Context Profiles

| Entity | Description |
|--------|-------------|
| MaturityProfile | Container for all dimension scores and profiles |
| DimensionScore | Generic scored dimension with level (1-5) and evidence |
| SizeProfile | Employee count, revenue bands, scale |
| ValueProfile | Valuation, funding stage, market cap |
| SectorProfile | Industry vertical, regulatory environment |
| GeographyProfile | HQ, operating countries, market reach |
| OrgStructureProfile | Structure type, complexity, decision style |

### Capability Maturity Dimensions

| Entity | Description | Connects To |
|--------|-------------|-------------|
| MarketingMaturity | Marketing capability, digital, brand, analytics | - |
| TechAIMaturity | Cloud, AI, automation, tech stack modernity | - |
| DigitalMaturity | Digital transformation, channels, experience | - |
| DataMaturity | Governance, quality, analytics, literacy | - |
| ProcessMaturity | Documentation, automation, metrics, BPM | PE-ONT |
| CustomerExperienceMaturity | VoC, journey mapping, personalization, NPS | CE-ONT |
| TalentMaturity | Skills, learning culture, leadership, engagement | - |
| InnovationMaturity | R&D, culture, ideation, patents, TTM | - |
| GovernanceMaturity | Board, compliance, risk, audit, transparency | - |
| SecurityRiskMaturity | Framework, incident response, certifications | - |
| SustainabilityESG | Environmental, social, governance, carbon | - |
| PartnershipEcosystem | Network, role, integration, APIs | - |
| ChangeReadiness | Agility, transformation history, adaptation | - |

## Maturity Levels

All dimensions use a consistent 5-level scale:

| Level | Name | Score Range | Description |
|-------|------|-------------|-------------|
| 1 | Initial | 1.0-1.9 | Ad-hoc, unpredictable processes |
| 2 | Developing | 2.0-2.9 | Basic practices emerging |
| 3 | Defined | 3.0-3.9 | Standardized, documented processes |
| 4 | Managed | 4.0-4.9 | Measured, controlled, optimizing |
| 5 | Optimized | 5.0 | Continuous improvement, industry-leading |

## Key Relationships

| Relationship | Domain | Range | Description |
|--------------|--------|-------|-------------|
| hasMaturityProfile | org:OrganizationContext | MaturityProfile | Bridge from ORG-ONT |
| hasDimensionScore | MaturityProfile | DimensionScore | Generic dimension scores |
| hasSizeProfile | MaturityProfile | SizeProfile | Size classification |
| hasSectorProfile | MaturityProfile | SectorProfile | Industry classification |
| hasGeographyProfile | MaturityProfile | GeographyProfile | Geographic scope |
| hasTechAIMaturity | MaturityProfile | TechAIMaturity | Tech/AI maturity |
| hasDigitalMaturity | MaturityProfile | DigitalMaturity | Digital transformation |
| hasDataMaturity | MaturityProfile | DataMaturity | Data capability |
| previousProfile | MaturityProfile | MaturityProfile | Trend tracking |

## Join Patterns

| Pattern | Path | Use Case |
|---------|------|----------|
| JP-MAT-001 | OrganizationContext → hasMaturityProfile → MaturityProfile | Connect org to maturity |
| JP-MAT-002 | MaturityProfile → hasDimensionScore → DimensionScore | Access all scores |

## Dependencies

- **ORG-ONT** v2.1.0+ - OrganizationContext (required)

## Future Cross-Ontology Integration

- **PE-ONT**: ProcessMaturity aligns with process engineering concepts
- **CE-ONT**: CustomerExperienceMaturity connects to CX ontology (when created)
- **VSOM-ONT**: Maturity informs strategic objectives and metrics

## Business Rules

| Rule | Severity | Description |
|------|----------|-------------|
| BR-MAT-001 | Error | Profile must have at least one dimension score |
| BR-MAT-002 | Error | Numeric scores must be 1.0-5.0 |
| BR-MAT-003 | Error | Weights must be 0.0-1.0 |
| BR-MAT-004 | Error | Assessment date required |
| BR-MAT-005 | Warning | Level should align with score range |
| BR-MAT-006 | Info | Include core dimensions for comprehensive assessment |
| BR-MAT-007 | Warning | High scores (4+) should have evidence |
| BR-MAT-008 | Error | NPS must be -100 to 100 |

## Use Cases

1. **Organizational Assessment**: Complete maturity snapshot across all dimensions
2. **Gap Analysis**: Identify maturity gaps relative to targets or competitors
3. **Transformation Planning**: Prioritize initiatives based on current maturity
4. **Trend Analysis**: Track maturity changes over time via previousProfile
5. **Benchmarking**: Compare maturity across organizations in same sector/size

## Validation

Load in [Ontology Visualiser](https://ajrmooreuk.github.io/Azlan-EA-AAA/) to verify OAA v5.0.0 compliance.

## Change History

| Version | Date | Change |
|---------|------|--------|
| 1.0.0 | 2026-02-01 | Initial creation with 19 maturity dimensions |

## Migration Notes

- Moved from `/PBS/ONTOLOGIES/pfc-ontologies/ORG-MAT-ONT/` to `ORG-CONTEXT/ORG-MAT-ONT/` on Feb 2026
- Now part of ORG-CONTEXT hub for consolidated organization context routing
- Core ontology v1.0.0 unchanged

---

*Part of ORG-CONTEXT | OAA Ontology Workbench*
