# pfc-grc-remediate — Prioritised Remediation Backlog Skill

**Skill ID:** pfc-grc-remediate
**Version:** v0.1.0 (scaffold)
**Type:** AGENT_SUPERVISED
**Feature:** F74.20
**Epic:** [Epic 74 (#1074)](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/1074)

---

## Purpose

Generate a VE-prioritised remediation backlog from MCSB assessment findings, balancing compliance improvement against business value using risk-score (Epic 73, SKL-067) and pfc-ve-prioritise (SKL-073).

## Inputs

- pfc-grc-mcsb-assess findings (non-compliant controls)
- risk-score output (P0–P3 priority per finding)
- VE value weighting (customer priorities)
- Resource constraints

## Priority Formula

```text
Remediation Priority = (Risk Score × 0.4) + (VE Value Impact × 0.3) + (Effort Inverse × 0.3)

Where:
  Risk Score = P0 (critical) to P3 (low) mapped to 1.0–0.25
  VE Value Impact = customer value weight for affected domain
  Effort Inverse = 1 / estimated effort (quick wins score higher)
```

## Outputs

- Ordered remediation backlog (highest priority first)
- Effort estimate per item
- Expected compliance score improvement per item
- Cumulative compliance trajectory chart data
- Quick wins list (high impact, low effort)

## Downstream Consumers

- pfc-grc-plan (implementation planning)
- risk-balance (Epic 73, SKL-068)
