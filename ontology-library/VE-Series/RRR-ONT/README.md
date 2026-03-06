# VE-RRR-ONT (Value Engineering for Roles, RACI, RBAC)

**Status:** In Development
**Order in Series:** 6 of 6
**Dependencies:** ORG-Context, ORG-ONT

## Overview

Value engineering for Roles, RACI (Responsible, Accountable, Consulted, Informed), and RBAC (Role-Based Access Control). This ontology provides the foundation for organizational role structures and access control patterns. Supports value analysis of role assignments and responsibility matrices.

## Base RRR-ONT Content (Migrated)

The following files were migrated from the standalone rrr-ont folder:

| File | Description |
|------|-------------|
| `pf-roles-raci-rbac-ontology-v3.0.0.jsonld` | RRR ontology v3.0.0 (JSON-LD) |
| `pf-roles-raci-rbac-glossary-v3.0.0.json` | RRR terminology glossary |
| `README-ROLES-RACI-RBAC-v3.0.0.md` | Original RRR-ONT documentation |
| `RRR_RACI_RBAC_Ontology_Visual_Guide.md` | Visual guide |

## Core Concepts

### Roles
- Role definitions and hierarchies
- Role assignments to individuals/teams
- Role-based value contribution

### RACI Matrix
- Responsibility assignments
- Accountability mapping
- Consultation patterns
- Information flow

### RBAC
- Permission structures
- Access control policies
- Role inheritance

## Planned VE Entities

| Entity | Description |
|--------|-------------|
| RoleValueScore | Value contribution score per role |
| RACIValueImpact | Value impact of RACI assignments |
| AccessValueCost | Cost/value of access permissions |
| ResponsibilityValueWeight | Value weighting of responsibilities |

## Key Relationships

| Relationship | Range | Description |
|--------------|-------|-------------|
| engineersRoles | rrr:Role | Main bridge to base RRR content |
| assignsResponsibility | rrr:RACIAssignment | RACI assignment connection |
| definesAccess | rrr:Permission | RBAC permission definition |

## Prerequisites

- ORG-ONT must be created first

## Files

| File | Version | Status |
|------|---------|--------|
| `pf-roles-raci-rbac-ontology-v3.0.0.jsonld` | 3.0.0 | Base (migrated) |
| `ve-rrr-v1.0.0-oaa-v5.json` | 1.0.0 | Planned (VE extension) |

## Migration Notes

- RRR-ONT content moved from `/PBS/ONTOLOGIES/pfc-ontologies/rrr-ont/` on Feb 2026
- Base ontology in JSON-LD format to be converted to OAA v5 JSON schema
- VE extension will add value engineering entities and relationships
- Connects organizational structure to value analysis

---

*Part of VE-Series-ONT | OAA Ontology Workbench*
