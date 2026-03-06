# VE-OKR-ONT (Value Engineering for OKR)

**Status:** In Development
**Order in Series:** 2 of 5
**Dependencies:** ORG-Context, VE-VSOM-ONT

## Overview

Value engineering for Objectives and Key Results. Receives value cascade from VE-VSOM and refines it to the OKR level. This folder now contains the base OKR-ONT content which serves as the foundation for value engineering extensions.

## Base OKR-ONT Content (Migrated)

The following files were migrated from the standalone OKR-ONT folder:

| File | Description |
|------|-------------|
| `PFC-ONT-OKR-v1_0_0.jsonld` | Base OKR ontology (JSON-LD format) |
| `PFC-ONT-OKR-documentation.md` | OKR ontology documentation |
| `PFC-ONT-OKR-glossary.json` | OKR terminology glossary |
| `PFC-ONT-OKR-README.md` | Original OKR-ONT README |

## Planned VE Entities

| Entity | Description |
|--------|-------------|
| OKRValueScore | Composite value score for OKRs |
| KeyResultValueDriver | Value drivers per key result |
| OKRValueCascade | Value cascade through OKR hierarchy |
| ObjectiveValueWeight | Weighting of objectives by value |

## Key Relationships

| Relationship | Range | Description |
|--------------|-------|-------------|
| engineersOKRValue | okr:OKRFramework | Main bridge to base OKR content |
| receivesFrom | VE-VSOM-ONT | Receives value cascade |
| refinesTo | VE-KPI-ONT | Refines value to KPI layer |

## Prerequisites

- VE-VSOM-ONT must be created first

## Files

| File | Version | Status |
|------|---------|--------|
| `PFC-ONT-OKR-v1_0_0.jsonld` | 1.0.0 | Base (migrated) |
| `ve-okr-v1.0.0-oaa-v5.json` | 1.0.0 | Planned (VE extension) |

## Migration Notes

- OKR-ONT content moved from `/PBS/ONTOLOGIES/pfc-ontologies/OKR-ONT/` on Feb 2026
- Base ontology in JSON-LD format will be converted to OAA v5 JSON schema
- VE extension will add value engineering entities and relationships

---

*Part of VE-Series-ONT | OAA Ontology Workbench*
