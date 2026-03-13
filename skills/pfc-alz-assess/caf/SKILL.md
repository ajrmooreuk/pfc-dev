# pfc-alz-assess-caf — CAF Readiness Assessment Skill

**Skill ID:** pfc-alz-assess-caf
**Version:** v0.1.0 (scaffold)
**Type:** AGENT_SUPERVISED
**Feature:** [F74.3](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/1074)
**Epic:** [Epic 74 (#1074)](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/1074)

---

## Purpose

Assess Cloud Adoption Framework readiness using NCSC-CAF-ONT outcome mapping and live Azure environment validation via azure-skills MCP.

## Azure Skills Consumed

| azure-skill | CAF Domain | Data Extracted |
|---|---|---|
| `azure-prepare` | Strategy, Plan | Environment readiness, prerequisites, subscription setup |
| `azure-compliance` | Govern | Policy posture, regulatory compliance |
| `azure-cloud-migrate` | Migrate | Migration readiness, dependency analysis, TCO |
| `azure-deploy` | Ready, Adopt | Deployment capability, IaC maturity |
| `azure-resource-visualizer` | Organize | Resource topology, management group hierarchy |
| `azure-rbac` | Govern | Identity governance, role assignments |

## Ontology Mapping

| CAF Domain | NCSC-CAF-ONT Entity | Assessment Focus |
|---|---|---|
| Strategy | `caf:Strategy` | Cloud business case, motivations, outcomes |
| Plan | `caf:Plan` | Digital estate, skills readiness, adoption plan |
| Ready | `caf:Ready` | Landing zone readiness, Azure setup |
| Migrate | `caf:Migrate` | Workload assessment, migration readiness |
| Innovate | `caf:Innovate` | AI/ML workload capability |
| Govern | `caf:Govern` | Policy, cost management, security baseline |
| Manage | `caf:Manage` | Operations baseline, monitoring |
| Organize | `caf:Organize` | RACI, team topology, skill coverage |

## DMAIC Backcasting Integration

### Define
- VE Discovery: Where is the customer on their cloud journey? (greenfield / migration / modernisation)
- CTQ: Time to productive cloud workloads, compliance posture, operational capability

### Measure
- azure-prepare for readiness baseline
- azure-compliance for governance posture
- azure-cloud-migrate for workload assessment

### Analyse
- Three-state gap: CAF best practice × current readiness × desired adoption state
- Map gaps to NCSC CAF outcomes (B1–B6, C1–C4, D1–D2)
- RMF risk: adoption programme risk (capability gaps, timeline risk)

### Improve
- Backcast from desired CAF maturity per domain
- Phased adoption roadmap: foundation → migrate → optimise → innovate

### Control
- Track CAF domain maturity over time
- Recurring readiness checks as workloads migrate

## Inputs

- Azure tenant credentials (read-only)
- VE profile (cloud adoption objectives)
- FDN context (current cloud maturity, team capability)

## Outputs

- Per-domain readiness scores
- CAF outcome mapping (NCSC-CAF-ONT)
- Migration readiness assessment per workload
- Phased adoption roadmap (backcasted)
- Skills gap analysis (feeds F33.10)
