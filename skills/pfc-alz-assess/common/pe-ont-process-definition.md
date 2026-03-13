# ALZ Assessment PE-ONT Process Definition

**Version:** v0.1.0 (scaffold)
**Feature:** F74.13

---

## L0: ALZ Assessment & Optimisation Service

### SIPOC

| Element | Detail |
|---|---|
| **Suppliers** | Client (Azure tenant, business context), Microsoft (azure-skills, Azure APIs), PFC (ontology stack, VE skills, PE processes) |
| **Inputs** | Azure tenant credentials, VE value goals, FDN org context, WAF/CAF benchmarks, MCSB controls |
| **Process** | L0: 5 × L1 → 18 × L2 (see below) |
| **Outputs** | Assessment reports, backcasted roadmap, risk register, SPC baselines, value realisation plan |
| **Customers** | Client CTO/CISO/Cloud Architect, AIRL engagement team, W4M-RCS commercial |

### Process Hierarchy

```text
L0: ALZ Assessment & Optimisation Service
│
├─ L1: Assessment Engagement Management
│   ├─ L2.1: Client Onboarding & Scoping           [HUMAN-LED]
│   ├─ L2.2: VE Value Discovery                    [HUMAN-LED, AGENT-ASSISTED]
│   └─ L2.3: Assessment Domain Prioritisation       [AGENT-RECOMMENDED, HUMAN-APPROVED]
│
├─ L1: Current State Measurement
│   ├─ L2.4: Tenant Discovery & Inventory           [AGENT-AUTONOMOUS]
│   ├─ L2.5: WAF Pillar Assessment                  [AGENT-AUTONOMOUS] → pfc-alz-assess-waf
│   ├─ L2.6: CAF Readiness Assessment               [AGENT-AUTONOMOUS] → pfc-alz-assess-caf
│   ├─ L2.7: Cyber Posture Assessment               [AGENT-AUTONOMOUS] → pfc-alz-assess-cyber
│   └─ L2.8: ALZ Healthcheck                        [AGENT-AUTONOMOUS] → pfc-alz-assess-health
│
├─ L1: Analysis & Gap Assessment
│   ├─ L2.9: Three-State Gap Analysis               [AGENT-AUTONOMOUS]
│   ├─ L2.10: Cross-Framework Correlation            [AGENT-AUTONOMOUS]
│   ├─ L2.11: RMF Risk Assessment & Scoring          [AGENT-RECOMMENDED, HUMAN-REVIEWED]
│   └─ L2.12: Root Cause Analysis                    [HUMAN-LED, AGENT-ASSISTED]
│
├─ L1: Roadmap & Remediation Design
│   ├─ L2.13: Backcasting Roadmap Construction       [AGENT-DRAFTED, HUMAN-REFINED]
│   ├─ L2.14: VE Cost-Benefit Quantification         [AGENT-CALCULATED, HUMAN-VALIDATED]
│   ├─ L2.15: RMF Risk Reduction Projection          [AGENT-CALCULATED]
│   └─ L2.16: Phased Delivery Plan                   [AGENT-DRAFTED, HUMAN-REFINED]
│
├─ L1: Report & Delivery
│   ├─ L2.17: Assessment Report Generation            [AGENT-AUTONOMOUS]
│   ├─ L2.18: Executive Summary & Recommendations     [AGENT-DRAFTED, HUMAN-REFINED]
│   └─ L2.19: Client Presentation & Handover          [HUMAN-LED]
│
└─ L1: Continuous Assurance
    ├─ L2.20: SPC Monitoring Setup                    [AGENT-AUTONOMOUS]
    ├─ L2.21: Recurring Compliance Checks             [AGENT-AUTONOMOUS]
    ├─ L2.22: Drift Detection & Alerting              [AGENT-AUTONOMOUS]
    └─ L2.23: Value Realisation Tracking              [AGENT-MEASURED, HUMAN-REPORTED]
```

### PE-ONT Entity Mapping

| PE-ONT Entity | Application |
|---|---|
| `pe:Process` | Each L1/L2 above |
| `pe:ProcessStep` | Individual activities within each L2 |
| `pe:Input` / `pe:Output` | Data flows between processes |
| `pe:Role` | Architect, Client Stakeholder, Agent, Reviewer |
| `pe:Metric` | Process time, coverage %, score accuracy |
| `pe:Tool` | azure-skills, EMC Composer, pfc-spc, VE skills |
| `procmap:SIPOC` | L0 SIPOC above |
| `vsm:ValueStream` | End-to-end assessment value stream |
| `vana:WasteCategory` | Rework, waiting, overprocessing in assessment |
