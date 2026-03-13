# Epic 74: PFI-AIRL-AZS — Microsoft Azure Skills Plugin Evaluation

**GitHub:** [Epic 74 (#1074)](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/1074)
**Strategy hub:** Azlan-EA-AAA `PBS/STRATEGY/`
**Skill development:** This repo (`pfc-dev/skills/pfc-alz-assess/`)
**Market delivery:** `pfi-w4m-rcs-dev`

---

## Documents (Azlan-EA-AAA)

| Document | Type |
|---|---|
| [Azure Skills WAF/CAF/Cyber Assessment Strategy](https://github.com/ajrmooreuk/Azlan-EA-AAA/blob/main/PBS/STRATEGY/PFI-AIRL-GRC-STRAT-Azure-Skills-WAF-CAF-Cyber-Assessment-Strategy-v1.0.0.md) | STRAT |
| [Azure Skills Capability Evaluation](https://github.com/ajrmooreuk/Azlan-EA-AAA/blob/main/PBS/STRATEGY/PFI-AIRL-GRC-BRIEF-Azure-Skills-Capability-Evaluation-v1.0.0.md) | BRIEF |
| [ALZ Assessment DMAIC Backcasting Methodology](https://github.com/ajrmooreuk/Azlan-EA-AAA/blob/main/PBS/STRATEGY/PFI-AIRL-GRC-BRIEF-ALZ-Assessment-DMAIC-Backcasting-Methodology-v1.0.0.md) | BRIEF |

## Skills (this repo)

```text
skills/pfc-alz-assess/
├── waf/SKILL.md            pfc-alz-assess-waf (F74.2)
├── caf/SKILL.md            pfc-alz-assess-caf (F74.3)
├── cyber/SKILL.md          pfc-alz-assess-cyber (F74.4)
├── health/SKILL.md         pfc-alz-assess-health (F74.5)
├── common/
│   ├── scoring-model.md    Three-state scoring (F74.14)
│   └── pe-ont-process-definition.md  L0–L3 processes (F74.13)
├── plugins/                MCP adapter plugins (F74.15)
└── tests/TEST-PLAN.md      7 test data sets, 15 use cases (F74.16)
```

## INS ALZ Snapshot Audit (reference)

```text
PBS/STRATEGY/insurance-sector/ARCHITECTURE/ALZ-Audit-Snapshot-alz-ss-v1/
└── 17 artefacts (being evolved from manual → agentic in F74.11)
```

## Cascade

pfc-dev → pfc-test → pfc-prod → pfi-w4m-rcs-dev → pfi-w4m-rcs-test → pfi-w4m-rcs-prod
