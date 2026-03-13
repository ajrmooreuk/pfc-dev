# PFC ALZ Assessment Skills

**Epic:** [Epic 74 (#1074)](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/1074) — PFI-AIRL-AZS
**Status:** Scaffolding — skill definitions in progress
**Cascade:** pfc-dev → pfi-w4m-rcs-dev (market delivery)

---

## Overview

Ontology-driven Azure assessment sub-skills that wrap Microsoft's [`azure-skills`](https://github.com/microsoft/azure-skills) MCP plugin with PFC intelligence:

- **azure-skills** provides live Azure data extraction (200+ MCP tools)
- **PFC sub-skills** add ontology mapping, cross-framework correlation, RMF scoring, VE prioritisation

## Sub-Skills

| Skill | Wraps | Ontology Target | Feature |
|---|---|---|---|
| `pfc-alz-assess-waf` | azure-validate, azure-compliance, azure-cost-optimization, azure-compute, azure-observability | EA-MSFT-ONT:WAFPillar | F74.2 |
| `pfc-alz-assess-caf` | azure-prepare, azure-compliance, azure-cloud-migrate, azure-deploy, azure-resource-visualizer | NCSC-CAF-ONT | F74.3 |
| `pfc-alz-assess-cyber` | azure-compliance, azure-rbac, azure-diagnostics, azure-observability, azure-storage, entra-app-registration | MCSB-ONT, GRC-FW-ONT | F74.4 |
| `pfc-alz-assess-health` | azure-validate, azure-resource-lookup, azure-resource-visualizer, azure-kusto | AZALZ-ONT | F74.5 |

## Plugins

| Plugin | Purpose | Feature |
|---|---|---|
| `ontology-adapter` | Transform azure-skills output → EMC Composer input format | F74.15 |
| `cross-framework` | Inject WAF ↔ CAF ↔ NCSC ↔ MCSB cross-references on findings | F74.15 |
| `rmf-scorer` | Attach RMF-IS27005-ONT risk statements to findings | F74.15 |
| `ve-tagger` | Tag findings with VP-ONT problem/solution/benefit linkage | F74.15 |

## Methodology

- **DMAIC Backcasting:** Three-state gap analysis (Best Practice × Current State × Desired Destination)
- **DELTA Discovery:** 5-phase engagement lifecycle
- **PE-ONT Process Set:** L0–L3 process hierarchy (18 processes)
- **VE + FDN Focus:** Customer value drives domain prioritisation

See: [ALZ Assessment DMAIC Backcasting Methodology](https://github.com/ajrmooreuk/Azlan-EA-AAA/blob/main/PBS/STRATEGY/PFI-AIRL-GRC-BRIEF-ALZ-Assessment-DMAIC-Backcasting-Methodology-v1.0.0.md)

## Test-Driven Development (F74.16)

```text
tests/
├── test-data/          ← 7 Azure tenant configurations (Bicep/Terraform)
│   ├── TD-ALZ-GOLD/        Gold-standard compliant LZ
│   ├── TD-ALZ-DRIFT/       Gold + injected drift
│   ├── TD-ALZ-GREENFIELD/  Empty tenant
│   ├── TD-ALZ-LEGACY/      Classic hub-spoke, legacy patterns
│   ├── TD-ALZ-MULTI/       Multi-subscription mixed maturity
│   ├── TD-ALZ-REGULATED/   Regulated sector (NCSC CAF, MCSB)
│   └── TD-ALZ-AI/          AI workloads (Azure OpenAI, ML)
├── use-cases/          ← 15 test use cases (UC-01 to UC-15)
└── golden-outputs/     ← Reference outputs for regression
```

## Directory Structure

```text
skills/pfc-alz-assess/
├── README.md               ← This file
├── waf/                    ← pfc-alz-assess-waf skill definition
├── caf/                    ← pfc-alz-assess-caf skill definition
├── cyber/                  ← pfc-alz-assess-cyber skill definition
├── health/                 ← pfc-alz-assess-health skill definition
├── common/                 ← Shared assessment logic, scoring models
├── plugins/                ← MCP adapter plugins
│   ├── ontology-adapter/
│   ├── cross-framework/
│   ├── rmf-scorer/
│   └── ve-tagger/
└── tests/                  ← TDD infrastructure
    ├── test-data/
    ├── use-cases/
    └── golden-outputs/
```

## Cascade Path

```text
pfc-dev (this repo)         ← Build & prove sub-skills, plugins, TDD
    │
pfc-test                    ← Validation gate
    │
pfc-prod                    ← Sealed release
    │
pfi-w4m-rcs-dev             ← Client-facing assessment delivery
    │
pfi-w4m-rcs-test → prod    ← Production assessment service
```
