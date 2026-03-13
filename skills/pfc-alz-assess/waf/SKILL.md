# pfc-alz-assess-waf — WAF Pillar Assessment Skill

**Skill ID:** pfc-alz-assess-waf
**Version:** v0.1.0 (scaffold)
**Type:** AGENT_SUPERVISED
**Feature:** [F74.2](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/1074)
**Epic:** [Epic 74 (#1074)](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/1074)

---

## Purpose

Assess an Azure environment against all 5 WAF (Well-Architected Framework) pillars using live MCP data from azure-skills, scored via EA-MSFT-ONT:WAFPillar entities.

## Azure Skills Consumed

| azure-skill | WAF Pillar | Data Extracted |
|---|---|---|
| `azure-validate` | All pillars | Architecture validation, best-practice alignment |
| `azure-compliance` | Security, Reliability | Azure Policy compliance state, Defender posture |
| `azure-cost-optimization` | Cost Optimization | Cost analysis, right-sizing, reserved instances |
| `azure-compute` | Performance Efficiency | Compute selection, sizing, performance data |
| `azure-observability` | Operational Excellence | Monitoring coverage, alerting, log analytics |
| `azure-storage` | Security, Reliability | Data protection, encryption, redundancy |

## Ontology Mapping

| WAF Pillar | EA-MSFT-ONT Entity | Scoring Model |
|---|---|---|
| Reliability | `WAFPillar:Reliability` | Availability SLA, redundancy, disaster recovery |
| Security | `WAFPillar:Security` | MCSB control compliance, identity, network |
| Cost Optimization | `WAFPillar:CostOptimization` | Spend efficiency, right-sizing, reservation |
| Operational Excellence | `WAFPillar:OperationalExcellence` | Monitoring coverage, automation, IaC maturity |
| Performance Efficiency | `WAFPillar:PerformanceEfficiency` | Compute right-sizing, scaling, latency |

## DMAIC Backcasting Integration

### Define
- VE Value Discovery determines which pillars matter most to this customer
- Kano classification: Security is typically MUST-BE; Cost Optimization is PERFORMANCE

### Measure
- Execute azure-validate + azure-compliance for baseline per pillar
- Score each pillar 0–100% against best-practice benchmark

### Analyse
- Three-state gap: Best Practice × Current × Desired Destination
- Cross-reference: Security pillar findings → MCSB-ONT controls → NCSC CAF outcomes
- RMF risk rating per finding

### Improve
- Backcast from customer's desired pillar scores
- Phase 1 (quick wins) → Phase 2 (transform) → Phase 3 (sustain) → Phase 4 (destination)
- Each remediation costed via azure-cost-optimization + VE quantification

### Control
- SPC baselines per pillar score
- Recurring azure-compliance checks detect pillar regression
- Trend dashboard in Supabase

## Process (PE-ONT)

```text
L2: WAF Pillar Assessment
├── Step 1: Invoke azure-validate (all pillars)
├── Step 2: Invoke azure-compliance (policy state)
├── Step 3: Invoke pillar-specific skills (cost, compute, observability)
├── Step 4: ontology-adapter plugin → EA-MSFT-ONT:WAFPillar entities
├── Step 5: cross-framework plugin → MCSB/CAF/NCSC cross-refs
├── Step 6: rmf-scorer plugin → RMF risk statements
├── Step 7: Score per pillar (0–100%)
├── Step 8: ve-tagger plugin → VP-ONT problem/solution/benefit
└── Step 9: Output: WAF Assessment Finding Set
```

## Inputs

- Azure tenant credentials (read-only)
- VE profile (which pillars prioritised, desired scores)
- FDN context (org maturity, risk appetite)

## Outputs

- Per-pillar maturity scores (0–100%)
- Finding set (structured JSON, ontology-mapped)
- Cross-framework references per finding
- RMF risk statements per finding
- VE value tags per finding

## Human Checkpoints

- [ ] Pillar prioritisation approved (after VE Discovery)
- [ ] Critical/High findings reviewed before roadmap generation
