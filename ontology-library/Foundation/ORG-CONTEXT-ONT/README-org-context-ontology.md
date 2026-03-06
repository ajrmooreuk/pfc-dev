# Organization Context Ontology

**Version:** 1.0.1  
**Status:** Draft  
**Registry Entry:** ONT-ORG-CTX-001  
**Last Updated:** 2026-01-20

---

## Overview

The Organization Context Ontology provides rich contextual information about organizations, enabling agents to understand market position, competitive landscape, products, brands, and organizational capabilities. This ontology complements the base Organization Ontology by adding depth without bloating the core entity.

## Purpose

- Provide **rich context** for AI agents about organizations
- Model **competitive landscape** including competitors, forces, and trends
- Define **market context** with segments, customer needs, and localization
- Track **organizational maturity** across multiple dimensions
- Support **value proposition references** (details in VSOM ontology)

## Key Design Decisions

### 1. Value Proposition References Only
This ontology **does not contain** value proposition details (pains, gains, solution, ICP). It only holds **references** to value propositions defined in the VSOM ontology.

```json
"valuePropositionRefs": ["vp:foot-scientific-brand"]
```

**Rationale:** Value propositions are strategic documents that may be managed separately and used across multiple contexts.

### 2. Segment-Level Value Propositions
For e-commerce and multi-product businesses, value propositions are defined at the **segment level** (e.g., "Work Shoes"), not individual product level.

**Rationale:** Per discussion with Amanda - individual product VPs would be "too much work" and segment-level captures the strategic positioning.

### 3. Maximum 10 Competitors
Organizations can track up to 10 competitors maximum.

**Rationale:** Focus and manageability - more than 10 dilutes competitive intelligence efforts.

### 4. Maturity Dimensions
Based on Amanda's Figma diagrams:
- **Size** (headcount, revenue)
- **Value** (value delivery capability)
- **Marketing** (team, roles, capabilities)
- **Technology** (digital maturity)
- **Complexity** (ability to manage complexity)
- **AI** (AI readiness and visibility awareness)

---

## Entities

| Entity | Description | Schema.org |
|--------|-------------|------------|
| OrganizationContext | Root context container | Custom |
| Product | Product/service offering | schema:Product |
| Brand | Organization's brand | schema:Brand |
| ProductPortfolio | Portfolio structure | Custom |
| CompetitiveLandscape | Competitive environment | Custom |
| Competitor | Named competitor | Custom |
| CompetitiveForce | Porter force | Custom |
| Trend | Market trend | Custom |
| MarketContext | Market environment | Custom |
| MarketSegment | Target segment | Custom |
| CustomerNeed | High-level need | Custom |
| OrganizationMaturity | Maturity assessment | Custom |

---

## Dependencies

| Ontology | Relationship |
|----------|-------------|
| Organization Ontology | **Required** - references org entities |
| Value Proposition Ontology (VSOM) | **Optional** - for VP details |

## Dependents

| Ontology | Usage |
|----------|-------|
| Discovery Audit | Uses context for audit analysis |
| Gap Analysis | Uses maturity and competitive data |

---

## Files in This Package

| File | Description |
|------|-------------|
| `org-context-ontology-v1.0.1.json` | Main ontology definition |
| `registry-entry-v3.0.0.json` | Registry v3.0 compliant entry |
| `glossary-v1.0.0.json` | Term definitions (JSON) |
| `glossary-v1.0.0.md` | Term definitions (Markdown) |
| `test-data-v1.0.0.json` | Test data (60-20-10-10) |
| `validation-report-v1.0.0.md` | 5-gate validation results |
| `README.md` | This file |
| `CHANGELOG.md` | Version history |

---

## Usage Example

```json
{
  "@type": "pf:OrganizationContext",
  "@id": "ctx:foot-scientific",
  "contextId": "ctx:foot-scientific",
  "organizationRef": "org:foot-scientific",
  
  "brands": [{
    "brandId": "brand-footsci",
    "name": "Foot Scientific",
    "isPrimaryBrand": true,
    "valuePropositionRef": "vp:foot-scientific-brand"
  }],
  
  "productPortfolio": {
    "portfolioType": "multi_product",
    "productCount": 15,
    "segments": ["Custom Solutions", "Retail", "Professional"]
  },
  
  "competitiveLandscape": {
    "competitors": [{
      "organizationRef": "org:superfeet",
      "competitorType": "direct",
      "priority": 1,
      "trackCitations": true,
      "trackRankings": true
    }]
  },
  
  "maturity": {
    "sizeMaturity": {"level": 2, "headcount": 75, "revenue": 8000000},
    "marketingMaturity": {"level": 2, "hasMarketingDirector": false},
    "aiMaturity": {"maturityLevel": "exploring", "aiVisibilityAwareness": "medium"}
  }
}
```

---

## Business Rules

| Rule ID | Description |
|---------|-------------|
| BR-CTX-001 | Context must link to valid Organization |
| BR-CTX-002 | Maximum 10 competitors per organization |
| BR-CTX-003 | Maturity scores must be 1-5 |
| BR-CTX-004 | Value propositions are references only |

---

## Quality Metrics

| Metric | Score |
|--------|-------|
| Completeness | 100% |
| Competency | 95% |
| Schema.org Alignment | 75% |
| Test Coverage | 100% |
| **Confidence Score** | **0.88** |

---

## Related Documentation

- [Organization Ontology](../pfc-ont-organisation/) - Core org entity
- [VSOM Ontology](../pfc-ont-vsom/) - Value proposition details
- [Platform Framework Architecture](../../docs/PLATFORM_ARCHITECTURE.md)
- [Figma Diagrams](https://figma.com/...) - Visual reference

---

## Change Control

This ontology is a **change-controlled artifact**.

**Change Control ID:** CC-ORG-CTX-001

---

**Maintained by:** BAIV Platform Team  
**Contact:** ontology@baiv.co.uk
