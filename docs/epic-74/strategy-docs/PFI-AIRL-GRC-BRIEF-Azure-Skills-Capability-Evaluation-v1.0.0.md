# PFI-AIRL-GRC-BRIEF: Azure Skills Capability Evaluation

**Product Code:** PFI-AIRL-GRC-BRIEF
**Version:** v1.0.0
**Date:** 2026-03-13
**Status:** Active
**Epic:** [Epic 74 (#1074)](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/1074) — PFI-AIRL-AZS · F74.1
**Author:** PFC Platform Team

---

## 1. Purpose

This briefing evaluates Microsoft's [`azure-skills`](https://github.com/microsoft/azure-skills) plugin — a packaged MCP capability layer containing 21 Azure skills, an Azure MCP Server (200+ tools), and Foundry MCP — for integration into the PFC ontology-driven assessment pipeline.

---

## 2. What Azure Skills Is

Azure Skills is a GitHub-hosted plugin that teaches coding agents (Claude Code, VS Code, GitHub Copilot CLI) how Azure work gets done. It combines:

1. **Azure Skills (21):** Decision trees, workflows, and guardrails for Azure scenarios
2. **Azure MCP Server:** 200+ structured MCP tools providing live read/write access across 40+ Azure services
3. **Foundry MCP:** Microsoft Foundry AI model discovery, deployment, and agent management

It is open-source (MIT), actively maintained by Microsoft, and designed for agent-native consumption via MCP.

---

## 3. Capability Matrix — All 21 Skills

### 3.1 Build & Deploy

| Skill | What It Does | PFC Assessment Domain | Ontology Target |
|---|---|---|---|
| `azure-prepare` | Environment readiness validation, prerequisite checks, subscription setup | CAF Readiness | NCSC-CAF-ONT |
| `azure-validate` | Architecture validation, configuration checks, best practice alignment | WAF Pillars, ALZ Health | EA-MSFT-ONT:WAFPillar, AZALZ-ONT |
| `azure-deploy` | Deployment workflows, Deployment Stacks, ARM/Bicep execution | CAF Readiness | EA-MSFT-ONT |

### 3.2 Troubleshoot & Operate

| Skill | What It Does | PFC Assessment Domain | Ontology Target |
|---|---|---|---|
| `azure-diagnostics` | Diagnostic workflows, troubleshooting decision trees, log analysis | Cyber Posture, ALZ Health | GRC-FW-ONT, MCSB-ONT |
| `azure-observability` | Monitoring coverage, alerting, Application Insights, Log Analytics | Cyber Posture, WAF (OpEx) | GRC-FW-ONT:ContinuousAssurance |
| `azure-compliance` | Azure Policy compliance state, regulatory compliance, Defender posture | ALL domains | MCSB-ONT, GRC-FW-ONT, NCSC-CAF-ONT, AZALZ-ONT |
| `appinsights-instrumentation` | Application Insights telemetry setup and validation | WAF (OpEx) | EA-MSFT-ONT |

### 3.3 Optimise & Design

| Skill | What It Does | PFC Assessment Domain | Ontology Target |
|---|---|---|---|
| `azure-cost-optimization` | Cost analysis, right-sizing recommendations, reserved instances | WAF (Cost) | EA-MSFT-ONT:WAFPillar(CostOptimization) |
| `azure-compute` | Compute selection, sizing, performance analysis | WAF (Performance) | EA-MSFT-ONT:WAFPillar(PerformanceEfficiency) |
| `azure-resource-visualizer` | Resource topology visualisation, dependency mapping | CAF, ALZ Health | EA-MSFT-ONT:AzureLandingZone |

### 3.4 Data, AI & Platform

| Skill | What It Does | PFC Assessment Domain | Ontology Target |
|---|---|---|---|
| `azure-ai` | Azure AI service assessment, cognitive services, OpenAI integration | WAF, Cyber (AI) | EA-AI-ONT, MCSB-ONT |
| `azure-aigateway` | AI Gateway configuration, rate limiting, model routing | WAF, Cyber (AI) | EA-AI-ONT |
| `azure-storage` | Storage account configuration, data protection, encryption | WAF (Security), Cyber | MCSB-ONT:DataProtection |
| `azure-kusto` | KQL query execution, Log Analytics, data exploration | Cyber, ALZ Health | GRC-FW-ONT (evidence queries) |
| `azure-messaging` | Event Hub, Service Bus, messaging patterns | WAF (Reliability) | EA-MSFT-ONT |

### 3.5 Cross-Service

| Skill | What It Does | PFC Assessment Domain | Ontology Target |
|---|---|---|---|
| `azure-rbac` | RBAC audit, role assignments, identity management | WAF (Security), Cyber, ALZ | MCSB-ONT:IdentityManagement |
| `azure-cloud-migrate` | Migration readiness, dependency analysis, TCO | CAF Readiness | NCSC-CAF-ONT |
| `azure-resource-lookup` | Resource discovery, inventory, configuration retrieval | ALZ Health | AZALZ-ONT, EA-MSFT-ONT:AzureResource |
| `azure-quotas` | Subscription quota analysis, limit monitoring | WAF (Reliability) | EA-MSFT-ONT |
| `entra-app-registration` | Entra ID app registration, service principal management | Cyber | MCSB-ONT:IdentityManagement |
| `azure-hosted-copilot-sdk` | Copilot SDK integration, custom copilot assessment | AI Assessment | EA-AI-ONT |
| `microsoft-foundry` | Foundry AI model discovery, deployments, agent workflows | AI Assessment | EA-AI-ONT |

---

## 4. Gap Analysis

### 4.1 What Azure Skills Covers That We Currently Lack

| Gap | Current State | Azure Skills Solution |
|---|---|---|
| Live Azure data extraction | Manual KQL queries (F68.8) | 200+ MCP tools with structured output |
| WAF pillar validation | EA-MSFT-ONT entities exist but no automated scoring | azure-validate provides live architecture validation |
| RBAC audit | Manual review | azure-rbac provides automated role assignment analysis |
| Compliance posture | Manual Defender for Cloud review | azure-compliance provides structured compliance state |
| Cost assessment | Manual Azure Advisor review | azure-cost-optimization provides automated analysis |
| Resource topology | Manual documentation | azure-resource-visualizer provides live topology |

### 4.2 What Azure Skills Does NOT Cover (Our Unique Value)

| Capability | Why Azure Skills Can't Do This |
|---|---|
| Cross-framework correlation (WAF ↔ CAF ↔ NCSC ↔ MCSB) | Skills are Azure-native, not framework-aware |
| Ontology-driven scoring methodology | Skills execute workflows, don't score against maturity models |
| Business value linkage (VE × RMF) | Skills are technical, not business-outcome oriented |
| Multi-tenant/multi-PFI packaging | Skills are single-context, not multi-instance aware |
| NCSC CAF cyber outcome mapping | UK-specific framework not built into Microsoft skills |
| Historical trend analysis | Skills are point-in-time, no persistence layer |
| Client-facing report generation | Skills produce structured data, not branded deliverables |

---

## 5. Integration Recommendation

### 5.1 Adopt

All 21 skills are relevant. Priority adoption order:

| Priority | Skills | Reason |
|---|---|---|
| **P1 — Immediate** | azure-validate, azure-compliance, azure-rbac, azure-resource-lookup | Core assessment data extraction for all domains |
| **P2 — WAF/ALZ** | azure-cost-optimization, azure-compute, azure-observability, azure-diagnostics | WAF pillar scoring and ALZ healthcheck |
| **P3 — CAF** | azure-prepare, azure-cloud-migrate, azure-deploy, azure-resource-visualizer | CAF readiness assessment |
| **P4 — AI/Advanced** | azure-ai, azure-aigateway, azure-kusto, azure-storage, entra-app-registration | AI workload assessment and deep security audit |
| **P5 — Specialist** | azure-messaging, azure-quotas, azure-hosted-copilot-sdk, microsoft-foundry, appinsights-instrumentation | Specialist assessments as needed |

### 5.2 Register

- Azure MCP Server → F71.3 MCP Registry as `mcp:azure:azure-mcp-server`
- Foundry MCP → F71.3 MCP Registry as `mcp:azure:foundry-mcp`
- Each skill → F63.1 Agent-Skill-Plugin-Tool Architecture Map as `vendor:microsoft:azure-skills:{skill-name}`

### 5.3 Extend

- Build ontology adapter layer: azure-skills structured output → EMC Composer input format
- Define new join patterns: JP-WAF-MCSB, JP-CAF-NCSC for cross-framework correlation
- Create assessment templates per domain that consume azure-skills output

---

## 6. Next Steps

1. **F74.1:** Complete this evaluation — validate skill output formats against sample Azure tenant
2. **F74.6:** Register Azure MCP Server in PFC MCP Registry
3. **F74.2:** Build WAF pillar assessment methodology (first assessment domain)
4. **F74.5:** Build ALZ healthcheck (highest client demand from W4M-RCS)

---

## 7. Cross-References

- [Epic 74 (#1074)](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/1074) — Parent epic
- Strategy: `PBS/STRATEGY/PFI-AIRL-GRC-STRAT-Azure-Skills-WAF-CAF-Cyber-Assessment-Strategy-v1.0.0.md`
- [Epic 33 (#505)](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/505) — Azure Landing Zone IaC
- [Epic 68 (#1005)](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/1005) — Azure-RCS Assessment Platform
- [F71.3 (#1023)](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/1023) — MCP Server Integrations
- Source: [microsoft/azure-skills](https://github.com/microsoft/azure-skills)

---

*PFI-AIRL-GRC-BRIEF: Azure Skills Capability Evaluation v1.0.0*
