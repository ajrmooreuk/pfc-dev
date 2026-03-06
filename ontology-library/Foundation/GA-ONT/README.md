# GA-ONT (Gap Analysis) - OAA v5.0.0 Compliant

**Current Version:** 1.0.0
**OAA Schema Version:** 5.0.0
**Status:** Production

## Overview

Comprehensive ontology for comparative gap analysis supporting the CGA (Comparative Gap Analysis) Agent. Models gaps, threats, opportunities, recommendations, and priority matrices with full cross-ontology integration.

Based on the CGA Agent PRD v1.0.0 specification.

## Bridge Pattern Architecture

GA-ONT connects to ORG-ONT via OrganizationContext:

```
ORG-ONT                              GA-ONT
┌─────────────────┐                  ┌────────────────────────────────────┐
│   Organization  │                  │      GapAnalysisReport             │
│        │        │                  │              │                     │
│   hasContext    │                  │   ┌─────────┼─────────┐            │
│        ▼        │                  │   │         │         │            │
│ OrganizationContext ──────────────►│   ▼         ▼         ▼            │
│                 │ hasGapAnalysis   │ Gaps    Threats  Opportunities    │
└─────────────────┘                  │              │                     │
                                     │         PriorityMatrix             │
                                     │              │                     │
                                     │      Recommendations               │
                                     └────────────────────────────────────┘
```

## Files

| File | Version | Format | Description |
|------|---------|--------|-------------|
| `gap-analysis-v1.0.0-oaa-v5.json` | 1.0.0 | OAA v5.0.0 JSON-LD | Current production ontology |

## Core Entities

### Analysis Container

| Entity | Description |
|--------|-------------|
| GapAnalysisReport | Complete analysis container with session, scope, and findings |
| ExecutiveSummary | High-level summary of findings and recommendations |

### Gap Identification

| Entity | Description |
|--------|-------------|
| IdentifiedGap | Core gap with type, severity, confidence (0-1) |
| StructuralHole | Disconnected cluster in knowledge graph (extends IdentifiedGap) |
| GapEvidence | Supporting evidence with source, metric, value |
| BusinessImpact | Revenue/competitive/opportunity risk assessment |
| BridgeConcept | Concept that could connect disconnected areas |

### Gap Types

| Type | Description |
|------|-------------|
| `structural_hole` | Disconnected knowledge clusters |
| `capability` | Missing organizational capability |
| `content` | Content coverage gaps |
| `competitive` | Competitor advantage gaps |
| `market` | Market positioning gaps |
| `technology` | Tech/AI capability gaps |

### Threat & Opportunity

| Entity | Description |
|--------|-------------|
| ThreatAssessment | Threat with probability, impact, riskScore (prob × impact) |
| MitigationOption | Potential mitigation strategy with effort/effectiveness |
| OpportunityAssessment | Opportunity with feasibility, time to value |
| PotentialValue | Estimated revenue/market/competitive value |

### Prioritization

| Entity | Description |
|--------|-------------|
| PriorityMatrix | Impact/effort matrix with configurable dimension weights |
| PriorityQuadrant | Quadrant: Quick Wins, Major Projects, Fill-Ins, Hard Slogs |
| RankedItem | Item with rank, composite score, rationale |

### Priority Matrix Quadrants

| Quadrant | Impact | Effort | Description |
|----------|--------|--------|-------------|
| **Quick Wins** | High | Low | Do first |
| **Major Projects** | High | High | Plan carefully |
| **Fill-Ins** | Low | Low | Do when time permits |
| **Hard Slogs** | Low | High | Consider dropping |

### Recommendations

| Entity | Description |
|--------|-------------|
| Recommendation | Actionable recommendation with priority and action type |
| ImplementationPhase | Phased implementation plan with deliverables |
| ExpectedOutcome | Expected results with gaps closed, value created |
| OutcomeMetric | Measurement metric with baseline and target |

## Key Relationships

### Cross-Ontology (Bridge Pattern)

| Relationship | Domain | Range | Description |
|--------------|--------|-------|-------------|
| hasGapAnalysis | org:OrganizationContext | GapAnalysisReport | Bridge from ORG-ONT |
| strategicContext | GapAnalysisReport | vsom:VSOMFramework | Strategic alignment |
| analysesLandscape | GapAnalysisReport | cl:CompetitiveLandscape | Competitive context |
| alignsToObjective | Recommendation | vsom:ObjectivesComponent | Strategy linkage |
| spawnsProject | Recommendation | ppm:Project | Execution handoff |
| affectsMaturity | IdentifiedGap | mat:DimensionScore | Maturity impact |
| inSegment | OpportunityAssessment | cl:MarketSegment | Market targeting |
| involvedCompetitor | ThreatAssessment | cl:CompetitorProfile | Competitor link |

### Internal Relationships

| Relationship | Domain | Range |
|--------------|--------|-------|
| identifiesGap | GapAnalysisReport | IdentifiedGap |
| hasEvidence | IdentifiedGap | GapEvidence |
| hasBridgeConcept | StructuralHole | BridgeConcept |
| identifiesThreat | GapAnalysisReport | ThreatAssessment |
| identifiesOpportunity | GapAnalysisReport | OpportunityAssessment |
| hasPriorityMatrix | GapAnalysisReport | PriorityMatrix |
| hasRecommendation | GapAnalysisReport | Recommendation |
| addressesGap | Recommendation | IdentifiedGap |
| addressesThreat | Recommendation | ThreatAssessment |
| enablesOpportunity | Recommendation | OpportunityAssessment |

## Join Patterns

| Pattern | Path | Use Case |
|---------|------|----------|
| JP-GA-001 | OrganizationContext → hasGapAnalysis → GapAnalysisReport | Connect org to gap analysis |
| JP-GA-002 | GapAnalysisReport → strategicContext → VSOMFramework | Strategic alignment |
| JP-GA-003 | GapAnalysisReport → analysesLandscape → CompetitiveLandscape | Competitive grounding |
| JP-GA-004 | IdentifiedGap → affectsMaturity → DimensionScore | Maturity impact |
| JP-GA-005 | Recommendation → spawnsProject → Project | Execution handoff |

## Dependencies

- **ORG-ONT** v2.1.0+ - OrganizationContext (required)
- **VSOM-ONT** v2.1.0+ - Strategic alignment (required)
- **CL-ONT** v1.0.0+ - Competitive context (recommended)
- **ORG-MAT-ONT** v1.0.0+ - Maturity dimensions (optional)
- **PPM-ONT** v3.0.0+ - Project execution (optional)

## Business Rules

| Rule | Severity | Description |
|------|----------|-------------|
| BR-GA-001 | Error | Gap must have at least one evidence source |
| BR-GA-002 | Error | Threat riskScore = probability × impact |
| BR-GA-003 | Warning | Confidence < 0.6 requires human review |
| BR-GA-004 | Error | Recommendation must link to gaps/threats/opportunities |
| BR-GA-005 | Error | Comparative analysis requires at least 3 entities |
| BR-GA-006 | Error | Priority matrix weights must sum to 1.0 |
| BR-GA-007 | Warning | High priority recommendations should have strategic alignment |
| BR-GA-008 | Error | Executive summary must have findings and next steps |

## CGA Agent Integration

This ontology supports the CGA (Comparative Gap Analysis) Agent skills:

| Skill | GA-ONT Entities Used |
|-------|---------------------|
| `cga:structural-hole-detector` | StructuralHole, BridgeConcept |
| `cga:threat-analyzer` | ThreatAssessment, MitigationOption |
| `cga:opportunity-identifier` | OpportunityAssessment, PotentialValue |
| `cga:bridge-concept-finder` | BridgeConcept |
| `cga:priority-matrix-builder` | PriorityMatrix, PriorityQuadrant, RankedItem |
| `cga:comparative-scorer` | RankedItem |

## Use Cases

1. **AI Visibility Gap Analysis**: Identify content and citation gaps for BAIV
2. **Competitive Threat Assessment**: Map competitor advantages and threats
3. **Capability Gap Mapping**: Identify missing organizational capabilities
4. **Strategic Opportunity Discovery**: Find market opportunities from gaps
5. **Prioritized Roadmap Generation**: Create action plans from recommendations

## Validation

Load in [Ontology Visualiser](https://ajrmooreuk.github.io/Azlan-EA-AAA/) to verify OAA v5.0.0 compliance.

## Change History

| Version | Date | Change |
|---------|------|--------|
| 1.0.0 | 2026-02-01 | Initial creation based on CGA Agent PRD v1.0.0. 18 entities, 26 relationships, 8 business rules. |

---

*Part of PFC Ontologies | OAA Ontology Workbench*
