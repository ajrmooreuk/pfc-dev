# pfc-grc-posture — Unified Security Posture Score Skill

**Skill ID:** pfc-grc-posture
**Version:** v0.1.0 (scaffold)
**Type:** AGENT_SUPERVISED
**Feature:** F74.20e
**Epic:** [Epic 74 (#1074)](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/1074)

---

## Purpose

Aggregate security scores from MCSB infrastructure assessment, OWASP application/AI scans, and WAF Security pillar into a single unified security posture score. Weights are VE-configurable per customer priority.

## Scoring Model

```text
Unified Posture Score = weighted average of:
  ├── MCSB infrastructure score       weight: 0.40 (default)
  ├── OWASP application score         weight: 0.25 (default)
  ├── WAF Security pillar score       weight: 0.20 (default)
  └── AI Security score               weight: 0.15 (default)

All weights are VE-configurable. Customer Kano classification determines
whether to shift weight toward MUST-BE (security) or PERFORMANCE (cost, perf).
```

## Input Sources

| Source | Skill | What It Provides |
|---|---|---|
| MCSB infrastructure | pfc-grc-mcsb-assess | 12 domain scores (0–100%) |
| OWASP application | pfc-owasp-web, pfc-owasp-code-review, pfc-owasp-threat-model | Finding counts, severity, remediation status |
| WAF Security pillar | pfc-alz-assess-waf (Security pillar only) | WAF Security pillar score |
| AI Security | pfc-owasp-agentic + pfc-owasp-llm + MCSB AI domain | AI-specific risk scores |

## Outputs

```text
- Unified posture score (0–100)
- Component breakdown with individual scores
- Traffic light status (Red <50, Amber 50–79, Green 80+)
- Trend delta (vs previous assessment if available)
- Weakest domain identification with remediation priority
- Executive summary paragraph
```

## Downstream Consumers

- pfc-grc-mcsb-report (included in executive summary)
- pfc-alz-strategy (input to strategic recommendations)
- risk-report (Epic 73, SKL-070)
- pfc-grc-baseline (establishes SPC control limits)
