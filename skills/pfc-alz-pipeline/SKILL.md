# PFC-ALZ-PIPELINE: ALZ Assessment Orchestrator

**Classification:** AGENT_ORCHESTRATOR
**Version:** 0.1.0
**Epic:** [Epic 74 (#1074)](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/1074)
**Features:** F74.7 (Pipeline Architecture), F74.18 (Orchestrator)
**Registry:** Entry-SKL-112

---

## Purpose

Master orchestrator that chains all Azure Assessment skills across 7 phases — from client engagement through to continuous assurance. Follows the same orchestrator pattern as `pfc-dmaic-ve` and `pfc-ve-pipeline`.

## 7-Phase Pipeline

### Phase 1: ENGAGE
**Purpose:** Establish assessment context, value engineering focus, and scope boundaries.

| Step | Skill | Classification | Status |
|------|-------|---------------|--------|
| 1.1 | pfc-org-context | SKILL_STANDALONE | Adopted |
| 1.2 | pfc-vsom | SKILL_STANDALONE | Adopted |
| 1.3 | pfc-okr | SKILL_STANDALONE | Adopted |
| 1.4 | pfc-kpi (--mode baseline) | SKILL_STANDALONE | Adopted |
| 1.5 | pfc-vp (--scope problems) | SKILL_STANDALONE | Adopted |
| 1.6 | pfc-kano | SKILL_STANDALONE | Adopted |
| 1.7 | pfc-delta-scope | SKILL_STANDALONE | Candidate |

**Human Checkpoint:** HC-1 Scope Approval — customer confirms assessment domains, VE priorities, exclusions.

**Outputs:**
- `engage/org-context.jsonld` — organisational context
- `engage/ve-profile.jsonld` — VSOM, OKR, KPI baseline, VP problems, Kano priorities
- `engage/scope.jsonld` — DELTA-scoped assessment boundaries

---

### Phase 2: EXTRACT
**Purpose:** Pull live Azure data via MCP azure-skills.

| Step | Skill | Classification | Status |
|------|-------|---------------|--------|
| 2.1 | azure-resource-lookup (MCP) | EXTERNAL | MCP |
| 2.2 | azure-prepare (MCP) | EXTERNAL | MCP |
| 2.3 | azure-validate (MCP) | EXTERNAL | MCP |
| 2.4 | azure-compliance (MCP) | EXTERNAL | MCP |
| 2.5 | azure-rbac (MCP) | EXTERNAL | MCP |
| 2.6 | azure-diagnostics (MCP) | EXTERNAL | MCP |
| 2.7 | azure-kusto (MCP) | EXTERNAL | MCP |
| 2.8 | azure-observability (MCP) | EXTERNAL | MCP |
| 2.9 | azure-cost-optimization (MCP) | EXTERNAL | MCP |
| 2.10 | azure-compute (MCP) | EXTERNAL | MCP |
| 2.11 | azure-storage (MCP) | EXTERNAL | MCP |
| 2.12 | entra-app-registration (MCP) | EXTERNAL | MCP |

**Outputs:**
- `extract/raw-mcp-*.json` — raw azure-skills MCP responses per tool
- `extract/extraction-manifest.json` — what was extracted, timestamps, tenant scope

---

### Phase 3: ASSESS
**Purpose:** Score extracted data against ontology frameworks.

| Step | Skill | Classification | Status | Registry |
|------|-------|---------------|--------|----------|
| 3.1 | pfc-alz-assess-waf | AGENT_SUPERVISED | Scaffold | SKL-086 |
| 3.2 | pfc-alz-assess-caf | AGENT_SUPERVISED | Scaffold | SKL-087 |
| 3.3 | pfc-alz-assess-cyber | AGENT_SUPERVISED | Scaffold | SKL-088 |
| 3.4 | pfc-alz-assess-health | AGENT_AUTONOMOUS | Scaffold | SKL-089 |
| 3.5 | ontology-adapter (plugin) | PLUGIN | Scaffold | — |
| 3.6 | cross-framework (plugin) | PLUGIN | Scaffold | — |
| 3.7 | rmf-scorer (plugin) | PLUGIN | Scaffold | — |
| 3.8 | ve-tagger (plugin) | PLUGIN | Scaffold | — |

**Human Checkpoint:** HC-2 Findings Review — architect validates scored findings before analysis.

**Outputs:**
- `assess/waf-findings.jsonld` — WAF pillar scores + findings
- `assess/caf-findings.jsonld` — CAF readiness scores + findings
- `assess/cyber-findings.jsonld` — MCSB/GRC posture scores + findings
- `assess/health-findings.jsonld` — ALZ healthcheck results
- `assess/cross-framework-map.jsonld` — correlated findings across frameworks

---

### Phase 4: ANALYSE
**Purpose:** Deep analysis — cross-domain correlation, root cause, risk quantification, benchmarking.

| Step | Skill | Classification | Status | Registry |
|------|-------|---------------|--------|----------|
| 4.1 | pfc-hcr-analyse | AGENT_AUTONOMOUS | Scaffold | SKL-108 |
| 4.2 | pfc-grc-mcsb-assess | AGENT_SUPERVISED | Scaffold | SKL-091 |
| 4.3 | pfc-grc-mcsb-benchmark | AGENT_SUPERVISED | Scaffold | SKL-093 |
| 4.4 | pfc-grc-baseline | AGENT_AUTONOMOUS | Scaffold | SKL-092 |
| 4.5 | pfc-grc-drift | AGENT_AUTONOMOUS | Scaffold | SKL-094 |
| 4.6 | pfc-grc-mcsb-migrate | AGENT_SUPERVISED | Scaffold | SKL-095 |
| 4.7 | pfc-grc-mcsb-policy | AGENT_AUTONOMOUS | Scaffold | SKL-097 |
| 4.8 | pfc-grc-posture | AGENT_SUPERVISED | Scaffold | SKL-098 |
| 4.9 | pfc-qvf-cyber-impact | AGENT_SUPERVISED | Scaffold | SKL-101 |
| 4.10 | pfc-qvf-threat-econ | AGENT_SUPERVISED | Scaffold | SKL-102 |
| 4.11 | pfc-qvf-breach-model | AGENT_AUTONOMOUS | Scaffold | SKL-103 |
| 4.12 | pfc-reason | SKILL_STANDALONE | Adopted | — |

**Outputs:**
- `analyse/cross-domain-correlation.jsonld` — systemic patterns
- `analyse/mcsb-benchmark.jsonld` — three-state gap analysis
- `analyse/posture-score.jsonld` — unified security posture
- `analyse/cyber-economics.jsonld` — ALE, breach cost, FAIR overlay
- `analyse/root-cause.jsonld` — root cause decomposition

---

### Phase 5: STRATEGISE
**Purpose:** Transform findings into consulting-grade roadmap and business case.

| Step | Skill | Classification | Status | Registry |
|------|-------|---------------|--------|----------|
| 5.1 | pfc-alz-strategy | AGENT_SUPERVISED | Scaffold | SKL-090 |
| 5.2 | pfc-grc-plan | AGENT_SUPERVISED | Scaffold | SKL-096 |
| 5.3 | pfc-grc-remediate | AGENT_SUPERVISED | Scaffold | SKL-099 |
| 5.4 | pfc-qvf-cyber-insure | AGENT_SUPERVISED | Scaffold | SKL-104 |
| 5.5 | pfc-qvf-grc-roi | AGENT_SUPERVISED | Scaffold | SKL-105 |
| 5.6 | pfc-qvf-grc-value | AGENT_SUPERVISED | Scaffold | SKL-106 |

**Human Checkpoint:** HC-3 Roadmap Approval — customer approves strategic direction and investment model.

**Outputs:**
- `strategise/roadmap.jsonld` — backcasted roadmap with OKRs
- `strategise/implementation-plan.jsonld` — phased MCSB implementation
- `strategise/remediation-backlog.jsonld` — prioritised remediation
- `strategise/business-case.jsonld` — ROI, NPV, value equation, insurance optimisation

---

### Phase 6: DOCUMENT
**Purpose:** Produce the Health Check Report and supporting deliverables.

| Step | Skill | Classification | Status | Registry |
|------|-------|---------------|--------|----------|
| 6.1 | pfc-hcr-compose | AGENT_SUPERVISED | Scaffold | SKL-107 |
| 6.2 | pfc-hcr-verify | AGENT_SUPERVISED | Scaffold | SKL-109 |
| 6.3 | pfc-hcr-dashboard | AGENT_AUTONOMOUS | Scaffold | SKL-110 |
| 6.4 | pfc-hcr-roadmap | AGENT_SUPERVISED | Scaffold | SKL-111 |
| 6.5 | pfc-grc-mcsb-report | AGENT_AUTONOMOUS | Scaffold | SKL-100 |
| 6.6 | pfc-narrative | SKILL_STANDALONE | Adopted | — |
| 6.7 | pfc-slide-engine | SKILL_STANDALONE | Adopted | — |

**Human Checkpoint:** HC-4 Report Sign-off — customer approves final deliverable.

**Outputs:**
- `document/health-check-report.md` — full HCR
- `document/executive-dashboard.html` — interactive drill-down
- `document/mcsb-compliance-report.md` — MCSB detail report
- `document/strategic-roadmap.md` — roadmap narrative
- `document/presentation.md` — slide deck source

---

### Phase 7: ASSURE
**Purpose:** Continuous monitoring and drift detection post-delivery.

| Step | Skill | Classification | Status | Registry |
|------|-------|---------------|--------|----------|
| 7.1 | pfc-grc-drift | AGENT_AUTONOMOUS | Scaffold | SKL-094 |
| 7.2 | pfc-grc-baseline | AGENT_AUTONOMOUS | Scaffold | SKL-092 |
| 7.3 | azure-compliance (MCP recurring) | EXTERNAL | MCP | — |
| 7.4 | pfc-kpi (--mode monitor) | SKILL_STANDALONE | Adopted | — |
| 7.5 | pfc-vp (--scope full) | SKILL_STANDALONE | Adopted | — |

**Outputs:**
- `assure/drift-report.jsonld` — compliance drift from baseline
- `assure/spc-control-chart.jsonld` — SPC monitoring data
- `assure/kpi-monitor.jsonld` — KPI tracking against baseline

---

## Pipeline Summary

| Phase | Skills | Human Checkpoint | Key Output |
|-------|--------|-----------------|------------|
| 1. ENGAGE | 7 | HC-1 Scope Approval | VE profile + scope |
| 2. EXTRACT | 12 (MCP) | — | Raw Azure data |
| 3. ASSESS | 8 | HC-2 Findings Review | Scored findings |
| 4. ANALYSE | 12 | — | Correlation + economics |
| 5. STRATEGISE | 6 | HC-3 Roadmap Approval | Roadmap + business case |
| 6. DOCUMENT | 7 | HC-4 Report Sign-off | HCR + deliverables |
| 7. ASSURE | 5 | — | Drift monitoring |
| **Total** | **57** | **4** | |

## Invocation

```bash
# Full pipeline
/pfc-dev:pfc-alz-pipeline --tenant <tenant-id>

# Start from specific phase
/pfc-dev:pfc-alz-pipeline --tenant <tenant-id> --start-from ASSESS

# Stop after specific phase
/pfc-dev:pfc-alz-pipeline --tenant <tenant-id> --stop-after STRATEGISE

# Single phase
/pfc-dev:pfc-alz-pipeline --tenant <tenant-id> --start-from EXTRACT --stop-after EXTRACT
```

## Methodology Integration

- **DELTA (F74.9):** Phases 1-2 = Discover+Evaluate, Phase 3-4 = Learn, Phase 5 = Transform, Phase 7 = Assure
- **DMAIC (F74.10):** Phase 1 = Define, Phase 2-3 = Measure, Phase 4 = Analyze, Phase 5 = Improve, Phase 7 = Control
- **INS Pattern (F74.11):** Phase 2 = Extract, Phase 3 = Assess, HC-2 = Review, Phase 4 = Score, Phase 5 = Project, Phase 7 = Assure
- **Backcasting (F74.14):** Three-state model runs within Phase 4 (benchmark) and Phase 5 (roadmap)

## Technology

```json
{
  "runtime": "claude-code-cli",
  "format": "SKILL.md",
  "allowedTools": ["Bash(gh *)", "Read", "Grep", "Glob", "Write"],
  "mcpServers": ["azure-skills", "foundry-mcp"]
}
```

## Output Directory Structure

```text
pfc-alz-pipeline-output/
├── engage/
├── extract/
├── assess/
├── analyse/
├── strategise/
├── document/
├── assure/
├── pipeline-manifest.json      ← Phase execution log, timestamps, checkpoints
└── pipeline-state.json         ← Resumable state for mid-pipeline entry
```
