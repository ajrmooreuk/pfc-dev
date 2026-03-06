# Changelog - Organization Context Ontology

All notable changes to the Organization Context Ontology will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.1] - 2026-01-20

### Changed
- **BREAKING:** Removed inline ValueProposition entity
- Value proposition details (pains, gains, solution, ICP, differentiator) now live in VSOM ontology
- Added `valuePropositionRefs` as array of references to VSOM ontology
- Added `valuePropositionRef` property to Brand and Product entities

### Rationale
Per call with Amanda (2026-01-20), value proposition is a separate concern that should be managed in its own ontology. Organization Context should only **reference** value propositions, not define them.

---

## [1.0.0] - 2026-01-20

### Added
- Initial release of Organization Context Ontology
- **12 Entities:**
  - OrganizationContext (root container)
  - Product (with segment support)
  - Brand (with primary brand flag)
  - ProductPortfolio (single/multi/ecommerce/service/hybrid)
  - CompetitiveLandscape (container for competitive data)
  - Competitor (with tracking preferences)
  - CompetitiveForce (Porter's Five Forces)
  - Trend (macro trends with impact assessment)
  - MarketContext (segments, geography, localization)
  - MarketSegment (target market definition)
  - CustomerNeed (high-level needs only)
  - OrganizationMaturity (multi-dimensional assessment)

- **6 Relationships:**
  - hasContext (Organization → Context)
  - hasValueProposition (Context/Brand/Product → VP)
  - MarketSegment.hasNeed
  - MarketSegment.shapedBy
  - Competitor.targets
  - Trend.impacts

- **4 Business Rules:**
  - BR-CTX-001: Context Links to Organization
  - BR-CTX-002: Competitor Limit (max 10)
  - BR-CTX-003: Maturity Scores Range (1-5)
  - BR-CTX-004: Value Proposition Reference Only

- **Maturity Dimensions (from Amanda's Figma):**
  - sizeMaturity (level, headcount, revenue)
  - valueMaturity
  - marketingMaturity (level, director, team size, roles)
  - technologyMaturity
  - complexityMaturity
  - aiMaturity (BAIV-specific)

- **Competitive Analysis:**
  - Competitor types: direct, indirect, aspirational, substitute
  - Porter forces support
  - Trend tracking with impact assessment
  - Citation and ranking tracking flags

- **Full OAA v4.0.0 artifact package:**
  - Registry entry v3.0.0
  - Glossary (JSON + Markdown) - 20 terms
  - Test data (60-20-10-10 distribution)
  - Validation report
  - Documentation

### Schema.org Mappings
- Product → schema:Product
- Brand → schema:Brand
- Product.name → schema:name
- Product.description → schema:description
- Product.category → schema:category
- Brand.name → schema:name

### Quality Metrics
- Completeness Score: 100%
- Competency Score: 95%
- Schema.org Alignment: 75%
- Test Data Coverage: 100%
- Confidence Score: 0.88

---

## Design Decisions Log

### DD-001: Value Proposition Separation (v1.0.1)
**Decision:** Move VP details to VSOM ontology  
**Date:** 2026-01-20  
**Participants:** Milana, Amanda (call transcript)  
**Rationale:** VP is strategic, managed separately, used across contexts  
**Impact:** Added valuePropositionRefs, removed inline VP structure

### DD-002: Segment-Level VPs for E-commerce (v1.0.0)
**Decision:** Define VPs at segment level, not product level  
**Date:** 2026-01-20  
**Participants:** Milana, Amanda  
**Rationale:** "Too much work" per Amanda; segment captures strategic positioning  
**Example:** "Work Shoes" segment VP for Shoe Carnival, not 500 individual product VPs

### DD-003: Maximum 10 Competitors (v1.0.0)
**Decision:** Limit tracked competitors to 10  
**Date:** 2026-01-20  
**Rationale:** Focus and manageability; more dilutes competitive intelligence

### DD-004: Multi-level Competitors (v1.0.0)
**Decision:** Support competitors at platform, client, and client's client levels  
**Date:** 2026-01-20  
**Participants:** Amanda (Figma diagrams)  
**Rationale:** "Competitors of BAIV, competitors of client, competitors of client's client"

---

## Migration Notes

### From v1.0.0 to v1.0.1
If you have contexts with inline value proposition data:
1. Extract VP data to VSOM ontology
2. Create VP entry in VSOM with unique ID
3. Replace inline VP with reference: `"valuePropositionRef": "vp:your-vp-id"`

---

## Roadmap

### Planned for v1.1.0
- [ ] Add ICP (Ideal Customer Profile) references
- [ ] Add competitive positioning matrix support
- [ ] Enhanced localization (timezone, tax region)

### Planned for v2.0.0
- [ ] Integration with external data sources (D&B, Clearbit)
- [ ] Real-time competitive intelligence updates
- [ ] AI-generated maturity assessments

---

## Contributors

- BAIV Platform Team (initial design)
- Amanda Moore (architecture, Figma diagrams)
- Milana (requirements, call transcript analysis)

---

**Document Version:** 1.0.1  
**Last Updated:** 2026-01-20
