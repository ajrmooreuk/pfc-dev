# IND-ONT: Individual Types — Design Brief

**Date:** 2026-02-20
**Series:** Foundation
**Version:** 1.0.0
**OAA Format:** v6.1.0
**Status:** Proposal / Prototype

---

## 1. Problem Statement

RRR-ONT models 48+ seller-side organisational roles (C-suite L0–L4 with RACI/RBAC). VP-ONT provides ICP with B2B/B2C/B2B2C enum and Stakeholder roles. ORG-ONT and ORG-CONTEXT-ONT define organisational and market context. But **no ontology models the types of individuals** who actually interact with products and services — beyond C-suite job titles — across both B2B organisational buyers and B2C consumers.

---

## 2. Architecture Decisions

| Decision | Resolution | Rationale |
|----------|-----------|-----------|
| **Series location** | **Foundation** | Market, Industry, and Org are Foundation concerns. IND-ONT defines individual archetypes at the same foundational level. |
| **B2B individual types** | **Subclass RRR roles + org relation** | B2B individuals inherit RACI/RBAC from their RRR subclass and carry a mandatory org relation. |
| **B2C individual types** | **Standalone Foundation entities** | No org hierarchy, no RRR subclass. Private individuals, not organisational positions. |
| **ICP relationship** | **ICP is the class, IND is the individual** | VP-ONT ICP defines the target segment (group). IND-ONT defines the types of individuals within that segment. Relationship: `populatesICP`. |
| **Customer journeys** | **PE-Series processes** | Journeys (awareness→decision→adoption) are processes — PE-Series. IND-ONT defines `PurchaseBehaviour` (how individuals enter/navigate) but the journey process itself belongs in PE. |
| **Market/Industry** | **Foundation patterns (ORG-CONTEXT)** | IndustryProfile references ORG-CONTEXT-ONT MarketSegment. IND-ONT does not redefine industry classification. |
| **Instance data** | **PFI brand/sub-brand ownership** | IndustryProfile.owningInstance identifies the PFI instance. Core archetypes are PFC-level; instance-specific types are brand-owned. |

---

## 3. Entity Model

### IndividualType (hub)
Archetype of a real person. B2B: subclasses RRR, has org. B2C: standalone.

### IndividualQualifier
Structured criteria (Financial, Behavioral, Psychographic, Contextual, Firmographic, Demographic) with operators and weights. Replaces flat demographic strings.

### IndustryProfile
Binds archetype to industry vertical. Instance data owned by PFI brand/sub-brand. References ORG-CONTEXT MarketSegment.

### PurchaseBehaviour
How the individual enters and navigates buying decisions. The journey process is PE — this describes behavioural tendencies.

---

## 4. Design Rules

| Rule | Summary |
|------|---------|
| DR-IND-001 | Channel-Category alignment: B2B→B2B_*, B2C→B2C_*, B2B2C→B2B2C_* |
| DR-IND-002 | B2B individuals MUST subclass RRR + have org relation |
| DR-IND-003 | B2C individuals MUST NOT have RRR/org references |
| DR-IND-004 | ICP is the class, IND is the individual — don't duplicate ICP attributes |
| DR-IND-005 | Customer journeys are PE processes — IND types are participants |
| DR-IND-006 | Industry/market follows Foundation ORG-CONTEXT patterns |
| DR-IND-007 | Instance data owned by PFI brand/sub-brand |
| DR-IND-008 | VP-RRR alignment preserved through IND |

---

## 5. Role Categories

**B2B** (6): Executive, Management, Professional, Procurement, EndUser, Technical
**B2C** (6): Enthusiast, Professional, Casual, Investor, Inheritor, Gifter
**B2B2C** (2): Intermediary, Reseller

---

## 6. Antiques Domain Individuals (Prototype)

| Individual | Channel | Category | VP Stakeholder | RRR Subclass | Org Relation |
|-----------|---------|----------|----------------|-------------|-------------|
| Serious Collector | B2C | Enthusiast | DecisionMaker | — | — |
| Inheritor/Beneficiary | B2C | Inheritor | Beneficiary | — | — |
| Hobbyist Collector | B2C | Casual | PrimaryUser | — | — |
| Antiques Investor | B2C | Investor | EconomicBuyer | — | — |
| Insurance Underwriter | B2B | Professional | TechnicalEvaluator | rrr:CRO | InsuranceCompany |
| Auction House Director | B2B | Executive | DecisionMaker | rrr:CEO | AuctionHouse |
| Interior Designer | B2B2C | Intermediary | Influencer | — | — |

All instances owned by **PFI-BAIV**.

---

## 7. Cross-Ontology Bridges

```
IND → RRR:  subclassesRRRRole (B2B only)
IND → ORG:  hasOrgRelation (B2B only)
IND → VP:   populatesICP (ICP is the class, IND is the individual)
IND → ORG-CONTEXT: industryProfileMapsToMarket
IND → PE:   IndividualTypes participate in PE journey processes (DR-IND-005)
IND → ANTIQUES: mapsToDomainEntity (domain bridge)
```

---

## 8. Counts

- 4 entities, 9 relationships, 8 business rules, 8 design rules, 11 enums
- 7 Antiques individual type instances (prototype)

---

## 9. Files

- `Foundation/IND-ONT/ind-v1.0.0-oaa-v6.json` — Schema + Antiques instances
- `Foundation/IND-ONT/Entry-ONT-INDT-001.json` — Registry entry (INDT prefix avoids collision with INDUSTRY-ONT's IND)
- `Foundation/IND-ONT/BRIEF-IND-ONT.md` — This document
