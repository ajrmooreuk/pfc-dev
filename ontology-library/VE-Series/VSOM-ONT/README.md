# VE-VSOM-ONT (Value Engineering for VSOM)

**Status:** In Development
**Order in Series:** 1 of 5
**Dependencies:** ORG-Context, VSOM-ONT v2.1.0

## Overview

Value engineering applied to Vision-Strategy-Objectives-Metrics framework. First ontology in the VE series, providing the foundation for strategic value analysis. This folder contains the base VSOM-ONT content (v2.1.0 production) plus VE extension definitions.

**Core Principle:** Business Impact is the Driver, Outcomes the Goal, and Value the Measure.

## Base VSOM-ONT Content (Migrated)

The following files were migrated from the standalone vsom-ont folder:

| File | Description |
|------|-------------|
| `vsom-ontology-v2.1.0-oaa-v5.json` | Production VSOM ontology (OAA v5.0.0) |
| `vsom-ontology-v2.0.0-oaa-v5.json` | Previous VSOM version |
| `PFC-OAA-VE-ONT1-VSOM-definition.jsonld` | VE extension definition (JSON-LD) |
| `PFC-OAA-VE-ONT1-VSOM-README.md` | VE-VSOM documentation |
| `w4m_vsom_visual_guide_v1.0.md` | Visual guide |
| `archive/` | Legacy versions |

---

## VSOM Ontology Details

## Bridge Pattern Architecture

VSOM connects to ORG-ONT via OrganizationContext (not directly to Organization):

```
ORG-ONT                                VSOM-ONT
┌─────────────────┐                    ┌─────────────────────────────┐
│   Organization  │                    │      VSOMFramework          │
│        │        │                    │           │                 │
│   hasContext    │                    │           ├── VisionComponent
│        ▼        │                    │           ├── StrategyComponent ◄──┐
│ OrganizationContext ───────────────► │           ├── ObjectivesComponent  │
│                 │  hasStrategicContext│          └── MetricsComponent     │
└─────────────────┘                    │                                    │
                                       │      StrategicReviewCycle ─────────┘
                                       │           │              (iteration)
                                       │           ▼
                                       │    reviewsLandscape → CL-ONT
                                       └─────────────────────────────┘
```

## Files

| File | Version | Format | Description |
|------|---------|--------|-------------|
| `vsom-ontology-v2.1.0-oaa-v5.json` | 2.1.0 | OAA v5.0.0 JSON-LD | Current production ontology |
| `archive/vsom-ontology-v2.0.0-oaa-v5.json` | 2.0.0 | OAA v5.0.0 JSON-LD | Previous version |
| `archive/vsom-ontology-v1.0.0-legacy.json` | 1.0.0 | W4M Legacy format | Archived pre-OAA format |

## Entities

| Entity | Schema.org Base | Description |
|--------|-----------------|-------------|
| VSOMFramework | Intangible | Complete V-S-O-M framework (references org:Organization) |
| VisionComponent | Thing | Long-term aspirational direction (3-10 years) |
| StrategyComponent | Action | Multi-layer strategic approach (1-3 years) |
| ObjectivesComponent | Thing | SMART goals (quarterly/annual) |
| MetricsComponent | PropertyValue | KPIs and performance indicators |
| **StrategicReviewCycle** | Event | **NEW** - Iteration hub linking CL-ONT to strategy updates |
| Market | Place | Vertical/horizontal market classification |
| BusinessModel | CreativeWork | Business model patterns |
| BusinessImpact | Thing | Driver - business effects |
| Outcome | Thing | Goal - desired end states |
| ValueMeasure | PropertyValue | Measure - value delivered |

## Strategic Iteration Pattern

StrategicReviewCycle enables feedback from competitive landscape to strategy:

```
Competitive Landscape (CL-ONT)
        │
        │ Market dynamics, competitor moves, opportunities
        ▼
StrategicReviewCycle ────────────────────────────┐
        │                                         │
        │ reviewsLandscape                        │ informsStrategy
        │ triggeredBy: Scheduled | MetricBreach   │ producesUpdatedStrategy
        │            | MarketEvent | CompetitorAction
        ▼                                         ▼
Vision → Strategy (v1) → Objectives → Metrics → Strategy (v2)
         └──────────────────────────────────────────┘
                        (cascade + feedback)
```

## Cross-Ontology Join Patterns

| Pattern | Path | Use Case |
|---------|------|----------|
| JP-VSOM-001 | Org→Context→VSOM | Full organizational strategic context |
| JP-VSOM-002 | ReviewCycle→Landscape | Competitive feedback informs strategy |
| JP-VSOM-003 | Metric→ReviewCycle | Performance-driven strategy iteration |

## Key Relationships

| Relationship | Domain | Range | Description |
|--------------|--------|-------|-------------|
| hasStrategicContext | OrganizationContext | VSOMFramework | Bridge from ORG-ONT |
| hasVision | VSOMFramework | VisionComponent | Framework cascade |
| hasStrategy | VSOMFramework | StrategyComponent | Framework cascade |
| hasReviewCycle | VSOMFramework | StrategicReviewCycle | Iteration tracking |
| reviewsLandscape | StrategicReviewCycle | cl:CompetitiveLandscape | Cross-ontology to CL-ONT |
| informsStrategy | StrategicReviewCycle | StrategyComponent | Review informs strategy |
| producesUpdatedStrategy | StrategicReviewCycle | StrategyComponent | New strategy version |
| triggeredByMetric | StrategicReviewCycle | MetricsComponent | Metric breach trigger |
| derivesFromVision | StrategyComponent | VisionComponent | Strategy derives from vision |
| alignedToStrategy | ObjectivesComponent | StrategyComponent | Objective alignment |
| trackedByMetric | ObjectivesComponent | MetricsComponent | Objective tracking |

## Dependencies

- **ORG-ONT** v2.1.0+ - Organization, OrganizationContext (required)
- **CL-ONT** v1.0.0+ - CompetitiveLandscape (for iteration)

## Strategy Types

- Corporate
- Marketing
- Operational
- Digital
- AIVisibility
- Growth
- Innovation

## Validation

Load in [Ontology Visualiser](https://ajrmooreuk.github.io/Azlan-EA-AAA/) to verify OAA v5.0.0 compliance.

## Change History

| Version | Date | Change |
|---------|------|--------|
| 2.1.0 | 2026-02-01 | Added StrategicReviewCycle, OrganizationContext bridge, CL-ONT integration, removed duplicate Organization entity |
| 2.0.0 | 2026-02-01 | Upgraded to OAA v5.0.0 JSON-LD format |
| 1.0.0 | 2025-11-14 | Initial W4M VSOM ontology |

## Migration Notes

- VSOM-ONT content moved from `/PBS/ONTOLOGIES/pfc-ontologies/vsom-ont/` on Feb 2026
- Contains production VSOM v2.1.0 ontology plus VE extension definitions
- VE extension (`ve-vsom-v1.0.0-oaa-v5.json`) planned to add value engineering entities
- Cascades value to VE-OKR-ONT

---

*Part of VE-Series-ONT | OAA Ontology Workbench*
