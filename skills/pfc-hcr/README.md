# pfc-hcr — Health Check Report Skills Family

**Epic:** [Epic 74 (#1074)](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/1074)
**Feature:** F74.25 (Health Check Report Strategic Deliverable)
**Strategy Briefing:** `PFI-AIRL-GRC-BRIEF-Health-Check-Report-Strategic-Deliverable-v1.0.0.md`

---

## Overview

5 skills that transform assessment findings into the primary customer deliverable — the Health Check Report. Not just a document: a structured, ontology-backed, interactive, verified strategic communication with backcasted roadmap and financial case.

Evolves `CUSTOMER-Azure-Health-Check-v1.1.docx` (11 sections, static Word) into HCR v2.0 (5 parts, 18+ chapters, interactive dashboards, independent verification).

## Sub-Ontology

**HCR-ONT v1.0.0** — models report structure as a graph:
- `hcr:Report`, `hcr:ReportSection`, `hcr:Finding`, `hcr:Recommendation`
- `hcr:Evidence`, `hcr:RiskAssessment`, `hcr:Roadmap`, `hcr:RoadmapPhase`
- `hcr:VerificationAttestation`, `hcr:DashboardView`

## Skills

| Skill | Purpose | Type | Feature |
|---|---|---|---|
| `pfc-hcr-compose` | Compose report from all skill chain outputs | AGENT_SUPERVISED | F74.25a |
| `pfc-hcr-analyse` | Cross-domain finding analysis & correlation | AGENT_AUTONOMOUS | F74.25b |
| `pfc-hcr-verify` | Independent verification & assurance | AGENT_SUPERVISED | F74.25c |
| `pfc-hcr-dashboard` | Interactive dashboards with 4-level drill-down | AGENT_AUTONOMOUS | F74.25d |
| `pfc-hcr-roadmap` | Backcast-driven roadmap generation | AGENT_SUPERVISED | F74.25e |

## Skill Chain Position

```text
ASSESSMENT                  HCR SKILLS                      DELIVERY
──────────                  ──────────                      ────────
pfc-alz-assess-* ───→ pfc-hcr-analyse (correlate)    → findings
pfc-alz-strategy ───→ pfc-hcr-roadmap (backcast)     → roadmap
pfc-qvf-cyber-*  ───→ pfc-hcr-compose (assemble)     → HCR v2.0
rmf risk-* skills ──→ pfc-hcr-verify (assure)         → attestation
                      pfc-hcr-dashboard (interactive)  → drill-down
                            │
                            ↓
                      pfc-narrative → pfc-slide-engine → pfc-proposal-composer
```

## Dashboard Drill-Down

```text
Level 0: Executive Dashboard (posture gauge, heatmap, top findings, £ summary)
  ↓ click domain
Level 1: Domain Dashboard (three-state gauge, findings, risk heatmap, SPC chart)
  ↓ click finding
Level 2: Finding Detail (evidence, risk, recommendation, cross-framework)
  ↓ click evidence
Level 3: Evidence Viewer (raw data, hash, timestamp, verification status)
```

## Key Principles

- **The report IS the strategy communication** — not a side effect of DMAIC, but its primary output
- **Backcast from future vision** — roadmap works backwards from desired destination
- **RMF-based risk assessment** — every finding scored with ISO 27005 methodology
- **Independent verification** — evidence audit trail, hash-chained, attestation signed
- **Living document** — updates as posture changes via drift detection and SPC baselines
- **Interactive dashboards** — drill from board-level to raw evidence in 4 clicks
