# OAA v7.0.0 Architecture

**Version:** 1.0.0
**Date:** 2026-02-21
**Status:** Production
**Epics:** 21 (#270) + 42 (#608)
**Registry:** v10.0.0 | **Tests:** 1024/1024

---

## 1. Overview

OAA v7.0.0 is the **Quality Foundations** release — a backward-compatible layer adding competency questions, schema identity, and five quality gates (G20-G24) to all 41 active ontologies. The kinetic layer (action types, interfaces, agent scopes) is deferred to v8.

```mermaid
flowchart TB
    subgraph V6["OAA v6.1.0 (Semantic Layer)"]
        ENT["entities[]"]
        REL["relationships[]"]
        RULES["businessRules[]"]
        ENUM["enumerations[]"]
    end

    subgraph V7["OAA v7.0.0 (Quality Layer)"]
        SV["oaa:schemaVersion"]
        OID["oaa:ontologyId"]
        SER["oaa:series"]
        CQS["competencyQuestions[]"]
    end

    subgraph V8["OAA v8.0.0 (Kinetic Layer — planned)"]
        ACT["actionTypes[]"]
        INT["interfaces[]"]
        DP["derivedProperties[]"]
        AS["agentScopes[]"]
    end

    V6 --> V7
    V7 -.-> V8

    style V6 fill:#22c55e,color:#fff
    style V7 fill:#a855f7,color:#fff
    style V8 fill:#6b7280,color:#fff
```

---

## 2. v7 Mandatory Fields

Every v7-compliant ontology artifact MUST contain these four fields:

| Field | Type | Source | Example |
|-------|------|--------|---------|
| `oaa:schemaVersion` | string | Specification version | `"7.0.0"` |
| `oaa:ontologyId` | string | Derived from registry `@id` | `"VSOM-ONT"` |
| `oaa:series` | string | Derived from registry `layer` | `"VE-Series"` |
| `competencyQuestions` | array | 1 CQ per entity (skeleton) | `[{@id: "CQ-001", ...}]` |

### Competency Question Schema

```json
{
  "@id": "CQ-001",
  "question": "What is the role and purpose of ValueProposition within this ontology?",
  "targetEntities": ["vp:ValueProposition"],
  "targetRelationships": ["addressesProblem"],
  "targetRules": ["BR-001"]
}
```

---

## 3. Quality Gate Architecture

```mermaid
flowchart LR
    subgraph LEGACY["Pre-v7 (G1-G8)"]
        G1G4["G1-G4\nCore gates\n(mandatory)"]
        G5G8["G5-G8+\nAdvisory gates\n(recommended)"]
    end

    subgraph QUALITY["v7 Quality (G20-G24)"]
        G20["G20: Competency\nCoverage"]
        G21["G21: Semantic\nDuplication"]
        G22["G22: Cross-Ontology\nRule Enforcement"]
        G23["G23: Lineage Chain\nIntegrity"]
        G24["G24: Instance Data\nQuality"]
    end

    subgraph PLANNED["v8 Kinetic (G15-G19)"]
        G15["G15: Action Type\nIntegrity"]
        G16["G16: Interface\nResolution"]
        G17["G17: Agent Scope\nValidity"]
        G18["G18: Derived Property\nCross-Ref"]
        G19["G19: Backward\nCompatibility"]
    end

    G1G4 --> G5G8 --> G20
    G20 --> G21 --> G22 --> G23 --> G24
    G24 -.-> G15

    style G1G4 fill:#22c55e,color:#fff
    style G5G8 fill:#3b82f6,color:#fff
    style G20 fill:#a855f7,color:#fff
    style G21 fill:#a855f7,color:#fff
    style G22 fill:#a855f7,color:#fff
    style G23 fill:#a855f7,color:#fff
    style G24 fill:#a855f7,color:#fff
    style G15 fill:#6b7280,color:#fff
    style G16 fill:#6b7280,color:#fff
    style G17 fill:#6b7280,color:#fff
    style G18 fill:#6b7280,color:#fff
    style G19 fill:#6b7280,color:#fff
```

### Gate Summary

| Gate | Name | Type | Input | Severity |
|------|------|------|-------|----------|
| G20 | Competency Coverage | Quality | `competencyQuestions[]` | Warning |
| G21 | Semantic Duplication | Quality | `entities[].description` | Advisory |
| G22 | Cross-Ontology Rules | Quality | `relationships[].crossOntologyRef` | Warning |
| G23 | Lineage Chain Integrity | Quality | Lineage chain position | Warning |
| G24 | Instance Data Quality | Quality | `testInstances{}` / `testData{}` | Advisory |

All v7 gates return `skipped: true` for v6.x ontologies (backward compatible).

---

## 4. Migration Architecture

### 6-Wave Strategy

```mermaid
gantt
    title OAA v7 Migration Waves
    dateFormat YYYY-MM-DD
    axisFormat %b %d

    section Wave 1 — Hub
    EMC, VSOM, GRC-FW, ORG-CTX   :done, w1, 2026-02-21, 1d

    section Wave 2 — VE Lineage
    OKR, VP, RRR, PMF, EFS, KPI  :done, w2, after w1, 1d

    section Wave 3 — VSOM-SA/SC
    BSC, IND, RSN, MAC, PFL, NAR, CSC, CUL, VIZ :done, w3, after w2, 1d

    section Wave 4 — PE-Series
    PPM, PE, EA, EA-CORE, EA-TOGAF, EA-MSFT, DS, CICD, LSC :done, w4, after w3, 1d

    section Wave 5 — RCSG-Series
    ERM, ALZ, GDPR, PII, NCSC-CAF, DSPT, RMF :done, w5, after w4, 1d

    section Wave 6 — Foundation
    ORG, ORG-MAT, CTX, GA, CRT, ANTIQUES :done, w6, after w5, 1d
```

### Migration Tool Flow

```mermaid
flowchart TB
    REG["ont-registry-index.json\n(45 entries)"] --> SCAN["Scan entries\n(skip deprecated/placeholder)"]
    SCAN --> RESOLVE["Resolve artifact path\n(artifacts.ontology)"]
    RESOLVE --> READ["Read ontology JSON"]
    READ --> CHECK{"Already\nv7.0.0?"}
    CHECK -->|yes| SKIP["SKIP\n(no changes)"]
    CHECK -->|no| MIGRATE["Add v7 fields:\noaa:schemaVersion\noaa:ontologyId\noaa:series\ncompetencyQuestions"]
    MIGRATE --> DRY{"--apply\nflag?"}
    DRY -->|no| LOG["DRY: log what\nwould change"]
    DRY -->|yes| WRITE["Write updated\nJSON to disk"]
    WRITE --> REPORT["migration-report-v7.json"]
    LOG --> REPORT

    style MIGRATE fill:#a855f7,color:#fff
    style WRITE fill:#22c55e,color:#fff
    style LOG fill:#3b82f6,color:#fff
    style SKIP fill:#6b7280,color:#fff
```

---

## 5. Ontology Library Structure (v7)

```mermaid
flowchart TB
    subgraph REG["Registry v10.0.0"]
        IDX["ont-registry-index.json\noaaVersion: 7.0.0\n45 entries"]
    end

    subgraph VE["VE-Series (16)"]
        VSOM["VSOM-ONT"]
        OKR["OKR-ONT"]
        VP["VP-ONT"]
        RRR["RRR-ONT"]
        PMF["PMF-ONT"]
        KPI["KPI-ONT"]
        SA["VSOM-SA\n(5: BSC, IND, RSN, MAC, PFL)"]
        SC["VSOM-SC\n(4: NAR, CSC, CUL, VIZ)"]
        CRT["CRT-ONT"]
    end

    subgraph PE["PE-Series (10)"]
        PPM["PPM-ONT"]
        PEO["PE-ONT"]
        EFS["EFS-ONT"]
        EA["EA + EA-CORE + EA-TOGAF + EA-MSFT"]
        DS["DS-ONT"]
        CICD["CICD-ONT"]
        LSC["LSC-ONT"]
    end

    subgraph GRC["RCSG-Series (10)"]
        GRCFW["GRC-FW-ONT (hub)"]
        ERM["ERM-ONT"]
        ALZ["ALZ-ONT"]
        GDPR["GDPR-ONT"]
        PII["PII-ONT"]
        CAF["NCSC-CAF-ONT"]
        DSPT["DSPT-ONT"]
        RMF["RMF-ONT"]
    end

    subgraph FND["Foundation (5)"]
        ORG["ORG-ONT"]
        ORGCTX["ORG-CONTEXT-ONT"]
        ORGMAT["ORG-MAT-ONT"]
        CTX["CTX-ONT"]
        GA["GA-ONT"]
    end

    subgraph ORC["Orchestration (1)"]
        EMC["EMC-ONT v4.0.0"]
    end

    IDX --> VE
    IDX --> PE
    IDX --> GRC
    IDX --> FND
    IDX --> ORC

    style IDX fill:#f59e0b,color:#000
    style GRCFW fill:#a855f7,color:#fff
    style EMC fill:#06b6d4,color:#fff
```

---

## 6. Deprecation Lifecycle

```mermaid
stateDiagram-v2
    [*] --> compliant: New ontology passes gates
    compliant --> proposal: Under review
    proposal --> compliant: Approved
    compliant --> deprecated: Mark for removal
    deprecated --> archived: Grace period expires (6 months)
    compliant --> superseded: Replaced by newer ontology
    superseded --> archived: No grace period

    note right of deprecated
        Grace period: 6 months
        Amber badge in visualiser
        Security patches only
    end note

    note right of superseded
        Immediate replacement
        Amber badge + link
        No new development
    end note

    note right of archived
        Moved to _orphans/
        Grey badge
        Entry retained (never deleted)
    end note
```

### Current Status

| Ontology | Status | Replaced By | Badge |
|----------|--------|-------------|-------|
| CA-ONT | deprecated | ORG-CONTEXT-ONT | Amber |
| CL-ONT | deprecated | ORG-CONTEXT-ONT | Amber |
| RCSG-FW v2.0.0 | superseded | GRC-FW-ONT v3.0.0 | Amber |

---

## 7. CI/CD Integration

```mermaid
flowchart LR
    subgraph DEV["Developer"]
        EDIT["Edit ontology\nJSON"] --> HOOK["pre-commit-v7-check.sh\n(validates v7 fields)"]
        HOOK -->|pass| COMMIT["git commit"]
        HOOK -->|fail| FIX["Run migrate-v7.mjs\n--apply"]
        FIX --> HOOK
    end

    subgraph CI["GitHub Actions"]
        COMMIT --> PR["Pull Request"]
        PR --> VALIDATE["oaa-v7-validate.yml"]
        VALIDATE --> TEST["vitest run\n(1024 tests)"]
        VALIDATE --> DRYRUN["migrate-v7.mjs\n(dry-run)"]
        VALIDATE --> SCHEMALINT["Schema lint\n(v7 mandatory fields)"]
        VALIDATE --> REGCHECK["Registry version\ncheck (7.0.0)"]
    end

    subgraph DEPLOY["Deployment"]
        TEST -->|pass| MERGE["Merge to main"]
        MERGE --> PAGES["pages.yml\n(GitHub Pages)"]
    end

    style HOOK fill:#f59e0b,color:#000
    style VALIDATE fill:#a855f7,color:#fff
    style PAGES fill:#22c55e,color:#fff
```

---

## 8. Backward Compatibility Contract

| Guarantee | Description |
|-----------|-------------|
| **v6 ontologies load without error** | Gates G20-G24 return `skipped` for v6.x |
| **Parser accepts both v6 and v7** | No branching on schema version |
| **Cross-version cross-refs work** | v7 can reference v6 and vice versa |
| **No forced upgrade** | Migration is explicit and opt-in |
| **Rollback safe** | Removing v7 fields returns valid v6 |
| **MAJOR-1 backward compat** | Per OAA-SCHEMA-EVOLUTION-POLICY.md |

---

## 9. Artefacts Inventory

| Artefact | Location | Purpose |
|----------|----------|---------|
| `audit-engine.js` | `js/audit-engine.js` | G1-G8+, G20-G24 gate implementations |
| `migrate-v7.mjs` | `scripts/migrate-v7.mjs` | v6→v7 migration tool (6 waves) |
| `pre-commit-v7-check.sh` | `scripts/pre-commit-v7-check.sh` | Git pre-commit hook |
| `oaa-v7-validate.yml` | `.github/workflows/` | CI/CD pipeline |
| `oaa-v7/system-prompt.md` | `PBS/AGENTS/oaa-v7/` | OAA v7 agent prompt |
| `OAA-SCHEMA-EVOLUTION-POLICY.md` | `PBS/ONTOLOGIES/` | Versioning & deprecation policy |
| `OAA-V7-MIGRATION-RUNBOOK.md` | `PBS/ONTOLOGIES/` | Operator migration guide |
| `OAA-STYLE-GUIDE.md` | `PBS/ONTOLOGIES/` | Entity/relationship naming rules |
| `OAA-NAMESPACE-REGISTRY.md` | `PBS/ONTOLOGIES/` | 45 canonical prefixes |
| `ont-registry-index.json` | `ontology-library/` | Registry v10.0.0, 45 entries |
| `migration-report-v7.json` | `ontology-library/validation-reports/` | Migration audit trail |

---

## 10. Test Architecture

| Test File | Gate Coverage | Count |
|-----------|-------------|-------|
| `audit-engine.test.js` | G1-G8 | Core gates |
| `g8-style-guide.test.js` | G8+ | Style guide enforcement |
| `gates-v7.test.js` | G20, G21 | Competency + duplication |
| `gates-v7-batch2.test.js` | G22, G23 | Cross-ontology + lineage |
| `gates-v7-batch3.test.js` | G24 | Instance data quality (13 tests) |
| 30 other test files | Parser, renderer, UI | Full regression suite |
| **Total** | **G1-G24** | **1024 tests** |
