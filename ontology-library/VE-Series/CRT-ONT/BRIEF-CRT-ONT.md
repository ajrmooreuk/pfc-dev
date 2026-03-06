# CRT-ONT: Customer Role Taxonomy — Design Brief

**Date:** 2026-02-20
**Series:** VE-Series
**Version:** 1.0.0
**OAA Format:** v6.1.0
**Status:** Compliant (all 8 gates pass)

---

## 1. Problem Statement

VP-ONT provides Stakeholder and IdealCustomerProfile but treats customer-side roles generically. RRR-ONT models 48+ seller-side organisational roles. ORG-CONTEXT-ONT defines market segments and organisational context. But **no ontology provides a structured taxonomy of customer-side role archetypes** — the B2B buyer roles (Economic Buyer, Technical Evaluator, Champion), B2C consumer archetypes (Enthusiast, Casual, Investor), and B2B2C intermediary roles (Recommender, Intermediary) who actually make or influence purchase decisions.

CRT-ONT fills this gap with a universal customer role taxonomy that maps cleanly to VP-ONT stakeholders, RRR-ONT organisational roles (for B2B), and ORG-CONTEXT industry/segment context.

---

## 2. Architecture Decisions

| Decision | Resolution | Rationale |
|----------|-----------|-----------|
| **Series location** | **VE-Series** | Customer roles directly serve value engineering — who the value proposition targets. |
| **B2B role mapping** | **Mandatory RRR cross-ref** | B2B buyer roles must map to RRR-ONT ExecutiveRole or FunctionalRole for org-chart alignment. |
| **B2C roles** | **No RRR requirement** | B2C consumers are standalone — no org hierarchy, no RACI/RBAC inheritance. |
| **VP bridge** | **Mandatory for all roles** | Every CustomerRole must map to at least one VP-ONT Stakeholder via `mapsToStakeholder`. |
| **ICP relationship** | **CRT feeds ICP** | CustomerRole → `mapsToICP` → VP IdealCustomerProfile. CRT provides the role archetypes that populate ICPs. |
| **Industry context** | **Via IndustryRoleProfile** | Industry-specific role nuances captured in IndustryRoleProfile, which maps to ORG-CONTEXT MarketSegment. |
| **Purchase patterns** | **Separate entity** | PurchasePattern captures recurring buying behaviour — may be shared across multiple CustomerRoles. |
| **Qualification** | **Structured RoleQualifier** | Replaces flat demographic strings with typed criteria (Firmographic, Demographic, Psychographic, Behavioural, Technographic, Contextual). |
| **VP-RRR alignment** | **Preserved through CRT** | Standing VP↔RRR convention (Problem→Risk, Solution→Requirement, Benefit→Result) applies — CRT role-specific problems/solutions/benefits feed VP-RRR alignment. |

---

## 3. Entity Model

### CustomerRole (hub)
Central archetype representing a customer-side role across B2B, B2C, and B2B2C channels. Not an individual person — a role pattern with channel context, category classification, and mandatory VP stakeholder mapping.

### RoleQualifier
Structured qualification criteria defining when a contact/organisation matches a given CustomerRole. Supports firmographic (B2B), demographic/psychographic (B2C), and contextual (B2B2C) qualification paths. Optional match scoring for agentic role assignment.

### IndustryRoleProfile
Industry-specific instantiation of a CustomerRole — how the role behaves within a particular vertical. Links to ORG-CONTEXT MarketSegment. Captures industry-specific buyer journey, price sensitivity, and engagement norms.

### PurchasePattern
Structured model of recurring purchase behaviour — how, when, and why buying decisions are made. May be shared across multiple CustomerRoles with similar patterns.

---

## 4. Business Rules

| Rule | Summary | Severity |
|------|---------|----------|
| BR-CRT-001 | B2B roles MUST have `rrrRoleRef` and `mapsToOrgRole` relationship | error |
| BR-CRT-002 | All roles MUST have `vpStakeholderType` and `mapsToStakeholder` relationship | error |
| BR-CRT-003 | IndustryRoleProfiles MUST reference valid ORG-CONTEXT MarketSegment | error |
| BR-CRT-004 | Production roles SHOULD have at least one RoleQualifier | warning |

---

## 5. Role Categories

**Channel:**
- **B2B** — organisational buyers with RRR mapping and org-chart alignment
- **B2C** — standalone consumers, no org hierarchy
- **B2B2C** — intermediaries bridging B2B suppliers and B2C end-consumers

**Category Enum (14 values):**
EconomicBuyer, TechnicalEvaluator, EndUser, Champion, Influencer, Gatekeeper, DecisionMaker, Beneficiary, Recommender, Intermediary, ConsumerAdvocate, PriceSeeker, LoyaltySeeker, ImpulseConsumer

---

## 6. Enums

| Enum | Values |
|------|--------|
| channel | B2B, B2C, B2B2C |
| category | 14 values (see above) |
| criteriaType | Firmographic, Demographic, Psychographic, Behavioural, Technographic, Contextual |
| decisionStyle | RationalAnalytical, RelationshipDriven, RiskAverse, InnovationSeeker, PriceOptimiser |
| buyerJourneyType | TransactionalShort, ConsultativeComplex, SubscriptionRenewal, TenderProcurement, ImpulseDirect, PartnerChannelMediated |
| budgetAuthority | Full, Partial, None |
| typicalEngagement | SelfServe, ConsultationLed, PartnerMediated, DirectSales |
| priceElasticity | High, Medium, Low |
| purchaseFrequency | OneOff, Annual, Quarterly, Recurring |

---

## 7. Cross-Ontology Bridges

```
CRT → VP:          mapsToStakeholder (mandatory, all roles)
CRT → VP:          mapsToICP (roles feed ICP construction)
CRT → RRR:         mapsToOrgRole (mandatory for B2B roles)
CRT → ORG-CONTEXT: mapsToIndustry (IndustryRoleProfile → MarketSegment)
CRT → ORG-CONTEXT: mapsToFirmographic (RoleQualifier → OrganizationContext)
```

### Join Patterns

| Pattern | Path | Use Case |
|---------|------|----------|
| JP-CRT-001 | CustomerRole → mapsToStakeholder → vp:Stakeholder | VP targeting |
| JP-CRT-002 | CustomerRole[B2B] → mapsToOrgRole → rrr:Role | Org-chart alignment |
| JP-CRT-003 | CustomerRole → mapsToICP → vp:IdealCustomerProfile | ICP construction |
| JP-CRT-004 | IndustryRoleProfile → mapsToIndustry → org-ctx:MarketSegment | Sector context |
| JP-CRT-005 | RoleQualifier → mapsToFirmographic → org-ctx:OrganizationContext | Firmographic linkage |

---

## 8. Instance Data

### VHF Nutrition (B2C — 6 roles)
| Role | Channel | Category | VP Stakeholder |
|------|---------|----------|----------------|
| Fitness Enthusiast | B2C | Enthusiast | DecisionMaker |
| Nutrition-Conscious Consumer | B2C | Casual | PrimaryUser |
| Athlete | B2C | Professional | PrimaryUser |
| Dietitian | B2B2C | Intermediary | Influencer |
| Parent / Carer | B2C | Casual | PrimaryUser |
| Health Investor | B2C | Investor | EconomicBuyer |

### ANTQ Antiques & Collectibles (19 roles: 10 B2B + 7 B2C + 2 B2B2C)

**B2B (10):** Auction House, Antiques Dealer, Insurance Specialist, Museum Curator, Restorer/Conservator, Interior Designer, Fine Art Shipping, Investment Fund, Trade Association, Online Marketplace

**B2C (7):** Private Collector, Inheritor, Downsizer, Gift Buyer, Treasure Hunter, Hobbyist Collector, High-Net-Worth Collector

**B2B2C (2):** Estate Agent/Probate Solicitor, Wealth Adviser/Financial Planner

---

## 9. Counts

- 4 entities, 9 relationships (4 internal + 5 cross-ontology), 4 business rules
- 9 enums (43 total enum values)
- 5 join patterns
- 25 instance roles across 2 PFI instances

---

## 10. Relationship to IND-ONT

CRT-ONT and IND-ONT are complementary but distinct:

| Aspect | CRT-ONT | IND-ONT |
|--------|---------|---------|
| **Series** | VE-Series | Foundation |
| **Focus** | Customer role archetypes (who buys) | Individual type archetypes (who the person is) |
| **VP bridge** | mapsToStakeholder | populatesICP |
| **RRR bridge** | mapsToOrgRole (B2B) | subclassesRRRRole (B2B) |
| **Depth** | Role taxonomy + qualifiers + purchase patterns | Individual archetype + qualifiers + industry profile + purchase behaviour |
| **Use case** | Go-to-market role segmentation | Deep individual-level modelling with org relations |

CRT provides the role taxonomy for value proposition targeting. IND provides the deeper individual archetype model with richer qualifier weighting and organisational context. Both feed VP-ONT.

---

## 11. Files

- `VE-Series/CRT-ONT/pf-CRT-ONT-v1.0.0.jsonld` — Schema
- `VE-Series/CRT-ONT/Entry-ONT-CRT-001.json` — Registry entry
- `VE-Series/CRT-ONT/instance-data/crt-vhf-nutrition-roles-v1.0.0.jsonld` — VHF instance (6 roles)
- `VE-Series/CRT-ONT/instance-data/crt-antiques-roles-v1.0.0.jsonld` — ANTQ instance (19 roles)
- `VE-Series/CRT-ONT/BRIEF-CRT-ONT.md` — This document
