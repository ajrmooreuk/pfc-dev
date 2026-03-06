# Test Plan — F41.2 + F41.3: OFM-ONT v1.1.0 LSC and VE-Series Bridge Relationships

**Date:** 2026-03-02
**Commit:** fa28470
**Features:** F41.2 (#601) LSC-ONT Bridge Relationships, F41.3 (#602) VE-Series Bridge Relationships
**Epic:** 41 (#599) — OFM-ONT Order Fulfilment Management Ontology

---

## Scope

OFM-ONT upgraded from v1.0.0 (11 warehouse entities, 32 relationships, 20 rules) to v1.1.0 (20 entities, 64 relationships, 28 rules, 16 join patterns). Changes are **ontology data only** — no visualiser code was modified.

### What Changed

- 9 new customer/commercial entities added (ServiceLevelAgreement, OrderMilestone, CustomerNotification, LandedCost, MarginAnalysis, SLABreach, ComplaintCase, CustomerSatisfaction, RemediationAction)
- 15 new internal relationships connecting customer/commercial entities to SalesOrder hub
- 8 new LSC-ONT bridge relationships (F41.2)
- 9 new VE-Series bridge relationships with VP-RRR alignment on 3 bridges (F41.3)
- 8 new business rules (BR-OFM-021 through BR-OFM-028)
- 7 new join patterns (JP-OFM-010 through JP-OFM-016)
- SalesOrder marked `rdfs:sameAs: "ofm:PurchaseOrder"`
- Registry entry and index updated

### What Was NOT Changed

- No visualiser JavaScript modules
- No HTML structure changes
- No test files added or modified
- No EMC composer changes
- No package.json changes

## Files Modified

| File | Change Type |
|------|------------|
| `PE-Series/OFM-ONT/ofm-ontology-v1.0.0-oaa-v7.json` | Renamed to v1.1.0, extended with 9 entities + 32 relationships + 8 rules + 7 join patterns |
| `PE-Series/OFM-ONT/ofm-ontology-v1.1.0-oaa-v7.json` | New file (renamed from v1.0.0) |
| `PE-Series/OFM-ONT/Entry-ONT-OFM-001.json` | Updated: version, components, dependencies, cross-ontology refs |
| `ont-registry-index.json` | Updated: OFM-ONT version 1.0.0 → 1.1.0 |

## Test Categories

### TC-1: Regression (Existing Tests)

| ID | Test Case | Tests | Status |
|----|-----------|-------|--------|
| TC-1.1 | Full visualiser test suite (54 test files) | 1,971 | All pass |

No regression. All 1,971 existing tests pass unchanged. This is expected since no visualiser code was modified.

### TC-2: JSON Validity

| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| TC-2.1 | `ofm-ontology-v1.1.0-oaa-v7.json` is valid JSON | Parses without error | Pass |
| TC-2.2 | `Entry-ONT-OFM-001.json` is valid JSON | Parses without error | Pass |
| TC-2.3 | `ont-registry-index.json` is valid JSON | Parses without error | Pass |
| TC-2.4 | OFM-ONT has 20 entities | `entities.length == 20` | Pass |
| TC-2.5 | OFM-ONT has 64 relationships | `relationships.length == 64` | Pass |
| TC-2.6 | OFM-ONT has 28 business rules | `businessRules.length == 28` | Pass |
| TC-2.7 | OFM-ONT has 16 join patterns | `joinPatterns.length == 16` | Pass |
| TC-2.8 | OFM-ONT has 18 competency questions | `competencyQuestions.length == 18` | Pass |
| TC-2.9 | Version is 1.1.0 | `oaa:moduleVersion == "1.1.0"` | Pass |

### TC-3: Cross-Ontology Reference Integrity

| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| TC-3.1 | 8 LSC bridge relationships reference valid LSC entities | `lsc:Shipment`, `lsc:SupplyChain`, `lsc:ChainNode`, `lsc:Incident`, `lsc:Bottleneck`, `lsc:ImpactAssessment`, `lsc:RiskMitigation` exist in LSC-ONT | Pass |
| TC-3.2 | 3 VP bridge relationships reference valid VP entities | `vp:Problem`, `vp:Solution`, `vp:Benefit` exist in VP-ONT | Pass |
| TC-3.3 | PMF bridge references valid PMF entity | `pmf:ProductMarketFit` exists in PMF-ONT | Pass |
| TC-3.4 | 2 KPI bridge relationships reference valid KPI entity | `kpi:Metric` exists in KPI-ONT | Pass |
| TC-3.5 | CRT bridge references valid CRT entity | `crt:CustomerRole` exists in CRT-ONT | Pass |
| TC-3.6 | 2 PF bridge relationships reference valid PF entity | `pf:FunctionalRole` exists in RRR-ONT | Pass |
| TC-3.7 | Entry-ONT-OFM-001.json has 8 dependencies | VP, PMF, CRT added to existing 5 | Pass |
| TC-3.8 | Entry-ONT-OFM-001.json has 25 cross-ontology refs | 12 LSC + 3 PE/ORG/RRR(role) + 3 KPI + 3 VP + 1 PMF + 1 CRT + 2 RRR(breach/complaint) | Pass |

### TC-4: VP-RRR Alignment Verification

| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| TC-4.1 | `complaintRevealsVPProblem` has VP-RRR alignment | `"oaa:vpRrrAlignment": "vp:Problem → rrr:Risk"` | Pass |
| TC-4.2 | `remediationMapsToVPSolution` has VP-RRR alignment | `"oaa:vpRrrAlignment": "vp:Solution → rrr:Requirement"` | Pass |
| TC-4.3 | `satisfactionValidatesBenefit` has VP-RRR alignment | `"oaa:vpRrrAlignment": "vp:Benefit → rrr:Result"` | Pass |

### TC-5: Manual Verification

| ID | Check | Result |
|----|-------|--------|
| TC-5.1 | Load OFM-ONT v1.1.0 in visualiser — all 20 entities render | Not tested (no code changes) |
| TC-5.2 | Graph view shows 64 relationships as edges | Not tested (no code changes) |
| TC-5.3 | EMC FULFILMENT category includes OFM-ONT correctly | Not tested (no code changes) |

## Test Coverage Summary

| Category | Tests | Status |
|----------|-------|--------|
| TC-1: Regression (existing suite) | 1,971 | All pass |
| TC-2: JSON Validity | 9 | All pass |
| TC-3: Cross-Ontology Refs | 8 | All pass |
| TC-4: VP-RRR Alignment | 3 | All pass |
| TC-5: Manual Verification | 3 | Not tested (deferred — no code changes) |
| **Total** | **1,994** | **1,991 pass, 3 deferred** |

## Notes

- Manual verification tests (TC-5) are deferred because no visualiser code was changed. These will be validated during F41.7 (Instance Data) when the OFM-ONT is loaded with real instance data.
- The old `ofm-ontology-v1.0.0-oaa-v7.json` file was renamed (git tracks as rename + modification). The original 11 entities and 32 relationships are unchanged within the new file.
