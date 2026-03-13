# pfc-grc-drift — Continuous Compliance Drift Detection Skill

**Skill ID:** pfc-grc-drift
**Version:** v0.1.0 (scaffold)
**Type:** AGENT_AUTONOMOUS
**Feature:** F74.20
**Epic:** [Epic 74 (#1074)](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/1074)

---

## Purpose

Continuously monitor MCSB compliance posture for drift from established baseline. Detects when domain scores breach SPC control limits, new non-compliant resources appear, or policy assignments are modified/removed.

## Inputs

- pfc-grc-baseline output (SPC control limits per domain)
- azure-compliance (live compliance state — recurring invocation)
- pfc-grc-mcsb-policy (policy assignment state)

## Detection Rules

```text
1. Score Drift: Domain score drops below LCL (Lower Control Limit)
2. New Non-Compliance: Previously compliant control becomes non-compliant
3. Policy Removal: MCSB policy assignment removed or modified
4. Resource Drift: New resource deployed without policy coverage
5. Trend Drift: 3+ consecutive assessments trending downward
```

## Outputs

- Drift alert (domain, severity, delta from baseline)
- Root cause indicator (policy change, new resource, config change)
- Recommended action (re-assess, remediate, investigate)
- Drift history log (stored in Supabase)

## Scheduling

Designed for recurring execution (daily/weekly) via pfc-alz-pipeline Stage 7 (Continuous Assurance).

## Downstream Consumers

- pfc-grc-mcsb-report (drift included in trend reports)
- risk-update (Epic 73, SKL-069 — risk register update on drift)
