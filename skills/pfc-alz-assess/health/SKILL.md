# pfc-alz-assess-health — ALZ Healthcheck Skill

**Skill ID:** pfc-alz-assess-health
**Version:** v0.1.0 (scaffold)
**Type:** AGENT_AUTONOMOUS
**Feature:** [F74.5](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/1074)
**Epic:** [Epic 74 (#1074)](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/1074)

---

## Purpose

Automated healthcheck of deployed Azure Landing Zones against AZALZ-ONT policy definitions and Epic 33 IaC blueprint architecture. Evolves the INS ALZ Snapshot Audit from manual KQL to fully agentic MCP.

## Azure Skills Consumed

| azure-skill | Healthcheck Domain | Data Extracted |
|---|---|---|
| `azure-validate` | Configuration | LZ configuration validation against best practices |
| `azure-resource-lookup` | Inventory | Resource inventory, topology discovery, dependency mapping |
| `azure-resource-visualizer` | Topology | Visual topology for stakeholder reporting |
| `azure-compliance` | Policy | Policy assignment compliance state |
| `azure-rbac` | Identity | RBAC binding validation against LZ design intent |
| `azure-kusto` | Evidence | KQL evidence queries (replaces INS manual approach) |
| `azure-diagnostics` | Operations | Diagnostic settings, log routing, alert coverage |

## INS ALZ Snapshot Audit Evolution

| INS Artefact | Replaced By | Improvement |
|---|---|---|
| `14-Tenant-Discovery-v1.py` | `azure-resource-lookup` | Live MCP vs. manual script |
| `11-Query-Executor-v1.py` | `azure-kusto` | Structured MCP vs. Python script |
| `05-KQL-Queries-v1.json` | `azure-validate` + `azure-compliance` | Live validation vs. static queries |
| `06-Compliance-Mapping-v1.json` | `cross-framework` plugin | Ontology graph vs. static JSON mapping |
| `07-OAA-Ontology-v1.json` | AZALZ-ONT + EMC Composer | Live ontology vs. static definition |
| `04-Azure-Workbook-v1.workbook` | Scoring model + Supabase dashboard | Automated scoring vs. manual workbook |
| `15-Full-Auto-v1.sh` | Agentic pipeline (F74.7) | MCP orchestration vs. shell script |

## Ontology Mapping

| AZALZ-ONT Entity | Healthcheck Aspect |
|---|---|
| `azalz:ManagementGroupHierarchy` | MG structure validation |
| `azalz:HubNetwork` | Hub networking config (firewall, DNS, gateway) |
| `azalz:SpokeNetwork` | Spoke peering, NSGs, route tables |
| `azalz:PolicyAssignment` | Policy compliance state |
| `azalz:RBACBinding` | Role assignment validation |
| `azalz:DiagnosticSetting` | Log routing and retention |
| `azalz:IdentityBaseline` | Identity and access baseline |

## Drift Detection

Compare live state (azure-validate) against:
1. **Design intent** (AZALZ-ONT policy definitions)
2. **IaC desired state** (Epic 33 Bicep modules)
3. **Previous healthcheck** (Supabase historical data)

Drift categories:
- **Configuration drift:** Resource config changed from desired state
- **Policy drift:** Policy assignments removed or modified
- **RBAC drift:** Role assignments changed
- **Topology drift:** Resources added/removed outside IaC

## Execution Mode

**AGENT_AUTONOMOUS** — this skill runs without human intervention for standard healthchecks. Human review required only for:
- First-run baseline establishment
- Critical drift findings (auto-escalated)

## Inputs

- Azure tenant credentials (read-only)
- AZALZ-ONT policy definitions (from ontology library)
- Previous healthcheck baseline (from Supabase, if exists)

## Outputs

- ALZ healthcheck scorecard (per domain)
- Drift findings (categorised)
- Resource topology visualisation
- Remediation tasks (linked to Epic 33 Bicep modules)
- Evidence pack (KQL results, policy exports)
