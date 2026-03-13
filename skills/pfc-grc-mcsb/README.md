# pfc-grc-mcsb — GRC MCSB Security Skills Family

**Epic:** [Epic 74 (#1074)](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/1074)
**Features:** F74.19 (OWASP Leverage), F74.20 (GRC-MCSB Skills), F74.21 (ASB→MCSB Lineage)
**Briefing:** `PBS/STRATEGY/PFI-AIRL-GRC-BRIEF-OWASP-MCSB-GRC-Skills-Strategy-v1.0.0.md`
**Cascade:** Azlan-EA-AAA (strategy) → pfc-dev (skills) → pfc-test → pfc-prod → pfi-w4m-rcs-dev

---

## Skills (10)

| Directory | Skill | Feature | Status |
|---|---|---|---|
| `assess/` | pfc-grc-mcsb-assess | F74.20a | Scaffold |
| `benchmark/` | pfc-grc-mcsb-benchmark | F74.20b | Scaffold |
| `migrate/` | pfc-grc-mcsb-migrate | F74.21 | Scaffold |
| `policy/` | pfc-grc-mcsb-policy | F74.20c | Scaffold |
| `report/` | pfc-grc-mcsb-report | F74.20d | Scaffold |
| `posture/` | pfc-grc-posture | F74.20e | Scaffold |
| `plan/` | pfc-grc-plan | F74.20 | Scaffold |
| `remediate/` | pfc-grc-remediate | F74.20 | Scaffold |
| `baseline/` | pfc-grc-baseline | F74.20 | Scaffold |
| `drift/` | pfc-grc-drift | F74.20 | Scaffold |

## OWASP Integration (7 existing skills — leveraged, not scaffolded here)

| Skill | Integration Point |
|---|---|
| pfc-owasp-agentic | AI workload assessment (MCSB v2 AI domain) |
| pfc-owasp-llm | AI model security (complements AI-1 to AI-7) |
| pfc-owasp-pipeline | DevOps Security (MCSB DS-1 to DS-7) |
| pfc-owasp-code-review | Application layer (not in MCSB) |
| pfc-owasp-web | Web app security (not in MCSB) |
| pfc-owasp-threat-model | Risk identification → RMF register |
| ext-owasp-agamm | AI governance maturity |

## Ontology Dependencies

- MCSB-ONT v2.0.0 (compliant) — 12 control domains
- MCSB2-ONT v1.0.0 (placeholder) — v2 + AI domain
- GRC-FW-ONT v3.0.0 — governance orchestration
- ERM-ONT v1.0.0 — risk register
- RMF-IS27005-ONT v1.0.0 — risk scoring
- SEC-FW-ONT, COMP-FW-ONT, NCSC-CAF-ONT — compliance cross-reference
- EA-MSFT-ONT — WAF pillar entities

## DMAIC Lifecycle Mapping

| Phase | Skills |
|---|---|
| **Define** | pfc-grc-mcsb-migrate, pfc-grc-plan |
| **Measure** | pfc-grc-mcsb-assess, pfc-grc-mcsb-policy |
| **Analyse** | pfc-grc-mcsb-benchmark, pfc-grc-posture, OWASP skills |
| **Improve** | pfc-grc-remediate, pfc-alz-strategy |
| **Control** | pfc-grc-baseline, pfc-grc-drift, pfc-grc-mcsb-report |
