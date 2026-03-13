# pfc-grc-mcsb-policy — Azure Policy Audit & Remediation Skill

**Skill ID:** pfc-grc-mcsb-policy
**Version:** v0.1.0 (scaffold)
**Type:** AGENT_AUTONOMOUS
**Feature:** F74.20c
**Epic:** [Epic 74 (#1074)](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/1074)

---

## Purpose

Audit Azure Policy assignments at management group or subscription scope, map to MCSB control domains, identify coverage gaps, detect conflicts/duplicates, and generate a remediation plan for missing or deprecated policy assignments.

## Azure Skills Consumed

| azure-skill | Data Extracted |
|---|---|
| `azure-compliance` | Policy compliance state, initiative assignments |
| `azure-validate` | Resource configuration against policy expectations |

## Process

1. Enumerate all policy assignments at scope (MG/subscription)
2. Map each assignment to MCSB control domain via MCSB-ONT
3. Identify missing assignments (MCSB controls without policy enforcement)
4. Detect deprecated ASB policies still active (pre-MCSB remnants)
5. Detect conflicting or duplicate policy definitions
6. Generate remediation plan: assign missing, remove deprecated, resolve conflicts

## Outputs

- Policy coverage matrix (MCSB domain × policy assignment status)
- Missing policy list with recommended assignments
- Deprecated policy list with removal guidance
- Conflict/duplicate report
- Remediation plan (prioritised, phased)
