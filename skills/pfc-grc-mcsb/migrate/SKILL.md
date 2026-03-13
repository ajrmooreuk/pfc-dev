# pfc-grc-mcsb-migrate — ASB→MCSB Migration & Gap Analysis Skill

**Skill ID:** pfc-grc-mcsb-migrate
**Version:** v0.1.0 (scaffold)
**Type:** AGENT_SUPERVISED
**Feature:** F74.21
**Epic:** [Epic 74 (#1074)](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/1074)

---

## Purpose

Analyse a customer's current security benchmark state (ASB v2/v3, MCSB v1, or no benchmark) and generate a gap analysis and migration roadmap to the target MCSB version, including policy assignment deltas and effort estimates.

## ASB → MCSB Version Lineage

```text
ASB v1 (2019) → ASB v2 (2020) → ASB v3 (2021) → MCSB v1 (2022 GA) → MCSB v2 (2025 preview)
```

## Migration Scenarios

### Scenario 1: ASB v2/v3 → MCSB v1

```text
Process:
  1. Enumerate existing ASB policy assignments at scope
  2. Map each ASB policy to MCSB v1 equivalent (ontology cross-ref)
  3. Identify deprecated ASB policies (no MCSB equivalent)
  4. Identify new MCSB v1 controls not present in ASB (multicloud, expanded domains)
  5. Generate migration plan with effort estimates per domain
Output:
  - Policy assignment delta (add/remove/update)
  - New controls requiring implementation
  - Deprecated policies to decommission
  - Migration roadmap (phased, VE-prioritised)
```

### Scenario 2: MCSB v1 → MCSB v2

```text
Process:
  1. Assess current MCSB v1 compliance state (invoke pfc-grc-mcsb-assess)
  2. Map v1 controls to v2 equivalents (MCSB-ONT → MCSB2-ONT cross-ref)
  3. Identify new AI Security domain (AI-1 to AI-7)
  4. Identify new/modified policy definitions (420+ in v2)
  5. Generate upgrade plan with phased rollout
Output:
  - Control delta (new/modified/unchanged)
  - AI Security readiness assessment
  - New policy definitions to deploy
  - Upgrade roadmap (phased, VE-prioritised)
```

### Scenario 3: Greenfield (No Benchmark)

```text
Process:
  1. Recommend MCSB v2 as target (latest)
  2. Invoke pfc-grc-mcsb-assess with full scope
  3. Score current state against MCSB v2 best practice
  4. Generate implementation plan from zero baseline
Output:
  - Full MCSB v2 implementation roadmap
  - Priority domains based on VE customer value
  - Quick wins (low effort, high compliance gain)
  - Long-term roadmap (backcasted from desired state)
```

## Customer State Detection

```text
Inputs:
  - Azure tenant credentials (read-only)
  - Scope: subscription(s) or management group

Detection Logic:
  1. Check for ASB policy initiative assignments → ASB legacy
  2. Check for MCSB v1 policy initiative assignments → MCSB v1 current
  3. Check for MCSB v2 policy initiative assignments → MCSB v2 (early adopter)
  4. No benchmark initiative found → Greenfield
```

## Ontology Dependencies

- MCSB-ONT v2.0.0 — ASB/MCSB v1 control mapping
- MCSB2-ONT v1.0.0 — MCSB v2 control mapping (needs build-out)
- GRC-FW-ONT v3.0.0 — governance policy cross-reference

## Human Checkpoint

Migration Roadmap Approval — architect reviews migration plan before execution.
