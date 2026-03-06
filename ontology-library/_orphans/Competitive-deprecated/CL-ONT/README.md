# CL-ONT (Competitive Landscape) - OAA v5.0.0 Compliant

**Current Version:** 1.0.0
**OAA Schema Version:** 5.0.0
**Status:** Production

## Overview

Competitive Landscape ontology providing organizational context for competitive environment analysis. Uses the **OrganizationContext bridge pattern** to connect to ORG-ONT, enabling clean separation between core organization entities and domain-specific context.

## Bridge Pattern Architecture

```
ORG-ONT                          CL-ONT
┌─────────────────┐              ┌─────────────────────────┐
│   Organization  │              │  CompetitiveLandscape   │
│        │        │              │           │             │
│        ▼        │              │           ├── MarketSegment
│ OrganizationContext ◄─────────►│           ├── CompetitorProfile
│                 │   bridge     │           ├── MarketDynamic
└─────────────────┘              │           ├── CompetitiveAdvantage
                                 │           └── StrategicOpportunity
                                 └─────────────────────────┘
```

**Why Bridge Pattern:**
- Keeps ORG-ONT clean as foundational entity
- OrganizationContext becomes hub for all contextual ontologies
- Same pattern applies to VSOM (strategic context), EA (transformation context)
- Enables modular composition of organization graphs

## Files

| File | Version | Format | Description |
|------|---------|--------|-------------|
| `competitive-landscape-v1.0.0-oaa-v5.json` | 1.0.0 | OAA v5.0.0 JSON-LD | Core CL ontology |

## Entities

| Entity | Schema.org Base | Description |
|--------|-----------------|-------------|
| CompetitiveLandscape | Intangible | Competitive environment context for an organization |
| MarketSegment | Intangible | Distinct segment with specific dynamics |
| CompetitorProfile | Intangible | Profile referencing ORG-ONT Organization |
| MarketDynamic | Intangible | Trend/force shaping the landscape |
| CompetitiveAdvantage | Intangible | Held or sought competitive advantage |
| StrategicOpportunity | Intangible | Identified opportunity (incl. blue ocean) |

## Hierarchy

```
org:Organization (ORG-ONT)
    └── org:hasContext → org:OrganizationContext (ORG-ONT)
                              └── cl:hasCompetitiveLandscape → CompetitiveLandscape
                                                                  ├── hasSegment → MarketSegment
                                                                  ├── hasCompetitorProfile → CompetitorProfile
                                                                  │                              └── competitorOperatesIn → MarketSegment
                                                                  ├── hasMarketDynamic → MarketDynamic
                                                                  │                          └── dynamicImpactsSegment → MarketSegment
                                                                  ├── hasAdvantage → CompetitiveAdvantage
                                                                  │                      └── advantageCounters → CompetitorProfile
                                                                  └── hasOpportunity → StrategicOpportunity
                                                                                            └── opportunityInSegment → MarketSegment
```

## Cross-Ontology Join Patterns

CL-ONT is designed for composition with other ontologies:

### JP-CL-001: Org-Context-Landscape Join
```
org:Organization → org:hasContext → org:OrganizationContext → cl:hasCompetitiveLandscape → cl:CompetitiveLandscape
```
**Use Case:** Full organizational competitive context for PFI instance

### JP-CL-002: Landscape-Analysis Join
```
cl:CompetitiveLandscape → cl:informsAnalysis → ca:CompetitiveAnalysis
```
**Use Case:** Competitive analysis grounded in landscape context (CA-ONT)

### JP-CL-003: Strategic-Landscape Join
```
cl:CompetitiveLandscape → cl:alignsToStrategy → vsom:Strategy
```
**Use Case:** Strategy-driven competitive positioning (VSOM-ONT)

## Key Relationships

| Relationship | Domain | Range | Cardinality |
|--------------|--------|-------|-------------|
| hasCompetitiveLandscape | OrganizationContext | CompetitiveLandscape | 0..1 |
| landscapeBelongsToContext | CompetitiveLandscape | OrganizationContext | 1..1 |
| hasSegment | CompetitiveLandscape | MarketSegment | 1..* |
| hasCompetitorProfile | CompetitiveLandscape | CompetitorProfile | 1..* |
| competitorOperatesIn | CompetitorProfile | MarketSegment | 1..* |
| informsAnalysis | CompetitiveLandscape | ca:CompetitiveAnalysis | 0..* |
| alignsToStrategy | CompetitiveLandscape | vsom:Strategy | 0..1 |

## Business Rules

| Rule | Severity | Description |
|------|----------|-------------|
| BR-CL-001 | error | Landscape MUST have landscapeBelongsToContext to OrganizationContext |
| BR-CL-002 | error | Landscape MUST have at least one segment |
| BR-CL-003 | warning | Landscape SHOULD have at least 3 competitor profiles |
| BR-CL-004 | error | CompetitorProfile MUST reference valid org:Organization |
| BR-CL-005 | error | CompetitorProfile MUST operate in at least one segment |
| BR-CL-006 | error | Blue-Ocean opportunity MUST have low/no barriers |
| BR-CL-007 | warning | High-threat competitors SHOULD have strategic intent documented |
| BR-CL-008 | warning | Landscapes older than 12 months SHOULD be reassessed |

## Dependencies

- **ORG-ONT** v2.1.0+ - Organization, OrganizationContext entities (required)
- **CA-ONT** v2.0.0+ - CompetitiveAnalysis entity (optional join)
- **VSOM-ONT** v2.0.0+ - Strategy entity (optional join)

## Composing Organization Graphs

### PF-Core Graph (Template)
Generic competitive landscape template for any organization:
```json
{
  "imports": ["ORG-ONT", "CL-ONT"],
  "rootEntity": "org:Organization",
  "contextEntities": ["cl:CompetitiveLandscape"]
}
```

### PFI Instance Graph (Example: BAIV)
Specific organization with full competitive context:
```json
{
  "imports": ["ORG-ONT", "CL-ONT", "CA-ONT", "VSOM-ONT"],
  "rootEntity": "org:Organization",
  "contextEntities": ["cl:CompetitiveLandscape", "ca:CompetitiveAnalysis"],
  "joins": ["JP-CL-001", "JP-CL-002", "JP-CL-003"]
}
```

## Validation

Load in [Ontology Visualiser](https://ajrmooreuk.github.io/Azlan-EA-AAA/) to verify OAA v5.0.0 compliance.

## Change History

| Version | Date | Change |
|---------|------|--------|
| 1.0.0 | 2026-02-01 | Initial creation with OrganizationContext bridge pattern |

---

*Part of PFC Ontologies | OAA Ontology Workbench*
