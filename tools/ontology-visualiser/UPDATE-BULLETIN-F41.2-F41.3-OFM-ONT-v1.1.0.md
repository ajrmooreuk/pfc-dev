# Update Bulletin: F41.2 + F41.3 — OFM-ONT v1.1.0 LSC and VE-Series Bridge Relationships

**Date:** 2026-03-02
**Priority:** P2 (ontology schema enhancement)
**Commit:** fa28470
**Epic:** 41 (#599) | **Features:** F41.2 (#601), F41.3 (#602)
**Affects:** OFM-ONT consumers, W4M-WWG instance, EMC FULFILMENT compositions

---

## Summary

OFM-ONT has been upgraded from v1.0.0 to v1.1.0 with a **two-layer architecture**: the existing warehouse/distribution layer (11 entities for stock allocation, dispatch, fulfilment risk) is now complemented by a customer/commercial layer (9 new entities for SLA management, landed cost, margin analysis, complaint handling, and customer satisfaction). 17 cross-ontology bridge relationships connect OFM-ONT to LSC-ONT (8 bridges) and VE-Series ontologies (9 bridges with VP-RRR alignment on 3).

## What Changed

### F41.2: LSC-ONT Bridge Relationships (#601)

| Relationship | Source (OFM) | Target (LSC) |
|---|---|---|
| `fulfilledByShipment` | SalesOrder | lsc:Shipment |
| `orderUsesChain` | SalesOrder | lsc:SupplyChain |
| `milestoneAtNode` | OrderMilestone | lsc:ChainNode |
| `breachTriggeredByIncident` | SLABreach | lsc:Incident |
| `breachCausedByBottleneck` | SLABreach | lsc:Bottleneck |
| `costImpactedBy` | LandedCost | lsc:ImpactAssessment |
| `complaintRootCauseIncident` | ComplaintCase | lsc:Incident |
| `remediationInformsMitigation` | RemediationAction | lsc:RiskMitigation |

### F41.3: VE-Series Bridge Relationships (#602)

| Relationship | Source (OFM) | Target (VE) | VP-RRR |
|---|---|---|---|
| `complaintRevealsVPProblem` | ComplaintCase | vp:Problem | Problem → Risk |
| `remediationMapsToVPSolution` | RemediationAction | vp:Solution | Solution → Requirement |
| `satisfactionValidatesBenefit` | CustomerSatisfaction | vp:Benefit | Benefit → Result |
| `marginValidatesPMF` | MarginAnalysis | pmf:ProductMarketFit | — |
| `satisfactionFeedsKPI` | CustomerSatisfaction | kpi:Metric | — |
| `breachFeedsKPI` | SLABreach | kpi:Metric | — |
| `orderPlacedByRole` | SalesOrder | crt:CustomerRole | — |
| `complaintOwnedByRole` | ComplaintCase | pf:FunctionalRole | — |
| `breachAccountableRole` | SLABreach | pf:FunctionalRole | — |

### New Entities (Customer/Commercial Layer)

| Entity | Purpose |
|---|---|
| ServiceLevelAgreement | SLA definitions with targets |
| OrderMilestone | Order tracking milestones |
| CustomerNotification | Milestone-triggered notifications |
| LandedCost | Cost line items per order |
| MarginAnalysis | Profitability analysis per order |
| SLABreach | SLA violation records |
| ComplaintCase | Customer complaint records |
| CustomerSatisfaction | NPS/CSAT survey data |
| RemediationAction | Resolution actions |

### OFM-ONT v1.1.0 Totals

| Component | v1.0.0 | v1.1.0 | Delta |
|---|---|---|---|
| Entities | 11 | 20 | +9 |
| Relationships | 32 | 64 | +32 |
| Business Rules | 20 | 28 | +8 |
| Join Patterns | 9 | 16 | +7 |
| Competency Questions | 18 | 18 | — |

## Files Changed

| File | Change |
|------|--------|
| `PE-Series/OFM-ONT/ofm-ontology-v1.1.0-oaa-v7.json` | Renamed from v1.0.0, extended with customer/commercial layer |
| `PE-Series/OFM-ONT/Entry-ONT-OFM-001.json` | Version, components, dependencies, cross-ontology refs updated |
| `ont-registry-index.json` | OFM-ONT version 1.0.0 → 1.1.0 |

## Cross-Check Table

| System | Impact | Status |
|--------|--------|--------|
| Visualiser test suite | 1,971/1,971 pass | No regression |
| EMC Composer (FULFILMENT category) | OFM already listed — new entities auto-discovered | No code change needed |
| W4M-WWG Operating Guide | References v1.0.0 entities — still valid | Update deferred to F41.7 |
| W4M-WWG Instance Data | Not yet created for v1.1.0 entities | Pending (F41.7) |
| ont-registry-index.json | Version bumped to 1.1.0 | Updated |
| Entry-ONT-OFM-001.json | Dependencies expanded (VP, PMF, CRT added) | Updated |

## Design Decision: Two-Layer OFM Architecture

**Context:** OFM-ONT v1.0.0 modelled the warehouse/distribution view (stock allocation, dispatch, fulfilment risk). The briefing specified customer/commercial entities (SLA, complaints, satisfaction). These are complementary, not competing.

**Decision:** Add the customer/commercial entities alongside the warehouse entities, with SalesOrder as the shared hub (`rdfs:sameAs: "ofm:PurchaseOrder"`). This gives OFM-ONT a two-layer architecture where warehouse operations feed into customer experience metrics.

**Consequence:** OFM-ONT now covers the full order-to-cash lifecycle from warehouse allocation through customer satisfaction measurement.

## Verification

- [x] All 3 JSON files parse without error
- [x] 20 entities, 64 relationships, 28 rules, 16 join patterns confirmed
- [x] All 1,971 visualiser tests pass (no regression)
- [x] F41.2 (#601) closed with detailed comment
- [x] F41.3 (#602) closed with detailed comment
- [x] Epic 41 (#599) body updated — 4/8 features complete

## Deployment & Configuration Requirements

**None** — pull latest main. No configuration changes required. Ontology data files are loaded dynamically by the visualiser.

## Action Required

**None** — the changes are additive ontology data. Existing consumers of OFM-ONT v1.0.0 entities will continue to work. New entities and bridges are available immediately upon loading v1.1.0.

## Next Steps (Epic 41 Remaining)

| Feature | Status |
|---------|--------|
| F41.4: Join Patterns & Automated Assessment Flows (#603) | Open |
| F41.5: EMC-ONT Updates v5.0.0 (#604) | Open |
| F41.6: Registry, Entry & Validation (#605) | Open |
| F41.7: Instance Data — AU-UK Importer Worked Example (#606) | Open |
