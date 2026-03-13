# pfc-grc-mcsb-report — MCSB Compliance Reporting Skill

**Skill ID:** pfc-grc-mcsb-report
**Version:** v0.1.0 (scaffold)
**Type:** AGENT_AUTONOMOUS
**Feature:** F74.20d
**Epic:** [Epic 74 (#1074)](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/1074)

---

## Purpose

Generate MCSB compliance reports in multiple formats: per-domain detail, executive summary, trend analysis, and regulatory framework mapping.

## Report Types

| Report | Audience | Content |
|---|---|---|
| **Domain report** | Technical | Per-control-domain compliance detail with findings |
| **Executive summary** | C-suite | 1-page posture overview with traffic lights and key risks |
| **Trend report** | Management | Posture change over time from Supabase historical baselines |
| **Regulatory mapping** | Compliance | MCSB controls → GDPR, NCSC CAF, PCI-DSS, ISO 27001 mapping |

## Input Sources

- pfc-grc-mcsb-assess (domain scores, findings)
- pfc-grc-posture (unified score)
- pfc-grc-mcsb-benchmark (gap analysis)
- Supabase historical data (for trend reports)

## Ontology Cross-References

- MCSB-ONT → COMP-FW-ONT (compliance framework mapping)
- MCSB-ONT → NCSC-CAF-ONT (UK cyber outcomes)
- MCSB-ONT → GDPR-ONT (data protection)
- MCSB-ONT → SEC-FW-ONT (security posture)

## Downstream Consumers

- pfc-narrative (narrative generation for deliverables)
- pfc-slide-engine (SlideDeck report slides)
- pfc-proposal-composer (client-facing proposals)
