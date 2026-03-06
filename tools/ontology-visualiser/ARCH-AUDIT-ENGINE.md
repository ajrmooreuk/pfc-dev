# Audit Engine Architecture

**Module:** `js/audit-engine.js`
**Tests:** `tests/audit-engine.test.js`, `tests/gates-v7.test.js`, `tests/gates-v7-batch2.test.js`, `tests/gates-v7-batch3.test.js`
**Test Count:** 1024 pass (35 files)
**TDD Policy:** Tests written FIRST, implementation SECOND (Epic 21 mandatory)
**OAA Version:** 7.0.0 | **Registry:** v10.0.0

---

## Gate Pipeline

```mermaid
flowchart LR
    subgraph IN["Inputs"]
        ONT["Ontology JSON\n(v5 / v6 / v7)"]
        REG["Registry Index\n(45 ontologies)"]
        LC["Lineage Chains\n(VE, PE, GRC)"]
        KP["Known + Deprecated\nPrefixes"]
        TD["Test/Instance\nData"]
    end

    subgraph CORE["Core Gates — MANDATORY"]
        G1["G1\nContext"]
        G2["G2\nStructure"]
        G2B["G2b\nEnums"]
        G2C["G2c\nRules"]
        G3["G3\nReferential"]
        G4["G4\nCross-Ref"]
    end

    subgraph ADV["Advisory Gates — RECOMMENDED"]
        G5["G5\nCompleteness"]
        G6["G6\nRegistry"]
        G7["G7\nSchema Props"]
        G8["G8\nNaming +\nStyle Guide"]
    end

    subgraph V7["v7 Quality Gates — TDD"]
        G20["G20\nCompetency"]
        G21["G21\nDuplication"]
        G22["G22\nCross-Ont Rules"]
        G23["G23\nLineage Chain"]
        G24["G24\nInstance Data"]
    end

    subgraph OUT["Outputs"]
        PASS["pass / fail / warn"]
        ISS["issues[]"]
        WRN["warnings[]"]
        MET["metrics{}"]
        SKIP["skipped (v6 compat)"]
    end

    ONT --> G1 --> G2 --> G2B --> G2C --> G3 --> G4
    G4 --> PASS

    ONT --> G5 --> G6 --> G7 --> G8
    G8 --> WRN

    ONT --> G20 --> G21 --> G22 --> G23 --> G24
    REG --> G4
    REG --> G6
    KP --> G22
    LC --> G23
    TD --> G24
    G24 --> ISS
    G24 --> MET
    G24 --> SKIP

    style G1 fill:#22c55e,color:#fff
    style G2 fill:#22c55e,color:#fff
    style G2B fill:#22c55e,color:#fff
    style G2C fill:#22c55e,color:#fff
    style G3 fill:#22c55e,color:#fff
    style G4 fill:#22c55e,color:#fff
    style G5 fill:#3b82f6,color:#fff
    style G6 fill:#3b82f6,color:#fff
    style G7 fill:#3b82f6,color:#fff
    style G8 fill:#3b82f6,color:#fff
    style G20 fill:#a855f7,color:#fff
    style G21 fill:#a855f7,color:#fff
    style G22 fill:#a855f7,color:#fff
    style G23 fill:#a855f7,color:#fff
    style G24 fill:#a855f7,color:#fff
```

## Gate Detail

```mermaid
flowchart TB
    subgraph G20D["G20: Competency Coverage"]
        CQ["competencyQuestions[]"] --> TE["targetEntities"]
        CQ --> TR["targetRelationships"]
        CQ --> TRU["targetRules"]
        TE --> COV["Coverage %\nentity / rel / rule"]
        TR --> COV
        TRU --> COV
        COV -->|100%| P20["pass"]
        COV -->|below 100%| W20["warn + uncovered list"]
    end

    subgraph G21D["G21: Semantic Duplication"]
        ENT["entities[].description"] --> TOK["tokenJaccard(a, b)"]
        TOK -->|below 70%| P21["pass"]
        TOK -->|70-90%| W21["warn — review"]
        TOK -->|above 90%| F21["fail — likely duplicate"]
    end

    subgraph G22D["G22: Cross-Ontology Rules"]
        REL["relationships with\ncrossOntologyRef"] --> PFX["Extract prefix\nfrom rangeIncludes"]
        PFX -->|known| P22["pass"]
        PFX -->|deprecated| WD["warn — deprecated"]
        PFX -->|unknown| WU["warn — unrecognised"]
    end

    subgraph G23D["G23: Lineage Chain Integrity"]
        CHAIN["Lineage chain\ne.g. VSOM-OKR-VP-PMF-EFS"] --> POS["Find position\nin chain"]
        POS -->|not found| SK["skip"]
        POS -->|found| CHK["Check upstream +\ndownstream refs"]
        CHK -->|both linked| P23["pass"]
        CHK -->|missing| W23["warn — gap in chain"]
    end

    subgraph G24D["G24: Instance Data Quality"]
        TI["testInstances{} or\ntestData{}"] --> SCH["Schema conformance\n(@type resolves?)"]
        SCH -->|all valid| P24S["pass"]
        SCH -->|unresolved| W24S["warn — bad @type"]
        TI --> DIST["Distribution check\n60-20-10-10 target"]
        DIST -->|within 10%| P24D["pass"]
        DIST -->|deviation >10%| W24D["warn — skewed"]
        TI --> CQL["CQ linkage\n(cqRef on instances)"]
        CQL -->|all CQs covered| P24C["pass"]
        CQL -->|uncovered CQs| W24C["warn — gaps"]
    end

    style P20 fill:#22c55e,color:#fff
    style W20 fill:#f59e0b,color:#000
    style P21 fill:#22c55e,color:#fff
    style W21 fill:#f59e0b,color:#000
    style F21 fill:#ef4444,color:#fff
    style P22 fill:#22c55e,color:#fff
    style WD fill:#f59e0b,color:#000
    style WU fill:#f59e0b,color:#000
    style P23 fill:#22c55e,color:#fff
    style W23 fill:#f59e0b,color:#000
    style SK fill:#6b7280,color:#fff
    style P24S fill:#22c55e,color:#fff
    style W24S fill:#f59e0b,color:#000
    style P24D fill:#22c55e,color:#fff
    style W24D fill:#f59e0b,color:#000
    style P24C fill:#22c55e,color:#fff
    style W24C fill:#f59e0b,color:#000
```

## Backward Compatibility

```mermaid
flowchart LR
    V6["v6.x Ontology"] --> CHECK{"schemaVersion\nstarts with 5. or 6.?"}
    CHECK -->|yes| SKIP["skip — return pass\nwith skipped: true"]
    CHECK -->|no| RUN["Run gate logic\n(v7+ only)"]

    V7["v7.x Ontology"] --> CHECK

    style SKIP fill:#6b7280,color:#fff
    style RUN fill:#a855f7,color:#fff
```

## Migration Pipeline

```mermaid
flowchart LR
    subgraph MIGRATE["migrate-v7.mjs"]
        DRY["--dry-run\n(default)"] --> REPORT["migration-report-v7.json"]
        WAVE["--wave N\n(filter)"] --> DRY
        APPLY["--apply\n(write files)"] --> WRITE["Update ontology\nJSON artifacts"]
    end

    subgraph CICD["CI/CD"]
        GHA["oaa-v7-validate.yml\n(GitHub Actions)"] --> VITEST["npx vitest run\n(1024 tests)"]
        GHA --> DRYCI["Dry-run migration\n(regression check)"]
        GHA --> LINT["Schema lint\n(v7 mandatory fields)"]
        HOOK["pre-commit-v7-check.sh"] --> STAGED["Check staged\nontology files"]
    end

    WRITE --> GHA
    STAGED --> LINT

    style DRY fill:#3b82f6,color:#fff
    style APPLY fill:#22c55e,color:#fff
    style GHA fill:#a855f7,color:#fff
    style HOOK fill:#f59e0b,color:#000
```

## Exported Functions

| Function | Gate | Signature | Returns |
|----------|------|-----------|---------|
| `validateG1Context` | G1 | `(data)` | `{gate, status, issues}` |
| `validateG2Structure` | G2 | `(data)` | `{gate, status, issues}` |
| `validateG2bEnums` | G2b | `(data)` | `{gate, status, issues}` |
| `validateG2cRules` | G2c | `(data)` | `{gate, status, issues}` |
| `validateG3Referential` | G3 | `(data)` | `{gate, status, issues}` |
| `validateG4CrossRef` | G4 | `(data, registry)` | `{gate, status, issues}` |
| `validateG5Completeness` | G5 | `(data)` | `{gate, status, warnings}` |
| `validateG6RegistryFormat` | G6 | `(data)` | `{gate, status, warnings}` |
| `validateG7SchemaProperties` | G7 | `(data)` | `{gate, status, warnings}` |
| `validateG8NamingConventions` | G8 | `(data)` | `{gate, status, warnings}` |
| `validateG8StyleGuideCompliance` | G8+ | `(data)` | `{gate, status, issues, warnings, metrics}` |
| `validateG20CompetencyCoverage` | G20 | `(data)` | `{gate, status, issues, warnings, metrics, skipped?}` |
| `validateG21SemanticDuplication` | G21 | `(data)` | `{gate, status, issues, warnings, advisory, skipped?}` |
| `validateG22CrossOntologyRules` | G22 | `(data, knownPrefixes, deprecatedPrefixes)` | `{gate, status, issues, warnings, metrics, skipped?}` |
| `validateG23LineageChainIntegrity` | G23 | `(data, lineageChain)` | `{gate, status, issues, warnings, metrics, skipped?}` |
| `validateG24InstanceDataQuality` | G24 | `(data)` | `{gate, status, issues, warnings, metrics, advisory, skipped?}` |
| `tokenJaccard` | util | `(a, b)` | `number (0.0-1.0)` |
| `computeMultiOntologyScores` | util | `(loadedOntologies)` | `[{ontology, score}]` |
| `extractEntities` | util | `(data)` | `entity[]` |
| `extractRelationships` | util | `(data)` | `relationship[]` |

## Legend

| Colour | Meaning |
|--------|---------|
| Green | Core gates (G1-G4) — mandatory, blocks compliance |
| Blue | Advisory gates (G5-G8+) — recommended, warnings only |
| Purple | v7 Quality gates (G20-G24) — TDD, skip for v6 |
| Grey | Planned / skipped |
| Amber | Warning output |
| Red | Failure output |
