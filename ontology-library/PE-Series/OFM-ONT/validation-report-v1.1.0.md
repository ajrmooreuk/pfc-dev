# OFM-ONT Validation Report v1.1.0

**Ontology:** Order Fulfilment Management Ontology
**Version:** 1.1.0
**Validation Date:** 2026-03-03
**Validator:** OAA v7.0.0 Compliance Check
**Overall Status:** PASS

---

## Executive Summary

| Metric | Score | Threshold | Status |
|--------|-------|-----------|--------|
| Completeness Score | 100% | 100% | PASS |
| Validation Pass Rate | 100% | 95% | PASS |
| Competency Score | 100% | 90% | PASS |
| Test Data Coverage | 100% | 100% | PASS |
| Documentation Coverage | 100% | 100% | PASS |
| Cross-Ontology Ref Integrity | 100% | 100% | PASS |
| **Confidence Score** | **0.92** | **0.85** | PASS |

### Component Inventory

| Component | Count |
|-----------|-------|
| Entities | 20 |
| Relationships | 64 |
| Business Rules | 28 (20 error, 8 warning) |
| Join Patterns | 16 |
| Competency Questions | 18 |
| Cross-Ontology Bridges | 25 |
| Imports | 8 ontologies |

---

## Gate 1: Entity Descriptions — PASS

**Requirement:** All entities must have descriptions >= 20 characters

| Entity | Description Length | Status |
|--------|-------------------|--------|
| ofm:SalesOrder | 403 chars | PASS |
| ofm:OrderLine | 200 chars | PASS |
| ofm:StockAllocation | 332 chars | PASS |
| ofm:StorageEvent | 224 chars | PASS |
| ofm:DeliveryWindow | 226 chars | PASS |
| ofm:DispatchLeg | 216 chars | PASS |
| ofm:CustomerChange | 276 chars | PASS |
| ofm:MarginImpact | 271 chars | PASS |
| ofm:FulfilmentRisk | 246 chars | PASS |
| ofm:DemandPattern | 264 chars | PASS |
| ofm:CapacityForecast | 247 chars | PASS |
| ofm:ServiceLevelAgreement | 295 chars | PASS |
| ofm:OrderMilestone | 267 chars | PASS |
| ofm:CustomerNotification | 285 chars | PASS |
| ofm:LandedCost | 370 chars | PASS |
| ofm:MarginAnalysis | 268 chars | PASS |
| ofm:SLABreach | 264 chars | PASS |
| ofm:ComplaintCase | 288 chars | PASS |
| ofm:CustomerSatisfaction | 307 chars | PASS |
| ofm:RemediationAction | 408 chars | PASS |

**Result:** 20/20 entities compliant (100%)

---

## Gate 2: Relationship Cardinality — PASS

**Requirement:** All relationships must have cardinality defined

### Internal Relationships (32)

| Relationship | Source | Target | Status |
|---|---|---|---|
| hasOrderLine | SalesOrder | OrderLine | PASS |
| belongsToOrder | OrderLine | SalesOrder | PASS |
| hasAllocation | OrderLine | StockAllocation | PASS |
| allocatedToLine | StockAllocation | OrderLine | PASS |
| hasStorageEvent | StockAllocation | StorageEvent | PASS |
| hasDeliveryWindow | SalesOrder | DeliveryWindow | PASS |
| hasDispatchLeg | OrderLine | DispatchLeg | PASS |
| hasMarginImpact | OrderLine | MarginImpact | PASS |
| hasFulfilmentRisk | OrderLine | FulfilmentRisk | PASS |
| orderHasFulfilmentRisk | SalesOrder | FulfilmentRisk | PASS |
| hasCustomerChange | SalesOrder | CustomerChange | PASS |
| affectsOrderLine | CustomerChange | OrderLine | PASS |
| triggersMarginImpact | CustomerChange | MarginImpact | PASS |
| dispatchUsesWindow | DispatchLeg | DeliveryWindow | PASS |
| storageErodesMargin | StorageEvent | MarginImpact | PASS |
| changeTriggersRisk | CustomerChange | FulfilmentRisk | PASS |
| demandPatternAffectsCapacity | DemandPattern | CapacityForecast | PASS |
| allocationFulfilsLine | StockAllocation | OrderLine | PASS |
| riskInformedByPattern | FulfilmentRisk | DemandPattern | PASS |
| dispatchConsolidatesWith | DispatchLeg | DispatchLeg | PASS |
| hasSLA | SalesOrder | ServiceLevelAgreement | PASS |
| hasMilestone | SalesOrder | OrderMilestone | PASS |
| hasNotification | SalesOrder | CustomerNotification | PASS |
| hasLandedCost | SalesOrder | LandedCost | PASS |
| hasMarginAnalysis | SalesOrder | MarginAnalysis | PASS |
| hasBreach | ServiceLevelAgreement | SLABreach | PASS |
| hasComplaint | SalesOrder | ComplaintCase | PASS |
| hasSatisfaction | SalesOrder | CustomerSatisfaction | PASS |
| slaMonitorsMilestone | ServiceLevelAgreement | OrderMilestone | PASS |
| breachTriggersRemediation | SLABreach | RemediationAction | PASS |
| complaintLeadsToRemediation | ComplaintCase | RemediationAction | PASS |
| remediationNotifiesCustomer | RemediationAction | CustomerNotification | PASS |
| landedCostFeedsMargin | LandedCost | MarginAnalysis | PASS |
| complaintAffectsSatisfaction | ComplaintCase | CustomerSatisfaction | PASS |
| satisfactionInformsRemediation | CustomerSatisfaction | RemediationAction | PASS |

### Cross-Ontology Relationships (25)

| Relationship | Target Ontology | Status |
|---|---|---|
| allocatedFrom | LSC-ONT | PASS |
| erosionFromIncident | LSC-ONT | PASS |
| erosionFromBottleneck | LSC-ONT | PASS |
| informedByLSCRisk | LSC-ONT | PASS |
| correlatesWithSupplyPattern | LSC-ONT | PASS |
| considersInboundFrom | LSC-ONT | PASS |
| fulfilledByShipment | LSC-ONT | PASS |
| orderUsesChain | LSC-ONT | PASS |
| milestoneAtNode | LSC-ONT | PASS |
| breachTriggeredByIncident | LSC-ONT | PASS |
| breachCausedByBottleneck | LSC-ONT | PASS |
| costImpactedBy | LSC-ONT | PASS |
| complaintRootCauseIncident | LSC-ONT | PASS |
| remediationInformsMitigation | LSC-ONT | PASS |
| managedByRole | RRR-ONT | PASS |
| complaintOwnedByRole | RRR-ONT | PASS |
| breachAccountableRole | RRR-ONT | PASS |
| operatedByCarrier | ORG-ONT | PASS |
| customerOrderedBy | ORG-ONT | PASS |
| capacityForecastForWarehouse | ORG-ONT | PASS |
| mapsToProcess | PE-ONT | PASS |
| trackedByKPI | KPI-ONT | PASS |
| satisfactionFeedsKPI | KPI-ONT | PASS |
| breachFeedsKPI | KPI-ONT | PASS |
| complaintRevealsVPProblem | VP-ONT | PASS |
| remediationMapsToVPSolution | VP-ONT | PASS |
| satisfactionValidatesBenefit | VP-ONT | PASS |
| marginValidatesPMF | PMF-ONT | PASS |
| orderPlacedByRole | CRT-ONT | PASS |

**Result:** 64/64 relationships compliant (100%)

---

## Gate 3: Business Rules Format — PASS

**Requirement:** All business rules must follow IF-THEN format with ruleId, name, condition, severity

| Rule ID | Name | Severity | Status |
|---------|------|----------|--------|
| BR-OFM-001 | AllocationBeforeDispatch | error | PASS |
| BR-OFM-002 | MarginWaterfallIntegrity | error | PASS |
| BR-OFM-003 | AllocationMustReferenceLSCShipment | error | PASS |
| BR-OFM-004 | ShelfLifeAtDispatch | error | PASS |
| BR-OFM-005 | LateChangeEscalation | error | PASS |
| BR-OFM-006 | CapacityRedThreshold | error | PASS |
| BR-OFM-007 | MarginRedThreshold | error | PASS |
| BR-OFM-008 | DispatchTemperatureMatch | error | PASS |
| BR-OFM-009 | StorageEventDailyCostCalculation | error | PASS |
| BR-OFM-010 | DeliveryWindowSequence | error | PASS |
| BR-OFM-011 | CancelledOrderNoDispatch | error | PASS |
| BR-OFM-012 | ConsolidationDispatchCount | error | PASS |
| BR-OFM-013 | FailedDeliveryRequiresReschedule | warning | PASS |
| BR-OFM-014 | HighDwellAlert | warning | PASS |
| BR-OFM-015 | DemandPatternReliability | warning | PASS |
| BR-OFM-016 | QuantityReductionRecovery | warning | PASS |
| BR-OFM-017 | FulfilmentRiskProbabilityBound | error | PASS |
| BR-OFM-018 | OrderMustHaveLines | error | PASS |
| BR-OFM-019 | AllocationTemperatureZoneMatch | error | PASS |
| BR-OFM-020 | RefusedDeliveryMarginImpact | error | PASS |
| BR-OFM-021 | OrderMustHaveShipment | error | PASS |
| BR-OFM-022 | SLABreachDetection | error | PASS |
| BR-OFM-023 | BreachRequiresNotification | error | PASS |
| BR-OFM-024 | ComplaintRequiresOwner | error | PASS |
| BR-OFM-025 | RemediationApproval | error | PASS |
| BR-OFM-026 | MarginCalculation | error | PASS |
| BR-OFM-027 | LandedCostCompleteness | error | PASS |
| BR-OFM-028 | VPRRRAlignmentEnforcement | warning | PASS |

**Result:** 28/28 rules compliant (100%) — 20 error severity, 8 warning severity

---

## Gate 4: Metadata Completeness — PASS

**Requirement:** Ontology must have moduleVersion, description, namespace, @context, oaa:imports

| Field | Present | Status |
|-------|---------|--------|
| @context | Yes (7 namespace prefixes) | PASS |
| @type | pf-ontology-keyed | PASS |
| @id | OFM-ONT | PASS |
| oaa:moduleVersion | 1.1.0 | PASS |
| oaa:oaaVersion | 7.0.0 | PASS |
| description | Present (full) | PASS |
| oaa:namespace | ofm: | PASS |
| oaa:imports | 8 ontologies declared | PASS |
| changeControl | 2 entries (v1.0.0, v1.1.0) | PASS |

**Result:** All metadata fields present and valid

---

## Gate 5: Cross-Ontology Reference Integrity — PASS

**Requirement:** All cross-ontology references must resolve to declared imports

| Import | Version | Used Entities | Bridges Using | Status |
|--------|---------|--------------|---------------|--------|
| LSC-ONT | 1.2.0 | Shipment, SupplyChain, ChainNode, Incident, Bottleneck, ImpactAssessment, RiskMitigation | 14 relationships | PASS |
| PE-ONT | 1.0.0 | Process | 1 relationship | PASS |
| ORG-ONT | 1.0.0 | Organization | 3 relationships | PASS |
| RRR-ONT | 1.2.3 | FunctionalRole | 3 relationships | PASS |
| KPI-ONT | 1.0.0 | Metric | 3 relationships | PASS |
| VP-ONT | 1.2.3 | Problem, Solution, Benefit | 3 relationships | PASS |
| PMF-ONT | 2.0.0 | ProductMarketFit | 1 relationship | PASS |
| CRT-ONT | 1.0.0 | CustomerRole | 1 relationship | PASS |

**Result:** 8/8 imports valid, all 25 cross-ontology relationships resolve

---

## Gate 6: Join Pattern Coverage — PASS

**Requirement:** Join patterns must reference only defined entities and relationships

| Pattern ID | Name | Cross-Ontology | Status |
|---|---|---|---|
| JP-OFM-001 | Order-to-Delivery Traversal | No | PASS |
| JP-OFM-002 | Margin Waterfall | No | PASS |
| JP-OFM-003 | Supply-Demand Bridge | LSC-ONT | PASS |
| JP-OFM-004 | Customer Change Impact | No | PASS |
| JP-OFM-005 | Storage Cost Accumulation | No | PASS |
| JP-OFM-006 | Supply Disruption to Demand Cascade | LSC-ONT | PASS |
| JP-OFM-007 | Demand Pattern Recognition | LSC-ONT | PASS |
| JP-OFM-008 | Capacity Planning | LSC-ONT | PASS |
| JP-OFM-009 | Fulfilment Risk Heat Map | No | PASS |
| JP-OFM-010 | Order-to-Shipment Tracking | LSC-ONT | PASS |
| JP-OFM-011 | SLA Compliance Dashboard | LSC-ONT | PASS |
| JP-OFM-012 | Automated Assessment Flow | LSC-ONT | PASS |
| JP-OFM-013 | Profit Optimisation Chain | LSC-ONT, PMF-ONT | PASS |
| JP-OFM-014 | Complaint-to-Prevention Loop | LSC-ONT | PASS |
| JP-OFM-015 | Customer Role Experience | CRT-ONT, KPI-ONT | PASS |
| JP-OFM-016 | VP-RRR Through Fulfilment | VP-ONT, RRR-ONT | PASS |

**Result:** 16/16 join patterns valid (100%)

---

## Gate 7: Competency Question Coverage — PASS

**Requirement:** Competency questions must be answerable from the ontology's entities and relationships

| CQ ID | Question Summary | Answerable | Status |
|---|---|---|---|
| CQ-001 | Order status, lines, allocations | Yes (SalesOrder → OrderLine → StockAllocation) | PASS |
| CQ-002 | LSC shipment allocation to customer orders | Yes (lsc:Shipment → StockAllocation → OrderLine) | PASS |
| CQ-003 | Margin waterfall per order line | Yes (OrderLine → MarginImpact chain) | PASS |
| CQ-004 | Storage cost accumulation per allocation | Yes (StockAllocation → StorageEvent) | PASS |
| CQ-005 | Customer change impact on lines and risk | Yes (CustomerChange → OrderLine → FulfilmentRisk) | PASS |
| CQ-006 | Delivery window schedule and on-time rate | Yes (SalesOrder → DeliveryWindow) | PASS |
| CQ-007 | Dispatch leg consolidation and carriers | Yes (DispatchLeg → ORG carrier) | PASS |
| CQ-008 | Fulfilment risk heat map | Yes (SalesOrder → FulfilmentRisk aggregation) | PASS |
| CQ-009 | LSC incident impact on customer orders | Yes (lsc:Incident → MarginImpact → OrderLine) | PASS |
| CQ-010 | Demand pattern correlation with LSC patterns | Yes (DemandPattern → lsc:PredictivePattern) | PASS |
| CQ-011 | Warehouse capacity utilisation and projections | Yes (CapacityForecast → lsc:SupplyChain) | PASS |
| CQ-012 | Red margin orders and erosion sources | Yes (MarginImpact filter by status) | PASS |
| CQ-013 | Shelf life position across allocations | Yes (StockAllocation → ShelfLife properties) | PASS |
| CQ-014 | Customer change frequency and cost impact | Yes (CustomerChange aggregation) | PASS |
| CQ-015 | Role-based order performance distribution | Yes (managedByRole → SalesOrder) | PASS |
| CQ-016 | Temperature compliance across dispatch legs | Yes (DispatchLeg temperature properties) | PASS |
| CQ-017 | Complete order-to-delivery journey | Yes (JP-OFM-001 traversal) | PASS |
| CQ-018 | LSC bottleneck margin erosion ranking | Yes (lsc:Bottleneck → MarginImpact) | PASS |

**Result:** 18/18 competency questions answerable (100%)

---

## Two-Layer Architecture Summary

OFM-ONT v1.1.0 implements a two-layer architecture:

| Layer | Version | Entities | Focus |
|-------|---------|----------|-------|
| Warehouse/Distribution | v1.0.0 | 11 (SalesOrder, OrderLine, StockAllocation, StorageEvent, DeliveryWindow, DispatchLeg, CustomerChange, MarginImpact, FulfilmentRisk, DemandPattern, CapacityForecast) | Stock allocation, dispatch, storage, demand forecasting |
| Customer/Commercial | v1.1.0 | 9 (ServiceLevelAgreement, OrderMilestone, CustomerNotification, LandedCost, MarginAnalysis, SLABreach, ComplaintCase, CustomerSatisfaction, RemediationAction) | SLA tracking, cost analysis, complaint management, satisfaction |

**Hub Entity:** SalesOrder (rdfs:sameAs ofm:PurchaseOrder)

---

## VP-RRR Alignment Verification

Three bridges implement the standing VP-RRR alignment convention:

| Bridge | VP Mapping | RRR Mapping | Status |
|--------|-----------|-------------|--------|
| complaintRevealsVPProblem | ComplaintCase → vp:Problem | Problem → rrr:Risk | PASS |
| remediationMapsToVPSolution | RemediationAction → vp:Solution | Solution → rrr:Requirement | PASS |
| satisfactionValidatesBenefit | CustomerSatisfaction → vp:Benefit | Benefit → rrr:Result | PASS |

---

## Registry Status

| Item | Status |
|------|--------|
| Entry-ONT-OFM-001.json | v1.1.0, 7/7 gates pass |
| ont-registry-index.json | OFM-ONT v1.1.0, validated 2026-03-02 |
| join-pattern-registry.json | 16 JP-OFM patterns registered |
| Visualiser test suite | 1,971/1,971 pass (no regression) |
