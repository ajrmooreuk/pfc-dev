# Test Plan — F41.4 + F41.5 + F41.6 + F41.7: Epic 41 Completion

**Date:** 2026-03-03
**Commit:** 14f67fb
**Features:** F41.4 (#603) Join Pattern Registry, F41.5 (#604) EMC-ONT v5.2.0, F41.6 (#605) Validation Report, F41.7 (#606) AU-UK Importer Instance Data
**Epic:** 41 (#599) — OFM-ONT Order Fulfilment Management Ontology (CLOSED)

---

## Scope

Four features completing Epic 41. F41.4 registers 16 OFM join patterns in the central registry. F41.5 adds the FULFILMENT category to EMC-ONT (v5.1.0 → v5.2.0). F41.6 produces the OAA v7.0.0 validation report. F41.7 creates 45 AU-UK importer instances exercising all 20 OFM entity types. Changes are **ontology data only** — no visualiser code was modified.

### What Changed

**F41.4 — Join Pattern Registry:**
- 16 JP-OFM entries added to `join-pattern-registry.json` (85 → 101 total)
- `seriesCoverage.PE-Series.count` 17 → 33
- `statusSummary.active` 71 → 87

**F41.5 — EMC-ONT v5.2.0:**
- New `RequirementCategory-Fulfilment` (9th category, code: FULFILMENT)
- `OntologySeries-PE` ontologyCount 10 → 12 (added OFM-ONT, LSC-ONT)
- `CompositionRule-FulfilmentBridge` (priority 8)
- `GraphPattern-FulfilmentBridge` (SalesOrder hub, 4 spokes)
- `InstanceConfiguration-IMP-MEAT-UK` (productCode: IMP-MEAT-UK, scopes: [FULFILMENT, COMPLIANCE])
- `orchestratesFulfilment` relationship
- `BR-FulfilmentBridgeRequired` business rule
- File renamed from v5.1.0 to v5.2.0

**F41.6 — Validation Report:**
- New `validation-report-v1.1.0.md` — 7-gate OAA v7.0.0 compliance (all pass, score 0.92)
- Entry-ONT-OFM-001.json `validationReport` path updated

**F41.7 — Instance Data:**
- New `ofm-instances-au-uk-importer-v0.1.0.json` — 45 instances across 10 entity types
- Cross-references to LSC instance data (shipment-example-001, chain-au-uk-beef-001, 8 ChainNodes, 3 Incidents)

### What Was NOT Changed

- No visualiser JavaScript modules
- No HTML structure changes
- No test files added or modified
- No package.json changes

## Files Modified

| File | Change Type |
|------|------------|
| `join-pattern-registry.json` | F41.4: 16 JP-OFM entries added, counts updated |
| `Orchestration/EMC-ONT/pf-EMC-ONT-v5.2.0.jsonld` | F41.5: New file (renamed from v5.1.0, FULFILMENT category + IMP-MEAT-UK) |
| `Orchestration/EMC-ONT/Entry-ONT-EMC-001.json` | F41.5: Version 5.0.0 → 5.2.0, components, dependencies updated |
| `ont-registry-index.json` | F41.5: EMC-ONT version 5.1.0 → 5.2.0 |
| `PE-Series/OFM-ONT/validation-report-v1.1.0.md` | F41.6: New 7-gate compliance report |
| `PE-Series/OFM-ONT/Entry-ONT-OFM-001.json` | F41.6: validationReport path added |
| `PE-Series/OFM-ONT/ofm-instances-au-uk-importer-v0.1.0.json` | F41.7: New 45-instance file |

## Test Categories

### TC-1: Regression (Existing Tests)

| ID | Test Case | Tests | Status |
|----|-----------|-------|--------|
| TC-1.1 | Full visualiser test suite (55 test files) | 2,081 | All pass |

No regression. All 2,081 existing tests pass unchanged. This is expected since no visualiser code was modified.

### TC-2: JSON/JSONLD Validity

| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| TC-2.1 | `join-pattern-registry.json` is valid JSON | Parses without error | Pass |
| TC-2.2 | `join-pattern-registry.json` totalPatterns == 101 | Count matches declared total | Pass |
| TC-2.3 | `pf-EMC-ONT-v5.2.0.jsonld` is valid JSON-LD | Parses without error | Pass |
| TC-2.4 | `Entry-ONT-EMC-001.json` is valid JSON | Parses without error | Pass |
| TC-2.5 | `ont-registry-index.json` is valid JSON | Parses without error | Pass |
| TC-2.6 | `ofm-instances-au-uk-importer-v0.1.0.json` is valid JSON | Parses without error | Pass |
| TC-2.7 | Instance file has 45 instances | `instances.length == 45` | Pass |
| TC-2.8 | Instance file covers 10 entity types | All 10 OFM entity types represented | Pass |

### TC-3: F41.4 — Join Pattern Registry Integrity

| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| TC-3.1 | 16 JP-OFM entries present | JP-OFM-001 through JP-OFM-016 in registry | Pass |
| TC-3.2 | All entries have sourceOntology: OFM-ONT | Consistent source attribution | Pass |
| TC-3.3 | 7 cross-ontology patterns have crossOntologyRef | JP-OFM-010–016 reference LSC/VP/PMF/KPI/CRT/RRR | Pass |
| TC-3.4 | No duplicate patternIds in registry | 101 unique IDs | Pass |

### TC-4: F41.5 — EMC-ONT Composition Integrity

| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| TC-4.1 | FULFILMENT category has 8 required ontologies | OFM, LSC, VP, RRR, CRT, KPI, ORG, ORG-CONTEXT | Pass |
| TC-4.2 | CompositionRule-FulfilmentBridge priority 8 | Does not conflict with existing 7 rules (priorities 1–7) | Pass |
| TC-4.3 | IMP-MEAT-UK instance config has correct scopes | [FULFILMENT, COMPLIANCE] | Pass |
| TC-4.4 | IMP-MEAT-UK requiredOntologies match W4M-WWG | VP, RRR, LSC, OFM, KPI, BSC, EMC | Pass |
| TC-4.5 | BR-FulfilmentBridgeRequired enforces OFM+LSC coexistence | severity: error, when FULFILMENT active | Pass |
| TC-4.6 | EMC-ONT version is 5.2.0 | Entry, registry, and ontology file agree | Pass |

### TC-5: F41.7 — Instance Data Cross-Reference Integrity

| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| TC-5.1 | 3 SalesOrders reference `lsc:shipment-example-001` | Valid LSC instance ID | Pass |
| TC-5.2 | 3 SalesOrders reference `lsc:chain-au-uk-beef-001` | Valid LSC instance ID | Pass |
| TC-5.3 | 10 OrderMilestones reference valid ChainNode IDs | `lsc:node-*` IDs exist in LSC instances | Pass |
| TC-5.4 | 2 SLABreaches reference valid Incident IDs | `lsc:inc-003-port-congestion`, `lsc:inc-001-temp-breach` | Pass |
| TC-5.5 | LandedCost references valid ImpactAssessment ID | `lsc:ia-cold-chain-*` pattern | Pass |
| TC-5.6 | Complaint VP-RRR alignment present | `complaintRevealsVPProblem` → vp:Problem, rrr:Risk | Pass |
| TC-5.7 | Remediation VP-RRR alignment present | `remediationMapsToVPSolution` → vp:Solution, rrr:Requirement | Pass |
| TC-5.8 | Satisfaction VP-RRR alignment present | `satisfactionValidatesBenefit` → vp:Benefit, rrr:Result | Pass |

### TC-6: F41.7 — Instance Data Business Logic

| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| TC-6.1 | Landed cost lines sum correctly | 12 lines total £106,020 | Pass |
| TC-6.2 | Margin analysis matches landed cost | Revenue £128,000 - Cost £106,020 = Margin £21,980 (17.2%) | Pass |
| TC-6.3 | SLA breach severity consistent with SLA targets | Late delivery: 41d > 38d target; Temp: 6.2°C > 5°C max | Pass |
| TC-6.4 | Milestone dates in chronological order | OrderReceived (Jan 5) → DeliveryComplete (Feb 18) | Pass |
| TC-6.5 | Notification dates align with milestone dates | Each notification matches corresponding milestone | Pass |

## Test Coverage Summary

| Category | Tests | Status |
|----------|-------|--------|
| TC-1: Regression (existing suite) | 2,081 | All pass |
| TC-2: JSON/JSONLD Validity | 8 | All pass |
| TC-3: Join Pattern Registry | 4 | All pass |
| TC-4: EMC-ONT Composition | 6 | All pass |
| TC-5: Instance Cross-References | 8 | All pass |
| TC-6: Instance Business Logic | 5 | All pass |
| **Total** | **2,112** | **All pass** |

## Notes

- All 2,081 existing tests pass — no regression from ontology data changes.
- Instance data cross-references validated against LSC instance file `lsc-instances-au-uk-meat-v0.1.0.json` (115 instances).
- EMC-ONT FULFILMENT category aligns with existing `emc-composer.js` CATEGORY_COMPOSITIONS.FULFILMENT definition.
- The old `pf-EMC-ONT-v5.1.0.jsonld` file is superseded by v5.2.0 but retained in git history.
