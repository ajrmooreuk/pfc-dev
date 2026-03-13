# pfc-hcr-roadmap — Backcast-Driven Roadmap Generation

**Skill ID:** pfc-hcr-roadmap
**Version:** v0.1.0 (scaffold)
**Type:** AGENT_SUPERVISED
**Feature:** F74.25e
**Epic:** [Epic 74 (#1074)](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/1074)

---

## Purpose

Generate a backcasted strategic roadmap that works backwards from the customer's desired destination to the current state. Materialises pfc-alz-strategy analysis into a phased delivery plan with OKRs, investment model, benefits timeline, resource requirements, and risk reduction trajectory.

The roadmap is the core of Part III §16 of the Health Check Report — the "how do we get there" answer.

## Inputs

- pfc-alz-strategy gap analysis (per domain: current → desired → best practice)
- pfc-hcr-analyse correlated findings (root-cause clusters for efficient phasing)
- pfc-qvf-grc-roi investment case (ROI, NPV, payback per phase)
- pfc-qvf-cyber-impact ALE data (risk reduction per phase)
- pfc-okr output (OKR framework for strategic objectives)
- pfc-cost-model estimates (effort and cost per recommendation)
- pfc-resource-profile capacity (team composition, availability)
- Customer constraints (budget ceiling, timeline, change windows)

## Backcasting Process

```text
1. DEFINE DESTINATION (from VE Discovery)
   ├── Target domain scores (from OKR-ONT key results)
   ├── Target risk level (from rmf:RiskCriteria)
   ├── Target compliance thresholds (MCSB >85%, OWASP resolved)
   └── Target financial outcomes (insurance tier, ALE ceiling)

2. PHASE 4: OPTIMISE (work backwards from destination)
   ├── What must be true for destination to be reached?
   ├── Prerequisites from Phase 3
   └── Continuous improvement operational

3. PHASE 3: SUSTAIN
   ├── What must be true for Phase 4 to start?
   ├── SPC baselines established, drift detection active
   └── Prerequisites from Phase 2

4. PHASE 2: TRANSFORM
   ├── What must be true for Phase 3 to start?
   ├── Critical and High gaps closed
   └── Prerequisites from Phase 1

5. PHASE 1: FOUNDATION
   ├── What must be true for Phase 2 to start?
   ├── Quick wins deployed, blockers removed, team trained
   └── Prerequisites: assessment complete, roadmap approved (NOW)
```

## Phase Content Generation

Each `hcr:RoadmapPhase` contains:

| Element | Source Skill | Content |
|---|---|---|
| Recommendations | pfc-hcr-analyse (root-cause clustered) | Prioritised by VE × risk × Kano, grouped by root cause |
| OKRs | pfc-okr | Objectives + Key Results reverse-engineered from destination |
| Projected scores | Three-state scoring model | Score trajectory per domain per phase |
| Investment | pfc-cost-model | £ per phase (CAPEX + OPEX) |
| Value created | pfc-qvf-grc-roi | £ risk avoidance + insurance savings + compliance value |
| ROI | pfc-qvf-grc-value | Cumulative ROI at each phase |
| Risk trajectory | rmf risk-score | Risk level per phase (Critical → Medium → Low) |
| Resources | pfc-resource-profile | FTE, skills, availability per phase |
| Duration | Calculated | Weeks per phase, respecting customer constraints |
| Dependencies | pfc-hcr-analyse | Phase prerequisites, blockers, change windows |

## Outputs

- Backcasted roadmap (4 phases with all elements above)
- Phase Gantt timeline (visual, for dashboard and slides)
- OKR framework (per-phase objectives and key results)
- Investment model (cumulative cost, cumulative value, ROI curve)
- Risk reduction trajectory (risk level per phase, visual curve)
- Benefits realisation schedule (projected vs baseline)
- Resource plan (FTE allocation per phase)
- `hcr:Roadmap` and `hcr:RoadmapPhase` entities in HCR-ONT

## Ontology Surface

- HCR-ONT v1.0.0 (`hcr:Roadmap`, `hcr:RoadmapPhase`, `hcr:Recommendation`)
- OKR-ONT (objectives, key results)
- QVF-ONT v1.0.0 (`qvf:ValueModel`, `qvf:CashFlow`)
- RMF-IS27005-ONT v1.0.0 (`rmf:RiskTreatment`, `rmf:RiskCriteria`)
- PE-ONT (process phases, resource allocation)

## Human Checkpoint

Roadmap Approval — customer stakeholders validate phases, priorities, timelines, and investment before the roadmap is included in the final report.
