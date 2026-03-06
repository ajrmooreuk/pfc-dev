# Organization Context Ontology Glossary v1.0.0

**Ontology:** Organization Context Ontology  
**Version:** 1.0.0  
**Date:** 2026-01-20  
**Term Count:** 20

---

## Core Entities

### OrganizationContext
**Term ID:** TERM-CTX-001  
**Definition:** Rich context container for an organization that links to all contextual sub-entities including products, brands, competitors, market segments, and maturity levels  
**Schema.org Mapping:** None (custom composite)  
**Data Type:** Object  
**Required:** Yes  
**Example:** `ctx:foot-scientific`  
**Notes:** Primary entry point for agent context about an organization

### Product
**Term ID:** TERM-CTX-002  
**Definition:** A product or service offered by the organization  
**Schema.org Mapping:** `schema:Product`  
**Data Type:** Object  
**Required:** No  
**Example:** Custom Orthotics - Medical Device product from Foot Scientific  
**Notes:** Value proposition details live in VSOM ontology, not here

### Brand
**Term ID:** TERM-CTX-003  
**Definition:** A brand owned by the organization, which may have its own value proposition  
**Schema.org Mapping:** `schema:Brand`  
**Data Type:** Object  
**Required:** No  
**Example:** Foot Scientific brand  
**Notes:** Brand-level value propositions are more strategic than product-level

### ProductPortfolio
**Term ID:** TERM-CTX-004  
**Definition:** Structured view of organization's product/service offerings  
**Constraints:** portfolioType: `single_product`, `multi_product`, `ecommerce`, `service`, `hybrid`  
**Example:** E-commerce portfolio with 500 products across 5 segments

---

## Competitive Analysis Entities

### CompetitiveLandscape
**Term ID:** TERM-CTX-005  
**Definition:** Competitive environment context including named competitors, Porter forces, and market trends  
**Constraints:** Maximum 10 tracked competitors per organization  
**Example:** Foot Scientific competitive landscape with Superfeet and Powerstep

### Competitor
**Term ID:** TERM-CTX-006  
**Definition:** Named competitor organization with analysis  
**Properties:** type (direct/indirect/aspirational/substitute), priority (1-5), strengths, weaknesses, trackCitations, trackRankings  
**Example:** Superfeet - direct competitor, priority 1

### CompetitiveForce
**Term ID:** TERM-CTX-007  
**Definition:** Porter-style competitive force affecting the market  
**Force Types:** `threat_of_new_entrants`, `threat_of_substitutes`, `bargaining_power_buyers`, `bargaining_power_suppliers`, `competitive_rivalry`  
**Intensity:** low / medium / high

### Trend
**Term ID:** TERM-CTX-008  
**Definition:** Macro trend affecting the market  
**Types:** regulatory, technological, economic, social, environmental, political  
**Impact:** positive / negative / neutral / uncertain  
**Timeframe:** immediate / short_term / medium_term / long_term

---

## Market Context Entities

### MarketContext
**Term ID:** TERM-CTX-009  
**Definition:** Market segments, geography, and localization context  
**Contains:** marketSegments, customerNeeds, geographicScope, localization

### MarketSegment
**Term ID:** TERM-CTX-010  
**Definition:** Target market segment defined by industry, geography, size, and priority  
**Priority:** primary / secondary / emerging  
**Example:** Podiatry Clinics - primary segment in Healthcare

### CustomerNeed
**Term ID:** TERM-CTX-011  
**Definition:** High-level customer need identifier  
**Types:** `job_to_be_done`, `pain_point`, `value_driver`, `unmet_need`  
**Priority:** critical / high / medium / low  
**Note:** Detailed pains/gains live in Value Proposition Ontology

---

## Maturity Entities

### OrganizationMaturity
**Term ID:** TERM-CTX-012  
**Definition:** Organization maturity assessment across multiple dimensions  
**Dimensions:** sizeMaturity, valueMaturity, marketingMaturity, technologyMaturity, complexityMaturity, aiMaturity  
**Scale:** 1-5 for all dimensions

### sizeMaturity
**Term ID:** TERM-CTX-014  
**Properties:** level (1-5), headcount, revenue, revenueCurrency  
**Example:** Level 2, 75 employees, $8M USD

### marketingMaturity
**Term ID:** TERM-CTX-015  
**Properties:** level (1-5), hasMarketingDirector, marketingTeamSize, functionalRoles  
**Example:** Level 2, no marketing director, 2 team members

### aiMaturity
**Term ID:** TERM-CTX-016  
**Levels:** unaware → exploring → experimenting → implementing → optimizing  
**Properties:** maturityLevel, aiToolsInUse, aiVisibilityAwareness, currentAIStrategy

---

## Key Properties

### valuePropositionRef
**Term ID:** TERM-CTX-013  
**Definition:** Reference to value proposition in VSOM ontology (not the actual details)  
**Example:** `vp:foot-scientific-brand`

### trackCitations
**Term ID:** TERM-CTX-017  
**Definition:** Whether to track AI platform citations for a competitor  
**Default:** true

### trackRankings
**Term ID:** TERM-CTX-018  
**Definition:** Whether to track search rankings for a competitor  
**Default:** true

### localization
**Term ID:** TERM-CTX-019  
**Properties:** baseCurrency, baseGeography, languages  
**Example:** USD, United States, en-US

### segment
**Term ID:** TERM-CTX-020  
**Definition:** Product segment within a portfolio  
**Example:** "Work Shoes" segment for Shoe Carnival  
**Note:** Value propositions typically at segment level, not product level

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0.0 | 2026-01-20 | Initial release | BAIV Platform Team |
