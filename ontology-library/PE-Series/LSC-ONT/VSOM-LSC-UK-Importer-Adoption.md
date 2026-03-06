# VSOM: LSC-ONT Adoption for UK Specialist Importer

**Ontology:** LSC-ONT v1.2.0 (Logistics & Supply-Chain Ontology)
**Adoption Context:** UK-based specialist food importer sourcing internationally
**Source Corridors:** Australia, New Zealand, Iceland, Ireland
**Date:** 2026-02-23
**Status:** Proposal

---

## Vision

**Become the UK's most resilient specialist importer by using graph-based supply chain intelligence to detect disruptions early, predict cascading impacts, and proactively protect customer relationships — turning logistics visibility into competitive advantage.**

A UK specialist importer operating across four distinct cold-chain corridors (AU, NZ, IS, IE) faces compounding risk: each corridor has different regulatory regimes, transit times, seasonal patterns, and failure modes. Today, disruptions are discovered reactively — a vessel delay becomes a missed delivery window becomes a lost customer. The LSC-ONT adoption transforms this from reactive firefighting to predictive, graph-driven supply chain management.

The importer deploys LSC-ONT as a living operational graph: every corridor, node, leg, compliance gate, bottleneck, and party is modelled as structured data. Hypotheses are tested against historical patterns. Scenarios are pre-computed. Cascade effects are mapped before they happen. The result: when a disruption occurs at any point in any corridor, the importer already knows what it means for every affected shipment, every downstream customer, and every financial exposure — and has a pre-planned response ready.

The customer sees a partner who communicates proactively ("your Icelandic cod shipment may be delayed 3 days due to North Atlantic weather — we've already rerouted via alternative carrier and your revised delivery date is confirmed") rather than reactively ("sorry, your order is late, we don't know when it will arrive").

---

## Strategies

### S1: Multi-Corridor Graph Intelligence

**Build a unified supply chain graph across all four source corridors, enabling cross-corridor visibility, comparison, and substitution.**

Each corridor (AU→UK, NZ→UK, IS→UK, IE→UK) is modelled as a distinct `lsc:SupplyChain` with its own nodes, legs, compliance gates, and risk profiles. But because they share a common ontology, the importer can:

- **Compare corridor risk** — AU meat via Suez has a composite risk score of 14.2; IE dairy via Irish Sea ferry scores 3.1. The graph makes this visible instantly.
- **Identify substitution opportunities** — when the AU corridor is disrupted, can NZ supply the same commodity class? The graph knows both corridors' `commodityClass`, capacity, and transit times.
- **Aggregate bottleneck exposure** — if UK port congestion at Felixstowe affects both AU and NZ corridors simultaneously, the graph calculates total exposure across all affected shipments.
- **Normalise compliance requirements** — AU DAFF export certification vs NZ MPI vs Iceland MAST vs Ireland DAFM. Each gate is modelled as `lsc:ComplianceGate` with authority, pass rate, and failure consequence. The importer sees one unified compliance landscape.

**LSC-ONT entities used:** SupplyChain, ChainNode, ShipmentLeg, ComplianceGate, Party
**Join patterns:** JP-LSC-001 (End-to-End Journey Traversal), JP-LSC-009 (Corridor Market & Jurisdiction Roll-Up)

---

### S2: Early Warning & Predictive Pattern Detection

**Deploy predictive patterns and hypothesis testing to detect disruptions before they reach the importer's shipments.**

The importer doesn't wait for incidents — the graph watches for leading indicators:

- **Seasonal patterns** — AU export volumes spike Oct-Dec (Southern Hemisphere spring lamb); Icelandic fishing quotas reset annually; Irish dairy peaks May-Sep. `lsc:PredictivePattern` with `leadIndicators` and `leadTimeDays` gives advance warning.
- **Geopolitical signals** — Suez Canal disruption risk (Houthi activity), EU/UK regulatory divergence post-Brexit, Australian trade policy shifts. Each is a pattern with `reliability` scoring.
- **Carrier reliability** — historical on-time performance per carrier per route. `lsc:Hypothesis` with `confidenceLevel` and `iterationCount` tracks whether "Maersk AU→UK via Suez arrives within 32 days 85% of the time" still holds.
- **Cold chain integrity trends** — temperature excursion frequency by season, by carrier, by container age. Patterns with `confidenceTrend: "Weakening"` trigger proactive container upgrades.

The importer builds a library of 50-100 predictive patterns across all corridors. Each pattern feeds into scenario planning (S3) and customer communication (S4).

**LSC-ONT entities used:** PredictivePattern, Hypothesis, ColdChainEvent, Bottleneck
**Join patterns:** JP-LSC-006 (Cold Chain Integrity Trace)
**Business rules:** BR-LSC-015 (Hypothesis requires measurement), BR-LSC-019 (Pattern reliability threshold)

---

### S3: Scenario Planning & Cascade Impact Modelling

**Pre-compute probabilistic scenarios for every major disruption type, with cascading impact chains quantified to net financial exposure.**

For each corridor, the importer maintains a library of pre-modelled scenarios:

| Scenario | Corridors Affected | Probability | Transit Impact | Financial Impact |
|---|---|---|---|---|
| Suez Canal closure | AU, NZ | 0.08 | +12-15 days | +35% shipping cost |
| UK port strike | All | 0.12 | +5-10 days | Demurrage + storage |
| AU DAFF export ban (disease) | AU | 0.03 | Total halt | Contract breach |
| North Atlantic storm season | IS, IE | 0.40 (seasonal) | +2-5 days | Minor |
| Brexit regulatory tightening | IE, IS (EEA) | 0.15 | +1-3 days at BCP | Documentation rework |
| Cold storage capacity crunch (UK) | All | 0.20 (Christmas) | Storage overflow | +AUD 8,000/container |

Each scenario has:
- **Cascade chains** — port delay → storage overflow → cost escalation → shelf life erosion → spoilage risk → customer delivery failure → contract breach. `lsc:CascadeEffect` with `cascadeLeadsTo` models the full domino chain.
- **Net financial impact** — gross loss minus insurance recovery minus carrier claims = actual bottom-line hit. `lsc:ImpactAssessment` with `netFinancialImpact` and `annualisedExposure`.
- **Pre-planned responses** — for each scenario, the `mitigationPlan` is already written. When the scenario triggers, the response is immediate, not improvised.
- **Customer impact mapping** — which end customers are affected by which scenarios, enabling proactive communication (S4).

**LSC-ONT entities used:** Scenario, CascadeEffect, ImpactAssessment, Bottleneck, RiskAssessment
**Join patterns:** JP-LSC-002 (Bottleneck Heat Map), JP-LSC-005 (Net Impact Cascade)
**Business rules:** BR-LSC-016 (Scenario probability bound), BR-LSC-017 (Cascade chain depth), BR-LSC-009 (Net impact calculation)

---

### S4: Proactive Customer Relationship Protection

**Use graph-driven intelligence to communicate proactively with UK end customers, maintaining trust through transparency and pre-emptive action.**

The importer's UK customers (restaurants, retailers, wholesalers, food service distributors) experience supply chain disruptions as broken promises. The LSC-ONT adoption inverts this:

- **Early notification** — when a predictive pattern triggers or a scenario begins materialising, the importer calculates which customers are affected (via `lsc:Shipment → travelsChain → SupplyChain` and `lsc:affectsShipment`), what the revised delivery window is, and what alternatives are available.
- **Alternative sourcing** — "Your AU lamb order is delayed 5 days due to vessel rescheduling. We can offer NZ lamb from the same commodity class arriving 2 days earlier. Shall we substitute?" The graph knows commodity equivalence across corridors.
- **Shelf life transparency** — `lsc:Shipment.shelfLifeRemaining` at each node means the importer can guarantee remaining shelf life at delivery. "Your Icelandic cod will arrive with 18 days of shelf life remaining" builds trust.
- **Outbound logistics optimisation** — the importer's own UK distribution (warehouse → customer) is also modelled as chain nodes and legs. When inbound disruption cascades to outbound delivery windows, the graph recalculates optimal distribution sequencing.
- **Incident post-mortem sharing** — after resolution, `lsc:Incident.lessonLearned` and updated `lsc:PredictivePattern` data is shared with key customers to demonstrate continuous improvement.

**LSC-ONT entities used:** Shipment, Incident, Escalation, Party, ColdChainEvent
**Join patterns:** JP-LSC-003 (Incident Escalation Chain), JP-LSC-004 (Compliance Gate Document Flow)
**Business rules:** BR-LSC-010 (Shelf life monitoring), BR-LSC-008 (Incident requires escalation)

---

### S5: Compliance & Documentation Readiness

**Maintain 100% document readiness across all corridors, eliminating compliance gate failures as a source of delay.**

Each corridor has different regulatory requirements:
- **AU→UK**: DAFF health certificates, AQIS export permits, UK APHA import checks, IPAFFS pre-notification, CHED-P at BCP
- **NZ→UK**: MPI export certification, similar UK import pathway
- **IS→UK**: MAST certificates, EEA/EFTA trade rules, UK BCP checks
- **IE→UK**: DAFM certs, Northern Ireland Protocol complexities, Windsor Framework

The graph tracks every `lsc:TradeDocument` required at every `lsc:ComplianceGate`, with `validFrom/validTo`, `leadTimeDays`, and `rejectionRisk`. The importer:

- **Pre-flights documents** before shipment departure — JP-LSC-004 walks the full document requirement chain
- **Monitors validity windows** — BR-LSC-013 ensures all documents are valid at gate arrival
- **Tracks rejection patterns** — historical `passRate` per gate per corridor identifies where to invest in document quality
- **Maps to GRC framework** — `lsc:mapsToGRCRequirement` links logistics compliance to the importer's overall governance obligations

**LSC-ONT entities used:** TradeDocument, ComplianceGate, Party
**Join patterns:** JP-LSC-004 (Compliance Gate Document Flow), JP-LSC-007 (Logistics-to-Governance Bridge)
**Business rules:** BR-LSC-006 (Mandatory gate documentation), BR-LSC-013 (Document validity at gate), BR-LSC-014 (Inspection failure consequence)

---

### S6: Escalation & Risk Mitigation Framework

**Implement a structured 5-level escalation pathway with pre-assigned authorities, time windows, and financial limits for every incident type.**

The importer operates across time zones (AU +10/+11, NZ +12/+13, IS +0, IE +0/+1, UK +0/+1). Escalation must be:

- **Time-zone aware** — L0 auto-resolve handles minor alerts during off-hours. L1 operational teams in each source country respond within 2 hours during business hours.
- **Financially bounded** — L1 can authorise up to GBP 5,000 in re-routing costs. L2 management up to GBP 25,000. L3 executive up to GBP 100,000. L4 external (insurers, regulators) for catastrophic events.
- **Pre-scripted** — each `lsc:Escalation` level has `prescribedActions` and `decisionAuthority`. No improvisation under pressure.
- **Cascade-aware** — when an incident triggers cascading effects, the escalation level is automatically raised. BR-LSC-020 ensures unintended critical cascades are always tracked.

Risk mitigations are maintained as a living portfolio:
- Dual-carrier arrangements per corridor (preventive)
- Real-time temperature monitoring with automated alerts (detective)
- Pre-negotiated alternative cold storage at UK ports (corrective)
- Insurance coverage reviewed quarterly per corridor risk profile (compensating)

**LSC-ONT entities used:** Incident, Escalation, RiskMitigation, RiskAssessment, ImpactAssessment
**Join patterns:** JP-LSC-003 (Incident Escalation Chain), JP-LSC-005 (Net Impact Cascade)
**Business rules:** BR-LSC-005 (Escalation level progression), BR-LSC-008 (Critical incident escalation), BR-LSC-011 (Critical path delay), BR-LSC-012 (Risk score composite), BR-LSC-020 (Unintended cascade tracking)

---

## BSC Objectives

### Financial Perspective

| ID | Objective | Target | Timeline |
|---|---|---|---|
| OBJ-F1 | Reduce annualised disruption cost | -40% vs baseline year 1, -60% year 2 | 24 months |
| OBJ-F2 | Improve insurance recovery rate | 70% → 85% of gross impact recovered | 12 months |
| OBJ-F3 | Reduce demurrage and detention charges | -50% through predictive rerouting | 18 months |
| OBJ-F4 | Increase corridor cost transparency | Full net-impact visibility across all 4 corridors | 6 months |
| OBJ-F5 | Reduce spoilage/write-off losses | -65% through cold chain integrity monitoring | 12 months |

### Customer Perspective

| ID | Objective | Target | Timeline |
|---|---|---|---|
| OBJ-C1 | Proactive disruption notification | 90% of disruptions communicated before customer-noticed | 12 months |
| OBJ-C2 | On-time delivery rate (OTIF) | 92% → 97% across all corridors | 18 months |
| OBJ-C3 | Customer satisfaction (NPS) | +15 points through transparency and reliability | 24 months |
| OBJ-C4 | Shelf life guarantee at delivery | 100% of shipments meet minimum shelf life commitment | 12 months |
| OBJ-C5 | Alternative sourcing response time | Offer substitute within 4 hours of corridor disruption | 6 months |

### Internal Process Perspective

| ID | Objective | Target | Timeline |
|---|---|---|---|
| OBJ-P1 | Document readiness rate | 100% pre-flight pass before shipment departure | 6 months |
| OBJ-P2 | Compliance gate first-pass rate | 95% across all corridors (from 88% baseline) | 12 months |
| OBJ-P3 | Mean time to detect disruption | Reduce from 18 hours to 2 hours | 6 months |
| OBJ-P4 | Mean time to activate mitigation | Reduce from 48 hours to 4 hours | 12 months |
| OBJ-P5 | Scenario library coverage | Pre-computed scenarios for 80% of historical incident types | 6 months |
| OBJ-P6 | Predictive pattern library | 50+ validated patterns across all 4 corridors | 18 months |

### Learning & Growth Perspective

| ID | Objective | Target | Timeline |
|---|---|---|---|
| OBJ-L1 | Graph literacy | All operations staff trained on LSC-ONT graph navigation | 3 months |
| OBJ-L2 | Hypothesis iteration rate | 10+ hypotheses tested per corridor per quarter | Ongoing |
| OBJ-L3 | Post-incident learning capture | 100% of resolved incidents have lessonLearned populated | 6 months |
| OBJ-L4 | Cross-corridor knowledge transfer | Patterns validated in one corridor tested in others | Ongoing |
| OBJ-L5 | Supplier collaboration | Key suppliers (top 5 per corridor) onboarded to shared visibility | 24 months |

---

## Metrics & KPIs

### Leading Indicators (Predictive)

| KPI | Measurement | Source Entity | Frequency |
|---|---|---|---|
| Active predictive patterns | Count of patterns with reliability > 0.6 | PredictivePattern | Monthly |
| Open hypotheses under test | Count of Hypothesis.status = Active | Hypothesis | Weekly |
| Scenario coverage ratio | Pre-modelled scenarios / known incident types | Scenario | Quarterly |
| Document pre-flight pass rate | Documents valid before shipment departure | TradeDocument | Per shipment |
| Bottleneck mitigation coverage | Bottlenecks with effectiveness = High mitigations | Bottleneck, RiskMitigation | Monthly |
| Cold chain excursion trend | Temperature breaches per 1,000 shipment-hours | ColdChainEvent | Weekly |

### Lagging Indicators (Outcome)

| KPI | Measurement | Source Entity | Frequency |
|---|---|---|---|
| OTIF (On-Time In-Full) | Shipments delivered within committed window | Shipment | Monthly |
| Net disruption cost | Sum of ImpactAssessment.netFinancialImpact | ImpactAssessment | Monthly |
| Annualised loss exposure | Sum of annualisedExposure across active risks | ImpactAssessment | Quarterly |
| Compliance gate failure rate | Gate failures / total gate passages | ComplianceGate | Monthly |
| Mean time to detect (MTTD) | Average Incident.timeToDetect | Incident | Monthly |
| Mean time to resolve (MTTR) | Average Incident.timeToResolve | Incident | Monthly |
| Escalation depth ratio | Incidents reaching L3+ / total incidents | Escalation | Quarterly |
| Customer proactive notification rate | Disruptions notified before customer contact / total disruptions | Incident, Shipment | Monthly |
| Spoilage rate | Write-offs / total shipments | Shipment | Monthly |
| Insurance recovery ratio | Total recovered / total gross impact | ImpactAssessment | Quarterly |

### Corridor-Specific KPIs

| Corridor | Key Risk | Primary KPI | Target |
|---|---|---|---|
| AU→UK | Transit time (28-35 days), Suez risk | Transit variance vs predicted | < 3 days variance 85% of time |
| NZ→UK | Longest corridor (35-42 days), shelf life | Shelf life remaining at UK arrival | > 21 days for chilled |
| IS→UK | North Atlantic weather, seasonal quotas | Weather delay frequency Q4 | < 2 delays per month |
| IE→UK | Windsor Framework complexity, short shelf life | BCP clearance time | < 6 hours 95% of time |

---

## Implementation Roadmap

### Phase 1: Foundation (Months 1-3)
- Model all 4 corridors as LSC-ONT SupplyChains with nodes, legs, gates
- Import historical incident data (24 months) into the graph
- Establish baseline metrics for all KPIs
- Train operations team on graph navigation

### Phase 2: Intelligence (Months 4-9)
- Build predictive pattern library from historical data
- Deploy hypothesis testing on transit time and cold chain reliability
- Pre-compute top 20 scenarios per corridor
- Implement document pre-flight automation

### Phase 3: Proactive Operations (Months 10-18)
- Activate early warning system (pattern → alert → escalation)
- Implement proactive customer notification workflow
- Deploy cross-corridor substitution engine
- Onboard key suppliers to shared visibility

### Phase 4: Competitive Advantage (Months 19-24)
- Achieve 97% OTIF across all corridors
- Offer shelf life guarantees as commercial differentiator
- Publish corridor reliability indices to attract new customers
- Extend model to additional source countries (South Africa, Chile, Argentina)

---

## Cross-Ontology Integration

| Bridge | Purpose | LSC-ONT Relationship |
|---|---|---|
| LSC → PE-ONT | Map corridors to PE process definitions for workflow automation | `mapsToProcess` |
| LSC → ORG-ONT | Link logistics parties to Foundation organisation records | `partyMapsToOrg` |
| LSC → RRR-ONT | Map party responsibilities to functional roles (risk/requirement/result) | `partyMapsToRole` |
| LSC → GRC-FW-ONT | Connect compliance gates to governance requirements | `mapsToGRCRequirement` |
| LSC → ORG-CONTEXT-ONT | Roll up party maturity, market context, and jurisdiction | `partyHasOrgContext`, `operatesInMarket`, `nodeInJurisdiction` |

---

*This VSOM is designed as a PFI-instance adoption blueprint. The UK importer would instantiate LSC-ONT with corridor-specific data (similar to `lsc-instances-au-uk-meat-v0.1.0.json`) for each of the four source corridors, building a unified multi-corridor graph that powers all six strategies.*
