# pfc-hcr-compose — Health Check Report Composer

**Skill ID:** pfc-hcr-compose
**Version:** v0.1.0 (scaffold)
**Type:** AGENT_SUPERVISED
**Feature:** F74.25a
**Epic:** [Epic 74 (#1074)](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/1074)

---

## Purpose

Compose the complete Health Check Report from all upstream skill chain outputs, following HCR-ONT structure. Assembles assessment findings, strategic analysis, risk assessment, financial case, backcasted roadmap, and verification attestation into a structured deliverable.

Evolves the `CUSTOMER-Azure-Health-Check-v1.1.docx` template into HCR v2.0 — ontology-backed, queryable, multi-format.

## Inputs

- pfc-hcr-analyse output (cross-correlated findings, systemic patterns)
- pfc-hcr-roadmap output (backcasted phases, OKRs, benefits)
- pfc-hcr-verify output (verification attestation, evidence audit trail)
- pfc-alz-assess-* scored findings (WAF, CAF, Cyber, Health)
- pfc-qvf-cyber-* financial outputs (ALE, ROI, insurance, Cyber Value Equation)
- pfc-alz-strategy strategic analysis (gap analysis, resource plan)
- FDN context (customer branding, engagement reference)

## Process

1. Instantiate HCR-ONT `hcr:Report` entity with engagement metadata
2. Populate `hcr:ReportSection` entities from domain assessment outputs
3. Link `hcr:Finding` entities to evidence, recommendations, and risk assessments
4. Assemble Part I (Executive Summary) from aggregate scores and top findings
5. Assemble Part II (Domain Assessments) from per-domain skill outputs
6. Assemble Part III (Strategic Analysis) from hcr-analyse, hcr-roadmap, QVF outputs
7. Assemble Part IV (Assurance & Verification) from hcr-verify outputs
8. Assemble Part V (Appendices) — resource inventory, full recommendations, evidence pack
9. Generate multi-format output (HTML interactive, PDF print, Word deliverable)

## Report Sections (HCR v2.0)

```text
Part I:   Executive Summary (context, scorecard, strategic recommendation)
Part II:  Domain Assessments (9 chapters, each with scores/findings/risk/recommendations)
Part III: Strategic Analysis (cross-framework, risk, financial, roadmap)
Part IV:  Assurance & Verification (evidence audit, attestation, continuous plan)
Part V:   Appendices (inventory, recommendations register, evidence pack, glossary)
```

## Outputs

- Complete HCR v2.0 report (HCR-ONT structured)
- Multi-format: HTML (interactive), PDF (print), DOCX (Word deliverable)
- HCR-ONT graph instance (for downstream skills and dashboard)
- Metadata for pfc-slide-engine and pfc-proposal-composer

## Ontology Surface

- HCR-ONT v1.0.0 (all entities)
- Consumes outputs grounded in: MCSB-ONT, WAF-ONT, AZALZ-ONT, RMF-IS27005-ONT, QVF-ONT

## Human Checkpoint

Report Draft Review — customer and architect review before final formatting and delivery.
